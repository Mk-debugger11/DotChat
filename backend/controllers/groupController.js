import prisma from '../config/database.js';

export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const adminId = req.userId;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Group name and member IDs are required' });
    }

    const allMembers = [adminId, ...memberIds];

    const group = await prisma.groupChat.create({
      data: {
        name,
        adminId,
        members: allMembers
      }
    });

    const groupWithDetails = await prisma.groupChat.findUnique({
      where: { id: group.id },
      include: {
        groupMessages: {
          take: 0
        }
      }
    });

    res.status(201).json(groupWithDetails);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error creating group' });
  }
};

export const getGroups = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const groups = await prisma.groupChat.findMany({
      where: {
        members: {
          has: currentUserId
        }
      },
      include: {
        groupMessages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error getting groups' });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.userId;

    const group = await prisma.groupChat.findFirst({
      where: {
        id: groupId,
        members: {
          has: currentUserId
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or you are not a member' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Server error getting group' });
  }
};
