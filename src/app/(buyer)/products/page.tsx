"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import ProductCard from "@/components/buyer/ProductCard";
import api from "@/services/api";
import type { Product } from "@/types";

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-[#9a4601] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductListingContent />
    </Suspense>
  );
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", "20");
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (sortBy) params.set("sort", sortBy);
      if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
      if (priceRange[1] < 500) params.set("maxPrice", String(priceRange[1]));

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
        if (append) {
          setProducts((prev) => [...prev, ...data]);
        } else {
          setProducts(data);
        }
        setHasMore(data.length >= 20);
        return;
      }
    } catch (err: unknown) {
      if (!append) {
        setProducts([]);
        setError(err instanceof Error ? err.message : "Failed to load products");
      }
      setHasMore(false);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  };

  // Sync URL params
  useEffect(() => {
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlCategory]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, priceRange, searchQuery]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (ratingFilter > 0) {
      result = result.filter((p) => p.rating >= ratingFilter);
    }
    switch (sortBy) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "popular": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "deals": result.sort((a, b) => {
        const ad = a.compareAtPrice ? (1 - a.price / a.compareAtPrice) : 0;
        const bd = b.compareAtPrice ? (1 - b.price / b.compareAtPrice) : 0;
        return bd - ad;
      }); break;
      default: result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [products, sortBy, selectedCategory, priceRange, ratingFilter]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Filter Panel */}
      <aside data-testid="filter-panel" className="hidden lg:block w-[280px] shrink-0 border-r border-[#dcc1b4]/30 px-8 py-10 bg-[#f5f0e8] sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="space-y-10">
          {/* Filter Label */}
          <section>
            <h2 className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#897367] mb-6">Filter By</h2>
            {/* Category Tree */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#1d1c17]">Category</h3>
              <ul className="space-y-2 text-sm text-[#554339] font-light">
                <li
                  onClick={() => setSelectedCategory("")}
                  className={`flex justify-between items-center cursor-pointer hover:text-[#9a4601] transition-colors ${
                    !selectedCategory ? "text-[#9a4601] font-normal" : ""
                  }`}
                >
                  <span>All</span>
                </li>
                {CATEGORIES.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
                    className={`flex justify-between items-center cursor-pointer hover:text-[#9a4601] transition-colors ${
                      selectedCategory === cat.name ? "text-[#9a4601] font-normal" : ""
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-[#897367]/50">{cat.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Price Range */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-[#1d1c17]">Price Range</h3>
            <div className="space-y-4">
              <div className="h-[2px] bg-[#dcc1b4]/30 relative">
                <div
                  className="absolute h-full bg-[#9a4601]"
                  style={{
                    left: `${(priceRange[0] / 500) * 100}%`,
                    width: `${((priceRange[1] - priceRange[0]) / 500) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[#897367] uppercase tracking-wider block mb-1">Min</label>
                  <input
                    type="number"
                    min={0}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value) || 0, priceRange[1]);
                      setPriceRange([val, priceRange[1]]);
                    }}
                    className="w-full px-2 py-1.5 text-xs text-[#1d1c17] bg-white border border-[#dcc1b4]/30 rounded-sm focus:outline-none focus:border-[#9a4601] transition-colors"
                  />
                </div>
                <span className="text-[#897367] text-xs mt-4">—</span>
                <div className="flex-1">
                  <label className="text-[10px] text-[#897367] uppercase tracking-wider block mb-1">Max</label>
                  <input
                    type="number"
                    min={priceRange[0]}
                    max={500}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value) || 0, priceRange[0]);
                      setPriceRange([priceRange[0], Math.min(val, 500)]);
                    }}
                    className="w-full px-2 py-1.5 text-xs text-[#1d1c17] bg-white border border-[#dcc1b4]/30 rounded-sm focus:outline-none focus:border-[#9a4601] transition-colors"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-10">
        {/* Header & Sorting */}
        <header className="flex justify-between items-end mb-8 border-b border-[#dcc1b4]/10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl font-light tracking-tight text-[#1d1c17] mb-2">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory || "All Products"}
            </h1>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-[#897367] font-light">
                {loading ? "Loading..." : `Showing ${filtered.length} results`}
              </span>
              {/* Filter Chips */}
              <div className="flex gap-2 ml-4">
                {searchQuery && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#9a4601]/10 border border-[#9a4601]/20 text-[10px] uppercase tracking-wider text-[#9a4601] rounded-sm">
                    <Search size={9} />
                    {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                )}
                {selectedCategory && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#dcc1b4]/30 text-[10px] uppercase tracking-wider text-[#1d1c17] rounded-sm">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("")} className="cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#897367] uppercase tracking-widest font-medium">Sort By:</span>
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                data-testid="sort-dropdown"
                className="text-sm font-medium flex items-center gap-2 text-[#1d1c17] cursor-pointer"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "New Arrivals"}
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#f8f3eb] border border-[#dcc1b4]/30 overflow-hidden z-50 rounded-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                          sortBy === opt.value ? "text-[#9a4601] bg-[#9a4601]/5" : "text-[#554339] hover:text-[#1d1c17] hover:bg-[#ece8e0]"
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
        </header>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[#dcc1b4]/30 text-xs text-[#554339] rounded-sm cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Mobile category pills */}
        <div className="lg:hidden flex items-center gap-3 overflow-x-auto scrollbar-hide mb-8 pb-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`shrink-0 px-4 py-2 rounded-sm text-xs tracking-wide transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white"
                : "border border-[#dcc1b4]/30 text-[#554339] hover:text-[#1d1c17]"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
              className={`shrink-0 px-4 py-2 rounded-sm text-xs tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-[#9a4601]/10 text-[#9a4601] border border-[#9a4601]/30"
                  : "border border-[#dcc1b4]/30 text-[#554339] hover:text-[#1d1c17]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => { setError(null); fetchProducts(1); }} className="px-4 py-2 bg-[#9a4601] text-white rounded-sm hover:bg-[#7a3801] cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-[#ece8e0] skeleton rounded-sm" />
                <div className="h-4 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
                <div className="h-4 w-1/2 bg-[#ece8e0] skeleton rounded-sm" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div data-testid="product-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {filtered.map((product, i) => (
                <ProductCard key={product.id || product._id || i} product={product} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-32">
                <p className="text-lg font-light text-[#897367]">No products found.</p>
              </div>
            )}

            {hasMore && filtered.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  data-testid="load-more"
                  className="px-8 py-3 border border-[#dcc1b4]/30 text-sm text-[#554339] hover:text-[#9a4601] hover:border-[#9a4601] transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
