import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EntryPointContainer, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import CombatReportEntryPoint from './entrypoints/CombatReportEntryPoint';

// Combat report route (/{slug}/car/{carId}/report, plus the
// guild-host form /car/{carId}/report): loads the report
// entrypoint for the route's slug + grouping, with the optional
// ?encounter= selection. Login gating happens in AppRoot like
// the other car routes.
function CombatReportFallback() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

export default function CombatReportRoute({ slugOverride }: { slugOverride?: string } = {}) {
  const { slug, carId } = useParams();
  const [searchParams] = useSearchParams();
  const encounterId = searchParams.get('encounter');
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  const effectiveSlug = slugOverride ?? slug ?? null;
  const backPath = effectiveSlug ? `/${effectiveSlug}/car/${carId}` : `/car/${carId}`;

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, CombatReportEntryPoint, {
      slug: effectiveSlug,
      groupingId: carId || '',
      encounterId: encounterId || null,
      backPath,
    });
    setEntryPointReference(ref);
    return () => ref.dispose();
    // backPath derives from effectiveSlug + carId; listed via its parts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, effectiveSlug, carId, encounterId]);

  return (
    <Suspense fallback={<CombatReportFallback />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <CombatReportFallback />
      )}
    </Suspense>
  );
}
