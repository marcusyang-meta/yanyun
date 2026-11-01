/* Platform-admin one-off backfills, as services behind admin
 * mutations (they used to be POST endpoints on the retired hub
 * portal). The matching policies are unchanged from the portal
 * handlers — conservative, unique-match-only, never guess — and all
 * data access goes through domain repositories (the creator-stamps
 * handler previously hand-rolled SQL against the raw binding; it now
 * reads/writes through the groupings events repository).
 *
 * Each function returns the same report shape the portal returned;
 * auditing is the caller's job (the resolver records the real actor).
 */
import {
  listNonEmptySettingsByKey, listSettingsByKey, getTenantRowById,
} from '../guilds/index.ts';
import {
  upsertGuildMember, listUnstampedSeatsByTenant, stampSignupDiscordId,
  listEventsForCreatorBackfill, stampEventCreators,
} from '../groupings/index.ts';
import { listUsersDirectory, listAllNicks, listNicksByGuild } from '../identity/index.ts';
import {
  listBossesWithGuide, updateBossFields, getDungeonByName, insertDungeonDex,
  updateDungeonFields, insertBoss, getBossById, getBossIdByNameAndDungeon,
} from '../dex/index.ts';
import { parseGuideStructured } from '../dex/graphql.ts';

/* ---------- Reminder identity backfill ----------
 * Same discipline as the leader backfill: idempotent, dryRun only
 * reports, only a unique unambiguous match counts — never guess.
 *  1) Roster seed: for each bound guild, write users whose
 *     guilds_json includes its bound server into guild_members (nick
 *     from that server's snapshot, may be empty).
 *  2) Seat stamp: stamp signups.discord_id only when an unstamped
 *     seat's nick matches exactly one member candidate (global name
 *     / server nick snapshot; both sources hitting one user is still
 *     one candidate). Two or more = ambiguous, skip; zero = no match.
 * Touches only discord_id and guild_members, never nicks or other
 * fields. */
export interface ReminderIdentityGuildReport {
  slug: string; discordGuildId: string; rosterSeeded: number;
  seatsTotal: number; stamped: number; ambiguous: number; unmatched: number;
}
export interface ReminderIdentityReport {
  dryRun: boolean;
  guilds: ReminderIdentityGuildReport[];
  totals: { rosterSeeded: number; seatsTotal: number; stamped: number; ambiguous: number; unmatched: number };
}

export async function runReminderIdentityBackfill(
  db: D1Database, dryRun: boolean,
): Promise<ReminderIdentityReport> {
  const bindRows = await listNonEmptySettingsByKey(db, 'discord_guild_id');
  const allUsers = await listUsersDirectory(db);
  const userInGuild = (u: any, dgid: any) => {
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      return Array.isArray(gs) && gs.some((g: any) => String(typeof g === 'object' && g ? g.id : g) === String(dgid));
    } catch { return false; }
  };
  const guilds: ReminderIdentityGuildReport[] = [];
  const totals = { rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0 };
  for (const b of bindRows) {
    const guildId = Number(b.tenant), dgid = String(b.value);
    const slugRow = await getTenantRowById(db, guildId).catch(() => null);
    const slug = slugRow ? slugRow.slug : String(guildId);
    const members = (allUsers || []).filter((u) => userInGuild(u, dgid));
    const nickRows = await listNicksByGuild(db, dgid);
    const nickOf = new Map((nickRows || []).map((r) => [String(r.discord_id), String(r.nick || '')]));
    // 1) Seed the roster
    let rosterSeeded = 0;
    for (const u of members) {
      rosterSeeded++;
      if (!dryRun) {
        await upsertGuildMember(db, slug, u.discord_id, nickOf.get(String(u.discord_id)) || '', u.username || '');
      }
    }
    // 2) Stamp seats
    const seats = await listUnstampedSeatsByTenant(db, guildId);
    let stamped = 0, ambiguous = 0, unmatched = 0;
    for (const seat of seats || []) {
      const nick = String(seat.nickname || '').trim();
      const hits = new Set<string>();
      if (nick) {
        for (const u of members) {
          if (String(u.username || '').trim() === nick || (nickOf.get(String(u.discord_id)) || '').trim() === nick) {
            hits.add(String(u.discord_id));
          }
        }
      }
      if (hits.size === 1) {
        stamped++;
        if (!dryRun) {
          await stampSignupDiscordId(db, seat.id, [...hits][0]);
        }
      } else if (hits.size > 1) ambiguous++;
      else unmatched++;
    }
    guilds.push({
      slug, discordGuildId: dgid, rosterSeeded,
      seatsTotal: (seats || []).length, stamped, ambiguous, unmatched,
    });
    totals.rosterSeeded += rosterSeeded;
    totals.seatsTotal += (seats || []).length;
    totals.stamped += stamped; totals.ambiguous += ambiguous; totals.unmatched += unmatched;
  }
  return { dryRun, guilds, totals };
}

