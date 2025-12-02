import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createGroup, getGroups, getGroupById } from '../controllers/groupController.js';
import { sendGroupMessage, getGroupMessages } from '../controllers/groupMessageController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/create', createGroup);

router.get('/', getGroups);

router.get('/:groupId', getGroupById);

router.post('/:groupId/message', sendGroupMessage);

router.get('/:groupId/messages', getGroupMessages);

export default router;

