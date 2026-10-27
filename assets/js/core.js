/* ============================================================
   AethelStudio AI — core.js
   Penyimpanan lokal, autentikasi, utilitas UI, router.
   ============================================================ */
(function () {
  'use strict';

  const NS = 'aethel_v1_';
  const SALT = 'aethel-studio-2026';
  const K = {
    settings: NS + 'settings',
    users: NS + 'users',
    session: NS + 'session',
    projects: NS + 'projects',
    logs: NS + 'logs',
    metrics: NS + 'metrics',
    prompts: NS + 'prompts',
    templates: NS + 'templates',
    dismissed: NS + 'dismissed'
  };

  const ADMIN_EMAIL = 'khoirulsholihan@gmail.com';
  const ADMIN_PASS = 'Masirul65';

  /* ---------- penyimpanan ---------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('read fail', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('write fail', key, e);
      return false;
    }
  }

  function isPlainObject(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  function deepMerge(base, patch) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!isPlainObject(patch)) return out;
    Object.keys(patch).forEach(function (k) {
      if (isPlainObject(base[k]) && isPlainObject(patch[k])) out[k] = deepMerge(base[k], patch[k]);
      else if (patch[k] !== undefined) out[k] = patch[k];
    });
    return out;
  }

  const DEFAULT_SETTINGS = {
    appName: 'AethelStudio',
    tagline: 'AI Web Builder',
    version: '1.0.0',
    provider: 'pollinations',
    model: 'openai',
    temperature: 0.8,
    language: 'id',
    theme: 'dark',
    accent: '#2dd4bf',
    announcement: '',
    maintenance: false,
    autoSave: true,
    autoPreview: true,
    sound: { enabled: true, preset: 'chime', custom: '', volume: 0.6 },
    keys: {
      gemini: '', groq: '', openrouter: '', custom: '', ninerouter: '',
      netlify: '', vercel: '', cloudflare: '', cloudflareAccount: ''
    },
    customBase: 'https://api.openai.com/v1',
    customModel: 'gpt-4o-mini',
    deploy: { vercelProject: '', netlifySite: '', cfProject: '' },
    features: { images: true, deploy: true, chat: true, guest: true, registration: true, templates: true }
  };

  const db = {
    settings: function () {
      return deepMerge(DEFAULT_SETTINGS, read(K.settings, {}));
    },
    saveSettings: function (patch) {
      const next = deepMerge(db.settings(), patch);
      write(K.settings, next);
      return next;
    },
    resetSettings: function () {
      write(K.settings, DEFAULT_SETTINGS);
      return deepMerge(DEFAULT_SETTINGS, {});
    },

    users: function () { return read(K.users, []); },
    saveUsers: function (list) { write(K.users, list); return list; },

    projects: function () { return read(K.projects, []); },
    allProjects: function () {
      return db.projects().slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    },
    myProjects: function () {
      const me = auth.current();
      const owner = me ? me.id : 'guest';
      return db.allProjects().filter(function (p) {
        return auth.isAdmin() ? true : p.owner === owner;
      });
    },
    getProject: function (id) { return db.projects().find(function (p) { return p.id === id; }) || null; },
    saveProject: function (project) {
      const list = db.projects();
      const i = list.findIndex(function (p) { return p.id === project.id; });
      project.updatedAt = Date.now();
      if (i === -1) list.unshift(project); else list[i] = project;
      write(K.projects, list);
      return project;
    },
    removeProject: function (id) {
      write(K.projects, db.projects().filter(function (p) { return p.id !== id; }));
    },

    logs: function () { return read(K.logs, []); },
    log: function (action, detail) {
      const me = auth.current();
      const list = db.logs();
      list.unshift({
        t: Date.now(),
        actor: me ? me.email : 'guest',
        action: action,
        detail: detail || ''
      });
      write(K.logs, list.slice(0, 800));
    },
    clearLogs: function () { write(K.logs, []); },

    metrics: function () { return read(K.metrics, {}); },
    track: function (type, n) {
      const m = db.metrics();
      const day = new Date().toISOString().slice(0, 10);
      if (!m[day]) m[day] = {};
      m[day][type] = (m[day][type] || 0) + (n || 1);
      write(K.metrics, m);
    },
    series: function (days) {
      const m = db.metrics();
      const out = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        out.push({
          day: d,
          label: d.slice(8, 10) + '/' + d.slice(5, 7),
          gen: (m[d] && m[d].gen) || 0,
          deploy: (m[d] && m[d].deploy) || 0,
          image: (m[d] && m[d].image) || 0,
          chat: (m[d] && m[d].chat) || 0
        });
      }
      return out;
    },

    prompts: function () {
      let list = read(K.prompts, null);
      if (!list) {
        list = [
          'Landing page startup SaaS bernama NusaCloud dengan harga 3 paket dan tombol WhatsApp',
          'Website portofolio fotografer profesional, galeri masonry, tema gelap elegan',
          'Toko online kopi lokal dengan katalog produk, keranjang sederhana, dan checkout WhatsApp',
          'Website undangan pernikahan online elegan dengan countdown dan RSVP',
          'Landing page klinik gigi modern, jadwal dokter, form booking, warna biru bersih',
          'Website wisata pantai Bali dengan galeri, paket tour, dan testimoni',
          'Dashboard admin analitik gelap dengan grafik, tabel, dan kartu statistik',
          'Website kursus coding online dengan silabus, mentor, dan harga',
          'Landing page aplikasi mobile fintech dengan mockup HP dan fitur unggulan',
          'Website restoran Jepang dengan menu, galeri, reservasi, dan peta'
        ];
        write(K.prompts, list);
      }
      return list;
    },
    savePrompts: function (list) { write(K.prompts, list); },

    templates: function () { return read(K.templates, []); },
    saveTemplates: function (list) { write(K.templates, list); },

    dismissed: function () { return read(K.dismissed, []); },
    dismiss: function (key) {
      const list = db.dismissed();
      if (list.indexOf(key) === -1) list.push(key);
      write(K.dismissed, list);
    },

    exportAll: function () {
      return {
        app: 'AethelStudio AI',
        exportedAt: new Date().toISOString(),
        settings: db.settings(),
        users: db.users(),
        projects: db.projects(),
        prompts: db.prompts(),
        templates: db.templates(),
        logs: db.logs(),
        metrics: db.metrics()
      };
    },
    importAll: function (data) {
      if (!data || typeof data !== 'object') throw new Error('Berkas cadangan tidak valid.');
      if (data.settings) write(K.settings, deepMerge(DEFAULT_SETTINGS, data.settings));
      if (Array.isArray(data.users)) write(K.users, data.users);
      if (Array.isArray(data.projects)) write(K.projects, data.projects);
      if (Array.isArray(data.prompts)) write(K.prompts, data.prompts);
      if (Array.isArray(data.templates)) write(K.templates, data.templates);
      if (Array.isArray(data.logs)) write(K.logs, data.logs.slice(0, 800));
      if (data.metrics) write(K.metrics, data.metrics);
      return true;
    },
    wipe: function (keepUsers) {
      write(K.projects, []);
      write(K.logs, []);
      write(K.metrics, {});
      write(K.templates, []);
      write(K.prompts, []);
      if (!keepUsers) {
        write(K.users, []);
        write(K.session, null);
      }
    }
  };

  /* ---------- utilitas ---------- */
  const util = {
    uid: function (prefix) {
      return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },
    esc: function (str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    escapeReg: function (s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); },
    date: function (ts, short) {
      if (!ts) return '-';
      const d = new Date(ts);
      const opt = short
        ? { day: '2-digit', month: 'short' }
        : { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleDateString('id-ID', opt);
    },
    ago: function (ts) {
      const s = Math.floor((Date.now() - ts) / 1000);
      if (s < 60) return 'baru saja';
      if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
      if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
      if (s < 604800) return Math.floor(s / 86400) + ' hari lalu';
      return util.date(ts, true);
    },
    bytes: function (n) {
      if (n < 1024) return n + ' B';
      if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
      return (n / 1048576).toFixed(1) + ' MB';
    },
    slug: function (s) {
      return String(s).toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'website';
    },
    debounce: function (fn, ms) {
      let t;
      return function () {
        const args = arguments, ctx = this;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, ms);
      };
    },
    copy: async function (text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        ui.toast('Disalin ke clipboard', 'success');
        return true;
      } catch (e) {
        ui.toast('Gagal menyalin. Pilih teks manual ya.', 'error');
        return false;
      }
    },
    download: async function (blob, filename) {
      try {
        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({ suggestedName: filename });
            const w = await handle.createWritable();
            await w.write(blob);
            await w.close();
            ui.toast('Tersimpan: ' + filename, 'success');
            return true;
          } catch (err) {
            if (err && err.name === 'AbortError') return false;
          }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        ui.toast('Diunduh: ' + filename + ' (cek folder Download)', 'success');
        return true;
      } catch (e) {
        console.error(e);
        ui.toast('Gagal mengunduh berkas.', 'error');
        return false;
      }
    },
    fileToText: function (file) {
      return new Promise(function (resolve, reject) {
        const r = new FileReader();
        r.onload = function () { resolve(String(r.result)); };
        r.onerror = reject;
        r.readAsText(file);
      });
    },
    fileToDataUrl: function (file) {
      return new Promise(function (resolve, reject) {
        const r = new FileReader();
        r.onload = function () { resolve(String(r.result)); };
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    },
    htmlBytes: function (str) { return new Blob([str]).size; }
  };

  /* ---------- autentikasi ---------- */
  async function sha256Hex(text) {
    if (window.crypto && crypto.subtle) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      } catch (e) { /* pakai fallback deterministik */ }
    }
    return null;
  }

  // fallback deterministik (bukan kriptografi kuat, cukup untuk demo offline)
  function fallbackHash(text) {
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      h1 = (h1 ^ c) * 16777619 >>> 0;
      h2 = (h2 + c * (i + 7)) >>> 0;
      h2 = (h2 << 5 | h2 >>> 27) >>> 0;
    }
    let out = '';
    for (let i = 0; i < 4; i++) {
      h1 = (h1 * 2654435761 + h2) >>> 0;
      out += h1.toString(16).padStart(8, '0');
    }
    return out;
  }

  function passText(email, password) {
    return String(email).toLowerCase().trim() + '::' + password + '::' + SALT;
  }

  // Hash ganda: SHA-256 (bila tersedia) + fallback deterministik. Fallback selalu
  // ikut disimpan agar login tetap valid saat aplikasi dibuka lewat
  // http://localhost (secure context) maupun file:// (non-secure).
  async function hashPassword(email, password) {
    const text = passText(email, password);
    const fnv = 'fnv:' + fallbackHash(text);
    const hex = await sha256Hex(text);
    return hex ? 'sha256:' + hex + '|' + fnv : fnv;
  }

  async function verifyPassword(email, password, stored) {
    const text = passText(email, password);
    const parts = String(stored || '').split('|');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.indexOf('sha256:') === 0) {
        const hex = await sha256Hex(text);
        if (hex && part === 'sha256:' + hex) return true;
      } else if (part.indexOf('fnv:') === 0) {
        if (part === 'fnv:' + fallbackHash(text)) return true;
      } else if (part) {
        // kompatibilitas dengan hash lama (tanpa prefix)
        if (part === fallbackHash(text)) return true;
        const hex = await sha256Hex(text);
        if (hex && part === hex) return true;
      }
    }
    return false;
  }

  const auth = {
    ensureSeed: async function () {
      let users = db.users();
      let changed = false;
      if (!Array.isArray(users) || !users.length) {
        const hash = await hashPassword(ADMIN_EMAIL, ADMIN_PASS);
        users = [{
          id: util.uid('usr'),
          name: 'Khoirul Sholihan',
          email: ADMIN_EMAIL,
          hash: hash,
          role: 'admin',
          status: 'active',
          createdAt: Date.now(),
          lastLogin: null
        }];
        changed = true;
      }
      // pastikan akun admin utama selalu ada
      const hasAdmin = users.some(function (u) { return u.email === ADMIN_EMAIL; });
      if (!hasAdmin) {
        const hash = await hashPassword(ADMIN_EMAIL, ADMIN_PASS);
        users.unshift({
          id: util.uid('usr'), name: 'Khoirul Sholihan', email: ADMIN_EMAIL,
          hash: hash, role: 'admin', status: 'active', createdAt: Date.now(), lastLogin: null
        });
        changed = true;
      }
      if (changed) db.saveUsers(users);
      return users;
    },
    current: function () {
      const s = read(K.session, null);
      if (!s || !s.userId) return null;
      const u = db.users().find(function (x) { return x.id === s.userId; });
      if (!u || u.status === 'blocked') return null;
      return u;
    },
    isAdmin: function () {
      const u = auth.current();
      return !!u && u.role === 'admin';
    },
    login: async function (email, password) {
      const mail = String(email || '').toLowerCase().trim();
      const users = db.users();
      const user = users.find(function (u) { return u.email === mail; });
      if (!user) throw new Error('Email atau password salah.');
      if (user.status === 'blocked') throw new Error('Akun ini diblokir oleh admin.');
      if (!(await verifyPassword(mail, password, user.hash))) throw new Error('Email atau password salah.');
      user.lastLogin = Date.now();
      db.saveUsers(users);
      write(K.session, { userId: user.id, at: Date.now() });
      db.log('login', 'Masuk sebagai ' + user.email);
      return user;
    },
    register: async function (name, email, password) {
      const mail = String(email || '').toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) throw new Error('Format email tidak valid.');
      if (!password || password.length < 6) throw new Error('Password minimal 6 karakter.');
      const users = db.users();
      if (users.some(function (u) { return u.email === mail; })) throw new Error('Email sudah terdaftar.');
      const hash = await hashPassword(mail, password);
      const user = {
        id: util.uid('usr'),
        name: String(name || '').trim() || mail.split('@')[0],
        email: mail, hash: hash, role: 'user', status: 'active',
        createdAt: Date.now(), lastLogin: Date.now()
      };
      users.push(user);
      db.saveUsers(users);
      write(K.session, { userId: user.id, at: Date.now() });
      db.log('register', 'Akun baru: ' + mail);
      return user;
    },
    logout: function () {
      const u = auth.current();
      write(K.session, null);
      if (u) db.log('logout', u.email);
    },
    updateUser: function (id, patch) {
      const users = db.users();
      const i = users.findIndex(function (u) { return u.id === id; });
      if (i === -1) return null;
      users[i] = Object.assign({}, users[i], patch);
      db.saveUsers(users);
      return users[i];
    },
    setPassword: async function (id, newPass) {
      if (!newPass || newPass.length < 6) throw new Error('Password minimal 6 karakter.');
      const users = db.users();
      const u = users.find(function (x) { return x.id === id; });
      if (!u) throw new Error('Pengguna tidak ditemukan.');
      u.hash = await hashPassword(u.email, newPass);
      db.saveUsers(users);
      return true;
    },
    removeUser: function (id) {
      const u = db.users().find(function (x) { return x.id === id; });
      if (u && u.email === ADMIN_EMAIL) throw new Error('Akun admin utama tidak bisa dihapus.');
      if (u && auth.current() && u.id === auth.current().id) throw new Error('Tidak bisa menghapus akun sendiri.');
      db.saveUsers(db.users().filter(function (x) { return x.id !== id; }));
    }
  };

  /* ---------- ikon ---------- */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-7h6v7"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    rocket: '<path d="M12 15c-2 0-3-1-3-3 0-5 3-9 8-9 0 5-4 8-8 9"/><path d="M9 12 4 9l3-3 5 1M12 15l3 5 3-3-1-5"/><path d="M6 18c-1 1-1 3-1 3s2 0 3-1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-4-9 8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="15" cy="8" r="1"/><circle cx="16" cy="14" r="1"/><path d="M12 21c-2 0-2-2-1-3s0-3-2-3H5"/>',
    qr: '<rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><path d="M15 15h2v2h-2zM19 15h2v2M15 19h2v2h4v-2"/>',
    snippet: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 9-2 3 2 3M16 9l2 3-2 3"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3l9.4-9.4a4 4 0 0 0-2-2z"/><path d="m5 5 4 4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8v.5"/><path d="M12 17h.01"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    external: '<path d="M14 3h7v7M21 3l-9 9"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    save: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M10 21h4"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 3 3-2 2-3-3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M4 18a8 8 0 1 1 16 0z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    whatsapp: '<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 8.5c0 4 3 7 7 7 .7 0 1.5-.6 1.5-1.2l-2-1-1 1c-1.3-.5-2.7-1.9-3.2-3.2l1-1-1-2c-.6 0-1.2.8-1.2 1.5z"/>'
  };

  function icon(name, size) {
    const p = ICONS[name] || ICONS.sparkles;
    return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- UI: toast, modal, dialog ---------- */
  const ui = {
    icon: icon,
    toast: function (message, type, ms) {
      const host = document.getElementById('toasts');
      if (!host) return;
      const el = document.createElement('div');
      el.className = 'toast ' + (type || 'info');
      el.innerHTML = '<span class="toast-ic">' +
        icon(type === 'success' ? 'check' : type === 'error' ? 'x' : 'zap', 16) +
        '</span><span class="toast-tx">' + util.esc(message) + '</span>';
      host.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('show'); });
      setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { el.remove(); }, 250);
      }, ms || 3200);
    },
    modal: function (opts) {
      const root = document.getElementById('modalRoot');
      const wrap = document.createElement('div');
      wrap.className = 'modal-wrap';
      wrap.innerHTML =
        '<div class="modal ' + (opts.size || '') + '" role="dialog" aria-modal="true">' +
        '<div class="modal-head"><h3>' + util.esc(opts.title || '') + '</h3>' +
        '<button class="icon-btn" data-close aria-label="Tutup">' + icon('x', 18) + '</button></div>' +
        '<div class="modal-body">' + (opts.body || '') + '</div>' +
        (opts.footer === false ? '' : '<div class="modal-foot"></div>') +
        '</div>';
      root.appendChild(wrap);
      requestAnimationFrame(function () { wrap.classList.add('show'); });

      function close() {
        wrap.classList.remove('show');
        setTimeout(function () { wrap.remove(); }, 200);
        document.body.classList.remove('modal-open');
      }
      wrap.addEventListener('click', function (e) {
        if (e.target === wrap) close();
        if (e.target.closest('[data-close]')) close();
      });
      document.body.classList.add('modal-open');

      const foot = wrap.querySelector('.modal-foot');
      if (foot && Array.isArray(opts.actions)) {
        opts.actions.forEach(function (a) {
          const b = document.createElement('button');
          b.className = 'btn ' + (a.variant || 'ghost');
          b.textContent = a.label;
          b.addEventListener('click', function () {
            if (typeof a.onClick === 'function') {
              const res = a.onClick(wrap, close);
              if (res !== false) close();
            } else close();
          });
          foot.appendChild(b);
        });
      }
      if (opts.onMount) opts.onMount(wrap, close);
      return { el: wrap, close: close };
    },
    confirm: function (message, opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        let done = false;
        const m = ui.modal({
          title: opts.title || 'Konfirmasi',
          body: '<p class="modal-text">' + util.esc(message) + '</p>',
          actions: [
            { label: opts.cancel || 'Batal', variant: 'ghost', onClick: function () { done = true; resolve(false); } },
            { label: opts.ok || 'Lanjutkan', variant: opts.danger ? 'danger' : 'primary', onClick: function () { done = true; resolve(true); } }
          ],
          onMount: function (wrap) {
            wrap.addEventListener('click', function (e) {
              if (e.target === wrap && !done) resolve(false);
            });
          }
        });
        m.el.querySelector('[data-close]').addEventListener('click', function () { if (!done) resolve(false); });
      });
    },
    promptDialog: function (opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        const m = ui.modal({
          title: opts.title || 'Input',
          body: '<label class="field"><span>' + util.esc(opts.label || 'Nilai') + '</span>' +
            '<input id="pdInput" class="input" type="' + (opts.type || 'text') + '" value="' + util.esc(opts.value || '') +
            '" placeholder="' + util.esc(opts.placeholder || '') + '" autocomplete="off"></label>',
          actions: [
            { label: 'Batal', variant: 'ghost', onClick: function () { resolve(null); } },
            {
              label: opts.ok || 'Simpan', variant: 'primary', onClick: function (wrap) {
                const v = wrap.querySelector('#pdInput').value.trim();
                resolve(v || null);
              }
            }
          ],
          onMount: function (wrap) {
            const input = wrap.querySelector('#pdInput');
            setTimeout(function () { input.focus(); input.select(); }, 80);
            input.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') {
                const v = input.value.trim();
                if (v) { m.close(); resolve(v); }
              }
            });
            wrap.addEventListener('click', function (e) { if (e.target === wrap) resolve(null); });
            wrap.querySelector('[data-close]').addEventListener('click', function () { resolve(null); });
          }
        });
      });
    }
  };

  /* ---------- router sederhana ---------- */
  const router = {
    parse: function () {
      const h = location.hash.replace(/^#\/?/, '');
      const parts = h.split('/').filter(Boolean);
      return { path: parts[0] || 'home', param: parts[1] || null, raw: h };
    },
    go: function (path) {
      if (('#' + path) === location.hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
      else location.hash = path;
    },
    onChange: function (fn) { window.addEventListener('hashchange', fn); }
  };

  /* ---------- ekspor global ---------- */
  window.Aethel = {
    NS: NS, K: K, ADMIN_EMAIL: ADMIN_EMAIL,
    db: db, util: util, auth: auth, ui: ui, router: router, icon: icon,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS
  };
})();
