import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FileText, Download, Search, Filter, Tag,
  Calendar, HardDrive, User, ChevronDown, X, RefreshCw,
  BookOpen, Scale, Building2, FileBadge, FileBarChart,
  Eye, Layers, CheckCircle2, AlertTriangle, Info, History, Lock
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',      label: 'All Documents',  icon: FolderOpen,   color: 'text-slate-500',   bg: 'bg-slate-100' },
  { id: 'agm',      label: 'AGM Minutes',    icon: BookOpen,     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  { id: 'sgm',      label: 'SGM Minutes',    icon: BookOpen,     color: 'text-violet-600',  bg: 'bg-violet-50' },
  { id: 'bylaws',   label: 'By-Laws',        icon: Scale,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'building', label: 'Building Plans', icon: Building2,    color: 'text-blue-600',    bg: 'bg-blue-50' },
  { id: 'certs',    label: 'Certificates',   icon: FileBadge,    color: 'text-amber-600',   bg: 'bg-amber-50' },
  { id: 'audit',    label: 'Audit Reports',  icon: FileBarChart, color: 'text-red-600',     bg: 'bg-red-50' },
  { id: 'forms',    label: 'NOC & Forms',    icon: FileText,     color: 'text-cyan-600',    bg: 'bg-cyan-50' },
];

const FILE_TYPE_CONFIG = {
  pdf:  { color: 'bg-red-100 text-red-700',    label: 'PDF' },
  docx: { color: 'bg-blue-100 text-blue-700',  label: 'DOCX' },
  doc:  { color: 'bg-blue-100 text-blue-700',  label: 'DOC' },
  xlsx: { color: 'bg-emerald-100 text-emerald-700', label: 'XLSX' },
  jpg:  { color: 'bg-amber-100 text-amber-700', label: 'JPG' },
  png:  { color: 'bg-amber-100 text-amber-700', label: 'PNG' },
};

// ─── Mock data (resident-visible — Published only) ────────────────────────────

