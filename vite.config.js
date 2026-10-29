import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from any path (e.g. GitHub Pages).
  base: './',
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
  },
});
