"use client";

import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  chatbotOpen: boolean;
  searchQuery: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleChatbot: () => void;
  setChatbotOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  chatbotOpen: false,
  searchQuery: "",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleChatbot: () => set((state) => ({ chatbotOpen: !state.chatbotOpen })),
  setChatbotOpen: (open) => set({ chatbotOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
