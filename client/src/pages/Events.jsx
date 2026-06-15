import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '../components/events/EventCard';
import EmptyState from '../components/common/EmptyState';

function Events() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('upcoming'); // 'upcoming' | 'past'

  const events = useMemo(() => [
    {
      id: 'e1',
      title: 'Independence Day Flag Hoisting',
      description: 'Join us for the national flag hoisting followed by patriotic performances by society kids and high-tea at the recreation lawn.',
      date: 'Aug 15, 2026',
      category: 'Festivals',
      venue: 'Main Lawn',
      banner: 'https://images.unsplash.com/photo-1594122230689-48690024be3a?auto=format&fit=crop&w=600&q=80',
      isUpcoming: true
    },
    {
      id: 'e2',
      title: 'Monsoon Tree Plantation Drive',
      description: 'Let us plant 100 saplings in and around the society complex to keep our campus green and clean. Volunteers are welcome!',
      date: 'Jul 12, 2026',
      category: 'Drives',
      venue: 'Society Perimeter',
      banner: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      isUpcoming: true
    },
    {
      id: 'e3',
      title: 'Annual General Meeting (AGM)',
      description: 'Official meeting for all flat owners to discuss maintenance balance statements, auditor reports, and security updates.',
      date: 'Jun 28, 2026',
      category: 'Meetings',
      venue: 'Clubhouse Hall',
      banner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
      isUpcoming: true
    },
    {
      id: 'e4',
      title: 'Ganesh Utsav - Evening Aarti & Prasad',
      description: 'Celebrate Ganeshotsav with daily evening bhajans, modular decorations, and prasad distribution at the central lobby pandal.',
      date: 'Sep 05, 2026',
      category: 'Festivals',
      venue: 'Central Entrance Lobby',
      banner: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80',
      isUpcoming: true
    },
    {
      id: 'e5',
      title: 'Blood Donation Camp',
      description: 'In collaboration with Apollo Hospital, a blood donation drive has been organized for all residents to contribute to life-saving reserves.',
      date: 'Apr 18, 2026',
      category: 'Drives',
      venue: 'Clubhouse Ground Floor',
      banner: 'https://images.unsplash.com/photo-1615461066841-4aad10119f5e?auto=format&fit=crop&w=600&q=80',
      isUpcoming: false
    },
    {
      id: 'e6',
      title: 'Republic Day Cultural Meet',
      description: 'Annual Republic Day celebrations including standard flag salute followed by sports events, prizes, and evening dance performances.',
      date: 'Jan 26, 2026',
      category: 'Festivals',
      venue: 'Recreation Lawn',
      banner: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
      isUpcoming: false
    }
  ], []);

  const categories = ['All', 'Festivals', 'Meetings', 'Drives'];

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesCategory = activeCategory === 'All' || evt.category === activeCategory;
      const matchesTime = timeFilter === 'upcoming' ? evt.isUpcoming : !evt.isUpcoming;
      return matchesCategory && matchesTime;
    });
  }, [events, activeCategory, timeFilter]);

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Community Events & Programs
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Keep track of cultural gatherings, annual general meetings, and volunteering drives in our society.
        </p>
      </div>

      {/* Filter controls panel */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850 transition-theme">
        {/* Category Tabs */}
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

        {/* Time filters */}
        <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
          <button
            onClick={() => setTimeFilter('upcoming')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition ${
              timeFilter === 'upcoming'
                ? 'bg-society-primary/10 dark:bg-society-secondary/20 text-society-primary dark:text-[#D4AF37] font-bold'
                : 'text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTimeFilter('past')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition ${
              timeFilter === 'past'
                ? 'bg-society-primary/10 dark:bg-society-secondary/20 text-society-primary dark:text-[#D4AF37] font-bold'
                : 'text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Events Grid List */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventCard 
                    id={evt.id}
                    title={evt.title}
                    description={evt.description}
                    date={evt.date}
                    venue={evt.venue}
                    banner={evt.banner}
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
                title="No Events Found" 
                message="We couldn't find any events scheduled in this category."
                actionLabel="Clear Filters"
                onAction={() => {
                  setActiveCategory('All');
                  setTimeFilter('upcoming');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Events;
