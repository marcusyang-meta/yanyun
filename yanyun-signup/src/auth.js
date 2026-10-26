// Entry glue: the implementation lives in the identity domain
// (src/domains/identity/auth.ts). This shim exists because the one-off
// ops files (creatorbackfill.js / creatormanualfix.js) import
// './auth.js' and are not edited by migrations.
export * from './domains/identity/auth.ts';
