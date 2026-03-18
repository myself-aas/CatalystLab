'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import { INSTRUMENTS, ZONES, Session } from '@/lib/constants';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { LiteraturePanel } from '@/components/LiteraturePanel';
import { Paper, searchAll } from '@/lib/research-api';
import { getAI, MODELS } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  ArrowRight, 
  Copy, 
  Save, 
  Share2, 
  Loader2, 
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { useAuthStore } from '@/stores/authStore';
import { recordRun, getRemainingRuns } from '@/lib/trialSystem';

export default function InstrumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const initialQuery = searchParams.get('q');
  
  const router = useRouter();
  const { addSession, sessions } = useApp();
  const { user } = useAuthStore();
  
  const instrument = INSTRUMENTS.find(i => i.slug === slug);

  const [input, setInput] = useState(initialQuery || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [statusText, setStatusText] = useState('Extracting research concepts...');
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load session if ID provided
  useEffect(() => {
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setInput(session.input.text || '');
        setOutput(session.output);
        setPapers(session.papers || []);
      }
    }
  }, [sessionId, sessions]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 500)}px`;
    }
  }, [input]);

  if (!instrument) {
    notFound();
  }

  const handleRun = async () => {
    if (!input.trim() || isGenerating) return;

    // Trial check
    if (getRemainingRuns() <= 0) {
      setError("Daily run limit reached. Please try again tomorrow.");
      return;
    }

    setIsGenerating(true);
    setIsSearching(true);
    setError(null);
    setOutput(null);
    setPapers([]);
    setKeywords([]);
    setInsight('');

    try {
      const ai = getAI();
      
      // Step 1: Extract Keywords & Concepts (Parallel with main run)
      setStatusText('Extracting research concepts...');
      const extractionPromise = ai.models.generateContent({
        model: MODELS.flash,
        contents: `The user has written the following research input for the instrument "${instrument.name}":
        """
        ${input}
        """
        Extract 3 to 6 search keywords or short phrases that best represent the core research topics. These will be used to query academic databases.
        Return ONLY a valid JSON object with this exact schema:
        {
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "primaryQuery": "best single search phrase for the main topic",
          "fieldOfStudy": "detected academic field",
          "isQuestion": true
        }`,
        config: { responseMimeType: "application/json" }
      });

      // Step 2: Run Instrument Brainstorming
      setStatusText(`Thinking with ${instrument.name}...`);
      const instrumentPrompt = `You are CatalystLab's AI research assistant. You are running the instrument "${instrument.name}" (${instrument.description}).
      User Input: """${input}"""
      
      Provide a highly structured, intellectually deep brainstorming output. 
      Return ONLY a valid JSON object. 
      The structure should be specific to "${instrument.name}".
      Use keys like "coreInsights", "criticalQuestions", "noveltyScore" (0-100), "recommendations", "futureDirections".
      Be academic, precise, and creative.`;

      const brainstormingPromise = ai.models.generateContent({
        model: MODELS.flash,
        contents: instrumentPrompt,
        config: { responseMimeType: "application/json" }
      });

      // Wait for extraction to start searching
      const extractionResponse = await extractionPromise;
      const extractionData = JSON.parse(extractionResponse.text || '{}');
      setKeywords(extractionData.keywords || []);
      const searchQuery = extractionData.primaryQuery || input;

      // Start literature search
      setStatusText('Querying 9 academic databases...');
      const searchPromise = searchAll(searchQuery).then(results => {
        setPapers(results);
        setIsSearching(false);
        return results;
      }).catch(err => {
        setIsSearching(false);
        console.error("Search failed:", err);
        return [];
      });

      // Wait for brainstorming
      const brainstormingResponse = await brainstormingPromise;
      const brainstormingData = JSON.parse(brainstormingResponse.text || '{}');
      setOutput(brainstormingData);

      // Step 4: Generate Literature Insight
      const foundPapers = await searchPromise;
      if (foundPapers.length > 0) {
        setStatusText('Synthesizing literature landscape...');
        const insightResponse = await ai.models.generateContent({
          model: MODELS.flash,
          contents: `Given these research paper titles on the topic "${searchQuery}":
          ${foundPapers.slice(0, 8).map(p => `- ${p.title}`).join('\n')}
          
          Write 1-2 sentences observing the state of this literature landscape — what's well-covered, what seems missing, or what's surprising. Be specific and useful.
          Return only a plain text string.`
        });
        setInsight(insightResponse.text || '');
      }

      // Record run
      recordRun();

      // Save session
      const session: Session = {
        id: Math.random().toString(36).substring(7),
        instrumentSlug: instrument.slug,
        input: { text: input },
        output: brainstormingData,
        papers: foundPapers,
        timestamp: Date.now(),
        title: input.substring(0, 60) + (input.length > 60 ? '...' : ''),
        zone: instrument.zone as any
      };
      addSession(session);

    } catch (err: any) {
      console.error("Instrument Run Error:", err);
      setError(err.message || "An unexpected error occurred. Please check your API key.");
    } finally {
      setIsGenerating(false);
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-canvas)] overflow-hidden">
      {/* 3-PANEL LAYOUT */}
      <div className="flex flex-1 flex-col md:flex-row h-full">
        
        {/* LEFT: INPUT PANEL (35%) */}
        <div className="w-full md:w-[35%] flex flex-col border-r border-[var(--border-faint)] bg-[var(--bg-base)] overflow-y-auto">
          <div className="p-6 md:p-8 space-y-8">
            <header>
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                INSTRUMENTS / {ZONES[instrument.zone as keyof typeof ZONES].label}
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONES[instrument.zone as keyof typeof ZONES].color }} />
                <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  {ZONES[instrument.zone as keyof typeof ZONES].label}
                </span>
              </div>
              <h2 className="text-[24px] font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                {instrument.name}
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {instrument.description}
              </p>
            </header>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your research idea, hypothesis, or problem..."
                    className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-lg)] p-5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all min-h-[160px] resize-none leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      {input.length} chars
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Enter one line, a paragraph, or paste your abstract.
                </p>
              </div>

              <button
                onClick={handleRun}
                disabled={isGenerating || !input.trim()}
                className={cn(
                  "w-full h-12 flex items-center justify-center gap-2 rounded-[var(--r-md)] text-[14px] font-medium transition-all shadow-sm",
                  isGenerating 
                    ? "bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed" 
                    : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Run {instrument.name} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="text-center">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">⌘↵ to run</span>
              </div>

              {error && (
                <div className="p-4 bg-[var(--rose-muted)] border border-[var(--rose)]/20 rounded-[var(--r-lg)] flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-[var(--rose)] mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-[var(--rose)] leading-relaxed">{error}</p>
                </div>
              )}

              {keywords.length > 0 && (
                <div className="pt-8 border-t border-[var(--border-faint)] space-y-4">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Detected Concepts</span>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-[var(--accent-subtle)] text-[var(--accent)] text-[11px] rounded-full font-medium border border-[var(--accent)]/10">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: AI OUTPUT PANEL (38%) */}
        <div className="w-full md:w-[38%] flex flex-col bg-[var(--bg-base)] overflow-y-auto border-r border-[var(--border-faint)]">
          <div className="p-6 md:p-10 min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              {!output && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-[var(--text-tertiary)]">
                    <FlaskConical className="w-7 h-7" />
                  </div>
                  <h3 className="text-[17px] font-medium text-[var(--text-primary)] mb-2">Output will appear here</h3>
                  <p className="text-[14px] text-[var(--text-secondary)] max-w-[280px] leading-relaxed">
                    Your research literature will load automatically alongside the AI results.
                  </p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="flex gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase tracking-[0.2em] block">
                      {statusText}
                    </span>
                    <p className="text-[12px] text-[var(--text-tertiary)]">This usually takes 5-10 seconds</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Output</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={handleCopy} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all" title="Copy JSON"><Copy className="w-4 h-4" /></button>
                      <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all" title="Save Report"><Save className="w-4 h-4" /></button>
                      <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-all" title="Share"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {Object.entries(output).map(([key, value]: [string, any], i) => {
                      if (key === 'noveltyScore') {
                        return (
                          <div key={key} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-6 flex items-center justify-between">
                            <div>
                              <h4 className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Novelty Score</h4>
                              <p className="text-[13px] text-[var(--text-secondary)]">Estimated intellectual uniqueness</p>
                            </div>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                                <motion.circle 
                                  cx="32" cy="32" r="28" fill="none" stroke="var(--accent)" strokeWidth="4" 
                                  strokeDasharray="175.9"
                                  initial={{ strokeDashoffset: 175.9 }}
                                  animate={{ strokeDashoffset: 175.9 - (175.9 * (Number(value) || 0)) / 100 }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                              </svg>
                              <span className="absolute text-[14px] font-mono font-bold text-[var(--text-primary)]">{value}</span>
                            </div>
                          </div>
                        );
                      }
                      
                      const isCritical = key.toLowerCase().includes('critical') || key.toLowerCase().includes('challenge');
                      const isInsight = key.toLowerCase().includes('insight') || key.toLowerCase().includes('recommendation');

                      return (
                        <motion.div 
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "pl-6 py-1 border-l-2",
                            isCritical ? "border-[var(--rose)] bg-[var(--rose-muted)]/5" : 
                            isInsight ? "border-[var(--emerald)] bg-[var(--emerald-subtle)]/5" : 
                            "border-[var(--accent)]"
                          )}
                        >
                          <h4 className="text-[11px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="text-[15px] text-[var(--text-primary)] leading-relaxed prose prose-invert max-w-none">
                            {Array.isArray(value) ? (
                              <ul className="space-y-2 list-disc pl-4">
                                {value.map((item, idx) => (
                                  <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                                ))}
                              </ul>
                            ) : typeof value === 'object' ? (
                              <pre className="bg-[var(--bg-sunken)] p-3 rounded-[var(--r-md)] text-[12px] font-mono overflow-x-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            ) : (
                              <p>{value}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <footer className="pt-12 border-t border-[var(--border-faint)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
                        Gemini 2.5 Flash · {papers.length} papers found
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: LITERATURE PANEL (27%) */}
        <div className="hidden md:block w-[27%] bg-[var(--bg-elevated)] overflow-y-auto border-l border-[var(--border-faint)]">
          <LiteraturePanel 
            papers={papers} 
            isLoading={isSearching} 
            insight={insight}
          />
        </div>

      </div>
    </div>
  );
}
