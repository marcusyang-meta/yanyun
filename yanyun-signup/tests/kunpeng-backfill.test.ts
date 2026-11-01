// Kunpeng dex backfill acceptance: the one-off insert of the
// 鲲鹏图千山 dungeon and its two bosses （天涯客 / 鹏） into the boss
// compendium, behind the platform-admin gate.
//   - The service is idempotent and dryRun-safe: a dry run reports
//     the full would-be effect and writes nothing; a real run creates
//     exactly one dungeon and two bosses; a repeat run creates
//     nothing and flips nothing.
//   - The is_current switch rides along: 玉魄染青苍 (the previous
//     size-10 holder, seeded as current) is cleared in the same run.
//   - Dungeon/boss field values follow the finalized field sheet
//     （传薪 season line, version following the 玉魄 row).
//   - Guide text is the frozen draft: sourced talent rows only —
//     the unsourced rows (天涯客 1-1/2-1, 鹏 1-1/1-2/2-2) are absent
//     entirely, and 天涯客 2-2 is the 神机化龙 ruling (deep-dig
//     adjudication, 2026-11-01). Structured counts are the baseline
//     for the inserted text: 天涯客 13 mechanics / 4 talents /
//     12 shouts, 鹏 10 / 3 / 9.
//   - The mutation re-evaluates the gate (non-admins are denied and
//     write nothing), audits with the acting admin's user ID, and a
//     real run materializes the structured columns in the same
//     action (chained guide migration).
// Real D1 (Miniflare, migration-chain bootstrap), real yoga + real
// resolvers (platform-admin.test.ts pattern).
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import {
  runKunpengDexBackfill, runBossGuideStructuredMigration,
} from '../src/domains/platform/admin-backfills.ts';
import {
  getDungeonByName, insertDungeonDex, updateDungeonFields, countDungeons,
  getBossById, listBossesFullByDungeon, countBosses,
} from '../src/domains/dex/index.ts';
import { parseGuideStructured } from '../src/domains/dex/graphql.ts';
import { listHubAuditPage } from '../src/domains/platform/hub-audit.ts';
import { upsertUserOnLogin } from '../src/domains/identity/users.ts';

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-kunpeng-backfill' },
}));
const db = await mf.getD1Database('DB');
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  console.log('[kunpeng-backfill] bootstrapped from migration chain:', files.join(', '));
}

/* ---------- fixtures ---------- */
// The previous size-10 current holder, in its production shape.
const yuqueMeta = await insertDungeonDex(db, { name: '玉魄染青苍', size: 10, season: 'S5', category: '传薪', level: 100 });
await updateDungeonFields(db, yuqueMeta.last_row_id, { version: 'intl-v2.3', sort_order: 7, is_current: 1 });

const ADMIN_UID = await upsertUserOnLogin(db, { discordId: 'KADMIN1', username: '超管丙', avatar: '', guildsJson: '[]', checkedAtSec: 1760000000 });
const PLAIN_UID = await upsertUserOnLogin(db, { discordId: 'KUSER1', username: '路人丙', avatar: '', guildsJson: '[]', checkedAtSec: 1760000000 });
const env = { DB: db, PLATFORM_ADMIN_DISCORD_IDS: 'KADMIN1' };
const adminUser = { userId: ADMIN_UID, discordId: 'KADMIN1', name: '超管丙', guilds: [] as string[] };
const plainUser = { userId: PLAIN_UID, discordId: 'KUSER1', name: '路人丙', guilds: [] as string[] };

const MUT = `mutation($dryRun: Boolean!) {
  platformAdminBackfillKunpengDex(dryRun: $dryRun) {
    ok error errorCode dryRun dungeonCreated dungeonName bossesCreated previousCurrentCleared
    bosses { id name created guideWritten mechanics talents shouts }
  }
}`;
async function runMutation(dryRun: boolean, user: unknown = adminUser) {
  const ctx = {
    env, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
    executionCtx: { waitUntil() {} },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: MUT, variables: { dryRun } }),
  }), ctx);
  return res.json();
}

