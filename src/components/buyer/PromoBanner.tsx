"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";
import type { Product } from "@/types";

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <span className="font-mono text-[11px] text-[#897367] tabular-nums uppercase tracking-wide">
      {String(time.h).padStart(2, "0")}:{String(time.m).padStart(2, "0")}:
      {String(time.s).padStart(2, "0")}
    </span>
  );
}

export default function PromoBanner() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get("/products?sort=deals&limit=6");
        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setDeals(data.filter((p: Product) => p.compareAtPrice).slice(0, 6));
        }
      } catch {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (!loading && deals.length === 0) return null;

  return (
    <section className="py-24 px-8 md:px-16 bg-[#f8f3eb]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="mb-14"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601]">
          Limited Time
        </span>
        <h2 className="text-5xl font-light tracking-tight text-[#1d1c17] mt-4">
          Deals Ending Soon
        </h2>
      </motion.div>

      {loading ? (
        <div className="flex gap-8 overflow-x-auto pb-4 -mx-6 px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[220px] space-y-4">
              <div className="aspect-[3/4] bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-1/2 bg-[#ece8e0] skeleton rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6"
        >
          {deals.map((product, i) => (
            <Link
              key={product.id || product._id || i}
              href={`/products/${product.id || product._id}`}
              className="group flex-shrink-0 w-[220px] cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#ece8e0] border border-[#dcc1b4]/15">
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-light text-[#1d1c17] uppercase tracking-wider line-clamp-1 group-hover:text-[#9a4601] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-[#897367] line-through">
                    {formatCurrency(product.compareAtPrice!)}
                  </span>
                  <span className="text-sm font-semibold text-[#9a4601]">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="mt-2">
                  <CountdownTimer targetDate={deadline} />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
}
