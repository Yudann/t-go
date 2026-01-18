// app/admin/routes/components/AddRouteModal.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useThemeStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultColors = [
  "#7B2CBF", // Purple
  "#0284C7", // Blue
  "#F97316", // Orange
];

export default function AddRouteModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRouteModalProps) {
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    route_code: "",
    start_point: "",
    end_point: "",
    estimated_time: 30,
    fare: 5000,
    color: "#7B2CBF",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("routes").insert([formData]);

      if (error) throw error;

      onSuccess();
      // Reset form
      setFormData({
        name: "",
        route_code: "",
        start_point: "",
        end_point: "",
        estimated_time: 30,
        fare: 5000,
        color: "#7B2CBF",
      });
    } catch (error: any) {
      console.error("Error adding route:", error);
      toast.error(error.message || "Gagal menambahkan rute");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputClasses = isDarkMode 
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500" 
    : "focus:ring-purple-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-white' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            Tambah Rute Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route_code" className={isDarkMode ? 'text-gray-300' : ''}>Kode Rute *</Label>
              <Input
                id="route_code"
                value={formData.route_code}
                onChange={(e) => handleChange("route_code", e.target.value.toUpperCase())}
                placeholder="T01"
                required
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_time" className={isDarkMode ? 'text-gray-300' : ''}>Waktu (menit) *</Label>
              <Input
                id="estimated_time"
                type="number"
                value={formData.estimated_time}
                onChange={(e) =>
                  handleChange("estimated_time", parseInt(e.target.value))
                }
                min="1"
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className={isDarkMode ? 'text-gray-300' : ''}>Nama Rute *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Poris Plawad - Cyberpark Karawaci"
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_point" className={isDarkMode ? 'text-gray-300' : ''}>Titik Awal *</Label>
            <Input
              id="start_point"
              value={formData.start_point}
              onChange={(e) => handleChange("start_point", e.target.value)}
              placeholder="Halte Terminal Poris Plawad"
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_point" className={isDarkMode ? 'text-gray-300' : ''}>Titik Akhir *</Label>
            <Input
              id="end_point"
              value={formData.end_point}
              onChange={(e) => handleChange("end_point", e.target.value)}
              placeholder="Halte Cyberpark Karawaci"
              required
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fare" className={isDarkMode ? 'text-gray-300' : ''}>Tarif (Rp) *</Label>
              <Input
                id="fare"
                type="number"
                value={formData.fare}
                onChange={(e) => handleChange("fare", parseInt(e.target.value))}
                min="1000"
                required
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : ''}>Warna Rute</Label>
              <div className="flex gap-3 p-1">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange("color", color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color
                        ? (isDarkMode ? "border-white ring-2 ring-purple-500 ring-offset-2 ring-offset-[#1A1A20]" : "border-gray-800 ring-2 ring-purple-500 ring-offset-2")
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300' : ''}`}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menambahkan...
                </>
              ) : (
                "Tambah Rute"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
