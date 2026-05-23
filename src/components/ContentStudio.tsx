import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight as Send, CheckCircle as CheckCircle2, ArrowsClockwise as RefreshCw, TextT as Type, Hash, Image as ImageIcon, CaretRight as ChevronRight, DownloadSimple as Download, Microphone as Mic, SpeakerHigh as Volume2, VideoCamera as VideoIcon, Play, CircleNotch as Loader2, FloppyDisk as Save, Sparkle as Sparkles, MagnifyingGlass as Search, GearSix as Settings, DotsThree as MoreHorizontal } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { scoreContent, quickPolish, generateSpeech, transcribeAudio, generateVideo, getOperationStatus } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import BrandIcon from './BrandIcon';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', distributionLabel: 'Format for TikTok', icon: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ color: 'var(--label-secondary)' }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
    </svg>
  ) },
  { id: 'instagram', label: 'Instagram', distributionLabel: 'Format for Instagram', icon: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ color: 'var(--label-secondary)' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ) },
  { id: 'youtube', label: 'YouTube', distributionLabel: 'Format for YouTube', icon: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ color: 'var(--label-secondary)' }}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ) },
  { id: 'twitter', label: 'X', distributionLabel: 'Format for X (Twitter)', icon: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style={{ color: 'var(--label-secondary)' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ) },
];

