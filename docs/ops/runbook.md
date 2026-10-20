# CatalystLab operations runbook

Owner decisions this runbook implements: **D3** (split hosting), **D16** (SLO
targets and recovery objectives), **Q31** (Cloudflare Worker `/api` proxy),
**Q32** (zero-budget API host), **D10** (Sentry error tracking), **Q20**
(72-hour breach notification), **D9/Q26** (retention).

Single-operator service. There is no on-call rotation: the monitored mailboxes
`legal@catalystlab.tech` and `support@catalystlab.tech` are the escalation path,
and severity 1 work starts immediately.

---

## 1. Topology

```
                        Cloudflare (apex zone)
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   www.catalystlab.tech     catalystlab.tech/*        /api/* (Worker route)
   Cloudflare Pages         301 → www                     │
   (static frontend,        (public/_redirects)           ▼
    prerendered shells)                            Node API host
                                                   dist/server.cjs
                                                          │
                       ┌──────────────┬──────────────────┼───────────────┐
                       ▼              ▼                  ▼               ▼
                   Firestore      MongoDB           Upstash Redis     Sentry
                   accounts,      telemetry         rate limits +     errors
                   api keys,      (time-series)     daily quota       (optional)
                   subscriptions
```

| Layer | Host | Why |
| --- | --- | --- |
| Static frontend | Cloudflare Pages, free tier | D3 (b). `dist/` from `npm run build`, including the prerendered route shells, `_redirects` and `_headers`. |
| `/api/*` proxy | Cloudflare Worker route on the apex zone | Q31 (a). Keeps the browser same-origin; forwards the real client IP. |
| API + SSR host | Oracle Cloud Always Free, 2 OCPU / 12 GB | Q32. Documented fallback: Render Free (cold starts, so expect a slow first request). |
| Account data | Google Firebase (Auth + Firestore) | Existing dependency, free tier. |
| Telemetry | MongoDB time-series collection | Existing dependency; retention enforced by TTL index + sweep. |
| Rate limits / quota | Upstash Redis when configured | Falls back to per-process memory counters, which reset on restart. |
| Error tracking | Sentry, only when `SENTRY_DSN` is set | D10. Browser errors relay through `POST /api/client-logs`. |

Paid checkout stays **off** until plan items 4.1 and 4.6 and the webhook retry
test pass (Q32). `PAYMENT_GATEWAY` unset or an unconfigured signing secret
makes `/api/v1/payments/checkout` answer `503 PAYMENTS_NOT_CONFIGURED`.

---

## 2. SLOs and recovery objectives (D16)

| Objective | Target | Measured how |
| --- | --- | --- |
| Availability | **99.5 %** over a rolling 30 days | Successful `/api/health` checks; a 5xx or a timeout counts as down. Budget: ~3.6 hours per 30 days. |
| RPO | **24 hours** | Firestore export age and MongoDB snapshot age. |
| RTO | **4 hours** | Time from a declared severity 1 to the service answering again, including a redeploy or a restore. |
| Latency | Set after the load test in plan item 10.3 | p95 for `/api/v1/audit/master/stream` first byte and for `/api/health`. Not published until measured. |

These are **internal** targets. The Terms of Service deliberately promise no
uptime commitment and no service level agreement (see the availability clause);
do not turn an SLO into an SLA in customer-facing copy without an owner decision.

When the availability budget is spent: stop shipping features, fix the reliability
cause, and record what happened in the incident log below.

---

## 3. Deploy

Frontend and API deploy independently.

```bash
npm ci
npm run ci            # check:env, lint, typecheck, tests, build (+ prerender), bundle budget
npm run test:coverage # ratchet gate: thresholds in vitest.config.ts may only go up
npm run lhci          # Lighthouse CI against ./dist (answer #12)
```

1. **Frontend (Pages):** upload `dist/`. `scripts/prerender.ts` has already
   written `dist/<route>/index.html` for every indexable route, `dist/404.html`
   (served with a real 404 status, D11), `dist/sitemap.xml` and
   `dist/routes.json`. Verify after deploy: `curl -I https://www.catalystlab.tech/pricing`
   is a 200 with `rel="canonical" …/pricing`, and `/nope` is a 404.
2. **API host:** copy the build, `npm ci --omit=dev`, then
   `PORT=<port> NODE_ENV=production node dist/server.cjs` under a process
   supervisor (systemd unit or `pm2`). Confirm `/api/health` returns 200 and
   that the startup log shows `[errors] Sentry error tracking …` matching
   whether `SENTRY_DSN` is set.
3. **Rollback:** Pages keeps the previous deployment — promote it. On the Node
   host, redeploy the previous commit and restart; there is no database schema
   step to undo except the TTL index, which is idempotent.

