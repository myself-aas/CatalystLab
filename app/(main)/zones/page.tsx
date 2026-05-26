'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Workflow, Network, Fingerprint, Activity, Layers } from 'lucide-react';

export default function ZonesPage() {
  const [activeTab, setActiveTab] = useState('A');

  const tabs = [
    { id: 'A', label: 'Zone A', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'B', label: 'Zone B', icon: <Workflow className="w-4 h-4" /> },
    { id: 'C', label: 'Zone C', icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col space-y-8 p-1">
      <div>
        <h1 className="text-3xl font-bold text-[#253D2C] tracking-tight">Experimental Zones</h1>
        <p className="text-[#2E6F40]/80 mt-2">
          Adaptive Material 3 expressing tab configurations framing isolated operating environments.
        </p>
      </div>

      {/* Material 3 Expressive Tabs */}
      <div className="self-start relative bg-white/60 p-1.5 rounded-2xl inline-flex gap-1 border border-[#68BA7F]/20 shadow-sm backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-[14px] text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-[#1E4D2B]' : 'text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#68BA7F]/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="m3-expressive-tab"
                  className="absolute inset-0 bg-[#CFFFDC] rounded-[14px] shadow-sm border border-[#68BA7F]/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Zone */}
      <div className="bg-white rounded-[2rem] border border-[#68BA7F]/20 shadow-lg min-h-[400px] p-8 md:p-12 relative overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex flex-col"
          >
            {activeTab === 'A' && (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#CFFFDC]/50 flex items-center justify-center border border-[#68BA7F]/30 shadow-inner">
                  <Fingerprint className="w-7 h-7 text-[#1E4D2B]" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#68BA7F] tracking-widest uppercase mb-1">
                    Environment Phase 1
                  </div>
                  <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">Zone A: Primary Configuration</h2>
                </div>
                <p className="text-[#2E6F40]/80 leading-relaxed max-w-2xl text-lg font-medium">
                  This zone handles initial payload parameters, fundamental constants, and core metrics for the layout container. All primary variable states originate from this secure environment.
                </p>
                <div className="bg-[#FAFDF6] border border-[#68BA7F]/20 rounded-2xl p-6 mt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <Activity className="w-5 h-5 text-[#2E6F40]" />
                     <span className="font-mono text-sm text-[#253D2C] font-semibold">Node Status: INITIALIZING</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5F3E9] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#68BA7F]" 
                      initial={{ width: 0 }} 
                      animate={{ width: '45%' }} 
                      transition={{ delay: 0.2, duration: 0.8 }} 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'B' && (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <Workflow className="w-7 h-7 text-amber-700" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-500 tracking-widest uppercase mb-1">
                    Environment Phase 2
                  </div>
                  <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">Zone B: Orchestration Variables</h2>
                </div>
                <p className="text-[#2E6F40]/80 leading-relaxed max-w-2xl text-lg font-medium">
                  Dedicated to dynamic pipeline scheduling, sequential logic processing, and multi-stage workflow transitions. Handles all asynchronous state propagation across the system architecture.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white border border-[#68BA7F]/20 rounded-2xl p-5 shadow-sm">
                     <span className="text-sm font-bold text-[#253D2C]">Fan-out Processes</span>
                     <div className="font-mono text-2xl text-[#2E6F40] mt-1">17 Nodes</div>
                  </div>
                  <div className="bg-white border border-[#68BA7F]/20 rounded-2xl p-5 shadow-sm">
                     <span className="text-sm font-bold text-[#253D2C]">Execution Rate</span>
                     <div className="font-mono text-2xl text-[#2E6F40] mt-1">~1.2s</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'C' && (
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-300/30 shadow-inner">
                  <Network className="w-7 h-7 text-indigo-700" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-indigo-500 tracking-widest uppercase mb-1">
                    Environment Phase 3
                  </div>
                  <h2 className="text-3xl font-bold text-[#253D2C] tracking-tight">Zone C: Synthesis Matrix</h2>
                </div>
                <p className="text-[#2E6F40]/80 leading-relaxed max-w-2xl text-lg font-medium">
                  Where output resolution occurs. Data nodes from Zone A and Workflow states from Zone B converge here, feeding into the high-performance inference Engine for dynamic synthesis.
                </p>
                <div className="mt-8 flex items-center justify-center p-8 border-2 border-dashed border-[#68BA7F]/30 rounded-2xl bg-[#FAFDF6]">
                   <div className="text-center space-y-3">
                     <Layers className="w-8 h-8 text-[#68BA7F] mx-auto opacity-70" />
                     <p className="text-sm font-mono text-[#2E6F40]/70 uppercase font-bold tracking-wider">Awaiting Convergence</p>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
