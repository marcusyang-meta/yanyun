import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { fill, theme } from '../../lib/format';
import { toast, ConfirmDialog } from './Toast.react.tsx';

// AI recap section of the grouping detail page (P18, Premium T3).
// The server composes the union variant — Locked / NotEnabled /
// Empty / Ready — and this component only renders what it is
// given: paragraphs are generated content (not UI copy), every
// label arrives from the backend, and the generate button exists
// only when the server sent the actions object (manage verdict +
// completed grouping). Generation is a manual, confirmed action;
// the mutation re-verifies everything server-side.
const GenerateRecapMutationNode = graphql`
  mutation GuildRecapSectionGenerateMutation($id: ID!) {
    generateGroupingRecap(id: $id) {
      ok
      error
    }
  }
`;

export default function GuildRecapSection({ recap, groupingId, groupingTitle, confirmOkLabel, confirmCancelLabel, unknownErrorText, onChanged, interactive = true }: {
  recap: any;
  groupingId: string;
  groupingTitle: string;
  confirmOkLabel: string;
  confirmCancelLabel: string;
  unknownErrorText: string;
  onChanged: () => void;
  interactive?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [commitGenerate, generating] = useMutation(GenerateRecapMutationNode);
  if (!recap) return null;

  const actions = recap.actions ?? null;
  const isReady = recap.__typename === 'GroupingRecapReady';

  const doGenerate = () => {
    if (!actions) return;
    commitGenerate({
      variables: { id: groupingId },
      onCompleted: (res: any) => {
        if (res.generateGroupingRecap?.ok) {
          toast(actions.toastGenerated);
          onChanged();
        } else {
          toast(fill(actions.toastFailedTemplate ?? '', { error: res.generateGroupingRecap?.error || unknownErrorText }));
        }
      },
      onError: (e: Error) => toast(fill(actions.toastFailedTemplate ?? '', { error: e.message })),
    });
  };

  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 15, color: theme.goldHi, letterSpacing: 2, marginBottom: 10 }}>
        {recap.title}
      </div>
      <div style={{
        border: theme.border, borderRadius: 10, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0,
      }}>
        {isReady ? (
          <>
            {(recap.summaryLines ?? []).length > 0 && (
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: theme.muted }}>
                {(recap.summaryLines as string[]).map((line, i) => <span key={i}>{line}</span>)}
              </div>
            )}
            {(recap.paragraphs ?? []).map((p: string, i: number) => (
              <p key={i} style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: theme.paper, overflowWrap: 'anywhere' }}>{p}</p>
            ))}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: theme.muted }}>
              <span>{recap.generatedAtText}</span>
              <span>{recap.providerText}</span>
              <span>{recap.versionText}</span>
            </div>
          </>
        ) : recap.body ? (
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: theme.muted }}>{recap.body}</p>
        ) : null}
        {recap.failedHint && (
          <div style={{ fontSize: 12.5, color: '#e08080' }}>{recap.failedHint}</div>
        )}
        {interactive && actions && (
          <div>
            <button
              onClick={() => setConfirming(true)}
              disabled={generating}
              className="yy-btn yy-btn-gold"
              style={{ padding: '6px 16px', fontSize: 13 }}
            >
              {generating ? actions.generatingLabel : isReady ? actions.regenerateLabel : actions.generateLabel}
            </button>
          </div>
        )}
      </div>
      {confirming && actions && (
        <ConfirmDialog
          title={actions.confirmTitle}
          message={fill(actions.confirmMessageTemplate ?? '', { title: groupingTitle })}
          onOk={() => { setConfirming(false); doGenerate(); }}
          onCancel={() => setConfirming(false)}
          okLabel={confirmOkLabel}
          cancelLabel={confirmCancelLabel}
        />
      )}
    </div>
  );
}
