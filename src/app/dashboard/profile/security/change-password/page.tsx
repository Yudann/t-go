"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore, useAuthStore } from "@/lib/store";
import { useChangePassword } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

const ChangePasswordPage = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { logout } = useAuthStore();
  const changePasswordMutation = useChangePassword();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Mohon isi semua field");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Password baru tidak sama");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("Password baru harus berbeda dengan password lama");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setSuccess(true);
      toast.success("Password berhasil diubah!");
      
      // Redirect to security page after 2.5 seconds
      setTimeout(() => {
        router.push("/dashboard/profile/security");
      }, 2500);
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengubah password";
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 bg-emerald-100/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={56} className="text-emerald-500" />
          </div>
          <div>
            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Password Berhasil Diubah!
            </h3>
            <p className="text-gray-400 font-bold mt-2">
              Anda akan dialihkan kembali...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[#7B2CBF]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-bold">Mengalihkan...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
      {/* Header */}
      <div className={`p-6 pt-12 flex items-center gap-4 border-b transition-colors ${isDarkMode ? 'bg-[#121216] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <button onClick={() => router.back()} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ubah Kata Sandi</h2>
      </div>

      <div className="p-6 space-y-8 max-w-[430px] mx-auto">
        {/* Security Icon */}
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
            <ShieldCheck size={40} className="text-[#7B2CBF]" />
          </div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
            Pastikan password baru Anda kuat
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Password Saat Ini
            </label>
            <div className={`relative flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 focus-within:border-purple-500' : 'bg-white border-gray-100 shadow-sm focus-within:border-purple-500'}`}>
              <div className="pl-5 text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Masukkan password saat ini"
                className={`w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              />
              <button 
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="pr-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Password Baru
            </label>
            <div className={`relative flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 focus-within:border-purple-500' : 'bg-white border-gray-100 shadow-sm focus-within:border-purple-500'}`}>
              <div className="pl-5 text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Minimal 6 karakter"
                className={`w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              />
              <button 
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="pr-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Konfirmasi Password Baru
            </label>
            <div className={`relative flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 focus-within:border-purple-500' : 'bg-white border-gray-100 shadow-sm focus-within:border-purple-500'}`}>
              <div className="pl-5 text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
                className={`w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
              />
              <button 
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="pr-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full py-5 bg-[#7B2CBF] text-white rounded-[28px] font-black text-base shadow-xl shadow-purple-900/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 mt-8"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Lock size={20} />
                Ubah Password
              </>
            )}
          </button>
        </form>

        {/* Tips */}
        <div className={`p-6 rounded-[32px] border transition-colors ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
          <p className={`text-xs font-black mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
            Tips Password Aman
          </p>
          <ul className={`text-[10px] font-bold leading-relaxed space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            <li>• Gunakan kombinasi huruf besar, huruf kecil, dan angka</li>
            <li>• Hindari menggunakan tanggal lahir atau nama</li>
            <li>• Jangan gunakan password yang sama dengan akun lain</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
