-- 本地验收夹具 (仅灌本地 D1: wrangler d1 execute yanyun-signup --local --file 本文件)。
-- 百业 mobiletest (绑定 Discord 服务器 555666777) + 夹具用户 111222333 已在库中;
-- 这里补三台车: 292 夹具用户当车头 (详情树带解散), 293 非车头, 294 实时刷新验收车。
-- 幂等: 先清掉同 id 再插。
DELETE FROM signups WHERE event_id IN (292, 293, 294);
DELETE FROM events WHERE id IN (292, 293, 294);

INSERT INTO events (id, tenant, title, type, description, starts_at, meet_info, max_slots, status, origin, creator_discord_id, dungeon)
VALUES (292, 'mobiletest', '周日晚双十 · 染青苍开荒', 'activity', '', '2026-10-25 20:00:00', '', 10, 'open', 'member', '111222333', '');

INSERT INTO events (id, tenant, title, type, description, starts_at, meet_info, max_slots, status, origin, creator_discord_id, dungeon)
VALUES (293, 'mobiletest', '今晚天赋车 · 冲层', 'talent', '', '2026-10-25 21:30:00', '', 10, 'open', 'member', '2001', '玉魄染青苍');

INSERT INTO events (id, tenant, title, type, description, starts_at, meet_info, max_slots, status, origin, creator_discord_id, dungeon)
VALUES (294, 'mobiletest', '验收车 · 实时刷新', 'activity', '', '2026-10-25 22:00:00', '', 10, 'open', 'member', '2001', '');

INSERT INTO signups (event_id, nickname, uid, role, weapon, discord_id) VALUES
  (292, '夹具侠客', 'u-leader', '输出', '鸣金·虹', '111222333'),
  (292, '车头甲', 'u-2001', '输出', '裂石·钧', '2001'),
  (292, '成员乙', 'u-2002', '输出', '破竹·鸢', '2002'),
  (292, '路人C', 'u-2003', '输出', '牵丝·玉', '2003'),
  (292, 'Alpha', 'u-3001', '治疗', '牵丝·霖', '3001'),
  (293, '车头甲', 'u-2001', '输出', '裂石·钧', '2001'),
  (293, '成员乙', 'u-2002', '输出', '破竹·鸢', '2002'),
  (294, '车头甲', 'u-2001', '输出', '裂石·钧', '2001');
