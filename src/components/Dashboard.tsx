import React from 'react';
import { 
  Target,
  ChevronRight,
  PenTool,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Dashboard({ brand, setActiveTab, user, projects = [] }: { brand: any, setActiveTab: (tab: string) => void, user: any, projects?: any[] }) {
  const firstName = user?.displayName?.split(' ')?.[0] || 'Creator';

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <h1 className="px-1 pt-4">Hi, {firstName}</h1>

      {/* Primary Metric Card */}
      <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
        <div className="p-6">
          <span className="ios-label px-0 mb-4">Active Momentum</span>
          
          <div className="mb-6">
            <div className="text-[28px] font-bold tracking-tight leading-tight mb-2">
              Your audience is growing 24% faster.
            </div>
            <p className="text-[var(--label-secondary)] text-[17px] leading-snug">
              You're on track to hit your 5,000 follower milestone this month.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-t border-[var(--separator)]">
            <div className="flex flex-col">
              <span className="ios-label px-0">Weekly Growth</span>
              <span className="text-[22px] font-bold">+1,240</span>
            </div>
            <div className="flex flex-col">
              <span className="ios-label px-0">Engagement</span>
              <span className="text-[22px] font-bold">4.82%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Inset Grouped List */}
      <section>
        <span className="ios-label">Goals & Progress</span>
        <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
           <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--system-green)] flex items-center justify-center text-white">
                  <Target size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[17px]">First Dollar Goal</span>
                  <span className="text-[13px] text-[var(--label-secondary)]">65% Completed</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
           </div>
           
           <div className="p-5 flex flex-col gap-5">
              <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-[var(--system-green)]"
                />
              </div>
              <div className="space-y-4">
                <MilestoneItem label="Brand Kit Complete" completed={!!brand} />
                <MilestoneItem label="5 Posts Published" completed={projects.length >= 5} />
                <MilestoneItem label="100 Followers Reached" completed={false} />
              </div>
           </div>
        </div>
      </section>

      {/* Recent Projects Inset Grouped List */}
      <section>
        <div className="flex items-center justify-between pr-4">
          <span className="ios-label uppercase">Recent Projects</span>
          <button onClick={() => setActiveTab('create')} className="text-[var(--accent)] text-[15px] font-medium pb-1">See All</button>
        </div>
        <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
           {projects.length > 0 ? projects.slice(0, 3).map((project) => (
             <div 
               key={project.id} 
               onClick={() => setActiveTab('create')}
               className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer"
             >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                    <PenTool size={20} className="text-[var(--label-secondary)]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[17px] truncate">{project.name}</span>
                    <span className="text-[13px] text-[var(--label-secondary)] truncate">
                      {project.data?.platform || 'Project'} • {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {project.data?.score && (
                     <span className="text-[13px] font-bold text-[var(--system-green)]">{project.data.score}%</span>
                   )}
                   <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
                </div>
             </div>
           )) : (
             <div className="p-8 text-center text-[var(--label-secondary)] text-[15px]">No projects yet.</div>
           )}
        </div>
      </section>

      {/* Metrics Grid */}
      <section>
        <span className="ios-label">Key Performance</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnalyticsCard 
            title="Audience" 
            value="12.8K" 
            change="+12.4%" 
            trend="up"
          />
          <AnalyticsCard 
            title="Reach" 
            value="842K" 
            change="+8.2%" 
            trend="up"
          />
          <AnalyticsCard 
            title="Engagement" 
            value="4.8%" 
            change="-1.2%" 
            trend="down"
          />
          <AnalyticsCard 
            title="Revenue" 
            value="$1.2K" 
            change="+24%" 
            trend="up"
          />
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({ title, value, change, trend }: any) {
  return (
    <div className="bg-[var(--bg-tertiary)] p-4 rounded-[12px] ios-card flex flex-col gap-1">
      <span className="text-[13px] font-medium text-[var(--label-secondary)] truncate">{title}</span>
      <span className="text-[22px] font-bold tracking-tight">{value}</span>
      <span className={cn(
        "text-[12px] font-bold",
        trend === 'up' ? "text-[var(--system-green)]" : "text-[var(--system-red)]"
      )}>
        {change}
      </span>
    </div>
  );
}

function MilestoneItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm",
        completed ? "bg-[var(--system-green)]" : "bg-[var(--separator)]"
      )}>
        {completed && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className={cn("text-[15px] font-medium", completed ? "text-[var(--label-primary)]" : "text-[var(--label-secondary)]")}>
        {label}
      </span>
    </div>
  );
}
