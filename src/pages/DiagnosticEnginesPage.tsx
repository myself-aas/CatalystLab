import { motion } from 'framer-motion';
import { engines } from '../data/diagnosticEngines';
import { DiagnosticEngineCard } from '../components/DiagnosticEngineCard';

export const DiagnosticEnginesPage: React.FC = () => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h1 className="text-3xl font-bold mb-6">Diagnostic Engines</h1>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
          hidden: {},
        }}
        initial="hidden"
        animate="visible"
      >
        {engines.map((engine) => (
          <DiagnosticEngineCard key={engine.id} engine={engine} />
        ))}
      </motion.div>
    </motion.div>
  );
};
