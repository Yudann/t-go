// app/admin/tickets/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  MapPin,
  Wallet,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Ticket as TicketIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Ticket {
  id: string;
  user_id: string;
  route_id: string;
  start_point: string;
  end_point: string;
  passenger_count: number;
  total_fare: number;
  qr_code: string;
  status: "active" | "used" | "expired" | "cancelled";
  travel_date: string;
  created_at: string;
  updated_at: string;
  routes?: {
    name: string;
    route_code: string;
    color: string;
  };
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export default function TicketsManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [searchQuery, statusFilter, tickets]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          routes (
            name,
            route_code,
            color
          ),
          profiles (
            full_name,
            phone
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.profiles?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.routes?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.routes?.route_code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.qr_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Aktif</Badge>;
      case "used":
        return <Badge className="bg-blue-100 text-blue-700">Digunakan</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700">Kedaluwarsa</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-700">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "used":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (
    ticketId: string,
    newStatus: Ticket["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      // Update local state
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Gagal memperbarui status tiket");
    }
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: ticket.routes?.color || "#7B2CBF" }}
            >
              {ticket.routes?.route_code}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{ticket.routes?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(ticket.status)}
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  {ticket.passenger_count} penumpang
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ticket.status === "active" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(ticket.id, "used")}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Tandai Digunakan
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(ticket.id, "cancelled")}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                    Batalkan Tiket
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <QrCode className="w-4 h-4 mr-2" />
                Lihat QR Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Route Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium">Dari:</span>
            <span className="flex-1">{ticket.start_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-medium">Ke:</span>
            <span className="flex-1">{ticket.end_point}</span>
          </div>
        </div>

        {/* User & Payment Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-purple-600" />
              <span>{ticket.profiles?.full_name || "Tidak ada nama"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formatDate(ticket.travel_date)}</span>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 justify-end text-gray-600">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="font-semibold">
                Rp {ticket.total_fare.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(ticket.created_at)}
            </div>
          </div>
        </div>

        {/* QR Code Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <QrCode className="w-3 h-3" />
            <span className="font-mono">{ticket.qr_code}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const statusFilters = [
    { id: "all", label: "Semua Tiket", count: tickets.length },
    {
      id: "active",
      label: "Aktif",
      count: tickets.filter((t) => t.status === "active").length,
    },
    {
      id: "used",
      label: "Digunakan",
      count: tickets.filter((t) => t.status === "used").length,
    },
    {
      id: "expired",
      label: "Kedaluwarsa",
      count: tickets.filter((t) => t.status === "expired").length,
    },
    {
      id: "cancelled",
      label: "Dibatalkan",
      count: tickets.filter((t) => t.status === "cancelled").length,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Tiket</h1>
          <p className="text-gray-600 mt-1">Kelola semua tiket perjalanan</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Ekspor Laporan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-linear-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm opacity-90">Total Tiket</p>
              <p className="text-2xl font-bold">{tickets.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-linear-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm opacity-90">Aktif</p>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "active").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-linear-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm opacity-90">Digunakan</p>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "used").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-linear-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm opacity-90">Pendapatan</p>
              <p className="text-xl font-bold">
                Rp{" "}
                {tickets
                  .reduce((sum, ticket) => sum + ticket.total_fare, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari tiket berdasarkan nama, rute, atau kode QR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter Lanjutan
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={statusFilter === filter.id ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full ${
                  statusFilter === filter.id
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={`
                    text-xs ${
                      statusFilter === filter.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data tiket...</p>
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="border-dashed border-2 text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada tiket ditemukan"
                : "Belum ada tiket"}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Coba dengan pencarian atau filter lain"
                : "Tiket akan muncul di sini setelah pengguna melakukan pemesanan"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
