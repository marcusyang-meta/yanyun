// Platform admin page (hub overhaul) — the dialogPage inside the
// personal settings dialog whose entry row and title are the literal
// '[intern only] internal settings' (marcus, 2026-10-28; the title is
// deliberately not fbt and never translated — see SettingsDialog).
//
// The page is guarded by response type, not by frontend hiding: it
// loads the PlatformAdmin surface itself, and if the gating layer
// composes PlatformAdminLocked (non-admin / signed-out), it renders
// only the backend's locked copy — zero admin data is ever shipped.
// Every write goes through a platformAdmin* mutation that re-evaluates
// the gate server-side; after a successful write the page refetches
// its own query so the store shows the new state.
//
// Section titles, button labels and status texts come from the
// query's backend text fields (PlatformAdminFbtUtils). The few
// remaining micro-labels (form field hints on this intern-only ops
// page, e.g. 'days', 'webhook') are literal English, matching the
// retired portal's register; business copy is never hardcoded here.
import { useState } from 'react';
import { graphql, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fetchQuery, commitMutation } from 'relay-runtime';
import { theme } from '../lib/format';

const PlatformAdminPageQueryNode = graphql`
  query PlatformAdminPageQuery {
    viewer {
      platformAdmin {
        __typename
        ... on PlatformAdminLocked {
          lockedTitle
          lockedBody
        }
        ... on PlatformAdmin {
          title
          subtitle
          tenantsTitle
          tenantsEmpty
          billingTitle
          paygateLabel
          paygateOnText
          paygateOffText
          stripeLabel
          stripeConfiguredText
          stripeMissingText
          saasLabel
          saasConfiguredText
          saasMissingText
          plansTitle
          billingTenantsTitle
          errorsTitle
          errorsEmpty
          auditTitle
          auditEmpty
          feedbackTitle
          feedbackEmpty
          settingsTitle
          gameVersionLabel
          gameNoticeLabel
          gameVersionCodeLabel
          bossesTitle
          bossesEmpty
          dungeonsTitle
          dungeonsEmpty
          remindersTitle
          remindersEmpty
          heirloomsTitle
          heirloomsEmpty
          backupsTitle
          backupsEmpty
          backupsUnavailableText
          rosterTitle
          rosterNote
          backfillsTitle
          saveLabel
          testLabel
          runLabel
          dryRunLabel
          deleteTenantLabel
          grantLabel
          revokeLabel
          subdomainLabel
          customDomainLabel
          enabledText
          disabledText
          webhookSetText
          webhookUnsetText
          runBackupLabel
          downloadLabel
          exportLabel
          backfillReminderIdentityLabel
          backfillCreatorsLabel
          migrateBossGuidesLabel
          statusOpenText
          statusResolvedText
          lastStatusLabel
          nextAlarmLabel
          periodEndLabel
          sourceLabel
          tierLabel
          planLabel
          hasCardText
          noCardText
          trialUsedText
          tenants { slug guildName announcement createdAt eventCount }
          billing {
            paygateEnabled
            stripeConfigured
            customDomainSaasConfigured
            plans { tier plan name nameEn subtitle subtitleEn priceMonthlyCents }
            tenants {
              slug guildName plan source tier effectiveTier tierName tierNameEn tierSubtitle
              currentPeriodEnd lapsed pastDue hasCard trialUsed stripeCustomerId stripeSubscriptionId
              subdomainEnabled customDomainHostname customDomainStatus
            }
          }
          errors { id at source name message tenant context }
          errorCount24h
          auditEntries(limit: 50) { total entries { id at actor action tenant summary } }
          feedbackEntries(limit: 50) { total entries { id discordId userName category content status createdAt resolvedAt } }
          settings { gameVersion gameNotice gameVersionCode }
          bosses { id name talent source note sortOrder dungeon guide mechanicsJson talentsJson shoutsJson }
          dungeons { id name size isCurrent version videoUrl videoTitle }
          reminders { slug guildName webhookSet webhookMasked enabled lastAt lastStatus lastError lastEvent nextAlarmAt }
          heirlooms { slug guildName webhookSet webhookMasked enabled lastAt lastStatus lastError lastEvent }
          backups { available entries { key size uploaded } }
          adminRoster
        }
      }
    }
  }
`;

