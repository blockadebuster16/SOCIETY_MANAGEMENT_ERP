import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Upload, Search, Filter, Grid3X3, List,
  FileText, FileBadge, FileBarChart, Scale, Building2, BookOpen,
  Download, Archive, Trash2, Eye, Clock, Tag, RefreshCw,
  ChevronDown, X, AlertTriangle, HardDrive, Calendar, User,
  CheckCircle2, Info, ExternalLink, MoreVertical, History, Layers
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',         label: 'All Documents',   icon: FolderOpen,   color: 'text-slate-600',   bg: 'bg-slate-100' },
  { id: 'agm',         label: 'AGM Minutes',      icon: BookOpen,     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  { id: 'sgm',         label: 'SGM Minutes',      icon: BookOpen,     color: 'text-violet-600',  bg: 'bg-violet-50' },
  { id: 'bylaws',      label: 'By-Laws',          icon: Scale,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'building',    label: 'Building Plans',   icon: Building2,    color: 'text-blue-600',    bg: 'bg-blue-50' },
  { id: 'certs',       label: 'Certificates',     icon: FileBadge,    color: 'text-amber-600',   bg: 'bg-amber-50' },
  { id: 'audit',       label: 'Audit Reports',    icon: FileBarChart, color: 'text-red-600',     bg: 'bg-red-50' },
  { id: 'forms',       label: 'NOC & Forms',      icon: FileText,     color: 'text-cyan-600',    bg: 'bg-cyan-50' },
];

const ACCESS_LEVELS = ['All', 'Public', 'Resident', 'Admin'];
const STATUSES = ['All', 'Published', 'Draft', 'Archived'];

