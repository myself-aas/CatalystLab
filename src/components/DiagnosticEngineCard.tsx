import { motion } from 'framer-motion';
import { useState } from 'react';
import { Engine } from '../data/diagnosticEngines';
import { Heart, Bookmark } from 'lucide-react';

interface Props {
  engine: Engine;
}

export const DiagnosticEngineCard: React.FC<Props> = ({ engine }) => {
  const [favorited, setFavorited] = useState(false);

  // Determine if the engine is in dark mode. The component supports both
  // explicit theme via `engine.theme` and Tailwind's `dark:` variant.
  const isDark = engine.theme === 'dark';

  // Card background: glassmorphic effect with subtle gradient. Dark mode
  // uses a darker gradient; light mode uses a light glass effect.
  const cardBg = isDark
    ? 'bg-gradient-to-b from-slate-900 via-gray-900 to-black'
    : 'bg-white/20 backdrop-blur-lg border border-gray-100';

  // Text colors using Tailwind dark variants for consistency.
  const textColor = 'text-gray-900 dark:text-white';
  const subtitleColor = 'text-gray-600 dark:text-gray-300';

  // Header background: light gradient with rounded corners in light mode,
  // subtle glass effect in dark mode.
  const headerBg = 'bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-[28px] dark:bg-white/10 dark:backdrop-blur-md';

  return (
      <motion.div
        className={`rounded-[36px] overflow-hidden shadow-lg ${cardBg}`}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, ease: 'easeOut', staggerChildren: 0.05 }}
        whileHover={{ y: -6, scale: 1.01, transition: { stiffness: 300, damping: 20 } }}
      >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${headerBg}`}>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
          {engine.category}
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFavorited((prev) => !prev)}
          className="p-1 rounded-full hover:bg-white/20"
          aria-label={favorited ? 'Unfavorite engine' : 'Favorite engine'}
        >
          {favorited ? (
            <Heart className="w-5 h-5 text-red-500" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-400" />
          )}
        </motion.button>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className={`text-2xl font-bold ${textColor}`}>{engine.name}</h3>
        <p className={`mt-1 ${subtitleColor}`}>{engine.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {engine.metrics.map((m, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
            >
              {m.label}: {m.value}
            </span>
          ))}
        </div>
      </div>
      {/* Action */}
      <div className="p-4 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full font-medium ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
          aria-label="Run Diagnostic"
        >
          Run Diagnostic
        </motion.button>
          <span className="text-xs text-gray-400">{engine.badge}</span>
      </div>
    </motion.div>
  );
};
