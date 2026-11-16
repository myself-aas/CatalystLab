# Frontend file-by-file audit: CatalystLab

**Date:** 2026-11-17 · **Scope:** all 308 non-test `.ts`/`.tsx` files under `src/` (about 62k lines). Every file was read in full.
**Method:** 9 parallel slice audits against one checklist ([_BRIEF.md](_BRIEF.md)) covering contrast & a11y (WCAG 2.2 AA), design tokens & theming, React correctness & performance, and types & bundle. On top of that, repo-wide tools and a browser contrast sweep (Edge, 1280px, light and dark).
**Branch state:** audited on `fix/nav-theme-contrast`. That branch includes the nav hover, dark navbar and Engines dropdown fixes.

## Totals

| Slice | Files | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| [01 UI primitives](01-ui-primitives.md) | 40 | 1 | 11 | 28 | 18 |
| [02 Cards & common](02-cards-common.md) | 63 | 1 | 9 | 34 | 12 |
| [03 Layout & shell](03-layout-shell.md) | 35 | 2 | 20 | 23 | 14 |
| [04 Data-viz](04-data-viz.md) | 24 | 4 | 11 | 16 | 8 |
| [05 Docs, media, legal](05-docs-media-legal.md) | 21 | 4 | 12 | 15 | 14 |
| [06 Large pages](06-pages-large.md) | 11 | 2 | 17 | 25 | 14 |
| [07 Other pages](07-pages-rest.md) | 40 | 4 | 15 | 21 | 14 |
| [08 lib](08-lib.md) | 22 | 2 | 8 | 13 | 10 |
| [09 State, context, utils](09-state-context-utils.md) | 29 | 0 | 7 | 9 | 16 |
| **Total** | **285 + root files** | **20 (19 unique)** | **110** | **184** | **120** |

About 44 of the card and UI files have no importers. Their findings are latent, and their severity is capped at Medium.

## Verification status

| Kind | Status |
|---|---|
| **Browser-measured**: contrast sweep of 9 routes (table below), Engines dropdown, navbar, nav hover | Confirmed |
| **Re-read in code by the lead auditor**: `sanitizeHref` regex, Node-only `blogLoader`, `EnginePlaygroundPage` hooks order, `RoleSecurityContext` localStorage role | Confirmed |
| **Derived from the CSS cascade by slice agents**: all other dark-mode contrast findings | Probable. The sweep confirms the pattern on every route it covered. |
| Logic and security findings (payments, sync rollback, domain verification, SSRF) | Taken from code reading. Each needs a reproduction before fixing. |

### Browser contrast sweep (text below AA, on `main` content)

| Route | Dark: fails / checked | Light: fails / checked | Notes |
|---|---|---|---|
| `/login` | **19 / 22** | 2 / 22 | Dark: heading and labels near-invisible (screenshot confirmed) |
| `/signup` | **19 / 25** | 1 / 25 | Same auth-card cascade |
| `/contact` | 9 / 63 | 0 / 63 | Labels about 1.6:1 |
| `/terms` (and other legal pages) | **78 / 214** | 0 / 214 | Dark: clause text near-white on a white `.ds-card` (screenshot confirmed) |
| `/engines` | **50 / 110** | 2 / 110 | Dark: engine card panels about 1.06:1 |
| `/products` | **367 / 490** | 368 / 490* | Inverted `bg-primary` islands |
| `/pricing` | 1 / 102 | 0 / 102 | |
| `/` | 1 / 125 | 16 / 125* | |
| `/blogs` | 0 / 5 | 0 / 5 | Only 5 text nodes, because the blog list renders empty (see C-2) |

\* Light-mode `/products` and `/` hits at about 1.0:1 include text over canvases, globes and animated sections, which the sweep can't composite. Confirm them visually before counting them.

## Root causes (fix these first; each one clears many findings)