const SetPaygateNode = graphql`
  mutation PlatformAdminPageSetPaygateMutation($enabled: Boolean!) {
    platformAdminSetPaygate(enabled: $enabled) { ok error errorCode }
  }
`;
const GrantNode = graphql`
  mutation PlatformAdminPageGrantMutation($slug: String!, $days: Int!, $tier: String) {
    platformAdminGrantPremium(slug: $slug, days: $days, tier: $tier) { ok error errorCode }
  }
`;
const RevokeNode = graphql`
  mutation PlatformAdminPageRevokeMutation($slug: String!) {
    platformAdminRevokePremium(slug: $slug) { ok error errorCode }
  }
`;
const SetSubdomainNode = graphql`
  mutation PlatformAdminPageSetSubdomainMutation($slug: String!, $enabled: Boolean!) {
    platformAdminSetSubdomain(slug: $slug, enabled: $enabled) { ok error errorCode }
  }
`;
const SetCustomDomainDisabledNode = graphql`
  mutation PlatformAdminPageSetCustomDomainDisabledMutation($slug: String!, $disabled: Boolean!) {
    platformAdminSetCustomDomainDisabled(slug: $slug, disabled: $disabled) { ok error errorCode }
  }
`;
const DeleteTenantNode = graphql`
  mutation PlatformAdminPageDeleteTenantMutation($slug: String!) {
    platformAdminDeleteTenant(slug: $slug) { ok error errorCode }
  }
`;
const SetFeedbackStatusNode = graphql`
  mutation PlatformAdminPageSetFeedbackStatusMutation($id: ID!, $status: String!) {
    platformAdminSetFeedbackStatus(id: $id, status: $status) { ok error errorCode }
  }
`;
const UpdateSettingsNode = graphql`
  mutation PlatformAdminPageUpdateSettingsMutation($gameVersion: String, $gameNotice: String, $gameVersionCode: String) {
    platformAdminUpdateSettings(gameVersion: $gameVersion, gameNotice: $gameNotice, gameVersionCode: $gameVersionCode) { ok error errorCode }
  }
`;
const CreateBossNode = graphql`
  mutation PlatformAdminPageCreateBossMutation($name: String!, $talent: String, $source: String, $note: String, $sortOrder: Int) {
    platformAdminCreateBoss(name: $name, talent: $talent, source: $source, note: $note, sortOrder: $sortOrder) { ok error errorCode bossId }
  }
`;
const UpdateBossNode = graphql`
  mutation PlatformAdminPageUpdateBossMutation($id: Int!, $name: String, $talent: String, $source: String, $note: String, $sortOrder: Int, $guide: String, $mechanicsJson: String, $talentsJson: String, $shoutsJson: String) {
    platformAdminUpdateBoss(id: $id, name: $name, talent: $talent, source: $source, note: $note, sortOrder: $sortOrder, guide: $guide, mechanicsJson: $mechanicsJson, talentsJson: $talentsJson, shoutsJson: $shoutsJson) { ok error errorCode }
  }
`;
const DeleteBossNode = graphql`
  mutation PlatformAdminPageDeleteBossMutation($id: Int!) {
    platformAdminDeleteBoss(id: $id) { ok error errorCode }
  }
`;
const UpdateDungeonNode = graphql`
  mutation PlatformAdminPageUpdateDungeonMutation($id: Int!, $isCurrent: Boolean, $videoUrl: String, $videoTitle: String) {
    platformAdminUpdateDungeon(id: $id, isCurrent: $isCurrent, videoUrl: $videoUrl, videoTitle: $videoTitle) { ok error errorCode }
  }
`;
const UpdateReminderNode = graphql`
  mutation PlatformAdminPageUpdateReminderMutation($slug: String!, $webhook: String, $enabled: Boolean) {
    platformAdminUpdateReminder(slug: $slug, webhook: $webhook, enabled: $enabled) { ok error errorCode message }
  }
`;
const TestReminderNode = graphql`
  mutation PlatformAdminPageTestReminderMutation($slug: String!) {
    platformAdminTestReminder(slug: $slug) { ok error errorCode message }
  }
`;
const UpdateHeirloomNode = graphql`
  mutation PlatformAdminPageUpdateHeirloomMutation($slug: String!, $webhook: String, $enabled: Boolean) {
    platformAdminUpdateHeirloom(slug: $slug, webhook: $webhook, enabled: $enabled) { ok error errorCode message }
  }
`;
const TestHeirloomNode = graphql`
  mutation PlatformAdminPageTestHeirloomMutation($slug: String!) {
    platformAdminTestHeirloom(slug: $slug) { ok error errorCode message }
  }
`;
const RunBackupNode = graphql`
  mutation PlatformAdminPageRunBackupMutation {
    platformAdminRunBackup { ok error errorCode key rows bytes }
  }
`;
const SetRosterNode = graphql`
  mutation PlatformAdminPageSetRosterMutation($discordIds: [String!]!) {
    platformAdminSetRoster(discordIds: $discordIds) { ok error errorCode adminRoster }
  }
`;
const BackfillReminderIdentityNode = graphql`
  mutation PlatformAdminPageBackfillReminderIdentityMutation($dryRun: Boolean!) {
    platformAdminBackfillReminderIdentity(dryRun: $dryRun) {
      ok error errorCode dryRun rosterSeeded seatsTotal stamped ambiguous unmatched
      guilds { slug discordGuildId rosterSeeded seatsTotal stamped ambiguous unmatched }
    }
  }
`;
const BackfillCreatorsNode = graphql`
  mutation PlatformAdminPageBackfillCreatorsMutation($dryRun: Boolean!) {
    platformAdminBackfillCreators(dryRun: $dryRun) {
      ok error errorCode dryRun events alreadyStamped considered backfilled placeholder noMatch ambiguous
    }
  }
`;
const MigrateBossGuidesNode = graphql`
  mutation PlatformAdminPageMigrateBossGuidesMutation {
    platformAdminMigrateBossGuides { ok error errorCode }
  }
`;

