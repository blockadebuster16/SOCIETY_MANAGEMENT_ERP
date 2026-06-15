import { Router } from 'express';
import {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  updateStatus,
  assignComplaint,
  closeComplaint,
  reopenComplaint,
  addComment,
  uploadAttachment
} from '../controllers/complaintController.js';
import {
  validateCreateComplaintInput,
  validateUpdateComplaintInput,
  validateStatusUpdateInput,
  validateAssignComplaintInput,
  validateCloseComplaintInput,
  validateCommentInput,
  validateUuidParam
} from '../validators/complaintValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Retrieve complaints list (residents get own, admins get all)
router.get('/', verifyToken, getComplaints);

// Retrieve specific ticket details
router.get('/:id', verifyToken, validateUuidParam, getComplaint);

// Raise a new complaint (authenticated residents/users)
router.post('/', verifyToken, validateCreateComplaintInput, createComplaint);

// Update complaint details (residents/users edit own open complaints)
router.patch('/:id', verifyToken, validateUpdateComplaintInput, updateComplaint);

// Update status workflow (admin roles only)
router.patch(
  '/:id/status',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateStatusUpdateInput,
  updateStatus
);

// Assign ticket (admin roles only)
router.patch(
  '/:id/assign',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateAssignComplaintInput,
  assignComplaint
);

// Close ticket (admin roles only, requires resolutionNotes)
router.patch(
  '/:id/close',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateCloseComplaintInput,
  closeComplaint
);

// Reopen ticket (residents or admins)
router.patch('/:id/reopen', verifyToken, validateUuidParam, reopenComplaint);

// Comment thread triggers
router.post('/:id/comments', verifyToken, validateCommentInput, addComment);

// Upload photos triggers
router.post('/:id/attachments', verifyToken, upload.single('attachment'), validateUuidParam, uploadAttachment);

export default router;
