import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getMessages,
  searchMessages,
  editMessage,
  deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.use(authMiddleware);

// Create message
router.post('/', sendMessage);

// Edit message (private or group)
router.put('/:messageId', editMessage);

// Delete message (private or group)
router.delete('/:messageId', deleteMessage);

// Get messages in a chat
router.get('/:chatId', getMessages);

// Search messages in a chat
router.get('/:chatId/search', searchMessages);

export default router;


