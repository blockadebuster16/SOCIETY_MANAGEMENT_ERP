import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, FileText, CheckCircle2, AlertTriangle, Play, Settings, 
  Search, ShieldAlert, Sparkles, X, Plus, Calendar, Coins, Percent, Printer, TrendingUp, AlertOctagon, Send, BellRing, Check, Loader2, ArrowRight,
  ArrowLeftRight, ShieldCheck, Mail, Phone, Users
} from 'lucide-react';
import { getPayments, savePayment, getSettings, saveSettings, generateBillingCycle, getResidents } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

function ManagePayments() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'defaulters' | 'ledger' | 'billing_run' | 'rates'
  
  // States
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [settings, setSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUCCESS'
  const [cycleFilter, setCycleFilter] = useState('ALL');
  
  // Alerting states
  const [sendingAlertId, setSendingAlertId] = useState(null);
  const [sentAlerts, setSentAlerts] = useState({});
  
  // Modals / Dialogs
  const [recordingCredit, setRecordingCredit] = useState(null);
  const [creditForm, setCreditForm] = useState({
    mode: 'Cheque',
    referenceNo: '',
    note: ''
  });

  // Billing Run Form
  const [billingRun, setBillingRun] = useState({
    month: 'July',
    year: '2026',
    amount: '',
    dueDate: '2026-07-15'
  });

  // Rates Form
  const [ratesForm, setRatesForm] = useState({
    penaltyRate: 18,
    penaltyGraceDays: 5,
    monthlyMaintenanceAmount: 3500,
    shopMaintenanceAmount: 5000
  });

  // Initialize
  const loadData = () => {
    setPayments(getPayments());
    setResidents(getResidents());
    const dbSettings = getSettings();
    setSettings(dbSettings);
    setRatesForm({
      penaltyRate: dbSettings.penaltyRate || 18,
      penaltyGraceDays: dbSettings.penaltyGraceDays || 5,
      monthlyMaintenanceAmount: dbSettings.monthlyMaintenanceAmount || 3500,
      shopMaintenanceAmount: dbSettings.shopMaintenanceAmount || 5000
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Payments for the master ledger tab
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.residentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesCycle = cycleFilter === 'ALL' || p.cycle.includes(cycleFilter);

    return matchesSearch && matchesStatus && matchesCycle;
  });

  // Unique Cycles in records for filtering
  const uniqueCycles = Array.from(new Set(payments.map(p => p.cycle)));

  // Dynamic collections analytics calculations
  const resInvoices = payments.filter(p => !p.flat.includes('Shop'));
  const expectedRes = resInvoices.reduce((sum, p) => sum + p.amount, 0);
  const collectedRes = resInvoices.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amountPaid || p.amount), 0);
  const outstandingRes = resInvoices.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  const commInvoices = payments.filter(p => p.flat.includes('Shop'));
  const expectedComm = commInvoices.reduce((sum, p) => sum + p.amount, 0);
  const collectedComm = commInvoices.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amountPaid || p.amount), 0);
  const outstandingComm = commInvoices.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  const totalExpected = expectedRes + expectedComm;
  const totalCollected = collectedRes + collectedComm;
  const totalOutstanding = outstandingRes + outstandingComm;
  const collectionRateGlobal = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // June 2026 Collection Specifics
  const junePayments = payments.filter(p => p.cycle === 'June 2026 Maintenance');
  const juneExpected = junePayments.reduce((sum, p) => sum + p.amount, 0);
  const juneCollected = junePayments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amountPaid || p.amount), 0);
  const juneRate = juneExpected > 0 ? Math.round((juneCollected / juneExpected) * 100) : 0;

  // Get Defaulters (Group pending invoices per Flat)
  const getDefaulters = () => {
    const pending = payments.filter(p => p.status === 'PENDING');
    const grouped = {};
    
    pending.forEach(p => {
      if (!grouped[p.flat]) {
        const resDetail = residents.find(r => r.flat === p.flat.replace('Flat ', '').replace('Shop ', ''));
        grouped[p.flat] = {
          flat: p.flat,
          residentName: p.residentName,
          phone: resDetail?.phone || '98200 12345',
          email: resDetail?.email || 'resident@example.com',
          unitType: resDetail?.unitType || (p.flat.includes('Shop') ? 'Commercial' : 'Residential'),
          invoices: [],
          totalOverdue: 0
        };
      }
      grouped[p.flat].invoices.push(p);
      grouped[p.flat].totalOverdue += p.amount;
    });

    return Object.values(grouped).map(def => {
      // Sort oldest first
      def.invoices.sort((a, b) => {
        const parseDate = (dStr) => {
          const parts = dStr.split('-');
          const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          return new Date(parseInt(parts[2], 10), months[parts[1]], parseInt(parts[0], 10));
        };
        return parseDate(a.dueDate) - parseDate(b.dueDate);
      });

      const oldestInvoice = def.invoices[0];
      let overdueBracket = '30 Days';
      let overdueDays = 0;
      try {
        const parts = oldestInvoice.dueDate.split('-');
        const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const dueDateObj = new Date(parseInt(parts[2], 10), months[parts[1]], parseInt(parts[0], 10));
        const currentDate = new Date('2026-06-14');
        overdueDays = Math.floor((currentDate - dueDateObj) / (1000 * 60 * 60 * 24));
        
        if (overdueDays > 60) {
          overdueBracket = '90+ Days';
        } else if (overdueDays > 30) {
          overdueBracket = '60 Days';
        } else {
          overdueBracket = '30 Days';
        }
      } catch (e) {
        console.error(e);
      }

      return {
        ...def,
        overdueBracket,
        overdueDays: overdueDays > 0 ? overdueDays : 0,
        pendingCyclesCount: def.invoices.length
      };
    });
  };

  const defaultersList = getDefaulters();

  // Send Alert Reminder simulation
  const handleSendReminder = (flat, name) => {
    setSendingAlertId(flat);
    setTimeout(() => {
      setSendingAlertId(null);
      setSentAlerts(prev => ({ ...prev, [flat]: true }));
      addToast(`Overdue invoice reminder sent to ${name} (${flat})!`, 'success');
    }, 1200);
  };

  // Record Offline Credit Submit
  const handleRecordCreditSubmit = (e) => {
    e.preventDefault();
    if (!recordingCredit) return;

    const mockTxId = `pay_manual_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const mockReceipt = `SP-REC-2026-M${Math.floor(100 + Math.random() * 900)}`;

    const updated = {
      ...recordingCredit,
      status: 'SUCCESS',
      paidDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/\s/g, '-'),
      transactionId: `${creditForm.mode} #${creditForm.referenceNo || 'Cash'}`,
      receiptNo: mockReceipt,
      amountPaid: recordingCredit.amount,
      penaltyApplied: 0
    };

    savePayment(updated);
    loadData();
    setRecordingCredit(null);
    setCreditForm({ mode: 'Cheque', referenceNo: '', note: '' });
    addToast(`Recorded offline payment of ₹${recordingCredit.amount} for ${recordingCredit.flat}.`, 'success');
  };

  // Run Monthly Billing Cycle
  const handleTriggerBillingRun = (e) => {
    e.preventDefault();
    const cycleName = `${billingRun.month} ${billingRun.year} Maintenance`;
    
    // Check if billing cycle already exists
    const cycleExists = payments.some(p => p.cycle === cycleName);
    if (cycleExists) {
      if (!window.confirm(`Billing cycle "${cycleName}" has already been dispatched. Do you wish to re-generate invoices anyway?`)) {
        return;
      }
    }

    const createdCount = generateBillingCycle(cycleName, billingRun.amount ? Number(billingRun.amount) : null);
    
    loadData();
    setActiveTab('ledger');
    addToast(`Billing cycle ${cycleName} dispatched. ${createdCount} invoices generated.`, 'success');
  };

  // Save Penalty Rates Config
  const handleSaveRates = (e) => {
    e.preventDefault();
    const updated = saveSettings({
      penaltyRate: Number(ratesForm.penaltyRate),
      penaltyGraceDays: Number(ratesForm.penaltyGraceDays),
      monthlyMaintenanceAmount: Number(ratesForm.monthlyMaintenanceAmount),
      shopMaintenanceAmount: Number(ratesForm.shopMaintenanceAmount)
    });
    setSettings(updated);
    addToast('Billing parameters and late penalty interest rates updated.', 'success');
  };

  // SVG Chart data compilation
  const getCycleStats = (cycleName) => {
    const cp = payments.filter(p => p.cycle === cycleName);
    const expected = cp.reduce((sum, p) => sum + p.amount, 0);
    const collected = cp.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amountPaid || p.amount), 0);
    return { expected, collected };
  };

  const cyclesList = ['March 2026 Maintenance', 'April 2026 Maintenance', 'May 2026 Maintenance', 'June 2026 Maintenance'];
  const barChartMax = 45000; // max value threshold for chart scale

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white font-sans">Finance & Billing Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Dispatch cycles, audit collections, configure penal grace terms, and follow up with overdue accounts.</p>
        </div>
      </div>

      {/* Five Tabs Toggle */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-1 gap-2 md:gap-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 border-b-2 tracking-wider uppercase transition whitespace-nowrap ${
            activeTab === 'collections'
              ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Collections Reports
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 border-b-2 tracking-wider uppercase transition whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'defaulters'
              ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Defaulters Roster
          {defaultersList.length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold">{defaultersList.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 border-b-2 tracking-wider uppercase transition whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Ledger Collections
        </button>
        <button
          onClick={() => setActiveTab('billing_run')}
          className={`px-4 py-2 border-b-2 tracking-wider uppercase transition whitespace-nowrap ${
            activeTab === 'billing_run'
              ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Billing Cycle Run
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 border-b-2 tracking-wider uppercase transition whitespace-nowrap ${
            activeTab === 'rates'
              ? 'border-[#D4AF37] text-society-primary dark:text-[#D4AF37] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
          }`}
        >
          Rates & Penalties
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">

        {/* 1. COLLECTIONS REPORTS */}
        {activeTab === 'collections' && (
          <div className="space-y-8">
            {/* Global Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 transition-theme">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Overall Expected Funds</span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(totalExpected)}</h3>
                <p className="text-[10px] text-slate-400">Aggregated billed ledger dues</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 transition-theme">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Overall Settled Credits</span>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-450">{formatCurrency(totalCollected)}</h3>
                <p className="text-[10px] text-emerald-650 dark:text-emerald-500 font-bold">{collectionRateGlobal}% of target collected</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 transition-theme">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Dues Outstanding</span>
                <h3 className="text-2xl font-black text-rose-500">{formatCurrency(totalOutstanding)}</h3>
                <p className="text-[10px] text-slate-400">Total unpaid active invoices</p>
              </div>

              {/* Dynamic June Progress Donut Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between transition-theme">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">June 2026 Settle</span>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{formatCurrency(juneCollected)}</h4>
                  <p className="text-[9px] text-slate-400">Target: {formatCurrency(juneExpected)}</p>
                </div>
                
                {/* SVG Donut */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5" className="dark:stroke-slate-800" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.5" 
                      strokeDasharray={`${juneRate} ${100 - juneRate}`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white">
                    {juneRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* Partition metrics: Residential vs Commercial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Residential Maintenance Billing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-theme">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-405 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                  <span>Residential Wing Collections</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold font-sans">112 units</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[10px] text-slate-400 font-bold">Expected</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{formatCurrency(expectedRes)}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-600 font-bold">Collected</p>
                    <p className="text-sm font-black text-emerald-605 dark:text-emerald-400 mt-1">{formatCurrency(collectedRes)}</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/10">
                    <p className="text-[10px] text-rose-550 font-bold">Outstanding</p>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(outstandingRes)}</p>
                  </div>
                </div>
                {/* Visual Bar progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Collection Completion</span>
                    <span>{expectedRes > 0 ? Math.round((collectedRes / expectedRes) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${expectedRes > 0 ? (collectedRes / expectedRes) * 100 : 0}%` }} 
                      className="h-full bg-emerald-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Shops Billing */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-theme">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-405 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                  <span>Commercial Shop Collections</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold font-sans">25 shops</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <p className="text-[10px] text-slate-400 font-bold">Expected</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white mt-1">{formatCurrency(expectedComm)}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-600 font-bold">Collected</p>
                    <p className="text-sm font-black text-emerald-650 dark:text-emerald-400 mt-1">{formatCurrency(collectedComm)}</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/10">
                    <p className="text-[10px] text-rose-550 font-bold">Outstanding</p>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(outstandingComm)}</p>
                  </div>
                </div>
                {/* Visual Bar progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>Collection Completion</span>
                    <span>{expectedComm > 0 ? Math.round((collectedComm / expectedComm) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${expectedComm > 0 ? (collectedComm / expectedComm) * 100 : 0}%` }} 
                      className="h-full bg-emerald-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Interactive Collections Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-theme space-y-4">
              <div className="flex justify-between items-center border-b border-slate-105 dark:border-slate-855 pb-3.5">
                <h3 className="font-bold text-slate-800 dark:text-[#D4AF37] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cycle Collections History Comparison (March - June 2026)</span>
                </h3>
              </div>

              {/* Clean Interactive SVG Bar Chart */}
              <div className="pt-6">
                <svg width="100%" height="240" viewBox="0 0 500 240" className="overflow-visible font-sans">
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="480" y2="40" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="4" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="4" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="4" />
                  <line x1="40" y1="190" x2="480" y2="190" stroke="#cbd5e1" className="dark:stroke-slate-700" />

                  {/* Y Axis Labels */}
                  <text x="32" y="44" className="text-[9px] fill-slate-400 font-bold font-mono" textAnchor="end">₹40K</text>
                  <text x="32" y="94" className="text-[9px] fill-slate-400 font-bold font-mono" textAnchor="end">₹25K</text>
                  <text x="32" y="144" className="text-[9px] fill-slate-400 font-bold font-mono" textAnchor="end">₹10K</text>
                  <text x="32" y="194" className="text-[9px] fill-slate-400 font-bold font-mono" textAnchor="end">₹0</text>

                  {/* Bars compilation */}
                  {cyclesList.map((cy, idx) => {
                    const stats = getCycleStats(cy);
                    const label = cy.replace(' 2026 Maintenance', '');
                    const xOffset = 60 + idx * 110;
                    
                    // Heights relative to chart scale (190 max height baseline, y range 40 to 190 = 150px range max)
                    const expHeight = (stats.expected / barChartMax) * 150;
                    const colHeight = (stats.collected / barChartMax) * 150;
                    
                    return (
                      <g key={idx}>
                        {/* Expected Bar */}
                        <rect 
                          x={xOffset} 
                          y={190 - expHeight} 
                          width="24" 
                          height={expHeight} 
                          fill="#cbd5e1" 
                          className="dark:fill-slate-800"
                          rx="4"
                        />
                        {/* Collected Bar */}
                        <rect 
                          x={xOffset + 28} 
                          y={190 - colHeight} 
                          width="24" 
                          height={colHeight} 
                          fill="#0f2d52" 
                          className="dark:fill-[#D4AF37]"
                          rx="4"
                        />
                        
                        {/* Labels */}
                        <text x={xOffset + 26} y="208" className="text-[10px] fill-slate-500 dark:fill-slate-400 font-bold" textAnchor="middle">
                          {label}
                        </text>
                        {/* Values inside/above */}
                        <text x={xOffset + 12} y={185 - expHeight} className="text-[8px] fill-slate-450 font-bold font-mono" textAnchor="middle">
                          ₹{(stats.expected/1000).toFixed(0)}K
                        </text>
                        <text x={xOffset + 40} y={185 - colHeight} className="text-[8px] fill-[#0f2d52] dark:fill-[#D4AF37] font-extrabold font-mono" textAnchor="middle">
                          ₹{(stats.collected/1000).toFixed(0)}K
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="flex gap-4 justify-center text-[10px] text-slate-400 dark:text-slate-550 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-slate-300 dark:bg-slate-800 rounded"></span>
                  <span>Target expected billing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-[#0f2d52] dark:bg-[#D4AF37] rounded"></span>
                  <span>Realized credit payments</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. DEFAULTERS ROSTER */}
        {activeTab === 'defaulters' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200/50 dark:border-slate-850/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-theme">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                  <span>Society Maintenance Defaulters Roster</span>
                </h4>
                <p className="text-slate-500 dark:text-slate-455 text-xs">Identifies active properties with outstanding maintenance cycles exceeding 30, 60, or 90 days.</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
                <span>Total Defaulters: <strong className="text-rose-500 text-sm font-black">{defaultersList.length} Units</strong></span>
                <span>•</span>
                <span>Pending Funds: <strong className="text-rose-500 text-sm font-black">{formatCurrency(totalOutstanding)}</strong></span>
              </div>
            </div>

            {/* Defaulter Directory Listing */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-theme">
              {defaultersList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-3.5">Unit Flat</th>
                        <th className="px-6 py-3.5">Unit Type</th>
                        <th className="px-6 py-3.5">Resident Member</th>
                        <th className="px-6 py-3.5">Overdue Cycles</th>
                        <th className="px-6 py-3.5">Unpaid Dues</th>
                        <th className="px-6 py-3.5">Days Overdue</th>
                        <th className="px-6 py-3.5">Risk Status</th>
                        <th className="px-6 py-3.5 text-right">Dispatch Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                      {defaultersList.map((def) => {
                        const isSent = sentAlerts[def.flat];
                        return (
                          <tr 
                            key={def.flat} 
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition"
                          >
                            <td className="px-6 py-4 font-bold text-slate-850 dark:text-white font-mono">{def.flat}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                def.unitType === 'Commercial' 
                                  ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                                  : 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-450'
                              }`}>
                                {def.unitType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800 dark:text-white">{def.residentName}</div>
                              <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{def.phone}</span>
                                <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{def.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                              {def.invoices.map(i => i.cycle.replace(' 2026 Maintenance', '').replace(' Maintenance', '')).join(', ')}
                            </td>
                            <td className="px-6 py-4 font-bold text-rose-500">{formatCurrency(def.totalOverdue)}</td>
                            <td className="px-6 py-4 font-mono font-semibold">{def.overdueDays} days</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                def.overdueBracket === '90+ Days'
                                  ? 'bg-rose-100 dark:bg-rose-955/20 text-rose-800 dark:text-rose-400 border border-rose-200/20 animate-pulse'
                                  : def.overdueBracket === '60 Days'
                                  ? 'bg-amber-100 dark:bg-amber-955/20 text-amber-800 dark:text-amber-400 border border-amber-200/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                              }`}>
                                {def.overdueBracket}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleSendReminder(def.flat, def.residentName)}
                                disabled={sendingAlertId === def.flat || isSent}
                                className={`inline-flex items-center gap-1 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition ${
                                  isSent 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                                }`}
                              >
                                {sendingAlertId === def.flat ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Dispatching...</span>
                                  </>
                                ) : isSent ? (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Alert Dispatched</span>
                                  </>
                                ) : (
                                  <>
                                    <BellRing className="w-3 h-3" />
                                    <span>Send Reminder</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Accounts Overdue</h4>
                  <p className="text-slate-450 text-xs mt-1">Excellent! All active units have settled their maintenance balances.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. ORIGINAL LEDGER COLLECTIONS */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search ledger by flat, resident name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 rounded-lg focus:outline-none text-xs font-semibold"
                >
                  <option value="ALL">All Cycles</option>
                  {uniqueCycles.map((cy, idx) => (
                    <option key={idx} value={cy.replace(' Maintenance', '')}>{cy}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-400 rounded-lg focus:outline-none text-xs font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending (Unpaid)</option>
                  <option value="SUCCESS">Success (Settled)</option>
                </select>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-theme">
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-3.5">Invoice ID</th>
                        <th className="px-6 py-3.5">Unit Flat</th>
                        <th className="px-6 py-3.5">Resident</th>
                        <th className="px-6 py-3.5">Cycle</th>
                        <th className="px-6 py-3.5">Amount</th>
                        <th className="px-6 py-3.5">Settlement Mode / ID</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                      {filteredPayments.map((p) => (
                        <tr 
                          key={p.id} 
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition"
                        >
                          <td className="px-6 py-4 font-mono text-[10px] text-slate-450 font-bold">{p.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-white font-mono">{p.flat}</td>
                          <td className="px-6 py-4">{p.residentName}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{p.cycle}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(p.amountPaid || p.amount)}
                          </td>
                          <td className="px-6 py-4 font-mono text-[10px]">
                            {p.transactionId ? (
                              <span className="text-slate-500">{p.transactionId}</span>
                            ) : (
                              <span className="text-slate-400 italic">Unpaid</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                            }`}>
                              {p.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {p.status === 'PENDING' ? (
                              <button
                                onClick={() => setRecordingCredit(p)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition active:scale-95 shadow-sm"
                              >
                                Record Credit
                              </button>
                            ) : (
                              <span className="text-slate-450 italic text-[10px]">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Ledger Records Found</h4>
                  <p className="text-slate-450 text-xs mt-1">Adjust search parameters or cycle selectors.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. BILLING CYCLE RUN */}
        {activeTab === 'billing_run' && (
          <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme">
            <h3 className="font-bold text-slate-850 dark:text-[#D4AF37] text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 mb-6 flex items-center gap-1.5">
              <Play className="w-4.5 h-4.5 text-[#D4AF37]" />
              <span>Trigger Maintenance Billing Run</span>
            </h3>

            <form onSubmit={handleTriggerBillingRun} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Billing Month</label>
                  <select
                    value={billingRun.month}
                    onChange={(e) => setBillingRun({ ...billingRun, month: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-205 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Billing Year</label>
                  <select
                    value={billingRun.year}
                    onChange={(e) => setBillingRun({ ...billingRun, year: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-205 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Custom Maintenance Amount (Optional)</label>
                <input 
                  type="number"
                  placeholder="Leave blank to use default rates (Res ₹3.5K / Comm ₹5K)"
                  value={billingRun.amount}
                  onChange={(e) => setBillingRun({ ...billingRun, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Payment Due Date *</label>
                <input 
                  type="date"
                  value={billingRun.dueDate}
                  onChange={(e) => setBillingRun({ ...billingRun, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-bold"
                  required
                />
              </div>

              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-[10px] text-amber-705 dark:text-amber-400 leading-normal font-normal">
                <strong>Attention:</strong> Triggering a billing run creates a PENDING maintenance invoice for all active verified residents in the database. Residents will immediately see the new outstanding invoice in their portal.
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold py-3 rounded-lg uppercase tracking-wider hover:opacity-90 transition active:scale-98 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Dispatch Cycle Invoices</span>
              </button>
            </form>
          </div>
        )}

        {/* 5. RATES & PENALTIES CONFIG */}
        {activeTab === 'rates' && (
          <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme">
            <h3 className="font-bold text-slate-850 dark:text-[#D4AF37] text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3 mb-6 flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-[#D4AF37]" />
              <span>Billing Parameters & Late Fee Rules</span>
            </h3>

            <form onSubmit={handleSaveRates} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    <span>Late Penalty Rate (% p.a.)</span>
                  </label>
                  <input 
                    type="number"
                    value={ratesForm.penaltyRate}
                    onChange={(e) => setRatesForm({ ...ratesForm, penaltyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Grace Period (Days)</span>
                  </label>
                  <input 
                    type="number"
                    value={ratesForm.penaltyGraceDays}
                    onChange={(e) => setRatesForm({ ...ratesForm, penaltyGraceDays: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>Residential Maintenance (₹)</span>
                  </label>
                  <input 
                    type="number"
                    value={ratesForm.monthlyMaintenanceAmount}
                    onChange={(e) => setRatesForm({ ...ratesForm, monthlyMaintenanceAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>Commercial Shop Rate (₹)</span>
                  </label>
                  <input 
                    type="number"
                    value={ratesForm.shopMaintenanceAmount}
                    onChange={(e) => setRatesForm({ ...ratesForm, shopMaintenanceAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 text-[10px] text-slate-450 font-normal leading-normal">
                These default billing values pre-populate form fields when launching new billing cycles. Late fee rates are calculated automatically if invoices remain unpaid after the grace period.
              </div>

              <button
                type="submit"
                className="w-full bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold py-3 rounded-lg uppercase tracking-wider hover:opacity-90 transition active:scale-98 shadow-sm"
              >
                Save Billing Config
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Record Offline Credit Dialog Overlay */}
      <AnimatePresence>
        {recordingCredit && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecordingCredit(null)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed z-50 max-w-md w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-800 dark:text-slate-250 transition-theme"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-society-primary dark:text-white text-sm">Record Offline Payment</h3>
                    <p className="text-slate-400 text-[10px]">Record cash/cheque deposits into society ledger.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setRecordingCredit(null)}
                  className="p-1 text-slate-455 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordCreditSubmit} className="p-6 space-y-4 text-xs font-semibold">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-855 space-y-2 text-slate-655 dark:text-slate-400">
                  <div className="flex justify-between"><span>Resident:</span><span className="font-bold text-slate-900 dark:text-white">{recordingCredit.residentName}</span></div>
                  <div className="flex justify-between"><span>Flat Unit:</span><span className="font-bold text-slate-900 dark:text-white font-mono">{recordingCredit.flat}</span></div>
                  <div className="flex justify-between"><span>Cycle:</span><span className="font-bold text-slate-900 dark:text-white">{recordingCredit.cycle}</span></div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-slate-900 dark:text-white"><span>Outstanding Due:</span><span className="text-rose-500">{formatCurrency(recordingCredit.amount)}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Payment Mode</label>
                    <select
                      value={creditForm.mode}
                      onChange={(e) => setCreditForm({ ...creditForm, mode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-bold"
                    >
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="NEFT">Bank Transfer (NEFT/IMPS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Cheque/Ref Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1928392"
                      value={creditForm.referenceNo}
                      onChange={(e) => setCreditForm({ ...creditForm, referenceNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white font-mono"
                      required={creditForm.mode !== 'Cash'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-655 dark:text-slate-350 mb-1.5">Add Audit Remarks (Optional)</label>
                  <textarea 
                    rows="2"
                    placeholder="Enter clearing details, bank names, drawer names etc..."
                    value={creditForm.note}
                    onChange={(e) => setCreditForm({ ...creditForm, note: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setRecordingCredit(null)}
                    className="border border-slate-250 text-slate-655 dark:border-slate-700 dark:text-slate-350 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg transition"
                  >
                    Approve Credit
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManagePayments;
