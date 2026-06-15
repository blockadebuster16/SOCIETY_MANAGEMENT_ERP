import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Plus, Wrench, Zap, ShieldAlert, Shield, Trash2, Wind,
  Droplets, Flame, ParkingCircle, TreeDeciduous, ShoppingBag,
  Clock, CheckCircle2, MessageSquare, ArrowRight, X, Sparkles,
  AlertTriangle, AlertCircle, RefreshCw, ChevronDown, Paperclip,
  Image, Send, Loader2, Filter, RotateCcw, Tag, User2, Calendar
} from 'lucide-react';
import { getComplaints, saveComplaint } from '../../utils/mockDb';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'Plumbing',        label: 'Plumbing',          icon: Wrench,         color: 'text-sky-500',     bg: 'bg-sky-50' },
  { value: 'Electrical',      label: 'Electrical',         icon: Zap,            color: 'text-amber-500',   bg: 'bg-amber-50' },
  { value: 'Lift',            label: 'Lift',               icon: ArrowRight,     color: 'text-purple-500',  bg: 'bg-purple-50' },
  { value: 'Security',        label: 'Security',           icon: Shield,         color: 'text-red-500',     bg: 'bg-red-50' },
  { value: 'Parking',         label: 'Parking',            icon: ParkingCircle,  color: 'text-blue-500',    bg: 'bg-blue-50' },
  { value: 'Housekeeping',    label: 'Housekeeping',       icon: Wind,           color: 'text-teal-500',    bg: 'bg-teal-50' },
  { value: 'Water Supply',    label: 'Water Supply',       icon: Droplets,       color: 'text-cyan-500',    bg: 'bg-cyan-50' },
  { value: 'Garden',          label: 'Garden',             icon: TreeDeciduous,  color: 'text-green-500',   bg: 'bg-green-50' },
  { value: 'Fire Safety',     label: 'Fire Safety',        icon: Flame,          color: 'text-orange-500',  bg: 'bg-orange-50' },
  { value: 'Common Area',     label: 'Common Area',        icon: ShieldAlert,    color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  { value: 'Commercial Shop', label: 'Commercial Shop',    icon: ShoppingBag,    color: 'text-pink-500',    bg: 'bg-pink-50' },
  { value: 'Other',           label: 'Other',              icon: AlertCircle,    color: 'text-slate-500',   bg: 'bg-slate-100' },
];

