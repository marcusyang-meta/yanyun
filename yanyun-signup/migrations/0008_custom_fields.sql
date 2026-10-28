-- 0008: custom signup form fields (F7) for groupings and templates.
--
-- grouping_custom_fields: field definitions owned by exactly one
-- grouping (owner_kind = 'event') or one grouping template
-- (owner_kind = 'template'). A template's fields are copied onto a
-- car when the car is created from the template's field set, so a
-- car's fields are always its own rows — later template edits never
-- rewrite a live car's form. field_type is a small constrained set:
-- 'text' (single line) or 'choice' (single choice; options_json
-- carries the option list). required is 0/1.
--
-- signup_answers: one answer per (grouping, signup uid, field). The
-- signup uid ties the answer to the seat row (signups.uid); answers
-- are removed with their seat and with the grouping (FK cascade).
-- Visibility is a resolver concern: only the car's manager set
-- (leader / guild admins) ever reads these rows.
--
-- Pure expand: two new tables, nothing else changes.

CREATE TABLE grouping_custom_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_kind TEXT NOT NULL DEFAULT 'event',
  owner_id INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL DEFAULT '',
  field_type TEXT NOT NULL DEFAULT 'text',
  options_json TEXT NOT NULL DEFAULT '[]',
  required INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_grouping_custom_fields_owner ON grouping_custom_fields (owner_kind, owner_id, sort);

CREATE TABLE signup_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  signup_uid TEXT NOT NULL DEFAULT '',
  field_id INTEGER NOT NULL DEFAULT 0,
  value TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX signup_answers_unique ON signup_answers (event_id, signup_uid, field_id);
CREATE INDEX idx_signup_answers_event ON signup_answers (event_id);
