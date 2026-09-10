import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Layers, Terminal } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const PlainArrowLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="group inline-flex items-center text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-auto pt-4">
    {label}
    <ArrowRight className="ml-1.5 size-3.5 sm:size-4 stroke-[1.5] transition-transform group-hover:translate-x-1" />
  </Link>
);

const CardBase = ({ children, className = "", delay = 0, span = 1 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`group relative bg-card rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 flex flex-col hover:-translate-y-1.5 transition-all duration-300 border border-border/60 shadow-sm hover:shadow-md ${span === 2 ? 'col-span-2' : 'col-span-1'} ${className}`}
  >
    {children}
  </motion.div>
);

const BarChartCard = ({ delay }: { delay: number }) => (
  <CardBase delay={delay}>
    <div className="flex justify-between items-start mb-6 sm:mb-8">
      <h3 className="text-base sm:text-xl font-medium text-foreground tracking-tight">Consumption</h3>
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 sm:size-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-wider hidden sm:inline-block">Live</span>
      </div>
    </div>
    
    <div className="flex items-end justify-between h-16 sm:h-28 gap-1 sm:gap-3 mb-4 mt-auto">
      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
        <div key={i} className="w-full bg-foreground/5 rounded-t-full relative flex flex-col justify-end overflow-hidden h-full group-hover:bg-foreground/10 transition-colors duration-300">
           <motion.div 
             initial={{ height: 0 }}
             whileInView={{ height: `${h}%` }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: delay + i * 0.05, ease: 'easeOut' }}
             className="w-full bg-blue-400 rounded-t-full opacity-90"
           />
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest font-mono mb-6 sm:mb-8">
      <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
    </div>
    
    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">VitalZyme</h4>
    <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">Web Vitals & Performance.</p>
    <PlainArrowLink to="/docs/vitalzyme" label="View details" />
  </CardBase>
);

