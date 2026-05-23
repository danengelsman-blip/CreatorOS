import React, { useState } from 'react';
import { Copy, Check, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react';
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
  const [copiedStatic, setCopiedStatic] = useState(false);
  const [copiedGenerated, setCopiedGenerated] = useState(false);
  const [customIdea, setCustomIdea] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const copyStatic = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatic(true);
    setTimeout(() => setCopiedStatic(false), 2000);
  };

  const copyGenerated = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGenerated(true);
    setTimeout(() => setCopiedGenerated(false), 2000);
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
        2. Design System
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
    <div className="max-w-xl mx-auto flex flex-col gap-8 pb-20">
      <div className="space-y-4 pt-10">
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)]">Architect</h1>
        <p className="text-[17px] text-[var(--label-secondary)]">
          Generate high-fidelity "Super Prompts" to replicate this app or build entirely new ones with extreme precision.
        </p>
      </div>
      
      <div className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-6">
        <div className="flex justify-between items-center">
          <span className="ios-label px-0">App Idea</span>
        </div>
        <textarea 
          value={customIdea}
          onChange={(e) => setCustomIdea(e.target.value)}
          placeholder="Describe your app idea..."
          className="ios-input h-32 py-4 resize-none"
        />
        
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !customIdea.trim()}
          className="ios-button ios-button-filled w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={20} strokeWidth={1.5} className="animate-spin mr-2 inline" />
              Generating...
            </>
          ) : (
            "Generate Super Prompt"
          )}
        </button>
      </div>

      <div className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="ios-label px-0">Custom Architect</span>
          <a 
            onClick={() => copyStatic(CREATOR_OS_PROMPT)}
            className="text-[15px] font-semibold text-[var(--accent)] active:opacity-40 transition-opacity cursor-pointer"
          >
            {copiedStatic ? 'Copied' : 'Copy'}
          </a>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 max-h-[400px] overflow-y-auto">
          <pre className="font-mono text-[13px] text-[var(--label-secondary)] whitespace-pre-wrap leading-relaxed">
            {CREATOR_OS_PROMPT}
          </pre>
        </div>
      </div>

      <AnimatePresence>
        {generatedPrompt && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="ios-label px-0">Generated Result</span>
              <a 
                onClick={() => copyGenerated(generatedPrompt)}
                className="text-[15px] font-semibold text-[var(--accent)] active:opacity-40 transition-opacity cursor-pointer"
              >
                {copiedGenerated ? 'Copied' : 'Copy'}
              </a>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 max-h-[400px] overflow-y-auto">
              <pre className="font-mono text-[13px] text-[var(--label-secondary)] whitespace-pre-wrap leading-relaxed">
                {generatedPrompt}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
