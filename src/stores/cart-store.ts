"use client";

import { create } from "zustand";
import type { CartItem, Product } from "@/types";
import { generateId } from "@/lib/utils";

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  addItem: (product: Product, quantity: number, selectedVariants: Record<string, string>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: "",
  couponDiscount: 0,

  addItem: (product, quantity, selectedVariants) => {
    set((state) => {
      const existing = state.items.find(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { id: generateId(), product, quantity, selectedVariants }],
      };
    });
  },

  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((item) => item.id !== id)
        : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    })),

  applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
  removeCoupon: () => set({ couponCode: "", couponDiscount: 0 }),
  clearCart: () => set({ items: [], couponCode: "", couponDiscount: 0 }),

  getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax - get().couponDiscount;
  },
}));
