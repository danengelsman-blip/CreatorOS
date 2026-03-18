import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowUpRight,
  Download,
  Calendar
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

const REVENUE_DATA = [
  { name: 'Ads', value: 0, color: '#10B981' },
  { name: 'Affiliate', value: 0, color: '#3B82F6' },
  { name: 'Sponsorships', value: 0, color: '#8B5CF6' },
  { name: 'Products', value: 0, color: '#F59E0B' },
];

export default function Reports({ user }: { user: any }) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Income Intelligence</h2>
          <p className="text-premium-muted font-medium">A deep dive into your creator monetization performance.</p>
        </div>
        <button className="flex items-center justify-center gap-2.5 px-6 py-3 bg-white border border-premium-border rounded-2xl text-[13px] font-bold hover:bg-gray-50 transition-all shadow-sm w-full sm:w-auto">
          <Download className="w-4 h-4 text-accent-violet" />
          Export Financial PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-8 premium-card p-6 lg:p-10 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-10 gap-4">
            <h3 className="text-lg lg:text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-emerald" />
              </div>
              Revenue Streams
            </h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold text-premium-muted uppercase tracking-widest border border-black/[0.03] w-fit">
              <Calendar className="w-4 h-4" />
              March 2026
            </div>
          </div>

          <div className="h-[280px] lg:h-[340px] w-full">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mt-10 lg:mt-12">
            {REVENUE_DATA.map((item) => (
              <div key={item.name} className="p-4 lg:p-6 bg-gray-50 rounded-[20px] lg:rounded-[24px] border border-black/[0.03] group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                <p className="text-[9px] lg:text-[10px] font-bold text-premium-muted uppercase tracking-widest mb-1 lg:mb-2">{item.name}</p>
                <p className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: item.color }}>$0.00</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projections */}
        <div className="lg:col-span-4 bg-premium-ink text-white p-8 lg:p-10 rounded-[32px] lg:rounded-[40px] shadow-2xl shadow-black/20 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg lg:text-xl font-bold mb-6 lg:mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
              </div>
              Projections
            </h3>
            
            <div className="space-y-6 lg:space-y-8">
              <div className="p-6 lg:p-8 bg-white/5 rounded-[24px] lg:rounded-[32px] border border-white/10 backdrop-blur-md">
                <p className="text-[9px] lg:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Estimated Next 30 Days</p>
                <p className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-accent-emerald">$1.24</p>
                <p className="text-[11px] lg:text-xs text-white/30 mt-4 leading-relaxed">Based on your current growth velocity and engagement metrics.</p>
              </div>

              <div className="space-y-6">
                <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Strategic Insights</h4>
                <div className="space-y-4">
                  <InsightItem 
                    text="Affiliate links could boost revenue by 15%." 
                    icon={ArrowUpRight} 
                  />
                  <InsightItem 
                    text="Your engagement rate is optimal for sponsorships." 
                    icon={ArrowUpRight} 
                  />
                  <InsightItem 
                    text="Consider launching a digital product soon." 
                    icon={ArrowUpRight} 
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
    <div className="flex gap-3 text-sm">
      <div className="p-1 bg-white/10 rounded-lg h-fit">
        <Icon className="w-3 h-3 text-emerald-400" />
      </div>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}
