"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, Search, CheckCheck, Check, ArrowLeft } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useSocket } from "@/providers/SocketProvider";
import { useAuthStore } from "@/stores/auth-store";
import { formatRelativeTime, generateId } from "@/lib/utils";
import api from "@/services/api";
import type { ChatMessage } from "@/types";

export default function SellerChatPage() {
  const { conversations, activeConversationId, messages, typingUsers, setActiveConversation, setConversations, setMessages, addMessage, markAsSeen } = useChatStore();
  const { socket, isConnected, onlineUsers } = useSocket();
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = user?.id || "";
  const currentUserName = user?.name || "Seller";

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        if (res.data.success && Array.isArray(res.data.data)) {
          setConversations(res.data.data);
        }
      } catch {
        // conversations remain empty
      }
    };
    loadConversations();
  }, [setConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const loadMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${activeConversationId}/messages`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setMessages(res.data.data);
        }
      } catch {
        // messages remain as-is
      }
    };
    loadMessages();
  }, [activeConversationId, setMessages]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const conversationMessages = messages.filter((m) => m.conversationId === activeConversationId);
  const activeTypingUsers = activeConversationId
    ? (typingUsers[activeConversationId] || []).filter((id) => id !== currentUserId)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (!socket || !activeConversationId) return;
    socket.emit("chat:join", activeConversationId);
    socket.emit("chat:seen", { conversationId: activeConversationId });
    markAsSeen(activeConversationId);

    return () => {
      socket.emit("chat:leave", activeConversationId);
    };
  }, [socket, activeConversationId, markAsSeen]);

  const handleTyping = useCallback(() => {
    if (!socket || !activeConversationId) return;
    socket.emit("chat:typing", { conversationId: activeConversationId, isTyping: true });

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit("chat:typing", { conversationId: activeConversationId, isTyping: false });
    }, 2000);
    setTypingTimeout(timeout);
  }, [socket, activeConversationId, typingTimeout]);

  const sendMessage = () => {
    if (!input.trim() || !activeConversationId) return;
    const msg: ChatMessage = {
      id: generateId(),
      conversationId: activeConversationId,
      senderId: currentUserId,
      senderName: currentUserName,
      content: input,
      type: "text",
      seen: false,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);

    // Persist via API
    api.post(`/chat/conversations/${activeConversationId}/messages`, {
      content: input,
      type: "text",
      userName: currentUserName,
    }).catch(() => {});

    if (socket?.connected) {
      socket.emit("chat:message", {
        conversationId: activeConversationId,
        content: input,
        type: "text",
        senderName: currentUserName,
      });
      socket.emit("chat:typing", { conversationId: activeConversationId, isTyping: false });
    }

    setInput("");
    if (typingTimeout) clearTimeout(typingTimeout);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const msg: ChatMessage = {
        id: generateId(),
        conversationId: activeConversationId,
        senderId: currentUserId,
        senderName: currentUserName,
        content: "Sent an image",
        type: "image",
        imageUrl: dataUrl,
        seen: false,
        createdAt: new Date().toISOString(),
      };
      addMessage(msg);
      api.post(`/chat/conversations/${activeConversationId}/messages`, {
        content: "Sent an image",
        type: "image",
        imageUrl: dataUrl,
        userName: currentUserName,
      }).catch(() => {});
      if (socket?.connected) {
        socket.emit("chat:message", {
          conversationId: activeConversationId,
          content: "Sent an image",
          type: "image",
          imageUrl: dataUrl,
          senderName: currentUserName,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex border border-zinc-800 bg-[#0D0D0D] overflow-hidden h-[calc(100vh-10rem)] rounded-sm">
      {/* Sidebar */}
      <div className={`w-72 border-r border-zinc-800 flex flex-col ${activeConversationId ? "hidden md:flex" : "flex"}`}>
        <div className="p-3 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500">
              Messages
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-zinc-600"}`} />
              <span className="text-[10px] text-zinc-600">{isConnected ? "Live" : "Offline"}</span>
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search..."
              className="w-full border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#e07b39] rounded-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" data-testid="conversation-list">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.id !== currentUserId);
            const isOnline = other ? onlineUsers.has(other.id) : false;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                data-testid="conversation-item"
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors cursor-pointer ${
                  conv.id === activeConversationId ? "bg-[#9a4601]/10" : "hover:bg-zinc-900/50"
                }`}
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{other?.name?.[0]}</span>
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#0D0D0D]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{other?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{conv.lastMessage?.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="h-4 min-w-4 px-1 rounded-full bg-[#9a4601] text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
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
              <button onClick={() => setActiveConversation("")} className="md:hidden text-zinc-400 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div className="relative">
                <div className="h-8 w-8 rounded-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {activeConversation.participants.find((p) => p.id !== currentUserId)?.name?.[0]}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {activeConversation.participants.find((p) => p.id !== currentUserId)?.name}
                </p>
                {(() => {
                  const otherId = activeConversation.participants.find((p) => p.id !== currentUserId)?.id;
                  const isOnline = otherId ? onlineUsers.has(otherId) : false;
                  return (
                    <p className={`text-xs flex items-center gap-1 ${isOnline ? "text-emerald-400" : "text-zinc-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-600"}`} />
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  );
                })()}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <div className={`px-4 py-2 text-sm rounded-sm ${
                        isMine
                          ? "bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white"
                          : "bg-zinc-800 text-zinc-200"
                      }`}>
                        {msg.type === "image" && msg.imageUrl && (
                          <img src={msg.imageUrl} alt="" className="rounded-sm max-w-xs mb-1" />
                        )}
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] ${isMine ? "justify-end" : ""}`}>
                        <span className="text-zinc-600">{formatRelativeTime(msg.createdAt)}</span>
                        {isMine && (
                          msg.seen
                            ? <CheckCheck size={11} className="text-[#e07b39]" />
                            : <Check size={11} className="text-zinc-600" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {activeTypingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-zinc-800 rounded-sm px-4 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-zinc-800">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  data-testid="message-input"
                  className="flex-1 border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#e07b39] rounded-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  data-testid="send-message"
                  className="p-2 rounded-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