1. **The `.ds-card` dark-mode rule in `patch.css`** (around patch.css:1492-1529, "F2"). In dark mode the card stays white and its text is forced dark. Three things break around it:
   - children the rule doesn't cover inherit near-white ink (legal clauses, `ds-muted`/`ds-eyebrow` labels in about 60 places);
   - nested `bg-background`/`bg-surface` wells turn dark under forced-dark text (auth forms, contact, DiagnosticHub, admin cards, FramerDossierCockpit);
   - `bg-primary` islands without `text-primary-foreground` miss the rescue rule (ProductsPage configurator, WebhookFanoutMesh).

   **This one rule accounts for most of the Critical contrast findings.** Decide one dark-mode card model (dark card with light ink, or light card with dark ink for *all* descendants) and implement it in one place.
2. **Substring `[class*="…"]` + `!important` selectors in `patch.css`.** They catch `hover:` utilities and paint the element at rest or on hover:
   - `[class*="bg-foreground"]` turns elements into a pill CTA with a solid #F7FDFF fill on hover in dark. It hits Navbar.tsx:426/441/465/486, CopyButton.tsx:63-72 and 9 more sites.
   - `[class*="bg-muted"]` affects RoleContentGate.tsx:94/102, whose CTA labels are about 1.2:1 at rest.
   - `[class*="bg-card"]` affects BlogManagementView.tsx:269, where every row is dark permanently.
   - `[class*="bg-surface"]` and `[class*="bg-background"]` cause dark wells inside light cards.

   Narrow them to exact class selectors (`.bg-muted`, not `[class*="bg-muted"]`). Decision Q37 keeps `patch.css`; this narrows it.
3. **Forced-white surfaces in dark mode.** The navbar was fixed in this branch, but the same problem remains in the footer (patch.css:1091, Footer.tsx:49/160-174, about 1.1:1).
4. **Theme-invariant tokens under ink that flips** (`fog`, `mist`, `ink-*`, raw `rgba(...)`, d3 `'white'`):
   - `react-dev/TopNav.tsx:12`: blank in light mode.
   - `AdminDashboardPage.tsx:160`.
   - `RiskSslGaugeChart.tsx`: "High Risk" and "EXPIRED" render white on near-white.
   - `edge-mesh-globe.tsx:158`.
   - Hue text at the `-400` shade on white (about 25 sites, slice 06).

   Use the existing precedent: `bg-fog/95 dark:bg-ink-soft/95`.

## Critical findings (20: 19 unique from the slices + C-1 promoted)

### Broken features and correctness
| # | Location | Issue |
|---|---|---|
| C-1 | src/lib/sanitizeHref.ts:28 | Regex `/[<>\"'`\\s]/` matches a literal **`s`**, not whitespace, so every link whose hostname contains "s" is dropped by MarkdownRenderer. *(Slice 08 rated this High; promoted after confirming it in code, because it affects most links.)* |
| C-2 | src/lib/blogLoader.ts:1-16 → BlogsPage.tsx:3, BlogPostPage.tsx:3 | A Node-only loader (`fs`, `path`, `process.cwd()`) runs in the browser, so `/blogs`, `/insights` and `/blogs/:slug` render empty. The tests mock the module, so CI passes. |
| C-3 | src/pages/playground/EnginePlaygroundPage.tsx:52-57 | `<Navigate>` returns before the hooks. `/playground/<unknown-id>` crashes with "Rendered more hooks…". |
| C-4 | src/components/legal/SecurityDisclosureSection.tsx:40-43 | The vulnerability report form sends nothing but tells the researcher the report was received. |
| C-5 | src/lib/emailService.ts:80-97, 232-243 | Email templates put white text on `#F3F4F6` (about 1.1:1), so every digest and alert is unreadable. *(Template injection of telemetry strings is a separate High in slice 08.)* |

