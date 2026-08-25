/**
 * ============================================================================
 * CATALYSTLAB MEDIA REGISTRY & UNSPLASH ASSET MANIFEST
 * ============================================================================
 * Strict compliance manifest for copyright-free Unsplash imagery.
 * All URLs use stable photo IDs with explicit query parameters (?q=80&w=...&auto=format&fit=crop).
 * Every item defines role, Catalyst-Grade treatment pipeline, and motion archetype.
 */

export type MediaTreatment =
  | 'catalyst-grade-hero'
  | 'catalyst-grade-cyan'
  | 'catalyst-grade-green'
  | 'catalyst-grade-crimson'
  | 'catalyst-grade-purple'
  | 'catalyst-grade-amber'
  | 'catalyst-grade-neutral'
  | 'avatar'
  | 'topography-texture'
  | 'circuit-divider';

export type MediaMotion =
  | 'ken-burns'
  | 'parallax-band'
  | 'tilt-holo'
  | 'scan-reveal'
  | 'spotlight-hover'
  | 'static';

export type MediaRole =
  | 'hero-bg'
  | 'enzyme-card'
  | 'testimonial-avatar'
  | 'blog-cover'
  | 'pipeline-divider'
  | 'cta-band'
  | 'page-texture';

export interface MediaCredit {
  photographer: string;
  profileUrl: string;
  photoId: string;
  sourceUrl: string;
  license: string;
}

export interface MediaAsset {
  id: string;
  role: MediaRole;
  url: string;
  alt: string;
  treatment: MediaTreatment;
  motion: MediaMotion;
  width: number;
  height: number;
  credit: MediaCredit;
  needsManualVerify: boolean;
  fallbackQuery?: string;
  blurDataUrl?: string;
}

/**
 * Builds a valid, TOS-compliant Unsplash URL with explicit performance params.
 */
export function buildUnsplashUrl(
  photoId: string,
  options: { width?: number; quality?: number; fit?: string; auto?: string } = {}
): string {
  const { width = 1600, quality = 80, fit = 'crop', auto = 'format' } = options;
  return `https://images.unsplash.com/photo-${photoId}?q=${quality}&w=${width}&auto=${auto}&fit=${fit}`;
}

// Low-opacity base64 SVG shimmer blur placeholder (CLS = 0)
const DEFAULT_BLUR_SHIMMER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwNjA5MTQiLz48L3N2Zz4=';

