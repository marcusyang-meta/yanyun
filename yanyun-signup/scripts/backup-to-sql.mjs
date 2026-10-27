/* Convert a yanyun-backup JSON file into a portable SQL dump
 * (one INSERT per row, in restore order) for disaster recovery with
 * stock tooling — e.g. `wrangler d1 execute <db> --file dump.sql`
 * against a freshly created database whose tables already exist
 * (create them from the migration chain in migrations/:
 * `wrangler d1 migrations apply yanyun-signup --remote`).
 *
 * Usage: node scripts/backup-to-sql.mjs <backup.json> [out.sql]
 * The semantic restore path (importBackup in the data layer) is proven
 * by scripts/restore-drill.mjs; this converter exists so a backup can
 * also be restored where only SQL access is available.
 */
import fs from 'node:fs';

const inPath = process.argv[2];
if (!inPath) { console.error('usage: node scripts/backup-to-sql.mjs <backup.json> [out.sql]'); process.exit(2); }
const outPath = process.argv[3] || inPath.replace(/\.json$/, '') + '.sql';

const file = JSON.parse(fs.readFileSync(inPath, 'utf8'));
if (file.format !== 'yanyun-backup') { console.error('not a yanyun-backup file'); process.exit(1); }

function literal(v) {
  if (v == null) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && typeof v.$blob === 'string') {
    const bytes = Buffer.from(v.$blob, 'base64');
    return `X'${bytes.toString('hex')}'`;
  }
  return `'${String(v).replace(/'/g, "''")}'`;
}

const lines = [
  `-- yanyun-backup SQL dump`,
  `-- source exportedAt: ${file.exportedAt} (${new Date(file.exportedAt * 1000).toISOString()}), format v${file.version}`,
  `-- restore into an EMPTY database with all tables present; see docs/BACKUP.md`,
];
let total = 0;
for (const [key, entity] of Object.entries(file.entities)) {
  lines.push(`-- ${key}: ${entity.rows.length} rows`);
  for (const row of entity.rows) {
    const cols = Object.keys(row);
    lines.push(`INSERT INTO ${key} (${cols.join(', ')}) VALUES (${cols.map((c) => literal(row[c])).join(', ')});`);
    total++;
  }
}
fs.writeFileSync(outPath, lines.join('\n') + '\n');
console.log(`wrote ${outPath}: ${total} INSERT statements`);
