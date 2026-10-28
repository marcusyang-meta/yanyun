// Platform-admin gate acceptance (hub overhaul, 2026-10-28 ruling):
// the super-admin verdict is evaluated in the gating layer with the
// viewer's identity as subject — nothing is stamped into the VC or
// the session. The roster has two unioned sources (env bootstrap
// floor + the living settings roster) and every failure mode must
// resolve to NOT admin (fail closed). FakeDB routes by SQL shape,
// same pattern as the other suites.
import {
  isPlatformAdmin,
  listPlatformAdminIds,
  setPlatformAdminRoster,
  parseAdminRosterJson,
  parseAdminEnvIds,
  normalizeAdminIds,
  PLATFORM_ADMIN_ROSTER_KEY,
} from '../src/domains/platform/admin-gate.ts';
import { describe, it, expect } from 'vitest';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) {
  check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

function makeDb() {
  const state = { settings: new Map<string, string>() };
  function route(kind: string, rawSql: string, b: any[]) {
    const sql = rawSql.replace(/"/g, '').replace(/\s+/g, ' ');
    if (/^INSERT INTO settings/i.test(sql)) {
      // setSettingValue binds (tenant, key, value).
      state.settings.set(`${b[0]}|${b[1]}`, String(b[2] ?? ''));
      return { meta: { changes: 1 } };
    }
    if (/FROM settings/i.test(sql)) {
      const v = state.settings.get(`${b[0]}|${b[1]}`);
      const row = v === undefined ? null : { value: v };
      return kind === 'first' ? row : { results: row ? [row] : [] };
    }
    if (kind === 'first') return null;
    return { results: [] };
  }
  const stmt = (sql: string) => ({
    _b: [] as any[],
    bind(...a: any[]) { this._b = a; return this; },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  const db = {
    prepare: (sql: string) => stmt(sql),
    batch: async (stmts: any[]) => { for (const st of stmts) await st.run(); return []; },
  };
  return { db: db as unknown as D1Database, state };
}

describe('platform-admin gate', () => {
  it('env floor grants, strangers denied', async () => {
    const { db } = makeDb();
    const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: '111, 222' };
    check('env-listed id is admin', await isPlatformAdmin(env, '111'));
    check('second env-listed id is admin', await isPlatformAdmin(env, '222'));
    check('unlisted id is not admin', !(await isPlatformAdmin(env, '333')));
    check('empty viewer is not admin', !(await isPlatformAdmin(env, '')));
    check('null viewer is not admin', !(await isPlatformAdmin(env, null)));
    check('undefined viewer is not admin', !(await isPlatformAdmin(env, undefined)));
  });

  it('settings roster grants; union with the env floor', async () => {
    const { db, state } = makeDb();
    state.settings.set(`|${PLATFORM_ADMIN_ROSTER_KEY}`, '["444"]');
    const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: '111' };
    check('roster id is admin', await isPlatformAdmin(env, '444'));
    check('env floor still admin alongside roster', await isPlatformAdmin(env, '111'));
    eq('effective roster is the union, floor first', await listPlatformAdminIds(env), ['111', '444']);
  });

  it('fails closed when nothing is configured', async () => {
    const { db } = makeDb();
    check('no env, no roster -> not admin', !(await isPlatformAdmin({ DB: db }, '111')));
    check('missing DB -> not admin', !(await isPlatformAdmin({} as any, '111')));
  });

  it('malformed roster can only shrink access, never widen it', async () => {
    const { db, state } = makeDb();
    const env = { DB: db };
    state.settings.set(`|${PLATFORM_ADMIN_ROSTER_KEY}`, 'not json at all');
    check('garbage roster -> not admin', !(await isPlatformAdmin(env, 'not json at all')));
    state.settings.set(`|${PLATFORM_ADMIN_ROSTER_KEY}`, '{"id":"555"}');
    check('object roster -> not admin', !(await isPlatformAdmin(env, '555')));
    state.settings.set(`|${PLATFORM_ADMIN_ROSTER_KEY}`, '["", 42, "666"]');
    check('valid string entry survives', await isPlatformAdmin(env, '666'));
    check('numeric entry is not an id', !(await isPlatformAdmin(env, '42')));
    check('raw roster string is not an id', !(await isPlatformAdmin(env, '["", 42, "666"]')));
  });

  it('roster write round-trips through the data layer, normalized', async () => {
    const { db, state } = makeDb();
    const env = { DB: db };
    const written = await setPlatformAdminRoster(db, [' 555 ', '555', '', '666']);
    eq('write normalizes (trim/dedupe/drop empty)', written, ['555', '666']);
    eq('stored value is the clean JSON array', state.settings.get(`|${PLATFORM_ADMIN_ROSTER_KEY}`), '["555","666"]');
    check('written id evaluates admin', await isPlatformAdmin(env, '555'));
    await setPlatformAdminRoster(db, []);
    check('wiped roster no longer grants', !(await isPlatformAdmin(env, '555')));
  });

  it('the env floor survives a roster wipe (break-glass)', async () => {
    const { db } = makeDb();
    const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: '111' };
    await setPlatformAdminRoster(db, []);
    check('env floor still grants after roster wipe', await isPlatformAdmin(env, '111'));
  });

  it('parsers are defensive', () => {
    eq('env parse splits comma/space/newline', parseAdminEnvIds(' a,b  c\nd '), ['a', 'b', 'c', 'd']);
    eq('env parse of empty', parseAdminEnvIds(''), []);
    eq('env parse of undefined', parseAdminEnvIds(undefined), []);
    eq('roster parse of null', parseAdminRosterJson(null), []);
    eq('roster parse dedupes', parseAdminRosterJson('["1","1","2"]'), ['1', '2']);
    eq('normalize drops overlong values', normalizeAdminIds(['x'.repeat(33), 'ok']), ['ok']);
    check('normalize caps the roster at 200', normalizeAdminIds(Array.from({ length: 300 }, (_, i) => String(i))).length === 200);
  });
});