/* ---------- Creator stamps backfill ----------
 * Backfill leader identity for legacy teams. Teams created before
 * a recorded creator have only the created_by display string
 * (hand-typed on REST creation; a hardcoded placeholder on GraphQL
 * creation) and no authoritative identity, so the leader-only
 * disband/delete rule could never apply to them. Backfill accepts
 * only unambiguous evidence: created_by matches a user's Discord
 * global name (users.username, stored at login) or their nick
 * snapshot in the guild's bound server (user_guild_nicks), with
 * exactly one candidate (bound guilds add a membership check:
 * guilds_json includes the server, or the nick snapshot itself is
 * membership evidence). Placeholders, no match and multiple
 * candidates are left untouched (leaderless; only the admin path can
 * delete). Never guess, never fuzzy-match. dryRun reports only.
 * Idempotent: only rows with an empty creator_user_id are
 * processed. Matching runs in Discord-ID space (names and nick
 * snapshots are Discord-side evidence); the stamp writes the
 * matched user's typed user ID. */
export interface CreatorBackfillGroup {
  tenant: string; createdBy: string; cars: number; outcome: string;
  matchedDiscordId: string | null; candidates: number;
}
export interface CreatorBackfillReport {
  dryRun: boolean;
  totals: {
    events: number; alreadyStamped: number; considered: number; backfilled: number;
    placeholder: number; noMatch: number; ambiguous: number;
  };
  groups: CreatorBackfillGroup[];
}

const CREATOR_PLACEHOLDERS = new Set(['', '热心侠客', '热心车友']);