const DotMatrixCard = ({ delay }: { delay: number }) => {
  const rows = 7;
  const data = [1, 2, 4, 3, 5, 7, 6, 4, 3, 2, 4, 5, 6, 4]; 
  
  return (
    <CardBase delay={delay}>
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 block">Routing</span>
          <h3 className="text-2xl sm:text-4xl font-light text-foreground tracking-tighter mt-1">+326<span className="text-sm sm:text-xl text-muted-foreground">%</span></h3>
        </div>
      </div>
      
      <div className="h-16 sm:h-28 flex items-end justify-between gap-[2px] sm:gap-1.5 mb-6 sm:mb-8 mt-auto">
        {data.map((val, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-[2px] sm:gap-1.5 justify-end h-full">
            {[...Array(rows)].map((_, rowIdx) => {
              const isFilled = (rows - rowIdx) <= val;
              return (
                <motion.div 
                  key={rowIdx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: isFilled ? 1 : 0.15, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: delay + colIdx * 0.03 }}
                  className={`size-[3px] sm:size-2 rounded-full ${isFilled ? 'bg-foreground' : 'bg-foreground/20'}`} 
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Edge-V-Max</h4>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">Global Routing Intelligence.</p>
      <PlainArrowLink to="/docs/edgevmax" label="View details" />
    </CardBase>
  );
};

const SegmentedThresholdCard = ({ delay }: { delay: number }) => (
  <CardBase delay={delay} span={2}>
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      <div className="flex-1 flex flex-col justify-center order-2 lg:order-1">
        <h4 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mb-2 sm:mb-3">RiskProtease</h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
          Set custom thresholds and receive instant Slack or email notifications at 80% usage so you can course-correct long before vulnerabilities explode.
        </p>
        <PlainArrowLink to="/docs/riskprotease" label="View details" />
      </div>
      
      <div className="flex-1 bg-foreground/[0.02] rounded-[16px] sm:rounded-[24px] p-4 sm:p-8 border border-foreground/5 flex flex-col justify-center relative overflow-hidden group-hover:bg-foreground/[0.04] transition-colors duration-500 order-1 lg:order-2">
         <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-muted-foreground mb-4 sm:mb-6">
           <span>Q1 - Q2</span>
           <span className="text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded-full">68%</span>
         </div>
         
         <div className="relative h-24 sm:h-36 flex items-end justify-between gap-2 sm:gap-6 z-10 mt-auto">
            <div className="absolute top-[30%] left-0 right-0 border-t border-dashed border-foreground/20 z-0" />
            
            {[
              { val: 60, label: 'CSP' },
              { val: 85, label: 'TLS' },
              { val: 40, label: 'XSS' },
              { val: 75, label: 'Auth' }
            ].map((item, i) => (
              <div key={i} className="w-full h-full relative flex flex-col justify-end z-10">
                <div className="absolute inset-0 bg-foreground/5 rounded-xl sm:rounded-2xl border border-foreground/10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.02) 8px)' }} />
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: `${item.val}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: delay + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#1A1D21] border border-white/10 rounded-xl sm:rounded-2xl relative flex items-end justify-center pb-2 sm:pb-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                >
                  <span className="text-[8px] sm:text-[10px] lg:text-xs font-mono text-foreground font-medium">{item.label}</span>
                </motion.div>
              </div>
            ))}
         </div>
      </div>
    </div>
  </CardBase>
);

const LayeredCodeCard = ({ delay }: { delay: number }) => (
  <CardBase delay={delay} span={2}>
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      <div className="flex-1 relative min-h-[220px] sm:min-h-[280px] flex items-center justify-center perspective-[1000px] mb-4 lg:mb-0">
         <div className="absolute inset-2 sm:inset-6">
            <div className="absolute inset-0 bg-foreground/[0.03] rounded-[20px] sm:rounded-3xl border border-foreground/10 transform rotate-[-4deg] translate-y-4 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:translate-y-2" />
            <div className="absolute inset-0 bg-foreground/[0.05] rounded-[20px] sm:rounded-3xl border border-foreground/10 transform rotate-[-2deg] translate-y-2 transition-transform duration-500 group-hover:rotate-[-3deg] group-hover:translate-y-1" />
            
            <div className="absolute inset-0 bg-card rounded-[20px] sm:rounded-3xl border border-border shadow-xl p-4 sm:p-6 flex flex-col transform transition-transform duration-500 group-hover:translate-y-0 group-hover:scale-[1.02] overflow-hidden">
                <div className="flex gap-1 sm:gap-1.5 mb-4 sm:mb-6">
                  <div className="size-2 sm:size-3 rounded-full bg-red-400/80" />
                  <div className="size-2 sm:size-3 rounded-full bg-amber-400/80" />
                  <div className="size-2 sm:size-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="font-mono text-[9px] sm:text-xs leading-loose text-muted-foreground whitespace-pre overflow-x-auto no-scrollbar">
                  <span className="text-purple-400">class</span> <span className="text-amber-400">LLMKinase</span>:<br/>
                  &nbsp;&nbsp;<span className="text-blue-400">def</span> <span className="text-emerald-400">__init__</span>(self):<br/>
                  <span className="opacity-50 mt-1 sm:mt-2 block"># AI Manifest Validation</span>
                  &nbsp;&nbsp;<span className="text-blue-400">def</span> <span className="text-emerald-400">validate</span>(self):<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="bg-blue-500/20 text-blue-300 px-1 sm:px-1.5 py-0.5 rounded">self.check()</span>
                </div>
                
                {/* Floating Tag */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.5 }}
                  className="absolute right-3 bottom-3 sm:-right-2 sm:-bottom-2 bg-background border border-border shadow-lg rounded-full px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1.5 sm:gap-2 z-10"
                >
                  <div className="size-1.5 sm:size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] sm:text-xs font-mono font-medium text-foreground">Valid</span>
                </motion.div>
            </div>
         </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mb-2 sm:mb-3">LLM-Kinase</h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
          AI Manifests & Crawler Readiness. Ensures your structure is optimized for Gemini and Claude consumption with semantic vector alignment.
        </p>
        <PlainArrowLink to="/docs/llm-kinase" label="View details" />
      </div>
    </div>
  </CardBase>
);

const TimelineCard = ({ delay }: { delay: number }) => (
  <CardBase delay={delay}>
    <div className="flex justify-between items-start mb-6 sm:mb-8">
      <span className="text-[8px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Migrations</span>
      <span className="text-[8px] sm:text-[10px] font-mono text-foreground uppercase tracking-widest bg-foreground/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">AST</span>
    </div>
    
    <div className="flex-1 flex flex-col gap-3 sm:gap-5 mb-6 sm:mb-10 justify-center mt-auto">
       {[
         { label: '0:46', pattern: ['w-2 sm:w-3 bg-red-400', 'w-3 sm:w-5 bg-red-400'] },
         { label: '1:32', pattern: ['w-4 sm:w-8 bg-foreground/20', 'w-6 sm:w-10 bg-foreground/20', 'w-3 sm:w-6 bg-foreground/20'] },
         { label: '4:54', pattern: ['w-3 sm:w-5 bg-foreground/40', 'w-2 sm:w-3 bg-foreground/40', 'w-8 sm:w-16 bg-foreground/40', 'w-4 sm:w-8 bg-foreground/40'] },
         { label: '8:12', pattern: ['w-4 sm:w-8 bg-foreground', 'w-6 sm:w-12 bg-foreground'] },
       ].map((row, i) => (
         <div key={i} className="flex items-center gap-2 sm:gap-4">
           <span className="text-[9px] sm:text-xs font-mono text-muted-foreground w-6 sm:w-8">{row.label}</span>
           <div className="flex items-center gap-1 sm:gap-2 flex-1">
             {row.pattern.map((p, j) => (
               <motion.div 
                 key={j} 
                 initial={{ scaleX: 0, opacity: 0 }}
                 whileInView={{ scaleX: 1, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: delay + i * 0.1 + j * 0.05 }}
                 className={`h-1.5 sm:h-2 rounded-full origin-left ${p}`} 
               />
             ))}
           </div>
         </div>
       ))}
    </div>
    
    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">SynthShift</h4>
    <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">AST Codemods & Migrations.</p>
    <PlainArrowLink to="/docs/synthshift" label="View details" />
  </CardBase>
);

const MetricCard = ({ delay }: { delay: number }) => (
  <CardBase delay={delay}>
    <div className="flex justify-between items-start mb-4 sm:mb-6">
       <div className="size-8 sm:size-12 rounded-full bg-foreground flex items-center justify-center">
         <Terminal className="size-3.5 sm:size-5 text-background stroke-[1.5]" />
       </div>
    </div>
    
    <div className="flex flex-col mb-6 sm:mb-8 mt-auto">
      <span className="text-[8px] sm:text-[10px] font-mono font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-widest">Success Rate</span>
      <h3 className="text-3xl sm:text-6xl font-light text-foreground tracking-tighter mb-3 sm:mb-4">
        99<span className="text-xl sm:text-3xl text-muted-foreground">.8%</span>
      </h3>
      
      <div className="flex gap-2 sm:gap-3 items-center">
        <div className="h-1 sm:h-1.5 flex-1 bg-emerald-400/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '99.8%' }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
            className="h-full bg-emerald-400 rounded-full" 
          />
        </div>
        <span className="text-[8px] sm:text-[10px] font-mono text-emerald-400 font-medium bg-emerald-400/10 px-1.5 sm:px-2 py-0.5 rounded">+1.2%</span>
      </div>
    </div>
    
    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Git-Lygase</h4>
    <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">CI/CD Pipeline Audits.</p>
    <PlainArrowLink to="/docs/gitlygase" label="View details" />
  </CardBase>
);

export const EnzymeGrid: React.FC = () => {
  return (
    <section id="engines" className="ds-section relative overflow-hidden">
      <div className="relative z-10 ds-page-shell">
        <SectionHeader
          eyebrow={
            <>
              <Layers className="size-3.5 text-[var(--accent-framer-blue)]" />
              <span>Autonomous engines</span>
            </>
          }
          title="A lab, not a lighthouse."
          description="Each catalyst maps to a phase of the SDLC — migration, hygiene, carbon, vitals, edge, security, AI readiness, and generative search."
        />

        <div className="mt-8 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-[1200px] mx-auto px-4 sm:px-6">
          <BarChartCard delay={0.1} />
          <DotMatrixCard delay={0.2} />
          <SegmentedThresholdCard delay={0.3} />
          
          <LayeredCodeCard delay={0.1} />
          <TimelineCard delay={0.2} />
          <MetricCard delay={0.3} />
        </div>
      </div>
    </section>
  );
};

export default EnzymeGrid;
