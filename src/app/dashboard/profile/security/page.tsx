"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/store";
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight,
  AlertTriangle
} from "lucide-react";

const SecurityPage = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  const securityOptions = [
    { 
      icon: <Lock size={20} />, 
      label: 'Ubah Kata Sandi', 
      desc: 'Terakhir diubah 3 bulan lalu', 
      color: 'text-purple-500', 
      bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
      path: '/dashboard/profile/security/change-password'
    },
    { 
      icon: <Fingerprint size={20} />, 
      label: 'Biometrik Face ID', 
      desc: 'Aktif untuk Login & Payment', 
      color: 'text-emerald-500', 
      bg: isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
      toggle: true,
      active: true
    },
    { 
      icon: <Smartphone size={20} />, 
      label: 'Perangkat Terdaftar', 
      desc: 'iPhone 15 Pro • Tangerang', 
      color: 'text-blue-500', 
      bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50' 
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
      {/* Header */}
      <div className={`p-6 pt-12 flex items-center gap-4 border-b transition-colors ${isDarkMode ? 'bg-[#121216] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <button onClick={() => router.back()} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Keamanan Akun</h2>
      </div>

      <div className="p-6 space-y-8 max-w-[430px] mx-auto">
        {/* Security Score */}
        <div className={`p-8 rounded-[40px] text-center space-y-4 relative overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-900'}`}>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-2">
              <ShieldCheck size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-white text-xl font-black">Akun Anda Aman</h3>
            <p className="text-gray-400 text-xs font-bold leading-relaxed px-4">
              Semua fitur perlindungan aktif. Gunakan T-GO Pay dengan tenang.
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Security Options */}
        <section className="space-y-4">
          <h3 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Pengaturan</h3>
          <div className={`rounded-[32px] overflow-hidden border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            {securityOptions.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => item.path && router.push(item.path)}
                className={`w-full flex items-center justify-between p-5 transition-all ${!item.toggle ? 'active:bg-purple-500/5 cursor-pointer' : 'cursor-default'} ${idx !== securityOptions.length - 1 ? (isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-100') : ''}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`${item.bg} ${item.color} w-11 h-11 rounded-[18px] flex items-center justify-center shadow-sm`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
                {item.toggle ? (
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 relative p-1 ${item.active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Warning Section */}
        <div className={`p-6 rounded-[32px] border transition-colors ${isDarkMode ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-100 shadow-sm'}`}>
          <div className="flex gap-4 text-orange-500">
            <AlertTriangle size={24} className="mt-1" />
            <div>
              <p className={`text-xs font-black mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-900'}`}>Tips Keamanan</p>
              <p className={`text-[10px] font-bold leading-relaxed ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Jangan pernah memberikan kode OTP atau password Anda kepada siapapun, termasuk pihak yang mengaku dari T-GO.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
