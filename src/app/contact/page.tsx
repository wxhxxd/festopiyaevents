"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FestopiyaBranding from "@/components/FestopiyaBranding";
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Organizer",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission state
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <main className="flex-1 relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <MessageSquare className="h-4 w-4" />
            <span>We&rsquo;re Here to Help</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Contact <FestopiyaBranding className="text-3xl md:text-5xl inline-block align-middle ml-1" isLanding={true} />
          </h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg max-w-2xl mx-auto">
            Have questions about booking a stall, setting up an escrow deposit, or managing your campus fest? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Cards Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-pink-500/10 rounded-full blur-xl" />

              <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Us</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">For support, inquiries & partnerships</p>
                    <a href="mailto:support@festopiya.com" className="text-pink-400 font-medium hover:underline mt-1 block">
                      support@festopiya.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Headquarters</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Operating Hub</p>
                    <p className="text-zinc-300 font-medium mt-1">
                      Hyderabad, Telangana, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Support SLA</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Dedicated response window</p>
                    <p className="text-zinc-300 font-medium mt-1">
                      24 &ndash; 48 hours response time for event coordinators
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Banner */}
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-zinc-950 p-6 backdrop-blur-md">
              <h3 className="font-bold text-white text-base">Organizing a College Fest?</h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Need customized stall maps or bulk vendor onboarding for your engineering or degree college fest? Let us know in your message for expedited support.
              </p>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 md:p-10 backdrop-blur-xl shadow-2xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-zinc-300 text-sm max-w-md mx-auto">
                    Thank you for reaching out. A Festopiya event representative will review your request and get back to you shortly at <span className="text-white font-medium">{formData.email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", role: "Organizer", subject: "", message: "" });
                    }}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Send Us a Direct Message</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        I am a...
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-pink-500 transition-colors text-sm"
                      >
                        <option value="Organizer">Event / Fest Organizer</option>
                        <option value="Vendor">Food Stall / Local Vendor</option>
                        <option value="Sponsor">Sponsor / Brand Partner</option>
                        <option value="General">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Stall booking inquiry / Fest support"
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your event, stall requirements, or questions..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-xl hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
