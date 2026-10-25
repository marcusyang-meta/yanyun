// 配装台计算引擎 — 移植自 gear-planner-100.pages.dev「装备调率助手」(100 阶)
// 数据与公式逐项对照原站脚本移植 (提取说明: ~/workspace/research_notes/gear-planner-100/extraction.md)。
// 与调律 GradCalc 口径不同: 本引擎毕业度 = (40% 条数 + 24% 数值 + 20% 定音) / 84
// (关定音时 / 64); 单件评分 = round((60 × coreFrac + 40 × Q) × linesFactor) (原站第 44 节口径)。
// 全部纯函数: 状态 (目标流派/角色基础/其他来源/搭配/模拟档) 由调用方显式传入, 不读全局。
export const GP_SLOTS = ["主武器","副武器","冠胄","胸甲","环","佩","胫甲","腕甲"];
export const GP_GEAR_SLOTS = ["武器","冠胄","胸甲","环","佩","胫甲","腕甲"];
export const GP_AFFIX = [{"key":"dawai","label":"大外功","short":"大外","max":90.6,"cy":85.2,"unit":""},{"key":"xiaowai","label":"小外功","short":"小外","max":90.6,"cy":85.2,"unit":""},{"key":"shu_mj_da","label":"最大鸣金攻击","short":"大鸣金","max":51.4,"cy":48.3,"unit":"","sys":"鸣金","size":"da"},{"key":"shu_mj_xiao","label":"最小鸣金攻击","short":"小鸣金","max":51.4,"cy":48.3,"unit":"","sys":"鸣金","size":"xiao"},{"key":"shu_ls_da","label":"最大裂石攻击","short":"大裂石","max":51.4,"cy":48.3,"unit":"","sys":"裂石","size":"da"},{"key":"shu_ls_xiao","label":"最小裂石攻击","short":"小裂石","max":51.4,"cy":48.3,"unit":"","sys":"裂石","size":"xiao"},{"key":"shu_pz_da","label":"最大破竹攻击","short":"大破竹","max":51.4,"cy":48.3,"unit":"","sys":"破竹","size":"da"},{"key":"shu_pz_xiao","label":"最小破竹攻击","short":"小破竹","max":51.4,"cy":48.3,"unit":"","sys":"破竹","size":"xiao"},{"key":"shu_qs_da","label":"最大牵丝攻击","short":"大牵丝","max":51.4,"cy":48.3,"unit":"","sys":"牵丝","size":"da"},{"key":"shu_qs_xiao","label":"最小牵丝攻击","short":"小牵丝","max":51.4,"cy":48.3,"unit":"","sys":"牵丝","size":"xiao"},{"key":"shu_wx_da","label":"最大无相攻击","short":"大无相","max":51.4,"cy":48.3,"unit":"","sys":"无相","size":"da"},{"key":"shu_wx_xiao","label":"最小无相攻击","short":"小无相","max":51.4,"cy":48.3,"unit":"","sys":"无相","size":"xiao"},{"key":"ti","label":"体","short":"体","max":57.4,"cy":54,"unit":""},{"key":"jin","label":"劲","short":"劲","max":57.4,"cy":54,"unit":""},{"key":"yu","label":"御","short":"御","max":57.4,"cy":54,"unit":""},{"key":"min","label":"敏","short":"敏","max":57.4,"cy":54,"unit":""},{"key":"shi","label":"势","short":"势","max":57.4,"cy":54,"unit":""},{"key":"jingzhun","label":"精准率","short":"精准","max":9.4,"cy":8.8,"unit":"%"},{"key":"huixin","label":"会心率","short":"会心","max":10.4,"cy":9.8,"unit":"%"},{"key":"huiyi","label":"会意率","short":"会意","max":5.2,"cy":4.9,"unit":"%"},{"key":"wuqizeng","label":"武器增效","short":"武器增","max":7.4,"cy":7,"unit":"%"},{"key":"quanwu","label":"全武学增效","short":"全武","max":3.6,"cy":3.4,"unit":"%"},{"key":"shouling","label":"首领增伤","short":"首领","max":3.8,"cy":3.6,"unit":"%"},{"key":"wanjia","label":"玩家增伤","short":"玩家","max":3.8,"cy":3.6,"unit":"%"},{"key":"quanqi","label":"全奇术增伤","short":"全奇术","max":11.4,"cy":10.7,"unit":"%"}];
export const GP_BUILDS_RAW = [{"cat":"大外会意","school":"鸣金-虹","set":"玉斗","bow":"会意","recipe":"1剑增 + 2首领 + 2全武 + 12大外 + 10劲 + 7势 + 6会意","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"shi","label":"势","n":7,"flex":null},{"cls":"huiyi","label":"会意","n":6,"flex":null}],"total":40},{"cat":"大外会意","school":"鸣金-影","set":"飞隼","bow":"会意","recipe":"1剑增 + 2首领 + 2全武 + 2全奇术 + 12大外 + 9劲 + 7势 + 5会意","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"quanqi","label":"全奇术","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":9,"flex":null},{"cls":"shi","label":"势","n":7,"flex":null},{"cls":"huiyi","label":"会意","n":5,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝-玉（飞天）","set":"烟柳","bow":"精准","recipe":"1伞增 + 2首领 + 2全武 + 12大外 + 9劲 + 1势 + 8会心 + 3敏 + 2精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":9,"flex":null},{"cls":"shi","label":"势","n":1,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝-玉（走地）","set":"烟柳","bow":"精准","recipe":"1伞增 + 2首领 + 2全武 + 2全奇术 + 12大外 + 7劲 + 1势 + 8会心 + 3敏 + 2精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"quanqi","label":"全奇术","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":7,"flex":null},{"cls":"shi","label":"势","n":1,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝-霖（纯奶）","set":"浣花","bow":"会心","recipe":"1扇增 + 2玩家 + 2全武 + 12大外 + 10劲 + 6会心 + 3敏 + 4小外","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"wanjia","label":"玩家","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"xiaowai","label":"小外","n":4,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝-霖（纯奶）","set":"时雨","bow":"会心","recipe":"1扇增 + 2玩家 + 2全武 + 12大外 + 10劲 + 7会心 + 3敏 + 3小外","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"wanjia","label":"玩家","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"huixin","label":"会心","n":7,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"xiaowai","label":"小外","n":3,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝-霖（火拳）","set":"时雨","bow":"精准","recipe":"2全奇术 + 2首领 + 12大外 + 10劲 + 3敏 + 8会心 + 2精准 + 1势","targets":[{"cls":"quanqi","label":"全奇术","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"shi","label":"势","n":1,"flex":null}],"total":40},{"cat":"大外会心","school":"牵丝·翊","set":"裁云","bow":"精准","recipe":"1鼓增 + 2首领 + 2全武 + 12大外 + 9劲 + 3敏 + 8会心 + 3精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":9,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null}],"total":40},{"cat":"大外会心","school":"裂石-威","set":"时雨+易相","bow":"精准","recipe":"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 5势 + 6会心 + 2精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"shi","label":"势","n":5,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null}],"total":40},{"cat":"大外会心","school":"裂石钧-唐","set":"断岳","bow":"精准","recipe":"1唐增 + 2首领 + 2全武 + 12大外 + 8劲 + 3敏 + 9会心 + 3精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":8,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":9,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null}],"total":40},{"cat":"大外会心","school":"裂石钧-陌","set":"断岳","bow":"会心/精准","recipe":"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 3敏 + 7会心 + 2精准 + 1小外/大裂（二选一）","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":7,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"flex:xiaowai|shugong","label":"小外/大裂（二选一）","n":1,"flex":["xiaowai","shugong"]}],"total":40},{"cat":"大外会心","school":"破竹-鸢","set":"撼天","bow":"精准","recipe":"1拳增 + 2首领 + 2全武 + 12大外 + 9劲（8劲+1势） + 3敏 + 8会心 + 3精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":9,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null}],"total":40},{"cat":"大外会心","school":"破竹-樽","set":"倾觞","bow":"精准","recipe":"1拳增 + 1双刀增 + 2首领 + 2全武 + 12大外 + 8劲 + 3敏 + 8会心 + 3精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":8,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null}],"total":40},{"cat":"大外会心","school":"破竹-尘","set":"连星","bow":"精准","recipe":"1伞增 + 2首领 + 2全武 + 12大外 + 10劲 + 3敏 + 8会心 + 2精准","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"min","label":"敏","n":3,"flex":null},{"cls":"huixin","label":"会心","n":8,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null}],"total":40},{"cat":"大外会心","school":"破竹-风","set":"燕归","bow":"精准","recipe":"1刀增 + 1镖增 + 2首领 + 2全武 + 12大外 + 10劲 + 2敏 + 7会心 + 2精准 + 1小外","targets":[{"cls":"wuqizeng","label":"武器增效","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"min","label":"敏","n":2,"flex":null},{"cls":"huixin","label":"会心","n":7,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":1,"flex":null}],"total":40},{"cat":"小外会心","school":"牵丝-霖（火拳）","set":"撼天","bow":"精准","recipe":"2全奇术 + 2首领 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 5牵丝","targets":[{"cls":"quanqi","label":"全奇术","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":7,"flex":null}],"total":40},{"cat":"小外会心","school":"牵丝·翊","set":"裁云","bow":"精准","recipe":"1鼓增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 4牵丝","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":6,"flex":null}],"total":40},{"cat":"小外会心","school":"裂石-唐","set":"断岳","bow":"精准","recipe":"1唐增 + 2首领 + 2全武 + 12小外 + 8敏 + 7会心 + 3精准 + 2无相 + 3裂石","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":7,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":5,"flex":null}],"total":40},{"cat":"小外会心","school":"裂石-钧（易水歌）","set":"断岳","bow":"会心/精准","recipe":"1陌增 + 2首领 + 2全武 + 12小外 + 8敏 + 5会心 + 2精准 + 2无相 + 6裂石","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":5,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":8,"flex":null}],"total":40},{"cat":"小外会心","school":"破竹-鸢","set":"撼天","bow":"精准","recipe":"1拳增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 2无相 + 4破竹","note":"凑百爆：3破竹 + 1会意","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":6,"flex":null}],"total":40},{"cat":"小外会心","school":"破竹-樽","set":"倾觞","bow":"精准","recipe":"1拳增 + 1双刀增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 3精准 + 5大破竹","targets":[{"cls":"wuqizeng","label":"武器增效","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":5,"flex":null}],"total":40},{"cat":"小外会心","school":"破竹-尘","set":"连星","bow":"精准","recipe":"1伞增 + 2首领 + 2全武 + 12小外 + 8敏 + 6会心 + 2精准 + 2无相 + 5破竹","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":7,"flex":null}],"total":40},{"cat":"小外会心","school":"破竹-风","set":"燕归","bow":"精准","recipe":"1刀增 + 1镖增 + 2首领 + 2全武 + 12小外 + 8敏 + 5会心 + 2精准 + 2无相 + 5破竹","targets":[{"cls":"wuqizeng","label":"武器增效","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":5,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":7,"flex":null}],"total":40},{"cat":"小外会心","school":"牵丝-霖（火拳）","set":"浣花","bow":"精准","recipe":"2全奇术 + 2首领 + 12小外 + 8敏 + 4会心 + 3精准 + 2无相 + 7牵丝","targets":[{"cls":"quanqi","label":"全奇术","n":2,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"xiaowai","label":"小外","n":12,"flex":null},{"cls":"min","label":"敏","n":8,"flex":null},{"cls":"huixin","label":"会心","n":4,"flex":null},{"cls":"jingzhun","label":"精准","n":3,"flex":null},{"cls":"shugong","label":"属攻（本系/无相）","n":9,"flex":null}],"total":40},{"cat":"大外会心","school":"裂石-威","set":"时雨+易相（高级版）","bow":"精准","recipe":"1陌增 + 2首领 + 2全武 + 12大外 + 10劲 + 2势 + 6会心 + 1会意 + 2精准 + 2大裂石","targets":[{"cls":"wuqizeng","label":"武器增效","n":1,"flex":null},{"cls":"shouling","label":"首领","n":2,"flex":null},{"cls":"quanwu","label":"全武学","n":2,"flex":null},{"cls":"dawai","label":"大外","n":12,"flex":null},{"cls":"jin","label":"劲","n":10,"flex":null},{"cls":"shi","label":"势","n":2,"flex":null},{"cls":"huixin","label":"会心","n":6,"flex":null},{"cls":"huiyi","label":"会意","n":1,"flex":null},{"cls":"jingzhun","label":"精准","n":2,"flex":null},{"cls":"shu_ls_da","label":"最大裂石攻击","n":2,"flex":null}],"total":40}];
export const GP_NAME_TO_CLASS = {"大外":"dawai","小外":"xiaowai","劲":"jin","敏":"min","势":"shi","精准":"jingzhun","会心":"huixin","会意":"huiyi","全武":"quanwu","首领":"shouling","玩家":"wanjia","单体":"quanqi","群体":"quanqi","全奇术":"quanqi","无相":"shugong","牵丝":"shugong","裂石":"shugong","破竹":"shugong","大破竹":"shugong","鸣金":"shugong","鸣金大":"shugong","鸣金小":"shugong","破竹大":"shugong","破竹小":"shugong","牵丝大":"shugong","牵丝小":"shugong","裂石大":"shugong","裂石小":"shugong","大裂石":"shu_ls_da","剑增":"wuqizeng","伞增":"wuqizeng","扇增":"wuqizeng","鼓增":"wuqizeng","陌增":"wuqizeng","唐增":"wuqizeng","拳增":"wuqizeng","刀增":"wuqizeng","双刀增":"wuqizeng","镖增":"wuqizeng"};
export const GP_CLASS_LABEL = {"dawai":"大外","xiaowai":"小外","shugong":"属攻（本系/无相）","jin":"劲","min":"敏","shi":"势","ti":"体","yu":"御","jingzhun":"精准","huixin":"会心","huiyi":"会意","wuqizeng":"武器增效","quanwu":"全武学","shouling":"首领","wanjia":"玩家","quanqi":"全奇术","shu_mj_da":"最大鸣金攻击","shu_mj_xiao":"最小鸣金攻击","shu_ls_da":"最大裂石攻击","shu_ls_xiao":"最小裂石攻击","shu_pz_da":"最大破竹攻击","shu_pz_xiao":"最小破竹攻击","shu_qs_da":"最大牵丝攻击","shu_qs_xiao":"最小牵丝攻击","shu_wx_da":"最大无相攻击","shu_wx_xiao":"最小无相攻击"};
export const GP_SLOTS_BIG = [{"slot":"武器","lines":["大外","大外","劲","三率/敏","增伤/三率"]},{"slot":"冠胄","lines":["三率","大外","劲","三率/势","三率"]},{"slot":"胸甲","lines":["三率","大外","劲","三率/势","三率"]},{"slot":"环","lines":["大外","大外","劲/势","三率","全武学"]},{"slot":"佩","lines":["大外","大外","劲/势","三率","全武学"]},{"slot":"胫甲","lines":["劲","大外","劲/势","三率","增伤"]},{"slot":"腕甲","lines":["劲","大外","劲/势","三率","增伤"]}];
export const GP_SLOTS_SMALL = [{"slot":"武器","lines":["小外","小外","大无相","敏","增伤/三率"]},{"slot":"冠胄","lines":["三率","大本属","敏","小外","三率"]},{"slot":"胸甲","lines":["三率","敏","大本属","小外","三率"]},{"slot":"环","lines":["小外","小外","敏","三率/大本属","全武学"]},{"slot":"佩","lines":["小外","小外","敏","三率/大本属","全武学"]},{"slot":"胫甲","lines":["三率","小外","大本属","敏","首领"]},{"slot":"腕甲","lines":["三率","小外","大本属","敏","首领"]}];
export const GP_BASE_FIELDS = ["ti","jin","yu","min","shi","xiao","da","hp","shuXiao","shuDa","wkXiao","wkDa","wkShuXiao","wkShuDa","wkHp","wxXiao","wxDa","acc","crit","int","dcrit","dint","dmg","shuDmg"];
export const GP_BASE_PRESET = {"ti":187,"jin":187,"yu":187,"min":187,"shi":187,"xiao":542.6,"da":895.4,"hp":100670,"shuXiao":0,"shuDa":0,"wkXiao":141,"wkDa":283,"wkShuXiao":141,"wkShuDa":283,"wkHp":27400,"wxXiao":26,"wxDa":26,"acc":99.3,"crit":24,"int":12,"dcrit":0,"dint":0,"dmg":2.8,"shuDmg":11};
export const GP_BASE_FIELD_LABELS = {"ti":"基础体","jin":"基础劲","yu":"基础御","min":"基础敏","shi":"基础势","xiao":"基础小外","da":"基础大外","hp":"基础气血","shuXiao":"本系属攻·小","shuDa":"本系属攻·大","wkXiao":"武库·小外","wkDa":"武库·大外","wkShuXiao":"武库·属攻小","wkShuDa":"武库·属攻大","wkHp":"武库·气血","wxXiao":"无相底子·小","wxDa":"无相底子·大","acc":"基础精准","crit":"基础会心","int":"基础会意","dcrit":"直接会心","dint":"直接会意","dmg":"外功伤害加成","shuDmg":"属攻伤害加成"};
export const GP_WK_FIELDS = ["wkXiao","wkDa","wkShuXiao","wkShuDa","wkHp"];
export const GP_WX_FIELDS = ["wxXiao","wxDa"];
export const GP_XINFA = [{"n":"千营一呼","crit":15,"dmg":2.8},{"n":"易水歌","xiao":43.4,"da":86.8,"dcrit":4.6},{"n":"征人归","xiao":117.1,"pierce":5.1},{"n":"断石之构","acc":12,"dcrit":4.1},{"n":"绳舟行木","xiao":117.1,"pierce":5.1},{"n":"大唐歌","acc":12,"critDmg":4},{"n":"极乐泣血","da":104.1,"critDmg":3.5},{"n":"心弥泥鱼","xiao":117.1,"pierce":5.1},{"n":"忘川绝响","crit":15,"critDmg":4.4},{"n":"花上月令","crit":15,"dcrit":4.6},{"n":"剑气纵横","da":130.1,"dint":2.3},{"n":"明晦同尘","xiao":39,"da":78,"pierce":5.1},{"n":"所恨年年","acc":12,"dmg":2.5},{"n":"山河绝韵","crit":15,"critDmg":4.4},{"n":"威猛歌","int":6.7,"intDmg":5.2},{"n":"无名剑法","da":121.3,"dint":2.3},{"n":"千山法","shu":{"sys":"鸣金","xiao":22.1,"da":44.3},"sysPierce":{"sys":"鸣金","v":6}},{"n":"逐狼心经","int":6.7,"intDmg":5.2},{"n":"纵地摘星","xiao":39,"da":78,"pierce":5.1},{"n":"春雷篇","xiao":39,"da":78,"dmg":2.5},{"n":"霜天百夜","xiao":130.1,"dcrit":4.6},{"n":"孤忠不辞","crit":13.5,"critDmg":4},{"n":"穿喉决","shu":{"sys":"裂石","xiao":22.1,"da":44.3},"sysPierce":{"sys":"裂石","v":6}},{"n":"抗造大法","shu":{"sys":"裂石","xiao":22.1,"da":44.3},"sysPierce":{"sys":"裂石","v":6}},{"n":"移经易武","shu":{"sys":"鸣金","xiao":0,"da":66.4},"shuBonus":{"sys":"鸣金","v":3}},{"n":"扶摇直上","xiao":130.1,"dcrit":4.6},{"n":"擒天势","crit":13.5,"critDmg":4},{"n":"三穷致知","xiao":39,"da":78,"dmg":2.5},{"n":"君臣药","crit":15,"dcrit":4.6},{"n":"凝神章","xiao":39,"da":78,"pierce":5.1},{"n":"相和歌","xiao":130.1,"dcrit":4.6},{"n":"弦墨篇","xiao":39,"da":78,"dmg":2.5},{"n":"风知意","crit":13.5,"critDmg":4},{"n":"四时无常","xiao":43.4,"da":86.8,"dmg":2.8},{"n":"一醉千秋","xiao":130.1,"dcrit":4.6},{"n":"飞仙醉言","crit":13.5,"critDmg":4},{"n":"燕别云岫","xiao":39,"da":78,"dmg":2.5},{"n":"大卷微身","shu":{"sys":"无相","xiao":22.1,"da":44.3},"sysPierce":{"sys":"无相","v":6}}];
export const GP_TALENT_ROWS = {"鸣金虹":{"xiao":0,"da":129.9,"acc":0,"crit":0,"int":7.5},"鸣金影":{"xiao":0,"da":129.9,"acc":0,"crit":0,"int":7.5},"裂石威":{"xiao":129.9,"da":129.9,"acc":0,"crit":0,"int":0},"裂石钧":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"牵丝玉":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"牵丝翊":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"破竹尘":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"破竹风":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"破竹鸢":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0},"破竹樽":{"xiao":129.9,"da":0,"acc":0,"crit":15,"int":0}};
export const GP_BASE_SCHOOLS = [{"display":"鸣金-虹","talent":"鸣金虹","note":""},{"display":"鸣金-影","talent":"鸣金影","note":""},{"display":"裂石-威","talent":"裂石威","note":""},{"display":"裂石钧（唐/陌）","talent":"裂石钧","note":"裂石-唐 / 裂石钧-唐 / 裂石钧-陌 近似按裂石钧计"},{"display":"裂石-唐","talent":"裂石钧","note":"近似按裂石钧计"},{"display":"牵丝-玉","talent":"牵丝玉","note":""},{"display":"牵丝·翊","talent":"牵丝翊","note":"按牵丝翊行计"},{"display":"牵丝-霖","talent":null,"note":"暂无对应天赋数据，不自动加"},{"display":"破竹-尘","talent":"破竹尘","note":""},{"display":"破竹-风","talent":"破竹风","note":""},{"display":"破竹-鸢","talent":"破竹鸢","note":""},{"display":"破竹-樽","talent":"破竹樽","note":""}];
export const GP_BUILD_SCHOOL_DISPLAY = {"鸣金-虹":"鸣金-虹","鸣金-影":"鸣金-影","裂石-威":"裂石-威","裂石钧-唐":"裂石钧（唐/陌）","裂石钧-陌":"裂石钧（唐/陌）","裂石-唐":"裂石-唐","裂石-钧（易水歌）":"裂石钧（唐/陌）","牵丝-玉（飞天）":"牵丝-玉","牵丝-玉（走地）":"牵丝-玉","牵丝-霖（纯奶）":"牵丝-霖","牵丝-霖（火拳）":"牵丝-霖","牵丝·翊":"牵丝·翊","破竹-鸢":"破竹-鸢","破竹-樽":"破竹-樽","破竹-尘":"破竹-尘","破竹-风":"破竹-风"};
export const GP_TALENT = {"template":[{"apply":"crit","stat":"min","need":300,"val":9.1},{"apply":"xiaowai","stat":"min","need":300,"val":79.2}],"exclude":{"裂石-威":true},"bySchool":{"鸣金-虹":[{"apply":"int","stat":"jin","need":300,"val":4.6},{"apply":"dawai","stat":"jin","need":300,"val":79.2}],"鸣金-影":[{"apply":"int","stat":"jin","need":300,"val":4.6},{"apply":"dawai","stat":"jin","need":300,"val":79.2}],"裂石-威":[{"apply":"dawai","stat":"maxTiJin","need":300,"val":79.2}]}};
export const GP_DINGYIN_LEFT = {"外功穿透":12.8,"外功抗性":12.8,"无相穿透":15.2};
export const GP_DINGYIN_RIGHT_MAX = 6;
export const GP_DINGYIN_LEFT_SLOTS = ["武器","主武器","副武器","环","佩"];
export const GP_BUILD_DINGYIN = {"鸣金-虹":{"name":"无名剑法·蓄力技增伤","wuxue":"无名剑法","verified":true},"鸣金-影":{"name":"积矩九剑·流血增伤","wuxue":"积矩九剑","verified":true},"裂石-威":{"name":"嗟夫刀法·蓄力技增伤","wuxue":"嗟夫刀法","verified":true},"裂石钧-唐":{"name":"斩雪刀法·轻重击派生技增伤","wuxue":"斩雪刀法","verified":true},"裂石-唐":{"name":"斩雪刀法·轻重击派生技增伤","wuxue":"斩雪刀法","verified":true},"裂石钧-陌":{"name":"十方破阵·蓄力技增伤","wuxue":"十方破阵","verified":true},"裂石-钧（易水歌）":{"name":"十方破阵·蓄力技增伤","wuxue":"十方破阵","verified":true},"牵丝-玉（走地）":{"name":"九重春色·特殊技增伤","wuxue":"九重春色","verified":true},"牵丝-霖（纯奶）":{"name":"明川药典·治疗技增疗","wuxue":"明川药典","verified":true},"破竹-尘":{"name":"醉梦游春·武学技增伤","wuxue":"醉梦游春","verified":true},"破竹-风":{"name":"粟子游尘·鼠鼠增伤","wuxue":"粟子游尘","wuxueAlt":"栗子游尘","verified":true},"破竹-鸢":{"name":"天志垂象·蓄力技增伤","wuxue":"天志垂象","verified":true},"牵丝-玉（飞天）":{"category":"弹道 / 伞蓄力（两说）","keywords":["弹道","蓄力"],"verified":false},"牵丝-霖（火拳）":{"name":"明川药典·治疗技增疗","wuxue":"明川药典","verified":true},"牵丝·翊":{"name":"文动霓裳·特殊技增伤","wuxue":"文动霓裳","verified":true},"破竹-樽":{"name":"悬身断水·浓醺技能增伤","wuxue":"悬身断水","keywords":["酩酊"],"verified":true}};
export const GP_BOW_JUE_VALUES = {"acc":{"acc":4.7,"crit":0,"int":0,"label":"精准弓"},"crit":{"acc":0,"crit":5.2,"int":0,"label":"会心弓"},"int":{"acc":0,"crit":0,"int":2.6,"label":"会意弓"}};
export const GP_BOW_RECOMMEND = {"精准":"acc","会心":"crit","会意":"int","会心/精准":"crit"};
export const GP_LEGACY_KEY = {"benshu":"shu_wx_da","wuxiang":"shu_wx_da","dashu":"shu_wx_da","xiaoshu":"shu_wx_xiao","danti":"quanqi","qunti":"quanqi"};
export const GP_PASTE_NAME_TO_KEY = {"大外功":"dawai","大外":"dawai","小外功":"xiaowai","小外":"xiaowai","最大鸣金攻击":"shu_mj_da","大鸣金":"shu_mj_da","最小鸣金攻击":"shu_mj_xiao","小鸣金":"shu_mj_xiao","最大裂石攻击":"shu_ls_da","大裂石":"shu_ls_da","最小裂石攻击":"shu_ls_xiao","小裂石":"shu_ls_xiao","最大破竹攻击":"shu_pz_da","大破竹":"shu_pz_da","最小破竹攻击":"shu_pz_xiao","小破竹":"shu_pz_xiao","最大牵丝攻击":"shu_qs_da","大牵丝":"shu_qs_da","最小牵丝攻击":"shu_qs_xiao","小牵丝":"shu_qs_xiao","最大无相攻击":"shu_wx_da","大无相":"shu_wx_da","最小无相攻击":"shu_wx_xiao","小无相":"shu_wx_xiao","体":"ti","劲":"jin","御":"yu","敏":"min","势":"shi","精准率":"jingzhun","精准":"jingzhun","会心率":"huixin","会心":"huixin","会意率":"huiyi","会意":"huiyi","武器增效":"wuqizeng","武器增":"wuqizeng","全武学增效":"quanwu","全武":"quanwu","首领增伤":"shouling","首领":"shouling","玩家增伤":"wanjia","玩家":"wanjia","全奇术增伤":"quanqi","全奇术":"quanqi","无相":"shu_wx_da","鸣金大":"shu_mj_da","鸣金小":"shu_mj_xiao","破竹大":"shu_pz_da","破竹小":"shu_pz_xiao","牵丝大":"shu_qs_da","牵丝小":"shu_qs_xiao","裂石大":"shu_ls_da","裂石小":"shu_ls_xiao","双刀增":"wuqizeng","双刀增效":"wuqizeng","max physical attack":"dawai","min physical attack":"xiaowai","physical attack":"dawai","max bellstrike attack":"shu_mj_da","min bellstrike attack":"shu_mj_xiao","max stonesplit attack":"shu_ls_da","min stonesplit attack":"shu_ls_xiao","max silkbind attack":"shu_qs_da","min silkbind attack":"shu_qs_xiao","max bamboocut attack":"shu_pz_da","min bamboocut attack":"shu_pz_xiao","max void attack":"shu_wx_da","min void attack":"shu_wx_xiao","max formless attack":"shu_wx_da","min formless attack":"shu_wx_xiao","body":"ti","power":"jin","defense":"yu","agility":"min","momentum":"shi","precision rate":"jingzhun","precision":"jingzhun","critical rate":"huixin","critical":"huixin","affinity rate":"huiyi","affinity":"huiyi","all martial arts":"quanwu","vs boss dmg":"shouling","boss dmg":"shouling","boss damage":"shouling","single-target mystic":"quanqi","single target mystic":"quanqi","area mystic":"quanqi","外功攻击":"dawai","最大外功":"dawai","最小外功":"xiaowai","全武学":"quanwu","对首领增伤":"shouling","单体奇术":"quanqi","群体奇术":"quanqi","单体奇术增伤":"quanqi","群体奇术增伤":"quanqi","鸣金攻击":"shu_mj_da","破竹攻击":"shu_pz_da","牵丝攻击":"shu_qs_da","裂石攻击":"shu_ls_da"};
export const GP_SLOT_ALIAS = {"主武器":"武器","主武":"武器","武器":"武器","mainweapon":"武器","primaryweapon":"武器","weapon1":"武器","main weapon":"武器","primary weapon":"武器","副武器":"武器","副武":"武器","secondaryweapon":"武器","weapon2":"武器","secondary weapon":"武器","冠胄":"冠胄","头盔":"冠胄","头部":"冠胄","helmet":"冠胄","head":"冠胄","helm":"冠胄","胸甲":"胸甲","衣服":"胸甲","上衣":"胸甲","armor":"胸甲","armour":"胸甲","chest":"胸甲","body armor":"胸甲","环":"环","戒指":"环","ring":"环","佩":"佩","佩饰":"佩","玉佩":"佩","pendant":"佩","accessory":"佩","amulet":"佩","手甲":"武器","拳套":"武器","胫甲":"胫甲","护腿":"胫甲","腿甲":"胫甲","鞋":"胫甲","靴":"胫甲","leggings":"胫甲","legs":"胫甲","greaves":"胫甲","boots":"胫甲","腕甲":"腕甲","护腕":"腕甲","臂甲":"腕甲","bracers":"腕甲","bracer":"腕甲","arms":"腕甲","gloves":"腕甲"};
export const GP_SCHOOL_TAG_LIST = ["鸣金-虹","鸣金-影","牵丝-玉（飞天）","牵丝-玉（走地）","牵丝-霖（纯奶）","牵丝-霖（火拳）","牵丝·翊","裂石-威","裂石钧-唐","裂石钧-陌","破竹-鸢","破竹-樽","破竹-尘","破竹-风","裂石-唐","裂石-钧（易水歌）"];

export function gpTalentText(rowName) {
  const t = GP_TALENT_ROWS[rowName]; if (!t) return '';
  const parts = ['本系属攻 小 328 / 大 656'];
  if (t.da) parts.push('大外 ' + t.da);
  if (t.xiao) parts.push('小外 ' + t.xiao);
  if (t.crit) parts.push('会心 ' + t.crit + '%');
  if (t.int) parts.push('会意 ' + t.int + '%');
  if (t.acc) parts.push('精准 ' + t.acc + '%');
  return parts.join('、');
}
// 五维换算速查行 (原站公式区原文, 满条 = 57.4)
export const GP_DIM_ROWS = [
  { name: '体', conv: '60 气血', full: '3444 气血' },
  { name: '劲', conv: '1.36 大外 + 0.225 小外', full: '78 大外 + 12.9 小外' },
  { name: '御', conv: '17 气血 + 0.5 外功防御', full: '976 气血 + 28.7 防御' },
  { name: '敏', conv: '0.9 小外 + 0.076% 会心率', full: '51.6 小外 + 4.36% 会心' },
  { name: '势', conv: '0.9 大外 + 0.038% 会意率', full: '51.6 大外 + 2.18% 会意' },
];
export const GP_QUICK_BAR_NAMES = ['承音精准', '承音会心', '承音会意'];

/* ================= 派生表 / 基础判定 (对照原站) ================= */
export const GP_AFFIX_BY_KEY = {};
GP_AFFIX.forEach((a) => { GP_AFFIX_BY_KEY[a.key] = a; });
const SHU_SYSTEMS = ['鸣金', '裂石', '破竹', '牵丝', '无相'];
const SHU_KEY_INFO = {};
GP_AFFIX.forEach((a) => { if (a.sys) SHU_KEY_INFO[a.key] = { sys: a.sys, size: a.size }; });
export function gpIsShuKey(key) { return !!SHU_KEY_INFO[key]; }
export function gpIsWuxiangKey(key) { return key === 'shu_wx_da' || key === 'shu_wx_xiao'; }
function shuSystemOfKey(key) { const i = SHU_KEY_INFO[key]; return i ? i.sys : null; }
function shuSizeOfKey(key) { const i = SHU_KEY_INFO[key]; return i ? i.size : null; }
const CLASS_OF_KEY = {};
Object.keys(SHU_KEY_INFO).forEach((k) => { CLASS_OF_KEY[k] = 'shugong'; });
export function gpClassOf(key) { return CLASS_OF_KEY[key] || key; }
export function gpBuildSystem(build) {
  // 逐字对照原站: 只按 "-" 切分。故「牵丝·翊」得到全名、不在 SHU_SYSTEMS 中 → null,
  // 其牵丝属攻词条在原站口径下不归 shugong (面板亦归 otherShu) — 原样保留, 不擅改。
  const sch = (build && build.school) || '';
  const sys = sch.split('-')[0];
  return SHU_SYSTEMS.indexOf(sys) > -1 ? sys : null;
}
export function gpEffectiveClassOf(key, build) {
  if (!gpIsShuKey(key)) return gpClassOf(key);
  const sys = shuSystemOfKey(key);
  const bsys = gpBuildSystem(build);
  if (sys && build && build.targets && sys === bsys && build.targets.some((t) => gpIsShuKey(t.cls) && shuSystemOfKey(t.cls) === sys)) return key;
  return (sys === '无相' || sys === bsys) ? 'shugong' : key;
}
export function gpParseRecipe(recipe) {
  const out = [];
  String(recipe || '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').split('+').forEach((seg) => {
    seg = seg.trim(); if (!seg) return;
    const m = seg.match(/^(\d+)\s*(.+)$/); if (!m) return;
    const n = parseInt(m[1], 10), nm = m[2].trim();
    if (nm.indexOf('/') > -1) {
      const keys = [];
      nm.split('/').forEach((p) => { p = p.trim(); const k = GP_NAME_TO_CLASS[p] || (p === '大裂' ? 'shugong' : null); if (k && keys.indexOf(k) === -1) keys.push(k); });
      if (keys.length) out.push({ cls: 'flex:' + keys.join('|'), label: nm + '（二选一）', n, flex: keys });
    } else {
      const k = GP_NAME_TO_CLASS[nm]; if (k) out.push({ cls: k, label: GP_CLASS_LABEL[k] || nm, n, flex: null });
    }
  });
  const agg = {}, order = [];
  out.forEach((it) => {
    if (agg[it.cls]) { agg[it.cls].n += it.n; }
    else { agg[it.cls] = it; order.push(it); }
  });
  return order;
}
export const GP_BUILDS = GP_BUILDS_RAW.map((b) => {
  const targets = gpParseRecipe(b.recipe);
  return { ...b, targets, total: targets.reduce((s, it) => s + it.n, 0) };
});
export function gpBuild(idx) { return GP_BUILDS[idx] || GP_BUILDS[0]; }

export function gpGearSlotOf(slot) {
  if (slot === '主武器' || slot === '副武器' || slot === '武器') return '武器';
  return GP_GEAR_SLOTS.indexOf(slot) > -1 ? slot : null;
}
export function gpIsWeaponSlot(slot) { return slot === '武器' || slot === '主武器' || slot === '副武器'; }

/* ================= 定音 ================= */
const DINGYIN_LEFT_SLOT_SET = new Set(GP_DINGYIN_LEFT_SLOTS);
export function gpIsLeftDingyinSlot(slot) { return !!DINGYIN_LEFT_SLOT_SET.has(slot); }
export function gpIsMartialDingyinName(name) {
  name = String(name || '').trim();
  return !!name && GP_DINGYIN_LEFT[name] == null && (name.indexOf('增伤') > -1 || name.indexOf('增疗') > -1);
}
export function gpDingyinMax(name, slot) {
  if (gpIsLeftDingyinSlot(slot)) return GP_DINGYIN_LEFT[String(name || '').trim()] || null;
  if (!slot) { const ln = GP_DINGYIN_LEFT[String(name || '').trim()]; if (ln) return ln; }
  return gpIsMartialDingyinName(name) ? GP_DINGYIN_RIGHT_MAX : null;
}
export function gpBuildDingyinInfo(build) { return build ? (GP_BUILD_DINGYIN[build.school] || null) : null; }
function dingyinOtherWuxueHit(name, info) {
  for (const k in GP_BUILD_DINGYIN) {
    const o = GP_BUILD_DINGYIN[k]; if (!o.verified) continue;
    if (info && info.wuxue && o.wuxue === info.wuxue) continue;
    if (o.wuxue && name.indexOf(o.wuxue) > -1) return true;
    if (o.wuxueAlt && name.indexOf(o.wuxueAlt) > -1) return true;
  }
  return false;
}
export function gpDingyinTypeCorrect(name, slot, build) {
  name = String(name || '').trim(); if (!name) return false;
  if (gpIsLeftDingyinSlot(slot)) return name === '外功穿透';
  if (!gpIsMartialDingyinName(name)) return false;
  const info = gpBuildDingyinInfo(build);
  if (!info) return true;
  if (info.verified) {
    if (name.indexOf(info.wuxue) > -1) return true;
    if (info.wuxueAlt && name.indexOf(info.wuxueAlt) > -1) return true;
    return !dingyinOtherWuxueHit(name, info);
  }
  for (let j = 0; j < (info.keywords || []).length; j++) { if (name.indexOf(info.keywords[j]) > -1) return true; }
  return !dingyinOtherWuxueHit(name, info);
}
export function gpParseVal(v) {
  if (v == null) return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  let t = String(v).replace(/[%％\s]/g, '');
  if (!t) return null;
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  else if (/^-?\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.');
  else t = t.replace(/,/g, '');
  const n = parseFloat(t);
  return isNaN(n) ? null : n;
}
export function gpSanitizeDingyin(d, slot) {
  if (!d || typeof d !== 'object') return null;
  const name = String(d.name || d.type || '').trim();
  const v = (typeof d.val === 'number') ? d.val : gpParseVal(d.val);
  if (!name || v == null || !isFinite(v) || v < 0) return null;
  if (gpDingyinMax(name, slot) == null) return null;
  return { name, val: v };
}

/* ================= 武器流派标签 ================= */
const WUXUE_LIST = [];
Object.keys(GP_BUILD_DINGYIN).forEach((k) => { const w = GP_BUILD_DINGYIN[k].wuxue; if (w && WUXUE_LIST.indexOf(w) < 0) WUXUE_LIST.push(w); });
if (WUXUE_LIST.indexOf('玉飞天') < 0) WUXUE_LIST.push('玉飞天');
export const GP_WUXUE_NAMES = WUXUE_LIST;
const WUXUE_ALT = {};
Object.keys(GP_BUILD_DINGYIN).forEach((k) => { const o = GP_BUILD_DINGYIN[k]; if (o.wuxue && o.wuxueAlt) WUXUE_ALT[o.wuxueAlt] = o.wuxue; });
export function gpBuildWuxue(build) {
  const info = gpBuildDingyinInfo(build); if (info && info.wuxue) return info.wuxue;
  if (build && build.school === '牵丝-玉（飞天）') return '玉飞天';
  return null;
}
export function gpWuxueFromDingyinName(name) {
  name = String(name || '').trim(); if (!name) return null;
  for (let i = 0; i < WUXUE_LIST.length; i++) { if (name.indexOf(WUXUE_LIST[i]) === 0) return WUXUE_LIST[i]; }
  for (const alt in WUXUE_ALT) { if (name.indexOf(alt) === 0) return WUXUE_ALT[alt]; }
  return null;
}
const WUXUE_TO_SCHOOLS = {};
GP_BUILDS.forEach((b) => { const w = gpBuildWuxue(b); if (!w) return; const arr = (WUXUE_TO_SCHOOLS[w] = WUXUE_TO_SCHOOLS[w] || []); if (arr.indexOf(b.school) < 0) arr.push(b.school); });
export function gpSchoolTagsFromDingyinName(name) {
  const w = gpWuxueFromDingyinName(name);
  const s = w ? WUXUE_TO_SCHOOLS[w] : null;
  return s ? s.slice() : [];
}
export function gpSanitizeSchoolTags(v) {
  if (!Array.isArray(v)) return [];
  const seen = {}, out = [];
  v.forEach((t) => {
    if (typeof t !== 'string') return;
    let list = null;
    if (GP_SCHOOL_TAG_LIST.indexOf(t) > -1) list = [t];
    else { const w = WUXUE_ALT[t] || t; if (WUXUE_TO_SCHOOLS[w]) list = WUXUE_TO_SCHOOLS[w]; }
    if (!list) return;
    list.forEach((s) => { if (!seen[s]) { seen[s] = 1; out.push(s); } });
  });
  out.sort((a, b) => GP_SCHOOL_TAG_LIST.indexOf(a) - GP_SCHOOL_TAG_LIST.indexOf(b));
  return out;
}
export function gpWeaponUsableForBuild(g, build) {
  if (!g || !gpIsWeaponSlot(g.slot)) return true;
  const tags = Array.isArray(g.schools) ? g.schools : [];
  if (!tags.length) return true;
  if (!build || !build.school) return true;
  return tags.indexOf(build.school) > -1;
}

/* ================= 装备校验 / 归一化 ================= */
function sanitizeLineData(l, slot, warnings) {
  if (!l || typeof l !== 'object') return null;
  const key = GP_LEGACY_KEY[l.key] || l.key;
  if (!GP_AFFIX_BY_KEY[key]) return null;
  if (gpIsWuxiangKey(key) && !gpIsWeaponSlot(slot)) {
    if (warnings) warnings.push('异常：非武器部位出现' + GP_AFFIX_BY_KEY[key].label + '，已忽略（无相属攻只出现在武器）');
    return null;
  }
  const v = (typeof l.val === 'number') ? l.val : gpParseVal(l.val);
  if (v == null || !isFinite(v) || v < 0) return null;
  return { key, val: v };
}
export function gpSanitizeGearData(raw) {
  const warnings = [];
  if (raw && Array.isArray(raw.warnings)) raw.warnings.forEach((w) => { if (typeof w === 'string' && w) warnings.push(w); });
  let gslot = raw ? gpGearSlotOf(raw.slot) : null;
  if (gslot == null) gslot = (raw && raw.slot != null) ? String(raw.slot) : '';
  let lines = [];
  if (raw && Array.isArray(raw.lines)) raw.lines.forEach((l) => { const sl = sanitizeLineData(l, gslot, warnings); if (sl) lines.push(sl); });
  lines = lines.slice(0, 8);
  let schools = [];
  if (gpIsWeaponSlot(gslot)) {
    let rawTags = [];
    if (raw && Array.isArray(raw.schools)) rawTags = rawTags.concat(raw.schools);
    if (raw && Array.isArray(raw.wuxue)) rawTags = rawTags.concat(raw.wuxue);
    schools = gpSanitizeSchoolTags(rawTags);
    if (!schools.length && raw && raw.dingyin) {
      schools = gpSchoolTagsFromDingyinName(raw.dingyin.name || raw.dingyin.type || '');
    }
  }
  return {
    gear: {
      id: (raw && typeof raw.id === 'number') ? raw.id : null,
      slot: gslot, name: raw && raw.name != null ? String(raw.name) : '',
      lines, dingyin: raw ? gpSanitizeDingyin(raw.dingyin, gslot) : null,
      schools, warnings,
    },
    warnings,
  };
}
export function gpNormalizeGearList(rawList) {
  const out = [], seen = {}, firstMap = {};
  let usedMax = 0;
  (Array.isArray(rawList) ? rawList : []).forEach((raw) => {
    if (!raw || gpGearSlotOf(raw.slot) == null || !Array.isArray(raw.lines)) return;
    const g = gpSanitizeGearData(raw).gear;
    const oldId = (typeof raw.id === 'number' && isFinite(raw.id)) ? Math.floor(raw.id) : null;
    let assigned = null;
    if (oldId != null && oldId > 0 && !seen[oldId]) assigned = oldId;
    else { assigned = usedMax + 1; while (seen[assigned]) assigned++; }
    seen[assigned] = 1; if (assigned > usedMax) usedMax = assigned;
    if (oldId != null && firstMap[oldId] == null) firstMap[oldId] = assigned;
    g.id = assigned; out.push(g);
  });
  return { list: out, firstMap, nextId: usedMax + 1 };
}

/* ================= 角色基础 + 心法 (对照 getBase / xinfaSummary) ================= */
const XINFA_BY_NAME = {};
GP_XINFA.forEach((x) => { XINFA_BY_NAME[x.n] = x; });
export function gpXinfaSummary(pickedNames) {
  const s = { xiao: 0, da: 0, acc: 0, crit: 0, int: 0, dcrit: 0, dint: 0, dmg: 0, shuXiao: 0, shuDa: 0, pierce: 0, critDmg: 0, intDmg: 0, notes: [], picked: [], duplicates: [] };
  const seen = {};
  const picks = Array.isArray(pickedNames) ? pickedNames.slice(0, 4) : [];
  for (let i = 0; i < picks.length; i++) {
    const name = picks[i];
    if (!name) continue;
    const x = XINFA_BY_NAME[name]; if (!x) continue;
    if (seen[x.n]) { s.duplicates.push(x.n); continue; }
    seen[x.n] = 1;
    s.picked.push(x.n);
    s.xiao += x.xiao || 0; s.da += x.da || 0; s.acc += x.acc || 0; s.crit += x.crit || 0; s.int += x.int || 0;
    s.dcrit += x.dcrit || 0; s.dint += x.dint || 0; s.dmg += x.dmg || 0;
    s.pierce += x.pierce || 0; s.critDmg += x.critDmg || 0; s.intDmg += x.intDmg || 0;
    if (x.shu) { s.shuXiao += x.shu.xiao || 0; s.shuDa += x.shu.da || 0; s.notes.push(x.n + '：' + x.shu.sys + '属攻 小 ' + (x.shu.xiao || 0) + ' / 大 ' + (x.shu.da || 0) + '（已计入本系属攻合计，玩其他系时请自行甄别）'); }
    if (x.sysPierce) s.notes.push(x.n + '：' + x.sysPierce.sys + '穿透 ' + x.sysPierce.v + '（面板未单列，仅备注）');
    if (x.shuBonus) s.notes.push(x.n + '：' + x.shuBonus.sys + '属攻加成 ' + x.shuBonus.v + '%（面板未单列，仅备注）');
  }
  const fmt1 = (v) => String(Math.round(v * 10) / 10);
  if (s.duplicates.length) s.notes.push('重复心法未重复计入：' + s.duplicates.join('、'));
  if (s.pierce) s.notes.push('心法外功穿透合计 ' + fmt1(s.pierce) + '（面板未单列，仅备注）');
  if (s.critDmg) s.notes.push('心法会心伤害合计 ' + fmt1(s.critDmg) + '%（仅备注）');
  if (s.intDmg) s.notes.push('心法会意伤害合计 ' + fmt1(s.intDmg) + '%（仅备注）');
  return s;
}
function zeroBase() {
  return { ti: 0, jin: 0, yu: 0, min: 0, shi: 0, xiaowai: 0, dawai: 0, acc: 0, crit: 0, int: 0, dcrit: 0, dint: 0, hp: 0, shuXiao: 0, shuDa: 0, wkXiao: 0, wkDa: 0, wkShuXiao: 0, wkShuDa: 0, wkHp: 0, wxXiao: 0, wxDa: 0, dmg: 0, shuDmg: 0 };
}
// values: {field: number|null}; null/缺失 → 0, 但武库/无相底子字段回退预设 (原站口径)
export function gpGetBase(values, xinfaNames) {
  const z = zeroBase();
  const vals = values || {};
  GP_BASE_FIELDS.forEach((f) => {
    const raw = vals[f];
    let v = (typeof raw === 'number' && isFinite(raw)) ? raw : 0;
    if (f === 'xiao') z.xiaowai = v; else if (f === 'da') z.dawai = v; else z[f] = v;
  });
  GP_WK_FIELDS.forEach((f) => { const raw = vals[f]; if (raw == null || raw === '' || !isFinite(parseFloat(raw))) z[f] = GP_BASE_PRESET[f] || 0; });
  GP_WX_FIELDS.forEach((f) => { const raw = vals[f]; if (raw == null || raw === '' || !isFinite(parseFloat(raw))) z[f] = GP_BASE_PRESET[f] || 0; });
  const xf = gpXinfaSummary(xinfaNames);
  z.xiaowai += xf.xiao; z.dawai += xf.da; z.acc += xf.acc; z.crit += xf.crit; z.int += xf.int;
  z.dcrit += xf.dcrit; z.dint += xf.dint; z.dmg += xf.dmg; z.shuXiao += xf.shuXiao; z.shuDa += xf.shuDa;
  return { base: z, xinfa: xf };
}
export function gpExtrasFrom(extras) {
  const ex = extras || {};
  const kind = ex.bowKind || '';
  const bv = GP_BOW_JUE_VALUES[kind] || { acc: 0, crit: 0, int: 0, label: '无' };
  const numOr = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  return {
    res: Math.max(0.5, numOr(ex.res, 1.85) || 1.85),
    acc: numOr(ex.acc, 0), crit: numOr(ex.crit, 0), int: numOr(ex.int, 0),
    bowKind: kind, bowLabel: bv.label, bowAcc: bv.acc || 0, bowCrit: bv.crit || 0, bowInt: bv.int || 0,
  };
}

/* ================= 单件评分 / 品质 (对照第 44 节口径) ================= */
export function gpLineValueScore(l) {
  const a = GP_AFFIX_BY_KEY[l && l.key]; if (!a) return 0;
  const v = (typeof l.val === 'number') ? l.val : gpParseVal(l.val);
  if (v == null || !isFinite(v) || v < 0) return 0;
  return Math.min(1, v / a.cy);
}
export function gpLineQualityPct(l) {
  const a = GP_AFFIX_BY_KEY[l && l.key]; if (!a) return null;
  const v = (typeof l.val === 'number') ? l.val : gpParseVal(l.val);
  if (v == null || !isFinite(v) || v < 0) return null;
  return v / a.max * 100;
}
export function gpGearQuality(g) {
  if (!g.lines.length) return 0;
  let s = 0; g.lines.forEach((l) => { s += gpLineValueScore(l); });
  return s / g.lines.length;
}
const CORE44_NAME2KEY = { '大外': 'dawai', '小外': 'xiaowai', '劲': 'jin', '敏': 'min', '势': 'shi', '体': 'ti', '御': 'yu', '全武学': 'quanwu', '首领': 'shouling', '玩家': 'wanjia', '全奇术': 'quanqi', '增伤': 'wuqizeng', '武器增效': 'wuqizeng' };
function core44IsShuToken(tok) { return tok.indexOf('无相') > -1 || tok.indexOf('本属') > -1 || tok === '属攻'; }
function core44SingleUnit(tok) {
  if (tok === '三率') return { rate: true };
  const k = CORE44_NAME2KEY[tok];
  return k ? { cls: k } : null;
}
function core44ChoiceUnit(tok, mainStat) {
  const parts = tok.split('/').map((s) => s.replace(/\s+/g, '')).filter((p) => p && !core44IsShuToken(p));
  if (!parts.length) return null;
  for (let i = 0; i < parts.length; i++) { if (CORE44_NAME2KEY[parts[i]] === mainStat) return { cls: mainStat }; }
  if (parts.length === 1) return core44SingleUnit(parts[0]);
  if (parts.indexOf('三率') > -1) return { rate: true };
  const anyOf = [];
  parts.forEach((p) => { const u = core44SingleUnit(p); if (u && u.cls) anyOf.push(u.cls); });
  return anyOf.length ? { anyOf } : null;
}
const core44Cache = {};
export function gpCoreOf44(slot, build) {
  const gs = gpGearSlotOf(slot);
  const cat = (build && build.cat) || '';
  const fam = cat.indexOf('小外') === 0 ? 'small' : (cat.indexOf('大外') === 0 ? 'big' : null);
  if (!gs || !fam) return [];
  const cacheKey = gs + '|' + fam;
  if (core44Cache[cacheKey]) return core44Cache[cacheKey];
  const table = (fam === 'small') ? GP_SLOTS_SMALL : GP_SLOTS_BIG;
  let row = null;
  for (let i = 0; i < table.length; i++) { if (table[i].slot === gs) { row = table[i]; break; } }
  const mainStat = (fam === 'small') ? 'min' : 'jin';
  const out = []; let total = 0;
  if (row) {
    for (let j = 0; j < row.lines.length && total < 3; j++) {
      const tok = String(row.lines[j]).replace(/\s+/g, '');
      if (!tok || core44IsShuToken(tok)) continue;
      const unit = (tok.indexOf('/') > -1) ? core44ChoiceUnit(tok, mainStat) : core44SingleUnit(tok);
      if (!unit) continue;
      let merged = false;
      for (let m = 0; m < out.length; m++) {
        const e = out[m];
        if ((unit.cls && e.cls === unit.cls) || (unit.rate && e.rate) || (unit.anyOf && e.anyOf && e.anyOf.join('|') === unit.anyOf.join('|'))) { e.n++; merged = true; break; }
      }
      if (!merged) { const nu = { n: 1 }; if (unit.cls) nu.cls = unit.cls; if (unit.rate) nu.rate = true; if (unit.anyOf) nu.anyOf = unit.anyOf; out.push(nu); }
      total++;
    }
  }
  core44Cache[cacheKey] = out;
  return out;
}
function gearScoreCoreFrac44(g, build, valid) {
  const cores = gpCoreOf44(g.slot, build);
  if (!cores.length) return 0;
  const cat = (build && build.cat) || '';
  const rateSet = { jingzhun: true };
  if (cat.indexOf('会心') > -1) rateSet.huixin = true;
  if (cat.indexOf('会意') > -1) rateSet.huiyi = true;
  const counts = {};
  valid.forEach((l) => { const c = gpEffectiveClassOf(l.key, build); counts[c] = (counts[c] || 0) + 1; });
  let got = 0, need = 0;
  cores.forEach((e) => {
    need += e.n;
    let have = 0, k;
    if (e.rate) { for (k in counts) { if (rateSet[k]) have += counts[k]; } }
    else if (e.anyOf) { for (k in counts) { if (e.anyOf.indexOf(k) > -1) have += counts[k]; } }
    else have = counts[e.cls] || 0;
    got += Math.min(have, e.n);
  });
  return need ? got / need : 0;
}
export function gpGearScore(g, build) {
  const valid = (g.lines || []).filter((l) => gpLineQualityPct(l) != null && !(gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)));
  if (!valid.length) return 0;
  const weights = {};
  build.targets.forEach((t) => { if (t.flex) { t.flex.forEach((k) => { weights[k] = (weights[k] || 0) + t.n; }); } else if (t.cls) weights[t.cls] = (weights[t.cls] || 0) + t.n; });
  let wsum = 0, vsum = 0;
  valid.forEach((l) => { const c = gpEffectiveClassOf(l.key, build); const w = weights[c]; if (w) { wsum += w; vsum += w * gpLineValueScore(l); } });
  const Q = wsum ? vsum / wsum : 0;
  const linesFactor = Math.min(1, valid.length / 5);
  return Math.round((60 * gearScoreCoreFrac44(g, build, valid) + 40 * Q) * linesFactor);
}

/* ================= 传家宝 / 拉完了 (对照原站 DFS 口径) ================= */
function heirloomLineClass(g, l, build) {
  if (!l || !l.key) return null;
  if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) return null;
  return gpEffectiveClassOf(l.key, build);
}
function heirloomResolutions(build) {
  if (build._hlRes) return build._hlRes;
  const fixed = {}, groups = [];
  (build.targets || []).forEach((t) => {
    if (t.flex) groups.push(t);
    else fixed[t.cls] = (fixed[t.cls] || 0) + t.n;
  });
  function cloneMap(m) { const o = {}; for (const k in m) o[k] = m[k]; return o; }
  const out = [];
  (function rec(gi, cur) {
    if (gi >= groups.length) { out.push(cur); return; }
    const mem = groups[gi].flex, n = groups[gi].n;
    (function split(mi, left, acc) {
      if (mi === mem.length - 1) {
        const c2 = cloneMap(acc); c2[mem[mi]] = (c2[mem[mi]] || 0) + left; rec(gi + 1, c2); return;
      }
      for (let x = 0; x <= left; x++) {
        const a2 = cloneMap(acc); if (x) a2[mem[mi]] = (a2[mem[mi]] || 0) + x;
        split(mi + 1, left - x, a2);
      }
    })(0, n, cur);
  })(0, fixed);
  build._hlRes = out;
  return out;
}
function heirloomClassIndex(build) {
  if (build._hlIdx) return build._hlIdx;
  const idx = {}, list = [];
  heirloomResolutions(build).forEach((r) => {
    Object.keys(r).forEach((c) => { if (idx[c] === undefined) { idx[c] = list.length; list.push(c); } });
  });
  build._hlIdx = idx; build._hlList = list;
  return idx;
}
function heirloomCanPartition(vec, pieces, memo) {
  let total = 0, i;
  for (i = 0; i < vec.length; i++) total += vec[i];
  if (total === 0) return pieces === 0;
  if (pieces <= 0 || total !== pieces * 5) return false;
  const key = vec.join(',');
  if (memo[key] !== undefined) return memo[key];
  let ans = false;
  let minDoubles = 0, cap = 0, okc = true;
  for (i = 0; i < vec.length; i++) {
    if (vec[i] > 2 * pieces) okc = false;
    if (vec[i] > pieces) minDoubles += vec[i] - pieces;
    cap += Math.min(vec[i], pieces);
  }
  if (okc && minDoubles <= pieces && cap >= total - pieces) {
    let mi = 0;
    for (i = 1; i < vec.length; i++) if (vec[i] > vec[mi]) mi = i;
    const others = [];
    for (i = 0; i < vec.length; i++) if (i !== mi && vec[i] > 0) others.push(i);
    for (let setSize = 4; setSize <= 5 && !ans; setSize++) {
      const need = setSize - 1;
      if (others.length < need) continue;
      ans = heirloomPickSet(vec, pieces, memo, mi, others, need, setSize);
    }
  }
  memo[key] = ans;
  return ans;
}
function heirloomPickSet(vec, pieces, memo, mi, others, need, setSize) {
  const combo = []; let found = false;
  (function rec(start) {
    if (found) return;
    if (combo.length === need) {
      const S = [mi].concat(combo); let d, s;
      if (setSize === 5) {
        const v2 = vec.slice();
        for (s = 0; s < S.length; s++) v2[S[s]]--;
        if (heirloomCanPartition(v2, pieces - 1, memo)) found = true;
      } else {
        for (d = 0; d < S.length && !found; d++) {
          const dm = S[d];
          if (vec[dm] < 2) continue;
          const v3 = vec.slice();
          for (s = 0; s < S.length; s++) v3[S[s]]--;
          v3[dm]--;
          if (heirloomCanPartition(v3, pieces - 1, memo)) found = true;
        }
      }
      return;
    }
    for (let i = start; i <= others.length - (need - combo.length); i++) {
      combo.push(others[i]);
      rec(i + 1);
      combo.pop();
      if (found) return;
    }
  })(0);
  return found;
}
function heirloomEmbed(build, cand) {
  const idx = heirloomClassIndex(build), list = build._hlList;
  for (const c0 in cand) if (idx[c0] === undefined) return false;
  const memo = {}, resList = heirloomResolutions(build);
  for (let ri = 0; ri < resList.length; ri++) {
    const R = resList[ri], vec = []; let tot = 0, j, bad = false;
    for (j = 0; j < list.length; j++) vec.push(0);
    for (const c in R) vec[idx[c]] = R[c];
    for (const c2 in cand) { vec[idx[c2]] -= cand[c2]; if (vec[idx[c2]] < 0) { bad = true; break; } }
    if (bad) continue;
    for (j = 0; j < vec.length; j++) tot += vec[j];
    if (tot !== 35) continue;
    if (heirloomCanPartition(vec, 7, memo)) return true;
  }
  return false;
}
const heirloomCache = {};
export function gpIsHeirloom(g, build) {
  if (!g || !build || !build.targets || !g.lines || g.lines.length !== 5) return false;
  const clsArr = []; let i, c;
  for (i = 0; i < 5; i++) {
    c = heirloomLineClass(g, g.lines[i], build);
    if (c == null) return false;
    clsArr.push(c);
  }
  const cand = {};
  clsArr.forEach((x) => { cand[x] = (cand[x] || 0) + 1; });
  const first = clsArr[0];
  for (const k in cand) if (cand[k] > 2 || (cand[k] === 2 && k !== first)) return false;
  const sig = (build.cat || '') + '|' + (build.school || '') + '|' + (build.set || '') + '|' + first + '|' + clsArr.slice().sort().join(',');
  if (heirloomCache[sig] !== undefined) return heirloomCache[sig];
  const ans = heirloomEmbed(build, cand);
  heirloomCache[sig] = ans;
  return ans;
}
export function gpGearRecipeHits(g, build) {
  const wanted = {};
  build.targets.forEach((t) => {
    if (t.flex) t.flex.forEach((k) => { wanted[k] = true; });
    else wanted[t.cls] = true;
  });
  let hits = 0;
  (g.lines || []).forEach((l) => {
    if (!l || !l.key) return;
    if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) return;
    if (wanted[gpEffectiveClassOf(l.key, build)]) hits++;
  });
  return hits;
}
export function gpIsDud(g, build) {
  if (!g || !build || !build.targets || !g.lines || g.lines.length < 1) return false;
  if (gpIsHeirloom(g, build)) return false;
  return gpGearRecipeHits(g, build) === 0;
}

