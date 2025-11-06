"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const { setSession, user } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Mohon isi email dan password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      setSession(data.session);
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal login, periksa email dan password Anda";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        className="relative w-full max-w-5xl"
      >
        {/* Main Card Container */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Content Section */}
            <motion.div
              variants={itemVariants}
              className="lg:w-2/5 bg-linear-to-br from-primary-darker to-primary-dark p-6 lg:p-8 flex flex-col justify-center items-center relative overflow-hidden"
            >
              {/* Background Pattern for Left Side */}
              <div className="absolute inset-0 bg-white" />

              {/* Content */}
              <div className="relative z-10 w-full text-center lg:text-left">
                {/* Logo */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center lg:justify-start mb-6 lg:mb-8"
                >
                  <Image
                    src="/logobeneran.png"
                    alt="T-Go Logo"
                    width={140}
                    height={56}
                    className="w-32 lg:w-36 h-auto"
                    priority
                  />
                </motion.div>

                {/* Video Container */}
                <motion.div
                  variants={itemVariants}
                  className="mb-6 lg:mb-8 w-full max-w-xs mx-auto lg:max-w-full"
                >
                  <div className="relative  overflow-hidden">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-auto object-contain max-h-48 lg:max-h-56"
                    >
                      <source src="/angkott.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </motion.div>

                {/* Text Content */}
                <motion.div variants={itemVariants}>
                  <h2 className="text-white font-bold text-xl lg:text-2xl xl:text-3xl mb-3 lg:mb-4">
                    Selamat Datang Kembali!
                  </h2>
                  <p className="text-white/90 text-sm lg:text-base leading-relaxed">
                    T-Go — Teman Perjalananmu di Tangerang
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Form Section */}
            <motion.div
              variants={itemVariants}
              className="lg:w-3/5 bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center"
            >
              {/* Logo for Mobile */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center lg:hidden mb-6"
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

              <motion.div variants={itemVariants} className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-darker mb-2">
                  Masuk
                </h1>
                <p className="text-text-muted text-sm sm:text-base">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
              </motion.div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="block text-text-primary font-semibold mb-2 text-sm sm:text-base"
                  >
                    Email
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-bg-body outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-text-primary font-semibold mb-2 text-sm sm:text-base"
                  >
                    Password
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    name="password"
                    id="password"
                    required
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-bg-body outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full bg-linear-to-r from-primary-darker to-primary-light text-white py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden text-sm sm:text-base"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Memproses...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Masuk
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="text-center text-text-muted text-sm sm:text-base pt-4"
                >
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="text-primary-dark font-semibold hover:text-primary transition-colors"
                  >
                    Daftar di sini
                  </Link>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
