"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Bell,
  Heart,
  MessageCircle,
  User,
  Star,
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import { useSocket } from "@/providers/SocketProvider";
import { useNotificationStore } from "@/stores/notification-store";
import type { Order, Notification } from "@/types";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} className="text-[#9a4601]" />,
  confirmed: <CheckCircle2 size={14} className="text-[#9a4601]" />,
  packed: <Package size={14} className="text-[#9a4601]" />,
  shipped: <Truck size={14} className="text-[#9a4601]" />,
  delivered: <CheckCircle2 size={14} className="text-[#00677e]" />,
};

const tabs = [
  { id: "orders" as const, label: "My Orders", icon: Package },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
];

export default function BuyerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "notifications">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotificationStore((s) => s.notifications);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  // Review modal state
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/buyer/orders");
        if (res.data.success) {
          const data = res.data.data;
          setOrders(Array.isArray(data) ? data : data?.orders || []);
        }
      } catch (err: unknown) {
        setOrders([]);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Re-fetch orders when receiving order status notifications via socket
  useEffect(() => {
    if (!socket) return;
    const handleOrderNotification = (notification: Notification) => {
      if (notification.type === "order") {
        // Re-fetch orders to get updated status
        api.get("/buyer/orders").then((res) => {
          if (res.data.success) {
            const data = res.data.data;
            setOrders(Array.isArray(data) ? data : data?.orders || []);
          }
        }).catch(() => {});
      }
    };
    socket.on("notification:new", handleOrderNotification);
    return () => { socket.off("notification:new", handleOrderNotification); };
  }, [socket]);

  const handleReturnSubmit = async () => {
    if (!returningOrderId || !returnReason.trim()) return;
    setReturnLoading(true);
    setReturnError(null);
    try {
      await api.post(`/buyer/orders/${returningOrderId}/return`, { reason: returnReason });
      setOrders((prev) =>
        prev.map((o) => (o.id === returningOrderId ? { ...o, status: "cancelled" as Order["status"] } : o))
      );
      setReturnSuccess(true);
      setTimeout(() => {
        setReturningOrderId(null);
        setReturnReason("");
        setReturnSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit return request. Please try again.";
      setReturnError(message);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewProductId || reviewRating === 0 || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await api.post(`/products/${reviewProductId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewOrderId(null);
        setReviewProductId(null);
        setReviewRating(0);
        setReviewComment("");
        setReviewSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to submit review. Please try again.");
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const activeOrder = orders[0];
  const canRequestReturn = activeOrder && (activeOrder.status === "delivered" || activeOrder.status === "shipped");

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-light tracking-tighter text-[#1d1c17] mb-2">Welcome back.</h1>
          <p className="text-sm text-[#554339] font-light max-w-md">
            Your curated collection and recent acquisitions, presented with Bauhaus precision.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Content (Orders) */}
        <section data-testid="orders-section" className="col-span-12 lg:col-span-8 space-y-8">
          {/* Tab bar */}
          <div className="flex gap-8 border-b border-[#dcc1b4]/15">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`pb-4 text-[11px] font-medium tracking-[0.1rem] uppercase transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#9a4601] text-[#1d1c17]"
                    : "text-[#897367] hover:text-[#9a4601]"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
            <Link
              href="/wishlist"
              data-testid="wishlist-link"
              className="pb-4 text-[11px] font-medium tracking-[0.1rem] uppercase text-[#897367] hover:text-[#9a4601] transition-colors flex items-center gap-2"
            >
              <Heart size={14} /> Wishlist
            </Link>
            <Link
              href="/chat"
              className="pb-4 text-[11px] font-medium tracking-[0.1rem] uppercase text-[#897367] hover:text-[#9a4601] transition-colors flex items-center gap-2"
            >
              <MessageCircle size={14} /> Chat
            </Link>
          </div>

          {activeTab === "orders" ? (
            <>
              {/* Orders Table */}
              <div className="bg-[#f8f3eb] p-8 rounded-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339]">Recent Orders</h2>
                  <button className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601] border-b border-[#9a4601]/20 pb-0.5 hover:border-[#9a4601] transition-all cursor-pointer">
                    View All History
                  </button>
                </div>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 bg-[#ece8e0] skeleton rounded-sm" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] border-b border-[#dcc1b4]/15">
                          <th className="py-4 font-medium">Order ID</th>
                          <th className="py-4 font-medium">Date</th>
                          <th className="py-4 font-medium">Total</th>
                          <th className="py-4 font-medium text-right">Status</th>
                          <th className="py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dcc1b4]/10">
                        {orders.map((order, i) => (
                          <motion.tr
                            key={order.id || order._id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            data-testid="order-row"
                            className="group hover:bg-[#ece8e0]/50 transition-colors"
                          >
                            <td className="py-4 font-mono text-sm text-[#1d1c17]">{order.orderNumber}</td>
                            <td className="py-4 text-sm font-light text-[#554339]">{formatDate(order.createdAt)}</td>
                            <td className="py-4 text-sm font-medium text-[#1d1c17]">{formatCurrency(order.total)}</td>
                            <td className="py-4 text-right">
                              <span data-testid="order-status" className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-medium uppercase tracking-wider ${
                                order.status === "shipped"
                                  ? "bg-[#9a4601]/10 text-[#9a4601]"
                                  : order.status === "delivered"
                                  ? "bg-[#00677e]/10 text-[#00677e]"
                                  : "bg-[#e7e2da] text-[#554339]"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {order.status === "delivered" && (
                                <button
                                  onClick={() => {
                                    setReviewOrderId(order.id || order._id || null);
                                    // If order has a single item, pre-select it
                                    if (order.items?.length === 1) {
                                      setReviewProductId(order.items[0].productId);
                                    } else {
                                      setReviewProductId(null);
                                    }
                                    setReviewRating(0);
                                    setReviewComment("");
                                    setReviewError(null);
                                    setReviewSuccess(false);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1rem] text-[#9a4601] bg-[#9a4601]/10 hover:bg-[#9a4601]/20 rounded-sm transition-colors cursor-pointer"
                                >
                                  <Star size={12} />
                                  Write Review
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Tracking Timeline */}
              {orders.length > 0 && (
                <div className="bg-[#f8f3eb] p-8 rounded-sm">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339] mb-1">Active Tracking</h2>
                      <p className="text-xl font-light text-[#1d1c17]">{activeOrder?.orderNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (canRequestReturn && activeOrder) {
                          setReturningOrderId(activeOrder.id);
                        }
                      }}
                      data-testid="return-request"
                      disabled={!canRequestReturn}
                      className={`px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1rem] rounded-sm transition-all cursor-pointer ${
                        canRequestReturn
                          ? "bg-[#9a4601] text-white hover:bg-[#7a3801]"
                          : "bg-[#e7e2da] text-[#897367] cursor-not-allowed"
                      }`}
                    >
                      Request Return
                    </button>
                  </div>

                  {/* Estimated Delivery */}
                  {activeOrder?.estimatedDeliveryDate && (
                    <div className="flex items-center gap-3 mb-6 bg-[#ece8e0]/60 px-5 py-3 rounded-sm">
                      <Truck size={16} className="text-[#9a4601] shrink-0" />
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#897367]">Estimated Delivery</p>
                        <p className="text-sm font-light text-[#1d1c17]">{formatDate(activeOrder.estimatedDeliveryDate)}</p>
                      </div>
                    </div>
                  )}

                  {/* Horizontal Timeline — dynamic based on actual order status */}
                  <div className="relative pt-8 pb-4">
                    <div className="absolute top-[41px] left-0 w-full h-px bg-[#dcc1b4]/30" />
                    <div className="flex justify-between items-center relative z-10">
                      {(() => {
                        const steps = ["Ordered", "Confirmed", "Packed", "Shipped", "Delivered"];
                        const statusToIndex: Record<string, number> = {
                          pending: 0, confirmed: 1, packed: 2, shipped: 3, delivered: 4,
                        };
                        const currentIdx = statusToIndex[activeOrder?.status || "pending"] ?? 0;
                        return steps.map((step, idx) => {
                          const isActive = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          return (
                            <div key={step} className={`flex flex-col items-center ${!isActive ? "opacity-30" : ""}`}>
                              <div className={`w-3 h-3 rounded-full mb-4 ring-8 ring-[#f8f3eb] ${
                                isActive ? "bg-[#9a4601]" : "bg-[#dcc1b4]"
                              } ${isCurrent ? "animate-pulse" : ""}`} />
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                isCurrent ? "text-[#9a4601]" : "text-[#1d1c17]"
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-0">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif.id || notif._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-4 py-5 border-b border-[#dcc1b4]/15 -mx-4 px-4 rounded-sm transition-colors ${
                    !notif.read ? "bg-[#9a4601]/[0.03]" : ""
                  }`}
                >
                  <div className={`p-2 rounded-sm ${notif.read ? "bg-[#f8f3eb]" : "bg-[#9a4601]/10"}`}>
                    <Bell size={14} className={notif.read ? "text-[#897367]" : "text-[#9a4601]"} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1d1c17] font-light">{notif.title}</p>
                    <p className="text-xs text-[#554339] mt-1 font-light">{notif.message}</p>
                    <p className="text-[10px] text-[#897367] mt-2">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.read && <div className="h-2 w-2 rounded-full bg-[#9a4601] mt-2 shrink-0" />}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar (Notifications summary) */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
          {/* Quick Notifications */}
          <div className="bg-[#f8f3eb] p-8 rounded-sm">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339] mb-6">Notifications</h2>
            <div className="space-y-6">
              {notifications.slice(0, 3).map((notif, i) => (
                <div key={notif.id || notif._id || i} className="pb-6 border-b border-[#dcc1b4]/15 last:border-0 last:pb-0 flex gap-4">
                  <Bell size={16} className={!notif.read ? "text-[#9a4601] mt-0.5" : "text-[#897367] mt-0.5"} />
                  <div>
                    <p className="text-sm font-light leading-tight text-[#1d1c17]">{notif.title}</p>
                    <span className="text-[10px] text-[#554339] font-light mt-1 block">{formatRelativeTime(notif.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#f8f3eb] p-8 rounded-sm space-y-4">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339] mb-4">Quick Links</h2>
            <Link href="/wishlist" className="flex items-center gap-3 text-sm font-light text-[#1d1c17] hover:text-[#9a4601] transition-colors">
              <Heart size={16} className="text-[#897367]" /> Saved Items
            </Link>
            <Link href="/chat" className="flex items-center gap-3 text-sm font-light text-[#1d1c17] hover:text-[#9a4601] transition-colors">
              <MessageCircle size={16} className="text-[#897367]" /> Messages
            </Link>
            <Link href="/products" className="flex items-center gap-3 text-sm font-light text-[#1d1c17] hover:text-[#9a4601] transition-colors">
              <Package size={16} className="text-[#897367]" /> Browse Products
            </Link>
          </div>
        </section>
      </div>

      {/* Return Request Modal */}
      <Modal
        isOpen={!!returningOrderId}
        onClose={() => {
          setReturningOrderId(null);
          setReturnReason("");
          setReturnSuccess(false);
          setReturnError(null);
        }}
        title="Request Return"
      >
        {returnSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-[#00677e] mx-auto mb-4" />
            <p className="text-lg font-light text-[#1d1c17]">Return request submitted</p>
            <p className="text-sm text-[#554339] mt-2">We will process your return shortly.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {returnError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                {returnError}
              </div>
            )}
            <p className="text-sm text-[#554339] font-light">
              Please tell us why you would like to return this order.
            </p>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                Reason for Return
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Describe the reason for your return..."
                rows={4}
                className="w-full bg-[#f8f3eb] border border-[#dcc1b4]/30 text-sm text-[#1d1c17] px-4 py-3 rounded-sm outline-none focus:border-[#9a4601] transition-colors resize-none placeholder:text-[#897367]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setReturningOrderId(null);
                  setReturnReason("");
                }}
                className="flex-1 px-4 py-3 bg-[#e7e2da] text-[#554339] text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#dcc1b4]/40 transition-colors cursor-pointer rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                disabled={returnLoading || !returnReason.trim()}
                className="flex-1 px-4 py-3 bg-[#9a4601] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#7a3801] transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                {returnLoading ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Write Review Modal */}
      <Modal
        isOpen={!!reviewOrderId}
        onClose={() => {
          setReviewOrderId(null);
          setReviewProductId(null);
          setReviewRating(0);
          setReviewComment("");
          setReviewSuccess(false);
          setReviewError(null);
        }}
        title="Write a Review"
      >
        {reviewSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-[#00677e] mx-auto mb-4" />
            <p className="text-lg font-light text-[#1d1c17]">Review submitted</p>
            <p className="text-sm text-[#554339] mt-2">Thank you for your feedback!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                {reviewError}
              </div>
            )}

            {/* Product selector — show if order has multiple items */}
            {(() => {
              const reviewOrder = orders.find((o) => (o.id || o._id) === reviewOrderId);
              if (!reviewOrder || (reviewOrder.items?.length ?? 0) <= 1) return null;
              return (
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                    Select Product
                  </label>
                  <div className="space-y-2">
                    {reviewOrder.items.map((item) => (
                      <button
                        key={item.productId}
                        onClick={() => {
                          setReviewProductId(item.productId);
                          setReviewError(null);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition-all cursor-pointer ${
                          reviewProductId === item.productId
                            ? "bg-[#9a4601]/10 border-2 border-[#9a4601]"
                            : "bg-[#f8f3eb] border border-[#dcc1b4]/30 hover:border-[#9a4601]/50"
                        }`}
                      >
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-sm"
                        />
                        <span className="text-sm text-[#1d1c17] font-light">{item.productName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Star Rating */}
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-3 block">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        star <= reviewRating
                          ? "text-[#9a4601] fill-[#9a4601]"
                          : "text-[#dcc1b4]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full bg-[#f8f3eb] border border-[#dcc1b4]/30 text-sm text-[#1d1c17] px-4 py-3 rounded-sm outline-none focus:border-[#9a4601] transition-colors resize-none placeholder:text-[#897367]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setReviewOrderId(null);
                  setReviewProductId(null);
                  setReviewRating(0);
                  setReviewComment("");
                  setReviewError(null);
                }}
                className="flex-1 px-4 py-3 bg-[#e7e2da] text-[#554339] text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#dcc1b4]/40 transition-colors cursor-pointer rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim() || !reviewProductId}
                className="flex-1 px-4 py-3 bg-[#9a4601] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#7a3801] transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
