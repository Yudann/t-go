// app/dashboard/ticket/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "@/types/types";
import { Badge } from "@/components/ui/badge";

export default function DashboardTicket() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select(
          `
          *,
          routes (
            name,
            route_code,
            color
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  const activeTickets = tickets.filter((t) => t.status === "active");
  const usedTickets = tickets.filter((t) => t.status === "used");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case "used":
        return <Badge variant="secondary">Digunakan</Badge>;
      case "expired":
        return <Badge variant="destructive">Kedaluwarsa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-200">
      {/* Header dengan warna rute */}
      <div
        className="h-2"
        style={{ backgroundColor: ticket.routes?.color || "#7B2CBF" }}
      />

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-bold">
                {ticket.routes?.route_code}
              </CardTitle>
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {ticket.routes?.name}
            </p>
          </div>
          {ticket.status === "active" ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="line-clamp-1">{ticket.start_point}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Keberangkatan
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="line-clamp-1">{ticket.end_point}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Tujuan</div>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Users className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-semibold text-gray-800">
                {ticket.passenger_count}
              </div>
              <div className="text-xs text-muted-foreground">Penumpang</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-semibold text-gray-800">
                {new Date(ticket.travel_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div className="text-xs text-muted-foreground">Tanggal</div>
            </div>
          </div>
        </div>

        {/* Total Fare */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Pembayaran</span>
            <span className="text-xl font-bold">
              Rp {ticket.total_fare.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* QR Code untuk tiket aktif */}
        {ticket.status === "active" && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Scan QR Code untuk naik angkot
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-purple-300 flex justify-center">
                <QRCodeSVG
                  value={ticket.qr_code}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground break-all">
              Kode: {ticket.qr_code.substring(0, 30)}...
            </p>
          </div>
        )}

        {/* Created info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
          <span>
            Dibuat: {new Date(ticket.created_at).toLocaleDateString("id-ID")}
          </span>
          <span>
            {new Date(ticket.created_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Tiket Saya</h1>
          <p className="text-purple-100 text-sm">
            Kelola tiket aktif dan lihat riwayat perjalanan
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Aktif ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              Riwayat ({usedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeTickets.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <CardContent>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Belum ada tiket aktif
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Pesan tiket untuk memulai perjalanan
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/map")}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Pesan Tiket
                  </button>
                </CardContent>
              </Card>
            ) : (
              activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {usedTickets.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Belum ada riwayat
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Tiket yang sudah digunakan akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              usedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
