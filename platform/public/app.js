'use strict';
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const U = window.__USER__ || {};
  const C = window.__CONFIG__ || {};
  const state = { me: null, sites: [], catalog: [], users: [], uploads: [], tab: 'sites' };
  const toast = msg => {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2800);
  };
  async function api(url, opts) {
    const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
    let data = {};
    try { data = await r.json(); } catch {}
    if (!r.ok) throw new Error(data.error || ('Request failed: ' + r.status));
    return data;
  }
  const fmt = iso => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };
  const statusPill = s => '<span class="status ' + esc(s) + '">' + esc(s) + '</span>';

  function nav() {
    const items = [['sites', 'Sites'], ['new', 'New site'], ['catalog', 'Catalog'], ['settings', 'Settings']];
    if (state.me && state.me.user.isAdmin) items.push(['admin', 'Admin']);
    $('#nav').innerHTML = items.map(([id, label]) => '<a href="#' + id + '" data-tab="' + id + '" class="' + (state.tab === id ? 'active' : '') + '">' + label + '</a>').join('') +
      '<span class="who">' + esc(state.me ? state.me.user.email : '') + ' · <a href="/logout">Sign out</a></span>';
  }

  function quotaCard() {
    const m = state.me;
    return '<div class="quota"><div><b>' + m.remaining + '</b><span>of ' + m.user.dailyLimit + ' sites left today</span></div><div class="bar"><i style="width:' + (m.user.dailyLimit ? Math.round(m.usedToday / m.user.dailyLimit * 100) : 0) + '%"></i></div></div>';
  }

  function siteCard(s, opts = {}) {
    const open = s.status === 'ready' ? '<a class="btn primary sm" href="' + esc(s.url) + '">Open</a>' : '';
    const clone = s.reusable ? '<button class="btn sm" data-clone="' + s.id + '">Reuse</button>' : '';
    const job = s.status === 'queued' || s.status === 'running' ? '<span class="muted small">generating…</span>' : '';
    return '<div class="site-card"><div class="site-top"><h3>' + esc(s.title) + '</h3>' + statusPill(s.status) + '</div>' +
      '<p class="muted">' + esc(s.description || '') + '</p>' +
      '<div class="site-meta"><span>' + esc(s.slug) + '</span><span>' + fmt(s.createdAt) + '</span>' + (s.example ? '<span class="pill">example</span>' : '') + (s.published ? '' : '<span class="pill">private</span>') + '</div>' +
      '<div class="site-actions">' + open + clone + '<button class="btn sm" data-details="' + s.id + '">Details</button>' + job + '</div>' +
      (s.error ? '<div class="inline-err">' + esc(s.error) + '</div>' : '') + '</div>';
  }

  function renderSites() {
    const m = state.me;
    return '<section class="page-head"><div><div class="kicker">Your workspace</div><h1>Learning sites</h1><p class="lead">Create a routed book from files and long text. Every site is served at its own URL — nothing to download.</p></div>' +
      '<a class="btn primary" href="#new">New site</a></section>' +
      quotaCard() +
      '<div class="grid">' + (state.sites.length ? state.sites.map(s => siteCard(s)).join('') : '<div class="empty">No sites yet. <a href="#new">Create the first one</a>.</div>') + '</div>' +
      '<div class="notice">The example site is fully bilingual and built with the same skill. Open it from the catalog or the card above.</div>';
  }

  function renderNew() {
    return '<section class="page-head"><div><div class="kicker">Create</div><h1>New learning site</h1><p class="lead">Give the model a topic, your notes, or both. Uploaded PDFs and text files are added to the skill as context. The result is routed at <code>/s/&lt;slug&gt;/</code>.</p></div></section>' +
      '<div class="split"><form id="newForm" class="card form">' +
      '<label>Title</label><input name="title" placeholder="e.g. Linear algebra from scratch" maxlength="160">' +
      '<label>Topic / goal</label><input name="topic" placeholder="What should the learner be able to do?" maxlength="300">' +
      '<label>Description</label><textarea name="description" rows="3" placeholder="Audience, level, scope, exam format…" maxlength="600"></textarea>' +
      '<label>Audience</label><input name="audience" placeholder="e.g. first-year BSc, BME VIK" maxlength="160">' +
      '<label>Source language preference</label><select name="language"><option value="both">Both Hungarian and English</option><option value="en">English first</option><option value="hu">Hungarian first</option></select>' +
      '<label>Long text / pasted notes</label><textarea name="longText" rows="9" placeholder="Paste a syllabus, lecture notes, exam requirements, or a detailed brief…"></textarea>' +
      '<label>Files (PDF, TXT, MD, CSV, JSON, TEX, JS, HTML, CSS · max 6 × 8 MB)</label><input id="files" type="file" multiple>' +
      '<div id="uploadList" class="chips"></div>' +
      '<div class="row"><label class="check"><input type="checkbox" name="published" checked> Show this site in the shared catalog</label></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn primary" type="submit" id="createBtn">Generate site</button><button class="btn" type="button" id="findBtn">Find an existing site</button></div>' +
      '<div id="jobBox" class="jobbox"></div></form>' +
      '<aside class="card"><h2>Reuse before generating</h2><p class="muted">The catalog is searched first. If an existing site already covers the need, open it or reuse it without spending a generation.</p>' +
      '<div class="row"><input id="reuseQ" placeholder="Search existing sites…"><button class="btn" type="button" id="reuseBtn">Search</button></div><div id="reuseResults"></div></aside></div>';
  }

  function renderCatalog(q) {
    const r = state.catalog || [];
    return '<section class="page-head"><div><div class="kicker">Shared catalog</div><h1>Existing sites</h1><p class="lead">Search published sites before creating a new one. “Reuse” copies a site into your workspace without calling the model.</p></div></section>' +
      '<div class="row search-row"><input id="catalogQ" value="' + esc(q || '') + '" placeholder="Search title, topic, description or source text…"><button class="btn primary" id="catalogBtn">Search</button></div>' +
      '<div class="grid" style="margin-top:16px">' + (r.length ? r.map(s => siteCard(s, { clone: true })).join('') : '<div class="empty">No matching sites yet.</div>') + '</div>';
  }

  function renderSettings() {
    const u = state.me.user;
    return '<section class="page-head"><div><div class="kicker">Configuration</div><h1>API settings</h1><p class="lead">The platform has a server key. You can bring your own OpenAI-compatible endpoint and key; they are stored encrypted and never shown again.</p></div></section>' +
      '<form id="settingsForm" class="card form narrow">' +
      '<label>API base URL</label><input name="apiBase" value="' + esc(u.apiBase || '') + '" placeholder="https://api.commandcode.ai/v1">' +
      '<label>Model</label><input name="apiModel" value="' + esc(u.apiModel || '') + '" placeholder="deepseek-v4.1">' +
      '<label>API key ' + (u.hasKey ? '<span class="pill">set</span>' : '<span class="pill">not set</span>') + '</label><input name="apiKey" type="password" placeholder="Leave blank to keep the current key" autocomplete="off">' +
      '<div class="row" style="margin-top:12px"><button class="btn primary" type="submit">Save</button><button class="btn danger" type="button" id="clearKey">Remove my key</button><span class="muted small">' + (u.hasKey ? 'Your key is used for your jobs.' : 'The server key is used if configured.') + '</span></div>' +
      '</form>';
  }

  function renderAdmin() {
    return '<section class="page-head"><div><div class="kicker">Admin</div><h1>Users</h1><p class="lead">Only the administrator can create accounts. Each user has a daily site limit.</p></div></section>' +
      '<form id="userForm" class="card form"><h2>Add user</h2><div class="grid"><div><label>Email</label><input name="email" type="email" required></div><div><label>Name</label><input name="name"></div><div><label>Password (8+)</label><input name="password" type="password" required></div><div><label>Sites per day</label><input name="dailyLimit" type="number" min="0" max="1000" value="3"></div></div><button class="btn primary" type="submit" style="margin-top:12px">Create user</button></form>' +
      '<div class="card"><h2>Existing users</h2><div class="table-wrap"><table><thead><tr><th>Email</th><th>Name</th><th>Limit</th><th>Used today</th><th>Status</th><th>Actions</th></tr></thead><tbody id="userRows"></tbody></table></div></div>';
  }

  function renderUsers() {
    const rowsEl = $('#userRows');
    if (!rowsEl) return;
    const rows = state.users || [];
    rowsEl.innerHTML = rows.map(u => '<tr><td>' + esc(u.email) + (u.isAdmin ? ' <span class="pill">admin</span>' : '') + '</td><td>' + esc(u.name) + '</td>' +
      '<td><input class="mini-input" type="number" min="0" max="1000" value="' + u.dailyLimit + '" data-limit="' + u.id + '"></td><td>' + u.usedToday + '</td>' +
      '<td>' + (u.disabled ? '<span class="status failed">disabled</span>' : '<span class="status ready">active</span>') + '</td>' +
      '<td class="actions"><button class="btn sm" data-save-user="' + u.id + '">Save limit</button><button class="btn sm" data-reset="' + u.id + '">Reset password</button>' +
      (u.isAdmin ? '' : '<button class="btn sm ' + (u.disabled ? '' : 'danger') + '" data-toggle="' + u.id + '" data-disabled="' + (u.disabled ? 1 : 0) + '">' + (u.disabled ? 'Enable' : 'Disable') + '</button>') + '</td></tr>').join('');
  }

  async function loadMe() {
    state.me = await api('/api/me');
  }
  async function loadSites() {
    state.sites = (await api('/api/sites')).sites;
  }
  async function loadCatalog(q) {
    state.catalog = (await api('/api/catalog?q=' + encodeURIComponent(q || ''))).sites;
  }
  async function loadUsers() {
    state.users = (await api('/api/admin/users')).users;
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'sites';
    state.tab = ['sites', 'new', 'catalog', 'settings', 'admin'].includes(h) ? h : 'sites';
    nav();
    if (state.tab === 'sites') { $('#view').innerHTML = renderSites(); bindSites(); }
    if (state.tab === 'new') { $('#view').innerHTML = renderNew(); bindNew(); }
    if (state.tab === 'catalog') { $('#view').innerHTML = renderCatalog(''); bindCatalog(); loadCatalog('').then(() => { if (state.tab === 'catalog') { $('#view').innerHTML = renderCatalog(''); bindCatalog(); } }).catch(e => toast(e.message)); }
    if (state.tab === 'settings') { $('#view').innerHTML = renderSettings(); bindSettings(); }
    if (state.tab === 'admin') {
    if (!state.me.user.isAdmin) { location.hash = 'sites'; return; }
    $('#view').innerHTML = renderAdmin(); loadUsers().then(renderUsers).catch(e => toast(e.message));
    if (!$('#view')._adminBound) { $('#view')._adminBound = true; bindAdmin(); }
    }
  }

  function bindSites() {
    $$('[data-clone]').forEach(b => b.addEventListener('click', () => cloneSite(b.dataset.clone)));
    $$('[data-details]').forEach(b => b.addEventListener('click', async () => {
      try {
        const d = await api('/api/sites/' + b.dataset.details);
        const log = d.job ? '\n\nJob: ' + d.job.status + '\n' + d.job.log : '';
        alert(d.site.title + '\n' + d.site.absoluteUrl + '\nStatus: ' + d.site.status + log);
      } catch (e) { toast(e.message); }
    }));
  }

  async function cloneSite(id) {
    if (!confirm('Reuse this site in your workspace? It counts toward today’s limit.')) return;
    try {
      const r = await api('/api/sites/' + id + '/clone', { method: 'POST' });
      toast('Reused as ' + r.site.slug);
      await loadSites(); route();
    } catch (e) { toast(e.message); }
  }

  function bindNew() {
    $('#files').addEventListener('change', async () => {
      const files = $('#files').files;
      if (!files || !files.length) return;
      const fd = new FormData();
      for (const f of files) fd.append('files', f, f.name);
      toast('Uploading…');
      try {
        const r = await fetch('/api/uploads', { method: 'POST', body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Upload failed');
        state.uploads = state.uploads.concat(d.uploads);
        $('#uploadList').innerHTML = state.uploads.map(u => '<span class="chip-file">' + esc(u.name) + ' · ' + u.chars.toLocaleString() + ' chars</span>').join('');
        toast('Uploaded ' + d.uploads.length + ' file(s)');
      } catch (e) { toast(e.message); }
    });
    const find = async q => {
      try {
        const r = await api('/api/catalog?q=' + encodeURIComponent(q));
        $('#reuseResults').innerHTML = r.sites.length ? r.sites.slice(0, 5).map(s => '<div class="reuse-row"><div><b>' + esc(s.title) + '</b><br><span class="muted small">' + esc(s.description || '') + '</span></div><div class="row"><a class="btn sm" href="' + esc(s.url) + '">Open</a><button class="btn sm" data-reuse="' + s.id + '">Reuse</button></div></div>').join('') : '<p class="muted">No match. Generate a new site.</p>';
        $$('#reuseResults [data-reuse]').forEach(b => b.addEventListener('click', () => cloneSite(b.dataset.reuse)));
      } catch (e) { toast(e.message); }
    };
    $('#findBtn').addEventListener('click', () => find($('[name=topic]').value || $('[name=title]').value || ''));
    $('#reuseBtn').addEventListener('click', () => find($('#reuseQ').value));
    $('#reuseQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); find($('#reuseQ').value); } });
    $('#newForm').addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const btn = $('#createBtn'); btn.disabled = true;
      const body = {
        title: form.title.value, topic: form.topic.value, description: form.description.value,
        audience: form.audience.value, language: form.language.value, longText: form.longText.value,
        uploadIds: state.uploads.map(u => u.id), published: form.published.checked,
        force: form.dataset.force === '1'
      };
      try {
        const r = await api('/api/sites', { method: 'POST', body: JSON.stringify(body) });
        if (r.suggestions) {
          btn.disabled = false;
          const box = $('#jobBox');
          box.innerHTML = '<div class="job"><b>Existing sites may already cover this.</b>' +
            r.suggestions.map(s => '<div class="reuse-row"><div><b>' + esc(s.title) + '</b><br><span class="muted small">' + esc(s.description || '') + '</span></div><div class="row"><a class="btn sm" href="' + esc(s.url) + '">Open</a>' + (s.reusable ? '<button class="btn sm" data-reuse="' + s.id + '">Reuse</button>' : '') + '</div></div>').join('') +
            '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="forceGen">Generate a new site anyway</button></div></div>';
          $$('#jobBox [data-reuse]').forEach(b => b.addEventListener('click', () => cloneSite(b.dataset.reuse)));
          $('#forceGen').addEventListener('click', () => { form.dataset.force = '1'; form.requestSubmit(); });
          return;
        }
        form.dataset.force = '';
        toast('Queued. Generating…');
        poll(r.site.id);
        state.uploads = []; $('#uploadList').innerHTML = '';
        form.reset();
      } catch (err) { toast(err.message); btn.disabled = false; }
    });
  }

  function poll(id) {
    const box = $('#jobBox');
    if (!box) return;
    const tick = async () => {
      if (!document.body.contains(box)) return;
      try {
        const d = await api('/api/sites/' + id);
        const s = d.site;
        box.innerHTML = '<div class="job"><div class="row"><b>' + esc(s.title) + '</b>' + statusPill(s.status) + '</div>' +
          '<p class="muted small">' + (s.status === 'ready' ? 'Published at <a href="' + esc(s.url) + '">' + esc(s.url) + '</a>' : esc((d.job && d.job.log) || s.error || 'Working…')) + '</p>' +
          (s.status === 'ready' ? '<a class="btn primary sm" href="' + esc(s.url) + '">Open site</a>' : '') +
          (s.status === 'failed' ? '<button class="btn sm" type="button" id="retryGen">Try again</button>' : '') + '</div>';
        if (s.status === 'failed') {
          const retry = $('#retryGen'); if (retry) retry.addEventListener('click', () => location.hash = 'new');
        }
        if (s.status === 'queued' || s.status === 'running') setTimeout(tick, 2500);
        else { loadSites().catch(() => {}); }
      } catch (e) { box.innerHTML = '<div class="inline-err">' + esc(e.message) + '</div>'; }
    };
    tick();
  }

  function bindCatalog() {
    $('#catalogBtn').addEventListener('click', () => { const q = $('#catalogQ').value; loadCatalog(q).then(() => { $('#view').innerHTML = renderCatalog(q); bindCatalog(); }).catch(e => toast(e.message)); });
    $('#catalogQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#catalogBtn').click(); } });
    $$('[data-clone]').forEach(b => b.addEventListener('click', () => cloneSite(b.dataset.clone)));
  }

  function bindSettings() {
    $('#settingsForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.currentTarget;
      try {
        await api('/api/settings', { method: 'PUT', body: JSON.stringify({ apiBase: f.apiBase.value, apiModel: f.apiModel.value, apiKey: f.apiKey.value }) });
        toast('Saved.'); await loadMe(); route();
      } catch (err) { toast(err.message); }
    });
    $('#clearKey').addEventListener('click', async () => {
      if (!confirm('Remove your API key? The server key will be used if configured.')) return;
      try { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ clearKey: true }) }); toast('Key removed.'); await loadMe(); route(); } catch (e) { toast(e.message); }
    });
  }

  function bindAdmin() {
    $('#userForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.currentTarget;
      try {
        await api('/api/admin/users', { method: 'POST', body: JSON.stringify({ email: f.email.value, name: f.name.value, password: f.password.value, dailyLimit: Number(f.dailyLimit.value) }) });
        toast('User created.'); f.reset(); await loadUsers(); renderUsers();
      } catch (err) { toast(err.message); }
    });
    $('#view').addEventListener('click', async e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.saveUser) {
        const input = $('[data-limit="' + t.dataset.saveUser + '"]');
        try { await api('/api/admin/users/' + t.dataset.saveUser, { method: 'PATCH', body: JSON.stringify({ dailyLimit: Number(input.value) }) }); toast('Limit saved.'); await loadUsers(); renderUsers(); } catch (err) { toast(err.message); }
      }
      if (t.dataset.reset) {
        const pw = prompt('New password (at least 8 characters):');
        if (!pw) return;
        try { await api('/api/admin/users/' + t.dataset.reset, { method: 'PATCH', body: JSON.stringify({ password: pw }) }); toast('Password changed.'); } catch (err) { toast(err.message); }
      }
      if (t.dataset.toggle) {
        try { await api('/api/admin/users/' + t.dataset.toggle, { method: 'PATCH', body: JSON.stringify({ disabled: t.dataset.disabled === '1' ? 0 : 1 }) }); toast('User updated.'); await loadUsers(); renderUsers(); } catch (err) { toast(err.message); }
      }
    });
  }

  async function boot() {
    try {
      await loadMe();
      state.sites = (await api('/api/sites')).sites;
      nav(); route();
    } catch (e) {
      $('#view').innerHTML = '<div class="inline-err">' + esc(e.message) + ' <a href="/login">Sign in</a></div>';
    }
  }
  window.addEventListener('hashchange', route);
  boot();
})();
