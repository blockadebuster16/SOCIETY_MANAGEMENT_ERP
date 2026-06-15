import { Router } from 'express';
import {
  getNotices,
  getLatest,
  getNotice,
  createNotice,
  updateNotice,
  publishNotice,
  archiveNotice,
  deleteNotice
} from '../controllers/noticeController.js';
import {
  validateCreateNoticeInput,
  validateUpdateNoticeInput,
  validateUuidParam
} from '../validators/noticeValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Retrieve all notices (residents view published/active, admins see all)
router.get('/', verifyToken, getNotices);

// Retrieve latest notices
router.get('/latest', verifyToken, getLatest);

// Retrieve specific notice details
router.get('/:id', verifyToken, validateUuidParam, getNotice);

// Compose a new notice (admin roles only)
router.post(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('attachment'),
  validateCreateNoticeInput,
  createNotice
);

// Edit notice content (admin roles only)
router.patch(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('attachment'),
  validateUpdateNoticeInput,
  updateNotice
);

// Publish a notice (admin roles only)
router.patch(
  '/:id/publish',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  publishNotice
);

// Archive a notice (admin roles only)
router.patch(
  '/:id/archive',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  archiveNotice
);

// Delete notice (admin roles only)
router.delete(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  deleteNotice
);

export default router;
