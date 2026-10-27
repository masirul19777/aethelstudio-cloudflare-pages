/* ============================================================
   AethelStudio AI — gen.js
   Generator website offline berbasis preset.
   Dipakai sebagai fallback AI & sebagai isi galeri template.
   ============================================================ */
(function () {
  'use strict';
  const esc = window.Aethel.util.esc;

  const DEFAULT_TESTIMONIALS = [
    ['Rina P.', 'Pemilik Bisnis', 'Hasilnya rapi, cepat, dan langsung bisa dipakai. Prosesnya benar-benar semudah mengetik pesan.'],
    ['Bagas S.', 'Freelancer', 'Saya tidak perlu paham coding. Tinggal jelaskan ide, website jadi, lalu unduh ZIP-nya.'],
    ['Dewi A.', 'Marketing', 'Tampilannya modern dan responsif di HP. Klien saya langsung setuju saat melihat preview.']
  ];

  const PRESETS = [
    {
      id: 'portfolio', label: 'Portofolio Kreatif', emoji: '🎨', tags: ['portfolio', 'personal'],
      keywords: ['portfolio', 'portofolio', 'fotografer', 'desainer', 'designer', 'cv', 'resume', 'personal', 'freelance', 'fotografi', 'ilustrator'],
      brand: 'Raka Studio', theme: { primary: '#8b5cf6', accent: '#22d3ee' },
      badge: 'Portofolio 2026', title1: 'Karya yang', title2: 'berbicara sendiri.',
      tagline: 'Desainer visual & fotografer yang membantu brand tampil beda melalui cerita yang jujur dan desain yang berani.',
      description: 'Portofolio kreatif modern dengan galeri karya, layanan, dan formulir kontak.',
      stats: [['48+', 'Proyek selesai'], ['26', 'Klien puas'], ['6 th', 'Pengalaman']],
      features: [
        ['📸', 'Fotografi Produk', 'Foto bersih dan tajam untuk katalog, iklan, dan media sosial brand Anda.'],
        ['🎨', 'Identitas Visual', 'Logo, palet warna, dan panduan brand yang konsisten di semua kanal.'],
        ['💻', 'Desain Antarmuka', 'Tampilan web dan aplikasi yang enak dilihat serta mudah digunakan.'],
        ['✨', 'Art Direction', 'Konsep visual menyeluruh, dari moodboard sampai hasil akhir siap tayang.']
      ],
      showcase: [
        ['🌿', 'Aroma Botanica', 'Branding & kemasan'],
        ['☕', 'Kopi Senja', 'Foto produk & web'],
        ['🏄', 'Selatan Surf', 'Kampanye visual'],
        ['🧴', 'Glowlab', 'Identitas visual'],
        ['🎧', 'Nada Audio', 'Desain kemasan'],
        ['🏡', 'Rumah Kayu', 'Fotografi interior']
      ],
      plans: [
        ['Konsultasi', 'Rp 250rb', '/ sesi', ['Sesi 60 menit', 'Moodboard awal', 'Rekomendasi arah visual']],
        ['Proyek Desain', 'Rp 2,5jt', '/ paket', ['Logo & palet warna', '3 revisi desain', 'File siap cetak'], true],
        ['Retainer', 'Rp 6jt', '/ bulan', ['Prioritas pengerjaan', 'Desain tanpa batas', 'Pendampingan brand']]
      ],
      contact: { wa: '6281234567890', email: 'hello@rakastudio.id', city: 'Yogyakarta, Indonesia' }
    },
    {
      id: 'cafe', label: 'Cafe & Restoran', emoji: '☕', tags: ['kuliner', 'bisnis'],
      keywords: ['cafe', 'kafe', 'kopi', 'coffee', 'restoran', 'restaurant', 'kuliner', 'makanan', 'bakery', 'roti', 'bistro', 'warung'],
      brand: 'Kopi Senja', theme: { primary: '#f59e0b', accent: '#fb7185' },
      badge: 'Buka setiap hari', title1: 'Secangkir cerita', title2: 'di setiap sudut.',
      tagline: 'Kopi lokal pilihan, suasana hangat, dan tempat yang pas untuk bertemu atau sekadar menenangkan pikiran.',
      description: 'Website cafe hangat dengan menu, galeri suasana, paket, dan reservasi WhatsApp.',
      stats: [['12', 'Varian kopi'], ['4.9', 'Rating Google'], ['08–22', 'Jam buka']],
      features: [
        ['☕', 'Kopi Spesialti', 'Biji lokal dari petani pilihan, disangrai segar setiap minggu.'],
        ['🥐', 'Pastry Harian', 'Croissant, cinnamon roll, dan cake yang dipanggang tiap pagi.'],
        ['🪴', 'Ruang Nyaman', 'Area indoor dan semi-outdoor dengan wifi cepat dan colokan.'],
        ['🎶', 'Live Music', 'Penampilan akustik setiap Jumat dan Sabtu malam.']
      ],
      showcase: [
        ['☕', 'Es Kopi Senja', 'Signature · 24rb'],
        ['🥛', 'Latte Vanila', 'Favorit · 28rb'],
        ['🍵', 'Matcha Cream', 'Baru · 30rb'],
        ['🥐', 'Croissant Butter', 'Fresh · 22rb'],
        ['🍰', 'Basque Cheesecake', 'Best seller · 32rb'],
        ['🍫', 'Mocha Hazelnut', 'Manis · 30rb']
      ],
      plans: [
        ['Ngopi Santai', 'Rp 25rb', '/ orang', ['1 minuman pilihan', 'Free wifi', 'Air mineral']],
        ['Paket Berdua', 'Rp 75rb', '/ 2 orang', ['2 minuman', '2 pastry', 'Pilihan tempat favorit'], true],
        ['Reservasi Grup', 'Rp 300rb', '/ 6 orang', ['Meja khusus', 'Snack platter', 'Dekorasi sederhana']]
      ],
      contact: { wa: '6281234567890', email: 'halo@kopisenja.id', city: 'Bandung, Indonesia' }
    },
    {
      id: 'shop', label: 'Toko Online', emoji: '🛍️', tags: ['toko', 'ecommerce'],
      keywords: ['toko', 'shop', 'toko online', 'ecommerce', 'jualan', 'produk', 'fashion', 'store', 'olshop', 'baju', 'sepatu', 'skincare'],
      brand: 'Nusa Store', theme: { primary: '#06b6d4', accent: '#6366f1' },
      badge: 'Gratis ongkir min. 200rb', title1: 'Barang bagus,', title2: 'harga jujur.',
      tagline: 'Kurasi produk lokal berkualitas untuk gaya sehari-hari. Dikirim cepat ke seluruh Indonesia.',
      description: 'Toko online modern dengan katalog produk, keunggulan, testimoni, dan checkout WhatsApp.',
      stats: [['1.2rb+', 'Pesanan'], ['4.8/5', 'Ulasan'], ['24 jam', 'Kirim']],
      features: [
        ['🚚', 'Kirim Cepat', 'Pesanan sebelum jam 15.00 dikirim di hari yang sama.'],
        ['✅', 'Garansi Original', 'Semua produk dicek dan bergaransi tukar 7 hari.'],
        ['💳', 'Bayar Fleksibel', 'Transfer bank, e-wallet, atau bayar di tempat.'],
        ['💬', 'CS Responsif', 'Tim kami siap membantu lewat WhatsApp setiap hari.']
      ],
      showcase: [
        ['👕', 'Kaos Essential', 'Rp 129rb'],
        ['👟', 'Sneakers Daily', 'Rp 349rb'],
        ['🎒', 'Tas Kanvas', 'Rp 189rb'],
        ['🧢', 'Topi Classic', 'Rp 79rb'],
        ['🧴', 'Serum Glow', 'Rp 99rb'],
        ['🕶️', 'Kacamata Retro', 'Rp 149rb']
      ],
      plans: [
        ['Member Baru', 'Gratis', '/ daftar', ['Diskon 10% pertama', 'Info promo', 'Poin belanja']],
        ['Member Plus', 'Rp 99rb', '/ tahun', ['Diskon 15% semua item', 'Gratis ongkir 6x', 'Akses pre-order'], true],
        ['Reseller', 'Rp 249rb', '/ tahun', ['Harga khusus reseller', 'Katalog foto siap pakai', 'Panduan jualan']]
      ],
      contact: { wa: '6281234567890', email: 'cs@nusastore.id', city: 'Jakarta, Indonesia' }
    },
    {
      id: 'saas', label: 'Startup SaaS', emoji: '🚀', tags: ['saas', 'teknologi'],
      keywords: ['saas', 'startup', 'aplikasi', 'software', 'tech', 'cloud', 'dashboard', 'platform', 'ai', 'digital', 'fintech'],
      brand: 'NusaCloud', theme: { primary: '#22d3ee', accent: '#6366f1' },
      badge: 'Dipercaya 2.000+ tim', title1: 'Kelola pekerjaan', title2: 'tanpa ribet.',
      tagline: 'Satu ruang kerja untuk proyek, tim, dan pelanggan. Otomatis, rapi, dan siap tumbuh bersama bisnis Anda.',
      description: 'Landing page SaaS dengan fitur, harga, testimoni, dan CTA pendaftaran.',
      stats: [['2.000+', 'Tim aktif'], ['99,9%', 'Uptime'], ['4.9/5', 'Rating']],
      features: [
        ['⚡', 'Otomatisasi Tugas', 'Alur kerja berulang berjalan sendiri, tim fokus ke hal penting.'],
        ['📊', 'Laporan Real-time', 'Pantau performa tim dan proyek dalam satu dashboard.'],
        ['🔒', 'Keamanan Berlapis', 'Enkripsi data, kontrol akses, dan cadangan harian.'],
        ['🤝', 'Kolaborasi Mulus', 'Komentar, mention, dan berbagi file tanpa pindah aplikasi.']
      ],
      showcase: [
        ['📈', 'Analitik', 'Grafik keputusan'],
        ['🗂️', 'Proyek', 'Kanban fleksibel'],
        ['👥', 'Tim', 'Peran & izin'],
        ['🔔', 'Notifikasi', 'Selalu tepat waktu'],
        ['📱', 'Mobile App', 'iOS & Android'],
        ['🔗', 'Integrasi', '50+ aplikasi']
      ],
      plans: [
        ['Starter', 'Gratis', '/ selamanya', ['3 anggota tim', '5 proyek', 'Penyimpanan 2 GB']],
        ['Pro', 'Rp 149rb', '/ bulan', ['Anggota tak terbatas', 'Proyek tak terbatas', 'Otomatisasi & laporan'], true],
        ['Enterprise', 'Kustom', '/ tahun', ['SSO & audit log', 'Dukungan prioritas', 'Onboarding tim']]
      ],
      contact: { wa: '6281234567890', email: 'hello@nusacloud.id', city: 'Jakarta, Indonesia' }
    },
    {
      id: 'travel', label: 'Wisata & Travel', emoji: '🏝️', tags: ['travel', 'wisata'],
      keywords: ['wisata', 'travel', 'pantai', 'tour', 'bali', 'liburan', 'hotel', 'resort', 'penginapan', 'hiking', 'gunung'],
      brand: 'Jelajah Nusantara', theme: { primary: '#14b8a6', accent: '#38bdf8' },
      badge: 'Open trip mingguan', title1: 'Pulang dengan', title2: 'cerita baru.',
      tagline: 'Paket perjalanan kecil dengan pemandu lokal, itinerary santai, dan momen yang tidak dibuat-buat.',
      description: 'Website travel dengan paket tour, galeri destinasi, dan pemesanan WhatsApp.',
      stats: [['32', 'Destinasi'], ['1.5rb', 'Traveler'], ['4.9', 'Rating']],
      features: [
        ['🗺️', 'Itinerary Jelas', 'Rencana perjalanan transparan tanpa biaya tersembunyi.'],
        ['🧑‍🏫', 'Pemandu Lokal', 'Orang yang benar-benar mengenal tempat tujuan.'],
        ['🏕️', 'Penginapan Pilihan', 'Akomodasi bersih, aman, dan strategis.'],
        ['📸', 'Spot Foto Terbaik', 'Waktu dan lokasi terbaik untuk foto yang berkesan.']
      ],
      showcase: [
        ['🏝️', 'Nusa Penida', '3D2N · Rp 1,4jt'],
        ['🌋', 'Bromo Sunrise', '2D1N · Rp 850rb'],
        ['🐠', 'Raja Ampat', '5D4N · Rp 4,2jt'],
        ['⛰️', 'Sumbing Trek', '2D1N · Rp 650rb'],
        ['🏞️', 'Danau Toba', '3D2N · Rp 1,1jt'],
        ['🌊', 'Labuan Bajo', '4D3N · Rp 3,3jt']
      ],
      plans: [
        ['Sharing Trip', 'Rp 650rb', '/ orang', ['Transport AC', 'Homestay 1 malam', 'Pemandu lokal']],
        ['Private Trip', 'Rp 1,9jt', '/ 4 orang', ['Mobil privat', 'Itinerary fleksibel', 'Dokumentasi foto'], true],
        ['Custom Trip', 'Kustom', '/ grup', ['Rute sesuai keinginan', 'Akomodasi pilihan', 'Guide khusus']]
      ],
      contact: { wa: '6281234567890', email: 'trip@jelajah.id', city: 'Denpasar, Bali' }
    },
    {
      id: 'wedding', label: 'Undangan Pernikahan', emoji: '💍', tags: ['undangan', 'event'],
      keywords: ['wedding', 'pernikahan', 'nikah', 'undangan', 'tunangan', 'resepsi', 'akad', 'couple'],
      brand: 'Raka & Sinta', theme: { primary: '#f0b6b6', accent: '#d4a373' },
      badge: 'Save the date · 12.12.2026', title1: 'Dua hati,', title2: 'satu perjalanan.',
      tagline: 'Dengan penuh rasa syukur, kami mengundang Anda untuk menjadi bagian dari hari istimewa kami.',
      description: 'Undangan pernikahan online elegan dengan countdown, acara, galeri, dan RSVP.',
      stats: [['12', 'Desember'], ['10.00', 'Akad'], ['18.00', 'Resepsi']],
      features: [
        ['💌', 'Undangan Digital', 'Bisa dibagikan lewat WhatsApp dengan satu tautan.'],
        ['⏳', 'Hitung Mundur', 'Pengingat otomatis menuju hari bahagia.'],
        ['📍', 'Lokasi Acara', 'Peta dan petunjuk arah langsung ke venue.'],
        ['✅', 'Konfirmasi Hadir', 'Tamu dapat mengonfirmasi kehadiran dengan mudah.']
      ],
      showcase: [
        ['📸', 'Momen Kami', 'Galeri pre-wedding'],
        ['🕊️', 'Akad Nikah', 'Pukul 10.00 WIB'],
        ['🎉', 'Resepsi', 'Pukul 18.00 WIB'],
        ['🎁', 'Hadiah', 'Amplop digital'],
        ['🎵', 'Playlist', 'Lagu favorit kami'],
        ['💐', 'Dekorasi', 'Tema earthy']
      ],
      plans: [
        ['Silver', 'Rp 99rb', '/ undangan', ['1 template', 'Countdown', 'RSVP WhatsApp']],
        ['Gold', 'Rp 199rb', '/ undangan', ['Galeri 20 foto', 'Musik latar', 'Amplop digital'], true],
        ['Platinum', 'Rp 349rb', '/ undangan', ['Domain sendiri', 'Video pre-wedding', 'Revisi tanpa batas']]
      ],
      contact: { wa: '6281234567890', email: 'raka.sinta@undangan.id', city: 'Surabaya, Indonesia' }
    },
    {
      id: 'school', label: 'Sekolah & Kursus', emoji: '🎓', tags: ['edukasi', 'kursus'],
      keywords: ['sekolah', 'kursus', 'belajar', 'edukasi', 'coding', 'les', 'akademi', 'pendidikan', 'kelas', 'bimbel', 'universitas'],
      brand: 'Cerdas Academy', theme: { primary: '#3b82f6', accent: '#a855f7' },
      badge: 'Batch baru dibuka', title1: 'Belajar hari ini,', title2: 'siap berkarya.',
      tagline: 'Kelas praktis bersama mentor industri. Materi terstruktur, proyek nyata, dan komunitas yang suportif.',
      description: 'Website kursus online dengan program, silabus, mentor, dan pendaftaran.',
      stats: [['3.500+', 'Alumni'], ['92%', 'Lulus kerja'], ['4.9/5', 'Kepuasan']],
      features: [
        ['🧑‍💻', 'Belajar Praktik', '70% praktik dengan proyek yang bisa masuk portofolio.'],
        ['👨‍🏫', 'Mentor Industri', 'Dibimbing praktisi yang masih aktif bekerja.'],
        ['🤝', 'Komunitas', 'Grup diskusi dan sesi tanya jawab mingguan.'],
        ['📜', 'Sertifikat', 'Sertifikat kelulusan yang diakui mitra kami.']
      ],
      showcase: [
        ['🌐', 'Web Development', '12 minggu'],
        ['📱', 'Mobile Apps', '10 minggu'],
        ['🎨', 'UI/UX Design', '8 minggu'],
        ['📊', 'Data Analytics', '10 minggu'],
        ['🤖', 'AI Engineering', '12 minggu'],
        ['📣', 'Digital Marketing', '6 minggu']
      ],
      plans: [
        ['Gratis', 'Rp 0', '/ kelas', ['3 kelas dasar', 'Akses komunitas', 'Sertifikat dasar']],
        ['Profesional', 'Rp 1,2jt', '/ program', ['Semua kelas', 'Review portofolio', 'Sertifikat resmi'], true],
        ['Karier', 'Rp 2,9jt', '/ program', ['Bimbingan 1-on-1', 'Bantuan penempatan', 'Akses seumur hidup']]
      ],
      contact: { wa: '6281234567890', email: 'admisi@cerdasacademy.id', city: 'Bandung, Indonesia' }
    },
    {
      id: 'clinic', label: 'Klinik & Kesehatan', emoji: '🩺', tags: ['kesehatan', 'klinik'],
      keywords: ['klinik', 'dokter', 'gigi', 'kesehatan', 'medis', 'rumah sakit', 'apotek', 'dental', 'perawatan', 'terapi'],
      brand: 'Sehat Dental Care', theme: { primary: '#0ea5e9', accent: '#22d3ee' },
      badge: 'Terima BPJS & asuransi', title1: 'Senyum sehat,', title2: 'hati tenang.',
      tagline: 'Perawatan gigi modern dengan dokter berpengalaman, alat steril, dan suasana yang membuat Anda rileks.',
      description: 'Website klinik dengan layanan, jadwal dokter, keunggulan, dan form booking.',
      stats: [['12+', 'Dokter'], ['8.000+', 'Pasien'], ['4.9', 'Rating']],
      features: [
        ['🦷', 'Perawatan Gigi', 'Dari pembersihan sampai estetika, semua di satu tempat.'],
        ['🧼', 'Steril & Aman', 'Alat disterilkan sesuai standar medis setiap pasien.'],
        ['🕒', 'Jadwal Fleksibel', 'Buka Senin–Sabtu, termasuk jam sore.'],
        ['💬', 'Konsultasi Mudah', 'Tanya dokter lewat WhatsApp sebelum datang.']
      ],
      showcase: [
        ['✨', 'Scaling', 'Mulai Rp 250rb'],
        ['🦷', 'Tambal Gigi', 'Mulai Rp 300rb'],
        ['😁', 'Behel', 'Mulai Rp 5jt'],
        ['🌟', 'Whitening', 'Mulai Rp 1,5jt'],
        ['👶', 'Gigi Anak', 'Mulai Rp 200rb'],
        ['🔧', 'Impla Gigi', 'Konsultasi dulu']
      ],
      plans: [
        ['Konsultasi', 'Rp 100rb', '/ kunjungan', ['Pemeriksaan awal', 'Rencana perawatan', 'Tanpa tindakan']],
        ['Paket Bersih', 'Rp 350rb', '/ paket', ['Scaling & polishing', 'Konsultasi dokter', 'Obat pasca perawatan'], true],
        ['Perawatan Lanjutan', 'Kustom', '/ rencana', ['Rencana personal', 'Cicilan tersedia', 'Kontrol berkala']]
      ],
      contact: { wa: '6281234567890', email: 'halo@sehatdental.id', city: 'Jakarta Selatan, Indonesia' }
    },
    {
      id: 'gym', label: 'Gym & Fitness', emoji: '💪', tags: ['fitness', 'gym'],
      keywords: ['gym', 'fitness', 'olahraga', 'workout', 'yoga', 'sehat', 'latihan', 'personal trainer', 'bugar', 'crossfit'],
      brand: 'PrimeFit', theme: { primary: '#f97316', accent: '#ef4444' },
      badge: 'Promo member baru', title1: 'Versi terbaikmu', title2: 'dimulai hari ini.',
      tagline: 'Peralatan lengkap, kelas seru, dan pelatih bersertifikat. Tempat yang tepat untuk membangun kebiasaan sehat.',
      description: 'Website gym modern dengan program, kelas, harga membership, dan trial.',
      stats: [['500+', 'Member'], ['25', 'Kelas/minggu'], ['10', 'Pelatih']],
      features: [
        ['🏋️', 'Alat Lengkap', 'Area beban, kardio, dan functional training yang terawat.'],
        ['🧘', 'Kelas Variatif', 'Yoga, HIIT, boxing, dan spin dengan jadwal fleksibel.'],
        ['📋', 'Program Personal', 'Rencana latihan sesuai target dan kondisi tubuh.'],
        ['🚿', 'Fasilitas Nyaman', 'Loker, shower, dan area istirahat yang bersih.']
      ],
      showcase: [
        ['🏋️', 'Strength', 'Beban & barbell'],
        ['🔥', 'HIIT', 'Bakar kalori'],
        ['🧘', 'Yoga Flow', 'Tubuh rileks'],
        ['🥊', 'Boxing', 'Latihan fokus'],
        ['🚴', 'Spin Class', 'Kardio seru'],
        ['🤸', 'Mobility', 'Gerak lebih bebas']
      ],
      plans: [
        ['Harian', 'Rp 50rb', '/ hari', ['Akses gym', 'Loker', 'Air mineral']],
        ['Bulanan', 'Rp 350rb', '/ bulan', ['Akses penuh', 'Semua kelas', '1 sesi PT'], true],
        ['Tahunan', 'Rp 3,2jt', '/ tahun', ['Akses penuh', '4 sesi PT', 'Cek tubuh berkala']]
      ],
      contact: { wa: '6281234567890', email: 'hey@primefit.id', city: 'Semarang, Indonesia' }
    },
    {
      id: 'blog', label: 'Blog & Personal Brand', emoji: '✍️', tags: ['blog', 'personal'],
      keywords: ['blog', 'berita', 'majalah', 'artikel', 'personal brand', 'penulis', 'news', 'media', 'catatan'],
      brand: 'Catatan Raka', theme: { primary: '#10b981', accent: '#84cc16' },
      badge: 'Tulisan baru tiap minggu', title1: 'Gagasan kecil,', title2: 'dampak besar.',
      tagline: 'Catatan tentang desain, teknologi, dan cara membangun sesuatu dengan tenang — tanpa terburu-buru.',
      description: 'Blog personal minimalis dengan daftar artikel, topik, dan berlangganan newsletter.',
      stats: [['120+', 'Artikel'], ['8rb', 'Pembaca'], ['1x', 'Per minggu']],
      features: [
        ['📝', 'Esai Mendalam', 'Tulisan panjang yang dibuat dengan riset dan pengalaman.'],
        ['🧠', 'Catatan Praktis', 'Tips singkat yang bisa langsung dicoba.'],
        ['📮', 'Newsletter', 'Ringkasan tulisan terbaik, langsung ke email Anda.'],
        ['💬', 'Diskusi Terbuka', 'Tanggapan dan pertanyaan selalu dibaca.']
      ],
      showcase: [
        ['🎯', 'Fokus di Tengah Bising', 'Produktivitas'],
        ['🛠️', 'Membangun Tanpa Modal', 'Bisnis'],
        ['🎨', 'Desain yang Jujur', 'Desain'],
        ['🌱', 'Kebiasaan Kecil', 'Pengembangan diri'],
        ['⚙️', 'Otomasi Sederhana', 'Teknologi'],
        ['📚', 'Buku yang Mengubah', 'Review']
      ],
      plans: [
        ['Pembaca', 'Gratis', '/ selamanya', ['Semua artikel', 'Arsip lengkap', 'Newsletter mingguan']],
        ['Supporter', 'Rp 29rb', '/ bulan', ['Catatan eksklusif', 'Tanya jawab bulanan', 'Akses draf tulisan'], true],
        ['Kolaborasi', 'Kustom', '/ proyek', ['Tulisan sponsor', 'Review produk', 'Kelas bersama']]
      ],
      contact: { wa: '6281234567890', email: 'halo@catatanraka.id', city: 'Malang, Indonesia' }
    },
    {
      id: 'event', label: 'Event & Seminar', emoji: '🎤', tags: ['event', 'seminar'],
      keywords: ['event', 'acara', 'seminar', 'konser', 'webinar', 'conference', 'workshop', 'festival', 'pelatihan'],
      brand: 'Innovate 2026', theme: { primary: '#a855f7', accent: '#ec4899' },
      badge: 'Early bird terbatas', title1: 'Bertemu, belajar,', title2: 'berkolaborasi.',
      tagline: 'Konferensi tahunan untuk kreator dan pembangun produk. 20 pembicara, 8 sesi, satu hari penuh inspirasi.',
      description: 'Landing page event dengan pembicara, agenda, tiket, dan pendaftaran.',
      stats: [['20', 'Pembicara'], ['800', 'Kursi'], ['8', 'Sesi']],
      features: [
        ['🎙️', 'Pembicara Pilihan', 'Praktisi yang membagikan pengalaman nyata, bukan teori saja.'],
        ['🗓️', 'Agenda Padat', 'Sesi paralel yang bisa Anda pilih sesuai minat.'],
        ['🤝', 'Networking', 'Bertemu ratusan orang dengan semangat yang sama.'],
        ['🎁', 'Merchandise', 'Paket peserta berisi hal-hal berguna, bukan sekadar gimmick.']
      ],
      showcase: [
        ['🎤', 'Keynote', '09.00 WIB'],
        ['🧠', 'AI & Produk', '10.30 WIB'],
        ['🎨', 'Desain Berdampak', '13.00 WIB'],
        ['🚀', 'Membangun Startup', '14.30 WIB'],
        ['🤝', 'Networking', '16.00 WIB'],
        ['🎉', 'After Party', '19.00 WIB']
      ],
      plans: [
        ['Online', 'Rp 99rb', '/ peserta', ['Akses livestream', 'Rekaman 30 hari', 'Materi digital']],
        ['Offline', 'Rp 399rb', '/ peserta', ['Akses semua sesi', 'Makan siang', 'Merchandise eksklusif'], true],
        ['Team', 'Rp 1,5jt', '/ 5 orang', ['5 tiket offline', 'Meja tim', 'Sesi foto bersama']]
      ],
      contact: { wa: '6281234567890', email: 'hello@innovate.id', city: 'Jakarta Convention Center' }
    },
    {
      id: 'agency', label: 'Agensi & Jasa', emoji: '💼', tags: ['agensi', 'bisnis'],
      keywords: ['agency', 'agensi', 'jasa', 'digital marketing', 'company', 'perusahaan', 'konsultan', 'konsultasi', 'branding', 'iklan'],
      brand: 'Kreativa Agency', theme: { primary: '#6366f1', accent: '#f43f5e' },
      badge: 'Partner pertumbuhan brand', title1: 'Ide berani,', title2: 'hasil terukur.',
      tagline: 'Kami membantu brand menemukan suara, tampil konsisten, dan tumbuh melalui strategi yang terukur.',
      description: 'Website agensi dengan layanan, portofolio, proses kerja, dan kontak.',
      stats: [['70+', 'Brand'], ['3.4x', 'Rata-rata ROI'], ['8 th', 'Pengalaman']],
      features: [
        ['🧭', 'Strategi Brand', 'Riset, positioning, dan pesan yang membedakan Anda.'],
        ['🎨', 'Kreatif Visual', 'Desain dan konten yang konsisten di semua kanal.'],
        ['📈', 'Performance', 'Iklan dan funnel yang diukur, bukan ditebak.'],
        ['🌐', 'Website & Produk', 'Situs cepat, rapi, dan siap dikembangkan.']
      ],
      showcase: [
        ['🛍️', 'Retail Reborn', 'Brand & kampanye'],
        ['🏦', 'Fintech Baru', 'Website & funnel'],
        ['🍔', 'Food Chain', 'Sosial media'],
        ['🏡', 'Properti Hijau', 'Lead generation'],
        ['💊', 'Health App', 'Peluncuran produk'],
        ['🎓', 'Edutech', 'Rebranding']
      ],
      plans: [
        ['Audit', 'Rp 2jt', '/ sekali', ['Audit brand & kanal', 'Laporan temuan', 'Rencana 90 hari']],
        ['Growth', 'Rp 8jt', '/ bulan', ['Strategi & konten', 'Iklan terkelola', 'Laporan bulanan'], true],
        ['Partnership', 'Kustom', '/ kuartal', ['Tim dedicated', 'Workshop internal', 'Prioritas strategis']]
      ],
      contact: { wa: '6281234567890', email: 'hello@kreativa.id', city: 'Jakarta, Indonesia' }
    },
    {
      id: 'custom', label: 'Bisnis Umum', emoji: '✨', tags: ['umum'],
      keywords: [],
      brand: 'Aethel Studio', theme: { primary: '#2dd4bf', accent: '#6366f1' },
      badge: 'Solusi untuk bisnis Anda', title1: 'Tumbuh lebih mudah', title2: 'bersama kami.',
      tagline: 'Layanan profesional yang dirancang untuk kebutuhan Anda. Cepat, jelas, dan tanpa ribet.',
      description: 'Website bisnis modern yang siap disesuaikan dengan kebutuhan Anda.',
      stats: [['10+', 'Layanan'], ['1.000+', 'Pelanggan'], ['4.9', 'Rating']],
      features: [
        ['⚡', 'Cepat & Praktis', 'Proses sederhana dengan hasil yang bisa langsung dipakai.'],
        ['🎯', 'Tepat Sasaran', 'Solusi disesuaikan dengan kebutuhan dan anggaran Anda.'],
        ['🤝', 'Pendampingan', 'Tim kami siap membantu dari awal sampai selesai.'],
        ['🔒', 'Terpercaya', 'Rekam jejak dan ulasan dari pelanggan yang puas.']
      ],
      showcase: [
        ['✨', 'Layanan Utama', 'Paling diminati'],
        ['🚀', 'Paket Cepat', 'Siap dalam 3 hari'],
        ['💎', 'Paket Premium', 'Fitur lengkap'],
        ['🧩', 'Kustom', 'Sesuai kebutuhan'],
        ['📦', 'Produk Digital', 'Langsung pakai'],
        ['🛟', 'Dukungan', 'Setiap hari']
      ],
      plans: [
        ['Basic', 'Rp 199rb', '/ paket', ['Fitur inti', 'Dukungan email', 'Update berkala']],
        ['Populer', 'Rp 499rb', '/ paket', ['Semua fitur Basic', 'Prioritas dukungan', 'Konsultasi 1 jam'], true],
        ['Premium', 'Rp 999rb', '/ paket', ['Fitur lengkap', 'Pendampingan khusus', 'Revisi tanpa batas']]
      ],
      contact: { wa: '6281234567890', email: 'hello@aethelstudio.id', city: 'Indonesia' }
    }
  ];

  function detect(prompt) {
    const text = String(prompt || '').toLowerCase();
    let best = null, bestScore = 0;
    PRESETS.forEach(function (p) {
      if (p.id === 'custom') return;
      let score = 0;
      p.keywords.forEach(function (k) {
        if (text.indexOf(k) !== -1) score += k.length > 4 ? 2 : 1;
      });
      if (score > bestScore) { bestScore = score; best = p; }
    });
    return best || PRESETS[PRESETS.length - 1];
  }

  /* ---------- potongan HTML ---------- */
  function navHtml(p, navLinks, ctaLabel) {
    return '<header class="nav" id="nav">' +
      '<div class="container nav-in">' +
      '<a class="logo" href="#home"><span class="logo-mark">' + esc(p.brand.charAt(0).toUpperCase()) + '</span>' +
      '<span class="logo-text">' + esc(p.brand) + '</span></a>' +
      '<nav class="nav-links" id="navLinks">' +
      navLinks.map(function (l) { return '<a href="#' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('') +
      '</nav>' +
      '<div class="nav-actions">' +
      '<button class="theme-btn" id="themeBtn" aria-label="Ganti tema">☀️</button>' +
      '<a class="btn btn-primary nav-cta" href="#kontak">' + esc(ctaLabel) + '</a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>' +
      '</div></div></header>';
  }

  function planCards(p) {
    return p.plans.map(function (plan, i) {
      return '<article class="price-card' + (plan[4] ? ' popular' : '') + ' reveal">' +
        (plan[4] ? '<span class="badge-pop">Paling dipilih</span>' : '') +
        '<h3>' + esc(plan[0]) + '</h3>' +
        '<div class="price">' + esc(plan[1]) + '<span>' + esc(plan[2]) + '</span></div>' +
        '<ul>' + plan[3].map(function (f) { return '<li>' + checkSvg() + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
        '<a class="btn ' + (plan[4] ? 'btn-primary' : 'btn-ghost') + ' full" href="#kontak">Pilih paket</a>' +
        '</article>';
    }).join('');
  }

  function checkSvg() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>';
  }

  function waSvg() {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.5-1 .1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2.1.8 2.5.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.2z"/></svg>';
  }

  function buildSite(preset, opts) {
    opts = opts || {};
    const p = JSON.parse(JSON.stringify(preset));
    if (opts.theme) p.theme = Object.assign({}, p.theme, opts.theme);
    if (opts.brand) p.brand = opts.brand;
    if (opts.language === 'en') {
      p.badge = 'Welcome';
      p.title1 = 'Build something';
      p.title2 = 'worth sharing.';
      p.tagline = 'A modern, fast website crafted for your business. Clear message, beautiful layout, ready to launch.';
    }
    const wa = String(p.contact.wa || '').replace(/\D/g, '');
    const waLink = 'https://wa.me/' + wa;
    const year = new Date().getFullYear();
    const navLinks = [['layanan', 'Layanan'], ['karya', 'Galeri'], ['tentang', 'Tentang'], ['harga', 'Harga'], ['faq', 'FAQ'], ['kontak', 'Kontak']];
    const ctaLabel = 'Hubungi Kami';

    const initial = p.brand.trim().charAt(0).toUpperCase();

    const html = '<!DOCTYPE html>\n<html lang="' + (opts.language === 'en' ? 'en' : 'id') + '" data-theme="dark">\n<head>\n' +
      '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + esc(p.brand) + ' — ' + esc(p.badge) + '</title>\n' +
      '<meta name="description" content="' + esc(p.description) + '">\n' +
      '<meta property="og:title" content="' + esc(p.brand) + '">\n' +
      '<meta property="og:description" content="' + esc(p.description) + '">\n' +
      '<meta property="og:type" content="website">\n' +
      '<meta name="theme-color" content="' + esc(p.theme.primary) + '">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n' +
      '<link rel="stylesheet" href="style.css">\n</head>\n<body>\n' +
      '<div class="glow g1" aria-hidden="true"></div><div class="glow g2" aria-hidden="true"></div>\n' +
      navHtml(p, navLinks, ctaLabel) + '\n<main>\n' +

      /* HERO */
      '<section class="hero" id="home"><div class="container hero-in">' +
      '<div class="hero-copy">' +
      '<span class="pill reveal">✦ ' + esc(p.badge) + '</span>' +
      '<h1 class="reveal">' + esc(p.title1) + '<br><span class="grad">' + esc(p.title2) + '</span></h1>' +
      '<p class="lead reveal">' + esc(p.tagline) + '</p>' +
      '<div class="hero-cta reveal">' +
      '<a class="btn btn-primary" href="#kontak">Mulai sekarang</a>' +
      '<a class="btn btn-ghost" href="#karya">Lihat galeri</a>' +
      '</div>' +
      '<div class="stats reveal">' + p.stats.map(function (s) {
        return '<div class="stat"><strong data-count="' + esc(s[0]) + '">' + esc(s[0]) + '</strong><span>' + esc(s[1]) + '</span></div>';
      }).join('') + '</div>' +
      '</div>' +
      '<div class="hero-visual reveal">' +
      '<div class="visual-card">' +
      '<div class="vc-top"><span class="vc-dot"></span><span class="vc-dot"></span><span class="vc-dot"></span></div>' +
      '<div class="vc-body"><span class="vc-emoji">' + esc(p.emoji) + '</span>' +
      '<h3>' + esc(p.brand) + '</h3><p>' + esc(p.badge) + '</p>' +
      '<div class="vc-lines"><i></i><i></i><i></i></div>' +
      '<span class="vc-btn">Lihat selengkapnya →</span></div>' +
      '</div>' +
      '<div class="float-card fc1"><span>⭐</span><div><b>4.9/5</b><small>Ulasan pelanggan</small></div></div>' +
      '<div class="float-card fc2"><span>✓</span><div><b>Respon cepat</b><small>Balas &lt; 1 jam</small></div></div>' +
      '</div></div></section>\n' +

      /* FITUR */
      '<section class="section" id="layanan"><div class="container">' +
      '<div class="sec-head reveal"><span class="eyebrow">Layanan</span><h2>Apa yang kami tawarkan</h2>' +
      '<p>Dirancang sederhana agar Anda cepat mendapatkan hasil yang diinginkan.</p></div>' +
      '<div class="grid-4">' + p.features.map(function (f) {
        return '<article class="card reveal"><span class="card-ic">' + esc(f[0]) + '</span><h3>' + esc(f[1]) + '</h3><p>' + esc(f[2]) + '</p></article>';
      }).join('') + '</div></div></section>\n' +

      /* GALERI */
      '<section class="section alt" id="karya"><div class="container">' +
      '<div class="sec-head reveal"><span class="eyebrow">Galeri</span><h2>Sedikit cuplikan</h2><p>Beberapa hal yang kami banggakan.</p></div>' +
      '<div class="gallery">' + p.showcase.map(function (s, i) {
        return '<figure class="tile t' + ((i % 6) + 1) + ' reveal"><span class="tile-emoji">' + esc(s[0]) + '</span>' +
          '<figcaption><b>' + esc(s[1]) + '</b><small>' + esc(s[2]) + '</small></figcaption></figure>';
      }).join('') + '</div></div></section>\n' +

      /* TENTANG */
      '<section class="section" id="tentang"><div class="container about">' +
      '<div class="about-visual reveal"><div class="about-card"><span>' + esc(p.emoji) + '</span><strong>' + esc(p.brand) + '</strong><small>Sejak 2019 · ' + esc(p.contact.city) + '</small></div></div>' +
      '<div class="about-copy reveal"><span class="eyebrow">Tentang kami</span><h2>Dibuat oleh orang, untuk orang.</h2>' +
      '<p>' + esc(p.tagline) + '</p>' +
      '<ul class="check-list">' +
      '<li>' + checkSvg() + 'Tim yang berpengalaman dan mudah diajak bicara</li>' +
      '<li>' + checkSvg() + 'Proses transparan tanpa biaya tersembunyi</li>' +
      '<li>' + checkSvg() + 'Hasil bisa direvisi sampai sesuai</li>' +
      '<li>' + checkSvg() + 'Dukungan setelah pekerjaan selesai</li>' +
      '</ul>' +
      '<a class="btn btn-primary" href="#kontak">Ngobrol dengan kami</a></div></div></section>\n' +

      /* HARGA */
      '<section class="section alt" id="harga"><div class="container">' +
      '<div class="sec-head reveal"><span class="eyebrow">Harga</span><h2>Pilih yang paling pas</h2><p>Harga jelas, tanpa kejutan di akhir.</p></div>' +
      '<div class="pricing">' + planCards(p) + '</div></div></section>\n' +

      /* TESTIMONI */
      '<section class="section" id="testimoni"><div class="container">' +
      '<div class="sec-head reveal"><span class="eyebrow">Testimoni</span><h2>Kata mereka</h2></div>' +
      '<div class="grid-3">' + DEFAULT_TESTIMONIALS.map(function (t) {
        return '<blockquote class="quote reveal"><div class="stars">★★★★★</div><p>“' + esc(t[2]) + '”</p>' +
          '<footer><span class="q-avatar">' + esc(t[0].charAt(0)) + '</span><div><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></div></footer></blockquote>';
      }).join('') + '</div></div></section>\n' +

      /* FAQ */
      '<section class="section alt" id="faq"><div class="container narrow">' +
      '<div class="sec-head reveal"><span class="eyebrow">FAQ</span><h2>Pertanyaan yang sering muncul</h2></div>' +
      '<div class="faq">' + [
        ['Berapa lama proses pengerjaannya?', 'Untuk paket standar biasanya 3–7 hari kerja setelah brief dan materi diterima. Kami akan memberi kabar di setiap tahap.'],
        ['Apakah bisa request desain khusus?', 'Tentu. Kami bisa menyesuaikan warna, layout, dan konten dengan identitas brand Anda.'],
        ['Bagaimana cara memesan?', 'Klik tombol WhatsApp atau isi formulir di bawah. Kami akan membalas dengan langkah selanjutnya.'],
        ['Apakah ada garansi dan revisi?', 'Ada. Jumlah revisi mengikuti paket yang dipilih, dan kami tetap membantu jika ada kendala teknis setelah selesai.']
      ].map(function (f) {
        return '<details class="faq-item reveal"><summary>' + esc(f[0]) + '<span>+</span></summary><p>' + esc(f[1]) + '</p></details>';
      }).join('') + '</div></div></section>\n' +

      /* KONTAK */
      '<section class="section" id="kontak"><div class="container contact">' +
      '<div class="contact-copy reveal"><span class="eyebrow">Kontak</span><h2>Siap mulai? Ceritakan ide Anda.</h2>' +
      '<p>Isi formulir singkat ini, kami akan membalas lewat WhatsApp.</p>' +
      '<div class="contact-info">' +
      '<a href="' + waLink + '" target="_blank" rel="noopener"><span>💬</span><div><small>WhatsApp</small><b>+' + esc(wa.replace(/^62/, '62 ').replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3')) + '</b></div></a>' +
      '<a href="mailto:' + esc(p.contact.email) + '"><span>✉️</span><div><small>Email</small><b>' + esc(p.contact.email) + '</b></div></a>' +
      '<div class="static"><span>📍</span><div><small>Lokasi</small><b>' + esc(p.contact.city) + '</b></div></div>' +
      '</div></div>' +
      '<form class="contact-form reveal" id="contactForm" data-wa="' + esc(wa) + '">' +
      '<label>Nama<input type="text" name="nama" placeholder="Nama Anda" required></label>' +
      '<label>Nomor WhatsApp<input type="tel" name="wa" placeholder="08xx xxxx xxxx" required></label>' +
      '<label>Pesan<textarea name="pesan" rows="4" placeholder="Ceritakan kebutuhan Anda…" required></textarea></label>' +
      '<button class="btn btn-primary full" type="submit">Kirim lewat WhatsApp</button>' +
      '<small class="form-note">Pesan akan dibuka di WhatsApp. Tidak ada data yang disimpan di server.</small>' +
      '</form></div></section>\n' +

      /* CTA */
      '<section class="cta-band"><div class="container cta-in reveal">' +
      '<h2>Masih ragu? Mulai dari obrolan santai.</h2><p>Tanpa komitmen. Kami senang mendengar ide Anda.</p>' +
      '<a class="btn btn-light" href="' + waLink + '" target="_blank" rel="noopener">Chat via WhatsApp</a>' +
      '</div></section>\n' +

      '</main>\n<footer class="footer"><div class="container footer-in">' +
      '<div class="f-brand"><a class="logo" href="#home"><span class="logo-mark">' + esc(initial) + '</span><span>' + esc(p.brand) + '</span></a>' +
      '<p>' + esc(p.tagline) + '</p></div>' +
      '<div class="f-col"><b>Navigasi</b>' + navLinks.slice(0, 4).map(function (l) { return '<a href="#' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('') + '</div>' +
      '<div class="f-col"><b>Kontak</b><a href="mailto:' + esc(p.contact.email) + '">' + esc(p.contact.email) + '</a><a href="' + waLink + '" target="_blank" rel="noopener">WhatsApp</a><span>' + esc(p.contact.city) + '</span></div>' +
      '</div><div class="container f-bottom"><span>© <span id="year">' + year + '</span> ' + esc(p.brand) + '. Semua hak dilindungi.</span>' +
      '<span>Dibuat dengan <a href="index.html">AethelStudio AI</a></span></div></footer>\n' +
      '<a class="wa-float" href="' + waLink + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + waSvg() + '</a>\n' +
      '<button class="to-top" id="toTop" aria-label="Ke atas">↑</button>\n' +
      '<script src="script.js" defer></script>\n</body>\n</html>';

    return {
      files: { 'index.html': html, 'style.css': buildCss(p), 'script.js': buildJs() },
      title: p.brand,
      description: p.description,
      tags: p.tags || ['website'],
      preset: p.id
    };
  }

  function buildCss(p) {
    const primary = p.theme.primary, accent = p.theme.accent;
    return '/* ' + p.brand + ' — dibuat dengan AethelStudio AI */\n' +
      ':root{--bg:#070b12;--bg2:#0b1424;--surface:#0e1829;--card:rgba(255,255,255,.045);--text:#e9eff8;--muted:#98a7bc;--line:rgba(255,255,255,.09);--primary:' + primary + ';--accent:' + accent + ';--radius:20px;--max:1160px}\n' +
      '[data-theme="light"]{--bg:#f7f9fc;--bg2:#eef3fa;--surface:#ffffff;--card:#ffffff;--text:#0d1726;--muted:#5a6b81;--line:rgba(10,25,45,.1)}\n' +
      '*,*::before,*::after{box-sizing:border-box}\n' +
      'html{scroll-behavior:smooth;scroll-padding-top:90px}\n' +
      'body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}\n' +
      'h1,h2,h3,h4{font-family:Outfit,system-ui,sans-serif;line-height:1.15;margin:0 0 .6em;letter-spacing:-.02em}\n' +
      'p{margin:0 0 1rem;color:var(--muted)}\n' +
      'a{color:inherit;text-decoration:none}\n' +
      'img{max-width:100%;display:block}\n' +
      '.container{width:100%;max-width:var(--max);margin:0 auto;padding:0 22px}\n' +
      '.container.narrow{max-width:840px}\n' +
      '.glow{position:fixed;width:520px;height:520px;border-radius:50%;filter:blur(110px);opacity:.22;pointer-events:none;z-index:0}\n' +
      '.g1{background:var(--primary);top:-180px;left:-140px}\n' +
      '.g2{background:var(--accent);bottom:-200px;right:-160px;opacity:.16}\n' +
      '/* NAV */\n' +
      '.nav{position:sticky;top:0;z-index:50;backdrop-filter:blur(18px);background:color-mix(in srgb,var(--bg) 82%,transparent);border-bottom:1px solid transparent;transition:border-color .3s,background .3s}\n' +
      '.nav.scrolled{border-bottom-color:var(--line);background:color-mix(in srgb,var(--bg) 94%,transparent)}\n' +
      '.nav-in{display:flex;align-items:center;justify-content:space-between;gap:18px;height:72px}\n' +
      '.logo{display:inline-flex;align-items:center;gap:10px;font-family:Outfit,sans-serif;font-weight:700;font-size:1.05rem;letter-spacing:-.01em}\n' +
      '.logo-mark{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--primary),var(--accent));box-shadow:0 8px 24px -8px var(--primary)}\n' +
      '.nav-links{display:flex;gap:26px;font-size:.92rem;font-weight:500}\n' +
      '.nav-links a{color:var(--muted);transition:color .2s}\n' +
      '.nav-links a:hover{color:var(--text)}\n' +
      '.nav-actions{display:flex;align-items:center;gap:10px}\n' +
      '.theme-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--text);font-size:1rem;cursor:pointer;display:grid;place-items:center}\n' +
      '.nav-toggle{display:none;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--text);font-size:1.1rem;cursor:pointer}\n' +
      '/* BUTTONS */\n' +
      '.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 22px;border-radius:999px;font-weight:600;font-size:.92rem;border:1px solid transparent;cursor:pointer;transition:transform .2s,box-shadow .2s,background .2s;white-space:nowrap}\n' +
      '.btn:hover{transform:translateY(-2px)}\n' +
      '.btn-primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#05101c;box-shadow:0 14px 34px -14px var(--primary)}\n' +
      '.btn-primary:hover{box-shadow:0 20px 40px -14px var(--primary)}\n' +
      '.btn-ghost{border-color:var(--line);background:var(--card);color:var(--text)}\n' +
      '.btn-light{background:#fff;color:#0b1220}\n' +
      '.btn.full{width:100%}\n' +
      '/* HERO */\n' +
      '.hero{position:relative;padding:72px 0 54px;z-index:1}\n' +
      '.hero-in{display:grid;grid-template-columns:1.08fr .92fr;gap:48px;align-items:center}\n' +
      '.pill{display:inline-flex;align-items:center;gap:7px;padding:7px 15px;border-radius:999px;border:1px solid var(--line);background:var(--card);font-size:.78rem;font-weight:600;letter-spacing:.02em;color:var(--text);margin-bottom:20px}\n' +
      '.hero h1{font-size:clamp(2.2rem,5.4vw,3.9rem);font-weight:800;margin-bottom:18px}\n' +
      '.grad{background:linear-gradient(100deg,var(--primary),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}\n' +
      '.lead{font-size:1.03rem;max-width:520px;margin-bottom:26px}\n' +
      '.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:34px}\n' +
      '.stats{display:flex;gap:30px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:24px}\n' +
      '.stat strong{display:block;font-family:Outfit,sans-serif;font-size:1.5rem;font-weight:700}\n' +
      '.stat span{font-size:.78rem;color:var(--muted)}\n' +
      '.hero-visual{position:relative}\n' +
      '.visual-card{border-radius:26px;border:1px solid var(--line);background:linear-gradient(160deg,var(--surface),var(--bg2));padding:14px;box-shadow:0 40px 80px -50px #000;transform:rotate(-1.5deg)}\n' +
      '.vc-top{display:flex;gap:6px;padding:4px 6px 12px}\n' +
      '.vc-dot{width:9px;height:9px;border-radius:50%;background:var(--line)}\n' +
      '.vc-body{border-radius:18px;background:linear-gradient(160deg,color-mix(in srgb,var(--primary) 16%,var(--surface)),var(--surface));border:1px solid var(--line);padding:30px 24px;text-align:center}\n' +
      '.vc-emoji{font-size:3rem;display:block;margin-bottom:12px}\n' +
      '.vc-body h3{font-size:1.3rem;margin-bottom:4px}\n' +
      '.vc-body p{font-size:.82rem;margin-bottom:18px}\n' +
      '.vc-lines{display:grid;gap:8px;margin:0 auto 18px;max-width:220px}\n' +
      '.vc-lines i{display:block;height:9px;border-radius:99px;background:var(--line)}\n' +
      '.vc-lines i:nth-child(2){width:80%;margin:0 auto}\n' +
      '.vc-lines i:nth-child(3){width:60%;margin:0 auto}\n' +
      '.vc-btn{display:inline-block;padding:10px 18px;border-radius:999px;font-size:.78rem;font-weight:700;background:linear-gradient(135deg,var(--primary),var(--accent));color:#05101c}\n' +
      '.float-card{position:absolute;display:flex;align-items:center;gap:10px;padding:11px 15px;border-radius:14px;background:color-mix(in srgb,var(--surface) 92%,transparent);border:1px solid var(--line);box-shadow:0 18px 40px -22px #000;font-size:.75rem;backdrop-filter:blur(10px)}\n' +
      '.float-card b{display:block;font-family:Outfit,sans-serif}\n' +
      '.float-card small{color:var(--muted)}\n' +
      '.float-card span{font-size:1.1rem}\n' +
      '.fc1{top:20px;right:-16px;transform:rotate(2deg)}\n' +
      '.fc2{bottom:26px;left:-20px;transform:rotate(-2deg)}\n' +
      '/* SECTIONS */\n' +
      '.section{padding:76px 0;position:relative;z-index:1}\n' +
      '.section.alt{background:color-mix(in srgb,var(--bg2) 55%,transparent);border-block:1px solid var(--line)}\n' +
      '.sec-head{max-width:620px;margin-bottom:40px}\n' +
      '.eyebrow{display:inline-block;font-size:.74rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--primary);margin-bottom:10px}\n' +
      '.sec-head h2{font-size:clamp(1.6rem,3.6vw,2.4rem);font-weight:700}\n' +
      '.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}\n' +
      '.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}\n' +
      '.card{border-radius:var(--radius);border:1px solid var(--line);background:var(--card);padding:24px;transition:transform .25s,border-color .25s,background .25s}\n' +
      '.card:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--primary) 45%,var(--line));background:color-mix(in srgb,var(--primary) 6%,var(--card))}\n' +
      '.card-ic{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:color-mix(in srgb,var(--primary) 14%,transparent);font-size:1.35rem;margin-bottom:16px}\n' +
      '.card h3{font-size:1.03rem;margin-bottom:8px}\n' +
      '.card p{font-size:.88rem;margin:0}\n' +
      '/* GALLERY */\n' +
      '.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}\n' +
      '.tile{margin:0;aspect-ratio:4/3;border-radius:var(--radius);border:1px solid var(--line);padding:22px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;transition:transform .25s}\n' +
      '.tile:hover{transform:translateY(-4px) scale(1.01)}\n' +
      '.tile::after{content:"";position:absolute;inset:0;background:radial-gradient(400px 200px at 80% 0%,rgba(255,255,255,.16),transparent 70%)}\n' +
      '.tile-emoji{font-size:2rem;position:relative;z-index:1}\n' +
      '.tile figcaption{position:relative;z-index:1}\n' +
      '.tile b{display:block;font-family:Outfit,sans-serif;font-size:1rem}\n' +
      '.tile small{font-size:.76rem;opacity:.72}\n' +
      '.t1{background:linear-gradient(150deg,color-mix(in srgb,var(--primary) 42%,#0b1220),#0b1220)}\n' +
      '.t2{background:linear-gradient(150deg,color-mix(in srgb,var(--accent) 40%,#0b1220),#0b1220)}\n' +
      '.t3{background:linear-gradient(150deg,color-mix(in srgb,var(--primary) 26%,var(--accent) 22%,#0b1220),#0b1220)}\n' +
      '.t4{background:linear-gradient(150deg,#1b2a44,#0b1220)}\n' +
      '.t5{background:linear-gradient(150deg,color-mix(in srgb,var(--accent) 26%,#0b1220),color-mix(in srgb,var(--primary) 20%,#0b1220))}\n' +
      '.t6{background:linear-gradient(150deg,color-mix(in srgb,var(--primary) 34%,#12203a),#0b1220)}\n' +
      '/* ABOUT */\n' +
      '.about{display:grid;grid-template-columns:.9fr 1.1fr;gap:44px;align-items:center}\n' +
      '.about-card{border-radius:26px;border:1px solid var(--line);background:linear-gradient(160deg,color-mix(in srgb,var(--primary) 18%,var(--surface)),var(--surface));padding:36px;text-align:center}\n' +
      '.about-card span{font-size:3.4rem;display:block;margin-bottom:14px}\n' +
      '.about-card strong{display:block;font-family:Outfit,sans-serif;font-size:1.35rem}\n' +
      '.about-card small{color:var(--muted)}\n' +
      '.about-copy h2{font-size:clamp(1.6rem,3.4vw,2.2rem)}\n' +
      '.check-list{list-style:none;padding:0;margin:22px 0 26px;display:grid;gap:12px}\n' +
      '.check-list li{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;color:var(--muted)}\n' +
      '.check-list svg{color:var(--primary);flex:none;margin-top:4px}\n' +
      '/* PRICING */\n' +
      '.pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:stretch}\n' +
      '.price-card{position:relative;border-radius:var(--radius);border:1px solid var(--line);background:var(--card);padding:28px;display:flex;flex-direction:column}\n' +
      '.price-card.popular{border-color:color-mix(in srgb,var(--primary) 60%,var(--line));background:linear-gradient(170deg,color-mix(in srgb,var(--primary) 12%,var(--card)),var(--card));box-shadow:0 30px 60px -40px var(--primary)}\n' +
      '.badge-pop{position:absolute;top:-12px;right:20px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#05101c;font-size:.68rem;font-weight:800;padding:5px 12px;border-radius:99px}\n' +
      '.price-card h3{font-size:1rem;color:var(--muted);font-weight:600}\n' +
      '.price{font-family:Outfit,sans-serif;font-size:2rem;font-weight:800;margin-bottom:18px}\n' +
      '.price span{font-size:.78rem;color:var(--muted);font-weight:500}\n' +
      '.price-card ul{list-style:none;padding:0;margin:0 0 24px;display:grid;gap:11px}\n' +
      '.price-card li{display:flex;gap:9px;font-size:.86rem;color:var(--muted)}\n' +
      '.price-card li svg{color:var(--primary);flex:none;margin-top:3px}\n' +
      '.price-card .btn{margin-top:auto}\n' +
      '/* QUOTES */\n' +
      '.quote{margin:0;border-radius:var(--radius);border:1px solid var(--line);background:var(--card);padding:26px}\n' +
      '.stars{color:#fbbf24;letter-spacing:2px;font-size:.85rem;margin-bottom:12px}\n' +
      '.quote p{font-size:.92rem;color:var(--text)}\n' +
      '.quote footer{display:flex;align-items:center;gap:11px;margin-top:18px}\n' +
      '.q-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:linear-gradient(135deg,var(--primary),var(--accent));color:#05101c}\n' +
      '.quote footer b{display:block;font-size:.86rem}\n' +
      '.quote footer small{font-size:.74rem;color:var(--muted)}\n' +
      '/* FAQ */\n' +
      '.faq{display:grid;gap:10px}\n' +
      '.faq-item{border-radius:14px;border:1px solid var(--line);background:var(--card);padding:16px 20px}\n' +
      '.faq-item summary{display:flex;justify-content:space-between;gap:14px;cursor:pointer;font-weight:600;font-size:.93rem;list-style:none}\n' +
      '.faq-item summary::-webkit-details-marker{display:none}\n' +
      '.faq-item summary span{color:var(--primary);font-size:1.2rem;line-height:1;transition:transform .2s}\n' +
      '.faq-item[open] summary span{transform:rotate(45deg)}\n' +
      '.faq-item p{font-size:.88rem;margin:12px 0 0}\n' +
      '/* CONTACT */\n' +
      '.contact{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}\n' +
      '.contact-info{display:grid;gap:12px;margin-top:22px}\n' +
      '.contact-info a,.contact-info .static{display:flex;gap:12px;align-items:center;padding:13px 16px;border-radius:14px;border:1px solid var(--line);background:var(--card)}\n' +
      '.contact-info span{font-size:1.2rem}\n' +
      '.contact-info small{display:block;font-size:.72rem;color:var(--muted)}\n' +
      '.contact-info b{font-size:.86rem;font-weight:600}\n' +
      '.contact-form{border-radius:var(--radius);border:1px solid var(--line);background:var(--card);padding:26px;display:grid;gap:14px}\n' +
      '.contact-form label{display:grid;gap:6px;font-size:.8rem;font-weight:600;color:var(--muted)}\n' +
      '.contact-form input,.contact-form textarea{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--text);font:inherit;font-size:.9rem;outline:none;transition:border-color .2s}\n' +
      '.contact-form input:focus,.contact-form textarea:focus{border-color:var(--primary)}\n' +
      '.contact-form textarea{resize:vertical}\n' +
      '.form-note{font-size:.72rem;color:var(--muted);text-align:center}\n' +
      '/* CTA */\n' +
      '.cta-band{padding:0 0 80px}\n' +
      '.cta-in{border-radius:28px;padding:52px 36px;text-align:center;background:linear-gradient(140deg,color-mix(in srgb,var(--primary) 80%,#0b1220),color-mix(in srgb,var(--accent) 70%,#0b1220));border:1px solid rgba(255,255,255,.14)}\n' +
      '.cta-in h2{color:#fff;font-size:clamp(1.5rem,3.4vw,2.2rem)}\n' +
      '.cta-in p{color:rgba(255,255,255,.82);margin-bottom:22px}\n' +
      '.cta-in .btn:hover{transform:translateY(-2px)}\n' +
      '/* FOOTER */\n' +
      '.footer{border-top:1px solid var(--line);padding:46px 0 22px;position:relative;z-index:1}\n' +
      '.footer-in{display:grid;grid-template-columns:2fr 1fr 1fr;gap:32px;margin-bottom:32px}\n' +
      '.f-brand p{font-size:.84rem;max-width:320px;margin-top:12px}\n' +
      '.f-col{display:grid;gap:8px;align-content:start;font-size:.84rem}\n' +
      '.f-col b{font-family:Outfit,sans-serif;margin-bottom:4px}\n' +
      '.f-col a,.f-col span{color:var(--muted)}\n' +
      '.f-col a:hover{color:var(--text)}\n' +
      '.f-bottom{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:18px;border-top:1px solid var(--line);font-size:.75rem;color:var(--muted)}\n' +
      '.f-bottom a{color:var(--primary)}\n' +
      '/* FLOATING */\n' +
      '.wa-float{position:fixed;right:18px;bottom:18px;z-index:60;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#25d366;color:#fff;box-shadow:0 16px 34px -12px rgba(37,211,102,.8);transition:transform .2s}\n' +
      '.wa-float:hover{transform:scale(1.07)}\n' +
      '.to-top{position:fixed;right:20px;bottom:84px;z-index:55;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:1rem;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .25s}\n' +
      '.to-top.show{opacity:1;pointer-events:auto}\n' +
      '/* REVEAL */\n' +
      '.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}\n' +
      '.reveal.in{opacity:1;transform:none}\n' +
      '@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}\n' +
      '/* RESPONSIVE */\n' +
      '@media(max-width:980px){\n' +
      '.hero-in{grid-template-columns:1fr;gap:36px}.hero-visual{max-width:480px}\n' +
      '.grid-4{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:1fr}\n' +
      '.about{grid-template-columns:1fr;gap:28px}.contact{grid-template-columns:1fr}\n' +
      '.footer-in{grid-template-columns:1fr 1fr}.f-brand{grid-column:1/-1}\n' +
      '.nav-links{position:fixed;inset:72px 12px auto;flex-direction:column;gap:0;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:10px;opacity:0;pointer-events:none;transform:translateY(-8px);transition:.2s}\n' +
      '.nav-links.open{opacity:1;pointer-events:auto;transform:none}\n' +
      '.nav-links a{padding:12px 14px;border-radius:10px}.nav-links a:hover{background:var(--card)}\n' +
      '.nav-toggle{display:grid;place-items:center}\n' +
      '}\n' +
      '@media(max-width:720px){\n' +
      '.section{padding:56px 0}.hero{padding:44px 0 30px}\n' +
      '.gallery{grid-template-columns:1fr 1fr}.pricing{grid-template-columns:1fr}\n' +
      '.float-card{display:none}.stats{gap:20px}.stat strong{font-size:1.25rem}\n' +
      '.nav-cta{display:none}.cta-in{padding:38px 22px}\n' +
      '.footer-in{grid-template-columns:1fr}.f-bottom{flex-direction:column}\n' +
      '}\n' +
      '@media(max-width:480px){.gallery{grid-template-columns:1fr}.grid-4{grid-template-columns:1fr}.hero-cta .btn{width:100%}}\n';
  }

  function buildJs() {
    return '(function(){\n' +
      '  "use strict";\n' +
      '  var nav=document.getElementById("nav");\n' +
      '  var toggle=document.getElementById("navToggle");\n' +
      '  var links=document.getElementById("navLinks");\n' +
      '  if(toggle&&links){toggle.addEventListener("click",function(){links.classList.toggle("open");});}\n' +
      '  if(links){links.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){links.classList.remove("open");});});}\n' +
      '  function onScroll(){if(nav){nav.classList.toggle("scrolled",window.scrollY>18);} var t=document.getElementById("toTop"); if(t){t.classList.toggle("show",window.scrollY>500);}}\n' +
      '  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();\n' +
      '  var top=document.getElementById("toTop"); if(top){top.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});}\n' +
      '  var root=document.documentElement;\n' +
      '  var themeBtn=document.getElementById("themeBtn");\n' +
      '  try{var saved=localStorage.getItem("theme"); if(saved){root.setAttribute("data-theme",saved);}}catch(e){}\n' +
      '  function syncTheme(){if(themeBtn){themeBtn.textContent=root.getAttribute("data-theme")==="light"?"🌙":"☀️";}}\n' +
      '  syncTheme();\n' +
      '  if(themeBtn){themeBtn.addEventListener("click",function(){var next=root.getAttribute("data-theme")==="light"?"dark":"light"; root.setAttribute("data-theme",next); try{localStorage.setItem("theme",next);}catch(e){} syncTheme();});}\n' +
      '  if("IntersectionObserver" in window){\n' +
      '    var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in"); io.unobserve(en.target);}});},{threshold:.12});\n' +
      '    document.querySelectorAll(".reveal").forEach(function(el){io.observe(el);});\n' +
      '  } else { document.querySelectorAll(".reveal").forEach(function(el){el.classList.add("in");}); }\n' +
      '  var form=document.getElementById("contactForm");\n' +
      '  if(form){form.addEventListener("submit",function(e){e.preventDefault(); var data=new FormData(form);\n' +
      '    var msg="Halo, saya "+data.get("nama")+".%0AWA: "+data.get("wa")+"%0A%0A"+data.get("pesan");\n' +
      '    var wa=form.getAttribute("data-wa")||"";\n' +
      '    window.open("https://wa.me/"+wa+"?text="+msg,"_blank");\n' +
      '  });}\n' +
      '  var y=document.getElementById("year"); if(y){y.textContent=new Date().getFullYear();}\n' +
      '})();\n';
  }

  /**
   * Buat website dari prompt tanpa AI (offline).
   */
  function fromPrompt(prompt, opts) {
    opts = opts || {};
    const preset = detect(prompt);
    const copy = JSON.parse(JSON.stringify(preset));
    if (opts.theme) copy.theme = Object.assign({}, copy.theme, opts.theme);
    // coba ambil nama brand dari prompt (kata setelah "bernama"/"untuk")
    const m = String(prompt || '').match(/(?:bernama|nama|untuk|brand)\s+["“']?([A-Z][\w&.\- ]{2,34})/i);
    if (m && m[1]) {
      let brand = m[1].trim()
        .split(/\s+(?:dengan|yang|untuk|dan|di|bertema|bergaya|tema|warna|pakai|menggunakan)\b/i)[0]
        .replace(/[,.;:]+$/, '')
        .trim();
      if (brand.length >= 3) copy.brand = brand;
    }
    if (opts.brand) copy.brand = opts.brand;
    const built = buildSite(copy, opts);
    built.description = (opts.language === 'en')
      ? 'Website for ' + copy.brand + ' generated offline by AethelStudio AI.'
      : 'Website ' + copy.label + ' untuk ' + copy.brand + ' — dibuat otomatis oleh AethelStudio AI.';
    built.offline = true;
    return built;
  }

  window.Aethel.gen = {
    presets: PRESETS,
    detect: detect,
    build: buildSite,
    fromPrompt: fromPrompt
  };
})();
