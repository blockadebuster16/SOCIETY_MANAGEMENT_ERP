import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter, Eye, Pencil, Trash2, Archive,
  Send, RefreshCw, Bell, ChevronDown, X, AlertTriangle,
  FileText, Clock, CheckCircle2, BookOpen, Tag, Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'All',
  'General', 'Maintenance', 'Emergency', 'AGM', 'SGM',
  'Festival', 'Security', 'Parking', 'Water Supply', 'Lift Maintenance'
];

const STATUSES = ['All', 'Draft', 'Published', 'Archived', 'Scheduled'];

const STATUS_CONFIG = {
  Published:  { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  Draft:      { color: 'bg-slate-100 text-slate-600',    icon: FileText },
  Archived:   { color: 'bg-amber-100 text-amber-700',    icon: Archive },
  Scheduled:  { color: 'bg-blue-100 text-blue-700',      icon: Clock },
};

const CATEGORY_COLORS = {
  Emergency:       'bg-red-100 text-red-700',
  Maintenance:     'bg-orange-100 text-orange-700',
  'Water Supply':  'bg-blue-100 text-blue-700',
  Security:        'bg-purple-100 text-purple-700',
  AGM:             'bg-indigo-100 text-indigo-700',
  SGM:             'bg-violet-100 text-violet-700',
  Festival:        'bg-pink-100 text-pink-700',
  Parking:         'bg-cyan-100 text-cyan-700',
  'Lift Maintenance': 'bg-yellow-100 text-yellow-700',
  General:         'bg-slate-100 text-slate-600',
};

// Mock data for when API is unavailable
const MOCK_NOTICES = [
  { id: 'n-001', title: 'AGM 2025 — Annual General Meeting Notice', category: 'AGM', status: 'Published', created_at: '2026-06-01T10:00:00Z', created_by_name: 'Secretary', is_pinned: true, content: 'All members are cordially invited to attend the Annual General Meeting.' },
  { id: 'n-002', title: 'Water Tank Cleaning Shutdown — June 15', category: 'Water Supply', status: 'Published', created_at: '2026-06-08T09:00:00Z', created_by_name: 'Maintenance Team', is_pinned: true, content: 'Water supply will be unavailable from 10 AM to 4 PM on June 15.' },
  { id: 'n-003', title: 'Corridor Pest Control Treatment Schedule', category: 'Maintenance', status: 'Published', created_at: '2026-06-05T08:30:00Z', created_by_name: 'Committee Office', is_pinned: false, content: 'Pest control activity is scheduled for all floors this weekend.' },
  { id: 'n-004', title: 'Emergency — Gas Leak Wing B Inspection', category: 'Emergency', status: 'Archived', created_at: '2026-05-20T14:00:00Z', created_by_name: 'President', is_pinned: false, content: 'Immediate inspection of Wing B gas lines is being conducted.' },
  { id: 'n-005', title: 'Holi Celebration & Cultural Events 2026', category: 'Festival', status: 'Archived', created_at: '2026-03-10T11:00:00Z', created_by_name: 'Cultural Committee', is_pinned: false, content: 'Join us for the Holi celebration in the society amphitheater.' },
  { id: 'n-006', title: 'New Visitor Security Protocol — Effective July 2026', category: 'Security', status: 'Draft', created_at: '2026-06-13T16:00:00Z', created_by_name: 'Security Manager', is_pinned: false, content: 'Draft of new visitor management guidelines for committee review.' },
];

function ConfirmModal({ isOpen, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition ${confirmClass || 'bg-red-600 hover:bg-red-700'}`}
            >
              {confirmLabel || 'Confirm'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function NoticeRow({ notice, onPublish, onArchive, onDelete, isProcessing }) {
  const StatusIcon = STATUS_CONFIG[notice.status]?.icon || FileText;
  const formattedDate = new Date(notice.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="hover:bg-slate-50/80 transition-colors group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-start gap-2.5">
          {notice.is_pinned && (
            <span className="mt-0.5 shrink-0 text-amber-500" title="Pinned">
              <Bell className="w-3 h-3 fill-current" />
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-society-primary transition-colors line-clamp-1">
              {notice.title}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> {formattedDate} &nbsp;·&nbsp; By {notice.created_by_name || 'Admin'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${CATEGORY_COLORS[notice.category] || 'bg-slate-100 text-slate-600'}`}>
          <Tag className="w-2.5 h-2.5" />
          {notice.category}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_CONFIG[notice.status]?.color || 'bg-slate-100 text-slate-600'}`}>
          <StatusIcon className="w-2.5 h-2.5" />
          {notice.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/admin/notices/${notice.id}/edit`}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
            title="Edit Notice"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>

          {notice.status !== 'Published' && (
            <button
              onClick={() => onPublish(notice)}
              disabled={isProcessing}
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
              title="Publish Notice"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {notice.status === 'Published' && (
            <button
              onClick={() => onArchive(notice)}
              disabled={isProcessing}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-40"
              title="Archive Notice"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onDelete(notice)}
            disabled={isProcessing}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-40"
            title="Delete Notice"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function ManageNotices() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Data state
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', notice: null });

  // --- Data fetching ---
  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notices');
      const data = res.data?.data || res.data?.notices || res.data || [];
      setNotices(Array.isArray(data) ? data : []);
      setUsingMockData(false);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err.message);
      setNotices(MOCK_NOTICES);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // --- Filtering & Sorting ---
  const filteredNotices = notices
    .filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || n.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // --- Actions ---
  const handlePublish = (notice) => {
    setConfirmModal({ isOpen: true, type: 'publish', notice });
  };

  const handleArchive = (notice) => {
    setConfirmModal({ isOpen: true, type: 'archive', notice });
  };

  const handleDelete = (notice) => {
    setConfirmModal({ isOpen: true, type: 'delete', notice });
  };

  const handleConfirm = async () => {
    const { type, notice } = confirmModal;
    setConfirmModal({ isOpen: false, type: '', notice: null });
    setIsProcessing(true);

    try {
      if (usingMockData) {
        // Simulate action on mock data
        if (type === 'publish') {
          setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, status: 'Published' } : n));
          addToast('Notice published successfully.', 'success');
        } else if (type === 'archive') {
          setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, status: 'Archived' } : n));
          addToast('Notice archived successfully.', 'success');
        } else if (type === 'delete') {
          setNotices(prev => prev.filter(n => n.id !== notice.id));
          addToast('Notice deleted permanently.', 'success');
        }
      } else {
        if (type === 'publish') {
          await api.patch(`/notices/${notice.id}/publish`);
          addToast('Notice published successfully.', 'success');
        } else if (type === 'archive') {
          await api.patch(`/notices/${notice.id}/archive`);
          addToast('Notice archived successfully.', 'success');
        } else if (type === 'delete') {
          await api.delete(`/notices/${notice.id}`);
          addToast('Notice deleted permanently.', 'success');
        }
        await fetchNotices();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Stats ---
  const stats = {
    total: notices.length,
    published: notices.filter(n => n.status === 'Published').length,
    draft: notices.filter(n => n.status === 'Draft').length,
    archived: notices.filter(n => n.status === 'Archived').length,
  };

  const getConfirmConfig = () => {
    const { type, notice } = confirmModal;
    if (type === 'publish') return {
      title: 'Publish Notice',
      message: `Publish "${notice?.title}"? It will become visible to all residents immediately.`,
      confirmLabel: 'Publish Now',
      confirmClass: 'bg-emerald-600 hover:bg-emerald-700'
    };
    if (type === 'archive') return {
      title: 'Archive Notice',
      message: `Archive "${notice?.title}"? It will be hidden from residents but preserved in records.`,
      confirmLabel: 'Archive',
      confirmClass: 'bg-amber-600 hover:bg-amber-700'
    };
    if (type === 'delete') return {
      title: 'Delete Notice',
      message: `Permanently delete "${notice?.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete Permanently',
      confirmClass: 'bg-red-600 hover:bg-red-700'
    };
    return {};
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setSortOrder('newest');
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
            Notice Management
          </h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Create, publish, archive and manage all society notices and circulars.</p>
          {usingMockData && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
              <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode — API Offline
            </span>
          )}
        </div>
        <Link
          to="/admin/notices/new"
          className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Notice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Notices', value: stats.total, color: 'border-slate-300', text: 'text-slate-700', icon: BookOpen },
          { label: 'Published', value: stats.published, color: 'border-emerald-300', text: 'text-emerald-700', icon: CheckCircle2 },
          { label: 'Drafts', value: stats.draft, color: 'border-blue-300', text: 'text-blue-700', icon: FileText },
          { label: 'Archived', value: stats.archived, color: 'border-amber-300', text: 'text-amber-700', icon: Archive },
        ].map(({ label, value, color, text, icon: Icon }) => (
          <div key={label} className={`bg-white border-l-4 ${color} rounded-lg px-4 py-3 shadow-sm`}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-medium">{label}</p>
              <Icon className={`w-4 h-4 ${text} opacity-60`} />
            </div>
            <p className={`text-2xl font-black mt-1 ${text}`}>{isLoading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notice title..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none bg-slate-50 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-7 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none bg-slate-50 appearance-none cursor-pointer transition"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-7 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none bg-slate-50 appearance-none cursor-pointer transition"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="pl-8 pr-7 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none bg-slate-50 appearance-none cursor-pointer transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchNotices}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-society-primary transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition font-medium"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X className="w-2.5 h-2.5 hover:text-red-500" /></button>
              </span>
            )}
            {categoryFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-society-primary/10 text-society-primary text-[11px] px-2 py-0.5 rounded-full">
                {categoryFilter}
                <button onClick={() => setCategoryFilter('All')}><X className="w-2.5 h-2.5 hover:text-red-500" /></button>
              </span>
            )}
            {statusFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-society-primary/10 text-society-primary text-[11px] px-2 py-0.5 rounded-full">
                {statusFilter}
                <button onClick={() => setStatusFilter('All')}><X className="w-2.5 h-2.5 hover:text-red-500" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Notice Title</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-3/4"></div><div className="h-3 bg-slate-100 rounded w-1/2 mt-2"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded-full w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-100 rounded w-24"></div></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence>
                  {filteredNotices.map((notice) => (
                    <NoticeRow
                      key={notice.id}
                      notice={notice}
                      onPublish={handlePublish}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      isProcessing={isProcessing}
                    />
                  ))}
                </AnimatePresence>
              )}

              {!isLoading && filteredNotices.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">No notices found</p>
                      <p className="text-xs text-slate-400">
                        {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Create your first society notice to get started.'}
                      </p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-society-primary hover:underline">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && filteredNotices.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Showing <span className="font-bold text-slate-600">{filteredNotices.length}</span> of{' '}
              <span className="font-bold text-slate-600">{notices.length}</span> notices
            </p>
            <p className="text-[11px] text-slate-400">
              {stats.published} published · {stats.draft} drafts · {stats.archived} archived
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        {...getConfirmConfig()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: '', notice: null })}
      />
    </div>
  );
}

export default ManageNotices;
