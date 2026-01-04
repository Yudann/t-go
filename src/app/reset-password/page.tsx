"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useResetPassword } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Lock, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Supabase sets a session when user clicks the recovery link
      setIsValidSession(!!session);
    };

    checkSession();

    // Listen for auth state changes (when user clicks recovery link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Mohon isi semua field");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak sama");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(password);
      setResetSuccess(true);
      toast.success("Password berhasil diubah!");
      
      // Sign out after password reset
      await supabase.auth.signOut();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengubah password";
      toast.error(errorMessage);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-darker/20 via-primary/10 to-primary-lighter/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-primary-darker/20 via-primary/10 to-primary-lighter/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Link Tidak Valid
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Link reset password sudah kadaluarsa atau tidak valid. 
              Silakan minta link baru.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-block w-full bg-linear-to-r from-primary-darker to-primary-light text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
          >
            Minta Link Baru
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-primary-darker/20 via-primary/10 to-primary-lighter/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: "url('/angkotBG.jpg')",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl p-8"
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <Image
              src="/logobeneran.png"
              alt="T-Go Logo"
              width={120}
              height={48}
              className="w-28 h-auto"
              priority
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {resetSuccess ? (
              // Success State
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Password Diubah!
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Password Anda berhasil diubah. Anda akan dialihkan ke halaman login...
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Mengalihkan...</span>
                </div>
              </motion.div>
            ) : (
              // Form State
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-primary-darker mb-2">
                    Buat Password Baru
                  </h1>
                  <p className="text-text-muted text-sm">
                    Masukkan password baru untuk akun Anda.
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={itemVariants}>
                    <label
                      htmlFor="password"
                      className="block text-text-primary font-semibold mb-2 text-sm"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="password"
                        name="password"
                        id="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-bg-body outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/20 text-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-text-primary font-semibold mb-2 text-sm"
                    >
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-bg-body outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/20 text-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={resetPasswordMutation.isPending}
                      whileHover={{ scale: resetPasswordMutation.isPending ? 1 : 1.02 }}
                      whileTap={{ scale: resetPasswordMutation.isPending ? 1 : 0.98 }}
                      className="w-full bg-linear-to-r from-primary-darker to-primary-light text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      {resetPasswordMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        <span>Simpan Password Baru</span>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
