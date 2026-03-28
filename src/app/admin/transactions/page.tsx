"use client";

import { motion } from "framer-motion";
import { Search, DollarSign } from "lucide-react";
import { useState } from "react";
import { mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = mockTransactions.reduce((sum, t) => sum + t.platformFee, 0);

  const filtered = search
    ? mockTransactions.filter((t) =>
        t.orderId.toLowerCase().includes(search.toLowerCase()) ||
        t.buyerName.toLowerCase().includes(search.toLowerCase()) ||
        t.sellerName.toLowerCase().includes(search.toLowerCase())
      )
    : mockTransactions;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Transactions</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-zinc-500">Total Volume</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Platform Fees</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalFees)}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Transactions</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{mockTransactions.length}</p>
        </Card>
      </div>

      <div className="max-w-sm">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." icon={<Search size={16} />} />
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Transaction ID</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Order</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Buyer</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Seller</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Fee</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn, i) => (
              <motion.tr
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-zinc-300 font-mono text-xs">{txn.id}</td>
                <td className="py-3 px-4 text-zinc-100 font-mono text-xs">{txn.orderId}</td>
                <td className="py-3 px-4 text-zinc-300">{txn.buyerName}</td>
                <td className="py-3 px-4 text-zinc-300">{txn.sellerName}</td>
                <td className="py-3 px-4 text-zinc-100 font-medium">{formatCurrency(txn.amount)}</td>
                <td className="py-3 px-4 text-emerald-400">{formatCurrency(txn.platformFee)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400">{formatDate(txn.createdAt)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
