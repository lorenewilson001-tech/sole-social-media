import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, CheckCircle2, Clock, AlertCircle, Video } from 'lucide-react';
import { Post } from '../types';
import { transformDriveUrl } from '../services/postService';

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const statusConfig = {
    pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2, label: 'Approved' },
    revision: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: AlertCircle, label: 'Revision' }
  };

  const { color, icon: Icon, label } = statusConfig[post.status] || statusConfig.pending;

  const displayImageUrl = post.imageUrl ? transformDriveUrl(post.imageUrl) : '';

  return (
    <motion.div
      layoutId={post.id}
      onClick={() => onClick(post)}
      whileHover={{ y: -6 }}
      className="group bg-brand-card border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-gold/30 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.3)] hover:shadow-[12px_12px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none"
    >
      <div className="aspect-square overflow-hidden bg-black relative">
        {displayImageUrl ? (
          <img 
            src={displayImageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-dark/50">
            <Video className="w-12 h-12 text-slate-700 opacity-20" />
          </div>
        )}
        {post.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-brand-red/80 p-3 rounded-full shadow-2xl group-hover:scale-125 transition-transform border border-white/20">
              <Video className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-white font-bold mb-1 truncate uppercase tracking-tight">{post.title}</h3>
        <span className="text-[9px] text-brand-orange font-bold uppercase tracking-widest block mb-3">
          Sent: {post.createdAt?.toDate()?.toLocaleDateString() || 'Recently'}
        </span>
        <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed h-8 italic">
          "{post.caption}"
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-brand-dark">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
            <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />
            <span>Collaboration</span>
          </div>
          <span className="text-[10px] text-slate-700 font-mono">
            #{post.id.slice(0, 4).toUpperCase()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
