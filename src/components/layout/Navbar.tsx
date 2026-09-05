import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Globe, 
  Leaf, 
  Search, 
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface EngineItem {
  id: string;
  name: string;
  tagline: string;
  tag: string;
  tagColor: string;
  path: string;
  icon: React.ElementType;
}

const PERFORMANCE_ENGINES: EngineItem[] = [
  {
    id: 'vitalzyme',
    name: 'VitalZyme',
    tagline: 'LCP/INP & Core Web Vitals diagnostic runtime',
    tag: 'CrUX P95',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    path: '/engine/vitalzyme',
    icon: Activity
  },
  {
    id: 'edgekinase',
    name: 'EdgeKinase',
    tagline: 'TLS 1.3, TCP handshake & 38-PoP edge latency',
    tag: '0-RTT',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    path: '/engine/edgekinase',
    icon: Globe
  },
  {
    id: 'ecoholo',
    name: 'EcoHolo',
    tagline: 'CO2 carbon emission & green hosting index',
    tag: 'Green-e',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    path: '/engine/ecoholo',
    icon: Leaf
  },
  {
    id: 'allostersearch',
    name: 'AllosterSearch',
    tagline: 'Sub-50ms search index & crawl budget audit',
    tag: 'RFC 9110',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    path: '/engine/allostersearch',
    icon: Search
  }
];

const SECURITY_AI_ENGINES: EngineItem[] = [
  {
    id: 'riskprotease',
    name: 'RiskProtease',
    tagline: 'OWASP Top 10 transport & CSP directive hardening',
    tag: 'SOC2 A+',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    path: '/engine/riskprotease',
    icon: ShieldCheck
  },
  {
    id: 'synthshift',
    name: 'SynthShift',
    tagline: 'AST schema diff viewer & script chunk optimizer',
    tag: 'AST Diff',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    path: '/engine/synthshift',
    icon: Code2
  },
  {
    id: 'llmkinase',
    name: 'LLM-Kinase',
    tagline: 'AI crawler discovery & /llms.txt manifest probe',
    tag: 'AEO 98%',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    path: '/engine/llmkinase',
    icon: Cpu
  },
  {
    id: 'ghlyase',
    name: 'GHLyase',
    tagline: 'Automated GitHub PR patch branch generation',
    tag: 'Auto-PR',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    path: '/engine/ghlyase',
    icon: GitBranch
  }
];

