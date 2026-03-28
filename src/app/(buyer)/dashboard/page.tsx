"use client";

import { useState } from "react";
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
} from "lucide-react";
import { mockOrders, mockNotifications } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} className="text-accent" />,
  confirmed: <CheckCircle2 size={14} className="text-accent" />,
  packed: <Package size={14} className="text-accent" />,
  shipped: <Truck size={14} className="text-accent" />,
  delivered: <CheckCircle2 size={14} className="text-green-400" />,
};

const tabs = [
  { id: "orders" as const, label: "My Orders", icon: Package },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
];

export default function BuyerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "notifications">("orders");

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
      <div className="flex lg:gap-16">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-[#111111] flex items-center justify-center">
                <User size={16} className="text-[#6B7280]" />
              </div>
              <div>
                <p className="text-sm text-[#F5F5F5]">Guest User</p>
                <p className="text-[10px] text-[#6B7280]">buyer</p>
              </div>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#F5F5F5] bg-[rgba(255,255,255,0.03)] border-l-2 border-accent"
                    : "text-[#6B7280] hover:text-[#F5F5F5]"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
            <Link
              href="/wishlist"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#6B7280] hover:text-[#F5F5F5] transition-all"
            >
              <Heart size={16} /> Wishlist
            </Link>
            <Link
              href="/chat"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#6B7280] hover:text-[#F5F5F5] transition-all"
            >
              <MessageCircle size={16} /> Chat
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="flex lg:hidden border-b border-[rgba(255,255,255,0.06)] mb-8 gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "text-accent border-b-2 border-accent"
                    : "text-[#6B7280] hover:text-[#F5F5F5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-light text-[#F5F5F5] tracking-tight mb-10 hidden lg:block"
          >
            {activeTab === "orders" ? "My Orders" : "Notifications"}
          </motion.h1>

          {activeTab === "orders" ? (
            <div className="space-y-0">
              {mockOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="py-5 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.02)] transition-colors -mx-4 px-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {statusIcons[order.status]}
                      <span className="text-sm text-[#F5F5F5] font-mono">{order.orderNumber}</span>
                      <span className="text-xs text-[#6B7280]">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-medium ${
                        order.status === "shipped" ? "bg-accent/10 text-accent" :
                        order.status === "delivered" ? "bg-green-500/10 text-green-400" :
                        "bg-[rgba(255,255,255,0.05)] text-[#6B7280]"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-sm text-[#F5F5F5]">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex items-center gap-3 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="h-10 w-10 rounded-lg overflow-hidden bg-[#111111]">
                        <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-1">
                    {["pending", "confirmed", "packed", "shipped", "delivered"].map((step, idx) => {
                      const currentIdx = ["pending", "confirmed", "packed", "shipped", "delivered"].indexOf(order.status);
                      const done = idx <= currentIdx;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${done ? "bg-accent" : "bg-[rgba(255,255,255,0.1)]"}`} />
                          {idx < 4 && <div className={`flex-1 h-px ${done && idx < currentIdx ? "bg-accent/40" : "bg-[rgba(255,255,255,0.06)]"}`} />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {mockNotifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-4 py-5 border-b border-[rgba(255,255,255,0.06)] -mx-4 px-4 rounded-lg transition-colors ${
                    !notif.read ? "bg-accent/[0.02]" : ""
                  }`}
                >
                  <div className={`p-2 rounded-lg ${notif.read ? "bg-[#111111]" : "bg-accent/10"}`}>
                    <Bell size={14} className={notif.read ? "text-[#6B7280]" : "text-accent"} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#F5F5F5]">{notif.title}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{notif.message}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.2)] mt-2">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.read && <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
