
/* ================= 数据（100 阶，来自词条满值表与全流派面板分配表） ================= */
var SLOTS = ["主武器","副武器","冠胄","胸甲","环","佩","胫甲","腕甲"];
/* 第 40 节（站长定）：装备库主 / 副武器合并为一个「武器」池——SLOTS 是搭配的 8 个位置（存档 loadout 键不变、旧导出兼容），
   GEAR_SLOTS 是装备本身的部位（武器只剩一种，录入混了主 / 副也能用）；两个武器位置的候选都来自武器池、同一件不能同占两位置。
   gearSlotOf 把搭配位置 / 旧部位名归一到装备部位：主武器 / 副武器 / 武器 -> 武器，其余同名，认不出返回 null */
var GEAR_SLOTS = ["武器","冠胄","胸甲","环","佩","胫甲","腕甲"];
function gearSlotOf(slot){
if(slot==null) return null;
if(slot==="武器"||slot==="主武器"||slot==="副武器") return "武器";
return GEAR_SLOTS.indexOf(slot)>-1? slot: null;
}
/* 词条目录：满值 / 承音值与用户给的 100 阶表一致 */
var AFFIX = [
{key:"dawai", label:"大外功", short:"大外", max:90.6, cy:85.2, unit:""},
{key:"xiaowai", label:"小外功", short:"小外", max:90.6, cy:85.2, unit:""},
{key:"shu_mj_da", label:"最大鸣金攻击", short:"大鸣金", max:51.4, cy:48.3, unit:"", sys:"鸣金", size:"da"},
{key:"shu_mj_xiao", label:"最小鸣金攻击", short:"小鸣金", max:51.4, cy:48.3, unit:"", sys:"鸣金", size:"xiao"},
{key:"shu_ls_da", label:"最大裂石攻击", short:"大裂石", max:51.4, cy:48.3, unit:"", sys:"裂石", size:"da"},
{key:"shu_ls_xiao", label:"最小裂石攻击", short:"小裂石", max:51.4, cy:48.3, unit:"", sys:"裂石", size:"xiao"},
{key:"shu_pz_da", label:"最大破竹攻击", short:"大破竹", max:51.4, cy:48.3, unit:"", sys:"破竹", size:"da"},
{key:"shu_pz_xiao", label:"最小破竹攻击", short:"小破竹", max:51.4, cy:48.3, unit:"", sys:"破竹", size:"xiao"},
{key:"shu_qs_da", label:"最大牵丝攻击", short:"大牵丝", max:51.4, cy:48.3, unit:"", sys:"牵丝", size:"da"},
{key:"shu_qs_xiao", label:"最小牵丝攻击", short:"小牵丝", max:51.4, cy:48.3, unit:"", sys:"牵丝", size:"xiao"},
{key:"shu_wx_da", label:"最大无相攻击", short:"大无相", max:51.4, cy:48.3, unit:"", sys:"无相", size:"da"},
{key:"shu_wx_xiao", label:"最小无相攻击", short:"小无相", max:51.4, cy:48.3, unit:"", sys:"无相", size:"xiao"},
{key:"ti", label:"体", short:"体", max:57.4, cy:54, unit:""},
{key:"jin", label:"劲", short:"劲", max:57.4, cy:54, unit:""},
{key:"yu", label:"御", short:"御", max:57.4, cy:54, unit:""},
{key:"min", label:"敏", short:"敏", max:57.4, cy:54, unit:""},
{key:"shi", label:"势", short:"势", max:57.4, cy:54, unit:""},
{key:"jingzhun", label:"精准率", short:"精准", max:9.4, cy:8.8, unit:"%"},
{key:"huixin", label:"会心率", short:"会心", max:10.4, cy:9.8, unit:"%"},
{key:"huiyi", label:"会意率", short:"会意", max:5.2, cy:4.9, unit:"%"},
{key:"wuqizeng", label:"武器增效", short:"武器增", max:7.4, cy:7, unit:"%"},
{key:"quanwu", label:"全武学增效", short:"全武", max:3.6, cy:3.4, unit:"%"},
{key:"shouling", label:"首领增伤", short:"首领", max:3.8, cy:3.6, unit:"%"},
{key:"wanjia", label:"玩家增伤", short:"玩家", max:3.8, cy:3.6, unit:"%"},
{key:"quanqi", label:"全奇术增伤", short:"全奇术", max:11.4, cy:10.7, unit:"%"}
];
var AFFIX_BY_KEY = {};
AFFIX.forEach(function(a){ AFFIX_BY_KEY[a.key]=a; });
/* 旧版导出文件的 key 兼容 */
/* 旧版大/小属攻无法判定原系别，统一迁移到无相（见变更日志） */
/* 第 29 节：单体 / 群体奇术增伤已全站合并为全奇术增伤，旧存档 / 旧导出里的 danti、qunti 词条行在载入与导入时经 sanitizeLineData 自动迁移为 quanqi（数值原样，三者满值 / 承音相同） */
var LEGACY_KEY = {benshu:"shu_wx_da", wuxiang:"shu_wx_da", dashu:"shu_wx_da", xiaoshu:"shu_wx_xiao", danti:"quanqi", qunti:"quanqi"};
var SHU_SYSTEMS = ["鸣金","裂石","破竹","牵丝","无相"];
var SHU_KEY_INFO = {};
AFFIX.forEach(function(a){ if(a.sys) SHU_KEY_INFO[a.key]={sys:a.sys, size:a.size}; });
function isShuKey(key){ return !!SHU_KEY_INFO[key]; }
function isWuxiangKey(key){ return key==="shu_wx_da"||key==="shu_wx_xiao"; }
function shuSystemOfKey(key){ var i=SHU_KEY_INFO[key]; return i? i.sys: null; }
function shuSizeOfKey(key){ var i=SHU_KEY_INFO[key]; return i? i.size: null; }
/* 条数归类：属攻先归 shugong，最终是否计入由 effectiveClassOf 按流派判定 */
var CLASS_OF_KEY = {};
Object.keys(SHU_KEY_INFO).forEach(function(k){ CLASS_OF_KEY[k]="shugong"; });
function classOf(key){ return CLASS_OF_KEY[key]||key; }
var CLASS_LABEL = {dawai:"大外", xiaowai:"小外", shugong:"属攻（本系/无相）", jin:"劲", min:"敏", shi:"势", ti:"体", yu:"御", jingzhun:"精准", huixin:"会心", huiyi:"会意", wuqizeng:"武器增效", quanwu:"全武学", shouling:"首领", wanjia:"玩家", quanqi:"全奇术", shu_mj_da:"最大鸣金攻击", shu_mj_xiao:"最小鸣金攻击", shu_ls_da:"最大裂石攻击", shu_ls_xiao:"最小裂石攻击", shu_pz_da:"最大破竹攻击", shu_pz_xiao:"最小破竹攻击", shu_qs_da:"最大牵丝攻击", shu_qs_xiao:"最小牵丝攻击", shu_wx_da:"最大无相攻击", shu_wx_xiao:"最小无相攻击"};
function buildSystem(build){ var sch=(build&&build.school)||""; var sys=sch.split("-")[0]; return SHU_SYSTEMS.indexOf(sys)>-1? sys: null; }
function effectiveClassOf(key, build){
if(!isShuKey(key)) return classOf(key);
var sys=shuSystemOfKey(key);
/* 第 42 节（站长定版）：build 的 targets 含「属攻认大小」的独立类时（如裂石-威新条目的 shu_ls_da，全站仅此一条），
   本系大小词条各归本类——大裂石命中 target 最小裂石落配方外；无此 target 的流派（含旧裂石-威）走下方系级 shugong 口径不变。
   注意：面板属攻汇总不经此处判定（见 computePanel 的系级通算），口径独立 */
if(sys&&build&&build.targets&&sys===buildSystem(build)&&build.targets.some(function(t){ return isShuKey(t.cls)&&shuSystemOfKey(t.cls)===sys; })) return key;
return (sys==="无相"||sys===buildSystem(build))? "shugong": key;
}
/* 配方词条名 -> 归类 key（武器增效归一；无相与本系属攻按属攻计）
   第 42 节例外：「大裂石」精确映射为独立类 shu_ls_da（只认最大裂石攻击），不并 shugong；既有「大破竹」等映射一律不动 */
var NAME_TO_CLASS = {"大外":"dawai","小外":"xiaowai","劲":"jin","敏":"min","势":"shi","精准":"jingzhun","会心":"huixin","会意":"huiyi","全武":"quanwu","首领":"shouling","玩家":"wanjia","单体":"quanqi","群体":"quanqi","全奇术":"quanqi","无相":"shugong","牵丝":"shugong","裂石":"shugong","破竹":"shugong","大破竹":"shugong","鸣金":"shugong","鸣金大":"shugong","鸣金小":"shugong","破竹大":"shugong","破竹小":"shugong","牵丝大":"shugong","牵丝小":"shugong","裂石大":"shugong","裂石小":"shugong","大裂石":"shu_ls_da","剑增":"wuqizeng","伞增":"wuqizeng","扇增":"wuqizeng","鼓增":"wuqizeng","陌增":"wuqizeng","唐增":"wuqizeng","拳增":"wuqizeng","刀增":"wuqizeng","双刀增":"wuqizeng","镖增":"wuqizeng"};

var BUILDS = [
{cat:"大外会意", school:"鸣金-虹", set:"玉斗", bow:"会意", recipe:"1剑增 + 2首领 + 2全武 + 12大外 + 10劲 + 7势 + 6会意"},
{cat:"大外会意", school:"鸣金-影", set:"飞隼", bow:"会意", recipe:"1剑增 + 2首领 + 2全武 + 2全奇术 + 12大外 + 9劲 + 7势 + 5会意"},
{cat:"大外会心", school:"牵丝-玉（飞天）", set:"烟柳", bow:"精准", recipe:"1伞增 + 2首领 + 2全武 + 12大外 + 9劲 + 1势 + 8会心 + 3敏 + 2精准"},
{cat:"大外会心", school:"牵丝-玉（走地）", set:"烟柳", bow:"精准", recipe:"1伞增 + 2首领 + 2全武 + 2全奇术 + 12大外 + 7劲 + 1势 + 8会心 + 3敏 + 2精准"},
{cat:"大外会心", school:"牵丝-霖（纯奶）", set:"浣花", bow:"会心", recipe:"1扇增 + 2玩家 + 2全武 + 12大外 + 10劲 + 6会心 + 3敏 + 4小外"},
{cat:"大外会心", school:"牵丝-霖（纯奶）", set:"时雨", bow:"会心", recipe:"1扇增 + 2玩家 + 2全武 + 12大外 + 10劲 + 7会心 + 3敏 + 3小外"},
{cat:"大外会心", school:"牵丝-霖（火拳）", set:"时雨", bow:"精准", recipe:"2全奇术 + 2首领 + 12大外 + 10劲 + 3敏 + 8会心 + 2精准 + 1势"},
{cat:"大外会心", school:"牵丝·翊", set:"裁云", bow:"精准", recipe:"1鼓增 + 2首领 + 2全武 + 12大外 + 9劲 + 3敏 + 8会心 + 3精准"},
{cat:"大外会心", school:"裂石-威", set:"时雨+易相", bow:"精准", recipe:"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 5势 + 6会心 + 2精准"},
{cat:"大外会心", school:"裂石钧-唐", set:"断岳", bow:"精准", recipe:"1唐增 + 2首领 + 2全武 + 12大外 + 8劲 + 3敏 + 9会心 + 3精准"},
{cat:"大外会心", school:"裂石钧-陌", set:"断岳", bow:"会心/精准", recipe:"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 3敏 + 7会心 + 2精准 + 1小外/大裂（二选一）"},
{cat:"大外会心", school:"破竹-鸢", set:"撼天", bow:"精准", recipe:"1拳增 + 2首领 + 2全武 + 12大外 + 9劲（8劲+1势） + 3敏 + 8会心 + 3精准"},
{cat:"大外会心", school:"破竹-樽", set:"倾觞", bow:"精准", recipe:"1拳增 + 1双刀增 + 2首领 + 2全武 + 12大外 + 8劲 + 3敏 + 8会心 + 3精准"},
{cat:"大外会心", school:"破竹-尘", set:"连星", bow:"精准", recipe:"1伞增 + 2首领 + 2全武 + 12大外 + 10劲 + 3敏 + 8会心 + 2精准"},
{cat:"大外会心", school:"破竹-风", set:"燕归", bow:"精准", recipe:"1刀增 + 1镖增 + 2首领 + 2全武 + 12大外 + 10劲 + 2敏 + 7会心 + 2精准 + 1小外"},
{cat:"小外会心", school:"牵丝-霖（火拳）", set:"撼天", bow:"精准", recipe:"2全奇术 + 2首领 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 5牵丝"},
{cat:"小外会心", school:"牵丝·翊", set:"裁云", bow:"精准", recipe:"1鼓增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 4牵丝"},
{cat:"小外会心", school:"裂石-唐", set:"断岳", bow:"精准", recipe:"1唐增 + 2首领 + 2全武 + 12小外 + 8敏 + 7会心 + 3精准 + 2无相 + 3裂石"},
{cat:"小外会心", school:"裂石-钧（易水歌）", set:"断岳", bow:"会心/精准", recipe:"1陌增 + 2首领 + 2全武 + 12小外 + 8敏 + 5会心 + 2精准 + 2无相 + 6裂石"},
{cat:"小外会心", school:"破竹-鸢", set:"撼天", bow:"精准", recipe:"1拳增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 4破竹", note:"凑百爆：3破竹 + 1会意"},
{cat:"小外会心", school:"破竹-樽", set:"倾觞", bow:"精准", recipe:"1拳增 + 1双刀增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 5大破竹"},
{cat:"小外会心", school:"破竹-尘", set:"连星", bow:"精准", recipe:"1伞增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 2精准 + 2无相 + 5破竹"},
{cat:"小外会心", school:"破竹-风", set:"燕归", bow:"精准", recipe:"1刀增 + 1镖增 + 2首领 + 2全武 + 12小外 + 8敏 + 5会心 + 2精准 + 2无相 + 5破竹"},
{cat:"小外会心", school:"牵丝-霖（火拳）", set:"浣花", bow:"精准", recipe:"2全奇术 + 2首领 + 12小外 + 8敏 + 4会心 + 3精准 + 2无相 + 7牵丝"},
/* 第 42 节（站长定版）：裂石-威新增一条配方，旧条目原样保留——原 5 势改为 2 势 + 1 会意 + 2 大裂石（只算大，见 effectiveClassOf）；
   必须追加在数组末尾（index 24），不得改动 / 移动既有条目（存档 targetIdx 兼容）。
   区分名「高级版」由站长给出：set 字段经核查纯显示（无套装加成等计算按 set 值匹配；套装 / 定音 / 天赋处理都按 school 推导，两条一致），
   故直接写进 set 后缀，目标选择器文案（cat · school · set）天然带「高级版」与旧条目区分；传家宝缓存键含 set，两条亦天然不串 */
{cat:"大外会心", school:"裂石-威", set:"时雨+易相（高级版）", bow:"精准", recipe:"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 2势 + 6会心 + 1会意 + 2精准 + 2大裂石"}
];

var SLOTS_BIG = [
{slot:"武器", lines:["大外","大外","劲","三率/敏","增伤/三率"]},
{slot:"冠胄", lines:["三率","大外","劲","三率/势","三率"]},
{slot:"胸甲", lines:["三率","大外","劲","三率/势","三率"]},
{slot:"环", lines:["大外","大外","劲/势","三率","全武学"]},
{slot:"佩", lines:["大外","大外","劲/势","三率","全武学"]},
{slot:"胫甲", lines:["劲","大外","劲/势","三率","增伤"]},
{slot:"腕甲", lines:["劲","大外","劲/势","三率","增伤"]}
];
var SLOTS_SMALL = [
{slot:"武器", lines:["小外","小外","大无相","敏","增伤/三率"]},
{slot:"冠胄", lines:["三率","大本属","敏","小外","三率"]},
{slot:"胸甲", lines:["三率","敏","大本属","小外","三率"]},
{slot:"环", lines:["小外","小外","敏","三率/大本属","全武学"]},
{slot:"佩", lines:["小外","小外","敏","三率/大本属","全武学"]},
{slot:"胫甲", lines:["三率","小外","大本属","敏","首领"]},
{slot:"腕甲", lines:["三率","小外","大本属","敏","首领"]}
];

/* ================= 工具 ================= */
function $(id){ return document.getElementById(id); }
function fmt(v,d){ return (Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d); }
function num(id){ var v=parseFloat($(id).value); return isNaN(v)?0:v; }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
var toastTimer=null;
function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(function(){ t.classList.remove("show"); },2200); }

/* 配方解析 + 按类聚合目标：{cls, label, n, flex:[cls..]|null} */
function parseRecipe(recipe){
var out=[];
recipe.replace(/（[^）]*）/g,"").replace(/\([^)]*\)/g,"").split("+").forEach(function(seg){
seg=seg.trim(); if(!seg) return;
var m=seg.match(/^(\d+)\s*(.+)$/); if(!m) return;
var n=parseInt(m[1],10), nm=m[2].trim();
if(nm.indexOf("/")>-1){
var keys=[];
nm.split("/").forEach(function(p){ p=p.trim(); var k=NAME_TO_CLASS[p]||(p==="大裂"?"shugong":null); if(k&&keys.indexOf(k)===-1) keys.push(k); });
if(keys.length) out.push({cls:"flex:"+keys.join("|"), label:nm+"（二选一）", n:n, flex:keys});
} else {
var k=NAME_TO_CLASS[nm]; if(k) out.push({cls:k, label:CLASS_LABEL[k]||nm, n:n, flex:null});
}
});
var agg={}, order=[];
out.forEach(function(it){
if(agg[it.cls]){ agg[it.cls].n+=it.n; }
else { agg[it.cls]=it; order.push(it); }
});
/* 第 29 节：单体 / 群体奇术增伤已全站合并为全奇术增伤单一类——NAME_TO_CLASS 把单体、群体、全奇术都映射到 quanqi，
   上面的按 cls 聚合即自动求和，不再有 qishu flex 池；差缺 / 条数 / 单件评分 / 传家宝 / 建议引擎共用同一 targets 口径 */
return order;
}
BUILDS.forEach(function(b){ b.targets=parseRecipe(b.recipe); b.total=b.targets.reduce(function(s,it){ return s+it.n; },0); });

/* ================= 角色基础（固定值）：单一流程 —— 预设锁定、按字段解锁修改 ================= */
var BASE_FIELDS=["ti","jin","yu","min","shi","xiao","da","hp","shuXiao","shuDa","wkXiao","wkDa","wkShuXiao","wkShuDa","wkHp","wxXiao","wxDa","acc","crit","int","dcrit","dint","dmg","shuDmg"];
/* 第 24 节（2026-10-23 探针实证）：预设换裸底子——旧预设吸收了武库 + 装备固有属性 + 套装，全部剥离。
   裸底子 = 站长垃圾装探针（91/96 阶无词条、心法 0、弓 0）实测反推；属攻改由武库字段承担，shuXiao/shuDa 保留作手动加项（默认 0）。
   武库字段 = 站长本号武库附件（四系同值：外功 141/283、本系属攻 141/283、气血 27,400，只计一份）。 */
var BASE_PRESET={ti:187,jin:187,yu:187,min:187,shi:187,xiao:542.6,da:895.4,hp:100670,shuXiao:0,shuDa:0,wkXiao:141,wkDa:283,wkShuXiao:141,wkShuDa:283,wkHp:27400,wxXiao:26,wxDa:26,acc:99.30,crit:24.0,"int":12.0,dcrit:0,dint:0,dmg:2.8,shuDmg:11.0};
var BASE_FIELD_LABELS={"ti":"基础体","jin":"基础劲","yu":"基础御","min":"基础敏","shi":"基础势","xiao":"基础小外","da":"基础大外","hp":"基础气血","shuXiao":"本系属攻·小","shuDa":"本系属攻·大","wkXiao":"武库·小外","wkDa":"武库·大外","wkShuXiao":"武库·属攻小","wkShuDa":"武库·属攻大","wkHp":"武库·气血","wxXiao":"无相底子·小","wxDa":"无相底子·大","acc":"基础精准","crit":"基础会心","int":"基础会意","dcrit":"直接会心","dint":"直接会意","dmg":"外功伤害加成","shuDmg":"属攻伤害加成"};
var WK_FIELDS=["wkXiao","wkDa","wkShuXiao","wkShuDa","wkHp"];
/* 无相底子（账号级 26/26，垃圾装探针实测，第 35 节入模）：与武库同 fallback 规则——旧存档 / 旧导出无此二字段时回退预设，不得清零、不得重置其他数据 */
var WX_FIELDS=["wxXiao","wxDa"];
var BASE_STATE_VER=2; /* base 存档版本标记：第 24 节起写入；读到无此标记的旧本地存档 → base 整体重置为新预设（仅一次，见 loadStore） */
var baseUnlocked={}, baseLockBtns={}, baseModTags={};
/* ================= 定音 / 弓 ================= */
var DINGYIN_LEFT_SLOTS = {"武器":1,"主武器":1,"副武器":1,"环":1,"佩":1};
var DINGYIN_LEFT = {"外功穿透":12.8,"外功抗性":12.8,"无相穿透":15.2};
var DINGYIN_RIGHT_MAX = 6.0;
/* 右四定音：流派 → 定音全名映射（2026-10-22 查实）。出处：Q7 装备管理器 app.min.js 的流派改写映射 + 片雲分流派 Excel 类别 + 站长实物互证，详见 dingyin-fullnames-2026-10-22.md。
   verified=true 的有游戏内全名（name / wuxue 武学名）；未证实的只有类别（category / keywords），一律不拼凑全名、只给自定义填写。
   破竹-风官方写作「粟子游尘」，Q7 作「栗子游尘」（异写），wuxueAlt 兼容两种写法。
   2026-10-22 站长发陈榆 110 面板表补证三条：牵丝·翊=文动霓裳·特殊技增伤、破竹-樽=悬身断水·浓醺技能增伤（三段式）、牵丝-霖（火拳）与纯奶同名 明川药典·治疗技增疗——站长口径：定音只随武学、不随大外/小外变体。未证实只剩牵丝-玉（飞天）。 */
var BUILD_DINGYIN = {
"鸣金-虹": {name:"无名剑法·蓄力技增伤", wuxue:"无名剑法", verified:true},
"鸣金-影": {name:"积矩九剑·流血增伤", wuxue:"积矩九剑", verified:true},
"裂石-威": {name:"嗟夫刀法·蓄力技增伤", wuxue:"嗟夫刀法", verified:true},
"裂石钧-唐": {name:"斩雪刀法·轻重击派生技增伤", wuxue:"斩雪刀法", verified:true},
"裂石-唐": {name:"斩雪刀法·轻重击派生技增伤", wuxue:"斩雪刀法", verified:true},
"裂石钧-陌": {name:"十方破阵·蓄力技增伤", wuxue:"十方破阵", verified:true},
"裂石-钧（易水歌）": {name:"十方破阵·蓄力技增伤", wuxue:"十方破阵", verified:true},
"牵丝-玉（走地）": {name:"九重春色·特殊技增伤", wuxue:"九重春色", verified:true},
"牵丝-霖（纯奶）": {name:"明川药典·治疗技增疗", wuxue:"明川药典", verified:true},
"破竹-尘": {name:"醉梦游春·武学技增伤", wuxue:"醉梦游春", verified:true},
"破竹-风": {name:"粟子游尘·鼠鼠增伤", wuxue:"粟子游尘", wuxueAlt:"栗子游尘", verified:true},
"破竹-鸢": {name:"天志垂象·蓄力技增伤", wuxue:"天志垂象", verified:true},
"牵丝-玉（飞天）": {category:"弹道 / 伞蓄力（两说）", keywords:["弹道","蓄力"], verified:false},
"牵丝-霖（火拳）": {name:"明川药典·治疗技增疗", wuxue:"明川药典", verified:true},
"牵丝·翊": {name:"文动霓裳·特殊技增伤", wuxue:"文动霓裳", verified:true},
"破竹-樽": {name:"悬身断水·浓醺技能增伤", wuxue:"悬身断水", keywords:["酩酊"], verified:true}
};
function buildDingyinInfo(build){ return build? (BUILD_DINGYIN[build.school]||null): null; }
/* ================= 武器流派标签（第 38 节上线武学标签，第 39 节站长改口径换标尺） =================
   标签全集 = BUILDS 里 distinct 的 school 原名（可多选、装备库里随时点选修改）；
   钧-唐（裂石钧-唐）与钧-陌（裂石钧-陌）是两门武学、武器不通用，标签必须分开。
   第 38 节的武学全集（定音全名表推导 + 玉飞天）保留，仅作旧数据迁移与定音反推用：
   武学 -> 其名下全部流派由 BUILDS + buildWuxue 推导（如 明川药典 -> 牵丝-霖（纯奶）/牵丝-霖（火拳），
   十方破阵 -> 裂石钧-陌/裂石-钧（易水歌），斩雪刀法 -> 裂石钧-唐/裂石-唐）。
   流派的武学 = 其定音全名的武学（buildDingyinInfo().wuxue），飞天未证实则按「玉飞天」。 */
