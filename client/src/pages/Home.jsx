import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck, Zap, Sun, Droplets, Car, Compass,
  Download, Send, ArrowRight, BookOpen, AlertCircle,
  Calendar, ChevronDown, MapPin, Phone, Mail, Clock,
  Building2, Users, Star, Award, TreePine, Wifi
} from 'lucide-react';
import NoticeCard from '../components/notices/NoticeCard';
import EventCard from '../components/events/EventCard';
import MapWidget from '../components/map/MapWidget';
import { useToast } from '../context/ToastContext';

import heroBg from '../assets/hero_building.png';
import amenitiesImg from '../assets/society_amenities.png';
import exteriorImg from '../assets/society_exterior.png';

/* ──────────────── Animation helpers ──────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ──────────────── Data ──────────────── */
const amenities = [
  { title: '24/7 Gate Security', desc: 'CCTV surveillance, guard patrols, and visitor validation gate controls.', icon: ShieldCheck },
  { title: 'Solar Electricity Grid', desc: 'Solar panels powering common areas and street lights, cutting society grid costs.', icon: Sun },
  { title: 'Water Harvesting System', desc: 'Rain-water harvesting wells to maintain groundwater tables year-round.', icon: Droplets },
  { title: 'Diesel Power Backup', desc: 'Automatic generator coverage for lifts, water pumps, and stairwells.', icon: Zap },
  { title: 'Allotted Vehicle Parking', desc: 'Secured multi-level parking allotments for residential and commercial cars.', icon: Car },
  { title: 'Lush Green Spaces', desc: 'Manicured gardens, recreational lawn, and children\'s play areas.', icon: TreePine },
  { title: 'High-Speed Connectivity', desc: 'Fibre-optic broadband infrastructure with multiple ISP support.', icon: Wifi },
  { title: 'Prime Ulwe Location', desc: 'Walking distance to the upcoming Wahal railway hub and Ramsheth Thakur stadium.', icon: Compass },
];

const stats = [
  { value: 137, suffix: '', label: 'Total Units' },
  { value: 112, suffix: '', label: 'Residential Flats' },
  { value: 25, suffix: '', label: 'Commercial Shops' },
  { value: 18, suffix: '+', label: 'Years of Legacy' },
];

