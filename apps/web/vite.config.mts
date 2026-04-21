/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  base: mode === 'production' ? '/NFTForge/' : '/',
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@nftforge/contracts': resolve(__dirname, '../../libs/contracts'),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
    watch: false,
    coverage: {
      reportsDirectory: '../../coverage/apps/web',
      provider: 'v8',
    },
  },
}));
