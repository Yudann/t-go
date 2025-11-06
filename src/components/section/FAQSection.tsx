"use client";

import { useState } from "react";

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Apa itu T-GO?",
      answer:
        "T-GO adalah aplikasi transportasi digital untuk angkot di Tangerang. Aplikasi ini membantu pengguna mengetahui rute, jadwal keberangkatan, dan melakukan pembayaran secara digital menggunakan kode QR.",
    },
    {
      question: "Apa tujuan dibuatnya T-GO?",
      answer:
        "T-GO hadir untuk mengatasi ketidakpastian jadwal angkot di Tangerang dan meningkatkan kenyamanan serta efisiensi perjalanan masyarakat melalui sistem transportasi yang lebih teratur dan modern.",
    },
    {
      question: "Apakah T-GO sama seperti JakLingko?",
      answer:
        "T-GO terinspirasi dari konsep JakLingko, namun dikembangkan khusus untuk sistem angkot di Tangerang dengan penyesuaian rute, tarif, dan kebutuhan pengguna lokal.",
    },
    {
      question: "Bagaimana cara menggunakan T-GO?",
      answer:
        "Pengguna hanya perlu membuat akun, memilih titik awal dan tujuan, melihat jadwal angkot, lalu melakukan pembayaran di aplikasi. Setelah itu, pengguna akan mendapatkan kode QR yang berfungsi sebagai tiket digital.",
    },
    {
      question: "Apakah pembayaran di T-GO aman?",
      answer:
        "Ya, T-GO menggunakan sistem pembayaran digital yang terintegrasi dengan metode transaksi aman dan terpercaya.",
    },
    {
      question: "Apakah T-GO bisa digunakan di seluruh wilayah Tangerang?",
      answer:
        "Saat ini T-GO difokuskan pada beberapa rute utama di Tangerang dan akan terus diperluas seiring dengan pengembangan aplikasi.",
    },
    {
      question: "Apakah perlu koneksi internet untuk menggunakan T-GO?",
      answer:
        "Ya, pengguna memerlukan koneksi internet untuk melihat peta rute, jadwal, dan melakukan transaksi pembayaran.",
    },
    {
      question: "Apakah T-GO tersedia di Play Store atau App Store?",
      answer:
        "T-GO masih dalam tahap pengembangan dan akan segera tersedia di platform resmi begitu siap diluncurkan.",
    },
    {
      question: "Apakah T-GO ramah lingkungan?",
      answer:
        "Ya! Dengan sistem terjadwal dan efisien, T-GO membantu mengurangi kemacetan dan emisi kendaraan akibat angkot yang beroperasi tanpa pola tetap.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative pt-24 py-16 flex items-center justify-center overflow-hidden bg-bg-body"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-center mb-4 text-gradient-purple tracking-wide">
          Frequently Asked Question
        </h1>
        <p className="text-center text-lg md:text-xl mb-12 text-text-muted">
          Temukan jawaban atas pertanyaan umum tentang T-GO.
        </p>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200/20 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary cursor-pointer"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left bg-none border-none outline-none font-semibold p-6 text-text-primary flex justify-between items-center transition-colors duration-400"
              >
                {item.question}
                <span
                  className={`transform transition-transform duration-400 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  activeIndex === index
                    ? "max-h-96 opacity-100 p-6"
                    : "max-h-0 opacity-0 p-0"
                }`}
              >
                <div className="bg-bg-primary text-text-feature text-justify">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
