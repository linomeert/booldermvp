import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  addFriend,
  removeFriend,
  getFriends,
  checkFriendship,
} from '../controllers/friendController';

const router = Router();

router.post('/:friendId', authMiddleware, addFriend);
router.delete('/:friendId', authMiddleware, removeFriend);
router.get('/', authMiddleware, getFriends);
router.get('/check/:friendId', authMiddleware, checkFriendship);

export default router;
