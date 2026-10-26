// 超管后台: 百业管理 + 全站设置 + 图鉴
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token = localStorage.getItem('yy_hub_token') || '';

async function api(path, opts = {}) {
  opts.headers = { ...(opts.headers || {}), authorization: 'Bearer ' + token };
  const r = await fetch(path, opts);
  if (r.status === 401) { logout(); throw new Error('登录已过期, 请重新登录'); }
  const j = await r.json();
  if (!j.ok) throw new Error(j.message || '请求失败');
  return j;
}
function logout() {
  token = ''; localStorage.removeItem('yy_hub_token');
  $('#dash').style.display = 'none'; $('#loginBox').style.display = 'block';
}

$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#loginMsg');
  msg.className = 'msg'; msg.textContent = '登录中…';
  try {
    const r = await fetch('/api/hub/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: new FormData(e.target).get('password') }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.message);
    token = j.token; localStorage.setItem('yy_hub_token', token);
    $('#loginBox').style.display = 'none'; $('#dash').style.display = 'block';
    boot();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};
$('#logoutBtn').onclick = logout;

async function boot() { await loadSettings(); await loadTenants(); await loadReminders(); await loadHeirlooms(); await loadErrors(); await loadAudit(); await loadBackups(); await loadBosses(); await loadDungeons(); }

async function downloadAuthed(path, filename) {
  const r = await fetch(path, { headers: { authorization: 'Bearer ' + token } });
  if (r.status === 401) { logout(); throw new Error('登录已过期, 请重新登录'); }
  if (!r.ok) throw new Error('下载失败 (' + r.status + ')');
  const blob = await r.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

async function loadBackups() {
  const msg = $('#backupMsg');
  try {
    const { available, backups } = await api('/api/hub/backup/list');
    $('#backupSummary').textContent = available ? `共 ${backups.length} 份快照` : '备份存储未配置（BACKUPS 绑定缺失）';
    $('#backupTable').innerHTML = `<tr><th>快照</th><th>大小</th><th>时间</th><th></th></tr>` +
      (backups.map((b) => `<tr>
        <td style="font-family:monospace">${esc(b.key)}</td>
        <td>${(b.size / 1024).toFixed(1)} KB</td>
        <td style="white-space:nowrap">${esc(new Date(b.uploaded * 1000).toLocaleString())}</td>
        <td><button class="ghost" data-b="dl" data-key="${esc(b.key)}">下载</button></td>
      </tr>`).join('') || '<tr><td colspan="4" class="empty">暂无快照</td></tr>');
    $('#backupTable').querySelectorAll('button[data-b=dl]').forEach((btn) => btn.onclick = async () => {
      try { await downloadAuthed('/api/hub/backup/download?key=' + encodeURIComponent(btn.dataset.key), btn.dataset.key.split('/').pop()); }
      catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
    });
    msg.className = 'msg'; msg.textContent = '';
  } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
}
$('#backupRefresh').onclick = () => loadBackups();
$('#backupRun').onclick = async () => {
  const msg = $('#backupMsg');
  const btn = $('#backupRun');
  btn.disabled = true; btn.textContent = '备份中…';
  try {
    const { backup } = await api('/api/hub/backup/run', { method: 'POST' });
    msg.className = 'msg ok';
    msg.textContent = `已备份：${backup.key}（${backup.totalRows} 行，${(backup.bytes / 1024).toFixed(1)} KB）`;
    loadBackups();
  } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
  btn.disabled = false; btn.textContent = '立即备份到 R2';
};
$('#backupExport').onclick = async () => {
  const msg = $('#backupMsg');
  try { await downloadAuthed('/api/hub/backup/export', 'yanyun-backup-export.json'); }
  catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
};

async function searchLoginAs() {
  const msg = $('#loginAsMsg');
  const q = $('#loginAsQuery').value.trim();
  if (!q) { msg.className = 'msg bad'; msg.textContent = '先输入昵称或 Discord ID'; return; }
  msg.className = 'msg'; msg.textContent = '搜索中…';
  try {
    const { users } = await api('/api/hub/users?q=' + encodeURIComponent(q));
    $('#loginAsSummary').textContent = `共 ${users.length} 人`;
    $('#loginAsTable').innerHTML = `<tr><th>用户</th><th>Discord ID</th><th>命中服昵称</th><th></th></tr>` +
      (users.map((u) => `<tr>
        <td>${u.avatar ? '<img src="' + esc(u.avatar) + '" alt="" style="width:24px;height:24px;border-radius:50%;vertical-align:-6px;margin-right:6px">' : ''}${esc(u.name || '(无名)')}</td>
        <td style="font-family:monospace">${esc(u.discordId)}</td>
        <td>${esc(u.nick || '')}</td>
        <td><button class="primary" data-la="${esc(u.discordId)}" style="width:auto">以此身份登录</button></td>
      </tr>`).join('') || '<tr><td colspan="4" class="empty">没有匹配的用户</td></tr>');
    $('#loginAsTable').querySelectorAll('button[data-la]').forEach((b) => b.onclick = async () => {
      const hit = users.find((x) => x.discordId === b.dataset.la);
      if (!confirm(`以「${hit ? (hit.name || hit.discordId) : b.dataset.la}」的身份打开站点？代登录会话 30 分钟、完整读写，开始与退出都会留痕。`)) return;
      b.disabled = true; b.textContent = '登录中…';
      try {
        await api('/api/hub/login-as', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ discordId: b.dataset.la }) });
        location.href = '/';
      } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; b.disabled = false; b.textContent = '以此身份登录'; }
    });
    msg.className = 'msg'; msg.textContent = '';
  } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
}
$('#loginAsSearch').onclick = searchLoginAs;
$('#loginAsQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchLoginAs(); } });

let auditOffset = 0;
const AUDIT_PAGE = 50;
async function loadAudit() {
  const msg = $('#auditMsg');
  try {
    const tenant = $('#auditTenant').value.trim();
    const q = `?limit=${AUDIT_PAGE}&offset=${auditOffset}` + (tenant ? `&tenant=${encodeURIComponent(tenant)}` : '');
    const { entries, total } = await api('/api/hub/audit' + q);
    $('#auditSummary').textContent = `共 ${total} 条，第 ${total ? Math.floor(auditOffset / AUDIT_PAGE) + 1 : 0} 页`;
    $('#auditTable').innerHTML = `<tr><th>时间</th><th>操作者</th><th>动作</th><th>百业</th><th>摘要</th><th>IP</th></tr>` +
      (entries.map((r) => `<tr>
        <td style="white-space:nowrap">${esc(new Date(r.at * 1000).toLocaleString())}</td>
        <td>${esc(r.actor)}</td>
        <td style="font-family:monospace">${esc(r.action)}</td>
        <td>${esc(r.tenant || '')}</td>
        <td><span class="muted" style="font-family:monospace">${esc(r.summary || '')}</span></td>
        <td style="font-family:monospace">${esc(r.ip || '')}</td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty">暂无审计记录</td></tr>');
    $('#auditPrev').disabled = auditOffset <= 0;
    $('#auditNext').disabled = auditOffset + entries.length >= total;
    msg.className = 'msg'; msg.textContent = '';
  } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
}
$('#auditQuery').onclick = () => { auditOffset = 0; loadAudit(); };
$('#auditPrev').onclick = () => { auditOffset = Math.max(0, auditOffset - AUDIT_PAGE); loadAudit(); };
$('#auditNext').onclick = () => { auditOffset += AUDIT_PAGE; loadAudit(); };

async function loadErrors() {
  const msg = $('#errorMsg');
  try {
    const { errors, last24h } = await api('/api/hub/errors');
    $('#errorSummary').textContent = `近 24 小时共 ${last24h} 条。`;
    $('#errorTable').innerHTML = `<tr><th>时间</th><th>来源</th><th>错误</th><th>百业</th><th>上下文</th></tr>` +
      (errors.map((r) => `<tr>
        <td style="white-space:nowrap">${esc(new Date(r.at * 1000).toLocaleString())}</td>
        <td>${esc(r.source)}</td>
        <td>${esc(r.name ? r.name + ': ' : '')}${esc(r.message)}</td>
        <td>${esc(r.tenant || '')}</td>
        <td><span class="muted" style="font-family:monospace">${esc(r.context || '')}</span></td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty">暂无错误记录</td></tr>');
    msg.className = 'msg'; msg.textContent = '';
  } catch (e) { msg.className = 'msg bad'; msg.textContent = e.message; }
}

async function loadHeirlooms() {
  const { heirlooms } = await api('/api/hub/heirlooms');
  const fmtT = (sec) => sec ? new Date(sec * 1000).toLocaleString() : '—';
  $('#heirloomTable').innerHTML = `<tr><th>百业</th><th>Webhook</th><th>启用</th><th>上次推送</th><th>操作</th></tr>` +
    (heirlooms.map((r) => {
      const last = r.lastAt
        ? `${fmtT(r.lastAt)} ${REMINDER_STATUS[r.lastStatus] || ''}${r.lastEvent ? '（' + esc(r.lastEvent) + '）' : ''}${r.lastError ? '<br><span style="color:#c0392b">' + esc(r.lastError) + '</span>' : ''}`
        : '—';
      return `<tr>
      <td><a href="/${esc(r.slug)}" target="_blank">${esc(r.guild_name)}</a><br><span class="muted" style="font-family:monospace">/${esc(r.slug)}</span></td>
      <td>${r.webhookSet ? '<span style="font-family:monospace;font-size:12px">' + esc(r.webhookMasked) + '</span>' : '<span class="muted">未配置</span>'}
        <div style="display:flex;gap:6px;margin-top:6px">
          <input data-h="wh" data-slug="${esc(r.slug)}" placeholder="粘贴新 Webhook URL 替换" style="font-size:12px;width:220px">
          <button class="ghost" data-h="save" data-slug="${esc(r.slug)}">保存</button>
          ${r.webhookSet ? '<button class="ghost" data-h="clear" data-slug="' + esc(r.slug) + '">清除</button>' : ''}
        </div></td>
      <td><input type="checkbox" data-h="enabled" data-slug="${esc(r.slug)}"${r.enabled ? ' checked' : ''}${r.webhookSet ? '' : ' disabled title="先配置 Webhook"'}></td>
      <td style="font-size:12px">${last}</td>
      <td><button class="ghost" data-h="test" data-slug="${esc(r.slug)}"${r.webhookSet ? '' : ' disabled'}>发送测试</button></td>
    </tr>`;
    }).join('') || '<tr><td colspan="5" class="empty">暂无入驻百业</td></tr>');
  const msg = $('#heirloomMsg');
  const say = (ok, text) => { msg.className = 'msg ' + (ok ? 'ok' : 'bad'); msg.textContent = text; };
  $('#heirloomTable').querySelectorAll('button[data-h=save]').forEach((b) => b.onclick = async () => {
    const slug = b.dataset.slug;
    const input = document.querySelector(`input[data-h=wh][data-slug="${slug}"]`);
    const v = input.value.trim();
    if (!v) { say(false, '没有填写新链接：保持原样（如需删除请点「清除」）'); return; }
    try {
      await api('/api/hub/tenants/' + slug + '/heirloom', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ webhook: v }) });
      say(true, 'Webhook 已更新'); loadHeirlooms();
    } catch (e) { say(false, e.message); }
  });
  $('#heirloomTable').querySelectorAll('button[data-h=clear]').forEach((b) => b.onclick = async () => {
    const slug = b.dataset.slug;
    if (!confirm('清除该百业的传家宝 Webhook？传家宝推送将停止。')) return;
    try {
      await api('/api/hub/tenants/' + slug + '/heirloom', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ webhook: '' }) });
      say(true, 'Webhook 已清除'); loadHeirlooms();
    } catch (e) { say(false, e.message); }
  });
  $('#heirloomTable').querySelectorAll('input[data-h=enabled]').forEach((cb) => cb.onchange = async () => {
    try {
      await api('/api/hub/tenants/' + cb.dataset.slug + '/heirloom', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled: cb.checked }) });
      say(true, cb.checked ? '传家宝推送已启用' : '传家宝推送已停用'); loadHeirlooms();
    } catch (e) { say(false, e.message); cb.checked = !cb.checked; }
  });
  $('#heirloomTable').querySelectorAll('button[data-h=test]').forEach((b) => b.onclick = async () => {
    b.disabled = true; b.textContent = '发送中…';
    try {
      await api('/api/hub/tenants/' + b.dataset.slug + '/heirloom/test', { method: 'POST' });
      say(true, '测试消息已发送，去 Discord 频道确认');
    } catch (e) { say(false, e.message); }
    loadHeirlooms();
  });
}

