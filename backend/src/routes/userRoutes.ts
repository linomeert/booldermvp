import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMe, getUserByUsername, searchUsers } from '../controllers/userController';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.get('/search', authMiddleware, searchUsers);
router.get('/:username', getUserByUsername);

export default router;
