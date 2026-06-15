import React, { useState, useEffect } from 'react';
import { Loader2, Search, Clock, ShieldAlert, CheckSquare } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function ActiveVisitors() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActiveVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/entries/active');
      setEntries(res.data.data || []);
    } catch (err) {
      addToast('Failed to load active visitors register.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const handleCheckout = async (id, name) => {
    try {
      await api.patch(`/visitors/entries/${id}/check-out`, { remarks: 'Left premises' });
      addToast(`Checked out ${name} successfully.`, 'success');
      fetchActiveVisitors();
    } catch (err) {
      addToast('Failed to process visitor checkout.', 'error');
    }
  };

  const filteredEntries = entries.filter(e => {
    const term = searchTerm.toLowerCase();
    return (
      e.visitor_name.toLowerCase().includes(term) ||
      e.phone.includes(term) ||
      (e.vehicle_number && e.vehicle_number.toLowerCase().includes(term)) ||
      (e.properties?.unit_number && e.properties.unit_number.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-society-primary dark:text-white">Active Visitors inside Premises</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Monitor guest list currently present inside the society blocks. Always verify visitor checkout logs upon exit.
        </p>
      </div>

      {/* Search Filter and refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-theme">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, phone, flat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none transition-theme"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
        </div>
        <button
          onClick={fetchActiveVisitors}
          className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>↻ Refresh Ledger</span>}
        </button>
      </div>

      {/* Grid List or Table */}
      {loading ? (
        <div className="py-16 flex flex-col justify-center items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <span className="text-xs text-slate-400">Loading active visitor registrations...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-550 text-xs flex flex-col items-center justify-center gap-2.5">
          <CheckSquare className="w-8 h-8 text-[#D4AF37]" />
          <span>{searchTerm ? 'No matching active visitor logs found.' : 'No active visitors inside society limits.'}</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4">Visitor details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Destination Block</th>
                  <th className="p-4">Checked-In</th>
                  <th className="p-4">Vehicle plates</th>
                  <th className="p-4">Guard Checked-In by</th>
                  <th className="p-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{e.visitor_name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{e.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.visitor_type === 'Guest' ? 'bg-indigo-500/10 text-indigo-500' :
                        e.visitor_type === 'Delivery' ? 'bg-amber-500/10 text-amber-500' :
                        e.visitor_type === 'Maintenance' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {e.visitor_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {e.properties?.unit_number || 'Main Gate'}
                      </div>
                      {e.properties?.wings?.wing_name && (
                        <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                          {e.properties.wings.wing_name}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <div>
                          <div>{new Date(e.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[9px] text-slate-400 font-light">{new Date(e.checked_in_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-350 uppercase">
                      {e.vehicle_number || 'None'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-500 font-medium">
                      {e.checked_in_by_user ? `${e.checked_in_by_user.first_name} ${e.checked_in_by_user.last_name}` : 'Security Guard'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCheckout(e.id, e.visitor_name)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition shadow-sm"
                      >
                        Check-Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActiveVisitors;
