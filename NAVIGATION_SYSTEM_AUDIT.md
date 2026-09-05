# Navigation System Audit & Remediation

> Companion to `DESIGN_SYSTEM_CONSISTENCY_AUDIT.md`.
> Status: **Implemented and gate-verified (tsc / lint / test / build all green).**

## 1. Problem

The website had **no single source of truth** for navigation. Each surface defined its own
menu and its own destination strings, which produced:

1. **Fragmentation** — `Navbar`, `MainMenuOverlay`, `DashboardShell`, `EngineSubNav`,
   `NavbarSearch`, and `Footer` each carried independent copy of the same destinations.
2. **Dead / inconsistent destinations** — several menu entries pointed at routes that were
   not served directly or pointed at legacy slugs while the rest of the product used a
   different slug, e.g.:
   - `/engine/*` (singular) in the old Navbar engine mega-menu (no route).
   - `/engines/<engine-id>` in `EnzymeGrid` (`/engines/migration`, `/engines/health`,
     `/engines/latency`, `/engines/compliance`, `/engines/eco`, `/engines/ai_ready`,
     `/engines/llmo`) — only `/engines` is a route, so these 404'd.
   - `/pipeline` (no route).
   - Bare engine slugs in `Footer` / `EngineSubNav` / `NavbarSearch` (`/health`,
     `/migration`, `/latency`, `/compliance`, `/eco-audit`, `/ai-readiness`,
     `/repo-scanner`, `/llmo`) vs. the canonical `/docs/*` engine dossier routes.
3. **No role awareness** — the global navbar did not adapt to visitor / signed-in user /
   superadmin in a consistent way, and the main-menu overlay administered routes differently
   from the dashboard shell.

## 2. Solution: canonical navigation model

New module: **`src/navigation/index.ts`** — the single source of truth.

| Export | Purpose |
| --- | --- |
| `NavAudience` | `'visitor' \| 'user' \| 'admin'` |
| `NavItem` / `NavGroup` | Typed menu entries incl. destination, icon, badge, badge variant, active-match prefixes, permission |
| `CANONICAL` | Route-keyed destination map for every high-level page |
| `ENGINE_ITEMS` | 8 engine dossiers, all `to` values point at real `/docs/*` routes |
| `VISITOR_PRIMARY_NAV` | Always-shown primary links |
| `USER_PRIMARY_NAV` | Extra primary link for signed-in users (Dashboard) |
| `ADMIN_PRIMARY_NAV` | Extra primary link for superadmins (Admin) |
| `EXPLORE_NAV` | Secondary explore links used by account/settings surfaces |
| `FOOTER_GROUPS` | 5 footer columns, every destination verified |
| `getPrimaryNav(audience)` | Builds the correct primary nav for an audience |
| `isNavItemActive(item, pathname)` | Shared active-state matcher |
| `NAV_ICONS` | Icon registry for data-driven menus |

### Audience matrix (`getPrimaryNav`)

| Audience | Primary links |
| --- | --- |
| Visitor | Engines, Benchmarks, Docs, Blogs, Pricing |
| Signed-in user | Engines, **Dashboard**, Benchmarks, Docs, Blogs, Pricing |
| Superadmin | Engines, **Admin**, **Dashboard**, Benchmarks, Docs, Blogs, Pricing |

Engines remains a mega-menu trigger in the navbar; the remaining primary links render as
direct route links.

## 3. Menu surfaces remapped

| Surface | File | Change |
| --- | --- | --- |
| Global navbar (desktop + mobile) | `src/components/layout/Navbar.tsx` | Rewritten to use `getPrimaryNav` + `isNavItemActive`; user profile dropdown (initials, plan, Admin Console, Dashboard, Sign out); engine mega-menu uses `ENGINE_ITEMS`; CTA → `/audit`; mobile sheet mirrors role-aware model. |
| Footer | `src/components/layout/Footer.tsx` | Replaced hardcoded `FOOTER_COLUMNS` with `FOOTER_GROUPS` from the canonical model; dead engine slugs replaced with `/docs/*`. |
| Main menu overlay | `src/components/layout/MainMenuOverlay.tsx` | Menu data uses canonical routes; engine submenu → `/engines` + `/docs/*`; admin entry gated by `isAdmin` **and** `page:view_admin`; CTA → `/audit`. |
| Engine sub-nav | `src/components/layout/EngineSubNav.tsx` | Destinations supplied by `ENGINES_MAP[*].route` (now canonical `/docs/*`) — no change needed to the component body. |
| Navbar search | `src/components/layout/NavbarSearch.tsx` | Static suggestions now navigate to canonical `/docs/*` engine dossiers. |
| Home engine grid | `src/components/home/EnzymeGrid.tsx` | `/engines/<id>` dead links replaced with `ENGINES_MAP[*].route`. |
| Dashboard shell | `src/components/dashboard/DashboardShell.tsx` | Dossier quick-search entry uses `/docs/vitalzyme` instead of `/health`. |

## 4. Engine canonical destinations

| Engine | Data key | Canonical dossier |
| --- | --- | --- |
| SynthShift | `migration` | `/docs/synthshift` |
| GitLygase | `repo` | `/docs/gitlygase` |
| EcoHolo | `eco` | `/docs/ecoholo` |
| VitalZyme | `health` | `/docs/vitalzyme` |
| EdgeVmax | `latency` | `/docs/edgevmax` |
| RiskProtease | `compliance` | `/docs/riskprotease` |
| LLM-Kinase | `ai_ready` | `/docs/llm-kinase` |
| AllosterSearch | `llmo` | `/docs/allostersearch` |

These are backed by real `<Route path>` entries in `src/App.tsx`.

## 5. Verification

- **Static route scan** across every `src/**/*.{ts,tsx}` internal `to/href/path/route`
  literal: **0 destinations resolve to a missing route** (the only `/pipeline` match is
  inside a documentation comment).
- `npx tsc --noEmit` — passes.
- `npm run lint` — passes.
- `npm test` — passes (16 files, 177 tests).
- `npm run build` — passes.

## 6. Left as-is (intentional)

- `DashboardShell` sidebar entries are **in-page section tabs** driving `activeView`
  (not route links), so they intentionally are not in the canonical nav model.
- Legacy route **aliases** (`/health`, `/launch-audit`, `/audit`, `/docs/health`, etc.)
  remain registered in `src/App.tsx` for deep-link backward compatibility. New menus point
  only at canonical destinations.
- External links (RFC specs, social profiles) remain external.