var WUXUE_LIST=[];
Object.keys(BUILD_DINGYIN).forEach(function(k){ var w=BUILD_DINGYIN[k].wuxue; if(w&&WUXUE_LIST.indexOf(w)<0) WUXUE_LIST.push(w); });
if(WUXUE_LIST.indexOf("玉飞天")<0) WUXUE_LIST.push("玉飞天");
var WUXUE_ALT={};
Object.keys(BUILD_DINGYIN).forEach(function(k){ var o=BUILD_DINGYIN[k]; if(o.wuxue&&o.wuxueAlt) WUXUE_ALT[o.wuxueAlt]=o.wuxue; });
function buildWuxue(build){
var info=buildDingyinInfo(build); if(info&&info.wuxue) return info.wuxue;
if(build&&build.school==="牵丝-玉（飞天）") return "玉飞天";
return null;
}
/* 定音全名 -> 武学名（认全名开头，含异写）；认不出返回 null */
function wuxueFromDingyinName(name){
name=String(name||"").trim(); if(!name) return null;
for(var i=0;i<WUXUE_LIST.length;i++){ if(name.indexOf(WUXUE_LIST[i])===0) return WUXUE_LIST[i]; }
for(var alt in WUXUE_ALT){ if(name.indexOf(alt)===0) return WUXUE_ALT[alt]; }
return null;
}
/* 标签全集：流派（school 原名），按 BUILDS 出现顺序去重 */
var SCHOOL_TAG_LIST=[];
BUILDS.forEach(function(b){ if(b.school&&SCHOOL_TAG_LIST.indexOf(b.school)<0) SCHOOL_TAG_LIST.push(b.school); });
/* 武学 -> 其名下全部流派（由 BUILDS + buildWuxue 推导，不硬编码） */
var WUXUE_TO_SCHOOLS={};
BUILDS.forEach(function(b){ var w=buildWuxue(b); if(!w) return; var arr=(WUXUE_TO_SCHOOLS[w]=WUXUE_TO_SCHOOLS[w]||[]); if(arr.indexOf(b.school)<0) arr.push(b.school); });
function schoolsFromWuxue(w){ var s=w? WUXUE_TO_SCHOOLS[w]: null; return s? s.slice(): []; }
/* 定音全名 -> 流派标签数组：定音名 -> 武学 -> 展开为其全部流派；认不出返回 [] */
function schoolTagsFromDingyinName(name){
var w=wuxueFromDingyinName(name); return w? schoolsFromWuxue(w): [];
}
/* 标签校验/迁移：值是流派原名则保留；是第 38 节的旧武学名（含异写）则展开为其全部流派；认不出的丢弃。按全集顺序去重输出 */
function sanitizeSchoolTags(v){
if(!Array.isArray(v)) return [];
var seen={}, out=[];
v.forEach(function(t){
if(typeof t!=="string") return;
var list=null;
if(SCHOOL_TAG_LIST.indexOf(t)>-1) list=[t];
else { var w=WUXUE_ALT[t]||t; if(WUXUE_TO_SCHOOLS[w]) list=WUXUE_TO_SCHOOLS[w]; }
if(!list) return;
list.forEach(function(s){ if(!seen[s]){ seen[s]=1; out.push(s); } });
});
out.sort(function(a,b){ return SCHOOL_TAG_LIST.indexOf(a)-SCHOOL_TAG_LIST.indexOf(b); });
return out;
}
function gearSchoolTags(g){ return (g&&Array.isArray(g.schools))? g.schools: []; }
/* 过滤口径：非武器不限；未标流派的武器不排除（老库可用）；已标的须含当前流派 */
function weaponUsableForBuild(g, build){
if(!g||!isWeaponSlot(g.slot)) return true;
var tags=gearSchoolTags(g); if(!tags.length) return true;
if(!build||!build.school) return true;
return tags.indexOf(build.school)>-1;
}
function toggleGearSchool(id, s){
var g=findGear(id); if(!g||!isWeaponSlot(g.slot)||SCHOOL_TAG_LIST.indexOf(s)<0) return false;
var tags=gearSchoolTags(g).slice();
var i=tags.indexOf(s);
if(i>-1) tags.splice(i,1); else tags.push(s);
tags.sort(function(a,b){ return SCHOOL_TAG_LIST.indexOf(a)-SCHOOL_TAG_LIST.indexOf(b); });
g.schools=tags;
saveStore();
return i<0;
}
function schoolChipsHtml(g){
var tags=gearSchoolTags(g);
if(!tags.length) return '<span class="note">未标流派</span>';
return tags.map(function(s){ return '<span class="tag gold">'+esc(s)+"</span>"; }).join("");
}
function schoolRowHtml(g){
var tags=gearSchoolTags(g);
var chips=SCHOOL_TAG_LIST.map(function(s){
return '<button type="button" class="wxchip'+(tags.indexOf(s)>-1?" on":"")+'" data-sc="'+esc(s)+'" data-gid="'+g.id+'">'+esc(s)+"</button>";
}).join("");
return '<div class="wxrow"><button class="btn mini" type="button" data-act="schools" data-id="'+g.id+'">流派</button><span class="wxchips">'+schoolChipsHtml(g)+'</span><div class="wxpicker" style="display:none">'+chips+"</div></div>";
}
/* 名字是否命中「其他流派」的已证实武学名（与 info 同武学的条目不算其他） */
function dingyinOtherWuxueHit(name, info){
for(var k in BUILD_DINGYIN){ var o=BUILD_DINGYIN[k]; if(!o.verified) continue; if(info&&info.wuxue&&o.wuxue===info.wuxue) continue;
if(o.wuxue&&name.indexOf(o.wuxue)>-1) return true; if(o.wuxueAlt&&name.indexOf(o.wuxueAlt)>-1) return true; }
return false;
}
/* 弓（弓玦）：加成计入白字（精准 +4.7 / 会心 +5.2 / 会意 +2.6），再按抗性换算黄字。第 35 节站长受控实测改口径（只动弓：无弓精准白 123.0 → 精准弓白 127.7、黄 98.9，证实弓进白字；旧口径为直加黄字百分点）；acc/crit/int 字段即白字加值 */
var BOW_JUE_VALUES = {acc:{acc:4.7,crit:0,"int":0,label:"精准弓"}, crit:{acc:0,crit:5.2,"int":0,label:"会心弓"}, "int":{acc:0,crit:0,"int":2.6,label:"会意弓"}};
/* 配方推荐弓（旧弓诀名）-> 合并后的弓：精准->精准弓 / 会心->会心弓 / 会意->会意弓 / 会心/精准->会心弓 */
var BOW_RECOMMEND={"精准":"acc","会心":"crit","会意":"int","会心/精准":"crit"};
function bowKindFromLegacyName(name){ return BOW_RECOMMEND[String(name||"").trim()]||""; }
function recommendBowKind(build){ return bowKindFromLegacyName(build&&build.bow); }
function recommendBowLabel(build){ var k=recommendBowKind(build); return k? BOW_JUE_VALUES[k].label: ""; }
function isLeftDingyinSlot(slot){ return !!DINGYIN_LEFT_SLOTS[slot]; }
function isMartialDingyinName(name){ name=String(name||"").trim(); return !!name && DINGYIN_LEFT[name]==null && (name.indexOf("增伤")>-1||name.indexOf("增疗")>-1); }
function dingyinMax(name, slot){
if(isLeftDingyinSlot(slot)) return DINGYIN_LEFT[String(name||"").trim()]||null;
if(!slot){ var ln=DINGYIN_LEFT[String(name||"").trim()]; if(ln) return ln; }
return isMartialDingyinName(name)? DINGYIN_RIGHT_MAX: null;
}
function dingyinTypeCorrect(name, slot, build){
name=String(name||"").trim(); if(!name) return false;
if(isLeftDingyinSlot(slot)) return name==="外功穿透";
if(!isMartialDingyinName(name)) return false;
var info=buildDingyinInfo(build);
if(!info) return true; /* 目标流派无映射信息：宽松判对 */
/* 已证实流派：名字含本流派武学名（或其异写）→ 对；含其他已证实流派的武学名 → 错；其余无法判定者宽松判对（口径见变更日志） */
if(info.verified){
if(name.indexOf(info.wuxue)>-1) return true;
if(info.wuxueAlt&&name.indexOf(info.wuxueAlt)>-1) return true;
return !dingyinOtherWuxueHit(name, info);
}
/* 未证实流派（只有类别）：含本流派类别关键词 → 对；含其他已证实流派的武学名 → 错；其余宽松判对 */
for(var j=0;j<info.keywords.length;j++){ if(name.indexOf(info.keywords[j])>-1) return true; }
return !dingyinOtherWuxueHit(name, info);
}
function sanitizeDingyin(d, slot){
if(!d||typeof d!=="object") return null;
var name=String(d.name||d.type||"").trim();
var v=(typeof d.val==="number")? d.val: parseVal(d.val);
if(!name||v==null||!isFinite(v)||v<0) return null;
if(dingyinMax(name, slot)==null) return null;
return {name:name, val:v};
}
/* ================= 数据校验 / 归一化 ================= */
function isWeaponSlot(slot){ return slot==="武器"||slot==="主武器"||slot==="副武器"; }
function validLineNumber(v){ return typeof v==="number"&&isFinite(v)&&v>=0; }
function sanitizeLineData(l, slot, warnings){
if(!l||typeof l!=="object") return null;
var key=LEGACY_KEY[l.key]||l.key;
if(!AFFIX_BY_KEY[key]) return null;
if(isWuxiangKey(key)&&!isWeaponSlot(slot)){
if(warnings) warnings.push("异常：非武器部位出现"+AFFIX_BY_KEY[key].label+"，已忽略（无相属攻只出现在武器）");
return null;
}
var v=(typeof l.val==="number")? l.val: parseVal(l.val);
if(v==null||!isFinite(v)||v<0) return null;
return {key:key, val:v};
}
function sanitizeGearData(raw){
var warnings=[];
if(raw&&Array.isArray(raw.warnings)) raw.warnings.forEach(function(w){ if(typeof w==="string"&&w) warnings.push(w); });
/* 第 40 节：部位归一——主武器 / 副武器一律并入「武器」池（旧存档 / 旧导出 / 导入数据同此口径） */
var gslot=raw? gearSlotOf(raw.slot): null;
if(gslot==null) gslot=(raw&&raw.slot!=null)? String(raw.slot): "";
var lines=[];
if(raw&&Array.isArray(raw.lines)) raw.lines.forEach(function(l){ var sl=sanitizeLineData(l, gslot, warnings); if(sl) lines.push(sl); });
lines=lines.slice(0,8);
/* 流派标签（第 38 节上线、第 39 节换标尺）：只有武器有；新数据存 schools（流派数组）。
   载入时合并新旧两字段过 sanitizeSchoolTags：第 38 节的旧 wuxue（武学数组）按武学->流派映射展开迁移，认不出的值丢弃。
   标签为空且原始定音名能推导出流派时自动补标（只补空缺、不覆盖已选）；
   定音本身在武器上多为左池类型、未必留得住，故从原始定音名推导 */
var schools=[];
if(isWeaponSlot(gslot)){
var rawTags=[];
if(raw&&Array.isArray(raw.schools)) rawTags=rawTags.concat(raw.schools);
if(raw&&Array.isArray(raw.wuxue)) rawTags=rawTags.concat(raw.wuxue);
schools=sanitizeSchoolTags(rawTags);
if(!schools.length&&raw&&raw.dingyin){
schools=schoolTagsFromDingyinName(raw.dingyin.name||raw.dingyin.type||"");
}
}
return {gear:{id:(raw&&typeof raw.id==="number")? raw.id: null, slot:gslot, name:raw&&raw.name!=null? String(raw.name): "", lines:lines, dingyin:raw? sanitizeDingyin(raw.dingyin, gslot): null, schools:schools, warnings:warnings}, warnings:warnings};
}
function normalizeGearList(rawList){
var out=[], seen={}, firstMap={}, usedMax=0;
(Array.isArray(rawList)? rawList: []).forEach(function(raw){
if(!raw||gearSlotOf(raw.slot)==null||!Array.isArray(raw.lines)) return;
var g=sanitizeGearData(raw).gear;
var oldId=(typeof raw.id==="number"&&isFinite(raw.id))? Math.floor(raw.id): null;
var assigned=null;
if(oldId!=null&&oldId>0&&!seen[oldId]) assigned=oldId;
else { assigned=usedMax+1; while(seen[assigned]) assigned++; }
seen[assigned]=1; if(assigned>usedMax) usedMax=assigned;
if(oldId!=null&&firstMap[oldId]==null) firstMap[oldId]=assigned;
g.id=assigned; out.push(g);
});
nextId=usedMax+1;
return {list:out, firstMap:firstMap};
}
function remapIdMap(obj, firstMap){
var out={};
if(!obj) return out;
Object.keys(obj).forEach(function(k){ var nid=firstMap[obj[k]]; if(nid!=null) out[k]=nid; });
return out;
}
/* 武学天赋（满需求口径，不做达成率缩放）：本系属攻统一 小328/大656，另加各行数值 */
var TALENT_ROWS={
"鸣金虹":{xiao:0,da:129.9,acc:0,crit:0,"int":7.5},
"鸣金影":{xiao:0,da:129.9,acc:0,crit:0,"int":7.5},
"裂石威":{xiao:129.9,da:129.9,acc:0,crit:0,"int":0},
"裂石钧":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"牵丝玉":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"牵丝翊":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"破竹尘":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"破竹风":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"破竹鸢":{xiao:129.9,da:0,acc:0,crit:15,"int":0},
"破竹樽":{xiao:129.9,da:0,acc:0,crit:15,"int":0}
};
var BASE_SCHOOLS=[
{display:"鸣金-虹", talent:"鸣金虹", note:""},
{display:"鸣金-影", talent:"鸣金影", note:""},
{display:"裂石-威", talent:"裂石威", note:""},
{display:"裂石钧（唐/陌）", talent:"裂石钧", note:"裂石-唐 / 裂石钧-唐 / 裂石钧-陌 近似按裂石钧计"},
{display:"裂石-唐", talent:"裂石钧", note:"近似按裂石钧计"},
{display:"牵丝-玉", talent:"牵丝玉", note:""},
{display:"牵丝·翊", talent:"牵丝翊", note:"按牵丝翊行计"},
{display:"牵丝-霖", talent:null, note:"暂无对应天赋数据，不自动加"},
{display:"破竹-尘", talent:"破竹尘", note:""},
{display:"破竹-风", talent:"破竹风", note:""},
{display:"破竹-鸢", talent:"破竹鸢", note:""},
{display:"破竹-樽", talent:"破竹樽", note:""}
];
var BUILD_SCHOOL_DISPLAY={"鸣金-虹":"鸣金-虹","鸣金-影":"鸣金-影","裂石-威":"裂石-威","裂石钧-唐":"裂石钧（唐/陌）","裂石钧-陌":"裂石钧（唐/陌）","裂石-唐":"裂石-唐","裂石-钧（易水歌）":"裂石钧（唐/陌）","牵丝-玉（飞天）":"牵丝-玉","牵丝-玉（走地）":"牵丝-玉","牵丝-霖（纯奶）":"牵丝-霖","牵丝-霖（火拳）":"牵丝-霖","牵丝·翊":"牵丝·翊","破竹-鸢":"破竹-鸢","破竹-樽":"破竹-樽","破竹-尘":"破竹-尘","破竹-风":"破竹-风"};
function talentForSchoolDisplay(disp){
for(var i=0;i<BASE_SCHOOLS.length;i++){ if(BASE_SCHOOLS[i].display===disp) return BASE_SCHOOLS[i]; }
return null;
}
/* 武学天赋·属性缩放节点（第 24 节定案 + 第 25 节补鸣金 / 裂石-威，均为站长 100 阶实测）：模板适用于「会心流派」——目标配方 cat 含「会心」（大外会心 / 小外会心）即挂模板两节点；
   裂石-威为例外：无会心率节点，其天赋只有大外一节点、走 bySchool（talentNodesFor 中 bySchool 优先于 exclude 与模板，是威的唯一天赋来源，绝不叠模板）；
   鸣金-虹 / 鸣金-影（cat=大外会意）走 bySchool：会意 +4.6、大外 +79.2，均基于劲、300 封顶；裂石-威大外 +79.2 基于体或劲的较大值（stat="maxTiJin"）、300 封顶。
   节点值 = val × min(总属性/need, 1)，总属性口径与面板折算同（基础+装备）。 */
var TALENT={
template:[{apply:"crit", stat:"min", need:300, val:9.1},{apply:"xiaowai", stat:"min", need:300, val:79.2}],
exclude:{"裂石-威":true},
bySchool:{
"鸣金-虹":[{apply:"int", stat:"jin", need:300, val:4.6},{apply:"dawai", stat:"jin", need:300, val:79.2}],
"鸣金-影":[{apply:"int", stat:"jin", need:300, val:4.6},{apply:"dawai", stat:"jin", need:300, val:79.2}],
"裂石-威":[{apply:"dawai", stat:"maxTiJin", need:300, val:79.2}]
}
};
function talentNodesFor(build){
if(!build) return [];
if(TALENT.bySchool && TALENT.bySchool[build.school]) return TALENT.bySchool[build.school];
if(TALENT.exclude && TALENT.exclude[build.school]) return [];
return (build.cat && build.cat.indexOf("会心")>-1)? TALENT.template: [];
}
function talentText(rowName){
var t=TALENT_ROWS[rowName]; if(!t) return "";
var parts=["本系属攻 小 328 / 大 656"];
if(t.da) parts.push("大外 "+t.da);
if(t.xiao) parts.push("小外 "+t.xiao);
if(t.crit) parts.push("会心 "+t.crit+"%");
if(t["int"]) parts.push("会意 "+t["int"]+"%");
if(t.acc) parts.push("精准 "+t.acc+"%");
return parts.join("、");
}
/* 心法表（满重加成）：shu=属攻{sys,xiao,da}，sysPierce=属攻穿透，shuBonus=属攻加成，pierce=外功穿透，critDmg/intDmg=会心/会意伤害 */
var XINFA=[
{n:"千营一呼", crit:15, dmg:2.8},
{n:"易水歌", xiao:43.4, da:86.8, dcrit:4.6},
{n:"征人归", xiao:117.1, pierce:5.1},
{n:"断石之构", acc:12, dcrit:4.1},
{n:"绳舟行木", xiao:117.1, pierce:5.1},
{n:"大唐歌", acc:12, critDmg:4},
{n:"极乐泣血", da:104.1, critDmg:3.5},
{n:"心弥泥鱼", xiao:117.1, pierce:5.1},
{n:"忘川绝响", crit:15, critDmg:4.4},
{n:"花上月令", crit:15, dcrit:4.6},
{n:"剑气纵横", da:130.1, dint:2.3},
{n:"明晦同尘", xiao:39, da:78, pierce:5.1},
{n:"所恨年年", acc:12, dmg:2.5},
{n:"山河绝韵", crit:15, critDmg:4.4},
{n:"威猛歌", "int":6.7, intDmg:5.2},
{n:"无名剑法", da:121.3, dint:2.3},
{n:"千山法", shu:{sys:"鸣金",xiao:22.1,da:44.3}, sysPierce:{sys:"鸣金",v:6}},
{n:"逐狼心经", "int":6.7, intDmg:5.2},
{n:"纵地摘星", xiao:39, da:78, pierce:5.1},
{n:"春雷篇", xiao:39, da:78, dmg:2.5},
{n:"霜天百夜", xiao:130.1, dcrit:4.6},
{n:"孤忠不辞", crit:13.5, critDmg:4},
{n:"穿喉决", shu:{sys:"裂石",xiao:22.1,da:44.3}, sysPierce:{sys:"裂石",v:6}},
{n:"抗造大法", shu:{sys:"裂石",xiao:22.1,da:44.3}, sysPierce:{sys:"裂石",v:6}},
{n:"移经易武", shu:{sys:"鸣金",xiao:0,da:66.4}, shuBonus:{sys:"鸣金",v:3}},
{n:"扶摇直上", xiao:130.1, dcrit:4.6},
{n:"擒天势", crit:13.5, critDmg:4},
{n:"三穷致知", xiao:39, da:78, dmg:2.5},
{n:"君臣药", crit:15, dcrit:4.6},
{n:"凝神章", xiao:39, da:78, pierce:5.1},
{n:"相和歌", xiao:130.1, dcrit:4.6},
{n:"弦墨篇", xiao:39, da:78, dmg:2.5},
{n:"风知意", crit:13.5, critDmg:4},
{n:"四时无常", xiao:43.4, da:86.8, dmg:2.8},
{n:"一醉千秋", xiao:130.1, dcrit:4.6},
{n:"飞仙醉言", crit:13.5, critDmg:4},
{n:"燕别云岫", xiao:39, da:78, dmg:2.5},
{n:"大卷微身", shu:{sys:"无相",xiao:22.1,da:44.3}, sysPierce:{sys:"无相",v:6}}
];
var XINFA_BY_NAME={};
XINFA.forEach(function(x){ XINFA_BY_NAME[x.n]=x; });
function xinfaSummary(){
var prefix="bA_xf";
var s={xiao:0,da:0,acc:0,crit:0,"int":0,dcrit:0,dint:0,dmg:0,shuXiao:0,shuDa:0,pierce:0,critDmg:0,intDmg:0,notes:[],picked:[],duplicates:[]};
var seen={};
for(var i=0;i<4;i++){
var sel=$(prefix+i); if(!sel||!sel.value) continue;
var x=XINFA_BY_NAME[sel.value]; if(!x) continue;
if(seen[x.n]){ s.duplicates.push(x.n); continue; }
seen[x.n]=1;
s.picked.push(x.n);
s.xiao+=x.xiao||0; s.da+=x.da||0; s.acc+=x.acc||0; s.crit+=x.crit||0; s["int"]+=x["int"]||0;
s.dcrit+=x.dcrit||0; s.dint+=x.dint||0; s.dmg+=x.dmg||0;
s.pierce+=x.pierce||0; s.critDmg+=x.critDmg||0; s.intDmg+=x.intDmg||0;
if(x.shu){ s.shuXiao+=x.shu.xiao||0; s.shuDa+=x.shu.da||0; s.notes.push(x.n+"："+x.shu.sys+"属攻 小 "+(x.shu.xiao||0)+" / 大 "+(x.shu.da||0)+"（已计入本系属攻合计，玩其他系时请自行甄别）"); }
if(x.sysPierce) s.notes.push(x.n+"："+x.sysPierce.sys+"穿透 "+x.sysPierce.v+"（面板未单列，仅备注）");
if(x.shuBonus) s.notes.push(x.n+"："+x.shuBonus.sys+"属攻加成 "+x.shuBonus.v+"%（面板未单列，仅备注）");
}
if(s.duplicates.length) s.notes.push("重复心法未重复计入："+s.duplicates.join("、"));
if(s.pierce) s.notes.push("心法外功穿透合计 "+fmt(s.pierce,1)+"（面板未单列，仅备注）");
if(s.critDmg) s.notes.push("心法会心伤害合计 "+fmt(s.critDmg,1)+"%（仅备注）");
if(s.intDmg) s.notes.push("心法会意伤害合计 "+fmt(s.intDmg,1)+"%（仅备注）");
return s;
}
function zeroBase(){ return {ti:0,jin:0,yu:0,min:0,shi:0,xiaowai:0,dawai:0,acc:0,crit:0,"int":0,dcrit:0,dint:0,hp:0,shuXiao:0,shuDa:0,wkXiao:0,wkDa:0,wkShuXiao:0,wkShuDa:0,wkHp:0,wxXiao:0,wxDa:0,dmg:0,shuDmg:0,notes:""}; }
function getBase(){
var z=zeroBase();
BASE_FIELDS.forEach(function(f){ var v=num("bA_"+f); if(f==="xiao") z.xiaowai=v; else if(f==="da") z.dawai=v; else z[f]=v; });
/* 武库字段缺失（旧存档 / 旧导出未带、输入为空）时回退预设而不是 0——旧口径里武库已含在底子中，读 0 会少算一整份武库；显式填 0 则照 0 计 */
WK_FIELDS.forEach(function(f){ var el=$("bA_"+f); var raw=el? el.value: null; if(raw==null||raw===""||!isFinite(parseFloat(raw))) z[f]=BASE_PRESET[f]||0; });
/* 无相底子同理：输入缺失 / 为空时回退预设 26（旧存档没有这两个字段，读 0 会把账号底子整份漏掉） */
WX_FIELDS.forEach(function(f){ var el=$("bA_"+f); var raw=el? el.value: null; if(raw==null||raw===""||!isFinite(parseFloat(raw))) z[f]=BASE_PRESET[f]||0; });
var xf=xinfaSummary();
z.xiaowai+=xf.xiao; z.dawai+=xf.da; z.acc+=xf.acc; z.crit+=xf.crit; z["int"]+=xf["int"];
z.dcrit+=xf.dcrit; z.dint+=xf.dint; z.dmg+=xf.dmg; z.shuXiao+=xf.shuXiao; z.shuDa+=xf.shuDa;
z.notes=xf.notes.join("；");
return z;
}
/* 基础字段锁定：默认锁定只读（显示预设值）；点锁解锁可改，重新锁定保留已改值；与预设不同标「已改」 */
function baseFieldChanged(f){ return Math.abs(num("bA_"+f)-(BASE_PRESET[f]||0))>1e-9; }
function refreshBaseMods(){
var modCount=0;
BASE_FIELDS.forEach(function(f){
var inp=$("bA_"+f); if(!inp) return;
var ch=baseFieldChanged(f);
if(ch) modCount++;
if(inp.classList){ if(ch) inp.classList.add("mod"); else inp.classList.remove("mod"); }
var tag=baseModTags[f]; if(tag) tag.style.display=ch? "": "none";
});
var bm=$("baseModMark");
if(bm){ bm.textContent=modCount? ("已改 "+modCount+" 项"): ""; bm.style.display=modCount? "": "none"; }
}
function setBaseLock(f, unlocked){
baseUnlocked[f]=!!unlocked;
var inp=$("bA_"+f); if(inp) inp.readOnly=!unlocked;
var btn=baseLockBtns[f];
if(btn){ btn.textContent=unlocked? "🔓": "🔒"; if(unlocked) btn.classList.add("open"); else btn.classList.remove("open"); btn.title=unlocked? "点击重新锁定（保留已改的值）": "点击解锁修改"; btn.setAttribute("aria-label", btn.title); btn.setAttribute("aria-pressed", String(unlocked)); }
}
function toggleBaseLock(f){ setBaseLock(f, !baseUnlocked[f]); }
function setupBaseLocks(){
BASE_FIELDS.forEach(function(f){
var inp=$("bA_"+f); if(!inp) return;
inp.readOnly=true; baseUnlocked[f]=false;
var parent=inp.parentNode; if(!parent) return;
var btn=document.createElement("button");
btn.type="button"; btn.className="lockbtn"; btn.setAttribute("data-lock", f);
btn.addEventListener("click", function(){ toggleBaseLock(f); });
parent.appendChild(btn);
baseLockBtns[f]=btn;
var lbl=parent.querySelector? parent.querySelector("label"): null;
if(lbl){ var tag=document.createElement("span"); tag.className="modtag"; tag.textContent="已改"; tag.style.display="none"; lbl.appendChild(tag); baseModTags[f]=tag; }
setBaseLock(f, false);
});
refreshBaseMods();
}
function resetBaseToPreset(){
BASE_FIELDS.forEach(function(f){ var el=$("bA_"+f); if(el) el.value=BASE_PRESET[f]; });
refreshBaseMods();
}
/* 恢复预设：站内确认弹窗（不用原生 confirm） */
function openResetModal(){
var m=$("resetModal"); if(!m) return;
m.classList.add("open");
var c=$("btnResetCancel"); if(c&&c.focus) c.focus();
}
function closeResetModal(){
var m=$("resetModal"); if(!m) return;
m.classList.remove("open");
}
/* 截图示例图：站内弹窗（点问号打开，点遮罩 / 关闭按钮 / Esc 关闭） */
function openOcrExampleModal(){
var m=$("ocrExampleModal"); if(!m) return;
m.classList.add("open");
var c=$("btnOcrExampleClose"); if(c&&c.focus) c.focus();
}
function closeOcrExampleModal(){
var m=$("ocrExampleModal"); if(!m) return;
m.classList.remove("open");
}
/* 进站欢迎弹窗（第 34 节，站长口径：只弹第一次）：首访自动弹，图运行时从 #ocrExampleImg 复用同一份内嵌图（不嵌第二份）；关闭即记「已看」，之后靠问号看 */
var OCR_WELCOME_KEY="ocrWelcomeSeen";
var ocrWelcomeShown=false; /* 本会话已弹过：localStorage 读不到 / 写不进时的兜底 */
function ocrWelcomeSeen(){
if(ocrWelcomeShown) return true;
try{ return !!localStorage.getItem(OCR_WELCOME_KEY); }catch(e){ return false; }
}
function markOcrWelcomeSeen(){
ocrWelcomeShown=true;
try{ localStorage.setItem(OCR_WELCOME_KEY, "1"); }catch(e){}
}
function openOcrWelcomeModal(){
var m=$("ocrWelcomeModal"); if(!m) return;
var srcEl=$("ocrExampleImg"), dstEl=$("ocrWelcomeImg");
if(srcEl&&dstEl&&!dstEl.src&&srcEl.src) dstEl.src=srcEl.src;
m.classList.add("open");
var c=$("btnOcrWelcomeClose"); if(c&&c.focus) c.focus();
}
function closeOcrWelcomeModal(){
var m=$("ocrWelcomeModal"); if(!m) return;
if(!m.classList.contains("open")) return;
m.classList.remove("open");
markOcrWelcomeSeen();
}
function maybeOpenOcrWelcome(){
if(ocrWelcomeSeen()) return;
ocrWelcomeShown=true;
openOcrWelcomeModal();
}
function collectBaseState(){
var values={};
BASE_FIELDS.forEach(function(f){ values[f]=num("bA_"+f); });
var xf=[];
for(var i=0;i<4;i++){ var s=$("bA_xf"+i); xf.push(s? s.value: ""); }
return {v:BASE_STATE_VER, values:values, xf:xf};
}
function applyBaseState(d){
if(!d) return;
var values=null, xf=null;
if(d.values&&typeof d.values==="object"){ values=d.values; xf=Array.isArray(d.xf)? d.xf: []; }
else if(d.mode==="B"){
/* 旧「模式B」存档迁移：旧口径 = 手填部分 + 流派天赋自动加成 + 心法。把手填与天赋折算成当前基础值（与旧面板等效，与预设不同处会标「已改」），心法沿用旧 B 的选择；state.mode 从此忽略。 */
values={};
BASE_FIELDS.forEach(function(f){ values[f]=(d.b&&d.b[f]!=null&&isFinite(+d.b[f]))? +d.b[f]: 0; });
var school=d.school||""; if(school==="牵丝-翎") school="牵丝·翊";
var scB=talentForSchoolDisplay(school);
if(scB&&scB.talent&&TALENT_ROWS[scB.talent]){
var t=TALENT_ROWS[scB.talent];
values.xiao+=t.xiao||0; values.da+=t.da||0; values.acc+=t.acc||0; values.crit+=t.crit||0; values["int"]+=t["int"]||0;
values.shuXiao+=328; values.shuDa+=656;
}
xf=Array.isArray(d.xfB)? d.xfB: (Array.isArray(d.xf)? d.xf: []);
}
else { values=(d.a&&typeof d.a==="object")? d.a: {}; xf=Array.isArray(d.xfA)? d.xfA: []; }
BASE_FIELDS.forEach(function(f){ var el=$("bA_"+f); if(el&&values[f]!=null&&isFinite(+values[f])) el.value=+values[f]; });
/* 武库字段在旧存档 / 旧导出（v2/v4）里不存在：回填预设，避免导入后武库整份丢失（模式 B 分支已把缺失字段补 0，不走此处） */
WK_FIELDS.forEach(function(f){ if(values[f]==null||!isFinite(+values[f])){ var el=$("bA_"+f); if(el) el.value=BASE_PRESET[f]; } });
/* 无相底子字段（第 35 节新增）在旧存档 / 旧导出里不存在：同武库口径回填预设 26（模式 B 分支已把缺失字段补 0，不走此处） */
WX_FIELDS.forEach(function(f){ if(values[f]==null||!isFinite(+values[f])){ var el=$("bA_"+f); if(el) el.value=BASE_PRESET[f]; } });
for(var xi2=0;xi2<4;xi2++){ var sx0=$("bA_xf"+xi2); if(sx0) sx0.value=""; }
if(xf) xf.forEach(function(v,i){ var s=$("bA_xf"+i); if(s) s.value=(v==="牵丝-翎")? "牵丝·翊": (v||""); });
refreshBaseMods();
refreshNeedPick();
}
function updateBaseUI(){ refreshBaseMods(); updateBaseSummary(); }
function updateBaseSummary(){
var el=$("bA_summary"); if(!el) return;
var b=getBase();
var xf=xinfaSummary();
var changed=BASE_FIELDS.filter(function(f){ return baseFieldChanged(f); });
var parts=[];
parts.push("心法："+(xf.picked.length? esc(xf.picked.join("、")) : "未选"));
if(xf.duplicates.length) parts.push('<span class="diff-lack">重复心法只计一次：'+esc(xf.duplicates.join("、"))+"</span>");
if(changed.length) parts.push('<span style="color:var(--gold);font-weight:700">已改字段：'+changed.map(function(f){ return esc(BASE_FIELD_LABELS[f]||f); }).join("、")+"</span>");
el.innerHTML="<b>基础合计</b>：五维 体 "+fmt(b.ti,0)+" / 劲 "+fmt(b.jin,0)+" / 御 "+fmt(b.yu,0)+" / 敏 "+fmt(b.min,0)+" / 势 "+fmt(b.shi,0)
+"｜小外 "+fmt(b.xiaowai,1)+"｜大外 "+fmt(b.dawai,1)+"｜气血 "+fmt(b.hp,0)
+"｜本系属攻 小 "+fmt(b.shuXiao,1)+" / 大 "+fmt(b.shuDa,1)
+"｜武库 小外 "+fmt(b.wkXiao||0,1)+" / 大外 "+fmt(b.wkDa||0,1)+" / 属攻 小 "+fmt(b.wkShuXiao||0,1)+" / 大 "+fmt(b.wkShuDa||0,1)+" / 气血 "+fmt(b.wkHp||0,0)
+"｜无相底子 小 "+fmt(b.wxXiao||0,1)+" / 大 "+fmt(b.wxDa||0,1)
+"｜精准 "+fmt(b.acc,2)+"% / 会心 "+fmt(b.crit,2)+"% / 会意 "+fmt(b["int"],2)+"%"
+"｜直接会心 "+fmt(b.dcrit,1)+"% / 直接会意 "+fmt(b.dint,1)+"%"
+"｜外功伤害加成 "+fmt(b.dmg,1)+"% / 属攻伤害加成 "+fmt(b.shuDmg,1)+"%"
+"<br>"+parts.join(" · ")
+(b.notes? "<br>备注："+esc(b.notes):"");
}

