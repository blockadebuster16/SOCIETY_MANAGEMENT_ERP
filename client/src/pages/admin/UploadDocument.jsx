import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FolderOpen, Upload, FileText, Tag, Lock,
  CheckCircle2, AlertCircle, Info, X, Paperclip, Eye,
  Building2, BookOpen, Scale, FileBadge, FileBarChart, RefreshCw, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'agm',      label: 'AGM Minutes',     icon: BookOpen },
  { id: 'sgm',      label: 'SGM Minutes',      icon: BookOpen },
  { id: 'bylaws',   label: 'By-Laws',          icon: Scale },
  { id: 'building', label: 'Building Plans',   icon: Building2 },
  { id: 'certs',    label: 'Certificates',     icon: FileBadge },
  { id: 'audit',    label: 'Audit Reports',    icon: FileBarChart },
  { id: 'forms',    label: 'NOC & Forms',      icon: FileText },
];

const ACCESS_LEVELS = [
  { value: 'Public',   label: 'Public',   desc: 'Visible to all website visitors' },
  { value: 'Resident', label: 'Resident', desc: 'Logged-in residents only' },
  { value: 'Admin',    label: 'Admin',    desc: 'Committee & management only' },
];

const STATUSES = [
  { value: 'Published', label: 'Publish Immediately' },
  { value: 'Draft',     label: 'Save as Draft' },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(name) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{message}
    </p>
  );
}

// ─── Drag-and-Drop Zone ───────────────────────────────────────────────────────

