import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  supabaseUrl: process.env.SUPABASE_URL || 'https://mock.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'mock_key',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
};
