import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { validateAuditQueryInput } from '../validators/auditValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Query compliance and operational audit trails (Admin only)
router.get(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateAuditQueryInput,
  getAuditLogs
);

export default router;
