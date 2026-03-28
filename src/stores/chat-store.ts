"use client";

import { create } from "zustand";
import type { ChatMessage, Conversation } from "@/types";
import { mockConversations, mockChatMessages } from "@/lib/mock-data";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  setActiveConversation: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  markAsSeen: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: mockConversations,
  activeConversationId: null,
  messages: mockChatMessages,

  setActiveConversation: (id) =>
    set({ activeConversationId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      conversations: state.conversations.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ),
    })),

  markAsSeen: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: state.messages.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, seen: true } : msg
      ),
    })),
}));
