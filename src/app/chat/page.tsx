"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { useSocket } from "@/providers/SocketProvider";
import { useAuthStore } from "@/stores/auth-store";
import { formatRelativeTime } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import api from "@/services/api";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-[#9a4601] border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    setActiveConversation,
    setConversations,
    setMessages,
    addMessage,
    markAsSeen,
  } = useChatStore();

  const { socket, isConnected, onlineUsers } = useSocket();
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const sellerIdParam = searchParams.get("sellerId");
  const sellerNameParam = searchParams.get("sellerName");
  const currentUserId = user?.id || "";
  const currentUserName = user?.name || "User";

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
      } finally {
        setLoadingConversations(false);
      }
    };
    loadConversations();
  }, [setConversations]);

  // Auto-create or select conversation when navigating from product page with seller params
  useEffect(() => {
    if (!sellerIdParam || loadingConversations) return;

    // Check if a conversation with this seller already exists
    const existingConv = conversations.find((c) =>
      c.participants.some((p) => p.id === sellerIdParam)
    );

    if (existingConv) {
      setActiveConversation(existingConv.id);
    } else {
      // Create a new conversation with the seller
      const createConversation = async () => {
        try {
          const res = await api.post("/chat/conversations", {
            participantId: sellerIdParam,
            participantRole: "seller",
            participantName: sellerNameParam || "Seller",
            userName: currentUserName,
          });
          if (res.data.success && res.data.data) {
            const newConv = res.data.data;
            setConversations([newConv, ...conversations]);
            setActiveConversation(newConv.id || newConv._id);
          }
        } catch {
          // conversation creation failed silently
        }
      };
      createConversation();
    }
  }, [sellerIdParam, sellerNameParam, loadingConversations, conversations, currentUserName, setActiveConversation, setConversations]);

  // Load messages when conversation changes + poll every 3s for new messages
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
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, setMessages]);

  // Poll conversations list every 5s for new messages / unread counts
  useEffect(() => {
    const pollConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        if (res.data.success && Array.isArray(res.data.data)) {
          setConversations(res.data.data);
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(pollConversations, 5000);
    return () => clearInterval(interval);
  }, [setConversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId
  );
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

    // Optimistic local update
    addMessage(msg);

    // Persist via API and emit via socket
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601] block mb-2">
            Concierge
          </span>
          <h1 className="text-4xl font-light tracking-tighter text-[#1d1c17]">
            Messages
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-zinc-400"}`}
          />
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#897367]">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex rounded-sm border border-[#dcc1b4]/15 bg-[#f8f3eb] overflow-hidden h-[600px]">
        {/* Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-[#dcc1b4]/20 flex flex-col shrink-0 bg-[#f8f3eb] ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-[#dcc1b4]/20">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#897367]" />
              <input
                placeholder="Search conversations..."
                className="w-full rounded-sm border border-[#dcc1b4]/30 bg-white pl-9 pr-4 py-2 text-sm text-[#1d1c17] placeholder-[#897367] focus:outline-none focus:ring-1 focus:ring-[#9a4601]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto" data-testid="conversation-list">
            {conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== currentUserId);
              const isActive = conv.id === activeConversationId;
              const isOnline = other ? onlineUsers.has(other.id) : false;
              return (
                <button
                  key={conv.id || conv._id}
                  onClick={() => setActiveConversation(conv.id)}
                  data-testid="conversation-item"
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#9a4601]/5 border-l-2 border-[#9a4601]"
                      : "hover:bg-[#ece8e0]"
                  }`}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">{other?.name?.[0]}</span>
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#f8f3eb]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1d1c17] truncate">{other?.name}</p>
                      <span className="text-[10px] text-[#897367] shrink-0">
                        {conv.lastMessage && formatRelativeTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#897367] truncate mt-0.5">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-[#9a4601] text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!activeConversationId ? "hidden md:flex" : "flex"}`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[#dcc1b4]/20">
                <button
                  onClick={() => setActiveConversation("")}
                  className="md:hidden text-[#897367] cursor-pointer"
                >
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
                  <p className="text-sm font-medium text-[#1d1c17]">
                    {activeConversation.participants.find((p) => p.id !== currentUserId)?.name}
                  </p>
                  {(() => {
                    const otherId = activeConversation.participants.find((p) => p.id !== currentUserId)?.id;
                    const isOnline = otherId ? onlineUsers.has(otherId) : false;
                    return (
                      <p className={`text-xs flex items-center gap-1 ${isOnline ? "text-emerald-600" : "text-[#897367]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fef9f1]" data-testid="message-thread">
                {conversationMessages.map((msg, i) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <motion.div
                      key={msg.id || msg._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      data-testid="message-bubble"
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] space-y-1`}>
                        <span className={`text-[9px] font-medium uppercase tracking-widest block ${isMine ? "text-right text-[#9a4601]" : "text-[#897367]"}`}>
                          {isMine ? "You" : msg.senderName} &middot; {formatRelativeTime(msg.createdAt)}
                        </span>
                        {msg.type === "image" && msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt=""
                            className="rounded-sm max-w-xs border border-[#dcc1b4]/20"
                          />
                        )}
                        {msg.content && (
                          <div
                            className={`rounded-sm px-4 py-2.5 text-sm font-light leading-relaxed ${
                              isMine
                                ? "bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white"
                                : "bg-[#e7e2da] text-[#1d1c17]"
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                        <div className={`flex items-center gap-1 ${isMine ? "justify-end" : ""}`}>
                          {isMine && (
                            msg.seen
                              ? <CheckCheck size={12} className="text-[#9a4601]" />
                              : <Check size={12} className="text-[#897367]" />
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
                    <div className="bg-[#e7e2da] rounded-sm px-4 py-2.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#897367] animate-bounce [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#dcc1b4]/20">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="attachment-input"
                  onChange={handleImageSelect}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-sm text-[#897367] hover:text-[#1d1c17] hover:bg-[#f8f3eb] cursor-pointer"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <div className="flex-1 border-b border-[#897367]/30 pb-1">
                    <input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Write a message..."
                      data-testid="message-input"
                      className="w-full bg-transparent border-none text-sm font-light text-[#1d1c17] placeholder-[#897367] focus:outline-none focus:ring-0"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    data-testid="send-message"
                    className="p-3 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer rounded-sm"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#897367]">
              <p className="text-sm font-light">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
