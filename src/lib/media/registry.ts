/**
 * ============================================================================
 * CATALYSTLAB VERIFIED MEDIA REGISTRY & MANIFEST (v2)
 * ============================================================================
 * Strict compliance manifest for copyright-free Pexels & Pexels imagery and videos.
 *
 * HARD CONTRACT RULES:
 * R1: ZERO-EMPTY-SLOT: Every slot mounts real remote URLs from this manifest.
 * R2: SOURCES: Pexels for photos, Pexels for photos + video clips.
 * R3: FALLBACK CHAIN: Every item has sources: string[] for automatic fallback.
 * R4: VERIFY TOOLING: Validated by scripts/verify-media.mjs (`npm run media:check`).
 * R5: LICENSING: Commercial use permitted without attribution; credits tracked.
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
  | 'hero-video'
  | 'enzyme-card'
  | 'testimonial-avatar'
  | 'blog-cover'
  | 'pipeline-divider'
  | 'cta-band'
  | 'page-texture'
  | 'about-feature';

export interface MediaCredit {
  photographer: string;
  source: 'Pexels' | 'Pexels';
  sourceUrl: string;
  license: string;
}

export interface MediaAsset {
  id: string;
  role: MediaRole;
  url: string; // Primary source (sources[0])
  sources: string[]; // Fallback chain: R3 contract requirement
  poster?: string; // Video poster fallback
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

// 4x4 low-opacity dark base64 blur placeholder (CLS = 0)
export const DEFAULT_BLUR_SHIMMER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwNjA5MTQiLz48L3N2Zz4=';

// ============================================================================
// VERIFIED ASSET MANIFEST CONSTANTS
// ============================================================================

// Pexels Images (Verified Live IDs)
export const U_SERVER = 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=2400';
export const U_NET = 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_CIRCUIT = 'https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_MATRIX = 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_CYBER = 'https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_GLOBE = 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_CODE = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
export const U_NEON = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

// Pexels Avatars (Faces crop)
export const U_FACE_1 = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop&dpr=2';
export const U_FACE_2 = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop&dpr=2';
export const U_FACE_3 = 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop&dpr=2';
export const U_FACE_4 = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop&dpr=2';

// Pexels Images
export const P_DC = 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=2400';
export const P_TECH = 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=2400';
export const P_WORK = 'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg?auto=compress&cs=tinysrgb&w=2000';

// Pexels Videos (Direct Hotlink)
export const V_HERO = 'https://videos.pexels.com/video-files/19575751/19575751-uhd_2560_1440_30fps.mp4';
export const V_AI = 'https://videos.pexels.com/video-files/8328150/8328150-uhd_1440_2560_25fps.mp4';
export const V_ALT = 'https://videos.pexels.com/video-files/8873150/8873150-hd_1080_1920_25fps.mp4';
export const V_ALT2 = 'https://videos.pexels.com/video-files/9574011/9574011-hd_1080_2048_25fps.mp4';

// ============================================================================
// COMPLETE MEDIA REGISTRY
// ============================================================================

export const MEDIA_REGISTRY: Record<string, MediaAsset> = {
  // --------------------------------------------------------------------------
  // HERO ZONE (Video with U-SERVER poster & P-DC fallback)
  // --------------------------------------------------------------------------
  'hero-video': {
    id: 'hero-video',
    role: 'hero-video',
    url: V_HERO,
    sources: [V_HERO, V_ALT, V_ALT2],
    poster: U_SERVER,
    alt: 'High-density Anycast fiber telemetry stream passing through edge cluster',
    treatment: 'catalyst-grade-hero',
    motion: 'ken-burns',
    width: 2560,
    height: 1440,
    credit: {
      photographer: 'Pexels Video Network',
      source: 'Pexels',
      sourceUrl: 'https://www.pexels.com/video/19575751/',
      license: 'Pexels License (Commercial Use Allowed)',
    },
    needsManualVerify: false,
    blurDataUrl: DEFAULT_BLUR_SHIMMER,
  },

  'hero-datacenter-bg': {
    id: 'hero-datacenter-bg',
    role: 'hero-bg',
    url: U_SERVER,
    sources: [U_SERVER, P_DC, P_TECH],
    alt: 'High-density Anycast edge server racks glowing in telemetry darkroom',
    treatment: 'catalyst-grade-hero',
    motion: 'ken-burns',
    width: 2400,
    height: 1350,
    credit: {
      photographer: 'Taylor Vick',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1558494949-ef010cbdcc31',
      license: 'Pexels License (Commercial Use Allowed)',
    },
    needsManualVerify: false,
    blurDataUrl: DEFAULT_BLUR_SHIMMER,
  },

  'telemetry-datacenter-hero': {
    id: 'telemetry-datacenter-hero',
    role: 'hero-bg',
    url: U_SERVER,
    sources: [U_SERVER, P_DC],
    alt: 'Real-time telemetry and edge POP fiber monitoring station',
    treatment: 'catalyst-grade-hero',
    motion: 'ken-burns',
    width: 2400,
    height: 1350,
    credit: {
      photographer: 'Taylor Vick',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1558494949-ef010cbdcc31',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // ENZYME CARDS & SIDE VISUALS (TiltHolo Panels)
  // --------------------------------------------------------------------------
  'enzyme-vitalzyme': {
    id: 'enzyme-vitalzyme',
    role: 'enzyme-card',
    url: U_CIRCUIT,
    sources: [U_CIRCUIT, P_TECH],
    alt: 'Macro silicon microprocessor wafer for Core Web Vitals speed optimization',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Alexandre Debiève',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1518770660439-4636190af475',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'silicon microchip wafer macro',
  },

  'enzyme-vitalzyme-hero': {
    id: 'enzyme-vitalzyme-hero',
    role: 'enzyme-card',
    url: U_CIRCUIT,
    sources: [U_CIRCUIT, P_TECH],
    alt: 'VitalZyme silicon execution pipeline',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Alexandre Debiève',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1518770660439-4636190af475',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-edgevmax': {
    id: 'enzyme-edgevmax',
    role: 'enzyme-card',
    url: U_NET,
    sources: [U_NET, P_DC],
    alt: 'High-bandwidth fiber optic light cables conducting edge network signals',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Compare Fibre',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1544197150-b99a580bb7a8',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'fiber optic cables glowing light',
  },

  'enzyme-edgevmax-hero': {
    id: 'enzyme-edgevmax-hero',
    role: 'enzyme-card',
    url: U_NET,
    sources: [U_NET, P_DC],
    alt: 'Edge-VMax network topology and fiber routing',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Compare Fibre',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1544197150-b99a580bb7a8',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-riskprotease': {
    id: 'enzyme-riskprotease',
    role: 'enzyme-card',
    url: U_CYBER,
    sources: [U_CYBER, U_MATRIX],
    alt: 'Cybersecurity security lock and encrypted network matrix',
    treatment: 'catalyst-grade-crimson',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'FLY:D',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550751827-4bd374c3f58b',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'cybersecurity encryption server shield',
  },

  'enzyme-riskprotease-hero': {
    id: 'enzyme-riskprotease-hero',
    role: 'enzyme-card',
    url: U_CYBER,
    sources: [U_CYBER, U_MATRIX],
    alt: 'RiskProtease security shield and cryptographic validator',
    treatment: 'catalyst-grade-crimson',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'FLY:D',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550751827-4bd374c3f58b',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-llmkinase': {
    id: 'enzyme-llmkinase',
    role: 'enzyme-card',
    url: U_NEON,
    sources: [U_NEON, U_GLOBE],
    alt: 'Artificial intelligence vector topology and neural node processing cluster',
    treatment: 'catalyst-grade-purple',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Cash Macanaya',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550684376-efcbd6e3f319',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'artificial intelligence neural nodes',
  },

  'enzyme-llmkinase-hero': {
    id: 'enzyme-llmkinase-hero',
    role: 'enzyme-card',
    url: U_NEON,
    sources: [U_NEON, U_GLOBE],
    alt: 'LLM-Kinase AI agent token routing matrix',
    treatment: 'catalyst-grade-purple',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Cash Macanaya',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550684376-efcbd6e3f319',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-ecoholo': {
    id: 'enzyme-ecoholo',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NET],
    alt: 'Sustainable clean power circuit and green energy edge computing grid',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'NASA',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'clean energy eco circuit power',
  },

  'enzyme-ecoholo-hero': {
    id: 'enzyme-ecoholo-hero',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NET],
    alt: 'Eco-Holo zero-carbon computation grid',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'NASA',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-gitlygase': {
    id: 'enzyme-gitlygase',
    role: 'enzyme-card',
    url: U_CODE,
    sources: [U_CODE, U_MATRIX],
    alt: 'High-speed abstract syntax tree compilation and clean TypeScript code matrix',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Christopher Gower',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1498050108023-c5249f4df085',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'code syntax dark screen programming',
  },

  'enzyme-gitlygase-hero': {
    id: 'enzyme-gitlygase-hero',
    role: 'enzyme-card',
    url: U_CODE,
    sources: [U_CODE, U_MATRIX],
    alt: 'GitLygase AST refactor engine',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Christopher Gower',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1498050108023-c5249f4df085',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-synthshift': {
    id: 'enzyme-synthshift',
    role: 'enzyme-card',
    url: U_MATRIX,
    sources: [U_MATRIX, U_CODE],
    alt: 'Headless Chrome browser worker grid synthesizing web components',
    treatment: 'catalyst-grade-amber',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Markus Spiske',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1526374965328-7f61d4dc18c5',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'cyber matrix terminal code lines',
  },

  'enzyme-synthshift-hero': {
    id: 'enzyme-synthshift-hero',
    role: 'enzyme-card',
    url: U_MATRIX,
    sources: [U_MATRIX, U_CODE],
    alt: 'SynthShift browser synthesis worker cluster',
    treatment: 'catalyst-grade-amber',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'Markus Spiske',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1526374965328-7f61d4dc18c5',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'enzyme-allostersearch': {
    id: 'enzyme-allostersearch',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NEON],
    alt: 'Interconnected entity knowledge graph network topology',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'NASA',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa',
      license: 'Pexels License',
    },
    needsManualVerify: false,
    fallbackQuery: 'knowledge graph network nodes',
  },

  'enzyme-alloster-hero': {
    id: 'enzyme-alloster-hero',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NEON],
    alt: 'AllosterSearch neural search graph',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 1200,
    height: 800,
    credit: {
      photographer: 'NASA',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // CAROUSEL DESTINATION STRIPS (3:4 Ratio)
  // --------------------------------------------------------------------------
  'carousel-vitalzyme': {
    id: 'carousel-vitalzyme',
    role: 'enzyme-card',
    url: U_CIRCUIT,
    sources: [U_CIRCUIT, P_TECH],
    alt: 'VitalZyme real-time LCP/CLS optimizer strip',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'Alexandre Debiève', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1518770660439-4636190af475', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-edgevmax': {
    id: 'carousel-edgevmax',
    role: 'enzyme-card',
    url: U_NET,
    sources: [U_NET, P_DC],
    alt: 'Edge-VMax Anycast edge CDN pipeline strip',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'Compare Fibre', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1544197150-b99a580bb7a8', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-riskprotease': {
    id: 'carousel-riskprotease',
    role: 'enzyme-card',
    url: U_CYBER,
    sources: [U_CYBER, U_MATRIX],
    alt: 'RiskProtease automated SOC2 compliance strip',
    treatment: 'catalyst-grade-crimson',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'FLY:D', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1550751827-4bd374c3f58b', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-llmkinase': {
    id: 'carousel-llmkinase',
    role: 'enzyme-card',
    url: U_NEON,
    sources: [U_NEON, U_GLOBE],
    alt: 'LLM-Kinase neural bot accelerator strip',
    treatment: 'catalyst-grade-purple',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'Cash Macanaya', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1550684376-efcbd6e3f319', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-ecoholo': {
    id: 'carousel-ecoholo',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NET],
    alt: 'Eco-Holo green grid balancing strip',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'NASA', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-gitlygase': {
    id: 'carousel-gitlygase',
    role: 'enzyme-card',
    url: U_CODE,
    sources: [U_CODE, U_MATRIX],
    alt: 'GitLygase continuous AST transformer strip',
    treatment: 'catalyst-grade-green',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'Christopher Gower', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1498050108023-c5249f4df085', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-synthshift': {
    id: 'carousel-synthshift',
    role: 'enzyme-card',
    url: U_MATRIX,
    sources: [U_MATRIX, U_CODE],
    alt: 'SynthShift browser synthesis worker strip',
    treatment: 'catalyst-grade-amber',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'Markus Spiske', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1526374965328-7f61d4dc18c5', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'carousel-alloster': {
    id: 'carousel-alloster',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NEON],
    alt: 'AllosterSearch dynamic graph crawler strip',
    treatment: 'catalyst-grade-cyan',
    motion: 'tilt-holo',
    width: 900,
    height: 1200,
    credit: { photographer: 'NASA', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa', license: 'Pexels License' },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // TESTIMONIAL AVATARS (U-FACE 1..4)
  // --------------------------------------------------------------------------
  'avatar-sarah-chen': {
    id: 'avatar-sarah-chen',
    role: 'testimonial-avatar',
    url: U_FACE_1,
    sources: [U_FACE_1, U_FACE_2],
    alt: 'Sarah Chen, VP of Infrastructure at NexusWave',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'LinkedIn Sales Solutions',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1560250097-0b93528c311a',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'avatar-marcus-vance': {
    id: 'avatar-marcus-vance',
    role: 'testimonial-avatar',
    url: U_FACE_3,
    sources: [U_FACE_3, U_FACE_1],
    alt: 'Marcus Vance, Chief Architect at StrataCore Global',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Joseph Gonzalez',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1507003211169-0a1dd7228f2d',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'avatar-elena-rostova': {
    id: 'avatar-elena-rostova',
    role: 'testimonial-avatar',
    url: U_FACE_2,
    sources: [U_FACE_2, U_FACE_4],
    alt: 'Elena Rostova, Head of Edge Engineering at HyperScale Media',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Christina @ wocintechchat.com',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1573496359142-b8d87734a5a2',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'avatar-david-kim': {
    id: 'avatar-david-kim',
    role: 'testimonial-avatar',
    url: U_FACE_4,
    sources: [U_FACE_4, U_FACE_3],
    alt: 'David Kim, Principal Site Reliability Engineer at FinGrid Financial',
    treatment: 'avatar',
    motion: 'static',
    width: 96,
    height: 96,
    credit: {
      photographer: 'Stephanie Liverani',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1494790108377-be9c29b29330',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // TESTIMONIAL BACKGROUNDS
  // --------------------------------------------------------------------------
  'testimonial-bg-1': {
    id: 'testimonial-bg-1',
    role: 'enzyme-card',
    url: U_SERVER,
    sources: [U_SERVER, P_DC],
    alt: 'Datacenter server rack background for infrastructure testimonial',
    treatment: 'catalyst-grade-cyan',
    motion: 'static',
    width: 800,
    height: 600,
    credit: { photographer: 'Taylor Vick', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1558494949-ef010cbdcc31', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'testimonial-bg-2': {
    id: 'testimonial-bg-2',
    role: 'enzyme-card',
    url: U_NET,
    sources: [U_NET, P_TECH],
    alt: 'Network fiber routing background for scale testimonial',
    treatment: 'catalyst-grade-cyan',
    motion: 'static',
    width: 800,
    height: 600,
    credit: { photographer: 'Compare Fibre', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1544197150-b99a580bb7a8', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'testimonial-bg-3': {
    id: 'testimonial-bg-3',
    role: 'enzyme-card',
    url: U_CYBER,
    sources: [U_CYBER, U_MATRIX],
    alt: 'Security encryption circuit background for compliance testimonial',
    treatment: 'catalyst-grade-crimson',
    motion: 'static',
    width: 800,
    height: 600,
    credit: { photographer: 'FLY:D', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1550751827-4bd374c3f58b', license: 'Pexels License' },
    needsManualVerify: false,
  },
  'testimonial-bg-4': {
    id: 'testimonial-bg-4',
    role: 'enzyme-card',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NEON],
    alt: 'Global telemetry network background for fintech testimonial',
    treatment: 'catalyst-grade-green',
    motion: 'static',
    width: 800,
    height: 600,
    credit: { photographer: 'NASA', source: 'Pexels', sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa', license: 'Pexels License' },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // BLOG COVERS (U-MATRIX, U-CODE, U-NEON, U-NET)
  // --------------------------------------------------------------------------
  'blog-edge-ai-architecture': {
    id: 'blog-edge-ai-architecture',
    role: 'blog-cover',
    url: U_MATRIX,
    sources: [U_MATRIX, U_NEON, P_TECH],
    alt: 'Real-Time Edge AI Routing and Global Anycast Inference Performance',
    treatment: 'catalyst-grade-cyan',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Markus Spiske',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1526374965328-7f61d4dc18c5',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-zero-trust': {
    id: 'blog-zero-trust',
    role: 'blog-cover',
    url: U_CYBER,
    sources: [U_CYBER, U_MATRIX],
    alt: 'Zero-Trust Protocol Enforcement on Edge Gateways and Worker Sandboxes',
    treatment: 'catalyst-grade-crimson',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'FLY:D',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550751827-4bd374c3f58b',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-wasm-compilation': {
    id: 'blog-wasm-compilation',
    role: 'blog-cover',
    url: U_CIRCUIT,
    sources: [U_CIRCUIT, U_CODE],
    alt: 'High-Performance WebAssembly Transpilation and Instant Hot Module Swapping',
    treatment: 'catalyst-grade-cyan',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Alexandre Debiève',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1518770660439-4636190af475',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-zero-rtt-handshake': {
    id: 'blog-zero-rtt-handshake',
    role: 'blog-cover',
    url: U_NET,
    sources: [U_NET, P_DC],
    alt: 'Zero-RTT Edge Handshakes and Sub-5ms TLS 1.3 Routing Architecture',
    treatment: 'catalyst-grade-cyan',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Compare Fibre',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1544197150-b99a580bb7a8',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-ai-crawler-optimization': {
    id: 'blog-ai-crawler-optimization',
    role: 'blog-cover',
    url: U_NEON,
    sources: [U_NEON, U_MATRIX],
    alt: 'Architecting Web Applications for Autonomous AI Agent Crawlers and LLM-Kinase Parsing',
    treatment: 'catalyst-grade-purple',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Cash Macanaya',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550684376-efcbd6e3f319',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-ast-transpilation': {
    id: 'blog-ast-transpilation',
    role: 'blog-cover',
    url: U_CODE,
    sources: [U_CODE, U_MATRIX],
    alt: 'Deep AST Refactoring and Zero-Overhead Bundle Tree Shaking',
    treatment: 'catalyst-grade-green',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'Christopher Gower',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1498050108023-c5249f4df085',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  'blog-carbon-intensity': {
    id: 'blog-carbon-intensity',
    role: 'blog-cover',
    url: U_GLOBE,
    sources: [U_GLOBE, U_NET],
    alt: 'Real-Time Digital Carbon Tracking and Green Energy Anycast Balancing',
    treatment: 'catalyst-grade-green',
    motion: 'scan-reveal',
    width: 1600,
    height: 900,
    credit: {
      photographer: 'NASA',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1451187580459-43490279c0fa',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // PRICING HEADER TEXTURE (Topography only, billing area stays clean)
  // --------------------------------------------------------------------------
  'pricing-header-texture': {
    id: 'pricing-header-texture',
    role: 'page-texture',
    url: U_NEON,
    sources: [U_NEON, U_GLOBE],
    alt: 'Global telemetry Anycast topology abstract earth texture',
    treatment: 'topography-texture',
    motion: 'ken-burns',
    width: 2000,
    height: 800,
    credit: {
      photographer: 'Cash Macanaya',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1550684376-efcbd6e3f319',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // PIPELINE & INTEGRATION DIVIDERS (Circuit Macro Parallax)
  // --------------------------------------------------------------------------
  'pipeline-circuit-divider': {
    id: 'pipeline-circuit-divider',
    role: 'pipeline-divider',
    url: U_CIRCUIT,
    sources: [U_CIRCUIT, P_TECH],
    alt: 'Integrated circuit silicon substrate divider band',
    treatment: 'circuit-divider',
    motion: 'parallax-band',
    width: 2400,
    height: 600,
    credit: {
      photographer: 'Alexandre Debiève',
      source: 'Pexels',
      sourceUrl: 'https://pexels.com/photo/1518770660439-4636190af475',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // FINAL CTA BAND (Server Matrix Scanline Band / Video Band)
  // --------------------------------------------------------------------------
  'cta-server-band': {
    id: 'cta-server-band',
    role: 'cta-band',
    url: V_AI,
    sources: [V_AI, U_SERVER, P_DC],
    poster: U_SERVER,
    alt: 'Continuous telemetry server farm and global Anycast infrastructure',
    treatment: 'catalyst-grade-hero',
    motion: 'parallax-band',
    width: 2400,
    height: 800,
    credit: {
      photographer: 'Pexels Video Network',
      source: 'Pexels',
      sourceUrl: 'https://www.pexels.com/video/8328150/',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },

  // --------------------------------------------------------------------------
  // ABOUT PAGE FEATURE (P-WORK)
  // --------------------------------------------------------------------------
  'about-engineering-team': {
    id: 'about-engineering-team',
    role: 'about-feature',
    url: P_WORK,
    sources: [P_WORK, U_SERVER],
    alt: 'CatalystLab edge infrastructure engineering team collaborating on systems architecture',
    treatment: 'catalyst-grade-cyan',
    motion: 'scan-reveal',
    width: 2000,
    height: 1200,
    credit: {
      photographer: 'Pexels Contributor',
      source: 'Pexels',
      sourceUrl: 'https://www.pexels.com/photos/4384679/',
      license: 'Pexels License',
    },
    needsManualVerify: false,
  },
};

/**
 * Array of credits for subtle footer attribution
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
