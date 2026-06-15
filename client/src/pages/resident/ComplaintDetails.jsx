import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageSquare, Send, Calendar, User, User2,
  Wrench, Zap, ShieldAlert, Shield, CheckCircle, CheckCircle2,
  Clock, Paperclip, Image, X, AlertCircle, Info, Tag,
  AlertTriangle, RotateCcw, Loader2, Wind, Droplets, Flame,
  ParkingCircle, TreeDeciduous, ShoppingBag, ArrowRight, Layers
} from 'lucide-react';
import { getComplaintById, saveComplaint } from '../../utils/mockDb';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Shared Constants (mirrors Complaints.jsx) ────────────────────────────────

const CATEGORIES_MAP = {
  Plumbing:        { icon: Wrench,         color: 'text-sky-500',    bg: 'bg-sky-50' },
  Electrical:      { icon: Zap,            color: 'text-amber-500',  bg: 'bg-amber-50' },
  Lift:            { icon: ArrowRight,     color: 'text-purple-500', bg: 'bg-purple-50' },
  Security:        { icon: Shield,         color: 'text-red-500',    bg: 'bg-red-50' },
  Parking:         { icon: ParkingCircle,  color: 'text-blue-500',   bg: 'bg-blue-50' },
  Housekeeping:    { icon: Wind,           color: 'text-teal-500',   bg: 'bg-teal-50' },
  'Water Supply':  { icon: Droplets,       color: 'text-cyan-500',   bg: 'bg-cyan-50' },
  Garden:          { icon: TreeDeciduous,  color: 'text-green-500',  bg: 'bg-green-50' },
  'Fire Safety':   { icon: Flame,          color: 'text-orange-500', bg: 'bg-orange-50' },
  'Common Area':   { icon: ShieldAlert,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'Commercial Shop':{ icon: ShoppingBag,   color: 'text-pink-500',   bg: 'bg-pink-50' },
  Other:           { icon: AlertCircle,    color: 'text-slate-500',  bg: 'bg-slate-100' },
};

const PRIORITY_CONFIG = {
  Low:      { color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200' },
  Medium:   { color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200' },
  High:     { color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200' },
  Critical: { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200' },
};

const STATUS_CONFIG = {
  Open:        { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  Assigned:    { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  'In Progress':{ color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  Resolved:    { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Closed:      { color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200' },
  Rejected:    { color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  Reopened:    { color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200' },
  // legacy
  PENDING:     { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  IN_PROGRESS: { color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  RESOLVED:    { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const FRIENDLY_STATUS = { PENDING: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' };

// ─── Helper components ─────────────────────────────────────────────────────────

function StatusBadge({ status, size = 'md' }) {
  const key = FRIENDLY_STATUS[status] || status;
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.Open;
  const isResolved = ['Resolved', 'RESOLVED', 'Closed'].includes(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${cfg.bg} ${cfg.color} ${cfg.border} ${size === 'lg' ? 'text-xs' : 'text-[11px]'}`}>
      {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      {key}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority || 'Medium'] || PRIORITY_CONFIG.Medium;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {priority || 'Medium'}
    </span>
  );
}

function CategoryIcon({ cat, className = 'w-5 h-5' }) {
  const cfg = CATEGORIES_MAP[cat] || CATEGORIES_MAP.Other;
  const Icon = cfg.icon;
  return <Icon className={`${className} ${cfg.color}`} />;
}

// ─── Timeline Entry ────────────────────────────────────────────────────────────

function TimelineEntry({ log, index }) {
  const isSystem = log.user === 'System';
  const isAdmin = !isSystem && (
    log.user.toLowerCase().includes('admin') ||
    log.user.toLowerCase().includes('secretary') ||
    log.user.toLowerCase().includes('manager') ||
    log.user.toLowerCase().includes('plumber') ||
    log.user.toLowerCase().includes('electrician') ||
    log.user.toLowerCase().includes('vendor') ||
    log.user.toLowerCase().includes('staff') ||
    log.user.toLowerCase().includes('committee')
  );
  const isResident = !isSystem && !isAdmin;

  const dotColor = isSystem ? 'bg-slate-300 border-slate-100' : isAdmin ? 'bg-society-primary border-white' : 'bg-[#D4AF37] border-white';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {/* Dot */}
      <span className={`absolute -left-[31px] top-2 w-3 h-3 rounded-full border-2 shadow-sm ${dotColor}`} />

      <div className={`rounded-xl p-4 border ${
        isSystem ? 'bg-slate-50 border-slate-100' :
        isAdmin ? 'bg-society-primary/5 border-society-primary/20' :
        'bg-amber-50 border-amber-100'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            isSystem ? 'text-slate-400' : isAdmin ? 'text-society-primary' : 'text-amber-700'
          }`}>
            {log.user}
          </span>
          <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{log.text}</p>
        {log.imageUrl && (
          <img src={log.imageUrl} alt="attachment" className="mt-2 w-32 h-20 object-cover rounded-lg border border-slate-200" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Comment Box ───────────────────────────────────────────────────────────────

function CommentBox({ ticketId, isClosed, onAddComment, usingMock }) {
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const fileRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return;
    setIsSending(true);
    try {
      await onAddComment(text.trim(), images);
      setText('');
      setImages([]);
      addToast('Comment added to ticket timeline.', 'success');
    } catch {
      addToast('Failed to add comment. Try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isClosed) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mt-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-700">Ticket Closed</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">This ticket has been resolved and closed. Contact the office to reopen it if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="border-t border-slate-100 pt-5 mt-2 space-y-3">
      <div className="relative">
        <textarea
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a follow-up note, update, or question for the committee..."
          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] focus:bg-white focus:outline-none text-sm leading-relaxed resize-none transition"
        />
      </div>

      {/* Image thumbs */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(img)} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              <button type="button" onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => setImages(p => [...p, ...Array.from(e.target.files).filter(f => f.type.startsWith('image/'))].slice(0, 4))} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" title="Attach photo">
          <Image className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-slate-400 flex-1">
          Posting here notifies the committee and assigned technician.
        </p>
        <button type="submit" disabled={isSending || (!text.trim() && images.length === 0)}
          className="inline-flex items-center gap-2 bg-society-primary hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-4 py-2 rounded-lg text-xs transition">
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // Load ticket
  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      const data = res.data?.data || res.data;
      if (!data) throw new Error('Not found');
      setTicket(data);
      setUsingMock(false);
    } catch {
      const data = getComplaintById(id);
      if (!data) {
        addToast('Ticket not found.', 'error');
        navigate('/resident/complaints');
        return;
      }
      setTicket(data);
      setUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, addToast]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const handleAddComment = useCallback(async (text, images) => {
    if (!ticket) return;
    const newLog = {
      time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      user: 'Resident (Parth Patel)',
      text: text || (images.length > 0 ? '(Photo attachment)' : ''),
    };
    if (usingMock) {
      const updated = { ...ticket, logs: [...(ticket.logs || []), newLog] };
      saveComplaint(updated);
      setTicket(updated);
    } else {
      try {
        await api.post(`/complaints/${id}/comments`, { comment: text });
        await loadTicket();
      } catch {
        const updated = { ...ticket, logs: [...(ticket.logs || []), newLog] };
        saveComplaint(updated);
        setTicket(updated);
      }
    }
  }, [ticket, usingMock, id, loadTicket]);

  const handleReopen = async () => {
    if (!ticket) return;
    if (usingMock) {
      const updated = { ...ticket, status: 'Reopened', logs: [...(ticket.logs || []), {
        time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        user: 'Resident (Parth Patel)',
        text: 'Ticket reopened by resident — issue persists.'
      }]};
      saveComplaint(updated);
      setTicket(updated);
      addToast('Ticket reopened.', 'success');
    } else {
      try {
        await api.patch(`/complaints/${id}/reopen`);
        await loadTicket();
        addToast('Ticket reopened.', 'success');
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to reopen.', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  if (!ticket) return null;

  const catCfg = CATEGORIES_MAP[ticket.cat || ticket.category] || CATEGORIES_MAP.Other;
  const CategoryIconEl = catCfg.icon;
  const statusKey = FRIENDLY_STATUS[ticket.status] || ticket.status;
  const isClosed = ['Resolved', 'Closed', 'RESOLVED'].includes(ticket.status);
  const canReopen = ['Resolved', 'Closed', 'RESOLVED'].includes(ticket.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link to="/resident/complaints"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition">
          <ArrowLeft className="w-4 h-4" /> Back to Helpdesk
        </Link>
        {usingMock && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
          </span>
        )}
      </div>

      {/* ── Ticket Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Colour strip */}
        <div className={`h-1.5 w-full ${catCfg.bg.replace('-50', '-400')}`} />

        <div className="p-6 space-y-5">
          {/* Title row */}
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{ticket.id}</span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${catCfg.bg} ${catCfg.color}`}>
                  <CategoryIconEl className="w-3 h-3" />
                  {ticket.cat || ticket.category}
                </span>
                {ticket.priority && <PriorityBadge priority={ticket.priority} />}
              </div>
              <h2 className="text-lg font-bold text-society-primary leading-snug">
                {ticket.title || ticket.subject}
              </h2>
            </div>
            <StatusBadge status={ticket.status} size="lg" />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {ticket.description}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: 'Filed On', value: ticket.date },
              { icon: User2, label: 'Resident', value: ticket.residentName || 'Parth Patel' },
              { icon: Tag, label: 'Property', value: ticket.flat || 'Flat A-102' },
              { icon: User, label: 'Assigned To', value: ticket.assignedTo || 'Pending', highlight: !!ticket.assignedTo },
            ].map(({ icon: Icon, label, value, highlight }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                  <p className={`text-xs font-bold mt-0.5 ${highlight ? 'text-sky-600' : 'text-slate-700'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reopen button */}
          {canReopen && (
            <button onClick={handleReopen}
              className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-lg transition">
              <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket (Issue Persists)
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline & Comments */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageSquare className="w-4 h-4 text-society-primary" />
          Activity Timeline
          <span className="ml-auto text-[10px] font-normal text-slate-400 normal-case tracking-normal">
            {(ticket.logs || []).length} entr{(ticket.logs || []).length === 1 ? 'y' : 'ies'}
          </span>
        </h3>

        {/* Timeline entries */}
        <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-4">
          {(ticket.logs || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
          ) : (
            ticket.logs.map((log, idx) => (
              <TimelineEntry key={idx} log={log} index={idx} />
            ))
          )}
        </div>

        {/* Comment box */}
        <CommentBox
          ticketId={id}
          isClosed={isClosed}
          onAddComment={handleAddComment}
          usingMock={usingMock}
        />
      </div>

      {/* Info banner */}
      {!isClosed && (
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-700 leading-relaxed">
            The committee reviews tickets every weekday morning. You will receive a notification when your ticket is assigned or updated.
          </p>
        </div>
      )}
    </div>
  );
}

export default ComplaintDetails;
