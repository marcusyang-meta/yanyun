/* ================= 多语言 (fbtee 服务端下发) =================
 * 规则 (2026-10-24 用户定型):
 * - 所有 UI 文案只存在于服务端; 前端不带任何文案字典, 组件经 GraphQL
 *   页面 shell 的 gen 方法按字段取文案 (未选中的字段永不生成)。
 * - 源语言 = zh-CN; 每条文案按 page/field 组织 ('section.field'),
 *   section 对应页面/组件域, field 对应文案位。
 * - 缺译按字段回退 zh-CN 源文 (不整页回退)。
 * - 插值用 {name} 占位符, 由 gen 方法在服务端替换。
 * - 不翻译: 游戏数据 (副本/Boss/流派名、攻略正文) 与用户输入 (车标题/昵称)。
 * zh-TW 用台湾用语 (登入/伺服器/影片/資訊/建立/連結/預設…), 非简繁机械转换。
 *
 * 实现 (2026-10-26 迁 fbtee, Meta fbt 的 TS 移植):
 * - 声明面 = i18n/strings.source.ts (人工维护): 一条文案一个 fbs 调用,
 *   desc = 'section.field'; 带参条目用字面分段 + fbs.param 形态。
 * - 译文 = i18n/translations/<locale>.json (fbtee 可编辑格式); 只备
 *   zh-CN+en 的条目 (termsBody/privacyBody 正文等) 在其余 locale 文件
 *   里缺席, 编译目录随之缺该条, 运行时逐字段回退源文 —— 与旧目录的
 *   按字段回退语义一致。
 * - 生成物 (scripts/i18n-codegen.mjs, CI --check 防漂移): i18n/strings.ts
 *   (编译后的声明函数)、i18n/catalogs/<locale>.json (编译目录
 *   {hk: pattern})、i18n/catalog.ts (CATALOG 兼容投影, 仅供 GraphQL
 *   业务错误文案集合与 harness 的目录级断言; 运行时不读)。
 * - 参数编组在声明函数内完成 (pv): 未传参保留字面量 '{name}'、
 *   其余 String(v), 与旧 translate 的替换口径逐字一致, 并绕开 fbtee
 *   对 number 参数的 Intl 格式化。
 * ================================================================ */
import { createFbteeRuntime } from 'fbtee/server';
import type { FbteeRuntime } from 'fbtee/server';
import { STRING_FNS } from './i18n/strings.ts';
import type { FbsRuntime } from './i18n/strings.ts';
import enCatalog from './i18n/catalogs/en.json' with { type: 'json' };
import esCatalog from './i18n/catalogs/es.json' with { type: 'json' };
import frCatalog from './i18n/catalogs/fr.json' with { type: 'json' };
import zhTwCatalog from './i18n/catalogs/zh-TW.json' with { type: 'json' };

export { CATALOG } from './i18n/catalog.ts';

export const SOURCE_LOCALE = 'zh-CN';
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es', 'fr', 'zh-TW'];

// 语言协商: 请求头 x-locale (浏览器 navigator.language) -> 支持的 locale。
// zh-TW/zh-HK/zh-Hant* -> zh-TW; en* -> en; es* -> es; fr* -> fr; 其余 zh-CN。
export function negotiateLocale(raw: any) {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return SOURCE_LOCALE;
  const first = v.split(',')[0].trim();
  if (first.startsWith('zh')) {
    if (first.includes('tw') || first.includes('hk') || first.includes('hant')) return 'zh-TW';
    return SOURCE_LOCALE;
  }
  if (first.startsWith('en')) return 'en';
  if (first.startsWith('es')) return 'es';
  if (first.startsWith('fr')) return 'fr';
  return SOURCE_LOCALE;
}

/* 惰性验证探针 (默认关): 开启后 translate 记录每个 (section.field) 的调用
 * 次数, 供本地 harness 证明 "未选中的 gen 方法永不被调用、选中字段每
 * 请求只生成一次 (shell memo)"。生产恒关, 仅一次布尔判断开销。 */
export const i18nProbe: { enabled: boolean; counts: Map<string, number>; reset(): void } = {
  enabled: false,
  counts: new Map(),
  reset() { this.counts = new Map(); },
};

/* 每 locale 一个固定 fbtee 运行时 (模块加载时构建): 译文目录缺条 ->
 * 回退内联的 zh-CN 源文案 (逐字段回退); 源 locale 运行时目录为空,
 * 直接渲染内联源文。 */
function makeRuntime(locale: string, catalog: Record<string, string>): FbteeRuntime {
  return createFbteeRuntime({
    locale,
    sourceLocale: SOURCE_LOCALE,
    translations: { [locale]: catalog },
  });
}
const RUNTIMES: Record<string, FbteeRuntime> = {
  'zh-CN': createFbteeRuntime({ locale: SOURCE_LOCALE, sourceLocale: SOURCE_LOCALE, translations: {} }),
  en: makeRuntime('en', enCatalog),
  es: makeRuntime('es', esCatalog),
  fr: makeRuntime('fr', frCatalog),
  'zh-TW': makeRuntime('zh-TW', zhTwCatalog),
};

export function translate(section: string, field: string, locale: string, params?: Record<string, any>) {
  if (i18nProbe.enabled) {
    const k = section + '.' + field;
    i18nProbe.counts.set(k, (i18nProbe.counts.get(k) || 0) + 1);
  }
  const fn = STRING_FNS[section + '.' + field];
  if (!fn) return section + '.' + field; // 目录缺条: 显形而非静默空白
  const rt = RUNTIMES[locale] ?? RUNTIMES[SOURCE_LOCALE];
  return fn(rt.fbs as FbsRuntime, params);
}
