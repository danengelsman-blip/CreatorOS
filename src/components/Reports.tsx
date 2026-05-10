import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  DollarSign, 
  PieChart, 
  ArrowUpRight,
  Download,
  Calendar,
  ChevronDown,
  Sparkles,
  ChevronRight,
  Activity,
  TrendingUp,
  Brain
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { authorizedFetch } from '../firebase';

export default function Intelligence({ user }: { user: any }) {
  const [youtubeStats, setYoutubeStats] = useState<any>(null);
  const [tiktokStats, setTiktokStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [yt, tt] = await Promise.all([
          authorizedFetch('/api/analytics/youtube').catch(() => null),
          authorizedFetch('/api/analytics/tiktok').catch(() => null)
        ]);
        
        if (yt && (yt.views > 0 || yt.subscribers > 0)) setYoutubeStats(yt);
        if (tt && (tt.views > 0 || tt.followers > 0)) setTiktokStats(tt);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllStats();
  }, [user]);

  return (
    <div className="space-y-8 pb-20">
      <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1 pt-4">Intelligence</h1>

      {/* YouTube Overview Analytics Card */}
      <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="ios-label px-0 mb-0">YouTube Performance</span>
            <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-[var(--label-secondary)] font-semibold uppercase tracking-wider">Total Views</span>
              <div className="flex flex-col">
                <span className="text-[34px] font-bold tracking-tight leading-none text-[var(--label-primary)]">
                  {youtubeStats ? youtubeStats.views.toLocaleString() : '---'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-[var(--label-secondary)] font-semibold uppercase tracking-wider">Subscribers</span>
              <div className="flex flex-col">
                <span className="text-[34px] font-bold tracking-tight leading-none text-[var(--label-primary)]">
                  {youtubeStats ? youtubeStats.subscribers.toLocaleString() : '---'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-[var(--label-secondary)] font-semibold uppercase tracking-wider">Videos</span>
              <div className="flex flex-col">
                <span className="text-[34px] font-bold tracking-tight leading-none text-[var(--label-primary)]">
                  {youtubeStats ? youtubeStats.videos.toLocaleString() : '---'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="h-[200px] w-full bg-[var(--bg-secondary)] rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'M', value: 400 },
                    { name: 'T', value: 300 },
                    { name: 'W', value: 500 },
                    { name: 'T', value: 450 },
                    { name: 'F', value: 700 },
                    { name: 'S', value: 600 },
                    { name: 'S', value: 900 },
                  ]} barGap={8} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--label-tertiary)" strokeOpacity={0.08} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--label-secondary)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--label-secondary)' }} dx={-10} />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="border-t border-[var(--separator)] grid grid-cols-2 divide-x divide-[var(--separator)] bg-[var(--bg-secondary)]">
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">TT Views</span>
              <span className="text-[20px] font-bold">{tiktokStats?.views?.toLocaleString() || '---'}</span>
           </div>
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">TT Followers</span>
              <span className="text-[20px] font-bold">{tiktokStats?.followers?.toLocaleString() || '---'}</span>
           </div>
        </div>
      </section>

      {/* Intelligence Insights Inset Grouped List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <span className="ios-label">AI Insights</span>
          <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
             <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                      <Brain size={18} strokeWidth={1.5} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-[17px]">Engagement Drop</span>
                      <span className="text-[13px] text-[var(--label-secondary)]">Cliff detected at 0:15 in short-form.</span>
                   </div>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
             </div>
             
             <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--system-green) 12%, transparent)', color: 'var(--system-green)'}}>
                      <Activity size={18} strokeWidth={1.5} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-[17px]">Optimal Timing</span>
                      <span className="text-[13px] text-[var(--label-secondary)]">Your audience peaks at 7PM EST.</span>
                   </div>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
             </div>
          </div>
        </section>

        <section>
           <span className="ios-label">Strategic Forecast</span>
           <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)] p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                 <TrendingUp size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                 <span className="text-[34px] font-bold tracking-tight text-[var(--accent)]">$2.1K</span>
                 <p className="text-[13px] text-[var(--label-secondary)] font-medium leading-tight">
                    Projected revenue for July based on current growth velocity.
                 </p>
              </div>
              <button className="ios-button-gray w-full text-[15px]">View Monetization Plan</button>
           </div>
        </section>
      </div>

      <section className="pt-4">
        <button className="ios-button-gray w-full text-[17px]">
          <Download size={18} strokeWidth={1.5} />
          Export Intelligence PDF
        </button>
      </section>
    </div>
  );
}
