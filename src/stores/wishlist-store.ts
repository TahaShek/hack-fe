"use client";

import { create } from "zustand";
import type { Product } from "@/types";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      if (state.items.find((p) => p.id === product.id)) return state;
      return { items: [...state.items, product] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((p) => p.id !== productId) })),
  isInWishlist: (productId) => get().items.some((p) => p.id === productId),
  toggleItem: (product) => {
    if (get().isInWishlist(product.id)) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },
}));
