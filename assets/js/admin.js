/* ============================================================
   AethelStudio AI — admin.js
   Panel admin tersembunyi: 12 modul pengelolaan.
   Akses: ketuk logo 5x, ketuk versi 7x, atau buka #/admin
   ============================================================ */
(function () {
  'use strict';
  const A = window.Aethel;
  const db = A.db, util = A.util, ui = A.ui, icon = A.icon, gen = A.gen;

  let activeTab = 'overview';

  const TABS = [
    { id: 'overview', label: 'Ringkasan', icon: 'chart' },
    { id: 'users', label: 'Pengguna', icon: 'user' },
    { id: 'projects', label: 'Proyek', icon: 'folder' },
    { id: 'templates', label: 'Template', icon: 'grid' },
    { id: 'prompts', label: 'Prompt', icon: 'sparkles' },
    { id: 'keys', label: 'Kunci API', icon: 'key' },
    { id: 'site', label: 'Situs', icon: 'settings' },
    { id: 'logs', label: 'Log Aktivitas', icon: 'clock' },
    { id: 'notify', label: 'Notifikasi', icon: 'bell' },
    { id: 'backup', label: 'Backup', icon: 'database' },
    { id: 'features', label: 'Fitur', icon: 'zap' },
    { id: 'danger', label: 'Zona Bahaya', icon: 'shield' }
  ];

  function esc(s) { return util.esc(s); }

  function storageBytes() {
    let n = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        n += (k.length + (localStorage.getItem(k) || '').length) * 2;
      }
    } catch (e) { /* ignore */ }
    return n;
  }

  function totalMetric(type) {
    const m = db.metrics();
    return Object.keys(m).reduce(function (n, d) { return n + (m[d][type] || 0); }, 0);
  }

  function projectsOf(email) {
    const users = db.users();
    const u = users.find(function (x) { return x.email === email; });
    if (!u) return 0;
    return db.projects().filter(function (p) { return p.owner === u.id; }).length;
  }

  /* ============================================================
     Kerangka
     ============================================================ */
  function render() {
    const me = A.auth.current();
    const html = '<div class="admin-head">' +
      '<div><span class="tag ok">' + icon('shield', 13) + ' Administrator</span>' +
      '<h1>Panel Admin</h1><p class="muted">' + esc(me ? me.email : '') + ' · semua data tersimpan lokal di perangkat ini.</p></div>' +
      '<div class="admin-head-actions">' +
      '<a class="btn ghost sm" href="#/home">' + icon('external', 15) + ' Lihat aplikasi</a>' +
      '<button class="btn ghost sm" id="adminLogout">' + icon('logout', 15) + ' Keluar</button>' +
      '</div></div>' +
      '<div class="admin-tabs" id="adminTabs">' + TABS.map(function (t) {
        return '<button class="admin-tab' + (t.id === activeTab ? ' on' : '') + '" data-tab="' + t.id + '">' +
          icon(t.icon, 16) + '<span>' + t.label + '</span></button>';
      }).join('') + '</div>' +
      '<div id="adminContent" class="admin-content"></div>';

    return {
      html: html,
      mount: function (root) {
        const content = root.querySelector('#adminContent');
        function paint() {
          root.querySelectorAll('.admin-tab').forEach(function (b) {
            b.classList.toggle('on', b.getAttribute('data-tab') === activeTab);
          });
          const section = sections[activeTab] ? sections[activeTab]() : { html: '<p>Halaman tidak ditemukan.</p>', mount: function () {} };
          content.innerHTML = section.html;
          if (section.mount) section.mount(content);
        }
        root.querySelectorAll('.admin-tab').forEach(function (b) {
          b.addEventListener('click', function () {
            activeTab = b.getAttribute('data-tab');
            if (location.hash !== '#/admin') history.replaceState(null, '', '#/admin');
            paint();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
        const lo = root.querySelector('#adminLogout');
        if (lo) lo.addEventListener('click', function () {
          A.auth.logout();
          ui.toast('Keluar dari panel admin', 'info');
          // hashchange pada router akan merender ulang halaman beranda
          if (location.hash === '#/home') window.Aethel.app.render();
          else location.hash = '#/home';
        });
        paint();
      }
    };
  }

  /* ============================================================
     1. Ringkasan
     ============================================================ */
  function overview() {
    const s = db.settings();
    const users = db.users();
    const projects = db.projects();
    const series = db.series(14);
    const max = Math.max.apply(null, series.map(function (d) { return Math.max(d.gen, d.deploy, 1); }).concat([1]));
    const pToday = { gen: totalMetric('gen'), deploy: totalMetric('deploy'), image: totalMetric('image'), download: totalMetric('download') };
    const logs = db.logs().slice(0, 8);

    const html = '<div class="stat-grid">' +
      stat('Pengguna', users.length, users.filter(function (u) { return u.role === 'admin'; }).length + ' admin', 'user', '#6366f1') +
      stat('Proyek', projects.length, db.allProjects().filter(function (p) { return Date.now() - p.updatedAt < 86400000; }).length + ' aktif hari ini', 'folder', '#22d3ee') +
      stat('Generate', pToday.gen, 'total sepanjang waktu', 'sparkles', '#2dd4bf') +
      stat('Deploy', pToday.deploy, 'publikasi berhasil', 'rocket', '#f59e0b') +
      stat('Gambar AI', pToday.image, 'aset dibuat', 'image', '#ec4899') +
      stat('Penyimpanan', util.bytes(storageBytes()), 'localStorage terpakai', 'database', '#8b5cf6') +
      '</div>' +
      '<div class="grid-2 mt-2">' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('chart', 18) + ' Aktivitas 14 hari</h3>' +
      '<div class="legend"><span class="lg gen">Generate</span><span class="lg dep">Deploy</span></div></div>' +
      '<div class="chart">' + series.map(function (d) {
        return '<div class="chart-col"><div class="chart-stack">' +
          '<div class="chart-bar gen" style="height:' + Math.max(3, Math.round(d.gen / max * 100)) + '%" title="' + d.day + ': ' + d.gen + ' generate"></div>' +
          '<div class="chart-bar dep" style="height:' + Math.max(2, Math.round(d.deploy / max * 100)) + '%" title="' + d.day + ': ' + d.deploy + ' deploy"></div>' +
          '</div><span>' + d.label + '</span></div>';
      }).join('') + '</div>' +
      '<div class="mini-stats"><div><b>' + (s.provider === 'offline' ? 'Offline' : esc(A.ai.meta(s.provider).name.split('(')[0].trim())) + '</b><span>AI aktif</span></div>' +
      '<div><b>' + (s.maintenance ? 'Aktif' : 'Nonaktif') + '</b><span>Mode perawatan</span></div>' +
      '<div><b>' + s.version + '</b><span>Versi aplikasi</span></div></div></div>' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('clock', 18) + ' Aktivitas terbaru</h3>' +
      '<a class="link-btn" href="#" data-goto="logs">Lihat semua</a></div>' +
      (logs.length ? '<ul class="log-mini">' + logs.map(function (l) {
        return '<li><span class="log-dot ' + (l.action.indexOf('deploy') === 0 ? 'dep' : l.action === 'generate' ? 'gen' : '') + '"></span>' +
          '<div><b>' + esc(l.action) + '</b><small>' + esc(l.detail || '') + ' · ' + util.ago(l.t) + '</small></div></li>';
      }).join('') + '</ul>' : '<p class="muted small">Belum ada aktivitas.</p>') +
      '</div></div>' +
      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('zap', 18) + ' Aksi cepat</h3></div>' +
      '<div class="quick-links cols">' +
      '<button class="quick-link" data-quick="backup">' + icon('download', 16) + '<span><b>Backup sekarang</b><small>Unduh seluruh data JSON</small></span></button>' +
      '<button class="quick-link" data-quick="prompt">' + icon('plus', 16) + '<span><b>Tambah prompt</b><small>Ide siap pakai di beranda</small></span></button>' +
      '<button class="quick-link" data-quick="template">' + icon('grid', 16) + '<span><b>Tambah template</b><small>Buat dari preset premium</small></span></button>' +
      '<button class="quick-link" data-quick="logs">' + icon('trash', 16) + '<span><b>Bersihkan log</b><small>Hapus riwayat aktivitas</small></span></button>' +
      '</div></div>';

    return {
      html: html,
      mount: function (root) {
        root.querySelectorAll('[data-goto]').forEach(function (a) {
          a.addEventListener('click', function (e) { e.preventDefault(); activeTab = a.getAttribute('data-goto'); refreshAdmin(); });
        });
        root.querySelectorAll('[data-quick]').forEach(function (b) {
          b.addEventListener('click', function () {
            const q = b.getAttribute('data-quick');
            if (q === 'backup') doBackup();
            else if (q === 'prompt') addPrompt();
            else if (q === 'template') openTemplateEditor();
            else if (q === 'logs') {
              ui.confirm('Hapus semua log aktivitas?', { danger: true, ok: 'Hapus' }).then(function (ok) {
                if (!ok) return;
                db.clearLogs(); db.log('admin', 'log dibersihkan');
                ui.toast('Log dibersihkan', 'success'); refreshAdmin();
              });
            }
          });
        });
      }
    };
  }

  function stat(label, value, sub, ic, color) {
    return '<div class="stat-card"><span class="stat-ic" style="background:' + color + '20;color:' + color + '">' + icon(ic, 20) + '</span>' +
      '<div><b>' + value + '</b><span>' + esc(label) + '</span><small>' + esc(sub) + '</small></div></div>';
  }

  /* ============================================================
     2. Pengguna
     ============================================================ */
  function usersSection() {
    const me = A.auth.current();
    const users = db.users();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('user', 18) + ' Manajemen Pengguna (' + users.length + ')</h3>' +
      '<button class="btn primary sm" id="addUserBtn">' + icon('plus', 15) + ' Tambah pengguna</button></div>' +
      '<div class="toolbar"><div class="search-box">' + icon('search', 16) + '<input id="userSearch" placeholder="Cari nama atau email…"></div>' +
      '<span class="muted small">Peran admin dapat mengakses panel ini.</span></div>' +
      '<div class="table-wrap"><table class="table" id="userTable"><thead><tr>' +
      '<th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Proyek</th><th>Terakhir masuk</th><th>Aksi</th>' +
      '</tr></thead><tbody>' + users.map(function (u) {
        return '<tr data-search="' + esc((u.name + ' ' + u.email).toLowerCase()) + '">' +
          '<td><div class="cell-user"><span class="mini-avatar">' + (u.avatar ? '<img src="' + esc(u.avatar) + '" alt="">' : esc((u.name || u.email).charAt(0).toUpperCase())) + '</span>' +
          '<b>' + esc(u.name || '-') + '</b>' + (u.email === A.ADMIN_EMAIL ? '<span class="tag ok">utama</span>' : '') + '</div></td>' +
          '<td class="mono">' + esc(u.email) + '</td>' +
          '<td><span class="tag ' + (u.role === 'admin' ? 'ok' : '') + '">' + esc(u.role) + '</span></td>' +
          '<td><span class="tag ' + (u.status === 'blocked' ? 'danger' : 'ok') + '">' + (u.status === 'blocked' ? 'diblokir' : 'aktif') + '</span></td>' +
          '<td>' + projectsOf(u.email) + '</td>' +
          '<td class="muted small">' + (u.lastLogin ? util.ago(u.lastLogin) : 'belum pernah') + '</td>' +
          '<td><div class="row-actions">' +
          '<button class="icon-btn sm" data-u="role" data-id="' + u.id + '" title="Ubah peran">' + icon('shield', 15) + '</button>' +
          '<button class="icon-btn sm" data-u="pass" data-id="' + u.id + '" title="Reset password">' + icon('key', 15) + '</button>' +
          '<button class="icon-btn sm" data-u="block" data-id="' + u.id + '" title="Blokir/buka">' + icon('lock', 15) + '</button>' +
          '<button class="icon-btn sm danger" data-u="del" data-id="' + u.id + '" title="Hapus">' + icon('trash', 15) + '</button>' +
          '</div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    return {
      html: html,
      mount: function (root) {
        const search = root.querySelector('#userSearch');
        if (search) search.addEventListener('input', function () {
          const q = search.value.toLowerCase();
          root.querySelectorAll('#userTable tbody tr').forEach(function (tr) {
            tr.style.display = tr.getAttribute('data-search').indexOf(q) !== -1 ? '' : 'none';
          });
        });
        const add = root.querySelector('#addUserBtn');
        if (add) add.addEventListener('click', addUser);
        root.querySelectorAll('[data-u]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const u = db.users().find(function (x) { return x.id === b.getAttribute('data-id'); });
            if (!u) return;
            const act = b.getAttribute('data-u');
            if (act === 'role') {
              if (u.email === A.ADMIN_EMAIL) return ui.toast('Peran admin utama tidak dapat diubah.', 'error');
              if (me && me.id === u.id) return ui.toast('Tidak bisa mengubah peran sendiri.', 'error');
              const next = u.role === 'admin' ? 'user' : 'admin';
              A.auth.updateUser(u.id, { role: next });
              db.log('admin', 'peran ' + u.email + ' → ' + next);
              ui.toast('Peran diubah menjadi ' + next, 'success');
              refreshAdmin();
            } else if (act === 'pass') {
              const p = await ui.promptDialog({ title: 'Reset password', label: 'Password baru untuk ' + u.email, type: 'text', placeholder: 'minimal 6 karakter' });
              if (!p) return;
              try {
                await A.auth.setPassword(u.id, p);
                db.log('admin', 'reset password ' + u.email);
                ui.toast('Password diperbarui', 'success');
              } catch (e) { ui.toast(e.message, 'error'); }
            } else if (act === 'block') {
              if (u.email === A.ADMIN_EMAIL) return ui.toast('Admin utama tidak bisa diblokir.', 'error');
              if (me && me.id === u.id) return ui.toast('Tidak bisa memblokir diri sendiri.', 'error');
              const next = u.status === 'blocked' ? 'active' : 'blocked';
              A.auth.updateUser(u.id, { status: next });
              db.log('admin', (next === 'blocked' ? 'blokir ' : 'aktifkan ') + u.email);
              ui.toast(next === 'blocked' ? 'Pengguna diblokir' : 'Pengguna diaktifkan', 'success');
              refreshAdmin();
            } else if (act === 'del') {
              const ok = await ui.confirm('Hapus pengguna ' + u.email + '? Proyek miliknya tetap tersimpan.', { danger: true, ok: 'Hapus' });
              if (!ok) return;
              try {
                A.auth.removeUser(u.id);
                db.log('admin', 'hapus pengguna ' + u.email);
                ui.toast('Pengguna dihapus', 'success');
                refreshAdmin();
              } catch (e) { ui.toast(e.message, 'error'); }
            }
          });
        });
      }
    };
  }

  function addUser() {
    ui.modal({
      title: 'Tambah Pengguna',
      body: '<div class="form-grid">' +
        '<label class="field"><span>Nama</span><input id="nuName" class="input" placeholder="Nama lengkap"></label>' +
        '<label class="field"><span>Email</span><input id="nuEmail" class="input" type="email" placeholder="email@contoh.com"></label>' +
        '<label class="field"><span>Password</span><input id="nuPass" class="input" type="text" placeholder="minimal 6 karakter"></label>' +
        '<label class="field"><span>Peran</span><select id="nuRole" class="input"><option value="user">user</option><option value="admin">admin</option></select></label>' +
        '</div><div id="nuMsg" class="form-msg" hidden></div>',
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: 'Simpan', variant: 'primary', onClick: function (wrap) {
            createUser(wrap);
            return false;
          }
        }
      ]
    });
  }

  async function createUser(wrap) {
    const name = wrap.querySelector('#nuName').value.trim();
    const email = wrap.querySelector('#nuEmail').value.trim();
    const pass = wrap.querySelector('#nuPass').value;
    const role = wrap.querySelector('#nuRole').value;
    const msg = wrap.querySelector('#nuMsg');
    const prevSession = localStorage.getItem(A.K.session);
    msg.hidden = false; msg.className = 'form-msg'; msg.textContent = 'Menyimpan…';
    try {
      const u = await A.auth.register(name, email, pass);
      if (role === 'admin') A.auth.updateUser(u.id, { role: 'admin' });
      if (prevSession) localStorage.setItem(A.K.session, prevSession); else localStorage.removeItem(A.K.session);
      db.log('admin', 'tambah pengguna ' + email + ' (' + role + ')');
      ui.toast('Pengguna ditambahkan', 'success');
      document.querySelectorAll('.modal-wrap').forEach(function (m) { m.remove(); });
      document.body.classList.remove('modal-open');
      refreshAdmin();
    } catch (err) {
      if (prevSession) localStorage.setItem(A.K.session, prevSession);
      msg.className = 'form-msg error';
      msg.textContent = err.message || 'Gagal menambah pengguna.';
    }
  }

  /* ============================================================
     3. Proyek
     ============================================================ */
  function projectsSection() {
    const list = db.allProjects();
    const users = db.users();
    function ownerEmail(id) {
      if (id === 'guest') return 'tamu';
      const u = users.find(function (x) { return x.id === id; });
      return u ? u.email : 'tidak dikenal';
    }
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('folder', 18) + ' Semua Proyek (' + list.length + ')</h3>' +
      '<span class="muted small">' + util.bytes(list.reduce(function (n, p) {
        return n + Object.keys(p.files || {}).reduce(function (m, f) { return m + new Blob([p.files[f]]).size; }, 0);
      }, 0)) + ' total</span></div>' +
      '<div class="toolbar"><div class="search-box">' + icon('search', 16) + '<input id="pSearch" placeholder="Cari judul atau pemilik…"></div></div>' +
      (list.length ? '<div class="table-wrap"><table class="table" id="pTable"><thead><tr>' +
        '<th>Judul</th><th>Pemilik</th><th>AI</th><th>File</th><th>Diperbarui</th><th>Hosting</th><th>Aksi</th></tr></thead><tbody>' +
        list.map(function (p) {
          return '<tr data-search="' + esc((p.title + ' ' + ownerEmail(p.owner)).toLowerCase()) + '">' +
            '<td><b>' + esc(p.title) + '</b><br><small class="muted">' + esc((p.tags || []).join(', ')) + '</small></td>' +
            '<td class="small">' + esc(ownerEmail(p.owner)) + '</td>' +
            '<td><span class="tag">' + esc(p.provider || '-') + '</span></td>' +
            '<td>' + Object.keys(p.files || {}).length + '</td>' +
            '<td class="muted small">' + util.ago(p.updatedAt) + '</td>' +
            '<td>' + (p.deployed ? '<a class="tag ok" href="' + esc(p.deployed.url) + '" target="_blank" rel="noopener">live</a>' : '<span class="muted small">—</span>') + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="icon-btn sm" data-pj="open" data-id="' + p.id + '" title="Buka studio">' + icon('code', 15) + '</button>' +
            '<button class="icon-btn sm" data-pj="zip" data-id="' + p.id + '" title="ZIP">' + icon('download', 15) + '</button>' +
            '<button class="icon-btn sm danger" data-pj="del" data-id="' + p.id + '" title="Hapus">' + icon('trash', 15) + '</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<p class="muted small">Belum ada proyek.</p>') + '</div>';

    return {
      html: html,
      mount: function (root) {
        const search = root.querySelector('#pSearch');
        if (search) search.addEventListener('input', function () {
          const q = search.value.toLowerCase();
          root.querySelectorAll('#pTable tbody tr').forEach(function (tr) {
            tr.style.display = tr.getAttribute('data-search').indexOf(q) !== -1 ? '' : 'none';
          });
        });
        root.querySelectorAll('[data-pj]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const p = db.getProject(b.getAttribute('data-id'));
            if (!p) return;
            const act = b.getAttribute('data-pj');
            if (act === 'open') { A.util && (location.hash = '#/studio/' + p.id); }
            else if (act === 'zip') window.Aethel.app.downloadProject(p);
            else if (act === 'del') {
              const ok = await ui.confirm('Hapus proyek "' + p.title + '"?', { danger: true, ok: 'Hapus' });
              if (!ok) return;
              db.removeProject(p.id);
              db.log('admin', 'hapus proyek ' + p.title);
              ui.toast('Proyek dihapus', 'success');
              refreshAdmin();
            }
          });
        });
      }
    };
  }

  /* ============================================================
     4. Template
     ============================================================ */
  function templatesSection() {
    const custom = db.templates();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('grid', 18) + ' Template Kustom (' + custom.length + ')</h3>' +
      '<button class="btn primary sm" id="addTpl">' + icon('plus', 15) + ' Tambah template</button></div>' +
      '<p class="muted small">Template kustom dibuat dari preset premium lalu disesuaikan. Muncul di galeri template pengguna.</p>' +
      (custom.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Brand</th><th>Warna</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
        custom.map(function (t) {
          return '<tr><td><b>' + esc(t.emoji || '✨') + ' ' + esc(t.label) + '</b><br><small class="muted">' + esc(t.description || '') + '</small></td>' +
            '<td>' + esc(t.brand || '-') + '</td>' +
            '<td><div class="swatches-inline"><i style="background:' + esc((t.theme || {}).primary || '#2dd4bf') + '"></i><i style="background:' + esc((t.theme || {}).accent || '#6366f1') + '"></i></div></td>' +
            '<td><span class="tag ' + (t.active === false ? 'danger' : 'ok') + '">' + (t.active === false ? 'nonaktif' : 'aktif') + '</span></td>' +
            '<td><div class="row-actions">' +
            '<button class="btn sm ghost" data-t="edit" data-id="' + esc(t.id) + '">Edit</button>' +
            '<button class="btn sm ghost" data-t="toggle" data-id="' + esc(t.id) + '">' + (t.active === false ? 'Aktifkan' : 'Nonaktifkan') + '</button>' +
            '<button class="icon-btn sm danger" data-t="del" data-id="' + esc(t.id) + '">' + icon('trash', 15) + '</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<p class="muted small">Belum ada template kustom. Preset bawaan tetap tersedia (12 template).</p>') +
      '</div>' +
      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('sparkles', 18) + ' Preset Bawaan</h3></div>' +
      '<div class="preset-list">' + gen.presets.map(function (p) {
        return '<span class="tag big">' + esc(p.emoji) + ' ' + esc(p.label) + '</span>';
      }).join('') + '</div></div>';

    return {
      html: html,
      mount: function (root) {
        const add = root.querySelector('#addTpl');
        if (add) add.addEventListener('click', function () { openTemplateEditor(); });
        root.querySelectorAll('[data-t]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const list = db.templates();
            const t = list.find(function (x) { return x.id === b.getAttribute('data-id'); });
            if (!t) return;
            const act = b.getAttribute('data-t');
            if (act === 'edit') openTemplateEditor(t);
            else if (act === 'toggle') {
              t.active = t.active === false;
              db.saveTemplates(list);
              ui.toast(t.active ? 'Template diaktifkan' : 'Template dinonaktifkan', 'success');
              refreshAdmin();
            } else if (act === 'del') {
              const ok = await ui.confirm('Hapus template "' + t.label + '"?', { danger: true, ok: 'Hapus' });
              if (!ok) return;
              db.saveTemplates(list.filter(function (x) { return x.id !== t.id; }));
              db.log('admin', 'hapus template ' + t.label);
              ui.toast('Template dihapus', 'success');
              refreshAdmin();
            }
          });
        });
      }
    };
  }

  function openTemplateEditor(tpl) {
    const isEdit = !!tpl;
    const baseId = (tpl && tpl.baseId) || 'saas';
    ui.modal({
      title: isEdit ? 'Edit Template' : 'Tambah Template',
      size: 'md',
      body: '<div class="form-grid">' +
        '<label class="field"><span>Nama template</span><input id="tpLabel" class="input" value="' + esc(tpl ? tpl.label : '') + '" placeholder="Contoh: Landing Kopi Modern"></label>' +
        '<label class="field"><span>Emoji</span><input id="tpEmoji" class="input" value="' + esc(tpl ? tpl.emoji : '✨') + '" maxlength="4"></label>' +
        '<label class="field"><span>Preset dasar</span><select id="tpBase" class="input">' + gen.presets.map(function (p) {
          return '<option value="' + p.id + '"' + (p.id === baseId ? ' selected' : '') + '>' + esc(p.emoji + ' ' + p.label) + '</option>';
        }).join('') + '</select></label>' +
        '<label class="field"><span>Nama brand</span><input id="tpBrand" class="input" value="' + esc(tpl ? tpl.brand : '') + '" placeholder="Nama bisnis"></label>' +
        '<label class="field"><span>Warna utama</span><input id="tpPrimary" type="color" class="input color" value="' + esc(tpl ? (tpl.theme || {}).primary || '#2dd4bf' : '#2dd4bf') + '"></label>' +
        '<label class="field"><span>Warna aksen</span><input id="tpAccent" type="color" class="input color" value="' + esc(tpl ? (tpl.theme || {}).accent || '#6366f1' : '#6366f1') + '"></label>' +
        '<label class="field full"><span>Deskripsi</span><textarea id="tpDesc" class="input" rows="2" placeholder="Deskripsi singkat template">' + esc(tpl ? tpl.description : '') + '</textarea></label>' +
        '<label class="field full"><span>Tag (pisahkan koma)</span><input id="tpTags" class="input" value="' + esc(tpl ? (tpl.tags || []).join(', ') : 'bisnis, modern') + '"></label>' +
        '</div>'
    ,
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: isEdit ? 'Simpan perubahan' : 'Buat template', variant: 'primary', onClick: function (wrap) {
            const label = wrap.querySelector('#tpLabel').value.trim();
            if (!label) { ui.toast('Nama template wajib diisi.', 'error'); return false; }
            const base = gen.presets.find(function (p) { return p.id === wrap.querySelector('#tpBase').value; }) || gen.presets[0];
            const preset = JSON.parse(JSON.stringify(base));
            const brand = wrap.querySelector('#tpBrand').value.trim();
            if (brand) preset.brand = brand;
            preset.theme = { primary: wrap.querySelector('#tpPrimary').value, accent: wrap.querySelector('#tpAccent').value };
            const list = db.templates();
            const data = {
              id: tpl ? tpl.id : util.uid('tpl'),
              label: label,
              emoji: wrap.querySelector('#tpEmoji').value || '✨',
              description: wrap.querySelector('#tpDesc').value.trim(),
              tags: wrap.querySelector('#tpTags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
              brand: brand || base.brand,
              theme: preset.theme,
              baseId: base.id,
              preset: preset,
              active: tpl ? tpl.active !== false : true,
              createdAt: tpl ? tpl.createdAt : Date.now()
            };
            const i = list.findIndex(function (x) { return x.id === data.id; });
            if (i === -1) list.push(data); else list[i] = data;
            db.saveTemplates(list);
            db.log('admin', (isEdit ? 'edit' : 'tambah') + ' template ' + label);
            ui.toast('Template disimpan', 'success');
            refreshAdmin();
          }
        }
      ]
    });
  }

  /* ============================================================
     5. Prompt
     ============================================================ */
  function promptsSection() {
    const list = db.prompts();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('sparkles', 18) + ' Prompt Cepat (' + list.length + ')</h3>' +
      '<button class="btn primary sm" id="addPrompt">' + icon('plus', 15) + ' Tambah</button></div>' +
      '<p class="muted small">Muncul sebagai chip ide di beranda pengguna. Berguna untuk mengarahkan gaya website.</p>' +
      '<ul class="prompt-list">' + list.map(function (p, i) {
        return '<li><span class="idx">' + (i + 1) + '</span><p>' + esc(p) + '</p><div class="row-actions">' +
          '<button class="icon-btn sm" data-pr="edit" data-i="' + i + '" title="Edit">' + icon('code', 15) + '</button>' +
          '<button class="icon-btn sm danger" data-pr="del" data-i="' + i + '" title="Hapus">' + icon('trash', 15) + '</button>' +
          '</div></li>';
      }).join('') + '</ul></div>';
    return {
      html: html,
      mount: function (root) {
        root.querySelector('#addPrompt').addEventListener('click', addPrompt);
        root.querySelectorAll('[data-pr]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const i = Number(b.getAttribute('data-i'));
            const arr = db.prompts();
            if (b.getAttribute('data-pr') === 'del') {
              const ok = await ui.confirm('Hapus prompt ini?', { danger: true, ok: 'Hapus' });
              if (!ok) return;
              arr.splice(i, 1); db.savePrompts(arr);
              ui.toast('Prompt dihapus', 'success');
              refreshAdmin();
            } else {
              const v = await ui.promptDialog({ title: 'Edit prompt', label: 'Isi prompt', value: arr[i] });
              if (!v) return;
              arr[i] = v; db.savePrompts(arr);
              ui.toast('Prompt diperbarui', 'success');
              refreshAdmin();
            }
          });
        });
      }
    };
  }

  async function addPrompt() {
    const v = await ui.promptDialog({
      title: 'Tambah prompt',
      label: 'Contoh: Landing page barbershop modern bernama Cukur Rapi',
      placeholder: 'Tulis prompt yang bagus…'
    });
    if (!v) return;
    const arr = db.prompts();
    arr.unshift(v);
    db.savePrompts(arr);
    db.log('admin', 'tambah prompt');
    ui.toast('Prompt ditambahkan', 'success');
    refreshAdmin();
  }

  /* ============================================================
     6. Kunci API
     ============================================================ */
  function keysSection() {
    const s = db.settings();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('key', 18) + ' Konfigurasi AI Global</h3>' +
      '<span class="tag warn">Disimpan di localStorage</span></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span>Penyedia AI default</span><select id="kProvider" class="input">' + A.ai.providers.map(function (p) {
        return '<option value="' + p.id + '"' + (s.provider === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>';
      }).join('') + '</select></label>' +
      '<label class="field"><span>Model</span><input id="kModel" class="input" value="' + esc(s.model) + '" placeholder="openai / gemini-2.0-flash / llama-3.3-70b-versatile"></label>' +
      '<label class="field"><span>Temperature (' + s.temperature + ')</span><input id="kTemp" class="input" type="range" min="0" max="1" step="0.05" value="' + s.temperature + '"></label>' +
      '<label class="field"><span>Bahasa hasil</span><select id="kLang" class="input"><option value="id"' + (s.language === 'id' ? ' selected' : '') + '>Indonesia</option><option value="en"' + (s.language === 'en' ? ' selected' : '') + '>English</option></select></label>' +
      '</div>' +
      '<div class="form-grid mt-1">' +
      keyField('Gemini', 'kGemini', s.keys.gemini, 'AIza…') +
      keyField('Groq', 'kGroq', s.keys.groq, 'gsk_…') +
      keyField('OpenRouter', 'kOpenrouter', s.keys.openrouter, 'sk-or-…') +
      keyField('Custom', 'kCustom', s.keys.custom, 'sk-…') +
      keyField('9Router', 'kNinerouter', s.keys.ninerouter, 'opsional / dari dashboard 9Router') +
      '<label class="field"><span>Custom base URL</span><input id="kCustomBase" class="input" value="' + esc(s.customBase) + '"></label>' +
      '<label class="field"><span>Custom model</span><input id="kCustomModel" class="input" value="' + esc(s.customModel) + '"></label>' +
      '</div>' +
      '<div class="form-actions"><button class="btn primary" id="saveKeys">' + icon('save', 16) + ' Simpan konfigurasi</button>' +
      '<button class="btn ghost" id="testAI">' + icon('zap', 16) + ' Tes koneksi AI</button></div>' +
      '<div id="keyMsg" class="form-msg" hidden></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('rocket', 18) + ' Token Hosting</h3></div>' +
      '<div class="form-grid">' +
      keyField('Netlify token', 'kNetlify', s.keys.netlify, 'nfp_…') +
      keyField('Vercel token', 'kVercel', s.keys.vercel, 'token Vercel') +
      keyField('Cloudflare token', 'kCf', s.keys.cloudflare, 'token API') +
      keyField('Cloudflare Account ID', 'kCfAcc', s.keys.cloudflareAccount, '32 karakter hex') +
      '</div>' +
      '<div class="form-actions"><button class="btn primary" id="saveTokens">' + icon('save', 16) + ' Simpan token</button>' +
      '<button class="btn ghost" data-verify="netlify">Tes Netlify</button>' +
      '<button class="btn ghost" data-verify="vercel">Tes Vercel</button>' +
      '<button class="btn ghost" data-verify="cloudflare">Tes Cloudflare</button></div>' +
      '<div id="tokMsg" class="form-msg" hidden></div>' +
      '<p class="muted small mt-1">Token hanya untuk perangkat ini. Jika browser memblokir CORS, gunakan tombol ZIP + Netlify Drop.</p></div>';

    return {
      html: html,
      mount: function (root) {
        const provSel = root.querySelector('#kProvider');
        if (provSel) provSel.addEventListener('change', function () {
          const p = A.ai.providers.find(function (x) { return x.id === provSel.value; });
          const mi = root.querySelector('#kModel');
          if (p && mi && p.model) mi.value = p.model;
        });
        root.querySelector('#saveKeys').addEventListener('click', function () {
          const s2 = db.settings();
          s2.provider = root.querySelector('#kProvider').value;
          s2.model = root.querySelector('#kModel').value.trim();
          s2.temperature = Number(root.querySelector('#kTemp').value);
          s2.language = root.querySelector('#kLang').value;
          s2.keys.gemini = root.querySelector('#kGemini').value.trim();
          s2.keys.groq = root.querySelector('#kGroq').value.trim();
          s2.keys.openrouter = root.querySelector('#kOpenrouter').value.trim();
          s2.keys.custom = root.querySelector('#kCustom').value.trim();
          s2.keys.ninerouter = root.querySelector('#kNinerouter').value.trim();
          s2.customBase = root.querySelector('#kCustomBase').value.trim();
          s2.customModel = root.querySelector('#kCustomModel').value.trim();
          db.saveSettings(s2);
          showMsg(root.querySelector('#keyMsg'), 'success', 'Konfigurasi AI disimpan.');
          db.log('admin', 'simpan konfigurasi AI');
          window.Aethel.app.applySettings();
        });
        root.querySelector('#saveTokens').addEventListener('click', function () {
          const s2 = db.settings();
          s2.keys.netlify = root.querySelector('#kNetlify').value.trim();
          s2.keys.vercel = root.querySelector('#kVercel').value.trim();
          s2.keys.cloudflare = root.querySelector('#kCf').value.trim();
          s2.keys.cloudflareAccount = root.querySelector('#kCfAcc').value.trim();
          db.saveSettings(s2);
          showMsg(root.querySelector('#tokMsg'), 'success', 'Token hosting disimpan.');
          db.log('admin', 'simpan token hosting');
        });
        root.querySelector('#testAI').addEventListener('click', async function () {
          const btn = this;
          btn.disabled = true; btn.textContent = 'Menguji…';
          const msg = root.querySelector('#keyMsg');
          try {
            const s2 = db.settings();
            s2.provider = root.querySelector('#kProvider').value;
            s2.model = root.querySelector('#kModel').value.trim();
            s2.temperature = Number(root.querySelector('#kTemp').value);
            s2.language = root.querySelector('#kLang').value;
            s2.keys = Object.assign({}, s2.keys, {
              gemini: root.querySelector('#kGemini').value.trim(),
              groq: root.querySelector('#kGroq').value.trim(),
              openrouter: root.querySelector('#kOpenrouter').value.trim(),
              custom: root.querySelector('#kCustom').value.trim(),
              ninerouter: root.querySelector('#kNinerouter').value.trim()
            });
            s2.customBase = root.querySelector('#kCustomBase').value.trim();
            s2.customModel = root.querySelector('#kCustomModel').value.trim();
            const res = await A.ai.test(s2);
            showMsg(msg, 'success', res);
          } catch (e) {
            showMsg(msg, 'error', 'Gagal: ' + e.message);
          } finally { btn.disabled = false; btn.innerHTML = icon('zap', 16) + ' Tes koneksi AI'; }
        });
        root.querySelectorAll('[data-verify]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const provider = b.getAttribute('data-verify');
            const token = provider === 'netlify' ? root.querySelector('#kNetlify').value :
              provider === 'vercel' ? root.querySelector('#kVercel').value : root.querySelector('#kCf').value;
            const msg = root.querySelector('#tokMsg');
            if (!token) return showMsg(msg, 'error', 'Isi token terlebih dahulu.');
            b.disabled = true;
            try {
              const res = await A.deploy.verify(provider, { token: token });
              showMsg(msg, 'success', res);
            } catch (e) { showMsg(msg, 'error', e.message); }
            finally { b.disabled = false; }
          });
        });
      }
    };
  }

  function keyField(label, id, value, ph) {
    return '<label class="field"><span>' + esc(label) + '</span><div class="input-with-btn">' +
      '<input id="' + id + '" class="input" type="password" value="' + esc(value || '') + '" placeholder="' + esc(ph || '') + '">' +
      '<button type="button" class="icon-btn sm reveal-key" data-for="' + id + '" title="Lihat">' + icon('eye', 15) + '</button></div></label>';
  }

  function showMsg(el, type, text) {
    if (!el) return;
    el.hidden = false;
    el.className = 'form-msg ' + (type === 'error' ? 'error' : 'success');
    el.textContent = text;
  }

  /* ============================================================
     7. Situs
     ============================================================ */
  function siteSection() {
    const s = db.settings();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('settings', 18) + ' Identitas Aplikasi</h3></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span>Nama aplikasi</span><input id="sAppName" class="input" value="' + esc(s.appName) + '"></label>' +
      '<label class="field"><span>Tagline</span><input id="sTagline" class="input" value="' + esc(s.tagline) + '"></label>' +
      '<label class="field"><span>Versi</span><input id="sVersion" class="input" value="' + esc(s.version) + '"></label>' +
      '<label class="field"><span>Warna aksen</span><input id="sAccent" type="color" class="input color" value="' + esc(s.accent) + '"></label>' +
      '<label class="field"><span>Tema default</span><select id="sTheme" class="input"><option value="dark"' + (s.theme === 'dark' ? ' selected' : '') + '>Gelap</option><option value="light"' + (s.theme === 'light' ? ' selected' : '') + '>Terang</option></select></label>' +
      '<label class="field"><span>Mode perawatan</span><select id="sMaint" class="input"><option value="0"' + (!s.maintenance ? ' selected' : '') + '>Nonaktif</option><option value="1"' + (s.maintenance ? ' selected' : '') + '>Aktif (kecuali admin)</option></select></label>' +
      '</div>' +
      '<div class="form-actions"><button class="btn primary" id="saveSite">' + icon('save', 16) + ' Simpan pengaturan situs</button></div>' +
      '<div id="siteMsg" class="form-msg" hidden></div></div>' +
      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('eye', 18) + ' Pratinjau Identitas</h3></div>' +
      '<div class="brand-preview"><span class="brand-mark">A</span><div><b>' + esc(s.appName) + '<span class="grad">AI</span></b><small>' + esc(s.tagline) + '</small></div></div>' +
      '<p class="muted small">Perubahan langsung terlihat di header setelah disimpan.</p></div>';

    return {
      html: html,
      mount: function (root) {
        root.querySelector('#saveSite').addEventListener('click', function () {
          db.saveSettings({
            appName: root.querySelector('#sAppName').value.trim() || 'AethelStudio',
            tagline: root.querySelector('#sTagline').value.trim(),
            version: root.querySelector('#sVersion').value.trim() || '1.0.0',
            accent: root.querySelector('#sAccent').value,
            theme: root.querySelector('#sTheme').value,
            maintenance: root.querySelector('#sMaint').value === '1'
          });
          db.log('admin', 'perbarui identitas situs');
          showMsg(root.querySelector('#siteMsg'), 'success', 'Pengaturan situs disimpan.');
          window.Aethel.app.applySettings();
        });
      }
    };
  }

  /* ============================================================
     8. Log
     ============================================================ */
  function logsSection() {
    const logs = db.logs();
    const html = '<div class="panel"><div class="panel-head"><h3>' + icon('clock', 18) + ' Log Aktivitas (' + logs.length + ')</h3>' +
      '<div class="row-actions"><button class="btn sm ghost" id="exportLogs">Ekspor JSON</button>' +
      '<button class="btn sm danger" id="clearLogs">Bersihkan</button></div></div>' +
      '<div class="toolbar"><div class="search-box">' + icon('search', 16) + '<input id="logSearch" placeholder="Cari aksi, aktor, atau detail…"></div>' +
      '<span class="muted small">Maksimal 800 entri terakhir</span></div>' +
      (logs.length ? '<div class="table-wrap"><table class="table" id="logTable"><thead><tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Detail</th></tr></thead><tbody>' +
        logs.map(function (l) {
          return '<tr data-search="' + esc((l.actor + ' ' + l.action + ' ' + l.detail).toLowerCase()) + '">' +
            '<td class="muted small nowrap">' + util.date(l.t) + '</td>' +
            '<td class="mono small">' + esc(l.actor) + '</td>' +
            '<td><span class="tag ' + (/deploy/.test(l.action) ? 'ok' : '') + '">' + esc(l.action) + '</span></td>' +
            '<td class="small">' + esc(l.detail) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="muted small">Belum ada log.</p>') + '</div>';
    return {
      html: html,
      mount: function (root) {
        const s = root.querySelector('#logSearch');
        if (s) s.addEventListener('input', function () {
          const q = s.value.toLowerCase();
          root.querySelectorAll('#logTable tbody tr').forEach(function (tr) {
            tr.style.display = tr.getAttribute('data-search').indexOf(q) !== -1 ? '' : 'none';
          });
        });
        root.querySelector('#exportLogs').addEventListener('click', function () {
          util.download(new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' }), 'aethel-logs.json');
        });
        root.querySelector('#clearLogs').addEventListener('click', async function () {
          const ok = await ui.confirm('Hapus semua log aktivitas?', { danger: true, ok: 'Hapus' });
          if (!ok) return;
          db.clearLogs();
          ui.toast('Log dibersihkan', 'success');
          refreshAdmin();
        });
      }
    };
  }

  /* ============================================================
     9. Notifikasi
     ============================================================ */
  function notifySection() {
    const s = db.settings();
    return {
      html: '<div class="panel"><div class="panel-head"><h3>' + icon('bell', 18) + ' Pengumuman untuk Pengguna</h3></div>' +
        '<p class="muted small">Tampil sebagai banner di bagian atas aplikasi. Pengguna dapat menutupnya; reset untuk menampilkan ulang.</p>' +
        '<label class="field full"><span>Isi pengumuman</span><textarea id="annText" class="input" rows="3" placeholder="Contoh: Fitur hosting Vercel baru saja ditambahkan!">' + esc(s.announcement || '') + '</textarea></label>' +
        '<div class="form-actions"><button class="btn primary" id="saveAnn">' + icon('bell', 16) + ' Tampilkan pengumuman</button>' +
        '<button class="btn ghost" id="clearAnn">Sembunyikan</button>' +
        '<button class="btn ghost" id="resetDismiss">Tampilkan ulang ke semua</button></div>' +
        '<div class="announce-preview">' + icon('bell', 16) + '<span>' + (s.announcement ? esc(s.announcement) : 'Pratinjau pengumuman akan muncul di sini…') + '</span></div>' +
        '<div id="annMsg" class="form-msg" hidden></div></div>' +
        '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('sparkles', 18) + ' Ide Notifikasi</h3></div>' +
        '<div class="prompt-list static">' + [
          'Fitur hosting Cloudflare baru saja tersedia — coba sekarang!',
          'Gunakan AI gratis Groq untuk hasil lebih cepat dan kreatif.',
          'Jangan lupa unduh ZIP proyek Anda sebagai cadangan.',
          'Template baru: Undangan Pernikahan & Event Seminar.'
        ].map(function (t) {
          return '<li><span class="idx">✦</span><p>' + esc(t) + '</p><button class="btn sm ghost" data-use="' + esc(t) + '">Pakai</button></li>';
        }).join('') + '</div></div>',
      mount: function (root) {
        root.querySelector('#saveAnn').addEventListener('click', function () {
          const text = root.querySelector('#annText').value.trim();
          db.saveSettings({ announcement: text });
          db.log('admin', 'perbarui pengumuman');
          window.Aethel.app.applySettings();
          showMsg(root.querySelector('#annMsg'), 'success', 'Pengumuman ditampilkan.');
          refreshAdmin();
        });
        root.querySelector('#clearAnn').addEventListener('click', function () {
          db.saveSettings({ announcement: '' });
          window.Aethel.app.applySettings();
          ui.toast('Pengumuman disembunyikan', 'success');
          refreshAdmin();
        });
        root.querySelector('#resetDismiss').addEventListener('click', function () {
          localStorage.setItem(A.K.dismissed, '[]');
          window.Aethel.app.applySettings();
          ui.toast('Pengumuman akan tampil kembali', 'success');
        });
        root.querySelectorAll('[data-use]').forEach(function (b) {
          b.addEventListener('click', function () {
            root.querySelector('#annText').value = b.getAttribute('data-use');
          });
        });
      }
    };
  }

  /* ============================================================
     10. Backup
     ============================================================ */
  function backupSection() {
    const data = db.exportAll();
    const json = JSON.stringify(data, null, 2);
    return {
      html: '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>' + icon('download', 18) + ' Backup Data</h3></div>' +
        '<p class="muted small">Mengunduh seluruh data aplikasi (pengguna, proyek, pengaturan, log, metrik) dalam satu berkas JSON.</p>' +
        '<div class="backup-facts"><div><b>' + db.users().length + '</b><span>pengguna</span></div><div><b>' + db.projects().length + '</b><span>proyek</span></div>' +
        '<div><b>' + util.bytes(new Blob([json]).size) + '</b><span>ukuran</span></div></div>' +
        '<div class="form-actions"><button class="btn primary" id="doBackup">' + icon('download', 16) + ' Unduh backup JSON</button>' +
        '<button class="btn ghost" id="backupZip">' + icon('download', 16) + ' Unduh semua proyek (ZIP)</button></div></div>' +
        '<div class="panel"><div class="panel-head"><h3>' + icon('upload', 18) + ' Restore Data</h3></div>' +
        '<p class="muted small">Impor berkas backup JSON. Data saat ini akan ditimpa untuk kategori yang ada di berkas.</p>' +
        '<label class="upload-zone" id="restoreZone"><input type="file" id="restoreFile" accept=".json,application/json" hidden>' +
        icon('upload', 28) + '<b>Pilih berkas backup</b><small>atau tarik ke sini · .json</small></label>' +
        '<div id="restoreMsg" class="form-msg" hidden></div></div></div>' +
        '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('database', 18) + ' Info Penyimpanan</h3></div>' +
        '<div class="kv"><span>localStorage terpakai</span><b>' + util.bytes(storageBytes()) + '</b></div>' +
        '<div class="kv"><span>Batas umum browser</span><b>±5 MB</b></div>' +
        '<div class="kv"><span>Jumlah kunci</span><b>' + localStorage.length + '</b></div>' +
        '<p class="muted small">Data tersimpan per-browser. Membersihkan data situs akan menghapus semuanya.</p></div>',
      mount: function (root) {
        root.querySelector('#doBackup').addEventListener('click', doBackup);
        root.querySelector('#backupZip').addEventListener('click', function () {
          const payload = {};
          db.allProjects().forEach(function (p) {
            Object.keys(p.files || {}).forEach(function (f) {
              payload[util.slug(p.title) + '/' + f] = p.files[f];
            });
          });
          payload['projects.json'] = JSON.stringify(db.allProjects(), null, 2);
          A.zip.download(payload, 'aethel-proyek-' + new Date().toISOString().slice(0, 10) + '.zip');
        });
        const zone = root.querySelector('#restoreZone');
        const file = root.querySelector('#restoreFile');
        zone.addEventListener('click', function () { file.click(); });
        file.addEventListener('change', async function () {
          const f = file.files[0];
          if (!f) return;
          const msg = root.querySelector('#restoreMsg');
          try {
            const parsed = JSON.parse(await util.fileToText(f));
            const ok = await ui.confirm('Impor backup ini? Data saat ini akan diganti.', { danger: true, ok: 'Impor' });
            if (!ok) return;
            db.importAll(parsed);
            db.log('admin', 'restore backup ' + f.name);
            showMsg(msg, 'success', 'Backup berhasil dipulihkan. Muat ulang halaman bila perlu.');
            ui.toast('Backup dipulihkan', 'success');
            window.Aethel.app.applySettings();
            setTimeout(function () { location.reload(); }, 900);
          } catch (e) {
            showMsg(msg, 'error', 'Gagal: ' + e.message);
          }
        });
        ['dragenter', 'dragover'].forEach(function (ev) {
          zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('drag'); });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
          zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('drag'); });
        });
        zone.addEventListener('drop', function (e) {
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            file.files = e.dataTransfer.files;
            file.dispatchEvent(new Event('change'));
          }
        });
      }
    };
  }

  function doBackup() {
    const data = db.exportAll();
    const name = 'aethel-backup-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
    util.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), name);
    db.log('admin', 'backup data → ' + name);
  }

  /* ============================================================
     11. Fitur
     ============================================================ */
  function featuresSection() {
    const s = db.settings();
    const f = s.features || {};
    const items = [
      ['chat', 'Generator AI', 'Izinkan pengguna membuat website dari prompt.'],
      ['templates', 'Galeri Template', 'Tampilkan template premium bawaan.'],
      ['images', 'Gambar AI', 'Akses pembuatan gambar gratis (Pollinations).'],
      ['deploy', 'Hosting Langsung', 'Deploy ke Netlify / Vercel / Cloudflare dari aplikasi.'],
      ['guest', 'Mode Tamu', 'Izinkan penggunaan tanpa akun.'],
      ['registration', 'Pendaftaran Pengguna', 'Izinkan pengguna membuat akun baru.']
    ];
    return {
      html: '<div class="panel"><div class="panel-head"><h3>' + icon('zap', 18) + ' Sakelar Fitur</h3></div>' +
        '<p class="muted small">Matikan fitur untuk menyederhanakan aplikasi. Admin selalu dapat mengakses semua fitur.</p>' +
        '<div class="toggle-list">' + items.map(function (it) {
          return '<label class="toggle-row"><div><b>' + esc(it[1]) + '</b><small>' + esc(it[2]) + '</small></div>' +
            '<input type="checkbox" data-feat="' + it[0] + '"' + (f[it[0]] !== false ? ' checked' : '') + '><span class="switch"></span></label>';
        }).join('') + '</div>' +
        '<div class="form-actions"><button class="btn primary" id="saveFeatures">' + icon('save', 16) + ' Simpan fitur</button></div>' +
        '<div id="featMsg" class="form-msg" hidden></div></div>',
      mount: function (root) {
        root.querySelector('#saveFeatures').addEventListener('click', function () {
          const patch = { features: {} };
          root.querySelectorAll('[data-feat]').forEach(function (cb) {
            patch.features[cb.getAttribute('data-feat')] = cb.checked;
          });
          db.saveSettings(patch);
          db.log('admin', 'perbarui sakelar fitur');
          showMsg(root.querySelector('#featMsg'), 'success', 'Fitur disimpan.');
          window.Aethel.app.applySettings();
          window.Aethel.app.render();
        });
      }
    };
  }

  /* ============================================================
     12. Zona bahaya
     ============================================================ */
  function dangerSection() {
    return {
      html: '<div class="panel danger-panel"><div class="panel-head"><h3>' + icon('shield', 18) + ' Tindakan Berbahaya</h3></div>' +
        '<p class="muted small">Tindakan di bawah ini permanen dan tidak dapat dibatalkan. Unduh backup terlebih dahulu.</p>' +
        '<div class="danger-list">' +
        dangerRow('Hapus semua proyek', 'Semua website tersimpan akan hilang, pengguna tetap ada.', 'clearProjects') +
        dangerRow('Hapus semua log', 'Riwayat aktivitas dibersihkan.', 'clearLogs') +
        dangerRow('Hapus semua template kustom', 'Template buatan admin dihapus; preset bawaan tetap.', 'clearTemplates') +
        dangerRow('Reset pengaturan', 'Kembali ke konfigurasi awal (AI, tema, fitur).', 'resetSettings') +
        dangerRow('Reset pabrik', 'Hapus SEMUA data termasuk pengguna dan proyek. Admin utama dibuat ulang.', 'factory') +
        '</div></div>' +
        '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('gauge', 18) + ' Kesehatan Aplikasi</h3></div>' +
        '<div class="kv"><span>Penyimpanan</span><b>' + util.bytes(storageBytes()) + '</b></div>' +
        '<div class="kv"><span>Proyek</span><b>' + db.projects().length + '</b></div>' +
        '<div class="kv"><span>Pengguna</span><b>' + db.users().length + '</b></div>' +
        '<div class="kv"><span>Log</span><b>' + db.logs().length + '</b></div>' +
        '<div class="form-actions"><button class="btn ghost" id="checkIntegrity">Periksa integritas data</button></div>' +
        '<div id="intMsg" class="form-msg" hidden></div></div>',
      mount: function (root) {
        root.querySelectorAll('[data-danger]').forEach(function (b) {
          b.addEventListener('click', async function () {
            const act = b.getAttribute('data-danger');
            const ok = await ui.confirm('Yakin ingin melanjutkan tindakan ini? Tindakan permanen.', { danger: true, ok: 'Ya, lanjutkan', title: 'Konfirmasi' });
            if (!ok) return;
            if (act === 'clearProjects') {
              localStorage.setItem(A.K.projects, '[]');
              db.log('admin', 'hapus semua proyek');
              ui.toast('Semua proyek dihapus', 'success');
            } else if (act === 'clearLogs') {
              db.clearLogs(); ui.toast('Log dihapus', 'success');
            } else if (act === 'clearTemplates') {
              db.saveTemplates([]); ui.toast('Template kustom dihapus', 'success');
            } else if (act === 'resetSettings') {
              db.resetSettings(); window.Aethel.app.applySettings(); ui.toast('Pengaturan direset', 'success');
            } else if (act === 'factory') {
              const t = await ui.promptDialog({ title: 'Reset pabrik', label: 'Ketik RESET untuk mengonfirmasi', placeholder: 'RESET' });
              if (t !== 'RESET') return ui.toast('Dibatalkan — teks tidak cocok.', 'error');
              db.wipe(false);
              localStorage.removeItem(A.K.session);
              db.log('admin', 'reset pabrik');
              location.reload();
              return;
            }
            refreshAdmin();
          });
        });
        root.querySelector('#checkIntegrity').addEventListener('click', function () {
          const issues = [];
          db.projects().forEach(function (p) {
            if (!p.files || !p.files['index.html']) issues.push('Proyek "' + p.title + '" tidak punya index.html');
          });
          if (!db.users().some(function (u) { return u.role === 'admin'; })) issues.push('Tidak ada akun admin aktif');
          const msg = root.querySelector('#intMsg');
          if (issues.length) showMsg(msg, 'error', issues.length + ' masalah: ' + issues.join('; '));
          else showMsg(msg, 'success', 'Semua data terlihat sehat ✓ (' + db.projects().length + ' proyek, ' + db.users().length + ' pengguna)');
        });
      }
    };
  }

  function dangerRow(title, desc, act) {
    return '<div class="danger-row"><div><b>' + esc(title) + '</b><small>' + esc(desc) + '</small></div>' +
      '<button class="btn sm danger" data-danger="' + act + '">Jalankan</button></div>';
  }

  function refreshAdmin() {
    const r = render();
    const host = document.getElementById('view');
    if (!host) return;
    host.innerHTML = r.html;
    if (r.mount) r.mount(host);
  }

  const sections = {
    overview: overview,    users: usersSection,
    projects: projectsSection,
    templates: templatesSection,
    prompts: promptsSection,
    keys: keysSection,
    site: siteSection,
    logs: logsSection,
    notify: notifySection,
    backup: backupSection,
    features: featuresSection,
    danger: dangerSection
  };

  /* delegasi tombol lihat kunci (semua seksi) */
  document.addEventListener('click', function (e) {
    const b = e.target.closest && e.target.closest('.reveal-key');
    if (!b) return;
    const input = document.getElementById(b.getAttribute('data-for'));
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    b.style.opacity = input.type === 'text' ? '1' : '.7';
  });

  window.Aethel.admin = { render: render, tabs: TABS, setTab: function (t) { activeTab = t; } };
})();
