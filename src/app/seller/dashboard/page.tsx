"use client";

import { useState } from "react";
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
import {
  mockSalesData,
  mockMonthlySalesData,
  mockOrders,
  mockProducts,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";

const summaryCards = [
  {
    label: "Total Sales",
    value: "$37,100",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Total Orders",
    value: "289",
    change: "+8.3%",
    up: true,
    icon: ShoppingCart,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Pending Orders",
    value: "12",
    change: "-4.1%",
    up: false,
    icon: Clock,
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Low Stock Alerts",
    value: "5",
    change: "+2",
    up: true,
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
];

export default function SellerDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const chartData =
    chartPeriod === "weekly" ? mockSalesData : mockMonthlySalesData;

  const lowStockProducts = mockProducts
    .filter((p) => p.stock <= 10 && p.stock > 0)
    .slice(0, 5);

  const pendingOrders = mockOrders
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-100 font-[family-name:var(--font-bodoni)]">
          Dashboard
        </h1>
        <p className="text-sm text-stone-500 mt-1">Welcome back, TechVault!</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500">{card.label}</p>
                  <p className="text-2xl font-bold text-stone-100 mt-1">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.up ? (
                      <ArrowUpRight size={14} className="text-emerald-400" />
                    ) : (
                      <ArrowDownRight size={14} className="text-red-400" />
                    )}
                    <span
                      className={`text-xs ${
                        card.up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {card.change}
                    </span>
                    <span className="text-xs text-stone-600">vs last period</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-100">
            Sales Overview
          </h2>
          <div className="flex items-center gap-1 bg-stone-800/60 rounded-xl p-1">
            {(["weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 cursor-pointer capitalize ${
                  chartPeriod === period
                    ? "bg-gradient-to-r from-gold to-gold-dark text-stone-950"
                    : "text-stone-400 hover:text-stone-100"
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
                  <stop offset="5%" stopColor="#CA8A04" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#CA8A04" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
              <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
              <YAxis
                stroke="#78716c"
                fontSize={12}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  border: "1px solid #292524",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a8a29e" }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#CA8A04"
                fill="url(#salesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">
            Pending Orders
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-800/30 border border-stone-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/10">
                    <Clock size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-200">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-stone-500">{order.buyerName}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-100">
                  {formatCurrency(order.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-800/30 border border-stone-800/40"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-10 w-10 rounded-xl object-cover bg-stone-800"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-200 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold ${
                    product.stock <= 5 ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
