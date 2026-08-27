import type { BlogPost } from '../types';
import { 
  U_MATRIX, 
  U_CODE, 
  U_NEON, 
  U_SERVER, 
  U_NET, 
  U_CYBER, 
  U_GLOBE, 
  U_CIRCUIT 
} from '../lib/media/registry';

/**
 * Curated Pexels Image Library mapped to Verified Media Manifest
 */
export const PEXELS_ASSET_LIBRARY = {
  // 1. AI & LLMO / Generative Search / RAG
  ai_neural: U_MATRIX,
  ai_abstract_wave: U_NEON,
  ai_intelligence: U_CODE,

  // 2. Core Performance / DOM Depth / Core Web Vitals
  dom_performance: U_SERVER,
  cpu_hardware: U_CIRCUIT,
  speed_rendering: U_NET,

  // 3. Edge Latency / Anycast / DNS / QUIC
  edge_network: U_GLOBE,
  fiber_optics: U_NET,
  global_routes: U_MATRIX,

  // 4. SecOps / OWASP / CSP Nonce / Compliance
  secops_shield: U_CYBER,
  security_lock: U_CYBER,
  cyber_matrix: U_MATRIX,

  // 5. Git Repositories / CI/CD Pipelines / Static Analysis
  git_branches: U_CODE,
  code_review: U_CODE,
  devops_pipeline: U_SERVER,

  // 6. Sustainability / Green Web / SWD Carbon
  green_datacenter: U_SERVER,
  eco_tech: U_GLOBE,
  clean_energy: U_NET,

  // 7. System Architecture / Migration / 301 Canonical
  architecture_blueprint: U_CIRCUIT,
  cloud_servers: U_SERVER,
  datacenter_grid: U_NET,

  // 8. General Telemetry / Field Notes
  telemetry_dashboard: U_CODE,
  engineering_command: U_CYBER,
  deep_analytics: U_MATRIX
};

/**
 * Maps any blog post to a contextual, copyright-free Pexels image URL.
 */
export function getBlogCoverImage(post: Partial<BlogPost>): string {
  // If post explicitly specifies a valid URL or data-uri, return it
  if (post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('data:') || post.coverImage.startsWith('/'))) {
    return post.coverImage;
  }

  const category = (post.category || '').toLowerCase();
  const slug = (post.slug || '').toLowerCase();
  const title = (post.title || '').toLowerCase();
  const tags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
  const combined = `${category} ${slug} ${title} ${tags}`;

  // 1. AI & LLMO
  if (combined.includes('ai') || combined.includes('llm') || combined.includes('llmo') || combined.includes('searchgpt') || combined.includes('perplexity') || combined.includes('rag') || combined.includes('claude')) {
    if (combined.includes('citation') || combined.includes('knowledge')) {
      return PEXELS_ASSET_LIBRARY.ai_intelligence;
    }
    if (combined.includes('crawler') || combined.includes('llms.txt')) {
      return PEXELS_ASSET_LIBRARY.ai_neural;
    }
    return PEXELS_ASSET_LIBRARY.ai_abstract_wave;
  }

  // 2. DOM & Performance
  if (combined.includes('dom') || combined.includes('health') || combined.includes('lcp') || combined.includes('inp') || combined.includes('cls') || combined.includes('vital') || combined.includes('performance') || combined.includes('css') || combined.includes('font')) {
    if (combined.includes('css') || combined.includes('font')) {
      return PEXELS_ASSET_LIBRARY.speed_rendering;
    }
    return PEXELS_ASSET_LIBRARY.dom_performance;
  }

  // 3. Edge Latency & CDN
  if (combined.includes('latency') || combined.includes('ttfb') || combined.includes('edge') || combined.includes('worker') || combined.includes('pop') || combined.includes('speed') || combined.includes('anycast') || combined.includes('quic')) {
    if (combined.includes('anycast') || combined.includes('pop')) {
      return PEXELS_ASSET_LIBRARY.edge_network;
    }
    return PEXELS_ASSET_LIBRARY.fiber_optics;
  }

  // 4. SecOps & OWASP
  if (combined.includes('security') || combined.includes('secops') || combined.includes('owasp') || combined.includes('csp') || combined.includes('hsts') || combined.includes('gdpr') || combined.includes('compliance') || combined.includes('threat')) {
    if (combined.includes('threat') || combined.includes('vulnerability')) {
      return PEXELS_ASSET_LIBRARY.cyber_matrix;
    }
    return PEXELS_ASSET_LIBRARY.secops_shield;
  }

  // 5. Git & Repo Hygiene
  if (combined.includes('repo') || combined.includes('git') || combined.includes('ci/cd') || combined.includes('pipeline') || combined.includes('github') || combined.includes('hygiene') || combined.includes('branch')) {
    return PEXELS_ASSET_LIBRARY.git_branches;
  }

  // 6. Sustainability & Green Web
  if (combined.includes('eco') || combined.includes('carbon') || combined.includes('green') || combined.includes('sustainability') || combined.includes('sustainable') || combined.includes('esg')) {
    return PEXELS_ASSET_LIBRARY.green_datacenter;
  }

  // 7. Migration & Architecture
  if (combined.includes('migration') || combined.includes('synth') || combined.includes('301') || combined.includes('architecture') || combined.includes('redirect') || combined.includes('platform')) {
    return PEXELS_ASSET_LIBRARY.architecture_blueprint;
  }

  // 8. Infrastructure & Cloud
  if (combined.includes('server') || combined.includes('cluster') || combined.includes('infra') || combined.includes('cloud')) {
    return PEXELS_ASSET_LIBRARY.cloud_servers;
  }

  return PEXELS_ASSET_LIBRARY.telemetry_dashboard;
}
