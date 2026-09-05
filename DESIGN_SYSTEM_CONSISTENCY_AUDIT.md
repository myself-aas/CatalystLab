# CatalystLab Global Design System Audit

> Scope: every page/route (contact, about, docs, blogs, blog article, article editor, engines/hub, user dashboard, admin dashboard, tool, compare, pricing, auth, legal, playground, api docs) plus the shared UI, component, layout, animation, and card layers.
> Method: static audit of `src/index.css`, `src/styles/*`, all `src/components/**`, `src/pages/**`, plus a machine pass over Tailwind tokens, hardcoded color utilities, radius/typography/container usage, and animation imports.

---

## 1. Verdict

The **design system foundation is strong and correctly theme-aware**: a Semantic Core (`--app-*`), a Modern/Linear token set (`--background-*`, `--foreground-*`, `--accent-*`, `--border-*`, `--surface-*`), Tailwind `@theme` mapping, a dedicated card token system (`styles/card-tokens.css`), and a small set of shared primitives (`.ds-page-shell`, `.ds-section`, `.ds-eyebrow`, `.ds-card`, `.ds-card-interactive`, `.ds-control`, `.ds-muted`).

**The main problem is not the tokens — it is that a large number of surfaces sidestep the tokens and hardcode values.** That creates true drift: the same logical "muted text" is `#999999` in one place, `#666666` in another, `text-muted-foreground` in a third, and `#8A8F98` behind the token. Once the theme flips to light, hardcoded surfaces stay dark-on-dark (or white-on-white) because they are not token-backed.

### Scores
| Area | Consistency | Notes |
|---|---|---|
| Page layout / shell | 8/10 | `max-w-7xl mx-auto` is near-universal; `ds-page-shell` used on 52 spots; a few pages use `max-w-[90rem]`. |
| Color tokens | 4/10 | 62 files still hardcode hex utilities; ~800 hardcoded grayscale/accent utilities in shared surfaces. |
| Card primitives | 6/10 | `.ds-card` used 192×, but many pages hand-roll glass panels (`bg-[#0B0B0B]/90 … rounded-3xl`). |
| Buttons / controls | 6/10 | `ds-control` used only 3×; buttons repeat `rounded-lg/xl/full` + `focus-visible:ring-2 ring-ring`. |
| Typography | 7/10 | Inter/JetBrains Mono tokens are respected; docs pages override with `#EDEDED`/`#A1A1AA`. |
| Icons | 8/10 | lucide-react used consistently; some legacy inline `<path>` icons remain. |
| Animations | 7/10 | `motion/react` (Framer). Some legacy variants (`framer-card-hover`, `card-active-lift`) alongside motion props. |
| Accessibility | 8/10 | skip link, focus rings, `aria-label`s, dialog roles, reduced-motion hook — strong. |
| Light theme | 5/10 | Core shell + cards work; hardcoded dark strokes (docs, contact, admin/user cockpits) do not. |

---

## 2. What is consistent (do not touch)

- `@theme inline` correctly maps `--app-*` to Tailwind `bg-background / text-foreground / text-muted-foreground / border-border / bg-card / bg-muted / bg-accent / text-primary / ring-ring`.
- Font stacks (`Inter`, `JetBrains Mono`) and `--font-sans/--font-mono`.
- `.ds-card`, `.ds-card-interactive`, `.ds-eyebrow`, `.ds-muted`, `.ds-page-shell`, `.ds-section`.
- Hero-to-page pattern: `min-h-[100dvh]`, `pt-24`, `px-4 sm:px-6 lg:px-8`, `max-w-7xl mx-auto`, `flex flex-col gap-*`.
- Section header pattern (`src/components/home/SectionHeader.tsx`) is used across marketing pages.
- Focus-visible ring and reduced-motion handling.
- `PageTransition` / `LazyReveal` / `AnimatePresence` route transitions.

---

## 3. Findings by area

