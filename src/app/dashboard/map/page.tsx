"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  estimated_time: number;
  fare: number;
  color: string;
}

const DashboardMap = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchRoutes();
  }, [user, router]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase.from("routes").select("*");

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-gradient-to-r from-primary to-accent text-white p-4 shadow-lg z-10">
        <h1 className="text-xl font-bold">Peta Rute Angkot</h1>
        <p className="text-sm opacity-90">Jelajahi rute di Tangerang</p>
      </header>

      <div className="flex-1 relative">
        <MapComponent routes={routes} />
      </div>

      <BottomNav />
    </div>
  );
};

export default DashboardMap;
