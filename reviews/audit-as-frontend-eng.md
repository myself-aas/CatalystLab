# Frontend Engineering Audit: Uncommitted nav/token contrast changes

**Perspective**: Frontend Engineer
**Date**: 2026-11-16
**Plan**: No plan document. Audited the uncommitted working-tree diff on `main` (6 files).

## Plan Summary
Class-only edits to four navigation components: inactive nav text goes from `text-muted-foreground` / `text-cream/65` / `text-neutral-700` to higher-contrast `text-foreground/70` / `text-cream/80`. Arbitrary `bg-[var(--bg-surface)]` becomes the `bg-surface` utility, and the overlay CTA text moves from `text-ink-navy` to `text-primary-foreground`. `package.json` gains `npm init` metadata. There are no changes to state, hooks, props or types.

## Files Reviewed
| File | Frontend Role | Risk |
|------|--------------|------|
| src/components/dashboard/DashboardShell.tsx | App sidebar nav items | Medium (light-mode hover regression) |
| src/components/layout/EngineSubNav.tsx | Sticky engine tab strip | Medium (light-mode hover regression) |
| src/components/layout/MainMenuOverlay.tsx | Slide-out main menu, audit CTA, account card | Low (CTA fix is correct) |
| src/components/layout/Navbar.tsx | Top navbar links | Low |
| src/index.css (read only) | Token definitions | n/a |
| package.json / package-lock.json | Manifest metadata | Low |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)
| # | Issue | File(s) | Why It Breaks | Code Fix |
|---|-------|---------|---------------|----------|
| 1 | `bg-surface` is not the same colour as `bg-[var(--bg-surface)]` in light mode | DashboardShell.tsx:166, EngineSubNav.tsx:73, MainMenuOverlay.tsx:409, :526 | In the light block, `index.css:262` sets `--color-surface: #ffffff`. That unlayered `:root` rule overrides the `@theme` mapping `--color-surface: var(--bg-surface)` (index.css:534), while `--bg-surface` is `#F3F4F6`. The sidebar `<aside>` is `bg-background` (`#FFFFFF`) and EngineSubNav sits over the white app background, so the new hover state paints white on white and the hover affordance disappears in light mode. Dark mode is unaffected because line 431 maps surface to `--bg-surface`. | Use `hover:bg-cream/5`. Cream flips with the theme (`#1F2223` in light, `#F0FAFF` in dark), and no `patch.css` substring override targets it. **Do not use `hover:bg-foreground/5`:** patch.css:1040-1055 matches any `a`/`button` whose class contains `bg-foreground` and turns it into a pill CTA (rounded-full, weight 600, lift on hover, solid `#F7FDFF !important` fill in dark mode). **Do not keep `bg-surface` either:** patch.css:1172 gives any element whose class contains `bg-surface` a permanent solid `#2C2F32 !important` fill in dark mode, and that rule isn't hover-only. **Status: fixed 2026-11-17** (see Follow-up). |

