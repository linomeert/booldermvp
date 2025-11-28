import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  addFriend,
  removeFriend,
  getFriends,
  checkFriendship,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../controllers/friendController';

const router = Router();

// More specific routes must come before generic ones
router.post('/:friendId/accept', authMiddleware, acceptFriendRequest);
router.post('/:friendId/reject', authMiddleware, rejectFriendRequest);
router.get('/check/:friendId', authMiddleware, checkFriendship);
router.get('/', authMiddleware, getFriends);
router.post('/:friendId', authMiddleware, addFriend);
router.delete('/:friendId', authMiddleware, removeFriend);

export default router;
