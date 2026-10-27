/* ============================================================
   AethelStudio AI — app.js
   Router, beranda/chat, studio editor, proyek, template, hosting.
   ============================================================ */
(function () {
  'use strict';

  const A = window.Aethel;
  const db = A.db, util = A.util, ui = A.ui, router = A.router, icon = A.icon;
  const ai = A.ai, gen = A.gen, zip = A.zip, deploy = A.deploy;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  const state = {
    chat: [],
    generating: false,
    progress: '',
    editor: { project: null, file: 'index.html', dirty: false, mode: 'code' },
    adminTap: { count: 0, timer: null },
    lastSiteId: null
  };
  window.A_STATE = state;

  /* ============================================================
     Helper umum
     ============================================================ */
  function settings() { return db.settings(); }

  function fileSize(files) {
    let n = 0;
    Object.keys(files || {}).forEach(function (k) { n += new Blob([files[k]]).size; });
    return util.bytes(n);
  }

  function sessionBadge(provider) {
    if (provider === 'template') return '<span class="badge">template</span>';
    if (provider === 'offline') return '<span class="badge">offline engine</span>';
    const m = ai.meta(provider);
    return '<span class="badge">' + util.esc(m ? m.id : (provider || 'unknown')) + '</span>';
  }

  /** Gabungkan CSS/JS ke dalam HTML untuk pratinjau. */
  function buildPreview(files) {
    files = files || {};
    let html = files['index.html'] || '<!doctype html><html><body style="font-family:sans-serif;padding:40px">Belum ada index.html.</body></html>';
    let usedCss = false, usedJs = false;

    Object.keys(files).forEach(function (name) {
      if (!/\.css$/i.test(name)) return;
      const re = new RegExp('<link[^>]*href=["\'](?:\\./)?' + util.escapeReg(name) + '(?:\\?[^"\']*)?["\'][^>]*>', 'gi');
      if (re.test(html)) {
        usedCss = true;
        html = html.replace(re, '<style>\n' + files[name] + '\n</style>');
      }
    });
    Object.keys(files).forEach(function (name) {
      if (!/\.js$/i.test(name)) return;
      const re = new RegExp('<script[^>]*src=["\'](?:\\./)?' + util.escapeReg(name) + '(?:\\?[^"\']*)?["\'][^>]*>\\s*</script>', 'gi');
      if (re.test(html)) {
        usedJs = true;
        const safe = String(files[name]).replace(/<\/script>/gi, '<\\/script>');
        html = html.replace(re, '<script>\n' + safe + '\n</script>');
      }
    });
    if (!usedCss && files['style.css'] && /<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, '<style>\n' + files['style.css'] + '\n</style>\n</head>');
    }
    if (!usedJs && files['script.js'] && /<\/body>/i.test(html)) {
      const safe = String(files['script.js']).replace(/<\/script>/gi, '<\\/script>');
      html = html.replace(/<\/body>/i, '<script>\n' + safe + '\n</script>\n</body>');
    }
    return html;
  }

  function openInTab(project) {
    const blob = new Blob([buildPreview(project.files)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) ui.toast('Popup diblokir. Izinkan popup untuk melihat preview.', 'error');
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function previewModal(project) {
    let device = 'desktop';
    const m = ui.modal({
      title: project.title || 'Pratinjau',
      size: 'xl',
      body:
        '<div class="preview-toolbar">' +
        '<div class="seg" id="pvDevice">' +
        '<button data-d="mobile" class="' + (device === 'mobile' ? 'on' : '') + '">HP</button>' +
        '<button data-d="tablet" class="' + (device === 'tablet' ? 'on' : '') + '">Tablet</button>' +
        '<button data-d="desktop" class="' + (device === 'desktop' ? 'on' : '') + '">Desktop</button>' +
        '</div><span class="muted small">' + Object.keys(project.files).length + ' file · ' + fileSize(project.files) + '</span></div>' +
        '<div class="preview-shell" id="pvShell" data-device="' + device + '">' +
        '<iframe class="preview-frame" sandbox="allow-scripts allow-forms allow-modals allow-popups" srcdoc="' +
        util.esc(buildPreview(project.files)) + '"></iframe></div>',
      actions: [
        { label: 'Buka tab baru', variant: 'ghost', onClick: function () { openInTab(project); return false; } },
        { label: 'Unduh ZIP', variant: 'ghost', onClick: function () { downloadProject(project); return false; } },
        { label: 'Edit di Studio', variant: 'primary', onClick: function () { openStudio(project.id); } }
      ]
    });
    m.el.querySelectorAll('#pvDevice button').forEach(function (b) {
      b.addEventListener('click', function () {
        device = b.getAttribute('data-d');
        m.el.querySelectorAll('#pvDevice button').forEach(function (x) { x.classList.toggle('on', x === b); });
        m.el.querySelector('#pvShell').setAttribute('data-device', device);
      });
    });
  }

  function siteCard(project) {
    const pv = buildPreview(project.files);
    return '<article class="site-card">' +
      '<div class="site-thumb"><iframe loading="lazy" tabindex="-1" aria-hidden="true" sandbox="allow-scripts" srcdoc="' + util.esc(pv) + '"></iframe>' +
      '<span class="thumb-pill">Live preview</span></div>' +
      '<div class="site-body">' +
      '<div class="site-title-row"><h4>' + util.esc(project.title) + '</h4>' +
      (project.favorite ? '<span class="fav on">★</span>' : '') + '</div>' +
      '<p>' + util.esc(project.description || '') + '</p>' +
      '<div class="site-meta"><span>' + Object.keys(project.files).length + ' file</span><i>·</i><span>' + fileSize(project.files) + '</span><i>·</i>' + sessionBadge(project.provider) + '</div>' +
      '<div class="site-actions">' +
      '<button class="btn sm primary" data-act="studio" data-id="' + project.id + '">' + icon('code', 15) + ' Edit</button>' +
      '<button class="btn sm ghost" data-act="preview" data-id="' + project.id + '">' + icon('eye', 15) + ' Preview</button>' +
      '<button class="btn sm ghost" data-act="zip" data-id="' + project.id + '">' + icon('download', 15) + ' ZIP</button>' +
      '<button class="btn sm ghost" data-act="deploy" data-id="' + project.id + '">' + icon('rocket', 15) + ' Hosting</button>' +
      '</div></div></article>';
  }

  function bindSiteActions(root) {
    $$('[data-act]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const project = db.getProject(id);
        if (!project) return ui.toast('Proyek tidak ditemukan.', 'error');
        const act = btn.getAttribute('data-act');
        if (act === 'studio') openStudio(id);
        else if (act === 'preview') previewModal(project);
        else if (act === 'zip') downloadProject(project);
        else if (act === 'deploy') { location.hash = '#/deploy/' + id; }
      });
    });
  }

  function downloadProject(project) {
    const blob = deploy.projectZip(project);
    const fname = util.slug(project.title) + '.zip';
    util.download(blob, fname).then(function (ok) {
      if (ok) {
        db.track('download');
        db.log('download', project.title + ' → ' + fname);
      }
    });
  }

  function createProject(data) {
    const me = A.auth.current();
    const now = Date.now();
    const project = {
      id: util.uid('prj'),
      title: data.title || 'Website Baru',
      description: data.description || '',
      tags: data.tags || [],
      files: data.files || {},
      provider: data.provider || 'offline',
      owner: me ? me.id : 'guest',
      favorite: !!data.favorite,
      createdAt: now,
      updatedAt: now,
      deployed: null
    };
    db.saveProject(project);
    return project;
  }

  function openStudio(id) { location.hash = '#/studio/' + id; }

  function projectOptions(selected) {
    const list = db.myProjects();
    if (!list.length) return '<option value="">— belum ada proyek —</option>';
    return list.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === selected ? ' selected' : '') + '>' + util.esc(p.title) + '</option>';
    }).join('');
  }

  /* ============================================================
     Navigasi & kerangka
     ============================================================ */
  const NAV = [
    { group: 'Buat', items: [
      { id: 'home', label: 'Beranda', icon: 'sparkles', hint: 'Generate dari prompt' },
      { id: 'studio', label: 'Studio', icon: 'code', hint: 'Edit kode & preview' },
      { id: 'projects', label: 'Proyek', icon: 'folder', hint: 'Semua karya Anda' },
      { id: 'templates', label: 'Template', icon: 'grid', hint: 'Mulai lebih cepat' }
    ] },
    { group: 'Publikasi', items: [
      { id: 'deploy', label: 'Hosting', icon: 'rocket', hint: 'Vercel · Netlify · CF' },
      { id: 'images', label: 'Gambar AI', icon: 'image', hint: 'Aset visual gratis' }
    ] },
    { group: 'Kreatif', items: [
      { id: 'seo', label: 'SEO Toolkit', icon: 'search', hint: 'Audit & meta tag' },
      { id: 'palette', label: 'Palet Warna', icon: 'palette', hint: 'Harmoni warna' },
      { id: 'qr', label: 'QR Code', icon: 'qr', hint: 'Bagikan link' }
    ] },
    { group: 'Developer', items: [
      { id: 'snippets', label: 'Cuplikan Kode', icon: 'snippet', hint: 'Komponen siap pakai' },
      { id: 'codefix', label: 'File & Kode', icon: 'code', hint: 'Perbaiki file dari HP' },
      { id: 'tools', label: 'Alat Bantu', icon: 'tools', hint: '6 utilitas cepat' }
    ] },
    { group: 'Sistem', items: [
      { id: 'settings', label: 'Pengaturan', icon: 'settings', hint: 'AI, akun, data' },
      { id: 'help', label: 'Bantuan', icon: 'help', hint: 'Panduan & FAQ' }
    ] }
  ];

  function applySettings() {
    const s = settings();
    document.documentElement.setAttribute('data-theme', s.theme === 'light' ? 'light' : 'dark');
    document.documentElement.style.setProperty('--accent', s.accent || '#2dd4bf');
    const brand = $('#brandName');
    if (brand) brand.innerHTML = util.esc(s.appName);
    const tag = $('#brandTag'); if (tag) tag.textContent = s.tagline;
    const foot = $('#footBrand'); if (foot) foot.textContent = s.appName;
    const ver = $('#versionText'); if (ver) ver.textContent = 'v' + s.version;
    document.title = s.appName + ' — ' + s.tagline;

    const me = A.auth.current();
    const av = $('#avatarInitial');
    if (av) {
      if (me && me.avatar) {
        av.classList.add('has-img');
        av.innerHTML = '<img src="' + util.esc(me.avatar) + '" alt="Foto profil">';
      } else {
        av.classList.remove('has-img');
        av.textContent = me ? (me.name || me.email).charAt(0).toUpperCase() : '?';
      }
    }
    const dot = $('#liveDot');
    if (dot) dot.title = me ? 'Masuk sebagai ' + me.email : 'Mode tamu';

    const ann = $('#announce');
    if (ann) {
      const text = s.announcement && s.announcement.trim();
      const key = 'ann:' + util.slug(text || '');
      if (text && db.dismissed().indexOf(key) === -1) {
        ann.hidden = false;
        ann.innerHTML = '<div class="announce-in"><span>' + icon('bell', 16) + '</span><p>' + util.esc(text) +
          '</p><button class="icon-btn" id="annClose" aria-label="Tutup">' + icon('x', 15) + '</button></div>';
        const btn = $('#annClose');
        if (btn) btn.addEventListener('click', function () { db.dismiss(key); ann.hidden = true; });
      } else {
        ann.hidden = true;
        ann.innerHTML = '';
      }
    }
    renderNav();
  }

  function renderNav() {
    const nav = $('#navList');
    if (!nav) return;
    const route = router.parse();
    const me = A.auth.current();
    const feats = settings().features || {};
    const isAdmin = !!me && me.role === 'admin';
    nav.innerHTML = NAV.map(function (sec) {
      const items = sec.items.filter(function (it) {
        if (isAdmin) return true;
        if (it.id === 'deploy' && feats.deploy === false) return false;
        if (it.id === 'images' && feats.images === false) return false;
        return true;
      });
      if (!items.length) return '';
      return '<div class="nav-sec"><span class="nav-sec-title">' + sec.group + '</span>' +
        items.map(function (it) {
          return '<a class="nav-item' + (route.path === it.id ? ' active' : '') + '" href="#/' + it.id + '">' +
            '<span class="nav-ic">' + icon(it.icon, 19) + '</span>' +
            '<span class="nav-tx"><b>' + it.label + '</b><small>' + it.hint + '</small></span></a>';
        }).join('') + '</div>';
    }).join('') + (me && me.role === 'admin'
      ? '<div class="nav-sec"><span class="nav-sec-title">Khusus Admin</span>' +
        '<a class="nav-item' + (route.path === 'admin' ? ' active' : '') + '" href="#/admin">' +
        '<span class="nav-ic">' + icon('shield', 19) + '</span><span class="nav-tx"><b>Panel Admin</b><small>Kelola aplikasi</small></span></a></div>'
      : '');

    const usage = $('#usageBox');
    if (usage) {
      const today = new Date().toISOString().slice(0, 10);
      const m = db.metrics()[today] || {};
      const projects = db.myProjects().length;
      usage.innerHTML = '<div class="usage-row"><span>Proyek</span><b>' + projects + '</b></div>' +
        '<div class="usage-row"><span>Generate hari ini</span><b>' + (m.gen || 0) + '</b></div>' +
        '<div class="usage-row"><span>Hosting</span><b>' + (m.deploy || 0) + '</b></div>' +
        '<a class="usage-link" href="#/settings">' + util.esc(ai.meta(settings().provider).name.split('(')[0].trim()) + ' · Ganti AI</a>';
    }
  }

  function openDrawer(open) {
    const d = $('#drawer'), scrim = $('#scrim'), btn = $('#menuBtn');
    if (!d) return;
    d.classList.toggle('open', open);
    d.setAttribute('aria-hidden', open ? 'false' : 'true');
    scrim.classList.toggle('show', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* ============================================================
     Beranda / chat AI
     ============================================================ */
  function composerHtml() {
    const s = settings();
    const meta = ai.meta(s.provider);
    return '<div class="composer-card">' +
      '<textarea id="promptInput" rows="3" placeholder="Ceritakan website yang kamu mau… contoh: \'Landing page kedai kopi bernama Kopi Senja, tema hangat, ada menu dan tombol WhatsApp\'"></textarea>' +
      '<div class="composer-row">' +
      '<div class="composer-left">' +
      '<button class="chip-btn" id="providerChip" title="Ganti penyedia AI">' + icon('zap', 14) + ' ' + util.esc(meta.name.split('(')[0].trim()) + '</button>' +
      '<button class="chip-btn" data-chip="surprise">🎲 Ide acak</button>' +
      '<button class="chip-btn" data-chip="templates">📦 Template</button>' +
      '</div>' +
      '<button class="send-btn" id="sendBtn" title="Generate website">' + icon('sparkles', 18) + '<span>Generate</span></button>' +
      '</div>' +
      '<div class="composer-hint">Enter untuk kirim · Shift+Enter baris baru · Hasil otomatis bisa diunduh sebagai ZIP ke folder Download</div>' +
      '</div>';
  }

  function wireComposer(root, onSend) {
    const input = $('#promptInput', root);
    const btn = $('#sendBtn', root);
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(input.value); }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    });
    if (btn) btn.addEventListener('click', function () { onSend(input.value); });
    const chip = $('#providerChip', root);
    if (chip) chip.addEventListener('click', function () { location.hash = '#/settings'; });
    $$('[data-chip]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-chip') === 'templates') { location.hash = '#/templates'; return; }
        const list = db.prompts();
        const p = list[Math.floor(Math.random() * list.length)];
        input.value = p;
        input.focus();
      });
    });
  }

  function renderHome() {
    const s = settings();
    if (s.features && s.features.chat === false && !A.auth.isAdmin()) {
      return {
        html: '<div class="empty-state tall"><div class="empty-ic">' + icon('sparkles', 34) + '</div>' +
          '<h2>Generator AI dinonaktifkan</h2><p>Administrator sedang menonaktifkan pembuatan website dari prompt. ' +
          'Anda masih bisa memakai template, mengedit proyek, dan mengunduh ZIP.</p>' +
          '<div class="empty-actions"><a class="btn primary" href="#/templates">Lihat template</a>' +
          '<a class="btn ghost" href="#/projects">Proyek saya</a></div></div>',
        mount: function () {}
      };
    }
    const hasChat = state.chat.length > 0;
    let html = '';

    if (!hasChat) {
      html += '<section class="hero-home">' +
        '<span class="hero-badge">' + icon('sparkles', 14) + ' AI Web Builder · Gratis · Tanpa API key</span>' +
        '<h1>Dari prompt, jadi <span class="grad">website nyata.</span></h1>' +
        '<p class="hero-sub">Ketik ide Anda. AethelStudio menyusun HTML, CSS, dan JavaScript, menampilkan pratinjau langsung, lalu siap diunduh sebagai ZIP ke folder <b>Download</b> — atau dihosting dalam satu klik.</p>' +
        '<div class="hero-tags">' +
        '<span>' + icon('check', 14) + ' Responsif di HP</span>' +
        '<span>' + icon('check', 14) + ' Tanpa coding</span>' +
        '<span>' + icon('check', 14) + ' ZIP siap hosting</span>' +
        '<span>' + icon('check', 14) + ' AI gratis</span>' +
        '</div>' +
        '<div class="prompt-chips">' + db.prompts().slice(0, 4).map(function (p, i) {
          return '<button class="prompt-chip" data-suggest="' + i + '">' + util.esc(p.length > 62 ? p.slice(0, 62) + '…' : p) + '</button>';
        }).join('') + '</div>' +
        '<div class="hero-composer">' + composerHtml() + '</div>' +
        '<div class="hero-steps">' +
        '<div class="step"><span>1</span><b>Ketik prompt</b><small>Jelaskan bisnis & gaya</small></div>' +
        '<div class="step-line"></div>' +
        '<div class="step"><span>2</span><b>AI membuat</b><small>HTML + CSS + JS</small></div>' +
        '<div class="step-line"></div>' +
        '<div class="step"><span>3</span><b>Unduh / hosting</b><small>ZIP ke Download</small></div>' +
        '</div>' +
        '</section>';
      if (s.provider === 'offline') {
        html += '<div class="notice">' + icon('zap', 18) + '<div><b>Mode generator offline aktif.</b> Website dibuat dari template premium tanpa internet. Ubah penyedia AI di <a href="#/settings">Pengaturan</a> untuk hasil dari model AI.</div></div>';
      } else if (s.provider === 'pollinations') {
        html += '<div class="notice">' + icon('zap', 18) + '<div><b>AI gratis tanpa API key punya batas output.</b> Jika jawaban AI terpotong atau kena limit, AethelStudio otomatis memakai generator offline agar website tetap lengkap. Untuk hasil AI penuh, tambahkan API key <b>Groq</b> atau <b>Gemini</b> gratis di <a href="#/settings">Pengaturan</a>, atau pilih <b>Generator Offline</b> untuk hasil instan.</div></div>';
      }
    } else {
      html += '<div class="chat-head"><div><h2>Ruang kerja AI</h2><p class="muted">' + state.chat.length + ' pesan · ' + (s.provider === 'offline' ? 'Generator Offline' : ai.meta(s.provider).name) + '</p></div>' +
        '<button class="btn ghost sm" id="newChatBtn">' + icon('plus', 15) + ' Obrolan baru</button></div>';
      html += '<div class="chat-log" id="chatLog">' + state.chat.map(chatMessageHtml).join('') + '</div>';
      html += '<div class="composer-dock">' + composerHtml() + '</div>';
    }

    return {
      html: html,
      mount: function (root) {
        wireComposer(root, sendPrompt);
        $$('[data-suggest]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            const input = $('#promptInput', root);
            input.value = db.prompts()[Number(b.getAttribute('data-suggest'))] || '';
            input.focus();
          });
        });
        const nc = $('#newChatBtn', root);
        if (nc) nc.addEventListener('click', function () {
          state.chat = [];
          state.lastSiteId = null;
          render();
        });
        bindSiteActions(root);
        if (hasChat) {
          const log = $('#chatLog', root);
          if (log) setTimeout(function () { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 80);
        }
      }
    };
  }

  function chatMessageHtml(msg) {
    if (msg.role === 'user') {
      return '<div class="msg user"><div class="msg-bubble">' + util.esc(msg.text).replace(/\n/g, '<br>') + '</div>' +
        '<span class="msg-avatar">Anda</span></div>';
    }
    if (msg.role === 'error') {
      return '<div class="msg ai"><span class="msg-avatar ai">!</span><div class="msg-body"><div class="msg-bubble error">' + util.esc(msg.text) + '</div></div></div>';
    }
    const p = msg.projectId ? db.getProject(msg.projectId) : null;
    return '<div class="msg ai"><span class="msg-avatar ai">A</span><div class="msg-body">' +
      '<div class="msg-head"><b>AethelStudio AI</b><span class="badge">' + util.esc(msg.providerName || 'AI') + '</span><span class="muted small">' + util.ago(msg.ts) + '</span></div>' +
      '<div class="msg-bubble">' + util.esc(msg.text).replace(/\n/g, '<br>') + '</div>' +
      (p ? siteCard(p) : '') +
      '</div></div>';
  }

  async function sendPrompt(raw) {
    const prompt = String(raw || '').trim();
    if (!prompt) { ui.toast('Tulis dulu ide website-nya ya.', 'info'); return; }
    if (state.generating) { ui.toast('Tunggu sebentar, masih membuat website…', 'info'); return; }

    state.chat.push({ role: 'user', text: prompt, ts: Date.now() });
    state.chat.push({ role: 'assistant', text: 'Sedang menyiapkan website…', pending: true, providerName: ai.meta(settings().provider).name.split('(')[0].trim(), ts: Date.now() });
    state.generating = true;
    render();
    scrollChatBottom();

    const pendingIndex = state.chat.length - 1;
    const cfg = settings();
    const started = Date.now();

    function onProgress(text) {
      state.chat[pendingIndex].text = text;
      const bubble = $$('.msg.ai .msg-bubble').pop();
      if (bubble) bubble.textContent = text;
    }

    try {
      const result = await ai.generate(prompt, cfg, onProgress);
      onProgress('Menyimpan proyek & menyiapkan pratinjau…');
      const project = createProject({
        title: result.title,
        description: result.description,
        files: result.files,
        tags: result.tags,
        provider: result.provider
      });
      state.lastSiteId = project.id;
      db.track('gen');
      db.log('generate', result.title + ' · ' + (result.provider || cfg.provider));

      const providerName = ai.meta(result.provider || cfg.provider).name.split('(')[0].trim();
      let text = 'Website "' + project.title + '" siap! Saya membuat ' + Object.keys(project.files).length +
        ' file (' + fileSize(project.files) + ') dengan ' + providerName +
        '. Klik Edit untuk mengubah kode, Preview untuk melihat di HP, atau ZIP untuk menyimpan ke folder Download.';
      if (result.warning) text += '\n\n⚠ ' + result.warning;
      if (result.offline) text += '\n\nTip: pilih AI gratis lain di Pengaturan untuk variasi desain yang lebih banyak.';

      state.chat[pendingIndex] = {
        role: 'assistant',
        text: text,
        projectId: project.id,
        providerName: providerName,
        ts: Date.now(),
        warning: result.warning || ''
      };
      if (result.warning) ui.toast('AI fallback: website dibuat dengan generator offline.', 'info', 5200);
      else { ui.toast('Website berhasil dibuat dalam ' + ((Date.now() - started) / 1000).toFixed(1) + ' detik', 'success'); playSound('success'); }
    } catch (err) {
      console.error(err);
      state.chat[pendingIndex] = {
        role: 'error',
        text: 'Gagal membuat website: ' + (err.message || err) + '. Coba lagi, atau pilih Generator Offline di Pengaturan.',
        ts: Date.now()
      };
      ui.toast('Gagal generate website.', 'error');
      playSound('error');
    } finally {
      state.generating = false;
      render();
      scrollChatBottom();
    }
  }

  function scrollChatBottom() {
    setTimeout(function () {
      const log = $('#chatLog');
      if (log) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 60);
  }

  /* ============================================================
     Studio editor
     ============================================================ */
  function renderStudio(param) {
    let project = param ? db.getProject(param) : null;
    if (!project && state.editor.project) project = db.getProject(state.editor.project.id);
    if (!project) project = db.myProjects()[0] || null;

    if (!project) {
      return {
        html: '<div class="empty-state">' +
          '<div class="empty-ic">' + icon('code', 38) + '</div>' +
          '<h2>Studio masih kosong</h2>' +
          '<p>Buat website dari prompt terlebih dahulu, atau mulai dari template siap pakai.</p>' +
          '<div class="empty-actions"><a class="btn primary" href="#/home">' + icon('sparkles', 16) + ' Generate dari prompt</a>' +
          '<a class="btn ghost" href="#/templates">Lihat template</a></div></div>',
        mount: function () {}
      };
    }

    if (!project.files['index.html']) {
      project.files['index.html'] = '<!DOCTYPE html>\n<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + util.esc(project.title) + '</title><link rel="stylesheet" href="style.css"></head><body>\n<h1>Halo dunia</h1>\n<script src="script.js"></script>\n</body></html>';
    }
    const names = Object.keys(project.files);
    if (names.indexOf(state.editor.file) === -1) state.editor.file = names[0];
    state.editor.project = project;

    const activeFile = state.editor.file;
    const code = project.files[activeFile] || '';

    const html = '<div class="studio" data-pane="' + state.editor.mode + '">' +
      '<div class="studio-head">' +
      '<div class="studio-title">' +
      '<input id="projectName" class="title-input" value="' + util.esc(project.title) + '" aria-label="Nama proyek">' +
      '<div class="studio-sub">' + Object.keys(project.files).length + ' file · ' + fileSize(project.files) + ' · <span id="saveState">tersimpan</span></div>' +
      '</div>' +
      '<div class="studio-actions">' +
      '<a class="btn ghost sm" href="#/projects">' + icon('folder', 15) + '<span class="hide-sm">Proyek</span></a>' +
      '<button class="btn ghost sm" id="copyAllBtn">' + icon('copy', 15) + '<span class="hide-sm">Salin</span></button>' +
      '<button class="btn ghost sm" id="zipBtn">' + icon('download', 15) + ' ZIP</button>' +
      '<button class="btn primary sm" id="deployBtn">' + icon('rocket', 15) + '<span class="hide-sm">Hosting</span></button>' +
      '</div></div>' +
      '<div class="mobile-switch seg" id="paneSwitch">' +
      '<button data-pane="code" class="' + (state.editor.mode === 'code' ? 'on' : '') + '">Kode</button>' +
      '<button data-pane="preview" class="' + (state.editor.mode === 'preview' ? 'on' : '') + '">Pratinjau</button>' +
      '</div>' +
      '<div class="studio-grid">' +
      '<section class="editor-pane">' +
      '<div class="file-tabs" id="fileTabs">' + names.map(function (n) {
        return '<button class="file-tab' + (n === activeFile ? ' on' : '') + '" data-file="' + util.esc(n) + '">' +
          fileIcon(n) + '<span>' + util.esc(n) + '</span></button>';
      }).join('') + '<button class="file-tab add" id="addFileBtn" title="Tambah file">' + icon('plus', 14) + '</button></div>' +
      '<div class="code-wrap">' +
      '<textarea id="codeArea" class="code-area" spellcheck="false" autocomplete="off" autocapitalize="off" wrap="off">' + util.esc(code) + '</textarea>' +
      '</div>' +
      '<div class="editor-foot">' +
      '<span id="codeInfo">' + activeFile + ' · ' + code.split('\n').length + ' baris</span>' +
      '<div class="editor-foot-actions">' +
      '<button class="link-btn" id="delFileBtn">' + icon('trash', 14) + ' Hapus file</button>' +
      '<span class="dot-sep">·</span><span class="muted small">Tab = 2 spasi · autosave</span>' +
      '</div></div>' +
      '</section>' +
      '<section class="preview-pane">' +
      '<div class="preview-bar">' +
      '<div class="seg" id="deviceSeg">' +
      '<button data-dev="mobile">HP</button><button data-dev="tablet">Tablet</button><button data-dev="desktop" class="on">Desktop</button>' +
      '</div>' +
      '<div class="preview-bar-right">' +
      '<button class="icon-btn sm" id="refreshPreview" title="Muat ulang">' + icon('refresh', 16) + '</button>' +
      '<button class="icon-btn sm" id="openTab" title="Buka tab baru">' + icon('external', 16) + '</button>' +
      '</div></div>' +
      '<div class="preview-shell" id="previewShell" data-device="desktop">' +
      '<iframe id="previewFrame" class="preview-frame" sandbox="allow-scripts allow-forms allow-modals allow-popups"></iframe>' +
      '</div></section>' +
      '</div></div>';

    return {
      html: html,
      mount: function (root) {
        const iframe = $('#previewFrame', root);
        const area = $('#codeArea', root);
        const saveState = $('#saveState', root);

        function preview() {
          if (!iframe) return;
          iframe.srcdoc = buildPreview(project.files);
        }
        preview();

        const autoSave = util.debounce(function () {
          project.updatedAt = Date.now();
          db.saveProject(project);
          if (saveState) {
            saveState.textContent = 'tersimpan ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            saveState.classList.add('ok');
          }
        }, 900);

        function updateInfo() {
          const info = $('#codeInfo', root);
          if (info) info.textContent = state.editor.file + ' · ' + area.value.split('\n').length + ' baris · ' + util.bytes(new Blob([area.value]).size);
        }

        const updatePreview = util.debounce(function () { preview(); }, 700);

        area.addEventListener('input', function () {
          project.files[state.editor.file] = area.value;
          updateInfo();
          if (saveState) { saveState.textContent = 'menyimpan…'; saveState.classList.remove('ok'); }
          autoSave();
          updatePreview();
        });
        area.addEventListener('keydown', function (e) {
          if (e.key === 'Tab') {
            e.preventDefault();
            const start = area.selectionStart, end = area.selectionEnd;
            area.value = area.value.slice(0, start) + '  ' + area.value.slice(end);
            area.selectionStart = area.selectionEnd = start + 2;
            area.dispatchEvent(new Event('input'));
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            project.files[state.editor.file] = area.value;
            db.saveProject(project);
            if (saveState) { saveState.textContent = 'tersimpan ✓'; saveState.classList.add('ok'); }
            ui.toast('Proyek disimpan', 'success');
          }
        });

        $$('#fileTabs .file-tab[data-file]', root).forEach(function (tab) {
          tab.addEventListener('click', function () {
            if (state.editor.dirty) return;
            project.files[state.editor.file] = area.value;
            db.saveProject(project);
            state.editor.file = tab.getAttribute('data-file');
            render();
          });
        });

        const addBtn = $('#addFileBtn', root);
        if (addBtn) addBtn.addEventListener('click', async function () {
          const name = await ui.promptDialog({ title: 'Tambah file', label: 'Nama file (contoh: about.html, style2.css)', placeholder: 'about.html' });
          if (!name) return;
          if (!/^[\w.\-/]+\.(html|css|js|json|svg|txt|md)$/i.test(name)) return ui.toast('Gunakan ekstensi .html, .css, .js, .json, .svg, .txt, atau .md', 'error');
          if (project.files[name] !== undefined) return ui.toast('File sudah ada.', 'error');
          project.files[state.editor.file] = area.value;
          project.files[name] = name.endsWith('.css') ? '/* ' + name + ' */\n' : name.endsWith('.js') ? '// ' + name + '\n' : '';
          db.saveProject(project);
          state.editor.file = name;
          render();
        });

        const delBtn = $('#delFileBtn', root);
        if (delBtn) delBtn.addEventListener('click', async function () {
          if (Object.keys(project.files).length <= 1) return ui.toast('Minimal satu file harus tersisa.', 'error');
          const ok = await ui.confirm('Hapus file "' + state.editor.file + '"? Tindakan ini tidak bisa dibatalkan.', { danger: true, ok: 'Hapus' });
          if (!ok) return;
          delete project.files[state.editor.file];
          db.saveProject(project);
          state.editor.file = Object.keys(project.files)[0];
          render();
        });

        $$('#deviceSeg button', root).forEach(function (b) {
          b.addEventListener('click', function () {
            $$('#deviceSeg button', root).forEach(function (x) { x.classList.toggle('on', x === b); });
            $('#previewShell', root).setAttribute('data-device', b.getAttribute('data-dev'));
          });
        });
        const rp = $('#refreshPreview', root);
        if (rp) rp.addEventListener('click', function () { preview(); ui.toast('Pratinjau dimuat ulang', 'info', 1500); });
        const ot = $('#openTab', root);
        if (ot) ot.addEventListener('click', function () { openInTab(project); });

        const copyBtn = $('#copyAllBtn', root);
        if (copyBtn) copyBtn.addEventListener('click', function () {
          util.copy(project.files[state.editor.file] || '');
        });

        const zipBtn = $('#zipBtn', root);
        if (zipBtn) zipBtn.addEventListener('click', function () {
          project.files[state.editor.file] = area.value;
          db.saveProject(project);
          downloadProject(project);
        });

        const depBtn = $('#deployBtn', root);
        if (depBtn) depBtn.addEventListener('click', function () {
          project.files[state.editor.file] = area.value;
          db.saveProject(project);
          location.hash = '#/deploy/' + project.id;
        });

        const nameInput = $('#projectName', root);
        if (nameInput) nameInput.addEventListener('change', function () {
          project.title = nameInput.value.trim() || project.title;
          project.files[state.editor.file] = area.value;
          project.updatedAt = Date.now();
          db.saveProject(project);
          renderNav();
          ui.toast('Nama proyek diperbarui', 'success');
        });

        $$('#paneSwitch button', root).forEach(function (b) {
          b.addEventListener('click', function () {
            state.editor.mode = b.getAttribute('data-pane');
            $$('#paneSwitch button', root).forEach(function (x) { x.classList.toggle('on', x === b); });
            root.querySelector('.studio').setAttribute('data-pane', state.editor.mode);
            if (state.editor.mode === 'preview') preview();
          });
        });

        // pintasan simpan
        document.onkeydown = function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && location.hash.indexOf('#/studio') === 0) {
            e.preventDefault();
            project.files[state.editor.file] = area.value;
            db.saveProject(project);
            if (saveState) saveState.textContent = 'tersimpan ✓';
            ui.toast('Disimpan', 'success', 1600);
          }
        };
      }
    };
  }

  function fileIcon(name) {
    if (/\.html$/i.test(name)) return '<span class="fic html">H</span>';
    if (/\.css$/i.test(name)) return '<span class="fic css">C</span>';
    if (/\.js$/i.test(name)) return '<span class="fic js">J</span>';
    return '<span class="fic">•</span>';
  }

  /* ============================================================
     Proyek
     ============================================================ */
  function renderProjects() {
    const list = db.myProjects();
    const me = A.auth.current();
    let html = '<div class="page-head"><div><h1>Proyek Saya</h1><p class="muted">' +
      (list.length ? list.length + ' website tersimpan' + (me ? ' · ' + me.email : ' · mode tamu') : 'Belum ada proyek') +
      '</p></div><div class="page-actions">' +
      '<button class="btn ghost" id="importProjBtn">' + icon('upload', 16) + ' Impor</button>' +
      '<button class="btn ghost" id="exportAllBtn">' + icon('download', 16) + ' Ekspor semua</button>' +
      '<a class="btn primary" href="#/home">' + icon('plus', 16) + ' Baru</a></div></div>';

    if (!list.length) {
      html += '<div class="empty-state"><div class="empty-ic">' + icon('folder', 38) + '</div>' +
        '<h2>Belum ada karya</h2><p>Mulai dari prompt atau pilih template gratis. Proyek akan tersimpan otomatis di perangkat ini.</p>' +
        '<div class="empty-actions"><a class="btn primary" href="#/home">Mulai generate</a><a class="btn ghost" href="#/templates">Lihat template</a></div></div>';
    } else {
      html += '<div class="toolbar">' +
        '<div class="search-box">' + icon('search', 16) + '<input id="projSearch" placeholder="Cari proyek…"></div>' +
        '<select id="projSort" class="input compact"><option value="new">Terbaru</option><option value="old">Terlama</option><option value="az">A–Z</option></select>' +
        '</div><div class="projects-grid" id="projectsGrid">' + list.map(projectCardHtml).join('') + '</div>';
    }
    return {
      html: html,
      mount: function (root) {
        bindProjectCards(root);
        const search = $('#projSearch', root);
        if (search) search.addEventListener('input', function () {
          const q = search.value.toLowerCase();
          $$('.project-card', root).forEach(function (c) {
            c.style.display = c.getAttribute('data-search').indexOf(q) !== -1 ? '' : 'none';
          });
        });
        const sort = $('#projSort', root);
        if (sort) sort.addEventListener('change', function () {
          const arr = db.myProjects();
          if (sort.value === 'old') arr.reverse();
          if (sort.value === 'az') arr.sort(function (a, b) { return a.title.localeCompare(b.title); });
          $('#projectsGrid', root).innerHTML = arr.map(projectCardHtml).join('');
          bindProjectCards(root);
        });
        const exp = $('#exportAllBtn', root);
        if (exp) exp.addEventListener('click', function () {
          const payload = {};
          list.forEach(function (p) { Object.keys(p.files).forEach(function (f) { payload[p.title + '/' + f] = p.files[f]; }); });
          payload['projects.json'] = JSON.stringify(list, null, 2);
          zip.download(payload, 'aethel-semua-proyek.zip');
        });
        const imp = $('#importProjBtn', root);
        if (imp) imp.addEventListener('click', function () {
          const input = document.createElement('input');
          input.type = 'file'; input.accept = '.json,application/json';
          input.onchange = async function () {
            const f = input.files[0];
            if (!f) return;
            try {
              const data = JSON.parse(await util.fileToText(f));
              const arr = Array.isArray(data) ? data : (Array.isArray(data.projects) ? data.projects : [data]);
              let n = 0;
              arr.forEach(function (p) {
                if (!p || !p.files) return;
                createProject({
                  title: p.title || 'Impor', description: p.description || '',
                  files: p.files, tags: p.tags || [], provider: p.provider || 'unknown'
                });
                n++;
              });
              if (!n) return ui.toast('Tidak ada proyek di berkas itu.', 'error');
              ui.toast(n + ' proyek diimpor', 'success');
              render();
            } catch (e) { ui.toast('Berkas JSON tidak valid.', 'error'); }
          };
          input.click();
        });
      }
    };
  }

  function projectCardHtml(p) {
    return '<article class="project-card" data-search="' + util.esc((p.title + ' ' + (p.tags || []).join(' ')).toLowerCase()) + '">' +
      '<div class="project-thumb"><iframe loading="lazy" tabindex="-1" sandbox="allow-scripts" srcdoc="' + util.esc(buildPreview(p.files)) + '"></iframe>' +
      '<span class="project-badge">' + util.esc((p.tags && p.tags[0]) || 'website') + '</span>' +
      (p.favorite ? '<span class="project-fav">★</span>' : '') + '</div>' +
      '<div class="project-body"><h3>' + util.esc(p.title) + '</h3>' +
      '<p class="muted small">' + util.ago(p.updatedAt) + ' · ' + Object.keys(p.files).length + ' file · ' + fileSize(p.files) + '</p>' +
      '<div class="project-actions">' +
      '<button class="btn sm primary" data-p="edit" data-id="' + p.id + '">Edit</button>' +
      '<button class="btn sm ghost" data-p="preview" data-id="' + p.id + '">Preview</button>' +
      '<button class="icon-btn sm" data-p="fav" data-id="' + p.id + '" title="Favorit">' + (p.favorite ? '★' : '☆') + '</button>' +
      '<button class="icon-btn sm" data-p="dup" data-id="' + p.id + '" title="Duplikat">' + icon('copy', 15) + '</button>' +
      '<button class="icon-btn sm" data-p="zip" data-id="' + p.id + '" title="Unduh ZIP">' + icon('download', 15) + '</button>' +
      '<button class="icon-btn sm danger" data-p="del" data-id="' + p.id + '" title="Hapus">' + icon('trash', 15) + '</button>' +
      '</div></div></article>';
  }

  function bindProjectCards(root) {
    $$('[data-p]', root).forEach(function (b) {
      b.addEventListener('click', async function () {
        const p = db.getProject(b.getAttribute('data-id'));
        if (!p) return;
        const act = b.getAttribute('data-p');
        if (act === 'edit') openStudio(p.id);
        else if (act === 'preview') previewModal(p);
        else if (act === 'zip') downloadProject(p);
        else if (act === 'fav') { p.favorite = !p.favorite; db.saveProject(p); render(); }
        else if (act === 'dup') {
          const copy = createProject({
            title: p.title + ' (salinan)', description: p.description,
            files: JSON.parse(JSON.stringify(p.files)), tags: p.tags,
            provider: p.provider, favorite: false
          });
          db.log('duplikat', p.title + ' → ' + copy.title);
          ui.toast('Proyek diduplikasi', 'success');
          render();
        }
        else if (act === 'del') {
          const ok = await ui.confirm('Hapus proyek "' + p.title + '"?', { danger: true, ok: 'Hapus' });
          if (!ok) return;
          db.removeProject(p.id);
          db.log('hapus proyek', p.title);
          ui.toast('Proyek dihapus', 'success');
          render();
        }
      });
    });
  }

  /* ============================================================
     Template
     ============================================================ */
  function allTemplates() {
    const custom = db.templates().filter(function (t) { return t.active !== false; });
    return gen.presets.concat(custom.map(function (t) {
      const base = gen.presets.find(function (p) { return p.id === t.baseId; }) || gen.presets[gen.presets.length - 1];
      const preset = t.preset ? JSON.parse(JSON.stringify(t.preset)) : JSON.parse(JSON.stringify(base));
      preset.id = t.id;
      preset.label = t.label;
      preset.emoji = t.emoji || '✨';
      preset.description = t.description || '';
      preset.tags = t.tags || ['custom'];
      return {
        id: t.id, label: t.label, emoji: t.emoji || '✨', tags: t.tags || ['custom'],
        brand: t.brand || preset.brand, theme: t.theme || preset.theme,
        description: t.description || 'Template kustom',
        customPreset: preset
      };
    }));
  }

  function renderTemplates() {
    const s = settings();
    if (s.features && s.features.templates === false && !A.auth.isAdmin()) {
      return { html: '<div class="empty-state"><div class="empty-ic">🔒</div><h2>Template dinonaktifkan</h2><p>Fitur template sedang dimatikan oleh admin.</p></div>', mount: function () {} };
    }
    const tpl = allTemplates();
    let html = '<div class="page-head"><div><h1>Galeri Template</h1><p class="muted">' + tpl.length +
      ' template premium siap pakai — tanpa API, tanpa biaya.</p></div><a class="btn primary" href="#/home">' + icon('sparkles', 16) + ' Generate AI</a></div>';
    html += '<div class="template-grid">' + tpl.map(function (t, i) {
      const preview = t.customPreset ? t.customPreset : t;
      return '<article class="template-card" data-tpl="' + util.esc(t.id) + '">' +
        '<div class="template-thumb"><iframe loading="lazy" tabindex="-1" sandbox="allow-scripts" srcdoc="' +
        util.esc(buildPreview(gen.build(preview, { language: s.language }).files)) + '"></iframe>' +
        '<span class="template-emoji">' + util.esc(t.emoji) + '</span></div>' +
        '<div class="template-body"><h3>' + util.esc(t.label) + '</h3>' +
        '<p class="muted small">' + util.esc(t.description || '') + '</p>' +
        '<div class="template-tags">' + (t.tags || []).slice(0, 3).map(function (x) {
          return '<span class="tag">' + util.esc(x) + '</span>';
        }).join('') + '</div>' +
        '<div class="template-actions">' +
        '<button class="btn sm ghost" data-t="preview" data-id="' + util.esc(t.id) + '">Preview</button>' +
        '<button class="btn sm primary" data-t="use" data-id="' + util.esc(t.id) + '">Pakai template</button>' +
        '</div></div></article>';
      }).join('') + '</div>';
    return {
      html: html,
      mount: function (root) {
        $$('[data-t]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            const t = allTemplates().find(function (x) { return x.id === b.getAttribute('data-id'); });
            if (!t) return;
            const preset = t.customPreset || t;
            if (b.getAttribute('data-t') === 'preview') {
              const built = gen.build(preset, { language: settings().language });
              const proj = { title: t.label, description: t.description || '', files: built.files };
              previewModal(proj);
            } else {
              const built = gen.build(preset, {
                language: settings().language,
                brand: t.customPreset ? t.brand : undefined
              });
              const project = createProject({
                title: built.title, description: built.description,
                files: built.files, tags: built.tags, provider: 'template'
              });
              db.track('gen');
              db.log('template', t.label);
              ui.toast('Template "' + t.label + '" dibuat', 'success');
              openStudio(project.id);
            }
          });
        });
      }
    };
  }

  /* ============================================================
     Hosting / deploy
     ============================================================ */
  function renderDeploy(param) {
    const s = settings();
    if (s.features && s.features.deploy === false && !A.auth.isAdmin()) {
      return {
        html: '<div class="empty-state tall"><div class="empty-ic">🔒</div><h2>Hosting dinonaktifkan</h2>' +
          '<p>Fitur deploy sedang dimatikan oleh administrator. Anda tetap bisa mengunduh ZIP proyek.</p>' +
          '<div class="empty-actions"><a class="btn primary" href="#/projects">Unduh dari proyek</a><a class="btn ghost" href="#/help">Bantuan</a></div></div>',
        mount: function () {}
      };
    }
    const list = db.myProjects();
    const selected = param ? db.getProject(param) : list[0];

    let html = '<div class="page-head"><div><h1>Deploy &amp; Hosting Instant</h1>' +
      '<p class="muted">Publikasikan website Anda ke internet, langsung dari browser.</p></div>' +
      '<a class="btn ghost" href="#/studio' + (selected ? '/' + selected.id : '') + '">' + icon('code', 16) + ' Buka Studio</a></div>';

    html += '<div class="notice">' + icon('zap', 18) + '<div><b>Butuh token gratis dari platform hosting.</b> ' +
      'Token disimpan hanya di perangkat ini. Netlify &amp; Cloudflare menerima unggahan ZIP, Vercel mengunggah file langsung. ' +
      'Jika browser memblokir (CORS), buka aplikasi via <code>localhost</code> atau gunakan opsi ZIP + Netlify Drop.</div></div>';

    html += '<div class="deploy-grid">' + deploy.providers.map(function (p) {
      const keys = s.keys;
      const ready = p.id === 'netlify' ? !!keys.netlify : p.id === 'vercel' ? !!keys.vercel : !!(keys.cloudflare && keys.cloudflareAccount);
      return '<article class="deploy-card" style="--dc:' + p.accent + '">' +
        '<div class="deploy-head"><span class="deploy-ic" style="background:' + p.accent + '22;color:' + p.accent + '">' + p.emoji + '</span>' +
        (ready ? '<span class="tag ok">Token siap</span>' : '<span class="tag warn">Belum ada token</span>') + '</div>' +
        '<h3>' + p.name + '</h3><p class="muted">' + p.desc + '</p>' +
        '<button class="btn deploy-btn" data-provider="' + p.id + '">Deploy ke ' + p.name + '</button>' +
        '</article>';
    }).join('') + '</div>';

    html += '<div class="grid-2 mt-2">' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('zap', 18) + ' Cara cepat tanpa token</h3></div>' +
      '<p class="muted small">Unduh ZIP proyek, lalu unggah manual ke platform gratis. Cocok jika API diblokir browser.</p>' +
      '<div class="quick-links">' +
      '<button class="quick-link" id="zipSelected">' + icon('download', 16) + '<span><b>Unduh ZIP proyek</b><small>Langsung ke folder Download</small></span></button>' +
      '<a class="quick-link" href="https://app.netlify.com/drop" target="_blank" rel="noopener">' + icon('external', 16) + '<span><b>Netlify Drop</b><small>Tarik folder/ZIP ke situs Netlify</small></span></a>' +
      '<a class="quick-link" href="https://dash.cloudflare.com/?to=/:account/pages" target="_blank" rel="noopener">' + icon('external', 16) + '<span><b>Cloudflare Pages</b><small>Direct Upload</small></span></a>' +
      '<a class="quick-link" href="https://vercel.com/new" target="_blank" rel="noopener">' + icon('external', 16) + '<span><b>Vercel</b><small>Import / drag &amp; drop</small></span></a>' +
      '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('clock', 18) + ' Riwayat deploy</h3></div>' +
      (function () {
        const hist = list.filter(function (p) { return p.deployed; });
        if (!hist.length) return '<p class="muted small">Belum ada deploy. Riwayat akan muncul di sini setelah hosting berhasil.</p>';
        return '<ul class="deploy-history">' + hist.map(function (p) {
          return '<li><div><b>' + util.esc(p.title) + '</b><small class="muted">' + util.esc(p.deployed.provider) + ' · ' + util.ago(p.deployed.at) + '</small></div>' +
            '<a class="btn sm ghost" href="' + util.esc(p.deployed.url) + '" target="_blank" rel="noopener">Buka</a></li>';
        }).join('') + '</ul>';
      })() + '</div></div>';

    return {
      html: html,
      mount: function (root) {
        $$('[data-provider]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            openDeployModal(b.getAttribute('data-provider'), selected ? selected.id : '');
          });
        });
        const z = $('#zipSelected', root);
        if (z) z.addEventListener('click', function () {
          if (!selected) return ui.toast('Belum ada proyek untuk diunduh.', 'error');
          downloadProject(selected);
        });
      }
    };
  }

  function openDeployModal(providerId, projectId) {
    const s = settings();
    const meta = deploy.providers.find(function (p) { return p.id === providerId; }) || deploy.providers[0];
    const isCf = providerId === 'cloudflare';
    const isNetlify = providerId === 'netlify';
    const body = '<div class="form-grid">' +
      '<label class="field full"><span>Proyek yang akan dipublikasikan</span><select id="dpProject" class="input">' + projectOptions(projectId) + '</select></label>' +
      '<label class="field"><span>Token ' + meta.name + '</span><input id="dpToken" class="input" type="password" placeholder="Paste token di sini" value="' + util.esc(s.keys[providerId] || '') + '"></label>' +
      '<label class="field"><span>Nama proyek / situs</span><input id="dpName" class="input" placeholder="' + util.esc(util.slug((db.getProject(projectId) || {}).title || 'aethel-site')) + '" value="' + util.esc(s.deploy[providerId === 'netlify' ? 'netlifySite' : providerId === 'vercel' ? 'vercelProject' : 'cfProject'] || '') + '"></label>' +
      (isCf ? '<label class="field full"><span>Cloudflare Account ID</span><input id="dpAccount" class="input" placeholder="32 karakter hex" value="' + util.esc(s.keys.cloudflareAccount || '') + '"></label>' : '') +
      '</div>' +
      '<div class="deploy-note">' + icon('lock', 15) + '<span>' + (isNetlify
        ? 'Buat token di <b>app.netlify.com → User settings → Applications → Personal access tokens</b>.'
        : providerId === 'vercel'
          ? 'Buat token di <b>vercel.com/account/tokens</b>. Project akan dibuat otomatis bila belum ada.'
          : 'Buat token API dengan izin <b>Cloudflare Pages: Edit</b>. Account ID ada di dashboard kanan bawah.') +
        ' Token hanya disimpan di localStorage perangkat ini.</span></div>' +
      '<div id="dpStatus" class="deploy-status" hidden></div>';

    ui.modal({
      title: 'Deploy ke ' + meta.name,
      size: 'md',
      body: body,
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: 'Mulai Deploy',
          variant: 'primary',
          onClick: function (wrap, close) {
            runDeploy(providerId, wrap, close);
            return false;
          }
        }
      ],
      onMount: function (wrap) {
        const sel = wrap.querySelector('#dpProject');
        if (sel) sel.addEventListener('change', function () {
          const p = db.getProject(sel.value);
          const nameInput = wrap.querySelector('#dpName');
          if (p && nameInput && !nameInput.value) nameInput.value = util.slug(p.title);
        });
      }
    });
  }

  async function runDeploy(providerId, wrap, close) {
    const project = db.getProject(wrap.querySelector('#dpProject').value);
    const token = wrap.querySelector('#dpToken').value.trim();
    const name = wrap.querySelector('#dpName').value.trim();
    const account = wrap.querySelector('#dpAccount') ? wrap.querySelector('#dpAccount').value.trim() : '';
    const status = wrap.querySelector('#dpStatus');
    const btn = wrap.querySelector('.modal-foot .btn.primary');

    if (!project) return ui.toast('Pilih proyek terlebih dahulu.', 'error');
    if (!token) return ui.toast('Token wajib diisi.', 'error');
    if (providerId === 'cloudflare' && !account) return ui.toast('Account ID Cloudflare wajib diisi.', 'error');

    // simpan kredensial
    const patch = { keys: {} };
    patch.keys[providerId] = token;
    if (providerId === 'cloudflare') patch.keys.cloudflareAccount = account;
    if (providerId === 'netlify') patch.deploy = { netlifySite: name };
    if (providerId === 'vercel') patch.deploy = { vercelProject: name };
    if (providerId === 'cloudflare') patch.deploy = { cfProject: name };
    db.saveSettings(patch);

    status.hidden = false;
    status.className = 'deploy-status running';
    status.innerHTML = '<span class="spinner"></span><div><b>Mengunggah ' + Object.keys(project.files).length + ' file…</b><small>Jangan tutup halaman ini.</small></div>';
    btn.disabled = true;
    btn.textContent = 'Mendeploy…';

    try {
      let res;
      if (providerId === 'netlify') res = await deploy.netlify(project, { token: token, siteName: name });
      else if (providerId === 'vercel') res = await deploy.vercel(project, { token: token, projectName: name });
      else res = await deploy.cloudflare(project, { token: token, accountId: account, projectName: name });

      project.deployed = { provider: res.provider, url: res.url, at: Date.now() };
      db.saveProject(project);
      db.track('deploy');
      db.log('deploy', res.provider + ' · ' + project.title + ' → ' + res.url);

      status.className = 'deploy-status success';
      status.innerHTML = '<b>✓ Berhasil dipublikasikan!</b><small>' + util.esc(res.note || '') + '</small>' +
        '<div class="deploy-result"><a href="' + util.esc(res.url) + '" target="_blank" rel="noopener">' + util.esc(res.url) + '</a>' +
        '<button class="btn sm ghost" id="dpCopy">Salin</button></div>' +
        '<div class="deploy-result-links"><a href="' + util.esc(res.url) + '" target="_blank" rel="noopener">Buka situs</a>' +
        (res.adminUrl ? '<a href="' + util.esc(res.adminUrl) + '" target="_blank" rel="noopener">Dashboard</a>' : '') + '</div>';
      status.querySelector('#dpCopy').addEventListener('click', function () { util.copy(res.url); });
      btn.disabled = false;
      btn.textContent = 'Deploy Lagi';
      ui.toast('Berhasil deploy ke ' + res.provider, 'success');
      renderNav();
    } catch (err) {
      console.error(err);
      status.className = 'deploy-status error';
      status.innerHTML = '<b>Deploy gagal</b><small>' + util.esc(err.message || String(err)) + '</small>' +
        '<div class="deploy-hint">Alternatif: unduh ZIP lalu unggah manual ke Netlify Drop / Cloudflare Direct Upload.</div>';
      btn.disabled = false;
      btn.textContent = 'Coba Lagi';
      ui.toast('Deploy gagal. Lihat detail di jendela ini.', 'error', 5000);
      db.log('deploy gagal', providerId + ' · ' + (err.message || ''));
    }
  }

  /* ============================================================
     Admin (rahasia) & akun
     ============================================================ */
  function openAdminLogin() {
    const body = '<p class="modal-text">Area ini hanya untuk administrator. Masuk dengan akun admin untuk melanjutkan.</p>' +
      '<div class="form-grid">' +
      '<label class="field full"><span>Email admin</span><input id="alEmail" class="input" type="email" autocomplete="username" placeholder="email@contoh.com"></label>' +
      '<label class="field full"><span>Password</span><input id="alPass" class="input" type="password" autocomplete="current-password" placeholder="••••••••"></label>' +
      '</div><div id="alMsg" class="form-msg" hidden></div>';

    ui.modal({
      title: 'Login Administrator',
      body: body,
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: 'Masuk',
          variant: 'primary',
          onClick: function (wrap, close) {
            doAdminLogin(wrap, close);
            return false;
          }
        }
      ],
      onMount: function (wrap, close) {
        wrap.querySelector('#alEmail').focus();
        wrap.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); doAdminLogin(wrap, close); }
        });
      }
    });
  }

  async function doAdminLogin(wrap, close) {
    const email = wrap.querySelector('#alEmail').value;
    const pass = wrap.querySelector('#alPass').value;
    const msg = wrap.querySelector('#alMsg');
    const btn = wrap.querySelector('.modal-foot .btn.primary');
    msg.hidden = false;
    msg.className = 'form-msg';
    msg.textContent = 'Memeriksa…';
    btn.disabled = true;
    try {
      const user = await A.auth.login(email, pass);
      if (user.role !== 'admin') {
        A.auth.logout();
        throw new Error('Akun ini bukan administrator.');
      }
      ui.toast('Selamat datang, ' + (user.name || 'Admin'), 'success');
      close();
      applySettings();
      location.hash = '#/admin';
      render();
    } catch (err) {
      msg.className = 'form-msg error';
      msg.textContent = err.message || 'Login gagal.';
    } finally {
      btn.disabled = false;
    }
  }

  // Potong otomatis foto profil menjadi persegi (crop tengah) agar pas di bingkai bulat.
  function autoCropAvatar(file, maxSize) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          try {
            const side = Math.min(img.width, img.height);
            const sx = (img.width - side) / 2;
            const sy = (img.height - side) / 2;
            const out = Math.max(64, Math.min(maxSize || 512, side));
            const canvas = document.createElement('canvas');
            canvas.width = out;
            canvas.height = out;
            const ctx = canvas.getContext('2d');
            if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openAccount() {
    const me = A.auth.current();
    if (me) {
      ui.modal({
        title: 'Akun Saya',
        body: '<div class="account-card"><span class="account-avatar">' + (me.avatar ? '<img src="' + util.esc(me.avatar) + '" alt="Foto profil">' : util.esc((me.name || me.email).charAt(0).toUpperCase())) + '</span>' +
          '<div><b>' + util.esc(me.name) + '</b><small>' + util.esc(me.email) + '</small>' +
          '<span class="tag ' + (me.role === 'admin' ? 'ok' : '') + '">' + (me.role === 'admin' ? 'Administrator' : 'Pengguna') + '</span></div></div>' +
          '<div class="form-actions mt-1">' +
          '<button class="btn ghost sm" id="accAvatarBtn">' + icon('upload', 15) + ' Ganti foto</button>' +
          (me.avatar ? '<button class="btn ghost sm" id="accAvatarRemove">' + icon('trash', 15) + ' Hapus foto</button>' : '') +
          '</div>' +
          '<input type="file" id="accAvatarInput" accept="image/*" hidden>' +
          '<p class="muted small">Foto disimpan di perangkat ini (maks. 2 MB) dan otomatis dipotong tengah agar pas di bingkai.</p>' +
          '<div class="account-stats"><div><b>' + db.myProjects().length + '</b><span>Proyek</span></div>' +
          '<div><b>' + (new Date().toISOString().slice(0, 10) in db.metrics() ? (db.metrics()[new Date().toISOString().slice(0, 10)].gen || 0) : 0) + '</b><span>Generate hari ini</span></div></div>' +
          '<p class="muted small">Sesi tersimpan di perangkat ini. Semua data bersifat lokal.</p>',
        actions: [
          { label: 'Tutup', variant: 'ghost' },
          {
            label: 'Keluar', variant: 'danger', onClick: function () {
              A.auth.logout();
              ui.toast('Anda telah keluar', 'info');
              applySettings();
              render();
            }
          }
        ]
      });
      const accRoot = document.querySelector('.modal');
      const accInput = accRoot ? accRoot.querySelector('#accAvatarInput') : null;
      const accBtn = accRoot ? accRoot.querySelector('#accAvatarBtn') : null;
      const accRemove = accRoot ? accRoot.querySelector('#accAvatarRemove') : null;
      if (accBtn && accInput) accBtn.addEventListener('click', function () { accInput.click(); });
      if (accInput) accInput.addEventListener('change', async function (e) {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        if (!String(f.type || '').startsWith('image/')) { ui.toast('Pilih berkas gambar.', 'error'); return; }
        if (f.size > 2 * 1024 * 1024) { ui.toast('Maksimal 2 MB.', 'error'); return; }
        try {
          const dataUrl = await autoCropAvatar(f, 512);
          A.auth.updateUser(me.id, { avatar: dataUrl });
          ui.toast('Foto profil disimpan', 'success');
          document.querySelectorAll('.modal-wrap').forEach(function (m) { m.remove(); });
          document.body.classList.remove('modal-open');
          applySettings();
          render();
          openAccount();
        } catch (err) { ui.toast('Gagal menyimpan foto.', 'error'); }
      });
      if (accRemove) accRemove.addEventListener('click', function () {
        A.auth.updateUser(me.id, { avatar: null });
        ui.toast('Foto profil dihapus', 'info');
        document.querySelectorAll('.modal-wrap').forEach(function (m) { m.remove(); });
        document.body.classList.remove('modal-open');
        applySettings();
        render();
        openAccount();
      });
    } else {
      const s = settings();
      ui.modal({
        title: 'Masuk / Daftar',
        body: '<div class="seg tabs-seg" id="authTabs"><button data-tab="login" class="on">Masuk</button><button data-tab="register"' + (s.features.registration === false ? ' disabled' : '') + '>Daftar</button></div>' +
          '<div id="authForm"></div><p class="muted small mt-1">Akun hanya tersimpan di browser ini (offline-first). Admin dapat mengelola pengguna dari panel admin.</p>',
        actions: false
      });
      const root = document.querySelector('.modal');
      const formHost = root.querySelector('#authForm');
      function paint(tab) {
        formHost.innerHTML = '<div class="form-grid">' +
          (tab === 'register' ? '<label class="field full"><span>Nama</span><input id="auName" class="input" placeholder="Nama Anda"></label>' : '') +
          '<label class="field full"><span>Email</span><input id="auEmail" class="input" type="email" placeholder="nama@email.com" autocomplete="username"></label>' +
          '<label class="field full"><span>Password</span><input id="auPass" class="input" type="password" placeholder="Minimal 6 karakter" autocomplete="' + (tab === 'login' ? 'current-password' : 'new-password') + '"></label>' +
          '</div><div id="auMsg" class="form-msg" hidden></div>' +
          '<button class="btn primary full mt-2" id="auSubmit">' + (tab === 'login' ? 'Masuk' : 'Buat akun') + '</button>';
        const submit = formHost.querySelector('#auSubmit');
        submit.addEventListener('click', async function () {
          const msg = formHost.querySelector('#auMsg');
          const email = formHost.querySelector('#auEmail').value;
          const pass = formHost.querySelector('#auPass').value;
          const name = formHost.querySelector('#auName') ? formHost.querySelector('#auName').value : '';
          msg.hidden = false; msg.className = 'form-msg'; msg.textContent = 'Memproses…';
          submit.disabled = true;
          try {
            if (tab === 'login') await A.auth.login(email, pass);
            else await A.auth.register(name, email, pass);
            ui.toast('Berhasil masuk', 'success');
            document.querySelectorAll('.modal-wrap').forEach(function (m) { m.remove(); });
            document.body.classList.remove('modal-open');
            applySettings();
            render();
          } catch (err) {
            msg.className = 'form-msg error';
            msg.textContent = err.message || 'Gagal.';
          } finally { submit.disabled = false; }
        });
      }
      formHost.parentElement.querySelectorAll('#authTabs button').forEach(function (b) {
        b.addEventListener('click', function () {
          formHost.parentElement.querySelectorAll('#authTabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
          paint(b.getAttribute('data-tab'));
        });
      });
      paint('login');
    }
  }

  function bindSecretAccess() {
    const brand = $('#brandBtn');
    if (brand) brand.addEventListener('click', function () {
      clearTimeout(state.adminTap.timer);
      state.adminTap.count++;
      state.adminTap.timer = setTimeout(function () { state.adminTap.count = 0; }, 2200);
      if (state.adminTap.count >= 5) {
        state.adminTap.count = 0;
        if (A.auth.isAdmin()) { location.hash = '#/admin'; }
        else openAdminLogin();
      }
    });
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'versionText') {
        clearTimeout(state.adminTap.timer);
        state.adminTap.count++;
        state.adminTap.timer = setTimeout(function () { state.adminTap.count = 0; }, 2000);
        if (state.adminTap.count >= 7) { state.adminTap.count = 0; openAdminLogin(); }
      }
    });
  }

  /* ============================================================
     Render & boot
     ============================================================ */
  function maintenanceView() {
    return '<div class="empty-state tall"><div class="empty-ic">' + icon('lock', 38) + '</div>' +
      '<h2>Sedang dalam perawatan</h2><p>AethelStudio sedang diperbarui oleh administrator. Silakan kembali beberapa saat lagi.</p>' +
      '<a class="btn ghost" href="#/help">Bantuan</a></div>';
  }

  function render() {
    const route = router.parse();
    const app = $('#app');
    if (!app) return;
    applySettings();
    renderNav();
    closeDrawerIfMobile();

    if (settings().maintenance && !A.auth.isAdmin() && route.path !== 'help' && route.path !== 'admin') {
      $('#view').innerHTML = maintenanceView();
      return;
    }

    const feats = settings().features || {};
    if (!A.auth.current() && feats.guest === false && !['admin', 'help', 'settings'].includes(route.path)) {
      $('#view').innerHTML = '<div class="empty-state tall"><div class="empty-ic">' + icon('lock', 34) + '</div>' +
        '<h2>Masuk untuk melanjutkan</h2><p>Mode tamu dinonaktifkan oleh administrator. Silakan masuk atau buat akun untuk memakai studio.</p>' +
        '<div class="empty-actions"><button class="btn primary" id="guestLogin">' + icon('login', 16) + ' Masuk / Daftar</button>' +
        '<a class="btn ghost" href="#/help">Bantuan</a></div></div>';
      const gl = $('#guestLogin');
      if (gl) gl.addEventListener('click', openAccount);
      return;
    }

    let view;
    try {
      switch (route.path) {
        case 'home': view = renderHome(); break;
        case 'studio': view = renderStudio(route.param); break;
        case 'projects': view = renderProjects(); break;
        case 'templates': view = renderTemplates(); break;
        case 'deploy': view = renderDeploy(route.param); break;
        case 'admin':
          if (!A.auth.isAdmin()) view = { html: renderAdminGate(), mount: bindAdminGate };
          else view = A.admin.render();
          break;
        case 'images': view = A.pages.images(); break;
        case 'seo': view = A.pages.seo(); break;
        case 'palette': view = A.pages.palette(); break;
        case 'qr': view = A.pages.qr(); break;
        case 'snippets': view = A.pages.snippets(); break;
        case 'codefix': view = A.pages.codefix(); break;
        case 'tools': view = A.pages.tools(); break;
        case 'settings': view = A.pages.settings(); break;
        case 'help': view = A.pages.help(); break;
        default: view = renderHome();
      }
    } catch (err) {
      console.error(err);
      view = {
        html: '<div class="empty-state"><div class="empty-ic">⚠️</div><h2>Terjadi kesalahan</h2><p>' +
          util.esc(err.message || String(err)) + '</p><a class="btn ghost" href="#/home">Kembali ke beranda</a></div>',
        mount: function () {}
      };
    }
    const host = $('#view');
    host.setAttribute('data-page', route.path);
    host.innerHTML = view.html;
    if (view.mount) view.mount(host);
    window.scrollTo(0, 0);
  }

  function renderAdminGate() {
    return '<div class="admin-gate"><div class="gate-card">' +
      '<div class="gate-ic">' + icon('shield', 34) + '</div>' +
      '<h1>Area Administrator</h1><p class="muted">Halaman ini tidak ditampilkan di menu. Masuk dengan akun admin untuk mengelola aplikasi.</p>' +
      '<form id="gateForm" class="form-grid">' +
      '<label class="field full"><span>Email</span><input class="input" id="gateEmail" type="email" autocomplete="username" placeholder="email admin"></label>' +
      '<label class="field full"><span>Password</span><input class="input" id="gatePass" type="password" autocomplete="current-password" placeholder="password"></label>' +
      '<div id="gateMsg" class="form-msg" hidden></div>' +
      '<button class="btn primary full" type="submit">Masuk ke Panel Admin</button>' +
      '</form><a class="link-btn" href="#/home">← Kembali ke beranda</a></div></div>';
  }

  function bindAdminGate(root) {
    const form = $('#gateForm', root);
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const msg = $('#gateMsg', root);
      msg.hidden = false; msg.className = 'form-msg'; msg.textContent = 'Memeriksa…';
      try {
        const user = await A.auth.login($('#gateEmail', root).value, $('#gatePass', root).value);
        if (user.role !== 'admin') { A.auth.logout(); throw new Error('Akun ini bukan administrator.'); }
        ui.toast('Masuk sebagai administrator', 'success');
        applySettings();
        render();
      } catch (err) {
        msg.className = 'form-msg error';
        msg.textContent = err.message || 'Login gagal.';
      }
    });
  }

  function closeDrawerIfMobile() {
    if (window.innerWidth < 1024) openDrawer(false);
  }

  function playSound(kind) {
    try {
      const s = (settings().sound) || {};
      if (s.enabled === false) return;
      const vol = Math.max(0, Math.min(1, Number(s.volume) || 0.6));
      if (s.custom) {
        const a = new Audio(s.custom);
        a.volume = vol;
        a.play().catch(function () {});
        return;
      }
      const preset = (kind === 'error') ? 'bip' : (s.preset || 'chime');
      if (preset === 'none') return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const patterns = {
        bip: [[880, 0.12]],
        chime: [[523.25, 0.15], [659.25, 0.15], [783.99, 0.22]],
        ding: [[1046.5, 0.28]]
      };
      const seq = patterns[preset] || patterns.chime;
      let t = ctx.currentTime + 0.02;
      seq.forEach(function (step) {
        const freq = step[0], dur = step[1];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur * 0.85;
      });
    } catch (e) { /* abaikan error audio */ }
  }

  function bindGlobal() {
    $('#menuBtn').addEventListener('click', function () { openDrawer(!$('#drawer').classList.contains('open')); });
    $('#closeDrawer').addEventListener('click', function () { openDrawer(false); });
    $('#scrim').addEventListener('click', function () { openDrawer(false); });
    $('#accountBtn').addEventListener('click', openAccount);
    $('#brandBtn').addEventListener('click', function () {
      if (location.hash === '#/home' || location.hash === '') window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { openDrawer(false); }
      if (!e.ctrlKey && !e.metaKey && e.key === '/' && !/input|textarea|select/i.test((e.target.tagName || ''))) {
        const pi = document.getElementById('promptInput');
        if (pi) { e.preventDefault(); pi.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) openDrawer(false); });
    bindSecretAccess();

    const y = $('#yearNow'); if (y) y.textContent = new Date().getFullYear();

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('SW gagal:', e); });
    }
  }

  async function boot() {
    try {
      await A.auth.ensureSeed();
    } catch (e) { console.error('seed gagal', e); }
    applySettings();
    bindGlobal();
    window.Aethel.app = {
      buildPreview: buildPreview,
      previewModal: previewModal,
      openInTab: openInTab,
      downloadProject: downloadProject,
      createProject: createProject,
      openStudio: openStudio,
      projectOptions: projectOptions,
      openDeployModal: openDeployModal,
      openAccount: openAccount,
      render: render,
      applySettings: applySettings,
      playSound: playSound,
      state: state,
      fileSize: fileSize,
      siteCard: siteCard,
      bindSiteActions: bindSiteActions,
      openAdminLogin: openAdminLogin
    };
    router.onChange(render);
    render();
    const bootEl = $('#boot');
    if (bootEl) { bootEl.classList.add('done'); setTimeout(function () { bootEl.remove(); }, 350); }
    $('#app').hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
