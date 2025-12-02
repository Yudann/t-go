'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { PaymentService } from '@/lib/services/paymentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CheckCircle, XCircle, MapPin, Calendar, User, CreditCard, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [ticket, setTicket] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch ticket with relations
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles:user_id (full_name, phone, id),
          routes:route_id (name, route_code, color, fare)
        `)
        .eq('id', id)
        .single();

      if (ticketError) throw ticketError;
      setTicket(ticketData);

      // Fetch payment history
      const paymentData = await PaymentService.getPaymentByTicketId(id);
      setPayments(paymentData || []);

    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('Gagal memuat detail tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setProcessing(true);
      
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Status tiket berhasil diubah menjadi ${newStatus}`);
      fetchTicketDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengubah status tiket');
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

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Tiket Tidak Ditemukan</h1>
        <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Tiket</h1>
          <p className="text-gray-500 font-mono text-sm">{ticket.id}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {ticket.status === 'active' && (
            <Button 
              onClick={() => handleUpdateStatus('used')} 
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validasi (Gunakan)
            </Button>
          )}
          {ticket.status !== 'expired' && ticket.status !== 'used' && (
            <Button 
              variant="destructive"
              onClick={() => handleUpdateStatus('expired')}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Route Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Informasi Perjalanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{ticket.routes?.name}</h3>
                  <p className="text-sm text-gray-600">{ticket.routes?.route_code}</p>
                </div>
                <Badge 
                  style={{ backgroundColor: ticket.routes?.color || '#7B2CBF' }}
                  className="text-white"
                >
                  {ticket.routes?.route_code}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Titik Awal</label>
                  <p className="font-medium">{ticket.start_point}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Titik Akhir</label>
                  <p className="font-medium">{ticket.end_point}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Tanggal Perjalanan</label>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(ticket.travel_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Jumlah Penumpang</label>
                  <p className="font-medium">{ticket.passenger_count} Orang</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Riwayat Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          {payment.payment_method?.toUpperCase() || 'Metode Lain'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{payment.transaction_id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          Rp {payment.amount.toLocaleString('id-ID')}
                        </p>
                        <Badge variant={payment.payment_status === 'success' ? 'default' : 'destructive'}>
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada data pembayaran.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Tiket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status Penggunaan</span>
                <Badge className={
                  ticket.status === 'active' ? 'bg-green-500' :
                  ticket.status === 'used' ? 'bg-gray-500' :
                  ticket.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
                }>
                  {ticket.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status Pembayaran</span>
                <Badge variant="outline" className={
                  ticket.payment_status === 'success' ? 'text-green-600 border-green-600' :
                  ticket.payment_status === 'failed' ? 'text-red-600 border-red-600' : 'text-yellow-600 border-yellow-600'
                }>
                  {ticket.payment_status?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              <Separator />
              <div className="pt-2">
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  <QRCodeSVG value={ticket.qr_code} size={150} />
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Scan untuk validasi</p>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Informasi Pemesan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Nama Lengkap</label>
                <p className="font-medium">{ticket.profiles?.full_name || 'Guest User'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Nomor Telepon</label>
                <p className="font-medium">{ticket.profiles?.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">User ID</label>
                <p className="text-xs font-mono text-gray-500 truncate">{ticket.user_id}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => router.push(`/admin/users/${ticket.user_id}`)}
              >
                Lihat Profil User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