function fmtSec(sec?: number | null): string {
  if (!sec) return '—';
  return new Date(sec * 1000).toLocaleString();
}
function fmtMs(ms?: number | null): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(201,163,92,.22)', marginTop: 22, paddingTop: 16,
};
const titleStyle: React.CSSProperties = { color: theme.paper, fontSize: 16, marginBottom: 10 };
const rowStyle: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.18)', borderRadius: 10, padding: '10px 12px', marginBottom: 8,
  background: 'rgba(255,255,255,.02)',
};
const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,.25)', border: '1px solid rgba(201,163,92,.3)', borderRadius: 8,
  color: theme.paper, fontSize: 13.5, padding: '7px 10px',
};
const btnStyle: React.CSSProperties = {
  background: 'rgba(201,163,92,.12)', border: '1px solid rgba(201,163,92,.4)', borderRadius: 8,
  color: theme.paper, fontSize: 13, padding: '7px 12px', cursor: 'pointer',
};
const smallText: React.CSSProperties = { color: theme.muted, fontSize: 12.5, lineHeight: 1.6 };

type RunFn = (node: any, variables: any, payloadKey: string) => Promise<any>;

function BillingTenantRow({ t, a, run }: { t: any; a: any; run: RunFn }) {
  const [days, setDays] = useState('30');
  const [tier, setTier] = useState('');
  const plans = a.billing?.plans ?? [];
  return (
    <div style={rowStyle}>
      <div style={{ color: theme.paper, fontSize: 14 }}>
        {t.guildName} <span style={smallText}>({t.slug})</span>
      </div>
      <div style={smallText}>
        {a.planLabel}: {t.plan} · {a.tierLabel}: {t.tierName} ({t.effectiveTier}) · {a.sourceLabel}: {t.source}
        {t.currentPeriodEnd ? <> · {a.periodEndLabel}: {fmtSec(t.currentPeriodEnd)}</> : null}
        {' '}· {t.hasCard ? a.hasCardText : a.noCardText}
        {t.trialUsed ? <> · {a.trialUsedText}</> : null}
        {t.stripeCustomerId ? <> · {t.stripeCustomerId}</> : null}
        {t.stripeSubscriptionId ? <> · {t.stripeSubscriptionId}</> : null}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        <input style={{ ...inputStyle, width: 70 }} value={days} onChange={(e) => setDays(e.target.value)} placeholder="days" inputMode="numeric" />
        <select style={inputStyle} value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">—</option>
          {plans.map((p: any) => (
            <option key={p.tier} value={`t${p.tier}`}>{p.name} ${ (p.priceMonthlyCents / 100).toFixed(2) }</option>
          ))}
        </select>
        <button style={btnStyle} onClick={() => run(GrantNode, { slug: t.slug, days: parseInt(days, 10) || 0, tier: tier || null }, 'platformAdminGrantPremium')}>
          {a.grantLabel}
        </button>
        <button style={btnStyle} onClick={() => run(RevokeNode, { slug: t.slug }, 'platformAdminRevokePremium')}>
          {a.revokeLabel}
        </button>
        <label style={{ ...smallText, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!t.subdomainEnabled}
            onChange={(e) => run(SetSubdomainNode, { slug: t.slug, enabled: e.target.checked }, 'platformAdminSetSubdomain')}
          />
          {a.subdomainLabel}
        </label>
      </div>
      <div style={{ ...smallText, marginTop: 6 }}>
        {a.customDomainLabel}: {t.customDomainHostname
          ? <>{t.customDomainHostname} ({t.customDomainStatus})</>
          : '—'}
        {t.customDomainHostname && (
          <button
            style={{ ...btnStyle, marginLeft: 8, padding: '3px 9px' }}
            onClick={() => run(SetCustomDomainDisabledNode,
              { slug: t.slug, disabled: t.customDomainStatus !== 'disabled' },
              'platformAdminSetCustomDomainDisabled')}
          >
            {t.customDomainStatus === 'disabled' ? a.enabledText : a.disabledText}
          </button>
        )}
      </div>
    </div>
  );
}

function BossRow({ b, a, run }: { b: any; a: any; run: RunFn }) {
  const [f, setF] = useState<any>(null);
  const v = f ?? {
    name: b.name, talent: b.talent, source: b.source, note: b.note,
    sortOrder: String(b.sortOrder), guide: b.guide,
    mechanicsJson: b.mechanicsJson ?? '', talentsJson: b.talentsJson ?? '', shoutsJson: b.shoutsJson ?? '',
  };
  const set = (k: string) => (e: any) => setF({ ...v, [k]: e.target.value });
  return (
    <div style={rowStyle}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: '1 1 140px' }} value={v.name} onChange={set('name')} placeholder="name" />
        <input style={{ ...inputStyle, flex: '1 1 100px' }} value={v.talent} onChange={set('talent')} placeholder="talent" />
        <input style={{ ...inputStyle, flex: '1 1 100px' }} value={v.source} onChange={set('source')} placeholder="source" />
        <input style={{ ...inputStyle, width: 70 }} value={v.sortOrder} onChange={set('sortOrder')} placeholder="sort" inputMode="numeric" />
      </div>
      <input style={{ ...inputStyle, width: '100%', marginTop: 8, boxSizing: 'border-box' }} value={v.note} onChange={set('note')} placeholder="note" />
      <textarea style={{ ...inputStyle, width: '100%', marginTop: 8, boxSizing: 'border-box', minHeight: 56 }} value={v.guide} onChange={set('guide')} placeholder="guide" />
      <textarea style={{ ...inputStyle, width: '100%', marginTop: 8, boxSizing: 'border-box', minHeight: 40 }} value={v.mechanicsJson} onChange={set('mechanicsJson')} placeholder="mechanicsJson" />
      <textarea style={{ ...inputStyle, width: '100%', marginTop: 8, boxSizing: 'border-box', minHeight: 40 }} value={v.talentsJson} onChange={set('talentsJson')} placeholder="talentsJson" />
      <textarea style={{ ...inputStyle, width: '100%', marginTop: 8, boxSizing: 'border-box', minHeight: 40 }} value={v.shoutsJson} onChange={set('shoutsJson')} placeholder="shoutsJson" />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button style={btnStyle} onClick={() => run(UpdateBossNode, {
          id: b.id, name: v.name, talent: v.talent, source: v.source, note: v.note,
          sortOrder: parseInt(v.sortOrder, 10) || 0, guide: v.guide,
          mechanicsJson: v.mechanicsJson || null, talentsJson: v.talentsJson || null, shoutsJson: v.shoutsJson || null,
        }, 'platformAdminUpdateBoss')}>{a.saveLabel}</button>
        <button style={btnStyle} onClick={() => run(DeleteBossNode, { id: b.id }, 'platformAdminDeleteBoss')}>✕</button>
        <span style={smallText}>{b.dungeon}</span>
      </div>
    </div>
  );
}

