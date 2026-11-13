# Large, deliberately tracked binaries: why they stay

`video/hero-launch/assets/` holds ~3.5 MB of binaries that are **intentionally**
committed and are referenced by other checked-in files:

| Path | Why it is tracked | Referenced by |
|---|---|---|
| `brand/logo-mark.svg` | film-compositing copy of the shipped lockup | `.assets/manifest.json` (id `350a6aef…`, `status: approved`) |
| `captures/*.png` | 2× UI plates for video/offline compositing (`home-full.png` alone is 1.1 MB) | `docs/brand-guidelines.md` §9 |
| `fonts/*.woff2`, `vendor/gsap.min.js` | offline/film rendering without network access | `docs/brand-guidelines.md` §9 |

## Decision (2026-11-13)

These stay in Git. Moving them to external storage was considered as part of the
2026-11-12 hardening pass and rejected because:

1. **They are referenced by tracked metadata.** `.assets/manifest.json` records an
   owner approval against the tracked path; deleting the file would leave a
   dangling approved entry, and `docs/brand-guidelines.md` §9 documents the
   layout as normative.
2. **The cost is bounded and understood.** 3.5 MB of 16.4 MB of tracked content
   is not what makes clones slow; `node_modules` and `dist/` are.
3. **A rewrite is not free.** Removing them from history needs `git filter-repo`,
   which invalidates every commit SHA referenced by an ADR, an audit finding
   (`SEC-2026-01` cites commit `e4bff70`), or the deployment rollback procedure.

If the repository ever needs a shallower history, revisit this with an owner
decision — do not remove the files without also updating `.assets/manifest.json`
and `docs/brand-guidelines.md` §9.

`src/tests/server/repoHygiene.test.ts` asserts that the three files above still
exist and that the asset manifest still declares the film-copy brand asset, so a
rename or deletion cannot land silently and the whole-directory external move
this document rejects is caught if someone attempts it.
