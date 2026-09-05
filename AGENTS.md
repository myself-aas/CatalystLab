# CatalystLab Agent Instructions

You are building components for CatalystLab, a premium, dark-mode-first developer tooling platform. The UI borrows heavily from high-end SaaS ecosystems (Vercel, Framer, Linear). You must strictly adhere to the following primitive variables, layout spacing formulas, and interaction physics. Do not invent new UI paradigms; use the established `ds-*` and `framer-*` class systems.

## 1. Global Layout & Canvas Architecture

Every page must sit atop the canonical layout shell to avoid overlapping with the sticky global transparent navigation bar.

**Page Wrapper Pattern:**
```tsx
return (
  <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground">
    <SEOHead title="..." description="..." />
    {/* Page Content */}
  </div>
);
```

**Spacing Modifiers (CRITICAL):**
*   `.ds-page-top`: Use on standard pages to provide perfect clearance under the HUD/Navbar `(var(--page-top-spacing))`.
*   `.ds-page-top-hero`: Use ONLY on landing/hero sections where you need an extra `1.25rem` clearance padding for visual breathing room.

**Backgrounds & Subsurface Glows:**
*   **Base:** `bg-background` (Pure Black `#000000`).
*   **Grid Scrim (Optional Ambient):** `bg-[radial-gradient(#222_1px,transparent_1px)] bg-[size:24px_24px] opacity-20`
*   **Radial Glow:** Use standard absolute divs with radial gradients to create subsurface ambient light.
    ```tsx
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,102,255,0.12)_0%,transparent_70%)] pointer-events-none" />
    ```

## 2. Typography & Type Scale (Tailwind Utilities)

Do not use raw text-sizing for core layout headings. Use the canonical `framer-*` type-scale utilities mapped in the global CSS:

*   **`.framer-hero-title`**: Primary page titles. (Massive, tracking `[-0.04em]`, leading `1.05`, bold).
*   **`.framer-section-headline`**: Secondary H2 headers `(text-3xl sm:text-4xl lg:text-5xl)`.
*   **`.framer-card-title`**: For standard bento grids and cards. `(text-lg sm:text-xl font-medium tracking-[-0.02em])`.
*   **`.framer-body-text`**: For all standard descriptive paragraph text. `(text-sm sm:text-base text-[#999999] leading-relaxed)`.
*   **`.framer-micro-tag`**: For small badge labels, table headers, eyebrows. `(text-[11px] font-mono tracking-[0.04em] uppercase)`.
*   **`.framer-code-terminal`**: For JSON/AST outputs or console simulation. `(font-mono text-xs text-[#00D2FF])`.

## 3. The `ds-*` Component Primitives

Never hand-roll borders, border-radii, or transitions for base components. Always use the canonical class architecture:

### Cards & Surfaces
*   `.ds-card`: Default static container. `(1px border var(--app-border), 1rem radius, bg-card)`.
*   `.ds-card-interactive`: Same as `ds-card` but adds a `160ms` hover physics translation `(translateY(-2px))` and border glow.
*   **Glassmorphism**: When a card overlays the main canvas, augment `ds-card` with `backdrop-blur-xl`.

### Buttons (160ms ease physics)
*   `.ds-btn`: Base button class (layout, gap, font-weight, transition).
*   `.ds-btn-primary`: Action button (`bg-[#0066FF] text-white`).
*   `.ds-btn-secondary`: Muted button (`bg-muted border-border`).
*   `.ds-btn-ghost`: Invisible until hover.

### Inputs & Forms
*   `.ds-input`: Text fields (`min-height 2.75rem, radius 0.65rem, bg-muted, border`).
*   `.ds-select`: Standard dropdown.
*   `.ds-label`: Form labels (Uppercase, mono, tracking `0.08em`, bold, text-muted-foreground).

## 4. Color Palette & Thematic Accents

