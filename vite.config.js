import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // base: '/web-app/',
  define: {
    'process.env': {}, // Avoid directly using `process.env` unless necessary
  },
  plugins: [react()],
  base: '/', // Subfolder path
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'), // Alias for Tailwind config
    },
  },
  optimizeDeps: {
    include: ['@tailwindConfig'], // Include specific dependencies for optimization
  },
  build: {
    minify: true,
    sourcemap: false,
    target: 'modules',
  },
});
