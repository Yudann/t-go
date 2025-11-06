"use client";

import { useState } from "react";
import Image from "next/image";

const FeaturesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      image: "/FITUR/fitur1.png",
      title: "Peta Rute Angkot",
      description:
        "Temukan jalur dan rute angkot Tangerang dengan peta interaktif.",
    },
    {
      image: "/FITUR/fitur2.jpeg",
      title: "Jadwal Keberangkatan",
      description:
        "Lihat jadwal keberangkatan angkot dengan waktu yang konsisten.",
    },
    {
      image: "/FITUR/fitur3.png",
      title: "Pembayaran Digital",
      description: "Lakukan pembayaran dengan cepat dan aman melalui aplikasi.",
    },
    {
      image: "/FITUR/fitur4.png",
      title: "Kode QR Tiket",
      description:
        "Gunakan kode QR sebagai tiket digital untuk naik dan turun angkot.",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <section
      id="fitur"
      className="pt-24 py-16 text-center bg-border-color min-h-screen flex flex-col items-center justify-center"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-darker mb-8 underline decoration-primary decoration-4">
          FITUR UNGGULAN
        </h1>

        <div className="relative w-64 h-[500px] md:w-80 md:h-[600px] flex flex-col items-center justify-center">
          {/* Phone Frame */}
          <div className="absolute top-12 w-60 h-[400px] md:w-72 md:h-[500px] rounded-[35px] overflow-hidden bg-card shadow-2xl z-10 flex flex-col items-center justify-center p-4">
            {/* Slides */}
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={300}
                  height={300}
                  className="w-full h-2/3 object-cover rounded-2xl mb-2"
                />
              </div>
            ))}

            {/* Feature Info */}
            <div className="mt-64 md:mt-80 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-2">
                {features[currentSlide].title}
              </h3>
              <p className="text-sm md:text-base text-text-feature px-2">
                {features[currentSlide].description}
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 w-full flex justify-between px-8 z-20">
              <button
                onClick={prevSlide}
                className="bg-primary text-bg-primary px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors font-bold"
              >
                ←
              </button>
              <button
                onClick={nextSlide}
                className="bg-primary text-bg-primary px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors font-bold"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <p className="text-lg md:text-xl text-text-primary mt-8 mb-8">
          Nikmati berbagai kemudahan dalam satu aplikasi!
        </p>
      </div>
    </section>
  );
};

export default FeaturesSection;