### 3.1 Color consistency (largest issue)
Hardcoded utilities found (top, shared surfaces):
```
#999999 232   #A1A1AA 226   #666666 173   #EDEDED 196   #050505 14   #0B0B0B 9
#00D2FF 56    #0066FF 37    #00F298 27    #8A2BE2 13     #FF9900 13    #888888 14
```
| Hardcoded value | Should be | Reason |
|---|---|---|
| `text-[#999999]` | `text-muted-foreground` | `--app-muted-foreground` (light `#5f6368`, dark `#8A8F98`) |
| `text-[#666666]` | `text-muted-foreground` | same semantics |
| `text-[#888888]` | `text-muted-foreground` | same semantics |
| `text-[#A1A1AA]` | `text-foreground-muted` | zinc-400 → `--foreground-muted` |
| `text-[#EDEDED]/#EDEDEF` | `text-foreground` | `--app-foreground` |
| `bg-[#0B0B0B]` `#0A0A0A` `#0F0F0F` `#111111` `#101010` | `bg-surface` / `bg-surface/90` | `--bg-surface` (dark), token matches in light |
| `bg-[#050505]` | `bg-background` | `--app-background` |
| `text-[#0066FF]` | `text-primary` (or deliberately keep as legacy Framer-blue) | legacy accent vs Linear indigo — document or migrate |
| `text-[#00D2FF]/#00F298/#8A2BE2/#FF9900` | engine-hue tokens | already exist as `--accent-cyan-edge`, `--accent-emerald-vital`, `--accent-violet-synth`, `--accent-amber-sec` |

### 3.2 Radius / border scale
- `rounded-xl` 523, `rounded-full` 428, `rounded-lg` 288, `rounded-2xl` 214, `rounded-3xl` 49, custom `[24px]/[28px]/[14px]/[10px]` 6.
- Recommendation: define (`--radius-xs/sm/md/lg/xl/2xl`) and use `rounded-lg/xl/2xl/full`; map `rounded-3xl` → `rounded-2xl` (16px) for card surfaces or keep for hero panels. Do not use bespoke px in new code.

### 3.3 Buttons / forms
- `.ds-control` (min-height 2.75rem, radius .65rem) is defined but only used 3×; the rest repeat classes.
- Buttons have two dominant families: (a) `rounded-xl … bg-primary` on marketing, (b) `rounded-full … bg-foreground` on dashboard. Promote a `.ds-btn`, `.ds-btn-primary`, `.ds-btn-secondary`, `.ds-input` layer and stop hand-rolling focus rings.

### 3.4 Card / glass panels
- `.ds-card` is the canonical card; `cards/primitives/Card.tsx` is the canonical React primitive.
- Contact page and several admin/telemetry surfaces hand-roll `bg-[#0B0B0B]/90 backdrop-blur-xl border-white/10 rounded-3xl` instead of `ds-card`/`Card`. Consolidate to `Card`, or align hand-rolled panels to `border-border bg-card/.. rounded-2xl`.

### 3.5 Typography
- Marketing pages: `text-3xl…text-5xl font-semibold tracking-[-0.035em]` — consistent.
- Docs pages: many `#EDEDED`/`#A1A1AA` strokes on headings/code; should be `text-foreground`/`text-foreground-muted`. `.docs-devsite-article`/`.docs-content` scoped styles already exist.
- `text-white` used intentionally on dark hero visuals — acceptable; prefer `text-foreground` when in a theme-controlled surface.

### 3.6 Animations
- `motion/react` is the canonical library; legacy class-driven physics (`framer-card-hover`, `card-active-lift`, `.card-hue-*`) are still in the card system and used alongside. Keep the CSS for cheap hovers but standardize on `motion` variants for enter/orchestration and `.ds-card-interactive` for hover.
- Route transitions: `AnimatePresence mode="wait"` + `PageTransition` — good and consistent.
- No `prefers-reduced-motion` gap: `useCardReducedMotion`/`useReducedMotion` are used; verify every new animation respects it.

### 3.7 Light theme parity (specific pages that stay "dark" in light mode)
- `docs/*` doc pages (hardcoded `#EDEDED`, `#A1A1AA`)
- `ContactPage`, `SignUpPage`, `LoginPage`, `ForgotPasswordPage`
- `FramerDossierCockpit`, `FramerAdminCockpit`, `DashboardShell`, `SimulationWidgets`
- `EnzymeGrid`, `WorkflowSection`, `Footer`, `Navbar`
These should become token-backed (the dark-first ones may remain "always dark" surfaces, but that must be an explicit decision — those that sit inside the light shell should flip).

### 3.8 Misc
- About page stores engine colors in a data array and applies them via inline style — fine for accents but should use the `--hue-*`/engine tokens for consistency.
- `DesignSystemDoc` / `ReactDevDesignPage` is a stray design playground mirroring the real system; keep as documentation but add a "deprecated/non-canonical" callout.

---

## 4. Plan (step-by-step)

