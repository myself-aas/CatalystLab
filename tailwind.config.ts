import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Terminal & Cyberpunk Tokens
        terminal: {
          void: '#030712',
          black: '#090D16',
          panel: '#0D131F',
          surface: '#111827',
          border: '#1E293B',
          'border-bright': '#334155',
          muted: '#64748B',
          text: '#F8FAFC',
          green: {
            DEFAULT: '#00FF66',
            neon: '#10B981',
            glow: 'rgba(16, 185, 129, 0.25)',
            dim: '#064E3B',
          },
          cyan: {
            DEFAULT: '#00F0FF',
            neon: '#06B6D4',
            glow: 'rgba(6, 182, 212, 0.25)',
            dim: '#164E63',
          },
          amber: {
            DEFAULT: '#FFB800',
            neon: '#F59E0B',
            glow: 'rgba(245, 158, 11, 0.25)',
            dim: '#78350F',
          },
          red: {
            DEFAULT: '#FF3366',
            neon: '#EF4444',
            glow: 'rgba(239, 68, 68, 0.25)',
            dim: '#7F1D1D',
          },
          purple: {
            DEFAULT: '#A855F7',
            neon: '#8B5CF6',
            glow: 'rgba(168, 85, 247, 0.25)',
            dim: '#581C87',
          },
        },
        // Biochemical Enzyme Palette
        enzyme: {
          vitalzyme: '#06B6D4',      // Core Web Vitals (Cyan)
          llmkinase: '#10B981',      // AI Readiness (Emerald)
          repoprotease: '#8B5CF6',   // Repo Hygiene (Purple)
          latencypolymerase: '#3B82F6', // Edge Latency (Blue)
          ecolactase: '#84CC16',     // Eco Carbon (Lime)
          compliasome: '#F59E0B',    // Security Compliance (Amber)
          migratase: '#EC4899',      // Platform Migration (Pink)
          synthase: '#14B8A6',       // AI Search Optimization (Teal)
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
        display: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow-green': 'pulseGlowGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-cyan': 'pulseGlowCyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-amber': 'pulseGlowAmber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-red': 'pulseGlowRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1s step-start infinite',
        'matrix-fade': 'matrixFade 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlowGreen: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(16, 185, 129, 0.2), inset 0 0 12px rgba(16, 185, 129, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(16, 185, 129, 0.5), inset 0 0 18px rgba(16, 185, 129, 0.25)' },
        },
        pulseGlowCyan: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(6, 182, 212, 0.2), inset 0 0 12px rgba(6, 182, 212, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(6, 182, 212, 0.5), inset 0 0 18px rgba(6, 182, 212, 0.25)' },
        },
        pulseGlowAmber: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(245, 158, 11, 0.2), inset 0 0 12px rgba(245, 158, 11, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(245, 158, 11, 0.5), inset 0 0 18px rgba(245, 158, 11, 0.25)' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(239, 68, 68, 0.2), inset 0 0 12px rgba(239, 68, 68, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(239, 68, 68, 0.5), inset 0 0 18px rgba(239, 68, 68, 0.25)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        matrixFade: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
      },
      boxShadow: {
        'terminal-neon': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'terminal-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'terminal-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
        'terminal-red': '0 0 20px -3px rgba(239, 68, 68, 0.3)',
        'terminal-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
