import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import { theme } from './lib/format.ts';
import { pct1, fmt1 } from './guild/components/gearStore.ts';
import type { BuildSharePageQuery as BuildSharePageQueryType } from './__generated__/BuildSharePageQuery.graphql';

/* Public build share page (/b/:code): the anonymous visiting surface
 * for one shared gear build. Everything on it comes from the
 * sharedBuild page shell (the code is the capability — the shell
 * composes only this build's display fields, so there is nothing
 * else to reach from here) plus the grad page's affix catalog for
 * the item cards' Chengyin coloring, in the same caliber as the
 * library's own cards. Unknown / revoked codes render the shell's
 * not-found state. The only way onward is the front door (/). */

const BuildSharePageQueryNode = graphql`
  query BuildSharePageQuery($code: String!) {
    sharedBuild(code: $code) {
      exists
      name
      buildLabel
      school
      xinfa
      bowKind
      snapTotal
      snapA
      snapB
      snapD
      snapLoan
      snapYAcc
      snapYCrit
      snapYInt
      items {
        slot
        name
        lines { key val }
        dingyin { name val }
        warnings
      }
      buildShareKicker
      buildShareLoginLabel
      buildShareNotFoundTitle
      buildShareNotFoundBody
      buildShareXinfaLabel
    }
    gradPage {
      gearGradLabel
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearAffixes { key label max cy }
    }
  }
`;

const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.22)', borderRadius: 10, padding: '10px 12px', background: 'rgba(0,0,0,.25)',
};
const btnGhost: React.CSSProperties = {
  padding: '6px 13px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
  border: `1px solid ${theme.gold}`, color: theme.goldHi, fontSize: 12.5, textDecoration: 'none',
  display: 'inline-block',
};

type SharedItem = {
  slot: string;
  name: string;
  lines: ReadonlyArray<{ key: string; val: number }>;
  dingyin: { name: string; val: number } | null | undefined;
  warnings: ReadonlyArray<string>;
};

/* Read-only twin of the library's item card (PR #39 slim caliber):
 * slot whisper, item name as the visual subject, the affix closest to
 * its Chengyin value leading, attainment carried by color. */
function SharedItemCard({ item, affixByKey }: {
  item: SharedItem;
  affixByKey: Map<string, { label: string; cy: number }>;
}) {
  let mainIdx = -1;
  let mainRatio = -1;
  item.lines.forEach((l, ix) => {
    const a = affixByKey.get(l.key);
    if (a && a.cy > 0) {
      const r = l.val / a.cy;
      if (r > mainRatio) { mainRatio = r; mainIdx = ix; }
    }
  });
  const topTier = mainRatio >= 1;
  const lineRow = (l: { key: string; val: number }, ix: number) => {
    const a = affixByKey.get(l.key);
    const isMain = ix === mainIdx;
    const atCy = a ? l.val >= a.cy : false;
    return (
      <div key={ix} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
        <span style={isMain ? { color: theme.goldHi, fontWeight: 700 } : undefined}>{a ? a.label : l.key}</span>
        <b style={{ color: atCy || isMain ? theme.goldHi : theme.paper, fontWeight: isMain ? 800 : 600 }}>{fmt1(l.val)}</b>
      </div>
    );
  };
  return (
    <div style={{ ...card, padding: '8px 11px' }} className={'yy-gear-card' + (topTier ? ' q-top' : '')}>
      <div style={{ color: theme.muted, fontSize: 11, letterSpacing: 2 }}>{item.slot}</div>
      <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 15.5, fontWeight: 700, marginTop: 2, letterSpacing: 1 }}>
        {item.name || item.slot}
      </div>
      <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, color: theme.paper }}>
        {mainIdx >= 0 && lineRow(item.lines[mainIdx], mainIdx)}
        {item.lines.map((l, ix) => (ix === mainIdx ? null : lineRow(l, ix)))}
        {item.dingyin && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, color: theme.goldHi }}>
            <span>{item.dingyin.name}</span><b>{fmt1(item.dingyin.val)}</b>
          </div>
        )}
      </div>
      {item.warnings.length > 0 && <div style={{ color: theme.seal, fontSize: 11, marginTop: 3 }}>{item.warnings.join('；')}</div>}
    </div>
  );
}

export default function BuildSharePage({ queries }: {
  queries: { buildShareQuery: PreloadedQuery<BuildSharePageQueryType> };
}) {
  const data = usePreloadedQuery<BuildSharePageQueryType>(BuildSharePageQueryNode, queries.buildShareQuery);
  const page = data.sharedBuild as any;
  const grad = data.gradPage as any;
  const affixByKey = new Map<string, { label: string; cy: number }>(
    (grad.gearAffixes || []).map((a: any) => [a.key, { label: a.label, cy: a.cy }]),
  );

  return (
    <div className="yy-page">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 3 }}>{page.buildShareKicker}</span>
          <Link to="/" style={{ ...btnGhost, marginLeft: 'auto' }}>{page.buildShareLoginLabel}</Link>
        </div>
        {page.exists ? (
          <>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 30, fontWeight: 700, letterSpacing: 2, marginTop: 14 }}>
              {page.name}
            </div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 4 }}>{page.buildLabel}</div>
            <div style={{ ...card, marginTop: 16, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 34, fontWeight: 700 }}>{pct1(page.snapTotal)}</span>
                <span style={{ color: theme.muted, fontSize: 12 }}>{grad.gearGradLabel}</span>
              </div>
              <div style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.8 }}>
                {grad.gearGradLabel} {pct1(page.snapA)} / {pct1(page.snapB)} / {pct1(page.snapD)}
                <br />
                {grad.gearYAccLabel} {pct1(page.snapYAcc)} · {grad.gearYCritLabel} {pct1(page.snapYCrit)} · {grad.gearYIntLabel} {pct1(page.snapYInt)}
              </div>
              {page.xinfa.length > 0 && (
                <div style={{ color: theme.paper, fontSize: 12.5 }}>
                  <span style={{ color: theme.muted, marginRight: 8 }}>{page.buildShareXinfaLabel}</span>
                  {page.xinfa.join(' · ')}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 9, marginTop: 14 }}>
              {page.items.map((item: SharedItem, i: number) => (
                <SharedItemCard key={i} item={item} affixByKey={affixByKey} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ ...card, marginTop: 22, textAlign: 'center', padding: '34px 16px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
              {page.buildShareNotFoundTitle}
            </div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 10 }}>{page.buildShareNotFoundBody}</div>
          </div>
        )}
      </div>
    </div>
  );
}
