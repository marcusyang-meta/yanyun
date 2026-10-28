import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import CarShareEntryPoint from './entrypoints/CarShareEntryPoint';

function CarShareFallback() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

export default function CarShareRoute() {
  const { code } = useParams();
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, CarShareEntryPoint, { code: code || '' });
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider, code]);

  return (
    <Suspense fallback={<CarShareFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <CarShareFallback />
      )}
    </Suspense>
  );
}
