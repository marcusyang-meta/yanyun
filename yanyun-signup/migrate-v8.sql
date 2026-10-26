-- 流派攻略数据搬到 D1：毕业词条 + 输出轴
CREATE TABLE IF NOT EXISTS school_bis (
  school TEXT NOT NULL,
  build TEXT NOT NULL DEFAULT '',
  attr TEXT,
  rate TEXT,
  bis_json TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  PRIMARY KEY (school, build)
);
CREATE TABLE IF NOT EXISTS school_rotations (
  school TEXT PRIMARY KEY,
  rotation_json TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);
