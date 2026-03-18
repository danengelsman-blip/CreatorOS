import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  RefreshCw,
  Layout,
  Type,
  Hash,
  Image as ImageIcon,
  ChevronRight,
  Mic,
  Volume2,
  Video as VideoIcon,
  Bolt,
  Play,
  Loader2,
  Key,
  Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scoreContent, quickPolish, generateSpeech, transcribeAudio, generateVideo, getOperationStatus } from '../services/gemini';
import { cn } from '../lib/utils';
import { db, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

// Extend window for AI Studio API key methods
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: '📱' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '🎥' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
];

export default function ContentStudio({ brand, setActiveTab, user }: { brand: any, setActiveTab: (tab: string) => void, user: any }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [isScoring, setIsScoring] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Feature States
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleScore = async () => {
    if (!body || !brand) return;
    setIsScoring(true);
    try {
      const result = await scoreContent(body, `${brand.personality} - ${brand.tagline}`);
      setScoreData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScoring(false);
    }
  };

  const handleQuickPolish = async () => {
    if (!body) return;
    setIsPolishing(true);
    try {
      const polished = await quickPolish(body);
      setBody(polished || body);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!body) return;
    setIsGeneratingSpeech(true);
    try {
      const base64 = await generateSpeech(body);
      if (base64) {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        audio.play();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          try {
            const text = await transcribeAudio(base64);
            setBody(prev => prev + (prev ? '\n' : '') + text);
          } catch (error) {
            console.error(error);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    
    if (!hasApiKey) {
      await handleOpenKeySelector();
      return;
    }

    setIsGeneratingVideo(true);
    setVideoStatus('Initializing Veo 3...');
    try {
      let operation = await generateVideo(videoPrompt, platform === 'tiktok' || platform === 'instagram' ? '9:16' : '16:9');
      
      setVideoStatus('Generating video (this may take a few minutes)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await getOperationStatus(operation);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setVideoUrl(downloadLink);
      }
      setVideoStatus('Video generated successfully!');
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Requested entity was not found')) {
        setHasApiKey(false);
        setVideoStatus('API Key error. Please select a valid key.');
      } else {
        setVideoStatus('Generation failed. Please try again.');
      }
    } finally {
      setIsGeneratingVideo(false);
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
      
      alert('Content saved to CreatorOS Cloud and optimized for ' + platform);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
        <div className="w-24 h-24 bg-accent-gold/10 text-accent-gold rounded-[32px] flex items-center justify-center border border-accent-gold/20 shadow-xl shadow-accent-gold/5">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Identity Required</h2>
          <p className="text-premium-muted text-lg leading-relaxed">You need to architect your brand kit before you can start creating world-class content with AI scoring.</p>
        </div>
        <button 
          onClick={() => setActiveTab('brand')}
          className="px-10 py-5 bg-premium-ink text-white rounded-[24px] font-bold text-lg shadow-2xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Go to Branding Engine
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
      {/* Editor Area */}
      <div className="lg:col-span-8 space-y-6 lg:space-y-10">
        <div className="premium-card p-6 lg:p-10 bg-white">
          <div className="flex items-center justify-between mb-8 lg:mb-10 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-black/[0.03] min-w-max">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-[12px] lg:text-[13px] font-bold transition-all whitespace-nowrap",
                    platform === p.id 
                      ? "bg-white text-premium-ink shadow-sm border border-black/[0.05]" 
                      : "text-premium-muted hover:text-premium-ink"
                  )}
                >
                  <span className="mr-2">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title or Hook Idea..."
              className="w-full text-2xl lg:text-4xl font-extrabold tracking-tight mb-6 lg:mb-8 outline-none placeholder:text-gray-200 bg-transparent"
            />
            <div className="absolute right-0 top-0 lg:top-1 flex gap-2">
              <button 
                onClick={handleQuickPolish}
                disabled={isPolishing || !body}
                className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center bg-accent-violet/5 text-accent-violet rounded-xl hover:bg-accent-violet/10 transition-colors disabled:opacity-50"
                title="Fast AI Polish"
              >
                {isPolishing ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Bolt className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your content here... The AI will score it based on your brand voice."
              className="w-full h-[300px] lg:h-[400px] text-lg lg:text-xl leading-relaxed outline-none resize-none placeholder:text-gray-200 bg-transparent font-medium"
            />
            <div className="absolute bottom-2 lg:bottom-4 right-0 flex flex-col gap-2 lg:gap-3">
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all",
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-premium-ink text-white hover:scale-110"
                )}
                title={isRecording ? "Stop Recording" : "Transcribe Voice"}
              >
                {isTranscribing ? <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" /> : <Mic className="w-5 h-5 lg:w-6 lg:h-6" />}
              </button>
              <button 
                onClick={handleGenerateSpeech}
                disabled={isGeneratingSpeech || !body}
                className="w-12 h-12 lg:w-14 lg:h-14 bg-white text-premium-ink border border-premium-border rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all disabled:opacity-50"
                title="Generate TTS Voiceover"
              >
                {isGeneratingSpeech ? <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" /> : <Volume2 className="w-5 h-5 lg:w-6 lg:h-6" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 lg:pt-10 border-t border-premium-border mt-8 lg:mt-10 gap-6">
            <div className="flex gap-4 lg:gap-6 w-full sm:w-auto justify-center sm:justify-start">
              <ToolButton icon={Type} label="Text" />
              <ToolButton icon={ImageIcon} label="Media" />
              <ToolButton icon={Hash} label="Tags" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full sm:w-auto">
              <button 
                onClick={handleScore}
                disabled={isScoring || !body}
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-gray-50 text-premium-ink rounded-[16px] lg:rounded-[20px] font-bold text-[13px] lg:text-[14px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-50 border border-black/[0.03]"
              >
                {isScoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent-gold" />}
                Score Content
              </button>
              <button 
                onClick={handlePublish}
                disabled={isSaving || !body}
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 bg-premium-ink text-white rounded-[16px] lg:rounded-[20px] font-bold text-[13px] lg:text-[14px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Optimize & Save
              </button>
            </div>
          </div>
        </div>

        {/* Video Generation Section */}
        <div className="premium-card p-6 lg:p-10 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent-violet/5 rounded-2xl flex items-center justify-center">
                <VideoIcon className="w-5 h-5 lg:w-6 lg:h-6 text-accent-violet" />
              </div>
              <div>
                <h3 className="font-bold text-base lg:text-lg tracking-tight">Veo 3 Video Studio</h3>
                <p className="text-[12px] lg:text-[13px] text-premium-muted">Generate high-fidelity video from text prompts</p>
              </div>
            </div>
            {!hasApiKey && (
              <button 
                onClick={handleOpenKeySelector}
                className="flex items-center gap-2 px-4 py-2 bg-accent-gold/10 text-accent-gold rounded-xl text-[11px] font-bold border border-accent-gold/20 tracking-wide uppercase w-full sm:w-auto justify-center"
              >
                <Key className="w-3.5 h-3.5" />
                Select API Key
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="relative">
              <textarea 
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                className="w-full h-32 p-5 lg:p-6 bg-gray-50 rounded-[20px] lg:rounded-[24px] border-none focus:ring-2 focus:ring-accent-violet/20 outline-none text-[14px] lg:text-[15px] resize-none font-medium placeholder:text-gray-300 transition-all"
              />
              <button 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo || !videoPrompt}
                className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-12 lg:h-12 bg-accent-violet text-white rounded-xl shadow-xl shadow-accent-violet/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isGeneratingVideo ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
            </div>

            {videoStatus && (
              <div className="p-5 bg-accent-violet/[0.03] text-accent-violet rounded-2xl text-[13px] font-bold flex items-center gap-3 border border-accent-violet/10">
                {isGeneratingVideo && <Loader2 className="w-4 h-4 animate-spin" />}
                {videoStatus}
              </div>
            )}

            {videoUrl && (
              <div className="aspect-video bg-premium-ink rounded-[24px] overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                  <p className="text-white font-bold tracking-tight">Video Ready for Review</p>
                </div>
                <div className="w-full h-full flex items-center justify-center text-white/5">
                  <VideoIcon className="w-20 h-20" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <div className="lg:col-span-4 space-y-8">
        {/* Content Score Card */}
        <div className="premium-card p-10 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-lg tracking-tight">Content Score</h3>
            <div className="w-8 h-8 bg-accent-gold/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-gold" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {scoreData ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center py-4">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke="#F9F9F8"
                        strokeWidth="14"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke={scoreData.score > 70 ? "#10B981" : "#F59E0B"}
                        strokeWidth="14"
                        strokeDasharray="452.4"
                        initial={{ strokeDashoffset: 452.4 }}
                        animate={{ strokeDashoffset: 452.4 - (452.4 * scoreData.score) / 100 }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-extrabold tracking-tighter">{scoreData.score}</span>
                      <span className="text-[10px] font-bold text-premium-muted uppercase tracking-[0.2em] mt-1">Points</span>
                    </div>
                  </div>
                  <div className="mt-8 px-4 py-1.5 bg-gray-50 rounded-full border border-black/[0.03]">
                    <p className="text-[11px] font-bold text-premium-muted uppercase tracking-widest">
                      {scoreData.score > 80 ? 'Elite Performance' : scoreData.score > 60 ? 'Strong Potential' : 'Needs Refinement'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-[24px] border border-black/[0.03]">
                    <p className="text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-3">AI Analysis</p>
                    <p className="text-[14px] text-premium-ink leading-relaxed font-medium">{scoreData.feedback}</p>
                  </div>
                  
                  <div>
                    <p className="text-[11px] font-bold text-premium-muted uppercase tracking-widest mb-4">Strategic Suggestions</p>
                    <div className="space-y-3">
                      {scoreData.suggestions.map((s: string, i: number) => (
                        <div key={i} className="flex gap-3 text-[13px] text-premium-ink font-medium leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-black/[0.03]">
                  <PenTool className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-[14px] text-premium-muted font-medium max-w-[200px] leading-relaxed">Write something and click "Score Content" to get AI feedback.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Platform Formatter */}
        <div className="premium-card p-10 bg-premium-ink text-white shadow-2xl shadow-black/20">
          <h3 className="font-bold text-lg mb-8 flex items-center gap-3">
            <Layout className="w-5 h-5 text-accent-violet" />
            Auto-Formatter
          </h3>
          <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
            We'll automatically adjust your {platform} post for other platforms when you publish.
          </p>
          <div className="space-y-3">
            {PLATFORMS.filter(p => p.id !== platform).slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-[14px] font-bold tracking-tight">{p.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, label }: any) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
