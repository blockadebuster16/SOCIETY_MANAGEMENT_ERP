import { Router } from 'express';
import {
  createResident,
  updateResident,
  getResident,
  getProfile,
  getResidents,
  assignProperty,
  removeAssignment,
  bulkImport
} from '../controllers/residentController.js';

// ... other imports stay the same ...
import { getMeComplaints } from '../controllers/complaintController.js';

import {
  validateCreateResidentInput,
  validateUpdateResidentInput,
  validateAssignPropertyInput,
  validateUuidParam
} from '../validators/residentValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Retrieve logged-in user's profile
router.get('/profile/me', verifyToken, getProfile);

// Retrieve logged-in user's complaints
router.get('/me/complaints', verifyToken, getMeComplaints);

// Get directory list (admin roles only)
router.get(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  getResidents
);

// Create new resident (admin roles only)
router.post(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateCreateResidentInput,
  createResident
);

// Bulk import residents (admin roles only)
router.post(
  '/bulk-import',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  bulkImport
);

// Get specific resident details (admin roles only)
router.get(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  getResident
);
// Update resident details (admin roles only)
router.patch(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUpdateResidentInput,
  updateResident
);
// Assign resident to a property (admin roles only)
router.post(
  '/assign-property',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateAssignPropertyInput,
  assignProperty
);

// Remove property assignment (admin roles only)
router.delete(
  '/assign-property/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  removeAssignment
);

export default router;
