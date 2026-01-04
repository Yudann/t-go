"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Users, Calendar, ArrowRight, ArrowLeft, Wallet } from "lucide-react";
import { AngkotIcon } from "@/components/AngkotIcon";
import { useThemeStore } from "@/lib/store";
import { useRouteStops } from "@/hooks/useQueries";

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  fare: number;
  color?: string;
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
  const [travelDate, setTravelDate] = useState("");
  const { isDarkMode } = useThemeStore();
  const { data: routeStops = [], isLoading: stopsLoading } = useRouteStops(route?.id || null);

  useEffect(() => {
    if (isOpen && route) {
        if (routeStops.length >= 2) {
            setStartPoint(routeStops[0].stop_name);
            setEndPoint(routeStops[routeStops.length - 1].stop_name);
        } else {
            setStartPoint(route.start_point);
            setEndPoint(route.end_point);
        }
        setTravelDate(new Date().toISOString().split('T')[0]);
        setPassengerCount(1);
    }
  }, [isOpen, route, routeStops]);

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
  };

  if (!route) return null;

  const totalFare = route.fare * passengerCount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-[40px] ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
        <VisuallyHidden>
          <DialogTitle>Booking Perjalanan</DialogTitle>
        </VisuallyHidden>
        
        {/* Header */}
        <div className={`p-6 pt-8 pb-6 rounded-b-[40px] shadow-sm space-y-4 border-b transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100 shadow-gray-200/30'}`}>
            <div className="flex items-center gap-4">
                <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
                <div>
                    <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Booking Perjalanan
                    </h2>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Rute {route.route_code}: {route.name}</p>
                </div>
            </div>

            {/* Location Selector Card */}
            <div className={`p-5 rounded-[28px] space-y-3 relative transition-all border mt-2 ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                   <div className="flex-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Titik Jemput</label>
                       <select 
                         className={`w-full bg-transparent border-none text-sm font-black focus:ring-0 outline-none cursor-pointer p-0 appearance-none ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                         value={startPoint}
                         onChange={(e) => setStartPoint(e.target.value)}
                         disabled={stopsLoading || routeStops.length === 0}
                       >
                         {routeStops.length > 0 ? (
                            routeStops.map(stop => (
                                <option key={stop.id} value={stop.stop_name} className={isDarkMode ? 'bg-[#1A1A20]' : 'bg-white'}>
                                    {stop.stop_name}
                                </option>
                            ))
                         ) : (
                            <option value={route.start_point}>{route.start_point}</option>
                         )}
                       </select>
                   </div>
                </div>
                <div className={`ml-[5px] h-6 border-l border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#7B2CBF]"></div>
                   <div className="flex-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tujuan Akhir</label>
                       <select 
                         className={`w-full bg-transparent border-none text-sm font-black focus:ring-0 outline-none cursor-pointer p-0 appearance-none ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                         value={endPoint}
                         onChange={(e) => setEndPoint(e.target.value)}
                         disabled={stopsLoading || routeStops.length === 0}
                       >
                          {routeStops.length > 0 ? (
                            routeStops.map(stop => (
                                <option key={stop.id} value={stop.stop_name} className={isDarkMode ? 'bg-[#1A1A20]' : 'bg-white'}>
                                    {stop.stop_name}
                                </option>
                            ))
                         ) : (
                            <option value={route.end_point}>{route.end_point}</option>
                         )}
                       </select>
                   </div>
                </div>
            </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
           <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Penumpang</label>
                 <div className={`p-4 rounded-[20px] border flex items-center gap-3 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <Users size={18} className="text-[#7B2CBF]" />
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                      className={`w-full bg-transparent border-none text-sm font-black focus:outline-none p-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                    />
                 </div>
              </div>
              <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tanggal</label>
                 <div className={`p-4 rounded-[20px] border flex items-center gap-3 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <Calendar size={18} className="text-[#7B2CBF]" />
                    <input 
                      type="date" 
                      value={travelDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className={`w-full bg-transparent border-none text-xs font-black focus:outline-none p-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                    />
                 </div>
              </div>
           </div>

           {/* Total Fare Card */}
           <div className={`p-5 rounded-[28px] flex items-center justify-between border-2 border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-purple-50 border-purple-100'}`}>
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#7B2CBF] flex items-center justify-center text-white">
                      <AngkotIcon className="w-5 h-5" color="white" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
                      <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{passengerCount} x Rp {route.fare.toLocaleString()}</p>
                   </div>
               </div>
               <p className="text-xl font-black text-[#7B2CBF]">
                  Rp {totalFare.toLocaleString('id-ID')}
               </p>
           </div>

           <button 
              onClick={handleConfirm}
              className="w-full py-4 bg-[#7B2CBF] text-white rounded-[24px] font-black shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              Konfirmasi & Bayar Sekarang
              <Wallet size={18} />
           </button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;