const REMINDER_STATUS = { ok: '✅ 成功', error: '❌ 失败', 'test-ok': '✅ 测试成功', 'test-error': '❌ 测试失败' };
async function loadReminders() {
  const { reminders } = await api('/api/hub/reminders');
  const fmtT = (sec) => sec ? new Date(sec * 1000).toLocaleString() : '—';
  $('#reminderTable').innerHTML = `<tr><th>百业</th><th>Webhook</th><th>启用</th><th>上次发送</th><th>下次提醒</th><th>操作</th></tr>` +
    (reminders.map((r) => {
      const last = r.lastAt
        ? `${fmtT(r.lastAt)} ${REMINDER_STATUS[r.lastStatus] || ''}${r.lastEvent ? '（' + esc(r.lastEvent) + '）' : ''}${r.lastError ? '<br><span style="color:#c0392b">' + esc(r.lastError) + '</span>' : ''}`
        : '—';
      return `<tr>
      <td><a href="/${esc(r.slug)}" target="_blank">${esc(r.guild_name)}</a><br><span class="muted" style="font-family:monospace">/${esc(r.slug)}</span></td>
      <td>${r.webhookSet ? '<span style="font-family:monospace;font-size:12px">' + esc(r.webhookMasked) + '</span>' : '<span class="muted">未配置</span>'}
        <div style="display:flex;gap:6px;margin-top:6px">
          <input data-r="wh" data-slug="${esc(r.slug)}" placeholder="粘贴新 Webhook URL 替换" style="font-size:12px;width:220px">
          <button class="ghost" data-r="save" data-slug="${esc(r.slug)}">保存</button>
          ${r.webhookSet ? '<button class="ghost" data-r="clear" data-slug="' + esc(r.slug) + '">清除</button>' : ''}
        </div></td>
      <td><input type="checkbox" data-r="enabled" data-slug="${esc(r.slug)}"${r.enabled ? ' checked' : ''}${r.webhookSet ? '' : ' disabled title="先配置 Webhook"'}></td>
      <td style="font-size:12px">${last}</td>
      <td style="font-size:12px">${r.nextAlarmAt ? fmtT(Math.floor(r.nextAlarmAt / 1000)) : '—'}</td>
      <td><button class="ghost" data-r="test" data-slug="${esc(r.slug)}"${r.webhookSet ? '' : ' disabled'}>发送测试</button></td>
    </tr>`;
    }).join('') || '<tr><td colspan="6" class="empty">暂无入驻百业</td></tr>');
  const msg = $('#reminderMsg');
  const say = (ok, text) => { msg.className = 'msg ' + (ok ? 'ok' : 'bad'); msg.textContent = text; };
  $('#reminderTable').querySelectorAll('button[data-r=save]').forEach((b) => b.onclick = async () => {
    const slug = b.dataset.slug;
    const input = document.querySelector(`input[data-r=wh][data-slug="${slug}"]`);
    const v = input.value.trim();
    if (!v) { say(false, '没有填写新链接：保持原样（如需删除请点「清除」）'); return; }
    try {
      await api('/api/hub/tenants/' + slug + '/reminder', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ webhook: v }) });
      say(true, 'Webhook 已更新'); loadReminders();
    } catch (e) { say(false, e.message); }
  });
  $('#reminderTable').querySelectorAll('button[data-r=clear]').forEach((b) => b.onclick = async () => {
    const slug = b.dataset.slug;
    if (!confirm('清除该百业的 Webhook？开车提醒将停止。')) return;
    try {
      await api('/api/hub/tenants/' + slug + '/reminder', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ webhook: '' }) });
      say(true, 'Webhook 已清除'); loadReminders();
    } catch (e) { say(false, e.message); }
  });
  $('#reminderTable').querySelectorAll('input[data-r=enabled]').forEach((cb) => cb.onchange = async () => {
    try {
      await api('/api/hub/tenants/' + cb.dataset.slug + '/reminder', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled: cb.checked }) });
      say(true, cb.checked ? '开车提醒已启用' : '开车提醒已停用'); loadReminders();
    } catch (e) { say(false, e.message); cb.checked = !cb.checked; }
  });
  $('#reminderTable').querySelectorAll('button[data-r=test]').forEach((b) => b.onclick = async () => {
    b.disabled = true; b.textContent = '发送中…';
    try {
      await api('/api/hub/tenants/' + b.dataset.slug + '/reminder/test', { method: 'POST' });
      say(true, '测试消息已发送，去 Discord 频道确认');
    } catch (e) { say(false, e.message); }
    loadReminders();
  });
}

