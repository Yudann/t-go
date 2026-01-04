"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore, useAppStore, useThemeStore } from "@/lib/store";
import BookingModal from "@/components/BookingModal";
import BookingSuccess from "@/components/BookingSuccess";
import { AngkotIcon } from "@/components/AngkotIcon";
import {
  Search,
  Ticket,
  Map as MapIcon,
  Navigation,
  Bell,
  ChevronRight,
  MapPin,
  Zap,
  Star,
  QrCode,
  Train,
  Bus,
  Info,
  X,
  AlertCircle,
  Loader2,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { useUserProfile, useRoutes, useUserTickets } from "@/hooks/useQueries";
import { useWalletTransactions, useWallet, useProcessPayment } from "@/hooks/useWallet";

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  estimated_time: number;
  fare: number;
  color: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setSelectedRoute } = useAppStore();

  // Use TanStack Query hooks
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const { data: tickets = [] } = useUserTickets();
  const { data: transactions = [] } = useWalletTransactions(10);
  

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRouteForBooking, setSelectedRouteForBooking] = useState<Route | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Custom Hooks
  const { data: wallet } = useWallet();
  const processPayment = useProcessPayment();

  // UI State from Reference
  const { isDarkMode } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Angkot T-GO');

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const filteredRoutes = useMemo(() => {
    let filtered = routes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [routes, searchQuery]);

  const handleBookRoute = (route: Route) => {
    setSelectedRouteForBooking(route);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (data: any) => {
    if (!selectedRouteForBooking || !user) return;

    setBookingData(data);
    setIsBookingModalOpen(false);
    setIsProcessingPayment(true);

    const totalFare = selectedRouteForBooking.fare * data.passengerCount;

    // Check balance first
    if ((wallet?.balance || 0) < totalFare) {
      toast.error("Saldo T-GoPay tidak mencukupi. Silakan isi ulang saldo Anda.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const qrCode = `TGO-${Date.now()}-${user.id.substring(0, 8)}`;

      // 1. Process Wallet Payment
      const paymentResult = await processPayment.mutateAsync({
        amount: totalFare,
        description: `Pembayaran tiket rute ${selectedRouteForBooking.route_code}`,
        referenceType: 'ticket'
      });

      if (!paymentResult.success) {
        throw new Error("Gagal mengolah pembayaran");
      }

      // 2. Create Ticket with reference to transaction
      const { error: ticketError } = await supabase.from("tickets").insert({
        user_id: user.id,
        route_id: selectedRouteForBooking.id,
        start_point: data.startPoint,
        end_point: data.endPoint,
        passenger_count: data.passengerCount,
        total_fare: totalFare,
        qr_code: qrCode,
        status: "active",
        travel_date: data.travelDate,
      });

      if (ticketError) throw ticketError;

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Gagal melakukan pemesanan");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const loading = routesLoading || profileLoading;

  // Combine real activities with system notifications
  const activities = useMemo(() => {
    const combined = [];

    // 1. System Welcome
    combined.push({
      id: 'welcome',
      title: 'Selamat Datang di T-GO!',
      desc: `Halo ${profile?.full_name || 'User'}! Mulai perjalananmu lebih mudah dengan Angkot digital Tangerang.`,
      time: 'Sistem',
      timestamp: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
      icon: <Star className="text-yellow-500" size={20} />,
      isRead: true
    });

    // 2. System Promo
    combined.push({
      id: 'promo-1',
      title: 'Promo Spesial T-GO',
      desc: 'Diskon 50% untuk rute Karawaci hari ini. Cek tab Promo sekarang!',
      time: 'Hari ini',
      timestamp: Date.now() - 3600000,
      icon: <Zap size={20} className="text-yellow-500" />,
      isRead: false
    });

    // 3. Transactions
    transactions.forEach(tx => {
      combined.push({
        id: `tx-${tx.id}`,
        title: tx.type === 'topup' ? 'Top Up Berhasil' : 'Pembayaran Berhasil',
        desc: tx.description || (tx.type === 'topup' ? `Saldo bertambah Rp ${tx.amount.toLocaleString()}` : `Pembayaran sebesar Rp ${tx.amount.toLocaleString()}`),
        time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(tx.created_at).getTime(),
        icon: tx.type === 'topup' ? <Wallet className="text-emerald-500" size={20} /> : <Navigation className="text-[#7B2CBF]" size={20} />,
        isRead: true
      });
    });

    // 4. Tickets
    tickets.forEach(ticket => {
      combined.push({
        id: `ticket-${ticket.id}`,
        title: 'Tiket Baru Aktif',
        desc: `Tiket rute ${(ticket as any).routes?.route_code} telah berhasil dipesan.`,
        time: new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        timestamp: new Date(ticket.created_at).getTime(),
        icon: <Ticket className="text-[#7B2CBF]" size={20} />,
        isRead: true
      });
    });

    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile, transactions, tickets]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FDFDFF]'}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7B2CBF] mx-auto mb-4" />
          <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Memuat data...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User";
  const firstName = displayName.split(' ')[0];
  const lastName = displayName.split(' ').slice(1).join(' ');

  return (
    <div className={`pb-32 animate-in fade-in duration-700 transition-colors min-h-full ${isDarkMode ? 'bg-[#0F0F13]' : 'bg-[#FDFDFF]'}`}>

      {/* Background Glows */}
      <div className="absolute top-0 left-0 right-0 h-[450px] overflow-hidden pointer-events-none">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-15 ${isDarkMode ? 'bg-purple-900' : 'bg-[#7B2CBF]'}`}></div>
        <div className={`absolute top-20 -right-24 w-72 h-72 rounded-full blur-[100px] opacity-10 ${isDarkMode ? 'bg-blue-900' : 'bg-purple-200'}`}></div>
      </div>

      {/* Header Profile */}
      <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div onClick={() => router.push('/dashboard/profile')} className="cursor-pointer group">
            <div className="relative">
              <img
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`}
                alt="Profile"
                className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm transition-transform group-active:scale-90 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#FDFDFF] dark:border-[#0F0F13] rounded-full"></div>
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {firstName} <span className="text-[#7B2CBF]">{lastName}</span>
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gold Explorer • Tangerang</p>
          </div>
        </div>
        <button
          onClick={() => setShowNotifications(true)}
          className={`p-3 rounded-full transition-all active:scale-90 relative ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-400 shadow-sm border border-gray-100 hover:bg-purple-50 hover:text-purple-600'}`}
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#7B2CBF] rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>
      </div>

      <div className="relative z-10 px-6 mt-10">
        <h1 className={`text-4xl font-black tracking-tighter leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Hello <span className="text-[#7B2CBF]">{firstName}</span>,
        </h1>
        <p className={`text-lg font-medium opacity-60 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Let's do to-go!</p>
      </div>

      <div className="relative z-10 px-6 mt-8">
        <div className="flex items-center gap-3">
          <div className={`flex-1 flex items-center gap-4 p-4 rounded-[30px] shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#7B2CBF]/20 ${isDarkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className="w-11 h-11 rounded-full bg-[#7B2CBF] flex items-center justify-center text-white shadow-lg shadow-purple-900/20 shrink-0">
              <Navigation size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1">
              <input
                type="text"
                placeholder="Find a route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border-none p-0 text-sm font-black tracking-tight focus:outline-none placeholder:font-medium placeholder:text-gray-400 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
              />
              <span className="text-[10px] text-gray-400 font-bold uppercase truncate">Cimone, Poris, or Tangcity?</span>
            </div>
          </div>
          <button className={`w-15 h-15 min-w-[60px] min-h-[60px] rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90 ${isDarkMode ? 'bg-[#7B2CBF] text-white' : 'bg-black text-white'}`}>
            <QrCode size={26} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <div className="flex overflow-x-auto no-scrollbar gap-3 px-6 pb-2">
          {[
            { icon: <AngkotIcon className="w-5 h-5 text-current" />, label: 'Angkot T-GO', id: 'Angkot T-GO' },
            { icon: <Bus size={20} />, label: 'TransKota', id: 'TransKota' },
            { icon: <Train size={20} />, label: 'KRL Commuter', id: 'KRL Commuter' },
            { icon: <Navigation size={20} />, label: 'Feeder', id: 'Feeder' },
            { icon: <Star size={20} />, label: 'Favorite', id: 'Favorite' },
          ].map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-full whitespace-nowrap transition-all shadow-sm font-black text-[11px] uppercase tracking-wider ${activeCategory === cat.id
                ? 'bg-[#7B2CBF] text-white shadow-lg shadow-purple-900/20'
                : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500 border border-gray-50')
                }`}
            >
              {activeCategory === cat.id ? React.cloneElement(cat.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 text-white" }) : cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <div className="flex items-center justify-between px-7 mb-4">
          <h3 className={`text-xs font-black uppercase tracking-[2.5px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Diskon & Promo</h3>
          <button className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors">Lihat Semua</button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-5 px-6 pb-4">
          {[
            { title: 'Diskon 50%', subtitle: 'Spesial T-GO Pay', color: 'from-[#7B2CBF] to-[#9D4EDD]', icon: <Zap /> },
            { title: 'Cashback 5.000', subtitle: 'Rute Cimone - Poris', color: 'from-[#5A189A] to-[#7B2CBF]', icon: <Star /> },
            { title: 'Gratis Trip', subtitle: 'Ajak Teman Naik Angkot', color: 'from-[#3C096C] to-[#5A189A]', icon: <Ticket /> },
          ].map((promo, i) => (
            <div
              key={i}
              className={`min-w-[290px] h-38 rounded-[40px] p-7 relative overflow-hidden flex flex-col justify-center bg-gradient-to-br shadow-xl shadow-purple-900/10 transition-transform active:scale-95 cursor-pointer ${promo.color}`}
            >
              <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
                {React.cloneElement(promo.icon as React.ReactElement<any>, { size: 140, fill: "white" })}
              </div>
              <div className="relative z-10 text-white">
                <p className="text-[10px] font-black uppercase tracking-[3px] opacity-70 mb-1">Limited Offer</p>
                <h4 className="text-2xl font-black leading-tight tracking-tight">{promo.title}</h4>
                <p className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-wider">{promo.subtitle}</p>
              </div>
              <div className="absolute bottom-6 right-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#7B2CBF] rounded-full"></div>
            <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Angkot Terdekat</h3>
          </div>
          <button className={`p-2.5 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
            <Search size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Bus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-bold text-gray-500">Tidak ada rute ditemukan</p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => handleBookRoute(route)}
                className={`rounded-[32px] p-5 flex items-center justify-between border transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: route.color || '#7B2CBF' }}></div>
                <div className="flex flex-col gap-2 flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: route.color || '#7B2CBF' }}>
                      {route.route_code}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                      <MapPin size={10} className="text-gray-500" />
                      <span>{route.start_point}</span>
                    </div>
                  </div>
                  <h4 className={`font-black text-[15px] leading-tight tracking-tight transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {route.name}
                  </h4>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-4 flex-shrink-0">
                  <p className="text-base font-black text-[#7B2CBF] whitespace-nowrap">
                    Rp {route.fare.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[8px] text-emerald-500 font-black tracking-widest uppercase whitespace-nowrap">Live</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative z-10 px-6 mt-10">
        <div className={`p-6 rounded-[40px] border flex items-center gap-5 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/20' : 'bg-blue-50 border-blue-100'}`}>
          <div className="w-12 h-12 bg-blue-500 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Info size={24} />
          </div>
          <div className="flex-1">
            <p className={`text-xs font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>Info Lalu Lintas</p>
            <p className="text-[10px] text-blue-400/80 font-bold mt-1 uppercase tracking-wider">Jl. Daan Mogot arah Poris lancar jaya hari ini!</p>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className={`absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto h-[80vh] rounded-t-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-white'}`}>
            <div className={`p-6 pt-12 flex items-center justify-between border-b transition-colors border-gray-100 dark:border-gray-800 ${isDarkMode ? 'bg-[#121216]' : 'bg-white'}`}>
              <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Riwayat Aktivitas</h2>
              <button onClick={() => setShowNotifications(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {activities.length > 0 ? (
                activities.map((item) => (
                  <div key={item.id} className="flex gap-4 relative group">
                    {!item.isRead && (<div className="absolute -left-2 top-2 w-2 h-2 bg-[#7B2CBF] rounded-full ring-4 ring-[#7B2CBF]/10"></div>)}
                    <div className={`w-12 h-12 min-w-[48px] rounded-2xl flex items-center justify-center shadow-sm transition-transform group-active:scale-95 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.title}</h4>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.time}</span>
                      </div>
                      <p className={`text-[11px] font-bold leading-relaxed transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-300'}`}><Bell size={32} /></div>
                  <p className="text-gray-400 text-sm font-bold">Belum ada aktifitas sepertinya...</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t transition-colors border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-4 bg-[#7B2CBF] text-white rounded-2xl font-black text-sm uppercase tracking-[2px] shadow-lg shadow-purple-900/20 active:scale-95 transition-transform"
              >
                Tandai Sudah Dibaca
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        route={selectedRouteForBooking}
        onConfirm={handleBookingConfirm}
      />

      {isProcessingPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl scale-in-95 animate-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wallet className="text-purple-500 w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Memproses Tiket</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duduk santai, T-GoPay sedang dipotong otomatis...</p>
          </div>
        </div>
      )}

      {showSuccess && selectedRouteForBooking && bookingData && (
        <BookingSuccess
          routeCode={selectedRouteForBooking.route_code}
          stopName={bookingData.startPoint}
          onViewTicket={() => router.push("/dashboard/ticket")}
          onClose={() => {
            setShowSuccess(false);
            setSelectedRouteForBooking(null);
            setBookingData(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
