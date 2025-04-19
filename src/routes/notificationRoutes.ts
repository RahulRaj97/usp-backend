import { Router } from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, listNotifications);
router.put('/:id/read', authenticate, markNotificationRead);
router.put('/read-all', authenticate, markAllNotificationsRead);

export default router;
