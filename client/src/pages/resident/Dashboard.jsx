import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, AlertTriangle, Megaphone, Calendar, 
  Download, ArrowRight, CheckCircle, FileText, Sparkles
} from 'lucide-react';
import { getPaymentsForResident, getComplaints } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

function Dashboard() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Dynamic stats states
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [rsvpState, setRsvpState] = useState(true);
  const [rsvpCount, setRsvpCount] = useState(2);
  const [unreadNotices, setUnreadNotices] = useState(1);

  useEffect(() => {
    // Load payments
    const resPayments = getPaymentsForResident('A-102');
    setPayments(resPayments);

    // Load complaints
    const resComplaints = getComplaints().filter(c => c.flat === 'Flat A-102');
    setComplaints(resComplaints);

    // Load RSVP state
    const savedRsvp = localStorage.getItem('suyash_rsvp_plantation');
    if (savedRsvp !== null) {
      setRsvpState(savedRsvp === 'true');
    }
    const savedCount = localStorage.getItem('suyash_rsvp_plantation_count');
    if (savedCount !== null) {
      setRsvpCount(Number(savedCount));
    }
  }, []);

  // Compute stats
  const pendingInvoices = payments.filter(p => p.status === 'PENDING');
  const outstandingBalance = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const openComplaintsCount = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
  const recentComplaintText = complaints.find(c => c.status === 'IN_PROGRESS' || c.status === 'PENDING')?.title || 'No open tickets';

  const toggleRsvp = () => {
    const nextState = !rsvpState;
    setRsvpState(nextState);
    localStorage.setItem('suyash_rsvp_plantation', String(nextState));
    if (nextState) {
      localStorage.setItem('suyash_rsvp_plantation_count', String(rsvpCount));
    }
    addToast(
      nextState ? `Registered RSVP for plantation drive (${rsvpCount} members).` : 'Cancelled RSVP for plantation drive.',
      'info'
    );
  };

  const quickDownloads = [
    { name: 'NOC Request Format', size: '145 KB' },
    { name: 'Tenant Police Verification Form', size: '220 KB' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Welcome Back, Parth!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Flat A-102 | Wing A Resident Portal</p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-2">
          {outstandingBalance > 0 ? (
            <span className="text-xs bg-rose-500/10 dark:bg-rose-955/20 text-rose-605 dark:text-rose-400 px-3 py-1.5 rounded-full font-bold border border-rose-500/20 animate-pulse">
              Dues Status: PENDING
            </span>
          ) : (
            <span className="text-xs bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 px-3 py-1.5 rounded-full font-bold border border-emerald-500/20">
              Dues Status: NO OUTSTANDING
            </span>
          )}
        </div>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Outstanding Dues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 transition-theme hover:shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Outstanding Dues</span>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(outstandingBalance)}</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-405 mt-1">
              {outstandingBalance > 0 ? 'Due by 15-Jun-2026' : 'All maintenance settled'}
            </p>
          </div>
        </div>

        {/* Open Complaints */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 transition-theme hover:shadow-md">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Open Complaints</span>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{openComplaintsCount} Tickets</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 truncate max-w-[140px]" title={recentComplaintText}>
              {recentComplaintText}
            </p>
          </div>
        </div>

        {/* Unread Circulars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 transition-theme hover:shadow-md">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Unread Circulars</span>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{unreadNotices} Notice</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">Water storage tank clean</p>
          </div>
        </div>

        {/* Registered RSVPs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4 transition-theme hover:shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">RSVP Status</span>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {rsvpState ? 'Registered' : 'None'}
            </h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">
              {rsvpState ? `${rsvpCount} attending` : 'Monsoon drive'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notices Board Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-105 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">Recent Circulars</h3>
            {unreadNotices > 0 && (
              <button 
                onClick={() => {
                  setUnreadNotices(0);
                  addToast('Marked all announcements as read.', 'info');
                }}
                className="text-[10px] text-[#D4AF37] hover:text-yellow-600 font-bold"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3 relative overflow-hidden transition-theme">
            {unreadNotices > 0 && (
              <span className="absolute top-0 right-0 bg-[#D4AF37] text-society-primary font-bold text-[8px] px-2 py-0.5 rounded-bl uppercase">NEW</span>
            )}
            <h4 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm">Water Supply Maintenance Shutdown</h4>
            <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed">
              Please note that the main water storage tanks will undergo cleaning on June 15, 2026. Water supply will be unavailable from 10:00 AM to 4:00 PM.
            </p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-450">June 11, 2026</span>
              <Link to="/notices" className="text-xs text-society-primary dark:text-slate-350 hover:underline font-bold flex items-center gap-1">
                <span>View All Notices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RSVP Card & Downloads */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Event RSVP Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between transition-theme h-[220px]">
            <div>
              <h3 className="font-bold text-[#D4AF37] text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Event RSVP</h3>
              <strong className="text-slate-800 dark:text-slate-100 text-xs block mb-1">Monsoon Tree Plantation Drive</strong>
              <p className="text-slate-500 dark:text-slate-450 text-[11px]">Saturday, July 12 | Society Perimeter area</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-400">Status:</span>
                <strong className={rsvpState ? 'text-emerald-500' : 'text-slate-450 dark:text-slate-500'}>
                  {rsvpState ? `Registered (${rsvpCount} Members)` : 'Not Registered'}
                </strong>
              </div>
              <button 
                onClick={toggleRsvp}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                  rsvpState 
                    ? 'bg-slate-105 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300' 
                    : 'bg-society-primary hover:bg-[#0b213b] text-white dark:bg-[#D4AF37] dark:text-society-primary'
                }`}
              >
                {rsvpState ? 'Cancel RSVP' : 'Register RSVP'}
              </button>
            </div>
          </div>

          {/* Quick Downloads */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme flex flex-col justify-between">
            <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">Quick Downloads</h3>
            <div className="space-y-2.5">
              {quickDownloads.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="text-[11px] text-slate-750 dark:text-slate-200 truncate font-semibold">{doc.name}</span>
                  </div>
                  <button 
                    onClick={() => addToast(`Simulated download for: ${doc.name}`, 'info')}
                    className="p-1 rounded bg-white dark:bg-slate-700 text-society-primary dark:text-[#D4AF37] border border-slate-250 dark:border-slate-600 shadow-sm transition"
                    aria-label="Download Form"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
