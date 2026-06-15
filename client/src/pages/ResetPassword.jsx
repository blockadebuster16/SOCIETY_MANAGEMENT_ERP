import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function ResetPassword() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      addToast('Password too short.', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      addToast('Confirmation password mismatch.', 'warning');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      addToast('Password changed successfully. Please log in.', 'success');
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 transition-theme">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-theme"
      >
        {/* Banner */}
        <div className="blue-gradient text-white p-6 text-center">
          <h3 className="text-xl font-bold font-serif tracking-wide text-[#D4AF37]">Reset Password</h3>
          <p className="text-xs text-slate-350 mt-1">Suyash Pride Housing Society Portal</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
            Define a new, secure security password to protect your member hub account.
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-400 p-3 rounded-lg text-xs">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                  required
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                  required
                  disabled={isLoading}
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition shadow-md shadow-yellow-500/10 disabled:opacity-50"
          >
            <span>{isLoading ? 'Saving Password...' : 'Save Password'}</span>
          </button>

          {/* Back link */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-society-primary dark:hover:text-[#D4AF37] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
