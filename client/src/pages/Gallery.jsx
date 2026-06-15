import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import api from '../services/api';

function Gallery() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Viewer state
  const [activePost, setActivePost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/gallery/posts');
        if (res.data.success) {
          setPosts(res.data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch gallery posts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const openViewer = (post) => {
    if (post.gallery_images && post.gallery_images.length > 0) {
      setActivePost(post);
      setCurrentImageIndex(0);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (activePost) {
      setCurrentImageIndex((prev) => (prev + 1) % activePost.gallery_images.length);
    }
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (activePost) {
      setCurrentImageIndex((prev) => (prev - 1 + activePost.gallery_images.length) % activePost.gallery_images.length);
    }
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500 animate-pulse">Loading gallery...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500">No gallery posts available at the moment.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => openViewer(post)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 h-[340px] flex flex-col hover:shadow-lg transition-theme relative"
              >
                {/* Cover Image */}
                <div className="h-56 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  {post.gallery_images && post.gallery_images.length > 0 ? (
                    <img 
                      src={post.gallery_images[0].image_url} 
                      alt={post.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <Images className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Image Count Badge */}
                  {post.gallery_images && post.gallery_images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                      <Images className="w-3 h-3" />
                      {post.gallery_images.length} Photos
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Post Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-society-primary dark:text-[#D4AF37] text-lg leading-tight line-clamp-1">{post.name}</h4>
                    {post.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{new Date(post.publish_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Fullscreen Post Viewer Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePost(null)}
            className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Control buttons */}
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-50"
              aria-label="Close Viewer"
            >
              <X className="w-6 h-6" />
            </button>

            {activePost.gallery_images.length > 1 && (
              <>
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
              </>
            )}

            {/* Top Indicator */}
            {activePost.gallery_images.length > 1 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 px-3 py-1 rounded-full text-white/80 text-xs font-mono font-bold tracking-widest z-50">
                {currentImageIndex + 1} / {activePost.gallery_images.length}
              </div>
            )}

            {/* Content Container */}
            <motion.div
              key={currentImageIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center gap-6 relative"
            >
              <img
                src={activePost.gallery_images[currentImageIndex].image_url}
                alt={activePost.gallery_images[currentImageIndex].title || activePost.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
              <div className="text-center text-white space-y-2 px-4 max-w-2xl bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                <h3 className="font-bold text-xl text-[#D4AF37]">{activePost.name}</h3>
                {activePost.description && (
                  <p className="text-slate-300 text-sm leading-relaxed">{activePost.description}</p>
                )}
                {activePost.gallery_images[currentImageIndex].title && activePost.gallery_images[currentImageIndex].title !== activePost.name && (
                   <p className="text-slate-400 text-xs italic mt-2 border-t border-white/10 pt-2 inline-block">
                     "{activePost.gallery_images[currentImageIndex].title}"
                   </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
