import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';

// Weekly availability editor (F5): the ONE editor for a member's
// recurring weekly windows in one guild. It used to live on the guild
// schedule tab; marcus ruled (2026-10-27) that availability is
// personal data, so the editor now lives in personal settings (web:
// a SettingsDialog page; mobile: under Profile) and the schedule tab
// keeps only a text link here. Data, storage and the UTC slot shape
// are unchanged — this component still writes through
// setMyAvailability with the guild slug.
//
// Slots travel as UTC weekday/minutes and are edited in the viewer's
// local timezone: conversion anchors on the current week's Sunday
// and maps a local (weekday, minutes) window to its UTC twin (and
// back). A window that would cross a UTC day boundary clamps to that
// day's 24:00 — weekly patterns are coarse scheduling signals, not
// appointments. All copy arrives via the text prop (backend-issued);
// this component holds no UI strings.

export interface UtcSlot { weekday: number; startMinute: number; endMinute: number }
export interface LocalSlot { weekday: number; start: string; end: string } // HH:MM in local time

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

export function utcToLocal(slot: UtcSlot): LocalSlot {
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

const SetAvailabilityMutationNode = graphql`
  mutation AvailabilityEditorSetAvailabilityMutation($input: SetAvailabilityInput!) {
    setMyAvailability(input: $input) {
      ok
      error
      errorCode
      slots { weekday startMinute endMinute }
    }
  }
`;

export interface AvailabilityEditorText {
  weekdayNames: string[];
  addSlotLabel: string;
  removeLabel: string;
  saveLabel: string;
  savedText: string;
  saveFailedTemplate: string;
  emptyText: string;
  unknownErrorText: string;
}

const inputStyle: React.CSSProperties = {
  background: '#1e1b15', border: '1px solid rgba(67,160,134,.3)', color: theme.paper,
  borderRadius: 8, padding: '9px 10px', fontSize: 14, boxSizing: 'border-box',
};
const ghostBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
  border: `1px solid ${theme.accent}`, color: theme.accentHi, fontSize: 13, whiteSpace: 'nowrap',
};

export default function AvailabilityEditor({ slug, initialSlots, text }: {
  slug: string;
  initialSlots: UtcSlot[];
  text: AvailabilityEditorText;
}) {
  const weekdayNames = text.weekdayNames ?? [];
  const [mySlots, setMySlots] = useState<LocalSlot[] | null>(null);
  const slots: LocalSlot[] = mySlots ?? (initialSlots ?? []).map((s: UtcSlot) => utcToLocal(s));
  const [commitAvail, savingAvail] = useMutation<any>(SetAvailabilityMutationNode);
  const saveAvailability = () => {
    const utc = slots
      .filter((s) => parseHhmm(s.end) > parseHhmm(s.start))
      .map((s) => localToUtc(s));
    commitAvail({
      variables: { input: { slug, slots: utc } },
      onCompleted: (res: any) => {
        if (res.setMyAvailability?.ok) {
          toast(text.savedText);
          // The page query is not refetched by the payload; mirror the
          // server's normalized (sorted, UTC) set back into local time.
          setMySlots((res.setMyAvailability.slots ?? []).map((s: UtcSlot) => utcToLocal(s)));
        } else toast(fill(text.saveFailedTemplate ?? '', { error: res.setMyAvailability?.error || text.unknownErrorText }));
      },
      onError: (e: any) => toast(fill(text.saveFailedTemplate ?? '', { error: e.message })),
    });
  };

  return (
    <div data-availability-editor={slug}>
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
                    style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>{text.removeLabel}</button>
                </div>
              ) : null))}
            </div>
            <button data-avail-add={wd}
              onClick={() => setMySlots([...slots, { weekday: wd, start: '19:00', end: '22:00' }])}
              style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>{text.addSlotLabel}</button>
          </div>
        ))}
      </div>
      {!slots.length && <div style={{ fontSize: 13, color: theme.muted, marginBottom: 10 }}>{text.emptyText}</div>}
      <button onClick={saveAvailability} disabled={savingAvail} className="yy-btn yy-btn-gold"
        style={{ padding: '9px 26px', fontSize: 14 }}>{text.saveLabel}</button>
    </div>
  );
}
