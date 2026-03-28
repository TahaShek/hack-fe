"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Tag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, couponCode, couponDiscount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState("");

  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = getTotal();

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === "SAVE20") {
      applyCoupon("SAVE20", subtotal * 0.2 > 30 ? 30 : subtotal * 0.2);
    } else if (couponInput.toUpperCase() === "FLAT10") {
      applyCoupon("FLAT10", 10);
    }
    setCouponInput("");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
        <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[rgba(255,255,255,0.1)] mb-6" />
        <h1 className="text-2xl font-light text-[#F5F5F5] mb-2">Your cart is empty</h1>
        <p className="text-sm text-[#6B7280] mb-8">Browse products and add items to your cart.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-accent text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all cursor-pointer"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-light text-[#F5F5F5] tracking-tight mb-12"
      >
        Cart
      </motion.h1>

      <div className="grid lg:grid-cols-5 gap-16">
        {/* Items — 60% */}
        <div className="lg:col-span-3 space-y-0">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-6 py-6 border-b border-[rgba(255,255,255,0.06)]"
              >
                {/* Thumbnail */}
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-[#111111] shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`} className="text-sm text-[#F5F5F5] hover:text-accent transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-[11px] text-[#6B7280] mt-1">{item.product.sellerName}</p>
                  {Object.keys(item.selectedVariants).length > 0 && (
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-[rgba(255,255,255,0.12)] rounded-full shrink-0">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-[#6B7280] hover:text-[#F5F5F5] cursor-pointer">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm text-[#F5F5F5]">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-[#6B7280] hover:text-[#F5F5F5] cursor-pointer">
                    <Plus size={12} />
                  </button>
                </div>

                {/* Price */}
                <span className="text-sm font-medium text-[#F5F5F5] shrink-0 w-20 text-right">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-[#6B7280] hover:text-red-400 underline underline-offset-2 cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary — 40% */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl bg-[#111111] p-8 space-y-5">
            <h2 className="text-base font-medium text-[#F5F5F5]">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> {couponCode}
                  </span>
                  <span className="flex items-center gap-2">
                    -{formatCurrency(couponDiscount)}
                    <button onClick={removeCoupon} className="text-[#6B7280] hover:text-red-400 cursor-pointer">
                      <Trash2 size={10} />
                    </button>
                  </span>
                </div>
              )}
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="flex justify-between text-[#F5F5F5] text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Coupon */}
            {!couponCode && (
              <div className="flex items-center gap-0 border-b border-[rgba(255,255,255,0.12)]">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#6B7280] py-2 focus:outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="text-xs text-accent hover:text-accent-light transition-colors cursor-pointer px-2"
                >
                  Apply
                </button>
              </div>
            )}

            <Link href="/checkout" className="block">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent text-white text-sm font-medium tracking-wide hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all cursor-pointer"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
