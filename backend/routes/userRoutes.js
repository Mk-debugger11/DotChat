import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { searchUsers, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchUsers);

router.get('/:id', getUserById);

export default router;

