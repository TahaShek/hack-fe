"use client";

import { create } from "zustand";
import type { Product } from "@/types";
import api from "@/services/api";

interface WishlistState {
  items: Product[];
  syncWishlist: () => Promise<void>;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  syncWishlist: async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.get("/buyer/wishlist");
      const data = res.data.data;
      if (data && Array.isArray(data)) {
        set({ items: data });
      }
    } catch {
      // Silently fail — keep working with local state
    }
  },

  addItem: (product) => {
    if (!product) return;
    set((state) => {
      if ((state.items ?? []).find((p) => p?.id === product?.id)) return state;
      return { items: [...(state.items ?? []), product] };
    });
    if (isAuthenticated()) {
      api.post(`/buyer/wishlist/${product.id}`).catch(() => {});
    }
  },

  removeItem: (productId) => {
    set((state) => ({ items: (state.items ?? []).filter((p) => p?.id !== productId) }));
    if (isAuthenticated()) {
      api.delete(`/buyer/wishlist/${productId}`).catch(() => {});
    }
  },

  isInWishlist: (productId) => (get().items ?? []).some((p) => p?.id === productId),

  toggleItem: (product) => {
    if (!product) return;
    if (get().isInWishlist(product.id)) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },
}));
