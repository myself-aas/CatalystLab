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
  // If no categories provided, group faqs into "General"
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

  // Total question count
  const totalQuestions = useMemo(() => {
    return resolvedCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [resolvedCategories]);

  // Filtered results based on search query
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

  // Current active category
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
      className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 border-t border-slate-100"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Knowledge Base & Diagnostic FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-8 max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${totalQuestions} questions across all tabs (e.g. CI/CD, TTFB, /llms.txt)...`}
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
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
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Search Results for &ldquo;{searchQuery}&rdquo;
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear filter
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900">No matching questions found</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  We couldn&apos;t find an exact match for &ldquo;{searchQuery}&rdquo;. Try using terms like &ldquo;engine&rdquo;, &ldquo;GitHub&rdquo;, &ldquo;latency&rdquo;, or contact our team directly.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    View All Categories
                  </button>
                  <Link
                    to={contactLink}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((res, sIdx) => {
                  const idxKey = `search-${sIdx}`;
                  const isOpen = openItems[idxKey] !== false; // default open in search
                  return (
                    <div
                      key={sIdx}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isOpen 
                          ? 'border-blue-200 bg-blue-50/20 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(idxKey)}
                        className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <div className="space-y-1.5 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                              {res.categoryLabel}
                            </span>
                            {res.item.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                                {res.item.badge}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-base sm:text-lg font-bold text-slate-900 leading-snug ${isOpen ? 'text-blue-900' : ''}`}>
                            {res.item.question}
                          </h3>
                        </div>
                        <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100/80 whitespace-pre-line">
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
          /* Standard Tabview Layout */
          <div>
            {/* Mobile Tab Pills (Horizontal Scroll) */}
            <div className="lg:hidden mb-8 overflow-x-auto pb-2 -mx-4 px-4 flex gap-2 no-scrollbar scroll-smooth">
              {resolvedCategories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {getCategoryIcon(cat.iconName || cat.id)}
                    <span>{cat.label}</span>
                    <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {cat.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Side-by-Side Tabview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Desktop Left Tab Navigation Column */}
              <div className="hidden lg:flex lg:col-span-4 flex-col gap-2 sticky top-24">
                <div className="px-3 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Topic Categories ({resolvedCategories.length})
                  </span>
                </div>
                {resolvedCategories.map((cat) => {
                  const isActive = activeCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                      }`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
                          isActive 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white border border-slate-200 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200'
                        }`}>
                          {getCategoryIcon(cat.iconName || cat.id)}
                        </div>
                        <div className="truncate">
                          <span className="text-sm font-bold block truncate">
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {cat.items.length}
                        </span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${
                          isActive ? 'text-blue-400 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </div>
                    </button>
                  );
                })}

                {/* Left side quick docs highlight box */}
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wide">
                    <BookOpen className="h-4 w-4" />
                    <span>Technical Architecture</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Need deep dive whitepapers on our AST algorithms, carbon modeling formulas, or 42-PoP edge probes?
                  </p>
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Browse Engineering Docs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Accordion Panel */}
              <div className="lg:col-span-8 flex flex-col">
                {/* Active Category Header Bar */}
                <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600 text-white">
                        {getCategoryIcon(activeCategory?.iconName || activeCategory?.id)}
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {activeCategory?.label}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold ml-1">
                        {activeCategory?.items.length} questions
                      </span>
                    </div>
                    {activeCategory?.description && (
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {activeCategory.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Expand / Collapse Toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleExpandAll(activeCategory?.items.length || 0)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Expand all
                    </button>
                    <button
                      onClick={handleCollapseAll}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Collapse all
                    </button>
                  </div>
                </div>

                {/* Accordion Questions List */}
                <div className="space-y-3.5">
                  {activeCategory?.items.map((item, idx) => {
                    const idxKey = `${idx}`;
                    const isOpen = !!openItems[idxKey];
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isOpen
                            ? 'border-blue-200/90 bg-blue-50/15 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(idxKey)}
                          className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <div className="space-y-1.5 pr-2">
                            {item.badge && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold mb-1">
                                {item.badge}
                              </span>
                            )}
                            <h4 className={`text-base sm:text-lg font-bold text-slate-900 leading-snug transition-colors ${
                              isOpen ? 'text-blue-900' : ''
                            }`}>
                              {item.question}
                            </h4>
                          </div>
                          <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                            isOpen 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}>
                            {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100/90">
                                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                                  {item.answer}
                                </div>
                                {item.codeSnippet && (
                                  <div className="mt-4 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
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

                {/* Bottom Still Have Questions Dock */}
                <div className="mt-10 sm:mt-12 bg-gradient-to-br from-slate-900 to-[#0b192c] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Direct Engineering Support</span>
                    </div>
                    <h4 className="font-extrabold text-white text-lg sm:text-xl">
                      Still have questions about CatalystLab?
                    </h4>
                    <p className="text-sm text-slate-300 max-w-md">
                      {contactText}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <Link
                      to="/docs"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-bold text-xs sm:text-sm transition-colors"
                    >
                      Read Documentation
                    </Link>
                    <Link
                      to={contactLink}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
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
