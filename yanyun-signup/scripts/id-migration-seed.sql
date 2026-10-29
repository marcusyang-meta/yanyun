-- Production-shaped seed for the migration 0036 rehearsal
-- (scripts/rehearse-id-migration.mjs). Deterministic data exercising
-- every remap class in docs/ID_SYSTEM.md:
--   * three guilds created on different days; 'fengyue' sorts before
--     'jiliguala' as a slug but AFTER it by guild ID, so the alliance
--     low/high pair must visibly swap;
--   * six registered users plus three Discord IDs with no user row:
--     777... (mentor + mentor-pool: class B sources -> orphan-minted),
--     888... (note subject + contribution recipient: class B -> minted),
--     999... (roster match + backfill resolution only: class A ->
--     must NOT be minted);
--   * class A columns (signups.discord_id, lottery discord ids, ops
--     recipient JSON) carrying values that must survive byte-identical.

-- Guilds: jiliguala day 296 (2026-10-24), fengyue day 298 (2026-10-26),
-- xianyu day 299 (2026-10-27).
INSERT INTO tenants (slug, guild_name, password_hash, announcement, created_at, discord_webhook, slogan, master_name, logo_url, bg_image_url, recruit_open) VALUES
  ('jiliguala', '叽哩呱啦', 'hash-a', '', strftime('%s','2026-10-24 09:00:00'), 'https://discord.com/api/webhooks/1/a', '', '', '', '', 0),
  ('fengyue', '风月', 'hash-b', '', strftime('%s','2026-10-26 09:00:00'), 'https://discord.com/api/webhooks/2/b', '', '', '', '', 1),
  ('xianyu', '咸鱼', 'hash-c', '', strftime('%s','2026-10-27 09:00:00'), '', '', '', '', '', 0);

-- Users U1..U6, registered across 2026-10-24..28.
INSERT INTO users (discord_id, username, avatar, guilds_json, guilds_checked_at, created_at, updated_at) VALUES
  ('111111111111111111', 'alice', '', '["123456789012345678"]', 0, strftime('%s','2026-10-24 10:00:00'), strftime('%s','2026-10-24 10:00:00')),
  ('222222222222222222', 'bob', '', '[]', 0, strftime('%s','2026-10-25 10:00:00'), strftime('%s','2026-10-25 10:00:00')),
  ('333333333333333333', 'carol', '', '[]', 0, strftime('%s','2026-10-25 12:00:00'), strftime('%s','2026-10-25 12:00:00')),
  ('444444444444444444', 'dave', '', '[]', 0, strftime('%s','2026-10-26 10:00:00'), strftime('%s','2026-10-26 10:00:00')),
  ('555555555555555555', 'erin', '', '[]', 0, strftime('%s','2026-10-27 10:00:00'), strftime('%s','2026-10-27 10:00:00')),
  ('666666666666666666', 'frank', '', '[]', 0, strftime('%s','2026-10-28 10:00:00'), strftime('%s','2026-10-28 10:00:00'));

INSERT INTO user_oauth (discord_id, refresh_token, scope) VALUES
  ('111111111111111111', 'rt-1', 'identify guilds'),
  ('222222222222222222', 'rt-2', 'identify guilds');
-- guild_id here is a DISCORD server id: external key, untouched.
INSERT INTO user_guild_nicks (discord_id, guild_id, nick) VALUES
  ('111111111111111111', '123456789012345678', '队长');
INSERT INTO push_tokens (discord_id, token, platform) VALUES
  ('111111111111111111', 'ExponentPushToken[aaa]', 'ios');
INSERT INTO usage_counters (discord_id, metric, day, count, updated_at) VALUES
  ('111111111111111111', 'ocr_batch', '2026-10-28', 3, 0),
  ('guild:jiliguala', 'guild_announcements', '2026-10-28', 2, 0);

INSERT INTO settings (tenant, key, value) VALUES
  ('jiliguala', 'discord_guild_id', '123456789012345678'),
  ('fengyue', 'welcome_text', 'hello');
INSERT INTO guild_entitlements (tenant, plan, source) VALUES ('jiliguala', 't3', 'manual');
INSERT INTO guild_avatars (tenant, content_type, bytes, hash, updated_at) VALUES
  ('jiliguala', 'image/png', X'89504E47', 'h1', 0);

