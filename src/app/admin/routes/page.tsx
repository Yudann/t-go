// app/admin/routes/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Wallet,
  Bus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Route } from "@/types/types";
import AddRouteModal from "./components/AddRouteModal";
import EditRouteModal from "./components/EditRouteModal";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/store";

export default function RoutesManagement() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [searchQuery, routes]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("route_code");

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
    let filtered = routes;

    if (searchQuery) {
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
          route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRoutes(filtered);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rute ini?")) return;

    try {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("id", routeId);

      if (error) throw error;

      setRoutes(routes.filter((route) => route.id !== routeId));
      toast.success("Rute berhasil dihapus");
    } catch (error: any) {
      console.error("Error deleting route:", error);
      toast.error(error.message || "Gagal menghapus rute");
    }
  };

  const RouteCard = ({ route }: { route: Route }) => (
    <Card className={`group hover:shadow-lg transition-all duration-200 border relative overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: route.color || "#7B2CBF" }}></div>
      <CardContent className="p-5 pl-7">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black shadow-md" style={{ backgroundColor: route.color || "#7B2CBF" }}>
                {route.route_code}
             </div>
            <div>
              <h3 className={`font-bold text-base leading-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{route.name}</h3>
              <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Rute Aktif
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingRoute(route)}
              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/routes/${route.id}/stops`)}
              className="h-8 w-8 p-0 text-purple-500 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20"
              title="Kelola Halte"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRoute(route.id)}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-dashed border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 flex justify-center"><MapPin className="w-3 h-3 text-emerald-500" /></div>
            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{route.start_point}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
             <div className="w-4 flex justify-center"><MapPin className="w-3 h-3 text-red-500" /></div>
            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{route.end_point}</span>
          </div>

          <div className="flex gap-4 pt-3 mt-1">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              <Clock className="w-3 h-3" />
              <span>{route.estimated_time || 20} min</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              <Wallet className="w-3 h-3" />
              <span>Rp {route.fare.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Kelola Rute</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manajemen rute angkot T-Go</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Rute Baru
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari rute, kode, atau tujuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
            <Button variant="outline" className={isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white'}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Memuat rute...</p>
          </div>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <Card className={`border-dashed border-2 text-center py-16 ${isDarkMode ? 'bg-transparent border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
          <CardContent>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Bus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {searchQuery ? "Tidak ada rute ditemukan" : "Belum ada rute"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery
                ? "Coba dengan kata kunci lain"
                : "Mulai dengan menambahkan rute pertama Anda"}
            </p>
            {!searchQuery && (
                <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Rute
                </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddRouteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchRoutes();
        }}
      />

      <EditRouteModal
        isOpen={!!editingRoute}
        onClose={() => setEditingRoute(null)}
        route={editingRoute}
        onSuccess={() => {
          setEditingRoute(null);
          fetchRoutes();
        }}
      />
    </div>
  );
}
