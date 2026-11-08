import { useState } from 'react';
import { graphql, useMutation, useRelayEnvironment, fetchQuery } from 'react-relay';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, ConfirmButton,
  useAdminMutation, type CommonText,
} from './GuildAdminUi.react.tsx';

// Premium ops engine panel (T2: P8 targeted nudges, P11 churn
// warnings, P14 contribution points). The server composes either
// the full GuildAdminOps object or the GuildAdminOpsLocked variant
// — this component renders whichever it receives; there is no tier
// logic here. All copy is backend fields.
// The P12 season rollover left the paid list (free since
// 2026-11-07): its section renders from the standalone
// seasonRollover field in every tier state — below the rollover
// section of the full panel, under the lock card, or alone when
// the ops field itself is absent.
export type RolloverData = {
  seasonLabel: string; pendingCount: number; previewText: string; seasonText: string;
  gearNoteText: string; thresholdNoteText: string; lastText: string | null;
  pendingNames: string[];
};
export type SeasonRolloverPage = {
  title?: string;
  hint?: string;
  executeLabel?: string;
  rollover?: RolloverData;
};
export type OpsPage = {
  __typename: string;
  premiumTitle?: string;
  premiumBody?: string;
  title?: string;
  hint?: string;
  nudgeTitle?: string;
  nudgeHint?: string;
  nudgeEventLabel?: string;
  nudgeSegmentLabel?: string;
  segmentAllText?: string;
  segmentSchoolText?: string;
  segmentRoleText?: string;
  segmentLapsedText?: string;
  nudgeSegmentValueLabel?: string;
  nudgePreviewLabel?: string;
  nudgeSendLabel?: string;
  nudgeDailyRemainingText?: string | null;
  nudgeEvents?: { id: string; title: string; startsAtText: string; signupCount: number; maxSlots: number }[];
  churnTitle?: string;
  churnHint?: string;
  churnEmptyText?: string;
  churnRisks?: { discordId: string; displayName: string; evidenceText: string; lastText: string }[];
  rolloverTitle?: string;
  rolloverHint?: string;
  rolloverExecuteLabel?: string;
  rollover?: RolloverData;
  pointsTitle?: string;
  pointsHint?: string;
  pointsBoardEmptyText?: string;
  pointsTotalLabel?: string;
  pointsEntriesLabel?: string;
  pointsSaveLabel?: string;
  contributionRules?: { actionKey: string; actionLabel: string; points: number; enabled: boolean }[];
  contributionBoard?: { discordId: string; displayName: string; totalPoints: number; entryCount: number }[];
};

const PreviewQuery = graphql`
  query GuildAdminOpsPreviewQuery($slug: String!, $eventId: ID!, $segmentKind: String!, $segmentValue: String) {
    targetedNudgePreview(slug: $slug, eventId: $eventId, segmentKind: $segmentKind, segmentValue: $segmentValue) {
      __typename
      ... on TargetedNudgePreview {
        candidateCount
        countText
        emptyText
        dailyRemaining
        candidates { discordId displayName knownWeapon knownRole lastText }
      }
    }
  }
`;
const SendMutation = graphql`
  mutation GuildAdminOpsSendMutation($slug: String!, $eventId: ID!, $segmentKind: String!, $segmentValue: String) {
    sendTargetedNudge(slug: $slug, eventId: $eventId, segmentKind: $segmentKind, segmentValue: $segmentValue) {
      ok error recipientCount
    }
  }
`;
const RolloverMutation = graphql`
  mutation GuildAdminOpsRolloverMutation($slug: String!) {
    executeSeasonRollover(slug: $slug) { ok error copiedCount }
  }
`;
const RuleMutation = graphql`
  mutation GuildAdminOpsRuleMutation($slug: String!, $actionKey: String!, $points: Int!, $enabled: Boolean!) {
    updateContributionRule(slug: $slug, actionKey: $actionKey, points: $points, enabled: $enabled) { ok error }
  }
`;

type Preview = {
  candidateCount: number;
  countText: string;
  emptyText: string | null;
  candidates: { discordId: string; displayName: string; knownWeapon: string; knownRole: string; lastText: string }[];
};

/* The season rollover section (P12, free): one renderer for the
 * full panel's section and the standalone seasonRollover field. */
export function RolloverSection({ slug, title, hint, executeLabel, rollover, commonText, refresh }: {
  slug: string;
  title?: string;
  hint?: string;
  executeLabel?: string;
  rollover?: RolloverData;
  commonText: CommonText;
  refresh: () => void;
}) {
  const [commitRollover] = useMutation(RolloverMutation);
  const doRollover = () => {
    commitRollover({
      variables: { slug },
      onCompleted: (resp: any) => {
        const p = resp?.executeSeasonRollover;
        if (p?.ok) refresh();
        else toast(p?.error || commonText.unknownError);
      },
      onError: () => toast(commonText.unknownError),
    });
  };
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{title}</h2>
      <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px' }}>{hint}</p>
      {rollover && (
        <>
          <p style={{ color: theme.paper, fontSize: 13.5, margin: '0 0 4px' }}>{rollover.seasonText}</p>
          <p style={{ color: '#ecd28f', fontSize: 13, margin: '0 0 4px' }}>{rollover.previewText}</p>
          {rollover.pendingNames.length > 0 && (
            <p style={{ color: theme.muted, fontSize: 12.5, margin: '0 0 4px' }}>
              {rollover.pendingNames.join('、')}
            </p>
          )}
          <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 2px' }}>{rollover.gearNoteText}</p>
          <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px' }}>{rollover.thresholdNoteText}</p>
          {rollover.lastText && (
            <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px' }}>{rollover.lastText}</p>
          )}
          <ConfirmButton label={executeLabel || ''} confirmLabel={commonText.confirm}
            onConfirm={doRollover} />
        </>
      )}
    </section>
  );
}