/* ================= 满值模拟有效值 ================= */
export function gpEffLineVal(g, l, sim) {
  const v = (typeof l.val === 'number') ? l.val : gpParseVal(l.val);
  if (v == null || !isFinite(v) || v < 0) return v;
  const tier = g ? (sim || {})[g.id] : null;
  if (tier) { const a = GP_AFFIX_BY_KEY[l.key]; if (a) return tier === 'max' ? a.max : a.cy; }
  return v;
}
export function gpEffLineScore(g, l, sim) {
  const a = GP_AFFIX_BY_KEY[l && l.key]; if (!a) return 0;
  const v = gpEffLineVal(g, l, sim);
  if (v == null || !isFinite(v) || v < 0) return 0;
  return Math.min(1, v / a.cy);
}
export function gpEffDingyinVal(g, sim) {
  if (!g || !g.dingyin) return null;
  const v = (typeof g.dingyin.val === 'number') ? g.dingyin.val : gpParseVal(g.dingyin.val);
  if (v == null || !isFinite(v) || v < 0) return null;
  const tier = (sim || {})[g.id];
  if (!tier) return v;
  const mx = gpDingyinMax(g.dingyin.name, g.slot);
  if (mx == null) return v;
  return tier === 'max' ? mx : Math.round(mx * 0.94 * 10) / 10;
}

