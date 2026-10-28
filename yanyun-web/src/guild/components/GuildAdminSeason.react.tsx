import { useRef, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import {
  adminSectionStyle, adminSectionTitleStyle, ConfirmButton,
  useAdminMutation, type CommonText,
} from './GuildAdminUi.react.tsx';
import { runRosterOcr } from './RosterOcr.ts';

// Season tab of the guild admin (F23 checklist + F25 roster import).
// Every string arrives from the backend: checklist item titles and
// details are composed server-side from live season data, roster
// copy rides the GuildRoster fields, and status labels ride each
// preview row. This component holds no game vocabulary of its own.

type ChecklistItem = {
  key: string; title: string; detail: string; checked: boolean; checkedByName?: string | null;
};
type Checklist = {
  seasonKey: string; versionLabel: string; seasonLabel: string;
  title: string; hint: string; progressTemplate: string;
  doneCount: number; totalCount: number; items: ChecklistItem[];
};
type RosterEntry = {
  id: string; displayName: string; source: string; matchedName?: string | null; createdAt: number;
};
type Roster = {
  rosterTitle: string; rosterHint: string; rosterUploadLabel: string;
  rosterOcrRunningText: string; rosterPreviewTitle: string; rosterConfirmLabel: string;
  rosterEmptyText: string; rosterDeleteLabel: string; rosterSourceOcrLabel: string;
  rosterMatchedMemberLabel: string; entries: RosterEntry[];
};
type PreviewRow = {
  id: string; rawName: string; status: string; statusLabel: string; matchedName: string; importable: boolean;
};
type Preview = {
  batchId: string; matchedCount: number; newCount: number; unrecognizedCount: number; rows: PreviewRow[];
};

const SetItemMutation = graphql`
  mutation GuildAdminSeasonSetItemMutation($slug: String!, $itemKey: String!, $checked: Boolean!) {
    setSeasonChecklistItem(slug: $slug, itemKey: $itemKey, checked: $checked) { ok error }
  }
`;
const PreviewMutation = graphql`
  mutation GuildAdminSeasonPreviewMutation($slug: String!, $lines: [String!]!, $imageCount: Int!) {
    previewRosterImport(slug: $slug, lines: $lines, imageCount: $imageCount) {
      ok error importedCount message
      preview {
        batchId matchedCount newCount unrecognizedCount
        rows { id rawName status statusLabel matchedName importable }
      }
    }
  }
`;
const ConfirmMutation = graphql`
  mutation GuildAdminSeasonConfirmMutation($slug: String!, $batchId: ID!, $rowIds: [ID!]!) {
    confirmRosterImport(slug: $slug, batchId: $batchId, rowIds: $rowIds) { ok error importedCount message }
  }
`;
const DeleteEntryMutation = graphql`
  mutation GuildAdminSeasonDeleteEntryMutation($slug: String!, $entryId: ID!) {
    deleteGuildRosterEntry(slug: $slug, entryId: $entryId) { ok error }
  }
`;

export default function GuildAdminSeason({ slug, commonText, checklist, roster, refresh }: {
  slug: string;
  commonText: CommonText;
  checklist: Checklist;
  roster: Roster;
  refresh: () => void;
}) {
  const [commitSetItem] = useMutation(SetItemMutation);
  const [commitPreview] = useMutation(PreviewMutation);
  const [commitConfirm] = useMutation(ConfirmMutation);
  const [commitDeleteEntry] = useMutation(DeleteEntryMutation);
  const runSetItem = useAdminMutation(commitSetItem, 'setSeasonChecklistItem', refresh, commonText.unknownError);
  const runDeleteEntry = useAdminMutation(commitDeleteEntry, 'deleteGuildRosterEntry', refresh, commonText.unknownError);

  const fileRef = useRef<HTMLInputElement>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const onFiles = async (files: FileList | null) => {
    const list = files ? [...files] : [];
    if (!list.length) return;
    setOcrBusy(true);
    try {
      const lines = await runRosterOcr(list);
      commitPreview({
        variables: { slug, lines, imageCount: list.length },
        onCompleted: (res: any) => {
          const p = res?.previewRosterImport;
          if (p?.ok && p.preview) {
            setPreview(p.preview);
            setSelected(new Set(p.preview.rows.filter((r: PreviewRow) => r.importable).map((r: PreviewRow) => r.id)));
          } else {
            toast(p?.error || commonText.unknownError);
          }
          setOcrBusy(false);
        },
        onError: () => { toast(commonText.unknownError); setOcrBusy(false); },
      });
    } catch {
      toast(commonText.unknownError);
      setOcrBusy(false);
    }
  };

  const onConfirm = () => {
    if (!preview) return;
    commitConfirm({
      variables: { slug, batchId: preview.batchId, rowIds: [...selected] },
      onCompleted: (res: any) => {
        const p = res?.confirmRosterImport;
        if (p?.ok) {
          if (p.message) toast(p.message);
          setPreview(null);
          setSelected(new Set());
          refresh();
        } else {
          toast(p?.error || commonText.unknownError);
        }
      },
      onError: () => toast(commonText.unknownError),
    });
  };

  return (
    <>
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{checklist.title}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 6px' }}>
          {checklist.seasonLabel} · {checklist.versionLabel}
        </p>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{checklist.hint}</p>
        <p style={{ color: theme.paper, fontSize: 13, margin: '0 0 10px' }}>
          {fill(checklist.progressTemplate, { done: checklist.doneCount, total: checklist.totalCount })}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {checklist.items.map((item) => (
            <label key={item.key} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
              padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(201,163,92,.18)',
              background: 'rgba(12,11,9,.35)',
            }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => runSetItem({ slug, itemKey: item.key, checked: e.target.checked })}
                style={{ marginTop: 3 }}
              />
              <span>
                <span style={{ display: 'block', fontSize: 14, color: theme.paper }}>{item.title}</span>
                <span style={{ display: 'block', fontSize: 12, color: theme.muted, marginTop: 2 }}>{item.detail}</span>
                {item.checkedByName ? (
                  <span style={{ display: 'block', fontSize: 12, color: theme.muted, marginTop: 2 }}>{item.checkedByName}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{roster.rosterTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{roster.rosterHint}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="yy-btn yy-btn-gold" disabled={ocrBusy} style={{ padding: '8px 18px' }}
            onClick={() => fileRef.current?.click()}>
            {roster.rosterUploadLabel}
          </button>
          {ocrBusy ? <span style={{ fontSize: 13, color: theme.muted }}>{roster.rosterOcrRunningText}</span> : null}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={(e) => { void onFiles(e.target.files); e.target.value = ''; }} />

        {preview ? (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, color: '#ecd28f', margin: '0 0 10px' }}>{roster.rosterPreviewTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {preview.rows.map((row) => (
                <label key={row.id} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(201,163,92,.14)',
                  fontSize: 13, color: theme.paper,
                }}>
                  <input
                    type="checkbox"
                    disabled={!row.importable}
                    checked={row.importable && selected.has(row.id)}
                    onChange={(e) => setSelected((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(row.id); else next.delete(row.id);
                      return next;
                    })}
                  />
                  <span style={{ flex: 1 }}>{row.rawName}</span>
                  {row.matchedName ? <span style={{ color: theme.muted, fontSize: 12 }}>{row.matchedName}</span> : null}
                  <span style={{
                    fontSize: 12, padding: '2px 8px', borderRadius: 999,
                    border: '1px solid rgba(201,163,92,.3)', color: theme.muted,
                  }}>{row.statusLabel}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button type="button" className="yy-btn yy-btn-gold" style={{ padding: '8px 18px' }} onClick={onConfirm}>
                {roster.rosterConfirmLabel}
              </button>
              <button type="button" className="yy-btn" style={{ padding: '8px 18px' }}
                onClick={() => { setPreview(null); setSelected(new Set()); }}>
                {commonText.cancel}
              </button>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roster.entries.length === 0 ? (
            <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{roster.rosterEmptyText}</p>
          ) : roster.entries.map((entry) => (
            <div key={entry.id} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(201,163,92,.14)',
              fontSize: 13, color: theme.paper,
            }}>
              <span style={{ flex: 1 }}>{entry.displayName}</span>
              {entry.source === 'ocr' ? (
                <span style={{ fontSize: 12, color: theme.muted }}>{roster.rosterSourceOcrLabel}</span>
              ) : null}
              {entry.matchedName ? (
                <span style={{ fontSize: 12, color: theme.muted }}>{roster.rosterMatchedMemberLabel}: {entry.matchedName}</span>
              ) : null}
              <ConfirmButton small label={roster.rosterDeleteLabel} confirmLabel={commonText.confirm}
                onConfirm={() => runDeleteEntry({ slug, entryId: entry.id })} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
