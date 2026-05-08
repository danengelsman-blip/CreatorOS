import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  Brain, 
  Send,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

export default function SupportHub({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [suggestion, setSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const DEVELOPER_EMAILS = ['danengelsman@gmail.com'];
    const isDeveloper = DEVELOPER_EMAILS.includes(user.email);
    
    const ticketsRef = collection(db, 'support_tickets');
    let q;
    
    if (isDeveloper) {
      // Admins see all tickets
      q = query(ticketsRef, orderBy('createdAt', 'desc'));
    } else {
      // Regular users only see their own (though SupportHub is technically dev only)
      q = query(ticketsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'support_tickets'));
    return () => unsubscribe();
  }, [user]);

  const getAiSuggestion = async (ticket: any) => {
    if (!ticket) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        You are a highly professional customer support agent for "CreatorOS", a premium AI platform for content creators.
        A user has submitted the following support ticket:
        
        User Context: ${ticket.userData?.displayName || 'Anonymous'} (${ticket.userData?.subscriptionTier || 'Free'} plan)
        Subject: ${ticket.subject}
        Message: ${ticket.message}
        
        Provide a high-assurance, empathetic, and professional response that aligns with the premium brand "CreatorOS".
        The response should be helpful, concise, and technical where necessary.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setSuggestion(result.text || '');
    } catch (error) {
      console.error("AI Suggestion failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: user.uid
      });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: 'resolved' });
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `support_tickets/${ticketId}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-14rem)]">
      {/* Sidebar - Tickets List */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-gold" />
            Support Inbox
          </h2>
          <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold rounded text-[10px] font-black uppercase tracking-widest">
            Dev Only
          </span>
        </div>

        <div className="premium-card p-4 flex items-center gap-3 bg-premium-surface">
          <Search className="w-4 h-4 text-premium-muted" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="bg-transparent border-none outline-none text-[13px] w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {tickets.length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <MessageSquare className="w-8 h-8 mx-auto mb-3" />
              <p className="text-[13px]">No active tickets</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setSuggestion('');
                }}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border transition-all group",
                  selectedTicket?.id === ticket.id 
                    ? "bg-premium-ink text-premium-bg border-premium-ink shadow-lg shadow-black/10" 
                    : "bg-premium-surface border-premium-border hover:border-accent-gold/30"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-gold" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold line-clamp-1">{ticket.subject}</h4>
                      <p className="text-[10px] opacity-60 uppercase tracking-widest leading-none mt-1">
                        {ticket.userData?.displayName || 'User'}
                      </p>
                    </div>
                  </div>
                  {ticket.status === 'resolved' ? (
                    <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                  )}
                </div>
                <p className="text-[12px] opacity-70 line-clamp-2 leading-relaxed mb-3">
                  {ticket.message}
                </p>
                <div className="flex items-center gap-3 text-[10px] opacity-40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ticket.createdAt?.toDate().toLocaleDateString()}
                  </span>
                  <span className="uppercase font-bold tracking-widest">{ticket.userData?.subscriptionTier || 'Free'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main View - Ticket Details & AI Assistant */}
      <div className="flex-1 flex flex-col gap-6">
        {selectedTicket ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col gap-6"
          >
            <div className="premium-card p-8 bg-premium-surface">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                      selectedTicket.status === 'resolved' ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-gold/10 text-accent-gold"
                    )}>
                      {selectedTicket.status || 'open'}
                    </span>
                    <span className="text-premium-muted text-[13px]">Ticket ID: {selectedTicket.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{selectedTicket.subject}</h3>
                </div>
                <div className="flex gap-3">
                  {selectedTicket.status !== 'resolved' && (
                    <button 
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="px-6 py-2.5 bg-accent-emerald text-white rounded-xl text-[13px] font-bold shadow-lg shadow-accent-emerald/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 bg-premium-bg rounded-2xl border border-premium-border space-y-4">
                <div className="flex items-center justify-between border-b border-premium-border/5 pb-4">
                   <div className="flex items-center gap-3">
                      <img src={selectedTicket.userData?.photoURL} alt="" className="w-10 h-10 rounded-full grayscale opacity-50" />
                      <div>
                        <p className="text-[13px] font-bold">{selectedTicket.userData?.displayName}</p>
                        <p className="text-[11px] text-premium-muted">{selectedTicket.userData?.email}</p>
                      </div>
                   </div>
                </div>
                <p className="text-[15px] leading-relaxed text-premium-ink/80 pt-2 whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>
            </div>

            {/* AI Assistance Layer */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
               {/* AI Suggestion */}
               <div className="premium-card p-6 border-accent-gold/20 flex flex-col bg-premium-surface/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-accent-gold">
                      <Brain className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Assurance Suggestion</span>
                    </div>
                    {!suggestion && (
                      <button 
                        onClick={() => getAiSuggestion(selectedTicket)}
                        disabled={isGenerating}
                        className="text-[11px] font-bold hover:underline disabled:opacity-50"
                      >
                        {isGenerating ? 'Analyzing...' : 'Generate Helper'}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 relative overflow-hidden">
                    {suggestion ? (
                      <div className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-[13px] leading-relaxed text-premium-ink/70 italic p-4 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
                          {suggestion}
                        </p>
                        <button 
                          onClick={() => setReplyText(suggestion)}
                          className="mt-3 text-[11px] font-bold text-accent-gold flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          Use this response <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                        <Brain className="w-12 h-12 mb-4" />
                        <p className="text-[12px] max-w-[140px]">AI can analyze the ticket and suggest a response</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Reply Box */}
               <div className="premium-card p-6 flex flex-col bg-premium-surface">
                  <div className="flex items-center gap-2 mb-4 text-premium-muted">
                    <Send className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Draft Reply</span>
                  </div>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response or select an AI suggestion..."
                    className="flex-1 bg-premium-bg rounded-xl border border-premium-border p-4 text-[13px] resize-none outline-none focus:ring-2 focus:ring-accent-gold/10 transition-all"
                  />
                  <div className="mt-4 flex justify-end">
                    <button className="px-8 py-3 bg-premium-ink text-premium-bg rounded-xl text-[13px] font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Send className="w-4 h-4" />
                      Send Response
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none">
            <div className="w-24 h-24 rounded-[40px] bg-premium-surface border border-premium-border flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Select a ticket to review</h3>
            <p className="text-[13px] max-w-[240px]">High-assurance AI analysis will be available for all selected tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
