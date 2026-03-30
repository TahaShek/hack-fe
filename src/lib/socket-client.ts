"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket | null {
  // Don't connect with invalid tokens
  if (!token || token === "undefined" || token === "null" || token.length < 10) {
    if (socket) { socket.disconnect(); socket = null; }
    return null;
  }

  // Skip Socket.IO on Vercel/serverless — WebSockets aren't supported
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return null;
  }

  if (socket?.connected) return socket;

  // Disconnect existing broken socket before creating new one
  if (socket) { socket.disconnect(); socket = null; }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  socket = io(origin, {
    path: "/api/socketio",
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 3000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    if (err.message === "Invalid token" || err.message === "Authentication required") {
      socket?.disconnect();
    }
  });

  socket.on("disconnect", () => {});

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
