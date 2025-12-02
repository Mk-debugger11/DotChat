import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./authStore";

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  isConnected: false,

  connect: () => {
    const { token } = useAuthStore.getState();

    if (!token) {
      console.error("No token available for socket connection");
      return;
    }

    const socket = io("https://dotchat-py90.onrender.com", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ isConnected: false });
    });

    socket.on("onlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },

  setOnlineUsers: (userIds) => {
    set({ onlineUsers: userIds });
  },
}));
