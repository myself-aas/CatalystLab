# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyone who ships or vouches for a website: engineering teams auditing their own
properties, agencies and freelancers auditing client sites, and solo developers
running fast self-serve checks. (Confirmed by the product owner, 2026-10-21:
"all of the above" — design for the solo developer's speed and the team's depth.)

## Product Purpose

CatalystLab runs multi-dimensional web-health audits — Core Web Vitals, OWASP
transport security, WCAG accessibility, AI/LLM readiness, carbon, and edge
performance — across eight diagnostic "enzyme" engines, and turns the results
into telemetry a team can act on. Success is a visitor running their first audit
within seconds of arriving, then trusting the readings enough to return, share
the report, or upgrade.

## Positioning

A biochemistry-flavoured telemetry laboratory, not another generic SEO checker:
named engines perform named assays (VitalZyme, RiskProtease, LLMKinase,
EdgeVmax, EcoHolo, SynthShift, GitLygase, Alloster) against a domain and report
instrument-grade readings across 42 edge nodes.

## Constraints & Facts to Preserve

- Eight engines and their names/hues are product truth (see
  `src/styles/card-tokens.css` `--hue-*`).
- Quota/rate-limit states (RateLimitBadge/Modal) are core UX, not chrome.
- Free tier exists; pricing tops at $199 (index.html structured data).
- Accessibility is a feature the product sells — the product itself must meet
  WCAG AA (see DESIGN.md).

## Open Decisions

- Whether agency white-label reporting is a first-class workflow or a tier perk.
