"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";
import type { Product } from "@/types";

export default function TrendingList() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/products?sort=popular&limit=5");
        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setTrending(data.slice(0, 5));
        }
      } catch {
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (!loading && trending.length === 0) return null;

  return (
    <section className="py-24 px-8 md:px-16 bg-[#fef9f1]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-14"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601]">
          Trending
        </span>
        <h2 className="text-5xl font-light tracking-tight text-[#1d1c17] mt-4">
          What&apos;s Hot
        </h2>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#ece8e0] skeleton rounded-sm" />
          ))}
        </div>
      ) : (
        <div>
          {trending.map((product, i) => (
            <motion.div
              key={product.id || product._id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={`/products/${product.id || product._id}`}
                className="group grid grid-cols-[3rem_4rem_1fr_auto] md:grid-cols-[5rem_5rem_1fr_8rem_auto] items-center gap-4 md:gap-8 py-5 border-b border-[#dcc1b4]/20 hover:bg-[#f8f3eb] transition-colors -mx-4 px-4 cursor-pointer"
              >
                <span className="text-2xl md:text-4xl font-light text-[#dcc1b4]/40 group-hover:text-[#9a4601] transition-colors tabular-nums">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-sm overflow-hidden bg-[#f8f3eb]">
                  <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-light text-[#1d1c17] uppercase tracking-wider group-hover:text-[#9a4601] transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-[#897367] mt-0.5 uppercase">{product.sellerName}</p>
                </div>
                <span className="hidden md:block text-[11px] text-[#897367] tabular-nums uppercase">{product.rating ?? 0} / 5</span>
                <span className="text-sm text-[#9a4601] font-semibold tabular-nums">{formatCurrency(product.price)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
