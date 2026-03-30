"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Tag, ArrowRight, Trash2, Truck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, couponCode, couponDiscount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState("");

  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08;
  const total = getTotal();

  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    const result = await applyCoupon(couponInput.trim());
    setCouponLoading(false);
    if (!result.success) {
      setCouponError(result.error || "Invalid coupon code");
    }
    setCouponInput("");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-32 text-center">
        <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[#dcc1b4]/30 mb-6" />
        <h1 className="text-2xl font-light text-[#1d1c17] mb-2">Your cart is empty</h1>
        <p className="text-sm text-[#554339] font-light mb-8">Browse products and add items to your cart.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-sm font-medium tracking-wide transition-all cursor-pointer rounded-sm"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="flex items-baseline gap-4">
          <h1 className="text-[3.5rem] font-light tracking-tight leading-none text-[#1d1c17]">Your Cart</h1>
          <span className="text-[2rem] font-light text-[#9a4601]">({items.length})</span>
        </div>
        <div className="mt-4 w-12 h-1 bg-[#9a4601]" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Items — Left Column */}
        <div className="lg:col-span-8 space-y-0">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id || item._id || i}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                data-testid="cart-item"
                className="flex gap-8 py-8 border-b border-[#dcc1b4]/30"
              >
                {/* Thumbnail */}
                <div className="w-32 h-40 bg-[#f8f3eb] border border-[#dcc1b4]/20 shrink-0 overflow-hidden">
                  <img
                    src={item.product?.images?.[0] || '/placeholder.svg'}
                    alt={item.product?.name ?? ''}
                    className="w-full h-full object-cover grayscale-[0.2] hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between flex-grow py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-[11px] font-medium tracking-[0.1rem] uppercase text-[#897367] mb-1">
                        {item.product.category || item.product.sellerName}
                      </span>
                      <Link href={`/products/${item.product.id || item.product._id}`} className="text-xl font-light text-[#1d1c17] hover:text-[#9a4601] transition-colors">
                        {item.product.name}
                      </Link>
                      {Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-sm text-[#554339] font-light mt-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${v}`).join(" / ")}
                        </p>
                      )}
                    </div>
                    <span className="text-lg font-light text-[#1d1c17]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div data-testid="quantity-controls" className="flex items-center bg-[#f8f3eb] border border-[#dcc1b4]/15">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid="quantity-decrease"
                          className="px-3 py-2 hover:bg-[#ece8e0] transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid="quantity-increase"
                          className="px-3 py-2 hover:bg-[#ece8e0] transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        data-testid="remove-item"
                        className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#897367] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary — Right Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-[#f8f3eb] p-10">
            <h2 className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#1d1c17] mb-8">Order Summary</h2>

            <div className="space-y-6">
              <div data-testid="cart-subtotal" className="flex justify-between text-sm font-light text-[#554339]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div data-testid="cart-shipping" className="flex justify-between text-sm font-light text-[#554339]">
                <span>Estimated Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div data-testid="cart-tax" className="flex justify-between text-sm font-light text-[#554339]">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-[#9a4601]">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> {couponCode}
                  </span>
                  <span className="flex items-center gap-2">
                    -{formatCurrency(couponDiscount)}
                    <button onClick={removeCoupon} className="text-[#897367] hover:text-[#ba1a1a] cursor-pointer">
                      <Trash2 size={10} />
                    </button>
                  </span>
                </div>
              )}
              <div data-testid="cart-total" className="pt-6 border-t border-[#dcc1b4]/30 flex justify-between items-baseline">
                <span className="text-lg font-light">Total</span>
                <span className="text-2xl font-normal text-[#1d1c17]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Coupon */}
            {!couponCode && (
              <div className="mt-8 flex items-center gap-0 border-b border-[#dcc1b4]/30">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  data-testid="coupon-input"
                  className="flex-1 bg-transparent text-sm text-[#1d1c17] placeholder-[#897367] py-2 focus:outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  data-testid="coupon-apply"
                  className="text-xs text-[#9a4601] hover:text-[#e07b39] transition-colors cursor-pointer px-2"
                >
                  Apply
                </button>
              </div>
            )}

            <div className="mt-10 space-y-4">
              <Link href="/checkout" className="block">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  data-testid="proceed-to-checkout"
                  className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white py-5 px-6 font-medium text-sm tracking-wider uppercase hover:opacity-95 transition-all cursor-pointer rounded-sm"
                >
                  Proceed to Checkout
                </motion.button>
              </Link>
              <Link href="/products" className="block">
                <button className="w-full bg-[#e7e2da] text-[#1d1c17] py-5 px-6 font-medium text-sm tracking-wider uppercase hover:bg-[#ece8e0] transition-all cursor-pointer rounded-sm">
                  Continue Shopping
                </button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-[#dcc1b4]/30">
              <div className="flex items-start gap-4 text-[#554339]">
                <Truck size={18} className="text-[#9a4601] mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium uppercase tracking-wider mb-1">Standard Delivery</h4>
                  <p className="text-xs font-light leading-relaxed">Arrives in 3-5 business days. Free shipping on orders over $1,000.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 px-2">
            <p className="text-[11px] text-[#897367] font-light italic leading-relaxed">
              Shipping costs and taxes are calculated based on your address at the final checkout step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