export async function runCreatorBackfillStamps(
  db: D1Database, dryRun: boolean,
): Promise<CreatorBackfillReport> {
  // User directory: global name -> discord_id set; membership: discord_id -> server set
  const userRows = await listUsersDirectory(db);
  const userIdByDiscord = new Map<string, number>();
  for (const u of userRows) userIdByDiscord.set(String(u.discord_id), Number(u.id));
  const byGlobalName = new Map<string, Set<string>>();
  const memberOf = new Map<string, Set<string>>();
  for (const u of userRows) {
    const did = String(u.discord_id);
    const name = String(u.username || '').trim();
    if (name) {
      if (!byGlobalName.has(name)) byGlobalName.set(name, new Set());
      byGlobalName.get(name)!.add(did);
    }
    let guildIds = new Set<string>();
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      if (Array.isArray(gs)) guildIds = new Set(gs.map((g: any) => String(g && g.id)));
    } catch { /* corrupt guilds_json counts as no membership evidence */ }
    memberOf.set(did, guildIds);
  }
  // Server nick snapshot index: `${guild_id}|${nick}` -> discord_id set
  const nickIndex = new Map<string, Set<string>>();
  try {
    const nickRows = await listAllNicks(db);
    for (const n of nickRows) {
      const nick = String(n.nick || '').trim();
      if (!nick) continue;
      const key = String(n.guild_id) + '|' + nick;
      if (!nickIndex.has(key)) nickIndex.set(key, new Set());
      nickIndex.get(key)!.add(String(n.discord_id));
    }
  } catch { /* if the snapshot table is missing, match on global names only */ }
  const bindRows = await listSettingsByKey(db, 'discord_guild_id');
  const bindMap = new Map(bindRows.map((r) => [String(r.tenant), String(r.value || '')]));

  const cars = await listEventsForCreatorBackfill(db);
  const rep: CreatorBackfillReport = {
    dryRun,
    totals: {
      events: cars.length, alreadyStamped: 0, considered: 0, backfilled: 0,
      placeholder: 0, noMatch: 0, ambiguous: 0,
    },
    groups: [],
  };
  const groupMap = new Map<string, CreatorBackfillGroup>();
  const groupOf = (tenant: string, createdBy: string) => {
    const key = tenant + '|' + createdBy;
    if (!groupMap.has(key)) {
      const g: CreatorBackfillGroup = {
        tenant, createdBy, cars: 0, outcome: 'considered', matchedDiscordId: null, candidates: 0,
      };
      groupMap.set(key, g);
      rep.groups.push(g);
    }
    return groupMap.get(key)!;
  };
  const updates: Array<{ userId: number; eventId: number }> = [];
  for (const car of cars) {
    if (car.creator_user_id) {
      rep.totals.alreadyStamped++;
      continue;
    }
    rep.totals.considered++;
    const cb = String(car.created_by ?? '').trim();
    const g = groupOf(String(car.tenant), cb);
    g.cars++;
    if (CREATOR_PLACEHOLDERS.has(cb)) { rep.totals.placeholder++; g.outcome = 'placeholder'; continue; }
    const gid = bindMap.get(String(car.tenant)) || '';
    const cand = new Set<string>();
    for (const did of byGlobalName.get(cb) || []) cand.add(did);
    const nickHits: Set<string> = gid ? (nickIndex.get(gid + '|' + cb) || new Set()) : new Set();
    for (const did of nickHits) cand.add(did);
    // Guild scoping: bound guilds accept only that server's members (a
    // global-name hit needs a membership record; a nick-snapshot hit is
    // itself membership evidence, snapshots being fetched for members only).
    const scoped = gid
      ? [...cand].filter((did) => (memberOf.get(did) || new Set()).has(gid) || nickHits.has(did))
      : [...cand];
    g.candidates = scoped.length;
    if (scoped.length === 1) {
      g.outcome = 'matched';
      g.matchedDiscordId = scoped[0];
      rep.totals.backfilled++;
      updates.push({ userId: userIdByDiscord.get(scoped[0]) || 0, eventId: car.id });
    } else if (scoped.length === 0) {
      rep.totals.noMatch++;
      g.outcome = 'noMatch';
    } else {
      rep.totals.ambiguous++;
      g.outcome = 'ambiguous';
    }
  }
  if (!dryRun && updates.length) {
    await stampEventCreators(db, updates);
  }
  return rep;
}

/* ---------- Boss guide structured migration ----------
 * One-off materialization: parse bosses.guide text into the
 * structured columns using the legacy frontend's split rules, for
 * the GraphQL boss page. Idempotent: the result depends only on the
 * guide text. Kept as an operator action (not deleted with the
 * portal) because guide text can still be edited through the boss
 * update mutation, after which re-materialization is the refresh
 * path for the structured columns. */
export interface GuideMigrationEntry {
  id: number; name: string; mechanics: number; talents: number; shouts: number;
}

export async function runBossGuideStructuredMigration(
  db: D1Database,
): Promise<{ migrated: GuideMigrationEntry[] }> {
  const results = await listBossesWithGuide(db);
  const migrated: GuideMigrationEntry[] = [];
  for (const b of results) {
    const st = parseGuideStructured(b.guide);
    await updateBossFields(db, b.id, {
      mechanics_json: JSON.stringify(st.mechanics),
      talents_json: JSON.stringify(st.talents),
      shouts_json: JSON.stringify(st.shouts),
    });
    migrated.push({
      id: b.id, name: b.name,
      mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length,
    });
  }
  return { migrated };
}

/* ---------- Kunpeng dex backfill ----------
 * One-off content insert: the 鲲鹏图千山 dungeon (10-player, 传薪
 * season line) plus its two bosses with finalized guide text, which
 * the existing admin surface cannot create (there is no dungeon
 * create mutation, and the boss create mutation carries neither a
 * dungeon link nor a guide). All writes go through the dex
 * repositories. Idempotent: rows are matched by name first, missing
 * pieces are filled in, present pieces are left untouched, so a
 * repeat run creates nothing. The is_current switch is part of the
 * same run: the new dungeon takes the current slot for its size and
 * 玉魄染青苍 (the previous holder) is cleared. Guide text is frozen
 * from the researched drafts (2026-11-01): talent rows that could
 * not be sourced are omitted entirely rather than annotated, and a
 * later talent top-up lands through the boss update mutation plus
 * the structured migration, not by re-running this backfill (an
 * existing non-empty guide is never overwritten here). dryRun only
 * reports. The resolver chains the boss guide structured migration
 * after a real run, so the structured columns land in the same
 * operator action. */

