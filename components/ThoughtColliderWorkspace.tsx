'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, HelpCircle, Link2, Zap, RotateCcw, Sparkles } from 'lucide-react';

export interface HypothesisComponent {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'number';
  numMin?: number;
  numMax?: number;
}

interface ThoughtColliderWorkspaceProps {
  onCollide: (serializedInput: string) => void;
  loading: boolean;
}

export const ThoughtColliderWorkspace: React.FC<ThoughtColliderWorkspaceProps> = ({ onCollide, loading }) => {
  // Pre-populate with typical agronomy & meteorology research equation variables to make it relevant
  const [components, setComponents] = useState<HypothesisComponent[]>([
    { id: '1', label: 'Thermal Stress Threshold', value: '38', type: 'number', numMin: 0, numMax: 100 },
    { id: '2', label: 'Objective Crop Focus', value: 'Indica Rice Spikelet Fertility', type: 'text' },
    { id: '3', label: 'Environmental Stressor', value: 'Vapor Pressure Deficit (VPD)', type: 'text' }
  ]);

  const [doiRef, setDoiRef] = useState('');
  const [showDoi, setShowDoi] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [collisionPhase, setCollisionPhase] = useState<'idle' | 'charging' | 'colliding' | 'exploding'>('idle');

  // Trigger auto-conversion: if input value matches a pure number pattern, offer to switch type
  const handleValueChange = (id: string, value: string) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isNum = !isNaN(Number(value)) && value.trim() !== '';
          return {
            ...c,
            value,
            // Pro-active UI: Auto-toggle slider option metadata but keep original text choice unless model clicks
            numMin: isNum ? c.numMin || 0 : undefined,
            numMax: isNum ? c.numMax || 100 : undefined,
          };
        }
        return c;
      })
    );
  };

  const toggleType = (id: string) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newType = c.type === 'text' ? 'number' : 'text';
          const newValue = newType === 'number' ? '50' : '';
          return {
            ...c,
            type: newType,
            value: newValue,
            numMin: newType === 'number' ? 0 : undefined,
            numMax: newType === 'number' ? 100 : undefined
          };
        }
        return c;
      })
    );
  };

  const addComponent = () => {
    if (components.length < 5) {
      const id = Math.random().toString(36).substring(2, 9);
      setComponents([
        ...components,
        { id, label: 'New Factor', value: '', type: 'text' }
      ]);
    }
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  // Compile serialized academic multivariable equation for LLM consumption
  const getSerializedString = () => {
    const vars = components.map((c, i) => {
      const prefix = c.type === 'number' ? `[Quantitative Parameter ${i + 1}]` : `[Conceptual Premise ${i + 1}]`;
      return `${prefix} ${c.label || 'Unnamed Variable'}: ${c.value || 'Unspecified'}`;
    }).join('\n');

    let finalStr = `THOUGHT COLLIDER EQUATION:\n${vars}`;
    if (doiRef.trim()) {
      finalStr += `\n\nCOLLATERAL ANCHOR REFERENCE (Optional DOI): ${doiRef.trim()}`;
    }
    return finalStr;
  };

  const handleCollisionTrigger = () => {
    if (components.length === 0) return;
    
    // Start particle collision choreographies
    setIsColliding(true);
    setCollisionPhase('charging');

    // M3 Interaction: Charge, Collide, Explode keyframe intervals
    setTimeout(() => {
      setCollisionPhase('colliding');
    }, 600);

    setTimeout(() => {
      setCollisionPhase('exploding');
    }, 1100);

    setTimeout(() => {
      setCollisionPhase('idle');
      setIsColliding(false);
      // Fuses elements and posts to orchestrator
      onCollide(getSerializedString());
    }, 1600);
  };

  // Preview Equation in real-time
  const formulaPreview = components
    .map(c => `${c.label || '?'}: ${c.value || '?'}`)
    .join(' ⚗️ ');

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Dynamic Hypothesis Vector Formula preview board */}
      <div className="p-3 bg-white/70 border border-[#68BA7F]/20 rounded-2xl flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#2E6F40] tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#2E6F40]" /> Dynamic Collision Vector
          </span>
          <span className="font-mono bg-[#E8F2EA] px-1.5 py-0.5 rounded border border-[#68BA7F]/35">
            {components.length}/5 Axioms
          </span>
        </div>
        <p className="text-xs font-mono text-[#253D2C]/80 line-clamp-2 italic truncate">
          {formulaPreview || 'Add conceptual parameters below to define your scientific formula...'}
        </p>
      </div>

      {/* Adaptive Workspace Grid Container */}
      <div className="flex-1 bg-[#EEF4EF]/60 p-4 border border-[#68BA7F]/25 rounded-[1.5rem] flex flex-col min-h-[320px] relative overflow-hidden">
        
        {/* Collision Animation Stage */}
        <AnimatePresence>
          {isColliding && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#253D2C] z-50 flex items-center justify-center p-6 text-center"
            >
              <div className="relative w-full max-w-xs flex items-center justify-center h-full">
                {/* Simulated collider ring */}
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                  className="absolute w-44 h-44 rounded-full border-2 border-dashed border-[#68BA7F]/30"
                />

                {collisionPhase === 'charging' && (
                  <div className="space-y-4">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 0.9, 1.3, 0.8] }}
                      transition={{ duration: 0.6 }}
                      className="text-[#68BA7F] font-mono text-xs uppercase tracking-widest font-bold"
                    >
                      🧪 Charging Magnetic Ring...
                    </motion.div>
                    <div className="flex justify-between w-40 mx-auto mt-2">
                      <motion.div animate={{ x: [-40, -10] }} className="w-4 h-4 rounded-full bg-[#68BA7F]" />
                      <motion.div animate={{ x: [40, 10] }} className="w-4 h-4 rounded-full bg-[#68BA7F]" />
                    </div>
                  </div>
                )}

                {collisionPhase === 'colliding' && (
                  <div className="space-y-4">
                    <motion.div 
                      className="text-white font-mono text-xs uppercase tracking-widest font-bold glow-green"
                    >
                      💥 High Velocity Collision!
                    </motion.div>
                    <div className="relative flex items-center justify-center w-12 h-12">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0.5 }}
                        animate={{ scale: [1, 2.5, 0.1], opacity: [1, 0.9, 0] }}
                        transition={{ duration: 0.5 }}
                        className="absolute w-12 h-12 rounded-full bg-[#CFFFDC] filter blur-md"
                      />
                      <motion.div 
                        animate={{ scale: [3, 0], rotate: 180 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    </div>
                  </div>
                )}

                {collisionPhase === 'exploding' && (
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0.8, 1.3, 1], opacity: 1 }}
                      className="text-[#CFFFDC] font-mono text-xs uppercase tracking-widest font-bold"
                    >
                      ⚗️ Synthesis Eruption...
                    </motion.div>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div 
                          key={i}
                          initial={{ y: 0, opacity: 1 }}
                          animate={{ y: [0, -30 - Math.random() * 20, 20], x: [0, (i - 3) * 15], opacity: [1, 0.7, 0] }}
                          transition={{ duration: 0.5 }}
                          className="w-1.5 h-1.5 rounded-full bg-[#68BA7F]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Component Cards Stack */}
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1.5">
          <AnimatePresence initial={false}>
            {components.map((comp, idx) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="p-3.5 bg-white rounded-2xl border border-[#68BA7F]/20 flex flex-col gap-3.5 shadow-sm group hover:border-[#68BA7F]/40 transition-colors duration-150"
              >
                {/* Header row: Label input + slider switch toggle + X */}
                <div className="flex items-center gap-2 justify-between">
                  <input
                    type="text"
                    value={comp.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, label: val } : c));
                    }}
                    placeholder={`Factor ${idx + 1}`}
                    className="text-xs font-bold font-mono text-[#253D2C] bg-transparent border-b border-[#68BA7F]/20 focus:border-[#2E6F40] focus:outline-none py-0.5 px-0.5 grow max-w-[180px]"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle range button */}
                    <button
                      type="button"
                      onClick={() => toggleType(comp.id)}
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#F4F9F5] border border-[#68BA7F]/25 text-[#2E6F40] hover:bg-[#68BA7F]/10 transition-colors"
                    >
                      {comp.type === 'number' ? 'Slider' : 'Text'}
                    </button>

                    {/* Drag/Trash removal */}
                    <button
                      type="button"
                      onClick={() => removeComponent(comp.id)}
                      className="p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="Eliminate this conceptual parameter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body value input logic */}
                <div className="flex-1">
                  {comp.type === 'number' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#2E6F40]">
                        <span>Range value</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={comp.value}
                            onChange={(e) => handleValueChange(comp.id, e.target.value)}
                            className="w-12 text-center border-b border-[#68BA7F]/30 bg-[#F4F9F5] py-0.5 px-0.5 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={comp.numMin ?? 0}
                        max={comp.numMax ?? 100}
                        value={isNaN(Number(comp.value)) ? 50 : Number(comp.value)}
                        onChange={(e) => handleValueChange(comp.id, e.target.value)}
                        className="w-full accent-[#2E6F40] h-1.5 bg-[#EEF4EF] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ) : (
                    <textarea
                      value={comp.value}
                      onChange={(e) => handleValueChange(comp.id, e.target.value)}
                      placeholder="Hypothesis statement, control values, or operational boundary variables..."
                      className="w-full text-xs p-2 rounded-xl border border-[#68BA7F]/15 bg-[#F4F9F5]/40 text-[#253D2C] placeholder:text-[#2E6F40]/50 focus:outline-none focus:border-[#2E6F40] resize-none h-16 shadow-inner font-mono"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {components.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center justify-center text-[#2E6F40]/60 gap-1.5">
              <HelpCircle className="w-8 h-8 text-[#2E6F40]/30 animate-pulse" />
              <p className="text-xs font-mono">Thought Collider stage is clean.</p>
              <button onClick={addComponent} className="text-xs text-[#2E6F40] font-bold underline mt-1">Add initial premises</button>
            </div>
          )}
        </div>

        {/* Extended FAB alignment - absolute control */}
        {components.length < 5 && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={addComponent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E5ECE7] hover:bg-[#D0E6D6] border border-[#68BA7F]/35 text-xs font-bold text-[#2E6F40] shadow-sm hover:shadow-md transition-all active:scale-95 duration-100 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              <span>Extend Axiom ({components.length}/5)</span>
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Supplemental Reference Field */}
      <div className="border border-[#68BA7F]/20 rounded-2xl bg-[#F4F9F5]/40 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowDoi(!showDoi)}
          className="w-full py-2.5 px-3 bg-[#EEF4EF] flex items-center justify-between text-[#2E6F40] font-bold uppercase tracking-wider text-[10px]"
        >
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Core Citation Anchor
          </span>
          <span className="font-mono text-[9px] bg-white border border-[#68BA7F]/25 text-[#2E6F40]/80 px-1 py-0.5 rounded capitalize">
            {doiRef.trim() ? 'Attached' : 'Optional'}
          </span>
        </button>
        <AnimatePresence>
          {showDoi && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-[#68BA7F]/15 bg-white"
            >
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-[#2E6F40]/70 leading-relaxed">
                  Lock a target DOI or ArXiv ID. The retrieval engine will bind the paper as gravitational mass inside the synthesis.
                </p>
                <input
                  type="text"
                  placeholder="e.g. 10.1111/j.1365-2486.2007.01429.x"
                  value={doiRef}
                  onChange={(e) => setDoiRef(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 text-[#253D2C] border border-[#68BA7F]/35 rounded-xl bg-[#F4F9F5]/30 focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Heavy CTA Tonal Collider Button */}
      <button
        onClick={handleCollisionTrigger}
        disabled={loading || isColliding || components.length === 0}
        className="w-full py-3.5 bg-[#2E6F40] hover:bg-[#1E4A2A] text-white font-bold rounded-[1.25rem] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
      >
        <Zap className="w-4 h-4 text-white" />
        {loading ? 'Processing Reaction...' : isColliding ? 'COLLIDING CONCEPTS...' : 'Collide Concepts'}
      </button>
    </div>
  );
};
