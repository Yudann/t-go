"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, Calendar } from "lucide-react";

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  fare: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  onConfirm: (data: {
    startPoint: string;
    endPoint: string;
    passengerCount: number;
    travelDate: string;
  }) => void;
}

const BookingModal = ({ isOpen, onClose, route, onConfirm }: BookingModalProps) => {
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);

  const handleConfirm = () => {
    if (!startPoint || !endPoint) {
      alert("Mohon isi titik awal dan tujuan");
      return;
    }
    
    onConfirm({
      startPoint,
      endPoint,
      passengerCount,
      travelDate,
    });
    
    // Reset form
    setStartPoint("");
    setEndPoint("");
    setPassengerCount(1);
    setTravelDate(new Date().toISOString().split('T')[0]);
  };

  if (!route) return null;

  const totalFare = route.fare * passengerCount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Pesan Tiket - {route.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="startPoint" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Titik Awal
            </Label>
            <Input
              id="startPoint"
              placeholder={`Contoh: ${route.start_point}`}
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endPoint" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Titik Tujuan
            </Label>
            <Input
              id="endPoint"
              placeholder={`Contoh: ${route.end_point}`}
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengerCount" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Jumlah Penumpang
            </Label>
            <Input
              id="passengerCount"
              type="number"
              min="1"
              max="10"
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Tanggal Perjalanan
            </Label>
            <Input
              id="travelDate"
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Harga:</span>
              <span className="text-2xl font-bold text-primary">
                Rp {totalFare.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-primary">
            Lanjut Bayar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;