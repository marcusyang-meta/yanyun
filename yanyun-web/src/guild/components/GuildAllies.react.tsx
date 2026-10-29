import { useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation, useRelayEnvironment } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';

// Allied guilds tab (P20), member branch only. The alliance
// relation and the shared-grouping feed are composed read-time by
// the server: unallied guilds compose nothing, and a dissolved
// alliance empties the feed on the next read. The admin section
// (relations + invite directory) is composed only for this guild's
// admins. Joining a shared grouping is an ordinary seat signup
// flagged as a visitor under the host leader's quota. All copy
// comes from the guildAllies page shell; this component holds no
// UI strings.

const AlliesQueryNode = graphql`
  query GuildAlliesQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      guildAllies(slug: $slug) {
        __typename
        ... on GuildAlliesLocked {
          lockedTitle
          lockedBody
        }
        ... on GuildAlliesPage {
          alliesTitle
          alliesBody
          activeTitle
          activeEmptyText
          sharedTitle
          sharedEmptyText
          visitorJoinLabel
          visitorJoinedLabel
          allies { slug name }
          adminSection {
            adminTitle
            inviteLabel
            inviteHint
            inviteButtonLabel
            incomingTitle
            outgoingTitle
            acceptLabel
            rejectLabel
            endLabel
            relations {
              id
              otherSlug
              otherName
              status
              statusLabel
              outgoing
              requestedByName
            }
            candidates { slug name }
          }
          sharedGroupings {
            id
            hostName
            hostPattern
            title
            dungeon
            startsAtText
            visitorLeftPattern
            joined
          }
        }
      }
    }
  }
`;

const InviteAllianceMutationNode = graphql`
  mutation GuildAlliesInviteMutation($slug: String!, $targetSlug: String!) {
    inviteAlliance(slug: $slug, targetSlug: $targetSlug) { ok error }
  }
`;
const RespondAllianceMutationNode = graphql`
  mutation GuildAlliesRespondMutation($slug: String!, $allianceId: ID!, $accept: Boolean!) {
    respondAlliance(slug: $slug, allianceId: $allianceId, accept: $accept) { ok error }
  }
`;
const EndAllianceMutationNode = graphql`
  mutation GuildAlliesEndMutation($slug: String!, $allianceId: ID!) {
    endAlliance(slug: $slug, allianceId: $allianceId) { ok error }
  }
`;
const JoinAllyMutationNode = graphql`
  mutation GuildAlliesJoinMutation($slug: String!, $groupingId: ID!, $weapon: String!) {
    joinAllyGrouping(slug: $slug, groupingId: $groupingId, weapon: $weapon) { ok error }
  }
`;

const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 12,
};
const rowBtn: React.CSSProperties = {
  padding: '5px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
  background: 'transparent', color: '#ecd28f', border: '1px solid rgba(201,163,92,.45)',
};
const input: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(201,163,92,.3)', borderRadius: 6,
  color: '#eee', padding: '6px 8px', fontSize: 13, minWidth: 0,
};

