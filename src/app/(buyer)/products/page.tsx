"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import ProductCard from "@/components/buyer/ProductCard";

export default function ProductListingPage() {
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let products = [...mockProducts];
    if (selectedCategory) {
      products = products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    products = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (ratingFilter > 0) {
      products = products.filter((p) => p.rating >= ratingFilter);
    }
    switch (sortBy) {
      case "price_asc": products.sort((a, b) => a.price - b.price); break;
      case "price_desc": products.sort((a, b) => b.price - a.price); break;
      case "popular": products.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "rating": products.sort((a, b) => b.rating - a.rating); break;
      case "deals": products.sort((a, b) => {
        const ad = a.compareAtPrice ? (1 - a.price / a.compareAtPrice) : 0;
        const bd = b.compareAtPrice ? (1 - b.price / b.compareAtPrice) : 0;
        return bd - ad;
      }); break;
      default: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return products;
  }, [sortBy, selectedCategory, priceRange, ratingFilter]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-light text-[#F5F5F5] tracking-tight">
          {selectedCategory || "All Products"}
        </h1>
        <p className="text-sm text-[#6B7280] mt-3">{filtered.length} products found</p>
      </motion.div>

      {/* Filter bar — sticky */}
      <div className="sticky top-16 z-30 py-4 -mx-6 px-6 bg-[#080808]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] mb-10">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Category pills */}
          <button
            onClick={() => setSelectedCategory("")}
            className={`shrink-0 px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-accent text-white"
                : "border border-[rgba(255,255,255,0.12)] text-[#6B7280] hover:text-[#F5F5F5]"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "border border-[rgba(255,255,255,0.12)] text-[#6B7280] hover:text-[#F5F5F5]"
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.12)] text-xs text-[#6B7280] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              Sort
              <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#111111] border border-[rgba(255,255,255,0.06)] overflow-hidden z-50"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                        sortBy === opt.value ? "text-accent bg-accent/5" : "text-[#6B7280] hover:text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.03)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Product grid — 4 col floating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-32">
          <p className="text-lg font-light text-[#6B7280]">No products found.</p>
        </div>
      )}
    </div>
  );
}
