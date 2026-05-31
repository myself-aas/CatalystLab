'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  BrainCircuit, 
  Search, 
  Zap, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Database,
  Sparkles,
  Compass,
  Eye,
  Activity,
  ShieldAlert,
  Scissors,
  Layers,
  Play,
  Loader2,
  CheckCircle2,
  Network,
  Cpu,
  ArrowUpRight,
  FileCode,
  Check
} from 'lucide-react';

const ZONES = [
  {
    id: 'zone-a',
    title: 'Zone A',
    subtitle: 'Idea Catalyst',
    description: 'Specialized in divergent thinking, breaking established academic dogmas, and generating lateral connections across remote fields.',
    count: '7 Tools',
    color: 'from-[#68BA7F] to-[#2E6F40]',
    bgLight: 'bg-[#CFFFDC]/10',
    borderCol: 'border-[#68BA7F]/30',
    tools: [
      {
        name: 'Thought Collider',
        tagline: 'Cross-Disciplinary Fusion',
        desc: 'Slam two completely unrelated research fields together to forge unexpected cross-disciplinary hypotheses.',
        action: 'Try fusing: Quantum Computing × Behavioral Economics',
        output: 'Result: Design of a non-cooperative quantum market protocol with bounds for boundedly rational bidders.',
        icon: 'Zap'
      },
      {
        name: 'Research Multiverse',
        tagline: 'Dimensional Reframing',
        desc: 'Simulate your core thesis across 15 alternate socio-economic, environmental, or biological constraint universes.',
        action: 'Try constraint: Resource Scarcity (Zero Helium Global Supply)',
        output: 'Result: Formulation of a low-temperature substitute state paradigm shift for superconductivity models.',
        icon: 'Compass'
      },
      {
        name: 'Concept Alchemy',
        tagline: 'Conceptual Transmutation',
        desc: 'Synthesize dense qualitative parameters and theoretical jargon into coherent metaphors & actionable systems.',
        action: 'Try parameter: Heavy Particle Entropy Decay',
        output: 'Result: Simplified "Vapor-Phase Thermal Leaking" analogy, establishing 3 clear verification experiments.',
        icon: 'Sparkles'
      }
    ]
  },
  {
    id: 'zone-b',
    title: 'Zone B',
    subtitle: 'Analytical Foundry',
    description: 'Empowers convergent deduction, rigorous constraint identification, prejudice scanning, and deep contradiction search.',
    count: '7 Tools',
    color: 'from-[#2E6F40] to-[#1E4D2B]',
    bgLight: 'bg-[#2E6F40]/5',
    borderCol: 'border-[#2E6F40]/30',
    tools: [
      {
        name: 'Pressure Chamber',
        tagline: 'Adversarial Blind Audit',
        desc: 'Subject your theoretical drafts to high-intensity, automated reviews mimicking ruthless top-tier journal referee attacks.',
        action: 'Review target: "Methodology Section on Small-Sample Bias"',
        output: 'Vulnerability found: "Potential under-reporting of self-selection bias in non-random digital registries. Remediation: Add inverse-covariance weighting control."',
        icon: 'ShieldAlert'
      },
      {
        name: 'Contradiction Finder',
        tagline: 'Discrepancy Detection',
        desc: 'Scans text corpora, literature reviews, and preprints to map contradictory claims and unresolved scholarly debates.',
        action: 'Scan subject: "Lithium-Ion Cathode Degradation Rates"',
        output: 'Contradiction flagged: "Model A claims 0.05% degradation; empirical Study B reports 0.23% under thermal stress. Unmapped variable: Humidity factor."',
        icon: 'Activity'
      },
      {
        name: 'Boundary Scalpel',
        tagline: 'Limits of Applicability',
        desc: 'Identify the exact mathematical, sociological, or thermodynamic bounds where your models break down.',
        action: 'Trace bounds of: "Decentralized Credit Token Pricing Models"',
        output: 'Breakdown conditions: "Requires continuous transaction liquidity. Model collapses when high-slippage intervals exceed 4 seconds."',
        icon: 'Scissors'
      }
    ]
  },
  {
    id: 'zone-c',
    title: 'Zone C',
    subtitle: 'Strategic Discovery',
    description: 'Deciphers macro-trends, maps emerging scientific frontiers, and uncovers highly valuable commercial transitions.',
    count: '7 Tools',
    color: 'from-[#68BA7F] to-[#1E4D2B]',
    bgLight: 'bg-[#CFFFDC]/20',
    borderCol: 'border-[#68BA7F]/40',
    tools: [
      {
        name: 'Temporal Telescope',
        tagline: 'Multi-Decade Projections',
        desc: 'Extrapolate currently microscopic technical signals into macro-level future paradigms for 2040 and beyond.',
        action: 'Focal target: "Ribosomal RNA vaccine synthesis speeds"',
        output: 'Projection: "By 2038, standard biological printing networks may shift toward decentralized point-of-care, making centralized logistics pipelines obsolete."',
        icon: 'Eye'
      },
      {
        name: 'Serendipity Radar',
        tagline: 'Semantic Bridge Builder',
        desc: 'Calculate high-dimensional semantic overlaps to locate unexpected correlations and breakthroughs in adjacent papers.',
        action: 'Scan overlaps: "Nanoparticle Drug Delivery Systems"',
        output: 'Overlooked intersection found: "Soil-nutrient transport algorithms in geomorphology are mathematically isomorphic to targeted drug-release mechanisms."',
        icon: 'Layers'
      },
      {
        name: 'Horizon Mapper',
        tagline: 'Commercial Value Blueprints',
        desc: 'Chart a concrete actionable bridge from pure abstract mathematics or fundamental physics to production assets.',
        action: 'Bridge core: "Topological Insulator Supercurrents"',
        output: 'Commercial route: "1. Phase coherence protection -> 2. Spin-valve fabrication process -> 3. High-resistance memory gates for terrestrial cryogenic processors."',
        icon: 'Database'
      }
    ]
  }
];

