import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LayoutGrid, LogOut, User, Fingerprint, Share2, Copy, Check } from 'lucide-react';
import { auth } from '../lib/firebase';
import { Post } from '../types';
import { postService } from '../services/postService';
import { PostCard } from './PostCard';
import { PostDetails } from './PostDetails';
import { CreatePostModal } from './CreatePostModal';
import { LOGO_URL, CREATOR_NAME } from './Auth';

export const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [clientPosts, setClientPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [activeTab, setActiveTab] = useState<'creator' | 'client'>('creator');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const unsubscribeCreator = postService.subscribeToPosts(setPosts);
    let unsubscribeClient = () => {};
    
    if (auth.currentUser && auth.currentUser.email) {
      unsubscribeClient = postService.subscribeToClientPosts(auth.currentUser.email, setClientPosts);
    }

    return () => {
      unsubscribeCreator();
      unsubscribeClient();
    };
  }, []);

  const handleLogout = () => auth.signOut();

  const currentPosts = activeTab === 'creator' ? posts : clientPosts;

  const handleShare = (post: Post) => {
    const message = `Hello! This is ${CREATOR_NAME} from The Sole Ingredient. \n\nI have finished a new post draft "${post.title}" for your review. Please click the link below to approve or leave feedback. \n\nPortal link: ${window.location.origin}`;
    const mailtoUrl = `mailto:${post.clientEmail}?subject=Approval Request: ${post.title}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-red/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center border border-brand-gold/30 shadow-[3px_3px_0px_theme(colors.brand-red)] p-1.5 cursor-pointer">
                <img 
                  src={LOGO_URL} 
                  alt="Sole Ingredient" 
                  className="w-full h-full object-contain rounded-md" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="text-2xl font-bold tracking-tighter hidden sm:block text-slate-100">Sole Ingredient</span>
            </div>
            
            <div className="hidden md:flex bg-brand-card/50 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setActiveTab('creator')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'creator' ? 'bg-brand-red text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Creator Panel
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'client' ? 'bg-brand-red text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Client Portal
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-200">{auth.currentUser?.displayName}</span>
              <span className="text-[10px] text-brand-gold font-mono italic">Sole Artist</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-red overflow-hidden shadow-lg">
              <img src={auth.currentUser?.photoURL || ''} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-brand-card border border-white/10 text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-all shadow-md"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 bg-brand-card/30 p-8 rounded-3xl border border-white/5 shadow-inner">
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
              {activeTab === 'creator' ? (
                <>
                  <span className="text-brand-terracotta">Creator</span> Workflow
                </>
              ) : (
                <>
                  <span className="text-brand-gold">Client</span> Dashboard
                </>
              )}
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed text-lg">
              {activeTab === 'creator' 
                ? 'Manage your catering content, track client approvals, and ensure every post is fire.' 
                : 'Review your custom catering content drafts from the artist.'}
            </p>
          </div>
          {activeTab === 'creator' && (
            <button
              onClick={() => setIsAddingPost(true)}
              className="flex items-center justify-center gap-2 bg-brand-red hover:bg-red-700 text-white font-bold px-10 py-5 rounded-xl transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.5),4px_4px_0px_theme(colors.brand-gold)] active:translate-y-1 active:shadow-none whitespace-nowrap border border-white/10"
            >
              <Plus size={24} />
              Create Project
            </button>
          )}
        </header>


        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'creator' ? 'bg-brand-red text-white' : 'text-slate-400'
            }`}
          >
            Creator
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'client' ? 'bg-brand-red text-white' : 'text-slate-400'
            }`}
          >
            Client
          </button>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {currentPosts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard 
                  post={post} 
                  onClick={() => setSelectedPost(post)} 
                />
                {activeTab === 'creator' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(post);
                    }}
                    className="absolute top-4 left-4 p-2.5 bg-brand-gold text-brand-dark rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                    title="Send email notification"
                  >
                    <Share2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>

        {currentPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
              <LayoutGrid size={40} className="text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No projects found</h3>
            <p className="text-slate-500 max-w-sm">
              {activeTab === 'creator' 
                ? 'Ready to impress? Start by creating your first post approval request.' 
                : 'Waiting for fresh content? Check back soon for your personalized drafts!'}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingPost && (
          <CreatePostModal onClose={() => setIsAddingPost(false)} />
        )}
        {selectedPost && (
          <PostDetails 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            isClientView={activeTab === 'client'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

