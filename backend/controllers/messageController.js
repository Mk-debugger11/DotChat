import prisma from '../config/database.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.userId;

    if (!chatId || !text) {
      return res.status(400).json({ error: 'Chat ID and text are required' });
    }

    const chatMember = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: senderId,
          chatId
        }
      }
    });

    if (!chatMember) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        senderId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        chat: true
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    await prisma.chatMember.updateMany({
      where: {
        chatId,
        userId: { not: senderId }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { cursor, limit = 20 } = req.query;
    const currentUserId = req.userId;

    const chatMember = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: currentUserId,
          chatId
        }
      }
    });

    if (!chatMember) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const where = { chatId };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const reversedMessages = messages.reverse();

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    res.json({
      messages: reversedMessages,
      nextCursor,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error getting messages' });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;
    const currentUserId = req.userId;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const chatMember = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: currentUserId,
          chatId
        }
      }
    });

    if (!chatMember) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        text: {
          contains: q,
          mode: 'insensitive'
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(messages);
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Server error searching messages' });
  }
};
