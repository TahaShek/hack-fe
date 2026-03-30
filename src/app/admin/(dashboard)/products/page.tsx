"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, Eye, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/admin/products/pending");
        if (res.data.success) {
          const raw = res.data.data;
          const arr = Array.isArray(raw) ? raw : raw?.products || [];
          setProducts(arr.map((p: Record<string, unknown>) => ({
            ...p,
            id: p.id || p._id,
            sellerName: (p.sellerId as Record<string, unknown>)?.storeName || p.sellerName || "Unknown",
          }) as unknown as Product));
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const approveProduct = async (productId: string) => {
    try {
      await api.put(`/admin/products/${productId}/approve`);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: "approved" as const } : p))
      );
    } catch {
      // silently fail
    }
  };

  const openRejectModal = (productId: string) => {
    setRejectingProductId(productId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectingProductId(null);
    setRejectReason("");
    setRejecting(false);
  };

  const confirmReject = async () => {
    if (!rejectingProductId) return;
    setRejecting(true);
    try {
      await api.put(`/admin/products/${rejectingProductId}/reject`, {
        reason: rejectReason.trim() || undefined,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === rejectingProductId ? { ...p, status: "rejected" as const } : p
        )
      );
      closeRejectModal();
    } catch {
      setRejecting(false);
    }
  };

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = products.filter((p) => p.status === "pending").length;
  const rejectingProduct = products.find((p) => p.id === rejectingProductId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.2rem] text-[#e07b39] mb-2 block">
            Moderation Hub
          </span>
          <h1 className="text-4xl font-light tracking-tighter text-white">
            Product Moderation
          </h1>
          <p className="text-zinc-500 text-[11px] mt-2 uppercase tracking-[0.1rem]">
            {pendingCount} products awaiting review
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors cursor-pointer rounded-sm">
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 border-l-2 border-[#2563EB] rounded-sm">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Pending Review</p>
          <p className="text-4xl font-light text-white">{loading ? "-" : pendingCount}</p>
        </div>
        <div className="bg-zinc-900 p-8 border-l-2 border-zinc-700 rounded-sm">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Approved</p>
          <p className="text-4xl font-light text-white">{loading ? "-" : products.filter(p => p.status === "approved").length}</p>
        </div>
        <div className="bg-zinc-900 p-8 border-l-2 border-zinc-700 rounded-sm">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Rejected</p>
          <p className="text-4xl font-light text-white">{loading ? "-" : products.filter(p => p.status === "rejected").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="bg-zinc-900 border-none text-sm pl-12 pr-6 py-3 w-full focus:ring-1 focus:ring-[#2563EB] rounded-sm placeholder:text-zinc-600 text-zinc-300 outline-none"
          />
        </div>
        <div className="flex gap-0 border-b border-zinc-800 overflow-x-auto">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              data-testid={`status-tab-${s}`}
              className={`pb-4 px-4 text-sm font-medium uppercase tracking-widest transition-colors cursor-pointer capitalize ${
                statusFilter === s
                  ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 overflow-hidden rounded-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Product Details</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Seller</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Category</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Price</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium">Status</th>
                <th className="px-8 py-5 text-[10px] uppercase tracking-[0.15rem] text-zinc-500 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.slice(0, 15).map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-zinc-950/30 transition-colors"
                  data-testid="product-row"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-sm overflow-hidden">
                        <img src={product?.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-400">{product.sellerName}</td>
                  <td className="px-8 py-6 text-sm text-zinc-400">{product.category}</td>
                  <td className="px-8 py-6 text-sm text-zinc-100">{formatCurrency(product.price)}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                        product.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : product.status === "pending"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-3">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                      <Eye size={16} />
                    </button>
                    {product.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveProduct(product.id)}
                          data-testid="approve-product"
                          className="p-2 text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors rounded-sm cursor-pointer"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => openRejectModal(product.id)}
                          data-testid="reject-product"
                          className="p-2 text-red-500 hover:bg-red-500/10 transition-colors rounded-sm cursor-pointer"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeRejectModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative bg-[#1A1A1A] border border-zinc-800 rounded-sm w-full max-w-md mx-4 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15rem] text-red-500 mb-1">
                    Reject Product
                  </p>
                  <h3 className="text-lg font-light text-white">
                    {rejectingProduct?.name || "Product"}
                  </h3>
                </div>
                <button
                  onClick={closeRejectModal}
                  className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400 mb-3 block">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection (e.g., inappropriate content, misleading description, policy violation)..."
                  rows={4}
                  className="w-full bg-[#0D0D0D] text-sm text-zinc-300 placeholder:text-zinc-600 px-4 py-3 rounded-sm outline-none focus:ring-1 focus:ring-red-500/50 resize-none"
                  autoFocus
                />
                <p className="text-[10px] text-zinc-600 mt-2">
                  The seller will be notified with this reason.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
                <button
                  onClick={closeRejectModal}
                  className="px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={rejecting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejecting ? "Rejecting..." : "Reject Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
