import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bell, FileText, Tag, CheckCircle2,
  Upload, X, Paperclip, Eye, Save, AlertCircle, Info,
  RefreshCw, Loader2, Archive, Send, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'General', 'Maintenance', 'Emergency', 'AGM', 'SGM',
  'Festival', 'Security', 'Parking', 'Water Supply', 'Lift Maintenance'
];

const STATUSES = ['Draft', 'Published', 'Scheduled', 'Archived'];

const CHAR_LIMITS = { title: 200, content: 5000 };

// Mock notices for when API is offline
const MOCK_NOTICES = {
  'n-001': {
    id: 'n-001',
    title: 'AGM 2025 — Annual General Meeting Notice',
    content: 'All members are cordially invited to attend the Annual General Meeting of Suyash Pride Housing Society Ltd. to be held on Sunday, March 30, 2025 at 10:00 AM in the Society Multipurpose Hall, Ground Floor.',
    category: 'AGM',
    status: 'Published',
    is_pinned: true,
    scheduled_at: null,
    attachment_url: null,
    created_at: '2026-06-01T10:00:00Z',
    created_by_name: 'Secretary',
  },
  'n-006': {
    id: 'n-006',
    title: 'New Visitor Security Protocol — Effective July 2026',
    content: 'The committee has proposed new visitor management guidelines. All guests must be pre-registered via the society app at least 2 hours before arrival.',
    category: 'Security',
    status: 'Draft',
    is_pinned: false,
    scheduled_at: null,
    attachment_url: null,
    created_at: '2026-06-13T16:00:00Z',
    created_by_name: 'Security Manager',
  },
};

function FieldLabel({ label, required, hint }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
  );
}

function CharCounter({ current, max }) {
  const pct = current / max;
  const color = pct > 0.9 ? 'text-red-500' : pct > 0.7 ? 'text-amber-500' : 'text-slate-400';
  return <span className={`text-[10px] font-medium ${color}`}>{current}/{max}</span>;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{message}
    </p>
  );
}

