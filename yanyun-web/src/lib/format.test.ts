import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// All cases are stated in the viewer's zone; pin it before format.ts is
// evaluated (its Intl formatters snapshot the default zone at construction).
vi.hoisted(() => {
  process.env.TZ = 'America/Los_Angeles';
});

// Pin the UI locale to zh-CN (the label shape in the bug report); the
// epoch assertions are locale-independent, only the label punctuation
// differs by locale.
vi.mock('./locale', () => ({ readPrefMirror: () => 'zh-CN' }));

import { getWeekRange, weekRangeLabel } from './format';

// Mirror of the server's weekWindowUtc
// (yanyun-signup/src/domains/platform/blocks.ts) — the authority the
// client range must agree with, second for second.
function weekWindowUtc(weekOffset = 0): [number, number] {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  const startUtc = monday - 8 * 3600 + (weekOffset | 0) * 7 * 86400;
  return [startUtc, startUtc + 7 * 86400];
}

// The pre-fix implementation, kept verbatim as a regression oracle: in a
// week with no DST transition it must agree with the new one, and in the
// fall-back week its far endpoint is the one that was an hour late.
function oldGetWeekRange(weekOffset: number): { start: Date; end: Date } {
  const now = new Date();
  const beijing = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const day = beijing.getDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(beijing);
  monday.setDate(beijing.getDate() - daysSinceMonday + weekOffset * 7);
  monday.setHours(5, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const toLocal = (bj: Date) => new Date(bj.getTime() - (8 * 60 + new Date().getTimezoneOffset()) * 60000);
  return { start: toLocal(monday), end: toLocal(nextMonday) };
}

describe('getWeekRange (America/Los_Angeles)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function expectServerParity() {
    for (const offset of [-1, 0, 1]) {
      const [startUtc, endUtc] = weekWindowUtc(offset);
      const { start, end } = getWeekRange(offset);
      expect(start.getTime() / 1000).toBe(startUtc);
      expect(end.getTime() / 1000).toBe(endUtc);
    }
  }

  it('fall-back week: the next boundary is 13:00 PST, not 14:00', () => {
    vi.setSystemTime(new Date('2026-10-31T12:00:00')); // Sat, still PDT
    const { start, end } = getWeekRange(0);
    expect(start.getTime()).toBe(Date.UTC(2026, 9, 25, 21, 0, 0)); // Mon 10/26 05:00 Beijing
    expect(end.getTime()).toBe(Date.UTC(2026, 10, 1, 21, 0, 0)); // Mon 11/2 05:00 Beijing
    expect(weekRangeLabel(0)).toBe('10/25 14:00 – 11/1 12:59');
    expectServerParity();
    // Bug lock: the old round-trip put this endpoint an hour later.
    expect(oldGetWeekRange(0).end.getTime() - end.getTime()).toBe(3600 * 1000);
  });

  it('spring-forward week: the next boundary lands under PDT', () => {
    vi.setSystemTime(new Date('2027-03-10T12:00:00')); // Wed, still PST
    const { start, end } = getWeekRange(0);
    expect(start.getTime()).toBe(Date.UTC(2027, 2, 7, 21, 0, 0)); // Mon 3/8 05:00 Beijing
    expect(end.getTime()).toBe(Date.UTC(2027, 2, 14, 21, 0, 0)); // Mon 3/15 05:00 Beijing
    expect(weekRangeLabel(0)).toBe('3/7 13:00 – 3/14 13:59');
    expectServerParity();
  });

  it('ordinary week: identical to the old implementation', () => {
    vi.setSystemTime(new Date('2026-10-21T12:00:00')); // Wed PDT, no transition in range
    const { start, end } = getWeekRange(0);
    expect(start.getTime()).toBe(Date.UTC(2026, 9, 18, 21, 0, 0));
    expect(end.getTime()).toBe(Date.UTC(2026, 9, 25, 21, 0, 0));
    expect(weekRangeLabel(0)).toBe('10/18 14:00 – 10/25 13:59');
    const old = oldGetWeekRange(0);
    expect(start.getTime()).toBe(old.start.getTime());
    expect(end.getTime()).toBe(old.end.getTime());
    expectServerParity();
  });
});
