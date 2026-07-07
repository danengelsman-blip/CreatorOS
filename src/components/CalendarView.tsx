import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { format, startOfWeek, addDays, getWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { CaretLeft, CaretRight, Plus, CalendarBlank, VideoCamera, Image as ImageIcon, TextT as Type, Trash } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function CalendarView({ user, setActiveTab }: { user: any, setActiveTab: (tab: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventPlatform, setNewEventPlatform] = useState('tiktok');
  const [newEventStatus, setNewEventStatus] = useState('Draft');

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedEvents = snapshot.docs
          .filter(doc => doc.data().type === 'content')
          .map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                scheduledDate: data.scheduledDate ? data.scheduledDate.toDate() : null
            };
        }).filter(e => e.scheduledDate);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: addDays(endDate, 6) }); // 7 rows max

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate || !user) return;
    
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        name: newEventTitle,
        type: 'content',
        scheduledDate: selectedDate,
        status: newEventStatus,
        data: {
          title: newEventTitle,
          platform: newEventPlatform,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setEvents([...events, {
        id: docRef.id,
        name: newEventTitle,
        platform: newEventPlatform,
        scheduledDate: selectedDate,
        status: newEventStatus,
        data: { platform: newEventPlatform, title: newEventTitle }
      }]);
      
      setNewEventTitle('');
      setShowEventModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'projects', id));
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="ios-card bg-[var(--bg-tertiary)] overflow-hidden flex flex-col min-h-[600px]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--separator)]">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">{format(currentDate, dateFormat)}</h2>
          <p className="text-[13px] text-[var(--label-secondary)] font-medium mt-1">Visualize your content pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] transition-colors">
            <CaretLeft size={16} weight="bold" />
          </button>
          <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] transition-colors">
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 border-b border-[var(--separator)] bg-[var(--bg-secondary)]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-3 text-center text-[12px] font-bold tracking-wider uppercase text-[var(--label-secondary)]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-[var(--separator)] gap-[1px]">
        {days.slice(0, 35).map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(e.scheduledDate, day));
          return (
            <div 
              key={day.toString()}
              onClick={() => {
                setSelectedDate(day);
                setShowEventModal(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-[var(--bg-secondary)]');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-[var(--bg-secondary)]');
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('bg-[var(--bg-secondary)]');
                const eventId = e.dataTransfer.getData('eventId');
                if (!eventId) return;

                // Optimistic update
                const updatedEvents = events.map(evt => {
                  if (evt.id === eventId) {
                    return { ...evt, scheduledDate: day };
                  }
                  return evt;
                });
                setEvents(updatedEvents);

                try {
                  await updateDoc(doc(db, 'projects', eventId), {
                    scheduledDate: day,
                    updatedAt: serverTimestamp()
                  });
                } catch (error) {
                  console.error('Error updating event date:', error);
                }
              }}
              className={cn(
                "bg-[var(--bg-tertiary)] min-h-[100px] p-2 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group flex flex-col gap-1",
                !isSameMonth(day, monthStart) && "opacity-40"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-medium flex-shrink-0",
                    isToday(day) ? "bg-[var(--accent)] text-white" : ""
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.some(e => e.status !== 'Published') && (isToday(day) || isSameDay(day, addDays(new Date(), 1))) && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Due
                    </span>
                  )}
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1 text-[var(--label-tertiary)] hover:text-[var(--accent)] transition-all">
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 no-scrollbar">
                {dayEvents.map(event => {
                  const statusColor = event.status === 'Published' 
                      ? 'bg-green-500' 
                      : event.status === 'Draft' 
                          ? 'bg-gray-400' 
                          : 'bg-[var(--accent)]'; // Scheduled
                  return (
                    <div 
                      key={event.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation(); // prevent opening modal
                        e.dataTransfer.setData('eventId', event.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className="group/event bg-[var(--bg-secondary)] ios-elevated px-2 py-1.5 rounded-md text-[11px] font-medium border border-[var(--separator)] flex items-center justify-between cursor-move"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColor)} />
                        <span className="truncate pr-2">{event.name || 'Draft'}</span>
                      </div>
                      <button onClick={(e) => handleDeleteEvent(event.id, e)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:text-red-600 transition-opacity">
                        <Trash size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-tertiary)] w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-[var(--separator)]"
            >
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-[20px] font-semibold tracking-tight">Schedule Content</h3>
                  <p className="text-[14px] text-[var(--label-secondary)] mt-1">For {selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold tracking-wider text-[var(--label-secondary)] uppercase pl-1">Idea / Title</label>
                    <input 
                      type="text" 
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="e.g. My Next Big Hit"
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--separator)] rounded-xl px-4 py-3 text-[15px] outline-none focus:border-[var(--accent)] transition-colors"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold tracking-wider text-[var(--label-secondary)] uppercase pl-1">Target Platform</label>
                      <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl">
                        {['tiktok', 'instagram', 'youtube'].map((p) => (
                          <div
                            key={p}
                            onClick={() => setNewEventPlatform(p)}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[13px] font-semibold text-center transition-all cursor-pointer capitalize",
                              newEventPlatform === p 
                                ? "bg-[var(--bg-tertiary)] ios-elevated text-[var(--accent)]" 
                                : "text-[var(--label-secondary)]"
                            )}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold tracking-wider text-[var(--label-secondary)] uppercase pl-1">Status</label>
                      <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl">
                        {['Draft', 'Scheduled', 'Published'].map((s) => (
                          <div
                            key={s}
                            onClick={() => setNewEventStatus(s)}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[13px] font-semibold text-center transition-all cursor-pointer",
                              newEventStatus === s 
                                ? "bg-[var(--bg-tertiary)] ios-elevated text-[var(--accent)]" 
                                : "text-[var(--label-secondary)]"
                            )}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-[15px] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddEvent}
                    disabled={!newEventTitle}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-[15px] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
