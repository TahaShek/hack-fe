"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Tag, Edit, Trash2, Calendar, Percent, DollarSign } from "lucide-react";
import { mockCoupons } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";

export default function PromotionsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Promotions & Coupons</h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} /> Create Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCoupons.map((coupon, i) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Tag size={18} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold font-mono text-zinc-100">{coupon.code}</p>
                    <p className="text-xs text-zinc-500">
                      {coupon.type === "percentage" ? `${coupon.value}% off` : `$${coupon.value} off`}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  coupon.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-700 text-zinc-400"
                }`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Min Order</span>
                  <span className="text-zinc-200">${coupon.minOrder}</span>
                </div>
                {coupon.maxDiscount && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Max Discount</span>
                    <span className="text-zinc-200">${coupon.maxDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Usage</span>
                  <span className="text-zinc-200">{coupon.usedCount}/{coupon.usageLimit}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Valid Until</span>
                  <span className="text-zinc-200">{formatDate(coupon.endDate)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer">
                  <Edit size={14} />
                </button>
                <button className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Coupon">
        <div className="space-y-4">
          <Input label="Coupon Code" id="code" placeholder="e.g. SUMMER25" />
          <Select
            label="Discount Type"
            id="type"
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed Amount", value: "fixed" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount Value" id="value" type="number" placeholder="20" />
            <Input label="Min Order Amount ($)" id="minOrder" type="number" placeholder="50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Discount ($)" id="maxDiscount" type="number" placeholder="30" />
            <Input label="Usage Limit" id="limit" type="number" placeholder="100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" id="startDate" type="date" />
            <Input label="End Date" id="endDate" type="date" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => setShowCreate(false)}>Create Coupon</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