/* ================= 天赋缩放节点 ================= */
export function gpTalentNodesFor(build) {
  if (!build) return [];
  if (GP_TALENT.bySchool && GP_TALENT.bySchool[build.school]) return GP_TALENT.bySchool[build.school];
  if (GP_TALENT.exclude && GP_TALENT.exclude[build.school]) return [];
  return (build.cat && build.cat.indexOf('会心') > -1) ? GP_TALENT.template : [];
}

/* ================= 面板 (对照 computePanel; 状态显式传入) ================= */
// lib: 装备数组; loadout: {位置: id}; state: {targetIdx, baseValues, xinfa, extras(raw), sim}
export function gpComputePanel(lib, loadout, state) {
  const gearMap = {};
  (lib || []).forEach((g) => { if (g && g.id != null) gearMap[g.id] = g; });
  return gpComputePanelMap(gearMap, loadout, state);
}
export function gpComputePanelMap(gearMap, loadout, state) {
  const sim = state.sim || {};
  const build = gpBuild(state.targetIdx || 0);
  const extras = gpExtrasFrom(state.extras);
  const { base } = gpGetBase(state.baseValues, state.xinfa);
  const counts = {}, sums = {}, classCounts = {}, equipped = [], invalidLines = [], dingyin = [], dingyinTotals = {};
  GP_SLOTS.forEach((s) => {
    const g = loadout && loadout[s] ? gearMap[loadout[s]] : null;
    if (!g) return;
    equipped.push(g);
    (g.lines || []).forEach((l) => {
      const v = gpEffLineVal(g, l, sim);
      if (v == null || !isFinite(v) || v < 0) return;
      if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) { invalidLines.push({ gearId: g.id, key: l.key, val: l.val }); return; }
      counts[l.key] = (counts[l.key] || 0) + 1;
      const cc = gpEffectiveClassOf(l.key, build);
      classCounts[cc] = (classCounts[cc] || 0) + 1;
      sums[l.key] = (sums[l.key] || 0) + v;
    });
    const dy = gpSanitizeDingyin(g.dingyin, g.slot);
    if (dy) { let dv = gpEffDingyinVal(g, sim); if (dv == null) dv = dy.val; dingyin.push({ gearId: g.id, slot: s, name: dy.name, val: dv }); dingyinTotals[dy.name] = (dingyinTotals[dy.name] || 0) + dv; }
  });
  let shuDaEligible = 0, shuXiaoEligible = 0;
  const otherShuMap = {};
  let shuSysDa = 0, shuSysXiao = 0, shuWxDa = 0, shuWxXiao = 0;
  Object.keys(sums).forEach((k) => {
    if (!gpIsShuKey(k)) return;
    if (shuSystemOfKey(k) === '无相' || shuSystemOfKey(k) === gpBuildSystem(build)) {
      if (shuSizeOfKey(k) === 'da') shuDaEligible += sums[k]; else shuXiaoEligible += sums[k];
      if (shuSystemOfKey(k) === '无相') { if (shuSizeOfKey(k) === 'da') shuWxDa += sums[k]; else shuWxXiao += sums[k]; }
      else { if (shuSizeOfKey(k) === 'da') shuSysDa += sums[k]; else shuSysXiao += sums[k]; }
    } else otherShuMap[k] = { key: k, label: GP_AFFIX_BY_KEY[k].label, val: sums[k], count: counts[k] || 0 };
  });
  const otherShu = Object.keys(otherShuMap).map((k) => otherShuMap[k]);
  const res = extras.res;
  shuWxDa += (base.wxDa || 0); shuWxXiao += (base.wxXiao || 0);
  const jin = (sums.jin || 0) + base.jin, mn = (sums.min || 0) + base.min, shi = (sums.shi || 0) + base.shi, ti = (sums.ti || 0) + base.ti, yu = (sums.yu || 0) + base.yu;
  let talentCrit = 0, talentXiaowai = 0, talentInt = 0, talentDawai = 0, talentIntStat = '', talentDawaiStat = '';
  const tTotals = { ti, jin, yu, min: mn, shi };
  const tStatName = { ti: '体', jin: '劲', yu: '御', min: '敏', shi: '势', maxTiJin: '体/劲较大值' };
  gpTalentNodesFor(build).forEach((t) => {
    const tTot = (t.stat === 'maxTiJin') ? Math.max(tTotals.ti, tTotals.jin) : (tTotals[t.stat] || 0);
    const tAdd = t.val * Math.min(tTot / (t.need || 1), 1);
    if (t.apply === 'crit') talentCrit += tAdd;
    else if (t.apply === 'xiaowai') talentXiaowai += tAdd;
    else if (t.apply === 'int') { talentInt += tAdd; talentIntStat = tStatName[t.stat] || t.stat; }
    else if (t.apply === 'dawai') { talentDawai += tAdd; talentDawaiStat = tStatName[t.stat] || t.stat; }
  });
  let talentShuXiao = 0, talentShuDa = 0;
  if (build && build.school && build.school.indexOf('破竹') === 0) { talentShuXiao = 212; talentShuDa = 424; }
  const whiteAcc = (sums.jingzhun || 0) + base.acc + (extras.acc || 0) + (extras.bowAcc || 0);
  const whiteCrit = (sums.huixin || 0) + mn * 0.076 + base.crit + (extras.crit || 0) + (extras.bowCrit || 0);
  const whiteInt = (sums.huiyi || 0) + shi * 0.038 + base.int + (extras.int || 0) + talentInt + (extras.bowInt || 0);
  const yCritV = Math.max(0, Math.min(80, whiteCrit / res));
  return {
    counts, sums, classCounts,
    equippedIds: equipped.map((g) => g.id),
    base,
    whiteAcc, whiteCrit, whiteInt, talentCrit, talentXiaowai, talentInt, talentDawai, talentIntStat, talentDawaiStat, talentShuXiao, talentShuDa,
    yAcc: Math.max(0, Math.min(100, 65 + (whiteAcc - 65) / res)),
    yCrit: yCritV,
    finalCrit: yCritV + (base.dcrit || 0) + talentCrit,
    yInt: Math.max(0, Math.min(40, whiteInt / res)),
    dawai: base.dawai + (base.wkDa || 0) + (sums.dawai || 0) + jin * 1.36 + shi * 0.9 + talentDawai,
    xiaowai: base.xiaowai + (base.wkXiao || 0) + (sums.xiaowai || 0) + jin * 0.225 + mn * 0.9 + talentXiaowai,
    dashu: base.shuDa + (base.wkShuDa || 0) + shuDaEligible + talentShuDa,
    xiaoshu: base.shuXiao + (base.wkShuXiao || 0) + shuXiaoEligible + talentShuXiao,
    shuDaEligible, shuXiaoEligible, otherShu, shuSysDa, shuSysXiao, shuWxDa, shuWxXiao,
    dingyin, dingyinTotals,
    invalidLines,
    ti, jin, yu, min: mn, shi,
    hp: base.hp + (base.wkHp || 0) + ti * 60 + yu * 17, def: yu * 0.5,
    _equipped: equipped,
  };
}
function classCount(panel, t) {
  if (t.flex) { let s = 0; t.flex.forEach((k) => { s += (panel.classCounts[k] || 0); }); return s; }
  return panel.classCounts[t.cls] || 0;
}
export function gpDingyinScore(panel, build) {
  const bySlot = {};
  (panel.dingyin || []).forEach((d) => { bySlot[d.slot] = d; });
  let total = 0; const rows = [];
  GP_SLOTS.forEach((slot) => {
    const d = bySlot[slot] || null;
    const correct = d ? gpDingyinTypeCorrect(d.name, slot, build) : false;
    const mx = d ? gpDingyinMax(d.name, slot) : null;
    const score = (d && correct && mx) ? Math.min(1, Math.max(0, d.val) / mx) : 0;
    total += score;
    rows.push({ slot, name: d ? d.name : '', val: d ? d.val : null, max: mx, correct, score, has: !!d });
  });
  return { score: total / 8, rows };
}
/* 毕业度 (原站口径): 条数 40 + 数值 24 + 定音 20, 合计 84 折算; 关定音 /64 */
export function gpGraduation(panel, build, gradDingyinOn, sim) {
  const rows = []; let sumMatch = 0;
  build.targets.forEach((t) => {
    const cur = classCount(panel, t);
    const m = t.n ? Math.min(1, cur / t.n) : 1;
    sumMatch += m;
    rows.push({ cls: t.cls, label: t.label, n: t.n, cur, flex: !!t.flex });
  });
  const A = build.targets.length ? sumMatch / build.targets.length : 0;
  let lineTotal = 0, lineSum = 0; const lowLines = [];
  (panel._equipped || []).forEach((g) => {
    (g.lines || []).forEach((l) => {
      if (gpLineQualityPct(l) == null) return;
      if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) return;
      lineTotal++;
      const sc = gpEffLineScore(g, l, sim || {});
      lineSum += sc;
      if (sc < 1) lowLines.push({ gearId: g.id, key: l.key, val: l.val, score: sc });
    });
  });
  const B = lineTotal ? lineSum / lineTotal : 0;
  const dy = gpDingyinScore(panel, build);
  let got = 0, totalBars = 0;
  rows.forEach((r) => { totalBars += r.n; got += Math.min(r.cur, r.n); });
  const total = gradDingyinOn ? (0.4 * A + 0.24 * B + 0.2 * dy.score) / 0.84 : (0.4 * A + 0.24 * B) / 0.64;
  return { total, A, B, D: dy.score, dingyinRows: dy.rows, rows, got, totalBars, lowLines };
}
function maxedGearClone(g, tempId) {
  const lines = (g.lines || []).map((l) => { const a = GP_AFFIX_BY_KEY[l.key]; return a ? { key: l.key, val: a.max } : null; }).filter(Boolean);
  let dy = gpSanitizeDingyin(g.dingyin, g.slot);
  if (dy) { const mx = gpDingyinMax(dy.name, g.slot); if (mx != null) dy = { name: dy.name, val: mx }; }
  return { id: tempId, slot: g.slot, name: g.name || '', lines, dingyin: dy, schools: g.schools || [], warnings: [] };
}
export function gpLoanGraduation(lib, loadout, state) {
  const build = gpBuild(state.targetIdx || 0);
  const gearMap = {};
  (lib || []).forEach((g) => { if (g && g.id != null) gearMap[g.id] = g; });
  const lo = {}, map = {};
  GP_SLOTS.forEach((slot, i) => {
    const id = loadout ? loadout[slot] : null; if (!id) return;
    const g = gearMap[id]; if (!g) return;
    const clone = maxedGearClone(g, -1001 - i);
    map[clone.id] = clone; lo[slot] = clone.id;
  });
  const st = { ...state, sim: {} };
  const panel = gpComputePanelMap(map, lo, st);
  return gpGraduation(panel, build, state.gradDingyinOn !== false, {});
}

