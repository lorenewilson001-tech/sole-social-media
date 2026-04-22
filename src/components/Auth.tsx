import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export const LOGO_URL = 'https://cdn.perceptual.ai/ais/vw3ncz5aiqua3kthchcfke-864923380925-1745338830113-logo.jpg';
export const CREATOR_NAME = 'Jannatun Neyeem';

export const Auth: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-brand-gold rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-brand-dark rounded-2xl flex items-center justify-center mb-4 shadow-[6px_6px_0px_theme(colors.brand-red)] border border-brand-gold/20 p-1">
            <img 
              src={LOGO_URL} 
              alt="The Sole Ingredient" 
              className="w-full h-full object-contain rounded-xl" 
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">The Sole Ingredient</h1>
          <p className="text-brand-terracotta text-center font-medium italic">By {CREATOR_NAME}</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-brand-card text-white font-bold py-4 px-6 rounded-xl transition-all hover:bg-brand-red shadow-[4px_4px_0px_theme(colors.brand-gold)] border border-white/5 active:translate-y-1 active:shadow-none"
        >
          <LogIn className="w-5 h-5 text-brand-gold" />
          Continue with Google
        </button>



        <p className="mt-8 text-xs text-center text-slate-500 leading-relaxed">
          By continuing, you agree to streamline your approval process and look more professional to your clients.
        </p>
      </motion.div>
    </div>
  );
};