const THINK_PILLARS = [
  {
    id: 'think-collider',
    title: 'Thought Collider',
    badge: 'Cross-Disciplinary',
    bullet: 'Hybrid premise breakthroughs',
    desc: 'Bridges deep qualitative frameworks of unrelated fields to inspire innovative avenues.',
    inputLabel: 'DISCIPLINARY PAIRS',
    mockInput: 'Quantum Decoherence × Cellular Apoptosis Signatures',
    method: 'Applies semiotic matrix maps to locate structurally isomorphic laws across domains.',
    simulatedOutput: 'Hypothesis: Microtubule quantum coherence fluctuations act as phase indicators triggering apoptosis cascade pathways in hypoxic glial tissue.'
  },
  {
    id: 'think-multiverse',
    title: 'Research Multiverse',
    badge: 'Scenario Reframing',
    bullet: 'Alternate hypothesis universes',
    desc: 'Simulates your core hypothesis under extreme biological, sociological, or environmental constraints.',
    inputLabel: 'SIMULATED DOMAIN CONSTRAINT',
    mockInput: 'Hyper-gravity (3G) microfluidics flow dynamics',
    method: 'Runs extreme-value topological parameter sweeps on fluid convection assumptions.',
    simulatedOutput: 'Outcome: Predicts viscous transition threshold collapse, shifting laminar profiles to localized convective vortex regimes under high boundary pressures.'
  },
  {
    id: 'think-finder',
    title: 'Contradiction Finder',
    badge: 'Adversarial Audit',
    bullet: 'Conflict & literature gap mapping',
    desc: 'Scans preprint corpora and historical lit to pinpoint exact points of consensus failure.',
    inputLabel: 'CONFLICT SUBJECT',
    mockInput: 'Solid-State-Electrolyte conductivity threshold bounds',
    method: 'Neural semantic contradiction extractor tags opposing claim-attribute nodes.',
    simulatedOutput: 'Vulnerability found: Paper claims high stability at 60°C. Counter-studies (DOE-2025) report dendrite propagation acceleration of 180% at 55°C due to mechanical shearing.'
  },
  {
    id: 'think-archaeology',
    title: 'Assumption Archaeology',
    badge: 'Epistemological Critique',
    bullet: 'Hidden foundational limits',
    desc: 'Deconstructs your thesis down to the absolute axioms to verify if they hold in real conditions.',
    inputLabel: 'CORE HYPOTHESIS STATEMENT',
    mockInput: 'Decentralized automated liquidity pools remain stable',
    method: 'Deconstructive logical solver parses implicit variables for physical/rational boundaries.',
    simulatedOutput: 'Uncovered latent axiom: Assumes network transaction bandwidth never suffers sustained congestion delays greater than 12 seconds.'
  }
];

