# SPEC — "One Request, 42 Answers" (Storyline A)

GOAL:    The viewer believes one URL audits the whole edge — and wants to press Audit Now on their own domain.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, silent delivery (hero autoplays muted).
TIME:    31 s x 30 = 930 frames. No music; rhythm = a new event every 2-4 s, hard shot changes, cuts land on stamp/press impacts.

LOOK:
  ground:   #FFFFFF flat (the shipped light canvas). Wells/panels #F1F4F7. Hairlines #CED0D4, 1 px, everywhere structure is needed.
  ink:      #1C1E21 for every read word and every structural line.
  accent:   #0064E0 cobalt (the shipped --color-buy). May appear ONLY on: the p95 stamp, one focus word per shot, the counter/hero digits, the verdict digits, the claim word "edge". Never as gradient, glow, or background wash. (Captured truth: the shipped ds-btn-primary "Audit Now"/"Run Instant Audit" pills are ink-black in light mode, not cobalt — the film keeps them exactly as shipped.)
  display:  Inter variable, weight 700-800, title card 96 px, tracking -0.03em. Claim beats 88 px w800.
  body:     Inter variable 400/500, never below 28 px on 1080 (UI captures are shown at 1.6-2.0x so their own text lands >= 26 px).
  data:     JetBrains Mono variable 500-700 for ALL numbers (24.13 ms, 42, 8, 92, 100/90/80/100, 85/15, jitter ms).
  medium:   real product UI (headless captures of the app at :3000 in light mode) + instrument typography. Cards float on white with one shadow: offset-y 24 px, blur 48 px, rgba(28,30,33,0.10). No contact shadows, no 3D.
  light/depth: flat key (UI medium), grain 0%, vignette 0%. Depth comes from card shadow + z-order only.
  fonts:    bundled at /assets/fonts/inter-latin-wght-normal.woff2 and /assets/fonts/jetbrains-mono-latin-wght-normal.woff2 (variable, @font-face in root).

