-- v4: 副本数据 + 当期标记 (2026-10-20)
-- dungeons: 副本名 / 规模(5人试剑 | 10人侠境) / 是否当期 / 排序
-- events.dungeon: 发车时选择的副本
-- bosses.dungeon: 该首领所属副本(用于图鉴按当期过滤)

CREATE TABLE IF NOT EXISTS dungeons (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  size       INTEGER NOT NULL DEFAULT 10,   -- 5 | 10
  is_current INTEGER NOT NULL DEFAULT 0,   -- 1=当期
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE events ADD COLUMN dungeon TEXT NOT NULL DEFAULT '';
ALTER TABLE bosses ADD COLUMN dungeon TEXT NOT NULL DEFAULT '';