/* ================= 档位 / 一键最优 / 建议 ================= */
const TIER_RATE = { jingzhun: 1, huixin: 1, huiyi: 1 };
const TIER_DIVINE = { shouling: 1, quanwu: 1, wuqizeng: 1, wanjia: 1, quanqi: 1 };
const FIVE_DIM_CLS = ['ti', 'jin', 'yu', 'min', 'shi'];
export function gpBuildTiers(build) {
  const atkN = { dawai: 0, xiaowai: 0 }, dimN = {}; let dimMax = 0;
  build.targets.forEach((t) => {
    if (t.flex) return;
    if (t.cls === 'dawai' || t.cls === 'xiaowai') atkN[t.cls] += t.n;
    if (FIVE_DIM_CLS.indexOf(t.cls) > -1) { dimN[t.cls] = (dimN[t.cls] || 0) + t.n; if (dimN[t.cls] > dimMax) dimMax = dimN[t.cls]; }
  });
  let mainAtk;
  if (build.cat && build.cat.indexOf('小外') === 0) mainAtk = 'xiaowai';
  else if (build.cat && build.cat.indexOf('大外') === 0) mainAtk = 'dawai';
  else mainAtk = atkN.xiaowai > atkN.dawai ? 'xiaowai' : 'dawai';
  const tierOf = {};
  tierOf[mainAtk] = 1;
  FIVE_DIM_CLS.forEach((c) => { if (dimMax > 0 && dimN[c] === dimMax) tierOf[c] = 1; });
  Object.keys(TIER_RATE).forEach((c) => { tierOf[c] = 2; });
  Object.keys(TIER_DIVINE).forEach((c) => { tierOf[c] = 3; });
  tierOf.shugong = 4;
  tierOf.shu_ls_da = 4;
  if (build.school === '牵丝-霖（火拳）') tierOf.quanqi = 0;
  return tierOf;
}
export function gpTierVectorOf(panel, build, tierOf) {
  const v = [0, 0, 0, 0, 0];
  const cc = {};
  Object.keys(panel.classCounts).forEach((c) => { cc[c] = panel.classCounts[c] || 0; });
  build.targets.forEach((t) => {
    if (t.flex) {
      let avail = 0; t.flex.forEach((c) => { avail += cc[c] || 0; });
      let take = Math.min(avail, t.n);
      const order = t.flex.slice().sort((a, b) => (tierOf[a] == null ? 9 : tierOf[a]) - (tierOf[b] == null ? 9 : tierOf[b]));
      order.forEach((c) => { if (take <= 0) return; const use = Math.min(cc[c] || 0, take); if (use > 0) { const tr = tierOf[c]; if (tr != null) v[tr] += use; cc[c] -= use; take -= use; } });
    } else {
      const take2 = Math.min(cc[t.cls] || 0, t.n);
      if (take2 > 0) { const tr2 = tierOf[t.cls]; if (tr2 != null) v[tr2] += take2; cc[t.cls] -= take2; }
    }
  });
  return v;
}
function tierVecCmp(a, b) { for (let i = 0; i < 5; i++) { if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1; } return 0; }