const DIRECT_LINKS = [
  { label: 'Pipeline', to: '/pipeline' },
  { label: 'Benchmarks', to: '/compare' },
  { label: 'Docs', to: '/docs' },
  { label: 'Pricing', to: '/pricing' }
];

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEnginesOpen, setIsEnginesOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsEnginesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMouseEnter = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setIsEnginesOpen(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setIsEnginesOpen(false);
    }, 180);
  };

  return (
    <>
      <header className="fixed top-4 md:top-6 inset-x-0 mx-auto z-50 w-[calc(100%-2rem)] max-w-5xl">
        <nav className="backdrop-blur-xl bg-black/65 border border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between transition-all">
          {/* Left Anchor: Monogram + Wordmark + Live Node Chip */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <BrandLogo size="md" />
            </Link>

            {/* Live Node Chip */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>38/38 PoPs Active</span>
            </div>
          </div>

          {/* Center Navigation: Engines Mega-Menu + Direct Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Engines Mega-Menu Trigger */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsEnginesOpen(!isEnginesOpen)}
                className={`flex items-center gap-1 text-sm transition-colors duration-150 focus:outline-none cursor-pointer ${
                  isEnginesOpen ? 'text-white' : 'text-[#999999] hover:text-white'
                }`}
                aria-expanded={isEnginesOpen}
              >
                <span>Engines</span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${isEnginesOpen ? 'rotate-180 text-white' : 'text-[#666666]'}`} />
              </button>

              {/* 520px Floating Glass Mega-Panel */}
              <AnimatePresence>
                {isEnginesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -left-20 top-full pt-3 w-[540px] z-50 pointer-events-auto"
                  >
                    <div className="bg-[#0A0A0A]/95 border border-white/12 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl grid grid-cols-2 gap-3 relative overflow-hidden">
                      {/* Subsurface Radial Radiance */}
                      <div 
                        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-2xl"
                        style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                      />

                      {/* Column 1: Core Performance */}
                      <div className="space-y-1.5">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#666666] flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                          <span>Core Performance</span>
                          <span className="text-[#00D2FF]">4 Engines</span>
                        </div>
                        {PERFORMANCE_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <Link
                              key={engine.id}
                              to={engine.path}
                              onClick={() => setIsEnginesOpen(false)}
                              className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all duration-150 border border-transparent hover:border-white/10"
                            >
                              <div className="size-8 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center shrink-0 text-white/80 group-hover:text-[#00D2FF] group-hover:border-[#00D2FF]/40 transition-colors">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-white group-hover:text-[#00D2FF] transition-colors truncate">
                                    {engine.name}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${engine.tagColor}`}>
                                    {engine.tag}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#666666] group-hover:text-[#999999] leading-snug line-clamp-1 mt-0.5">
                                  {engine.tagline}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Column 2: Security & AI */}
                      <div className="space-y-1.5 border-l border-white/5 pl-3">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#666666] flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                          <span>Security &amp; AI AST</span>
                          <span className="text-purple-400">4 Engines</span>
                        </div>
                        {SECURITY_AI_ENGINES.map((engine) => {
                          const Icon = engine.icon;
                          return (
                            <Link
                              key={engine.id}
                              to={engine.path}
                              onClick={() => setIsEnginesOpen(false)}
                              className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all duration-150 border border-transparent hover:border-white/10"
                            >
                              <div className="size-8 rounded-lg bg-[#111111] border border-white/10 flex items-center justify-center shrink-0 text-white/80 group-hover:text-purple-400 group-hover:border-purple-400/40 transition-colors">
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors truncate">
                                    {engine.name}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${engine.tagColor}`}>
                                    {engine.tag}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#666666] group-hover:text-[#999999] leading-snug line-clamp-1 mt-0.5">
                                  {engine.tagline}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Bottom Quick Hub Bar */}
                      <div className="col-span-2 mt-1 pt-2.5 border-t border-white/10 flex items-center justify-between px-2 text-xs">
                        <Link 
                          to="/engines" 
                          onClick={() => setIsEnginesOpen(false)}
                          className="text-[#999999] hover:text-white flex items-center gap-1 text-[11px] font-mono group"
                        >
                          <span>Explore All 8 Telemetry Engines</span>
                          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[10px] font-mono text-[#666666]">
                          Zero-SDK &bull; RFC 9110 Compliant
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Navigation Links */}
            {DIRECT_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-[#999999] hover:text-white transition-colors duration-150 focus:outline-none"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-[#999999] hover:text-white px-3 py-1.5 transition-colors duration-150 focus:outline-none font-medium"
            >
              Log in
            </Link>
            <Link
              to="/launch-audit"
              className="bg-white text-black font-semibold hover:bg-neutral-200 rounded-full px-4 py-1.5 text-xs sm:text-sm shadow-[0_0_18px_rgba(255,255,255,0.35)] flex items-center gap-1.5 transition-all active:scale-95 focus:outline-none"
            >
              <span>Run Audit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Trigger Container (44px min touch target) */}
          <button
            type="button"
            className="md:hidden text-white focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
          >
            <Menu className="size-5" />
          </button>
        </nav>
      </header>

      {/* Responsive Full-Screen Mobile Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col"
          >
            {/* Top Sheet Bar */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>
                  <BrandLogo size="md" />
                </Link>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>38 PoPs</span>
                </div>
              </div>
              <button
                type="button"
                className="text-white focus:outline-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X className="size-6" />
              </button>
            </div>
            
            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {/* Direct Links */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#666666] mb-2">
                  Navigation
                </div>
                {DIRECT_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + idx * 0.04 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-medium text-white min-h-[44px] flex items-center justify-between py-2 border-b border-white/5"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="size-4 text-[#666666]" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* 8 Autonomous Engines Grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#666666] flex items-center justify-between">
                  <span>8 Autonomous Engines</span>
                  <Link 
                    to="/engines" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#00D2FF] text-[11px] font-mono"
                  >
                    View All &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[...PERFORMANCE_ENGINES, ...SECURITY_AI_ENGINES].map((engine) => (
                    <Link
                      key={engine.id}
                      to={engine.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-[#0D0D0D] border border-white/10 flex flex-col gap-1 hover:border-white/20 transition-all min-h-[58px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white truncate">{engine.name}</span>
                        <span className={`text-[8px] font-mono px-1 rounded border ${engine.tagColor}`}>
                          {engine.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#666666] truncate">{engine.tagline}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-auto pt-4 flex flex-col gap-3"
              >
                <Link
                  to="/launch-audit"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-white text-black font-semibold hover:bg-neutral-200 rounded-xl px-4 py-3.5 min-h-[48px] flex justify-center items-center gap-2 transition-colors shadow-[0_0_24px_rgba(255,255,255,0.25)] text-sm"
                >
                  <span>Run Autonomous Audit</span>
                  <ArrowRight className="size-4" />
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-[#999999] hover:text-white bg-[#111111] border border-white/10 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-white bg-[#161616] border border-white/15 rounded-xl min-h-[44px] flex justify-center items-center font-medium text-xs transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
