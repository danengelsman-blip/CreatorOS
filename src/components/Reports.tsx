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
      <h1 className="px-1 pt-4">Intelligence</h1>

      {/* Overview Analytics Card */}
      <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
        <div className="p-6">
          <span className="ios-label px-0 mb-4">Performance Overview</span>
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[34px] font-bold tracking-tight">$1.24K</span>
            <div className="flex items-center gap-2">
               <TrendingUp size={16} className="text-[var(--system-green)]" />
               <span className="text-[var(--system-green)] font-bold text-[15px]">+14.2%</span>
               <span className="text-[var(--label-secondary)] text-[15px]">from last month</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', value: 400 },
                    { name: 'Tue', value: 300 },
                    { name: 'Wed', value: 500 },
                    { name: 'Thu', value: 450 },
                    { name: 'Fri', value: 700 },
                    { name: 'Sat', value: 600 },
                    { name: 'Sun', value: 900 },
                  ]}>
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="border-t border-[var(--separator)] grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--separator)]">
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">YT Views</span>
              <span className="text-[20px] font-bold">{youtubeStats?.views?.toLocaleString() || '12.4K'}</span>
           </div>
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">YT Audience</span>
              <span className="text-[20px] font-bold">{youtubeStats?.subscribers?.toLocaleString() || '8.2K'}</span>
           </div>
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">TT Views</span>
              <span className="text-[20px] font-bold">{tiktokStats?.views?.toLocaleString() || '45K'}</span>
           </div>
           <div className="p-4 flex flex-col gap-1 items-center justify-center">
              <span className="ios-label px-0">TT Followers</span>
              <span className="text-[20px] font-bold">{tiktokStats?.followers?.toLocaleString() || '1.2K'}</span>
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
                   <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                      <Brain size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-[17px]">Engagement Drop</span>
                      <span className="text-[13px] text-[var(--label-secondary)]">Cliff detected at 0:15 in short-form.</span>
                   </div>
                </div>
                <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
             </div>
             
             <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-[var(--system-green)]/10 text-[var(--system-green)] flex items-center justify-center">
                      <Activity size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-[17px]">Optimal Timing</span>
                      <span className="text-[13px] text-[var(--label-secondary)]">Your audience peaks at 7PM EST.</span>
                   </div>
                </div>
                <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
             </div>
          </div>
        </section>

        <section>
           <span className="ios-label">Strategic Forecast</span>
           <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)] p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                 <TrendingUp size={24} className="text-[var(--accent)]" />
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
          <Download size={18} />
          Export Intelligence PDF
        </button>
      </section>
    </div>
  );
}
