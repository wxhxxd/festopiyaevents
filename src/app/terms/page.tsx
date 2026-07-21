import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { FileCheck, ShieldAlert, Scale, DollarSign, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Festopiya - Event OS & Stall Booking Marketplace",
  description:
    "Review Festopiya's Terms & Conditions governing stall bookings, vendor conduct, organizer obligations, and Escrow Vault financial terms.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <FileCheck className="h-4 w-4" />
            <span>Platform Agreement</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-zinc-400 text-sm max-w-xl mx-auto">
            Last Updated: July 2026. Please read these terms carefully before creating an account on <FestopiyaBranding className="text-base inline-block align-baseline" isLanding={true} />.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Acceptable Use & Account Registration */}
          <section id="eligibility" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Scale className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">1. Account Registration & User Eligibility</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                By creating an account or registering an event on Festopiya, you confirm that you have the legal capacity to enter into binding contracts.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>
                  <strong className="text-white">Organizers:</strong> Must be authorized representatives of a college fest committee, student council, university administration, or registered event company.
                </li>
                <li>
                  <strong className="text-white">Vendors:</strong> Must operate a legitimate food stall, beverage counter, or merchandise business compliant with local health regulations (e.g. FSSAI standards in India).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Event Organizer Commitments */}
          <section id="organizers" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <FileCheck className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">2. Organizer Responsibilities</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>Event Organizers hosting stall spaces on Festopiya agree to:</p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Provide accurate physical stall space dimensions, power grid supply, and waste disposal facilities as specified in the listing.</li>
                <li>Ensure festival venue access passes and vendor crew permits are delivered prior to stall setup times.</li>
                <li>Refrain from arbitrarily altering stall mapping or cancelling confirmed bookings without minimum advance notice.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Vendor Obligations */}
          <section id="vendors" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-sky-400">
              <ShieldAlert className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">3. Food Stall Vendor Compliance</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>Food stall vendors booking slots through Festopiya commit to:</p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Maintaining strict food hygiene, fire safety equipment, and sanitary waste disposal at the event site.</li>
                <li>Adhering to agreed-upon menu prices and menu items without unapproved price gouging during peak fest hours.</li>
                <li>Operating within prescribed noise, branding, and electrical load limits established by venue management.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Festopiya Escrow Vault Rules */}
          <section id="escrow" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <DollarSign className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">4. Festopiya Escrow Vault & Payment Terms</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                All financial agreements (Flat Fee, Revenue Share, or Hybrid Split) executed on Festopiya are safeguarded by our Escrow Vault protocol:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>
                  <strong className="text-white">Deposit Holding:</strong> Upon booking confirmation, the organizer or vendor deposits funds into the Festopiya Escrow Vault. Funds are securely locked and isolated.
                </li>
                <li>
                  <strong className="text-white">Fund Release:</strong> Funds are released to the vendor&rsquo;s bank account post-event once both parties confirm completion or within 48 hours following event conclusion, provided no dispute is raised.
                </li>
                <li>
                  <strong className="text-white">Dispute Resolution:</strong> If a breach of contract occurs (e.g. vendor absence or organizer venue cancellation), Festopiya reviews uploaded logs and audit trails to determine equitable fund distribution or full refunds.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Governing Law */}
          <section id="governing-law" className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">5. Governing Law & Jurisdiction</h2>
            </div>
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>
                These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the platform shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
