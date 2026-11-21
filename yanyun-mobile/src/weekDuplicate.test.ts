import { describe, expect, it } from 'vitest';

import { isWeekDuplicateRefusal, WEEK_DUPLICATE_ERROR_CODE } from './weekDuplicate';

describe('isWeekDuplicateRefusal', () => {
  it('matches the weekly-duplicate refusal code', () => {
    expect(WEEK_DUPLICATE_ERROR_CODE).toBe('alreadyBookedThisWeek');
    expect(isWeekDuplicateRefusal({ errorCode: 'alreadyBookedThisWeek' })).toBe(true);
  });

  it('does not match other failures or empty payloads', () => {
    expect(isWeekDuplicateRefusal({ errorCode: 'groupingFull' })).toBe(false);
    expect(isWeekDuplicateRefusal({ errorCode: 'alreadyJoined' })).toBe(false);
    expect(isWeekDuplicateRefusal({ errorCode: null })).toBe(false);
    expect(isWeekDuplicateRefusal({})).toBe(false);
    expect(isWeekDuplicateRefusal(null)).toBe(false);
    expect(isWeekDuplicateRefusal(undefined)).toBe(false);
  });
});