const FILE_TYPE_CONFIG = {
  pdf:  { color: 'bg-red-100 text-red-700',    label: 'PDF' },
  docx: { color: 'bg-blue-100 text-blue-700',  label: 'DOCX' },
  doc:  { color: 'bg-blue-100 text-blue-700',  label: 'DOC' },
  xlsx: { color: 'bg-emerald-100 text-emerald-700', label: 'XLSX' },
  jpg:  { color: 'bg-amber-100 text-amber-700', label: 'JPG' },
  png:  { color: 'bg-amber-100 text-amber-700', label: 'PNG' },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DOCS = [
  {
    id: 'doc-001',
    title: 'AGM 2025 — Minutes of Annual General Meeting',
    description: 'Approved minutes of the Annual General Meeting held on 30th March 2025 at the Society Multipurpose Hall.',
    category: 'agm', categoryLabel: 'AGM Minutes',
    fileType: 'pdf', fileSize: '1.2 MB', accessLevel: 'Resident', status: 'Published',
    version: 2, totalVersions: 2,
    uploadedBy: 'Secretary', uploadedAt: '2025-04-05T10:00:00Z',
    updatedAt: '2025-04-12T14:30:00Z',
    downloadCount: 47,
    versions: [
      { version: 1, uploadedBy: 'Secretary', uploadedAt: '2025-04-05T10:00:00Z', note: 'Initial draft upload.' },
      { version: 2, uploadedBy: 'Secretary', uploadedAt: '2025-04-12T14:30:00Z', note: 'Approved final version after member review.' },
    ]
  },
  {
    id: 'doc-002',
    title: 'AGM 2024 — Approved Meeting Minutes',
    description: 'Certified copy of the AGM held on 2nd April 2024. Includes budget approval and committee election results.',
    category: 'agm', categoryLabel: 'AGM Minutes',
    fileType: 'pdf', fileSize: '980 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Society Manager', uploadedAt: '2024-04-10T09:00:00Z',
    updatedAt: '2024-04-10T09:00:00Z',
    downloadCount: 112,
    versions: [
      { version: 1, uploadedBy: 'Society Manager', uploadedAt: '2024-04-10T09:00:00Z', note: 'Initial upload.' },
    ]
  },
  {
    id: 'doc-003',
    title: 'Suyash Pride Housing Society By-Laws (Amended 2023)',
    description: 'Official registered by-laws as amended and ratified by the general body in October 2023 SGM.',
    category: 'bylaws', categoryLabel: 'By-Laws',
    fileType: 'pdf', fileSize: '2.4 MB', accessLevel: 'Public', status: 'Published',
    version: 3, totalVersions: 3,
    uploadedBy: 'Committee Office', uploadedAt: '2023-11-01T08:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    downloadCount: 289,
    versions: [
      { version: 1, uploadedBy: 'Advocate Office', uploadedAt: '2023-10-15T09:00:00Z', note: 'Draft amendment.' },
      { version: 2, uploadedBy: 'Committee Office', uploadedAt: '2023-11-01T08:00:00Z', note: 'General body ratified version.' },
      { version: 3, uploadedBy: 'Committee Office', uploadedAt: '2024-01-15T11:00:00Z', note: 'Corrected minor typos, re-uploaded.' },
    ]
  },
  {
    id: 'doc-004',
    title: 'Society Fire Safety NOC — CIDCO 2024',
    description: 'No Objection Certificate from CIDCO Fire Department valid for year 2024-25. Required for insurance renewal.',
    category: 'certs', categoryLabel: 'Certificates',
    fileType: 'pdf', fileSize: '540 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Society Manager', uploadedAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-07-01T10:00:00Z',
    downloadCount: 34,
    versions: [
      { version: 1, uploadedBy: 'Society Manager', uploadedAt: '2024-07-01T10:00:00Z', note: 'Certificate received from CIDCO.' },
    ]
  },
  {
    id: 'doc-005',
    title: 'Annual Statutory Audit Report FY 2024-25',
    description: 'Audited financial statement for FY 2024-25, certified by CA Suresh Mehta & Associates.',
    category: 'audit', categoryLabel: 'Audit Reports',
    fileType: 'pdf', fileSize: '3.1 MB', accessLevel: 'Admin', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Treasurer', uploadedAt: '2025-06-01T14:00:00Z',
    updatedAt: '2025-06-01T14:00:00Z',
    downloadCount: 12,
    versions: [
      { version: 1, uploadedBy: 'Treasurer', uploadedAt: '2025-06-01T14:00:00Z', note: 'Final signed audit report.' },
    ]
  },
  {
    id: 'doc-006',
    title: 'Building Wing A — Structural Stability Certificate',
    description: 'Structural stability certificate issued by licensed structural engineer for Wing A.',
    category: 'building', categoryLabel: 'Building Plans',
    fileType: 'pdf', fileSize: '1.8 MB', accessLevel: 'Admin', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Society Manager', uploadedAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    downloadCount: 8,
    versions: [
      { version: 1, uploadedBy: 'Society Manager', uploadedAt: '2024-03-15T10:00:00Z', note: 'Engineer-certified report upload.' },
    ]
  },
  {
    id: 'doc-007',
    title: 'SGM September 2024 — Emergency Meeting Minutes',
    description: 'Minutes of the Special General Meeting called for discussing water supply infrastructure upgrade.',
    category: 'sgm', categoryLabel: 'SGM Minutes',
    fileType: 'pdf', fileSize: '720 KB', accessLevel: 'Resident', status: 'Published',
    version: 1, totalVersions: 1,
    uploadedBy: 'Secretary', uploadedAt: '2024-09-20T16:00:00Z',
    updatedAt: '2024-09-20T16:00:00Z',
    downloadCount: 63,
    versions: [
      { version: 1, uploadedBy: 'Secretary', uploadedAt: '2024-09-20T16:00:00Z', note: 'Minutes circulated to all members.' },
    ]
  },
  {
    id: 'doc-008',
    title: 'NOC Application Form — Flat Resale',
    description: 'Official format to apply for society No Objection Certificate for resale of flat or shop units.',
    category: 'forms', categoryLabel: 'NOC & Forms',
    fileType: 'docx', fileSize: '145 KB', accessLevel: 'Public', status: 'Published',
    version: 2, totalVersions: 2,
    uploadedBy: 'Committee Office', uploadedAt: '2024-01-10T09:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    downloadCount: 178,
    versions: [
      { version: 1, uploadedBy: 'Committee Office', uploadedAt: '2024-01-10T09:00:00Z', note: 'Original format.' },
      { version: 2, uploadedBy: 'Committee Office', uploadedAt: '2026-01-15T11:00:00Z', note: 'Updated with RERA requirements.' },
    ]
  },
  {
    id: 'doc-009',
    title: 'Budget Proposal Draft FY 2025-26',
    description: 'Committee draft of maintenance charges and capex budget for the upcoming financial year.',
    category: 'audit', categoryLabel: 'Audit Reports',
    fileType: 'xlsx', fileSize: '890 KB', accessLevel: 'Admin', status: 'Draft',
    version: 1, totalVersions: 1,
    uploadedBy: 'Treasurer', uploadedAt: '2025-05-20T11:00:00Z',
    updatedAt: '2025-05-20T11:00:00Z',
    downloadCount: 3,
    versions: [
      { version: 1, uploadedBy: 'Treasurer', uploadedAt: '2025-05-20T11:00:00Z', note: 'Draft for committee review.' },
    ]
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function FileTypeBadge({ type }) {
  const cfg = FILE_TYPE_CONFIG[type?.toLowerCase()] || { color: 'bg-slate-100 text-slate-600', label: (type || 'FILE').toUpperCase() };
  return (
    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function AccessBadge({ level }) {
  const config = {
    Public:   'bg-emerald-100 text-emerald-700',
    Resident: 'bg-blue-100 text-blue-700',
    Admin:    'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config[level] || 'bg-slate-100 text-slate-600'}`}>
      {level}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = {
    Published: 'bg-emerald-100 text-emerald-700',
    Draft:     'bg-slate-100 text-slate-600',
    Archived:  'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

function CategoryIcon({ categoryId, className = 'w-5 h-5' }) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const Icon = cat?.icon || FolderOpen;
  return <Icon className={`${className} ${cat?.color || 'text-slate-500'}`} />;
}

function ConfirmModal({ isOpen, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
          onClick={e => e.stopPropagation()}
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
            <button onClick={onCancel} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={onConfirm} className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition ${confirmClass || 'bg-red-600 hover:bg-red-700'}`}>{confirmLabel}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Document Viewer Modal ────────────────────────────────────────────────────

function DocumentViewer({ doc, onClose }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const cat = CATEGORIES.find(c => c.id === doc.category);

  const handleDownload = () => {
    addToast(`Downloading "${doc.title}"...`, 'success');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-5 ${cat?.bg || 'bg-slate-50'} border-b border-slate-200`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${cat?.bg || 'bg-slate-100'} border border-white/60 flex items-center justify-center shrink-0 shadow-sm`}>
                <CategoryIcon categoryId={doc.category} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{doc.categoryLabel}</span>
                  <FileTypeBadge type={doc.fileType} />
                  <StatusBadge status={doc.status} />
                </div>
                <h2 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{doc.title}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 text-slate-500 transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {[
                { id: 'details', label: 'Details', icon: Info },
                { id: 'versions', label: `Versions (${doc.totalVersions})`, icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === tab.id ? 'bg-white text-society-primary shadow-sm' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">{doc.description}</p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: HardDrive, label: 'File Size', value: doc.fileSize },
                    { icon: Tag, label: 'Access Level', value: doc.accessLevel },
                    { icon: User, label: 'Uploaded By', value: doc.uploadedBy },
                    { icon: Calendar, label: 'Uploaded On', value: new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    { icon: Clock, label: 'Last Updated', value: new Date(doc.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    { icon: Download, label: 'Downloads', value: doc.downloadCount },
                    { icon: Layers, label: 'Version', value: `v${doc.version} of ${doc.totalVersions}` },
                    { icon: CheckCircle2, label: 'Status', value: doc.status },
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

                {/* PDF Preview placeholder */}
                <div className="bg-slate-100 rounded-xl h-40 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-xs text-slate-400 font-medium">Document preview requires Supabase Storage URL</p>
                  <a href="#" target="_blank" className="text-xs text-society-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-4">
                  Uploading a new file to this document creates a new version, preserving history.
                </p>
                {doc.versions.slice().reverse().map((ver, idx) => (
                  <motion.div
                    key={ver.version}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${ver.version === doc.version ? 'border-society-primary/30 bg-society-primary/5' : 'border-slate-100 bg-slate-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${ver.version === doc.version ? 'bg-society-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                      v{ver.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">
                          Version {ver.version}
                          {ver.version === doc.version && <span className="ml-1.5 text-[10px] text-emerald-600 font-bold">• Current</span>}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ver.note}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" />{ver.uploadedBy}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(ver.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { addToast(`Downloading v${ver.version}...`, 'success'); }}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                      title={`Download version ${ver.version}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-sm hover:shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Download Latest (v{doc.version})
            </button>
            <Link
              to={`/admin/documents/upload?replace=${doc.id}`}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New Version
            </Link>
            <button onClick={onClose} className="ml-auto text-xs text-slate-500 hover:text-slate-700 transition">Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Document Card (Grid View) ────────────────────────────────────────────────

function DocumentCard({ doc, onView, onDownload, onArchive, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = CATEGORIES.find(c => c.id === doc.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
    >
      {/* Card Top — Category color strip */}
      <div className={`h-1.5 w-full ${cat?.bg?.replace('bg-', 'bg-').replace('-50', '-400') || 'bg-slate-200'}`} />

      <div className="p-4 space-y-3">
        {/* Icon + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className={`w-10 h-10 rounded-xl ${cat?.bg || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
            <CategoryIcon categoryId={doc.category} className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1 relative">
            <FileTypeBadge type={doc.fileType} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute top-7 right-0 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button onClick={() => { setMenuOpen(false); onView(doc); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition">
                    <Eye className="w-3.5 h-3.5 text-blue-500" /> View Details
                  </button>
                  <button onClick={() => { setMenuOpen(false); onDownload(doc); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition">
                    <Download className="w-3.5 h-3.5 text-emerald-500" /> Download
                  </button>
                  <button onClick={() => { setMenuOpen(false); onArchive(doc); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-amber-700 hover:bg-amber-50 transition">
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button onClick={() => { setMenuOpen(false); onDelete(doc); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title & description */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-society-primary transition-colors">
            {doc.title}
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{doc.description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={doc.status} />
          <AccessBadge level={doc.accessLevel} />
          {doc.totalVersions > 1 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5" /> v{doc.version}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1"><HardDrive className="w-2.5 h-2.5" />{doc.fileSize}</span>
          <span className="flex items-center gap-1"><Download className="w-2.5 h-2.5" />{doc.downloadCount}</span>
          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-t border-slate-100 flex">
        <button
          onClick={() => onView(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-society-primary transition"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <div className="w-px bg-slate-100" />
        <button
          onClick={() => onDownload(doc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </motion.div>
  );
}

// ─── Document Row (List View) ─────────────────────────────────────────────────

function DocumentListRow({ doc, onView, onDownload, onArchive, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="hover:bg-slate-50/80 transition-colors group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${CATEGORIES.find(c => c.id === doc.category)?.bg || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
            <CategoryIcon categoryId={doc.category} className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-society-primary transition-colors leading-tight line-clamp-1">{doc.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <User className="w-2.5 h-2.5" />{doc.uploadedBy} &nbsp;·&nbsp;
              <Calendar className="w-2.5 h-2.5" />{new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-xs text-slate-600">{doc.categoryLabel}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <FileTypeBadge type={doc.fileType} />
          {doc.totalVersions > 1 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Layers className="w-2.5 h-2.5" /> v{doc.version}
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-5 py-3.5">
        <AccessBadge level={doc.accessLevel} />
      </td>
      <td className="px-5 py-3.5 text-[11px] text-slate-500">{doc.fileSize}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(doc)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDownload(doc)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" title="Download">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onArchive(doc)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition" title="Archive">
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ManageDocuments() {
  const { addToast } = useToast();

  const [docs, setDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [viewerDoc, setViewerDoc] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', doc: null });
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Fetch
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/documents');
      const data = res.data?.data || res.data?.documents || res.data || [];
      setDocs(Array.isArray(data) ? data : []);
      setUsingMockData(false);
    } catch {
      setDocs(MOCK_DOCS);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── Filter + Sort
  const filtered = useMemo(() => {
    return docs
      .filter(d => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
        const matchCat = activeCategory === 'all' || d.category === activeCategory;
        const matchStatus = statusFilter === 'All' || d.status === statusFilter;
        const matchAccess = accessFilter === 'All' || d.accessLevel === accessFilter;
        return matchSearch && matchCat && matchStatus && matchAccess;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
        return 0;
      });
  }, [docs, searchQuery, activeCategory, statusFilter, accessFilter, sortBy]);

  // ── Stats
  const stats = useMemo(() => ({
    total: docs.length,
    published: docs.filter(d => d.status === 'Published').length,
    draft: docs.filter(d => d.status === 'Draft').length,
    archived: docs.filter(d => d.status === 'Archived').length,
  }), [docs]);

  // ── Category counts
  const catCounts = useMemo(() => {
    const counts = {};
    docs.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return counts;
  }, [docs]);

  // ── Actions
  const handleDownload = (doc) => {
    addToast(`Downloading "${doc.title}"...`, 'success');
  };

  const handleArchive = (doc) => setConfirmModal({ isOpen: true, type: 'archive', doc });
  const handleDelete = (doc) => setConfirmModal({ isOpen: true, type: 'delete', doc });

  const handleConfirm = async () => {
    const { type, doc } = confirmModal;
    setConfirmModal({ isOpen: false, type: '', doc: null });
    setIsProcessing(true);
    try {
      if (usingMockData) {
        if (type === 'archive') {
          setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'Archived' } : d));
          addToast('Document archived.', 'success');
        } else if (type === 'delete') {
          setDocs(prev => prev.filter(d => d.id !== doc.id));
          addToast('Document deleted permanently.', 'success');
        }
      } else {
        if (type === 'archive') {
          await api.patch(`/documents/${doc.id}/archive`);
          addToast('Document archived.', 'success');
        } else if (type === 'delete') {
          await api.delete(`/documents/${doc.id}`);
          addToast('Document deleted permanently.', 'success');
        }
        await fetchDocuments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('All'); setAccessFilter('All'); setSortBy('newest'); };
  const hasActiveFilters = searchQuery || statusFilter !== 'All' || accessFilter !== 'All';

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Sidebar Category Explorer */}
      <aside className="w-52 shrink-0 space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Categories</p>
        {CATEGORIES.map(cat => {
          const count = cat.id === 'all' ? docs.length : (catCounts[cat.id] || 0);
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-society-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <cat.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : cat.color}`} />
              <span className="flex-1 text-left truncate">{cat.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Stats cards */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Repository</p>
          {[
            { label: 'Published', count: stats.published, color: 'text-emerald-600' },
            { label: 'Drafts', count: stats.draft, color: 'text-blue-600' },
            { label: 'Archived', count: stats.archived, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg">
              <span className="text-[11px] text-slate-500">{s.label}</span>
              <span className={`text-xs font-black ${s.color}`}>{s.count}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
              Document Repository
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Official records, minutes, certificates and regulatory documents.
              {usingMockData && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchDocuments} disabled={isLoading} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-society-primary hover:bg-slate-50 transition">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/documents/upload"
              className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm hover:shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none bg-slate-50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Status */}
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none cursor-pointer focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                {STATUSES.map(s => <option key={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Access */}
            <div className="relative">
              <select value={accessFilter} onChange={e => setAccessFilter(e.target.value)} className="pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none cursor-pointer focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                {ACCESS_LEVELS.map(a => <option key={a}>{a === 'All' ? 'All Access' : a}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 appearance-none cursor-pointer focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A–Z</option>
                <option value="downloads">Most Downloaded</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden ml-auto">
              {[
                { mode: 'grid', Icon: Grid3X3 },
                { mode: 'list', Icon: List },
              ].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 transition ${viewMode === mode ? 'bg-society-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition font-medium">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Result count */}
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Showing <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-slate-600">{docs.length}</span> documents
              {activeCategory !== 'all' && (
                <> in <span className="font-bold text-society-primary">{CATEGORIES.find(c => c.id === activeCategory)?.label}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Document Grid / List */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mt-2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-600">No documents found</p>
              <p className="text-xs text-slate-400 mt-1">
                {hasActiveFilters ? 'Try adjusting your filters.' : 'Upload the first document to this repository.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-society-primary hover:underline">Clear all filters</button>
            )}
            <Link to="/admin/documents/upload" className="inline-flex items-center gap-2 bg-society-primary text-white font-bold px-5 py-2.5 rounded-lg text-xs transition">
              <Upload className="w-3.5 h-3.5" /> Upload First Document
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={setViewerDoc}
                  onDownload={handleDownload}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Document', 'Category', 'Format / Version', 'Status', 'Access', 'Size', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filtered.map(doc => (
                      <DocumentListRow
                        key={doc.id}
                        doc={doc}
                        onView={setViewerDoc}
                        onDownload={handleDownload}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Document Viewer Modal */}
      <AnimatePresence>
        {viewerDoc && <DocumentViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />}
      </AnimatePresence>

      {/* ── Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'archive' ? 'Archive Document' : 'Delete Document'}
        message={
          confirmModal.type === 'archive'
            ? `Archive "${confirmModal.doc?.title}"? It will be hidden from residents but preserved in records.`
            : `Permanently delete "${confirmModal.doc?.title}"? All versions will be lost. This cannot be undone.`
        }
        confirmLabel={confirmModal.type === 'archive' ? 'Archive' : 'Delete Permanently'}
        confirmClass={confirmModal.type === 'archive' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: '', doc: null })}
      />
    </div>
  );
}

export default ManageDocuments;
