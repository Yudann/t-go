"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#beranda", label: "Beranda" },
    { href: "#tentang", label: "Tentang" },
    { href: "#fitur", label: "Fitur" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-text-primary z-50 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Image
            src="/logo.png"
            alt="T-GO Logo"
            width={75}
            height={75}
            className="w-16 h-auto"
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-bg-accent font-medium hover:text-primary-light transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="border border-bg-accent text-bg-accent px-6 py-2 rounded-full font-medium hover:bg-primary-light hover:text-white hover:border-transparent transition-all duration-300"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-primary-dark text-white px-6 py-2 rounded-full font-medium hover:bg-primary-light transition-all duration-300"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden border border-white/40 rounded-lg p-2 text-bg-accent hover:brightness-125 transition-all duration-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-text-primary transition-all duration-300 border-t border-white/30 ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-5 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white font-semibold text-lg hover:text-primary-lighter transition-colors duration-400"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-4 pt-4 border-t border-white/30 text-primary-lighter text-center font-bold hover:text-bg-section transition-colors duration-400"
          >
            ➜ Masuk / Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
