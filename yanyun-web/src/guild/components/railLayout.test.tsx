// @vitest-environment jsdom
// Regression suite for the two production defects on the guild
// shell's left rail (marcus's production screenshots, 2026-11-16):
//
//  1. The hub return rendered "← ← 百业集结" — two back arrows.
//     The backend composes the back label WITH its leading arrow
//     in every variant and locale ("← 百业集结" / "← 返回" /
//     "← Guild Rally" / "← Back"), and GuildRail added a second
//     arrow glyph of its own in front of it. The DOM assertions
//     below render the real rail and count the arrows in the back
//     entry: exactly one, for both label variants.
//
//  2. The rail stopped short of the screen bottom and the site
//     footer ran underneath its column. The rail was sticky with
//     height: 100dvh inside a scroll region shorter than the
//     viewport by the footer's band, so it overshot the region by
//     exactly the footer's height: the excess became a phantom
//     scroll, the rail's user cluster sat below the fold, and
//     sticky had no travel anyway (the shell was exactly as tall
//     as the rail, its height being rail-driven). The rail is now
//     fixed to the viewport (top/bottom), and the content column
//     and the footer offset themselves by the rail's width. The
//     CSS contracts below pin that shape at all three widths.
//
// The IG-web convergence suites further down pin the rail's new
// shape (marcus ruling, 2026-11-17): the entry list ends with the
// profile entry (avatar photo as its icon, opens the settings
// dialog), the bottom user cluster is gone, and the bottom more
// menu's appearance item saves through the shared theme-save hook
// (mutation + session anchor + mirror), never a rail-local flip.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';
import GuildRail from './GuildRail.react.tsx';
import { relayEnvironment } from '../../lib/relay';
import { clearSessionConfirmedTheme, getSessionConfirmedTheme } from '../../lib/theme';
import SettingsDialogQueryNode from '../../auth/__generated__/SettingsDialogQuery.graphql';
import GearLibraryQueryNode, { type GearLibraryQuery$data } from './__generated__/GearLibraryQuery.graphql';
import type { GearLibraryUpdateItemMutation$variables } from './__generated__/GearLibraryUpdateItemMutation.graphql';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
window.HTMLElement.prototype.scrollIntoView ??= () => {};

// Stylesheet / source reads resolve from the package root: vitest
// runs there (pnpm test, CI web-check), and under the jsdom
// environment import.meta.url is not a file: URL, so the
// fileURLToPath(new URL(...)) shape the node-env suites use does
// not work in this file.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const siteFooterSrc = readFileSync(resolve(process.cwd(), 'src/lib/SiteFooter.react.tsx'), 'utf8');

// Span [start, end) of the brace-matched block whose opening brace
// is the first '{' at or after `from` (same helper shape as
// chromePolish.test.ts).
function blockSpan(text: string, from: number): [number, number] {
  const open = text.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return [from, i + 1];
    }
  }
  return [from, text.length];
}

// The full text of the one media block for `query` that mentions
// `needle`.
function mediaBlockContaining(text: string, query: string, needle: string): string {
  let from = 0;
  for (;;) {
    const at = text.indexOf(query, from);
    if (at === -1) return '';
    const [s, e] = blockSpan(text, at);
    const block = text.slice(s, e);
    if (block.includes(needle)) return block;
    from = e;
  }
}

// The first `selector { ... }` declaration block in the text (exact
// selector match).
function ruleBlock(text: string, selector: string): string {
  const start = text.indexOf(`${selector} {`);
  if (start === -1) return '';
  const open = text.indexOf('{', start);
  const close = text.indexOf('}', open);
  return text.slice(open + 1, close);
}

const AVATAR_URL = 'https://cdn.example/avatar.png';

function renderRail(backLabel: string): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <MemoryRouter>
          <GuildRail
            slug="livetest"
            entries={[{ key: 'team', label: '组队', icon: 'team', active: true }]}
            backLabel={backLabel}
            adminLabel={null}
            user={{ discordId: '2001', name: 'CI Tester', avatar: AVATAR_URL }}
            userBarText={{ logoutLabel: '退出登录', loggingOutLabel: '退出中', settingsLabel: '个人资料' }}
            profileLabel="我的"
            moreLabel="更多"
            appearanceLabel="切换外观"
            themeClassicLabel="经典"
            themeGlassLabel="玻璃"
            onSelect={() => {}}
          />
        </MemoryRouter>
      </RelayEnvironmentProvider>,
    );
  });
  return container;
}

async function flush(ms = 80) {
  await act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

function click(el: Element) {
  act(() => { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); });
}