INSERT INTO guild_members (tenant, discord_id, nick, global_name) VALUES
  ('jiliguala', '111111111111111111', '队长', 'Alice'),
  ('jiliguala', '222222222222222222', '老二', 'Bob'),
  ('jiliguala', '333333333333333333', '老三', 'Carol'),
  ('jiliguala', '777777777777777777', '导师甲', 'MentorA'),
  ('fengyue', '222222222222222222', '老二', 'Bob'),
  ('fengyue', '555555555555555555', '会长', 'Erin');

INSERT INTO dungeons (name, size) VALUES ('试锋', 10);
INSERT INTO bosses (name, dungeon) VALUES ('狼王', '试锋');

-- Events: E1 (id 1) jiliguala day 297 creator U1, ally-visible;
-- E2 (id 2) race day 298 creator U2; E3 (id 3) fengyue day 299
-- creator U5; E4 (id 4) day 297 with NULL creator.
INSERT INTO events (tenant, title, type, description, starts_at, meet_info, max_slots, status, created_at, origin, created_by, manage_code, dungeon, creator_discord_id, ally_visible, visitor_slots) VALUES
  ('jiliguala', '周六双十人本', 'activity', '', '2026-11-01 20:00', '', 20, 'open', '2026-10-25 10:00:00', 'member', '热心侠客', '', '试锋', '111111111111111111', 1, 2),
  ('jiliguala', '竞速周榜', 'race', '', '2026-11-02 20:00', '', 10, 'open', '2026-10-26 11:00:00', 'member', '热心侠客', '', '试锋', '222222222222222222', 0, 0),
  ('fengyue', '风月活动车', 'activity', '', '2026-11-03 20:00', '', 10, 'open', '2026-10-27 09:30:00', 'member', '热心侠客', '', '', '555555555555555555', 0, 0),
  ('jiliguala', '无主爬塔车', 'tower', '', '2026-11-04 20:00', '', 5, 'open', '2026-10-25 18:00:00', 'admin', '', '', '', NULL, 0, 0);

-- Seats on E1: U1 (ready), U2, an account-less member (888..., class A
-- value), a visitor seat (U5), and one anonymous seat (NULL discord).
INSERT INTO signups (event_id, nickname, uid, role, weapon, created_at, discord_id, ready_at, is_visitor) VALUES
  (1, '队长', 'seat-uid-1', '输出', '', '2026-10-25 10:05:00', '111111111111111111', 1793000000, 0),
  (1, '老二', 'seat-uid-2', '输出', '', '2026-10-25 10:06:00', '222222222222222222', NULL, 0),
  (1, '路人甲', 'seat-uid-3', '奶', '', '2026-10-25 10:07:00', '888888888888888888', NULL, 0),
  (1, '访客乙', 'seat-uid-4', '输出', '', '2026-10-25 10:08:00', '555555555555555555', NULL, 1),
  (1, '匿名座', 'seat-uid-5', '随意', '', '2026-10-25 10:09:00', NULL, NULL, 0);
INSERT INTO results (event_id, team_name, members, time_ms, created_at) VALUES
  (2, '一队', '', 312000, '2026-10-26 21:00:00'),
  (2, '二队', '', 298000, '2026-10-26 21:05:00');
INSERT INTO event_reminders (event_id, offset_min, sent_at, error) VALUES
  (1, 30, 1793000000, NULL),
  (1, 1440, NULL, 'webhook 404');

-- Templates: T1 (id 1) jiliguala day 298; T2 (id 2) fengyue day 299.
INSERT INTO grouping_templates (tenant, name, type, title, dungeon, max_slots, creator_discord_id, created_at, updated_at, season_key) VALUES
  ('jiliguala', '周末本模板', 'activity', '', '试锋', 20, '111111111111111111', strftime('%s','2026-10-26 08:00:00'), 0, ''),
  ('fengyue', '风月模板', 'activity', '', '', 10, '555555555555555555', strftime('%s','2026-10-27 08:00:00'), 0, 'S5');
