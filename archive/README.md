# archive/

Spent one-off codemods and dev utilities, moved out of the repository root on
2026-10-21 per owner decision (Q18 named this destination; see
`docs/plan/decisions.md` and `docs/codebase/CONCERNS.md` §6 answer #5).

These scripts were single-run find/replace migrations used during the design
system refactors (slate→white color swaps, padding normalization, section/div
restructuring, hero layout updates, ambient background fixes) plus a manual
Playwright console-debug helper. They are **not referenced by any package.json
script, CI workflow, or source file** and must not be run against the current
tree without review — their regexes target markup that no longer exists.

| File | What it was for |
| --- | --- |
| `fix_ambient.cjs`, `fix-bg-white5.mjs` | Ambient background / `bg-white/5` class fixups |
| `fix_badges.cjs`, `fix_sections.cjs` | Badge markup and section wrapper repairs |
| `fix-slate-replacements.mjs`, `replace-slate.mjs`, `replace-colors.mjs`, `replace_colors.sh` | slate/theme color token → Tailwind white/black swaps |
| `replace_padding.cjs`, `replace_padding_v2.cjs` | Padding class normalization |
| `ds_section_divs.cjs`, `update_hero_layout.cjs`, `update_heroes.cjs` | `ds-*` section div restructuring and hero layout updates |
| `test-browser.mjs` | Manual headless-Chromium console/page-error inspector |

Deletion is safe at any time; they are kept only as a record of how the
codemods that shaped the current markup worked. `patch.css` (repo root) is
**not** archived here — it is live (imported by `src/index.css`) and kept by
owner decision Q37.
