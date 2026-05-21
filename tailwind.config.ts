import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ───────────────────────────────────────────────────────────────
         MATERIAL 3 COLOR SYSTEM
         ─────────────────────────────────────────────────────────────── */
      colors: {
        /* Primary Brand Color */
        primary: {
          50: '#f3f0ff',
          100: '#ede5ff',
          200: '#ddd6ff',
          300: '#c5b5ff',
          400: '#a68aff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#5b5bf6',
          container: '#252560',
          onContainer: '#e0deff',
          on: '#ffffff',
          hover: '#6d6df8',
          focus: '#7b7bf8',
          pressed: '#5a5ae3',
        },
        /* Secondary Brand Color */
        secondary: {
          DEFAULT: '#e879f9',
          container: '#3d0f1c',
          onContainer: '#ffe0f5',
          on: '#ffffff',
          hover: '#f08ef0',
          focus: '#f09cf0',
        },
        /* Tertiary Brand Color */
        tertiary: {
          DEFAULT: '#22d3ee',
          container: '#091f17',
          onContainer: '#b0ffff',
          on: '#000000',
          hover: '#4edbe1',
          focus: '#22e4ee',
        },
        /* Error / Alert Color */
        error: {
          DEFAULT: '#f43f5e',
          container: '#3d0f1c',
          onContainer: '#ffe0e5',
          on: '#ffffff',
          hover: '#f97187',
          focus: '#f55a6f',
        },
        /* Success / Positive Color */
        success: {
          DEFAULT: '#34d399',
          container: '#0d3828',
          onContainer: '#b0ffeb',
          on: '#ffffff',
          hover: '#5be9c1',
          focus: '#4dd8b3',
        },
        /* Warning / Caution Color */
        warning: {
          DEFAULT: '#f59e0b',
          container: '#3a2800',
          onContainer: '#ffe8ce',
          on: '#ffffff',
          hover: '#f8b239',
          focus: '#f5a625',
        },
        /* Surface & Container Hierarchy */
        surface: {
          DEFAULT: '#0c0c0f',
          dim: '#0a0a0d',
          bright: '#1a1a24',
          lowest: '#06060a',
          low: '#111116',
          container: '#17171e',
          'container-high': '#21212c',
          'container-highest': '#2c2c3c',
          on: '#eeeef2',
          'on-variant': '#9898b0',
        },
        /* Outline & Borders */
        outline: {
          DEFAULT: '#3c3c52',
          variant: '#2c2c3c',
        },
        /* Inverse (Modals & Overlays) */
        inverse: {
          surface: '#f0f0f5',
          primary: '#3c1b8e',
          'on-surface': '#000000',
        },
        /* Scrim & Backdrop */
        scrim: 'rgba(0, 0, 0, 0.6)',
        shadow: 'rgba(0, 0, 0, 0.3)',
        /* Semantic Colors for Research */
        zone: {
          a: '#818cf8',
          b: '#e879f9',
          c: '#22d3ee',
        },
        source: {
          ss: '#60a5fa',
          oa: '#34d399',
          arxiv: '#fb923c',
          pm: '#f87171',
          core: '#a78bfa',
          cr: '#fbbf24',
          epmc: '#14b8a6',
          doaj: '#4ade80',
          upw: '#e879f9',
        },
      },

      /* ───────────────────────────────────────────────────────────────
         MATERIAL 3 TYPOGRAPHY (Type Scale)
         ─────────────────────────────────────────────────────────────── */
      fontSize: {
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '500' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '500' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },

      /* ───────────────────────────────────────────────────────────────
         BORDER RADIUS (M3 Curved Style)
         ─────────────────────────────────────────────────────────────── */
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
        'extra': '28px',
      },

      /* ───────────────────────────────────────────────────────────────
         BOX SHADOW (M3 Elevation System)
         ─────────────────────────────────────────────────────────────── */
      boxShadow: {
        'none': '0px 0px 0px rgba(0, 0, 0, 0)',
        'elevation-1': '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        'elevation-2': '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
        'elevation-3': '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
        'elevation-4': '0px 15px 25px rgba(0, 0, 0, 0.15), 0px 5px 10px rgba(0, 0, 0, 0.05)',
        'elevation-5': '0px 20px 40px rgba(0, 0, 0, 0.3)',
      },

      /* ───────────────────────────────────────────────────────────────
         SPACING (Consistent Gutters & Padding)
         ─────────────────────────────────────────────────────────────── */
      spacing: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },

      /* ───────────────────────────────────────────────────────────────
         BACKDROP FILTER (For glassmorphism effects)
         ─────────────────────────────────────────────────────────────── */
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      /* ───────────────────────────────────────────────────────────────
         ANIMATION (M3 Standard Easing)
         ─────────────────────────────────────────────────────────────── */
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'fade-out': 'fadeOut 200ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'slide-in-up': 'slideInUp 300ms cubic-bezier(0, 0.55, 0.45, 1) forwards',
        'slide-in-down': 'slideInDown 300ms cubic-bezier(0, 0.55, 0.45, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0, 0.55, 0.45, 1) forwards',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'bounce-gentle': 'bounceGentle 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      /* ───────────────────────────────────────────────────────────────
         TRANSITIONS (Semantic Duration Naming)
         ─────────────────────────────────────────────────────────────── */
      transitionDuration: {
        'shortest': '150ms',
        'short': '200ms',
        'standard': '300ms',
        'complex': '375ms',
      },

      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'emphasized-in': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'emphasized-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
        'emphasized-in-out': 'cubic-bezier(0.4, 0.55, 0.6, 0.45)',
      },

      /* ───────────────────────────────────────────────────────────────
         MIN/MAX WIDTH (Responsive Container Sizes)
         ─────────────────────────────────────────────────────────────── */
      minWidth: {
        'touch': '44px',
        'button': '64px',
      },

      maxWidth: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'prose': '65ch',
      },

      /* ───────────────────────────────────────────────────────────────
         STATE LAYERS (Interactive Feedback)
         ─────────────────────────────────────────────────────────────── */
      backgroundColor: {
        'state-hover': 'rgba(91, 91, 246, 0.08)',
        'state-focus': 'rgba(91, 91, 246, 0.12)',
        'state-pressed': 'rgba(91, 91, 246, 0.16)',
        'state-disabled': 'rgba(233, 238, 242, 0.38)',
      },
    },

    /* ──────────────────────────────────────────────────────────────
       TYPOGRAPHY SYSTEM
       ────────────────────────────────────────────────────────────── */
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
      display: 'var(--font-sans)',
      body: 'var(--font-sans)',
    },

    /* ──────────────────────────────────────────────────────────────
       BREAKPOINTS (Mobile-First)
       ────────────────────────────────────────────────────────────── */
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      /* Custom breakpoints for UI patterns */
      'tablet': '600px',
      'desktop': '900px',
      'wide': '1200px',
      'ultra': '1920px',
    },
  },

  plugins: [],
};

export default config;
