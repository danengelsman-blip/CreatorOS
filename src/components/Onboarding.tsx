import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  PenTool, 
  Palette, 
  ArrowRight, 
  ChevronRight, 
  Sparkles,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
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
    accent: "bg-accent-violet",
    image: "https://picsum.photos/seed/creator1/800/600?blur=2"
  },
  {
    id: 'coaching',
    title: "World-Class AI Coaching",
    description: "Get real-time feedback on your content, growth insights, and niche-specific strategies to scale your audience.",
    icon: LayoutGrid,
    accent: "bg-accent-emerald",
    image: "https://picsum.photos/seed/analytics/800/600?blur=2"
  },
  {
    id: 'content',
    title: "Content Studio",
    description: "Generate high-performing scripts, captions, and hooks tailored to your unique brand voice in seconds.",
    icon: PenTool,
    accent: "bg-accent-cobalt",
    image: "https://picsum.photos/seed/writing/800/600?blur=2"
  },
  {
    id: 'branding',
    title: "Architect Your Identity",
    description: "Everything starts with your brand. Let's define your niche, personality, and vision to unlock the full power of CreatorOS.",
    icon: Palette,
    accent: "bg-accent-gold",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-premium-ink/40 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-premium-surface rounded-[40px] shadow-2xl overflow-hidden flex flex-col sm:flex-row h-[600px] sm:h-[640px]"
      >
        {/* Left Side: Visuals */}
        <div className="hidden sm:block sm:w-1/2 relative bg-premium-ink">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-premium-ink via-transparent to-transparent" />
              
              <div className="absolute bottom-12 left-12 right-12">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl", step.accent)}>
                  <step.icon size={32} className="text-white" glow={step.id === 'welcome'} />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {STEPS.map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          i === currentStep ? "w-8 bg-white" : "w-2 bg-white/20"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em]">
                    Step 0{currentStep + 1} / 04
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 sm:p-16 flex flex-col justify-center relative">
          <button 
            onClick={() => onComplete()}
            className="absolute top-8 right-8 text-[11px] font-bold text-premium-muted hover:text-premium-ink uppercase tracking-widest transition-colors"
          >
            Skip Intro
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="sm:hidden w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-premium-ink">
                <step.icon size={24} className="text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance">
                  {step.title}
                </h2>
                <p className="text-lg sm:text-xl text-premium-muted leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleNext}
                  className="px-8 py-4 bg-premium-ink text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                  {currentStep === STEPS.length - 1 ? "Start Branding" : "Continue"}
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-8 py-4 border border-premium-border text-premium-ink rounded-2xl font-bold text-lg hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feature highlights for mobile */}
          <div className="mt-12 sm:hidden flex gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentStep ? "w-8 bg-premium-ink" : "w-2 bg-premium-border"
                )} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