const KUNPENG_DUNGEON_NAME = '鲲鹏图千山';
const KUNPENG_PREVIOUS_CURRENT = '玉魄染青苍';
const KUNPENG_BOSS_TALENT = '三线:进攻·气竭增伤 / 防守·机制减伤 / 策略·伤疗提升';
const KUNPENG_BOSS_SOURCE = '侠境·鲲鹏图千山(100级)';

const TIANYA_KE_GUIDE = `【说明】
以下机制按 16yanyun 机制详解、17173 上线日速通攻略与切游指挥攻略交叉整理，细节以游戏内为准。天涯客为侠境「鲲鹏图千山」老一，全程绕"伞"打转。天赋条目为攻略口径反推、未经游戏内逐字核对，引用时请留意。

【机制】
1.核心：伞与凌云踏
看到什么：Boss 不停召唤伞，伞周围持续出范围伤害，伞被 Boss 技能打中就会碎，还会给全员叠减攻。
怎么做：全员必须会凌云踏骑伞——伞刷出来第一时间有人骑走、带离伤害区。伞不只是躲技能的工具，还是团灭计数器：流云无定阶段累计碎两把伞直接团灭，保伞就是保命。
📢 喊话：伞出来第一时间骑走，伞在人在！

2.战前配置：两队五人
看到什么：开打前的分队决定后面龙脊碎岳的轮换。
怎么做：2 奶 8 输出（远程多带几个更稳），分一队、二队各 5 人、每队 1 个奶，后面所有分组机制都按这个队形走，不要临时乱组。
📢 喊话：按一队二队站好，奶各队一个，别串队！

3.流云→单伞骑乘
看到什么：Boss 召唤一把伞，伞脚下持续冒范围伤害。
怎么做：指派一名机动输出立刻凌云踏上伞，把伞带出 Boss 的技能范围慢慢溜。减速技能能压伞的移速，不好控伞的人先给伞挂减速。
📢 喊话：流云伞出来了，指定的人去骑，其他人别碰！

4.流云无定/流云无定·破→多人保伞
看到什么：一次刷 4 把伞，·破阶段刷 6 把，规则和单伞一样，但全场累计碎两把就团灭。
怎么做：开打前就定好 4 到 6 名骑伞手，一人盯一把，刷出立刻上伞带走。这个阶段碎一把全员减攻，碎第二把直接灭，骑伞手别贪输出。
📢 喊话：四把伞（六把伞），一人一把，碎两把就灭，保伞第一！

5.千机化伞→两伞相撞
看到什么：刷出两把会移动的伞，路过的地方留伤害，每 20 秒还有一次全屏 AoE 带易伤。
怎么做：这次反过来——两名输出骑上伞，操控两把伞迎面相撞，两伞同归于尽机制就破了。别躲着不撞，拖得越久全屏 AoE 叠得越多。
📢 喊话：两把伞骑上去，对撞！撞掉就安全了！

6.千机化伞·破→撞伞破分身
看到什么：撞伞的同时场上多一个打不动的黑影分身，点名追一个人，分身周围持续掉血。
怎么做：被点名的人把分身带去离人群最远的角；两名骑伞的人把伞骑到分身身上相撞，分身会进气竭，这时全员转火集火秒掉。注意：被点名的人要是被分身打死，Boss 直接回 50% 血，点名者宁可不输出也要活着。
📢 喊话：分身点名往外带！骑伞的撞分身，气竭了全员转火！

7.千机化戟→全员飞伞进圈
看到什么：刷出 10 把飞伞，场上出现黑圈，不进圈的人读条结束直接被秒。
怎么做：全团按左右分两组半场站位，飞伞一出每人抢一把飞进自己半场的黑圈，进了风场立刻下伞。伞别往 Boss 身边凑，容易被打碎；红圈（环刃断伞）刷到伞的位置先把伞带出去再说。
📢 喊话：十把伞一人一把，飞进黑圈就下伞，别磨蹭！

8.神机化龙→伞下躲二段
看到什么：黄圈点名两个人，斩击分两段：第一段不致死，第二段必杀。
怎么做：两个被点名的人先集合，第一段一起硬抗，第二段前两人一起站到同一把伞正下方躲过去。别各躲各的，第二段只有伞下是安全区。
📢 喊话：化龙点名，两个人集合，第一段硬抗，第二段一起进伞下！

9.孤鸿掠雪→背靠场心吃击退
看到什么：Boss 读条，读完把除了坦克以外的人全部击退。
怎么做：坦克提前把 Boss 拉到场地边缘、面朝外，其他九个人站到 Boss 背后集合（背对场地中心）——这样被击退是往场心里飞，不会掉出场外。落地按指挥衔接起跳，别在边缘发呆。
📢 喊话：孤鸿掠雪，坦克拉边，全员站 Boss 背后，往里飞不慌！

10.暴雨梨花→分散卸势
看到什么：随机点名撒梨花针，卸势失败会叠易伤还会炸到队友。
怎么做：被点名的人立刻远离人群分散站好，看准时机卸势，一波都别漏——天赋也是按"两波全卸"卡的。奶妈盯紧卸势失败者的血。
📢 喊话：暴雨梨花，点名散开，针看好了一起卸！

11.龙脊碎岳→分组轮换卸势破盾
看到什么：Boss 套上护盾、召唤 10 把飞伞，开始读条，读完是全屏高伤；圈里没伞、或者进圈卸势成功的人少于 3 个，直接团灭。
怎么做：先派人把一把飞伞运进圈里放好。然后一队 5 人进圈卸势（卸完有 Debuff 不能连进），换二队 5 人进第二轮，如此轮换；卸势成功能拿增伤、Boss 还会力竭，输出趁力竭全力破盾，25 秒倒计时前必须破掉。奶妈这个阶段压力最大，减伤提前交。
📢 喊话：伞先进圈！一队进圈卸势，换二队，力竭了全员爆发破盾！

12.龙脊碎岳·破/·极→守圈与中场轮换
看到什么：·破多两个分身，读条结束会攻击黄圈，攻击时黄圈里没伞，全员吃 4 层易伤 40 秒；·极是 Boss 回到中场开红圈再走一轮卸势。
怎么做：·破提前安排两个机动的人操飞伞运进黄圈，圈变绿就是挡住了；·极由一个人把伞放进中间红圈后下伞，两组照旧轮流进圈卸势，每轮至少成功 3 人，循环到 Boss 倒下。
📢 喊话：黄圈送伞！中场红圈放伞，两组轮换卸势，每轮至少成三个！

【天赋·逐条说明】
（以下为攻略口径反推，未经游戏内逐字核对；正式回填前需以游戏内天赋页原文校准。）
1-2：暴雨梨花针两波点名，全员分散站位并全部卸势成功。
1-3：流云与流云无定（含四人伞、六人伞与单人伞）全程不碎任何一把伞。
2-2：神机化龙点名连点两次，其中至少一次成功躲入伞下（切游稿原文简写为"神龙点名的G伞，连点两次，g其中一次即可"，措辞为攻略圈简写，正式回填需按游戏内原文改写）。
2-3：龙脊碎岳阶段提前把伞放好位置，第一次卸势由 7 名输出进圈、第二次换坦克与奶妈进圈，并在倒计时 25 秒前破盾。`;

