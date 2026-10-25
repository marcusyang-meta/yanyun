import { Environment, Network, RecordSource, Store, fetchQuery } from 'relay-runtime';
import { effectiveLocaleTag, onLocaleChanged } from './locale';
import { jsOperationLoader } from './JSResource';

/* ---------- 已执行查询登记表 (语言切换重取用) ----------
 * 环境是模块单例, store 全程不清: 语言切换时若只重挂组件, 查询会以
 * store-or-network 命中缓存的旧语言记录, 根本不发请求 (这正是"点了
 * 没反应、刷新才行"的根因)。故在 fetch 层登记每个执行过的 query,
 * 语言变化时逐个以 fetchQuery 强制重取: 新语言数据写回同一批 store
 * 记录, 所有挂载组件随订阅自动重渲染 — 不重建环境、不整页刷新。 */
const executedQueries = new Map<string, { node: any; variables: any; at: number }>();
function registerDescriptor(descriptor: any) {
  // OperationDescriptor = { fragment, request, root }: request.node 是完整
  // ConcreteRequest, 操作类型在 node.params.operationKind。注意网络层的
  // fetch 函数拿到的是 params 本身 (无 AST), 登记必须在 execute 层做。
  const request = descriptor && descriptor.request;
  const node = request && request.node;
  const params = node && node.params;
  if (!request || !params || params.operationKind !== 'query') return;
  const variables = request.variables || {};
  const key = request.identifier + '|' + JSON.stringify(variables);
  if (!executedQueries.has(key)) {
    executedQueries.set(key, { node, variables, at: Date.now() });
  }
}

export async function refetchQueriesAfterLocaleChange(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const { node, variables } of executedQueries.values()) {
    try {
      // fetchPolicy 只在此命令式重取中使用 (事件回调触发, 非渲染路径的
      // 组件 fetchPolicy), 不会引发 Suspense 循环。
      jobs.push(
        fetchQuery(relayEnvironment, node, variables, { fetchPolicy: 'network-only' })
          .toPromise()
          .catch(() => undefined),
      );
    } catch { /* 单条失败不影响其他查询 */ }
  }
  await Promise.all(jobs);
}

/* 装备库双落点 (Profile 对话框 / 配装台) 共用同一条 GearLibraryQuery:
 * 任一表面打开 (GearLibrary 挂载) 或 Profile 对话框关闭时命令式重取它
 * (与语言切换重取同一机制, fetchPolicy 只在 relay.ts 的命令式重取里
 * 出现), 另一表面在 DB 里的改动随 store 更新即时可见。首次挂载时它与
 * 组件自身的首查重复一次, 换取双向可见的确定性。 */
/* 同一查询的重取必须串行: fetchQuery 会去重到仍在途的同名请求上, 若
 * 挂载时的那次请求在导入/保存等变更之后才返回, 它携带的旧快照会把
 * store 覆盖回变更前。故每次重取先等上一条落定, 再发全新请求, 保证
 * 返回数据晚于调用时刻。 */
const gearRefetchChains = new Map<string, Promise<unknown>>();
export async function refetchGearLibraryQueries(): Promise<void> {
  const jobs: Promise<unknown>[] = [];
  for (const [key, entry] of executedQueries.entries()) {
    if (!entry.node?.params || entry.node.params.name !== 'GearLibraryQuery') continue;
    entry.at = Date.now();
    const prev = gearRefetchChains.get(key);
    const job = (async () => {
      if (prev) { try { await prev; } catch { /* 前一条失败不阻塞 */ } }
      try {
        await fetchQuery(relayEnvironment, entry.node, entry.variables, { fetchPolicy: 'network-only' })
          .toPromise();
      } catch { /* 忽略单条失败 */ }
    })();
    gearRefetchChains.set(key, job);
    jobs.push(job);
  }
  await Promise.all(jobs);
}

async function fetchGraphQL(operation: any, variables: any) {
  // Production preview: call backend directly (avoids worker-to-worker fetch limits)
  const graphqlUrl = typeof window !== 'undefined' && window.location.hostname.includes('workers.dev')
    ? 'https://yanyun.tbdlab.workers.dev/graphql'
    : '/graphql';
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // 多语言协商: 生效语言标记随请求带给后端 (账号偏好镜像优先, 否则
      // 浏览器语言), 后端映射为受支持 locale
      // (zh-TW/en/es/fr, 其余 zh-CN) 后按 locale 生成全部 UI 文案。
      'x-locale': effectiveLocaleTag(),
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json;
}

