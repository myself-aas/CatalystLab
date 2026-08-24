/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [
    require("@relume_io/relume-tailwind")
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b192c',
          oxford: '#0d1b2a',
          slate: '#415a77',
          'slate-hover': '#33475e',
          'slate-light': '#52718e',
          periwinkle: '#c5d3e8',
          'periwinkle-light': '#d6e2f0',
          offwhite: '#f8fafc',
          ghost: '#f4f6fa',
          greige: '#ebe9e6',
          gray: '#e2e8f0',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0d1b2a',
          panel: '#152238',
          muted: '#f8fafc',
        },
        text: {
          primary: '#0b192c',
          secondary: '#415a77',
          muted: '#52718e',
          inverted: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
      },
      opacity: {
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
      },
    },
  },
  plugins: [],
};
