import baseConfig from '../vite.config';
import { fileURLToPath } from 'node:url';

const base: any = baseConfig as any;
export default {
  ...base,
  root: fileURLToPath(new URL('..', import.meta.url)),
  base: './',
  build: {
    outDir: fileURLToPath(new URL('./dist-nick', import.meta.url)),
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./main-nick.tsx', import.meta.url)),
      formats: ['iife'],
      name: 'HarnessNick',
      fileName: () => 'harness-nick.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
};
