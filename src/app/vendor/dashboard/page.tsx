"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Store, 
  MessageSquare, 
  LogOut, 
  MapPin, 
  CalendarDays,
  X,
  CheckCircle2,
  Ticket,
  Loader2,
  AlertCircle,
  Settings,
  AtSign,
  Globe,
  Building2,
  FileText,
  Save,
  Sparkles,
  Compass,
  Send,
  UserCircle,
  ClipboardList
} from "lucide-react";
import { Yellowtail } from "next/font/google";
import Link from "next/link";
import ChatInterface, { ChatContext } from "@/components/ChatInterface";

const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"] });
interface EventData {
  id: number;
  name: string;
  date: string;
  total_stalls: number;
  organizer_id: number;
  standard_price: number;
  premium_price: number;
  premium_stall_ids: string; // JSON array string e.g. "[1,3,5]"
  image_url?: string;
}

interface BookingData {
  id: number;
  event_id: number;
  vendor_name: string;
  stall_number: number;
  image_url?: string;
}

interface PitchData {
  id: number;
  event_id: number;
  vendor_id: number;
  stall_type: string;
  stall_number: number | null;
  offered_price: number;
  status: string;
  event_name?: string;
  organizer_id?: number;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"find_events" | "my_stalls" | "my_pitches" | "settings">("find_events");
  const [eventBookings, setEventBookings] = useState<BookingData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedStall, setSelectedStall] = useState<number | null>(null);
  
  const [isBooked, setIsBooked] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [vendorImage, setVendorImage] = useState<File | null>(null);
  
  // Stall type is now chosen upfront on the event card
  const [stallType, setStallType] = useState<"Standard" | "Premium">("Standard");
  const [offeredPrice, setOfferedPrice] = useState<string>("");

  // Pitches (vendor's own)
  const [myPitches, setMyPitches] = useState<PitchData[]>([]);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  // --- Settings State ---
  const [profileData, setProfileData] = useState({
    company_name: '',
    bio: '',
    instagram_url: '',
    website_url: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    }
  }, [router]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return null;
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const fetchEvents = async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const res = await fetch("http://127.0.0.1:8000/events/", { headers });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : (data.events || []));
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const res = await fetch("http://127.0.0.1:8000/bookings/", { headers });
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  const fetchMyPitches = async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const res = await fetch("http://127.0.0.1:8000/pitches/", { headers });
      const data = await res.json();
      setMyPitches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pitches", err);
    }
  };

  // Fetch events, bookings and pitches on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchBookings(), fetchMyPitches()]).then(() => {
      setLoading(false);
    });
  }, []);

  // Re-fetch pitches whenever My Pitches tab is opened
  useEffect(() => {
    if (activeTab === 'my_pitches') fetchMyPitches();
  }, [activeTab]);

  // Fetch user profile whenever the settings tab is opened
  useEffect(() => {
    if (activeTab !== 'settings') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://127.0.0.1:8000/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfileData({
          company_name: data.company_name || '',
          bio: data.bio || '',
          instagram_url: data.instagram_url || '',
          website_url: data.website_url || '',
        });
      })
      .catch(err => console.error('Failed to fetch profile', err));
  }, [activeTab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsSavingProfile(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('http://127.0.0.1:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      const fetchEventBookings = async () => {
        try {
          const headers = getHeaders();
          if (!headers) return;
          const res = await fetch(`http://127.0.0.1:8000/events/${selectedEvent.id}/bookings`, { headers });
          const data = await res.json();
          setEventBookings(data);
        } catch (err) {
          console.error("Failed to fetch event bookings", err);
        }
      };
      fetchEventBookings();
    } else {
      setEventBookings([]);
    }
  }, [selectedEvent]);

  // Check if a stall is already booked based on the eventBookings array
  const isStallBookedForEvent = (stallId: number) => {
    return eventBookings.some(b => b.stall_number === stallId);
  };

  // Compute which stalls are premium for the selected event
  const premiumStallSet: Set<number> = React.useMemo(() => {
    if (!selectedEvent) return new Set();
    try { return new Set(JSON.parse(selectedEvent.premium_stall_ids || '[]')); }
    catch { return new Set(); }
  }, [selectedEvent]);

  // Generate interactive stalls dynamically based on the selected event
  // Limit visually to 20 so the UI map doesn't overflow if total_stalls is very large
  const visualStallCount = selectedEvent ? Math.min(selectedEvent.total_stalls, 20) : 0;
  const stalls = Array.from({ length: visualStallCount }).map((_, i) => {
    const stallId = i + 1;
    const isBookedStatus = selectedEvent ? isStallBookedForEvent(stallId) : false;
    const isPremium = premiumStallSet.has(stallId);
    return {
      id: stallId,
      status: isBookedStatus ? "booked" : "available",
      isPremium,
      top: `${15 + Math.floor(i / 5) * 20}%`,
      left: `${10 + (i % 5) * 17}%`,
    };
  });

  const handlePitch = async () => {
    if (!selectedEvent || !selectedStall) return;
    
    setIsBookingLoading(true);
    setBookingError(null);

    try {
      const headers = getHeaders();
      if (!headers) return;

      const response = await fetch("http://127.0.0.1:8000/pitches/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          event_id: selectedEvent.id,
          stall_type: stallType,
          stall_number: selectedStall,
          offered_price: parseFloat(offeredPrice) || 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to pitch stall");
      }

      // Success! Re-fetch bookings so UI stays perfectly in sync
      await fetchBookings();
      if (selectedEvent) {
        const headers = getHeaders();
        if (headers) {
          const res = await fetch(`http://127.0.0.1:8000/events/${selectedEvent.id}/bookings`, { headers });
          const data = await res.json();
          setEventBookings(data);
        }
      }
      setIsBooked(true);
      
      // Automatically close after success message
      setTimeout(() => {
        setIsBooked(false);
        setSelectedStall(null);
        setSelectedEvent(null);
      }, 2500);

    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsBookingLoading(false);
    }
  };

  const getEventName = (eventId: number) => {
    return events.find(e => e.id === eventId)?.name || `Event #${eventId}`;
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans flex">
      {/* Cinematic 3D Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full opacity-40"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-purple-and-blue-abstract-particles-22545-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-indigo-950/40 to-black/90 mix-blend-overlay backdrop-blur-[2px]"></div>
      </div>

      {/* Sidebar - Glassmorphism */}
      <aside className="relative z-10 w-20 md:w-64 h-screen p-4 md:p-6 flex flex-col transition-all duration-300">
        <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] py-8 px-3 md:px-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center md:justify-start gap-3 px-2 mb-10">
            <img src="/logo.png" alt="Festopiya Logo" className="h-8 w-auto mr-2 shrink-0" />
            <span className="hidden md:block text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300 tracking-tight">
              Festopiya
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { icon: Search, label: "Find Events", tab: "find_events" },
              { icon: Store, label: "My Stalls", tab: "my_stalls" },
              { icon: ClipboardList, label: "My Pitches", tab: "my_pitches" },
              { icon: Settings, label: "Settings", tab: "settings" },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab(item.tab as "find_events" | "my_stalls" | "my_pitches" | "settings")}
                className={`w-full flex items-center gap-4 px-3 md:px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.tab 
                    ? "bg-white/10 text-white shadow-inner border border-white/10" 
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`w-6 h-6 md:w-5 md:h-5 ${activeTab === item.tab ? 'text-rose-400' : 'group-hover:text-pink-400 transition-colors'}`} />
                <span className="hidden md:block font-medium tracking-wide">{item.label}</span>
              </button>
            ))}
            
            <button 
              onClick={() => { setChatContext(null); setIsChatOpen(true); }}
              className="w-full flex items-center gap-4 px-3 md:px-4 py-3 rounded-2xl transition-all duration-300 group text-white/50 hover:bg-white/10 hover:text-white"
            >
              <MessageSquare className="w-6 h-6 md:w-5 md:h-5 group-hover:text-pink-400 transition-colors" />
              <span className="hidden md:block font-medium tracking-wide">Messages</span>
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button 
              onClick={() => { 
                localStorage.removeItem("token"); 
                localStorage.removeItem("company_name"); 
                localStorage.removeItem("role"); 
                router.push("/auth"); 
              }}
              className="w-full flex items-center gap-4 px-3 md:px-4 py-3 rounded-2xl text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
            >
              <LogOut className="w-6 h-6 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium tracking-wide">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="relative z-10 flex-1 h-screen overflow-y-auto scrollbar-hide p-4 md:p-6 md:pl-0">
        <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
          
          {activeTab === "find_events" ? (
            <div className="bg-gradient-to-br from-purple-900 via-[#1a0b2e] to-black min-h-screen text-white p-8 rounded-[2.5rem]">

              {/* ── Hero 2-col grid ──────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mt-10">

                {/* Left — Welcome & headline */}
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">Vendor Command Center</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
                    Discover <br />
                    <span className={`${yellowtail.className} bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-md`}>
                      the best festivals
                    </span><br />
                    and secure your spot.
                  </h1>

                  {/* Subtext */}
                  <p className="text-lg text-gray-400 mt-6 max-w-md leading-relaxed">
                    Your central hub to find high-traffic events, pitch your stall to organizers, and secure the bag.
                  </p>
                </div>

                {/* Right — Action cards */}
                <div className="flex flex-col gap-6">

                  {/* Card 1 — Browse Events (smooth scroll) */}
                  <div
                    onClick={() => document.getElementById('discover-events-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-start gap-5 transition-all duration-300 shadow-xl cursor-pointer group"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                      <Compass className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Browse Events</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Find upcoming festivals and drop your pitch to the organizer.</p>
                    </div>
                  </div>

                  {/* Card 2 — Active Pitches (open messages) */}
                  <div
                    onClick={() => { setChatContext(null); setIsChatOpen(true); }}
                    className="p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-start gap-5 transition-all duration-300 shadow-xl cursor-pointer group"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                      <Send className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Active Pitches</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Track your stall requests and negotiate prices with organizers.</p>
                    </div>
                  </div>

                  {/* Card 3 — Optimize Profile (settings tab) */}
                  <div
                    onClick={() => setActiveTab('settings')}
                    className="p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-start gap-5 transition-all duration-300 shadow-xl cursor-pointer group"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                      <UserCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">Optimize Profile</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Update your brand bio and social links to stand out.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Event Grid (preserved) ────────────────────────────── */}
              <div id="discover-events-section" className="max-w-7xl mx-auto mt-16">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-8">
                  <Ticket className="text-pink-400 w-7 h-7" />
                  Upcoming Events
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-pink-400 animate-spin mb-4" />
                    <p className="text-white/60 font-medium text-lg">Loading events from database...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                    <Ticket className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/60 font-medium text-lg">No upcoming events found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {Array.isArray(events) && events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                        className="group relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-lg hover:shadow-rose-500/20 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-rose-500/0 to-red-500/0 group-hover:from-pink-500/10 group-hover:via-rose-500/10 group-hover:to-red-500/5 transition-colors duration-500" />
                        <div className="relative z-10 flex flex-col h-full">
                          {event.image_url ? (
                            <img
                              src={event.image_url.startsWith('http') ? event.image_url : `http://127.0.0.1:8000${event.image_url}`}
                              alt={event.name}
                              className="w-full h-48 object-cover rounded-2xl mb-6 shadow-inner"
                            />
                          ) : (
                            <div className="w-full h-48 rounded-2xl mb-6 bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-medium shadow-inner">
                              No Banner
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Exhibition</span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">{event.name}</h3>
                          <div className="space-y-2 text-white/70 mb-5">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-rose-400" />
                              <span className="font-medium">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-pink-400" />
                              <span className="font-medium">TBD</span>
                            </div>
                          </div>

                          {/* ── Stall Tier Selector ───────────────────── */}
                          <div className="mt-auto pt-5 border-t border-white/10">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Choose Stall Type</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              {/* Standard */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setSelectedStall(null);
                                  setBookingError(null);
                                  setStallType("Standard");
                                  setOfferedPrice(event.standard_price?.toString() || "0");
                                }}
                                className="flex flex-col items-center p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group/btn"
                              >
                                <span className="text-xs font-bold text-white/50 group-hover/btn:text-emerald-300 transition-colors uppercase tracking-wider mb-1">Standard</span>
                                <span className="text-xl font-black text-white group-hover/btn:text-emerald-300 transition-colors">₹{event.standard_price || 0}</span>
                              </button>
                              {/* Premium */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(event);
                                  setSelectedStall(null);
                                  setBookingError(null);
                                  setStallType("Premium");
                                  setOfferedPrice(event.premium_price?.toString() || "0");
                                }}
                                className="flex flex-col items-center p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all group/btn relative overflow-hidden"
                              >
                                <span className="absolute top-1 right-2 text-[9px] font-black text-amber-400 uppercase tracking-widest">★ Best</span>
                                <span className="text-xs font-bold text-amber-400/70 group-hover/btn:text-amber-300 transition-colors uppercase tracking-wider mb-1">Premium</span>
                                <span className="text-xl font-black text-amber-300 group-hover/btn:text-amber-200 transition-colors">₹{event.premium_price || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <Store className="text-rose-400 w-8 h-8" />
                  My Stalls
                </h2>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-rose-400 animate-spin mb-4" />
                  <p className="text-white/60 font-medium text-lg">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Store className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 font-medium text-lg">You haven't booked any stalls yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(bookings) && bookings.map((booking, index) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                      className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col"
                    >
                      {booking.image_url && (
                        <img 
                          src={booking.image_url.startsWith('http') ? booking.image_url : `http://127.0.0.1:8000${booking.image_url}`} 
                          alt={`Stall ${booking.stall_number}`} 
                          className="w-full h-32 object-cover rounded-2xl mb-4 shadow-inner" 
                        />
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Booked
                        </span>
                        <span className="text-white/50 text-sm">ID: #{booking.id}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Stall #{booking.stall_number ?? 'N/A'}
                      </h3>
                      <p className="text-rose-400 font-medium mb-6">
                        {getEventName(booking.event_id)}
                      </p>
                      
                      <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                          {booking.vendor_name.charAt(0)}
                        </div>
                        <span className="text-white/70 text-sm font-medium">{booking.vendor_name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "my_pitches" && (
            <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 pb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                    <ClipboardList className="w-7 h-7 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">My Pitches</h2>
                    <p className="text-white/50 mt-0.5">Track your stall applications and respond to counter-offers.</p>
                  </div>
                </div>
                <button
                  onClick={fetchMyPitches}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-rose-400 animate-spin mb-4" />
                  <p className="text-white/60">Loading pitches...</p>
                </div>
              ) : myPitches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <ClipboardList className="w-12 h-12 text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Pitches Yet</h3>
                  <p className="text-white/50 text-center max-w-sm">Browse events and pitch a stall to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myPitches.map((pitch) => {
                    const isCounter = pitch.status === 'Counter_Offered';
                    const isAccepted = pitch.status === 'Accepted';
                    const statusColor =
                      isAccepted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isCounter ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : pitch.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    return (
                      <div key={pitch.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold">{pitch.event_name || `Event #${pitch.event_id}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${pitch.stall_type === 'Premium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {pitch.stall_type}
                              </span>
                              {pitch.stall_number && (
                                <span className="text-white/40 text-xs font-medium">Stall #{pitch.stall_number}</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
                            {pitch.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-white/40 mb-0.5">Your Offer</p>
                            <p className="text-2xl font-black text-white">₹{pitch.offered_price}</p>
                          </div>
                          <button
                            onClick={() => {
                              setChatContext({
                                eventId: pitch.event_id,
                                vendorId: undefined,
                                receiverId: pitch.organizer_id || pitch.event_id, // prioritize organizer_id
                                title: pitch.event_name || `Event #${pitch.event_id}`
                              });
                              setIsChatOpen(true);
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Chat with Organizer"
                          >
                            <MessageSquare className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>

                        {/* Counter-offer action — vendor responds to organizer's counter */}
                        {isCounter && (
                          <div className="border-t border-white/10 pt-4 space-y-2">
                            <p className="text-xs text-blue-300 font-semibold">Organizer countered — respond:</p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  const headers = getHeaders();
                                  if (!headers) return;
                                  await fetch(`http://127.0.0.1:8000/pitches/${pitch.id}`, {
                                    method: 'PUT',
                                    headers,
                                    body: JSON.stringify({ status: 'Accepted' }),
                                  });
                                  fetchMyPitches();
                                }}
                                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-bold border border-emerald-500/30 transition-all"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={async () => {
                                  const headers = getHeaders();
                                  if (!headers) return;
                                  const newPrice = prompt('Enter your counter price (₹):');
                                  if (!newPrice) return;
                                  await fetch(`http://127.0.0.1:8000/pitches/${pitch.id}`, {
                                    method: 'PUT',
                                    headers,
                                    body: JSON.stringify({ status: 'Pending', offered_price: parseFloat(newPrice) }),
                                  });
                                  fetchMyPitches();
                                }}
                                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition-all"
                              >
                                Counter
                              </button>
                            </div>
                          </div>
                        )}

                        {isAccepted && (
                          <div className="border-t border-white/10 pt-3">
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              Deal Secured @ ₹{pitch.offered_price}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10 pb-10">
              {/* Settings Header */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                    <Settings className="w-7 h-7 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Profile Settings</h2>
                    <p className="text-white/50 mt-0.5">Update your public vendor profile information.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">

                {/* Company Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70 pl-1">
                    <Building2 className="w-4 h-4 text-rose-400" />
                    Company Name
                  </label>
                  <input
                    id="vendor-company-name"
                    type="text"
                    value={profileData.company_name}
                    onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner backdrop-blur-sm"
                    placeholder="Your company or brand name"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70 pl-1">
                    <FileText className="w-4 h-4 text-pink-400" />
                    Bio
                  </label>
                  <textarea
                    id="vendor-bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-inner backdrop-blur-sm resize-none"
                    placeholder="Tell organizers about your brand and products..."
                  />
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70 pl-1">
                    <AtSign className="w-4 h-4 text-pink-400" />
                    Instagram URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">instagram.com/</span>
                    <input
                      id="vendor-instagram"
                      type="url"
                      value={profileData.instagram_url}
                      onChange={e => setProfileData({ ...profileData, instagram_url: e.target.value })}
                      className="w-full pl-[7.5rem] pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-inner backdrop-blur-sm"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70 pl-1">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Website URL
                  </label>
                  <input
                    id="vendor-website"
                    type="url"
                    value={profileData.website_url}
                    onChange={e => setProfileData({ ...profileData, website_url: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner backdrop-blur-sm"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Success Toast */}
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      Profile saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  id="vendor-save-profile"
                  type="submit"
                  disabled={isSavingProfile}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    isSavingProfile
                      ? 'bg-rose-500/20 text-white/40 cursor-not-allowed border border-rose-500/10'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.35)] hover:shadow-[0_0_40px_rgba(244,63,94,0.55)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isSavingProfile
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                    : <><Save className="w-5 h-5" /> Save Profile</>
                  }
                </button>

              </form>
            </div>
          )}
          
        </div>
      </section>

      {/* Interactive Stall Map Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-full overflow-y-auto rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
            >
              {/* Close button */}
              <button 
                onClick={() => { setSelectedEvent(null); setSelectedStall(null); }}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left Side: Map Area */}
              <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/10">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                  <p className="text-white/50">Select an available stall on the map below to book.</p>
                </div>
                
                {/* Stall Map Container */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-inner">
                  {/* High quality clean architectural floor plan placeholder */}
                  <img 
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
                    alt="Floor Map Placeholder" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
                  />
                  {/* Grid overlay for tech vibe */}
                  <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Interactive Stalls Overlay */}
                  {stalls.map((stall) => (
                    <motion.button
                      key={stall.id}
                      onClick={() => {
                        if (stall.status !== 'available') return;
                        setSelectedStall(stall.id);
                        // Auto-set tier based on organizer's designation
                        const type = stall.isPremium ? 'Premium' : 'Standard';
                        setStallType(type);
                        setOfferedPrice(
                          type === 'Premium'
                            ? (selectedEvent?.premium_price?.toString() || '0')
                            : (selectedEvent?.standard_price?.toString() || '0')
                        );
                      }}
                      disabled={stall.status === 'booked'}
                      whileHover={stall.status === 'available' ? { scale: 1.1, zIndex: 10 } : {}}
                      whileTap={stall.status === 'available' ? { scale: 0.95 } : {}}
                      style={{ top: stall.top, left: stall.left }}
                      className={`absolute w-[15%] h-[15%] rounded-lg border-2 flex flex-col items-center justify-center font-bold text-[10px] shadow-lg transition-all duration-300
                        ${stall.status === 'booked'
                          ? 'bg-red-500/20 border-red-500/30 text-red-400/50 cursor-not-allowed'
                          : selectedStall === stall.id
                            ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] z-20'
                            : stall.isPremium
                              ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 cursor-pointer hover:bg-amber-500/40 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-pointer hover:bg-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        }
                      `}
                    >
                      <span>{stall.id}</span>
                      {stall.isPremium && stall.status !== 'booked' && selectedStall !== stall.id && (
                        <span className="text-[8px] leading-none text-amber-300">★</span>
                      )}
                    </motion.button>
                  ))}
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500/50 border border-emerald-500"></div>
                      <span className="text-xs text-white/70 font-medium">Standard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-500/50 border border-amber-400"></div>
                      <span className="text-xs text-white/70 font-medium">★ Premium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <span className="text-xs text-white/70 font-medium">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                      <span className="text-xs text-white/70 font-medium">Selected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Booking Panel */}
              <div className="w-full md:w-80 p-8 flex flex-col bg-white/[0.02]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white">Stall Details</h3>
                  <button 
                    onClick={() => {
                      setChatContext({
                        eventId: selectedEvent.id,
                        receiverId: selectedEvent.organizer_id,
                        title: `Organizer of ${selectedEvent.name}`
                      });
                      setIsChatOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4 text-rose-400" /> Message
                  </button>
                </div>
                
                {selectedStall ? (
                  <AnimatePresence mode="wait">
                    {!isBooked ? (
                      <motion.div 
                        key="booking-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                      >
                        <div className="space-y-6 flex-1">
                          <div>
                            <span className="block text-sm text-white/50 mb-1">Stall Number</span>
                            <span className="text-3xl font-black text-rose-400">#{selectedStall}</span>
                          </div>
                          
                          {/* Stall tier chosen on the card — show it here as read-only badge */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold ${
                            stallType === 'Premium'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          }`}>
                            <span>{stallType === 'Premium' ? '★' : '◉'}</span>
                            <span>{stallType} Stall</span>
                          </div>

                          <div>
                            <label className="block text-sm text-white/50 mb-1">Your Pitch Price (₹)</label>
                            <input 
                              type="number" 
                              value={offeredPrice}
                              onChange={e => setOfferedPrice(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner"
                            />
                            <p className="text-xs text-white/40 mt-1">
                              Default prices: Standard ₹{selectedEvent.standard_price || 0}, Premium ₹{selectedEvent.premium_price || 0}
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <p className="text-sm text-rose-200">
                              Submit your pitch. The organizer will review your offer and can accept or counter.
                            </p>
                          </div>
                        </div>

                        {bookingError && (
                          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{bookingError}</p>
                          </div>
                        )}

                        <motion.button
                          onClick={handlePitch}
                          disabled={isBookingLoading}
                          whileHover={isBookingLoading ? {} : { scale: 1.05 }}
                          whileTap={isBookingLoading ? {} : { scale: 0.95 }}
                          className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                            ${isBookingLoading 
                              ? 'bg-rose-500/50 text-white/50 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                            }
                          `}
                        >
                          {isBookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Pitch This Stall"}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="success-message"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center py-10"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ type: "spring", damping: 15 }}
                        >
                          <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-4" />
                        </motion.div>
                        <h4 className="text-2xl font-bold text-white mb-2">Pitch Submitted!</h4>
                        <p className="text-white/60">
                          Your pitch for Stall #{selectedStall} at {selectedEvent.name} has been sent to the organizer. Check your Active Pitches to negotiate!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Store className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/60">Select an available stall from the map to view details and book.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        initialContext={chatContext}
      />
    </main>
  );
}
