"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import UiverseLoader from "@/components/UiverseLoader";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to the server. Please try again.");
      });
  }, [token]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center font-sans">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] p-10 flex flex-col items-center text-center overflow-hidden relative">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <img src="/logo.png" alt="Festopiya" className="w-11 h-auto mb-6" />

            {status === "loading" && (
              <>
                <div className="mb-6"><UiverseLoader /></div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifying your email…</h1>
                <p className="text-white/50 text-sm">Please wait a moment.</p>
              </>
            )}

            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">Email Verified! 🎉</h1>
                <p className="text-white/60 text-sm mb-8">{message}</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  Log In Now
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <XCircle className="w-20 h-20 text-rose-400 mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-white/60 text-sm mb-8">{message}</p>
                <button
                  onClick={() => router.push("/auth")}
                  className="px-8 py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <UiverseLoader />
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
