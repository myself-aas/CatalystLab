import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Search, 
  X, 
  Cpu, 
  GitBranch, 
  Bot, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Lock, 
  HelpCircle, 
  Terminal, 
  Sparkles, 
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FAQCategoryCard } from '../cards/content/FAQCategoryCard';
import { EnzymeHue } from '../cards/types';

export interface FaqItem {
  question: string;
  answer: string;
  badge?: string;
  codeSnippet?: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  description?: string;
  iconName?: 'cpu' | 'git' | 'bot' | 'shield' | 'zap' | 'credit-card' | 'lock' | 'terminal' | 'layers' | 'help' | string;
  items: FaqItem[];
}

interface GlobalFaqSectionProps {
  categories?: FaqCategory[];
  faqs?: FaqItem[];
  title?: string;
  subtitle?: string;
  contactText?: string;
  contactActionText?: string;
  contactLink?: string;
  showSearch?: boolean;
}

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'cpu':
    case 'engines':
      return <Cpu className="h-4 w-4 shrink-0" />;
    case 'git':
    case 'cicd':
      return <GitBranch className="h-4 w-4 shrink-0" />;
    case 'bot':
    case 'ai':
    case 'llm':
      return <Bot className="h-4 w-4 shrink-0" />;
    case 'shield':
    case 'security':
      return <ShieldCheck className="h-4 w-4 shrink-0" />;
    case 'zap':
    case 'performance':
    case 'vitals':
      return <Zap className="h-4 w-4 shrink-0" />;
    case 'credit-card':
    case 'billing':
    case 'pricing':
      return <CreditCard className="h-4 w-4 shrink-0" />;
    case 'lock':
    case 'privacy':
    case 'compliance':
      return <Lock className="h-4 w-4 shrink-0" />;
    case 'terminal':
      return <Terminal className="h-4 w-4 shrink-0" />;
    case 'layers':
      return <Layers className="h-4 w-4 shrink-0" />;
    default:
      return <HelpCircle className="h-4 w-4 shrink-0" />;
  }
};

