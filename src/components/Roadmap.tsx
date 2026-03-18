import React from 'react';
import { 
  Map, 
  Flag, 
  Zap, 
  Trophy, 
  Star, 
  Lock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const STAGES = [
  {
    id: 'idea_discovery',
    title: 'Idea Discovery',
    desc: 'Find your niche and define your brand identity.',
    days: [1, 2, 3, 4, 5, 6],
    icon: Star,
    color: 'bg-yellow-500'
  },
  {
    id: 'writing',
    title: 'Writing Habit',
    desc: 'Master the art of hooks and storytelling.',
    days: [7, 8, 9, 10, 11, 12],
    icon: Zap,
    color: 'bg-indigo-500'
  },
  {
    id: 'publishing',
    title: 'Consistent Publishing',
    desc: 'Build a system to post every single day.',
    days: [13, 14, 15, 16, 17, 18],
    icon: Flag,
    color: 'bg-emerald-500'
  },
  {
    id: 'growth',
    title: 'Audience Growth',
    desc: 'Optimize for reach and engagement.',
    days: [19, 20, 21, 22, 23, 24],
    icon: Trophy,
    color: 'bg-purple-500'
  },
  {
    id: 'monetization',
    title: 'First Dollar',
    desc: 'Set up your monetization engine.',
    days: [25, 26, 27, 28, 29, 30],
    icon: Star,
    color: 'bg-orange-500'
  }
];

export default function Roadmap({ brand, user }: { brand: any, user: any }) {
  const currentDay = 1;
  const completedDays = [1];

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="premium-card p-8 lg:p-12 bg-premium-ink text-white relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-full text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] border border-white/10 backdrop-blur-md">
              <Map className="w-4 h-4 text-accent-violet" />
              30-Day Creator Challenge
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">Your path to <span className="text-accent-emerald italic font-serif font-normal">monetization</span>.</h2>
            <p className="text-lg lg:text-xl text-white/50 leading-relaxed font-medium">
              A structured, high-performance roadmap designed to take you from zero to your first dollar in 30 days.
            </p>
          </div>
          <div className="lg:block">
            <div className="relative w-40 h-40 lg:w-56 lg:h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray="283%"
                  initial={{ strokeDashoffset: "283%" }}
                  animate={{ strokeDashoffset: `${283 - (283 * 1) / 30}%` }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl lg:text-5xl font-extrabold tracking-tighter">1/30</span>
                <span className="text-[9px] lg:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Days Active</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-emerald/10 rounded-full blur-[120px] -ml-40 -mb-40" />
      </div>

      <div className="space-y-10 relative">
        {/* Vertical line connector */}
        <div className="absolute left-12 top-10 bottom-10 w-0.5 bg-premium-border hidden lg:block" />

        {STAGES.map((stage, idx) => {
          const isUnlocked = idx === 0;
          const isCompleted = false;

          return (
            <div 
              key={stage.id}
              className={cn(
                "relative premium-card p-6 lg:p-10 bg-white transition-all duration-500 group",
                !isUnlocked && "opacity-50 grayscale pointer-events-none"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-10">
                <div className="flex flex-col sm:flex-row items-start gap-6 lg:gap-8">
                  <div className={cn(
                    "w-14 h-14 lg:w-16 lg:h-16 rounded-2xl text-white shadow-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", 
                    stage.color
                  )}>
                    <stage.icon className="w-7 h-7 lg:w-8 lg:h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight">{stage.title}</h3>
                      {!isUnlocked && <Lock className="w-4 h-4 text-premium-muted" />}
                    </div>
                    <p className="text-[14px] lg:text-base text-premium-muted font-medium leading-relaxed max-w-md">{stage.desc}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {stage.days.map(day => {
                    const isDayCompleted = completedDays.includes(day);
                    const isCurrentDay = day === currentDay;

                    return (
                      <div 
                        key={day}
                        className={cn(
                          "w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center font-bold text-[13px] lg:text-[15px] border transition-all duration-300",
                          isDayCompleted ? "bg-accent-emerald border-accent-emerald text-white shadow-lg shadow-accent-emerald/20" :
                          isCurrentDay ? "bg-premium-ink border-premium-ink text-white scale-110 shadow-2xl shadow-black/20" :
                          "bg-gray-50 border-black/[0.03] text-premium-muted hover:bg-gray-100"
                        )}
                      >
                        {isDayCompleted ? <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" /> : day}
                      </div>
                    );
                  })}
                </div>

                <button className={cn(
                  "w-full lg:w-auto px-6 lg:px-8 py-3 lg:py-4 rounded-[16px] lg:rounded-[20px] font-bold text-[13px] lg:text-[14px] flex items-center justify-center gap-2 transition-all shadow-xl",
                  isUnlocked ? "bg-premium-ink text-white hover:scale-[1.02] active:scale-[0.98] shadow-black/10" : "bg-gray-100 text-premium-muted cursor-not-allowed shadow-none"
                )}>
                  {isUnlocked ? 'Continue Journey' : 'Locked Stage'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
