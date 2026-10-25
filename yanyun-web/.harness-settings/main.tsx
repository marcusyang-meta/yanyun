import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider, loadQuery, usePreloadedQuery } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import AppViewerQuery from '../src/__generated__/AppViewerQuery.graphql';
import UserBar from '../src/auth/UserBar.react.tsx';

// 设置对话框验收页: 真实 relayEnvironment (模块单例) + 真实 AppViewerQuery
// (探针, 显示 siteTitle / myEffectiveLocale / myLocalePref) + 真实 UserBar
// (内含设置入口与 SettingsDialog)。语言切换必须在同一环境内原地生效:
// __marker 不消失 = 没有整页刷新; 环境从不重建 (模块单例)。
(window as any).__marker = 'alive';
(window as any).__env = relayEnvironment;

const queryRef = loadQuery(relayEnvironment, AppViewerQuery as any, {});

function Root() {
  const data = usePreloadedQuery<any>(AppViewerQuery as any, queryRef);
  const v: any = data.viewer ?? {};
  return (
    <div style={{ padding: 20 }}>
      <div data-testid="probe-title">{v.siteTitle}</div>
      <div data-testid="probe-locale">{v.myEffectiveLocale ?? ''}</div>
      <div data-testid="probe-pref">{v.myLocalePref ?? ''}</div>
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
