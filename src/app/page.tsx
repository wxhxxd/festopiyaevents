"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const yellowtail = { className: "font-yellowtail" };
const caveat = { className: "font-caveat" };

export default function LandingPage() {
  const [videoSrc, setVideoSrc] = useState("/bg-video.mp4");

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setVideoSrc("/auth-bg.mp4");
      } else {
        setVideoSrc("/bg-video.mp4");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans">

      <video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      />

      {/* ── Dark Overlay ────────────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full bg-black/50 z-0" />

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center px-8 py-6 md:px-16">
        {/* Logo */}
        <span className="text-white text-2xl font-bold tracking-wide select-none">
          Festopiya
        </span>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-88px)] px-6 -mt-16">

        <h1 className={`${yellowtail.className} animate-fade-rise text-6xl md:text-8xl drop-shadow-2xl text-white tracking-wide leading-tight max-w-4xl`}>
          Let&rsquo;s cook up an event.
        </h1>

        <p className={`${caveat.className} animate-fade-rise-delay text-2xl md:text-3xl text-gray-200 drop-shadow-md max-w-2xl mx-auto mt-6 leading-relaxed`}>
          Organizers need the best stalls. Vendors need the best crowds. Match up,
          negotiate your terms, and secure the bag. We just handle the connection.
        </p>

        <Link href="/auth">
          <button className="animate-fade-rise-delay-2 mt-10 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-medium tracking-widest uppercase transition-all duration-300 rounded-full px-8 py-4 cursor-pointer">
            Start Cooking 🍳
          </button>
        </Link>

      </section>
    </main>
  );
}
