"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import api from "@/services/api";
import type { Product } from "@/types";

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/products?sort=popular&limit=8");
        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setFeatured(data.slice(0, 4));
        }
      } catch {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 px-8 md:px-16 bg-[#fef9f1]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-16"
      >
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601]">
            New Releases
          </span>
          <h2 className="text-5xl font-light tracking-tight text-[#1d1c17] mt-4">
            Selected Goods
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden md:inline-block text-[11px] font-medium uppercase tracking-[0.1rem] border-b border-[#9a4601] pb-1 text-[#1d1c17] hover:text-[#9a4601] transition-colors cursor-pointer"
        >
          View All Products
        </Link>
      </motion.div>

      {/* 4-column grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-1/2 bg-[#ece8e0] skeleton rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {featured.map((product, i) => (
            <ProductCard key={product.id || product._id || i} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
