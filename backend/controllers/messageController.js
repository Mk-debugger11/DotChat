import prisma from '../config/database.js';
import { getIO } from '../socket/socketHandler.js';

//
// SEND MESSAGE (PRIVATE) - creates message in DB and EMITS 'receiveMessage'
//
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.userId;

    if (!chatId || !text) {
      return res.status(400).json({ error: 'Chat ID and text are required' });
    }

    const chatMember = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: { userId: senderId, chatId }
      }
    });

    if (!chatMember) {
      return res.status(403).json({ error: 'You are not a member of this chat' });
    }

    const message = await prisma.message.create({
      data: { text, chatId, senderId },
      include: {
        sender: { select: { id: true, username: true, avatar: true } }
      }
    });

    // Emit a single event for frontend to consume
    const io = getIO();
    io.to(`chat:${chatId}`).emit('receiveMessage', message);

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

//
// GET PRIVATE MESSAGES (returns array)
//
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Return the array directly
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//
// EDIT MESSAGE (private + group — kept as before)
//
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text) return res.status(400).json({ error: 'New text is required' });

    let updatedMessage = null;
    let room = null;
    let isGroup = false;

    const privateMsg = await prisma.message.findUnique({ where: { id: messageId } });

    if (privateMsg) {
      if (privateMsg.senderId !== userId)
        return res.status(403).json({ error: 'You can edit only your own messages' });

      updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { text },
        include: {
          sender: { select: { id: true, username: true, avatar: true } }
        }
      });

      room = `chat:${privateMsg.chatId}`;
      isGroup = false;
    }

    if (!updatedMessage) {
      const groupMsg = await prisma.groupMessage.findUnique({ where: { id: messageId } });

      if (!groupMsg) return res.status(404).json({ error: 'Message not found' });
      if (groupMsg.senderId !== userId) return res.status(403).json({ error: 'You can edit only your own messages' });

      const updated = await prisma.groupMessage.update({
        where: { id: messageId },
        data: { content: text }
      });

      const sender = await prisma.user.findUnique({
        where: { id: updated.senderId },
        select: { id: true, username: true, avatar: true }
      });

      updatedMessage = { ...updated, sender };
      room = `group:${groupMsg.groupId}`;
      isGroup = true;
    }

    const io = getIO();
    io.to(room).emit('messageUpdated', { ...updatedMessage, isGroup });

    res.json({ success: true, data: updatedMessage });
  } catch (err) {
    console.error('Edit message error:', err);
    res.status(500).json({ error: 'Server error editing message' });
  }
};

//
// DELETE MESSAGE (private: soft replace text; group: hard delete)
//
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    let deletedId = null;
    let room = null;
    let isGroup = false;

    const privateMsg = await prisma.message.findUnique({ where: { id: messageId } });

    if (privateMsg) {
      if (privateMsg.senderId !== userId)
        return res.status(403).json({ error: 'You can delete only your own messages' });

      await prisma.message.update({
        where: { id: messageId },
        data: { text: '[deleted]' }
      });

      deletedId = messageId;
      room = `chat:${privateMsg.chatId}`;
      isGroup = false;
    }

    if (!deletedId) {
      const groupMsg = await prisma.groupMessage.findUnique({ where: { id: messageId } });

      if (!groupMsg) return res.status(404).json({ error: 'Message not found' });
      if (groupMsg.senderId !== userId) return res.status(403).json({ error: 'You can delete only your own messages' });

      await prisma.groupMessage.delete({ where: { id: messageId } });

      deletedId = messageId;
      room = `group:${groupMsg.groupId}`;
      isGroup = true;
    }

    const io = getIO();
    io.to(room).emit('messageDeleted', { messageId: deletedId, isGroup });

    res.json({ success: true, data: { messageId: deletedId, isGroup } });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Server error deleting message' });
  }
};
