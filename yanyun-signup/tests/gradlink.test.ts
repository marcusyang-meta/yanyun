// Gear-library -> graduation-calculator bridge (gradlink.ts): the GP
// affix vocabulary of stored library items must land on the canonical
// affix keys the calculator scores with, and anything without a
// canonical counterpart must be skipped-and-counted, never dropped
// silently or mapped onto a wrong key.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { GP_AFFIX } from '../src/domains/gear/gearplanner.ts';
import {
  GP_TO_GRAD_AFFIX_KEY, GRAD_DINGYIN_KEY_BY_NAME,
  gradRowsForGearItem, gradSlotIdsForGearSlot,
} from '../src/domains/gear/gradlink.ts';

// The canonical affix vocabulary: the affix_max reference table's key
// set (production-verified); calcGraduation scores only these.
const CANONICAL_KEYS = [
  'affinity', 'agility', 'all_weapon', 'boss_dmg', 'class_atk_max',
  'class_atk_min', 'class_pen', 'constitution', 'crit_rate', 'defense',
  'max_atk', 'min_atk', 'phys_pen', 'power', 'precision', 'spirit',
  'tuning',
];

// GP affixes with no canonical counterpart (no weapon-boost /
// player-damage / mystic-damage affix exists in the calculator's
// vocabulary).
const UNMAPPABLE_GP_KEYS = ['wuqizeng', 'wanjia', 'quanqi'];

describe('GP -> grad affix key bridge', () => {
  it('maps the external-attack bounds', () => {
    expect(GP_TO_GRAD_AFFIX_KEY.dawai).toBe('max_atk');
    expect(GP_TO_GRAD_AFFIX_KEY.xiaowai).toBe('min_atk');
  });

  it('collapses every elemental system onto the single class-attack pair', () => {
    for (const sys of ['mj', 'ls', 'pz', 'qs', 'wx']) {
      expect(GP_TO_GRAD_AFFIX_KEY[`shu_${sys}_da`]).toBe('class_atk_max');
      expect(GP_TO_GRAD_AFFIX_KEY[`shu_${sys}_xiao`]).toBe('class_atk_min');
    }
  });

  it('maps the five attributes and the three rates', () => {
    expect(GP_TO_GRAD_AFFIX_KEY.ti).toBe('constitution');
    expect(GP_TO_GRAD_AFFIX_KEY.jin).toBe('power');
    expect(GP_TO_GRAD_AFFIX_KEY.yu).toBe('defense');
    expect(GP_TO_GRAD_AFFIX_KEY.min).toBe('agility');
    expect(GP_TO_GRAD_AFFIX_KEY.shi).toBe('spirit');
    expect(GP_TO_GRAD_AFFIX_KEY.jingzhun).toBe('precision');
    expect(GP_TO_GRAD_AFFIX_KEY.huixin).toBe('crit_rate');
    expect(GP_TO_GRAD_AFFIX_KEY.huiyi).toBe('affinity');
  });

  it('maps the damage affixes that exist on both sides', () => {
    expect(GP_TO_GRAD_AFFIX_KEY.quanwu).toBe('all_weapon');
    expect(GP_TO_GRAD_AFFIX_KEY.shouling).toBe('boss_dmg');
  });

  it('covers every GP affix key: mapped onto a canonical key, or known-unmappable', () => {
    for (const a of GP_AFFIX as Array<{ key: string }>) {
      const target = GP_TO_GRAD_AFFIX_KEY[a.key];
      if (UNMAPPABLE_GP_KEYS.includes(a.key)) {
        expect(target, a.key).toBeUndefined();
      } else {
        expect(target, a.key).toBeDefined();
        expect(CANONICAL_KEYS, a.key).toContain(target);
      }
    }
    // No stale map entries for keys the GP vocabulary no longer has.
    const gpKeys = new Set((GP_AFFIX as Array<{ key: string }>).map((a) => a.key));
    for (const k of Object.keys(GP_TO_GRAD_AFFIX_KEY)) expect(gpKeys.has(k), k).toBe(true);
  });

  it('maps only the penetration attunement names, onto canonical keys', () => {
    expect(GRAD_DINGYIN_KEY_BY_NAME['外功穿透']).toBe('phys_pen');
    expect(GRAD_DINGYIN_KEY_BY_NAME['无相穿透']).toBe('class_pen');
    for (const k of Object.values(GRAD_DINGYIN_KEY_BY_NAME)) expect(CANONICAL_KEYS).toContain(k);
  });
});

