import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

const onlineUsers = new Map();
let ioInstance = null;

export const getIO = () => ioInstance;

export const setupSocketIO = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token'));
      const userId = verifyToken(token);
      if (!userId) return next(new Error('Authentication error: Invalid token'));

      socket.userId = userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected: ${socket.id}`);

    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // Join chat room
    socket.on('joinChat', async (chatId) => {
      try {
        const chatMember = await prisma.chatMember.findUnique({
          where: {
            userId_chatId: {
              userId,
              chatId
            }
          }
        });

        if (chatMember) {
          socket.join(`chat:${chatId}`);
          console.log(`User ${userId} joined chat ${chatId}`);
        }
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit('typing', {
        userId,
        chatId,
        isTyping
      });
    });

    // Join group room
    socket.on('joinGroup', async (groupId) => {
      try {
        const group = await prisma.groupChat.findFirst({
          where: {
            id: groupId,
            members: { has: userId }
          }
        });

        if (group) {
          socket.join(`group:${groupId}`);
          console.log(`User ${userId} joined group ${groupId}`);
        }
      } catch (error) {
        console.error('Error joining group:', error);
      }
    });

    socket.on('leaveGroup', (groupId) => {
      socket.leave(`group:${groupId}`);
      console.log(`User ${userId} left group ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};
