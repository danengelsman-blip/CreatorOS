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
    <div className="min-h-screen bg-premium-bg flex flex-col sm:flex-row overflow-hidden">
      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden sm:flex sm:w-1/2 relative flex-col justify-between p-8 xl:p-20 border-r border-white/10">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-violet/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-emerald/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <BrandIcon size={32} className="text-accent-gold" glow />
            <span className="text-2xl font-serif font-bold text-white tracking-tight">CreatorOS</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6">
              The AI Operating System for Modern Creators.
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-xl mb-12">
              Automate your workflow, generate high-quality content, and scale your audience with data-driven insights.
            </p>

            <div className="space-y-6">
              <FeatureItem icon={Sparkles} title="AI-Powered Workflow" desc="Generate scripts, hooks, and captions in seconds." />
              <FeatureItem icon={Globe} title="Audience Insights" desc="Understand your niche and track your growth." />
              <FeatureItem icon={ShieldCheck} title="Secure & Synced" desc="Your brand identity, safe in the cloud." />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/40 text-sm font-medium">
          <span>Trusted by 50,000+ creators</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span>Join the revolution</span>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full sm:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="p-10 sm:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[40px] text-center">
            <div className="sm:hidden mb-10">
              <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
                <BrandIcon size={40} className="text-accent-gold" glow />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white tracking-tight mb-2">CreatorOS</h1>
              <p className="text-white/40 font-medium">Your AI Creator Workspace</p>
            </div>

            <div className="hidden sm:block mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-white/60">Sign in to access your workspace</p>
            </div>

            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-5 bg-premium-surface text-premium-ink rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-xl shadow-white/5 border border-premium-border active:scale-[0.98] disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <img 
                    src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                    alt="Google" 
                    className="w-6 h-6" 
                    referrerPolicy="no-referrer"
                  />
                  <span>Continue with Google</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -ml-8 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </>
              )}
            </button>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-white/30 text-xs leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-white/60 hover:text-white underline underline-offset-4 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-white/60 hover:text-white underline underline-offset-4 transition-colors">Privacy Policy</a>.
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
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
        <Icon className="w-6 h-6 text-accent-gold" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
