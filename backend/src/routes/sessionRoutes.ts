import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createSession,
  endSession,
  getMySessions,
  getUserSessions,
  getFeedSessions,
  getSessionById,
  deleteSession,
  fistbumpSession,
  addParticipant,
  removeParticipant,
} from '../controllers/sessionController';

const router = Router();

router.post('/', authMiddleware, createSession);
router.patch('/:id/end', authMiddleware, endSession);
router.post('/:id/fistbump', authMiddleware, fistbumpSession);
router.post('/:id/participants', authMiddleware, addParticipant);
router.delete('/:id/participants/:friendId', authMiddleware, removeParticipant);
router.get('/me', authMiddleware, getMySessions);
router.get('/user/:username', getUserSessions);
router.get('/feed', authMiddleware, getFeedSessions);
router.get('/:id', getSessionById);
router.delete('/:id', authMiddleware, deleteSession);

export default router;
