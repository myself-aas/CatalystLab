import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, ShieldCheck, Activity, Zap } from 'lucide-react';
import EdgeMeshGlobe from '../ui/edge-mesh-globe';

export const HeroSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)]" />
      
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        
        {/* Left Column: Copy */}
        <div className="flex flex-col items-start max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              Live architecture intelligence
            </div>
            <h1 className="max-w-[12ch] text-4xl font-medium leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              See the system behind the site.
            </h1>
            <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-zinc-400 md:text-lg">
              Execute multi-dimensional health audits in seconds. Assess Core Web Vitals, security posture, and infrastructure bottlenecks without deploying agents.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> No agents required</span>
              <span className="inline-flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-300" /> 40+ signals</span>
              <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-amber-300" /> Results in seconds</span>
            </div>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full max-w-md relative"
          >
            <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 shadow-[0_16px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all focus-within:border-cyan-300/50 focus-within:ring-4 focus-within:ring-cyan-300/10">
              <div className="pl-3 pr-2 text-zinc-500">
                <Terminal className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none focus:ring-0 text-base py-3 md:text-sm"
              />
              <button 
                type="submit"
                className="shrink-0 flex items-center gap-2 px-4 py-3 md:py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Audit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* Right Column: Asset */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex aspect-square min-h-[320px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 shadow-[0_24px_100px_rgba(0,0,0,0.45)] md:aspect-[4/3]"
        >
          {/* A subtle geometric/technical placeholder asset */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
          
          <div className="pointer-events-none absolute left-5 top-5 z-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 backdrop-blur-md">
            <span className="mr-2 text-emerald-400">●</span> Global mesh / observing
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <EdgeMeshGlobe 
              variant="hero"
              interactive={true} 
              autoSpin={true}
              showChips={true}
              showControls={false}
              showInspector={false}
              className="w-full h-full max-w-full max-h-full"
            />
          </div>
        </motion.div>
        
      </div>
    </section>
  );
};
