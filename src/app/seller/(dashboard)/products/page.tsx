"use client";

import { useState, useEffect, useRef } from "react";
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
import { formatCurrency, getStockBgColor, getStatusColor } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/services/api";
import type { Product } from "@/types";

export default function SellerProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadMessage, setBulkUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/seller/products");
        if (res.data.success) {
          const raw = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setProducts(raw.map((p: Record<string, unknown>) => ({ ...p, id: p.id || p._id })));
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploading(true);
    setBulkUploadMessage(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setBulkUploadMessage({ type: "error", text: "File must contain a header row and at least one data row." });
        setBulkUploading(false);
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim());
      const products = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || "";
        });
        return row;
      });
      const res = await api.post("/seller/products/bulk-upload", { products });
      if (res.data.success) {
        setBulkUploadMessage({ type: "success", text: `Successfully uploaded ${products.length} product(s).` });
        // Refresh product list
        const refreshRes = await api.get("/seller/products");
        if (refreshRes.data.success) {
          const raw = Array.isArray(refreshRes.data.data) ? refreshRes.data.data : refreshRes.data.data?.products || [];
          setProducts(raw.map((p: Record<string, unknown>) => ({ ...p, id: p.id || p._id })));
        }
      } else {
        setBulkUploadMessage({ type: "error", text: res.data.message || "Upload failed." });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bulk upload failed. Please try again.";
      setBulkUploadMessage({ type: "error", text: message });
    } finally {
      setBulkUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/seller/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      // silently fail
    }
  };

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500">Management</span>
          <h1 className="text-4xl font-light tracking-tighter text-white mt-2">Products</h1>
          <p className="text-xs text-zinc-500 mt-1">{filtered.length} items in collection</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={bulkFileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleBulkUpload}
          />
          <button
            onClick={() => bulkFileRef.current?.click()}
            disabled={bulkUploading}
            data-testid="bulk-upload"
            className="px-6 py-2 border border-zinc-700 text-zinc-300 text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-zinc-900 transition-colors rounded-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={14} /> {bulkUploading ? "Uploading..." : "Bulk Upload"}
          </button>
          <Link href="/seller/products/new" data-testid="add-product">
            <button className="px-6 py-2 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:opacity-90 transition-all rounded-sm flex items-center gap-2 shadow-lg shadow-[#9a4601]/10">
              <Plus size={14} /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Bulk Upload Feedback */}
      {bulkUploadMessage && (
        <div className={`flex items-center gap-2 text-xs px-4 py-3 rounded-sm ${
          bulkUploadMessage.type === "success"
            ? "bg-emerald-900/20 text-emerald-400"
            : "bg-red-900/20 text-red-400"
        }`}>
          {bulkUploadMessage.text}
          <button onClick={() => setBulkUploadMessage(null)} className="ml-auto text-zinc-500 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-sm max-w-sm">
        <Search size={14} className="text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-xs text-zinc-300 w-full p-0 placeholder:text-zinc-600 outline-none"
          placeholder="Search products..."
          type="text"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" data-testid="products-table">
              <thead>
                <tr className="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-[#2A2A2A]">
                  <th className="pb-4 pt-6 px-6 font-medium w-16">Item</th>
                  <th className="pb-4 pt-6 px-4 font-medium">Product Name</th>
                  <th className="pb-4 pt-6 px-4 font-medium">Category</th>
                  <th className="pb-4 pt-6 px-4 font-medium">Stock</th>
                  <th className="pb-4 pt-6 px-4 font-medium">Price</th>
                  <th className="pb-4 pt-6 px-4 font-medium">Status</th>
                  <th className="pb-4 pt-6 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.slice(0, 15).map((product, i) => (
                  <motion.tr
                    key={product.id || product._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#2A2A2A] hover:bg-zinc-900/50 transition-colors"
                    data-testid="product-row"
                  >
                    <td className="py-6 px-6">
                      <div className="w-14 h-14 bg-zinc-900 border border-[#2A2A2A] overflow-hidden rounded-sm">
                        <img src={product?.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-zinc-100 font-medium">{product.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{product.category}</p>
                    </td>
                    <td className="py-6 px-4 text-zinc-400 text-sm">{product.category}</td>
                    <td className="py-6 px-4">
                      <span className="text-zinc-300">{product.stock}</span>
                    </td>
                    <td className="py-6 px-4 text-zinc-100">{formatCurrency(product.price)}</td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase font-medium ${
                        product.status === "approved" ? "bg-emerald-900/30 text-emerald-500" :
                        product.status === "pending" ? "bg-zinc-800 text-zinc-300" :
                        "bg-red-900/30 text-red-500"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/seller/products/${product.id}/edit`} className="p-1.5 text-zinc-500 hover:text-[#e07b39] transition-colors">
                          <Eye size={16} />
                        </Link>
                        <Link href={`/seller/products/${product.id}/edit`} data-testid="edit-product" className="p-1.5 text-zinc-500 hover:text-[#e07b39] transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} data-testid="delete-product" className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
