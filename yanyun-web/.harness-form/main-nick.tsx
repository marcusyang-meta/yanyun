import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import GroupingForm from '../src/guild/components/GroupingForm.react.tsx';
import SeatGrid from '../src/guild/components/SeatGrid.react.tsx';
import { ToastHost } from '../src/guild/components/Toast.react.tsx';

const w = window as any;
w.__formEvents = [];

createRoot(document.getElementById('root')!).render(
  <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px' }}>
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={<div>LOADING</div>}>
        <GroupingForm slug="harness1" mode="create" defaultType="TALENT"
          defaultNickname="服务器昵称甲"
          onClose={() => w.__formEvents.push('close')}
          onDone={() => w.__formEvents.push('done')} />
      </Suspense>
      <div id="seatgrid-zone">
        <SeatGrid groupingId="1" seats={[]} maxSlots={5}
          defaultNickname="服务器昵称甲" onChanged={() => {}} />
      </div>
    </RelayEnvironmentProvider>
    <ToastHost />
  </div>
);
