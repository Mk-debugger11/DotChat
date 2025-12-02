import prisma from '../config/database.js';

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const senderId = req.userId;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const group = await prisma.groupChat.findFirst({
      where: {
        id: groupId,
        members: { has: senderId }
      }
    });

    if (!group) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const message = await prisma.groupMessage.create({
      data: {
        groupId,
        senderId,
        content
      },
      include: { group: true }
    });

    await prisma.groupChat.update({
      where: { id: groupId },
      data: { updatedAt: new Date() }
    });

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        id: true,
        username: true,
        avatar: true
      }
    });

    res.status(201).json({
      ...message,
      sender
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { cursor, limit = 20 } = req.query;
    const currentUserId = req.userId;

    const group = await prisma.groupChat.findFirst({
      where: {
        id: groupId,
        members: { has: currentUserId }
      }
    });

    if (!group) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const where = { groupId };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const messages = await prisma.groupMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await prisma.user.findUnique({
          where: { id: message.senderId },
          select: {
            id: true,
            username: true,
            avatar: true
          }
        });
        return {
          ...message,
          sender
        };
      })
    );

    const reversedMessages = messagesWithSenders.reverse();

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    res.json({
      messages: reversedMessages,
      nextCursor,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ error: 'Server error getting messages' });
  }
};
