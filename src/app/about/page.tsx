import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { Users, Store, ShieldCheck, Zap, Sparkles, Target, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Festopiya - India's Event OS & Stall Booking",
  description:
    "Learn about Festopiya, India's premier B2B digital event marketplace connecting campus festival organizers with verified food stalls and local vendors.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-600/10 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-pink-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Architecting the Future of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-sky-400">
              Campus Event Commerce
            </span>
          </h1>

          <p className="mt-6 text-zinc-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            <FestopiyaBranding className="text-xl inline-block mx-1 align-baseline" isLanding={true} /> is India&rsquo;s dedicated Event OS and digital stall marketplace. We connect college fest coordinators with top-tier food stalls and local vendors to turn crowded grounds into thriving celebrations.
          </p>
        </section>

        {/* Story / Problem & Solution Section */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Why We Built Festopiya</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
                Bridging the Gap Between Student Clubs and Culinary Entrepreneurs
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                Organizing a college festival in cities like Hyderabad requires intense coordination. Student coordinators often struggle to secure reliable food vendors, while local stall owners face risks of last-minute cancellations and unpaid revenues.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Festopiya solves this with a transparent, digital-first platform. Organizers gain access to verified vendor menus, health certifications, and layout tools, while vendors enjoy guaranteed foot traffic protected by our Escrow Vault system.
              </p>
            </div>

            {/* Visual Highlight Card */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950/80 to-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-400" />
                <span>What Drives Us</span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-pink-300 text-sm">Trust & Safety</h4>
                  <p className="text-xs text-zinc-400 mt-1">Escrow payment protection ensures vendors get paid on time and organizers get guaranteed attendance.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-indigo-300 text-sm">Streamlined Logistics</h4>
                  <p className="text-xs text-zinc-400 mt-1">Digital menus, stall slot assignments, and contract terms handled seamlessly online.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-sky-300 text-sm">Empowering Local Businesses</h4>
                  <p className="text-xs text-zinc-400 mt-1">Providing food stall vendors direct access to thousands of hungry campus students.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dual Pillar Features */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Built for Every Stakeholder</h2>
            <p className="text-zinc-400 text-base mt-2">Designed from the ground up for both organizers and vendors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Organizers */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/40 p-8 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">For Event Coordinators</h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Browse hundreds of active local food vendors and stall concepts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Customizable contract terms (Flat Fee vs Revenue Share)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Live deposit auditing via the Festopiya Escrow Vault</span>
                </li>
              </ul>
            </div>

            {/* For Vendors */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/40 p-8 backdrop-blur-md hover:border-pink-500/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">For Food Stall Vendors</h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-pink-400 shrink-0" />
                  <span>Guaranteed payment lock-in before prepping inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-pink-400 shrink-0" />
                  <span>Direct exposure to premier college cultural & tech fests</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-pink-400 shrink-0" />
                  <span>Simple dashboard to manage bids, menus, and releases</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 p-10 backdrop-blur-xl">
            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to host or set up your next stall?</h2>
            <p className="text-zinc-300 text-sm max-w-xl mx-auto mb-8">
              Join India&rsquo;s fastest-growing campus event marketplace today and start connecting with verified partners.
            </p>
            <Link href="/auth">
              <button className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold px-8 py-3.5 hover:bg-zinc-200 transition-all cursor-pointer">
                <span>Join Festopiya Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
