// app/admin/analytics/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Ticket,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useThemeStore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalPassengers: 0,
    averageOccupancy: 0,
    revenueTrend: 0,
    ticketsTrend: 0,
    passengersTrend: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any).rpc("get_admin_analytics", {
        p_time_range: timeRange
      });

      if (error) throw error;

      if (data) {
        setStats({
          totalRevenue: data.stats?.totalRevenue || 0,
          totalTickets: data.stats?.totalTickets || 0,
          totalPassengers: data.stats?.totalPassengers || 0,
          averageOccupancy: data.stats?.occupancy || 0,
          revenueTrend: data.stats?.revenueTrend || 0,
          ticketsTrend: data.stats?.ticketsTrend || 0,
          passengersTrend: data.stats?.passengersTrend || 0
        });
        setRevenueData(data.revenueData || []);
        setTopRoutes(data.topRoutes || []);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Gagal memuat data analitik");
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, colorClass, trend, trendValue }: any) => (
    <Card className={`border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <h3 className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className={`flex items-center mt-3 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trendValue}
          <span className={`ml-1 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>dari periode lalu</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Analitik & Laporan</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Pantau performa operasional dan pendapatan T-Go.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className={`w-[150px] border-0 h-9 text-xs font-bold ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white shadow-sm'}`}>
              <Calendar className="w-3 h-3 mr-2 text-gray-400" />
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-white' : ''}>
              <SelectItem value="24h">24 Jam Terakhir</SelectItem>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className={`h-9 border-0 ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white shadow-sm hover:bg-gray-50'}`}>
            <Download className="w-3 h-3 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Memuat data analitik...</p>
        </div>
      ) : (
        <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Total Pendapatan" 
                    value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
                    icon={TrendingUp}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    trend={stats.revenueTrend >= 0 ? 'up' : 'down'}
                    trendValue={`${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend}%`}
                />
                <MetricCard 
                    title="Tiket Terjual" 
                    value={stats.totalTickets}
                    icon={Ticket}
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    trend={stats.ticketsTrend >= 0 ? 'up' : 'down'}
                    trendValue={`${stats.ticketsTrend >= 0 ? '+' : ''}${stats.ticketsTrend}%`}
                />
                <MetricCard 
                    title="Total Penumpang" 
                    value={stats.totalPassengers}
                    icon={Users}
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                    trend={stats.passengersTrend >= 0 ? 'up' : 'down'}
                    trendValue={`${stats.passengersTrend >= 0 ? '+' : ''}${stats.passengersTrend}%`}
                />
                <MetricCard 
                    title="Okupansi Rata-rata" 
                    value={`${stats.averageOccupancy}%`}
                    icon={PieChart}
                    colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                    trend={stats.averageOccupancy >= 50 ? 'up' : 'down'}
                    trendValue={`${stats.averageOccupancy}%`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className={`lg:col-span-2 border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
                <CardHeader>
                    <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Activity className="w-4 h-4 text-purple-500" />
                        Tren Pendapatan ({timeRange === '24h' ? '24 Jam' : timeRange === '7d' ? '7 Hari' : timeRange === '30d' ? '30 Hari' : 'Tahun Ini'})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                      const maxValue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.value)) : 0;
                      return (
                        <div className="h-[300px] flex items-end justify-between gap-2 pt-4 px-2">
                            {revenueData.length > 0 ? revenueData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center gap-3 flex-1 group">
                                <div className="relative w-full flex justify-center h-[250px] items-end">
                                    <div 
                                    className="w-full max-w-[40px] bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:from-purple-500 group-hover:to-indigo-400 opacity-80 group-hover:opacity-100 relative"
                                    style={{ height: `${maxValue > 0 ? Math.max((data.value / maxValue) * 100, 5) : 5}%` }}
                                    >
                                         {/* Tooltip */}
                                         <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl z-10 border border-gray-700">
                                             Rp {data.value.toLocaleString('id-ID')}
                                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                                         </div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{data.day}</span>
                                </div>
                            )) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                     Belum ada data pendapatan minggu ini
                                 </div>
                            )}
                        </div>
                      );
                    })()}
                </CardContent>
                </Card>

                {/* Top Routes */}
                <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
                <CardHeader>
                    <CardTitle className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Rute Terpopuler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                    {topRoutes.length > 0 ? topRoutes.map((route, index) => (
                        <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{route.route_code}</span>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {route.passengers} pax
                            </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{route.name}</p>
                            <div className={`mt-2 w-full rounded-full h-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full" 
                                style={{ width: `${(route.passengers / (topRoutes[0].passengers || 1)) * 100}%` }}
                            />
                            </div>
                        </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            Belum ada data rute
                        </div>
                    )}
                    </div>
                    <Button variant="outline" className={`w-full mt-6 border-0 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        Lihat Detail
                    </Button>
                </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}
