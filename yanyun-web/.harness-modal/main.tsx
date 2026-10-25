import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import GroupingForm from '../src/guild/components/GroupingForm.react.tsx';
import { ToastHost } from '../src/guild/components/Toast.react.tsx';

const w = window as any;
w.__formEvents = [];
const isEdit = new URLSearchParams(location.search).get('mode') === 'edit';

// 复刻应用布局: 居中窄列 + 带入场动画 (transform 包含块) 的页面容器,
// 弹窗若未 portal 到 body 就会被困在这列里偏左 — 本页就是复现/验收场。
createRoot(document.getElementById('root')!).render(
  <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px' }}>
    <div className="yy-anim-fade-up">
      <div style={{ padding: 24, color: '#ece2cb' }}>页面内容占位</div>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <Suspense fallback={<div>LOADING</div>}>
          {isEdit ? (
            <GroupingForm slug="jijiguagua" mode="edit" groupingId="30"
              initial={{ title: '双十 周日美东5:30', type: 'ACTIVITY', startsAt: '1792900200' }}
              onClose={() => w.__formEvents.push('close')}
              onDone={() => w.__formEvents.push('done')} />
          ) : (
            <GroupingForm slug="jijiguagua" mode="create"
              onClose={() => w.__formEvents.push('close')}
              onDone={() => w.__formEvents.push('done')} />
          )}
        </Suspense>
      </RelayEnvironmentProvider>
      <ToastHost />
    </div>
  </div>
);
