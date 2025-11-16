// src/components/section/map/MapBottomInfo.tsx

import React from "react";
import { Bus, ChevronRight } from "lucide-react";

interface MapBottomInfoProps {
  routeCount: number;
}

export default function MapBottomInfo({ routeCount }: MapBottomInfoProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-40">
      <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Tersedia di peta
            </p>
            <p className="text-lg font-black text-gray-800">
              {routeCount} Rute Angkot
            </p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-purple-600" />
      </div>
    </div>
  );
}