function selectValue(select: HTMLSelectElement, value: string) {
  act(() => {
    select.value = value;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
  });
}

/* Synthesize settings and gear-library queries from their Relay artifacts.
 * The theme mutation echoes the selected theme and sign-out is recorded. */
const fetchCalls: { url: string; method?: string; name: string; theme?: string }[] = [];
const gearUpdates: GearLibraryUpdateItemMutation$variables[] = [];
const weaponDingyin = [
  { name: '外功穿透', label: 'Physical Penetration', max: 12.8 },
  { name: '外功抗性', label: '外功抗性', max: 12.8 },
  { name: '无相穿透', label: '无相穿透', max: 15.2 },
];
const armorDingyin = [
  { name: '无名剑法·蓄力技增伤', label: '无名剑法·蓄力技增伤', max: 7 },
  { name: '明川药典·治疗技增疗', label: '明川药典·治疗技增疗', max: 7 },
];
const armorSlots = ['冠胄', '胸甲', '胫甲', '腕甲'];
const gearItems = [
  { id: '30000000001', slot: '武器', name: '测试长剑', dingyin: { name: '外功抗性', val: 9.2 }, lines: [], schools: [], warnings: [] },
  { id: '30000000002', slot: '冠胄', name: '旧版冠胄', dingyin: { name: '九重春色·蓄力技增伤', val: 4.3 }, lines: [], schools: [], warnings: [] },
] satisfies GearLibraryQuery$data['myGearItems'];
const savedBuilds = [{
  id: '31000000001', name: '保存的方案', buildLabel: '鸣金-虹 · 玉斗', school: '鸣金-虹', targetIdx: 0,
  baseValues: [], bowKind: '', extraAcc: 0, extraCrit: 0, extraInt: 0, gradDingyinOn: true,
  loadout: [{ slot: '主武器', gearId: gearItems[0].id }], res: 1.85, shareUrl: null, xinfa: [],
  snapTotal: 0.82, snapA: 1, snapB: 0.996, snapD: 0.25, snapLoan: 1,
  snapYAcc: 83.5, snapYCrit: 20.7, snapYInt: 37.7, snapDawai: 1120, snapXiaowai: 620,
}] satisfies GearLibraryQuery$data['myGearBuilds'];
const gearPage: Partial<GearLibraryQuery$data['gradPage']> = {
  gearMyLibTitle: '我的装备库',
  gearEntryLabel: '录入装备',
  gearAddGearLabel: '存入装备库',
  gearPasteTitle: '粘贴代码导入',
  gearOcrTitle: '截图导入（本地识别，不上传）',
  gearManualTitle: '手动录入',
  gearGearSlots: ['武器', ...armorSlots, '环', '佩'],
  gearDingyinGroups: [
    { slots: ['武器', '主武器', '副武器', '环', '佩'], options: weaponDingyin },
    { slots: armorSlots, options: armorDingyin },
  ],
  gearEditLabel: '编辑',
  gearUpdateGearLabel: '保存修改',
  gearFormSlotLabel: '部位',
  gearDyNameLabel: '定音',
  gearDyValLabel: '定音数值',
  gearFillMaxLabel: '填满值',
  gearGradLabel: '毕业度',
  gearYAccLabel: '黄字精准',
  gearYCritLabel: '黄字会心',
  gearYIntLabel: '黄字会意',
  gearSavedToastTemplate: '已保存 {name}',
  gearSchoolTags: [],
  gearUsageCount: 0,
  gearUsageLimit: 200,
  gearUsageTemplate: '{n}/{limit}',
  gearSchemeNameTemplate: '配装 {n}',
  gearSchemeGroupCountTemplate: '{n} 套',
};

function synth(selections: readonly any[], typeName: string | null): any {
  const out: any = {};
  if (typeName) out.__typename = typeName;
  for (const sel of selections || []) {
    if (sel.kind === 'ScalarField') {
      if (sel.name !== '__typename') out[sel.name] = null;
    } else if (sel.kind === 'LinkedField') {
      if (!sel.concreteType) { out[sel.name] = sel.plural ? [] : null; continue; }
      out[sel.name] = sel.plural ? [] : synth(sel.selections, sel.concreteType);
    } else if (sel.kind === 'InlineFragment' || sel.kind === 'Condition') {
      Object.assign(out, synth(sel.selections, typeName));
    }
  }
  return out;
}

