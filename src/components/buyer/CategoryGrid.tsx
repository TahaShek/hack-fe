"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

const categoryImages = [
  "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&q=80",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
];

export default function CategoryGrid() {
  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="mb-12"
      >
        <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-4">
          Shop by Category
        </p>
        <h2 className="text-3xl md:text-5xl font-light text-[#F5F5F5] tracking-tight">
          What are you looking for?
        </h2>
      </motion.div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="group relative flex-shrink-0 block w-[260px] md:w-[300px] rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={categoryImages[i]}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Label */}
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-light text-white tracking-wide">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[rgba(255,255,255,0.5)] tracking-widest uppercase mt-1">
                  {cat.productCount.toLocaleString()} items
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
