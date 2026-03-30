"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket-client";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useChatStore } from "@/stores/chat-store";
import type { Notification, ChatMessage } from "@/types";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

export function useSocket() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadUser = useAuthStore((s) => s.loadUser);

  // Restore user object from server on mount (survives page refresh)
  useEffect(() => {
    loadUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateTypingStatus = useChatStore((s) => s.updateTypingStatus);
  const markConversationSeen = useChatStore((s) => s.markRemoteSeen);

  const handleConnect = useCallback(() => setIsConnected(true), []);
  const handleDisconnect = useCallback(() => setIsConnected(false), []);

  const handleNotification = useCallback(
    (notification: Notification) => {
      addNotification(notification);

      // Browser desktop notification
      try {
        if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
          });
        }
      } catch {
        // Notification API not available
      }
    },
    [addNotification]
  );

  const userId = useAuthStore((s) => s.user?.id);

  const handleChatMessage = useCallback(
    (message: ChatMessage) => {
      // Skip messages from self — already added optimistically
      if (message.senderId === userId) return;
      addMessage(message);
    },
    [addMessage, userId]
  );

  const handleTyping = useCallback(
    (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      updateTypingStatus(data.conversationId, data.userId, data.isTyping);
    },
    [updateTypingStatus]
  );

  const handleSeen = useCallback(
    (data: { userId: string; conversationId: string }) => {
      markConversationSeen(data.conversationId, data.userId);
    },
    [markConversationSeen]
  );

  const handleUserOnline = useCallback(
    (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    },
    []
  );

  const handleUserOffline = useCallback(
    (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    console.log("[SocketProvider] Effect triggered — isAuthenticated:", isAuthenticated, "token:", token ? `${token.substring(0, 20)}...` : null);
    if (!isAuthenticated || !token || token === "undefined" || token === "null" || token.length < 10) {
      console.log("[SocketProvider] Skipping socket connection — not authenticated or invalid token");
      disconnectSocket();
      setSocketInstance(null);
      setIsConnected(false);
      return;
    }

    // Request browser notification permission early (may be ignored without user gesture)
    if (typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
      window.Notification.requestPermission().catch(() => {});
    }

    console.log("[SocketProvider] Attempting socket connection...");
    const s = connectSocket(token);
    console.log("[SocketProvider] connectSocket returned:", s ? "socket instance" : "null");
    setSocketInstance(s);

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("notification:new", handleNotification);
    s.on("chat:message", handleChatMessage);
    s.on("chat:typing", handleTyping);
    s.on("chat:seen", handleSeen);
    s.on("user:online", handleUserOnline);
    s.on("user:offline", handleUserOffline);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("notification:new", handleNotification);
      s.off("chat:message", handleChatMessage);
      s.off("chat:typing", handleTyping);
      s.off("chat:seen", handleSeen);
      s.off("user:online", handleUserOnline);
      s.off("user:offline", handleUserOffline);
      disconnectSocket();
      setSocketInstance(null);
    };
  }, [isAuthenticated, token, handleConnect, handleDisconnect, handleNotification, handleChatMessage, handleTyping, handleSeen, handleUserOnline, handleUserOffline]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
