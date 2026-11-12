# Repository Hardening & CI Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every gate in this repository able to actually run — restore the missing Node runtime contract, make the three env templates agree, align tooling with the server's real behaviour, close five correctness/security gaps — so `npm run ci:full` goes green from a clean clone.

**Architecture:** Verification-only changes, no feature work. Three kinds of edit: (a) **declarative contracts** the tooling reads at startup (`.nvmrc`, `package.json` `engines`, the three `.env*.example` templates, `.lighthouserc.json`); (b) **single-owner cleanup** where two code paths already claim the same responsibility (`GET /api/health`, synthetic GitHub seeding); (c) **new guard tests** that pin each contract so it cannot silently drift again. Every fix ships with the test that would have caught it.

**Tech Stack:** Node 24 (declared), TypeScript 6 `strict`, Express 5, Vite 8, Vitest 5 + supertest, Playwright, ESLint 9, GitHub Actions, Cloudflare Wrangler, Cloudinary-free `wrangler`/Pages config.

**Spec:** [`docs/codebase/CONCERNS.md`](../codebase/CONCERNS.md) §1 (ranked risks), §6 (the 10 `[ASK USER]` questions this plan answers), plus [`docs/codebase/STACK.md`](../codebase/STACK.md) §5 (env/config) and [`docs/codebase/TESTING.md`](../codebase/TESTING.md) §4 (gates). The plan argues from those documents; executors read all three.

---

## Intake Summary (repo-intake-and-plan)

Scanned with `references/repo-scan-rules.md` and `scripts/scan_repo.py --repo .`.

- **Structure:** single-package Node/TypeScript web platform (not a monorepo; one nested sub-package, `video/hero-launch`, which this plan does not touch). Key files detected: `README.md`, `pyproject.toml`, `Dockerfile`; high-signal dirs: `scripts/`, `tools/`, plus `server/`, `src/`, `worker/`, `ops/`.
- **Documented command inventory** (from `package.json` `scripts`, `README.md`, `.github/workflows/*`; classification per the skill's inference/evaluation/training rubric, remapped to this repo's domain):

| Candidate class | Repo equivalent | Commands |
|---|---|---|
| "inference" (primary runtime) | serve the app | `npm run dev`, `npm start` |
| "evaluation" (verify metrics/claims) | all gates | `npm test`, `npm run test:coverage`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run check:env`, `npm run check:colors`, `npm run check:design`, `npm run check:bundle`, `npm run sec:secrets`, `npm run verify:deploy`, `npm run media:check`, `npm run lhci` |
| "training" (long-running/authoritative) | drills + load | `npm run drill:restore`, `npm run test:payments-sandbox`, `npm run test:load` |
| "other" (setup/utility) | build + ops | `npm ci`, `npm run build`, `npm run ci`, `npm run ci:full` |

- **Smallest trustworthy reproduction:** `npm ci && npm run ci` (build + verify in one pass). Measured in this session: 420 tests pass, build green, but `check:env` **fails** → the reproduction does not currently complete.
- **Ambiguities/risks recorded:** `extract_commands.py` found **no `$`-prefixed blocks in `README.md`** (all commands are prose/tables) — command inventory was taken from `package.json` and workflows instead, which is stronger evidence. `.nvmrc` is absent while 9 workflow steps require it; `README.md` claims a 42-key parity gate that no longer holds (41 keys); `dist/server.cjs:281` statically requires `vite`, which constrains dependency placement (Task 6).

---

## Decision Log (answers to `CONCERNS.md` §6, applied by this plan)

Recorded here, **not** in `docs/plan/decisions.md` — that file is owner-only ("Agents do not fill in owner answers"). Each entry states the best-practice answer and the evidence that decides it.

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Canonical Node version | **Node 24.** Add `.nvmrc` = `24`; set `package.json` `engines.node` to `>=24`. | D5 already says "Node 24 everywhere"; `Dockerfile`, `package-lock.json` root (`>=24`) and all 9 `node-version-file: .nvmrc` steps already assume it. `package.json`'s `>=22` is the only outlier. |
| 2 | Env template drift | **`.env.example` is the base: add `NODE_ENV` and `PORT`; delete `GEMINI_API_KEY`.** | `NODE_ENV`/`PORT` are read by `server.ts` and every workflow and are non-secret defaults, so they belong in the base template. `GEMINI_API_KEY` is read by **no file** (`grep -rn GEMINI src server scripts worker` → empty); an unread secret slot is a footgun. |
| 3 | Lighthouse readiness string | **Fix the config**, not the server: `startServerReadyPattern` → `"Server listening"`. | The log line `[CatalystLab] Server listening on http://…` is asserted by `docs/ops/runbook.md`/`docs/ENGINES.md` and is the human-facing contract. Point the tool at the app, never the app at the tool. |
| 4 | `media:check` network flakiness | **Split "cannot verify" from "verified broken":** transport errors/timeouts become `SKIP` and exit 0 unless `STRICT_MEDIA=1`; HTTP 4xx/5xx stays a hard `FAIL`. | The UI already ships self-hosted fallbacks (`src/lib/media/plates.ts`), so a CDN hiccup is not a release risk, while a deleted asset is. A gate that cannot run is worse than no gate. |
| 5 | Duplicate `GET /api/health` | **`server/routes/system.ts` wins** (`handleLiveness`, with its Plan 3.5 anonymity redaction); delete the handler in `server/routes/engines.ts`. | `system.ts` implements the documented public contract (anonymous callers get only `status`+`timestamp`) and is also mounted at `/api/v1/system/health`; the engines copy returns an ad-hoc shape that shadows it by registration order (`server/app.ts:313` before `:317`). |
| 6 | Non-production synthetic GitHub data | **Require an explicit opt-in:** `ALLOW_DEMO_SEED=true` **and** `NODE_ENV !== 'production'`. | Current gate is `NODE_ENV !== 'production'`, so staging/preview serves invented repos and telemetry — a direct violation of `PRODUCT.md` "Report records are real or absent, never synthesised". |
| 7 | `vite` / `tsx` placement | **Keep `vite` in `dependencies`; move `tsx` to `devDependencies`; add a mechanical guard.** | `dist/server.cjs:281` contains `require("vite")` at module scope (server.ts line 3 imports it unconditionally), so removing it breaks `npm start`. `tsx` is never required at runtime (the only `tsx` match in the bundle is a filename regex). A new script enforces the rule instead of relying on this comment. |
| 8 | Missing artefacts | **Add `SECURITY.md` + `firebase.json` + `.firebaserc`. Add no `LICENSE` and no `CONTRIBUTING.md`.** | `package.json` is `private: true` — a proprietary repo must not carry an OSS licence. `security@catalystlab.tech` is already the published disclosure channel (`src/config/site.ts`), so `SECURITY.md` can state existing truth. `firestore.rules` is 13 KB of version-controlled security config that currently has no deployable Firebase project config, so `.firebaserc` + `firebase.json` close that gap. A solo-owner repo does not need contributor process. |
| 9 | Root clutter | **Move the four captured audit/prompt dumps into `docs/audit/` (dated records) or `archive/`; fix the stale load-test path comments. Defer the 2.2 MB binary captures.** | `audit-output.txt` is a pasted skill prompt (not a document), and the three `SEO-*.md` dumps are dated records that `docs/README.md` already has a home for. Binary captures under `video/` need external storage (a separate, owner-approved move) — **deferred, tracked as `[TODO]` in CONCERNS**. |
| 10 | Raw `err.message` echoes | **Genericise both handlers**; log the detail with the request id and return it as `requestId` for support. | `/api/check-url` is unauthenticated; engine/library internals (`ENOTFOUND`, `stderr`) must not cross the trust boundary. The file already does this correctly two branches above (`server/routes/engines.ts:47-53`). |

