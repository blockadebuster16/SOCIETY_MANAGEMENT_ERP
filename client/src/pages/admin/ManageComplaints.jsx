import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Wrench, Zap, ShieldAlert, Shield, Wind, Droplets, Flame,
  ParkingCircle, TreeDeciduous, ShoppingBag, AlertCircle,
  Clock, CheckCircle2, MessageSquare, X, Sparkles, User, Hammer,
  Clipboard, ChevronDown, RefreshCw, AlertTriangle, Loader2,
  ArrowRight, Tag, Send, CheckCheck, Ban, RotateCcw, Calendar, User2,
  Filter
} from 'lucide-react';
import { getComplaints, saveComplaint } from '../../utils/mockDb';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'Plumbing',         icon: Wrench,         color: 'text-sky-500',    bg: 'bg-sky-50' },
  { value: 'Electrical',       icon: Zap,            color: 'text-amber-500',  bg: 'bg-amber-50' },
  { value: 'Lift',             icon: ArrowRight,     color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'Security',         icon: Shield,         color: 'text-red-500',    bg: 'bg-red-50' },
  { value: 'Parking',          icon: ParkingCircle,  color: 'text-blue-500',   bg: 'bg-blue-50' },
  { value: 'Housekeeping',     icon: Wind,           color: 'text-teal-500',   bg: 'bg-teal-50' },
  { value: 'Water Supply',     icon: Droplets,       color: 'text-cyan-500',   bg: 'bg-cyan-50' },
  { value: 'Garden',           icon: TreeDeciduous,  color: 'text-green-500',  bg: 'bg-green-50' },
  { value: 'Fire Safety',      icon: Flame,          color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'Common Area',      icon: ShieldAlert,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { value: 'Commercial Shop',  icon: ShoppingBag,    color: 'text-pink-500',   bg: 'bg-pink-50' },
  { value: 'Other',            icon: AlertCircle,    color: 'text-slate-500',  bg: 'bg-slate-100' },
];

