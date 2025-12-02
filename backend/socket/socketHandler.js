import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

const onlineUsers = new Map();

export const setupSocketIO = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token'));
      }
      const userId = verifyToken(token);

      if (!userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

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

    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, text } = data;

        const chatMember = await prisma.chatMember.findUnique({
          where: {
            userId_chatId: {
              userId,
              chatId
            }
          }
        });

        if (!chatMember) {
          return socket.emit('error', { message: 'Not a member of this chat' });
        }

        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            avatar: true
          }
        });

        const message = {
          id: `temp-${Date.now()}`, // Temporary ID (will be replaced by DB)
          text,
          chatId,
          senderId: userId,
          sender,
          createdAt: new Date()
        };

        io.to(`chat:${chatId}`).emit('receiveMessage', message);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;

      socket.to(`chat:${chatId}`).emit('typing', {
        userId,
        chatId,
        isTyping
      });
    });


    socket.on('joinGroup', async (groupId) => {
      try {
        const group = await prisma.groupChat.findFirst({
          where: {
            id: groupId,
            members: {
              has: userId
            }
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

    socket.on('sendGroupMessage', async (data) => {
      try {
        const { groupId, content } = data;

        const group = await prisma.groupChat.findFirst({
          where: {
            id: groupId,
            members: {
              has: userId
            }
          }
        });

        if (!group) {
          return socket.emit('error', { message: 'Not a member of this group' });
        }

        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            avatar: true
          }
        });

        const message = {
          id: `temp-${Date.now()}`, 
          content,
          groupId,
          senderId: userId,
          sender,
          createdAt: new Date()
        };

        io.to(`group:${groupId}`).emit('group-message', message);
      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('error', { message: 'Error sending group message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);

      onlineUsers.delete(userId);

      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

