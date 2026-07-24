"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import FestopiyaBranding from "@/components/FestopiyaBranding";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-350 ${
      scrolled 
        ? "border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-lg" 
        : "border-b border-transparent bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Festopiya Logo"
              width={112}
              height={28}
              priority
              className="h-8 w-auto shrink-0 drop-shadow-2xl object-contain group-hover:scale-105 transition-transform"
            />
            <FestopiyaBranding className="text-2xl tracking-wide" isLanding={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/20 active:scale-95 shadow-lg shadow-pink-500/10 cursor-pointer"
              >
                <span>Start Cooking</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-zinc-300 hover:bg-white/10 hover:text-white focus:outline-none border border-white/10 h-11 w-11"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-5 h-4 flex flex-col justify-between items-center">
                <span 
                  className={`w-5 h-0.5 bg-zinc-300 rounded-full transition-all duration-600 ease-in-out ${
                    mobileMenuOpen 
                      ? "rotate-[765deg] translate-y-[7px] bg-white" 
                      : ""
                  }`} 
                />
                <span 
                  className={`w-5 h-0.5 bg-zinc-300 rounded-full transition-all duration-600 ease-in-out ${
                    mobileMenuOpen 
                      ? "opacity-0 scale-0" 
                      : ""
                  }`} 
                />
                <span 
                  className={`w-5 h-0.5 bg-zinc-300 rounded-full transition-all duration-600 ease-in-out ${
                    mobileMenuOpen 
                      ? "-rotate-[765deg] -translate-y-[7px] bg-white" 
                      : ""
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-base font-medium rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-white border border-white/15"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-2">
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
