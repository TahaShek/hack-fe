"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Package, Plus, CheckCircle } from "lucide-react";
import { formatCurrency, getStockBgColor, getStockColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import type { Product } from "@/types";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [bulkUpdates, setBulkUpdates] = useState<{ productId: string; newStock: number }[]>([]);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [stockUpdateModal, setStockUpdateModal] = useState<{ productId: string; currentStock: number } | null>(null);
  const [newStockValue, setNewStockValue] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get("/seller/inventory");
        if (res.data.success) {
          setAllProducts(Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || []);
        }
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await api.put(`/seller/inventory/${productId}`, { stock: newStock });
      setAllProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    } catch {
      // silently fail
    }
  };

  const handleBulkCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idCol = headers.findIndex((h) => h === "productid" || h === "sku" || h === "id");
      const stockCol = headers.findIndex((h) => h === "newstock" || h === "stock" || h === "quantity");
      if (idCol === -1 || stockCol === -1) {
        setBulkMessage("CSV must have columns: productId (or SKU/id) and newStock (or stock/quantity)");
        return;
      }
      const updates = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        return { productId: vals[idCol], newStock: parseInt(vals[stockCol], 10) || 0 };
      }).filter((u) => u.productId);
      setBulkUpdates(updates);
      setBulkMessage("");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const applyBulkUpdates = async () => {
    setBulkApplying(true);
    setBulkMessage("");
    let successCount = 0;
    for (const update of bulkUpdates) {
      try {
        await api.put(`/seller/inventory/${update.productId}`, { stock: update.newStock });
        setAllProducts((prev) =>
          prev.map((p) => (p.id === update.productId ? { ...p, stock: update.newStock } : p))
        );
        successCount++;
      } catch {
        // continue with remaining updates
      }
    }
    setBulkMessage(`Updated ${successCount} of ${bulkUpdates.length} products.`);
    setBulkUpdates([]);
    setBulkApplying(false);
  };

  const products = allProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "low") return p.stock > 0 && p.stock <= 10;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const outOfStock = allProducts.filter((p) => p.stock === 0).length;
  const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-0">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-white">Inventory</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-[0.1rem] mt-1">Manage your curated collection</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            ref={bulkFileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBulkCsv}
          />
          <button
            onClick={() => bulkFileRef.current?.click()}
            className="px-6 py-2 border border-zinc-700 text-zinc-300 text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-zinc-900 transition-colors rounded-sm"
          >
            Bulk Update
          </button>
          <button className="px-6 py-2 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#9a4601]/10 rounded-sm">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-zinc-800 rounded-sm mb-8">
        <div className="p-8 border-r border-zinc-800">
          <p className="text-[10px] uppercase tracking-[0.15rem] text-zinc-500 mb-2">Total SKUs</p>
          <p className="text-3xl font-light text-white">{loading ? "-" : allProducts.length}</p>
        </div>
        <div className="p-8 border-r border-zinc-800">
          <p className="text-[10px] uppercase tracking-[0.15rem] text-zinc-500 mb-2">Low Stock</p>
          <p className="text-3xl font-light text-[#e07b39]">{loading ? "-" : lowStock}</p>
        </div>
        <div className="p-8 border-r border-zinc-800">
          <p className="text-[10px] uppercase tracking-[0.15rem] text-zinc-500 mb-2">Out of Stock</p>
          <p className="text-3xl font-light text-red-500">{loading ? "-" : outOfStock}</p>
        </div>
        <div className="p-8">
          <p className="text-[10px] uppercase tracking-[0.15rem] text-zinc-500 mb-2">Active Listings</p>
          <p className="text-3xl font-light text-[#2563EB]">{loading ? "-" : allProducts.length - outOfStock}</p>
        </div>
      </section>

      {/* Bulk Update Preview */}
      {bulkMessage && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs pb-4">
          <CheckCircle size={14} />
          {bulkMessage}
        </div>
      )}
      {bulkUpdates.length > 0 && (
        <section className="mb-8 bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400">
              Bulk Update Preview &mdash; {bulkUpdates.length} row{bulkUpdates.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBulkUpdates([])}
                className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.1rem] text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyBulkUpdates}
                disabled={bulkApplying}
                className="px-6 py-2 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:opacity-90 transition-all rounded-sm disabled:opacity-60"
              >
                {bulkApplying ? "Applying..." : "Apply Updates"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-3 py-2 text-[9px] font-medium uppercase tracking-[0.15rem] text-zinc-500">Product ID / SKU</th>
                  <th className="px-3 py-2 text-[9px] font-medium uppercase tracking-[0.15rem] text-zinc-500">New Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {bulkUpdates.map((u, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30">
                    <td className="px-3 py-2 text-xs text-zinc-300">{u.productId}</td>
                    <td className="px-3 py-2 text-xs text-zinc-300">{u.newStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-300 placeholder:text-zinc-600 pl-8 pb-2 border-b border-zinc-800 focus:border-[#e07b39] transition-colors outline-none"
            placeholder="Search by name, SKU or category..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-6">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-medium uppercase tracking-[0.1rem] transition-colors cursor-pointer ${
                filter === f ? "text-[#e07b39]" : "text-zinc-400 hover:text-white"
              }`}
            >
              {f === "out" ? "Out of Stock" : f === "low" ? "Low Stock" : "All Products"}
            </button>
          ))}
        </div>
      </section>

      {/* Inventory Table */}
      <section>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]" data-testid="inventory-table">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500 w-12">
                    <input className="bg-transparent border-zinc-700 rounded-none focus:ring-0 checked:bg-[#9a4601]" type="checkbox" />
                  </th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500">Product Details</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500">Category</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500">Stock Status</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500">Price</th>
                  <th className="pb-4 text-[10px] font-medium uppercase tracking-[0.2rem] text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {products.slice(0, 20).map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="group hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-6">
                      <input className="bg-transparent border-zinc-700 rounded-none focus:ring-0 checked:bg-[#9a4601]" type="checkbox" />
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-zinc-800 overflow-hidden flex-shrink-0 rounded-sm">
                          <img
                            alt={product.name}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            src={product?.images?.[0] || '/placeholder.svg'}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-[10px] text-zinc-500 tracking-wider">SKU: {product.id?.includes("-") ? `SKU-${product.id.split("-")[1]?.padStart(4, "0")}` : product.id?.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-sm text-zinc-400">{product.category}</td>
                    <td className="py-6">
                      <span data-testid="stock-status" className={`inline-flex items-center px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest rounded-sm ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-500"
                          : product.stock <= 10
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? "Low Stock" : "In Stock"}
                      </span>
                      {product.stock > 0 && product.stock <= 10 && (
                        <p data-testid="stock-quantity" className="text-[9px] text-zinc-600 mt-1">{product.stock} units left</p>
                      )}
                    </td>
                    <td className="py-6">
                      <p className="text-sm font-medium text-[#e07b39]">{formatCurrency(product.price)}</p>
                    </td>
                    <td className="py-6 text-right">
                      <button
                        onClick={() => {
                          setStockUpdateModal({ productId: product.id, currentStock: product.stock });
                          setNewStockValue(String(product.stock));
                        }}
                        className="px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-zinc-500 hover:text-[#e07b39] transition-colors border border-zinc-800 hover:border-[#e07b39] rounded-sm"
                      >
                        Update
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Stock Update Modal */}
      <Modal
        isOpen={!!stockUpdateModal}
        onClose={() => setStockUpdateModal(null)}
        title="Update Stock Quantity"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#897367] mb-1">New Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={newStockValue}
              onChange={(e) => setNewStockValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stockUpdateModal && newStockValue !== "") {
                  updateStock(stockUpdateModal.productId, parseInt(newStockValue, 10));
                  setStockUpdateModal(null);
                }
              }}
              className="w-full rounded-sm border border-[#dcc1b4]/30 bg-white px-3 py-2 text-sm text-[#1d1c17] focus:border-[#9a4601] focus:ring-1 focus:ring-[#9a4601] outline-none transition-colors"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStockUpdateModal(null)}
              className="px-4 py-2 text-sm text-[#897367] hover:text-[#1d1c17] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (stockUpdateModal && newStockValue !== "") {
                  updateStock(stockUpdateModal.productId, parseInt(newStockValue, 10));
                  setStockUpdateModal(null);
                }
              }}
              className="px-4 py-2 text-sm bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white rounded-sm hover:opacity-90 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
