import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider, loadQuery, usePreloadedQuery } from 'react-relay';
import '../src/index.css';
import { relayEnvironment, refetchGearLibraryQueries } from '../src/lib/relay';
import AppViewerQuery from '../src/__generated__/AppViewerQuery.graphql';
import UserBar from '../src/auth/UserBar.react.tsx';
import GearBench from '../src/guild/components/GearBench.react.tsx';

// Profile ↔ 配装台跨表面验收页: 真实 UserBar (内含 Profile 对话框,
// 对话框内嵌 GearLibrary profile 模式) + 真实 GearBench (内含
// GearLibrary bench 模式), 同一 relayEnvironment / 同一后端存储。
(window as any).__marker = 'alive';
(window as any).__refetchGear = refetchGearLibraryQueries;
(window as any).__env = relayEnvironment;

const queryRef = loadQuery(relayEnvironment, AppViewerQuery as any, {});

function Root() {
  const data = usePreloadedQuery<any>(AppViewerQuery as any, queryRef);
  const v: any = data.viewer ?? {};
  return (
    <div style={{ padding: 20 }}>
      {v.user && (
        <UserBar
          user={v.user}
          text={{
            logoutLabel: v.userBarLogoutLabel,
            loggingOutLabel: v.userBarLoggingOutLabel,
            settingsLabel: v.userBarSettingsLabel,
          }}
        />
      )}
      <div data-testid="bench-zone">
        <Suspense fallback={<div>BENCH LOADING</div>}>
          <GearBench />
        </Suspense>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <Suspense fallback={<div>LOADING</div>}>
      <Root />
    </Suspense>
  </RelayEnvironmentProvider>,
);
