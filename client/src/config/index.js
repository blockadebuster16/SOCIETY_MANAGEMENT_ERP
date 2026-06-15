export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://society-management-erp-b1lf.onrender.com/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};
export default config;
