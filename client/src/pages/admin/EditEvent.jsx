import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Users, Clock, Image as ImageIcon, 
  Save, UploadCloud, CheckCircle2, XCircle, Users2, RefreshCw, 
  AlertTriangle, Trash2, ShieldCheck, CheckSquare, Plus, X 
} from 'lucide-react';
import api from '../../services/api';
import { getEventById, saveEvent, updateEventAttendance, uploadEventGalleryImages } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('Festival');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Gallery Upload state
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const eventTypes = [
    'Festival', 'AGM', 'SGM', 'Sports', 'Cultural', 
    'Maintenance', 'Emergency Meeting', 'Vendor Meeting', 'Workshop', 'Other'
  ];

  const loadEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data && response.data.success) {
        const data = response.data.event || response.data.data;
        setEvent(data);
        populateForm(data);
        setUsingMockData(false);
      } else {
        throw new Error('API schema mismatched');
      }
    } catch (err) {
      console.warn('API error fetching event details, falling back to mockDb:', err.message);
      const mockEvent = getEventById(id);
      if (mockEvent) {
        setEvent(mockEvent);
        populateForm(mockEvent);
        setUsingMockData(true);
      } else {
        setError('Event not found in repository database.');
      }
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setTitle(data.title || '');
    setDescription(data.description || '');
    setEventType(data.eventType || data.event_type || 'Festival');
    setLocation(data.location || '');
    setEventDate(data.eventDate || data.event_date || '');
    setStartTime(data.startTime || data.start_time || '');
    setEndTime(data.endTime || data.end_time || '');
    setMaxAttendees(data.maxAttendees !== undefined && data.maxAttendees !== null ? data.maxAttendees : (data.max_attendees || ''));
    setImagePreview(data.coverImage || data.cover_image || '');
  };

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery multi-select handler
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setGalleryFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadGallery = async () => {
    if (galleryPreviews.length === 0) return;
    setIsUploadingGallery(true);
    try {
      if (usingMockData) {
        uploadEventGalleryImages(id, galleryPreviews);
        addToast('Images added to event gallery successfully (Demo Mode)!', 'success');
      } else {
        const formData = new FormData();
        galleryFiles.forEach(file => {
          formData.append('images', file);
        });
        await api.post(`/events/${id}/gallery`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('Images added to event gallery successfully!', 'success');
      }
      setGalleryFiles([]);
      setGalleryPreviews([]);
      loadEventDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload gallery images.', 'error');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const validateForm = () => {
    if (title.trim().length < 5 || title.length > 200) {
      addToast('Title must be between 5 and 200 characters.', 'warning');
      return false;
    }
    if (description.trim().length < 10) {
      addToast('Description must be at least 10 characters long.', 'warning');
      return false;
    }
    if (location.trim().length < 3) {
      addToast('Location must be at least 3 characters.', 'warning');
      return false;
    }
    if (!eventDate) {
      addToast('A valid event date is required.', 'warning');
      return false;
    }
    if (!startTime || !endTime) {
      addToast('Start and end times are required.', 'warning');
      return false;
    }
    if (maxAttendees !== '') {
      const attendees = parseInt(maxAttendees, 10);
      if (isNaN(attendees) || attendees <= 0) {
        addToast('Max attendees must be a positive integer.', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const updateData = {
      title,
      description,
      eventType,
      location,
      eventDate,
      startTime,
      endTime,
      maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null
    };

    try {
      if (usingMockData) {
        saveEvent({
          ...event,
          ...updateData,
          coverImage: imagePreview
        });
        addToast('Event modified successfully (Demo Mode)!', 'success');
      } else {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== null) {
            formData.append(key, updateData[key]);
          }
        });
        if (imageFile) {
          formData.append('coverImage', imageFile);
        }

        await api.patch(`/events/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        addToast('Event agenda updated successfully!', 'success');
      }
      loadEventDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update event agenda.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Attendance tracking toggle
  const handleAttendanceChange = async (residentId, newStatus) => {
    try {
      if (usingMockData) {
        updateEventAttendance(id, residentId, newStatus);
        addToast(`RSVP status updated to ${newStatus} (Demo Mode).`, 'success');
      } else {
        await api.patch(`/events/${id}/attendance`, { residentId, status: newStatus });
        addToast(`RSVP status updated to ${newStatus}.`, 'success');
      }
      loadEventDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update attendance status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-society-primary dark:border-[#D4AF37]"></div>
        <p className="text-slate-555 text-xs font-semibold">Fetching event file details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Dossier Missing</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{error || 'Requested event has expired or is invalid.'}</p>
        <Link to="/admin/events" className="inline-flex items-center gap-1 text-xs font-bold text-society-primary dark:text-[#D4AF37] underline">
          ← Back to Events Manager
        </Link>
      </div>
    );
  }

  // Prepopulate default RSVP registrations if empty to make UI useful
  const activeRegistrations = event.registrations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            to="/admin/events" 
            className="text-xs font-bold text-slate-600 hover:text-society-primary dark:text-slate-400 dark:hover:text-[#D4AF37] inline-flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Gatherings List
          </Link>
          <h2 className="text-2xl font-black text-society-primary dark:text-white">Modify Event Agenda</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">
            Editing event: <span className="font-extrabold text-slate-700 dark:text-slate-350">{event.title}</span> (Status: {event.status})
          </p>
        </div>
        {usingMockData && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 shadow-sm">
            <AlertTriangle className="w-2.5 h-2.5" /> Demo Mode
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-250 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === 'agenda' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Modify Details
          {activeTab === 'agenda' && (
            <motion.div layoutId="editTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'attendance' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          RSVP & Attendance
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            {activeRegistrations.filter(r => r.registration_status === 'Registered').length}
          </span>
          {activeTab === 'attendance' && (
            <motion.div layoutId="editTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
            activeTab === 'gallery' 
              ? 'text-society-primary dark:text-[#D4AF37]' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Event Media Gallery
          {activeTab === 'gallery' && (
            <motion.div layoutId="editTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-society-primary dark:bg-[#D4AF37]" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'agenda' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Form */}
            <form onSubmit={handleUpdateEvent} className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                    Event Title
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                    required 
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                    Event description / Circular Content
                  </label>
                  <textarea 
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                    required 
                  ></textarea>
                </div>

                {/* Grid for Category, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                    >
                      {eventTypes.map((t) => (
                        <option key={t} value={t} className="bg-white dark:bg-slate-900">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Venue Location
                    </label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                      required 
                    />
                  </div>
                </div>

                {/* Grid for Date, Start Time, End Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Event Date
                    </label>
                    <input 
                      type="date" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Start Time
                    </label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      End Time
                    </label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                      required 
                    />
                  </div>
                </div>

                {/* Grid for Max Attendees and Cover Image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Max Attendees Limit
                    </label>
                    <input 
                      type="number" 
                      placeholder="Leave blank for open gates" 
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-250 dark:border-slate-755 text-xs bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 outline-none focus:ring-1 focus:ring-society-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                      Cover Image Banner
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-950 dark:file:text-slate-300 hover:file:bg-slate-200 transition file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold py-2.5 px-6 rounded-lg text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Modifications'}
                </button>
                <Link 
                  to="/admin/events" 
                  className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-6 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </Link>
              </div>
            </form>

            {/* Preview Card */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-3">
                Cover Banner Preview
              </h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[340px]">
                <div className="h-36 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-society-primary/10 to-[#D4AF37]/5 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-250 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {eventType}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs line-clamp-1">
                      {title || 'Untitled Gathering'}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                      {description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
                      <span>{eventDate ? new Date(eventDate).toLocaleDateString('en-IN') : 'Date not set'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Venue: {location || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: RSVP & Attendance */}
        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <Users2 className="w-4.5 h-4.5 text-society-primary dark:text-[#D4AF37]" /> Resident Registration Roster
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  Cross check attendance during the gathering. RSVP status updates sync with client portal dashboards.
                </p>
              </div>
            </div>

            {activeRegistrations.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Users2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-850 dark:text-white text-sm">Roster Empty</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  No resident has registered for this gathering yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-450 uppercase font-black tracking-wider">
                      <th className="px-5 py-3">Resident Name / Flat</th>
                      <th className="px-5 py-3">Register Timestamp</th>
                      <th className="px-5 py-3 text-center">Guest Count</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800/80">
                    {activeRegistrations.map((reg) => {
                      const regDateStr = reg.registered_at 
                        ? new Date(reg.registered_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })
                        : 'Simulated';

                      return (
                        <tr key={reg.id || reg.resident_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                          <td className="px-5 py-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-white text-xs">{reg.residentName || 'Parth Patel'}</span>
                              <span className="block text-[10px] text-slate-400 font-semibold">{reg.flat || 'Flat A-102'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {regDateStr}
                          </td>
                          <td className="px-5 py-3 text-center text-xs font-extrabold text-slate-850 dark:text-slate-200">
                            {reg.count || 1}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              reg.registration_status === 'Attended'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                : reg.registration_status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                            }`}>
                              {reg.registration_status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex gap-1.5 justify-end">
                              {reg.registration_status !== 'Attended' && (
                                <button
                                  onClick={() => handleAttendanceChange(reg.resident_id, 'Attended')}
                                  className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 border border-emerald-250 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg transition"
                                >
                                  Mark Attended
                                </button>
                              )}
                              {reg.registration_status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleAttendanceChange(reg.resident_id, 'Cancelled')}
                                  className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border border-rose-250 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg transition"
                                >
                                  Mark Cancelled
                                </button>
                              )}
                              {reg.registration_status !== 'Registered' && (
                                <button
                                  onClick={() => handleAttendanceChange(reg.resident_id, 'Registered')}
                                  className="text-[10px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/60 border border-blue-250 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg transition"
                                >
                                  Mark Registered
                                </button>
                              )}
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
        )}

        {/* Tab 3: Event Media Gallery */}
        {activeTab === 'gallery' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4.5 h-4.5 text-[#D4AF37]" /> Upload Gathering Photos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Upload images capturing memorable gatherings to render on the resident dashboard past event gallery.
              </p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/40 dark:bg-slate-950/20 relative group hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-3">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto group-hover:text-society-primary dark:group-hover:text-[#D4AF37] transition" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drag & Drop images or click to browse files
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">
                  Supports PNG, JPEG, WEBP up to 10 files simultaneously
                </p>
              </div>
            </div>

            {/* Pending Previews */}
            {galleryPreviews.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold text-slate-750 dark:text-slate-350 flex items-center gap-1.5">
                  Selected Images ({galleryPreviews.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-950 group">
                      <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUploadGallery}
                    disabled={isUploadingGallery}
                    className="bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold py-2 px-5 rounded-lg text-xs transition shadow disabled:opacity-50"
                  >
                    {isUploadingGallery ? 'Uploading...' : 'Confirm Upload to Gallery'}
                  </button>
                  <button
                    onClick={() => { setGalleryFiles([]); setGalleryPreviews([]); }}
                    className="border border-slate-250 dark:border-slate-700 text-slate-650 dark:text-slate-350 font-bold py-2 px-5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Current Event Gallery List */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold text-slate-750 dark:text-slate-300">
                Uploaded Gallery Photos ({event.gallery?.length || 0})
              </h4>
              {event.gallery && event.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {event.gallery.map((imgUrl, index) => (
                    <div key={index} className="aspect-square border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative group bg-slate-100 dark:bg-slate-950 shadow-sm">
                      <img src={imgUrl} alt={`Uploaded photo ${index + 1}`} className="w-full h-full object-cover" />
                      {/* Delete action */}
                      <button
                        onClick={async () => {
                          if (!window.confirm('Delete image from gallery?')) return;
                          try {
                            const newGallery = event.gallery.filter((_, i) => i !== index);
                            if (usingMockData) {
                              saveEvent({ ...event, gallery: newGallery });
                            } else {
                              // Standard implementation can patch
                              await api.patch(`/events/${id}`, { gallery: newGallery });
                            }
                            addToast('Gallery photo deleted.', 'info');
                            loadEventDetails();
                          } catch (err) {
                            addToast('Failed to delete image.', 'error');
                          }
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-650 hover:bg-red-700 text-white rounded-full transition opacity-0 group-hover:opacity-100 shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-xs italic">
                  No images uploaded in this event’s album yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditEvent;
