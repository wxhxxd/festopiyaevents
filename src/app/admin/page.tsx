import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AdminDashboardClient from "./AdminDashboardClient";
import React from "react";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();

  // Create the Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if middleware handles session refreshes
          }
        },
      },
    }
  );

  // Fetch the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Strict email check (placeholder: admin@festopiya.com)
  const allowedAdminEmail = "abdulwaheed998922@gmail.com";
  const isAuthorized = user && user.email === allowedAdminEmail;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-[#0B0B11] text-zinc-300 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 text-center p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-6 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Access Denied</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            This portal is restricted to the owner of the Festopiya marketplace. If you believe this is an error, please verify your admin login credentials.
          </p>

          <a
            href="/auth"
            className="inline-flex items-center justify-center w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_0_rgba(239,68,68,0.25)]"
          >
            Admin Sign In
          </a>
        </div>
      </main>
    );
  }

  // Access Granted - Render Client Component
  return <AdminDashboardClient />;
}
