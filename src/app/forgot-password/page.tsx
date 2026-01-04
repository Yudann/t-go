"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForgotPassword } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Mohon masukkan email Anda");
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync(email);
      setEmailSent(true);
      toast.success("Link reset password telah dikirim!");
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengirim email reset password";
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
            {emailSent ? (
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
                    Email Terkirim!
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Kami telah mengirim link reset password ke{" "}
                    <span className="font-semibold text-primary-dark">{email}</span>.
                    Silakan cek inbox atau folder spam Anda.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-primary-dark font-semibold hover:text-primary transition-colors"
                >
                  <ArrowLeft size={18} />
                  Kembali ke Login
                </Link>
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
                    Lupa Password?
                  </h1>
                  <p className="text-text-muted text-sm">
                    Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={itemVariants}>
                    <label
                      htmlFor="email"
                      className="block text-text-primary font-semibold mb-2 text-sm"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={18} />
                      </div>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="email"
                        name="email"
                        id="email"
                        required
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-bg-body outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/20 text-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={forgotPasswordMutation.isPending}
                      whileHover={{ scale: forgotPasswordMutation.isPending ? 1 : 1.02 }}
                      whileTap={{ scale: forgotPasswordMutation.isPending ? 1 : 0.98 }}
                      className="w-full bg-linear-to-r from-primary-darker to-primary-light text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      {forgotPasswordMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          <span>Mengirim...</span>
                        </div>
                      ) : (
                        <span>Kirim Link Reset</span>
                      )}
                    </motion.button>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="text-center pt-4"
                  >
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-text-muted hover:text-primary-dark transition-colors text-sm"
                    >
                      <ArrowLeft size={16} />
                      Kembali ke Login
                    </Link>
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

export default ForgotPasswordPage;