const STATUSES = [
  { value: 'Open',        label: 'Open',         color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { value: 'Assigned',    label: 'Assigned',     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  { value: 'In Progress', label: 'In Progress',  color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  { value: 'Resolved',    label: 'Resolved',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'Closed',      label: 'Closed',       color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200' },
  { value: 'Rejected',    label: 'Rejected',     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  { value: 'Reopened',    label: 'Reopened',     color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const VENDORS = [
  { id: 'v1', name: 'Ramesh Cooperative Plumbers',    cat: 'Plumbing' },
  { id: 'v2', name: 'S.K. Electricals — Sunil',       cat: 'Electrical' },
  { id: 'v3', name: 'Ulwe CCTV Security Systems',     cat: 'Security' },
  { id: 'v4', name: 'Wing-A Housekeeping Crew',       cat: 'Housekeeping' },
  { id: 'v5', name: 'General Handyman Services',      cat: 'Other' },
  { id: 'v6', name: 'Lift AMC — Otis Certified',      cat: 'Lift' },
  { id: 'v7', name: 'FireSafe Navi Mumbai Pvt. Ltd.', cat: 'Fire Safety' },
  { id: 'v8', name: 'Garden Landscaping Crew',        cat: 'Garden' },
];

const FRIENDLY_STATUS = { PENDING: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' };

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCatCfg(val) {
  return CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];
}
function getStatusCfg(val) {
  const key = FRIENDLY_STATUS[val] || val;
  return STATUSES.find(s => s.value === key) || STATUSES[0];
}

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status);
  const isClosed = ['Resolved', 'Closed', 'RESOLVED'].includes(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {isClosed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = {
    Low:      'bg-slate-100 text-slate-600',
    Medium:   'bg-blue-50 text-blue-700',
    High:     'bg-orange-50 text-orange-700',
    Critical: 'bg-red-50 text-red-700',
  };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg[priority] || cfg.Medium}`}>{priority || 'Medium'}</span>;
}

function CategoryIcon({ cat, className = 'w-4 h-4' }) {
  const cfg = getCatCfg(cat);
  const Icon = cfg.icon;
  return <Icon className={`${className} ${cfg.color}`} />;
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

function StatsRow({ complaints }) {
  const counts = useMemo(() => {
    const c = { total: complaints.length, open: 0, inProgress: 0, resolved: 0, critical: 0 };
    complaints.forEach(cp => {
      const s = FRIENDLY_STATUS[cp.status] || cp.status;
      if (s === 'Open' || s === 'Reopened') c.open++;
      else if (s === 'In Progress' || s === 'Assigned') c.inProgress++;
      else if (s === 'Resolved' || s === 'Closed') c.resolved++;
      if (cp.priority === 'Critical') c.critical++;
    });
    return c;
  }, [complaints]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {[
        { label: 'Total',       value: counts.total,      color: 'text-society-primary', bg: 'bg-society-primary/5' },
        { label: 'Open',        value: counts.open,       color: 'text-amber-600',       bg: 'bg-amber-50' },
        { label: 'In Progress', value: counts.inProgress, color: 'text-blue-600',        bg: 'bg-blue-50' },
        { label: 'Resolved',    value: counts.resolved,   color: 'text-emerald-600',     bg: 'bg-emerald-50' },
        { label: '🔴 Critical', value: counts.critical,  color: 'text-red-600',         bg: 'bg-red-50' },
      ].map(s => (
        <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
          <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Dispatch Drawer ───────────────────────────────────────────────────────────

function DispatchDrawer({ ticket, onClose, onSave }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    assignedTo: ticket.assignedTo || '',
    status: FRIENDLY_STATUS[ticket.status] || ticket.status || 'Open',
    adminRemark: '',
    resolutionNotes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const catCfg = getCatCfg(ticket.cat || ticket.category);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const needsResolution = form.status === 'Resolved' || form.status === 'Closed';

  const validate = () => {
    if (needsResolution && !form.resolutionNotes.trim()) {
      addToast('Resolution notes are required to close/resolve a ticket.', 'error');
      return false;
    }
    if (needsResolution && form.resolutionNotes.trim().length < 5) {
      addToast('Resolution notes must be at least 5 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    await onSave(ticket, form);
    setIsSaving(false);
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-society-primary to-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Ticket Dispatch & Assign</h3>
              <p className="text-slate-300 text-[10px] mt-0.5 font-mono">{ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Ticket Summary */}
          <div className={`rounded-xl p-4 border space-y-2 ${catCfg.bg} border-${catCfg.color.replace('text-', '')}/20`}>
            <div className="flex items-start gap-2.5">
              <CategoryIcon cat={ticket.cat || ticket.category} className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{ticket.title || ticket.subject}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{ticket.residentName} · {ticket.flat}</p>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{ticket.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={ticket.status} />
              {ticket.priority && <PriorityBadge priority={ticket.priority} />}
              <span className="text-[10px] text-slate-400">{ticket.date}</span>
            </div>
          </div>

          {/* Assign Vendor */}
          <div>
            <label className="font-bold text-slate-700 mb-1.5 block">Assign Vendor / Staff</label>
            <select
              value={form.assignedTo}
              onChange={e => setField('assignedTo', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] focus:bg-white focus:outline-none transition font-medium"
            >
              <option value="">— Select Vendor / Staff —</option>
              {VENDORS.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div>
            <label className="font-bold text-slate-700 mb-2 block">Update Status</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUSES.map(s => (
                <button key={s.value} type="button"
                  onClick={() => setField('status', s.value)}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-bold transition ${
                    form.status === s.value
                      ? `${s.bg} ${s.color} ${s.border} shadow-sm`
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Notes (required for Resolved/Closed) */}
          {needsResolution && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <label className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 block">
                Resolution Notes <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal">(required to close)</span>
              </label>
              <textarea rows={3} value={form.resolutionNotes} onChange={e => setField('resolutionNotes', e.target.value)}
                placeholder="Describe what was done to resolve this issue..."
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none resize-none leading-relaxed font-normal" />
            </motion.div>
          )}

          {/* Admin Remark / Comment */}
          <div>
            <label className="font-bold text-slate-700 mb-1.5 block">
              Administrative Note <span className="text-slate-400 font-normal">(appended to timeline)</span>
            </label>
            <textarea rows={3} value={form.adminRemark} onChange={e => setField('adminRemark', e.target.value)}
              placeholder="e.g. Plumber inspection scheduled for Monday 9 AM. Will need access to flat..."
              className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none resize-none leading-relaxed font-normal" />
          </div>

          {/* Timeline Preview */}
          <div>
            <h4 className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-2">Timeline Preview</h4>
            <div className="max-h-36 overflow-y-auto border border-slate-100 bg-slate-50 rounded-xl p-3 space-y-2">
              {(ticket.logs || []).slice(-5).map((log, i) => (
                <p key={i} className="text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700">{log.time} ({log.user}): </span>
                  {log.text}
                </p>
              ))}
              {(!ticket.logs || ticket.logs.length === 0) && (
                <p className="text-[10px] text-slate-400 italic">No activity yet.</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-society-primary hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm">
            {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : <><CheckCheck className="w-3.5 h-3.5" />Save Dispatch</>}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Complaint Table Row ───────────────────────────────────────────────────────

function ComplaintRow({ comp, onDispatch }) {
  const catCfg = getCatCfg(comp.cat || comp.category);
  const Icon = catCfg.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="hover:bg-slate-50/80 transition group"
    >
      <td className="px-5 py-4">
        <span className="font-mono text-[10px] text-slate-400 font-bold">{comp.id}</span>
      </td>
      <td className="px-5 py-4">
        <div>
          <p className="font-bold text-slate-800 text-xs">{comp.residentName || '—'}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{comp.flat || '—'}</p>
        </div>
      </td>
      <td className="px-5 py-4 max-w-xs">
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${catCfg.bg} ${catCfg.color}`}>
            <Icon className="w-2.5 h-2.5" />{comp.cat || comp.category}
          </span>
          <p className="font-bold text-slate-800 text-xs line-clamp-1">{comp.title || comp.subject}</p>
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{comp.description}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        {comp.priority ? <PriorityBadge priority={comp.priority} /> : <span className="text-[10px] text-slate-400">—</span>}
      </td>
      <td className="px-5 py-4 text-[11px] text-slate-500">{comp.date}</td>
      <td className="px-5 py-4">
        <span className={comp.assignedTo ? 'text-sky-600 text-xs font-semibold' : 'text-slate-400 italic text-xs'}>
          {comp.assignedTo || 'Unassigned'}
        </span>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={comp.status} />
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onDispatch(comp)}
          className="inline-flex items-center gap-1.5 bg-society-primary hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-sm hover:shadow-md active:scale-95"
        >
          <Hammer className="w-3 h-3" /> Manage
        </button>
      </td>
    </motion.tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function ManageComplaints() {
  const { addToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  // Load
  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/complaints');
      const data = res.data?.data || res.data?.complaints || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
      setUsingMockData(false);
    } catch {
      setComplaints(getComplaints());
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  // Dispatch save
  const handleSaveDispatch = useCallback(async (ticket, form) => {
    const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newLogs = [...(ticket.logs || [])];

    if (form.assignedTo && form.assignedTo !== ticket.assignedTo) {
      newLogs.push({ time: now, user: 'Admin (Secretary)', text: `Assigned to: ${form.assignedTo}` });
    }
    const prevStatus = FRIENDLY_STATUS[ticket.status] || ticket.status;
    if (form.status !== prevStatus) {
      newLogs.push({ time: now, user: 'System', text: `Status changed: ${prevStatus} → ${form.status}` });
    }
    if (form.resolutionNotes?.trim()) {
      newLogs.push({ time: now, user: 'Admin (Secretary)', text: `Resolution: ${form.resolutionNotes.trim()}` });
    }
    if (form.adminRemark?.trim()) {
      newLogs.push({ time: now, user: 'Admin (Secretary)', text: form.adminRemark.trim() });
    }

    const updated = { ...ticket, assignedTo: form.assignedTo, status: form.status, logs: newLogs };

    if (usingMockData) {
      saveComplaint(updated);
      setComplaints(getComplaints());
    } else {
      try {
        if (form.assignedTo !== ticket.assignedTo) {
          await api.patch(`/complaints/${ticket.id}/assign`, { assignedTo: form.assignedTo });
        }
        if (form.status !== prevStatus) {
          if (form.status === 'Resolved' || form.status === 'Closed') {
            await api.patch(`/complaints/${ticket.id}/close`, { resolutionNotes: form.resolutionNotes });
          } else {
            await api.patch(`/complaints/${ticket.id}/status`, { status: form.status });
          }
        }
        if (form.adminRemark?.trim()) {
          await api.post(`/complaints/${ticket.id}/comments`, { comment: form.adminRemark.trim() });
        }
        await loadComplaints();
      } catch {
        saveComplaint(updated);
        setComplaints(getComplaints());
      }
    }
    addToast(`Ticket ${ticket.id} updated successfully.`, 'success');
  }, [usingMockData, loadComplaints, addToast]);

  // Filter
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (c.title || c.subject || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.flat || '').toLowerCase().includes(q) ||
        (c.residentName || '').toLowerCase().includes(q);

      const normStatus = FRIENDLY_STATUS[c.status] || c.status;
      const matchStatus = statusFilter === 'ALL' || normStatus === statusFilter;
      const matchCat = categoryFilter === 'ALL' || c.cat === categoryFilter || c.category === categoryFilter;
      const matchPrio = priorityFilter === 'ALL' || c.priority === priorityFilter;

      return matchSearch && matchStatus && matchCat && matchPrio;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const hasFilters = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL';
  const clearFilters = () => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setPriorityFilter('ALL'); setSearchQuery(''); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
            <Clipboard className="w-6 h-6 text-[#D4AF37]" />
            Helpdesk Queue
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Review resident complaint logs, assign vendors, and update resolutions.
            {usingMockData && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
              </span>
            )}
          </p>
        </div>
        <button onClick={loadComplaints} disabled={isLoading}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-society-primary hover:bg-slate-50 transition">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <StatsRow complaints={complaints} />

      {/* Search + Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, flat, resident name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none focus:bg-white transition" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${showFilters || hasFilters ? 'bg-society-primary text-white border-society-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
            {hasFilters && <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[9px] font-black">{[statusFilter !== 'ALL', categoryFilter !== 'ALL', priorityFilter !== 'ALL'].filter(Boolean).length}</span>}
          </button>
          {hasFilters && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5"><X className="w-3 h-3" />Clear</button>}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="relative">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:outline-none">
                    <option value="ALL">All Statuses</option>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:outline-none">
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value}>{c.value}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:outline-none">
                    <option value="ALL">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
          Showing <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
          <span className="font-bold text-slate-600">{complaints.length}</span> tickets
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
            <p className="text-xs text-slate-400">Loading tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Clipboard className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-600 text-sm">No tickets found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
            </div>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-society-primary hover:underline">Clear all filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Ticket ID', 'Resident', 'Category & Issue', 'Priority', 'Date', 'Assigned', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filtered.map(comp => (
                    <ComplaintRow key={comp.id} comp={comp} onDispatch={setSelectedTicket} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Drawer */}
      <AnimatePresence>
        {selectedTicket && (
          <DispatchDrawer
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onSave={handleSaveDispatch}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageComplaints;