## Recommendations
| # | Issue | File(s) | Why | Fix |
|---|-------|---------|-----|-----|
| 1 | Inconsistent inactive-hover recipe across the four navs | Navbar (`hover:bg-foreground/5`), DashboardShell/EngineSubNav (`hover:bg-surface`), MainMenuOverlay (`hover:bg-cream/4`) | The same "inactive nav item" state now has three different background recipes, and they will drift further apart. | Pick one recipe: `hover:bg-cream/5`. `hover:bg-foreground/5` looks fine in light mode but breaks in dark mode (see Critical #1). The alternative is a `.nav-item-inactive` component class next to `.ds-nav-active`. **Status: fixed 2026-11-17**, all four navs use `hover:bg-cream/5`. |
| 2 | `"main": "eslint.config.js"` in package.json | package.json | This is an `npm init` artifact. The package is `private` and has no library entry, so pointing `main` at the ESLint config is wrong and misleading. | Remove `main` and `directories`. |
| 3 | `license: "ISC"` added to a private repo, and the lockfile changed only to mirror it | package.json, package-lock.json | `npm init` may have picked this licence by default without anyone choosing it. | Confirm the licence is intended, or drop the field and revert the lockfile line. |
| 4 | Markdown `**engines**` in `description` | package.json | npm and GitHub show the description as plain text, so the asterisks appear literally. | Remove the `**`. |

## Nice-to-Haves
| # | Suggestion | Rationale |
|---|------------|-----------|
| 1 | Re-indent the edited ternary branches | Each `: '...'` else-branch is now indented 2–18 columns deeper than its `?` branch. ESLint passes, but the diffs are noisy. Run Prettier on the four files. |
| 2 | Don't migrate the remaining `bg-[var(--bg-surface)]` usages (FramerAdminCockpit, DocsLayout, FaqAccordion, DiagnosticEngineCard, DashboardShell:395) to `bg-surface` | `bg-surface` is white in light mode (index.css:262), and patch.css:1172 forces it solid in dark mode. |
| 4 | Narrow the `[class*="…"]` + `!important` selectors in `patch.css` | These selectors match by substring, so they restyle any utility whose class contains `bg-foreground`, `bg-surface`, `bg-muted`, `bg-background` and so on. That caused both dark-mode bugs in this review. Q37 keeps `patch.css`, so the fix is to narrow these selectors rather than delete the file. |
| 3 | Add a light-mode visual check of the nav hover states (Playwright screenshot) | A class-level review cannot see colour regressions like Critical #1, but a screenshot diff would catch them. |

Confirmed fixes in this diff:
- **Overlay CTA:** the CTA is `bg-primary`, which is `#000` in light mode. The old `text-ink-navy` (`#111827`) was unreadable on it, and `text-primary-foreground` fixes that in both themes.
- **Navbar:** dropping the raw `neutral-*` palette for tokens is also correct.

## Render Path Analysis
- The diff changes only static class strings inside existing `cn()` / template-literal ternaries keyed on `active` / `isActive` / `isEnginesOpen`. It adds no state, effects, subscriptions, props or new dynamic class construction, so render triggers and downstream re-renders are unchanged.
- **Navbar:** renders on route change (`active`) and `isEnginesOpen`, the same as before.
- **DashboardShell:** nav items re-render on `isSidebarCollapsed` and route changes, the same as before.
- **MainMenuOverlay:** renders on `open`, auth user, `isScanning` and `isAdmin`, the same as before. The `motion.div` hover/tap animations on the CTA are untouched.
- **Dynamic classes:** no new interpolated Tailwind classes. All new classes (`text-foreground/70`, `bg-surface`, `text-primary-foreground/60`, `text-cream/80`) are static literals that Tailwind detects. The existing `${isSidebarCollapsed ? 'w-18' : 'w-64'}` interpolation also uses complete static class names.
- **Net render impact:** none.

## Type Safety Assessment
The diff has no type surface; only string literals change. ESLint passes on all changed files. `tsc --noEmit` reports 12 errors, all outside this diff, from the already committed blog/MDX work:
- `src/pages/BlogsPage.tsx:145`: `Property 'id' does not exist on type 'BlogPost'`.
- `src/tests/lib/blogLoader.test.tsx`: fixtures don't match `BlogPost`.
- Test files: Vitest globals (`describe`, `it`, `vi`, `expect`) are missing from the tsconfig `types`.

These will fail `npm run ci` (`typecheck`) regardless of this diff.

Tooling note: `scripts/check-raw-color-literals.mjs` crashes on Windows (it scans `G:\G:\Github\...`, so it builds the path by prefixing the drive twice). The `check:colors` CI gate could not be run locally.

## Follow-up (2026-11-17)
Checked in the browser (Edge, light and dark). Hover was measured at 1280px. The navbar was also checked at 390px, both at the top of the page and scrolled.

1. **Nav hover unified:** `hover:bg-cream/5` in Navbar.tsx:207 and :302, DashboardShell.tsx:166, EngineSubNav.tsx:73 and MainMenuOverlay.tsx:214. In light mode, hover gives a 5% dark tint; in dark mode, a 5% light tint. There is no pill shape, lift or solid fill. The DashboardShell sidebar needs sign-in, so it is checked in code only.
2. **New critical, now fixed: dark-mode navbar was white on white.** patch.css forced `#FFFFFF !important` on the navbar in both themes, and Navbar.tsx:251 hard-coded `bg-white`. Once the diff switched the links to `text-foreground/70`, the links, logo and icons were invisible in dark mode.
   - The fix scopes the three white-background rules to `html:not(.dark)` (patch.css:323, :518, :818).
   - The unscrolled navbar classes are now `border-border/50 bg-background`.
   - Result: the dark navbar is `#111827` with an estimated contrast of about 9:1. Light mode is unchanged, at about 6:1.
3. **Remaining, not changed:** in dark mode on desktop, the scrolled navbar is opaque rather than frosted, because patch.css:1171 forces anything with `bg-background` in its class to `#111827 !important`.

## Verdict Details
- Component Architecture: PASS
- State Management: PASS (untouched)
- Type Safety: PASS for this diff (pre-existing blog type errors noted above)
- Rendering Performance: PASS
- Bundle Impact: PASS
