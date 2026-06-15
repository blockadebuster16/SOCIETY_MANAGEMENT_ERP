import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, UserCheck, Clock, AlertOctagon, KeyRound, UserPlus, 
  PhoneCall, Plus, Loader2, Search, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function SecurityDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    visitorsToday: 0,
    activeVisitors: 0,
    deliveriesToday: 0,
    openIncidents: 0
  });

  const [activeEntries, setActiveEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals / Forms States
  const [activeTab, setActiveTab] = useState('none'); // 'none' | 'pass' | 'visitor' | 'incident'
  
  // Gate Pass State
  const [passCodeInput, setPassCodeInput] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [passError, setPassError] = useState('');

  // Ad-hoc Visitor Form State
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    visitorPhone: '',
    vehicleNumber: '',
    propertyId: '', // unit number e.g. A-102
    visitorType: 'Guest',
    purpose: '',
    remarks: ''
  });

  // Incident Form State
  const [incidentForm, setIncidentForm] = useState({
    logText: '',
    category: 'Security',
    severity: 'Medium'
  });

  // Load active visitor log entries and calculate statistics
  const fetchData = async () => {
    setLoadingEntries(true);
    try {
      const entriesRes = await api.get('/visitors/entries/active');
      const historyRes = await api.get('/visitors/entries/history');
      const incidentsRes = await api.get('/visitors/security-logs');

      const activeList = entriesRes.data.data || [];
      const historyList = historyRes.data.data || [];
      const incidentsList = incidentsRes.data.data || [];

      setActiveEntries(activeList);

      // Aggregate stats
      const todayStr = new Date().toISOString().substring(0, 10);
      const todayEntries = [...activeList, ...historyList].filter(e => {
        const checkinDate = e.checked_in_at || e.created_at;
        return checkinDate && checkinDate.substring(0, 10) === todayStr;
      });

      const deliveries = todayEntries.filter(e => e.visitor_type === 'Delivery');
      const openInc = incidentsList.filter(i => i.severity === 'Critical' || i.severity === 'High' || i.severity === 'Medium');

      setStats({
        visitorsToday: todayEntries.length,
        activeVisitors: activeList.length,
        deliveriesToday: deliveries.length,
        openIncidents: openInc.length
      });
    } catch (error) {
      console.error('Failed to fetch security dashboard data:', error);
      addToast('Error loading gate registers.', 'error');
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validate and submit gate pass passcode check-in
  const handleVerifyPasscode = async (e) => {
    e.preventDefault();
    if (!passCodeInput.trim()) return;
    setPassError('');
    setVerifiedPass(null);
    setActionLoading(true);

    try {
      // Send passcode check-in request
      const res = await api.post('/visitors/check-in', { passCode: passCodeInput.trim() });
      const entry = res.data.data;
      setVerifiedPass(entry);
      addToast(`Pre-approved check-in successful for ${entry.visitor_name}!`, 'success');
      setPassCodeInput('');
      fetchData();
      setTimeout(() => {
        setActiveTab('none');
        setVerifiedPass(null);
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired gate pass code.';
      setPassError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit manual ad-hoc visitor entry check-in
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    if (!visitorForm.visitorName || !visitorForm.visitorPhone || !visitorForm.propertyId) {
      addToast('Please fill in all required fields.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/visitors/check-in', {
        propertyId: visitorForm.propertyId.trim(),
        visitorName: visitorForm.visitorName.trim(),
        visitorPhone: visitorForm.visitorPhone.trim(),
        vehicleNumber: visitorForm.vehicleNumber.trim() || null,
        visitorType: visitorForm.visitorType,
        purpose: visitorForm.purpose.trim() || null,
        remarks: visitorForm.remarks.trim() || null
      });

      addToast('Visitor checked in successfully.', 'success');
      setVisitorForm({
        visitorName: '',
        visitorPhone: '',
        vehicleNumber: '',
        propertyId: '',
        visitorType: 'Guest',
        purpose: '',
        remarks: ''
      });
      setActiveTab('none');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed. Please verify flat number.';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit new security incident log
  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    if (!incidentForm.logText.trim()) return;
    setActionLoading(true);
    try {
      await api.post('/visitors/security-logs', incidentForm);
      addToast('Security incident logged successfully.', 'success');
      setIncidentForm({ logText: '', category: 'Security', severity: 'Medium' });
      setActiveTab('none');
      fetchData();
    } catch (err) {
      addToast('Failed to post security log.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute check-out API trigger
  const handleCheckOut = async (entryId) => {
    try {
      await api.patch(`/visitors/entries/${entryId}/check-out`, { remarks: 'Left premises' });
      addToast('Visitor checkout processed.', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to checkout visitor.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Gate Control Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Real-time monitoring of main entry points, active visitor logging, pre-approved gate passes validation, and incident dispatching.
          </p>
        </div>
        
        {/* Quick Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('pass')}
            className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold text-xs px-4.5 py-2.5 rounded-lg transition shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            <span>Validate Passcode</span>
          </button>
          <button
            onClick={() => setActiveTab('visitor')}
            className="flex items-center gap-1.5 bg-society-primary hover:bg-[#0b213b] text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs px-4.5 py-2.5 rounded-lg transition border border-slate-200/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ad-hoc Check-in</span>
          </button>
          <button
            onClick={() => setActiveTab('incident')}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-lg transition shadow-md"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visitors Logged Today', val: stats.visitorsToday, icon: <UserCheck className="w-6 h-6 text-blue-500" />, desc: 'Total incoming entries' },
          { label: 'Active Visitors Inside', val: stats.activeVisitors, icon: <Clock className="w-6 h-6 text-amber-500 animate-pulse" />, desc: 'Currently checked-in' },
          { label: 'Deliveries Today', val: stats.deliveriesToday, icon: <Shield className="w-6 h-6 text-emerald-500" />, desc: 'Courier/Courier packets' },
          { label: 'Active Alerts', val: stats.openIncidents, icon: <AlertOctagon className="w-6 h-6 text-rose-500" />, desc: 'Unresolved incidents' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{item.label}</span>
              {item.icon}
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-2">{item.val}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Action Overlay Panel (Forms drawer) */}
      <AnimatePresence>
        {activeTab !== 'none' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative overflow-hidden"
          >
            <button 
              onClick={() => { setActiveTab('none'); setPassError(''); setVerifiedPass(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 dark:hover:text-white"
            >
              Close [×]
            </button>

            {activeTab === 'pass' && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-society-primary dark:text-white flex justify-center items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                    <span>Validate Resident Pre-Approved Passcode</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Enter the 6-character visitor pass code shared by the resident (e.g. GP-A102X)</p>
                </div>

                <form onSubmit={handleVerifyPasscode} className="flex gap-2">
                  <input
                    type="text"
                    value={passCodeInput}
                    onChange={(e) => setPassCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Gate Pass Code"
                    maxLength={10}
                    className="flex-grow border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none uppercase"
                    disabled={actionLoading}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-society-primary hover:bg-[#0b213b] dark:bg-[#D4AF37] dark:hover:bg-yellow-600 dark:text-society-primary text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Check-in</span>
                  </button>
                </form>

                {passError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-lg">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {verifiedPass && (
                  <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Pass Validated Successfully!</div>
                      <div className="text-[10px] mt-0.5">Checked-in: {verifiedPass.visitor_name} ({verifiedPass.visitor_type}) at {verifiedPass.properties?.unit_number}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'visitor' && (
              <form onSubmit={handleVisitorSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-society-primary dark:text-white flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                    <span>Manual Ad-hoc Visitor Check-in Form</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Log guest details when they arrive without a pre-approved pass code.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Visitor Name *</label>
                    <input
                      type="text"
                      value={visitorForm.visitorName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number *</label>
                    <input
                      type="tel"
                      value={visitorForm.visitorPhone}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorPhone: e.target.value })}
                      placeholder="e.g. 98220 12345"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Destination Flat *</label>
                    <input
                      type="text"
                      value={visitorForm.propertyId}
                      onChange={(e) => setVisitorForm({ ...visitorForm, propertyId: e.target.value })}
                      placeholder="e.g. A-102 or S-02"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Vehicle Number</label>
                    <input
                      type="text"
                      value={visitorForm.vehicleNumber}
                      onChange={(e) => setVisitorForm({ ...visitorForm, vehicleNumber: e.target.value })}
                      placeholder="e.g. MH-43-AB-1234"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Visitor Type</label>
                    <select
                      value={visitorForm.visitorType}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorType: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                    >
                      <option value="Guest">Guest / Friend</option>
                      <option value="Delivery">Delivery Executive</option>
                      <option value="Maintenance">Maintenance Plumber/Electrician</option>
                      <option value="Vendor">Vendor / Service Staff</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Purpose / Brand</label>
                    <input
                      type="text"
                      value={visitorForm.purpose}
                      onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                      placeholder="e.g. Amazon, Swiggy, Social visit"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Remarks / Check-in Notes</label>
                  <input
                    type="text"
                    value={visitorForm.remarks}
                    onChange={(e) => setVisitorForm({ ...visitorForm, remarks: e.target.value })}
                    placeholder="Add brief gate logs if any"
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('none')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-society-primary hover:bg-[#0b213b] dark:bg-society-secondary dark:text-society-primary text-white font-bold text-xs px-6 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Check-In</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'incident' && (
              <form onSubmit={handleIncidentSubmit} className="space-y-4 max-w-xl mx-auto">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-society-primary dark:text-white flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    <span>Log Gate Security Incident Alert</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Record security observations, thefts, wrong vehicle parking, or system anomalies.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                    <select
                      value={incidentForm.category}
                      onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                    >
                      <option value="Security">Security Breach</option>
                      <option value="Theft">Theft / Loss</option>
                      <option value="Parking">Wrong Parking</option>
                      <option value="Maintenance">Water / Electrical Sparks</option>
                      <option value="General">General incident</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Severity Alert Level</label>
                    <select
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                    >
                      <option value="Critical">Critical (Immediate Call)</option>
                      <option value="High">High Severity</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="Low">Low / Observation log</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Incident Details *</label>
                  <textarea
                    rows={3}
                    value={incidentForm.logText}
                    onChange={(e) => setIncidentForm({ ...incidentForm, logText: e.target.value })}
                    placeholder="Provide details of the incident..."
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('none')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Dispatch Alert Log</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Checked-In Visitors Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-theme">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-bold text-society-primary dark:text-white">Active Visitors Inside Premises</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">List of guests, delivery agents, or staff currently inside the society wings.</p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs font-bold text-society-secondary hover:underline flex items-center gap-1.5"
            disabled={loadingEntries}
          >
            {loadingEntries ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>↻ Refresh logs</span>}
          </button>
        </div>

        {loadingEntries ? (
          <div className="py-12 flex flex-col justify-center items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <span className="text-xs text-slate-400">Loading active visitor ledger...</span>
          </div>
        ) : activeEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-450 dark:text-slate-500 text-xs">
            No active visitors checked-in currently. Use the actions above to log new entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4">Visitor Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Destination Unit</th>
                  <th className="p-4">Checked-In Time</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {activeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{entry.visitor_name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{entry.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.visitor_type === 'Guest' ? 'bg-indigo-500/10 text-indigo-500' :
                        entry.visitor_type === 'Delivery' ? 'bg-amber-500/10 text-amber-500' :
                        entry.visitor_type === 'Maintenance' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {entry.visitor_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {entry.properties?.unit_number || 'Main Gate'}
                      </span>
                      {entry.properties?.wings?.wing_name && (
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 ml-1">
                          ({entry.properties.wings.wing_name})
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>
                          {new Date(entry.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-650 dark:text-slate-350 uppercase">
                      {entry.vehicle_number || 'None'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCheckOut(entry.id)}
                        className="bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-rose-600/20 transition"
                      >
                        Check-Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emergency Contacts & Helpdesk */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl" />
        
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#D4AF37]">Main Gate Helpline Contacts</h4>
          <p className="text-[10px] text-slate-400">Emergency support contacts for security crew during incidents or service request breakdowns.</p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400">Security Supervisor:</span>
            <span className="font-bold flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-emerald-450" /> 98765 99999</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400">Society Secretary:</span>
            <span className="font-bold flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-emerald-450" /> 92223 34455</span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400">Ulwe Police Station:</span>
            <span className="font-bold flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-emerald-450" /> 022-2724-1002</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400">Fire Brigade Control:</span>
            <span className="font-bold flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-emerald-450" /> 101 / 022-2757-2111</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;