-- Custom fields: F1 on event E1, F2 on template T1 (day must follow
-- the owner), F3 on event E3.
INSERT INTO grouping_custom_fields (owner_kind, owner_id, label, field_type, options_json, required, sort) VALUES
  ('event', 1, '主副流派', 'text', '[]', 1, 0),
  ('template', 1, '备注', 'text', '[]', 0, 0),
  ('event', 3, '装备分', 'text', '[]', 0, 0);
INSERT INTO signup_answers (event_id, signup_uid, field_id, value) VALUES
  (1, 'seat-uid-1', 1, '破竹');

-- Share aliases: two live ones, plus two hostile rows — an alias
-- whose car was dissolved (event 999 never exists here; the real
-- event was deleted) and an alias whose guild is gone entirely.
-- Dissolving a car never removed its alias (deleteEventCascade
-- leaves short_links behind), so both shapes exist in production
-- data; 0036 drops unresolvable short_links rows
-- (DROP_UNRESOLVED) instead of failing the rebuild on them.
INSERT INTO short_links (code, tenant, event_id, created_at) VALUES
  ('abc1234', 'jiliguala', 1, 0),
  ('xyz9876', 'fengyue', 3, 0),
  ('dead001', 'jiliguala', 999, 0),
  ('dead002', 'ghost-guild', 1, 0);

-- Lottery L1 (id 1) day 298, sourced from E1; entries/winners carry
-- class A Discord IDs (winner broadcasts).
INSERT INTO lotteries (tenant, title, prize, source, source_event_id, winner_count, status, created_by, created_at) VALUES
  ('jiliguala', '周末抽奖', '时装', 'grouping', 1, 1, 'drawn', '111111111111111111', strftime('%s','2026-10-26 20:00:00'));
INSERT INTO lottery_entries (lottery_id, discord_id, display_name, weight) VALUES
  (1, '111111111111111111', '队长', 1),
  (1, '222222222222222222', '老二', 1),
  (1, '777777777777777777', '导师甲', 1);
INSERT INTO lottery_winners (lottery_id, discord_id, display_name, drawn_at) VALUES
  (1, '222222222222222222', '老二', 1793100000);

-- Time poll P1 (id 1) day 299 with two options and three votes.
INSERT INTO time_polls (tenant, title, status, created_by, created_at) VALUES
  ('jiliguala', '下周开车时间', 'open', '222222222222222222', strftime('%s','2026-10-27 12:00:00'));
INSERT INTO time_poll_options (poll_id, starts_at_utc) VALUES (1, 1794000000), (1, 1794086400);
INSERT INTO time_poll_votes (poll_id, option_id, discord_id, display_name) VALUES
  (1, 1, '333333333333333333', '老三'),
  (1, 2, '333333333333333333', '老三'),
  (1, 1, '444444444444444444', '老四');

-- Announcements A1 (jiliguala, day 298) + reads + an en translation;
-- A2 (fengyue, day 299).
INSERT INTO guild_announcements (tenant, kind, title, body, author_discord_id, author_name, created_at) VALUES
  ('jiliguala', 'standard', '集合', '周六晚八点', '111111111111111111', '队长', strftime('%s','2026-10-26 15:00:00')),
  ('fengyue', 'urgent', '紧急集合', '现在', '555555555555555555', '会长', strftime('%s','2026-10-27 15:00:00'));
INSERT INTO guild_announcement_reads (announcement_id, tenant, discord_id, read_at) VALUES
  (1, 'jiliguala', '222222222222222222', 1793200000),
  (1, 'jiliguala', '333333333333333333', 1793200001);
INSERT INTO guild_announcement_translations (announcement_id, tenant, locale, title, body, status, source_hash) VALUES
  (1, 'jiliguala', 'en', 'Rally', 'Sat 8pm', 'done', 'abc');

INSERT INTO season_checklist_checks (tenant, season_key, item_key, checked, checked_by, checked_by_name, updated_at) VALUES
  ('jiliguala', 'intl-v2.3:S5', 'roster', 1, '111111111111111111', '队长', 0);

-- Roster: entries R1 (unmatched) / R2 (matched to class A 999...),
-- batch B1 (day 299) and its rows; row 1 created R2.
INSERT INTO guild_roster_entries (tenant, display_name, name_norm, source, matched_discord_id, created_by, created_at) VALUES
  ('jiliguala', '张三', 'zhangsan', 'ocr', NULL, '111111111111111111', strftime('%s','2026-10-27 09:00:00')),
  ('jiliguala', '李四', 'lisi', 'ocr', '999999999999999999', '111111111111111111', strftime('%s','2026-10-27 09:01:00'));
