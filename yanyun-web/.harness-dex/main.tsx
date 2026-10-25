import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { relayEnvironment } from '../src/lib/relay';
import { BossDexRoute } from '../src/guild/components/BossDex.react.tsx';

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <Suspense fallback={<div>LOADING</div>}>
      <BossDexRoute />
    </Suspense>
  </RelayEnvironmentProvider>
);
