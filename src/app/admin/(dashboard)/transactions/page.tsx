"use client";

import { motion } from "framer-motion";
import { Search, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import api from "@/services/api";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/admin/transactions");
        if (res.data.success) {
          const raw = res.data.data;
          const arr = Array.isArray(raw) ? raw : raw?.transactions || [];
          setTransactions(arr.map((t: Record<string, unknown>) => ({ ...t, id: t.id || t._id }) as unknown as Transaction));
        }
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalFees = transactions.reduce((sum, t) => sum + (t.platformFee || 0), 0);

  const filtered = transactions.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const matchId = (t.orderId || "").toLowerCase().includes(q);
      const matchBuyer = (t.buyerName || "").toLowerCase().includes(q);
      const matchSeller = (t.sellerName || "").toLowerCase().includes(q);
      if (!matchId && !matchBuyer && !matchSeller) return false;
    }
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-medium uppercase tracking-[0.2rem] text-[#2563EB] mb-2 block">
          Audit Trail
        </span>
        <h1 className="text-4xl font-light tracking-tighter text-white">
          Transaction Logs
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 mb-2">Total Volume</p>
          <p className="text-3xl font-light text-[#2563EB]">{loading ? "-" : formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 mb-2">Platform Fees</p>
          <p className="text-3xl font-light text-emerald-500">{loading ? "-" : formatCurrency(totalFees)}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 mb-2">Total Transactions</p>
          <p className="text-3xl font-light text-white">{loading ? "-" : transactions.length}</p>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 bg-zinc-900/20 border border-zinc-800 p-4 rounded-sm">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ID or Name..."
            className="bg-transparent border-none text-xs text-zinc-400 focus:ring-0 w-full sm:w-64 uppercase tracking-widest placeholder:text-zinc-700 outline-none"
          />
        </div>
        <div className="flex gap-0 border-b border-zinc-800/50">
          {["all", "completed", "refunded", "pending"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-3 text-[11px] uppercase tracking-[0.15rem] font-bold transition-colors cursor-pointer capitalize ${
                statusFilter === s
                  ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/20 border border-zinc-800/50 overflow-hidden rounded-sm" data-testid="transactions-table">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-zinc-800 skeleton rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2rem] text-zinc-500 border-b border-zinc-800/50">
                <th className="py-6 px-8 font-medium">Transaction ID</th>
                <th className="py-6 px-8 font-medium">Order</th>
                <th className="py-6 px-8 font-medium">Buyer</th>
                <th className="py-6 px-8 font-medium">Seller</th>
                <th className="py-6 px-8 font-medium">Amount</th>
                <th className="py-6 px-8 font-medium">Fee</th>
                <th className="py-6 px-8 font-medium">Status</th>
                <th className="py-6 px-8 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="text-xs tracking-wide text-zinc-300">
              {paginatedTransactions.map((txn, i) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-zinc-800/30 transition-colors group border-b border-zinc-800/30"
                  data-testid="transaction-row"
                >
                  <td className="py-6 px-8 font-mono text-zinc-400">{txn.id}</td>
                  <td className="py-6 px-8 font-mono text-zinc-400">{txn.orderId}</td>
                  <td className="py-6 px-8 text-zinc-300">{txn.buyerName}</td>
                  <td className="py-6 px-8 text-zinc-300">{txn.sellerName}</td>
                  <td className="py-6 px-8 text-white font-medium">{formatCurrency(txn.amount)}</td>
                  <td className="py-6 px-8 text-emerald-500">{formatCurrency(txn.platformFee)}</td>
                  <td className="py-6 px-8">
                    <span
                      data-testid="transaction-status"
                      className={`inline-flex items-center px-2 py-0.5 text-[9px] uppercase tracking-widest border ${
                        txn.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : txn.status === "refunded"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-6 px-8 text-zinc-500">{formatDate(txn.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <div className="p-8 bg-zinc-950/40 flex justify-between items-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}&ndash;{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="text-zinc-600 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr;
            </button>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="text-zinc-600 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
