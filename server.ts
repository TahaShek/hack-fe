import { config } from "dotenv";
// Load .env.local BEFORE anything else so JWT secrets match the API routes
config({ path: ".env.local" });

import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { verifyAccessToken } from "./src/lib/auth";
import { setIO } from "./src/lib/socket-emitter";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface SocketUser {
  id: string;
  role: "buyer" | "seller" | "admin";
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: dev ? "*" : process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // Register global IO instance for API route access
  setIO(io);

  // Track online users: userId -> Set<socketId>
  const onlineUsers = new Map<string, Set<string>>();

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("[Socket Auth] Incoming connection, token:", token ? `${token.substring(0, 30)}... (len=${token.length})` : "NONE");
    if (!token) {
      console.log("[Socket Auth] ❌ No token provided");
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = verifyAccessToken(token);
      console.log("[Socket Auth] ✅ Token verified — user:", decoded.id, "role:", decoded.role);
      (socket.data as { user: SocketUser }).user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      console.error("[Socket Auth] ❌ Token verification failed:", (err as Error).message);
      console.error("[Socket Auth] JWT_ACCESS_SECRET env:", process.env.JWT_ACCESS_SECRET ? `${process.env.JWT_ACCESS_SECRET.substring(0, 15)}...` : "NOT SET");
      console.error("[Socket Auth] Token first 50 chars:", token.substring(0, 50));
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    const userId = user.id;

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast online status
    io.emit("user:online", { userId });

    console.log(`[Socket] ${user.role}:${userId} connected (${socket.id})`);

    // Join user's personal room for targeted notifications
    socket.join(`user:${userId}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // ─── CHAT EVENTS ───

    socket.on("chat:join", (conversationId: string) => {
      socket.join(`chat:${conversationId}`);
      console.log(`[Socket] ${userId} joined chat:${conversationId}`);
    });

    socket.on("chat:leave", (conversationId: string) => {
      socket.leave(`chat:${conversationId}`);
    });

    socket.on("chat:message", (data: {
      conversationId: string;
      content: string;
      type: "text" | "image";
      imageUrl?: string;
      senderName: string;
    }) => {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        conversationId: data.conversationId,
        senderId: userId,
        senderName: data.senderName,
        content: data.content,
        type: data.type,
        imageUrl: data.imageUrl,
        seen: false,
        createdAt: new Date().toISOString(),
      };

      // Broadcast to others in conversation (exclude sender to prevent duplicates)
      socket.to(`chat:${data.conversationId}`).emit("chat:message", message);

      // Also send notification to conversation participants not in the room
      socket.to(`chat:${data.conversationId}`).emit("notification:new", {
        id: `notif_${Date.now()}`,
        type: "chat",
        title: `New message from ${data.senderName}`,
        message: data.content.substring(0, 100),
        read: false,
        createdAt: new Date().toISOString(),
        data: { conversationId: data.conversationId },
      });
    });

    socket.on("chat:typing", (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.conversationId}`).emit("chat:typing", {
        userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
      });
    });

    socket.on("chat:seen", (data: { conversationId: string }) => {
      socket.to(`chat:${data.conversationId}`).emit("chat:seen", {
        userId,
        conversationId: data.conversationId,
      });
    });

    // ─── ORDER EVENTS ───

    socket.on("order:new", (data: {
      sellerId: string;
      orderNumber: string;
      totalAmount: number;
      buyerName: string;
    }) => {
      io.to(`user:${data.sellerId}`).emit("notification:new", {
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: "order",
        title: "New Order Received!",
        message: `${data.buyerName} placed order #${data.orderNumber} — $${data.totalAmount.toFixed(2)}`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { orderNumber: data.orderNumber },
      });
    });

    socket.on("order:statusUpdate", (data: {
      orderId: string;
      status: string;
      buyerId: string;
      sellerName: string;
    }) => {
      // Notify buyer about order status change
      io.to(`user:${data.buyerId}`).emit("notification:new", {
        id: `notif_${Date.now()}`,
        type: "order",
        title: "Order Status Updated",
        message: `Your order #${data.orderId.slice(-6)} is now ${data.status}`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { orderId: data.orderId, status: data.status },
      });
    });

    // ─── PRODUCT EVENTS (admin) ───

    socket.on("product:approved", (data: { productId: string; productName: string; sellerId: string }) => {
      io.to(`user:${data.sellerId}`).emit("notification:new", {
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Product Approved",
        message: `Your product "${data.productName}" has been approved`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { productId: data.productId },
      });
    });

    socket.on("product:rejected", (data: { productId: string; productName: string; sellerId: string; reason?: string }) => {
      io.to(`user:${data.sellerId}`).emit("notification:new", {
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Product Rejected",
        message: `Your product "${data.productName}" was rejected${data.reason ? `: ${data.reason}` : ""}`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { productId: data.productId },
      });
    });

    // ─── PROMO / SYSTEM NOTIFICATIONS ───

    socket.on("promo:broadcast", (data: { title: string; message: string; targetRole?: string }) => {
      if (user.role !== "admin") return; // Only admins can broadcast
      const target = data.targetRole ? `role:${data.targetRole}` : undefined;
      const notification = {
        id: `notif_${Date.now()}`,
        type: "promo" as const,
        title: data.title,
        message: data.message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      if (target) {
        io.to(target).emit("notification:new", notification);
      } else {
        io.emit("notification:new", notification);
      }
    });

    // ─── INVENTORY ALERTS ───

    socket.on("inventory:lowStock", (data: { productId: string; productName: string; stock: number }) => {
      io.to(`user:${userId}`).emit("notification:new", {
        id: `notif_${Date.now()}`,
        type: "system",
        title: "Low Stock Alert",
        message: `"${data.productName}" has only ${data.stock} units left`,
        read: false,
        createdAt: new Date().toISOString(),
        data: { productId: data.productId },
      });
    });

    // ─── ONLINE STATUS ───

    socket.on("user:getOnline", (userIds: string[], callback: (online: string[]) => void) => {
      const online = userIds.filter((id) => onlineUsers.has(id) && onlineUsers.get(id)!.size > 0);
      callback(online);
    });

    // ─── DISCONNECT ───

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("user:offline", { userId });
        }
      }
      console.log(`[Socket] ${user.role}:${userId} disconnected`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
