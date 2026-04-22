import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Image as ImageIcon, Video, Save, Loader2 } from 'lucide-react';
import { Post } from '../types';
import { postService, transformDriveUrl } from '../services/postService';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onUpdate }) => {
  const [title, setTitle] = useState(post.title);
  const [imageUrl, setImageUrl] = useState(post.imageUrl);
  const [videoUrl, setVideoUrl] = useState(post.videoUrl || '');
  const [caption, setCaption] = useState(post.caption);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (!imageUrl.trim() && !videoUrl.trim()) {
      alert('Please provide at least an Image Link or a Video Link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await postService.updatePost(post.id, {
        title,
        imageUrl: imageUrl.trim() || '',
        videoUrl: videoUrl.trim() || '',
        caption
      });
      if (success) {
        alert('Post Updated Successfully!');
        if (onUpdate) onUpdate();
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-xl bg-brand-card border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-brand-card shrink-0">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Edit Post</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-brand-red bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar shrink">
          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Post Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Image Link (Drive or Direct)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste link here..."
                    className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-gold transition-all text-xs font-medium"
                   />
                  <ImageIcon className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                </div>
                {imageUrl.includes('drive.google.com') && (
                  <p className="text-[10px] text-brand-gold italic ml-1">
                    * Make sure it's set to "Anyone with the link can view"
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Video Link (Drive or Direct)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste link here..."
                    className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-brand-gold transition-all text-xs font-medium"
                  />
                  <Video className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {(imageUrl || videoUrl) && (
              <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group shadow-lg">
                {videoUrl ? (
                  (videoUrl.includes('drive.google.com') || videoUrl.includes('lh3.googleusercontent.com')) ? (
                    <iframe 
                      src={transformDriveUrl(videoUrl, 'video')} 
                      className="w-full h-full border-none"
                      allow="autoplay"
                    />
                  ) : (
                    <video src={videoUrl} className="w-full h-full object-contain" controls />
                  )
                ) : (
                  <img src={transformDriveUrl(imageUrl, 'image')} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 right-2 bg-brand-red px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-tighter">
                  Media Preview
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Caption</label>
              <textarea
                required
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-all resize-none font-medium italic text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-orange text-brand-dark font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl active:translate-y-1 border border-white/10 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
