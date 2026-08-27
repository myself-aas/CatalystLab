import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      navigate(`/audit?url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-black border-t border-zinc-900 flex items-center justify-center text-center">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight leading-[1.1]">
            Ready to analyze your domain?
          </h2>
          <p className="mt-6 text-base md:text-lg text-zinc-400 leading-relaxed">
            Run a complete autonomous audit in under two seconds. No agents, no installation required.
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 md:mt-12 w-full max-w-md relative"
        >
          <div className="relative flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all shadow-xl">
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
              className="shrink-0 flex items-center gap-2 px-6 py-3 md:py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Start Audit <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        <div className="mt-16 md:mt-24 pt-8 w-full border-t border-zinc-900 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>&copy; 2026 CatalystLab. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </section>
  );
};