function DungeonRow({ d, a, run }: { d: any; a: any; run: RunFn }) {
  const [videoUrl, setVideoUrl] = useState(d.videoUrl);
  const [videoTitle, setVideoTitle] = useState(d.videoTitle);
  return (
    <div style={rowStyle}>
      <div style={{ color: theme.paper, fontSize: 14 }}>
        {d.name} <span style={smallText}>({d.size}) · {d.version}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        <label style={{ ...smallText, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!d.isCurrent}
            onChange={(e) => run(UpdateDungeonNode, { id: d.id, isCurrent: e.target.checked }, 'platformAdminUpdateDungeon')}
          />
          current
        </label>
        <input style={{ ...inputStyle, flex: '1 1 200px' }} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="videoUrl" />
        <input style={{ ...inputStyle, flex: '1 1 140px' }} value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="videoTitle" />
        <button style={btnStyle} onClick={() => run(UpdateDungeonNode, { id: d.id, videoUrl, videoTitle }, 'platformAdminUpdateDungeon')}>
          {a.saveLabel}
        </button>
      </div>
    </div>
  );
}

function WebhookRow({ r, a, run, kind }: { r: any; a: any; run: RunFn; kind: 'reminder' | 'heirloom' }) {
  const [webhook, setWebhook] = useState('');
  const updateNode = kind === 'reminder' ? UpdateReminderNode : UpdateHeirloomNode;
  const testNode = kind === 'reminder' ? TestReminderNode : TestHeirloomNode;
  const updateKey = kind === 'reminder' ? 'platformAdminUpdateReminder' : 'platformAdminUpdateHeirloom';
  const testKey = kind === 'reminder' ? 'platformAdminTestReminder' : 'platformAdminTestHeirloom';
  return (
    <div style={rowStyle}>
      <div style={{ color: theme.paper, fontSize: 14 }}>
        {r.guildName} <span style={smallText}>({r.slug})</span>
      </div>
      <div style={smallText}>
        {r.webhookSet ? `${a.webhookSetText}: ${r.webhookMasked}` : a.webhookUnsetText}
        {r.lastAt ? <> · {a.lastStatusLabel}: {r.lastStatus} @ {fmtSec(r.lastAt)}{r.lastError ? ` (${r.lastError})` : ''}{r.lastEvent ? ` · ${r.lastEvent}` : ''}</> : null}
        {r.nextAlarmAt ? <> · {a.nextAlarmLabel}: {fmtSec(r.nextAlarmAt)}</> : null}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 220px' }}
          type="password"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          placeholder="webhook"
          autoComplete="off"
        />
        <label style={{ ...smallText, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!r.enabled}
            onChange={(e) => run(updateNode, { slug: r.slug, enabled: e.target.checked }, updateKey)}
          />
          {a.enabledText}
        </label>
        <button style={btnStyle} onClick={() => { run(updateNode, { slug: r.slug, webhook }, updateKey); setWebhook(''); }}>
          {a.saveLabel}
        </button>
        <button style={btnStyle} onClick={() => run(testNode, { slug: r.slug }, testKey)}>
          {a.testLabel}
        </button>
      </div>
    </div>
  );
}

export default function PlatformAdminPage() {
  const environment = useRelayEnvironment();
  const data = useLazyLoadQuery<any>(PlatformAdminPageQueryNode, {});
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(true);
  const [backfillResult, setBackfillResult] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [bossName, setBossName] = useState('');
  const [bossTalent, setBossTalent] = useState('');
  const a = data.viewer?.platformAdmin;

  const refetch = () => {
    fetchQuery(environment, PlatformAdminPageQueryNode, {}).toPromise().catch(() => {});
  };
  const run: RunFn = (node, variables, payloadKey) => new Promise((resolve) => {
    commitMutation(environment, {
      mutation: node,
      variables,
      onCompleted: (resp: any) => {
        const payload = resp?.[payloadKey];
        if (payload?.ok) {
          setMsg(payload.message || '✓');
          setMsgOk(true);
          if (payloadKey.startsWith('platformAdminBackfill') || payloadKey === 'platformAdminMigrateBossGuides') {
            setBackfillResult(JSON.stringify(payload, null, 2));
          }
          refetch();
        } else {
          setMsg(payload?.error || payload?.errorCode || 'error');
          setMsgOk(false);
        }
        resolve(payload);
      },
      onError: (e: Error) => { setMsg(String(e?.message || e)); setMsgOk(false); resolve(null); },
    });
  });

  if (!a || a.__typename === 'PlatformAdminLocked') {
    // Defense in depth: the entry row only renders for admins, but the
    // page's own composition is the real guard — Locked ships nothing.
    return (
      <div>
        <div style={{ color: theme.paper, fontSize: 16, marginBottom: 10 }}>{a?.lockedTitle ?? ''}</div>
        <div style={smallText}>{a?.lockedBody ?? ''}</div>
      </div>
    );
  }

  const billing = a.billing ?? { plans: [], tenants: [] };
  return (
    <div>
      <div style={{ ...smallText, marginBottom: 4 }}>{a.subtitle}</div>
      {msg && (
        <div style={{ color: msgOk ? '#7fb069' : '#e58d7f', fontSize: 13, margin: '8px 0' }}>{msg}</div>
      )}

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.tenantsTitle}</div>
        {!a.tenants?.length && <div style={smallText}>{a.tenantsEmpty}</div>}
        {(a.tenants ?? []).map((t: any) => (
          <div key={t.slug} style={rowStyle}>
            <div style={{ color: theme.paper, fontSize: 14 }}>
              {t.guildName} <span style={smallText}>({t.slug}) · {t.createdAt} · {t.eventCount}</span>
            </div>
            {t.announcement && <div style={smallText}>{t.announcement}</div>}
            <button
              style={{ ...btnStyle, marginTop: 8 }}
              onClick={() => run(DeleteTenantNode, { slug: t.slug }, 'platformAdminDeleteTenant')}
            >
              {a.deleteTenantLabel}
            </button>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.billingTitle}</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
          <label style={{ ...smallText, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!billing.paygateEnabled}
              onChange={(e) => run(SetPaygateNode, { enabled: e.target.checked }, 'platformAdminSetPaygate')}
            />
            {a.paygateLabel}: {billing.paygateEnabled ? a.paygateOnText : a.paygateOffText}
          </label>
          <span style={smallText}>{a.stripeLabel}: {billing.stripeConfigured ? a.stripeConfiguredText : a.stripeMissingText}</span>
          <span style={smallText}>{a.saasLabel}: {billing.customDomainSaasConfigured ? a.saasConfiguredText : a.saasMissingText}</span>
        </div>
        <div style={{ ...smallText, marginBottom: 6 }}>{a.plansTitle}</div>
        {(billing.plans ?? []).map((p: any) => (
          <div key={p.tier} style={smallText}>
            {p.name} ({p.nameEn}) — ${(p.priceMonthlyCents / 100).toFixed(2)} · {p.subtitle}
          </div>
        ))}
        <div style={{ ...smallText, margin: '10px 0 6px' }}>{a.billingTenantsTitle}</div>
        {(billing.tenants ?? []).map((t: any) => (
          <BillingTenantRow key={t.slug} t={t} a={a} run={run} />
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.errorsTitle} ({a.errorCount24h})</div>
        {!a.errors?.length && <div style={smallText}>{a.errorsEmpty}</div>}
        {(a.errors ?? []).map((e: any) => (
          <div key={e.id} style={smallText}>
            {fmtSec(e.at)} · {e.source} · {e.name}: {e.message}{e.tenant ? ` · ${e.tenant}` : ''}{e.context ? ` · ${e.context}` : ''}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.auditTitle} ({a.auditEntries?.total ?? 0})</div>
        {!a.auditEntries?.entries?.length && <div style={smallText}>{a.auditEmpty}</div>}
        {(a.auditEntries?.entries ?? []).map((e: any) => (
          <div key={e.id} style={smallText}>
            {fmtSec(e.at)} · {e.actor} · {e.action}{e.tenant ? ` · ${e.tenant}` : ''} · {e.summary}
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.feedbackTitle} ({a.feedbackEntries?.total ?? 0})</div>
        {!a.feedbackEntries?.entries?.length && <div style={smallText}>{a.feedbackEmpty}</div>}
        {(a.feedbackEntries?.entries ?? []).map((f: any) => (
          <div key={f.id} style={rowStyle}>
            <div style={smallText}>
              {fmtMs(f.createdAt)} · {f.userName} ({f.discordId}) · {f.category} · {f.status === 'resolved' ? a.statusResolvedText : a.statusOpenText}
            </div>
            <div style={{ color: theme.paper, fontSize: 13.5, marginTop: 4 }}>{f.content}</div>
            <button
              style={{ ...btnStyle, marginTop: 8 }}
              onClick={() => run(SetFeedbackStatusNode,
                { id: f.id, status: f.status === 'resolved' ? 'open' : 'resolved' },
                'platformAdminSetFeedbackStatus')}
            >
              {f.status === 'resolved' ? a.statusOpenText : a.statusResolvedText}
            </button>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.settingsTitle}</div>
        <SettingsForm key={`${a.settings?.gameVersion}|${a.settings?.gameNotice}|${a.settings?.gameVersionCode}`} a={a} run={run} />
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.bossesTitle}</div>
        {!a.bosses?.length && <div style={smallText}>{a.bossesEmpty}</div>}
        {(a.bosses ?? []).map((b: any) => (
          <BossRow key={b.id} b={b} a={a} run={run} />
        ))}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <input style={{ ...inputStyle, flex: '1 1 140px' }} value={bossName} onChange={(e) => setBossName(e.target.value)} placeholder="name" />
          <input style={{ ...inputStyle, flex: '1 1 100px' }} value={bossTalent} onChange={(e) => setBossTalent(e.target.value)} placeholder="talent" />
          <button
            style={btnStyle}
            onClick={() => { run(CreateBossNode, { name: bossName, talent: bossTalent }, 'platformAdminCreateBoss'); setBossName(''); setBossTalent(''); }}
          >
            +
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.dungeonsTitle}</div>
        {!a.dungeons?.length && <div style={smallText}>{a.dungeonsEmpty}</div>}
        {(a.dungeons ?? []).map((d: any) => (
          <DungeonRow key={d.id} d={d} a={a} run={run} />
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.remindersTitle}</div>
        {!a.reminders?.length && <div style={smallText}>{a.remindersEmpty}</div>}
        {(a.reminders ?? []).map((r: any) => (
          <WebhookRow key={r.slug} r={r} a={a} run={run} kind="reminder" />
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.heirloomsTitle}</div>
        {!a.heirlooms?.length && <div style={smallText}>{a.heirloomsEmpty}</div>}
        {(a.heirlooms ?? []).map((r: any) => (
          <WebhookRow key={r.slug} r={r} a={a} run={run} kind="heirloom" />
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.backupsTitle}</div>
        {!a.backups?.available && <div style={smallText}>{a.backupsUnavailableText}</div>}
        {a.backups?.available && !a.backups?.entries?.length && <div style={smallText}>{a.backupsEmpty}</div>}
        {(a.backups?.entries ?? []).map((b: any) => (
          <div key={b.key} style={{ ...smallText, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span>{b.key} · {(b.size / 1024).toFixed(1)} KB · {fmtSec(b.uploaded)}</span>
            <a style={{ color: theme.gold }} href={`/api/platform-admin/backup/download?key=${encodeURIComponent(b.key)}`}>
              {a.downloadLabel}
            </a>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={btnStyle} onClick={() => run(RunBackupNode, {}, 'platformAdminRunBackup')}>
            {a.runBackupLabel}
          </button>
          <a style={{ ...btnStyle, textDecoration: 'none' }} href="/api/platform-admin/backup/export">
            {a.exportLabel}
          </a>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.rosterTitle}</div>
        <div style={{ ...smallText, marginBottom: 8 }}>{a.rosterNote}</div>
        <RosterForm key={(a.adminRoster ?? []).join(',')} a={a} run={run} />
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>{a.backfillsTitle}</div>
        <label style={{ ...smallText, display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          {a.dryRunLabel}
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnStyle} onClick={() => run(BackfillReminderIdentityNode, { dryRun }, 'platformAdminBackfillReminderIdentity')}>
            {a.backfillReminderIdentityLabel}
          </button>
          <button style={btnStyle} onClick={() => run(BackfillCreatorsNode, { dryRun }, 'platformAdminBackfillCreators')}>
            {a.backfillCreatorsLabel}
          </button>
          <button style={btnStyle} onClick={() => run(MigrateBossGuidesNode, {}, 'platformAdminMigrateBossGuides')}>
            {a.migrateBossGuidesLabel}
          </button>
        </div>
        {backfillResult && (
          <pre style={{ ...smallText, whiteSpace: 'pre-wrap', marginTop: 10 }}>{backfillResult}</pre>
        )}
      </div>
    </div>
  );
}

function SettingsForm({ a, run }: { a: any; run: RunFn }) {
  const [gameVersion, setGameVersion] = useState(a.settings?.gameVersion ?? '');
  const [gameNotice, setGameNotice] = useState(a.settings?.gameNotice ?? '');
  const [gameVersionCode, setGameVersionCode] = useState(a.settings?.gameVersionCode ?? '');
  return (
    <div>
      <div style={{ ...smallText, marginBottom: 4 }}>{a.gameVersionLabel}</div>
      <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={gameVersion} onChange={(e) => setGameVersion(e.target.value)} />
      <div style={{ ...smallText, margin: '10px 0 4px' }}>{a.gameNoticeLabel}</div>
      <textarea style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', minHeight: 52 }} value={gameNotice} onChange={(e) => setGameNotice(e.target.value)} />
      <div style={{ ...smallText, margin: '10px 0 4px' }}>{a.gameVersionCodeLabel}</div>
      <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={gameVersionCode} onChange={(e) => setGameVersionCode(e.target.value)} />
      <button
        style={{ ...btnStyle, marginTop: 10 }}
        onClick={() => run(UpdateSettingsNode, { gameVersion, gameNotice, gameVersionCode }, 'platformAdminUpdateSettings')}
      >
        {a.saveLabel}
      </button>
    </div>
  );
}

function RosterForm({ a, run }: { a: any; run: RunFn }) {
  const [text, setText] = useState((a.adminRoster ?? []).join('\n'));
  return (
    <div>
      <textarea
        style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', minHeight: 76 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Discord IDs, one per line"
      />
      <button
        style={{ ...btnStyle, marginTop: 10 }}
        onClick={() => run(SetRosterNode,
          { discordIds: text.split(/[\s,]+/).map((x: string) => x.trim()).filter(Boolean) },
          'platformAdminSetRoster')}
      >
        {a.saveLabel}
      </button>
    </div>
  );
}
