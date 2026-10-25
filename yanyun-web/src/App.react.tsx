import { Suspense, Component, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { EntryPointContainer, RelayEnvironmentProvider, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import { relayEnvironment } from './lib/relay';
import { loadChromeText, type ChromeText } from './lib/chromeText';
import { fill } from './lib/format';
import AppEntryPoint from './entrypoints/AppEntryPoint';

// 错误边界: resetKey 变化 (路由切换) 时自动复位。
// 旧版边界包住整个 App 且从不复位 — 任何一页抛错都会把整场会话毒化,
// 只能整页刷新才恢复。现在内层边界按 pathname 复位: 点后退/换页即可自愈。
// 文案: 边界在 Relay Provider 之外, 经 chromeText 裸取后端 viewer 通用
// 文案字段 (后端按 locale 生成); 未取到前只渲染无文案占位, 不写死语言。
class ErrBound extends Component<{ resetKey?: string; children: any }, { err: any; text: ChromeText | null }> {
  state = { err: null as any, text: null as ChromeText | null };
  static getDerivedStateFromError(err: any) { return { err }; }
  componentDidMount() {
    loadChromeText().then((text) => { if (text) this.setState({ text }); }).catch(() => {});
  }
  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.err && prev.resetKey !== this.props.resetKey) {
      this.setState({ err: null });
    }
  }
  render() {
    if (this.state.err) {
      const text = this.state.text;
      if (!text) {
        return <div style={{ padding: 32 }} />;
      }
      return (
        <div style={{ color: '#ece2cb', padding: 32, textAlign: 'center' }}>
          <div style={{ color: '#e08080', marginBottom: 12 }}>{fill(text.renderErrorTemplate, { message: String(this.state.err?.message || this.state.err) })}</div>
          <div style={{ color: '#8a7d65', fontSize: 13, marginBottom: 20 }}>{text.renderErrorHint}</div>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              background: 'transparent', border: '1px solid rgba(201,163,92,.5)', color: '#c9a35c',
              borderRadius: 8, padding: '8px 22px', fontSize: 14, cursor: 'pointer',
            }}
          >{text.backToHubLabel}</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 路由级边界: 每次 pathname 变化即复位内层 ErrBound
function RouteBoundary({ children }: { children: any }) {
  const loc = useLocation();
  return <ErrBound resetKey={loc.pathname}>{children}</ErrBound>;
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <div className="yy-skeleton" style={{ height: 120, marginBottom: 24 }} />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

// App shell 走 entrypoint: viewer 查询在渲染前预加载 (render-as-you-fetch),
// 根组件 AppRoot 由 JSResource 懒加载, EntryPointContainer 负责装配。
function AppShell() {
  const environment = useRelayEnvironment();
  const provider = useMemo(() => ({ getEnvironment: () => environment }), [environment]);
  const [entryPointReference, setEntryPointReference] = useState<any>(null);

  useEffect(() => {
    const ref = (loadEntryPoint as any)(provider, AppEntryPoint, {});
    setEntryPointReference(ref);
    return () => ref.dispose();
  }, [provider]);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {entryPointReference ? (
        <EntryPointContainer {...({ entryPointReference, props: {} } as any)} />
      ) : (
        <LoadingSkeleton />
      )}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrBound>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <BrowserRouter>
          <RouteBoundary>
            <AppShell />
          </RouteBoundary>
        </BrowserRouter>
      </RelayEnvironmentProvider>
    </ErrBound>
  );
}
