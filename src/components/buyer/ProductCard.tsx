"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      whileHover={{ y: -8 }}
      className="group relative cursor-pointer"
    >
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#111111]" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xs text-[#6B7280] uppercase tracking-wider">Sold Out</span>
            </div>
          )}

          {product.compareAtPrice && (
            <span className="absolute top-3 left-3 rounded-full bg-accent text-white text-xs font-medium px-3 py-1">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
            </span>
          )}

          {/* Add to Cart pill on hover */}
          {product.stock > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); addItem(product, 1, {}); }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#F5F5F5] text-[#080808] text-xs font-medium px-6 py-2.5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cursor-pointer hover:bg-accent hover:text-white"
            >
              Add to Cart
            </button>
          )}
        </div>
      </Link>

      {/* Wishlist heart */}
      <button
        onClick={() => toggleItem(product)}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
      >
        <Heart
          size={16}
          strokeWidth={1.5}
          fill={wishlisted ? "currentColor" : "none"}
          className={wishlisted ? "text-accent" : "text-white/70 hover:text-white"}
        />
      </button>

      {/* Info */}
      <div className="mt-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm text-[#F5F5F5] line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-[#6B7280] mt-1">{product.sellerName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-accent">{formatCurrency(product.price)}</span>
          <div className="flex items-center gap-1">
            <Star size={12} fill="currentColor" className="text-amber-400" />
            <span className="text-xs text-[#6B7280]">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