const DISCOVER_PILLARS = [
  {
    id: 'discover-api',
    title: 'Parallel Fan-out API',
    badge: '17 Databases',
    bullet: 'Sub-second real-time fan-out',
    desc: 'Performs instant query translation and simultaneous request routing using lightweight server workers.',
    inputLabel: 'DISPATCHING TO CORES',
    mockInput: 'Atherosclerosis targeted polymer nanoparticles',
    method: 'Asynchronous event stream broadcasts normalized API payloads to 17 scientific repositories.',
    simulatedOutput: 'Result: Dispatched successfully. Found 31 high-confidence matches in 143ms across PubMed, arXiv, and Europe PMC.'
  },
  {
    id: 'discover-query',
    title: 'AI Query Optimization',
    badge: 'Auto-Rephrase',
    bullet: 'Algorithmic keywords expansion',
    desc: 'Converts chaotic qualitative statements into elegant boolean operators and field tags.',
    inputLabel: 'UNSTRUCTURED ABSTRACT',
    mockInput: 'we want to look at how plants on dry land deal with heat waves and drought at the same time',
    method: 'Semantically reframes unstructured input into professional academic search strings.',
    simulatedOutput: 'Optimized Boolean String: ("terrestrial vegetation" OR "angiosperms") AND "thermal stress" AND "water deficit" AND "physiological adaptation"'
  },
  {
    id: 'discover-sync',
    title: 'Cloud Sync Engine',
    badge: 'Firestore-Backed',
    bullet: 'Dynamic workspace database syncing',
    desc: 'Saves your extracted citation bibliography, session search logs, and instruments state securely.',
    inputLabel: 'WORKSPACE COLLECTION ID',
    mockInput: 'project_catalyst_epigenetics_2026',
    method: 'Reactive cloud state persistence with real-time replication and collision safeguards.',
    simulatedOutput: 'Synced Successfully: 4 papers stored in collection. Auto-indexed with 12 distinct smart tags.'
  },
  {
    id: 'discover-citation',
    title: 'Smart Citations',
    badge: '14 Formats',
    bullet: 'Dynamic BIB/RIS file exports',
    desc: 'Exports fully checked citations in BibTeX, RIS, EndNote, APA 7th, Harvard, or Nature formats.',
    inputLabel: 'TARGET RECORD',
    mockInput: 'Karas et al., Nature Materials, 2024',
    method: 'Converts unstructured metadata matrices to standardized, schema-validated formats on the fly.',
    simulatedOutput: '@article{karas24,\n  author = {Karas, J. and Linden, G.},\n  title = {Quantum phase shifts in modern topological insulators},\n  journal = {Nature Materials},\n  year = {2024}\n}'
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap': return <Zap className="w-5 h-5" />;
    case 'Compass': return <Compass className="w-5 h-5" />;
    case 'Sparkles': return <Sparkles className="w-5 h-5" />;
    case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
    case 'Activity': return <Activity className="w-5 h-5" />;
    case 'Scissors': return <Scissors className="w-5 h-5" />;
    case 'Eye': return <Eye className="w-5 h-5" />;
    case 'Layers': return <Layers className="w-5 h-5" />;
    case 'Database': return <Database className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};


export default function LandingPage() {
  const [activeZone, setActiveZone] = useState(0);
  const [activeTool, setActiveTool] = useState(0);

  // States for the interactive features section
  const [activeFeatureTab, setActiveFeatureTab] = useState<'think' | 'discover'>('think');
  const [selectedPillarItem, setSelectedPillarItem] = useState(0);
  const [isSimulatingFeature, setIsSimulatingFeature] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState<string>('IDLE');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#68BA7F]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[1rem] bg-[#CFFFDC] flex items-center justify-center border border-[#68BA7F]/50">
              <BrainCircuit className="w-5 h-5 text-[#2E6F40]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#253D2C]">CatalystLab</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2E6F40]/80">
            <a href="#features" className="hover:text-[#253D2C] transition-colors">Features</a>
            <a href="#instruments" className="hover:text-[#253D2C] transition-colors">Instruments</a>
            <a href="#sources" className="hover:text-[#253D2C] transition-colors">Sources</a>
            <Link href="/blogs" className="hover:text-[#253D2C] transition-colors">Blogs</Link>
            <a href="#pricing" className="hover:text-[#253D2C] transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium bg-[#2E6F40] text-white px-4 py-2 rounded-[1rem] hover:bg-[#253D2C] transition-colors flex items-center gap-2">
              <span>Try for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-[#F4F9F5] relative overflow-hidden">
        {/* Abstract Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#68ba7f_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        
        {/* Soft Radial Ambient Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#CFFFDC] rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#68BA7F]/10 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDuration: '7s' }} />

        {/* Decorative Connected Nodes Graph (Academic Semantics Concept) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Top Left Molecule/Node Structure */}
            <g className="opacity-20 translate-x-[8%] translate-y-[20%]">
              <line x1="20" y1="20" x2="100" y2="60" stroke="#2E6F40" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="100" y1="60" x2="60" y2="140" stroke="#2E6F40" strokeWidth="1.5" />
              <line x1="60" y1="140" x2="180" y2="100" stroke="#2E6F40" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="100" y1="60" x2="180" y2="100" stroke="#2E6F40" strokeWidth="1.5" />
              
              <circle cx="20" cy="20" r="4" fill="#2E6F40" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="20" cy="20" r="4" fill="#2E6F40" />
              <circle cx="100" cy="60" r="6" fill="#68BA7F" />
              <circle cx="60" cy="140" r="5" fill="#2E6F40" />
              <circle cx="180" cy="100" r="7" fill="#2E6F40" />
            </g>
            
            {/* Bottom Right Molecule/Node Structure */}
            <g className="opacity-20 translate-x-[78%] translate-y-[52%]">
              <line x1="50" y1="150" x2="120" y2="50" stroke="#2E6F40" strokeWidth="1.5" />
              <line x1="120" y1="50" x2="220" y2="110" stroke="#2E6F40" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="220" y1="110" x2="190" y2="200" stroke="#2E6F40" strokeWidth="1.5" />
              <line x1="190" y1="200" x2="50" y2="150" stroke="#2E6F40" strokeWidth="1.5" />
              <line x1="120" y1="50" x2="190" y2="200" stroke="#2E6F40" strokeWidth="1.5" />

              <circle cx="50" cy="150" r="5" fill="#2E6F40" />
              <circle cx="120" cy="50" r="8" fill="#2E6F40" />
              <circle cx="220" cy="110" r="4" fill="#68BA7F" />
              <circle cx="190" cy="200" r="6" fill="#2E6F40" className="animate-ping" style={{ animationDuration: '4s' }} />
              <circle cx="190" cy="200" r="6" fill="#2E6F40" />
            </g>

            {/* Overlapping Math/Science Graph Curves */}
            <path 
              d="M -100,250 C 300,100 500,450 900,250 C 1200,100 1500,300 1800,200" 
              fill="none" 
              stroke="#2E6F40" 
              strokeWidth="1.5" 
              strokeDasharray="6 4"
              className="opacity-15"
            />
            <path 
              d="M -50,280 C 350,130 450,480 850,280 C 1150,130 1450,330 1750,230" 
              fill="none" 
              stroke="#68BA7F" 
              strokeWidth="1.5" 
              className="opacity-10"
            />
          </svg>
        </div>

        {/* Decorative Floating Scientific Formula Badges */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[28%] left-[6%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm border border-[#68BA7F]/25 shadow-sm text-[10px] font-mono text-[#2E6F40]/70 select-none animate-bounce" style={{ animationDuration: '6s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#68BA7F]" />
            <span>Citation Vector mapping: Cos(θ) &gt; 0.87</span>
          </div>
          <div className="absolute bottom-[35%] right-[5%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm border border-[#68BA7F]/25 shadow-sm text-[10px] font-mono text-[#2E6F40]/70 select-none animate-bounce" style={{ animationDuration: '8s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E6F40]" />
            <span>Unified Query expansion protocol active</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 mt-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFFFDC] border border-[#68BA7F]/50 text-[#2E6F40] text-sm font-medium font-mono">
            <Zap className="w-4 h-4" />
            <span>v1.3.7 — Now with Gemini 2.5 Flash</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#253D2C] leading-tight">
            Think at the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E6F40] to-[#68BA7F]">edge of knowledge</span>
          </h1>
          
          <p className="text-xl text-[#2E6F40]/80 max-w-2xl mx-auto leading-relaxed">
            AI-powered research brainstorming and parallel literature discovery for serious researchers. 
            Stop searching. Start synthesizing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto text-base font-medium bg-[#2E6F40] text-white px-8 py-3.5 rounded-[1.25rem] hover:bg-[#253D2C] transition-all shadow-[0_0_20px_rgba(46,111,64,0.2)] hover:shadow-[0_0_30px_rgba(46,111,64,0.3)] flex items-center justify-center gap-2">
              <span>Enter CatalystLab</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Two Pillars Section */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-white border-y border-[#68BA7F]/30">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#253D2C]">
              Two core pillars of academic synthesis
            </h2>
            <p className="text-lg text-[#2E6F40]/80 font-medium">
              CatalystLab converges critical brainstorming models with a real-time retrieval machine to surface knowledge edges instantly.
            </p>
          </div>

          {/* Pillar Selector Pills */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto p-1.5 bg-[#F4F9F5] rounded-2xl border border-[#68BA7F]/25 shadow-sm">
            <button
              onClick={() => {
                setActiveFeatureTab('think');
                setSelectedPillarItem(0);
                setSimulatedProgress('IDLE');
              }}
              className={`relative flex-1 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer z-10 ${
                activeFeatureTab === 'think' ? 'text-white' : 'text-[#2E6F40]/70 hover:text-[#253D2C]'
              }`}
            >
              {activeFeatureTab === 'think' && (
                <motion.div
                  layoutId="activeFeatureBackground"
                  className="absolute inset-0 bg-[#2E6F40] rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <BrainCircuit className="w-4.5 h-4.5" />
              <span>1. THINK</span>
            </button>
            <button
              onClick={() => {
                setActiveFeatureTab('discover');
                setSelectedPillarItem(0);
                setSimulatedProgress('IDLE');
              }}
              className={`relative flex-1 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer z-10 ${
                activeFeatureTab === 'discover' ? 'text-white' : 'text-[#2E6F40]/70 hover:text-[#253D2C]'
              }`}
            >
              {activeFeatureTab === 'discover' && (
                <motion.div
                  layoutId="activeFeatureBackground"
                  className="absolute inset-0 bg-[#2E6F40] rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <Search className="w-4.5 h-4.5" />
              <span>2. DISCOVER</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Selectable Pillar Items */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#F4F9F5]/30 border border-[#68BA7F]/20 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#2E6F40] block mb-1">
                  {activeFeatureTab === 'think' ? 'Cognitive Brainstorming Engine' : 'Parallel Discovery Machine'}
                </span>
                <p className="text-xs text-[#2E6F40]/75">
                  {activeFeatureTab === 'think' 
                    ? '20 structured AI brainstorming models to stress-test hypotheses, pinpoint blindspots, and excavate foundational dogmas.' 
                    : 'Instant extraction of keywords with concurrent event streams to scan 17 open database APIs in sub-second timelines.'
                  }
                </p>
              </div>

              {(activeFeatureTab === 'think' ? THINK_PILLARS : DISCOVER_PILLARS).map((item, idx) => {
                const isSelected = selectedPillarItem === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedPillarItem(idx);
                      setSimulatedProgress('IDLE');
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-[#F4F9F5] border-[#2E6F40] shadow-sm ring-1 ring-[#2E6F40]/20'
                        : 'bg-white border-[#68BA7F]/25 hover:border-[#68BA7F]/60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-[#2E6F40] text-white' : 'bg-[#CFFFDC]/40 text-[#2E6F40]'
                    }`}>
                      {activeFeatureTab === 'think' ? <BrainCircuit className="w-4.5 h-4.5" /> : <Search className="w-4.5 h-4.5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#253D2C]">{item.title}</h4>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#2E6F40] text-white' : 'bg-[#CFFFDC] text-[#2E6F40]'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#2E6F40]/90 font-medium">
                        {item.bullet}
                      </p>
                      <p className="text-xs text-[#2E6F40]/70 pt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Live Interactive Sandbox Console */}
            <div className="lg:col-span-7 flex flex-col justify-between p-7 rounded-[2rem] bg-[#191D1A] border border-[#2E6F40]/40 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#2E6F40]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-6 relative z-10 w-full">
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-[#2E6F40]/30 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#68BA7F]/80"></div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 pl-2">
                      {activeFeatureTab === 'think' ? 'COGNITIVE_SIMULATOR.EXE' : 'API_DISCOVERY_PIPELINE.SH'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#2E6F40]/30 text-[#CFFFDC] border border-[#2E6F40]/40 uppercase tracking-widest font-semibold">
                    status: ready
                  </span>
                </div>

                {/* Simulated Input Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#D0FAD5]/60 font-semibold uppercase tracking-wider block">
                    {activeFeatureTab === 'think' 
                      ? THINK_PILLARS[selectedPillarItem].inputLabel 
                      : DISCOVER_PILLARS[selectedPillarItem].inputLabel
                    }
                  </label>
                  <div className="p-4 rounded-xl bg-black/40 border border-[#2E6F40]/30 text-xs font-mono text-[#D0FAD5] flex items-center justify-between leading-relaxed shadow-inner">
                    <span>
                      {activeFeatureTab === 'think' 
                        ? THINK_PILLARS[selectedPillarItem].mockInput 
                        : DISCOVER_PILLARS[selectedPillarItem].mockInput
                      }
                    </span>
                    <Cpu className="w-4 h-4 text-[#68BA7F]/75 shrink-0 ml-3" />
                  </div>
                </div>

                {/* Simulated Core Engine Logic */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#D0FAD5]/60 font-semibold uppercase tracking-wider block">
                    Processing Mechanism
                  </span>
                  <div className="text-xs text-gray-300 leading-relaxed bg-[#253D2C]/20 border border-[#2E6F40]/20 p-3 rounded-lg font-mono">
                    <span className="text-[#68BA7F] font-bold">&gt; </span>
                    {activeFeatureTab === 'think' 
                      ? THINK_PILLARS[selectedPillarItem].method 
                      : DISCOVER_PILLARS[selectedPillarItem].method
                    }
                  </div>
                </div>

                {/* Execute Simulation Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSimulatingFeature(true);
                      setSimulatedProgress('RUNNING');
                      setTimeout(() => {
                        setIsSimulatingFeature(false);
                        setSimulatedProgress('DONE');
                      }, 900);
                    }}
                    disabled={isSimulatingFeature}
                    className="w-full py-3.5 px-5 bg-[#2E6F40] hover:bg-[#253D2C] disabled:bg-[#2E6F40]/40 text-black hover:text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border border-[#68BA7F]/30 hover:shadow-lg hover:shadow-[#2E6F40]/10 cursor-pointer"
                  >
                    {isSimulatingFeature ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Multi-Dimensional Graph Models...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-black group-hover:fill-white text-black" />
                        <span>Run Live Synthesis Trial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Result Terminal Section */}
              <div className="mt-8 border-t border-[#2E6F40]/30 pt-6 relative z-10">
                <AnimatePresence mode="wait">
                  {simulatedProgress === 'RUNNING' && (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 font-mono text-xs text-[#CFFFDC]/70"
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#68BA7F]" />
                        <span>[STREAMING] Dispatching matrix solvers to active nodes...</span>
                      </div>
                      <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.85 }}
                          className="bg-[#68BA7F] h-full"
                        />
                      </div>
                    </motion.div>
                  )}

                  {simulatedProgress === 'DONE' && !isSimulatingFeature && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#68BA7F] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SYNTHESIS_SUCCESS
                        </span>
                        <span className="text-gray-400">LATENCY: 124ms</span>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-black/70 text-[#CFFFDC] border border-[#2E6F40]/45 font-mono text-xs leading-relaxed space-y-2 max-h-[160px] overflow-y-auto">
                        <p className="font-semibold text-white">
                          {activeFeatureTab === 'think' 
                            ? THINK_PILLARS[selectedPillarItem].simulatedOutput 
                            : DISCOVER_PILLARS[selectedPillarItem].simulatedOutput
                          }
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {simulatedProgress === 'IDLE' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-black/25 border border-[#2E6F40]/25 border-dashed text-center space-y-2"
                    >
                      <Cpu className="w-5 h-5 text-gray-500 mx-auto" />
                      <p className="text-xs font-mono text-gray-400">
                        Select a tool on the left and click <span className="text-[#68BA7F]">&quot;Run Live Synthesis Trial&quot;</span> above to experience real-time paradigm translation.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </section>

      <section id="instruments" className="py-24 px-4 sm:px-6 bg-[#F4F9F5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#253D2C]">21 specialized research instruments</h2>
            <p className="text-lg text-[#2E6F40]/80 font-medium">Divided into three zones of cognitive assistance to accelerate scientific discovery.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 max-w-3xl mx-auto p-1.5 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#68BA7F]/25 shadow-sm">
            {ZONES.map((zone, idx) => {
              const isActive = activeZone === idx;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZone(idx);
                    setActiveTool(0);
                  }}
                  className={`relative w-full sm:w-auto flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer z-10 ${
                    isActive 
                      ? 'text-white font-bold shadow-sm' 
                      : 'text-[#2E6F40]/70 hover:text-[#253D2C] hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeZoneBackground"
                      className="absolute inset-0 bg-[#2E6F40] rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span>{zone.subtitle}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive ? 'bg-black/20 text-[#CFFFDC]' : 'bg-[#CFFFDC]/40 text-[#2E6F40]'
                  }`}>
                    {zone.title}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeZone}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-12 gap-8 pt-4 items-stretch"
            >
              {/* Overview Block */}
              <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-[2rem] bg-white border border-[#68BA7F]/30 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CFFFDC]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFFFDC]/60 border border-[#68BA7F]/40 text-[#2E6F40] text-xs font-bold font-mono">
                    <span>{ZONES[activeZone].title}</span>
                    <span>•</span>
                    <span>{ZONES[activeZone].count}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[#253D2C] tracking-tight">
                      {ZONES[activeZone].subtitle}
                    </h3>
                    <p className="text-sm text-[#2E6F40]/80 leading-relaxed">
                      {ZONES[activeZone].description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#68BA7F]/20 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E6F40]/60">Active Simulation Input</h4>
                    <div className="p-4 rounded-xl bg-[#F4F9F5] border border-[#68BA7F]/20 space-y-2 shadow-sm font-mono text-xs">
                      <div className="flex items-center justify-between text-[#2E6F40]/60">
                        <span>INPUT_PROMPT</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#CFFFDC] text-[#2E6F40] font-bold">READY</span>
                      </div>
                      <p className="text-[#253D2C] font-semibold">
                        {ZONES[activeZone].tools[activeTool].action}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#68BA7F]/20 space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E6F40]">
                    <Play className="w-3.5 h-3.5 fill-[#2E6F40] text-[#2E6F40]" />
                    <span>Simulated Synthesis Output</span>
                  </div>
                  <motion.div 
                    key={`${activeZone}-${activeTool}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-4 rounded-xl bg-[#253D2C] text-[#CFFFDC] border border-[#2E6F40]/40 shadow-inner font-mono text-xs space-y-1.5 leading-relaxed"
                  >
                    <div className="text-[10px] opacity-60 flex justify-between">
                      <span>OUTPUT_SUCCESS</span>
                      <span>LATENCY: 142ms</span>
                    </div>
                    <p className="font-semibold text-white">
                      {ZONES[activeZone].tools[activeTool].output}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Interactive Tool Selector List */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {ZONES[activeZone].tools.map((tool, idx) => {
                  const isToolActive = activeTool === idx;
                  return (
                    <button
                      key={tool.name}
                      onClick={() => setActiveTool(idx)}
                      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer group hover:scale-[1.012] ${
                        isToolActive
                          ? 'bg-white border-[#2E6F40] shadow-md ring-1 ring-[#2E6F40]/20'
                          : 'bg-white/85 border-[#68BA7F]/25 hover:border-[#68BA7F]/60 hover:bg-white shadow-sm'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors duration-300 ${
                        isToolActive 
                          ? 'bg-[#2E6F40] text-white' 
                          : 'bg-[#CFFFDC]/40 text-[#2E6F40] group-hover:bg-[#CFFFDC]/60'
                      }`}>
                        {getIcon(tool.icon)}
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-[#253D2C]">
                            {tool.name}
                          </h4>
                          <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            isToolActive 
                              ? 'bg-[#2E6F40] text-white' 
                              : 'bg-[#F4F9F5] text-[#2E6F40]'
                          }`}>
                            {tool.tagline}
                          </span>
                        </div>
                        <p className="text-sm text-[#2E6F40]/80 leading-relaxed">
                          {tool.desc}
                        </p>
                        {isToolActive && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pt-2 text-xs font-mono text-[#2E6F40]/90 border-t border-[#68BA7F]/10 mt-2"
                          >
                            <span className="font-bold text-[#2E6F40]">Core Engine Method: </span> 
                            Analyzes structural graph overlaps, parses citations, and extracts lateral theoretical jumps.
                          </motion.div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Sources Grid */}
      <section id="sources" className="py-24 px-4 sm:px-6 bg-white border-y border-[#68BA7F]/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#253D2C]">Connected to 17 academic APIs</h2>
            <p className="text-lg text-[#2E6F40]/80">We search over 250M+ open access papers, preprints, and publications in parallel.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-center">
            {[
              { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/' },
              { name: 'OpenAlex', url: 'https://openalex.org/' },
              { name: 'arXiv', url: 'https://arxiv.org/' },
              { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
              { name: 'CORE', url: 'https://core.ac.uk/' },
              { name: 'Crossref', url: 'https://www.crossref.org/' },
              { name: 'Europe PMC', url: 'https://europepmc.org/' },
              { name: 'DOAJ', url: 'https://doaj.org/' },
              { name: 'Zenodo', url: 'https://zenodo.org/' },
              { name: 'DataCite', url: 'https://datacite.org/' },
              { name: 'Unpaywall', url: 'https://unpaywall.org/' },
              { name: 'Figshare', url: 'https://figshare.com/' },
              { name: 'HDX', url: 'https://data.humdata.org/' },
              { name: 'OpenAIRE', url: 'https://www.openaire.eu/' },
              { name: 'NASA ADS', url: 'https://ui.adsabs.harvard.edu/' },
              { name: 'Exa AI', url: 'https://exa.ai/' },
              { name: 'Tavily', url: 'https://tavily.com/' }
            ].map(s => (
              <a 
                key={s.name} 
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4F9F5] border border-[#68BA7F]/30 text-[#253D2C]/80 font-medium hover:text-[#1E4D2B] hover:border-[#68BA7F]/60 hover:bg-[#CFFFDC]/30 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <span>{s.name}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#2E6F40]" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-[#F4F9F5]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#253D2C]">Simple, transparent pricing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Free</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$0<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>5 runs/day</li>
                <li>3 academic sources</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-[#CFFFDC]/40 border border-[#68BA7F]/50 shadow-lg space-y-4 relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#2E6F40] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">Popular</div>
              <h3 className="font-bold text-[#253D2C]">Researcher</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$9<span className="text-lg text-[#2E6F40] font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40] space-y-2">
                <li>Unlimited runs</li>
                <li>All 17 sources</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Lab Pro</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$19<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>BYO API key support</li>
                <li>Priority search fan-out</li>
              </ul>
            </div>
            <div className="p-6 rounded-[1.5rem] bg-white border border-[#68BA7F]/30 shadow-lg space-y-4">
              <h3 className="font-bold text-[#253D2C]">Institution</h3>
              <div className="text-3xl font-bold text-[#253D2C]">$49<span className="text-lg text-[#2E6F40]/70 font-normal">/mo</span></div>
              <ul className="text-sm text-[#2E6F40]/80 space-y-2">
                <li>Team sub-accounts</li>
                <li>Shared living reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-[#68BA7F]/30 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[#253D2C]/80">
            <BrainCircuit className="w-5 h-5" />
            <span className="font-bold">CatalystLab</span>
            <span className="text-sm ml-2">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-[#2E6F40]/70">
            <Link href="/privacy" className="hover:text-[#253D2C] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#253D2C] transition-colors">Terms</Link>
            <Link href="/github" className="hover:text-[#253D2C] transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