### Unreadable UI (contrast)
| # | Location | Theme | Issue |
|---|---|---|---|
| C-6 | LoginPage.tsx:165+, SignUpPage.tsx:196+, ForgotPasswordPage.tsx:116+ | Dark | Auth card heading, labels and typed text near-invisible (**browser-confirmed**, 19/22 fail) |
| C-7 | ContactPage.tsx:131, 174-243 | Dark | Typed text #1C1E21 on #2C2F32, labels about 1.6:1 (**browser-confirmed**) |
| C-8 | LegalDocumentView.tsx:180 | Dark | /terms, /privacy, /refund clause text unreadable (**browser-confirmed**) |
| C-9 | DiagnosticHubPage.tsx:175-202 | Dark | Engine card right panels about 1.06:1 (**browser-confirmed** on /engines) |
| C-10 | ProductsPage.tsx:571-609 | Both | Configurator code panel `bg-primary` without `text-primary-foreground` (about 2.2:1 light, 1.1:1 dark) |
| C-11 | WebhookFanoutMesh.tsx:89, 127, 174-181 | Both | Inner `bg-card` panels inside a `bg-primary` island, ink matches the background |
| C-12 | Footer.tsx:49, 160-174 | Dark | Footer forced white, copyright and legal links about 1.1:1 |
| C-13 | FramerDossierCockpit.tsx:462 | Dark | Dashboard engine list about 1.3:1 |
| C-14 | RoleContentGate.tsx:94, 102 | Dark | Sign In / Start Trial labels about 1.2:1 at rest (`hover:bg-muted` substring collision) |
| C-15 | edge-mesh-globe.tsx:158 (+194-241) | Dark | PoP inspector values white on white |
| C-16 | UserRateLimitAllocationCard, UserDomainMonitoringRadar, SystemHealthWidget, ContactInquiriesAdminView | Dark | `bg-background` wells inside `.ds-card`, about 1.06:1 |
| C-17 | `.ds-muted` / `.ds-eyebrow` on `.ds-card`: about 60 sites (UserRateLimitAllocationCard, BlogManagementView, ContactInquiriesAdminView…) | Dark | Muted labels about 1.0:1 |
| C-18 | BlogManagementView.tsx:269 | Dark | `hover:bg-card` makes every article row dark permanently, titles 1.25:1 |
| C-19 | RiskSslGaugeChart.tsx:127-437 | Light | "High Risk" / "EXPIRED" and the active arc are d3 `'white'` on #F1F4F7 (1.10:1) |
| C-20 | react-dev/TopNav.tsx:12 (+Layout.tsx) | Light | `/design-system` header blank in the default theme |

## High findings worth fixing soon (selection; full lists in the slice reports)

**Security and data integrity**
- RoleSecurityContext.tsx:44-58: any user can set a simulated role (including `superadmin`) in `localStorage`, which unlocks Pro-gated UI. AdminRoute still checks the real claim. *(Confirmed in code.)*
- domainsSlice.ts:144-163: a domain is marked verified when the site responds. The token is never checked, and the client sends `verified: true`.
- mongoSyncMiddleware.ts:175 + useAppStore.ts:79-109: the optimistic-update rollback never runs, so the UI keeps changes the server rejected.
- firebase.ts: reports leak between accounts on a shared browser, and the contact form locks out after 5 submissions for good.
- The SSRF guard misses some IPv6 ranges. `serverAuth` can cache a null Firestore for the life of the process (slice 08).
- PaymentCheckoutModal.tsx:24-25: the plan and billing cycle carry over from the last open, so a user can be charged for the wrong tier.
- ToolPage persists a hard-coded `score: 92` (slice 06).
- RateLimitModal / RateLimitBadge / RateLimitThresholdAlert: the plan is never passed, so paid users see the free 50-unit quota.

**Accessibility**
- RoleContentGate.tsx:68: `aria-hidden` is written as a class name, so locked content stays readable by screen readers and reachable by keyboard.
- Click-only `div`/`td` handlers: dashboard-sidebar.tsx:128, 445; UserDashboardPage.tsx:816 (also flagged by the a11y scanner).
- `<img>` without `alt` (PlateImage.tsx:22) and `<video>` without captions (ParallaxSection.tsx:37).

