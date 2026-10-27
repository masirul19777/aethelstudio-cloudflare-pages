/* ============================================================
   AethelStudio AI — ai.js
   Koneksi ke penyedia AI gratis + perakitan & parsing hasil.
   ============================================================ */
(function () {
  'use strict';
  const util = window.Aethel.util;

  const SYSTEM_PROMPT = [
    'Kamu adalah AethelStudio AI, seorang web designer & front-end engineer senior.',
    'Tugasmu: membuat website lengkap, indah, modern, responsif, dan SIAP PAKAI dari deskripsi pengguna.',
    '',
    'ATURAN OUTPUT (WAJIB):',
    '1. Balas HANYA dengan satu objek JSON valid. Tanpa penjelasan, tanpa markdown fence.',
    '2. Struktur JSON:',
    '{',
    '  "title": "Nama website",',
    '  "description": "Deskripsi singkat 1 kalimat",',
    '  "tags": ["kategori1","kategori2"],',
    '  "files": {',
    '    "index.html": "<!DOCTYPE html>...",',
    '    "style.css": "...",',
    '    "script.js": "..."',
    '  }',
    '}',
    '3. Wajib ada "index.html". Pisahkan CSS ke "style.css" dan JS ke "script.js" (kecuali sangat sedikit).',
    '4. Tautkan dengan <link rel="stylesheet" href="style.css"> dan <script src="script.js" defer></script>.',
    '5. Jangan memakai framework/CDN eksternal (kecuali Google Fonts). Jangan memakai gambar eksternal;',
    '   gunakan gradien CSS, emoji, atau inline SVG agar website tetap bagus tanpa internet.',
    '6. Sertakan minimal: navbar responsif (dengan menu mobile), hero, fitur/layanan, galeri/showcase,',
    '   testimoni, FAQ (accordion), kontak/CTA, footer. Sesuaikan dengan jenis bisnis.',
    '7. Desain premium: tema gelap elegan dengan aksen gradien, tipografi jelas, kartu rounded,',
    '   bayangan halus, animasi reveal saat scroll, tombol interaktif, dan toggle terang/gelap.',
    '8. Responsif sempurna di HP (≤480px), tablet, dan desktop. Tidak ada horizontal scroll.',
    '9. Konten ditulis dalam bahasa yang diminta pengguna (default Bahasa Indonesia), realistis, tidak lorem ipsum.',
    '10. Kode harus valid, tanpa placeholder seperti "TODO", tanpa error konsol, dan total < 60.000 karakter.',
    '11. Aksesibilitas: alt/label/aria secukupnya, kontras teks memadai, fokus terlihat.',
    '12. Jangan menambahkan komentar penjelasan di luar JSON.'
  ].join('\n');

  const OPENAI_STYLE = {
    groq: {
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      hint: 'Groq gratis: buat API key di console.groq.com/keys'
    },
    openrouter: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      hint: 'OpenRouter gratis: buat key di openrouter.ai/keys (pilih model berakhiran :free)'
    }
  };

  const PROVIDERS = [
    { id: 'pollinations', name: 'Pollinations (gratis, tanpa API key)', needsKey: false, model: 'openai', hint: 'Langsung jalan tanpa pendaftaran. Kadang lambat / kena limit.' },
    { id: 'gemini', name: 'Google Gemini (free tier)', needsKey: true, model: 'gemini-2.0-flash', hint: 'API key gratis di aistudio.google.com/apikey' },
    { id: 'groq', name: 'Groq (gratis & cepat)', needsKey: true, model: 'llama-3.3-70b-versatile', hint: 'API key gratis di console.groq.com/keys' },
    { id: 'openrouter', name: 'OpenRouter (model :free)', needsKey: true, model: 'meta-llama/llama-3.3-70b-instruct:free', hint: 'API key di openrouter.ai/keys' },
    { id: 'ninerouter', name: '9Router (gratis, OpenAI-compatible)', needsKey: true, model: 'default', hint: 'Gateway AI 9Router (npm i -g 9router). Isi base URL + model dari dashboard 9Router.' },
    { id: 'custom', name: 'OpenAI-compatible (custom)', needsKey: true, model: 'gpt-4o-mini', hint: 'Untuk endpoint OpenAI-compatible apa pun (base URL + key + model).' },
    { id: 'offline', name: 'Generator Offline (tanpa internet)', needsKey: false, model: 'template-engine', hint: 'Membuat website dari template premium bawaan. Selalu berhasil.' }
  ];

  function providerMeta(id) {
    return PROVIDERS.find(function (p) { return p.id === id; }) || PROVIDERS[0];
  }

  async function fetchTimed(url, options, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, ms || 90000);
    try {
      return await fetch(url, Object.assign({}, options, { signal: ctrl.signal }));
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchJson(url, options, ms) {
    const res = await fetchTimed(url, options, ms);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = null; }
    if (!res.ok) {
      const msg = (data && (data.error && (data.error.message || data.error))) || text.slice(0, 300) || ('HTTP ' + res.status);
      throw new Error('HTTP ' + res.status + ' — ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
    }
    return data;
  }

  /* ---------- pemanggil provider ---------- */
  async function callGemini(sys, user, cfg) {
    const key = (cfg.keys && cfg.keys.gemini) || '';
    if (!key) throw new Error('API key Gemini belum diisi (Pengaturan → Kunci API).');
    const model = cfg.model || 'gemini-2.0-flash';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) +
      ':generateContent?key=' + encodeURIComponent(key);
    const body = {
      systemInstruction: { parts: [{ text: sys }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: Number(cfg.temperature) || 0.8,
        maxOutputTokens: 8192,
        topP: 0.95
      }
    };
    const data = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, 120000);
    const cand = data && data.candidates && data.candidates[0];
    const parts = cand && cand.content && cand.content.parts;
    if (!parts || !parts.length) {
      const block = data && data.promptFeedback && data.promptFeedback.blockReason;
      throw new Error(block ? 'Permintaan diblokir Gemini: ' + block : 'Gemini tidak mengembalikan teks.');
    }
    return parts.map(function (p) { return p.text || ''; }).join('');
  }

  async function callOpenAiStyle(kind, sys, user, cfg, ms) {
    let url, model, headers = { 'Content-Type': 'application/json' };
    if (kind === 'ninerouter') {
      const base = (cfg.ninerouterBase || 'http://localhost:20128/v1').replace(/\/+$/, '');
      url = base + '/chat/completions';
      model = cfg.ninerouterModel || cfg.model || 'default';
      headers.Authorization = 'Bearer ' + (cfg.keys.ninerouter || cfg.keys.custom || '9router');
    } else if (kind === 'custom') {
      if (!cfg.keys.custom) throw new Error('API key belum diisi untuk penyedia custom.');
      const base = (cfg.customBase || 'https://api.openai.com/v1').replace(/\/+$/, '');
      url = base + '/chat/completions';
      model = cfg.customModel || cfg.model || 'gpt-4o-mini';
      headers.Authorization = 'Bearer ' + cfg.keys.custom;
    } else {
      const meta = OPENAI_STYLE[kind];
      url = meta.url;
      model = cfg.model || meta.model;
      const key = cfg.keys[kind];
      if (!key) throw new Error('API key ' + kind + ' belum diisi (Pengaturan → Kunci API).');
      headers.Authorization = 'Bearer ' + key;
    }
    if (kind === 'openrouter') {
      headers['HTTP-Referer'] = location.origin || 'https://aethelstudio.local';
      headers['X-Title'] = 'AethelStudio AI';
    }
    const body = {
      model: model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      temperature: Number(cfg.temperature) || 0.8,
      max_tokens: 8192
    };
    const data = await fetchJson(url, { method: 'POST', headers: headers, body: JSON.stringify(body) }, ms || 120000);
    const msg = data && data.choices && data.choices[0] && data.choices[0].message;
    if (!msg || !msg.content) throw new Error('AI tidak mengembalikan teks.');
    return msg.content;
  }

  async function callPollinations(sys, user, cfg) {
    const model = cfg.model && cfg.model !== 'openai' ? cfg.model : 'openai';
    const body = {
      model: model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      temperature: Number(cfg.temperature) || 0.8,
      max_tokens: 8192,
      reasoning_effort: 'low',
      private: true
    };
    try {
      const data = await fetchJson('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, 120000);
      const msg = data && data.choices && data.choices[0] && data.choices[0].message;
      if (msg && msg.content) return msg.content;
      if (typeof data === 'string') return data;
      throw new Error('Jawaban kosong dari Pollinations.');
    } catch (err) {
      // fallback ke endpoint GET sederhana
      const shortSys = sys.split('\n').slice(0, 6).join('\n');
      const full = shortSys + '\n\nPERMINTAAN PENGGUNA:\n' + user;
      const url = 'https://text.pollinations.ai/' + encodeURIComponent(full) +
        '?model=' + encodeURIComponent(model) + '&referrer=aethelstudio&private=true';
      const res = await fetchTimed(url, {}, 120000);
      const text = await res.text();
      if (!res.ok) throw new Error('Pollinations gagal (' + res.status + '). ' + (err.message || ''));
      if (!text || text.length < 20) throw new Error('Pollinations mengembalikan jawaban kosong.');
      return text;
    }
  }

  async function callProvider(provider, sys, user, cfg) {
    switch (provider) {
      case 'offline': throw new Error('Mode offline dipilih.');
      case 'gemini': return callGemini(sys, user, cfg);
      case 'groq': return callOpenAiStyle('groq', sys, user, cfg);
      case 'openrouter': return callOpenAiStyle('openrouter', sys, user, cfg);
      case 'ninerouter': return callOpenAiStyle('ninerouter', sys, user, cfg);
      case 'custom': return callOpenAiStyle('custom', sys, user, cfg);
      case 'pollinations':
      default: return callPollinations(sys, user, cfg);
    }
  }

  /* ---------- parsing hasil ---------- */
  function cleanFence(s) {
    return String(s).replace(/^\s*```[a-zA-Z]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  function looksLikeHtmlStart(s) {
    const t = String(s || '').replace(/^\uFEFF/, '').trim();
    return /^<!doctype\s+html/i.test(t) || /^<html[\s>]/i.test(t) || /^<(?:head|body|main|header|section|div|h1)[\s>]/i.test(t);
  }

  // Deteksi jawaban yang sebenarnya JSON (utuh/terpotong) tetapi ikut tersimpan sebagai file HTML.
  function looksLikeJsonBlob(s) {
    const t = String(s || '').replace(/^\uFEFF/, '').trim();
    if (!/^[\[{]/.test(t)) return false;
    return /"(?:title|description|tags|files)"\s*:/.test(t) || /"index\.html"\s*:/.test(t);
  }

  function tryParseJson(text) {
    let t = String(text || '').trim();
    if (!t) return null;
    t = t.replace(/^\uFEFF/, '');
    if (t.startsWith('```')) t = cleanFence(t);
    const candidates = [];
    candidates.push(t);
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a !== -1 && b > a) candidates.push(t.slice(a, b + 1));
    // kadang model membungkus di properti/array
    for (let i = 0; i < candidates.length; i++) {
      try {
        const obj = JSON.parse(candidates[i]);
        if (obj && typeof obj === 'object') {
          if (obj.files || obj.html || obj.index_html) return obj;
          if (obj.website && obj.website.files) return obj.website;
          if (obj.data && obj.data.files) return obj.data;
        }
      } catch (e) { /* coba berikutnya */ }
    }
    return null;
  }

  // Rapikan jawaban AI menjadi kode bersih (teks, markdown fence, atau JSON {"code": ...}).
  function extractCodeText(raw) {
    let t = String(raw || '').trim();
    if (t.startsWith('```')) {
      const m = t.match(/```[a-zA-Z0-9_-]*\s*\r?\n?([\s\S]*?)\r?\n?\s*```/);
      if (m) t = m[1].trim();
    }
    let code = t;
    try {
      const obj = JSON.parse(t);
      if (obj && typeof obj === 'object') {
        const c = obj.code || obj.content || obj.fixed || obj.result;
        if (typeof c === 'string') code = c;
      }
    } catch (e) { /* bukan JSON */ }
    return String(code).replace(/^\uFEFF/, '').trim();
  }

  function extractFromCodeBlocks(text) {
    const files = {};
    const re = /```(html|css|javascript|js)\s*\n([\s\S]*?)```/gi;
    let m, n = 0;
    while ((m = re.exec(text)) !== null) {
      const lang = m[1].toLowerCase();
      const body = m[2].trim();
      n++;
      if (lang === 'html') files[n === 1 ? 'index.html' : 'page' + n + '.html'] = body;
      else if (lang === 'css') files['style.css'] = body;
      else files['script.js'] = body;
    }
    if (!Object.keys(files).length) {
      if (looksLikeHtmlStart(text) && !looksLikeJsonBlob(text)) {
        files['index.html'] = cleanFence(text);
      }
    }
    return files;
  }

  function normalizeFiles(rawFiles) {
    const files = {};
    if (!rawFiles) return files;
    if (Array.isArray(rawFiles)) {
      rawFiles.forEach(function (f) {
        if (f && f.name && typeof f.content === 'string') files[f.name] = f.content;
        else if (f && f.path && typeof f.content === 'string') files[f.path] = f.content;
      });
    } else if (typeof rawFiles === 'object') {
      Object.keys(rawFiles).forEach(function (k) {
        const v = rawFiles[k];
        if (typeof v === 'string') files[k] = v;
        else if (v && typeof v.content === 'string') files[k] = v.content;
      });
    }
    // rapikan nama file
    const clean = {};
    Object.keys(files).forEach(function (name) {
      let n = String(name).replace(/^\.?\//, '').trim();
      if (!n) return;
      clean[n] = files[name];
    });
    if (!clean['index.html'] && clean['index.htm']) clean['index.html'] = clean['index.htm'];
    return clean;
  }

  function parseResult(raw, prompt, cfg) {
    let obj = tryParseJson(raw);
    let files = {};
    let title = '', description = '', tags = [];
    if (obj) {
      files = normalizeFiles(obj.files || obj);
      title = obj.title || obj.name || '';
      description = obj.description || '';
      tags = Array.isArray(obj.tags) ? obj.tags : [];
    }
    if (!files['index.html']) {
      const blocks = extractFromCodeBlocks(raw);
      if (blocks['index.html']) {
        files = Object.assign(files, blocks);
        obj = obj || {};
      }
    }
    if (!files['index.html']) return null;
    if (looksLikeJsonBlob(files['index.html'])) return null;

    // buang fence yang tidak sengaja masuk ke isi file
    Object.keys(files).forEach(function (k) {
      files[k] = cleanFence(files[k]);
    });
    // pastikan index.html punya struktur dasar
    if (!/<html[\s>]/i.test(files['index.html'])) {
      files['index.html'] = '<!DOCTYPE html>\n<html lang="id">\n<head>\n<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        '<title>' + util.esc(title || 'Website') + '</title>\n' +
        '<link rel="stylesheet" href="style.css">\n</head>\n<body>\n' +
        files['index.html'] + '\n<script src="script.js" defer></script>\n</body>\n</html>';
    }
    if (!title) {
      const tm = files['index.html'].match(/<title[^>]*>([^<]+)<\/title>/i);
      title = tm ? tm[1].trim() : (prompt || 'Website Baru').slice(0, 48);
    }
    if (!description) {
      const dm = files['index.html'].match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      description = dm ? dm[1] : 'Dibuat dengan AethelStudio AI dari prompt: ' + String(prompt).slice(0, 100);
    }
    return { title: title.slice(0, 80), description: description.slice(0, 240), tags: tags, files: files };
  }

  /* ---------- prompt pengguna ---------- */
  function userPrompt(prompt, cfg) {
    const lang = cfg.language === 'en' ? 'English' : 'Bahasa Indonesia';
    return 'Buat website berdasarkan permintaan berikut:\n\n' +
      '"' + String(prompt).trim() + '"\n\n' +
      'Ketik konten dalam ' + lang + '. Buat lengkap, realistis, dan siap dipublikasikan.\n' +
      'Ingat: balas HANYA JSON valid dengan kunci title, description, tags, files (index.html, style.css, script.js).';
  }

  /* ---------- API publik ---------- */
  const ai = {
    providers: PROVIDERS,
    meta: providerMeta,

    /**
     * Hasilkan website.
     * @returns {Promise<{title,description,tags,files,provider,offline,warning}>}
     */
    generate: async function (prompt, cfg, onProgress) {
      cfg = cfg || window.Aethel.db.settings();
      const notify = typeof onProgress === 'function' ? onProgress : function () {};
      const provider = cfg.provider || 'pollinations';

      if (provider === 'offline') {
        notify('Menyusun website dari template offline…');
        const local = window.Aethel.gen.fromPrompt(prompt, { language: cfg.language });
        local.provider = 'offline';
        return local;
      }

      notify('Menghubungi ' + providerMeta(provider).name + '…');
      try {
        const raw = await callProvider(provider, SYSTEM_PROMPT, userPrompt(prompt, cfg), cfg);
        notify('Menyusun file website…');
        const parsed = parseResult(raw, prompt, cfg);
        if (!parsed) {
          const trimmed = String(raw || '').trim();
          const cut = /^[\[{]/.test(trimmed) && !/[}\]]\s*$/.test(trimmed);
          throw new Error(cut
            ? 'Jawaban AI terpotong karena batas output penyedia. Coba lagi, atau pakai Groq/Gemini dengan API key gratis.'
            : 'Format jawaban AI tidak dikenali (bukan JSON website).');
        }
        parsed.provider = provider;
        parsed.rawLength = raw.length;
        return parsed;
      } catch (err) {
        console.warn('AI gagal, memakai generator offline:', err);
        notify('AI sedang tidak tersedia, beralih ke generator offline…');
        const local = window.Aethel.gen.fromPrompt(prompt, { language: cfg.language });
        local.provider = 'offline';
        local.offline = true;
        local.warning = 'AI ' + providerMeta(provider).name + ' gagal: ' + (err && err.message ? err.message : 'tidak diketahui') +
          ' — website dibuat dengan generator offline.';
        return local;
      }
    },

    /**
     * Tanya AI bebas (untuk asisten di panel bantuan/admin).
     */
    ask: async function (prompt, cfg, system) {
      cfg = cfg || window.Aethel.db.settings();
      const provider = cfg.provider === 'offline' ? 'pollinations' : cfg.provider;
      const sys = system || 'Kamu adalah asisten ramah AethelStudio AI. Jawab singkat, jelas, dalam Bahasa Indonesia.';
      const raw = await callProvider(provider, sys, prompt, cfg);
      return raw;
    },

    test: async function (cfg) {
      cfg = cfg || window.Aethel.db.settings();
      if (cfg.provider === 'offline') return 'Generator offline selalu siap ✓';
      const started = Date.now();
      const raw = await callProvider(cfg.provider, 'Balas dengan satu kata: OK', 'Tes koneksi. Balas: OK', cfg);
      return 'Terhubung dalam ' + ((Date.now() - started) / 1000).toFixed(1) + ' detik · ' + String(raw).trim().slice(0, 80);
    },

    fixCode: async function (code, filename, cfg) {
      cfg = cfg || window.Aethel.db.settings();
      const provider = cfg.provider === 'offline' ? 'pollinations' : cfg.provider;
      const ext = String(filename || '').split('.').pop().toLowerCase();
      const langName = /css/i.test(ext) ? 'CSS' : (/js|jsx|ts|tsx/i.test(ext) ? 'JavaScript' : /html|htm/i.test(ext) ? 'HTML' : /json/i.test(ext) ? 'JSON' : 'teks');
      const sys = [
        'Kamu adalah senior front-end engineer & QA engineer senior.',
        'Tugasmu: memperbaiki kode program yang diberikan tanpa merusak fungsionalitas yang sudah benar.',
        'Perbaiki error syntax, typo, konflik CSS, akses DOM/script yang salah, masalah responsif, keamanan XSS, performa, dll.',
        'ATURAN OUTPUT (WAJIB):',
        '1. Balas HANYA dengan isi kode perbaikan utuh. Tidak ada penjelasan, tidak ada markdown fence, tidak ada JSON.',
        '2. Pertahankan struktur dan perilaku yang sudah benar.',
        '3. Pastikan hasil kode valid dan siap dipakai.',
        '4. Kode mengikuti bahasa: ' + langName + '.'
      ].join('\n');
      const user = 'Nama file: ' + String(filename || 'file') + '\nBahasa: ' + langName + '\n\nKODE:\n' + String(code || '');
      const raw = await callProvider(provider, sys, user, cfg);
      const fixed = extractCodeText(raw);
      if (!fixed) throw new Error('AI tidak mengembalikan kode yang bisa dipakai.');
      return { code: fixed, provider: provider, filename: String(filename || 'file') };
    },

    extractCodeText: extractCodeText,

    parseResult: parseResult,
    systemPrompt: SYSTEM_PROMPT
  };

  window.Aethel.ai = ai;
})();
