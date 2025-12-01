import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMe, getUserByUsername, searchUsers } from '../controllers/userController';
import { uploadAvatar } from '../controllers/uploadController';
import { avatarUpload } from '../middleware/upload';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.get('/search', authMiddleware, searchUsers);
router.get('/:username', getUserByUsername);

// Avatar upload endpoint
router.patch('/me/avatar', authMiddleware, avatarUpload.single('avatar'), uploadAvatar);

export default router;
