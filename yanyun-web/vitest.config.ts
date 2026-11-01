import { defineConfig } from 'vitest/config';

// Web unit tests run in plain Node, same shape as the other workspace
// packages (yanyun-signup / yanyun-og / yanyun-mobile).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
