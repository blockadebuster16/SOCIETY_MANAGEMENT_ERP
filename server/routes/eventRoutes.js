import { Router } from 'express';
import {
  getEvents,
  getUpcoming,
  getPast,
  getEvent,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  registerResident,
  cancelRegistration,
  uploadEventImages,
  updateAttendance
} from '../controllers/eventController.js';
import {
  validateCreateEventInput,
  validateUpdateEventInput,
  validateUuidParam
} from '../validators/eventValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

// Retrieve events list
router.get('/', verifyToken, cacheMiddleware(300), getEvents);

// Retrieve upcoming events
router.get('/upcoming', verifyToken, cacheMiddleware(300), getUpcoming);

// Retrieve past events
router.get('/past', verifyToken, cacheMiddleware(300), getPast);

// Retrieve specific event details
router.get('/:id', verifyToken, validateUuidParam, cacheMiddleware(300), getEvent);

// Schedule a new event (admin roles only)
router.post(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('coverImage'),
  validateCreateEventInput,
  createEvent
);

// Update event details (admin roles only)
router.patch(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('coverImage'),
  validateUpdateEventInput,
  updateEvent
);

// Publish event (admin roles only)
router.patch(
  '/:id/publish',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  publishEvent
);

// Cancel event (admin roles only)
router.patch(
  '/:id/cancel',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  cancelEvent
);

// Complete event (admin roles only)
router.patch(
  '/:id/complete',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  completeEvent
);

// Register RSVP for event (authenticated residents/users)
router.post('/:id/register', verifyToken, validateUuidParam, registerResident);

// Cancel RSVP for event (authenticated residents/users)
router.delete('/:id/register', verifyToken, validateUuidParam, cancelRegistration);

// Upload images to event gallery (admin roles only)
router.post(
  '/:id/gallery',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.array('images', 10),
  validateUuidParam,
  uploadEventImages
);

// Admin attendance tracking (admin roles only)
router.patch(
  '/:id/attendance',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  updateAttendance
);

export default router;