export function GuildAlliesRoute({ slug }: { slug: string }) {
  const environment = useRelayEnvironment();
  const data = useLazyLoadQuery<any>(AlliesQueryNode, { slug }, { fetchPolicy: 'store-or-network' });
  const refetchPage = () => { fetchQuery(environment, AlliesQueryNode, { slug }).toPromise().catch(() => {}); };
  const unknownErrorText: string = data?.viewer?.commonUnknownErrorText ?? '';
  const page: any = data?.viewer?.guildAllies ?? {};

  const [commitInvite] = useMutation<any>(InviteAllianceMutationNode);
  const [commitRespond] = useMutation<any>(RespondAllianceMutationNode);
  const [commitEnd] = useMutation<any>(EndAllianceMutationNode);
  const [commitJoin] = useMutation<any>(JoinAllyMutationNode);

  const [targetSlug, setTargetSlug] = useState('');
  const [weapons, setWeapons] = useState<Record<string, string>>({});

  // A null guildAllies field = the allies surface does not exist
  // for this guild (unentitled while the paygate is OFF): render
  // nothing at all — not even an empty locked card. The guild
  // home carries no allies tab in this state either; a direct
  // landing simply finds no surface here.
  if (data?.viewer?.guildAllies == null) return null;

  if (page.__typename === 'GuildAlliesLocked' || !page.alliesTitle) {
    return (
      <div style={card}>
        <h3 style={{ color: '#ecd28f', margin: '4px 0 8px' }}>{page.lockedTitle ?? ''}</h3>
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{page.lockedBody ?? ''}</p>
      </div>
    );
  }

  const admin = page.adminSection ?? null;
  const fail = (error?: string | null) => toast(error || unknownErrorText);
  const settle = (payload: any, key: string) => {
    if (payload?.[key]?.ok) refetchPage();
    else fail(payload?.[key]?.error);
  };

  const doInvite = (toSlug: string) => {
    if (!toSlug) return;
    commitInvite({
      variables: { slug, targetSlug: toSlug },
      onCompleted: (res: any) => settle(res, 'inviteAlliance'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doRespond = (allianceId: string, accept: boolean) => {
    commitRespond({
      variables: { slug, allianceId, accept },
      onCompleted: (res: any) => settle(res, 'respondAlliance'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doEnd = (allianceId: string) => {
    commitEnd({
      variables: { slug, allianceId },
      onCompleted: (res: any) => settle(res, 'endAlliance'),
      onError: (e: Error) => fail(e.message),
    });
  };
  const doJoin = (groupingId: string) => {
    commitJoin({
      variables: { slug, groupingId, weapon: weapons[groupingId] ?? '' },
      onCompleted: (res: any) => {
        if (res.joinAllyGrouping?.ok) { toast(page.visitorJoinedLabel); refetchPage(); }
        else fail(res.joinAllyGrouping?.error);
      },
      onError: (e: Error) => fail(e.message),
    });
  };

  const relations: any[] = admin?.relations ?? [];
  const incoming = relations.filter((r) => !r.outgoing && r.status === 'PENDING');
  const outgoing = relations.filter((r) => r.outgoing && r.status === 'PENDING');
  const activeRelations = relations.filter((r) => r.status === 'ACTIVE');
  const relationRow = (r: any, actions: React.ReactNode) => (
    <div key={r.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
      <strong style={{ fontSize: 14 }}>{r.otherName}</strong>
      <span style={{ fontSize: 12, color: theme.muted }}>{r.otherSlug}</span>
      <span style={{ fontSize: 12, color: theme.gold }}>{r.statusLabel}</span>
      <span style={{ fontSize: 12, color: theme.muted }}>{r.requestedByName}</span>
      {actions}
    </div>
  );

  return (
    <div>
      <h3 style={{ color: '#ecd28f', margin: '8px 0 4px' }}>{page.alliesTitle}</h3>
      <p style={{ color: theme.muted, fontSize: 13, marginTop: 0 }}>{page.alliesBody}</p>

      <div style={card}>
        <h4 style={{ color: '#ecd28f', margin: '0 0 8px' }}>{page.activeTitle}</h4>
        {(page.allies ?? []).length === 0
          ? <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{page.activeEmptyText}</p>
          : page.allies.map((a: any) => (
            <div key={a.slug} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '4px 0' }}>
              <strong style={{ fontSize: 14 }}>{a.name}</strong>
              <span style={{ fontSize: 12, color: theme.muted }}>{a.slug}</span>
              {admin && activeRelations.find((r) => r.otherSlug === a.slug) && (
                <button style={rowBtn} onClick={() => doEnd(activeRelations.find((r) => r.otherSlug === a.slug).id)}>{admin.endLabel}</button>
              )}
            </div>
          ))}
        {admin && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: theme.muted, marginBottom: 6 }}>{admin.adminTitle}</div>
            {incoming.length > 0 && (
              <>
                <div style={{ fontSize: 13, color: theme.muted }}>{admin.incomingTitle}</div>
                {incoming.map((r) => relationRow(r, (
                  <>
                    <button style={rowBtn} onClick={() => doRespond(r.id, true)}>{admin.acceptLabel}</button>
                    <button style={rowBtn} onClick={() => doRespond(r.id, false)}>{admin.rejectLabel}</button>
                  </>
                )))}
              </>
            )}
            {outgoing.length > 0 && (
              <>
                <div style={{ fontSize: 13, color: theme.muted }}>{admin.outgoingTitle}</div>
                {outgoing.map((r) => relationRow(r, (
                  <button style={rowBtn} onClick={() => doEnd(r.id)}>{admin.endLabel}</button>
                )))}
              </>
            )}
            <p style={{ color: theme.muted, fontSize: 12 }}>{admin.inviteHint}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: theme.muted, flex: '1 1 220px' }}>
                {admin.inviteLabel}
                <input style={{ ...input, flex: 1 }} value={targetSlug} onChange={(e) => setTargetSlug(e.target.value)} />
              </label>
              <button className="yy-btn yy-btn-gold" style={{ padding: '6px 18px', fontSize: 13 }} onClick={() => doInvite(targetSlug)}>{admin.inviteButtonLabel}</button>
            </div>
            {(admin.candidates ?? []).length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {admin.candidates.map((c: any) => (
                  <button key={c.slug} style={rowBtn} onClick={() => doInvite(c.slug)}>{c.name}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={card}>
        <h4 style={{ color: '#ecd28f', margin: '0 0 8px' }}>{page.sharedTitle}</h4>
        {(page.sharedGroupings ?? []).length === 0
          ? <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{page.sharedEmptyText}</p>
          : page.sharedGroupings.map((ev: any) => (
            <div key={ev.id} style={{ padding: '8px 0', borderTop: '1px solid rgba(201,163,92,.12)' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <strong style={{ fontSize: 14 }}>{ev.title}</strong>
                {ev.dungeon ? <span style={{ fontSize: 12, color: theme.muted }}>{ev.dungeon}</span> : null}
                <span style={{ fontSize: 12, color: theme.muted }}>{ev.hostPattern}</span>
                {ev.startsAtText ? <span style={{ fontSize: 12, color: theme.muted }}>{ev.startsAtText}</span> : null}
                <span style={{ fontSize: 12, color: theme.gold }}>{ev.visitorLeftPattern}</span>
                {ev.joined ? <span style={{ fontSize: 12, color: theme.gold }}>{page.visitorJoinedLabel}</span> : null}
              </div>
              {!ev.joined && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                  <input
                    style={input} value={weapons[ev.id] ?? ''} aria-label={page.visitorJoinLabel}
                    onChange={(e) => setWeapons({ ...weapons, [ev.id]: e.target.value })}
                  />
                  <button className="yy-btn yy-btn-gold" style={{ padding: '6px 18px', fontSize: 13 }} onClick={() => doJoin(ev.id)}>{page.visitorJoinLabel}</button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
