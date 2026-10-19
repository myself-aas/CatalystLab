# Performance audit tools (perf-rendering-2026-10)

Scripts used for the measurements in `../01-measurements.md`. They drive a
headless Chromium through `@sparticuz/chromium` + `puppeteer-core` (and
`lighthouse` for `lh.mjs`) against a running production build.

## Setup (outside the repo's dependency tree)

```bash
mkdir -p /tmp/perf && cd /tmp/perf
npm init -y
npm install @sparticuz/chromium puppeteer-core lighthouse
# copy the .mjs files from this folder into /tmp/perf and run from there
```

Chromium needs the Amazon Linux libraries that `@sparticuz/chromium` ships
(`bin/al2023.tar.br`). `measure.mjs`, `diag.mjs`, `ab2.mjs`, `lh.mjs`, and
`devwarn.mjs` extract them into `/tmp/al2023` at startup.

## Run

```bash
# production build served by the app
cd /home/user/CatalystLab && NODE_ENV=production npm run build && NODE_ENV=production node dist/server.cjs   # port 3000
# dev server for React warnings
npx vite --host 0.0.0.0 --port 3001 --strictPort                                                         # port 3001

node measure.mjs     # load metrics, long tasks, resource sizes, mouse + scroll burst per route
node diag.mjs        # A/B: global mousemove listener on vs blocked; /blogs layout-shift sources; failing responses
node ab2.mjs         # A/B: backdrop-filter off, ambient layer hidden, blob animation off (CLS + scroll frames)
node lh.mjs          # Lighthouse, desktop + mobile (PRESETS=desktop ROUTES=/ to limit)
node devwarn.mjs     # React warnings/errors on the dev server (port 3001)
node import-graph.mjs  # static import graph from src/main.tsx (run from the repo root)
```

`RESULTS_DIR` selects the output folder (defaults to the current directory).
`BASE` (measure.mjs) selects the origin.

## Caveats

- The sandbox CPU is slow and has no GPU (software compositing). Absolute
  timings are inflated. Compare the A/B variants with each other, not against
  real-device numbers.
- Google Fonts, Firestore, and Pexels are unreachable from the sandbox. Their
  requests fail quickly, which removes their real network cost from the numbers.
- Lighthouse desktop on `/` produced no performance score (`NO_SCREENSHOTS`).
  Its FCP, LCP, and TBT values are still valid.
