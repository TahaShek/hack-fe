"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickReplies = [
  "Track my order",
  "Return policy",
  "Product recommendations",
  "Shipping info",
];

const botResponses: Record<string, string> = {
  "track my order":
    "I can help you track your order! Please go to Dashboard > My Orders to see real-time tracking. Your most recent order NXM-10001 is currently shipped and on its way!",
  "return policy":
    "Our return policy allows returns within 30 days of delivery. Items must be in original condition. Would you like me to start a return for a specific order?",
  "product recommendations":
    "Based on your browsing history, I'd recommend checking out our Wireless Noise-Cancelling Headphones and Smart Fitness Watch Pro. Both are top-rated! Want me to show more suggestions?",
  "shipping info":
    "We offer free shipping on orders over $50! Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available for $9.99.",
};

export default function AIChatbot() {
  const { chatbotOpen, toggleChatbot } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm NexaBot, your AI shopping assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const response =
        Object.entries(botResponses).find(([key]) =>
          lowerText.includes(key)
        )?.[1] ||
        "I'd be happy to help with that! For detailed assistance, you can also reach out to a seller directly through our chat feature. Is there anything specific I can help you with?";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
        },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-stone-950 shadow-lg shadow-gold/20 flex items-center justify-center cursor-pointer hover:shadow-gold/40 transition-all duration-300"
        whileHover={{ scale: 1.05, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
      >
        {chatbotOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] rounded-2xl glass shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-800/40 bg-gradient-to-r from-gold/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <Bot size={16} className="text-stone-950" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    NexaBot
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-stone-500">AI Assistant</span>
                  </div>
                </div>
                <Sparkles size={14} className="text-gold/60 ml-auto" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-6 w-6 shrink-0 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Bot size={12} className="text-gold" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-gold to-gold-dark text-stone-950 rounded-br-md"
                        : "bg-stone-800/60 text-stone-200 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-6 w-6 shrink-0 rounded-lg bg-stone-800 flex items-center justify-center">
                      <User size={12} className="text-stone-400" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2.5 flex gap-2 overflow-x-auto">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="shrink-0 px-3 py-1.5 rounded-xl border border-stone-800/60 text-xs text-stone-400 hover:bg-gold/5 hover:border-gold/20 hover:text-gold transition-all duration-300 cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-stone-800/40">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-stone-800/60 bg-stone-900/50 px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-stone-950 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
