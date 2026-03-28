"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Search,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { formatRelativeTime } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    setActiveConversation,
    addMessage,
    markAsSeen,
  } = useChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "buyer-1";

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  useEffect(() => {
    if (activeConversationId) {
      markAsSeen(activeConversationId);
    }
  }, [activeConversationId, markAsSeen]);

  const sendMessage = () => {
    if (!input.trim() || !activeConversationId) return;
    const msg: ChatMessage = {
      id: generateId(),
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: "John Doe",
      content: input,
      type: "text",
      seen: false,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      const other = activeConversation?.participants.find((p) => p.id !== currentUserId);
      if (other) {
        addMessage({
          id: generateId(),
          conversationId: activeConversationId,
          senderId: other.id,
          senderName: other.name,
          content: "Thanks for your message! I'll get back to you shortly.",
          type: "text",
          seen: false,
          createdAt: new Date().toISOString(),
        });
      }
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Messages</h1>

      <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden h-[600px]">
        {/* Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-zinc-800 flex flex-col shrink-0 ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== currentUserId);
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors cursor-pointer ${
                    isActive ? "bg-violet-500/10 border-l-2 border-violet-500" : "hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{other?.name?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-100 truncate">{other?.name}</p>
                      <span className="text-xs text-zinc-600 shrink-0">
                        {conv.lastMessage && formatRelativeTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-violet-500 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeConversationId ? "hidden md:flex" : "flex"}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                <button
                  onClick={() => setActiveConversation("")}
                  className="md:hidden text-zinc-400 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {activeConversation.participants.find((p) => p.id !== currentUserId)?.name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {activeConversation.participants.find((p) => p.id !== currentUserId)?.name}
                  </p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] space-y-1`}>
                        {msg.type === "image" && msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt=""
                            className="rounded-xl max-w-xs border border-zinc-700"
                          />
                        )}
                        {msg.content && (
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-violet-500 text-white rounded-br-md"
                                : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                        <div className={`flex items-center gap-1 ${isMine ? "justify-end" : ""}`}>
                          <span className="text-[10px] text-zinc-600">
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            msg.seen
                              ? <CheckCheck size={12} className="text-violet-400" />
                              : <Check size={12} className="text-zinc-600" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 cursor-pointer">
                    <ImageIcon size={20} />
                  </button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="p-2.5 rounded-lg bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
