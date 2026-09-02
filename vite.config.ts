import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'disable-preview-hmr-client',
      transformIndexHtml(html) {
        return html.replace(/<script[^>]+src=["']\/\@vite\/client["'][^>]*><\/script>/g, '');
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/use-sync-external-store/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/firebase/') || id.includes('/@firebase/') || id.includes('/idb/')) {
              return 'vendor-firebase';
            }
            if (
              id.includes('/recharts/') ||
              id.includes('/d3') ||
              id.includes('/internmap/') ||
              id.includes('/decimal.js-light/') ||
              id.includes('/react-is/') ||
              id.includes('/reselect/') ||
              id.includes('/redux/') ||
              id.includes('/@reduxjs/') ||
              id.includes('/react-redux/') ||
              id.includes('/immer/') ||
              id.includes('/eventemitter3/')
            ) {
              return 'vendor-charts';
            }
            if (id.includes('/motion') || id.includes('/framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (
              id.includes('/zustand/') ||
              id.includes('/dompurify/') ||
              id.includes('/clsx/') ||
              id.includes('/tailwind-merge/') ||
              id.includes('/es-toolkit/') ||
              id.includes('/cobe/')
            ) {
              return 'vendor-utils';
            }
          }
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
});
