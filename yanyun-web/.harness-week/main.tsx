import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import { getWeekRange, fmtRangePoint, weekRangeLabel } from '../src/lib/format';
import { GroupingListRoute } from '../src/guild/components/GroupingList.react.tsx';

// 验收脚本从页面里取同一份格式化函数的输出当期望值 (同源比对, 不另抄一份逻辑)
(window as any).__fmt = { getWeekRange, fmtRangePoint, weekRangeLabel };

createRoot(document.getElementById('root')!).render(
  <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px' }}>
    <MemoryRouter>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <Suspense fallback={<div>LOADING</div>}>
          <GroupingListRoute slug="harness1" />
        </Suspense>
      </RelayEnvironmentProvider>
    </MemoryRouter>
  </div>
);