**Theming**
- react-dev/Layout.tsx keeps its own theme state. It never writes `catalystlab_theme_preference` and leaves `html` with both `light` and `dark` classes, so the main ThemeToggle needs two clicks afterwards.

**Performance**
- The Playground Visual tab renders one row per character (slice 06).
- The analytics engine queue is unbounded and the analytics numbers are fabricated (slice 08).

## Repo-wide tool results
| Tool | Result |
|---|---|
| ESLint (`src`) | Pass, 0 problems |
| `check:design` | Pass |
| `check:colors` | Can't run on Windows: the script builds the path with the drive twice (`G:\G:\…`) |
| `tsc --noEmit` | 12 pre-existing errors (BlogsPage `id`, blogLoader test fixtures, Vitest globals missing from tsconfig) |
| a11y scanner (skill `a11y-audit`) | 849 hits, mostly per-component false positives (`<main>`, skip link and nav exist once in App.tsx). Real hits are listed under High → Accessibility. |

## Fix log

### 2026-11-17: patch.css root causes 1–3 (owner chose the "dark cards" model)
- **Dark-mode cards:** `--p-card` in dark is now `#1F2223`. The F2 "light ink inside white cards" rules for `.ds-card`, `.bento-card` and accordion content were removed, and the global dark ink applies inside cards. The inverted `bg-primary` island rules were kept.
- **Substring selectors narrowed:**
  - `html.dark` `bg-muted`/`bg-card`/`bg-popover`/`bg-background`/`bg-surface` now match the exact class and its `/opacity` forms. `hover:` forms apply only on `:hover`.
  - The pill-CTA rules match only solid `bg-foreground`.
- **Footer:** the white background is light-mode only. Footer.tsx uses theme tokens instead of `bg-white`/`text-neutral-*`.
- **Also fixed (root cause 4, one site):** LinearAmbientBackground (dark-only) used `--color-fog` as its base, so heroes sat on a near-white glow in dark mode. It now uses `--color-ink-soft`.

Browser sweep, dark mode, text below AA (before → after):

| Route | Before | After |
|---|---|---|
| /login | 19 | **0** |
| /signup | 19 | **0** |
| /forgot-password | n/a | 0 |
| /contact | 9 | **0** |
| /terms | 78 | **0** |
| /privacy | n/a | 0 |
| /engines | 50 | **2** |
| /docs | n/a | 0 |
| /pricing | 1 | 1 |
| footer (every route) | about 1.1:1 | **0 / 8** |

Light-mode results are identical to before.

**Still open:**
- `/products` (366 dark / 368 light): the component-level `bg-primary` panels (C-10, C-11), plus canvas text the sweep can't composite.
- `/engines` "All engines 8" chip (1.4:1 dark, 1.1:1 light).
- `/pricing` "save up to" (1.06:1 dark).
- Light-mode "TLS 1.3…" badge (4.48:1).
- Footer "Atlas: Synced" pill (just under 4.5:1 in light).
- Root cause 4 sites listed above.

