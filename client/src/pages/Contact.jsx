import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, MapPin, Send, HelpCircle } from 'lucide-react';
import MapWidget from '../components/map/MapWidget';
import { useToast } from '../context/ToastContext';

function Contact() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      addToast(`Thank you, ${formData.name}. Your inquiry has been forwarded to the committee.`, 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 max-w-5xl mx-auto py-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Contact Committee Office
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          Have queries regarding NOCs, maintenance accounts, or building rules? Reach out to our management.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Form */}
        <motion.form 
          variants={itemVariants} 
          onSubmit={handleSubmit} 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5 transition-theme"
        >
          <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-base border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wide">
            Send an Inquiry
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Your Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Parth Patel"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Email Address *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. parth@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Subject</label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Resale NOC request, Parking allotment query"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1">Message Content *</label>
            <textarea 
              rows="5"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your details here..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-society-secondary dark:text-white"
              required 
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-society-primary text-white hover:bg-slate-800 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry'}</span>
          </button>
        </motion.form>

        {/* Details & Map */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start gap-3 transition-theme">
              <div className="p-2 bg-[#D4AF37]/10 dark:bg-yellow-500/5 text-[#D4AF37] rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs uppercase tracking-wide">Office Address</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Plot-1, Sector-5, Ulwe Node,<br/>Wahal, Navi Mumbai, 410206
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start gap-3 transition-theme">
              <div className="p-2 bg-[#D4AF37]/10 dark:bg-yellow-500/5 text-[#D4AF37] rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs uppercase tracking-wide">Office Hours</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Saturdays & Sundays<br/>10:00 AM to 1:00 PM IST
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start gap-3 transition-theme">
              <div className="p-2 bg-[#D4AF37]/10 dark:bg-yellow-500/5 text-[#D4AF37] rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs uppercase tracking-wide">Email Directory</h4>
                <p className="text-slate-550 dark:text-slate-400 text-[11px] mt-1 leading-relaxed truncate">
                  office@suyashpride.org<br/>support@suyashpride.org
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start gap-3 transition-theme">
              <div className="p-2 bg-[#D4AF37]/10 dark:bg-yellow-500/5 text-[#D4AF37] rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs uppercase tracking-wide">Office Phone</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                  +91 22 2738 8899<br/>+91 98200 12345
                </p>
              </div>
            </div>
          </div>

          {/* Leaflet Map Embed */}
          <MapWidget />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Contact;
