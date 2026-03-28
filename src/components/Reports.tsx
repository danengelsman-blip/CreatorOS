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
  Sparkles
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

const REVENUE_DATA = [
  { name: 'Ads', value: 0, color: '#10B981' },
  { name: 'Affiliate', value: 0, color: '#3B82F6' },
  { name: 'Sponsorships', value: 0, color: '#8B5CF6' },
  { name: 'Products', value: 0, color: '#F59E0B' },
];

const DATE_OPTIONS = [
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
];

export default function Reports({ user }: { user: any }) {
  const [selectedDate, setSelectedDate] = useState("March 2026");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [youtubeStats, setYoutubeStats] = useState<any>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics/youtube');
        const data = await res.json();
        if (data.views > 0 || data.subscribers > 0) {
          setYoutubeStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    fetchStats();

    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Income Intelligence</h2>
          <p className="text-premium-muted font-medium">A deep dive into your creator monetization performance.</p>
        </div>
        <button className="flex items-center justify-center gap-2.5 px-6 py-3 bg-premium-surface border border-premium-border rounded-2xl text-[13px] font-bold hover:bg-white/5 transition-all shadow-sm w-full sm:w-auto">
          <Download className="w-4 h-4 text-accent-violet" />
          Export Financial PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Revenue Breakdown */}
        <div className="md:col-span-8 premium-card p-6 md:p-10 bg-premium-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-emerald" />
              </div>
              Revenue Streams
            </h3>
            
            <div className="relative" ref={datePickerRef}>
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-premium-bg hover:bg-white/10 rounded-full text-[10px] font-bold text-premium-muted uppercase tracking-widest border border-premium-border transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4 text-accent-violet" />
                {selectedDate}
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isDatePickerOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isDatePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-premium-surface rounded-2xl shadow-2xl border border-premium-border p-2 z-50"
                  >
                    <div className="space-y-1">
                      {DATE_OPTIONS.map((date) => (
                        <button
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setIsDatePickerOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                            selectedDate === date 
                              ? "bg-accent-violet/5 text-accent-violet" 
                              : "text-premium-muted hover:bg-white/5 hover:text-premium-ink"
                          )}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-[280px] md:h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {REVENUE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10 md:mt-12">
            {youtubeStats ? (
              <>
                <div className="p-4 md:p-6 bg-red-500/5 rounded-[20px] md:rounded-[24px] border border-red-500/10 group hover:bg-white/5 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                  <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 md:mb-2">YouTube Views</p>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight text-red-600">{youtubeStats.views.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-6 bg-red-500/5 rounded-[20px] md:rounded-[24px] border border-red-500/10 group hover:bg-white/5 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                  <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 md:mb-2">Subscribers</p>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight text-red-600">{youtubeStats.subscribers.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-6 bg-red-500/5 rounded-[20px] md:rounded-[24px] border border-red-500/10 group hover:bg-white/5 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                  <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 md:mb-2">Total Videos</p>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight text-red-600">{youtubeStats.videos.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-6 bg-white/5 rounded-[20px] md:rounded-[24px] border border-white/10 group hover:bg-white/10 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                  <p className="text-[9px] md:text-[10px] font-bold text-premium-muted uppercase tracking-widest mb-1 md:mb-2">Revenue Est.</p>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight text-accent-emerald">$0.00</p>
                </div>
              </>
            ) : (
              REVENUE_DATA.map((item) => (
                <div key={item.name} className="p-4 md:p-6 bg-white/5 rounded-[20px] md:rounded-[24px] border border-white/10 group hover:bg-white/10 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                  <p className="text-[9px] md:text-[10px] font-bold text-premium-muted uppercase tracking-widest mb-1 md:mb-2">{item.name}</p>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ color: item.color }}>$0.00</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projections */}
        <div className="md:col-span-4 bg-premium-ink text-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-black/20 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <LineChart className="w-5 h-5 text-accent-emerald" />
              </div>
              Projections
            </h3>
            
            <div className="space-y-6 md:space-y-8">
              <div className="p-6 md:p-8 bg-white/5 rounded-[24px] md:rounded-[32px] border border-white/10 backdrop-blur-md">
                <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Estimated Next 30 Days</p>
                <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-accent-emerald">$1.24</p>
                <p className="text-[11px] md:text-xs text-white/30 mt-4 leading-relaxed">Based on your current growth velocity and engagement metrics.</p>
              </div>

              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Strategic Insights</h4>
                <div className="space-y-4">
                  <InsightItem 
                    text="Your engagement rate is up 12%. Pitch a sponsorship to brands in your niche." 
                    icon={Sparkles} 
                  />
                  <InsightItem 
                    text="Affiliate links drove 30% of revenue. Add them to your top performing videos." 
                    icon={Sparkles} 
                  />
                  <InsightItem 
                    text="Audience retention drops at 0:15. Hook viewers faster in your next video." 
                    icon={Sparkles} 
                  />
                </div>
              </div>

              <button className="w-full mt-4 py-5 bg-accent-emerald text-premium-ink rounded-[24px] font-bold text-[14px] hover:bg-accent-emerald/90 transition-all shadow-xl shadow-accent-emerald/20 active:scale-[0.98]">
                Unlock Full Monetization Plan
              </button>
            </div>
          </div>
          
          {/* Abstract glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-emerald/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        </div>
      </div>
    </div>
  );
}

function InsightItem({ text, icon: Icon }: any) {
  return (
    <div className="group cursor-pointer perspective-1000 h-20">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex gap-3 text-sm bg-white/5 p-4 rounded-[16px] border border-white/10 items-center">
          <div className="p-2 bg-white/10 rounded-lg h-fit flex-shrink-0">
            <Icon className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-premium-muted text-xs leading-relaxed line-clamp-2">{text}</span>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center bg-accent-emerald text-premium-ink p-4 rounded-[16px] shadow-xl shadow-accent-emerald/20 translate-z-[1px]">
          <div className="text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-1 opacity-80" />
            <span className="text-[12px] font-bold tracking-wide">Take Action</span>
          </div>
        </div>
      </div>
    </div>
  );
}
