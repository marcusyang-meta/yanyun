import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import GuildAdminEntryPoint from '../entrypoints/GuildAdminEntryPoint';

function AdminFallback() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

// For the /:slug/admin route: (re)load the admin entrypoint when the
// slug changes; dispose the old reference in cleanup.
export default function GuildAdminRouteLoader() {
  const { slug } = useParams();
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, GuildAdminEntryPoint, { slug: slug! });
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider, slug]);

  return (
    <Suspense fallback={<AdminFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <AdminFallback />
      )}
    </Suspense>
  );
}
