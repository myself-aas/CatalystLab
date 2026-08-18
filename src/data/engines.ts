import type { EngineMeta } from '../types';

export const ENGINES_MAP: Record<string, EngineMeta> = {
  health: {
    id: 'health',
    name: 'Website Health',
    category: 'Core',
    icon: 'health_and_safety',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    description: 'DOM complexity, TTFB, resource hints & render blocking bottlenecks.',
    pythonScript: 'website_health.py',
    route: '/health'
  },
  latency: {
    id: 'latency',
    name: 'Global Edge Latency',
    category: 'Developer & AI',
    icon: 'public',
    color: '#f472b6',
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    description: 'Multi-region synthetic edge latency & TTFB benchmarks.',
    pythonScript: 'edge_latency.py',
    route: '/latency'
  },
  ai_ready: {
    id: 'ai_ready',
    name: 'AI Readiness',
    category: 'Developer & AI',
    icon: 'psychology',
    color: '#c084fc',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'LLM crawler policy, llms.txt validation, RAG readiness & schemas.',
    pythonScript: 'ai_readiness.py',
    route: '/ai-readiness'
  },
  repo: {
    id: 'repo',
    name: 'Repo Hygiene',
    category: 'Enterprise',
    icon: 'inventory_2',
    color: '#4ade80',
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/30',
    description: 'GitHub/GitLab/Bitbucket security, license & branch protections.',
    pythonScript: 'repo_scanner.py',
    route: '/repo-scanner'
  },
  eco: {
    id: 'eco',
    name: 'Eco Carbon Footprint',
    category: 'Enterprise',
    icon: 'eco',
    color: '#34d399',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'CO2 grams per pageview, green host verification & sustainability.',
    pythonScript: 'eco_carbon_audit.py',
    route: '/eco-audit'
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance & Risk',
    category: 'Enterprise',
    icon: 'shield',
    color: '#fbbf24',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'WCAG accessibility, GDPR cookie consent & OWASP security headers.',
    pythonScript: 'compliance_risk_audit.py',
    route: '/compliance'
  },
  migration: {
    id: 'migration',
    name: 'Platform Migration',
    category: 'Core',
    icon: 'transform',
    color: '#fb923c',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    description: 'WordPress, Shopify & Next.js re-platforming pre-flight auditor.',
    pythonScript: 'platform_migration_audit.py',
    route: '/migration'
  },
  llmo: {
    id: 'llmo',
    name: 'AI Search Optimization',
    category: 'Developer & AI',
    icon: 'smart_toy',
    color: '#67e8f9',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Generative search engine citations and Perplexity indexability.',
    pythonScript: 'llmo_optimizer.py',
    route: '/llmo'
  }
};
