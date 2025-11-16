// app/admin/routes/components/AddRouteModal.tsx

"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
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
];

export default function AddRouteModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRouteModalProps) {
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
    } catch (error) {
      console.error("Error adding route:", error);
      alert("Gagal menambahkan rute");
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Tambah Rute Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route_code">Kode Rute *</Label>
              <Input
                id="route_code"
                value={formData.route_code}
                onChange={(e) => handleChange("route_code", e.target.value)}
                placeholder="T01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_time">Waktu (menit) *</Label>
              <Input
                id="estimated_time"
                type="number"
                value={formData.estimated_time}
                onChange={(e) =>
                  handleChange("estimated_time", parseInt(e.target.value))
                }
                min="1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Rute *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Poris Plawad - Cyberpark Karawaci"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_point">Titik Awal *</Label>
            <Input
              id="start_point"
              value={formData.start_point}
              onChange={(e) => handleChange("start_point", e.target.value)}
              placeholder="Halte Terminal Poris Plawad"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_point">Titik Akhir *</Label>
            <Input
              id="end_point"
              value={formData.end_point}
              onChange={(e) => handleChange("end_point", e.target.value)}
              placeholder="Halte Cyberpark Karawaci"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fare">Tarif (Rp) *</Label>
              <Input
                id="fare"
                type="number"
                value={formData.fare}
                onChange={(e) => handleChange("fare", parseInt(e.target.value))}
                min="1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Warna Rute</Label>
              <div className="flex gap-2 flex-wrap">
                {defaultColors.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange("color", color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-gray-800"
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
              className="flex-1"
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
