'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Loader2, 
  Filter, 
  Database, 
  Heart, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  BookOpen, 
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  FolderOpen,
  Milestone,
  Check,
  Award,
  Globe,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResearchResult } from '../../../lib/types';
import { normalizeSourceName } from '../../../lib/synthesisPromptTemplate';
import { ResponsiveShell } from '../../../components/ResponsiveShell';
import { OrchestrationTicker } from '../../../components/OrchestrationTicker';

const ALL_SOURCES = [
  'Semantic Scholar', 'OpenAlex', 'arXiv', 'PubMed', 
  'CORE', 'Crossref', 'Europe PMC', 'DOAJ', 
  'Zenodo', 'DataCite', 'Unpaywall', 'Figshare', 
  'HDX', 'OpenAIRE', 'NASA ADS', 'Exa AI', 'Tavily'
];

const PRESETS = [
  { name: 'All Sources', list: [] },
  { name: 'Open Access Indexes', list: ['OpenAlex', 'CORE', 'DOAJ', 'Unpaywall', 'OpenAIRE'] },
  { name: 'Biomedical & Medical', list: ['PubMed', 'Europe PMC', 'Semantic Scholar'] },
  { name: 'Data & Physics preprints', list: ['arXiv', 'Zenodo', 'DataCite', 'Figshare', 'NASA ADS'] },
  { name: 'Humanitarian & Crisis', list: ['HDX', 'Tavily', 'Zenodo', 'Exa AI'] }
];

