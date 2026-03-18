'use client';

import React from 'react';
import { motion } from 'motion/react';

export function NoveltyScore({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="var(--border-subtle)"
            strokeWidth="6"
            fill="transparent"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke="var(--accent)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[20px] font-mono font-semibold text-[var(--text-primary)]">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase mt-2">Novelty Score</span>
    </div>
  );
}

export function PressureGauge({ score }: { score: number }) {
  const color = score < 30 ? 'var(--rose)' : score < 60 ? 'var(--amber)' : 'var(--emerald)';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-20 overflow-hidden">
        <svg className="w-32 h-32">
          <path
            d="M 10 80 A 50 50 0 0 1 110 80"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.path
            d="M 10 80 A 50 50 0 0 1 110 80"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="157"
            initial={{ strokeDashoffset: 157 }}
            animate={{ strokeDashoffset: 157 - (score / 100) * 157 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-[24px] font-mono font-semibold text-[var(--text-primary)]">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase mt-1">Pressure Score</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: 'Thinking' | 'Complete' | 'Error' }) {
  const colors = {
    Thinking: { bg: 'var(--amber-muted)', text: 'var(--amber)', dot: true },
    Complete: { bg: 'var(--emerald-muted)', text: 'var(--emerald)', dot: false },
    Error: { bg: 'var(--rose-muted)', text: 'var(--rose)', dot: false },
  };
  const config = colors[status];

  return (
    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: config.bg, color: config.text }}>
      {config.dot && (
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      )}
      {status}
    </div>
  );
}
