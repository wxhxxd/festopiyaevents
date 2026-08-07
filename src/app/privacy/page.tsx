import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { ShieldCheck, Lock, Eye, FileText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Festopiya - Event OS & Stall Booking Marketplace",
  description:
    "Read Festopiya's Privacy Policy to understand how we collect, protect, and process user data, escrow transactions, and cookies on our platform.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-zinc-400 text-sm max-w-xl mx-auto">
            Last Updated: July 2026. Your privacy and financial transaction security are fundamental to <FestopiyaBranding className="text-base inline-block align-baseline" isLanding={true} />.
          </p>
        </div>

        {/* Content Container */}
        <div className="space-y-8">
          {/* Section 1: Overview & Information Collection */}
          <section id="collection" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Eye className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                When you use Festopiya as an Event Organizer, Student Club Member, or Food Stall Vendor, we collect specific information required to facilitate stall bookings, contract negotiations, and financial escrow settlements:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>
                  <strong className="text-white">Account & Profile Information:</strong> Name, business name, college affiliation, contact email address, phone number, and password credentials.
                </li>
                <li>
                  <strong className="text-white">Stall & Event Details:</strong> Fest dates, stall dimensions, menu items, pricing structures, and health compliance documents uploaded by vendors.
                </li>
                <li>
                  <strong className="text-white">Financial & Escrow Vault Data:</strong> Bank account numbers, UPI details, deposit transaction logs, and payout verification records stored securely for escrow releases.
                </li>
                <li>
                  <strong className="text-white">Technical & Log Data:</strong> IP address, browser type, device information, and interaction logs captured during site navigation.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: How We Use Information */}
          <section id="use" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <FileText className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                We process your personal and business data solely for legitimate platform services, including:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Facilitating stall applications, booking confirmations, and direct communication between organizers and vendors.</li>
                <li>Holding and releasing funds via the Festopiya Escrow Vault upon verified event completion.</li>
                <li>Preventing fraudulent bookings, vendor no-shows, and unauthorized access to organizer accounts.</li>
                <li>Sending essential transactional updates, security alerts, and customer support notifications.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Cookies & Google Advertising Disclosure */}
          <section id="cookies" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-sky-400">
              <Lock className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">3. Cookies, Analytics & Google AdSense</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                Festopiya uses cookies, web beacons, and similar tracking technologies to enhance user experience, analyze site performance, and serve relevant advertisements:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>
                  <strong className="text-white">Google Analytics:</strong> We use Google Tag Manager and Analytics (G-9W0T4LRR4Z) to monitor aggregated traffic patterns and platform performance.
                </li>
                <li>
                  <strong className="text-white">Google AdSense:</strong> Third-party vendors, including Google (Publisher ID: ca-pub-2446676144525840), use cookies to serve ads based on user visits to Festopiya and other websites on the internet.
                </li>
                <li>
                  <strong className="text-white">Ad Preferences:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Google Ad Settings</a>.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Data Security & Escrow Protection */}
          <section id="escrow-privacy" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">4. Data Security & Escrow Protection</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                We employ industry-standard encryption (TLS/SSL) for data in transit and at rest. Financial transactions conducted through the Festopiya Escrow Vault are processed via encrypted payment gateways. We do not store raw credit card numbers or banking credentials on our public application servers.
              </p>
            </div>
          </section>

          {/* Section 5: Contact Privacy Officer */}
          <section id="contact-privacy" className="rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-8 backdrop-blur-md text-center">
            <h2 className="text-xl font-bold text-white mb-2">Have Questions About Your Privacy?</h2>
            <p className="text-zinc-400 text-sm mb-6">
              If you wish to update, access, or request deletion of your personal information, contact our privacy team.
            </p>
            <a
              href="mailto:support@festopiya.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Privacy Support</span>
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
