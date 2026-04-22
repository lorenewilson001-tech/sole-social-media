import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Video, Send, Loader2 } from 'lucide-react';
import { postService } from '../services/postService';

interface CreatePostModalProps {
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postService.createPost({
        title,
        imageUrl,
        videoUrl: videoUrl.trim() || undefined,
        caption,
        clientEmail: clientEmail.toLowerCase().trim()
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-xl bg-brand-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-brand-card z-10">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">Create New Post</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-brand-red bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Post Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Collection Launch"
              className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Thumbnail/Image URL</label>
              <div className="relative">
                <input
                  required
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Direct image link"
                  className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-gold transition-all text-xs font-medium"
                />
                <ImageIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Video URL (Optional)</label>
              <div className="relative">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Direct .mp4 link"
                  className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-gold transition-all text-xs font-medium"
                />
                <Video className="absolute left-4 top-3.5 text-slate-500" size={18} />
              </div>
            </div>
          </div>

          {(imageUrl || videoUrl) && (
            <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group">
              {videoUrl ? (
                <video src={videoUrl} className="w-full h-full object-contain" controls />
              ) : (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute top-2 right-2 bg-brand-dark/80 px-2 py-1 rounded text-[10px] font-bold text-brand-gold uppercase">
                Preview
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
              placeholder="Write the post caption here..."
              className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-all resize-none font-medium italic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Client Email Address</label>
            <input
              required
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="e.g., client@example.com"
              className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-brand-gold transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-orange text-white font-black uppercase tracking-widest py-5 rounded-xl transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none border border-white/10"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            {isSubmitting ? 'Creating Post...' : 'Publish to Client Portal'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
