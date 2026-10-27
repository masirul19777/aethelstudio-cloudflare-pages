# AethelStudio AI — AI Web Builder (Offline‑First)

Aplikasi web untuk **membuat website dari prompt**, mengeditnya di studio, **mengunduh ZIP langsung ke folder Download**, lalu **mempublikasikan (hosting)** ke Netlify / Vercel / Cloudflare Pages.

Tampilan seperti aplikasi native (bisa dipasang ke layar utama / PWA), tema gelap premium, dan tetap bisa dipakai **tanpa internet** lewat generator template offline.

---

## ✨ Fitur Utama

| Menu | Fungsi |
|---|---|
| **Beranda** | Chat dengan AI → website jadi (HTML + CSS + JS) + pratinjau langsung |
| **Studio** | Editor multi-file, preview HP/tablet/desktop, autosave, unduh ZIP |
| **Proyek** | Simpan, cari, favorit, duplikasi, impor, ekspor semua proyek |
| **Template** | 12 template premium + 1 bisnis umum siap pakai (cafe, toko, SaaS, wisata, undangan, dll.) |
| **Hosting** | Deploy 1 klik ke Netlify, Vercel, Cloudflare Pages + panduan tanpa token |
| **Gambar AI** | Buat aset visual gratis via Pollinations (tanpa API key) |
| **SEO Toolkit** | Audit on-page skor 100, cek meta/OG/alt/H1, generator meta tag |
| **Palet Warna** | Harmoni warna (analogous, komplementer, triadik) + CSS variabel |
| **QR Code** | QR untuk website/WhatsApp/menu, unduh PNG |
| **Cuplikan Kode** | 11 komponen siap tempel (navbar, hero, pricing, form WA, dll.) |
| **File & Kode** | Baca file dari HP → minta AI perbaiki → unduh hasil (prinsip ala Acode) |
| **Alat Bantu** | Minify, Base64, slug, konversi warna, password generator, Markdown→HTML |
| **Pengaturan** | Pilih AI, API key, tema, akun, token hosting, backup data, **suara & notifikasi** |
| **Bantuan** | Panduan lengkap, FAQ, pintasan keyboard |
| **Admin** (tersembunyi) | 12 modul pengelolaan — lihat di bawah |

### AI gratis yang didukung
1. **Pollinations** — default, **tanpa API key**, langsung jalan.
2. **Google Gemini** — free tier (butuh key gratis).
3. **Groq** — gratis & sangat cepat (butuh key).
4. **OpenRouter** — banyak model `:free` (butuh key).
5. **9Router** — gateway AI gratis/openai-compatible (base `http://localhost:20128/v1`).
6. **OpenAI-compatible** — endpoint kustom.
7. **Generator Offline** — selalu berhasil, tanpa internet.

Jika AI gratis sedang limit/error, aplikasi otomatis memakai generator offline agar Anda tetap mendapat website.

> **Catatan penting:** Pollinations versi tanpa API key punya batas keras sekitar **1 permintaan / 30 detik** dan **±1500 token output**. Jawaban yang terpotong otomatis dialihkan ke generator offline. Untuk hasil AI penuh (HTML+CSS+JS lengkap), gunakan **API key Groq atau Gemini gratis** — keduanya jauh lebih cepat dan stabil.

---

## 🛰️ Pakai seperti 9Router (AI Gateway)

Aplikasi Anda bisa dipakai **seperti 9Router** — gateway AI dengan endpoint **OpenAI-compatible** — sehingga semua alat/klien AI (Cursor, Codex, Cline, dll.) maupun AethelStudio AI bisa menunjuk ke satu endpoint.

**Langkah demi langkah:**

1. **Install 9Router** di komputer/komputer yang Anda pakai (PC atau Android via Termux):
   ```bash
   npm install -g 9router
   ```
2. **Jalankan 9Router**:
   ```bash
   npx 9router
   ```
   Dashboard tersedia di `http://localhost:20128/dashboard`.
3. **Hubungkan provider** lewat dashboard 9Router (OAuth / API key dari provider seperti Anthropic, Google, OpenAI, dll.) dan buat **combo/model** yang Anda inginkan (mis. Claude, GPT, Gemini gratis).
4. **Salin API key 9Router** dari dashboard (ada di halaman API Keys).
5. **Di AethelStudio AI**, buka **Pengaturan → Penyedia AI**:
   - Pilih **9Router (gratis, OpenAI-compatible)**.
   - Isi **9Router API key** (dari dashboard).
   - **Base URL**: `http://localhost:20128/v1` (jika 9Router jalan di PC yang sama dengan browser; kalau beda device, pakai IP LAN + pastikan server bind `0.0.0.0`).
   - **Model**: nama combo/model dari dashboard 9Router (default `default`).
   - Tekan **Tes koneksi**.
