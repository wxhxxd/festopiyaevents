"use client";

import Link from "next/link";
import FestopiyaBranding from "@/components/FestopiyaBranding";

const yellowtail = { className: "font-yellowtail" };
const caveat = { className: "font-caveat" };

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans">

      <div
        dangerouslySetInnerHTML={{
          __html: `
            <!-- Desktop Video Background -->
            <video
              src="/bg-video.mp4"
              autoplay
              loop
              muted
              playsinline
              webkit-playsinline
              class="hidden md:block fixed inset-0 w-full h-full object-cover z-0"
            ></video>

            <!-- Mobile Video Background -->
            <video
              src="/phoneveiw.mp4"
              autoplay
              loop
              muted
              playsinline
              webkit-playsinline
              class="block md:hidden fixed inset-0 w-full h-full object-cover z-0"
            ></video>
          `
        }}
      />

      {/* ── Dark Overlay ────────────────────────────────────── */}
      <div className="fixed inset-0 w-full h-full bg-black/50 z-0" />

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center px-8 py-6 md:px-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Festopiya Logo" className="h-7 w-auto shrink-0 drop-shadow-2xl" />
          <FestopiyaBranding className="text-2xl tracking-wide" isLanding={true} />
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-88px)] px-6 -mt-16">

        <h1 className={`${yellowtail.className} animate-fade-rise text-6xl md:text-8xl drop-shadow-2xl text-white tracking-wide leading-tight max-w-4xl`}>
          Let&rsquo;s cook up an event.
        </h1>

        <h2 className={`${caveat.className} animate-fade-rise-delay text-2xl md:text-3xl text-gray-200 drop-shadow-md max-w-2xl mx-auto mt-6 leading-relaxed font-normal`}>
          Organizers need the best stalls. Vendors need the best crowds. Match up,
          negotiate your terms, and secure the bag. We just handle the connection.
        </h2>

        <Link href="/auth">
          <button className="animate-fade-rise-delay-2 mt-10 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:bg-white/20 active:scale-95 rounded-full px-8 py-4 cursor-pointer">
            Start Cooking 🍳
          </button>
        </Link>

      </section>
    </main>
  );
}
