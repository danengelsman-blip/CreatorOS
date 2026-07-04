import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircleNotch as Loader2, Rewind, FastForward, SpeakerSlash, SpeakerHigh as VolumeHigh, VideoCamera } from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { generateVideo, getOperationStatus } from '../services/gemini';

interface VideoStudioProps {
  body: string;
  title: string;
  platform: string;
  brand: any;
  showToast: (msg: string) => void;
  
  
}

export default function VideoStudio({ body, title, platform, brand, showToast }: VideoStudioProps) {
  const [videoStyle, setVideoStyle] = useState<'faceless' | 'avatar' | 'upload'>('faceless');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoAspect, setVideoAspect] = useState<'9:16' | '16:9'>('9:16');
  const [videoGenerationProgress, setVideoGenerationProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       setVideoUrl(URL.createObjectURL(file));
       showToast("Video uploaded successfully");
    }
  };

  const handleGenerateVideo = async () => {
    if (videoStyle === 'upload') {
       fileInputRef.current?.click();
       return;
    }
    if (!body || !brand) {
      showToast("Please write a script and set up a brand kit first.");
      return;
    }
    setIsVideoGenerating(true);
    setVideoGenerationProgress('Initializing Nano Banana Engine...');
    setVideoUrl(null);
    try {
      const prompt = `A short ${videoStyle === 'avatar' ? 'AI Avatar led' : 'faceless'} promotional video draft targeting ${platform}. Title: ${title || 'Untitled'}. Narrative: ${body}. Visual style: ${brand?.visual_style || 'modern and clean'}. Make it highly engaging.`;
      const operation = await generateVideo(prompt, videoAspect);
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
            setVideoUrl(URL.createObjectURL(blob));
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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleJumpBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime -= 5;
  };

  const handleJumpForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime += 5;
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-tertiary)] p-4 rounded-2xl ios-card">
        <div className="flex flex-wrap items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" className="hidden" />
            
            <div className="flex items-center bg-[var(--bg-secondary)] p-1 rounded-xl sm:mr-2">
                <button
                onClick={() => setVideoStyle('faceless')}
                className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    videoStyle === 'faceless' 
                    ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)] shadow-sm" 
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                )}
                >
                Faceless Video
                </button>
                <button
                onClick={() => setVideoStyle('avatar')}
                className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    videoStyle === 'avatar' 
                    ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)] shadow-sm" 
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                )}
                >
                AI Avatar
                </button>
                <button
                onClick={() => setVideoStyle('upload')}
                className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    videoStyle === 'upload' 
                    ? "bg-[var(--bg-primary)] ios-elevated text-[var(--accent)] shadow-sm" 
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                )}
                >
                User Upload
                </button>
            </div>

            <div className="flex items-center bg-[var(--bg-secondary)] p-1 rounded-xl sm:mr-2">
                <button
                onClick={() => setVideoAspect('9:16')}
                className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    videoAspect === '9:16' 
                    ? "bg-[var(--bg-primary)] ios-elevated text-[var(--label-primary)] shadow-sm" 
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                )}
                >
                9:16
                </button>
                <button
                onClick={() => setVideoAspect('16:9')}
                className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all",
                    videoAspect === '16:9' 
                    ? "bg-[var(--bg-primary)] ios-elevated text-[var(--label-primary)] shadow-sm" 
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                )}
                >
                16:9
                </button>
            </div>
        </div>

        <button 
            onClick={handleGenerateVideo}
            disabled={isVideoGenerating || (!body && videoStyle !== 'upload')}
            className="ios-button ios-button-tinted"
        >
            {isVideoGenerating ? (
            <Loader2 size={17} className="animate-spin mr-2 inline-block" />
            ) : (
            <VideoCamera size={17} strokeWidth={1.5} className="mr-2 inline-block" />
            )}
            <span>{videoStyle === 'upload' ? 'Upload Video' : 'Generate Nano Banana'}</span>
        </button>
      </div>

      {(videoUrl || isVideoGenerating) && (
        <AnimatePresence> 
            <motion.section 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-4" 
            > 
            <span className="ios-label">Nano Banana Studio</span> 
            <div className={cn("bg-[var(--bg-tertiary)] ios-card overflow-hidden w-full flex items-center justify-center relative bg-black/5 max-h-[600px]", videoAspect === '16:9' ? 'aspect-video' : 'aspect-[9/16]')} style={{ minHeight: '300px' }}> 
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
                        {isVideoMuted ? <SpeakerSlash size={22} weight="fill" /> : <VolumeHigh size={22} weight="fill" />} 
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
  );
}
