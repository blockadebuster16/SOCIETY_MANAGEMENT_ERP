import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

function ManageGallery() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);

  // Carousel State
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/gallery');
      if (res.data.success) {
        setImages(res.data.photos);
      }
    } catch (error) {
      console.error('Failed to fetch gallery photos', error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Carousel Auto-play logic (10-second delay)
  useEffect(() => {
    let interval;
    // Only auto-play if the modal is open or if we are actively hovering/interacting with the gallery viewer
    if ((carouselOpen || isHovering) && images.length > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [carouselOpen, isHovering, images.length]);

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      Array.from(files).forEach((f) => {
        formData.append('images', f); // Note: must match the backend upload.array('images')
      });

      const res = await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        alert(`Successfully uploaded ${res.data.photos.length} photos.`);
        setTitle('');
        setFiles([]);
        e.target.reset();
        fetchPhotos();
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload photos');
    } finally {
      setIsLoading(false);
    }
  };

  const openCarousel = (index) => {
    setCurrentImageIndex(index);
    setCarouselOpen(true);
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Uniform Header Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Society Gallery Management</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Upload multiple files to public media galleries, festivals archives, or delete photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleUploadPhoto} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 h-fit transition-theme">
          <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm border-b border-slate-100 dark:border-slate-800 pb-2">Add New Photos</h3>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Batch Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Holi Celebration 2026" 
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme" 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Select Files (Multiple Allowed)</label>
            <input 
              type="file" 
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-society-primary/10 file:text-society-primary hover:file:bg-society-primary/20 dark:file:bg-[#D4AF37]/10 dark:file:text-[#D4AF37] dark:hover:file:bg-[#D4AF37]/20 transition cursor-pointer" 
              required 
            />
            {files.length > 0 && (
              <p className="text-[10px] text-emerald-600 font-bold mt-2">{files.length} files selected</p>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading || files.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold text-xs py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            <Upload className="w-4 h-4" />
            <span>{isLoading ? 'Uploading...' : 'Upload Photos'}</span>
          </button>
        </form>

        {/* Existing photos registry */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-theme">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm">Gallery Upload Registry</h3>
            {images.length > 0 && (
              <button 
                type="button"
                onClick={() => openCarousel(0)}
                className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/20 transition"
              >
                Launch Carousel Viewer
              </button>
            )}
          </div>
          
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {images.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8 col-span-full">No photos found.</p>
            ) : (
              images.map((img, idx) => (
                <div 
                  key={img.id} 
                  className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  onClick={() => openCarousel(idx)}
                >
                  <img 
                    src={img.image_url} 
                    alt={img.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovering && currentImageIndex === idx ? 'scale-110' : 'group-hover:scale-105'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-[10px] font-bold truncate">{img.title}</p>
                    <p className="text-slate-300 text-[9px]">{Math.round(img.file_size / 1024)} KB</p>
                  </div>
                  
                  {/* Delete button wrapper - prevent modal open on click */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('Delete functionality can be wired up later'); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Active Carousel Indicator */}
                  {isHovering && currentImageIndex === idx && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#D4AF37] text-white text-[9px] font-bold rounded shadow shadow-black/20">
                      Auto-viewing
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Carousel Modal */}
      <AnimatePresence>
        {carouselOpen && images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="absolute top-4 right-4 flex gap-4 items-center">
              <span className="text-slate-400 text-xs font-mono">
                {currentImageIndex + 1} / {images.length}
              </span>
              <button 
                onClick={() => setCarouselOpen(false)}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={prevImage}
              className="absolute left-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl max-h-[85vh] p-4 flex flex-col items-center justify-center"
            >
              <img 
                src={images[currentImageIndex].image_url} 
                alt={images[currentImageIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-6 text-center">
                <h3 className="text-white font-bold text-lg">{images[currentImageIndex].title}</h3>
                <p className="text-slate-400 text-xs mt-1">Uploaded {new Date(images[currentImageIndex].created_at).toLocaleDateString()}</p>
              </div>
              
              {/* Progress Bar for 10s auto-play */}
              <div className="w-64 h-1 bg-slate-800 mt-6 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  key={`progress-${currentImageIndex}`}
                  className="h-full bg-[#D4AF37]"
                />
              </div>
            </motion.div>

            <button 
              onClick={nextImage}
              className="absolute right-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageGallery;
