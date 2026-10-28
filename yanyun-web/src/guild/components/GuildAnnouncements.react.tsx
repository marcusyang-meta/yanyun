import { useMemo, useState } from 'react';
import { graphql, usePreloadedQuery, loadQuery, useMutation } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import { executeQueryRefresh } from '../../lib/guildLive';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import { ConfirmButton, adminInputStyle, adminLabelStyle } from './GuildAdminUi.react.tsx';
import type { GuildAnnouncementsMemberQuery as MemberQueryType } from './__generated__/GuildAnnouncementsMemberQuery.graphql';
import type { GuildAnnouncementsAdminQuery as AdminQueryType } from './__generated__/GuildAnnouncementsAdminQuery.graphql';

// Guild announcements (communication line F9/F10/F18): one panel for
// the member tab and the admin tab. Every string arrives on the
// GuildAnnouncementPage shell (backend-composed by locale); this file
// holds structure only. The member variant never carries compose or
// receipt data (canPost=false, receipts absent) — the admin variant
// is the same component fed from viewer.guildAdmin, whose response
// type is itself the admin verdict.



const MemberQueryNode = graphql`
  query GuildAnnouncementsMemberQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      guild(slug: $slug) {
        __typename
        ... on Guild {
          announcements {
                          title
              emptyText
              urgentLabel
              composeTitle
              kindLabel
              kindStandardLabel
              kindUrgentLabel
              titleLabel
              titlePlaceholder
              bodyLabel
              bodyPlaceholder
              postLabel
              postingLabel
              postedText
              deleteLabel
              receiptsTitle
              readListLabel
              unreadListLabel
              pushNote
              urgentNote
              dailyLimitText
              canPost
              standardRemaining
              urgentRemaining
              announcements {
                id
                kind
                urgent
                urgentLabel
                kindLabel
                title
                body
                authorName
                authorText
                createdAtText
                viewerHasRead
                readCount
                memberCount
                readCountText
                deleteLabel
                deleteConfirmTitle
                deleteConfirmMessage
                receipts {
                  discordId
                  displayName
                  read
                  readAtText
                }
              }
          }
        }
        ... on GuildReadOnly {
          announcements {
                          title
              emptyText
              urgentLabel
              composeTitle
              kindLabel
              kindStandardLabel
              kindUrgentLabel
              titleLabel
              titlePlaceholder
              bodyLabel
              bodyPlaceholder
              postLabel
              postingLabel
              postedText
              deleteLabel
              receiptsTitle
              readListLabel
              unreadListLabel
              pushNote
              urgentNote
              dailyLimitText
              canPost
              standardRemaining
              urgentRemaining
              announcements {
                id
                kind
                urgent
                urgentLabel
                kindLabel
                title
                body
                authorName
                authorText
                createdAtText
                viewerHasRead
                readCount
                memberCount
                readCountText
                deleteLabel
                deleteConfirmTitle
                deleteConfirmMessage
                receipts {
                  discordId
                  displayName
                  read
                  readAtText
                }
              }
          }
        }
      }
    }
  }
`;

const AdminQueryNode = graphql`
  query GuildAnnouncementsAdminQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      guildAdmin(slug: $slug) {
        __typename
        ... on GuildAdmin {
          announcements {
                          title
              emptyText
              urgentLabel
              composeTitle
              kindLabel
              kindStandardLabel
              kindUrgentLabel
              titleLabel
              titlePlaceholder
              bodyLabel
              bodyPlaceholder
              postLabel
              postingLabel
              postedText
              deleteLabel
              receiptsTitle
              readListLabel
              unreadListLabel
              pushNote
              urgentNote
              dailyLimitText
              canPost
              standardRemaining
              urgentRemaining
              announcements {
                id
                kind
                urgent
                urgentLabel
                kindLabel
                title
                body
                authorName
                authorText
                createdAtText
                viewerHasRead
                readCount
                memberCount
                readCountText
                deleteLabel
                deleteConfirmTitle
                deleteConfirmMessage
                receipts {
                  discordId
                  displayName
                  read
                  readAtText
                }
              }
          }
        }
      }
    }
  }
`;

