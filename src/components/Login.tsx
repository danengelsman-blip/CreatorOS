import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { Sparkles, ShieldCheck, Globe, Zap, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-ink flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-emerald/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="premium-card p-10 lg:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[40px] text-center">
          <div className="mb-10">
            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
              <Sparkles className="w-10 h-10 text-accent-gold" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white tracking-tight mb-3">CreatorOS</h1>
            <p className="text-white/40 font-medium text-lg">The AI Operating System for Modern Creators.</p>
          </div>

          <div className="space-y-4 mb-10">
            <FeatureItem icon={ShieldCheck} text="Secure Cloud Persistence" />
            <FeatureItem icon={Globe} text="Sync Across All Devices" />
            <FeatureItem icon={Zap} text="AI-Powered Workflow Engine" />
          </div>

          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-5 bg-white text-premium-ink rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebase/explore/images/google-logo.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-8 text-[11px] text-white/20 uppercase tracking-[0.2em] font-bold">
            By continuing, you agree to the CreatorOS Terms of Service.
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/30 text-sm">
            Trusted by 50,000+ creators worldwide.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4 text-white/60 text-sm font-medium">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
        <Icon className="w-4 h-4" />
      </div>
      <span>{text}</span>
    </div>
  );
}
