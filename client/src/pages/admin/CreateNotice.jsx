import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bell, FileText, Tag, CheckCircle2,
  Upload, X, Paperclip, Eye, Send, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'General', 'Maintenance', 'Emergency', 'AGM', 'SGM',
  'Festival', 'Security', 'Parking', 'Water Supply', 'Lift Maintenance'
];

const STATUSES = ['Draft', 'Published', 'Scheduled'];

const CHAR_LIMITS = { title: 200, content: 5000 };

const initialForm = {
  title: '',
  content: '',
  category: '',
  status: 'Draft',
  is_pinned: false,
  scheduled_at: '',
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
  return (
    <span className={`text-[10px] font-medium ${color}`}>
      {current}/{max}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{message}
    </p>
  );
}

function NoticePreview({ form }) {
  return (
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
            {form.title || <span className="text-slate-300 italic">Notice title will appear here...</span>}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Suyash Pride Housing Society · Just now</p>
        </div>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed pl-13 min-h-[48px]">
        {form.content || <span className="text-slate-300 italic">Notice content will appear here...</span>}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          form.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
          form.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {form.status}
        </span>
        <span className="text-[10px] text-slate-400">Preview only — not saved yet</span>
      </div>
    </div>
  );
}

function CreateNotice() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim() || form.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (form.title.length > CHAR_LIMITS.title) {
      newErrors.title = `Title cannot exceed ${CHAR_LIMITS.title} characters.`;
    }
    if (!form.content.trim() || form.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters long.';
    }
    if (!form.category) {
      newErrors.category = 'Please select a notice category.';
    }
    if (form.status === 'Scheduled' && !form.scheduled_at) {
      newErrors.scheduled_at = 'Scheduled date & time is required for Scheduled status.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      addToast('Attachment must be under 10 MB.', 'error');
      return;
    }
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('content', form.content.trim());
      formData.append('category', form.category);
      formData.append('status', form.status);
      formData.append('is_pinned', String(form.is_pinned));
      if (form.scheduled_at) formData.append('scheduled_at', form.scheduled_at);
      if (attachment) formData.append('attachment', attachment);

      await api.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      addToast(`Notice "${form.title}" created successfully!`, 'success');
      navigate('/admin/notices');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create notice. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim() || form.title.length < 5) {
      addToast('Title must be at least 5 characters to save a draft.', 'error');
      return;
    }
    if (!form.category) {
      addToast('Please select a category before saving.', 'error');
      return;
    }
    // Save as Draft override
    const prevStatus = form.status;
    setForm(prev => ({ ...prev, status: 'Draft' }));
    await new Promise(r => setTimeout(r, 0));
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('content', form.content.trim() || ' ');
      formData.append('category', form.category);
      formData.append('status', 'Draft');
      formData.append('is_pinned', String(form.is_pinned));
      if (attachment) formData.append('attachment', attachment);

      await api.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Draft saved successfully.', 'success');
      navigate('/admin/notices');
    } catch (err) {
      addToast('Failed to save draft. Please try again.', 'error');
      setForm(prev => ({ ...prev, status: prevStatus }));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#D4AF37]" />
              Create New Notice
            </h2>
            <p className="text-slate-500 text-xs mt-1">Compose and broadcast a circular to all society residents.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              showPreview
                ? 'bg-society-primary text-white border-society-primary'
                : 'bg-white text-slate-600 border-slate-200 hover:border-society-primary hover:text-society-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

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
                <FieldLabel label="Category" required />
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
                <FieldLabel label="Publication Status" required />
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

            {/* Scheduled Date — only if Scheduled */}
            {form.status === 'Scheduled' && (
              <div>
                <FieldLabel label="Schedule Date & Time" required />
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setField('scheduled_at', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
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
                required
                hint={<CharCounter current={form.content.length} max={CHAR_LIMITS.content} />}
              />
              <textarea
                rows={7}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                placeholder="Write the complete notice here. Include all relevant details such as date, time, location, and any instructions for residents..."
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
              {attachment ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAttachment(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-society-primary hover:text-society-primary transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">Click to attach file</span>
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

            {/* Info banner for Published */}
            {form.status === 'Published' && (
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  This notice will be <strong>immediately visible</strong> to all society residents upon creation.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {form.status === 'Published' ? 'Publish Notice' : form.status === 'Scheduled' ? 'Schedule Notice' : 'Create Draft'}
                </>
              )}
            </button>
            <Link
              to="/admin/notices"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-medium"
            >
              Cancel
            </Link>
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
              <NoticePreview form={form} />
            </div>

            {/* Form guide */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Writing Tips
              </h4>
              <ul className="text-[11px] text-blue-600 space-y-1 leading-relaxed list-disc list-inside">
                <li>Use a clear, specific title that residents immediately understand.</li>
                <li>Include all relevant dates, times, and locations in the content.</li>
                <li>For water/power shutdowns, mention alternative arrangements.</li>
                <li>Use "Emergency" category sparingly for genuine urgent notices.</li>
                <li>Pin only the most critical notices (max 2–3 at a time).</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default CreateNotice;
