import baseConfig from '../vite.config';
import { fileURLToPath } from 'node:url';

const base: any = baseConfig as any;
export default {
  ...base,
  root: fileURLToPath(new URL('..', import.meta.url)),
  base: './',
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./main.tsx', import.meta.url)),
      formats: ['iife'],
      name: 'HarnessSeal',
      fileName: () => 'harness.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
};
