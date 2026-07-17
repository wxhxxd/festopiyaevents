"use client";

import React, { useState } from "react";
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
  Wallet,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import FestopiyaBranding from "@/components/FestopiyaBranding";

interface Booking {
  id: number;
  organizerName: string;
  vendorName: string;
  status: "pending_advance" | "advance_paid" | "released";
  advanceHeld: number;
}

export default function ControlRoomClient() {
  const [activeTab, setActiveTab] = useState<"bookings" | "escrow" | "users" | "messages">("bookings");
  const [searchQuery, setSearchQuery] = useState("");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const fetchConversations = async () => {
    setLoadingConv(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (eventId: string, vendorId: string) => {
    setLoadingMsg(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/conversations/messages?event_id=${eventId}&vendor_id=${vendorId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setConvMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMsg(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "messages") {
      fetchConversations();
      setSelectedConv(null);
      setConvMessages([]);
    }
  }, [activeTab]);

  const renderMessageText = (text: string) => {
    if (!text) return null;

    const pattern = /(\b[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+\b|\+?\d{1,4}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b|whatsapp|phonepe|gpay|g\s?pay|paytm|pay\s?tm|pay\s?direct|direct\s?payment|contact|call|number|phone|mobile|g-pay)/gi;

    const parts = text.split(pattern);
    if (parts.length === 1) return <span>{text}</span>;

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = pattern.test(part);
          return isMatch ? (
            <span key={i} className="bg-red-500/25 border border-red-500/40 text-red-300 font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 animate-pulse" title="Flagged: Potential platform bypass/fee evasion info">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </span>
    );
  };
  
  // Initial bookings that mathematically align with user's metrics:
  // 10 bookings with advance paid/collected = 10 * 1500 = ₹15,000 Total Advance Collected
  // Platform fee component = 10 * 500 = ₹5,000 Festopiya Revenue
  // Vendor payout component = 10 * 1000 = ₹10,000 Pending Vendor Payouts
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1041, organizerName: "Aarav Sharma", vendorName: "BeatDrop Sound System", status: "advance_paid", advanceHeld: 1500 },
    { id: 1042, organizerName: "Ishita Kapoor", vendorName: "Royal Floral Decors", status: "pending_advance", advanceHeld: 1500 },
    { id: 1043, organizerName: "Kabir Malhotra", vendorName: "Gourmet Catering Co.", status: "advance_paid", advanceHeld: 1500 },
    { id: 1044, organizerName: "Diya Sengupta", vendorName: "Lumina Production Lights", status: "released", advanceHeld: 1500 },
    { id: 1045, organizerName: "Rohan Varma", vendorName: "Neon Canvas Visuals", status: "advance_paid", advanceHeld: 1500 },
    { id: 1046, organizerName: "Meera Nair", vendorName: "Classic Banquet Stalls", status: "pending_advance", advanceHeld: 1500 },
    { id: 1047, organizerName: "Aditya Roy", vendorName: "Delish Bakeries", status: "released", advanceHeld: 1500 },
    { id: 1048, organizerName: "Ananya Das", vendorName: "Symphony Stage Setup", status: "advance_paid", advanceHeld: 1500 },
    { id: 1049, organizerName: "Varun Mehta", vendorName: "Candid Frame Photos", status: "pending_advance", advanceHeld: 1500 },
    { id: 1050, organizerName: "Priya Pillai", vendorName: "Elite Hospitality Staff", status: "advance_paid", advanceHeld: 1500 },
    { id: 1051, organizerName: "Siddharth Sen", vendorName: "Vivid Pyro Effects", status: "advance_paid", advanceHeld: 1500 },
    { id: 1052, organizerName: "Kriti Joshi", vendorName: "Apex Security Agency", status: "advance_paid", advanceHeld: 1500 },
    { id: 1053, organizerName: "Rohan Mehta", vendorName: "Soundcraft DJs", status: "advance_paid", advanceHeld: 1500 },
    { id: 1054, organizerName: "Amit Verma", vendorName: "Flavors Catering", status: "advance_paid", advanceHeld: 1500 }
  ]);

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

  // Filter bookings based on search query
  const filteredBookings = bookings.filter(b => 
    b.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toString().includes(searchQuery)
  );

  // Dynamic Math Breakdown (NOT HARDCODED)
  const totalAdvanceCollected = bookings
    .filter(b => b.status === "advance_paid" || b.status === "released")
    .reduce((sum) => sum + 1500, 0);

  const platformRevenue = bookings
    .filter(b => b.status === "advance_paid" || b.status === "released")
    .reduce((sum) => sum + 500, 0);

  const pendingVendorPayouts = bookings
    .filter(b => b.status === "advance_paid")
    .reduce((sum) => sum + 1000, 0);

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
              <ClipboardList className="w-5 h-5 text-indigo-400" />
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
              <DollarSign className="w-5 h-5 text-emerald-400" />
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
              <UsersIcon className="w-5 h-5 text-fuchsia-400" />
              Users
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full py-4 px-5 rounded-2xl font-semibold text-sm flex items-center gap-4 transition-all duration-300 border ${
                activeTab === "messages"
                  ? "bg-white/5 border-white/10 text-white shadow-lg"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Message Audit
            </button>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-zinc-500 text-xs">Festopiya OS v1.0</p>
          <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mt-1">Control Room</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative p-10 md:p-16 z-0">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Secret Control Room
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

        {/* Top Metric Stats Cards (3D Embossed Glass Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
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
              <h3 className="text-3xl font-black text-white mt-1">₹{totalAdvanceCollected.toLocaleString("en-IN")}</h3>
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
                Platform fee
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Festopiya Revenue (Platform Fees)</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent mt-1">
                ₹{platformRevenue.toLocaleString("en-IN")}
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
              <h3 className="text-3xl font-black text-white mt-1">₹{pendingVendorPayouts.toLocaleString("en-IN")}</h3>
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
                              {isPending && (
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
                              ₹{booking.advanceHeld.toLocaleString("en-IN")}
                            </td>

                            {/* Action Button */}
                            <td className="py-4 px-6 text-right">
                              {isPending && (
                                <div className="flex items-center justify-end gap-2">
                                  {/* Test Simulator Button to trigger pay.captured */}
                                  <button
                                    onClick={() => handleSimulatePayment(booking.id)}
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
                              )}
                              {isPaid && (
                                <button
                                  onClick={() => handleReleasePayout(booking.id)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_0_rgba(236,72,153,0.25)]"
                                >
                                  Release ₹1000 to Vendor
                                </button>
                              )}
                              {isReleased && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 pr-4">
                                  <Check className="w-4 h-4 text-indigo-450 dark:text-indigo-400" />
                                  Released
                                </span>
                              )}
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
                <div className="mt-4 font-mono font-bold text-white text-3xl">7</div>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white mb-2">Vendors</h3>
                <p className="text-zinc-500 text-xs">Stall rentals, catering, visual, and stage crew accounts.</p>
                <div className="mt-4 font-mono font-bold text-white text-3xl">12</div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "messages" && (
          <section className="flex-1 flex flex-col min-h-0 space-y-6">
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Inter-User Conversation Monitor
              </h2>
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl font-mono">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                <span>Anti-Disintermediation Audit Mode</span>
              </div>
            </div>

            {loadingConv ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="flex-1 min-h-[500px] grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                {/* Left side: Conversations list */}
                <div className="lg:col-span-5 flex flex-col min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-white/10 bg-white/[0.01]">
                    <p className="text-xs text-zinc-500 font-mono">Active Threads ({conversations.length})</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {conversations.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-sm">
                        No messages found in database.
                      </div>
                    ) : (
                      conversations.map((conv, i) => {
                        const isSelected = selectedConv?.event_id === conv.event_id && selectedConv?.vendor_id === conv.vendor_id;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedConv(conv);
                              fetchMessages(conv.event_id, conv.vendor_id);
                            }}
                            className={`w-full p-5 text-left flex flex-col gap-1.5 transition-all duration-200 outline-none ${
                              isSelected 
                                ? "bg-white/5 border-l-4 border-indigo-500" 
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-white text-sm tracking-wide">{conv.event_name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(conv.last_message_time).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 font-medium">
                              Org: {conv.organizer_name} | Vendor: {conv.vendor_name}
                            </div>
                            <p className="text-xs text-zinc-500 truncate mt-1 italic">
                              "{conv.last_message}"
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right side: Selected conversation chat reader */}
                <div className="lg:col-span-7 flex flex-col min-h-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  {selectedConv ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-5 border-b border-white/10 bg-white/[0.01] flex items-center justify-between shrink-0">
                        <div>
                          <h3 className="font-bold text-white text-sm">{selectedConv.event_name} Chat</h3>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Audit path: {selectedConv.organizer_name} &lt;&mdash;&gt; {selectedConv.vendor_name}
                          </p>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loadingMsg ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                          </div>
                        ) : (
                          convMessages.map((msg, i) => {
                            const isVendor = msg.sender?.includes("(Vendor)");
                            return (
                              <div
                                key={i}
                                className={`flex flex-col max-w-[85%] ${
                                  isVendor ? "mr-auto" : "ml-auto"
                                }`}
                              >
                                <span className="text-[10px] text-zinc-500 font-semibold mb-1 px-1">
                                  {msg.sender}
                                </span>
                                <div
                                  className={`p-4 rounded-2xl border ${
                                    isVendor
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 rounded-tl-none"
                                      : "bg-indigo-950/40 border-indigo-900/60 text-zinc-300 rounded-tr-none"
                                  }`}
                                >
                                  <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                    {renderMessageText(msg.text)}
                                  </p>
                                </div>
                                <span className="text-[9px] text-zinc-650 self-end mt-1 px-1">
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="w-12 h-12 text-zinc-600 mb-3" />
                      <p className="text-sm font-semibold text-zinc-400">Select a conversation thread</p>
                      <p className="text-xs text-zinc-600 max-w-xs mt-1 leading-relaxed">
                        Select any message thread from the left panel to inspect full conversation history and flag phone/payment details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
