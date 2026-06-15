import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  sendEmergencyAlert
} from '../controllers/notificationController.js';
import {
  validateEmergencyAlertInput,
  validateUuidParam
} from '../validators/notificationValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Retrieve in-app notifications
router.get('/', verifyToken, getNotifications);

// Mark specific notification as read
router.patch('/:id/read', verifyToken, validateUuidParam, markRead);

// Mark all notifications of current user as read
router.post('/read-all', verifyToken, markAllRead);

// Broadcast critical emergency alert to all residents (Admin only)
router.post(
  '/emergency',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateEmergencyAlertInput,
  sendEmergencyAlert
);

export default router;
