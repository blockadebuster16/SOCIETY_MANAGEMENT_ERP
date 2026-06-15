import Razorpay from 'razorpay';
import { env } from './env.js';

// Initialize Razorpay client placeholder (verified in Phase 4)
export const razorpay = new Razorpay({
  key_id: env.razorpayKeyId || 'mock_key_id',
  key_secret: env.razorpayKeySecret || 'mock_key_secret',
});