### Step 1 — Token normalization (this pass, low risk)
Replace hardcoded grayscale utilities **only inside className strings** with the semantic equivalents above. Leave dynamic data arrays (engine colors) and intentional legacy accent hexes untouched for now.
- Files: all `src/components/**` and `src/pages/**` .tsx (the transform scoped to bracket utilities only).
- Fixed a real layout bug across 27 files: invalid `ds-page-shell:` (trailing colon) class tokens in BlogsPage, BlogPost/Editor, Reports, Pricing, Legal/Terms/Privacy/Cookies/Security, Compare, ApiDocs, Playground/Pager, DiagnosticEngines, ReportPermalink, and the api/playground pages. Replaced with the valid `ds-page-shell`.
- Added canonical `.ds-btn`, `.ds-btn-primary/secondary/ghost`, `.ds-input` primitives to `index.css` and migrated the Contact form inputs/glass panel to them.
- Scoped always-dark standalone surfaces (Contact, Login, SignUp, ForgotPassword, AdminDashboard, DocsLayout, DashboardShell) with `data-theme="dark"` so they stay coherent when the SPA is in light mode.
- Normalized `border-white/10|12|15` → `border-border` and hover `border-white/20|25` → `border-border-strong` on the named dark-scoped surfaces.
- Verify: `tsc`, `lint`, `test`, `build`, spot-check Contact/About/docs in both themes.

### Step 2 — Promote shared primitives
- Add `.ds-btn`, `.ds-btn-primary`, `.ds-btn-secondary`, `.ds-btn-ghost`, `.ds-input`, `.ds-select`, `.ds-label` to `index.css` using the existing `--app-*` tokens.
- Refactor 6 most-repeated button families to `ds-btn*` (Contact, Login/SignUp, Pricing, docs, admin).

### Step 3 — Unify radius + type
- Add `--radius-*` tokens and pin the scale; replace bespoke `rounded-[xxpx]`.
- Replace `text-[#EDEDED]/#A1A1AA` in docs with `text-foreground`/`text-foreground-muted` (already covered in Step 1).

### Step 4 — Consolidate cards/panels
- Move hand-rolled glass panels to `Card`/`ds-card` (Contact form, dashboard widgets, telemetry swatch).
- Keep `bg-transparent`/blur glass only for nav/toolbar.

### Step 5 — Animation review
- Add `.ds-hover-card` token-aware hover (replaces repeated hover transforms).
- Ensure all `motion` variants read `useReducedMotion` (audit already mostly clean).

### Step 6 — Light-theme parity & sign-off
- Decide "always dark" surfaces and wrap them in `data-theme="dark"` so light-page flips are intentional.
- Run `npm run ci` and Playwright smoke in both themes.

---

## 5. Actions completed in this pass
- Ran a machine audit of hardcoded color utilities, radius scale, token usage, and card/button reuse.
- Implemented the safe, scoped **grayscale hex → semantic token** normalization across the named pages and shared component surfaces (class-string utilities only); ~430 utilities replaced (contact, about, docs, blogs, article/editor, engines/hub, user dashboard, admin dashboard, login/signup/forgot, layout/footer/navbar, home, docs shell).
- Normalized generic dark surfaces (`#060606`, `#161616`, `#1C1C1C`, `#0D0D0D`, gradients) to token-backed `bg-surface`/`bg-surface-elevated`/`bg-background`.
- Fixed the invalid `ds-page-shell:` typo in 27 files (real layout bug where the container width silently did not apply).
- Added canonical `.ds-btn*` and `.ds-input` primitives and migrated the Contact form to them.
- Scoped always-dark standalone pages with `data-theme="dark"` for coherent light-mode toggling.
- Documented the accent-colour decision (keep legacy Framer-blue/engine hues as intentional accents, migrate when product aligns on Linear indigo).

---

## Appendix A — Complete page inventory

### React routed pages (`src/pages/**`, 53 files)
Core:
`AboutPage, AdminDashboardPage, ApiDocsPage, BlogEditorPage, BlogPostPage, BlogsPage, CommandCenterPage, ComparePage, ContactPage, CookiePolicyPage, DiagnosticEnginesPage, DiagnosticHubPage, DocsPage, DomainReportArticlePage, ForgotPasswordPage, LegalPage, LoginPage, MasterAuditExecutionPage, MasterAuditPage, MethodologyPage, NotFoundPage, PlaygroundPage, PricingPage, PrivacyPage, ProductsPage, ReportPermalinkPage, ReportsDirectoryPage, SecurityPage, SignUpPage, TermsPage, ToolPage, UserDashboardPage`

API docs:
`api/ApiCategoryPage, api/ApiOverviewPage`

