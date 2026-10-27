/* ============================================================
   AethelStudio AI — deploy.js
   Publikasi langsung ke Netlify / Vercel / Cloudflare Pages.
   ============================================================ */
(function () {
  'use strict';
  const util = window.Aethel.util;

  function slug(name) { return util.slug(name || 'aethel-site'); }

  function buildReadme(project, settings) {
    return '# ' + (project.title || 'Website') + '\n\n' +
      (project.description || '') + '\n\n' +
      'Dibuat dengan **AethelStudio AI**' + (settings ? ' v' + settings.version : '') + '.\n\n' +
      '## Isi paket\n\n' +
      Object.keys(project.files || {}).map(function (f) { return '- `' + f + '`'; }).join('\n') + '\n\n' +
      '## Cara menjalankan lokal\n\n' +
      '1. Ekstrak ZIP ini.\n' +
      '2. Buka `index.html` di browser, atau jalankan server lokal:\n\n' +
      '```bash\nnpx serve .\n```\n\n' +
      '## Cara publish gratis\n\n' +
      '- **Netlify Drop**: buka https://app.netlify.com/drop lalu tarik folder hasil ekstrak.\n' +
      '- **Cloudflare Pages**: buat project, pilih Direct Upload, unggah ZIP ini.\n' +
      '- **Vercel**: `npx vercel` di folder ini, atau drag & drop di dashboard.\n' +
      '- **GitHub Pages**: unggah file ke repo, aktifkan Pages di Settings.\n\n' +
      '## Struktur\n\n' +
      '```\n' + Object.keys(project.files || {}).map(function (f) { return f; }).join('\n') + '\n```\n\n' +
      '> Semua file statis — tidak butuh database atau server khusus.\n';
  }

  function projectZip(project) {
    const settings = window.Aethel.db.settings();
    const payload = {};
    Object.keys(project.files || {}).forEach(function (name) {
      payload[name] = project.files[name];
    });
    payload['README.md'] = buildReadme(project, settings);
    payload['netlify.toml'] = '[build]\n  publish = "."\n\n[[headers]]\n  for = "/*"\n  [headers.values]\n    X-Frame-Options = "SAMEORIGIN"\n';
    return window.Aethel.zip.build(payload);
  }

  function friendly(err, provider) {
    const msg = err && err.message ? err.message : String(err);
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
      return new Error('Gagal menghubungi ' + provider + '. Kemungkinan: tidak ada internet, token salah, atau browser memblokir CORS. Coba buka lewat http://localhost atau HTTPS.');
    }
    if (/401|403|unauthorized|invalid token/i.test(msg)) {
      return new Error('Token ' + provider + ' ditolak. Periksa kembali token di Pengaturan → Kunci API.');
    }
    return err;
  }

  async function jfetch(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (!res.ok) {
      const detail = data && (data.error || data.errors || data.message);
      const msg = typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : '');
      throw new Error('HTTP ' + res.status + (msg ? ' — ' + msg.slice(0, 260) : ''));
    }
    return data;
  }

  /* ---------- Netlify ---------- */
  async function netlify(project, opts) {
    opts = opts || {};
    const token = (opts.token || '').trim();
    if (!token) throw new Error('Token Netlify belum diisi.');
    const zip = projectZip(project);
    const siteName = opts.siteName ? slug(opts.siteName) : '';

    let siteId = opts.siteId || '';
    let siteUrl = '';
    if (!siteId) {
      const body = siteName ? { name: siteName } : {};
      const site = await jfetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!site || !site.id) throw new Error('Gagal membuat situs Netlify.');
      siteId = site.id;
      siteUrl = site.ssl_url || site.url || '';
    }

    const deploy = await jfetch('https://api.netlify.com/api/v1/sites/' + siteId + '/deploys', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/zip' },
      body: zip
    });
    const url = deploy.ssl_url || deploy.deploy_ssl_url || siteUrl || deploy.url || '';
    return {
      provider: 'Netlify', url: url,
      adminUrl: 'https://app.netlify.com/sites/' + (deploy.site_id || siteId),
      id: deploy.id || siteId,
      note: 'Deploy selesai. Situs aktif dalam beberapa detik.'
    };
  }

  /* ---------- Vercel ---------- */
  async function vercel(project, opts) {
    opts = opts || {};
    const token = (opts.token || '').trim();
    if (!token) throw new Error('Token Vercel belum diisi.');
    const name = slug(opts.projectName || project.title);
    const files = Object.keys(project.files || {}).map(function (f) {
      return { file: f, data: project.files[f], encoding: 'utf-8' };
    });
    if (!files.some(function (f) { return f.file === 'index.html'; })) {
      throw new Error('Project tidak memiliki index.html.');
    }
    const body = {
      name: name,
      files: files,
      target: 'production',
      projectSettings: { framework: null, buildCommand: null, outputDirectory: null }
    };
    const data = await jfetch('https://api.vercel.com/v13/deployments?forceNew=1&skipAutoDetectionConfirmation=1', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const host = data.url || (data.alias && data.alias[0]) || '';
    return {
      provider: 'Vercel',
      url: host ? 'https://' + host.replace(/^https?:\/\//, '') : 'https://vercel.com/dashboard',
      adminUrl: 'https://vercel.com/dashboard',
      id: data.id || '',
      note: 'Deploy dikirim. Build statis biasanya selesai < 60 detik.'
    };
  }

  /* ---------- Cloudflare Pages ---------- */
  async function cloudflare(project, opts) {
    opts = opts || {};
    const token = (opts.token || '').trim();
    const account = (opts.accountId || '').trim();
    const projectName = slug(opts.projectName || project.title);
    if (!token) throw new Error('Token Cloudflare belum diisi.');
    if (!account) throw new Error('Account ID Cloudflare belum diisi.');
    const base = 'https://api.cloudflare.com/client/v4/accounts/' + encodeURIComponent(account);
    const headers = { Authorization: 'Bearer ' + token };

    // pastikan project ada
    let exists = false;
    try {
      await jfetch(base + '/pages/projects/' + projectName, { headers: headers });
      exists = true;
    } catch (e) {
      if (!/HTTP 404/.test(e.message)) throw e;
    }
    if (!exists) {
      try {
        await jfetch(base + '/pages/projects', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
          body: JSON.stringify({ name: projectName, production_branch: 'main' })
        });
      } catch (e) {
        if (!/already exists|HTTP 409/i.test(e.message)) throw e;
      }
    }

    const fd = new FormData();
    fd.append('file', projectZip(project), 'site.zip');
    const result = await jfetch(base + '/pages/projects/' + projectName + '/deployments', {
      method: 'POST',
      headers: headers,
      body: fd
    });
    const dep = (result && result.result) || {};
    return {
      provider: 'Cloudflare Pages',
      url: dep.url || ('https://' + projectName + '.pages.dev'),
      adminUrl: 'https://dash.cloudflare.com/?to=/:account/pages/view/' + projectName,
      id: dep.id || '',
      note: 'Upload berhasil. Situs tersedia di subdomain .pages.dev.'
    };
  }

  async function verify(provider, opts) {
    opts = opts || {};
    if (provider === 'netlify') {
      const data = await jfetch('https://api.netlify.com/api/v1/user', {
        headers: { Authorization: 'Bearer ' + (opts.token || '') }
      });
      return 'Netlify OK · ' + (data.email || data.full_name || 'terhubung');
    }
    if (provider === 'vercel') {
      const data = await jfetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: 'Bearer ' + (opts.token || '') }
      });
      const u = data.user || data;
      return 'Vercel OK · ' + (u.username || u.email || 'terhubung');
    }
    if (provider === 'cloudflare') {
      const data = await jfetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        headers: { Authorization: 'Bearer ' + (opts.token || '') }
      });
      return 'Cloudflare OK · ' + (data.result && data.result.status ? data.result.status : 'aktif');
    }
    throw new Error('Provider tidak dikenal.');
  }

  window.Aethel.deploy = {
    providers: [
      { id: 'netlify', name: 'Netlify', desc: 'Upload ZIP langsung & publikasi instan.', accent: '#14b8a6', emoji: '◆' },
      { id: 'vercel', name: 'Vercel', desc: 'Hosting otomatis untuk HTML statis & Next.js.', accent: '#e5e7eb', emoji: '▲' },
      { id: 'cloudflare', name: 'Cloudflare Pages', desc: 'Kecepatan tinggi dengan edge network global.', accent: '#f59e0b', emoji: '☁' }
    ],
    projectZip: projectZip,
    readme: buildReadme,
    netlify: function (p, o) { return netlify(p, o).catch(function (e) { throw friendly(e, 'Netlify'); }); },
    vercel: function (p, o) { return vercel(p, o).catch(function (e) { throw friendly(e, 'Vercel'); }); },
    cloudflare: function (p, o) { return cloudflare(p, o).catch(function (e) { throw friendly(e, 'Cloudflare'); }); },
    verify: function (provider, opts) { return verify(provider, opts).catch(function (e) { throw friendly(e, provider); }); }
  };
})();
