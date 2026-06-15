import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Upload, Trash2, Edit2, Image as ImageIcon, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';

function ManageGallery() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingPostId, setEditingPostId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Deployed');
  const [publishDate, setPublishDate] = useState('');
  const [files, setFiles] = useState([]);

  // Carousel State for viewing a post's images
  const [activePostViewer, setActivePostViewer] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/gallery/posts?isAdmin=true');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch gallery posts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setEditingPostId(null);
    setTitle('');
    setDescription('');
    setStatus('Deployed');
    setPublishDate('');
    setFiles([]);
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setTitle(post.name);
    setDescription(post.description || '');
    setStatus(post.status || 'Deployed');
    // Format publish_date to local datetime-local input format if it exists
    if (post.publish_date) {
      const d = new Date(post.publish_date);
      // slice(0,16) gives YYYY-MM-DDThh:mm
      setPublishDate(d.toISOString().slice(0, 16));
    } else {
      setPublishDate('');
    }
    setFiles([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery post and all its images?')) return;
    try {
      await api.delete(`/gallery/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete post');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert('Title is required');
      return;
    }
    if (!editingPostId && (!files || files.length === 0)) {
      alert('Please select at least one image to create a post');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('status', status);
      
      if (publishDate) {
        formData.append('publish_date', new Date(publishDate).toISOString());
      }

      if (files && files.length > 0) {
        Array.from(files).forEach((f) => {
          formData.append('images', f);
        });
      }

      if (editingPostId) {
        await api.patch(`/gallery/posts/${editingPostId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Post updated successfully.');
      } else {
        await api.post('/gallery/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Post created successfully.');
      }

      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewer = (post) => {
    if (!post.gallery_images || post.gallery_images.length === 0) return;
    setActivePostViewer(post);
    setCurrentImageIndex(0);
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    if (activePostViewer) {
      setCurrentImageIndex((prev) => (prev + 1) % activePostViewer.gallery_images.length);
    }
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    if (activePostViewer) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? activePostViewer.gallery_images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-society-primary dark:text-white">Gallery Posts Management</h2>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Create multiple-image posts, schedule publications, and manage existing albums.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post Editor Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 h-fit transition-theme lg:sticky lg:top-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm">
              {editingPostId ? 'Edit Gallery Post' : 'Create New Post'}
            </h3>
            {editingPostId && (
              <button onClick={resetForm} className="text-[10px] text-slate-500 hover:text-slate-700">Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Post Title</label>
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
              <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description about the album..." 
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme" 
                rows="2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme"
                >
                  <option value="Deployed">Deployed (Live)</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">Publish Date</label>
                <input 
                  type="datetime-local" 
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] dark:text-white transition-theme" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-350 mb-1">
                {editingPostId ? 'Add More Images (Optional)' : 'Select Images'}
              </label>
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-society-primary/10 file:text-society-primary hover:file:bg-society-primary/20 dark:file:bg-[#D4AF37]/10 dark:file:text-[#D4AF37] dark:hover:file:bg-[#D4AF37]/20 transition cursor-pointer" 
                required={!editingPostId}
              />
              {files.length > 0 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-2">{files.length} files selected to upload</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-society-primary text-white dark:bg-society-secondary dark:text-society-primary font-bold text-xs py-2.5 rounded-lg disabled:opacity-50 transition mt-4"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : (editingPostId ? 'Update Post' : 'Create Post')}</span>
            </button>
          </form>
        </div>

        {/* Posts Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm transition-theme">
            <h3 className="font-bold text-society-primary dark:text-[#D4AF37] text-sm border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              All Posts Registry
            </h3>

            {isLoading ? (
              <p className="text-xs text-slate-500 py-8 text-center">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No posts found. Create one to get started.</p>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col sm:flex-row bg-slate-50 dark:bg-slate-950">
                    
                    {/* Thumbnail representing the post */}
                    <div 
                      className="w-full sm:w-48 h-32 relative bg-slate-200 dark:bg-slate-800 cursor-pointer group flex-shrink-0"
                      onClick={() => openViewer(post)}
                    >
                      {post.gallery_images && post.gallery_images.length > 0 ? (
                        <>
                          <img src={post.gallery_images[0].image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={post.name} />
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            + {post.gallery_images.length} Photos
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-xs drop-shadow-md">View Carousel</span>
                      </div>
                    </div>

                    {/* Post Details */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">{post.name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            post.status === 'Deployed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            post.status === 'Scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{post.description || 'No description provided.'}</p>
                      </div>
                      
                      <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Publish: {new Date(post.publish_date).toLocaleString()}</div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created: {new Date(post.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(post)}
                            className="p-1.5 text-society-primary hover:bg-society-primary/10 dark:text-[#D4AF37] dark:hover:bg-[#D4AF37]/10 rounded transition"
                            title="Edit Post"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Carousel Modal for viewing Post images */}
      <AnimatePresence>
        {activePostViewer && activePostViewer.gallery_images && activePostViewer.gallery_images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="absolute top-4 right-4 flex gap-4 items-center">
              <span className="text-slate-400 text-xs font-mono">
                {currentImageIndex + 1} / {activePostViewer.gallery_images.length}
              </span>
              <button 
                onClick={() => setActivePostViewer(null)}
                className="p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activePostViewer.gallery_images.length > 1 && (
              <button 
                onClick={prevImage}
                className="absolute left-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl max-h-[85vh] p-4 flex flex-col items-center justify-center"
            >
              <img 
                src={activePostViewer.gallery_images[currentImageIndex].image_url} 
                alt={activePostViewer.gallery_images[currentImageIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-6 text-center">
                <h3 className="text-white font-bold text-lg">{activePostViewer.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{activePostViewer.description}</p>
              </div>
            </motion.div>

            {activePostViewer.gallery_images.length > 1 && (
              <button 
                onClick={nextImage}
                className="absolute right-4 p-3 bg-slate-800/50 hover:bg-slate-800 text-white rounded-full transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageGallery;
