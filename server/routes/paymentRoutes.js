import { Router } from 'express';
import {
  getBillingCycles,
  createBillingCycle,
  generateBills,
  triggerPenalties,
  getBills,
  getBill,
  postReceipt,
  getReceipts,
  getOutstanding,
  getLedger,
  createOrder,
  verifyPayment
} from '../controllers/paymentController.js';
import {
  validateBillingCycleInput,
  validateCreateReceiptInput,
  validateCreateOrderInput,
  validateVerifyPaymentInput,
  validateUuidParam
} from '../validators/paymentValidator.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// --- Billing Cycles & Runs (Admin roles only) ---
router.get(
  '/cycles',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  getBillingCycles
);

router.post(
  '/cycles',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateBillingCycleInput,
  createBillingCycle
);

router.post(
  '/cycles/:id/generate',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateUuidParam,
  generateBills
);

router.post(
  '/apply-penalties',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  triggerPenalties
);

// --- Bills Retrieve (Authenticated users) ---
router.get('/bills', verifyToken, getBills);
router.get('/bills/:id', verifyToken, validateUuidParam, getBill);

// --- Receipts Posting & Retrieve ---
router.post(
  '/receipts',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateCreateReceiptInput,
  postReceipt
);

router.get('/receipts', verifyToken, getReceipts);

// --- Ledgers & Balances ---
router.get('/outstanding/:propertyId', verifyToken, validateUuidParam, getOutstanding);
router.get('/ledger/:propertyId', verifyToken, validateUuidParam, getLedger);

// --- Razorpay Payment Order endpoints ---
router.post('/create-order', verifyToken, validateCreateOrderInput, createOrder);
router.post('/verify', verifyToken, validateVerifyPaymentInput, verifyPayment);

export default router;
