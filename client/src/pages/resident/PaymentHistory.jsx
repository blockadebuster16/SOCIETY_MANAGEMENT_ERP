import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ArrowDownToLine, Receipt, Printer, X, 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeftRight, Download, Loader2
} from 'lucide-react';
import { getPaymentsForResident } from '../../utils/mockDb';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

function PaymentHistory() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('timeline'); // 'timeline' | 'ledger'
  const [downloadingId, setDownloadingId] = useState(null);

  // Load invoices
  const loadInvoices = () => {
    const resPayments = getPaymentsForResident('A-102');
    setPayments(resPayments);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const history = payments.filter(p => p.status === 'SUCCESS' || p.status === 'FAILED');

  // Compute Chronological Ledger Entries
  const generateLedger = () => {
    const entries = [];
    payments.forEach(p => {
      // 1. Add Debit invoice entry
      const [monthName, year] = p.cycle.split(' ');
      const months = {
        January: '01-Jan', February: '01-Feb', March: '01-Mar', April: '01-Apr',
        May: '01-May', June: '01-Jun', July: '01-Jul', August: '01-Aug',
        September: '01-Sep', October: '01-Oct', November: '01-Nov', December: '01-Dec'
      };
      const dateStr = `${months[monthName] || '01-Jan'}-${year}`;
      
      const parts = dateStr.split('-');
      const monthIndex = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      }[parts[1]];
      const billDateObj = new Date(parseInt(parts[2], 10), monthIndex, parseInt(parts[0], 10));

      entries.push({
        id: `db-${p.id}`,
        date: dateStr,
        dateObj: billDateObj,
        description: `Maintenance Invoiced (${p.cycle})`,
        refId: p.id,
        type: 'DEBIT',
        amount: p.amount
      });

      // 2. Add Credit payment entry if paid
      if (p.status === 'SUCCESS' && p.paidDate) {
        const pParts = p.paidDate.split('-');
        const pMonthIndex = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        }[pParts[1]];
        const paidDateObj = new Date(parseInt(pParts[2], 10), pMonthIndex, parseInt(pParts[0], 10));

        entries.push({
          id: `cr-${p.id}`,
          date: p.paidDate,
          dateObj: paidDateObj,
          description: `Maintenance Settlement - Receipt`,
          refId: p.transactionId,
          type: 'CREDIT',
          amount: p.amountPaid || p.amount
        });
      }
    });

    // Sort chronological (oldest first)
    entries.sort((a, b) => a.dateObj - b.dateObj);

    // Compute running balance
    let runningBalance = 0;
    const ledgerWithBalance = entries.map(entry => {
      if (entry.type === 'DEBIT') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return {
        ...entry,
        runningBalance
      };
    });

    // Reverse chronological for display (newest first)
    return [...ledgerWithBalance].reverse();
  };

  const ledgerEntries = generateLedger();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (rec) => {
    setDownloadingId(rec.id);
    setTimeout(() => {
      setDownloadingId(null);
      addToast(`Receipt PDF for ${rec.cycle} downloaded successfully!`, 'success');
      
      // Build simulated receipt PDF file (text layout)
      const element = document.createElement("a");
      const paidAmount = rec.amountPaid || rec.amount;
      const penaltyText = rec.penaltyApplied > 0 ? `\nLate Penalty Interest: INR ${rec.penaltyApplied}` : '';
      const receiptContent = `================================================
SUYASH PRIDE COOPERATIVE HOUSING SOCIETY LTD.
Plot-1 Sector-5 Ulwe Node, Navi Mumbai 410206
================================================
OFFICIAL RECEIPT FOR MAINTENANCE SETTLEMENT

Receipt Number:  ${rec.receiptNo || 'SP-REC-MOCK'}
Paid Date:       ${rec.paidDate}
Unit Flat:       Flat A-102 (Parth Patel)
Transaction ID:  ${rec.transactionId}
Cycle:           ${rec.cycle}

Billing Details:
- Base Maintenance: INR ${rec.amount - 1000}
- Sinking Fund:     INR 500
- Water Charges:    INR 250
- Common Area Elect:INR 250${penaltyText}
------------------------------------------------
TOTAL NET PAID:    INR ${paidAmount}
================================================
Status: VERIFIED SECURE PAYMENT
Thank you for supporting cooperative compliance.
`;

      const file = new Blob([receiptContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Receipt_${rec.receiptNo || 'SP-REC'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Printable styles injected in DOM */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 30px;
            color: #000 !important;
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Payment History & Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Review historic payment transactions, verify receipts, and track running ledger allocations.</p>
        </div>
        
        {/* Toggle between Receipts list and Unified Ledger */}
        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
          <button 
            onClick={() => setActiveSubTab('timeline')}
            className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition ${
              activeSubTab === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-society-primary dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Settle Receipts
          </button>
          <button 
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition flex items-center gap-1 ${
              activeSubTab === 'ledger'
                ? 'bg-white dark:bg-slate-900 text-society-primary dark:text-[#D4AF37] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Ledger Log</span>
          </button>
        </div>
      </div>

      {/* TIMELINE RECEIPTS VIEW */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-theme">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Paid Receipts Index</h3>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 rounded">
              Showing last {history.length} settled cycles
            </span>
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-3">Billing Cycle</th>
                    <th className="px-6 py-3">Amount Paid</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Paid Date</th>
                    <th className="px-6 py-3">Receipt No</th>
                    <th className="px-6 py-3 text-right">Receipt Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {history.map((inv) => (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 transition"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{inv.cycle}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(inv.amountPaid || inv.amount)}
                        {inv.penaltyApplied > 0 && (
                          <span className="block text-[9px] text-rose-500 font-bold">Includes penalty</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.dueDate}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.paidDate || '-'}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-[10px]">{inv.receiptNo || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        {inv.status === 'SUCCESS' ? (
                          <button
                            onClick={() => setSelectedReceipt(inv)}
                            className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-yellow-600 font-bold transition"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Unpaid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Receipt className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Payment Records</h4>
              <p className="text-slate-450 text-xs mt-1">No transaction records found for A-102 in ledger archives.</p>
            </div>
          )}
        </div>
      )}

      {/* UNIFIED CHRONOLOGICAL LEDGER VIEW */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-theme">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Statement of Dues Ledger</h3>
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 rounded font-bold font-mono">
              Running Balance: {formatCurrency(ledgerEntries[0]?.runningBalance || 0)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3.5">Post Date</th>
                  <th className="px-6 py-3.5">Transaction Particulars</th>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Debit (Invoiced)</th>
                  <th className="px-6 py-3.5 text-right">Credit (Received)</th>
                  <th className="px-6 py-3.5 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                {ledgerEntries.map((entry) => (
                  <tr 
                    key={entry.id} 
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition"
                  >
                    <td className="px-6 py-4 font-mono font-bold">{entry.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{entry.description}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{entry.refId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        entry.type === 'DEBIT' 
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800 dark:text-white">
                      {entry.type === 'DEBIT' ? formatCurrency(entry.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800 dark:text-white">
                      {entry.type === 'CREDIT' ? formatCurrency(entry.amount) : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${
                      entry.runningBalance > 0 ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'
                    }`}>
                      {formatCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Details Modal Overlay */}
      <AnimatePresence>
        {selectedReceipt && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print"
            />

            {/* Receipt Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              id="printable-receipt"
              className="fixed z-50 max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-800 dark:text-slate-250 transition-theme"
            >
              {/* Receipt Header */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center no-print">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-society-primary dark:text-white text-sm">Official Maintenance Receipt</h3>
                    <p className="text-slate-400 text-[10px]">Cooperative Housing Society Register Index</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-8 space-y-6 text-xs print:p-0">
                {/* Stamp & Verification */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Suyash Pride Housing Society Ltd.</h4>
                    <p className="text-slate-450 text-[10px] leading-relaxed">
                      Plot-1 Sector-5 Ulwe Node<br />
                      Wahal, Navi Mumbai - 410206
                    </p>
                  </div>
                  <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5 mb-0.5 text-emerald-500" />
                    <span className="font-bold text-[8px] uppercase tracking-wider">Verified Payment</span>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-850 py-4 font-semibold text-slate-700 dark:text-slate-350">
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wide">Receipt Number</p>
                    <p className="font-mono text-slate-900 dark:text-white mt-0.5">{selectedReceipt.receiptNo}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wide">Paid Date</p>
                    <p className="text-slate-900 dark:text-white mt-0.5">{selectedReceipt.paidDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wide">Member Flat</p>
                    <p className="text-slate-900 dark:text-white mt-0.5">Flat A-102 (Parth Patel)</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wide">Transaction ID</p>
                    <p className="font-mono text-slate-900 dark:text-white mt-0.5">{selectedReceipt.transactionId}</p>
                  </div>
                </div>

                {/* Billing Summary Table */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-400 text-[10px] uppercase tracking-wide">Billing Details</h5>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Regular Monthly Maintenance Allocation</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(selectedReceipt.amount - 1000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sinking Fund Contribution</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Water Supply & Sewage Charges</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(250)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Common Security & Electricity</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(250)}</span>
                    </div>
                    {selectedReceipt.penaltyApplied > 0 && (
                      <div className="flex justify-between text-rose-500 font-bold border-t border-slate-200/50 dark:border-slate-800 pt-2">
                        <span>Late Fee Penalty Applied</span>
                        <span>{formatCurrency(selectedReceipt.penaltyApplied)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-250 dark:border-slate-800 pt-2 text-sm">
                      <span>Total Net Paid</span>
                      <span className="text-emerald-600 dark:text-[#D4AF37]">{formatCurrency(selectedReceipt.amountPaid || selectedReceipt.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <p className="text-[9px] text-slate-450 leading-relaxed text-center">
                  This is a computer generated cooperative society e-receipt. Title transfers require physical authorization from the management committee secretary.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3.5 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 border border-slate-250 text-slate-655 dark:border-slate-750 dark:text-slate-350 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedReceipt)}
                  disabled={downloadingId !== null}
                  className="flex items-center gap-1.5 bg-[#D4AF37] text-society-primary font-bold px-4 py-2 rounded-lg transition hover:bg-yellow-600 disabled:opacity-50"
                >
                  {downloadingId === selectedReceipt.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PaymentHistory;