export const GlobalFaqSection: React.FC<GlobalFaqSectionProps> = ({
  categories = [],
  faqs = [],
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about our 8-engine telemetry suite, automated CI/CD gates, security guarantees, and edge diagnostic mesh.",
  contactText = "Looking for detailed API specs or need enterprise deployment support?",
  contactActionText = "Speak with Engineering",
  contactLink = "/contact",
  showSearch = true
}) => {
  const resolvedCategories = useMemo<FaqCategory[]>(() => {
    if (categories.length > 0) return categories;
    return [{ 
      id: 'general', 
      label: 'General Inquiries', 
      description: 'Common questions and answers regarding our platform and services.',
      iconName: 'help',
      items: faqs 
    }];
  }, [categories, faqs]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(resolvedCategories[0]?.id || 'general');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '0': true });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalQuestions = useMemo(() => {
    return resolvedCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [resolvedCategories]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matched: { categoryId: string; categoryLabel: string; item: FaqItem; originalIdx: number }[] = [];
    resolvedCategories.forEach((cat) => {
      cat.items.forEach((item, idx) => {
        if (
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query) ||
          (item.badge && item.badge.toLowerCase().includes(query))
        ) {
          matched.push({
            categoryId: cat.id,
            categoryLabel: cat.label,
            item,
            originalIdx: idx
          });
        }
      });
    });
    return matched;
  }, [searchQuery, resolvedCategories]);

  const activeCategory = useMemo(() => {
    return resolvedCategories.find((c) => c.id === activeCategoryId) || resolvedCategories[0];
  }, [resolvedCategories, activeCategoryId]);

  const toggleItem = (idxKey: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [idxKey]: !prev[idxKey]
    }));
  };

  const handleSelectCategory = (id: string) => {
    setActiveCategoryId(id);
    setOpenItems({ '0': true });
  };

  const handleExpandAll = (itemCount: number) => {
    const next: Record<string, boolean> = {};
    for (let i = 0; i < itemCount; i++) {
      next[`${i}`] = true;
    }
    setOpenItems(next);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  return (
    <section 
      id="faq-section"
      className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 border-t border-slate-200"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Knowledge Base &amp; Diagnostic FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
            {subtitle}
          </p>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-6 max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
                <input
                  id="faq-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${totalQuestions} questions across all tabs (e.g. CI/CD, TTFB, /llms.txt)...`}
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Results Mode */}
        {searchResults !== null ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  Search Results for &ldquo;{searchQuery}&rdquo;
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-mono font-bold">
                  {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-slate-900 font-bold hover:underline transition-colors"
              >
                Clear filter
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">No matching questions found</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  We couldn&apos;t find an exact match for &ldquo;{searchQuery}&rdquo;. Try using terms like &ldquo;engine&rdquo;, &ldquo;GitHub&rdquo;, or &ldquo;latency&rdquo;.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    View All Categories
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((res, sIdx) => {
                  const idxKey = `search-${sIdx}`;
                  const isOpen = openItems[idxKey] !== false;
                  return (
                    <div
                      key={sIdx}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => toggleItem(idxKey)}
                        className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <div className="space-y-1 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono font-semibold">
                              {res.categoryLabel}
                            </span>
                            {res.item.badge && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono font-bold">
                                {res.item.badge}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug font-sans">
                            {res.item.question}
                          </h3>
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                          {isOpen ? <Minus className="h-3.5 w-3.5 text-slate-900" /> : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line font-sans">
                              {res.item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Desktop Side-by-Side Tabview Grid */
          <div>
            {/* Mobile Tab Pills */}
            <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4 flex gap-2 no-scrollbar scroll-smooth">
              {resolvedCategories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {getCategoryIcon(cat.iconName || cat.id)}
                    <span>{cat.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                      {cat.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Desktop Left Tab Navigation Column */}
              <div className="hidden lg:flex lg:col-span-4 flex-col gap-2 sticky top-24">
                <div className="px-2 pb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Topic Categories ({resolvedCategories.length})
                  </span>
                </div>
                {resolvedCategories.map((cat, idx) => {
                  const isActive = activeCategoryId === cat.id;
                  const hues: EnzymeHue[] = ['edgevmax', 'vitalzyme', 'riskprotease', 'llmkinase', 'ecoholo', 'synthshift'];
                  const catHue = hues[idx % hues.length];

                  return (
                    <FAQCategoryCard
                      key={cat.id}
                      id={cat.id}
                      label={cat.label}
                      description={cat.description}
                      icon={getCategoryIcon(cat.iconName || cat.id)}
                      itemCount={cat.items.length}
                      isActive={isActive}
                      onSelect={(id) => handleSelectCategory(id)}
                      hue={catHue}
                    />
                  );
                })}

                {/* Quick docs highlight box */}
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold text-xs uppercase tracking-wide">
                    <BookOpen className="h-3.5 w-3.5 text-slate-900" />
                    <span>Technical Architecture</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    Need deep dive whitepapers on our AST algorithms, carbon modeling formulas, or 42-PoP edge probes?
                  </p>
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-900 hover:underline transition-colors"
                  >
                    <span>Browse Engineering Docs</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Right Accordion Panel */}
              <div className="lg:col-span-8 flex flex-col">
                {/* Active Category Header Bar */}
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-900">
                        {getCategoryIcon(activeCategory?.iconName || activeCategory?.id)}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                        {activeCategory?.label}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] font-bold border border-slate-200">
                        {activeCategory?.items.length} items
                      </span>
                    </div>
                    {activeCategory?.description && (
                      <p className="text-[11px] text-slate-600 mt-1 font-sans">
                        {activeCategory.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Expand / Collapse */}
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <button
                      onClick={() => handleExpandAll(activeCategory?.items.length || 0)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm"
                    >
                      Expand all
                    </button>
                    <button
                      onClick={handleCollapseAll}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-sm"
                    >
                      Collapse all
                    </button>
                  </div>
                </div>

                {/* Accordion Questions List */}
                <div className="space-y-2.5">
                  {activeCategory?.items.map((item, idx) => {
                    const idxKey = `${idx}`;
                    const isOpen = !!openItems[idxKey];
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => toggleItem(idxKey)}
                          className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <div className="space-y-1 pr-2">
                            {item.badge && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-1">
                                {item.badge}
                              </span>
                            )}
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug font-sans">
                              {item.question}
                            </h4>
                          </div>
                          <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                            {isOpen ? <Minus className="h-3.5 w-3.5 text-slate-900" /> : <Plus className="h-3.5 w-3.5" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line font-sans">
                                {item.answer}
                                {item.codeSnippet && (
                                  <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                                    <code>{item.codeSnippet}</code>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Questions Dock */}
                <div className="mt-8 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">Direct Engineering Support</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-sans">
                      Still have questions about CatalystLab?
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md font-sans">
                      {contactText}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link
                      to="/docs"
                      className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-mono text-xs transition-colors shadow-sm font-bold"
                    >
                      Read Docs
                    </Link>
                    <Link
                      to={contactLink}
                      className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-mono text-xs font-bold transition-all shadow-sm"
                    >
                      {contactActionText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlobalFaqSection;
