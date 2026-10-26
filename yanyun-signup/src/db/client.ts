// Data-layer client factory.
//
// Business code never touches the D1 binding directly; it goes through
// the repositories in src/db/repositories/, which take the raw binding
// (env.DB, or a D1-shaped test double in the .harness-* suites) and wrap
// it here. The drizzle instance is cached per binding object so wrapping
// on every call stays free.
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema.ts';

export type Db = DrizzleD1Database<typeof schema>;

const cache = new WeakMap<object, Db>();

export function createDb(d1: D1Database): Db {
  const hit = cache.get(d1);
  if (hit) return hit;
  const db = drizzle(d1, { schema });
  cache.set(d1, db);
  return db;
}

export { schema };
