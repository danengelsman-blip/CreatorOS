import React, { useState } from 'react';
import { Lightbulb, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react';
import { generateContentIdeas } from '../services/gemini';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function VideoIdeas({ brand, setBrand, user, setActiveTab }: { brand: any, setBrand: any, user: any, setActiveTab: any }) {
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerateIdeas = async () => {
    if (!user || !brand) return;
    setIsGeneratingIdeas(true);
    setErrorMsg('');
    
    try {
      const ideas = await generateContentIdeas(brand);
      const updatedBrand = { ...brand, content_ideas: ideas };
      
      const brandRef = doc(db, 'projects', `brand_${user.uid}`);
      await updateDoc(brandRef, {
        data: updatedBrand,
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `projects/brand_${user.uid}`));
      
      setBrand(updatedBrand);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'An error occurred while generating ideas.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  if (!brand) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Lightbulb size={32} className="text-[var(--label-tertiary)]" />
        </div>
        <h2 className="font-serif text-[32px] font-semibold tracking-[-0.015em] mb-4">You need a Brand Kit first</h2>
        <p className="text-[17px] text-[var(--label-secondary)] mb-8 max-w-md">
          To generate highly targeted video ideas, you'll need to define your channel's brand style and personality.
        </p>
        <button 
          onClick={() => setActiveTab('brand')}
          className="ios-button ios-button-filled px-8"
        >
          Create Brand Kit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)]">Video Ideas</h1>
        <p className="text-[17px] text-[var(--label-secondary)]">Brainstorm concepts tailored to your brand's unique style.</p>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="ios-label px-0">Your Ideas</span>
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-[var(--bg-tertiary)] ios-card p-6 border border-[var(--separator)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] flex-shrink-0 mt-1 border border-[var(--separator)]">
                    <Lightbulb size={24} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[19px] mb-2 leading-tight tracking-tight">{idea.title}</h3>
                    <div className="inline-block px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[13px] rounded-lg mb-3">
                      Hook: "{idea.hook}"
                    </div>
                    <p className="text-[15px] text-[var(--label-secondary)] leading-relaxed font-medium">
                      {idea.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="flex justify-end pt-4">
              <a
                onClick={handleGenerateIdeas}
                className="flex items-center gap-2 text-[14px] font-semibold text-[var(--label-secondary)] hover:text-[var(--label-primary)] transition-colors cursor-pointer"
              >
                <RefreshCw size={16} className={cn(isGeneratingIdeas && "animate-spin")} />
                Generate Fresh Ideas
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-tertiary)] ios-card p-12 text-center flex flex-col items-center justify-center border border-[var(--separator)]">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[var(--separator)]">
              <Lightbulb size={32} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-serif text-[24px] font-semibold tracking-[-0.01em] mb-2">Ready to Brainstorm?</h3>
            <p className="text-[15px] text-[var(--label-secondary)] max-w-sm mx-auto mb-8 font-medium leading-relaxed">
              We'll use your brand kit to generate 5 to 10 tailored video concepts that match your channel's unique style and personality.
            </p>
            <button
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas}
              className="ios-button ios-button-filled px-8 h-12 text-[16px]"
            >
              {isGeneratingIdeas ? (
                <>
                  <RefreshCw size={20} className="animate-spin mr-2" />
                  Brainstorming Ideas...
                </>
              ) : (
                <>
                  <Lightbulb size={20} className="mr-2" />
                  Generate Ideas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
