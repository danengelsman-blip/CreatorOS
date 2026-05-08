import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { ShieldCheck, Globe, Zap, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import BrandIcon from './BrandIcon';

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
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col sm:flex-row overflow-hidden">
      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden sm:flex sm:w-1/2 relative flex-col justify-between p-8 xl:p-20 border-r border-[var(--separator)] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--system-green)]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <BrandIcon size={32} className="text-[var(--accent)]" />
            <span className="text-[24px] font-bold tracking-tight">CreatorOS</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-[44px] xl:text-[54px] font-bold tracking-tight leading-tight mb-6">
              The OS for Modern Creators.
            </h1>
            <p className="text-[20px] text-[var(--label-secondary)] leading-relaxed max-w-xl mb-12 font-medium">
              Automate your workflow, generate high-quality content, and scale your audience with AI.
            </p>

            <div className="flex flex-col gap-6">
              <FeatureItem icon={Sparkles} title="AI-Powered Workflow" desc="Generate scripts & hooks in seconds." />
              <FeatureItem icon={Globe} title="Audience Insights" desc="Understand your niche and track growth." />
              <FeatureItem icon={ShieldCheck} title="Built for Security" desc="Your brand is safe in the cloud." />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[var(--label-tertiary)] text-[13px] font-bold uppercase tracking-widest">
          <span>Trusted by 50K Creators</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--separator)]" />
          <span>Join the Club</span>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full sm:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[var(--bg-secondary)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="ios-card bg-[var(--bg-tertiary)] p-10 sm:p-12 ios-elevated text-center border-t border-white/5">
            <div className="sm:hidden mb-10">
              <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-[22px] flex items-center justify-center mx-auto mb-6 border border-[var(--separator)] shadow-sm">
                <BrandIcon size={40} className="text-[var(--accent)]" />
              </div>
              <h1 className="text-[34px] font-bold tracking-tight mb-1">CreatorOS</h1>
              <p className="text-[17px] text-[var(--label-secondary)] font-medium">Your AI Creator Workspace</p>
            </div>

            <div className="hidden sm:block mb-10">
              <h2 className="text-[28px] font-bold mb-1">Welcome</h2>
              <p className="text-[17px] text-[var(--label-secondary)] font-medium">Sign in to access your workspace</p>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="ios-button-filled w-full py-4 text-[17px] group"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <img 
                    src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                    alt="Google" 
                    className="w-6 h-6" 
                    referrerPolicy="no-referrer"
                  />
                  <span>Continue with Google</span>
                  <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </>
              )}
            </button>

            <div className="mt-10 pt-8 border-t border-[var(--separator)]">
              <p className="text-[12px] text-[var(--label-tertiary)] leading-relaxed font-medium">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-[var(--label-secondary)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors">Terms</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[var(--label-secondary)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors">Privacy</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--separator)] shrink-0 shadow-sm">
        <Icon size={24} className="text-[var(--accent)]" />
      </div>
      <div>
        <h3 className="font-bold text-[17px] mb-0.5">{title}</h3>
        <p className="text-[15px] text-[var(--label-secondary)] leading-snug">{desc}</p>
      </div>
    </div>
  );
}
