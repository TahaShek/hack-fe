"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  console.log("[Socket] connectSocket called, token:", token ? `${token.substring(0, 20)}... (len=${token.length})` : "EMPTY");

  // Don't connect with invalid tokens
  if (!token || token === "undefined" || token === "null" || token.length < 10) {
    console.warn("[Socket] Skipping connection — invalid token");
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null as unknown as Socket;
  }

  if (socket?.connected) {
    console.log("[Socket] Already connected, reusing socket:", socket.id);
    return socket;
  }

  // Disconnect existing broken socket before creating new one
  if (socket) {
    console.log("[Socket] Disconnecting stale socket before reconnect");
    socket.disconnect();
    socket = null;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  console.log("[Socket] Creating new connection to:", origin, "path: /api/socketio");

  socket = io(origin, {
    path: "/api/socketio",
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] ✅ Connected successfully! id:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] ❌ Connection error:", err.message);
    console.error("[Socket] Error details:", JSON.stringify({ type: (err as unknown as Record<string, unknown>).type, description: (err as unknown as Record<string, unknown>).description }));
    // Stop retrying on auth errors
    if (err.message === "Invalid token" || err.message === "Authentication required") {
      console.warn("[Socket] Auth failed — stopping reconnection. Token starts with:", token.substring(0, 30));
      socket?.disconnect();
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log("[Socket] Reconnect attempt #" + attempt);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