const galleryPreviews = [
  { title: 'Society Complex Wing', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { title: 'Recreational Lawn & Park', url: 'https://images.unsplash.com/photo-1558904541-efa8c3a30fc9?auto=format&fit=crop&w=800&q=80' },
  { title: 'Society Entrance Gate', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' },
  { title: 'Clubhouse & Lounge', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { title: 'Swimming Pool Area', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80' },
  { title: 'Security Checkpoint', url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80' },
];

const downloads = [
  { name: 'Society Membership Application', size: '184 KB', format: 'PDF' },
  { name: 'NOC Request Template (Sale/Rent)', size: '124 KB', format: 'PDF' },
  { name: 'Society General Rules Handbook', size: '890 KB', format: 'PDF' },
];

const notices = [
  {
    id: 'n1',
    title: 'Water Supply Maintenance Shutdown',
    content: 'The main water storage tanks will undergo cleaning on June 15, 2026. Water supply unavailable from 10:00 AM to 4:00 PM.',
    date: 'Jun 11, 2026',
    isPinned: true,
  },
  {
    id: 'n2',
    title: 'Implementation of New Security Entry App',
    content: 'From July 1, 2026, visitors and delivery personnel will only be allowed entry through security approval verification.',
    date: 'Jun 08, 2026',
    isPinned: false,
  },
];

const events = [
  {
    id: 'e1',
    title: 'Monsoon Tree Planting Drive',
    description: 'Let us plant 100 saplings in and around the society complex to keep our campus green.',
    date: 'Jul 12, 2026',
    venue: 'Society Perimeter',
    banner: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'e2',
    title: 'International Yoga Day Celebration',
    description: 'Morning yoga and meditation session in the society clubhouse under certified trainers.',
    date: 'Jun 21, 2026',
    venue: 'Clubhouse Hall',
    banner: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
  },
];

/* ──────────────── Component ──────────────── */
function Home() {
  const { addToast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);
  const heroTextY = useTransform(scrollY, [0, 500], [0, 120]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      addToast(`Thank you, ${contactForm.name}! Your message has been received.`, 'success');
      setContactForm({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════
          SECTION 1 – FULL-BLEED CINEMATIC HERO
          ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: heroScale }}
        >
          <img
            src={heroBg}
            alt="Suyash Pride Housing Complex"
            className="w-full h-full object-cover"
          />
          {/* Layered overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060F1C]/90 via-[#060F1C]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060F1C]/70 via-transparent to-[#060F1C]/20" />
        </motion.div>

        {/* Floating decorative accents */}
        <div className="absolute top-1/3 right-[10%] w-[300px] h-[300px] rounded-full bg-[#D4AF37]/8 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-[5%] w-[200px] h-[200px] rounded-full bg-blue-500/10 blur-[60px] pointer-events-none" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroTextY }}
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full"
        >
          <div className="max-w-2xl">
            {/* Premium tag */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">
                Ulwe, Navi Mumbai
              </span>
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-white font-black leading-none"
            >
              <span className="block text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">SUYASH</span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F0CB55] to-[#D4AF37]">
                PRIDE
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.2em] text-white/70 mt-2">
                HOUSING SOCIETY
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white/65 text-base sm:text-lg leading-relaxed mt-8 max-w-lg"
            >
              Experience premium community living at Plot-1, Sector-5, Ulwe Node.
              A secure, sustainable environment with 137 units, advanced amenities and transparent governance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link
                to="/login"
                className="group flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5C142] hover:to-[#C49A0D] text-[#060F1C] font-black px-8 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 shadow-2xl shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 hover:scale-105"
              >
                Access Member Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-3 border border-white/30 hover:border-[#D4AF37] text-white/90 hover:text-[#D4AF37] font-bold px-8 py-4 rounded-none text-[11px] tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-sm"
              >
                Explore Society
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-[#D4AF37]/60" />
          </motion.div>
        </motion.div>

        {/* Corner stat strip */}
        <div className="absolute bottom-0 left-0 right-0 hidden lg:flex">
          <div className="ml-auto mr-8 mb-12 flex items-end gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-right"
              >
                <div className="text-2xl font-black text-white">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[9px] text-white/40 tracking-[0.2em] uppercase">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 – OVERVIEW / HERITAGE
          ═══════════════════════════════════════ */}
      <section className="relative bg-white dark:bg-[#060F1C] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image side */}
            <FadeIn className="relative">
              <div className="relative h-[500px] lg:h-[600px] overflow-hidden rounded-none">
                <img
                  src={exteriorImg}
                  alt="Society exterior at night"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060F1C]/60 via-transparent to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-6 lg:right-8 bg-gradient-to-br from-[#D4AF37] to-[#8B6914] p-6 shadow-2xl">
                <div className="text-[#060F1C] font-black text-3xl">137</div>
                <div className="text-[#060F1C]/70 text-[10px] font-bold tracking-[0.2em] uppercase">Total Units</div>
              </div>
              {/* Decorative line accent */}
              <div className="absolute -left-4 top-12 w-1 h-32 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" />
            </FadeIn>

            {/* Text side */}
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">About Us</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                A HERITAGE OF<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA820A]">
                  EXCELLENCE.
                </span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6">
                Suyash Pride Housing Society Ltd. is a landmark residential community in Ulwe, Navi Mumbai.
                Spanning 112 residential flats and 25 commercial shops across 137 units, the society stands
                as a model for modern, transparent, and sustainable cooperative living.
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed mb-10">
                Our committee-driven governance ensures every resident's voice is heard — from maintenance
                decisions to cultural events. We combine the warmth of community with the efficiency of
                enterprise-grade management software.
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                {stats.map((s, i) => (
                  <div key={i} className="border-l-2 border-[#D4AF37]/30 pl-4">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      <CountUp target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[10px] text-slate-500 tracking-[0.15em] uppercase mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-[#D4AF37] font-bold text-sm tracking-widest uppercase border-b-2 border-[#D4AF37]/30 hover:border-[#D4AF37] pb-1 transition-all duration-300"
              >
                Discover More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 – FULL-WIDTH GOLD SEPARATOR
          ═══════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1} className="text-center">
                <div className="text-4xl lg:text-5xl font-black text-[#D4AF37]">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-slate-500 text-[10px] tracking-[0.25em] uppercase mt-2">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 – AMENITIES
          ═══════════════════════════════════════ */}
      <section className="relative bg-[#060F1C] py-24 lg:py-32 overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">World-class Facilities</span>
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              MODERN INFRASTRUCTURE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA820A]">
                & AMENITIES
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Designed to ensure safety, environmental sustainability, and unmatched convenience
              for all 137 society units.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-slate-800">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <FadeUp key={idx} delay={idx * 0.06}>
                  <div className="group p-8 border-b border-r border-slate-800 hover:bg-[#D4AF37]/5 transition-all duration-300 cursor-default">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 rounded-none mb-6 transition-all duration-300">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-3 tracking-wide">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                    <div className="w-6 h-[1px] bg-[#D4AF37] mt-6 group-hover:w-12 transition-all duration-300" />
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>

        {/* Amenities full-width image strip */}
        <div className="mt-20 relative h-64 lg:h-80 overflow-hidden">
          <img src={amenitiesImg} alt="Society amenities" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060F1C] via-transparent to-[#060F1C]" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 – NOTICES & EVENTS
          ═══════════════════════════════════════ */}
      <section className="bg-white dark:bg-[#060F1C] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Notices – 2 cols */}
            <div className="lg:col-span-2">
              <FadeUp>
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="w-6 h-[1px] bg-[#D4AF37]" />
                      <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Updates</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Latest Announcements</h2>
                  </div>
                  <Link to="/notices" className="group hidden sm:flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all pb-0.5">
                    View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </FadeUp>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {notices.map((notice, i) => (
                  <FadeUp key={notice.id} delay={i * 0.1}>
                    <NoticeCard {...notice} />
                  </FadeUp>
                ))}
              </div>
            </div>

            {/* Events – 1 col */}
            <div>
              <FadeUp delay={0.1}>
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-3">
                      <span className="w-6 h-[1px] bg-[#D4AF37]" />
                      <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Programs</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">Society Events</h2>
                  </div>
                  <Link to="/events" className="group flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all pb-0.5">
                    All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </FadeUp>
              <div className="space-y-5">
                {events.map((evt, i) => (
                  <FadeUp key={evt.id} delay={i * 0.1 + 0.15}>
                    <div className="group border border-slate-200 dark:border-slate-800 hover:border-[#D4AF37]/40 transition-all duration-300 overflow-hidden flex gap-0">
                      <img src={evt.banner} alt={evt.title} className="w-24 h-24 object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
                      <div className="p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase">{evt.date}</span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-1 line-clamp-2 leading-relaxed">{evt.title}</h4>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-2">
                          <MapPin className="w-3 h-3" />{evt.venue}
                        </div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 – GALLERY GRID
          ═══════════════════════════════════════ */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-6 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Visual Tour</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900">COMPLEX GALLERY</h2>
            </div>
            <Link to="/gallery" className="group hidden sm:flex items-center gap-2 text-[11px] font-bold text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all pb-0.5">
              Full Album <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryPreviews.map((img, idx) => (
              <FadeIn key={idx} delay={idx * 0.08}>
                <div className={`group relative overflow-hidden cursor-pointer ${idx === 0 ? 'md:row-span-2' : ''}`}
                  style={{ height: idx === 0 ? '500px' : '240px' }}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase">Suyash Complex</span>
                    <h4 className="text-white font-bold text-sm mt-1">{img.title}</h4>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7 – MAP & DOWNLOADS
          ═══════════════════════════════════════ */}
      <section className="bg-[#060F1C] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Map – 2 cols */}
            <FadeUp className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-6 h-[1px] bg-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Location</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white">Society Location</h2>
              </div>
              <div className="border border-slate-800 overflow-hidden rounded-none">
                <MapWidget />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                Plot-1, Sector-5, Ulwe Node, Wahal, Navi Mumbai, Maharashtra 410206
              </div>
            </FadeUp>

            {/* Downloads – 1 col */}
            <FadeUp delay={0.15} className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-6 h-[1px] bg-[#D4AF37]" />
                  <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Resources</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white">Member Downloads</h2>
              </div>
              <div className="border border-slate-800 p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access official application formats, NOC letters, and rule books instantly.
                </p>
                <div className="space-y-3">
                  {downloads.map((doc, idx) => (
                    <div
                      key={idx}
                      className="group flex justify-between items-center p-4 border border-slate-800 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/3 transition-all duration-200 cursor-pointer"
                    >
                      <div className="min-w-0 pr-4">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{doc.name}</h4>
                        <span className="text-[10px] text-slate-400">{doc.size} · {doc.format}</span>
                      </div>
                      <button
                        onClick={() => addToast(`Downloading: ${doc.name}`, 'info')}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#060F1C] transition-all duration-200"
                        aria-label="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Link
                  to="/downloads"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5C142] hover:to-[#C49A0D] text-[#060F1C] font-black py-3.5 text-[10px] tracking-widest uppercase transition-all duration-200 shadow-lg shadow-[#D4AF37]/10 mt-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  All Downloads
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 8 – CONTACT DARK
          ═══════════════════════════════════════ */}
      <section className="relative bg-white py-24 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Info */}
            <FadeUp>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-6 h-[1px] bg-[#D4AF37]" />
                <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.35em] uppercase">Reach Us</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
                CONTACT<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#AA820A]">
                  COMMITTEE OFFICE
                </span>
              </h2>
              <p className="text-slate-650 text-sm leading-relaxed mb-10">
                Have questions regarding NOCs, maintenance accounts, parking allotments, or complaints?
                Our management committee will review and respond within 48 hours.
              </p>

              <div className="space-y-6">
                {[
                  { Icon: MapPin, label: 'Address', val: 'Plot-1, Sector-5, Ulwe Node, Wahal, Navi Mumbai 410206' },
                  { Icon: Clock, label: 'Office Hours', val: 'Saturdays & Sundays (10:00 AM – 1:00 PM)' },
                  { Icon: Mail, label: 'Email', val: 'support@suyashpride.org' },
                  { Icon: Phone, label: 'Emergency', val: '+91 98765 43210 (Security Desk)' },
                ].map(({ Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-4">
                     <div className="w-10 h-10 flex items-center justify-center bg-[#D4AF37]/10 flex-shrink-0">
                       <Icon className="w-4 h-4 text-[#D4AF37]" />
                     </div>
                     <div>
                       <div className="text-[9px] text-slate-400 tracking-widest uppercase mb-1">{label}</div>
                       <div className="text-slate-700 text-sm">{val}</div>
                     </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Form */}
            <FadeUp delay={0.15}>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Your Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Parth Patel"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#D4AF37]/60 rounded-none text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-colors duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. parth@example.com"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#D4AF37]/60 rounded-none text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-colors duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Message</label>
                  <textarea
                    rows="5"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Write your query here..."
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#D4AF37]/60 rounded-none text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-colors duration-200 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5C142] hover:to-[#C49A0D] text-[#060F1C] font-black px-8 py-4 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </FadeUp>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
