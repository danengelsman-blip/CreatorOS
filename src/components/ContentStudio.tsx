import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight as Send, CheckCircle as CheckCircle2, ArrowsClockwise as RefreshCw, TextT as Type, Hash, Image as ImageIcon, CaretRight as ChevronRight, DownloadSimple as Download, Microphone as Mic, SpeakerHigh as Volume2, SpeakerSlash, Rewind, FastForward, VideoCamera as VideoIcon, Play, CircleNotch as Loader2, FloppyDisk as Save, Sparkle as Sparkles, MagnifyingGlass as Search, GearSix as Settings, DotsThree as MoreHorizontal, Lightbulb } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'motion/react';
import { scoreContent, quickPolish, generateSpeech, transcribeAudio, generateVideo, getOperationStatus, generateContentIdeas } from '../services/gemini';
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
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormIdeas, setBrainstormIdeas] = useState<any[] | null>(null);
  const [showBrainstorm, setShowBrainstorm] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoAspect, setVideoAspect] = useState<'9:16' | '16:9'>('9:16');
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleGenerateVideo = async () => {
    if (!body || !brand) return;
    setIsVideoGenerating(true);
    setVideoGenerationProgress('Initializing...');
    setVideoUrl(null);
    try {
      const prompt = `A short promotional video draft targeting ${platform}. Title: ${title || 'Untitled'}. Narrative: ${body}. Visual style: ${brand.visual_style || 'modern and clean'}. Make it highly engaging.`;
      const operation = await generateVideo(prompt, videoAspect);
      setVideoGenerationProgress('Synthesizing visuals...');
      
      let done = false;
      let finalOp = operation;
      
      // Polling for video completion
      while (!done) {
        await new Promise(r => setTimeout(r, 6000));
        const status = await getOperationStatus(finalOp);
        
        if (status.done) {
          done = true;
          if (status.error) {
             throw new Error(status.error.message || 'Video generation failed');
          }
          if (status.uri) {
            setVideoGenerationProgress('Downloading video...');
            const { fetchVideoDownloadResponse } = await import('../services/gemini');
            const blob = await fetchVideoDownloadResponse(status.uri);
            setVideoUrl(URL.createObjectURL(blob));
          }
          break;
        } else {
          setVideoGenerationProgress(status.progressPercentage ? `Rendering frames... ${Math.round(status.progressPercentage)}%` : 'Rendering frames... this may take a minute');
        }
      }
      
    } catch (error: any) {
      console.error('Video generation error:', error);
      showToast(error.message || 'Video generation failed. Please try again.');
    } finally {
      setIsVideoGenerating(false);
      setVideoGenerationProgress('');
    }
  };

  const handleJumpBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 5;
    }
  };

  const handleJumpForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 5;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsVideoMuted(newMutedState);
    }
  };

  const handleBrainstorm = async () => {
    if (!brand) {
      showToast('Please set up your Brand Kit first.');
      return;
    }
    
    if (brainstormIdeas) {
      setShowBrainstorm(!showBrainstorm);
      return;
    }

    setIsBrainstorming(true);
    setShowBrainstorm(true);
    try {
      const ideas = await generateContentIdeas(brand);
      setBrainstormIdeas(ideas);
    } catch (error) {
      console.error('Failed to brainstorm ideas:', error);
      showToast('Failed to generate ideas. Please try again.');
      setShowBrainstorm(false);
    } finally {
      setIsBrainstorming(false);
    }
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
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title or Hook"
                  className="w-full font-serif text-[24px] font-semibold tracking-[-0.015em] outline-none placeholder:text-[var(--label-tertiary)] bg-transparent"
                />
                <button 
                  onClick={handleBrainstorm}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all",
                    showBrainstorm || isBrainstorming ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                  )}
                >
                  {isBrainstorming ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} weight={showBrainstorm ? "fill" : "regular"} />}
                  Ideas
                </button>
              </div>

              <AnimatePresence>
                {showBrainstorm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 mt-2 border border-[var(--separator)] shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-[13px] font-semibold text-[var(--label-secondary)] px-1">
                        <span className="uppercase tracking-widest">Brand Aligned Ideas</span>
                        <button onClick={handleBrainstorm} className="text-[var(--accent)] flex items-center gap-1 hover:underline">
                          <RefreshCw size={14} className={isBrainstorming ? "animate-spin" : ""} /> Regenerate
                        </button>
                      </div>
                      
                      {isBrainstorming && !brainstormIdeas ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-3 text-[var(--label-secondary)]">
                          <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                          <span className="text-[13px] font-medium">Analyzing brand vector...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {brainstormIdeas?.map((idea, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTitle(idea.title);
                                setBody(idea.hook + '\n\n' + idea.description);
                                setShowBrainstorm(false);
                              }}
                              className="text-left bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--separator)] hover:border-[var(--accent)] transition-all group ios-elevated hover:shadow-md"
                            >
                              <h4 className="font-semibold text-[14px] text-[var(--label-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">{idea.title}</h4>
                              <p className="text-[13px] text-[var(--label-secondary)] mt-1.5 line-clamp-2 leading-relaxed">{idea.hook}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's the narrative? AI will score your brand voice..."
                className="w-full h-[400px] text-[17px] leading-relaxed outline-none resize-none placeholder:text-[var(--label-tertiary)] bg-transparent font-medium"
              />
            </div>

            <div className="px-6 py-4 border-t border-[var(--separator)] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-5 text-[var(--accent)]">
                <button className="ios-button ios-button-gray px-3"><Type size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><ImageIcon size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><Hash size={17} strokeWidth={1.5} /></button>
                <button className="ios-button ios-button-gray px-3"><Mic size={17} strokeWidth={1.5} /></button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-[var(--bg-tertiary)] p-1 rounded-xl sm:mr-2">
                  <button
                    onClick={() => setVideoAspect('9:16')}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                      videoAspect === '9:16' 
                        ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)]" 
                        : "text-[var(--label-secondary)]"
                    )}
                  >
                    9:16
                  </button>
                  <button
                    onClick={() => setVideoAspect('16:9')}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                      videoAspect === '16:9' 
                        ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)]" 
                        : "text-[var(--label-secondary)]"
                    )}
                  >
                    16:9
                  </button>
                </div>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isVideoGenerating || !body}
                  className="ios-button ios-button-tinted"
                >
                  {isVideoGenerating ? (
                    <Loader2 size={17} strokeWidth={1.5} className="mr-2 animate-spin" />
                  ) : (
                    <VideoIcon size={17} strokeWidth={1.5} className="mr-2 hidden sm:inline-block" />
                  )}
                  <span className="hidden sm:inline">Video Draft</span>
                  <span className="sm:hidden">Video</span>
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isSaving || !body}
                  className="ios-button ios-button-gray"
                >
                  {isSaving ? <Loader2 size={17} strokeWidth={1.5} className="mr-2 animate-spin" /> : <Save size={17} strokeWidth={1.5} className="mr-2 hidden sm:inline-block" />}
                  Save
                </button>
                <button 
                  onClick={handlePolish}
                  disabled={isPolishing || !body}
                  className="ios-button ios-button-tinted"
                >
                  {isPolishing ? (
                    <RefreshCw size={17} strokeWidth={1.5} className="mr-2 animate-spin hidden sm:inline-block" />
                  ) : (
                    <Sparkles size={17} strokeWidth={1.5} className="mr-2 hidden sm:inline-block" />
                  )}
                  <span className="hidden xl:inline">Auto-Polish</span>
                  <span className="xl:hidden">Polish</span>
                </button>
                <button 
                  onClick={handleScore}
                  disabled={isScoring || !body}
                  className="ios-button ios-button-filled"
                >
                  {isScoring ? (
                    <Loader2 size={17} strokeWidth={1.5} className="mr-2 animate-spin" />
                  ) : (
                    <BrandIcon size={17} strokeWidth={1.5} className="mr-2 hidden sm:inline-block" />
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

          {/* Video Player */}
          {(videoUrl || isVideoGenerating) && (
            <AnimatePresence>
               <motion.section
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4"
               >
                 <span className="ios-label">Video Mockup</span>
                 <div className={cn("bg-[var(--bg-tertiary)] ios-card overflow-hidden w-full flex items-center justify-center relative bg-black/5 max-h-[600px]", videoAspect === '16:9' ? 'aspect-video' : 'aspect-[9/16]')} style={{ minHeight: '300px' }}>
                   {isVideoGenerating ? (
                     <div className="flex flex-col items-center gap-5 w-full max-w-[280px] p-6">
                       <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                       <div className="w-full h-1.5 bg-[var(--separator)] rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-[var(--accent)]"
                           initial={{ width: "0%" }}
                           animate={{ 
                             width: videoGenerationProgress === 'Initializing...' ? '15%' : 
                                    videoGenerationProgress === 'Synthesizing visuals...' ? '45%' : 
                                    videoGenerationProgress.startsWith('Rendering') ? '90%' : '100%'
                           }}
                           transition={{ 
                             duration: videoGenerationProgress.startsWith('Rendering') ? 45 : 1.5,
                             ease: videoGenerationProgress.startsWith('Rendering') ? "easeOut" : "easeInOut"
                           }}
                         />
                       </div>
                       <span className="text-[12px] font-bold tracking-widest text-[var(--label-secondary)] uppercase text-center w-full truncate">
                         {videoGenerationProgress}
                       </span>
                     </div>
                   ) : videoUrl ? (
                     <div className="relative w-full h-full group flex items-center justify-center">
                       <video 
                         ref={videoRef}
                         src={videoUrl} 
                         autoPlay 
                         loop 
                         muted={isVideoMuted}
                         playsInline
                         onClick={(e) => {
                            const v = e.currentTarget;
                            if (v.paused) v.play(); else v.pause();
                         }}
                         className="w-full h-full object-cover cursor-pointer"
                       />
                       <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <div className="flex items-center gap-6 bg-black/60 backdrop-blur-xl px-6 py-2.5 rounded-full text-white shadow-xl border border-white/10">
                           <button onClick={handleJumpBack} className="hover:text-white/70 active:scale-95 transition-all outline-none" title="Jump 5s back">
                             <Rewind size={22} weight="fill" />
                           </button>
                           <button onClick={toggleMute} className="hover:text-white/70 active:scale-95 transition-all outline-none" title={isVideoMuted ? "Unmute" : "Mute"}>
                             {isVideoMuted ? <SpeakerSlash size={22} weight="fill" /> : <Volume2 size={22} weight="fill" />}
                           </button>
                           <button onClick={handleJumpForward} className="hover:text-white/70 active:scale-95 transition-all outline-none" title="Jump 5s forward">
                             <FastForward size={22} weight="fill" />
                           </button>
                         </div>
                       </div>
                     </div>
                   ) : null}
                 </div>
               </motion.section>
            </AnimatePresence>
          )}

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
