import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Post, Comment } from '../types';
import { postService } from '../services/postService';
import { auth, CREATOR_NAME } from '../lib/firebase';

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
      if (status === 'approved' && isClientView) {
        // Automatically trigger notification for client
        const message = `Hello ${CREATOR_NAME}! I have approved the post: "${post.title}". \n\nYou can now proceed with scheduling. Thanks!`;
        const mailtoUrl = `mailto:lorenewilson001@gmail.com?subject=Post Approved! - ${post.title}&body=${encodeURIComponent(message)}`;
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
        className="w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh] shadow-2xl border border-white/10"
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-semibold truncate pr-4">{post.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content Side */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-800/50">
          <div className="p-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg mb-6 group">
              <img 
                src={post.imageUrl} 
                className="w-full h-full object-cover" 
                alt={post.title}
                referrerPolicy="no-referrer"
              />
              <a 
                href={post.imageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink size={18} />
              </a>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="hidden md:block text-2xl font-bold text-white tracking-tight">{post.title}</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-slate-300">
                  {post.status === 'pending' && <Clock size={14} className="text-amber-500" />}
                  {post.status === 'approved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {post.status === 'revision' && <AlertCircle size={14} className="text-rose-500" />}
                  <span className="capitalize">{post.status}</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h4 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Caption</h4>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                  {post.caption}
                </p>
              </div>

              {isClientView && post.status !== 'approved' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleStatusChange('approved')}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-red/20 active:scale-95 border border-white/10"
                  >
                    <CheckCircle2 size={20} />
                    Approve Post
                  </button>
                  <button
                    onClick={() => handleStatusChange('revision')}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 border border-white/5"
                  >
                    <AlertCircle size={20} />
                    Needs Revision
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interaction Side */}
        <div className="w-full md:w-80 lg:w-96 border-l border-white/5 flex flex-col bg-brand-dark">
          <div className="hidden md:flex items-center justify-between p-6 border-b border-white/5">
            <h3 className="text-white font-bold tracking-tight">Collaboration</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col ${comment.authorId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    comment.authorId === auth.currentUser?.uid 
                      ? 'bg-brand-red text-white font-medium' 
                      : 'bg-white/10 text-white'
                  }`}>
                    {comment.text}
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-500 font-medium">{comment.authorName}</span>
                    <span className="text-[10px] text-slate-600 italic">
                      {comment.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {comments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">No comments yet.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSendComment} className="p-6 border-t border-white/5 bg-brand-dark/50">
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your feedback..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 top-1.5 p-2 bg-brand-gold text-brand-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>

        </div>
      </motion.div>
    </motion.div>
  );
};

import { MessageSquare } from 'lucide-react';