export function gpAutoCombine(lib, targetIdx) {
  const build = gpBuild(targetIdx || 0);
  const tierOf = gpBuildTiers(build);
  const need = {}, flexGroups = [];
  build.targets.forEach((t) => {
    if (t.flex) flexGroups.push({ keys: t.flex.slice(), remaining: t.n });
    else need[t.cls] = (need[t.cls] || 0) + t.n;
  });
  function candidateKey(g) {
    const cc = {};
    (g.lines || []).forEach((l) => { if (gpLineQualityPct(l) == null) return; if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) return; const c = gpEffectiveClassOf(l.key, build); cc[c] = (cc[c] || 0) + 1; });
    const counted = {}, hits = [0, 0, 0, 0, 0];
    Object.keys(cc).forEach((c) => { if (need[c] != null) { const take = Math.min(cc[c], Math.max(0, need[c])); if (take > 0) { counted[c] = take; const t = tierOf[c]; if (t != null) hits[t] += take; } } });
    flexGroups.forEach((fg) => {
      const pool = {};
      fg.keys.forEach((c) => { pool[c] = Math.max(0, (cc[c] || 0) - (counted[c] || 0)); });
      let avail = 0;
      fg.keys.forEach((c) => { avail += pool[c]; });
      let take = Math.min(avail, Math.max(0, fg.remaining));
      const order = fg.keys.slice().sort((a, b) => (tierOf[a] == null ? 9 : tierOf[a]) - (tierOf[b] == null ? 9 : tierOf[b]));
      order.forEach((c) => { if (take <= 0) return; const use = Math.min(pool[c] || 0, take); if (use > 0) { counted[c] = (counted[c] || 0) + use; const t = tierOf[c]; if (t != null) hits[t] += use; take -= use; } });
    });
    let valueSum = 0, topVal = 0;
    (g.lines || []).forEach((l) => { if (gpLineQualityPct(l) == null) return; if (gpIsWuxiangKey(l.key) && !gpIsWeaponSlot(g.slot)) return; const sc = gpLineValueScore(l); valueSum += sc; if (tierOf.quanqi === 0 && gpEffectiveClassOf(l.key, build) === 'quanqi') topVal += sc; });
    let dyPart = 0;
    if (g.dingyin && gpDingyinTypeCorrect(g.dingyin.name, g.slot, build)) {
      const dmx = gpDingyinMax(g.dingyin.name, g.slot);
      const dv = (typeof g.dingyin.val === 'number') ? g.dingyin.val : gpParseVal(g.dingyin.val);
      if (dmx && dv != null && isFinite(dv)) dyPart = Math.min(1, Math.max(0, dv) / dmx);
    }
    return [hits[0], topVal, hits[1], hits[2], hits[3], hits[4], valueSum, dyPart];
  }
  function keyGreater(a, b) {
    if (a[0] !== b[0]) return a[0] > b[0];
    if (Math.abs(a[1] - b[1]) > 1e-9) return a[1] > b[1];
    for (let i = 2; i < 6; i++) { if (a[i] !== b[i]) return a[i] > b[i]; }
    if (Math.abs(a[6] - b[6]) > 1e-9) return a[6] > b[6];
    return a[7] > b[7] + 1e-9;
  }
  function consume(g) {
    const cc = {};
    (g.lines || []).forEach((l) => { if (gpLineQualityPct(l) == null) return; const c = gpEffectiveClassOf(l.key, build); cc[c] = (cc[c] || 0) + 1; });
    Object.keys(cc).forEach((c) => { if (need[c] != null) { const take = Math.min(cc[c], Math.max(0, need[c])); need[c] -= take; cc[c] -= take; } });
    flexGroups.forEach((fg) => {
      let avail = 0; fg.keys.forEach((c) => { avail += cc[c] || 0; });
      const take = Math.min(avail, Math.max(0, fg.remaining));
      fg.remaining -= take;
    });
  }
  const used = {}, next = {}; let fallbackUsed = false;
  GP_SLOTS.forEach((s) => {
    const cands = (lib || []).filter((g) => gpGearSlotOf(g.slot) === gpGearSlotOf(s) && !used[g.id] && gpWeaponUsableForBuild(g, build));
    let best = null, bestKey = null, bestFallback = null, bestFallbackQ = -1;
    cands.forEach((g) => {
      const key = candidateKey(g);
      if (!best || keyGreater(key, bestKey)) { bestKey = key; best = g; }
      const q = gpGearQuality(g);
      if (q > bestFallbackQ || (q === bestFallbackQ && bestFallback && g.lines.length > bestFallback.lines.length)) { bestFallbackQ = q; bestFallback = g; }
    });
    const bestHits = bestKey ? bestKey[0] + bestKey[2] + bestKey[3] + bestKey[4] + bestKey[5] : 0;
    const chosen = (best && bestHits > 0) ? best : bestFallback;
    if (chosen) { if (chosen === bestFallback && !(best && bestHits > 0)) fallbackUsed = true; next[s] = chosen.id; used[chosen.id] = true; consume(chosen); }
  });
  return { loadout: next, fallbackUsed };
}

