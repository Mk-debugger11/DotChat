import prisma from '../config/database.js';

export const createChat = async (req, res) => {
  try {
    const { userId, userIds, name, isGroup } = req.body;
    const currentUserId = req.userId;

    if (!isGroup && !userId) {
      return res.status(400).json({ error: 'User ID is required for 1-on-1 chat' });
    }

    if (isGroup && (!userIds || userIds.length < 2)) {
      return res.status(400).json({ error: 'At least 2 users required for group chat' });
    }

    if (isGroup && !name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!isGroup) {
      const userChats = await prisma.chat.findMany({
        where: {
          isGroup: false,
          members: {
            some: { userId: currentUserId }
          }
        },
        include: { members: true }
      });

      for (const chat of userChats) {
        if (chat.members.length === 2) {
          const memberIds = chat.members.map(m => m.userId);
          if (memberIds.includes(currentUserId) && memberIds.includes(userId)) {
            return res.json(chat);
          }
        }
      }
    }

    const chat = await prisma.chat.create({
      data: {
        name: isGroup ? name : null,
        isGroup,
        members: {
          create: isGroup
            ? [currentUserId, ...userIds].map(id => ({ userId: id }))
            : [{ userId: currentUserId }, { userId }]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Server error creating chat' });
  }
};

export const getChats = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const chats = await prisma.chat.findMany({
      where: {
        members: { some: { userId: currentUserId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Server error getting chats' });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        members: { some: { userId: currentUserId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error getting chat' });
  }
};
