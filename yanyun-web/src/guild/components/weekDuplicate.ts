// The join refusal that asks for a second confirmation: the member
// already holds a seat in another grouping in the same week
// (backend error code alreadyBookedThisWeek). The join UI branches
// on the code — never on the message text — shows the payload's
// server-localized message (it names the booked grouping) in a
// confirmation dialog, and resubmits with the confirm flag when the
// member agrees.
export const WEEK_DUPLICATE_ERROR_CODE = 'alreadyBookedThisWeek';

export function isWeekDuplicateRefusal(
  payload: { errorCode?: string | null } | null | undefined,
): boolean {
  return payload != null && payload.errorCode === WEEK_DUPLICATE_ERROR_CODE;
}
