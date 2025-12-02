import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createGroup,
  getGroups,
  getGroupById,
  renameGroup,
  addGroupMember,
  removeGroupMember,
  deleteGroup
} from '../controllers/groupController.js';
import {
  sendGroupMessage,
  getGroupMessages
} from '../controllers/groupMessageController.js';

const router = express.Router();

router.use(authMiddleware);

// Create group
router.post('/create', createGroup);

// List groups
router.get('/', getGroups);

// Get single group
router.get('/:groupId', getGroupById);

// Rename group (admin only)
router.put('/:groupId/rename', renameGroup);

// Add member (admin only)
router.post('/:groupId/add-member', addGroupMember);

// Remove member (admin only)
router.post('/:groupId/remove-member', removeGroupMember);

// Delete group (admin only)
router.delete('/:groupId', deleteGroup);

// Group messages
router.post('/:groupId/message', sendGroupMessage);
router.get('/:groupId/messages', getGroupMessages);

export default router;


