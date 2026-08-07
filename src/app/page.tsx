"use client";

import Link from "next/link";
import Image from "next/image";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import FAQSection from "@/components/FAQSection";
import AdSenseInArticle from "@/components/AdSenseInArticle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Store, Lock } from "lucide-react";

const yellowtail = { className: "font-yellowtail" };
const caveat = { className: "font-caveat" };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black font-sans flex flex-col relative overflow-x-hidden">
      {/* ── Navbar ────────────────────────────────────────── */}
      <Navbar />

      <main className="relative flex-1 w-full overflow-x-hidden">

        {/* Desktop Video Background */}
        <video
          src="/bg-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          onEnded={(e) => { const v = e.target as HTMLVideoElement; v.play(); }}
          aria-hidden="true"
          className="absolute md:fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-0 md:opacity-100 transition-opacity duration-500"
        />

        {/* Mobile Video Background */}
        <video
          src="/phoneveiw.mp4"
          autoPlay
          loop
          muted
          playsInline
          onEnded={(e) => { const v = e.target as HTMLVideoElement; v.play(); }}
          aria-hidden="true"
          className="fixed md:absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 md:opacity-0 transition-opacity duration-500"
        />

        {/* ── Dark Overlay ────────────────────────────────────── */}
        <div className="fixed inset-0 w-full h-full bg-black/50 z-0" />

        {/* ── Hero Section ────────────────────────────────────── */}
        <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)] px-6 py-12">

          <h1 className={`${yellowtail.className} animate-fade-rise text-6xl md:text-8xl drop-shadow-2xl text-white tracking-wide leading-tight max-w-4xl`}>
            Let&rsquo;s cook up an event.
          </h1>

          <h2 className={`${caveat.className} animate-fade-rise-delay text-2xl md:text-3xl text-gray-200 drop-shadow-md max-w-2xl mx-auto mt-6 leading-relaxed font-normal`}>
            Organizers need the best stalls. Vendors need the best crowds. Match up,
            negotiate your terms, and secure the bag. We just handle the connection.
          </h2>

          <Link href="/auth" aria-label="Go to login or sign up page to start booking event stalls">
            <button
              aria-label="Start booking stalls or registering as a vendor"
              className="animate-fade-rise-delay-2 mt-10 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:bg-white/20 active:scale-95 rounded-full px-8 py-4 cursor-pointer"
            >
              Start Cooking 🍳
            </button>
          </Link>

        </section>

        {/* ── Section 1: The Dual Audience Pitch ──────────────── */}
        <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 md:py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Built for Both Sides of the Feast
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Festopiya bridges the gap between campus organizers and local vendors, orchestrating seamless commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Column 1: For Organizers */}
            <div className="group relative rounded-3xl border border-white/10 bg-zinc-950/40 p-8 lg:p-10 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-zinc-900/40 shadow-2xl">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">For Event Organizers</h3>
                <p className="text-zinc-300 leading-relaxed">
                  For college fest coordinators and student club organizers, orchestrating a large-scale campus festival in Hyderabad can be a logistical challenge. At engineering colleges like TKREC (Teegala Krishna Reddy Engineering College), planning annual fests demands reliable vendor management. Festopiya streamlines this process by acting as your centralized Event OS. Organizers can easily browse through a curated database of verified food stalls and local vendors. Whether you are hosting a tech fest or a major cultural event, our platform allows you to browse active menus, verify health certifications, and lock in a diverse food lineup with absolute ease. This eliminates the uncertainty of vendor no-shows and ensures your attendees enjoy high-quality culinary options. From street food stalls to boutique dessert counters, coordinate your entire stall mapping online.
                </p>
              </div>
            </div>

            {/* Column 2: For Vendors */}
            <div className="group relative rounded-3xl border border-white/10 bg-zinc-950/40 p-8 lg:p-10 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-zinc-900/40 shadow-2xl">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mb-6">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">For Food Stall Vendors</h3>
                <p className="text-zinc-300 leading-relaxed">
                  For local food stall owners and culinary entrepreneurs, securing high-impact spaces at crowded campus events is key to driving revenue. Whether you specialize in serving refreshing Mojitos, loaded chips, or classic street food, Festopiya connects you directly with high-volume student audiences. Instead of navigating complex offline negotiations or risking last-minute event cancellations, our platform guarantees your foot traffic and secures your booking slot. We protect vendors by requiring organizers to lock in terms upfront, safeguarding you from unexpected schedule shifts or sudden coordination failures. Gain visibility, showcase your menu to thousands of eager students, and run your business with the confidence that your time and inventory are fully protected. Register today and start bidding on Hyderabad&rsquo;s most active college festivals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: The 'Escrow Vault' Deep-Dive ─────────── */}
        <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16">
          <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 p-8 md:p-12 overflow-hidden shadow-3xl shadow-indigo-500/5">
            {/* Glowing background blob */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-60 w-60 rounded-full bg-pink-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Lock className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Financial Protection</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 mb-4">
                  The Festopiya Escrow Vault
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  Securing financial transactions in the fast-paced event industry is critical for both organizers and vendors. At Festopiya, we have built the &lsquo;Escrow Vault&rsquo;&mdash;a secure payment protection system designed to eliminate financial risk and build absolute trust. When a stall booking is confirmed, the organizer deposits the agreed-upon amount directly into our secure escrow holding system. This money is held safely in the middle by Festopiya. For vendors, this gives ultimate peace of mind: you know the funds are locked in before you invest in raw ingredients, hire staff, or set up your stall. For organizers, our system provides a transparent live audit trail. You can track all payments, deposits, and releases in real-time on our dashboard. Funds are only released to the vendor&rsquo;s bank account once the event concludes successfully and both parties confirm that all terms of the agreement have been met. This neutral ground protects vendors from non-payment and organizers from substandard service or vendor absences, ensuring a fair, secure, and professional marketplace for Hyderabad&rsquo;s campus events. By automating invoice generation, tracking milestones, and resolving disputes via verified records, the Escrow Vault establishes a new standard for campus commerce and vendor relations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Step-by-Step: How It Works ──────────── */}
        <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Our seamless, end-to-end platform simplifies stall booking into four straightforward steps designed to protect both organizers and vendors:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Match Up",
                subtitle: "Post an event or apply",
                desc: "College organizers easily post detailed stall listings for their fests, while local food vendors and student clubs browse open listings. Vendors apply directly to secure their ideal physical slots."
              },
              {
                step: "02",
                title: "Negotiate Terms",
                subtitle: "Revenue split or flat fee",
                desc: "Both parties negotiate the financial parameters of the booking. Organizers and vendors can choose between a fixed flat fee, a percentage-based revenue split, or custom hybrid terms recorded on the platform."
              },
              {
                step: "03",
                title: "Secure the Bag",
                subtitle: "Funds enter escrow vault",
                desc: "To ensure safety for both sides, the agreed-upon booking deposit is deposited into the Festopiya Escrow Vault. This guarantees vendors that their payment is locked before investing in inventory."
              },
              {
                step: "04",
                title: "Execute",
                subtitle: "Serve and release funds",
                desc: "Vendors set up, serve the crowds, and delight students. Once the event concludes and both parties verify that contract conditions were met, the escrowed funds are released to the vendor."
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative rounded-2xl border border-white/5 bg-zinc-950/20 p-6 backdrop-blur-sm hover:border-white/10 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <h4 className="text-xs font-medium text-indigo-400 mb-3">{item.subtitle}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Google AdSense In-Article Ad */}
        <AdSenseInArticle />

        {/* FAQ Section */}
        <FAQSection />

      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
