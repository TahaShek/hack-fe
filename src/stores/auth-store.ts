"use client";

import { create } from "zustand";
import type { User } from "@/types";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginBuyer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginSeller: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerBuyer: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  registerSeller: (data: { storeName: string; ownerName: string; email: string; phone: string; password: string; storeDescription?: string; businessAddress?: { street: string; city: string; state: string; zip: string; country: string }; bankDetails?: { bankName: string; accountNumber: string; routingNumber: string } }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<{ success: boolean }>;
  loadUser: () => Promise<void> | void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || "An unexpected error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? (localStorage.getItem("token") !== "undefined" ? localStorage.getItem("token") : null) : null,
  isAuthenticated: typeof window !== "undefined" ? !!(localStorage.getItem("token") && localStorage.getItem("token") !== "undefined") : false,
  isLoading: false,

  loginBuyer: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login/buyer", { email, password });
      const data = res.data.data;
      const user = data.user;
      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      // Sync cart and wishlist from server after login
      useCartStore.getState().syncCart();
      useWishlistStore.getState().syncWishlist();
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  loginSeller: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login/seller", { email, password });
      const data = res.data.data;
      const user = data.user;
      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  loginAdmin: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login/admin", { email, password });
      const data = res.data.data;
      const user = data.user;
      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  registerBuyer: async (data) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/register/buyer", data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  registerSeller: async (data) => {
    set({ isLoading: true });
    try {
      await api.post("/auth/register/seller", data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: getErrorMessage(error) };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Proceed with local cleanup even if API call fails
    }
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    try {
      const res = await api.post("/auth/refresh");
      const data = res.data.data;
      const token = data.accessToken || data.token;
      localStorage.setItem("token", token);
      set({ token });
      return { success: true };
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
      return { success: false };
    }
  },

  loadUser: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      set({ token: null, isAuthenticated: false, user: null });
      return;
    }
    set({ token, isAuthenticated: true });
    // Fetch user profile from server to restore user object after refresh
    try {
      const res = await api.get("/buyer/profile");
      if (res.data.success && res.data.data) {
        const u = res.data.data;
        set({ user: { id: u.id || u._id, name: u.fullName || u.name || u.storeName || u.ownerName, email: u.email, role: u.role, status: u.status || "active", createdAt: u.createdAt } as User });
      }
    } catch {
      // Token might be for seller/admin — try seller profile
      try {
        const res = await api.get("/seller/settings");
        if (res.data.success && res.data.data) {
          const u = res.data.data;
          set({ user: { id: u.id || u._id, name: u.storeName || u.ownerName, email: u.email, role: "seller", status: u.status || "active", createdAt: u.createdAt } as User });
        }
      } catch {
        // Token invalid or expired — keep authenticated state from localStorage
      }
    }
  },
}));
