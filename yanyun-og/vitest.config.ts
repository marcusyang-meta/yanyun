import { defineConfig } from 'vitest/config';

// OG worker acceptance tests: the worker runs in-process in node with
// asset imports stubbed to the real files (see tests/loader.mjs, wired
// through node:module register) and fetch/caches stubbed per scenario;
// fonts come from /tmp/og-fixtures. worker.js is externalized so vite
// hands it to the native ESM loader — vite's own pipeline cannot load
// the .wasm asset import and would bypass the loader stubs.
export default defineConfig({
  ssr: {
    external: [/\/worker\.js$/],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    server: {
      deps: {
        external: [/\/worker\.js$/],
      },
    },
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
