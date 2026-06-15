import React, { useState, useEffect } from 'react';
import { Loader2, Search, Clock, FileDown, Calendar, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function VisitorHistory() {
  const { addToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    visitorType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Build query string params
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.visitorType) params.visitorType = filters.visitorType;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = new Date(filters.startDate).toISOString();
      if (filters.endDate) params.endDate = new Date(filters.endDate).toISOString();

      const res = await api.get('/visitors/entries/history', { params });
      setHistory(res.data.data || []);
    } catch (err) {
      addToast('Failed to load visitor logs history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters.visitorType, filters.status, filters.startDate, filters.endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const exportCSV = () => {
    if (history.length === 0) {
      addToast('No records available to export.', 'warning');
      return;
    }
    try {
      const headers = ['Visitor Name', 'Phone', 'Type', 'Purpose', 'Property', 'Check-In At', 'Check-Out At', 'Vehicle', 'Status'];
      const rows = history.map(h => [
        h.visitor_name,
        h.phone,
        h.visitor_type,
        h.purpose || 'N/A',
        h.properties?.unit_number || 'N/A',
        h.checked_in_at ? new Date(h.checked_in_at).toLocaleString() : 'N/A',
        h.checked_out_at ? new Date(h.checked_out_at).toLocaleString() : 'N/A',
        h.vehicle_number || 'None',
        h.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `visitor_logs_history_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('CSV log exported successfully.', 'success');
    } catch (e) {
      addToast('Export failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Visitor Entry Register</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
            Search historical records of all check-in entries, delivery logs, and gate clearance validations.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 bg-society-primary hover:bg-[#0b213b] dark:bg-slate-850 dark:hover:bg-slate-800 text-white border border-slate-200/10 font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md"
        >
          <FileDown className="w-4 h-4 text-[#D4AF37]" />
          <span>Export logs CSV</span>
        </button>
      </div>

      {/* Query Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-theme">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-lg">
          <input
            type="text"
            placeholder="Search by visitor name, phone, license plate..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-grow border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none transition-theme"
          />
          <button
            type="submit"
            className="bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Filter className="w-3 h-3" /> Visitor Type</label>
            <select
              value={filters.visitorType}
              onChange={(e) => setFilters({ ...filters, visitorType: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Guest">Guest / Friend</option>
              <option value="Delivery">Delivery Executive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Vendor">Vendor / Staff</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Filter className="w-3 h-3" /> Gate Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Checked-Out">Checked-Out</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-society-secondary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* History Ledger Table */}
      {loading ? (
        <div className="py-16 flex flex-col justify-center items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <span className="text-xs text-slate-400">Loading visitor logs history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-550 text-xs">
          No historical visitor records found. Try modifying your search query or filters.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-theme">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4">Visitor details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Destination Unit</th>
                  <th className="p-4">Check-In details</th>
                  <th className="p-4">Check-Out details</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{h.visitor_name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{h.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.visitor_type === 'Guest' ? 'bg-indigo-500/10 text-indigo-500' :
                        h.visitor_type === 'Delivery' ? 'bg-amber-500/10 text-amber-500' :
                        h.visitor_type === 'Maintenance' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {h.visitor_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {h.properties?.unit_number || 'Main Gate'}
                      </div>
                      {h.properties?.wings?.wing_name && (
                        <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                          {h.properties.wings.wing_name}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-650 dark:text-slate-400 font-medium">
                      {h.checked_in_at ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-450" />
                            <span>{new Date(h.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="text-[9px] text-slate-400">{new Date(h.checked_in_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="p-4 text-slate-650 dark:text-slate-400 font-medium">
                      {h.checked_out_at ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span>{new Date(h.checked_out_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="text-[9px] text-slate-400">{new Date(h.checked_out_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      ) : (
                        <span className="text-amber-500 font-bold text-[10px] uppercase tracking-wider animate-pulse">Inside</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-350 uppercase">
                      {h.vehicle_number || 'None'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'Checked-In' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {h.status === 'Checked-In' ? 'Checked-In' : 'Checked-Out'}
                      </span>
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

export default VisitorHistory;
