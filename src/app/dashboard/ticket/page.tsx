"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { AngkotIcon } from "@/components/AngkotIcon";
import { QRCodeSVG } from "qrcode.react";
import {
  MoreVertical,
  Ticket as TicketIcon,
  ArrowLeft,
  Download,
  Share2,
  Info,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { Ticket } from "@/types/types";

// Helper to map DB status to UI status
const mapStatus = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'used': return 'Unpaid';
    case 'expired': return 'Expired';
    default: return status;
  }
};

export default function DashboardTicket() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { isDarkMode } = useThemeStore(); // Default logic

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTickets();
  }, [user, router]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          routes (
            name,
            route_code,
            color
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Helper to check if travel date has passed
      const isTravelDatePassed = (travelDateStr: string) => {
        const today = new Date();
        const travelDate = new Date(travelDateStr);

        // Compare dates only (year, month, day)
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const ticketDate = new Date(travelDate.getFullYear(), travelDate.getMonth(), travelDate.getDate());

        return ticketDate < todayDate;
      };

      // Check for expired tickets and update their status in DB
      const ticketsToUpdate: string[] = [];
      const updatedTickets = (data || []).map(ticket => {
        // If ticket is active but travel date has passed, mark for expiration
        if (ticket.status === 'active' && ticket.travel_date && isTravelDatePassed(ticket.travel_date)) {
          ticketsToUpdate.push(ticket.id);
          return { ...ticket, status: 'expired' };
        }
        return ticket;
      });

      // Update expired tickets in database (batch update)
      if (ticketsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from("tickets")
          .update({ status: 'expired' })
          .in('id', ticketsToUpdate);

        if (updateError) {
          console.error("Error updating expired tickets:", updateError);
        }
      }

      setTickets(updatedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a date is in the past (comparing dates only, not time)
  const isDatePassed = (dateString: string) => {
    const today = new Date();
    const travelDate = new Date(dateString);

    // Compare dates only (year, month, day)
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const ticketDate = new Date(travelDate.getFullYear(), travelDate.getMonth(), travelDate.getDate());

    return ticketDate < todayDate;
  };

  // Helper to get the correct display status based on travel_date
  const getDisplayStatus = (ticket: Ticket) => {
    // If travel_date exists and has passed, show as expired regardless of DB status
    if (ticket.travel_date && isDatePassed(ticket.travel_date)) {
      return 'expired';
    }
    // If ticket is marked as used, keep it as used
    if (ticket.status === 'used') {
      return 'used';
    }
    // Otherwise return DB status
    return ticket.status;
  };

  const filteredTickets = activeFilter === 'all'
    ? tickets
    : tickets.filter(t => getDisplayStatus(t) === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'used': return 'bg-blue-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleExportData = () => {
    if (tickets.length === 0) {
      toast.error("Tidak ada tiket untuk diexport");
      return;
    }

    const headers = ["Ticket ID", "Route Code", "Route Name", "Start Point", "End Point", "Travel Date", "Status", "Fare", "QR Code"];
    const rows = tickets.map(t => [
      t.id,
      t.routes?.route_code || '-',
      t.routes?.name || '-',
      t.start_point,
      t.end_point,
      new Date(t.travel_date).toLocaleString('id-ID'),
      t.status,
      t.total_fare,
      t.qr_code
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data tiket berhasil disimpan!");
  };

  const handlePrintTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FDFDFF]'}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7B2CBF] mx-auto mb-4" />
          <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Memuat tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full transition-colors duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FDFDFF]'}`}>
      <div className={`p-6 space-y-6 animate-in fade-in duration-500 pb-32`}>
        <div className="flex items-center justify-between pt-4">
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tiket Saya</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleExportData}
              className={`p-2.5 rounded-xl border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}
              title="Export Semua Data"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-6 border-b transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'active', label: 'Aktif' },
            { id: 'used', label: 'Selesai' },
            { id: 'expired', label: 'Kadaluwarsa' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`pb-3 font-black text-sm transition-all relative ${activeFilter === tab.id
                ? 'text-[#7B2CBF]'
                : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
                }`}
            >
              {tab.label}
              {activeFilter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7B2CBF] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="relative group cursor-pointer active:scale-[0.98] transition-all"
              >
                {/* Main Ticket Card */}
                <div className={`rounded-[35px] overflow-hidden border shadow-sm transition-all group-hover:shadow-lg ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-50'}`}>
                  {/* Header Strip */}
                  <div className={`${getStatusColor(getDisplayStatus(ticket))} p-5 text-white flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <AngkotIcon className="w-6 h-6" color="white" />
                      </div>
                      <div>
                        <p className="text-xs font-black tracking-tight">{ticket.routes?.name}</p>
                        <p className="text-[9px] font-bold text-white/60 tracking-[2px] uppercase">{ticket.qr_code.substring(0, 12)}...</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest uppercase">
                      {mapStatus(getDisplayStatus(ticket))}
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dari</p>
                        <p className={`text-sm font-black line-clamp-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ticket.start_point}</p>
                      </div>
                      <div className="px-4 flex items-center text-[#7B2CBF] opacity-20">
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                        <div className="w-8 border-t border-dashed border-current mx-1"></div>
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ke</p>
                        <p className={`text-sm font-black line-clamp-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ticket.end_point}</p>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-4 border-t border-dashed transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waktu</p>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-700'}`}>
                          {new Date(ticket.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
                        <p className="text-base font-black text-[#7B2CBF]">Rp {ticket.total_fare.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center text-center animate-in fade-in duration-500">
              <div className={`w-24 h-24 rounded-[40px] flex items-center justify-center mb-6 transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-800' : 'bg-purple-50 text-purple-200'}`}>
                <TicketIcon size={48} />
              </div>
              <h3 className={`text-lg font-black ${isDarkMode ? 'text-gray-600' : 'text-gray-900'}`}>Belum ada tiket</h3>
              <p className="text-sm text-gray-400 font-bold mt-2">Filter ini kosong atau kamu belum<br />memesan tiket perjalanan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Overlay */}
      {selectedTicket && (
        <div id="ticket-modal-overlay" className="fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div
            onClick={() => setSelectedTicket(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          ></div>
          <div id="ticket-modal-container" className={`absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto h-[90vh] rounded-t-[45px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden ${isDarkMode ? 'bg-[#0F0F13]' : 'bg-[#FDFDFF]'}`}>

            {/* Detail Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <button
                onClick={() => setSelectedTicket(null)}
                className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className={`text-sm font-black uppercase tracking-[3px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>E-Ticket Detail</h3>
              <div className="flex gap-2">
                <button className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div id="ticket-scroll-container" className="flex-1 overflow-y-auto no-scrollbar px-8 py-4">
              {/* Premium Ticket Visual */}
              <div id="ticket-card" className={`rounded-[45px] overflow-hidden shadow-2xl relative transition-colors ${isDarkMode ? 'bg-[#1A1A20]' : 'bg-white'}`}>
                {/* Status Indicator Bar */}
                <div className={`h-3 w-full ${getStatusColor(getDisplayStatus(selectedTicket))}`}></div>

                <div className="p-8 pb-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`} style={{ backgroundColor: selectedTicket.routes?.color || '#fbbf24' }}>
                        {selectedTicket.routes?.route_code}
                      </div>
                      <div>
                        <h4 className={`text-lg font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.routes?.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Armada T-GO Reguler</p>
                      </div>
                    </div>
                  </div>

                  {/* Path Details */}
                  <div className="space-y-6 mb-10">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-3 h-3 rounded-full border-2 border-[#7B2CBF] bg-white"></div>
                        <div className="flex-1 w-[2px] bg-dashed border-l-2 border-dashed border-gray-200 dark:border-gray-800 my-1"></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titik Jemput</p>
                        <p className={`text-base font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedTicket.start_point}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Tangerang, Banten</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-3 h-3 rounded-full bg-[#7B2CBF]"></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tujuan Akhir</p>
                        <p className={`text-base font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedTicket.end_point}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Tangerang, Banten</p>
                      </div>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className={`grid grid-cols-2 gap-6 p-6 rounded-[35px] transition-colors ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
                    <div className="flex gap-3">
                      <Calendar size={16} className="text-[#7B2CBF] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tanggal</p>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {new Date(selectedTicket.travel_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock size={16} className="text-[#7B2CBF] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waktu</p>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {new Date(selectedTicket.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CreditCard size={16} className="text-[#7B2CBF] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Metode</p>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>T-GO Pay</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Info size={16} className="text-[#7B2CBF] mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tarif</p>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Rp {selectedTicket.total_fare.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tear-off Line with Circles */}
                <div className="relative h-1">
                  <div className={`absolute -left-5 -top-3 w-10 h-10 rounded-full transition-colors ${isDarkMode ? 'bg-[#0F0F13]' : 'bg-[#FDFDFF]'}`}></div>
                  <div className={`absolute -right-5 -top-3 w-10 h-10 rounded-full transition-colors ${isDarkMode ? 'bg-[#0F0F13]' : 'bg-[#FDFDFF]'}`}></div>
                  <div className="mx-8 border-t-2 border-dashed border-gray-100 dark:border-gray-800"></div>
                </div>

                {/* QR Code Section */}
                <div className="p-8 pt-12 flex flex-col items-center text-center">
                  <p className={`text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-6`}>Scan to Board</p>
                  <div className={`p-6 rounded-[40px] shadow-inner transition-colors ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'}`}>
                    <div className={`p-4 bg-white rounded-[30px] shadow-sm`}>
                      <QRCodeSVG
                        value={selectedTicket.qr_code}
                        size={160}
                        level="H"
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                      />
                    </div>
                  </div>
                  <p className={`text-[9px] font-bold text-gray-400 mt-6 tracking-widest uppercase`}>Tunjukkan kode QR kepada driver saat naik armada.</p>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="mt-8 mb-10 space-y-4">
                <button 
                  onClick={handlePrintTicket}
                  className="w-full py-5 bg-[#7B2CBF] text-white rounded-[30px] font-black flex items-center justify-center gap-3 shadow-xl shadow-purple-900/20 active:scale-95 transition-all uppercase text-xs tracking-[2px]"
                >
                  <Download size={18} />
                  Simpan E-Ticket (PDF)
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className={`w-full py-5 rounded-[30px] font-black text-xs uppercase tracking-[2px] transition-all ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
