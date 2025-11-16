// src/components/section/map/MapTopBar.tsx

import React from "react";
import { Search, ArrowLeft, SlidersHorizontal } from "lucide-react";

interface MapTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowFilters: () => void;
}

export default function MapTopBar({
  searchQuery,
  onSearchChange,
  onShowFilters,
}: MapTopBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-linear-to-b from-black/30 to-transparent p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-purple-600" />
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari rute angkot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-gray-800 placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
          />
        </div>

        <button
          onClick={onShowFilters}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-800" />
        </button>
      </div>
    </div>
  );
}
