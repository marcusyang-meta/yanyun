import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import GroupingForm from '../src/guild/components/GroupingForm.react.tsx';
import { ToastHost } from '../src/guild/components/Toast.react.tsx';
import { FORM_TEXT } from './formText';

const w = window as any;
w.__formEvents = [];
const params = new URLSearchParams(location.search);
const type = params.get('type') || 'ACTIVITY';
const nick = params.get('nick');
const mode = params.get('mode') || 'create';
const startsAt = params.get('startsAt') || '';

createRoot(document.getElementById('root')!).render(
  <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px' }}>
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={<div>LOADING</div>}>
        {mode === 'edit' ? (
          <GroupingForm slug="harness1" text={FORM_TEXT} mode="edit" groupingId="4242"
            initial={{ title: params.get('title') || '编辑验收车', type, startsAt }}
            onClose={() => w.__formEvents.push('close')}
            onDone={() => w.__formEvents.push('done')} />
        ) : (
          <GroupingForm slug="harness1" text={FORM_TEXT} mode="create" defaultType={type}
            defaultNickname={nick || undefined}
            onClose={() => w.__formEvents.push('close')}
            onDone={() => w.__formEvents.push('done')} />
        )}
      </Suspense>
    </RelayEnvironmentProvider>
    <ToastHost />
  </div>
);
