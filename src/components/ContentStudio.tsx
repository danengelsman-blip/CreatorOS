import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  RefreshCw,
  Type,
  Hash,
  Image as ImageIcon,
  ChevronRight,
  Download,
  Mic,
  Volume2,
  Video as VideoIcon,
  Play,
  Loader2,
  Save,
  Sparkles,
  Search,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scoreContent, quickPolish, generateSpeech, transcribeAudio, generateVideo, getOperationStatus } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import BrandIcon from './BrandIcon';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: '📱' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '🎥' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
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
      const polished = await quickPolish(body, brand.personality);
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
          <Sparkles className="w-10 h-10 text-[var(--label-tertiary)]" />
        </div>
        <div className="space-y-4">
          <h2 className="text-[28px] font-bold tracking-tight">Identity Required</h2>
          <p className="text-[var(--label-secondary)] text-[17px] font-medium leading-tight">
            Architect your brand identity before crafting world-class content with AI scoring.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('brand')}
          className="ios-button-filled w-full text-[17px]"
        >
          Build Brand Identity
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <h1 className="px-1 pt-4">Create</h1>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[var(--bg-tertiary)] ios-card overflow-hidden">
            {/* Platform Segmented Control */}
            <div className="p-4 border-b border-[var(--separator)]">
              <div className="flex bg-[var(--bg-secondary)] p-1 rounded-[10px]">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                      platform === p.id 
                        ? "bg-[var(--bg-tertiary)] ios-elevated text-[var(--accent)]" 
                        : "text-[var(--label-secondary)]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4 relative">
              {isPolishing && (
                <div className="absolute inset-0 z-10 bg-[var(--bg-tertiary)]/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 bg-[var(--bg-primary)] px-5 py-3 rounded-2xl shadow-xl border border-[var(--separator)]">
                    <Sparkles size={20} className="text-[var(--accent)] animate-pulse" />
                    <span className="text-[15px] font-semibold">AI is polishing your narrative...</span>
                  </div>
                </div>
              )}
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or Hook"
                className="w-full text-[24px] font-bold tracking-tight outline-none placeholder:text-[var(--label-tertiary)] bg-transparent"
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
                <button className="active:opacity-40 transition-opacity"><Type size={22} /></button>
                <button className="active:opacity-40 transition-opacity"><ImageIcon size={22} /></button>
                <button className="active:opacity-40 transition-opacity"><Hash size={22} /></button>
                <button className="active:opacity-40 transition-opacity"><Mic size={22} /></button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handlePolish}
                  disabled={isPolishing || !body}
                  className="ios-button-tinted px-4"
                >
                  {isPolishing ? (
                    <RefreshCw size={18} className="animate-spin text-[var(--accent)]" />
                  ) : (
                    <Sparkles size={18} className="text-[var(--accent)]" />
                  )}
                  <span className="hidden sm:inline">Polish</span>
                </button>
                <button 
                  onClick={handleScore}
                  disabled={isScoring || !body}
                  className="ios-button-tinted px-4"
                >
                  {isScoring ? (
                    <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
                  ) : (
                    <BrandIcon size={18} />
                  )}
                  <span className="hidden sm:inline">Score</span>
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isSaving || !body}
                  className="ios-button-filled px-6"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save
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
                  <RefreshCw size={14} className="animate-spin" />
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
                      <div className="text-[48px] font-bold tracking-tight leading-none mb-1">{scoreData.score}</div>
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
                        <CheckCircle2 size={18} className="text-[var(--system-green)] shrink-0" />
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
                 <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Settings size={20} className="text-[var(--label-secondary)]" />
                       <span className="font-semibold">Context Settings</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
                 </div>
                 <div className="p-4 flex items-center justify-between active:bg-[var(--separator)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Search size={20} className="text-[var(--label-secondary)]" />
                       <span className="font-semibold">Optimize Search</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
                 </div>
              </div>
           </section>

           <section>
              <span className="ios-label">Distribution</span>
              <div className="bg-[var(--bg-tertiary)] ios-card overflow-hidden divide-y divide-[var(--separator)]">
                 {PLATFORMS.filter(p => p.id !== platform).map(p => (
                   <div key={p.id} className="p-4 flex items-center justify-between active:bg-[var(--separator)] cursor-pointer">
                      <div className="flex items-center gap-3">
                         <span className="text-xl">{p.icon}</span>
                         <span className="font-semibold">Format for {p.label}</span>
                      </div>
                      <ChevronRight size={18} className="text-[var(--label-tertiary)]" />
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
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[var(--system-green)] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="font-bold tracking-tight">Saved to CreatorOS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
