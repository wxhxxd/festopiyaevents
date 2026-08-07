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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-[#262626] shadow-2xl z-[70] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-black shrink-0">
              <div className="flex items-center gap-3">
                {activeContext && !initialContext ? (
                  <button 
                    onClick={() => setActiveContext(null)}
                    className="p-1.5 -ml-1.5 hover:bg-[#262626] rounded-full text-white transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                ) : null}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center border-2 border-black overflow-hidden">
                      {activeContext ? (
                        <span className="text-white text-xs font-bold uppercase">{activeContext.title.charAt(0)}</span>
                      ) : (
                        <Inbox className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-white leading-tight">
                      {activeContext ? activeContext.title : "Messages"}
                    </h3>
                    <span className="text-xs text-[#A8A8A8]">
                      {activeContext ? "Active now" : "Your inbox"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-[#262626] rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Area */}
            {!activeContext ? (
              // Inbox Mode
              <div className="flex-1 overflow-y-auto p-0 scrollbar-hide bg-black">
                {inboxLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-[#A8A8A8] animate-spin" /></div>
                ) : inboxItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#A8A8A8]">
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
                      className="flex items-center gap-4 px-4 py-3 hover:bg-[#121212] cursor-pointer transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                        {item.other_user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-white text-sm font-semibold truncate">{item.other_user_name}</h4>
                        <p className="text-[#A8A8A8] text-sm truncate">{item.event_name}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              // Chat Mode
              <>
                {pitch && (
                  <div className="bg-[#121212] border-b border-[#262626] p-4 shrink-0">
                    {pitch.status === "Accepted" ? (
                      <div className="bg-[#262626] border border-[#333] rounded-xl p-4 text-center">
                        <span className="text-2xl">🤝</span>
                        <h4 className="text-sm font-semibold text-white mt-2">DEAL SECURED</h4>
                        <p className="text-[#A8A8A8] text-xs">Final Price: ₹{pitch.offered_price}</p>
                      </div>
                    ) : (
                      <div className="bg-[#262626] border border-[#333] rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#A8A8A8] text-xs font-semibold uppercase">Live Offer</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pitch.status === 'Pending' ? 'bg-[#3797f0]/20 text-[#3797f0]' : 'bg-gray-700 text-gray-300'}`}>
                            {pitch.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-[#A8A8A8] mb-0.5">{pitch.stall_type} Stall</p>
                            <p className="text-lg font-bold text-white">₹{pitch.offered_price}</p>
                          </div>
                          
                          {((role === "Organizer" && pitch.status === "Pending") || 
                            (role === "Vendor" && pitch.status === "Counter_Offered")) && (
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="number" 
                                  placeholder="Counter ₹" 
                                  value={counterPrice}
                                  onChange={e => setCounterPrice(e.target.value)}
                                  className="w-20 bg-black border border-[#333] rounded px-2 py-1 text-white text-xs outline-none focus:border-[#3797f0]"
                                />
                                <button 
                                  onClick={() => updatePitch(role === "Organizer" ? "Counter_Offered" : "Pending", parseFloat(counterPrice))}
                                  disabled={!counterPrice}
                                  className="px-2 py-1 bg-[#333] hover:bg-[#444] text-white rounded text-xs font-semibold disabled:opacity-50 transition-colors"
                                >
                                  Counter
                                </button>
                              </div>
                              <button 
                                onClick={() => updatePitch("Accepted")}
                                className="w-full px-2 py-1 bg-[#3797f0] hover:bg-[#287BC7] text-white rounded text-xs font-semibold transition-colors"
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

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-black">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#A8A8A8]">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                      <p>No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender === currentUser;
                      const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.sender !== msg.sender);
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 shrink-0">
                              {showAvatar ? (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white">
                                  {msg.sender.charAt(0).toUpperCase()}
                                </div>
                              ) : null}
                            </div>
                          )}
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                            {showAvatar && !isMe && (
                               <span className="text-[10px] font-semibold text-[#A8A8A8] mb-1 ml-1 truncate max-w-full">{msg.sender}</span>
                            )}
                            <div 
                              className={`px-3.5 py-2.5 text-[15px] leading-relaxed break-words ${
                                isMe 
                                  ? "bg-[#3797f0] text-white rounded-3xl" 
                                  : "bg-[#262626] text-white rounded-3xl"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>

                <form onSubmit={handleSend} className="p-3 bg-black border-t border-[#262626]">
                  <div className="relative flex items-center bg-[#262626] rounded-full px-1.5 py-1.5 focus-within:ring-1 focus-within:ring-[#3797f0]/50">
                    <div className="w-8 h-8 rounded-full bg-[#3797f0] flex items-center justify-center shrink-0 ml-0.5">
                       <User className="w-4 h-4 text-white" />
                    </div>
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message..."
                      className="flex-1 bg-transparent px-3 py-1.5 text-white placeholder:text-[#A8A8A8] focus:outline-none text-[15px]"
                    />
                    {newMessage.trim() ? (
                      <button 
                        type="submit"
                        disabled={loading}
                        className="text-[#3797f0] font-semibold text-[15px] px-3 py-1.5 hover:text-white transition-colors mr-1"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 opacity-0 text-[15px] pointer-events-none mr-1">Send</div>
                    )}
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
