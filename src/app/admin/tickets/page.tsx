// app/admin/tickets/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Ticket as TicketIcon, Search, Filter, CheckCircle, XCircle, Clock, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useThemeStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode } = useThemeStore();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Try RPC first
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_admin_tickets');
      
      if (!rpcError && rpcData) {
         setTickets(rpcData);
      } else {
         console.warn("RPC get_admin_tickets failed, falling back. Error details:", rpcError);
         // Fallback basic fetch
         const { data, error } = await supabase
            .from("tickets")
            .select("*")
            .order("created_at", { ascending: false });

         if (error) throw error;
         setTickets(data || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    (ticket.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.qr_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.user_email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Aktif</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 border-0">Selesai</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-0">Batal</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Pending</Badge>;
    }
  };

  const handleExport = () => {
    if (tickets.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    
    // Define CSV headers
    const headers = ["Ticket ID", "QR Code", "User Email", "Route", "Start Point", "End Point", "Status", "Price", "Date"];
    
    // Map data to CSV rows
    const rows = tickets.map(ticket => [
      ticket.id,
      ticket.qr_code,
      ticket.user_email || "N/A",
      ticket.route_name || "N/A",
      ticket.start_point,
      ticket.end_point,
      ticket.status,
      ticket.total_fare,
      new Date(ticket.created_at).toLocaleString('id-ID').replace(/,/g, ' ') // Remove commas to prevent CSV breakage
    ]);
    
    // Join headers and rows
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tgo_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data tiket berhasil diexport!");
  };

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Manajemen Tiket</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Pantau dan validasi tiket perjalanan pengguna.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className={`gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white'}`}>
             <Download className="w-4 h-4" />
             Export CSV
        </Button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                placeholder="Cari Kode QR, Status, atau User..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-10 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200'}`}
                />
            </div>
             <Button variant="outline" className={`gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white'}`}>
                <Filter className="w-4 h-4" />
                Filter Status
            </Button>
        </div>

        <Table>
          <TableHeader className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
            <TableRow className={isDarkMode ? 'border-gray-800 hover:bg-transparent' : 'border-gray-100 hover:bg-transparent'}>
              <TableHead>ID Tiket / QR</TableHead>
              <TableHead>Penumpang</TableHead>
              <TableHead>Rute & Tujuan</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Harga</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                 <TableCell colSpan={6} className="text-center py-12">
                   <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                   <p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-wider">Memuat tiket...</p>
                 </TableCell>
              </TableRow>
            ) : paginatedTickets.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                   Tidak ada tiket ditemukan.
                 </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className={isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50'}>
                  <TableCell>
                    <div className={`font-mono text-[10px] font-black px-2 py-1 rounded-lg inline-block tracking-tighter ${
                      isDarkMode 
                        ? 'bg-gray-800/50 text-gray-400 border border-gray-700' 
                        : 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                    }`}>
                        {ticket.qr_code || ticket.id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {ticket.user_email || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className={`font-bold text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{ticket.route_name || 'Rute'}</span>
                        <span className="text-[10px] text-gray-500">{ticket.start_point} → {ticket.end_point}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-right font-bold text-purple-600 dark:text-purple-400">
                    Rp {Number(ticket.total_fare).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
             <p className="text-xs text-gray-500 font-medium">
                {filteredTickets.length > 0 ? (
                    <>
                        {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filteredTickets.length)} dari {filteredTickets.length}
                    </>
                ) : '0 data'}
             </p>
             <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Prev
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-xs ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
             </div>
        </div>
      </div>
    </div>
  );
}