function installFetchStub() {
  let items: GearLibraryQuery$data['myGearItems'] = gearItems;
  (globalThis as any).fetch = async (url: string, init: any) => {
    const u = String(url);
    if (u.includes('/auth/logout')) {
      fetchCalls.push({ url: u, method: init?.method, name: 'logout' });
      return { json: async () => ({}) };
    }
    const body = JSON.parse(init.body);
    const name = /(query|mutation)\s+(\w+)/.exec(body.query || '')?.[2] || '';
    let data: any = {};
    if (name === 'useThemeSaveMutation') {
      const theme = body.variables?.theme === 'glass' ? 'glass' : 'classic';
      fetchCalls.push({ url: u, method: init?.method, name, theme });
      data = {
        updateMyTheme: {
          __typename: 'UpdateThemePayload',
          ok: true, error: null, errorCode: null, themePref: theme,
        },
      };
    } else if (name === 'SettingsDialogQuery') {
      data = synth(SettingsDialogQueryNode.operation.selections, 'Query');
      data.gradPage.gearMyLibTitle = gearPage.gearMyLibTitle;
      data.settingsPage.calendarFeed = null;
    } else if (name === 'GearLibraryQuery') {
      data = synth(GearLibraryQueryNode.operation.selections, 'Query');
      data.viewer.user.discordId = '2001';
      data.myGearItems = items;
      data.myGearBuilds = savedBuilds;
      Object.assign(data.gradPage, gearPage);
      Object.assign(data.gradPage.gearVocabRules, { weaponSlot: '武器', weaponPositions: [] });
    } else if (name === 'GearLibraryUpdateItemMutation') {
      const variables: GearLibraryUpdateItemMutation$variables = body.variables;
      gearUpdates.push(variables);
      const previous = items.find((gear) => gear.id === variables.id);
      const { slot, name, lines, dingyin, schools } = variables.input;
      const item = previous ? { ...previous, slot, name: name ?? previous.name, lines, dingyin, schools: schools ?? previous.schools } : null;
      if (item) items = items.map((gear) => gear.id === item.id ? item : gear);
      data.updateGearItem = { ok: !!item, error: null, item };
    } else {
      fetchCalls.push({ url: u, method: init?.method, name });
    }
    return { json: async () => ({ data }) };
  };
}

describe('rail hub return (DOM)', () => {
  it.each(['← 百业集结', '← 返回'])(
    'renders exactly one back arrow for the server-composed label %s',
    (backLabel) => {
      const container = renderRail(backLabel);
      const back = container.querySelector('.yy-rail-back');
      expect(back).not.toBeNull();
      // The whole entry text is the label, verbatim: one arrow,
      // carried by the label itself, none added by the rail.
      expect(back!.textContent).toBe(backLabel);
      expect((back!.textContent!.match(/←/g) || []).length).toBe(1);
      // And structurally the entry is a single label span — no
      // separate icon/glyph element beside it.
      expect(back!.querySelectorAll('span').length).toBe(1);
      expect(back!.querySelector('.yy-rail-label')!.textContent).toBe(backLabel);
    },
  );
});

describe('rail full-height shape (CSS contract)', () => {
  it('the rail is fixed to the viewport top and bottom, not sticky at 100dvh', () => {
    const block = ruleBlock(css, '.yy-rail');
    expect(block).toContain('position: fixed');
    expect(block).toContain('top: 0');
    expect(block).toContain('bottom: 0');
    expect(block).not.toContain('sticky');
    expect(block).not.toContain('100dvh');
    expect(block).not.toContain('100vh');
  });

  it('the content column offsets by the rail width at all three widths', () => {
    expect(ruleBlock(css, '.yy-guild-main')).toContain('margin-left: 208px');
    const at1024 = mediaBlockContaining(css, '@media (max-width: 1024px)', '.yy-guild-main');
    expect(ruleBlock(at1024, '.yy-guild-main')).toContain('margin-left: 62px');
    const at640 = mediaBlockContaining(css, '@media (max-width: 640px)', '.yy-guild-main');
    expect(ruleBlock(at640, '.yy-guild-main')).toContain('margin-left: 56px');
  });
});

