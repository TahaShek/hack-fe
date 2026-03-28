"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { mockProducts, mockReviews } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import ProductCard from "@/components/buyer/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find((p) => p.id === id) || mockProducts[0];
  const storyRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const storyBgY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const related = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);

  return (
    <div>
      {/* Section 1 — Hero */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#6B7280] mb-10">
            <Link href="/" className="hover:text-[#F5F5F5] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-[#F5F5F5] transition-colors">Products</Link>
            <ChevronRight size={12} />
            <span className="text-[#9CA3AF]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left — Images */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="aspect-square rounded-2xl overflow-hidden bg-[#111111]"
                style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.8))" }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                      selectedImage === i ? "border-accent" : "border-transparent hover:border-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right — Sticky info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:sticky lg:top-24 lg:self-start space-y-6"
            >
              <div>
                <p className="text-xs text-[#6B7280] tracking-[0.2em] uppercase mb-2">{product.sellerName}</p>
                <h1 className="text-2xl md:text-4xl font-light text-[#F5F5F5] tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(product.rating) ? "text-accent fill-accent" : "text-[#1a1a1a]"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#6B7280]">{product.rating} ({product.reviewCount})</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-accent">{formatCurrency(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-base text-[#6B7280] line-through">{formatCurrency(product.compareAtPrice)}</span>
                )}
              </div>

              {/* Variants */}
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <h3 className="text-xs text-[#6B7280] tracking-[0.15em] uppercase mb-3">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt.value }))}
                        disabled={opt.stock === 0}
                        className={`px-5 py-2 rounded-full text-xs transition-all cursor-pointer ${
                          selectedVariants[variant.name] === opt.value
                            ? "bg-accent/10 text-accent border border-accent/30"
                            : "border border-[rgba(255,255,255,0.12)] text-[#9CA3AF] hover:border-[rgba(255,255,255,0.24)]"
                        } ${opt.stock === 0 ? "opacity-30 line-through" : ""}`}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[rgba(255,255,255,0.12)] rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-[#6B7280] hover:text-[#F5F5F5] cursor-pointer">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm text-[#F5F5F5]">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-[#6B7280] hover:text-[#F5F5F5] cursor-pointer">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-[#6B7280]">{product.stock} in stock</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addItem(product, quantity, selectedVariants)}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-accent text-white text-sm font-medium tracking-wide hover:shadow-[0_0_30px_rgba(232,120,74,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </motion.button>
                <button
                  onClick={() => toggleItem(product)}
                  className={`p-3.5 rounded-full border transition-colors cursor-pointer ${
                    wishlisted ? "border-pink-500/30 text-pink-500" : "border-[rgba(255,255,255,0.12)] text-[#6B7280] hover:text-pink-400"
                  }`}
                >
                  <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Chat */}
              <Link href="/chat" className="flex items-center gap-2 text-xs text-accent hover:text-accent-light transition-colors">
                <MessageCircle size={14} />
                Chat with {product.sellerName}
              </Link>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                {[
                  { icon: Truck, label: "Free Shipping" },
                  { icon: Shield, label: "Buyer Protection" },
                  { icon: RotateCcw, label: "30-Day Returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 text-center">
                    <Icon size={18} strokeWidth={1.5} className="text-[#6B7280]" />
                    <span className="text-[10px] text-[#6B7280] tracking-wide">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2 — Product Story / Parallax */}
      <section ref={storyRef} className="relative h-[70vh] overflow-hidden flex items-center">
        <motion.div style={{ y: storyBgY }} className="absolute inset-0">
          <img
            src={product.images[1]}
            alt="Product lifestyle"
            className="h-[120%] w-full object-cover opacity-40"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-6xl font-light text-white tracking-tight max-w-3xl leading-tight"
          >
            Designed for those who appreciate craftsmanship.
          </motion.p>
        </div>
      </section>

      {/* Section 3 — Features */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="space-y-0">
          {[
            { num: "01", title: "Premium Materials", desc: "Crafted with the finest materials sourced responsibly from around the world." },
            { num: "02", title: "Precision Engineering", desc: "Every detail is meticulously designed for optimal performance and durability." },
            { num: "03", title: "Sustainable Design", desc: "Built to last, reducing waste and environmental impact over its lifetime." },
          ].map((feature, i) => (
            <motion.div
              key={feature.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-8 md:gap-16 py-8 border-b border-[rgba(255,255,255,0.06)]"
            >
              <span className="text-3xl md:text-5xl font-light text-[#1a1a1a] shrink-0 w-20">{feature.num}</span>
              <h3 className="text-base md:text-lg text-[#F5F5F5] font-normal flex-1">{feature.title}</h3>
              <p className="text-sm text-[#6B7280] flex-1 hidden md:block">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4 — Reviews */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-4">Reviews</p>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl md:text-8xl font-light text-[#F5F5F5]">{product.rating}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? "text-accent fill-accent" : "text-[#1a1a1a]"} />
                ))}
              </div>
              <p className="text-xs text-[#6B7280] mt-1">{product.reviewCount} reviews</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {mockReviews.map((review) => (
            <div key={review.id} className="p-6 rounded-2xl bg-[#111111] space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-xs text-[#9CA3AF]">{review.userName[0]}</span>
                </div>
                <span className="text-sm text-[#F5F5F5]">{review.userName}</span>
                <div className="flex ml-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < review.rating ? "text-accent fill-accent" : "text-[#1a1a1a]"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">{review.comment}</p>
              <p className="text-[10px] text-[rgba(255,255,255,0.2)]">{formatDate(review.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5 — You Might Also Like */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        <p className="text-xs text-[#6B7280] tracking-[0.3em] uppercase font-medium mb-10">
          You Might Also Like
        </p>
        <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {related.map((p, i) => (
            <div key={p.id} className="flex-shrink-0 w-[220px]">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
