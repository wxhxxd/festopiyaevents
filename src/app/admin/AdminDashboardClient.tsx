"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  DollarSign, 
  Users as UsersIcon, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Check, 
  Search,
  Percent,
  Wallet
} from "lucide-react";
import FestopiyaBranding from "@/components/FestopiyaBranding";

interface Booking {
  id: number;
  organizerName: string;
  vendorName: string;
  status: "pending_advance" | "advance_paid" | "released";
  realStatus?: string;
  advanceHeld: number;
  totalAmount?: number;
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<"bookings" | "escrow" | "users">("bookings");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminStats, setAdminStats] = useState({ 
    total_events: 0, 
    total_stalls_booked: 0,
    total_organizers: 0,
    total_vendors: 0,
    total_advance_collected: 0,
    platform_revenue: 0,
    pending_vendor_payouts: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
           setError("No token found. Please log in again.");
           return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminStats({
            total_events: data.total_events || 0,
            total_stalls_booked: data.total_stalls_booked || 0,
            total_organizers: data.total_organizers || 0,
            total_vendors: data.total_vendors || 0,
            total_advance_collected: data.total_advance_collected || 0,
            platform_revenue: data.platform_revenue || 0,
            pending_vendor_payouts: data.pending_vendor_payouts || 0
          });
          setBookings(data.bookings || []);
          setError(null);
        } else {
           const errText = await res.text();
           setError(`Error ${res.status}: ${errText}`);
        }
      } catch (e: any) {
        console.error("Failed to fetch admin stats", e);
        setError(e.message || "Network error");
      }
    };
    fetchAdminStats();
  }, []);

  // Handle release payout action
  const handleReleasePayout = (bookingId: number) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "released" } : b)
    );
  };

  // Helper function to simulate booking state upgrade (organizer completes payment)
  const handleSimulatePayment = (bookingId: number) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "advance_paid" } : b)
    );
  };

  const handleApprovePayment = async (bookingId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/approve_payment`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, realStatus: "Booked", status: "advance_paid" } : b));
        alert("Payment approved and stall booked!");
      } else {
        alert("Failed to approve payment");
      }
    } catch (err) {
      alert("Error approving payment");
    }
  };

  const handleRejectPayment = async (bookingId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/reject_payment`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, realStatus: "Rejected" } : b));
        alert("Payment rejected.");
      } else {
        alert("Failed to reject payment");
      }
    } catch (err) {
      alert("Error rejecting payment");
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(b => 
    b.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toString().includes(searchQuery)
  );

  return (
    <div className="flex min-h-screen w-full bg-[#0B0B11] text-zinc-300 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-white/10 bg-black/45 backdrop-blur-xl flex flex-col justify-between shrink-0 p-8 z-10">
        <div className="space-y-12">
          {/* Logo Branding */}
          <div className="flex items-center gap-2">
            <FestopiyaBranding isLanding={false} />
            <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase tracking-widest font-black">
              Admin
            </span>
          </div>

          {/* Nav Menu */}
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full py-4 px-5 rounded-2xl font-semibold text-sm flex items-center gap-4 transition-all duration-300 border ${
                activeTab === "bookings"
                  ? "bg-white/5 border-white/10 text-white shadow-lg"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ClipboardList className="w-5 h-5 text-indigo-450 dark:text-indigo-400" />
              Live Bookings
            </button>

            <button
              onClick={() => setActiveTab("escrow")}
              className={`w-full py-4 px-5 rounded-2xl font-semibold text-sm flex items-center gap-4 transition-all duration-300 border ${
                activeTab === "escrow"
                  ? "bg-white/5 border-white/10 text-white shadow-lg"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <DollarSign className="w-5 h-5 text-emerald-450 dark:text-emerald-400" />
              Escrow Payouts
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full py-4 px-5 rounded-2xl font-semibold text-sm flex items-center gap-4 transition-all duration-300 border ${
                activeTab === "users"
                  ? "bg-white/5 border-white/10 text-white shadow-lg"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <UsersIcon className="w-5 h-5 text-fuchsia-450 dark:text-fuchsia-400" />
              Users
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-zinc-500 text-xs">Festopiya OS v1.0</p>
          <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mt-1">Command Center</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative p-10 md:p-16 z-0">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Admin Command Center
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Global marketplace transactions, escrow management, and user configurations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Top Metric Stats Cards (3D Embossed Glass Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          
          {/* Total Advance Collected */}
          <div className="relative overflow-hidden p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold uppercase tracking-wider">
                Escrow Total
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Advance Collected</p>
              <h3 className="text-3xl font-black text-white mt-1">₹{adminStats.total_advance_collected.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          {/* Festopiya Revenue */}
          <div className="relative overflow-hidden p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Percent className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 font-bold uppercase tracking-wider">
                Platform Fee
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Festopiya Revenue</p>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-sky-400 mt-1">
                ₹{adminStats.platform_revenue.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>

          {/* Pending Vendor Payouts */}
          <div className="relative overflow-hidden p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold uppercase tracking-wider">
                Locked Escrow
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pending Vendor Payouts</p>
              <h3 className="text-3xl font-black text-white mt-1">₹{adminStats.pending_vendor_payouts.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          {/* Total Events */}
          <div className="relative overflow-hidden p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold uppercase tracking-wider">
                Platform
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Events</p>
              <h3 className="text-3xl font-black text-white mt-1">{adminStats.total_events}</h3>
            </div>
          </div>

          {/* Total Stalls Booked */}
          <div className="relative overflow-hidden p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <UsersIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 font-bold uppercase tracking-wider">
                Platform
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Stalls Booked</p>
              <h3 className="text-3xl font-black text-white mt-1">{adminStats.total_stalls_booked}</h3>
            </div>
          </div>

        </section>

        {/* Tab-based Content views */}
        {activeTab === "bookings" && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                Live Bookings &amp; Escrow Ledger
              </h2>
              <p className="text-xs text-zinc-500 font-mono">Showing {filteredBookings.length} records</p>
            </div>

            {/* Modern Glassmorphism Data Table */}
            <div className="overflow-hidden border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.01] text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="py-4 px-6">Booking ID</th>
                      <th className="py-4 px-6">Organizer &amp; Vendor</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Advance Held</th>
                      <th className="py-4 px-6 text-right">Escrow Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 font-medium">
                          No matching bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(booking => {
                        const isPending = booking.status === "pending_advance";
                        const isPaid = booking.status === "advance_paid";
                        const isReleased = booking.status === "released";

                        return (
                          <tr 
                            key={booking.id} 
                            className="hover:bg-white/[0.02] transition-colors duration-250 group/row"
                          >
                            {/* Booking ID */}
                            <td className="py-4 px-6 font-mono font-bold text-zinc-500 group-hover/row:text-white transition-colors">
                              #{booking.id}
                            </td>

                            {/* Organizer & Vendor */}
                            <td className="py-4 px-6">
                              <div className="font-semibold text-white">{booking.organizerName}</div>
                              <div className="text-zinc-500 text-xs mt-0.5">Vendor: {booking.vendorName}</div>
                            </td>

                            {/* Status Pill */}
                            <td className="py-4 px-6">
                              {booking.realStatus === "Pending Approval" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <Lock className="w-3 h-3" />
                                  Pending Approval
                                </span>
                              ) : isPending && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Lock className="w-3 h-3" />
                                  Pending Advance
                                </span>
                              )}
                              {isPaid && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <Unlock className="w-3 h-3" />
                                  Advance Paid
                                </span>
                              )}
                              {isReleased && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  <ShieldCheck className="w-3 h-3" />
                                  Payout Released
                                </span>
                              )}
                            </td>

                            {/* Advance Held */}
                            <td className="py-4 px-6 font-semibold text-white">
                              ₹{(booking.realStatus === "Pending Approval" ? (booking.totalAmount || 0) : booking.advanceHeld).toLocaleString("en-IN")}
                            </td>

                            {/* Action Button */}
                            <td className="py-4 px-6 text-right">
                              {booking.realStatus === "Pending Approval" ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApprovePayment(booking.id)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_0_rgba(16,185,129,0.25)]"
                                  >
                                    Approve & Confirm
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(booking.id)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_0_rgba(244,63,94,0.25)]"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : isPending ? (
                                <div className="flex items-center justify-end gap-2">
                                  {/* Test Simulator Button to trigger pay.captured */}
                                  <button
                                    onClick={() => {
                                      handleSimulatePayment(booking.id);
                                      window.open('https://u.payu.in/ar6SshJj0gro', '_blank');
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-dashed border-amber-500/30 text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                                    title="Simulate payment.captured webhook"
                                  >
                                    Simulate Pay
                                  </button>
                                  <button
                                    disabled
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-zinc-650 border border-white/5 cursor-not-allowed"
                                  >
                                    Release ₹1000
                                  </button>
                                </div>
                              ) : isPaid ? (
                                <button
                                  onClick={() => {
                                    handleReleasePayout(booking.id);
                                    window.open('https://u.payu.in/ar6SshJj0gro', '_blank');
                                  }}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_0_rgba(236,72,153,0.25)]"
                                >
                                  Release ₹1000 to Vendor
                                </button>
                              ) : isReleased ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 pr-4">
                                  <Check className="w-4 h-4 text-indigo-450 dark:text-indigo-400" />
                                  Released
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "escrow" && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Escrow Payout Ledger
            </h2>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-zinc-400 text-sm leading-relaxed">
                This screen details the platform fee component (₹500) and the vendor release component (₹1000) for completed advance transactions.
              </p>
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Processed Escrows</span>
                  <span className="font-mono text-white font-semibold">
                    {bookings.filter(b => b.status === "released").length} releases
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Total Funds Paid to Vendors</span>
                  <span className="font-mono text-white font-semibold">
                    ₹{(bookings.filter(b => b.status === "released").length * 1000).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-fuchsia-400" />
              Platform Registered Users
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white mb-2">Organizers</h3>
                <p className="text-zinc-500 text-xs">Event planning and venue management accounts.</p>
                <div className="mt-4 font-mono font-bold text-white text-3xl">{adminStats.total_organizers}</div>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white mb-2">Vendors</h3>
                <p className="text-zinc-500 text-xs">Stall rentals, catering, visual, and stage crew accounts.</p>
                <div className="mt-4 font-mono font-bold text-white text-3xl">{adminStats.total_vendors}</div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
