import { Paper } from "./research-api";

export interface Session {
  id: string;
  instrumentSlug: string;
  input: any;
  output: any;
  papers: Paper[];
  timestamp: number;
  title: string;
  zone: 'a' | 'b' | 'c';
}

export const INSTRUMENTS = [
  {
    slug: 'thought-collider',
    name: 'Thought Collider',
    description: 'Crash two ideas. Find the breakthrough.',
    zone: 'a',
    icon: 'Zap'
  },
  {
    slug: 'pressure-chamber',
    name: 'Pressure Chamber',
    description: 'How strong is your idea under adversarial stress?',
    zone: 'b',
    icon: 'ShieldAlert'
  },
  {
    slug: 'the-oracle',
    name: 'The Oracle',
    description: 'The 10 most important unanswered questions in your field.',
    zone: 'a',
    icon: 'MessageSquare'
  },
  {
    slug: 'temporal-telescope',
    name: 'Temporal Telescope',
    description: 'See past, present, and three possible futures.',
    zone: 'c',
    icon: 'Telescope'
  },
  {
    slug: 'analogical-lab',
    name: 'Analogical Lab',
    description: 'Your problem is already solved — in a different field.',
    zone: 'c',
    icon: 'Repeat'
  },
  {
    slug: 'research-multiverse',
    name: 'Research Multiverse',
    description: 'Flip your assumptions. Explore parallel universes.',
    zone: 'a',
    icon: 'Layers'
  },
  {
    slug: 'concept-alchemy',
    name: 'Concept Alchemy',
    description: 'Combine elements. Discover unexpected reactions.',
    zone: 'a',
    icon: 'FlaskConical'
  },
  {
    slug: 'contradiction-finder',
    name: 'Contradiction Finder',
    description: 'Papers that disagree. Gaps that need filling.',
    zone: 'b',
    icon: 'Split'
  },
  {
    slug: 'mind-mesh',
    name: 'Mind Mesh',
    description: 'Your knowledge network, made visible.',
    zone: 'c',
    icon: 'Network'
  },
  {
    slug: 'assumption-archaeology',
    name: 'Assumption Archaeology',
    description: 'Excavate the hidden assumptions beneath your research.',
    zone: 'b',
    icon: 'Pickaxe'
  },
  {
    slug: 'hypothesis-tournament',
    name: 'Hypothesis Tournament',
    description: '5 hypotheses enter. One survives.',
    zone: 'b',
    icon: 'Trophy'
  },
  {
    slug: 'signal-noise',
    name: 'Signal vs Noise',
    description: 'Is this trend real or hype?',
    zone: 'b',
    icon: 'Waves'
  },
  {
    slug: 'persona-swap',
    name: 'Persona Swap',
    description: 'See your research through different eyes.',
    zone: 'b',
    icon: 'UserCircle'
  },
  {
    slug: 'frontier-map',
    name: 'Frontier Map',
    description: 'Satellite view of the edge of your field.',
    zone: 'c',
    icon: 'Map'
  },
  {
    slug: 'living-review',
    name: 'Living Lit Review',
    description: 'A literature review that updates itself.',
    zone: 'c',
    icon: 'RefreshCw'
  },
  {
    slug: 'emergence-engine',
    name: 'Emergence Engine',
    description: 'Submit one observation. Watch a breakthrough emerge.',
    zone: 'c',
    icon: 'Sparkles'
  },
  {
    slug: 'socratic-engine',
    name: 'Socratic Engine',
    description: 'The AI that only asks. You find the answer.',
    zone: 'a',
    icon: 'HelpCircle'
  },
  {
    slug: 'constraints-game',
    name: 'Constraints Game',
    description: 'Creativity loves constraints.',
    zone: 'a',
    icon: 'Box'
  },
  {
    slug: 'dream-board',
    name: 'Research Dream Board',
    description: 'Pin fragments. AI finds the pattern.',
    zone: 'a',
    icon: 'Layout'
  },
  {
    slug: 'thought-experiment',
    name: 'Thought Experiment',
    description: 'Build a hypothetical. See where it leads.',
    zone: 'a',
    icon: 'Brain'
  }
];

export const ZONES = {
  a: { name: 'Ideas', color: 'var(--zone-a)', label: 'Zone A' },
  b: { name: 'Analysis', color: 'var(--zone-b)', label: 'Zone B' },
  c: { name: 'Discovery', color: 'var(--zone-c)', label: 'Zone C' }
};