6. **Hasil**: semua fitur builder (generate website, perbaiki kode, chat) sekarang memakai gateway Anda.

Catatan: untuk klien AI lain (Cursor/Codex/Claude Code), cukup set base URL `http://localhost:20128/v1` + model combo + API key. CORS harus diizinkan 9Router untuk browser.

---

## 🔧 File & Kode — seperti Acode (baca file HP & perbaiki)

Menu baru **File & Kode** (`#/codefix`) membuat workflow seperti Acode di HP:

1. Buka menu **File & Kode**.
2. **Pilih file** (HTML/CSS/JS/JSON/…) atau **Pilih folder** (folder proyek).
3. File muncul di daftar; pilih file yang ingin diperbaiki.
4. Tekan **Perbaiki dengan AI** — AI akan mengirim isi file ke provider aktif (9Router/Groq/Gemini/Pollinations) untuk memperbaiki bug.
5. Hasil perbaikan ditampilkan → **Unduh ke Download** atau **Salin**.

Catatan: browser Android tidak bisa mengakses folder secara langsung tanpa user gesture; dengan **Acode** Anda bisa menambahkan native bridge, atau gunakan **Pilih folder** dari Chrome (jika didukung) / pilih file individual. Hasil perbaikan diunduh sebagai file tunggal (atau ZIP).

---

## 🚀 Cara Menjalankan

### Di Android (Acode / browser)
1. Buka folder ini di **Acode**.
2. Jalankan **Live Server** (menu Acode) atau buka `index.html` langsung di Chrome.
3. Untuk pengalaman terbaik (dan agar tombol hosting tidak diblokir CORS), akses lewat `http://localhost:8080` / `http://127.0.0.1:8080`.

> `file://` tetap bisa untuk membuat & mengunduh ZIP, tetapi beberapa API (hosting/AI tertentu) membutuhkan `localhost` atau HTTPS.

### Di desktop
```bash
# dari folder ini
npx serve .
# atau
python -m http.server 8080
```
Lalu buka `http://localhost:8080`.

---

## 📦 Menyimpan ZIP ke folder Download

1. Generate website atau buka **Studio**.
2. Tekan tombol **ZIP** (atau **Hosting → Unduh ZIP proyek**).
3. Berkas `nama-website.zip` terunduh. Di Android masuk ke folder **`Download`** (Chrome bisa menanyakan lokasi — pilih Download).
4. Isi ZIP: `index.html`, `style.css`, `script.js`, `README.md`, `netlify.toml`.

ZIP bisa langsung diekstrak dan dibuka, atau diunggah ke hosting apa pun (statis).

---

## 🌐 Hosting / Deploy

Buka menu **Hosting**. Tiga opsi langsung dari aplikasi:

| Platform | Yang dibutuhkan |
|---|---|
| **Netlify** | Personal access token (`app.netlify.com` → User settings → Applications → Personal access tokens) |
| **Vercel** | Token dari `vercel.com/account/tokens` |
| **Cloudflare Pages** | API token (izin *Cloudflare Pages: Edit*) + Account ID |

Token disimpan hanya di `localStorage` perangkat. Jika browser memblokir CORS, gunakan jalur alternatif: **unduh ZIP → Netlify Drop / Cloudflare Direct Upload**.

---

## 🔐 Admin Tersembunyi

Fitur admin **tidak muncul di menu** untuk pengguna biasa.

**Cara masuk (pemilik):**
- Ketuk **logo AethelStudio 5×** cepat, **atau**
- Ketuk teks **versi di bawah menu 7×**, **atau**
- Buka alamat `#/admin` langsung.

Kredensial awal:

- **Email:** `khoirulsholihan@gmail.com`
- **Password:** `Masirul65`

> Segera ganti password dari **Admin → Pengguna → ikon kunci**.
> Jika melakukan *reset pabrik*, akun admin dibuat ulang dengan kredensial di atas.

