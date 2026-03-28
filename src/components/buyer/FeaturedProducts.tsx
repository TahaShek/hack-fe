"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const featured = mockProducts
    .filter((p) => p.tags.includes("bestseller") || p.tags.includes("trending"))
    .slice(0, 6);

  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-14"
      >
        <div>
          <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-4">
            Curated
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-[#F5F5F5] tracking-tight">
            Featured Products
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden md:flex items-center gap-2 text-sm text-[#6B7280] hover:text-accent transition-colors cursor-pointer"
        >
          View all <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
