import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Post } from '../types';

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

  return (
    <motion.div
      layoutId={post.id}
      onClick={() => onClick(post)}
      whileHover={{ y: -4 }}
      className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/10 transition-all shadow-xl"
    >
      <div className="aspect-square overflow-hidden bg-slate-800 relative">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-1 truncate">{post.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed h-10">
          {post.caption}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">
            ID: {post.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
