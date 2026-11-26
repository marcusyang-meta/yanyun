import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// graphql@17 ships a separate "development"-condition build (__dev__/).
// Vite's pipeline resolves that condition while node-externalized deps
// (graphql-yoga) resolve the default build, producing two graphql module
// instances and "another module or realm" failures. Pin every vite-side
// graphql import to the production build so both sides share one file.
const graphqlDir = fileURLToPath(new URL('../node_modules/graphql', import.meta.url));

// Unit-test layout (replaces the retired .harness-* script suites):
//   tests/         — in-process suites: real resolvers / services against
//                    FakeDB or in-process Miniflare, plain node environment.
//   tests-server/  — suites whose mechanism is a real `wrangler dev`
//                    process driven over HTTP (push / heirloom). They run
//                    strictly serially: they share the local D1 state and
//                    fixed dev-server ports, exactly like the old runner.
// Both projects are plain `vitest run` targets of `pnpm test`.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^graphql$/, replacement: `${graphqlDir}/index.mjs` },
      { find: /^graphql\/(.+)$/, replacement: `${graphqlDir}/$1` },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
          testTimeout: 120_000,
          hookTimeout: 120_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          include: ['tests-server/**/*.test.ts'],
          environment: 'node',
          globalSetup: ['tests-server/global-setup.ts'],
          // Vitest schedules forks using the root fileParallelism setting.
          // Give this project one fork so its fixtures never share D1 concurrently.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
          testTimeout: 600_000,
          hookTimeout: 600_000,
        },
      },
    ],
  },
});