Docs modules:
`docs/AllosterSearchDoc, docs/ApiReferenceDoc, docs/ArchitectureDoc, docs/CicdDevOpsDoc, docs/EcoHoloDoc, docs/EdgeVmaxDoc, docs/GitLygaseDoc, docs/LlmKinaseDoc, docs/OrchestratorDoc, docs/RateLimitingDoc, docs/RiskProteaseDoc, docs/ScoringMatrixDoc, docs/SecurityDoc, docs/SynthShiftDoc, docs/SystemOverviewDoc, docs/VitalZymeDoc`

Playground:
`playground/EnginePlaygroundPage, playground/PlaygroundCatalogPage, playground/ReactDevDesignPage`

### Standalone static pages (`public/*.html`, 21 files)
`admin.html, ai-readiness.html, blogs.html, compare.html, compliance.html, contact.html, cookies.html, dashboard.html, eco-audit.html, health.html, index.html, latency.html, llmo.html, methodology.html, migration.html, privacy.html, repo-scanner.html, report.html, reports.html, security.html, terms.html`

### Route definitions (`src/App.tsx`)
`/`, `/about`, `/api-docs`, `/api-reference`, `/app`, `/audit`, `/blog/:slug`, `/blogs`, `/blogs/:slug`, `/compare`, `/contact`, `/cookies`, `/dashboard/hud`, `/design-system`, `/developer/api`, `/docs`, `/docs/*` (16 doc routes), `/engines`, `/forgot-password`, `/hub`, `/hud`, `/insights`, `/integrations`, `/legal`, `/llmo`, `/login`, `/methodology`, `/playground`, `/plugins`, `/pricing`, `/privacy`, `/products`, `/register`, `/report`, `/report/:id`, `/reports`, `/reset-password`, `/security`, `/services`, `/signin`, `/signup`, `/terms`, `/404`, `*` — plus `.html` aliases for most.

---

## Appendix B — Steps 2–4 execution record (this pass)

### Step 2 — Promote shared primitives (started)
- Added `.ds-select` and `.ds-label` to `src/index.css` (`.ds-input` and `.ds-btn*` were added in the earlier pass).
- Refactored the form-heavy pages/modals to the canonical primitives:
  - `GetInTouchEmailModal` — email/name/company inputs + textarea → `.ds-input`, labels → `.ds-label`, submit → `.ds-btn ds-btn-primary`.
  - `NewsletterModal` — input → `.ds-input`, label → `.ds-label`, CTA → `.ds-btn` (gradient preserved).
  - `LoginPage` — social buttons → `.ds-btn ds-btn-secondary`, email/password → `.ds-input`, submit → `.ds-btn` (white CTA preserved).
  - `SignUpPage` — name/email/domain/password → `.ds-input`, labels → `.ds-label`, submit → `.ds-btn`.
  - `ContactPage` — submit → `.ds-btn` (white CTA preserved).
  - `PricingPage` — plan/community/enterprise CTAs → `.ds-btn`/`.ds-btn-secondary`/`.ds-btn-primary` (gradient & shadow variants preserved).
- Usage now: `.ds-input` ×15, `.ds-btn` ×10, `.ds-label` ×9, `.ds-btn-secondary` ×3, `.ds-btn-primary` ×1.

### Step 3 — Unify radius + type (done for bespoke radii)
- Removed every bespoke `rounded-[24px]/[28px]/[14px]/[10px]`.
- Mapped: `28px → rounded-3xl`, `24px → rounded-3xl`, `14px → rounded-xl`, `10px → rounded-lg` across `DiagnosticEngineCard`, `CardMedia`, `CardChip`, `LiveTelemetryPanel`, `CatalystCarouselCard`, `EngineVectorCard`.
- Verified no `rounded-[xxpx]` utilities remain in `src/`.
- Considered a `--radius-*` token server; the Tailwind scale is now used exclusively, so no CSS-var server is needed for the surface set.

### Step 4 — Consolidate cards/panels (started)
- Added `ds-card` to hand-rolled panels so they inherit the canonical border/radius/background:
  - `LoginPage`, `SignUpPage`, `ForgotPasswordPage` auth cards.
  - `ContactPage` glass form panel.
  - `DiagnosticHubPage` engine feature card + widget panel.
- Normalized `border-white/10|5|25` → `border-border`/`border-border-strong` in `DiagnosticHubPage`, `ComparePage`, `PricingPage` (auth/docs/dashboard done earlier).

