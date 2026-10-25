import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import GearBench from '../src/guild/components/GearBench.react.tsx';

// 传家宝盖章验收页: 真实 GearBench (内含 GearLibrary bench 模式),
// 夹具与搭配由 run.mjs 在页面脚本执行前经 localStorage 种子注入。
(window as any).__marker = 'alive';

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <div style={{ padding: 20 }}>
      <div data-testid="bench-zone">
        <Suspense fallback={<div>BENCH LOADING</div>}>
          <GearBench />
        </Suspense>
      </div>
    </div>
  </RelayEnvironmentProvider>,
);
