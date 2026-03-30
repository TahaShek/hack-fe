"use client";

import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "@/stores/wishlist-store";
import ProductCard from "@/components/buyer/ProductCard";

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-32 text-center flex flex-col items-center">
        <Heart size={64} strokeWidth={1} className="text-[#554339]/20 mb-8" />
        <p className="text-3xl font-light text-[#554339]/30 tracking-tight max-w-md">
          Your curation is currently silent. Discover items to fill the void.
        </p>
        <Link
          href="/products"
          className="mt-12 text-[11px] font-medium uppercase tracking-[0.2rem] border-b border-[#9a4601] pb-2 text-[#9a4601] hover:text-[#e07b39] transition-colors"
        >
          Start Curating
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601] mb-4 block">
            Personal Curation
          </span>
          <h1 className="text-[3.5rem] font-light tracking-tighter leading-none text-[#1d1c17]">
            Saved Items<span className="text-[#9a4601]">.</span>{" "}
            <span className="text-[#e07b39] text-2xl align-top ml-2">({items.length})</span>
          </h1>
        </div>
      </motion.header>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto">
        <div data-testid="wishlist-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          <AnimatePresence>
            {items.map((product, i) => (
              <motion.div
                key={product.id || product._id || i}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                data-testid="wishlist-item"
              >
                <ProductCard product={product} index={i} showMoveToCart />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
