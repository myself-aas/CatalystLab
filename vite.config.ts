import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
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
    hmr: {
      clientPort: 443
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'motion', 'recharts', 'lucide-react'],
          'vendor-utils': ['zustand', 'dompurify', 'd3'],
        },
      },
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
});
