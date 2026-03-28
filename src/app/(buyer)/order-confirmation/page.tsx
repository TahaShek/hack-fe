"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ArrowRight, Calendar } from "lucide-react";

export default function OrderConfirmationPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="mx-auto mb-8"
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
          <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(232,120,74,0.2)" strokeWidth="2" />
          <motion.path
            d="M24 40 L35 51 L56 30"
            fill="none"
            stroke="#E8784A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h1 className="text-3xl md:text-4xl font-light text-[#F5F5F5] mb-3">Order Confirmed.</h1>
        <p className="text-sm text-[#6B7280] mb-6">Thank you for your purchase.</p>

        {/* Order ID pill */}
        <span className="inline-flex px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wider">
          NXM-10011
        </span>

        {/* Summary card */}
        <div className="mt-10 rounded-2xl bg-[#111111] p-6 text-left">
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
            <Calendar size={14} />
            <span>Estimated delivery: 3-5 business days</span>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between">
            {["Confirmed", "Packed", "Shipped", "Delivered"].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${idx === 0 ? "bg-accent" : "bg-[rgba(255,255,255,0.1)]"}`} />
                {idx < 3 && <div className={`flex-1 h-px ${idx === 0 ? "bg-accent/30" : "bg-[rgba(255,255,255,0.06)]"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["Confirmed", "Packed", "Shipped", "Delivered"].map((step) => (
              <span key={step} className="text-[9px] text-[#6B7280]">{step}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all cursor-pointer"
          >
            <Package size={14} /> Track Order
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[rgba(255,255,255,0.12)] text-sm text-[#9CA3AF] hover:text-[#F5F5F5] transition-all cursor-pointer"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
