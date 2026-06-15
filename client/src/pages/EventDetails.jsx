import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Clock, ArrowLeft, AlertTriangle, 
  CheckCircle2, Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight,
  UserCheck, Lock, Users2
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { getEventById, registerEventRSVP, cancelEventRSVP } from '../utils/mockDb';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // RSVP Form State
  const [rsvpCount, setRsvpCount] = useState(1);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

  // Lightbox State
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data && response.data.success) {
        setEvent(response.data.event || response.data.data);
        setUsingMockData(false);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.warn('API error fetching event details, trying mockDb:', err.message);
      const mockEvent = getEventById(id);
      if (mockEvent) {
        setEvent(mockEvent);
        setUsingMockData(true);
      } else {
        setError('Event not found in repository database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  // Countdown timer logic
  useEffect(() => {
    if (!event) return;
    const eventDateStr = event.eventDate || event.event_date;
    const startTimeStr = event.startTime || event.start_time || '00:00';
    const target = new Date(`${eventDateStr}T${startTimeStr}`);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [event]);

  // Sync RSVP Form default count if already registered
  useEffect(() => {
    if (event && isAuthenticated && user) {
      const userReg = event.registrations?.find(
        (r) => r.resident_id === user.id && r.registration_status === 'Registered'
      );
      if (userReg) {
        setRsvpCount(userReg.count || 1);
      }
    }
  }, [event, isAuthenticated, user]);

  const handleRegisterRsvp = async () => {
    if (!isAuthenticated) {
      addToast('Please login to register an RSVP.', 'warning');
      navigate('/login');
      return;
    }
    setIsSubmittingRsvp(true);
    try {
      if (usingMockData) {
        registerEventRSVP(event.id, user.id || 'res-101', rsvpCount);
        addToast(`Registered RSVP for ${rsvpCount} member(s).`, 'success');
      } else {
        await api.post(`/events/${event.id}/register`, { count: rsvpCount });
        addToast(`Registered RSVP for ${rsvpCount} member(s).`, 'success');
      }
      loadEvent();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit RSVP.', 'error');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  const handleCancelRsvp = async () => {
    if (!window.confirm('Are you sure you want to cancel your RSVP registration?')) return;
    try {
      if (usingMockData) {
        cancelEventRSVP(event.id, user.id || 'res-101');
        addToast('Cancelled your RSVP registration.', 'info');
      } else {
        await api.delete(`/events/${event.id}/register`);
        addToast('Cancelled your RSVP registration.', 'info');
      }
      loadEvent();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel RSVP.', 'error');
    }
  };

  const nextImage = () => {
    if (event.gallery && event.gallery.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % event.gallery.length);
    }
  };

  const prevImage = () => {
    if (event.gallery && event.gallery.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + event.gallery.length) % event.gallery.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-society-primary dark:border-[#D4AF37]"></div>
        <p className="text-slate-555 text-xs font-semibold">Loading gathering dossier...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Dossier Unavailable</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          {error || 'The requested event is either not published or deleted.'}
        </p>
        <Link 
          to="/resident/events" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-society-primary dark:text-[#D4AF37] underline"
        >
          ← Back to Events Board
        </Link>
      </div>
    );
  }

  // Calculated info
  const registeredCount = event.registrations
    ?.filter((r) => r.registration_status === 'Registered')
    .reduce((sum, r) => sum + (r.count || 1), 0) || 0;

  const userReg = isAuthenticated && user && event.registrations?.find(
    (r) => r.resident_id === user.id && r.registration_status === 'Registered'
  );
  
  const isUserRegistered = !!userReg;

  const isUpcoming = new Date(`${event.eventDate || event.event_date}T${event.startTime || event.start_time || '00:00'}`) >= new Date();
  const isCancelled = event.status === 'Cancelled';
  const isCompleted = event.status === 'Completed' || (!isUpcoming && !isCancelled);

  // Return route depends on layout
  const backRoute = isAuthenticated ? '/resident/events' : '/events';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Back Button & Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
        <Link 
          to={backRoute} 
          className="text-xs font-bold text-slate-600 hover:text-society-primary dark:text-slate-400 dark:hover:text-[#D4AF37] inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gatherings List
        </Link>
        {usingMockData && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 shadow-sm">
            <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details, Countdown, and Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Cover image banner */}
            <div className="h-60 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {event.coverImage || event.cover_image ? (
                <img 
                  src={event.coverImage || event.cover_image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-society-primary/10 to-[#D4AF37]/5 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-society-primary/20" />
                </div>
              )}
              
              {/* Category tag */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl shadow-md font-bold text-xs text-society-primary dark:text-[#D4AF37] tracking-wide">
                {event.eventType || event.event_type}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                  {event.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Specifications grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                    <Calendar className="w-5 h-5 text-society-primary dark:text-[#D4AF37]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Date</span>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                      {new Date(event.eventDate || event.event_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                    <Clock className="w-5 h-5 text-society-primary dark:text-[#D4AF37]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Hours</span>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                      {event.startTime || event.start_time} to {event.endTime || event.end_time}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Venue Venue</span>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                      {event.location}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                    <Users className="w-5 h-5 text-society-primary dark:text-[#D4AF37]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">RSVP Capacity</span>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                      {event.maxAttendees || event.max_attendees 
                        ? `${event.maxAttendees || event.max_attendees} slots limit` 
                        : 'Open Gates'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {isCompleted && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4.5 h-4.5 text-[#D4AF37]" /> Event Memory Gallery
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Moments captured from the gathering. Click on any thumbnail for full screen lightbox slide deck.
              </p>

              {event.gallery && event.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {event.gallery.map((imgUrl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveImageIndex(idx)}
                      className="aspect-square bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer shadow-sm relative group"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:opacity-90 transition"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-xl text-center space-y-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-slate-500 dark:text-slate-400 text-xs italic">No photos uploaded for this gathering yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: RSVP Actions & Countdown */}
        <div className="space-y-6">
          {/* Countdown Card (If upcoming) */}
          {isUpcoming && !isCancelled && timeLeft && (
            <div className="bg-gradient-to-br from-society-primary to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-society-primary/30 space-y-4 text-center">
              <span className="text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Countdown to Event
              </span>
              <div className="flex justify-center gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 min-w-[50px] shadow-inner">
                  <span className="text-lg font-black block font-serif">{timeLeft.days}</span>
                  <span className="text-[8px] text-slate-300 block uppercase font-bold tracking-wider">Days</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 min-w-[50px] shadow-inner">
                  <span className="text-lg font-black block font-serif">{timeLeft.hours}</span>
                  <span className="text-[8px] text-slate-300 block uppercase font-bold tracking-wider">Hrs</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 min-w-[50px] shadow-inner">
                  <span className="text-lg font-black block font-serif">{timeLeft.minutes}</span>
                  <span className="text-[8px] text-slate-300 block uppercase font-bold tracking-wider">Mins</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 min-w-[50px] shadow-inner">
                  <span className="text-lg font-black block font-serif">{timeLeft.seconds}</span>
                  <span className="text-[8px] text-slate-300 block uppercase font-bold tracking-wider">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* RSVP Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Attendance Roster
            </h3>

            {isCancelled ? (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl text-center space-y-2">
                <AlertTriangle className="w-7 h-7 text-rose-500 mx-auto" />
                <h4 className="font-bold text-rose-800 dark:text-rose-455 text-xs">Event Cancelled</h4>
                <p className="text-[11px] text-rose-650 dark:text-rose-400">
                  This meeting/celebration has been cancelled by the management committee.
                </p>
              </div>
            ) : isCompleted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-800 dark:text-emerald-455 text-xs">Gathering Completed</span>
                </div>
                <p className="text-[11px] text-emerald-650 dark:text-emerald-400 leading-relaxed">
                  This event took place on {formatEventDate(event.eventDate || event.event_date)}.
                  {isUserRegistered && (
                    <span className="block mt-1 font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ You registered RSVP for {userReg.count} guests.
                    </span>
                  )}
                </p>
              </div>
            ) : !isAuthenticated ? (
              /* Non-authenticated RSVP Callout */
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-xl text-center space-y-3">
                <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">RSVP Locked</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Only registered residents of Suyash Pride can RSVP for society events.
                </p>
                <Link
                  to="/login"
                  className="block bg-society-primary text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition shadow-sm"
                >
                  Log In to Register
                </Link>
              </div>
            ) : (
              /* Authenticated Resident Form */
              <div className="space-y-4">
                {isUserRegistered ? (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wider">
                        RSVP: Registered
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      You are listed as attending with <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{userReg.count} member(s)</span>.
                    </p>
                    <button
                      onClick={handleCancelRsvp}
                      className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 font-bold py-1.5 rounded-lg text-xs transition border border-rose-100 dark:border-rose-900/35"
                    >
                      Cancel RSVP Registration
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350">
                        Attending Family Count
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() => setRsvpCount(num)}
                            className={`w-8 h-8 rounded-lg text-xs font-black transition flex items-center justify-center border ${
                              rsvpCount === num
                                ? 'bg-society-primary text-white border-society-primary dark:bg-[#D4AF37] dark:text-society-primary dark:border-[#D4AF37] shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleRegisterRsvp}
                      disabled={
                        isSubmittingRsvp || 
                        ((event.maxAttendees || event.max_attendees) && registeredCount >= (event.maxAttendees || event.max_attendees))
                      }
                      className="w-full bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold py-2 px-4 rounded-lg text-xs transition shadow disabled:opacity-50"
                    >
                      {isSubmittingRsvp 
                        ? 'Submitting...' 
                        : (event.maxAttendees || event.max_attendees) && registeredCount >= (event.maxAttendees || event.max_attendees)
                          ? 'Capacity Full'
                          : 'Register My RSVP'}
                    </button>
                  </div>
                )}

                {/* Aggregate Attendance Stats */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5 text-slate-400" /> Confirmed Attendees
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      {registeredCount} 
                      {event.maxAttendees || event.max_attendees ? ` / ${event.maxAttendees || event.max_attendees}` : ''}
                    </span>
                  </div>

                  {event.maxAttendees || event.max_attendees ? (
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-society-primary dark:bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (registeredCount / (event.maxAttendees || event.max_attendees)) * 100)}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full screen Lightbox gallery modal */}
      <AnimatePresence>
        {activeImageIndex !== null && event.gallery && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
            {/* Close trigger button */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition z-55"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Nav */}
            <button
              onClick={prevImage}
              className="absolute left-5 text-white/70 hover:text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition z-55"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Image View */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-4xl max-h-[80vh] px-4 flex flex-col items-center gap-3 select-none"
            >
              <img
                src={event.gallery[activeImageIndex]}
                alt={`Lightbox image ${activeImageIndex + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              <span className="text-white/60 text-xs font-bold">
                Image {activeImageIndex + 1} of {event.gallery.length}
              </span>
            </motion.div>

            {/* Right Nav */}
            <button
              onClick={nextImage}
              className="absolute right-5 text-white/70 hover:text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition z-55"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventDetails;
