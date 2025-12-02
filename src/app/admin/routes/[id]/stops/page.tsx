'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Route, RouteStop } from '@/types/types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRouteStopsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    stop_name: '',
    stop_order: 1,
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchRouteAndStops();
  }, [id]);

  const fetchRouteAndStops = async () => {
    try {
      setLoading(true);
      
      // Fetch route details
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();

      if (routeError) throw routeError;
      setRoute(routeData);

      // Fetch stops
      const { data: stopsData, error: stopsError } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', id)
        .order('stop_order', { ascending: true });

      if (stopsError) throw stopsError;
      setStops(stopsData || []);
      
      // Set next order default
      if (stopsData && stopsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          stop_order: stopsData.length + 1
        }));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data rute dan halte');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (stop?: RouteStop) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        stop_name: stop.stop_name,
        stop_order: stop.stop_order,
        latitude: stop.latitude.toString(),
        longitude: stop.longitude.toString(),
      });
    } else {
      setEditingStop(null);
      setFormData({
        stop_name: '',
        stop_order: stops.length + 1,
        latitude: '',
        longitude: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stop_name || !formData.latitude || !formData.longitude) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        route_id: id,
        stop_name: formData.stop_name,
        stop_order: parseInt(formData.stop_order.toString()),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (editingStop) {
        // Update
        const { error } = await supabase
          .from('route_stops')
          .update(payload)
          .eq('id', editingStop.id);
        
        if (error) throw error;
        toast.success('Halte berhasil diperbarui');
      } else {
        // Create
        const { error } = await supabase
          .from('route_stops')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Halte berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      fetchRouteAndStops();

    } catch (error) {
      console.error('Error saving stop:', error);
      toast.error('Gagal menyimpan data halte');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (stopId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halte ini?')) return;

    try {
      setProcessing(true);
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', stopId);

      if (error) throw error;
      
      toast.success('Halte berhasil dihapus');
      fetchRouteAndStops();
    } catch (error) {
      console.error('Error deleting stop:', error);
      toast.error('Gagal menghapus halte');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Rute Tidak Ditemukan</h1>
        <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/routes')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Halte</h1>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: route.color || '#7B2CBF' }}
              />
              <p className="text-gray-500 font-medium">{route.route_code} - {route.name}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Halte
        </Button>
      </div>

      {/* Stops List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pemberhentian ({stops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Urutan</TableHead>
                <TableHead>Nama Halte</TableHead>
                <TableHead>Koordinat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Belum ada halte untuk rute ini.
                  </TableCell>
                </TableRow>
              ) : (
                stops.map((stop) => (
                  <TableRow key={stop.id}>
                    <TableCell className="font-bold text-center bg-gray-50">
                      {stop.stop_order}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {stop.stop_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(stop)}
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(stop.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStop ? 'Edit Halte' : 'Tambah Halte Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="stop_name">Nama Halte</Label>
              <Input
                id="stop_name"
                value={formData.stop_name}
                onChange={(e) => setFormData({ ...formData, stop_name: e.target.value })}
                placeholder="Contoh: Halte Pasar Lama"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stop_order">Urutan</Label>
              <Input
                id="stop_order"
                type="number"
                value={formData.stop_order}
                onChange={(e) => setFormData({ ...formData, stop_order: parseInt(e.target.value) })}
                min={1}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="-6.xxxxxx"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="106.xxxxxx"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
