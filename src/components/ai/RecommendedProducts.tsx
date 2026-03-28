"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import ProductCard from "@/components/buyer/ProductCard";

export default function RecommendedProducts() {
  const recommended = [...mockProducts]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl glass-gold">
            <Sparkles size={18} className="text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-stone-100 tracking-tight">
                Recommended for You
              </h2>
              <span className="text-[10px] bg-gold/10 text-gold px-2.5 py-1 rounded-full font-semibold tracking-wider uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Based on your browsing history
            </p>
          </div>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-gold transition-colors duration-300 group"
        >
          See More
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommended.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
