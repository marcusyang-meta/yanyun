import { useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { theme, fill } from '../../lib/format.ts';
import { fmt1, requestGearTarget } from './gearStore.ts';
import { toast } from './Toast.react.tsx';
import type { GearRefsQuery as GearRefsQueryType } from './__generated__/GearRefsQuery.graphql.ts';
import type { GearSectRecipesQuery as GearSectRecipesQueryType } from './__generated__/GearSectRecipesQuery.graphql.ts';

const refsQuery = graphql`
  query GearRefsQuery {
    gradPage {
      gearRecipesTitle
      gearRecipeSearchPlaceholder
      gearRecipeAllLabel
      gearRecipeColCat
      gearRecipeColSchool
      gearRecipeColSet
      gearRecipeColRecipe
      gearRecipeColBow
      gearRecipeSetTargetLabel
      gearRecipeEmptyText
      gearRecipeTargetToastTemplate
      gearAffixTableTitle
      gearColCyLabel
      gearColCyPctLabel
      gearColRecipeNamesLabel
      gearSurvivalNote
      gearSlotTableTitle
      gearSlotsBigTitle
      gearSlotsSmallTitle
      gearFormulaTitle
      gearFormulaRatesTitle
      gearFormulaDimsTitle
      gearFormulaOrderTitle
      gearFormulaAccTemplate
      gearFormulaCritTemplate
      gearFormulaIntTemplate
      gearFormulaBarsTemplate
      gearFormulaBowTemplate
      gearFormulaOrderText
      gearColDimLabel
      gearColConvLabel
      gearFormSlotLabel
      gradColAffixLabel
      gradColMaxLabel
      gearBuilds {
        idx
        school
        set
        cat
        sectName
        bowLabel
        recipe
        targets { label n }
      }
      gearAffixes { key label max cy cyPct recipeNames }
      gearSlotsBig { slot lines }
      gearSlotsSmall { slot lines }
      gearDimRows { name conv full }
      gearResDefault
    }
  }
`;

const th: React.CSSProperties = { textAlign: 'left', color: theme.muted, fontWeight: 400, fontSize: 11.5, padding: '5px 7px', borderBottom: '1px solid rgba(201,163,92,.25)' };
const td: React.CSSProperties = { padding: '6px 7px', borderBottom: '1px solid rgba(201,163,92,.1)', fontSize: 12.5, color: theme.paper, verticalAlign: 'top' };
const h3: React.CSSProperties = { color: theme.goldHi, fontSize: 14.5, margin: '18px 0 8px' };
const miniBtn: React.CSSProperties = {
  fontSize: 12, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.goldHi,
};
function chip(active: boolean): React.CSSProperties {
  return {
    fontSize: 12, padding: '4px 11px', borderRadius: 999, cursor: 'pointer',
    background: active ? theme.gold : 'transparent',
    border: `1px solid ${theme.gold}`, color: active ? '#1a1814' : theme.goldHi,
    fontWeight: active ? 600 : 400,
  };
}

// 参考数据: 全流派配方表 / 词条满值承音对照表 / 部位版位表 / 公式与五维速查。
// 嵌在毕业计算的「参考数据」区 (配装台口径, 与本站毕业词条口径并存)。
export default function GearRefs() {
  const data = useLazyLoadQuery<GearRefsQueryType>(refsQuery, {});
  const t = data.gradPage;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const cats = useMemo(() => [...new Set(t.gearBuilds.map((b) => b.cat))], [t.gearBuilds]);
  const rows = useMemo(() => {
    const kw = q.trim();
    return t.gearBuilds.filter((b) => {
      if (cat && b.cat !== cat) return false;
      if (!kw) return true;
      return b.school.includes(kw) || b.set.includes(kw) || b.targets.some((x) => x.label.includes(kw));
    });
  }, [t.gearBuilds, q, cat]);

  const slotTable = (title: string, list: ReadonlyArray<{ slot: string; lines: ReadonlyArray<string> }>) => (
    <div style={{ overflowX: 'auto', marginTop: 6 }}>
      <div style={{ color: theme.paper, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
        <thead><tr><th style={th}>{t.gearFormSlotLabel}</th><th style={th}>{t.gradColAffixLabel}</th></tr></thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.slot}>
              <td style={{ ...td, color: theme.goldHi, whiteSpace: 'nowrap' }}>{r.slot}</td>
              <td style={td}>{r.lines.join('、')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h3 style={{ ...h3, marginTop: 4 }}>{t.gearRecipesTitle}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.gearRecipeSearchPlaceholder}
          style={{ flex: '1 1 160px', background: 'rgba(0,0,0,.35)', color: theme.paper, border: '1px solid rgba(201,163,92,.35)', borderRadius: 6, padding: '6px 9px', fontSize: 12.5 }}
        />
        <button onClick={() => setCat('')} style={chip(cat === '')}>{t.gearRecipeAllLabel}</button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={chip(cat === c)}>{c}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
          <thead><tr>
            <th style={th}>{t.gearRecipeColCat}</th><th style={th}>{t.gearRecipeColSchool}</th>
            <th style={th}>{t.gearRecipeColSet}</th><th style={th}>{t.gearRecipeColRecipe}</th>
            <th style={th}>{t.gearRecipeColBow}</th><th style={th}></th>
          </tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.idx}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{b.cat}</td>
                <td style={{ ...td, color: theme.goldHi, whiteSpace: 'nowrap' }}>{b.school}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{b.set}</td>
                <td style={td}>{b.recipe}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{b.bowLabel || '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <button onClick={() => { requestGearTarget(b.idx); toast(fill(t.gearRecipeTargetToastTemplate, { school: b.school, set: b.set })); }} style={miniBtn}>{t.gearRecipeSetTargetLabel}</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td style={td} colSpan={6}>{t.gearRecipeEmptyText}</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>{t.gearAffixTableTitle}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
          <thead><tr>
            <th style={th}>{t.gradColAffixLabel}</th><th style={th}>{t.gradColMaxLabel}</th>
            <th style={th}>{t.gearColCyLabel}</th><th style={th}>{t.gearColCyPctLabel}</th>
            <th style={th}>{t.gearColRecipeNamesLabel}</th>
          </tr></thead>
          <tbody>
            {t.gearAffixes.map((a) => (
              <tr key={a.key}>
                <td style={{ ...td, color: theme.goldHi, whiteSpace: 'nowrap' }}>
                  {a.label}
                  {a.recipeNames.length === 0 && <span style={{ color: theme.muted, fontSize: 11 }}> · {t.gearSurvivalNote}</span>}
                </td>
                <td style={td}>{fmt1(a.max)}</td>
                <td style={td}>{fmt1(a.cy)}</td>
                <td style={td}>{Math.round(a.cyPct * 1000) / 10}%</td>
                <td style={td}>{a.recipeNames.length ? a.recipeNames.join(' / ') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>{t.gearSlotTableTitle}</h3>
      {slotTable(t.gearSlotsBigTitle, t.gearSlotsBig)}
      {slotTable(t.gearSlotsSmallTitle, t.gearSlotsSmall)}

      <h3 style={h3}>{t.gearFormulaTitle}</h3>
      <div style={{ fontSize: 12.5, color: theme.paper, lineHeight: 1.9 }}>
        <div style={{ color: theme.goldHi }}>{t.gearFormulaRatesTitle}</div>
        <div>· {fill(t.gearFormulaAccTemplate, { white: 130 })}</div>
        <div>· {fill(t.gearFormulaCritTemplate, { white: 148 })}</div>
        <div>· {fill(t.gearFormulaIntTemplate, { white: 74 })}</div>
        <div>· {fill(t.gearFormulaBarsTemplate, { acc: 8.8, crit: 9.8, int: 4.9, minCrit: 4.1, shiInt: 2.1 })}</div>
        <div>· {fill(t.gearFormulaBowTemplate, { acc: 4.7, crit: 5.2, int: 2.6, res: t.gearResDefault })}</div>
        <div style={{ color: theme.goldHi, marginTop: 6 }}>{t.gearFormulaDimsTitle}</div>
      </div>
      <div style={{ overflowX: 'auto', marginTop: 4 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 }}>
          <thead><tr><th style={th}>{t.gearColDimLabel}</th><th style={th}>{t.gearColConvLabel}</th><th style={th}></th></tr></thead>
          <tbody>
            {t.gearDimRows.map((d) => (
              <tr key={d.name}>
                <td style={{ ...td, color: theme.goldHi, whiteSpace: 'nowrap' }}>{d.name}</td>
                <td style={td}>{d.conv}</td>
                <td style={{ ...td, color: theme.muted }}>{d.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12.5, color: theme.paper, lineHeight: 1.9, marginTop: 8 }}>
        <span style={{ color: theme.goldHi }}>{t.gearFormulaOrderTitle}：</span>{t.gearFormulaOrderText}
      </div>
    </div>
  );
}

const sectRecipesQuery = graphql`
  query GearSectRecipesQuery {
    gradPage {
      gearSectRecipesTitle
      gearRecipeSetTargetLabel
      gearRecipeTargetToastTemplate
      gearBuilds {
        idx
        school
        set
        sectName
        bowLabel
        recipe
        targets { label n }
      }
    }
  }
`;

// 流派页 BiS 区下方的 100 阶配方 (按本站流派名过滤): 「设为目标」切到配装台口径并跳到毕业页签。
export function GearSectRecipes({ sectName, onPicked }: { sectName: string; onPicked: () => void }) {
  const data = useLazyLoadQuery<GearSectRecipesQueryType>(sectRecipesQuery, {});
  const t = data.gradPage;
  const rows = t.gearBuilds.filter((b) => b.sectName === sectName);
  if (!rows.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: theme.goldHi, fontSize: 14, marginBottom: 8 }}>{t.gearSectRecipesTitle}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((b) => (
          <div key={b.idx} style={{
            display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
            border: '1px solid rgba(201,163,92,.22)', borderRadius: 10, padding: '9px 12px',
            background: 'rgba(0,0,0,.25)',
          }}>
            <span style={{ color: theme.goldHi, fontSize: 13.5, whiteSpace: 'nowrap' }}>{b.school} · {b.set}</span>
            <span style={{ color: theme.paper, fontSize: 12.5, flex: '1 1 220px' }}>
              {b.recipe}
              {b.bowLabel ? ` · ${b.bowLabel}` : ''}
            </span>
            <button onClick={() => {
              requestGearTarget(b.idx);
              toast(fill(t.gearRecipeTargetToastTemplate, { school: b.school, set: b.set }));
              onPicked();
            }} style={miniBtn}>{t.gearRecipeSetTargetLabel}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
