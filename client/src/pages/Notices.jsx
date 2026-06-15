import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoticeCard from '../components/notices/NoticeCard';
import SearchBar from '../components/common/SearchBar';
import EmptyState from '../components/common/EmptyState';

function Notices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const notices = useMemo(() => [
    {
      id: 'n1',
      title: 'Water Supply Maintenance Shutdown',
      content: 'Please note that the main water storage tanks will undergo cleaning on June 15, 2026. Water supply will be unavailable from 10:00 AM to 4:00 PM. Residents are requested to store sufficient water in advance.',
      date: 'Jun 11, 2026',
      category: 'Water Supply',
      isPinned: true
    },
    {
      id: 'n2',
      title: 'Implementation of New Security Entry App',
      content: 'From July 1, 2026, visitors and delivery personnel will only be allowed entry through security approval verification. Please register your details at the society office or update your profile in the portal.',
      date: 'Jun 08, 2026',
      category: 'Security',
      isPinned: false
    },
    {
      id: 'n3',
      title: 'Pest Control Services in Lobby & Parking Area',
      content: 'Society has scheduled standard pest control treatment in the basement, corridors, and staircase area. Please cooperate and keep the parking space clear on Saturday, June 20, 2026.',
      date: 'Jun 05, 2026',
      category: 'Maintenance',
      isPinned: false
    },
    {
      id: 'n4',
      title: 'Monthly Maintenance Invoice Dispatched',
      content: 'Maintenance bills for the month of June 2026 have been generated and sent to all property owners. The due date for payment without interest is June 25, 2026. Payments can be settled online through Razorpay on the resident portal.',
      date: 'Jun 01, 2026',
      category: 'Maintenance',
      isPinned: false
    },
    {
      id: 'n5',
      title: 'Notice for Special General Body Meeting (SGM)',
      content: 'A Special General Body Meeting will be convened on Sunday, June 28, 2026, at 11:00 AM in the Clubhouse to discuss rooftop solar battery expansion approvals. All members are requested to attend.',
      date: 'May 28, 2026',
      category: 'General',
      isPinned: false
    },
    {
      id: 'n6',
      title: 'Common Area Lift Maintenance',
      content: 'Weekly servicing of Elevator 2 in Wing C will take place on Wednesday, June 17, between 2:00 PM and 5:00 PM. Residents are advised to use Elevator 1 during this period.',
      date: 'Jun 12, 2026',
      category: 'Maintenance',
      isPinned: false
    }
  ], []);

  const categories = ['All', 'General', 'Water Supply', 'Security', 'Maintenance'];

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesSearch = 
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeTab === 'All' || notice.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [notices, searchQuery, activeTab]);

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Circulars & Official Notices
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Keep track of general meetings, maintenance shutdowns, security rules, and committee decisions.
        </p>
      </div>

      {/* Filters & Search Control Pane */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850 transition-theme">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === cat
                  ? 'bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary shadow-sm font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <SearchBar 
          placeholder="Search circulars..." 
          onSearch={(val) => setSearchQuery(val)} 
          initialValue={searchQuery}
        />
      </div>

      {/* Circular Grid List */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredNotices.length > 0 ? (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNotices.map((notice) => (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <NoticeCard 
                    id={notice.id}
                    title={notice.title}
                    content={notice.content}
                    date={notice.date}
                    isPinned={notice.isPinned}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState 
                title="No Notices Found" 
                message="We couldn't find any notices matching your query. Try adjusting your search keywords or active filters."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setActiveTab('All');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Notices;