/* ================= 状态 + localStorage 持久化 ================= */
var STORE_KEY="gear-planner-100-v2";
var lib=[], loadout={}, schemes=[], nextId=1, targetIdx=0, libFilterVal="all";
var gradDingyinOn=true; /* 第 41 节：定音是否计入毕业度（总分旁勾选，默认计入；存档字段 gradDy，旧存档无此字段默认计入） */
var bowJueBySchool={}, bowJueKind="";
var bowConfirmedBySchool={};
var schoolConfirmed=false;
var gSlotConfirmed=false; /* 手动表单部位待确认：新建/重置后亮，change 后灭 */
var ocrSlotPending=false, ocrDyPending=false; /* OCR 核对表单待确认：载入时亮，change 后灭 */
var editingGearId=null; /* 装备库编辑中的装备 id（原地更新） */
var simTierById={};
function targetSchoolKey(){ return BUILDS[targetIdx]? BUILDS[targetIdx].school: ""; }
function applyBowForTarget(){
bowJueKind=bowJueBySchool[targetSchoolKey()]||"";
var sel=$("bowSelect"); if(sel) sel.value=bowJueKind;
updateBowHint();
refreshNeedPick();
}
/* 待选高亮：不选就会算不准的选择控件，未完成时标 .need-pick（印章红描边+光晕），选好自动恢复；不影响任何计算 */
function setNeedPick(el, on){ if(!el||!el.classList) return; if(on) el.classList.add("need-pick"); else el.classList.remove("need-pick"); }
function refreshNeedPick(){
for(var i=0;i<4;i++){ var xs=$("bA_xf"+i); setNeedPick(xs, !!(xs&&!xs.value)); }
setNeedPick($("bowSelect"), !bowConfirmedBySchool[targetSchoolKey()]);
setNeedPick($("targetSelect"), !schoolConfirmed);
/* 表单高亮最终口径：手动表单只亮部位（待确认）；OCR 表单亮部位 + 定音（待确认）；手动定音不亮 */
setNeedPick($("gSlot"), !gSlotConfirmed);
setNeedPick($("ocrSlot"), ocrSlotPending);
setNeedPick($("ocrDingyinType"), ocrDyPending);
}
function updateBowHint(){
var h=$("bowHint"); if(!h) return;
var rec=recommendBowLabel(BUILDS[targetIdx]);
var sel=$("bowSelect")? $("bowSelect").value: bowJueKind;
var bv=BOW_JUE_VALUES[sel];
var eff="";
if(bv){ eff=bv.acc>0? "白字精准 +"+bv.acc: (bv.crit>0? "白字会心 +"+bv.crit: "白字会意 +"+bv["int"]); }
var parts=[];
if(rec) parts.push("本流派推荐："+rec+"（仅提示，不影响你的选择）");
if(bv) parts.push("当前"+bv.label+"："+eff);
h.textContent=parts.join(" · ");
}
function setTarget(i){
if(!BUILDS[i]) return;
var prevDyInfo=buildDingyinInfo(BUILDS[targetIdx]);
targetIdx=i;
var ts=$("targetSelect"); if(ts) ts.value=String(i);
applyBowForTarget();
refreshDingyinForms(prevDyInfo);
refreshNeedPick();
}
var THEME_KEY="gp-theme";
var THEMES=["heijin","xuanzhi","dailan","fennen"];
function applyTheme(name){
if(THEMES.indexOf(name)<0) name="heijin";
var de=document.documentElement; if(de&&de.setAttribute) de.setAttribute("data-theme", name);
try{ localStorage.setItem(THEME_KEY, name); }catch(e){}
if(document.querySelectorAll){ document.querySelectorAll(".tdot").forEach(function(d){ d.classList.toggle("on", d.getAttribute("data-theme-set")===name); }); }
}
function saveStore(){
try{
localStorage.setItem(STORE_KEY, JSON.stringify({lib:lib, loadout:loadout, targetIdx:targetIdx, schemes:schemes, base:collectBaseState(),
extras:{res:num("inRes")||1.85, acc:num("extraAcc"), crit:num("extraCrit"), int:num("extraInt"), bowJue:bowJueKind},
bowJue:{kind:bowJueKind, bySchool:bowJueBySchool, confirmed:bowConfirmedBySchool}, schoolConfirmed:schoolConfirmed, sim:simTierById, gradDy:gradDingyinOn}));
return true;
}catch(e){ toast("保存失败：存储已满或不可用"); return false; }
}
function loadStore(){
try{
var raw=localStorage.getItem(STORE_KEY); if(!raw) return;
var d=JSON.parse(raw); if(!d) return;
var norm=normalizeGearList(d.lib);
lib=norm.list;
loadout=remapIdMap(d.loadout, norm.firstMap);
if(typeof d.targetIdx==="number"&&BUILDS[d.targetIdx]) targetIdx=d.targetIdx;
gradDingyinOn=(d.gradDy===false)? false: true; /* 旧存档无 gradDy → 默认计入定音 */
if(d.schoolConfirmed) schoolConfirmed=true;
if(d.sim&&typeof d.sim==="object"){ Object.keys(d.sim).forEach(function(k){ var nid=norm.firstMap[k]; var tv=d.sim[k]; if(nid!=null&&(tv==="cy"||tv==="max")) simTierById[nid]=tv; }); }
if(Array.isArray(d.schemes)) schemes=d.schemes.filter(function(sc){ return sc&&typeof sc==="object"; }).map(function(sc){ var c={}; Object.keys(sc).forEach(function(k){ c[k]=sc[k]; }); c.loadout=remapIdMap(sc.loadout, norm.firstMap); return c; });
if(d.extras){ $("inRes").value=d.extras.res||1.85; $("extraAcc").value=extraFromData(d.extras,"extraAcc","acc"); $("extraCrit").value=extraFromData(d.extras,"extraCrit","crit"); $("extraInt").value=extraFromData(d.extras,"extraInt","int"); }
if(d.bowJue&&d.bowJue.bySchool&&typeof d.bowJue.bySchool==="object"){ Object.keys(d.bowJue.bySchool).forEach(function(k){ var v=d.bowJue.bySchool[k]; if(BOW_JUE_VALUES[v]) bowJueBySchool[k]=v; }); }
if(d.bowJue&&d.bowJue.confirmed&&typeof d.bowJue.confirmed==="object"){ Object.keys(d.bowJue.confirmed).forEach(function(k){ if(d.bowJue.confirmed[k]) bowConfirmedBySchool[k]=true; }); }
else if(d.extras&&BOW_JUE_VALUES[d.extras.bowJue]) bowJueBySchool[targetSchoolKey()]=d.extras.bowJue;
/* 旧存档迁移：只有旧「弓诀」名字、没有按流派弓选择时，按名字迁到当前流派（精准->精准弓 / 会心->会心弓 / 会意->会意弓 / 会心/精准->会心弓） */
if(!Object.keys(bowJueBySchool).length&&d.extras&&d.extras.bow){ var lkLoad=bowKindFromLegacyName(d.extras.bow); if(lkLoad) bowJueBySchool[targetSchoolKey()]=lkLoad; }
applyBowForTarget();
if(d.base){ try{
if(d.base.v===BASE_STATE_VER){ applyBaseState(d.base); }
else {
/* 第 24 节存档迁移（仅此一次）：旧版本地存档的 base 没有版本标记，其 da/xiao/hp/shu 是把武库算进底子的污染值，
   不能直接叠加新武库字段（会双算）——base 整体重置为新预设（已改标记随之清除），心法选择保留；
   本次载入后任何一次保存都会写入新版本标记，不再重复重置。导入的旧导出文件不走此路（走 applyBaseState 的武库回填）。 */
var keepXf=Array.isArray(d.base.xf)? d.base.xf: (Array.isArray(d.base.xfA)? d.base.xfA: (Array.isArray(d.base.xfB)? d.base.xfB: []));
resetBaseToPreset();
for(var xi9=0;xi9<4;xi9++){ var sx9=$("bA_xf"+xi9); if(sx9) sx9.value=(keepXf[xi9]==="牵丝-翎")? "牵丝·翊": (keepXf[xi9]||""); }
refreshBaseMods(); refreshNeedPick();
}
}catch(e){} }
}catch(e){}
}
function findGear(id){ for(var i=0;i<lib.length;i++){ if(lib[i].id===id) return lib[i]; } return null; }
function isEquipped(id){ for(var s in loadout){ if(loadout[s]===id) return true; } return false; }
function gearCounts(g){ var c={}; g.lines.forEach(function(l){ c[l.key]=(c[l.key]||0)+1; }); return c; }
function lineValueScore(l){ var a=AFFIX_BY_KEY[l&&l.key]; if(!a) return 0; var v=(typeof l.val==="number")? l.val: parseVal(l.val); if(v==null||!isFinite(v)||v<0) return 0; return Math.min(1,v/a.cy); }
function lineQualityPct(l){ var a=AFFIX_BY_KEY[l&&l.key]; if(!a) return null; var v=(typeof l.val==="number")? l.val: parseVal(l.val); if(v==null||!isFinite(v)||v<0) return null; return v/a.max*100; }
function gearQuality(g){ if(!g.lines.length) return 0; var s=0; g.lines.forEach(function(l){ s+=lineValueScore(l); }); return s/g.lines.length; }
/* ================= 第 44 节：单件评分新口径（站长 2026-10-23 定版） =================
   score = round( (60 × coreFrac + 40 × Q) × linesFactor )
   - coreFrac：核心门槛凑齐比例（核心固定 3 条）。核心不写死模板——由 coreOf44 从部位版位表
     （SLOTS_BIG / SLOTS_SMALL）按统一规则推导：按该部位词条位顺序（位1→位5）依次取、跳过属攻位
     （无相 / 本属），凑满 3 条为止。固定类别位记该类；选择位含本流派家族主五维（小外族 min / 大外族 jin）
     时记主五维，否则记「任一选项」条目；三率位记 1 条额度（RATE 条目）。
     推导夹具（回归测试锁死）：武器/环/佩 小外 {xiaowai×2,min}、大外 {dawai×2,jin}；
     胫甲/腕甲 小外 {RATE,xiaowai,min}、大外 {jin×2,dawai}；冠胄/胸甲 {RATE，外功，主五维}（大小外同构）。
   - RATE 条目计数口径：类别为精准 jingzhun 或本 build 标志三率（cat 含会心→huixin、含会意→huiyi）
     任一即得额度，一件里多条三率也只记 1 条。
   - Q：该件全部「配方内类别」词条（含核心条本身）的 lineValueScore 按配方条数加权平均
     （权重 = 该类在 build.targets 的条数；flex 组成员各按整组条数计权；shugong 按配方 shugong 条数、
     裂石-威高级版的大裂石独立类按其条数）；无任何配方内词条时 Q = 0。
   - linesFactor = min(1, 有效词条数 / 5)，有效词条沿用旧口径（有数值、非武器部位的无相不计）。
   - 核心按 effectiveClassOf 后的类别计数；数值达成沿用 lineValueScore（承音口径、不看等阶）。 */
var CORE44_NAME2KEY = {"大外":"dawai","小外":"xiaowai","劲":"jin","敏":"min","势":"shi","体":"ti","御":"yu","全武学":"quanwu","首领":"shouling","玩家":"wanjia","全奇术":"quanqi","增伤":"wuqizeng","武器增效":"wuqizeng"};
function core44IsShuToken(tok){ return tok.indexOf("无相")>-1||tok.indexOf("本属")>-1||tok==="属攻"; }
function core44SingleUnit(tok){
if(tok==="三率") return {rate:true};
var k=CORE44_NAME2KEY[tok];
return k? {cls:k}: null;
}
/* 选择位推导：剔除属攻选项后，含家族主五维记主五维；只剩一个选项记该选项；含三率记 RATE；其余记任一选项条目 */
function core44ChoiceUnit(tok, mainStat){
var parts=tok.split("/").map(function(s){ return s.replace(/\s+/g,""); }).filter(function(p){ return p&&!core44IsShuToken(p); });
if(!parts.length) return null;
for(var i=0;i<parts.length;i++){ if(CORE44_NAME2KEY[parts[i]]===mainStat) return {cls:mainStat}; }
if(parts.length===1) return core44SingleUnit(parts[0]);
if(parts.indexOf("三率")>-1) return {rate:true};
var anyOf=[];
parts.forEach(function(p){ var u=core44SingleUnit(p); if(u&&u.cls) anyOf.push(u.cls); });
return anyOf.length? {anyOf:anyOf}: null;
}
var core44Cache={};
function coreOf44(slot, build){
var gs=gearSlotOf(slot);
var cat=(build&&build.cat)||"";
var fam=cat.indexOf("小外")===0? "small": (cat.indexOf("大外")===0? "big": null);
if(!gs||!fam) return [];
var cacheKey=gs+"|"+fam;
if(core44Cache[cacheKey]) return core44Cache[cacheKey];
var table=(fam==="small")? SLOTS_SMALL: SLOTS_BIG;
var row=null;
for(var i=0;i<table.length;i++){ if(table[i].slot===gs){ row=table[i]; break; } }
var mainStat=(fam==="small")? "min": "jin";
var out=[], total=0;
if(row){
for(var j=0;j<row.lines.length&&total<3;j++){
var tok=String(row.lines[j]).replace(/\s+/g,"");
if(!tok||core44IsShuToken(tok)) continue;
var unit=(tok.indexOf("/")>-1)? core44ChoiceUnit(tok, mainStat): core44SingleUnit(tok);
if(!unit) continue;
var merged=false;
for(var m=0;m<out.length;m++){
var e=out[m];
if((unit.cls&&e.cls===unit.cls)||(unit.rate&&e.rate)||(unit.anyOf&&e.anyOf&&e.anyOf.join("|")===unit.anyOf.join("|"))){ e.n++; merged=true; break; }
}
if(!merged){ var nu={n:1}; if(unit.cls) nu.cls=unit.cls; if(unit.rate) nu.rate=true; if(unit.anyOf) nu.anyOf=unit.anyOf; out.push(nu); }
total++;
}
}
core44Cache[cacheKey]=out;
return out;
}
function gearScoreCoreFrac44(g, build, valid){
var cores=coreOf44(g.slot, build);
if(!cores.length) return 0;
var cat=(build&&build.cat)||"";
var rateSet={jingzhun:true};
if(cat.indexOf("会心")>-1) rateSet.huixin=true;
if(cat.indexOf("会意")>-1) rateSet.huiyi=true;
var counts={};
valid.forEach(function(l){ var c=effectiveClassOf(l.key, build); counts[c]=(counts[c]||0)+1; });
var got=0, need=0;
cores.forEach(function(e){
need+=e.n;
var have=0, k;
if(e.rate){ for(k in counts){ if(rateSet[k]) have+=counts[k]; } }
else if(e.anyOf){ for(k in counts){ if(e.anyOf.indexOf(k)>-1) have+=counts[k]; } }
else have=counts[e.cls]||0;
got+=Math.min(have, e.n);
});
return need? got/need: 0;
}
function gearScore(g, build){
var valid=(g.lines||[]).filter(function(l){ return lineQualityPct(l)!=null && !(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)); });
if(!valid.length) return 0;
var weights={};
build.targets.forEach(function(t){ if(t.flex){ t.flex.forEach(function(k){ weights[k]=(weights[k]||0)+t.n; }); } else if(t.cls) weights[t.cls]=(weights[t.cls]||0)+t.n; });
var wsum=0, vsum=0;
valid.forEach(function(l){ var c=effectiveClassOf(l.key, build); var w=weights[c]; if(w){ wsum+=w; vsum+=w*lineValueScore(l); } });
var Q=wsum? vsum/wsum: 0;
var linesFactor=Math.min(1, valid.length/5);
return Math.round((60*gearScoreCoreFrac44(g, build, valid)+40*Q)*linesFactor);
}
/* ================= 传家宝 / 拉完了判定（第 27 节，站长 2026-10-23 定版口径） =================
   传家宝：一件满 5 条的装备，其词条类别多重集（顺序除第一条外不看、数值不看）能嵌入至少一种合法完整分配。
   合法完整分配 = 8 件 × 5 条、全套各类别总量与配方精确相等（flex 二选一按成员类别通吃，沿用 parseRecipe 口径）；
   每件内部遵守同件重复规则：某类别出现 2 条仅当它就是该件第一条的类别，其余类别至多 1 条。
   被判定的这件用它真实的第一条；分配中构造的其余件第一条可自由安排（即每件至多一个类别双条）。
   部位版位表（SLOTS_BIG/SMALL）不作约束——主要看配方 + 规则。
   类别识别沿用 effectiveClassOf（含属攻本系判定）；非武器部位的无相与面板 / 单件评分一致，不计入配方。
   拉完了：与传家宝成对照——装备至少 1 条词条、且没有一条命中配方（命中口径同单件评分：effClass 在配方需求内，flex 成员亦算命中）。 */
var heirloomCache={};
function heirloomLineClass(g, l, build){
if(!l||!l.key) return null;
if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)) return null;
return effectiveClassOf(l.key, build);
}
/* 配方需求展开为精确类别计数向量的全部分配方式（flex 组把 n 分给成员类别，组合数很小）；按 build 缓存 */
function heirloomResolutions(build){
if(build._hlRes) return build._hlRes;
var fixed={}, groups=[];
(build.targets||[]).forEach(function(t){
if(t.flex) groups.push(t);
else fixed[t.cls]=(fixed[t.cls]||0)+t.n;
});
function cloneMap(m){ var o={}; for(var k in m) o[k]=m[k]; return o; }
var out=[];
(function rec(gi, cur){
if(gi>=groups.length){ out.push(cur); return; }
var mem=groups[gi].flex, n=groups[gi].n;
(function split(mi, left, acc){
if(mi===mem.length-1){
var c2=cloneMap(acc); c2[mem[mi]]=(c2[mem[mi]]||0)+left; rec(gi+1, c2); return;
}
for(var x=0; x<=left; x++){
var a2=cloneMap(acc); if(x) a2[mem[mi]]=(a2[mem[mi]]||0)+x;
split(mi+1, left-x, a2);
}
})(0, n, cur);
})(0, fixed);
build._hlRes=out;
return out;
}
function heirloomClassIndex(build){
if(build._hlIdx) return build._hlIdx;
var idx={}, list=[];
heirloomResolutions(build).forEach(function(r){
Object.keys(r).forEach(function(c){ if(idx[c]===undefined){ idx[c]=list.length; list.push(c); } });
});
build._hlIdx=idx; build._hlList=list;
return idx;
}
/* 精确可行性：vec（各类别剩余条数）能否恰好分进 pieces 件（每件 5 条、至多一个类别双条、无三条同类）。
   强制当前件包含剩余最多的一类以消对称；memo 按计数向量记忆化。 */
function heirloomCanPartition(vec, pieces, memo){
var total=0, i;
for(i=0;i<vec.length;i++) total+=vec[i];
if(total===0) return pieces===0;
if(pieces<=0||total!==pieces*5) return false;
var key=vec.join(",");
if(memo[key]!==undefined) return memo[key];
var ans=false;
var minDoubles=0, cap=0, okc=true;
for(i=0;i<vec.length;i++){
if(vec[i]>2*pieces) okc=false;
if(vec[i]>pieces) minDoubles+=vec[i]-pieces;
cap+=Math.min(vec[i], pieces);
}
if(okc&&minDoubles<=pieces&&cap>=total-pieces){
var mi=0;
for(i=1;i<vec.length;i++) if(vec[i]>vec[mi]) mi=i;
var others=[];
for(i=0;i<vec.length;i++) if(i!==mi&&vec[i]>0) others.push(i);
for(var setSize=4; setSize<=5&&!ans; setSize++){
var need=setSize-1;
if(others.length<need) continue;
ans=heirloomPickSet(vec, pieces, memo, mi, others, need, setSize);
}
}
memo[key]=ans;
return ans;
}
/* 枚举当前件的不同类别集合（必含 mi，共 setSize 类）：5 类无双条；4 类恰一类双条（逐个试双条类） */
function heirloomPickSet(vec, pieces, memo, mi, others, need, setSize){
var combo=[], found=false;
(function rec(start){
if(found) return;
if(combo.length===need){
var S=[mi].concat(combo), d, s;
if(setSize===5){
var v2=vec.slice();
for(s=0;s<S.length;s++) v2[S[s]]--;
if(heirloomCanPartition(v2, pieces-1, memo)) found=true;
} else {
for(d=0; d<S.length&&!found; d++){
var dm=S[d];
if(vec[dm]<2) continue;
var v3=vec.slice();
for(s=0;s<S.length;s++) v3[S[s]]--;
v3[dm]--;
if(heirloomCanPartition(v3, pieces-1, memo)) found=true;
}
}
return;
}
for(var i=start; i<=others.length-(need-combo.length); i++){
combo.push(others[i]);
rec(i+1);
combo.pop();
if(found) return;
}
})(0);
return found;
}
/* 候选类别多重集 cand 能否嵌入：逐个 flex 分配方式验剩余 35 条可分性 */
function heirloomEmbed(build, cand){
var idx=heirloomClassIndex(build), list=build._hlList;
for(var c0 in cand) if(idx[c0]===undefined) return false;
var memo={}, resList=heirloomResolutions(build);
for(var ri=0; ri<resList.length; ri++){
var R=resList[ri], vec=[], tot=0, j, bad=false;
for(j=0;j<list.length;j++) vec.push(0);
for(var c in R) vec[idx[c]]=R[c];
for(var c2 in cand){ vec[idx[c2]]-=cand[c2]; if(vec[idx[c2]]<0){ bad=true; break; } }
if(bad) continue;
for(j=0;j<vec.length;j++) tot+=vec[j];
if(tot!==35) continue;
if(heirloomCanPartition(vec, 7, memo)) return true;
}
return false;
}
function isHeirloom(g, build){
if(!g||!build||!build.targets||!g.lines||g.lines.length!==5) return false;
var clsArr=[], i, c;
for(i=0;i<5;i++){
c=heirloomLineClass(g, g.lines[i], build);
if(c==null) return false;
clsArr.push(c);
}
var cand={};
clsArr.forEach(function(x){ cand[x]=(cand[x]||0)+1; });
var first=clsArr[0];
for(var k in cand) if(cand[k]>2||(cand[k]===2&&k!==first)) return false;
var sig=(build.cat||"")+"|"+(build.school||"")+"|"+(build.set||"")+"|"+first+"|"+clsArr.slice().sort().join(",");
if(heirloomCache[sig]!==undefined) return heirloomCache[sig];
var ans=heirloomEmbed(build, cand);
heirloomCache[sig]=ans;
return ans;
}
/* 命中条数：与单件评分相同的 wanted 口径（配方固定类别 + flex 成员），非武器无相不计 */
function gearRecipeHits(g, build){
var wanted={};
build.targets.forEach(function(t){
if(t.flex) t.flex.forEach(function(k){ wanted[k]=true; });
else wanted[t.cls]=true;
});
var hits=0;
(g.lines||[]).forEach(function(l){
if(!l||!l.key) return;
if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)) return;
if(wanted[effectiveClassOf(l.key, build)]) hits++;
});
return hits;
}
function isDud(g, build){
if(!g||!build||!build.targets||!g.lines||g.lines.length<1) return false;
if(isHeirloom(g, build)) return false;
return gearRecipeHits(g, build)===0;
}
var JADE_PENDANT_SVG='<svg viewBox="0 0 30 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="15" cy="5" r="3.4" fill="none" stroke="#C9A24B" stroke-width="1.8"/><line x1="15" y1="8.4" x2="15" y2="11" stroke="#B02A20" stroke-width="2"/><circle cx="15" cy="21" r="10.9" fill="none" stroke="rgba(201,162,75,.5)" stroke-width=".9"/><circle cx="15" cy="21" r="8" fill="none" stroke="#57A773" stroke-width="5.2"/><circle cx="15" cy="21" r="5.2" fill="none" stroke="#2E6B4A" stroke-width=".9"/><rect x="11.4" y="31.5" width="7.2" height="5" rx="1.6" fill="#B02A20"/><path d="M10.5 37 L9 57 M13 37 L12.6 58 M15.5 37 L15.5 58.5 M18 37 L18.4 58 M20.5 37 L22 57" stroke="#C23A2A" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
/* 玉佩挂穗（第 30 节彩蛋）：只挂传家宝卡，位置在卡片右角外沿（.jade-pendant），与标题行内的金漆牌错开位置 */
function heirloomPendantHtml(g, build){
if(!g||!isHeirloom(g, build)) return "";
return '<span class="jade-pendant" aria-hidden="true">'+JADE_PENDANT_SVG+"</span>";
}
function verdictBadgeHtml(g, build){
if(isHeirloom(g, build)) return '<span class="heirloom-seal">传家宝</span>';
if(isDud(g, build)) return '<span class="dud-seal">拉完了</span>';
return "";
}
/* 词条离满值多远：迷你条 + 百分比（<94 朱砂 / 94~98 达标 / >=98 鎏金，随主题变色） */
function qualityBarHtml(pct){
var col=pct>=98? "var(--gold)": (pct>=94? "var(--teal)": "var(--qlow)");
var w=Math.max(0,Math.min(100,pct));
return '<span class="qbar"><i style="width:'+fmt(w,0)+"%;background:"+col+'"></i></span><span class="qpct" style="color:'+col+'">'+fmt(pct,0)+"%</span>";
}
function qualityHtml(l){
var pct=lineQualityPct(l); if(pct==null) return "";
return " "+qualityBarHtml(pct);
}
function gearLinesHtml(g){
var simT=g? (simTierById[g.id]||""): "";
var parts=g.lines.map(function(l){
var a=AFFIX_BY_KEY[l.key]; if(!a) return "";
var v=(lineQualityPct(l)==null)? "":(" "+fmt(+l.val,1)+(a.unit||""));
var sim="";
if(simT){ var ev=effLineVal(g,l), rv=parseVal(l.val); if(ev!=null&&rv!=null&&isFinite(ev)&&Math.abs(ev-rv)>0.001) sim=' <span style="color:var(--gold);font-weight:700">→ '+fmt(ev,1)+(a.unit||"")+"</span>"; }
return '<span style="white-space:nowrap"><b>'+esc(a.label)+v+"</b>"+sim+qualityHtml(l)+"</span>";
});
if(g.dingyin){ var dm=dingyinMax(g.dingyin.name, g.slot); var simDy="";
if(simT){ var edv=effDingyinVal(g), rdv=parseVal(g.dingyin.val); if(edv!=null&&rdv!=null&&isFinite(edv)&&Math.abs(edv-rdv)>0.001) simDy=' <span style="color:var(--gold);font-weight:700">→ '+fmt(edv,1)+(isLeftDingyinSlot(g.slot)? "" : "%")+"</span>"; }
parts.push('<span style="white-space:nowrap">定音 <b>'+esc(g.dingyin.name)+" "+fmt(g.dingyin.val,1)+(isLeftDingyinSlot(g.slot)? "" : "%")+"</b>"+simDy+(dm? "（满值 "+fmt(dm,1)+"）":"")+"</span>"); }
if(g.warnings&&g.warnings.length) parts.push('<span class="tag red">'+esc(g.warnings[0])+"</span>");
return parts.filter(Boolean).join(" · ");
}

