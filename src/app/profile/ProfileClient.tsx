"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import UiverseLoader from "@/components/UiverseLoader";
import { 
  ArrowLeft, 
  MessageSquare, 
  Globe, 
  Building2, 
  Tag, 
  Store,
  Sparkles,
  Play,
  X,
  Heart,
  CheckCircle2,
  LayoutGrid,
  Film,
  Bookmark,
  ExternalLink,
  CalendarDays
} from "lucide-react";

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

const getFullImageUrl = (url?: string) => {
  if (!url) return "";
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
  let resolvedUrl = url;
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
  return resolvedUrl;
};

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get("u");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }

      try {
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/${username}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          // Fallback check by ID
          const resById = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile-by-id/${username}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (resById.ok) {
            const dataById = await resById.json();
            setProfile(dataById);
            return;
          }
          throw new Error("Profile not found");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, router]);

  const handleMessageUser = () => {
    if (!profile) return;
    const myRole = localStorage.getItem("role");
    
    // Determine redirect dashboard based on role
    const dashboardPath = myRole === "Organizer" ? "/organizer/dashboard" : "/vendor/dashboard";
    
    // Route to dashboard with search params to trigger chat initialization
    router.push(`${dashboardPath}?chatUserId=${profile.id}&chatUserName=${encodeURIComponent(profile.display_name || profile.business_name || profile.username)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-gray-900 dark:text-white">
        <UiverseLoader />
        <p className="text-gray-500 dark:text-white/60 mt-4">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-gray-900 dark:text-white p-6">
        <div className="p-8 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 max-w-md w-full text-center">
          <Store className="w-16 h-16 text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-500 dark:text-white/50 mb-6">{error || "The requested profile could not be loaded."}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white p-4 md:p-8 flex flex-col items-center">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent dark:from-indigo-500/10 dark:via-black dark:to-black pointer-events-none z-0" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-white/10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <img src="/logo.png" alt="Festopiya Logo" className="h-6 w-auto shrink-0" />
          <FestopiyaBranding className="text-xl" />
        </div>
      </div>

      {/* Main Instagram Profile Container */}
      <div className="relative z-10 w-full max-w-4xl p-4 md:p-8 mb-8">
        
        {/* Profile Header Details */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 pb-8">
          {/* Avatar with Story Ring */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-[3px] shadow-xl relative overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={getFullImageUrl(profile.avatar_url)} 
                  alt={profile.display_name} 
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-black shadow-inner"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black border-2 border-white dark:border-black">
                  {profile.display_name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full">
            {/* Header Row: Username & Message Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-gray-900 dark:text-white">
                  {profile.username || profile.display_name?.toLowerCase().replace(/\s+/g, '_')}
                </h2>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handleMessageUser}
                  className="px-5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>

            {/* Dynamic Inline Text Stats */}
            <div className="flex items-center gap-8 text-sm md:text-base py-1">
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">{profile.media?.length || 0}</strong>{" "}
                <span className="text-gray-600 dark:text-gray-300">posts</span>
              </span>
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">{profile.follower_count || 0}</strong>{" "}
                <span className="text-gray-600 dark:text-gray-300">followers</span>
              </span>
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">{profile.total_likes || 0}</strong>{" "}
                <span className="text-gray-600 dark:text-gray-300">likes</span>
              </span>
            </div>

            {/* Real User Bio & Details */}
            <div className="text-xs md:text-sm text-gray-800 dark:text-gray-200 space-y-1">
              {(profile.display_name || profile.business_name) && (
                <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{profile.display_name || profile.business_name}</p>
              )}
              {profile.category && (
                <p className="text-gray-500 dark:text-gray-400 font-medium">{profile.category}</p>
              )}
              <p className="whitespace-pre-line leading-relaxed max-w-lg">
                {profile.bio || "No biography added yet."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {profile.website_url && (
                  <a 
                    href={profile.website_url.startsWith("http") ? profile.website_url : `https://${profile.website_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {profile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.instagram_url && (
                  <a 
                    href={profile.instagram_url.startsWith("http") ? profile.instagram_url : `https://instagram.com/${profile.instagram_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-pink-600 dark:text-pink-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    @{profile.instagram_url.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}
                  </a>
                )}
              </div>
            </div>

            {/* Items Selling (Vendors) */}
            {profile.role === "Vendor" && profile.items_selling && (
              (() => {
                try {
                  const items = JSON.parse(profile.items_selling);
                  if (items.length === 0) return null;
                  return (
                    <div className="mt-6 w-full text-left">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Store className="w-4 h-4 text-emerald-500" />
                        Items Selling
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-2 rounded-xl shadow-sm">
                            {item.image_url ? (
                              <img src={getFullImageUrl(item.image_url)} alt={item.name} className="w-10 h-10 object-cover rounded-md shrink-0 border border-gray-200 dark:border-white/10" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-md shrink-0 flex items-center justify-center text-[10px] text-gray-500 font-medium">No Img</div>
                            )}
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch(e) { return null; }
              })()
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-center gap-12 border-t border-gray-200 dark:border-zinc-800 text-xs font-semibold tracking-widest uppercase mt-4">
          <button className="py-3 flex items-center gap-2 text-gray-900 dark:text-white border-t-2 border-gray-900 dark:border-white -mt-[1px] transition-all cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
            <span>{profile.role === "Organizer" ? "EVENTS" : "POSTS"}</span>
          </button>
        </div>

        {/* 3-Column Grid */}
        {profile.role === "Organizer" ? (
          /* Organizer Events Grid */
          profile.events?.length === 0 ? (
            <div className="py-16 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/50 flex flex-col items-center justify-center text-center mt-4">
              <CalendarDays className="w-10 h-10 text-gray-400 dark:text-zinc-600 mb-3" />
              <p className="text-gray-500 dark:text-zinc-400 text-sm">No events created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {profile.events?.map((evt: any) => (
                <div 
                  key={evt.id}
                  onClick={() => router.push(`/?event=${evt.id}`)}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 relative group cursor-pointer shadow-sm border border-gray-200 dark:border-white/10"
                >
                  <img 
                    src={getFullImageUrl(evt.banner_url || (evt.image_urls ? JSON.parse(evt.image_urls)[0] : null))} 
                    alt={evt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg truncate">{evt.name}</h3>
                    <p className="text-white/80 text-xs font-medium mt-1">{new Date(evt.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Vendor Posts Grid */
          profile.media?.length === 0 ? (
            <div className="py-16 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-950/50 flex flex-col items-center justify-center text-center mt-4">
              <Store className="w-10 h-10 text-gray-400 dark:text-zinc-600 mb-3" />
              <p className="text-gray-500 dark:text-zinc-400 text-sm">No posts shared yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
              {profile.media?.map((post: any) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedMedia(post)}
                  className="aspect-square rounded-sm md:rounded-md overflow-hidden bg-zinc-900 relative group cursor-pointer shadow-sm"
                >
                  {post.media_type === "video" ? (
                    <video 
                      src={getFullImageUrl(post.media_url)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                    muted 
                    playsInline
                  />
                ) : (
                  <img 
                    src={getFullImageUrl(post.media_url)} 
                    alt="Showcase post" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold backdrop-blur-[1px]">
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span className="text-base tracking-wide">{post.like_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </div>

      {/* Immersive Full-Screen Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-4xl h-[80vh] flex flex-col md:flex-row rounded-3xl border border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#0A0A0A] overflow-hidden">
            {/* Media viewer */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {selectedMedia.media_type === "video" ? (
                <video 
                  src={getFullImageUrl(selectedMedia.media_url)} 
                  className="w-full h-full object-contain" 
                  controls 
                  autoPlay 
                  loop
                />
              ) : (
                <img 
                  src={getFullImageUrl(selectedMedia.media_url)} 
                  alt="Showcase visual detail" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            
            {/* Media sidebar details */}
            <div className="w-full md:w-[320px] p-6 bg-black/[0.01] dark:bg-white/[0.01] border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Showcase Setup</span>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-[2px] overflow-hidden">
                    <img 
                      src={getFullImageUrl(profile.avatar_url)} 
                      alt={profile.display_name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{profile.display_name}</h4>
                    <p className="text-gray-500 dark:text-white/40 text-xs">@{profile.username}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-white/60 text-xs">
                  Uploaded on {new Date(selectedMedia.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{selectedMedia.like_count}</p>
                  <p className="text-[9px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-wider mt-1">Total Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