const PRIORITIES = [
  { value: 'Low',      label: 'Low',      color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200' },
  { value: 'Medium',   label: 'Medium',   color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200' },
  { value: 'High',     label: 'High',     color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200' },
  { value: 'Critical', label: 'Critical', color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200' },
];

const STATUSES = [
  { value: 'Open',       label: 'Open',        color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { value: 'Assigned',   label: 'Assigned',    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  { value: 'In Progress',label: 'In Progress', color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  { value: 'Resolved',   label: 'Resolved',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'Closed',     label: 'Closed',      color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200' },
  { value: 'Rejected',   label: 'Rejected',    color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  { value: 'Reopened',   label: 'Reopened',    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
];

// ─── Helper components ─────────────────────────────────────────────────────────

function getCatConfig(value) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
}

function getPriorityConfig(value) {
  return PRIORITIES.find(p => p.value === value) || PRIORITIES[0];
}

function getStatusConfig(value) {
  // Normalize legacy statuses (PENDING → Open, IN_PROGRESS → In Progress, RESOLVED → Resolved)
  const normalized = value === 'PENDING' ? 'Open' : value === 'IN_PROGRESS' ? 'In Progress' : value === 'RESOLVED' ? 'Resolved' : value;
  return STATUSES.find(s => s.value === normalized) || STATUSES[0];
}

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {status === 'Resolved' || status === 'RESOLVED' || status === 'Closed' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = getPriorityConfig(priority || 'Medium');
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function CategoryIcon({ cat, className = 'w-4 h-4' }) {
  const cfg = getCatConfig(cat);
  const Icon = cfg.icon;
  return <Icon className={`${className} ${cfg.color}`} />;
}

// ─── New Complaint Slide-over ─────────────────────────────────────────────────

function NewComplaintDrawer({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: '',
    category: 'Plumbing',
    priority: 'Medium',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = React.useRef(null);

  const setField = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleImages = (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4);
    setImages(prev => [...prev, ...arr].slice(0, 4));
  };

  const validate = () => {
    const errs = {};
    if (!form.subject.trim() || form.subject.trim().length < 5) errs.subject = 'Subject must be at least 5 characters.';
    if (form.subject.length > 200) errs.subject = 'Subject cannot exceed 200 characters.';
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await onSubmit({ ...form, images });
    setIsSubmitting(false);
    setForm({ subject: '', category: 'Plumbing', priority: 'Medium', description: '' });
    setImages([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                  <h3 className="font-bold text-white text-sm">File Support Ticket</h3>
                  <p className="text-slate-300 text-[10px] mt-0.5">Residents are notified within 24 hours</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Issue Subject <span className="text-red-500">*</span></label>
                  <span className={`text-[10px] ${form.subject.length > 180 ? 'text-red-500' : 'text-slate-400'}`}>{form.subject.length}/200</span>
                </div>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setField('subject', e.target.value)}
                  placeholder="e.g. Toilet ceiling water seepage — Wing A Flat 102"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none transition ${errors.subject ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#D4AF37] focus:bg-white'}`}
                />
                {errors.subject && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.subject}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const sel = form.category === cat.value;
                    return (
                      <button key={cat.value} type="button" onClick={() => setField('category', cat.value)}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-center transition-all ${sel ? 'border-society-primary bg-society-primary/5 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                        <Icon className={`w-4 h-4 ${sel ? 'text-society-primary' : cat.color}`} />
                        <span className={`text-[9px] font-bold leading-tight ${sel ? 'text-society-primary' : 'text-slate-600'}`}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button" onClick={() => setField('priority', p.value)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${form.priority === p.value ? `${p.bg} ${p.color} ${p.border} shadow-sm` : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Detailed Description <span className="text-red-500">*</span></label>
                </div>
                <textarea rows={4}
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Describe the issue in detail. Mention location, when it started, and severity..."
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none resize-none leading-relaxed transition ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-[#D4AF37] focus:bg-white'}`}
                />
                {errors.description && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1">
                  <Image className="w-3.5 h-3.5 text-slate-400" /> Attach Photos <span className="text-slate-400 font-normal">(optional, max 4)</span>
                </label>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleImages(e.target.files)} className="hidden" />
                {images.length < 4 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition">
                    <Image className="w-4 h-4" /> Add Photos
                  </button>
                )}
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(img)} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  <strong>Response SLA:</strong> Critical — 4hrs | High — 24hrs | Medium — 48hrs | Low — 5 business days. Emergencies: contact security directly.
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-medium">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-society-primary hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm">
                {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</> : <><Send className="w-3.5 h-3.5" /> Submit Ticket</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ complaints }) {
  const counts = useMemo(() => {
    const c = { open: 0, inProgress: 0, resolved: 0, total: complaints.length };
    complaints.forEach(cp => {
      const s = cp.status || cp.status;
      if (s === 'Open' || s === 'PENDING') c.open++;
      else if (s === 'In Progress' || s === 'Assigned' || s === 'IN_PROGRESS' || s === 'Reopened') c.inProgress++;
      else if (s === 'Resolved' || s === 'RESOLVED' || s === 'Closed') c.resolved++;
    });
    return c;
  }, [complaints]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Tickets', value: counts.total, color: 'text-society-primary', bg: 'bg-society-primary/5' },
        { label: 'Open', value: counts.open, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'In Progress', value: counts.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Resolved', value: counts.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ].map(s => (
        <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Complaint Card ────────────────────────────────────────────────────────────

function ComplaintCard({ comp }) {
  const cat = getCatConfig(comp.cat || comp.category);
  const Icon = cat.icon;
  const priorityStr = comp.priority || 'Medium';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="space-y-2.5 flex-1 min-w-0">
          {/* Top meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400 font-bold">{comp.id}</span>
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${cat.bg} ${cat.color}`}>
              <Icon className="w-3 h-3" />{cat.label}
            </span>
            <PriorityBadge priority={priorityStr} />
            <StatusBadge status={comp.status} />
          </div>

          {/* Title */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-society-primary transition line-clamp-1">
              <Link to={`/resident/complaints/${comp.id}`}>{comp.title || comp.subject}</Link>
            </h3>
            <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">{comp.description}</p>
          </div>

          {/* Bottom meta */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />Filed: {comp.date}</span>
            {comp.assignedTo && (
              <span className="flex items-center gap-1 text-sky-600 font-medium"><User2 className="w-2.5 h-2.5" />{comp.assignedTo}</span>
            )}
            {comp.logs && comp.logs.length > 1 && (
              <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{comp.logs.length - 1} update{comp.logs.length > 2 ? 's' : ''}</span>
            )}
          </div>
        </div>

        <div className="flex items-center self-end sm:self-center shrink-0">
          <Link to={`/resident/complaints/${comp.id}`}
            className="inline-flex items-center gap-1.5 text-society-primary hover:text-[#D4AF37] text-xs font-bold transition group/link">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function Complaints() {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load complaints
  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/complaints');
      const data = res.data?.data || res.data?.complaints || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
      setUsingMockData(false);
    } catch {
      // Fall back to mock db — filter to resident's flat
      setComplaints(getComplaints().filter(c => c.flat === 'Flat A-102'));
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  const handleCreate = useCallback(async (formData) => {
    const id = `TKT-${String(Date.now()).slice(-5)}`;
    const ticket = {
      id, title: formData.subject, subject: formData.subject,
      description: formData.description,
      cat: formData.category, category: formData.category,
      priority: formData.priority, status: 'Open',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      flat: 'Flat A-102', residentName: 'Parth Patel',
      assignedTo: null,
      logs: [{ time: new Date().toLocaleString('en-IN'), user: 'System', text: 'Ticket created successfully.' }]
    };

    if (usingMockData) {
      saveComplaint(ticket);
      setComplaints(getComplaints().filter(c => c.flat === 'Flat A-102'));
    } else {
      try {
        await api.post('/complaints', {
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          propertyId: 'resident-flat-id',
        });
        await loadComplaints();
      } catch {
        saveComplaint(ticket);
        setComplaints(getComplaints().filter(c => c.flat === 'Flat A-102'));
      }
    }
    addToast(`Ticket ${id} filed successfully.`, 'success');
  }, [usingMockData, loadComplaints, addToast]);

  // Filtered list
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (c.title || c.subject || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const status = c.status;
      const matchStatus = statusFilter === 'ALL' || status === statusFilter ||
        (statusFilter === 'Open' && status === 'PENDING') ||
        (statusFilter === 'In Progress' && (status === 'IN_PROGRESS' || status === 'Assigned' || status === 'Reopened')) ||
        (statusFilter === 'Resolved' && (status === 'RESOLVED' || status === 'Closed'));

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary">My Helpdesk Tickets</h2>
          <p className="text-slate-500 text-xs mt-1">
            Raise maintenance requests and track resolution progress.
            {usingMockData && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadComplaints} disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-society-primary hover:bg-slate-50 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm hover:shadow-md">
            <Plus className="w-4 h-4" /> File New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar complaints={complaints} />

      {/* Search + Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tickets by ID, title, keyword..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none focus:bg-white transition" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${showFilters || hasFilters ? 'bg-society-primary text-white border-society-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters {hasFilters && <span className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[9px] font-black">{[statusFilter !== 'ALL', categoryFilter !== 'ALL', priorityFilter !== 'ALL'].filter(Boolean).length}</span>}
          </button>
          {hasFilters && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5"><X className="w-3 h-3" />Clear</button>}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {/* Status filter */}
                <div className="relative">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                    <option value="ALL">All Statuses</option>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                {/* Category filter */}
                <div className="relative">
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                {/* Priority filter */}
                <div className="relative">
                  <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                    <option value="ALL">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p.value}>{p.label}</option>)}
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

      {/* Tickets */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-16 h-3 bg-slate-100 rounded" />
                <div className="w-20 h-3 bg-slate-100 rounded" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-20 flex flex-col items-center gap-4 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-slate-300" />
          </div>
          <div>
            <p className="font-bold text-slate-600 text-sm">No tickets found</p>
            <p className="text-xs text-slate-400 mt-1">
              {hasFilters || searchQuery ? 'Try adjusting your filters or search query.' : 'You haven\'t filed any support tickets yet.'}
            </p>
          </div>
          {(hasFilters || searchQuery) && (
            <button onClick={clearFilters} className="text-xs text-society-primary hover:underline">Clear all filters</button>
          )}
          <button onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 bg-society-primary text-white font-bold px-5 py-2.5 rounded-lg text-xs transition">
            <Plus className="w-3.5 h-3.5" /> File Your First Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(comp => <ComplaintCard key={comp.id} comp={comp} />)}
          </AnimatePresence>
        </div>
      )}

      {/* New Ticket Drawer */}
      <NewComplaintDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}

export default Complaints;