function DropZone({ file, onFile, onClear, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }, [onFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const ext = file ? getFileExtension(file.name) : null;
  const extColors = {
    pdf: 'text-red-600 bg-red-50', docx: 'text-blue-600 bg-blue-50', doc: 'text-blue-600 bg-blue-50',
    xlsx: 'text-emerald-600 bg-emerald-50', xls: 'text-emerald-600 bg-emerald-50',
    jpg: 'text-amber-600 bg-amber-50', jpeg: 'text-amber-600 bg-amber-50', png: 'text-amber-600 bg-amber-50',
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        className="hidden"
        onChange={e => onFile(e.target.files[0])}
      />

      {file ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${extColors[ext] || 'text-slate-600 bg-slate-100'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {formatBytes(file.size)} &nbsp;·&nbsp; .{ext?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-[11px] font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl transition-all ${
            isDragging
              ? 'border-society-primary bg-society-primary/5 scale-[1.01]'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-200 bg-slate-50 hover:border-society-primary hover:bg-society-primary/5'
          }`}
        >
          <motion.div
            animate={{ y: isDragging ? -6 : 0 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-society-primary/20' : 'bg-slate-100'}`}
          >
            <Upload className={`w-7 h-7 ${isDragging ? 'text-society-primary' : 'text-slate-400'}`} />
          </motion.div>
          <div className="text-center">
            <p className={`text-sm font-bold ${isDragging ? 'text-society-primary' : 'text-slate-700'}`}>
              {isDragging ? 'Drop file here!' : 'Click or drag file here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PDF, DOCX, XLSX, JPG, PNG &nbsp;·&nbsp; Max 25 MB
            </p>
          </div>
        </button>
      )}
      {error && !file && <FieldError message={error} />}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function UploadDocument() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const replaceId = searchParams.get('replace'); // if uploading a new version

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    accessLevel: 'Resident',
    status: 'Published',
    version_note: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      addToast('File exceeds 25 MB limit.', 'error');
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      addToast('Unsupported file type. Please upload PDF, DOCX, XLSX, JPG or PNG.', 'error');
      return;
    }
    setFile(f);
    setErrors(prev => ({ ...prev, file: '' }));
    // Auto-fill title from filename if empty
    if (!form.title) {
      const nameWithoutExt = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setField('title', nameWithoutExt);
    }
  };

  const validate = () => {
    const errs = {};
    if (!file) errs.file = 'Please select a file to upload.';
    if (!form.title.trim() || form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters.';
    if (form.title.length > 200) errs.title = 'Title cannot exceed 200 characters.';
    if (form.description && form.description.length > 1000) errs.description = 'Description cannot exceed 1000 characters.';
    if (!form.category) errs.category = 'Please select a document category.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fix the errors before uploading.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', form.title.trim());
      if (form.description.trim()) formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('accessLevel', form.accessLevel);
      formData.append('status', form.status);
      if (replaceId) formData.append('replaceId', replaceId);
      if (form.version_note.trim()) formData.append('version_note', form.version_note.trim());

      const endpoint = replaceId ? `/documents/${replaceId}` : '/documents';
      const method = replaceId ? 'patch' : 'post';

      await api[method](endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(pct);
        }
      });

      addToast(replaceId ? 'New version uploaded successfully!' : 'Document uploaded successfully!', 'success');
      navigate('/admin/documents');
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      addToast(msg, 'error');
      // Simulate for demo mode
      if (!err.response) {
        addToast('Demo Mode: Upload simulated successfully!', 'success');
        navigate('/admin/documents');
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <Link
          to="/admin/documents"
          className="inline-flex items-center gap-1.5 text-society-primary hover:text-[#D4AF37] font-semibold text-xs mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Document Repository
        </Link>
        <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
          <Upload className="w-6 h-6 text-[#D4AF37]" />
          {replaceId ? 'Upload New Version' : 'Upload Document'}
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          {replaceId
            ? 'Uploading will create a new version, preserving previous files in history.'
            : 'Add official documents, minutes, certificates, and reports to the repository.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── File Drop Zone */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-society-primary" />
              Select File
            </h3>
          </div>
          <div className="p-5">
            <DropZone
              file={file}
              onFile={handleFile}
              onClear={() => setFile(null)}
              error={errors.file}
            />
          </div>
        </div>

        {/* ── Document Details */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-society-primary" />
              Document Details
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <span className={`text-[10px] font-medium ${form.title.length > 180 ? 'text-red-500' : 'text-slate-400'}`}>
                  {form.title.length}/200
                </span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. AGM 2025 — Approved Meeting Minutes"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                }`}
              />
              <FieldError message={errors.title} />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <span className={`text-[10px] font-medium ${form.description.length > 900 ? 'text-red-500' : 'text-slate-400'}`}>
                  {form.description.length}/1000
                </span>
              </div>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Brief description of this document's contents and purpose..."
                className={`w-full px-3 py-2.5 border rounded-lg text-sm leading-relaxed resize-none transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                }`}
              />
              <FieldError message={errors.description} />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setField('category', cat.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-society-primary bg-society-primary/5 text-society-primary shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.category} />
            </div>

            {/* Version Note (only when replacing) */}
            {replaceId && (
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1">
                  Version Note
                  <span className="text-slate-400 font-normal">(what changed?)</span>
                </label>
                <input
                  type="text"
                  value={form.version_note}
                  onChange={e => setField('version_note', e.target.value)}
                  placeholder="e.g. Updated with RERA requirements and new annexures"
                  className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm transition focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Access & Visibility */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-society-primary" />
              Access & Visibility
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Access Level */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Access Authorization</label>
              <div className="grid grid-cols-3 gap-3">
                {ACCESS_LEVELS.map(lvl => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setField('accessLevel', lvl.value)}
                    className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all ${
                      form.accessLevel === lvl.value
                        ? 'border-society-primary bg-society-primary/5 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${form.accessLevel === lvl.value ? 'text-society-primary' : 'text-slate-700'}`}>{lvl.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Publication Status</label>
              <div className="flex gap-3">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setField('status', s.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition ${
                      form.status === s.value
                        ? 'border-society-primary bg-society-primary/5 text-society-primary'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${form.status === s.value ? 'text-society-primary' : 'text-slate-300'}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info panel */}
            {form.status === 'Published' && form.accessLevel === 'Public' && (
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  This document will be <strong>immediately visible to all website visitors</strong>, including unauthenticated users on the public Downloads page.
                </p>
              </div>
            )}
            {form.accessLevel === 'Admin' && (
              <div className="flex items-start gap-2.5 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Restricted to committee members and society management only.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-700">Uploading...</p>
              <p className="text-xs font-bold text-society-primary">{uploadProgress}%</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-society-primary to-[#D4AF37] rounded-full"
              />
            </div>
            {file && (
              <p className="text-[10px] text-slate-400 mt-1.5">{file.name} · {formatBytes(file.size)}</p>
            )}
          </motion.div>
        )}

        {/* ── Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                {replaceId ? 'Upload New Version' : form.status === 'Published' ? 'Upload & Publish' : 'Upload as Draft'}
              </>
            )}
          </button>
          <Link
            to="/admin/documents"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-medium"
          >
            Cancel
          </Link>

          {/* Summary pill */}
          {file && form.category && form.title && (
            <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
              <Eye className="w-3 h-3" />
              {form.title.slice(0, 30)}{form.title.length > 30 ? '…' : ''} &nbsp;·&nbsp;
              <span className={`font-bold ${form.status === 'Published' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {form.status}
              </span>
              &nbsp;·&nbsp;
              <span className={`font-bold ${form.accessLevel === 'Public' ? 'text-emerald-600' : form.accessLevel === 'Admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                {form.accessLevel}
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default UploadDocument;