async function loadSettings() {
  const { settings } = await api('/api/hub/settings');
  $('#settingsForm').game_version.value = settings.game_version || '';
  $('#settingsForm').game_notice.value = settings.game_notice || '';
}
$('#settingsForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#setMsg');
  try {
    await api('/api/hub/settings', { method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target).entries())) });
    msg.className = 'msg ok'; msg.textContent = '已保存';
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};

async function loadTenants() {
  const { tenants } = await api('/api/hub/tenants');
  $('#tenantTable').innerHTML = `<tr><th>地址</th><th>百业</th><th>活动数</th><th>入驻时间</th><th></th></tr>` +
    (tenants.map((t) => `<tr><td style="font-family:monospace"><a href="/${esc(t.slug)}" target="_blank">/${esc(t.slug)}</a></td>
      <td>${esc(t.guild_name)}</td><td>${t.event_count}</td>
      <td>${esc(new Date(t.created_at * 1000).toLocaleDateString())}</td>
      <td><button class="danger" data-slug="${esc(t.slug)}">删除</button></td></tr>`).join('')
    || '<tr><td colspan="5" class="empty">暂无入驻百业</td></tr>');
  $('#tenantTable').querySelectorAll('button').forEach((b) => b.onclick = async () => {
    if (!confirm(`删除百业 /${b.dataset.slug} 及其全部活动/报名数据? 不可恢复!`)) return;
    await api('/api/hub/tenants/' + b.dataset.slug, { method: 'DELETE' });
    loadTenants();
  });
}

