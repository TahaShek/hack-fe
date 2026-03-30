"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Package, CheckCircle2, Clock, Search, ArrowRight, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import { useSocket } from "@/providers/SocketProvider";
import type { Order } from "@/types";

export default function SellerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);

  const startChat = async (order: Order) => {
    try {
      const buyerId = (order as unknown as Record<string, unknown>).buyerId;
      if (!buyerId) return;
      await api.post("/chat/conversations", {
        participantId: buyerId.toString(),
        participantRole: "buyer",
        participantName: order.buyerName,
        userName: authUser?.name || "Seller",
      });
      router.push("/seller/chat");
    } catch {
      // fail silently
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/seller/orders");
        if (res.data.success) {
          const data = res.data.data;
          setOrders(Array.isArray(data) ? data : data?.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string, trackId?: string) => {
    try {
      const res = await api.put(`/seller/orders/${orderId}/status`, {
        status: newStatus,
        trackingId: trackId,
      });
      const order = orders.find((o) => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus as Order["status"], trackingId: trackId || o.trackingId }
            : o
        )
      );

      // Emit notification via socket (since API route can't access IO)
      if (socket?.connected && order) {
        const updatedOrder = res.data?.data;
        const buyerId = updatedOrder?.buyerId || (order as unknown as Record<string, unknown>).buyerId;
        if (buyerId) {
          socket.emit("order:statusUpdate", {
            orderId,
            status: newStatus,
            buyerId: buyerId.toString(),
            sellerName: order.sellerName || "Seller",
          });
        }
      }
    } catch {
      // silently fail
    }
  };

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const statusPipeline = [
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "text-[#2563EB]" },
    { status: "packed", label: "Packed", icon: Package, color: "text-[#2563EB]" },
    { status: "shipped", label: "Shipped", icon: Truck, color: "text-[#2563EB]" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div className="space-y-2">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601]">Management</span>
          <h1 className="text-5xl font-light tracking-tighter text-white">Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "shipped", "returned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              data-testid={`status-filter-${s}`}
              className={`px-5 py-2 rounded-sm border text-xs font-medium tracking-wide capitalize transition-colors cursor-pointer ${
                statusFilter === s
                  ? "border-[#9a4601] text-[#e07b39]"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {s === "all" ? "All Orders" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-900/30 rounded-sm">
        {statusPipeline.map((step, i) => (
          <div key={step.status} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-800 rounded-sm">
                <step.icon size={18} className={step.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{step.label}</p>
                <p className="text-xs text-zinc-500">
                  {orders.filter((o) => o.status === step.status).length} orders
                </p>
              </div>
            </div>
            {i < statusPipeline.length - 1 && (
              <ArrowRight size={16} className="text-zinc-600 ml-auto" />
            )}
          </div>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800 skeleton rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="w-full border-t border-zinc-800 overflow-x-auto" data-testid="orders-table">
          <div className="min-w-[700px]">
          <div className="grid grid-cols-12 py-4 px-6 text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2 text-center">Date</div>
            <div className="col-span-2 text-center">Total</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {filtered.map((order, i) => (
            <motion.div
              key={order.id || order._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 py-6 px-6 items-center border-t border-zinc-900 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
            >
              <div className="col-span-2 font-mono text-zinc-300 text-sm">{order.orderNumber}</div>
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                  {order.buyerName.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-sm font-light text-zinc-100">{order.buyerName}</span>
              </div>
              <div className="col-span-2 text-center text-zinc-400 text-xs">{formatDate(order.createdAt)}</div>
              <div className="col-span-2 text-center text-zinc-100 text-sm font-medium">{formatCurrency(order.total)}</div>
              <div className="col-span-2 flex justify-center">
                <span className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm border ${
                  order.status === "shipped" ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20" :
                  order.status === "pending" || order.status === "confirmed" ? "bg-[#9a4601]/10 text-[#e07b39] border-[#9a4601]/20" :
                  order.status === "cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="col-span-1 text-right">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "confirmed")}
                    data-testid="action-confirm"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#e07b39] hover:text-white transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "packed")}
                    data-testid="action-pack"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#e07b39] hover:text-white transition-colors"
                  >
                    Pack
                  </button>
                )}
                {order.status === "packed" && (
                  <button
                    onClick={() => setTrackingModal(order.id)}
                    data-testid="action-ship"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#e07b39] hover:text-white transition-colors"
                  >
                    Ship
                  </button>
                )}
                {order.trackingId && (
                  <span className="text-[10px] text-zinc-500 font-mono">{order.trackingId}</span>
                )}
                <button
                  onClick={() => startChat(order)}
                  title="Message Buyer"
                  className="inline-block ml-2 text-zinc-600 hover:text-[#e07b39] transition-colors cursor-pointer"
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      <Modal
        isOpen={!!trackingModal}
        onClose={() => setTrackingModal(null)}
        title="Enter Tracking ID"
      >
        <div className="space-y-4">
          <Input
            label="Tracking ID"
            id="trackingId"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter shipping tracking number"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTrackingModal(null)}>Cancel</Button>
            <Button onClick={() => {
              if (trackingModal) {
                updateStatus(trackingModal, "shipped", trackingId);
              }
              setTrackingModal(null);
              setTrackingId("");
            }}>
              Confirm Shipment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
