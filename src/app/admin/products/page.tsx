"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // For demo, simulate some pending/rejected products
  const products = mockProducts.map((p, i) => ({
    ...p,
    status: i % 7 === 0 ? ("pending" as const) : i % 11 === 0 ? ("rejected" as const) : ("approved" as const),
  }));

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = products.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Product Moderation</h1>
          <p className="text-sm text-zinc-500 mt-1">{pendingCount} products awaiting review</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." icon={<Search size={16} />} />
        </div>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {["all", "pending", "approved", "rejected"].map((s) => (
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
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Product</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Seller</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Price</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
              <th className="text-right py-3 px-4 text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 15).map((product, i) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-zinc-800" />
                    <span className="text-zinc-100 font-medium line-clamp-1 max-w-[180px]">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-400">{product.sellerName}</td>
                <td className="py-3 px-4 text-zinc-400">{product.category}</td>
                <td className="py-3 px-4 text-zinc-100">{formatCurrency(product.price)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer">
                      <Eye size={14} />
                    </button>
                    {product.status === "pending" && (
                      <>
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 gap-1">
                          <CheckCircle size={12} /> Approve
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 gap-1">
                          <XCircle size={12} /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