/* 单件模拟（实际 / 承音 / 满值）：替换已选装备的词条与定音数值（类型不变）、真实数据不改；
   一键最优与单件评分走 gearScore/lineValueScore（真实值），不经此处 */
function effLineVal(g, l){
var v=(typeof l.val==="number")? l.val: parseVal(l.val);
if(v==null||!isFinite(v)||v<0) return v;
var tier=g? simTierById[g.id]: null;
if(tier){ var a=AFFIX_BY_KEY[l.key]; if(a) return tier==="max"? a.max: a.cy; }
return v;
}
function effLineScore(g, l){
var a=AFFIX_BY_KEY[l&&l.key]; if(!a) return 0;
var v=effLineVal(g, l);
if(v==null||!isFinite(v)||v<0) return 0;
return Math.min(1, v/a.cy);
}
/* 定音有效值（与 effLineVal 同构）：满值档取满值表，承音档取满值 × 0.94（1 位小数）；满值查不到（不在表内）保持原值 */
function effDingyinVal(g){
if(!g||!g.dingyin) return null;
var v=(typeof g.dingyin.val==="number")? g.dingyin.val: parseVal(g.dingyin.val);
if(v==null||!isFinite(v)||v<0) return null;
var tier=simTierById[g.id];
if(!tier) return v;
var mx=dingyinMax(g.dingyin.name, g.slot);
if(mx==null) return v;
return tier==="max"? mx: Math.round(mx*0.94*10)/10;
}
function anySim(){ for(var k in simTierById){ return true; } return false; }

/* ================= 面板计算 ================= */
/* 导入/存档里的「其他来源」取值：旧版曾把弓按白字折进 extras.acc 合计、同时另存纯手填值 extraAcc；优先取纯值，避免弓在新模型下被重复计入。无纯值时回退合计（更早的老档） */
function extraFromData(ex, pureKey, sumKey){ if(!ex) return 0; var p=ex[pureKey]; if(typeof p==="number"&&isFinite(p)) return p; var s=ex[sumKey]; return (typeof s==="number"&&isFinite(s))? s: 0; }
function currentExtras(){
var kind=($("bowSelect")? $("bowSelect").value: bowJueKind)||"";
var bv=BOW_JUE_VALUES[kind]||{acc:0,crit:0,"int":0,label:"无"};
/* acc/crit/int 只含「其他来源」手填白字；弓加成单独走 bowAcc/bowCrit/bowInt（白字加值），由 computePanel 计入白字后统一换算黄字（第 35 节口径） */
return {res:Math.max(0.5,num("inRes")||1.85), acc:num("extraAcc"), crit:num("extraCrit"), int:num("extraInt"),
extraAcc:num("extraAcc"), extraCrit:num("extraCrit"), extraInt:num("extraInt"),
bowJue:kind, bowLabel:bv.label, bowAcc:bv.acc, bowCrit:bv.crit, bowInt:bv["int"]};
}
function computePanel(lo, extras, gearMap){
var counts={}, sums={}, classCounts={}, equipped=[], invalidLines=[], dingyin=[], dingyinTotals={};
var build=BUILDS[targetIdx];
SLOTS.forEach(function(s){
var g=lo[s]? (gearMap? gearMap[lo[s]]: findGear(lo[s])): null; if(!g) return;
equipped.push(g);
(g.lines||[]).forEach(function(l){
var v=effLineVal(g, l);
if(v==null||!isFinite(v)||v<0) return;
if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)){ invalidLines.push({gear:g,line:l,why:"无相属攻出现在非武器部位，已不计入"}); return; }
counts[l.key]=(counts[l.key]||0)+1;
var cc=effectiveClassOf(l.key, build);
classCounts[cc]=(classCounts[cc]||0)+1;
sums[l.key]=(sums[l.key]||0)+v;
});
var dy=sanitizeDingyin(g.dingyin, g.slot);
if(dy){ var dv=effDingyinVal(g); if(dv==null) dv=dy.val; dingyin.push({gear:g, slot:s, name:dy.name, val:dv}); dingyinTotals[dy.name]=(dingyinTotals[dy.name]||0)+dv; }
});
var shuDaEligible=0, shuXiaoEligible=0, otherShuMap={};
var shuSysDa=0, shuSysXiao=0, shuWxDa=0, shuWxXiao=0;
Object.keys(sums).forEach(function(k){
if(!isShuKey(k)) return;
/* 面板属攻汇总口径（既有）：本系大小 + 无相通算，按系别直接判定——不经 effectiveClassOf，
   故第 42 节裂石-威新条目的「只算大裂石」target 口径不影响面板大 / 小属（两套口径独立） */
if(shuSystemOfKey(k)==="无相"||shuSystemOfKey(k)===buildSystem(build)){
if(shuSizeOfKey(k)==="da") shuDaEligible+=sums[k]; else shuXiaoEligible+=sums[k];
if(shuSystemOfKey(k)==="无相"){ if(shuSizeOfKey(k)==="da") shuWxDa+=sums[k]; else shuWxXiao+=sums[k]; }
else { if(shuSizeOfKey(k)==="da") shuSysDa+=sums[k]; else shuSysXiao+=sums[k]; }
}
else otherShuMap[k]={key:k, label:AFFIX_BY_KEY[k].label, val:sums[k], count:counts[k]||0};
});
var otherShu=Object.keys(otherShuMap).map(function(k){ return otherShuMap[k]; });
var res=Math.max(0.5, extras.res||1.85);
var base=getBase();
/* 无相底子（账号级 26/26，探针实测，第 35 节入模）：面板无相大小在底子之上累加装备词条 */
shuWxDa+=(base.wxDa||0); shuWxXiao+=(base.wxXiao||0);
/* 总五维 = 角色基础五维 + 装备五维，折算按总五维计（与 DIY 0.10.2 公式结构一致） */
var jin=(sums.jin||0)+base.jin, mn=(sums.min||0)+base.min, shi=(sums.shi||0)+base.shi, ti=(sums.ti||0)+base.ti, yu=(sums.yu||0)+base.yu;
/* 武学天赋（口径见 TALENT）：节点按所挂属性总和缩放、封顶全值；stat=maxTiJin 取总体 / 总劲的较大值 */
var talentCrit=0, talentXiaowai=0, talentInt=0, talentDawai=0, talentIntStat="", talentDawaiStat="";
var tTotals={ti:ti, jin:jin, yu:yu, min:mn, shi:shi};
var tStatName={ti:"体", jin:"劲", yu:"御", min:"敏", shi:"势", maxTiJin:"体/劲较大值"};
talentNodesFor(build).forEach(function(t){
var tTot=(t.stat==="maxTiJin")? Math.max(tTotals.ti, tTotals.jin): (tTotals[t.stat]||0);
var tAdd=t.val*Math.min(tTot/(t.need||1), 1);
if(t.apply==="crit") talentCrit+=tAdd;
else if(t.apply==="xiaowai") talentXiaowai+=tAdd;
else if(t.apply==="int"){ talentInt+=tAdd; talentIntStat=tStatName[t.stat]||t.stat; }
else if(t.apply==="dawai"){ talentDawai+=tAdd; talentDawaiStat=tStatName[t.stat]||t.stat; }
});
/* 破竹天赋「破竹属性提升」两份（第 35 节对账定案：一份说排除、两份说最优）：两树各一份、每份 小 106 / 大 212 → 合计 小 +212 / 大 +424，仅破竹系；缩放项（破竹伤害加成 / 穿透）为伤害侧、不入面板 */
var talentShuXiao=0, talentShuDa=0;
if(build&&build.school&&build.school.indexOf("破竹")===0){ talentShuXiao=212; talentShuDa=424; }
var whiteAcc=(sums.jingzhun||0)+base.acc+(extras.acc||0)+(extras.bowAcc||0);
/* 第 37 节（对账证据）：天赋会心节点不进白字——游戏把它挂在最终会心率行；白字只含词条 / 敏折算 / 底子 / 其他来源 / 弓，节点单列为最终侧项 finalCrit */
var whiteCrit=(sums.huixin||0)+mn*0.076+base.crit+(extras.crit||0)+(extras.bowCrit||0);
var whiteInt=(sums.huiyi||0)+shi*0.038+base["int"]+(extras["int"]||0)+talentInt+(extras.bowInt||0);
var yCritV=Math.max(0,Math.min(80, whiteCrit/res));
return {
counts:counts, sums:sums, classCounts:classCounts, equipped:equipped, base:base,
whiteAcc:whiteAcc, whiteCrit:whiteCrit, whiteInt:whiteInt, talentCrit:talentCrit, talentXiaowai:talentXiaowai, talentInt:talentInt, talentDawai:talentDawai, talentIntStat:talentIntStat, talentDawaiStat:talentDawaiStat, talentShuXiao:talentShuXiao, talentShuDa:talentShuDa,
yAcc:Math.max(0,Math.min(100, 65+(whiteAcc-65)/res)),
yCrit:yCritV,
finalCrit:yCritV+(base.dcrit||0)+talentCrit,
yInt:Math.max(0,Math.min(40, whiteInt/res)),
dawai:base.dawai+(base.wkDa||0)+(sums.dawai||0)+jin*1.36+shi*0.9+talentDawai,
xiaowai:base.xiaowai+(base.wkXiao||0)+(sums.xiaowai||0)+jin*0.225+mn*0.9+talentXiaowai,
dashu:base.shuDa+(base.wkShuDa||0)+shuDaEligible+talentShuDa, xiaoshu:base.shuXiao+(base.wkShuXiao||0)+shuXiaoEligible+talentShuXiao,
shuDaEligible:shuDaEligible, shuXiaoEligible:shuXiaoEligible, otherShu:otherShu, shuSysDa:shuSysDa, shuSysXiao:shuSysXiao, shuWxDa:shuWxDa, shuWxXiao:shuWxXiao,
dingyin:dingyin, dingyinTotals:dingyinTotals, invalidLines:invalidLines,
ti:ti, jin:jin, yu:yu, min:mn, shi:shi,
hp:base.hp+(base.wkHp||0)+ti*60+yu*17, def:yu*0.5
};
}
function classCount(panel, t){
if(t.flex){ var s=0; t.flex.forEach(function(k){ s+=(panel.classCounts[k]||0); }); return s; }
return panel.classCounts[t.cls]||0;
}
/* 定音（模型 B）：8 件平均；类型错记 0，类型对按 实际÷满值（封顶 1） */
function dingyinScore(panel, build){
var bySlot={};
(panel.dingyin||[]).forEach(function(d){ bySlot[d.slot]=d; });
var total=0, rows=[];
SLOTS.forEach(function(slot){
var d=bySlot[slot]||null;
var correct=d? dingyinTypeCorrect(d.name, slot, build): false;
var mx=d? dingyinMax(d.name, slot): null;
var score=(d&&correct&&mx)? Math.min(1, Math.max(0,d.val)/mx): 0;
total+=score;
rows.push({slot:slot, name:d? d.name: "", val:d? d.val: null, max:mx, correct:correct, score:score, has:!!d});
});
return {score:total/8, rows:rows};
}
/* 毕业度（第 36 节站长改版）：只按词条算——条数 40 + 数值 24 + 定音 20（模型 B），合计 84 折算百分制 ×100/84；原三率分项（16）整项退休，鸣金三率特例随之失效 */
/* 第 41 节：定音分项可选——gradDingyinOn 关时定音不计入，总分改按（条数 40 + 数值 24）÷64 折算；D 仍照常算出供定音汇总展示。建议引擎、满值模拟都走本函数，口径自动一致 */
function graduation(panel, build){
var rows=[], sumMatch=0;
build.targets.forEach(function(t){
var cur=classCount(panel,t);
var m=t.n? Math.min(1,cur/t.n):1;
sumMatch+=m;
rows.push({label:t.label, n:t.n, cur:cur, flex:!!t.flex});
});
var A=build.targets.length? sumMatch/build.targets.length : 0;
var lineTotal=0, lineSum=0, lowLines=[];
panel.equipped.forEach(function(g){
(g.lines||[]).forEach(function(l){
if(lineQualityPct(l)==null) return;
if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)) return;
lineTotal++;
var sc=effLineScore(g, l); lineSum+=sc;
if(sc<1) lowLines.push({gear:g, line:l, score:sc});
});
});
var B=lineTotal? lineSum/lineTotal : 0;
var dy=dingyinScore(panel, build);
var got=0, total=0;
rows.forEach(function(r){ total+=r.n; got+=Math.min(r.cur,r.n); });
var total=gradDingyinOn? (0.4*A+0.24*B+0.2*dy.score)/0.84 : (0.4*A+0.24*B)/0.64;
return {total:total, A:A, B:B, D:dy.score, dingyinRows:dy.rows, rows:rows, got:got, totalBars:total, lowLines:lowLines};
}
function maxedGearClone(g, tempId){
var lines=(g.lines||[]).map(function(l){ var a=AFFIX_BY_KEY[l.key]; return a? {key:l.key, val:a.max}: null; }).filter(Boolean);
var dy=sanitizeDingyin(g.dingyin, g.slot);
if(dy){ var mx=dingyinMax(dy.name, g.slot); if(mx!=null) dy={name:dy.name, val:mx}; }
return {id:tempId, slot:g.slot, name:g.name||"", lines:lines, dingyin:dy, warnings:[]};
}
/* 贷款满值：同构成、数值全换满值重算；只生成临时克隆，不改用户真实数据 */
function loanGraduation(build){
var lo={}, map={};
SLOTS.forEach(function(slot, i){
var id=loadout[slot]; if(!id) return;
var g=findGear(id); if(!g) return;
var clone=maxedGearClone(g, -1001-i);
map[clone.id]=clone; lo[slot]=clone.id;
});
var panel=computePanel(lo, currentExtras(), map);
return graduation(panel, build);
}

/* ================= 组合建议（第 28 节，站长 2026-10-23 定版） =================
   对当前搭配枚举单步改动，用现有总分口径（computePanel + graduation、真实数据）试算增量，贪心逐条：
   取最优一步（第 43 节起按档位向量 + 增益排序、门槛见下方第 43 节注） → 虚拟采纳 → 在采纳后的状态上重算下一条，最多 5 条。
   换：每个部位 × 装备库同部位未上身件，试换上身；洗：已上身每件每条 × 配方缺口类（差缺 > 0，flex 组按成员展开），
   类别换成目标类、数值取目标类承音值。试算全走虚拟 loadout + gearMap 克隆，绝不改用户真实数据；
   sim 模拟档位在试算期间临时清空（与 renderPanel 算真实分同法），口径 = 真实数据。
   结果按状态（目标流派 + 搭配 + 装备库 + 基础 + 其他来源）缓存，状态不变不重算。
   第 43 节（站长定版）：建议排序跟上一键最优的同一套档位优先级——每步先比「做完这步后整套的档位向量」
   （tierVectorOf，含火拳 0 档特例），向量更优者优先，向量相同再比毕业度增益。收录门槛：档位有改善的步骤
   只需增益 > 0 即可入选（不再卡 0.05%）；档位不变的步骤仍按原 > 0.05% 门槛；档位变差的步骤不收
   （优先级口径下不推荐把高档条数换走）。 */
var suggestCache={key:null, data:null};
var SUGGEST_MAX_EVALS=20000; /* 单次计算的试算上限保护：超限后用已得最优收尾，避免超大装备库拖死渲染 */
function washTargetKey(line, slot, cls, build){
if(cls!=="shugong") return AFFIX_BY_KEY[cls]? cls: null;
if(isWuxiangKey(line.key)&&isWeaponSlot(slot)) return line.key;
var sys=buildSystem(build); if(!sys) return null;
var size=isShuKey(line.key)? shuSizeOfKey(line.key): "da", found=null;
AFFIX.forEach(function(a){ if(a.sys===sys&&a.size===size) found=a.key; });
return found;
}
function computeSuggestions(){
var build=BUILDS[targetIdx];
var key=targetIdx+"|"+JSON.stringify(loadout)+"|"+JSON.stringify(lib)+"|"+JSON.stringify(collectBaseState().values)+"|"+JSON.stringify(currentExtras())+"|dy"+(gradDingyinOn?1:0);
if(suggestCache.key===key) return suggestCache.data;
var data=suggestComputeFresh(build);
suggestCache={key:key, data:data};
return data;
}
function suggestComputeFresh(build){
var extras=currentExtras();
var lo={}, map={}, equippedCount=0;
SLOTS.forEach(function(s){ var id=loadout[s]; if(!id) return; var g=findGear(id); if(!g) return; lo[s]=id; map[id]=g; equippedCount++; });
var savedSim=simTierById; simTierById={};
var evals=0;
var tierOf=buildTiers(build);
function score(lo2, map2){ evals++; return graduation(computePanel(lo2, extras, map2), build).total; }
function evalState(lo2, map2){ evals++; var p=computePanel(lo2, extras, map2); return {total: graduation(p, build).total, vec: tierVectorOf(p, build, tierOf)}; }
function copyState(loS, mapS){ var l2={}, m2={}; SLOTS.forEach(function(s){ if(loS[s]){ l2[s]=loS[s]; m2[loS[s]]=mapS[loS[s]]; } }); return [l2, m2]; }
try{
var curEv=evalState(lo, map);
var cur=curEv.total, start=cur, curVec=curEv.vec, list=[];
if(!equippedCount) return {list:[], cur:cur, final:cur};
for(var step=0; step<5; step++){
if(evals>SUGGEST_MAX_EVALS) break;
var panel=computePanel(lo, extras, map);
var gapCls=[], inGap={};
build.targets.forEach(function(t){
if(t.n-classCount(panel, t)<=0) return;
(t.flex? t.flex: [t.cls]).forEach(function(c){ if(!inGap[c]){ inGap[c]=true; gapCls.push(c); } });
});
var best=null;
/* 第 43 节排序键：先比做完后的档位向量（字典序），向量平再比毕业度增益；门槛见文件头注释 */
function consider(cand){
var cmp=tierVecCmp(cand.vec, curVec);
if(cmp>0){ if(!(cand.gain>1e-9)) return; }
else if(cmp===0){ if(!(cand.gain>0.0005)) return; }
else return;
if(!best){ best=cand; return; }
var vc=tierVecCmp(cand.vec, best.vec);
if(vc>0||(vc===0&&cand.gain>best.gain)) best=cand;
}
/* 换件：同部位池、未上身的库内件（空部位也试，等于装上）；第 40 节起武器两位置共用武器池，另一位置已占的那件不作候选（used 校验） */
SLOTS.forEach(function(slot){
lib.forEach(function(g){
if(evals>SUGGEST_MAX_EVALS) return;
if(gearSlotOf(g.slot)!==gearSlotOf(slot)||lo[slot]===g.id) return;
var used=false; SLOTS.forEach(function(s2){ if(lo[s2]===g.id) used=true; });
if(used) return;
var st=copyState(lo, map); st[0][slot]=g.id; st[1][g.id]=g;
var ev=evalState(st[0], st[1]);
consider({kind:"swap", slot:slot, gearId:g.id, name:g.name||"", gain:ev.total-cur, score:ev.total, vec:ev.vec, lo:st[0], map:st[1]});
});
});
/* 洗条：已上身每件每条 × 缺口类；与该条同属一个 flex 组时换成员不改变条数口径，跳过 */
SLOTS.forEach(function(slot){
var id=lo[slot]; if(!id) return;
var g=map[id]; if(!g||!g.lines) return;
g.lines.forEach(function(line, li){
if(evals>SUGGEST_MAX_EVALS) return;
if(!line||!line.key||!AFFIX_BY_KEY[line.key]) return;
var fromCls=effectiveClassOf(line.key, build);
gapCls.forEach(function(tc){
if(tc===fromCls) return;
var sameGroup=false;
build.targets.forEach(function(t){ if(t.flex&&t.flex.indexOf(tc)>-1&&t.flex.indexOf(fromCls)>-1) sameGroup=true; });
if(sameGroup) return;
var nk=washTargetKey(line, slot, tc, build); if(!nk) return;
var a=AFFIX_BY_KEY[nk]; if(!a) return;
var clone={id:"sug"+step+"_"+slot+"_"+li, slot:g.slot, name:g.name||"", lines:g.lines.map(function(l2, i2){ return i2===li? {key:nk, val:a.cy}: {key:l2.key, val:l2.val}; }), dingyin:g.dingyin? {name:g.dingyin.name, val:g.dingyin.val}: null, warnings:[], _srcId:(g._srcId||g.id)};
var st=copyState(lo, map); st[0][slot]=clone.id; st[1][clone.id]=clone;
var ev=evalState(st[0], st[1]);
consider({kind:"wash", slot:slot, gearId:clone._srcId, lineIdx:li, fromCls:fromCls, toCls:tc, toKey:nk, gain:ev.total-cur, score:ev.total, vec:ev.vec, lo:st[0], map:st[1]});
});
});
});
if(!best) break;
list.push(best);
lo=best.lo; map=best.map; cur=best.score; curVec=best.vec;
}
return {list:list, cur:start, final:cur};
} finally { simTierById=savedSim; }
}
function renderSuggestions(){
var box=$("suggestList"), head=$("suggestHead");
if(!box||!head) return;
var equippedN=0;
SLOTS.forEach(function(s){ if(loadout[s]&&findGear(loadout[s])) equippedN++; });
if(!equippedN){
head.textContent="";
box.innerHTML='<p class="note" style="margin:6px 0 0">先选一套搭配</p>';
return;
}
var data=computeSuggestions();
if(!data.list.length){
head.innerHTML="当前 <b>"+fmt(data.cur*100,1)+"%</b>";
box.innerHTML='<p class="note" style="margin:6px 0 0">这套暂时挑不出毛病</p>';
return;
}
head.innerHTML="当前 <b>"+fmt(data.cur*100,1)+"%</b> → 全做 <b>"+fmt(data.final*100,1)+"%</b>";
box.innerHTML=data.list.map(function(sg){
if(sg.kind==="swap") return '<div class="sug-row"><span class="sug-verb">换</span><span class="sug-act">'+esc(sg.slot)+' → 「'+esc(sg.name||"未命名")+'」</span><span class="sug-gain">+'+fmt(sg.gain*100,1)+'%</span></div>';
return '<div class="sug-row"><span class="sug-verb wash">洗</span><span class="sug-act">'+esc(sg.slot)+" 第"+(sg.lineIdx+1)+"条 "+esc(CLASS_LABEL[sg.fromCls]||sg.fromCls)+" → "+esc(CLASS_LABEL[sg.toCls]||sg.toCls)+'</span><span class="sug-gain">+'+fmt(sg.gain*100,1)+'%</span></div>';
}).join("");
}

/* ================= 传家宝彩蛋（第 30 节，站长 2026-10-23 选定；金漆牌本体不变，纯附加彩蛋） =================
   其一 玉佩挂穗：heirloomPendantHtml 在装备库 / 搭配区的传家宝卡右角外沿挂玉佩（CSS .jade-pendant，缓慢轻摆）；
   其二 点击撒金粉：点传家宝卡（避开按钮 / 输入等交互元素）在点击处撒一把金粉（DOM 粒子、无外部库、约 0.6~0.9 秒散落消失）；
   其三 集齐庆祝：搭配 8 件全传家宝时在毕业度总分区撒一次大金粉。状态机只在「未集齐 → 集齐」跃迁时触发
   （页面载入时若已集齐，首次检出即视为一次跃迁、延迟少许后触发）；同一集齐状态重渲染不重复，破齐再集齐可再触发。
   不新增任何常驻文字，纯视觉彩蛋。 */
var GOLD_DUST_COLORS=["#F6DEA0","#EFC96E","#C9A24B","#FFE9B0","#D9A441"];
function goldDustBurst(cx, cy, count, spread){
var layer=$("goldDustLayer"); if(!layer||!document.createElement) return 0;
count=count||24; spread=spread||90;
for(var i=0;i<count;i++){
var p=document.createElement("i"); p.className="gd-p";
var sz=2+Math.random()*3.6;
p.style.width=sz.toFixed(1)+"px"; p.style.height=sz.toFixed(1)+"px";
p.style.background=GOLD_DUST_COLORS[i%GOLD_DUST_COLORS.length];
p.style.left=cx+"px"; p.style.top=cy+"px";
layer.appendChild(p);
var ang=Math.random()*Math.PI*2, dist=(0.3+Math.random()*0.7)*spread;
var dx=Math.cos(ang)*dist, dy=Math.sin(ang)*dist*0.7+spread*0.55;
var rot=Math.round(Math.random()*260-130), dur=Math.round(560+Math.random()*300);
var done=(function(el){ return function(){ if(el.parentNode) el.parentNode.removeChild(el); else if(el.remove) el.remove(); }; })(p);
var scheduled=false;
if(p.animate){ try{ var an=p.animate([{transform:"translate(-50%,-50%) rotate(0deg)",opacity:1},{transform:"translate(calc(-50% + "+dx.toFixed(1)+"px), calc(-50% + "+dy.toFixed(1)+"px)) rotate("+rot+"deg)",opacity:0}],{duration:dur, easing:"cubic-bezier(.17,.67,.35,1)"}); if(an){ an.onfinish=done; scheduled=true; } }catch(e){} }
if(!scheduled) setTimeout(done, dur+80);
}
return count;
}
function isHeirloomCardEl(el){ return !!(el&&el.classList&&el.classList.contains&&el.classList.contains("heirloom")); }
function isDustBlockedEl(el){ var t=(el&&el.tagName)||""; return t==="BUTTON"||t==="A"||t==="SELECT"||t==="INPUT"||t==="TEXTAREA"||t==="LABEL"; }
function heirloomDustFromEvent(e){
if(!e||!e.target) return false;
var t=e.target;
if(isDustBlockedEl(t)) return false;
var card=null;
if(t.closest){ try{ card=t.closest(".gear-item.heirloom, .slotbox.heirloom"); }catch(e2){ card=null; } }
if(!card&&isHeirloomCardEl(t)) card=t;
if(!card) return false;
goldDustBurst(e.clientX||0, e.clientY||0, 24, 90);
return true;
}
document.addEventListener("click", heirloomDustFromEvent);
/* 集齐庆祝状态机：complete 记录上次检出状态，fires 累计已触发次数 */
var heirloomParty={complete:false, fires:0};
function heirloomSetComplete(){
var build=BUILDS[targetIdx], n=0;
for(var i=0;i<SLOTS.length;i++){
var g=loadout[SLOTS[i]]? findGear(loadout[SLOTS[i]]): null;
if(!g||!isHeirloom(g, build)) return false;
n++;
}
return n===SLOTS.length;
}
function fireHeirloomParty(){
var el=$("scorePct"), cx=400, cy=140;
if(el&&el.getBoundingClientRect){ var r=el.getBoundingClientRect(); if(r){ cx=r.left+r.width/2; cy=r.top+r.height/2; } }
else if(window.innerWidth){ cx=window.innerWidth/2; }
goldDustBurst(cx, cy, 110, 300);
goldDustBurst(cx, cy, 50, 170);
}
function checkHeirloomParty(){
var c=heirloomSetComplete();
var fire=c&&!heirloomParty.complete;
heirloomParty.complete=c;
if(fire){ heirloomParty.fires++; setTimeout(fireHeirloomParty, 400); }
return fire;
}

