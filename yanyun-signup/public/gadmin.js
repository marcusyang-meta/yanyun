// 百业报名站 · 管理后台逻辑
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPE_NAME = { activity: '双十人本', talent: '天赋组队', race: '竞速' };
const SLUG = (location.pathname.split('/').filter(Boolean)[0] || '');
const API = '/api/' + SLUG + '/admin';
const PUB = '/api/' + SLUG;
let token = localStorage.getItem('yy_admin_token_' + SLUG) || '';
let curEvId = null;
let curEv = null;

async function api(path, opts = {}) {
  opts.headers = { ...(opts.headers || {}), authorization: 'Bearer ' + token };
  const r = await fetch(path, opts);
  if (r.status === 401) { logout(); throw new Error('登录已过期, 请重新登录'); }
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = await r.json();
    if (!j.ok) throw new Error(j.message || '请求失败');
    return j;
  }
  return r;
}
function logout() {
  token = ''; localStorage.removeItem('yy_admin_token_' + SLUG);
  $('#dash').style.display = 'none'; $('#loginBox').style.display = 'block';
}

/* ---- 登录 ---- */
$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#loginMsg');
  msg.className = 'msg'; msg.textContent = '登录中…';
  try {
    const r = await fetch(API + '/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: new FormData(e.target).get('password') }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.message);
    token = j.token; localStorage.setItem('yy_admin_token_' + SLUG, token);
    $('#loginBox').style.display = 'none'; $('#dash').style.display = 'block';
    boot();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};
$('#logoutBtn').onclick = logout;

async function boot() {
  await loadProfile();
  await loadAvatar();
  await loadEvents();
}

/* ---- 百业头像 (直传: 前端裁方/缩放/压到 ≤400KB, 服务端复验类型与大小) ---- */
async function loadAvatar() {
  try {
    const j = await api(API + '/avatar');
    const img = $('#avatarPreview'), empty = $('#avatarEmpty'), del = $('#avatarDelBtn');
    if (j.hasAvatar && j.avatarUrl) {
      img.src = j.avatarUrl; img.style.display = 'block';
      empty.style.display = 'none'; del.style.display = '';
    } else {
      img.removeAttribute('src'); img.style.display = 'none';
      empty.style.display = 'flex'; del.style.display = 'none';
    }
  } catch {}
}

// 选图 -> 居中裁方 -> canvas 缩到 ≤512 -> 按原格式编码; 超 400KB 先
// 降边长再降质量, 仍超限报错让用户换图 (服务端还会以 400KB 复验)。
async function prepareAvatarBlob(file) {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2, sy = (bmp.height - side) / 2;
  const type = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ? file.type : 'image/png';
  const toBlob = (size, quality) => new Promise((resolve) => {
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    cv.getContext('2d').drawImage(bmp, sx, sy, side, side, 0, 0, size, size);
    cv.toBlob(resolve, type, quality);
  });
  let size = Math.min(512, side);
  let blob = await toBlob(size, 0.92);
  while (blob && blob.size > 400 * 1024 && size > 96) {
    size = Math.floor(size * 0.75);
    blob = await toBlob(size, 0.85);
  }
  if (blob && blob.size > 400 * 1024 && type !== 'image/png') blob = await toBlob(size, 0.6);
  if (!blob) throw new Error('图片处理失败, 请换一张图重试');
  if (blob.size > 400 * 1024) throw new Error('图片压缩后仍超过 400KB, 请换一张更简单的图');
  return { blob, type };
}

$('#avatarPickBtn').onclick = () => $('#avatarFile').click();
$('#avatarFile').onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const msg = $('#avatarMsg');
  msg.className = 'msg'; msg.textContent = '处理中…';
  try {
    const { blob, type } = await prepareAvatarBlob(file);
    await api(API + '/avatar', { method: 'PUT', headers: { 'content-type': type }, body: blob });
    msg.textContent = '头像已更新';
    await loadAvatar();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};
$('#avatarDelBtn').onclick = async () => {
  const msg = $('#avatarMsg');
  try {
    await api(API + '/avatar', { method: 'DELETE' });
    msg.className = 'msg'; msg.textContent = '头像已删除';
    await loadAvatar();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};

async function loadProfile() {
  const { profile } = await api(API + '/profile');
  const f = $('#settingsForm');
  f.guild_name.value = profile.guild_name || '';
  f.announcement.value = profile.announcement || '';
  try {
    const d = await api(API + '/discord');
    f.discord_webhook.value = d.discord_webhook || '';
    f.discord_guild_id.value = d.discord_guild_id || '';
  } catch {}
}

$('#settingsForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#setMsg');
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  try {
    await api(API + '/profile', { method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ guild_name: data.guild_name, announcement: data.announcement }) });
    await api(API + '/discord', { method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ discord_webhook: data.discord_webhook || '', discord_guild_id: (data.discord_guild_id || '').trim() }) });
    msg.className = 'msg ok'; msg.textContent = '已保存';
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};

/* ---- 活动列表 ---- */
async function loadEvents() {
  const { events } = await api(API + '/events');
  $('#evList').innerHTML = events.length ? events.map((e) => `
    <div class="ev-row">
      <div><div class="t">${esc(e.title)}</div>
      <div class="m"><span class="badge ${e.type}">${TYPE_NAME[e.type]}</span> ${e.origin === 'member' ? '<span class="badge car">车友发车</span>' : ''} ${e.status === 'open' ? '报名中' : '已截止'} · ${e.signup_count}/${e.max_slots}人 ${e.starts_at_utc ? '· ' + new Date(e.starts_at_utc * 1000).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : (e.starts_at ? '· ' + esc(e.starts_at.replace('T', ' ')) : '')}</div></div>
      <button class="ghost" data-id="${e.id}">管理 →</button>
    </div>`).join('') : '<div class="empty">还没有活动, 点右上新建一个</div>';
  $('#evList').querySelectorAll('button').forEach((b) => b.onclick = () => openManage(b.dataset.id, events));
}

