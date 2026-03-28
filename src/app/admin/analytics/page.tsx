"use client";

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
import { mockMonthlySalesData } from "@/lib/mock-data";
import Card from "@/components/ui/Card";

const userGrowth = [
  { month: "Jan", buyers: 1200, sellers: 80 },
  { month: "Feb", buyers: 1500, sellers: 95 },
  { month: "Mar", buyers: 1800, sellers: 110 },
  { month: "Apr", buyers: 2200, sellers: 130 },
  { month: "May", buyers: 2800, sellers: 155 },
  { month: "Jun", buyers: 3200, sellers: 175 },
];

const orderStatusDist = [
  { name: "Delivered", value: 65 },
  { name: "Shipped", value: 15 },
  { name: "Packed", value: 8 },
  { name: "Confirmed", value: 7 },
  { name: "Pending", value: 5 },
];

const COLORS = ["#10b981", "#8b5cf6", "#6366f1", "#3b82f6", "#eab308"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "12px" },
  labelStyle: { color: "#a1a1aa" },
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Platform Analytics</h1>

      {/* Revenue */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-6">Revenue Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMonthlySalesData}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#analyticsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-6">User Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="buyers" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sellers" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-6">Order Status Distribution</h2>
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
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders by Month */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-100 mb-6">Monthly Orders</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