OBJECTS (everything must read without a label):
  audit form:      the real hero form — sr-label "Domain URL to audit", input with placeholder "https://your-domain.com", cobalt "Audit Now" button, ghost "Explore engines". Captured live, shown at 1.8x.
  oversized cursor: OS arrow, #1C1E21 fill, 3 px #FFFFFF outline, drop shadow (0 4px 8px rgba(28,30,33,.25)), 96 px tall = 5% of frame width. The only character.
  p95 stamp:       "24.13 ms" JetBrains Mono 700, 120 px, cobalt on white inside a 2 px cobalt hairline box, 2-frame impact overshoot (spring, damping 0.55, scale 1.15 -> 1.0).
  42 PoP tiles:    42 hairline chips (#F1F4F7 fill, #CED0D4 1 px border, mono index 01-42), 96x56 px each, raining in on a 2-frame stagger, arranged as a fan-out arc over a captured hero base.
  engine worlds:   four of the eight canonical engines (src/lib/nodeEngines.ts), each = real engine name + real data shapes on hairline instrument cards, interleaved with real captures where the app renders them:
                   1. Website Health — headers HSTS/X-Frame/CSP/MIME present-dots, SSL Valid 92, Days Left 8, W1-W4 LCP 2.3/1.9/1.6 + FID.
                   2. Edge Latency Radar — region jitter US-East 12 / US-West 48 / EU-Central 35 ms, p95 24.13 ms, 42 PoPs.
                   3. AI Readiness — crawlers GPTBot 100 / Claude 90 / CCBot 80 / Perplexity 100, token split Body/Header/Footer/Nav.
                   4. Eco-Carbon — Renewable 85 / Grid-Fossil 15, CO2 split Images/Video/JS-CSS/HTML.
                   One verb each, mono, <= 1 word: "measures", "pings", "reads", "weighs".
  verdict line:    "p95 24.13 ms  ·  42 PoPs  ·  8 engines" — mono, ink, cobalt digits, hairline box.
  catalyst mark:   the real /public/logo-mark.svg, end card at 384 px = 20% of frame width, assembled (converged) from report fragments, never docked.
  title card:      real H1 "Meet the all-new Catalyst Telemetry" (96 px, 2 lines: "Meet the all-new" / "Catalyst Telemetry") + real subline "More engines. More dimensions. More edge intelligence." (40 px, #55595E-ish secondary ink = color-mix ink 65% white).

MOTION:
  enter:   power4.out, 11 f (360 ms). move: power2.inOut, 18 f. exit: power2.in, 7 f. camera push: power1.inOut, 27 f.
  springs: damping 0.55 on scale/position only (stamp, click press) — never on opacity or colour.
  staggers: tile rain 2 f; claim beats hard-cut, no stagger.
  one hero move per shot; secondary moves travel 50-70% as far, start 100-200 ms (3-6 f) later; everything else holds still.
  text meant to be read never moves while read; titles stop dead on landing (no drift).

SHOTS (frame ranges; each hands off through a real object):
  S1 hook      0-72    frame 0 = densest: captured hero at 1.0x ALREADY alive, 42 tiles mid-rain (12 landed), p95 stamp lands f6 with impact. Hero move: stamp. Read: "24.13 ms" (window f6-72). Handoff: last tile lands f70 -> whip-wipe into form close-up.
  S2 tension   72-180  real form at 1.8x on white. Cursor enters f78 (move), domain "your-domain.com" types into the input f96-126 (2 f/char, key-tick placement), cursor presses Audit Now f150 (2 f depress, ripple), button holds pressed to f180. Handoff: ripple expands past frame -> white morph.
  S3 reveal    180-252 form container morphs outward into the title card; H1 lands f186-197 (enter ease), subline f204; mark carried in FROM the button position f180-210 (morph, not fade). Read: title 6 words held >= 2.3 s (f197-252). Handoff: subline's "edge intelligence" underlines -> line extends into fan-out hairlines.
  S4 proof     252-600 (a) fan-out 252-336: URL chip center, hairlines draw to a 42-tile arc, mono counter 01->42 ticks in sync. (b) engine worlds 336-600, 66 f each, entered through their tile via match-cut: Health 336-402 "measures", Edge Radar 402-468 "pings" (jitter bars 12/48/35), AI Readiness 468-534 "reads" (crawler scores), Eco-Carbon 534-600 "weighs" (85/15 ring). Each world: one real-data card set at 1.6x, hero move = the card's signature number counting/landing.
  S5 payoff    600-780 full captured report/dashboard UI scrolls vertically at 1.6x (scroll 400 px/s), verdict line locks f720 with stamp spring, holds f720-780. Handoff: verdict box closes like a lid -> cut.
  S6 claim     780-852 three hard-cut beats, 24 f each: "More engines." / "More dimensions." / "More edge intelligence." 88 px w800 ink; cobalt only on "edge". Static while read.
  S7 end card  852-930 report fragments converge f852-882 into logo-mark 384 px centered; CTA "Audit Now — catalystlab.tech" mono 40 px lands f888, held f888-930 (>= 1.5 s). Mark performed (assembled), never docked, never alone on black.

BANNED: skill defaults (dark void, glow/bloom/particles, purple/blue gradients, glass cards, cream-paper-serif, everything fade+slide-up, everything centred, drifting titles, corner brackets/HUD decoration, three-cards-in-a-row, KPI grids, title over dimmed screenshot, docked logo) PLUS: invented dashboards or numbers not in the repo; the four engine worlds shown as a grid in one frame (always sequential); cobalt on more than one focus per shot; typing as the FILM's first 2 seconds (it happens in S2 only); "in seconds", "unlock", "seamless", "supercharge"; any audio (silent delivery); black frames at head or tail.

SOUND (silent delivery — placement map for a later audio pass): key-tick per typed char (S2), one whoosh on Audit Now press (f150), soft pop per tile one frame AFTER it appears (S1, S4a), single riser into reveal (f180-197), one tick per counter step (S4a), deep single hit on verdict lock (f720), crack on snap-back not used (no time device in A). No synthesized tones as music, no music bed.

QA (snapshot frames, each must read as a finished poster):
  f0   densest thumbnail: stamp + mid-rain tiles + real hero visible; not black, not logo-alone.
  f60  rain near-complete, stamp locked, hero base readable.
  f150 cursor mid-press on Audit Now, typed domain visible in input (>= 26 px effective).
  f216 title fully landed, subline present, mark visible at morph end.
  f300 fan-out mid-draw, counter digits readable (mono, cobalt).
  f402 first engine world: "Website Health" + "measures" + real header dots legible.
  f690 verdict line locked: 24.13 ms / 42 / 8 all readable.
  f900 end card: mark 20% width, CTA readable, nothing docked.

REAL-UI SOURCES: live dev server http://localhost:3000 (light default): "/" hero+#audit-form, "/audit", "/products", "/user-dashboard", "/ai-readiness" — captured via `npx hyperframes capture` into assets/captures/. Brand: /public/logo-mark.svg, /public/logo.svg. Data shapes: src/lib/nodeEngines.ts (canonical). Copy: src/components/home/HeroSection.tsx.
