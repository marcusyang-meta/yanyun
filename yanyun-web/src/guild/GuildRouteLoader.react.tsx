import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import GuildEntryPoint from '../entrypoints/GuildEntryPoint';

function GuildFallback() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

// For the /:slug and /:slug/car/:carId routes: (re)load the guild entrypoint
// when the params change, and dispose the old entrypoint reference in cleanup
// so preloaded data doesn't leak into the store permanently.
export default function GuildRouteLoader() {
  const { slug, carId } = useParams();
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, GuildEntryPoint, { slug: slug!, carId });
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider, slug, carId]);

  return (
    <Suspense fallback={<GuildFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <GuildFallback />
      )}
    </Suspense>
  );
}
