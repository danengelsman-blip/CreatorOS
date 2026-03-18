import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  Zap,
  ArrowUpRight,
  Target,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { motion } from 'motion/react';
import AppleCard from './ui/AppleCard';
import { cn } from '../lib/utils';

const MOCK_DATA = [
  { name: 'Mon', followers: 120, impressions: 450, engagement: 24 },
  { name: 'Tue', followers: 135, impressions: 520, engagement: 31 },
  { name: 'Wed', followers: 150, impressions: 480, engagement: 28 },
  { name: 'Thu', followers: 180, impressions: 610, engagement: 42 },
  { name: 'Fri', followers: 210, impressions: 750, engagement: 55 },
  { name: 'Sat', followers: 250, impressions: 920, engagement: 68 },
  { name: 'Sun', followers: 310, impressions: 1100, engagement: 82 },
];

const SPARKLINE_DATA = [
  { value: 40 }, { value: 35 }, { value: 55 }, { value: 45 }, { value: 60 }, { value: 50 }, { value: 75 }
];

export default function Dashboard({ brand, setActiveTab, user }: { brand: any, setActiveTab: (tab: string) => void, user: any }) {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 premium-card p-6 lg:p-10 bg-gradient-to-br from-white via-white to-accent-violet/5 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 lg:mb-8">
              <div className="px-3 py-1 bg-accent-violet/10 text-accent-violet rounded-full text-[11px] font-bold uppercase tracking-wider">
                Momentum
              </div>
              <span className="text-[11px] text-premium-muted font-medium">Welcome back, {user?.displayName?.split(' ')[0] || 'Creator'}</span>
            </div>
            
            <div className="mb-8 lg:mb-10">
              <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-4 text-balance leading-[1.1]">
                Your audience is growing <span className="text-accent-violet italic font-serif font-normal">24% faster</span> than last week.
              </h2>
              <p className="text-premium-muted max-w-md text-sm lg:text-base text-balance leading-relaxed">
                You're on track to hit your 5,000 follower milestone by the end of the month. Keep up the consistency.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 pt-8 border-t border-premium-border">
              <div>
                <p className="text-[10px] lg:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Weekly Growth</p>
                <p className="text-xl lg:text-2xl font-bold">+1,240</p>
              </div>
              <div>
                <p className="text-[10px] lg:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Engagement Rate</p>
                <p className="text-xl lg:text-2xl font-bold">4.82%</p>
              </div>
              <div>
                <p className="text-[10px] lg:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Top Platform</p>
                <p className="text-xl lg:text-2xl font-bold">TikTok</p>
              </div>
            </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
            <TrendingUp className="w-64 h-64 -rotate-12" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="premium-card p-6 lg:p-8 bg-premium-ink text-white relative overflow-hidden h-full flex flex-col">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent-emerald" />
                </div>
                <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Goal Status</div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">First Dollar Goal</h3>
              <p className="text-white/50 text-sm mb-8">You're 65% of the way to your first monetization milestone.</p>
              
              <div className="space-y-6">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="h-full bg-accent-emerald shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  />
                </div>
                
                <div className="space-y-3">
                  <MilestoneItem label="Brand Kit Complete" completed={true} />
                  <MilestoneItem label="5 Posts Published" completed={true} />
                  <MilestoneItem label="100 Followers Reached" completed={false} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('roadmap')}
              className="mt-auto w-full py-4 bg-white text-premium-ink rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all group"
            >
              View Roadmap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold tracking-tight">Key Performance Indicators</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-premium-border rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors">7 Days</button>
            <button className="px-4 py-2 text-premium-muted text-xs font-bold hover:text-premium-ink transition-colors">30 Days</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnalyticsCard 
            title="Total Audience" 
            value="12,842" 
            change="+12.4%" 
            trend="up"
            data={SPARKLINE_DATA}
            color="violet"
            details="Your audience grew by 1,240 new followers this week, primarily from TikTok and LinkedIn cross-promotion."
          />
          <AnalyticsCard 
            title="Impressions" 
            value="842.5K" 
            change="+8.2%" 
            trend="up"
            data={SPARKLINE_DATA.map(d => ({ value: d.value * 0.8 }))}
            color="cobalt"
            details="Total reach increased across all platforms. Video content is driving 70% of your current impressions."
          />
          <AnalyticsCard 
            title="Engagement" 
            value="4.82%" 
            change="-1.2%" 
            trend="down"
            data={SPARKLINE_DATA.map(d => ({ value: d.value * 1.2 }))}
            color="gold"
            details="Engagement dipped slightly. Try responding to more comments in the first hour of posting to boost this."
          />
          <AnalyticsCard 
            title="Revenue Est." 
            value="$1,240.00" 
            change="+24.5%" 
            trend="up"
            data={SPARKLINE_DATA.map(d => ({ value: d.value * 1.5 }))}
            color="emerald"
            details="Revenue is up thanks to the new affiliate partnership. You're on track for a record month."
          />
        </div>
      </section>

      {/* Intelligence & Details */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Growth Velocity</h3>
              <p className="text-xs text-premium-muted">Audience acquisition rate over time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-violet" />
                <span className="text-[11px] font-bold text-premium-muted uppercase tracking-wider">Followers</span>
              </div>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-premium-ink text-white px-3 py-2 rounded-lg shadow-xl text-[11px] font-bold">
                          {payload[0].value} Followers
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="premium-card p-8 bg-white border-accent-violet/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent-violet/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-violet" />
              </div>
              <h3 className="font-bold">AI Growth Insights</h3>
            </div>
            
            <div className="space-y-4">
              <InsightItem 
                title="Optimize Posting Time"
                description="Your audience is most active at 7:00 PM EST. Schedule your next post then."
                icon={Clock}
              />
              <InsightItem 
                title="Trending Topic Alert"
                description="The 'Creator Economy' topic is surging in your niche. Consider a post about it."
                icon={TrendingUp}
              />
              <InsightItem 
                title="High Engagement Hook"
                description="Your last post with a question hook performed 40% better than average."
                icon={MessageSquare}
              />
            </div>
            
            <button 
              onClick={() => setActiveTab('reports')}
              className="w-full mt-6 py-3 text-accent-violet text-xs font-bold flex items-center justify-center gap-2 hover:bg-accent-violet/5 rounded-xl transition-colors"
            >
              View All Insights
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="premium-card p-8 bg-gradient-to-br from-accent-emerald/5 to-transparent border-accent-emerald/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Next Best Action</h3>
              <div className="w-2 h-2 rounded-full bg-accent-emerald" />
            </div>
            <p className="text-sm text-premium-muted mb-6 leading-relaxed">
              Complete your <span className="text-premium-ink font-bold">Media Kit</span> to start attracting high-ticket brand sponsorships.
            </p>
            <button 
              onClick={() => setActiveTab('brand')}
              className="w-full py-3 bg-premium-ink text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
            >
              Build Media Kit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({ title, value, change, trend, data, color, details }: any) {
  const accentColors: any = {
    violet: "text-accent-violet",
    cobalt: "text-accent-cobalt",
    emerald: "text-accent-emerald",
    gold: "text-accent-gold",
  };

  return (
    <AppleCard 
      isFlippable 
      className="h-[180px]"
      backContent={
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-2 h-2 rounded-full bg-current", accentColors[color])} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{title} Analysis</span>
          </div>
          <p className="text-[13px] leading-relaxed text-white/80 font-medium">
            {details}
          </p>
          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tap to flip</span>
            <ArrowUpRight className="w-3 h-3 text-white/30" />
          </div>
        </div>
      }
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-premium-muted uppercase tracking-widest">{title}</span>
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
            trend === 'up' ? "bg-accent-emerald/10 text-accent-emerald" : "bg-red-50 text-red-500"
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data}>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="currentColor" 
                  strokeWidth={2}
                  fill="currentColor"
                  fillOpacity={0.05}
                  className={accentColors[color]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppleCard>
  );
}

function MilestoneItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center border transition-colors",
        completed ? "bg-accent-emerald border-accent-emerald" : "border-white/20"
      )}>
        {completed && <Award className="w-2.5 h-2.5 text-premium-ink" />}
      </div>
      <span className={cn("text-xs font-medium", completed ? "text-white" : "text-white/30")}>
        {label}
      </span>
    </div>
  );
}

function InsightItem({ title, description, icon: Icon }: any) {
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-violet/5 transition-colors">
        <Icon className="w-4 h-4 text-premium-muted group-hover:text-accent-violet transition-colors" />
      </div>
      <div>
        <h4 className="text-[13px] font-bold mb-0.5 group-hover:text-accent-violet transition-colors">{title}</h4>
        <p className="text-[12px] text-premium-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
