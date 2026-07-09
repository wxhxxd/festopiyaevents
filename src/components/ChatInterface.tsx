"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2, MessageSquare, ArrowLeft, Inbox } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
  user_id: number;
}

interface InboxItem {
  event_id: number;
  event_name: string;
  vendor_id: number;
  vendor_name: string;
  other_user_id: number;
  other_user_name: string;
}

interface Pitch {
  id: number;
  event_id: number;
  vendor_id: number;
  stall_type: string;
  offered_price: number;
  status: string;
}

export interface ChatContext {
  eventId: number;
  vendorId?: number;
  receiverId: number;
  title: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: ChatContext | null;
}

export default function ChatInterface({ isOpen, onClose, initialContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [activeContext, setActiveContext] = useState<ChatContext | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const company = localStorage.getItem("company_name");
    const role = localStorage.getItem("role");
    if (company && role) {
      setCurrentUser(`${company} (${role})`);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialContext) {
        setActiveContext(initialContext);
      } else {
        setActiveContext(null);
        fetchInbox();
      }
    }
  }, [isOpen, initialContext]);

  const fetchInbox = async () => {
    try {
      setInboxLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/inbox`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInboxItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch inbox", err);
    } finally {
      setInboxLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeContext) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages?event_id=${activeContext.eventId}${activeContext.vendorId ? `&vendor_id=${activeContext.vendorId}` : ''}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      const pitchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/for-chat?event_id=${activeContext.eventId}${activeContext.vendorId ? `&vendor_id=${activeContext.vendorId}` : ''}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (pitchRes.ok) {
        const pitchData = await pitchRes.json();
        setPitch(pitchData);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    if (isOpen && activeContext) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isOpen, activeContext]);

  useEffect(() => {
    if (activeContext) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeContext]);

  const updatePitch = async (status: string, price?: number) => {
    if (!pitch) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pitches/${pitch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status, offered_price: price ?? pitch.offered_price })
      });
      if (res.ok) {
        const updated = await res.json();
        setPitch(updated);
        setCounterPrice("");
      }
    } catch (err) {
      console.error("Failed to update pitch", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContext) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newMessage.trim(),
          event_id: activeContext.eventId,
          receiver_id: activeContext.receiverId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Failed to send:", JSON.stringify(errorData, null, 2));
      } else {
        setNewMessage("");
        await fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
  const accentColor = role === "Organizer" ? "indigo" : "rose";
  const fromColor = role === "Organizer" ? "from-indigo-500" : "from-pink-500";
  const toColor = role === "Organizer" ? "to-purple-500" : "to-rose-500";
  const ringColor = role === "Organizer" ? "focus:ring-indigo-400/50" : "focus:ring-rose-400/50";
  const borderColor = role === "Organizer" ? "focus:border-indigo-400" : "focus:border-rose-400";
  const hoverFromColor = role === "Organizer" ? "hover:from-indigo-400" : "hover:from-pink-400";
  const hoverToColor = role === "Organizer" ? "hover:to-purple-400" : "hover:to-rose-400";
  const shadowColor = role === "Organizer" ? "shadow-indigo-500/30" : "shadow-rose-500/30";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-2xl border-l border-gray-200 dark:border-white/10 shadow-[-10px_0_50px_rgba(0,0,0,0.15)] dark:shadow-[-10px_0_50px_rgba(0,0,0,0.8)] z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                {activeContext && !initialContext ? (
                  <button 
                    onClick={() => setActiveContext(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/20 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : null}
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${fromColor} ${toColor} flex items-center justify-center shadow-lg ${shadowColor}`}>
                  {activeContext ? <User className="text-white w-5 h-5" /> : <Inbox className="text-white w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {activeContext ? activeContext.title : "Messages Inbox"}
                  </h3>
                  <p className="text-gray-500 dark:text-white/50 text-xs">
                    {activeContext ? "Private Conversation" : "Your active threads"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/20 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Area */}
            {!activeContext ? (
              // Inbox Mode
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {inboxLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-gray-400 dark:text-white/50 animate-spin" /></div>
                ) : inboxItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-white/30">
                    <Inbox className="w-12 h-12 mb-3 opacity-50" />
                    <p>Your inbox is empty.</p>
                  </div>
                ) : (
                  inboxItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setActiveContext({
                        eventId: item.event_id,
                        vendorId: item.vendor_id,
                        receiverId: item.other_user_id,
                        title: role === "Vendor" ? `Organizer of ${item.event_name}` : `${item.vendor_name} (${item.event_name})`
                      })}
                      className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-all flex items-center gap-4 group"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-black/5 to-black/10 dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white group-hover:border-${accentColor}-500/50 transition-colors`}>
                        {item.other_user_name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-gray-900 dark:text-white font-bold truncate">{item.other_user_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-white/50 truncate">{item.event_name}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              // Chat Mode
              <>
                {pitch && (
                  <div className="bg-black/5 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 p-4 shrink-0">
                    {pitch.status === "Accepted" ? (
                      <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl text-emerald-400">✓</span>
                        </div>
                        <h4 className="text-xl font-bold text-emerald-300">DEAL SECURED</h4>
                        <p className="text-emerald-100/70 font-medium text-lg">Final Price: ₹{pitch.offered_price}</p>
                      </div>
                    ) : (
                      <div className="bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-700 dark:text-white/70 font-semibold text-sm uppercase tracking-wider">Live Offer</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pitch.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {pitch.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{pitch.stall_type} Stall</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{pitch.offered_price}</p>
                          </div>
                          
                          {((role === "Organizer" && pitch.status === "Pending") || 
                            (role === "Vendor" && pitch.status === "Counter_Offered")) && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  placeholder="Counter ₹" 
                                  value={counterPrice}
                                  onChange={e => setCounterPrice(e.target.value)}
                                  className="w-24 bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-400/50"
                                />
                                <button 
                                  onClick={() => updatePitch(role === "Organizer" ? "Counter_Offered" : "Pending", parseFloat(counterPrice))}
                                  disabled={!counterPrice}
                                  className="px-3 py-1.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                  Counter
                                </button>
                              </div>
                              <button 
                                onClick={() => updatePitch("Accepted")}
                                className="w-full px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
                              >
                                Accept Offer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-white/30">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                      <p>No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender === currentUser;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 mb-1 px-1 tracking-wide uppercase">
                            {msg.sender}
                          </span>
                          <div 
                            className={`max-w-[85%] p-3.5 text-sm leading-relaxed ${
                              isMe 
                                ? `bg-gradient-to-br ${fromColor} ${toColor} text-white rounded-2xl rounded-tr-sm shadow-lg ${shadowColor}` 
                                : "bg-black/5 dark:bg-white/10 border border-gray-250 dark:border-white/10 text-gray-900 dark:text-white/90 rounded-2xl rounded-tl-sm backdrop-blur-md"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-white/30 mt-1.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/5 relative">
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message..."
                      className={`w-full bg-black/5 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full py-3.5 pl-5 pr-14 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none ${borderColor} focus:ring-1 ${ringColor} transition-all shadow-inner`}
                    />
                    <button 
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className={`absolute right-2 w-10 h-10 rounded-full bg-gradient-to-r ${fromColor} ${toColor} flex items-center justify-center text-white ${hoverFromColor} ${hoverToColor} disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${shadowColor}`}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-[-2px]" />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
