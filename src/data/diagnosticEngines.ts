// Diagnostic Engines data model
export interface Metric {
  label: string;
  value: string;
}

export interface Engine {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  metrics: Metric[];
  badge: string;
  theme: 'dark' | 'light';
}

export const engines: Engine[] = [
  {
    id: 'vitalzyme',
    name: 'VitalZyme',
    subtitle: 'Web Vitals',
    category: 'Performance',
    metrics: [
      { label: 'Metric', value: 'DOM/TTFB' },
      { label: 'Status', value: 'Optimal' },
    ],
    badge: 'Engine 01',
    theme: 'dark',
  },
  {
    id: 'llm-kinase',
    name: 'LLM-Kinase',
    subtitle: 'AI Readiness',
    category: 'AI / Search',
    metrics: [
      { label: 'Spec', value: 'llms.txt' },
      { label: 'Score', value: '98/100' },
    ],
    badge: 'Engine 02',
    theme: 'light',
  },
  {
    id: 'gitlygase',
    name: 'GitLygase',
    subtitle: 'Repo Hygiene',
    category: 'Security & Dev',
    metrics: [
      { label: 'Scope', value: 'SecOps' },
      { label: 'Health', value: 'Clean' },
    ],
    badge: 'Engine 03',
    theme: 'dark',
  },
  {
    id: 'edgevmax',
    name: 'EdgeVmax',
    subtitle: 'Latency Radar',
    category: 'Infrastructure',
    metrics: [
      { label: 'Coverage', value: '42 PoPs' },
      { label: 'Avg RTT', value: '14ms' },
    ],
    badge: 'Engine 04',
    theme: 'light',
  },
  {
    id: 'ecoholo',
    name: 'EcoHolo',
    subtitle: 'Carbon Audit',
    category: 'Sustainability',
    metrics: [
      { label: 'Footprint', value: 'CO2e' },
      { label: 'Impact', value: 'Low' },
    ],
    badge: 'Engine 05',
    theme: 'dark',
  },
  {
    id: 'riskprotease',
    name: 'RiskProtease',
    subtitle: 'OWASP SecOps',
    category: 'Security',
    metrics: [
      { label: 'Audit', value: 'Headers' },
      { label: 'Risk', value: 'Pass' },
    ],
    badge: 'Engine 06',
    theme: 'light',
  },
  {
    id: 'synthshift',
    name: 'SynthShift',
    subtitle: 'Architecture PAR',
    category: 'Architecture',
    metrics: [
      { label: 'Deployment', value: 'Phase 1' },
      { label: 'State', value: 'Active' },
    ],
    badge: 'Engine 07',
    theme: 'dark',
  },
  {
    id: 'allostersearch',
    name: 'AllosterSearch',
    subtitle: 'LLMO Search',
    category: 'Optimization',
    metrics: [
      { label: 'Target', value: 'GEO' },
      { label: 'Index', value: 'Ready' },
    ],
    badge: 'Engine 08',
    theme: 'light',
  },
];
