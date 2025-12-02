// src/components/section/map/MapBottomSheet.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  MapPin,
  Clock,
  Wallet,
  Navigation,
  Ticket,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Route } from "@/types/types";

interface MapBottomSheetProps {
  route: Route;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onBookTicket?: (bookingData: {
    route: Route;
    passengerCount: number;
    travelDate: string;
  }) => void;
  processing?: boolean;
}

// Animation variants
const sheetVariants = {
  collapsed: {
    y: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
  expanded: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Stat items for quick stats section
const statItems = [
  {
    icon: Wallet,
    text: (route: Route) => `Rp ${route.fare.toLocaleString()}`,
    label: "Tarif",
  },
  {
    icon: Clock,
    text: (route: Route) => `${route.estimated_time} mnt`,
    label: "Waktu",
  },
  {
    icon: Navigation,
    text: () => "Aktif",
    label: "Status",
  },
];

// Additional info items
const additionalInfoItems = [
  { label: "Waktu Operasional", value: "05:00 - 22:00" },
  { label: "Frekuensi", value: "5-10 menit" },
  { label: "Kapasitas", value: "12 penumpang" },
];

export default function MapBottomSheet({
  route,
  isExpanded,
  onToggleExpand,
  onClose,
  onBookTicket,
  processing = false,
}: MapBottomSheetProps) {
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleBookingClick = () => {
    console.log("Booking button clicked");
    setShowBookingForm(true);
    if (!isExpanded) {
      onToggleExpand();
    }
  };

  const handleConfirmBooking = () => {
    console.log("Confirm booking clicked", {
      route: route.name,
      passengerCount,
      travelDate,
      totalFare: route.fare * passengerCount,
    });

    if (onBookTicket) {
      onBookTicket({
        route,
        passengerCount,
        travelDate,
      });
    } else {
      console.warn("onBookTicket prop is not provided");
      alert(
        `Booking untuk ${route.name} dengan ${passengerCount} penumpang pada ${travelDate} berhasil!`
      );
    }
  };

  const handleCancelBooking = () => {
    setShowBookingForm(false);
  };

  const handlePassengerDecrement = () => {
    setPassengerCount(Math.max(1, passengerCount - 1));
  };

  const handlePassengerIncrement = () => {
    setPassengerCount(Math.min(5, passengerCount + 1));
  };

  const totalFare = route.fare * passengerCount;

  return (
    <AnimatePresence>
      <motion.div
        initial="collapsed"
        animate="expanded"
        exit="collapsed"
        variants={sheetVariants}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col ${
          isExpanded ? "h-[85vh]" : "h-auto max-h-[60vh]"
        }`}
      >
        {/* Header Section */}
        <div className="shrink-0">
          {/* Drag Handle */}
          <motion.div
            className="flex justify-center pt-3 pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={onToggleExpand}
              className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-grab active:cursor-grabbing"
            />
          </motion.div>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <X className="w-4 h-4 text-gray-800" />
          </motion.button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <motion.div
            className="px-6 pb-16"
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Route Header */}
            <RouteHeader route={route} />

            {/* Quick Stats */}
            <QuickStats route={route} />

            {/* Route Points */}
            <RoutePoints route={route} />

            {/* Booking Form */}
            <AnimatePresence>
              {isExpanded && showBookingForm && (
                <BookingForm
                  passengerCount={passengerCount}
                  travelDate={travelDate}
                  totalFare={totalFare}
                  onPassengerDecrement={handlePassengerDecrement}
                  onPassengerIncrement={handlePassengerIncrement}
                  onTravelDateChange={setTravelDate}
                  onConfirmBooking={handleConfirmBooking}
                  onCancelBooking={handleCancelBooking}
                  processing={processing}
                />
              )}
            </AnimatePresence>

            {/* Additional Info */}
            <AnimatePresence>
              {isExpanded && !showBookingForm && <AdditionalInfo />}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Action Buttons */}
        {!showBookingForm && (
          <ActionButtons
            isExpanded={isExpanded}
            onBookingClick={handleBookingClick}
            onToggleExpand={onToggleExpand}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Sub-components
function RouteHeader({ route }: { route: Route }) {
  return (
    <>
      <motion.div
        className="inline-block px-4 py-2 rounded-full mb-4"
        style={{ backgroundColor: `${route.color || '#7B2CBF'}20` }}
        variants={itemVariants}
      >
        <span className="text-sm font-bold" style={{ color: route.color || '#7B2CBF' }}>
          {route.route_code}
        </span>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-black text-gray-800 mb-1 line-clamp-2">
          {route.name}
        </h2>
      </motion.div>
    </>
  );
}

function QuickStats({ route }: { route: Route }) {
  return (
    <motion.div
      className="grid grid-cols-3 gap-2 mb-4 mt-4"
      variants={staggerVariants}
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="text-center p-3 bg-purple-50 rounded-lg"
          whileHover={{
            backgroundColor: "rgba(147, 51, 234, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <stat.icon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-gray-800">{stat.text(route)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function RoutePoints({ route }: { route: Route }) {
  return (
    <>
      <RoutePoint
        type="start"
        label="Titik Awal"
        point={route.start_point}
        iconColor="bg-green-500"
        bgColor="bg-green-50"
        textColor="text-green-700"
        hoverColor="rgba(34, 197, 94, 0.1)"
      />

      <RoutePoint
        type="end"
        label="Titik Akhir"
        point={route.end_point}
        iconColor="bg-red-500"
        bgColor="bg-red-50"
        textColor="text-red-700"
        hoverColor="rgba(239, 68, 68, 0.1)"
      />
    </>
  );
}

function RoutePoint({
  type,
  label,
  point,
  iconColor,
  bgColor,
  textColor,
  hoverColor,
}: {
  type: "start" | "end";
  label: string;
  point: string;
  iconColor: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}) {
  return (
    <motion.div
      className={`flex items-start gap-3 mb-3 p-3 ${bgColor} rounded-xl`}
      variants={itemVariants}
      whileHover={{
        backgroundColor: hoverColor,
      }}
    >
      <div
        className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center shrink-0`}
      >
        <MapPin className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className={`text-xs ${textColor} font-semibold mb-1`}>{label}</p>
        <p className="text-sm text-gray-800 font-medium line-clamp-2">
          {point}
        </p>
      </div>
    </motion.div>
  );
}

function BookingForm({
  passengerCount,
  travelDate,
  totalFare,
  onPassengerDecrement,
  onPassengerIncrement,
  onTravelDateChange,
  onConfirmBooking,
  onCancelBooking,
  processing = false,
}: {
  passengerCount: number;
  travelDate: string;
  totalFare: number;
  onPassengerDecrement: () => void;
  onPassengerIncrement: () => void;
  onTravelDateChange: (date: string) => void;
  onConfirmBooking: () => void;
  onCancelBooking: () => void;
  processing?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeInVariants}
      className="mt-4 p-4 bg-purple-50 rounded-xl space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3">Detail Pemesanan</h3>

      {/* Passenger Count */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Jumlah Penumpang
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={onPassengerDecrement}
            disabled={processing}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="flex-1 text-center text-lg font-bold text-gray-800">
            {passengerCount}
          </span>
          <button
            onClick={onPassengerIncrement}
            disabled={processing}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Travel Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Tanggal Perjalanan
        </label>
        <input
          type="date"
          value={travelDate}
          onChange={(e) => onTravelDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          disabled={processing}
          className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Total Fare */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-purple-200">
        <span className="text-sm font-semibold text-gray-700">
          Total Pembayaran
        </span>
        <span className="text-xl font-black text-purple-600">
          Rp {totalFare.toLocaleString()}
        </span>
      </div>

      {/* Confirm Button - HANYA SATU BUTTON */}
      <motion.button
        onClick={onConfirmBooking}
        disabled={processing}
        className={`w-full py-4 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
          processing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        whileHover={
          !processing
            ? {
                boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)",
              }
            : {}
        }
        whileTap={!processing ? { scale: 0.98 } : {}}
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Ticket className="w-5 h-5" />
        )}
        <span>{processing ? "Memproses..." : "Lanjutkan ke Pembayaran"}</span>
      </motion.button>

      {/* Cancel Button */}
      <button
        onClick={onCancelBooking}
        disabled={processing}
        className={`w-full py-3 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${
          processing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Batal
      </button>
    </motion.div>
  );
}

function AdditionalInfo() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeInVariants}
      className="mt-4 pt-4 border-t border-gray-200"
    >
      <motion.h3
        className="text-lg font-bold text-gray-800 mb-3"
        variants={itemVariants}
      >
        Informasi Tambahan
      </motion.h3>

      <motion.div className="space-y-3" variants={staggerVariants}>
        {additionalInfoItems.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50"
            whileHover={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            }}
          >
            <span className="text-sm font-medium text-gray-700">
              {item.label}
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {item.value}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-4 p-4 bg-purple-50 rounded-xl"
        variants={itemVariants}
      >
        <p className="text-xs text-purple-700 font-semibold mb-2">
          💡 Tips Perjalanan
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Siapkan uang pas untuk mempercepat transaksi. Angkot ini melayani rute
          pulang-pergi dengan pemberhentian di setiap halte yang ditentukan.
        </p>
      </motion.div>
    </motion.div>
  );
}

function ActionButtons({
  isExpanded,
  onBookingClick,
  onToggleExpand,
}: {
  isExpanded: boolean;
  onBookingClick: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <motion.div
      className="shrink-0 border-t border-gray-100 bg-white p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex gap-3 mb-3">
        <motion.button
          onClick={onBookingClick}
          className="flex-1 py-3 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
          whileHover={{
            boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Ticket className="w-4 h-4" />
          <span>Pesan Tiket</span>
        </motion.button>
      </div>

      {/* Expand/Collapse Button */}
      <motion.button
        onClick={onToggleExpand}
        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.1)" }}
        whileTap={{ scale: 0.95 }}
      >
        <span>{isExpanded ? "Tutup" : "Lihat Selengkapnya"}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
