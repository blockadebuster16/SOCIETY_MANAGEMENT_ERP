import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Clock, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { saveEvent } from '../../utils/mockDb';
import { useToast } from '../../context/ToastContext';

function CreateEvent() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('Festival');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  
  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    'Festival', 'AGM', 'SGM', 'Sports', 'Cultural', 
    'Maintenance', 'Emergency Meeting', 'Vendor Meeting', 'Workshop', 'Other'
  ];

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
      addToast('Venue location must be at least 3 characters.', 'warning');
      return false;
    }
    if (!eventDate) {
      addToast('A valid event date is required.', 'warning');
      return false;
    }
    
    // Date not in past check
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      addToast('Event date cannot be in the past.', 'warning');
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Prepare data
    const eventData = {
      title,
      description,
      eventType,
      location,
      eventDate,
      startTime,
      endTime,
      maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
      status: 'Draft' // Default status
    };

    try {
      // 1. Attempt API submission
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null) {
          formData.append(key, eventData[key]);
        }
      });
      if (imageFile) {
        formData.append('coverImage', imageFile);
      }

      await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      addToast('Event scheduled successfully as a Draft!', 'success');
      navigate('/admin/events');
    } catch (err) {
      console.warn('API submission failed, falling back to mockDb:', err.message);
      
      // 2. Fallback to mockDb
      const newMockEvent = {
        id: `e-${Date.now()}`,
        ...eventData,
        coverImage: imagePreview || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        registrations: [],
        gallery: []
      };

      saveEvent(newMockEvent);
      addToast('Event saved successfully (Demo Mode - Draft)!', 'success');
      navigate('/admin/events');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link 
          to="/admin/events" 
          className="text-xs font-bold text-slate-600 hover:text-society-primary dark:text-slate-400 dark:hover:text-[#D4AF37] inline-flex items-center gap-1.5 mb-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gatherings List
        </Link>
        <h2 className="text-2xl font-black text-society-primary dark:text-white">Schedule New Society Event</h2>
        <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">
          Draft a new general body meeting, sports festival, or cultural circular.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider mb-1.5">
                Event Title
              </label>
              <input 
                type="text" 
                placeholder="e.g. Independence Day Flag Hoisting Ceremony" 
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
                placeholder="Detail the complete agenda, guest invite rules, and breakfast layouts..."
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
                  placeholder="e.g. Main Clubhouse / Perimeter Lawn" 
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
                  Max Attendees Limit (Optional)
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
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-950 dark:file:text-slate-300 hover:file:bg-slate-200 transition file:cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-society-primary hover:bg-slate-850 text-white dark:bg-[#D4AF37] dark:hover:bg-yellow-500 dark:text-society-primary font-bold py-2.5 px-6 rounded-lg text-xs transition shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule (Save Draft)'}
            </button>
            <Link 
              to="/admin/events" 
              className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-6 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Live Banner Preview
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
                  {title || 'Untitled Gatherings Agenda'}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                  {description || 'Provide details in the form to render live card preview...'}
                </p>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{eventDate ? new Date(eventDate).toLocaleDateString('en-IN') : 'Date not set'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{startTime || '00:00'} to {endTime || '00:00'}</span>
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
    </div>
  );
}

export default CreateEvent;
