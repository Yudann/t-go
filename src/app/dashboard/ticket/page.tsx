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
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Ticket {
  id: string;
  user_id: string;
  route_id: string;
  start_point: string;
  end_point: string;
  passenger_count: number;
  total_fare: number;
  qr_code: string;
  status: string;
  travel_date: string;
  created_at: string;
  routes?: {
    name: string;
    route_code: string;
    color: string;
  };
}

const DashboardTicket = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: ticket.routes?.color || "#7B2CBF" }}
      />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {ticket.routes?.route_code}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {ticket.routes?.name}
            </p>
          </div>
          {ticket.status === "active" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{ticket.start_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{ticket.end_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>{ticket.passenger_count} penumpang</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              {new Date(ticket.travel_date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Harga</span>
          <span className="text-xl font-bold text-primary">
            Rp {ticket.total_fare.toLocaleString("id-ID")}
          </span>
        </div>

        {ticket.status === "active" && (
          <div className="bg-white p-4 rounded-lg flex justify-center border-2 border-dashed border-primary/30">
            <QRCodeSVG
              value={ticket.qr_code}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Kode: {ticket.qr_code}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-accent text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Tiket Saya</h1>
        <p className="text-sm opacity-90">
          Lihat tiket aktif dan riwayat perjalanan
        </p>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Tiket Aktif ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Riwayat ({usedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Belum ada tiket aktif</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pesan tiket untuk memulai perjalanan
                  </p>
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
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Belum ada riwayat perjalanan
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
};

export default DashboardTicket;