/* ================= 定音录入控件 ================= */
function dingyinSelectOptions(slot, selected){
var html='<option value="">— 无定音 / 不选 —</option>';
if(isLeftDingyinSlot(slot)){
Object.keys(DINGYIN_LEFT).forEach(function(n){ html+='<option value="'+esc(n)+'"'+(n===selected?" selected":"")+">"+esc(n)+"（满值 "+DINGYIN_LEFT[n]+"）</option>"; });
} else {
/* 右四只给当前目标流派已证实的那一种全名；未证实流派不给全名选项、只留自定义 */
var bInfo=buildDingyinInfo(BUILDS[targetIdx]);
if(bInfo&&bInfo.verified){ html+='<option value="'+esc(bInfo.name)+'"'+(bInfo.name===selected?" selected":"")+">"+esc(bInfo.name)+"（满值 6.0%）</option>"; }
html+='<option value="__custom__">自定义…（填完整名）</option>';
}
return html;
}
function setupDingyinControls(prefix, slot, d){
var sel=$(prefix+"DingyinType"), nameEl=$(prefix+"DingyinName"), valEl=$(prefix+"DingyinVal"), ref=$(prefix+"DingyinRef");
if(!sel) return;
var selected="";
if(d&&d.name){ if(isLeftDingyinSlot(slot)) selected=d.name; else { var sInfo=buildDingyinInfo(BUILDS[targetIdx]); selected=(sInfo&&sInfo.verified&&sInfo.name===d.name)? d.name: "__custom__"; } }
sel.innerHTML=dingyinSelectOptions(slot, selected);
if(nameEl){ nameEl.style.display=(!isLeftDingyinSlot(slot)&&selected==="__custom__")? "block":"none"; nameEl.value=(selected==="__custom__"&&d)? d.name: ""; }
if(valEl) valEl.value=(d&&d.val!=null)? d.val: "";
updateDingyinRef(prefix, slot);
}
function updateDingyinRef(prefix, slot){
var sel=$(prefix+"DingyinType"), ref=$(prefix+"DingyinRef"), nameEl=$(prefix+"DingyinName");
if(!sel||!ref) return;
slot=slot||((prefix==="g")? $("gSlot").value: $("ocrSlot").value);
var v=sel.value;
if(nameEl) nameEl.style.display=(!isLeftDingyinSlot(slot)&&v==="__custom__")? "block":"none";
if(!v){ if(isLeftDingyinSlot(slot)){ ref.textContent="定音可选：外功穿透 / 外功抗性（满值 12.8）、无相穿透（满值 15.2）"; }
else { var rInfo=buildDingyinInfo(BUILDS[targetIdx]); ref.textContent=rInfo? (rInfo.verified? ("本流派定音："+rInfo.name+"（满值 6.0%），或自定义填完整名"): ("定音可选：武学类增伤（满值统一 6.0%）；本流派类别："+rInfo.category+"（全名未证实，请用自定义填游戏内全名）")): "定音可选：武学类增伤（满值统一 6.0%）"; }
refreshNeedPick(); return; }
var name=(v==="__custom__")? (nameEl? nameEl.value.trim(): ""): v;
var mx=name? dingyinMax(name, slot): null;
ref.textContent=mx? ("满值 "+fmt(mx,1)+(isLeftDingyinSlot(slot)? "" : "%")+" · 毕业度按模型 B：类型对才按数值计分"): "填完整定音名后显示满值";
refreshNeedPick();
}
function readDingyin(prefix, slot){
var sel=$(prefix+"DingyinType"), nameEl=$(prefix+"DingyinName"), valEl=$(prefix+"DingyinVal");
if(!sel||!sel.value) return null;
var name=(sel.value==="__custom__")? (nameEl? nameEl.value.trim(): ""): sel.value;
if(!name) return {invalid:true};
var raw=valEl? valEl.value: "";
var v=(raw==="")? null: parseFloat(raw);
if(v==null||!isFinite(v)||v<0) return {invalid:true};
var d=sanitizeDingyin({name:name, val:v}, slot);
return d||{invalid:true};
}
/* 目标流派切换后：表单的右四定音下拉跟随新流派。当前定音为空、或正是上一个流派的预设全名时，自动选中新流派的全名（已证实流派）；用户手填的自定义名不动 */
function refreshDingyinForms(prevInfo){
var newInfo=buildDingyinInfo(BUILDS[targetIdx]);
function adj(prefix, slot){
var d=readDingyin(prefix, slot);
var cur=(d&&d.name)? d.name: "";
var selEl=$(prefix+"DingyinType"), nmEl=$(prefix+"DingyinName");
var hasCustomText=!!(selEl&&selEl.value==="__custom__"&&nmEl&&nmEl.value.trim());
if(!hasCustomText&&!isLeftDingyinSlot(slot)&&newInfo&&newInfo.verified&&(!cur||(prevInfo&&prevInfo.verified&&cur===prevInfo.name))){
setupDingyinControls(prefix, slot, {name:newInfo.name, val:(d&&d.val!=null)? d.val: null});
} else {
setupDingyinControls(prefix, slot, (d&&d.name)? d: null);
}
}
var gs=$("gSlot");
if(gs) adj("g", gs.value);
var os=$("ocrSlot");
if(os) adj("ocr", os.value||"主武器");
}
["g","ocr"].forEach(function(prefix){
var sel=$(prefix+"DingyinType");
if(sel) sel.addEventListener("change", function(){ updateDingyinRef(prefix); maybePreselectSchoolFromDingyin(prefix); });
var nm=$(prefix+"DingyinName");
if(nm) nm.addEventListener("input", function(){ updateDingyinRef(prefix); maybePreselectSchoolFromDingyin(prefix); });
var mx=$(prefix==="g"? "btnGDingyinMax": "btnOcrDingyinMax");
if(mx) mx.addEventListener("click", function(){
var slot=(prefix==="g")? $("gSlot").value: $("ocrSlot").value;
var sel2=$(prefix+"DingyinType"), nameEl2=$(prefix+"DingyinName"), valEl2=$(prefix+"DingyinVal");
if(!sel2||!sel2.value) return;
var name=(sel2.value==="__custom__")? (nameEl2? nameEl2.value.trim(): ""): sel2.value;
var m=name? dingyinMax(name, slot): null;
if(m!=null&&valEl2) valEl2.value=m;
});
});

/* ================= 流派多选（录入 / OCR 核对表单共用，第 38 节上线、第 39 节换标尺） ================= */
var gSchoolSel=[], ocrSchoolSel=[];
function schoolSelOf(prefix){ return prefix==="ocr"? ocrSchoolSel: gSchoolSel; }
function renderSchoolPick(prefix){
var el=$(prefix+"SchoolPick"); if(!el) return;
var sel=schoolSelOf(prefix);
el.innerHTML=SCHOOL_TAG_LIST.map(function(s){ return '<button type="button" class="wxchip'+(sel.indexOf(s)>-1?" on":"")+'" data-scpick="'+esc(s)+'">'+esc(s)+"</button>"; }).join("");
}
function refreshSchoolBox(prefix){
var box=$(prefix+"SchoolBox"); if(!box) return;
var slotEl=$(prefix==="ocr"? "ocrSlot": "gSlot");
var slot=slotEl? slotEl.value: "";
box.style.display=isWeaponSlot(slot)? "": "none";
renderSchoolPick(prefix);
}
function setSchoolSel(prefix, arr){
var s=sanitizeSchoolTags(arr);
if(prefix==="ocr") ocrSchoolSel=s; else gSchoolSel=s;
refreshSchoolBox(prefix);
}
/* 编辑已有装备时的预选：已有标签优先，其次按其定音名推导出的流派 */
function schoolPreselect(g){
var tags=gearSchoolTags(g); if(tags.length) return tags;
return (g&&g.dingyin)? schoolTagsFromDingyinName(g.dingyin.name): [];
}
function toggleSchoolPick(prefix, s){
var sel=schoolSelOf(prefix).slice();
var i=sel.indexOf(s);
if(i>-1) sel.splice(i,1); else sel.push(s);
setSchoolSel(prefix, sel);
}
/* 表单里已选定音能推导出流派、且尚未选任何流派时，默认预选那些流派（可改）。
   读控件里的原始定音名（不走 readDingyin 的校验：武器部位选武学类全名时校验留不住，但预选仍应生效） */
function maybePreselectSchoolFromDingyin(prefix){
if(schoolSelOf(prefix).length) return;
var slotEl=$(prefix==="ocr"? "ocrSlot": "gSlot");
var slot=slotEl? slotEl.value: "";
if(!isWeaponSlot(slot)) return;
var sel=$(prefix+"DingyinType"); if(!sel||!sel.value) return;
var nameEl=$(prefix+"DingyinName");
var name=(sel.value==="__custom__")? (nameEl? String(nameEl.value||"").trim(): ""): sel.value;
var tags=schoolTagsFromDingyinName(name);
if(tags.length) setSchoolSel(prefix, tags);
}
["g","ocr"].forEach(function(prefix){
var pk=$(prefix+"SchoolPick");
if(pk) pk.addEventListener("click", function(e){
var b=e.target.closest("[data-scpick]"); if(!b) return;
toggleSchoolPick(prefix, b.getAttribute("data-scpick"));
});
});

/* ================= 录入表单（词条行可增删） ================= */
var formRowSeq=0;
function affixOptions(sel, slot){
return '<option value="">— 选词条 —</option>'+AFFIX.filter(function(a){ return !(slot&&isWuxiangKey(a.key)&&!isWeaponSlot(slot)); }).map(function(a){ return '<option value="'+a.key+'"'+(a.key===sel?" selected":"")+">"+esc(a.label)+"</option>";}).join("");
}
function refreshAffixRowOptions(container, slot){
if(!container) return;
Array.prototype.forEach.call(container.children, function(div){
var sel=div.querySelector('[data-f="type"]'); if(!sel) return;
var cur=sel.value;
sel.innerHTML=affixOptions(cur, slot);
if(cur&&isWuxiangKey(cur)&&!isWeaponSlot(slot)){ sel.value=""; var ve=div.querySelector('[data-f="val"]'); if(ve) ve.value=""; toast("无相属攻只出现在武器，这一行已清空"); }
else sel.value=cur;
updateFormRow(div);
});
}
function addFormRow(key, val){
formRowSeq++;
var div=document.createElement("div");
div.className="affix-row"; div.id="frow"+formRowSeq;
div.innerHTML='<div class="r1"><select data-f="type" aria-label="词条类型">'+affixOptions(key||"", $("gSlot")? $("gSlot").value: "")+'</select>'
+'<input type="number" data-f="val" step="0.1" min="0" placeholder="数值" aria-label="词条数值" value="'+(val==null?"":val)+'"></div>'
+'<div class="r2"><span data-f="ref">选词条后显示满值 / 承音参考</span>'
+'<button class="btn mini" type="button" data-f="fillmax">填满值</button>'
+'<button class="btn mini" type="button" data-f="fillcy">填承音</button>'
+'<button class="btn mini danger" type="button" data-f="del">删此行</button></div>';
$("gAffixes").appendChild(div);
updateFormRow(div);
return div;
}
function updateFormRow(div){
var type=div.querySelector('[data-f="type"]').value;
var valEl=div.querySelector('[data-f="val"]');
var ref=div.querySelector('[data-f="ref"]');
var a=AFFIX_BY_KEY[type];
if(!a){ ref.textContent="选词条后显示满值 / 承音参考"; return;}
var v=valEl.value===""?null:parseFloat(valEl.value);
var pct=(v==null)?"":" · "+qualityBarHtml(v/a.max*100)+" · 达成 "+fmt(Math.min(1,v/a.cy)*100,0)+"%（÷承音）";
var warn=(v!=null&&v>a.max)? ' <span class="tag red">数值超过满值，请核对</span>':"";
ref.innerHTML="满值 <b>"+a.max+(a.unit||"")+"</b> · 承音 <b>"+a.cy+(a.unit||"")+"</b>"+pct+warn;
}
$("gAffixes").addEventListener("change", function(e){
var div=e.target.closest(".affix-row"); if(!div) return;
if(e.target.getAttribute("data-f")==="type"){
var valEl=div.querySelector('[data-f="val"]');
if(!e.target.value) valEl.value="";
}
updateFormRow(div);
});
$("gAffixes").addEventListener("input", function(e){
var div=e.target.closest(".affix-row"); if(div) updateFormRow(div);
});
$("gAffixes").addEventListener("click", function(e){
var btn=e.target.closest("button"); if(!btn) return;
var div=e.target.closest(".affix-row"); if(!div) return;
var f=btn.getAttribute("data-f");
var a=AFFIX_BY_KEY[div.querySelector('[data-f="type"]').value];
var valEl=div.querySelector('[data-f="val"]');
if(f==="fillmax"&&a) valEl.value=a.max;
if(f==="fillcy"&&a) valEl.value=a.cy;
if(f==="del"){ if($("gAffixes").children.length>1){ div.remove();} else { div.querySelector('[data-f="type"]').value=""; valEl.value=""; updateFormRow(div);} return;}
updateFormRow(div);
});
$("gSlot").addEventListener("change", function(){
gSlotConfirmed=true;
refreshAffixRowOptions($("gAffixes"), this.value);
setupDingyinControls("g", this.value, readDingyin("g", this.value)&&readDingyin("g", this.value).name? readDingyin("g", this.value): null);
refreshSchoolBox("g");
});
$("btnAddRow").addEventListener("click", function(){
if($("gAffixes").children.length>=8){ toast("一件装备最多录 8 条词条"); return;}
addFormRow();
});
function readGearForm(){
var lines=[];
Array.prototype.forEach.call($("gAffixes").children, function(div){
var k=div.querySelector('[data-f="type"]').value; if(!k) return;
var raw=div.querySelector('[data-f="val"]').value;
var v=(raw==="")? null: parseFloat(raw);
if(v==null||!isFinite(v)||v<0){ toast("有词条没填有效数值，已跳过未填 / 无效的行"); return; }
lines.push({key:k, val:v});
});
return lines.slice(0,8);
}
function resetGearForm(){
gSlotConfirmed=false;
$("gName").value=""; $("gAffixes").innerHTML="";
for(var i=0;i<5;i++) addFormRow();
setSchoolSel("g", []);
setupDingyinControls("g", $("gSlot").value, null);
}
function addGear(slot, name, lines, dingyin, schools){
var sg=sanitizeGearData({slot:slot, name:name||"", lines:lines||[], dingyin:dingyin||null, schools:schools||[]});
while(findGear(nextId)) nextId++;
var g=sg.gear; g.id=nextId++;
lib.push(g); return g;
}
/* 编辑：原地更新同一件（id 不变，搭配引用与模拟档位不失效），校验与新录入一致（同一 sanitize） */
function updateGear(id, slot, name, lines, dingyin, schools){
var old=findGear(id); if(!old) return null;
var oldSlot=old.slot;
var sg=sanitizeGearData({id:id, slot:slot, name:name||"", lines:lines||[], dingyin:dingyin||null, schools:(schools===undefined? gearSchoolTags(old): schools)});
var ng=sg.gear;
old.slot=ng.slot; old.name=ng.name; old.lines=ng.lines; old.dingyin=ng.dingyin; old.schools=ng.schools; delete old.wuxue; old.warnings=ng.warnings;
/* 第 40 节：部位变更后，搭配位置与新部位不同池的引用清掉；武器池内（主 / 副互通）位置保留，不自动搬位 */
if(oldSlot!==ng.slot){ SLOTS.forEach(function(s){ if(loadout[s]===id&&gearSlotOf(s)!==ng.slot) delete loadout[s]; }); }
return old;
}
/* 把一件装备选入搭配，返回落位的位置名：武器进武器池位置（有指定位置优先，其次主武器空位、副武器空位、再主武器）；其余进同名位置 */
function equipToPosition(g, preferredPos){
if(!g) return "";
if(isWeaponSlot(g.slot)){
var pos=(preferredPos==="副武器"||preferredPos==="主武器")? preferredPos: "";
if(!pos) pos=!loadout["主武器"]? "主武器": (!loadout["副武器"]? "副武器": "主武器");
loadout[pos]=g.id; return pos;
}
loadout[g.slot]=g.id; return g.slot;
}
function startEditGear(id){
var g=findGear(id); if(!g) return;
editingGearId=id;
$("gSlot").value=g.slot; gSlotConfirmed=true;
$("gName").value=g.name||"";
$("gAffixes").innerHTML="";
if(g.lines.length) g.lines.forEach(function(l){ addFormRow(l.key, l.val); });
else addFormRow();
setupDingyinControls("g", g.slot, g.dingyin);
setSchoolSel("g", schoolPreselect(g));
$("btnAddGear").textContent="保存修改";
$("btnCancelEdit").style.display="";
refreshNeedPick();
$("gName").scrollIntoView({behavior:"smooth", block:"center"});
}
function cancelEditGear(){
editingGearId=null;
$("btnAddGear").textContent="录入";
$("btnCancelEdit").style.display="none";
resetGearForm();
}
$("btnAddGear").addEventListener("click", function(){
var lines=readGearForm();
if(!lines.length){ toast(editingGearId? "至少保留一条词条": "至少选一条词条再录入"); return;}
var dy=readDingyin("g", $("gSlot").value);
if(dy&&dy.invalid){ toast("定音数值无效，已只存词条"); dy=null; }
if(editingGearId){
var ug=updateGear(editingGearId, $("gSlot").value, $("gName").value.trim(), lines, dy, schoolSelOf("g").slice());
cancelEditGear();
saveStore();
toast("已更新："+(ug? ug.slot: "")+(ug&&ug.warnings.length? "；"+ug.warnings[0]:""));
renderAll(false);
return;
}
var g=addGear($("gSlot").value, $("gName").value.trim(), lines, dy, schoolSelOf("g").slice());
saveStore();
toast("已录入："+g.slot+"（"+g.lines.length+" 条词条）"+(g.warnings.length? "；"+g.warnings[0]:""));
resetGearForm();
renderAll(false);
});
$("btnCancelEdit").addEventListener("click", function(){ cancelEditGear(); });
/* 示例装备：按 鸣金-虹·玉斗 配方凑满 40 条，数值取承音值 */
function loadDemo(){
var CY={}; AFFIX.forEach(function(a){ CY[a.key]=a.cy;});
function L(keys){ return keys.map(function(k){ return {key:k, val:CY[k]};});}
var demo=[
["武器","示例 · 玉斗长剑", L(["dawai","dawai","jin","huiyi","wuqizeng"]), {name:"外功穿透", val:12.6}],
["武器","示例 · 玉斗副剑", L(["dawai","dawai","jin","huiyi","shi"]), {name:"外功穿透", val:11.4}],
["冠胄","示例 · 玉斗冠胄", L(["huiyi","dawai","jin","shi","huiyi"]), {name:"无名剑法·蓄力技增伤", val:5.6}],
["胸甲","示例 · 玉斗胸甲", L(["huiyi","dawai","jin","shi","huiyi"]), {name:"无名剑法·蓄力技增伤", val:4.2}],
["环","示例 · 玉斗环", L(["dawai","dawai","shi","jin","quanwu"]), {name:"外功穿透", val:10.8}],
["佩","示例 · 玉斗佩", L(["dawai","dawai","shi","jin","quanwu"]), {name:"外功穿透", val:12.1}],
["胫甲","示例 · 玉斗胫甲", L(["jin","dawai","shi","jin","shouling"]), {name:"无名剑法·蓄力技增伤", val:5.1}],
["腕甲","示例 · 玉斗腕甲", L(["jin","dawai","shi","jin","shouling"]), {name:"无名剑法·蓄力技增伤", val:4.7}]
];
demo.forEach(function(d){ addGear(d[0], d[1], d[2], d[3]);});
setTarget(0);
autoCombine(true);
saveStore();
toast("示例已载入");
renderAll(false);
}
$("btnDemo").addEventListener("click", loadDemo);

/* ================= 装备库渲染 ================= */
function renderLib(){
$("libCount").textContent=lib.length;
var build=BUILDS[targetIdx];
var html="";
lib.forEach(function(g){
var eq=isEquipped(g.id);
if(libFilterVal==="equipped"&&!eq) return;
if(libFilterVal==="free"&&eq) return;
html+='<div class="gear-item'+(eq?" equipped":"")+(isHeirloom(g,build)?" heirloom":"")+'">'+heirloomPendantHtml(g,build)+'<h4><span class="tag bronze">'+esc(g.slot)+"</span>"
+(g.name? esc(g.name):'<span class="note">未命名</span>')
+(eq?'<span class="tag">已选入搭配</span>':"")
+verdictBadgeHtml(g,build)
+'<span class="note" style="margin-left:auto">单件评分 <b style="color:var(--teal)">'+gearScore(g,build)+'</b> · 数值达成 '+fmt(gearQuality(g)*100,0)+'%</span></h4>'
+'<div class="lines">'+gearLinesHtml(g)+"</div>"
+(isWeaponSlot(g.slot)? schoolRowHtml(g): "")
+'<div class="ops">'
+(eq? '<button class="btn small" type="button" data-act="unequip" data-id="'+g.id+'">移出搭配</button>'
: '<button class="btn small" type="button" data-act="equip" data-id="'+g.id+'">选入'+esc(g.slot)+"</button>")
+'<button class="btn small" type="button" data-act="edit" data-id="'+g.id+'">编辑</button>'
+'<button class="btn small danger" type="button" data-act="del" data-id="'+g.id+'">删除</button>'
+"</div></div>";
});
$("libList").innerHTML=html;
$("libEmpty").style.display=lib.length? "none":"block";
if(lib.length&&!html) $("libList").innerHTML='<div class="empty">这个筛选下没有装备。</div>';
}
$("libFilter").addEventListener("click", function(e){
var b=e.target.closest("button"); if(!b) return;
libFilterVal=b.getAttribute("data-f");
this.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x===b);});
renderLib();
});
$("libList").addEventListener("click", function(e){
/* 流派标签（第 38 节上线、第 39 节换标尺）：多选面板里点 chip 即切换并立刻保存；「流派」按钮展开/收起面板 */
var scb=e.target.closest("[data-sc]");
if(scb){
var sgid=parseInt(scb.getAttribute("data-gid"),10), sg2=findGear(sgid); if(!sg2) return;
var nowOn=toggleGearSchool(sgid, scb.getAttribute("data-sc"));
scb.classList.toggle("on", nowOn);
var srow=scb.closest(".wxrow"); var sch=srow? srow.querySelector(".wxchips"): null;
if(sch) sch.innerHTML=schoolChipsHtml(sg2);
return;
}
var sbtn=e.target.closest('[data-act="schools"]');
if(sbtn){
var srow2=sbtn.closest(".wxrow"); var spk=srow2? srow2.querySelector(".wxpicker"): null;
if(spk) spk.style.display=(spk.style.display==="none")? "flex": "none";
return;
}
var b=e.target.closest("[data-act]"); if(!b) return;
var id=parseInt(b.getAttribute("data-id"),10), g=findGear(id); if(!g) return;
var act=b.getAttribute("data-act");
if(act==="equip"){ var epos=equipToPosition(g); toast("已选入搭配："+epos);}
if(act==="unequip"){ SLOTS.forEach(function(s){ if(loadout[s]===id) delete loadout[s]; }); toast("已移出搭配");}
if(act==="edit"){ startEditGear(id); }
if(act==="del"){ if(editingGearId===id) cancelEditGear(); lib=lib.filter(function(x){ return x.id!==id;}); delete simTierById[id]; SLOTS.forEach(function(s){ if(loadout[s]===id) delete loadout[s]; }); toast("已删除");}
saveStore(); renderAll(false);
});
$("btnClearLib").addEventListener("click", function(){ if(editingGearId) cancelEditGear(); lib=[]; loadout={}; simTierById={}; saveStore(); toast("已清空"); renderAll(false);});

/* ================= 组合搭配（部位下拉） ================= */
function renderLoadout(){
var build=BUILDS[targetIdx];
var html="";
SLOTS.forEach(function(s){
var g=loadout[s]?findGear(loadout[s]):null;
/* 第 40 节：候选按部位池取（武器两位置同池）；另一武器位置已选的那件不进本下拉（同一件不能同占两位置） */
var cands=lib.filter(function(x){ return gearSlotOf(x.slot)===gearSlotOf(s)&&weaponUsableForBuild(x, build);});
var sibPos=(s==="主武器")? "副武器": ((s==="副武器")? "主武器": null);
if(sibPos&&loadout[sibPos]) cands=cands.filter(function(x){ return x.id!==loadout[sibPos]; });
if(g&&cands.indexOf(g)<0) cands.push(g); /* 已选入的那件即使标签不合也留在下拉里，不悄悄换掉 */
var opts='<option value="">— 留空 —</option>'+cands.map(function(x){
return '<option value="'+x.id+'"'+(g&&x.id===g.id?" selected":"")+">"+esc(x.name||"未命名")+"（评分 "+gearScore(x,build)+"）</option>";
}).join("");
var simT=g? (simTierById[g.id]||""): "";
html+='<div class="slotbox'+(g?" filled":"")+(simT?" simming":"")+(g&&isHeirloom(g,build)?" heirloom":"")+'">'+heirloomPendantHtml(g,build)+"<h4>"+s+(g?'<span style="display:inline-flex;gap:6px;align-items:center"><span class="tag">单件评分 '+gearScore(g,build)+"</span>"+verdictBadgeHtml(g,build)+"</span>":"")+"</h4>"
+'<select data-slot="'+s+'" aria-label="'+s+'选择装备">'+opts+"</select>"
+(g? '<div class="glines">'+gearLinesHtml(g)+"</div>": '<div class="note">未选装备'+(cands.length?"":"（装备库里还没有这个部位）")+"</div>")
+(g? '<div class="seg simseg" data-simseg="'+s+'">'+'<button type="button" data-sim=""'+(simT===""?' class="on"':"")+'>实际</button>'+'<button type="button" data-sim="cy"'+(simT==="cy"?' class="on"':"")+'>承音</button>'+'<button type="button" data-sim="max"'+(simT==="max"?' class="on"':"")+'>满值</button></div>': "")
+'<div><button class="btn mini" type="button" data-ocr-slot="'+s+'">截图导入</button></div>'
+"</div>";
});
$("loadout").innerHTML=html;
}
$("loadout").addEventListener("change", function(e){
var sel=e.target.closest("select[data-slot]"); if(!sel) return;
var s=sel.getAttribute("data-slot");
if(sel.value){ var nid=parseInt(sel.value,10); SLOTS.forEach(function(s2){ if(s2!==s&&loadout[s2]===nid) delete loadout[s2]; }); loadout[s]=nid; }
else delete loadout[s];
saveStore(); renderAll(false);
});
$("loadout").addEventListener("click", function(e){
var b=e.target.closest("[data-sim]"); if(!b) return;
var seg=b.closest("[data-simseg]"); if(!seg) return;
var slot=seg.getAttribute("data-simseg");
var gid=loadout[slot]; if(!gid) return;
var tier=b.getAttribute("data-sim");
if(tier) simTierById[gid]=tier; else delete simTierById[gid];
saveStore(); renderAll(false);
});
$("btnUnequipAll").addEventListener("click", function(){ loadout={}; saveStore(); toast("已全部留空"); renderAll(false);});
/* 一键最优优先级（第 36 节站长定版）：配方词条类分四档，比较走字典序——
   一档 主攻类（配方主打的小外 / 大外）+ 主五维类（配方里条数最多的五维）；二档 三率类（精准 / 会心 / 会意）；
   三档 神力类（首领 / 全武学 / 武器增效 / 玩家 / 全奇术）；四档 属攻类（shugong：本系大小 + 无相大小）。
   先比一档封顶命中，再比二三四档；同档全平再比数值达成（承音封顶比之和）、定音得分、既有确定性顺序。
   返回 {类别: 档位 0..4}；不在四档的类（非主攻的另一外攻、非主五维）不计档。
   第 43 节（站长定版）火拳特例：school = 牵丝-霖（火拳）的 build，全奇术增伤是「必需」、优先级压过一档——
   quanqi 单独提为 0 档（最顶档），同时从三档神力摘出避免重复计；其他 build 的全奇术仍留三档、一律不动。
   站长原话：小外奶先 12 小外 + 8 敏（一档）、然后三率、然后神力；火拳在此之上全奇术必需、压过这一切。 */
var TIER_RATE={jingzhun:1, huixin:1, huiyi:1};
var TIER_DIVINE={shouling:1, quanwu:1, wuqizeng:1, wanjia:1, quanqi:1};
var FIVE_DIM_CLS=["ti","jin","yu","min","shi"];
function buildTiers(build){
var atkN={dawai:0, xiaowai:0}, dimN={}, dimMax=0;
build.targets.forEach(function(t){
if(t.flex) return;
if(t.cls==="dawai"||t.cls==="xiaowai") atkN[t.cls]+=t.n;
if(FIVE_DIM_CLS.indexOf(t.cls)>-1){ dimN[t.cls]=(dimN[t.cls]||0)+t.n; if(dimN[t.cls]>dimMax) dimMax=dimN[t.cls]; }
});
var mainAtk;
if(build.cat&&build.cat.indexOf("小外")===0) mainAtk="xiaowai";
else if(build.cat&&build.cat.indexOf("大外")===0) mainAtk="dawai";
else mainAtk=atkN.xiaowai>atkN.dawai? "xiaowai": "dawai";
var tierOf={};
tierOf[mainAtk]=1;
FIVE_DIM_CLS.forEach(function(c){ if(dimMax>0&&dimN[c]===dimMax) tierOf[c]=1; });
Object.keys(TIER_RATE).forEach(function(c){ tierOf[c]=2; });
Object.keys(TIER_DIVINE).forEach(function(c){ tierOf[c]=3; });
tierOf.shugong=4;
tierOf.shu_ls_da=4; /* 第 42 节：裂石-威新条目的大裂石独立类同归属攻档（与 shugong 同档同排位） */
if(build.school==="牵丝-霖（火拳）") tierOf.quanqi=0; /* 第 43 节：火拳全奇术必需、提 0 档（覆盖三档赋值，即从神力档摘出） */
return tierOf;
}
/* 第 43 节：整套搭配的档位向量——按配方目标封顶统计各档命中条数（下标 = 档位 0..4；flex 组按档位从高到低归属，与 autoCombine 同法）。
   建议引擎用它与一键最优共用同一套优先级口径：一档改善压过纯数值增益。 */
