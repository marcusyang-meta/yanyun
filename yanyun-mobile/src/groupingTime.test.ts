import { describe, expect, it } from 'vitest';

import {
  calendarDayDiff, dateStripDays, dateStripIndex, minuteWheelValues, zonedEchoParts,
} from './groupingTime';

// Local-calendar cases: construct from local parts so the expectations
// hold in whatever zone the test runner sits in.
const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);

describe('dateStripDays', () => {
  it('create mode: exactly 14 days starting today when today is selected', () => {
    const today = local(2026, 11, 2, 17, 24);
    const days = dateStripDays(today, today);
    expect(days).toHaveLength(14);
    expect(days[0]).toEqual(local(2026, 11, 2));
    expect(days[13]).toEqual(local(2026, 11, 15));
    expect(dateStripIndex(days, today)).toBe(0);
  });

  it('a selection at the far edge of the fortnight keeps the 14-day window', () => {
    const today = local(2026, 11, 2);
    const days = dateStripDays(today, local(2026, 11, 15));
    expect(days).toHaveLength(14);
    expect(dateStripIndex(days, local(2026, 11, 15))).toBe(13);
  });

  it('an edit date beyond the fortnight extends the window to contain it', () => {
    const today = local(2026, 11, 2);
    const far = local(2026, 11, 22); // +20 days
    const days = dateStripDays(today, far);
    expect(days).toHaveLength(21);
    expect(days[0]).toEqual(local(2026, 11, 2));
    expect(days[20]).toEqual(far);
    expect(dateStripIndex(days, far)).toBe(20);
  });

  it('a past edit date pulls the window start back, never dropping the date', () => {
    const today = local(2026, 11, 10);
    const past = local(2026, 11, 7); // -3 days
    const days = dateStripDays(today, past);
    expect(days[0]).toEqual(past);
    expect(days).toHaveLength(17); // -3 .. +13
    expect(dateStripIndex(days, past)).toBe(0);
  });

  it('rolls over month and year boundaries by calendar, not by ms math', () => {
    const today = local(2026, 12, 30);
    const days = dateStripDays(today, local(2027, 1, 5));
    expect(days[0]).toEqual(local(2026, 12, 30));
    expect(days[2]).toEqual(local(2027, 1, 1));
    expect(dateStripIndex(days, local(2027, 1, 5))).toBe(6);
    expect(calendarDayDiff(local(2026, 12, 30), local(2027, 1, 5))).toBe(6);
  });
});

describe('minuteWheelValues', () => {
  it('on-step minutes yield exactly the four quarter steps', () => {
    for (const m of [0, 15, 30, 45]) expect(minuteWheelValues(m)).toEqual([0, 15, 30, 45]);
  });

  it('an off-step preserved minute is inserted in sorted position', () => {
    expect(minuteWheelValues(37)).toEqual([0, 15, 30, 37, 45]);
    expect(minuteWheelValues(7)).toEqual([0, 7, 15, 30, 45]);
    expect(minuteWheelValues(59)).toEqual([0, 15, 30, 45, 59]);
  });
});

describe('zonedEchoParts', () => {
  // 2026-11-02 is a Monday; US DST ended 2026-11-01, so both zones
  // are on standard time (EST = UTC-5, PST = UTC-8).
  it('same instant, both zones: weekday and wall clock per zone', () => {
    const instant = new Date('2026-11-03T01:00:00Z'); // Mon 20:00 EST / Mon 17:00 PST
    expect(zonedEchoParts(instant, 'America/New_York', 'zh-CN')).toEqual({ weekday: '周一', time: '20:00' });
    expect(zonedEchoParts(instant, 'America/Los_Angeles', 'zh-CN')).toEqual({ weekday: '周一', time: '17:00' });
  });

  it('weekday follows each zone’s own calendar when the zones straddle midnight', () => {
    const instant = new Date('2026-11-02T06:30:00Z'); // Mon 01:30 EST / Sun 22:30 PST
    expect(zonedEchoParts(instant, 'America/New_York', 'zh-CN')).toEqual({ weekday: '周一', time: '01:30' });
    expect(zonedEchoParts(instant, 'America/Los_Angeles', 'zh-CN')).toEqual({ weekday: '周日', time: '22:30' });
  });

  it('weekday names come from the requested locale, never a hardcoded table', () => {
    const instant = new Date('2026-11-03T01:00:00Z');
    expect(zonedEchoParts(instant, 'America/New_York', 'en').weekday).toBe('Mon');
    expect(zonedEchoParts(instant, 'America/New_York', 'zh-TW').weekday).toBe('週一');
  });
});
