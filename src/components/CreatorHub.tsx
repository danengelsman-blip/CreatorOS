import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Layers,
  Share2,
  MoreVertical,
  Filter
} from 'lucide-react';
import { HubIcon } from './IdentityIcons';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: 'bg-[#00f2ea] text-black',
  instagram: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
  youtube: 'bg-[#FF0000] text-white',
  linkedin: 'bg-[#0077b5] text-white',
  twitter: 'bg-[#1DA1F2] text-white',
  multi: 'bg-gradient-to-r from-accent-gold to-accent-emerald text-premium-bg',
};

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: Date;
  platforms?: string[];
}

export default function CreatorHub({ projects = [] }: { projects: any[] }) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format projects into our content structure
  const content: ContentItem[] = useMemo(() => {
    return projects.map(p => ({
      id: p.id,
      title: p.name || 'Untitled Content',
      platform: p.data?.platform || 'multi',
      status: p.data?.status || 'draft',
      scheduledDate: p.createdAt?.toDate ? p.createdAt.toDate() : new Date(),
      platforms: p.data?.platforms || [p.data?.platform].filter(Boolean)
    }));
  }, [projects]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Padding for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-accent-gold/10 text-accent-gold rounded-lg flex items-center justify-center">
              <HubIcon size={20} className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Creator Hub</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">Your Content Empire</h2>
          <p className="text-white/50 mt-2 max-w-xl">
            Manage, schedule, and architect your multi-platform presence from a single command center.
          </p>
        </div>

        <div className="flex items-center gap-3 p-1 bg-premium-surface border border-premium-border rounded-2xl">
          <button 
            onClick={() => setView('grid')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              view === 'grid' ? "bg-accent-gold text-premium-bg shadow-lg" : "text-premium-muted hover:text-white"
            )}
          >
            <Layers className="w-4 h-4" /> Grid
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              view === 'calendar' ? "bg-accent-gold text-premium-bg shadow-lg" : "text-premium-muted hover:text-white"
            )}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {content.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
            
            {/* Empty State / Add New */}
            <button className="premium-card p-10 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-accent-gold/30 hover:bg-white/[0.02] transition-all group">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors">
                <Plus className="w-6 h-6 text-white/20 group-hover:text-accent-gold" />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Architect New Content</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Expand your empire</div>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="premium-card p-8 md:p-12"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-serif font-bold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-4">
                <button onClick={prevMonth} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pb-6">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[140px] p-4 rounded-2xl border border-white/5 transition-all",
                    date ? "bg-white/[0.02] hover:bg-white/[0.04]" : "opacity-0"
                  )}
                >
                  {date && (
                    <>
                      <div className="text-xs font-bold text-white/40 mb-4">{date.getDate()}</div>
                      <div className="space-y-2">
                        {content
                          .filter(item => item.scheduledDate?.toDateString() === date.toDateString())
                          .map(item => (
                            <div 
                              key={item.id} 
                              className={cn(
                                "p-2 rounded-lg text-[10px] font-bold truncate",
                                PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.multi
                              )}
                            >
                              {item.title}
                            </div>
                          ))
                        }
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const isMulti = item.platform === 'multi' || (item.platforms && item.platforms.length > 1);
  const colorClass = isMulti ? PLATFORM_COLORS.multi : (PLATFORM_COLORS[item.platform] || PLATFORM_COLORS.multi);

  return (
    <div className="premium-card p-8 group hover:shadow-2xl hover:shadow-accent-gold/5 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
          colorClass
        )}>
          {isMulti ? <Share2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}
          {isMulti ? 'Multi-Platform' : item.platform}
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <h4 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-accent-gold transition-colors">
        {item.title}
      </h4>

      <div className="flex items-center gap-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <Clock className="w-3.5 h-3.5" />
          {item.scheduledDate?.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-accent-emerald uppercase tracking-widest">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {item.status}
        </div>
      </div>

      {isMulti && item.platforms && (
        <div className="mt-6 flex gap-2">
          {item.platforms.map(p => (
            <div key={p} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px]" title={p}>
              {p.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
