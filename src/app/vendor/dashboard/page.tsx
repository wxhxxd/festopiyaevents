"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import UiverseLoader from "@/components/UiverseLoader";
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
  Compass,
  Send,
  UserCircle,
  ClipboardList,
  Heart,
  UploadCloud,
  Lock,
  Unlock,
  ExternalLink,
  Trash2,
  Users
} from "lucide-react";
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
      <div className={`w-full ${aspectRatio} ${roundedClass} bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-medium shadow-inner`}>
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
  const [eventFilter, setEventFilter] = useState<'active' | 'past'>('active');

  const [activeTab, setActiveTab] = useState<"find_events" | "my_stalls" | "my_pitches" | "organizers" | "profile" | "settings">("find_events");
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
    bio: '',
    instagram_url: '',
    website_url: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // Fetch events, bookings and pitches on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchBookings(), fetchMyPitches()]).then(() => {
      setLoading(false);
    });

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

  const getEventName = (eventId: number) => {
    return events.find(e => e.id === eventId)?.name || `Event #${eventId}`;
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
              localStorage.removeItem("token"); 
              localStorage.removeItem("company_name"); 
              localStorage.removeItem("role"); 
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
        <div className="flex-1 flex flex-row md:flex-col items-center md:items-stretch justify-around md:justify-start rounded-full md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/20 bg-gray-50/50 dark:bg-white/10 md:bg-gray-50/30 md:dark:bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] px-4 py-2 md:py-8 md:px-4 overflow-visible md:overflow-hidden">
          <div className="hidden md:flex items-center justify-center md:justify-start gap-3 px-2 mb-10">
            <img src="/logo.png" alt="Festopiya Logo" className="h-6 w-auto mr-2 shrink-0" />
            <FestopiyaBranding className="text-2xl" />
          </div>

          <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start w-full md:w-auto md:flex-1 gap-2 md:space-y-2">
            {[
              { icon: Search, label: "Find Events", tab: "find_events", icon3d: "/calender3d.png" },
              { icon: Store, label: "My Stalls", tab: "my_stalls", icon3d: "/home3d.png" },
              { icon: ClipboardList, label: "My Pitches", tab: "my_pitches", icon3d: "/pitch3d.png" },
              { icon: Users, label: "Organizer Hub", tab: "organizers", icon3d: "/profile3d.png" },
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
                  className={`flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 group w-12 h-12 md:w-full md:h-auto px-0 md:px-4 md:py-3 ${
                    activeTab === item.tab 
                      ? "bg-gradient-to-b from-black/10 to-black/5 dark:from-white/20 dark:to-white/5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon3d ? (
                    <img 
                      src={item.icon3d} 
                      className={`w-9 h-9 md:w-6 md:h-6 object-contain transition-all duration-300 ${
                        activeTab === item.tab 
                          ? 'scale-135 opacity-100 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] -translate-y-1.5' 
                          : 'opacity-75 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] group-hover:opacity-100 group-hover:scale-115 group-hover:-translate-y-1'
                      }`} 
                      alt={item.label}
                    />
                  ) : (
                    <item.icon className={`w-6 h-6 md:w-5 md:h-5 transition-all duration-300 ${
                      activeTab === item.tab 
                        ? 'text-rose-500 dark:text-rose-400 stroke-[2.25] scale-125 -translate-y-1 filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                        : 'text-gray-500 dark:text-white/60 stroke-[2] group-hover:text-pink-500 dark:group-hover:text-pink-300 group-hover:scale-115 group-hover:-translate-y-0.5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                    }`} />
                  )}
                  <span className="hidden md:block font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
            
            <button 
              onClick={() => { setChatContext(null); setIsChatOpen(true); }}
              className={`flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 group w-12 h-12 md:w-full md:h-auto px-0 md:px-4 md:py-3 ${
                isChatOpen 
                  ? "bg-gradient-to-b from-black/10 to-black/5 dark:from-white/20 dark:to-white/5 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white" 
                  : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <img 
                src="/message3d2.png" 
                className={`w-9 h-9 md:w-6 md:h-6 object-contain transition-all duration-300 ${
                  isChatOpen 
                    ? 'scale-135 opacity-100 filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_6px_8px_rgba(0,0,0,0.65)] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] -translate-y-1.5' 
                    : 'opacity-75 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] group-hover:opacity-100 group-hover:scale-115 group-hover:-translate-y-1'
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
            <div className="min-h-screen text-gray-900 dark:text-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative z-10">

              {/* ── Hero container with background video ──────────────────── */}
              <div className="relative rounded-3xl overflow-hidden p-6 md:p-12 mb-10 bg-black/45 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-md max-w-7xl mx-auto w-full">
                {/* Background Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                >
                  <source src="/vendor-video.mp4" type="video/mp4" />
                  <source src="/vendor video.mp4" type="video/mp4" />
                  <source src="/vendor_video.mp4" type="video/mp4" />
                  <source src="/vendor-video.mp4.mp4" type="video/mp4" />
                  <source src="/vendor video.mp4.mp4" type="video/mp4" />
                  <source src="/vendor_video.mp4.mp4" type="video/mp4" />
                </video>

                {/* Content Wrapper */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left — Welcome & headline */}
                  <div>
                    {/* Headline */}
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-tight text-gray-900 dark:text-white">
                      Discover <br />
                      <span className={`${yellowtail.className} bg-gradient-to-r from-pink-500 to-cyan-500 dark:from-pink-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-md`}>
                        the best festivals
                      </span><br />
                      and secure your spot.
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-6 max-w-md leading-relaxed">
                      Your central hub to find high-traffic events, pitch your stall to organizers, and secure the bag.
                    </p>
                  </div>

                  {/* Right — Action cards */}
                  <div className="flex flex-col gap-6">
                    {/* Card 1 — Browse Events (smooth scroll) */}
                    <div
                      onClick={() => document.getElementById('discover-events-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 flex items-start gap-5 transition-all duration-300 shadow-md dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                        <img src="/calender3d.png" className="w-10 h-10 object-contain" alt="Compass" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">Browse Events</p>
                        <p className="text-gray-400 text-sm leading-relaxed">Find upcoming festivals and drop your pitch to the organizer.</p>
                      </div>
                    </div>

                    {/* Card 2 — Active Pitches (open messages) */}
                    <div
                      onClick={() => { setChatContext(null); setIsChatOpen(true); }}
                      className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 flex items-start gap-5 transition-all duration-300 shadow-md dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                        <img src="/message3d2.png" className="w-10 h-10 object-contain" alt="Send" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">Active Pitches</p>
                        <p className="text-gray-400 text-sm leading-relaxed">Track your stall requests and negotiate prices with organizers.</p>
                      </div>
                    </div>

                     {/* Card 3 — Optimize Profile (settings tab) */}
                    <div
                      onClick={() => setActiveTab('settings')}
                      className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 flex items-start gap-5 transition-all duration-300 shadow-md dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)] cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                        <img src="/gear3d2.png" className="w-10 h-10 object-contain" alt="Settings" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">Optimize Profile</p>
                        <p className="text-gray-400 text-sm leading-relaxed">Update your brand bio and social links to stand out.</p>
                      </div>
                    </div>
                  </div>
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

                const activeEvents = searchedEvents.filter(e => !isEventExpired(e.date));
                const pastEvents = searchedEvents.filter(e => isEventExpired(e.date));
                const filteredEvents = eventFilter === 'active' ? activeEvents : pastEvents;
                return (
                  <div id="discover-events-section" className="max-w-7xl mx-auto mt-16">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-black/10 dark:border-white/10 pb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Ticket className="text-pink-400 w-7 h-7" />
                        {eventFilter === 'active' ? 'Active Events' : 'Past Events'}
                      </h2>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search events..."
                            value={eventSearchQuery}
                            onChange={(e) => setEventSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-rose-500"
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
                        <Ticket className="w-12 h-12 text-gray-400 dark:text-white/20 mb-4" />
                        <p className="text-gray-550 dark:text-white/60 font-medium text-lg">
                          {eventFilter === 'active' ? 'No active events found.' : 'No past events found.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {Array.isArray(filteredEvents) && filteredEvents.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                            className="group relative p-6 md:p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-md dark:shadow-rose-500/20 transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              setSelectedEvent(event);
                              setSelectedStall(null);
                              setBookingError(null);
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-rose-500/0 to-red-500/0 group-hover:from-pink-500/10 group-hover:via-rose-500/10 group-hover:to-red-500/5 transition-colors duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                              <SafeImage
                                src={event.banner_url || (getImageUrls(event)[0])}
                                alt={event.name}
                                aspectRatio="aspect-video"
                                maxWDesktop=""
                                roundedClass="rounded-2xl mb-6 shadow-inner"
                                fallbackIcon="store"
                              />
                              <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Exhibition</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{event.name}</h3>
                              <div className="space-y-2 text-gray-550 dark:text-white/70 mb-5">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4 text-rose-400" />
                                  <span className="font-medium">{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-pink-400" />
                                  <span className="font-medium">{event.standard_stall_location || "TBD"}</span>
                                </div>
                              </div>

                              {/* ── Stall Tier Selector or Ended Badge ────── */}
                              <div className="mt-auto pt-5 border-t border-black/10 dark:border-white/10">
                                {isEventExpired(event.date) ? (
                                  <div className="flex items-center justify-between p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                                    <span className="text-sm font-semibold text-gray-550 dark:text-white/40">Event has ended</span>
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/25 uppercase tracking-wide">Past Event</span>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-widest mb-3">Choose Stall Type</p>
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
                                        className="flex flex-col items-center p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group/btn"
                                      >
                                        <span className="text-xs font-bold text-gray-500 dark:text-white/50 group-hover/btn:text-emerald-300 transition-colors uppercase tracking-wider mb-1">Standard</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white group-hover/btn:text-emerald-300 transition-colors">₹{event.standard_price || 0}</span>
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
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
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
                              {booking.vendor_name.charAt(0)}
                            </div>
                            <span className="text-gray-700 dark:text-white/70 text-sm font-medium truncate">{booking.vendor_name}</span>
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
                    <h2 className="text-3xl font-bold text-white">Organizer Hub</h2>
                    <p className="text-white/50 mt-0.5">Search for event hosts, planners, and discover partnership opportunities.</p>
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
                    <Users className="w-12 h-12 text-white/10 mb-4" />
                    <h3 className="text-xl font-medium text-white/60 mb-1">
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
                        onClick={() => router.push(`/profile/${org.username}`)}
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
                            <h4 className="font-extrabold text-white text-lg tracking-tight group-hover:text-rose-300 transition-colors truncate">{org.display_name}</h4>
                            <p className="text-white/40 text-xs truncate">@{org.username}</p>
                            {org.category && (
                              <span className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/20">
                                {org.category}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-white/60 text-xs mt-4 leading-relaxed line-clamp-2">
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
            <div className="flex-1 rounded-2xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-4 md:p-8 pb-10 flex flex-col gap-8 text-gray-900 dark:text-white relative z-10">
              {isProfileLoading && !vendorProfile ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <UiverseLoader />
                  <p className="text-white/60 mt-4">Loading Creator Profile...</p>
                </div>
              ) : (
                <>
                  {/* Profile Header */}
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/10">
                    <div className="relative shrink-0 group/avatar">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[3px] relative overflow-hidden">
                        {vendorProfile?.avatar_url ? (
                          <Image 
                            src={getFullImageUrl(vendorProfile.avatar_url)} 
                            alt={vendorProfile.company_name} 
                            fill
                            unoptimized
                            className="rounded-full object-cover border border-black/40 shadow-inner"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black shadow-inner border border-black/40">
                            {vendorProfile?.company_name?.charAt(0) || "V"}
                          </div>
                        )}
                        
                        {/* Change DP Camera/Upload Overlay */}
                        <label className="absolute inset-0 rounded-full bg-black/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase tracking-wider gap-1.5 backdrop-blur-[1px]">
                          <UploadCloud className="w-5 h-5 text-pink-400 animate-pulse" />
                          <span>Change DP</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <span className="absolute bottom-1 right-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500 text-white border-2 border-black tracking-wide shadow-md pointer-events-none">
                        Creator
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
                                  console.error("Failed to save brand name", err);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <input 
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-rose-500/40 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 text-lg font-bold"
                                autoFocus
                              />
                              <button type="submit" className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-all">Save</button>
                              <button type="button" onClick={() => setIsEditingName(false)} className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-all">Cancel</button>
                            </form>
                          ) : (
                            <>
                              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{vendorProfile?.company_name || "Vendor Name"}</h2>
                              <button 
                                onClick={() => {
                                  setEditNameValue(vendorProfile?.company_name || "");
                                  setIsEditingName(true);
                                }}
                                className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all"
                              >
                                Edit Name
                              </button>
                            </>
                          )}
                          <div className="flex gap-2">
                            {vendorProfile?.instagram_url && (
                              <a 
                                href={vendorProfile.instagram_url.startsWith("http") ? vendorProfile.instagram_url : `https://instagram.com/${vendorProfile.instagram_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-pink-500/10 text-gray-500 dark:text-white/60 hover:text-pink-600 dark:hover:text-pink-400 border border-gray-200 dark:border-white/10 hover:border-pink-500/30 transition-all"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {vendorProfile?.website_url && (
                              <a 
                                href={vendorProfile.website_url.startsWith("http") ? vendorProfile.website_url : `https://${vendorProfile.website_url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-indigo-500/10 text-gray-500 dark:text-white/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-white/10 hover:border-indigo-500/30 transition-all"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
                          {vendorProfile?.bio || "No biography added yet. Optimize your profile details inside the settings tab!"}
                        </p>
                      </div>

                      {/* Stats Section / Follower count */}
                      <div className="flex gap-6 mt-2">
                        <div className="px-5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md text-center">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-400 dark:to-rose-400">
                            {vendorProfile?.follower_count || 0}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest mt-0.5">Hype Score (Followers)</p>
                        </div>
                        <div className="px-5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md text-center">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
                            {vendorProfile?.total_likes || 0}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest mt-0.5">Total Hype (Likes)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge System */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest pl-1">Unlocked Trust Badges</p>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
                      {vendorProfile?.badges?.map((badge: any) => {
                        const iconColor = badge.is_unlocked 
                          ? badge.id === "beginner" ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/20 border-emerald-500/30"
                            : badge.id === "most_lovable" ? "text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/20 border-amber-500/30"
                            : "text-rose-500 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-400/20 border-rose-500/30"
                          : "text-gray-400 dark:text-white/20 bg-black/5 dark:bg-white/5 border-gray-200 dark:border-white/5";
                        
                        return (
                          <div 
                            key={badge.id}
                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shrink-0 transition-all ${
                              badge.is_unlocked 
                                ? "bg-black/5 dark:bg-white/10 border-gray-200 dark:border-white/10 shadow-lg shadow-black/10 dark:shadow-black/20" 
                                : "opacity-40 border-dashed border-gray-300 dark:border-white/5"
                            }`}
                          >
                            <div className={`p-2 rounded-xl border ${iconColor}`}>
                              {badge.is_unlocked ? <Unlock className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                {badge.name}
                                {badge.is_unlocked && <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-white/50 max-w-[200px] mt-0.5 leading-tight">{badge.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drag-and-Drop Media Upload Zone */}
                  <form onSubmit={handleMediaUpload} className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-4 rounded-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept="image/*,video/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-8 h-8 text-pink-500 dark:text-pink-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {uploadFile ? uploadFile.name : "Select past stall photo or video"}
                      </p>
                      <p className="text-gray-500 dark:text-white/40 text-xs mt-1">Supports PNG, JPG, JPEG, and MP4 (Max 15MB)</p>
                    </div>
                    {uploadFile && (
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                          </>
                        ) : (
                          "Upload to Feed 🚀"
                        )}
                      </button>
                    )}
                  </form>

                  {/* 3-Column Instagram-Style Media Feed Grid */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest pl-1">Past Stall Gallery</p>
                    {vendorProfile?.media?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01]">
                        <Instagram className="w-12 h-12 text-gray-300 dark:text-white/10 mb-3" />
                        <p className="text-gray-650 dark:text-white/50 font-medium">Your feed is empty.</p>
                        <p className="text-gray-400 dark:text-white/30 text-xs mt-1">Upload files above to showcase your stall setups, crowd pulls, and dishes!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {vendorProfile?.media?.map((post: any) => (
                          <Link 
                            key={post.id}
                            href={`/posts/${post.id}`}
                            className="aspect-square relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 cursor-pointer group shadow-md block"
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
                              <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
                              <span className="text-lg tracking-wide">{post.like_count}</span>
                            </div>
                            
                            {post.media_type === "video" && (
                              <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 border border-white/10 text-[10px] font-black uppercase tracking-widest pointer-events-none">
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
          )}

          {activeTab === "settings" && (
            <div className="flex-1 rounded-2xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl p-4 md:p-8 pb-10 text-gray-900 dark:text-white relative z-10">
              {/* Settings Header */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/20">
                    <Settings className="w-7 h-7 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                    <p className="text-gray-500 dark:text-white/50 mt-0.5">Update your public vendor profile information.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">

                {/* Shop/Business Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <Building2 className="w-4 h-4 text-rose-400" />
                    Shop/Business Name
                  </label>
                  <input
                    id="vendor-company-name"
                    type="text"
                    value={profileData.company_name}
                    onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner backdrop-blur-sm"
                    placeholder="Your company or brand name"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <UserCircle className="w-4 h-4 text-rose-400" />
                    Username
                  </label>
                  <input
                    id="vendor-username"
                    type="text"
                    value={profileData.username}
                    onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner backdrop-blur-sm"
                    placeholder="e.g. shop_jane"
                  />
                </div>

                {/* Specialization / Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    Specialization / Category
                  </label>
                  <input
                    id="vendor-category"
                    type="text"
                    value={profileData.category}
                    onChange={e => setProfileData({ ...profileData, category: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner backdrop-blur-sm"
                    placeholder="e.g. Gourmet Food, Handmade Crafts, Face Painting"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <FileText className="w-4 h-4 text-pink-400" />
                    Bio
                  </label>
                  <textarea
                    id="vendor-bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-inner backdrop-blur-sm resize-none"
                    placeholder="Tell organizers about your brand and products..."
                  />
                </div>

                {/* Instagram URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <AtSign className="w-4 h-4 text-pink-400" />
                    Instagram URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/30 text-sm pointer-events-none">instagram.com/</span>
                    <input
                      id="vendor-instagram"
                      type="url"
                      value={profileData.instagram_url}
                      onChange={e => setProfileData({ ...profileData, instagram_url: e.target.value })}
                      className="w-full pl-[7.5rem] pr-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-inner backdrop-blur-sm"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white/70 pl-1">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Website URL
                  </label>
                  <input
                    id="vendor-website"
                    type="url"
                    value={profileData.website_url}
                    onChange={e => setProfileData({ ...profileData, website_url: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner backdrop-blur-sm"
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

                {/* Error Toast */}
                <AnimatePresence>
                  {saveError && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium"
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
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Close button */}
              <button 
                onClick={() => { setSelectedEvent(null); setSelectedStall(null); }}
                className="absolute top-6 right-6 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Hero Banner Section */}
              <div className="relative w-full h-64 md:h-80 overflow-hidden bg-black/40 border-b border-white/10 shrink-0">
                <SafeImage
                  src={selectedEvent.banner_url || (getImageUrls(selectedEvent)[0])}
                  alt={selectedEvent.name}
                  aspectRatio="w-full h-full"
                  maxWDesktop="none"
                  roundedClass="rounded-none"
                  fallbackIcon="store"
                />
                {/* Gradient Overlay for aesthetic look */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 z-10" />
                
                {/* Event Title over Hero Banner */}
                <div className="absolute bottom-6 left-8 right-8 z-20">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md uppercase tracking-wider mb-3 inline-block">Exhibition</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">{selectedEvent.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-white/70 text-sm">
                    <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                      <CalendarDays className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span className="font-semibold">{selectedEvent.date}</span>
                    </div>
                    {selectedEvent.maps_url ? (
                      <a 
                        href={selectedEvent.maps_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all duration-300 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>View on Maps</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold">{selectedEvent.standard_stall_location || "TBD"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row flex-1">
                {/* Left Side: Map Area & Gallery */}
                <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/10">
                  <div className="mb-6">
                    <p className="text-white/75 font-semibold text-lg mb-1">Interactive Stall Map</p>
                    <p className="text-white/50 text-sm">Select an available stall on the map below to book.</p>
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

                  {/* Details/Gallery Section */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-rose-400" />
                      Event Gallery
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Browse photos from the venue organizer.
                    </p>
                    {getImageUrls(selectedEvent).length > 0 ? (
                      <div 
                        ref={galleryRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing select-none scrollbar-hide pb-2"
                        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                      >
                        {getImageUrls(selectedEvent).map((url: string, idx: number) => (
                          <div 
                            key={url + idx} 
                            onClick={() => {
                              if (!dragMoved.current) {
                                setLightboxImage(url);
                              }
                            }}
                            className="flex-none w-2/3 sm:w-1/2 md:w-1/3 aspect-video snap-start relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 group/gallery hover:border-rose-500/30 transition-all cursor-pointer"
                          >
                            <SafeImage
                              src={url}
                              alt={`${selectedEvent.name} Gallery ${idx + 1}`}
                              aspectRatio="aspect-video"
                              maxWDesktop=""
                              roundedClass="rounded-none pointer-events-none"
                              fallbackIcon="store"
                            />
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                              <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-500/80 shadow-md">Click to Expand</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-white/40 text-sm">
                        No gallery images uploaded for this event.
                      </div>
                    )}
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

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <span className="block text-[10px] text-white/40 uppercase font-semibold">Stall Size</span>
                              <span className="text-sm font-bold text-white">
                                {stallType === 'Premium' 
                                  ? (selectedEvent.premium_stall_size || '12x12') 
                                  : (selectedEvent.standard_stall_size || '10x10')}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <span className="block text-[10px] text-white/40 uppercase font-semibold">Location</span>
                              <span className="text-sm font-bold text-white truncate block">
                                {stallType === 'Premium' 
                                  ? (selectedEvent.premium_stall_location || 'VIP Area') 
                                  : (selectedEvent.standard_stall_location || 'Main Hall')}
                              </span>
                            </div>
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