### Remaining for Step 2–4 (documented, not yet done)
- Migrate the remaining hand-rolled buttons (Navbar, home marketing, docs top nav, admin/user cockpit action buttons, blog editor toolbar) to `.ds-btn*`.
- Migrate remaining inputs/selects (BlogEditor, ApiPlayground, MasterAuditExecution, UserRateLimitAllocationCard, admin filters) to `.ds-input`/`.ds-select`.
- Consolidate the remaining hand-rolled panels (`LiveTelemetryPanel`, `FramerDossierCockpit` widgets, `SimulationWidgets`, `CinematicMedia`, `ScanRevealFigure`) onto `Card`/`.ds-card`.
- Align the ever-dark marketing sections (Hero, EnzymeGrid, WorkflowSection, Footer) to the `data-theme="dark"` wrapper pattern or migrate them to tokens.

---

## 6. Completion verification pass (all pages) — this pass

Ran a full inventory-gate across **every React-routed page** (core, API docs, docs modules, playground), all shared layout/component layers, and the standalone `public/*.html` legacy stash.

### Changes in this pass

- **Docs content tokenized in `src/index.css`**
  - `.docs-content` / `.docs-devsite-article` headings, paragraphs, lists, code, pre, and callouts now use `var(--app-foreground)`, `var(--app-muted-foreground)`, `var(--app-border)`, `var(--app-background)`, `var(--accent-cyan-edge)`, `var(--accent-amber-sec)`.
  - Removes the last hardcoded `#EDEDED / #A1A1AA / #050505 / rgba(255,255,255,…)` strokes from the docs surface set (all 16 `/docs/*` modules + `/api-docs` docs shell).
- **Docs shell de-hardcoded** (`src/components/docs/DocsLayout.tsx`)
  - `bg-[#000000]` → `bg-background`, `bg-[#000000]/95` → `bg-background/95`, code/pre and headings `text-white` → `text-foreground`.
- **Always-dark page roots now token-backed** (each already carries `data-theme="dark"`)
  - `LoginPage`, `SignUpPage`, `ForgotPasswordPage`, `AdminDashboardPage`, `DashboardShell`: `bg-[#000000]` → `bg-background`, root `text-white` → `text-foreground`.
  - `UserDashboardPage` unauth gate now explicitly `data-theme="dark"` + token background (it was an unmarked always-dark surface in light mode).
  - `WorkflowSection` now wrapped in `data-theme="dark"` so its dark marketing panel is an explicit, token-backed decision.
- **Search / command-palette input** in `DashboardShell`: `text-white placeholder-[#666666]` → `text-foreground placeholder:text-muted-foreground`.
- **Border normalization** on the always-dark surfaces (Login, SignUp, Contact, AdminDashboard, UserDashboard, DashboardShell, DocsLayout): remaining `border-white/5|10|20` → `border-border` / `border-border-strong`.

### Verification (machine + gates)

- `src/**` hardcoded grayscale text/surface hexes (`#EDEDEF/#A1A1AA/#999999/#666666/#888888/#EDEDED`, `placeholder-[#666666]`): **0 remaining**.
- `src/**` literal `bg-[#000000]` on reactive surfaces: **0 remaining**.
- `rounded-[NNpx]` bespoke radii in `src/**`: **0 remaining**.
- Shared primitives usage: `ds-page-shell` ×52, `ds-card` ×243, `ds-muted` ×183, `ds-eyebrow` ×15, `ds-btn*` ×14, `ds-input` ×15, `ds-label` ×9.
- `npx tsc --noEmit` — pass · `npm run lint` — pass · `npm test` — 177 tests pass · `npm run build` — pass.

### Remaining intentional decisions (documented, not regressions)

- **Brand accent hexes** (`#0066FF`, `#00D2FF`, `#00F298`, `#8A2BE2`, `#FF9900`) are kept as the deliberate CatalystLab brand/engine-hue palette, mapped to `--accent-*` where beneficial.
- **Always-dark product surfaces** (auth, docs devsite, admin/user cockpits, dashboard, hero/workflow/globe marketing panels) are scoped with `data-theme="dark"` so they remain visually dark in both themes — a conscious brand decision, now token-backed.
- **White border/glow hovers** on the canonical `Card` primitive and dataset panels (`hover:border-white/25`, `border-white/20–25` on dark glass cards) are intentional hover affordances, not drift.
- **Standalone `public/*.html`** pages (21) are the legacy no-JS/SEO fallback set and are internally consistent through `public/style.css` (shared `container`, `glass-panel`, `btn btn-primary/outline`, `doc-*`, `top-nav`, `footer-*` classes). They are intentionally a separate static system; the React routes for the same URLs are token-backed.
