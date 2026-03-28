"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  MoreVertical,
} from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency, getStockBgColor, getStatusColor } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const products = mockProducts.filter(
    (p) => p.sellerName === "TechVault" || true // show all for demo
  );

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Products</h1>
          <p className="text-sm text-zinc-500 mt-1">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload size={16} /> Bulk Upload
          </Button>
          <Link href="/seller/products/new">
            <Button className="gap-2">
              <Plus size={16} /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          icon={<Search size={16} />}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Stock</th>
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
                      <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-zinc-800" />
                      <span className="text-zinc-100 font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">{product.category}</td>
                  <td className="py-3 px-4 text-zinc-100 font-medium">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockBgColor(product.stock)}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${product.id}`} className="p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`} className="p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800">
                        <Edit size={14} />
                      </Link>
                      <button className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
