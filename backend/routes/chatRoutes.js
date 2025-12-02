import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createChat, getChats, getChatById } from '../controllers/chatController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createChat);

router.get('/', getChats);

router.get('/:id', getChatById);

export default router;

