// Read-only HTTP/GraphQL acceptance probes for the release pipeline.
// Used against the release Preview after publish and against production
// after auto-promote (prod failure triggers the pipeline's rollback step).
// Anonymous read-only only: the preview shares the production D1 by
// database_id, so probes must never write.
//
// Usage:
//   node scripts/ci/probes.mjs --base https://release-yanyun.tbdlab.workers.dev \
//     --tenant jijiguagua --list-tenant demo [--also-tenant demo]
//   node scripts/ci/probes.mjs --base https://yanyun.app \
//     --tenant jijiguagua --list-tenant jijiguagua
//
// Exit code 0 = every probe passed, 1 = at least one failed.
import process from 'node:process';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
const BASE = (args.base || '').replace(/\/$/, '');
const TENANT = args.tenant || 'jijiguagua';
const LIST_TENANT = args['list-tenant'] || TENANT;
const ALSO_TENANT = args['also-tenant'] || null;
if (!BASE) { console.error('missing --base'); process.exit(2); }

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; fails.push(name); console.log(`FAIL  ${name}${extra ? ' — ' + String(extra).slice(0, 200) : ''}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with retries on network errors / 5xx only (fresh deploys can take a
// few seconds to propagate). Assertion-level mismatches never retry.
async function fetchRetry(url, init, tries = 6) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, init);
      if (r.status >= 500 && i < tries - 1) { await sleep(5000); continue; }
      return r;
    } catch (e) { lastErr = e; if (i < tries - 1) await sleep(5000); }
  }
  throw lastErr || new Error('fetch failed: ' + url);
}

async function gql(query, locale) {
  const r = await fetchRetry(`${BASE}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-locale': locale },
    body: JSON.stringify({ query }),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}

/* 1. SPA root */
{
  const r = await fetchRetry(`${BASE}/`);
  const html = await r.text();
  check('SPA / returns 200', r.status === 200, 'status=' + r.status);
  check('SPA / serves the app shell', html.includes('id="root"'), 'no #root in HTML');
}

/* 2. legalPage in all five locales (x-locale header negotiation) */
const PRIVACY_TITLES = {
  'zh-CN': '隐私政策', 'zh-TW': '隱私政策', 'en': 'Privacy Policy',
  'es': 'Política de privacidad', 'fr': 'Politique de confidentialité',
};
for (const [locale, title] of Object.entries(PRIVACY_TITLES)) {
  const { status, body } = await gql('{ legalPage(kind: PRIVACY) { title sections { heading } } }', locale);
  const got = body?.data?.legalPage;
  check(`legalPage PRIVACY ${locale}`,
    status === 200 && !body?.errors && got?.title === title && (got?.sections?.length || 0) > 0,
    `status=${status} title=${JSON.stringify(got?.title)} errors=${JSON.stringify(body?.errors || null)}`);
}
{
  const { body } = await gql('{ legalPage(kind: TERMS) { title } }', 'zh-CN');
  check('legalPage TERMS zh-CN', body?.data?.legalPage?.title === '服务条款', JSON.stringify(body?.data?.legalPage?.title));
  const en = await gql('{ legalPage(kind: TERMS) { title } }', 'en');
  check('legalPage TERMS en', en.body?.data?.legalPage?.title === 'Terms of Service', JSON.stringify(en.body?.data?.legalPage?.title));
}

/* 3. Public guild card channel (replaces the retired /api/tenants
 * directory read): the OG card query answers existence + name for
 * any public guild, bound or not; the slug enumeration carries the
 * directory's visibility rule. */
{
  const { body } = await gql(`{ ogGuildCard(slug: "${TENANT}") { exists name } ogGuildSlugs }`);
  const card = body?.data?.ogGuildCard;
  check(`ogGuildCard ${TENANT} exists + name`, card?.exists === true && typeof card?.name === 'string' && card.name.length > 0,
    JSON.stringify(card));
  const slugs = body?.data?.ogGuildSlugs || [];
  check(`ogGuildSlugs contains ${TENANT}`, slugs.includes(TENANT), 'slugs=' + slugs.join(','));
  if (ALSO_TENANT) check(`ogGuildSlugs contains ${ALSO_TENANT}`, slugs.includes(ALSO_TENANT), 'slugs=' + slugs.join(','));
}

/* 4. Weekly activity count + car card (read-only). The count is the
 * OG card's server-side week count (same predicates the retired
 * REST week list used). A car detail is only anonymously readable
 * for unbound guilds (demo on preview): bound guilds answer through
 * the same ogCarCard channel the OG worker uses, which needs an id
 * the anonymous surface does not enumerate — on prod the count +
 * exists checks are the probe, and the car card is covered by the
 * OG worker's own harness + section-7 live card checks. */
{
  const from = Math.floor(Date.now() / 1000) - 7 * 86400;
  const to = Math.floor(Date.now() / 1000) + 7 * 86400;
  const { body } = await gql(`{ ogGuildCard(slug: "${LIST_TENANT}") { exists weekActivityCount(fromUtc: ${from}, toUtc: ${to}) } }`);
  const card = body?.data?.ogGuildCard;
  check(`ogGuildCard ${LIST_TENANT} weekActivityCount is a number`,
    card?.exists === true && typeof card?.weekActivityCount === 'number',
    JSON.stringify(card));
  const { body: lb } = await gql(`{ viewer { guild(slug: "${LIST_TENANT}") { __typename ... on GuildReadOnly { groupings(tab: ACTIVITY) { groupings { id title } } } } } }`);
  const groupings = lb?.data?.viewer?.guild?.groupings?.groupings;
  if (Array.isArray(groupings) && groupings.length > 0) {
    const first = groupings[0];
    const { body: cb } = await gql(`{ ogCarCard(slug: "${LIST_TENANT}", id: "${first.id}") { title } }`);
    check(`ogCarCard ${LIST_TENANT}/${first.id} returns title`,
      typeof cb?.data?.ogCarCard?.title === 'string',
      JSON.stringify(cb?.data?.ogCarCard));
  } else {
    console.log('SKIP  ogCarCard detail (no anonymously enumerable car for ' + LIST_TENANT + ')');
  }
}

/* 5. Guild avatar unset shape: no avatar uploaded yet -> exact 404 */
{
  const r = await fetchRetry(`${BASE}/guilds/${TENANT}/avatar`);
  check(`avatar ${TENANT} unset -> 404`, r.status === 404, 'status=' + r.status);
}

console.log(`\nprobes: ${pass} passed, ${fail} failed${fails.length ? ' — ' + fails.join('; ') : ''}`);
process.exit(fail ? 1 : 0);
