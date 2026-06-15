import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.get('/profile', verifyToken, getProfile);

export default router;
