"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, TrendingUp, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import api from "@/services/api";
import type { Product } from "@/types";

const RECENT_SEARCHES_KEY = "markit_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase());
  recent.unshift(query.trim());
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setCategories([]);
      return;
    }
    try {
      const res = await api.get(`/ai/search/autocomplete?q=${encodeURIComponent(q)}`);
      if (res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data.products)) {
          setSuggestions(data.products.slice(0, 5));
        } else if (Array.isArray(data)) {
          setSuggestions(data.slice(0, 5));
        }
        if (Array.isArray(data.categories)) {
          setCategories(data.categories.slice(0, 3));
        }
        if (Array.isArray(data.popularSearches)) {
          setPopularSearches(data.popularSearches);
        }
        return;
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
    setFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  const showDropdown = focused && (query.length === 0 || suggestions.length > 0 || categories.length > 0);

  return (
    <div className="relative w-full">
      <div className="relative group">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#897367] group-focus-within:text-[#9a4601] transition-colors duration-300"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search curated marketplace..."
          data-testid="search-bar"
          className="w-full bg-[#f8f3eb] border-none pl-10 pr-8 py-2.5 text-sm text-[#1d1c17] placeholder-[#897367] focus:outline-none focus:ring-1 focus:ring-[#9a4601] transition-all duration-300 rounded-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setCategories([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#897367] hover:text-[#1d1c17] cursor-pointer transition-colors"
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
            data-testid="autocomplete-dropdown"
            className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl border border-[#dcc1b4]/15 overflow-hidden z-50 rounded-sm"
          >
            {query.length === 0 ? (
              <div className="p-4 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-medium text-[#897367] tracking-[0.1rem] uppercase">
                        Recent
                      </p>
                      <button
                        onClick={clearRecent}
                        className="text-[10px] text-[#897367] hover:text-[#9a4601] cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQuery(s);
                          handleSearch(s);
                        }}
                        className="flex items-center gap-2.5 w-full px-2 py-2 text-sm text-[#554339] hover:bg-[#f8f3eb] rounded-sm cursor-pointer transition-colors font-light"
                      >
                        <Clock size={13} className="text-[#897367]" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div data-testid="popular-searches">
                  <p className="text-[10px] font-medium text-[#9a4601] mb-3 px-1 tracking-[0.1rem] uppercase">
                    Trending
                  </p>
                  {(popularSearches.length > 0
                    ? popularSearches
                    : ["Wireless Headphones", "Laptop Stand", "Fitness Watch", "Leather Jacket"]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s);
                        handleSearch(s);
                      }}
                      className="flex items-center gap-2.5 w-full px-2 py-2 text-sm text-[#554339] hover:bg-[#f8f3eb] rounded-sm cursor-pointer transition-colors font-light"
                    >
                      <TrendingUp size={13} className="text-[#9a4601]" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2">
                {/* Category matches */}
                {categories.length > 0 && (
                  <div className="px-4 pt-2 pb-1">
                    <p className="text-[10px] font-medium tracking-[0.1rem] uppercase text-[#897367] mb-2">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/products?category=${encodeURIComponent(cat)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f3eb] text-xs text-[#554339] hover:bg-[#9a4601]/10 hover:text-[#9a4601] transition-colors rounded-sm"
                        >
                          <Tag size={10} />
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product matches */}
                {suggestions.length > 0 && (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-medium tracking-[0.1rem] uppercase text-[#9a4601] mb-1">
                        Products
                      </p>
                    </div>
                    {suggestions.map((p, i) => (
                      <Link
                        key={p.id || p._id || i}
                        href={`/products/${p.id || p._id}`}
                        data-testid="autocomplete-suggestion"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8f3eb] transition-colors"
                      >
                        <img
                          src={p?.images?.[0] || "/placeholder.svg"}
                          alt={p?.name ?? ""}
                          className="h-10 w-10 rounded-sm object-cover bg-[#e7e2da]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1d1c17] truncate font-light">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#897367]">
                            {p.category} &middot; {formatCurrency(p.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {/* Search all results link */}
                <div className="px-4 py-3 border-t border-[#dcc1b4]/15">
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full text-left text-xs text-[#9a4601] font-medium hover:underline cursor-pointer"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