function StatusBadge({ status }) {
  const config = {
    Published: 'bg-emerald-100 text-emerald-700',
    Draft: 'bg-slate-100 text-slate-600',
    Archived: 'bg-amber-100 text-amber-700',
    Scheduled: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${config[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

function EditNotice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef(null);

  // Loading/data state
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [originalNotice, setOriginalNotice] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    status: 'Draft',
    is_pinned: false,
    scheduled_at: '',
  });
  const [errors, setErrors] = useState({});
  const [newAttachment, setNewAttachment] = useState(null); // new file to upload
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- Fetch notice data ---
  useEffect(() => {
    const fetchNotice = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const res = await api.get(`/notices/${id}`);
        const notice = res.data?.data || res.data?.notice || res.data;
        setOriginalNotice(notice);
        setForm({
          title: notice.title || '',
          content: notice.content || '',
          category: notice.category || '',
          status: notice.status || 'Draft',
          is_pinned: notice.is_pinned || false,
          scheduled_at: notice.scheduled_at ? notice.scheduled_at.slice(0, 16) : '',
        });
        setUsingMockData(false);
      } catch (err) {
        // Try mock data
        const mockNotice = MOCK_NOTICES[id];
        if (mockNotice) {
          setOriginalNotice(mockNotice);
          setForm({
            title: mockNotice.title || '',
            content: mockNotice.content || '',
            category: mockNotice.category || '',
            status: mockNotice.status || 'Draft',
            is_pinned: mockNotice.is_pinned || false,
            scheduled_at: mockNotice.scheduled_at ? mockNotice.scheduled_at.slice(0, 16) : '',
          });
          setUsingMockData(true);
        } else {
          setFetchError('Notice not found or could not be loaded.');
        }
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchNotice();
  }, [id]);

  // Track changes
  useEffect(() => {
    if (!originalNotice) return;
    const changed =
      form.title !== originalNotice.title ||
      form.content !== originalNotice.content ||
      form.category !== originalNotice.category ||
      form.status !== originalNotice.status ||
      form.is_pinned !== originalNotice.is_pinned ||
      newAttachment !== null ||
      removeAttachment;
    setHasChanges(changed);
  }, [form, originalNotice, newAttachment, removeAttachment]);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (form.title.length > CHAR_LIMITS.title) {
      newErrors.title = `Title cannot exceed ${CHAR_LIMITS.title} characters.`;
    }
    if (form.content && form.content.trim().length > 0 && form.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters long.';
    }
    if (form.category && !CATEGORIES.includes(form.category)) {
      newErrors.category = 'Please select a valid category.';
    }
    if (form.status === 'Scheduled' && !form.scheduled_at) {
      newErrors.scheduled_at = 'Scheduled date & time is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      addToast('Attachment must be under 10 MB.', 'error');
      return;
    }
    setNewAttachment(file);
    setRemoveAttachment(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fix the validation errors before saving.', 'error');
      return;
    }

    if (!hasChanges) {
      addToast('No changes detected.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      if (usingMockData) {
        // Simulate success in mock mode
        await new Promise(r => setTimeout(r, 800));
        addToast(`Notice "${form.title}" updated successfully!`, 'success');
        navigate('/admin/notices');
        return;
      }

      const formData = new FormData();
      if (form.title !== originalNotice.title) formData.append('title', form.title.trim());
      if (form.content !== originalNotice.content) formData.append('content', form.content.trim());
      if (form.category !== originalNotice.category) formData.append('category', form.category);
      if (form.status !== originalNotice.status) formData.append('status', form.status);
      if (form.is_pinned !== originalNotice.is_pinned) formData.append('is_pinned', String(form.is_pinned));
      if (form.scheduled_at) formData.append('scheduled_at', form.scheduled_at);
      if (newAttachment) formData.append('attachment', newAttachment);
      if (removeAttachment) formData.append('remove_attachment', 'true');

      await api.patch(`/notices/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      addToast(`Notice updated successfully!`, 'success');
      navigate('/admin/notices');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update notice. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick-action: publish directly from edit page
  const handleQuickPublish = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (usingMockData) {
        await new Promise(r => setTimeout(r, 600));
        addToast('Notice published successfully!', 'success');
        navigate('/admin/notices');
        return;
      }
      await api.patch(`/notices/${id}/publish`);
      addToast('Notice published successfully!', 'success');
      navigate('/admin/notices');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to publish notice.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick-action: archive directly
  const handleQuickArchive = async () => {
    setIsSubmitting(true);
    try {
      if (usingMockData) {
        await new Promise(r => setTimeout(r, 600));
        addToast('Notice archived successfully.', 'success');
        navigate('/admin/notices');
        return;
      }
      await api.patch(`/notices/${id}/archive`);
      addToast('Notice archived successfully.', 'success');
      navigate('/admin/notices');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to archive notice.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render states ---
  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-32 mb-6 animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-society-primary animate-spin" />
          <p className="text-sm text-slate-500">Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/notices" className="inline-flex items-center gap-1.5 text-society-primary hover:text-[#D4AF37] font-semibold text-xs mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Notices
        </Link>
        <div className="bg-white rounded-xl border border-red-200 p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{fetchError}</h3>
            <p className="text-xs text-slate-400 mt-1">The notice may have been deleted or the ID is invalid.</p>
          </div>
          <Link to="/admin/notices" className="bg-society-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition">
            Return to Notices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <Link
          to="/admin/notices"
          className="inline-flex items-center gap-1.5 text-society-primary hover:text-[#D4AF37] font-semibold text-xs mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Notices
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#D4AF37]" />
              Edit Notice
            </h2>
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-2">
              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded">{id}</span>
              Current status: <StatusBadge status={originalNotice?.status} />
              {usingMockData && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
                </span>
              )}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {originalNotice?.status !== 'Published' && (
              <button
                type="button"
                onClick={handleQuickPublish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Publish
              </button>
            )}
            {originalNotice?.status === 'Published' && (
              <button
                type="button"
                onClick={handleQuickArchive}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                showPreview
                  ? 'bg-society-primary text-white border-society-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-society-primary hover:text-society-primary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Change indicator */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-medium"
        >
          <Info className="w-4 h-4" />
          You have unsaved changes. Remember to save before leaving.
        </motion.div>
      )}

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-society-primary" />
              Notice Details
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <FieldLabel
                label="Notice Title"
                required
                hint={<CharCounter current={form.title.length} max={CHAR_LIMITS.title} />}
              />
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Water Tank Cleaning — June 15, 2026"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                }`}
              />
              <FieldError message={errors.title} />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Category" />
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm appearance-none cursor-pointer transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                      errors.category ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                    }`}
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <FieldError message={errors.category} />
              </div>

              <div>
                <FieldLabel label="Publication Status" />
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm appearance-none cursor-pointer transition focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:bg-white focus:outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduled Date */}
            {form.status === 'Scheduled' && (
              <div>
                <FieldLabel label="Schedule Date & Time" required />
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setField('scheduled_at', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                    errors.scheduled_at ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                  }`}
                />
                <FieldError message={errors.scheduled_at} />
              </div>
            )}

            {/* Content */}
            <div>
              <FieldLabel
                label="Notice Content"
                hint={<CharCounter current={form.content.length} max={CHAR_LIMITS.content} />}
              />
              <textarea
                rows={7}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                placeholder="Write the complete notice here..."
                className={`w-full px-3 py-2.5 border rounded-lg text-sm leading-relaxed resize-none transition focus:ring-2 focus:ring-society-primary/20 focus:outline-none ${
                  errors.content ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus:border-society-primary focus:bg-white'
                }`}
              />
              <FieldError message={errors.content} />
            </div>

            {/* Pin toggle */}
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition">
              <div
                onClick={() => setField('is_pinned', !form.is_pinned)}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${form.is_pinned ? 'bg-society-primary' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.is_pinned ? 'translate-x-4' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Pin to resident dashboard</p>
                <p className="text-[10px] text-slate-400">Pinned notices appear prominently on residents' home screen.</p>
              </div>
            </label>

            {/* Attachment */}
            <div>
              <FieldLabel label="Attachment" hint="Optional — Max 10 MB" />

              {/* Existing attachment */}
              {originalNotice?.attachment_url && !removeAttachment && !newAttachment && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                  <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">Current attachment</p>
                    <a href={originalNotice.attachment_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-society-primary hover:underline">
                      View current file
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveAttachment(true)}
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {removeAttachment && !newAttachment && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-[11px] text-red-600 flex-1">Attachment will be removed on save.</p>
                  <button type="button" onClick={() => setRemoveAttachment(false)} className="text-[10px] text-red-600 underline">Undo</button>
                </div>
              )}

              {/* New file */}
              {newAttachment ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-800 truncate">{newAttachment.name}</p>
                    <p className="text-[10px] text-emerald-600">New — {(newAttachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setNewAttachment(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-society-primary hover:text-society-primary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {originalNotice?.attachment_url && !removeAttachment ? 'Replace attachment' : 'Attach a file'}
                  </span>
                  <span className="text-[10px]">PDF, DOC, DOCX, JPG, PNG up to 10 MB</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 disabled:bg-slate-200 disabled:text-slate-400 text-society-primary font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
            <Link
              to="/admin/notices"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-medium"
            >
              Cancel
            </Link>
            {!hasChanges && (
              <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> No changes yet
              </span>
            )}
          </div>
        </motion.form>

        {/* Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-society-primary" />
                Live Preview
              </h3>
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-society-primary/10 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-society-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {form.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                          {form.category}
                        </span>
                      )}
                      {form.is_pinned && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bell className="w-2.5 h-2.5 fill-current" /> Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-tight">
                      {form.title || <span className="text-slate-300 italic">Notice title...</span>}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Suyash Pride Housing Society · Edited just now</p>
                  </div>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                  {form.content || <span className="text-slate-300 italic">Notice content...</span>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <StatusBadge status={form.status} />
                  <span className="text-[10px] text-slate-400">Preview only</span>
                </div>
              </div>
            </div>

            {/* Change log */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-700 mb-3">What Changed?</h3>
              {originalNotice && (
                <ul className="space-y-1.5">
                  {form.title !== originalNotice.title && (
                    <li className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                      ✏️ Title changed
                    </li>
                  )}
                  {form.content !== originalNotice.content && (
                    <li className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                      ✏️ Content modified
                    </li>
                  )}
                  {form.category !== originalNotice.category && (
                    <li className="text-[11px] text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                      🏷️ Category: {originalNotice.category} → {form.category}
                    </li>
                  )}
                  {form.status !== originalNotice.status && (
                    <li className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      📋 Status: {originalNotice.status} → {form.status}
                    </li>
                  )}
                  {form.is_pinned !== originalNotice.is_pinned && (
                    <li className="text-[11px] text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
                      📌 Pin status changed to: {form.is_pinned ? 'Pinned' : 'Unpinned'}
                    </li>
                  )}
                  {newAttachment && (
                    <li className="text-[11px] text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                      📎 New attachment: {newAttachment.name}
                    </li>
                  )}
                  {removeAttachment && (
                    <li className="text-[11px] text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                      🗑️ Attachment will be removed
                    </li>
                  )}
                  {!hasChanges && (
                    <li className="text-[11px] text-slate-400 italic">No changes made yet.</li>
                  )}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default EditNotice;
