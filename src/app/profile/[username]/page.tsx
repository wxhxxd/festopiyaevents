"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MessageSquare, 
  Globe, 
  Building2, 
  Tag, 
  Loader2, 
  Store,
  Sparkles,
  Play,
  X,
  Heart
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

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username;

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/${username}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Profile not found");
          }
          throw new Error("Failed to load profile details");
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-white/60">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 max-w-md w-full text-center">
          <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-white/50 mb-6">{error || "The requested profile could not be loaded."}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-black text-white p-4 md:p-8 flex flex-col items-center">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-radial-gradient from-indigo-500/10 via-black to-black pointer-events-none z-0" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
          <img src="/logo.png" alt="Festopiya Logo" className="h-8 w-auto shrink-0" />
          <span className="text-xl font-festopiya font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300 tracking-tight">
            Festopiya
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Profile Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-8">
        
        {/* Profile Header Details */}
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 p-[3px] overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={getFullImageUrl(profile.avatar_url)} 
                  alt={profile.display_name} 
                  className="w-full h-full rounded-full object-cover border border-black/40 shadow-inner"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-5xl font-black shadow-inner border border-black/40">
                  {profile.display_name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <span className={`absolute bottom-1 right-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border-2 border-black tracking-wide shadow-md ${
              profile.role === "Organizer" ? "bg-indigo-500 text-white" : "bg-fuchsia-500 text-white"
            }`}>
              {profile.role}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{profile.display_name || "User Profile"}</h2>
              <p className="text-white/40 text-sm mt-0.5">@{profile.username}</p>
            </div>

            {/* Tags / Info */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {profile.business_name && (
                <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold flex items-center gap-1.5 text-white/80">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {profile.business_name}
                </span>
              )}
              {profile.category && (
                <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold flex items-center gap-1.5 text-white/80">
                  <Tag className="w-3.5 h-3.5 text-fuchsia-400" />
                  {profile.category}
                </span>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {profile.instagram_url && (
                <a 
                  href={profile.instagram_url.startsWith("http") ? profile.instagram_url : `https://instagram.com/${profile.instagram_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/30 text-white/60 hover:text-pink-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {profile.website_url && (
                <a 
                  href={profile.website_url.startsWith("http") ? profile.website_url : `https://${profile.website_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-white/60 hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* MESSAGE BUTTON - Glassmorphism Style */}
          <div className="shrink-0 flex items-center justify-center pt-4 md:pt-0">
            <button
              onClick={handleMessageUser}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-black/30 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-indigo-300" />
              Message
            </button>
          </div>
        </div>

        {/* Bio Section */}
        <div className="py-8 border-b border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">About</h3>
          <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
            {profile.bio || "No biography details shared yet."}
          </p>
        </div>

        {/* Media Showcase / Visual Setup Section */}
        <div className="pt-8">
          <div className="flex items-center gap-2.5 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Visual Showcase</h3>
          </div>

          {profile.media?.length === 0 ? (
            <div className="py-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.01] flex flex-col items-center justify-center text-center">
              <Store className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No showcase visuals uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.media?.map((post: any) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedMedia(post)}
                  className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black relative group cursor-pointer hover:border-indigo-500/50 transition-all"
                >
                  {post.media_type === "video" ? (
                    <>
                      <video 
                        src={getFullImageUrl(post.media_url)} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-300" 
                        muted 
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img 
                      src={getFullImageUrl(post.media_url)} 
                      alt="Showcase post" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-300"
                    />
                  )}
                  {/* Hover stats overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                      {post.like_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
          
          <div className="w-full max-w-4xl h-[80vh] flex flex-col md:flex-row rounded-3xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
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
            <div className="w-full md:w-[320px] p-6 bg-white/[0.01] border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Showcase Setup</span>
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
                    <h4 className="font-bold text-white text-sm">{profile.display_name}</h4>
                    <p className="text-white/40 text-xs">@{profile.username}</p>
                  </div>
                </div>
                <p className="text-white/60 text-xs">
                  Uploaded on {new Date(selectedMedia.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <div>
                  <p className="text-lg font-black text-white leading-none">{selectedMedia.like_count}</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1">Total Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