function tierVectorOf(panel, build, tierOf){
var v=[0,0,0,0,0];
var cc={};
Object.keys(panel.classCounts).forEach(function(c){ cc[c]=panel.classCounts[c]||0; });
build.targets.forEach(function(t){
if(t.flex){
var avail=0; t.flex.forEach(function(c){ avail+=cc[c]||0; });
var take=Math.min(avail, t.n);
var order=t.flex.slice().sort(function(a,b){ return (tierOf[a]==null?9:tierOf[a])-(tierOf[b]==null?9:tierOf[b]); });
order.forEach(function(c){ if(take<=0) return; var use=Math.min(cc[c]||0, take); if(use>0){ var tr=tierOf[c]; if(tr!=null) v[tr]+=use; cc[c]-=use; take-=use; } });
} else {
var take2=Math.min(cc[t.cls]||0, t.n);
if(take2>0){ var tr2=tierOf[t.cls]; if(tr2!=null) v[tr2]+=take2; cc[t.cls]-=take2; }
}
});
return v;
}
function tierVecCmp(a, b){ for(var i=0;i<5;i++){ if(a[i]!==b[i]) return a[i]>b[i]? 1: -1; } return 0; }
/* 一键最优组合：逐部位贪心（结构不变），比较键换成档位字典序（第 43 节起含火拳 0 档，见 buildTiers）；flex 按组记账不重复计数、命中按档位从高到低归属 */
function autoCombine(silent){
var build=BUILDS[targetIdx];
var tierOf=buildTiers(build);
var need={}, flexGroups=[];
build.targets.forEach(function(t){
if(t.flex) flexGroups.push({keys:t.flex.slice(), remaining:t.n});
else need[t.cls]=(need[t.cls]||0)+t.n;
});
function candidateKey(g){
var cc={};
(g.lines||[]).forEach(function(l){ if(lineQualityPct(l)==null) return; if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)) return; var c=effectiveClassOf(l.key, build); cc[c]=(cc[c]||0)+1; });
var counted={}, hits=[0,0,0,0,0]; /* 下标 = 档位 0..4（0 档仅火拳全奇术，其余 build 恒 0、比较结果与旧四档完全一致） */
Object.keys(cc).forEach(function(c){ if(need[c]!=null){ var take=Math.min(cc[c], Math.max(0,need[c])); if(take>0){ counted[c]=take; var t=tierOf[c]; if(t!=null) hits[t]+=take; } } });
flexGroups.forEach(function(fg){
var pool={};
fg.keys.forEach(function(c){ pool[c]=Math.max(0,(cc[c]||0)-(counted[c]||0)); });
var avail=0;
fg.keys.forEach(function(c){ avail+=pool[c]; });
var take=Math.min(avail, Math.max(0,fg.remaining));
var order=fg.keys.slice().sort(function(a,b){ return (tierOf[a]==null?9:tierOf[a])-(tierOf[b]==null?9:tierOf[b]); });
order.forEach(function(c){ if(take<=0) return; var use=Math.min(pool[c]||0, take); if(use>0){ counted[c]=(counted[c]||0)+use; var t=tierOf[c]; if(t!=null) hits[t]+=use; take-=use; } });
});
var valueSum=0, topVal=0;
(g.lines||[]).forEach(function(l){ if(lineQualityPct(l)==null) return; if(isWuxiangKey(l.key)&&!isWeaponSlot(g.slot)) return; var sc=lineValueScore(l); valueSum+=sc; if(tierOf.quanqi===0&&effectiveClassOf(l.key, build)==="quanqi") topVal+=sc; });
var dyPart=0;
if(g.dingyin&&dingyinTypeCorrect(g.dingyin.name, g.slot, build)){
var dmx=dingyinMax(g.dingyin.name, g.slot);
var dv=(typeof g.dingyin.val==="number")? g.dingyin.val: parseVal(g.dingyin.val);
if(dmx&&dv!=null&&isFinite(dv)) dyPart=Math.min(1, Math.max(0,dv)/dmx);
}
/* 比较键（第 43 节）：[0 档条数， 0 档数值， 一档， 二档， 三档， 四档， 全体数值达成， 定音]——
   先把 0 档（火拳全奇术）条数凑满、再比该档数值，然后才轮到原一~四档；非火拳 build 前两项恒 0、与旧键等价 */
return [hits[0], topVal, hits[1], hits[2], hits[3], hits[4], valueSum, dyPart];
}
function keyGreater(a, b){
if(a[0]!==b[0]) return a[0]>b[0];
if(Math.abs(a[1]-b[1])>1e-9) return a[1]>b[1];
for(var i=2;i<6;i++){ if(a[i]!==b[i]) return a[i]>b[i]; }
if(Math.abs(a[6]-b[6])>1e-9) return a[6]>b[6];
return a[7]>b[7]+1e-9;
}
function consume(g){
var cc={};
(g.lines||[]).forEach(function(l){ if(lineQualityPct(l)==null) return; var c=effectiveClassOf(l.key, build); cc[c]=(cc[c]||0)+1; });
Object.keys(cc).forEach(function(c){ if(need[c]!=null){ var take=Math.min(cc[c], Math.max(0,need[c])); need[c]-=take; cc[c]-=take; } });
flexGroups.forEach(function(fg){
var avail=0; fg.keys.forEach(function(c){ avail+=cc[c]||0; });
var take=Math.min(avail, Math.max(0,fg.remaining));
fg.remaining-=take;
});
}
var used={}, next={}, fallbackUsed=false;
SLOTS.forEach(function(s){
/* 第 40 节：按部位池取候选——武器两位置从同一武器池先后挑两件不同的（used 防同件占两位） */
var cands=lib.filter(function(g){ return gearSlotOf(g.slot)===gearSlotOf(s)&&!used[g.id]&&weaponUsableForBuild(g, build);});
var best=null, bestKey=null, bestFallback=null, bestFallbackQ=-1;
cands.forEach(function(g){
var key=candidateKey(g);
if(!best||keyGreater(key, bestKey)){ bestKey=key; best=g; }
var q=gearQuality(g);
if(q>bestFallbackQ||(q===bestFallbackQ&&bestFallback&&g.lines.length>bestFallback.lines.length)){ bestFallbackQ=q; bestFallback=g; }
});
var bestHits=bestKey? bestKey[0]+bestKey[2]+bestKey[3]+bestKey[4]+bestKey[5]: 0; /* 五档条数分量之和（键下标 0 与 2..5） */
var chosen=(best&&bestHits>0)? best: bestFallback;
if(chosen){ if(chosen===bestFallback&&!(best&&bestHits>0)) fallbackUsed=true; next[s]=chosen.id; used[chosen.id]=true; consume(chosen); }
});
loadout=next;
if(!silent) toast(Object.keys(next).length? ("已拼好"+(fallbackUsed? "（含兜底选装）":"")):"装备库为空");
}
$("btnAuto").addEventListener("click", function(){ autoCombine(false); saveStore(); renderAll(false);});

/* ================= 面板与毕业度渲染 ================= */
function rateStatus(white, yellow, cap, base, res, perBarVal, barName, dec){
var d=(dec==null?1:dec);
var needWhite=base+(cap-base)*res;
if(yellow>=cap-0.001){
var over=white-needWhite;
return '<span class="ok">✓ 已满值</span>'+(over>0.05?'，溢出 <b>'+fmt(over,1)+'%</b>':"");
}
var lack=needWhite-white;
var bars=Math.ceil(lack/perBarVal-1e-9);
return '还差白字 <span class="lack">'+fmt(lack,d)+'%</span>（满值 '+fmt(needWhite,d)+'%）≈ <b>'+bars+' 条</b>'+barName;
}
function renderPanel(){
var build=BUILDS[targetIdx];
var extras=currentExtras();
var simOn=anySim(), realPanel=null, realGrad=null;
if(simOn){
var savedSimTier=simTierById; simTierById={};
realPanel=computePanel(loadout, extras); realGrad=graduation(realPanel, build);
simTierById=savedSimTier;
}
var panel=computePanel(loadout, extras);
var grad=graduation(panel, build);
var loanGrad=loanGraduation(build);
var qKey=targetIdx+"|"+JSON.stringify(loadout)+"|"+JSON.stringify(collectBaseState().values);
if(window.__quickKey!==qKey){ quickDirty=false; window.__quickKey=qKey; }
$("scorePct").textContent=fmt(grad.total*100,1)+"%";
var simLineEl=$("simLine");
if(simLineEl){ if(simOn&&realGrad){ var simDiff=(grad.total-realGrad.total)*100; simLineEl.style.display="block"; simLineEl.innerHTML="真实 <b>"+fmt(realGrad.total*100,1)+"%</b> · 模拟 <b>"+fmt(grad.total*100,1)+"%</b>（"+(simDiff>=0?"+":"")+fmt(simDiff,1)+"）"; } else simLineEl.style.display="none"; }
var simMarkEl=$("simMark"); if(simMarkEl) simMarkEl.style.display=simOn? "inline-block": "none";
$("loanScorePct").textContent=fmt(loanGrad.total*100,1)+"%";
var loanDiff=(loanGrad.total-grad.total)*100;
$("loanScoreSub").textContent="（差 "+(loanDiff>=0?"+":"")+fmt(loanDiff,1)+"）";
$("scoreSub").textContent="词条 "+grad.got+"/"+grad.totalBars+" · 装备 "+panel.equipped.length+"/8";
$("scoreTarget").innerHTML="目标配方（"+esc(build.school)+" · "+esc(build.set)+" · 推荐弓 "+esc(recommendBowLabel(build)||"无")+"）："+esc(build.recipe)+(build.note?'｜<b>'+esc(build.note)+"</b>":"");
var subs=[
["条数", "×40%", grad.A],
["数值", "×24%", grad.B]
];
if(gradDingyinOn) subs.push(["定音", "×20%", grad.D]); /* 第 41 节：定音不计时分项行不列 */
var dyTgl=$("gradDyToggle"); if(dyTgl) dyTgl.checked=gradDingyinOn;
$("subScores").innerHTML=subs.map(function(s){
return '<div class="srow"><span>'+s[0]+' <span style="color:var(--muted);font-size:11px;font-weight:400">'+s[1]+'</span></span><span class="bar"><i style="width:'+fmt(s[2]*100,1)+'%"></i></span><b>'+fmt(s[2]*100,1)+"%</b></div>";
}).join("");
/* 三率对照已于第 41 节整段隐藏（站长裁定）：白/黄三率照常计算（方案对比、速算器仍用），面板卡不再渲染三率段 */
var S=panel.sums;
var B=panel.base;
var wuwei=[
{k:"体", v:fmt(Math.floor(panel.ti),0), src:"角色基础 "+fmt(B.ti,0)+" ＋ 装备词条 "+fmt(S.ti||0,0)+"（显示按游戏口径截断）"},
{k:"劲", v:fmt(Math.floor(panel.jin),0), src:"角色基础 "+fmt(B.jin,0)+" ＋ 装备词条 "+fmt(S.jin||0,0)+"（显示截断）"},
{k:"御", v:fmt(Math.floor(panel.yu),0), src:"角色基础 "+fmt(B.yu,0)+" ＋ 装备词条 "+fmt(S.yu||0,0)+"（显示截断）"},
{k:"敏", v:fmt(Math.floor(panel.min),0), src:"角色基础 "+fmt(B.min,0)+" ＋ 装备词条 "+fmt(S.min||0,0)+"（总敏另折算会心；显示截断，折算按实际值）"},
{k:"势", v:fmt(Math.floor(panel.shi),0), src:"角色基础 "+fmt(B.shi,0)+" ＋ 装备词条 "+fmt(S.shi||0,0)+"（总势另折算会意；显示截断，折算按实际值）"},
];
var wuweiKvEl=$("wuweiKv"); if(wuweiKvEl) wuweiKvEl.innerHTML=wuwei.map(function(it){ return '<div class="item big"><div class="k">'+it.k+'</div><div class="v">'+it.v+'</div><div class="src">'+it.src+"</div></div>"; }).join("");
/* 基础属性汇总（panelKv）已于第 36 节移除：kv 明细不再渲染，panel 数值照常计算 */
/* 增伤汇总已于第 41 节整段移除（站长裁定：只是词条有无的罗列、与差缺清单重复）：增伤词条合计照常计算（panel.sums），面板卡不再渲染该段 */
var dyNames=Object.keys(panel.dingyinTotals);
$("dingyinKv").innerHTML=(dyNames.length? dyNames.map(function(n){
var isL=DINGYIN_LEFT[n]!=null;
return '<div class="item"><div class="k">'+esc(n)+'</div><div class="v">'+fmt(panel.dingyinTotals[n],1)+(isL?"":"%")+'</div><div class="src">已选装备定音合计'+(isL?"":"（%）")+'</div></div>';
}).join(""): '<div class="item"><div class="k">定音</div><div class="v">未录入</div><div class="src">在录入 / OCR 核对时可给每件装备选定音</div></div>');
var dyOk=grad.dingyinRows.filter(function(r){ return r.correct; }).length;
var dyWrong=grad.dingyinRows.filter(function(r){ return r.has&&!r.correct; });
$("dingyinNotes").innerHTML="定音 <b>"+fmt(grad.D*100,1)+"%</b>（类型对 "+dyOk+" / 8 件）"
+(dyWrong.length? '；<span class="diff-lack">类型不对、按 0 计：'+dyWrong.map(function(r){ return esc(r.slot)+"「"+esc(r.name)+"」"; }).join("、")+"</span>":"");
$("baseNotes").innerHTML=B.notes? "备注："+esc(B.notes):"";
updateBaseSummary();
/* 差缺清单 */
var html="", lackTxt=[], overTxt=[];
grad.rows.forEach(function(r){
var d=r.cur-r.n;
var dh=d===0?'<span class="diff-ok">✓ 正好</span>':(d<0?'<span class="diff-lack">还差 '+(-d)+' 条</span>':'<span class="diff-over">多 '+d+' 条，可换</span>');
if(d<0) lackTxt.push(r.label+" ×"+(-d));
if(d>0) overTxt.push(r.label+" ×"+d);
html+="<tr><td><b>"+esc(r.label)+"</b>"+(r.flex?' <span class="note">二选一合计</span>':"")+'</td><td class="num">'+r.n+'</td><td class="num">'+r.cur+"</td><td>"+dh+"</td></tr>";
});
var covered={};
build.targets.forEach(function(t){ if(t.flex){ t.flex.forEach(function(k){ covered[k]=true;});} else covered[t.cls]=true;});
Object.keys(panel.classCounts).forEach(function(c){
if(!covered[c]) html+="<tr><td><b>"+esc(CLASS_LABEL[c]||c)+'</b> <span class="note">配方外</span></td><td class="num">0</td><td class="num">'+panel.classCounts[c]+'</td><td><span class="diff-over">配方外词条</span></td></tr>';
});
$("diffBody").innerHTML=html;
var lows=grad.lowLines.slice().sort(function(a,b){ return a.score-b.score;});
if(lows.length){
$("lowList").innerHTML="<b>偏低词条</b>：<ul class='tight'>"
+lows.slice(0,10).map(function(x){
var a=AFFIX_BY_KEY[x.line.key];
return "<li>"+esc(x.gear.slot)+"「"+esc(x.gear.name||"未命名")+"」"+esc(a.label)+" "+(x.line.val==null?"未填数值":fmt(+x.line.val,1)+(a.unit||""))+" / 承音 "+a.cy+(a.unit||"")+"，达成 <b>"+fmt(x.score*100,0)+"%</b></li>";
}).join("")+"</ul>"+(lows.length>10?'<p class="note">还有 '+(lows.length-10)+" 条未列出。</p>":"");
} else {
$("lowList").innerHTML=panel.equipped.length? "<b>偏低词条</b>：无。":"";
}
var v="";
if(grad.total>=0.999) v="<b>✓ 毕业。</b>";
else{
if(lackTxt.length) v+="还差：<b>"+lackTxt.join("、")+"</b>。";
if(overTxt.length) v+=" 多出：<b>"+overTxt.join("、")+"</b>。";
if(!panel.equipped.length) v="还没选装备。";
if(panel.invalidLines.length) v+=" <b>异常：</b>"+panel.invalidLines.length+" 条无相在非武器部位，未计入。";
}
$("diffVerdict").innerHTML=v;
renderSuggestions();
checkHeirloomParty();
if(!quickDirty&&typeof syncQuickFromPanel==="function") syncQuickFromPanel(panel, extras);
return {panel:panel, grad:grad, loanGrad:loanGrad, realPanel:realPanel, realGrad:realGrad};
}
$("btnCopySummary").addEventListener("click", function(){
var build=BUILDS[targetIdx];
var r=renderPanel(); var rp=r.realPanel||r.panel; var rg=r.realGrad||r.grad;
var lines=[""+build.school+" · "+build.set+"套（弓 "+(currentExtras().bowLabel||"无")+"）",
"毕业度 "+fmt(rg.total*100,1)+"%（条数 "+fmt(rg.A*100,1)+"% · 数值 "+fmt(rg.B*100,1)+"% · 定音 "+fmt(rg.D*100,1)+"%） · 满值模拟 "+fmt(r.loanGrad.total*100,1)+"%",
"黄字三率：精准 "+fmt(rp.yAcc,1)+"% / 会心 "+fmt(rp.yCrit,1)+"% / 会意 "+fmt(rp.yInt,1)+"%",
"大外 "+fmt(rp.dawai,1)+" · 小外 "+fmt(rp.xiaowai,1)+" · 大属 "+fmt(rp.dashu,1)+" · 小属 "+fmt(rp.xiaoshu,1)];
lines.push("角色基础：已计入（当前基础值），基础五维 体"+fmt(rp.base.ti,0)+"/劲"+fmt(rp.base.jin,0)+"/御"+fmt(rp.base.yu,0)+"/敏"+fmt(rp.base.min,0)+"/势"+fmt(rp.base.shi,0));
SLOTS.forEach(function(s){
var g=loadout[s]?findGear(loadout[s]):null;
lines.push(s+"："+(g? ((g.name||"未命名")+"（评分 "+gearScore(g,build)+"）"): "未选"));
});
var text=lines.join("\n");
function done(){ toast("已复制");}
function fallback(){
var ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta); ta.select();
try{ document.execCommand("copy"); done();}catch(e){ toast("复制失败，请手动记录");}
document.body.removeChild(ta);
}
if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done, fallback);} else fallback();
});
["inRes","extraAcc","extraCrit","extraInt"].forEach(function(id){ $(id).addEventListener("input", function(){ renderPanel(); saveStore();});});

/* ================= 方案对比 ================= */
function renderSchemes(){
$("schemeBody").innerHTML=schemes.map(function(sc, i){
return "<tr><td><b>"+esc(sc.name)+'</b><div class="note">条数 '+fmt(sc.grad.A*100,0)+"% · 数值 "+fmt(sc.grad.B*100,0)+"% · 定音 "+fmt((sc.grad.D||0)*100,0)+"% · 满值模拟 "+fmt((sc.grad.loan||0)*100,0)+'%</div></td><td class="hide-m">'+esc(sc.buildLabel)+'</td><td class="num"><b>'+fmt(sc.grad.total*100,1)+'%</b></td>'
+'<td class="num">'+fmt(sc.panel.yAcc,1)+'%</td><td class="num">'+fmt(sc.panel.yCrit,1)+'%</td><td class="num">'+fmt(sc.panel.yInt,1)+"%</td>"
+'<td class="num hide-m">'+fmt(sc.panel.dawai,1)+'</td><td class="num hide-m">'+fmt(sc.panel.xiaowai,1)+"</td>"
+'<td><button class="btn small" type="button" data-sload="'+i+'">载入</button> <button class="btn small danger" type="button" data-sdel="'+i+'">删除</button></td></tr>';
}).join("");
$("schemeEmpty").style.display=schemes.length? "none":"block";
}
$("btnSaveScheme").addEventListener("click", function(){
if(!Object.keys(loadout).length){ toast("搭配为空"); return;}
var build=BUILDS[targetIdx];
var extras=currentExtras();
var panel=computePanel(loadout, extras);
var grad=graduation(panel, build);
var loan=loanGraduation(build);
var name=$("schemeName").value.trim()||("方案 "+(schemes.length+1));
var loCopy={}; Object.keys(loadout).forEach(function(k){ loCopy[k]=loadout[k];});
schemes.push({name:name, targetIdx:targetIdx, buildLabel:build.school+" · "+build.set, loadout:loCopy,
extras:{res:extras.res, acc:extras.extraAcc, crit:extras.extraCrit, int:extras.extraInt, extraAcc:extras.extraAcc, extraCrit:extras.extraCrit, extraInt:extras.extraInt},
panel:{yAcc:panel.yAcc, yCrit:panel.yCrit, yInt:panel.yInt, dawai:panel.dawai, xiaowai:panel.xiaowai},
grad:{total:grad.total, A:grad.A, B:grad.B, D:grad.D, loan:loan.total}});
$("schemeName").value="";
saveStore();
toast("已存方案："+name);
renderSchemes();
});
$("schemeBody").addEventListener("click", function(e){
var l=e.target.closest("[data-sload]"), d=e.target.closest("[data-sdel]");
if(l){
var sc=schemes[parseInt(l.getAttribute("data-sload"),10)];
setTarget(sc.targetIdx);
loadout={}; Object.keys(sc.loadout).forEach(function(k){ if(findGear(sc.loadout[k])) loadout[k]=sc.loadout[k];});
$("inRes").value=sc.extras.res; $("extraAcc").value=extraFromData(sc.extras,"extraAcc","acc"); $("extraCrit").value=extraFromData(sc.extras,"extraCrit","crit"); $("extraInt").value=extraFromData(sc.extras,"extraInt","int");
saveStore();
toast("已载入："+sc.name);
renderAll(false);
document.getElementById("planner").scrollIntoView({behavior:"smooth"});
}
if(d){ schemes.splice(parseInt(d.getAttribute("data-sdel"),10),1); saveStore(); renderSchemes();}
});

/* ================= 导出 / 导入 ================= */
$("btnExport").addEventListener("click", function(){
var data={app:"gear-planner-100", version:5, targetIdx:targetIdx, extras:currentExtras(), base:collectBaseState(),
bowJue:{kind:bowJueKind, bySchool:bowJueBySchool, confirmed:bowConfirmedBySchool}, schoolConfirmed:schoolConfirmed, sim:simTierById, gradDy:gradDingyinOn,
lib:lib, loadout:loadout, schemes:schemes};
var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
var a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="100阶配装数据.json";
document.body.appendChild(a); a.click();
setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove();},300);
toast("已导出");
});
$("importFile").addEventListener("change", function(){
var f=this.files&&this.files[0]; if(!f) return;
var reader=new FileReader();
reader.onload=function(){
try{
var data=JSON.parse(reader.result);
if(!data||!Array.isArray(data.lib)) throw new Error("bad");
var norm=normalizeGearList(data.lib);
lib=norm.list;
loadout=remapIdMap(data.loadout, norm.firstMap);
if(Array.isArray(data.schemes)) schemes=data.schemes.filter(function(sc){ return sc&&typeof sc==="object"; }).map(function(sc){ var c={}; Object.keys(sc).forEach(function(k){ c[k]=sc[k]; }); c.loadout=remapIdMap(sc.loadout, norm.firstMap); return c; });
if(data.schoolConfirmed) schoolConfirmed=true;
gradDingyinOn=(data.gradDy===false)? false: true; /* 旧导出无 gradDy → 默认计入定音 */
if(data.sim&&typeof data.sim==="object"){ var simImp={}; Object.keys(data.sim).forEach(function(k){ var nid=norm.firstMap[k]; var tv=data.sim[k]; if(nid!=null&&(tv==="cy"||tv==="max")) simImp[nid]=tv; }); simTierById=simImp; }
if(typeof data.targetIdx==="number"&&BUILDS[data.targetIdx]) setTarget(data.targetIdx);
if(data.extras){ $("inRes").value=data.extras.res||1.85; $("extraAcc").value=extraFromData(data.extras,"extraAcc","acc"); $("extraCrit").value=extraFromData(data.extras,"extraCrit","crit"); $("extraInt").value=extraFromData(data.extras,"extraInt","int"); }
if(data.base){ try{ applyBaseState(data.base); updateBaseUI(); }catch(e){} }
if(data.bowJue&&data.bowJue.bySchool&&typeof data.bowJue.bySchool==="object"){ bowJueBySchool={}; bowConfirmedBySchool={}; Object.keys(data.bowJue.bySchool).forEach(function(k){ var v=data.bowJue.bySchool[k]; if(BOW_JUE_VALUES[v]) bowJueBySchool[k]=v; }); if(data.bowJue.confirmed&&typeof data.bowJue.confirmed==="object"){ Object.keys(data.bowJue.confirmed).forEach(function(k){ if(data.bowJue.confirmed[k]) bowConfirmedBySchool[k]=true; }); } applyBowForTarget(); }
else if(data.bow){ var lkImp=bowKindFromLegacyName(data.bow); if(lkImp){ bowJueBySchool[targetSchoolKey()]=lkImp; applyBowForTarget(); } }
saveStore();
toast("已导入 "+lib.length+" 件");
renderAll(false);
}catch(e){ toast("导入失败：文件无效");}
$("importFile").value="";
};
reader.readAsText(f);
});

