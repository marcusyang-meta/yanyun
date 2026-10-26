/* fbtee declaration surface for the guilds domain (hand-maintained): this
 * domain's UI-copy declarations, one entry = one fbs call, desc =
 * 'section.field' (the stable anchor translations hang off). Source
 * locale zh-CN; translations live in platform/i18n/translations/*.json.
 * scripts/i18n-codegen.mjs collects the per-domain declaration files
 * into the compiled strings.ts / catalogs / CATALOG projection; after
 * editing copy, rerun it (--check runs in CI). Shared copy (common,
 * errors, legal, ...) is declared by the platform domain and reached
 * through its text util, never duplicated here. The StringParams/pv
 * prelude is repeated per file so each file typechecks standalone;
 * codegen extracts the entry statements only.
 */
import type { FbsAPI } from 'fbtee/server';

export type StringParams = Record<string, unknown>;

function pv(p: StringParams | undefined, name: string): string {
  const v = p ? p[name] : undefined;
  return v === undefined ? '{' + name + '}' : String(v);
}

export const locked_backLink = (fbs: FbsAPI) =>fbs("‹ 我的百业", "locked.backLink");
export const locked_title = (fbs: FbsAPI) =>fbs("无权访问这个百业", "locked.title");
export const locked_body1 = (fbs: FbsAPI) =>fbs("该百业不存在，或仅对某个 Discord 服务器的成员开放。", "locked.body1");
export const locked_body2 = (fbs: FbsAPI) =>fbs("加入对应的 Discord 服务器后，用同一个账号登录即可访问。", "locked.body2");
export const locked_backButton = (fbs: FbsAPI) =>fbs("回到我的百业", "locked.backButton");
export const guildHome_backToHub = (fbs: FbsAPI) =>fbs("← 百业集结", "guildHome.backToHub");
export const guildHome_tabTeam = (fbs: FbsAPI) =>fbs("组队", "guildHome.tabTeam");
export const guildHome_tabDex = (fbs: FbsAPI) =>fbs("攻略", "guildHome.tabDex");
export const guildHome_tabSect = (fbs: FbsAPI) =>fbs("流派攻略", "guildHome.tabSect");
export const guildHome_readOnlyBanner = (fbs: FbsAPI) =>fbs("该百业尚未绑定 Discord 服务器 · 只读浏览", "guildHome.readOnlyBanner");
