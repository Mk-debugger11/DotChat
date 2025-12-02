import prisma from '../config/database.js';
import { getIO } from '../socket/socketHandler.js';

export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const adminId = req.user?.id || req.userId;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        error: 'Group name and member IDs are required'
      });
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

    return res.status(201).json({
      success: true,
      data: groupWithDetails
    });
  } catch (error) {
    console.error('Create group error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Server error creating group' });
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
      return res
        .status(404)
        .json({ error: 'Group not found or you are not a member' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Server error getting group' });
  }
};

// Rename group (admin only)
// PUT /api/groups/:groupId/rename
export const renameGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;
    const userId = req.user?.id || req.userId;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: 'New group name is required' });
    }

    const group = await prisma.groupChat.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, error: 'Group not found' });
    }

    if (group.adminId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the group admin can rename the group'
      });
    }

    const updatedGroup = await prisma.groupChat.update({
      where: { id: groupId },
      data: { name }
    });

    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit('groupUpdated', updatedGroup);
    }

    return res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Rename group error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error renaming group'
    });
  }
};

// Add group member (admin only)
// POST /api/groups/:groupId/add-member
export const addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user?.id || req.userId;

    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, error: 'Member ID is required' });
    }

    const group = await prisma.groupChat.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, error: 'Group not found' });
    }

    if (group.adminId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the group admin can add members'
      });
    }

    if (group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this group'
      });
    }

    const updatedGroup = await prisma.groupChat.update({
      where: { id: groupId },
      data: {
        members: [...group.members, memberId]
      }
    });

    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit('groupMemberAdded', {
        groupId,
        memberId
      });
      io.to(`group:${groupId}`).emit('groupUpdated', updatedGroup);
    }

    return res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Add group member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error adding group member'
    });
  }
};

// Remove group member (admin only)
// POST /api/groups/:groupId/remove-member
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user?.id || req.userId;

    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, error: 'Member ID is required' });
    }

    const group = await prisma.groupChat.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, error: 'Group not found' });
    }

    if (group.adminId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the group admin can remove members'
      });
    }

    if (!group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'User is not a member of this group'
      });
    }

    // Admin cannot remove themselves
    if (memberId === group.adminId) {
      return res.status(400).json({
        success: false,
        error: 'Admin cannot be removed from the group'
      });
    }

    const newMembers = group.members.filter((id) => id !== memberId);

    const updatedGroup = await prisma.groupChat.update({
      where: { id: groupId },
      data: {
        members: newMembers
      }
    });

    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit('groupMemberRemoved', {
        groupId,
        memberId
      });
      io.to(`group:${groupId}`).emit('groupUpdated', updatedGroup);
    }

    return res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Remove group member error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error removing group member'
    });
  }
};

// Delete group (admin only)
// DELETE /api/groups/:groupId
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || req.userId;

    const group = await prisma.groupChat.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, error: 'Group not found' });
    }

    if (group.adminId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the group admin can delete the group'
      });
    }

    await prisma.groupMessage.deleteMany({
      where: { groupId }
    });

    await prisma.groupChat.delete({
      where: { id: groupId }
    });

    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit('groupDeleted', { groupId });
    }

    return res.status(200).json({
      success: true,
      data: { groupId }
    });
  } catch (error) {
    console.error('Delete group error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error deleting group'
    });
  }
};
