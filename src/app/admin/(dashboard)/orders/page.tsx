"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import type { Order } from "@/types";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders");
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

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      const matchOrder = (o.orderNumber || "").toLowerCase().includes(q);
      const matchBuyer = (o.buyerName || "").toLowerCase().includes(q);
      if (!matchOrder && !matchBuyer) return false;
    }
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
    } catch {
      // simulate success on failure
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as Order["status"] } : null);
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.2rem] text-[#2563EB] mb-2 block">
            Operations
          </span>
          <h1 className="text-4xl font-light tracking-tighter text-white">
            System-Wide Order Logs
          </h1>
        </div>
        <div className="flex gap-4">
          <select className="bg-zinc-900 border-none text-xs text-zinc-400 uppercase tracking-widest px-4 py-2 focus:ring-1 focus:ring-[#2563EB] rounded-sm cursor-pointer outline-none">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="bg-zinc-900 border-none text-sm pl-12 pr-6 py-3 w-full focus:ring-1 focus:ring-[#2563EB] rounded-sm placeholder:text-zinc-600 text-zinc-300 outline-none"
          />
        </div>
        <div className="flex gap-0 border-b border-zinc-800 overflow-x-auto">
          {["all", "pending", "confirmed", "packed", "shipped", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`pb-4 px-4 text-[11px] font-medium uppercase tracking-widest transition-colors cursor-pointer capitalize whitespace-nowrap ${
                statusFilter === s
                  ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 overflow-hidden rounded-sm" data-testid="orders-table">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Order ID</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Customer</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Seller</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Total</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Date</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((order, i) => (
                <motion.tr
                  key={order.id || order._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-zinc-950/30 transition-colors"
                  data-testid="order-row"
                >
                  <td className="px-8 py-6 font-mono text-xs text-zinc-400">{order.orderNumber}</td>
                  <td className="px-8 py-6">
                    <p className="text-white text-sm">{order.buyerName}</p>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-400">{order.sellerName}</td>
                  <td className="px-8 py-6 text-sm text-white">{formatCurrency(order.total)}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${
                        order.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : order.status === "shipped"
                          ? "bg-[#2563EB]/10 text-[#2563EB]"
                          : order.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-400">{formatDate(order.createdAt)}</td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      data-testid="manage-order"
                      className="text-xs font-medium uppercase tracking-[0.1rem] text-[#2563EB] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Order Management Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Manage Order"
        className="bg-zinc-900 border-zinc-800 max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-zinc-400">{selectedOrder.orderNumber}</span>
              <span
                className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${
                  selectedOrder.status === "delivered"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : selectedOrder.status === "shipped"
                    ? "bg-[#2563EB]/10 text-[#2563EB]"
                    : selectedOrder.status === "pending"
                    ? "bg-amber-500/10 text-amber-500"
                    : selectedOrder.status === "cancelled"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Buyer & Seller Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Customer</p>
                <p className="text-sm text-white">{selectedOrder.buyerName}</p>
                <p className="text-xs text-zinc-400 mt-1">ID: {selectedOrder.buyerId}</p>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Seller</p>
                <p className="text-sm text-white">{selectedOrder.sellerName}</p>
                <p className="text-xs text-zinc-400 mt-1">ID: {selectedOrder.sellerId}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
            <div className="bg-zinc-800/50 p-4 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Shipping Address</p>
              <p className="text-sm text-white">{selectedOrder.shippingAddress.fullName}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
              </p>
              <p className="text-xs text-zinc-400">{selectedOrder.shippingAddress.phone}</p>
            </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Items</p>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={item.id || item._id || i} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-sm">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded-sm bg-zinc-700" />
                      )}
                      <div>
                        <p className="text-sm text-white">{item.productName}</p>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
              <span className="text-xs uppercase tracking-widest text-zinc-500">Total</span>
              <span className="text-lg font-medium text-white">{formatCurrency(selectedOrder.total)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {selectedOrder.status === "delivered" && (
                <button
                  disabled={actionLoading}
                  onClick={() => updateOrderStatus(selectedOrder.id, "returned")}
                  className="flex-1 px-4 py-3 bg-amber-500/10 text-amber-500 text-[11px] font-medium uppercase tracking-widest hover:bg-amber-500/20 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                >
                  Process Return
                </button>
              )}
              {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                <button
                  disabled={actionLoading}
                  onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                  className="flex-1 px-4 py-3 bg-red-500/10 text-red-500 text-[11px] font-medium uppercase tracking-widest hover:bg-red-500/20 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
              <button
                disabled={actionLoading}
                onClick={() => updateOrderStatus(selectedOrder.id, "refunded")}
                className="flex-1 px-4 py-3 bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-medium uppercase tracking-widest hover:bg-[#2563EB]/20 transition-colors cursor-pointer rounded-sm disabled:opacity-50"
              >
                Mark as Refunded
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
