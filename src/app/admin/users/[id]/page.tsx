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
import { useThemeStore } from '@/lib/store';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useThemeStore();

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
          
        if (profileError2) throw profileError2; // Throw the SECOND error if both failed
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

    } catch (error: any) {
      console.error('Error fetching user details:', JSON.stringify(error, null, 2));
      toast.error(`Gagal memuat detail pengguna: ${error.message || error.code || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-[#121216]' : 'bg-gray-50'}`}>
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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className={isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detail Pengguna</h1>
          <p className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {profile.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className={`md:col-span-1 h-fit shadow-lg ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
        <CardHeader className="text-center pb-6 border-b border-dashed dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-purple-500/10 to-transparent" />
          <div className="mx-auto mb-4 relative">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-[#1A1A20] shadow-xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-2xl font-bold">
                {profile.full_name?.charAt(0).toUpperCase() || <User className="w-10 h-10" />}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {profile.full_name || 'Tanpa Nama'}
          </CardTitle>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            Pengguna Aplikasi
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className={`flex items-center gap-3 text-sm p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Phone className="w-4 h-4 text-purple-500" />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{profile.phone || 'No. Telepon tidak ada'}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </span>
            </div>
          </div>
          
          <Separator className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} />
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Tiket</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tickets.length}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tiket Aktif</span>
              <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                {tickets.filter(t => t.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Pengeluaran</span>
              <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Rp {totalSpent.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Content Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className={`w-full justify-start border-b rounded-none h-auto p-0 bg-transparent ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <TabsTrigger 
                value="tickets"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 ${
                  isDarkMode 
                    ? 'text-gray-400 data-[state=active]:text-purple-400 hover:text-gray-300' 
                    : 'text-gray-500 data-[state=active]:text-purple-700'
                }`}
              >
                Riwayat Tiket
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-600 ${
                  isDarkMode 
                    ? 'text-gray-400 data-[state=active]:text-purple-400 hover:text-gray-300' 
                    : 'text-gray-500 data-[state=active]:text-purple-700'
                }`}
              >
                Aktivitas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tickets" className="mt-6 space-y-4">
              {tickets.length === 0 ? (
                <Card className={`border-dashed ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <CardContent className="p-12 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                      <Ticket className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                    <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Belum ada riwayat tiket.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    className={`transition-all duration-200 hover:shadow-lg border cursor-pointer group ${
                      isDarkMode 
                        ? 'bg-[#1A1A20] border-gray-800 hover:border-gray-700' 
                        : 'bg-white border-gray-100 hover:border-purple-200'
                    }`}
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                  >
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform ${
                          isDarkMode ? 'bg-gray-800 text-purple-400' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                        }`}>
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {ticket.routes?.route_code || 'BUS'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              #{ticket.id.slice(0,6)}
                            </span>
                          </div>
                          <h4 className={`font-bold text-lg leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {ticket.routes?.name}
                          </h4>
                          <div className={`flex items-center gap-2 text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ticket.travel_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mb-2 border-0 ${
                          ticket.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' :
                          ticket.status === 'used' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' :
                          ticket.status === 'expired' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20' : 
                          'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                        }`}>
                          {ticket.status === 'active' ? 'Aktif' : ticket.status === 'used' ? 'Selesai' : ticket.status}
                        </Badge>
                        <p className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Rp {ticket.total_fare.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="activity">
              <Card className={`border-dashed ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <CardContent className="p-12 text-center text-gray-500">
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
