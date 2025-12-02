'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { RouteStop } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, MapPin, ArrowRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGlobalStopsPage() {
  const router = useRouter();
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('route_stops')
        .select(`
          *,
          routes:route_id (name, route_code, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
      toast.error('Gagal memuat data halte');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredStops = stops.filter((stop) => {
    return (
      stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.routes?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.routes?.route_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStops.length / itemsPerPage);
  const paginatedStops = filteredStops.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Daftar Halte Global</h1>
          <p className="text-gray-500">Lihat semua titik pemberhentian di seluruh rute</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Halte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stops.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rute Terlayani</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(stops.map(s => s.route_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative bg-white p-4 rounded-lg shadow-sm">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Cari Nama Halte, Nama Rute, atau Kode Rute..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Halte</TableHead>
              <TableHead>Rute</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Koordinat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-500 mt-2">Memuat data halte...</p>
                </TableCell>
              </TableRow>
            ) : paginatedStops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-gray-500">Tidak ada halte ditemukan.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {stop.stop_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: stop.routes?.color || '#7B2CBF', 
                          color: stop.routes?.color || '#7B2CBF' 
                        }}
                      >
                        {stop.routes?.route_code}
                      </Badge>
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {stop.routes?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      #{stop.stop_order}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/routes/${stop.route_id}/stops`)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      Kelola
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Menampilkan {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filteredStops.length)} dari {filteredStops.length} halte
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
