import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GridFour as LayoutGrid, PenNib as PenTool, Palette, ArrowRight, CaretRight as ChevronRight, Sparkle as Sparkles, Target, Lightning as Zap, CheckCircle as CheckCircle2 } from '@phosphor-icons/react';
import BrandIcon from './BrandIcon';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (targetTab?: string) => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: "Your Creator Journey Starts Here",
    description: "CreatorOS is your AI-powered command center for building a world-class brand and content empire.",
    icon: BrandIcon,
    image: "https://picsum.photos/seed/creator1/800/600?blur=2"
  },
  {
    id: 'coaching',
    title: "World-Class AI Coaching",
    description: "Get real-time feedback on your content, growth insights, and niche-specific strategies to scale your audience.",
    icon: LayoutGrid,
    image: "https://picsum.photos/seed/analytics/800/600?blur=2"
  },
  {
    id: 'content',
    title: "Content Studio",
    description: "Generate high-performing scripts, captions, and hooks tailored to your unique brand voice in seconds.",
    icon: PenTool,
    image: "https://picsum.photos/seed/writing/800/600?blur=2"
  },
  {
    id: 'branding',
    title: "Architect Your Identity",
    description: "Everything starts with your brand. Let's define your niche, personality, and vision to unlock the full power of CreatorOS.",
    icon: Palette,
    image: "https://picsum.photos/seed/branding/800/600?blur=2"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete('brand');
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-4xl bg-[var(--bg-secondary)] rounded-[40px] shadow-2xl overflow-hidden flex flex-col sm:flex-row h-full max-h-[700px] border border-white/10"
      >
        {/* Left Side: Visuals */}
        <div className="hidden sm:block sm:w-1/2 relative bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-full object-cover opacity-60 mix-blend-soft-light scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              <div className="absolute bottom-12 left-12 right-12 z-20">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 w-fit mb-6 shadow-2xl">
                  <step.icon size={40} className="text-white" glow={step.id === 'welcome'} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {STEPS.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-700",
                          i === currentStep ? "w-10 bg-white" : "w-2 bg-white/20"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">
                    Phase 0{currentStep + 1}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 sm:p-14 flex flex-col justify-center relative bg-[var(--bg-secondary)]">
          <button 
            onClick={() => onComplete()}
            className="ios-button ios-button-tinted absolute top-10 right-10"
          >
            Skip
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="sm:hidden w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 bg-[var(--bg-tertiary)] border border-[var(--separator)]">
                <step.icon size={32} strokeWidth={1.5} className="text-[var(--accent)]" />
              </div>
              
              <div className="space-y-4">
                <h2 className="font-serif text-[38px] sm:text-[44px] font-semibold tracking-[-0.015em] leading-tight text-balance">
                  {step.title}
                </h2>
                <p className="text-[19px] sm:text-[21px] text-[var(--label-secondary)] leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="pt-8 flex flex-col gap-4">
                <button 
                  onClick={handleNext}
                  className="ios-button ios-button-filled w-full"
                >
                  {currentStep === STEPS.length - 1 ? "Get Started" : "Continue"}
                  <ChevronRight size={24} strokeWidth={1.5} />
                </button>
                
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="ios-button ios-button-gray w-full mt-4"
                  >
                    Back
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots for mobile */}
          <div className="sm:hidden mt-auto pt-10 flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === currentStep ? "w-8 bg-[var(--accent)]" : "w-1.5 bg-[var(--separator)]"
                )} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
