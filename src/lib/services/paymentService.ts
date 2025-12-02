import { supabase } from '@/lib/supabase/client';
import { Payment } from '@/types/types';

export interface ProcessPaymentParams {
    ticketId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
}

export interface PaymentResult {
    success: boolean;
    payment?: Payment;
    error?: string;
}

export class PaymentService {
    /**
     * Process a dummy payment
     * Simulates a payment gateway delay and processing
     */
    static async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
        const { ticketId, userId, amount, paymentMethod } = params;

        try {
            // 1. Simulate network delay (2-3 seconds)
            const delay = 2000 + Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));

            // 2. Determine success (90% success rate for demo purposes)
            // You can force failure by using a specific amount like 1337
            const isSuccess = amount === 1337 ? false : Math.random() > 0.1;

            if (!isSuccess) {
                // Record failed payment
                await this.recordPayment({
                    ...params,
                    status: 'failed',
                    transactionId: `TXN-FAIL-${Date.now()}`,
                });

                return {
                    success: false,
                    error: 'Pembayaran gagal. Silakan coba lagi atau gunakan metode pembayaran lain.',
                };
            }

            // 3. Generate dummy transaction ID
            const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // 4. Record successful payment
            const payment = await this.recordPayment({
                ...params,
                status: 'success',
                transactionId,
            });

            // 5. Update ticket status
            const { error: ticketError } = await supabase
                .from('tickets')
                .update({
                    payment_status: 'success',
                    status: 'active', // Activate ticket after payment
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId);

            if (ticketError) {
                console.error('Error updating ticket status:', ticketError);
                // We still return success because payment was recorded, but log the error
            }

            return {
                success: true,
                payment,
            };

        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: 'Terjadi kesalahan sistem saat memproses pembayaran.',
            };
        }
    }

    /**
     * Record payment to database
     */
    private static async recordPayment(params: ProcessPaymentParams & { status: string; transactionId: string }) {
        const { ticketId, userId, amount, paymentMethod, status, transactionId } = params;

        const { data, error } = await supabase
            .from('payments')
            .insert({
                ticket_id: ticketId,
                user_id: userId,
                amount: amount,
                payment_method: paymentMethod,
                payment_status: status,
                transaction_id: transactionId,
                paid_at: status === 'success' ? new Date().toISOString() : null,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get payment history for a ticket
     */
    static async getPaymentByTicketId(ticketId: string) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