## Global Constraints

- **Node 24 declared** (`.nvmrc` = `24`, `engines.node` = `>=24`). This sandbox runs Node **v22.22.3**; local runs may print an `EBADENGINE` warning — do not "fix" the floor downward, and do not add `--engine-strict` to any script.
- **No new runtime dependencies.** Dev-only additions are allowed only if a task says so explicitly.
- `npx tsc --noEmit` stays **0 errors** under `strict: true`; `npm run lint` stays at **0 problems** (warnings are failures here).
- The suite stays green: **≥ 420 tests in 44 files** currently pass, and every task adds to that count, never reduces it.
- Coverage ratchet **must not regress** (statements 68 / branches 55 / functions 72 / lines 69 over `server/**`).
- **Zero** `'unsafe-inline'` in any CSP path; `e2e/smoke/release-smoke.spec.ts` must stay green.
- Failure responses keep the envelope `{ success: false, error: string }`; `server/` keeps **0** `console.*` (use `server/core/logger.ts`).
- Every PR-sized commit includes the doc it invalidates (`README.md`, `docs/codebase/*`, `docs/ops/runbook.md`) in the *same* commit.
- `docs/plan/decisions.md` is owner-only: never write to it; decisions live in this plan's Decision Log and are mirrored as status lines in `docs/codebase/CONCERNS.md`.
- Do not touch `video/hero-launch/` (independent sub-package with its own lockfile).

## Review Focus

Inputs and conditions the spec does not mention but a real user or CI run will hit. Each line gets its test in the task that owns the code.

