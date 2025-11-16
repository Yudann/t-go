// app/admin/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Bus,
  Users,
  Ticket,
  TrendingUp,
  MapPin,
  Plus,
  ArrowUp,
  ArrowDown,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Stats {
  totalRoutes: number;
  totalUsers: number;
  totalTickets: number;
  activeTickets: number;
  totalStops: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: "ticket" | "route" | "user";
  description: string;
  time: string;
  user_email?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRoutes: 0,
    totalUsers: 0,
    totalTickets: 0,
    activeTickets: 0,
    totalStops: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch routes count
      const { count: routesCount } = await supabase
        .from("routes")
        .select("*", { count: "exact", head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch tickets data
      const { data: ticketsData } = await supabase.from("tickets").select("*");

      // Fetch route stops count
      const { count: stopsCount } = await supabase
        .from("route_stops")
        .select("*", { count: "exact", head: true });

      const totalTickets = ticketsData?.length || 0;
      const activeTickets =
        ticketsData?.filter((ticket) => ticket.status === "active").length || 0;
      const revenue =
        ticketsData?.reduce(
          (sum, ticket) => sum + (ticket.total_fare || 0),
          0
        ) || 0;

      setStats({
        totalRoutes: routesCount || 0,
        totalUsers: usersCount || 0,
        totalTickets,
        activeTickets,
        totalStops: stopsCount || 0,
        revenue,
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: "1",
          type: "ticket",
          description: "Tiket baru dipesan",
          time: "2 menit lalu",
          user_email: "user@example.com",
        },
        {
          id: "2",
          type: "route",
          description: "Rute T01 diperbarui",
          time: "1 jam lalu",
        },
        {
          id: "3",
          type: "user",
          description: "Pengguna baru terdaftar",
          time: "2 jam lalu",
          user_email: "newuser@example.com",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    description,
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    description: string;
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend &&
                (trend === "up" ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                ))}
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <div className="p-3 bg-purple-100 rounded-xl">
            <Icon className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Ringkasan aktivitas dan statistik T-Go
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/routes")}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rute
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Rute"
          value={stats.totalRoutes}
          icon={Bus}
          trend="up"
          description="+2 dari bulan lalu"
        />
        <StatCard
          title="Pengguna"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          description="+5 pengguna baru"
        />
        <StatCard
          title="Tiket Aktif"
          value={stats.activeTickets}
          icon={Ticket}
          description="Sedang berjalan"
        />
        <StatCard
          title="Total Halte"
          value={stats.totalStops}
          icon={MapPin}
          trend="up"
          description="+3 halte baru"
        />
        <StatCard
          title="Total Tiket"
          value={stats.totalTickets}
          icon={Ticket}
          trend="up"
          description="+12 dari kemarin"
        />
        <StatCard
          title="Pendapatan"
          value={`Rp ${stats.revenue.toLocaleString("id-ID")}`}
          icon={TrendingUp}
          trend="up"
          description="+15% dari bulan lalu"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${
                      activity.type === "ticket"
                        ? "bg-green-100 text-green-600"
                        : ""
                    }
                    ${
                      activity.type === "route"
                        ? "bg-blue-100 text-blue-600"
                        : ""
                    }
                    ${
                      activity.type === "user"
                        ? "bg-purple-100 text-purple-600"
                        : ""
                    }
                  `}
                  >
                    {activity.type === "ticket" && (
                      <Ticket className="w-4 h-4" />
                    )}
                    {activity.type === "route" && <Bus className="w-4 h-4" />}
                    {activity.type === "user" && <Users className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    {activity.user_email && (
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.user_email}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 text-xs"
                  >
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-2 border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                onClick={() => router.push("/admin/routes")}
              >
                <Bus className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium">Tambah Rute</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                onClick={() => router.push("/admin/stops")}
              >
                <MapPin className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Kelola Halte</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-2 border-dashed border-gray-300 hover:border-green-300 hover:bg-green-50"
                onClick={() => router.push("/admin/tickets")}
              >
                <Ticket className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium">Lihat Tiket</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-2 border-dashed border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                onClick={() => router.push("/admin/analytics")}
              >
                <TrendingUp className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium">Analitik</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
