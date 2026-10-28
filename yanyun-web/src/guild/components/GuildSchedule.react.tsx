import { useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation, useRelayEnvironment } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import GroupingForm, { type GroupingFormText } from './GroupingForm.react.tsx';

// Guild schedule surface (F5 availability + F13 time polls), member
// branch only. Availability slots travel as UTC weekday/minutes and
// are edited in the viewer's local timezone: conversion anchors on
// the current week's Sunday and maps a local (weekday, minutes)
// window to its UTC twin (and back). A window that would cross a
// UTC day boundary clamps to that day's 24:00 — weekly patterns are
// coarse scheduling signals, not appointments.
// All copy comes from the guildSchedulePage shell; this component
// holds no UI strings.

const ScheduleQueryNode = graphql`
  query GuildScheduleQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
    }
    guildSchedulePage(slug: $slug) {
      slug
      weekdayNames
      myAvailability { weekday startMinute endMinute }
      availabilitySummary { discordId displayName slots { weekday startMinute endMinute } }
      polls {
        id
        title
        status
        creatorName
        createdAtText
        myOptionIds
        options { id startsAtUtc startsAtText voteCount voterNames votedByMe }
        closeActions { closeLabel }
        launchActions { launchLabel }
      }
      formCreateTitle
      formEditTitle
      formTypeLabel
      formTypeActivityLabel
      formTypeTalentLabel
      formTypeRaceLabel
      formTypeTowerLabel
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
      formDungeonLabel
      formDungeonNoneLabel
      formNicknameLabel
      formNicknamePlaceholder
      formSectLabel
      formCancelLabel
      formSubmitCreateLabel
      formSubmitEditLabel
      formSubmittingLabel
      formToastSect
      formToastSaved
      formToastSaveFailedTemplate
      formToastPosted
      formToastCreateFailedTemplate
      formTitleTemplate
      formCustomFieldsTitle
      formCustomFieldAddLabel
      formCustomFieldLabelPlaceholder
      formCustomFieldTypeText
      formCustomFieldTypeChoice
      formCustomFieldOptionsPlaceholder
      formCustomFieldRequiredLabel
      formCustomFieldRemoveLabel
      formCustomFieldEmptyText
      typeShortActivity
      typeShortTalent
      typeShortRace
      typeShortTower
      scheduleTitle
      scheduleMyTitle
      scheduleMyHint
      scheduleSlotRangeTemplate
      scheduleAddSlotLabel
      scheduleRemoveLabel
      scheduleSaveLabel
      scheduleSavedText
      scheduleSaveFailedTemplate
      scheduleEmptyMineText
      scheduleSummaryTitle
      scheduleSummaryHint
      scheduleSummaryEmptyText
      schedulePollsTitle
      schedulePollsHint
      schedulePollEmptyText
      schedulePollCreateLabel
      schedulePollTitleLabel
      schedulePollTitlePlaceholder
      schedulePollCandidatesLabel
      schedulePollAddCandidateLabel
      schedulePollSubmitLabel
      schedulePollVoteLabel
      schedulePollVotedText
      schedulePollStatusOpenText
      schedulePollStatusClosedText
      schedulePollCloseLabel
      schedulePollVoteCountTemplate
      schedulePollLaunchLabel
      schedulePollCancelLabel
      scheduleToastPollCreated
      scheduleToastVoted
      scheduleToastClosed
      scheduleToastFailedTemplate
    }
  }
`;

const SetAvailabilityMutationNode = graphql`
  mutation GuildScheduleSetAvailabilityMutation($input: SetAvailabilityInput!) {
    setMyAvailability(input: $input) {
      ok
      error
      errorCode
      slots { weekday startMinute endMinute }
    }
  }
`;

const CreatePollMutationNode = graphql`
  mutation GuildScheduleCreatePollMutation($input: CreateTimePollInput!) {
    createTimePoll(input: $input) {
      ok
      error
      errorCode
      poll { id }
    }
  }
`;

