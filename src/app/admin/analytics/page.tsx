'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Ticket, 
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalPassengers: 0,
    averageOccupancy: 0
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets for calculation
      const { data: tickets } = await supabase
        .from('tickets')
        .select('total_fare, passenger_count, created_at, payment_status');

      if (tickets) {
        const paidTickets = tickets.filter(t => t.payment_status === 'success');
        
        const totalRevenue = paidTickets.reduce((sum, t) => sum + t.total_fare, 0);
        const totalPassengers = tickets.reduce((sum, t) => sum + t.passenger_count, 0);
        
        setStats({
          totalRevenue,
          totalTickets: tickets.length,
          totalPassengers,
          averageOccupancy: 65 // Dummy value for now
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const revenueData = [
    { day: 'Sen', value: 450000 },
    { day: 'Sel', value: 320000 },
    { day: 'Rab', value: 550000 },
    { day: 'Kam', value: 480000 },
    { day: 'Jum', value: 600000 },
    { day: 'Sab', value: 850000 },
    { day: 'Min', value: 750000 },
  ];

  const topRoutes = [
    { code: 'T01', name: 'Terminal Cimone - CBD Ciledug', passengers: 1240, revenue: 6200000 },
    { code: 'T02', name: 'Bintaro - Serpong', passengers: 980, revenue: 6860000 },
    { code: 'T04', name: 'Tangerang Kota - Alam Sutera', passengers: 850, revenue: 5100000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analitik & Laporan</h1>
          <p className="text-gray-500">Pantau performa operasional dan pendapatan</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Jam Terakhir</SelectItem>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  Rp {stats.totalRevenue.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">dari periode lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tiket</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalTickets.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-blue-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">dari periode lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Penumpang</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalPassengers.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-purple-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">dari periode lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Okupansi Rata-rata</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.averageOccupancy}%
                </h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-red-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span className="font-medium">-2.1%</span>
              <span className="text-gray-500 ml-1">dari periode lalu</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Pendapatan (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-2 pt-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="w-full max-w-[40px] bg-purple-600 rounded-t-lg transition-all duration-300 group-hover:bg-purple-700 group-hover:scale-y-105 origin-bottom"
                      style={{ height: `${(data.value / 1000000) * 300}px` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap transition-opacity">
                        Rp {data.value.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Rute Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800">{route.code}</span>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {route.passengers} pax
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{route.name}</p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ width: `${(route.passengers / 1500) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">
              Lihat Semua Rute
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
