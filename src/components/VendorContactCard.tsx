"use client";

import React from "react";
import { Lock, Unlock, Phone, ShieldCheck } from "lucide-react";

interface VendorContactCardProps {
  vendorName: string;
  vendorPhone: string;
  bookingStatus: "pending_advance" | "advance_paid" | string;
  onPayAdvance?: () => void;
}

export default function VendorContactCard({
  vendorName,
  vendorPhone,
  bookingStatus,
  onPayAdvance,
}: VendorContactCardProps) {
  const isLocked = bookingStatus === "pending_advance";

  const handlePayClick = () => {
    if (onPayAdvance) {
      onPayAdvance();
    } else {
      console.log("Open Razorpay Modal");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto font-sans">
      {isLocked ? (
        // Locked State
        <div className="relative overflow-hidden p-6 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 mb-4 shadow-inner">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>

          <h4 className="text-white font-bold text-lg mb-1">{vendorName}</h4>
          <p className="text-white/40 text-xs mb-6">Vendor contact details are locked.</p>

          <button
            onClick={handlePayClick}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_0_rgba(236,72,153,0.25)]"
          >
            Pay ₹1500 Advance to Unlock
          </button>
        </div>
      ) : (
        // Unlocked State
        <div className="relative overflow-hidden p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
            <Unlock className="w-6 h-6" />
          </div>

          <h4 className="text-white font-bold text-lg mb-1">{vendorName}</h4>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified • Access Unlocked
          </div>

          <div className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Phone Number</p>
            <a 
              href={`tel:${vendorPhone}`} 
              className="text-white font-black text-xl hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              {vendorPhone}
            </a>
          </div>

          <a
            href={`tel:${vendorPhone}`}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Call Vendor
          </a>
        </div>
      )}
    </div>
  );
}