export const MEDIA_REGISTRY: Record<string, MediaAsset> = {
  // --------------------------------------------------------------------------
  // 1. HERO BACKGROUND (Datacenter / Edge Anycast Matrix)
  // --------------------------------------------------------------------------
  'hero-datacenter-bg': {
    id: 'hero-datacenter-bg',
    role: 'hero-bg',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2400&auto=format&fit=crop',
    alt: 'High-density Anycast edge server racks glowing in telemetry darkroom',
    treatment: 'catalyst-grade-hero',
    motion: 'ken-burns',
    width: 2400,
    height: 1350,
    credit: {
      photographer: 'Taylor Vick',
      profileUrl: 'https://unsplash.com/@tvick',
      photoId: '1558494949-ef010cbdcc31',
      sourceUrl: 'https://unsplash.com/photos/1558494949-ef010cbdcc31',
      license: 'Unsplash License (Commercial Use Allowed)',
    },
    needsManualVerify: false,
    blurDataUrl: DEFAULT_BLUR_SHIMMER,
  },

  // --------------------------------------------------------------------------
  // 2. ENZYME SIDE-VISUALS (TiltHolo Panels)
  // --------------------------------------------------------------------------
  'enzyme-vitalzyme': {
    id: 'enzyme-vitalzyme',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    alt: 'Macro silicon microprocessor wafer for Core Web Vitals speed optimization',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Alexandre Debiève',
      profileUrl: 'https://unsplash.com/@alexandre_debieve',
      photoId: '1518770660439-4636190af475',
      sourceUrl: 'https://unsplash.com/photos/1518770660439-4636190af475',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'silicon microchip wafer macro',
  },

  'enzyme-edgevmax': {
    id: 'enzyme-edgevmax',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',
    alt: 'High-bandwidth fiber optic light cables conducting edge network signals',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Compare Fibre',
      profileUrl: 'https://unsplash.com/@comparefibre',
      photoId: '1544197150-b99a580bb7a8',
      sourceUrl: 'https://unsplash.com/photos/1544197150-b99a580bb7a8',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'fiber optic cables glowing light',
  },

  'enzyme-riskprotease': {
    id: 'enzyme-riskprotease',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    alt: 'Cybersecurity security lock and encrypted network matrix',
    treatment: 'catalyst-grade-crimson',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'FLY:D',
      profileUrl: 'https://unsplash.com/@flyd2069',
      photoId: '1563986768609-322da13575f3',
      sourceUrl: 'https://unsplash.com/photos/1563986768609-322da13575f3',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'cybersecurity encryption server shield',
  },

  'enzyme-llmkinase': {
    id: 'enzyme-llmkinase',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
    alt: 'Artificial intelligence vector topology and neural node processing cluster',
    treatment: 'catalyst-grade-purple',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Cash Macanaya',
      profileUrl: 'https://unsplash.com/@cashmacanaya',
      photoId: '1620712943543-bcc4688e7485',
      sourceUrl: 'https://unsplash.com/photos/1620712943543-bcc4688e7485',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'artificial intelligence neural nodes',
  },

  'enzyme-ecoholo': {
    id: 'enzyme-ecoholo',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop',
    alt: 'Sustainable clean power circuit and green energy edge computing grid',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Federico Beccari',
      profileUrl: 'https://unsplash.com/@federicobeccari',
      photoId: '1473341304170-971dccb5ac1e',
      sourceUrl: 'https://unsplash.com/photos/1473341304170-971dccb5ac1e',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'clean energy eco circuit power',
  },

  'enzyme-gitlygase': {
    id: 'enzyme-gitlygase',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    alt: 'High-speed abstract syntax tree compilation and clean TypeScript code matrix',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Fotis Fotopoulos',
      profileUrl: 'https://unsplash.com/@ffstop',
      photoId: '1555066931-4365d14bab8c',
      sourceUrl: 'https://unsplash.com/photos/1555066931-4365d14bab8c',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'code syntax dark screen programming',
  },

  'enzyme-synthshift': {
    id: 'enzyme-synthshift',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    alt: 'Headless Chrome browser worker grid synthesizing web components',
    treatment: 'catalyst-grade-amber',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Markus Spiske',
      profileUrl: 'https://unsplash.com/@markusspiske',
      photoId: '1526374965328-7f61d4dc18c5',
      sourceUrl: 'https://unsplash.com/photos/1526374965328-7f61d4dc18c5',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'cyber matrix terminal code lines',
  },

  'enzyme-allostersearch': {
    id: 'enzyme-allostersearch',
    role: 'enzyme-card',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=1200&auto=format&fit=crop',
    alt: 'Interconnected entity knowledge graph network topology',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Alina Grubnyak',
      profileUrl: 'https://unsplash.com/@alinnnaaaa',
      photoId: '1508873696983-2df5293cb32f',
      sourceUrl: 'https://unsplash.com/photos/1508873696983-2df5293cb32f',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
    fallbackQuery: 'network graph topology constellation nodes',
  },

  // --------------------------------------------------------------------------
  // 3. TESTIMONIAL AVATARS (Clean 96x96 avatars)
  // --------------------------------------------------------------------------
  'avatar-elena-rostova': {
    id: 'avatar-elena-rostova',
    role: 'testimonial-avatar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=192&h=192&auto=format&fit=crop&crop=faces',
    alt: 'Elena Rostova, VP Platform Engineering at Veloce Network',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Averie Woodard',
      profileUrl: 'https://unsplash.com/@averiewoodard',
      photoId: '1534528741775-53994a69daeb',
      sourceUrl: 'https://unsplash.com/photos/1534528741775-53994a69daeb',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'avatar-marcus-vance': {
    id: 'avatar-marcus-vance',
    role: 'testimonial-avatar',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=192&h=192&auto=format&fit=crop&crop=faces',
    alt: 'Marcus Vance, Chief Architect at StrataScale Cloud',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Joseph Gonzalez',
      profileUrl: 'https://unsplash.com/@miracletwentyone',
      photoId: '1507003211169-0a1dd7228f2d',
      sourceUrl: 'https://unsplash.com/photos/1507003211169-0a1dd7228f2d',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'avatar-dr-sarah-chen': {
    id: 'avatar-dr-sarah-chen',
    role: 'testimonial-avatar',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=192&h=192&auto=format&fit=crop&crop=faces',
    alt: 'Dr. Sarah Chen, Head of SecOps at Apex FinTech',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Christina @ wocintechchat.com',
      profileUrl: 'https://unsplash.com/@wocintechchat',
      photoId: '1573496359142-b8d87734a5a2',
      sourceUrl: 'https://unsplash.com/photos/1573496359142-b8d87734a5a2',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'avatar-david-lindqvist': {
    id: 'avatar-david-lindqvist',
    role: 'testimonial-avatar',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=192&h=192&auto=format&fit=crop&crop=faces',
    alt: 'David K. Lindqvist, Principal DevOps Lead at Nordic Quantum',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Jurica Koletić',
      profileUrl: 'https://unsplash.com/@juricakoletic',
      photoId: '1500648767791-00dcc994a43e',
      sourceUrl: 'https://unsplash.com/photos/1500648767791-00dcc994a43e',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // 4. BLOG & INSIGHT COVERS (ScanReveal + Hover Colorize)
  // --------------------------------------------------------------------------
  'blog-edge-protocols': {
    id: 'blog-edge-protocols',
    role: 'blog-cover',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1600&auto=format&fit=crop',
    alt: 'Zero-RTT Edge Handshakes and Sub-5ms TLS 1.3 Routing Architecture',
    treatment: 'catalyst-grade-cyan',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Compare Fibre',
      profileUrl: 'https://unsplash.com/@comparefibre',
      photoId: '1544197150-b99a580bb7a8',
      sourceUrl: 'https://unsplash.com/photos/1544197150-b99a580bb7a8',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'blog-ai-crawler-optimization': {
    id: 'blog-ai-crawler-optimization',
    role: 'blog-cover',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600&auto=format&fit=crop',
    alt: 'Architecting Web Applications for Autonomous AI Agent Crawlers and LLM-Kinase Parsing',
    treatment: 'catalyst-grade-purple',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Cash Macanaya',
      profileUrl: 'https://unsplash.com/@cashmacanaya',
      photoId: '1620712943543-bcc4688e7485',
      sourceUrl: 'https://unsplash.com/photos/1620712943543-bcc4688e7485',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'blog-ast-transpilation': {
    id: 'blog-ast-transpilation',
    role: 'blog-cover',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
    alt: 'Deep AST Refactoring and Zero-Overhead Bundle Tree Shaking',
    treatment: 'catalyst-grade-green',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Fotis Fotopoulos',
      profileUrl: 'https://unsplash.com/@ffstop',
      photoId: '1555066931-4365d14bab8c',
      sourceUrl: 'https://unsplash.com/photos/1555066931-4365d14bab8c',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  'blog-carbon-intensity': {
    id: 'blog-carbon-intensity',
    role: 'blog-cover',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1600&auto=format&fit=crop',
    alt: 'Real-Time Digital Carbon Tracking and Green Energy Anycast Balancing',
    treatment: 'catalyst-grade-green',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Federico Beccari',
      profileUrl: 'https://unsplash.com/@federicobeccari',
      photoId: '1473341304170-971dccb5ac1e',
      sourceUrl: 'https://unsplash.com/photos/1473341304170-971dccb5ac1e',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // 5. PRICING HEADER TEXTURE (Topography only, billing area stays clean)
  // --------------------------------------------------------------------------
  'pricing-header-texture': {
    id: 'pricing-header-texture',
    role: 'page-texture',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
    alt: 'Global telemetry Anycast topology abstract earth texture',
    treatment: 'topography-texture',
    motion: 'ken-burns',
    width: 2000,
    height: 800,
    credit: {
      photographer: 'NASA',
      profileUrl: 'https://unsplash.com/@nasa',
      photoId: '1451187580459-43490279c0fa',
      sourceUrl: 'https://unsplash.com/photos/1451187580459-43490279c0fa',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // 6. PIPELINE & INTEGRATION DIVIDERS (Circuit Macro Parallax)
  // --------------------------------------------------------------------------
  'pipeline-circuit-divider': {
    id: 'pipeline-circuit-divider',
    role: 'pipeline-divider',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2400&auto=format&fit=crop',
    alt: 'Integrated circuit silicon substrate divider band',
    treatment: 'circuit-divider',
    motion: 'parallax-band',
    width: 2400,
    height: 600,
    credit: {
      photographer: 'Alexandre Debiève',
      profileUrl: 'https://unsplash.com/@alexandre_debieve',
      photoId: '1518770660439-4636190af475',
      sourceUrl: 'https://unsplash.com/photos/1518770660439-4636190af475',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // 7. FINAL CTA BAND (Server Matrix Scanline Band)
  // --------------------------------------------------------------------------
  'cta-server-band': {
    id: 'cta-server-band',
    role: 'cta-band',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2400&auto=format&fit=crop',
    alt: 'Continuous telemetry server farm and global Anycast infrastructure',
    treatment: 'catalyst-grade-hero',
    motion: 'parallax-band',
    width: 2400,
    height: 800,
    credit: {
      photographer: 'Taylor Vick',
      profileUrl: 'https://unsplash.com/@tvick',
      photoId: '1558494949-ef010cbdcc31',
      sourceUrl: 'https://unsplash.com/photos/1558494949-ef010cbdcc31',
      license: 'Unsplash License',
    },
    needsManualVerify: false,
  },
};

/**
 * Array of credits for professional footer attribution
 */
export const MEDIA_CREDITS: MediaCredit[] = Object.values(MEDIA_REGISTRY).map(
  (asset) => asset.credit
);

/**
 * Get media asset by ID with fallback guard
 */
export function getMediaAsset(id: string): MediaAsset {
  if (MEDIA_REGISTRY[id]) {
    return MEDIA_REGISTRY[id];
  }
  // Default to hero datacenter if ID not found
  return MEDIA_REGISTRY['hero-datacenter-bg'];
}

/**
 * Maps enzyme ID to designated media asset
 */
export function getEnzymeMediaAsset(engineType: string): MediaAsset {
  const normalized = engineType.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (normalized.includes('vital') || normalized.includes('health')) {
    return MEDIA_REGISTRY['enzyme-vitalzyme'];
  }
  if (normalized.includes('edge') || normalized.includes('latency')) {
    return MEDIA_REGISTRY['enzyme-edgevmax'];
  }
  if (normalized.includes('risk') || normalized.includes('compliance') || normalized.includes('sec')) {
    return MEDIA_REGISTRY['enzyme-riskprotease'];
  }
  if (normalized.includes('llm') || normalized.includes('ai') || normalized.includes('kinase')) {
    return MEDIA_REGISTRY['enzyme-llmkinase'];
  }
  if (normalized.includes('eco') || normalized.includes('carbon')) {
    return MEDIA_REGISTRY['enzyme-ecoholo'];
  }
  if (normalized.includes('repo') || normalized.includes('git') || normalized.includes('ast')) {
    return MEDIA_REGISTRY['enzyme-gitlygase'];
  }
  if (normalized.includes('synth') || normalized.includes('migration') || normalized.includes('shift')) {
    return MEDIA_REGISTRY['enzyme-synthshift'];
  }
  if (normalized.includes('alloster') || normalized.includes('llmo') || normalized.includes('search')) {
    return MEDIA_REGISTRY['enzyme-allostersearch'];
  }

  return MEDIA_REGISTRY['enzyme-vitalzyme'];
}
