"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Card from "@/components/ui/Card";
import api from "@/services/api";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface UserGrowthPoint {
  date: string;
  count: number;
}

const defaultOrderStatusDist = [
  { name: "Delivered", value: 65 },
  { name: "Shipped", value: 15 },
  { name: "Packed", value: 8 },
  { name: "Confirmed", value: 7 },
  { name: "Pending", value: 5 },
];

const COLORS = ["#10b981", "#2563EB", "#3b82f6", "#60a5fa", "#e07b39"];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#111111",
    border: "1px solid #27272a",
    borderRadius: "2px",
    fontSize: "12px",
  },
  labelStyle: { color: "#a1a1aa" },
};

type Period = "7d" | "30d" | "90d";

const periodLabels: Record<Period, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
};

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [orderStatusDist] = useState(defaultOrderStatusDist);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<Period>("30d");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);

  const fetchAnalytics = useCallback(async (period: Period) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?period=${period}`);
      if (res.data.success) {
        const d = res.data.data;

        // Map salesData to revenueData with formatted dates
        if (d.salesData && d.salesData.length > 0) {
          const mapped = d.salesData.map((item: { date: string; revenue: number; orders: number }) => ({
            date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            revenue: item.revenue,
            orders: item.orders,
          }));
          setRevenueData(mapped);

          // Calculate totals
          const total = d.salesData.reduce((sum: number, item: { revenue: number }) => sum + item.revenue, 0);
          const totalOrd = d.salesData.reduce((sum: number, item: { orders: number }) => sum + item.orders, 0);
          setTotalRevenue(total);
          setTotalOrders(totalOrd);

          // Calculate revenue change: compare second half to first half
          const mid = Math.floor(d.salesData.length / 2);
          const firstHalf = d.salesData.slice(0, mid).reduce((s: number, i: { revenue: number }) => s + i.revenue, 0);
          const secondHalf = d.salesData.slice(mid).reduce((s: number, i: { revenue: number }) => s + i.revenue, 0);
          const change = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;
          setRevenueChange(change);
        } else {
          setRevenueData([]);
          setTotalRevenue(0);
          setTotalOrders(0);
          setRevenueChange(0);
        }

        // Map categoryData: { category, count } -> { name, value }
        if (d.categoryData && d.categoryData.length > 0) {
          const totalCount = d.categoryData.reduce((sum: number, c: { count: number }) => sum + c.count, 0);
          const mapped = d.categoryData.map((c: { category: string; count: number }) => ({
            name: c.category || "Uncategorized",
            value: totalCount > 0 ? Math.round((c.count / totalCount) * 100) : 0,
          }));
          setCategoryData(mapped);
        }

        // Map userGrowth
        if (d.userGrowth && d.userGrowth.length > 0) {
          const mapped = d.userGrowth.map((u: { date: string; count: number }) => ({
            date: new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count: u.count,
          }));
          setUserGrowth(mapped);
        } else {
          setUserGrowth([]);
        }
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(activePeriod);
  }, [activePeriod, fetchAnalytics]);

  const handlePeriodChange = (period: Period) => {
    setActivePeriod(period);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
    return `$${value}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2rem] text-[#2563EB] mb-4">
            System Performance
          </p>
          <h1 className="text-5xl font-light tracking-tighter text-white">
            Platform Analytics
          </h1>
        </div>
        <div className="col-span-4 flex justify-end items-end pb-2">
          <div className="flex gap-4">
            {(["7d", "30d", "90d"] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`text-[11px] font-medium uppercase tracking-widest pb-1 transition-colors cursor-pointer ${
                  activePeriod === period
                    ? "border-b border-[#2563EB] text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Loading analytics...</span>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-7 bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm" data-testid="revenue-chart">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
                Revenue Trend
              </p>
              <h3 className="text-xl font-light text-white">Platform Revenue</h3>
            </div>
            <div className="flex gap-4 text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span className="text-zinc-400">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip {...tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#analyticsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                {loading ? "" : "No revenue data for this period"}
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="col-span-5 bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm" data-testid="categories-chart">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Market Demand
          </p>
          <h3 className="text-xl font-light text-white mb-10">Top Categories</h3>
          <div className="space-y-6">
            {categoryData.length > 0 ? (
              categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-400 mb-2">
                    <span>{cat.name}</span>
                    <span>{cat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 w-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] transition-all duration-500"
                      style={{ width: `${cat.value}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-600 text-sm">
                {loading ? "" : "No category data available"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Growth + Order Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm" data-testid="user-growth-chart">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Growth Metrics
          </p>
          <h3 className="text-xl font-light text-white mb-8">New Users</h3>
          <div className="h-64">
            {userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                {loading ? "" : "No user growth data for this period"}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm" data-testid="order-status-chart">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Fulfillment
          </p>
          <h3 className="text-xl font-light text-white mb-8">Order Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {orderStatusDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm" data-testid="order-volume-chart">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Volume
          </p>
          <h3 className="text-xl font-light text-white mb-8">Order Volume</h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="orders" fill="#2563EB" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                {loading ? "" : "No order data for this period"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Total Revenue
          </p>
          <h3 className="text-3xl font-light text-[#2563EB]">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className={`mt-8 text-[10px] uppercase tracking-[0.2rem] ${revenueChange >= 0 ? "text-emerald-500" : "text-red-400"}`}>
            {revenueChange >= 0 ? "+" : ""}{revenueChange}% vs prev period
          </p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Total Orders
          </p>
          <h3 className="text-3xl font-light text-white">
            {totalOrders.toLocaleString()}
          </h3>
          <p className="mt-8 text-[10px] uppercase tracking-[0.2rem] text-zinc-400">
            Last {periodLabels[activePeriod]}
          </p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/30 p-8 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.15rem] text-zinc-500 mb-1">
            Active Period
          </p>
          <h3 className="text-3xl font-light text-white">{periodLabels[activePeriod]}</h3>
          <div className="mt-8 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            <span className="text-[10px] uppercase tracking-[0.2rem] text-zinc-400">
              Live Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