/**
 * 记录身份按类型命名空间: `${__typename}:${id}`。
 *
 * 为什么: 后端 id 是 D1 各表的自增整数, 不是全局唯一 —— Boss 30 与 Grouping 30
 * 同时存在。Relay 默认拿裸 id 当 store 的记录键, 不同类型的同号记录会被合并成
 * 一条 (dev 构建控制台的 RelayResponseNormalizer "conflicting types" 警告就是它),
 * 同一会话里先看 boss 30 再看车 30 (或反之) 有字段串扰风险。这里只改 store 内部
 * 的记录键: 记录的 id 字段本身、URL (/:slug/car/30) 与 mutation 入参仍是裸 id,
 * 线格式与后端都不动。
 *
 * typeName 从哪来: normalizer 调 getDataID(data, typeName) 时, typeName 取
 * field.concreteType ?? 响应里的 __typename —— 查询里没显式选 __typename 的
 * 具体类型字段也覆盖得到; data.__typename 只作兜底。实际被命名空间的类型:
 * Dungeon / Boss / Grouping (整数 id) 与 DiscordServer (雪花字符串 id)。
 * 没有 id 字段的记录 (各 Page 包装类型、Seat、Sect 等) 返回 null, 照旧由
 * Relay 生成 client id, 行为不变。
 *
 * Viewer 例外: 与 defaultGetDataID 的 Viewer 单例语义保持一致 (应用根
 * viewer 无 id 字段, 默认实现给它固定记录键 client:root:viewer), 避免每个
 * 查询各建一份 viewer 记录。
 *
 * 双份接线 (与下面 operationLoader 同一个坑): Environment 只在自己新建
 * store 时才把 config.getDataID 注入 store; 本应用自带 store, 所以同一份
 * 函数必须同时传给 Environment config (normalizer / 执行器 / 发布队列用) 和
 * Store options (store.check 的 DataChecker 用)。只传一处, 两边算出的记录
 * 键不一致, 热导航时 check 会把已发布数据判成缺失。
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

// v21 的 Store options 类型 (.d.ts) 没声明 getDataID, 但 RelayModernStore
// 运行时确实读 options.getDataID (与 operationLoader 同一个 options 对象),
// 故用交叉类型把这一项补上后传入。
type StoreOptions = ConstructorParameters<typeof Store>[1];
const storeOptions = {
  operationLoader: jsOperationLoader,
  getDataID,
} as StoreOptions & { getDataID: typeof getDataID };

export const relayEnvironment = new Environment({
  network: Network.create(fetchGraphQL),
  getDataID,
  // 关键: operationLoader 必须同时传给 Store。RelayModernEnvironment 只在
  // 未提供 store 时才用 config.operationLoader 建默认 store; 自带 store 时
  // store._operationLoader 为 null, 而 store.check() (入场点重载/热导航时触发)
  // 遍历到 @module 选择集会走 DataChecker._checkModuleImport 并 invariant 抛错
  // ("DataChecker: Expected an operationLoader to be configured when using
  // `@module`.", 生产构建里被压缩成 "Minified exception occurred...")。
  // getDataID 同理必须双份 (见上方 getDataID 注释), 故 store 走 storeOptions。
  store: new Store(new RecordSource(), storeOptions),
  // @match followup payloads arrive with an operationReference produced by the
  // compiler-emitted operationModuleProvider (a () => JSResourceReference).
  // Resolve it to its SplitOperation via src/lib/JSResource.ts.
  operationLoader: jsOperationLoader,
});

// 查询登记: 环境的 execute 是所有查询 (hooks / entrypoint / fetchQuery)
// 的统一入口, 在此包一层把执行过的 query 描述符登记下来, 供语言切换
// 重取。登记失败绝不影响执行本身。
const originalExecute = relayEnvironment.execute.bind(relayEnvironment);
(relayEnvironment as any).execute = (args: any) => {
  try { registerDescriptor(args && args.operation); } catch { /* 忽略 */ }
  return originalExecute(args);
};
// entrypoint / loadQuery 一系走 executeWithSource, 同样登记
const originalExecuteWithSource = relayEnvironment.executeWithSource.bind(relayEnvironment);
(relayEnvironment as any).executeWithSource = (args: any) => {
  try { registerDescriptor(args && args.operation); } catch { /* 忽略 */ }
  return originalExecuteWithSource(args);
};

// 语言变化 (设置保存 / 对账发现服务端偏好不同) -> 重取全部已执行查询,
// 在同一环境内原地切换界面语言。
onLocaleChanged(() => { void refetchQueriesAfterLocaleChange(); });
