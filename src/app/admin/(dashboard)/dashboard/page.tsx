"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  Package,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Card from "@/components/ui/Card";
import api from "@/services/api";
import type { Order, SalesData } from "@/types";

interface ActivityItem {
  icon: typeof Users | typeof Store | typeof ShoppingCart | typeof Package;
  text: React.ReactNode;
  time: string;
  dimmed?: boolean;
}

function deriveActivityFromOrders(orders: Order[]): ActivityItem[] {
  return orders.slice(0, 4).map((order) => {
    const isDelivered = order.status === "delivered";
    const isShipped = order.status === "shipped";
    const isPending = order.status === "pending";

    let icon: ActivityItem["icon"] = ShoppingCart;
    let text: React.ReactNode;
    let dimmed = false;

    if (isDelivered) {
      icon = Package;
      text = (<>Order <span className="text-[#2563EB] font-medium">{order.orderNumber}</span> delivered successfully.</>);
      dimmed = true;
    } else if (isShipped) {
      icon = Package;
      text = (<>Order <span className="text-[#2563EB] font-medium">{order.orderNumber}</span> shipped to <span className="text-[#2563EB] font-medium">{order.buyerName}</span>.</>);
    } else if (isPending) {
      icon = Clock;
      text = (<>New order <span className="text-[#2563EB] font-medium">{order.orderNumber}</span> placed by <span className="text-[#2563EB] font-medium">{order.buyerName}</span>.</>);
    } else {
      icon = ShoppingCart;
      text = (<>Order <span className="text-[#2563EB] font-medium">{order.orderNumber}</span> status changed to <span className="text-[#2563EB] font-medium">{order.status}</span>.</>);
    }

    return { icon, text, time: formatDate(order.createdAt), dimmed };
  });
}

const defaultMetrics = [
  { label: "Total Buyers", value: "12.4k", change: "+4.2%", icon: Users },
  { label: "Active Sellers", value: "842", change: "STABLE", isStable: true, icon: Store },
  { label: "Open Orders", value: "3,102", change: "+12%", icon: ShoppingCart },
  { label: "Gross Revenue", value: "$1.2M", change: "+8.5%", icon: DollarSign },
];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        if (res.data.success) {
          const d = res.data.data;
          // Map API data to metric cards
          const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
          const formatRev = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
          setMetrics([
            { ...defaultMetrics[0], value: formatNum(d.totalBuyers || 0), change: d.buyerGrowth ? `${d.buyerGrowth > 0 ? "+" : ""}${d.buyerGrowth}%` : "0%" },
            { ...defaultMetrics[1], value: formatNum(d.totalSellers || 0), change: d.sellerGrowth ? `${d.sellerGrowth > 0 ? "+" : ""}${d.sellerGrowth}%` : "STABLE" },
            { ...defaultMetrics[2], value: formatNum(d.totalOrders || 0), change: "" },
            { ...defaultMetrics[3], value: formatRev(d.totalRevenue || 0), change: "" },
          ]);
          if (d.recentOrders) {
            const rawOrders = Array.isArray(d.recentOrders) ? d.recentOrders : [];
            const orders = rawOrders.map((o: Record<string, unknown>) => ({
              ...o,
              id: o.id || o._id,
              status: o.orderStatus || o.status || "pending",
              total: o.totalAmount || o.total || 0,
            })) as Order[];
            setRecentOrders(orders);
            if (d.recentActivity) {
              setRecentActivity(d.recentActivity);
            } else {
              setRecentActivity(deriveActivityFromOrders(d.recentOrders));
            }
          }
          if (d.chartData) setChartData(d.chartData);
          setLoading(false);
          return;
        }
      } catch {
        // fallback
      }
      setRecentOrders([]);
      setRecentActivity([]);
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light tracking-tighter text-white">
            System Overview
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-light uppercase tracking-[0.1rem]">
            Platform Performance Metrics
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium tracking-widest text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 flex flex-col justify-between h-32 rounded-sm" data-testid={["total-buyers", "total-sellers", "total-orders", "total-revenue"][i]}>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-3 w-1/2 bg-zinc-800 skeleton rounded-sm" />
                  <div className="h-8 w-3/4 bg-zinc-800 skeleton rounded-sm" />
                </div>
              ) : (
                <>
                  <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500">
                    {m.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-[#2563EB]">
                      {m.value}
                    </span>
                    <span className={`text-[10px] font-medium ${(m as typeof defaultMetrics[number]).isStable ? "text-zinc-600" : "text-green-500"}`}>
                      {m.change}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Quick Actions / Activity */}
      <div className="grid grid-cols-12 gap-8">
        {/* Revenue Chart */}
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-sm" data-testid="platform-revenue-chart">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-white text-sm font-medium uppercase tracking-widest">
                  Platform Revenue
                </h3>
                <p className="text-zinc-600 text-[11px] mt-1 uppercase">
                  Trailing 30 Day performance
                </p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span className="w-3 h-[2px] bg-[#2563EB]" /> REVENUE
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                  <YAxis
                    stroke="#52525b"
                    fontSize={12}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #27272a",
                      borderRadius: "2px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    fill="url(#adminGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions + Activity */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          {/* Quick Actions */}
          <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-sm">
            <h3 className="text-white text-sm font-medium uppercase tracking-widest mb-6">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <button className="w-full py-4 bg-[#2563EB] text-white text-[11px] font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer">
                <Package size={14} />
                APPROVE PENDING PRODUCTS
              </button>
              <button className="w-full py-4 border border-zinc-800 text-zinc-400 text-[11px] font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer">
                <Users size={14} />
                REVIEW FLAGGED USERS
              </button>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="flex flex-col flex-grow" data-testid="recent-activity">
            <h3 className="text-white text-sm font-medium uppercase tracking-widest mb-4">
              Live Activity
            </h3>
            <div className="flex flex-col border-t border-zinc-800">
              {recentActivity.length === 0 && !loading ? (
                <div className="py-6 text-center text-zinc-600 text-xs uppercase tracking-widest">
                  No recent activity
                </div>
              ) : null}
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className={`py-4 border-b border-zinc-800 flex items-start gap-4 ${activity.dimmed ? "opacity-50" : ""}`}
                >
                  <div className="w-2 h-2 bg-[#2563EB] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-zinc-100 font-light">
                      {activity.text}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-white text-sm font-medium uppercase tracking-widest">
            Recent Orders
          </h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-[#2563EB] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {order.orderNumber}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase">
                      {order.buyerName} &middot; {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-100">
                    {formatCurrency(order.total)}
                  </p>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