### 12 modul admin
1. **Ringkasan** — statistik pengguna, proyek, generate, deploy, grafik 14 hari
2. **Pengguna** — tambah, peran admin/user, blokir, reset password, hapus
3. **Proyek** — semua proyek semua pengguna, buka, ZIP, hapus
4. **Template** — tambah/edit template kustom dari preset, aktif/nonaktif
5. **Prompt** — kelola ide prompt yang tampil di beranda
6. **Kunci API** — konfigurasi AI global + tes koneksi + token hosting
7. **Situs** — nama aplikasi, tagline, versi, warna aksen, tema, mode perawatan
8. **Log Aktivitas** — filter, ekspor JSON, bersihkan
9. **Notifikasi** — banner pengumuman untuk semua pengguna
10. **Backup** — unduh/restore JSON, ekspor semua proyek ZIP
11. **Fitur** — sakelar generator, template, gambar AI, hosting, mode tamu, pendaftaran
12. **Zona Bahaya** — hapus proyek/log/template, reset pengaturan, reset pabrik

---

## 📱 Jadikan "APK" / Aplikasi

Aplikasi ini adalah **PWA** (Progressive Web App):

1. Buka lewat `localhost`/HTTPS di Chrome.
2. Menu **⋮ → Tambahkan ke layar utama**.
3. Ikon muncul seperti aplikasi biasa, berjalan fullscreen.

Untuk APK sungguhan, bungkus URL aplikasi dengan **PWABuilder**, **Median.co**, atau WebView Android. (File APK tidak disertakan karena harus di-build di sisi Anda.)

---

## 🗂 Struktur Folder

```
Aethel studio ai/
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── assets/
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.png
│   ├── css/app.css
│   └── js/
│       ├── core.js     # storage, auth, UI, router
│       ├── zip.js      # pembuat ZIP murni JS (tanpa library)
│       ├── gen.js      # generator offline + 12 preset + bisnis umum
│       ├── ai.js       # Pollinations/Gemini/Groq/OpenRouter/custom
│       ├── deploy.js   # Netlify/Vercel/Cloudflare
│       ├── admin.js    # panel admin (12 modul)
│       ├── pages.js    # gambar, SEO, palet, QR, snippet, alat, settings, help
│       └── app.js      # chat, studio, proyek, template, hosting
```

Semua data (proyek, akun, pengaturan, log) disimpan di **localStorage** browser. Tidak ada server/database.

---

## ⚠️ Catatan Keamanan

- Ini aplikasi **client-side / offline-first**. Password di-hash (SHA-256 + fallback deterministik) dan disimpan lokal, tetapi **bukan sistem login server**. Siapa pun yang menguasai perangkat/browser dapat membaca data lokal.
- Kredensial admin ada di kode sumber (seed awal). Untuk penggunaan publik/multi-pengguna nyata, pindahkan autentikasi ke backend.
- API key & token hosting tersimpan di browser — jangan pakai di perangkat bersama.
- Tombol deploy memanggil API pihak ketiga langsung dari browser; jika CORS diblokir, gunakan ZIP + upload manual.
- Selalu **Ekspor data** (JSON) secara berkala.

---

## 🧪 Troubleshooting

| Masalah | Solusi |
|---|---|
| AI gagal / hasil template | AI gratis sedang limit. Ganti penyedia di **Pengaturan**, atau pakai **Generator Offline**. |
| ZIP tidak masuk Download | Cek notifikasi browser; pilih folder Download saat diminta. Alternatif: buka via Chrome (bukan WebView). |
| Deploy gagal "Failed to fetch" | CORS / tanpa internet. Jalankan lewat `localhost`/HTTPS, atau unduh ZIP lalu upload manual. |
| Halaman putih | Buka Console browser; pastikan semua file `assets/js/*` ada. Coba hard refresh. |
| Lupa password admin | Reset data browser (hapus localStorage) → admin dibuat ulang dengan kredensial awal. Data proyek akan hilang, jadi backup dulu. |
| Token hosting hilang | Tersimpan per-browser; masukkan ulang di Pengaturan / modal deploy. |

---

## 🛠 Teknologi

Vanilla HTML/CSS/JavaScript — **tanpa build step, tanpa dependency**. ZIP dibuat sendiri (store method + CRC32), ikon SVG + PNG (192/512, maskable), PWA dengan service worker.

Dibuat untuk memudahkan siapa pun membuat website: ketik prompt → jadi → unduh → hosting. Selamat berkarya! 🚀
