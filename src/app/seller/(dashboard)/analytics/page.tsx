"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/services/api";
import type { SalesData } from "@/types";

const defaultCategoryData = [
  { name: "Electronics", value: 45 },
  { name: "Fashion", value: 25 },
  { name: "Home", value: 15 },
  { name: "Sports", value: 10 },
  { name: "Other", value: 5 },
];

const COLORS = ["#e07b39", "#9a4601", "#2563EB", "#3b82f6", "#60a5fa"];

const defaultTopProducts = [
  { name: "Bauhaus Edition Watch", sales: "342 Sales this month", revenue: "$8,200" },
  { name: "Archival Leather Tote", sales: "210 Sales this month", revenue: "$12,450" },
  { name: "Studio-X Headphones", sales: "188 Sales this month", revenue: "$5,120" },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1A1A1A",
    border: "1px solid #2A2A2A",
    borderRadius: "2px",
    fontSize: "12px",
    color: "#f5f0e8",
  },
  labelStyle: { color: "#a1a1aa" },
};

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [weeklySales, setWeeklySales] = useState<SalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState(defaultCategoryData);
  const [topProducts, setTopProducts] = useState(defaultTopProducts);
  const [grossRevenue, setGrossRevenue] = useState("$42,890.00");
  const [revenueChange, setRevenueChange] = useState("+12.4%");
  const [totalOrders, setTotalOrders] = useState("1,204");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/seller/analytics");
        if (res.data.success) {
          const d = res.data.data;
          if (d.weeklySales) setWeeklySales(d.weeklySales);
          if (d.monthlySales) setMonthlySales(d.monthlySales);
          if (d.categoryData) setCategoryData(d.categoryData);
          if (d.topProducts) setTopProducts(d.topProducts);
          if (d.grossRevenue) setGrossRevenue(d.grossRevenue);
          if (d.revenueChange) setRevenueChange(d.revenueChange);
          if (d.totalOrders) setTotalOrders(d.totalOrders);
        }
      } catch {
        // Use mock defaults
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const data = period === "weekly" ? weeklySales : monthlySales;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500 mb-2 block">Performance Overview</span>
          <h1 className="text-4xl font-light tracking-tighter text-white">Sales Analytics</h1>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900 px-4 py-2 rounded-sm border border-zinc-800">
          {(["weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs font-medium capitalize transition-colors cursor-pointer ${
                period === p ? "text-[#e07b39]" : "text-zinc-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid: Stats & Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Line Chart */}
        <div className="col-span-12 lg:col-span-8 bg-zinc-900/50 p-8 border border-zinc-800/50 rounded-sm flex flex-col h-[400px]" data-testid="revenue-graph">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-medium tracking-[0.1rem] uppercase text-zinc-500">Gross Revenue</p>
              {loading ? (
                <div className="h-8 w-32 bg-zinc-800 skeleton rounded-sm mt-1" />
              ) : (
                <h3 className="text-2xl font-light text-white">{grossRevenue}</h3>
              )}
            </div>
            <div className="flex items-center gap-2 text-[#e07b39]">
              <span className="text-xs font-medium">{revenueChange}</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9a4601" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9a4601" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#e07b39" fill="url(#revGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="col-span-12 lg:col-span-4 bg-zinc-900/50 p-8 border border-zinc-800/50 rounded-sm flex flex-col h-[400px]" data-testid="orders-graph">
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[0.1rem] uppercase text-zinc-500">Total Orders</p>
            {loading ? (
              <div className="h-8 w-20 bg-zinc-800 skeleton rounded-sm mt-1" />
            ) : (
              <h3 className="text-2xl font-light text-white">{totalOrders}</h3>
            )}
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="orders" fill="#2563EB" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products & Category Breakdown */}
      <div className="grid grid-cols-12 gap-8">
        {/* Top Selling Products */}
        <div className="col-span-12 lg:col-span-5" data-testid="top-products">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500 mb-6 block">Top Curation</span>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors rounded-sm">
                <div className="w-12 h-12 bg-zinc-800 overflow-hidden flex-shrink-0 rounded-sm" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{product.name}</h4>
                  <p className="text-xs text-zinc-500">{product.sales}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#e07b39] font-medium">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="col-span-12 lg:col-span-7 bg-zinc-900/30 p-8 border border-zinc-800/50 rounded-sm">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500 mb-6 block">Sales by Category</span>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
