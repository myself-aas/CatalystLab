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
    },
  },
  plugins: [],
};
