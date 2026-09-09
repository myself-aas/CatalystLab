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
  { id: 'vitalzyme', label: 'VitalZyme', to: '/docs/vitalzyme', icon: Activity },
  { id: 'edgevmax', label: 'EdgeVmax', to: '/docs/edgevmax', icon: Globe },
  { id: 'ecoholo', label: 'EcoHolo', to: '/docs/ecoholo', icon: Leaf },
  { id: 'allostersearch', label: 'AllosterSearch', to: '/docs/allostersearch', icon: Sparkles },
  { id: 'riskprotease', label: 'RiskProtease', to: '/docs/riskprotease', icon: ShieldCheck },
  { id: 'synthshift', label: 'SynthShift', to: '/docs/synthshift', icon: GitBranch },
  { id: 'llmkinase', label: 'LLM-Kinase', to: '/docs/llm-kinase', icon: Zap },
  { id: 'gitlygase', label: 'GitLygase', to: '/docs/gitlygase', icon: Terminal },
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
  { id: 'api', label: 'API', to: CANONICAL.api, icon: Code2 },
  { id: 'playground', label: 'Playground', to: CANONICAL.playground, icon: Terminal },
  { id: 'about', label: 'About', to: CANONICAL.about, icon: Info },
  { id: 'contact', label: 'Contact', to: CANONICAL.contact, icon: User },
];

/** Footer directory — destinations verified against src/App.tsx. */
export const FOOTER_GROUPS: NavGroup[] = [
  {
    id: 'resources',
    code: '01',
    label: 'Resources',
    items: [
      { id: 'docs', label: 'Docs', to: '/docs', icon: BookOpen },
      { id: 'blogs', label: 'Blogs', to: '/blogs', icon: FileText },
      { id: 'pricing', label: 'Pricing', to: '/pricing', icon: CreditCard },
      { id: 'compare', label: 'Benchmarks', to: '/compare', icon: Scale },
      { id: 'about', label: 'About', to: '/about', icon: Info },
      { id: 'contact', label: 'Contact', to: '/contact', icon: KeyRound },
    ],
  },
  {
    id: 'engines',
    code: '02',
    label: 'Engines',
    items: [
      { id: 'vitalzyme', label: 'VitalZyme', to: '/docs/vitalzyme', icon: Activity },
      { id: 'edgevmax', label: 'EdgeVmax', to: '/docs/edgevmax', icon: Globe },
      { id: 'riskprotease', label: 'RiskProtease', to: '/docs/riskprotease', icon: ShieldCheck },
      { id: 'llmkinase', label: 'LLM-Kinase', to: '/docs/llm-kinase', icon: Sparkles },
      { id: 'synthshift', label: 'SynthShift', to: '/docs/synthshift', icon: GitBranch },
      { id: 'ecoholo', label: 'EcoHolo', to: '/docs/ecoholo', icon: Leaf },
      { id: 'allostersearch', label: 'AllosterSearch', to: '/docs/allostersearch', icon: Zap },
      { id: 'gitlygase', label: 'GitLygase', to: '/docs/gitlygase', icon: Terminal },
    ],
  },
  {
    id: 'platform',
    code: '03',
    label: 'Platform',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { id: 'pipeline', label: 'Pipeline', to: '/docs/architecture', icon: GitBranch },
      { id: 'dossiers', label: 'Dossiers', to: '/reports', icon: FileText },
      { id: 'patches', label: 'Patches', to: '/audit', icon: Code2 },
      { id: 'api', label: 'API', to: '/api-docs', icon: Terminal },
      { id: 'cli', label: 'CLI', to: '/docs/cicd', icon: Terminal },
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
