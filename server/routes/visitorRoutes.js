import { Router } from 'express';
import {
  createPreApproval,
  getPreApprovals,
  cancelPreApproval,
  checkIn,
  checkOut,
  getActiveEntries,
  getHistory,
  createLog,
  getLogs
} from '../controllers/visitorController.js';
import {
  validatePreApprovalInput,
  validateCheckInInput,
  validateUuidParam,
  validateSecurityLogInput
} from '../validators/visitorValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// --- Pre-Approvals (Residents & Admins) ---
router.post('/pre-approve', verifyToken, validatePreApprovalInput, createPreApproval);
router.get('/pre-approvals', verifyToken, getPreApprovals);
router.delete('/pre-approvals/:id', verifyToken, validateUuidParam, cancelPreApproval);

// --- Check-in / Check-out (Security & Admins only) ---
router.post(
  '/check-in',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  validateCheckInInput,
  checkIn
);

router.patch(
  '/entries/:id/check-out',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  checkOut
);

router.get(
  '/entries/active',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  getActiveEntries
);

router.get(
  '/entries/history',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  getHistory
);

// --- Security Logs (Security & Admins only) ---
router.post(
  '/security-logs',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  validateSecurityLogInput,
  createLog
);

router.get(
  '/security-logs',
  verifyToken,
  restrictTo('security', 'committee_member', 'society_manager', 'super_admin'),
  getLogs
);

export default router;
