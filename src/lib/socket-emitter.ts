/**
 * Socket event emitter for use in API routes.
 *
 * Since API routes run in the same Node.js process as the custom server,
 * they can emit socket events by importing the global io instance.
 *
 * Usage in API routes:
 *   import { emitToUser, emitToRole, emitNotification } from "@/lib/socket-emitter";
 *   emitNotification(userId, { type: "order", title: "...", message: "..." });
 */

import type { Server as SocketIOServer } from "socket.io";

// Use globalThis to share the io instance across module boundaries.
// Next.js API routes may get a different module instance than server.ts,
// so a module-level `let io` won't work. globalThis persists across all.
const GLOBAL_IO_KEY = "__socket_io_instance__" as const;

function getIOFromGlobal(): SocketIOServer | null {
  return (globalThis as Record<string, unknown>)[GLOBAL_IO_KEY] as SocketIOServer | null ?? null;
}

export function setIO(server: SocketIOServer) {
  (globalThis as Record<string, unknown>)[GLOBAL_IO_KEY] = server;
  console.log("[SocketEmitter] IO instance registered globally");
}

export function getIO(): SocketIOServer | null {
  return getIOFromGlobal();
}

export function emitToUser(userId: string, event: string, data: unknown) {
  const io = getIOFromGlobal();
  if (!io) {
    console.warn("[SocketEmitter] IO not initialized — cannot emit to user:", userId, event);
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: unknown) {
  const io = getIOFromGlobal();
  if (!io) {
    console.warn("[SocketEmitter] IO not initialized — cannot emit to role:", role, event);
    return;
  }
  io.to(`role:${role}`).emit(event, data);
}

export function emitNotification(
  userId: string,
  notification: {
    type: "order" | "promo" | "system" | "chat";
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) {
  emitToUser(userId, "notification:new", {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...notification,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function broadcastNotification(
  notification: {
    type: "order" | "promo" | "system" | "chat";
    title: string;
    message: string;
  },
  targetRole?: string
) {
  const payload = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...notification,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (targetRole) {
    emitToRole(targetRole, "notification:new", payload);
  } else {
    const io = getIOFromGlobal();
    io?.emit("notification:new", payload);
  }
}
