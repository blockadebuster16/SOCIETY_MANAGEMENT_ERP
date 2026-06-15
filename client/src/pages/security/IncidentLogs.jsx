import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Plus, ShieldAlert, Clock, AlertOctagon } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function IncidentLogs() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    logText: '',
    category: 'Security',
    severity: 'Medium'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/security-logs');
      setLogs(res.data.data || []);
    } catch (err) {
      addToast('Failed to load incident logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.logText.trim()) return;
    setActionLoading(true);
    try {
      await api.post('/visitors/security-logs', form);
      addToast('Incident log posted successfully.', 'success');
      setForm({ logText: '', category: 'Security', severity: 'Medium' });
      setShowForm(false);
      fetchLogs();
    } catch (err) {
      addToast('Failed to post incident log.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Security Incident Log Register</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
            Review logged incidents, gate complaints, theft warnings, or general observation remarks posted by shift guards.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Hide Form' : 'Log New Incident'}</span>
        </button>
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm max-w-xl transition-theme">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>Log Security Occurrence</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                >
                  <option value="Security">Security Breach</option>
                  <option value="Theft">Theft / Property Damage</option>
                  <option value="Parking">Wrong Parking / Blocked Access</option>
                  <option value="Maintenance">Water seepage / Leakage / Sparks</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Severity Level</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                >
                  <option value="Critical">Critical (Action Needed)</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="Low">Low / Note log</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Occurrence Log Description *</label>
              <textarea
                rows={3}
                value={form.logText}
                onChange={(e) => setForm({ ...form, logText: e.target.value })}
                placeholder="Log details of the security occurrence..."
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                <span>Post Log Entry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Register */}
      {loading ? (
        <div className="py-16 flex flex-col justify-center items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <span className="text-xs text-slate-400">Loading incident registers...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-550 text-xs flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          <span>No incident log records filed yet.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 transition-theme ${
                log.severity === 'Critical' ? 'border-rose-650/40 border-l-4 border-l-rose-600' :
                log.severity === 'High' ? 'border-rose-500/20 border-l-4 border-l-rose-500' :
                log.severity === 'Medium' ? 'border-amber-500/20 border-l-4 border-l-amber-500' :
                'border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-400'
              }`}
            >
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.severity === 'Critical' ? 'bg-rose-500/10 text-rose-650 dark:text-rose-455' :
                    log.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                    log.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {log.severity} Alert
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {log.category}
                  </span>
                </div>
                <p className="text-slate-805 dark:text-slate-205 text-xs leading-relaxed font-medium">
                  {log.log_text}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{new Date(log.created_at || log.date).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded border border-slate-200/40 dark:border-slate-800/40 self-stretch sm:self-auto flex flex-col justify-center items-center font-bold">
                <div className="text-slate-500">Logged by:</div>
                <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {log.logged_by_user ? `${log.logged_by_user.first_name} ${log.logged_by_user.last_name}` : 'Security Guard'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncidentLogs;
