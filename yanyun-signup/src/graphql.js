// Entry glue: creatorbackfill.js / creatormanualfix.js and other root
// modules import './graphql.js' and are never edited by migrations.
// The GraphQL assembly lives in graphql.ts; this shim re-exports it.
export * from './graphql.ts';
