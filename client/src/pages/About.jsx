import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Users, MapPin, Building2, FlameKindling } from 'lucide-react';

function About() {
  const committee = [
    { name: 'Rajesh Mehta', role: 'Society President', desc: 'Oversees community administration, legal governance, and public disputes resolution.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { name: 'Parth Patel', role: 'Committee Secretary', desc: 'Handles notice dispatches, member registration directories, and general meeting scheduling.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { name: 'Rohan Sharma', role: 'Committee Treasurer', desc: 'Manages maintenance collections, ledger audits, Razorpay accounts, and financial invoicing.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
  ];

  const wingsInfo = [
    { wing: 'Wing A', flats: '28 Flats', floors: 'G + 7 Floors', type: '2 BHK Premium' },
    { wing: 'Wing B', flats: '28 Flats', floors: 'G + 7 Floors', type: '1 BHK & 2 BHK' },
    { wing: 'Wing C', flats: '28 Flats', floors: 'G + 7 Floors', type: '2 BHK Premium' },
    { wing: 'Wing D', flats: '28 Flats', floors: 'G + 7 Floors', type: '1 BHK Layouts' },
  ];

  const milestones = [
    { year: '2023', title: 'Project Completion', desc: 'Handed over by developer with complete environmental certification.' },
    { year: '2024', title: 'Committee Election', desc: 'Elected first official Management Committee for legal registration.' },
    { year: '2025', title: 'Solar Grid Installation', desc: 'Switched 100% common area power sources to sustainable solar panels.' },
    { year: '2026', title: 'Digital Portal Launch', desc: 'Implemented digital notifications, online Razorpay billing, and AI bot helpdesk.' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-16 max-w-5xl mx-auto py-4"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl md:text-4xl font-extrabold text-society-primary dark:text-white font-serif">
          About Suyash Pride
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          A vibrant community of 137 families established in Sector-5, Ulwe Node, Navi Mumbai.
        </p>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4 rounded"></div>
      </motion.div>

      {/* Grid: Overview & Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.div variants={itemVariants} className="space-y-6">
          <h3 className="text-2xl font-bold text-society-primary dark:text-[#D4AF37]">
            Premium Housing Infrastructure
          </h3>
          <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed">
            Suyash Pride Housing Society Ltd. offers a balanced blend of modern urban aesthetics and eco-friendly infrastructure. Registered officially as a cooperative housing society under Mumbai bylaws, we house 112 residential flats and 25 commercial ground-floor shops.
          </p>
          <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed">
            We prioritize environmental responsibility, hosting dedicated rainwater recharge shafts, composting units, and rooftop solar installations that reduce carbon output.
          </p>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-355">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
              <span>137 Units Total</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-355">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span>Ulwe Node</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-355">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span>Cooperative Certified</span>
            </div>
          </div>
        </motion.div>

        {/* Wing Cards Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          {wingsInfo.map((w, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-center transition-theme hover:-translate-y-1 transition-transform">
              <h4 className="font-bold text-[#D4AF37] text-lg mb-1">{w.wing}</h4>
              <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{w.flats}</p>
              <p className="text-slate-400 text-[10px] mt-1">{w.floors}</p>
              <span className="inline-block mt-3 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200/50">
                {w.type}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Roster: Management Committee */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-society-primary dark:text-white">
            Elected Management Committee
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Elected office-bearers managing day-to-day services, audits, security, and notices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {committee.map((c, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col items-center p-6 text-center hover:shadow-md transition-theme transition-transform hover:-translate-y-1"
            >
              <img src={c.image} alt={c.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#D4AF37]/20 mb-4" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">{c.name}</h4>
              <span className="text-xs font-semibold text-[#D4AF37] mt-1 mb-3 block uppercase tracking-wider">{c.role}</span>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* History / Timeline Section */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-society-primary dark:text-white">
            Our Journey
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Key steps taken to transition Suyash Pride into Ulwe\'s premier tech-enabled complex.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
          {milestones.map((m, idx) => (
            <div key={idx} className="relative z-10 text-center space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl md:bg-transparent md:border-none md:p-0">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-850 border-4 border-[#D4AF37] dark:border-slate-700 mx-auto flex items-center justify-center font-bold text-society-primary dark:text-[#D4AF37] shadow-sm">
                {m.year}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-205 text-sm">{m.title}</h4>
              <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed max-w-[180px] mx-auto">{m.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

export default About;