export default function Create({ brand, setActiveTab, user }: { brand: any, setActiveTab: (tab: string) => void, user: any }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [isScoring, setIsScoring] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleScore = async () => {
    if (!body || !brand) return;
    setIsScoring(true);
    setScoreData(null); // Clear previous score while loading
    try {
      const result = await scoreContent(body, `${brand.personality} - ${brand.tagline}`);
      setScoreData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScoring(false);
    }
  };

  const handlePolish = async () => {
    if (!body || !brand) return;
    setIsPolishing(true);
    try {
      const polished = await quickPolish(body);
      setBody(polished);
    } catch (error) {
      console.error('Polish failed:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !body) return;
    setIsSaving(true);
    try {
      const projectRef = collection(db, 'projects');
      await addDoc(projectRef, {
        userId: user.uid,
        name: title || 'Untitled Content',
        type: 'content',
        data: {
          title,
          body,
          platform,
          score: scoreData?.score || 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'projects'));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 max-w-sm mx-auto">
        <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-[22px] flex items-center justify-center ios-elevated">
          <Sparkles className="w-10 h-10 text-[var(--label-tertiary)]" strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
          <h2 className="font-serif text-[28px] font-semibold tracking-[-0.015em]">Identity Required</h2>
          <p className="text-[var(--label-secondary)] text-[17px] font-medium leading-tight">
            Architect your brand identity before crafting world-class content with AI scoring.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('brand')}
          className="ios-button ios-button-filled w-full"
        >
          Build Brand Identity
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1 pt-4">Create</h1>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
            {/* Platform Segmented Control */}
            <div className="p-4 border-b border-[var(--separator)]">
              <div className="flex bg-[var(--bg-secondary)] p-1 rounded-[10px]">
                {PLATFORMS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    role="button"
                    className={cn(
                      "flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                      platform === p.id 
                        ? "bg-[var(--bg-tertiary)] ios-elevated text-[var(--accent)]" 
                        : "text-[var(--label-secondary)]"
                    )}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4 relative">
              {isPolishing && (
                <div className="absolute inset-0 z-10 bg-[var(--bg-tertiary)]/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 bg-[var(--bg-primary)] px-5 py-3 rounded-2xl shadow-xl border border-[var(--separator)]">
                    <Sparkles size={20} className="text-[var(--accent)] animate-pulse" strokeWidth={1.5} />
                    <span className="text-[15px] font-semibold">AI is polishing your narrative...</span>
                  </div>
                </div>
              )}
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or Hook"
                className="w-full font-serif text-[24px] font-semibold tracking-[-0.015em] outline-none placeholder:text-[var(--label-tertiary)] bg-transparent"
              />
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's the narrative? AI will score your brand voice..."
                className="w-full h-[400px] text-[17px] leading-relaxed outline-none resize-none placeholder:text-[var(--label-tertiary)] bg-transparent font-medium"
              />
            </div>

            <div className="px-6 py-4 border-t border-[var(--separator)] flex items-center justify-between">
              <div className="flex gap-5 text-[var(--accent)]">
                <button className="ios-button ios-button-gray px-3"><Type size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><ImageIcon size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><Hash size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><Mic size={17} strokeWidth={1.5} /></button>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePublish}
                  disabled={isSaving || !body}
                  className="ios-button ios-button-gray"
                >
                  {isSaving ? <Loader2 size={17} strokeWidth={1.5} className="mr-2 animate-spin" /> : <Save size={17} strokeWidth={1.5} className="mr-2" />}
                  Save
                </button>
                <button 
                  onClick={handlePolish}
                  disabled={isPolishing || !body}
                  className="ios-button ios-button-tinted"
                >
                  {isPolishing ? (
                    <RefreshCw size={17} strokeWidth={1.5} className="mr-2 animate-spin" />
                  ) : (
                    <Sparkles size={17} strokeWidth={1.5} className="mr-2" />
                  )}
                  Polish
                </button>
                <button 
                  onClick={handleScore}
                  disabled={isScoring || !body}
                  className="ios-button ios-button-filled"
                >
                  {isScoring ? (
                    <Loader2 size={17} strokeWidth={1.5} className="mr-2 animate-spin" />
                  ) : (
                    <BrandIcon size={17} strokeWidth={1.5} className="mr-2" />
                  )}
                  Score
                </button>
              </div>
            </div>
          </section>

          {/* AI Score Feedback & Skeletons */}
          <AnimatePresence mode="wait">
            {isScoring ? (
              <motion.section 
                key="loading-score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <span className="ios-label flex items-center gap-2">
                  <RefreshCw size={14} strokeWidth={1.5} className="animate-spin" />
                  AI is analyzing your content...
                </span>
                <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)] animate-pulse">
                  <div className="p-10 flex flex-col items-center gap-3">
                    <div className="w-20 h-16 bg-[var(--bg-secondary)] rounded-2xl" />
                    <div className="w-32 h-4 bg-[var(--bg-secondary)] rounded-full" />
                  </div>
                  <div className="p-6 bg-[var(--bg-secondary)]/30 space-y-2">
                    <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full" />
                    <div className="w-4/5 h-3 bg-[var(--bg-tertiary)] rounded-full" />
                  </div>
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--bg-secondary)]" />
                      <div className="w-2/3 h-3 bg-[var(--bg-secondary)] rounded-full" />
                    </div>
                  ))}
                </div>
              </motion.section>
            ) : scoreData && (
              <motion.section 
                key="score-data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <span className="ios-label">AI Intelligence Score</span>
                <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
                   <div className="p-6 flex flex-col items-center">
                      <div className="font-serif text-[48px] font-semibold tracking-[-0.015em] leading-none mb-1">{scoreData.score}</div>
                      <div className={cn(
                        "text-[13px] font-bold uppercase",
                        scoreData.score > 70 ? "text-[var(--system-green)]" : "text-[var(--system-orange)]"
                      )}>
                        {scoreData.score > 70 ? "High Fidelity" : "Needs Refinement"}
                      </div>
                   </div>
                   <div className="p-5 bg-[var(--bg-secondary)]/30">
                      <p className="text-[15px] font-medium leading-snug">{scoreData.feedback}</p>
                   </div>
                   {scoreData.suggestions.map((s: string, i: number) => (
                     <div key={i} className="p-4 flex items-center gap-3">
                        <CheckCircle2 size={18} strokeWidth={1.5} className="text-[var(--system-green)] shrink-0" />
                        <span className="text-[15px] font-medium">{s}</span>
                     </div>
                   ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Create Settings / Tools */}
         <div className="lg:col-span-4 space-y-8">
           <section>
              <span className="ios-label">Settings</span>
              <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
                 <div onClick={() => setActiveTab('brand')} className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Settings size={20} strokeWidth={1.5} className="text-[var(--label-secondary)]" />
                       <span className="font-semibold">Context Settings</span>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
                 </div>
                 <div onClick={() => showToast('Search Settings coming soon')} className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Search size={20} strokeWidth={1.5} className="text-[var(--label-secondary)]" />
                       <span className="font-semibold">Optimize Search</span>
                    </div>
                    <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
                 </div>
              </div>
           </section>

           <section>
              <span className="ios-label">Distribution</span>
              <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
                 {PLATFORMS.map(p => (
                   <div key={p.id} onClick={() => setPlatform(p.id)} className={cn("p-4 flex items-center justify-between active:bg-[var(--separator)] cursor-pointer transition-colors", p.id === platform && "bg-[var(--bg-primary)]")}>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center justify-center w-[22px] h-[22px] text-xl">
                           {p.icon}
                         </div>
                         <span className="font-semibold">{p.distributionLabel}</span>
                      </div>
                      {p.id === platform ? (
                         <div className="w-2 h-2 rounded-full bg-[var(--accent)] mr-2" />
                      ) : (
                         <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--label-tertiary)]" />
                      )}
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>

      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-[var(--system-green)] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <CheckCircle2 size={20} strokeWidth={1.5} />
              <span className="font-bold tracking-tight">Saved to CreatorOS</span>
            </div>
          </motion.div>
        )}
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-[var(--label-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <span className="font-bold tracking-tight">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
