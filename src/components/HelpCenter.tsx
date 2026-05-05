import React, { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  Target, 
  Palette, 
  PenTool, 
  Compass, 
  BarChart3, 
  MessageSquare, 
  ChevronRight,
  Search,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const HELP_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'New to CreatorOS? Start here to build your foundation.',
    content: [
      {
        subtitle: 'Welcome to the Future of Creation',
        text: 'CreatorOS is not just a tool; it is your AI-powered operating system. Think of it as a high-end design studio where you are the Lead Architect and the AI is your world-class production team. Our goal is to take you from "Zero to First Dollar" by removing the technical friction of building a brand.'
      },
      {
        subtitle: 'Your First 15 Minutes',
        text: 'The most important first step is completing your "Digital DNA" in the Branding Engine. Without a brand identity, the AI is just guessing. Once your brand is defined, every piece of content generated will sound, look, and feel like you.'
      }
    ]
  },
  {
    id: 'branding',
    title: 'The Branding Engine',
    icon: Palette,
    description: 'How to define your "Digital DNA" and visual identity.',
    content: [
      {
        subtitle: 'What is a Brand Kit?',
        text: 'In CreatorOS, your Brand Kit is the "Source of Truth." It includes your Tone of Voice (how you speak), your Target Audience (who you help), and your Visual Style. The AI uses this data as a filter for everything it creates.'
      },
      {
        subtitle: 'Collaborating with AI on Brand',
        text: 'When describing your brand, be specific. Instead of saying "I want to be professional," try "I want to sound like a luxury architectural firm that is authoritative yet accessible." The more descriptive you are, the more precise the AI becomes.'
      }
    ]
  },
  {
    id: 'content',
    title: 'The Content Studio',
    icon: PenTool,
    description: 'Mastering the art of AI-assisted content creation.',
    content: [
      {
        subtitle: 'Your AI Co-Pilot',
        text: 'The Content Studio is where your ideas become reality. You provide the "Seed" (the core idea), and the AI handles the "Architecture" (the structure, hooks, and formatting).'
      },
      {
        subtitle: 'The Quality Score',
        text: 'Every draft is given a Quality Score. This isn\'t just a number; it\'s an analysis of how well your content aligns with your Brand Kit and current platform trends. Aim for a score of 8.5 or higher before publishing.'
      }
    ]
  },
  {
    id: 'ai-tips',
    title: 'AI Collaboration 101',
    icon: Sparkles,
    description: 'Learn how to talk to AI to get world-class results.',
    content: [
      {
        subtitle: 'The "Context is King" Rule',
        text: 'AI performs best when it knows its role. When using the Content Studio, tell the AI who it is. For example: "Act as a viral TikTok strategist. Write a hook for a video about minimalist desk setups."'
      },
      {
        subtitle: 'Iterative Design',
        text: 'Don\'t expect perfection on the first try. AI collaboration is a conversation. If a script isn\'t quite right, tell the AI: "This is good, but make the tone more punchy and remove the technical jargon." This is called "Refining the Architecture."'
      }
    ]
  },
  {
    id: 'roadmap',
    title: 'The Roadmap',
    icon: Compass,
    description: 'Understanding your path from zero to monetization.',
    content: [
      {
        subtitle: 'The Three Phases',
        text: 'CreatorOS breaks your journey into three distinct phases: 1. Foundation (Setting up your brand), 2. Momentum (Consistent content and audience growth), and 3. Monetization (Your first dollar and beyond).'
      },
      {
        subtitle: 'Milestones',
        text: 'Check your Roadmap daily. Each milestone you complete unlocks new capabilities within the OS and brings you closer to becoming a full-time creator.'
      }
    ]
  },
  {
    id: 'creator-hub',
    title: 'The Creator Hub',
    icon: Layout,
    description: 'Mastering your multi-platform command center.',
    content: [
      {
        subtitle: 'Unlocking the Hub',
        text: 'The Creator Hub is a high-performance feature that unlocks automatically after you architect your first piece of content. It serves as your central command center for managing your growing digital empire.'
      },
      {
        subtitle: 'Platform-Specific Intelligence',
        text: 'Each piece of content in your Hub is color-coded by platform (e.g., Red for YouTube, Cyan for TikTok). If you remaster content for multiple platforms, it will glow with a "Multi-Platform" gradient, signaling its broad reach.'
      },
      {
        subtitle: 'The Interactive Calendar',
        text: 'Use the Calendar view to visualize your posting schedule. A consistent posting rhythm is the secret to algorithmic success. Drag and drop your drafts into the calendar to set your strategy for the week.'
      }
    ]
  }
];

export default function HelpCenter() {
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = HELP_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = HELP_SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-gold/10 text-accent-gold rounded-lg flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Support Center</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">CreatorOS Documentation</h2>
          <p className="text-white/50 mt-2 max-w-xl">
            Everything you need to master the OS and architect your digital empire.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-premium-surface border border-premium-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-gold/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="premium-card p-4 space-y-1">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group",
                  activeSection === section.id 
                    ? "bg-accent-gold text-premium-bg shadow-xl shadow-accent-gold/10" 
                    : "hover:bg-white/5 text-white/60 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  activeSection === section.id ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <section.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{section.title}</div>
                  <div className={cn(
                    "text-[10px] uppercase tracking-wider font-bold opacity-60",
                    activeSection === section.id ? "text-premium-bg" : "text-white/40"
                  )}>
                    {section.content.length} Articles
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Tips Card */}
          <div className="premium-card p-8 bg-gradient-to-br from-accent-gold/10 to-transparent border-accent-gold/20">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-5 h-5 text-accent-gold" />
              <h3 className="font-bold">Pro Tip</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed italic">
              "The best creators don't just use AI; they architect with it. Treat every prompt as a design brief."
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="premium-card p-10 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-premium-bg rounded-2xl flex items-center justify-center border border-premium-border shadow-2xl">
                    <currentSection.icon className="w-7 h-7 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{currentSection.title}</h3>
                    <p className="text-white/40 text-sm mt-1">{currentSection.description}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  {currentSection.content.map((item, index) => (
                    <div key={index} className="space-y-4">
                      <h4 className="text-xl font-bold flex items-center gap-3 text-white">
                        <span className="text-accent-gold font-mono text-sm">0{index + 1}.</span>
                        {item.subtitle}
                      </h4>
                      <p className="text-white/60 leading-relaxed text-lg font-medium">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Verified by CreatorOS Team</span>
                  </div>
                  <button className="flex items-center gap-2 text-accent-gold text-sm font-bold hover:underline">
                    Still need help? Contact Support <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Related Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-accent-gold/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors">
                      <MessageSquare className="w-5 h-5 text-white/40 group-hover:text-accent-gold" />
                    </div>
                    <div className="font-bold text-sm">Join the Community</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent-gold group-hover:translate-x-1 transition-all" />
                </div>
                <div className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-accent-gold/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors">
                      <BarChart3 className="w-5 h-5 text-white/40 group-hover:text-accent-gold" />
                    </div>
                    <div className="font-bold text-sm">View Success Stories</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