describe('gradRowsForGearItem', () => {
  it('translates a full item: lines in order, duplicates kept, dingyin mapped', () => {
    const r = gradRowsForGearItem({
      lines: [
        { key: 'xiaowai', val: 85.2 },
        { key: 'xiaowai', val: 85.2 },
        { key: 'shu_wx_xiao', val: 48.3 },
        { key: 'min', val: 54 },
        { key: 'huixin', val: 9.8 },
      ],
      dingyin: { name: '外功穿透', val: 12.8 },
    });
    expect(r.lines).toEqual([
      { key: 'min_atk', val: 85.2 },
      { key: 'min_atk', val: 85.2 },
      { key: 'class_atk_min', val: 48.3 },
      { key: 'agility', val: 54 },
      { key: 'crit_rate', val: 9.8 },
    ]);
    expect(r.dingyin).toEqual({ key: 'phys_pen', val: 12.8 });
    expect(r.skipped).toBe(0);
  });

  it('normalizes legacy GP keys before mapping', () => {
    const r = gradRowsForGearItem({
      lines: [
        { key: 'benshu', val: 48.3 },
        { key: 'xiaoshu', val: 48.3 },
      ],
      dingyin: null,
    });
    expect(r.lines).toEqual([
      { key: 'class_atk_max', val: 48.3 },
      { key: 'class_atk_min', val: 48.3 },
    ]);
    expect(r.skipped).toBe(0);
  });

  it('skips and counts unmappable affixes and attunements', () => {
    const r = gradRowsForGearItem({
      lines: [
        { key: 'dawai', val: 90.6 },
        { key: 'wuqizeng', val: 7 },
        { key: 'wanjia', val: 3.6 },
        { key: 'danti', val: 10.7 },
      ],
      dingyin: { name: '鸣金虹增伤', val: 7 },
    });
    expect(r.lines).toEqual([{ key: 'max_atk', val: 90.6 }]);
    expect(r.dingyin).toBeNull();
    expect(r.skipped).toBe(4);
  });

  it('caps affix lines at the five editor rows and counts the overflow', () => {
    const r = gradRowsForGearItem({
      lines: [
        { key: 'dawai', val: 1 }, { key: 'jin', val: 2 }, { key: 'min', val: 3 },
        { key: 'shi', val: 4 }, { key: 'jingzhun', val: 5 }, { key: 'huixin', val: 6 },
        { key: 'huiyi', val: 7 },
      ],
      dingyin: { name: '无相穿透', val: 15.2 },
    });
    expect(r.lines).toHaveLength(5);
    expect(r.dingyin).toEqual({ key: 'class_pen', val: 15.2 });
    expect(r.skipped).toBe(2);
  });

  it('an absent attunement is not a skip; a resistance attunement is', () => {
    expect(gradRowsForGearItem({ lines: [], dingyin: null }).skipped).toBe(0);
    const r = gradRowsForGearItem({ lines: [], dingyin: { name: '外功抗性', val: 12.8 } });
    expect(r.dingyin).toBeNull();
    expect(r.skipped).toBe(1);
  });
});