/* ================= 一键导入：粘贴装备数据代码 ================= */
/* 词条名 -> key：中文全名/简称 + 国际服英文名 + 各系属攻大小写法 */
var PASTE_NAME_TO_KEY = {};
AFFIX.forEach(function(a){ PASTE_NAME_TO_KEY[a.label]=a.key; PASTE_NAME_TO_KEY[a.short]=a.key; });
(function(){
var extra = {
"大无相":"shu_wx_da","小无相":"shu_wx_xiao","无相":"shu_wx_da",
"鸣金大":"shu_mj_da","鸣金小":"shu_mj_xiao","破竹大":"shu_pz_da","破竹小":"shu_pz_xiao","牵丝大":"shu_qs_da","牵丝小":"shu_qs_xiao","裂石大":"shu_ls_da","裂石小":"shu_ls_xiao","双刀增":"wuqizeng","双刀增效":"wuqizeng",
"max physical attack":"dawai","min physical attack":"xiaowai","physical attack":"dawai",
"max bellstrike attack":"shu_mj_da","min bellstrike attack":"shu_mj_xiao",
"max stonesplit attack":"shu_ls_da","min stonesplit attack":"shu_ls_xiao",
"max silkbind attack":"shu_qs_da","min silkbind attack":"shu_qs_xiao",
"max bamboocut attack":"shu_pz_da","min bamboocut attack":"shu_pz_xiao",
"max void attack":"shu_wx_da","min void attack":"shu_wx_xiao","max formless attack":"shu_wx_da","min formless attack":"shu_wx_xiao",
"body":"ti","power":"jin","defense":"yu","agility":"min","momentum":"shi",
"precision rate":"jingzhun","precision":"jingzhun",
"critical rate":"huixin","critical":"huixin",
"affinity rate":"huiyi","affinity":"huiyi",
"all martial arts":"quanwu","vs boss dmg":"shouling","boss dmg":"shouling","boss damage":"shouling",
"single-target mystic":"quanqi","single target mystic":"quanqi",
"area mystic":"quanqi",
"外功攻击":"dawai","最大外功":"dawai","最小外功":"xiaowai",
"全武学":"quanwu","首领增伤":"shouling","对首领增伤":"shouling","玩家增伤":"wanjia",
"单体奇术":"quanqi","群体奇术":"quanqi","单体奇术增伤":"quanqi","群体奇术增伤":"quanqi","全奇术":"quanqi","全奇术增伤":"quanqi"
};
Object.keys(extra).forEach(function(k){ PASTE_NAME_TO_KEY[k]=extra[k]; });
var SYS_KEY_PREFIX={"鸣金":"shu_mj","破竹":"shu_pz","牵丝":"shu_qs","裂石":"shu_ls"};
["鸣金","破竹","牵丝","裂石"].forEach(function(sys){
PASTE_NAME_TO_KEY["大"+sys]=SYS_KEY_PREFIX[sys]+"_da"; PASTE_NAME_TO_KEY["小"+sys]=SYS_KEY_PREFIX[sys]+"_xiao"; PASTE_NAME_TO_KEY[sys+"攻击"]=SYS_KEY_PREFIX[sys]+"_da";
});
})();
function normName(s){ return String(s==null?"":s).trim().toLowerCase().replace(/[\s%％+]/g,""); }
var PASTE_NORM_MAP = {};
Object.keys(PASTE_NAME_TO_KEY).forEach(function(k){ PASTE_NORM_MAP[normName(k)]=PASTE_NAME_TO_KEY[k]; });
function affixKeyFromName(name){
if(name==null) return null;
var raw=String(name).trim();
if(PASTE_NAME_TO_KEY[raw]) return PASTE_NAME_TO_KEY[raw];
if(NAME_TO_CLASS[raw]){ var cls=NAME_TO_CLASS[raw]; return cls==="shugong"? "shu_wx_da": cls; }
var nk=normName(raw);
if(PASTE_NORM_MAP[nk]) return PASTE_NORM_MAP[nk];
var stripped=nk.replace(/(率|增伤|增效|攻击力|攻击)$/,"");
if(PASTE_NORM_MAP[stripped]) return PASTE_NORM_MAP[stripped];
if(/^artof/.test(nk)) return "wuqizeng";
if(nk.indexOf("增效")>-1 && nk.indexOf("全武学")===-1) return "wuqizeng";
return null;
}
/* 部位名 -> 本站装备部位：中文 + 国际服英文 + 数字位 1-8（第 40 节起武器类一律归一到「武器」池） */
var SLOT_ALIAS = {
"主武器":"武器","主武":"武器","武器":"武器","mainweapon":"武器","primaryweapon":"武器","weapon1":"武器","main weapon":"武器","primary weapon":"武器",
"副武器":"武器","副武":"武器","secondaryweapon":"武器","weapon2":"武器","secondary weapon":"武器",
"冠胄":"冠胄","头盔":"冠胄","头部":"冠胄","helmet":"冠胄","head":"冠胄","helm":"冠胄",
"胸甲":"胸甲","衣服":"胸甲","上衣":"胸甲","armor":"胸甲","armour":"胸甲","chest":"胸甲","body armor":"胸甲",
"环":"环","戒指":"环","ring":"环",
"佩":"佩","佩饰":"佩","玉佩":"佩","pendant":"佩","accessory":"佩","amulet":"佩",
"手甲":"武器","拳套":"武器","胫甲":"胫甲","护腿":"胫甲","腿甲":"胫甲","鞋":"胫甲","靴":"胫甲","leggings":"胫甲","legs":"胫甲","greaves":"胫甲","boots":"胫甲",
"腕甲":"腕甲","护腕":"腕甲","臂甲":"腕甲","bracers":"腕甲","bracer":"腕甲","arms":"腕甲","gloves":"腕甲"
};
function slotFromValue(v){
if(v==null) return null;
if(typeof v==="number"){ return (v>=1&&v<=8)? gearSlotOf(SLOTS[v-1]): null; }
var s=String(v).trim();
if(SLOT_ALIAS[s]) return SLOT_ALIAS[s];
var nk=s.toLowerCase().replace(/\s+/g," ");
if(SLOT_ALIAS[nk]) return SLOT_ALIAS[nk];
var nk2=nk.replace(/\s+/g,"");
if(SLOT_ALIAS[nk2]) return SLOT_ALIAS[nk2];
var m=s.match(/^[1-8]$/); if(m) return gearSlotOf(SLOTS[parseInt(s,10)-1]);
return null;
}
function parseVal(v){
if(v==null) return null;
if(typeof v==="number") return isFinite(v)? v: null;
var t=String(v).replace(/[%％\s]/g,"");
if(!t) return null;
if(/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t=t.replace(/,/g,"");
else if(/^-?\d+,\d{1,2}$/.test(t)) t=t.replace(",",".");
else t=t.replace(/,/g,"");
var n=parseFloat(t);
return isNaN(n)? null: n;
}
function adjustVal(key, v){
var a=AFFIX_BY_KEY[key];
if(a&&a.unit==="%"&&v>0&&v<1){
var converted=Math.round(v*1000)/10;
if(converted>a.max*1.5) return v; /* 换算后远超满值时，更像百分点写法（如 0.5 表示 0.5%），按原值收 */
return converted;
}
return v;
}
/* 一段文本里按候选名出现位置切分，可处理一行多条；返回 [{key,val}] */
function parseAffixTextSegments(str){
var norm=ocrClean(String(str||"")).toLowerCase().replace(/\s+/g,"");
if(!norm) return [];
var names=Object.keys(PASTE_NAME_TO_KEY).concat(AFFIX.map(function(a){ return a.label; })).sort(function(a,b){ return b.length-a.length; });
var hits=[];
names.forEach(function(nm){
var nn=nm.toLowerCase().replace(/\s+/g,""); if(!nn) return;
var start=0;
while(true){ var idx=norm.indexOf(nn,start); if(idx===-1) break; hits.push({idx:idx, len:nn.length, name:nm}); start=idx+nn.length; }
});
hits.sort(function(a,b){ return a.idx-b.idx||b.len-a.len; });
var chosen=[];
hits.forEach(function(h){ var last=chosen[chosen.length-1]; if(last&&h.idx<last.idx+last.len) return; chosen.push(h); });
var out=[];
chosen.forEach(function(h,i){
var segEnd=(i+1<chosen.length)? chosen[i+1].idx: norm.length;
var seg=norm.slice(h.idx+h.len, segEnd);
var m=seg.match(/\d+(?:[.,]\d+)?/);
if(!m) return;
var key=affixKeyFromName(h.name); if(!key) return;
var v=parseVal(m[0]); if(v==null||v<0) return;
out.push({key:key, val:adjustVal(key, v)});
});
return out;
}
/* 从各种形态里抽词条行：返回 {lines, unknown} */
function extractLines(node, stat){
var lines=[];
function pushLine(name, val){
var key=affixKeyFromName(name);
var v=parseVal(val);
if(!key||v==null){ stat.unknown++; return; }
lines.push({key:key, val:adjustVal(key, v)});
}
function fromString(str){
var segs=parseAffixTextSegments(str);
if(!segs.length){ stat.unknown++; return; }
segs.forEach(function(sg){ lines.push(sg); });
}
function fromEntry(e){
if(e==null) return;
if(typeof e==="string"){ fromString(e); return; }
if(Array.isArray(e)){
if(e.length>=2&&(typeof e[0]==="string"||typeof e[0]==="number")) pushLine(e[0], e[1]);
else e.forEach(fromEntry);
return;
}
if(typeof e==="object"){
var name=e.name!=null?e.name:(e.attr!=null?e.attr:(e.label!=null?e.label:(e.stat!=null?e.stat:(e.type!=null?e.type:(e.key!=null?e.key:(e.词条!=null?e.词条:(e.属性!=null?e.属性:null)))))));
var val=e.value!=null?e.value:(e.val!=null?e.val:(e.num!=null?e.num:(e.数值!=null?e.数值:(e.amount!=null?e.amount:null))));
if(name!=null&&val!=null){ pushLine(name, val); return; }
var keys=Object.keys(e), hit=0;
keys.forEach(function(k){ if(affixKeyFromName(k)){ pushLine(k, e[k]); hit++; }});
if(!hit) stat.unknown++;
}
}
if(Array.isArray(node)) node.forEach(fromEntry);
else if(node&&typeof node==="object"){
var keys=Object.keys(node), hit=0;
keys.forEach(function(k){ if(affixKeyFromName(k)){ pushLine(k, node[k]); hit++; }});
if(!hit) stat.unknown++;
}
else if(typeof node==="string") fromString(node);
return lines;
}
/* 在解析出的 JSON 里递归找装备：带部位 + 词条数组/映射的对象 */
var AFFIX_HOLDER_KEYS=["affixes","affix","stats","attrs","attributes","lines","properties","substats","sub_stats","词条","属性列表","entries","modifiers"];
function extractGearsFromJson(root){
var gears=[], stat={unknown:0};
function affixNodeOf(obj){
for(var i=0;i<AFFIX_HOLDER_KEYS.length;i++){
var k=AFFIX_HOLDER_KEYS[i];
if(obj[k]!=null&&(Array.isArray(obj[k])||typeof obj[k]==="object")) return obj[k];
}
var selfMap={}; var has=false;
Object.keys(obj).forEach(function(k){ if(affixKeyFromName(k)){ selfMap[k]=obj[k]; has=true; }});
return has? selfMap: null;
}
function slotOf(obj){
var fields=["slot","position","part","equipslot","equip_slot","equiptype","equip_type","部位","type","category"];
for(var i=0;i<fields.length;i++){ var s=slotFromValue(obj[fields[i]]); if(s) return s; }
return null;
}
function nameOf(obj){
var fields=["name","title","装备名","名称"];
for(var i=0;i<fields.length;i++){ if(typeof obj[fields[i]]==="string"&&obj[fields[i]]) return obj[fields[i]]; }
return "";
}
function visit(node, ctxSlot, depth){
if(node==null||depth>9) return;
if(Array.isArray(node)){ node.forEach(function(x){ visit(x, ctxSlot, depth+1); }); return; }
if(typeof node!=="object") return;
var slot=slotOf(node)||ctxSlot;
var an=affixNodeOf(node);
if(slot&&an){
var st={unknown:0};
var lines=extractLines(an, st);
stat.unknown+=st.unknown;
if(lines.length){ var dyRaw=node.dingyin||node["定音"]||null; var dy=null;
if(typeof dyRaw==="string") dy=parseDingyinText(dyRaw);
else if(dyRaw&&typeof dyRaw==="object") dy=sanitizeDingyin({name:dyRaw.name||dyRaw.type, val:dyRaw.val!=null? dyRaw.val: dyRaw.value}, slot);
gears.push({slot:slot, name:nameOf(node), lines:lines.slice(0,8), dingyin:dy}); }
return;
}
Object.keys(node).forEach(function(k){
var keySlot=slotFromValue(k);
visit(node[k], keySlot||slot, depth+1);
});
}
visit(root, null, 0);
return {gears:gears, unknown:stat.unknown};
}
/* 解码：JSON 原文 / 夹在文本里的 JSON / Base64(可多层) */
function decodePasteCode(raw){
var s=String(raw||"").trim();
if(!s) return null;
function tryJson(t){ try{ return JSON.parse(t); }catch(e){ return undefined; } }
var r=tryJson(s); if(r!==undefined) return {data:r, mode:"JSON"};
var m=s.match(/[\[{][\s\S]*[\]}]/);
if(m){ r=tryJson(m[0]); if(r!==undefined) return {data:r, mode:"JSON"}; }
var b64=s.replace(/\s+/g,"");
for(var round=0; round<3; round++){
if(!/^[A-Za-z0-9+/=_-]+$/.test(b64)||b64.length<8) break;
try{
var t=b64.replace(/-/g,"+").replace(/_/g,"/");
while(t.length%4) t+="=";
var bin=atob(t);
var bytes=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
var txt=new TextDecoder("utf-8").decode(bytes);
r=tryJson(txt); if(r!==undefined) return {data:r, mode:"Base64"};
if(/^[A-Za-z0-9+/=_-]+$/.test(txt.replace(/\s+/g,""))){ b64=txt.replace(/\s+/g,""); continue; }
var m2=txt.match(/[\[{][\s\S]*[\]}]/);
if(m2){ r=tryJson(m2[0]); if(r!==undefined) return {data:r, mode:"Base64"}; }
if(txt.indexOf("\uFFFD")>-1||/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(txt)) break;
return {text:txt, mode:"Base64 文本"};
}catch(e){ break; }
}
return {text:s, mode:"文本"};
}
function importParsedGears(found, modeLabel){
var stat={imported:0, lineCount:0};
found.gears.forEach(function(g){
if(!g.lines.length) return;
var gear=addGear(g.slot, g.name||("导入 · "+g.slot), g.lines, g.dingyin||null, (g.schools!==undefined? g.schools: g.wuxue));
stat.imported++; stat.lineCount+=g.lines.length;
/* 第 40 节：自动选入按部位池落位——武器先填主武器空位、再填副武器空位；其余部位取空位 */
if(gear.slot==="武器"){
if(!loadout["主武器"]) loadout["主武器"]=gear.id;
else if(!loadout["副武器"]) loadout["副武器"]=gear.id;
}
else if(!loadout[gear.slot]) loadout[gear.slot]=gear.id;
});
return stat;
}
$("btnPasteImport").addEventListener("click", function(){
var resEl=$("pasteResult");
var raw=$("pasteCode").value;
if(!raw.trim()){ resEl.innerHTML='<span class="diff-lack">先把代码粘到上面的框里再点解析。</span>'; return; }
var dec=decodePasteCode(raw);
if(!dec){ resEl.innerHTML='<span class="diff-lack">没读到内容。</span>'; return; }
if(dec.data&&dec.data.app==="gear-planner-100"&&Array.isArray(dec.data.lib)){
try{
var blob=new Blob([JSON.stringify(dec.data)],{type:"application/json"});
var f=new File([blob],"paste.json",{type:"application/json"});
var dt=new DataTransfer(); dt.items.add(f);
$("importFile").files=dt.files;
$("importFile").dispatchEvent(new Event("change"));
resEl.innerHTML="识别为本工具导出的数据，已按整库导入处理。";
}catch(e){
resEl.innerHTML='<span class="diff-lack">识别为本工具导出的数据，但自动转交失败；请把这段存成 .json 文件，用上面的「导入本工具数据」导入。</span>';
}
return;
}
var found=null;
if(dec.data) found=extractGearsFromJson(dec.data);
if((!found||!found.gears.length)&&dec.text){
/* 文本模式：逐行「部位标题 + 词条 数值」 */
var tg={gears:[], unknown:0};
var cur=null;
dec.text.split(/\r?\n/).forEach(function(line){
var s=line.trim(); if(!s) return;
var slotHit=slotFromValue(s);
if(!slotHit&&s.length<=16){ SLOTS.forEach(function(sl){ if(s.indexOf(sl)>-1) slotHit=sl; }); }
if(slotHit) slotHit=gearSlotOf(slotHit);
if(slotHit){ cur=null; tg.gears.forEach(function(g){ if(g.slot===slotHit) cur=g; }); if(!cur){ cur={slot:slotHit, name:"", lines:[]}; tg.gears.push(cur);} return; }
if(cur){ var st={unknown:0}; var ls=extractLines([s], st); cur.lines=cur.lines.concat(ls); tg.unknown+=st.unknown; }
});
found={gears:tg.gears.filter(function(g){ return g.lines.length; }), unknown:tg.unknown};
}
if(!found||!found.gears.length){
resEl.innerHTML='<span class="diff-lack">没能从这段代码里认出装备。</span> 常见原因：复制时漏了一头一尾、复制的是角色外观分享码（不含装备数值）、或这份数据的字段格式本站还没适配。把你复制代码的来源页面发给站长，可以按那个格式加适配。';
return;
}
var stat=importParsedGears(found);
saveStore(); renderAll(false);
var msg="✓ 已按「"+dec.mode+"」解析，导入 <b>"+stat.imported+" 件装备 / "+stat.lineCount+" 条词条</b>，已自动选入搭配。";
if(found.unknown) msg+=" 另有 "+found.unknown+" 条没认出的字段被跳过（多半是气血、防御、外功穿透这类本站不计的词条）。";
resEl.innerHTML=msg;
toast("一键导入完成："+stat.imported+" 件装备");
});
$("btnPasteDemo").addEventListener("click", function(){
var demoData={character:"示例账号", equipments:[
{slot:"武器", name:"飞隼长剑", affixes:[{"name":"大外功","value":88.3},{"name":"大外功","value":85.2},{"name":"劲","value":54},{"name":"会心率","value":9.8},{"name":"剑增","value":7}]},
{slot:"冠胄", name:"飞隼冠胄", affixes:[{"name":"精准率","value":8.8},{"name":"大外功","value":85.2},{"name":"劲","value":50.1},{"name":"会心率","value":9.2},{"name":"敏","value":54}]},
{slot:"环", name:"飞隼环", affixes:[{"name":"大外功","value":90.6},{"name":"大外功","value":85.2},{"name":"劲","value":54},{"name":"会心率","value":9.8},{"name":"全武学增效","value":3.4}]}
]};
$("pasteCode").value=JSON.stringify(demoData);
$("pasteResult").innerHTML="已填入一段示例代码（JSON 形态），点「解析并导入装备库」试效果。真实使用时把这段换成你从官网账号页复制的代码即可。";
});

/* ================= 截图识别导入（浏览器本地 OCR，不上传） ================= */
var ocrPreferredSlot=null, ocrPreferredPos=null, ocrBusy=false;
GEAR_SLOTS.forEach(function(s){ var o=document.createElement("option"); o.value=s; o.textContent=s; $("ocrSlot").appendChild(o); });
/* 截图里常见的词条写法补充（含繁体与英文 ATK 写法）；其余复用粘贴导入的 PASTE_NAME_TO_KEY 与配方名表 */
var OCR_EXTRA_ALIAS = {
"最大外功攻击":"dawai","最小外功攻击":"xiaowai","最大外功":"dawai","最小外功":"xiaowai",
"max physical atk":"dawai","min physical atk":"xiaowai","physical atk":"dawai",
"最大属攻":"shu_wx_da","最小属攻":"shu_wx_xiao","最大屬攻":"shu_wx_da","最小屬攻":"shu_wx_xiao",
"最大无相攻击":"shu_wx_da","最小无相攻击":"shu_wx_xiao","最大無相攻擊":"shu_wx_da","最小無相攻擊":"shu_wx_xiao",
"最大鸣金攻击":"shu_mj_da","最小鸣金攻击":"shu_mj_xiao","最大裂石攻击":"shu_ls_da","最小裂石攻击":"shu_ls_xiao",
"最大破竹攻击":"shu_pz_da","最小破竹攻击":"shu_pz_xiao","最大牵丝攻击":"shu_qs_da","最小牵丝攻击":"shu_qs_xiao",
"會心率":"huixin","會意率":"huiyi","精準率":"jingzhun","體":"ti","勁":"jin","禦":"yu","敏":"min","勢":"shi",
"对首领增伤":"shouling","对首领单位增伤":"shouling","首领伤害":"shouling","全武学增伤":"quanwu","全武学增效":"quanwu","武器增伤":"wuqizeng","武器增效":"wuqizeng",
"手甲武学增伤":"wuqizeng"
};
var OCR_CANDIDATES=[];
(function(){
var seen={};
function add(name, key){
var n=String(name||"").trim(); if(!n||!key||!AFFIX_BY_KEY[key]||seen[n]) return;
seen[n]=1; OCR_CANDIDATES.push({name:n, key:key});
}
Object.keys(OCR_EXTRA_ALIAS).forEach(function(n){ add(n, OCR_EXTRA_ALIAS[n]); });
AFFIX.forEach(function(a){ add(a.label, a.key); add(a.short, a.key); });
Object.keys(PASTE_NAME_TO_KEY).forEach(function(n){ add(n, PASTE_NAME_TO_KEY[n]); });
var skipRecipe={"无相":1,"牵丝":1,"裂石":1,"破竹":1,"鸣金":1};
Object.keys(NAME_TO_CLASS).forEach(function(n){ if(skipRecipe[n]) return; var k=affixKeyFromName(n); if(k) add(n, k); });
/* 繁体变体（国际服截图常见） */
var trad={"属":"屬","牵":"牽","丝":"絲","会":"會","意":"意","精":"精","准":"準","体":"體","劲":"勁","御":"禦","势":"勢","击":"擊","无":"無","伤":"傷","效":"效","率":"率"};
var snapshot=OCR_CANDIDATES.slice();
snapshot.forEach(function(c){
var t=c.name.split("").map(function(ch){ return trad[ch]||ch; }).join("");
if(t!==c.name) add(t, c.key);
});
/* 形近字兜底（只在词条区内使用，单字仍受词界规则约束） */
add("全武学增孝","quanwu"); add("全武学普效","quanwu"); add("敉","min"); add("每","min");
OCR_CANDIDATES.sort(function(a,b){ return b.name.length-a.name.length; });
})();
function ocrClean(s){
return String(s==null?"":s)
.replace(/[０-９]/g, function(c){ return String.fromCharCode(c.charCodeAt(0)-0xFEE0); })
.replace(/．/g,".").replace(/，/g,",").replace(/：/g,":").replace(/＋/g,"+")
.replace(/(\d)[,，](\d{1,2})(?=%|$|\s)/g,"$1.$2")
.replace(/[\[\u3010\u3014\uFF08(]\s*(?:\u8F6C|\u4F20|\u8F66\u4E13)\s*[\]\u3011\u3015\uFF09)]?/g,"");
}
/* 一行 OCR 文本 -> 分段结果 [{key,val,neg}]：按候选名出现位置切分，一行可多条 */
function ocrFindHits(norm){
var hits=[];
OCR_CANDIDATES.forEach(function(c){
var cn=c.name.toLowerCase().replace(/\s+/g,""); if(!cn) return;
var start=0;
while(true){
var idx=norm.indexOf(cn,start); if(idx===-1) break;
if(cn.length===1){
var prev=idx>0? norm.charAt(idx-1): "";
var next=idx+1<norm.length? norm.charAt(idx+1): "";
var prevOk=!prev||!/^[\u4e00-\u9fff]$/.test(prev);
var nextOk=!next||/^[0-9+%]/.test(next)||!/^[\u4e00-\u9fff]$/.test(next);
var glued=!nextOk&&idx+2<norm.length&&/^[0-9]$/.test(norm.charAt(idx+2))&&(c.name+next)!=="体力";
var prevGlue=!prevOk&&idx>=1&&(idx===1||!/^[\u4e00-\u9fff]$/.test(norm.charAt(idx-2)));
if((prevOk||prevGlue)&&(nextOk||glued)) hits.push({idx:idx, len:1, name:c.name, key:c.key});
} else hits.push({idx:idx, len:cn.length, name:c.name, key:c.key});
start=idx+cn.length;
}
});
/* [武器类型]武学增伤 模式（如 手甲武学增伤 / 长剑武学增伤） */
var wm=/([\u4e00-\u9fff]{1,3})武学增伤/g, mm;
while((mm=wm.exec(norm))!==null){ hits.push({idx:mm.index, len:mm[0].length, name:mm[0], key:"wuqizeng"}); }
var xm=/学增伤/g, xmm;
while((xmm=xm.exec(norm))!==null){ hits.push({idx:xmm.index, len:3, name:"学增伤", key:"wuqizeng"}); }
hits.sort(function(a,b){ return a.idx-b.idx||b.len-a.len; });
var chosen=[];
hits.forEach(function(h){ var last=chosen[chosen.length-1]; if(last&&h.idx<last.idx+last.len) return; chosen.push(h); });
return chosen;
}
function matchOcrSegments(raw){
var norm=ocrClean(raw).toLowerCase().replace(/\s+/g,"");
if(!norm) return [];
var hits=ocrFindHits(norm);
var out=[];
hits.forEach(function(h,i){
var segStart=h.idx+h.len;
var segEnd=(i+1<hits.length)? hits[i+1].idx: norm.length;
var seg=norm.slice(segStart, segEnd);
var m=seg.match(/\d+(?:[.,]\d+)?/);
var neg=/^-/.test(seg.replace(/^[+]/,""))||seg.indexOf("-")===0;
if(!m){
var pre=norm.slice(i>0? hits[i-1].idx+hits[i-1].len: 0, h.idx);
var pm=pre.match(/(\d+(?:[.,]\d+)?)%?$/);
if(pm) m=pm;
}
if(!m) return;
var v=parseVal(m[0]); if(v==null||v<0) return;
out.push({key:h.key, val:v, name:h.name, neg:neg});
});
return out;
}
function ocrNameOnlyKey(raw){
var norm=ocrClean(raw).toLowerCase().replace(/\s+/g,"");
if(!norm||/\d/.test(norm)) return null;
var hits=ocrFindHits(norm);
return hits.length? hits[0].key: null;
}
function matchOcrLine(raw){
var segs=matchOcrSegments(raw);
if(!segs.length) return null;
return {key:segs[0].key, val:segs[0].val, name:segs[0].name};
}
/* 定音行解析：左池三项（名称+数值）/ 右池 [名]·[类]增伤 */
function parseDingyinText(raw){
var t=ocrClean(raw).replace(/\s+/g,"");
if(!t) return null;
var marked=t.indexOf("◆")>-1||t.indexOf("定音")>-1;
var names=Object.keys(DINGYIN_LEFT);
for(var i=0;i<names.length;i++){
var idx=t.indexOf(names[i]);
if(idx>-1&&(marked||idx<=2)){
var rest=t.slice(idx+names[i].length);
var m=rest.match(/\d+(?:\.\d+)?/);
if(m) return {name:names[i], val:parseFloat(m[0])};
}
}
var m2=t.match(/([^0-9+]{2,}?增[伤疗])\+?(\d+(?:\.\d+)?)%?/);
if(m2&&(m2[1].indexOf("·")>-1||m2[1].indexOf(".")>-1)){
var nm=m2[1].replace(/^[^\u4e00-\u9fffA-Za-z]+/,"").replace(/:/g,"·").replace(/\./g,"·");
if(isMartialDingyinName(nm)) return {name:nm, val:parseFloat(m2[1]&&m2[2])};
}
var m3=t.match(/([^0-9+]{2,}?技能增[伤疗])[^0-9%]{0,2}?(\d+(?:\.\d+)?)%/);
if(m3){ var nm3=m3[1].replace(/^[^\u4e00-\u9fffA-Za-z]+/,"").replace(/:/g,"·").replace(/\./g,"·"); if(isMartialDingyinName(nm3)) return {name:nm3, val:parseFloat(m3[2])};}
return null;
}
function ocrDetectSlot(text){
var lines=String(text||"").split(/\r?\n/);
var aliasNames=Object.keys(SLOT_ALIAS).sort(function(a,b){ return b.length-a.length; });
for(var li=0; li<lines.length; li++){
var t=ocrClean(lines[li]).trim(); if(!t||t.length>12) continue;
var best=null;
SLOTS.forEach(function(s){ if(s.length===1&&t!==s) return; var idx=t.indexOf(s); if(idx>-1&&(!best||idx<best.idx||(idx===best.idx&&s.length>best.len))) best={slot:s, idx:idx, len:s.length}; });
aliasNames.forEach(function(k){
var idx=t.indexOf(k); if(idx===-1) return;
if(k.length===1&&t!==k&&t.length>2) return;
if(!best||idx<best.idx||(idx===best.idx&&k.length>best.len)) best={slot:SLOT_ALIAS[k], idx:idx, len:k.length};
});
if(best) return gearSlotOf(best.slot);
}
return null;
}
/* 大图先缩到 2000px 内再识别，快一些；失败就用原图 */
function ocrPrepare(file){
return new Promise(function(resolve){
var url;
try{ url=URL.createObjectURL(file); }catch(e){ resolve(file); return; }
var img=new Image();
img.onload=function(){
try{
var mx=Math.max(img.naturalWidth||0, img.naturalHeight||0);
if(!mx||mx<=2000){ URL.revokeObjectURL(url); resolve(file); return; }
var sc=2000/mx;
var c=document.createElement("canvas");
c.width=Math.round(img.naturalWidth*sc); c.height=Math.round(img.naturalHeight*sc);
c.getContext("2d").drawImage(img,0,0,c.width,c.height);
URL.revokeObjectURL(url);
if(c.toBlob) c.toBlob(function(b){ resolve(b||file); },"image/png"); else resolve(file);
}catch(e){ resolve(file); }
};
img.onerror=function(){ URL.revokeObjectURL(url); resolve(file); };
img.src=url;
});
}
/* 第二遍用增强图：灰度 + 全范围对比拉伸 + 3x3 锐化 + 适度放大（等价于本地基准胜出的预处理配方；基准见变更日志第 20 节） */
function ocrEnhance(blob){
return new Promise(function(resolve){
var url;
try{ url=URL.createObjectURL(blob); }catch(e){ resolve(null); return; }
var img=new Image();
img.onload=function(){
try{
var iw=img.naturalWidth||0, ih=img.naturalHeight||0;
if(!iw||!ih){ URL.revokeObjectURL(url); resolve(null); return; }
var mx=Math.max(iw,ih);
var sc=Math.min(2, 2400/mx); if(sc<1) sc=1;
var w=Math.round(iw*sc), h=Math.round(ih*sc);
var c=document.createElement("canvas"); c.width=w; c.height=h;
var ctx=c.getContext("2d");
ctx.drawImage(img,0,0,w,h);
URL.revokeObjectURL(url);
var idata=ctx.getImageData(0,0,w,h), d=idata.data, n=w*h;
var gray=new Uint8Array(n), mn=255, mxv=0, i, j;
for(i=0,j=0;i<d.length;i+=4,j++){ var g=(d[i]*299+d[i+1]*587+d[i+2]*114)/1000; gray[j]=g; if(g<mn)mn=g; if(g>mxv)mxv=g; }
var range=(mxv-mn)||1;
for(j=0;j<n;j++){ gray[j]=Math.max(0,Math.min(255,Math.round((gray[j]-mn)*255/range))); }
var src=gray.slice(), W=w, H=h, x, y;
for(y=0;y<H;y++){ for(x=0;x<W;x++){
var idx=y*W+x, sum=5*src[idx]
- src[y*W+Math.max(0,x-1)] - src[y*W+Math.min(W-1,x+1)]
- src[Math.max(0,y-1)*W+x] - src[Math.min(H-1,y+1)*W+x];
gray[idx]=sum<0? 0: (sum>255? 255: sum);
} }
for(j=0;j<n;j++){ var o=j*4; d[o]=gray[j]; d[o+1]=gray[j]; d[o+2]=gray[j]; d[o+3]=255; }
ctx.putImageData(idata,0,0);
if(c.toBlob) c.toBlob(function(b){ resolve(b||null); },"image/png"); else resolve(null);
}catch(e){ resolve(null); }
};
img.onerror=function(){ URL.revokeObjectURL(url); resolve(null); };
img.src=url;
});
}
function ocrSetStatus(html){ $("ocrStatus").innerHTML=html; }
function runOcr(file){
if(ocrBusy){ toast("正在识别上一张，请稍等"); return; }
if(!file) return;
var okType=/^image\/(png|jpeg|webp)$/.test(file.type||"")||/\.(png|jpe?g|webp)$/i.test(file.name||"");
if(!okType){ ocrSetStatus('<span class="diff-lack">这张图格式不对，只支持 PNG / JPEG / WebP 截图。</span>'); return; }
if(file.size>15*1024*1024){ ocrSetStatus('<span class="diff-lack">图片超过 15MB，换一张小一点的截图。</span>'); return; }
if(typeof Tesseract==="undefined"){ ocrSetStatus('<span class="diff-lack">识别组件没能加载（OCR 引擎需要联网从 CDN 载入）。检查网络后刷新页面再试；粘贴代码导入不受影响。</span>'); return; }
ocrBusy=true;
$("ocrReview").style.display="none";
$("ocrBarWrap").style.display="block"; $("ocrBar").style.width="0%";
ocrSetStatus("正在准备图片…");
ocrPrepare(file).then(function(blob){
ocrSetStatus("正在识别（首次会下载中文 + 英文识别包，可能要十几秒）…");
return Tesseract.recognize(blob, "chi_sim+eng", {logger:function(m){
if(m.status==="recognizing text"){ $("ocrBar").style.width=Math.round((m.progress||0)*50)+"%"; }
else if(m.status){ ocrSetStatus("识别中："+m.status+"…"); }
}}).then(function(res1){
var data1=res1&&res1.data? res1.data: {text:"", lines:[]};
/* 第二遍：增强图 + PSM 6 固定版式，与第一遍段级合并（并集，不丢第一遍结果）；任何失败都回退第一遍 */
if(typeof Tesseract.createWorker!=="function"){ return {d1:data1, d2:null}; }
ocrSetStatus("正在增强识别（第二遍）…");
$("ocrBar").style.width="55%";
return ocrEnhance(blob).then(function(b2){
if(!b2) return {d1:data1, d2:null};
var wk=null;
return Tesseract.createWorker("chi_sim+eng", 1, {logger:function(m){
if(m.status==="recognizing text"){ $("ocrBar").style.width=(55+Math.round((m.progress||0)*45))+"%"; }
}}).then(function(w){
wk=w;
return w.recognize(b2, {tessedit_pageseg_mode:"6"});
}).then(function(res2){
return {d1:data1, d2:(res2&&res2.data)? res2.data: null};
}).catch(function(){ return {d1:data1, d2:null}; }).then(function(out){
if(wk){ try{ wk.terminate(); }catch(e){} }
return out;
});
}).catch(function(){ return {d1:data1, d2:null}; });
});
}).then(function(out){
ocrBusy=false; $("ocrBarWrap").style.display="none";
var d1=(out&&out.d1)? out.d1: {text:"", lines:[]};
if(out&&out.d2) showOcrReviewMerged(d1, out.d2); else showOcrReview(d1);
}).catch(function(err){
ocrBusy=false; $("ocrBarWrap").style.display="none";
ocrSetStatus('<span class="diff-lack">识别失败了。</span> 常见原因：网络不通下不到识别包、图片太模糊。可以换一张更清晰、完整的详情页截图再试。');
});
}
/* 识别结果 -> 核对表单：认出的预填成行，低置信标红，没认出的带数字行列在下方，定音行单列为备注 */
function addOcrRow(key, val, low, why){
var div=document.createElement("div");
div.className="affix-row";
div.innerHTML='<div class="r1"><select data-f="type" aria-label="词条类型">'+affixOptions(key||"", $("ocrSlot")? $("ocrSlot").value: "")+'</select>'
+'<input type="number" data-f="val" step="0.1" min="0" placeholder="数值" aria-label="词条数值" value="'+(val==null?"":val)+'"></div>'
+'<div class="r2"><span data-f="ref">选词条后显示满值 / 承音参考</span>'
+(low? '<span class="tag red">低置信，请核对'+(why? "："+esc(why):"")+'</span>':"")
+'<button class="btn mini" type="button" data-f="fillmax">填满值</button>'
+'<button class="btn mini" type="button" data-f="fillcy">填承音</button>'
+'<button class="btn mini danger" type="button" data-f="del">删此行</button></div>';
$("ocrRows").appendChild(div);
updateFormRow(div);
return div;
}
function ocrIsBaseLine(t){
var n=String(t||"").replace(/\s+/g,"");
return /防御|气血|体力|基础攻击|套装|二件套|四件套|当前精力|属攻穿透|生命值|耐久|装备等阶|承音/.test(n)
|| /外功攻击\d+[~～-]\d+/.test(n) || /^最大外功攻击\d/.test(n);
}
function findOcrAffixStart(texts){
for(var i=0;i<texts.length;i++){ if(/^[•·●]/.test(texts[i].trim())) return i; }
var start=0, eq=-1;
for(var j=0;j<texts.length;j++){ if(texts[j].indexOf("装备等阶")>-1){ eq=j; break; } }
if(eq>-1){ start=eq+1; var consumed=0; while(start<texts.length&&consumed<3&&ocrIsBaseLine(texts[start])){ start++; consumed++; } return start; }
while(start<texts.length&&start<4&&ocrIsBaseLine(texts[start])) start++;
return start;
}
function refreshOcrBlankRows(){
Array.prototype.forEach.call($("ocrRows").children, function(div){
var sel=div.querySelector('[data-f="type"]'); if(!sel) return;
var v=sel.value;
if(!v&&!(sel.options&&sel.options.length)&&div.innerHTML){ var m=div.innerHTML.match(/<option value="([a-z_]+)" selected>/); if(m) v=m[1];}
setNeedPick(sel, !v);
});
}
function parseOcrData(data){
var rawLines=[];
if(data.lines&&data.lines.length){
data.lines.forEach(function(l){ rawLines.push({text:String(l.text||""), conf:(typeof l.confidence==="number"? l.confidence: null)}); });
} else {
String(data.text||"").split(/\r?\n/).forEach(function(t){ rawLines.push({text:t, conf:null}); });
}
/* 名称行 + 紧邻纯数值行配对合并 */
var logical=[];
rawLines.forEach(function(l){
var t=ocrClean(l.text).trim(); if(!t) return;
var prev=logical[logical.length-1];
if(prev&&prev.nameOnly&&/^[+＋]?\d+(?:\.\d+)?%?$/.test(t.replace(/\s+/g,""))){
prev.text=prev.text+" "+t; prev.nameOnly=false;
if(l.conf!=null) prev.conf=(prev.conf==null? l.conf: Math.min(prev.conf,l.conf));
return;
}
logical.push({text:t, conf:l.conf, nameOnly:!!ocrNameOnlyKey(t)});
});
var fullText=logical.map(function(l){ return l.text; }).join("\n");
var rawText=rawLines.map(function(l){ return l.text; }).join("\n");
var detected=ocrDetectSlot(fullText);
var slot=detected||ocrPreferredSlot||"";
var startIdx=findOcrAffixStart(logical.map(function(l){ return l.text; }));
var rows=[], unknown=[], seenUnknown={}, parsedDingyin=null, truncated=0, invalidWx=0;
for(var li=startIdx; li<logical.length; li++){
var l=logical[li], t=l.text;
if(/套装|二件套|四件套/.test(t)) break;
var dy=parseDingyinText(t);
if(dy){ parsedDingyin=dy; continue; }
var segs=matchOcrSegments(t);
if(segs.length){
segs.forEach(function(sg){
var a=AFFIX_BY_KEY[sg.key]; if(!a) return;
if(sg.val>a.max*1.5){ if(!seenUnknown[t]){ seenUnknown[t]=1; unknown.push(t+"（数值远超满值，未预填）"); } return; }
if(isWuxiangKey(sg.key)&&slot&&!isWeaponSlot(slot)){ invalidWx++; return; }
var low=false, why="";
if(l.conf!=null&&l.conf<55){ low=true; why="识别置信度 "+Math.round(l.conf)+"%"; }
if(sg.neg){ low=true; why=why||"数值带负号，已取绝对值，请核对"; }
rows.push({key:sg.key, val:sg.val, low:low, why:why});
});
continue;
}
if(/\d/.test(t)||t.indexOf("%")>-1){ if(!seenUnknown[t]){ seenUnknown[t]=1; unknown.push(t); } }
}
if(rows.length>8){ truncated=rows.length-8; rows=rows.slice(0,8); }
return {detected:detected, slot:slot, rows:rows, unknown:unknown, parsedDingyin:parsedDingyin, invalidWx:invalidWx, truncated:truncated, rawText:rawText};
}
function renderOcrReview(P){
var detected=P.detected, slot=P.slot, rows=P.rows, unknown=P.unknown, parsedDingyin=P.parsedDingyin, invalidWx=P.invalidWx, truncated=P.truncated;
window.ocrRawText=P.rawText;
$("ocrSlot").value=slot;
ocrSlotPending=true; ocrDyPending=true;
$("ocrName").value="";
$("ocrRows").innerHTML="";

rows.forEach(function(r){ addOcrRow(r.key, r.val, r.low, r.why); });
while($("ocrRows").children.length<5) addOcrRow("", null, false, "");
Array.prototype.forEach.call($("ocrRows").children, function(div){
var sel=div.querySelector('[data-f="type"]'); if(sel) sel.addEventListener("change", refreshOcrBlankRows);
});
refreshOcrBlankRows();
setupDingyinControls("ocr", slot, parsedDingyin);
var ocrDySc=parsedDingyin? schoolTagsFromDingyinName(parsedDingyin.name): [];
setSchoolSel("ocr", ocrDySc);
$("ocrDingyin").innerHTML=parsedDingyin?
'<div class="ocr-unknown"><b>定音已解析（见上方定音控件，可改）：</b>'+esc(parsedDingyin.name)+" "+fmt(parsedDingyin.val,1)+((isLeftDingyinSlot(slot)||DINGYIN_LEFT[parsedDingyin.name])? "" : "%")+"（满值 "+fmt(dingyinMax(parsedDingyin.name, slot),1)+"）</div>":"";
var notes=[];
if(invalidWx) notes.push("异常：非武器部位识别到无相属攻 "+invalidWx+" 条，已拦截（无相只出现在武器）");
if(truncated) notes.push("词条超过 8 条上限，已截断 "+truncated+" 条");
$("ocrUnknown").innerHTML=(unknown.length||notes.length)?
'<div class="ocr-unknown"><b>下面这些行没认出词条，已原样列出（不会丢行）：</b>需要的话点「补一条词条行」手动加上；纯界面文字可忽略。'
+(notes.length? '<div class="diff-lack">'+notes.map(esc).join("；")+"</div>":"")
+'<ul class="tight">'+unknown.slice(0,14).map(function(t){ return "<li>"+esc(t)+"</li>"; }).join("")+"</ul>"
+(unknown.length>14? '<p class="note" style="margin:4px 0 0">还有 '+(unknown.length-14)+" 行未列出。</p>":"")+"</div>":"";
$("ocrReview").style.display="block";
ocrSetStatus("✓ 识别完成：认出 <b>"+rows.length+" 条词条</b>"
+(detected? "，部位识别为 <b>"+esc(detected)+"</b>": "，<b>没识别出部位</b>，请在下面手选")
+(parsedDingyin? "，定音：<b>"+esc(parsedDingyin.name)+" "+fmt(parsedDingyin.val,1)+"</b>":"")
+(unknown.length? "，另有 "+unknown.length+" 行没认出（见下方）":"")
+"。请逐行核对数值再确认存入。");
$("ocrReview").scrollIntoView({behavior:"smooth", block:"nearest"});
}
function mergeOcrParsed(A, B){
var rows=A.rows.slice(), seen={};
rows.forEach(function(r){ seen[r.key+"|"+r.val]=1; });
B.rows.forEach(function(r){ var k=r.key+"|"+r.val; if(!seen[k]){ seen[k]=1; rows.push(r); } });
var trunc=0;
if(rows.length>8){ trunc=rows.length-8; rows=rows.slice(0,8); }
var unknown=A.unknown.slice(), useen={};
unknown.forEach(function(u){ useen[u]=1; });
B.unknown.forEach(function(u){ if(!useen[u]){ useen[u]=1; unknown.push(u); } });
return {detected:A.detected||B.detected, slot:(A.detected? A.slot: (B.detected? B.slot: A.slot)), rows:rows,
unknown:unknown, parsedDingyin:A.parsedDingyin||B.parsedDingyin,
invalidWx:A.invalidWx+B.invalidWx, truncated:A.truncated+B.truncated+trunc, rawText:A.rawText};
}
function showOcrReview(data){ renderOcrReview(parseOcrData(data)); }
function showOcrReviewMerged(data1, data2){ renderOcrReview(mergeOcrParsed(parseOcrData(data1), parseOcrData(data2))); }

$("ocrRows").addEventListener("change", function(e){
var div=e.target.closest(".affix-row"); if(!div) return;
if(e.target.getAttribute("data-f")==="type"){
var valEl=div.querySelector('[data-f="val"]');
if(!e.target.value) valEl.value="";
}
updateFormRow(div);
refreshOcrBlankRows();
});
$("ocrRows").addEventListener("input", function(e){
var div=e.target.closest(".affix-row"); if(div) updateFormRow(div);
});
$("ocrRows").addEventListener("click", function(e){
var btn=e.target.closest("button"); if(!btn) return;
var div=e.target.closest(".affix-row"); if(!div) return;
var f=btn.getAttribute("data-f");
var a=AFFIX_BY_KEY[div.querySelector('[data-f="type"]').value];
var valEl=div.querySelector('[data-f="val"]');
if(f==="fillmax"&&a) valEl.value=a.max;
if(f==="fillcy"&&a) valEl.value=a.cy;
if(f==="del"){ if($("ocrRows").children.length>1){ div.remove(); } else { div.querySelector('[data-f="type"]').value=""; valEl.value=""; updateFormRow(div); } return; }
updateFormRow(div);
});
$("btnOcrAddRow").addEventListener("click", function(){
if($("ocrRows").children.length>=8){ toast("一件装备最多 8 条词条"); return; }
addOcrRow("", null, false, "");
});
$("btnOcrConfirm").addEventListener("click", function(){
var lines=[];
Array.prototype.forEach.call($("ocrRows").children, function(div){
var k=div.querySelector('[data-f="type"]').value; if(!k) return;
var raw=div.querySelector('[data-f="val"]').value;
var v=(raw==="")? null: parseFloat(raw);
if(v==null||!isFinite(v)||v<0) return;
lines.push({key:k, val:v});
});
lines=lines.slice(0,8);
if(!lines.length){ toast("至少保留一条有效词条再确认"); return; }
var slot=$("ocrSlot").value;
var dy=readDingyin("ocr", slot);
if(dy&&dy.invalid){ toast("定音数值 / 名称无效，已只存词条"); dy=null; }
var g=addGear(slot, $("ocrName").value.trim()||("截图导入 · "+slot), lines, dy, schoolSelOf("ocr").slice());
var equip=$("ocrEquip").checked;
var equipPos="";
if(equip) equipPos=equipToPosition(g, ocrPreferredPos);
saveStore(); renderAll(false);
$("ocrReview").style.display="none";
ocrSlotPending=false; ocrDyPending=false; refreshNeedPick();
ocrPreferredSlot=null; ocrPreferredPos=null;
ocrSetStatus("✓ 已存入装备库："+esc(slot)+"（"+g.lines.length+" 条词条）"+(g.dingyin? "，定音 "+esc(g.dingyin.name)+" "+fmt(g.dingyin.val,1):"")+(g.warnings.length? "；"+esc(g.warnings[0]):"")+(equip? "，并已选入搭配。":"。在装备库点「选入」即可参与搭配。"));
toast("截图导入已存入："+slot);
});
$("ocrSlot").addEventListener("change", function(){
refreshAffixRowOptions($("ocrRows"), this.value);
var cur=readDingyin("ocr", this.value);
setupDingyinControls("ocr", this.value, (cur&&cur.name)? cur: null);
refreshSchoolBox("ocr");
});
$("btnOcrCopyRaw").addEventListener("click", function(){
var text=window.ocrRawText||"";
if(!text){ toast("还没有可复制的识别文本"); return; }
function done(){ toast("原始识别文本已复制"); }
function fallback(){ var ta=document.createElement("textarea"); ta.value=text; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); done(); }catch(e){ toast("复制失败"); } document.body.removeChild(ta); }
if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
});
$("ocrSlot").addEventListener("change", function(){ ocrSlotPending=false; refreshNeedPick(); }, true);
$("ocrDingyinType").addEventListener("change", function(){ ocrDyPending=false; refreshNeedPick(); }, true);
$("btnOcrCancel").addEventListener("click", function(){
ocrSlotPending=false; ocrDyPending=false; refreshNeedPick();
$("ocrReview").style.display="none";
ocrSetStatus("已放弃这次识别结果，装备库没有变化。");
});
$("ocrDrop").addEventListener("click", function(){ $("ocrFile").click(); });
$("ocrDrop").addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); $("ocrFile").click(); } });
$("ocrFile").addEventListener("change", function(){
var f=this.files&&this.files[0]; this.value="";
if(f) runOcr(f);
});
["dragenter","dragover"].forEach(function(ev){
$("ocrDrop").addEventListener(ev, function(e){ e.preventDefault(); this.classList.add("over"); });
});
["dragleave","drop"].forEach(function(ev){
$("ocrDrop").addEventListener(ev, function(e){ e.preventDefault(); this.classList.remove("over"); });
});
$("ocrDrop").addEventListener("drop", function(e){
var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
if(f) runOcr(f);
});
document.addEventListener("paste", function(e){
var t=e.target;
if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable)) return;
var items=(e.clipboardData&&e.clipboardData.items)||[];
for(var i=0;i<items.length;i++){
if(items[i].type&&items[i].type.indexOf("image/")===0){
var f=items[i].getAsFile();
if(f){ runOcr(f); toast("已收到粘贴的截图，开始识别"); }
break;
}
}
});
$("loadout").addEventListener("click", function(e){
var b=e.target.closest("[data-ocr-slot]"); if(!b) return;
ocrPreferredPos=b.getAttribute("data-ocr-slot");
ocrPreferredSlot=gearSlotOf(ocrPreferredPos);
ocrSetStatus("已指定部位：<b>"+esc(ocrPreferredPos)+"</b>。选一张这个部位的装备详情截图（或拖进来 / Ctrl+V 粘贴），识别结果会预选该部位，仍可在核对表单里改。");
document.getElementById("ocrZone").scrollIntoView({behavior:"smooth", block:"center"});
$("ocrDrop").focus();
});

