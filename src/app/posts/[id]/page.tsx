"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { 
  Heart, 
  ArrowLeft, 
  Clock, 
  Loader2, 
  Sparkles, 
  Store,
  Share2
} from "lucide-react";

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
  if (resolvedUrl.includes("localhost") || resolvedUrl.includes("127.0.0.1")) {
    let targetBase = configuredApiUrl;
    if (!targetBase && typeof window !== "undefined") {
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [likeSuccess, setLikeSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error("Failed to fetch post details");
        }
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const handleLike = async () => {
    if (!post || isLiking) return;
    setIsLiking(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/${post.id}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          is_liked_by_me: data.liked,
          like_count: data.like_count
        }));
        if (data.liked) {
          setLikeSuccess(true);
          setTimeout(() => setLikeSuccess(false), 1000);
        }
      }
    } catch (err) {
      console.error("Failed to like post", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Post link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-white/60">Loading Post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 max-w-md w-full text-center">
          <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-white/50 mb-6">{error || "Post details could not be found."}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-black text-white p-4 md:p-8 flex items-center justify-center">
      {/* Top Left Logo */}
      <div 
        onClick={() => router.push("/")} 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
      >
        <img src="/logo.png" alt="Festopiya Logo" className="h-8 w-auto shrink-0 drop-shadow-md" />
        <FestopiyaBranding className="text-xl" />
      </div>

      {/* Background radial glow */}
      <div className="fixed inset-0 bg-radial-gradient from-indigo-500/10 via-black to-black pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-4xl rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Media Viewer Area */}
        <div className="flex-1 min-h-[300px] md:min-h-[500px] bg-black/40 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10">
          {post.media_type === "video" ? (
            <video 
              src={getFullImageUrl(post.media_url)} 
              className="w-full h-full object-contain max-h-[80vh]" 
              controls 
              autoPlay 
              loop
              playsInline
            />
          ) : (
            <div className="relative w-full h-full min-h-[300px] md:min-h-[500px] flex items-center justify-center">
              <img 
                src={getFullImageUrl(post.media_url)} 
                alt="Post setup visual" 
                className="w-full h-full object-contain max-h-[80vh]"
              />
            </div>
          )}
          {post.media_type === "video" && (
            <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-black/60 text-white/80 border border-white/10">
              Video
            </span>
          )}
        </div>

        {/* Post Metadata & Engagement */}
        <div className="w-full md:w-[350px] p-6 md:p-8 flex flex-col justify-between bg-white/[0.02] backdrop-blur-md">
          <div className="space-y-6">
            
            {/* Header / Back action */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Visual Setup</span>
              </div>
            </div>

            {/* Post Information */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white tracking-tight">Stall Showcase</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Explore this gorgeous vendor setup. Hype scoring helps match organizers with top creators.
              </p>
              
              <div className="flex items-center gap-2 text-xs text-white/40 pt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Uploaded on {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
              </div>
            </div>
          </div>

          {/* Interaction Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            
            {/* Hype metrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all cursor-pointer ${
                    post.is_liked_by_me 
                      ? "bg-pink-500/10 border-pink-500/30 text-pink-500" 
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
                  } ${likeSuccess ? "scale-125" : ""}`}
                  title={post.is_liked_by_me ? "Unlike post" : "Like post"}
                >
                  <Heart className="w-6 h-6 text-pink-500" />
                </button>
                <div>
                  <p className="text-xl font-black text-white">{post.like_count}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total Stall Likes</p>
                </div>
              </div>

              <button 
                onClick={handleShare}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Help tooltip */}
            <p className="text-[10px] text-white/35 text-center leading-normal">
              Organizers love high-hype setups. Like this post to show your support and raise their match profile!
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