const PostMutationNode = graphql`
  mutation GuildAnnouncementsPostMutation($slug: String!, $kind: AnnouncementKind!, $title: String!, $body: String!) {
    postGuildAnnouncement(slug: $slug, kind: $kind, title: $title, body: $body) {
      ok
      error
      errorCode
      announcement {
        id
      }
    }
  }
`;

const MarkReadMutationNode = graphql`
  mutation GuildAnnouncementsMarkReadMutation($slug: String!, $id: ID!) {
    markGuildAnnouncementRead(slug: $slug, announcementId: $id) {
      ok
      error
      errorCode
    }
  }
`;

const DeleteMutationNode = graphql`
  mutation GuildAnnouncementsDeleteMutation($slug: String!, $id: ID!) {
    deleteGuildAnnouncement(slug: $slug, announcementId: $id) {
      ok
      error
      errorCode
    }
  }
`;

type AnnouncementItem = {
  id: string;
  kind: string;
  urgent: boolean;
  urgentLabel?: string | null;
  kindLabel: string;
  title: string;
  body: string;
  authorText?: string | null;
  createdAtText: string;
  viewerHasRead?: boolean | null;
  readCountText?: string | null;
  deleteLabel: string;
  deleteConfirmTitle: string;
  receipts?: ReadonlyArray<{
    discordId: string;
    displayName: string;
    read: boolean;
    readAtText?: string | null;
  }> | null;
};

