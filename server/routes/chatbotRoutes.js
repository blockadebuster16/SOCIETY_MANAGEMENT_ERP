import { Router } from 'express';
import { queryChatbot, trainChatbotFAQ } from '../controllers/chatbotController.js';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';
import { validateQueryInput, validateTrainInput } from '../validators/chatbotValidator.js';

const router = Router();

// Query the AI Assistant (All authenticated residents)
router.post('/query', verifyToken, validateQueryInput, queryChatbot);

// Query the AI Assistant (Public/Unauthenticated)
router.post('/public-query', validateQueryInput, queryChatbot);

// Train the AI Assistant with new FAQ pairs (Admin only)
router.post(
  '/train',
  verifyToken,
  restrictTo('committee_member', 'society_manager', 'super_admin'),
  validateTrainInput,
  trainChatbotFAQ
);

export default router;

