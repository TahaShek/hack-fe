"use client";

import { create } from "zustand";
import type { ChatMessage, Conversation } from "@/types";

interface TypingUser {
  userId: string;
  timeout: ReturnType<typeof setTimeout>;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  typingUsers: Record<string, string[]>; // conversationId -> userId[]

  setActiveConversation: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  markAsSeen: (conversationId: string) => void;
  markRemoteSeen: (conversationId: string, userId: string) => void;
  updateTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

// Track typing timeouts outside the store to avoid serialization issues
const typingTimeouts: Record<string, TypingUser[]> = {};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (message) =>
    set((state) => {
      // Prevent duplicate messages
      if (state.messages.some((m) => m.id === message.id)) return state;

      return {
        messages: [...state.messages, message],
        conversations: state.conversations.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        ),
      };
    }),

  markAsSeen: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: state.messages.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, seen: true } : msg
      ),
    })),

  markRemoteSeen: (conversationId, _userId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, seen: true } : msg
      ),
    })),

  updateTypingStatus: (conversationId, userId, isTyping) => {
    // Clear existing timeout for this user in this conversation
    const existing = typingTimeouts[conversationId]?.find((t) => t.userId === userId);
    if (existing) clearTimeout(existing.timeout);

    if (isTyping) {
      // Auto-clear typing after 3 seconds
      const timeout = setTimeout(() => {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: (state.typingUsers[conversationId] || []).filter(
              (id) => id !== userId
            ),
          },
        }));
      }, 3000);

      if (!typingTimeouts[conversationId]) typingTimeouts[conversationId] = [];
      typingTimeouts[conversationId].push({ userId, timeout });

      set((state) => {
        const current = state.typingUsers[conversationId] || [];
        if (current.includes(userId)) return state;
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: [...current, userId],
          },
        };
      });
    } else {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: (state.typingUsers[conversationId] || []).filter(
            (id) => id !== userId
          ),
        },
      }));
    }
  },

  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
}));
