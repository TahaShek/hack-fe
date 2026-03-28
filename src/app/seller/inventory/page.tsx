"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Package } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency, getStockBgColor, getStockColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const products = mockProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "low") return p.stock > 0 && p.stock <= 10;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const outOfStock = mockProducts.filter((p) => p.stock === 0).length;
  const lowStock = mockProducts.filter((p) => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Inventory Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Package size={20} className="text-emerald-400" /></div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{mockProducts.length}</p>
              <p className="text-xs text-zinc-500">Total Products</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10"><AlertTriangle size={20} className="text-orange-400" /></div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{lowStock}</p>
              <p className="text-xs text-zinc-500">Low Stock</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle size={20} className="text-red-400" /></div>
            <div>
              <p className="text-xl font-bold text-zinc-100">{outOfStock}</p>
              <p className="text-xs text-zinc-500">Out of Stock</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-sm flex-1">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." icon={<Search size={16} />} />
        </div>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize ${
                filter === f ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {f === "out" ? "Out of Stock" : f === "low" ? "Low Stock" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Product</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">SKU</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Price</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Stock</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
              <th className="text-right py-3 px-4 text-zinc-400 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 20).map((product, i) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-zinc-800" />
                    <span className="text-zinc-100 font-medium line-clamp-1 max-w-[180px]">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-500 font-mono text-xs">SKU-{product.id.split("-")[1]?.padStart(4, "0")}</td>
                <td className="py-3 px-4 text-zinc-100">{formatCurrency(product.price)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      product.stock === 0 ? "bg-red-500" : product.stock <= 10 ? "bg-orange-500" : product.stock <= 50 ? "bg-yellow-500" : "bg-emerald-500"
                    }`} />
                    <span className={getStockColor(product.stock)}>{product.stock}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockBgColor(product.stock)}`}>
                    {product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? "Low Stock" : "In Stock"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">Update</Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
