import { Router } from 'express';
import { getProperties, modifyPropertyStatus } from '../controllers/propertyController.js';
import { getPropertyResidents } from '../controllers/residentController.js';
import { validatePropertyStatusInput } from '../validators/propertyValidator.js';
import { validateUuidParam } from '../validators/residentValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Retrieve all properties (authenticated users only)
router.get('/', verifyToken, getProperties);

// Modify property active/maintenance status (admin roles only)
router.patch(
  '/:id/status',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validatePropertyStatusInput,
  modifyPropertyStatus
);

// Retrieve all residents linked to a specific property (admin roles only)
router.get(
  '/:id/residents',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  getPropertyResidents
);


export default router;
