import {
  Environment, Network, RecordSource, Store, fetchQuery,
  type FetchFunction, type GraphQLResponse,
} from 'relay-runtime';
import { API_URL } from './config';
import { getToken } from './storage';
import { effectiveLocaleTag, onLocaleChanged } from './locale';

// Relay 环境: 与网站同一套 GraphQL 契约。会话走 Authorization Bearer
// (后端 getSessionUser 与 cookie 同一校验路径, 含吊销检查)。
// x-locale 每请求动态取 effectiveLocaleTag() (账号偏好镜像 ?? 设备语言),
// 后端据此按 locale 生成全部 UI 文案与错误。
const fetchFn: FetchFunction = async (operation, variables) => {
  const token = await getToken();
  let tz: string | undefined;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* 保持 undefined */ }
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-locale': effectiveLocaleTag(),
      ...(tz ? { 'x-tz': tz } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query: operation.text, variables }),
  });
  return (await res.json()) as GraphQLResponse;
};

/**
 * 记录身份按类型命名空间: `${__typename}:${id}` (与 Web relay.ts 同一份
 * 语义, 2026-10-25 图鉴接入时补齐)。
 *
 * 为什么: 后端 id 是 D1 各表的自增整数, 不是全局唯一 —— Boss 1 与
 * Dungeon 1 同时存在。Relay 默认拿裸 id 当 store 记录键, 不同类型的
 * 同号记录会被合并成一条 (图鉴首行副本名被同号首领名覆盖就是它)。
 * 这里只改 store 内部的记录键: 记录的 id 字段本身、URL 与 mutation
 * 入参仍是裸 id, 线格式与后端都不动。没有 id 字段的记录返回 null,
 * 照旧由 Relay 生成 client id; Viewer 保持默认单例语义。
 *
 * 双份接线 (与 Web 同一个坑): Environment 只在自己新建 store 时才把
 * config.getDataID 注入 store; 本应用自带 store, 所以同一份函数必须
 * 同时传给 Environment config 和 Store options, 只传一处两边算出的
 * 记录键不一致, store.check 会把已发布数据判成缺失。
 */
function getDataID(
  data: { [key: string]: unknown },
  typeName?: string | null,
): string | null {
  const id = data.id;
  if (id == null) {
    return typeName === 'Viewer' ? 'client:root:viewer' : null;
  }
  const typename =
    typeName ?? (typeof data.__typename === 'string' ? data.__typename : null);
  return typename != null ? `${typename}:${String(id)}` : String(id);
}

// v21 的 Store options 类型 (.d.ts) 没声明 getDataID, 但运行时确实读
// options.getDataID, 故用交叉类型把这一项补上后传入 (同 Web 做法)。
type StoreOptions = ConstructorParameters<typeof Store>[1];
const storeOptions = {
  getDataID,
} as StoreOptions & { getDataID: typeof getDataID };

export const relayEnvironment = new Environment({
  network: Network.create(fetchFn),
  getDataID,
  store: new Store(new RecordSource(), storeOptions),
});

/* ---------- 已执行查询登记表 (语言切换重取用, 与 Web relay.ts 同机制) ----------
 * 环境是模块单例、store 不清: 语言切换时若只靠组件重渲染, 查询会以
 * store-or-network 命中旧语言记录而不发请求。故在 execute 层登记每个
 * 执行过的 query, 语言变化时逐个以 fetchQuery 强制重取 (fetchPolicy
 * 只在此命令式路径使用, 非组件渲染路径): 新语言数据写回同一批 store
 * 记录, 挂载组件随订阅自动重渲染 — 不重建环境、不整页刷新。 */
const executedQueries = new Map<string, { node: unknown; variables: Record<string, unknown> }>();

function registerDescriptor(descriptor: unknown) {
  const d = descriptor as {
    request?: { node?: { params?: { operationKind?: string; name?: string }; }; variables?: Record<string, unknown>; identifier?: string };
  } | null;
  const request = d?.request;
  const node = request?.node;
  const params = node?.params;
  if (!request || !node || !params || params.operationKind !== 'query') return;
  const variables = request.variables ?? {};
  const key = `${request.identifier ?? params.name ?? ''}|${JSON.stringify(variables)}`;
  if (!executedQueries.has(key)) executedQueries.set(key, { node, variables });
}

const originalExecute = relayEnvironment.execute.bind(relayEnvironment);
(relayEnvironment as any).execute = (args: any) => {
  registerDescriptor(args?.operation);
  return originalExecute(args);
};
const originalExecuteWithSource = relayEnvironment.executeWithSource.bind(relayEnvironment);
(relayEnvironment as any).executeWithSource = (args: any) => {
  registerDescriptor(args?.operation);
  return originalExecuteWithSource(args);
};

export async function refetchQueriesAfterLocaleChange(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const { node, variables } of executedQueries.values()) {
    try {
      jobs.push(
        fetchQuery(relayEnvironment, node as any, variables, { fetchPolicy: 'network-only' })
          .toPromise()
          .catch(() => undefined),
      );
    } catch { /* 单条失败不影响其他查询 */ }
  }
  await Promise.all(jobs);
}

// 语言切换 → 全部已登记查询按新语言重取 (新请求发出时 fetchFn 读到新
// 的 effectiveLocaleTag, 因为 Profile 先写镜像再发事件)。
let refetching = false;
onLocaleChanged(() => {
  if (refetching) return;
  refetching = true;
  void refetchQueriesAfterLocaleChange().finally(() => { refetching = false; });
});