const PENG_GUIDE = `【说明】
以下机制按 16yanyun 机制详解与切游指挥攻略交叉整理（技能名从官方更新日志口径作"司南"），细节以游戏内为准。鹏为侠境「鲲鹏图千山」老二，墨山道长老，全程绕"磁球"与"感电连线"打转。天赋条目为攻略口径反推、未经游戏内逐字核对，引用时请留意。

【机制】
1.核心：磁球与感电连线
看到什么：开场场上有 3 个磁球，是整场的核心道具。靠近磁球按 F 交互能拿到"感电"Buff：两个带感电的人靠近会拉出一条磁力连线，三个人能拉成三角连线——救人、破盾全靠这条线。
怎么做：开打前定死 3 名远程输出做感电组，三角站位、司南剑排剑点、飞天集合点全部提前标好。其他人不要乱碰磁球。切记：身上带感电时无法卸势，碰到电斩只能闪避。
📢 喊话：感电组就位，其他人别碰磁球！

2.基础剑技→连斩/磁能斩/电斩
看到什么：连斩是扇形四连击；磁能斩是扇形加地面金圈的组合技，中一下非常痛；电斩是矩形剑气。
怎么做：连斩正常卸势或闪避；磁能斩直接走位或闪避出扇形和金圈，别贪刀；电斩看好矩形预警提前闪，带感电的人更要先闪为准。
📢 喊话：磁能斩散开！带感电的别卸势，闪！

3.牢笼·黜→连线切割救人
看到什么：一名队友被金圈点名，锁进地面的牢笼动弹不得。
怎么做：两名感电组立刻靠近拉出一条连线（两人贴近成线、但不要贴脸相撞），用这条线横切穿过被锁的队友，把他弹出牢笼。救完马上回归站位。
📢 喊话：牢笼点名！感电组拉线，切过去救人！

4.万磁天引→三角连线破盾
看到什么：Boss 读条，身上罩起护盾。
怎么做：感电组 3 人分别站到 Boss 三侧，把 Boss 围在三角形正中间，三条连线成型后 3 人对 Boss 有高额增伤，全团趁这个窗口集火破盾。3 人彼此别靠太近，站位开打前按标点定死；其他人站在三角里面输出。
📢 喊话：万磁天引！感电组三角站位，线成了，全团爆发破盾！

5.司南·黜→排剑到外场
看到什么：一名队友被金圈点名，落点生成一把司南剑，近战靠近会被弹开。
怎么做：被点名的人把剑带到外场指定标点放下，离磁球远一点，别放在连线路径上；远程第一时间集火打掉，近战别上去送。
📢 喊话：司南点名，往外场排剑！远程转火打掉！

6.司南·极→四剑齐落
看到什么：Boss 放金圈把人往中间吸，场中同时生成 4 把司南剑。
怎么做：被吸的人第一时间闪出金圈。4 把剑必须一起处理：全团先把四把剑的血量压齐，再在 5 秒窗口内一并打掉——击杀间隔超过 5 秒，没死的剑会复活，拖下去就是团灭。指挥不喊停手，谁也别先单秒任何一把。
📢 喊话：司南·极！先闪金圈，四把剑压齐血，一起打！

7.飞天金圈→标点抱团硬扛
看到什么：司南·极之后 Boss 飞上天，地面布满金圈，没有安全区。
怎么做：全员立刻到队长提前标好的集合点抱团，奶妈放奶圈、开金身，全团硬扛过这个阶段，结束后再散开回站位。
📢 喊话：Boss 飞天了，去标点集合，奶妈奶圈金身开起来！

8.牢笼·浮→跳线救单人
看到什么：一名队友被锁到空中漂浮，地面连线够不到。
怎么做：两名感电组在被困者下方拉好连线，听口令同时起跳，用空中的连线穿过被困队友，把他切下来。
📢 喊话：浮空点名！感电组拉线，听口令一起跳！

9.牢笼·联·浮→三角网兜三人
看到什么：三名队友同时被锁到空中。
怎么做：三名被困者在空中尽量靠拢抱团；感电组 3 人在下方拉成三角连线，同时起跳，用三角网把三个人一起兜下来。这是全场配合门槛最高的一下，口令提前在语音里排好。
📢 喊话：三人上天！感电组三角就位，听我口令一起跳！

【天赋·逐条说明】
（以下为攻略口径反推，未经游戏内逐字核对；正式回填前需以游戏内天赋页原文校准。）
1-3：牢笼·联·浮三人上天时，感电组提前就位吃感电、一次配合救下三人；进阶打法为压血打——Boss 磨到残血时停手，等三人点名上天的瞬间集火秒掉 Boss。
2-1：司南剑献祭流——带柳诗诗同行，她被点名时落点大概率固定，提前标好排剑点；其余人被点名都去同一点重合放剑，在 5 秒内打掉该点出现的剑，全程至少打掉过一把剑。
2-3：司南·极四剑齐落——提前贴磁力球占位，被金圈吸住用位移技返回；全员笛子（百鬼）拉满，出剑前 1 秒开笛加百鬼，在 5 秒内齐爆四剑（或四名拳输出一人点掉一把）；打完剑立刻去磁力球旁的安全点集合由奶妈抬血，且不吃随后的黄圈伤害。（切游稿作者自注：其队伍 5 秒打完实测可行，但因吃到黄圈伤害未达成此条。）`;

