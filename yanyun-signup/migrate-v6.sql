-- v6: 副本视频攻略链接 (2026-10-20)
ALTER TABLE dungeons ADD COLUMN video_url TEXT NOT NULL DEFAULT '';
ALTER TABLE dungeons ADD COLUMN video_title TEXT NOT NULL DEFAULT '';
