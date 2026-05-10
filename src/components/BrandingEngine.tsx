import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Palette,
  Type,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateBrandKit } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import BrandIcon from './BrandIcon';

export default function Brand({ brand, setBrand, user }: { brand: any, setBrand: any, user: any }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input || !user) return;
    setIsLoading(true);
    try {
      const kit = await generateBrandKit(input);
      
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
      <div className="space-y-8 pb-20">
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1 pt-4">Brand</h1>

        {/* Identity Overview */}
        <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center flex-shrink-0">
              <BrandIcon size={32} strokeWidth={1.5} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-[28px] font-bold tracking-tight mb-1">{brand.archetype}</h2>
            </div>
          </div>
          
          <div className="border-t border-[var(--separator)] p-6 grid grid-cols-2 gap-4">
             <div>
               <span className="ios-label px-0">Personality</span>
               <span className="font-semibold">{brand.personality}</span>
             </div>
             <div>
               <span className="ios-label px-0">Visual Style</span>
               <span className="font-semibold block truncate">{brand.visual_style}</span>
             </div>
          </div>
        </section>

        {/* Assets & Voice Inset Grouped List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <span className="ios-label">Visual Identity</span>
            <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
              <div className="p-4 flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                     <Palette size={18} strokeWidth={1.5} />
                   </div>
                   <span className="font-semibold text-[17px]">Colors</span>
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    {Object.entries(brand.colors).map(([key, color]: [string, any]) => (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <div 
                          className="w-full aspect-square rounded-lg shadow-sm border border-[var(--separator)]" 
                          style={{ backgroundColor: color }} 
                        />
                        <span className="text-[10px] font-mono text-[var(--label-tertiary)] uppercase">{color}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                     <Type size={18} strokeWidth={1.5} />
                   </div>
                   <div className="flex flex-col">
                     <span className="font-semibold text-[17px]">{brand.typography.heading}</span>
                     <span className="text-[13px] text-[var(--label-secondary)]">Primary Typeface</span>
                   </div>
                 </div>
                 <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
              </div>
            </div>
          </section>

          <section>
            <span className="ios-label">Voice & Strategy</span>
            <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
               <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                       <Target size={18} strokeWidth={1.5} />
                     </div>
                     <span className="font-semibold text-[17px]">Core Hooks</span>
                  </div>
                  <div className="space-y-2">
                    {brand.content_hooks.slice(0, 2).map((hook: string, i: number) => (
                      <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-xl text-[14px] font-medium leading-tight">
                        {hook}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                       <Zap size={18} strokeWidth={1.5} />
                     </div>
                     <span className="font-semibold text-[17px]">Catchphrases</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brand.catchphrases.map((phrase: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--label-primary)] rounded-full text-[13px] font-semibold">
                        {phrase}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </section>
        </div>

        <section className="pt-4">
          <button 
            onClick={() => setBrand(null)}
            className="ios-button-gray w-full text-[17px]"
          >
            <RefreshCw size={18} strokeWidth={1.5} />
            Re-generate Brand Identity
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-12 pb-20">
      <div className="text-center flex flex-col items-center gap-6 pt-10">
        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-[22px] flex items-center justify-center ios-elevated border-t border-[var(--separator)]">
          <BrandIcon size={40} className="text-[var(--accent)]" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)]">Brand</h1>
          <p className="text-[17px] text-[var(--label-secondary)] font-medium max-w-sm mx-auto">
            Define your mission and AI will architect a world-class visual and strategic identity.
          </p>
        </div>
      </div>

      <div className="ios-card bg-[var(--bg-tertiary)] p-6 space-y-6">
        <div className="flex justify-between items-center">
          <span className="ios-label px-0">Mission Description</span>
          <button 
            onClick={() => setInput("Minimalist productivity for busy tech professionals. Calm, professional, but slightly rebellious.")}
            className="text-[15px] font-semibold text-[var(--accent)] active:opacity-40"
          >
            Example
          </button>
        </div>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your core purpose?"
          className="ios-input h-48 py-4 resize-none"
        />
        
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="ios-button-filled w-full text-[17px]"
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} strokeWidth={1.5} className="animate-spin" />
              Generating...
            </>
          ) : (
            "Build Brand Identity"
          )}
        </button>
      </div>
    </div>
  );
}
