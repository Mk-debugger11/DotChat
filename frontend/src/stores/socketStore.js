import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore';
import { useChatStore } from './chatStore';
import { useGroupStore } from './groupStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  isConnected: false,

  connect: () => {
    const { token } = useAuthStore.getState();

    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    const socket = io('https://dotchat-py90.onrender.com', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    // Shortcuts to other stores
    const chatStore = useChatStore.getState();
    const groupStore = useGroupStore.getState();

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('onlineUsers', (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Private message received
    socket.on('receiveMessage', (message) => {
      chatStore.addMessage(message.chatId, message);
    });

    // Group message received
    socket.on('group-message', (message) => {
      groupStore.addGroupMessage(message.groupId, message);
    });

    // Message updated (private or group)
    socket.on('messageUpdated', (payload) => {
      if (payload.isGroup) {
        groupStore.editMessage
          ? groupStore.editMessage(payload.id, payload.content)
          : null;
      } else {
        chatStore.editMessage &&
          chatStore.editMessage(payload.id, payload.text);
      }
    });

    // Message deleted (private or group)
    socket.on('messageDeleted', (payload) => {
      if (payload.isGroup) {
        groupStore.deleteMessage && groupStore.deleteMessage(payload.id);
      } else {
        chatStore.deleteMessage && chatStore.deleteMessage(payload.id);
      }
    });

    // Group updated (rename or membership change)
    socket.on('groupUpdated', (group) => {
      groupStore.addGroup(group);
    });

    socket.on('groupMemberAdded', ({ groupId, memberId }) => {
      groupStore.addMember && groupStore.addMember(groupId, memberId);
    });

    socket.on('groupMemberRemoved', ({ groupId, memberId }) => {
      groupStore.removeMember && groupStore.removeMember(groupId, memberId);
    });

    socket.on('groupDeleted', ({ groupId }) => {
      groupStore.deleteGroup && groupStore.deleteGroup(groupId);
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
  }
}));

