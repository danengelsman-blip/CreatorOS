import React, { useState } from 'react';
import { PaperPlaneRight as Send, CheckCircle as CheckCircle2, ArrowsClockwise as RefreshCw, Chat as MessageSquare, CaretRight as ChevronRight, Palette, TextT as Type, Target, Lightning as Zap, Lightbulb } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { generateBrandKit, generateContentIdeas } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import BrandIcon from './BrandIcon';

export default function Brand({ brand, setBrand, user }: { brand: any, setBrand: any, user: any }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

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

  const handleGenerateIdeas = async () => {
    if (!user || !brand) return;
    setIsGeneratingIdeas(true);
    try {
      const ideas = await generateContentIdeas(brand);
      const updatedBrand = { ...brand, content_ideas: ideas };
      
      const brandRef = doc(db, 'projects', `brand_${user.uid}`);
      await updateDoc(brandRef, {
        data: updatedBrand,
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `projects/brand_${user.uid}`));
      
      setBrand(updatedBrand);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  if (brand) {
    return (
      <div className="space-y-8 pb-20">
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1 pt-4">My Channel Style</h1>

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
                 <div className="flex gap-3">
                    {Object.values(brand.colors).map((c: any, index: number) => {
                      let hex = c;
                      if (hex === '#10B981') hex = '#B8542C';
                      else if (hex === '#6366F1') hex = '#C77D3F';
                      else if (hex === '#F59E0B') hex = '#6B8E4E';
                      else if (hex === '#0F172A') hex = '#2A1F17';
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-1.5">
                          <div 
                            className="w-16 h-16 rounded-xl shadow-sm" 
                            style={{ backgroundColor: hex }} 
                          />
                          <span className="text-[11px] font-mono text-[var(--label-tertiary)] tracking-wider uppercase">{hex}</span>
                        </div>
                      );
                    })}
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
            <span className="ios-label">Writing & Video Tone</span>
            <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
               <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                       <Target size={18} strokeWidth={1.5} />
                     </div>
                     <span className="font-semibold text-[17px]">Engaging Intro Angles</span>
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
                     <span className="font-semibold text-[17px]">Signature Phrases</span>
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

        {/* Content Ideas */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="ios-label px-0">Video Ideas For Your Channel</span>
            {!brand.content_ideas && (
              <a
                onClick={handleGenerateIdeas}
                className="text-[14px] font-semibold text-[var(--accent)] active:opacity-40 cursor-pointer"
              >
                {isGeneratingIdeas ? 'Brainstorming...' : 'Brainstorm Ideas'}
              </a>
            )}
          </div>
          
          {brand.content_ideas ? (
            <div className="space-y-4">
              {brand.content_ideas.map((idea: any, i: number) => (
                <div key={i} className="bg-[var(--bg-tertiary)] ios-card p-5 border-t border-[var(--separator)]">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] flex-shrink-0 mt-1 shadow-inner">
                      <Lightbulb size={20} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[17px] mb-1 leading-tight">{idea.title}</h3>
                      <div className="text-[14px] text-[var(--accent)] font-medium mb-2">Hook: "{idea.hook}"</div>
                      <p className="text-[15px] text-[var(--label-secondary)] leading-relaxed">
                        {idea.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <a
                  onClick={handleGenerateIdeas}
                  className="flex items-center gap-2 text-[14px] font-semibold text-[var(--label-secondary)] hover:text-[var(--label-primary)] transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={cn(isGeneratingIdeas && "animate-spin")} />
                  Refresh Ideas
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-tertiary)] ios-card p-8 text-center flex flex-col items-center justify-center border-t border-[var(--separator)]">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Lightbulb size={28} className="text-[var(--label-tertiary)]" />
              </div>
              <h3 className="font-semibold text-[17px] mb-2">Video Idea Brainstormer</h3>
              <p className="text-[15px] text-[var(--label-secondary)] max-w-sm mx-auto mb-6">
                Brainstorm 5 to 10 tailored video concepts that match your channel's new style and personality.
              </p>
              <button
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="ios-button ios-button-filled"
              >
                {isGeneratingIdeas ? (
                  <>
                    <RefreshCw size={18} className="animate-spin mr-2" />
                    Brainstorming...
                  </>
                ) : (
                  <>
                    <Lightbulb size={18} className="mr-2" />
                    Brainstorm Video Ideas
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <section className="pt-4">
          <button 
            onClick={() => setBrand(null)}
            className="ios-button ios-button-tinted w-full mt-8"
          >
            <RefreshCw size={17} strokeWidth={1.5} className="mr-2" />
            Start Over / Customize Style
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
          <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)]">My Channel Style</h1>
          <p className="text-[17px] text-[var(--label-secondary)] font-medium max-w-sm mx-auto">
            Tell us about your channel idea in plain English, and we'll create a customized look, tone, and theme for your videos.
          </p>
        </div>
      </div>

      <div className="ios-card bg-[var(--bg-tertiary)] p-6 space-y-6">
        <div className="flex justify-between items-center">
          <span className="ios-label px-0">Your Channel Idea</span>
          <a 
            onClick={() => setInput("Simple, healthy cooking for busy college students on a budget. Friendly, encouraging, and easy to follow.")}
            className="text-[15px] font-semibold text-[var(--accent)] active:opacity-40 cursor-pointer"
          >
            See Example
          </a>
        </div>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your channel. Who is it for? What kind of videos do you want to make? What should the vibe be?"
          className="ios-input h-48 py-4 resize-none"
        />
        
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="ios-button ios-button-filled w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} strokeWidth={1.5} className="animate-spin" />
              Creating Style...
            </>
          ) : (
            "Create My Channel Style"
          )}
        </button>
      </div>
    </div>
  );
}
