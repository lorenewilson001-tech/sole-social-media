import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, AlertCircle, Clock, ExternalLink, MessageSquare, Plus } from 'lucide-react';
import { Post, Comment } from '../types';
import { postService } from '../services/postService';
import { auth, CREATOR_NAME, JANNAT_EMAILS, LOREN_EMAILS } from '../lib/firebase';

interface PostDetailsProps {
  post: Post;
  onClose: () => void;
  isClientView?: boolean;
}

export const PostDetails: React.FC<PostDetailsProps> = ({ post, onClose, isClientView = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = postService.subscribeToComments(post.id, setComments);
    return () => unsubscribe();
  }, [post.id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await postService.addComment(post.id, newComment.trim());
      
      // If client sends a comment, notify Jannat's 3 emails
      if (isClientView) {
        const subject = `New Feedback from Client: ${post.title}`;
        const message = `Hello Jannat! Your client Loren just left a comment on "${post.title}":\n\n"${newComment}"\n\nPlease check the portal to respond: ${window.location.origin}`;
        const bccList = JANNAT_EMAILS.join(',');
        const mailtoUrl = `mailto:${JANNAT_EMAILS[0]}?bcc=${bccList}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoUrl;
      }
      
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: Post['status']) => {
    try {
      await postService.updatePostStatus(post.id, status);
      if (isClientView) {
        const isApproved = status === 'approved';
        const subject = isApproved ? `POST APPROVED: ${post.title}` : `REVISION REQUESTED: ${post.title}`;
        const message = isApproved 
          ? `Hello Jannat! Good news! I have APPROVED the post: "${post.title}". \n\nYou can now proceed with scheduling. Congrats!`
          : `Hello Jannat, I have reviewed "${post.title}" and requested some revisions. Please check my comments in the portal.`;
        
        const bccList = JANNAT_EMAILS.join(',');
        const mailtoUrl = `mailto:${JANNAT_EMAILS[0]}?bcc=${bccList}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoUrl;
      }
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div
        layoutId={post.id}
        className="w-full max-w-6xl bg-brand-card rounded-3xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] shadow-[12px_12px_0px_rgba(0,0,0,0.5)] border border-white/10"
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-bold truncate pr-4 uppercase tracking-tighter">{post.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Image Side (Instagram Style - Left) */}
        <div className="flex-[1.5] bg-black flex items-center justify-center relative overflow-hidden group">
          <img 
            src={post.imageUrl} 
            className="w-full h-full object-contain" 
            alt={post.title}
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <a 
              href={post.imageUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-4 bg-brand-gold text-brand-dark rounded-2xl shadow-xl hover:scale-110 transition-transform font-bold flex items-center gap-2"
            >
              <ExternalLink size={20} />
              Open Original
            </a>
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = post.imageUrl;
                link.download = `sole-ingredient-${post.title}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-4 bg-white text-brand-dark rounded-2xl shadow-xl hover:scale-110 transition-transform font-bold flex items-center gap-2"
            >
              <Send size={20} className="rotate-90" />
              Download High-Res
            </button>
          </div>
        </div>

        {/* Info & Comments Side (Instagram Style - Right) */}
        <div className="flex-1 flex flex-col border-l border-white/10 bg-brand-dark">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-6 border-b border-white/5 bg-brand-card/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-brand-gold/30 p-1">
                 <span className="text-xl font-black text-brand-gold leading-none">S</span>
              </div>
              <div>
                <h3 className="text-white font-bold tracking-tight uppercase leading-none">{post.title}</h3>
                <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest leading-none">
                  Submitted: {post.createdAt?.toDate()?.toLocaleDateString()}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Caption & Status Area */}
          <div className="p-6 border-b border-white/5 bg-brand-card/20">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border border-white/10 bg-white/5 uppercase tracking-wider">
                  {post.status === 'pending' && <Clock size={12} className="text-amber-500" />}
                  {post.status === 'approved' && <CheckCircle2 size={12} className="text-emerald-500" />}
                  {post.status === 'revision' && <AlertCircle size={12} className="text-rose-500" />}
                  <span className={
                    post.status === 'approved' ? 'text-emerald-500' : 
                    post.status === 'revision' ? 'text-rose-500' : 'text-amber-500'
                  }>{post.status}</span>
                </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar italic font-medium">
              "{post.caption}"
            </p>

            {isClientView && post.status !== 'approved' && (
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleStatusChange('approved')}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-orange text-white font-black py-3 rounded-xl transition-all shadow-[4px_4px_0px_theme(colors.brand-gold)] active:translate-y-1 active:shadow-none border border-white/10 uppercase text-xs tracking-widest"
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('revision')}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-card hover:bg-slate-800 text-white font-black py-3 rounded-xl transition-all active:translate-y-1 border border-white/5 uppercase text-xs tracking-widest"
                >
                  <AlertCircle size={16} />
                  Revise
                </button>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-dark/30 custom-scrollbar">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-red flex-shrink-0 flex items-center justify-center text-[10px] font-bold border border-brand-gold/30">
                    {comment.authorName?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-black text-brand-gold uppercase tracking-tighter">{comment.authorName}</span>
                      <span className="text-[9px] text-slate-600 font-bold">
                        {comment.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 leading-snug">
                      {comment.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {comments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-12">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">No Feedback Yet</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSendComment} className="p-4 bg-brand-card border-t border-white/5">
            <div className="flex flex-col gap-3">
              {isClientView && (
                <div className="flex items-center gap-2">
                   <button 
                    type="button"
                    onClick={() => alert('File upload feature: You can attach your inspiration images or videos here to help Jannat understand your vision.')}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-brand-orange transition-colors flex items-center gap-1"
                   >
                     <Plus size={10} /> Attach Inspiration (Image/Video)
                   </button>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a message..."
                  className="w-full bg-brand-dark/50 border border-white/10 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-brand-gold transition-all text-sm placeholder:text-slate-700 font-bold"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="absolute right-2 top-1.5 p-2 bg-brand-gold text-brand-dark rounded-lg disabled:opacity-30 disabled:scale-95 transition-all hover:bg-brand-orange"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