Environment variables: `.env.example` is the authoritative list. `APP_ORIGIN`
must equal `https://www.catalystlab.tech` in production; `check:env` fails the
build otherwise.

---

## 4. Incident response

| Severity | Definition | Response |
| --- | --- | --- |
| 1 | Site down, data loss, or a confirmed personal data breach | Immediately. Declare, mitigate, then write the incident note. A personal data breach also starts the **72-hour** supervisory-authority clock (Q20). |
| 2 | A core flow broken (audit stream, sign-in, checkout webhook) but the site is up | Same day. |
| 3 | Degradation, wrong copy, a failing non-blocking check | Next working day. |

Steps for a severity 1:

1. Check `/api/health` and the Sentry issue list. If Sentry is not configured,
   read the host logs: `journalctl -u catalystlab -n 500 --no-pager`.
2. Mitigate first: roll back the last deploy, or restart the process. Do not
   debug in production while the SLO burns.
3. If personal data is involved: identify the categories and approximate volume
   of records, notify the supervisory authority **within 72 hours** of becoming
   aware, and notify affected users without undue delay where the risk is high
   (privacy policy, security section).
4. Record in `docs/ops/incidents/<date>-<slug>.md`: timeline, impact, root cause,
   action items with owners and dates.

---

## 5. Known failure modes

| Symptom | Cause | Action |
| --- | --- | --- |
| Every analytics route answers `503 Service temporarily unavailable (database offline)` | `MONGODB_URI` unset or unreachable; `initAnalyticsDB()` returns null | Set the URI and restart. Telemetry is dropped while offline by design; nothing queues. |
| `503 OWNERSHIP_STORE_UNAVAILABLE` on a per-domain read | Firestore unreachable | Check Firebase status and the service account. Domain access fails closed (D4). |
| `503 PAYMENTS_NOT_CONFIGURED` on checkout | `PAYMENT_SIGNING_SECRET` or gateway env missing | Intentional until plan 4.1/4.6 pass (Q32). Do not enable checkout to "fix" this. |
| `401` on a webhook | Signature mismatch | Compare the provider secret with `PAYMENT_SIGNING_SECRET`; the route rejects and logs the event id. |
| `429` spikes on the audit stream | Daily quota exhausted for the tier | Expected. Quota resets at UTC midnight; the ledger lives in Upstash when configured (`catalystlab:quota:<date>:<id>`). |
| Quota counters reset early | Upstash not configured, so counters are per-process | Configure Upstash for production; memory counters are a fallback only (answer #1). |
| A TLS probe fails for a host on a non-standard port | Port restriction to 443 (answer #5) | By design. Do not widen the port range. |
| Prerendered page shows the wrong title or canonical | Stale `dist/` | Rebuild; `scripts/prerender.ts` runs as part of `npm run build`. |
| Browser errors missing from Sentry | `SENTRY_DSN` unset, or the client-log route rate limited (30 requests / 5 min per identifier) | Set the DSN; check for `429` responses on `/api/client-logs`. |

---

## 6. Routine operations

- **Retention (D9 + answer #2).** `ensureRetentionIndexes()` creates the
  730-day TTL index on the telemetry time-series collection at startup;
  `sweepExpiredDocuments()` runs at most once every six hours per process and
  deletes per-plan telemetry (14 / 60 / 90 / 365 / 730 days), Firestore contact
  messages after 365 days and payment events after 730. Verify monthly:
  `db.events.getIndexes()` shows `ttl_events_retention_cap`, and a manual
  `sweepExpiredDocuments({ now: Date.now() })` reports `deleted` and no errors.
- **Backups (RPO 24 h).** Firestore: scheduled export to Cloud Storage, daily.
  MongoDB: daily snapshot or `mongodump` to object storage. Test a restore once
  a quarter; an untested backup does not count toward the RPO.
- **Logs.** pino writes structured JSON to stdout; authorization headers are
  redacted before logging, and browser-captured logs are never persisted. Host
  log retention: 30 days (privacy policy, retention annex).
- **Secrets.** Only in the host environment or the CI secrets store. Never in
  the repository, never in a log line. Rotate `JWT_SECRET` and
  `PAYMENT_SIGNING_SECRET` by setting the new value and restarting; sessions
  signed with the old value stop working.
- **Dependency security.** `npm audit --omit=dev` weekly (plan item 3.10);
  update in a dedicated PR so a failing audit does not block a feature.

---

## 7. Cost posture

Everything above runs on free tiers: Cloudflare Pages and Workers (free),
Oracle Always Free (2 OCPU / 12 GB), Firebase Spark, MongoDB free tier, Upstash
free, Sentry developer tier. The monthly cost target is **$0** (answer #7). If a
free tier is exhausted, prefer raising a rate limit or shedding load over paying;
record the decision in `docs/plan/decisions.md` before spending anything.
