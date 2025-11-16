// app/admin/routes/components/EditRouteModal.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Clock, Wallet } from "lucide-react";
import { Route } from "@/types/types";

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  onSuccess: () => void;
}

const defaultColors = [
  "#7B2CBF",
  "#9D4EDD",
  "#C77DFF",
  "#5A189A",
  "#3C096C",
  "#0369A1",
  "#0EA5E9",
  "#38BDF8",
  "#1E40AF",
  "#1D4ED8",
  "#059669",
  "#10B981",
  "#34D399",
  "#047857",
  "#065F46",
  "#DC2626",
  "#EF4444",
  "#F87171",
  "#B91C1C",
  "#991B1B",
  "#EA580C",
  "#F97316",
  "#FB923C",
  "#C2410C",
  "#9A3412",
];

export default function EditRouteModal({
  isOpen,
  onClose,
  route,
  onSuccess,
}: EditRouteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    route_code: "",
    start_point: "",
    end_point: "",
    estimated_time: 30,
    fare: 5000,
    color: "#7B2CBF",
    description: "",
  });

  // Reset form when route changes
  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || "",
        route_code: route.route_code || "",
        start_point: route.start_point || "",
        end_point: route.end_point || "",
        estimated_time: route.estimated_time || 30,
        fare: route.fare || 5000,
        color: route.color || "#7B2CBF",
        description: "",
      });
    }
  }, [route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!route) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("routes")
        .update({
          name: formData.name,
          route_code: formData.route_code,
          start_point: formData.start_point,
          end_point: formData.end_point,
          estimated_time: formData.estimated_time,
          fare: formData.fare,
          color: formData.color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", route.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Error updating route:", error);
      alert("Gagal memperbarui rute");
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

  if (!route) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-3 h-6 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            Edit Rute {route.route_code}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: formData.color }}
              >
                {formData.route_code}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{formData.name}</h3>
                <p className="text-sm text-gray-600">Pratinjau rute</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-medium">Dari:</span>
                <span className="flex-1">{formData.start_point}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-medium">Ke:</span>
                <span className="flex-1">{formData.end_point}</span>
              </div>
              <div className="flex gap-4 text-gray-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{formData.estimated_time} menit</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span>Rp {formData.fare.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit_route_code"
                className="flex items-center gap-1"
              >
                Kode Rute *<span className="text-xs text-gray-500">(unik)</span>
              </Label>
              <Input
                id="edit_route_code"
                value={formData.route_code}
                onChange={(e) =>
                  handleChange("route_code", e.target.value.toUpperCase())
                }
                placeholder="T01"
                required
                className="font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_estimated_time">Waktu Perjalanan *</Label>
              <div className="relative">
                <Input
                  id="edit_estimated_time"
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) =>
                    handleChange("estimated_time", parseInt(e.target.value))
                  }
                  min="1"
                  max="180"
                  required
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  menit
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_name">Nama Rute *</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Poris Plawad - Cyberpark Karawaci"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_start_point">Titik Keberangkatan *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
              <Input
                id="edit_start_point"
                value={formData.start_point}
                onChange={(e) => handleChange("start_point", e.target.value)}
                placeholder="Halte Terminal Poris Plawad"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_end_point">Titik Tujuan *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-4 h-4" />
              <Input
                id="edit_end_point"
                value={formData.end_point}
                onChange={(e) => handleChange("end_point", e.target.value)}
                placeholder="Halte Cyberpark Karawaci"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_fare">Tarif *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <Input
                  id="edit_fare"
                  type="number"
                  value={formData.fare}
                  onChange={(e) =>
                    handleChange("fare", parseInt(e.target.value))
                  }
                  min="1000"
                  step="500"
                  required
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Minimal Rp 1.000</p>
            </div>

            <div className="space-y-2">
              <Label>Warna Rute</Label>
              <div className="flex gap-1.5 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange("color", color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      formData.color === color
                        ? "border-gray-800 scale-110 ring-2 ring-offset-1 ring-gray-300"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Deskripsi Tambahan</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tambahkan deskripsi tentang rute ini (opsional)"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
