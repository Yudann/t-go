// app/dashboard/map/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { Calendar, Loader2, MapPin, Ticket, Users } from "lucide-react";
import MapContainer from "@/components/section/map/MapContainer";
import MapTopBar from "@/components/section/map/MapTopBar";
import MapFloatingActions from "@/components/section/map/MapFloatingActions";
import MapBottomInfo from "@/components/section/map/MapBottomInfo";
import MapBottomSheet from "@/components/section/map/MapBottomSheet";
import MapFiltersModal from "@/components/section/map/MapFiltersModal";
import { toast } from "sonner";
import { Route, RouteStop } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookingData {
  route: Route;
  passengerCount: number;
  travelDate: string;
}

export default function MapPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingData | null>(
    null
  );

  // GANTI handler handleBookTicketWithConfirmation dengan ini:
  const handleBookTicketWithConfirmation = (bookingData: BookingData) => {
    // Simpan data booking sementara dan tampilkan modal
    setPendingBooking(bookingData);
    setShowBookingModal(true);
  };

  // BUAT handler baru untuk konfirmasi akhir:
  const handleConfirmBookingFinal = async () => {
    if (!pendingBooking) return;

    setShowBookingModal(false);
    await handleBookTicket(pendingBooking);
    setPendingBooking(null);
  };

  // BUAT handler untuk cancel booking:
  const handleCancelBooking = () => {
    setShowBookingModal(false);
    setPendingBooking(null);
    toast.info("Pemesanan dibatalkan");
  };
  // Prevent body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRoutesData();
  }, [user, router]);

  const fetchRoutesData = async () => {
    try {
      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("*")
        .order("route_code");

      if (routesError) throw routesError;
      console.log(routesData);

      // Fetch route stops
      const { data: stopsData, error: stopsError } = await supabase
        .from("route_stops")
        .select("*")
        .order("route_id, stop_order");

      if (stopsError) throw stopsError;

      setRoutes(routesData || []);
      setRouteStops(stopsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data rute");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setTimeout(() => {
      setSelectedRoute(null);
      setIsExpanded(false);
    }, 300);
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setShowBottomSheet(true);
    setIsExpanded(false);
  };

  // Handler untuk book ticket yang terintegrasi dengan sistem ticket
  const handleBookTicket = async (bookingData: BookingData) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    setProcessingBooking(true);

    try {
      // Generate QR code data (initial)
      const qrCodeData = JSON.stringify({
        ticket_id: `TKT-${Date.now()}`,
        route_id: bookingData.route.id,
        user_id: user.id,
        travel_date: bookingData.travelDate,
        passenger_count: bookingData.passengerCount,
        timestamp: new Date().toISOString(),
      });

      // Insert ticket ke database dengan status pending
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            user_id: user.id,
            route_id: bookingData.route.id,
            start_point: bookingData.route.start_point,
            end_point: bookingData.route.end_point,
            passenger_count: bookingData.passengerCount,
            total_fare: bookingData.route.fare * bookingData.passengerCount,
            qr_code: qrCodeData,
            status: "pending", // Status pending sebelum bayar
            payment_status: "pending", // Payment status pending
            travel_date: bookingData.travelDate,
          },
        ])
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
        .single();

      if (ticketError) throw ticketError;

      console.log("Ticket created (pending):", ticketData);

      // Redirect ke halaman pembayaran
      const params = new URLSearchParams({
        ticketId: ticketData.id,
        routeName: bookingData.route.name,
        totalFare: (bookingData.route.fare * bookingData.passengerCount).toString(),
        passengerCount: bookingData.passengerCount.toString(),
        startPoint: bookingData.route.start_point,
        endPoint: bookingData.route.end_point,
        travelDate: bookingData.travelDate,
      });

      router.push(`/dashboard/payment?${params.toString()}`);

      // Tutup bottom sheet
      handleCloseBottomSheet();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Gagal memproses pemesanan", {
        description: "Silakan coba lagi beberapa saat",
      });
    } finally {
      setProcessingBooking(false);
    }
  };

  // Handler dengan konfirmasi sebelum membuat ticket
  // const handleBookTicketWithConfirmation = async (bookingData: BookingData) => {
  //   const totalFare = bookingData.route.fare * bookingData.passengerCount;

  //   const confirmed = window.confirm(
  //     `Konfirmasi Pemesanan Tiket:\n\n` +
  //       `📍 Rute: ${bookingData.route.name}\n` +
  //       `🔄 Kode: ${bookingData.route.route_code}\n` +
  //       `👥 Penumpang: ${bookingData.passengerCount} orang\n` +
  //       `📅 Tanggal: ${new Date(bookingData.travelDate).toLocaleDateString(
  //         "id-ID"
  //       )}\n` +
  //       `💳 Total: Rp ${totalFare.toLocaleString("id-ID")}\n\n` +
  //       `Lanjutkan pemesanan?`
  //   );

  //   if (confirmed) {
  //     await handleBookTicket(bookingData);
  //   }
  // };

  // Filter routes based on search query
  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 h-screen w-full flex items-center justify-center bg-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 font-semibold">Memuat peta rute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden bg-gray-100">
      <MapContainer
        routes={filteredRoutes}
        routeStops={routeStops}
        selectedRoute={selectedRoute}
        onRouteSelect={handleRouteSelect}
      />

      <MapTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShowFilters={() => setShowFilters(true)}
      />

      <MapFloatingActions />

      {!showBottomSheet && <MapBottomInfo routeCount={routes.length} />}

      {showBottomSheet && selectedRoute && (
        <MapBottomSheet
          route={selectedRoute}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onClose={handleCloseBottomSheet}
          onBookTicket={handleBookTicketWithConfirmation}
          processing={processingBooking}
        />
      )}

      {showFilters && <MapFiltersModal onClose={() => setShowFilters(false)} />}
      {/* Booking Confirmation Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              Konfirmasi Pemesanan Tiket
            </DialogTitle>
            <DialogDescription>
              Pastikan data pemesanan sudah benar sebelum melanjutkan
            </DialogDescription>
          </DialogHeader>

          {pendingBooking && (
            <div className="space-y-4 py-4">
              {/* Route Info */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div
                  className="w-3 h-8 rounded-full"
                  style={{
                    backgroundColor: pendingBooking.route.color || "#7B2CBF",
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {pendingBooking.route.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {pendingBooking.route.route_code}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Penumpang</span>
                  </div>
                  <p className="text-gray-800">
                    {pendingBooking.passengerCount} orang
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Tanggal</span>
                  </div>
                  <p className="text-gray-800">
                    {new Date(pendingBooking.travelDate).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>

              {/* Route Points */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Dari:</span>
                  <span className="font-medium text-gray-800">
                    {pendingBooking.route.start_point}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span className="text-gray-600">Ke:</span>
                  <span className="font-medium text-gray-800">
                    {pendingBooking.route.end_point}
                  </span>
                </div>
              </div>

              {/* Total Fare */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    Total Pembayaran
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    Rp{" "}
                    {(
                      pendingBooking.route.fare * pendingBooking.passengerCount
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelBooking}
              disabled={processingBooking}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmBookingFinal}
              disabled={processingBooking}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {processingBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Konfirmasi Pesan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Loading Overlay untuk Processing Booking */}
      {processingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-gray-800 font-semibold">Memproses tiket...</p>
          </div>
        </div>
      )}
    </div>
  );
}