describe('GradPage.gradGearItems (GraphQL delivery)', () => {
  // Minimal D1 stand-in: only the gear-library read is served; every
  // other statement resolves empty (the queried fields need no more).
  const storedRows = [
    {
      id: 30000100001, user_id: 2030100001, slot: '武器', name: '甲剑', created_at: 1,
      payload: JSON.stringify({
        lines: [
          { key: 'dawai', val: 85.2 }, { key: 'jin', val: 54 }, { key: 'wuqizeng', val: 7 },
        ],
        dingyin: { name: '外功穿透', val: 12 },
        schools: [],
      }),
    },
    {
      id: 30000100002, user_id: 2030100001, slot: '冠胄', name: '', created_at: 2,
      payload: JSON.stringify({
        lines: [{ key: 'shu_wx_da', val: 40 }],
        dingyin: null,
        schools: [],
      }),
    },
    {
      id: 30000100003, user_id: 2030100002, slot: '环', name: '乙环', created_at: 3,
      payload: JSON.stringify({ lines: [{ key: 'huiyi', val: 5 }], dingyin: null, schools: [] }),
    },
  ];
  const db = {
    prepare: (sql: string) => {
      const q = {
        _b: [] as unknown[],
        bind(...a: unknown[]) { this._b = a; return this; },
        async all() {
          if (sql.includes('user_gear_items')) {
            return { results: storedRows.filter((r) => r.user_id === Number(this._b[0])) };
          }
          return { results: [] };
        },
        async first() { return null; },
        async run() { return { meta: { changes: 0 } }; },
        async raw() { const res = await this.all(); return (res.results as Array<Record<string, unknown>>).map((r) => Object.values(r)); },
      };
      return q;
    },
    async batch(stmts: Array<{ run: () => Promise<unknown> }>) {
      const out = [];
      for (const s of stmts) out.push(await s.run());
      return out;
    },
  };
  async function gql(query: string, user: unknown) {
    const ctx = {
      env: { DB: db }, request: new Request('http://local/graphql'),
      user, locale: 'zh-CN', browserLocale: 'zh-CN', executionCtx: undefined,
    };
    const res = await yoga.fetch(new Request('http://local/graphql', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    }), ctx as never);
    return res.json() as Promise<any>;
  }
  const QUERY = `{
    gradPage {
      gradPickFromLibraryLabel
      gradLibraryEmptyText
      gradGearItems { id slot name gradSlots lines { key val } dingyin { key val } skipped }
    }
  }`;

  it('serves the viewer their own library, pre-translated and slot-tagged', async () => {
    const r = await gql(QUERY, { userId: 2030100001, discordId: 'user-a', name: 'A' });
    expect(r.errors).toBeUndefined();
    expect(r.data.gradPage.gradPickFromLibraryLabel).toBe('从装备库选');
    expect(r.data.gradPage.gradLibraryEmptyText).toBe('这个部位在装备库里还没有装备');
    expect(r.data.gradPage.gradGearItems).toEqual([
      {
        id: '30000100001', slot: '武器', name: '甲剑',
        gradSlots: ['mainWeapon', 'offWeapon'],
        lines: [{ key: 'max_atk', val: 85.2 }, { key: 'power', val: 54 }],
        dingyin: { key: 'phys_pen', val: 12 },
        skipped: 1,
      },
      {
        id: '30000100002', slot: '冠胄', name: '',
        gradSlots: ['head'],
        lines: [{ key: 'class_atk_max', val: 40 }],
        dingyin: null,
        skipped: 0,
      },
    ]);
  });

  it('never serves another user their library', async () => {
    const r = await gql(QUERY, { userId: 2030100002, discordId: 'user-b', name: 'B' });
    expect(r.data.gradPage.gradGearItems.map((g: any) => g.name)).toEqual(['乙环']);
  });

  it('anonymous callers get an empty list (and the picker copy still resolves)', async () => {
    const r = await gql(QUERY, null);
    expect(r.errors).toBeUndefined();
    expect(r.data.gradPage.gradGearItems).toEqual([]);
    expect(r.data.gradPage.gradPickFromLibraryLabel).toBe('从装备库选');
  });
});

describe('gradSlotIdsForGearSlot', () => {
  it('weapon-pool items serve both weapon positions', () => {
    expect(gradSlotIdsForGearSlot('武器')).toEqual(['mainWeapon', 'offWeapon']);
  });

  it('other library slots map to the graduation slot of the same name', () => {
    expect(gradSlotIdsForGearSlot('冠胄')).toEqual(['head']);
    expect(gradSlotIdsForGearSlot('胸甲')).toEqual(['body']);
    expect(gradSlotIdsForGearSlot('胫甲')).toEqual(['legs']);
    expect(gradSlotIdsForGearSlot('腕甲')).toEqual(['wrist']);
    expect(gradSlotIdsForGearSlot('环')).toEqual(['ring']);
    expect(gradSlotIdsForGearSlot('佩')).toEqual(['pendant']);
  });

  it('legacy weapon position names normalize into the weapon pool', () => {
    expect(gradSlotIdsForGearSlot('主武器')).toEqual(['mainWeapon', 'offWeapon']);
    expect(gradSlotIdsForGearSlot('副武器')).toEqual(['mainWeapon', 'offWeapon']);
  });

  it('unknown slots serve nothing', () => {
    expect(gradSlotIdsForGearSlot('不存在的部位')).toEqual([]);
    expect(gradSlotIdsForGearSlot('')).toEqual([]);
  });
});
