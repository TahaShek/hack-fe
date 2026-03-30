"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

function ParallaxStorySection({ imageSrc }: { imageSrc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={ref} className="relative h-[70vh] overflow-hidden flex items-center">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img
          src={imageSrc}
          alt="Product lifestyle"
          className="h-[120%] w-full object-cover opacity-30"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[#fef9f1]/50" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-6xl font-light text-[#1d1c17] tracking-tight max-w-3xl leading-tight"
        >
          Designed for those who appreciate craftsmanship.
        </motion.p>
      </div>
    </section>
  );
}
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuthStore } from "@/stores/auth-store";
import ProductCard from "@/components/buyer/ProductCard";
import api from "@/services/api";
import { toast } from "sonner";
import type { Product, Review } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("description");
  const [variantError, setVariantError] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();


  // Check if user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${id}/reviews`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setReviews(res.data.data);
      }
    } catch {
      // Reviews fetch failed silently
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (res.data.data.reviews) {
            setReviews(res.data.data.reviews);
          }
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (reviewRating === 0 || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment("");
      // Refresh reviews list
      await fetchReviews();
      // Re-fetch product to get updated rating/reviewCount
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch {
        // silently fail
      }
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message =
        axiosErr?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to submit review.");
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (!product) return;
    // Fetch "Customers Also Bought" via AI recommendations
    const fetchRelated = async () => {
      try {
        const res = await api.get(`/ai/recommendations?productId=${product.id}&limit=5`);
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setRelated(res.data.data.filter((p: Product) => p.id !== product.id).slice(0, 5));
          return;
        }
      } catch {
        // fallback to category-based
      }
      try {
        const res = await api.get(`/products?category=${product.category}&limit=5`);
        if (res.data.success) {
          const data = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products || [];
          setRelated(data.filter((p: Product) => p.id !== product.id).slice(0, 5));
          return;
        }
      } catch {
        // fallback
      }
      setRelated([]);
    };
    fetchRelated();
  }, [product]);

  if (loading || !product) {
    return (
      <div className="bg-[#fef9f1] min-h-screen">
        <div className="max-w-7xl mx-auto px-8 pt-12">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-7">
              <div className="aspect-square bg-[#ece8e0] skeleton rounded-sm" />
            </div>
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="h-4 w-1/3 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-10 w-3/4 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-6 w-1/4 bg-[#ece8e0] skeleton rounded-sm" />
              <div className="h-14 w-full bg-[#ece8e0] skeleton rounded-sm mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const tabs = [
    { id: "description", label: "Description" },
    { id: "reviews", label: `Reviews (${product.reviewCount})` },
    { id: "seller", label: "Seller Info" },
  ];

  return (
    <div className="bg-[#fef9f1]">
      {/* Section 1 — Hero */}
      <section className="pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#554339] mb-10">
            <Link href="/" className="hover:text-[#9a4601] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-[#9a4601] transition-colors">Products</Link>
            <ChevronRight size={12} />
            <span className="text-[#897367]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-12 gap-12 items-start">
            {/* Left — Images (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="col-span-12 lg:col-span-7 flex flex-col gap-8"
            >
              {/* Main Image */}
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="aspect-square w-full border border-[#dcc1b4]/30 overflow-hidden bg-[#f8f3eb]"
              >
                <img
                  src={product.images?.[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  data-testid="main-image"
                  className="h-full w-full object-cover"
                />
              </motion.div>

              {/* Thumbnails — 5 across */}
              <div data-testid="thumbnails" className="grid grid-cols-5 gap-4">
                {(product.images ?? []).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square overflow-hidden transition-all active:scale-95 cursor-pointer ${
                      selectedImage === i
                        ? "border-2 border-[#9a4601]"
                        : "border border-[#dcc1b4]/30 hover:border-[#9a4601]/50"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Tabs Section */}
              <div className="mt-12">
                <div className="flex gap-12 border-b border-[#dcc1b4]/15">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-[11px] font-medium tracking-[0.1rem] uppercase transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "border-b-2 border-[#9a4601] text-[#1d1c17]"
                          : "border-b-2 border-transparent text-[#554339] hover:text-[#9a4601]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="py-8 space-y-6">
                  {activeTab === "description" && (
                    <>
                      <p data-testid="product-description" className="text-sm text-[#554339] leading-relaxed max-w-2xl font-light">
                        {product.description || "Crafted with exceptional attention to detail, this piece represents the pinnacle of artisanal craftsmanship. Each element is carefully considered for both form and function."}
                      </p>
                      <ul className="space-y-3">
                        {["Premium materials sourced responsibly", "Hand-finished by skilled artisans", "Designed for longevity and everyday use"].map((item) => (
                          <li key={item} className="flex items-center gap-4 text-sm font-light text-[#1d1c17]">
                            <span className="w-1 h-1 bg-[#9a4601] rounded-full" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {activeTab === "reviews" && (
                    <div className="space-y-6">
                      {/* Write a Review Form */}
                      {isLoggedIn && (
                        <div className="p-6 bg-[#f8f3eb] rounded-sm space-y-4">
                          <h3 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339]">
                            Write a Review
                          </h3>
                          {reviewSuccess && (
                            <div className="bg-[#00677e]/10 text-[#00677e] text-sm px-4 py-3 rounded-sm">
                              Review submitted successfully!
                            </div>
                          )}
                          {reviewError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                              {reviewError}
                            </div>
                          )}
                          <div>
                            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                              Rating
                            </label>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="cursor-pointer transition-transform hover:scale-110"
                                >
                                  <Star
                                    size={22}
                                    className={
                                      star <= reviewRating
                                        ? "text-[#9a4601] fill-[#9a4601]"
                                        : "text-[#dcc1b4] hover:text-[#9a4601]/50"
                                    }
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                              Comment
                            </label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your experience with this product..."
                              rows={3}
                              className="w-full bg-white border border-[#dcc1b4]/30 text-sm text-[#1d1c17] px-4 py-3 rounded-sm outline-none focus:border-[#9a4601] transition-colors resize-none placeholder:text-[#897367]"
                            />
                          </div>
                          <button
                            onClick={handleReviewSubmit}
                            disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim()}
                            className="px-6 py-2.5 bg-[#9a4601] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#7a3801] transition-colors cursor-pointer rounded-sm disabled:opacity-50"
                          >
                            {reviewSubmitting ? "Submitting..." : "Submit Review"}
                          </button>
                        </div>
                      )}

                      {reviews.map((review) => (
                        <div key={review.id} className="p-6 bg-[#f8f3eb] space-y-3 rounded-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-[#ece8e0] flex items-center justify-center rounded-sm">
                              <span className="text-xs text-[#554339]">{review.userName[0]}</span>
                            </div>
                            <span className="text-sm text-[#1d1c17]">{review.userName}</span>
                            <div className="flex ml-auto">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} className={i < review.rating ? "text-[#9a4601] fill-[#9a4601]" : "text-[#dcc1b4]"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[#554339] leading-relaxed font-light">{review.comment}</p>
                          <p className="text-[10px] text-[#897367]">{formatDate(review.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "seller" && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ece8e0] flex items-center justify-center border border-[#dcc1b4]/30 rounded-sm">
                        <span className="text-sm text-[#554339] font-medium">{product.sellerName?.[0] || "S"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1d1c17]">{product.sellerName}</p>
                        <p className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339]/70">Verified Artisan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right — Sticky info (5 cols) */}
            <motion.aside
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339]">
                  {product.category} / {product.sellerName}
                </span>
                <h1 data-testid="product-name" className="text-4xl md:text-5xl font-light tracking-tighter leading-tight text-[#1d1c17]">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4 pt-2">
                  <span data-testid="product-price" className="text-2xl font-medium text-[#9a4601]">{formatCurrency(product.price)}</span>
                  {product.compareAtPrice && (
                    <span data-testid="discount-price" className="text-sm text-[#554339]/60 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(product.rating) ? "text-[#9a4601] fill-[#9a4601]" : "text-[#dcc1b4]"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#897367]">{product.rating} ({product.reviewCount})</span>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-6">
                {(product.variants ?? []).map((variant, vi) => (
                  <div key={variant.id || vi} className="space-y-3">
                    <label className="text-[11px] font-medium tracking-[0.1rem] uppercase block text-[#897367]">
                      {variant.name}
                    </label>
                    <div className="flex gap-3">
                      {(variant.options ?? []).map((opt, oi) => (
                        <button
                          key={opt.id || oi}
                          onClick={() => {
                            setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt.value }));
                            setVariantError(false);
                          }}
                          disabled={opt.stock === 0}
                          data-testid="variant-button"
                          className={`px-6 py-2 text-sm transition-all cursor-pointer rounded-sm ${
                            selectedVariants[variant.name] === opt.value
                              ? "border-2 border-[#9a4601] font-medium text-[#1d1c17]"
                              : "border border-[#dcc1b4]/30 font-light text-[#554339] hover:border-[#1d1c17]"
                          } ${opt.stock === 0 ? "opacity-30 line-through" : ""}`}
                        >
                          {opt.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {variantError && (
                  <p className="text-red-500 text-xs mt-1">Please select all options</p>
                )}

                {/* Quantity */}
                <div className="space-y-3">
                  <label className="text-[11px] font-medium tracking-[0.1rem] uppercase block text-[#897367]">
                    Quantity
                  </label>
                  <div data-testid="quantity-controls" className="inline-flex border border-[#dcc1b4]/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="quantity-decrease"
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#f8f3eb] transition-colors cursor-pointer"
                    >
                      <Minus size={14} className="text-[#554339]" />
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center font-light border-x border-[#dcc1b4]/30 text-[#1d1c17]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="quantity-increase"
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#f8f3eb] transition-colors cursor-pointer"
                    >
                      <Plus size={14} className="text-[#554339]" />
                    </button>
                  </div>
                  <span data-testid="stock-status" className="text-xs text-[#897367] ml-4">{product.stock} in stock</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {isLoggedIn ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const variantNames = (product.variants ?? []).map((v) => v.name);
                      const allSelected = variantNames.length === 0 || variantNames.every((name) => selectedVariants[name]);
                      if (!allSelected) {
                        setVariantError(true);
                        return;
                      }
                      addItem(product, quantity, selectedVariants);
                      toast.success("Added to cart", { description: `${product.name} × ${quantity}` });
                    }}
                    disabled={product.stock === 0}
                    data-testid="add-to-cart"
                    className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white h-14 font-medium tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 rounded-sm"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </motion.button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => toast("Please log in to add items to your cart", { description: "Create an account or sign in to continue shopping." })}
                    className="w-full bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white h-14 font-medium tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer rounded-sm"
                  >
                    <ShoppingCart size={18} />
                    Login to Add to Cart
                  </Link>
                )}
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      toggleItem(product);
                      toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
                    }}
                    data-testid="add-to-wishlist"
                    className="w-full bg-[#e7e2da] text-[#1d1c17] h-14 font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-[#ece8e0] transition-colors cursor-pointer rounded-sm"
                  >
                    <Heart size={18} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-[#9a4601]" : ""} />
                    {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => toast("Please log in to save items", { description: "Create an account or sign in to use your wishlist." })}
                    className="w-full bg-[#e7e2da] text-[#1d1c17] h-14 font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-[#ece8e0] transition-colors cursor-pointer rounded-sm"
                  >
                    <Heart size={18} />
                    Login to Save to Wishlist
                  </Link>
                )}
              </div>

              {/* Chat */}
              <Link href={`/chat?sellerId=${product.sellerId}&sellerName=${encodeURIComponent(product.sellerName)}`} className="flex items-center gap-2 text-xs text-[#9a4601] hover:text-[#e07b39] transition-colors">
                <MessageCircle size={14} />
                Chat with {product.sellerName}
              </Link>

              {/* Seller Info Row */}
              <div className="pt-10 border-t border-[#dcc1b4]/15 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#ece8e0] flex items-center justify-center overflow-hidden border border-[#dcc1b4]/30 rounded-sm">
                    <span className="text-sm text-[#554339] font-medium">{product.sellerName?.[0] || "S"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1d1c17]">{product.sellerName}</p>
                    <p className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#554339]/70">Verified Artisan</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#554339] group-hover:text-[#9a4601] transition-colors" />
              </div>

              {/* Trust Markers */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Truck, label: "Free Shipping" },
                  { icon: Shield, label: "Buyer Protection" },
                  { icon: RotateCcw, label: "30-Day Returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="p-4 bg-[#f8f3eb] flex flex-col gap-2 rounded-sm">
                    <Icon size={18} strokeWidth={1.5} className="text-[#9a4601]" />
                    <span className="text-[10px] font-medium tracking-[0.05rem] uppercase text-[#1d1c17]">{label}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Section 2 — Product Story / Parallax */}
      {product.images?.[1] && <ParallaxStorySection imageSrc={product.images[1]} />}

      {/* Section 3 — Features */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
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
              className="flex items-center gap-8 md:gap-16 py-8 border-b border-[#dcc1b4]/15"
            >
              <span className="text-3xl md:text-5xl font-light text-[#dcc1b4] shrink-0 w-20">{feature.num}</span>
              <h3 className="text-base md:text-lg text-[#1d1c17] font-normal flex-1">{feature.title}</h3>
              <p className="text-sm text-[#554339] flex-1 hidden md:block font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4 — Reviews Summary */}
      <section data-testid="reviews-section" className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-[11px] text-[#897367] tracking-[0.1rem] uppercase font-medium mb-4">Reviews</p>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl md:text-8xl font-light text-[#1d1c17]">{product.rating}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? "text-[#9a4601] fill-[#9a4601]" : "text-[#dcc1b4]"} />
                ))}
              </div>
              <p className="text-xs text-[#897367] mt-1">{product.reviewCount} reviews</p>
            </div>
          </div>
        </motion.div>

        {/* Write a Review Form (Section 4) */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 p-8 bg-[#f8f3eb] rounded-sm space-y-5 max-w-xl"
          >
            <h3 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#554339]">
              Write a Review
            </h3>
            {reviewSuccess && (
              <div className="bg-[#00677e]/10 text-[#00677e] text-sm px-4 py-3 rounded-sm">
                Review submitted successfully!
              </div>
            )}
            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
                {reviewError}
              </div>
            )}
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                Rating
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={
                        star <= reviewRating
                          ? "text-[#9a4601] fill-[#9a4601]"
                          : "text-[#dcc1b4] hover:text-[#9a4601]/50"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#897367] mb-2 block">
                Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full bg-white border border-[#dcc1b4]/30 text-sm text-[#1d1c17] px-4 py-3 rounded-sm outline-none focus:border-[#9a4601] transition-colors resize-none placeholder:text-[#897367]"
              />
            </div>
            <button
              onClick={handleReviewSubmit}
              disabled={reviewSubmitting || reviewRating === 0 || !reviewComment.trim()}
              className="px-6 py-2.5 bg-[#9a4601] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-[#7a3801] transition-colors cursor-pointer rounded-sm disabled:opacity-50"
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 bg-[#f8f3eb] space-y-3 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#ece8e0] flex items-center justify-center rounded-sm">
                  <span className="text-xs text-[#554339]">{review.userName[0]}</span>
                </div>
                <span className="text-sm text-[#1d1c17]">{review.userName}</span>
                <div className="flex ml-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < review.rating ? "text-[#9a4601] fill-[#9a4601]" : "text-[#dcc1b4]"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#554339] leading-relaxed font-light">{review.comment}</p>
              <p className="text-[10px] text-[#897367]">{formatDate(review.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5 — Complete the Space (Upsell) */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-2 mb-12">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601]">AI Powered</span>
            <span className="text-[9px] bg-[#9a4601]/10 text-[#9a4601] px-2 py-0.5 rounded-sm font-medium tracking-[0.1rem] uppercase">Smart</span>
          </div>
          <h2 className="text-3xl font-light tracking-tighter text-[#1d1c17]">Customers Also Bought</h2>
        </div>
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
