import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import type { LegalPageQuery as LegalPageQueryType } from './__generated__/LegalPageQuery.graphql';
import { theme } from './lib/format';

// 法律页 (服务条款 / 隐私政策): 公开页面, 未登录可达。
// 标题/正文全部由后端 legalPage shell 按 locale 生成 (gen 方法取文案
// 目录), 本组件只排版, 不持有任何正文或 UI 文案。
const LegalPageQueryNode = graphql`
  query LegalPageQuery($kind: LegalKind!) {
    legalPage(kind: $kind) {
      kind
      title
      updatedText
      backLabel
      sections {
        heading
        body
      }
    }
  }
`;

export default function LegalPage({ queries }: {
  queries: { legalQuery: PreloadedQuery<LegalPageQueryType> };
}) {
  const data = usePreloadedQuery<LegalPageQueryType>(LegalPageQueryNode, queries.legalQuery);
  const page = data.legalPage;
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 8px' }}>
        <Link to="/" style={{ color: theme.gold, fontSize: 14, textDecoration: 'none' }}>
          {'‹ '}{page.backLabel}
        </Link>
        <h1 style={{ color: theme.goldHi, fontSize: 28, letterSpacing: '.06em', margin: '18px 0 6px' }}>
          {page.title}
        </h1>
        <p style={{ color: theme.muted, fontSize: 13, margin: '0 0 10px' }}>{page.updatedText}</p>
        {page.sections.map((sec, i) => (
          <section key={i} style={{ marginTop: 26 }}>
            <h2 style={{ color: theme.goldHi, fontSize: 17, letterSpacing: '.04em', margin: '0 0 8px' }}>
              {sec.heading}
            </h2>
            <p style={{ color: '#d8cdb2', fontSize: 14.5, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>
              {sec.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