/* ---- 新建/编辑 ---- */
$('#newEvBtn').onclick = () => {
  $('#evModalTitle').textContent = '新建活动';
  $('#evForm').reset(); $('#evForm').id.value = '';
  $('#evModal').classList.add('open');
};
$('#evCancel').onclick = () => $('#evModal').classList.remove('open');
$('#evForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#evMsg');
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  const id = data.id; delete data.id;
  if (data.starts_at) {
    data.starts_at_utc = Math.floor(new Date(data.starts_at).getTime() / 1000);
    data.starts_at = data.starts_at.replace('T', ' ') + ':00';
  }
  try {
    if (id) await api(API + '/events/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    else await api(API + '/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    $('#evModal').classList.remove('open');
    loadEvents();
    if (curEvId) openManage(curEvId);
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};

/* ---- 单个活动管理 ---- */
async function openManage(id, cache) {
  curEvId = id;
  const { events } = cache ? { events: cache } : await api(API + '/events');
  curEv = events.find((e) => e.id == id);
  if (!curEv) return;
  $('#evTitle').textContent = curEv.title;
  $('#evDetailBox').hidden = false;
  $('#evDetailBox').scrollIntoView({ behavior: 'smooth' });
  await loadSignups();
  $('#raceBox').hidden = curEv.type !== 'race';
  if (curEv.type === 'race') await loadResults();
}
$('#evBack').onclick = () => { $('#evDetailBox').hidden = true; curEvId = null; loadEvents(); };

$('#editEvBtn').onclick = () => {
  $('#evModalTitle').textContent = '编辑活动';
  const f = $('#evForm');
  f.id.value = curEv.id; f.title.value = curEv.title; f.type.value = curEv.type;
  f.starts_at.value = (curEv.starts_at || '').slice(0, 16).replace(' ', 'T');
  f.max_slots.value = curEv.max_slots; f.meet_info.value = curEv.meet_info || '';
  f.description.value = curEv.description || '';
  $('#evModal').classList.add('open');
};
$('#closeEvBtn').onclick = async () => {
  const to = curEv.status === 'open' ? 'closed' : 'open';
  if (!confirm(curEv.status === 'open' ? '截止该活动报名?' : '重新开放报名?')) return;
  await api(API + '/events/' + curEvId, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: to }) });
  openManage(curEvId);
};
$('#delEvBtn').onclick = async () => {
  if (!confirm('删除活动及全部报名/成绩? 不可恢复!')) return;
  await api(API + '/events/' + curEvId, { method: 'DELETE' });
  $('#evDetailBox').hidden = true; curEvId = null; loadEvents();
};
$('#exportBtn').onclick = async () => {
  const r = await api(API + '/events/' + curEvId + '/export.csv');
  const blob = await r.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '报名表.csv'; a.click();
  URL.revokeObjectURL(a.href);
};

async function loadSignups() {
  const { signups } = await api(`${API}/events/${curEvId}/signups`);
  $('#sgCount').textContent = signups.length + '人';
  $('#sgTable').innerHTML = `<tr><th>#</th><th>昵称</th><th>UID</th><th>职责</th><th>流派</th><th>联系方式</th><th>队伍/队员</th><th>备注</th><th></th></tr>` +
    signups.map((x, i) => `<tr>
      <td>${i+1}</td><td>${esc(x.nickname)}</td><td>${esc(x.uid)}</td><td>${esc(x.role)}</td>
      <td>${esc(x.weapon)}</td><td>${esc(x.contact)}</td>
      <td>${esc([x.team_name, x.members].filter(Boolean).join(' / '))}</td>
      <td>${esc(x.note)}</td>
      <td><button class="danger" data-id="${x.id}">移除</button></td>
    </tr>`).join('');
  $('#sgTable').querySelectorAll('button').forEach((b) => b.onclick = async () => {
    if (!confirm('移除该报名?')) return;
    await api(API + '/signups/' + b.dataset.id, { method: 'DELETE' });
    loadSignups();
  });
}

$('#resultForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#resMsg');
  const data = Object.fromEntries(new FormData(e.target).entries());
  msg.className = 'msg'; msg.textContent = '登记中…';
  try {
    await api(`${API}/events/${curEvId}/results`, { method: 'POST',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    msg.className = 'msg ok'; msg.textContent = '已登记';
    e.target.reset(); loadResults();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};
async function loadResults() {
  const { results } = await api(PUB + '/events/' + curEvId);
  $('#resTable').innerHTML = `<tr><th>名次</th><th>队伍</th><th>成绩</th><th>队员</th><th></th></tr>` +
    (results.results || []).map((r, i) => `<tr>
      <td class="${i === 0 ? 'rank1' : ''}">${i+1}</td><td>${esc(r.team_name)}</td>
      <td>${esc(r.time_str)}</td><td>${esc(r.members)}</td>
      <td><button class="danger" data-id="${r.id}">删除</button></td>
    </tr>`).join('');
  $('#resTable').querySelectorAll('button').forEach((b) => b.onclick = async () => {
    if (!confirm('删除该成绩?')) return;
    await api(API + '/results/' + b.dataset.id, { method: 'DELETE' });
    loadResults();
  });
}

if (token) { $('#loginBox').style.display = 'none'; $('#dash').style.display = 'block'; boot().catch(() => logout()); }

