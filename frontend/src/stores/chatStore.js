import { create } from 'zustand';
import { messageAPI } from '../utils/api';

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: {}, // { chatId: [ ... ] }
  loading: false,

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

  setMessages: (chatId, msgs) => {
    const all = get().messages;
    set({ messages: { ...all, [chatId]: msgs } });
  },

  addMessage: (chatId, message) => {
    const all = get().messages;
    const list = all[chatId] || [];
    set({ messages: { ...all, [chatId]: [...list, message] } });
  },

  editMessage: (messageId, newText) => {
    const { messages: all } = get();
    const updated = {};
    Object.entries(all).forEach(([chatId, list]) => {
      updated[chatId] = list.map((m) => (m.id === messageId ? { ...m, text: newText } : m));
    });
    set({ messages: updated });
  },

  deleteMessage: (messageId) => {
    const { messages: all } = get();
    const updated = {};
    Object.entries(all).forEach(([chatId, list]) => {
      updated[chatId] = list.map((m) => (m.id === messageId ? { ...m, text: '[deleted]' } : m));
    });
    set({ messages: updated });
  },

  setLoading: (loading) => set({ loading })
}));