describe('kunpeng dex backfill', () => {
  it('mutation denies non-admins and writes nothing', async () => {
    for (const user of [null, plainUser]) {
      const res = await runMutation(false, user);
      const p = res.data.platformAdminBackfillKunpengDex;
      expect(p.ok).toBe(false);
      expect(p.errorCode).toBe('platformAdminRequired');
      expect(p.bossesCreated).toBe(0);
    }
    expect(await countDungeons(db)).toBe(1);
    expect(await countBosses(db)).toBe(0);
  });

  it('service dryRun reports the full effect and writes nothing', async () => {
    const report = await runKunpengDexBackfill(db, true);
    expect(report.dryRun).toBe(true);
    expect(report.dungeonCreated).toBe(true);
    expect(report.dungeonName).toBe('鲲鹏图千山');
    expect(report.bossesCreated).toBe(2);
    expect(report.previousCurrentCleared).toBe(true);
    const byName = new Map(report.bosses.map((b) => [b.name, b]));
    const tianya = byName.get('天涯客')!;
    expect(tianya.created).toBe(true);
    expect(tianya.guideWritten).toBe(true);
    expect(tianya.id).toBeNull();
    expect([tianya.mechanics, tianya.talents, tianya.shouts]).toEqual([13, 4, 12]);
    const peng = byName.get('鹏')!;
    expect(peng.created).toBe(true);
    expect([peng.mechanics, peng.talents, peng.shouts]).toEqual([10, 3, 9]);
    expect(await countDungeons(db)).toBe(1);
    expect(await countBosses(db)).toBe(0);
    const yuque = await getDungeonByName(db, '玉魄染青苍');
    expect(yuque?.is_current).toBe(1);
  });

  it('mutation dryRun (admin) is ok and still writes nothing', async () => {
    const res = await runMutation(true);
    const p = res.data.platformAdminBackfillKunpengDex;
    expect(res.errors).toBeUndefined();
    expect(p.ok).toBe(true);
    expect(p.dungeonCreated).toBe(true);
    expect(p.bossesCreated).toBe(2);
    expect(await countDungeons(db)).toBe(1);
    expect(await countBosses(db)).toBe(0);
  });

  it('mutation real run creates the dungeon, both bosses, the current switch, structured columns and an audit row', async () => {
    const res = await runMutation(false);
    const p = res.data.platformAdminBackfillKunpengDex;
    expect(res.errors).toBeUndefined();
    expect(p.ok).toBe(true);
    expect(p.dryRun).toBe(false);
    expect(p.dungeonCreated).toBe(true);
    expect(p.bossesCreated).toBe(2);
    expect(p.previousCurrentCleared).toBe(true);
    const byName = new Map(p.bosses.map((b: { name: string }) => [b.name, b]));
    expect([byName.get('天涯客').mechanics, byName.get('天涯客').talents, byName.get('天涯客').shouts]).toEqual([13, 4, 12]);
    expect([byName.get('鹏').mechanics, byName.get('鹏').talents, byName.get('鹏').shouts]).toEqual([10, 3, 9]);
    expect(byName.get('天涯客').id).toBeGreaterThan(0);
    expect(byName.get('鹏').id).toBeGreaterThan(0);

    const dungeon = await getDungeonByName(db, '鲲鹏图千山');
    expect(dungeon).toMatchObject({
      size: 10, season: 'S5', category: '传薪', level: 100,
      version: 'intl-v2.3', sort_order: 9, is_current: 1,
    });
    const yuque = await getDungeonByName(db, '玉魄染青苍');
    expect(yuque?.is_current).toBe(0);
    expect(await countDungeons(db)).toBe(2);

    const bosses = await listBossesFullByDungeon(db, '鲲鹏图千山');
    expect(bosses.length).toBe(2);
    const tianya = bosses.find((b) => b.name === '天涯客')!;
    const peng = bosses.find((b) => b.name === '鹏')!;
    expect(tianya.sort_order).toBe(54);
    expect(peng.sort_order).toBe(55);
    for (const b of [tianya, peng]) {
      expect(b.talent).toBe('三线:进攻·气竭增伤 / 防守·机制减伤 / 策略·伤疗提升');
      expect(b.source).toBe('侠境·鲲鹏图千山(100级)');
    }
    expect(tianya.note).toBe('伞与凌云踏机制对策（保伞/撞伞/分组卸势破盾）');
    expect(peng.note).toBe('墨山道长老（剧情称谓「鹏长老」）；磁球感电连线救人/三角破盾机制对策');
    // Frozen guide content: sourced talent rows only, 2-2 is the
    // 神机化龙 ruling; the unsourced rows never appear.
    expect(tianya.guide).toContain('【天赋·逐条说明】');
    expect(tianya.guide).not.toContain('未查到');
    const tianyaTalents = parseGuideStructured(tianya.guide).talents.map((t) => t.code);
    expect(tianyaTalents).toEqual(['1-2', '1-3', '2-2', '2-3']);
    const pengTalents = parseGuideStructured(peng.guide).talents.map((t) => t.code);
    expect(pengTalents).toEqual(['1-3', '2-1', '2-3']);
    // Structured columns materialized by the chained migration.
    for (const [b, counts] of [[tianya, [13, 4, 12]], [peng, [10, 3, 9]]] as const) {
      const row = await getBossById(db, b.id);
      expect(JSON.parse(row!.mechanics_json!).length).toBe(counts[0]);
      expect(JSON.parse(row!.talents_json!).length).toBe(counts[1]);
      expect(JSON.parse(row!.shouts_json!).length).toBe(counts[2]);
    }
    // Audit: the acting admin's real user ID, never a generic actor.
    const page = await listHubAuditPage(db, { limit: 50 });
    const entry = page.entries.find((e) => e.action === 'backfill.kunpeng_dex');
    expect(entry).toBeTruthy();
    expect(String(entry!.actor)).toBe(String(ADMIN_UID));
  });

  it('repeat runs create nothing and flip nothing (idempotent)', async () => {
    const report = await runKunpengDexBackfill(db, false);
    expect(report.dungeonCreated).toBe(false);
    expect(report.bossesCreated).toBe(0);
    expect(report.previousCurrentCleared).toBe(false);
    for (const b of report.bosses) {
      expect(b.created).toBe(false);
      expect(b.guideWritten).toBe(false);
      expect(b.id).toBeGreaterThan(0);
    }
    expect(await countDungeons(db)).toBe(2);
    expect(await countBosses(db)).toBe(2);
    const dungeon = await getDungeonByName(db, '鲲鹏图千山');
    expect(dungeon?.is_current).toBe(1);
    // The structured migration stays a pure function of guide text.
    const again = await runBossGuideStructuredMigration(db);
    const tianya = again.migrated.find((m) => m.name === '天涯客')!;
    expect([tianya.mechanics, tianya.talents, tianya.shouts]).toEqual([13, 4, 12]);
  });
});
