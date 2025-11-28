import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as commentController from '../controllers/commentController';

const router = Router();

router.get('/sessions/:sessionId/comments', authMiddleware, commentController.getSessionComments);
router.post('/sessions/:sessionId/comments', authMiddleware, commentController.createComment);
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

export default router;
