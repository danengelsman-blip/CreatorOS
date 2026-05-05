import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Zap, 
  Layout, 
  Database, 
  Palette,
  Code2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

const CREATOR_OS_PROMPT = `# Super Prompt: CreatorOS - The Ultimate Creator Operating System

## 1. App Vision & Core Value Proposition
Build "CreatorOS", a premium, all-in-one operating system for digital creators. The goal is to help creators go from "Zero to First Dollar" by providing AI-driven coaching, branding, content automation, and community features. The app should feel high-end, atmospheric, and professional—like a specialized tool for high-performance individuals.

## 2. Design System & Aesthetic
- **Mood**: Immersive, Cinematic, Luxury, Professional.
- **Color Palette**: 
  - Background: Deep matte black/charcoal (#050505).
  - Accents: Warm Gold (#D97706), Emerald Green (#10B981).
  - Surfaces: Semi-transparent glassmorphism with subtle blurs.
- **Typography**: 
  - Headings: Serif (e.g., Cormorant Garamond) for a premium feel.
  - Body: Modern Sans-Serif (e.g., Inter) for legibility.
  - Accents: Monospace for technical data.
- **Animations**: Smooth transitions using Framer Motion. Layout animations for tab switching. Subtle glows and pulse effects on active elements.

## 3. Technical Stack
- **Frontend**: React 18+, TypeScript, Vite.
- **Styling**: Tailwind CSS (utility-first).
- **Backend/Database**: Firebase (Firestore, Authentication).
- **Icons**: Lucide React.
- **Charts**: Recharts (for analytics).
- **Animations**: Framer Motion (motion/react).

## 4. Core Modules & Features
### A. Dashboard (Home)
- Real-time growth metrics (Followers, Impressions, Engagement).
- "Momentum" indicator showing weekly growth velocity.
- "First Dollar" goal tracker with interactive milestones.
- AI-generated "Growth Insights" (e.g., best posting times, trending topics).
- Recent content preview.

### B. Content Studio (Create)
- AI-powered content generator.
- Multi-platform support (TikTok, LinkedIn, Twitter, etc.).
- Draft management with real-time Firestore syncing.
- "Quality Score" indicator for generated content.

### C. Branding Engine (Brand)
- Interactive brand identity builder.
- Define: Tone of voice, target audience, color palette, and core values.
- Generates a "Brand Kit" used to inform the AI content generator.

### D. Roadmap (Compass)
- A guided path for creators (e.g., Phase 1: Foundation, Phase 2: Growth, Phase 3: Monetization).
- Interactive task lists for each phase.

### E. Community & Reports
- Community feed for networking.
- Detailed analytics reports with interactive charts.

## 5. User Flow & Experience
- **Onboarding**: A cinematic step-by-step guide to set up the creator's brand.
- **Authentication**: Seamless Google Login via Firebase.
- **Persistence**: All data (brand, projects, user profile) must be stored in Firestore and updated in real-time.

## 6. Data Architecture (Firestore)
- users/{userId}: Profile data, subscription tier, last login.
- projects/{projectId}: Content drafts, platform, status, userId.
- projects/brand_{userId}: The creator's brand identity document.`;

export default function PromptArchitect() {
  const [copied, setCopied] = useState(false);
  const [customIdea, setCustomIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!customIdea.trim()) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a "Super Prompt" for an AI app builder (like anything.com or v0.dev) to build the following app idea: "${customIdea}". 
        Follow the structure:
        1. App Vision
        2. Design System (suggest a specific visual recipe like Brutalist, Luxury, or Minimal)
        3. Technical Stack
        4. Core Modules
        5. User Flow
        6. Data Architecture
        
        Make it extremely detailed and professional.`,
      });
      
      setGeneratedPrompt(response.text || '');
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedPrompt("Failed to generate prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-gold/10 text-accent-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Prompt Engineering</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Prompt Architect</h2>
          <p className="text-white/50 mt-2 max-w-xl">
            Generate high-fidelity "Super Prompts" to replicate this app or build entirely new ones with extreme precision.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-premium-bg bg-premium-surface flex items-center justify-center">
                <Cpu className="w-3 h-3 text-accent-gold" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AI Optimized</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: CreatorOS Prompt */}
        <div className="lg:col-span-7 space-y-6">
          <div className="premium-card bg-premium-surface border-accent-gold/10 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Layout className="w-4 h-4 text-accent-gold" />
                <h3 className="font-bold text-sm">CreatorOS Super Prompt</h3>
              </div>
              <button 
                onClick={() => copyToClipboard(CREATOR_OS_PROMPT)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[600px] font-mono text-[12px] leading-relaxed text-white/70 bg-black/20">
              <pre className="whitespace-pre-wrap">{CREATOR_OS_PROMPT}</pre>
            </div>
            
            <div className="p-4 bg-accent-gold/5 border-t border-accent-gold/10 flex items-center gap-3">
              <Zap className="w-4 h-4 text-accent-gold" />
              <p className="text-[11px] text-accent-gold/80 font-medium">
                Use this prompt on <span className="font-bold underline">anything.com</span> to replicate this exact application architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="premium-card p-8 bg-premium-ink text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-accent-gold" />
                </div>
                <h3 className="font-bold text-lg">Custom Architect</h3>
              </div>
              
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Have a different idea? Describe it briefly, and our AI will architect a full Super Prompt for you.
              </p>
              
              <div className="space-y-4">
                <textarea 
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="e.g., A fitness app for minimalist home workouts with real-time form correction..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
                />
                
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !customIdea.trim()}
                  className="w-full py-4 bg-accent-gold text-premium-bg rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Architecting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Super Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Abstract background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Generated Result */}
          <AnimatePresence>
            {generatedPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card bg-premium-surface border-accent-emerald/20 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-accent-emerald/5">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent-emerald" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent-emerald">Generated Result</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedPrompt)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-6 max-h-[300px] overflow-y-auto font-mono text-[11px] text-white/60 leading-relaxed">
                  <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <Palette className="w-4 h-4 text-accent-gold mb-2" />
              <h4 className="text-[11px] font-bold mb-1 uppercase tracking-wider">Design Recipes</h4>
              <p className="text-[10px] text-white/40 leading-relaxed">Include specific design moods for better results.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <Database className="w-4 h-4 text-accent-emerald mb-2" />
              <h4 className="text-[11px] font-bold mb-1 uppercase tracking-wider">Data Models</h4>
              <p className="text-[10px] text-white/40 leading-relaxed">Specify entities to get precise Firestore schemas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1">Technical Precision</h4>
            <p className="text-xs text-white/40 leading-relaxed">Prompts include full tech stacks and data architecture definitions.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1">Platform Ready</h4>
            <p className="text-xs text-white/40 leading-relaxed">Optimized for anything.com, v0.dev, bolt.new, and other AI builders.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1">Direct Export</h4>
            <p className="text-xs text-white/40 leading-relaxed">Copy-paste ready structure that AI models can parse instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
