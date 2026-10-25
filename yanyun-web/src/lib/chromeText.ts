import { effectiveLocaleTag, onLocaleChanged } from './locale';

// 错误边界专用文案: ErrBound 挂在 Relay Provider 之外, 用不了 Relay
// 查询, 故走一次裸 GraphQL fetch 取 viewer 的通用文案字段 (后端按
// x-locale 协商 locale 生成)。模块级缓存: 整个会话只取一次; 取到前
// 边界只渲染无文案的占位 (不写死任何语言的兜底文案)。
export interface ChromeText {
  renderErrorTemplate: string;
  renderErrorHint: string;
  backToHubLabel: string;
}

let cached: Promise<ChromeText | null> | null = null;

// 语言切换后缓存失效, 下次边界渲染按新语言重取
onLocaleChanged(() => { cached = null; });

export function loadChromeText(): Promise<ChromeText | null> {
  if (!cached) {
    cached = (async () => {
      try {
        const graphqlUrl = typeof window !== 'undefined' && window.location.hostname.includes('workers.dev')
          ? 'https://yanyun.tbdlab.workers.dev/graphql'
          : '/graphql';
        const res = await fetch(graphqlUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-locale': effectiveLocaleTag(),
          },
          body: JSON.stringify({
            query: 'query ChromeTextQuery { viewer { commonRenderErrorTemplate commonRenderErrorHint commonBackToHubLabel } }',
          }),
        });
        const json = await res.json();
        const v = json?.data?.viewer;
        if (!v) return null;
        return {
          renderErrorTemplate: v.commonRenderErrorTemplate,
          renderErrorHint: v.commonRenderErrorHint,
          backToHubLabel: v.commonBackToHubLabel,
        };
      } catch {
        return null;
      }
    })();
  }
  return cached;
}
