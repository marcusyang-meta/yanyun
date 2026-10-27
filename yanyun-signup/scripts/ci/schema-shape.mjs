/* ===================================================
 * Canonical database-shape tooling for migration governance.
 *
 * One canonical shape format, three producers:
 *   - introspectD1(db)      — any D1-like database (Miniflare local,
 *                             a wrangler dev DB, ...) via PRAGMA
 *                             table-valued functions;
 *   - introspectRemote()    — production, read-only, through
 *                             `wrangler d1 execute --remote`;
 *   - shapeFromEntities()   — the Drizzle model in src/db/schema.ts.
 * and one consumer: diffShapes(a, b) -> human-readable diff lines
 * (empty array = identical shapes).
 *
 * Canonical shape:
 *   { tables: { <name>: {
 *       columns: { <col>: { type, notnull, dflt, pk } },
 *       autoincrement: bool,
 *       indexes: [ { name|null, unique, columns[] } ],
 *       fks:     [ { from, table, to, onDelete } ],
 *   } } }
 *
 * Normalization rules (deliberate; change them only with the gate's
 * consumers in mind):
 *   - Column ORDER is not compared: every access in this codebase is
 *     by name through the data layer, and production's order is an
 *     accident of its ALTER history. Column name/type/nullability/
 *     default/PK position are all compared.
 *   - A sole primary-key column canonicalizes to notnull=true on
 *     both sides (SQLite reports the declared flag, which the
 *     historical DDL usually omitted for PKs; a single-column PK is
 *     never nullable in effect).
 *   - Defaults are compared as normalized expression text: one layer
 *     of wrapping parentheses is stripped (SQLite stores
 *     DEFAULT (strftime(...)) but PRAGMA reports strftime(...)) and
 *     whitespace is collapsed.
 *   - Indexes backed by a UNIQUE constraint (origin 'u') or a PK
 *     (origin 'pk') carry no durable name: PKs are compared through
 *     the column pk positions, unique constraints by (unique,
 *     columns). Explicit CREATE INDEX objects (origin 'c') are
 *     compared by name first, then by (unique, columns).
 *   - Platform-owned tables (sqlite_*, _cf_*, d1_migrations) are
 *     excluded: d1_migrations is the wrangler ledger itself.
 * =================================================== */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
export const SIGNUP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const EXCLUDED = (name) =>
  name.startsWith('sqlite_') || name.startsWith('_cf_') || name === 'd1_migrations';

const Q_TABLES = `SELECT name, sql FROM sqlite_master WHERE type='table'`;
const Q_COLS = `SELECT m.name AS tbl, p.name AS col, p.type AS typ, p."notnull" AS nn, p.dflt_value AS dflt, p.pk AS pk FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type='table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%' AND m.name <> 'd1_migrations' ORDER BY tbl, p.cid`;
const Q_IDXLIST = `SELECT m.name AS tbl, i.name AS idx, i."unique" AS uq, i.origin AS org FROM sqlite_master m JOIN pragma_index_list(m.name) i WHERE m.type='table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%' AND m.name <> 'd1_migrations' ORDER BY tbl, idx`;
const Q_IDXCOLS = `SELECT m.name AS tbl, i.name AS idx, x.seqno AS seq, x.name AS col FROM sqlite_master m JOIN pragma_index_list(m.name) i JOIN pragma_index_info(i.name) x WHERE m.type='table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%' AND m.name <> 'd1_migrations' ORDER BY tbl, idx, seq`;
const Q_FKS = `SELECT m.name AS tbl, f.seq AS seq, f."table" AS ftbl, f."from" AS ffrom, f."to" AS fto, f.on_delete AS ondel FROM sqlite_master m JOIN pragma_foreign_key_list(m.name) f WHERE m.type='table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%' AND m.name <> 'd1_migrations' ORDER BY tbl, f.id, seq`;

export function normalizeDflt(raw) {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim().replace(/\s+/g, ' ');
  // Strip one layer of parentheses when they wrap the whole string.
  for (;;) {
    if (s.length < 2 || s[0] !== '(' || s[s.length - 1] !== ')') break;
    let depth = 0, wraps = true;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') { depth--; if (depth === 0 && i < s.length - 1) { wraps = false; break; } }
    }
    if (!wraps || depth !== 0) break;
    s = s.slice(1, -1).trim();
  }
  return s;
}

