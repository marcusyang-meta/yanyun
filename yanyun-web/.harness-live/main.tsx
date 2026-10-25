import { createRoot } from 'react-dom/client';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';
import { relayEnvironment } from '../src/lib/relay';
import { GroupingListRoute } from '../src/guild/components/GroupingList.react.tsx';
import { GroupingDetailRoute } from '../src/guild/components/GroupingDetail.react.tsx';

// ?view=list -> 真实车队列表 (成员语境); ?view=detail&car=<id> -> 真实车队详情。
// 页面侧 GraphQL 走同源相对路径, 由 run.mjs 的静态服务器代理到本地
// wrangler dev (带成员 A 的会话); WebSocket 由 run.mjs 的 shim 接管。
const params = new URLSearchParams(window.location.search);
const view = params.get('view') || 'list';
const car = params.get('car') || '';
(window as any).__env = relayEnvironment;

createRoot(document.getElementById('root')!).render(
  <MemoryRouter>
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={<div>LOADING</div>}>
        {view === 'detail'
          ? <GroupingDetailRoute slug="livetest" groupingId={car} onBack={() => {}} defaultNickname="成员A" goneText="车队不存在或已解散" backText="‹ 返回车队列表" />
          : <GroupingListRoute slug="livetest" defaultNickname="成员A" />}
      </Suspense>
    </RelayEnvironmentProvider>
  </MemoryRouter>
);
