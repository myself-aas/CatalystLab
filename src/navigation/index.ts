/**
 * CatalystLab — canonical navigation model (single source of truth).
 *
 * Every menu (primary navbar, mobile sheet, dashboard shell, main-menu
 * overlay, footer) should read from this module. It guarantees:
 *  - every destination maps to a route that actually renders in `src/App.tsx`
 *    (no more `/engine/*`, `/engines/*`, `/pipeline`, … dead ends);
 *  - the item set adapts to the viewer (visitor / signed-in user / superadmin);
 *  - labels, icons, badges and active-matching stay consistent everywhere.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  Code2,
  Compass,
  CreditCard,
  FileText,
  GitBranch,
  Globe,
  Home,
  Info,
  KeyRound,
  LayoutDashboard,
  Leaf,
  Lock,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Terminal,
  User,
  Zap,
} from 'lucide-react';

export type NavBadgeVariant = 'default' | 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';

export type NavAudience = 'visitor' | 'user' | 'admin';

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: NavBadgeVariant;
  /** Prefixes that mark this item as the "current" route (defaults to `to`). */
  match?: string[];
  permission?: string;
}

export interface NavGroup {
  id: string;
  code?: string;
  label: string;
  items: NavItem[];
}

/** Canonical destinations — every value must resolve in src/App.tsx. */
export const CANONICAL = {
  home: '/',
  audit: '/audit',
  engines: '/engines',
  compare: '/compare',
  products: '/products',
  pricing: '/pricing',
  docs: '/docs',
  api: '/api-docs',
  playground: '/playground',
  blogs: '/blogs',
  report: '/reports',
  about: '/about',
  contact: '/contact',
  methodology: '/methodology',
  security: '/security',
  legal: '/legal',
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',
  dashboard: '/dashboard',
  admin: '/admin',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
} as const;

/** Engine landing destinations (all exist as /docs/* route pages). */
export const ENGINE_ITEMS: NavItem[] = [
  { id: 'vitalzyme', label: 'VitalZyme', to: '/docs/vitalzyme', icon: Activity, badge: 'LCP/INP' },
  { id: 'edgevmax', label: 'EdgeVmax', to: '/docs/edgevmax', icon: Globe, badge: 'TLS 1.3' },
  { id: 'ecoholo', label: 'EcoHolo', to: '/docs/ecoholo', icon: Leaf, badge: 'CO2e' },
  { id: 'allostersearch', label: 'AllosterSearch', to: '/docs/allostersearch', icon: Sparkles, badge: 'LLMO' },
  { id: 'riskprotease', label: 'RiskProtease', to: '/docs/riskprotease', icon: ShieldCheck, badge: 'OWASP' },
  { id: 'synthshift', label: 'SynthShift', to: '/docs/synthshift', icon: GitBranch, badge: 'AST Diff' },
  { id: 'llmkinase', label: 'LLM-Kinase', to: '/docs/llm-kinase', icon: Zap, badge: 'llms.txt' },
  { id: 'gitlygase', label: 'GitLygase', to: '/docs/gitlygase', icon: Terminal, badge: 'Repo' },
];

/** Top-level items that are always available to every visitor. */
export const VISITOR_PRIMARY_NAV: NavItem[] = [
  { id: 'engines', label: 'Engines', to: CANONICAL.engines, icon: Activity, match: ['/engines', '/docs', '/docs/'] },
  { id: 'compare', label: 'Benchmarks', to: CANONICAL.compare, icon: Scale },
  { id: 'docs', label: 'Docs', to: CANONICAL.docs, icon: BookOpen, match: ['/docs', '/docs/'] },
  { id: 'blogs', label: 'Blogs', to: CANONICAL.blogs, icon: FileText },
  { id: 'pricing', label: 'Pricing', to: CANONICAL.pricing, icon: CreditCard },
];

/** Extra top-level items shown only to signed-in users. */
export const USER_PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: CANONICAL.dashboard, icon: LayoutDashboard, match: ['/dashboard', '/user-dashboard', '/hud', '/app'] },
];

