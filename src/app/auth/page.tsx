"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Building2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [videoSrc, setVideoSrc] = useState("/club-bg.mp4.mp4");

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setVideoSrc("/auth-bg.mp4");
      } else {
        setVideoSrc("/club-bg.mp4.mp4");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Role (drives signup payload + top toggle) ─────────────────
  const [role, setRole] = useState<"Vendor" | "Organizer">("Vendor");

  // ── Form state ────────────────────────────────────────────────
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  // ── Submit handler ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403)
            throw new Error("📧 Please verify your email address before logging in. Check your inbox!");
          throw new Error(data.detail || "Failed to log in");
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("company_name", data.company_name);
        localStorage.setItem("role", data.role);

        if (data.role === "Organizer") router.push("/organizer/dashboard");
        else router.push("/vendor/dashboard");

      } else {
        // Signup — role comes from the top toggle, not a form field
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, company_name: companyName, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to sign up");

        // Auto-login after signup
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.detail || "Login failed");

        localStorage.setItem("token", loginData.access_token);
        localStorage.setItem("company_name", loginData.company_name);
        localStorage.setItem("role", loginData.role);

        if (loginData.role === "Organizer") router.push("/organizer/dashboard");
        else router.push("/vendor/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input className ────────────────────────────────────
  const inputCls =
    "w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-300 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all";

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans p-4">

      <video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-20"
      />
      {/* Semi-transparent overlay — absolute so it shares the same stacking context */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* ── Role Toggle Switch ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mb-6 flex items-center gap-1 bg-black/30 backdrop-blur-md border border-white/20 rounded-full p-1 shadow-lg"
      >
        {(["Vendor", "Organizer"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className="relative px-7 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer"
          >
            {role === r && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-full bg-white/20 border border-white/30 shadow-md"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-200 ${role === r ? "text-white" : "text-white/50"}`}>
              {r}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── Glass Auth Card ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Festopiya Logo" className="w-16 h-auto mb-3 drop-shadow-xl" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300 tracking-tight text-center">
            Festopiya
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {isLogin ? "Welcome back" : `Signing up as a ${role}`}
          </p>
        </div>

        {/* Log In / Sign Up tabs */}
        <div className="flex p-1 bg-black/20 rounded-2xl border border-white/10 mb-6 relative">
          <motion.div
            layoutId="auth-tab"
            className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/20 rounded-xl border border-white/20 shadow-md"
            initial={false}
            animate={{ left: isLogin ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${isLogin ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${!isLogin ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="company-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={inputCls}
                    placeholder="Company name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="Email address"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Password"
            />
          </div>

          {/* Error */}
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
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
            ) : (
              <span className="relative z-10 flex items-center gap-2">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
