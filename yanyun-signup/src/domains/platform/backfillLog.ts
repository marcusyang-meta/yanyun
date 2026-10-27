// creator_backfill_log repository (the one-off ops audit has no domain
// of its own; its entity is registered in the db barrel). The account
// deletion cascade anonymizes rows whose resolved identity points at
// the departing user: the identity columns are nulled while the
// outcome/count columns stay, so the historical backfill statistics
// remain truthful without retaining who was resolved.
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';

const { creatorBackfillLog } = schema;
const col = (name: string) => sql.identifier(name);


interface RunMeta {
  changes: number;
  last_row_id: number;
}

function metaOf(r: unknown): RunMeta {
  const m = (r as { meta?: { changes?: number; last_row_id?: number } } | null)?.meta;
  return { changes: m?.changes ?? 0, last_row_id: m?.last_row_id ?? 0 };
}

export async function anonymizeCreatorBackfillLog(
  d1: D1Database, discordId: string,
): Promise<number> {
  const db = createDb(d1);
  const r = await db.run(
    sql`UPDATE ${creatorBackfillLog}
        SET ${col('resolved_discord_id')} = NULL, ${col('seat_nickname')} = NULL
        WHERE ${col('resolved_discord_id')} = ${discordId}`,
  );
  return metaOf(r).changes;
}
