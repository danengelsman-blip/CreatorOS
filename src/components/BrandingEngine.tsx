import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  RefreshCw,
  Palette,
  Type as TypeIcon,
  Layout,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateBrandKit } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import BrandIcon from './BrandIcon';

export default function BrandingEngine({ brand, setBrand, user }: { brand: any, setBrand: any, user: any }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input || !user) return;
    setIsLoading(true);
    try {
      const kit = await generateBrandKit(input);
      
      // Save to Firestore
      const brandRef = doc(db, 'projects', `brand_${user.uid}`);
      await setDoc(brandRef, {
        userId: user.uid,
        name: kit.name || 'Untitled Brand',
        type: 'brand_kit',
        data: kit,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `projects/brand_${user.uid}`));
      
      setBrand(kit);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (brand) {
    return (
      <div className="space-y-8 md:space-y-10">
        <div className="bg-premium-ink text-white p-8 md:p-12 rounded-[32px] md:rounded-[40px] relative overflow-hidden shadow-2xl shadow-black/20">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md w-fit">
                <BrandIcon size={24} className="text-accent-gold" glow />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{brand.name}</h2>
            </div>
            <p className="text-xl md:text-2xl text-white/50 font-serif italic leading-relaxed max-w-2xl">"{brand.tagline}"</p>
            
            <div className="mt-8 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <div className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 rounded-full text-[12px] md:text-[13px] font-bold tracking-wide border border-white/10 backdrop-blur-sm">
                <span className="text-white/40 uppercase mr-2 tracking-widest text-[9px] md:text-[10px]">Archetype</span>
                {brand.archetype}
              </div>
              <div className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 rounded-full text-[12px] md:text-[13px] font-bold tracking-wide border border-white/10 backdrop-blur-sm">
                <span className="text-white/40 uppercase mr-2 tracking-widest text-[9px] md:text-[10px]">Personality</span>
                {brand.personality}
              </div>
            </div>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-violet/20 rounded-full blur-[120px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-cobalt/20 rounded-full blur-[120px] -ml-40 -mb-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Visual Identity */}
          <BrandCard title="Visual Identity" icon={Palette}>
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Color Palette</p>
                <div className="flex gap-4">
                  {Object.entries(brand.colors).map(([key, color]: [string, any]) => (
                    <div key={key} className="group relative">
                      <div 
                        className="w-14 h-14 rounded-2xl shadow-sm border border-premium-border transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap bg-premium-ink text-white px-2 py-1 rounded">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Typography</p>
                <div className="space-y-4">
                  <div className="p-4 bg-premium-bg rounded-2xl border border-premium-border">
                    <p className="text-2xl font-bold mb-1" style={{ fontFamily: brand.typography.heading }}>
                      {brand.typography.heading}
                    </p>
                    <p className="text-[11px] font-bold text-premium-muted uppercase tracking-widest">Heading Font</p>
                  </div>
                  <div className="p-4 bg-premium-bg rounded-2xl border border-premium-border">
                    <p className="text-base font-medium mb-1" style={{ fontFamily: brand.typography.body }}>
                      {brand.typography.body}
                    </p>
                    <p className="text-[11px] font-bold text-premium-muted uppercase tracking-widest">Body Font</p>
                  </div>
                </div>
              </div>
            </div>
          </BrandCard>

          {/* Content Strategy */}
          <BrandCard title="Content Strategy" icon={MessageSquare}>
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Core Hooks</p>
                <div className="space-y-3">
                  {brand.content_hooks.slice(0, 3).map((hook: string, i: number) => (
                    <div key={i} className="p-4 bg-premium-bg rounded-2xl text-[13px] border border-premium-border leading-relaxed font-medium">
                      "{hook}"
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Catchphrases</p>
                <div className="flex flex-wrap gap-2">
                  {brand.catchphrases.map((phrase: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-premium-ink text-white rounded-full text-[12px] font-bold tracking-tight">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </BrandCard>

          {/* Style Guide */}
          <BrandCard title="Style Guide" icon={Layout}>
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Visual Language</p>
                <p className="text-[14px] text-premium-ink leading-relaxed font-medium">{brand.visual_style}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-premium-muted mb-4">Thumbnail Direction</p>
                <p className="text-[14px] text-premium-ink leading-relaxed font-medium">{brand.thumbnail_style}</p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => setBrand(null)}
                  className="w-full py-4 border border-premium-border rounded-2xl text-[13px] font-bold hover:bg-premium-ink hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Re-generate Identity
                </button>
              </div>
            </div>
          </BrandCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8 md:pb-12">
      <div className="text-center space-y-6 mb-12 md:mb-16">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-premium-ink rounded-[28px] md:rounded-[32px] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-black/20 group hover:scale-105 transition-transform">
          <BrandIcon size={40} className="text-accent-gold" glow />
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance leading-tight">Architect your <span className="text-accent-violet italic font-serif font-normal">creator brand</span>.</h2>
        <p className="text-lg md:text-xl text-premium-muted max-w-2xl mx-auto text-balance leading-relaxed">Define your niche, personality, and vision. Our AI will craft a world-class identity system for your journey.</p>
      </div>

      <div className="premium-card p-6 md:p-10 bg-premium-surface shadow-2xl shadow-black/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-premium-muted">Describe your vision</label>
          <button 
            onClick={() => setInput("I want to build a brand around minimalist productivity for busy tech professionals. My vibe is calm, professional, but slightly rebellious.")}
            className="text-[11px] font-bold text-accent-violet hover:underline uppercase tracking-widest"
          >
            Try an example
          </button>
        </div>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your brand's mission, personality, and target audience..."
          className="w-full h-40 md:h-48 p-6 md:p-8 bg-premium-bg rounded-[20px] md:rounded-[24px] border border-premium-border focus:ring-2 focus:ring-accent-violet/20 outline-none text-lg md:text-xl resize-none font-medium placeholder:text-premium-muted transition-all"
        />
        
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full mt-6 md:mt-8 py-4 md:py-6 bg-premium-ink text-white rounded-[20px] md:rounded-[24px] font-bold text-lg md:text-xl flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 shadow-xl shadow-black/10"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              Architecting Your Identity...
            </>
          ) : (
            <>
              <BrandIcon size={24} className="text-accent-gold" glow />
              Generate Brand Kit
            </>
          )}
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <FeatureItem icon={Palette} title="Visual Identity" desc="Colors, typography, and visual language." />
        <FeatureItem icon={MessageSquare} title="Voice & Tone" desc="Core hooks and signature catchphrases." />
        <FeatureItem icon={Layout} title="Content Strategy" desc="Niche-specific direction and thumbnail styles." />
      </div>
    </div>
  );
}

function BrandCard({ title, icon: Icon, children }: any) {
  return (
    <div className="premium-card p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-premium-bg rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-premium-ink" />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 group">
      <div className="w-14 h-14 bg-premium-surface rounded-2xl border border-premium-border shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-md transition-all">
        <Icon className="w-6 h-6 text-premium-ink" />
      </div>
      <h4 className="font-bold text-[15px]">{title}</h4>
      <p className="text-[13px] text-premium-muted leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}