export default function DataExplorer() {
  // Query & Fetch States
  const [query, setQuery] = useState('Sustainable solar hydrogen production');
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orchestratorStatus, setOrchestratorStatus] = useState("System Idle");
  const [orchestrationStats, setOrchestrationStats] = useState<Record<string, number> | undefined>(undefined);

  // Time-Gating Filter Layers
  const [timeGatingEnabled, setTimeGatingEnabled] = useState(true);
  const [timeGateRange, setTimeGateRange] = useState<string>('3-years'); // '3-years', '5-years', '10-years', 'all'

  // Client-Side Interaction & Filter States
  const [clientSearch, setClientSearch] = useState('');
  const [sourceFilters, setSourceFilters] = useState<string[]>([]);
  const [datasetOnly, setDatasetOnly] = useState(false);
  const [humanitarianOnly, setHumanitarianOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'year' | 'citations' | 'title'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showSourcesDrawer, setShowSourcesDrawer] = useState(false);

  // Advanced Filters State
  const [minCitations, setMinCitations] = useState<number>(0);
  const [pubTypeFilter, setPubTypeFilter] = useState<'all' | 'peer-reviewed' | 'preprint'>('all');
  const [journalFilter, setJournalFilter] = useState<string>('all');
  const [journalSearch, setJournalSearch] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true);

  // Initial lookup on paint
  useEffect(() => {
    executeSearch();
  }, []);

  const handlePresetSelect = (list: string[]) => {
    setActiveSources(list);
  };

  const getTimeGateDate = () => {
    const now = new Date();
    if (timeGateRange === '3-years') {
      return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()).toISOString();
    } else if (timeGateRange === '5-years') {
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString();
    } else if (timeGateRange === '10-years') {
      return new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()).toISOString();
    }
    return undefined;
  };

  const executeSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setOrchestratorStatus("Initializing API Workers...");

    const statusIntervals = [
      { text: "Connecting to open access indexes...", delay: 800 },
      { text: "Querying Semantic Scholar & OpenAlex...", delay: 1800 },
      { text: "Crawling PubMed, Crossref & Europe PMC...", delay: 3000 },
      { text: "Filtering 3-Year Time-Gated Data...", delay: 4200 },
      { text: "Resolving metadata duplicates...", delay: 5500 },
      { text: "Consolidating 17 independent scholarly nodes...", delay: 6800 },
      { text: "Finalizing retrieval pipeline...", delay: 8000 }
    ];

    const timeouts = statusIntervals.map(step => 
      setTimeout(() => setOrchestratorStatus(step.text), step.delay)
    );

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          enabledSources: activeSources,
          timeGate: timeGatingEnabled && timeGateRange !== 'all' ? getTimeGateDate() : undefined,
          timeGatingEnabled: timeGatingEnabled && timeGateRange !== 'all'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results || []);
      setOrchestrationStats(data.stats);
      setOrchestratorStatus("Analysis Complete! Displaying indexed records.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Fatal exception during data execution routing.');
      setOrchestratorStatus("Crawl Failed / Network Terminated.");
    } finally {
      timeouts.forEach(id => clearTimeout(id));
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  // Check if a paper matches Open Access criteria
  const isOpenAccess = (paper: ResearchResult): boolean => {
    if (paper.source === 'DOAJ' || paper.source === 'Unpaywall') return true;
    if (paper.sourceSpecific?.openalex?.isOa) return true;
    if (paper.sourceSpecific?.unpaywall?.isOa) return true;
    if (paper.sourceSpecific?.semanticScholar?.isOpenAccess) return true;
    return false;
  };

  // Detect and tag ResearchResults based on the criteria
  const processedResults = useMemo(() => {
    return results.map(paper => {
      // Clean normalized source name
      const cleanSource = normalizeSourceName(paper.source);
      
      // Strict dataset detection heuristics
      const isDataset = 
        cleanSource === 'Zenodo' || 
        cleanSource === 'DataCite' || 
        cleanSource === 'Figshare' || 
        paper.sourceSpecific?.crossref?.type?.toLowerCase().includes('dataset') || 
        paper.title.toLowerCase().match(/(dataset|database|repository|codebase|data corpus)/i) !== null || 
        paper.abstract?.toLowerCase().match(/(downloadable dataset|csv archive|raw data files)/i) !== null;

      // Strict humanitarian focus detection heuristics
      const isHumanitarian = 
        cleanSource === 'HDX' || 
        paper.title.toLowerCase().match(/(humanitarian|disaster|refugee|crisis|famine|unicef|ocha|flood|earthquake|outbreak|vulnerability|epidemic|sanitation|sustainable|poverty)/i) !== null || 
        paper.abstract?.toLowerCase().match(/(humanitarian relief|disaster response|crisis mapping|refugee camp|forced migration)/i) !== null;

      const isOa = isOpenAccess(paper);

      // Extract journal/venue name helper
      const journalName = (
        paper.sourceSpecific?.pubmed?.journal ||
        paper.sourceSpecific?.crossref?.containerTitle ||
        paper.sourceSpecific?.openalex?.hostVenue ||
        ''
      ).trim();

      // Extract pub type helper (peer-reviewed vs. preprint)
      const cleanSourceLower = cleanSource.toLowerCase();
      const typeLower = paper.sourceSpecific?.crossref?.type?.toLowerCase() || '';
      let pubType: 'peer-reviewed' | 'preprint' = 'peer-reviewed';
      if (
        cleanSourceLower === 'arxiv' || 
        typeLower.includes('preprint') || 
        cleanSourceLower === 'zenodo' || 
        cleanSourceLower === 'figshare'
      ) {
        pubType = 'preprint';
      }

      return {
        ...paper,
        isDataset,
        isHumanitarian,
        isOa,
        cleanSource,
        journalName,
        pubType
      };
    });
  }, [results]);

  // Apply sequential client-side filters
  const filteredResults = useMemo(() => {
    let output = [...processedResults];

    // Source Filter Chips
    if (sourceFilters.length > 0) {
      output = output.filter(p => sourceFilters.includes(p.cleanSource));
    }

    // Dataset Only Switch
    if (datasetOnly) {
      output = output.filter(p => p.isDataset);
    }

    // Humanitarian Switch
    if (humanitarianOnly) {
      output = output.filter(p => p.isHumanitarian);
    }

    // Advanced Citation Count Threshold Filter
    if (minCitations > 0) {
      output = output.filter(p => (p.citationCount || 0) >= minCitations);
    }

    // Advanced Publication Type Filter
    if (pubTypeFilter !== 'all') {
      output = output.filter(p => p.pubType === pubTypeFilter);
    }

    // Advanced Academic Journal Name Filter (exact or substring)
    if (journalFilter !== 'all') {
      output = output.filter(p => p.journalName.toLowerCase() === journalFilter.toLowerCase());
    }
    if (journalSearch.trim()) {
      const q = journalSearch.toLowerCase();
      output = output.filter(p => p.journalName.toLowerCase().includes(q));
    }

    // Client search keyword matching (Title, Authors, Abstract)
    if (clientSearch.trim()) {
      const kw = clientSearch.toLowerCase();
      output = output.filter(p => 
        p.title.toLowerCase().includes(kw) || 
        p.authors.toLowerCase().includes(kw) || 
        p.abstract?.toLowerCase().includes(kw) ||
        p.cleanSource.toLowerCase().includes(kw)
      );
    }

    // Sorting block
    output.sort((a, b) => {
      let valA: any = a[sortBy === 'citations' ? 'citationCount' : sortBy] || 0;
      let valB: any = b[sortBy === 'citations' ? 'citationCount' : sortBy] || 0;

      if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return output;
  }, [
    processedResults, 
    sourceFilters, 
    datasetOnly, 
    humanitarianOnly, 
    clientSearch, 
    sortBy, 
    sortOrder,
    minCitations,
    pubTypeFilter,
    journalFilter,
    journalSearch
  ]);

  // Identify all distinct sources loaded in results for Choice Chip filters
  const availableFilters = useMemo(() => {
    const list = processedResults.map(p => p.cleanSource);
    return Array.from(new Set(list)).sort();
  }, [processedResults]);

  // Identify all distinct journals/venues loaded in results
  const availableJournals = useMemo(() => {
    const list = processedResults
      .map(p => p.journalName)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    return Array.from(new Set(list)).sort();
  }, [processedResults]);

  // Dynamic upper limit for citations in the current results
  const maxCitationsInResults = useMemo(() => {
    if (processedResults.length === 0) return 100;
    const maxVal = Math.max(...processedResults.map(p => p.citationCount || 0));
    return maxVal > 0 ? maxVal : 100;
  }, [processedResults]);

  // Calculate high-fidelity aggregated statistics
  const stats = useMemo(() => {
    if (filteredResults.length === 0) return { total: 0, oaPercent: 0, avgCitations: 0, datasetCount: 0, humCount: 0 };
    const oaCount = filteredResults.filter(p => p.isOa).length;
    const datasetCount = filteredResults.filter(p => p.isDataset).length;
    const humCount = filteredResults.filter(p => p.isHumanitarian).length;
    const totalCitations = filteredResults.reduce((sum, p) => sum + (p.citationCount || 0), 0);

    return {
      total: filteredResults.length,
      oaPercent: Math.round((oaCount / filteredResults.length) * 100),
      avgCitations: Math.round(totalCitations / filteredResults.length),
      datasetCount,
      humCount
    };
  }, [filteredResults]);

  const toggleSourceFilter = (src: string) => {
    setSourceFilters(prev => 
      prev.includes(src) ? prev.filter(x => x !== src) : [...prev, src]
    );
  };

  const toggleSort = (type: 'year' | 'citations' | 'title') => {
    if (sortBy === type) {
      setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  const filterArea = (
    <div className="space-y-6 select-none" id="data-explorer-root">
      {/* 1. Header Area with dynamic scannable counts */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="data-explorer-header">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[1.25rem] bg-[#C6EFCE] flex items-center justify-center border border-[#68BA7F]/30" id="data-explorer-icon">
              <Database className="w-5 h-5 text-[#1E4D2B]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#191E1A] font-sans md:text-3xl">Research Data Explorer</h1>
          </div>
          <p className="text-sm text-[#434842] leading-relaxed max-w-2xl font-medium">
            Search, filter, and isolate peer-reviewed publications, preprints, datasets, and humanitarian research across 17 unified academic index providers.
          </p>
        </div>
        
        {/* Active Query Status Indicator */}
        <div className="flex items-center gap-2 text-xs bg-[#FAFDF6] border border-[#68BA7F]/20 px-3.5 py-2 rounded-full font-mono text-[#1E4D2B] shadow-sm self-start md:self-auto">
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#1E4D2B] animate-spin" />
              <span>Querying index and filtering results...</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-[#1E4D2B]" />
              <span>{filteredResults.length} publication{filteredResults.length !== 1 ? 's' : ''} active</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Main Search Formulation Panel */}
      <div className="bg-white rounded-[1.5rem] border border-[#68BA7F]/15 p-5 md:p-6 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#434842]/70" />
            <input 
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Query any hypothesis, researcher name, DOI, or clinical study..."
              className="w-full pl-12 pr-4 py-3.5 rounded-[1.25rem] bg-[#FAFDF6] border border-[#68BA7F]/25 text-[#191E1A] placeholder:text-[#434842]/50 focus:outline-none focus:border-[#1E4D2B] focus:ring-1 focus:ring-[#1E4D2B] font-medium text-sm transition-all shadow-inner"
              id="search-input-field"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSourcesDrawer(!showSourcesDrawer)}
              className={`px-4 rounded-[1.25rem] border font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 py-3 sm:py-0 ${
                activeSources.length > 0 
                  ? 'bg-[#C6EFCE] border-[#68BA7F]/30 text-[#002206]' 
                  : 'bg-white border-[#68BA7F]/20 text-[#434842] hover:bg-[#FAFDF6]'
              }`}
              title="Filter network crawl domains"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sources {activeSources.length > 0 ? `(${activeSources.length})` : '(All)'}</span>
            </button>
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3.5 bg-[#1E4D2B] hover:bg-[#14351D] text-white font-bold text-xs uppercase tracking-wider rounded-[1.25rem] transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px] shadow-sm select-none hover:shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retrieve'}
            </button>
          </div>
        </form>

        {/* Time-Gating Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-[#FAFDF6] border border-[#68BA7F]/10 rounded-[1.25rem] p-3 text-xs text-[#434842]">
          <div className="flex items-center gap-2 font-semibold text-[#1E4D2B]">
            <Calendar className="w-4 h-4 text-[#1E4D2B]" />
            <span>Time-Gating Layer:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTimeGatingEnabled(!timeGatingEnabled)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all border text-[10px] uppercase tracking-wider select-none ${
                timeGatingEnabled 
                  ? 'bg-[#1E4D2B] border-[#1E4D2B] text-white shadow-sm' 
                  : 'bg-white border-[#68BA7F]/20 text-[#434842] hover:bg-[#FAFDF6]'
              }`}
            >
              {timeGatingEnabled ? 'Active' : 'Bypassed'}
            </button>
          </div>
          {timeGatingEnabled && (
            <div className="flex flex-wrap gap-1.5 ml-auto sm:ml-0">
              {[
                { label: 'Last 3 Years', value: '3-years' },
                { label: 'Last 5 Years', value: '5-years' },
                { label: 'Last 10 Years', value: '10-years' },
                { label: 'All-Time Release', value: 'all' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeGateRange(opt.value)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all border text-[10px] select-none ${
                    timeGateRange === opt.value
                      ? 'bg-[#C6EFCE] border-[#68BA7F]/35 text-[#002206]'
                      : 'bg-white border-[#68BA7F]/15 text-[#434842] hover:bg-[#C6EFCE]/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <span className="text-[10px] text-[#434842]/60 ml-auto hidden md:inline-block italic">
            {timeGatingEnabled 
              ? `Filtering items published prior to ${timeGateRange === 'all' ? 'creation' : timeGateRange.replace('-',' ')}.`
              : 'Warning: querying wide timeframes increases execution payload and citation noise.'}
          </span>
        </div>

        {/* M3 Style Sources Drawer Panel */}
        <AnimatePresence>
          {showSourcesDrawer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#68BA7F]/15 pt-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E4D2B]">Select Database Crawlers</span>
                <span className="text-[11px] text-[#434842] font-semibold">Only active targets will be searched to minimize latency.</span>
              </div>

              {/* Source Quick Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-bold text-[#434842]/75 self-center mr-1">Presets:</span>
                {PRESETS.map((p) => {
                  const isCurrent = activeSources.length === p.list.length && p.list.every(x => activeSources.includes(x));
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handlePresetSelect(p.list)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                        isCurrent 
                          ? 'bg-[#1E4D2B] border-[#1E4D2B] text-white' 
                          : 'bg-[#FAFDF6] border-[#68BA7F]/20 text-[#434842] hover:bg-[#C6EFCE]/30'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Grid of the 17 Available API Source Walkers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
                {ALL_SOURCES.map((src) => {
                  const isSelected = activeSources.length === 0 || activeSources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        setActiveSources(prev => {
                          if (prev.includes(src)) {
                            // If it's the last one being deselected, revert to empty (all)
                            const next = prev.filter(x => x !== src);
                            return next;
                          } else {
                            return [...prev, src];
                          }
                        });
                      }}
                      className={`flex items-center justify-between text-xs font-semibold px-3 py-2.5 rounded-[0.75rem] border transition-all ${
                        isSelected 
                          ? 'bg-[#FAFDF6] border-[#1E4D2B] text-[#1E4D2B] ring-1 ring-[#1E4D2B]'
                          : 'bg-white border-[#68BA7F]/15 text-[#434842]/60 hover:bg-[#FAFDF6]'
                      }`}
                    >
                      <span>{src}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center overflow-hidden mr-0.5 ${
                        isSelected ? 'bg-[#1E4D2B] border-[#1E4D2B] text-white' : 'border-[#434842]/30 bg-transparent'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const mainContent = (
    <div className="space-y-6">
      <OrchestrationTicker 
        status={loading ? orchestratorStatus : "System Idle — Ready to execute network crawls"} 
        stats={loading ? undefined : orchestrationStats} 
      />

      {/* 3. Aggregated Metadata Statistics Dashboard */}
      {processedResults.length > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="stats-dashboard">
          <div className="bg-white p-4 rounded-[1.25rem] border border-[#68BA7F]/15 space-y-1 shadow-sm text-center md:text-left">
            <span className="text-[10px] text-[#434842]/85 font-mono uppercase font-bold tracking-wider">Indexed Output</span>
            <div className="text-xl font-bold tracking-tight text-[#191E1A] font-mono">{stats.total} Papers</div>
          </div>
          <div className="bg-white p-4 rounded-[1.25rem] border border-[#68BA7F]/15 space-y-1 shadow-sm text-center md:text-left">
            <span className="text-[10px] text-[#434842]/85 font-mono uppercase font-bold tracking-wider">Open Access Index</span>
            <div className="text-xl font-bold tracking-tight text-[#1E4D2B] font-mono">{stats.oaPercent}% Free Doc</div>
          </div>
          <div className="bg-white p-4 rounded-[1.25rem] border border-[#68BA7F]/15 space-y-1 shadow-sm text-center md:text-left">
            <span className="text-[10px] text-[#434842]/85 font-mono uppercase font-bold tracking-wider">Cohort Datasets</span>
            <div className="text-xl font-bold tracking-tight text-blue-600 font-mono">{stats.datasetCount} Datasets</div>
          </div>
          <div className="bg-white p-4 rounded-[1.25rem] border border-[#68BA7F]/15 space-y-1 shadow-sm text-center md:text-left">
            <span className="text-[10px] text-[#434842]/85 font-mono uppercase font-bold tracking-wider">Humanitarian Nodes</span>
            <div className="text-xl font-bold tracking-tight text-red-600 font-mono">{stats.humCount} Records</div>
          </div>
          <div className="bg-white p-4 rounded-[1.25rem] border border-[#68BA7F]/15 space-y-1 shadow-sm text-center md:text-left col-span-2 md:col-span-1">
            <span className="text-[10px] text-[#434842]/85 font-mono uppercase font-bold tracking-wider">Average Citations</span>
            <div className="text-xl font-bold tracking-tight text-[#191E1A] font-mono">{stats.avgCitations} Citations</div>
          </div>
        </div>
      )}

      {/* 4. Filter, Toggle, and Sort controls */}
      {processedResults.length > 0 && !loading && (
        <div className="bg-white rounded-[1.5rem] border border-[#68BA7F]/15 p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Instant Sub-Filter Search */}
            <div className="relative max-w-sm w-full">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#434842]/60" />
              <input 
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Client-side keyword filtration..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAFDF6] border border-[#68BA7F]/20 text-xs font-semibold text-[#191E1A] focus:outline-none focus:border-[#1E4D2B]"
              />
            </div>

            {/* M3 Toggle Controls for Dataset & Humanitarian metrics */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Dataset Only Toggle */}
              <label className="inline-flex items-center gap-2 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={datasetOnly}
                  onChange={e => setDatasetOnly(e.target.checked)}
                  className="sr-only" 
                />
                {/* M3 Pill Switch */}
                <div className={`w-11 h-6 rounded-full p-1 transition-all duration-200 border ${
                  datasetOnly 
                    ? 'bg-[#1E4D2B] border-[#1E4D2B]' 
                    : 'bg-[#FAFDF6] border-[#68BA7F]/30'
                }`}>
                  <div className={`w-4 h-4 rounded-full transition-all duration-200 transform ${
                    datasetOnly ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#434842]/70'
                  }`} />
                </div>
                <span className="text-xs font-bold text-[#434842] group-hover:text-[#191E1A] flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Dataset Only
                </span>
              </label>

              {/* Humanitarian Only Toggle */}
              <label className="inline-flex items-center gap-2 cursor-pointer group select-none">
                <input 
                  type="checkbox"
                  checked={humanitarianOnly}
                  onChange={e => setHumanitarianOnly(e.target.checked)}
                  className="sr-only"
                />
                {/* M3 Pill Switch */}
                <div className={`w-11 h-6 rounded-full p-1 transition-all duration-200 border ${
                  humanitarianOnly
                    ? 'bg-[#1E4D2B] border-[#1E4D2B]'
                    : 'bg-[#FAFDF6] border-[#68BA7F]/30'
                }`}>
                  <div className={`w-4 h-4 rounded-full transition-all duration-200 transform ${
                    humanitarianOnly ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#434842]/70'
                  }`} />
                </div>
                <span className="text-xs font-bold text-[#434842] group-hover:text-[#191E1A] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  Humanitarian Only
                </span>
              </label>

              {/* Sorting triggers */}
              <div className="flex items-center gap-1.5 bg-[#FAFDF6] p-1 rounded-xl border border-[#68BA7F]/15">
                <button
                  onClick={() => toggleSort('year')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    sortBy === 'year' 
                      ? 'bg-[#C6EFCE] text-[#002206]' 
                      : 'text-[#434842] hover:bg-[#E0E5DF]'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Year</span>
                  {sortBy === 'year' && <ArrowUpDown className="w-2.5 h-2.5 ml-0.5" />}
                </button>
                <button
                  onClick={() => toggleSort('citations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    sortBy === 'citations'
                      ? 'bg-[#C6EFCE] text-[#002206]'
                      : 'text-[#434842] hover:bg-[#E0E5DF]'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>Citations</span>
                  {sortBy === 'citations' && <ArrowUpDown className="w-2.5 h-2.5 ml-0.5" />}
                </button>
                <button
                  onClick={() => toggleSort('title')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    sortBy === 'title'
                      ? 'bg-[#C6EFCE] text-[#002206]'
                      : 'text-[#434842] hover:bg-[#E0E5DF]'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Title</span>
                  {sortBy === 'title' && <ArrowUpDown className="w-2.5 h-2.5 ml-0.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Advanced Scientific Filters Panel */}
          <div className="border-t border-[#68BA7F]/15 pt-4">
            <div className="flex items-center gap-2 mb-3 cursor-pointer select-none" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <SlidersHorizontal className="w-4 h-4 text-[#1E4D2B]" />
              <span className="text-xs font-bold text-[#1E4D2B] uppercase tracking-wider">Advanced Filters Layer</span>
              <span className="text-[10px] text-[#434842]/70 font-mono bg-[#FAFDF6] px-1.5 py-0.5 rounded border border-[#68BA7F]/15 ml-1">
                Citation, Journal & Peer-Review Bounds
              </span>
              <div className="ml-auto">
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4 text-[#1E4D2B]" /> : <ChevronDown className="w-4 h-4 text-[#1E4D2B]" />}
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 text-[#253D2C] overflow-hidden"
                >
                  {/* 1. Citation Count Threshold Filter */}
                  <div className="space-y-2 bg-[#FAFDF6]/60 p-4 rounded-2xl border border-[#68BA7F]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#1E4D2B] uppercase tracking-wide flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Min Citation Threshold
                      </span>
                      <span className="text-xs font-mono font-bold bg-[#C6EFCE] text-[#002206] px-2 py-0.5 rounded-full">
                        {minCitations} citations
                      </span>
                    </div>
                    
                    {/* Range slider styled styled meticulously to match CatalystLab aesthetics */}
                    <div className="space-y-1">
                      <input 
                        type="range"
                        min="0"
                        max={maxCitationsInResults}
                        value={minCitations}
                        onChange={e => setMinCitations(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-[#68BA7F]/20 rounded-lg appearance-none cursor-pointer accent-[#1E4D2B] transition-all"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-[#434842]/65 font-bold">
                        <span>0 citations</span>
                        <span>{Math.floor(maxCitationsInResults / 2)}</span>
                        <span>{maxCitationsInResults} max</span>
                      </div>
                    </div>

                    {/* Pre-calibrated preset helper buttons */}
                    <div className="flex gap-1 pt-1 flex-wrap">
                      {[
                        { label: 'Any', value: 0 },
                        { label: '5+ Cit.', value: 5 },
                        { label: '20+ Cit.', value: 20 },
                        { label: '100+ Cit.', value: 100 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setMinCitations(Math.min(item.value, maxCitationsInResults))}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition-all border ${
                            minCitations === item.value
                              ? 'bg-[#1E4D2B] text-white border-[#1E4D2B]'
                              : 'bg-white border-[#68BA7F]/15 text-[#434842]/80 hover:bg-[#C6EFCE]/30'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Publication Type Selector */}
                  <div className="space-y-2 bg-[#FAFDF6]/60 p-4 rounded-2xl border border-[#68BA7F]/10">
                    <span className="text-[11px] font-bold text-[#1E4D2B] uppercase tracking-wide flex items-center gap-1 flex-wrap">
                      <FileText className="w-3.5 h-3.5" />
                      Publication Type Channel
                    </span>

                    <div className="flex flex-col gap-1.5 pt-1">
                      {[
                        { label: 'All Publications', value: 'all', desc: 'Preprints & peer-reviewed' },
                        { label: 'Peer-Reviewed Only', value: 'peer-reviewed', desc: 'PubMed, DOAJ, OpenAlex validated' },
                        { label: 'Preprints & Drafts Only', value: 'preprint', desc: 'arXiv, Zenodo & pre-pubs' }
                      ].map((item) => {
                        const isSelected = pubTypeFilter === item.value;
                        const paperCount = item.value === 'all' 
                          ? processedResults.length 
                          : processedResults.filter(p => p.pubType === item.value).length;

                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setPubTypeFilter(item.value as any)}
                            className={`w-full text-left p-2 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#C6EFCE] border-[#68BA7F]/40 text-[#002206] shadow-sm font-bold'
                                : 'bg-white border-[#68BA7F]/10 text-[#434842] hover:bg-[#FAFDF6]'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#1E4D2B]' : 'bg-zinc-300'}`} />
                                {item.label}
                              </div>
                              <div className="text-[9px] text-[#434842]/70 font-medium pl-3.5">{item.desc}</div>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold bg-black/5 px-1.5 py-0.5 rounded-full mr-1">
                              {paperCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Specific Academic Journal Filtering */}
                  <div className="space-y-2 bg-[#FAFDF6]/60 p-4 rounded-2xl border border-[#68BA7F]/10">
                    <span className="text-[11px] font-bold text-[#1E4D2B] uppercase tracking-wide flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Journal / Venue Filter
                    </span>

                    <div className="space-y-2 pt-1">
                      {/* Dropdown menu */}
                      <select
                        value={journalFilter}
                        onChange={e => setJournalFilter(e.target.value)}
                        className="w-full text-xs p-2.5 border border-[#68BA7F]/25 bg-white text-[#253D2C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] font-medium cursor-pointer"
                      >
                        <option value="all">🌐 All Academic Venues ({availableJournals.length} detected)</option>
                        {availableJournals.map(journal => {
                          const count = processedResults.filter(p => p.journalName === journal).length;
                          return (
                            <option key={journal} value={journal}>
                              {journal.length > 50 ? `${journal.substring(0, 50)}...` : journal} ({count})
                            </option>
                          );
                        })}
                      </select>

                      {/* Text filtering input */}
                      <div className="relative">
                        <input 
                          type="text"
                          value={journalSearch}
                          onChange={e => setJournalSearch(e.target.value)}
                          placeholder="Type to search journal name..."
                          className="w-full pl-3 pr-8 py-2 border border-[#68BA7F]/20 text-[11px] font-semibold text-[#191E1A] bg-white rounded-xl focus:outline-none focus:border-[#1E4D2B] placeholder:text-[#434842]/45"
                        />
                        {journalSearch && (
                          <button
                            type="button"
                            onClick={() => setJournalSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-red-500 hover:text-red-700"
                            title="Clear search query"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Quick chips of journals */}
                      {availableJournals.slice(0, 3).length > 0 && (
                        <div className="flex gap-1.5 flex-wrap items-center">
                          <span className="text-[9px] font-bold text-[#434842]/80">Quick:</span>
                          {availableJournals.slice(0, 3).map(journal => {
                            const isSelected = journalFilter === journal;
                            const label = journal.length > 12 ? `${journal.substring(0, 12)}...` : journal;
                            return (
                              <button
                                key={journal}
                                type="button"
                                onClick={() => setJournalFilter(isSelected ? 'all' : journal)}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all border ${
                                  isSelected
                                    ? 'bg-[#1E4D2B] text-white border-[#1E4D2B]'
                                    : 'bg-white border-[#68BA7F]/15 text-[#434842]/80 hover:bg-[#C6EFCE]/30'
                                }`}
                                title={journal}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clear advanced warning */}
            {(minCitations > 0 || pubTypeFilter !== 'all' || journalFilter !== 'all' || journalSearch) && (
              <div className="flex items-center justify-between mt-3 bg-[#FAFDF6] border border-orange-200/40 p-2 rounded-xl text-[10px] text-[#434842]">
                <span className="font-semibold text-orange-900 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                  Advanced filters are currently filtering search results.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMinCitations(0);
                    setPubTypeFilter('all');
                    setJournalFilter('all');
                    setJournalSearch('');
                  }}
                  className="font-bold text-[#1E4D2B] hover:underline uppercase tracking-wider"
                >
                  Reset Advanced Filters
                </button>
              </div>
            )}
          </div>

          {/* Source filter choices */}
          {availableFilters.length > 0 && (
            <div className="border-t border-[#68BA7F]/15 pt-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#434842] mr-2">Loaded Databases:</span>
                {availableFilters.map(src => {
                  const isFiltered = sourceFilters.includes(src);
                  const paperCount = processedResults.filter(p => p.cleanSource === src).length;
                  return (
                    <button
                      key={src}
                      onClick={() => toggleSourceFilter(src)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 border ${
                        isFiltered 
                          ? 'bg-[#C6EFCE] border-[#68BA7F]/40 text-[#002206] ring-1 ring-[#1E4D2B]' 
                          : 'bg-[#FAFDF6] border-[#68BA7F]/15 text-[#434842]/80 hover:bg-[#C6EFCE]/30'
                      }`}
                    >
                      {src}
                      <span className="bg-black/5 px-1 py-0.2 rounded-full text-[9px] font-mono font-extrabold">{paperCount}</span>
                    </button>
                  );
                })}
                {sourceFilters.length > 0 && (
                  <button
                    onClick={() => setSourceFilters([])}
                    className="text-[10px] font-bold text-red-600 hover:underline ml-2"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Literature Results Output List (M3 Card Architecture) */}
      <div className="space-y-4" id="search-results-list">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="space-y-4" id="loading-container">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="p-5 rounded-[1.5rem] bg-white border border-[#68BA7F]/15 space-y-4 shadow-sm animate-pulse"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-[#68BA7F]/10 rounded-md w-3/4"></div>
                    <div className="h-3 bg-[#68BA7F]/5 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-[#68BA7F]/10 rounded-full w-20"></div>
                </div>
                <div className="space-y-2 pt-2 border-t border-[#68BA7F]/5">
                  <div className="h-3 bg-[#68BA7F]/5 rounded w-full"></div>
                  <div className="h-3 bg-[#68BA7F]/5 rounded w-full"></div>
                  <div className="h-3 bg-[#68BA7F]/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Notification Card */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-[1.5rem] p-6 space-y-3 shadow-sm text-center">
            <h3 className="font-bold text-base">Retrieval Exception Detected</h3>
            <p className="text-xs text-red-800 font-medium max-w-lg mx-auto">{error}</p>
            <button 
              onClick={executeSearch}
              className="px-5 py-2 bg-red-900 hover:bg-red-950 text-white font-semibold text-xs rounded-full transition-colors inline-block"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State Presentation Card */}
        {filteredResults.length === 0 && !loading && !error && (
          <div className="bg-white rounded-[1.5rem] border border-[#68BA7F]/15 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-[1.5rem] bg-[#FAFDF6] border border-[#68BA7F]/15 flex items-center justify-center mx-auto">
              <FolderOpen className="w-8 h-8 text-[#434842]/45" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">No Bibliographic Records Located</h3>
              <p className="text-xs text-[#434842] max-w-md mx-auto">
                No matching materials have been harvested for "{query}". Standardize your keywords or calibrate crawlers to expand the mapping spectrum.
              </p>
            </div>
            <button
              onClick={() => {
                setQuery('Water purification technologies humanitarian disaster');
                setActiveSources([]);
                setDatasetOnly(false);
                setHumanitarianOnly(false);
                setClientSearch('');
                setSourceFilters([]);
              }}
              className="px-5 py-2.5 bg-[#FAFDF6] hover:bg-[#E0E5DF] border border-[#68BA7F]/20 text-[#1E4D2B] font-bold text-xs rounded-xl transition-all"
            >
              Reset to Humanitarian Sandbox
            </button>
          </div>
        )}

        {/* The List Container */}
        {filteredResults.length > 0 && !loading && !error && (
          <div className="space-y-3">
            {filteredResults.map((paper, index) => {
              const isExpanded = expandedCard === paper.id;
              return (
                <div 
                  key={paper.id || index}
                  className={`bg-white rounded-[1.5rem] border hover:border-[#1E4D2B]/30 transition-all shadow-sm duration-200 group overflow-hidden ${
                    isExpanded 
                      ? 'ring-1 ring-[#1E4D2B]/20 border-[#1E4D2B]/30 shadow-md' 
                      : 'border-[#68BA7F]/15'
                  }`}
                  id={`card-${paper.id}`}
                >
                  {/* Card Frontal Banner Layout (Dense Header) */}
                  <div className="p-5 md:p-6 space-y-3.5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Title Display */}
                        <h2 className="text-sm font-bold text-[#191E1A] group-hover:text-[#1E4D2B] transition-colors leading-relaxed">
                          {paper.title}
                        </h2>
                        
                        {/* Authors Monospace Indicator */}
                        <div className="text-xs font-mono text-[#434842]/90 truncate">
                          BY: {paper.authors || 'Specified Investigators'}
                        </div>

                        {/* Journal/Venue Display */}
                        {paper.journalName && (
                          <div className="text-[11px] text-[#1E4D2B] font-bold mt-1.5 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-[#1E4D2B]/80 shrink-0" />
                            <span className="truncate">Venue: {paper.journalName}</span>
                          </div>
                        )}

                        {/* Publication Type Indicator */}
                        <div className="text-[10px] text-[#434842]/75 font-mono mt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#434842]/60" />
                          <span>Type: <span className="capitalize font-semibold text-[#191E1A]">{paper.pubType}</span></span>
                        </div>
                      </div>

                      {/* Dynamic Tags Stack */}
                      <div className="flex flex-wrap items-center sm:justify-end gap-1.5 shrink-0">
                        {/* Source Tag [Database_Name] */}
                        <span className="text-[10px] font-bold bg-[#FAFDF6] border border-[#68BA7F]/25 text-[#1E4D2B] px-2.5 py-1 rounded-full uppercase tracking-wide">
                          [{paper.cleanSource}]
                        </span>

                        {/* Year Badge */}
                        {paper.year > 0 && (
                          <span className="text-[10px] font-bold bg-[#EAEFE9] text-[#191E1A] px-2.5 py-1 rounded-full font-mono">
                            {paper.year}
                          </span>
                        )}

                        {/* Open Access status */}
                        {paper.isOa && (
                          <span className="text-[10px] font-extrabold bg-[#C6EFCE] text-[#002206] px-2.5 py-1 rounded-full flex items-center gap-0.5">
                            <Globe className="w-3 h-3 stroke-[2.5]" />
                            OA
                          </span>
                        )}

                        {/* Dataset Tag */}
                        {paper.isDataset && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
                            DATASET
                          </span>
                        )}

                        {/* Humanitarian indicator */}
                        {paper.isHumanitarian && (
                          <span className="text-[10px] font-bold bg-red-50 text-red-800 px-2.5 py-1 rounded-full border border-red-200">
                            HUMANITARIAN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Brief scannable preview abstract (only if not expanded) */}
                    {!isExpanded && paper.abstract && (
                      <p className="text-xs text-[#434842]/85 line-clamp-2 leading-relaxed">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Action Footer triggers for full inspection */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#68BA7F]/10 text-xs">
                      <div className="flex items-center gap-3 font-mono font-bold text-[#434842]/80">
                        {/* Citation metric representation */}
                        {paper.citationCount !== undefined && paper.citationCount > 0 && (
                          <span className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded-full">
                            {paper.citationCount} Citations
                          </span>
                        )}

                        {/* DOI metadata indicators */}
                        {paper.doi && (
                          <span className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full uppercase">
                            DOI: {paper.doi}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* External Link */}
                        {paper.url && (
                          <a 
                            href={paper.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full hover:bg-[#FAFDF6] transition-colors border border-[#68BA7F]/10 text-[#1E4D2B] flex items-center gap-1 font-bold text-[11px]"
                            title="Open direct index node"
                          >
                            <span>Access Node</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Expanded details toggle */}
                        <button
                          onClick={() => toggleCardExpansion(paper.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAFDF6] hover:bg-[#E0E5DF] text-[#1E4D2B] font-bold transition-all text-[11px]"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Expanded structured scientific parameters block */}
                  {isExpanded && (
                    <div className="px-5 pb-5 md:px-6 md:pb-6 border-t border-[#68BA7F]/15 bg-[#FAFDF6]/50 pt-5 space-y-4">
                      
                      {/* 1. Abstract block */}
                      {paper.abstract && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E4D2B] font-mono">Bibliographic Abstract</h4>
                          <p className="text-xs text-[#191E1A] leading-relaxed bg-white p-3.5 rounded-xl border border-[#68BA7F]/10 shadow-inner">
                            {paper.abstract}
                          </p>
                        </div>
                      )}

                      {/* 2. Structured Findings/Conclusions if available */}
                      {paper.findings && paper.findings.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E4D2B] font-mono">Synthesized Discoveries</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {paper.findings.map((f, i) => (
                              <li key={i} className="text-xs text-[#191E1A] flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-[#68BA7F]/10">
                                <div className="w-4 h-4 rounded-full bg-[#C6EFCE] shrink-0 text-[#002206] flex items-center justify-center text-[9px] font-mono font-bold mt-0.5">
                                  {i+1}
                                </div>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 3. Operational Methodology Profile (M3 Surface) */}
                      {((paper.methodology?.description) || (paper.methodology?.studyDesign) || (paper.methodology?.sampleSize)) && (
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E4D2B] font-mono">Experimental Methodology Specification</h4>
                          <div className="bg-[#EAEFE9] rounded-xl border border-[#68BA7F]/15 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {paper.methodology?.studyDesign && (
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-[#434842] uppercase font-bold tracking-wider">Study Design Model</span>
                                <div className="text-xs font-bold text-[#191E1A]">{paper.methodology.studyDesign}</div>
                              </div>
                            )}
                            {paper.methodology?.sampleSize !== undefined && (
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-[#434842] uppercase font-bold tracking-wider">Empirical Cohort Sample Size</span>
                                <div className="text-xs font-mono font-bold text-[#1E4D2B]">{paper.methodology.sampleSize.toLocaleString()} data points</div>
                              </div>
                            )}
                            {paper.methodology?.description && (
                              <div className="space-y-0.5 md:col-span-3">
                                <span className="text-[10px] text-[#434842] uppercase font-bold tracking-wider">Methodology Protocol</span>
                                <div className="text-xs text-[#191E1A] leading-relaxed mt-1">{paper.methodology.description}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. Deep Source Metadata concepts and tags */}
                      {paper.sourceSpecific && (
                        <div className="space-y-1.5 pt-2">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#434842] font-mono">Dynamic Node Registry Profiles</h4>
                          
                          <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[#434842]/80">
                            {/* OpenAlex concept indicators */}
                            {paper.sourceSpecific.openalex?.concepts?.slice(0, 5).map(c => (
                              <span key={c.id} className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10">
                                {c.name} ({Math.round(c.score * 100)}%)
                              </span>
                            ))}

                            {/* arXiv categories */}
                            {paper.sourceSpecific.arxiv?.categories?.map(c => (
                              <span key={c} className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10 text-cyan-800">
                                arxiv:{c}
                              </span>
                            ))}

                            {/* PubMed Journal Name */}
                            {paper.sourceSpecific.pubmed?.journal && (
                              <span className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10 text-purple-800 font-bold">
                                J: {paper.sourceSpecific.pubmed.journal}
                              </span>
                            )}

                            {/* Crossref metadata */}
                            {paper.sourceSpecific.crossref?.publisher && (
                              <span className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10">
                                Publisher: {paper.sourceSpecific.crossref.publisher}
                              </span>
                            )}

                            {/* HDX indicators */}
                            {paper.sourceSpecific.hdx && (
                              <>
                                <span className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10 text-red-800">
                                  Loc: {paper.sourceSpecific.hdx.location || 'Global'}
                                </span>
                                <span className="bg-white px-2 py-1 rounded-md border border-[#68BA7F]/10 text-red-800">
                                  Org: {paper.sourceSpecific.hdx.organization}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );

  return (
    <ResponsiveShell>
      {{
        filterArea,
        mainContent
      }}
    </ResponsiveShell>
  );
}
