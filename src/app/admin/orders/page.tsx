"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockOrders.filter((o) => {
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.buyerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Orders</h1>

      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." icon={<Search size={16} />} />
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

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Order</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Buyer</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Seller</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Total</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
              <th className="text-right py-3 px-4 text-zinc-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-zinc-100 font-medium font-mono text-xs">{order.orderNumber}</td>
                <td className="py-3 px-4 text-zinc-300">{order.buyerName}</td>
                <td className="py-3 px-4 text-zinc-300">{order.sellerName}</td>
                <td className="py-3 px-4 text-zinc-100 font-medium">{formatCurrency(order.total)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400">{formatDate(order.createdAt)}</td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer">
                    <Eye size={14} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
