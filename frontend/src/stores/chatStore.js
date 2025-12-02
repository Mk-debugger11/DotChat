// Chat store using Zustand
// Manages chats, selected chat, and messages

import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // State
  chats: [], 
  selectedChat: null, 
  messages: {}, 
  loading: false, 

  // --- Chat list ---
  setChats: (chats) => set({ chats }),

  addChat: (chat) => {
    const { chats } = get();
    const idx = chats.findIndex((c) => c.id === chat.id);

    if (idx >= 0) {
      const updated = [...chats];
      updated[idx] = chat;
      set({ chats: updated });
    } else {
      set({ chats: [chat, ...chats] });
    }
  },

  setSelectedChat: (chat) => set({ selectedChat: chat }),

  // --- Messages ---
  setMessages: (chatId, msgs) => {
    const all = get().messages;
    set({ messages: { ...all, [chatId]: msgs } });
  },

  addMessage: (chatId, message) => {
    const all = get().messages;
    const list = all[chatId] || [];
    set({
      messages: {
        ...all,
        [chatId]: [...list, message]
      }
    });
  },

  // --- Edit message ---
  editMessage: (messageId, newText) => {
    const { messages: all } = get();
    const updated = {};

    Object.entries(all).forEach(([chatId, list]) => {
      updated[chatId] = list.map((m) =>
        m.id === messageId
          ? { ...m, text: newText }
          : m
      );
    });

    set({ messages: updated });
  },

  // --- Delete (soft delete) ---
  deleteMessage: (messageId) => {
    const { messages: all } = get();
    const updated = {};

    Object.entries(all).forEach(([chatId, list]) => {
      updated[chatId] = list.map((m) =>
        m.id === messageId
          ? { ...m, text: "[deleted]" }  // ← SOFT DELETE FIX
          : m
      );
    });

    set({ messages: updated });
  },

  // --- Loading ---
  setLoading: (loading) => set({ loading })
}));
