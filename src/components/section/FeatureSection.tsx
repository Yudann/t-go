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
      image: "/FITUR/fitur2.png",
      title: "E-Ticket",
      description: "Lihat tiket digital dan riwayat tiket dengan mudah",
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
      className="py-20 md:py-28 text-center bg-border-color min-h-screen flex flex-col items-center justify-center"
    >
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-darker mb-4 underline decoration-primary decoration-4 underline-offset-8">
          FITUR UNGGULAN
        </h1>
        <p className="text-base md:text-lg text-text-primary/70 mb-12 max-w-md">
          Nikmati berbagai kemudahan dalam satu aplikasi!
        </p>

        {/* Main Content - Phone + Arrows */}
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Previous feature"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Phone Frame Container */}
          <div className="relative w-64 md:w-72 lg:w-80">
            {/* Phone Frame */}
            <div className="relative w-full h-[480px] md:h-[540px] lg:h-[580px] rounded-[40px] overflow-hidden bg-card shadow-2xl border-4 border-gray-200 dark:border-gray-700">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-b-2xl z-20"></div>

              {/* Slides */}
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={400}
                    height={400}
                    className="w-full h-[65%] object-cover"
                  />
                </div>
              ))}

              {/* Feature Info - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card to-transparent pt-8 pb-6 px-5">
                <h3 className="text-lg md:text-xl font-black text-primary-darker mb-2">
                  {features[currentSlide].title}
                </h3>
                <p className="text-sm md:text-base text-text-feature leading-relaxed">
                  {features[currentSlide].description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Next feature"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-3 bg-primary"
                  : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>

        {/* Feature Counter */}
        <p className="text-sm text-text-primary/50 mt-4 font-medium">
          {currentSlide + 1} / {features.length}
        </p>
      </div>
    </section>
  );
};

export default FeaturesSection;
