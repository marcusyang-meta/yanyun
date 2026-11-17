import { describe, expect, it } from 'vitest';
import { buildGuildTabEntries } from './guildTabEntries';

const FULL_LABELS = [
  ['team', '组队'],
  ['dex', '攻略'],
  ['sect', '流派攻略'],
  ['announcements', '公告'],
  ['schedule', '排期'],
] as const;

describe('buildGuildTabEntries', () => {
  it('returns null without shell labels (no composed section set, no capsule)', () => {
    expect(buildGuildTabEntries({ sectionLabels: null, section: 'team' })).toBeNull();
  });

  it('maps the five capsule entries in shell order, profile last', () => {
    const entries = buildGuildTabEntries({ sectionLabels: FULL_LABELS, section: 'team', profileLabel: '个人设置' });
    expect(entries?.map((e) => e.key)).toEqual(['team', 'dex', 'announcements', 'schedule', 'profile']);
    expect(entries?.map((e) => e.icon)).toEqual(['team', 'dex', 'announcements', 'schedule', 'profile']);
    expect(entries?.[4].label).toBe('个人设置');
  });

  it('folds sect into the dex (攻略) entry instead of giving it its own slot', () => {
    const entries = buildGuildTabEntries({ sectionLabels: FULL_LABELS, section: 'team' });
    expect(entries?.some((e) => e.key === 'sect')).toBe(false);
    expect(entries?.find((e) => e.key === 'dex')?.label).toBe('攻略');
  });

  it('marks 攻略 active for both guide sections', () => {
    for (const section of ['dex', 'sect']) {
      const entries = buildGuildTabEntries({ sectionLabels: FULL_LABELS, section });
      expect(entries?.find((e) => e.key === 'dex')?.active).toBe(true);
      expect(entries?.find((e) => e.key === 'team')?.active).toBe(false);
    }
  });

  it('omits conditional sections whose labels the shell did not carry', () => {
    const entries = buildGuildTabEntries({
      sectionLabels: [
        ['team', '组队'],
        ['dex', '攻略'],
        ['sect', '流派攻略'],
      ],
      section: 'dex',
    });
    expect(entries?.map((e) => e.key)).toEqual(['team', 'dex', 'profile']);
  });

  it('includes the insights entry only when the shell composed it', () => {
    const entries = buildGuildTabEntries({
      sectionLabels: [...FULL_LABELS, ['insights', '竞速赛季']],
      section: 'insights',
    });
    expect(entries?.map((e) => e.key)).toEqual(['team', 'dex', 'announcements', 'schedule', 'insights', 'profile']);
    expect(entries?.find((e) => e.key === 'insights')?.active).toBe(true);
  });

  it('never marks the profile entry active (it routes, it is not a section)', () => {
    const entries = buildGuildTabEntries({ sectionLabels: FULL_LABELS, section: 'profile' });
    expect(entries?.find((e) => e.key === 'profile')?.active).toBe(false);
  });
});