Use the predefined CSS variables injected as Tailwind classes:
*   **Blue (Core CTA/Primary)**: `text-[#0066FF]` or `bg-[#0066FF]` (Framer Blue).
*   **Cyan (Edge/Telemetry)**: `text-[#00D2FF]` (Terminal text, mesh networking).
*   **Emerald (Vital/Success)**: `text-emerald-400` / `bg-emerald-500/10` (Uptime, Live status).
*   **Violet (Synthetics)**: `text-[#8A2BE2]` (AST diffs, schemas).
*   **Amber (Security/Warning)**: `text-[#FF9900]` (OWASP, RiskProtease).

*Rule:* Whenever displaying a "badge", use a 10% opacity background of the accent color and a 20% opacity border of the accent color.
```tsx
<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Live
</div>
```

## 5. React Motion (Animation Physics)

Framer Motion (`motion/react`) is the canonical animation engine. 
*   **NO standard CSS hover scaling**. If an element scales on hover, it MUST be wrapped in a `<motion.div>` or `<motion.button>`.

**Standard Spring Physics for Interactions:**
```tsx
<motion.button
  whileHover={{ scale: 1.035 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} // Canonical Framer-like snap curve
  className="ds-btn ds-btn-primary"
>
  Click Me
</motion.button>
```

**Standard Mount Fade (Scroll or Render):**
For elements that should gracefully mount, rely on `motion.div`:
```tsx
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
>
  {/* Content */}
</motion.div>
```

## 6. Tabs & Segmented Controls

Do NOT build complex external tab libraries. Use local state mapping with standard segmented visual buttons wrapped in a pill container:

```tsx
const [activeTab, setActiveTab] = useState<'payload' | 'schema'>('payload');

{/* Tab Container */}
<div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg font-mono text-xs">
  {(['payload', 'schema'] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={\`rounded-md px-3 py-1.5 transition-all \${
        activeTab === tab
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-muted-foreground hover:text-white'
      }\`}
    >
      {tab.toUpperCase()}
    </button>
  ))}
</div>
```

## 7. Icons

*   Always use `lucide-react` icons. 
*   Standard size is `size-4` (16px) or `size-5` (20px).
*   Add `shrink-0` to icons placed inside flex-rows with text to prevent them from squishing.

## 8. SDLC Skill Matrix (Required)

Every meaningful task must map to one or more lifecycle phases and use phase-specific skill sources.

| Phase | Required Skill Focus | Expected Deliverable |
|---|---|---|
| Planning | Requirements decomposition, constraints, acceptance criteria, risk identification | Clear task plan with explicit success criteria and risks |
| Designing | Architecture, API/data contracts, UX flow, component boundaries | Design notes with tradeoffs and interface decisions |
| Development | Feature implementation, refactor strategy, tests-first mindset | Minimal, correct code changes aligned to existing patterns |
| Responsiveness | Performance budgets, rendering efficiency, mobile/responsive behavior, accessibility checks | Verified responsive behavior and no regressions across breakpoints |
| Security | Threat modeling, input validation, secret hygiene, dependency risk checks | Secure-by-default changes and documented mitigations |
| Updates & Upgrades | Dependency updates, migration notes, compatibility checks, rollback awareness | Safe upgrade plan and validated compatibility |
| Review | Diff quality review, logic validation, maintainability checks | Reviewer-ready PR with clear rationale and impact summary |
| Audit | Standards compliance, policy adherence, traceability, reproducibility | Evidence-backed audit findings and remediation actions |
| Improvements | Post-delivery optimization, technical debt reduction, developer experience improvements | Prioritized improvement backlog with measurable value |

## 9. Skill Sources and Research Protocol

When creating or updating instructions, skills, agents, or prompts, always gather and reconcile guidance from:

1. **Repository-local truth first**: this repo’s files and conventions.
2. **Public GitHub references** (representative examples):
   - `github/awesome-copilot`
   - `microsoft/vscode` (`AGENTS.md`, Copilot customization specs)
   - `SebastienDegodez/copilot-instructions`
   - `Robotti-io/copilot-security-instructions`
3. **Web/Google-indexed guidance** for current SDLC and agentic best practices (planning → maintenance).

