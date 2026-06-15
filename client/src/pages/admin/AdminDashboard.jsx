import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, 
  Plus, FileText, Wrench, ShieldAlert, ArrowRight, DollarSign, Calendar
} from 'lucide-react';
import { getResidents, getComplaints, getPayments } from '../../utils/mockDb';
import { formatCurrency } from '../../utils/formatters';

function AdminDashboard() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setResidents(getResidents());
    setComplaints(getComplaints());
    setPayments(getPayments());
  }, []);

  // Compute dynamic stats
  const activeResidentsCount = residents.filter(r => r.status === 'Active').length;
  const totalOccupiedUnits = activeResidentsCount; // 137 units total in society
  const openComplaintsCount = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
  
  // Calculate collection for June 2026 Maintenance
  const junePayments = payments.filter(p => p.cycle === 'June 2026 Maintenance');
  const juneCollected = junePayments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
  const juneTarget = 112 * 3500; // 112 active units * 3500
  const collectionRate = junePayments.length > 0 
    ? Math.round((junePayments.filter(p => p.status === 'SUCCESS').length / junePayments.length) * 100)
    : 78; // fallback to 78% mock

  // May Collection
  const mayCollected = payments.filter(p => p.cycle === 'May 2026 Maintenance' && p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
  // April Collection
  const aprilCollected = payments.filter(p => p.cycle === 'April 2026 Maintenance' && p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

  // Chart data representing collections
  const chartData = [
    { month: 'Jan', amount: 280000, formatted: '2.8L', height: 60 },
    { month: 'Feb', amount: 310000, formatted: '3.1L', height: 75 },
    { month: 'Mar', amount: 300000, formatted: '3.0L', height: 70 },
    { month: 'Apr', amount: aprilCollected || 340000, formatted: '3.4L', height: 90 },
    { month: 'May', amount: mayCollected || 320000, formatted: '3.2L', height: 85 },
    { month: 'Jun', amount: juneCollected || 345000, formatted: `${(juneCollected / 100000).toFixed(2)}L`, height: 95 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Committee Admin Dashboard</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Operational view of maintenance billing registers, resident directory, and support requests.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>COMMITTEE RUN</span>
        </span>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Residents Directory Counter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Registered Members</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{activeResidentsCount} Units</h3>
            <p className="text-slate-400 text-[10px]">137 total apartments (82% active occupancy)</p>
          </div>
        </div>

        {/* Collections Counter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">June Collections</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{formatCurrency(juneCollected)}</h3>
            <p className="text-slate-450 dark:text-slate-550 text-[10px]">{collectionRate}% payment collection rate</p>
          </div>
        </div>

        {/* Complaints Counter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Open Helpdesk Tickets</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
              <Wrench className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{openComplaintsCount} Tickets</h3>
            <p className="text-slate-400 text-[10px]">Pending plumber/electrician dispatcher</p>
          </div>
        </div>

        {/* Announcements Notice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Notice Board</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">6 Broadcasts</h3>
            <p className="text-slate-400 text-[10px]">1 pinned announcement for AGM 2026</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Shortcuts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collections Chart Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-theme">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-[#D4AF37] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Monthly Maintenance Collections (2026)</span>
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Target Monthly: ₹3.92L (112 Occupied Units)</span>
            </div>

            {/* Simulated Chart Bars */}
            <div className="h-52 flex items-end justify-between px-4 pt-4 border-b border-slate-200 dark:border-slate-850">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2.5 w-1/6 group">
                  <span className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{data.formatted}
                  </span>
                  <div 
                    style={{ height: `${data.height}px` }} 
                    className="w-10 bg-gradient-to-t from-slate-900 to-slate-800 dark:from-[#D4AF37] dark:to-yellow-600 rounded-t-lg transition-all duration-300 group-hover:brightness-90 cursor-pointer shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center text-[10px] text-slate-400 dark:text-slate-500 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-850 dark:bg-[#D4AF37]"></span>
              <span>Collected Funds</span>
            </span>
            <span>•</span>
            <span>Billing Interval: 1st of every month</span>
          </div>
        </div>

        {/* Admin Quick Shortcuts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-850 dark:text-[#D4AF37] text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-3">
              Admin Quick Actions
            </h3>
            
            <div className="flex flex-col gap-3 font-semibold text-xs">
              <Link 
                to="/admin/notices" 
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/5 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-350 transition hover:border-[#D4AF37]/30"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-amber-500" />
                  <span>Broadcast New Notice</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link 
                to="/admin/complaints" 
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/5 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-350 transition hover:border-[#D4AF37]/30"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4.5 h-4.5 text-sky-500" />
                  <span>Review Open Complaints</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link 
                to="/admin/payments" 
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/5 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-350 transition hover:border-[#D4AF37]/30"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Billing Cycle Runs & Rates</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/80 text-[10px] text-slate-450 leading-relaxed mt-6">
            <strong>System Audit Log Status:</strong> Operational logs are being compiled automatically. Click audit links in sidebar to view document uploads, notice edits, or billing cycle logs.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
