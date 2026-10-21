# Shape Brief — Hero (MasterAuditPage)

> **Status (2026-10-21): dated record — kept verbatim as evidence, not rewritten.** Dated creative brief. As shipped (verified 2026-10-21), `MasterAuditPage` mounts [`HeroSection`](../src/components/home/HeroSection.tsx) standalone — the marquee-base-strip / cover-flow composition described here is not mounted on any page (`PartnerMarquee` and the cover-flow carousel have no page importers). Kept as design rationale.

*Produced by `$impeccable shape`. Discovery answers confirmed by the product
owner on 2026-10-21; implemented in the same pass at their instruction
("run these all at once").*

1. **Job and audience:** A first-time visitor (solo dev, team engineer, or
   agency) arriving cold must understand in one line what CatalystLab measures
   and be able to act on it without scrolling. Visitor mode: **Persuade**.
2. **Outcome and proof:** Primary action = *run an audit now* (owner-confirmed,
   over "understand first" and "proof first"). Success = audit URL submitted.
   Proof (the eight engine auditors) supports the action, it does not precede it.
3. **Selected direction:** The incumbent Mission Control world (DESIGN.md).
   Visible H1 in the display face, one supporting sentence (≤65ch), the audit
   form as the hero's single authored moment, preset domains as one-tap trials,
   the auditor carousel demoted to supporting proof below, partner marquee as
   the base strip. No eyebrow/kicker above the heading (craft-floor ban).
4. **Scope and boundaries:** `HeroSection` only. Carousel component, marquee,
   navigation, and all sections below are untouched. Anti-goal: no new claims,
   stats, or testimonials — copy is the previously sr-only text, now visible.
5. **States and ranges:** Empty URL submits nothing; preset chips fill *and*
   launch; reduced-motion disables carousel autoplay and scroll fade; mobile
   stacks form vertically with 44px targets; long URLs truncate in the input,
   never the layout.
6. **Interaction and layout:** Headline → action → proof, top to bottom, centre
   measure for the pitch, full-width instrument strip below. Keyboard: form is
   native input + buttons in DOM order.
7. **Constraints:** WCAG AA contrast on the scrim, `hero-audit-url-input` id
   preserved (MasterAuditPage autofocuses it), tests updated to the new
   composition rather than weakened.
