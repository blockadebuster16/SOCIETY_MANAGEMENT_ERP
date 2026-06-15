import { Router } from 'express';
import {
  getDocuments,
  getDocument,
  getDocumentsByCategory,
  createDocument,
  updateDocument,
  archiveDocument,
  deleteDocument,
  downloadDocument
} from '../controllers/documentController.js';
import {
  validateCreateDocumentInput,
  validateUpdateDocumentInput,
  validateUuidParam,
  validateCategoryUuidParam
} from '../validators/documentValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Retrieve list of documents (Residents see published, Admins see all)
router.get('/', verifyToken, getDocuments);

// Retrieve details for a specific document
router.get('/:id', verifyToken, validateUuidParam, getDocument);

// Retrieve documents of a specific category
router.get('/category/:categoryId', verifyToken, validateCategoryUuidParam, getDocumentsByCategory);

// Upload a new document (admin roles only)
router.post(
  '/',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('document'),
  validateCreateDocumentInput,
  createDocument
);

// Replace document (admin roles only, increments version)
router.patch(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  upload.single('document'),
  validateUpdateDocumentInput,
  updateDocument
);

// Archive document status (admin roles only)
router.patch(
  '/:id/archive',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  archiveDocument
);

// Delete document (admin roles only)
router.delete(
  '/:id',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  deleteDocument
);

// Download document (residents see published, admins see all)
router.get('/:id/download', verifyToken, validateUuidParam, downloadDocument);

export default router;
