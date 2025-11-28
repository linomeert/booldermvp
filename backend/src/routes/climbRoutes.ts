import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createClimb,
  getMyClimbs,
  getUserClimbs,
  getClimbById,
  deleteClimb,
} from '../controllers/climbController';

const router = Router();

router.post('/', authMiddleware, createClimb);
router.get('/me', authMiddleware, getMyClimbs);
router.get('/user/:username', getUserClimbs);
router.get('/:id', getClimbById);
router.delete('/:id', authMiddleware, deleteClimb);

export default router;
