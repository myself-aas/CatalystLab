# Storylines — Catalyst Telemetry hero launch film

Target: ~30s, 1920×1080@30, silent delivery (hero autoplays muted).
All facts traceable to the repo: H1/subline/CTAs from `src/components/home/HeroSection.tsx`;
42 edge PoPs, 8 engines (`src/lib/nodeEngines.ts`), p95 24.13 ms, 20 visitor units/day demo datum.
Real UI source: live dev server at :3000 (light mode is the shipped default), captured via `npx hyperframes capture`.

## Sketch (6 ideas)

1. **One Request, 42 Answers** — follow one real audit from URL → edge → report. (chosen, A)
2. **The Audit Form Is a Door** — never leave the hero; infinite zoom into the form, worlds inside. (merged portal feel into A)
3. **24 Milliseconds, Stretched** — the film is a stopwatch; replay p95 at 1000×. (chosen, bold C)
4. **Eight Engines, One Sentence** — engine list assembles into a sentence. (chosen, B)
5. **Before/After Split World** — guessing marketer vs knowing engineer. (dropped: stock contrast)
6. **The Cursor Knows** — oversized cursor as performer/narrator. (device folded into A)

---

## RECOMMENDED — A: "One Request, 42 Answers"

*Recommended because it literally shows the hero's own promise: one real URL traveling through the real edge and returning as a real report.*

- **Device:** the journey of one datum — the typed domain URL is the protagonist; the oversized cursor is the only character.
- **Form:** kinetic travelogue through real captured UI; containers morph (form → results), worlds entered through on-screen objects (engine tiles).
- **Viewer sees:** a real domain dropped into the real audit form, the request fanning out across 42 PoPs, engine results assembling into one scrolling report.
- **Viewer feels:** momentum and trust — the product is fast, thorough, and obviously real (no invented dashboards).
- **First 2 seconds (densest, frame 0 = thumbnail):** frame 0 is the real hero, already alive — 42 small result tiles raining onto the white canvas around the audit form while the p95 "24.13 ms" stamp lands hard in cobalt; no fade-in from black, no typing opener, no logo-alone.
- **Beats:** hook = tiles rain + p95 stamp (0–2.4s) → tension = cursor drops "your-domain.com" into the real form, presses **Audit Now** (2.4–6s) → reveal = form morphs outward, real H1 "Meet the all-new Catalyst Telemetry" + subline title card, mark carried in (6–8.4s) → proof = request travels: PoP fan-out moment, then 3–4 engine worlds entered through their tiles (headers / timing / screenshot / DNS), one verb each, real captures at ~1.8× (8.4–20s) → payoff = full report scrolls past, verdict line locks: p95 24.13 ms, 42 PoPs, 8 engines (20–26s) → claim = real subline, three beats: "More engines. More dimensions. More edge intelligence." (26–28.4s) → end card = Catalyst mark at ~20% frame width performed (assembled from report fragments), CTA "Audit Now — catalystlab.tech" held 2s (28.4–31s).
- **Look:** the shipped light Meta system — #FFFFFF canvas, #1C1E21 ink, #0064E0 cobalt accent, #CED0D4 hairlines; real UI at 1.6–2×, text ≥26px, cursor ~5% of frame, 3–5 transition kinds (morph, wipe-through-tile, match-cut, whip).
- **Sound (silent delivery; note only):** key-tick on the domain landing, one whoosh on Audit Now press, soft pop per engine tile one frame after it appears, single riser into the reveal, no synthesized tones, no music (add a licensed track later via HeyGen Studio or a local file).

---

## B: "Eight Engines, One Sentence"

- **Device:** a list that becomes language — typography over real captures.
- **Form:** editorial montage; split canvas — ink type on one side, live UI capture on the other; words and results alternate on a shared baseline.
- **Viewer sees:** the eight engine names stamping in one by one, each handing off to one real captured result and one verb, until a single sentence stands on screen.
- **Viewer feels:** precision and craft — an instrument catalogued, not a product hyped.
- **First 2 seconds:** frame 0 = eight engine-name stamps mid-slam on white (hard cuts, 2 already inked, motion blur on the third), a hairline baseline drawing left→right under them; dense, graphic, instantly "eight of something".
- **Beats:** hook = stamps (0–2.4s) → tension = "what do they say together?" — baseline extends into an empty sentence with gaps (2.4–6s) → reveal = H1 title card, mark carried by the baseline (6–8.4s) → proof = 4 engines get verb + real capture each, filling sentence gaps (8.4–20s) → payoff = the complete sentence reads as the product claim, report capture behind it (20–26s) → claim = subline (26–28.4s) → end card = mark + CTA held 2s (28.4–31s).
- **Look:** white canvas, ink display type, JetBrains Mono for all data, cobalt reserved for verbs; captures at 1.6×, hairline rules everywhere, zero glow/particles.
- **Sound:** dry tick per stamp, paper-flip per capture swap, one soft chime on sentence completion (silent delivery; music optional later).

---

## C (bold): "24 Milliseconds, Stretched"

- **Device:** time manipulation — the film itself is the measurement.
- **Form:** one continuous stopwatch run of a real audit, then the p95 replayed at 1000× so you can walk through 24 ms like rooms in a building.
- **Viewer sees:** a giant mono timer racing through a real audit at full speed, freezing at 24.13 ms, then the same instant unfolded slow — each engine's work a slow-traversed room of real UI.
- **Viewer feels:** awe at a number made physical; the boldness is that the entire film obeys one measured fact.
- **First 2 seconds:** frame 0 = macro-tight real capture of the **Audit Now** button under the oversized cursor at the exact press, big cobalt mono timer already reading 00.000 and starting; button ripple frozen mid-frame — the densest, most "mid-event" opening possible.
- **Beats:** hook = press + timer start (0–2.4s) → tension = timer races, real captures flash at speed as phases tick (UI → edge → engines) (2.4–6s) → reveal = timer slams to a freeze at p95 24.13 ms; title "Catalyst Telemetry" + mark (6–8.4s) → proof = "24.13 ms at 1000×" — walk the stretched time: 4 slow rooms, one per engine, real captures panned at 1/1000 speed-feel (8.4–20s) → payoff = snap back to real time — the full report already on screen, cursor barely moved (20–26s) → claim = subline (26–28.4s) → end card = mark + CTA held 2s, timer shows the film's own runtime as it freezes (28.4–31s).
- **Look:** white canvas dominated by mono numerals, cobalt timer, speed-blur only on timer transitions, rooms framed by hairlines; no dark void, no glow.
- **Sound:** one tick per timer second, deep single whoosh at the freeze, room-tones as soft pops, snap-back as one crack (silent delivery; a clockwork music bed could be added later).
