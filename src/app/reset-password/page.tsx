"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import FestopiyaBranding from "@/components/FestopiyaBranding";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError(null);
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${apiUrl}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to reset password. The link might be expired.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-300 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all";

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center space-y-4 py-4"
      >
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Password Reset!</h2>
        <p className="text-white/60 text-sm">Your password has been successfully updated. Redirecting you to login...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* New Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="New Password"
          minLength={6}
        />
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputCls}
          placeholder="Confirm New Password"
          minLength={6}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !token}
        className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.35)]"
      >
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
        {loading ? (
          <div className="newtons-cradle" style={{ "--uib-size": "24px" } as React.CSSProperties}>
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
            <div className="newtons-cradle__dot"></div>
          </div>
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            Update Password
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans p-4 bg-black">
      {/* ── Background Video ───────────────────────────────────── */}
      <video
        src="/club-bg.mp4.mp4"
        autoPlay
        loop
        muted
        playsInline
        onEnded={(e) => { const v = e.target as HTMLVideoElement; v.play(); }}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-50"
      />

      {/* ── Dark Semi-transparent Overlay ─────────────────────── */}
      <div className="fixed inset-0 w-full h-full bg-black/60 z-0 pointer-events-none" />

      {/* ── Glass Auth Card ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Festopiya Logo" className="w-11 h-auto mb-3 drop-shadow-xl" />
          <h1 className="text-center">
            <FestopiyaBranding className="text-3xl" center={true} />
          </h1>
          <p className="text-white/60 text-sm mt-1">Reset Your Password</p>
        </div>

        <Suspense fallback={<div className="text-white text-center py-4">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
