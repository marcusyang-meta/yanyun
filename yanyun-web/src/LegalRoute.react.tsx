import { Suspense, useEffect, useMemo, useState } from 'react';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import LegalEntryPoint from './entrypoints/LegalEntryPoint';

function LegalFallback() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

export default function LegalRoute({ kind }: { kind: 'TERMS' | 'PRIVACY' }) {
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, LegalEntryPoint, { kind });
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider, kind]);

  return (
    <Suspense fallback={<LegalFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <LegalFallback />
      )}
    </Suspense>
  );
}
