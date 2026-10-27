/* ============================================================
   AethelStudio AI — pages.js
   Gambar AI, SEO, palet warna, QR, cuplikan kode, alat,
   pengaturan pengguna, dan bantuan.
   ============================================================ */
(function () {
  'use strict';
  const A = window.Aethel;
  const db = A.db, util = A.util, ui = A.ui, icon = A.icon, gen = A.gen;

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function locked(title, msg) {
    return { html: '<div class="empty-state tall"><div class="empty-ic">🔒</div><h2>' + util.esc(title) +
      '</h2><p>' + util.esc(msg) + '</p><a class="btn ghost" href="#/help">Bantuan</a></div>', mount: function () {} };
  }

  /* ============================================================
     1. Gambar AI
     ============================================================ */
  function imagesPage() {
    const s = db.settings();
    if (s.features && s.features.images === false && !A.auth.isAdmin()) {
      return locked('Gambar AI dinonaktifkan', 'Fitur ini sedang dimatikan oleh administrator.');
    }
    const html = '<div class="page-head"><div><h1>Gambar AI</h1><p class="muted">Buat aset visual gratis untuk website Anda — tanpa API key.</p></div>' +
      '<a class="btn ghost" href="#/home">' + icon('sparkles', 16) + ' Kembali ke builder</a></div>' +
      '<div class="panel">' +
      '<label class="field full"><span>Deskripsikan gambar</span><textarea id="imgPrompt" class="input" rows="2" placeholder="Contoh: interior kedai kopi hangat, kayu dan tanaman, cahaya sore, fotografi sinematik"></textarea></label>' +
      '<div class="form-grid mt-1">' +
      '<label class="field"><span>Gaya</span><select id="imgStyle" class="input">' +
      '<option value="fotografi profesional, pencahayaan natural, detail tajam">Fotografi</option>' +
      '<option value="ilustrasi digital modern, warna lembut, bersih">Ilustrasi</option>' +
      '<option value="3d render, octane, studio lighting, premium">3D Render</option>' +
      '<option value="minimalis, banyak ruang kosong, elegan">Minimalis</option>' +
      '<option value="cyberpunk, neon, futuristik, sinematik">Futuristik</option>' +
      '<option value="cat air, tekstur kertas, artistik">Cat Air</option>' +
      '</select></label>' +
      '<label class="field"><span>Rasio</span><select id="imgRatio" class="input">' +
      '<option value="1024x1024">Persegi 1:1</option><option value="1344x768" selected>Landscape 16:9</option>' +
      '<option value="768x1344">Portrait 9:16</option><option value="1200x800">Lebar 3:2</option>' +
      '</select></label>' +
      '<label class="field"><span>Jumlah</span><select id="imgCount" class="input"><option>1</option><option>2</option><option>4</option></select></label>' +
      '</div>' +
      '<div class="form-actions"><button class="btn primary" id="genImages">' + icon('image', 16) + ' Buat gambar</button>' +
      '<span class="muted small">Gratis lewat Pollinations · butuh internet · tanpa watermark</span></div>' +
      '<div class="prompt-chips mt-1">' + [
        'interior cafe minimalis dengan tanaman dan cahaya pagi',
        'mockup aplikasi mobile di meja kayu, latar gelap',
        'produk skincare premium di atas batu, bayangan lembut',
        'pemandangan pantai tropis dari udara, air biru jernih',
        'potret pengusaha muda di ruang kerja modern',
        'makanan lokal ditata di piring keramik, top view'
      ].map(function (p) { return '<button class="prompt-chip" data-ip="' + util.esc(p) + '">' + util.esc(p) + '</button>'; }).join('') + '</div>' +
      '</div>' +
      '<div id="imgResults" class="image-grid mt-2"></div>' +
      '<div class="notice mt-2">' + icon('zap', 18) + '<div><b>Tips:</b> tulis subjek, suasana, gaya, dan pencahayaan. Gambar dibuat lewat URL publik Pollinations; simpan hasilnya karena tautan bisa berubah sewaktu-waktu.</div></div>';

    return {
      html: html,
      mount: function (root) {
        $$('[data-ip]', root).forEach(function (b) {
          b.addEventListener('click', function () { $('#imgPrompt', root).value = b.getAttribute('data-ip'); });
        });
        $('#genImages', root).addEventListener('click', async function () {
          const prompt = $('#imgPrompt', root).value.trim();
          if (!prompt) return ui.toast('Tulis deskripsi gambar dulu.', 'info');
          const style = $('#imgStyle', root).value;
          const ratio = $('#imgRatio', root).value.split('x');
          const count = Number($('#imgCount', root).value);
          const results = $('#imgResults', root);
          results.innerHTML = '';
          const btn = this;
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span> Membuat…';
          for (let i = 0; i < count; i++) {
            const seed = Math.floor(Math.random() * 900000) + 100000;
            const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt + ', ' + style) +
              '?width=' + ratio[0] + '&height=' + ratio[1] + '&seed=' + seed + '&nologo=true&model=flux';
            const card = document.createElement('figure');
            card.className = 'image-card loading';
            card.innerHTML = '<div class="image-ph"><span class="spinner"></span><small>Membuat gambar ' + (i + 1) + '…</small></div>' +
              '<div class="image-meta"><div><b>' + util.esc(prompt.slice(0, 54)) + '</b><small>' + ratio[0] + '×' + ratio[1] + '</small></div>' +
              '<div class="image-actions">' +
              '<button class="icon-btn sm" data-i="copy" title="Salin URL">' + icon('copy', 15) + '</button>' +
              '<button class="icon-btn sm" data-i="html" title="Salin HTML">' + icon('code', 15) + '</button>' +
              '<button class="icon-btn sm" data-i="open" title="Buka">' + icon('external', 15) + '</button>' +
              '<button class="icon-btn sm" data-i="dl" title="Unduh">' + icon('download', 15) + '</button>' +
              '</div></div>';
            results.appendChild(card);
            const img = new Image();
            img.loading = 'lazy';
            img.alt = prompt.slice(0, 80);
            img.src = url;
            img.onload = function () {
              card.classList.remove('loading');
              const ph = card.querySelector('.image-ph');
              if (ph) ph.replaceWith(img);
            };
            img.onerror = function () {
              card.classList.remove('loading');
              const ph = card.querySelector('.image-ph');
              if (ph) ph.innerHTML = '<b>Gagal memuat</b><small>Coba lagi atau periksa koneksi.</small>';
            };
            card.dataset.url = url;
            card.querySelectorAll('[data-i]').forEach(function (b) {
              b.addEventListener('click', async function () {
                const act = b.getAttribute('data-i');
                if (act === 'copy') util.copy(url);
                else if (act === 'html') util.copy('<img src="' + url + '" alt="' + prompt.replace(/"/g, '&quot;') + '" loading="lazy">');
                else if (act === 'open') window.open(url, '_blank');
                else if (act === 'dl') {
                  try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    util.download(blob, 'aethel-image-' + seed + '.jpg');
                  } catch (e) {
                    window.open(url, '_blank');
                    ui.toast('Buka gambar lalu simpan manual (CORS).', 'info');
                  }
                }
              });
            });
            await new Promise(function (r) { setTimeout(r, 350); });
          }
          btn.disabled = false;
          btn.innerHTML = icon('refresh', 16) + ' Buat lagi';
          db.track('image', count);
          db.log('gambar', prompt.slice(0, 70) + ' ×' + count);
          ui.toast(count + ' gambar sedang dibuat…', 'success');
        });
      }
    };
  }

  /* ============================================================
     2. SEO Toolkit
     ============================================================ */
  function seoPage() {
    const projects = db.myProjects();
    if (!projects.length) {
      return { html: '<div class="empty-state tall"><div class="empty-ic">' + icon('search', 36) + '</div>' +
        '<h2>Belum ada proyek untuk dianalisis</h2><p>Buat website dulu, lalu kembali ke sini untuk audit SEO dan membuat meta tag.</p>' +
        '<a class="btn primary" href="#/home">Buat website</a></div>', mount: function () {} };
    }
    const sel = projects[0];
    const html = '<div class="page-head"><div><h1>SEO Toolkit</h1><p class="muted">Audit website, siapkan meta tag, dan tingkatkan visibilitas di mesin pencari.</p></div></div>' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('search', 18) + ' Audit On-Page</h3>' +
      '<select id="seoProject" class="input compact">' + A.app.projectOptions(sel.id) + '</select></div>' +
      '<div id="seoResult"></div></div>' +
      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('snippet', 18) + ' Generator Meta Tag</h3>' +
      '<button class="btn primary sm" id="copyMeta">Salin semua</button></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span>Judul halaman (≤60)</span><input id="mTitle" class="input" maxlength="70" placeholder="Nama bisnis — layanan utama"></label>' +
      '<label class="field"><span>URL website</span><input id="mUrl" class="input" placeholder="https://contoh.com"></label>' +
      '<label class="field full"><span>Deskripsi (50–160)</span><textarea id="mDesc" class="input" rows="2" maxlength="180" placeholder="Jelaskan bisnis Anda dalam satu kalimat yang menarik."></textarea></label>' +
      '<label class="field"><span>Kata kunci</span><input id="mKeys" class="input" placeholder="kopi, cafe, bandung"></label>' +
      '<label class="field"><span>Gambar OG (URL)</span><input id="mImg" class="input" placeholder="https://contoh.com/og.jpg"></label>' +
      '</div><div class="form-actions"><button class="btn ghost" id="buildMeta">' + icon('zap', 16) + ' Buat meta tag</button></div>' +
      '<pre class="code-out" id="metaOut" hidden></pre></div>';

    return {
      html: html,
      mount: function (root) {
        const select = $('#seoProject', root);
        function paint() {
          const p = db.getProject(select.value);
          if (!p) return;
          const res = analyze(p);
          $('#seoResult', root).innerHTML = '<div class="seo-score-wrap">' +
            '<div class="score-ring" style="--p:' + res.score + ';--c:' + res.color + '"><span>' + res.score + '</span><small>/100</small></div>' +
            '<div class="score-copy"><h3>' + res.grade + '</h3><p class="muted">' + res.summary + '</p>' +
            '<div class="score-facts"><span>' + res.words + ' kata</span><span>' + res.headings + ' heading</span><span>' + res.images + ' gambar</span><span>' + res.links + ' tautan</span></div></div></div>' +
            '<div class="checks">' + res.checks.map(function (c) {
              return '<div class="check ' + (c.ok ? 'ok' : 'bad') + '"><span class="check-ic">' + (c.ok ? '✓' : '!') + '</span>' +
                '<div><b>' + util.esc(c.label) + '</b><small>' + util.esc(c.detail) + '</small></div><span class="tag ' + (c.ok ? 'ok' : 'warn') + '">' + (c.ok ? 'bagus' : 'perbaiki') + '</span></div>';
            }).join('') + '</div>' +
            (res.suggestions.length ? '<div class="seo-tips"><b>Saran perbaikan</b><ul>' + res.suggestions.map(function (s) { return '<li>' + util.esc(s) + '</li>'; }).join('') + '</ul></div>' : '');

          $('#mTitle', root).value = p.title + ' — ' + (p.tags || ['website'])[0];
          $('#mDesc', root).value = p.description || '';
          const html = p.files['index.html'] || '';
          const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (tm) $('#mTitle', root).value = tm[1].trim();
          $('#mKeys', root).value = (p.tags || []).join(', ');
        }
        select.addEventListener('change', paint);
        paint();
        $('#buildMeta', root).addEventListener('click', function () {
          const t = $('#mTitle', root).value.trim() || 'Judul Website';
          const d = $('#mDesc', root).value.trim();
          const u = $('#mUrl', root).value.trim() || 'https://contoh.com';
          const k = $('#mKeys', root).value.trim();
          const img = $('#mImg', root).value.trim();
          const out = [
            '<title>' + util.esc(t) + '</title>',
            '<meta name="description" content="' + util.esc(d) + '">',
            k ? '<meta name="keywords" content="' + util.esc(k) + '">' : '',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            '<link rel="canonical" href="' + util.esc(u) + '">',
            '',
            '<!-- Open Graph -->',
            '<meta property="og:type" content="website">',
            '<meta property="og:title" content="' + util.esc(t) + '">',
            '<meta property="og:description" content="' + util.esc(d) + '">',
            '<meta property="og:url" content="' + util.esc(u) + '">',
            img ? '<meta property="og:image" content="' + util.esc(img) + '">' : '',
            '',
            '<!-- Twitter -->',
            '<meta name="twitter:card" content="summary_large_image">',
            '<meta name="twitter:title" content="' + util.esc(t) + '">',
            '<meta name="twitter:description" content="' + util.esc(d) + '">',
            img ? '<meta name="twitter:image" content="' + util.esc(img) + '">' : ''
          ].filter(Boolean).join('\n');
          const pre = $('#metaOut', root);
          pre.hidden = false;
          pre.textContent = out;
          util.copy(out);
        });
        const cm = $('#copyMeta', root);
        if (cm) cm.addEventListener('click', function () {
          const pre = $('#metaOut', root);
          if (pre.hidden) return ui.toast('Buat meta tag dulu.', 'info');
          util.copy(pre.textContent);
        });
      }
    };
  }

  function analyze(project) {
    const files = project.files || {};
    const html = files['index.html'] || '';
    const css = Object.keys(files).filter(function (f) { return /\.css$/i.test(f); }).map(function (f) { return files[f]; }).join('\n');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const title = (doc.title || '').trim();
    const desc = (doc.querySelector('meta[name="description"]') || {}).content || '';
    const viewport = !!doc.querySelector('meta[name="viewport"]');
    const lang = doc.documentElement.getAttribute('lang');
    const h1s = doc.querySelectorAll('h1');
    const og = !!(doc.querySelector('meta[property="og:title"]') && doc.querySelector('meta[property="og:description"]'));
    const imgs = Array.prototype.slice.call(doc.querySelectorAll('img'));
    const noAlt = imgs.filter(function (i) { return !i.getAttribute('alt'); }).length;
    const bodyText = ((doc.body && (doc.body.innerText || doc.body.textContent)) || '').replace(/\s+/g, ' ').trim();
    const words = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;
    const media = /@media/i.test(css) || /<style[^>]*>[\s\S]*@media/i.test(html);
    const canonical = !!doc.querySelector('link[rel="canonical"]');
    const favicon = !!doc.querySelector('link[rel*="icon"]');
    const links = doc.querySelectorAll('a[href]').length;
    const headings = doc.querySelectorAll('h1,h2,h3,h4').length;

    const checks = [
      { ok: title.length >= 15 && title.length <= 65, label: 'Judul halaman', detail: title ? '"' + title + '" (' + title.length + ' karakter)' : 'Belum ada <title>', weight: 15 },
      { ok: desc.length >= 50 && desc.length <= 165, label: 'Meta description', detail: desc ? desc.length + ' karakter' : 'Belum ada meta description', weight: 15 },
      { ok: viewport, label: 'Viewport mobile', detail: viewport ? 'Terverifikasi responsif' : 'Tambahkan meta viewport', weight: 10 },
      { ok: !!lang, label: 'Atribut bahasa', detail: lang ? 'lang="' + lang + '"' : 'Tambahkan lang="id" pada <html>', weight: 5 },
      { ok: h1s.length === 1, label: 'Struktur H1', detail: h1s.length + ' tag H1 ditemukan (idealnya 1)', weight: 10 },
      { ok: og, label: 'Open Graph', detail: og ? 'Siap dibagikan di sosial media' : 'Tambahkan og:title & og:description', weight: 10 },
      { ok: noAlt === 0, label: 'Alt gambar', detail: imgs.length ? noAlt + ' dari ' + imgs.length + ' gambar tanpa alt' : 'Tidak ada gambar (aman)', weight: 10 },
      { ok: words >= 250, label: 'Jumlah konten', detail: words + ' kata (disarankan ≥250)', weight: 10 },
      { ok: canonical, label: 'Canonical URL', detail: canonical ? 'Ada' : 'Belum ada link canonical', weight: 5 },
      { ok: favicon, label: 'Favicon', detail: favicon ? 'Ada' : 'Belum ada favicon', weight: 5 },
      { ok: media, label: 'Media query CSS', detail: media ? 'Layout responsif terdeteksi' : 'Tidak ditemukan @media', weight: 5 }
    ];
    let score = 0, total = 0;
    checks.forEach(function (c) { total += c.weight; if (c.ok) score += c.weight; });
    score = Math.round(score / total * 100);
    const grade = score >= 85 ? 'Sangat baik' : score >= 70 ? 'Cukup baik' : score >= 50 ? 'Perlu perbaikan' : 'Belum optimal';
    const color = score >= 85 ? '#34d399' : score >= 70 ? '#2dd4bf' : score >= 50 ? '#fbbf24' : '#f87171';
    const suggestions = checks.filter(function (c) { return !c.ok; }).map(function (c) {
      if (/Judul/.test(c.label)) return 'Buat judul 40–60 karakter yang memuat kata kunci utama.';
      if (/description/i.test(c.label)) return 'Tulis meta description 50–160 karakter dengan ajakan bertindak.';
      if (/viewport/i.test(c.label)) return 'Tambahkan <meta name="viewport" content="width=device-width, initial-scale=1">.';
      if (/H1/i.test(c.label)) return 'Gunakan tepat satu H1 berisi topik utama halaman.';
      if (/Open Graph/i.test(c.label)) return 'Tambahkan og:title, og:description, dan og:image untuk tampilan berbagi.';
      if (/Alt/i.test(c.label)) return 'Tambahkan atribut alt deskriptif pada setiap gambar.';
      if (/konten/i.test(c.label)) return 'Tambahkan konten informatif minimal 250 kata.';
      if (/Canonical/i.test(c.label)) return 'Tambahkan <link rel="canonical" href="URL-utama">.';
      if (/Favicon/i.test(c.label)) return 'Tambahkan favicon agar tampil profesional di tab browser.';
      if (/Media query/i.test(c.label)) return 'Tambahkan media query agar nyaman di layar kecil.';
      return c.detail;
    });
    return {
      score: score, grade: grade, color: color, checks: checks, suggestions: suggestions,
      words: words, headings: headings, images: imgs.length, links: links,
      summary: score >= 85 ? 'Website Anda sudah ramah mesin pencari. Pertahankan kualitas konten.' :
        score >= 70 ? 'Sejumlah perbaikan kecil akan meningkatkan peringkat pencarian.' :
          'Beberapa elemen dasar SEO belum optimal. Ikuti saran di bawah.'
    };
  }

  /* ============================================================
     3. Palet warna
     ============================================================ */
  function hexToHsl(hex) {
    hex = String(hex).replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.min(100, Math.max(0, s)) / 100; l = Math.min(100, Math.max(0, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    const to = function (v) { return Math.round((v + m) * 255).toString(16).padStart(2, '0'); };
    return '#' + to(r) + to(g) + to(b);
  }

  function palettePage() {
    let base = '#2dd4bf';
    let mode = 'analogous';
    const html = '<div class="page-head"><div><h1>Palet Warna</h1><p class="muted">Buat harmoni warna profesional untuk website Anda, lengkap dengan CSS variabel.</p></div></div>' +
      '<div class="panel"><div class="form-grid">' +
      '<label class="field"><span>Warna dasar</span><div class="color-row"><input id="palBase" type="color" class="input color" value="' + base + '">' +
      '<input id="palHex" class="input mono" value="' + base + '" maxlength="7"></div></label>' +
      '<label class="field"><span>Harmoni</span><select id="palMode" class="input">' +
      '<option value="analogous">Analogous (serasi)</option><option value="complementary">Complementary (kontras)</option>' +
      '<option value="triadic">Triadic (seimbang)</option><option value="split">Split Complementary</option>' +
      '<option value="monochrome">Monochrome (satu nada)</option></select></label>' +
      '</div><div class="form-actions"><button class="btn primary" id="makePalette">' + icon('palette', 16) + ' Buat palet</button>' +
      '<button class="btn ghost" id="randomPalette">🎲 Acak</button></div>' +
      '<div id="palOut" class="palette-out"></div>' +
      '<div class="mt-2"><div class="panel-head"><h3>CSS Variabel</h3><button class="btn sm ghost" id="copyCss">Salin</button></div>' +
      '<pre class="code-out" id="cssOut">:root{}</pre></div>' +
      '<div class="form-actions"><button class="btn primary" id="siteFromPalette">' + icon('sparkles', 16) + ' Buat website dengan palet ini</button></div></div>';

    return {
      html: html,
      mount: function (root) {
        const out = $('#palOut', root), cssOut = $('#cssOut', root);
        let colors = [];

        function renderPalette() {
          const hsl = hexToHsl(base);
          let angles;
          if (mode === 'complementary') angles = [0, 180, 180, 0, 0];
          else if (mode === 'triadic') angles = [0, 120, 240, 60, 300];
          else if (mode === 'split') angles = [0, 150, 210, 30, 330];
          else if (mode === 'monochrome') angles = [0, 0, 0, 0, 0];
          else angles = [0, 30, -30, 60, -60];
          const lums = mode === 'monochrome' ? [22, 38, 52, 68, 84] : [24, 38, 50, 64, 80];
          colors = angles.map(function (a, i) {
            return hslToHex(hsl.h + a, mode === 'monochrome' ? hsl.s : Math.max(35, Math.min(88, hsl.s + (i - 2) * 4)), lums[i]);
          });
          const roles = ['Latar gelap', 'Permukaan', 'Warna utama', 'Aksen', 'Sorotan'];
          out.innerHTML = colors.map(function (c, i) {
            return '<button class="pal-swatch" data-hex="' + c + '" style="background:' + c + '">' +
              '<span class="pal-role" style="color:' + (i >= 3 ? '#08111d' : '#ffffff') + '">' + roles[i] + '</span>' +
              '<span class="pal-hex" style="color:' + (i >= 3 ? '#08111d' : '#ffffff') + '">' + c.toUpperCase() + '</span></button>';
          }).join('');
          $$('.pal-swatch', out).forEach(function (b) {
            b.addEventListener('click', function () { util.copy(b.getAttribute('data-hex')); });
          });
          cssOut.textContent = ':root {\n' +
            '  --bg: ' + colors[0] + ';\n' +
            '  --surface: ' + colors[1] + ';\n' +
            '  --primary: ' + colors[2] + ';\n' +
            '  --accent: ' + colors[3] + ';\n' +
            '  --highlight: ' + colors[4] + ';\n' +
            '  --text: #eef4ff;\n' +
            '  --muted: #9aabc2;\n' +
            '  --line: rgba(255,255,255,.09);\n' +
            '  --radius: 20px;\n' +
            '}';
        }

        $('#palBase', root).addEventListener('input', function () {
          base = this.value;
          $('#palHex', root).value = base;
          renderPalette();
        });
        $('#palHex', root).addEventListener('change', function () {
          let v = this.value.trim();
          if (!v.startsWith('#')) v = '#' + v;
          if (!/^#[0-9a-f]{6}$/i.test(v)) return ui.toast('Format hex tidak valid (contoh: #2dd4bf).', 'error');
          base = v;
          $('#palBase', root).value = v;
          renderPalette();
        });
        $('#palMode', root).addEventListener('change', function () { mode = this.value; renderPalette(); });
        $('#makePalette', root).addEventListener('click', renderPalette);
        $('#randomPalette', root).addEventListener('click', function () {
          base = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          $('#palBase', root).value = base;
          $('#palHex', root).value = base;
          renderPalette();
        });
        $('#copyCss', root).addEventListener('click', function () { util.copy(cssOut.textContent); });
        $('#siteFromPalette', root).addEventListener('click', function () {
          const built = gen.fromPrompt('website bisnis modern profesional', { theme: { primary: colors[2], accent: colors[3] }, brand: 'Nusa Karya' });
          const project = A.app.createProject({
            title: built.title, description: 'Website dengan palet ' + colors[2].toUpperCase(),
            files: built.files, tags: ['custom', 'palette'], provider: 'offline'
          });
          db.track('gen');
          db.log('palette', 'website dari palet ' + colors[2]);
          A.app.openStudio(project.id);
        });
        renderPalette();
      }
    };
  }

  /* ============================================================
     4. QR Code
     ============================================================ */
  function qrPage() {
    const deployed = db.myProjects().filter(function (p) { return p.deployed; });
    const def = deployed.length ? deployed[0].deployed.url : (location.protocol.startsWith('http') ? location.href.split('#')[0] : 'https://aethelstudio.id');
    const html = '<div class="page-head"><div><h1>QR Code</h1><p class="muted">Buat kode QR untuk website, menu, atau tautan WhatsApp Anda.</p></div></div>' +
      '<div class="grid-2">' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('qr', 18) + ' Buat QR</h3></div>' +
      '<label class="field full"><span>Teks atau URL</span><textarea id="qrData" class="input" rows="2" placeholder="https://website-anda.com">' + util.esc(def) + '</textarea></label>' +
      '<div class="form-grid mt-1">' +
      '<label class="field"><span>Ukuran</span><select id="qrSize" class="input"><option value="256">256 px</option><option value="512" selected>512 px</option><option value="1024">1024 px</option></select></label>' +
      '<label class="field"><span>Warna</span><input type="color" id="qrColor" class="input color" value="#0b1220"></label>' +
      '<label class="field"><span>Latar</span><input type="color" id="qrBg" class="input color" value="#ffffff"></label>' +
      '</div><div class="form-actions"><button class="btn primary" id="genQr">' + icon('qr', 16) + ' Buat QR</button>' +
      '<span class="muted small">via api.qrserver.com</span></div></div>' +
      '<div class="panel qr-preview"><div class="qr-box" id="qrBox"><span class="muted small">QR akan muncul di sini</span></div>' +
      '<div class="qr-actions" id="qrActions" hidden>' +
      '<button class="btn sm ghost" data-q="open">' + icon('external', 15) + ' Buka</button>' +
      '<button class="btn sm ghost" data-q="copy">' + icon('link', 15) + ' Salin tautan</button>' +
      '<button class="btn sm ghost" data-q="html">' + icon('code', 15) + ' Salin HTML</button>' +
      '<button class="btn sm primary" data-q="dl">' + icon('download', 15) + ' Unduh PNG</button>' +
      '</div></div></div>' +
      '<div class="notice mt-2">' + icon('zap', 18) + '<div><b>Tips:</b> gunakan QR untuk menu restoran, kartu nama digital, undangan, atau tautan WhatsApp. Ukuran 512px cocok untuk cetak kecil.</div></div>';

    return {
      html: html,
      mount: function (root) {
        let url = '';
        function generate() {
          const data = $('#qrData', root).value.trim();
          if (!data) return ui.toast('Isi teks atau URL dulu.', 'info');
          const size = $('#qrSize', root).value;
          const color = $('#qrColor', root).value.replace('#', '');
          const bg = $('#qrBg', root).value.replace('#', '');
          url = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
            '&data=' + encodeURIComponent(data) + '&color=' + color + '&bgcolor=' + bg + '&margin=16';
          const box = $('#qrBox', root);
          box.innerHTML = '<img src="' + url + '" alt="QR Code" width="240" height="240">';
          $('#qrActions', root).hidden = false;
          db.log('qr', data.slice(0, 80));
        }
        $('#genQr', root).addEventListener('click', generate);
        $$('[data-q]', root).forEach(function (b) {
          b.addEventListener('click', async function () {
            if (!url) return;
            const act = b.getAttribute('data-q');
            if (act === 'open') window.open(url, '_blank');
            else if (act === 'copy') util.copy(url);
            else if (act === 'html') util.copy('<img src="' + url + '" alt="QR Code" width="240" height="240">');
            else if (act === 'dl') {
              try {
                const res = await fetch(url);
                util.download(await res.blob(), 'aethel-qr.png');
              } catch (e) { window.open(url, '_blank'); ui.toast('Simpan manual dari tab baru (CORS).', 'info'); }
            }
          });
        });
        generate();
      }
    };
  }

  /* ============================================================
     5. Cuplikan kode
     ============================================================ */
  const SNIPPETS = [
    {
      id: 'nav-glass', title: 'Navbar Glass Responsif', cat: 'Navigasi', slot: 'top',
      desc: 'Navbar sticky dengan efek kaca dan menu mobile otomatis.',
      code: `<!-- Navbar Glass -->
<header class="sn-nav">
  <a class="sn-brand" href="#">Brand<span>.</span></a>
  <nav class="sn-links">
    <a href="#fitur">Fitur</a><a href="#harga">Harga</a><a href="#kontak">Kontak</a>
  </nav>
  <button class="sn-burger" aria-label="Menu">☰</button>
</header>
<style>
.sn-nav{position:sticky;top:0;z-index:999;display:flex;align-items:center;justify-content:space-between;
padding:14px 22px;background:rgba(10,16,28,.72);backdrop-filter:blur(14px);
border-bottom:1px solid rgba(255,255,255,.09)}
.sn-brand{color:#fff;font-weight:800;font-size:1.1rem;text-decoration:none;letter-spacing:-.02em}
.sn-brand span{color:#2dd4bf}
.sn-links{display:flex;gap:22px}
.sn-links a{color:#9aabc2;text-decoration:none;font-size:.9rem}
.sn-links a:hover{color:#fff}
.sn-burger{display:none;background:none;border:0;color:#fff;font-size:1.3rem;cursor:pointer}
@media(max-width:760px){
 .sn-links{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;
 background:#0c1424;border-bottom:1px solid rgba(255,255,255,.09);
 max-height:0;overflow:hidden;transition:max-height .3s}
 .sn-links.open{max-height:260px}
 .sn-links a{padding:14px 22px;border-top:1px solid rgba(255,255,255,.05)}
 .sn-burger{display:block}
}
</style>
<script>
document.querySelector('.sn-burger').addEventListener('click',function(){
  document.querySelector('.sn-links').classList.toggle('open');
});
</script>`
    },
    {
      id: 'hero-grad', title: 'Hero Gradient + CTA', cat: 'Hero', slot: 'top',
      desc: 'Bagian pembuka dengan judul gradien, subteks, dan dua tombol.',
      code: `<!-- Hero Gradient -->
<section class="sn-hero">
  <span class="sn-pill">✦ Baru · Versi 2026</span>
  <h1>Bangun sesuatu yang <span>bermakna.</span></h1>
  <p>Solusi modern untuk bisnis yang ingin tumbuh lebih cepat, tanpa kerumitan.</p>
  <div class="sn-cta">
    <a class="sn-btn" href="#kontak">Mulai sekarang</a>
    <a class="sn-btn ghost" href="#fitur">Pelajari dulu</a>
  </div>
</section>
<style>
.sn-hero{position:relative;padding:90px 22px;text-align:center;background:radial-gradient(700px 320px at 50% -10%,rgba(45,212,191,.16),transparent 70%);font-family:system-ui,sans-serif}
.sn-hero .sn-pill{display:inline-block;padding:7px 16px;border-radius:99px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#c9d6e8;font-size:.78rem;margin-bottom:18px}
.sn-hero h1{font-size:clamp(2rem,6vw,3.6rem);line-height:1.1;letter-spacing:-.03em;color:#fff;margin:0 0 16px}
.sn-hero h1 span{background:linear-gradient(100deg,#2dd4bf,#6366f1);-webkit-background-clip:text;background-clip:text;color:transparent}
.sn-hero p{color:#9aabc2;max-width:560px;margin:0 auto 26px;font-size:1.02rem}
.sn-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.sn-btn{padding:13px 24px;border-radius:99px;background:linear-gradient(135deg,#2dd4bf,#22d3ee);color:#04121b;font-weight:700;text-decoration:none;font-size:.9rem}
.sn-btn.ghost{background:rgba(255,255,255,.05);color:#e8eff8;border:1px solid rgba(255,255,255,.12)}
</style>`
    },
    {
      id: 'pricing', title: 'Kartu Harga 3 Paket', cat: 'Konversi', slot: 'end',
      desc: 'Tiga kartu harga dengan paket unggulan dan tombol CTA.',
      code: `<!-- Pricing -->
<section class="sn-price-wrap">
  <h2>Harga yang jelas</h2>
  <div class="sn-price-grid">
    <article class="sn-price"><h3>Basic</h3><div class="sn-num">Rp199rb<span>/paket</span></div>
      <ul><li>✓ Fitur inti</li><li>✓ Dukungan email</li><li>✓ Update berkala</li></ul>
      <a href="#kontak">Pilih Basic</a></article>
    <article class="sn-price pop"><span class="sn-badge">Populer</span><h3>Pro</h3>
      <div class="sn-num">Rp499rb<span>/paket</span></div>
      <ul><li>✓ Semua fitur Basic</li><li>✓ Prioritas dukungan</li><li>✓ Konsultasi 1 jam</li></ul>
      <a href="#kontak">Pilih Pro</a></article>
    <article class="sn-price"><h3>Premium</h3><div class="sn-num">Rp999rb<span>/paket</span></div>
      <ul><li>✓ Fitur lengkap</li><li>✓ Pendampingan khusus</li><li>✓ Revisi tanpa batas</li></ul>
      <a href="#kontak">Pilih Premium</a></article>
  </div>
</section>
<style>
.sn-price-wrap{padding:70px 22px;background:#070b12;font-family:system-ui,sans-serif;text-align:center}
.sn-price-wrap h2{color:#fff;font-size:2rem;margin:0 0 32px}
.sn-price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1000px;margin:0 auto}
.sn-price{position:relative;text-align:left;padding:26px;border-radius:20px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);color:#e9eff8}
.sn-price.pop{border-color:rgba(45,212,191,.5);background:linear-gradient(170deg,rgba(45,212,191,.1),rgba(255,255,255,.03))}
.sn-badge{position:absolute;top:-11px;right:18px;background:#2dd4bf;color:#04121b;font-size:.68rem;font-weight:800;padding:4px 10px;border-radius:99px}
.sn-price h3{font-size:.95rem;color:#9aabc2;margin:0 0 8px}
.sn-num{font-size:1.9rem;font-weight:800;margin-bottom:16px}.sn-num span{font-size:.75rem;color:#9aabc2;font-weight:400}
.sn-price ul{list-style:none;padding:0;margin:0 0 20px;display:grid;gap:9px;font-size:.86rem;color:#a9b8cc}
.sn-price a{display:block;text-align:center;padding:11px;border-radius:99px;background:#2dd4bf;color:#04121b;font-weight:700;text-decoration:none;font-size:.85rem}
@media(max-width:760px){.sn-price-grid{grid-template-columns:1fr}}
</style>`
    },
    {
      id: 'form-wa', title: 'Form Kontak WhatsApp', cat: 'Form', slot: 'end',
      desc: 'Form sederhana yang mengirim pesan langsung ke WhatsApp.',
      code: `<!-- Form WhatsApp -->
<form class="sn-form" data-wa="6281234567890">
  <h3>Kirim pesan</h3>
  <input name="nama" placeholder="Nama Anda" required>
  <input name="wa" placeholder="Nomor WhatsApp" required>
  <textarea name="pesan" rows="4" placeholder="Apa yang bisa kami bantu?" required></textarea>
  <button type="submit">Kirim via WhatsApp</button>
</form>
<style>
.sn-form{max-width:440px;margin:40px auto;padding:26px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:#0e1829;display:grid;gap:12px;font-family:system-ui,sans-serif}
.sn-form h3{color:#fff;margin:0 0 4px}
.sn-form input,.sn-form textarea{padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:#0a1322;color:#e9eff8;font:inherit;font-size:.9rem;outline:none}
.sn-form input:focus,.sn-form textarea:focus{border-color:#2dd4bf}
.sn-form button{padding:13px;border:0;border-radius:12px;background:#25d366;color:#04121b;font-weight:800;cursor:pointer;font-size:.9rem}
</style>
<script>
document.querySelectorAll('.sn-form').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(f);
    var msg='Halo, saya '+d.get('nama')+' (WA '+d.get('wa')+').%0A%0A'+d.get('pesan');
    window.open('https://wa.me/'+f.dataset.wa+'?text='+msg,'_blank');
  });
});
</script>`
    },
    {
      id: 'wa-float', title: 'Tombol WhatsApp Melayang', cat: 'Utility', slot: 'end',
      desc: 'Tombol bulat hijau yang selalu terlihat di kanan bawah.',
      code: `<!-- Tombol WhatsApp -->
<a class="sn-wa" href="https://wa.me/6281234567890" target="_blank" rel="noopener" aria-label="Chat WhatsApp">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.4 12c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.5-1 .1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2.1.8 2.5.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.2z"/></svg>
</a>
<style>
.sn-wa{position:fixed;right:18px;bottom:18px;z-index:9999;width:56px;height:56px;border-radius:50%;
display:grid;place-items:center;background:#25d366;color:#fff;box-shadow:0 14px 30px -10px rgba(37,211,102,.8);
transition:transform .2s}
.sn-wa:hover{transform:scale(1.08)}
</style>`
    },
    {
      id: 'cookie', title: 'Banner Cookie', cat: 'Utility', slot: 'end',
      desc: 'Pemberitahuan cookie yang tersimpan di localStorage.',
      code: `<!-- Cookie Banner -->
<div class="sn-cookie" id="snCookie" hidden>
  <p>Kami menggunakan cookie untuk meningkatkan pengalaman Anda.</p>
  <div><button id="snCookieOk">Setuju</button></div>
</div>
<style>
.sn-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;max-width:520px;
padding:16px 18px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:#0e1829;
color:#c9d6e8;display:flex;gap:14px;align-items:center;font-family:system-ui,sans-serif;font-size:.85rem;
box-shadow:0 20px 50px -20px #000}
.sn-cookie p{margin:0;flex:1}
.sn-cookie button{padding:9px 18px;border:0;border-radius:99px;background:#2dd4bf;color:#04121b;font-weight:700;cursor:pointer}
@media(max-width:560px){.sn-cookie{flex-direction:column;align-items:stretch;text-align:center}}
</style>
<script>
(function(){
  var box=document.getElementById('snCookie');
  if(!box) return;
  if(!localStorage.getItem('snCookieOk')) box.hidden=false;
  document.getElementById('snCookieOk').addEventListener('click',function(){
    localStorage.setItem('snCookieOk','1'); box.hidden=true;
  });
})();
</script>`
    },
    {
      id: 'loader', title: 'Loader Halaman', cat: 'Animasi', slot: 'top',
      desc: 'Overlay loading yang hilang otomatis setelah halaman siap.',
      code: `<!-- Loader -->
<div class="sn-loader" id="snLoader"><span></span></div>
<style>
.sn-loader{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#070b12;
transition:opacity .4s,visibility .4s}
.sn-loader.done{opacity:0;visibility:hidden}
.sn-loader span{width:42px;height:42px;border-radius:50%;border:3px solid rgba(255,255,255,.12);
border-top-color:#2dd4bf;animation:snSpin .8s linear infinite}
@keyframes snSpin{to{transform:rotate(360deg)}}
</style>
<script>
window.addEventListener('load',function(){
  var l=document.getElementById('snLoader');
  if(l){setTimeout(function(){l.classList.add('done');},350);}
});
</script>`
    },
    {
      id: 'reveal', title: 'Animasi Reveal Scroll', cat: 'Animasi', slot: 'end',
      desc: 'Elemen muncul halus saat masuk viewport. Tambahkan class reveal.',
      code: `<!-- Scroll Reveal -->
<style>
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}}
</style>
<script>
(function(){
  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');}); return;
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
})();
</script>`
    },
    {
      id: 'faq', title: 'FAQ Accordion', cat: 'Konten', slot: 'end',
      desc: 'Accordion tanpa JavaScript menggunakan elemen details.',
      code: `<!-- FAQ Accordion -->
<section class="sn-faq">
  <h2>Pertanyaan Umum</h2>
  <details><summary>Berapa lama pengerjaannya?<span>+</span></summary><p>Biasanya 3–7 hari kerja setelah brief diterima.</p></details>
  <details><summary>Apakah bisa request desain khusus?<span>+</span></summary><p>Tentu, kami menyesuaikan warna dan konten dengan brand Anda.</p></details>
  <details><summary>Bagaimana cara memesan?<span>+</span></summary><p>Hubungi kami melalui WhatsApp atau formulir kontak.</p></details>
</section>
<style>
.sn-faq{max-width:760px;margin:50px auto;padding:0 20px;font-family:system-ui,sans-serif}
.sn-faq h2{color:#fff;text-align:center;margin-bottom:24px}
.sn-faq details{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);border-radius:14px;
padding:15px 18px;margin-bottom:10px;color:#e9eff8}
.sn-faq summary{display:flex;justify-content:space-between;gap:12px;cursor:pointer;font-weight:600;list-style:none;font-size:.92rem}
.sn-faq summary::-webkit-details-marker{display:none}
.sn-faq summary span{color:#2dd4bf;transition:transform .2s}
.sn-faq details[open] summary span{transform:rotate(45deg)}
.sn-faq p{color:#9aabc2;font-size:.87rem;margin:10px 0 0;line-height:1.7}
</style>`
    },
    {
      id: 'countdown', title: 'Countdown Timer', cat: 'Utility', slot: 'end',
      desc: 'Hitung mundur menuju tanggal acara atau peluncuran.',
      code: `<!-- Countdown -->
<div class="sn-count" data-target="2026-12-31T23:59:59">
  <div><b id="snD">00</b><span>Hari</span></div>
  <div><b id="snH">00</b><span>Jam</span></div>
  <div><b id="snM">00</b><span>Menit</span></div>
  <div><b id="snS">00</b><span>Detik</span></div>
</div>
<style>
.sn-count{display:flex;gap:12px;justify-content:center;padding:26px;font-family:system-ui,sans-serif}
.sn-count div{min-width:74px;padding:14px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.1);
background:rgba(255,255,255,.05);text-align:center;color:#fff}
.sn-count b{display:block;font-size:1.5rem}
.sn-count span{font-size:.68rem;color:#9aabc2;text-transform:uppercase;letter-spacing:.08em}
</style>
<script>
(function(){
  var el=document.querySelector('.sn-count'); if(!el) return;
  var target=new Date(el.dataset.target).getTime();
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var d=Math.max(0,target-Date.now());
    document.getElementById('snD').textContent=pad(Math.floor(d/86400000));
    document.getElementById('snH').textContent=pad(Math.floor(d/3600000)%24);
    document.getElementById('snM').textContent=pad(Math.floor(d/60000)%60);
    document.getElementById('snS').textContent=pad(Math.floor(d/1000)%60);
  }
  tick(); setInterval(tick,1000);
})();
</script>`
    },
    {
      id: 'testi', title: 'Kartu Testimoni', cat: 'Konten', slot: 'end',
      desc: 'Tiga kartu ulasan pelanggan dengan bintang dan avatar inisial.',
      code: `<!-- Testimoni -->
<section class="sn-testi">
  <h2>Kata Mereka</h2>
  <div class="sn-testi-grid">
    <blockquote><div class="sn-stars">★★★★★</div><p>"Hasilnya rapi dan cepat. Prosesnya sangat menyenangkan."</p>
      <footer><span>R</span><div><b>Rina P.</b><small>Pemilik Bisnis</small></div></footer></blockquote>
    <blockquote><div class="sn-stars">★★★★★</div><p>"Tidak perlu paham coding, semua diurus dengan baik."</p>
      <footer><span>B</span><div><b>Bagas S.</b><small>Freelancer</small></div></footer></blockquote>
    <blockquote><div class="sn-stars">★★★★★</div><p>"Tampilannya modern dan klien saya langsung suka."</p>
      <footer><span>D</span><div><b>Dewi A.</b><small>Marketing</small></div></footer></blockquote>
  </div>
</section>
<style>
.sn-testi{padding:60px 20px;font-family:system-ui,sans-serif;background:#070b12;text-align:center}
.sn-testi h2{color:#fff;font-size:1.9rem}
.sn-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1000px;margin:26px auto 0}
.sn-testi blockquote{margin:0;text-align:left;padding:22px;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#e9eff8}
.sn-stars{color:#fbbf24;letter-spacing:2px;margin-bottom:10px;font-size:.85rem}
.sn-testi p{color:#c3d0e0;font-size:.88rem;line-height:1.7}
.sn-testi footer{display:flex;align-items:center;gap:10px;margin-top:14px}
.sn-testi footer span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#2dd4bf,#6366f1);color:#04121b;font-weight:800}
.sn-testi footer b{display:block;font-size:.83rem}
.sn-testi footer small{color:#9aabc2;font-size:.72rem}
@media(max-width:760px){.sn-testi-grid{grid-template-columns:1fr}}
</style>`
    }
  ];

  function snippetsPage() {
    const cats = ['Semua'].concat(SNIPPETS.map(function (s) { return s.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    let activeCat = 'Semua';
    const html = '<div class="page-head"><div><h1>Cuplikan Kode</h1><p class="muted">' + SNIPPETS.length +
      ' komponen siap tempel. Salin atau sisipkan langsung ke proyek Anda.</p></div><a class="btn ghost" href="#/studio">' + icon('code', 16) + ' Buka Studio</a></div>' +
      '<div class="filter-row" id="snipCats">' + cats.map(function (c, i) {
        return '<button class="chip-btn' + (i === 0 ? ' on' : '') + '" data-cat="' + util.esc(c) + '">' + util.esc(c) + '</button>';
      }).join('') + '</div>' +
      '<div class="snippet-grid" id="snippetGrid">' + SNIPPETS.map(snippetCard).join('') + '</div>';

    return {
      html: html,
      mount: function (root) {
        $$('#snipCats button', root).forEach(function (b) {
          b.addEventListener('click', function () {
            activeCat = b.getAttribute('data-cat');
            $$('#snipCats button', root).forEach(function (x) { x.classList.toggle('on', x === b); });
            $$('.snippet-card', root).forEach(function (c) {
              c.style.display = activeCat === 'Semua' || c.getAttribute('data-cat') === activeCat ? '' : 'none';
            });
          });
        });
        $$('[data-sn]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            const s = SNIPPETS.find(function (x) { return x.id === b.getAttribute('data-id'); });
            if (!s) return;
            if (b.getAttribute('data-sn') === 'copy') util.copy(s.code);
            else insertSnippet(s);
          });
        });
      }
    };
  }

  function snippetCard(s) {
    return '<article class="snippet-card" data-cat="' + util.esc(s.cat) + '">' +
      '<div class="snippet-head"><span class="tag">' + util.esc(s.cat) + '</span><h3>' + util.esc(s.title) + '</h3>' +
      '<p class="muted small">' + util.esc(s.desc) + '</p></div>' +
      '<pre class="snippet-code">' + util.esc(s.code) + '</pre>' +
      '<div class="snippet-actions">' +
      '<button class="btn sm ghost" data-sn="copy" data-id="' + s.id + '">' + icon('copy', 15) + ' Salin</button>' +
      '<button class="btn sm primary" data-sn="insert" data-id="' + s.id + '">' + icon('plus', 15) + ' Sisipkan</button>' +
      '</div></article>';
  }

  function insertSnippet(s) {
    const projects = db.myProjects();
    if (!projects.length) {
      ui.toast('Buat proyek dulu, lalu sisipkan cuplikan.', 'info');
      location.hash = '#/home';
      return;
    }
    ui.modal({
      title: 'Sisipkan "' + s.title + '"',
      body: '<p class="modal-text">Cuplikan akan ditambahkan ke <b>index.html</b> proyek yang dipilih.</p>' +
        '<label class="field full"><span>Pilih proyek</span><select id="insProject" class="input">' + A.app.projectOptions(projects[0].id) + '</select></label>',
      actions: [
        { label: 'Batal', variant: 'ghost' },
        {
          label: 'Sisipkan', variant: 'primary', onClick: function (wrap) {
            const p = db.getProject(wrap.querySelector('#insProject').value);
            if (!p) return;
            let html = p.files['index.html'] || '';
            if (s.slot === 'top') {
              if (/<body[^>]*>/i.test(html)) html = html.replace(/<body([^>]*)>/i, '<body$1>\n' + s.code + '\n');
              else html = s.code + '\n' + html;
            } else {
              if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, s.code + '\n</body>');
              else html += '\n' + s.code;
            }
            p.files['index.html'] = html;
            db.saveProject(p);
            db.log('snippet', s.title + ' → ' + p.title);
            ui.toast('Cuplikan disisipkan ke "' + p.title + '"', 'success');
            A.app.openStudio(p.id);
          }
        }
      ]
    });
  }

  /* ============================================================
     6. Alat bantu
     ============================================================ */
  function toolsPage() {
    const html = '<div class="page-head"><div><h1>Alat Bantu</h1><p class="muted">Enam utilitas cepat untuk pekerjaan sehari-hari. Semua diproses lokal.</p></div></div>' +
      '<div class="tools-grid">' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('code', 18) + ' Minify HTML/CSS/JS</h3></div>' +
      '<textarea id="minIn" class="input mono" rows="5" placeholder="Tempel kode di sini…"></textarea>' +
      '<div class="form-actions"><button class="btn sm primary" id="minRun">Minify</button><button class="btn sm ghost" data-copy="minOut">Salin</button></div>' +
      '<pre class="code-out" id="minOut" hidden></pre>' +
      '<div class="tool-note">Menghapus komentar &amp; spasi berlebih. Periksa hasilnya sebelum dipakai.</div></div>' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('key', 18) + ' Base64 Encode / Decode</h3></div>' +
      '<textarea id="b64In" class="input mono" rows="5" placeholder="Teks atau Base64…"></textarea>' +
      '<div class="form-actions"><button class="btn sm primary" id="b64Enc">Encode</button><button class="btn sm ghost" id="b64Dec">Decode</button><button class="btn sm ghost" data-copy="b64Out">Salin</button></div>' +
      '<pre class="code-out" id="b64Out" hidden></pre></div>' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('snippet', 18) + ' Huruf &amp; Slug</h3></div>' +
      '<input id="caseIn" class="input" placeholder="Judul atau kalimat…">' +
      '<div class="form-actions wrap"><button class="btn sm ghost" data-case="upper">HURUF BESAR</button><button class="btn sm ghost" data-case="lower">huruf kecil</button>' +
      '<button class="btn sm ghost" data-case="title">Huruf Kapital</button><button class="btn sm primary" data-case="slug">slug-url</button></div>' +
      '<pre class="code-out" id="caseOut" hidden></pre></div>' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('palette', 18) + ' Konversi Warna</h3></div>' +
      '<input id="colIn" class="input mono" placeholder="#2dd4bf atau rgb(45,212,191)">' +
      '<div class="form-actions"><button class="btn sm primary" id="colRun">Konversi</button></div>' +
      '<div id="colOut" class="color-conv" hidden></div></div>' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('lock', 18) + ' Generator Password</h3></div>' +
      '<label class="field"><span>Panjang: <b id="pwLenV">18</b></span><input id="pwLen" type="range" min="8" max="48" value="18"></label>' +
      '<div class="check-row"><label><input type="checkbox" id="pwUpper" checked> A–Z</label><label><input type="checkbox" id="pwNum" checked> 0–9</label>' +
      '<label><input type="checkbox" id="pwSym" checked> Simbol</label></div>' +
      '<div class="form-actions"><button class="btn sm primary" id="pwRun">Buat password</button><button class="btn sm ghost" data-copy="pwOut">Salin</button></div>' +
      '<pre class="code-out" id="pwOut" hidden></pre></div>' +

      '<div class="panel tool-card"><div class="panel-head"><h3>' + icon('sparkles', 18) + ' Markdown → HTML</h3></div>' +
      '<textarea id="mdIn" class="input mono" rows="5" placeholder="# Judul&#10;&#10;**tebal** dan *miring*&#10;&#10;- item satu&#10;- item dua"></textarea>' +
      '<div class="form-actions"><button class="btn sm primary" id="mdRun">Konversi</button><button class="btn sm ghost" data-copy="mdOut">Salin</button></div>' +
      '<pre class="code-out" id="mdOut" hidden></pre></div>' +

      '</div>';

    return {
      html: html,
      mount: function (root) {
        // copy generik
        $$('[data-copy]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            const el = document.getElementById(b.getAttribute('data-copy'));
            if (!el || el.hidden) return ui.toast('Belum ada hasil untuk disalin.', 'info');
            util.copy(b.getAttribute('data-copy') === 'mdOut' ? el.innerHTML : el.textContent);
          });
        });
        function out(id, val) {
          const el = document.getElementById(id);
          el.hidden = false;
          el.textContent = val;
        }
        function outHtml(id, val) {
          const el = document.getElementById(id);
          el.hidden = false;
          el.innerHTML = val;
        }

        $('#minRun', root).addEventListener('click', function () {
          let s = $('#minIn', root).value;
          if (!s.trim()) return ui.toast('Tempel kode dulu.', 'info');
          s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
            .replace(/\n\s*\n/g, '\n')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
          out('minOut', s);
          ui.toast('Kode diperkecil: ' + util.bytes(new Blob([s]).size), 'success');
        });

        $('#b64Enc', root).addEventListener('click', function () {
          try { out('b64Out', btoa(unescape(encodeURIComponent($('#b64In', root).value)))); }
          catch (e) { ui.toast('Gagal encode.', 'error'); }
        });
        $('#b64Dec', root).addEventListener('click', function () {
          try { out('b64Out', decodeURIComponent(escape(atob($('#b64In', root).value.trim())))); }
          catch (e) { ui.toast('Base64 tidak valid.', 'error'); }
        });

        $$('[data-case]', root).forEach(function (b) {
          b.addEventListener('click', function () {
            const v = $('#caseIn', root).value;
            const act = b.getAttribute('data-case');
            let r = v;
            if (act === 'upper') r = v.toUpperCase();
            if (act === 'lower') r = v.toLowerCase();
            if (act === 'title') r = v.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
            if (act === 'slug') r = util.slug(v);
            out('caseOut', r);
          });
        });

        $('#colRun', root).addEventListener('click', function () {
          const raw = $('#colIn', root).value.trim();
          let hex = '';
          if (/^#?[0-9a-f]{3,6}$/i.test(raw)) {
            hex = raw.startsWith('#') ? raw : '#' + raw;
          } else {
            const m = raw.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
            if (m) hex = '#' + [m[1], m[2], m[3]].map(function (n) { return Number(n).toString(16).padStart(2, '0'); }).join('');
          }
          if (!hex) return ui.toast('Format tidak dikenali. Gunakan hex atau rgb().', 'error');
          if (hex.length === 4) hex = '#' + hex.slice(1).split('').map(function (c) { return c + c; }).join('');
          const hsl = hexToHsl(hex);
          const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
          const box = $('#colOut', root);
          box.hidden = false;
          box.innerHTML = '<div class="col-preview" style="background:' + hex + '"></div>' +
            '<div class="kv"><span>HEX</span><b class="mono">' + hex.toLowerCase() + '</b></div>' +
            '<div class="kv"><span>RGB</span><b class="mono">rgb(' + r + ', ' + g + ', ' + b + ')</b></div>' +
            '<div class="kv"><span>HSL</span><b class="mono">hsl(' + Math.round(hsl.h) + ', ' + Math.round(hsl.s) + '%, ' + Math.round(hsl.l) + '%)</b></div>';
          box.querySelectorAll('.kv').forEach(function (kv) {
            kv.addEventListener('click', function () { util.copy(kv.querySelector('b').textContent); });
          });
        });

        const len = $('#pwLen', root);
        len.addEventListener('input', function () { $('#pwLenV', root).textContent = len.value; });
        $('#pwRun', root).addEventListener('click', function () {
          const n = Number(len.value);
          let chars = 'abcdefghijklmnopqrstuvwxyz';
          if ($('#pwUpper', root).checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          if ($('#pwNum', root).checked) chars += '0123456789';
          if ($('#pwSym', root).checked) chars += '!@#$%^&*()-_=+[]{};:,.?';
          const arr = new Uint32Array(n);
          (window.crypto || {}).getRandomValues ? crypto.getRandomValues(arr) : arr.forEach(function (_, i) { arr[i] = Math.random() * 4294967295; });
          out('pwOut', Array.from(arr).map(function (x) { return chars[x % chars.length]; }).join(''));
        });

        $('#mdRun', root).addEventListener('click', function () {
          const md = $('#mdIn', root).value;
          function inline(s) {
            return util.esc(s)
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
          }
          const outLines = [];
          let para = [], inList = false;
          function flushPara() {
            if (para.length) { outLines.push('<p>' + para.join('<br>') + '</p>'); para = []; }
          }
          function closeList() {
            if (inList) { outLines.push('</ul>'); inList = false; }
          }
          String(md).replace(/\r\n/g, '\n').split('\n').forEach(function (line) {
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            const li = line.match(/^\s*[-*]\s+(.*)$/);
            if (h) {
              flushPara(); closeList();
              outLines.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>');
            } else if (li) {
              flushPara();
              if (!inList) { outLines.push('<ul>'); inList = true; }
              outLines.push('<li>' + inline(li[1]) + '</li>');
            } else if (!line.trim()) {
              flushPara(); closeList();
            } else {
              closeList(); para.push(inline(line));
            }
          });
          flushPara(); closeList();
          outHtml('mdOut', outLines.join('\n'));
        });
      }
    };
  }

  /* ============================================================
     7. Pengaturan pengguna
     ============================================================ */
  function settingsPage() {
    const s = db.settings();
    const me = A.auth.current();
    const providers = A.ai.providers;
    const html = '<div class="page-head"><div><h1>Pengaturan</h1><p class="muted">Pilih AI, atur tampilan, kelola akun dan data Anda.</p></div></div>' +

      '<div class="panel"><div class="panel-head"><h3>' + icon('zap', 18) + ' Penyedia AI</h3>' +
      '<span class="tag ' + (s.provider === 'pollinations' ? 'ok' : '') + '">' + (s.provider === 'pollinations' ? 'Gratis tanpa key' : 'butuh API key') + '</span></div>' +
      '<div class="provider-grid">' + providers.map(function (p) {
        return '<label class="provider-card' + (s.provider === p.id ? ' on' : '') + '"><input type="radio" name="aiProvider" value="' + p.id + '"' + (s.provider === p.id ? ' checked' : '') + '>' +
          '<div class="provider-top"><b>' + util.esc(p.name) + '</b>' + (p.needsKey ? '<span class="tag warn">key</span>' : '<span class="tag ok">gratis</span>') + '</div>' +
          '<small>' + util.esc(p.hint) + '</small></label>';
      }).join('') + '</div>' +
      '<div class="form-grid mt-1">' +
      '<label class="field"><span>Model</span><input id="setModel" class="input" value="' + util.esc(s.model) + '"></label>' +
      '<label class="field"><span>Temperature (' + s.temperature + ')</span><input id="setTemp" type="range" class="input" min="0" max="1" step="0.05" value="' + s.temperature + '"></label>' +
      '<label class="field"><span>Bahasa hasil</span><select id="setLang" class="input"><option value="id"' + (s.language === 'id' ? ' selected' : '') + '>Indonesia</option><option value="en"' + (s.language === 'en' ? ' selected' : '') + '>English</option></select></label>' +
      '</div>' +
      '<div class="form-grid mt-1">' +
      settingsKey('Gemini API key', 'setGemini', s.keys.gemini, 'AIza…', 'aistudio.google.com/apikey') +
      settingsKey('Groq API key', 'setGroq', s.keys.groq, 'gsk_…', 'console.groq.com/keys') +
      settingsKey('OpenRouter API key', 'setOpenrouter', s.keys.openrouter, 'sk-or-…', 'openrouter.ai/keys') +
      settingsKey('Custom API key', 'setCustom', s.keys.custom, 'sk-…', 'endpoint OpenAI-compatible') +
      settingsKey('9Router API key', 'setNinerouter', s.keys.ninerouter, 'opsional / dari dashboard 9Router', 'Gateway 9Router · http://localhost:20128/v1') +
      '<label class="field"><span>Custom base URL</span><input id="setBase" class="input" value="' + util.esc(s.customBase) + '"></label>' +
      '<label class="field"><span>Custom model</span><input id="setCustomModel" class="input" value="' + util.esc(s.customModel) + '"></label>' +
      '</div>' +
      '<div class="form-actions"><button class="btn primary" id="saveAI">' + icon('save', 16) + ' Simpan</button>' +
      '<button class="btn ghost" id="testAI">' + icon('zap', 16) + ' Tes koneksi</button>' +
      '<span class="muted small">Kunci disimpan hanya di browser ini.</span></div>' +
      '<div id="aiMsg" class="form-msg" hidden></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('palette', 18) + ' Tampilan</h3></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span>Tema</span><select id="setTheme" class="input"><option value="dark"' + (s.theme === 'dark' ? ' selected' : '') + '>Gelap</option><option value="light"' + (s.theme === 'light' ? ' selected' : '') + '>Terang</option></select></label>' +
      '<label class="field"><span>Warna aksen</span><input id="setAccent" type="color" class="input color" value="' + util.esc(s.accent) + '"></label>' +
      '</div><div class="form-actions"><button class="btn primary" id="saveLook">' + icon('save', 16) + ' Terapkan tampilan</button></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('rocket', 18) + ' Token Hosting (opsional)</h3></div>' +
      '<p class="muted small">Diisi sekali agar tidak perlu memasukkan token setiap kali deploy.</p>' +
      '<div class="form-grid">' +
      settingsKey('Netlify token', 'setNetlify', s.keys.netlify, 'nfp_…', 'app.netlify.com → Personal access tokens') +
      settingsKey('Vercel token', 'setVercel', s.keys.vercel, 'token…', 'vercel.com/account/tokens') +
      settingsKey('Cloudflare token', 'setCf', s.keys.cloudflare, 'token…', 'dash.cloudflare.com/profile/api-tokens') +
      settingsKey('Cloudflare Account ID', 'setCfAcc', s.keys.cloudflareAccount, 'hex 32 karakter', 'dashboard Cloudflare') +
      '</div><div class="form-actions"><button class="btn primary" id="saveHost">' + icon('save', 16) + ' Simpan token</button></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('user', 18) + ' Akun</h3></div>' +
      (me ? '<div class="account-card"><span class="account-avatar">' + (me.avatar ? '<img src="' + util.esc(me.avatar) + '" alt="Foto profil">' : util.esc((me.name || me.email).charAt(0).toUpperCase())) + '</span>' +
        '<div><b>' + util.esc(me.name) + '</b><small>' + util.esc(me.email) + '</small>' +
        '<span class="tag ' + (me.role === 'admin' ? 'ok' : '') + '">' + (me.role === 'admin' ? 'Administrator' : 'Pengguna') + '</span></div></div>' +
        '<div class="form-actions"><button class="btn ghost" id="logoutBtn">' + icon('logout', 16) + ' Keluar</button></div>'
        : '<p class="muted">Anda menggunakan mode tamu. Masuk untuk menyimpan identitas dan mengakses fitur akun.</p>' +
        '<div class="form-actions"><button class="btn primary" id="loginBtn">' + icon('login', 16) + ' Masuk / Daftar</button></div>') +
      '</div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('database', 18) + ' Data &amp; Cadangan</h3></div>' +
      '<div class="form-actions wrap">' +
      '<button class="btn ghost" id="exportBtn">' + icon('download', 16) + ' Ekspor semua data (JSON)</button>' +
      '<button class="btn ghost" id="importBtn">' + icon('upload', 16) + ' Impor data</button>' +
      '<button class="btn ghost" id="clearProj">' + icon('trash', 16) + ' Hapus semua proyek</button>' +
      '<button class="btn danger" id="wipeBtn">' + icon('shield', 16) + ' Reset aplikasi</button>' +
      '</div><p class="muted small">Data tidak dikirim ke server mana pun. Ekspor berkas JSON untuk pindah perangkat.</p>' +
      '<div id="dataMsg" class="form-msg" hidden></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('bell', 18) + ' Suara &amp; Notifikasi</h3></div>' +
      '<div class="form-grid">' +
      '<label class="field"><span>Aktifkan suara</span><select id="setSoundOn" class="input">' +
      '<option value="1"' + ((s.sound && s.sound.enabled !== false) ? ' selected' : '') + '>Ya</option>' +
      '<option value="0"' + ((s.sound && s.sound.enabled === false) ? ' selected' : '') + '>Tidak</option>' +
      '</select></label>' +
      '<label class="field"><span>Preset nada</span><select id="setSoundPreset" class="input">' +
      '<option value="chime"' + ((s.sound && s.sound.preset === 'chime') ? ' selected' : '') + '>Chime (3 nada)</option>' +
      '<option value="bip"' + ((s.sound && s.sound.preset === 'bip') ? ' selected' : '') + '>Bip</option>' +
      '<option value="ding"' + ((s.sound && s.sound.preset === 'ding') ? ' selected' : '') + '>Ding</option>' +
      '<option value="none"' + ((s.sound && s.sound.preset === 'none') ? ' selected' : '') + '>Tanpa (hanya custom)</option>' +
      '</select></label>' +
      '<label class="field"><span>Volume</span><input id="setSoundVol" type="range" class="input" min="0" max="1" step="0.05" value="' + (s.sound ? s.sound.volume : 0.6) + '"></label>' +
      '<label class="field"><span>Nada custom (opsional)</span><input id="setSoundFile" type="file" accept="audio/*" class="input"></label>' +
      '</div>' +
      (s.sound && s.sound.custom ? '<p class="muted small mt-1">Nada custom aktif: <span class="mono">tersimpan</span></p>' : '') +
      '<div class="form-actions"><button class="btn primary" id="saveSound">' + icon('save', 16) + ' Simpan</button>' +
      '<button class="btn ghost" id="testSound">' + icon('zap', 16) + ' Pratinjau</button>' +
      (s.sound && s.sound.custom ? '<button class="btn ghost" id="clearSound">' + icon('trash', 15) + ' Hapus custom</button>' : '') +
      '</div>' +
      '<p class="muted small">Nada custom disimpan di perangkat (data URL). Pratinjau memakai pengaturan saat ini.</p>' +
      '<div id="soundMsg" class="form-msg" hidden></div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('help', 18) + ' Tentang</h3></div>' +
      '<div class="kv"><span>Aplikasi</span><b>' + util.esc(s.appName) + ' v' + util.esc(s.version) + '</b></div>' +
      '<div class="kv"><span>Penyimpanan</span><b>' + util.bytes(new Blob([JSON.stringify(db.exportAll())]).size) + '</b></div>' +
      '<div class="kv"><span>Mode</span><b>' + (location.protocol.startsWith('http') ? 'Server lokal' : 'Berkas lokal (file://)') + '</b></div>' +
      '<p class="muted small mt-1">Semua data bersifat lokal. Menghapus data browser akan menghapus proyek dan akun.</p></div>';

    return {
      html: html,
      mount: function (root) {
        function msg(text, type) {
          const el = root.querySelector('#aiMsg');
          el.hidden = false;
          el.className = 'form-msg ' + (type || 'success');
          el.textContent = text;
        }
        $$('input[name="aiProvider"]', root).forEach(function (r) {
          r.addEventListener('change', function () {
            $$('.provider-card', root).forEach(function (c) { c.classList.toggle('on', !!c.querySelector('input:checked')); });
            const p = A.ai.providers.find(function (x) { return x.id === r.value; });
            const mi = root.querySelector('#setModel');
            if (p && mi && p.model) mi.value = p.model;
          });
        });
        const temp = root.querySelector('#setTemp');
        if (temp) temp.addEventListener('input', function () {
          temp.parentElement.querySelector('span').textContent = 'Temperature (' + temp.value + ')';
        });

        function aiFormConfig() {
          const chosen = root.querySelector('input[name="aiProvider"]:checked');
          return Object.assign({}, s, {
            provider: chosen ? chosen.value : s.provider,
            model: root.querySelector('#setModel').value.trim(),
            temperature: Number(root.querySelector('#setTemp').value),
            language: root.querySelector('#setLang').value,
            keys: Object.assign({}, s.keys, {
              gemini: root.querySelector('#setGemini').value.trim(),
              groq: root.querySelector('#setGroq').value.trim(),
              openrouter: root.querySelector('#setOpenrouter').value.trim(),
              custom: root.querySelector('#setCustom').value.trim(),
              ninerouter: root.querySelector('#setNinerouter').value.trim()
            }),
            customBase: root.querySelector('#setBase').value.trim(),
            customModel: root.querySelector('#setCustomModel').value.trim()
          });
        }

        root.querySelector('#saveAI').addEventListener('click', function () {
          const cfg = aiFormConfig();
          db.saveSettings({
            provider: cfg.provider,
            model: cfg.model,
            temperature: cfg.temperature,
            language: cfg.language,
            keys: {
              gemini: cfg.keys.gemini,
              groq: cfg.keys.groq,
              openrouter: cfg.keys.openrouter,
              custom: cfg.keys.custom,
              ninerouter: cfg.keys.ninerouter
            },
            customBase: cfg.customBase,
            customModel: cfg.customModel
          });
          A.app.applySettings();
          msg('Pengaturan AI disimpan.', 'success');
          db.log('settings', 'simpan konfigurasi AI');
          ui.toast('Pengaturan disimpan', 'success');
        });
        root.querySelector('#testAI').addEventListener('click', async function () {
          const b = this;
          b.disabled = true; b.textContent = 'Menguji…';
          try {
            const res = await A.ai.test(aiFormConfig());
            msg(res, 'success');
          } catch (e) { msg('Gagal: ' + e.message, 'error'); }
          finally { b.disabled = false; b.innerHTML = icon('zap', 16) + ' Tes koneksi'; }
        });

        root.querySelector('#saveLook').addEventListener('click', function () {
          db.saveSettings({ theme: root.querySelector('#setTheme').value, accent: root.querySelector('#setAccent').value });
          A.app.applySettings();
          ui.toast('Tampilan diterapkan', 'success');
        });

        root.querySelector('#saveHost').addEventListener('click', function () {
          db.saveSettings({ keys: {
            netlify: root.querySelector('#setNetlify').value.trim(),
            vercel: root.querySelector('#setVercel').value.trim(),
            cloudflare: root.querySelector('#setCf').value.trim(),
            cloudflareAccount: root.querySelector('#setCfAcc').value.trim()
          } });
          ui.toast('Token hosting disimpan', 'success');
        });

        const loginBtn = root.querySelector('#loginBtn');
        if (loginBtn) loginBtn.addEventListener('click', function () { A.app.openAccount(); });
        const logoutBtn = root.querySelector('#logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', function () {
          A.auth.logout();
          ui.toast('Anda telah keluar', 'info');
          A.app.applySettings();
          A.app.render();
        });

        const dataMsg = root.querySelector('#dataMsg');
        function dm(t, type) { dataMsg.hidden = false; dataMsg.className = 'form-msg ' + type; dataMsg.textContent = t; }

        root.querySelector('#exportBtn').addEventListener('click', function () {
          const name = 'aethel-data-' + new Date().toISOString().slice(0, 10) + '.json';
          util.download(new Blob([JSON.stringify(db.exportAll(), null, 2)], { type: 'application/json' }), name);
          dm('Data diekspor ke folder Download.', 'success');
        });
        root.querySelector('#importBtn').addEventListener('click', function () {
          const input = document.createElement('input');
          input.type = 'file'; input.accept = '.json,application/json';
          input.onchange = async function () {
            try {
              const data = JSON.parse(await util.fileToText(input.files[0]));
              const ok = await ui.confirm('Impor data ini? Data saat ini akan diganti.', { danger: true, ok: 'Impor' });
              if (!ok) return;
              db.importAll(data);
              dm('Data berhasil diimpor. Memuat ulang…', 'success');
              setTimeout(function () { location.reload(); }, 900);
            } catch (e) { dm('Gagal: ' + e.message, 'error'); }
          };
          input.click();
        });
        root.querySelector('#clearProj').addEventListener('click', async function () {
          const ok = await ui.confirm('Hapus semua proyek? Tindakan ini permanen.', { danger: true, ok: 'Hapus semua' });
          if (!ok) return;
          localStorage.setItem(A.K.projects, '[]');
          dm('Semua proyek dihapus.', 'success');
          db.log('settings', 'hapus semua proyek');
          A.app.render();
        });
        root.querySelector('#wipeBtn').addEventListener('click', async function () {
          const ok = await ui.confirm('Reset seluruh aplikasi? Semua proyek, akun, dan pengaturan akan hilang.', { danger: true, ok: 'Reset' });
          if (!ok) return;
          Object.keys(localStorage).filter(function (k) { return k.indexOf(A.NS) === 0; }).forEach(function (k) { localStorage.removeItem(k); });
          location.reload();
        });

        // Suara & notifikasi
        let pendingSound = null;
        const soundFile = root.querySelector('#setSoundFile');
        if (soundFile) soundFile.addEventListener('change', function (e) {
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          if (!String(f.type || '').startsWith('audio/')) { ui.toast('Pilih berkas audio.', 'error'); return; }
          if (f.size > 4 * 1024 * 1024) { ui.toast('Maksimal 4 MB.', 'error'); return; }
          A.util.fileToDataUrl(f).then(function (url) { pendingSound = url; ui.toast('Nada custom siap disimpan.', 'success'); }).catch(function () { ui.toast('Gagal membaca audio.', 'error'); });
        });
        const saveSound = root.querySelector('#saveSound');
        if (saveSound) saveSound.addEventListener('click', function () {
          const cfg = db.settings();
          const snd = cfg.sound || { enabled: true, preset: 'chime', custom: '', volume: 0.6 };
          snd.enabled = root.querySelector('#setSoundOn').value === '1';
          snd.preset = root.querySelector('#setSoundPreset').value;
          snd.volume = Number(root.querySelector('#setSoundVol').value);
          if (pendingSound) snd.custom = pendingSound;
          db.saveSettings({ sound: snd });
          pendingSound = null;
          const m = root.querySelector('#soundMsg');
          if (m) { m.hidden = false; m.className = 'form-msg success'; m.textContent = 'Pengaturan suara disimpan.'; }
          ui.toast('Suara disimpan', 'success');
        });
        const testSound = root.querySelector('#testSound');
        if (testSound) testSound.addEventListener('click', function () {
          const cfg = Object.assign({}, db.settings(), {
            sound: {
              enabled: true,
              preset: root.querySelector('#setSoundPreset').value,
              custom: pendingSound || (db.settings().sound && db.settings().sound.custom) || '',
              volume: Number(root.querySelector('#setSoundVol').value)
            }
          });
          // preview via temporary settings
          const prev = db.settings().sound;
          db.saveSettings({ sound: cfg.sound });
          A.app.playSound('success');
          setTimeout(function () { db.saveSettings({ sound: prev }); }, 100);
        });
        const clearSound = root.querySelector('#clearSound');
        if (clearSound) clearSound.addEventListener('click', function () {
          const cfg = db.settings();
          const snd = cfg.sound || {};
          snd.custom = '';
          pendingSound = null;
          db.saveSettings({ sound: snd });
          ui.toast('Nada custom dihapus', 'info');
          // re-render settings
          location.hash = '#/settings';
        });
      }
    };
  }

  function settingsKey(label, id, value, ph, hint) {
    return '<label class="field"><span>' + util.esc(label) + '</span><div class="input-with-btn">' +
      '<input id="' + id + '" class="input" type="password" value="' + util.esc(value || '') + '" placeholder="' + util.esc(ph || '') + '" autocomplete="off">' +
      '<button type="button" class="icon-btn sm reveal-key" data-for="' + id + '" title="Lihat">' + icon('eye', 15) + '</button>' +
      '</div><small class="field-hint">' + util.esc(hint || '') + '</small></label>';
  }

  /* ============================================================
     7b. File & Kode — baca file dari HP & perbaiki dengan AI
     ============================================================ */
  function codefixPage() {
    const files = [];
    let current = null;
    let fixed = '';

    const html = '<div class="page-head"><div><h1>File &amp; Kode</h1><p class="muted">Baca file HTML/CSS/JS dari HP, minta AI memperbaiki, lalu unduh hasilnya ke folder Download.</p></div></div>' +
      '<div class="panel">' +
      '<div id="cfEmpty" class="empty-state">' +
      '<div class="empty-ic">' + icon('code', 38) + '</div>' +
      '<h2>Belum ada file</h2>' +
      '<p>Pilih file website (HTML/CSS/JS) atau folder proyek dari penyimpanan HP Anda.</p>' +
      '<div class="empty-actions">' +
      '<button class="btn primary" id="cfPickBtn">' + icon('folder', 16) + ' Pilih file</button>' +
      '<button class="btn ghost" id="cfDirBtn">' + icon('folder', 16) + ' Pilih folder</button>' +
      '</div>' +
      '<p class="muted small mt-1">Tip: pilih <span class="mono">index.html</span>, <span class="mono">style.css</span>, <span class="mono">script.js</span> atau folder proyek lengkap.</p>' +
      '</div>' +
      '<input type="file" id="cfInput" accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.txt,.php,.py,.svg,.md" multiple hidden>' +
      '<input type="file" id="cfDir" webkitdirectory directory multiple hidden>' +
      '<div id="cfList" class="cf-list" hidden></div>' +
      '<div id="cfEditorWrap" hidden>' +
      '<div class="form-grid">' +
      '<label class="field full"><span>File <span id="cfFileName" class="mono"></span></span>' +
      '<textarea id="cfCode" class="input code-area" spellcheck="false"></textarea>' +
      '</label>' +
      '</div>' +
      '<div class="form-actions" id="cfActions">' +
      '<button class="btn primary" id="cfFix">' + icon('zap', 16) + ' Perbaiki dengan AI</button>' +
      '<button class="btn ghost" id="cfCopy" disabled>' + icon('copy', 15) + ' Salin</button>' +
      '<button class="btn ghost" id="cfSave" disabled>' + icon('download', 15) + ' Unduh ke Download</button>' +
      '</div>' +
      '</div>' +
      '<div id="cfOut"></div>' +
      '</div>';

    return {
      html: html,
      mount: function (root) {
        const empty = root.querySelector('#cfEmpty');
        const list = root.querySelector('#cfList');
        const editorWrap = root.querySelector('#cfEditorWrap');
        const codeEl = root.querySelector('#cfCode');
        const actions = root.querySelector('#cfActions');
        const out = root.querySelector('#cfOut');
        const fileNameEl = root.querySelector('#cfFileName');

        function setCurrent(f) {
          current = f;
          fixed = '';
          fileNameEl.textContent = f.name;
          codeEl.value = f.code;
          if (empty) empty.hidden = true;
          if (list) list.hidden = false;
          if (editorWrap) editorWrap.hidden = false;
          if (actions) actions.hidden = false;
          if (out) out.innerHTML = '';
          const save = root.querySelector('#cfSave');
          const copy = root.querySelector('#cfCopy');
          if (save) save.disabled = !fixed;
          if (copy) copy.disabled = !fixed;
        }

        function renderList() {
          if (!files.length) {
            if (list) { list.hidden = true; list.innerHTML = ''; }
            if (editorWrap) editorWrap.hidden = true;
            if (actions) actions.hidden = true;
            return;
          }
          if (list) {
            list.innerHTML = files.map(function (f, i) {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = 'cf-item' + (current === f ? ' on' : '');
              b.dataset.i = i;
              const nm = document.createElement('span');
              nm.className = 'cf-name';
              nm.textContent = f.name;
              const bd = document.createElement('span');
              bd.className = 'badge';
              bd.textContent = f.code ? (f.code.length + ' B') : '0 B';
              b.appendChild(nm);
              b.appendChild(bd);
              b.addEventListener('click', function () { setCurrent(f); });
              return b;
            }).join('');
            list.querySelectorAll('.cf-item').forEach(function (b) {
              b.addEventListener('click', function () { setCurrent(files[Number(b.dataset.i)]); });
            });
          }
        }

        function attachFixResultHandlers() {
          const saveB = root.querySelector('#cfSaveFixed');
          if (saveB) saveB.addEventListener('click', function () {
            const fname = /\.css$/i.test(current.name) ? 'style.css' : /\.js$/i.test(current.name) ? 'script.js' : /\.html?$/i.test(current.name) ? 'index.html' : current.name;
            A.util.download(new Blob([fixed], { type: 'text/plain' }), 'aethel-fixed-' + fname);
            ui.toast('Diunduh: aethel-fixed-' + fname, 'success');
          });
          const copyB = root.querySelector('#cfCopyFixed');
          if (copyB) copyB.addEventListener('click', function () { A.util.copy(fixed); });
          const againB = root.querySelector('#cfFixAgain');
          if (againB) againB.addEventListener('click', async function () {
            const b2 = this;
            b2.disabled = true;
            b2.innerHTML = '<span class="spinner"></span> Memperbaiki…';
            try {
              const res2 = await A.ai.fixCode(fixed, current.name, A.db.settings());
              fixed = res2.code;
              showResult();
            } catch (e) { ui.toast('Perbaikan gagal: ' + (e.message || e), 'error'); }
            finally { b2.disabled = false; b2.innerHTML = icon('zap', 15) + ' Perbaiki lagi'; }
          });
          const closeB = root.querySelector('#cfCloseOut');
          if (closeB) closeB.addEventListener('click', function () { fixed = ''; if (out) out.innerHTML = ''; });
        }

        function showResult() {
          if (!current || !fixed) { if (out) out.innerHTML = ''; return; }
          if (!out) return;
          out.innerHTML = '<div class="field full"><span>Hasil perbaikan</span>' +
            '<textarea id="cfFixed" class="input code-area" readonly>' + util.esc(fixed) + '</textarea>' +
            '<small class="field-hint">File asli: ' + util.esc(current.name) + ' · Provider AI: ' + util.esc(A.ai.meta(A.db.settings().provider).name) + '</small></div>' +
            '<div class="form-actions">' +
            '<button class="btn primary" id="cfSaveFixed">' + icon('download', 15) + ' Unduh hasil</button>' +
            '<button class="btn ghost" id="cfCopyFixed">' + icon('copy', 15) + ' Salin</button>' +
            '<button class="btn ghost" id="cfFixAgain">' + icon('zap', 15) + ' Perbaiki lagi</button>' +
            '<button class="btn ghost" id="cfCloseOut">' + icon('x', 15) + ' Tutup</button>' +
            '</div>';
          attachFixResultHandlers();
          const save = root.querySelector('#cfSave');
          const copy = root.querySelector('#cfCopy');
          if (save) save.disabled = false;
          if (copy) copy.disabled = false;
        }

        root.querySelector('#cfPickBtn').addEventListener('click', function () { root.querySelector('#cfInput').click(); });
        root.querySelector('#cfDirBtn').addEventListener('click', function () { root.querySelector('#cfDir').click(); });

        function addFiles(arr) {
          const pending = Array.prototype.slice.call(arr || []);
          if (!pending.length) { ui.toast('Tidak ada file yang dipilih.', 'info'); return; }
          pending.forEach(function (f) {
            const name = f.webkitRelativePath || f.name;
            A.util.fileToText(f).then(function (code) {
              files.push({ name: name, code: code });
              setCurrent(files[files.length - 1]);
              renderList();
              ui.toast('Dimuat: ' + name, 'success');
            }).catch(function () { ui.toast('Gagal membaca: ' + (f.name || 'file'), 'error'); });
          });
        }
        root.querySelector('#cfInput').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
        root.querySelector('#cfDir').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
        if (codeEl) codeEl.addEventListener('input', function () { if (current) current.code = codeEl.value; });

        root.querySelector('#cfFix').addEventListener('click', async function () {
          if (!current) { ui.toast('Pilih file dulu.', 'info'); return; }
          const btn = this;
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span> Memperbaiki…';
          try {
            const res = await A.ai.fixCode(current.code, current.name, A.db.settings());
            fixed = res.code;
            showResult();
            ui.toast('Perbaikan selesai: ' + current.name, 'success');
          } catch (e) {
            ui.toast('Perbaiki gagal: ' + (e.message || e), 'error');
          } finally {
            btn.disabled = false;
            btn.innerHTML = icon('zap', 16) + ' Perbaiki dengan AI';
          }
        });

        root.querySelector('#cfCopy').addEventListener('click', function () { if (fixed) A.util.copy(fixed); });
        root.querySelector('#cfSave').addEventListener('click', function () {
          if (!current || !fixed) return;
          const fname = /\.css$/i.test(current.name) ? 'style.css' : /\.js$/i.test(current.name) ? 'script.js' : /\.html?$/i.test(current.name) ? 'index.html' : current.name;
          A.util.download(new Blob([fixed], { type: 'text/plain' }), 'aethel-fixed-' + fname);
        });
      }
    };
  }

  /* ============================================================
     8. Bantuan
     ============================================================ */
  function helpPage() {
    const html = '<div class="page-head"><div><h1>Bantuan &amp; Panduan</h1><p class="muted">Semua yang perlu Anda tahu untuk mulai membuat dan mempublikasikan website.</p></div></div>' +
      '<div class="help-hero"><h2>Mulai dalam 3 langkah</h2>' +
      '<div class="help-steps">' +
      '<div class="help-step"><span>1</span><b>Ketik prompt</b><p>Jelaskan jenis bisnis, nama, warna favorit, dan bagian yang diinginkan.</p></div>' +
      '<div class="help-step"><span>2</span><b>Sempurnakan</b><p>Buka Studio untuk mengubah teks, warna, atau kode. Pratinjau langsung.</p></div>' +
      '<div class="help-step"><span>3</span><b>Unduh / hosting</b><p>Klik ZIP — berkas masuk ke folder Download. Atau deploy langsung.</p></div>' +
      '</div></div>' +

      '<div class="grid-2 mt-2">' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('zap', 18) + ' Pilihan AI Gratis</h3></div>' +
      '<div class="table-wrap"><table class="table compact"><thead><tr><th>Penyedia</th><th>API key</th><th>Cocok untuk</th></tr></thead><tbody>' +
      '<tr><td><b>Pollinations</b></td><td><span class="tag ok">tanpa key</span></td><td>Langsung pakai, hasil bervariasi</td></tr>' +
      '<tr><td><b>Google Gemini</b></td><td><span class="tag warn">perlu key</span></td><td>Kualitas desain &amp; kode terbaik</td></tr>' +
      '<tr><td><b>Groq</b></td><td><span class="tag warn">perlu key</span></td><td>Paling cepat, gratis</td></tr>' +
      '<tr><td><b>OpenRouter</b></td><td><span class="tag warn">perlu key</span></td><td>Banyak model :free</td></tr>' +
      '<tr><td><b>Generator Offline</b></td><td><span class="tag ok">tanpa internet</span></td><td>Selalu berhasil, 12 template</td></tr>' +
      '</tbody></table></div>' +
      '<div class="form-actions"><a class="btn primary sm" href="#/settings">Atur AI sekarang</a></div></div>' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('download', 18) + ' Menyimpan ke folder Download</h3></div>' +
      '<ol class="help-list">' +
      '<li>Buka proyek di <b>Studio</b> atau beranda.</li>' +
      '<li>Tekan tombol <b>ZIP</b>. Berkas <code>nama-website.zip</code> diunduh.</li>' +
      '<li>Di Android, berkas masuk ke folder <code>Download</code> (browser bisa menanyakan lokasi).</li>' +
      '<li>Ekstrak ZIP, buka <code>index.html</code>, atau unggah ke hosting.</li>' +
      '</ol><p class="muted small">ZIP berisi index.html, CSS, JS, README, dan netlify.toml — siap dipakai.</p></div>' +
      '</div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('rocket', 18) + ' Panduan Hosting Gratis</h3></div>' +
      '<div class="help-cards">' +
      '<div class="help-card"><b>Netlify Drop</b><p>Paling mudah. Buka app.netlify.com/drop, tarik folder hasil ekstrak, selesai.</p><a href="https://app.netlify.com/drop" target="_blank" rel="noopener">Buka Netlify Drop →</a></div>' +
      '<div class="help-card"><b>Cloudflare Pages</b><p>Buat project Direct Upload, unggah ZIP. Subdomain .pages.dev langsung aktif.</p><a href="https://dash.cloudflare.com" target="_blank" rel="noopener">Buka Cloudflare →</a></div>' +
      '<div class="help-card"><b>Vercel</b><p>Import project atau unggah lewat dashboard. Cocok untuk HTML statis.</p><a href="https://vercel.com/new" target="_blank" rel="noopener">Buka Vercel →</a></div>' +
      '<div class="help-card"><b>GitHub Pages</b><p>Gratis selamanya. Unggah file ke repo, aktifkan Pages di Settings.</p><a href="https://pages.github.com" target="_blank" rel="noopener">Panduan GitHub Pages →</a></div>' +
      '</div></div>' +

      '<div class="panel mt-2"><div class="panel-head"><h3>' + icon('help', 18) + ' Pertanyaan Umum</h3></div>' +
      '<div class="faq-list">' + [
        ['Apakah aplikasi ini benar-benar gratis?', 'Ya. Aplikasi berjalan sepenuhnya di browser Anda. Penyedia AI yang dipakai (Pollinations/Gemini/Groq/OpenRouter) memiliki paket gratis. Tidak ada biaya dari AethelStudio.'],
        ['Apakah data saya dikirim ke server?', 'Tidak. Proyek, akun, dan pengaturan disimpan di localStorage perangkat. Hanya prompt yang dikirim ke penyedia AI yang Anda pilih.'],
        ['Kenapa hasil AI kadang memakai generator offline?', 'Jika AI gratis sedang limit, lambat, atau jawabannya bukan JSON valid, aplikasi otomatis membuat website dari template premium agar Anda tetap mendapat hasil.'],
        ['Bagaimana cara mendapat API key gratis?', 'Gemini: aistudio.google.com/apikey · Groq: console.groq.com/keys · OpenRouter: openrouter.ai/keys. Salin key ke Pengaturan → Penyedia AI.'],
        ['Bagaimana mengubah teks dan warna website?', 'Buka Studio, pilih file (index.html, style.css, script.js), edit langsung. Pratinjau diperbarui otomatis dan perubahan disimpan.'],
        ['Apakah ZIP bisa dipakai di hosting lain?', 'Bisa. Semua file statis standar. Unggah ke Netlify, Vercel, Cloudflare Pages, GitHub Pages, atau hosting shared biasa.'],
        ['Bagaimana mengakses panel admin?', 'Area admin sengaja disembunyikan dari menu. Pemilik aplikasi mengetahui gestur rahasianya. Jika Anda pemilik, gunakan akun admin yang sudah terdaftar.'],
        ['Apakah bisa dipasang seperti aplikasi (APK/PWA)?', 'Bisa. Buka aplikasi di Chrome, menu ⋮ → "Tambahkan ke layar utama". Aplikasi akan berjalan seperti app native tanpa Play Store.']
      ].map(function (f) {
        return '<details class="faq-item"><summary>' + util.esc(f[0]) + '<span>+</span></summary><p>' + util.esc(f[1]) + '</p></details>';
      }).join('') + '</div></div>' +

      '<div class="grid-2 mt-2">' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('code', 18) + ' Pintasan Keyboard</h3></div>' +
      '<div class="shortcut-list">' +
      '<div><kbd>Enter</kbd><span>Kirim prompt</span></div>' +
      '<div><kbd>Shift</kbd> + <kbd>Enter</kbd><span>Baris baru</span></div>' +
      '<div><kbd>Ctrl</kbd> + <kbd>S</kbd><span>Simpan di Studio</span></div>' +
      '<div><kbd>Esc</kbd><span>Tutup menu / dialog</span></div>' +
      '<div><kbd>/</kbd><span>Fokus ke kolom prompt</span></div>' +
      '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>' + icon('shield', 18) + ' Keamanan &amp; Privasi</h3></div>' +
      '<ul class="help-list">' +
      '<li>Akun disimpan lokal dengan hash password.</li>' +
      '<li>API key hanya tersimpan di browser ini — jangan pakai di komputer bersama.</li>' +
      '<li>Gunakan mode tamu jika tidak ingin membuat akun.</li>' +
      '<li>Ekspor JSON secara berkala sebagai cadangan.</li>' +
      '<li>Membersihkan data situs di browser akan menghapus semua data aplikasi.</li>' +
      '</ul></div></div>' +

      '<div class="help-footer">Dibuat dengan ❤️ untuk memudahkan siapa pun membuat website. ' +
      '<a href="#/home">Mulai berkarya →</a></div>';

    return { html: html, mount: function () {} };
  }

  window.Aethel.pages = {
    images: imagesPage,
    seo: seoPage,
    palette: palettePage,
    qr: qrPage,
    snippets: snippetsPage,
    tools: toolsPage,
    settings: settingsPage,
    help: helpPage,
    codefix: codefixPage
  };
})();