/** Extra top-level items shown only to superadmins. */
export const ADMIN_PRIMARY_NAV: NavItem[] = [
  { id: 'admin', label: 'Admin', to: CANONICAL.admin, icon: ShieldCheck, permission: 'page:view_admin' },
];

/** Secondary "explore" links used in the account/settings area. */
export const EXPLORE_NAV: NavItem[] = [
  { id: 'products', label: 'Products', to: CANONICAL.products, icon: Radio },
  { id: 'reports', label: 'Dossiers', to: CANONICAL.report, icon: FileText },
  { id: 'api', label: 'API Reference', to: CANONICAL.api, icon: Code2 },
  { id: 'playground', label: 'Playground', to: CANONICAL.playground, icon: Terminal },
  { id: 'about', label: 'About', to: CANONICAL.about, icon: Info },
  { id: 'contact', label: 'Contact', to: CANONICAL.contact, icon: User },
];

/** Footer directory — destinations verified against src/App.tsx. */
export const FOOTER_GROUPS: NavGroup[] = [
  {
    id: 'engines',
    code: '01',
    label: 'Autonomous Engines',
    items: [
      { id: 'vitalzyme', label: 'VitalZyme (Web Vitals)', to: '/docs/vitalzyme', icon: Activity, badge: 'LCP/INP', badgeVariant: 'emerald' },
      { id: 'synthshift', label: 'SynthShift (AST Diff)', to: '/docs/synthshift', icon: GitBranch, badge: 'AST Diff', badgeVariant: 'violet' },
      { id: 'edgevmax', label: 'EdgeVmax (Edge & TLS)', to: '/docs/edgevmax', icon: Globe, badge: 'TLS 1.3', badgeVariant: 'cyan' },
      { id: 'riskprotease', label: 'RiskProtease (OWASP)', to: '/docs/riskprotease', icon: ShieldCheck, badge: 'OWASP', badgeVariant: 'amber' },
      { id: 'ecoholo', label: 'EcoHolo (Carbon)', to: '/docs/ecoholo', icon: Leaf, badge: 'CO2e', badgeVariant: 'emerald' },
      { id: 'llmkinase', label: 'LLM-Kinase (AI)', to: '/docs/llm-kinase', icon: Sparkles, badge: 'llms.txt', badgeVariant: 'violet' },
      { id: 'allostersearch', label: 'AllosterSearch (LLMO)', to: '/docs/allostersearch', icon: Zap, badge: 'GEO', badgeVariant: 'cyan' },
      { id: 'gitlygase', label: 'GitLygase (Repo)', to: '/docs/gitlygase', icon: Terminal, badge: 'SecOps', badgeVariant: 'rose' },
    ],
  },
  {
    id: 'platform',
    code: '02',
    label: 'Architecture & Edge',
    items: [
      { id: 'pipeline', label: '4-Stage Pipeline', to: '/docs/architecture', icon: GitBranch, badge: 'v2.4', badgeVariant: 'cyan' },
      { id: 'edge', label: 'Edge Latency Matrix', to: '/compare', icon: Radio, badge: '38 PoPs', badgeVariant: 'emerald' },
      { id: 'dossiers', label: 'Live Dossier Explorer', to: '/reports', icon: FileText, badge: 'Public', badgeVariant: 'default' },
      { id: 'patches', label: 'Automated PR Patches', to: '/audit', icon: Code2, badge: 'Auto-Fix', badgeVariant: 'violet' },
      { id: 'zerossdk', label: 'Zero-SDK Architecture', to: '/docs/overview', icon: Lock, badge: 'Agentless', badgeVariant: 'default' },
      { id: 'mesh', label: 'Edge Mesh Coverage', to: '/products', icon: Compass, badge: 'Anycast', badgeVariant: 'cyan' },
    ],
  },
  {
    id: 'developers',
    code: '03',
    label: 'Developers & CLI',
    items: [
      { id: 'rest', label: 'REST & gRPC Reference', to: '/api-docs', icon: Code2, badge: 'v2 API', badgeVariant: 'cyan' },
      { id: 'cli', label: 'Catalyst CLI Runner', to: '/docs/cicd', icon: Terminal, badge: 'npx', badgeVariant: 'default' },
      { id: 'playground', label: 'Interactive Playground', to: '/playground', icon: Zap, badge: 'Live', badgeVariant: 'emerald' },
      { id: 'actions', label: 'GitHub Action CI/CD', to: '/docs/cicd', icon: GitBranch, badge: 'CI/CD', badgeVariant: 'violet' },
      { id: 'plugins', label: 'Claude & Cursor Plugins', to: '/docs/devops', icon: Sparkles, badge: 'AI IDE', badgeVariant: 'amber' },
      { id: 'changelog', label: 'Engineering Changelog', to: '/blogs', icon: BookOpen, badge: 'Weekly', badgeVariant: 'default' },
    ],
  },
  {
    id: 'trust',
    code: '04',
    label: 'Trust & Compliance',
    items: [
      { id: 'owasp', label: 'OWASP Top 10 Standard', to: '/docs/riskprotease', icon: ShieldCheck, badge: 'Grade A+', badgeVariant: 'emerald' },
      { id: 'soc2', label: 'SOC 2 Type II Certified', to: '/security', icon: Lock, badge: 'Audited', badgeVariant: 'cyan' },
      { id: 'sla', label: '99.99% Edge Mesh SLA', to: '/pricing', icon: Scale, badge: 'SLA', badgeVariant: 'default' },
      { id: 'sandbox', label: 'Security Sandbox Policy', to: '/docs/security-sandbox', icon: Lock, badge: 'Zero-Log', badgeVariant: 'default' },
      { id: 'disclosure', label: 'Vulnerability Disclosure', to: '/security', icon: ShieldCheck, badge: 'Bounty', badgeVariant: 'rose' },
      { id: 'rate', label: 'Rate Limiting Standard', to: '/docs/rate-limiting', icon: Terminal, badge: 'RFC 6585', badgeVariant: 'default' },
    ],
  },
  {
    id: 'company',
    code: '05',
    label: 'Company & Network',
    items: [
      { id: 'about', label: 'About CatalystLab', to: '/about', icon: Info, badge: 'Mission', badgeVariant: 'default' },
      { id: 'customers', label: 'Enterprise Customers', to: '/pricing', icon: CreditCard, badge: 'Linear · Vercel', badgeVariant: 'default' },
      { id: 'careers', label: 'Careers & Research', to: '/about', icon: Sparkles, badge: 'Hiring', badgeVariant: 'emerald' },
      { id: 'contact', label: 'Contact Engineering', to: '/contact', icon: KeyRound, badge: '24/7 SLA', badgeVariant: 'cyan' },
      { id: 'legal', label: 'Legal & Terms Hub', to: '/legal', icon: FileText, badge: 'Legal', badgeVariant: 'default' },
      { id: 'privacy', label: 'Privacy & Cookie Shield', to: '/privacy', icon: Lock, badge: 'GDPR', badgeVariant: 'default' },
    ],
  },
];

/** Build the primary nav for a given audience. */
export function getPrimaryNav(audience: NavAudience): NavItem[] {
  const base = [...VISITOR_PRIMARY_NAV];
  if (audience === 'user' || audience === 'admin') {
    base.splice(1, 0, ...USER_PRIMARY_NAV);
  }
  if (audience === 'admin') {
    base.splice(1, 0, ...ADMIN_PRIMARY_NAV);
  }
  return base;
}

/** Boolean helper shared by nav components. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const matches = item.match?.length ? item.match : [item.to];
  return matches.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p)));
}

export const NAV_ICONS: Record<string, LucideIcon> = {
  Activity, BookOpen, Code2, Compass, CreditCard, FileText, GitBranch, Globe, Home,
  Info, KeyRound, LayoutDashboard, Leaf, Lock, Radio, Scale, ShieldCheck, Sparkles,
  Terminal, User, Zap,
};
