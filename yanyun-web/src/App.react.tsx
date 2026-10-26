import { Suspense, Component, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { EntryPointContainer, RelayEnvironmentProvider, loadEntryPoint, useRelayEnvironment } from 'react-relay';
import { relayEnvironment } from './lib/relay';
import { loadChromeText, type ChromeText } from './lib/chromeText';
import { fill } from './lib/format';
import AppEntryPoint from './entrypoints/AppEntryPoint';

// Error boundary: resets when resetKey changes. The old boundary wrapped the
// whole app and never reset, so one page's error poisoned the entire session
// until a full reload; the inner boundary now resets per pathname, so
// navigating away self-heals. It sits outside the Relay provider, so its copy
// comes from chromeText's raw fetch of the viewer's generic text fields
// (backend-generated per locale); until that lands it renders a text-free
// placeholder rather than hardcoding a language.
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
