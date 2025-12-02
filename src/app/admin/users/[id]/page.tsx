'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, User, Phone, Calendar, Ticket, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id) // Assuming profile id matches user id
        .single();

      if (profileError) {
        // Try fetching by user_id if id is not profile id (though usually 1:1)
        const { data: profileData2, error: profileError2 } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id)
          .single();
          
        if (profileError2) throw profileError;
        setProfile(profileData2);
      } else {
        setProfile(profileData);
      }

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          routes:route_id (name, route_code, color)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Gagal memuat detail pengguna');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Pengguna Tidak Ditemukan</h1>
        <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
      </div>
    );
  }

  const totalSpent = tickets
    .filter(t => t.payment_status === 'success')
    .reduce((acc, curr) => acc + curr.total_fare, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Pengguna</h1>
          <p className="text-gray-500 font-mono text-sm">{profile.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                  {profile.full_name?.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{profile.full_name || 'Tanpa Nama'}</CardTitle>
            <p className="text-sm text-gray-500">Pengguna Aplikasi</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{profile.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID')}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Tiket</span>
                <span className="font-medium">{tickets.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tiket Aktif</span>
                <span className="font-medium text-green-600">
                  {tickets.filter(t => t.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Pengeluaran</span>
                <span className="font-medium text-purple-600">
                  Rp {totalSpent.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="tickets">Riwayat Tiket</TabsTrigger>
              <TabsTrigger value="activity">Aktivitas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tickets" className="mt-4 space-y-4">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Belum ada riwayat tiket.
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{ticket.routes?.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(ticket.travel_date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          ticket.status === 'active' ? 'bg-green-500' :
                          ticket.status === 'used' ? 'bg-gray-500' :
                          ticket.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                        }>
                          {ticket.status}
                        </Badge>
                        <p className="text-sm font-bold text-gray-800 mt-1">
                          Rp {ticket.total_fare.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Fitur log aktivitas akan segera hadir.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