/* ================= 三率速算 ================= */
function quickCalc(){
var res=Math.max(0.5, num("qRes")||1.85);
function row(wId, yId, bId, sId, white, cap, base, perVal, barName, dec){
var yellow=Math.max(0, Math.min(cap, base+(white-base)/res));
$(yId).textContent=fmt(yellow,1)+"%";
$(bId).style.width=Math.max(0,Math.min(100,yellow/cap*100))+"%";
$(sId).innerHTML=rateStatus(white, yellow, cap, base, res, perVal, barName, dec);
}
row("qAcc","qyAcc","qbAcc","qsAcc", num("qAcc"), 100, 65, 8.8, "承音精准", 0);
row("qCrit","qyCrit","qbCrit","qsCrit", num("qCrit"), 80, 0, 9.8, "承音会心", 1);
row("qInt","qyInt","qbInt","qsInt", num("qInt"), 40, 0, 4.9, "承音会意", 1);
}
var quickDirty=false;
function syncQuickFromPanel(panel, extras){
if(!panel){ extras=currentExtras(); panel=computePanel(loadout, extras); }
$("qAcc").value=fmt(panel.whiteAcc,1);
$("qCrit").value=fmt(panel.whiteCrit,1);
$("qInt").value=fmt(panel.whiteInt,1);
$("qRes").value=extras.res;
quickCalc();
}
["qAcc","qCrit","qInt","qRes"].forEach(function(id){ $(id).addEventListener("input", function(){ quickDirty=true; quickCalc(); });});
$("btnQuickSync").addEventListener("click", function(){ quickDirty=false; syncQuickFromPanel(); toast("已同步"); });

/* ================= 静态表格与初始化 ================= */
function renderAll(save){
renderLib(); renderLoadout(); renderPanel(); renderSchemes();
if(save) saveStore();
}
(function init(){
/* 说明收纳：带 .longnote 的长说明默认隐藏，标题旁生成「？」按钮点击展开（同一时间只开一个） */
if(document.querySelectorAll){
document.querySelectorAll(".longnote").forEach(function(el){
var btn=document.createElement("button");
btn.type="button"; btn.className="helpbtn"; btn.textContent="?"; btn.title="查看说明"; btn.setAttribute("aria-expanded","false");
btn.addEventListener("click", function(e){
e.stopPropagation();
var wasOpen=el.classList.contains("open");
document.querySelectorAll(".longnote.open").forEach(function(x){ x.classList.remove("open"); });
if(!wasOpen) el.classList.add("open");
btn.setAttribute("aria-expanded", String(!wasOpen));
});
if(el.parentNode) el.parentNode.insertBefore(btn, el);
});
}
var slotSel=$("gSlot");
GEAR_SLOTS.forEach(function(s){ var o=document.createElement("option"); o.value=s; o.textContent=s; slotSel.appendChild(o);});
for(var i=0;i<5;i++) addFormRow();
var tsel=$("targetSelect");
BUILDS.forEach(function(b,i){ var o=document.createElement("option"); o.value=i; o.textContent=b.cat+" · "+b.school+" · "+b.set; tsel.appendChild(o);});
/* 角色基础：填充心法下拉 */
for(var xi=0;xi<4;xi++){
var xsel=$("bA_xf"+xi); if(!xsel) continue;
var o0=document.createElement("option"); o0.value=""; o0.textContent="— 不选 —"; xsel.appendChild(o0);
XINFA.forEach(function(x){ var o=document.createElement("option"); o.value=x.n; o.textContent=x.n; xsel.appendChild(o); });
}
loadStore();
updateBaseUI();
tsel.value=String(targetIdx);
applyBowForTarget();
setupDingyinControls("g", $("gSlot").value, null);
setupDingyinControls("ocr", $("ocrSlot").value||"主武器", null);
refreshSchoolBox("g");
refreshSchoolBox("ocr");
$("bowSelect").addEventListener("change", function(){ bowJueKind=this.value||""; bowJueBySchool[targetSchoolKey()]=bowJueKind; bowConfirmedBySchool[targetSchoolKey()]=true; refreshNeedPick(); saveStore(); renderPanel(); });
tsel.addEventListener("change", function(){ schoolConfirmed=true; setTarget(parseInt(this.value,10)||0); saveStore(); renderAll(false);});
/* 主题色点：点选即切换并存本机（不进导出） */
if(document.querySelectorAll){ document.querySelectorAll(".tdot").forEach(function(d){ d.addEventListener("click", function(){ applyTheme(d.getAttribute("data-theme-set")); }); }); }
var __savedTheme="heijin"; try{ __savedTheme=localStorage.getItem(THEME_KEY)||"heijin"; }catch(e){}
applyTheme(__savedTheme);
/* 角色基础：字段锁定 / 恢复预设（站内确认弹窗） / 字段与心法变更 */
setupBaseLocks();
$("btnBaseReset").addEventListener("click", function(){ openResetModal(); });
$("btnResetCancel").addEventListener("click", function(){ closeResetModal(); });
$("btnResetConfirm").addEventListener("click", function(){
closeResetModal();
resetBaseToPreset(); updateBaseUI(); saveStore(); renderAll(false);
toast("已恢复预设");
});
$("resetModal").addEventListener("click", function(e){ if(e.target===this) closeResetModal(); });
$("ocrExampleBtn").addEventListener("click", function(){ openOcrExampleModal(); });
$("btnOcrExampleClose").addEventListener("click", function(){ closeOcrExampleModal(); });
$("ocrExampleModal").addEventListener("click", function(e){ if(e.target===this) closeOcrExampleModal(); });
$("btnOcrWelcomeClose").addEventListener("click", function(){ closeOcrWelcomeModal(); });
$("ocrWelcomeModal").addEventListener("click", function(e){ if(e.target===this) closeOcrWelcomeModal(); });
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeResetModal(); closeOcrExampleModal(); closeOcrWelcomeModal(); } });
BASE_FIELDS.forEach(function(f){
$("bA_"+f).addEventListener("input", function(){ refreshBaseMods(); updateBaseSummary(); renderPanel(); saveStore(); });
});
for(var xj=0;xj<4;xj++){ (function(idx){ var el=$("bA_xf"+idx); if(!el) return; el.addEventListener("change", function(){ var xf=xinfaSummary(); if(xf.duplicates.length) toast("心法重复，只算一次："+xf.duplicates.join("、")); refreshNeedPick(); updateBaseSummary(); renderPanel(); saveStore(); }); })(xj); }
/* 第 41 节：定音是否计入毕业度（总分旁勾选） */
$("gradDyToggle").addEventListener("change", function(){
gradDingyinOn=!!this.checked;
saveStore(); renderPanel();
});
/* 其他来源加成：默认收起，标题旁「？」展开 / 收起 */
$("extrasToggle").addEventListener("click", function(){
var body=$("extrasBody"); if(!body) return;
var open=body.style.display!=="none";
body.style.display=open? "none": "block";
this.setAttribute("aria-expanded", String(!open));
});
/* 基础属性汇总已于第 36 节整段移除（站长裁定隐藏），其开关监听随之删除 */
/* 三率对照已于第 41 节整段移除，其公式 / 来源开关（rateSrcToggle）监听随之删除 */
$("baseFieldsToggle").addEventListener("click", function(){
var body=$("baseFieldsBody"); if(!body) return;
var open=body.style.display!=="none";
body.style.display=open? "none": "block";
this.setAttribute("aria-expanded", String(!open));
this.textContent=open? "展开": "收起";
});
var recipeFilterVal="all";
function renderRecipes(){
var q=($("recipeSearch").value||"").trim();
var html="", shown=0;
BUILDS.forEach(function(b,i){
if(recipeFilterVal!=="all"&&b.cat!==recipeFilterVal) return;
if(q&&(b.school+b.set+b.recipe+b.cat).indexOf(q)===-1) return;
shown++;
var tagCls=b.cat.indexOf("会意")>-1?"gold":(b.cat.indexOf("小外")===0?"blue":"red");
html+="<tr><td><span class='tag "+tagCls+"'>"+b.cat+"</span></td><td><b>"+esc(b.school)+"</b></td><td>"+esc(b.set)+"</td><td>"+esc(b.recipe)+(b.note?' <b style="color:var(--red)">'+esc(b.note)+"</b>":"")+"</td><td>"+esc(recommendBowLabel(b)||b.bow)+'</td><td><button class="btn small" type="button" data-target="'+i+'">设为目标</button></td></tr>';
});
$("recipeBody").innerHTML=html;
$("recipeEmpty").style.display=shown?"none":"block";
}
$("recipeSearch").addEventListener("input", renderRecipes);
$("recipeFilter").addEventListener("click", function(e){
var b=e.target.closest("button"); if(!b) return;
recipeFilterVal=b.getAttribute("data-f");
this.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x===b);});
renderRecipes();
});
$("recipeBody").addEventListener("click", function(e){
var b=e.target.closest("[data-target]"); if(!b) return;
schoolConfirmed=true;
setTarget(parseInt(b.getAttribute("data-target"),10));
saveStore(); renderAll(false);
toast("目标已设为："+BUILDS[targetIdx].school+" · "+BUILDS[targetIdx].set);
document.getElementById("planner").scrollIntoView({behavior:"smooth"});
});
renderRecipes();

$("affixBody").innerHTML=AFFIX.map(function(a){
var names=Object.keys(NAME_TO_CLASS).filter(function(n){ return NAME_TO_CLASS[n]===classOf(a.key);});
var shownNames=names.length? names.slice(0,5).join(" / ")+(names.length>5?" 等":""): '<span class="note">生存向，配方未列</span>';
return "<tr><td><b>"+esc(a.label)+"</b></td>"
+'<td class="num">'+a.max+(a.unit?" "+a.unit:"")+'</td><td class="num">'+a.cy+(a.unit?" "+a.unit:"")+'</td><td class="num">'+fmt(a.cy/a.max*100,2)+"%</td>"
+"<td>"+shownNames+"</td></tr>";
}).join("");

function slotRows(data){
return data.map(function(s){
return "<tr><td><b>"+s.slot+"</b></td>"+s.lines.map(function(l,i){
return "<td"+(i===0?' style="color:var(--red);font-weight:700"':"")+">"+esc(l)+"</td>";
}).join("")+"</tr>";
}).join("");
}
$("slotsBigBody").innerHTML=slotRows(SLOTS_BIG);
$("slotsSmallBody").innerHTML=slotRows(SLOTS_SMALL);

renderAll(false);
maybeOpenOcrWelcome();
quickCalc();
})();
