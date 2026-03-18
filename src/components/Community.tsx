import React from 'react';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Zap, 
  Search,
  ArrowUpRight,
  Globe,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import AppleCardStack from './ui/AppleCardStack';

const LEADERBOARD = [
  { name: 'Alex Rivera', niche: 'Tech Productivity', streak: 42, score: 98, avatar: 'https://picsum.photos/seed/alex/100/100' },
  { name: 'Sarah Chen', niche: 'Digital Art', streak: 31, score: 95, avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { name: 'Marcus Thorne', niche: 'Solo Entrepreneurship', streak: 28, score: 92, avatar: 'https://picsum.photos/seed/marcus/100/100' },
  { name: 'Elena Rodriguez', niche: 'Sustainable Living', streak: 25, score: 90, avatar: 'https://picsum.photos/seed/elena/100/100' },
];

export default function Community({ user, setActiveTab }: { user: any, setActiveTab: (tab: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Feed */}
      <div className="lg:col-span-8 space-y-10">
        <div className="premium-card p-6 bg-white flex items-center gap-4 border border-black/[0.03]">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-black/[0.03] overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Search className="w-5 h-5 text-premium-muted" />
            )}
          </div>
          <input 
            type="text" 
            placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'Creator'}?`} 
            className="flex-1 bg-transparent outline-none font-medium text-lg placeholder:text-gray-300"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-bold text-premium-muted uppercase tracking-[0.2em]">Live Momentum</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-accent-emerald uppercase tracking-widest">1,204 Online</span>
            </div>
          </div>
          
      {[
        { name: 'Sarah Chen', platform: 'LinkedIn', score: 92, content: "Just finished Day 12 of the 30-Day Challenge! The AI coach suggested I tighten my hook and it really worked. Seeing 2x engagement already.", boosts: 12, comments: 3, color: 'from-indigo-500 to-purple-500' },
        { name: 'Marcus Thorne', platform: 'Twitter/X', score: 88, content: "The branding engine just gave me a tagline that actually feels like me. Finally moving past the 'blank page' phase.", boosts: 8, comments: 5, color: 'from-emerald-500 to-teal-500' },
        { name: 'Elena Rodriguez', platform: 'Instagram', score: 95, content: "Hit 1,000 followers today! The content scoring system is basically a cheat code for growth.", boosts: 24, comments: 12, color: 'from-orange-500 to-pink-500' }
      ].map((item, i) => (
        <div key={i} className="premium-card p-6 lg:p-8 bg-white hover:shadow-2xl hover:shadow-black/[0.03] transition-all duration-500 group border border-black/[0.02]">
          <div className="flex items-center gap-4 mb-6">
            <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br flex-shrink-0 shadow-inner", item.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-base lg:text-lg tracking-tight truncate text-premium-ink">{item.name}</h4>
                <div className="flex items-center gap-1.5 px-2 py-0.5 lg:px-2.5 lg:py-1 bg-accent-emerald/5 text-accent-emerald rounded-lg border border-accent-emerald/10 flex-shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] lg:text-[11px] font-bold tabular-nums leading-none">{item.score}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] lg:text-[12px] text-premium-muted font-bold uppercase tracking-widest">{item.platform}</span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[10px] lg:text-[12px] text-premium-muted font-medium">2m ago</span>
              </div>
            </div>
          </div>
          
          <div className="pl-0 sm:pl-14 lg:pl-16">
            <p className="text-base lg:text-lg leading-relaxed text-premium-ink mb-6 lg:mb-8 font-medium italic font-serif">
              "{item.content}"
            </p>
            
            <div className="flex items-center gap-6 lg:gap-8 pt-6 border-t border-premium-border">
              <button className="flex items-center gap-2 text-[12px] lg:text-[13px] font-bold text-premium-muted hover:text-accent-violet transition-colors group/btn">
                <Zap className="w-4 h-4 group-hover/btn:fill-accent-violet transition-all" />
                <span className="tabular-nums">{item.boosts}</span>
              </button>
              <button className="flex items-center gap-2 text-[12px] lg:text-[13px] font-bold text-premium-muted hover:text-accent-violet transition-colors group/btn">
                <MessageCircle className="w-4 h-4 group-hover/btn:fill-accent-violet transition-all" />
                <span className="tabular-nums">{item.comments}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-10">
        <div className="premium-card p-10 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-lg tracking-tight">Daily Inspiration</h3>
            <div className="w-10 h-10 bg-accent-violet/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-violet" />
            </div>
          </div>
          
          <AppleCardStack 
            items={[
              {
                id: 1,
                content: (
                  <div className="p-8 flex flex-col h-full bg-gradient-to-br from-accent-violet/5 to-transparent">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-accent-violet" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Morning Hook</h4>
                    <p className="text-premium-muted text-sm leading-relaxed">
                      "I spent 100 hours researching X so you don't have to. Here are the 3 things that actually matter..."
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-accent-violet uppercase tracking-widest">
                      Fling to skip <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ),
                backContent: (
                  <div className="p-8 flex flex-col h-full">
                    <h4 className="text-xl font-bold mb-4">Why it works</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      This hook leverages the "Curiosity Gap" and "Time Saved" value propositions. It positions you as an authority who has done the hard work.
                    </p>
                  </div>
                )
              },
              {
                id: 2,
                content: (
                  <div className="p-8 flex flex-col h-full bg-gradient-to-br from-accent-emerald/5 to-transparent">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                      <Globe className="w-6 h-6 text-accent-emerald" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Visual Style</h4>
                    <p className="text-premium-muted text-sm leading-relaxed">
                      Use high-contrast, minimalist thumbnails with a single focal point to increase CTR by up to 40%.
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-accent-emerald uppercase tracking-widest">
                      Fling to skip <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ),
                backContent: (
                  <div className="p-8 flex flex-col h-full">
                    <h4 className="text-xl font-bold mb-4">Pro Tip</h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Avoid cluttered backgrounds. The human eye gravitates towards simplicity in a busy feed.
                    </p>
                  </div>
                )
              }
            ]}
          />
        </div>

        <div className="premium-card p-10 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-lg tracking-tight">Elite Creators</h3>
            <div className="w-10 h-10 bg-accent-gold/10 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent-gold" />
            </div>
          </div>
          <div className="space-y-8">
            {LEADERBOARD.map((user, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-premium-ink text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-premium-ink">{user.name}</p>
                    <p className="text-[12px] text-premium-muted font-medium">{user.niche}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[15px] text-premium-ink">{user.streak}d</p>
                  <p className="text-[10px] text-premium-muted uppercase font-bold tracking-widest">Streak</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-5 bg-gray-50 border border-black/[0.03] rounded-[20px] text-[13px] font-bold text-premium-ink hover:bg-premium-ink hover:text-white transition-all shadow-sm">
            View Global Rankings
          </button>
        </div>

        <div className="bg-premium-ink p-10 rounded-[24px] text-white shadow-2xl shadow-black/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
              <Globe className="w-6 h-6 text-accent-cobalt" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-3">Creator Journey</h3>
            <p className="text-[14px] text-white/50 mb-8 leading-relaxed font-medium">
              Your public portfolio updates in real-time as you build. Share your momentum with the world.
            </p>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-full py-5 bg-white text-premium-ink rounded-[20px] font-bold text-[14px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              View My Page
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-cobalt/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent-violet/10 rounded-full blur-[80px]" />
        </div>
      </div>
    </div>
  );
}