INSERT INTO roster_import_batches (tenant, created_by, status, image_count, created_at, confirmed_at) VALUES
  ('jiliguala', '111111111111111111', 'confirmed', 2, strftime('%s','2026-10-27 09:00:00'), 1793300000);
INSERT INTO roster_import_rows (batch_id, tenant, raw_name, name_norm, status, matched_discord_id, matched_name, created_entry_id) VALUES
  (1, 'jiliguala', '李四', 'lisi', 'matched', '999999999999999999', '李四', 2),
  (1, 'jiliguala', '王五', 'wangwu', 'new', NULL, '', NULL);

INSERT INTO guild_applications (tenant, discord_id, applicant_name, message, status, reviewed_by, reviewed_by_name, created_at, reviewed_at) VALUES
  ('fengyue', '666666666666666666', '新人丙', '想加入', 'pending', '', '', strftime('%s','2026-10-28 09:00:00'), NULL),
  ('jiliguala', '333333333333333333', '老三', 'hi', 'approved', '111111111111111111', '队长', strftime('%s','2026-10-26 09:00:00'), 1793400000);
-- Pairings: MP1's mentor is the orphan 777...; MP2 ended.
INSERT INTO mentor_pairings (tenant, mentor_discord_id, mentor_name, mentee_discord_id, mentee_name, status, created_by, created_at) VALUES
  ('jiliguala', '777777777777777777', '导师甲', '444444444444444444', '老四', 'active', '111111111111111111', strftime('%s','2026-10-27 10:00:00')),
  ('jiliguala', '222222222222222222', '老二', '666666666666666666', '新人丙', 'ended', '111111111111111111', strftime('%s','2026-10-26 10:00:00'));
INSERT INTO guild_mentors (tenant, discord_id, created_at) VALUES
  ('jiliguala', '222222222222222222', 0),
  ('jiliguala', '777777777777777777', 0);
INSERT INTO guild_member_notes (tenant, member_discord_id, body, author_discord_id, author_name, created_at, updated_at) VALUES
  ('jiliguala', '888888888888888888', '常鸽', '111111111111111111', '队长', strftime('%s','2026-10-27 11:00:00'), 0);
INSERT INTO member_season_goals (tenant, discord_id, member_name, title, status, dungeon_id, created_at, updated_at) VALUES
  ('jiliguala', '444444444444444444', '老四', '通关试锋', 'active', 1, strftime('%s','2026-10-27 12:00:00'), 0),
  ('fengyue', '555555555555555555', '会长', '文本目标', 'active', NULL, strftime('%s','2026-10-27 12:30:00'), 0);

-- Fill market: offers FO1 (U3) / FO2 (U5), request FR1 on E1, invite
-- FI1 from U1 to U5.
INSERT INTO fill_offers (discord_id, display_name, home_tenant, school, windows_json, note, status, created_at, updated_at) VALUES
  ('333333333333333333', '老三', 'jiliguala', '破竹', '[]', '', 'open', strftime('%s','2026-10-27 13:00:00'), 0),
  ('555555555555555555', '会长', 'fengyue', '破竹', '[]', '', 'open', strftime('%s','2026-10-27 13:05:00'), 0);
INSERT INTO fill_requests (tenant, event_id, needed_role, needed_school, note, status, created_by, created_by_name, created_at) VALUES
  ('jiliguala', 1, '奶', '', '', 'open', '111111111111111111', '队长', strftime('%s','2026-10-27 14:00:00'));
INSERT INTO fill_invites (request_id, offer_id, tenant, event_id, from_discord_id, from_name, to_discord_id, to_name, status, created_at) VALUES
  (1, 2, 'jiliguala', 1, '111111111111111111', '队长', '555555555555555555', '会长', 'pending', strftime('%s','2026-10-27 14:05:00'));

