import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, HardDrive, Search, X,
  BookOpen, Scale, Building2, FileBadge, FileBarChart, FolderOpen
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Public downloadable forms/templates (resident-specific, not the main repository)
const RESIDENT_DOWNLOADS = [
  {
    id: 'f1', name: 'NOC Application Form — Flat Resale',
    description: 'Official format to request No Objection Certificate from the committee for property resale.',
    category: 'NOC Templates', format: 'DOCX', size: '145 KB', date: 'Jan 15, 2026',
    icon: Scale, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50',
  },
  {
    id: 'f2', name: 'NOC Format — Flat Rental (Tenant)',
    description: 'Landlords must submit this format before leasing out flat or shop units to tenants.',
    category: 'NOC Templates', format: 'DOCX', size: '132 KB', date: 'Mar 14, 2026',
    icon: Scale, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50',
  },
  {
    id: 'f3', name: 'Police Tenant Verification Template',
    description: 'Mandatory police verification document required alongside all rental agreements.',
    category: 'Forms', format: 'PDF', size: '220 KB', date: 'Feb 15, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
  {
    id: 'f4', name: 'Society Membership Application Form',
    description: 'Officially register new property ownership in society records.',
    category: 'Forms', format: 'PDF', size: '310 KB', date: 'Mar 02, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
  {
    id: 'f5', name: 'Parking Slot Allocation Application',
    description: 'Request or modify your vehicle parking slot assignment inside the society.',
    category: 'Forms', format: 'PDF', size: '115 KB', date: 'Apr 18, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
  {
    id: 'f6', name: 'Society General By-Laws & Rules Handbook',
    description: 'Complete handbook: visitor hours, waste segregation, lift rules, parking guidelines, and penalties.',
    category: 'Handbooks', format: 'PDF', size: '890 KB', date: 'May 22, 2026',
    icon: BookOpen, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50',
  },
  {
    id: 'f7', name: 'Clubhouse Event Booking Form',
    description: 'Book the society clubhouse hall for private birthday parties or family meetings.',
    category: 'Forms', format: 'PDF', size: '105 KB', date: 'Jun 04, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
  {
    id: 'f8', name: 'Vehicle Pass Sticker Application',
    description: 'Apply for monthly or annual vehicle sticker pass for authorized stilt parking.',
    category: 'Forms', format: 'PDF', size: '95 KB', date: 'Jan 10, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
  {
    id: 'f9', name: 'Intercom Activation Request Format',
    description: 'Request new intercom phone registration for your flat unit and doorbell integration.',
    category: 'Forms', format: 'PDF', size: '120 KB', date: 'Mar 15, 2026',
    icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
  },
];

const CATEGORIES = ['All', 'Forms', 'NOC Templates', 'Handbooks'];

const FORMAT_COLORS = {
  PDF:  'bg-red-100 text-red-700',
  DOCX: 'bg-blue-100 text-blue-700',
  XLSX: 'bg-emerald-100 text-emerald-700',
};

function Downloads() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return RESIDENT_DOWNLOADS.filter(doc => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || doc.name.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q);
      const matchCat = activeCategory === 'All' || doc.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, activeCategory]);

  const handleDownload = (name) => {
    addToast(`Downloading "${name}"...`, 'success');
  };

  const catCounts = useMemo(() => {
    const c = { All: RESIDENT_DOWNLOADS.length };
    RESIDENT_DOWNLOADS.forEach(d => { c[d.category] = (c[d.category] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-society-primary flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
          Downloads & Forms
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Download official formats, NOC templates, policy handbooks, and resident application forms.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-society-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
              <span className={`text-[10px] font-black ${activeCategory === cat ? 'opacity-70' : 'text-slate-400'}`}>
                ({catCounts[cat] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-society-primary/20 focus:border-society-primary focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map(doc => {
              const Icon = doc.icon;
              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${doc.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${doc.iconColor}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-society-primary transition-colors">
                        {doc.name}
                      </h4>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${FORMAT_COLORS[doc.format] || 'bg-slate-100 text-slate-600'}`}>
                        {doc.format}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Uploaded: {doc.date}</span>
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />Size: {doc.size}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(doc.name)}
                    className="flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide transition shadow-sm hover:shadow-md shrink-0 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl py-16 flex flex-col items-center gap-4 text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FolderOpen className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-600 text-sm">No forms found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filter.</p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="text-xs text-society-primary hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-slate-400 text-center">
        Showing {filtered.length} of {RESIDENT_DOWNLOADS.length} downloadable documents.
        Contact the society office for documents not listed here.
      </p>
    </div>
  );
}

export default Downloads;
