// @babel/core ships no TypeScript declarations; vitest.config.ts only
// needs transformSync, so declare exactly that surface instead of
// pulling in the full @types/babel__core tree for one call site.
declare module '@babel/core' {
  export interface TransformResult {
    code: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- source map shape is opaque at this call site
    map: any;
  }
  export function transformSync(code: string, options: Record<string, unknown>): TransformResult | null;
}
