// src/components/section/map/MapFloatingActions.tsx

import React, { useState } from "react";
import { Locate, List, Loader2 } from "lucide-react";

export default function MapFloatingActions() {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getUserLocation = () => {
    setIsLoadingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          alert(
            "Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert("Browser Anda tidak mendukung geolocation.");
    }
  };

  return (
    <div className="absolute right-4 top-20 z-40 flex flex-col gap-3">
      <button
        onClick={getUserLocation}
        disabled={isLoadingLocation}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {isLoadingLocation ? (
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
        ) : (
          <Locate className="w-6 h-6 text-purple-600" />
        )}
      </button>

      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
      >
        <List className="w-6 h-6 text-gray-800" />
      </button>
    </div>
  );
}