const SUGGEST_MAX_EVALS = 20000;
function washTargetKey(line, slot, cls, build) {
  if (cls !== 'shugong') return GP_AFFIX_BY_KEY[cls] ? cls : null;
  if (gpIsWuxiangKey(line.key) && gpIsWeaponSlot(slot)) return line.key;
  const sys = gpBuildSystem(build); if (!sys) return null;
  const size = gpIsShuKey(line.key) ? shuSizeOfKey(line.key) : 'da';
  let found = null;
  GP_AFFIX.forEach((a) => { if (a.sys === sys && a.size === size) found = a.key; });
  return found;
}
export function gpComputeSuggestions(lib, loadout, state) {
  const build = gpBuild(state.targetIdx || 0);
  const st0 = { ...state, sim: {} };
  const gearMap = {};
  (lib || []).forEach((g) => { if (g && g.id != null) gearMap[g.id] = g; });
  const lo = {}, map = {}; let equippedCount = 0;
  GP_SLOTS.forEach((s) => { const id = loadout ? loadout[s] : null; if (!id) return; const g = gearMap[id]; if (!g) return; lo[s] = id; map[id] = g; equippedCount++; });
  let evals = 0;
  const tierOf = gpBuildTiers(build);
  function evalState(lo2, map2) { evals++; const p = gpComputePanelMap(map2, lo2, st0); return { total: gpGraduation(p, build, state.gradDingyinOn !== false, {}).total, vec: gpTierVectorOf(p, build, tierOf), panel: p }; }
  function copyState(loS, mapS) { const l2 = {}, m2 = {}; GP_SLOTS.forEach((s) => { if (loS[s]) { l2[s] = loS[s]; m2[loS[s]] = mapS[loS[s]]; } }); return [l2, m2]; }
  const curEv = evalState(lo, map);
  let cur = curEv.total; const start = cur; let curVec = curEv.vec;
  const list = [];
  if (!equippedCount) return { list, cur, final: cur };
  let curLo = lo, curMap = map;
  for (let step = 0; step < 5; step++) {
    if (evals > SUGGEST_MAX_EVALS) break;
    const panel = gpComputePanelMap(curMap, curLo, st0);
    const gapCls = [], inGap = {};
    build.targets.forEach((t) => {
      if (t.n - classCount(panel, t) <= 0) return;
      (t.flex ? t.flex : [t.cls]).forEach((c) => { if (!inGap[c]) { inGap[c] = true; gapCls.push(c); } });
    });
    let best = null;
    function consider(cand) {
      const cmp = tierVecCmp(cand.vec, curVec);
      if (cmp > 0) { if (!(cand.gain > 1e-9)) return; }
      else if (cmp === 0) { if (!(cand.gain > 0.0005)) return; }
      else return;
      if (!best) { best = cand; return; }
      const vc = tierVecCmp(cand.vec, best.vec);
      if (vc > 0 || (vc === 0 && cand.gain > best.gain)) best = cand;
    }
    GP_SLOTS.forEach((slot) => {
      (lib || []).forEach((g) => {
        if (evals > SUGGEST_MAX_EVALS) return;
        if (gpGearSlotOf(g.slot) !== gpGearSlotOf(slot) || curLo[slot] === g.id) return;
        let used = false; GP_SLOTS.forEach((s2) => { if (curLo[s2] === g.id) used = true; });
        if (used) return;
        const st = copyState(curLo, curMap); st[0][slot] = g.id; st[1][g.id] = g;
        const ev = evalState(st[0], st[1]);
        consider({ kind: 'swap', slot, gearId: g.id, name: g.name || '', gain: ev.total - cur, score: ev.total, vec: ev.vec, lo: st[0], map: st[1] });
      });
    });
    GP_SLOTS.forEach((slot) => {
      const id = curLo[slot]; if (!id) return;
      const g = curMap[id]; if (!g || !g.lines) return;
      g.lines.forEach((line, li) => {
        if (evals > SUGGEST_MAX_EVALS) return;
        if (!line || !line.key || !GP_AFFIX_BY_KEY[line.key]) return;
        const fromCls = gpEffectiveClassOf(line.key, build);
        gapCls.forEach((tc) => {
          if (tc === fromCls) return;
          let sameGroup = false;
          build.targets.forEach((t) => { if (t.flex && t.flex.indexOf(tc) > -1 && t.flex.indexOf(fromCls) > -1) sameGroup = true; });
          if (sameGroup) return;
          const nk = washTargetKey(line, slot, tc, build); if (!nk) return;
          const a = GP_AFFIX_BY_KEY[nk]; if (!a) return;
          const clone = { id: 'sug' + step + '_' + slot + '_' + li, slot: g.slot, name: g.name || '', lines: g.lines.map((l2, i2) => i2 === li ? { key: nk, val: a.cy } : { key: l2.key, val: l2.val }), dingyin: g.dingyin ? { name: g.dingyin.name, val: g.dingyin.val } : null, schools: g.schools || [], warnings: [], _srcId: (g._srcId || g.id) };
          const st = copyState(curLo, curMap); st[0][slot] = clone.id; st[1][clone.id] = clone;
          const ev = evalState(st[0], st[1]);
          consider({ kind: 'wash', slot, gearId: clone._srcId, lineIdx: li, fromCls, toCls: tc, toKey: nk, gain: ev.total - cur, score: ev.total, vec: ev.vec, lo: st[0], map: st[1] });
        });
      });
    });
    if (!best) break;
    list.push(best);
    curLo = best.lo; curMap = best.map; cur = best.score; curVec = best.vec;
  }
  return {
    list: list.map((s) => {
      const o = { kind: s.kind, slot: s.slot, gearId: typeof s.gearId === 'number' ? s.gearId : null, gain: s.gain, score: s.score };
      if (s.kind === 'swap') o.name = s.name || '';
      if (s.kind === 'wash') { o.lineIdx = s.lineIdx; o.fromCls = s.fromCls; o.toCls = s.toCls; o.toKey = s.toKey; }
      return o;
    }),
    cur: start, final: cur,
  };
}

