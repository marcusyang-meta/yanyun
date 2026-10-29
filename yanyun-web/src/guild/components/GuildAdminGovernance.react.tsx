import { useState } from 'react';
import { graphql, useMutation, useRelayEnvironment, fetchQuery } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle,
  useAdminMutation, type CommonText,
} from './GuildAdminUi.react.tsx';

// Governance panel of the guild admin page (premium P16 + P17,
// tier 3): officer capability grants (Discord admins only — the
// server composes the grant trio only for them), the officers-only
// board, and the guild audit log. Presentation only: every label
// is a backend copy field on GuildGovernancePage, Locked composes
// from the union's locked variant, and every write re-runs the
// verdict + tier gate server-side.
export type GovernanceOfficer = {
  discordId: string;
  displayName: string;
  capabilities: string[];
  capabilityLabels: string[];
  grantedByName: string;
  grantedByText: string | null;
  grantedAtText: string;
};
export type GovernanceCapabilityOption = { key: string; label: string };
export type GovernanceRosterMember = { discordId: string; displayName: string };
export type GovernanceBoardPost = {
  id: string;
  body: string;
  authorName: string;
  mine: boolean;
  canDelete: boolean;
  createdAtText: string;
};
export type GovernanceAuditEvent = {
  id: string;
  action: string;
  actionLabel: string;
  actorName: string;
  targetType: string;
  targetLabel: string;
  createdAtText: string;
};
export type GovernancePageData = {
  title: string;
  hint: string;
  officersTitle: string;
  officersHint: string;
  officersEmptyText: string;
  grantMemberLabel: string;
  grantCapabilitiesLabel: string;
  grantButtonLabel: string;
  revokeButtonLabel: string;
  boardTitle: string;
  boardHint: string;
  boardEmptyText: string;
  boardPlaceholder: string;
  boardPostButtonLabel: string;
  boardDeleteButtonLabel: string;
  auditTitle: string;
  auditHint: string;
  auditEmptyText: string;
  auditLoadMoreButtonLabel: string;
  canManageGrants: boolean;
  officers: GovernanceOfficer[];
  capabilityOptions: GovernanceCapabilityOption[];
  roster: GovernanceRosterMember[];
  boardPosts: GovernanceBoardPost[];
  auditEvents: GovernanceAuditEvent[];
  auditTotalCount: number;
};
export type GovernanceData =
  | ({ __typename: 'GuildGovernancePage' } & GovernancePageData)
  | { __typename: 'GuildGovernanceLocked'; lockedTitle: string; lockedBody: string }
  | { __typename: string };

const SetGrantMutation = graphql`
  mutation GuildAdminGovernanceSetGrantMutation($slug: String!, $memberDiscordId: ID!, $capabilities: [String!]!) {
    setOfficerGrant(slug: $slug, memberDiscordId: $memberDiscordId, capabilities: $capabilities) { ok error }
  }
`;
const RevokeGrantMutation = graphql`
  mutation GuildAdminGovernanceRevokeGrantMutation($slug: String!, $memberDiscordId: ID!) {
    revokeOfficerGrant(slug: $slug, memberDiscordId: $memberDiscordId) { ok error }
  }
`;
const PostBoardMutation = graphql`
  mutation GuildAdminGovernancePostBoardMutation($slug: String!, $body: String!) {
    postOfficerBoardMessage(slug: $slug, body: $body) { ok error }
  }
`;
const DeleteBoardMutation = graphql`
  mutation GuildAdminGovernanceDeleteBoardMutation($slug: String!, $postId: ID!) {
    deleteOfficerBoardPost(slug: $slug, postId: $postId) { ok error }
  }
`;
const AuditMoreQuery = graphql`
  query GuildAdminGovernanceAuditMoreQuery($slug: String!, $limit: Int!, $offset: Int!) {
    viewer {
      guildAdmin(slug: $slug) {
        ... on GuildAdmin {
          governance {
            ... on GuildGovernancePage {
              auditEvents(limit: $limit, offset: $offset) {
                id action actionLabel actorName targetType targetLabel createdAtText
              }
            }
          }
        }
      }
    }
  }
`;

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5,
  border: `1px solid ${active ? theme.gold : 'rgba(201,163,92,.3)'}`,
  background: active ? 'rgba(201,163,92,.16)' : 'transparent',
  color: active ? '#ecd28f' : theme.muted,
});

