import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, searchMessages } from '../controllers/messageController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', sendMessage);

router.get('/:chatId', getMessages);

router.get('/:chatId/search', searchMessages);

export default router;