-- Alliances: AL1 pair stored slug-order (fengyue, jiliguala) — the
-- numeric order flips it. AL2 (jiliguala, xianyu) pending.
INSERT INTO guild_alliances (guild_low, guild_high, status, requested_by_tenant, requested_by, requested_by_name, created_at) VALUES
  ('fengyue', 'jiliguala', 'active', 'jiliguala', '111111111111111111', '队长', strftime('%s','2026-10-27 16:00:00')),
  ('jiliguala', 'xianyu', 'pending', 'xianyu', '555555555555555555', '会长', strftime('%s','2026-10-28 09:00:00'));

INSERT INTO ops_nudge_sends (tenant, event_id, segment_kind, segment_value, recipient_count, recipient_ids, sent_by, sent_at) VALUES
  ('jiliguala', 2, 'all', '', 2, '["222222222222222222","333333333333333333"]', '111111111111111111', strftime('%s','2026-10-27 17:00:00'));
INSERT INTO season_rollovers (tenant, from_season_key, to_season_key, templates_copied, report_json, created_by, created_at) VALUES
  ('jiliguala', 'S4', 'S5', 1, '{}', '111111111111111111', strftime('%s','2026-10-27 18:00:00'));
INSERT INTO contribution_rules (tenant, action_key, points, enabled, updated_by, updated_at) VALUES
  ('jiliguala', 'attendance', 5, 1, '111111111111111111', 0);
-- Dedupe keys embed the OLD event id + Discord id on purpose: the
-- migration rewrites both segments through the maps, or the runtime
-- (which writes new-format keys) would re-credit these events.
INSERT INTO contribution_entries (tenant, discord_id, action_key, points, event_id, dedupe_key, created_at) VALUES
  ('jiliguala', '222222222222222222', 'attendance', 5, 1, 'attendance:1:222222222222222222', strftime('%s','2026-10-26 21:00:00')),
  ('jiliguala', '888888888888888888', 'leading', 10, 2, 'leading:2:888888888888888888', strftime('%s','2026-10-26 21:30:00'));

INSERT INTO user_gear_items (discord_id, slot, name, payload, created_at) VALUES
  ('111111111111111111', 'weapon', '长剑', '{}', strftime('%s','2026-10-25 08:00:00')),
  ('222222222222222222', 'armor', '布甲', '{}', strftime('%s','2026-10-26 08:00:00'));
INSERT INTO user_gear_builds (discord_id, name, target_idx, payload, created_at) VALUES
  ('111111111111111111', '输出配装', 0, '{}', strftime('%s','2026-10-26 08:30:00'));
INSERT INTO build_share_links (code, build_id, discord_id, created_at) VALUES
  ('buildcd1', 1, '111111111111111111', 0);
INSERT INTO heirloom_item_pushes (tenant, discord_id, build_sig, item_hash, created_at) VALUES
  ('jiliguala', '111111111111111111', 'sig1', 'hash1', 0);
INSERT INTO heirloom_set_state (tenant, discord_id, build_sig, complete, updated_at) VALUES
  ('jiliguala', '111111111111111111', 'sig1', 1, 0);
INSERT INTO member_availability (tenant, discord_id, display_name, slots_json, updated_at) VALUES
  ('jiliguala', '222222222222222222', '老二', '[{"weekday":6,"startMinute":1200,"endMinute":1380}]', 0);

INSERT INTO feedback (discord_id, user_name, category, content, status, created_at) VALUES
  ('333333333333333333', '老三', 'bug', '报名按钮没反应', 'open', strftime('%s','2026-10-27 20:00:00')),
  ('111111111111111111', '队长', 'idea', '想要导出', 'open', strftime('%s','2026-10-28 08:00:00'));

INSERT INTO error_log (at, source, name, message, tenant) VALUES
  (1793500000, 'worker', 'Error', 'boom', 'jiliguala'),
  (1793500001, 'worker', 'Error', 'platform-level', ''),
  (1793500002, 'worker', 'Error', 'stale guild row', 'ghost-guild');
INSERT INTO hub_audit_log (at, actor, action, tenant, summary, ip) VALUES
  (1793500000, 'hub', 'grant', 'jiliguala', 'granted t3', ''),
  (1793500001, 'AdminName', 'login', '', 'hub login', '');
INSERT INTO creator_backfill_log (event_id, tenant, seat_nickname, resolved_discord_id, outcome, created_at) VALUES
  (1, 'jiliguala', '李四', '999999999999999999', 'resolved', 1793600000);
