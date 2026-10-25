import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Rewrite Relay `graphql` tags into imports of relay-compiler artifacts.
    // Must run before any TS/JSX transform; babel only parses (typescript+jsx
    // syntax plugins) and applies babel-plugin-relay, leaving the rest of the
    // code untouched for the normal pipeline.
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
    // Monorepo guard: never bundle a second React copy. If a nested
    // node_modules/react ever reappears (version drift between workspaces),
    // dedupe forces every importer onto the single hoisted instance —
    // a split React makes Relay hooks read a null dispatcher
    // ("Cannot read properties of null (reading 'useMemo')").
    dedupe: ['react', 'react-dom', 'react-relay', 'relay-runtime'],
    extensions: ['.react.tsx', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: [
      {
        // Compiler artifacts import the bare specifier 'JSResource' (haste
        // style). Resolve it to our registry implementation.
        find: /^JSResource$/,
        replacement: fileURLToPath(new URL('./src/lib/JSResource.ts', import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'https://yanyun.tbdlab.workers.dev',
        changeOrigin: true,
      },
    },
  },
})
