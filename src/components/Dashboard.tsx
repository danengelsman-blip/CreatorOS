import React, { useState } from 'react';
import { 
  LineChart, 
  Users2, 
  ScanEye, 
  MessageCircleMore, 
  Zap,
  ArrowUpRight,
  Target,
  Award,
  ArrowRight,
  ChevronRight,
  Clock,
  ArrowDownRight,
  PenTool,
  Sparkles
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
import BrandIcon from './BrandIcon';
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

export default function Dashboard({ brand, setActiveTab, user, projects = [] }: { brand: any, setActiveTab: (tab: string) => void, user: any, projects?: any[] }) {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 premium-card p-6 md:p-10 bg-gradient-to-br from-premium-surface via-premium-surface to-accent-violet/10 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              <div className="px-3 py-1 bg-accent-violet/10 text-accent-violet rounded-full text-[11px] font-bold uppercase tracking-wider">
                Momentum
              </div>
              <span className="text-[11px] text-premium-muted font-medium">Welcome back, {user?.displayName?.split(' ')[0] || 'Creator'}</span>
            </div>
            
            <div className="mb-8 md:mb-10">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-balance leading-[1.1]">
                Your audience is growing <span className="text-accent-violet italic font-serif font-normal">24% faster</span> than last week.
              </h2>
              <p className="text-premium-muted max-w-md text-sm md:text-base text-balance leading-relaxed">
                You're on track to hit your 5,000 follower milestone by the end of the month. Keep up the consistency.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-premium-border">
              <div>
                <p className="text-[10px] md:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Weekly Growth</p>
                <p className="text-xl md:text-2xl font-bold">+1,240</p>
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Engagement Rate</p>
                <p className="text-xl md:text-2xl font-bold">4.82%</p>
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-1">Top Platform</p>
                <p className="text-xl md:text-2xl font-bold">TikTok</p>
              </div>
            </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
            <LineChart className="w-64 h-64 -rotate-12" />
          </div>
        </div>

        <div className="md:col-span-4 space-y-8">
          <div className="p-6 md:p-8 bg-premium-ink text-white rounded-[32px] relative overflow-hidden h-full flex flex-col">
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
                  <MilestoneItem label="Brand Kit Complete" completed={!!brand} />
                  <MilestoneItem label="5 Posts Published" completed={projects.length >= 5} />
                  <MilestoneItem label="100 Followers Reached" completed={false} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('roadmap')}
              className="mt-10 w-full py-4 bg-premium-surface text-premium-ink rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all group border border-premium-border"
            >
              View Roadmap
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Content Section */}
      {projects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold tracking-tight">Recent Content</h3>
            <button 
              onClick={() => setActiveTab('create')}
              className="text-accent-violet text-xs font-bold flex items-center gap-2 hover:underline"
            >
              Create New <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="premium-card p-6 bg-premium-surface hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-violet/5 text-accent-violet rounded-lg flex items-center justify-center">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-premium-muted uppercase tracking-widest">
                      {project.data?.platform || 'Content'}
                    </span>
                  </div>
                  {project.data?.score && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-emerald/5 text-accent-emerald rounded-lg border border-accent-emerald/10">
                      <BrandIcon size={12} />
                      <span className="text-[10px] font-bold">{project.data.score}</span>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-lg mb-2 truncate group-hover:text-accent-violet transition-colors">
                  {project.name}
                </h4>
                <p className="text-sm text-premium-muted line-clamp-2 mb-4 leading-relaxed">
                  {project.data?.body}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-premium-border">
                  <div className="flex items-center gap-2 text-[10px] text-premium-muted font-bold uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="text-accent-violet text-[11px] font-bold uppercase tracking-widest hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Analytics Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold tracking-tight">Key Performance Indicators</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-premium-surface border border-premium-border rounded-xl text-xs font-bold shadow-sm hover:bg-white/5 transition-colors">7 Days</button>
            <button className="px-4 py-2 text-premium-muted text-xs font-bold hover:text-premium-ink transition-colors">30 Days</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 premium-card p-8">
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

        <div className="md:col-span-5 space-y-8">
          <div className="premium-card p-8 bg-premium-surface border-accent-violet/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent-violet/10 rounded-lg flex items-center justify-center">
                <BrandIcon size={16} className="text-accent-violet" />
              </div>
              <h3 className="font-bold">AI Growth Insights</h3>
            </div>
            
            <div className="space-y-4">
              <InsightItem 
                title="Optimize Posting Time"
                description="Your audience is most active at 7:00 PM EST. Schedule your next post then to maximize reach."
                icon={Sparkles}
              />
              <InsightItem 
                title="Trending Topic Alert"
                description="The 'Creator Economy' topic is surging in your niche. Consider a post about it to capture trending traffic."
                icon={Sparkles}
              />
              <InsightItem 
                title="High Engagement Hook"
                description="Your last post with a question hook performed 40% better than average. Use a question hook in your next video."
                icon={Sparkles}
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
    <div className="group cursor-pointer perspective-1000 h-24">
      <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex gap-4 bg-premium-surface p-4 rounded-2xl border border-premium-border">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-premium-muted" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold mb-0.5">{title}</h4>
            <p className="text-[12px] text-premium-muted leading-relaxed line-clamp-2">{description}</p>
          </div>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center bg-accent-violet text-white p-4 rounded-2xl shadow-xl shadow-accent-violet/20 translate-z-[1px]">
          <div className="text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-80" />
            <span className="text-[12px] font-bold tracking-wide">Take Action</span>
          </div>
        </div>
      </div>
    </div>
  );
}
