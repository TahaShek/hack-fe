"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function TrendingList() {
  const trending = [...mockProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-14"
      >
        <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-4">Trending</p>
        <h2 className="text-3xl md:text-5xl font-light text-[#F5F5F5] tracking-tight">What&apos;s Hot</h2>
      </motion.div>

      <div>
        {trending.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Link
              href={`/products/${product.id}`}
              className="group grid grid-cols-[3rem_4rem_1fr_auto] md:grid-cols-[5rem_5rem_1fr_8rem_auto] items-center gap-4 md:gap-8 py-5 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.03)] transition-colors -mx-4 px-4 cursor-pointer"
            >
              {/* Number */}
              <span className="text-2xl md:text-4xl font-light text-[rgba(255,255,255,0.08)] group-hover:text-accent/50 transition-colors tabular-nums">
                #{String(i + 1).padStart(2, "0")}
              </span>

              {/* Thumb */}
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-lg overflow-hidden bg-[#111111]">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h3 className="text-sm text-[#F5F5F5] group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">{product.sellerName}</p>
              </div>

              {/* Rating */}
              <span className="hidden md:block text-xs text-[#6B7280] tabular-nums">{product.rating} / 5</span>

              {/* Price */}
              <span className="text-sm text-accent font-medium tabular-nums">{formatCurrency(product.price)}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
