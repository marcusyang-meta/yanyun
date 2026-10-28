import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import GuildRecruitEntryPoint from '../entrypoints/GuildRecruitEntryPoint';

function RecruitFallback() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

// For the /:slug/recruit route: (re)load the recruit entrypoint when
// the slug changes; dispose the old reference in cleanup.
// slugOverride serves the guild-subdomain /recruit route (tier A).
export default function GuildRecruitRouteLoader({ slugOverride }: { slugOverride?: string } = {}) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, GuildRecruitEntryPoint, { slug: slug! });
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider, slug]);

  return (
    <Suspense fallback={<RecruitFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <RecruitFallback />
      )}
    </Suspense>
  );
}