INSERT INTO stripe_events (event_id, type, processed_at) VALUES ('evt_1', 'checkout.session.completed', 1793500000);
INSERT INTO translation_cache (source_hash, target_locale, translated_text, created_at) VALUES ('h1', 'en', 'Rally', 0);

-- Premium wave (tables that landed on master after this branch's
-- original base): officer grants/posts, audit events, custom
-- domain, gear standard, grouping recap, rotation records, and the
-- platform-admin roster settings row. Shapes are the pre-migration
-- ones (slug tenants, Discord-ID user references).
INSERT INTO guild_officer_grants (tenant, discord_id, capabilities, granted_by, granted_by_name, created_at, updated_at) VALUES
  ('jiliguala', '222222222222222222', 'events,announce', '111111111111111111', '队长', strftime('%s','2026-10-27 10:00:00'), 0);
INSERT INTO guild_officer_posts (tenant, body, author_discord_id, author_name, created_at, updated_at) VALUES
  ('jiliguala', '本周先打试锋', '222222222222222222', '老二', strftime('%s','2026-10-27 10:05:00'), 0);
-- Audit targets cover the AUDITTARGET map: announcement (A1),
-- event (E1), board (the post above), signup (first seat of E1),
-- roster.import (batch B1), roster.entryDelete (entry R2), a member
-- target (stays a Discord ID) and a guide target (stays a name).
INSERT INTO guild_audit_events (tenant, actor_discord_id, actor_name, action, target_type, target_id, target_label, created_at) VALUES
  ('jiliguala', '111111111111111111', '队长', 'announcement.post', 'announcement', '1', '集合', strftime('%s','2026-10-27 11:00:00')),
  ('jiliguala', '111111111111111111', '队长', 'event.create', 'event', '1', '周六双十人本', strftime('%s','2026-10-27 11:01:00')),
  ('jiliguala', '222222222222222222', '老二', 'board.post', 'board', '1', '军官留言', strftime('%s','2026-10-27 11:02:00')),
  ('jiliguala', '111111111111111111', '队长', 'signup.remove', 'signup', '1', '', strftime('%s','2026-10-27 11:03:00')),
  ('jiliguala', '111111111111111111', '队长', 'roster.import', 'roster', '1', '', strftime('%s','2026-10-27 11:04:00')),
  ('jiliguala', '111111111111111111', '队长', 'roster.entryDelete', 'roster', '2', '', strftime('%s','2026-10-27 11:05:00')),
  ('jiliguala', '111111111111111111', '队长', 'note.add', 'member', '333333333333333333', '老三', strftime('%s','2026-10-27 11:06:00')),
  ('jiliguala', '111111111111111111', '队长', 'guide.publish', 'guide', '试锋', '', strftime('%s','2026-10-27 11:07:00'));
INSERT INTO guild_custom_domains (tenant, hostname, status, verify_token, created_by, created_at, updated_at, verified_at) VALUES
  ('jiliguala', 'play.example.com', 'active', 'tok123', '111111111111111111', strftime('%s','2026-10-27 12:00:00'), 0, strftime('%s','2026-10-27 12:30:00'));
INSERT INTO guild_gear_standards (tenant, label, min_score, created_by, created_at, updated_at) VALUES
  ('jiliguala', '毕业线', 85, '111111111111111111', strftime('%s','2026-10-27 12:10:00'), 0);
INSERT INTO grouping_recaps (tenant, event_id, status, paragraphs_json, snapshot_json, provider, generated_by, version, last_error, generated_at, updated_at) VALUES
  ('jiliguala', 1, 'ready', '["打得不错"]', '{}', 'workers-ai', '111111111111111111', 1, '', strftime('%s','2026-10-27 21:00:00'), 0);
-- Rotation records: one saved by U2, one by the omniscient saver
-- (the 'omni' sentinel must land on user ID 0, never a minted user).
INSERT INTO rotation_advice_records (tenant, event_id, advice_json, created_by, created_at) VALUES
  ('jiliguala', 1, '[]', '222222222222222222', strftime('%s','2026-10-27 15:00:00')),
  ('jiliguala', 1, '[]', 'omni', strftime('%s','2026-10-27 15:05:00'));
