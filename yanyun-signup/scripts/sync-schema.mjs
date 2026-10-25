// Sync the canonical SDL from @yanyun/schema into this project.
// Direction: packages/schema/schema.graphql  ->  yanyun-signup/schema.graphql
// The Worker runtime does NOT read schema.graphql (typeDefs live in
// src/graphql-schema.js); this copy exists for tooling/docs parity.
// Edit the schema in packages/schema, then run this script.
import { copyFileSync } from 'node:fs';

const SRC = new URL('../../packages/schema/schema.graphql', import.meta.url);
const DST = new URL('../schema.graphql', import.meta.url);
copyFileSync(SRC, DST);
console.log('schema.graphql synced from @yanyun/schema');
