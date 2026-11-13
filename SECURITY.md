# Security Policy

CatalystLab ships a public audit surface, so we want reports to reach us before
they reach anyone else. This file is the contract for doing that.

## Supported versions

Only the current release line receives security fixes. The project is distributed
as a private application, not as a package, so "supported" means "deployed".

| Version | Supported |
| --- | --- |
| `2.4.x` (current) | ✅ |
| `< 2.4` | ❌ |

## Reporting a vulnerability

**Email `security@catalystlab.tech`.** Please do not open a public issue, a public
pull request, or a discussion thread for a suspected vulnerability.

Include, as far as you can:

- the affected URL, route or screen, and the version or commit you tested;
- the steps to reproduce, with the request/response pair or a screen recording;
- what an attacker gains (data read, data written, quota consumed, availability);
- any proof-of-concept code, and whether you intend to publish it.

## What to expect

| Stage | Target |
| --- | --- |
| Acknowledgement of your report | within **72 hours** |
| Initial triage and severity assessment (CVSS v3.1) | within **7 days** |
| Fix or documented mitigation for High/Critical | within **30 days** |
| Public credit, if you want it | coordinated with you at disclosure |

We will keep you informed at each stage and will tell you plainly if we decide a
report is out of scope or not a vulnerability. We do not pursue legal action
against researchers who act in good faith, stay within the scope below, avoid
privacy violations and service degradation, and give us reasonable time to fix
the issue before publishing.

## Scope

In scope, in the terms used by the October 2026 review
([`docs/security/review-2026-10.md`](docs/security/review-2026-10.md) §2):

- **Identity and token handling** — Firebase ID-token verification, the
  `requireIdentity` / `requireSuperadmin` gate, superadmin custom-claim checks
  (SEC-2026-01, SEC-2026-07).
- **The SSRF guard** — `src/lib/networkSecurity.ts` URL validation, DNS-rebinding
  pinning in the TLS probe, and any path that reaches the network with a
  user-supplied URL (SEC-2026-03).
- **Payment and webhook integrity** — signature verification, replay windows,
  idempotency and retry handling on the checkout and GitHub webhook routes
  (SEC-2026-08).
- **Rate limiting and quota accounting** — per-IP and per-key limiters, the
  leftmost/rightmost `X-Forwarded-For` trust model, tier budgets (SEC-2026-02,
  SEC-2026-06).
- **Firestore rules** — `firestore.rules`, and anything that lets an
  unauthenticated client read or write another tenant's documents.
- **Log and error hygiene** — credential or header leakage through structured
  logs, error bodies, or client-visible exception text (SEC-2026-04).

Out of scope: findings that require a compromised developer machine or CI
credential; volumetric denial of service against the hosting provider; missing
"best practice" headers with no demonstrated impact; reports produced solely by an
automated scanner without a working proof of concept; and social engineering.

## Disclosure policy

We follow coordinated disclosure: we will agree a publication date with you, and
we ask that you do not publish details before a fix (or a documented mitigation)
is available. If we cannot agree a date, we will publish our own advisory and
credit you unless you ask us not to.

## Related reading

- [`docs/security/review-2026-10.md`](docs/security/review-2026-10.md) — the
  findings register this policy's scope is drawn from.
- [`docs/codebase/CONCERNS.md`](docs/codebase/CONCERNS.md) — the live risk
  register, including open security items.
- [`docs/ops/runbook.md`](docs/ops/runbook.md) — incident response and rollback.
