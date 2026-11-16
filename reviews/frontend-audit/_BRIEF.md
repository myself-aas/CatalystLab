# Frontend file-by-file audit: shared brief (2026-11-17)

Every slice agent follows this brief. Audit only. **Never edit source files.** Write findings only to your slice report.

## Stack
- Vite 8 + React 19 SPA (prerendered). TypeScript strict. Zustand 5 (`src/store/`). React Router 7. Tailwind v4 (`src/index.css`, `@theme`). `motion` (Framer Motion). Recharts. Zod 4. Firebase on the client.
- AGENTS.md: the product is **light-mode-first** (white canvas), and a dark theme is available through the ThemeToggle. Dark-only styling **must** be scoped under `html.dark` / `[data-theme="dark"]` / the Tailwind `dark:` variant (`@custom-variant dark (&:where(.dark, .dark *))`). Use the established `ds-*` / `framer-*` classes.
- Theme switching: `ThemeContext` toggles `html.dark` + `data-theme`.

## Token facts (verified in the browser; use them for contrast reasoning)
| Token | Light | Dark |
|---|---|---|
| background (`--app-background`) | #FFFFFF | #0A1317 (but see patch.css: `[class*="bg-background"]` → #111827 !important in dark) |
| foreground | #1C1E21 | #FFFFFF |
| muted-foreground | #4B4C4F | rgba(255,255,255,0.72) |
| primary / primary-foreground | #000 / #FFF | #F7FDFF / #1F2223 |
| border | #CED0D4 | rgba(255,255,255,0.14) |
| cream (`--color-cream`) | #1F2223 (flips) | #F0FAFF |
| `bg-surface` (`--color-surface`) | **#FFFFFF** (index.css:262 overrides `--bg-surface` #F3F4F6) | `--bg-surface` #2C3032, but patch.css forces `[class*="bg-surface"]` to #2C2F32 !important |
| **Theme-invariant** (do NOT flip): fog #F3F4F6, mist #F1F4F7, ink-navy #111827, ink-soft #1C1E21, ink-panel, ink-well, ink-console, graphite #1F2937, smoke #888888 | same | same |

**Main contrast trap:** theme-invariant light surfaces (`bg-fog`, `bg-mist`, `bg-white`, `bg-[#F…]`) under text that flips (`text-foreground`, `text-cream*`, `text-muted-foreground`) become white-on-light in dark mode. The reverse also happens: invariant dark surfaces (`bg-ink-*`) under text that flips to dark in light mode. The same goes for invariant text (`text-ink-navy`, `text-graphite`, `text-white`, `text-neutral-*`) on surfaces that flip. A fixed example: Navbar Engines dropdown `bg-fog/95` → added `dark:bg-ink-soft/95`.

## patch.css traps (repo root, imported by src/index.css:4, unlayered, many `!important`)
`patch.css` must be kept (decision Q37). Flag any component class that a substring selector catches by accident:
- `a[class*="bg-foreground"]`, `button[class*="bg-foreground"]` → pill CTA: rounded-full, weight 600, lift on hover, and in dark a solid #F7FDFF fill on hover. This catches `hover:bg-foreground/5` too.
- `html.dark [class*="bg-surface"]` → #2C2F32 !important (not just on hover).
- `html.dark [class*="bg-muted"|"bg-card"|"bg-popover"]` → #2C3032 !important; `html.dark [class*="bg-background"]` → #111827 !important.
- `html.dark [class*="bg-<hue>-"]` color remaps and `[class*="hover:bg-<hue>"]` remaps.
- `[class*="bg-primary"][class*="text-primary-foreground"]` descendant text recolouring in both themes.
- `a[class*="border"][class*="border-subtle"]` → rounded-full.

Safe hover recipe used in nav: `hover:bg-cream/5`.

## Checklist (apply to every file in your slice)
1. **Contrast & a11y (WCAG 2.2 AA)**: text 4.5:1 (large text 3:1), icons/UI 3:1, checked in **both** themes. Missing labels on icon-only buttons and links, inputs without labels, `div`/`span` click handlers without role and keyboard support, missing `alt`, focus styles removed without a replacement, `outline-none` with no `focus-visible` ring, motion without a reduced-motion fallback in heavy animations.
2. **Design tokens & theming**: raw hex or rgb in className or style (outside chart libs that need strings, which is still worth noting), unscoped dark styles, `dark:` missing where an invariant surface is used, patch.css substring collisions, `text-neutral-*`/`bg-white` etc. on themed surfaces, dynamic Tailwind class construction (`bg-${x}-500`).
3. **React correctness & perf**: hook dependency arrays, stale closures in timers or listeners, effects used as event handlers, missing cleanup (listeners, intervals, observers, subscriptions, AbortController), unstable keys (index keys on dynamic lists), state that should be derived, whole-store Zustand subscriptions (`useStore()` without a selector) or selectors returning new objects without `useShallow`, nested mutation in `set()`, setState in render, async race conditions (unmounted setState, out-of-order responses).
4. **Types & bundle**: `any`, `as` casts hiding bugs, non-null `!` on fallible values, external data (fetch, Firestore, localStorage, URL params) without validation (Zod), barrel imports of heavy modules, heavy libraries (d3, recharts, cobe, motion) imported eagerly on routes that could lazy-load, big inline data.

## Rules
- Read **every** file in your slice fully. Don't sample.
- Report only real, specific defects with `path:line`. Explain the concrete failure (who sees what, in which theme or state). No generic advice or style nitpicks. If a file is clean, list it as clean.
- Severity: **Critical** (broken or unreadable UI, a11y blocker, crash, data or security risk), **High** (likely bug or clear WCAG failure in a state or theme), **Medium** (perf/type/robustness issue with a plausible impact), **Low** (cleanup).
- Known pre-existing issues, already reported, so skip them: the BlogsPage `id` type error, Vitest globals missing from tsconfig, the broken `check-raw-color-literals.mjs` Windows path.

## Report format: write to `reviews/frontend-audit/<slice-id>.md`
```
# Slice <id>: <name>
Files audited: N (list every file path, marked ✓ clean or ⚠ findings)

## Findings
| Sev | Area | Location | Issue | Failure | Fix |
|---|---|---|---|---|---|
(Area ∈ contrast-a11y / tokens-theming / react / types-bundle; sorted Critical → Low)

## Cross-cutting patterns
(Repeated issues worth fixing centrally, with counts.)
```
Finish by returning a summary of at most 120 words: counts by severity, plus the 3 worst findings with locations.
