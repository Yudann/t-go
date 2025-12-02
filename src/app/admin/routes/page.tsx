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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Route } from "@/types/types";
import AddRouteModal from "./components/AddRouteModal";
import EditRouteModal from "./components/EditRouteModal";

export default function RoutesManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

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
      alert("Rute berhasil dihapus");
    } catch (error) {
      console.error("Error deleting route:", error);
      alert("Gagal menghapus rute");
    }
  };

  const RouteCard = ({ route }: { route: Route }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-8 rounded-full"
              style={{ backgroundColor: route.color || "#7B2CBF" }}
            />
            <div>
              <h3 className="font-bold text-lg text-gray-900">{route.name}</h3>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 font-medium"
              >
                {route.route_code}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingRoute(route)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/admin/routes/${route.id}/stops`}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              title="Kelola Halte"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteRoute(route.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium">Dari:</span>
            <span>{route.start_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-medium">Ke:</span>
            <span>{route.end_point}</span>
          </div>

          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{route.estimated_time} menit</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Wallet className="w-4 h-4 text-green-600" />
              <span>Rp {route.fare.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Rute</h1>
          <p className="text-gray-600 mt-1">Manajemen rute angkot T-Go</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rute Baru
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari rute, kode, atau tujuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat rute...</p>
          </div>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <Card className="border-dashed border-2 text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              {searchQuery ? "Tidak ada rute ditemukan" : "Belum ada rute"}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchQuery
                ? "Coba dengan kata kunci lain"
                : "Mulai dengan menambahkan rute pertama Anda"}
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rute Pertama
            </Button>
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
