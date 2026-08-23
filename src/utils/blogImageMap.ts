import type { BlogPost } from '../types';

/**
 * Curated Unsplash Image Library
 * All assets are high-resolution, copyright-free photography hosted on Unsplash CDN.
 */
export const UNSPLASH_ASSET_LIBRARY = {
  // 1. AI & LLMO / Generative Search / RAG
  ai_neural: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
  ai_abstract_wave: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  ai_intelligence: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=1200',

  // 2. Core Performance / DOM Depth / Core Web Vitals
  dom_performance: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
  cpu_hardware: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
  speed_rendering: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',

  // 3. Edge Latency / Anycast / DNS / QUIC
  edge_network: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
  fiber_optics: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200',
  global_routes: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',

  // 4. SecOps / OWASP / CSP Nonce / Compliance
  secops_shield: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
  security_lock: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
  cyber_matrix: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=1200',

  // 5. Git Repositories / CI/CD Pipelines / Static Analysis
  git_branches: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200',
  code_review: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200',
  devops_pipeline: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',

  // 6. Sustainability / Green Web / SWD Carbon
  green_datacenter: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200',
  eco_tech: 'https://images.unsplash.com/photo-1508873696983-2df5703bc225?auto=format&fit=crop&q=80&w=1200',
  clean_energy: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1200',

  // 7. System Architecture / Migration / 301 Canonical
  architecture_blueprint: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
  cloud_servers: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
  datacenter_grid: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200',

  // 8. General Telemetry / Field Notes
  telemetry_dashboard: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
  engineering_command: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200',
  deep_analytics: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=1200'
};

/**
 * Maps any blog post to a contextual, copyright-free Unsplash image URL.
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
      return UNSPLASH_ASSET_LIBRARY.ai_intelligence;
    }
    if (combined.includes('crawler') || combined.includes('llms.txt')) {
      return UNSPLASH_ASSET_LIBRARY.ai_neural;
    }
    return UNSPLASH_ASSET_LIBRARY.ai_abstract_wave;
  }

  // 2. DOM & Performance
  if (combined.includes('dom') || combined.includes('health') || combined.includes('lcp') || combined.includes('inp') || combined.includes('cls') || combined.includes('vital') || combined.includes('performance') || combined.includes('css') || combined.includes('font')) {
    if (combined.includes('css') || combined.includes('font')) {
      return UNSPLASH_ASSET_LIBRARY.speed_rendering;
    }
    return UNSPLASH_ASSET_LIBRARY.dom_performance;
  }

  // 3. Edge Latency & CDN
  if (combined.includes('latency') || combined.includes('ttfb') || combined.includes('edge') || combined.includes('worker') || combined.includes('pop') || combined.includes('speed') || combined.includes('anycast') || combined.includes('quic')) {
    if (combined.includes('anycast') || combined.includes('pop')) {
      return UNSPLASH_ASSET_LIBRARY.edge_network;
    }
    return UNSPLASH_ASSET_LIBRARY.fiber_optics;
  }

  // 4. SecOps & OWASP
  if (combined.includes('security') || combined.includes('secops') || combined.includes('owasp') || combined.includes('csp') || combined.includes('hsts') || combined.includes('gdpr') || combined.includes('compliance') || combined.includes('threat')) {
    if (combined.includes('threat') || combined.includes('vulnerability')) {
      return UNSPLASH_ASSET_LIBRARY.cyber_matrix;
    }
    return UNSPLASH_ASSET_LIBRARY.secops_shield;
  }

  // 5. Git & Repo Hygiene
  if (combined.includes('repo') || combined.includes('git') || combined.includes('ci/cd') || combined.includes('pipeline') || combined.includes('github') || combined.includes('hygiene') || combined.includes('branch')) {
    return UNSPLASH_ASSET_LIBRARY.git_branches;
  }

  // 6. Sustainability & Green Web
  if (combined.includes('eco') || combined.includes('carbon') || combined.includes('green') || combined.includes('sustainability') || combined.includes('sustainable') || combined.includes('esg')) {
    return UNSPLASH_ASSET_LIBRARY.green_datacenter;
  }

  // 7. Migration & Architecture
  if (combined.includes('migration') || combined.includes('synth') || combined.includes('301') || combined.includes('architecture') || combined.includes('redirect') || combined.includes('platform')) {
    return UNSPLASH_ASSET_LIBRARY.architecture_blueprint;
  }

  // 8. Infrastructure & Cloud
  if (combined.includes('server') || combined.includes('cluster') || combined.includes('infra') || combined.includes('cloud')) {
    return UNSPLASH_ASSET_LIBRARY.cloud_servers;
  }

  return UNSPLASH_ASSET_LIBRARY.telemetry_dashboard;
}