describe('rail profile entry (IG web shape, DOM)', () => {
  it('the entry list ends with the profile entry, whose icon is the avatar photo', () => {
    const container = renderRail('← 百业集结');
    const nav = container.querySelector('.yy-rail-nav')!;
    const items = [...nav.children];
    const last = items[items.length - 1];
    expect(last.classList.contains('yy-rail-profile')).toBe(true);
    expect(last.querySelector('.yy-rail-label')!.textContent).toBe('我的');
    // The icon is the viewer's avatar photo — the list's only img.
    const img = last.querySelector('img.yy-rail-avatar') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.src).toBe(AVATAR_URL);
    expect(nav.querySelectorAll('img').length).toBe(1);
    // Section entries keep line icons (svg), no photos.
    const team = items[0];
    expect(team.querySelector('svg')).not.toBeNull();
    expect(team.querySelector('img')).toBeNull();
    // The profile entry is not a section: no selected lens state.
    expect(last.classList.contains('active')).toBe(false);
  });

  it('the rail bottom has no user cluster — no userbar, no username card', () => {
    const container = renderRail('← 百业集结');
    expect(container.querySelector('.yy-rail-user')).toBeNull();
    expect(container.querySelector('.yy-userbar')).toBeNull();
    expect(container.querySelector('.yy-rail')!.textContent).not.toContain('CI Tester');
    // The bottom carries only the more entry.
    const more = container.querySelector('.yy-rail-more')!;
    expect(more).not.toBeNull();
    expect(more.querySelector('.yy-rail-label')!.textContent).toBe('更多');
    expect(more.querySelector('button')!.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('opens gear entry from the profile and applies the correct attunement to each equipment slot', async () => {
    installFetchStub();
    gearUpdates.length = 0;
    const container = renderRail('← 百业集结');
    click(container.querySelector('.yy-rail-profile')!);
    await flush(150);
    const gearNav = document.querySelector<HTMLButtonElement>('[data-gear-entry]');
    expect(gearNav?.textContent).toContain('我的装备库');
    click(gearNav!);
    await flush(150);

    const savedBuild = document.querySelector('[data-build-school="鸣金-虹"]');
    expect(savedBuild?.textContent).toContain('82.0%');
    expect(savedBuild?.textContent).toContain('毕业度 100.0% / 99.6% / 25.0%');
    expect(savedBuild?.textContent).toContain('黄字精准 83.5% · 黄字会心 20.7% · 黄字会意 37.7%');

    const buttonFor = (scope: ParentNode, label: string): HTMLButtonElement => {
      const button = [...scope.querySelectorAll('button')].find((node) => node.textContent === label);
      expect(button, label).toBeDefined();
      return button!;
    };
    const entry = buttonFor(document, '录入装备');
    expect(entry.disabled).toBe(false);
    expect(entry.getAttribute('aria-expanded')).toBe('false');
    click(entry);
    expect(entry.getAttribute('aria-expanded')).toBe('true');

    const panel = document.querySelector('#yy-gear-add-panel')!;
    expect(panel).not.toBeNull();
    expect(panel.querySelector('textarea')).not.toBeNull();
    buttonFor(panel, '粘贴代码导入');
    click(buttonFor(panel, '截图导入（本地识别，不上传）'));
    expect(panel.querySelector('input[type="file"][accept="image/*"]')).not.toBeNull();
    click(buttonFor(panel, '手动录入'));
    expect(buttonFor(panel, '存入装备库').disabled).toBe(false);

    const editGear = (name: string) => {
      const card = [...document.querySelectorAll('.yy-gear-card')].find((node) => node.textContent?.includes(name));
      expect(card, name).toBeDefined();
      click(buttonFor(card!, '编辑'));
    };
    editGear('测试长剑');
    const field = <T extends HTMLElement>(label: string, selector: string) => {
      const fieldLabel = [...panel.querySelectorAll('label')].find((node) => node.firstElementChild?.textContent === label);
      const input = fieldLabel?.querySelector<T>(selector);
      expect(input, label).toBeDefined();
      return input!;
    };
    const slot = field<HTMLSelectElement>('部位', 'select');
    const dingyin = field<HTMLSelectElement>('定音', 'select');
    const value = field<HTMLInputElement>('定音数值', 'input');
    const options = () => [...dingyin.options].map((option) => option.value).filter(Boolean);
    expect(dingyin.value).toBe('外功抗性');
    expect(value.value).toBe('9.2');
    for (const position of ['武器', '环', '佩']) {
      selectValue(slot, position);
      expect(options()).toEqual(weaponDingyin.map((option) => option.name));
      expect(dingyin.value).toBe('外功抗性');
    }
    selectValue(dingyin, '无相穿透');
    click(buttonFor(panel, '填满值'));
    expect(value.value).toBe('15.2');

    selectValue(slot, armorSlots[0]);
    expect(dingyin.value).toBe('');
    expect(value.value).toBe('');
    for (const position of armorSlots) {
      selectValue(slot, position);
      expect(options()).toEqual(armorDingyin.map((option) => option.name));
    }
    selectValue(dingyin, armorDingyin[1].name);
    click(buttonFor(panel, '填满值'));
    expect(value.value).toBe('7');

    selectValue(slot, '武器');
    expect(dingyin.value).toBe('');
    expect(value.value).toBe('');
    selectValue(dingyin, '外功穿透');
    expect(dingyin.selectedOptions[0].textContent).toBe('Physical Penetration');
    click(buttonFor(panel, '填满值'));
    click(buttonFor(panel, '保存修改'));
    await flush(30);
    expect(gearUpdates).toMatchObject([
      { id: gearItems[0].id, input: { slot: '武器', dingyin: { name: '外功穿透', val: 12.8 } } },
    ]);

    editGear('旧版冠胄');
    expect(dingyin.value).toBe('九重春色·蓄力技增伤');
    expect(value.value).toBe('4.3');
  });
});

describe('rail more menu (DOM)', () => {
  beforeAll(() => { installFetchStub(); });

  function openMenu(container: HTMLElement): HTMLElement {
    const moreButton = container.querySelector('.yy-rail-more > button')!;
    click(moreButton);
    const menu = container.querySelector('.yy-rail-menu');
    expect(menu).not.toBeNull();
    return menu as HTMLElement;
  }

  it('opens with the appearance item (current state shown) and sign-out', async () => {
    clearSessionConfirmedTheme();
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
    const container = renderRail('← 百业集结');
    expect(container.querySelector('.yy-rail-menu')).toBeNull();
    const menu = openMenu(container);
    const items = [...menu.querySelectorAll('.yy-rail-menu-item')];
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('切换外观');
    expect(items[0].querySelector('.yy-rail-menu-state')!.textContent).toBe('经典');
    expect(items[1].textContent).toContain('退出登录');
    await flush(10);
  });

  it('closes on Escape and on an outside press', () => {
    const container = renderRail('← 百业集结');
    openMenu(container);
    act(() => { document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(container.querySelector('.yy-rail-menu')).toBeNull();
    openMenu(container);
    act(() => { document.body.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true })); });
    expect(container.querySelector('.yy-rail-menu')).toBeNull();
  });

  it('the appearance item saves through the shared theme path (mutation + anchor + mirror)', async () => {
    clearSessionConfirmedTheme();
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
    fetchCalls.length = 0;
    const container = renderRail('← 百业集结');
    const menu = openMenu(container);
    const appearance = menu.querySelectorAll('.yy-rail-menu-item')[0];
    click(appearance);
    await flush(150);
    // The save went out as the shared hook's mutation for glass…
    const call = fetchCalls.find((c) => c.name === 'useThemeSaveMutation');
    expect(call).toBeTruthy();
    expect(call!.theme).toBe('glass');
    // …applied immediately, mirrored, and anchored for the session —
    // the #153–#155 mechanism, not a rail-local flip.
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');
    expect(getSessionConfirmedTheme()).toBe('glass');
    // The menu closed on selection; reopening shows the new state.
    expect(container.querySelector('.yy-rail-menu')).toBeNull();
    const reopened = openMenu(container);
    expect(reopened.querySelector('.yy-rail-menu-state')!.textContent).toBe('玻璃');
    clearSessionConfirmedTheme();
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
  });

  it('sign-out posts to the existing logout endpoint', async () => {
    fetchCalls.length = 0;
    const container = renderRail('← 百业集结');
    const menu = openMenu(container);
    const signOut = menu.querySelectorAll('.yy-rail-menu-item')[1];
    click(signOut);
    await flush(60);
    const call = fetchCalls.find((c) => c.name === 'logout');
    expect(call).toBeTruthy();
    expect(call!.method).toBe('POST');
    expect(container.querySelector('.yy-rail-menu')).toBeNull();
  });
});

describe('footer stays out of the rail column (CSS contract)', () => {
  it('the footer styles live in the .yy-site-footer class, not inline', () => {
    expect(siteFooterSrc).toContain('className="yy-site-footer"');
    expect(siteFooterSrc).not.toContain('maxWidth: 860');
    const block = ruleBlock(css, '.yy-site-footer');
    expect(block).toContain('max-width: 860px');
    expect(block).toContain('margin: 0 auto');
  });

  it('on guild pages the footer offsets by the rail width at all three widths', () => {
    const sel = '.yy-app-main:has(.yy-guild-shell) > .yy-site-footer';
    expect(ruleBlock(css, sel)).toContain('208px');
    const at1024 = mediaBlockContaining(css, '@media (max-width: 1024px)', '.yy-site-footer');
    expect(ruleBlock(at1024, sel)).toContain('62px');
    const at640 = mediaBlockContaining(css, '@media (max-width: 640px)', '.yy-site-footer');
    expect(ruleBlock(at640, sel)).toContain('56px');
  });
});
