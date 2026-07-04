import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Sparkle, Clock, Star, Tag, CaretLeft, CaretRight, MagicWand, Plus, ThumbsUp } from '@phosphor-icons/react';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function PerfectPromptCopilot({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'generator' | 'templates' | 'history'>('generator');
  const [generatorInput, setGeneratorInput] = useState('');

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      <div className="space-y-4 pt-10 px-4">
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)]">
          Perfect Prompt
        </h1>
        <p className="text-[17px] text-[var(--label-secondary)]">
          Your AI co-pilot for content strategy and viral copywriting.
        </p>
      </div>

      <div className="flex px-4 gap-2 border-b border-[var(--separator)] overflow-x-auto hide-scrollbar">
        {(['generator', 'templates', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 font-semibold text-[15px] capitalize transition-colors relative whitespace-nowrap",
              activeTab === tab ? "text-[var(--label-primary)]" : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="copilot-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="px-4">
        {activeTab === 'generator' && (
          <GeneratorView 
            user={user} 
            input={generatorInput} 
            setInput={setGeneratorInput} 
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesView 
            user={user} 
            onSelect={(text) => { 
              setGeneratorInput(text); 
              setActiveTab('generator'); 
            }} 
          />
        )}
        {activeTab === 'history' && <HistoryView user={user} />}
      </div>
    </div>
  );
}

function GeneratorView({ user, input, setInput }: { user: any, input: string, setInput: (v: string) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim() || !user) return;
    setIsGenerating(true);
    setResult('');
    
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          contents: `Act as a World-Class Content Strategist and Viral Copywriter. 
          Take the following rough idea and output a highly detailed, markdown-formatted prompt that includes:
          - Target Audience
          - Tone of Voice
          - Hook Structures
          - Pacing
          - Platform-specific Best Practices
          
          Idea: "${input}"`
        })
      });
      
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const generatedText = data.text || '';
      setResult(generatedText);
      
      // Save to history
      await addDoc(collection(db, 'prompts'), {
        userId: user.uid,
        input,
        result: generatedText,
        rating: 0,
        tag: '',
        timestamp: serverTimestamp()
      });
      
    } catch (err) {
      console.error(err);
      setResult("Error generating prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-4">
        <span className="ios-label px-0">Rough Idea</span>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., A video about productivity hacks for busy parents..."
          className="ios-input h-32 py-4 resize-none"
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !input.trim()}
          className="ios-button ios-button-filled w-full"
        >
          {isGenerating ? <Sparkle className="animate-spin" size={20} /> : <MagicWand size={20} />}
          {isGenerating ? "Optimizing..." : "Generate Perfect Prompt"}
        </button>
      </div>

      {isGenerating && (
        <div className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-full"></div>
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-5/6"></div>
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-4/6"></div>
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-full mt-4"></div>
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4"></div>
        </div>
      )}

      {!isGenerating && result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-tertiary)] ios-card p-6 space-y-4"
        >
          <div className="flex justify-between items-center border-b border-[var(--separator)] pb-4">
            <span className="ios-label px-0 mb-0">Optimized Prompt</span>
            <button 
              onClick={copyToClipboard}
              className="ios-button ios-button-tinted h-8 text-[13px] px-3"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', color: '#ff0000', bgClass: 'bg-red-500/10' },
  { id: 'tiktok', name: 'TikTok', color: '#00f2fe', bgClass: 'bg-cyan-500/10' },
  { id: 'instagram', name: 'Instagram', color: '#e1306c', bgClass: 'bg-pink-500/10' },
  { id: 'twitter', name: 'Twitter', color: '#1da1f2', bgClass: 'bg-blue-500/10' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0077b5', bgClass: 'bg-sky-500/10' }
];

