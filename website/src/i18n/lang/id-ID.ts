import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab adalah perangkat data peta: ambil informasi bisnis yang tersedia untuk umum dari peta, tautan ulasan, ID tempat, dan lainnya dengan ekstensi browser dan alat web.",
    "keywords": "data peta, ekstraktor peta google, pencari id tempat, pembuat tautan ulasan, alat peta"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Navigasi utama",
      "mobileLabel": "Navigasi seluler",
      "extension": "Ekstensi",
      "online": "Online",
      "api": "API",
      "apiScraper": "API ekstraksi",
      "apiReviews": "API ulasan",
      "apiPhotos": "API foto",
      "apiMcp": "MCP ekstraksi",
      "apiScraperDesc": "Data bisnis untuk kata kunci dan lokasi apa pun, seperti JSON.",
      "apiReviewsDesc": "Rangkaian ulasan lengkap dengan peringkat dan balasan pemilik.",
      "apiPhotosDesc": "Galeri foto publik sebagai daftar URL siap pakai.",
      "apiMcpDesc": "Data Peta Langsung untuk Claude Code, Cursor dan VS Code.",
      "apiFootNote": "API dan MCP berbagi satu kuota permintaan bulanan.",
      "apiPricing": "API harga",
      "pricing": "Harga",
      "freeTools": "Alat gratis",
      "signIn": "Masuk",
      "dashboard": "Dasbor"
    },
    "footer": {
      "legalLabel": "Legal",
      "resources": "Alat gratis",
      "product": "Produk",
      "rights": "© 2026 MapsGrab. Semua hak dilindungi undang-undang.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Penemu",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Tinjau Pembuat Tautan",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Pemeriksa Email",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Konverter La Panjang ke DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS ke Konverter Desimal",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Generator Kata Kunci Massal",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Gabungkan CSV File Secara Online",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Instal Sekarang",
    "comingSoon": "Segera hadir",
    "themeLabel": "Tema warna",
    "themeLight": "Lampu",
    "themeDark": "Gelap",
    "themeSystem": "Sistem",
    "faqLabel": "Pertanyaan umum",
    "breadcrumbLabel": "Remah roti",
    "languageSwitcherLabel": "Pengalih bahasa",
    "mobileMenuLabel": "Alihkan menu",
    "copied": "Disalin ke papan klip",
    "cancel": "Membatalkan",
    "continue": "Melanjutkan"
  },
  "dashboard": {
    "create": {
      "title": "Pengumpul online",
      "modeLabel": "Modus pencarian",
      "modes": {
        "keywords": "Kata kunci",
        "map": "Peta",
        "regions": "Daerah"
      },
      "keywords": "Kata kunci",
      "placeholder": "kedai kopi di Portland\nrestoran di Austin",
      "count": "{count} / {limit} kata kunci",
      "contacts": "Temukan email dan profil sosial",
      "contactsPaid": "Tersedia dengan paket Online berbayar.",
      "usage": "{used} / {total} catatan bulan ini",
      "reset": "Kuota bulanan direset pada tanggal 1 dalam waktu New York.",
      "loading": "Memuat batas Anda...",
      "optionsFailed": "Tidak dapat memuat batas tugas Anda. Silakan coba lagi.",
      "submit": "Mulai ekstraksi",
      "submitting": "Mengirimkan...",
      "failed": "Pengiriman tugas gagal. Segarkan riwayat sebelum mencoba lagi.",
      "exhausted": "Kuota bulanan Anda telah habis.",
      "invalid": "Masukkan hingga {limit} kata kunci, masing-masing tidak lebih dari 500 karakter.",
      "map": {
        "latitude": "Lintang",
        "longitude": "Garis bujur",
        "radius": "Radius (km)",
        "spacing": "Jarak grid (km)",
        "sampleCount": "{count} / {limit} mencari lokasi",
        "overLimit": "Kurangi radius atau tingkatkan jarak grid agar tetap berada dalam {limit} lokasi pencarian.",
        "chooseCenter": "Pilih pusat di peta atau masukkan koordinat.",
        "mapLabel": "Pilih pusat pencarian di peta",
        "tilesUnavailable": "Ubin peta tidak dapat dimuat. Anda masih dapat memasukkan koordinat.",
        "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap kontributor</a>"
      },
      "region": {
        "baseKeywords": "Kata kunci dasar",
        "basePlaceholder": "kedai kopi\nrestoran",
        "country": "Negara",
        "state": "Negara bagian atau wilayah",
        "citySearch": "Temukan kota",
        "cityPlaceholder": "Ketikkan setidaknya dua huruf",
        "city": "Kota",
        "selectCountry": "Pilih negara",
        "allStates": "Semua negara bagian atau wilayah",
        "selectCity": "Pilih kota",
        "loading": "Memuat lokasi...",
        "loadFailed": "Lokasi tidak dapat dimuat. Silakan coba lagi.",
        "retry": "Mencoba kembali",
        "addCountry": "Tambahkan negara",
        "addState": "Tambahkan negara bagian",
        "addCity": "Tambahkan kota",
        "selectedRegions": "Lokasi yang dipilih",
        "remove": "Hapus {name}",
        "matchMode": "Frasa pencarian",
        "inMode": "Di dalam",
        "nearMode": "Di dekat",
        "generate": "Hasilkan pertanyaan",
        "finalQueries": "Pertanyaan terakhir",
        "finalPlaceholder": "Kueri yang dihasilkan muncul di sini. Anda dapat mengeditnya.",
        "attribution": "Data lokasi: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Dasbor | MapsGrab",
      "description": "Kelola MapsGrab ekspor, API dan langganan Anda dalam satu ruang kerja."
    },
    "shell": {
      "loading": "Memuat ruang kerja Anda...",
      "retry": "Mencoba kembali",
      "navHistory": "Pengumpul online",
      "navApi": "API manajemen",
      "navSubscriptions": "Langganan",
      "openMenu": "Buka menu ruang kerja",
      "closeMenu": "Tutup menu ruang kerja"
    },
    "account": {
      "menuButtonLabel": "Buka menu akun",
      "menuLabel": "Menu akun",
      "logout": "Keluar"
    },
    "history": {
      "title": "Riwayat ekspor online",
      "description": "Tugas yang Anda jalankan di Scraper Online, yang terbaru terlebih dahulu. Waktu ditampilkan dalam Waktu Bagian Timur (New York).",
      "refresh": "Menyegarkan",
      "loading": "Memuat ekspor Anda...",
      "loadFailed": "Gagal memuat riwayat ekspor Anda.",
      "retry": "Mencoba kembali",
      "emptyTitle": "Belum ada ekspor",
      "emptyHint": "Jalankan tugas di Scraper Online dan tugas itu akan muncul di sini.",
      "columns": {
        "taskNo": "Pekerjaan",
        "createdAt": "Dibuat (ET)",
        "samples": "Pencarian",
        "processed": "Diproses",
        "records": "Catatan",
        "status": "Status"
      },
      "status": {
        "queued": "Mengantri",
        "collecting": "Mengumpulkan",
        "publishing": "Mempersiapkan CSV",
        "completed": "Selesai",
        "partial": "Keberhasilan parsial",
        "failed": "Gagal"
      },
      "timezone": "ET",
      "pagination": {
        "previous": "Sebelumnya",
        "next": "Berikutnya",
        "summary": "{from}–{to} dari {total}"
      },
      "detail": {
        "show": "Detail",
        "hide": "Sembunyikan detailnya",
        "loading": "Memuat penelusuran...",
        "loadFailed": "Gagal memuat penelusuran untuk tugas ini.",
        "keyword": "Kata kunci",
        "records": "Catatan",
        "runNo": "Berlari",
        "startedAt": "Dimulai (ET)",
        "finishedAt": "Selesai (ET)",
        "contacts": "Email dan profil sosial",
        "contactsEnabled": "Diaktifkan untuk tugas ini",
        "contactsDisabled": "Mati untuk tugas ini",
        "completed": "Selesai",
        "pending": "Tertunda",
        "viewport": "{lat}, {lng} · perbesar {zoom}"
      },
      "downloadCsv": "Unduh CSV",
      "noFile": "Tidak CSV",
      "errors": {
        "31301": "Tidak dapat mengumpulkan penelusuran ini.",
        "31302": "Beberapa hasil tidak tersedia. Baris yang dikirim dipertahankan.",
        "31303": "Kolektor sedang sibuk. Coba lagi.",
        "31304": "Tidak dapat memublikasikan ekspor ini."
      },
      "errorFailed": "Tidak dapat menyelesaikan penelusuran ini.",
      "downloading": "Mempersiapkan...",
      "downloadUnavailable": "Tidak ada CSV yang dapat diunduh. File tersebut mungkin telah kedaluwarsa.",
      "downloadFailed": "Pengunduhan tidak dapat dimulai. Silakan coba lagi.",
      "signInPrompt": "Masuk untuk melihat riwayat ekspor online Anda.",
      "signInCta": "Masuk",
      "unreachable": "Tidak dapat mencapai MapsGrab saat ini."
    },
    "api": {
      "title": "API manajemen",
      "description": "Kelola kunci API Anda, tunjangan permintaan bulanan, dan aplikasi AI yang terhubung.",
      "docsLink": "Lihat API produk",
      "signInPrompt": "Masuk untuk mengelola akses API Anda.",
      "signInCta": "Masuk",
      "unreachable": "Tidak dapat mencapai MapsGrab saat ini.",
      "loading": "Memuat akses API Anda...",
      "loadFailed": "Tidak dapat memuat akses API Anda. Silakan coba lagi.",
      "retry": "Mencoba kembali",
      "refresh": "Menyegarkan",
      "keyTitle": "Kunci API",
      "keyEmpty": "Anda belum membuat kunci API.",
      "generateKey": "Hasilkan kunci API",
      "rotateKey": "Ganti kunci API",
      "generatingKey": "Menghasilkan...",
      "keyOnce": "Salin kunci ini sekarang. Anda tidak akan dapat melihatnya lagi setelah meninggalkan atau menyegarkan halaman ini.",
      "keyCreated": "Dibuat",
      "rotateTitle": "Ganti kunci API Anda?",
      "rotateMessage": "Kunci Anda saat ini akan segera berhenti berfungsi. Perbarui aplikasi apa pun yang menggunakannya dengan kunci baru.",
      "cancel": "Membatalkan",
      "copyKey": "Salin kunci API",
      "copied": "Disalin",
      "copyFailed": "Tidak dapat menyalin. Pilih teks dan salin secara manual.",
      "keyFailed": "Tidak dapat membuat kunci API. Silakan coba lagi.",
      "usageTitle": "Penggunaan API bulanan",
      "usageValue": "{used} / {total} permintaan",
      "usagePeriod": "Periode: {period}",
      "quotaExhausted": "Tunjangan permintaan bulanan Anda telah habis.",
      "quotaReset": "Direset pada tanggal 1 setiap bulan dalam waktu New York. API dan MCP berbagi tunjangan ini.",
      "planTitle": "API rencana",
      "managePlan": "Kelola langganan",
      "connectionsTitle": "Alamat koneksi",
      "apiUrl": "API basis URL",
      "mcpUrl": "MCP pelayan URL",
      "mcpHint": "Tambahkan URL ini di klien MCP Anda. Masuk dan setujui koneksi ketika membuka situs web ini.",
      "mcpUnavailable": "Alamat koneksi MCP belum tersedia.",
      "copyUrl": "Salin URL",
      "grants": {
        "title": "Aplikasi yang terhubung",
        "description": "Aplikasi yang Anda izinkan untuk mencari bisnis dan membaca ulasan serta foto publik menggunakan uang saku API Anda.",
        "loading": "Memuat aplikasi yang terhubung...",
        "empty": "Tidak ada aplikasi yang terhubung.",
        "loadFailed": "Tidak dapat memuat aplikasi yang terhubung. Silakan coba lagi.",
        "selfDeclared": "Nama yang diberikan aplikasi itu sendiri: {name}",
        "createdLabel": "Terhubung (ET)",
        "refreshedLabel": "Terakhir disegarkan (ET)",
        "notRefreshed": "Belum",
        "revoke": "Memutuskan",
        "revokeTitle": "Putuskan sambungan aplikasi ini?",
        "revokeMessage": "{host} akan segera kehilangan akses dan memerlukan persetujuan Anda untuk terhubung kembali.",
        "revokeFailed": "Tidak dapat memutuskan sambungan aplikasi ini. Silakan coba lagi.",
        "paginationLabel": "Halaman aplikasi yang terhubung",
        "pageOf": "Halaman {page} dari {pages}"
      }
    },
    "subscriptions": {
      "title": "Langganan",
      "description": "Paket dan status pembaruan untuk Scraper Online, ekstensi browser, dan API. Beli atau tingkatkan di halaman Harga.",
      "loading": "Memuat langganan Anda...",
      "loadFailed": "Gagal memuat langganan Anda.",
      "retry": "Mencoba kembali",
      "lines": {
        "online": "Pengumpul online",
        "extension": "Ekstensi Peramban",
        "api": "API"
      },
      "planLabel": "Rencana",
      "expiresLabel": "Memperbarui/kedaluwarsa",
      "noExpiry": "Tidak ada kadaluwarsa",
      "free": "Bebas",
      "unavailable": "Untuk sementara tidak tersedia",
      "autoRenewOn": "Perpanjangan otomatis aktif",
      "autoRenewOff": "Perpanjangan otomatis nonaktif",
      "subscribeCta": "Pilih rencana",
      "manageSubscription": "Kelola langganan",
      "managingSubscription": "Pembukaan...",
      "signInPrompt": "Masuk untuk melihat langganan Anda.",
      "signInCta": "Masuk",
      "unreachable": "Tidak dapat mencapai MapsGrab saat ini."
    },
    "cancelGuide": {
      "title": "Kelola langganan Anda di penyedia pembayaran",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Masuk ke PayPal dan buka Pengaturan.",
            "Buka Pembayaran, lalu Pembayaran Otomatis.",
            "Pilih MapsGrab dan pilih Batal."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Buka tautan Portal Pelanggan dari email pembelian Anda.",
            "Masuk dan pilih langganan MapsGrab Anda.",
            "Pilih Batal."
          ]
        }
      ],
      "closeLabel": "Menutup"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Ambil Google Maps Data Bisnis ke CSV & JSON",
        "description": "MapsGrab adalah ekstensi browser dan perangkat web yang mengumpulkan informasi bisnis yang tersedia untuk umum dari Google Maps — nama, telepon, ulasan, foto, email — dan mengekspornya ke CSV atau JSON."
      },
      "hero": {
        "announce": {
          "badge": "Baru",
          "text": "MCP server untuk agen AI"
        },
        "title": {
          "firstLine": "Ambil data Google Maps",
          "secondLine": "dengan",
          "accent": "satu klik",
          "end": "."
        },
        "lead": "Kumpulkan data bisnis publik dari Google Maps — nama, telepon, situs web, ulasan, foto, dan email — dan ekspor bersih CSV atau JSON dalam hitungan detik.",
        "search": {
          "label": "Kata kunci pencarian",
          "typing": [
            "kedai kopi di Portland",
            "dokter gigi di Austin, TX",
            "tukang ledeng dekat Chicago",
            "studio yoga di Brooklyn",
            "hotel di Pantai Miami"
          ],
          "submit": "Pratinjau hasil",
          "loading": "Mencari…",
          "suggestLabel": "Mencoba",
          "suggestions": [
            "kedai kopi di Portland",
            "dokter gigi di Austin, TX",
            "tukang ledeng dekat Chicago"
          ]
        },
        "trust": [
          "Tidak diperlukan kartu kredit",
          "{records} catatan gratis / bulan",
          "CSV & JSON ekspor"
        ],
        "dashboard": "Buka Pengumpul data Online",
        "theater": {
          "panelLabel": "MapsGrab pratinjau panel",
          "extensionActive": "MapsGrab ekstensi aktif",
          "mapFilters": [
            "Buka sekarang",
            "Nilai tertinggi",
            "Harga"
          ],
          "live": "Hidup",
          "done": "Selesai",
          "start": "Mulai ekstraksi",
          "pause": "Berhenti sebentar",
          "extracting": "Mengekstraksi {count}…",
          "finished": "Selesai · {count} tempat",
          "kpis": {
            "phones": "telepon",
            "emails": "email",
            "websites": "situs web"
          },
          "export": "Daftar Detail Ekspor - {count} (.CSV)",
          "exportSaved": "Ekspor disimpan",
          "emailFound": "Email ditemukan",
          "averageRating": "Peringkat rata-rata",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} ulasan"
        },
        "preview": {
          "title": "Hasil",
          "count": "{count} bisnis di halaman hasil pertama",
          "columns": {
            "name": "Nama",
            "address": "Alamat",
            "category": "Kategori",
            "rating": "Peringkat",
            "reviews": "Ulasan",
            "phone": "Telepon"
          },
          "locked": "Masuk dan kirimkan kata kunci Anda di Scraper Online untuk mengumpulkan dan mengekspor hasil.",
          "signIn": "Masuk untuk memulai tugas penuh",
          "failed": "Tidak dapat memuat pratinjau. Silakan coba lagi.",
          "empty": "Tidak ada bisnis yang ditemukan pada halaman hasil pertama."
        }
      },
      "facts": {
        "caption": "MapsGrab berdasarkan angka",
        "items": [
          {
            "value": 36,
            "label": "kolom data per bisnis"
          },
          {
            "value": 11,
            "label": "bidang ulasan, termasuk balasan pemilik"
          },
          {
            "value": 6,
            "label": "jejaring sosial cocok per situs web"
          },
          {
            "value": "freeRecords",
            "label": "catatan gratis, setiap bulan"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "cara menjalankannya: Ekstensi, Online, API — plus MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Bagaimana cara kerjanya",
          "title": {
            "lead": "Dari penelusuran peta hingga ",
            "accent": "spreadsheet",
            "tail": " dalam tiga langkah"
          },
          "lead": "Tanpa kode dan tanpa salin-tempel. MapsGrab membaca apa yang Google Maps sudah tunjukkan kepada Anda dan mengubahnya menjadi baris terstruktur."
        },
        "steps": [
          {
            "title": "Cari Google Maps",
            "body": "Buka Google Maps dan cari jenis dan lokasi bisnis apa pun — persis seperti yang biasa Anda lakukan."
          },
          {
            "title": "Mulai ekstraksi",
            "body": "Klik {action}. MapsGrab menggulirkan hasil, mengumpulkan daftar dan, bila diaktifkan, memperkaya kontak.",
            "action": "Mulai ekstraksi"
          },
          {
            "title": "Ekspor ke mana saja",
            "body": "Unduh CSV atau JSON dengan kolom yang Anda pilih — ulasan dan foto disimpan dalam filenya sendiri, siap untuk Excel atau CRM Anda."
          }
        ],
        "searchSample": "toko roti di Seattle",
        "columnsUnit": "kolom",
        "reviewsFile": "ulasan"
      },
      "products": {
        "head": {
          "kicker": "Produk",
          "title": {
            "lead": "Tiga cara untuk ",
            "accent": "mengambil",
            "tail": " data Maps."
          },
          "lead": "Pilih ekstensi browser, Pengumpul online berbasis cloud, atau API. Ekstensi ini berfungsi di dalam browser Anda sendiri; Scraper Online dan API berbagi satu mesin cloud."
        },
        "cards": {
          "extension": {
            "badge": "Ekstensi peramban",
            "title": "Ambil data sambil menjelajah Google Maps",
            "body": "Ekstrak data bisnis, ulasan, dan foto dari halaman Maps yang Anda buka, lalu ekspor semuanya secara lokal. Tepi, Firefox dan Chromium.",
            "link": "Jelajahi ekstensinya"
          },
          "online": {
            "badge": "Pengumpul online",
            "title": "Awan berjalan. Tidak ada yang perlu dipasang.",
            "body": "Tempelkan kata kunci, kumpulkan detail bisnis di cloud, dan unduh satu kolom 37 CSV yang telah dihapus duplikatnya per tugas.",
            "link": "Jelajahi Scraper Online"
          },
          "api": {
            "badge": "API",
            "title": "Bersihkan JSON lebih dari HTTP",
            "body": "Data dan ulasan bisnis untuk aplikasi Anda sendiri — satu kunci API.",
            "link": "Jelajahi API"
          },
          "mcp": {
            "badge": "MCP pelayan",
            "title": "Data Live Maps untuk agen AI Anda",
            "body": "Telusuri dan ulas sebagai alat MCP untuk Claude Code, Cursor, VS Code, dan Codex.",
            "link": "Jelajahi server MCP"
          }
        },
        "extracting": "Mengekstraksi {count}…",
        "queue": {
          "rows": "{count} baris",
          "processing": "Pengolahan"
        },
        "chat": {
          "prompt": "Temukan dokter gigi di Austin dengan peringkat 4.5+ melalui situs web",
          "answer": "Ditemukan {count} kecocokan. Tiga teratas:"
        }
      },
      "fields": {
        "head": {
          "kicker": "Datanya",
          "title": {
            "lead": "kolom 36. ",
            "accent": "Semuanya",
            "tail": " bermanfaat."
          },
          "lead": "Ekstensi mengekspor satu skema dari hasil pencarian dan halaman bisnis — detail kontak, lokasi, profil, peringkat, dan setiap pengidentifikasi yang Anda perlukan untuk mencocokkan catatan nanti."
        },
        "filtersLabel": "Kelompok lapangan",
        "all": "Semua",
        "groups": {
          "contact": {
            "filter": "Kontak",
            "label": "Kontak"
          },
          "location": {
            "filter": "Lokasi",
            "label": "Lokasi"
          },
          "profile": {
            "filter": "Profil",
            "label": "Profil bisnis"
          },
          "reviews": {
            "filter": "Peringkat",
            "label": "Peringkat & ulasan"
          },
          "ids": {
            "filter": "ID & tautan",
            "label": "ID & tautan"
          }
        },
        "sampleLabel": "Nilai sampel",
        "emptySample": "(kosong)",
        "descriptions": {
          "Name": "Nama bisnis persis seperti yang ditunjukkan pada daftar.",
          "Description": "Deskripsi singkat dari profil bisnis.",
          "Fulladdress": "Alamat jalan yang lengkap dan diformat.",
          "Street": "Garis jalan alamatnya.",
          "Municipality": "Kota atau lokalitas.",
          "Categories": "Setiap kategori ditugaskan untuk bisnis.",
          "About": "Atribut dari tab Tentang.",
          "Plus Code": "Kolom dicadangkan untuk Kode Lokasi Terbuka — diekspor kosong untuk saat ini.",
          "Time Zone": "Zona waktu IANA dari lokasi tersebut.",
          "Price": "Tingkat harga ditampilkan pada daftar.",
          "Note": "Catatan atau sorotan pedagang.",
          "Amenities": "Fasilitas dan pilihan layanan.",
          "Hotel Class": "Kelas bintang untuk listing penginapan.",
          "Phone": "Nomor telepon utama ditampilkan pada daftar.",
          "Phones": "Setiap nomor telepon ditemukan untuk bisnis.",
          "Claimed": "Apakah pemilik telah mengklaim profil tersebut.",
          "Owner": "Nama pemilik di profil.",
          "Owner Id": "ID Kontributor akun pemilik.",
          "Owner Link": "Tautan ke halaman kontributor pemilik.",
          "Email": "Alamat email ditemukan di situs web bisnis.",
          "Social Medias": "Profil sosial ditautkan dari situs web.",
          "Review Count": "Jumlah total ulasan.",
          "Average Rating": "Peringkat bintang rata-rata.",
          "Review URL": "Tautan langsung ke panel ulasan.",
          "Google Maps URL": "Tautan pendek stabil yang dibuat dari CID.",
          "Google Knowledge URL": "Tautan pencarian panel pengetahuan.",
          "Latitude": "Lintang dalam derajat desimal.",
          "Longitude": "Bujur dalam derajat desimal.",
          "Website": "Situs web resmi dari daftar.",
          "Domain": "Domain situs web yang dapat didaftarkan.",
          "Opening Hours": "Jam mingguan, hari tutup ditandai.",
          "Featured Image": "Foto sampul URL dari daftar.",
          "Cid": "ID Pelanggan — bentuk desimal dari FID.",
          "Fid": "ID Fitur terbuat dari dua bagian heksadesimal.",
          "Place Id": "Stabil Google Place ID.",
          "Kgmid": "ID mesin Grafik Pengetahuan."
        },
        "reviews": {
          "title": "+ 11 kolom ulasan",
          "body": "Diekspor secara terpisah, diberi nomor halaman hingga batas paket Anda."
        },
        "photos": {
          "title": "+ foto URL daftar",
          "body": "Foto album publik URLs per bisnis, Street View difilter."
        },
        "sampleCsv": "Unduh contoh CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Penyuburan",
          "title": {
            "lead": "Dari pin ke seseorang, Anda dapat ",
            "accent": "mengirimkan email",
            "tail": ""
          },
          "lead": "Saat pengayaan aktif, MapsGrab memeriksa situs web resmi setiap bisnis dan mengisi saluran kontak langsung saat melakukan ekstraksi."
        },
        "points": [
          "Alamat email ditemukan di situs web bisnis",
          "Profil sosial: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Aktif secara default pada paket Online berbayar, satu pengaturan di ekstensi",
          "Termasuk dalam respons penelusuran API dengan satu tanda — tidak ada langkah pengayaan terpisah"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Untuk pengembang",
          "title": {
            "lead": "Hubungkan data Maps ke ",
            "accent": "apa pun",
            "tail": " yang Anda buat"
          },
          "lead": "Mesin cloud di balik Pengumpul online, diekspos sebagai server HTTP API dan MCP. Terstruktur JSON, satu kunci, tidak ada HTML untuk diurai."
        },
        "listLabel": "Produk pengembang",
        "items": {
          "search": {
            "title": "API ekstraksi",
            "description": "Bisnis untuk kata kunci dan lokasi apa pun"
          },
          "reviews": {
            "title": "API ulasan",
            "description": "Peringkat, teks, dan balasan pemilik"
          },
          "photos": {
            "title": "API foto",
            "description": "Foto publik URLs per bisnis"
          },
          "mcp": {
            "title": "MCP pelayan",
            "description": "Alat pencarian dan ulasan untuk klien MCP mana pun"
          }
        },
        "langLabel": "Bahasa",
        "copyLabel": "Salin permintaan",
        "sending": "Mengirim permintaan…",
        "response": "Respons · 200 Oke · {ms} ms",
        "toolCall": "Panggilan alat · {tool} · 200 Oke",
        "exploreApi": "Jelajahi API",
        "apiPricing": "API harga",
        "worksWith": "Bekerja dengan alat yang sudah Anda gunakan",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP bundel"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Kasus penggunaan",
          "title": {
            "lead": "Dibuat untuk pekerjaan ",
            "accent": "setelah",
            "tail": " pencarian"
          }
        },
        "cards": [
          {
            "label": "Generasi pemimpin",
            "title": "Daftar prospek lokal",
            "body": "Telusuri kategori dan kota, lalu ekspor seluruh halaman hasil — termasuk telepon, situs web, dan email — ke dalam satu spreadsheet."
          },
          {
            "label": "SEO lokal",
            "title": "Tolok ukur pesaing",
            "body": "Tarik peringkat dan jumlah ulasan untuk setiap pesaing di suatu area dalam satu kesempatan, dan buat laporan langsung dari ekspor."
          },
          {
            "label": "Riset pasar",
            "title": "Kumpulan data lokasi",
            "body": "Kumpulkan ID Tempat dan koordinat untuk setiap lokasi cabang atau pesaing, siap untuk alat pemetaan dan perutean Anda."
          }
        ],
        "leadTags": [
          "e-mail",
          "telepon",
          "e-mail",
          "lokasi"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Harga",
          "title": {
            "lead": "Mulai gratis. ",
            "accent": "Skalakan",
            "tail": " saat hasilnya terbayar."
          },
          "lead": "Setiap produk memiliki tingkat gratis tanpa batas waktu. Tingkatkan hanya permukaan yang benar-benar Anda gunakan."
        },
        "lines": {
          "extension": {
            "title": "Ekstensi Peramban",
            "billing": "Bulanan",
            "link": "Lihat rencana perluasan"
          },
          "online": {
            "title": "Pengumpul online",
            "billing": "Satu kali",
            "link": "Lihat Paket online"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Satu kali",
            "link": "Lihat rencana API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Alat gratis",
          "title": {
            "lead": "Alat kecil untuk ",
            "accent": "pengguna mahir",
            "tail": " Maps"
          },
          "lead": "Tujuh utilitas yang berjalan sepenuhnya di browser Anda — apa yang Anda tempel tidak akan pernah keluar dari perangkat Anda."
        },
        "descriptions": {
          "place-id-finder": "Tempelkan tempat di Maps URL dan bacakan Place ID, CID, dan FID.",
          "review-link-generator": "Dapatkan tautan “tulis ulasan” langsung untuk bisnis apa pun.",
          "email-checker": "Lihat secara instan apakah format email valid — dengan petunjuk kesalahan ketik.",
          "lat-long-to-dms": "Koordinat desimal ke derajat, menit dan detik.",
          "dms-to-dd": "DMS koordinat kembali ke derajat desimal bersih.",
          "bulk-keywords-generator": "Setiap kombinasi “kata kunci + lokasi”, siap ditempel.",
          "merge-csv": "Gabungkan CSV ekspor ke dalam satu file, disejajarkan berdasarkan header."
        },
        "more": "Lebih banyak alat sedang dalam proses"
      },
      "faq": {
        "kicker": "Pertanyaan umum",
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "lead": "Jawaban singkatnya. Yang lainnya, dukungan hanya berjarak satu email.",
        "contact": "Hubungi dukungan",
        "items": [
          {
            "question": "Apakah MapsGrab gratis untuk digunakan?",
            "answer": "Ya. Ekstensi ini berfungsi tanpa akun dan mencakup kuota catatan bulanan gratis. Paket berbayar di halaman Harga menaikkan batas saat Anda membutuhkan lebih banyak."
          },
          {
            "question": "Browser mana yang didukung?",
            "answer": "Unduh MapsGrab dari halaman Ekstensi. Chrome, Edge dan Brave memuat ZIP yang belum dibongkar; Firefox menggunakan add-on sementara terpisah yang harus dimuat ulang setelah restart. Halaman ini mencakup petunjuk instalasi dan pembaruan."
          },
          {
            "question": "Dari mana data tersebut berasal, dan apakah pengumpulannya sah?",
            "answer": "MapsGrab hanya mengumpulkan informasi yang ditampilkan secara publik di halaman Google Maps yang Anda kunjungi — detail yang sama yang dapat dibaca oleh pengunjung mana pun. Kami tidak mengakses akun pribadi, konten yang dilindungi undang-undang, atau data non-publik."
          },
          {
            "question": "Apakah saya perlu menginstal sesuatu untuk alat web?",
            "answer": "Tidak. Alat web gratis berjalan sepenuhnya di browser Anda — masukan Anda tidak pernah keluar dari perangkat Anda."
          },
          {
            "question": "Format apa yang dapat saya ekspor?",
            "answer": "Ekspor datang sebagai CSV atau JSON dengan pilihan bidang yang Anda pilih, dihapus duplikatnya sebesar Place ID."
          },
          {
            "question": "Apakah MapsGrab melihat data yang saya kumpulkan?",
            "answer": "Pengaturan dan hasil Anda disimpan secara lokal di browser Anda. Server kami hanya menangani konfigurasi jarak jauh, status akun dan kuota, pengayaan email/sosial opsional, dan log penggunaan minimal."
          }
        ]
      },
      "cta": {
        "kicker": "Mulailah",
        "title": {
          "lead": "Mulai ambil dalam ",
          "accent": "menit",
          "tail": ""
        },
        "lead": "Instal ekstensinya, buka Google Maps, cari, dan ekspor daftar pertama Anda — tidak perlu akun.",
        "install": "Instal MapsGrab gratis",
        "online": "Coba Pengumpul data Online",
        "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab untuk Chrome, Edge & Firefox — Google Maps Ekstensi Ekstraktor",
        "description": "Ekstrak 36 kolom data bisnis, ulasan, dan foto dari Google Maps, perkaya catatan dengan email dan tautan sosial, jalankan tugas batch, dan ekspor ke CSV atau JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Unduh untuk Chrome, Tepi & Firefox"
        },
        "title": {
          "lead": "Ekstraktor Google Maps untuk ",
          "accent": "browser Anda",
          "tail": ""
        },
        "lead": "Buka halaman pencarian atau bisnis apa pun Google Maps dan ambil apa yang ditampilkan secara publik di sana — data bisnis, ulasan, foto, dan detail kontak. Semuanya diekspor ke CSV atau JSON, langsung dari browser Anda.",
        "downloadCta": "Unduh untuk Chrome & Edge",
        "installCta": "Panduan instalasi",
        "meta": [
          "Tidak diperlukan akun",
          "1,000 catatan gratis / bulan",
          "Ekspor tetap ada di mesin Anda"
        ],
        "theater": {
          "panelLabel": "MapsGrab pratinjau panel",
          "extensionActive": "MapsGrab aktif di halaman ini",
          "dock": "Dermaga kiri/kanan",
          "filters": [
            "Buka sekarang",
            "Nilai tertinggi",
            "Harga"
          ],
          "open": "Membuka",
          "closes": "Menutup {time}",
          "endOfList": "Anda telah mencapai akhir daftar.",
          "start": "Mulai ekstraksi",
          "extracting": "Mengekstraksi {count}…",
          "pause": "Berhenti sebentar",
          "complete": "Ekstrak selesai.",
          "reset": "Mengatur ulang",
          "kpis": {
            "phones": "telepon",
            "websites": "situs web",
            "emails": "email"
          },
          "exportCta": "Daftar Detail Ekspor - {count} (.CSV)",
          "saved": "Disimpan ke Unduhan",
          "scrollChip": {
            "label": "Gulir otomatis",
            "value": "Kecepatan manusia, 5–10 s"
          },
          "dedupeChip": {
            "label": "Dihapus duplikatnya",
            "value": "oleh Place ID"
          }
        }
      },
      "facts": {
        "caption": "Sekilas tentang ekstensi",
        "items": [
          {
            "value": 36,
            "label": "kolom per bisnis, dari nama hingga Place ID"
          },
          {
            "value": 11,
            "label": "kolom ulasan, termasuk balasan pemilik"
          },
          {
            "value": 6,
            "label": "jejaring sosial cocok per situs web"
          },
          {
            "value": 1000,
            "label": "catatan gratis setiap bulan, tidak perlu akun"
          },
          {
            "value": 500,
            "label": "kata kunci atau ulasan URLs per tugas batch"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Tempat kerjanya",
          "title": {
            "lead": "Satu panel untuk setiap ",
            "accent": "tampilan Maps",
            "tail": ""
          },
          "lead": "Panel MapsGrab muncul tepat di Google Maps. Hasil pencarian, halaman bisnis, dan daftar tersimpan masing-masing mendapatkan mode ekstraksi yang tepat — tanpa salin-tempel, tanpa juggling tab."
        },
        "search": {
          "title": "Hasil pencarian",
          "description": "Tekan Mulai Mengekstrak pada pencarian apa pun. MapsGrab menggulir daftar hasil dengan kecepatan manusia dan mengumpulkan setiap daftar saat dimuat."
        },
        "place": {
          "title": "Halaman bisnis",
          "description": "Pada halaman bisnis, tab Ulasan & Foto menelusuri ulasan dan album foto — ulasan diekspor dengan kolom 11, foto sebagai daftar URL.",
          "tabs": [
            "Ringkasan",
            "Ulasan & Foto"
          ],
          "reviewsCta": "Mulai Mengekstraksi Ulasan",
          "photosCta": "Mulai Mengekstrak Foto",
          "reviewsCount": "{count} ulasan",
          "photosCount": "{count} foto"
        },
        "saved": {
          "title": "Daftar yang disimpan",
          "description": "Buka daftar tersimpan dan tekan Mulai sekali. MapsGrab membuka setiap tempat secara bergantian dan mengumpulkannya — tanpa klik per item.",
          "listName": "Favorit · {count} tempat"
        }
      },
      "features": {
        "head": {
          "kicker": "Fitur",
          "title": {
            "lead": "Segala sesuatu yang ditampilkan laman Maps, ",
            "accent": "terstruktur",
            "tail": ""
          },
          "lead": "Satu skema ekstraksi di seluruh hasil pencarian dan halaman bisnis, disesuaikan dengan antarmuka Google Maps saat ini dan diperbarui dari jarak jauh ketika Google berubah."
        },
        "tabsLabel": "Fitur ekstensi",
        "tabs": [
          {
            "id": "business",
            "title": "Data bisnis",
            "description": "36 kolom per bisnis, diambil saat daftar bergulir."
          },
          {
            "id": "reviews",
            "title": "Ulasan",
            "description": "Ulasan dengan balasan pemilik, ditampilkan secara otomatis."
          },
          {
            "id": "photos",
            "title": "Foto",
            "description": "Foto album sebagai daftar URL siap pakai."
          },
          {
            "id": "enrichment",
            "title": "Email & pengayaan sosial",
            "description": "Saluran kontak langsung dari situs resmi."
          },
          {
            "id": "batch",
            "title": "Tugas batch",
            "description": "Antrean kata kunci atau ulasan URLs, berjalan item demi item."
          },
          {
            "id": "export",
            "title": "Ekspor",
            "description": "CSV atau JSON, disimpan langsung ke mesin Anda."
          }
        ],
        "business": {
          "claimed": "Diklaim",
          "fields": {
            "phone": "Telepon",
            "website": "Situs web",
            "rating": "Peringkat rata-rata",
            "hours": "Jam buka",
            "timeZone": "Zona waktu",
            "coordinates": "Koordinat",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} ulasan",
          "columns": "{count} kolom per bisnis",
          "reserved": "Kode Plus dicadangkan",
          "more": "+{count} lebih banyak"
        },
        "reviews": {
          "title": "Ulasan",
          "columns": "{count} kolom",
          "ownerReply": "Respon dari pemiliknya",
          "loading": "Memuat halaman ulasan berikutnya"
        },
        "photos": {
          "streetView": "Street View · difilter"
        },
        "enrichment": {
          "website": "Situs web resmi",
          "moreNetworks": "X, YouTube dan TikTok juga diperiksa"
        },
        "batch": {
          "complete": "{count} selesai",
          "stuck": "{count} terhenti",
          "total": "{count} jumlah",
          "done": "Selesai · {count}",
          "skipped": "Tidak ada kemajuan untuk 90 s · dilewati",
          "running": "Mengekstraksi…",
          "queued": "Mengantri",
          "autoExport": "Mengekspor secara otomatis ketika tugas selesai"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} baris · {selected} dari {total} kolom dipilih · dihapus duplikatnya oleh Place ID",
          "destinations": [
            {
              "title": "Unduhan",
              "description": "Disimpan oleh browser Anda"
            },
            {
              "title": "Pemilih kolom",
              "description": "Ekspor hanya kolom yang Anda perlukan"
            },
            {
              "title": "Unduh otomatis",
              "description": "Menyimpan segera setelah ekstraksi selesai"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Tugas batch",
          "title": {
            "lead": "Antrian daftarnya. ",
            "accent": "Menjauhlah.",
            "tail": ""
          },
          "lead": "Tempelkan hingga 500 kata kunci atau ulasan URLs ke dalam satu tugas. MapsGrab menelusuri item demi item dengan kemajuan langsung, melewati apa pun yang terhenti, dan mengekspor secara otomatis saat tugas selesai."
        },
        "checks": [
          "Tugas kata kunci menjalankan satu pencarian Maps per kata kunci",
          "Tinjau-URL tugas mengumpulkan ulasan bisnis demi bisnis",
          "Status tugas disimpan ke disk — status tugas diambil kembali setelah browser dimulai ulang",
          "Hingga 150 tugas tersimpan, satu batch dijalankan dalam satu waktu"
        ],
        "mock": {
          "tabs": [
            "Alat Data Kata Kunci Massal",
            "Ekstraktor Ulasan Google Massal"
          ],
          "taskName": "Nama Tugas",
          "taskPlaceholder": "misalnya 100 kata kunci, agensi desain",
          "keywords": "Kata kunci · satu per baris",
          "lineCount": "{count} / {limit}",
          "start": "Mulai ekstraksi",
          "columns": {
            "task": "Nama Tugas",
            "status": "Status",
            "actions": "Tindakan"
          },
          "running": "Berlari",
          "complete": "Menyelesaikan",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} macet",
          "progressExported": "{done} / {total} · diekspor",
          "lines": {
            "run": "mengekstraksi…",
            "done": "menyelesaikan",
            "stuck": "macet · dilewati"
          },
          "toast": "Tugas selesai — diekspor",
          "chip": {
            "label": "Status tugas",
            "value": "Disimpan ke disk"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Lokal-pertama",
          "title": {
            "lead": "Hasil Anda tetap ",
            "accent": "di browser Anda",
            "tail": ""
          },
          "lead": "Pengaturan dan hasil disimpan secara lokal. Server kami hanya menangani konfigurasi jarak jauh, status akun dan kuota, email opsional dan pengayaan sosial, serta log penggunaan minimal."
        },
        "checks": [
          "Ekspor dihasilkan di mesin Anda",
          "Pemilihan kolom dan deduplikasi Place ID dijalankan secara lokal sebelum file disimpan",
          "Konfigurasi jarak jauh menjaga panel tetap terkini ketika Google Maps berubah — tanpa perlu menginstal ulang",
          "Jika ada sesuatu yang tidak dapat dibaca, panel akan menampilkan kesalahan alih-alih gagal secara diam-diam"
        ],
        "diagram": {
          "browser": "Peramban Anda",
          "servers": "MapsGrab server",
          "nodes": {
            "mapsTab": "Google Maps tab",
            "panel": "MapsGrab panel",
            "storage": "Penyimpanan lokal",
            "exports": "Ekspor Anda",
            "config": "Konfigurasi jarak jauh",
            "quota": "Akun & kuota",
            "enrichment": "Penyuburan"
          },
          "flows": {
            "rows": "baris bisnis",
            "rules": "aturan",
            "usage": "penggunaan",
            "websites": "situs web bisnis → email & media sosial"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Memasang",
          "title": {
            "lead": "Instal ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "Unduh ZIP di sini dan ikuti langkah-langkah untuk browser Anda. Chrome, Edge dan Brave memuat folder yang belum dibongkar. Firefox menggunakan add-on sementara terpisah yang harus dimuat ulang setelah restart. Klik gambar mana pun untuk melihatnya dalam ukuran penuh."
        },
        "zip": {
          "title": "Instal langsung (rilis zip)",
          "description": "Pilih ZIP untuk browser Anda. Ekstrak ke folder yang Anda simpan, lalu muat menggunakan panduan di bawah ini. Untuk memperbarui, unduh ZIP baru, ganti file di folder itu dan muat ulang ekstensinya.",
          "button": "Chrome, Tepi & Brave ZIP",
          "firefoxButton": "Firefox ZIP (tambahan sementara)",
          "meta": "Versi {version} · pra-rilis"
        },
        "browserLabel": "Peramban",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Tepi",
            "note": "Edge, Chrome, Brave dan Chromium browser lainnya",
            "steps": [
              {
                "title": "Unduh dan unzip",
                "description": [
                  "Unduh ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Pada Windows, klik kanan dan pilih “Ekstrak Semua”. Pada macOS, klik dua kali. Simpan folder hasil ekstraknya."
                ],
                "shot": "MapsGrab ZIP diunduh dalam Chrome"
              },
              {
                "title": "Buka halaman ekstensi",
                "description": [
                  "Membuka ",
                  {
                    "code": "chrome://extensions"
                  },
                  " dalam Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " di Edge, atau ",
                  {
                    "code": "brave://extensions"
                  },
                  " dalam Brave."
                ],
                "shot": "Halaman pengelolaan ekstensi"
              },
              {
                "title": "Aktifkan mode Pengembang",
                "description": [
                  "Aktifkan mode Pengembang di halaman ekstensi. Pada Chrome, tombolnya ada di kanan atas."
                ],
                "shot": "Mode pengembang diaktifkan dengan tombol Muat yang belum dibongkar terlihat"
              },
              {
                "title": "Muat folder yang belum dibongkar",
                "description": [
                  "Klik \"Load unpacked\" dan pilih folder yang diekstraksi. MapsGrab muncul di daftar ekstensi. Buka pencarian Google Maps untuk menggunakannya."
                ],
                "shot": "Muatan dibongkar dengan kartu MapsGrab ditambahkan"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Tambahan sementara; muat ulang setelah memulai ulang Firefox",
            "steps": [
              {
                "title": "Unduh dan unzip",
                "description": [
                  "Unduh ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Pada Windows, klik kanan dan pilih “Ekstrak Semua”. Pada macOS, klik dua kali. Simpan folder hasil ekstraknya."
                ],
                "shot": "MapsGrab Firefox ZIP diunduh di Firefox"
              },
              {
                "title": "Buka halaman debug",
                "description": [
                  "Navigasi ke ",
                  {
                    "code": "about:debugging"
                  },
                  ", lalu pilih browser Anda di sidebar kiri."
                ],
                "shot": "Firefox halaman debug dengan kontrol tambahan sementara"
              },
              {
                "title": "Muat add-on",
                "description": [
                  "Klik “Muat Pengaya Sementara…” dan pilih ",
                  {
                    "code": "manifest.json"
                  },
                  " di dalam folder yang belum di-zip. Add-on sementara akan dibongkar ketika Firefox dimulai ulang; ulangi langkah ini untuk memuatnya lagi."
                ],
                "shot": "MapsGrab dimuat sebagai ekstensi sementara Firefox dengan skrip latar belakangnya berjalan"
              }
            ]
          }
        ],
        "help": {
          "title": "Masalah instalasi?",
          "description": "Kirimkan kepada kami nama browser dan apa yang Anda lihat — kami akan membuka blokir Anda.",
          "cta": "Hubungi dukungan"
        },
        "notes": {
          "kicker": "Catatan rilis",
          "version": "0.1.0",
          "status": "Pra-rilis",
          "date": "Agustus 2026",
          "items": [
            "Pra-rilis pertama dari ekstensi MapsGrab",
            "Google Maps ekstraksi pencarian dengan pengguliran otomatis dan skema kolom 36",
            "Tinjau dan ekstraksi foto dari halaman bisnis",
            "Pengayaan email dan media sosial per bisnis",
            "Kata kunci kumpulan dan tugas ulasan-URL dengan status tugas pada disk",
            "CSV / JSON ekspor dengan pemilihan bidang dan Place ID deduplikasi",
            "Dibangun untuk Microsoft Edge dan Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Rencana perluasan",
          "title": {
            "lead": "Satu ekstensi, tiga ",
            "accent": "paket",
            "tail": ""
          },
          "lead": "Setiap baris yang dikumpulkan ekstensi — bisnis, ulasan, atau foto — dihitung sebagai satu catatan. Semua paket mencakup ulasan, foto, dan tugas batch; paket berbayar mengekspor semua kolom 36, termasuk email dan pengayaan sosial, dengan volume bulanan yang lebih besar."
        },
        "note": "Penggunaan bulanan direset pada tanggal 1 dalam waktu New York; catatan yang tidak digunakan tidak dapat diputar.",
        "compare": "Bandingkan semua rencana"
      },
      "faq": {
        "kicker": "Pertanyaan umum",
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "lead": "Jawaban singkatnya. Yang lainnya, dukungan hanya berjarak satu email.",
        "contact": "Hubungi dukungan",
        "items": [
          {
            "question": "Apakah ekstensi ini gratis untuk digunakan?",
            "answer": "Ya. Ekstensi ini berfungsi tanpa akun dan mencakup 1,000 catatan setiap bulan. Paket berbayar di halaman Harga menambahkan semua kolom 36 dengan email dan pengayaan media sosial, dan meningkatkan volume bulanan."
          },
          {
            "question": "Browser mana yang didukung?",
            "answer": "Chrome, Edge, Brave dan browser Chromium lainnya memuat ZIP yang belum dibongkar yang diunduh di sini. Firefox memiliki ZIP terpisah untuk pemuatan sementara; muat ulang setelah setiap browser dimulai ulang. Ikuti panduan instalasi di atas."
          },
          {
            "question": "Apakah saya perlu masuk?",
            "answer": "Tidak. Ekstraksi inti berfungsi tanpa akun. Kuota dihitung per akun yang masuk, atau per perangkat browser saat Anda tidak masuk — masuk dengan akun yang memiliki paket sehingga berlaku volume yang lebih tinggi."
          },
          {
            "question": "Apa yang dianggap sebagai rekor?",
            "answer": "Setiap baris yang dikumpulkan ekstensi dihitung sebagai satu catatan: bisnis dari pencarian atau daftar tersimpan, ulasan, atau foto. Pengayaan email dan sosial tidak menambah catatan."
          },
          {
            "question": "Apa yang terjadi jika Google Maps berubah?",
            "answer": "Aturan ekstraksi dikirimkan sebagai konfigurasi jarak jauh, sehingga perbaikan dapat dilakukan di panel tanpa menginstal ulang ekstensi. Jika halaman tidak dapat dibaca, panel akan menampilkan kesalahan alih-alih gagal secara diam-diam."
          },
          {
            "question": "Apakah MapsGrab melihat data yang saya kumpulkan?",
            "answer": "Pengaturan dan hasil Anda disimpan secara lokal di browser Anda. Server kami hanya menangani konfigurasi jarak jauh, status akun dan kuota, email opsional dan pengayaan sosial, serta log penggunaan minimal."
          },
          {
            "question": "Dari mana data tersebut berasal, dan apakah pengumpulannya sah?",
            "answer": "MapsGrab hanya mengumpulkan informasi yang ditampilkan secara publik di halaman Google Maps yang Anda kunjungi — detail yang sama yang dapat dibaca oleh pengunjung mana pun. Kami tidak mengakses akun pribadi, konten yang dilindungi undang-undang, atau data non-publik."
          }
        ]
      },
      "cta": {
        "kicker": "Mulailah",
        "title": {
          "lead": "Dapatkan daftar pertama Anda ",
          "accent": "hari ini",
          "tail": ""
        },
        "lead": "Instal ekstensinya, cari Google Maps, dan ekspor spreadsheet yang bersih — tidak perlu akun.",
        "primary": "Instal MapsGrab",
        "secondary": "Bandingkan rencana",
        "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Akses Situs Web",
        "title": "Masuk untuk menyinkronkan Kredit Anda",
        "trigger": "Masuk",
        "modalTitle": "Masuk untuk melanjutkan",
        "closeLabel": "Menutup",
        "signedInAs": "Masuk sebagai",
        "continueWithGoogle": "Lanjutkan dengan Google",
        "googleLoading": "Membuka Google...",
        "or": "atau",
        "emailLabel": "E-mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Lanjutkan dengan email",
        "sendCode": "Kirim kode",
        "sendingCode": "Mengirim...",
        "sendCodeSuccess": "Kode verifikasi terkirim.",
        "sendAgain": "Kirim lagi",
        "codeLabel": "Kode verifikasi",
        "codePlaceholder": "123456",
        "signIn": "Masuk",
        "termsNotice": "Dengan masuk, Anda menyetujui",
        "termsLink": "Ketentuan",
        "privacyLink": "Kebijakan Privasi",
        "logout": "Keluar",
        "creditsLabel": "Kredit",
        "enterEmailFirst": "Silakan masukkan alamat email Anda terlebih dahulu.",
        "enterEmailAndCode": "Silakan masukkan email dan kode verifikasi.",
        "sendCodeFailed": "Gagal mengirim kode verifikasi.",
        "googleSignInFailed": "Google gagal masuk.",
        "googleClientMissing": "Proses masuk Google tidak dikonfigurasi.",
        "signInFailed": "Gagal masuk."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Pembayaran dibatalkan",
        "canceledMessage": "Pesanan ini tidak dibayar. Anda dapat menutup tab ini dan memilih metode pembayaran lagi di jendela asli.",
        "canceledMetaDescription": "Pembayaran PayPal Anda dibatalkan.",
        "waitingTitle": "Pembayaran dikirimkan",
        "waitingMessage": "Anda dapat kembali ke tab asli. Kami memeriksa PayPal konfirmasi setiap 3 detik, dan hasilnya akan muncul di sini secara otomatis.",
        "confirmedCreditsTitle": "Kredit ditambahkan",
        "confirmedCreditsMessage": "Pembayaran PayPal Anda telah dikonfirmasi dan Kredit telah ditambahkan. Anda dapat menutup tab ini dan melanjutkan di jendela asli.",
        "confirmedSubscriptionTitle": "Langganan diaktifkan",
        "confirmedSubscriptionMessage": "Pembayaran PayPal Anda telah dikonfirmasi dan paket MapsGrab Anda aktif. Anda dapat menutup tab ini dan melanjutkan di jendela asli.",
        "failedTitle": "Pembayaran perlu diperhatikan",
        "failedMessage": "Kami tidak dapat mengonfirmasi pesanan ini secara otomatis. Kembali ke jendela awal atau coba segarkan status pembayaran Anda di sana."
      },
      "checkin": {
        "accountButtonLabel": "Buka menu akun",
        "accountMenuLabel": "Menu akun"
      },
      "creditPurchase": {
        "title": "Dapatkan lebih banyak Kredit",
        "description": "Tambahkan Kredit dan terus gunakan fitur berbayar di ruang kerja ini.",
        "successTitle": "Kredit ditambahkan",
        "successDescription": "Saldo Anda telah disegarkan. Tutup jendela ini dan lanjutkan.",
        "packageEyebrow": "Bayar sesuai kebutuhan",
        "cardNote": "Gunakan Kredit untuk fitur situs web berbayar. Kredit tidak pernah kedaluwarsa.",
        "creditsAmount": "Kredit {credits}",
        "buyNow": "Beli Sekarang",
        "selectPackage": "Memilih",
        "paymentMethodLabel": "Pilih metode pembayaran",
        "paymentTitle": "Pilih metode pembayaran",
        "selectedPackageLabel": "Paket yang dipilih",
        "confirmPurchase": "Lanjutkan ke pembayaran",
        "backToProducts": "Kembali",
        "close": "Menutup",
        "agreementText": "Saya menyetujui ketentuan pembelian, Ketentuan, dan Kebijakan Privasi.",
        "loadingConfigs": "Memuat paket Kredit...",
        "loadFailed": "Gagal memuat paket Kredit. Silakan coba lagi.",
        "noConfigs": "Tidak ada paket Kredit yang tersedia saat ini. Silakan coba lagi nanti.",
        "ready": "Pilih paket Pulsa. Harga ditampilkan dalam USD.",
        "creatingOrder": "Membuat pesanan...",
        "pendingPayment": "Selesaikan pembayaran di tab yang baru dibuka. Kami akan memeriksa hasilnya secara otomatis.",
        "pendingPaymentTitle": "Menunggu pembayaran",
        "cancelPayment": "Batalkan pembayaran",
        "supportMailPrefix": "Laporkan masalah: ",
        "success": "Pembayaran selesai. Kredit tersedia sekarang.",
        "failed": "Pembayaran belum selesai. Anda dapat mencoba lagi atau menutup jendela ini.",
        "successCredits": "+Kredit {credits} ditambahkan",
        "successBalance": "Saldo saat ini: Kredit {balance}",
        "createFailed": "Gagal membuat pesanan. Silakan coba lagi.",
        "invalidPaymentData": "Tautan pembayaran tidak valid. Silakan coba lagi nanti.",
        "priceUpdated": "Harga berubah. Tinjau harga terbaru dan beli lagi.",
        "gatewayFailed": "Entri pembayaran untuk sementara tidak tersedia. Silakan coba lagi nanti.",
        "paymentCanceled": "Pembayaran dibatalkan. Pilih metode pembayaran dan coba lagi.",
        "pollFailed": "Gagal menyegarkan status pembayaran. Silakan coba lagi.",
        "pollTimeout": "Waktu penyegaran otomatis habis. Gunakan tombol segarkan setelah pembayaran.",
        "orderNotFound": "Pesanan tidak lagi tersedia. Buat pesanan baru.",
        "orderExpired": "Pesanan sudah habis masa berlakunya. Silakan beli lagi.",
        "fulfillmentFailed": "Pembayaran telah diterima tetapi Kredit belum ditambahkan. Silakan coba lagi nanti.",
        "authExpired": "Masa masuk sudah habis. Masuk lagi untuk melanjutkan.",
        "popupBlocked": "Browser Anda memblokir jendela baru. Izinkan MapsGrab untuk membuka pop-up dan coba lagi."
      }
    },
    "pricing": {
      "seo": {
        "title": "Harga — Paket Online, Ekstensi, dan API | MapsGrab",
        "description": "MapsGrab rencana untuk setiap permukaan: Scraper Online dari $19, Ekstensi browser dari $39, dan API dari $15. Tingkatan gratis disertakan dalam setiap produk — paket bulanan alami satu kali di Online dan API, langganan bulanan di Ekstensi."
      },
      "hero": {
        "kicker": "Harga",
        "title": {
          "lead": "Rencanakan ",
          "accent": "tiga cara",
          "tail": " untuk mengambil data Maps"
        },
        "lead": "Pilih permukaan yang sesuai dengan alur kerja Anda — cloud Pengumpul online, Ekstensi browser, atau HTTP API — lalu pilih volume bulanan. Tingkatkan atau beli dari halaman ini dalam hitungan menit.",
        "meta": [
          "Tingkat gratis di setiap produk",
          "Bayar dengan PayPal",
          "Tingkatkan dengan membayar selisihnya"
        ],
        "switchLabel": "Lini produk"
      },
      "popularLabel": "Paling Populer",
      "tabs": {
        "online": {
          "name": "Pengumpul online",
          "shortName": "Online",
          "switchMeta": "Dari {price} · satu kali",
          "unit": "catatan",
          "eyebrow": "Paket Scraper Online",
          "title": "Ekstraksi awan, dihargai berdasarkan catatan",
          "description": "Jalankan mesin MapsGrab di infrastruktur kami. Catatan adalah satu baris bisnis yang dikumpulkan. Paket berbayar mencakup email opsional dan pengayaan media sosial tanpa biaya tambahan.",
          "billingChips": [
            "Pembayaran satu kali",
            "Mencakup satu bulan alami",
            "Tidak ada perpanjangan otomatis"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Bebas",
              "tagline": "Coba cloud scraper dalam skala kecil",
              "price": "$0",
              "periodLabel": "selamanya",
              "quota": "1,000 catatan / bulan",
              "features": [
                "Ekstraksi bisnis dengan 37-kolom CSV ekspor",
                "Hingga 2 kata kunci per tugas",
                "Mode peta dan wilayah untuk pencarian area",
                "Email & pengayaan sosial pada paket berbayar",
                "Satu penghapusan duplikat CSV per tugas"
              ],
              "ctaLabel": "Mulai gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Untuk ekspor satu kali saja",
              "price": "$19",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "20,000 catatan / bulan",
              "features": [
                "Semuanya Gratis",
                "20,000 catatan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "Hingga 5 kata kunci per tugas",
                "Pengayaan email & sosial, diaktifkan secara default dan opsional"
              ],
              "ctaLabel": "Dapatkan Ringan",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Dasar",
              "tagline": "Untuk pengumpulan prospek mingguan yang stabil",
              "price": "$49",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "80,000 catatan / bulan",
              "features": [
                "Semuanya di Lite",
                "80,000 catatan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "Hingga 10 kata kunci per tugas"
              ],
              "ctaLabel": "Dapatkan Dasar",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Pertumbuhan",
              "tagline": "Untuk mengembangkan jaringan pipa timah",
              "price": "$99",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "250,000 catatan / bulan",
              "features": [
                "Semuanya dalam Dasar",
                "250,000 catatan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "Hingga 20 kata kunci per tugas"
              ],
              "ctaLabel": "Dapatkan Pertumbuhan",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Profesional",
              "tagline": "Untuk agensi dan tim yang banyak data",
              "price": "$149",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "500,000 catatan / bulan",
              "features": [
                "Segalanya dalam Pertumbuhan",
                "500,000 catatan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "Hingga 50 kata kunci per tugas"
              ],
              "ctaLabel": "Jadilah Profesional",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pembayaran satu kali mencakup satu bulan alami — paket pada tab ini tidak diperpanjang secara otomatis. Catatan adalah satu baris bisnis yang dikumpulkan dari Google Maps; penyetelan ulang penggunaan pada catatan 1 dan yang tidak terpakai tidak akan diperpanjang.",
          "compare": {
            "lead": "Paket Scraper Online — ekstraksi cloud, dihargai berdasarkan rekor.",
            "volume": "Catatan per bulan",
            "groups": [
              {
                "label": "Data",
                "rows": [
                  {
                    "label": "Ekstraksi bisnis dengan 37-kolom CSV ekspor",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Email & pengayaan sosial",
                    "cells": [
                      false,
                      "Aktif secara default, opsional",
                      "Aktif secara default, opsional",
                      "Aktif secara default, opsional",
                      "Aktif secara default, opsional"
                    ]
                  }
                ]
              },
              {
                "label": "Alur kerja",
                "rows": [
                  {
                    "label": "Kata kunci per tugas",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Mode peta dan wilayah",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Satu penghapusan duplikat CSV per tugas",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Berlaku untuk kuota catatan bulanan MapsGrab Pengumpul online.",
            "successTitle": "Paket diaktifkan",
            "successDescription": "Paket satu kali 1 bulan Anda sudah aktif. Scraper Online mengambilnya pada penyegaran kuota berikutnya."
          }
        },
        "extension": {
          "name": "Ekstensi",
          "shortName": "Ekstensi",
          "switchMeta": "Dari {price} · satu kali",
          "unit": "catatan",
          "eyebrow": "Rencana perluasan",
          "title": "Ekstraksi browser, diberi harga berdasarkan catatan",
          "description": "Setiap baris yang dikumpulkan ekstensi — bisnis, ulasan, atau foto — dihitung sebagai satu catatan. Semua paket mencakup ulasan, foto, dan tugas batch; paket berbayar mengekspor semua kolom 36, termasuk email dan pengayaan sosial.",
          "billingChips": [
            "Pembayaran satu kali",
            "1 bulan akses",
            "Tidak ada perpanjangan otomatis"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Bebas",
              "tagline": "Ekstraksi inti, dalam skala kecil",
              "price": "$0",
              "periodLabel": "selamanya",
              "quota": "1,000 catatan / bulan",
              "features": [
                "Ekstraksi data bisnis",
                "Ulasan (11 kolom) dan foto URLs",
                "Kata kunci kumpulan dan tugas ulasan-URL",
                "CSV / JSON ekspor dengan pilihan bidang"
              ],
              "ctaLabel": "Instal ekstensi",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Untuk pekerja lepas dan saluran prospek yang sedang berkembang",
              "price": "$39",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "100,000 catatan / bulan",
              "features": [
                "Semuanya Gratis",
                "100,000 catatan setiap bulan",
                "Ekstraksi bisnis 36 kolom penuh",
                "Pengayaan email & media sosial"
              ],
              "ctaLabel": "Dapatkan Pro",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Bisnis",
              "tagline": "Untuk agensi dan tim yang banyak data",
              "price": "$99",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "500,000 catatan / bulan",
              "features": [
                "Semuanya di Pro",
                "500,000 catatan setiap bulan",
                "Ruang untuk tugas batch multi-pasar",
                "Jalur ekspor lokal-pertama yang sama"
              ],
              "ctaLabel": "Dapatkan Bisnis",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Setiap baris yang dikumpulkan ekstensi dihitung sebagai satu catatan: bisnis dari pencarian atau daftar tersimpan, ulasan, atau foto. Pengayaan email dan sosial tidak menambah catatan. Penggunaan bulanan direset pada tanggal 1; catatan yang tidak digunakan tidak dapat diputar.",
          "compare": {
            "lead": "Paket ekstensi — ekstraksi browser, diberi harga berdasarkan catatan.",
            "volume": "Catatan per bulan",
            "groups": [
              {
                "label": "Data",
                "rows": [
                  {
                    "label": "Ekstraksi data bisnis",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Ekstraksi bisnis 36 kolom penuh",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Ulasan (11 kolom) dan foto URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Pengayaan email & media sosial",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Kata kunci kumpulan dan tugas ulasan-URL",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Ekspor",
                "rows": [
                  {
                    "label": "CSV / JSON ekspor dengan pilihan bidang",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Jalur ekspor yang mengutamakan lokal",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Berlaku untuk kuota bulanan ekstensi browser MapsGrab.",
            "successTitle": "Paket diaktifkan",
            "successDescription": "Paket satu kali 1 bulan Anda sudah aktif. Ekstensi mengambilnya pada penyegaran kuota berikutnya."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "Dari {price} · satu kali",
          "unit": "permintaan",
          "eyebrow": "API rencana",
          "title": "Akses terprogram, diberi harga berdasarkan permintaan",
          "description": "Telusuri Google Maps bisnis dan ambil ulasannya dari aplikasi Anda melalui HTTP API sederhana. Setiap panggilan yang berhasil dihitung sebagai satu permintaan, meskipun tidak ada hasil atau sebagian data yang dikembalikan.",
          "billingChips": [
            "Pembayaran satu kali",
            "Mencakup satu bulan alami",
            "Tidak ada perpanjangan otomatis"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Bebas",
              "tagline": "Evaluasi API dalam skala kecil",
              "price": "$0",
              "periodLabel": "selamanya",
              "quota": "20 permintaan / bulan",
              "features": [
                "Pencarian bisnis berdasarkan kata kunci dan lokasi",
                "Tinjau titik akhir dengan pengurutan dan paging",
                "JSON tanggapan",
                "Kunci API terkait dengan akun Anda",
                "Dukungan komunitas"
              ],
              "ctaLabel": "Mulai gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Dasar",
              "tagline": "Untuk prototipe dan integrasi ringan",
              "price": "$15",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "1,000 permintaan / bulan",
              "features": [
                "Semuanya Gratis",
                "1,000 permintaan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "JSON tanggapan"
              ],
              "ctaLabel": "Dapatkan Dasar",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Profesional",
              "tagline": "Untuk integrasi produksi",
              "price": "$65",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "5,000 permintaan / bulan",
              "features": [
                "Semuanya dalam Dasar",
                "5,000 permintaan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "JSON tanggapan"
              ],
              "ctaLabel": "Jadilah Profesional",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Bisnis",
              "tagline": "Untuk produk yang dibuat berdasarkan data MapsGrab",
              "price": "$115",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "10,000 permintaan / bulan",
              "features": [
                "Semuanya Profesional",
                "10,000 permintaan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "JSON tanggapan"
              ],
              "ctaLabel": "Dapatkan Bisnis",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Skala",
              "tagline": "Untuk operasi data bervolume tinggi",
              "price": "$365",
              "periodLabel": "satu kali · 1 bulan",
              "quota": "50,000 permintaan / bulan",
              "features": [
                "Segalanya dalam Bisnis",
                "50,000 permintaan untuk 1 bulan",
                "Pembayaran satu kali — tanpa perpanjangan otomatis",
                "JSON tanggapan"
              ],
              "ctaLabel": "Dapatkan Skala",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pembayaran satu kali mencakup satu bulan alami — paket pada tab ini tidak diperpanjang secara otomatis. Setiap panggilan API atau MCP yang berhasil dihitung sebagai satu permintaan, termasuk hasil yang kosong dan sebagian; panggilan gagal tidak dihitung. Penyetelan ulang penggunaan pada 1 dan permintaan yang tidak digunakan tidak akan diperpanjang.",
          "compare": {
            "lead": "API paket — akses terprogram, diberi harga berdasarkan permintaan.",
            "volume": "Permintaan per bulan",
            "groups": [
              {
                "label": "Titik akhir",
                "rows": [
                  {
                    "label": "Pencarian bisnis berdasarkan kata kunci dan lokasi",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Tinjau titik akhir dengan pengurutan dan paging",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON tanggapan",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Server MCP dengan kunci API yang sama",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Mengakses",
                "rows": [
                  {
                    "label": "Kunci API terkait dengan akun Anda",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Dukungan komunitas",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Berlaku untuk kuota permintaan bulanan MapsGrab API.",
            "successTitle": "Paket diaktifkan",
            "successDescription": "Paket satu kali 1 bulan Anda sudah aktif. Kunci API Anda mengambil kuota baru pada permintaan berikutnya."
          }
        }
      },
      "plansSection": {
        "label": "Rencana",
        "finder": {
          "label": "Berapa {unit} yang Anda perlukan dalam sebulan?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} sebulan — {plan} rencana",
          "fits": "Cocok"
        }
      },
      "compare": {
        "kicker": "Membandingkan",
        "title": {
          "lead": "Setiap rencana, ",
          "accent": "berdampingan",
          "tail": ""
        },
        "plan": "Rencana",
        "volumeGroup": "Volume & penagihan",
        "billing": "Penagihan",
        "included": "Termasuk",
        "notIncluded": "Tidak termasuk",
        "allPlans": "Termasuk di semua paket"
      },
      "usage": {
        "head": {
          "kicker": "Penggunaan",
          "title": {
            "lead": "Apa yang diperhitungkan dalam ",
            "accent": "kuota",
            "tail": " Anda"
          },
          "lead": "Dua unit: catatan untuk ekstensi dan Scraper Online, permintaan untuk API — dan keduanya disetel ulang pada tanggal 1 setiap bulan."
        },
        "records": {
          "meter": "Catatan yang digunakan bulan ini",
          "badge": "Ekstensi · Daring",
          "title": "1 catatan = 1 baris yang dikumpulkan",
          "body": "Setiap baris yang Anda kumpulkan dihitung sebagai satu catatan: bisnis di Scraper Online; bisnis, ulasan, atau foto di ekstensi. Pengayaan email dan sosial tidak menambah catatan.",
          "count": "+1 catatan",
          "attachments": [
            "Telepon & situs web",
            "Jam buka",
            "Email & media sosial"
          ]
        },
        "requests": {
          "meter": "Permintaan digunakan bulan ini",
          "badge": "API · MCP",
          "title": "1 permintaan = 1 panggilan berhasil",
          "body": "Permintaan adalah satu panggilan API yang berhasil, meskipun tidak ada hasil atau sebagian data yang dikembalikan; panggilan gagal tidak dihitung. MCP panggilan alat menggunakan kuota permintaan yang sama.",
          "counted": "Panggilan berhasil — dihitung",
          "notCounted": "Panggilan gagal — tidak dihitung"
        },
        "reset": {
          "title": "Direset pada tanggal 1",
          "body": "Penggunaan disetel ulang pada tanggal 1 setiap bulan. Catatan dan permintaan yang tidak digunakan tidak dapat dialihkan.",
          "limit": "Batas rencana",
          "unused": "Tidak digunakan · tidak terguling",
          "flag": "Mengatur ulang"
        }
      },
      "billing": {
        "head": {
          "kicker": "Penagihan",
          "title": {
            "lead": "Penagihan sederhana, ",
            "accent": "tidak ada kejutan",
            "tail": ""
          },
          "lead": "Cara kerja pembayaran, perpanjangan, dan peningkatan di ketiga lini produk."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Bayar paket apa pun melalui PayPal. Selesaikan pembayaran Anda di PayPal dan kembali ke sini untuk mengaktifkan paket Anda."
          },
          "cadence": {
            "title": "Pembayaran satu kali",
            "body": "Setiap paket berbayar mencakup satu bulan alami. Bayar sekali tanpa biaya otomatis; beli lagi saat Anda membutuhkan satu bulan lagi."
          },
          "upgrade": {
            "title": "Tingkatkan dengan membayar selisihnya",
            "body": "Pindahkan paket aktif ke tingkat lebih tinggi yang memenuhi syarat melalui penyedia pembayaran Anda saat ini. Tanggal kedaluwarsa dan penggunaan Anda sejauh ini tidak berubah."
          },
          "independent": {
            "title": "Rencana mandiri",
            "body": "Paket pada tab yang berbeda bersifat independen. Ketika paket habis masa berlakunya, akun secara otomatis kembali ke tingkat gratis."
          }
        }
      },
      "plans": {
        "loading": "Memuat opsi pembayaran...",
        "loadFailed": "Gagal memuat opsi pembayaran. Segarkan halaman untuk mencoba lagi.",
        "noChannels": "Tidak ada metode pembayaran yang tersedia untuk paket ini saat ini.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Pembayaran tidak lengkap",
        "billingPeriodMonthly": "1 bulan",
        "billingAutoRenew": "Perpanjangan otomatis hingga dibatalkan",
        "billingOneTime": "Pembayaran satu kali"
      },
      "upgrade": {
        "currentPlan": "Rencana Saat Ini",
        "button": "Tingkatkan · {amount}",
        "title": "Tingkatkan paket Anda",
        "confirm": "Konfirmasikan peningkatan",
        "oneTime": "Perbedaan satu kali melalui {channel}. Tanggal kedaluwarsa Anda tetap {date}.",
        "autoRenew": "Selisihnya akan langsung dibebankan melalui {channel}. Tanggal kedaluwarsa Anda tetap {date}; pembaruan di masa mendatang menggunakan harga paket baru.",
        "pendingTitle": "Menunggu peningkatan Anda",
        "pendingDescription": "Penyedia pembayaran Anda sedang menerapkan peningkatan. Paket Anda saat ini tetap aktif hingga dikonfirmasi.",
        "successTitle": "Paket ditingkatkan",
        "successDescription": "Kuota baru Anda sudah aktif. Tanggal kedaluwarsa Anda tetap {date}.",
        "quoteFailed": "Tidak dapat memuat harga peningkatan Anda. Segarkan halaman untuk mencoba lagi.",
        "failed": "Peningkatan versi Anda tidak dapat dikonfirmasi. Segarkan halaman untuk memeriksa paket Anda sebelum mencoba lagi.",
        "reasons": {
          "no_active_subscription": "Paket Anda tidak lagi aktif. Segarkan halaman untuk memilih paket.",
          "not_higher_tier": "Pilih tingkatan yang lebih tinggi untuk ditingkatkan, atau tunggu hingga paket Anda habis masa berlakunya untuk mengubah tingkatan.",
          "non_positive_diff": "Nilai paket Anda yang tersisa tidak lebih rendah dari tingkatan ini. Anda dapat mengubah tingkatan setelah paket Anda berakhir.",
          "channel_unavailable": "Peningkatan versi tidak tersedia dengan metode pembayaran Anda saat ini. Anda dapat mengubah rencana setelah habis masa berlakunya."
        }
      },
      "faq": {
        "kicker": "Pertanyaan umum",
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "lead": "Dasar-dasar penagihan. Yang lainnya, dukungan hanya berjarak satu email.",
        "contact": "Hubungi dukungan",
        "items": [
          {
            "question": "Apa yang dianggap sebagai rekor?",
            "answer": "Catatan adalah satu baris yang dikumpulkan — unit yang sama dengan jumlah paket gratis. Di Scraper Online itu adalah salah satu bisnis; dalam ekstensi, setiap bisnis, ulasan, atau foto yang dikumpulkannya merupakan satu catatan. Pengayaan email dan sosial tidak menambah catatan. Pada tab API, penggunaan dihitung dalam permintaan yang berhasil."
          },
          {
            "question": "Apakah saya memerlukan paket berbayar untuk mencoba MapsGrab?",
            "answer": "Tidak. Setiap produk memiliki tingkat gratis tanpa batas waktu: Scraper Online dan ekstensinya mencakup 1,000 catatan per bulan, dan API mencakup 20 permintaan per bulan. Paket Scraper Online dan ekstensi gratis tidak termasuk pengayaan email atau media sosial. Paket Online Berbayar menyertakannya secara default, dan Anda dapat menonaktifkannya untuk setiap tugas."
          },
          {
            "question": "Bagaimana cara kuota berlaku pada akun saya?",
            "answer": "Kuota dihitung per akun yang digunakan untuk login (dan per perangkat browser untuk ekstensi saat Anda tidak login). Masuk dengan akun pemilik paket sehingga plafon yang lebih tinggi berlaku. Ketika paket habis masa berlakunya, akun secara otomatis kembali ke tingkat gratis."
          },
          {
            "question": "Apakah paket saya akan diperpanjang secara otomatis?",
            "answer": "Tidak. Semua paket adalah pembayaran satu kali PayPal yang mencakup satu bulan alami. Ketika paket Anda habis masa berlakunya, Anda kembali ke tingkat gratis. Beli lagi untuk melanjutkan dengan paket berbayar."
          },
          {
            "question": "Bisakah saya beralih antar tingkatan?",
            "answer": "Anda dapat meningkatkan paket aktif ke tingkat lebih tinggi yang memenuhi syarat dengan membayar selisihnya melalui PayPal. Tanggal kedaluwarsa dan penggunaan Anda sejauh ini tidak berubah. Paket pada tab yang berbeda bersifat independen."
          }
        ]
      },
      "cta": {
        "kicker": "Mulailah",
        "title": {
          "lead": "Mulai dari ",
          "accent": "tingkat gratis",
          "tail": ""
        },
        "lead": "Setiap produk memiliki tingkatan gratis tanpa batas waktu — 1,000 mencatat satu bulan pada ekstensi dan Scraper Online, 20 meminta satu bulan pada API.",
        "primary": "Instal ekstensi",
        "secondary": "Coba Pengumpul data Online",
        "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
      }
    },
    "extensionLogin": {
      "title": "Masuk Ekstensi | MapsGrab",
      "description": "Masuk untuk menghubungkan sesi situs web MapsGrab Anda ke ekstensi browser.",
      "eyebrow": "Ekstensi Peramban",
      "heading": "Masuk Ekstensi",
      "checkingState": "Memeriksa",
      "signInRequiredState": "Diperlukan proses masuk",
      "confirmState": "Konfirmasi akun",
      "errorState": "Kesalahan",
      "preparingTitle": "Mempersiapkan proses masuk Anda",
      "preparingText": "Menyiapkan jembatan masuk ekstensi.",
      "invalidParamsTitle": "Tautan masuk tidak valid",
      "invalidParamsText": "Tautan masuk ini tidak memiliki parameter keamanan yang diperlukan. Silakan mulai masuk lagi dari ekstensi.",
      "checkingSessionTitle": "Memeriksa sesi Anda",
      "checkingSessionText": "Memverifikasi sesi situs web Anda yang ada.",
      "finishingGoogleTitle": "Menyelesaikan proses masuk Google",
      "finishingGoogleText": "Menukar otorisasi Google Anda dengan sesi situs web.",
      "signInRequiredTitle": "Masuk untuk melanjutkan",
      "signInRequiredText": "Masuk untuk menghubungkan sesi situs web Anda ke ekstensi.",
      "signInButtonLabel": "Masuk",
      "confirmTitle": "Konfirmasikan akun Anda",
      "confirmText": "Ekstensi meminta untuk masuk dengan akun di bawah. Lanjutkan hanya jika Anda baru saja mulai masuk dari ekstensi.",
      "continueButtonLabel": "Melanjutkan",
      "useAnotherAccountLabel": "Gunakan akun lain",
      "issuingTitle": "Menyelesaikan proses masuk",
      "issuingText": "Menerbitkan kode masuk satu kali untuk ekstensi.",
      "issueFailedTitle": "Ada yang tidak beres",
      "retryButtonLabel": "Mencoba kembali",
      "verificationFailedPrefix": "Verifikasi token situs web gagal",
      "issueFailedPrefix": "Permintaan kode login ekstensi gagal",
      "googleSignInFailedPrefix": "Google proses masuk gagal",
      "googleCompletionFailedPrefix": "Google proses masuk tidak dapat diselesaikan"
    },
    "online": {
      "seo": {
        "title": "Online Google Maps Scraper — Jalankan Ekstraksi di Cloud | MapsGrab",
        "description": "Jalankan Google Maps pencarian kata kunci di cloud, kumpulkan data bisnis, dan unduh satu CSV per tugas."
      },
      "hero": {
        "announce": {
          "badge": "3 mode",
          "text": "Kata kuncinya, peta wilayah atau keseluruhan wilayah"
        },
        "title": {
          "lead": "Ekstraksi Google Maps ",
          "accent": "di cloud,",
          "tail": " tanpa instalasi"
        },
        "lead": "Kirimkan kata kunci, kumpulkan detail bisnis di cloud, dan unduh satu CSV per tugas dari dasbor Anda.",
        "primaryCta": "Mulai ekstraksi",
        "pricingCta": "Lihat harga",
        "meta": [
          "1,000 catatan gratis / bulan",
          "Bekerja di browser apa pun",
          "Satu penghapusan duplikat CSV per tugas"
        ],
        "theater": {
          "files": "1 CSV · Disimpan ke Unduhan",
          "csv": "CSV",
          "parallelChip": {
            "label": "Kata kunci dijalankan",
            "value": "Secara paralel"
          },
          "billingChip": {
            "label": "Ditagih oleh",
            "value": "Baris yang dikirimkan"
          }
        }
      },
      "facts": {
        "caption": "Sekilas tentang Scraper Online",
        "items": [
          {
            "value": 37,
            "label": "kolom publik, termasuk nomor baris kontinu"
          },
          {
            "value": 6,
            "label": "kolom profil sosial pada paket berbayar"
          },
          {
            "value": 50,
            "label": "mencari lokasi per tugas mode peta"
          },
          {
            "value": 60,
            "suffix": " menit",
            "label": "jendela koleksi untuk setiap tugas"
          },
          {
            "value": 1000,
            "label": "catatan gratis setiap bulan"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Bagaimana cara kerjanya",
          "title": {
            "lead": "Dari pratinjau singkat hingga ",
            "accent": "ekspor penuh",
            "tail": ""
          },
          "lead": "Usahakan satu kata kunci di beranda tanpa akun. Jika Anda menginginkan seluruh daftar, masuk dan jalankan sebagai tugas di Dasbor Anda."
        },
        "steps": [
          {
            "title": "Pratinjau di beranda",
            "description": "Satu kata kunci, tidak ada akun. Lihat berapa banyak bisnis yang dimiliki halaman hasil pertama, dengan baris 3 pertama."
          },
          {
            "title": "Masuk",
            "description": "Pratinjau tidak disimpan dan tidak pernah menggunakan kuota Anda. Setelah masuk, Anda mengirimkan kata kunci lagi."
          },
          {
            "title": "Buat tugas",
            "description": "Di Dasbor › Pengumpul online, masukkan satu kata kunci per baris — atau biarkan area peta atau wilayah menyusun daftarnya."
          },
          {
            "title": "Kata kunci dijalankan secara paralel",
            "description": "Ikuti status antrian, pengumpulan, dan persiapan CSV, lalu selesai, berhasil sebagian atau gagal. Tugas aktif disegarkan setiap 5 detik."
          },
          {
            "title": "Unduh",
            "description": "Unduh satu CSV untuk seluruh tugas saat file tersedia. Keberhasilan parsial membuat baris tetap terkirim; hasil nol tidak memiliki file."
          }
        ],
        "lock": "Masuk untuk melihat daftar lengkapnya",
        "email": "you@company.com",
        "links": {
          "preview": "Coba pratinjau beranda",
          "dashboard": "Buka Dasbor › Pengumpul data Online"
        }
      },
      "modes": {
        "head": {
          "kicker": "Mode pencarian",
          "title": {
            "lead": "Tiga cara untuk mengatakan ",
            "accent": "tempat mencarinya",
            "tail": ""
          },
          "lead": "Ketik kata kunci baris demi baris, contoh area peta di sekitar titik pusat, atau ubah negara, negara bagian, dan kota menjadi kueri siap pakai."
        },
        "tabsLabel": "Modus pencarian",
        "notes": {
          "keywords": "Satu kata kunci per baris, hingga batas paket Anda",
          "map": "Contoh lingkaran di sekitar titik pusat",
          "regions": "Negara, negara bagian, dan kota mulai GeoNames"
        },
        "keywords": {
          "hint": "Satu kata kunci per baris. Baris kosong dan duplikat dihilangkan sebelum dihitung, dan seluruh tugas menghasilkan satu CSV yang dihapus duplikatnya.",
          "blank": "Baris kosong · dilewati",
          "duplicate": "Duplikat · dilewati",
          "limitsTitle": "Kata kunci per tugas",
          "limitsCaption": "dengan paket online",
          "limitsHint": "Mulai mengikis tetap dinonaktifkan saat daftar kosong, melebihi batas paket Anda, atau kuota bulanan Anda habis."
        },
        "map": {
          "formula": "{keywords} kata kunci × {points} titik kisi",
          "scale": "{value} km",
          "facts": [
            "Poin dicari dari tengah ke luar.",
            "Lingkaran hanya menempatkan pusat pencarian — hasilnya tidak terpotong di sana.",
            "Bisnis yang ditemukan berdasarkan kata kunci atau poin disimpan satu kali dalam tugas."
          ]
        },
        "regions": {
          "hint": "Anda dapat mengedit kueri yang dihasilkan sebelum mengirimkan. Masing-masing dihitung sebagai kata kunci."
        }
      },
      "results": {
        "head": {
          "kicker": "Hasil",
          "title": {
            "lead": "Satu tugas, ",
            "accent": "satu CSV",
            "tail": ""
          },
          "lead": "Unduh 37 kolom publik dalam satu CSV untuk keseluruhan tugas, dengan nomor baris berkelanjutan dan bisnis dihapus duplikatnya di seluruh penelusuran."
        },
        "csvMeta": "1 CSV · {count} mengirimkan baris",
        "rows": "{count} baris",
        "searches": "Baris yang dikirimkan berdasarkan penelusuran",
        "notes": [
          "Baris 1 berisi nama kolom tetap dalam bahasa Inggris, termasuk kolom # berkelanjutan.",
          "Baris 2 menjelaskan setiap kolom dalam bahasa antarmuka yang digunakan saat membuat tugas.",
          "Tugas yang diselesaikan dengan hasil nol tidak memiliki file. Keberhasilan parsial membuat baris tetap terkirim.",
          "Baris label tidak pernah diperhitungkan dalam rekaman Anda."
        ],
        "language": "Bahasa tugas: bahasa Indonesia",
        "rowLabel": "Baris",
        "legend": {
          "fields": "Baris 1 · nama bidang",
          "labels": "Baris 2 · bahasa tugas",
          "data": "Baris 3+ · bisnis"
        },
        "more": "+{count} kolom lainnya",
        "csvLabels": {
          "#": "Nomor baris",
          "Name": "Nama bisnis",
          "Fulladdress": "Alamat lengkap",
          "Categories": "Kategori bisnis",
          "Phone": "Telepon utama",
          "Review Count": "Jumlah ulasan",
          "Average Rating": "Peringkat ulasan rata-rata",
          "Website": "Situs web bisnis",
          "Emails": "Email situs web publik",
          "Search Keyword": "Kata kunci pencarian"
        }
      },
      "features": {
        "head": {
          "kicker": "Kemampuan",
          "title": {
            "lead": "Apa yang ",
            "accent": "lakukan",
            "tail": " dari Scraper Online"
          },
          "lead": "Detail bisnis dikumpulkan di cloud, dengan email opsional dan profil sosial pada paket berbayar."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Tugas kata kunci",
            "description": "Kirimkan jenis dan lokasi bisnis sebagai kata kunci terpisah. Paket Anda menentukan batas kata kunci dan kuota catatan bulanan.",
            "meta": "2 · 5 · 10 · 20 · 50 kata kunci per tugas"
          },
          {
            "id": "history",
            "title": "Riwayat tugas",
            "description": "Ikuti kemajuan tugas dan lihat jumlah catatan untuk setiap kata kunci di dasbor Anda.",
            "meta": "Selesai · Berhasil sebagian · Gagal"
          },
          {
            "id": "details",
            "title": "Detail bisnis",
            "description": "Kumpulkan nama, alamat, nomor telepon, situs web, peringkat, jam buka, koordinat, dan pengidentifikasi tempat jika tersedia.",
            "meta": "37 kolom publik per bisnis"
          },
          {
            "id": "enrichment",
            "title": "Email dan pengayaan sosial",
            "description": "Dengan paket Online berbayar, situs web bisnis diperiksa alamat email dan profil sosialnya secara default. Anda dapat menonaktifkannya untuk setiap tugas.",
            "meta": "Paket berbayar · aktif secara default"
          },
          {
            "id": "downloads",
            "title": "Satu tugas CSV",
            "description": "Unduh seluruh tugas menjadi satu CSV ketika file tersedia. Tidak diperlukan file per pencarian.",
            "meta": "{job}.csv · 37 kolom"
          },
          {
            "id": "browser",
            "title": "Tidak ada yang perlu dipasang",
            "description": "Berjalan di cloud dari browser apa pun — Edge, Firefox, atau apa pun. Unduh hasil dari riwayat tugas Anda.",
            "meta": "Edge · Firefox · browser apa pun"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Penggunaan",
          "title": {
            "lead": "Ditagih berdasarkan baris ",
            "accent": "yang sebenarnya Anda dapatkan",
            "tail": ""
          },
          "lead": "Tugas online diukur berdasarkan baris bisnis yang dikirimkan setelah tugas selesai. Tidak ada yang disisihkan saat Anda mengirimkan, dan baris label di setiap CSV tidak pernah dihitung."
        },
        "checks": [
          "Mengirimkan tugas tidak menghemat kuota Anda",
          "Tugas yang sudah berjalan akan selesai, bahkan melebihi sisa kuota Anda",
          "Setelah kuota habis, tugas baru tidak dapat dikirimkan",
          "Penggunaan direset pada tanggal 1 dalam waktu New York; catatan yang tidak digunakan tidak dapat diputar"
        ],
        "mock": {
          "recordsLabel": "Rekor bulan ini",
          "left": "{count} tersisa",
          "exhausted": "Kuota habis",
          "task": "Tugas {id}…",
          "pending": "Terkirim sejauh ini · dihitung ketika tugas selesai",
          "counted": "Dihitung menuju bulan ini",
          "rows": "{count} baris",
          "running": "Berlari",
          "delta": "+{count} catatan"
        }
      },
      "plans": {
        "head": {
          "kicker": "Paket Scraper Online",
          "title": {
            "lead": "Ekstraksi cloud, ",
            "accent": "dihargai berdasarkan catatan",
            "tail": ""
          },
          "lead": "Jalankan mesin MapsGrab di infrastruktur kami. Catatan adalah satu baris bisnis yang dikirimkan; paket berbayar mencakup email dan pengayaan sosial tanpa biaya tambahan."
        },
        "specs": {
          "keywords": "Kata kunci per tugas",
          "contacts": "Email & sosial",
          "included": "Aktif secara default",
          "excluded": "Tidak termasuk"
        },
        "note": "Pembayaran satu kali untuk satu bulan alami — Paket online tidak diperpanjang secara otomatis. Penggunaan direset pada tanggal 1 dalam waktu New York dan rekaman yang tidak terpakai tidak dapat diputar.",
        "compare": "Bandingkan semua rencana"
      },
      "faq": {
        "kicker": "Pertanyaan umum",
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "lead": "Jawaban singkatnya. Yang lainnya, dukungan hanya berjarak satu email.",
        "contact": "Hubungi dukungan",
        "items": [
          {
            "question": "Apa perbedaan Pengumpul online dengan ekstensinya?",
            "answer": "Ekstensi mengumpulkan data di browser Anda. Scraper Online menjalankan tugas kata kunci di cloud dan mengirimkan hasilnya ke dasbor Anda."
          },
          {
            "question": "Dari mana data tersebut berasal, dan apakah pengumpulannya sah?",
            "answer": "MapsGrab hanya mengumpulkan informasi yang ditampilkan secara publik di Google Maps — detail yang sama yang dapat dibaca oleh pengunjung mana pun. Kami tidak mengakses akun pribadi, konten yang dilindungi undang-undang, atau data non-publik."
          },
          {
            "question": "Format apa yang dapat saya ekspor?",
            "answer": "Tugas dengan hasil menghasilkan satu UTF-8 CSV dengan 37 kolom publik, nomor baris berkelanjutan, dan dua baris header. Bisnis dihapus duplikatnya di semua penelusuran. Tugas tanpa hasil tidak memiliki file."
          },
          {
            "question": "Harganya berapa?",
            "answer": "Scraper Online mengikuti paket MapsGrab di halaman Harga, termasuk kuota catatan bulanan gratis. Paket berbayar meningkatkan batasan saat Anda membutuhkan lebih banyak."
          },
          {
            "question": "Apakah saya memerlukan paket berbayar untuk email dan profil sosial?",
            "answer": "Online Gratis tidak termasuk pengayaan email atau media sosial. Paket Online Berbayar menyertakannya secara default, dan Anda dapat menonaktifkannya untuk setiap tugas. Pilihannya ditetapkan setelah tugas diserahkan."
          },
          {
            "question": "Berapa lama suatu tugas dapat berjalan?",
            "answer": "Setiap tugas memiliki jendela pengumpulan 60 menit. Keberhasilan sebagian dapat mengirimkan baris yang dikumpulkan dan email atau profil apa pun yang ditemukan. Riwayat Anda menunjukkan apakah CSV tersedia."
          },
          {
            "question": "Apakah pratinjau beranda saya disimpan saat saya masuk?",
            "answer": "Tidak. Pratinjau beranda adalah tampilan cepat yang tidak disimpan. Setelah Anda masuk, buka Pengumpul online di Dasbor Anda dan kirimkan kembali kata kunci sebagai tugas lengkap."
          }
        ]
      },
      "cta": {
        "kicker": "Mulailah",
        "title": {
          "lead": "Antrian ",
          "accent": "tugas cloud",
          "tail": " pertama Anda"
        },
        "lead": "Kirimkan kata kunci, ikuti kemajuan tugas Anda, dan unduh data bisnis dari dasbor Anda.",
        "primary": "Mulai ekstraksi",
        "secondary": "Lihat harga",
        "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
      }
    },
    "apiPage": {
      "switchLabel": "API titik akhir",
      "switchItems": {
        "search": "Pengumpul data",
        "reviews": "Ulasan",
        "photos": "Foto"
      },
      "primaryCta": "Dapatkan kunci API",
      "pricingCta": "Lihat harga",
      "console": {
        "label": "Contoh permintaan dan respons API",
        "langLabel": "Permintaan bahasa",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Salin permintaan",
        "replay": "Permintaan pemutaran ulang",
        "ready": "Siap",
        "composing": "Menulis permintaan…",
        "sending": "Mengirim permintaan…",
        "done": "Respons · 200 Oke · aplikasi/json",
        "waiting": "// menunggu tanggapan…",
        "response": "Contoh tanggapan"
      },
      "endpoints": {
        "kicker": "Titik akhir",
        "title": {
          "lead": "Satu kunci. ",
          "accent": "Dua",
          "tail": " titik akhir."
        },
        "lead": "Telusuri tempat, lalu berikan hasil apa pun `fid` ke Ulasan API. Keduanya menggunakan kunci API yang sama dan memanfaatkan satu kuota permintaan bulanan. Titik akhir Foto akan segera hadir.",
        "here": "Anda di sini",
        "paramsLabel": "Parameter",
        "mcp": {
          "title": "Membangun dengan agen AI?",
          "description": "Server MapsGrab MCP menghadirkan Penelusuran dan Ulasan ke Claude Code, Cursor, VS Code, Codex dan klien MCP lainnya — terhubung dengan masuk atau menggunakan kunci API Anda.",
          "link": "Jelajahi MCP"
        }
      },
      "chain": {
        "kicker": "Titik akhir rantai",
        "title": {
          "lead": "Satu ID membawa Anda dari penelusuran ",
          "accent": "ke ulasan",
          "tail": ""
        },
        "lead": "Setiap hasil Pencarian mempunyai `fid`. Berikan ke Ulasan API untuk beralih dari daftar tempat ke pendapat orang tentang masing-masing tempat.",
        "label": "Permintaan Pencarian mengembalikan tempat-tempat yang masing-masing membawa fid; permintaan Ulasan menggunakan kembali fid dari tempat pertama. Langkah Foto ditandai segera hadir.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 ulasan"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 ulasan"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 ulasan"
          }
        ],
        "reviews": [
          {
            "rating": 5,
            "text": "“Best cortado on Division. Friendly crew.”",
            "meta": "Maya R. · 2 weeks ago",
            "reply": "Owner: Thanks Maya — see you soon!"
          },
          {
            "rating": 4,
            "text": "“Great beans. Cozy but small — come early on weekends.”",
            "meta": "Daniel K. · 3 weeks ago",
            "reply": ""
          }
        ],
        "photos": {
          "title": "Foto",
          "note": "Titik akhir Foto sedang dalam pengembangan."
        }
      },
      "reference": {
        "kicker": "Referensi",
        "title": {
          "lead": "Permintaan masuk, ",
          "accent": "JSON",
          "tail": " keluar"
        },
        "lead": "Kirim kunci Anda sebagai `Authorization: Bearer YOUR_API_KEY` dengan badan JSON. Setiap respons dibungkus dengan `{code, data, msg}`, dan `code` 10000 berarti sukses.",
        "baseUrl": "Basis URL",
        "copyBaseUrl": "Salin basis URL",
        "request": "Meminta",
        "response": "Tanggapan",
        "columns": {
          "parameter": "Parameter",
          "field": "Bidang",
          "type": "Jenis",
          "description": "Keterangan",
          "example": "Contoh"
        },
        "required": "diperlukan",
        "groupsLabel": "Kelompok lapangan",
        "notes": [
          {
            "icon": "gauge",
            "title": "Satu permintaan per panggilan berhasil",
            "description": "Panggilan yang berhasil dihitung satu kali, bahkan tanpa hasil atau `partial` data. Panggilan yang gagal tidak dihitung."
          },
          {
            "icon": "key",
            "title": "A 401 berarti periksa kunci Anda",
            "description": "Kunci yang hilang atau tidak valid akan menghasilkan HTTP 401. Kesalahan lainnya menghasilkan HTTP 200 dengan non-10000 `code` dan `msg`."
          },
          {
            "icon": "locate",
            "title": "Lokasi adalah bias, bukan pagar",
            "description": "`ll` memberi tahu Maps tempat mencarinya. Tempat di luar tampilan tersebut masih dapat muncul."
          },
          {
            "icon": "target",
            "title": "Beri nama tempatnya",
            "description": "Cantumkan kota, negara bagian, atau ZIP di `q` — “dekat saya” tidak memiliki apa pun untuk dijadikan jangkar di server."
          }
        ]
      },
      "plans": {
        "kicker": "API rencana",
        "title": {
          "lead": "Akses terprogram, ",
          "accent": "ditentukan berdasarkan permintaan",
          "tail": ""
        },
        "lead": "Pencarian, Ulasan, dan server MCP berbagi satu kuota permintaan bulanan. Setiap panggilan yang berhasil dihitung sebagai satu permintaan."
      },
      "faq": {
        "lead": "Jawaban singkatnya. Yang lainnya, dukungan hanya berjarak satu email.",
        "contact": "Hubungi dukungan"
      },
      "cta": {
        "kicker": "Mulailah",
        "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps API ekstraksi — Data Bisnis di JSON | MapsGrab",
        "description": "MapsGrab API ekstraksi mengembalikan Google Maps hasil pencarian sebagai JSON: nama, alamat, telepon, situs web, peringkat, jam kerja, koordinat, Place ID dan fid — ditambah email dan profil sosial berdasarkan permintaan."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Pengumpul data",
          "tail": " API"
        },
        "lead": "Kirim kata kunci lebih dari HTTPS dan dapatkan Google Maps bisnis kembali sebagai JSON: nama, alamat, telepon, situs web, peringkat, jam buka, koordinat, Place ID dan fid — ditambah email dan profil sosial berdasarkan permintaan.",
        "meta": [
          "Paket gratis: {quota}",
          "Satu kunci untuk Pencarian dan Ulasan",
          "JSON lebih dari HTTPS"
        ],
        "chips": [
          {
            "label": "Per tempat",
            "value": "29 bidang data"
          },
          {
            "label": "Per halaman",
            "value": "Hingga 20 tempat"
          }
        ]
      },
      "endpoint": {
        "name": "API ekstraksi",
        "description": "Bisnis untuk kata kunci apa pun dan lokasi opsional — 29 bidang per tempat, ditambah email dan profil sosial dengan `extra`.",
        "link": "Jelajahi Pengumpul data API"
      },
      "caps": {
        "title": {
          "lead": "Apa yang dikembalikan oleh ",
          "accent": "API ekstraksi",
          "tail": ""
        },
        "lead": "Kata kunci dan bias lokasi opsional di; tempat yang ditampilkan oleh penelusuran Google Maps, sebagaimana terstruktur JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Cari berdasarkan kata kunci dan lokasi",
            "description": "Kirim `q` dengan bias lokasi `ll` opsional. `page` menetapkan berapa banyak halaman hasil yang akan dikumpulkan, 1–10, hingga 20 menempatkan masing-masing halaman, semuanya dalam satu tanggapan."
          },
          {
            "icon": "table",
            "title": "29 bidang per tempat",
            "description": "Nama, kategori, alamat lengkap, telepon, situs web, jumlah rating dan ulasan, jam buka, koordinat, Place ID, CID, fid, pemilik, dan banyak lagi."
          },
          {
            "icon": "mail",
            "title": "Email dan pengayaan sosial",
            "description": "Setel `extra` ke `true` untuk menambahkan `emails` dan `medias`: profil Instagram, Facebook, YouTube, TikTok, LinkedIn, dan X yang ditemukan di setiap situs web bisnis."
          },
          {
            "icon": "braces",
            "title": "Bersih, dapat diprediksi JSON",
            "description": "snake_case bidang dalam satu amplop `{code, data, msg}`. Nilai Google Maps tidak ditampilkan kembali sebagai `null` atau daftar kosong, tidak pernah sebagai string kosong."
          },
          {
            "icon": "layers",
            "title": "Data parsial ditandai",
            "description": "Jika beberapa detail tidak dapat diisi, Anda masih mendapatkan tempatnya — dengan `partial` ditetapkan ke `true` dan `warnings` menyatakan apa yang hilang."
          },
          {
            "icon": "shield",
            "title": "Hanya data publik",
            "description": "Hasil hanya berisi apa yang Google Maps tampilkan secara publik — detail yang sama yang dapat dibaca oleh pengunjung mana pun."
          }
        ]
      },
      "reference": {
        "kind": "endpoint",
        "shape": "data: { places, partial, warnings }",
        "params": [
          {
            "name": "q",
            "type": "string",
            "required": true,
            "description": "Apa yang harus ditelusuri, hingga 300 karakter — jenis bisnis dan tempat, mis. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Berapa banyak halaman hasil yang harus dikumpulkan, masing-masing 1–10, hingga 20, semuanya dikembalikan dalam satu respons. Pengumpulan dihentikan lebih awal ketika laman memiliki tempat kurang dari 20 atau tidak ada hal baru. Bawaan `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Bahasa hasil, mis. `en` atau `fr`. Bawaan `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Bias lokasi opsional sebagai `@lat,lng,zoom`, perbesar 0–21. Ini memberi tahu Maps tempat mencari; hasilnya tidak dipotong ke radius."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` menambahkan `emails` dan `medias` ke setiap tempat. Bawaan `false`."
          }
        ],
        "groups": [
          {
            "label": "Identitas",
            "fields": [
              {
                "name": "name",
                "type": "string",
                "example": "\"Ember & Oak Coffee\""
              },
              {
                "name": "categories",
                "type": "string[]",
                "example": "[\"Coffee shop\", \"Espresso bar\"]"
              },
              {
                "name": "place_id",
                "type": "string",
                "example": "\"ChIJ8Qv2kSIKlVQRq-DRw_KltL4\""
              },
              {
                "name": "cid",
                "type": "string",
                "example": "\"13741790825100206251\""
              },
              {
                "name": "fid",
                "type": "string",
                "example": "\"0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab\""
              },
              {
                "name": "kgmid",
                "type": "string",
                "example": "\"/g/11c5x9_qk_\""
              },
              {
                "name": "google_maps_url",
                "type": "string",
                "example": "\"https://www.google.com/maps?cid=13741790825100206251\""
              },
              {
                "name": "google_knowledge_url",
                "type": "string",
                "example": "\"https://www.google.com/search?kgmid=/g/11c5x9_qk_\""
              },
              {
                "name": "search_keyword",
                "type": "string",
                "example": "\"coffee shop in Portland, OR\""
              }
            ]
          },
          {
            "label": "Kontak",
            "fields": [
              {
                "name": "phone",
                "type": "string",
                "example": "\"(503) 555-0142\""
              },
              {
                "name": "phones",
                "type": "string[]",
                "example": "[\"(503) 555-0142\", \"+1 503-555-0142\"]"
              },
              {
                "name": "website",
                "type": "string",
                "example": "\"emberandoak.coffee/\""
              },
              {
                "name": "domain",
                "type": "string",
                "example": "\"emberandoak.coffee\""
              },
              {
                "name": "emails",
                "type": "string[]",
                "example": "[\"hello@emberandoak.coffee\"]",
                "badge": "tambahan"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "tambahan"
              }
            ]
          },
          {
            "label": "Lokasi",
            "fields": [
              {
                "name": "full_address",
                "type": "string",
                "example": "\"3021 SE Division St, Portland, OR 97202\""
              },
              {
                "name": "street",
                "type": "string",
                "example": "\"3021 SE Division St\""
              },
              {
                "name": "municipality",
                "type": "string",
                "example": "\"Portland, OR 97202\""
              },
              {
                "name": "latitude",
                "type": "number",
                "example": "45.504912"
              },
              {
                "name": "longitude",
                "type": "number",
                "example": "-122.635377"
              },
              {
                "name": "time_zone",
                "type": "string",
                "example": "\"America/Los_Angeles\""
              }
            ]
          },
          {
            "label": "Peringkat",
            "fields": [
              {
                "name": "average_rating",
                "type": "number",
                "example": "4.7"
              },
              {
                "name": "review_count",
                "type": "integer",
                "example": "1284"
              },
              {
                "name": "review_url",
                "type": "string",
                "example": "\"https://search.google.com/local/reviews?placeid=ChIJ…\""
              }
            ]
          },
          {
            "label": "Profil",
            "fields": [
              {
                "name": "about",
                "type": "string",
                "example": "\"Service options: [Dine-in, Takeout], Highlights: [Great coffee]\""
              },
              {
                "name": "opening_hours",
                "type": "object[]",
                "example": "[{\"name\": \"Thursday(2026-10-15)\", \"values\": [\"7 AM–6 PM\"]}, …]"
              },
              {
                "name": "claimed",
                "type": "boolean",
                "example": "true"
              },
              {
                "name": "owner",
                "type": "string",
                "example": "\"Ember & Oak Coffee (Owner)\""
              },
              {
                "name": "owner_id",
                "type": "string",
                "example": "\"104287731665220398123\""
              },
              {
                "name": "owner_link",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1042877316…\""
              },
              {
                "name": "featured_image",
                "type": "string",
                "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\""
              }
            ]
          },
          {
            "label": "Halaman",
            "fields": [
              {
                "name": "places",
                "type": "place[]",
                "example": "[{…}, …]"
              },
              {
                "name": "partial",
                "type": "boolean",
                "example": "false"
              },
              {
                "name": "warnings",
                "type": "string[]",
                "example": "[]"
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "items": [
          {
            "question": "Apa yang dikembalikan oleh API ekstraksi?",
            "answer": "JSON hingga 20 tempat per halaman yang dikumpulkan. Setiap tempat mempunyai 29 bidang — nama, kategori, alamat, telepon, situs web, peringkat, jumlah ulasan, jam buka, koordinat, Place ID, CID, fid, dan banyak lagi — ditambah email dan profil sosial jika ada tambahan yang benar."
          },
          {
            "question": "Bagaimana cara mengautentikasi?",
            "answer": "Kirim kunci MapsGrab API Anda sebagai token pembawa di header Authorization. Setiap akun memiliki satu kunci. Itu ditampilkan secara penuh hanya ketika Anda membuatnya, dan membuat kunci baru akan segera menonaktifkan yang lama."
          },
          {
            "question": "Bagaimana cara menghitung permintaan?",
            "answer": "Setiap panggilan yang berhasil dihitung sebagai satu permintaan, berapa pun nilai lamannya — termasuk penelusuran yang tidak menghasilkan tempat atau sebagian data. Panggilan yang gagal tidak dihitung. Pencarian, Ulasan, dan server MCP berbagi satu kuota bulanan."
          },
          {
            "question": "Apa fungsi halaman?",
            "answer": "halaman adalah berapa banyak halaman hasil yang dikumpulkan dalam satu panggilan, dari 1 hingga 10. Setiap halaman menambahkan hingga 20 tempat, dan pengumpulan berhenti lebih awal ketika Google Maps tidak memiliki hal baru. Ini bukan nomor halaman."
          },
          {
            "question": "Apakah datanya bersifat publik?",
            "answer": "Ya. API hanya mengembalikan informasi yang ditampilkan secara publik di Google Maps — detail yang sama yang dapat dibaca oleh pengunjung mana pun. Itu tidak mengakses akun pribadi atau data non-publik."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Masukkan data Maps ke dalam ",
          "accent": "aplikasi",
          "tail": " Anda"
        },
        "lead": "Satu permintaan HTTP per penelusuran, terstruktur JSON sebagai respons — untuk CRM, saluran data, dan produk Anda sendiri."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Ulasan Pengumpul data API — Ulasan di JSON | MapsGrab",
        "description": "MapsGrab Ulasan API mengembalikan ulasan publik dari bisnis Google Maps sebagai JSON: peringkat, teks dan terjemahan, penulis, tanggal, foto ulasan, dan balasan pemilik — hingga 60 per halaman dengan kursor."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Ulasan",
          "tail": " Pengumpul data API"
        },
        "lead": "Minta ulasan publik atas bisnis Google Maps apa pun berdasarkan fidnya dan dapatkan kembali JSON terstruktur: peringkat, teks dan terjemahan, penulis, tanggal, foto ulasan, dan balasan pemilik — halaman demi halaman dengan kursor.",
        "meta": [
          "Paket gratis: {quota}",
          "Hingga 60 ulasan per halaman",
          "JSON lebih dari HTTPS"
        ],
        "chips": [
          {
            "label": "Per halaman",
            "value": "Hingga 60 ulasan"
          },
          {
            "label": "Urutkan berdasarkan",
            "value": "Relevansi · terbaru · peringkat"
          }
        ]
      },
      "endpoint": {
        "name": "API ulasan",
        "description": "Ulasan publik tentang satu bisnis berdasarkan `fid` — hingga 60 per halaman, diurutkan sesuai keinginan Anda, diberi halaman dengan kursor.",
        "link": "Jelajahi Ulasan API"
      },
      "caps": {
        "title": {
          "lead": "Apa yang dihasilkan oleh ",
          "accent": "Ulasan API",
          "tail": ""
        },
        "lead": "Setiap ulasan publik terhadap suatu bisnis — peringkat, teks, penulis, foto, dan balasan pemilik — satu halaman per permintaan.",
        "items": [
          {
            "icon": "review",
            "title": "Ulasan oleh fid",
            "description": "Alamatkan bisnis dengan `fid` dari hasil API ekstraksi mana pun, lalu teruskan `next_cursor` kembali untuk membaca halaman berikutnya, hingga 60 ulasan masing-masing."
          },
          {
            "icon": "filter",
            "title": "Diurutkan sesuai keinginan Anda",
            "description": "`sort_by` menampilkan ulasan yang paling relevan (1), terbaru (2), dengan rating tertinggi (3) atau terendah (4) terlebih dahulu."
          },
          {
            "icon": "list",
            "title": "Teks, terjemahan dan tanggal",
            "description": "Peringkat, teks ulasan, `translated_text` dan `language`, dengan `published_at_ms` dan tanggal relatif untuk setiap ulasan."
          },
          {
            "icon": "user",
            "title": "Detail penulis",
            "description": "Nama penulis dan link profil, jumlah ulasan penulis, dan status Local Guide."
          },
          {
            "icon": "image",
            "title": "Foto dan balasan pemilik",
            "description": "`images` mencantumkan foto URLs yang dilampirkan pada ulasan; `owner_response` membawa balasan pemilik dan `owner_response_at_ms` waktunya."
          },
          {
            "icon": "shield",
            "title": "Hanya data publik",
            "description": "Hanya ulasan yang ditampilkan secara publik di Google Maps — konten yang sama yang dapat dibaca oleh pengunjung mana pun."
          }
        ]
      },
      "reference": {
        "kind": "endpoint",
        "shape": "data: { reviews, next_cursor }",
        "params": [
          {
            "name": "fid",
            "type": "string",
            "required": true,
            "description": "ID fitur bisnis, mis. `0x5495…:0xbeb4…`. Setiap tempat API ekstraksi menyertakannya."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "`next_cursor` dari halaman sebelumnya. Hilangkan itu untuk halaman pertama."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` paling relevan · `2` terbaru · `3` peringkat tertinggi · `4` peringkat terendah. Bawaan `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Kode bahasa, mis. `en`. Bawaan `en`."
          }
        ],
        "groups": [
          {
            "label": "Tinjauan",
            "fields": [
              {
                "name": "review_id",
                "type": "string",
                "example": "\"ChdDSUhNMG9nS0VJQ0FnSUR3…\""
              },
              {
                "name": "rating",
                "type": "integer",
                "example": "5"
              },
              {
                "name": "text",
                "type": "string",
                "example": "\"Best cortado on Division. Friendly crew.\""
              },
              {
                "name": "translated_text",
                "type": "string",
                "example": "null"
              },
              {
                "name": "language",
                "type": "string",
                "example": "\"en\""
              },
              {
                "name": "published_at_ms",
                "type": "integer",
                "example": "1790553600000"
              },
              {
                "name": "relative_date",
                "type": "string",
                "example": "\"2 weeks ago\""
              },
              {
                "name": "images",
                "type": "string[]",
                "example": "[\"https://lh5.googleusercontent.com/p/AF1QipN…\"]"
              },
              {
                "name": "origin",
                "type": "string",
                "example": "\"Google\""
              }
            ]
          },
          {
            "label": "Pengarang",
            "fields": [
              {
                "name": "author_name",
                "type": "string",
                "example": "\"Maya R.\""
              },
              {
                "name": "author_url",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1123…\""
              },
              {
                "name": "author_review_count",
                "type": "integer",
                "example": "38"
              },
              {
                "name": "author_is_local_guide",
                "type": "boolean",
                "example": "true"
              }
            ]
          },
          {
            "label": "Balasan pemilik",
            "fields": [
              {
                "name": "owner_response",
                "type": "string",
                "example": "\"Thanks Maya — see you soon!\""
              },
              {
                "name": "owner_response_at_ms",
                "type": "integer",
                "example": "1790640000000"
              }
            ]
          },
          {
            "label": "Halaman",
            "fields": [
              {
                "name": "reviews",
                "type": "review[]",
                "example": "[{…}, …]"
              },
              {
                "name": "next_cursor",
                "type": "string",
                "example": "\"CAESBkVnSUlDZw…\""
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "items": [
          {
            "question": "Bagaimana cara menangani bisnis tertentu?",
            "answer": "Dengan fidnya, ID fitur yang disertakan di setiap tempat API ekstraksi. Finder Place ID gratis juga membaca FID dari Google Maps mana saja URL."
          },
          {
            "question": "Bidang apa saja yang termasuk dalam ulasan?",
            "answer": "ID Ulasan, peringkat, teks beserta terjemahan dan bahasanya, waktu publikasi dan tanggal relatif, nama penulis, tautan profil, jumlah ulasan dan status Local Guide, foto terlampir, dan balasan pemilik beserta waktunya."
          },
          {
            "question": "Berapa banyak ulasan yang dapat saya kumpulkan?",
            "answer": "Setiap permintaan mengembalikan satu halaman yang berisi hingga 60 ulasan ditambah next_cursor. Berikan kembali untuk membaca halaman berikutnya; ketika next_cursor bernilai nol, tidak ada halaman lagi."
          },
          {
            "question": "Bagaimana cara menghitung permintaan?",
            "answer": "Setiap panggilan yang berhasil dihitung sebagai satu permintaan, termasuk panggilan yang tidak memberikan ulasan. Panggilan yang gagal tidak dihitung. Kuota dibagikan ke API ekstraksi dan server MCP."
          },
          {
            "question": "Apakah datanya bersifat publik?",
            "answer": "Ya. API hanya mengembalikan ulasan yang ditampilkan secara publik di Google Maps — konten yang sama yang dapat dibaca oleh pengunjung mana pun. Itu tidak mengakses akun pribadi atau data non-publik."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Pantau ulasan ",
          "accent": "dalam skala besar",
          "tail": ""
        },
        "lead": "Cursor rangkaian ulasan berhalaman bersih JSON — untuk pemantauan, penelitian, dan pelaporan."
      }
    },
    "photosApi": {
      "seo": {
        "title": "Google Maps Foto API — Segera Hadir | MapsGrab",
        "description": "MapsGrab Foto API akan segera hadir. Gambar URLs sudah menjadi bagian dari MapsGrab API lainnya: API ekstraksi tempat menyertakan gambar unggulan, dan Ulasan API ulasan mencantumkan foto terlampir."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Foto",
          "tail": " API"
        },
        "lead": "Titik akhir khusus untuk Google Maps foto bisnis sedang dalam pengembangan. Gambar URLs telah hadir bersama titik akhir lainnya: setiap tempat API ekstraksi memiliki gambar unggulan, dan setiap ulasan Ulasan API mencantumkan foto-fotonya.",
        "meta": [
          "Gambar unggulan URL per tempat",
          "Foto URLs per ulasan",
          "Satu kunci untuk Pencarian dan Ulasan"
        ],
        "chips": [
          {
            "label": "Per tempat",
            "value": "featured_image"
          },
          {
            "label": "Per ulasan",
            "value": "images[]"
          }
        ]
      },
      "endpoint": {
        "name": "API foto",
        "description": "Foto bisnis lebih dari HTTP. Belum tersedia — titik akhir lainnya sudah mengembalikan gambar URLs.",
        "link": "Tentang Foto API"
      },
      "caps": {
        "title": {
          "lead": "Gambar URLs di endpoint ",
          "accent": "lainnya",
          "tail": ""
        },
        "lead": "Foto API belum tersedia. Bidang ini sudah mengembalikan gambar URLs:",
        "items": [
          {
            "icon": "image",
            "title": "Gambar unggulan per tempat",
            "description": "Setiap tempat API ekstraksi memiliki `featured_image`: URL dari foto yang ditampilkan pada daftar Google Maps, atau `null` jika tidak ada."
          },
          {
            "icon": "review",
            "title": "Foto terlampir pada ulasan",
            "description": "Setiap Ulasan API ulasan memiliki `images`: URLs dari foto yang dilampirkan penulisnya, atau daftar kosong."
          },
          {
            "icon": "clock",
            "title": "Titik akhir Foto berikutnya",
            "description": "Titik akhir khusus untuk foto bisnis sedang dalam pengembangan. Parameter dan format responsnya belum dipublikasikan."
          }
        ]
      },
      "reference": {
        "kind": "pending",
        "statusTitle": "Titik akhir foto",
        "status": "Belum ada titik akhir Foto untuk dihubungi, jadi tidak ada parameter untuk didokumentasikan. Hingga dikirimkan, bidang titik akhir lainnya ini membawa gambar URLs.",
        "fieldsTitle": "Bidang gambar",
        "fields": [
          {
            "name": "featured_image",
            "type": "string",
            "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\"",
            "badge": "API ekstraksi"
          },
          {
            "name": "images",
            "type": "string[]",
            "example": "[\"https://lh5.googleusercontent.com/p/AF1QipN…\"]",
            "badge": "API ulasan"
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "items": [
          {
            "question": "Apakah Foto API tersedia?",
            "answer": "Belum. Titik akhir khusus untuk foto bisnis sedang dalam pengembangan, dan parameter serta format responsnya belum dipublikasikan."
          },
          {
            "question": "Titik akhir manakah yang mengembalikan gambar URLs?",
            "answer": "API ekstraksi mengembalikan featured_image untuk setiap tempat — URL dari foto yang ditampilkan pada daftar Google Maps. Ulasan API mengembalikan gambar untuk setiap ulasan — foto yang dilampirkan penulisnya."
          },
          {
            "question": "Bagaimana cara mendapatkan ide bisnis?",
            "answer": "Setiap tempat API ekstraksi menyertakan fidnya, dan Finder Place ID gratis membaca FID dari tempat Google Maps mana pun URL."
          },
          {
            "question": "Bagaimana cara menghitung permintaan?",
            "answer": "Panggilan scraper API dan Ulasan API dihitung satu permintaan per panggilan berhasil, termasuk bidang gambar. Panggilan yang gagal tidak dihitung."
          },
          {
            "question": "Apakah datanya bersifat publik?",
            "answer": "Ya. Gambar URLs menunjuk ke foto yang ditampilkan secara publik di Google Maps — gambar yang sama yang dapat dilihat oleh pengunjung mana pun."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Foto ",
          "accent": "segera hadir",
          "tail": ""
        },
        "lead": "Hasil scraper API sudah menyertakan gambar unggulan setiap tempat, dan hasil Ulasan API mencantumkan foto-foto yang dilampirkan pada setiap ulasan."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps Pengumpul data MCP Server | MapsGrab",
        "description": "Hubungkan agen AI ke data Google Maps langsung dengan server MapsGrab MCP: cari tempat dan baca ulasan dari Claude Code, Cursor, VS Code, Codex, atau klien MCP lainnya — cukup masuk, tidak perlu Kunci API untuk ditempel."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Hubungkan agen Anda",
      "hero": {
        "kicker": "MCP pelayan",
        "title": {
          "lead": "Google Maps Pengumpul data ",
          "accent": "MCP",
          "tail": " Server"
        },
        "lead": "Server MapsGrab MCP memberi agen AI penelusuran dan peninjauan Google Maps secara langsung melalui satu titik akhir Streamable HTTP — untuk Claude Code, Cursor, VS Code, Codex, dan klien MCP lainnya.",
        "meta": [
          "Streamable HTTP",
          "Masuk dengan OAuth",
          "Paket gratis: {quota}"
        ],
        "chips": [
          {
            "label": "Mengangkut",
            "value": "Streamable HTTP"
          },
          {
            "label": "Hasil alat",
            "value": "Terstruktur JSON"
          }
        ]
      },
      "agent": {
        "label": "Contoh sesi agen: pertanyaan tentang bisnis lokal, panggilan alat MapsGrab dengan hasil terstruktur, dan jawaban agen",
        "session": "Sesi agen",
        "connected": "MCP server {server} terhubung",
        "placeholder": "Tanyakan tentang tempat mana saja di Google Maps…",
        "thinking": "Pemikiran…",
        "running": "berlari",
        "scenes": [
          {
            "prompt": "Temukan dokter gigi di Austin, TX dengan peringkat 4.8 atau lebih tinggi dan cantumkan nomor telepon mereka.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 tempat",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 tempat lainnya"
              }
            ],
            "answer": [
              "Tiga dari hasil 20 pertama diberi peringkat ",
              {
                "strong": "4.8 atau lebih tinggi"
              },
              ":"
            ],
            "rows": [
              [
                "Bluebonnet Family Dental",
                "4.9",
                "(512) 555-0134"
              ],
              [
                "Barton Hills Smile Studio",
                "4.8",
                "(512) 555-0161"
              ],
              [
                "Live Oak Dentistry",
                "4.8",
                "(512) 555-0187"
              ]
            ]
          },
          {
            "prompt": "Apa pendapat orang dalam ulasan terbaru Ember & Oak Coffee di Portland?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 tempat",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 ulasan",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Sebagian besar ",
              {
                "strong": "5-bintang"
              },
              " — orang-orang memuji espresso dan staf yang ramah. Satu-satunya catatan yang berulang: ",
              {
                "strong": "tempat duduknya ketat di akhir pekan"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Tukang pipa mana di Chicago yang tidak mencantumkan situs web? Taruh di meja.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 tempat",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 tempat lainnya"
              }
            ],
            "answer": [
              {
                "strong": "4 dari 20"
              },
              " tidak memiliki situs web yang terdaftar. Tiga yang pertama:"
            ],
            "rows": [
              [
                "Windy City Pipe Works",
                "4.6",
                "(312) 555-0112"
              ],
              [
                "Lakeview Drain & Sewer",
                "4.4",
                "(312) 555-0148"
              ],
              [
                "North Branch Plumbing",
                "4.8",
                "(312) 555-0175"
              ]
            ]
          },
          {
            "prompt": "Tarik ulasan dengan rating terendah dari Rose City Roasters dan buat draf balasan yang sopan.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 tempat",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 ulasan",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Peringkat terendah paling banyak disebutkan ",
              {
                "strong": "layanan lambat pada jam sibuk"
              },
              ". ",
              {
                "strong": "2 dari 3"
              },
              " belum ada balasan pemilik — saya menyusun satu untuk masing-masing."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Peralatan",
        "title": {
          "lead": "Apa yang ",
          "accent": "diekspos",
          "tail": " oleh server MCP"
        },
        "lead": "Dua alat pada satu titik akhir, dengan masukan dan hasil yang sama seperti API ekstraksi dan Ulasan API.",
        "kind": "Alat",
        "returns": "Kembali",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Cari tempat",
            "description": "Pencarian kata kunci dan lokasi yang menghasilkan apa yang ditampilkan oleh pencarian Google Maps — nama, telepon, peringkat, jam, koordinat, ID Tempat, dan informasi.",
            "args": [
              {
                "name": "q",
                "description": "Kata kunci ditambah kota, negara bagian atau ZIP"
              },
              {
                "name": "page",
                "description": "Halaman hasil untuk dikumpulkan, 1–10 · masing-masing hingga 20 tempat"
              },
              {
                "name": "hl",
                "description": "Bahasa hasil, mis. `en`"
              },
              {
                "name": "ll",
                "description": "Bias lokasi, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` menambahkan email dan profil sosial"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Data yang sama dengan API ekstraksi"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Daftar ulasan",
            "description": "Peringkat, teks ulasan, penulis, tanggal, foto, dan balasan pemilik untuk bisnis apa pun yang sedang dicari agen Anda.",
            "args": [
              {
                "name": "fid",
                "description": "Dari hasil pencarian apa pun"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` dari halaman terakhir; hilangkan untuk yang pertama"
              },
              {
                "name": "sort_by",
                "description": "1 relevan · 2 terbaru · 3 tertinggi · 4 terendah"
              },
              {
                "name": "hl",
                "description": "Bahasa, mis. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Data yang sama dengan Ulasan API"
          }
        ],
        "photos": {
          "title": "Foto bisnis",
          "description": "Alat foto untuk agen akan segera hadir, bersama dengan Foto API.",
          "link": "Tentang Foto API"
        }
      },
      "flow": {
        "kicker": "Bagaimana hal itu terhubung",
        "title": {
          "lead": "Satu titik akhir antara agen Anda dan ",
          "accent": "data Maps langsung",
          "tail": ""
        },
        "lead": "Klien Anda terhubung melalui Streamable HTTP dan masuk melalui browser Anda. Agen menemukan alat tersebut, memanggilnya ketika perintah memerlukan data Maps, dan membaca kembali JSON terstruktur.",
        "label": "Claude Code, Cursor, VS Code, Codex dan klien MCP lainnya terhubung ke titik akhir MapsGrab MCP, yang melayani alat search_places dan list_reviews. Alat foto ditandai segera hadir.",
        "clientsLabel": "MCP klien",
        "anyClient": "Klien MCP mana pun",
        "toolsLabel": "Peralatan",
        "hub": "MapsGrab MCP",
        "photos": "Foto",
        "publicData": "Data publik Google Maps",
        "resultLabel": "hasil",
        "results": [
          "20 tempat",
          "60 ulasan"
        ],
        "steps": [
          {
            "title": "Menghubungkan",
            "description": "Tambahkan titik akhir ke klien Anda, lalu masuk ke MapsGrab melalui browser Anda."
          },
          {
            "title": "Menemukan",
            "description": "Agen Anda mencantumkan alat MapsGrab dan skema masukannya."
          },
          {
            "title": "Panggilan",
            "description": "Saat prompt memerlukan data Maps, agen akan memanggil alat dan membaca hasil JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Pengaturan",
        "title": {
          "lead": "Satu blok konfigurasi ",
          "accent": "per klien",
          "tail": ""
        },
        "lead": "Arahkan klien Anda ke titik akhir MapsGrab dan masuk melalui browser Anda — tanpa kunci API untuk disalin, tanpa SDK, tanpa proses lokal untuk dijalankan.",
        "tabsLabel": "MCP klien",
        "copy": "Salin konfigurasi",
        "clients": {
          "claude": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Tambahkan servernya",
                "description": "Jalankan perintah untuk mendaftarkan `mapsgrab` melalui HTTP."
              },
              {
                "title": "Masuk",
                "description": "Di Claude Code, jalankan `/mcp`, pilih `mapsgrab` dan autentikasi — MapsGrab terbuka di browser Anda untuk Anda setujui."
              },
              {
                "title": "Minta data Maps",
                "description": "Claude Code mencantumkan alat MapsGrab dan memanggilnya saat prompt membutuhkannya."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Sunting mcp.json",
                "description": "Tambahkan blok ke `~/.cursor/mcp.json` untuk setiap proyek, atau `.cursor/mcp.json` untuk satu proyek."
              },
              {
                "title": "Masuk",
                "description": "Di Pengaturan Cursor → MCP, klik Hubungkan di sebelah `mapsgrab` dan setujui di browser Anda."
              },
              {
                "title": "Gunakan alatnya",
                "description": "`mapsgrab` menunjukkan alatnya di daftar server MCP, siap untuk agen."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Tambahkan .vscode/mcp.json",
                "description": "Tempelkan blok tersebut — blok tersebut hanya menampung titik akhir URL, bukan rahasia."
              },
              {
                "title": "Masuk",
                "description": "Mulai servernya. VS Code meminta untuk mengautentikasi dengan MapsGrab dan membuka browser Anda untuk menyetujui."
              },
              {
                "title": "Gunakan mode agen",
                "description": "Buka Obrolan dalam mode agen dan aktifkan alat MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Tambahkan servernya",
                "description": "Jalankan `codex mcp add` untuk mendaftarkan `mapsgrab` dengan URL."
              },
              {
                "title": "Masuk",
                "description": "Jalankan `codex mcp login mapsgrab` dan setujui MapsGrab di browser Anda."
              },
              {
                "title": "Mulai Codex",
                "description": "Sesi baru memuat `mapsgrab` dan alat-alatnya."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Tidak dapat masuk dari browser? Gunakan kunci API",
          "description": "Jika klien Anda tidak mendukung otorisasi MCP, atau berjalan di server atau di CI, tambahkan kunci API Anda sebagai header `Authorization` sebagai gantinya. Simpan kunci dalam variabel lingkungan atau masukan rahasia klien Anda, bukan file konfigurasi bersama.",
          "link": "Dapatkan kunci API",
          "snippet": "Klien HTTP mana pun"
        },
        "spec": {
          "title": "Klien MCP lainnya",
          "subtitle": "MCP Inspector disertakan",
          "transport": "Mengangkut",
          "transportValue": "Streamable HTTP",
          "endpoint": "Titik akhir",
          "copyEndpoint": "Salin titik akhir",
          "auth": "Penulis",
          "authValue": "OAuth masuk (pengganti: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Contoh petunjuknya",
        "title": {
          "lead": "Tanyakan dengan bahasa yang sederhana. ",
          "accent": "Dapatkan kembali baris.",
          "tail": ""
        },
        "lead": "Pencarian calon pelanggan, riset pasar lokal, pemantauan tinjauan — jelaskan pekerjaannya, dan agen Anda memutuskan alat MapsGrab mana yang akan digunakan.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Pencarian",
              "quote": "“Temukan dokter gigi di Austin, TX dengan peringkat 4.8 atau lebih tinggi dan cantumkan nomor telepon mereka.”",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Reputasi",
              "quote": "“Ringkaslah apa yang dikatakan orang dalam ulasan terbaru Ember & Oak Coffee di Portland.”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Daftar pemimpin",
              "quote": "“Buat daftar studio yoga di Denver dengan email dan profil Instagram mereka.”",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Riset pasar",
              "quote": "“Bandingkan peringkat dan jumlah ulasan untuk kedai kopi di Division St di Portland.”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Penyuburan",
              "quote": "“Tambahkan Place ID, telepon, dan situs web untuk setiap bisnis di spreadsheet ini.”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Balasan pemilik",
              "quote": "“Tarik ulasan dengan rating terendah dari Rose City Roasters dan buat draf balasan yang sopan.”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "sort_by: 4"
            }
          ],
          [
            {
              "icon": "web",
              "tag": "Kesenjangan situs web",
              "quote": "\"Tukang ledeng mana di Chicago yang tidak mencantumkan situs webnya? Masukkan ke dalam tabel.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Jam buka",
              "quote": "“Bengkel mobil mana di dekat 60614 yang buka pada hari Minggu?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Pemetaan",
              "quote": "“Ekspor restoran vegan di Brooklyn dengan koordinat GeoJSON.”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Lokalisasi",
              "quote": "“Cari toko roti di Lyon dan kembalikan detail daftarnya dalam bahasa Prancis.”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Daftar yang diklaim",
              "quote": "“Periksa gym mana di Austin yang telah mengklaim Google Daftar bisnis mereka.”",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Pemandu Lokal",
              "quote": "“Ulasan terbaru Hawthorne Bean Co. manakah yang berasal dari Local Guides?”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Waktu respons",
              "quote": "“Apakah salon-salon ini menjawab ulasan mereka, dan berapa lama waktu yang dibutuhkan pemilik untuk membalasnya?”",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Otentikasi & data",
        "title": {
          "lead": "Masuk sekali. ",
          "accent": "Hanya data publik.",
          "tail": ""
        },
        "lead": "Setiap panggilan ke titik akhir MCP membawa kredensial pembawa — token OAuth dari proses masuk, atau kunci API Anda jika klien Anda tidak dapat masuk — dan setiap hasil berasal dari apa yang Google Maps tunjukkan secara publik.",
        "inspector": {
          "label": "Contoh permintaan MCP dengan header pembawa Authorization, dan respons JSON-RPC dengan konten terstruktur",
          "request": "Meminta",
          "response": "Tanggapan",
          "verified": "Token diverifikasi"
        },
        "items": [
          {
            "icon": "key",
            "title": "Masuk, atau kembali ke kunci",
            "description": "Masuk melalui browser Anda dan setujui klien. Klien tanpa otorisasi MCP dapat meneruskan kunci API Anda sebagai token pembawa — keduanya menggunakan alat yang sama."
          },
          {
            "icon": "eye",
            "title": "Membaca Google Maps, tidak pernah menulis",
            "description": "Alat ini hanya mencari dan membaca daftar publik. Satu hal yang diubah oleh panggilan adalah penggunaan permintaan Anda."
          },
          {
            "icon": "lock",
            "title": "Tidak ada rahasia dalam file konfigurasi",
            "description": "Dengan masuk, konfigurasi Anda hanya menampung titik akhir URL. Jika Anda menggunakan kunci API, simpan kunci tersebut dalam variabel lingkungan, bukan file bersama."
          },
          {
            "icon": "shield",
            "title": "Cabut akses kapan saja",
            "description": "Klien yang masuk terdaftar di Dasbor → API, tempat Anda dapat mencabutnya. Membuat kunci API baru akan langsung menonaktifkan kunci lama."
          }
        ]
      },
      "billing": {
        "kicker": "Harga",
        "title": {
          "lead": "Dicakup oleh ",
          "accent": "paket API",
          "tail": " Anda"
        },
        "lead": "Server MCP mengambil kuota permintaan bulanan yang sama dengan API ekstraksi dan Ulasan API. Setiap panggilan alat yang berhasil dihitung sebagai satu permintaan.",
        "compare": "Bandingkan paket API",
        "head": {
          "plan": "Rencana",
          "requests": "Permintaan bulanan",
          "scale": "(skala log)",
          "price": "Harga"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Pertanyaan umum",
          "tail": ""
        },
        "items": [
          {
            "question": "Apa itu server MapsGrab MCP?",
            "answer": "Server MCP (Model Context Protocol) yang memungkinkan agen AI mencari Google Maps tempat dan membaca ulasan mereka. Ia menawarkan dua alat, search_places dan list_reviews, dengan masukan dan hasil yang sama seperti API ekstraksi dan Ulasan API."
          },
          {
            "question": "Klien mana yang dapat terhubung?",
            "answer": "Klien MCP apa pun yang mendukung Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector, dan lainnya. Gunakan titik akhir URL persis seperti yang ditunjukkan, termasuk garis miring di belakangnya."
          },
          {
            "question": "Bagaimana cara autentikasinya?",
            "answer": "Dengan masuk OAuth: Claude Code, Cursor, VS Code, Codex dan klien lain yang mendukung otorisasi MCP, buka MapsGrab di browser Anda; Anda menyetujui klien dan dapat mencabutnya nanti di Dasbor → API. Hanya jika klien Anda tidak dapat masuk, teruskan kunci API Anda sebagai token pembawa di header Authorization."
          },
          {
            "question": "Bagaimana cara penghitungan panggilan alat?",
            "answer": "Setiap panggilan alat yang berhasil dihitung sebagai satu permintaan terhadap kuota API bulanan Anda — kuota yang sama dengan API ekstraksi dan Ulasan API. Panggilan yang gagal tidak dihitung."
          },
          {
            "question": "Bisakah agen saya mendapatkan foto bisnis?",
            "answer": "Belum. Alat foto akan segera hadir, bersama dengan Foto API. Hasil pencarian sudah menyertakan featured_image URL masing-masing tempat."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Berikan ",
          "accent": "data Maps langsung",
          "tail": " kepada agen Anda"
        },
        "lead": "Satu koneksi MCP, dua alat, hasil terstruktur — penelusuran dan ulasan untuk alur kerja AI yang peka terhadap data."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Alat gratis",
        "guide": {
          "kicker": "Tentang alat ini",
          "title": {
            "lead": "Fungsinya dan ",
            "accent": "cara menggunakannya",
            "tail": ""
          },
          "lead": "Semuanya berjalan di browser Anda — tidak ada yang Anda tempel atau unggah yang keluar dari perangkat Anda."
        },
        "related": {
          "kicker": "Alat terkait",
          "title": {
            "lead": "Alat gratis lainnya untuk ",
            "accent": "data Maps",
            "tail": ""
          },
          "lead": "Utilitas kecil yang berjalan sepenuhnya di browser Anda — apa yang Anda tempel tidak akan pernah keluar dari perangkat Anda."
        },
        "faq": {
          "kicker": "Pertanyaan umum",
          "lead": "Jawaban singkatnya. Yang lainnya, dukungan hanya berjarak satu email.",
          "contact": "Hubungi dukungan"
        },
        "cta": {
          "kicker": "Ekstraksi massal",
          "primary": "Instal MapsGrab",
          "secondary": "Lihat harga",
          "note": "Sudah termasuk kuota bulanan gratis. Tidak ada kartu kredit."
        },
        "resultHeading": "Hasil",
        "copy": "Menyalin",
        "copied": "Disalin ke papan klip.",
        "downloadCsv": "Unduh CSV",
        "genericError": "Ada yang tidak beres. Periksa masukan Anda dan coba lagi."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Pencari — Dapatkan Google Maps Place ID dari URL | MapsGrab",
          "description": "Tempelkan Google Maps tempat URL dan dapatkan Place ID, CID, dan FID secara instan. Pencari Place ID berbasis browser gratis — tanpa perlu masuk, URL Anda tidak akan pernah keluar dari perangkat."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "Pencari",
            "tail": ""
          },
          "description": "Tempelkan Google Maps tempat URL secara lengkap dan bacakan Place ID, CID, dan FID dalam satu klik. Semuanya diterjemahkan di browser Anda — URL tidak pernah diunggah."
        },
        "form": {
          "urlLabel": "Google Maps tempat URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Temukan Place ID",
          "errorShortLink": "Tautan pendek (maps.app.goo.gl) tidak didukung. Buka tautan di browser Anda dan tempelkan URL lengkap dari bilah alamat.",
          "errorInvalidUrl": "Ini tidak terlihat seperti tempat Google Maps URL. Buka tempat di Google Maps dan salin URL lengkap (harus berisi \"/maps/place/\" dan \"@\" atau \"data=\").",
          "errorNoIds": "Tidak ada pengidentifikasi tempat yang ditemukan di URL ini. Pastikan Anda menyalin URL halaman tempat, bukan halaman hasil pencarian.",
          "examplesLabel": "Mencoba",
          "examples": {
            "city": "San Fransisco",
            "business": "Kedai kopi · Portland",
            "shortLink": "Tautan pendek"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url dari dua bagian FID",
          "cidNote": "FID 2nd half, hex → desimal",
          "fidNote": "dua segmen 0x… terakhir di URL",
          "anatomy": {
            "fidHigh": "FID · 1 babak pertama",
            "fidLow": "FID · 2setengah",
            "empty": "Tempelkan tempat URL — pengidentifikasi yang dibawanya menyala di sini."
          },
          "missing": "Tidak di tautan ini",
          "copyLabel": "Salin {label}",
          "privacy": "Didekodekan di browser Anda — URL tidak pernah diunggah."
        },
        "chips": [
          {
            "label": "Kunci Google API",
            "value": "Tidak diperlukan"
          },
          {
            "label": "URL Anda",
            "value": "Tidak pernah diunggah"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Bagaimana cara kerjanya",
            "title": {
              "lead": "Dari tautan Maps ke ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "Tanpa kunci API dan tanpa proses masuk — pengidentifikasi sudah ada di dalam tempat URL yang Anda salin."
          },
          "items": [
            {
              "heading": "Buka tempat di Google Maps",
              "body": "Telusuri bisnis tersebut dan klik daftarnya sehingga halaman tempat terbuka."
            },
            {
              "heading": "Salin seluruhnya URL",
              "body": "Salin URL panjang dari bilah alamat — yang berisi nama bisnis, segmen koordinat \"@\", dan parameter \"data=\"."
            },
            {
              "heading": "Tempel dan dekode",
              "body": "Tempelkan di atas dan tekan \"Temukan Place ID\". Place ID, CID, dan FID muncul, masing-masing dengan tombol salin."
            }
          ],
          "copiedBadge": "Disalin",
          "note": "Tautan pendek seperti map.app.goo.gl tidak dapat didekodekan tanpa mengikutinya di seluruh domain, jadi buka tautannya terlebih dahulu dan tempelkan alamat lengkapnya."
        },
        "identifiers": {
          "head": {
            "kicker": "Pengidentifikasi",
            "title": {
              "lead": "Tiga ID, ",
              "accent": "satu tempat",
              "tail": ""
            },
            "lead": "Place ID adalah pengenal stabil Google untuk suatu lokasi — string yang dimulai dengan \"ChIJ\" yang tetap valid meskipun bisnis berganti nama atau pindah."
          },
          "keys": {
            "placeId": "String \"ChIJ...\" digunakan oleh Tempat API, widget ulasan, dan sistem pemesanan.",
            "fid": "Sepasang nilai heksadesimal yang mengidentifikasi fitur yang sama secara internal.",
            "cid": "Bentuk desimal paruh kedua FID, digunakan oleh Maps lama URLs dan alat iklan."
          },
          "derive": {
            "label": "Bagaimana Place ID dan CID diturunkan dari FID",
            "source": "FID dari URL",
            "protobuf": "protobuf · little-endian",
            "base64": "base64url",
            "secondHalf": "2setengah",
            "hexToDecimal": "hex → desimal"
          },
          "features": [
            {
              "heading": "Tidak ada kunci API",
              "body": "Place ID sudah dikodekan di dalam tempat URL yang Anda tempel, sehingga alat dapat memecahkan kodenya secara offline."
            },
            {
              "heading": "Tidak ada batasan tarif",
              "body": "Tidak ada layanan pencarian yang terlibat — konversi dari Maps URL ke Place ID bersifat deterministik."
            },
            {
              "heading": "Tidak pernah diunggah",
              "body": "Seluruh perhitungan berjalan di tab browser Anda — URL yang Anda tempel tidak pernah dikirim ke server mana pun."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Apakah Place ID pernah berubah?",
              "answer": "Jarang. Google dokumen Tempatkan ID sebagai pengidentifikasi jangka panjang yang stabil, namun sejumlah kecil ID dapat dihentikan ketika lokasi digabungkan atau direstrukturisasi. Jika konsumen Place ID melaporkannya sebagai tidak valid, cari lagi tempatnya dan segarkan nilai yang disimpan."
            },
            {
              "question": "Apakah Place ID sama dengan CID?",
              "answer": "Tidak. CID adalah pengidentifikasi desimal yang digunakan oleh tautan Maps dan alat periklanan lama, sedangkan Place ID adalah string \"ChIJ...\" yang digunakan oleh Places API. Keduanya mengidentifikasi fitur yang sama namun tidak dapat dipertukarkan, itulah sebabnya alat ini melaporkan keduanya."
            },
            {
              "question": "Mengapa tautan map.app.goo.gl saya ditolak?",
              "answer": "Tautan pendek hanya terselesaikan ke tempat penuh URL setelah pengalihan lintas domain, yang tidak dapat diikuti oleh alat khusus browser tanpa mengirimkan tautan Anda ke pihak ketiga. Buka tautan pendek di browser Anda dan tempelkan URL lengkap yang muncul di bilah alamat."
            },
            {
              "question": "Apakah saya memerlukan kunci Google API untuk ini?",
              "answer": "Tidak. Place ID sudah dikodekan di dalam tempat URL yang Anda tempel, sehingga alat dapat memecahkan kodenya secara offline. Kunci Google API hanya diperlukan ketika Anda ingin memanggil Tempat API dengan ID setelahnya."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Butuh ID Tempat ",
            "accent": "dalam skala besar?",
            "tail": ""
          },
          "lead": "MapsGrab mengekstrak Place ID, CID, dan FID untuk setiap bisnis yang dikumpulkannya — bersama 33 kolom lainnya — dan mengekspor langsung ke CSV atau JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Pembuat Tautan Ulasan — Ulasan Langsung Gratis URL | MapsGrab",
          "description": "Ubah tempat Google Maps URL menjadi tautan ulasan langsung Google yang dapat Anda bagikan dengan pelanggan. Gratis, berbasis browser, dan tidak ada yang diunggah."
        },
        "hero": {
          "title": {
            "lead": "Tautan Ulasan Google ",
            "accent": "Generator",
            "tail": ""
          },
          "description": "Tempelkan Google Maps tempat URL dan dapatkan tautan langsung \"tulis ulasan\" untuk bisnis tersebut — jalur terpendek dari pelanggan yang puas ke ulasan Google."
        },
        "form": {
          "urlLabel": "Google Maps tempat URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Hasilkan tautan ulasan",
          "errorShortLink": "Tautan pendek (maps.app.goo.gl) tidak didukung. Buka tautan di browser Anda dan tempelkan URL lengkap dari bilah alamat.",
          "errorInvalidUrl": "Ini tidak terlihat seperti tempat Google Maps URL. Buka tempat di Google Maps dan salin URL lengkap (harus berisi \"/maps/place/\" dan \"@\" atau \"data=\").",
          "errorNoIds": "Tidak ada pengidentifikasi tempat yang ditemukan di URL ini. Pastikan Anda menyalin URL halaman tempat, bukan halaman hasil pencarian."
        },
        "result": {
          "linkLabel": "Tautan ulasan",
          "open": "Membuka"
        },
        "howTo": [
          {
            "heading": "Apa itu tautan ulasan Google?",
            "body": "Tautan ulasan adalah pintasan yang membuka dialog ulasan satu bisnis tertentu di Google. Daripada meminta pelanggan menelusuri bisnis Anda, gulir ke bagian ulasan, dan tekan \"Tulis ulasan\", Anda mengirimi mereka ulasan URL — search.google.com/local/reviews?placeid=… — yang langsung masuk ke formulir ulasan. Bisnis memasang tautan ini di email tindak lanjut, kode QR di konter, dan pesan SMS pasca transaksi."
          },
          {
            "heading": "Cara menghasilkan tautan ulasan",
            "body": "Buka Google Maps, temukan bisnis Anda, dan buka halaman tempatnya. Salin URL panjang dari bilah alamat dan tempel di atas. Tekan \"Buat tautan ulasan\" dan alat tersebut akan membuat tautan langsung dengan ID tempat yang dikodekan, siap untuk disalin atau dibuka. Tautannya bersifat universal: dapat digunakan pada browser desktop dan pada aplikasi seluler Google Maps."
          },
          {
            "heading": "Dari mana ID tempat itu berasal",
            "body": "Alat ini menggunakan kembali decoding lokal yang sama dengan Place ID Finder: pengidentifikasi sudah ada di Maps URL, dan konversi ke formulir \"ChIJ...\" terjadi sepenuhnya di browser Anda. Jika Anda mengelola beberapa lokasi, ulangi prosesnya per tempat — atau biarkan MapsGrab memuat kolom Place ID di setiap ekspor sehingga tautan ulasan dapat dibuat secara massal dari spreadsheet."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Apakah tautan ulasan akan kedaluwarsa?",
              "answer": "Tidak. Tautan terikat ke ID tempat dari lokasi tersebut, yang Google tetap stabil. Selama tempat tersebut ada di Google Maps, tautan akan terus membuka dialog ulasannya."
            },
            {
              "question": "Bisakah saya menggunakan satu tautan untuk beberapa lokasi?",
              "answer": "Setiap tautan ulasan dimiliki tepat di satu tempat. Buat tautan terpisah per lokasi — bisnis multi-lokasi biasanya menyimpan tabel ID tempat dan mendapatkan tautan darinya."
            },
            {
              "question": "Apakah meminta ulasan dengan link diperbolehkan?",
              "answer": "Meminta ulasan jujur ​​​​dari pelanggan tidak masalah; tidak memberikan insentif atau memfilter ulasan. Kebijakan Google melarang kompensasi untuk ulasan dan gerbang ulasan — kirimkan tautan yang sama ke setiap pelanggan dan biarkan masukan yang berbicara sendiri."
            },
            {
              "question": "Mengapa tautan saya membuka halaman pencarian dan bukan formulir ulasan?",
              "answer": "Hal ini terjadi jika ID tempat pada tautan salah — biasanya akibat URL yang diedit secara manual. Buat ulang tautan dari tempat Maps asli URL dan verifikasi Place ID dimulai dengan \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Lacak setiap ulasan yang ",
            "accent": "dapatkan",
            "tail": ""
          },
          "lead": "MapsGrab menarik ulasan halaman bisnis mana pun — peringkat, teks, tanggal, dan balasan pemilik — sehingga Anda dapat melihat masukan masuk dan menjawabnya lebih cepat."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Pemeriksa Email — Validator Format Email Gratis | MapsGrab",
          "description": "Periksa alamat email untuk melihat kesalahan sintaksis dan kesalahan ketik yang umum secara instan. Validasi format gratis yang berjalan di browser Anda — tanpa pemeriksaan SMTP, tidak ada yang dikirim ke mana pun."
        },
        "hero": {
          "title": {
            "lead": "Email ",
            "accent": "Pemeriksa",
            "tail": ""
          },
          "description": "Ketikkan alamat email dan langsung lihat apakah formatnya valid — plus petunjuk untuk kesalahan ketik yang paling umum. Semuanya berjalan di browser Anda."
        },
        "form": {
          "emailLabel": "Alamat email",
          "emailPlaceholder": "name@example.com",
          "submit": "Verifikasi email",
          "validHeading": "Alamat email ini tampaknya valid.",
          "invalidHeading": "Alamat email ini bermasalah:",
          "issues": {
            "empty": "Masukkan alamat email terlebih dahulu.",
            "multipleAt": "Alamat tersebut berisi lebih dari satu simbol \"@\".",
            "missingAt": "Alamatnya tidak memiliki \"@\" yang memisahkan bagian lokal dari domain.",
            "localEmpty": "Bagian sebelum \"@\" kosong.",
            "localTooLong": "Bagian sebelum \"@\" lebih panjang dari karakter 64 yang diizinkan oleh standar email.",
            "localInvalidChars": "Bagian sebelum \"@\" berisi karakter yang tidak diperbolehkan di alamat email (spasi, tanda kutip, atau karakter kontrol).",
            "localDotPosition": "Titik-titik di bagian lokal tidak boleh menjadi yang pertama, terakhir, atau muncul dua kali berturut-turut.",
            "domainEmpty": "Bagian setelah \"@\" kosong.",
            "domainNoTld": "Domain tidak memiliki akhiran (TLD) — tambahkan sesuatu seperti \".com\" atau \".org\".",
            "domainInvalidChars": "Domain berisi karakter yang tidak diperbolehkan (spasi, garis bawah, atau simbol).",
            "domainLabelHyphen": "Label domain tidak boleh diawali atau diakhiri dengan tanda hubung.",
            "domainEmptyLabel": "Domain berisi dua titik berturut-turut atau segmen kosong.",
            "domainTooLong": "Panjang domain melebihi 253 karakter yang diizinkan oleh standar email.",
            "typoDomain": "Domain ini tampak seperti salah ketik dari penyedia email populer."
          }
        },
        "howTo": [
          {
            "heading": "Apa yang dilakukan pemeriksa ini — dan apa yang sengaja tidak dilakukannya",
            "body": "Alat ini memvalidasi format alamat email: bentuk bagian lokal, \"@\", dan domain, mengikuti aturan praktis spesifikasi RFC yang sebenarnya diterapkan oleh server email. Ini juga menandai kemungkinan kesalahan ketik pada penyedia kotak surat populer, satu-satunya penyebab paling umum dari alamat mati dalam daftar prospek. Itu tidak mengirimkan penyelidikan apa pun ke server email: verifikasi SMTP akan mengungkapkan alamatnya kepada pihak ketiga, yang bertentangan dengan menjalankan seluruh pemeriksaan secara lokal di browser Anda."
          },
          {
            "heading": "Cara memeriksa alamat email",
            "body": "Ketik atau tempel alamatnya dan tekan \"Verifikasi email\". Hasil berwarna hijau berarti formatnya berbentuk penyampaian; hasil berwarna merah mencantumkan setiap aturan yang dilanggar alamatnya, dan — jika domain terlihat seperti penyedia yang salah eja — menyarankan penyedia yang dimaksud. Perbaiki masalah yang dilaporkan dan verifikasi lagi hingga alamatnya lolos."
          },
          {
            "heading": "Dimana pemeriksaan format cocok dengan alur kerja data",
            "body": "Validasi format adalah filter pertama dan termurah untuk daftar email apa pun: validasi ini menghapus alamat yang tidak akan pernah dapat mencapai kotak surat sebelum Anda menghabiskan anggaran keterkiriman atau pengayaan untuk alamat tersebut. MapsGrab menerapkan pemikiran ini ke seluruh alur kerja prospek — ekstensi ini memperkaya setiap bisnis yang dikumpulkan dengan alamat email yang ditemukan di situs resminya, sehingga langkah verifikasi di bagian hilir dimulai dari daftar yang jauh lebih rapi."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Apakah alat ini memeriksa apakah kotak surat benar-benar ada?",
              "answer": "Tidak — sengaja. Pengecekan keberadaan memerlukan menanyakan server email penerima (SMTP probing), yang tidak dapat dilakukan secara pribadi di browser dan dapat membuat IP Anda ditandai. Alat ini memverifikasi segala sesuatu yang dapat diverifikasi tanpa menyentuh jaringan: struktur, karakter yang diizinkan, dan kesalahan ketik umum penyedia."
            },
            {
              "question": "Bisakah suatu alamat lewat di sini dan masih terpental?",
              "answer": "Ya. Alamat yang sempurna secara sintaksis masih bisa ditutup, penuh, atau ditinggalkan. Validasi format menghapus alamat yang salah bahkan sebelum pengiriman dilakukan — validasi ini tidak dapat menjamin bahwa kotak surat yang tampak valid dapat dibaca oleh manusia."
            },
            {
              "question": "Mengapa \"nama@localhost\" ditolak?",
              "answer": "Pemeriksa memerlukan domain dengan akhiran publik (TLD) karena alamat tanpa akhiran tidak dapat menerima email dari internet luar. Standar yang mengizinkan domain khusus internal tidak relevan untuk daftar prospek dan data pelanggan."
            },
            {
              "question": "Apakah masukan saya disimpan di mana saja?",
              "answer": "Tidak. Validasi berjalan seperti JavaScript di tab browser Anda; tidak ada yang dikirim, dicatat, atau disimpan — muat ulang halaman dan masukannya hilang."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Kumpulkan email yang layak untuk ",
            "accent": "diverifikasi",
            "tail": ""
          },
          "lead": "MapsGrab menemukan alamat email dan profil sosial di balik setiap bisnis yang diekstraksi — langsung dari situs web masing-masing bisnis."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Konversikan Lat Long ke DMS — Derajat Desimal ke Derajat Menit Detik | MapsGrab",
          "description": "Ubah format desimal lintang dan bujur menjadi derajat, menit, detik (DMS) secara instan. Konverter koordinat berbasis browser gratis, tidak ada yang diunggah."
        },
        "hero": {
          "title": {
            "lead": "Konversikan Lintang Bujur ke ",
            "accent": "DMS",
            "tail": ""
          },
          "description": "Masukkan garis lintang dan bujur desimal dan baca koordinat yang sama dalam derajat, menit, detik — dengan huruf belahan bumi, siap disalin."
        },
        "form": {
          "latitudeLabel": "Lintang (desimal, -90 hingga 90)",
          "longitudeLabel": "Bujur (desimal, -180 hingga 180)",
          "placeholder": "37.774929",
          "submit": "Konversikan ke DMS",
          "errorLatitude": "Lintang harus berupa angka antara -90 dan 90.",
          "errorLongitude": "Garis bujur harus berupa angka antara -180 dan 180."
        },
        "result": {
          "dms": "Koordinat di DMS"
        },
        "howTo": [
          {
            "heading": "Apa itu derajat desimal dan DMS?",
            "body": "Peta dan spreadsheet menyimpan koordinat dalam derajat desimal — satu angka bertanda per sumbu, seperti 37.774929, -122.419416. Survei, peta kelautan, dan banyak dokumen properti menggunakan notasi sexagesimal lama: derajat, menit, dan detik dengan huruf belahan bumi, seperti 37° 46' 29.74\" N, 122° 25' 9.90\" W. Keduanya menjelaskan hal yang sama; bentuk DMS hanya membagi pecahan menjadi satuan-satuan yang lebih kecil, dengan satu menit adalah 1/60 derajat dan satu detik adalah 1/60 menit."
          },
          {
            "heading": "Bagaimana cara mengkonversi",
            "body": "Tempelkan garis lintang dan bujur desimal dan tekan \"Konversikan ke DMS\". Nilai negatif dipetakan ke belahan bumi selatan dan barat dan dilaporkan sebagai S dan W. Detik ditunjukkan dengan dua desimal — sekitar satu meter resolusi permukaan tanah, lebih presisi dibandingkan tangkapan GPS konsumen mana pun. Salin hasilnya sebagai satu baris untuk dokumen, atau sebagai bidang terpisah untuk spreadsheet."
          },
          {
            "heading": "Mengapa hal ini penting untuk pekerjaan data peta",
            "body": "Perjalanan bolak-balik koordinat adalah titik gesekan harian ketika memindahkan data bisnis antar alat: Google Maps mengekspor desimal, sedangkan alur kerja kadaster dan pencetakan mengharapkan DMS. MapsGrab menjaga skala gesekan ini tetap rendah — setiap bisnis yang diekstraksi telah mengekspor garis lintang dan bujurnya, dan konversi koordinat batch dapat dijalankan secara offline dengan rumus yang sama yang digunakan halaman ini."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Seberapa tepat hasil DMS?",
              "answer": "Detik ditampilkan ke dua desimal. Satu detik garis lintang kira-kira sama dengan 30 meter, jadi dua desimal menghasilkan sekitar 30 sentimeter — jauh lebih sempit daripada data GPS yang mendasarinya. Presisi dibatasi oleh masukan Anda, bukan konversi."
            },
            {
              "question": "Apa yang dimaksud dengan N, S, E, dan W disini?",
              "answer": "Mereka menggantikan tanda nilai desimal: garis lintang positif adalah utara (N) dan garis lintang negatif adalah selatan (S); bujur positif adalah timur (E) dan negatif adalah barat (W). Alat ini mengambil huruf dari tanda secara otomatis."
            },
            {
              "question": "Bisakah saya mengubah DMS kembali ke desimal di sini?",
              "answer": "Ya — gunakan alat pendamping \"Konversi DMS ke DD\" di situs ini. Mengonversi kedua cara dengan implementasi yang sama menghindari pembulatan penyimpangan antara rumus yang berbeda."
            },
            {
              "question": "Apakah data koordinat saya sudah diunggah?",
              "answer": "Tidak. Konversinya adalah aritmatika biasa di tab browser Anda; tidak ada yang Anda ketik yang meninggalkan halaman."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Koordinat untuk setiap bisnis, sudah ",
            "accent": "diekstraksi",
            "tail": ""
          },
          "lead": "MapsGrab menulis garis lintang dan garis bujur pada setiap baris yang diekspor — tidak ada pencarian koordinat manual untuk proyek perutean atau wilayah berikutnya."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Konversi DMS ke DD — Derajat Menit Detik ke Derajat Desimal | MapsGrab",
          "description": "Ubah koordinat derajat, menit, detik menjadi derajat desimal secara instan. Konverter DMS ke DD berbasis browser gratis, tidak ada yang diunggah."
        },
        "hero": {
          "title": {
            "lead": "Konversikan DMS ke DD ",
            "accent": "(Lat, Long)",
            "tail": ""
          },
          "description": "Masukkan derajat, menit, dan detik untuk kedua sumbu dan dapatkan derajat desimal yang bersih — format Google Maps, spreadsheet, dan MapsGrab pahami."
        },
        "form": {
          "latitudeHeading": "Lintang (N/S)",
          "longitudeHeading": "Bujur (Timur/Barat)",
          "degreesLabel": "Derajat",
          "minutesLabel": "Menit busur",
          "secondsLabel": "Detik busur",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Konversikan ke desimal",
          "errorValues": "Derajat harus nol atau bilangan bulat positif, menit dan detik harus antara 0 dan 60."
        },
        "result": {
          "dd": "Koordinat dalam derajat desimal"
        },
        "howTo": [
          {
            "heading": "Mengapa mengubah DMS kembali ke derajat desimal?",
            "body": "Derajat-menit-detik adalah notasi yang dapat dilihat oleh manusia, namun hampir setiap sistem yang dapat digunakan oleh mesin menginginkan derajat desimal: pencarian Google Maps, impor GIS, rumus jarak spreadsheet, dan jalur geocoding. Konversinya adalah jumlah tertimbang sederhana — derajat ditambah menit dibagi 60 ditambah detik dibagi 3600 — dengan huruf belahan bumi yang menentukan tandanya."
          },
          {
            "heading": "Bagaimana cara mengkonversi",
            "body": "Isi derajat, menit, dan detik untuk lintang dan bujur dan pilih huruf belahan bumi (N/S dan E/W). Tekan \"Konversikan ke desimal\" dan alat ini akan menampilkan kedua sumbu sebagai angka desimal bertanda dengan enam tempat desimal, yang menghasilkan sekitar 11 sentimeter di permukaan tanah — lebih dari cukup untuk penggunaan lokasi bisnis apa pun. Tempelkan hasilnya langsung ke Google Maps atau spreadsheet Anda."
          },
          {
            "heading": "Menjaga konsistensi data koordinat",
            "body": "Notasi campuran adalah alasan umum mengapa lokasi berakhir di laut yang salah setelah diimpor. Memutuskan derajat desimal satu kali dan mengonversi segala sesuatu di batasnya akan membuat jaringan pipa tetap sehat. MapsGrab sudah mengekspor koordinat dalam derajat desimal, sehingga data yang dikumpulkan dengan ekstensi tersebut dimasukkan ke alat GIS dan BI tanpa langkah konversi apa pun."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Berapa banyak tempat desimal yang saya perlukan?",
              "answer": "Enam angka desimal menghasilkan sekitar 11 sentimeter — di luar keakuratan GPS konsumen. Lima tempat (sekitar 1 meter) cukup untuk lokasi usaha; desimal yang lebih sedikit sengaja mengaburkan maksudnya."
            },
            {
              "question": "Berapa kisaran yang harus dipenuhi oleh bidang tersebut?",
              "answer": "Menit dan detik berkisar dari 0 hingga di bawah 60. Derajat lintang mencapai 90 dan bujur hingga 180; konverter melaporkannya ketika suatu nilai akan mendarat di luar globe."
            },
            {
              "question": "Haruskah saya memasukkan angka negatif saat memilih S atau W?",
              "answer": "Tidak - huruf belahan bumi sudah mengkodekan tandanya. Jika Anda memasukkan nilai yang ditandatangani dan huruf yang bertentangan secara bersamaan, alat akan menandai kontradiksi tersebut alih-alih menebak."
            },
            {
              "question": "Apakah konversi dilakukan di server?",
              "answer": "Tidak. Rumusnya berjalan di browser Anda; tidak ada yang Anda ketik yang dikirim ke mana pun."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Lewati pekerjaan koordinat manual ",
            "accent": "dalam skala besar",
            "tail": ""
          },
          "lead": "MapsGrab mengekspor garis lintang dan bujur desimal untuk setiap bisnis yang dikumpulkannya, di samping kolom alamat, telepon, dan Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Generator Kata Kunci Massal — Kombinasi Kata Kunci + Lokasi | MapsGrab",
          "description": "Hasilkan kombinasi kata kunci dan lokasi secara massal untuk tugas SEO lokal dan pengumpul dataan peta. Tempel dua daftar, dapatkan setiap kombinasi, unduh sebagai CSV. Bebas."
        },
        "hero": {
          "title": {
            "lead": "",
            "accent": "Generator",
            "tail": " Kata Kunci Massal"
          },
          "description": "Tempelkan kata kunci dan lokasi Anda, dan dapatkan setiap kombinasi \"kata kunci + lokasi\" sebagai daftar siap tempel atau CSV — cara tercepat untuk menyemai kampanye penelusuran lokal."
        },
        "form": {
          "keywordsLabel": "Kata kunci (satu per baris)",
          "keywordsPlaceholder": "agen desain\nkedai kopi\ntukang ledeng",
          "locationsLabel": "Lokasi (satu per baris)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Urutan kombinasi",
          "keywordFirst": "kata kunci + lokasi (agensi desain New York)",
          "locationFirst": "lokasi + kata kunci (New York agen desain)",
          "submit": "Hasilkan kombinasi",
          "resultCount": "{count} kombinasi dihasilkan.",
          "errorKeywords": "Tambahkan setidaknya satu kata kunci.",
          "errorLocations": "Tambahkan setidaknya satu lokasi."
        },
        "howTo": [
          {
            "heading": "Untuk apa pembuatan kata kunci massal?",
            "body": "Kampanye penelusuran lokal menggunakan kombinasi: layanan yang sama diulangi di setiap kota, distrik, atau lingkungan yang Anda layani. Sepuluh kata kunci di sepuluh lokasi adalah seratus frasa pencarian — \"agen desain New York\", \"agen desain Chicago\", dan seterusnya. Menuliskannya dengan tangan rawan kesalahan; menghasilkannya dari dua daftar membutuhkan waktu beberapa detik dan menjamin tidak ada yang terlewat."
          },
          {
            "heading": "Cara menghasilkan kombinasi",
            "body": "Tempelkan kata kunci Anda di kotak pertama — satu per baris — dan lokasi Anda di kotak kedua. Pilih apakah kata kunci atau lokasi didahulukan, lalu tekan \"Hasilkan\". Setiap kata kunci dipasangkan dengan setiap lokasi, baris kosong dan duplikat dihapus, dan daftar lengkap muncul di bawah dengan hitungan. Salin langsung ke Google Daftar kata kunci iklan, Google Pemeriksaan tren, atau antrian tugas pengumpul dataan peta."
          },
          {
            "heading": "Dari daftar kata kunci hingga data yang dikumpulkan",
            "body": "Langkah klasik berikutnya adalah menjalankan setiap kombinasi sebagai pencarian Google Maps dan mengumpulkan hasilnya. Perulangan itulah yang diotomatisasi oleh MapsGrab: ekstensi menerima daftar kata kunci sebagai tugas batch, menelusuri penelusuran satu per satu, dan mengekspor setiap bisnis yang ditemukan — sehingga kombinasi yang Anda hasilkan di sini menjadi baris terstruktur tanpa penyalinan manual."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Berapa banyak kombinasi yang dapat saya hasilkan?",
              "answer": "Sebanyak yang dapat ditampung browser Anda — alat ini mengalikan dua daftar dan menghapus duplikatnya secara lokal. Sepuluh ribu kombinasi baik-baik saja; untuk batch yang sangat besar, download CSV lebih praktis dibandingkan menyalin textarea."
            },
            {
              "question": "Apakah duplikat dihapus?",
              "answer": "Ya. Baris duplikat dalam setiap daftar dihilangkan sebelum dipasangkan, dan keluarannya berisi setiap pasangan lokasi kata kunci tepat satu kali, sesuai urutan yang Anda pilih."
            },
            {
              "question": "Urutan mana yang harus saya gunakan?",
              "answer": "Keduanya adalah perilaku pencarian nyata. \"Plumber Austin\" dibaca seperti cara orang mengetik di Maps; \"Tukang ledeng Austin\" dibaca seperti ungkapan SEO tradisional. Menghasilkan kedua pesanan adalah cara umum untuk mencakup varian penelusuran."
            },
            {
              "question": "Bisakah saya menggunakan distrik kota atau kode pos sebagai lokasi?",
              "answer": "Ya — apa pun yang masuk akal sebagai akhiran penelusuran Maps berfungsi: distrik, kode pos, wilayah metro, atau pasangan lengkap \"kota, negara bagian\". Satu baris per lokasi."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Ubah daftar kata kunci menjadi ",
            "accent": "hasil",
            "tail": ""
          },
          "lead": "MapsGrab tugas batch menjalankan setiap kata kunci sebagai pencarian Maps dan mengekspor bisnis di belakangnya — CSV atau JSON, dengan ulasan, foto, dan pengayaan kontak."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Gabungkan CSV File Secara Online — Gabungkan Beberapa File CSV Gratis | MapsGrab",
          "description": "Gabungkan beberapa file CSV secara online menjadi satu file. Header kolom disejajarkan secara otomatis berdasarkan gabungan — gratis, pribadi, dan sepenuhnya berbasis browser."
        },
        "hero": {
          "title": {
            "lead": "Gabungkan File CSV ",
            "accent": "Online",
            "tail": ""
          },
          "description": "Unggah dua atau lebih CSV file dan unduh satu file gabungan. Kolom disejajarkan berdasarkan header — kolom yang hilang dibiarkan kosong. File tidak pernah meninggalkan browser Anda."
        },
        "form": {
          "filesLabel": "CSV file",
          "filesHint": "Pilih dua atau lebih file .csv. Periksa setiap file dengan label terjemahan pada baris 2 untuk melewati baris tersebut. Penggabungan CSV menyimpan satu baris header nama bidang. File tetap berada di browser Anda.",
          "translationRow": "Lewati baris 2 (label yang diterjemahkan) di {name}",
          "submit": "Gabungkan file",
          "errorNoFiles": "Pilih setidaknya dua file CSV untuk digabungkan.",
          "errorEmptyFile": "Salah satu file kosong atau tidak memiliki baris header: {name}",
          "fileSummary": "{name} — {rows} baris data",
          "resultSummary": "Menggabungkan {files} file menjadi {rows} baris × {columns} kolom.",
          "previewLabel": "Pratinjau CSV digabungkan"
        },
        "howTo": [
          {
            "heading": "Apa gunanya penggabungan di sini?",
            "body": "Penggabungan tumpukan beberapa CSV ekspor ke dalam satu tabel: kolom disejajarkan berdasarkan nama header di semua file, dan setiap baris data menyimpan nilainya di bawah header yang cocok. File digabungkan dari atas ke bawah sesuai urutan yang Anda pilih, sehingga hasilnya dibaca sebagai satu kumpulan data berkelanjutan. Kolom yang hanya ada di beberapa file tetap berada di output; baris dari file tanpanya mendapatkan sel kosong — gabungan semua header."
          },
          {
            "heading": "Cara menggabungkan file CSV",
            "body": "Pilih dua atau lebih file .csv — misalnya ekspor mingguan alur kerja pengumpul dataan peta. Tekan \"Gabungkan file\" dan alat tersebut akan menguraikan setiap file di browser Anda, melaporkan jumlah baris masing-masing file, dan membuat tabel gabungan. Unduh sebagai satu CSV yang terbuka dengan rapi di Excel, Google Spreadsheet, atau impor basis data apa pun."
          },
          {
            "heading": "Dibuat untuk pengumpulan data multi-proses",
            "body": "Kasus penggunaan yang umum adalah menambahkan proses: setiap sesi ekstraksi MapsGrab mengekspor CSV miliknya sendiri, dan penggabungan menjadikan sesi minggu ini menjadi satu kumpulan data sebelum deduplikasi dan pembersihan. Parser menangani kolom yang dikutip, koma yang disematkan, dan baris baru di dalam sel (RFC 4180), sehingga ekspor dengan alamat multi-baris atau cuplikan ulasan digabungkan dengan benar."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Pertanyaan umum",
            "tail": ""
          },
          "items": [
            {
              "question": "Apa yang terjadi jika file memiliki kolom berbeda?",
              "answer": "File yang digabungkan berisi gabungan semua header sesuai urutan kemunculannya pertama kali. Baris dari file yang tidak memiliki kolom mendapatkan sel kosong di kolom tersebut. Tidak ada yang dihapus atau diganti namanya."
            },
            {
              "question": "Apakah file saya diunggah ke server?",
              "answer": "Tidak. File dibaca dengan FileReader browser API dan digabungkan dalam memori di tab Anda. Tidak ada yang dikirimkan, dan menutup halaman akan menghapus semuanya."
            },
            {
              "question": "Apakah penggabungan menghapus baris duplikat?",
              "answer": "Tidak - penggabungan adalah penggabungan lurus dengan kolom-kolom yang sejajar. Deduplikasi (misalnya dengan Place ID) adalah langkah pembersihan terpisah yang Anda jalankan pada file gabungan."
            },
            {
              "question": "Seberapa besar ukuran filenya?",
              "answer": "Batasannya adalah memori tab browser Anda, bukan angka tetap. Untuk ekspor data bisnis pada umumnya — ribuan hingga beberapa ratus ribu baris — penggabungan terjadi secara instan. Untuk file yang sangat besar, gabungkan dalam beberapa batch."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Satu ekspor per proses — atau ",
            "accent": "satu kumpulan data",
            "tail": ""
          },
          "lead": "MapsGrab ekspor bersih CSV/JSON per sesi dengan pemilihan bidang dan Place ID deduplikasi, sehingga kumpulan data multi-proses mulai hampir digabungkan."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Perusahaan",
  "about": {
    "navLabel": "Tentang",
    "seoTitle": "Tentang MapsGrab | Produk dan Batasan",
    "seoDescription": "MapsGrab adalah perangkat data peta untuk data bisnis publik: ekstensi browser, Cloud Pengumpul online, server API dan MCP, dan alat web gratis. Pelajari di mana batas datanya.",
    "hero": {
      "eyebrow": "Tentang MapsGrab",
      "title": {
        "lead": "Data Maps, diambil dengan ",
        "accent": "mudah",
        "tail": ""
      },
      "intro": "MapsGrab membuat alat yang mengumpulkan informasi bisnis yang tersedia untuk umum dari Google Maps dan mengubahnya menjadi data yang bersih dan terstruktur — ekstensi browser untuk Edge dan Firefox, Pengumpul online berbasis cloud, server API dan MCP, ditambah alat web gratis yang sepenuhnya dijalankan di browser Anda.",
      "contactLabel": "Hubungi Dukungan",
      "extensionLabel": "Jelajahi Ekstensi",
      "stageLabel": "Akses awal",
      "updatedLabel": "Diterbitkan dan ditinjau",
      "updatedAt": "Agustus 31, 2026",
      "chips": [
        {
          "label": "Mengumpulkan",
          "value": "Hanya data publik"
        },
        {
          "label": "Hasil ekstensi",
          "value": "Di peramban Anda"
        },
        {
          "label": "Ekspor",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Seret untuk memutar"
    },
    "build": {
      "kicker": "Apa yang kami bangun",
      "title": {
        "lead": "Satu perangkat, ",
        "accent": "empat",
        "tail": " cara masuk"
      },
      "lead": "Pilih ekstensi browser, Pengumpul online berbasis cloud, atau API. Ekstensi ini berfungsi di dalam browser Anda sendiri; Scraper Online dan API berbagi satu mesin cloud, dan server MCP membawa API tersebut ke agen AI.",
      "hub": {
        "title": "MapsGrab perangkat data",
        "detail": "Data bisnis · ulasan · foto · email & pengayaan sosial"
      },
      "tags": {
        "extension": [
          "36 ekstraksi kolom",
          "Ulasan & foto",
          "Tugas batch"
        ],
        "online": [
          "Kata kunci kumpulan",
          "Pengayaan kontak",
          "Satu 37-kolom CSV per tugas"
        ],
        "api": [
          "Data bisnis",
          "Ulasan",
          "Terstruktur JSON"
        ],
        "mcp": [
          "Dua alat",
          "Streamable HTTP",
          "Kunci OAuth atau API"
        ]
      },
      "toolsLead": "Ditambah alat web gratis.",
      "toolsText": "Alat web gratis di situs ini menangani pekerjaan kecil — ID tempat, meninjau tautan, mengoordinasikan konversi, CSV penggabungan — tanpa memasang apa pun.",
      "toolsLabel": "Alat web gratis"
    },
    "principles": {
      "kicker": "Prinsip",
      "title": {
        "lead": "Dimana ",
        "accent": "batas",
        "tail": " berada"
      },
      "lead": "MapsGrab sengaja bersikap konservatif terhadap data. Ini adalah aturan produk yang kami patuhi.",
      "publicData": {
        "title": "Hanya data publik",
        "text": "Hanya informasi bisnis yang tersedia untuk umum — yang sudah dapat dilihat oleh pengunjung halaman mana pun.",
        "visibleTag": "Terlihat oleh pengunjung mana pun",
        "privateTag": "Akun pribadi"
      },
      "localFirst": {
        "title": "Lokal-pertama",
        "text": "Dengan ekstensi dan alat web gratis, pengaturan dan hasil Anda ditampilkan di browser Anda, bukan di server kami. Server Scraper Online, API dan MCP dijalankan di cloud kami, dan hasil Scraper Online disimpan ke akun Anda.",
        "storage": "penyimpanan lokal",
        "rows": [
          "Pengaturan",
          "Hasil",
          "Tugas batch"
        ]
      },
      "backend": {
        "title": "Ekstensi & alat gratis: empat pekerjaan backend",
        "text": "Untuk ekstensi dan alat web gratis, backend kami menangani empat hal: konfigurasi jarak jauh, status akun dan kuota, pengayaan email/sosial opsional, dan log penggunaan minimal.",
        "chips": [
          "Konfigurasi",
          "Kuota",
          "Penyuburan",
          "Log penggunaan"
        ]
      },
      "never": {
        "title": "Tidak ada iklan. Tidak ada pelacak. Tidak ada penjualan data.",
        "text": "Tidak ada iklan, tidak ada pelacak pihak ketiga di ekstensi, dan tidak ada penjualan atau penyewaan data.",
        "chips": [
          "Iklan",
          "Pelacak pihak ketiga",
          "Menjual data"
        ]
      },
      "inWriting": {
        "kicker": "Secara tertulis",
        "title": "Kebijakan & Ketentuan Privasi",
        "text": "Masing-masing aturan ini dijabarkan dalam Kebijakan Privasi dan Ketentuan Layanan.",
        "link": "Baca Kebijakan Privasi"
      }
    },
    "dataFlow": {
      "kicker": "Bagaimana data berpindah",
      "title": {
        "lead": "Apa yang tinggal bersama Anda, dan apa yang ",
        "accent": "sampai kepada kami",
        "tail": ""
      },
      "lead": "Ekstensi ini berfungsi pada data yang ditampilkan secara publik dan menyimpan hasilnya di browser Anda. Untuk ekstensi dan alat web gratis, backend kami hanya mendukung konfigurasi, kuota, pengayaan opsional, dan log penggunaan minimal. Server Scraper Online, API dan MCP dijalankan di cloud kami, dan hasil Scraper Online disimpan ke akun Anda.",
      "source": {
        "label": "Sumber",
        "title": "Google Maps halaman yang Anda kunjungi",
        "text": "Data bisnis publik — nama, alamat, telepon, situs web, peringkat, ulasan, foto."
      },
      "browser": {
        "label": "Browser Anda · mengutamakan lokal",
        "storage": "penyimpanan lokal · IndexedDB",
        "rows": [
          "Pengaturan",
          "Hasil ekstraksi",
          "Status tugas batch"
        ],
        "badge": "Disimpan di browser Anda"
      },
      "backend": {
        "label": "MapsGrab backend · empat tujuan",
        "lanes": [
          {
            "title": "Konfigurasi jarak jauh",
            "text": "Preset struktur halaman yang membuat ekstraksi tetap berfungsi"
          },
          {
            "title": "Akun & kuota",
            "text": "Masuk, status paket, akuntansi penggunaan bulanan"
          },
          {
            "title": "Email & pengayaan sosial",
            "text": "Kontak yang terdaftar secara publik, saat fitur tersebut digunakan"
          },
          {
            "title": "Pencatatan penggunaan",
            "text": "Catatan minimal penggunaan fitur dan kesalahan"
          }
        ]
      },
      "never": {
        "label": "Tidak pernah",
        "items": [
          "Tidak ada iklan",
          "Tidak ada pelacak pihak ketiga di ekstensi",
          "Tidak ada penjualan atau penyewaan data pribadi",
          "Tidak ada koleksi riwayat penjelajahan Anda selain halaman Google Maps yang Anda ekstrak"
        ]
      },
      "note": "Situs web ini menggunakan Google Analytics 4 untuk mengukur penggunaan halaman agregat — ekstensi itu sendiri tidak mengandung analisis.",
      "noteLink": "Baca Kebijakan Privasi"
    },
    "status": {
      "kicker": "Status",
      "title": {
        "lead": "Akses awal, ",
        "accent": "gratis",
        "tail": " untuk memulai"
      },
      "access": {
        "title": "Akses awal",
        "text": "Produk ini dalam akses awal. Daftar toko untuk Add-on Edge dan Firefox Add-on sedang diselesaikan.",
        "link": "Panduan pemasangan"
      },
      "quota": {
        "title": "Kuota bulanan gratis",
        "text": "Ekstensi ini berfungsi tanpa akun dalam kuota bulanan gratis.",
        "link": "Apa yang termasuk"
      },
      "paid": {
        "title": "Paket berbayar untuk penggunaan yang lebih berat",
        "text": "Paket berbayar meningkatkan batasan untuk penggunaan yang lebih berat. Lihat halaman Harga untuk tingkatan saat ini.",
        "link": "Lihat harga"
      }
    }
  },
  "contact": {
    "navLabel": "Kontak",
    "seoTitle": "Hubungi Dukungan MapsGrab",
    "seoDescription": "Hubungi MapsGrab tentang akun, ekstensi browser, penagihan, alat, atau permintaan privasi.",
    "eyebrow": "Hubungi MapsGrab",
    "title": {
      "lead": "Bicaralah dengan ",
      "accent": "manusia",
      "tail": ""
    },
    "intro": "Menulis kepada kami dan seseorang akan membacanya. Dukungan saat ini ditangani langsung oleh tim yang membangun MapsGrab.",
    "emailCardLabel": "Email dukungan",
    "copyEmail": "Salin {email}",
    "emailLabel": "Dukungan Email",
    "emailSubject": "MapsGrab permintaan dukungan",
    "responseTimes": "Kami menjawab email dukungan dalam satu hari kerja, biasanya lebih cepat. Permintaan privasi mungkin memerlukan waktu beberapa hari ketika kami perlu memverifikasi kepemilikan akun terlebih dahulu.",
    "include": {
      "title": "Apa yang harus disertakan",
      "text": "Laporan yang tepat membantu kami mengidentifikasi alur kerja yang terpengaruh tanpa meminta informasi akun sensitif.",
      "items": [
        "Halaman URL dan tindakan yang Anda coba",
        "Nama dan versi browser Anda",
        "Pesan kesalahan yang sebenarnya dan tangkapan layar bila berguna",
        "Nomor pesanan untuk pertanyaan penagihan, tanpa detail kartu pembayaran"
      ]
    },
    "topics": {
      "title": "Apa yang bisa kami bantu",
      "items": [
        "Instalasi dan pengaturan ekstensi browser",
        "Masalah akses akun dan proses masuk",
        "Pertanyaan kuota, langganan, perpanjangan, dan pembayaran",
        "Masalah alat web dan permintaan fitur",
        "Permintaan privasi dan data akun"
      ]
    },
    "aboutLabel": "Tentang",
    "privacyLabel": "Kebijakan Privasi",
    "termsLabel": "Ketentuan Layanan"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Rumah",
    "crumbLegal": "Legal",
    "switchLabel": "Dokumen hukum",
    "readTime": "{minutes} min baca",
    "sectionCount": "{count} bagian",
    "tocTitle": "Di halaman ini",
    "tocLabel": "{title} bagian",
    "glanceKicker": "Sekilas",
    "glanceNote": "Ringkasan teks lengkap di bawah ini.",
    "anchorLabel": "Salin tautan ke “{title}”",
    "copyEmail": "Salin {email}",
    "contactSupport": "Hubungi dukungan",
    "nextLabel": "Dokumen berikutnya"
  },
  "terms": {
    "navLabel": "Ketentuan",
    "seoTitle": "Ketentuan Layanan | MapsGrab",
    "seoDescription": "Ketentuan Layanan MapsGrab: penggunaan yang dapat diterima, tanggung jawab pengguna atas data yang dikumpulkan, pembelian, penafian, dan cara menghubungi kami.",
    "title": "Ketentuan Layanan",
    "intro": "Ketentuan ini mengatur penggunaan Anda atas MapsGrab: ekstensi browser, situs web ini, dan alat web gratis. Harap membacanya sebelum menggunakan layanan ini.",
    "updatedLabel": "Terakhir diperbarui",
    "updatedAt": "Agustus 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Penggunaan yang dapat diterima, tanggung jawab pengguna atas data yang dikumpulkan, pembelian, penafian, dan cara menghubungi kami.",
    "helpTitle": "Ada pertanyaan tentang Ketentuan ini?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Hanya data publik",
        "text": "Layanan ini hanya berfungsi dengan informasi yang ditampilkan secara publik pada halaman yang Anda jelajahi."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Penggunaan Anda, tanggung jawab Anda",
        "text": "Anda memutuskan apa yang akan dikumpulkan dan bagaimana menggunakannya — sesuai dengan hukum yang berlaku bagi Anda."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Tidak diperlukan akun untuk memulai",
        "text": "Ekstensi ini berfungsi tanpa akun dalam kuota bulanan gratis."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Batalkan kapan saja",
        "text": "Langganan diperbarui hingga dibatalkan; pembatalan menghentikan pembaruan di masa mendatang."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Penerimaan persyaratan",
        "paragraphs": [
          "Dengan mengakses atau menggunakan MapsGrab, Anda menyetujui Ketentuan ini. Jika Anda tidak menyetujuinya, jangan memasang ekstensi atau menggunakan situs web dan alatnya."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Apa yang dilakukan layanan tersebut",
        "paragraphs": [
          "MapsGrab membantu Anda mengumpulkan informasi yang ditampilkan secara publik di Google Maps halaman yang Anda kunjungi — detail bisnis, ulasan, foto, dan informasi kontak terkait — dan mengekspornya. Layanan ini terdiri dari ekstensi browser untuk Microsoft Edge dan Firefox, situs web ini, dan alat web gratis yang berjalan di browser Anda."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Data yang tersedia untuk umum",
        "paragraphs": [
          "Layanan ini dirancang untuk bekerja hanya dengan informasi yang ditampilkan secara publik di halaman yang Anda jelajahi. Itu tidak mengakses akun pribadi, konten yang dilindungi undang-undang, atau data yang memerlukan akses khusus di luar apa yang dapat dilihat pengunjung mana pun."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Tanggung jawab Anda",
        "paragraphs": [
          "Anda memutuskan apa yang akan dikumpulkan dan bagaimana menggunakannya, dan Anda bertanggung jawab atas penggunaan tersebut. Saat Anda menggunakan informasi yang dikumpulkan, patuhi undang-undang yang berlaku bagi Anda dan tujuan Anda.",
          "Secara khusus, Anda setuju untuk tidak:"
        ],
        "items": [
          "Gunakan layanan ini untuk aktivitas apa pun yang melanggar hukum atau melanggar hak pihak ketiga.",
          "Identifikasi ulang individu atau buat profil orang pribadi dari data bisnis yang dikumpulkan.",
          "Gunakan rincian kontak yang dikumpulkan untuk spam atau pesan massal yang tidak diminta.",
          "Menjual kembali data mentah yang dikumpulkan sebagai produk data pesaing tanpa perjanjian terpisah dengan kami.",
          "Mengganggu, membebani, atau berupaya mengganggu layanan atau platform yang bekerja dengannya."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Akun dan kuota",
        "paragraphs": [
          "Ekstensi ini berfungsi tanpa akun dalam kuota bulanan gratis. Beberapa fitur — batas lebih tinggi, pembelian, integrasi cloud — memerlukan akun. Anda bertanggung jawab untuk menjaga keamanan kredensial akun Anda dan aktivitas yang terjadi di akun Anda."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Pembelian dan langganan",
        "paragraphs": [
          "Paket berbayar dijelaskan di halaman Harga. Harga, kuota, dan periode penagihan ditampilkan sebelum Anda membeli, dan pembelian ditangani melalui penyedia pembayaran yang ditawarkan saat checkout. Paket berlangganan diperpanjang secara otomatis hingga dibatalkan, dan Anda dapat membatalkannya kapan saja; pembatalan menghentikan pembaruan di masa mendatang."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "Layanan disediakan apa adanya",
        "paragraphs": [
          "Layanan disediakan \"sebagaimana adanya\" dan \"sebagaimana tersedia\". Platform sering berubah, dan fitur koleksi dapat berhenti berfungsi sebagian atau seluruhnya kapan saja. MapsGrab tidak memberikan jaminan, tersurat maupun tersirat, tentang ketersediaan tanpa gangguan, kelengkapan data yang dikumpulkan, atau kesesuaian untuk tujuan tertentu.",
          "Kami dapat mengubah, menangguhkan, atau menghentikan bagian mana pun dari layanan, dan kami dapat memperbarui Ketentuan ini. Jika perubahannya bersifat material, kami akan mengumumkannya di situs web ini. Penggunaan yang berkelanjutan setelah perubahan berlaku berarti Anda menerima Ketentuan yang diperbarui."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Batasan tanggung jawab",
        "paragraphs": [
          "Sejauh diizinkan oleh undang-undang, MapsGrab dan operatornya tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial — termasuk hilangnya keuntungan atau data — yang timbul dari penggunaan atau ketidakmampuan Anda menggunakan layanan ini."
        ]
      },
      {
        "id": "contact",
        "title": "Kontak",
        "paragraphs": [
          "Pertanyaan mengenai Ketentuan ini dapat dikirimkan ke support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Catatan cakupan",
      "badge": "TBD",
      "lead": "Belum tercakup:",
      "text": "Scraper Online (cloud berjalan), Scraper / Ulasan / Foto API dan server MCP. Teks di atas menjelaskan ekstensi, situs web ini, dan alat web gratis."
    }
  },
  "privacy": {
    "navLabel": "Pribadi",
    "seoTitle": "Kebijakan Privasi | MapsGrab",
    "seoDescription": "Kebijakan Privasi MapsGrab: data apa yang diproses oleh ekstensi dan situs web, di mana data tersebut disimpan, untuk apa backend kami digunakan, dan batasan yang kami ikuti.",
    "title": "Kebijakan Privasi",
    "intro": "Kebijakan ini menjelaskan data apa yang MapsGrab tangani, di mana data tersebut disimpan, dan apa yang sampai ke server kami. Versi singkatnya: ekstensi berfungsi pada data yang ditampilkan secara publik dan menyimpan hasilnya di browser Anda; selain layanan cloud kami, backend kami hanya mendukung konfigurasi, kuota, pengayaan opsional, dan log penggunaan minimal; dan kami tidak menjalankan iklan dan pelacak pihak ketiga di ekstensi. Permintaan ke layanan cloud kami — server Scraper Online, API dan MCP — diproses di server kami, dan hasil Scraper Online ditautkan ke akun Anda sehingga Anda dapat mengunduhnya.",
    "updatedLabel": "Terakhir diperbarui",
    "updatedAt": "Oktober 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Data apa yang diproses oleh ekstensi dan situs web, di mana data tersebut disimpan, untuk apa backend kami digunakan, dan batasan yang kami ikuti.",
    "helpTitle": "Ada pertanyaan tentang kebijakan ini?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Dimana hasilnya disimpan",
        "text": "Ekstensi dan alat web gratis menyimpan data Anda di browser Anda; Hasil Scraper Online ditautkan ke akun Anda."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Apa yang mencapai server kami",
        "text": "Permintaan ke server Scraper Online, API dan MCP, ditambah konfigurasi, akun dan kuota, pengayaan opsional, dan log penggunaan minimal."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Tidak ada iklan, tidak ada pelacak",
        "text": "Tidak ada pelacak pihak ketiga di ekstensi, dan tidak ada penjualan atau penyewaan data pribadi."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Penghapusan data",
        "text": "Menghapus ekstensi akan menghapus data lokal; kirim email kepada kami untuk menghapus data akun backend."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Data proses ekstensi",
        "paragraphs": [
          "Ekstensi ini menangani kategori data berikut:"
        ],
        "items": [
          "Data bisnis publik — informasi yang ditampilkan pada halaman Google Maps yang Anda kunjungi (nama, alamat, telepon, situs web, peringkat, ulasan, foto, dll.) saat Anda menggunakan fitur ekstraksi.",
          "Pengaturan Anda — preferensi yang Anda konfigurasikan (format ekspor, pemilihan bidang, sakelar otomatisasi, bahasa antarmuka).",
          "Data teknis dan interaksi — peristiwa penggunaan minimal (penghitung penggunaan fitur, pesan kesalahan) yang digunakan agar ekstensi tetap berfungsi terhadap perubahan halaman Google.",
          "Pengidentifikasi akun yang kami keluarkan — pengidentifikasi perangkat anonim dan, jika Anda masuk, email akun dan status paket atau kuota Anda."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Tempat data disimpan",
        "paragraphs": [
          "Dengan ekstensi, pengaturan, hasil ekstraksi, dan status tugas batch disimpan secara lokal di browser Anda (penyimpanan lokal ekstensi dan IndexedDB). Mereka tidak pernah meninggalkan perangkat Anda kecuali Anda memicu ekspor atau salah satu integrasi opsional yang dijelaskan di bawah. Alat web gratis juga memproses apa yang Anda masukkan di browser Anda.",
          "Token Google Drive dan HubSpot OAuth, jika Anda menghubungkannya, juga hanya disimpan di browser Anda.",
          "Tugas Scraper online dijalankan di server kami. Hasilnya disimpan di akun Anda sehingga Anda dapat mendownloadnya dari Dasbor Anda."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Apa proses backend kami",
        "paragraphs": [
          "Permintaan yang Anda buat ke layanan cloud kami — Pengumpul online, server API dan MCP — diproses di server kami. Server kami juga mengelola akses ke layanan ini, termasuk kunci API Anda dan otorisasi klien MCP yang Anda setujui, dan menyimpan catatan penggunaan Anda.",
          "Klien MCP yang Anda otorisasi menerima hasil permintaan yang dibuatnya. Anda dapat mencabut otorisasi dari Dasbor Anda.",
          "Selain layanan cloud ini, ekstensi dan situs web ini menghubungi server kami sendiri untuk empat tujuan:"
        ],
        "items": [
          "Konfigurasi jarak jauh — preset struktur halaman yang membuat ekstraksi tetap berfungsi saat Google mengubah halamannya.",
          "Layanan akun dan kuota — login, status paket, dan akuntansi penggunaan bulanan.",
          "Pengayaan email dan media sosial — mencari detail kontak yang terdaftar secara publik di situs web bisnis yang dikumpulkan saat fitur tersebut digunakan.",
          "Pencatatan penggunaan — catatan minimal penggunaan fitur dan kesalahan yang digunakan untuk memelihara dan meningkatkan layanan."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Integrasi opsional Google Drive dan HubSpot",
        "paragraphs": [
          "Hanya jika Anda menghubungkannya secara eksplisit dalam pengaturan, data yang diekspor akan diunggah ke Google Drive Anda sendiri atau disinkronkan ke akun HubSpot Anda sendiri. Integrasi ini menggunakan otorisasi Anda, bertindak atas nama Anda, dan dapat dicabut kapan saja dari pengaturan ekstensi atau dari akun Google / HubSpot Anda."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Analisis situs web",
        "paragraphs": [
          "Situs web ini menggunakan Google Analytics 4 (GA4) untuk mengukur penggunaan halaman agregat. GA4 adalah satu-satunya analitik pihak ketiga yang kami gunakan, dan hanya berjalan di situs web ini — ekstensinya sendiri tidak berisi analitik."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "Apa yang tidak pernah kami lakukan",
        "paragraphs": [
          "Batasan ini berlaku di seluruh ekstensi dan situs web:"
        ],
        "items": [
          "Tidak ada iklan.",
          "Tidak ada pelacak pihak ketiga di ekstensi.",
          "Tidak ada penjualan atau penyewaan data pribadi.",
          "Tidak ada koleksi riwayat penjelajahan Anda selain halaman Google Maps yang Anda ekstrak."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Penghapusan data",
        "paragraphs": [
          "Menghapus ekstensi akan menghapus semua data yang disimpan secara lokal. Jika Anda ingin data akun backend Anda dihapus, hubungi kami di support@mapsgrab.com dan kami akan menghapusnya."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Perubahan pada kebijakan ini",
        "paragraphs": [
          "Kami memperbarui kebijakan ini ketika layanan berubah. Tanggal di atas mencerminkan revisi terbaru, dan perubahan material akan diumumkan di situs web ini."
        ]
      },
      {
        "id": "contact",
        "title": "Kontak",
        "paragraphs": [
          "Pertanyaan atau permintaan tentang privasi dapat dikirim ke support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Otorisasi aplikasi AI | MapsGrab",
  "title": "Hubungkan aplikasi AI ke akun Anda",
  "intro": "Sebuah aplikasi meminta untuk mengakses akun MapsGrab Anda. Izinkan hanya jika Anda sendiri yang memulai koneksi ini.",
  "loading": "Memuat permintaan koneksi...",
  "hostLabel": "Alamat aplikasi",
  "selfDeclared": "Nama yang diberikan aplikasi itu sendiri: {name}",
  "loopbackTitle": "Aplikasi lokal",
  "loopbackText": "Aplikasi ini berjalan di komputer, sehingga alamatnya tidak dapat menunjukkan siapa yang membuatnya. Izinkan hanya jika Anda baru saja memulai koneksi ini dari aplikasi yang Anda percaya.",
  "loopbackHost": "Komputer ini",
  "accountLabel": "Masuk sebagai",
  "switchAccount": "Ganti akun",
  "permissionsTitle": "Jika Anda mengizinkannya, aplikasi ini bisa",
  "permissions": [
    "Telusuri bisnis dan baca ulasan serta foto publiknya di Google Maps.",
    "Gunakan tunjangan permintaan bulanan paket API Anda."
  ],
  "revokeNote": "Anda dapat memutuskan sambungannya kapan saja di bawah Aplikasi terhubung di manajemen API.",
  "approve": "Mengizinkan",
  "deny": "Tolak dan kembali ke {host}",
  "denyLoopback": "Tolak dan kembali ke aplikasi",
  "redirecting": "Kembali ke aplikasi...",
  "invalidTitle": "Permintaan koneksi ini tidak valid atau telah kedaluwarsa",
  "invalidText": "Kembali ke aplikasi AI Anda dan mulai terhubung lagi.",
  "errorTitle": "Permintaan koneksi ini tidak dapat diselesaikan",
  "errorReasons": {
    "rate_limited": "Terlalu banyak upaya koneksi yang dilakukan dari jaringan Anda. Tunggu beberapa menit sebelum mencoba lagi.",
    "invalid_client": "Aplikasi belum terdaftar, atau pendaftarannya belum selesai.",
    "invalid_redirect_uri": "Alamat pengirim yang dikirim oleh aplikasi tidak sesuai dengan yang didaftarkan.",
    "unsupported_response_type": "Aplikasi meminta jenis otorisasi yang tidak didukung.",
    "invalid_pkce": "Aplikasi tidak mengirimkan pemeriksaan keamanan yang diperlukan (PKCE dengan S256).",
    "invalid_resource": "Aplikasi tidak meminta akses ke server MapsGrab MCP, atau meminta server lain.",
    "server_error": "MapsGrab tidak dapat menyimpan permintaan ini sekarang. Silakan coba lagi sebentar lagi."
  },
  "errorHint": "Mulai koneksi lagi dari aplikasi AI Anda. Jika masalah berlanjut, hubungi pengembang aplikasi.",
  "signInTitle": "Masuk untuk melanjutkan",
  "signInText": "Masuk ke akun MapsGrab yang ingin Anda sambungkan. Permintaan ini akan menunggu Anda.",
  "signIn": "Masuk",
  "loadFailed": "Tidak dapat memuat permintaan koneksi. Periksa jaringan Anda dan coba lagi.",
  "decideFailed": "Tidak dapat menyelesaikan tindakan ini. Periksa jaringan Anda dan coba lagi.",
  "retry": "Coba lagi"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Pembayaran dikirimkan",
      "description": "Kami sedang mengkonfirmasi pembayaran Anda. Tab asli akan diperbarui secara otomatis."
    },
    "confirmedCredits": {
      "title": "Kredit ditambahkan",
      "description": "Pembayaran ClinkBill Anda telah dikonfirmasi dan Kredit telah ditambahkan. Anda dapat kembali ke tab asli."
    },
    "confirmedSubscription": {
      "title": "Paket diaktifkan",
      "description": "Pembayaran ClinkBill Anda telah dikonfirmasi dan paket MapsGrab Anda aktif. Anda dapat kembali ke tab asli."
    },
    "failed": {
      "title": "Pembayaran perlu diperhatikan",
      "description": "Kami tidak dapat mengkonfirmasi pesanan ini. Kembali ke tab asli dan coba lagi."
    }
  },
  "cancel": {
    "title": "Pembayaran dibatalkan",
    "description": "Tidak ada pembayaran yang diselesaikan. Anda dapat kembali dan memilih metode pembayaran lain."
  }
}