/* ================= 三率速算 (对照 rateStatus, 返回结构化数据) ================= */
export function gpRateStatus(white, cap, base, res, perBarVal) {
  const yellow = Math.max(0, Math.min(cap, base + (white - base) / res));
  const needWhite = base + (cap - base) * res;
  if (yellow >= cap - 0.001) {
    return { yellow, capped: true, over: white - needWhite, lack: 0, needWhite, bars: 0 };
  }
  const lack = needWhite - white;
  const bars = Math.ceil(lack / perBarVal - 1e-9);
  return { yellow, capped: false, over: 0, lack, needWhite, bars };
}
export function gpQuickCalc(whiteAcc, whiteCrit, whiteInt, resIn) {
  const res = Math.max(0.5, (typeof resIn === 'number' && isFinite(resIn) && resIn) ? resIn : 1.85);
  return {
    res,
    acc: gpRateStatus(whiteAcc || 0, 100, 65, res, 8.8),
    crit: gpRateStatus(whiteCrit || 0, 80, 0, res, 9.8),
    int: gpRateStatus(whiteInt || 0, 40, 0, res, 4.9),
  };
}

/* ================= 计划总装 (对照 renderPanel 的数据部分) ================= */
function stripPanel(p) {
  if (!p) return null;
  const { _equipped, ...rest } = p;
  return rest;
}
export function gpPlan(lib, loadout, state) {
  const build = gpBuild(state.targetIdx || 0);
  const dyOn = state.gradDingyinOn !== false;
  const sim = state.sim || {};
  const panel = gpComputePanel(lib, loadout, state);
  const grad = gpGraduation(panel, build, dyOn, sim);
  const realState = { ...state, sim: {} };
  const realPanel = gpComputePanel(lib, loadout, realState);
  const realGrad = gpGraduation(realPanel, build, dyOn, {});
  const loanGrad = gpLoanGraduation(lib, loadout, state);
  const suggestions = gpComputeSuggestions(lib, loadout, state);
  // 差缺: 配方外类别 (classCounts 中不在 targets 的)
  const wantedCls = {};
  build.targets.forEach((t) => { (t.flex ? t.flex : [t.cls]).forEach((c) => { wantedCls[c] = true; }); });
  const extraClasses = Object.keys(panel.classCounts).filter((c) => !wantedCls[c]).map((c) => ({ cls: c, label: GP_CLASS_LABEL[c] || c, count: panel.classCounts[c] }));
  // 单件评估 (全库, 对当前流派)
  const gearEvals = (lib || []).map((g) => ({
    id: g.id,
    score: gpGearScore(g, build),
    quality: gpGearQuality(g),
    hits: gpGearRecipeHits(g, build),
    verdict: gpIsHeirloom(g, build) ? 'heirloom' : (gpIsDud(g, build) ? 'dud' : ''),
  }));
  const { base, xinfa } = gpGetBase(state.baseValues, state.xinfa);
  return {
    panel: stripPanel(panel), grad, realPanel: stripPanel(realPanel), realGrad, loanGrad,
    suggestions, extraClasses, gearEvals,
    baseSummary: { base, xinfaNotes: xinfa.notes, xinfaPicked: xinfa.picked, xinfaDuplicates: xinfa.duplicates },
  };
}

