import Link from "next/link";
import Image from "next/image";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { Mail, MapPin, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-black/90 border-t border-white/10 text-zinc-400 text-sm overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 -mt-20 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="Festopiya Logo"
                width={112}
                height={28}
                className="h-7 w-auto shrink-0 object-contain group-hover:scale-105 transition-transform"
              />
              <FestopiyaBranding className="text-xl tracking-wide" isLanding={true} />
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              India&rsquo;s Event OS & Stall Booking Marketplace. Connecting campus event organizers with premium food stalls and local vendors for seamless festival commerce.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Escrow Vault Protected</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">
                  Organizer & Vendor Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal & Trust</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="hover:text-white transition-colors">
                  Cookie Preferences & Ads
                </Link>
              </li>
              <li>
                <Link href="/terms#escrow" className="hover:text-white transition-colors">
                  Escrow Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">
                  Hyderabad, Telangana, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <a href="mailto:support@festopiya.com" className="text-zinc-300 hover:text-white transition-colors">
                  support@festopiya.com
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <Link href="/contact">
                <button className="w-full text-xs font-medium py-2 px-4 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white transition-all text-center">
                  Send Us a Message
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Festopiya. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for college fests & stall owners in India</span>
            <Heart className="h-3 w-3 text-pink-500 fill-pink-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
