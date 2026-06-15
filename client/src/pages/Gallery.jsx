import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = useMemo(() => [
    { 
      id: 1, 
      title: 'Main Entrance Plaza', 
      desc: 'Entrance plaza with CCTV setup and guard booth.',
      category: 'Infrastructure',
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    },
    { 
      key: 2,
      id: 2, 
      title: 'Recreation Garden', 
      desc: 'Landscaped lawn, jogging path, and kids play area.',
      category: 'Amenities',
      url: 'https://images.unsplash.com/photo-1558904541-efa8c3a30fc9?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 3, 
      title: 'Ganesh Chaturthi Aarti', 
      desc: 'Annual community festival celebration inside lobby.',
      category: 'Festivals',
      url: 'https://images.unsplash.com/photo-1609137144814-7d5267b140d3?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 4, 
      title: 'Solar Panel Array', 
      desc: 'Green energy rooftop installation supplying commons.',
      category: 'Infrastructure',
      url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 5, 
      title: 'Society Clubhouse Hall', 
      desc: 'Fully air-conditioned indoor hall for committee events.',
      category: 'Amenities',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 6, 
      title: 'Underground Water Systems', 
      desc: 'Restructured rainwater harvesting pipe grids.',
      category: 'Infrastructure',
      url: 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 7,
      title: 'Diwali Lighting Celebration',
      desc: 'Premium facade illumination of Wings A to D on Diwali.',
      category: 'Festivals',
      url: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 8,
      title: 'Kids Swimming Pool',
      desc: 'Maintained kids splash pool near the community garden.',
      category: 'Amenities',
      url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80'
    }
  ], []);

  const categories = ['All', 'Infrastructure', 'Amenities', 'Festivals'];

  const filteredImages = useMemo(() => {
    return activeCategory === 'All' ? images : images.filter(img => img.category === activeCategory);
  }, [images, activeCategory]);

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-2">
        <h2 className="text-3xl font-extrabold text-society-primary dark:text-white font-serif">
          Society Gallery
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm">
          A visual record of our infrastructure assets, green energy systems, and festive celebrations.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-850 transition-theme">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setLightboxIndex(null);
            }}
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

      {/* Gallery Photo Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((img, index) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxIndex(index)}
              className="group cursor-pointer relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 h-64 flex flex-col hover:shadow-md transition-theme"
            >
              <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{img.title}</h4>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 truncate">{img.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen Lightbox Overlay Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Control buttons */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white p-3 rounded-full bg-white/5 hover:bg-white/10 transition z-50"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white p-3 rounded-full bg-white/5 hover:bg-white/10 transition z-50"
              aria-label="Next Image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Content Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center gap-4 relative"
            >
              <img
                src={filteredImages[lightboxIndex].url}
                alt={filteredImages[lightboxIndex].title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
              <div className="text-center text-white space-y-1 px-4 max-w-xl">
                <span className="inline-block text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                  {filteredImages[lightboxIndex].category}
                </span>
                <h3 className="font-extrabold text-base md:text-lg">{filteredImages[lightboxIndex].title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{filteredImages[lightboxIndex].desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
