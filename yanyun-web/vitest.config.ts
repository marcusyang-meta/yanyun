import react from '@vitejs/plugin-react';
import babel from 'vite-plugin-babel';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Web unit tests run in plain Node, same shape as the other workspace
// packages (yanyun-signup / yanyun-og / yanyun-mobile). The plugin and
// resolve setup mirrors vite.config.ts so tests may import real
// components (Relay `graphql` tags need the babel-relay rewrite, and
// compiler artifacts import the bare 'JSResource' specifier); without
// it only tag-free modules were testable, which kept component-level
// behavior out of regression coverage.
export default defineConfig({
  plugins: [
    babel({
      include: [/\.[tj]sx?$/],
      exclude: [/node_modules/, /__generated__/],
      babelConfig: {
        plugins: ['relay'],
        parserOpts: { plugins: ['typescript', 'jsx'] },
      },
    }),
    react(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-relay', 'relay-runtime'],
    extensions: ['.react.tsx', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: [
      {
        find: /^JSResource$/,
        replacement: fileURLToPath(new URL('./src/lib/JSResource.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
