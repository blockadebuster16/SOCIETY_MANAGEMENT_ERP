import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

function ForgotPassword() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your registered email address.', 'warning');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      addToast('Recovery email sent successfully.', 'success');
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1200);
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
          <h3 className="text-xl font-bold font-serif tracking-wide text-[#D4AF37]">Recover Account</h3>
          <p className="text-xs text-slate-350 mt-1">Suyash Pride Housing Society Portal</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                  Enter your registered email address below. We will send you instructions to securely reset your password.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. resident@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition shadow-md shadow-yellow-500/10 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Processing...' : 'Send Reset Link'}</span>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 rounded-full w-fit mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Instructions Dispatched</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    We have dispatched password recovery instructions to <strong>{email}</strong>. Please check your inbox and spam folders.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-semibold text-society-primary dark:text-[#D4AF37] hover:underline"
                  >
                    Resubmit a different email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Back link */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-society-primary dark:hover:text-[#D4AF37] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper import to support AnimatePresence inside components
import { AnimatePresence } from 'framer-motion';

export default ForgotPassword;
