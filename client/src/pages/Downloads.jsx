import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, HardDrive, CheckCircle } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

function Downloads() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const documents = useMemo(() => [
    {
      id: 'd1',
      name: 'NOC Request Format for Flat Resale',
      description: 'Standard format to request No Objection Certificate from the society committee for selling your property.',
      category: 'NOC Templates',
      size: '145 KB',
      format: 'PDF',
      date: 'Jan 10, 2026'
    },
    {
      id: 'd2',
      name: 'NOC Format for Flat Rental (Tenant)',
      description: 'Required format for landlords to obtain tenant NOC before leasing out flat or shop units.',
      category: 'NOC Templates',
      size: '132 KB',
      format: 'PDF',
      date: 'Mar 14, 2026'
    },
    {
      id: 'd3',
      name: 'Tenant Police Verification Template',
      description: 'Mandatory police verification document format required to be submitted alongside rental agreements.',
      category: 'Forms',
      size: '220 KB',
      format: 'DOCX',
      date: 'Feb 15, 2026'
    },
    {
      id: 'd4',
      name: 'Society Membership Application Form',
      description: 'Official application form for registration of new property owners inside society records.',
      category: 'Forms',
      size: '310 KB',
      format: 'PDF',
      date: 'Mar 02, 2026'
    },
    {
      id: 'd5',
      name: 'Parking Slot Allocation Application',
      description: 'Submit this form to request or modify vehicle parking slot allotments inside the stilt/ground layout.',
      category: 'Forms',
      size: '115 KB',
      format: 'PDF',
      date: 'Apr 18, 2026'
    },
    {
      id: 'd6',
      name: 'Society General Bylaws & Rules Handbook',
      description: 'Complete handbook detailing parking speed boundaries, visitor hours, waste segregation penalties, and lift guides.',
      category: 'Handbooks',
      size: '890 KB',
      format: 'PDF',
      date: 'May 22, 2026'
    },
    {
      id: 'd7',
      name: 'Clubhouse Event Booking Form',
      description: 'Form to block and reserve the society clubhouse hall for private birthday events or family meetings.',
      category: 'Forms',
      size: '105 KB',
      format: 'PDF',
      date: 'Jun 04, 2026'
    }
  ], []);

  const categories = ['All', 'Forms', 'NOC Templates', 'Handbooks'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, activeCategory]);

  const handleDownload = (name) => {
    addToast(`Downloading ${name}...`, 'success');
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Downloads Directory
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Access blank application formats, police tenant forms, NOC drafts, and general rules handbooks.
        </p>
      </div>

      {/* Control panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850 transition-theme">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary shadow-sm font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <SearchBar 
          placeholder="Search documents..." 
          onSearch={(val) => setSearchQuery(val)} 
          initialValue={searchQuery}
        />
      </div>

      {/* File List */}
      <div className="min-h-[400px] space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-theme flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex gap-4 items-start min-w-0 flex-1">
                  <div className="p-3 bg-red-500/10 dark:bg-red-500/5 text-red-650 rounded-lg flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-tight truncate">
                        {doc.name}
                      </h4>
                      <span className="text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200/50">
                        {doc.format}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-2xl">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Uploaded: {doc.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Size: {doc.size}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc.name)}
                  className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-yellow-600 text-society-primary font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wide transition shadow-sm w-full md:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState 
                title="No Documents Found" 
                message="We couldn't find any documents matching your filters or search terms."
                actionLabel="Reset Search"
                onAction={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Downloads;