export default function GuildAdminOps({ slug, ops, seasonRollover, commonText, refresh }: {
  slug: string;
  ops: OpsPage | null;
  seasonRollover?: SeasonRolloverPage | null;
  commonText: CommonText;
  refresh: () => void;
}) {
  const environment = useRelayEnvironment();
  const [commitSend] = useMutation(SendMutation);
  const [commitRule] = useMutation(RuleMutation);
  const runRule = useAdminMutation(commitRule, 'updateContributionRule', refresh, commonText.unknownError);

  const [eventId, setEventId] = useState<string>('');
  const [segmentKind, setSegmentKind] = useState('all');
  const [segmentValue, setSegmentValue] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [ruleDrafts, setRuleDrafts] = useState<Record<string, string>>({});

  // The free rollover section rides along in every state (after
  // hooks, so a refresh that lands the ops field cannot change
  // hook order).
  const freeRollover = seasonRollover ? (
    <RolloverSection slug={slug} title={seasonRollover.title} hint={seasonRollover.hint}
      executeLabel={seasonRollover.executeLabel} rollover={seasonRollover.rollover}
      commonText={commonText} refresh={refresh} />
  ) : null;
  // Null = the paid surface does not exist for this guild
  // (unentitled, paygate OFF); only the free rollover section
  // remains on the tab.
  if (!ops) return freeRollover;
  if (ops.__typename === 'GuildAdminOpsLocked') {
    return (
      <>
        <section style={adminSectionStyle}>
          <h2 style={adminSectionTitleStyle}>{ops.premiumTitle}</h2>
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{ops.premiumBody}</p>
        </section>
        {freeRollover}
      </>
    );
  }

  const events = ops.nudgeEvents || [];
  const selectedEvent = eventId || (events[0] ? events[0].id : '');
  const needsValue = segmentKind === 'school' || segmentKind === 'role';

  const doPreview = () => {
    if (!selectedEvent || previewBusy) return;
    setPreviewBusy(true);
    fetchQuery(environment, PreviewQuery, {
      slug, eventId: Number(selectedEvent), segmentKind, segmentValue: needsValue ? segmentValue : '',
    }).toPromise()
      .then((resp: any) => {
        const p = resp?.targetedNudgePreview;
        setPreview(p && p.__typename === 'TargetedNudgePreview' ? p : null);
      })
      .catch(() => toast(commonText.unknownError))
      .finally(() => setPreviewBusy(false));
  };

  const doSend = () => {
    commitSend({
      variables: {
        slug, eventId: Number(selectedEvent), segmentKind,
        segmentValue: needsValue ? segmentValue : '',
      },
      onCompleted: (resp: any) => {
        const p = resp?.sendTargetedNudge;
        if (p?.ok) { setPreview(null); refresh(); }
        else toast(p?.error || commonText.unknownError);
      },
      onError: () => toast(commonText.unknownError),
    });
  };

  const segOptions = [
    { key: 'all', label: ops.segmentAllText },
    { key: 'school', label: ops.segmentSchoolText },
    { key: 'role', label: ops.segmentRoleText },
    { key: 'lapsed', label: ops.segmentLapsedText },
  ];

  return (
    <>
      <p style={{ color: theme.muted, fontSize: 12.5, margin: '4px 0 18px' }}>{ops.hint}</p>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{ops.churnTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{ops.churnHint}</p>
        {(ops.churnRisks || []).length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{ops.churnEmptyText}</p>
        ) : (ops.churnRisks || []).map((r) => (
          <div key={r.discordId} style={{
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline',
            padding: '9px 0', borderTop: '1px solid rgba(201,163,92,.10)',
          }}>
            <span style={{ color: theme.paper, fontSize: 14.5, minWidth: 110 }}>{r.displayName}</span>
            <span style={{ color: '#ecd28f', fontSize: 12.5 }}>{r.evidenceText}</span>
            <span style={{ color: theme.muted, fontSize: 12 }}>{r.lastText}</span>
          </div>
        ))}
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{ops.nudgeTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{ops.nudgeHint}</p>
        {ops.nudgeDailyRemainingText && (
          <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px' }}>{ops.nudgeDailyRemainingText}</p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <label style={{ flex: '1 1 200px' }}>
            <span style={{ color: theme.muted, fontSize: 12 }}>{ops.nudgeEventLabel}</span>
            <select style={{ ...adminInputStyle }} value={selectedEvent}
              onChange={(e) => { setEventId(e.target.value); setPreview(null); }}>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} · {ev.startsAtText} · {ev.signupCount}/{ev.maxSlots}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: '1 1 200px' }}>
            <span style={{ color: theme.muted, fontSize: 12 }}>{ops.nudgeSegmentLabel}</span>
            <select style={{ ...adminInputStyle }} value={segmentKind}
              onChange={(e) => { setSegmentKind(e.target.value); setPreview(null); }}>
              {segOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          {needsValue && (
            <label style={{ flex: '1 1 160px' }}>
              <span style={{ color: theme.muted, fontSize: 12 }}>{ops.nudgeSegmentValueLabel}</span>
              <input style={{ ...adminInputStyle }} value={segmentValue} maxLength={40}
                onChange={(e) => { setSegmentValue(e.target.value); setPreview(null); }} />
            </label>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="yy-btn" style={{ padding: '8px 22px' }}
            disabled={!selectedEvent || previewBusy} onClick={doPreview}>
            {ops.nudgePreviewLabel}
          </button>
          {preview && preview.candidateCount > 0 && (
            <ConfirmButton label={ops.nudgeSendLabel || ''} confirmLabel={commonText.confirm} onConfirm={doSend} />
          )}
        </div>
        {preview && (
          <div style={{ marginTop: 12 }}>
            <p style={{ color: '#ecd28f', fontSize: 13, margin: '0 0 8px' }}>
              {preview.candidateCount > 0 ? preview.countText : preview.emptyText}
            </p>
            {preview.candidates.map((c) => (
              <div key={c.discordId} style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', padding: '6px 0',
                borderTop: '1px solid rgba(201,163,92,.08)',
              }}>
                <span style={{ color: theme.paper, fontSize: 13.5, minWidth: 110 }}>{c.displayName}</span>
                {c.knownWeapon && <span style={{ color: theme.muted, fontSize: 12 }}>{c.knownWeapon}</span>}
                {c.knownRole && <span style={{ color: theme.muted, fontSize: 12 }}>{c.knownRole}</span>}
                <span style={{ color: theme.muted, fontSize: 12 }}>{c.lastText}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <RolloverSection slug={slug} title={ops.rolloverTitle} hint={ops.rolloverHint}
        executeLabel={ops.rolloverExecuteLabel} rollover={ops.rollover}
        commonText={commonText} refresh={refresh} />

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{ops.pointsTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{ops.pointsHint}</p>
        {(ops.contributionRules || []).map((rule) => (
          <div key={rule.actionKey} style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
            padding: '8px 0', borderTop: '1px solid rgba(201,163,92,.10)',
          }}>
            <span style={{ color: theme.paper, fontSize: 14, minWidth: 70 }}>{rule.actionLabel}</span>
            <input style={{ ...adminInputStyle, width: 90 }} type="number" min={0} max={1000}
              value={ruleDrafts[rule.actionKey] ?? String(rule.points)}
              onChange={(e) => setRuleDrafts((prev) => ({ ...prev, [rule.actionKey]: e.target.value }))} />
            <label style={{ color: theme.muted, fontSize: 12.5, display: 'flex', gap: 5, alignItems: 'center' }}>
              <input type="checkbox"
                checked={ruleDrafts[rule.actionKey + ':enabled'] !== undefined
                  ? ruleDrafts[rule.actionKey + ':enabled'] === '1' : rule.enabled}
                onChange={(e) => setRuleDrafts((prev) => ({
                  ...prev, [rule.actionKey + ':enabled']: e.target.checked ? '1' : '0',
                }))} />
              {rule.actionLabel}
            </label>
            <button type="button" className="yy-btn" style={{ padding: '6px 16px' }}
              onClick={() => runRule({
                slug, actionKey: rule.actionKey,
                points: Number(ruleDrafts[rule.actionKey] ?? rule.points) || 0,
                enabled: (ruleDrafts[rule.actionKey + ':enabled'] ?? (rule.enabled ? '1' : '0')) === '1',
              })}>
              {ops.pointsSaveLabel}
            </button>
          </div>
        ))}
        <div style={{ marginTop: 14 }}>
          {(ops.contributionBoard || []).length === 0 ? (
            <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{ops.pointsBoardEmptyText}</p>
          ) : (ops.contributionBoard || []).map((row, i) => (
            <div key={row.discordId} style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline',
              padding: '7px 0', borderTop: '1px solid rgba(201,163,92,.08)',
            }}>
              <span style={{ color: theme.gold, fontSize: 13, minWidth: 26 }}>{i + 1}</span>
              <span style={{ color: theme.paper, fontSize: 14, flex: '1 1 140px' }}>{row.displayName}</span>
              <span style={{ color: '#ecd28f', fontSize: 13 }}>
                {ops.pointsTotalLabel} {row.totalPoints}
              </span>
              <span style={{ color: theme.muted, fontSize: 12 }}>
                {ops.pointsEntriesLabel} {row.entryCount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
