// src/components/section/map/MapFiltersModal.tsx

import React, { useState } from "react";
import { X } from "lucide-react";

interface MapFiltersModalProps {
  onClose: () => void;
}

export default function MapFiltersModal({ onClose }: MapFiltersModalProps) {
  const [selectedFilter, setSelectedFilter] = useState({
    status: "all",
    maxFare: 10000,
    maxTime: 60,
  });

  return (
    <div
      className="absolute inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-96 sm:rounded-3xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Filter Rute</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Status Rute
            </label>
            <select
              className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={selectedFilter.status}
              onChange={(e) =>
                setSelectedFilter({ ...selectedFilter, status: e.target.value })
              }
            >
              <option value="all">Semua Rute</option>
              <option value="active">Rute Aktif</option>
              <option value="popular">Rute Populer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Tarif Maksimal
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="3000"
                max="15000"
                step="1000"
                value={selectedFilter.maxFare}
                onChange={(e) =>
                  setSelectedFilter({
                    ...selectedFilter,
                    maxFare: parseInt(e.target.value),
                  })
                }
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Rp 3.000</span>
                <span className="font-bold text-purple-600">
                  Rp {selectedFilter.maxFare.toLocaleString()}
                </span>
                <span>Rp 15.000</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Waktu Tempuh Maksimal
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={selectedFilter.maxTime}
                onChange={(e) =>
                  setSelectedFilter({
                    ...selectedFilter,
                    maxTime: parseInt(e.target.value),
                  })
                }
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>15 menit</span>
                <span className="font-bold text-purple-600">
                  {selectedFilter.maxTime} menit
                </span>
                <span>90 menit</span>
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold hover:shadow-lg transition-all">
            Terapkan Filter
          </button>

          <button
            onClick={() =>
              setSelectedFilter({ status: "all", maxFare: 10000, maxTime: 60 })
            }
            className="w-full py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}