-- Platform-admin roster: U1 (has an account) + orphan 777... (the
-- class B orphan above; the migration collects it as a user first,
-- so the roster rewrite can resolve it — no extra user appears).
INSERT INTO settings (tenant, key, value) VALUES
  ('', 'platform_admin_discord_ids', '["111111111111111111","777777777777777777"]');

-- Lazy-deletion residue — the classes from the production census
-- of 2026-10-28, one specimen each. Deletion removes the entity
-- plus the few dependents its hand-written cascade knows; the rows
-- below are what the cascades leave behind (dead car 999 and dead
-- guild 'ghost-guild' have no entity row anywhere in this seed).
-- 0036 reaps the derivative rows (DROP_UNRESOLVED in the
-- generator) and preserves the ledger rows: a dead dedupe segment
-- keeps its original text and the nullable event_id lands on NULL.
-- A dead guild's settings + entitlement: the production shape was
-- three settings rows over three dead test guilds; the entitlement
-- is the gating satellite of the same class.
INSERT INTO settings (tenant, key, value) VALUES
  ('ghost-guild', 'discord_guild_id', '999999999999999999');
INSERT INTO guild_entitlements (tenant, plan, source) VALUES ('ghost-guild', 't3', 'manual');
-- A dead car's sent reminder (the production row's shape: offset
-- 10, already sent), an answer on a live field, and an ops send.
INSERT INTO event_reminders (event_id, offset_min, sent_at, error) VALUES
  (999, 10, 1793069400, NULL);
INSERT INTO signup_answers (event_id, signup_uid, field_id, value) VALUES
  (999, 'seat-uid-9', 1, '残页');
INSERT INTO ops_nudge_sends (tenant, event_id, segment_kind, segment_value, recipient_count, recipient_ids, sent_by, sent_at) VALUES
  ('jiliguala', 999, 'all', '', 0, '[]', '111111111111111111', strftime('%s','2026-10-27 17:30:00'));
-- Field definitions whose owners are gone: a dead car's field and
-- a dead template's field. No answers reference either (a car's
-- fields are copied from its template at creation, so answers only
-- ever point at event-owned fields).
INSERT INTO grouping_custom_fields (owner_kind, owner_id, label, field_type, options_json, required, sort) VALUES
  ('event', 999, '死车字段', 'text', '[]', 0, 0),
  ('template', 999, '死模板字段', 'text', '[]', 0, 0);
-- A share link to a deleted build (the link lands on a 404 today).
INSERT INTO build_share_links (code, build_id, discord_id, created_at) VALUES
  ('deadbuild', 999, '111111111111111111', 0);
-- An alliance against the dead guild: one pair end unresolvable.
INSERT INTO guild_alliances (guild_low, guild_high, status, requested_by_tenant, requested_by, requested_by_name, created_at) VALUES
  ('ghost-guild', 'jiliguala', 'pending', 'jiliguala', '111111111111111111', '队长', strftime('%s','2026-10-28 09:30:00'));
-- A usage counter scoped to the dead guild.
INSERT INTO usage_counters (discord_id, metric, day, count, updated_at) VALUES
  ('guild:ghost-guild', 'guild_announcements', '2026-10-28', 7, 0);
-- Contribution ledger rows the migration must PRESERVE:
--   * a mentoring key on live pairing MP1 — the off-by-one class:
--     with the old segment offset, ANY mentoring key aborted the
--     migration outright (empty segment -> NULL key);
--   * a mentoring key on dead pairing 999 — the pairing segment
--     keeps its original text, the user segment still rewrites;
--   * an attendance key on dead car 999 with event_id set — the
--     row survives, event_id lands on NULL, the key keeps 999.
INSERT INTO contribution_entries (tenant, discord_id, action_key, points, event_id, dedupe_key, created_at) VALUES
  ('jiliguala', '444444444444444444', 'mentoring', 15, NULL, 'mentoring:pairing:1:444444444444444444', strftime('%s','2026-10-27 21:10:00')),
  ('jiliguala', '555555555555555555', 'mentoring', 15, NULL, 'mentoring:pairing:999:555555555555555555', strftime('%s','2026-10-27 21:20:00')),
  ('jiliguala', '333333333333333333', 'attendance', 5, 999, 'attendance:999:333333333333333333', strftime('%s','2026-10-27 21:30:00'));