export default function GuildAdminGovernance({ governance, slug, refresh, commonText }: {
  governance: GovernanceData | null;
  slug: string;
  refresh: () => void;
  commonText: CommonText;
}) {
  const environment = useRelayEnvironment();
  const [commitSetGrant] = useMutation(SetGrantMutation);
  const [commitRevokeGrant] = useMutation(RevokeGrantMutation);
  const [commitPostBoard] = useMutation(PostBoardMutation);
  const [commitDeleteBoard] = useMutation(DeleteBoardMutation);
  const runSetGrant = useAdminMutation(commitSetGrant, 'setOfficerGrant', refresh, commonText.unknownError);
  const runRevokeGrant = useAdminMutation(commitRevokeGrant, 'revokeOfficerGrant', refresh, commonText.unknownError);
  const runPostBoard = useAdminMutation(commitPostBoard, 'postOfficerBoardMessage', refresh, commonText.unknownError);
  const runDeleteBoard = useAdminMutation(commitDeleteBoard, 'deleteOfficerBoardPost', refresh, commonText.unknownError);

  const [memberId, setMemberId] = useState('');
  const [caps, setCaps] = useState<string[]>([]);
  const [boardBody, setBoardBody] = useState('');
  const [extraAudit, setExtraAudit] = useState<GovernanceAuditEvent[]>([]);
  const [auditBusy, setAuditBusy] = useState(false);

  // Null = the surface does not exist for this guild (unentitled,
  // paygate OFF); the parent only renders this panel when the
  // field is present, so this is a defensive no-op (after hooks,
  // so a refresh that lands the field cannot change hook order).
  if (!governance) return null;
  if (governance.__typename !== 'GuildGovernancePage') {
    const locked = governance as { lockedTitle: string; lockedBody: string };
    return (
      <div style={adminSectionStyle}>
        <h3 style={adminSectionTitleStyle}>{locked.lockedTitle}</h3>
        <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{locked.lockedBody}</p>
      </div>
    );
  }
  const page = governance as GovernancePageData;
  const auditRows = [...page.auditEvents, ...extraAudit];
  const hasMoreAudit = auditRows.length < page.auditTotalCount;

  const pickMember = (id: string) => {
    setMemberId(id);
    const existing = page.officers.find((o) => o.discordId === id);
    setCaps(existing ? [...existing.capabilities] : []);
  };
  const toggleCap = (key: string) => {
    setCaps((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  };
  const loadMoreAudit = async () => {
    setAuditBusy(true);
    try {
      const res: any = await fetchQuery(environment, AuditMoreQuery, {
        slug, limit: 50, offset: auditRows.length,
      }).toPromise();
      const more = res?.viewer?.guildAdmin?.governance?.auditEvents || [];
      setExtraAudit((prev) => [...prev, ...more]);
    } finally {
      setAuditBusy(false);
    }
  };

  return (
    <div>
      <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: '14px 0 0' }}>{page.hint}</p>

      {page.canManageGrants && (
        <div style={adminSectionStyle}>
          <h3 style={adminSectionTitleStyle}>{page.officersTitle}</h3>
          {page.officers.length === 0 ? (
            <p style={{ color: theme.muted, fontSize: 13, margin: '0 0 14px' }}>{page.officersEmptyText}</p>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {page.officers.map((o) => (
                <div key={o.discordId} style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
                  padding: '9px 0', borderBottom: '1px solid rgba(201,163,92,.12)',
                }}>
                  <span style={{ color: theme.paper, fontSize: 13.5, minWidth: 0, overflowWrap: 'anywhere' }}>{o.displayName}</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {o.capabilities.map((key, i) => (
                      <span key={key} style={{
                        fontSize: 11.5, padding: '2px 9px', borderRadius: 999,
                        border: '1px solid rgba(201,163,92,.35)', color: '#ecd28f',
                      }}>{o.capabilityLabels[i] || key}</span>
                    ))}
                  </span>
                  <span style={{ color: theme.muted, fontSize: 12 }}>
                    {o.grantedByText || o.grantedByName} · {o.grantedAtText}
                  </span>
                  <button
                    type="button"
                    onClick={() => runRevokeGrant({ slug, memberDiscordId: o.discordId })}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d88', fontSize: 12.5 }}
                  >{page.revokeButtonLabel}</button>
                </div>
              ))}
            </div>
          )}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontSize: 12, color: theme.muted, letterSpacing: '.08em', marginBottom: 6 }}>
              {page.grantMemberLabel}
            </span>
            <select
              value={memberId}
              onChange={(e) => pickMember(e.target.value)}
              style={{ ...adminInputStyle, appearance: 'auto' }}
            >
              <option value="" />
              {page.roster.map((m) => (
                <option key={m.discordId} value={m.discordId}>{m.displayName}</option>
              ))}
            </select>
          </label>
          <div style={{ fontSize: 12, color: theme.muted, letterSpacing: '.08em', marginBottom: 8 }}>
            {page.grantCapabilitiesLabel}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            {page.capabilityOptions.map((opt) => (
              <button key={opt.key} type="button" style={chipStyle(caps.includes(opt.key))} onClick={() => toggleCap(opt.key)}>
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="yy-btn yy-btn-gold"
            style={{ padding: '9px 26px' }}
            disabled={!memberId}
            onClick={() => runSetGrant({ slug, memberDiscordId: memberId, capabilities: caps })}
          >{page.grantButtonLabel}</button>
        </div>
      )}

      <div style={adminSectionStyle}>
        <h3 style={adminSectionTitleStyle}>{page.boardTitle}</h3>
        <p style={{ color: theme.muted, fontSize: 12.5, margin: '0 0 12px', lineHeight: 1.6 }}>{page.boardHint}</p>
        <textarea
          value={boardBody}
          onChange={(e) => setBoardBody(e.target.value)}
          placeholder={page.boardPlaceholder}
          rows={3}
          maxLength={1000}
          style={{ ...adminInputStyle, resize: 'vertical', marginBottom: 10 }}
        />
        <button
          type="button"
          className="yy-btn yy-btn-gold"
          style={{ padding: '8px 22px' }}
          disabled={!boardBody.trim()}
          onClick={() => { runPostBoard({ slug, body: boardBody }); setBoardBody(''); }}
        >{page.boardPostButtonLabel}</button>
        {page.boardPosts.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: '14px 0 0' }}>{page.boardEmptyText}</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            {page.boardPosts.map((p) => (
              <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(201,163,92,.12)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ color: '#ecd28f', fontSize: 12.5 }}>{p.authorName}</span>
                  <span style={{ color: theme.muted, fontSize: 12 }}>{p.createdAtText}</span>
                  {p.canDelete && (
                    <button
                      type="button"
                      onClick={() => runDeleteBoard({ slug, postId: p.id })}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d88', fontSize: 12.5 }}
                    >{page.boardDeleteButtonLabel}</button>
                  )}
                </div>
                <p style={{ color: theme.paper, fontSize: 13.5, lineHeight: 1.65, margin: '5px 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{p.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={adminSectionStyle}>
        <h3 style={adminSectionTitleStyle}>{page.auditTitle}</h3>
        <p style={{ color: theme.muted, fontSize: 12.5, margin: '0 0 10px', lineHeight: 1.6 }}>{page.auditHint}</p>
        {auditRows.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{page.auditEmptyText}</p>
        ) : (
          <div>
            {auditRows.map((e) => (
              <div key={e.id} style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline',
                padding: '8px 0', borderBottom: '1px solid rgba(201,163,92,.12)', fontSize: 13,
              }}>
                <span style={{ color: theme.muted, fontSize: 12 }}>{e.createdAtText}</span>
                <span style={{ color: theme.paper }}>{e.actorName}</span>
                <span style={{ color: '#ecd28f' }}>{e.actionLabel}</span>
                {e.targetLabel ? (
                  <span style={{ color: theme.muted, minWidth: 0, overflowWrap: 'anywhere' }}>{e.targetLabel}</span>
                ) : null}
              </div>
            ))}
            {hasMoreAudit && (
              <button
                type="button"
                disabled={auditBusy}
                onClick={loadMoreAudit}
                style={{
                  marginTop: 12, background: 'none', cursor: 'pointer', fontSize: 13,
                  border: '1px solid rgba(201,163,92,.35)', borderRadius: 999, padding: '7px 18px', color: '#ecd28f',
                }}
              >{page.auditLoadMoreButtonLabel}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
