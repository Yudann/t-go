import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AboutSection from "@/components/section/AboutSection";
import FAQSection from "@/components/section/FAQSection";
import FeaturesSection from "@/components/section/FeatureSection";
import HeroSection from "@/components/section/HeroSection";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <FAQSection />

      {/* Register CTA */}
      <div className="text-center py-12 bg-bg-body">
        <p className="text-lg md:text-xl">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary-light font-semibold hover:text-text-secondary transition-colors duration-300"
          >
            Daftar Sekarang!
          </Link>
        </p>
      </div>

      <Footer />
    </main>
  );
}
