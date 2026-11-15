import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mesa-viva-ultimate/',
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
});
