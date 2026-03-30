"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import api from "@/services/api";
import type { Category } from "@/types";

const categoryDescriptions: Record<string, string> = {
  Electronics: "Tools for the digital age.",
  Fashion: "Armor for the everyday.",
  "Home & Kitchen": "Essentials for the dwelling.",
  Sports: "Gear for the active life.",
  Books: "Knowledge and inspiration.",
  Beauty: "Refined personal care.",
  Toys: "Play meets design.",
  Automotive: "Precision mobility.",
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories");
        if (res.data.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      } catch {
        // Fallback to existing CATEGORIES constant
        setCategories(CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayCategories = categories.slice(0, 4);

  return (
    <section className="py-24 px-8 md:px-16 bg-[#f8f3eb]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="mb-16"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#9a4601]">
          Department Selection
        </span>
        <h2 className="text-5xl font-light tracking-tight text-[#1d1c17] mt-4">
          Curated Verticals
        </h2>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[#dcc1b4]/20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square border-r border-b border-[#dcc1b4]/20 bg-white p-12 flex flex-col justify-between">
              <div className="h-3 w-8 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
                <div className="h-4 w-1/2 bg-[#ece8e0] skeleton rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[#dcc1b4]/20">
          {displayCategories.map((cat, i) => (
            <motion.div
              key={cat.id || cat.slug || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="aspect-square border-r border-b border-[#dcc1b4]/20 bg-white p-12 flex flex-col justify-between group cursor-pointer hover:bg-[#ece8e0] transition-colors block"
              >
                <span className="text-[11px] font-medium text-[#897367]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl font-light text-[#1d1c17] group-hover:text-[#9a4601] transition-colors uppercase tracking-widest">
                    {cat.name.split(" ")[0]}
                  </h3>
                  <p className="text-sm font-light text-[#554339] mt-2">
                    {categoryDescriptions[cat.name] || `${cat.productCount.toLocaleString()} items`}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
