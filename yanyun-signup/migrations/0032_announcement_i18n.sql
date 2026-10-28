-- 0032: multilingual announcements (premium P26, dynamic translation).
--
-- guild_announcement_translations: one row per (announcement, target
-- locale) holding the translated title/body of that announcement.
-- status is 'done' or 'failed' — a failed provider round keeps its
-- row so the admin surface can show the failure state instead of a
-- misleading "not generated"; regenerating upserts over it.
-- source_hash is the SHA-256 of the announcement's title+body at
-- generation time, so a stale translation (source changed since) is
-- detectable and never served as current. tenant is denormalized
-- from the announcement so every read stays guild-scoped.
--
-- translation_cache: the cross-announcement provider cache, keyed by
-- (source text hash, target locale). The hash covers the source
-- locale + the exact source text (title and body are cached as two
-- independent text units), so identical text is never sent to the
-- provider twice, across announcements and guilds alike. Only
-- successful translations are cached.
--
-- Pure expand: two new tables, nothing else changes. The previous
-- release never touches these tables, so it is unaffected if it
-- briefly runs against the migrated shape (apply runs before promote
-- anyway).

CREATE TABLE guild_announcement_translations (
  announcement_id INTEGER NOT NULL,
  tenant TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'done',
  source_hash TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (announcement_id, locale)
);

CREATE INDEX idx_guild_announcement_translations_tenant ON guild_announcement_translations (tenant, announcement_id);

CREATE TABLE translation_cache (
  source_hash TEXT NOT NULL,
  target_locale TEXT NOT NULL DEFAULT '',
  translated_text TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (source_hash, target_locale)
);
