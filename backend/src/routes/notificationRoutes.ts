import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