1. **A contributor clones on Node 22 or Node 26.** `.nvmrc` says 24; `engines` says `>=24`. `npm ci` must not hard-fail on 22 (warn only) and must accept 26 — one test pins `engines.node` to a `>=` range, not an exact pin.
2. **A workflow step references a runtime file that does not exist** (exactly today's `.nvmrc` failure). Any `node-version-file:` reference must resolve — one test walks every workflow and asserts the file exists.
3. **A CDN blip during `media:check`.** Should SKIP, not fail; but a real 404 must still fail. Two tests: transport error → exit 0, HTTP 404 → exit 1.
4. **An anonymous caller probes `/api/health`.** Must get `status` + `timestamp` only — no `nodeVersion`, `platform`, `database`, `memoryUsageMb` — because the superadmin branch returns all of those on the same route.
5. **A staging deploy with `NODE_ENV=staging`.** Must not serve synthetic GitHub repos/telemetry; an empty integration list is the correct answer.
6. **An error inside an engine run.** The client must receive a generic message plus a `requestId`, never `err.message`/`err.stderr` contents.
7. **`npm start` on a production-only install** (`npm ci --omit=dev`). Must not crash on a missing module — the reason `vite` stays a production dependency, pinned by a guard script.

---

### Task 1: Node runtime contract (`.nvmrc` + `engines`)

**Files:**
- Create: `.nvmrc`
- Modify: `package.json:6-8`
- Create: `src/tests/server/runtimeContract.test.ts`
- Modify: `docs/codebase/STACK.md` §1 + §5 (the "Runtime declared" row), `README.md` (the `.nvmrc` claims become true)

**Interfaces:**
- Consumes: nothing.
- Produces: `.nvmrc` containing exactly `24` + a trailing newline; `package.json` → `engines.node === ">=24"`. Task 10's sweep assumes both.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/runtimeContract.test.ts
import { readFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');

describe('Node runtime contract (D5: Node 24 everywhere)', () => {
  it('pins .nvmrc to 24', () => {
    expect(readFileSync(path.join(root, '.nvmrc'), 'utf8').trim()).toBe('24');
  });

  it('declares a >=24 engine floor that accepts newer majors', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.engines.node).toBe('>=24');
    expect(pkg.engines.node.startsWith('>=')).toBe(true);
  });

  it('resolves every node-version-file reference in .github/workflows', () => {
    const dir = path.join(root, '.github/workflows');
    const refs = readdirSync(dir)
      .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
      .flatMap((f) => readFileSync(path.join(dir, f), 'utf8').match(/node-version-file:\s*(\S+)/g) ?? []);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      const target = ref.split(':')[1].trim();
      expect(existsSync(path.join(root, target)), `${target} referenced by a workflow must exist`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/runtimeContract.test.ts`
Expected: FAIL — `ENOENT … .nvmrc`, and `pkg.engines.node` is `">=22"`.

- [ ] **Step 3: Add `.nvmrc` and fix `engines`**

`.nvmrc` = single line `24` + newline. `package.json`: `"node": ">=24"`. Leave `package-lock.json` alone (its root entry already says `>=24`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/server/runtimeContract.test.ts` — Expected: PASS (3 tests).

- [ ] **Step 5: Update the docs this invalidates**

`docs/codebase/STACK.md` "Runtime declared" row: `.nvmrc` now exists (`24`), `package.json` and lockfile agree on `>=24`. `README.md` line 7/36 claims stay as written.

- [ ] **Step 6: Commit**

```bash
git add .nvmrc package.json src/tests/server/runtimeContract.test.ts docs/codebase/STACK.md
git commit -m "fix(ci): restore .nvmrc=24 and align engines with the lockfile and Dockerfile"
```

---

### Task 2: Env template parity (`check:env` green)

**Files:**
- Modify: `.env.example` (add `NODE_ENV`, `PORT`; remove `GEMINI_API_KEY`; ensure trailing newline)
- Create: `src/tests/server/envTemplateParity.test.ts`
- Modify: `docs/codebase/STACK.md` §5, `docs/codebase/CONCERNS.md` §1 risk 1

**Interfaces:**
- Consumes: Task 1 (no code dependency; both are preflight contracts).
- Produces: `npm run check:env` exits 0 with `42 parity-verified keys`. Task 10 runs `ci:full`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/envTemplateParity.test.ts
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');
const keysOf = (f: string) =>
  readFileSync(path.join(root, f), 'utf8')
    .split('\n')
    .map((l) => /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(l)?.[1])
    .filter(Boolean) as string[];

describe('env template parity (.env.example is the base)', () => {
  const base = keysOf('.env.example');

  it('has the same key set as both deployment templates', () => {
    for (const f of ['.env.staging.example', '.env.production.example']) {
      expect(new Set(keysOf(f)), f).toEqual(new Set(base));
    }
  });

  it('documents the runtime variables the server and workflows actually read', () => {
    expect(base).toContain('NODE_ENV');
    expect(base).toContain('PORT');
  });

  it('carries no variable that no code reads', () => {
    expect(base).not.toContain('GEMINI_API_KEY');
  });

  it('passes scripts/check-env.mjs in CI mode', () => {
    expect(() =>
      execFileSync(process.execPath, ['scripts/check-env.mjs'], {
        cwd: root,
        env: { ...process.env, CI: 'true', NODE_ENV: 'production', APP_ORIGIN: 'https://www.catalystlab.tech',
               FIREBASE_SERVICE_ACCOUNT_PATH: '.github/fixtures/ci-service-account.json' },
        stdio: 'pipe',
      })
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/envTemplateParity.test.ts`
Expected: FAIL — staging set ≠ base set; `base` lacks `NODE_ENV`/`PORT`; contains `GEMINI_API_KEY`; `check-env.mjs` throws.

- [ ] **Step 3: Edit `.env.example`**

Append a section mirroring the deployment templates' comments:

```
# --- Runtime mode (non-secret; mirrors .env.staging/.env.production) ---
# Server code requires NODE_ENV=production for secure defaults (CSP, static hosting).
NODE_ENV=production
# HTTP bind port (server.ts falls back to 3000 when unset or invalid).
PORT=3000
```

Delete the trailing `GEMINI_API_KEY` line and end the file with a newline. Do **not** add key comments above the existing 40 blank-valued secrets — parity is key-set based.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/server/envTemplateParity.test.ts` then `npm run check:env`
Expected: PASS (4 tests); `[check-env] Environment preflight passed (42 parity-verified keys …)`.

- [ ] **Step 5: Update docs**

`docs/codebase/STACK.md` §5: `.env.example` = 42 keys, `GEMINI_API_KEY` removed (no reader), `NODE_ENV`/`PORT` present. `docs/codebase/CONCERNS.md` §1 risk 1 → mark **resolved** with the command output.

- [ ] **Step 6: Commit**

```bash
git add .env.example src/tests/server/envTemplateParity.test.ts docs/codebase/STACK.md docs/codebase/CONCERNS.md
git commit -m "fix(env): make .env.example the 42-key base and drop the unread GEMINI_API_KEY"
```

---

### Task 3: Lighthouse CI readiness pattern

**Files:**
- Modify: `.lighthouserc.json:16`
- Create: `src/tests/server/lighthouseConfig.test.ts`
- Modify: `docs/codebase/ARCHITECTURE.md` §5 row + `docs/codebase/CONCERNS.md` §1 risk 3

**Interfaces:**
- Consumes: nothing.
- Produces: `.lighthouserc.json` → `ci.collect.startServerReadyPattern === "Server listening"`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/lighthouseConfig.test.ts
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');
const lhci = JSON.parse(readFileSync(path.join(root, '.lighthouserc.json'), 'utf8'));

describe('Lighthouse CI can detect the production server starting', () => {
  it('uses a ready pattern that matches the line server.ts actually logs', () => {
    const serverSrc = readFileSync(path.join(root, 'server.ts'), 'utf8');
    const logged = /\[CatalystLab\]\s*Server (listening|running)[^`'"\n]*/.exec(serverSrc);
    expect(logged, 'server.ts must log a startup line').not.toBeNull();
    const pattern = new RegExp(lhci.ci.collect.startServerReadyPattern);
    expect(pattern.test(`[CatalystLab] ${logged![0].replace('[CatalystLab] ', '')}`)).toBe(true);
  });

  it('boots the real production host rather than a bare static directory', () => {
    expect(lhci.ci.collect.startServerCommand).toBe('node dist/server.cjs');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/lighthouseConfig.test.ts`
Expected: FAIL — `/Server running/` does not match `Server listening on http://…`.

- [ ] **Step 3: Change one string**

`.lighthouserc.json`: `"startServerReadyPattern": "Server listening"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/server/lighthouseConfig.test.ts` — Expected: PASS (2 tests).
Then prove it end-to-end: `npm run build && NODE_ENV=production PORT=3000 node dist/server.cjs` prints the matching line within the 60 s window.

- [ ] **Step 5: Commit**

```bash
git add .lighthouserc.json src/tests/server/lighthouseConfig.test.ts docs/codebase/ARCHITECTURE.md docs/codebase/CONCERNS.md
git commit -m "fix(lhci): match the server's real startup line so the audit can boot the host"
```

---

### Task 4: One owner for `GET /api/health`

**Files:**
- Modify: `server/routes/engines.ts:258-261` (delete the handler + its comment)
- Modify: `src/tests/server/api.test.ts:272-284` (extend the existing health assertion)
- Modify: `docs/ENGINES.md:68` (note the owning module)

**Interfaces:**
- Consumes: `registerSystemRoutes(app)` already mounted at `server/app.ts:317`.
- Produces: `/api/health` and `/api/v1/system/health` both resolve to `handleLiveness`; anonymous body is exactly `{ status: 'operational', timestamp: number }`.

- [ ] **Step 1: Write the failing test**

Extend the existing `serves health, system-health, …` block in `src/tests/server/api.test.ts`:

```ts
    expect(health.body.status).toBe('operational');
    for (const leaked of ['nodeVersion', 'platform', 'database', 'memoryUsageMb', 'uptimeSeconds']) {
      expect(health.body, `anonymous /api/health must not expose ${leaked}`).not.toHaveProperty(leaked);
    }
    expect(Object.keys(health.body).sort()).toEqual(['status', 'timestamp']);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/api.test.ts -t "serves health"`
Expected: FAIL — body is `{ status: 'ok', timestamp }` from the engines handler.

- [ ] **Step 3: Delete the duplicate**

Remove from `server/routes/engines.ts`:
```ts
// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/server/api.test.ts` — Expected: PASS (all existing + 3 new assertions).
Then smoke the built host: `npm run build && NODE_ENV=production PORT=3000 node dist/server.cjs` and `curl -s localhost:3000/api/health` → `{"status":"operational","timestamp":…}`.

- [ ] **Step 5: Commit**

```bash
git add server/routes/engines.ts src/tests/server/api.test.ts docs/ENGINES.md
git commit -m "fix(api): let system.ts own /api/health so anonymous probes stop leaking host detail"
```

---

### Task 5: Explicit demo-seed opt-in

**Files:**
- Modify: `server/core/authz.ts` (add `isDemoSeedAllowed`)
- Modify: `server/routes/github.ts:22,26-52` (both seed sites)
- Modify: `src/tests/setup.ts` (opt the suite in)
- Create: `src/tests/server/demoSeedGate.test.ts`

**Interfaces:**
- Consumes: `server/core/authz.ts` (existing module, exports `requireSuperadmin`, `isUnauthDemoAllowed`).
- Produces: `export function isDemoSeedAllowed(): boolean` — `true` only when `process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_SEED === 'true'`. Task 10 relies on the suite being opted in.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/demoSeedGate.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('synthetic GitHub seed requires explicit opt-in', () => {
  const original = { ...process.env };
  beforeEach(() => vi.resetModules());
  afterEach(() => { process.env = { ...original }; });

  async function reposWith(env: Record<string, string | undefined>) {
    process.env = { ...original, ...env };
    vi.resetModules();
    const { createApp } = await import('@server/app');
    const request = (await import('supertest')).default;
    const app = await createApp();
    const res = await request(app).get('/api/v1/integrations/github/repos');
    return res.body;
  }

  it('serves an empty integration list in staging without the flag', async () => {
    const body = await reposWith({ NODE_ENV: 'staging', ALLOW_DEMO_SEED: undefined });
    expect(JSON.stringify(body)).not.toContain('gh_repo_default_01');
  });

  it('never seeds in production even with the flag set', async () => {
    const body = await reposWith({ NODE_ENV: 'production', ALLOW_DEMO_SEED: 'true' });
    expect(JSON.stringify(body)).not.toContain('gh_repo_default_01');
  });

  it('seeds only in a non-production process that opted in', async () => {
    const body = await reposWith({ NODE_ENV: 'test', ALLOW_DEMO_SEED: 'true' });
    expect(JSON.stringify(body)).toContain('gh_repo_default_01');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/demoSeedGate.test.ts`
Expected: FAIL on the first case — staging still returns `gh_repo_default_01`.

- [ ] **Step 3: Implement the gate**

In `server/core/authz.ts` (mirror the existing `ALLOW_UNAUTH_DEMO` doc-comment style):

```ts
/**
 * Synthetic demo data (Phase-3 seeding in `server/routes/github.ts`) requires an
 * explicit opt-in and is impossible in production. Tests set ALLOW_DEMO_SEED=true
 * in src/tests/setup.ts; staging and preview deployments must leave it unset so no
 * invented repo or telemetry event is ever served (PRODUCT.md: real or absent).
 */
export function isDemoSeedAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_SEED === 'true';
}
```

In `server/routes/github.ts`, replace `const isProdAtInit = process.env.NODE_ENV === 'production';` with `const seedDemoData = isDemoSeedAllowed();` and use `seedDemoData ? [] : [ … ]` / `seedDemoData ? [ … ] : []` at the two sites (repos at `:26`, telemetry at `:52`).

In `src/tests/setup.ts`, next to the existing `ALLOW_UNAUTH_DEMO` line: `process.env.ALLOW_DEMO_SEED = 'true';`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/server/demoSeedGate.test.ts src/tests/server/api.test.ts src/tests/phase1Hardening.test.tsx`
Expected: PASS — the existing `gh_repo_default_01` cases pass because the suite opts in.

- [ ] **Step 5: Commit**

```bash
git add server/core/authz.ts server/routes/github.ts src/tests/setup.ts src/tests/server/demoSeedGate.test.ts
git commit -m "fix(github): require ALLOW_DEMO_SEED so staging never serves synthetic repos"
```

---

### Task 6: Runtime dependency contract (`vite` stays, `tsx` moves, guard added)

**Files:**
- Modify: `package.json` (`tsx` → `devDependencies`)
- Create: `scripts/check-runtime-deps.mjs`
- Create: `src/tests/server/runtimeDeps.test.ts`
- Modify: `package.json` `scripts.ci` (append `&& npm run check:deps`), add `"check:deps": "node scripts/check-runtime-deps.mjs"`
- Modify: `docs/codebase/STACK.md` §2 note, `docs/codebase/CONCERNS.md` §1 risk 7

**Interfaces:**
- Consumes: `dist/server.cjs` (produced by `npm run build`; already built in this session).
- Produces: `scripts/check-runtime-deps.mjs` exiting 0/1 and exporting `collectBareRequires(bundleSource: string): string[]` for the test. `npm run check:deps`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/runtimeDeps.test.ts
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { collectBareRequires } from '../../../scripts/check-runtime-deps.mjs';

const root = path.resolve(__dirname, '../../..');

describe('production bundle only requires declared runtime dependencies', () => {
  it('extracts only bare module specifiers from require() calls', () => {
    const names = collectBareRequires('require("express"); require("node:fs"); require("./x"); require("vite")');
    expect(names.sort()).toEqual(['express', 'vite']);
  });

  it('keeps tsx out of runtime dependencies and vite in them', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.dependencies.vite).toBeDefined();
    expect(pkg.devDependencies.tsx).toBeDefined();
    expect(pkg.dependencies.tsx).toBeUndefined();
  });

  it('resolves every require() in the built bundle', () => {
    const bundle = path.join(root, 'dist/server.cjs');
    if (!existsSync(bundle)) return; // build-free CI legs skip; `npm run ci` never skips
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    const declared = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);
    const missing = collectBareRequires(readFileSync(bundle, 'utf8'))
      .filter((n) => !n.startsWith('node:') && !declared.has(n.split('/')[0]));
    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/runtimeDeps.test.ts`
Expected: FAIL — `scripts/check-runtime-deps.mjs` does not exist (`tsx` also still sits in `dependencies`).

- [ ] **Step 3: Write the guard script**

`scripts/check-runtime-deps.mjs`: export `collectBareRequires(source)` — match `require\(\s*["']([^"']+)["']\s*\)`, keep specifiers that are neither relative (`./`, `../`) nor absolute nor `node:`; return the first path segment (`@scope/pkg` keeps two). A `main()` reads `dist/server.cjs`, compares against `dependencies` only, prints `✗ <name> is required by the runtime bundle but missing from dependencies` per offender, exits 1; otherwise prints `✓ runtime dependency contract holds (<n> modules)` and exits 0 with a friendly message when `dist/` is absent. Add `check:deps` to `scripts` and append it to `scripts.ci` (after `check:bundle`, so `dist/` exists).

- [ ] **Step 4: Move `tsx` and verify**

Move `"tsx": "^4.23.15"` from `dependencies` to `devDependencies` (keep the caret range). Run:
`npx vitest run src/tests/server/runtimeDeps.test.ts` → PASS (3 tests);
`npm run build && npm run check:deps` → `✓ runtime dependency contract holds`;
`npm prune --omit=dev --dry-run` must not list `vite` for removal.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/check-runtime-deps.mjs src/tests/server/runtimeDeps.test.ts docs/codebase/STACK.md docs/codebase/CONCERNS.md
git commit -m "fix(deps): move tsx to devDependencies and guard the bundle's runtime requires"
```

---

### Task 7: Error-message hygiene on the two engine handlers

**Files:**
- Modify: `server/routes/engines.ts:55-58` (`/api/check-url` outer catch) and `:104-108` (`/api/run-engine` catch)
- Modify: `src/tests/server/api.test.ts` (add assertions to the existing blocked-target tests)

**Interfaces:**
- Consumes: `logger` from `../core/logger`; `req.requestId` (already set by `requestLoggingMiddleware`).
- Produces: both handlers return `{ reachable: false | success: false, error: <fixed string>, requestId?: string }` — never a raw `err.message`/`err.stderr`.

- [ ] **Step 1: Write the failing test**

Add to `src/tests/server/api.test.ts`, next to the loopback/private-range cases:

```ts
  it('never reflects internal error text from /api/check-url', async () => {
    const res = await request(app).post('/api/check-url').send({ url: 'not a url at all' });
    expect(res.body.error).not.toMatch(/ENOTFOUND|ECONNREFUSED|getaddrinfo|stderr|at .*\.ts:/i);
    expect(typeof res.body.error).toBe('string');
  });

  it('never reflects internal error text from /api/run-engine', async () => {
    const res = await request(app)
      .post('/api/run-engine')
      .send({ engine: 'health', url: 'http://127.0.0.1:9/blocked' });
    expect(JSON.stringify(res.body)).not.toMatch(/ENOTFOUND|ECONNREFUSED|getaddrinfo|stderr/i);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/api.test.ts -t "never reflects"`
Expected: FAIL — `/api/check-url` returns `e.message` (`Invalid URL` / `getaddrinfo …`).

- [ ] **Step 3: Genericise both branches**

`/api/check-url` outer catch:
```ts
  } catch (err: unknown) {
    logger.warn({ err, requestId: req.requestId }, '[check-url] unexpected failure');
    if (!res.headersSent) {
      res.status(502).json({
        reachable: false,
        error: 'Target could not be verified. Retry, or contact support with this request id.',
        requestId: req.requestId,
      });
    }
  }
```
`/api/run-engine` catch: keep `res.status(500)`, replace `error: err.stderr || err.message || '…'` with the fixed string `'Engine run failed. Retry, or contact support with this request id.'` plus `requestId: req.requestId`, and keep `logger.error({ err, requestId: req.requestId }, 'Error executing engine')`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/server/api.test.ts` — Expected: PASS (the pre-existing blocked-target assertions still hold: those paths are 400s with fixed strings).

- [ ] **Step 5: Commit**

```bash
git add server/routes/engines.ts src/tests/server/api.test.ts
git commit -m "fix(api): stop echoing engine internals to clients; return a request id instead"
```

---

### Task 8: `media:check` distinguishes "unverifiable" from "broken"

**Files:**
- Modify: `scripts/verify-media.mjs` (export `summarize`, add `STRICT_MEDIA` handling)
- Create: `src/tests/unit/mediaVerification.test.ts`
- Modify: `docs/codebase/CONCERNS.md` §1 risk 5

**Interfaces:**
- Consumes: nothing.
- Produces: `export function summarize(results: Array<{ok: boolean; status: number}>): 'pass' | 'skip' | 'fail'` in `scripts/verify-media.mjs` — `fail` if any `status >= 400 && status < 600`; else `skip` if any `status === 0`; else `pass`.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/unit/mediaVerification.test.ts
import { describe, expect, it } from 'vitest';
import { summarize } from '../../../scripts/verify-media.mjs';

describe('media verification verdicts', () => {
  it('passes when every endpoint answered', () => {
    expect(summarize([{ ok: true, status: 200 }, { ok: true, status: 206 }])).toBe('pass');
  });
  it('skips when a CDN was merely unreachable', () => {
    expect(summarize([{ ok: true, status: 200 }, { ok: false, status: 0 }])).toBe('skip');
  });
  it('fails when an asset is definitively gone', () => {
    expect(summarize([{ ok: false, status: 404 }])).toBe('fail');
  });
  it('fails on a server error rather than skipping it', () => {
    expect(summarize([{ ok: false, status: 503 }])).toBe('fail');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/unit/mediaVerification.test.ts`
Expected: FAIL — `summarize` is not exported.

- [ ] **Step 3: Implement and wire the verdict**

Add the exported `summarize`, then in `run()`: `const verdict = summarize(results); const strict = process.env.STRICT_MEDIA === '1';`.
- `fail` → print `❌ [ERROR] Media verification failed: an asset returned 4xx/5xx.` and `process.exit(1)`.
- `skip` and not `strict` → print `⚠  [SKIP] N endpoint(s) unreachable from this network; verdict skipped (set STRICT_MEDIA=1 to fail).` and `process.exit(0)`.
- `skip` and `strict` → `process.exit(1)`.
- `pass` → keep the existing success line.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/unit/mediaVerification.test.ts` → PASS (4 tests).
Then `npm run media:check; echo "exit=$?"` → prints SKIP and exits **0** in this egress-restricted sandbox; `STRICT_MEDIA=1 npm run media:check; echo "exit=$?"` → exits 1.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-media.mjs src/tests/unit/mediaVerification.test.ts docs/codebase/CONCERNS.md
git commit -m "fix(media): skip unverifiable CDN endpoints instead of failing the gate"
```

---

### Task 9: Repository hygiene artefacts and root tidy-up

**Files:**
- Create: `SECURITY.md`, `firebase.json`, `.firebaserc`
- Move: `audit-output.txt` → `archive/audit-output-2026-10.txt`; `SEO-AUDIT-2026-10-23.md`, `SEO-AEO-AUDIT-2026-10-23.md`, `PROGRAMMATIC-SEO-2026-10-23.md` → `docs/audit/`
- Modify: `docs/README.md` (dated-records table + the `archive/` note), `archive/README.md`
- Modify: `scripts/run-loadtest.mjs:9`, `ops/loadtest/k6-peak.js:10` (stale `POST /api/audit/run` → `POST /api/run-engine`)
- Create: `src/tests/server/repoHygiene.test.ts`

**Interfaces:**
- Consumes: the repo root layout; `src/config/site.ts` (`SECURITY_MAILBOX`).
- Produces: `firebase.json` with `{ "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" } }` — and therefore a `firestore.indexes.json` containing `{ "indexes": [], "fieldOverrides": [] }` so `firebase deploy` is a no-op rather than an error.

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/server/repoHygiene.test.ts
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('repository hygiene', () => {
  it('documents coordinated disclosure and names the published mailbox', () => {
    expect(existsSync(path.join(root, 'SECURITY.md'))).toBe(true);
    expect(read('SECURITY.md')).toContain('security@catalystlab.tech');
  });

  it('makes firestore.rules deployable', () => {
    const cfg = JSON.parse(read('firebase.json'));
    expect(cfg.firestore.rules).toBe('firestore.rules');
    expect(JSON.parse(read('.firebaserc')).projects.default).toBe('catalystlabhub');
    expect(existsSync(path.join(root, 'firestore.indexes.json'))).toBe(true);
  });

  it('carries no OSS licence on a private package', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.private).toBe(true);
    expect(existsSync(path.join(root, 'LICENSE'))).toBe(false);
  });

  it('keeps captured dumps out of the repository root', () => {
    for (const f of ['audit-output.txt', 'SEO-AUDIT-2026-10-23.md', 'SEO-AEO-AUDIT-2026-10-23.md', 'PROGRAMMATIC-SEO-2026-10-23.md']) {
      expect(existsSync(path.join(root, f)), `${f} must be filed under docs/audit or archive/`).toBe(false);
    }
  });

  it('names a route the server actually serves in the load-test instructions', () => {
    for (const f of ['scripts/run-loadtest.mjs', 'ops/loadtest/k6-peak.js']) {
      expect(read(f)).not.toContain('/api/audit/run');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/server/repoHygiene.test.ts` — Expected: FAIL (all five).

- [ ] **Step 3: Create the artefacts and move the files**

`SECURITY.md`: supported-versions table (current `2.4.x`), "report to `security@catalystlab.tech` (do not open a public issue)", 72-hour acknowledgement, the existing scope list (JWT/id-token handling, SSRF guard, payment webhooks, rate limiting, Firestore rules) taken verbatim from `docs/security/review-2026-10.md` §2 titles.
`firebase.json` + `.firebaserc` + `firestore.indexes.json` as specified in Interfaces.
`git mv` the four dumps; add a row per moved document to `docs/README.md`'s dated-records table and a line to `archive/README.md`.
Replace the stale route mentions in `scripts/run-loadtest.mjs` and `ops/loadtest/k6-peak.js` comments with `POST /api/run-engine` (comments only — the executable code already posts there).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/server/repoHygiene.test.ts` → PASS (5 tests).
Also `npm run build && node scripts/verify-deployment.mjs` unaffected; `npx prettier --check firebase.json` is unnecessary (no Prettier in this repo) — instead confirm `node -e "JSON.parse(require('fs').readFileSync('firebase.json'))"` succeeds.

- [ ] **Step 5: Commit**

```bash
git add SECURITY.md firebase.json .firebaserc firestore.indexes.json docs/README.md archive README.md docs/audit scripts/run-loadtest.mjs ops/loadtest/k6-peak.js src/tests/server/repoHygiene.test.ts
git commit -m "chore(repo): add disclosure policy and Firebase deploy config; file captured dumps"
```

---

### Task 10: Full-gate sweep and knowledge-doc refresh

**Files:**
- Modify: `docs/codebase/CONCERNS.md` §1 (statuses), §5 (churn note), §7 (verification log), `docs/codebase/STACK.md` §5, `docs/codebase/TESTING.md` §6 (new test counts)
- Modify: `README.md` (test/coverage numbers + the gate list)

**Interfaces:**
- Consumes: every prior task; `npm run ci:full`.
- Produces: a recorded green run; no code changes.

- [ ] **Step 1: Run the full local gate**

```bash
npm run ci:full 2>&1 | tee /tmp/ci-full.log; echo "exit=$?"
```
Expected: exit 0 through `check:env` (42 keys), `check:colors`, `lint`, `typecheck`, `test`, `build`, `check:bundle`, `check:deps`, `test:coverage`, `drill:restore`, `test:payments-sandbox`, `sec:secrets`.

- [ ] **Step 2: Run the gates that need a built host**

```bash
npm run media:check; echo "media exit=$?"
```
Expected: SKIP, exit 0. Then confirm the e2e leg is installable in CI only (`npx playwright install --with-deps chromium` is a CI step); do not run it here if browser download is blocked — record `[TODO]` instead.

- [ ] **Step 3: Update the knowledge docs with measured numbers**

Record the exact test count/files and coverage percentages printed by Step 1 in `docs/codebase/TESTING.md` §6 and `README.md`; flip risks 1, 3, 5, 7, 9 and 10 in `docs/codebase/CONCERNS.md` §1 to **resolved** with the command that proves it; move each resolved `[ASK USER]` question in §6 to an "answered — see plan decision log" line referencing `docs/superpowers/plans/2026-11-12-repo-hardening-ci-integrity.md`.

- [ ] **Step 4: Commit**

```bash
git add docs/codebase README.md
git commit -m "docs: record the green gate sweep and close the resolved concerns"
```

---

## Self-Review (run by the plan author)

1. **Spec coverage** — all 10 `[ASK USER]` questions from `CONCERNS.md` §6 map to tasks: #1→T1, #2→T2, #3→T3, #4→T8, #5→T4, #6→T5, #7→T6, #8→T9, #9→T9, #10→T7. Risks 2 (`.nvmrc` references) and 4 (engine floor) are covered by T1's third test. Risk 6 (duplicate health route) → T4. Risk 9's deferred binary captures are explicitly out of scope and remain `[TODO]`. No uncovered requirement.
2. **Step scan** — every step names a command, an expected result, or an exact file/signature. No "handle edge cases"/"write tests" steps. Code bodies appear only where the signature and tests do not determine them (`collectBareRequires`, `summarize`, the authz predicate).
3. **Type consistency** — `isDemoSeedAllowed()` (T5) is the only new server export and is used only in `server/routes/github.ts`; `collectBareRequires(source: string): string[]` (T6) is used by exactly one test; `summarize(results): 'pass' | 'skip' | 'fail'` (T8) likewise. Route/shape names match existing code (`{ success, error }`, `requestId` from `requestLoggingMiddleware`).
4. **Review Focus** — 7 lines, each pinned: Node floor → T1; workflow file resolution → T1; CDN blip vs 404 → T8; anonymous health shape → T4; staging seeding → T5; engine error reflection → T7; `npm start --omit=dev` → T6.
5. **Proportion** — the plan is ~1.2× the length of the concerns spec it implements and contains no application bodies beyond four small pure functions; the rest is commands, assertions and file moves.
