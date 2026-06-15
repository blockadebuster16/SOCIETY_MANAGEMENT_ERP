import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Sparkles, CheckCircle2, AlertTriangle, 
  Search, Filter, ArrowRight, Trophy, Music, Wrench, FileText, 
  ShoppingBag, BookOpen, Clock, Tag, X, HelpCircle, ChevronRight 
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { getEvents, registerEventRSVP, cancelEventRSVP } from '../../utils/mockDb';

function Events() {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Tab and Filter state
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-asc');
  
  // RSVP drawer state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(1);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  const categories = [
    'ALL', 'AGM', 'SGM', 'Festival', 'Sports', 'Cultural', 
    'Maintenance', 'Emergency Meeting', 'Vendor Meeting', 'Workshop', 'Other'
  ];

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/events');
      if (response.data && response.data.success) {
        setEvents(response.data.events || response.data.data || []);
        setUsingMockData(false);
      } else {
        throw new Error('API structure invalid');
      }
    } catch (err) {
      console.warn('API offline or error, falling back to mock DB:', err.message);
      const mockEvents = getEvents();
      setEvents(mockEvents || []);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Category Icon helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'AGM':
      case 'SGM':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Festival':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Sports':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case 'Cultural':
        return <Music className="w-4 h-4 text-purple-500" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'Vendor Meeting':
        return <ShoppingBag className="w-4 h-4 text-teal-500" />;
      case 'Workshop':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  // RSVP toggle handlers
  const openRsvpDrawer = (event) => {
    setSelectedEvent(event);
    const existingRsvp = event.registrations?.find(
      (r) => r.resident_id === user?.id && r.registration_status === 'Registered'
    );
    setRsvpCount(existingRsvp ? existingRsvp.count : 1);
  };

  const closeRsvpDrawer = () => {
    setSelectedEvent(null);
  };

  const handleRegisterRsvp = async () => {
    if (!selectedEvent) return;
    setIsSubmittingRsvp(true);
    try {
      if (usingMockData) {
        registerEventRSVP(selectedEvent.id, user?.id || 'res-101', rsvpCount);
        addToast(`Successfully registered RSVP for ${rsvpCount} member(s).`, 'success');
      } else {
        await api.post(`/events/${selectedEvent.id}/register`, { count: rsvpCount });
        addToast(`Successfully registered RSVP for ${rsvpCount} member(s).`, 'success');
      }
      loadEvents();
      closeRsvpDrawer();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit RSVP registration.', 'error');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  const handleCancelRsvp = async (event) => {
    if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;
    try {
      if (usingMockData) {
        cancelEventRSVP(event.id, user?.id || 'res-101');
        addToast('Cancelled your event RSVP.', 'info');
      } else {
        await api.delete(`/events/${event.id}/register`);
        addToast('Cancelled your event RSVP.', 'info');
      }
      loadEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel RSVP registration.', 'error');
    }
  };

  // Format Helper
  const formatEventDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter and sort events
  const filteredEvents = events.filter((event) => {
    // Search query match
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(searchLower);
    const descMatch = event.description?.toLowerCase().includes(searchLower);
    const locMatch = event.location?.toLowerCase().includes(searchLower);
    const matchesSearch = titleMatch || descMatch || locMatch;

    // Category match
    const matchesCategory = categoryFilter === 'ALL' || event.eventType === categoryFilter || event.event_type === categoryFilter;

    // Tab partition
    const eventDateStr = event.eventDate || event.event_date;
    const eventTimeStr = event.startTime || event.start_time || '00:00';
    const eventDateObj = new Date(`${eventDateStr}T${eventTimeStr}`);
    const isUpcoming = eventDateObj >= new Date() && event.status !== 'Completed' && event.status !== 'Cancelled';
    const isPast = eventDateObj < new Date() || event.status === 'Completed' || event.status === 'Cancelled';
    
    // User registration check
    const isRegistered = event.registrations?.some(
      (r) => r.resident_id === user?.id && r.registration_status === 'Registered'
    );

    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'past' && !isPast) return false;
    if (activeTab === 'my-rsvps' && !isRegistered) return false;

    return matchesSearch && matchesCategory;
  });

  // Sort
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(`${a.eventDate || a.event_date}T${a.startTime || a.start_time || '00:00'}`);
    const dateB = new Date(`${b.eventDate || b.event_date}T${b.startTime || b.start_time || '00:00'}`);
    if (sortBy === 'date-asc') return dateA - dateB;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white flex items-center gap-2">
            Society Events Portal
            {usingMockData && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Browse upcoming gatherings, RSVP counts, and explore gallery memories of past events.
          </p>
        </div>
        <button 
          onClick={loadEvents}
          className="text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 transition"
        >
          Refresh Feeds
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-250 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === 'upcoming' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Upcoming Gatherings
          {activeTab === 'upcoming' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === 'past' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Past Celebrations
          {activeTab === 'past' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-rsvps')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === 'my-rsvps' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          My RSVPs
          {activeTab === 'my-rsvps' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, location or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-250 dark:border-slate-700 text-xs focus:ring-1 focus:ring-society-primary focus:border-society-primary bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-700 rounded-lg px-2 py-1">
            <Tag className="w-3.5 h-3.5 text-slate-550 dark:text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900">
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-700 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-550 dark:text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
            >
              <option value="date-asc" className="bg-white dark:bg-slate-900">Date (Earliest First)</option>
              <option value="date-desc" className="bg-white dark:bg-slate-900">Date (Latest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-society-primary dark:border-[#D4AF37]"></div>
          <p className="text-slate-500 text-xs font-medium">Fetching event lists...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-6 rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-bold text-rose-800 dark:text-rose-455 text-sm">Failed to Load Events</h3>
          <p className="text-rose-650 dark:text-rose-400 text-xs max-w-md mx-auto">{error}</p>
          <button 
            onClick={loadEvents} 
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-4 rounded text-xs transition"
          >
            Retry
          </button>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-850 dark:text-white text-base">No Gatherings Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            {activeTab === 'upcoming' 
              ? 'No upcoming social gatherings, AGMs, or festivals scheduled at the moment.' 
              : activeTab === 'past' 
                ? 'No past events logged in the portal registry yet.'
                : 'You have not registered for any upcoming society events yet.'}
          </p>
          {(categoryFilter !== 'ALL' || searchQuery !== '') && (
            <button 
              onClick={() => { setCategoryFilter('ALL'); setSearchQuery(''); }}
              className="text-xs text-society-primary dark:text-[#D4AF37] font-semibold underline hover:no-underline"
            >
              Clear filters and search
            </button>
          )}
        </div>
      ) : (
        /* Event Cards Grid */
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {sortedEvents.map((event) => {
              // Calculate registered count
              const registeredCount = event.registrations
                ?.filter((r) => r.registration_status === 'Registered')
                .reduce((sum, r) => sum + (r.count || 1), 0) || 0;
              
              // Check if current user registered
              const userReg = event.registrations?.find(
                (r) => r.resident_id === user?.id && r.registration_status === 'Registered'
              );
              
              const isUserRegistered = !!userReg;

              const isCancelled = event.status === 'Cancelled';
              const isCompleted = event.status === 'Completed';

              return (
                <motion.div
                  layout
                  key={event.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image Slot */}
                    <div className="h-36 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {event.coverImage || event.cover_image ? (
                        <img 
                          src={event.coverImage || event.cover_image} 
                          alt={event.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-society-primary/10 to-[#D4AF37]/5 flex items-center justify-center">
                          <Calendar className="w-10 h-10 text-society-primary/20 dark:text-white/20" />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
                          isCancelled
                            ? 'bg-rose-500 text-white'
                            : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-society-primary/90 text-white dark:bg-[#D4AF37]/90 dark:text-society-primary'
                        }`}>
                          {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : 'Upcoming'}
                        </span>
                        {isUserRegistered && !isCancelled && !isCompleted && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RSVP’d ({userReg.count})
                          </span>
                        )}
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                        {getCategoryIcon(event.eventType || event.event_type)}
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                          {event.eventType || event.event_type}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <Link to={`/resident/events/${event.id}`}>
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm hover:text-society-primary dark:hover:text-[#D4AF37] transition leading-snug line-clamp-1">
                            {event.title}
                          </h3>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-450 flex-shrink-0" />
                          <span>{formatEventDate(event.eventDate || event.event_date)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-600"></span>
                          <Clock className="w-3.5 h-3.5 text-slate-450 flex-shrink-0" />
                          <span>{event.startTime || event.start_time} - {event.endTime || event.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                          <span className="line-clamp-1">Venue: {event.location}</span>
                        </div>
                        
                        {/* Attendance Seats Count */}
                        {!isCancelled && !isCompleted && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-450 flex-shrink-0" />
                            <span>
                              {registeredCount} {registeredCount === 1 ? 'resident RSVP' : 'residents RSVP’d'}
                              {event.maxAttendees || event.max_attendees ? ` (Cap: ${event.maxAttendees || event.max_attendees})` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3">
                    <Link
                      to={`/resident/events/${event.id}`}
                      className="text-[11px] font-bold text-slate-600 hover:text-society-primary dark:text-slate-450 dark:hover:text-white flex items-center gap-1 transition"
                    >
                      View Agenda <ChevronRight className="w-3 h-3" />
                    </Link>

                    {isCancelled || isCompleted ? (
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 italic">
                        {isCancelled ? 'Gathering Cancelled' : 'Gathering Finished'}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        {isUserRegistered ? (
                          <button
                            onClick={() => handleCancelRsvp(event)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Cancel RSVP
                          </button>
                        ) : (
                          <button
                            onClick={() => openRsvpDrawer(event)}
                            disabled={
                              (event.maxAttendees || event.max_attendees) && 
                              registeredCount >= (event.maxAttendees || event.max_attendees)
                            }
                            className={`text-[10px] font-bold px-4 py-1.5 rounded-lg transition shadow-sm ${
                              (event.maxAttendees || event.max_attendees) && 
                              registeredCount >= (event.maxAttendees || event.max_attendees)
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary'
                            }`}
                          >
                            {(event.maxAttendees || event.max_attendees) && 
                            registeredCount >= (event.maxAttendees || event.max_attendees)
                              ? 'Full Capacity'
                              : 'Register RSVP'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RSVP Registration Modal / Slide-over Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
            {/* Backdrop close area */}
            <div className="absolute inset-0 cursor-pointer" onClick={closeRsvpDrawer}></div>
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-extrabold text-society-primary dark:text-white">
                    Confirm Event RSVP
                  </h3>
                  <button 
                    onClick={closeRsvpDrawer}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 px-2 py-0.5 rounded uppercase">
                    {selectedEvent.eventType || selectedEvent.event_type}
                  </span>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                    {selectedEvent.title}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Date: {formatEventDate(selectedEvent.eventDate || selectedEvent.event_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Time: {selectedEvent.startTime || selectedEvent.start_time} - {selectedEvent.endTime || selectedEvent.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-450" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Venue: {selectedEvent.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Number of Attending Members
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Specify how many family members (including yourself) from your flat will attend this gathering.
                  </p>
                  
                  <div className="flex gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRsvpCount(num)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                          rsvpCount === num
                            ? 'bg-society-primary text-white border-society-primary dark:bg-[#D4AF37] dark:text-society-primary dark:border-[#D4AF37] font-black shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
                <button
                  onClick={handleRegisterRsvp}
                  disabled={isSubmittingRsvp}
                  className="flex-1 bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-md disabled:opacity-50"
                >
                  {isSubmittingRsvp ? 'Confirming...' : 'Confirm Registration'}
                </button>
                <button
                  onClick={closeRsvpDrawer}
                  className="border border-slate-250 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold py-2.5 px-4 rounded-lg text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Events;
