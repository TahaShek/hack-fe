"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

interface Props {
  product: Product;
  index?: number;
  showMoveToCart?: boolean;
}

export default function ProductCard({ product, index = 0, showMoveToCart }: Props) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      data-testid="product-card"
      className="group relative"
    >
      {/* Image */}
      <Link href={`/products/${product?.id || product?._id || ''}`} className="block">
        <div className="aspect-[3/4] overflow-hidden bg-[#f8f3eb] border border-[#dcc1b4]/15 p-4 mb-6">
          <img
            src={product?.images?.[0] || '/placeholder.svg'}
            alt={product?.name ?? ''}
            data-testid="product-image"
            className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </Link>

      {/* Out of stock overlay */}
      {product.stock === 0 && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none" style={{ bottom: "auto", height: "calc(100% - 5rem)" }}>
          <span className="text-[11px] text-[#897367] uppercase tracking-[0.1rem] font-medium">Sold Out</span>
        </div>
      )}

      {/* Discount badge */}
      {product.compareAtPrice && (
        <span className="absolute top-4 left-4 bg-[#9a4601]/10 text-[#9a4601] text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 z-10">
          {Math.round((1 - product.price / product.compareAtPrice) * 100)}% Off
        </span>
      )}

      {/* Info */}
      <div className="flex justify-between items-start mb-1">
        <Link href={`/products/${product.id || product._id}`}>
          <h3 data-testid="product-name" className="text-sm font-light text-[#1d1c17] tracking-tight group-hover:text-[#9a4601] transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        {showMoveToCart ? (
          <button
            onClick={() => toggleItem(product)}
            className="text-[#554339]/40 hover:text-[#ba1a1a] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={14} />
          </button>
        ) : (
          <span data-testid="product-price" className="text-sm font-semibold text-[#9a4601] shrink-0 ml-3">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>

      <p className="text-xs text-[#554339] font-medium mb-3 uppercase tracking-widest">
        {product.category || product.sellerName}
      </p>

      {showMoveToCart ? (
        <button
          onClick={() => { addItem(product, 1, {}); toggleItem(product); toast.success("Moved to cart", { description: product.name }); }}
          className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601] hover:text-[#e07b39] flex items-center gap-2 group-hover:translate-x-1 transition-transform cursor-pointer"
        >
          Move to Cart <ArrowRight size={12} />
        </button>
      ) : (
        <p className="text-[11px] text-[#897367] uppercase">{product.sellerName}</p>
      )}
    </motion.div>
  );
}
