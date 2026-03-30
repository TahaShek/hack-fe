"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import ProductCard from "@/components/buyer/ProductCard";
import api from "@/services/api";
import type { Product } from "@/types";

export default function RecommendedProducts() {
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get("/ai/recommendations?limit=4");
        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setRecommended(data);
        }
      } catch {
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-sm bg-[#9a4601]/10">
            <Sparkles size={18} className="text-[#9a4601]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-light tracking-tight text-[#1d1c17]">
                Recommended for You
              </h2>
              <span className="text-[10px] bg-[#9a4601]/10 text-[#9a4601] px-2.5 py-1 rounded-sm font-medium tracking-[0.1rem] uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-sm text-[#897367] mt-1 font-light">
              Based on your browsing history
            </p>
          </div>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-[#897367] hover:text-[#9a4601] transition-colors duration-300 group"
        >
          See More
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-4 w-1/2 bg-[#ece8e0] skeleton rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommended.map((product, i) => (
            <ProductCard key={product.id || product._id || i} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