function TemplatesView({ user, onSelect }: { user: any, onSelect: (t: string) => void }) {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [page, setPage] = useState(1);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates(platform.id, page);
  }, [platform.id, page]);

  const loadTemplates = async (platId: string, pageNum: number) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'prompt_templates'),
        where('userId', '==', user.uid),
        where('platform', '==', platId),
        where('page', '==', pageNum)
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setTemplates(snap.docs[0].data().templates);
      } else {
        await generateAndSaveTemplates(platId, pageNum);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndSaveTemplates = async (platId: string, pageNum: number) => {
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          contents: `Generate 5 unique, highly engaging content prompt templates for ${platId}. Page ${pageNum}.
          Output JSON strictly: { "templates": [{ "title": "...", "hook": "...", "description": "..." }] }`,
          config: {
            responseMimeType: "application/json",
          }
        })
      });
      
      const data = await response.json();
      const newTemplates = JSON.parse(data.text).templates;
      setTemplates(newTemplates);
      
      await addDoc(collection(db, 'prompt_templates'), {
        userId: user.uid,
        platform: platId,
        page: pageNum,
        templates: newTemplates,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to generate templates", err);
      setTemplates([]);
    }
  };

  return (
    <div className={cn("space-y-6 transition-colors duration-500 rounded-3xl p-4 -mx-4", platform.bgClass)}>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => { setPlatform(p); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-full font-medium text-[14px] whitespace-nowrap transition-colors border",
              platform.id === p.id 
                ? "bg-[var(--label-primary)] text-[var(--bg-primary)] border-[var(--label-primary)]" 
                : "bg-transparent border-[var(--separator)] text-[var(--label-secondary)]"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-[var(--bg-tertiary)]/80 ios-card p-5 animate-pulse">
              <div className="h-5 bg-[var(--bg-secondary)] rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-full mb-2"></div>
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4"></div>
            </div>
          ))
        ) : (
          templates.map((tpl, i) => (
            <div 
              key={i} 
              onClick={() => onSelect(`${tpl.title}\n\n${tpl.description}`)}
              className="bg-[var(--bg-tertiary)] ios-card p-5 ios-card-clickable cursor-pointer hover:border-[var(--accent)] transition-colors"
            >
              <h3 className="font-semibold text-[17px] mb-2">{tpl.title}</h3>
              <p className="text-[14px] text-[var(--label-primary)] font-medium mb-1">"{tpl.hook}"</p>
              <p className="text-[14px] text-[var(--label-secondary)] line-clamp-2">{tpl.description}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className="ios-button ios-button-gray h-10 px-4 disabled:opacity-50"
        >
          <CaretLeft size={16} /> Previous
        </button>
        <span className="text-[13px] font-medium text-[var(--label-secondary)]">Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={isLoading}
          className="ios-button ios-button-gray h-10 px-4"
        >
          Next 5 <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}

const TAGS = ['Hook', 'Body', 'Call-to-Action'];

function HistoryView({ user }: { user: any }) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'Recent' | 'Highest Rated'>('Recent');
  const [filterTag, setFilterTag] = useState<string>('');

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'prompts'), 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTag = async (id: string, tag: string) => {
    await updateDoc(doc(db, 'prompts', id), { tag });
    setHistory(history.map(h => h.id === id ? { ...h, tag } : h));
  };

  const updateRating = async (id: string, rating: number) => {
    await updateDoc(doc(db, 'prompts', id), { rating });
    setHistory(history.map(h => h.id === id ? { ...h, rating } : h));
  };

  let displayed = history;
  if (filterTag) {
    displayed = displayed.filter(h => h.tag === filterTag);
  }
  if (sortBy === 'Highest Rated') {
    displayed = [...displayed].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    displayed = [...displayed].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          {['Recent', 'Highest Rated'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors",
                sortBy === sort 
                  ? "bg-[var(--label-primary)] text-[var(--bg-primary)] border-[var(--label-primary)]" 
                  : "bg-transparent border-[var(--separator)] text-[var(--label-secondary)]"
              )}
            >
              {sort}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Tag size={16} className="text-[var(--label-tertiary)]" />
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-transparent border border-[var(--separator)] rounded-lg text-[13px] px-2 py-1.5 outline-none"
          >
            <option value="">All Tags</option>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Sparkle className="animate-spin text-[var(--label-tertiary)]" size={24} /></div>
        ) : displayed.length === 0 ? (
          <div className="text-center p-8 text-[var(--label-secondary)] text-[15px]">No prompts found.</div>
        ) : (
          displayed.map((item) => (
            <div key={item.id} className="bg-[var(--bg-tertiary)] ios-card p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="text-[15px] font-medium line-clamp-2">"{item.input}"</div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      weight={star <= (item.rating || 0) ? "fill" : "regular"}
                      className={star <= (item.rating || 0) ? "text-yellow-500" : "text-[var(--separator)]"}
                      size={16}
                      onClick={() => updateRating(item.id, star)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg max-h-32 overflow-y-auto text-[13px] text-[var(--label-secondary)] font-mono">
                {item.result.substring(0, 150)}...
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {TAGS.map(t => (
                    <button
                      key={t}
                      onClick={() => updateTag(item.id, item.tag === t ? '' : t)}
                      className={cn(
                        "text-[11px] font-semibold px-2 py-1 rounded-md transition-colors",
                        item.tag === t 
                          ? "bg-[var(--accent)] text-white" 
                          : "bg-[var(--bg-secondary)] text-[var(--label-secondary)] hover:bg-[var(--separator)]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[var(--label-tertiary)]">
                  {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString() : 'Just now'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
