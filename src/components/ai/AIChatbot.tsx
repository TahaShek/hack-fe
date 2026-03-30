"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Sparkles, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import api from "@/services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: { label: string; href: string };
}

const quickReplies = [
  "Track my order",
  "Return policy",
  "Product recommendations",
  "Shipping info",
  "Talk to a human",
];

export default function AIChatbot() {
  const router = useRouter();
  const { chatbotOpen, toggleChatbot } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your MARKIT AI assistant. I can help you track orders, check return policies, get shipping info, or recommend products. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post("/ai/chatbot", {
        message: text,
      });

      if (res.data.success) {
        const botResponse = res.data.data;
        const intent = botResponse.intent;

        // Map intents to actionable buttons
        let action: { label: string; href: string } | undefined;
        if (intent === "order_status") {
          action = { label: "View My Orders", href: "/dashboard" };
        } else if (intent === "return_request") {
          action = { label: "Go to My Orders", href: "/dashboard" };
        } else if (intent === "escalate") {
          action = { label: "Open Live Chat", href: "/chat" };
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: botResponse.response || botResponse.message || botResponse,
            action,
          },
        ]);
      } else {
        throw new Error("API returned unsuccessful");
      }
    } catch {
      // Fallback: local intent matching
      const lowerText = text.toLowerCase();
      let response: string;
      let action: { label: string; href: string } | undefined;

      if (lowerText.includes("track") || lowerText.includes("order status") || lowerText.includes("where is my order")) {
        response = "I can help you track your order! Please visit Dashboard > My Orders to see real-time tracking for all your orders. You can also share your order number (e.g. NXM-10001) and I'll look it up for you.";
        action = { label: "View My Orders", href: "/dashboard" };
      } else if (lowerText.includes("return") || lowerText.includes("refund") || lowerText.includes("exchange")) {
        response = "Our return policy allows returns within 7 days of delivery. Items must be unused and in original packaging. To start a return, go to Dashboard > My Orders, find your order, and click 'Request Return'. Need help with a specific order?";
        action = { label: "Go to My Orders", href: "/dashboard" };
      } else if (lowerText.includes("shipping") || lowerText.includes("delivery") || lowerText.includes("charge")) {
        response = "We offer two shipping options:\n• Standard (3-5 days): $5.99\n• Express (1-2 days): $15.99\n\nAll orders include tracking.";
      } else if (lowerText.includes("recommend") || lowerText.includes("suggest") || lowerText.includes("product")) {
        response = "Check out our AI-powered recommendations on the homepage! They're personalized based on your browsing history and past purchases. You can also use the smart search bar to discover products with typo-tolerant search.";
        action = { label: "Browse Products", href: "/products" };
      } else if (lowerText.includes("human") || lowerText.includes("agent") || lowerText.includes("talk to") || lowerText.includes("support")) {
        response = "I'll connect you with a human agent right away.";
        action = { label: "Open Live Chat", href: "/chat" };
      } else {
        response = "I can help you with:\n• Order tracking — ask about your order status\n• Returns & refunds — learn about our return policy\n• Shipping info — delivery options and charges\n• Product recommendations — personalized suggestions\n• Human support — connect with our team\n\nWhat would you like to know?";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          action,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={toggleChatbot}
        data-testid="chatbot-widget"
        className="fixed bottom-6 right-6 z-50 h-16 w-16 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all rounded-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {chatbotOpen ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            data-testid="chatbot-panel"
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[520px] border border-[#dcc1b4]/15 bg-[#fef9f1] shadow-2xl flex flex-col overflow-hidden rounded-sm"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#dcc1b4]/15 bg-[#0D0D0D] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#e07b39]" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  MARKIT Intelligence
                </span>
              </div>
              <button
                onClick={toggleChatbot}
                data-testid="chatbot-close"
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
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
                    <div className="h-6 w-6 shrink-0 bg-[#9a4601]/10 flex items-center justify-center rounded-sm">
                      <Sparkles size={12} className="text-[#9a4601]" />
                    </div>
                  )}
                  <div
                    data-testid={msg.role === "assistant" ? "bot-message" : undefined}
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed rounded-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#9a4601] to-[#e07b39] text-white"
                        : "bg-[#f8f3eb] text-[#1d1c17]"
                    }`}
                  >
                    {msg.content}
                    {msg.action && (
                      <button
                        onClick={() => {
                          router.push(msg.action!.href);
                          toggleChatbot();
                        }}
                        className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#9a4601] hover:text-[#e07b39] transition-colors cursor-pointer"
                      >
                        <ExternalLink size={10} />
                        {msg.action.label}
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-6 w-6 shrink-0 bg-[#e7e2da] flex items-center justify-center rounded-sm">
                      <User size={12} className="text-[#897367]" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="h-6 w-6 shrink-0 bg-[#9a4601]/10 flex items-center justify-center rounded-sm">
                    <Sparkles size={12} className="text-[#9a4601]" />
                  </div>
                  <div className="bg-[#f8f3eb] px-4 py-2.5 rounded-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2.5 flex gap-2 overflow-x-auto border-t border-[#dcc1b4]/15">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  disabled={isTyping}
                  data-testid="quick-reply"
                  className="shrink-0 px-3 py-1.5 border border-[#dcc1b4]/30 text-[10px] font-medium uppercase tracking-widest text-[#897367] hover:bg-[#ece8e0] hover:text-[#9a4601] transition-all cursor-pointer rounded-sm disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#dcc1b4]/15">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  data-testid="chatbot-input"
                  className="flex-1 border border-[#dcc1b4]/30 bg-white px-4 py-2.5 text-sm text-[#1d1c17] placeholder-[#897367] focus:outline-none focus:ring-1 focus:ring-[#9a4601] transition-all rounded-sm disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-r from-[#9a4601] to-[#e07b39] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer rounded-sm"
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
