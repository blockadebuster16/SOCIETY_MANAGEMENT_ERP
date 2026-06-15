import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Wallet, Sparkles, CheckCircle2, 
  Loader2, AlertTriangle, FileText, ArrowRight, Smartphone, Building, RefreshCw, X
} from 'lucide-react';
import { getPaymentsForResident, savePayment, getSettings } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

function Payments() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({});
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'verifying' | 'success'
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('parth@okaxis');
  const [phone, setPhone] = useState('98200 12345');
  const [email, setEmail] = useState('parth@example.com');
  const [txId, setTxId] = useState('');

  // Load invoices
  const loadInvoices = () => {
    // Current resident flat is A-102
    const resPayments = getPaymentsForResident('A-102');
    setPayments(resPayments);
    setSettings(getSettings());
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const penaltyRate = settings.penaltyRate || 18;
  const penaltyGraceDays = settings.penaltyGraceDays || 5;

  // Calculate late fee penalty interest dynamically
  const calculatePenalty = (invoice) => {
    if (invoice.status !== 'PENDING') return 0;
    try {
      const parts = invoice.dueDate.split('-');
      if (parts.length !== 3) return 0;
      const day = parseInt(parts[0], 10);
      const monthStr = parts[1];
      const year = parseInt(parts[2], 10);
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = months[monthStr];
      if (month === undefined) return 0;
      
      const dueDateObj = new Date(year, month, day);
      const currentDate = new Date('2026-06-14T22:22:18'); // Simulated current date
      
      const diffTime = currentDate - dueDateObj;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > penaltyGraceDays) {
        // Simple Interest: P * R * T / 365
        const interest = (invoice.amount * (penaltyRate / 100) * diffDays) / 365;
        return Math.round(interest);
      }
    } catch (e) {
      console.error(e);
    }
    return 0;
  };

  const pendingInvoices = payments.filter(p => p.status === 'PENDING');
  const totalOutstanding = pendingInvoices.reduce((acc, curr) => acc + curr.amount + calculatePenalty(curr), 0);

  const triggerPayment = (invoice) => {
    const penalty = calculatePenalty(invoice);
    setSelectedInvoice({
      ...invoice,
      penalty,
      totalPayable: invoice.amount + penalty
    });
    setPaymentStep('select');
    setShowRzpModal(true);
  };

  const handleSimulatePayment = () => {
    // Step 1: Processing
    setPaymentStep('processing');
    
    // Step 2: Signature verification
    setTimeout(() => {
      setPaymentStep('verifying');
      
      // Step 3: Success
      setTimeout(() => {
        const mockTxId = `pay_Rzp${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const mockReceipt = `SP-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setTxId(mockTxId);
        
        // Update database with detailed amounts paid
        const updatedInvoice = {
          ...selectedInvoice,
          status: 'SUCCESS',
          paidDate: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).replace(/\s/g, '-'),
          transactionId: mockTxId,
          receiptNo: mockReceipt,
          amountPaid: selectedInvoice.totalPayable,
          penaltyApplied: selectedInvoice.penalty
        };

        savePayment(updatedInvoice);
        loadInvoices(); // Refresh lists
        
        setPaymentStep('success');
        addToast(`Payment of ₹${selectedInvoice.totalPayable} processed successfully!`, 'success');
      }, 1500);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowRzpModal(false);
    setSelectedInvoice(null);
    setPaymentStep('select');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Maintenance Bills & Payments</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review outstanding invoices, view itemized parameters, and clear cooperative society dues via Razorpay Gateway.</p>
        </div>
      </div>

      {/* Outstanding Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl" />
          <div className="space-y-1">
            <h4 className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Total Outstanding Balance</h4>
            <div className="text-3xl font-extrabold tracking-tight text-[#D4AF37]">
              {formatCurrency(totalOutstanding)}
            </div>
          </div>
          <p className="text-slate-400 text-[10px]">
            {totalOutstanding > 0 ? `${pendingInvoices.length} billing cycle pending payment` : 'All society dues cleared!'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-theme">
          <div className="space-y-1">
            <h4 className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Last Bill Settle Date</h4>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {payments.find(p => p.status === 'SUCCESS')?.paidDate || 'No payments recorded'}
            </div>
          </div>
          <p className="text-slate-400 text-[10px]">Thank you for regular timely maintenance payments.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-theme">
          <div className="space-y-1">
            <h4 className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Payment Compliance</h4>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" />
              <span>100% On-Time</span>
            </div>
          </div>
          <p className="text-slate-400 text-[10px]">No penal charges or late fees applied to A-102.</p>
        </div>
      </div>

      {/* Pending Bills Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-society-primary dark:text-[#D4AF37] uppercase tracking-wider">Unpaid Active Invoices</h3>
        
        {pendingInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingInvoices.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col transition-theme"
              >
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{inv.cycle}</span>
                      <span className="bg-amber-150 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200/30">
                        Unpaid
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">Invoice ID: <strong className="font-mono">{inv.id}</strong></span>
                      <span>•</span>
                      <span>Due Date: <strong className="text-rose-500 dark:text-rose-400">{inv.dueDate}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Total Payable</p>
                      <p className="text-base font-extrabold text-slate-800 dark:text-white">
                        {formatCurrency(inv.amount + calculatePenalty(inv))}
                      </p>
                    </div>
                    <button 
                      onClick={() => triggerPayment(inv)}
                      className="bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold px-4 py-2 rounded-lg text-xs tracking-wider uppercase transition active:scale-95 shadow-sm"
                    >
                      Pay Bill
                    </button>
                  </div>
                </div>

                {/* Detailed Itemized breakdown panel */}
                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850/60 text-xs text-slate-600 dark:text-slate-350 space-y-3 font-medium transition-theme">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itemized Billing Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cooperative Society Maintenance:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.amount - 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sinking Fund Contribution:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Supply & Sewage Charges:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(250)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Common Security & Electricity:</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(250)}</span>
                    </div>
                    {calculatePenalty(inv) > 0 && (
                      <div className="flex justify-between md:col-span-2 text-rose-600 dark:text-rose-455 border-t border-rose-100 dark:border-rose-950/40 pt-2 mt-1">
                        <span className="flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Late Fee Penalty ({penaltyRate}% p.a. - grace period elapsed):</span>
                        </span>
                        <span className="font-extrabold">{formatCurrency(calculatePenalty(inv))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl transition-theme">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">All Bills Settled</h4>
            <p className="text-slate-400 text-xs mt-1">There are no outstanding maintenance invoices for Flat A-102.</p>
          </div>
        )}
      </div>

      {/* Payment Gateway Razorpay Overlay Simulator */}
      <AnimatePresence>
        {showRzpModal && selectedInvoice && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              {/* Razorpay Window Container */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-w-md w-full text-slate-800 font-sans"
              >
                {/* Razorpay Checkout Header */}
                <div className="bg-[#0b1b3d] text-white p-5 flex justify-between items-center relative">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-sky-500/30 text-sky-300 font-bold px-2 py-0.5 rounded tracking-wide uppercase border border-sky-400/20">
                      Razorpay Checkout
                    </span>
                    <h3 className="font-bold text-base leading-tight">Suyash Pride Housing Society Ltd.</h3>
                    <p className="text-slate-400 text-[10px]">{selectedInvoice.cycle}</p>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white font-bold text-lg leading-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right pr-6">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Amount to Pay</p>
                    <p className="text-lg font-black text-[#D4AF37]">{formatCurrency(selectedInvoice.totalPayable)}</p>
                  </div>
                </div>

                {/* Progress Content */}
                <div className="p-6 min-h-[260px] flex flex-col justify-between bg-slate-50">
                  {paymentStep === 'select' && (
                    <div className="space-y-5 text-xs">
                      {/* Customer Info pre-fill */}
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                          <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 mt-0.5 text-slate-700 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Email ID</label>
                          <input 
                            type="text" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 mt-0.5 text-slate-700 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Payment Method</h4>
                        
                        <div className="space-y-2">
                          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                            selectedMethod === 'upi' ? 'border-[#0b1b3d] bg-sky-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <Smartphone className="w-5 h-5 text-sky-600" />
                              <div>
                                <p className="font-bold text-slate-800 text-xs">UPI (GPay / PhonePe / BHIM)</p>
                                <p className="text-slate-400 text-[10px]">Instant transfer using UPI ID</p>
                              </div>
                            </div>
                            <input 
                              type="radio" 
                              name="payMethod" 
                              checked={selectedMethod === 'upi'} 
                              onChange={() => setSelectedMethod('upi')}
                              className="text-[#0b1b3d] focus:ring-[#0b1b3d]"
                            />
                          </label>

                          {selectedMethod === 'upi' && (
                            <div className="pl-8 pt-1">
                              <input 
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="Enter UPI ID (e.g. username@okaxis)"
                                className="w-full px-3 py-1.5 border border-slate-250 rounded bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0b1b3d]"
                              />
                            </div>
                          )}

                          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                            selectedMethod === 'card' ? 'border-[#0b1b3d] bg-sky-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <CreditCard className="w-5 h-5 text-indigo-600" />
                              <div>
                                <p className="font-bold text-slate-800 text-xs">Debit or Credit Card</p>
                                <p className="text-slate-400 text-[10px]">Visa, MasterCard, RuPay, Maestro</p>
                              </div>
                            </div>
                            <input 
                              type="radio" 
                              name="payMethod" 
                              checked={selectedMethod === 'card'} 
                              onChange={() => setSelectedMethod('card')}
                              className="text-[#0b1b3d] focus:ring-[#0b1b3d]"
                            />
                          </label>

                          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                            selectedMethod === 'netbanking' ? 'border-[#0b1b3d] bg-sky-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <Building className="w-5 h-5 text-emerald-600" />
                              <div>
                                <p className="font-bold text-slate-800 text-xs">Netbanking</p>
                                <p className="text-slate-400 text-[10px]">All major Indian banks supported</p>
                              </div>
                            </div>
                            <input 
                              type="radio" 
                              name="payMethod" 
                              checked={selectedMethod === 'netbanking'} 
                              onChange={() => setSelectedMethod('netbanking')}
                              className="text-[#0b1b3d] focus:ring-[#0b1b3d]"
                            />
                          </label>
                        </div>
                      </div>

                      <button 
                        onClick={handleSimulatePayment}
                        className="w-full bg-[#0b1b3d] hover:bg-[#152e64] text-white font-bold py-3 px-4 rounded-lg text-xs tracking-wider uppercase transition shadow-md mt-2"
                      >
                        Authorize & Pay ₹{selectedInvoice.totalPayable}
                      </button>
                    </div>
                  )}

                  {paymentStep === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <Loader2 className="w-10 h-10 text-[#0b1b3d] animate-spin" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Processing Payment Order</h4>
                        <p className="text-slate-400 text-xs mt-1">Connecting with payment processor and bank servers...</p>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'verifying' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Verifying Signature Hash</h4>
                        <p className="text-slate-400 text-xs mt-1">Simulating backend HMAC verification of payment keys...</p>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'success' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 text-xs">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                      <div>
                        <h4 className="font-black text-slate-800 text-base">Payment Verified Successfully</h4>
                        <p className="text-slate-500 mt-1">Receipt generated under ID: <strong className="font-mono text-slate-700">{txId}</strong></p>
                      </div>
                      <div className="w-full bg-slate-100 p-4 rounded-lg border border-slate-200 text-[10px] text-slate-500 text-left space-y-2 mt-2">
                        <div className="flex justify-between"><span>Merchant:</span><span className="font-bold">Suyash Pride Housing Society</span></div>
                        <div className="flex justify-between"><span>Paid By:</span><span className="font-bold">Parth Patel (A-102)</span></div>
                        <div className="flex justify-between"><span>Ref ID:</span><span className="font-mono font-bold text-slate-700">{txId}</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-bold"><span>Total Paid:</span><span className="text-[#0b1b3d]">₹{selectedInvoice.totalPayable}</span></div>
                      </div>
                      <button 
                        onClick={handleCloseModal}
                        className="w-full bg-[#0b1b3d] text-white font-bold py-2.5 px-4 rounded-lg transition uppercase tracking-wide mt-4"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Razorpay Security footer */}
                <div className="p-3 bg-slate-205 text-center text-[9px] text-slate-450 border-t border-slate-300 flex items-center justify-center gap-1">
                  <span>Secured by Razorpay. PCI-DSS compliant SSL encryption.</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Payments;