const VotePollMutationNode = graphql`
  mutation GuildScheduleVotePollMutation($input: VoteTimePollInput!) {
    voteTimePoll(input: $input) {
      ok
      error
      errorCode
      poll {
        id
        myOptionIds
        options { id voteCount voterNames votedByMe }
      }
    }
  }
`;

const ClosePollMutationNode = graphql`
  mutation GuildScheduleClosePollMutation($id: ID!) {
    closeTimePoll(id: $id) {
      ok
      error
      errorCode
      poll { id status }
    }
  }
`;

/* ---- UTC <-> local weekly-slot conversion (reference-week anchor) ---- */
interface UtcSlot { weekday: number; startMinute: number; endMinute: number }
interface LocalSlot { weekday: number; start: string; end: string } // HH:MM in local time

function refSunday(): Date {
  const n = new Date();
  const d = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
const parseHhmm = (v: string) => {
  const [h, m] = v.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
};

function utcToLocal(slot: UtcSlot): LocalSlot {
  // Anchor the UTC weekday/minutes onto the reference week's UTC
  // calendar, then read the same instants back in local time — the
  // whole window shifts coherently, so a UTC window that ends at
  // 24:00 simply shows its local clock time on the shifted day.
  const base = refSunday();
  const y = base.getFullYear(), m = base.getMonth(), d = base.getDate();
  const start = new Date(Date.UTC(y, m, d + slot.weekday, 0, slot.startMinute));
  const end = new Date(Date.UTC(y, m, d + slot.weekday, 0, slot.endMinute));
  return {
    weekday: start.getDay(),
    start: hhmm(start.getHours() * 60 + start.getMinutes()),
    end: hhmm(end.getHours() * 60 + end.getMinutes()),
  };
}

function localToUtc(slot: LocalSlot): UtcSlot {
  const base = refSunday();
  const start = new Date(base);
  start.setDate(base.getDate() + slot.weekday);
  start.setMinutes(parseHhmm(slot.start), 0, 0);
  const end = new Date(base);
  end.setDate(base.getDate() + slot.weekday);
  end.setMinutes(parseHhmm(slot.end), 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  const startUtcMin = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endUtcMinRaw = end.getUTCHours() * 60 + end.getUTCMinutes();
  const endUtcDay = end.getUTCDay();
  const startUtcDay = start.getUTCDay();
  // Representable windows live inside one UTC day; a window ending
  // exactly at the next UTC midnight becomes endMinute 1440, and any
  // other spill clamps to 1440 of the start day.
  const endMinute = endUtcDay === startUtcDay && endUtcMinRaw > startUtcMin
    ? endUtcMinRaw
    : 1440;
  return { weekday: startUtcDay, startMinute: startUtcMin, endMinute };
}

const sectionTitle: React.CSSProperties = { fontSize: 17, color: theme.goldHi, letterSpacing: 2, marginBottom: 6 };
const hintStyle: React.CSSProperties = { fontSize: 12.5, color: theme.muted, lineHeight: 1.7, marginBottom: 14 };
const inputStyle: React.CSSProperties = {
  background: '#1e1b15', border: '1px solid rgba(201,163,92,.3)', color: theme.paper,
  borderRadius: 8, padding: '9px 10px', fontSize: 14, boxSizing: 'border-box',
};
const ghostBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
  border: `1px solid ${theme.gold}`, color: theme.goldHi, fontSize: 13, whiteSpace: 'nowrap',
};

export function GuildScheduleRoute({ slug, defaultNickname }: { slug: string; defaultNickname?: string }) {
  const environment = useRelayEnvironment();
  const data = useLazyLoadQuery<any>(ScheduleQueryNode, { slug }, { fetchPolicy: 'store-or-network' });
  // A freshly created poll is a new record the list field does not
  // know about; refetch the page query to pull it in (vote/close
  // payloads normalize onto the listed poll records by id already).
  const refetchPage = () => { fetchQuery(environment, ScheduleQueryNode, { slug }).toPromise().catch(() => {}); };
  const page: any = data?.guildSchedulePage ?? {};
  const unknownErrorText: string = data?.viewer?.commonUnknownErrorText ?? '';
  const weekdayNames: string[] = page.weekdayNames ?? [];
  const fail = (error?: string | null) => toast(fill(page.scheduleToastFailedTemplate ?? '', { error: error || unknownErrorText }));

  /* ---------- my availability ---------- */
  const [mySlots, setMySlots] = useState<LocalSlot[] | null>(null);
  const slots: LocalSlot[] = mySlots ?? (page.myAvailability ?? []).map((s: UtcSlot) => utcToLocal(s));
  const [commitAvail, savingAvail] = useMutation<any>(SetAvailabilityMutationNode);
  const saveAvailability = () => {
    const utc = slots
      .filter((s) => parseHhmm(s.end) > parseHhmm(s.start))
      .map((s) => localToUtc(s));
    commitAvail({
      variables: { input: { slug, slots: utc } },
      onCompleted: (res: any) => {
        if (res.setMyAvailability?.ok) {
          toast(page.scheduleSavedText);
          // The page query is not refetched by the payload; mirror the
          // server's normalized (sorted, UTC) set back into local time.
          setMySlots((res.setMyAvailability.slots ?? []).map((s: UtcSlot) => utcToLocal(s)));
        } else toast(fill(page.scheduleSaveFailedTemplate ?? '', { error: res.setMyAvailability?.error || unknownErrorText }));
      },
      onError: (e: any) => toast(fill(page.scheduleSaveFailedTemplate ?? '', { error: e.message })),
    });
  };

  /* ---------- polls ---------- */
  const [picks, setPicks] = useState<Record<string, Set<string>>>({});
  const [commitVote, voting] = useMutation<any>(VotePollMutationNode);
  const [commitClose, closing] = useMutation<any>(ClosePollMutationNode);
  const [commitCreate, creating] = useMutation<any>(CreatePollMutationNode);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [candidates, setCandidates] = useState<string[]>(['', '']);
  const [launch, setLaunch] = useState<{ pollTitle: string; startsAtUtc: number } | null>(null);

  const togglePick = (pollId: string, optionId: string, initial: string[]) => {
    setPicks((prev) => {
      const cur = new Set(prev[pollId] ?? initial);
      if (cur.has(optionId)) cur.delete(optionId); else cur.add(optionId);
      return { ...prev, [pollId]: cur };
    });
  };
  const submitVote = (poll: any) => {
    const optionIds = [...(picks[poll.id] ?? new Set<string>(poll.myOptionIds ?? []))];
    commitVote({
      variables: { input: { pollId: poll.id, optionIds } },
      onCompleted: (res: any) => {
        if (res.voteTimePoll?.ok) toast(page.scheduleToastVoted);
        else fail(res.voteTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };
  const closePoll = (poll: any) => {
    commitClose({
      variables: { id: poll.id },
      onCompleted: (res: any) => {
        if (res.closeTimePoll?.ok) toast(page.scheduleToastClosed);
        else fail(res.closeTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };
  const createPoll = () => {
    const times = candidates.filter((c) => c).map((c) => String(Math.floor(new Date(c).getTime() / 1000)));
    commitCreate({
      variables: { input: { slug, title: pollTitle.trim(), candidateStartsAt: times } },
      onCompleted: (res: any) => {
        if (res.createTimePoll?.ok) {
          toast(page.scheduleToastPollCreated);
          refetchPage();
          setCreatingPoll(false);
          setPollTitle('');
          setCandidates(['', '']);
        } else fail(res.createTimePoll?.error);
      },
      onError: (e: any) => fail(e.message),
    });
  };

  const formText: GroupingFormText = { ...page, unknownErrorText };
  const summary: any[] | null = page.availabilitySummary ?? null;
  const polls: any[] = page.polls ?? [];

  return (
    <div data-schedule-page>
      {/* ---------- F5: my availability ---------- */}
      <div style={sectionTitle}>{page.scheduleMyTitle}</div>
      <div style={hintStyle}>{page.scheduleMyHint}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((wd) => (
          <div key={wd} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ width: 44, flexShrink: 0, fontSize: 13.5, color: theme.paper, paddingTop: 9 }}>{weekdayNames[wd] ?? ''}</span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
              {slots.map((s, i) => (s.weekday === wd ? (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="time" value={s.start} data-avail-start={wd}
                    onChange={(e) => setMySlots(slots.map((x, xi) => (xi === i ? { ...x, start: e.target.value } : x)))}
                    style={{ ...inputStyle, width: 118 }} />
                  <span style={{ color: theme.muted }}>–</span>
                  <input type="time" value={s.end} data-avail-end={wd}
                    onChange={(e) => setMySlots(slots.map((x, xi) => (xi === i ? { ...x, end: e.target.value } : x)))}
                    style={{ ...inputStyle, width: 118 }} />
                  <button onClick={() => setMySlots(slots.filter((_, xi) => xi !== i))}
                    style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>{page.scheduleRemoveLabel}</button>
                </div>
              ) : null))}
            </div>
            <button data-avail-add={wd}
              onClick={() => setMySlots([...slots, { weekday: wd, start: '19:00', end: '22:00' }])}
              style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>{page.scheduleAddSlotLabel}</button>
          </div>
        ))}
      </div>
      {!slots.length && <div style={{ fontSize: 13, color: theme.muted, marginBottom: 10 }}>{page.scheduleEmptyMineText}</div>}
      <button onClick={saveAvailability} disabled={savingAvail} className="yy-btn yy-btn-gold"
        style={{ padding: '9px 26px', fontSize: 14 }}>{page.scheduleSaveLabel}</button>

      {/* ---------- F5: summary (admins / car leaders only; the field itself is the verdict) ---------- */}
      {summary && (
        <div style={{ marginTop: 34 }}>
          <div style={sectionTitle}>{page.scheduleSummaryTitle}</div>
          <div style={hintStyle}>{page.scheduleSummaryHint}</div>
          {!summary.length && <div style={{ fontSize: 13, color: theme.muted }}>{page.scheduleSummaryEmptyText}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {summary.map((m) => (
              <div key={m.discordId} style={{ border: theme.border, borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 14, color: theme.goldHi }}>{m.displayName}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {(m.slots ?? []).map((s: UtcSlot, i: number) => {
                    const l = utcToLocal(s);
                    return (
                      <span key={i} style={{ fontSize: 12, color: theme.paper, border: '1px solid rgba(201,163,92,.35)', borderRadius: 6, padding: '2px 8px' }}>
                        {weekdayNames[l.weekday] ?? ''} {fill(page.scheduleSlotRangeTemplate ?? '', { start: l.start, end: l.end })}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- F13: time polls ---------- */}
      <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...sectionTitle, marginBottom: 0, flex: 1 }}>{page.schedulePollsTitle}</div>
        {!creatingPoll && (
          <button onClick={() => setCreatingPoll(true)} style={ghostBtn}>{page.schedulePollCreateLabel}</button>
        )}
      </div>
      <div style={hintStyle}>{page.schedulePollsHint}</div>

      {creatingPoll && (
        <div style={{ border: theme.border, borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{page.schedulePollTitleLabel}</div>
          <input value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} placeholder={page.schedulePollTitlePlaceholder}
            style={{ ...inputStyle, width: '100%', marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{page.schedulePollCandidatesLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {candidates.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="datetime-local" value={c} data-poll-candidate={i}
                  onChange={(e) => setCandidates(candidates.map((x, xi) => (xi === i ? e.target.value : x)))}
                  style={{ ...inputStyle, flex: 1 }} />
                {candidates.length > 2 && (
                  <button onClick={() => setCandidates(candidates.filter((_, xi) => xi !== i))}
                    style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>{page.scheduleRemoveLabel}</button>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {candidates.length < 8 && (
              <button onClick={() => setCandidates([...candidates, ''])} style={ghostBtn}>{page.schedulePollAddCandidateLabel}</button>
            )}
            <span style={{ flex: 1 }} />
            <button onClick={() => setCreatingPoll(false)} style={ghostBtn}>{page.schedulePollCancelLabel}</button>
            <button onClick={createPoll} disabled={creating} className="yy-btn yy-btn-gold" style={{ padding: '8px 22px', fontSize: 14 }}>
              {page.schedulePollSubmitLabel}
            </button>
          </div>
        </div>
      )}

      {!polls.length && <div style={{ fontSize: 13, color: theme.muted }}>{page.schedulePollEmptyText}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {polls.map((poll) => {
          const myPicks = picks[poll.id] ?? new Set<string>(poll.myOptionIds ?? []);
          const open = poll.status === 'open';
          return (
            <div key={poll.id} style={{ border: theme.border, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, color: theme.goldHi, flex: 1, minWidth: 140 }}>{poll.title}</span>
                <span style={{
                  fontSize: 12, borderRadius: 4, padding: '2px 8px',
                  color: open ? '#7fc97f' : theme.muted, border: `1px solid ${open ? '#7fc97f' : theme.muted}`,
                }}>{open ? page.schedulePollStatusOpenText : page.schedulePollStatusClosedText}</span>
                {poll.closeActions && (
                  <button onClick={() => closePoll(poll)} disabled={closing} style={{ ...ghostBtn, padding: '5px 12px', fontSize: 12 }}>
                    {poll.closeActions.closeLabel}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {(poll.options ?? []).map((o: any) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: open ? 'pointer' : 'default', flex: 1, minWidth: 200 }}>
                      <input type="checkbox" disabled={!open} checked={myPicks.has(o.id)}
                        onChange={() => togglePick(poll.id, o.id, poll.myOptionIds ?? [])} />
                      <span style={{ fontSize: 14, color: theme.paper }}>{o.startsAtText}</span>
                    </label>
                    <span style={{ fontSize: 12.5, color: theme.goldHi }}>
                      {fill(page.schedulePollVoteCountTemplate ?? '', { count: o.voteCount })}
                    </span>
                    {poll.launchActions && (
                      <button data-poll-launch={o.id}
                        onClick={() => setLaunch({ pollTitle: poll.title, startsAtUtc: o.startsAtUtc })}
                        style={{ ...ghostBtn, padding: '5px 12px', fontSize: 12 }}>{poll.launchActions.launchLabel}</button>
                    )}
                  </div>
                ))}
              </div>
              {(poll.options ?? []).some((o: any) => (o.voterNames ?? []).length) && (
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 8, lineHeight: 1.7 }}>
                  {(poll.options ?? []).filter((o: any) => (o.voterNames ?? []).length)
                    .map((o: any) => `${o.startsAtText}: ${(o.voterNames ?? []).join('、')}`).join('；')}
                </div>
              )}
              {open && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <button onClick={() => submitVote(poll)} disabled={voting} className="yy-btn yy-btn-gold" style={{ padding: '8px 22px', fontSize: 13.5 }}>
                    {page.schedulePollVoteLabel}
                  </button>
                  {(poll.myOptionIds ?? []).length > 0 && <span style={{ fontSize: 12, color: theme.muted }}>{page.schedulePollVotedText}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Launch handoff: the standard create form, prefilled with the
          picked candidate — the human still reviews and posts the car. */}
      {launch && (
        <GroupingForm
          slug={slug}
          mode="create"
          text={formText}
          defaultNickname={defaultNickname}
          initial={{ title: launch.pollTitle, type: 'ACTIVITY', startsAt: String(launch.startsAtUtc) }}
          onClose={() => setLaunch(null)}
          onDone={() => setLaunch(null)}
        />
      )}
    </div>
  );
}