If sources conflict, prefer: **repository conventions > security constraints > platform standards > external style preferences**.

## 10. Execution Rules for Versatile Skills

- Select phase-aligned skills before producing output; do not jump to implementation without planning and design intent.
- For security-sensitive or externally exposed flows, include a security skill pass before finalizing.
- For UI changes, include responsiveness and accessibility validation as first-class checks.
- For dependency or platform changes, include updates/upgrades validation and fallback planning.
- Always finish with review + audit + improvements recommendations, even when the implemented change is small.

## 11. Godmode Skill Source Registry (Public Repos + Web)

Use this registry to load external skill sources relevant to the current lifecycle phase before composing final output. Treat these as **source packs** that must be reconciled with local repository constraints.

| Phase | Skill Source Packs |
|---|---|
| Planning | `papers-we-love/papers-we-love`, `oborchers/fractional-cto`, `andrewyng/openworker`, `multica-ai/andrej-karpathy-skills`, `rohitg00/ai-engineering-from-scratch`, `shauryr/S2QA`, `github/awesome-copilot` |
| Designing | `googlemaps/agent-skills`, `google-gemini/gemini-skills`, `google-labs-code/stitch-skills`, `marin-community/marin`, `nextlevelbuilder/ui-ux-pro-max-skill`, `ibelick/ui-skills`, `enaqx/awesome-react` |
| Development | `reactjs/react.dev`, `remotion-dev/remotion`, `ionic-team/capacitor`, `material-components/material-components-android`, `android/skills`, `callstackincubator/agent-skills`, `anthropics/skills`, `markdown-viewer/skills`, `Leonxlnx/taste-skill`, `obra/superpowers` |
| Responsiveness | `reactjs/react.dev`, `enaqx/awesome-react`, `nextlevelbuilder/ui-ux-pro-max-skill`, `ibelick/ui-skills`, `material-components/material-components-android`, `remotion-dev/remotion`, `pbakaus/impeccable` |
| Security | `swisskyrepo/PayloadsAllTheThings`, `trimstray/the-book-of-secret-knowledge`, `asgeirtj/system_prompts_leaks`, `x1xhlol/system-prompts-and-models-of-ai-tools`, `thedotmack/claude-mem`, `Robotti-io/copilot-security-instructions`, `DietrichGebert/ponytail` |
| Updates & Upgrades | `vinta/awesome-python`, `awesome-selfhosted/awesome-selfhosted`, `kvcache-ai/AgentENV`, `bytedance/deer-flow`, `getpaseo/paseo`, `Kong/insomnia`, `plausible/analytics` |
| Review | `github/awesome-copilot`, `SebastienDegodez/copilot-instructions`, `alirezarezvani/claude-skills`, `vipulgupta2048/awesome-documentation`, `MunGell/awesome-for-beginners` |
| Audit | `swisskyrepo/PayloadsAllTheThings`, `trimstray/the-book-of-secret-knowledge`, `plausible/analytics`, `Kong/insomnia`, `neutree-ai/openapi-to-skills`, `shauryr/S2QA` |
| Improvements | `github/awesome-copilot`, `SebastienDegodez/copilot-instructions`, `google-gemini/gemini-skills`, `callstackincubator/agent-skills`, `alirezarezvani/claude-skills`, `vipulgupta2048/awesome-documentation` |

## 12. Godmode Integration Protocol

- Start every non-trivial task with at least one source from the phase currently being executed.
- Expand to adjacent phases when risk crosses boundaries (for example, design affecting security or upgrades affecting auditability).
- For conflicting recommendations, resolve in this order: **CatalystLab local conventions > security constraints > platform standards > external source pack guidance**.
- Do not copy external repo patterns blindly; adapt to CatalystLab’s `ds-*`, `framer-*`, SSRF/payment safety rules, and existing architecture docs.
- For any externally inspired change, include phase tags in reasoning (`[Planning]`, `[Security]`, etc.) and conclude with explicit review + audit + improvements checkpoints.
