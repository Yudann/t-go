import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook untuk mengubah password user yang sudah login
 * Memerlukan password lama untuk verifikasi
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ 
      currentPassword, 
      newPassword 
    }: { 
      currentPassword: string; 
      newPassword: string;
    }) => {
      // Pertama, verifikasi password lama dengan re-authenticate
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('User tidak ditemukan');
      }

      // Re-authenticate dengan password lama
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Password lama tidak sesuai');
      }

      // Update ke password baru
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    },
  });
}

/**
 * Hook untuk mengirim email reset password
 * Digunakan di halaman Lupa Password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    },
  });
}

/**
 * Hook untuk set password baru setelah klik link dari email
 * Digunakan di halaman Reset Password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    },
  });
}