export interface KunpengDexBossEntry {
  id: number | null; name: string; created: boolean; guideWritten: boolean;
  mechanics: number; talents: number; shouts: number;
}
export interface KunpengDexBackfillReport {
  dryRun: boolean;
  dungeonCreated: boolean;
  dungeonName: string;
  bossesCreated: number;
  previousCurrentCleared: boolean;
  bosses: KunpengDexBossEntry[];
}

const KUNPENG_BOSSES: Array<{ name: string; note: string; sortOrder: number; guide: string }> = [
  { name: '天涯客', note: '伞与凌云踏机制对策（保伞/撞伞/分组卸势破盾）', sortOrder: 54, guide: TIANYA_KE_GUIDE },
  { name: '鹏', note: '墨山道长老（剧情称谓「鹏长老」）；磁球感电连线救人/三角破盾机制对策', sortOrder: 55, guide: PENG_GUIDE },
];

export async function runKunpengDexBackfill(
  db: D1Database, dryRun: boolean,
): Promise<KunpengDexBackfillReport> {
  // Dungeon: create when missing (the insert writes legacy defaults,
  // so the real field values land through a follow-up field patch);
  // when present, fill still-missing fields only and converge the
  // current flag, which is the point of this backfill.
  const existingDungeon = await getDungeonByName(db, KUNPENG_DUNGEON_NAME);
  const dungeonCreated = !existingDungeon;
  if (!dryRun) {
    let dungeonId: number;
    if (existingDungeon) {
      dungeonId = existingDungeon.id;
      const patch: Record<string, unknown> = {};
      if (!existingDungeon.season) patch.season = 'S5';
      if (!existingDungeon.category) patch.category = '传薪';
      if (!existingDungeon.level) patch.level = 100;
      if (!existingDungeon.version || existingDungeon.version === 'legacy') patch.version = 'intl-v2.3';
      if (!existingDungeon.sort_order) patch.sort_order = 9;
      if (!existingDungeon.is_current) patch.is_current = 1;
      if (Object.keys(patch).length) await updateDungeonFields(db, dungeonId, patch);
    } else {
      const meta = await insertDungeonDex(db, {
        name: KUNPENG_DUNGEON_NAME, size: 10, season: 'S5', category: '传薪', level: 100,
      });
      dungeonId = meta.last_row_id;
      await updateDungeonFields(db, dungeonId, { version: 'intl-v2.3', sort_order: 9, is_current: 1 });
    }
  }
  // Previous current holder for this size loses the flag in the same
  // run; the report says whether this run is the one clearing it.
  const previous = await getDungeonByName(db, KUNPENG_PREVIOUS_CURRENT);
  const previousCurrentCleared = !!(previous && previous.is_current);
  if (!dryRun && previousCurrentCleared && previous) {
    await updateDungeonFields(db, previous.id, { is_current: 0 });
  }
  // Bosses: create with the dungeon link when missing; write the
  // guide only into a row whose guide is still empty.
  const bosses: KunpengDexBossEntry[] = [];
  let bossesCreated = 0;
  for (const def of KUNPENG_BOSSES) {
    const found = await getBossIdByNameAndDungeon(db, def.name, KUNPENG_DUNGEON_NAME);
    const created = !found;
    let guideWritten = false;
    let bossId: number | null = found ? found.id : null;
    if (created) {
      bossesCreated++;
      guideWritten = true;
      if (!dryRun) {
        const meta = await insertBoss(db, {
          name: def.name, talent: KUNPENG_BOSS_TALENT, source: KUNPENG_BOSS_SOURCE,
          note: def.note, sortOrder: def.sortOrder, dungeon: KUNPENG_DUNGEON_NAME,
        });
        bossId = meta.last_row_id;
        await updateBossFields(db, meta.last_row_id, { guide: def.guide });
      }
    } else if (found) {
      const row = await getBossById(db, found.id);
      if (row && !row.guide) {
        guideWritten = true;
        if (!dryRun) await updateBossFields(db, found.id, { guide: def.guide });
      }
    }
    const st = parseGuideStructured(def.guide);
    bosses.push({
      id: bossId, name: def.name, created, guideWritten,
      mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length,
    });
  }
  return {
    dryRun, dungeonCreated, dungeonName: KUNPENG_DUNGEON_NAME,
    bossesCreated, previousCurrentCleared, bosses,
  };
}
