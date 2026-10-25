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

// /:slug 与 /:slug/car/:carId 路由: 参数变化时 (重新) 加载 guild entrypoint,
// 旧 entrypoint 引用在 cleanup 中 dispose, 避免预加载数据泄漏进 store 常驻。
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
