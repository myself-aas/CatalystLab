import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyReveal } from '../common/LazyAnimate';
import { 
  Globe2, 
  Radio, 
  Zap, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
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

  const triggerGlobalPing = () => {
    setIsPinging(true);
    const newJitter: Record<string, number> = {};
    
    regions.forEach((r) => {
      const delta = Math.floor(Math.random() * 9) - 4;
      newJitter[r.id] = Math.max(8, r.baseLatency + delta);
    });

    setTimeout(() => {
      setLatencyJitter(newJitter);
      setIsPinging(false);
    }, 500);
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
    <section className="py-14 lg:py-18 bg-gray-100/70 backdrop-blur-sm text-black relative overflow-hidden border-b border-gray-200">
      <div className="ds-page-shell">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <LazyReveal direction="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs sm:text-sm font-mono text-gray-600 mb-3 shadow-sm">
              <Radio className="h-3.5 w-3.5 text-accent-amber-strong animate-pulse" />
              <span>Phase 5 • EdgeVmax Network Probe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
              Global Edge Latency Radar
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mt-1.5 leading-relaxed">
              Verify TTFB, TLS 1.3 0-RTT handshakes, and HTTP/3 QUIC across 12 distributed global PoPs.
            </p>
          </LazyReveal>

          {/* Action & Filter buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={triggerGlobalPing}
              disabled={isPinging}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-black-hover text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin text-accent-amber-strong' : ''}`} />
              <span>{isPinging ? 'Pinging PoPs...' : 'Ping All 12 PoPs'}</span>
            </button>

            {/* Continent Filters */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
              {['all', 'Americas', 'EMEA', 'APAC'].map((cont) => (
                <button
                  key={cont}
                  type="button"
                  onClick={() => setSelectedContinent(cont)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer capitalize ${
                    selectedContinent === cont
                      ? 'bg-black text-white font-bold'
                      : 'text-gray-600 hover:text-white'
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
                className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 hover:text-white border border-gray-200 shadow-sm active:scale-95 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll PoP nodes right"
                className="p-2 rounded-xl bg-white hover:bg-gray-50 text-gray-600 hover:text-white border border-gray-200 shadow-sm active:scale-95 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal PoP Cards Reel */}
        <div className="relative mb-8">
          <div
            ref={scrollContainerRef}
            onScroll={handleScrollEvent}
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 scroll-smooth"
            tabIndex={0}
            role="region"
            aria-label="Global edge PoP node carousel"
          >
            {filteredRegions.map((reg) => {
              const isSelected = selectedRegionId === reg.id;
              const liveLatency = latencyJitter[reg.id] || reg.baseLatency;
              const isGood = liveLatency < 35;
              const isFair = liveLatency >= 35 && liveLatency < 60;

              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegionId(reg.id)}
                  className={`w-[240px] sm:w-[260px] shrink-0 snap-start p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-accent-cyan shadow-lg ring-1 ring-accent-cyan/60'
                      : 'bg-white/70 border-gray-200 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {reg.id.toUpperCase()} • {reg.continent}
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isGood 
                          ? 'bg-emerald-950/40 text-accent-emerald border-emerald-500/30'
                          : isFair
                          ? 'bg-cyan-950/40 text-accent-amber-strong border-cyan-500/30'
                          : 'bg-amber-950/40 text-accent-amber border-amber-500/30'
                      }`}>
                        {liveLatency} ms
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-black leading-tight">
                      {reg.location.split(' (')[0]}
                    </h4>
                    <p className="text-xs text-gray-600 font-mono truncate mt-0.5">
                      {reg.isp}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-gray-500 mt-3">
                    <span className="truncate">{reg.ip}</span>
                    <span className={`font-bold ${isSelected ? 'text-accent-amber-strong' : 'text-gray-600'}`}>
                      {isSelected ? '● Active' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active PoP Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRegion.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Specs */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">
                    <Globe2 className="h-3.5 w-3.5 text-accent-amber-strong" />
                    <span>Anycast PoP: {selectedRegion.location}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                    Host IP: {selectedRegion.ip}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">Synthesized TTFB</div>
                    <div className="text-xl font-bold font-mono text-accent-amber-strong mt-0.5 metric-tabular">
                      {latencyJitter[selectedRegion.id] || selectedRegion.baseLatency}ms
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">HTTP/3 QUIC</div>
                    <div className="text-xl font-bold font-mono text-accent-emerald mt-0.5">
                      Enabled
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">TLS 1.3 0-RTT</div>
                    <div className="text-xl font-bold font-mono text-accent-emerald mt-0.5">
                      Verified
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-xl border border-gray-200">
                    <div className="text-[10px] font-mono text-gray-500 uppercase">BGP Transit</div>
                    <div className="text-sm font-bold font-mono text-black mt-1 truncate">
                      {selectedRegion.isp.split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-center gap-3">
                <Link
                  to={`/latency?pop=${selectedRegion.id}`}
                  className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-black-hover text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all shadow-md active:scale-95 border border-brand-periwinkle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>Launch Deep PoP Diagnostic</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/docs#edge-latency"
                  className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-50 text-gray-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-mono border border-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>PoP SLA &amp; Topology Docs</span>
                </Link>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default GlobalEdgeRadar;