const MOCK_DOCS = [
  {
    id: 'doc-001', title: 'AGM 2025 — Minutes of Annual General Meeting',
    description: 'Approved minutes of the Annual General Meeting held on 30th March 2025.',
    category: 'agm', categoryLabel: 'AGM Minutes',
    fileType: 'pdf', fileSize: '1.2 MB', accessLevel: 'Resident', status: 'Published',
    version: 2, totalVersions: 2,
    uploadedBy: 'Secretary', uploadedAt: '2025-04-05T10:00:00Z',
    downloadCount: 47,
  },
  {
    id: 'doc-002', title: 'AGM 2024 — Approved Meeting Minutes',
    description: 'Certified copy of the AGM held on 2nd April 2024.',
    category: 'agm', categoryLabel: 'AGM Minutes',
    fileType: 'pdf', fileSize: '980 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Society Manager', uploadedAt: '2024-04-10T09:00:00Z',
    downloadCount: 112,
  },
  {
    id: 'doc-003', title: 'Suyash Pride Housing Society By-Laws (Amended 2023)',
    description: 'Official registered by-laws as amended and ratified by the general body.',
    category: 'bylaws', categoryLabel: 'By-Laws',
    fileType: 'pdf', fileSize: '2.4 MB', accessLevel: 'Public', status: 'Published',
    version: 3, totalVersions: 3,
    uploadedBy: 'Committee Office', uploadedAt: '2023-11-01T08:00:00Z',
    downloadCount: 289,
  },
  {
    id: 'doc-004', title: 'Society Fire Safety NOC — CIDCO 2024',
    description: 'No Objection Certificate from CIDCO Fire Department valid for 2024-25.',
    category: 'certs', categoryLabel: 'Certificates',
    fileType: 'pdf', fileSize: '540 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Society Manager', uploadedAt: '2024-07-01T10:00:00Z',
    downloadCount: 34,
  },
  {
    id: 'doc-007', title: 'SGM September 2024 — Emergency Meeting Minutes',
    description: 'Minutes of the Special General Meeting for water supply infrastructure upgrade.',
    category: 'sgm', categoryLabel: 'SGM Minutes',
    fileType: 'pdf', fileSize: '720 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Secretary', uploadedAt: '2024-09-20T16:00:00Z',
    downloadCount: 63,
  },
  {
    id: 'doc-008', title: 'NOC Application Form — Flat Resale',
    description: 'Official format to apply for society No Objection Certificate for property resale.',
    category: 'forms', categoryLabel: 'NOC & Forms',
    fileType: 'docx', fileSize: '145 KB', accessLevel: 'Public', status: 'Published',
    version: 2, totalVersions: 2,
    uploadedBy: 'Committee Office', uploadedAt: '2024-01-10T09:00:00Z',
    downloadCount: 178,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileTypeBadge({ type }) {
  const cfg = FILE_TYPE_CONFIG[type?.toLowerCase()] || { color: 'bg-slate-100 text-slate-600', label: (type || 'FILE').toUpperCase() };
  return <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>;
}

function CategoryIcon({ id, className = 'w-5 h-5' }) {
  const cat = CATEGORIES.find(c => c.id === id);
  const Icon = cat?.icon || FolderOpen;
  return <Icon className={`${className} ${cat?.color || 'text-slate-400'}`} />;
}

// ─── Document Viewer Modal ────────────────────────────────────────────────────

function DocumentViewer({ doc, onClose, onDownload }) {
  const cat = CATEGORIES.find(c => c.id === doc.category);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 ${cat?.bg || 'bg-slate-50'} border-b border-slate-200`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${cat?.bg || 'bg-slate-100'} border border-white/60 flex items-center justify-center shrink-0 shadow-sm`}>
              <CategoryIcon id={doc.category} className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{doc.categoryLabel}</span>
                <FileTypeBadge type={doc.fileType} />
                {doc.totalVersions > 1 && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5" />v{doc.version}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 text-slate-500 transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">{doc.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: HardDrive,  label: 'File Size',    value: doc.fileSize },
              { icon: Tag,        label: 'Access Level', value: doc.accessLevel },
              { icon: User,       label: 'Uploaded By',  value: doc.uploadedBy },
              { icon: Calendar,   label: 'Upload Date',  value: new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { icon: Download,   label: 'Downloads',    value: doc.downloadCount },
              { icon: Layers,     label: 'Version',      value: `v${doc.version} of ${doc.totalVersions}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3 flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview placeholder */}
          <div className="bg-slate-100 rounded-xl h-36 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300" />
            <p className="text-xs text-slate-400">Document preview available after download</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <button
            onClick={() => { onDownload(doc); onClose(); }}
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-sm hover:shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Download (v{doc.version})
          </button>
          <button onClick={onClose} className="ml-auto text-xs text-slate-500 hover:text-slate-700 transition">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocumentCard({ doc, onView, onDownload }) {
  const cat = CATEGORIES.find(c => c.id === doc.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${cat?.bg || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
            <CategoryIcon id={doc.category} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{doc.categoryLabel}</span>
              <FileTypeBadge type={doc.fileType} />
              {doc.totalVersions > 1 && (
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Layers className="w-2.5 h-2.5" />v{doc.version}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-society-primary transition-colors line-clamp-2">
              {doc.title}
            </h4>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{doc.description}</p>

        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><HardDrive className="w-2.5 h-2.5" />{doc.fileSize}</span>
          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{doc.downloadCount} downloads</span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-2.5 h-2.5" />
            {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 flex">
        <button
          onClick={() => onView(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-society-primary transition"
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <div className="w-px bg-slate-100" />
        <button
          onClick={() => onDownload(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-[#D4AF37]/10 hover:text-amber-700 transition"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Documents() {
  const { addToast } = useToast();

  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewerDoc, setViewerDoc] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/documents');
      const data = res.data?.data || res.data?.documents || res.data || [];
      setDocs((Array.isArray(data) ? data : []).filter(d => d.status === 'Published'));
      setUsingMockData(false);
    } catch {
      setDocs(MOCK_DOCS);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filtered = useMemo(() => {
    return docs
      .filter(d => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
        const matchCat = activeCategory === 'all' || d.category === activeCategory;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
        return 0;
      });
  }, [docs, searchQuery, activeCategory, sortBy]);

  const catCounts = useMemo(() => {
    const c = {};
    docs.forEach(d => { c[d.category] = (c[d.category] || 0) + 1; });
    return c;
  }, [docs]);

  const handleDownload = (doc) => {
    addToast(`Downloading "${doc.title}"...`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            Society Document Repository
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Official records, AGM minutes, by-laws, certificates, and society documents.
            {usingMockData && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          disabled={isLoading}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-society-primary hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const count = cat.id === 'all' ? docs.length : (catCounts[cat.id] || 0);
          const isActive = activeCategory === cat.id;
          if (cat.id !== 'all' && count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-society-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <cat.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
              {cat.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="pl-3 pr-7 py-2.5 border border-slate-200 rounded-xl text-xs bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A–Z</option>
            <option value="downloads">Most Downloaded</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        <p className="text-[11px] text-slate-400 shrink-0">
          {filtered.length} document{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center gap-4 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-600">No documents found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'No documents match your search query.' : 'No documents in this category yet.'}
            </p>
          </div>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-xs text-society-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onView={setViewerDoc}
                onDownload={handleDownload}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Admin-only notice */}
      <div className="flex items-start gap-2.5 p-3.5 bg-purple-50 border border-purple-100 rounded-xl">
        <Lock className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-purple-700 leading-relaxed">
          Some documents (e.g., audit reports, structural certificates) are restricted to committee members only and are not shown here. Contact the society office for access.
        </p>
      </div>

      {/* Document Viewer */}
      <AnimatePresence>
        {viewerDoc && (
          <DocumentViewer
            doc={viewerDoc}
            onClose={() => setViewerDoc(null)}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Documents;
