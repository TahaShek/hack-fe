"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { generateId } from "@/lib/utils";
import api from "@/services/api";

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  _hydrated: boolean;
  syncCart: () => Promise<void>;
  addItem: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  couponCode: "",
  couponDiscount: 0,
  _hydrated: false,

  syncCart: async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.get("/cart");
      const data = res.data.data;
      if (data && data.items) {
        set({ items: data.items, couponCode: data.couponCode || "", couponDiscount: data.couponDiscount || 0 });
      }
    } catch {
      // Keep local state on failure
    }
  },

  addItem: (product, quantity, selectedVariants) => {
    if (!product) return;
    set((state) => {
      const existing = state.items.find(
        (item) =>
          item.product?.id === product?.id &&
          JSON.stringify(item.selectedVariants ?? {}) === JSON.stringify(selectedVariants ?? {})
      );
      if (existing) {
        const newItems = state.items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        // Fire API call in background
        if (isAuthenticated()) {
          api.post("/cart/items", { productId: product.id, quantity: existing.quantity + quantity, selectedVariants }).catch(() => {});
        }
        return { items: newItems };
      }
      const newItem: CartItem = { id: generateId(), product, quantity, selectedVariants };
      // Fire API call in background
      if (isAuthenticated()) {
        api.post("/cart/items", { productId: product.id, quantity, selectedVariants }).catch(() => {});
      }
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    if (isAuthenticated() && item) {
      api.delete(`/cart/items/${item.product.id}`).catch(() => {});
    }
  },

  updateQuantity: (id, quantity) => {
    const item = get().items.find((i) => i.id === id);
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((item) => item.id !== id)
        : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    }));
    if (isAuthenticated() && item) {
      if (quantity <= 0) {
        api.delete(`/cart/items/${item.product.id}`).catch(() => {});
      } else {
        api.put(`/cart/items/${item.product.id}`, { quantity }).catch(() => {});
      }
    }
  },

  applyCoupon: async (code: string) => {
    if (!isAuthenticated()) {
      return { success: false, error: "Please log in to apply a coupon" };
    }
    try {
      const res = await api.post("/cart/apply-coupon", { code });
      const data = res.data.data;
      set({ couponCode: data.couponCode, couponDiscount: data.couponDiscount ?? data.discount ?? 0 });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid coupon code";
      const axiosMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return { success: false, error: axiosMsg || message };
    }
  },

  removeCoupon: () => set({ couponCode: "", couponDiscount: 0 }),
  clearCart: () => set({ items: [], couponCode: "", couponDiscount: 0 }),

  getSubtotal: () => (get().items ?? []).reduce((sum, item) => sum + (item.product?.price ?? 0) * (item.quantity ?? 0), 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax - get().couponDiscount;
  },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          // After rehydrating from localStorage, sync with server if logged in
          if (isAuthenticated()) {
            state.syncCart();
          }
        }
      },
    },
  ),
);
