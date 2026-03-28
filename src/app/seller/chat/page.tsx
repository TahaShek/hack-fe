"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, Search, CheckCheck, Check, ArrowLeft } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { formatRelativeTime, generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export default function SellerChatPage() {
  const { conversations, activeConversationId, messages, setActiveConversation, addMessage, markAsSeen } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "seller-1";

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const conversationMessages = messages.filter((m) => m.conversationId === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  useEffect(() => {
    if (activeConversationId) markAsSeen(activeConversationId);
  }, [activeConversationId, markAsSeen]);

  const sendMessage = () => {
    if (!input.trim() || !activeConversationId) return;
    const msg: ChatMessage = {
      id: generateId(),
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: "TechVault",
      content: input,
      type: "text",
      seen: false,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
    setInput("");
  };

  return (
    <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <div className={`w-72 border-r border-zinc-800 flex flex-col ${activeConversationId ? "hidden md:flex" : "flex"}`}>
        <div className="p-3 border-b border-zinc-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input placeholder="Search..." className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.id !== currentUserId);
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors cursor-pointer ${
                  conv.id === activeConversationId ? "bg-violet-500/10" : "hover:bg-zinc-800/50"
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{other?.name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{other?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{conv.lastMessage?.content}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col ${!activeConversationId ? "hidden md:flex" : "flex"}`}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
              <button onClick={() => setActiveConversation("")} className="md:hidden text-zinc-400 cursor-pointer"><ArrowLeft size={20} /></button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{activeConversation.participants.find((p) => p.id !== currentUserId)?.name?.[0]}</span>
              </div>
              <p className="text-sm font-medium text-zinc-100">{activeConversation.participants.find((p) => p.id !== currentUserId)?.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMine ? "bg-violet-500 text-white rounded-br-md" : "bg-zinc-800 text-zinc-200 rounded-bl-md"}`}>
                      {msg.type === "image" && msg.imageUrl && <img src={msg.imageUrl} alt="" className="rounded-lg max-w-xs mb-1" />}
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"><ImageIcon size={18} /></button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <button onClick={sendMessage} disabled={!input.trim()} className="p-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 cursor-pointer">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
