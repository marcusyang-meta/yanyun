-- 燕云十六声 百业报名小工具 · D1 schema (多租户: worker.dev/<slug>)
-- 幂等: 表/列/索引均为 IF NOT EXISTS, 可重复执行

CREATE TABLE IF NOT EXISTS tenants (
  slug          TEXT PRIMARY KEY,                       -- URL 路径段, 如 shuangshi
  guild_name    TEXT NOT NULL,                           -- 百业名称
  password_hash TEXT NOT NULL,                           -- sha256(管理员密码)
  announcement  TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant      TEXT NOT NULL DEFAULT '',                  -- 所属百业 slug
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'activity',          -- activity | talent | race
  description TEXT NOT NULL DEFAULT '',
  starts_at   TEXT,                                      -- 'YYYY-MM-DD HH:MM:SS'
  meet_info   TEXT NOT NULL DEFAULT '',
  max_slots   INTEGER NOT NULL DEFAULT 20,
  status      TEXT NOT NULL DEFAULT 'open'               -- open | closed
);
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant, type, status);

CREATE TABLE IF NOT EXISTS signups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  nickname   TEXT NOT NULL,
  uid        TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '随意',
  weapon     TEXT NOT NULL DEFAULT '',
  contact    TEXT NOT NULL DEFAULT '',                  -- 仅管理员可见
  note       TEXT NOT NULL DEFAULT '',
  team_name  TEXT NOT NULL DEFAULT '',
  members    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now')),
  UNIQUE(event_id, uid)
);
CREATE INDEX IF NOT EXISTS idx_signups_event ON signups(event_id);

CREATE TABLE IF NOT EXISTS results (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_name  TEXT NOT NULL,
  members    TEXT NOT NULL DEFAULT '',
  time_ms    INTEGER NOT NULL,
  proof_url  TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX IF NOT EXISTS idx_results_event ON results(event_id, time_ms);

-- 全局设置: tenant='' 为全站(游戏版本/快讯, 仅超管可改)
CREATE TABLE IF NOT EXISTS settings (
  tenant TEXT NOT NULL DEFAULT '',
  key    TEXT NOT NULL,
  value  TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (tenant, key)
);
INSERT OR IGNORE INTO settings(tenant, key, value) VALUES ('', 'game_version', '');
INSERT OR IGNORE INTO settings(tenant, key, value) VALUES ('', 'game_notice', '');

-- 首领天赋图鉴: 全站共用(同服数据一致), 仅超管可维护
CREATE TABLE IF NOT EXISTS bosses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  talent     TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 100级词条满值表（国际服）
CREATE TABLE IF NOT EXISTS affix_max (
  affix_key   TEXT PRIMARY KEY,  -- 词条英文key
  name_cn     TEXT NOT NULL,     -- 中文名
  max_value   REAL NOT NULL,     -- 100级满值
  unit        TEXT DEFAULT ''     -- 单位：% 或空
);
