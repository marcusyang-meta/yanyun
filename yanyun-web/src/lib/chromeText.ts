import { effectiveLocaleTag, onLocaleChanged } from './locale';

// Copy for the error boundary only: ErrBound sits outside the Relay provider
// and cannot run Relay queries, so it makes one raw GraphQL fetch for the
// viewer's generic text fields (backend-generated in the locale negotiated
// via x-locale). Module-level cache: fetched once per session; until it lands
// the boundary renders a text-free placeholder (no hardcoded fallback copy in
// any language).
export interface ChromeText {
  renderErrorTemplate: string;
  renderErrorHint: string;
  backToHubLabel: string;
}

let cached: Promise<ChromeText | null> | null = null;

// Invalidate on locale change so the next boundary render refetches in the new language
onLocaleChanged(() => { cached = null; });

export function loadChromeText(): Promise<ChromeText | null> {
  if (!cached) {
    cached = (async () => {
      try {
        const graphqlUrl = typeof window !== 'undefined' && window.location.hostname.includes('workers.dev')
          ? 'https://yanyun.app/graphql'
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
