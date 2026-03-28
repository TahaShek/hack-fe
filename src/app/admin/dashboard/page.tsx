"use client";

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
import {
  mockMonthlySalesData,
  mockOrders,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Card from "@/components/ui/Card";

const metrics = [
  {
    label: "Total Buyers",
    value: "12,450",
    change: "+15.3%",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Total Sellers",
    value: "1,234",
    change: "+8.7%",
    icon: Store,
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    label: "Total Orders",
    value: "34,567",
    change: "+22.1%",
    icon: ShoppingCart,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Total Revenue",
    value: "$2.4M",
    change: "+18.5%",
    icon: DollarSign,
    color: "text-gold",
    bg: "bg-gold/10",
  },
];

export default function AdminDashboardPage() {
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-100 font-[family-name:var(--font-bodoni)]">
        Platform Dashboard
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-500">{m.label}</p>
                  <p className="text-2xl font-bold text-stone-100 mt-1">
                    {m.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight size={14} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">{m.change}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl ${m.bg}`}>
                  <m.icon size={20} className={m.color} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="text-lg font-semibold text-stone-100 mb-6">
          Platform Revenue
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMonthlySalesData}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="revenue"
                stroke="#CA8A04"
                fill="url(#adminGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-800/30 border border-stone-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-stone-800/60">
                    <ShoppingCart size={14} className="text-stone-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-200">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-stone-500">
                      {order.buyerName} &middot; {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-100">
                    {formatCurrency(order.total)}
                  </p>
                  <span
                    className={`text-xs ${getStatusColor(
                      order.status
                    )} px-1.5 py-0.5 rounded`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-stone-100 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Users,
                text: "New buyer registered: Alice Chen",
                time: "2m ago",
                color: "text-blue-400",
              },
              {
                icon: Store,
                text: "New seller application: GreenGoods",
                time: "15m ago",
                color: "text-gold",
              },
              {
                icon: Package,
                text: "Product awaiting approval: Smart Watch X",
                time: "1h ago",
                color: "text-gold",
              },
              {
                icon: ShoppingCart,
                text: "Order NXM-10011 delivered successfully",
                time: "2h ago",
                color: "text-emerald-400",
              },
              {
                icon: Clock,
                text: "Seller TechVault updated 12 product prices",
                time: "3h ago",
                color: "text-orange-400",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-800/30 border border-stone-800/40"
              >
                <div className="p-1.5 rounded-xl bg-stone-800/60">
                  <activity.icon size={14} className={activity.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-300">{activity.text}</p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
