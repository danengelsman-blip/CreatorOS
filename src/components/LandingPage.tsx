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
  X
} from 'lucide-react';
import { StudioIcon, HubIcon, IntelligenceIcon } from './IdentityIcons';
import { cn } from '../lib/utils';
import BrandIcon from './BrandIcon';
import { auth, loginWithGoogle } from '../firebase';

const COLORS = {
  primary: '#050505',
  surface: '#121212',
  card: '#1a1a1a',
  gold: '#D97706',
  goldLight: '#F59E0B',
  emerald: '#10B981',
  amber: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};

const FEATURES = [
  {
    id: 'branding',
    title: 'Branding Engine',
    description: 'AI-generated avatars, brand kits, and visual identity tools. Build a cohesive brand that stands out.',
    icon: BrandIcon,
    color: COLORS.gold
  },
  {
    id: 'content',
    title: 'Content Studio',
    description: 'Generate scripts, hooks, and captions in seconds. Never face blank page syndrome again.',
    icon: StudioIcon,
    color: COLORS.emerald
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    description: 'Real-time content scoring and monetization insights. Understand what drives your revenue.',
    icon: IntelligenceIcon,
    color: COLORS.amber
  },
  {
    id: 'hub',
    title: 'Creator Hub',
    description: 'Manage, schedule, and track multi-platform growth from a beautifully rendered interactive calendar.',
    icon: HubIcon,
    color: '#6366f1'
  }
];

const PRICING = [
  {
    tier: 'Free',
    price: '$0',
    features: ['1 Brand Profile', 'Basic Analytics', '10 Content Generations/mo', 'Community Support'],
    cta: 'Get Started',
    featured: false
  },
  {
    tier: 'Pro',
    price: '$29',
    features: ['Unlimited Brand Profiles', 'Advanced Analytics Dashboard', 'Unlimited AI Generations', 'YouTube Integration', 'Priority Support'],
    cta: 'Start Free Trial',
    featured: true
  },
  {
    tier: 'Agency',
    price: '$99',
    features: ['Everything in Pro', 'White-label Solution', 'API Access', 'Dedicated Account Manager', 'Custom Integrations'],
    cta: 'Contact Sales',
    featured: false
  }
];

const TESTIMONIALS = [
  {
    quote: "CreatorOS transformed how I approach my brand. The AI tools are incredible and the analytics help me understand what's actually working.",
    author: "Maya Rodriguez",
    handle: "@mayarodriguez",
    initials: "MR"
  },
  {
    quote: "Finally, a platform that understands creator needs. Went from 10K to 100K followers in 6 months with CreatorOS.",
    author: "James Chen",
    handle: "@jameschentech",
    initials: "JC"
  },
  {
    quote: "The branding engine alone is worth the subscription. My content has never looked more professional or cohesive.",
    author: "Sarah Kim",
    handle: "@sarahkimcreates",
    initials: "SK"
  }
];

const STATS = [
  { number: '10K+', label: 'Active Creators' },
  { number: '50M+', label: 'Content Generated' },
  { number: '4.9', label: 'Average Rating' },
  { number: '150+', label: 'Countries' }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.9]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
    <div className="bg-[#050505] text-white font-sans selection:bg-gold/30">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-[#121212]/80 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandIcon size={24} className="text-gold" glow />
            <span className="font-serif font-black text-2xl tracking-tighter">CreatorOS</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-gold transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-gold transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-400 hover:text-gold transition-colors">Testimonials</a>
            <button 
              onClick={handleSignIn}
              className="bg-gold hover:bg-goldLight text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
            >
              Sign In
            </button>
          </div>

          <button 
            className="md:hidden p-2 text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[90] bg-[#050505] pt-24 px-8 flex flex-col gap-8"
          >
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Features</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Pricing</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">Testimonials</a>
            <button 
              onClick={handleSignIn}
              className="bg-gold text-white px-8 py-4 rounded-xl font-bold text-lg mt-auto mb-12"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Background Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald/10 blur-[100px] rounded-full animate-pulse delay-1000" />
        
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
          <div className="w-full h-full bg-[url('https://picsum.photos/seed/creator/1920/1080?blur=10')] bg-cover bg-center" />
        </div>

        <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-bold mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            Trusted by 10,000+ creators worldwide
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[1.0] md:leading-[0.9]"
          >
            Architect your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-goldLight">creator brand.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium"
          >
            The AI-powered operating system for modern creators to design, score, and scale their digital identity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={handleSignIn}
              className="group relative bg-gold hover:bg-goldLight text-white px-10 py-5 rounded-xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gold/40 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Start Architecting Your Brand
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative bg-[#121212]">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">Core Features</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Everything you need to build a world-class brand</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">From AI-generated avatars to real-time content scoring, we handle the architecture so you can focus on the art.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:border-white/20 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundColor: feature.color }} />
                  <feature.icon size={32} className="relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black"
          >
            <img 
              src="https://picsum.photos/seed/dashboard/1600/900" 
              alt="CreatorOS Dashboard" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-[#121212]">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">Pricing</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Choose your plan</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {PRICING.map((plan, index) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-10 rounded-3xl border transition-all",
                  plan.featured 
                    ? "bg-[#1a1a1a] border-gold shadow-2xl shadow-gold/10 lg:scale-105 z-10" 
                    : "bg-[#0a0a0a] border-white/5 hover:border-white/20"
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-10">
                  <h3 className="text-xl font-bold text-gray-400 mb-4">{plan.tier}</h3>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-gray-500 mb-1">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-emerald flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={handleSignIn}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold transition-all",
                    plan.featured 
                      ? "bg-gold hover:bg-goldLight text-white shadow-lg shadow-gold/20" 
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  )}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">Testimonials</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Loved by creators worldwide</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {TESTIMONIALS.map((t, index) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-[#1a1a1a] border border-white/5 rounded-2xl relative"
              >
                <div className="absolute -top-4 -left-4 text-gold/20">
                  <Star className="w-12 h-12 fill-current" />
                </div>
                <p className="text-lg text-gray-300 leading-relaxed mb-8 relative z-10 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-emerald flex items-center justify-center font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold">{t.author}</div>
                    <div className="text-sm text-gray-500">{t.handle}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-24 border-t border-white/5">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gold to-emerald mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-emerald/10" />
        <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8"
          >
            Ready to architect <br />
            your brand?
          </motion.h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of creators who are building world-class brands with CreatorOS.</p>
          <button 
            onClick={handleSignIn}
            className="bg-gold hover:bg-goldLight text-white px-12 py-6 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gold/40"
          >
            Start Architecting Your Brand
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#121212] border-t border-white/5">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BrandIcon size={24} className="text-gold" />
                <span className="font-serif font-black text-2xl tracking-tighter">CreatorOS</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-8">The AI-powered operating system for modern creators. Build, score, and scale your digital identity.</p>
              <div className="flex items-center gap-4">
                {[Twitter, Youtube, Instagram, Globe].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gold transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-gold transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gold transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div>© 2024 CreatorOS. All rights reserved.</div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
