import { motion } from 'motion/react';
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
      className="ds-card overflow-hidden flex flex-col justify-between"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: 'easeOut', staggerChildren: 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.16 } }}
    >
      <div>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border bg-white/[0.02]">
          <span className="framer-micro-tag px-2.5 py-0.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20">
            {engine.category}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setFavorited((prev) => !prev)}
            className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
            aria-label={favorited ? 'Unfavorite engine' : 'Favorite engine'}
          >
            {favorited ? (
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            ) : (
              <Bookmark className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </motion.button>
        </div>
        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="framer-card-title text-foreground">{engine.name}</h3>
          <p className="framer-body-text text-xs">{engine.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2 pt-2">
            {engine.metrics.map((m, idx) => (
              <span
                key={idx}
                className="framer-micro-tag px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/10"
              >
                <strong className="text-foreground">{m.label}:</strong> {m.value}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Action */}
      <div className="p-5 pt-0 flex items-center justify-between mt-4">
        <motion.button
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="ds-btn ds-btn-primary text-xs"
          aria-label="Run Diagnostic"
        >
          Run Diagnostic
        </motion.button>
        <span className="framer-micro-tag text-muted-foreground">{engine.badge}</span>
      </div>
    </motion.div>
  );
};
