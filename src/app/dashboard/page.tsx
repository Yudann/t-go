"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore, useAppStore } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import RouteCard from "@/components/RouteCard";
import BookingModal from "@/components/BookingModal";
import PaymentModal from "@/components/PaymentModal";
import { Bus, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [selectedRouteForBooking, setSelectedRouteForBooking] =
    useState<Route | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRoutes();
  }, [user, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-linear-to-r from-primary to-accent text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">T-Go</h1>
            <p className="text-sm opacity-90">Angkot Tangerang</p>
          </div>
        </div>
        <p className="text-sm opacity-90">
          Selamat datang! Pilih rute perjalanan Anda.
        </p>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onBook={() => handleBookRoute(route)}
          />
        ))}
      </main>

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
