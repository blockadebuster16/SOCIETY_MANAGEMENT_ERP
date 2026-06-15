import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Plus, Edit, Trash2, CheckCircle2, 
  XCircle, Send, AlertTriangle, Search, Filter, Eye, RefreshCw,
  Clock, ArrowUpRight, CheckSquare
} from 'lucide-react';
import api from '../../services/api';
import { getEvents, deleteEvent, saveEvent } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';

function ManageEvents() {
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: '', // 'delete', 'cancel', 'publish', 'complete'
    event: null
  });

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/events');
      if (response.data && response.data.success) {
        setEvents(response.data.events || response.data.data || []);
        setUsingMockData(false);
      } else {
        throw new Error('API schema mismatched');
      }
    } catch (err) {
      console.warn('API error listing events, falling back to mockDb:', err.message);
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

  const openConfirmModal = (type, event) => {
    setConfirmState({ isOpen: true, type, event });
  };

  const closeConfirmModal = () => {
    setConfirmState({ isOpen: false, type: '', event: null });
  };

  const handleConfirmAction = async () => {
    const { type, event } = confirmState;
    if (!event) return;

    try {
      if (type === 'delete') {
        if (usingMockData) {
          deleteEvent(event.id);
        } else {
          await api.delete(`/events/${event.id}`);
        }
        addToast('Event deleted successfully.', 'success');
      } else if (type === 'publish') {
        if (usingMockData) {
          saveEvent({ ...event, status: 'Published' });
        } else {
          await api.patch(`/events/${event.id}/publish`);
        }
        addToast('Event published to resident portal successfully.', 'success');
      } else if (type === 'cancel') {
        if (usingMockData) {
          saveEvent({ ...event, status: 'Cancelled' });
        } else {
          await api.patch(`/events/${event.id}/cancel`);
        }
        addToast('Event cancelled successfully.', 'info');
      } else if (type === 'complete') {
        if (usingMockData) {
          saveEvent({ ...event, status: 'Completed' });
        } else {
          await api.patch(`/events/${event.id}/complete`);
        }
        addToast('Event status updated to completed.', 'success');
      }
      loadEvents();
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to perform action ${type}`, 'error');
    } finally {
      closeConfirmModal();
    }
  };

  // Stats calculation
  const totalEvents = events.length;
  
  const upcomingEvents = events.filter(e => {
    const eventDateStr = e.eventDate || e.event_date;
    const startTimeStr = e.startTime || e.start_time || '00:00';
    const eventDateObj = new Date(`${eventDateStr}T${startTimeStr}`);
    return eventDateObj >= new Date() && e.status === 'Published';
  }).length;

  const completedEvents = events.filter(e => e.status === 'Completed').length;
  const cancelledEvents = events.filter(e => e.status === 'Cancelled').length;

  const totalRsvps = events.reduce((sum, e) => {
    const validRegs = e.registrations
      ?.filter(r => r.registration_status === 'Registered')
      .reduce((s, r) => s + (r.count || 1), 0) || 0;
    return sum + validRegs;
  }, 0);

  // Filters logic
  const filteredEvents = events.filter(e => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = e.title?.toLowerCase().includes(searchLower) || false;
    const locMatch = e.location?.toLowerCase().includes(searchLower) || false;
    const descMatch = e.description?.toLowerCase().includes(searchLower) || false;
    const matchesSearch = titleMatch || locMatch || descMatch;

    const matchesCategory = categoryFilter === 'ALL' || e.eventType === categoryFilter || e.event_type === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    'ALL', 'AGM', 'SGM', 'Festival', 'Sports', 'Cultural', 
    'Maintenance', 'Emergency Meeting', 'Vendor Meeting', 'Workshop', 'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white flex items-center gap-2">
            Manage Society Gatherings
            {usingMockData && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 shadow-sm">
                <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
              </span>
            )}
          </h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">
            Schedule cultural assemblies, official board AGMs, track guest RSVPs, and verify attendance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadEvents}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link 
            to="/admin/events/new" 
            className="bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Events</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-1">{totalEvents}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 dark:text-[#D4AF37] font-extrabold uppercase tracking-wider">Upcoming</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-1">{upcomingEvents}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Completed</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-1">{completedEvents}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-wider">Cancelled</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-1">{cancelledEvents}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider">Total RSVPs</span>
          <span className="text-xl font-black text-slate-800 dark:text-white mt-1">{totalRsvps}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, description or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-250 dark:border-slate-700 text-xs focus:ring-1 focus:ring-society-primary focus:border-society-primary bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-700 rounded-lg px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900">
                  {c === 'ALL' ? 'All' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-700 rounded-lg px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">All</option>
              <option value="Draft" className="bg-white dark:bg-slate-900">Draft</option>
              <option value="Published" className="bg-white dark:bg-slate-900">Published</option>
              <option value="Cancelled" className="bg-white dark:bg-slate-900">Cancelled</option>
              <option value="Completed" className="bg-white dark:bg-slate-900">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Listing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-society-primary dark:border-[#D4AF37]"></div>
            <p className="text-slate-500 text-xs">Loading gatherings registry...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">No Events Located</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              No matching events found in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-450 uppercase font-black tracking-wider">
                  <th className="px-5 py-3">Event Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-center">Registrations</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80">
                {filteredEvents.map((event) => {
                  const eventDateStr = event.eventDate || event.event_date;
                  const startTimeStr = event.startTime || event.start_time;
                  
                  // Calculate RSVPs
                  const registeredCount = event.registrations
                    ?.filter(r => r.registration_status === 'Registered')
                    .reduce((sum, r) => sum + (r.count || 1), 0) || 0;

                  const isDraft = event.status === 'Draft';
                  const isPublished = event.status === 'Published';
                  const isCancelled = event.status === 'Cancelled';
                  const isCompleted = event.status === 'Completed';

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <Link to={`/resident/events/${event.id}`} className="font-extrabold text-slate-800 dark:text-white text-xs hover:text-society-primary hover:underline transition">
                            {event.title}
                          </Link>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {eventDateStr}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {startTimeStr}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-0.5 text-[#D4AF37]"><MapPin className="w-3 h-3" /> {event.location}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300 px-2 py-0.5 rounded uppercase">
                          {event.eventType || event.event_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="text-xs font-bold text-slate-850 dark:text-slate-200">
                          {registeredCount} 
                          {event.maxAttendees || event.max_attendees ? (
                            <span className="text-[10px] text-slate-400 font-medium"> / {event.maxAttendees || event.max_attendees}</span>
                          ) : ' (Open)'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isDraft
                            ? 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                            : isPublished
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                              : isCancelled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                        }`}>
                          {event.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/admin/events/${event.id}/edit`}
                            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 transition"
                            title="Edit Event & Attendance"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {isDraft && (
                            <button
                              onClick={() => openConfirmModal('publish', event)}
                              className="p-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                              title="Publish Event"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isPublished && (
                            <>
                              <button
                                onClick={() => openConfirmModal('complete', event)}
                                className="p-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                                title="Mark Completed"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openConfirmModal('cancel', event)}
                                className="p-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                                title="Cancel Event"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => openConfirmModal('delete', event)}
                            className="p-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
                    Confirm Action
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    {confirmState.type === 'delete' && 'Are you sure you want to delete this event? This action is permanent.'}
                    {confirmState.type === 'publish' && 'Do you want to publish this event circular? It will become visible to all residents.'}
                    {confirmState.type === 'cancel' && 'Are you sure you want to cancel this event? Residents will be notified.'}
                    {confirmState.type === 'complete' && 'Mark this gathering as completed and lock registrations?'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition ${
                    confirmState.type === 'delete' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : confirmState.type === 'publish'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : confirmState.type === 'complete'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageEvents;
