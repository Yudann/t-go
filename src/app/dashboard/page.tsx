"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore, useAppStore } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import RouteCard from "@/components/RouteCard";
import BookingModal from "@/components/BookingModal";
import PaymentModal from "@/components/PaymentModal";
import {
  Bus,
  Loader2,
  MapPin,
  Search,
  Filter,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRouteForBooking, setSelectedRouteForBooking] =
    useState<Route | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRoutes();
  }, [user, router]);

  useEffect(() => {
    filterRoutes();
  }, [searchQuery, routes, activeFilter]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("route_code");

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Gagal memuat data rute");
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
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

    // Filter by category
    if (activeFilter === "popular") {
      filtered = filtered.slice(0, 3); // Show first 3 as popular
    } else if (activeFilter === "cheap") {
      filtered = filtered.sort((a, b) => a.fare - b.fare).slice(0, 4);
    }

    setFilteredRoutes(filtered);
  };

  const handleBookRoute = (route: Route) => {
    setSelectedRouteForBooking(route);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = (data: any) => {
    setBookingData(data);
    setIsBookingModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedRouteForBooking || !bookingData || !user) return;

    try {
      const qrCode = `TGO-${Date.now()}-${user.id.substring(0, 8)}`;

      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        route_id: selectedRouteForBooking.id,
        start_point: bookingData.startPoint,
        end_point: bookingData.endPoint,
        passenger_count: bookingData.passengerCount,
        total_fare: selectedRouteForBooking.fare * bookingData.passengerCount,
        qr_code: qrCode,
        status: "active",
        travel_date: bookingData.travelDate,
      });

      if (error) throw error;

      toast.success("Pembayaran berhasil! Tiket Anda sudah tersedia.");
      router.push("/dashboard/ticket");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Gagal membuat tiket");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const getUserInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-purple-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat rute perjalanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <header className="bg-linear-to-br from-purple-600 via-purple-700 to-blue-700 text-white pt-8 pb-6 px-6 shadow-2xl">
        <div className="max-w-2xl mx-auto">
          {/* User Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-3 border-white/30 shadow-lg">
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/25 text-white text-lg font-bold backdrop-blur-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1 bg-linear-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {getGreeting()}!
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Mau pergi ke mana hari ini?
                </p>
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-lg">
              <div className="text-xl font-bold text-white drop-shadow-sm">
                {routes.length}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-1">
                Rute Tersedia
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-lg">
              <div className="text-xl font-bold text-white drop-shadow-sm">
                24/7
              </div>
              <div className="text-xs text-blue-100 font-medium mt-1">
                Layanan
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-lg">
              <div className="text-xl font-bold text-white drop-shadow-sm">
                5m
              </div>
              <div className="text-xs text-blue-100 font-medium mt-1">
                Estimasi
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-white/10 to-white/5 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="Cari rute, tujuan, atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/15 backdrop-blur-md ring-0 border-none text-white placeholder-white rounded-2xl transition-all duration-200 text-base font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 z-10"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-400/20 rounded-full blur-lg"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-linear-to-r from-white to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Lihat Peta Rute
                  </h3>
                  <p className="text-sm text-gray-600">
                    Eksplorasi semua rute angkot
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/dashboard/map")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Buka Peta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "Semua Rute", icon: Bus },
            { id: "popular", label: "Populer", icon: TrendingUp },
            { id: "cheap", label: "Termurah", icon: Zap },
          ].map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full ${
                activeFilter === filter.id
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Routes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Rute Tersedia
              <Badge
                variant="secondary"
                className="ml-2 bg-purple-100 text-purple-700"
              >
                {filteredRoutes.length}
              </Badge>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          {filteredRoutes.length === 0 ? (
            <Card className="border-dashed border-2 text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Tidak ada rute ditemukan
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {searchQuery
                    ? "Coba dengan kata kunci lain"
                    : "Semua rute sedang tidak tersedia"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Tampilkan Semua Rute
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onBook={() => handleBookRoute(route)}
                  variant="dashboard"
                />
              ))}
            </div>
          )}
        </div>

        {/* Features Banner */}
        <Card className="border-0 shadow-lg bg-linear-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Perjalanan Aman & Nyaman</h3>
                <p className="text-blue-100 text-sm">
                  Driver terverifikasi dan kendaraan terawat
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        route={selectedRouteForBooking}
        onConfirm={handleBookingConfirm}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={
          selectedRouteForBooking
            ? selectedRouteForBooking.fare * (bookingData?.passengerCount || 1)
            : 0
        }
        onSuccess={handlePaymentSuccess}
      />

      <BottomNav />
    </div>
  );
};

export default Dashboard;
