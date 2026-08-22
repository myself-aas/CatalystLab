import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  Globe2, 
  Radio, 
  Zap, 
  Server, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EdgeRegion {
  id: string;
  location: string;
  continent: 'Americas' | 'EMEA' | 'APAC';
  baseLatency: number;
  quicSupported: boolean;
  tls0rtt: boolean;
  isp: string;
  ip: string;
}

export const GlobalEdgeRadar: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('iad');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [latencyJitter, setLatencyJitter] = useState<Record<string, number>>({});
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const regions: EdgeRegion[] = [
    { id: 'iad', location: 'Ashburn, VA (US-East)', continent: 'Americas', baseLatency: 12, quicSupported: true, tls0rtt: true, isp: 'Equinix DC2', ip: '104.21.48.12' },
    { id: 'sjc', location: 'San Jose, CA (US-West)', continent: 'Americas', baseLatency: 28, quicSupported: true, tls0rtt: true, isp: 'CoreSite SV1', ip: '172.67.142.88' },
    { id: 'fra', location: 'Frankfurt, DE (EU-Central)', continent: 'EMEA', baseLatency: 18, quicSupported: true, tls0rtt: true, isp: 'DE-CIX FRA', ip: '104.26.12.94' },
    { id: 'lhr', location: 'London, UK (EU-West)', continent: 'EMEA', baseLatency: 16, quicSupported: true, tls0rtt: true, isp: 'Telehouse North', ip: '104.26.13.94' },
    { id: 'nrt', location: 'Tokyo, JP (AP-Northeast)', continent: 'APAC', baseLatency: 42, quicSupported: true, tls0rtt: true, isp: 'NTT Com Shibuya', ip: '188.114.96.3' },
    { id: 'sin', location: 'Singapore (AP-Southeast)', continent: 'APAC', baseLatency: 39, quicSupported: true, tls0rtt: true, isp: 'Equinix SG1', ip: '188.114.97.3' },
    { id: 'syd', location: 'Sydney, AU (Oceania)', continent: 'APAC', baseLatency: 56, quicSupported: true, tls0rtt: true, isp: 'Global Switch SY1', ip: '172.67.190.10' },
    { id: 'gru', location: 'São Paulo, BR (SA-East)', continent: 'Americas', baseLatency: 64, quicSupported: true, tls0rtt: true, isp: 'Ascenty SP1', ip: '104.21.80.19' },
    { id: 'bom', location: 'Mumbai, IN (AP-South)', continent: 'APAC', baseLatency: 48, quicSupported: true, tls0rtt: true, isp: 'Netmagic DC5', ip: '172.67.210.45' },
    { id: 'jnb', location: 'Johannesburg, ZA (Africa)', continent: 'EMEA', baseLatency: 82, quicSupported: true, tls0rtt: true, isp: 'Teraco JB1', ip: '104.26.8.11' },
    { id: 'dxb', location: 'Dubai, UAE (ME-South)', continent: 'EMEA', baseLatency: 36, quicSupported: true, tls0rtt: true, isp: 'Equinix DX1', ip: '188.114.99.1' },
    { id: 'hkg', location: 'Hong Kong (AP-East)', continent: 'APAC', baseLatency: 44, quicSupported: true, tls0rtt: true, isp: 'MEGA-i HK', ip: '104.21.65.77' }
  ];

  const filteredRegions = selectedContinent === 'all' 
    ? regions 
    : regions.filter((r) => r.continent === selectedContinent);

  // Trigger interactive synthetic ping
  const triggerGlobalPing = () => {
    setIsPinging(true);
    const newJitter: Record<string, number> = {};
    
    regions.forEach((r) => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4 ms
      newJitter[r.id] = Math.max(8, r.baseLatency + delta);
    });

    setTimeout(() => {
      setLatencyJitter(newJitter);
      setIsPinging(false);
    }, 600);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 280;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveSlideIndex(Math.min(filteredRegions.length - 1, Math.max(0, newIndex)));
    }
  };

  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  return (
    <section className="py-12 lg:py-14 bg-gradient-to-b from-brand-oxford via-[#112239] to-brand-navy text-white relative overflow-hidden border-b border-brand-slate/30">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(65,90,119,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(65,90,119,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-slate/60 bg-brand-navy px-3 py-0.5 text-sm font-mono text-brand-periwinkle mb-2 shadow-[0_0_20px_rgba(65,90,119,0.2)]">
              <Radio className="h-3 w-3 text-[#38bdf8] animate-pulse" />
              <span>Phase 5 • EdgeVmax Network Probe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Global Edge Latency Radar
            </h2>
            <p className="text-sm sm:text-base text-brand-periwinkle max-w-xl mt-1 leading-relaxed">
              Verify TTFB, TLS 1.3 0-RTT handshakes, and HTTP/3 QUIC across 12 global PoPs.
            </p>
          </LazyReveal>

          {/* Action & Filter buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={triggerGlobalPing}
              disabled={isPinging}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-periwinkle text-brand-navy hover:bg-white text-sm font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'Ping All 12 PoPs'}</span>
            </button>

            {/* Continent Filters */}
            <div className="flex items-center gap-1 bg-brand-navy p-1 rounded-xl border border-brand-slate/40">
              {['all', 'Americas', 'EMEA', 'APAC'].map((cont) => (
                <button
                  key={cont}
                  type="button"
                  onClick={() => setSelectedContinent(cont)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono transition-colors cursor-pointer capitalize ${
                    selectedContinent === cont
                      ? 'bg-brand-slate text-white font-bold'
                      : 'text-[#8ea8c3] hover:text-white'
                  }`}
                >
                  {cont}
                </button>
              ))}
            </div>

            {/* Carousel Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll PoP nodes left"
                className="p-1.5 rounded-xl bg-brand-navy hover:bg-[#162a45] text-brand-periwinkle border border-brand-slate/50 shadow-sm active:scale-95 cursor-pointer transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll PoP nodes right"
                className="p-1.5 rounded-xl bg-brand-navy hover:bg-[#162a45] text-brand-periwinkle border border-brand-slate/50 shadow-sm active:scale-95 cursor-pointer transition-all"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SCROLLING POP NODES REEL
        ========================================================================= */}
        <div className="relative mb-6">
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Global edge latency PoPs horizontal reel"
          >
            {filteredRegions.map((reg) => {
              const currentLatency = latencyJitter[reg.id] || reg.baseLatency;
              const isSelected = selectedRegionId === reg.id;
              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`w-[220px] sm:w-[250px] shrink-0 snap-start p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#162a45] border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.25)] ring-1 ring-[#38bdf8]'
                      : 'bg-brand-oxford/90 border-brand-slate/40 hover:bg-[#132742] hover:border-brand-slate'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8ea8c3]">
                      {reg.id.toUpperCase()} • {reg.continent}
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-[#34d399] animate-ping" />
                  </div>

                  <div className="text-lg font-mono font-black text-white">
                    {currentLatency}
                    <span className="text-sm font-normal text-[#8ea8c3] ml-1">ms</span>
                  </div>

                  <div className="text-sm text-brand-periwinkle truncate mt-1">
                    {reg.location}
                  </div>

                  <div className="pt-2 border-t border-brand-slate/30 flex items-center justify-between text-xs font-mono mt-2 text-[#8ea8c3]">
                    <span>{reg.isp}</span>
                    <span className={isSelected ? 'text-[#38bdf8] font-bold' : ''}>
                      {isSelected ? '● Active' : 'Inspect'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Inspector Bar for Selected Node */}
        <div className="bg-brand-navy/95 border border-brand-slate/60 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-brand-periwinkle">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#38bdf8]" />
              <span className="text-white font-bold">{selectedRegion.location} ({selectedRegion.id.toUpperCase()})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-oxford px-2.5 py-1 rounded-lg border border-brand-slate/40">
              <span className="text-[#8ea8c3]">Anycast IP:</span>
              <span className="text-[#38bdf8]">{selectedRegion.ip}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>TLS 1.3 0-RTT Ready</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>HTTP/3 QUIC Enabled</span>
            </div>
          </div>

          <Link
            to="/edge"
            className="inline-flex items-center gap-1.5 bg-brand-periwinkle hover:bg-white text-brand-navy px-4 py-2 rounded-xl text-sm font-mono font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <span>Launch EdgeVmax Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default GlobalEdgeRadar;
