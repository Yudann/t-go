'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { PaymentService } from '@/lib/services/paymentService';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, MapPin, Calendar, Users, Ticket } from 'lucide-react';
import { toast } from 'sonner';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('gopay');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Get booking data from URL params
  const ticketId = searchParams.get('ticketId');
  const routeName = searchParams.get('routeName');
  const totalFare = Number(searchParams.get('totalFare'));
  const passengerCount = Number(searchParams.get('passengerCount'));
  const startPoint = searchParams.get('startPoint');
  const endPoint = searchParams.get('endPoint');
  const travelDate = searchParams.get('travelDate');

  useEffect(() => {
    if (!ticketId || !user) {
      router.push('/dashboard/map');
    }
  }, [ticketId, user, router]);

  const handlePayment = async () => {
    if (!ticketId || !user) return;

    setLoading(true);
    setPaymentStatus('processing');

    try {
      const result = await PaymentService.processPayment({
        ticketId,
        userId: user.id,
        amount: totalFare,
        paymentMethod: selectedMethod,
      });

      if (result.success) {
        setPaymentStatus('success');
        toast.success('Pembayaran Berhasil!', {
          description: 'Tiket Anda sudah aktif dan siap digunakan.',
        });
      } else {
        setPaymentStatus('failed');
        toast.error('Pembayaran Gagal', {
          description: result.error || 'Silakan coba lagi.',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error('Terjadi Kesalahan', {
        description: 'Gagal memproses pembayaran.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-600 mb-8">
            Tiket Anda telah berhasil diterbitkan dan siap digunakan.
          </p>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/dashboard/ticket')}
          >
            Lihat Tiket Saya
          </Button>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Gagal</h2>
          <p className="text-gray-600 mb-8">
            Maaf, terjadi kesalahan saat memproses pembayaran Anda.
          </p>
          <div className="space-y-3">
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setPaymentStatus('idle')}
            >
              Coba Lagi
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push('/dashboard/map')}
            >
              Kembali ke Peta
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Pembayaran</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Order Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Ticket className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{routeName}</h3>
                <p className="text-sm text-gray-500">Tiket Angkot</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4" />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{startPoint}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-gray-800">{endPoint}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{passengerCount} Penumpang</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{travelDate ? new Date(travelDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Pembayaran</span>
              <span className="text-xl font-bold text-purple-600">
                Rp {totalFare.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <PaymentMethodSelector 
          selectedMethod={selectedMethod}
          onSelect={setSelectedMethod}
        />

        {/* Pay Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:relative md:shadow-none md:border-0 md:bg-transparent md:p-0">
          <div className="max-w-md mx-auto">
            <Button 
              className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                `Bayar Rp ${totalFare.toLocaleString('id-ID')}`
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 max-w-xs mx-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-100 rounded-full animate-spin border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Memproses Pembayaran</h3>
              <p className="text-sm text-gray-500">Mohon jangan tutup halaman ini...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
