import { useRef, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { Link } from 'react-router-dom';
import { fill, theme } from '../../lib/format';
import { toast, ConfirmDialog } from './Toast.react.tsx';

// Combat report section of the grouping detail page (combat
// reports v1, Premium T2). The server composes the union variant
// — Locked / Empty / Ready, or nothing at all (null below T2
// with the paygate OFF: the section does not exist) — and this
// component only renders what it is given: every label arrives
// from the backend. Imports post the file to the HTTP import
// route (files do not travel over GraphQL); the route answers
// with an error code and this maps it to the backend-delivered
// per-code copy on the actions object — never its own text.
// Deletion rides the deleteCombatEncounter mutation; the delete
// affordance exists only on rows the server sent a deleteAction
// object for (uploader / leader / guild admin).
const DeleteEncounterMutationNode = graphql`
  mutation GuildCombatReportSectionDeleteMutation($id: ID!) {
    deleteCombatEncounter(id: $id) {
      ok
      error
    }
  }
`;

const IMPORT_ERROR_FIELD: Record<string, string> = {
  formatUnsupported: 'importErrorFormat',
  validationFailed: 'importErrorValidation',
  importDailyLimit: 'importErrorLimit',
  reportForbidden: 'importErrorForbidden',
  groupingNotFound: 'importErrorNotFound',
  premiumRequired: 'importErrorTier',
};

export default function GuildCombatReportSection({ combatReport, groupingId, reportPathBase, confirmOkLabel, confirmCancelLabel, unknownErrorText, onChanged }: {
  combatReport: any;
  groupingId: string;
  reportPathBase: string;
  confirmOkLabel: string;
  confirmCancelLabel: string;
  unknownErrorText: string;
  onChanged: () => void;
}) {
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [commitDelete, deleteInFlight] = useMutation(DeleteEncounterMutationNode);
  if (!combatReport) return null;

  const actions = combatReport.actions ?? null;
  const isReady = combatReport.__typename === 'GroupingCombatReportReady';

  const importErrorText = (code: string | undefined, actionsObj: any): string => {
    const field = code ? IMPORT_ERROR_FIELD[code] : undefined;
    return (field && actionsObj?.[field]) || unknownErrorText;
  };

  const onFilePicked = async (file: File) => {
    if (!actions) return;
    setImporting(true);
    try {
      const text = await file.text();
      const res = await fetch(`/api/groupings/${groupingId}/combat-reports`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: text,
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.ok) {
        toast(actions.toastImported);
        onChanged();
      } else {
        toast(fill(actions.toastImportFailedTemplate ?? '', { error: importErrorText(body?.errorCode, actions) }));
      }
    } catch (e) {
      toast(fill(actions.toastImportFailedTemplate ?? '', { error: e instanceof Error ? e.message : unknownErrorText }));
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const doDelete = () => {
    const row = deleting;
    setDeleting(null);
    if (!row?.deleteAction) return;
    commitDelete({
      variables: { id: row.id },
      onCompleted: (res: any) => {
        if (res.deleteCombatEncounter?.ok) {
          toast(row.deleteAction.toastDeleted);
          onChanged();
        } else {
          toast(fill(row.deleteAction.toastDeleteFailedTemplate ?? '', { error: res.deleteCombatEncounter?.error || unknownErrorText }));
        }
      },
      onError: (e: Error) => toast(fill(row.deleteAction.toastDeleteFailedTemplate ?? '', { error: e.message })),
    });
  };

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 15, color: theme.goldHi, letterSpacing: 2, marginBottom: 10 }}>
        {combatReport.title}
      </div>
      <div style={{
        border: theme.border, borderRadius: 10, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0,
      }}>
        {isReady ? (
          <>
            <div style={{ fontSize: 13, color: theme.muted }}>{combatReport.encountersTitle}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(combatReport.encounters ?? []).map((row: any) => (
                <div key={row.id} style={{
                  display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline',
                  border: theme.border, borderRadius: 8, padding: '9px 12px', fontSize: 13.5,
                }}>
                  <span style={{ color: theme.goldHi }}>{row.bossName}</span>
                  <span style={{ color: theme.muted }}>{row.resultText}</span>
                  <span style={{ color: theme.muted }}>{row.durationText}</span>
                  <span style={{ color: theme.muted }}>{row.teamDpsText}</span>
                  <span style={{ color: theme.muted }}>{row.startedAtText}</span>
                  <span style={{ color: theme.muted }}>{row.sourceText}</span>
                  <span style={{ color: theme.muted }}>{row.uploaderText}</span>
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, alignItems: 'baseline' }}>
                    <Link
                      to={`${reportPathBase}?encounter=${row.id}`}
                      style={{ color: theme.goldHi, fontSize: 13, textDecoration: 'none' }}
                    >
                      {combatReport.viewReportLabel}
                    </Link>
                    {row.deleteAction && (
                      <button
                        type="button"
                        onClick={() => setDeleting(row)}
                        disabled={deleteInFlight}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#e08080', fontSize: 13, padding: 0,
                        }}
                      >
                        {row.deleteAction.deleteLabel}
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : combatReport.body ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: theme.muted }}>{combatReport.body}</p>
        ) : null}
        {combatReport.failedHint && (
          <div style={{ fontSize: 12.5, color: '#e08080' }}>{combatReport.failedHint}</div>
        )}
        {actions && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFilePicked(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="yy-btn yy-btn-gold"
              style={{ padding: '6px 16px', fontSize: 13 }}
            >
              {importing ? actions.importingLabel : actions.importLabel}
            </button>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 6 }}>{actions.importHint}</div>
          </div>
        )}
      </div>
      {deleting?.deleteAction && (
        <ConfirmDialog
          title={deleting.deleteAction.confirmTitle}
          message={fill(deleting.deleteAction.confirmMessageTemplate ?? '', { boss: deleting.bossName })}
          onOk={doDelete}
          onCancel={() => setDeleting(null)}
          okLabel={confirmOkLabel}
          cancelLabel={confirmCancelLabel}
        />
      )}
    </div>
  );
}
