# Hardening execution report — 2026-11-12

Plan: [`docs/superpowers/plans/2026-11-12-repo-hardening-ci-integrity.md`](2026-11-12-repo-hardening-ci-integrity.md)
Branch: `arena/b1761471-catalystlab` (base `1babd3a`), final HEAD `3fe4313`, pushed.
Method: `obra/superpowers` → `executing-plans` (inline, TDD-gated, one ledger line per task,
one whole-branch review at the end).

## Result

`npm run ci:full` → **exit 0**; `npm run media:check` → **exit 0** (SKIP).
**51 test files / 448 tests passing** (was 44 / 420), coverage 71.48 / 59.58 / 75.3 / 72.71
against the 68 / 55 / 72 / 69 ratchet.

| # | Task | Commit | Proof |
|---|---|---|---|
| 1 | Node runtime contract: `.nvmrc` = 24, `engines.node` `>=24` | `92bb90e` | `runtimeContract.test.ts` (3 tests) |
| 2 | `.env.example` becomes the 42-key parity base (`NODE_ENV`/`PORT` in, `GEMINI_API_KEY` out) | `66c6b4c` | `check:env` passes; `envTemplateParity.test.ts` |
| 3 | Lighthouse ready pattern matches the real startup line | `e3d14e0` | `lighthouseConfig.test.ts` |
| 4 | One owner for `GET /api/health` (`system.ts`), anonymous body `{status, timestamp}` | `787d587` | `api.test.ts`; live boot of `dist/server.cjs` |
| 5 | Demo GitHub seeding needs `ALLOW_DEMO_SEED` **and** non-production | `658ab79` | `demoSeedGate.test.ts` (4 tests) |
| 6 | `tsx` → devDependencies, `vite` stays; new `npm run check:deps` guard | `0f9f533` | `runtimeDeps.test.ts`; guard reports 15 modules |
| 7 | Internal error text no longer reflected; `requestId` returned instead | `88371a5` | `api.test.ts` "never reflects …" (3 tests) |
| 8 | `media:check` distinguishes unverifiable from broken (`skip` / `STRICT_MEDIA=1`) | `f72717c` | `mediaVerification.test.ts` |
| 9 | `SECURITY.md`, `firebase.json`/`.firebaserc`/`firestore.indexes.json`; four root dumps filed | `aacb2d0` | `repoHygiene.test.ts` |
| 10 | Full-gate sweep + knowledge-doc refresh | `23c87a8` | `ci:full` log |
| ★ | Review fix: resolver detail (`getaddrinfo ENOTFOUND …`) leaked from `validatePublicUrl` on two routes | `fcadd58` | new `api.test.ts` case |

## Rulings made during execution

- **R1** — `tsc --strict` without `allowJs` cannot type a `.mjs` import, so every script a test
  imports gets a sibling `scripts/<name>.d.mts`.
- **R2** — scripts that act on import (`verify-media.mjs`, `check-runtime-deps.mjs`) are now
  entrypoint-guarded with `import.meta.url === pathToFileURL(process.argv[1]).href`.
- **R3** — `__dirname` does not exist in this ESM suite; all repo-root resolution uses `process.cwd()`.
- **R4** — the plan's `demoSeedGate` test was vacuous (staging answers `401`, so "no seeded repo in
  the body" was trivially true). Rewritten to assert the predicate's truth table plus the endpoint
  through the demo-auth path; three of four then failed before the fix.
- **R5** — the plan's "never reflects internal error" tests never reached the leaking branch.
  Rewritten to force it (spy on `checkUrlSchema.safeParse`, `runNativeEngine` rejections), and the
  new `/api/run-engine` probe clears the shared daily quota it spends.

## Deferred / known limits

- 2.2 MB of `video/hero-launch` binaries still tracked (needs owner-approved external storage).
- Python gates (pytest/ruff/mypy/black) not installed in this sandbox — CI covers them.
- Playwright e2e not run here (browser download blocked); CI runs it.
- Sandbox Node is v22.22.3 while the repo now declares Node 24 — `EBADENGINE` warnings are expected
  and the floor was deliberately **not** lowered.
- No `LICENSE`/`CONTRIBUTING.md` by decision (private, single-owner package).
