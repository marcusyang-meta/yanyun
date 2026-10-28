import { transformSync } from '@babel/core';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';

// Unit tests run in plain Node: the native seams that src/relay.ts pulls
// in transitively (react-native's Platform, expo-secure-store,
// expo-constants) are aliased to tiny stubs under test/stubs/. Everything
// else -- relay-runtime, @yanyun/blocks-core, the compiled Relay
// artifacts -- is the real production code.
const stub = (name: string) => fileURLToPath(new URL(`./test/stubs/${name}`, import.meta.url));

// Rewrite Relay `graphql` tags into imports of relay-compiler artifacts,
// same as the app bundle (Metro babel 'relay' plugin) and the Web vite
// config: babel only parses (typescript+jsx syntax plugins) and applies
// babel-plugin-relay, leaving the rest of the code for vitest's pipeline.
const relayBabelPlugin: Plugin = {
  name: 'relay-graphql-tag',
  enforce: 'pre',
  transform(code, id) {
    if (!/\.[tj]sx?$/.test(id) || id.includes('node_modules') || id.includes('__generated__')) return null;
    if (!code.includes('graphql`')) return null;
    const out = transformSync(code, {
      filename: id,
      plugins: ['relay'],
      parserOpts: { plugins: ['typescript', 'jsx'] },
      configFile: false,
      babelrc: false,
    });
    return out?.code ? { code: out.code, map: out.map ?? undefined } : null;
  },
};

export default defineConfig({
  plugins: [relayBabelPlugin],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: stub('react-native.ts') },
      { find: /^expo-secure-store$/, replacement: stub('expo-secure-store.ts') },
      { find: /^expo-constants$/, replacement: stub('expo-constants.ts') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
