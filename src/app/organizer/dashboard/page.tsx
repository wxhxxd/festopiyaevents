"use client";

import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import UiverseLoader from "@/components/UiverseLoader";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  MapPin, 
  Clock,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  AtSign,
  Globe,
  Building2,
  FileText,
  Save,
  Sparkles,
  CalendarPlus,
  LayoutGrid,
  Heart,
  Lock,
  Unlock,
  ExternalLink,
  Store,
  UserCircle,
  Trash2,
  UploadCloud,
  Search,
  Shield,
  CreditCard,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import React, { MouseEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ChatInterface, { ChatContext } from "@/components/ChatInterface";

const getFullImageUrl = (url?: string) => {
  if (!url) return "";
  
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
  let resolvedUrl = url;

  // 1. If relative path, prepend base URL
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    let baseUrl = configuredApiUrl;
    if (!baseUrl && typeof window !== "undefined") {
      baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    if (!baseUrl) {
      baseUrl = "http://localhost:5000";
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
      targetBase = `${window.location.protocol}//${window.location.hostname}:5000`;
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
  id: number;
  name: string;
  date: string;
  total_stalls: number;
  image_url?: string;
  image_urls?: string | string[];
  banner_url?: string;
  maps_url?: string;
  premium_stall_ids?: string;
  standard_price?: number;
  premium_price?: number;
  standard_stall_size?: string;
  premium_stall_size?: string;
  standard_stall_location?: string;
  premium_stall_location?: string;
  organizer_id?: number;
}

interface PitchData {
  id: number;
  event_id: number;
  vendor_id: number;
  stall_type: string;
  stall_number: number | null;
  offered_price: number;
  status: string;
  vendor_name?: string;
  event_name?: string;
}

const isEventExpired = (eventDateStr: string) => {
  if (!eventDateStr) return false;
  try {
    const cleanStr = eventDateStr.replace(/^[A-Za-z]+,\s*/, "");
    const parsedDate = Date.parse(cleanStr);
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

function EventCard({ event, onAction, isMine }: { event: EventData, onAction: (event: EventData, e: any) => void, isMine: boolean }) {
  // 3D Hover Effect setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
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

  const { day, month } = parseEventDate(event.date);

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => onAction(event, e)}
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

export default function OrganizerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [rawEventDate, setRawEventDate] = useState("");
  const [totalStalls, setTotalStalls] = useState("");
  const [standardPrice, setStandardPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [eventBanner, setEventBanner] = useState<File | null>(null);
  const [standardStallSize, setStandardStallSize] = useState("10x10");
  const [premiumStallSize, setPremiumStallSize] = useState("12x12");
  const [standardStallLocation, setStandardStallLocation] = useState("Main Hall");
  const [premiumStallLocation, setPremiumStallLocation] = useState("VIP Area");
  const [mapsUrl, setMapsUrl] = useState("");
  const [eventFilter, setEventFilter] = useState<'active' | 'past'>('active');
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [activeEventTab, setActiveEventTab] = useState<'mine' | 'explore'>('mine');
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventData | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [premiumStalls, setPremiumStalls] = useState<Set<number>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [selectedEventForBookings, setSelectedEventForBookings] = useState<EventData | null>(null);
  const [checkoutPitch, setCheckoutPitch] = useState<PitchData | null>(null);

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
  const [eventBookings, setEventBookings] = useState<any[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'vendors' | 'settings' | 'profile'>('events');

  // --- Profile / Settings State ---
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const fetchMyProfile = async (userId: number) => {
    setIsProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizerProfile(data);
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
        const uniqueFilename = `${myUserId || 'organizer'}_${Date.now()}_${uploadFile.name}`;
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

  // --- Vendor Hub Search States ---
  const [vendorHubSubTab, setVendorHubSubTab] = useState<'pitches' | 'search'>('pitches');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchVendors = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/users?role=Vendor&query=${encodeURIComponent(query)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Failed to search vendors", err);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Creator Profile States ---
  const [selectedVendorForProfile, setSelectedVendorForProfile] = useState<number | null>(null);
  const [vendorProfileData, setVendorProfileData] = useState<any>(null);
  const [isProfileModalLoading, setIsProfileModalLoading] = useState(false);
  const [selectedMediaDetail, setSelectedMediaDetail] = useState<any>(null);

  const handleOpenVendorProfile = async (vendorId: number) => {
    setSelectedVendorForProfile(vendorId);
    setIsProfileModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${vendorId}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendorProfileData(data);
      }
    } catch (err) {
      console.error("Failed to fetch vendor profile", err);
    } finally {
      setIsProfileModalLoading(false);
    }
  };

  const handleFollowVendor = async (vendorId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${vendorId}/follow`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendorProfileData((prev: any) => {
          if (!prev || prev.id !== vendorId) return prev;
          return {
            ...prev,
            is_followed_by_me: data.followed,
            follower_count: data.follower_count,
            badges: prev.badges.map((b: any) => {
              if (b.id === "most_lovable") {
                return {
                  ...b,
                  is_unlocked: data.follower_count >= 5 || prev.total_likes >= 5
                };
              }
              return b;
            })
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    }
  };

  const handleLikeVendorMedia = async (mediaId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${mediaId}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMediaDetail((prev: any) => {
          if (!prev || prev.id !== mediaId) return prev;
          return {
            ...prev,
            is_liked_by_me: data.liked,
            like_count: data.like_count
          };
        });
        if (selectedVendorForProfile) {
          const resProfile = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedVendorForProfile}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resProfile.ok) {
            const dataProfile = await resProfile.json();
            setVendorProfileData(dataProfile);
          }
        }
      }
    } catch (err) {
      console.error("Failed to like media", err);
    }
  };

  // --- Pitches State ---
  const [pitches, setPitches] = useState<PitchData[]>([]);
  const [isPitchesLoading, setIsPitchesLoading] = useState(false);
  const [counterInputs, setCounterInputs] = useState<Record<number, string>>({});

  // --- Settings State ---
  const [profileData, setProfileData] = useState({
    company_name: '',
    username: '',
    category: '',
    bio: '',
    instagram_url: '',
    website_url: '',
    display_name: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const settingsFetched = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/auth");
    } else {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      if (role) {
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;
      }
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

  const handleViewBookings = async (event: EventData, e: any) => {
    e.stopPropagation();
    setSelectedEventForBookings(event);
    setIsBookingsLoading(true);
    try {
      const headers = getHeaders();
      if (!headers) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${event.id}/bookings`, { headers });
      const data = await res.json();
      setEventBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const fetchEvents = () => {
    const headers = getHeaders();
    if (!headers) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`, { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log("Raw API Response:", data);
        setEvents(Array.isArray(data) ? data : (data.events || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch events", err);
        setLoading(false);
      });
  };

  const fetchAllEvents = () => {
    const headers = getHeaders();
    if (!headers) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/?all_events=true`, { headers })
      .then((res) => res.json())
      .then((data) => {
        console.log("Raw Explore/All Events API Response:", data);
        setAllEvents(Array.isArray(data) ? data : (data.events || []));
      })
      .catch((err) => {
        console.error("Failed to fetch all events", err);
      });
  };

  const handleEventAction = (event: EventData, e: any) => {
    const isMine = event.organizer_id === myUserId;
    if (isMine) {
      handleViewBookings(event, e);
    } else {
      e.stopPropagation();
      setSelectedEventDetails(event);
    }
  };

  const fetchPitches = async () => {
    setIsPitchesLoading(true);
    try {
      const headers = getHeaders();
      if (!headers) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/`, { headers });
      const data = await res.json();
      setPitches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pitches", err);
    } finally {
      setIsPitchesLoading(false);
    }
  };

  const handleUpdatePitch = async (pitchId: number, status: string, price?: number) => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const body: any = { status };
      if (price !== undefined) body.offered_price = price;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/${pitchId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchPitches();
        setCounterInputs(prev => { const n = { ...prev }; delete n[pitchId]; return n; });
      }
    } catch (err) {
      console.error('Failed to update pitch', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAllEvents();
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          setMyUserId(data.id);
          fetchMyProfile(data.id);
        })
        .catch(err => console.error("Failed to fetch user me", err));
    }
  }, []);

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
              // Current user is Organizer. Let's use first event.
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
                    vendorId: Number(chatUserId),
                    receiverId: Number(chatUserId),
                    title: chatUserName
                  });
                  setIsChatOpen(true);
                })
                .catch(() => {
                  setChatContext({
                    eventId: 0,
                    vendorId: Number(chatUserId),
                    receiverId: Number(chatUserId),
                    title: chatUserName
                  });
                  setIsChatOpen(true);
                });
              return;
            }
            setChatContext({
              eventId,
              vendorId: undefined, // target is organizer, so we don't pass vendorId
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
  }, [router]);

  // Re-fetch profile when profile tab is opened
  useEffect(() => {
    if (activeTab === 'profile' && myUserId) {
      fetchMyProfile(myUserId);
    }
  }, [activeTab, myUserId]);

  // Fetch pitches whenever the vendors tab is opened
  useEffect(() => {
    if (activeTab === 'vendors') fetchPitches();
  }, [activeTab]);

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
          bio: data.bio || '',
          instagram_url: data.instagram_url || '',
          website_url: data.website_url || '',
          display_name: data.display_name || '',
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
    setSaveError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
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

  const handleDateChange = (val: string) => {
    setRawEventDate(val);
    if (val) {
      const dateObj = new Date(val);
      const formatted = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setEventDate(formatted);
    } else {
      setEventDate("");
    }
  };

  const isStepValid = (step: number) => {
    if (step === 1) {
      return eventName.trim() !== "" && rawEventDate !== "";
    }
    if (step === 2) {
      const stallsNum = parseInt(totalStalls);
      return totalStalls.trim() !== "" && !isNaN(stallsNum) && stallsNum > 0;
    }
    if (step === 3) {
      return standardPrice.trim() !== "" && premiumPrice.trim() !== "";
    }
    if (step === 4) {
      return standardStallSize.trim() !== "" && standardStallLocation.trim() !== "" &&
             premiumStallSize.trim() !== "" && premiumStallLocation.trim() !== "";
    }
    if (step === 5) {
      return eventBanner !== null;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      if (isStepValid(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    if (!eventName || !eventDate || !totalStalls) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert('No token found');
      return;
    }

    console.log("Current Token:", token);

    setIsSubmitting(true);
    try {
      const headers = getHeaders();
      if (!headers) return;

      const fetchHeaders: any = { ...headers };
      delete fetchHeaders["Content-Type"];

      const formData = new FormData();
      formData.append('name', eventName);
      formData.append('date', eventDate);
      formData.append('total_stalls', totalStalls.toString());
      formData.append('standard_price', standardPrice.toString());
      formData.append('premium_price', premiumPrice.toString());
      formData.append('premium_stall_ids', JSON.stringify(Array.from(premiumStalls)));
      formData.append('standard_stall_size', standardStallSize);
      formData.append('premium_stall_size', premiumStallSize);
      formData.append('standard_stall_location', standardStallLocation);
      formData.append('premium_stall_location', premiumStallLocation);
      if (mapsUrl) {
        formData.append('maps_url', mapsUrl);
      }
      if (eventBanner) {
        formData.append('banner', eventBanner);
      }
      if (eventImages && eventImages.length > 0) {
        eventImages.forEach((img) => {
          formData.append('images', img);
        });
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/`, {
        method: "POST",
        headers: fetchHeaders,
        body: formData
      });
      
      if (!response.ok) {
        console.error('Status:', response.status, response.statusText);
        const errorData = await response.json().catch(() => null);
        console.error("Backend error creating event:", errorData);
        throw new Error(errorData?.detail || "Failed to create event");
      }
      
      // Clear form
      setEventName("");
      setEventDate("");
      setRawEventDate("");
      setTotalStalls("");
      setStandardPrice("");
      setPremiumPrice("");
      setEventImages([]);
      setEventBanner(null);
      setMapsUrl("");
      setPremiumStalls(new Set());
      setStandardStallSize("10x10");
      setPremiumStallSize("12x12");
      setStandardStallLocation("Main Hall");
      setPremiumStallLocation("VIP Area");
      
      // Show success
      setSuccessMsg(true);
      fetchEvents(); // Instantly refresh grid behind the success modal
      setTimeout(() => {
        setSuccessMsg(false);
        setIsModalOpen(false);
      }, 1500);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-white font-sans flex flex-col md:flex-row transition-colors duration-300">
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
                ? "border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
            }`}
          >
            {organizerProfile?.avatar_url ? (
              <img 
                src={getFullImageUrl(organizerProfile.avatar_url)} 
                alt="Profile" 
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <UserCircle className="w-full h-full text-gray-400 dark:text-white/50" />
            )}
          </button>
          <button 
            onClick={() => { 
              localStorage.removeItem("token"); 
              localStorage.removeItem("company_name"); 
              localStorage.removeItem("role"); 
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              router.push("/auth"); 
            }}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/15 text-gray-500 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 transition-all flex items-center justify-center cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar - Glassmorphism */}
      <aside className="fixed bottom-6 left-4 right-4 h-16 z-50 p-0 md:relative md:bottom-auto md:left-auto md:right-auto md:w-64 md:h-screen md:p-6 flex flex-row md:flex-col transition-all duration-300">
        <div className="flex-1 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start rounded-full md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/20 bg-gray-50/50 dark:bg-white/10 md:bg-gray-50/30 md:dark:bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] px-4 py-2 md:py-8 md:px-4 overflow-x-auto md:overflow-hidden scrollbar-hide">
          <div className="hidden md:flex items-center justify-start gap-3 px-2 mb-10">
            <img src="/logo.png" alt="Festopiya Logo" className="h-6 w-auto mr-2 shrink-0" />
            <FestopiyaBranding className="text-2xl" />
          </div>

          <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start w-full md:w-auto md:flex-1 gap-1.5 md:gap-2 flex-nowrap md:space-y-2">
            {[
              { icon: CalendarDays, label: "Events", tab: "events", icon3d: "/calender3d.png" },
              { icon: Users, label: "Vendor Hub", tab: "vendors", icon3d: "/profile3d.png" },
              { icon: UserCircle, label: "My Profile", tab: "profile", icon3d: "/profile3d.png", hideMobile: true },
              { icon: Settings, label: "Settings", tab: "settings", icon3d: "/gear3d2.png" },
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
                          ? 'text-indigo-500 dark:text-indigo-400 stroke-[2.25] scale-110 -translate-y-0.5 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]' 
                          : 'text-gray-500 dark:text-white/60 stroke-[2] group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400 group-hover:scale-110 group-hover:-translate-y-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
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
                        ? 'text-indigo-500 dark:text-indigo-400 stroke-[2.25] scale-115 -translate-y-0.5 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]' 
                        : 'text-gray-500 dark:text-white/60 stroke-[2] group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400 group-hover:scale-115 group-hover:-translate-y-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
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
                localStorage.removeItem("token"); 
                localStorage.removeItem("company_name"); 
                localStorage.removeItem("role"); 
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          
          {activeTab === 'events' && (
            <div className="min-h-screen text-gray-900 dark:text-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative z-10">

              {/* ── Hero 2-col grid ──────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mt-10">

                {/* Left — Welcome & headline */}
                <div>
                  {/* Headline */}
                  <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
                    Manage <br />
                    <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 to-cyan-500 dark:from-pink-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-md`}>
                      your festivals
                    </span><br />
                    like a pro.
                  </h1>

                  {/* Subtext */}
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-6 max-w-md leading-relaxed">
                    Your central hub to launch new events, review vendor pitches, and lock in deals.
                  </p>
                </div>

                {/* Right — Horizontal Action Banner */}
                <div className="flex items-center justify-center pt-10 w-full h-full lg:min-h-[280px]">
                  <motion.button
                    type="button"
                    onClick={() => { setIsModalOpen(true); setCurrentStep(1); }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full h-full min-h-[220px] md:min-h-[260px] flex flex-row items-center justify-between gap-6 p-8 md:p-10 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-black/10 dark:border-white/10 bg-gradient-to-br from-black/10 via-black/20 to-transparent dark:from-white/5 dark:via-white/10 dark:to-transparent backdrop-blur-xl hover:border-pink-500/50 hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] dark:hover:shadow-[0_0_50px_rgba(236,72,153,0.5)] transition-all duration-500 shadow-2xl focus:outline-none"
                  >
                    {/* Glowing backdrops */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-pink-500/20 via-purple-500/10 to-cyan-500/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                    
                    {/* Cyber grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-40 pointer-events-none" />

                    <div className="flex flex-col items-start text-left z-10">
                      <span className={`${yellowtail.className} text-pink-500 dark:text-pink-400 text-2xl md:text-3xl mb-2 block animate-pulse`}>Ready to launch?</span>
                      <h2 className="text-white font-black text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight uppercase transition-transform duration-500 group-hover:scale-105 origin-left">
                        CREATE <span className={`${yellowtail.className} text-white text-4xl sm:text-5xl md:text-6xl normal-case font-normal inline-block mx-1 drop-shadow-md`}>New</span><br/>EVENT
                      </h2>
                      <div className="mt-4 flex items-center gap-2 text-sky-400 group-hover:text-sky-300 transition-colors duration-300">
                        <span className="text-xs font-bold uppercase tracking-widest">Start setting up</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>

                    <div className="relative shrink-0 z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
                      {/* Behind glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                      <motion.img 
                        src="/calender3d.png" 
                        className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]" 
                        alt="Calendar"
                        animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.button>
                </div>
              </div>

            {/* ── Event Grid ────────────────────────────── */}
            {(() => {
                const currentEventsList = activeEventTab === 'mine' ? events : allEvents;
                const searchLower = eventSearchQuery.toLowerCase().trim();
                const searchedEvents = currentEventsList.filter(e => 
                  e.name.toLowerCase().includes(searchLower) || 
                  (e.standard_stall_location && e.standard_stall_location.toLowerCase().includes(searchLower)) ||
                  (e.premium_stall_location && e.premium_stall_location.toLowerCase().includes(searchLower))
                );

                const activeEvents = searchedEvents.filter(e => !isEventExpired(e.date));
                const pastEvents = searchedEvents.filter(e => isEventExpired(e.date));
                const filteredEvents = eventFilter === 'active' ? activeEvents : pastEvents;
                return (
                  <div id="current-events-section" className="max-w-7xl mx-auto mt-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-black/10 dark:border-white/10 pb-6">
                      <div className="space-y-4">
                        <div className="flex bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-1 max-w-sm shrink-0">
                          <button
                            type="button"
                            onClick={() => { setActiveEventTab('mine'); setEventSearchQuery(""); }}
                            className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeEventTab === 'mine' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-555 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            Your Events
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveEventTab('explore'); fetchAllEvents(); setEventSearchQuery(""); }}
                            className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeEventTab === 'explore' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-555 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            Explore Live Events
                          </button>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <Clock className="text-pink-400 w-7 h-7" />
                          {eventFilter === 'active' ? 'Active Events' : 'Past Events'}
                        </h2>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search events by name..."
                            value={eventSearchQuery}
                            onChange={(e) => setEventSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="flex bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-1 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setEventFilter('active')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventFilter === 'active' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-555 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            Active ({activeEvents.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventFilter('past')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${eventFilter === 'past' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-555 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            Past ({pastEvents.length})
                          </button>
                        </div>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <UiverseLoader />
                        <p className="text-gray-500 dark:text-white/60 font-medium text-lg mt-4">Loading events from database...</p>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
                        <CalendarDays className="w-12 h-12 text-gray-400 dark:text-white/20 mb-4" />
                        <p className="text-gray-550 dark:text-white/60 font-medium text-lg">
                          {eventFilter === 'active' 
                            ? (activeEventTab === 'mine' ? 'No active events found. Create your first one!' : 'No active explore events found.')
                            : 'No past events found.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        {filteredEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                          >
                            <EventCard event={event} onAction={handleEventAction} isMine={event.organizer_id === myUserId} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="flex-1 rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-6 md:p-8 pb-10 text-gray-900 dark:text-white relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/20">
                    <Users className="w-7 h-7 text-fuchsia-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Hub</h2>
                    <p className="text-gray-500 dark:text-white/50 mt-0.5">Review incoming stall pitches and find top creators.</p>
                  </div>
                </div>
                {vendorHubSubTab === 'pitches' && (
                  <button
                    onClick={fetchPitches}
                    className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-gray-655 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" /> Refresh
                  </button>
                )}
              </div>

              {/* Sub Navigation */}
              <div className="flex border-b border-black/10 dark:border-white/10 mb-8 gap-6">
                <button
                  onClick={() => setVendorHubSubTab('pitches')}
                  className={`pb-4 text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    vendorHubSubTab === 'pitches' 
                      ? 'border-fuchsia-500 text-fuchsia-500 dark:text-fuchsia-400' 
                      : 'border-transparent text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Incoming Pitches
                </button>
                <button
                  onClick={() => setVendorHubSubTab('search')}
                  className={`pb-4 text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    vendorHubSubTab === 'search' 
                      ? 'border-fuchsia-500 text-fuchsia-500 dark:text-fuchsia-400' 
                      : 'border-transparent text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Search Vendors
                </button>
              </div>

              {vendorHubSubTab === 'pitches' && (
                <>

              {isPitchesLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-gray-550 dark:text-white/60 mt-4">Loading pitches...</p>
                </div>
              ) : pitches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
                  <MessageSquare className="w-12 h-12 text-gray-400 dark:text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Pitches Yet</h3>
                  <p className="text-gray-550 dark:text-white/50 text-center max-w-sm">Vendor pitches for your events will appear here. Share your events so vendors can apply!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {pitches.map((pitch) => {
                    const statusColor =
                      pitch.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                      : pitch.status === 'Counter_Offered' ? 'bg-blue-500/20 text-blue-650 dark:text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-605 dark:text-amber-300 border-amber-500/30';
                    return (
                      <div key={pitch.id} className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex items-center gap-3 cursor-pointer group/vendor"
                            onClick={() => handleOpenVendorProfile(pitch.vendor_id)}
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-650 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-500/20 group-hover/vendor:border-fuchsia-500/50 group-hover/vendor:bg-fuchsia-500/10 group-hover/vendor:text-fuchsia-300 transition-all">
                              {(pitch.vendor_name || 'V').charAt(0)}
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-semibold leading-tight group-hover/vendor:text-transparent group-hover/vendor:bg-clip-text group-hover/vendor:bg-gradient-to-r group-hover/vendor:from-indigo-600 group-hover/vendor:to-fuchsia-600 dark:group-hover/vendor:from-indigo-300 dark:group-hover/vendor:to-fuchsia-300 transition-all">{pitch.vendor_name || `Vendor #${pitch.vendor_id}`}</p>
                              <p className="text-gray-400 dark:text-white/40 text-xs">{pitch.event_name || `Event #${pitch.event_id}`}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
                            {pitch.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Pitch details */}
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${pitch.stall_type === 'Premium' ? 'bg-amber-500/20 text-amber-605 dark:text-amber-300' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'}`}>
                                {pitch.stall_type}
                              </span>
                              {pitch.stall_number && (
                                <span className="text-gray-400 dark:text-white/40 text-xs font-medium">Stall #{pitch.stall_number}</span>
                              )}
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">₹{pitch.offered_price}</p>
                          </div>
                          <button
                            onClick={() => {
                              setChatContext({
                                eventId: pitch.event_id,
                                vendorId: pitch.vendor_id,
                                receiverId: pitch.vendor_id,
                                title: `${pitch.vendor_name || 'Vendor'} (${pitch.event_name || 'Event'})`
                              });
                              setIsChatOpen(true);
                            }}
                            className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Message Vendor"
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          </button>
                        </div>

                        {/* Actions — only if not yet accepted */}
                        {pitch.status !== 'Accepted' && (
                          <div className="border-t border-white/10 pt-4 space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Counter ₹"
                                value={counterInputs[pitch.id] || ''}
                                onChange={e => setCounterInputs(prev => ({ ...prev, [pitch.id]: e.target.value }))}
                                className="flex-1 px-3 py-2 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 text-sm outline-none focus:border-indigo-500/50 transition-all"
                              />
                              <button
                                disabled={!counterInputs[pitch.id]}
                                onClick={() => handleUpdatePitch(pitch.id, 'Counter_Offered', parseFloat(counterInputs[pitch.id]))}
                                className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-300 text-sm font-semibold border border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                Counter
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setCheckoutPitch(pitch)}
                                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-sm font-bold border border-emerald-500/30 transition-all"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleUpdatePitch(pitch.id, 'Rejected')}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 text-sm font-bold border border-red-500/20 transition-all"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {pitch.status === 'Accepted' && (
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
                </>
              )}

              {vendorHubSubTab === 'search' && (
                <div className="space-y-6">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchVendors(e.target.value)}
                      placeholder="Search vendors by stall name, food types (e.g., Mojitos, loaded chips), or category..."
                      className="w-full px-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-fuchsia-500/60 focus:ring-2 focus:ring-fuchsia-500/20 transition-all shadow-inner backdrop-blur-md text-base"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-fuchsia-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01]">
                      <Users className="w-12 h-12 text-gray-300 dark:text-white/20 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white/60 mb-1">
                        {searchQuery ? "No Results Found" : "Find Top Creators"}
                      </h3>
                      <p className="text-gray-500 dark:text-white/40 text-sm max-w-sm text-center">
                        {searchQuery 
                          ? "We couldn't find any vendors matching your query." 
                          : "Type in a name or specialization category to find creators for your events."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {searchResults.map((v) => (
                        <div 
                          key={v.id} 
                          onClick={() => router.push(`/profile/${v.username}`)}
                          className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-fuchsia-500/50 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] transition-all flex flex-col justify-between cursor-pointer group shadow-lg hover:shadow-2xl"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-[2px] shrink-0">
                              {v.avatar_url ? (
                                <img 
                                  src={getFullImageUrl(v.avatar_url)} 
                                  alt={v.display_name} 
                                  className="w-full h-full rounded-full object-cover border border-black/20"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-extrabold text-xl">
                                  {v.display_name?.charAt(0) || "V"}
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-300 transition-colors truncate">{v.display_name}</h4>
                              <p className="text-gray-500 dark:text-white/40 text-xs truncate">@{v.username}</p>
                              {v.category && (
                                <span className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 text-[10px] font-black uppercase tracking-wider border border-fuchsia-500/20">
                                  {v.category}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-white/60 text-xs mt-4 leading-relaxed line-clamp-2">
                            {v.bio || "No biography added yet."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {activeTab === 'profile' && (
            <div className="flex-1 rounded-2xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-4 md:p-8 pb-10 flex flex-col gap-8 text-gray-900 dark:text-white relative z-10">
              {isProfileLoading && !organizerProfile ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-white/60 mt-4">Loading Profile...</p>
                </div>
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/10">
                    <div className="relative shrink-0 group/avatar">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 p-[3px] relative overflow-hidden">
                        {organizerProfile?.avatar_url ? (
                          <img 
                            src={getFullImageUrl(organizerProfile.avatar_url)} 
                            alt={organizerProfile.display_name} 
                            className="w-full h-full rounded-full object-cover border border-black/40 shadow-inner"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black shadow-inner border border-black/40">
                            {organizerProfile?.display_name?.charAt(0) || "O"}
                          </div>
                        )}
                        
                        {/* Change DP Camera/Upload Overlay */}
                        <label className="absolute inset-0 rounded-full bg-black/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase tracking-wider gap-1.5 backdrop-blur-[1px]">
                          <UploadCloud className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <span>Change DP</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <span className="absolute bottom-1 right-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-indigo-500 text-white border-2 border-black tracking-wide shadow-md pointer-events-none">
                        Organizer
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                      <div>
                        <div className="flex flex-col md:flex-row items-center gap-3">
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
                                  console.error("Failed to save organization name", err);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <input 
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-indigo-500/40 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold"
                                autoFocus
                              />
                              <button type="submit" className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30 transition-all">Save</button>
                              <button type="button" onClick={() => setIsEditingName(false)} className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/50 border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-all">Cancel</button>
                            </form>
                          ) : (
                            <>
                              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{organizerProfile?.display_name || "Organizer Name"}</h2>
                              <button 
                                onClick={() => {
                                  setEditNameValue(organizerProfile?.display_name || "");
                                  setIsEditingName(true);
                                }}
                                className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white border border-black/10 dark:border-white/10 transition-all"
                              >
                                Edit Name
                              </button>
                            </>
                          )}
                          <div className="flex gap-2">
                            {organizerProfile?.instagram_url && (
                              <a 
                                href={organizerProfile.instagram_url.startsWith("http") ? organizerProfile.instagram_url : `https://instagram.com/${organizerProfile.instagram_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-pink-500/10 text-gray-500 dark:text-white/60 hover:text-pink-400 border border-black/10 dark:border-white/10 hover:border-pink-500/30 transition-all"
                              >
                                <AtSign className="w-4 h-4" />
                              </a>
                            )}
                            {organizerProfile?.website_url && (
                              <a 
                                href={organizerProfile.website_url.startsWith("http") ? organizerProfile.website_url : `https://${organizerProfile.website_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-indigo-500/10 text-gray-500 dark:text-white/60 hover:text-indigo-400 border border-black/10 dark:border-white/10 hover:border-indigo-500/30 transition-all"
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 dark:text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
                          {organizerProfile?.bio || "No biography added yet. Optimize your profile details inside the settings tab!"}
                        </p>
                      </div>

                      {/* Stats Section / Events created */}
                      <div className="flex gap-6 mt-2">
                        <div className="px-5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md text-center">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                            {organizerProfile?.events?.length || 0}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest mt-0.5">Events Created</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Feed Gallery Grid / Media Upload */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
                    {/* Drag-and-Drop Media Upload Zone */}
                    <form onSubmit={handleMediaUpload} className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center">
                      <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <UploadCloud className="w-8 h-8 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Add Showcase Images</h4>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-1">Upload pictures or setup views of your events</p>
                      </div>
                      
                      <div className="w-full max-w-xs relative">
                        <input 
                          type="file" 
                          id="organizer-media-file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setUploadFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label 
                          htmlFor="organizer-media-file"
                          className="w-full py-3 px-4 rounded-xl border border-black/10 dark:border-white/10 hover:border-indigo-500/30 bg-black/5 dark:bg-black/40 hover:bg-black/10 dark:hover:bg-black/60 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          {uploadFile ? uploadFile.name : "Select Image File"}
                        </label>
                      </div>

                      {uploadFile && (
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload to Gallery"}
                        </button>
                      )}
                    </form>

                    {/* 3-Column Instagram-Style Media Feed Grid */}
                    <div className="space-y-4">
                      <p className="text-xs font-black text-gray-550 dark:text-white/40 uppercase tracking-widest pl-1">Gallery Showcase Feed</p>
                      
                      {organizerProfile?.media?.length === 0 ? (
                        <div className="py-12 border border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01] flex flex-col items-center justify-center text-center">
                          <Store className="w-10 h-10 text-gray-300 dark:text-white/15 mb-3" />
                          <p className="text-gray-400 dark:text-white/30 text-xs">No media uploaded yet. Start sharing event setups!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {organizerProfile?.media?.map((post: any) => (
                            <div 
                              key={post.id} 
                              onClick={() => setSelectedMedia(post)}
                              className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black relative group cursor-pointer hover:border-indigo-500/50 transition-all"
                            >
                              <img 
                                src={getFullImageUrl(post.media_url)} 
                                alt="Showcase" 
                                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-all duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 rounded-[2.5rem] border border-white/15 bg-[#0a0a0f]/90 backdrop-blur-3xl p-6 md:p-10 pb-10 text-white relative z-10 overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.15)]">
              {/* Ambient Glows */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Settings Header */}
              <div className="mb-10 relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                    <Settings className="w-7 h-7 text-indigo-400 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-1.5">
                      <span>Profile</span>
                      <span className={`${yellowtail.className} text-4xl md:text-5xl font-normal normal-case text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-md px-1 inline-block`}>
                        Settings
                      </span>
                    </h2>
                    <p className="text-white/60 text-sm mt-0.5">Update your public organizer profile details and event parameters.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6 relative z-10">

                {/* Event Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <CalendarDays className="w-4 h-4 text-indigo-400" />
                    Primary Event Name
                  </label>
                  <input
                    id="organizer-event-name"
                    type="text"
                    value={profileData.display_name}
                    onChange={e => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. Festopiya Carnival 2026"
                  />
                </div>

                {/* College/Organization */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    College / Organization
                  </label>
                  <input
                    id="organizer-company-name"
                    type="text"
                    value={profileData.company_name}
                    onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. Teegala Krishna Reddy Engineering College (TKREC)"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <UserCircle className="w-4 h-4 text-indigo-400" />
                    Username
                  </label>
                  <input
                    id="organizer-username"
                    type="text"
                    value={profileData.username}
                    onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. host_john"
                  />
                </div>

                {/* Expected Crowd */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Expected Crowd
                  </label>
                  <input
                    id="organizer-category"
                    type="text"
                    value={profileData.category}
                    onChange={e => setProfileData({ ...profileData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-indigo-500/70 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-inner backdrop-blur-md font-medium"
                    placeholder="e.g. 5,000+ students, 10k+ foot traffic"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 pl-1">
                    <FileText className="w-4 h-4 text-purple-400" />
                    Bio
                  </label>
                  <textarea
                    id="organizer-bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder:text-white/25 outline-none focus:border-purple-500/70 focus:ring-4 focus:ring-purple-500/15 transition-all shadow-inner backdrop-blur-md resize-none font-medium"
                    placeholder="Tell vendors about your college fests, theme, and crowd demographics..."
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
                      id="organizer-instagram"
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
                    id="organizer-website"
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
                  id="organizer-save-profile"
                  type="submit"
                  disabled={isSavingProfile}
                  className={`w-full py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    isSavingProfile
                      ? 'bg-indigo-500/20 text-white/40 cursor-not-allowed border border-indigo-500/10'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.55)] hover:scale-[1.01] active:scale-[0.98]'
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

              {/* View Bookings Modal */}
              <AnimatePresence>
                {selectedEventForBookings && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 20, opacity: 0 }}
                      className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/15 bg-[#0a0a0f]/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(99,102,241,0.25)] flex flex-col scrollbar-hide"
                    >
                      {/* Floating ambient glow spots */}
                      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                      {/* Close button - Fixed top-right z-50 to never overlap text */}
                      <button 
                        onClick={() => setSelectedEventForBookings(null)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-indigo-500/20 border border-white/20 hover:border-indigo-500/50 text-white/70 hover:text-white transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <X className="w-6 h-6" />
                      </button>

                      {/* Hero Banner Section */}
                      <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden bg-black/50 border-b border-white/10 shrink-0 group">
                        <SafeImage
                          src={selectedEventForBookings.banner_url || (getImageUrls(selectedEventForBookings)[0])}
                          alt={selectedEventForBookings.name}
                          aspectRatio="w-full h-full"
                          maxWDesktop="none"
                          roundedClass="rounded-none group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                          fallbackIcon="store"
                        />
                        <div 
                          onClick={() => setLightboxImage(selectedEventForBookings.banner_url || (getImageUrls(selectedEventForBookings)[0]))}
                          className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-black/40 cursor-pointer" 
                        />
                        
                        {/* Event Header Overlay */}
                        <div className="absolute bottom-6 left-6 sm:left-8 right-16 sm:right-20 z-20 pointer-events-none">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 text-[11px] font-bold tracking-wider rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/40 backdrop-blur-md uppercase shadow-lg">
                              ★ ORGANIZER MANAGEMENT HUB
                            </span>
                            <span className="px-3 py-1 text-[11px] font-semibold tracking-wider rounded-full bg-white/10 text-white/80 border border-white/15 backdrop-blur-md uppercase">
                              {selectedEventForBookings.total_stalls || 0} Total Stalls
                            </span>
                          </div>

                          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-xl break-words pr-4">
                            {selectedEventForBookings.name}
                          </h2>

                          {/* Metadata Chips */}
                          <div className="flex flex-wrap items-center gap-3 mt-4 text-white/80 text-xs sm:text-sm pointer-events-auto">
                            <div className="flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-md">
                              <CalendarDays className="w-4 h-4 text-indigo-400 animate-pulse" />
                              <span className="font-semibold text-white">{selectedEventForBookings.date}</span>
                            </div>

                            {selectedEventForBookings.maps_url ? (
                              <a 
                                href={selectedEventForBookings.maps_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-500/30 hover:to-blue-500/30 border border-indigo-500/40 text-indigo-300 px-3.5 py-1.5 rounded-xl backdrop-blur-md transition-all duration-300 font-semibold shadow-md hover:scale-105"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                <span>View Live Map ↗</span>
                              </a>
                            ) : (
                              <div className="flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-md">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                <span className="font-semibold text-white">{selectedEventForBookings.standard_stall_location || "Venue TBD"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Main Content Body */}
                      <div className="flex flex-col lg:flex-row flex-1 z-20">
                        {/* Left Column: Bookings Matrix & Gallery */}
                        <div className="flex-1 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-1 sm:gap-1.5">
                                <Users className="w-5 h-5 text-indigo-400 mr-0.5" />
                                <span>Reserved</span>
                                <span className={`${yellowtail.className} text-2xl md:text-3xl font-normal normal-case text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-md px-1 inline-block`}>
                                  Stall
                                </span>
                                <span>Vendors ({eventBookings.length})</span>
                              </h3>
                              <p className="text-white/50 text-xs sm:text-sm mt-0.5">Review booked vendors, pitches, and communicate directly.</p>
                            </div>
                          </div>
                          
                          {isBookingsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <UiverseLoader />
                              <p className="text-white/60 text-sm mt-4">Loading stall reservations...</p>
                            </div>
                          ) : eventBookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                <Users className="w-8 h-8 text-white/20" />
                              </div>
                              <h4 className="text-base font-bold text-white mb-1">No Reservations Yet</h4>
                              <p className="text-white/50 max-w-md text-xs leading-relaxed">
                                There are currently no stalls reserved by vendors. Vendors can explore and pitch for stalls directly.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {eventBookings.map((booking) => (
                                <div 
                                  key={booking.id} 
                                  className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-col p-4 gap-3 hover:shadow-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 text-xs font-black rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      Stall #{booking.stall_number}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                      Booked
                                    </span>
                                  </div>

                                  {booking.image_url && (
                                    <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => setLightboxImage(booking.image_url)}>
                                      <SafeImage
                                        src={booking.image_url}
                                        alt={`Vendor for Stall #${booking.stall_number}`}
                                        aspectRatio="aspect-video"
                                        maxWDesktop="none"
                                        roundedClass="rounded-none group-hover:scale-105 transition-transform duration-500"
                                        fallbackIcon="store"
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-1">
                                    <div>
                                      <p className="text-sm font-bold text-white">{booking.vendor_name || `Vendor #${booking.vendor_id}`}</p>
                                      <p className="text-xs text-white/50">Stall Tier: {booking.stall_type || 'Standard'}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setChatContext({
                                          eventId: selectedEventForBookings.id,
                                          receiverId: booking.vendor_id,
                                          title: `${booking.vendor_name} (Stall #${booking.stall_number})`
                                        });
                                        setIsChatOpen(true);
                                      }}
                                      className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer hover:scale-105"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" /> Message
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Photo Gallery Showcase */}
                          <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-white flex items-center gap-1 sm:gap-1.5">
                                  <Store className="w-5 h-5 text-indigo-400 mr-0.5" />
                                  <span>Event Photos &</span>
                                  <span className={`${yellowtail.className} text-2xl md:text-3xl font-normal normal-case text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-md px-1 inline-block`}>
                                    Venue
                                  </span>
                                  <span>Gallery</span>
                                </h4>
                                <p className="text-white/50 text-xs">Tap any photo to view full screen preview.</p>
                              </div>
                              <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/5 text-white/70 border border-white/10">
                                {getImageUrls(selectedEventForBookings).length} Photos
                              </span>
                            </div>

                            {getImageUrls(selectedEventForBookings).length > 0 ? (
                              <div 
                                ref={galleryRef}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none pb-2 scrollbar-hide"
                                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                              >
                                {getImageUrls(selectedEventForBookings).map((url: string, idx: number) => (
                                  <div 
                                    key={url + idx} 
                                    onClick={() => {
                                      if (!dragMoved.current) {
                                        setLightboxImage(url);
                                      }
                                    }}
                                    className="flex-none w-60 sm:w-72 aspect-video snap-start relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 group/gallery hover:border-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                  >
                                    <SafeImage
                                      src={url}
                                      alt={`${selectedEventForBookings.name} Gallery ${idx + 1}`}
                                      aspectRatio="aspect-video"
                                      maxWDesktop=""
                                      roundedClass="rounded-none pointer-events-none group-hover/gallery:scale-110 transition-transform duration-500"
                                      fallbackIcon="store"
                                    />
                                    <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-black/60 text-white/90 border border-white/20 backdrop-blur-md">
                                      Photo {idx + 1}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                                      <span className="text-white text-xs font-bold px-3.5 py-1.5 rounded-full bg-indigo-500/90 shadow-xl border border-white/20">
                                        Expand Photo 🔍
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-white/40 text-xs">
                                No additional venue gallery photos uploaded for this event.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Analytics & Summary Panel */}
                        <div className="w-full lg:w-96 p-6 sm:p-8 flex flex-col bg-white/[0.02] shrink-0">
                          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-6 flex items-center gap-1 sm:gap-1.5">
                            <Sparkles className="w-5 h-5 text-indigo-400 mr-0.5" />
                            <span>Event</span>
                            <span className={`${yellowtail.className} text-2xl md:text-3xl font-normal normal-case text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-md px-1 inline-block`}>
                              Analytics
                            </span>
                            <span>Summary</span>
                          </h3>
                          
                          <div className="space-y-4 flex-1">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30">
                              <span className="block text-xs text-indigo-300 uppercase font-bold tracking-wider mb-1">Total Estimated Revenue</span>
                              <span className="text-3xl font-black text-emerald-400 drop-shadow-md">
                                ₹{eventBookings.reduce((sum, b) => {
                                  const isPremium = (() => {
                                    try {
                                      const ids = JSON.parse(selectedEventForBookings.premium_stall_ids || '[]');
                                      return Array.isArray(ids) && ids.includes(b.stall_number);
                                    } catch { return false; }
                                  })();
                                  const price = isPremium ? selectedEventForBookings.premium_price : selectedEventForBookings.standard_price;
                                  return sum + (price || 0);
                                }, 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Total Capacity</span>
                                <span className="text-lg font-black text-white mt-0.5 block">{selectedEventForBookings.total_stalls} Stalls</span>
                              </div>
                              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                                <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Booked Stalls</span>
                                <span className="text-lg font-black text-indigo-400 mt-0.5 block">{eventBookings.length} Booked</span>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Stall Tiers Configuration</p>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white/60">Standard Stall Size:</span>
                                <span className="font-bold text-white">{selectedEventForBookings.standard_stall_size || '10x10 ft'}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                                <span className="text-white/60">Standard Stall Price:</span>
                                <span className="font-bold text-emerald-400">₹{selectedEventForBookings.standard_price || 0}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                                <span className="text-white/60">Premium Stall Size:</span>
                                <span className="font-bold text-white">{selectedEventForBookings.premium_stall_size || '12x12 ft'}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                                <span className="text-white/60">Premium Stall Price:</span>
                                <span className="font-bold text-amber-400">₹{selectedEventForBookings.premium_price || 0}</span>
                              </div>
                            </div>

                            {/* Delete Event Button */}
                            <button
                              onClick={async () => {
                                const confirmDelete = window.confirm(
                                  `Are you sure you want to delete "${selectedEventForBookings.name}"? This will cancel all bookings, pitches, and delete all associated chat messages. This action cannot be undone.`
                                );
                                if (!confirmDelete) return;
                                
                                try {
                                  const token = localStorage.getItem("token");
                                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                                  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
                                  const res = await fetch(`${cleanApiUrl}/events/${selectedEventForBookings.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      "Authorization": `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (res.ok) {
                                    alert("Event deleted successfully!");
                                    setSelectedEventForBookings(null);
                                    fetchEvents();
                                  } else {
                                    const errData = await res.json().catch(() => null);
                                    alert(errData?.detail || "Failed to delete event.");
                                  }
                                } catch (err) {
                                  console.error("Failed to delete event", err);
                                  alert("An error occurred while deleting the event.");
                                }
                              }}
                              className="mt-4 w-full py-3 rounded-xl font-bold text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 border border-red-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Modal Dropdown */}
              <AnimatePresence>
                {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto p-6 md:p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] flex flex-col">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors z-[100]"
              >
                <X className="w-5 h-5" />
              </button>
              
              {successMsg ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Event Created!</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 w-full flex flex-col justify-between min-h-[450px]">
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((stepNum) => (
                      <React.Fragment key={stepNum}>
                        <button
                          type="button"
                          onClick={() => {
                            if (stepNum < currentStep || isStepValid(stepNum - 1)) {
                              setCurrentStep(stepNum);
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            currentStep === stepNum 
                              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg scale-110' 
                              : currentStep > stepNum 
                                ? 'bg-indigo-500 text-white hover:bg-indigo-650' 
                                : 'bg-black/5 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10 cursor-not-allowed'
                          }`}
                        >
                          {stepNum}
                        </button>
                        {stepNum < 5 && (
                          <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${currentStep > stepNum ? 'bg-indigo-500' : 'bg-black/5 dark:bg-white/5'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 py-4">
                    <AnimatePresence mode="wait">
                      {currentStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
                            Create <br />
                            <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 via-purple-550 to-cyan-500 bg-clip-text text-transparent drop-shadow-md`}>
                              your next festival
                            </span><br />
                            in seconds.
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600 dark:text-white/60 pl-1">Event Name</label>
                              <input 
                                type="text" 
                                required
                                value={eventName}
                                onChange={e => setEventName(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. Neo Tokyo Expo"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600 dark:text-white/60 pl-1">Date &amp; Time</label>
                              <input 
                                type="datetime-local" 
                                required
                                value={rawEventDate}
                                onChange={e => handleDateChange(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner dark:[color-scheme:dark]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
                            Configure <br />
                            <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 via-purple-550 to-cyan-500 bg-clip-text text-transparent drop-shadow-md`}>
                              the stall layout
                            </span><br />
                            for vendors.
                          </h2>
                          
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600 dark:text-white/60 pl-1">Total Stalls Available</label>
                              <input 
                                type="number" 
                                required
                                min="1"
                                value={totalStalls}
                                onChange={e => { setTotalStalls(e.target.value); setPremiumStalls(new Set()); }}
                                className="w-full px-5 py-4 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. 24"
                              />
                            </div>

                            {/* Interactive per-stall Premium designator */}
                            {parseInt(totalStalls) > 0 && parseInt(totalStalls) <= 50 && (
                              <div className="space-y-3 p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 max-h-[220px] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white/70">Mark Premium Stalls</p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500/50 border border-emerald-500 inline-block"></span><span className="text-gray-500 dark:text-white/50">Standard</span></span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500/60 border border-amber-400 inline-block"></span><span className="text-gray-500 dark:text-white/50">Premium</span></span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-white/40">Click stalls to toggle — amber = Premium ★, green = Standard</p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {Array.from({ length: parseInt(totalStalls) }, (_, i) => i + 1).map(stallId => {
                                    const isPremium = premiumStalls.has(stallId);
                                    return (
                                      <button
                                        key={stallId}
                                        type="button"
                                        onClick={() => {
                                          setPremiumStalls(prev => {
                                            const next = new Set(prev);
                                            if (next.has(stallId)) next.delete(stallId);
                                            else next.add(stallId);
                                            return next;
                                          });
                                        }}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all duration-150 ${
                                          isPremium
                                            ? 'bg-amber-500/30 border-amber-400 text-amber-600 dark:text-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25'
                                        }`}
                                      >
                                        {isPremium ? '★' : stallId}
                                      </button>
                                    );
                                  })}
                                </div>
                                {premiumStalls.size > 0 && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
                                    ★ {premiumStalls.size} Premium · {parseInt(totalStalls) - premiumStalls.size} Standard
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
                            Set up <br />
                            <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 via-purple-550 to-cyan-500 bg-clip-text text-transparent drop-shadow-md`}>
                              the stall pricing
                            </span><br />
                            for booking.
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600 dark:text-white/60 pl-1">Standard Stall Price (₹)</label>
                              <input 
                                type="number" 
                                required
                                min="0"
                                value={standardPrice}
                                onChange={e => setStandardPrice(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. 500"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-amber-600 dark:text-amber-400/80 pl-1">★ Premium Stall Price (₹)</label>
                              <input 
                                type="number" 
                                required
                                min="0"
                                value={premiumPrice}
                                onChange={e => setPremiumPrice(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner"
                                placeholder="e.g. 1000"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 4 && (
                        <motion.div
                          key="step4"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
                            Specify <br />
                            <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 via-purple-550 to-cyan-500 bg-clip-text text-transparent drop-shadow-md`}>
                              stall sizes &amp; areas
                            </span><br />
                            clearly.
                          </h2>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-650 dark:text-white/60 pl-1">Standard Stall Size (e.g. 10x10)</label>
                              <input 
                                type="text" 
                                required
                                value={standardStallSize}
                                onChange={e => setStandardStallSize(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. 10x10"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-650 dark:text-white/60 pl-1">Standard Stall Location</label>
                              <input 
                                type="text" 
                                required
                                value={standardStallLocation}
                                onChange={e => setStandardStallLocation(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. Main Hall"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-amber-600 dark:text-amber-400/80 pl-1">★ Premium Stall Size (e.g. 12x12)</label>
                              <input 
                                type="text" 
                                required
                                value={premiumStallSize}
                                onChange={e => setPremiumStallSize(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-gray-900 dark:text-white outline-none focus:border-amber-500/50 transition-all shadow-inner"
                                placeholder="e.g. 12x12"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-amber-600 dark:text-amber-400/80 pl-1">★ Premium Stall Location</label>
                              <input 
                                type="text" 
                                required
                                value={premiumStallLocation}
                                onChange={e => setPremiumStallLocation(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-gray-900 dark:text-white outline-none focus:border-amber-500/50 transition-all shadow-inner"
                                placeholder="e.g. VIP Area"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 5 && (
                        <motion.div
                          key="step5"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
                            Upload <br />
                            <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 via-purple-550 to-cyan-500 bg-clip-text text-transparent drop-shadow-md`}>
                              banners &amp; visuals
                            </span><br />
                            to attract vendors.
                          </h2>
                          
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-650 dark:text-white/60 pl-1">Event Banner (Required)</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  required
                                  onChange={(e) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    setEventBanner(file);
                                  }}
                                  className="w-full px-3 py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-650 dark:file:text-indigo-300 hover:file:bg-indigo-500/30"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-650 dark:text-white/60 pl-1">Gallery Images (Optional)</label>
                                <input 
                                  type="file" 
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : [];
                                    setEventImages(files);
                                  }}
                                  className="w-full px-3 py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-650 dark:file:text-indigo-300 hover:file:bg-indigo-500/30"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-650 dark:text-white/60 pl-1">Google Maps Link (Optional)</label>
                              <input 
                                type="url" 
                                value={mapsUrl}
                                onChange={e => setMapsUrl(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                placeholder="e.g. https://maps.google.com/?q=..."
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-150 dark:border-white/10 mt-auto">
                    {currentStep === 1 ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 rounded-xl font-bold text-base text-gray-700 dark:text-white/70 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex-1 py-4 rounded-xl font-bold text-base text-gray-700 dark:text-white/70 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    )}

                    {currentStep < 5 ? (
                      <button
                        type="button"
                        disabled={!isStepValid(currentStep)}
                        onClick={() => {
                          if (isStepValid(currentStep)) setCurrentStep(currentStep + 1);
                        }}
                        className={`flex-[2] py-4 rounded-xl font-bold text-base transition-all flex justify-center items-center gap-2 cursor-pointer
                          ${!isStepValid(currentStep)
                            ? 'bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-zinc-550 cursor-not-allowed border border-gray-200 dark:border-zinc-700' 
                            : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(99,102,241,0.25)]'}`}
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        type="submit"
                        disabled={isSubmitting || !isStepValid(5)}
                        className={`flex-[2] py-4 rounded-xl font-bold text-base transition-all flex justify-center items-center gap-2 cursor-pointer
                          ${isSubmitting || !isStepValid(5)
                            ? 'bg-indigo-500/30 text-white/50 cursor-not-allowed border border-indigo-500/20' 
                            : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(99,102,241,0.35)]'}`}
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Event"}
                      </button>
                    )}
                  </div>

                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Immersive Instagram-Style Creator Profile Modal */}
      <AnimatePresence>
        {selectedVendorForProfile !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Vendor Creator Profile
                  </h3>
                  <p className="text-white/40 text-xs mt-0.5">Explore setups, hype score, and achievements</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedVendorForProfile(null);
                    setVendorProfileData(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide space-y-8">
                {isProfileModalLoading && !vendorProfileData ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <UiverseLoader />
                    <p className="text-white/60 mt-4">Loading Creator Profile...</p>
                  </div>
                ) : (
                  <>
                    {/* Header Info Block */}
                    <div className="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-white/10">
                      <div className="relative shrink-0">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 p-[3px] shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                          {vendorProfileData?.avatar_url ? (
                            <Image 
                              src={getFullImageUrl(vendorProfileData.avatar_url)} 
                              alt={vendorProfileData.company_name} 
                              fill
                              unoptimized
                              className="rounded-full object-cover border border-black/40"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black border border-black/40">
                              {vendorProfileData?.company_name?.charAt(0) || "V"}
                            </div>
                          )}
                        </div>
                        <span className="absolute bottom-1 right-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-indigo-500 text-white border-2 border-black tracking-wide shadow-md">
                          Creator
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                        <div className="w-full">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">{vendorProfileData?.company_name || "Vendor Name"}</h2>
                                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">Verified</span>
                              </div>
                              <div className="flex justify-center md:justify-start gap-2 mt-2">
                                {vendorProfileData?.instagram_url && (
                                  <a 
                                    href={vendorProfileData.instagram_url.startsWith("http") ? vendorProfileData.instagram_url : `https://instagram.com/${vendorProfileData.instagram_url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 rounded-full bg-white/5 hover:bg-pink-500/10 text-white/60 hover:text-pink-400 border border-white/10 hover:border-pink-500/30 transition-all text-xs flex items-center gap-1.5"
                                  >
                                    <Instagram className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">Instagram</span>
                                  </a>
                                )}
                                {vendorProfileData?.website_url && (
                                  <a 
                                    href={vendorProfileData.website_url.startsWith("http") ? vendorProfileData.website_url : `https://${vendorProfileData.website_url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-1.5 rounded-full bg-white/5 hover:bg-indigo-500/10 text-white/60 hover:text-indigo-400 border border-white/10 hover:border-indigo-500/30 transition-all text-xs flex items-center gap-1.5"
                                  >
                                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[10px]">Website</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Follow Button */}
                            <button
                              onClick={() => handleFollowVendor(vendorProfileData.id)}
                              className={`px-8 py-3 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all ${
                                vendorProfileData?.is_followed_by_me
                                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                                  : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                              }`}
                            >
                              {vendorProfileData?.is_followed_by_me ? "✓ Following" : "Follow Vendor"}
                            </button>
                          </div>
                          <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-2xl">
                            {vendorProfileData?.bio || "No biography added yet."}
                          </p>
                        </div>

                        {/* Hype stats */}
                        <div className="flex gap-4 mt-2">
                          <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                              {vendorProfileData?.follower_count || 0}
                            </p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Hype Score (Followers)</p>
                          </div>
                          <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                              {vendorProfileData?.total_likes || 0}
                            </p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Total Hype (Likes)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge Rack */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-black text-white/40 uppercase tracking-widest pl-1">Earned Trust Badges</p>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
                        {vendorProfileData?.badges?.map((badge: any) => {
                          const iconColor = badge.is_unlocked 
                            ? badge.id === "beginner" ? "text-emerald-400 bg-emerald-400/20 border-emerald-500/30"
                              : badge.id === "most_lovable" ? "text-amber-400 bg-amber-400/20 border-amber-500/30"
                              : "text-rose-400 bg-rose-400/20 border-rose-500/30"
                            : "text-white/20 bg-white/5 border-white/5";
                          
                          return (
                            <div 
                              key={badge.id}
                              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shrink-0 transition-all ${
                                badge.is_unlocked 
                                  ? "bg-white/10 border-white/10 shadow-md shadow-black/25" 
                                  : "opacity-40 border-dashed border-white/5"
                              }`}
                            >
                              <div className={`p-2 rounded-xl border ${iconColor}`}>
                                {badge.is_unlocked ? <Unlock className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                  {badge.name}
                                  {badge.is_unlocked && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                                </p>
                                <p className="text-[10px] text-white/50 max-w-[200px] mt-0.5 leading-tight">{badge.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Media Grid */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-black text-white/40 uppercase tracking-widest pl-1">Creator Media Feed</p>
                      {vendorProfileData?.media?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                          <Instagram className="w-12 h-12 text-white/10 mb-3" />
                          <p className="text-white/50 font-medium">Feed is currently empty</p>
                          <p className="text-white/30 text-xs mt-1">This vendor has not uploaded any stall visuals yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                          {vendorProfileData?.media?.map((post: any) => (
                            <Link 
                              key={post.id}
                              href={`/posts/${post.id}`}
                              className="aspect-square relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer group shadow-md block"
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
                                alt="Vendor setup post"
                                aspectRatio="aspect-square"
                                maxWDesktop=""
                                roundedClass="rounded-none"
                                className="transition-transform duration-500 group-hover:scale-110"
                                fallbackIcon="store"
                              />
                            )}

                              {/* Hover Overlay with Heart/Likes count */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold backdrop-blur-[2px]">
                                <Heart className={`w-6 h-6 text-pink-500 ${post.is_liked_by_me ? 'fill-pink-500' : ''}`} />
                                <span className="text-lg tracking-wide">{post.like_count}</span>
                              </div>
                              
                              {post.media_type === "video" && (
                                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 border border-white/10 text-[9px] font-black uppercase tracking-widest pointer-events-none">
                                  Video
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Creator Media Detail Overlay */}
      <AnimatePresence>
        {selectedMediaDetail !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl flex flex-col md:flex-row"
            >
              {/* Media viewer */}
              <div className="flex-1 h-full bg-[#030303] flex items-center justify-center relative">
                {selectedMediaDetail.media_type === "video" ? (
                  <video 
                    src={selectedMediaDetail.media_url} 
                    className="w-full h-full object-contain" 
                    controls 
                    autoPlay 
                    loop
                  />
                ) : (
                  <SafeImage
                    src={selectedMediaDetail.media_url}
                    alt="Visual setup detail"
                    aspectRatio="aspect-auto h-full w-full"
                    maxWDesktop=""
                    roundedClass="rounded-none"
                    className="object-contain"
                    fallbackIcon="store"
                  />
                )}
                <button 
                  onClick={() => setSelectedMediaDetail(null)}
                  className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/10 md:hidden transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side panel for details */}
              <div className="w-full md:w-80 h-full p-6 bg-[#090909] border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/30 text-xs uppercase tracking-widest font-black">Detail View</span>
                    <button 
                      onClick={() => setSelectedMediaDetail(null)}
                      className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-[2px] relative overflow-hidden">
                      {vendorProfileData?.avatar_url ? (
                        <Image 
                          src={getFullImageUrl(vendorProfileData.avatar_url)} 
                          alt={vendorProfileData.company_name} 
                          fill
                          unoptimized
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white font-bold">
                          {vendorProfileData?.company_name?.charAt(0) || "V"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold leading-tight">{vendorProfileData?.company_name}</p>
                      <p className="text-white/40 text-[10px]">Stall visualizer</p>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm leading-relaxed border-t border-white/5 pt-4">
                    Stall visual uploaded on {new Date(selectedMediaDetail.created_at).toLocaleDateString()}. Like this stall setup to build up their creator hype score!
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeVendorMedia(selectedMediaDetail.id)}
                      className={`p-3 rounded-2xl border transition-all ${
                        selectedMediaDetail.is_liked_by_me 
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-500" 
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${selectedMediaDetail.is_liked_by_me ? 'fill-pink-500' : ''}`} />
                    </button>
                    <div>
                      <p className="text-white font-black text-lg">{selectedMediaDetail.like_count}</p>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Hype Likes</p>
                    </div>
                  </div>
                </div>
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

      {/* Read-Only Event Details Modal */}
      <AnimatePresence>
        {selectedEventDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[2.5rem] border border-white/15 bg-[#0a0a0f]/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(168,85,247,0.25)] text-white flex flex-col scrollbar-hide">
              {/* Floating ambient glow */}
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Close button */}
              <button 
                onClick={() => setSelectedEventDetails(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-purple-500/20 border border-white/20 hover:border-purple-500/50 text-white/70 hover:text-white transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6">
                <div>
                  <span className="px-3.5 py-1 text-[11px] font-bold tracking-wider rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/40 backdrop-blur-md uppercase inline-block mb-3 shadow-md">
                    ★ EXPLORE LIVE FESTIVAL
                  </span>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-xl break-words pr-12">
                    <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                      {selectedEventDetails.name}
                    </span>
                  </h2>
                  <p className="text-white/50 text-xs sm:text-sm mt-1">Uploaded by event organizer partner</p>
                </div>

                <div 
                  onClick={() => setLightboxImage(selectedEventDetails.banner_url || (getImageUrls(selectedEventDetails)[0]))}
                  className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black/40 cursor-pointer group shadow-xl"
                >
                  <SafeImage
                    src={selectedEventDetails.banner_url || (getImageUrls(selectedEventDetails)[0])}
                    alt={selectedEventDetails.name}
                    aspectRatio="aspect-video"
                    maxWDesktop=""
                    roundedClass="rounded-none group-hover:scale-105 transition-transform duration-700"
                    fallbackIcon="store"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                    <span className="text-white text-xs font-bold px-4 py-2 rounded-full bg-purple-500/90 shadow-2xl border border-white/20">
                      Expand Full Photo 🔍
                    </span>
                  </div>
                </div>

                {/* Stall Specifications Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-md">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-2">
                      Standard Tier
                    </span>
                    <p className="text-2xl font-black text-white mt-1">₹{selectedEventDetails.standard_price || "0"}</p>
                    <p className="text-xs text-white/60 mt-1 font-semibold">Dimensions: {selectedEventDetails.standard_stall_size || "10x10 ft"}</p>
                    <p className="text-xs text-white/60 mt-0.5 font-semibold">Location: {selectedEventDetails.standard_stall_location || "Main Hall"}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
                      ★ Premium Tier
                    </span>
                    <p className="text-2xl font-black text-amber-400 mt-1">₹{selectedEventDetails.premium_price || "0"}</p>
                    <p className="text-xs text-amber-300/80 mt-1 font-semibold">Dimensions: {selectedEventDetails.premium_stall_size || "12x12 ft"}</p>
                    <p className="text-xs text-amber-300/80 mt-0.5 font-semibold">Location: {selectedEventDetails.premium_stall_location || "VIP Zone"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-white/70">Date:</span> 
                    <span className="font-bold text-white">{selectedEventDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <Users className="w-4 h-4 text-pink-400" />
                    <span className="font-semibold text-white/70">Stalls:</span> 
                    <span className="font-bold text-white">{selectedEventDetails.total_stalls} Total</span>
                  </div>
                  {selectedEventDetails.maps_url && (
                    <a 
                      href={selectedEventDetails.maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/40 font-bold transition-all hover:scale-105"
                    >
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>View Google Maps ↗</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedEventDetails(null)}
                  className="w-full py-4 mt-2 rounded-xl font-extrabold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer shadow-lg"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advance Payment Checkout Overlay */}
        <AnimatePresence>
          {checkoutPitch && (() => {
          const vendorBasePrice = checkoutPitch.offered_price;
          const calculatedAdvance = Math.round(vendorBasePrice * 0.3); // 30% advance
          const remainingBalance = vendorBasePrice - calculatedAdvance;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md overflow-hidden p-8 rounded-[2.5rem] border border-white/20 bg-[#0B0B11]/90 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] text-white"
              >
                {/* Close Button */}
                <button
                  onClick={() => setCheckoutPitch(null)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">Advance Payment</h3>
                  <p className="text-white/40 text-xs mt-1">Review checkout breakdown to secure your booking</p>
                </div>

                {/* Receipt-Style Breakdown */}
                <div className="space-y-4 border-b border-white/10 pb-6 mb-6 font-sans">
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>Total Stall Price</span>
                    <span className="font-semibold text-white">₹{vendorBasePrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 font-sans">
                    <span className="text-sm font-bold text-white/90">Advance Required to Lock Stall</span>
                    <span className="text-lg font-black bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                      ₹{calculatedAdvance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-sm text-white/60">
                      <span>Remaining Balance</span>
                      <span className="font-semibold text-white">₹{remainingBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-normal">
                      Paid securely through the app 24 hours before the event
                    </p>
                  </div>
                </div>

                {/* Trust Elements */}
                <div className="space-y-3 mb-8 text-xs text-white/60">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Payment held securely in escrow</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Unlock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Vendor contact details unlocked immediately after advance payment</span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => {
                    handleUpdatePitch(checkoutPitch.id, 'Accepted');
                    setCheckoutPitch(null);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_0_rgba(236,72,153,0.3)]"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay Advance
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}