function canonicalFromRows({ tables, cols, idxList, idxCols, fks }) {
  const out = { tables: {} };
  const sqlByName = new Map(tables.map((r) => [r.name, r.sql || '']));
  for (const name of sqlByName.keys()) {
    if (EXCLUDED(name)) continue;
    out.tables[name] = {
      columns: {},
      autoincrement: /AUTOINCREMENT/i.test(sqlByName.get(name)),
      indexes: [],
      fks: [],
    };
  }
  for (const r of cols) {
    const t = out.tables[r.tbl];
    if (!t) continue;
    t.columns[r.col] = {
      type: String(r.typ || '').toUpperCase(),
      notnull: r.nn === 1,
      dflt: normalizeDflt(r.dflt),
      pk: r.pk || 0,
    };
  }
  const idxColsByKey = new Map();
  for (const r of idxCols) {
    const k = `${r.tbl}${r.idx}`;
    if (!idxColsByKey.has(k)) idxColsByKey.set(k, []);
    idxColsByKey.get(k).push(r.col);
  }
  for (const r of idxList) {
    const t = out.tables[r.tbl];
    if (!t || r.org === 'pk') continue;
    t.indexes.push({
      name: r.org === 'c' ? r.idx : null,
      unique: r.uq === 1,
      columns: idxColsByKey.get(`${r.tbl}${r.idx}`) || [],
    });
  }
  for (const r of fks) {
    const t = out.tables[r.tbl];
    if (!t) continue;
    t.fks.push({ from: r.ffrom, table: r.ftbl, to: r.fto, onDelete: String(r.ondel || '').toUpperCase() });
  }
  // Sole-PK columns canonicalize to notnull=true (see header).
  for (const t of Object.values(out.tables)) {
    const pkCols = Object.values(t.columns).filter((c) => c.pk > 0);
    if (pkCols.length === 1) pkCols[0].notnull = true;
    t.indexes.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    t.fks.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  return out;
}

async function runAll(db, sqlText) {
  const { results } = await db.prepare(sqlText).all();
  return results || [];
}

/** Introspect any D1-like database (prepare/all) into canonical shape.
 * Uses plain PRAGMA statements per table: the table-valued pragma
 * functions used by introspectRemote are rejected by Miniflare's
 * local D1 authorizer (SQLITE_AUTH), while the statement forms are
 * what the repositories themselves use. */
export async function introspectD1(db) {
  const tables = await runAll(db, Q_TABLES);
  const cols = [], idxList = [], idxCols = [], fks = [];
  const ident = (n) => `"${String(n).replace(/"/g, '""')}"`;
  for (const t of tables) {
    if (EXCLUDED(t.name)) continue;
    for (const r of await runAll(db, `PRAGMA table_info(${ident(t.name)})`)) {
      cols.push({ tbl: t.name, col: r.name, typ: r.type, nn: r.notnull, dflt: r.dflt_value, pk: r.pk });
    }
    for (const r of await runAll(db, `PRAGMA index_list(${ident(t.name)})`)) {
      idxList.push({ tbl: t.name, idx: r.name, uq: r.unique, org: r.origin });
      for (const x of await runAll(db, `PRAGMA index_info(${ident(r.name)})`)) {
        idxCols.push({ tbl: t.name, idx: r.name, seq: x.seqno, col: x.name });
      }
    }
    for (const r of await runAll(db, `PRAGMA foreign_key_list(${ident(t.name)})`)) {
      fks.push({ tbl: t.name, seq: r.seq, ftbl: r.table, ffrom: r.from, fto: r.to, ondel: r.on_delete });
    }
  }
  return canonicalFromRows({ tables, cols, idxList, idxCols, fks });
}

/** Introspect production read-only via wrangler (needs the D1 token). */
export async function introspectRemote() {
  const run = async (sqlText) => {
    const { stdout } = await execFileP('pnpm',
      ['exec', 'wrangler', 'd1', 'execute', 'yanyun-signup', '--remote', '--json', '--command', sqlText],
      { cwd: SIGNUP_ROOT, maxBuffer: 16 * 1024 * 1024 });
    const parsed = JSON.parse(stdout.slice(stdout.indexOf('[')));
    return parsed[0]?.results || [];
  };
  // Serial on purpose: parallel pragma-join queries against the D1
  // API intermittently draw SQLITE_AUTH rejections.
  const tables = await run(Q_TABLES);
  const cols = await run(Q_COLS);
  const idxList = await run(Q_IDXLIST);
  const idxCols = await run(Q_IDXCOLS);
  const fks = await run(Q_FKS);
  return canonicalFromRows({ tables, cols, idxList, idxCols, fks });
}

const TYPE_BY_COLUMNTYPE = {
  SQLiteText: 'TEXT', SQLiteInteger: 'INTEGER', SQLiteBoolean: 'INTEGER',
  SQLiteReal: 'REAL', SQLiteBlobBuffer: 'BLOB', SQLiteBlobJson: 'BLOB',
  SQLiteTimestamp: 'INTEGER', SQLiteCustom: 'TEXT',
};

function entityDefault(col) {
  if (!col.hasDefault) return null;
  const d = col.default;
  if (d === undefined || d === null) return null;
  if (typeof d === 'string') return `'${d.replace(/'/g, "''")}'`;
  if (typeof d === 'number' || typeof d === 'bigint') return String(d);
  if (typeof d === 'boolean') return d ? '1' : '0';
  if (typeof d === 'object' && Array.isArray(d.queryChunks)) {
    let text = '';
    const walk = (chunk) => {
      if (typeof chunk === 'string') text += chunk;
      else if (Array.isArray(chunk)) chunk.forEach(walk);
      else if (chunk && Array.isArray(chunk.value)) chunk.value.forEach(walk);
      else if (chunk && Array.isArray(chunk.queryChunks)) chunk.queryChunks.forEach(walk);
    };
    d.queryChunks.forEach(walk);
    return normalizeDflt(text);
  }
  return String(d);
}

/** Render the Drizzle entity model (src/db/schema.ts) as canonical shape. */
export async function shapeFromEntities() {
  const { getTableConfig } = await import('drizzle-orm/sqlite-core');
  const { getTableName } = await import('drizzle-orm');
  const schema = await import('../../src/db/schema.ts');
  const out = { tables: {} };
  for (const value of Object.values(schema)) {
    if (!value || typeof value !== 'object') continue;
    let cfg;
    try { cfg = getTableConfig(value); } catch { continue; }
    if (!cfg || !cfg.name || !Array.isArray(cfg.columns)) continue;
    const t = { columns: {}, autoincrement: false, indexes: [], fks: [] };
    const pkPos = new Map();
    if (cfg.primaryKeys && cfg.primaryKeys.length) {
      cfg.primaryKeys[0].columns.forEach((c, i) => pkPos.set(c.name, i + 1));
    }
    for (const col of cfg.columns) {
      if (col.primary) pkPos.set(col.name, 1);
      t.columns[col.name] = {
        type: TYPE_BY_COLUMNTYPE[col.columnType] || String(col.columnType || '').toUpperCase(),
        notnull: !!col.notNull,
        dflt: entityDefault(col),
        pk: pkPos.get(col.name) || 0,
      };
      if (col.autoIncrement) t.autoincrement = true;
      if (col.isUnique) t.indexes.push({ name: null, unique: true, columns: [col.name] });
    }
    for (const ix of cfg.indexes || []) {
      t.indexes.push({
        name: ix.config.name,
        unique: !!ix.config.unique,
        columns: ix.config.columns.map((c) => c.name),
      });
    }
    for (const fk of cfg.foreignKeys || []) {
      const ref = fk.reference();
      ref.columns.forEach((c, i) => {
        t.fks.push({
          from: c.name,
          table: getTableName(ref.foreignTable),
          to: ref.foreignColumns[i].name,
          onDelete: String(fk.onDelete || 'NO ACTION').toUpperCase(),
        });
      });
    }
    if (pkPos.size === 1) {
      const only = [...pkPos.keys()][0];
      if (t.columns[only]) t.columns[only].notnull = true;
    }
    t.indexes.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    t.fks.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    out.tables[cfg.name] = t;
  }
  return out;
}

/** Diff two canonical shapes. Returns [] when identical. */
export function diffShapes(a, b, aName = 'A', bName = 'B') {
  const diffs = [];
  const aT = Object.keys(a.tables), bT = Object.keys(b.tables);
  for (const t of aT) if (!b.tables[t]) diffs.push(`table ${t}: only in ${aName}`);
  for (const t of bT) if (!a.tables[t]) diffs.push(`table ${t}: only in ${bName}`);
  for (const name of aT) {
    const ta = a.tables[name], tb = b.tables[name];
    if (!ta || !tb) continue;
    const aC = Object.keys(ta.columns), bC = Object.keys(tb.columns);
    for (const c of aC) if (!tb.columns[c]) diffs.push(`${name}.${c}: column only in ${aName}`);
    for (const c of bC) if (!ta.columns[c]) diffs.push(`${name}.${c}: column only in ${bName}`);
    for (const c of aC) {
      const ca = ta.columns[c], cb = tb.columns[c];
      if (!ca || !cb) continue;
      if (ca.type !== cb.type) diffs.push(`${name}.${c}: type ${aName}=${ca.type} ${bName}=${cb.type}`);
      if (ca.notnull !== cb.notnull) diffs.push(`${name}.${c}: notnull ${aName}=${ca.notnull} ${bName}=${cb.notnull}`);
      if (ca.dflt !== cb.dflt) diffs.push(`${name}.${c}: default ${aName}=${JSON.stringify(ca.dflt)} ${bName}=${JSON.stringify(cb.dflt)}`);
      if (ca.pk !== cb.pk) diffs.push(`${name}.${c}: pk position ${aName}=${ca.pk} ${bName}=${cb.pk}`);
    }
    if (ta.autoincrement !== tb.autoincrement) {
      diffs.push(`${name}: autoincrement ${aName}=${ta.autoincrement} ${bName}=${tb.autoincrement}`);
    }
    // Indexes: match named-by-name first, then by (unique, columns).
    const matchIdx = (xs, ys) => {
      const rest = [...ys];
      const missing = [];
      for (const x of xs) {
        let i = x.name
          ? rest.findIndex((y) => y.name === x.name)
          : rest.findIndex((y) => y.unique === x.unique && JSON.stringify(y.columns) === JSON.stringify(x.columns));
        if (i < 0 && x.name) {
          i = rest.findIndex((y) => y.unique === x.unique && JSON.stringify(y.columns) === JSON.stringify(x.columns));
        }
        if (i < 0) { missing.push(x); continue; }
        const [y] = rest.splice(i, 1);
        if (y.unique !== x.unique || JSON.stringify(y.columns) !== JSON.stringify(x.columns)) {
          diffs.push(`${name}: index ${x.name || JSON.stringify(x.columns)} differs (${aName}: unique=${x.unique} cols=${x.columns}; ${bName}: unique=${y.unique} cols=${y.columns})`);
        }
      }
      return { missing, extra: rest };
    };
    const fwd = matchIdx(ta.indexes, tb.indexes);
    for (const x of fwd.missing) diffs.push(`${name}: index ${x.name || JSON.stringify(x.columns)} only in ${aName}`);
    for (const y of fwd.extra) diffs.push(`${name}: index ${y.name || JSON.stringify(y.columns)} only in ${bName}`);
    const fkKey = (f) => `${f.from}->${f.table}(${f.to}) ${f.onDelete}`;
    const aF = new Set(ta.fks.map(fkKey)), bF = new Set(tb.fks.map(fkKey));
    for (const f of aF) if (!bF.has(f)) diffs.push(`${name}: fk ${f} only in ${aName}`);
    for (const f of bF) if (!aF.has(f)) diffs.push(`${name}: fk ${f} only in ${bName}`);
  }
  return diffs;
}

export function shapeStats(shape) {
  const tables = Object.keys(shape.tables).length;
  const columns = Object.values(shape.tables).reduce((n, t) => n + Object.keys(t.columns).length, 0);
  const indexes = Object.values(shape.tables).reduce((n, t) => n + t.indexes.length, 0);
  return { tables, columns, indexes };
}