/* ================= 粘贴代码导入 (对照原站解析器) ================= */
export function gpOcrClean(s) {
return String(s == null? '': s)
.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
.replace(/．/g, '.').replace(/，/g, ',').replace(/：/g, ':').replace(/＋/g, '+')
.replace(/(\d)[,，](\d{1,2})(?=%|$|\s)/g, '$1.$2')
.replace(/[\[〕）)]?/g, '');
}
export function gpParseDingyinText(raw) {
const t = gpOcrClean(raw).replace(/\s+/g, '');
if (!t) return null;
const marked = t.indexOf('◆') > -1 || t.indexOf('定音') > -1;
const names = Object.keys(GP_DINGYIN_LEFT);
for (let i = 0; i < names.length; i++) {
const idx = t.indexOf(names[i]);
if (idx > -1 && (marked || idx <= 2)) {
const rest = t.slice(idx + names[i].length);
const m = rest.match(/\d+(?:\.\d+)?/);
if (m) return { name: names[i], val: parseFloat(m[0])};
}
}
const m2 = t.match(/([^0-9+]{2,}?增[伤疗])\+?(\d+(?:\.\d+)?)%?/);
if (m2 && (m2[1].indexOf('·') > -1 || m2[1].indexOf('.') > -1)) {
const nm = m2[1].replace(/^[^\u4e00-\u9fffA-Za-z]+/, '').replace(/:/g, '·').replace(/\./g, '·');
if (gpIsMartialDingyinName(nm)) return { name: nm, val: parseFloat(m2[2])};
}
const m3 = t.match(/([^0-9+]{2,}?技能增[伤疗])[^0-9%]{0,2}?(\d+(?:\.\d+)?)%/);
if (m3) { const nm3 = m3[1].replace(/^[^\u4e00-\u9fffA-Za-z]+/, '').replace(/:/g, '·').replace(/\./g, '·'); if (gpIsMartialDingyinName(nm3)) return { name: nm3, val: parseFloat(m3[2])};}
return null;
}
function normName(s) { return String(s == null? '': s).trim().toLowerCase().replace(/[\s%％+]/g, '');}
const PASTE_NORM_MAP = {};
Object.keys(GP_PASTE_NAME_TO_KEY).forEach((k) => { PASTE_NORM_MAP[normName(k)] = GP_PASTE_NAME_TO_KEY[k];});
export function gpAffixKeyFromName(name) {
if (name == null) return null;
const raw = String(name).trim();
if (GP_PASTE_NAME_TO_KEY[raw]) return GP_PASTE_NAME_TO_KEY[raw];
if (GP_NAME_TO_CLASS[raw]) { const cls = GP_NAME_TO_CLASS[raw]; return cls === 'shugong'? 'shu_wx_da': cls;}
const nk = normName(raw);
if (PASTE_NORM_MAP[nk]) return PASTE_NORM_MAP[nk];
const stripped = nk.replace(/(率|增伤|增效|攻击力|攻击)$/, '');
if (PASTE_NORM_MAP[stripped]) return PASTE_NORM_MAP[stripped];
if (/^artof/.test(nk)) return 'wuqizeng';
if (nk.indexOf('增效') > -1 && nk.indexOf('全武学') === -1) return 'wuqizeng';
return null;
}
export function gpSlotFromValue(v) {
if (v == null) return null;
if (typeof v === 'number') { return (v >= 1 && v <= 8)? gpGearSlotOf(GP_SLOTS[v - 1]): null;}
const s = String(v).trim();
if (GP_SLOT_ALIAS[s]) return GP_SLOT_ALIAS[s];
const nk = s.toLowerCase().replace(/\s+/g, ' ');
if (GP_SLOT_ALIAS[nk]) return GP_SLOT_ALIAS[nk];
const nk2 = nk.replace(/\s+/g, '');
if (GP_SLOT_ALIAS[nk2]) return GP_SLOT_ALIAS[nk2];
const m = s.match(/^[1-8]$/); if (m) return gpGearSlotOf(GP_SLOTS[parseInt(s, 10) - 1]);
return null;
}
function adjustVal(key, v) {
const a = GP_AFFIX_BY_KEY[key];
if (a && a.unit === '%' && v > 0 && v < 1) {
const converted = Math.round(v * 1000) / 10;
if (converted > a.max * 1.5) return v;
return converted;
}
return v;
}
export function gpParseAffixTextSegments(str) {
const norm = gpOcrClean(String(str || '')).toLowerCase().replace(/\s+/g, '');
if (!norm) return [];
const names = Object.keys(GP_PASTE_NAME_TO_KEY).concat(GP_AFFIX.map((a) => a.label)).sort((a, b) => b.length - a.length);
const hits = [];
names.forEach((nm) => {
const nn = nm.toLowerCase().replace(/\s+/g, ''); if (!nn) return;
let start = 0;
while (true) { const idx = norm.indexOf(nn, start); if (idx === -1) break; hits.push({ idx, len: nn.length, name: nm}); start = idx + nn.length;}
});
hits.sort((a, b) => a.idx - b.idx || b.len - a.len);
const chosen = [];
hits.forEach((h) => { const last = chosen[chosen.length - 1]; if (last && h.idx < last.idx + last.len) return; chosen.push(h);});
const out = [];
chosen.forEach((h, i) => {
const segEnd = (i + 1 < chosen.length)? chosen[i + 1].idx: norm.length;
const seg = norm.slice(h.idx + h.len, segEnd);
const m = seg.match(/\d+(?:[.,]\d+)?/);
if (!m) return;
const key = gpAffixKeyFromName(h.name); if (!key) return;
const v = gpParseVal(m[0]); if (v == null || v < 0) return;
out.push({ key, val: adjustVal(key, v)});
});
return out;
}
export function gpExtractLines(node, stat) {
const lines = [];
function pushLine(name, val) {
const key = gpAffixKeyFromName(name);
const v = gpParseVal(val);
if (!key || v == null) { stat.unknown++; return;}
lines.push({ key, val: adjustVal(key, v)});
}
function fromString(str) {
const segs = gpParseAffixTextSegments(str);
if (!segs.length) { stat.unknown++; return;}
segs.forEach((sg) => { lines.push(sg);});
}
function fromEntry(e) {
if (e == null) return;
if (typeof e === 'string') { fromString(e); return;}
if (Array.isArray(e)) {
if (e.length >= 2 && (typeof e[0] === 'string' || typeof e[0] === 'number')) pushLine(e[0], e[1]);
else e.forEach(fromEntry);
return;
}
if (typeof e === 'object') {
const name = e.name!= null? e.name: (e.attr!= null? e.attr: (e.label!= null? e.label: (e.stat!= null? e.stat: (e.type!= null? e.type: (e.key!= null? e.key: (e['词条']!= null? e['词条']: (e['属性']!= null? e['属性']: null)))))));
const val = e.value!= null? e.value: (e.val!= null? e.val: (e.num!= null? e.num: (e['数值']!= null? e['数值']: (e.amount!= null? e.amount: null))));
if (name!= null && val!= null) { pushLine(name, val); return;}
const keys = Object.keys(e); let hit = 0;
keys.forEach((k) => { if (gpAffixKeyFromName(k)) { pushLine(k, e[k]); hit++;}});
if (!hit) stat.unknown++;
}
}
if (Array.isArray(node)) node.forEach(fromEntry);
else if (node && typeof node === 'object') {
const keys = Object.keys(node); let hit = 0;
keys.forEach((k) => { if (gpAffixKeyFromName(k)) { pushLine(k, node[k]); hit++;}});
if (!hit) stat.unknown++;
} else if (typeof node === 'string') fromString(node);
return lines;
}
const AFFIX_HOLDER_KEYS = ['affixes', 'affix', 'stats', 'attrs', 'attributes', 'lines', 'properties', 'substats', 'sub_stats', '词条', '属性列表', 'entries', 'modifiers'];
export function gpExtractGearsFromJson(root) {
const gears = [], stat = { unknown: 0};
function affixNodeOf(obj) {
for (let i = 0; i < AFFIX_HOLDER_KEYS.length; i++) {
const k = AFFIX_HOLDER_KEYS[i];
if (obj[k]!= null && (Array.isArray(obj[k]) || typeof obj[k] === 'object')) return obj[k];
}
const selfMap = {}; let has = false;
Object.keys(obj).forEach((k) => { if (gpAffixKeyFromName(k)) { selfMap[k] = obj[k]; has = true;}});
return has? selfMap: null;
}
function slotOf(obj) {
const fields = ['slot', 'position', 'part', 'equipslot', 'equip_slot', 'equiptype', 'equip_type', '部位', 'type', 'category'];
for (let i = 0; i < fields.length; i++) { const s = gpSlotFromValue(obj[fields[i]]); if (s) return s;}
return null;
}
function nameOf(obj) {
const fields = ['name', 'title', '装备名', '名称'];
for (let i = 0; i < fields.length; i++) { if (typeof obj[fields[i]] === 'string' && obj[fields[i]]) return obj[fields[i]];}
return '';
}
function visit(node, ctxSlot, depth) {
if (node == null || depth > 9) return;
if (Array.isArray(node)) { node.forEach((x) => { visit(x, ctxSlot, depth + 1);}); return;}
if (typeof node!== 'object') return;
const slot = slotOf(node) || ctxSlot;
const an = affixNodeOf(node);
if (slot && an) {
const st = { unknown: 0};
const lines = gpExtractLines(an, st);
stat.unknown += st.unknown;
if (lines.length) {
const dyRaw = node.dingyin || node['定音'] || null;
let dy = null;
if (typeof dyRaw === 'string') dy = gpParseDingyinText(dyRaw);
else if (dyRaw && typeof dyRaw === 'object') dy = gpSanitizeDingyin({ name: dyRaw.name || dyRaw.type, val: dyRaw.val!= null? dyRaw.val: dyRaw.value}, slot);
gears.push({ slot, name: nameOf(node), lines: lines.slice(0, 8), dingyin: dy});
}
return;
}
Object.keys(node).forEach((k) => {
const keySlot = gpSlotFromValue(k);
visit(node[k], keySlot || slot, depth + 1);
});
}
visit(root, null, 0);
return { gears, unknown: stat.unknown};
}
export function gpDecodePasteCode(raw) {
const s = String(raw || '').trim();
if (!s) return null;
function tryJson(t) { try { return JSON.parse(t);} catch (e) { return undefined;}}
let r = tryJson(s); if (r!== undefined) return { data: r, mode: 'JSON'};
const m = s.match(/[\[{][\s\S]*[\]}]/);
if (m) { r = tryJson(m[0]); if (r!== undefined) return { data: r, mode: 'JSON'};}
let b64 = s.replace(/\s+/g, '');
for (let round = 0; round < 3; round++) {
if (!/^[A-Za-z0-9+/=_-]+$/.test(b64) || b64.length < 8) break;
try {
let t = b64.replace(/-/g, '+').replace(/_/g, '/');
while (t.length % 4) t += '=';
const bin = atob(t);
const bytes = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
const txt = new TextDecoder('utf-8').decode(bytes);
r = tryJson(txt); if (r!== undefined) return { data: r, mode: 'Base64'};
if (/^[A-Za-z0-9+/=_-]+$/.test(txt.replace(/\s+/g, ''))) { b64 = txt.replace(/\s+/g, ''); continue;}
const m2 = txt.match(/[\[{][\s\S]*[\]}]/);
if (m2) { r = tryJson(m2[0]); if (r!== undefined) return { data: r, mode: 'Base64'};}
if (txt.indexOf('\uFFFD') > -1 || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(txt)) break;
return { text: txt, mode: 'Base64 文本'};
} catch (e) { break;}
}
return { text: s, mode: '文本'};
}
// 顶层入口 (对照 btnPasteImport 处理): 返回 {mode, gears, unknown} 或 {fullExport: data}
export function gpParsePaste(raw) {
const dec = gpDecodePasteCode(raw);
if (!dec) return { mode: '', gears: [], unknown: 0};
if (dec.data && dec.data.app === 'gear-planner-100' && Array.isArray(dec.data.lib)) {
return { mode: dec.mode, fullExport: dec.data, gears: [], unknown: 0};
}
let found = null;
if (dec.data) found = gpExtractGearsFromJson(dec.data);
if ((!found ||!found.gears.length) && dec.text) {
const tg = { gears: [], unknown: 0};
let cur = null;
dec.text.split(/\r?\n/).forEach((line) => {
const s = line.trim(); if (!s) return;
let slotHit = gpSlotFromValue(s);
if (!slotHit && s.length <= 16) { GP_SLOTS.forEach((sl) => { if (s.indexOf(sl) > -1) slotHit = sl;});}
if (slotHit) slotHit = gpGearSlotOf(slotHit);
if (slotHit) { cur = null; tg.gears.forEach((g) => { if (g.slot === slotHit) cur = g;}); if (!cur) { cur = { slot: slotHit, name: '', lines: []}; tg.gears.push(cur);} return;}
if (cur) { const st = { unknown: 0}; const ls = gpExtractLines([s], st); cur.lines = cur.lines.concat(ls); tg.unknown += st.unknown;}
});
found = { gears: tg.gears.filter((g) => g.lines.length), unknown: tg.unknown};
}
if (!found) return { mode: dec.mode, gears: [], unknown: 0};
return { mode: dec.mode, gears: found.gears, unknown: found.unknown};
}

// OCR 专用别名 (原站 OCR_EXTRA_ALIAS, 供前端 OCR 候选名表; 后端解析器不用)
export const GP_OCR_EXTRA_ALIAS = {"最大外功攻击":"dawai","最小外功攻击":"xiaowai","最大外功":"dawai","最小外功":"xiaowai","max physical atk":"dawai","min physical atk":"xiaowai","physical atk":"dawai","最大属攻":"shu_wx_da","最小属攻":"shu_wx_xiao","最大屬攻":"shu_wx_da","最小屬攻":"shu_wx_xiao","最大无相攻击":"shu_wx_da","最小无相攻击":"shu_wx_xiao","最大無相攻擊":"shu_wx_da","最小無相攻擊":"shu_wx_xiao","最大鸣金攻击":"shu_mj_da","最小鸣金攻击":"shu_mj_xiao","最大裂石攻击":"shu_ls_da","最小裂石攻击":"shu_ls_xiao","最大破竹攻击":"shu_pz_da","最小破竹攻击":"shu_pz_xiao","最大牵丝攻击":"shu_qs_da","最小牵丝攻击":"shu_qs_xiao","會心率":"huixin","會意率":"huiyi","精準率":"jingzhun","體":"ti","勁":"jin","禦":"yu","敏":"min","勢":"shi","对首领增伤":"shouling","对首领单位增伤":"shouling","首领伤害":"shouling","全武学增伤":"quanwu","全武学增效":"quanwu","武器增伤":"wuqizeng","武器增效":"wuqizeng","手甲武学增伤":"wuqizeng"};
export const GP_BUILD_SECT = ["鸣金·虹","鸣金·影","牵丝·玉","牵丝·玉","牵丝·霖","牵丝·霖","牵丝·霖","牵丝·翊","裂石·威","裂石·钧","裂石·钧","破竹·鸢","破竹·樽","破竹·尘","破竹·风","牵丝·霖","牵丝·翊","裂石·钧","裂石·钧","破竹·鸢","破竹·樽","破竹·尘","破竹·风","牵丝·霖","裂石·威"];
export const GP_DEMO_KIT = [{"slot":"武器","name":"示例 · 玉斗长剑","keys":["dawai","dawai","jin","huiyi","wuqizeng"],"dingyin":{"name":"外功穿透","val":12.6}},{"slot":"武器","name":"示例 · 玉斗副剑","keys":["dawai","dawai","jin","huiyi","shi"],"dingyin":{"name":"外功穿透","val":11.4}},{"slot":"冠胄","name":"示例 · 玉斗冠胄","keys":["huiyi","dawai","jin","shi","huiyi"],"dingyin":{"name":"无名剑法·蓄力技增伤","val":5.6}},{"slot":"胸甲","name":"示例 · 玉斗胸甲","keys":["huiyi","dawai","jin","shi","huiyi"],"dingyin":{"name":"无名剑法·蓄力技增伤","val":4.2}},{"slot":"环","name":"示例 · 玉斗环","keys":["dawai","dawai","shi","jin","quanwu"],"dingyin":{"name":"外功穿透","val":10.8}},{"slot":"佩","name":"示例 · 玉斗佩","keys":["dawai","dawai","shi","jin","quanwu"],"dingyin":{"name":"外功穿透","val":12.1}},{"slot":"胫甲","name":"示例 · 玉斗胫甲","keys":["jin","dawai","shi","jin","shouling"],"dingyin":{"name":"无名剑法·蓄力技增伤","val":5.1}},{"slot":"腕甲","name":"示例 · 玉斗腕甲","keys":["jin","dawai","shi","jin","shouling"],"dingyin":{"name":"无名剑法·蓄力技增伤","val":4.7}}];
