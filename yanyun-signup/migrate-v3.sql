-- v3: 成员发车 + 时区 (2026-10-20)
-- starts_at_utc: UTC unix 秒, 发车/活动时间的唯一真实来源
-- origin: admin=官方活动, member=成员发车
-- manage_code: sha256 hex, 成员管理自己发的车

ALTER TABLE events ADD COLUMN starts_at_utc INTEGER;
ALTER TABLE events ADD COLUMN origin TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE events ADD COLUMN created_by TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN manage_code TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_events_utc ON events(tenant, starts_at_utc);

-- 回填: 旧 starts_at 文本按 UTC 解析
UPDATE events
SET starts_at_utc = CAST(strftime('%s', REPLACE(starts_at, ' ', 'T')) AS INTEGER)
WHERE starts_at_utc IS NULL AND starts_at IS NOT NULL AND starts_at != '';
