import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, ShieldCheck, AlertCircle, Sparkles, Key } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Login() {
  const { login, loginWithPhone } = useAuthContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [phoneVal, setPhoneVal] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email format validation
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Submit email login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(emailForm.email)) {
      setError('Please enter a valid email address.');
      addToast('Invalid email format.', 'warning');
      return;
    }

    if (emailForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      addToast('Password too short.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(emailForm.email, emailForm.password);
      addToast('Logged in successfully!', 'success');
      
      // Determine redirection by user role
      const role = response.user.role;
      if (role === 'resident') {
        navigate('/resident/dashboard');
      } else if (role === 'security') {
        navigate('/security/dashboard');
      } else if (role === 'super_admin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Authentication failed.';
      setError(serverMessage);
      addToast(serverMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit phone OTP request
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneVal)) {
      setError('Please enter a valid 10-digit mobile number.');
      addToast('Invalid mobile format.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithPhone(phoneVal);
      addToast('Verification code dispatched!', 'success');
      // Redirect to verification view and pass phone state
      navigate('/verify-otp', { state: { phone: phoneVal } });
    } catch (err) {
      setError('Failed to dispatch verification code.');
      addToast('Failed to dispatch code.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Prefill helper for testing
  const handleQuickPrefill = (role) => {
    const creds = {
      resident: { email: 'parth@example.com', password: 'password123' },
      admin: { email: 'secretary@suyashpride.org', password: 'password123' },
      superadmin: { email: 'superadmin@suyashpride.org', password: 'password123' },
    }[role];

    if (creds) {
      setEmailForm(creds);
      setActiveTab('email');
      addToast(`Prefilled credentials for ${role}`, 'info');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 transition-theme">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-theme"
      >
        {/* Header Branding */}
        <div className="blue-gradient text-white p-6 text-center">
          <h3 className="text-xl font-bold font-serif tracking-wide text-[#D4AF37]">SUYASH PRIDE</h3>
          <p className="text-xs text-slate-300 mt-1">Housing Society Administration Portal</p>
        </div>

        {/* Tab selection header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => {
              setActiveTab('email');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-800 text-society-primary dark:text-[#D4AF37] shadow-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Sign In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('phone');
              setError('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'phone'
                ? 'bg-white dark:bg-slate-800 text-society-primary dark:text-[#D4AF37] shadow-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone OTP Login</span>
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-455 p-3 rounded-lg text-xs mb-6 animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'email' ? (
              // Email / Password Form
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      placeholder="e.g. parth@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-[10px] font-bold text-[#D4AF37] hover:text-yellow-600 transition"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-society-primary dark:bg-[#D4AF37] hover:bg-[#0b213b] dark:hover:bg-yellow-600 text-white dark:text-society-primary font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition shadow-md disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                </button>
              </motion.form>
            ) : (
              // Phone OTP Dispatch Form
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value)}
                      placeholder="e.g. 9820012345 (10-digit)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                      required
                      disabled={isLoading}
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition shadow-md shadow-yellow-500/10 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Requesting OTP...' : 'Send Verification OTP'}</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quick Prefill Selection for Developers */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Demo Quick-Prefills</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['resident', 'admin', 'superadmin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickPrefill(role)}
                  className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 px-3 py-1.5 rounded-full transition"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
