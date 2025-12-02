// Chat store using Zustand
// Manages chats, selected chat, and messages

import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // State
  chats: [], // List of all chats
  selectedChat: null, // Currently selected chat
  messages: {}, // Messages by chatId: { chatId: [messages] }
  loading: false, // Loading state

  // Actions
  // Set chats list
  setChats: (chats) => {
    set({ chats });
  },

  // Add or update a chat
  addChat: (chat) => {
    const { chats } = get();
    const existingIndex = chats.findIndex((c) => c.id === chat.id);

    if (existingIndex >= 0) {
      // Update existing chat
      const updatedChats = [...chats];
      updatedChats[existingIndex] = chat;
      set({ chats: updatedChats });
    } else {
      // Add new chat
      set({ chats: [chat, ...chats] });
    }
  },

  // Select a chat
  setSelectedChat: (chat) => {
    set({ selectedChat: chat });
  },

  // Set messages for a chat
  setMessages: (chatId, messages) => {
    const { messages: allMessages } = get();
    set({
      messages: {
        ...allMessages,
        [chatId]: messages
      }
    });
  },

  // Add a message to a chat
  addMessage: (chatId, message) => {
    const { messages: allMessages } = get();
    const chatMessages = allMessages[chatId] || [];
    set({
      messages: {
        ...allMessages,
        [chatId]: [...chatMessages, message]
      }
    });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  }
}));

