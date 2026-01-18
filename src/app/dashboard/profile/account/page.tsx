"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { useUserProfile, useUpdateProfile } from "@/hooks/useQueries";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Camera, 
  Save, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const AccountInfoPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const { data: profile, isLoading: loading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        full_name: formData.full_name,
        phone: formData.phone,
      });
      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FDFDFF]'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#7B2CBF]" />
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
        <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informasi Akun</h2>
      </div>

      <div className="p-6 space-y-8 max-w-[430px] mx-auto">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-[40px] border-4 p-1 shadow-2xl transition-all duration-500 ${isDarkMode ? 'border-gray-800' : 'border-white'}`}>
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Avatar" 
                className="w-full h-full rounded-[36px] object-cover bg-white"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-[#7B2CBF] text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Camera size={20} />
            </button>
          </div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tap kamera untuk ubah foto</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Lengkap</label>
              <div className={`relative flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 focus-within:border-purple-500' : 'bg-white border-gray-100 shadow-sm focus-within:border-purple-500'}`}>
                <div className="pl-5 text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nomor Telepon</label>
              <div className={`relative flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 focus-within:border-purple-500' : 'bg-white border-gray-100 shadow-sm focus-within:border-purple-500'}`}>
                <div className="pl-5 text-gray-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2 opacity-60">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Email (Tertaut)</label>
              <div className={`relative flex items-center rounded-[24px] border ${isDarkMode ? 'bg-[#121216] border-gray-800' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
                <div className="pl-5 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  readOnly
                  className="w-full p-4 pl-3 bg-transparent outline-none text-sm font-bold text-gray-400 cursor-not-allowed"
                />
                <div className="pr-5 text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full py-5 bg-[#7B2CBF] text-white rounded-[28px] font-black text-base shadow-xl shadow-purple-900/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Simpan Perubahan
          </button>
        </form>

        {/* Account Info Tips */}
        <div className={`p-6 rounded-[32px] border transition-colors ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
          <div className="flex gap-4">
            <div className="text-blue-500 mt-1">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className={`text-xs font-black mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>Profil Terverifikasi</p>
              <p className={`text-[10px] font-bold leading-relaxed ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Data Anda digunakan untuk mempermudah proses pemesanan tiket dan penjemputan oleh driver Angkot T-GO.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoPage;