function AnnouncementCard({ item, page, slug, admin, refresh }: {
  item: AnnouncementItem;
  page: any;
  slug: string;
  admin: boolean;
  refresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [readLocal, setReadLocal] = useState<boolean | null>(null);
  const [commitMark] = useMutation(MarkReadMutationNode);
  const [commitDelete] = useMutation(DeleteMutationNode);
  const hasRead = readLocal ?? item.viewerHasRead;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Opening an announcement IS the read (F10): fire the mark once,
    // only when the server says this viewer has not read it yet.
    if (next && item.viewerHasRead === false && readLocal !== true) {
      commitMark({
        variables: { slug, id: item.id },
        onCompleted: (res: any) => {
          if (res?.markGuildAnnouncementRead?.ok) setReadLocal(true);
        },
        onError: () => {},
      });
    }
  };

  const receipts = item.receipts ?? null;
  const readNames = (receipts ?? []).filter((r) => r.read);
  const unreadNames = (receipts ?? []).filter((r) => !r.read);

  return (
    <div
      style={{
        border: `1px solid ${item.urgent ? 'rgba(192,57,43,.55)' : 'rgba(201,163,92,.22)'}`,
        background: item.urgent ? 'rgba(192,57,43,.07)' : 'rgba(236,226,203,.03)',
        borderRadius: 12, padding: '14px 16px', marginTop: 12,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        style={{
          display: 'flex', width: '100%', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
        }}
      >
        {item.urgent && item.urgentLabel && (
          <span style={{
            fontSize: 11, letterSpacing: '.08em', color: '#fff', background: '#c0392b',
            borderRadius: 999, padding: '2px 9px', flexShrink: 0,
          }}>{item.urgentLabel}</span>
        )}
        <span style={{ fontSize: 15, color: theme.paper, fontWeight: 600, minWidth: 0 }}>{item.title}</span>
        {hasRead === false && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: theme.gold, flexShrink: 0,
          }} />
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: theme.muted, flexShrink: 0 }}>
          {item.createdAtText}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: theme.muted, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>{item.kindLabel}</span>
            {item.authorText && <span>{item.authorText}</span>}
          </div>
          {item.body && (
            <p style={{ fontSize: 14, color: theme.paper, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>
              {item.body}
            </p>
          )}
          {admin && receipts && (
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(201,163,92,.15)', paddingTop: 10 }}>
              <div style={{ fontSize: 12, color: theme.muted, letterSpacing: '.06em' }}>
                {page.receiptsTitle}
                {item.readCountText ? ` · ${item.readCountText}` : ''}
              </div>
              {readNames.length > 0 && (
                <p style={{ fontSize: 13, margin: '8px 0 0', color: theme.paper, lineHeight: 1.8 }}>
                  <span style={{ color: theme.muted }}>{page.readListLabel}：</span>
                  {readNames.map((r) => r.displayName).join('、')}
                </p>
              )}
              {unreadNames.length > 0 && (
                <p style={{ fontSize: 13, margin: '4px 0 0', color: theme.muted, lineHeight: 1.8 }}>
                  <span>{page.unreadListLabel}：</span>
                  {unreadNames.map((r) => r.displayName).join('、')}
                </p>
              )}
              <div style={{ marginTop: 10 }}>
                <ConfirmButton
                  small
                  label={item.deleteLabel}
                  confirmLabel={item.deleteConfirmTitle}
                  onConfirm={() => commitDelete({
                    variables: { slug, id: item.id },
                    onCompleted: (res: any) => {
                      const p = res?.deleteGuildAnnouncement;
                      if (p?.ok) refresh();
                    },
                    onError: () => {},
                  })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComposeForm({ page, slug, refresh, unknownError }: {
  page: any;
  slug: string;
  refresh: () => void;
  unknownError: string;
}) {
  const [kind, setKind] = useState<'STANDARD' | 'URGENT'>('STANDARD');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commitPost, posting] = useMutation(PostMutationNode);

  const submit = () => {
    commitPost({
      variables: { slug, kind, title, body },
      onCompleted: (res: any) => {
        const p = res?.postGuildAnnouncement;
        if (p?.ok) {
          toast(page.postedText);
          setTitle('');
          setBody('');
          setKind('STANDARD');
          refresh();
        } else {
          toast(p?.error || unknownError);
        }
      },
      onError: () => toast(unknownError),
    });
  };

  const kindButton = (value: 'STANDARD' | 'URGENT', label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setKind(value)}
      style={{
        padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
        border: `1px solid ${kind === value ? (value === 'URGENT' ? '#c0392b' : theme.gold) : 'rgba(201,163,92,.3)'}`,
        background: kind === value ? (value === 'URGENT' ? 'rgba(192,57,43,.2)' : 'rgba(201,163,92,.16)') : 'transparent',
        color: kind === value ? '#ecd28f' : theme.muted,
      }}
    >
      {label}
    </button>
  );

  return (
    <section style={{
      marginTop: 6, padding: '18px 18px 20px', borderRadius: 12,
      border: '1px solid rgba(201,163,92,.22)', background: 'rgba(236,226,203,.03)',
    }}>
      <h2 style={{ fontSize: 16, color: '#ecd28f', margin: '0 0 12px', letterSpacing: '.05em' }}>{page.composeTitle}</h2>
      <span style={adminLabelStyle}>{page.kindLabel}</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {kindButton('STANDARD', page.kindStandardLabel)}
        {kindButton('URGENT', page.kindUrgentLabel)}
      </div>
      <label style={adminLabelStyle}>{page.titleLabel}</label>
      <input
        style={adminInputStyle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={page.titlePlaceholder}
        maxLength={200}
      />
      <label style={{ ...adminLabelStyle, marginTop: 12 }}>{page.bodyLabel}</label>
      <textarea
        style={{ ...adminInputStyle, minHeight: 96, resize: 'vertical' }}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={page.bodyPlaceholder}
        maxLength={4000}
      />
      <p style={{ fontSize: 12, color: theme.muted, margin: '10px 0 0', lineHeight: 1.7 }}>
        {page.pushNote}
        {kind === 'URGENT' ? ` ${page.urgentNote}` : ''}
        {page.dailyLimitText ? ` ${page.dailyLimitText}` : ''}
      </p>
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <button
          type="button"
          disabled={posting}
          onClick={submit}
          style={{
            padding: '9px 22px', borderRadius: 8, border: 'none', cursor: posting ? 'default' : 'pointer',
            background: kind === 'URGENT' ? '#c0392b' : theme.gold,
            color: kind === 'URGENT' ? '#fff' : '#221c10', fontSize: 14, fontWeight: 600,
            opacity: posting ? 0.6 : 1,
          }}
        >
          {posting ? page.postingLabel : page.postLabel}
        </button>
      </div>
    </section>
  );
}

function AnnouncementsPanel({ page, slug, admin, refresh, unknownError }: {
  page: any;
  slug: string;
  admin: boolean;
  refresh: () => void;
  unknownError: string;
}) {
  const items: AnnouncementItem[] = page?.announcements ?? [];
  return (
    <div>
      {admin && page?.canPost && (
        <ComposeForm page={page} slug={slug} refresh={refresh} unknownError={unknownError} />
      )}
      {items.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 14, textAlign: 'center', padding: '28px 0' }}>{page?.emptyText}</p>
      ) : (
        items.map((item) => (
          <AnnouncementCard key={item.id} item={item} page={page} slug={slug} admin={admin} refresh={refresh} />
        ))
      )}
    </div>
  );
}

/* Member tab (Guild home): fed from viewer.guild — Guild and
 * GuildReadOnly both carry the member variant; GuildLocked renders
 * nothing because it has no announcements field to select. */
export function GuildAnnouncementsRoute({ slug }: { slug: string }) {
  const queryRef = useMemo(
    () => loadQuery<MemberQueryType>(relayEnvironment, MemberQueryNode, { slug }, { fetchPolicy: 'store-or-network' }),
    [slug],
  );
  return <MemberPanel slug={slug} queryRef={queryRef} />;
}

function MemberPanel({ slug, queryRef }: { slug: string; queryRef: PreloadedQuery<MemberQueryType> }) {
  const data = usePreloadedQuery<MemberQueryType>(MemberQueryNode, queryRef);
  const page = (data as any)?.viewer?.guild?.announcements;
  const unknownError = (data as any)?.viewer?.commonUnknownErrorText ?? '';
  const refresh = () => { void executeQueryRefresh(MemberQueryNode, { slug }).catch(() => {}); };
  if (!page) return null;
  return <AnnouncementsPanel page={page} slug={slug} admin={false} refresh={refresh} unknownError={unknownError} />;
}

/* Admin tab (GuildAdmin page): fed from viewer.guildAdmin — only the
 * GuildAdmin branch carries the page, so reaching the panel at all is
 * the server's admin verdict. */
export function GuildAdminAnnouncementsRoute({ slug }: { slug: string }) {
  const queryRef = useMemo(
    () => loadQuery<AdminQueryType>(relayEnvironment, AdminQueryNode, { slug }, { fetchPolicy: 'store-or-network' }),
    [slug],
  );
  return <AdminPanel slug={slug} queryRef={queryRef} />;
}

function AdminPanel({ slug, queryRef }: { slug: string; queryRef: PreloadedQuery<AdminQueryType> }) {
  const data = usePreloadedQuery<AdminQueryType>(AdminQueryNode, queryRef);
  const page = (data as any)?.viewer?.guildAdmin?.announcements;
  const unknownError = (data as any)?.viewer?.commonUnknownErrorText ?? '';
  const refresh = () => { void executeQueryRefresh(AdminQueryNode, { slug }).catch(() => {}); };
  if (!page) return null;
  return <AnnouncementsPanel page={page} slug={slug} admin refresh={refresh} unknownError={unknownError} />;
}
