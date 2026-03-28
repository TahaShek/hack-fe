"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Package, CheckCircle2, Clock, Search, ArrowRight } from "lucide-react";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

export default function SellerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState("");

  const filtered = statusFilter === "all"
    ? mockOrders
    : mockOrders.filter((o) => o.status === statusFilter);

  const statusPipeline = [
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2, color: "text-blue-400" },
    { status: "packed", label: "Packed", icon: Package, color: "text-indigo-400" },
    { status: "shipped", label: "Shipped", icon: Truck, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Orders Management</h1>

      {/* Status Pipeline */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        {statusPipeline.map((step, i) => (
          <div key={step.status} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-zinc-800">
                <step.icon size={18} className={step.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">{step.label}</p>
                <p className="text-xs text-zinc-500">
                  {mockOrders.filter((o) => o.status === step.status).length} orders
                </p>
              </div>
            </div>
            {i < statusPipeline.length - 1 && (
              <ArrowRight size={16} className="text-zinc-600 ml-auto" />
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Input placeholder="Search orders..." icon={<Search size={16} />} />
        </div>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {["all", "pending", "confirmed", "packed", "shipped", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize ${
                statusFilter === s ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{order.orderNumber}</p>
                <p className="text-xs text-zinc-500">{formatDate(order.createdAt)} &middot; {order.buyerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-lg font-bold text-zinc-100">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50">
                  <img src={item.productImage} alt="" className="h-8 w-8 rounded object-cover" />
                  <div>
                    <p className="text-xs text-zinc-200 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-zinc-500">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {order.status === "pending" && (
                <Button size="sm">Confirm Order</Button>
              )}
              {order.status === "confirmed" && (
                <Button size="sm">Mark as Packed</Button>
              )}
              {order.status === "packed" && (
                <Button size="sm" onClick={() => setTrackingModal(order.id)}>
                  <Truck size={14} className="mr-1" /> Mark as Shipped
                </Button>
              )}
              {order.trackingId && (
                <span className="text-xs text-zinc-500">
                  Tracking: <span className="font-mono text-zinc-300">{order.trackingId}</span>
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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
            <Button onClick={() => { setTrackingModal(null); setTrackingId(""); }}>
              Confirm Shipment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