### 2026-11-17: /products and Critical bugs
| ID | Fix | Verified |
|---|---|---|
| /products (C-10, C-11, C-15) | WebhookFanoutMesh, ProductsPage configurator and the globe PoP inspector moved from `bg-primary` islands to themed surfaces. The selected card no longer uses `bg-blue-600/20`, which patch.css remaps to near-white in dark. | Browser: 0/498 below AA in both themes (was 366 dark / 368 light) |
| Tinted status pills | Light-mode emerald and amber remaps darkened one step (`#065F46`, `#92400E`) in index.css. They were 4.48 and 4.10:1 on `bg-cream/10` pills (login, footer, products). | Browser: pills pass |
| `bg-background/NN` | patch.css no longer forces opacity variants opaque in dark. This fixes the `/pricing` "save up to" pill (1.06:1) and makes the scrolled navbar frosted again. | Browser: /pricing 0/110 in both themes |
| C-1 | `sanitizeHref` regex: `\\s` changed to `\s`, so hosts containing "s" are no longer dropped. | New unit test, which fails on the old code |
| C-2 | Browser-safe blog loader (`import.meta.glob` + `?raw`, Zod-validated frontmatter, `MarkdownRenderer`). `BlogPost.content` is now Markdown. | Browser: /blogs lists all 10 posts and a post renders in both themes. New loader tests run against the real posts. |
| C-3 | EnginePlaygroundPage split into a validating wrapper and a view, so hook order is stable. | Browser: unknown id redirects with no errors, valid ids and client-side switching work |
| C-4 | Security disclosure form sends through `/api/v1/contact` (`source: security-disclosure`, `department: security`). Success is shown only after the server accepts. Errors are announced and input is kept. | Browser with the endpoint mocked: success and 429 paths |
| C-5 (+ High) | Email cards are dark `#1F2223`. All string interpolations are HTML-escaped, and `radarUrl` is restricted to http(s). | Rendered emails: 0 below AA (minimum 5.03). New tests with an XSS payload. |
| C-19 | Gauge "High Risk" / "EXPIRED" colours: `'white'` changed to `var(--color-danger)`. | Computed only (about 5.3:1 light, >6:1 dark). That gauge state was not rendered. |
| C-20 (+ High) | `/design-system` header uses `bg-background/80`. Its toggle uses ThemeContext. | Browser: 8.54:1 light / 6.81:1 dark, and the toggle updates `html.dark` and the stored preference |

The full test suite gives 485/487:
- `BlogPostPage.test.tsx` already failed before these changes.
- `repoHygiene.test.ts` › "carries no OSS licence on a private package" fails because of the CC BY 4.0 `LICENSE` added in e741548. That is an owner decision.

### 2026-11-17: signed-in dashboard check
I checked the dashboard signed in through the dev-only sandbox session (`loginWithLocalSession`, non-admin user) in a throwaway browser. Tabs checked: /dashboard, /audits, /monitoring, /webhooks, /api-keys and /blogs.
- **Dark mode:** already 0 failures after the patch.css fix. This confirms C-13, C-16, C-17 and C-18.
- **Light mode:** three pre-existing problems were found and fixed:
  - Sidebar section labels used `text-muted-foreground/60` and `/70` (3.03 and 3.87:1). They now use the full token.
  - The RoleContentGate overlay (C-14) was tinted dark by patch.css's `absolute inset-0 … bg-background` drawer-scrim rule (1.53 and 2.98:1). It now uses `bg-card/90` over a `bg-muted/40` base.
  - The RoleContentGate locked preview used an `aria-hidden` *class* (High). It now uses `aria-hidden="true"` + `inert`, which a browser check confirmed takes it out of the tab order.
- **Result:** 0 text elements below AA on every tab, in both themes.
- **Still open:** the scrim rule also matches content overlays in ParallaxSection, LatestNewsAndInsights and particles-bg. It was left as-is because it can't tell overlays from real modal backdrops by class alone.

The repo-hygiene test now expects the CC BY 4.0 licence (owner decision), so the full suite has only the pre-existing BlogPostPage failure.

## Recommended fix order
1. **Root cause 1 (`.ds-card` dark model) + root cause 2 (narrow the substring selectors).** One `patch.css` change set clears C-6 to C-18 and most dark-mode Highs. Re-run the browser sweep afterwards to prove it.
2. **C-1 to C-5** (independent bugs, each a small diff): fix the regex, move blog loading to build time or the server, hoist the hooks, wire up the disclosure form or remove its success claim, fix the email template colours and escaping.
3. **Security Highs:** role simulation (admin-only, cleared on logout), domain verification on the server, sync rollback, checkout plan reset.
4. **Remaining invariant-token sites** (root cause 4), then the Medium/Low items per slice.

Turn the browser contrast sweep into a CI check so these regressions are caught automatically.
