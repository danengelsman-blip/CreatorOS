import React, { useState } from 'react';
import { 
  Zap, 
  Palette, 
  PenTool, 
  Compass, 
  MessageSquare, 
  ChevronRight,
  Search,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Layout,
  Send,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const HELP_SECTIONS = [
  { id: 'getting-started', title: 'Getting Started', icon: Zap, description: 'Learn the fundamentals.' },
  { id: 'branding', title: 'Identity Architect', icon: Palette, description: 'Define your digital DNA.' },
  { id: 'content', title: 'Studio Workflow', icon: PenTool, description: 'AI-assisted creation.' },
  { id: 'roadmap', title: 'Creator Roadmap', icon: Compass, description: 'Your path to growth.' },
  { id: 'hub', title: 'Social Hub', icon: Layout, description: 'Managing distribution.' }
];

export default function Support({ user }: { user: any }) {
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user.uid,
        subject,
        message,
        status: 'open',
        userData: {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        },
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowSupportForm(false);
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'support_tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1 pt-4">Support</h1>

      {/* Search Bar */}
      <section className="bg-[var(--bg-tertiary)] ios-card p-3 flex items-center gap-3">
        <Search size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)] ml-1" />
        <input 
          type="text" 
          placeholder="Search documentation"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[17px] placeholder:text-[var(--label-tertiary)]"
        />
      </section>

      {/* Help Sections Inset Grouped List */}
      <section>
        <span className="ios-label">Documentation</span>
        <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
           {HELP_SECTIONS.map((section) => (
             <div 
               key={section.id} 
               onClick={() => setActiveSection(section.id)}
               className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)'}}>
                      <section.icon size={22} strokeWidth={1.5} />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-[17px]">{section.title}</span>
                      <span className="text-[13px] text-[var(--label-secondary)]">{section.description}</span>
                   </div>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
             </div>
           ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-4">
         <span className="ios-label">Account Support</span>
         <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
            <div 
              onClick={() => setShowSupportForm(true)}
              className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'color-mix(in srgb, var(--system-orange) 12%, transparent)', color: 'var(--system-orange)'}}>
                     <MessageSquare size={22} strokeWidth={1.5} />
                  </div>
                  <span className="font-semibold text-[17px]">Contact Architect Support</span>
               </div>
               <Plus size={18} strokeWidth={1.5} className="text-[var(--accent)]" />
            </div>
         </div>
      </section>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-t-[32px] overflow-hidden"
            >
               <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--separator)]">
                 <button onClick={() => setShowSupportForm(false)} className="text-[17px] text-[var(--accent)]">Cancel</button>
                 <span className="text-[17px] font-bold">New Ticket</span>
                 <button 
                   onClick={handleSubmitTicket}
                   disabled={!subject || !message || isSubmitting}
                   className="text-[17px] font-bold text-[var(--accent)] disabled:opacity-30"
                 >
                   Send
                 </button>
               </div>
               
               <div className="p-4 space-y-4 pb-12">
                  <input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="ios-input"
                  />
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    className="ios-input h-48 py-4 resize-none"
                  />
                  
                  {isSuccess && (
                    <div className="text-center py-4 text-[var(--system-green)] font-bold animate-fade-up">
                      Ticket Submitted Successfully
                    </div>
                  )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
