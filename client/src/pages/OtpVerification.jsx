import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function OtpVerification() {
  const { verifyOTP, loginWithPhone } = useAuthContext();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const phone = location.state?.phone || '9820012345';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input changes
  const handleChange = (index, val) => {
    if (isNaN(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1); // Limit to 1 character
    setOtp(newOtp);

    // Forward focus
    if (val && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key down (specifically backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle pasting code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs[5].current.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      addToast('Please fill out the OTP inputs.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOTP(phone, code);
      addToast('Authenticated successfully via OTP!', 'success');
      
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
      setError(err.message || 'Verification failed. Please verify the code.');
      addToast(err.message || 'Verification failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (timer > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimer(59);
    try {
      await loginWithPhone(phone);
      addToast('A new 6-digit OTP code has been sent.', 'info');
      inputRefs[0].current.focus();
    } catch (err) {
      addToast('Failed to resend OTP code.', 'error');
    }
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
          <h3 className="text-xl font-bold font-serif tracking-wide text-[#D4AF37]">Verify Security OTP</h3>
          <p className="text-xs text-slate-350 mt-1">Suyash Pride Housing Society Portal</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We have dispatched a 6-digit verification code to your registered mobile number:
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              +91 {phone.substring(0, 3)}****{phone.substring(7)}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-455 p-3 rounded-lg text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP inputs container */}
          <div className="flex justify-between gap-2 py-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isLoading}
                className="w-12 h-12 text-center bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme shadow-inner"
              />
            ))}
          </div>

          <div className="text-center text-xs">
            {timer > 0 ? (
              <p className="text-slate-400">
                Resend OTP code in <span className="font-bold text-slate-600 dark:text-slate-300">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-yellow-600 font-bold transition focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP Code</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-society-primary dark:bg-[#D4AF37] hover:bg-[#0b213b] dark:hover:bg-yellow-600 text-white dark:text-society-primary font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition shadow-md disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
          </button>

          {/* Prompt warning for test environment */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-[10px] text-slate-500 leading-normal text-center">
            <strong>Demo Tip:</strong> Enter <strong>123456</strong> to pass verification in this demo mode.
          </div>

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

export default OtpVerification;
