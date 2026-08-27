import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] text-white">
              Autonomous telemetry for modern web architectures.
            </h1>
            <p className="mt-6 text-base md:text-lg text-zinc-400 leading-relaxed max-w-[48ch]">
              Execute multi-dimensional health audits in seconds. Assess Core Web Vitals, security posture, and infrastructure bottlenecks without deploying agents.
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full max-w-md relative"
          >
            <div className="relative flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
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
          className="relative w-full min-h-[300px] aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/50 flex items-center justify-center shadow-2xl"
        >
          {/* A subtle geometric/technical placeholder asset */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
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
