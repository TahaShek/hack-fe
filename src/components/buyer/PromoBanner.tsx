"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

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
    <span className="font-mono text-xs text-[#6B7280] tabular-nums">
      {String(time.h).padStart(2, "0")}:{String(time.m).padStart(2, "0")}:
      {String(time.s).padStart(2, "0")}
    </span>
  );
}

export default function PromoBanner() {
  const deals = mockProducts.filter((p) => p.compareAtPrice).slice(0, 6);
  const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="mb-14"
      >
        <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-4">
          Limited Time
        </p>
        <h2 className="text-3xl md:text-5xl font-light text-[#F5F5F5] tracking-tight">
          Deals Ending Soon
        </h2>
      </motion.div>

      {/* Horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6"
      >
        {deals.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group flex-shrink-0 w-[220px] cursor-pointer"
          >
            {/* Floating image */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#111111]"
              style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))" }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </motion.div>

            <div className="mt-4">
              <h3 className="text-sm text-[#F5F5F5] line-clamp-1 group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[#6B7280] line-through">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
                <span className="text-sm font-medium text-accent">
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
    </section>
  );
}
