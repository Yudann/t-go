import Link from "next/link";

const HeroSection = () => {
  return (
    <section
      id="beranda"
      className="relative pt-24 bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/beranda-bg.jpeg')",
        }}
      />
      <div className="absolute inset-0 bg-white/90 z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center items-center">
          <div className="bg-bg-primary w-full max-w-4xl p-8 rounded-2xl border border-bg-accent shadow-2xl animate-float">
            <div className="text-center text-text-primary space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black">
                T-GO
              </h1>

              <div className="space-y-4 text-sm md:text-lg lg:text-xl leading-relaxed">
                <p>
                  Selamat datang di{" "}
                  <span className="text-primary font-bold">T-GO!</span>
                </p>
                <p>
                  T-GO adalah aplikasi transportasi angkot khusus Tangerang yang
                  memudahkan perjalananmu. Temukan rute, jadwal, dan beli tiket
                  angkot langsung dari satu aplikasi. Praktis dan siap mengantar
                  kamu ke tujuan.
                </p>
                <p>T-GO, Your Way to Go! 🚐💨</p>
              </div>

              <div className="pt-8">
                <Link
                  href="#tentang"
                  className="inline-block bg-linear-to-r from-primary-darker via-primary-dark to-primary hover:brightness-125 transition-all duration-500 px-8 py-4 rounded-full"
                >
                  <span className="text-white font-semibold text-lg">
                    Telusuri
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
