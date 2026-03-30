"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
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
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";
import type { Product, Order, SalesData } from "@/types";

interface DashboardData {
  totalRevenue: string;
  totalRevenueChange: string;
  activeOrders: string;
  activeOrdersChange: string;
  customerLTV: string;
  customerLTVChange: string;
  conversionRate: string;
  conversionRateChange: string;
  weeklySales: SalesData[];
  monthlySales: SalesData[];
  recentOrders: Order[];
  lowStockProducts: Product[];
}

function buildSummaryCards(d: DashboardData) {
  return [
    {
      label: "Total Revenue",
      value: d.totalRevenue || "$0.00",
      change: d.totalRevenueChange || "—",
      up: !d.totalRevenueChange?.startsWith("-"),
      icon: DollarSign,
      color: "text-[#e07b39]",
    },
    {
      label: "Total Orders",
      value: d.activeOrders || "0",
      change: d.activeOrdersChange || "0 pending",
      up: true,
      icon: ShoppingCart,
      color: "text-[#e07b39]",
    },
    {
      label: "Avg. Order Value",
      value: d.customerLTV || "$0",
      change: d.customerLTVChange || "—",
      up: true,
      icon: Clock,
      color: "text-[#e07b39]",
    },
    {
      label: "Performance",
      value: d.conversionRate || "0%",
      change: d.conversionRateChange || "—",
      up: true,
      icon: AlertTriangle,
      color: "text-[#e07b39]",
    },
  ];
}

export default function SellerDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("weekly");
  const [summaryCards, setSummaryCards] = useState<ReturnType<typeof buildSummaryCards>>([]);
  const [weeklySales, setWeeklySales] = useState<SalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<SalesData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/seller/dashboard");
        if (res.data.success) {
          const d = res.data.data as DashboardData;
          setSummaryCards(buildSummaryCards(d));
          setWeeklySales(d.weeklySales || []);
          setMonthlySales(d.monthlySales || []);
          setPendingOrders(d.recentOrders || []);
          setLowStockProducts(d.lowStockProducts || []);
        }
      } catch {
        // API failed — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const chartData = chartPeriod === "weekly" ? weeklySales : monthlySales;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500">Overview</span>
          <h1 className="text-4xl font-light tracking-tighter text-white mt-2">Performance Hub</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-zinc-900 text-white text-[11px] font-medium uppercase tracking-[0.1rem] border border-zinc-800 rounded-sm hover:bg-zinc-800 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-sm"
            data-testid={["total-sales", "total-orders", "pending-orders", "low-stock"][i]}
          >
            {loading ? (
              <div className="space-y-4">
                <div className="h-3 w-1/2 bg-zinc-800 skeleton rounded-sm" />
                <div className="h-8 w-3/4 bg-zinc-800 skeleton rounded-sm" />
                <div className="h-3 w-1/3 bg-zinc-800 skeleton rounded-sm" />
              </div>
            ) : (
              <>
                <span className="text-[10px] font-medium tracking-[0.1rem] uppercase text-zinc-500">
                  {card.label}
                </span>
                <p className="text-4xl font-semibold text-[#e07b39] mt-4">
                  {card.value}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[11px]">
                  {card.up ? (
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-400" />
                  )}
                  <span className={card.up ? "text-emerald-500" : "text-red-400"}>
                    {card.change}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm" data-testid="sales-graph">
        <div className="flex items-center justify-between mb-8">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400">
            REVENUE OVERVIEW
          </span>
          <div className="flex gap-4 text-xs font-medium text-zinc-500">
            {(["weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                data-testid={`graph-toggle-${period}`}
                className={`capitalize transition-colors cursor-pointer ${
                  chartPeriod === period
                    ? "text-[#e07b39]"
                    : "hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="salesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#9a4601" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9a4601" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
              <YAxis
                stroke="#52525b"
                fontSize={12}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "2px",
                  fontSize: "12px",
                  color: "#f5f0e8",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#e07b39"
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="col-span-12 lg:col-span-8 bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm" data-testid="recent-orders">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">
            RECENT ORDERS
          </span>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800 skeleton rounded-sm" />
              ))}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#2A2A2A]">
                  <th className="pb-4 font-medium">Order ID</th>
                  <th className="pb-4 font-medium">Customer</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#2A2A2A]/50">
                    <td className="py-4 font-mono text-zinc-400">{order.orderNumber}</td>
                    <td className="py-4 text-zinc-100">{order.buyerName}</td>
                    <td className="py-4">
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-sm uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium text-white">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm" data-testid="low-stock-list">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">
            LOW STOCK ALERTS
          </span>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-zinc-800 skeleton rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 shrink-0 rounded-sm overflow-hidden">
                    <img
                      src={product?.images?.[0] || '/placeholder.svg'}
                      alt={product?.name ?? ''}
                      className="w-full h-full object-cover grayscale opacity-80"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-100 truncate">{product.name}</p>
                    <p className={`text-[10px] font-medium ${product.stock <= 5 ? "text-red-500" : "text-orange-400"}`}>
                      {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left`}
                    </p>
                  </div>
                  <button className="text-[#e07b39] text-xs font-medium shrink-0">Restock</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
