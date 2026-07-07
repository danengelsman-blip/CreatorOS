import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircleNotch as Loader2, VideoCamera, Clock, User, Sparkle, Image as ImageIcon, TextAa, Faders, ClockCounterClockwise } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { generateVideo, getOperationStatus } from '../services/gemini';
import CustomVideoPlayer from './CustomVideoPlayer';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

interface VideoStudioProps {
  body: string;
  title: string;
  platform: string;
  brand: any;
  showToast: (msg: string) => void;
  user?: any;
}

export default function VideoStudio({ body, title, platform, brand, showToast, user }: VideoStudioProps) {
  const [videoStyle, setVideoStyle] = useState<'faceless' | 'avatar' | 'upload'>('faceless');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoAspect, setVideoAspect] = useState<'9:16' | '16:9'>('9:16');
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Customization Settings
  const [videoLength, setVideoLength] = useState('Short (15s)');
  const [avatarGender, setAvatarGender] = useState(brand?.avatar?.gender || 'Female');
  const [avatarClothing, setAvatarClothing] = useState(brand?.avatar?.clothing || 'Professional business attire');
  const [backgroundStyle, setBackgroundStyle] = useState(brand?.avatar?.background || 'Modern office with soft lighting');
  const [textOverlay, setTextOverlay] = useState('');
  const [ttsScript, setTtsScript] = useState('');
  
  // History
  const [showHistory, setShowHistory] = useState(false);
  const [videoHistory, setVideoHistory] = useState<any[]>([]);

  useEffect(() => {
    if (body && !ttsScript) {
      setTtsScript(body);
    }
  }, [body]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       setVideoUrl(URL.createObjectURL(file));
       showToast("Video uploaded successfully");
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'videos'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideoHistory(docs);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  useEffect(() => {
    if (showHistory && user) {
      loadHistory();
    }
  }, [showHistory, user]);

  const saveVideoToHistory = async (url: string, finalPrompt: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'videos'), {
        userId: user.uid,
        url,
        prompt: finalPrompt,
        title: title || 'Untitled Video',
        createdAt: serverTimestamp()
      });
      loadHistory();
    } catch (error) {
      console.error('Failed to save video to history', error);
    }
  };

  const handleGenerateVideo = async () => {
    if (videoStyle === 'upload') {
       fileInputRef.current?.click();
       return;
    }
    if (!body && !ttsScript) {
      showToast("Please write a script or narrative first.");
      return;
    }
    setIsVideoGenerating(true);
    setVideoGenerationProgress('Initializing Nano Banana Engine...');
    setVideoUrl(null);
    setShowHistory(false);
    
    try {
      // Build the comprehensive prompt
      let promptStr = `Create a ${videoLength} ${videoStyle === 'avatar' ? 'AI Avatar led' : 'faceless'} promotional video targeting ${platform}. `;
      promptStr += `Title: ${title || 'Untitled'}. `;
      promptStr += `Visual style: ${brand?.visual_style || 'modern and clean'}. `;
      
      if (videoStyle === 'avatar') {
        promptStr += `Subject details: A ${avatarGender} avatar wearing ${avatarClothing}. `;
      }
      if (backgroundStyle) promptStr += `Background: ${backgroundStyle}. `;
      if (textOverlay) promptStr += `Overlay text or subtitles should include: "${textOverlay}". `;
      
      promptStr += `Narrative/Script: ${ttsScript || body}. `;
      promptStr += `Make it highly engaging.`;

      const operation = await generateVideo(promptStr, videoAspect);
      setVideoGenerationProgress('Synthesizing Nano Banana visuals...');
      
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
            const localUrl = URL.createObjectURL(blob);
            setVideoUrl(localUrl);
            await saveVideoToHistory(localUrl, promptStr);
          }
          break;
        } else {
          setVideoGenerationProgress(status.progressPercentage ? `Nano Banana rendering... ${Math.round(status.progressPercentage)}%` : 'Nano Banana rendering... this may take a minute');
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

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-4 bg-[var(--bg-tertiary)] p-5 rounded-2xl ios-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--separator)] pb-4">
          <div className="flex items-center gap-3">
            <VideoCamera size={24} className="text-[var(--accent)]" weight="fill" />
            <h3 className="font-semibold text-[17px]">Nano Banana Studio</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={cn("p-2 rounded-full transition-colors", showHistory ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-secondary)] text-[var(--label-secondary)] hover:text-[var(--label-primary)]")}
              title="Video History"
            >
              <ClockCounterClockwise size={18} weight="bold" />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={cn("p-2 rounded-full transition-colors", showSettings ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-secondary)] text-[var(--label-secondary)] hover:text-[var(--label-primary)]")}
              title="Advanced Settings"
            >
              <Faders size={18} weight="bold" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Styling Row 1 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                        <VideoCamera size={16} /> Video Style
                      </label>
                      <div className="flex items-center bg-[var(--bg-secondary)] p-1 rounded-xl">
                          <button onClick={() => setVideoStyle('faceless')} className={cn("flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all", videoStyle === 'faceless' ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)]" : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]")}>Faceless</button>
                          <button onClick={() => setVideoStyle('avatar')} className={cn("flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all", videoStyle === 'avatar' ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)]" : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]")}>AI Avatar</button>
                          <button onClick={() => setVideoStyle('upload')} className={cn("flex-1 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all", videoStyle === 'upload' ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)]" : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]")}>Upload</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                        <Clock size={16} /> Duration & Format
                      </label>
                      <div className="flex gap-2">
                        <select value={videoLength} onChange={e => setVideoLength(e.target.value)} className="flex-1 bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none">
                          <option>Short (15s)</option>
                          <option>Standard (30s)</option>
                          <option>Long (60s)</option>
                        </select>
                        <select value={videoAspect} onChange={e => setVideoAspect(e.target.value as any)} className="w-24 bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none">
                          <option value="9:16">9:16</option>
                          <option value="16:9">16:9</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                        <ImageIcon size={16} /> Environment / Background
                      </label>
                      <input type="text" value={backgroundStyle} onChange={e => setBackgroundStyle(e.target.value)} className="w-full bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none placeholder:text-[var(--label-tertiary)]" placeholder="E.g., Modern office, Cyberpunk city..." />
                    </div>
                  </div>

                  {/* Styling Row 2 */}
                  <div className="space-y-4">
                    <AnimatePresence>
                      {videoStyle === 'avatar' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                              <User size={16} /> Avatar Properties
                            </label>
                            <div className="flex gap-2">
                              <select value={avatarGender} onChange={e => setAvatarGender(e.target.value)} className="flex-1 bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none">
                                <option>Female</option>
                                <option>Male</option>
                                <option>Non-binary</option>
                                <option>Robot/Mascot</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <input type="text" value={avatarClothing} onChange={e => setAvatarClothing(e.target.value)} className="w-full bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none placeholder:text-[var(--label-tertiary)]" placeholder="Clothing style (e.g., Casual, Suit)..." />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                        <TextAa size={16} /> Text Overlays / Subtitles
                      </label>
                      <input type="text" value={textOverlay} onChange={e => setTextOverlay(e.target.value)} className="w-full bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-2 outline-none placeholder:text-[var(--label-tertiary)]" placeholder="Specify flying text or captions..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[var(--separator)] pt-4">
                  <label className="text-[13px] font-semibold text-[var(--label-secondary)] flex items-center gap-2">
                    <Sparkle size={16} /> TTS Script / Voice Corrections
                  </label>
                  <p className="text-[11px] text-[var(--label-tertiary)] mb-2">Edit this script to fix any AI mispronunciations or add phonetic spelling before generating.</p>
                  <textarea 
                    value={ttsScript} 
                    onChange={e => setTtsScript(e.target.value)} 
                    className="w-full h-24 bg-[var(--bg-secondary)] border-none rounded-xl text-[13px] font-medium p-3 outline-none placeholder:text-[var(--label-tertiary)] resize-none" 
                    placeholder="Enter the exact script you want spoken..." 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" className="hidden" />
          <button 
            onClick={handleGenerateVideo}
            disabled={isVideoGenerating}
            className="ios-button ios-button-tinted w-full md:w-auto"
          >
            {isVideoGenerating ? (
              <Loader2 size={17} className="animate-spin mr-2 inline-block" />
            ) : (
              <VideoCamera size={17} strokeWidth={1.5} className="mr-2 inline-block" />
            )}
            <span>{videoStyle === 'upload' ? 'Upload Video' : 'Generate Nano Banana'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
           <motion.section
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
           >
             <span className="ios-label">Generation History</span>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {videoHistory.length === 0 ? (
                 <div className="col-span-full py-12 text-center text-[var(--label-tertiary)] text-[15px] bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--separator)] border-dashed">
                   No previous videos found.
                 </div>
               ) : (
                 videoHistory.map(item => (
                   <div key={item.id} className="relative group cursor-pointer bg-[var(--bg-tertiary)] rounded-xl overflow-hidden aspect-[9/16] ios-card" onClick={() => setVideoUrl(item.url)}>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <VideoCamera size={32} weight="fill" className="text-white" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                        <p className="text-white/70 text-[10px] truncate">{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                      </div>
                   </div>
                 ))
               )}
             </div>
           </motion.section>
        ) : (videoUrl || isVideoGenerating) ? (
          <motion.section
            key="player"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <span className="ios-label">Nano Banana Preview</span>
            <div className={cn("bg-[var(--bg-tertiary)] rounded-2xl overflow-hidden w-full flex items-center justify-center relative bg-black/5 shadow-xl max-h-[600px]", videoAspect === '16:9' ? 'aspect-video' : 'aspect-[9/16]')} style={{ minHeight: '300px' }}>
                {isVideoGenerating ? (
                <div className="flex flex-col items-center gap-5 w-full max-w-[280px] p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                    <div className="w-full h-1.5 bg-[var(--separator)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--accent)]"
                        initial={{ width: "0%" }}
                        animate={{
                            width: videoGenerationProgress === 'Initializing Nano Banana Engine...' ? '15%' :
                                    videoGenerationProgress === 'Synthesizing Nano Banana visuals...' ? '45%' :
                                    videoGenerationProgress.startsWith('Nano Banana rendering') ? '90%' : '100%'
                        }}
                        transition={{
                            duration: videoGenerationProgress.startsWith('Nano Banana rendering') ? 45 : 1.5,
                            ease: videoGenerationProgress.startsWith('Nano Banana rendering') ? "easeOut" : "easeInOut"
                        }}
                    />
                    </div>
                    <span className="text-[12px] font-bold tracking-widest text-[var(--label-secondary)] uppercase text-center w-full truncate">
                    {videoGenerationProgress}
                    </span>
                </div>
                ) : videoUrl ? (
                  <CustomVideoPlayer videoUrl={videoUrl} />
                ) : null}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
