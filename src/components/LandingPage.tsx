import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Globe, 
  Twitter, 
  Youtube, 
  Instagram, 
  Zap,
  Shield,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Target,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';
import BrandIcon from './BrandIcon';
import { auth, loginWithGoogle } from '../firebase';

const FEATURES = [
  {
    id: 'branding',
    title: 'Identity Architect',
    description: 'AI-generated brand kits and visual DNA. Build a cohesive presence that converts.',
    icon: Palette,
  },
  {
    id: 'content',
    title: 'Studio Workflow',
    description: 'Structure scripts and hooks in seconds. Performance scoring built into the editor.',
    icon: BrandIcon,
  },
  {
    id: 'income',
    title: 'Intelligence',
    description: 'Real-time content scoring and velocity metrics. Understand what drives your growth.',
    icon: TrendingUp,
  }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--label-primary)] font-sans">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 h-16 flex items-center",
        isScrolled ? "bg-[var(--bg-material-thick)] backdrop-blur-xl border-b border-[var(--separator)]" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandIcon size={20} className="text-[var(--accent)]" />
            <span className="font-bold text-[19px] tracking-tight">CreatorOS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[15px] font-semibold text-[var(--label-secondary)] hover:text-[var(--accent)] transition-colors">Features</a>
            <a href="#pricing" className="text-[15px] font-semibold text-[var(--label-secondary)] hover:text-[var(--accent)] transition-colors">Pricing</a>
            <button 
              onClick={handleSignIn}
              className="text-[15px] font-bold text-[var(--accent)]"
            >
              Sign In
            </button>
            <button 
              onClick={handleSignIn}
              className="ios-button-filled h-9 px-4 text-[14px]"
            >
              Get Started
            </button>
          </div>

          <button 
            className="md:hidden p-2 text-[var(--label-secondary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[90] bg-[var(--bg-primary)] pt-24 px-8 flex flex-col gap-6"
          >
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-[28px] font-bold">Features</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-[28px] font-bold">Pricing</a>
            <hr className="border-[var(--separator)]" />
            <button 
              onClick={handleSignIn}
              className="ios-button-filled w-full text-[17px]"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-44 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-secondary)] rounded-full text-[13px] font-bold text-[var(--label-secondary)] uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--system-green)]" />
            Public Beta 2.0
          </div>

          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-bold tracking-tight leading-[1.05] text-balance">
            Architect your <br className="hidden sm:block" />
            content empire.
          </h1>

          <p className="text-[19px] md:text-[22px] text-[var(--label-secondary)] font-medium max-w-2xl mx-auto leading-tight">
            The AI-powered operating system for creators to design, score, and scale their digital identity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={handleSignIn}
              className="ios-button-filled w-full sm:w-auto h-14 px-10 text-[17px]"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={handleSignIn}
              className="ios-button-gray w-full sm:w-auto h-14 px-10 text-[17px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Hero Image / Mockup */}
      <section className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--bg-secondary)] rounded-[32px] overflow-hidden ios-card border border-[var(--separator)] shadow-2xl">
            <img 
              src="https://picsum.photos/seed/dashboard/1600/900" 
              alt="Dashboard Preview" 
              className="w-full h-auto opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[var(--bg-secondary)]/30">
        <div className="max-w-7xl mx-auto">
          <span className="ios-label uppercase text-center block mb-4">The Operating System</span>
          <h2 className="text-[34px] md:text-[44px] font-bold tracking-tight text-center mb-16 text-balance max-w-2xl mx-auto">
            Everything you need for world-class content.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="ios-card bg-[var(--bg-tertiary)] p-8 flex flex-col gap-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <feature.icon size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[22px] font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-[17px] text-[var(--label-secondary)] font-medium leading-snug">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Inset Grouped List style */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="ios-label uppercase text-center block mb-4">Pricing</span>
          <h2 className="text-[34px] font-bold tracking-tight text-center mb-16">Choose your plan.</h2>

          <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
            <div className="p-6 flex items-center justify-between group active:bg-[var(--separator)] transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-[19px]">Creator Free</span>
                <span className="text-[14px] text-[var(--label-secondary)] font-medium">1 Identity • Basic Analytics</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-[19px]">$0</span>
                <span className="block text-[12px] text-[var(--label-tertiary)] font-bold">LIFETIME</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between group active:bg-[var(--separator)] transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="font-bold text-[19px] flex items-center gap-2">
                  Creator Pro
                  <div className="px-2 py-0.5 bg-[var(--accent)] text-[10px] font-bold text-white rounded-full uppercase tracking-tight">Best Value</div>
                </span>
                <span className="text-[14px] text-[var(--label-secondary)] font-medium">Unlimited DNA • AI Scoring • 4K Support</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-[19px] text-[var(--accent)]">$29</span>
                <span className="block text-[12px] text-[var(--label-tertiary)] font-bold">MONTHLY</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
             <button onClick={handleSignIn} className="ios-button-filled w-full h-14 text-[17px]">
               Start Your Free Trial
             </button>
             <p className="mt-4 text-[13px] text-[var(--label-tertiary)] font-medium underline cursor-pointer">View detailed feature comparison</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[var(--separator)] text-center sm:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
               <BrandIcon size={20} className="text-[var(--accent)]" />
               <span className="font-bold text-[19px] tracking-tight">CreatorOS</span>
            </div>
            <p className="text-[15px] text-[var(--label-secondary)] font-medium leading-tight"> Built for the modern creator economy.</p>
          </div>
          
          <div className="space-y-4">
            <span className="ios-label p-0">Product</span>
            <ul className="space-y-2 text-[15px] font-medium text-[var(--label-secondary)]">
               <li className="hover:text-[var(--accent)] cursor-pointer">Features</li>
               <li className="hover:text-[var(--accent)] cursor-pointer">Pricing</li>
               <li className="hover:text-[var(--accent)] cursor-pointer">Roadmap</li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="ios-label p-0">Company</span>
            <ul className="space-y-2 text-[15px] font-medium text-[var(--label-secondary)]">
               <li className="hover:text-[var(--accent)] cursor-pointer">Privacy</li>
               <li className="hover:text-[var(--accent)] cursor-pointer">Terms</li>
               <li className="hover:text-[var(--accent)] cursor-pointer">Support</li>
            </ul>
          </div>

          <div className="space-y-4">
            <span className="ios-label p-0">Connect</span>
            <div className="flex items-center gap-4 justify-center sm:justify-start">
               {[Twitter, Youtube, Instagram].map((Icon, i) => (
                 <div key={i} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--label-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer">
                    <Icon size={18} />
                 </div>
               ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-[var(--separator)] flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-[13px] text-[var(--label-tertiary)] font-medium">© 2026 CreatorOS. All rights reserved.</p>
           <p className="text-[13px] text-[var(--label-tertiary)] font-medium underline cursor-pointer">System Status: Online</p>
        </div>
      </footer>
    </div>
  );
}
