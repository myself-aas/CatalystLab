import { motion } from 'framer-motion';
import { useState } from 'react';
import { Engine } from '../data/diagnosticEngines';
import { Heart, Bookmark } from 'lucide-react';

interface Props {
  engine: Engine;
}

export const DiagnosticEngineCard: React.FC<Props> = ({ engine }) => {
  const [favorited, setFavorited] = useState(false);

  return (
    <motion.div
      className="rounded-[28px] overflow-hidden shadow-lg border border-black/20 bg-white"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: 'easeOut', staggerChildren: 0.05 }}
      whileHover={{ y: -4, scale: 1.01, transition: { stiffness: 300, damping: 20 } }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-black/15">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/15 text-black border border-black/25">
          {engine.category}
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFavorited((prev) => !prev)}
          className="p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          aria-label={favorited ? 'Unfavorite engine' : 'Favorite engine'}
        >
          {favorited ? (
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          ) : (
            <Bookmark className="w-5 h-5 text-slate-400" />
          )}
        </motion.button>
      </div>
      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-black">{engine.name}</h3>
        <p className="mt-1 text-xs text-black">{engine.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {engine.metrics.map((m, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              <strong className="text-black">{m.label}:</strong> {m.value}
            </span>
          ))}
        </div>
      </div>
      {/* Action */}
      <div className="p-5 pt-0 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-black hover:bg-black-hover text-white transition-all shadow-sm cursor-pointer"
          aria-label="Run Diagnostic"
        >
          Run Diagnostic
        </motion.button>
        <span className="text-xs text-slate-500 font-medium">{engine.badge}</span>
      </div>
    </motion.div>
  );
};
