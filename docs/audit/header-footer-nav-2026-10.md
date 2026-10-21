# Header / Footer / Navigation audit — web, tablet, mobile

**Audited:** 2026-10-21 · **Branch:** `arena/d85a5b1f-catalystlab` · **Standard:**
`cs-frontend-engineer` (claude-skills/agents/engineering) — its Q6 (design-system
consistency) and Q7 (WCAG, named owner) lenses, plus the Web Vitals canon it cites.
**Scope:** `Navbar.tsx` (503), `MainMenuOverlay.tsx` (551), `Sidebar.tsx` (326),
`EngineSubNav.tsx`, `Footer.tsx` (180), `App.tsx` shell. **Method:** full source
read + scripted class/aria scans; routes /, /pricing, /dashboard, /blogs verified
HTTP 200 on the dev server. No browser is available in this sandbox, so viewport
verdicts rest on breakpoint/class evidence (Tailwind sm 640 / md 768 / lg 1024),
not pixel screenshots — flagged where that matters.

**Viewports used:** Web ≥1024 · Tablet 768–1023 · Mobile <768 (keyboard Tab
audited as a fourth "view", per the request).

## Header (Navbar)

| # | Sev | Finding | Views |
|---|---|---|---|
| H1 | **P1** | **Mega-menu + nav-link text is near-invisible in light theme.** Non-active links `text-[rgba(240,250,255,0.6)]`, menu secondary text at 0.5/0.4 alpha — ice-white values from the dark-canvas era — now render on a transparent header over the white canvas and on the mega-menu's own `bg-[#F3F4F6]/95` (light mist) panel. Contrast ≈ 1.1–1.3:1 vs the 4.5:1 WCAG AA floor. Same defect class already fixed on /blogs; the header was missed. | All |
| H2 | **P1** | **No visible focus indicator.** `focus:outline-none` appears 6× in Navbar with **zero** `focus-visible` rings (Footer's logo link has one — the pattern exists in-repo). Keyboard Tab users get no position cue (WCAG 2.4.7). | Tab |
| H3 | P2 | **Auto-hiding header stays keyboard-focusable while hidden.** On scroll it animates to opacity 0 / y −80 with `pointerEvents: none` — pointer events off does not remove elements from Tab order, so focus can land on invisible links (compounds H2). | Tab, Mobile |
| H4 | P2 | **Mega-menu is hover-first.** Opens on mouse-enter; the trigger button toggles on click but menu does not open on focus, and Escape does not close it (Escape handling exists only in MainMenuOverlay). Keyboard users can tab into links of a menu they never saw open. | Web, Tab |
| H5 | P2 | **Tablet crowding risk (768–900px).** At `md:` the full desktop set appears — primary links + Engines + search + profile + Audit CTA inside `max-w-7xl px-4`, plus the 580px mega-menu offset `-left-24`. Class evidence says overflow/clipping is likely at 768px; needs a pixel check on a real tablet viewport (cannot screenshot here). Canon fix: keep the hamburger until `lg:`. | Tablet |
| H6 | P3 | Mobile header carries no primary CTA: Audit/Login/Sign up live in the `hidden md:flex` action area; mobile users must open the menu first. The hamburger itself is exemplary (44×44, aria-label). | Mobile |

**Done right:** hide-on-scroll respects `useReducedMotion`; route change closes
all menus; body scroll-lock for the mobile menu; `aria-expanded` on both dropdown
triggers; active-route dot + colour.

## Mobile menu (MainMenuOverlay) — the exemplar

`role="dialog" aria-modal`, focus moved in on open, focus trap, Escape closes,
scroll lock, labelled nav groups, 44px close target. **This is the pattern H4
should copy for the desktop mega-menu.** One nit: it is a 320–400px drawer
described as an overlay; naming only.

## Navigation (Sidebar / EngineSubNav / landmarks)

| # | Sev | Finding | Views |
|---|---|---|---|
| N1 | P2 | **No `aria-current="page"` in Navbar or Sidebar** (only DevSiteLayout + EngineSubNav set it). Active state is a visual dot/colour only — screen readers cannot identify the current page in the two main navs (WCAG 1.3.1 / 4.1.3 pattern). | All |
| N2 | P3 | Tablet app-shell gap: Sidebar is `hidden lg:block` with a `lg:hidden` drawer — correct — but between 768–1023 the *marketing* Navbar (H5) and the app drawer trigger coexist on app routes; verify no double-menu affordance on /dashboard at 800px. | Tablet |
| N3 | ✅ | Landmarks are labelled and distinct: "Main Navigation", "Footer directory navigation", "Legal", overlay groups ("Platform Overview", "Diagnostic Hub"…). Skip link to `#main-content` exists in App.tsx. EngineSubNav scrolls the `aria-current` item into view. | All |

## Footer

| # | Sev | Finding | Views |
|---|---|---|---|
| F1 | P2 | **Heading order:** the brand segment's `<h4>Connect</h4>` precedes the `<h3>` column headings in DOM order — heading-order risk of the same class Lighthouse flagged on /blogs. Make Connect an h3 (styled) or a non-heading label. | All |
| F2 | P2 | **Touch targets:** social icon buttons are `size-9` (36px) < 44px Apple HIG / WCAG 2.5.8 comfort; footer text links are 13px with no vertical padding (~18px tall) — spacing (`space-y-4`) partially compensates under 2.5.8's spacing rule, but the socials do not pass. | Mobile, Tablet |
| F3 | P3 | Root carries `text-neutral-300` on `bg-background` — a dark-era default that only renders correctly because children override it; the 11px `text-neutral-500` mono labels sit at ~4.6:1 (pass, no margin). Remove the root colour to prevent a future un-overridden child inheriting 1.6:1 text. | All |
| F4 | ✅ | Grid behaviour is sound: 2 cols mobile → 4 cols `lg:`; bottom bar stacks `sm:`; back-to-top is a real button with aria-label; social links have aria-labels and `rel="noreferrer"`. | All |

## cs-frontend-engineer verdict

Against the agent's Q7 kill criterion, the shell would **not yet ship**: AA is
the stated, CI-enforced target, but H1 (contrast) and H2 (focus visibility) are
exactly the failures a named a11y owner exists to catch — and the owner is still
unnamed (see the companion forcing-question audit). Q6 (design system): header
and mega-menu bypass the Meta token layer with raw rgba ice values — the token
system has a source of truth, the shell just doesn't consume it here.

## Follow-ups (leverage order, with Verify)

1. **Tokenize header text** — replace `rgba(240,250,255,…)` in Navbar/mega-menu
   with `text-muted-foreground` / foreground tokens (as on /blogs).
   Verify: Lighthouse a11y stays ≥ 0.95 with the menu open; computed contrast ≥ 4.5:1 in light theme.
2. **Focus-visible rings + mega-menu keyboard support** — ring on all interactive
   header elements; open on focus, Escape closes, hidden state removes from Tab
   order (`inert`/`visibility`). Verify: full header traversable by Tab with a
   visible indicator at every stop, menu open and closed.
3. **`aria-current="page"`** in Navbar + Sidebar. Verify: screen-reader/axe run
   announces current page in both navs.
4. **Tablet pass** — hamburger until `lg:` or a compact tablet bar; pixel-check
   768/834/1024. Verify: no horizontal overflow at 768px (`document.scrollingElement.scrollWidth <= innerWidth`).
5. **Footer fixes** — h4→h3 label, social targets to 44px, drop root
   `text-neutral-300`. Verify: heading-order + target-size clean in axe.
