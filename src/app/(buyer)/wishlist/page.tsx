"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "@/stores/wishlist-store";
import ProductCard from "@/components/buyer/ProductCard";

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
        <Heart size={48} strokeWidth={1} className="mx-auto text-[rgba(255,255,255,0.1)] mb-6" />
        <h1 className="text-2xl font-light text-[#F5F5F5] mb-2">Nothing saved yet.</h1>
        <p className="text-sm text-[#6B7280] mb-8">Save items you love for later.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[rgba(255,255,255,0.12)] text-sm text-[#9CA3AF] hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
        >
          Start Browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-light text-[#F5F5F5] tracking-tight">Saved Items</h1>
        <p className="text-sm text-[#6B7280] mt-2">{items.length} items</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence>
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