async function loadBosses() {
  const { bosses } = await api('/api/hub/bosses');
  $('#bossTable').innerHTML = `<tr><th>首领</th><th>天赋</th><th>来源</th><th>说明</th><th></th></tr>` +
    bosses.map((b) => `<tr><td>${esc(b.name)}</td><td>${esc(b.talent)}</td><td>${esc(b.source)}</td><td>${esc(b.note)}</td><td><button class="danger" data-id="${b.id}">删除</button></td></tr>`).join('');
  $('#bossTable').querySelectorAll('button').forEach((x) => x.onclick = async () => {
    if (!confirm('删除该首领?')) return;
    await api('/api/hub/bosses/' + x.dataset.id, { method: 'DELETE' });
    loadBosses();
  });
}
$('#bossForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('#bossMsg');
  const data = Object.fromEntries(new FormData(e.target).entries());
  msg.className = 'msg'; msg.textContent = '添加中…';
  try {
    await api('/api/hub/bosses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    msg.className = 'msg ok'; msg.textContent = '已添加';
    e.target.reset(); loadBosses();
  } catch (err) { msg.className = 'msg bad'; msg.textContent = err.message; }
};

async function loadDungeons() {
  const { dungeons } = await api('/api/hub/dungeons');
  $('#dungeonTable').innerHTML = `<tr><th>副本</th><th>规模</th><th>当期</th><th>视频攻略链接</th><th></th></tr>` + dungeons.map((d) =>
    `<tr><td>${esc(d.name)}</td><td>${d.size}人</td><td><input type="checkbox" data-id="${d.id}" data-k="cur"${d.is_current ? ' checked' : ''}></td><td><input data-id="${d.id}" data-k="url" value="${esc(d.video_url || '')}" placeholder="https://..." style="width:180px"><input data-id="${d.id}" data-k="title" value="${esc(d.video_title || '')}" placeholder="标题" style="width:120px"></td><td><button class="ghost" data-id="${d.id}" data-k="save">保存</button></td></tr>`
  ).join('');
  $('#dungeonTable').querySelectorAll('input[data-k=cur]').forEach((c) => c.onchange = async () => {
    await api('/api/hub/dungeons/' + c.dataset.id, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_current: c.checked }),
    });
  });
  $('#dungeonTable').querySelectorAll('button[data-k=save]').forEach((b) => b.onclick = async () => {
    const id = b.dataset.id;
    const url = document.querySelector(`input[data-k=url][data-id="${id}"]`).value;
    const title = document.querySelector(`input[data-k=title][data-id="${id}"]`).value;
    await api('/api/hub/dungeons/' + id, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ video_url: url, video_title: title }),
    });
    b.textContent = '已保存';
    setTimeout(() => b.textContent = '保存', 1500);
  });
}

if (token) { $('#loginBox').style.display = 'none'; $('#dash').style.display = 'block'; boot().catch(() => logout()); }
