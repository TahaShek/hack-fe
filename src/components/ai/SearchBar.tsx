"use client";

import { useState, useRef } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mockProducts } from "@/lib/mock-data";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const trendingSearches = ["Wireless Headphones", "Yoga Mat", "Laptop Stand", "Fitness Watch"];
const recentSearches = ["Bluetooth Speaker", "Coffee Mug"];

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  if (q.length >= 3) {
    for (let i = 0; i < t.length - q.length + 1; i++) {
      let mismatches = 0;
      for (let j = 0; j < q.length; j++) {
        if (t[i + j] !== q[j]) mismatches++;
      }
      if (mismatches <= 1) return true;
    }
  }
  return false;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions =
    query.length >= 2
      ? mockProducts
          .filter((p) => fuzzyMatch(query, p.name) || fuzzyMatch(query, p.category))
          .slice(0, 5)
      : [];

  const showDropdown = focused && (query.length === 0 || suggestions.length > 0);

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-gold transition-colors duration-300"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-stone-800/60 bg-stone-900/50 pl-10 pr-8 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-all duration-300 backdrop-blur-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            {query.length === 0 ? (
              <div className="p-4 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-stone-500 mb-2 px-1 tracking-wider uppercase">
                      Recent
                    </p>
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2.5 w-full px-2 py-2 text-sm text-stone-400 hover:bg-stone-800/40 hover:text-stone-200 rounded-xl cursor-pointer transition-colors"
                      >
                        <Clock size={13} className="text-stone-600" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold text-stone-500 mb-2 px-1 tracking-wider uppercase">
                    Trending
                  </p>
                  {trendingSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="flex items-center gap-2.5 w-full px-2 py-2 text-sm text-stone-400 hover:bg-stone-800/40 hover:text-stone-200 rounded-xl cursor-pointer transition-colors"
                    >
                      <TrendingUp size={13} className="text-gold/60" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800/40 transition-colors"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-10 w-10 rounded-xl object-cover bg-stone-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-200 truncate">{p.name}</p>
                      <p className="text-xs text-stone-500">
                        {p.category} &middot; {formatCurrency(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
