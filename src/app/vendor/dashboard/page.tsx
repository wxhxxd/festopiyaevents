"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import UiverseLoader from "@/components/UiverseLoader";
import { clearAuthCredentials, getStoredToken, getStoredRole, getStoredCompanyName, setAuthCredentials } from "@/lib/auth";
import { 
  Search, 
  Store, 
  MessageSquare, 
  LogOut, 
  MapPin, 
  Clock,
  CalendarDays,
  X,
  CheckCircle2,
  Ticket,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Settings,
  AtSign,
  Globe,
  Building2,
  FileText,
  Save,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Compass,
  List,
  Send,
  UserCircle,
  ClipboardList,
  Heart,
  UploadCloud,
  Flame,
  Tag,
  ChevronRight,
  Layers,
  Lock,
  Unlock,
  ExternalLink,
  Users,
  ArrowRight,
  Trash2,
  Film,
  Bookmark,
  CreditCard,
  User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ChatInterface, { ChatContext } from "@/components/ChatInterface";
import EventAnimationSlider from "@/components/EventAnimationSlider";

const getFullImageUrl = (url?: string) => {
  if (!url) return "";
  
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
  let resolvedUrl = url;

  // 1. If relative path, prepend base URL
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    let baseUrl = configuredApiUrl;
    if (!baseUrl && typeof window !== "undefined") {
      baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    if (!baseUrl) {
      baseUrl = "http://localhost:8000";
    }
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = resolvedUrl.startsWith("/") ? resolvedUrl : `/${resolvedUrl}`;
    return `${cleanBase}${cleanPath}`;
  }

  // 2. If absolute path, check if it contains localhost/127.0.0.1 to replace with active API or browser host
  if (resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1")) {
    let targetBase = configuredApiUrl;
    if (!targetBase && typeof window !== "undefined") {
      // If we are accessing via local IP (e.g. 192.168.x.x) on mobile, use that hostname
      targetBase = `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    if (targetBase) {
      try {
        const urlObj = new URL(resolvedUrl);
        const pathAndSearch = urlObj.pathname + urlObj.search;
        const cleanBase = targetBase.endsWith("/") ? targetBase.slice(0, -1) : targetBase;
        resolvedUrl = `${cleanBase}${pathAndSearch}`;
      } catch (e) {
        // Fallback
      }
    }
  }

  return resolvedUrl;
};

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  maxWDesktop?: string;
  roundedClass?: string;
  fallbackIcon?: "store" | "avatar";
}

const SafeImage = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-video",
  maxWDesktop = "md:max-w-md",
  roundedClass = "rounded-2xl",
  fallbackIcon = "store"
}: SafeImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fullUrl = getFullImageUrl(src);

  return (
    <div className={`relative w-full ${aspectRatio} ${maxWDesktop} mx-auto overflow-hidden bg-gray-900 ${roundedClass} shadow-inner`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-20">
          {fallbackIcon === "store" ? (
            <Store className="w-8 h-8 text-white/10" />
          ) : (
            <UserCircle className="w-8 h-8 text-white/10" />
          )}
        </div>
      )}

      {(!src || error) ? (
        <div className="absolute inset-0 bg-gray-900/40 flex flex-col items-center justify-center border border-white/5 relative z-10">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
          {fallbackIcon === "store" ? (
            <Store className="w-10 h-10 text-white/20" />
          ) : (
            <UserCircle className="w-10 h-10 text-white/20" />
          )}
        </div>
      ) : (
        <Image
          src={fullUrl}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 relative z-10 ${loading ? 'scale-105 blur-lg opacity-0' : 'scale-100 blur-0 opacity-100'} ${className}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};


const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const yellowtail = { className: "font-yellowtail" };
interface EventData {
  id: any;
  name: string;
  category?: string;
  date: string;
  total_stalls: number;
  organizer_id: number;
  standard_price: number;
  premium_price: number;
  premium_stall_ids: string; // JSON array string e.g. "[1,3,5]"
  image_url?: string;
  image_urls?: string | string[];
  banner_url?: string;
  maps_url?: string;
  standard_stall_size?: string;
  premium_stall_size?: string;
  standard_stall_location?: string;
  premium_stall_location?: string;
  payment_model?: string;
  provides_infrastructure?: string;
  description?: string;
}

const isEventExpired = (eventDateStr: string) => {
  if (!eventDateStr) return false;
  try {
    const cleanStr = eventDateStr
      .replace(/^[A-Za-z]+,\s*/, "")
      .replace(" at ", " ")
      .replace(/(\d+)(st|nd|rd|th)/, "$1");
    let parsedDate = Date.parse(cleanStr);
    
    if (isNaN(parsedDate)) {
      const withYear = `${cleanStr} ${new Date().getFullYear()}`;
      parsedDate = Date.parse(withYear);
    }
    
    if (isNaN(parsedDate)) return false;
    return parsedDate < Date.now();
  } catch (e) {
    return false;
  }
};

const getImageUrls = (event: any) => {
  try {
    if (Array.isArray(event.image_urls)) return event.image_urls;
    if (typeof event.image_urls === 'string') return JSON.parse(event.image_urls);
  } catch (e) {}
  return event.image_url ? [event.image_url] : [];
};

function ImageCarousel({ urls, alt, aspectRatio = "aspect-video", roundedClass = "rounded-2xl" }: { urls: string[], alt: string, aspectRatio?: string, roundedClass?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) {
    return (
      <div className={`w-full ${aspectRatio} ${roundedClass} bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 font-medium shadow-inner`}>
        No Banner
      </div>
    );
  }

  if (urls.length === 1) {
    return (
      <SafeImage
        src={urls[0]}
        alt={alt}
        aspectRatio={aspectRatio}
        maxWDesktop=""
        roundedClass={`${roundedClass} shadow-inner`}
        fallbackIcon="store"
      />
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`relative w-full ${aspectRatio} ${roundedClass} overflow-hidden group/carousel shadow-inner bg-black`}>
      <SafeImage
        src={urls[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        aspectRatio={aspectRatio}
        maxWDesktop=""
        roundedClass="rounded-none"
        fallbackIcon="store"
      />
      
      {/* Navigation Arrows */}
      <button 
        type="button"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 cursor-pointer text-xs"
      >
        &#9664;
      </button>
      <button 
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20 cursor-pointer text-xs"
      >
        &#9654;
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {urls.map((_, idx) => (
          <span 
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

interface BookingData {
  id: number;
  event_id: any;
  vendor_name?: string;
  stall_number: number;
  image_url?: string;
  status?: string;
  vendor_id?: number;
  amount_paid?: number;
  total_amount?: number;
}

interface PitchData {
  id: number;
  event_id: any;
  vendor_id: number;
  stall_type: string;
  stall_number: number | null;
  offered_price: number;
  status: string;
  event_name?: string;
  organizer_id?: number;
  vendor?: any;
}

const parseEventDate = (dateString: string) => {
  if (!dateString) return { day: "20", month: "JUL" };
  try {
    const cleanString = dateString.replace(" at ", " ");
    const d = new Date(cleanString);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, "0");
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = months[d.getMonth()];
      return { day, month };
    }
    
    const parts = dateString.split(" ");
    if (parts.length >= 2) {
      let month = parts[0].toUpperCase().substring(0, 3);
      let day = parts[1].replace(",", "");
      month = month.replace(/[^A-Z]/g, "");
      if (day.length === 1) day = "0" + day;
      return { day, month };
    }
  } catch (e) {
    console.error("Date parse error", e);
  }
  return { day: "20", month: "JUL" };
};

function VendorEventCard({ event, onClick }: { event: any, onClick: () => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / 10; 
    const y = (clientY - top - height / 2) / 10;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const { day, month } = parseEventDate(event.date);

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateY: mouseX,
          rotateX: useMotionTemplate`calc(${mouseY} * -1)`,
        }}
        whileHover={{ scale: 1.03, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full h-[450px] rounded-[2.5rem] border border-black/10 dark:border-white/10 overflow-hidden group cursor-pointer shadow-xl shadow-black/30 flex flex-col justify-end bg-zinc-950"
      >
        {/* Background Event Banner Image */}
        <img
          src={event.banner_url || (getImageUrls(event)[0]) || "/default-banner.png"}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-0"
        />

        {/* Bottom Gradient overlay for text contrast and Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-95 transition-opacity duration-300 z-10" />
        <div className="absolute inset-0 bg-[#1E0B36]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Top Right: Date Badge */}
        <div className="absolute top-8 right-8 z-20 flex flex-col items-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
          <span className="text-4xl md:text-5xl font-black leading-none tracking-tighter">{day}</span>
          <span className="text-xs md:text-sm font-black tracking-widest uppercase mt-1">{month}</span>
        </div>

        {/* Bottom Left: Event Name & Location */}
        <div className="relative z-20 p-8 text-left">
          <h3 className="text-xl md:text-2xl font-black text-white leading-tight tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:text-pink-300 transition-colors duration-300">
            {event.name}
          </h3>
          <p className="text-xs md:text-sm font-bold text-gray-300 mt-2 uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
            {event.standard_stall_location || "TBD"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<'active' | 'past'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [activeTab, setActiveTab] = useState<"find_events" | "my_stalls" | "my_pitches" | "organizers" | "profile" | "settings">("find_events");
  const [activeProfileTab, setActiveProfileTab] = useState<"items" | "posts">("items");
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  // --- Organizer Hub Search States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");

  const handleSearchOrganizers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/users?role=Organizer&query=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Failed to search organizers", err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchMyProfile = async (userId: number) => {
    setIsProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendorProfile(data);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const cleanUrl = supabaseUrl.replace(/\/$/, "");
        const uniqueFilename = `${myUserId || 'vendor'}_${Date.now()}_${uploadFile.name}`;
        const uploadUrl = `${cleanUrl}/storage/v1/object/vendor-media/${uniqueFilename}`;

        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseAnonKey}`,
            "apikey": supabaseAnonKey,
            "Content-Type": uploadFile.type
          },
          body: uploadFile
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => null);
          throw new Error(errData?.message || "Failed to upload to Supabase");
        }

        const publicUrl = `${cleanUrl}/storage/v1/object/public/vendor-media/${uniqueFilename}`;
        const fileExtension = uploadFile.name.split('.').pop()?.toLowerCase();
        const mediaType = ["mp4", "webm", "avi", "mov"].includes(fileExtension || "") ? "video" : "image";

        const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/media/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            media_url: publicUrl,
            media_type: mediaType
          })
        });

        if (!registerRes.ok) {
          throw new Error("Failed to register Supabase link in backend");
        }
      } else {
        const formData = new FormData();
        formData.append("file", uploadFile);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/media`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => null);
          throw new Error(errData?.detail || "Failed to upload media locally");
        }
      }

      setUploadFile(null);
      if (myUserId) fetchMyProfile(myUserId);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        if (myUserId) fetchMyProfile(myUserId);
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.detail || "Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Failed to upload avatar", err);
    }
  };

  const handleLikeMedia = async (mediaId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${mediaId}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        if (myUserId) fetchMyProfile(myUserId);
      }
    } catch (err) {
      console.error("Failed to like media", err);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${mediaId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedMedia(null);
        if (myUserId) fetchMyProfile(myUserId);
      }
    } catch (err) {
      console.error("Failed to delete media", err);
    }
  };
  const [eventBookings, setEventBookings] = useState<BookingData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [pricingPopupTarget, setPricingPopupTarget] = useState<EventData | null>(null);
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

  // --- Gallery & Lightbox State & Refs ---
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    setIsDragging(true);
    dragMoved.current = false;
    startX.current = e.pageX - galleryRef.current.offsetLeft;
    scrollLeft.current = galleryRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier
    galleryRef.current.scrollLeft = scrollLeft.current - walk;
    if (Math.abs(walk) > 5) {
      dragMoved.current = true;
    }
  };

  // --- Settings State ---
  const [profileData, setProfileData] = useState({
    company_name: '',
    username: '',
    category: '',
    items_selling: '[]',
    bio: '',
    instagram_url: '',
    website_url: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [itemsList, setItemsList] = useState<{name: string, image_url: string}[]>([]);

  useEffect(() => {
    const token = getStoredToken();
    const role = getStoredRole();
    const companyName = getStoredCompanyName();
    if (!token || role !== "Vendor") {
      clearAuthCredentials();
      router.replace("/auth");
    } else {
      setAuthCredentials(token, role, companyName || "");
    }
  }, [router]);

  const getHeaders = () => {
    const token = getStoredToken();
    if (!token) {
      clearAuthCredentials();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`, { headers });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/`, { headers });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/`, { headers });
      const data = await res.json();
      setMyPitches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pitches", err);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      clearAuthCredentials();
      router.replace("/auth");
      return;
    }

    setLoading(true);
    Promise.all([fetchEvents(), fetchBookings(), fetchMyPitches()]).then(() => {
      setLoading(false);
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) {
          clearAuthCredentials();
          router.replace("/auth");
          return null;
        }
        return r.json();
      })
      .then(data => {
        if (data && data.id) {
          setMyUserId(data.id);
          fetchMyProfile(data.id);
        } else if (data) {
          clearAuthCredentials();
          router.replace("/auth");
        }
      })
      .catch(err => console.error("Failed to fetch user me", err));
  }, [router]);

  // Auto-initialize chat if redirected from profile page with query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const chatUserId = params.get("chatUserId");
      const chatUserName = params.get("chatUserName");
      if (chatUserId && chatUserName) {
        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile-by-id/${chatUserId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(profile => {
            let eventId = 0;
            if (profile.role === "Organizer" && profile.events && profile.events.length > 0) {
              eventId = profile.events[0].id;
            } else {
              // Current user is Vendor. Let's fetch the events.
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`, {
                headers: { "Authorization": `Bearer ${token}` }
              })
                .then(r2 => r2.json())
                .then(eventsData => {
                  const userEvents = Array.isArray(eventsData) ? eventsData : (eventsData.events || []);
                  if (userEvents.length > 0) {
                    eventId = userEvents[0].id;
                  }
                  setChatContext({
                    eventId,
                    vendorId: myUserId ? Number(myUserId) : undefined,
                    receiverId: Number(chatUserId),
                    title: chatUserName
                  });
                  setIsChatOpen(true);
                })
                .catch(() => {
                  setChatContext({
                    eventId: 0,
                    vendorId: myUserId ? Number(myUserId) : undefined,
                    receiverId: Number(chatUserId),
                    title: chatUserName
                  });
                  setIsChatOpen(true);
                });
              return;
            }
            setChatContext({
              eventId,
              vendorId: myUserId ? Number(myUserId) : undefined,
              receiverId: Number(chatUserId),
              title: chatUserName
            });
            setIsChatOpen(true);
          })
          .catch(err => {
            console.error("Failed to auto-open chat", err);
            setChatContext({
              eventId: 0,
              receiverId: Number(chatUserId),
              title: chatUserName
            });
            setIsChatOpen(true);
          });

        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }
    }
  }, [router, myUserId]);

  // Re-fetch pitches whenever My Pitches tab is opened
  useEffect(() => {
    if (activeTab === 'my_pitches') fetchMyPitches();
  }, [activeTab]);

  // Re-fetch profile when profile tab is opened
  useEffect(() => {
    if (activeTab === 'profile' && myUserId) {
      fetchMyProfile(myUserId);
    }
  }, [activeTab, myUserId]);

  // Fetch user profile whenever the settings tab is opened
  useEffect(() => {
    if (activeTab !== 'settings') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfileData({
          company_name: data.company_name || '',
          username: data.username || '',
          category: data.category || '',
          items_selling: data.items_selling || '[]',
          bio: data.bio || '',
          instagram_url: data.instagram_url || '',
          website_url: data.website_url || '',
        });
        try {
          setItemsList(JSON.parse(data.items_selling || "[]"));
        } catch (e) {
          setItemsList([]);
        }
      })
      .catch(err => console.error('Failed to fetch profile', err));
  }, [activeTab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsSavingProfile(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...profileData, items_selling: JSON.stringify(itemsList) })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Save failed');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save profile', err);
      setSaveError(err.message || 'Failed to save settings');
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${selectedEvent.id}/bookings`, { headers });
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
  const getStallStatusForEvent = (stallId: number) => {
    const booking = eventBookings.find(b => b.stall_number === stallId);
    if (!booking) return "available";
    return booking.status === "Pending" ? "pending" : "booked";
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
    const stallStatus = selectedEvent ? getStallStatusForEvent(stallId) : "available";
    const isPremium = premiumStallSet.has(stallId);
    return {
      id: stallId,
      status: stallStatus,
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/`, {
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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${selectedEvent.id}/bookings`, { headers });
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

  const handlePayAcceptedPitch = async (pitch: PitchData) => {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const formData = new FormData();
      formData.append("event_id", pitch.event_id.toString());
      formData.append("stall_number", (pitch.stall_number ?? 1).toString());
      formData.append("pitch_id", pitch.id.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getStoredToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process payment");
      }

      if (data.booking && data.booking.id) {
        // Open PayU handle link in new tab
        window.open("https://u.payu.in/ar6SshJj0gro", "_blank");
        
        // Immediately request approval
        const approvalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${data.booking.id}/request_approval`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${getStoredToken()}`
          }
        });
        
        if (approvalRes.ok) {
          alert("Payment initiated! Your booking has been sent for Organizer/Admin approval.");
        } else {
          alert("Payment initiated, but failed to automatically request approval. Please contact support.");
        }
      }
      
      await fetchBookings();
      fetchMyPitches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBookStall = async () => {
    if (!selectedEvent || !selectedStall) return;
    
    setIsBookingLoading(true);
    setBookingError(null);

    try {
      const headers = getHeaders();
      if (!headers) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/`, {
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
        throw new Error(data.detail || "Failed to request stall");
      }

      await fetchBookings();
      fetchMyPitches();
      setIsBooked(true);
      
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-300">
      {/* ── Butterfly Video Overlay ───────────────────────── */}
      <video
        src="/butterflies.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover z-50 pointer-events-none mix-blend-screen opacity-90"
      />
      
      {/* Top Purple/Indigo Glow Gradient */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#f3efff] to-transparent dark:from-[#1e1035] dark:to-transparent pointer-events-none z-0" />

      {/* Mobile Top Header */}
      <header className="relative w-full z-10 flex md:hidden items-center justify-between px-6 pt-6 pb-2 bg-transparent">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Festopiya Logo" className="h-6 w-auto shrink-0" />
          <FestopiyaBranding className="text-xl text-gray-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`relative w-9 h-9 rounded-full overflow-hidden border transition-all ${
              activeTab === "profile" 
                ? "border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
            }`}
          >
            {vendorProfile?.avatar_url ? (
              <Image 
                src={getFullImageUrl(vendorProfile.avatar_url)} 
                alt="Profile" 
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <UserCircle className="w-full h-full text-gray-400 dark:text-white/50" />
            )}
          </button>
          <button 
            onClick={() => { 
              clearAuthCredentials();
              router.push("/auth"); 
            }}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/15 text-gray-500 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 transition-all flex items-center justify-center cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sidebar - Glassmorphism */}
      <aside className="fixed bottom-6 left-4 right-4 h-16 z-50 p-0 md:relative md:bottom-auto md:left-auto md:right-auto md:w-64 md:h-screen md:p-6 flex flex-row md:flex-col transition-all duration-300">
        <div className="flex-1 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start rounded-full md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/20 bg-gray-50/50 dark:bg-white/10 md:bg-gray-50/30 md:dark:bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] px-4 py-2 md:py-8 md:px-4 overflow-x-auto md:overflow-hidden scrollbar-hide">
          <div className="hidden md:flex items-center justify-center md:justify-start gap-3 px-2 mb-10">
            <img src="/logo.png" alt="Festopiya Logo" className="h-6 w-auto mr-2 shrink-0" />
            <FestopiyaBranding className="text-2xl" />
          </div>

          <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start w-full md:w-auto md:flex-1 gap-1.5 md:gap-2 flex-nowrap md:space-y-2">
            {[
              { icon: Search, label: "Find Events", tab: "find_events", icon3d: "/calender3d.png" },
              { icon: Store, label: "My Stalls", tab: "my_stalls", icon3d: "/home3d.png" },
              { icon: ClipboardList, label: "My Pitches", tab: "my_pitches", icon3d: "/pitch3d.png" },
              { icon: Users, label: "Organizer Hub", tab: "organizers", icon3d: "/organizer3d.png" },
              { icon: UserCircle, label: "My Profile", tab: "profile", icon3d: "/profile3d.png" },
              { icon: Settings, label: "Settings", tab: "settings", icon3d: "/gear3d2.png", hideMobile: true },
            ].map((item, i) => {
              if (item.hideMobile) {
                return (
                  <button 
                    key={i} 
                    onClick={() => setActiveTab(item.tab as any)}
                    className={`hidden md:flex w-full items-center gap-4 px-3 md:px-4 py-3 rounded-2xl transition-all duration-300 group ${
                      activeTab === item.tab 
                        ? "bg-gradient-to-b from-black/10 to-black/5 dark:from-white/20 dark:to-white/5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white" 
                        : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.icon3d ? (
                      <img 
                        src={item.icon3d} 
                        className={`w-8 h-8 md:w-6 md:h-6 object-contain transition-all duration-300 ${
                          activeTab === item.tab 
                            ? 'scale-120 opacity-100 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)] drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] -translate-y-0.5' 
                            : 'opacity-75 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-0.5'
                        }`} 
                        alt={item.label}
                      />
                    ) : (
                      <item.icon className={`w-6 h-6 md:w-5 md:h-5 transition-all duration-300 ${
                        activeTab === item.tab 
                          ? 'text-rose-500 dark:text-rose-400 stroke-[2.25] scale-110 -translate-y-0.5 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                          : 'text-gray-500 dark:text-white/60 stroke-[2] group-hover:text-pink-500 dark:group-hover:text-pink-300 group-hover:scale-110 group-hover:-translate-y-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                      }`} />
                    )}
                    <span className="hidden md:block font-medium tracking-wide">{item.label}</span>
                  </button>
                );
              }
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(item.tab as any)}
                  className={`flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 group w-10 h-10 md:w-full md:h-auto px-0 md:px-4 md:py-3 shrink-0 ${
                    activeTab === item.tab 
                      ? "bg-gradient-to-b from-black/10 to-black/5 dark:from-white/20 dark:to-white/5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon3d ? (
                    <img 
                      src={item.icon3d} 
                      className={`w-7 h-7 md:w-6 md:h-6 object-contain transition-all duration-300 ${
                        activeTab === item.tab 
                          ? 'scale-125 opacity-100 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] -translate-y-1' 
                          : 'opacity-75 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] group-hover:opacity-100 group-hover:scale-115 group-hover:-translate-y-0.5'
                      }`} 
                      alt={item.label}
                    />
                  ) : (
                    <item.icon className={`w-5 h-5 md:w-5 md:h-5 transition-all duration-300 ${
                      activeTab === item.tab 
                        ? 'text-rose-500 dark:text-rose-400 stroke-[2.25] scale-115 -translate-y-0.5 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                        : 'text-gray-500 dark:text-white/60 stroke-[2] group-hover:text-pink-500 dark:group-hover:text-pink-300 group-hover:scale-115 group-hover:-translate-y-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                    }`} />
                  )}
                  <span className="hidden md:block font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
            
            <button 
              onClick={() => { setChatContext(null); setIsChatOpen(true); }}
              className={`flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 group w-10 h-10 md:w-full md:h-auto px-0 md:px-4 md:py-3 shrink-0 ${
                isChatOpen 
                  ? "bg-gradient-to-b from-black/10 to-black/5 dark:from-white/20 dark:to-white/5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white" 
                  : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <img 
                src="/message3d2.png" 
                className={`w-7 h-7 md:w-6 md:h-6 object-contain transition-all duration-300 ${
                  isChatOpen 
                    ? 'scale-125 opacity-100 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] -translate-y-1' 
                    : 'opacity-75 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] group-hover:opacity-100 group-hover:scale-115 group-hover:-translate-y-0.5'
                }`} 
                alt="Messages"
              />
              <span className="hidden md:block font-medium tracking-wide">Messages</span>
            </button>
          </nav>

          <div className="hidden md:block mt-auto pt-6 border-t border-gray-200 dark:border-white/10">
            <button 
              onClick={() => { 
                clearAuthCredentials();
                router.push("/auth"); 
              }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-300 group cursor-pointer"
            >
              <LogOut className="w-6 h-6 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:block font-medium tracking-wide">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="relative z-10 w-full flex-1 md:h-screen md:overflow-y-auto scrollbar-hide p-4 pt-2 pb-28 md:p-6 md:pt-6 md:pl-0">
        <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
          
           {activeTab === "find_events" && (
            <div className="w-full text-gray-900 dark:text-white p-2 sm:p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative z-10 pb-36">

              {/* ── Hero 2-col grid ──────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mt-6 md:mt-10 mb-10">

                {/* Left — Welcome & headline */}
                <div>
                  {/* Headline */}
                  <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.15] text-gray-900 dark:text-white">
                    Discover <br />
                    <span className="inline-block py-1">
                      <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 to-cyan-500 dark:from-pink-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-md py-1 pr-4 inline-block`}>
                        the best festivals
                      </span>
                    </span><br />
                    and secure your spot.
                  </h1>

                  {/* Subtext */}
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-4 sm:mt-6 max-w-md leading-relaxed">
                    Your central hub to find high-traffic events, pitch your stall to organizers, and secure the bag.
                  </p>
                </div>

                {/* Right — Horizontal Action Banner */}
                <div className="flex items-center justify-center pt-10 w-full h-full lg:min-h-[280px]">
                  <motion.button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full h-full min-h-[220px] md:min-h-[260px] flex flex-row items-center justify-between gap-6 p-8 md:p-10 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-black/10 dark:border-white/10 bg-gradient-to-br from-black/10 via-black/20 to-transparent dark:from-white/5 dark:via-white/10 dark:to-transparent backdrop-blur-xl hover:border-pink-500/50 hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] dark:hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-all duration-500 shadow-2xl focus:outline-none"
                  >
                    {/* Glowing backdrops */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-pink-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                    
                    {/* Cyber grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-40 pointer-events-none" />

                    <div className="flex flex-col items-start text-left z-10">
                      <span className={`${yellowtail.className} text-pink-500 dark:text-pink-400 text-2xl md:text-3xl mb-2 block animate-pulse`}>Ready to scale?</span>
                      <h2 className="text-white font-black text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight uppercase transition-transform duration-500 group-hover:scale-105 origin-left">
                        OPTIMIZE <span className={`${yellowtail.className} text-white text-4xl sm:text-5xl md:text-6xl normal-case font-normal inline-block mx-1 drop-shadow-md`}>Profile</span><br/>SETTINGS
                      </h2>
                      <div className="mt-4 flex items-center gap-2 text-sky-400 group-hover:text-sky-300 transition-colors duration-300">
                        <span className="text-xs font-bold uppercase tracking-widest">Go to settings</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>

                    <div className="relative shrink-0 z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
                      {/* Behind glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                      <motion.img 
                        src="/gear3d2.png" 
                        className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]" 
                        alt="Optimize Profile"
                        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* ── Event Grid ────────────────────────────── */}
              {(() => {
                const searchLower = eventSearchQuery.toLowerCase().trim();
                const searchedEvents = events.filter(e => 
                  e.name.toLowerCase().includes(searchLower) || 
                  (e.standard_stall_location && e.standard_stall_location.toLowerCase().includes(searchLower)) ||
                  (e.premium_stall_location && e.premium_stall_location.toLowerCase().includes(searchLower))
                );

                const getEventCategory = (e: EventData): string => {
                  if (e.category && e.category.trim() !== "") return e.category;
                  const name = (e.name || "").toLowerCase();
                  if (name.includes("food") || name.includes("flea") || name.includes("bazaar") || name.includes("eat")) return "Food & Flea";
                  if (name.includes("music") || name.includes("concert") || name.includes("dj") || name.includes("party")) return "Music & Concerts";
                  if (name.includes("tech") || name.includes("game") || name.includes("gaming") || name.includes("hack")) return "Tech & Gaming";
                  if (name.includes("expo") || name.includes("exhibition") || name.includes("trade") || name.includes("fair")) return "Exhibition & Trade";
                  if (name.includes("sport") || name.includes("run") || name.includes("fit") || name.includes("cricket")) return "Sports & Fitness";
                  if (name.includes("night") || name.includes("club") || name.includes("party") || name.includes("bash")) return "Nightlife & Parties";
                  return "College Fest";
                };

                const activeEvents = searchedEvents.filter(e => !isEventExpired(e.date));
                const pastEvents = searchedEvents.filter(e => isEventExpired(e.date));
                const filteredEvents = eventFilter === 'active' ? activeEvents : pastEvents;

                // Simple category list without emojis or extra badges
                const categoryList = [
                  { id: "all", label: "All" },
                  { id: "fast_filling", label: "Fast Filling" },
                  { id: "College Fest", label: "College Fest" },
                  { id: "Food & Flea", label: "Food & Flea" },
                  { id: "Music & Concerts", label: "Music & Concerts" },
                  { id: "Tech & Gaming", label: "Tech & Gaming" },
                  { id: "Exhibition & Trade", label: "Exhibition & Trade" },
                  { id: "Sports & Fitness", label: "Sports & Fitness" },
                  { id: "Nightlife & Parties", label: "Nightlife & Parties" },
                ];

                // Events matching selected category pill
                const categoryFilteredEvents = filteredEvents.filter((e) => {
                  if (selectedCategory === "all") return true;
                  if (selectedCategory === "fast_filling") return (e.total_stalls || 0) > 0;
                  return getEventCategory(e) === selectedCategory;
                });

                // Fast filling events
                const fastFillingEvents = activeEvents.filter((e) => (e.total_stalls || 0) > 0);

                // Categories to render vertically down the page
                const categoriesToDisplay = ["College Fest", "Food & Flea", "Tech & Gaming", "Music & Concerts", "Exhibition & Trade", "Sports & Fitness", "Nightlife & Parties"];

                return (
                  <div id="discover-events-section" className="max-w-7xl mx-auto mt-8 space-y-10">
                    
                    {/* Top Header: Search & Active/Past Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {eventFilter === 'active' ? 'Events' : 'Past Events'}
                      </h2>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search events..."
                            value={eventSearchQuery}
                            onChange={(e) => setEventSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 outline-none focus:border-pink-500 transition-all"
                          />
                        </div>
                        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setEventFilter('active')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${eventFilter === 'active' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          >
                            Active ({activeEvents.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventFilter('past')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${eventFilter === 'past' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                          >
                            Past ({pastEvents.length})
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Simple Category Filter Pills Bar ── */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
                      {categoryList.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                            selectedCategory === cat.id
                              ? "bg-pink-600 border-pink-500 text-white shadow-md"
                              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <UiverseLoader />
                        <p className="text-gray-400 font-medium text-sm mt-4">Loading events...</p>
                      </div>
                    ) : categoryFilteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <Ticket className="w-10 h-10 text-gray-500 mb-3" />
                        <p className="text-gray-400 font-medium text-sm">
                          No events found matching criteria.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        
                        {/* Featured 3D Slider */}
                        {selectedCategory === "all" && eventFilter === 'active' && (
                          <div className="w-full">
                            <EventAnimationSlider
                              events={filteredEvents}
                              onEventClick={(event) => {
                                setPricingPopupTarget(event);
                                setSelectedStall(null);
                                setBookingError(null);
                              }}
                            />
                          </div>
                        )}

                        {/* ── Fast Filling Section (Full-Cover Posters Stacked Vertically) ── */}
                        {(selectedCategory === "all" || selectedCategory === "fast_filling") && fastFillingEvents.length > 0 && eventFilter === 'active' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                Fast Filling
                              </h3>
                            </div>

                            {/* Horizontal Cards Row of Full Cover Posters */}
                            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                              {fastFillingEvents.map((event) => {
                                const { day, month } = parseEventDate(event.date);
                                return (
                                  <div
                                    key={"fast-" + event.id}
                                    onClick={() => {
                                      setPricingPopupTarget(event);
                                      setSelectedStall(null);
                                      setBookingError(null);
                                    }}
                                    className="relative flex-none w-[260px] sm:w-[280px] h-[380px] sm:h-[420px] rounded-[2.2rem] border border-white/10 overflow-hidden group cursor-pointer shadow-xl bg-zinc-950 snap-start flex flex-col justify-end"
                                  >
                                    {/* Full Cover Poster Image */}
                                    <img
                                      src={event.banner_url || (Array.isArray(event.image_urls) ? event.image_urls[0] : event.image_url) || "/default-banner.png"}
                                      alt={event.name}
                                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
                                    />

                                    {/* Bottom Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 z-10" />

                                    {/* Top Right: Date Badge (e.g. 31 JUL) */}
                                    <div className="absolute top-6 right-6 z-20 flex flex-col items-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                                      <span className="text-3xl sm:text-4xl font-black leading-none tracking-tighter">{day}</span>
                                      <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase mt-0.5 text-gray-200">{month}</span>
                                    </div>

                                    {/* Bottom Left: Event Title & Location Overlay */}
                                    <div className="relative z-20 p-6 text-left space-y-1">
                                      <h4 className="text-lg sm:text-xl font-black text-white leading-tight tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:text-pink-400 transition-colors duration-300 line-clamp-2">
                                        {event.name}
                                      </h4>
                                      <p className="text-xs font-bold text-gray-300 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] flex items-center gap-1.5 pt-0.5">
                                        <span className="inline-block w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                                        <span className="truncate">{event.standard_stall_location || "MAIN HALL"}</span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── Categorized Sections Stacked One Under Another ── */}
                        {categoriesToDisplay.map((catName) => {
                          const catEvents = filteredEvents.filter((e) => getEventCategory(e) === catName);
                          if (catEvents.length === 0 && selectedCategory !== "all" && selectedCategory !== catName) return null;
                          if (catEvents.length === 0) return null;

                          return (
                            <div key={catName} className="space-y-4">
                              {/* Simple category header title */}
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                  {catName}
                                </h3>
                              </div>

                              {/* Horizontal Cards Row of Full Cover Posters */}
                              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                                {catEvents.map((event) => {
                                  const { day, month } = parseEventDate(event.date);
                                  return (
                                    <div
                                      key={event.id}
                                      onClick={() => {
                                        setPricingPopupTarget(event);
                                        setSelectedStall(null);
                                        setBookingError(null);
                                      }}
                                      className="relative flex-none w-[260px] sm:w-[280px] h-[380px] sm:h-[420px] rounded-[2.2rem] border border-white/10 overflow-hidden group cursor-pointer shadow-xl bg-zinc-950 snap-start flex flex-col justify-end"
                                    >
                                      {/* Full Cover Poster Image */}
                                      <img
                                        src={event.banner_url || (Array.isArray(event.image_urls) ? event.image_urls[0] : event.image_url) || "/default-banner.png"}
                                        alt={event.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
                                      />

                                      {/* Bottom Gradient Overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300 z-10" />

                                      {/* Top Right: Date Badge (e.g. 31 JUL) */}
                                      <div className="absolute top-6 right-6 z-20 flex flex-col items-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                                        <span className="text-3xl sm:text-4xl font-black leading-none tracking-tighter">{day}</span>
                                        <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase mt-0.5 text-gray-200">{month}</span>
                                      </div>

                                      {/* Bottom Left: Event Title & Location Overlay */}
                                      <div className="relative z-20 p-6 text-left space-y-1">
                                        <h4 className="text-lg sm:text-xl font-black text-white leading-tight tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:text-pink-400 transition-colors duration-300 line-clamp-2">
                                          {event.name}
                                        </h4>
                                        <p className="text-xs font-bold text-gray-300 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] flex items-center gap-1.5 pt-0.5">
                                          <span className="inline-block w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                                          <span className="truncate">{event.standard_stall_location || "MAIN HALL"}</span>
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          )}

          {activeTab === "my_stalls" && (
            <div className="flex-1 rounded-2xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-4 md:p-8 text-gray-900 dark:text-white relative z-10">
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Store className="text-purple-400 w-8 h-8 animate-pulse" />
                  My Stalls
                </h2>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-gray-500 dark:text-white/60 font-medium text-lg mt-4">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.02] dark:bg-white/5">
                  <Store className="w-12 h-12 text-gray-400 dark:text-white/20 mb-4" />
                  <p className="text-gray-550 dark:text-white/60 font-medium text-lg">You haven't booked any stalls yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(bookings) && bookings.map((booking, index) => {
                    const eventObj = events.find(e => e.id === booking.event_id);
                    let size = "";
                    let location = "";
                    let isPremium = false;
                    if (eventObj) {
                      try {
                        const premiumIds = JSON.parse(eventObj.premium_stall_ids || '[]');
                        isPremium = premiumIds.includes(booking.stall_number);
                      } catch (e) {}
                      size = isPremium 
                        ? (eventObj.premium_stall_size || '12x12') 
                        : (eventObj.standard_stall_size || '10x10');
                      location = isPremium 
                        ? (eventObj.premium_stall_location || 'VIP Area') 
                        : (eventObj.standard_stall_location || 'Main Hall');
                    }
                    return (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                        className="group relative overflow-hidden rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md shadow-md dark:shadow-black/20 flex flex-col hover:shadow-purple-500/20 dark:hover:border-purple-500/30 transition-all duration-300"
                      >
                        {/* Animated gradient glow effect that appears on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-fuchsia-500/0 group-hover:from-purple-500/10 group-hover:via-indigo-500/10 group-hover:to-fuchsia-500/5 transition-colors duration-500 z-0" />
                        
                        {booking.image_url ? (
                          <SafeImage
                            src={booking.image_url}
                            alt={`Stall ${booking.stall_number}`}
                            aspectRatio="aspect-video"
                            maxWDesktop="md:max-w-md"
                            roundedClass="rounded-t-3xl"
                            fallbackIcon="store"
                          />
                        ) : (
                          <div className="w-full aspect-video md:max-w-md mx-auto bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex items-center justify-center relative overflow-hidden shrink-0 z-10 rounded-t-3xl">
                            {/* Grid background pattern */}
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                            <Store className="w-10 h-10 text-gray-400 dark:text-white/30 relative z-10 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300" />
                          </div>
                        )}
                        
                        <div className="p-5 flex flex-col flex-1 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Booked
                            </span>
                            {size && (
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isPremium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                {isPremium ? 'Premium' : 'Standard'} ({size})
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-purple-300 transition-all duration-300">
                            Stall #{booking.stall_number ?? 'N/A'}
                          </h3>
                          <p className="text-sm font-semibold mt-0.5 mb-1 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            {getEventName(booking.event_id)}
                          </p>
                          {location && (
                            <p className="text-xs text-gray-500 dark:text-white/50 mb-4 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-pink-400" /> {location}
                            </p>
                          )}
                          
                          <div className="border-t border-black/10 dark:border-white/10 mt-auto flex items-center gap-3 py-3">
                            <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm shrink-0">
                              {(booking.vendor_name || 'Vendor').charAt(0)}
                            </div>
                            <span className="text-gray-700 dark:text-white/70 text-sm font-medium truncate">{booking.vendor_name || 'Vendor'}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "my_pitches" && (
            <div className="flex-1 rounded-2xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-4 md:p-8 pb-10 text-gray-900 dark:text-white relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                    <ClipboardList className="w-7 h-7 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Pitches</h2>
                    <p className="text-gray-500 dark:text-white/50 mt-0.5">Track your stall applications and respond to counter-offers.</p>
                  </div>
                </div>
                <button
                  onClick={fetchMyPitches}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-gray-655 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-gray-500 dark:text-white/60 mt-4">Loading pitches...</p>
                </div>
              ) : myPitches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
                  <ClipboardList className="w-12 h-12 text-gray-400 dark:text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Pitches Yet</h3>
                  <p className="text-white/50 text-center max-w-sm">Browse events and pitch a stall to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myPitches.map((pitch) => {
                    const isCounter = pitch.status === 'Counter_Offered';
                    const isAccepted = pitch.status === 'Accepted';
                    const statusColor =
                      isAccepted ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                      : isCounter ? 'bg-blue-500/20 text-blue-650 dark:text-blue-300 border-blue-500/30'
                      : pitch.status === 'Rejected' ? 'bg-red-500/20 text-red-650 dark:text-red-350 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-605 dark:text-amber-300 border-amber-500/30';
                    return (
                      <div key={pitch.id} className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold">{pitch.event_name || `Event #${pitch.event_id}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${pitch.stall_type === 'Premium' ? 'bg-amber-500/20 text-amber-605 dark:text-amber-300' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'}`}>
                                {pitch.stall_type}
                              </span>
                              {pitch.stall_number && (
                                <span className="text-gray-400 dark:text-white/40 text-xs font-medium">Stall #{pitch.stall_number}</span>
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
                            <p className="text-2xl font-black text-gray-900 dark:text-white">₹{pitch.offered_price}</p>
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

                        {/* Payment action — vendor pays advance to lock stall if vendor_pays */}
                        {(() => {
                          const isAlreadyBooked = bookings.some(b => b.event_id === pitch.event_id && b.stall_number === pitch.stall_number && b.status === "Booked");
                          const isPendingApproval = bookings.some(b => b.event_id === pitch.event_id && b.stall_number === pitch.stall_number && b.status === "Pending Approval");
                          const advanceBooking = bookings.find(b => b.event_id === pitch.event_id && b.stall_number === pitch.stall_number && b.status === "Advance Paid" && b.vendor_id === myUserId);
                          
                          if (isAlreadyBooked) {
                            return (
                              <div className="border-t border-white/10 pt-4 space-y-2 mt-2">
                                <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30 flex items-center justify-center gap-2">
                                  <span>✅ Stall Booked & Paid!</span>
                                </div>
                              </div>
                            );
                          }
                          
                          if (isPendingApproval) {
                            return (
                              <div className="border-t border-white/10 pt-4 space-y-2 mt-2">
                                <div className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30 flex items-center justify-center gap-2">
                                  <span>⏳ Pending Admin Approval</span>
                                </div>
                              </div>
                            );
                          }

                          if (advanceBooking) {
                            const remaining = (advanceBooking.total_amount || 0) - (advanceBooking.amount_paid || 0);
                            return (
                              <div className="border-t border-white/10 pt-4 space-y-2 mt-2">
                                <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20 flex flex-col items-center justify-center p-2 gap-1">
                                  <span>✅ Stall Secured (Advance Paid: ₹{advanceBooking.amount_paid})</span>
                                  <span className="text-amber-400">Remaining Balance: ₹{remaining}</span>
                                </div>
                                <button
                                  onClick={() => handlePayAcceptedPitch(pitch)}
                                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 active:scale-[0.98] text-white text-sm font-bold shadow-[0_4px_12px_0_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Pay Remaining (₹{remaining})
                                </button>
                              </div>
                            );
                          }

                          return isAccepted && (!events.find(e => e.id === pitch.event_id)?.payment_model || events.find(e => e.id === pitch.event_id)?.payment_model === 'vendor_pays') && (
                            <div className="border-t border-white/10 pt-4 space-y-2 mt-2">
                              <p className="text-xs text-emerald-300 font-semibold">Pitch accepted! Secure your stall:</p>
                              <button
                                onClick={() => handlePayAcceptedPitch(pitch)}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-[0.98] text-white text-sm font-bold shadow-[0_4px_12px_0_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                Pay Full Amount
                              </button>
                            </div>
                          );
                        })()}

                        {/* Counter-offer action — vendor responds to organizer's counter */}
                        {isCounter && (
                          <div className="border-t border-white/10 pt-4 space-y-2">
                            <p className="text-xs text-blue-300 font-semibold">Organizer countered — respond:</p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  const headers = getHeaders();
                                  if (!headers) return;
                                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/${pitch.id}`, {
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
                                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/${pitch.id}`, {
                                    method: 'PUT',
                                    headers,
                                    body: JSON.stringify({ status: 'Pending', offered_price: parseFloat(newPrice) }),
                                  });
                                  fetchMyPitches();
                                }}
                                className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-bold border border-black/10 dark:border-white/10 transition-all"
                              >
                                Counter
                              </button>
                            </div>
                          </div>
                        )}

                        {isAccepted && (
                          <div className="border-t border-black/10 dark:border-white/10 pt-3">
                            <div className="flex items-center gap-2 text-emerald-605 dark:text-emerald-400 text-sm font-semibold">
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

          {activeTab === "organizers" && (
            <div className="flex-1 rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 pb-10 text-gray-900 dark:text-white relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                    <Users className="w-7 h-7 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Organizer Hub</h2>
                    <p className="text-gray-500 dark:text-white/50 mt-0.5">Search for event hosts, planners, and discover partnership opportunities.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchOrganizers(e.target.value)}
                    placeholder="Search organizers by username, host name, or specialization..."
                    className="w-full px-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner backdrop-blur-md text-base"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01]">
                    <Users className="w-12 h-12 text-gray-400 dark:text-white/10 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white/60 mb-1">
                      {searchQuery ? "No Results Found" : "Find Top Hosts"}
                    </h3>
                    <p className="text-gray-550 dark:text-white/40 text-sm max-w-sm text-center">
                      {searchQuery 
                        ? "We couldn't find any organizers matching your query." 
                        : "Type in a name or specialization category to find event hosts."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {searchResults.map((org) => (
                      <div 
                        key={org.id} 
                        onClick={() => router.push(`/profile?u=${org.username || org.id}`)}
                        className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-rose-500/50 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all flex flex-col justify-between cursor-pointer group shadow-lg hover:shadow-2xl"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] shrink-0">
                            {org.avatar_url ? (
                              <img 
                                src={getFullImageUrl(org.avatar_url)} 
                                alt={org.display_name} 
                                className="w-full h-full rounded-full object-cover border border-black/20"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-extrabold text-xl">
                                {org.display_name?.charAt(0) || "O"}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors truncate">{org.display_name}</h4>
                            <p className="text-gray-500 dark:text-white/40 text-xs truncate">@{org.username}</p>
                            {org.category && (
                              <span className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/20">
                                {org.category}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-white/60 text-xs mt-4 leading-relaxed line-clamp-2">
                          {org.bio || "No biography added yet."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Instagram-Style Creator Profile Tab ─────────────────── */}
          {activeTab === "profile" && (
            <div className="flex-1 p-4 md:p-8 flex flex-col gap-6 text-gray-900 dark:text-white relative z-10 max-w-4xl mx-auto w-full">
              {isProfileLoading && !vendorProfile ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-gray-500 dark:text-white/60 mt-4">Loading Profile...</p>
                </div>
              ) : (
                <>
                  {/* 1. Header Profile Container */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 pb-6">
                    {/* Left: Avatar with Story Border & Note */}
                    <div className="relative shrink-0 flex flex-col items-center">
                      <div className="relative group/avatar">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-[3px] shadow-xl relative overflow-hidden">
                          {vendorProfile?.avatar_url ? (
                            <Image 
                              src={getFullImageUrl(vendorProfile.avatar_url)} 
                              alt={vendorProfile.company_name || "Avatar"} 
                              fill
                              unoptimized
                              className="rounded-full object-cover border-2 border-white dark:border-black shadow-inner"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black border-2 border-white dark:border-black">
                              {vendorProfile?.company_name?.charAt(0) || "V"}
                            </div>
                          )}
                          
                          {/* Change DP Camera Overlay */}
                          <label className="absolute inset-0 rounded-full bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider gap-1 backdrop-blur-[2px]">
                            <UploadCloud className="w-6 h-6 text-pink-400" />
                            <span>Change Photo</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right: Username, Buttons, Inline Stats, Bio */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full">
                      {/* Row 1: Username & Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full justify-center md:justify-start">
                        {isEditingName ? (
                          <form 
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!editNameValue.trim()) return;
                              try {
                                const token = localStorage.getItem("token");
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ company_name: editNameValue })
                                });
                                if (res.ok) {
                                  setIsEditingName(false);
                                  if (myUserId) fetchMyProfile(myUserId);
                                }
                              } catch (err) {
                                console.error("Failed to save brand name", err);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <input 
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-rose-500 text-gray-900 dark:text-white outline-none text-base font-semibold"
                              autoFocus
                            />
                            <button type="submit" className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-all">Save</button>
                            <button type="button" onClick={() => setIsEditingName(false)} className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all">Cancel</button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
                              {vendorProfile?.username || vendorProfile?.company_name?.toLowerCase().replace(/\s+/g, '_') || "profile"}
                            </h2>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button 
                            onClick={() => setActiveTab("settings")}
                            className="px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-sm font-semibold transition-all cursor-pointer"
                          >
                            Edit profile
                          </button>
                          <button 
                            onClick={() => setActiveTab("settings")}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white transition-all cursor-pointer"
                            title="Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Dynamic Inline Text Stats */}
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm md:text-base py-1">
                        <span>
                          <strong className="font-semibold text-gray-900 dark:text-white">{vendorProfile?.media?.length || 0}</strong>{" "}
                          <span className="text-gray-600 dark:text-gray-300">posts</span>
                        </span>
                        <span>
                          <strong className="font-semibold text-gray-900 dark:text-white">{vendorProfile?.follower_count || 0}</strong>{" "}
                          <span className="text-gray-600 dark:text-gray-300">followers</span>
                        </span>
                        <span>
                          <strong className="font-semibold text-gray-900 dark:text-white">{vendorProfile?.total_likes || 0}</strong>{" "}
                          <span className="text-gray-600 dark:text-gray-300">likes</span>
                        </span>
                        {vendorProfile?.events_completed != null && (
                          <span>
                            <strong className="font-semibold text-gray-900 dark:text-white">{vendorProfile.events_completed}</strong>{" "}
                            <span className="text-gray-600 dark:text-gray-300">events completed</span>
                          </span>
                        )}
                        {vendorProfile?.stalls_booked != null && (
                          <span>
                            <strong className="font-semibold text-gray-900 dark:text-white">{vendorProfile.stalls_booked}</strong>{" "}
                            <span className="text-gray-600 dark:text-gray-300">stalls booked</span>
                          </span>
                        )}
                      </div>

                      {/* Row 3: Real User Bio & Details */}
                      <div className="text-xs md:text-sm text-gray-800 dark:text-gray-200 space-y-1">
                        {vendorProfile?.company_name && (
                          <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{vendorProfile.company_name}</p>
                        )}
                        {vendorProfile?.category && (
                          <p className="text-gray-500 dark:text-gray-400 font-medium">{vendorProfile.category}</p>
                        )}
                        <p className="whitespace-pre-line leading-relaxed max-w-lg">
                          {vendorProfile?.bio || "No biography added yet. Update your details in settings."}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {vendorProfile?.website_url && (
                            <a 
                              href={vendorProfile.website_url.startsWith("http") ? vendorProfile.website_url : `https://${vendorProfile.website_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {vendorProfile.website_url.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                          {vendorProfile?.instagram_url && (
                            <a 
                              href={vendorProfile.instagram_url.startsWith("http") ? vendorProfile.instagram_url : `https://instagram.com/${vendorProfile.instagram_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-pink-600 dark:text-pink-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                              @{vendorProfile.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Story Highlights Bar (New Upload Only) */}
                  <div className="py-4 border-t border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
                      {/* Plus Button Highlight for New Upload */}
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900/60 flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:border-pink-500 group-hover:text-pink-500 transition-all">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">New</span>
                        <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadFile(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Upload Banner if file selected */}
                    {uploadFile && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UploadCloud className="w-5 h-5 text-pink-500 animate-pulse" />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Ready to Post: {uploadFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Add to your gallery</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleMediaUpload}
                            disabled={isUploading}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow hover:opacity-90 transition-all flex items-center gap-1.5"
                          >
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post"}
                          </button>
                          <button
                            onClick={() => setUploadFile(null)}
                            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-zinc-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Content Navigation Tabs Bar */}
                  <div className="flex items-center justify-center gap-12 border-t border-gray-200 dark:border-zinc-800 text-xs font-semibold tracking-widest uppercase">
                    <button 
                      onClick={() => setActiveProfileTab("items")}
                      className={`py-3 flex items-center gap-2 border-t-2 -mt-[1px] transition-all cursor-pointer ${activeProfileTab === "items" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                    >
                      <Store className="w-4 h-4" />
                      <span>ITEMS SELLING</span>
                    </button>
                    <button 
                      onClick={() => setActiveProfileTab("posts")}
                      className={`py-3 flex items-center gap-2 border-t-2 -mt-[1px] transition-all cursor-pointer ${activeProfileTab === "posts" ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>POSTS</span>
                    </button>
                  </div>

                  {/* 4. Tab Content */}
                  {activeProfileTab === "items" ? (
                    (() => {
                      if (!vendorProfile?.items_selling) return null;
                      try {
                        const itemsList = JSON.parse(vendorProfile.items_selling);
                        if (!Array.isArray(itemsList) || itemsList.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/50">
                              <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-gray-900 dark:text-white" />
                              </div>
                              <p className="text-gray-900 dark:text-white text-xl font-bold">No Items Yet</p>
                              <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Add items you sell from the Settings tab.</p>
                            </div>
                          );
                        }
                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {itemsList.map((item: any, idx: number) => (
                              <div key={idx} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {item.image_url ? (
                                  <img src={getFullImageUrl(item.image_url)} alt={item.name} className="w-full aspect-square object-cover" />
                                ) : (
                                  <div className="w-full aspect-square bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm font-semibold">No Image</div>
                                )}
                                <div className="p-3 text-center">
                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</h4>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } catch(e) { return null; }
                    })()
                  ) : (
                    /* Instagram 3-Column Posts Feed Grid */
                    vendorProfile?.media?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/50">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white flex items-center justify-center mb-4">
                          <Instagram className="w-8 h-8 text-gray-900 dark:text-white" />
                        </div>
                        <p className="text-gray-900 dark:text-white text-xl font-bold">No Posts Yet</p>
                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Upload pictures or videos of your stalls using the + New button above.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {vendorProfile?.media?.map((post: any) => (
                          <div 
                            key={post.id}
                            onClick={() => setSelectedMedia(post)}
                            className="aspect-square relative overflow-hidden bg-zinc-900 cursor-pointer group shadow-sm rounded-sm md:rounded-md"
                          >
                            {post.media_type === "video" ? (
                              <video 
                                src={post.media_url} 
                                className="w-full h-full object-cover" 
                                muted 
                                playsInline 
                              />
                            ) : (
                              <SafeImage
                                src={post.media_url}
                                alt="Stall setup"
                                aspectRatio="aspect-square"
                                maxWDesktop=""
                                roundedClass="rounded-none"
                                className="transition-transform duration-300 group-hover:scale-105"
                                fallbackIcon="store"
                              />
                            )}

                            {/* Hover Overlay with Heart/Likes count */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold backdrop-blur-[1px]">
                              <Heart className="w-5 h-5 text-white fill-white" />
                              <span className="text-base tracking-wide">{post.like_count || 0}</span>
                            </div>
                            
                            {post.media_type === "video" && (
                              <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 p-2 md:p-6 pb-10 text-white relative z-10">
              {/* Settings Header */}
              <div className="mb-10 relative z-10">
                <div className="mb-2">
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-1.5">
                    <span>Profile</span>
                    <span className={`${yellowtail.className} text-4xl md:text-5xl font-normal normal-case text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-md px-1 inline-block`}>
                      Settings
                    </span>
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5">Update your public vendor profile details and contact links.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6 relative z-10">

                {/* Shop/Business Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <Building2 className="w-4 h-4 text-pink-400" />
                    Shop/Business Name
                  </label>
                  <input
                    id="vendor-company-name"
                    type="text"
                    value={profileData.company_name}
                    onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-pink-500/70 focus:ring-4 focus:ring-pink-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="Your company or brand name"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <UserCircle className="w-4 h-4 text-pink-400" />
                    Username
                  </label>
                  <input
                    id="vendor-username"
                    type="text"
                    value={profileData.username}
                    onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-pink-500/70 focus:ring-4 focus:ring-pink-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. shop_jane"
                  />
                </div>

                {/* Specialization / Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Specialization / Category
                  </label>
                  <input
                    id="vendor-category"
                    type="text"
                    value={profileData.category}
                    onChange={e => setProfileData({ ...profileData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-pink-500/70 focus:ring-4 focus:ring-pink-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. Gourmet Food, Handmade Crafts, Face Painting"
                  />
                </div>

                {/* Items Selling */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <List className="w-4 h-4 text-green-400" />
                    Items Selling
                  </label>
                  <div className="space-y-3">
                    {itemsList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        {item.image_url ? (
                           <img src={getFullImageUrl(item.image_url)} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                           <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white/50 text-xs text-center p-1 leading-tight">No Img</div>
                        )}
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => {
                            const val = e.target.value;
                            setItemsList(prev => {
                              const newItems = [...prev];
                              newItems[idx] = { ...newItems[idx], name: val };
                              return newItems;
                            });
                          }}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-green-500/70 text-sm"
                          placeholder="Item Name (e.g. Burger)"
                        />
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm text-white transition-colors shrink-0">
                          Image
                          <input type="file" className="hidden" accept="image/*" onChange={async e => {
                            if (!e.target.files?.[0]) return;
                            const file = e.target.files[0];
                            const fd = new FormData();
                            fd.append("file", file);
                            const token = localStorage.getItem("token");
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                                method: "POST",
                                headers: { "Authorization": `Bearer ${token}` },
                                body: fd
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setItemsList(prev => {
                                  const newItems = [...prev];
                                  if (newItems[idx]) {
                                    newItems[idx] = { ...newItems[idx], image_url: data.url };
                                  }
                                  return newItems;
                                });
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }} />
                        </label>
                        <button type="button" onClick={() => setItemsList(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg shrink-0">
                           <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setItemsList(prev => [...prev, {name: "", image_url: ""}])} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold">
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <FileText className="w-4 h-4 text-purple-400" />
                    Bio
                  </label>
                  <textarea
                    id="vendor-bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-pink-500/70 focus:ring-4 focus:ring-pink-500/15 transition-all shadow-inner backdrop-blur-md resize-none font-medium"
                    placeholder="Tell organizers about your brand and products..."
                  />
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
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
                      className="w-full pl-[7.5rem] pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-pink-500/70 focus:ring-4 focus:ring-pink-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Website URL
                  </label>
                  <input
                    id="vendor-website"
                    type="url"
                    value={profileData.website_url}
                    onChange={e => setProfileData({ ...profileData, website_url: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-cyan-500/70 focus:ring-4 focus:ring-cyan-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
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
                      className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      Profile saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Toast */}
                <AnimatePresence>
                  {saveError && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                      {saveError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  id="vendor-save-profile"
                  type="submit"
                  disabled={isSavingProfile}
                  className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    isSavingProfile
                      ? 'bg-pink-500/20 text-white/40 cursor-not-allowed border border-pink-500/10'
                      : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.35)] hover:shadow-[0_0_40px_rgba(236,72,153,0.55)] hover:scale-[1.01] active:scale-[0.98]'
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

      {/* Immersive Full-Screen Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="relative max-w-3xl w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col md:flex-row shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
              {/* Media viewer */}
              <div className="flex-1 bg-black aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center relative">
                {selectedMedia.media_type === "video" ? (
                  <video 
                    src={selectedMedia.media_url} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay 
                    loop 
                  />
                ) : (
                  <SafeImage
                    src={selectedMedia.media_url}
                    alt="Vendor visual media detail"
                    aspectRatio="aspect-auto h-full w-full"
                    maxWDesktop=""
                    roundedClass="rounded-none"
                    className="object-contain"
                    fallbackIcon="store"
                  />
                )}
              </div>

              {/* Media sidebar info / action */}
              <div className="w-full md:w-80 p-6 flex flex-col gap-6 justify-between border-t md:border-t-0 md:border-l border-white/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-black uppercase tracking-wider">
                      {selectedMedia.media_type} post
                    </span>
                    <button 
                      onClick={() => setSelectedMedia(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-white/50 text-xs mt-2">
                    <p>Uploaded: {new Date(selectedMedia.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart 
                        className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${
                          selectedMedia.is_liked_by_me ? "text-pink-500 fill-pink-500" : "text-white/50"
                        }`}
                        onClick={() => handleLikeMedia(selectedMedia.id)}
                      />
                      <span className="text-white font-extrabold text-lg">{selectedMedia.like_count} Likes</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteMedia(selectedMedia.id)}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Note Popup */}
      <AnimatePresence>
        {pricingPopupTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 p-6 md:p-8 relative text-center"
            >
              <div className="w-16 h-16 bg-fuchsia-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-fuchsia-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Note</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm md:text-base leading-relaxed">
                First month is free, then second month 100rs per stall.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setPricingPopupTarget(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(pricingPopupTarget);
                    setPricingPopupTarget(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white font-bold transition-all shadow-lg"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EVENT DETAILS MODAL (Vendor Side) */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl sm:rounded-[2.5rem] bg-[#0a0a0f] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Close button - Top Left like mobile back button */}
              <button 
                onClick={() => { setSelectedEvent(null); setSelectedStall(null); }}
                className="absolute top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
                {/* Hero Banner Section */}
                <div className="relative w-full aspect-video sm:h-80 shrink-0 bg-zinc-900 group">
                  <SafeImage
                    src={selectedEvent.banner_url || (getImageUrls(selectedEvent)[0])}
                    alt={selectedEvent.name}
                    aspectRatio="w-full h-full"
                    maxWDesktop="none"
                    roundedClass="rounded-none cursor-pointer group-hover:scale-105 transition-transform duration-700"
                    fallbackIcon="store"
                  />
                  <div 
                    onClick={() => setLightboxImage(selectedEvent.banner_url || (getImageUrls(selectedEvent)[0]))}
                    className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0f] cursor-pointer" 
                  />
                </div>

                {/* Content Section matching screenshot */}
                <div className="px-5 sm:px-10 -mt-8 relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 border border-pink-500/40 backdrop-blur-md uppercase shadow-lg">
                      ★ FESTOPIYA EVENT MATRIX
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-6 pr-4">
                    {selectedEvent.name}
                  </h2>
                  
                  {/* Meta Details exactly like screenshot */}
                  <div className="flex flex-col gap-5 bg-white/[0.02] border border-white/10 p-6 rounded-3xl mb-8 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10">
                        <CalendarDays className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Date & Time</p>
                        <p className="text-white font-bold">{selectedEvent.date}</p>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-white/5" />

                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Location</p>
                        <p className="text-white font-bold">{selectedEvent.standard_stall_location || "Venue TBD"}</p>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-white/5" />
                    
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10">
                        <User className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-0.5">Host</p>
                        <p className="text-white font-bold">Organizer</p>
                      </div>
                    </div>
                  </div>

                  {/* About the event */}
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-white mb-4">About the Event</h3>
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                       {selectedEvent.description || "Join us for an amazing event experience! Detailed description is pending from the organizer. Expect great stalls, entertainment, and a massive crowd!"}
                    </p>
                  </div>

                  {/* Photo Gallery Section */}
                  <div className="mb-10 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Event Gallery</h3>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/5 text-white/70 border border-white/10">
                        {getImageUrls(selectedEvent).length} Photos
                      </span>
                    </div>

                    {getImageUrls(selectedEvent).length > 0 ? (
                      <div 
                        ref={galleryRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                      >
                        {getImageUrls(selectedEvent).map((url: string, idx: number) => (
                          <div 
                            key={url + idx} 
                            onClick={() => { if (!dragMoved.current) setLightboxImage(url); }}
                            className="flex-none w-60 sm:w-72 aspect-video snap-start relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 hover:border-pink-500/50 transition-all cursor-pointer shadow-lg"
                          >
                            <SafeImage src={url} alt={`${selectedEvent.name} Gallery ${idx + 1}`} aspectRatio="w-full h-full" maxWDesktop="" roundedClass="rounded-none hover:scale-105 transition-transform duration-500" fallbackIcon="store" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-white/40 text-xs">
                        No extra gallery photos uploaded by the organizer.
                      </div>
                    )}
                  </div>

                  {/* Interactive Blueprint */}
                  <div className="mb-8 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-pink-400" />
                          Interactive Blueprint
                        </h3>
                        <p className="text-white/50 text-xs mt-1">Tap an available stall tile on the blueprint map to pitch your offer.</p>
                      </div>
                    </div>
                    
                    {/* Stall Map Grid Container */}
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-[inset_0_4px_30px_rgba(0,0,0,0.9)]">
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(236,72,153,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
                      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '7px 7px' }}></div>
                      
                      {/* Interactive Stall Nodes */}
                      {stalls.map((stall) => (
                        <motion.button
                          key={stall.id}
                          onClick={() => {
                            if (stall.status !== 'available') return;
                            setSelectedStall(stall.id);
                            const type = stall.isPremium ? 'Premium' : 'Standard';
                            setStallType(type);
                            setOfferedPrice(type === 'Premium' ? (selectedEvent?.premium_price?.toString() || '0') : (selectedEvent?.standard_price?.toString() || '0'));
                          }}
                          disabled={stall.status === 'booked'}
                          whileHover={stall.status === 'available' ? { scale: 1.08, zIndex: 30 } : {}}
                          whileTap={stall.status === 'available' ? { scale: 0.92 } : {}}
                          style={{ top: stall.top, left: stall.left }}
                          className={`absolute w-[15%] h-[15%] rounded-xl border flex flex-col items-center justify-center font-bold text-xs backdrop-blur-md transition-all duration-300 cursor-pointer shadow-lg
                            ${stall.status === 'booked' ? 'bg-red-950/40 border-red-900/60 text-red-700/50 opacity-40 cursor-not-allowed' : selectedStall === stall.id ? 'bg-rose-500/40 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.8)] z-30 scale-105' : stall.isPremium ? 'bg-amber-950/40 border-amber-500/70 text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]'}`}
                        >
                          <span className="font-extrabold">{stall.id}</span>
                          {stall.isPremium && stall.status !== 'booked' && selectedStall !== stall.id && <span className="text-[9px] leading-none text-amber-300 font-bold">★</span>}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-bold text-gray-400 uppercase">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Available</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Premium</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div>Selected</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-700 opacity-50"></div>Booked</div>
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="mb-6 pt-6 border-t border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">Event Rules</h3>
                    <div className="space-y-3">
                      {(() => {
                        const rules = [];
                        if (selectedEvent.payment_model === 'vendor_pays') rules.push("Vendors rent stall space and keep revenue.");
                        else if (selectedEvent.payment_model === 'organizer_pays') rules.push("Organizer pays vendor to provide items.");
                        if (String(selectedEvent.provides_infrastructure) === 'false') rules.push("Bare space only. Bring your own canopy/tables.");
                        else rules.push("Stall setup provided by organizer.");
                        rules.push("Setup must be completed 2 hours before event.");
                        return rules.map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm text-white/70">
                            <span className="text-pink-400 font-bold">✓</span>
                            <span>{rule}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                </div>
              </div>

              {/* Sticky Bottom Bar matching screenshot styling */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10 z-50">
                  {selectedStall ? (
                    <AnimatePresence mode="wait">
                      {!isBooked ? (
                        <motion.div key="booking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                          {bookingError && (
                            <div className="mb-3 flex items-start gap-2 p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <p>{bookingError}</p>
                            </div>
                          )}
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-widest">Entry Pass / Stall {selectedStall}</span>
                                <span className="text-xl sm:text-2xl font-black text-white">₹{offeredPrice}</span>
                              </div>
                              <button onClick={handleBookStall} disabled={isBookingLoading} className="px-6 py-3 rounded-2xl bg-white hover:bg-gray-200 active:scale-95 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                                {isBookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request to Book"}
                              </button>
                            </div>
                            
                            {/* Pitch UI integration inside Bottom Bar */}
                            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                               <input 
                                 type="number" 
                                 placeholder="Custom Price"
                                 className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-pink-500/50 transition-all font-medium text-sm"
                                 onChange={(e) => setOfferedPrice(e.target.value)}
                               />
                               <button 
                                 onClick={handlePitch} 
                                 disabled={isBookingLoading} 
                                 className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 font-bold text-sm hover:bg-pink-500/30 transition-all whitespace-nowrap active:scale-95"
                               >
                                 Pitch Offer
                               </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                              <div className="flex flex-col">
                                <span className="text-white font-bold">Request Sent!</span>
                                <span className="text-white/50 text-xs">Awaiting Organizer Approval.</span>
                              </div>
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <div className="w-full flex items-center justify-between opacity-50">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-widest">No Stall Selected</span>
                         <span className="text-xl sm:text-2xl font-black text-white">₹--</span>
                       </div>
                       <button disabled className="px-8 py-3.5 sm:px-12 rounded-2xl bg-white/20 text-white/50 font-black text-sm cursor-not-allowed">
                          Request to Book
                       </button>
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="Fullscreen Lightbox" 
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition-all shadow-lg hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
