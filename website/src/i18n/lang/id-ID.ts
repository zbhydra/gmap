import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { idIDPricingContent } from '../pricing'

export const idID: SiteContent = {
  site: {
    name: 'Unduh video Telegram | TG Downloader',
    description:
      'Gunakan TG Downloader untuk unduh video Telegram di Telegram Web, simpan file dan media yang sudah dimuat, lalu lanjutkan di setiap channel privat Telegram.',
    keywords:
      'unduh video Telegram, unduh media Telegram, simpan video Telegram, unduh file Telegram, channel privat Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Pengunduh',
      home: 'Beranda',
      pricing: 'Harga',
      solutions: 'Solusi',
      changelog: 'Perubahan'
    },
    footer: {
      resources: 'Sumber daya',
      rights: '© 2026 TG Downloader. Hak cipta dilindungi.'
    }
  },
  common: {
    installCta: 'Instal Sekarang'
  },
  sections: {
    features: {
      title: 'Fitur unduh media Telegram',
      subtitle:
        'Fitur unduh media Telegram ini mencakup file, gambar, video, batch besar, dan konten yang sudah dimuat di Telegram Web.',
      metaDescription:
        'TG Downloader features: multi-file batch saves, private channel support, 1GB+ large file downloads, real-time media detection, and privacy-first design with no login required.',
      items: [
        {
          title: 'Unduh Batch',
          description:
            'Mendukung unduh batch dengan seleksi multi, unduh semua file media dari channel atau grup dengan satu klik',
          details: [
            'Dukungan unduhan batch dengan seleksi multi',
            'Unduh seluruh channel/grup dengan satu klik',
            'Filter cerdas berdasarkan jenis file',
            'Manajemen antrian unduhan'
          ]
        },
        {
          title: 'Konten Terbatas',
          description: 'Unduh media dari channel terbatas dan grup privat bahkan tanpa izin',
          details: [
            'Akses konten channel terbatas',
            'Unduh dari grup privat',
            'Tidak perlu verifikasi izin',
            'Bekerja dengan versi A/K'
          ]
        },
        {
          title: 'Dukungan Multi-Format',
          description: 'Mendukung gambar, video, GIF, audio dan format media lainnya',
          details: [
            'Gambar: JPG, PNG, WEBP, GIF',
            'Video: MP4, WEBM, MOV',
            'File audio: MP3, M4A, OGG',
            'Deteksi format otomatis'
          ]
        },
        {
          title: 'Aman & Terlindungi',
          description:
            'Tidak perlu kata sandi atau login API, tidak ada data pengguna yang dikumpulkan',
          details: [
            'Tidak perlu kata sandi atau login API',
            'Tidak ada data pengguna yang dikumpulkan',
            'Bebas virus dan iklan',
            'Pengujian keamanan ketat'
          ]
        },
        {
          title: 'Dukungan File Besar',
          description: 'Unduh stabil file lebih dari 1GB dengan dukungan lanjut',
          details: [
            'Unduhan stabil file lebih dari 1GB',
            'Dukungan lanjut untuk unduhan terputus',
            'Transfer cepat dan stabil',
            'Pelacakan kemajuan'
          ]
        },
        {
          title: 'Deteksi Real-Time',
          description:
            'Memindai dan mendeteksi sumber media secara otomatis, perbarui daftar unduhan secara real-time',
          details: [
            'Pindai otomatis sumber media halaman',
            'Deteksi sumber real-time',
            'Pembaruan daftar otomatis',
            'Caching sumber cerdas'
          ]
        }
      ]
    },
    steps: {
      title: 'Panduan simpan video Telegram',
      subtitle:
        'Ikuti panduan simpan video Telegram ini, buka pesan di Telegram Web, lalu simpan video atau media lain hanya dengan beberapa langkah.',
      metaDescription:
        'Step-by-step guide to saving Telegram videos, files, and albums with TG Downloader. Learn to install the extension, detect media in Telegram Web, and batch-download content.',
      items: [
        {
          title: 'Instal Ekstensi',
          description: 'Cari dan instal TG Downloader dari toko ekstensi browser Anda'
        },
        {
          title: 'Pin Ekstensi',
          description: 'Klik toolbar browser untuk menyematkan ikon ekstensi untuk akses cepat'
        },
        {
          title: 'Buka Telegram Web',
          description:
            'Kunjungi web.telegram.org, ekstensi akan otomatis mulai memindai sumber media'
        },
        {
          title: 'Unduh Batch',
          description:
            'Pilih file untuk diunduh dan klik tombol unduh untuk menyimpannya secara lokal'
        }
      ]
    },
    cta: {
      title: 'Siap Memulai?',
      description: 'Instal ekstensi dan mulai mengunduh media dari Telegram sekarang.'
    },
    techSpecs: {
      title: 'Spesifikasi Teknis',
      browsersLabel: 'Browser',
      browsers: 'Chrome, Edge, Brave, dan semua browser berbasis Chromium',
      telegramVersionsLabel: 'Versi Telegram',
      telegramVersions: 'Versi Web K dan versi A',
      permissionsLabel: 'Izin',
      permissions: 'Izin minimum diperlukan',
      updatesLabel: 'Pembaruan',
      updates: 'Pembaruan otomatis dari toko ekstensi'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Unduh Media dari Channel Privat dan Terbatas Telegram',
        description:
          'Satu klik, tanpa login, mendukung file 1GB+. Unduh batch dari channel privat dan konten terbatas.'
      },
      stats: {
        users: 'Pengguna Seluruh Dunia',
        downloads: 'Total Unduhan'
      },
      seo: {
        title: 'Pengunduh Video Privat Telegram: Unduh Media Privat Apa Pun',
        description:
          'Simpan video channel privat Telegram dengan panduan pengunduh yang mudah. Unduh video dan media yang dapat diakses, atasi unduhan yang gagal, dan temukan metode yang tepat untuk perangkat Anda.',
        keywords:
          'pengunduh video privat telegram, pengunduh video channel privat telegram, unduh video privat telegram, telegram private video downloader'
      },
      heroTrustPoints: [
        'Unduh video HD',
        'Tanpa registrasi',
        'Ramah seluler',
        'Berfungsi di Windows, Mac, Android, dan iPhone'
      ],
      situation: {
        title: 'Mulai di Sini: Situasi Mana yang Sesuai dengan Anda?',
        intro:
          'Sebagian besar pengguna yang mencari pengunduh video privat Telegram berusaha menyelesaikan salah satu masalah berikut:',
        headers: ['Situasi Anda', 'Coba ini dulu'],
        rows: [
          {
            cells: [
              'Anda memiliki tautan video Telegram dari sebuah channel atau chat',
              'Tempel tautan ke pengunduh video Telegram online'
            ]
          },
          {
            cells: [
              'Anda dapat menonton video di channel privat tetapi tidak dapat menyimpannya',
              'Coba opsi Save Video As di Telegram Desktop'
            ]
          },
          {
            cells: [
              'Video dapat diputar, tetapi pengunduhan dan penerusan diblokir',
              'Gunakan perekaman layar hanya jika Anda memiliki izin untuk menyimpan salinannya'
            ]
          },
          {
            cells: [
              'Pengunduh mengatakan tidak ada video yang ditemukan',
              'Periksa akses, jenis tautan, batasan channel, dan apakah video dapat dibuka di luar Telegram'
            ]
          }
        ]
      },
      solutions: {
        title: 'Apa yang Berhasil untuk Video Privat Telegram?',
        intro:
          'Video privat Telegram biasanya berarti video yang dibagikan di channel privat, grup privat, atau chat langsung. Video ini hanya terlihat oleh anggota yang disetujui, sehingga mengunduhnya berbeda dengan menyimpan media dari channel publik.',
        quickAnswer:
          'Jawaban singkat: Jika tautannya dapat diakses, gunakan pengunduh video privat Telegram online. Jika video hanya terlihat di dalam Telegram, coba Telegram Desktop. Jika penyimpanan diblokir tetapi Anda diizinkan menyimpan kontennya, perekaman layar bisa menjadi alternatif yang praktis.',
        items: [
          {
            title: 'Solusi 1: Pengunduh Video Telegram Online',
            description:
              'Terbaik untuk tautan Telegram yang dapat diakses. Ini adalah metode paling sederhana bagi pengguna yang ingin mengunduh video Telegram online tanpa memasang aplikasi, ekstensi, atau bot.',
            useWhenLabel: 'Gunakan metode ini ketika:',
            useWhen: [
              'Tautan video Telegram bersifat publik atau dapat diakses.',
              'Anda ingin mengunduh video Telegram online.',
              'Anda membutuhkan file video HD dengan cepat.',
              'Anda tidak ingin memasang ekstensi browser atau aplikasi desktop.'
            ]
          },
          {
            title: 'Solusi 2: Save Video As di Telegram Desktop',
            description:
              'Ketika video tersedia di Telegram Desktop dan pengunduhan diizinkan, klik kanan video dan simpan ke folder di komputer Anda. Ini sering berfungsi lebih baik untuk anggota channel privat karena Anda sudah terautentikasi di dalam Telegram.',
            useWhenLabel: 'Gunakan metode ini ketika:',
            useWhen: [
              'Anda dapat melihat video di Telegram Desktop.',
              'Pemilik channel tidak menonaktifkan penyimpanan.',
              'Anda lebih suka mengunduh langsung ke Windows atau Mac.'
            ]
          },
          {
            title: 'Solusi 3: Perekaman Layar di Seluler atau Desktop',
            description:
              'Jika opsi pengunduhan dinonaktifkan tetapi Anda diizinkan melihat dan menyimpan kontennya, perekam layar dapat menangkap video dan audio saat diputar. Ini adalah alternatif, bukan metode pertama, karena memakan waktu lebih lama dan bergantung pada kualitas pemutaran.',
            useWhenLabel: 'Gunakan metode ini ketika:',
            useWhen: [
              'Anda memiliki izin untuk melihat dan menyimpan video.',
              'Tautan Telegram tidak dapat diproses oleh pengunduh.',
              'Anda membutuhkan salinan offline pribadi untuk referensi.'
            ]
          },
          {
            title: 'Solusi 4: Periksa Pengelola File Android',
            description:
              'Dalam beberapa kasus di Android, Telegram mungkin menyimpan media yang dimuat untuk sementara di folder aplikasi lokal. Pengelola file terkadang dapat membantu Anda menemukan video yang sudah dimuat di perangkat, tetapi ini bergantung pada versi aplikasi, izin penyimpanan, dan perilaku cache.',
            useWhenLabel: 'Gunakan metode ini ketika:',
            useWhen: [
              'Anda sudah memutar video di Telegram pada Android.',
              'Anda memahami izin penyimpanan aplikasi.',
              'Anda hanya perlu memulihkan file yang sudah ada di cache perangkat Anda.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Mengapa Menggunakan Pengunduh Video Telegram Online?',
        intro:
          'Pengunduh yang baik harus membantu Anda menjawab satu pertanyaan dengan cepat: dapatkah video Telegram ini disimpan dari tautan yang saya miliki? Pengalaman terbaik bersifat langsung, jelas, dan jujur ketika sebuah tautan privat tidak dapat diproses.',
        items: [
          {
            title: 'Simpan Video dalam Kualitas Tinggi',
            description:
              'Simpan video Telegram dalam kualitas terbaik yang tersedia untuk pemutaran offline, belajar, pelatihan, pengarsipan, atau referensi pribadi.'
          },
          {
            title: 'Berfungsi di Semua Perangkat',
            description:
              'Gunakan pengunduh dari browser di Android, iPhone, Windows, Mac, atau tablet. Ini penting ketika video ada di ponsel Anda tetapi Anda ingin menyimpannya ke perangkat lain.'
          },
          {
            title: 'Tanpa Login Telegram',
            description:
              'Pilih alat yang memproses tautan video tanpa meminta kata sandi Telegram, kode verifikasi, file sesi, atau kredensial akun privat Anda.'
          },
          {
            title: 'Pemutaran Offline yang Mudah',
            description:
              'Unduh file dalam format video umum jika tersedia, sehingga Anda dapat menontonnya nanti tanpa membuka Telegram atau menggunakan data seluler.'
          },
          {
            title: 'Proses Cepat Berbasis Tautan',
            description:
              'Salin, tempel, analisis, dan unduh. Jika tautan gagal, halaman seharusnya menjelaskan alasannya dan memberi tahu apa yang harus dicoba berikutnya.'
          },
          {
            title: 'Batas Izin yang Jelas',
            description:
              'Unduh hanya video yang berhak Anda akses dan simpan. Hormati aturan channel, hak kreator, dan kebijakan Telegram.'
          },
          {
            title: 'Download Story Telegram dari Tautan',
            description:
              'Tempel tautan Story Telegram yang dapat diakses untuk menyimpan foto atau videonya. Jika Story hanya terlihat di sesi Telegram Web Anda, buka di sana lalu gunakan ekstensi.'
          }
        ]
      },
      troubleshooting: {
        title: 'Jika Tautan Video Telegram Tidak Berfungsi',
        intro:
          'Tidak setiap tautan yang gagal berarti pengunduhnya rusak. Video privat Telegram sering gagal karena filenya tidak tersedia di luar Telegram. Coba daftar periksa berikut:',
        items: [
          'Buka tautan di browser dan pastikan halaman dapat dimuat.',
          'Pastikan Anda masih menjadi anggota channel atau grup privat tersebut.',
          'Periksa apakah pemilik channel telah menonaktifkan penyimpanan, penyalinan, atau penerusan.',
          'Coba Telegram Desktop jika video hanya dapat diputar di dalam aplikasi.',
          'Gunakan browser atau jaringan lain jika halaman tidak dapat menjangkau Telegram.',
          'Hindari alat apa pun yang meminta kode login Telegram Anda.'
        ]
      },
      permission: {
        title: 'Catatan Penting tentang Izin',
        note:
          'Pengunduh video privat Telegram tidak boleh digunakan untuk melewati privasi, hak cipta, atau batasan akses. Simpan video hanya ketika Anda memiliki izin dari pemiliknya atau ketika penggunaan Anda diizinkan oleh hukum dan ketentuan Telegram.'
      },
      comparison: {
        title: 'Pilih Metode Unduh Telegram yang Tepat',
        headers: ['Situasi', 'Solusi yang Disarankan', 'Cocok Untuk', 'Yang Perlu Diperiksa'],
        rows: [
          {
            cells: [
              'Tautan video Telegram publik atau dapat diakses',
              'Pengunduh video Telegram online',
              'Unduhan HD cepat tanpa aplikasi',
              'Tautan dapat dibuka dan video dapat dijangkau oleh alat tersebut'
            ]
          },
          {
            cells: [
              'Video channel privat dengan pengunduhan diizinkan',
              'Save Video As di Telegram Desktop',
              'Menyimpan langsung ke komputer',
              'Anda adalah anggota dan pemilik tidak menonaktifkan penyimpanan'
            ]
          },
          {
            cells: [
              'Penyimpanan dibatasi tetapi pemutaran terlihat',
              'Perekam layar bawaan atau pihak ketiga',
              'Referensi offline pribadi dengan izin',
              'Penangkapan audio, area layar, dan hukum lokal atau aturan platform'
            ]
          },
          {
            cells: [
              'Media yang di-cache Android',
              'Periksa pengelola file',
              'Menemukan media yang sudah dimuat di perangkat',
              'Akses penyimpanan aplikasi dan apakah Telegram menyimpan cache lokal'
            ]
          }
        ]
      },
      howTo: {
        title: 'Cara Mengunduh Video Telegram dalam 3 Langkah',
        subtitle:
          'Rute tercepat adalah pengunduh video Telegram berbasis tautan. Ini paling cocok ketika tautan video Telegram bersifat publik, dapat diakses, atau dapat dibaca di luar aplikasi Telegram.',
        steps: [
          {
            title: 'Salin Tautan Video',
            description:
              'Buka Telegram, temukan video yang ingin Anda simpan, dan salin tautan pesan atau tautan video dari menu bagikan. Jika channel tidak mengizinkan penyalinan tautan, lanjutkan ke solusi channel privat di bawah ini.'
          },
          {
            title: 'Tempel dan Analisis',
            description:
              'Tempel tautan Telegram ke kolom pengunduh. Alat akan memeriksa apakah file video yang dapat diunduh dapat dijangkau dari tautan tersebut.'
          },
          {
            title: 'Unduh dalam HD',
            description:
              'Pilih kualitas atau format yang tersedia, lalu simpan video Telegram langsung ke ponsel, tablet, atau komputer Anda. Jika tidak ada file yang muncul, tautan tersebut kemungkinan dibatasi, bukan rusak.'
          }
        ]
      },
      faq: {
        title: 'Pertanyaan yang Sering Diajukan',
        description: 'Pertanyaan yang sering diajukan orang sebelum mengunduh video atau file Telegram di Telegram Web.',
        items: [
          {
            question: 'Bisakah saya mengunduh video privat Telegram?',
            answer:
              'Anda hanya dapat mengunduh atau menyimpan video privat Telegram ketika Anda memiliki izin untuk mengaksesnya dan sumber videonya tersedia. Beberapa channel privat memblokir penyimpanan, penerusan, penyalinan tautan, atau akses eksternal.'
          },
          {
            question: 'Bagaimana cara mengunduh video channel privat Telegram?',
            answer:
              'Coba pengunduh berbasis tautan terlebih dahulu jika Anda memiliki tautan video Telegram yang dapat digunakan. Jika itu tidak berhasil, periksa opsi Save Video As di Telegram Desktop. Jika pengunduhan diblokir tetapi Anda diizinkan menyimpan kontennya, perekaman layar bisa menjadi alternatif.'
          },
          {
            question: 'Mengapa pengunduh video Telegram mengatakan tidak ada video yang ditemukan?',
            answer:
              'Tautan mungkin dibatasi, dihapus, kedaluwarsa, hanya terlihat di dalam Telegram, atau diblokir oleh pemilik channel. Buka tautan tersebut sendiri terlebih dahulu dan pastikan video masih dapat diputar. Jika hanya berfungsi setelah Anda masuk ke Telegram, pengunduh online mungkin tidak dapat mengaksesnya.'
          },
          {
            question: 'Apakah saya perlu memasang perangkat lunak?',
            answer:
              'Tidak untuk tautan yang dapat diakses. Pengunduh video Telegram online berfungsi di browser. Anda mungkin memerlukan Telegram Desktop, pengelola file, atau perekam layar untuk kasus privat atau terbatas tertentu.'
          },
          {
            question: 'Bisakah saya mengunduh video Telegram tanpa tautan?',
            answer:
              'Biasanya tidak. Pengunduh online memerlukan tautan video Telegram untuk menemukan filenya. Jika Anda tidak dapat menyalin tautan tetapi dapat menonton video di Telegram, gunakan Telegram Desktop atau metode lokal lain yang diizinkan.'
          },
          {
            question: 'Apakah aman memasukkan kode login Telegram saya ke dalam pengunduh?',
            answer:
              'Tidak. Pengunduh tidak seharusnya membutuhkan kata sandi Telegram, kode verifikasi, atau kredensial sesi Anda. Jika sebuah situs memintanya, tinggalkan halaman tersebut.'
          },
          {
            question: 'Apakah pengunduh media Telegram gratis?',
            answer:
              'Banyak pengunduh media Telegram berbasis tautan gratis untuk unduhan dasar. Hindari alat yang memaksa pemasangan mencurigakan, permintaan login, atau tombol yang menyesatkan.'
          },
          {
            question: 'Apakah legal mengunduh video Telegram?',
            answer:
              'Itu tergantung pada kontennya, izin Anda, dan tujuan penggunaan Anda. Jangan mengunduh atau mendistribusikan ulang konten berhak cipta, privat, atau terbatas tanpa otorisasi.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Akses web',
          title: 'Masuk untuk menyinkronkan kredit Anda',
          signedInAs: 'Masuk sebagai',
          continueWithGoogle: 'Lanjutkan dengan Google',
          googleLoading: 'Membuka Google...',
          or: 'atau',
          emailLabel: 'Email',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Lanjutkan dengan email',
          sendCode: 'Kirim kode',
          sendingCode: 'Mengirim...',
          sendCodeSuccess: 'Kode verifikasi telah dikirim.',
          sendAgain: 'Kirim lagi',
          codeLabel: 'Kode verifikasi',
          codePlaceholder: '123456',
          signIn: 'Masuk',
          termsNotice: 'Dengan masuk, Anda menyetujui',
          termsLink: 'Ketentuan',
          privacyLink: 'Kebijakan Privasi',
          logout: 'Keluar',
          creditsLabel: 'kredit'
        },
        quota: {
          eyebrow: 'Kuota web',
          title: 'Saldo kredit saat ini',
          planLabel: 'Paket',
          remainingLabel: 'Tersisa',
          dailyLimitLabel: 'Batas harian',
          unlimited: 'Tanpa batas'
        },
        checkin: {
          creditsLoading: 'Kredit',
          creditsButtonLabel: 'Buka check-in harian',
          accountButtonLabel: 'Buka menu akun',
          accountMenuLabel: 'Menu akun',
          title: 'Kredit gratis hari ini sudah siap',
          todayRewardText: 'Hadiah hari ini: {credits} kredit',
          claimedRewardText: 'Anda menerima {credits} kredit hari ini.',
          nextCountdown: 'Klaim berikutnya dalam {time}',
          nextAt: '(Penyegaran berikutnya: {time} EST)',
          claimButton: 'Klaim {credits} kredit',
          claimingButton: 'Mengklaim...',
          notNow: 'Nanti saja',
          close: 'Tutup',
          loadFailed: 'Gagal memuat status check-in.',
          claimFailed: 'Gagal mengklaim kredit.'
        },
        creditPurchase: {
          title: 'Beli kredit',
          description: 'Tambahkan kredit dan lanjutkan mengunduh dari ruang kerja ini.',
          successTitle: 'Kredit ditambahkan',
          successDescription: 'Saldo Anda sudah diperbarui. Tutup jendela ini dan mulai unduhan lagi.',
          packageEyebrow: 'Bayar sesuai penggunaan',
          cardNote: 'Gunakan kredit untuk unduhan web. Kredit tidak kedaluwarsa.',
          creditsAmount: '{credits} kredit',
          buyNow: 'Beli sekarang',
          selectPackage: 'Pilih',
          paymentMethodLabel: 'Pilih metode pembayaran',
          paymentTitle: 'Pilih metode pembayaran',
          selectedPackageLabel: 'Produk terpilih',
          confirmPurchase: 'Lanjut ke pembayaran',
          backToProducts: 'Kembali',
          close: 'Tutup',
          agreementText: 'Saya menyetujui ketentuan pembelian, Ketentuan, dan Kebijakan Privasi.',
          loadingConfigs: 'Memuat paket kredit...',
          loadFailed: 'Gagal memuat paket kredit. Coba lagi.',
          noConfigs: 'Belum ada paket kredit yang tersedia saat ini. Coba lagi nanti.',
          ready: 'Pilih paket kredit. Harga ditampilkan dalam USD.',
          creatingOrder: 'Membuat pesanan...',
          pendingPayment: 'Selesaikan pembayaran di tab yang baru dibuka. Kami akan memeriksa hasilnya otomatis.',
          pendingPaymentTitle: 'Menunggu pembayaran',
          cancelPayment: 'Batalkan pembayaran',
          supportMailPrefix: 'Laporkan masalah: ',
          success: 'Pembayaran selesai. Kredit sudah tersedia.',
          failed: 'Pembayaran belum selesai. Anda dapat mencoba lagi atau menutup jendela ini.',
          successCredits: '+{credits} kredit ditambahkan',
          successBalance: 'Saldo saat ini: {balance} kredit',
          createFailed: 'Gagal membuat pesanan. Coba lagi.',
          invalidPaymentData: 'Tautan pembayaran tidak valid. Coba lagi nanti.',
          priceUpdated: 'Harga berubah. Periksa harga terbaru lalu beli lagi.',
          gatewayFailed: 'Akses pembayaran sementara tidak tersedia. Coba lagi nanti.',
          paymentCanceled: 'Pembayaran dibatalkan. Pilih metode pembayaran dan coba lagi.',
          pollFailed: 'Gagal memperbarui status pembayaran. Coba lagi.',
          pollTimeout: 'Pembaruan otomatis habis waktu. Segarkan hasil setelah pembayaran.',
          orderNotFound: 'Pesanan tidak tersedia lagi. Buat pesanan baru.',
          orderExpired: 'Pesanan kedaluwarsa. Beli lagi.',
          fulfillmentFailed: 'Pembayaran diterima, tetapi kredit belum ditambahkan. Coba lagi nanti.',
          authExpired: 'Sesi masuk kedaluwarsa. Masuk lagi untuk melanjutkan.'
        },
        parse: {
          eyebrow: 'Parse langsung',
          title: 'Mulai unduh video Telegram',
          helperText:
            'Tempel tautan untuk menyiapkan unduh video Telegram pada konten yang sudah dimuat.',
          telegramMessageListLinkError:
            'Tautan Telegram ini membuka chat atau channel, bukan pesan tertentu. Salin tautan pesan yang tepat, lalu tempel di sini.',
          linkLabel: 'Tautan Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Hapus input',
          submit: 'Parse',
          submitting: 'Memproses...',
          noResults: 'Tidak ada file yang dapat diunduh ditemukan untuk pesan ini.',
          download: 'Unduh',
          downloading: 'Mengunduh...',
          downloadAll: 'Download all',
          downloadingAll: 'Downloading all...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Unknown size',
          play: 'Play',
          preparingPlayback: 'Preparing playback...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Close',
          continuePlayback: 'Continue playback',
          upgradeToPlay: 'Upgrade to play',
          playQuotaExhausted: 'Playback quota is used up for today.',
          playerRestoring: 'Restoring playback...',
          playerRestoredPaused: 'Ready. Continue from where you left off.',
          playerResumeFailed: 'Could not restore playback session. Please start again.',
          playerRefreshing: 'Refreshing playback...',
          playerRecreating: 'Recreating playback session...',
          playerUnsupported: 'This browser cannot play this video.',
          playerSessionExpired: 'Playback session expired. Start playback again.',
          playerFailed: 'Playback failed.',
          playQuotaUnavailable: 'Playback quota is unavailable. Sign in and try again.',
          playQuotaReached: 'Playback quota reached for today.',
          playerResourceBusy: 'This video is still being prepared. Try again in a moment.',
          resumeNotice:
            'Detected an unfinished download "{filename}" ({progress}). Do you want to continue?',
          resumeAction: 'Continue',
          pendingRestartText: 'Previous download record for "{filename}" can be restarted.',
          pendingRestartButton: 'Restart download',
          resumeUnavailableText: 'The local recovery record has expired.',
          resumeDismiss: 'Ignore',
          resuming: 'Resuming...',
          largeFileExtensionInlineChromeTitle: 'Ekstensi Chrome',
          largeFileExtensionInlineChromeDescription:
            'Ekstensi khusus Chrome untuk menangkap media Telegram dengan sekali klik.',
          largeFileExtensionInlineChromeCta: 'Instal ekstensi',
          largeFileExtensionInlineEdgeTitle: 'Ekstensi Edge',
          largeFileExtensionInlineEdgeDescription:
            'Ekstensi khusus Microsoft Edge, kompatibel dengan unduhan konten Telegram.',
          largeFileExtensionInlineEdgeCta: 'Instal ekstensi'
        },
        errors: {
          enterEmailFirst: 'Masukkan alamat email Anda terlebih dahulu.',
          enterEmailAndCode: 'Masukkan email dan kode verifikasi.',
          sendCodeFailed: 'Gagal mengirim kode verifikasi.',
          googleSignInFailed: 'Gagal masuk dengan Google.',
          googleClientMissing: 'Login Google belum dikonfigurasi.',
          restoreSessionFailed: 'Gagal memulihkan sesi.',
          signInFailed: 'Gagal masuk.',
          logoutFailed: 'Gagal keluar.',
          loadQuotaFailed: 'Gagal memuat kredit.',
          enterLink: 'Masukkan tautan media.',
          invalidLink: 'Ini bukan URL yang valid.',
          parseFailed: 'Gagal memproses tautan ini.',
          downloadFailed: 'Gagal mengunduh file ini.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'This link platform is not supported.',
          tiktokUnsupported: 'This TikTok link cannot be parsed yet. Use a public single video or photo post link.',
          vimeoParseFailed: 'This Vimeo video is private or cannot be parsed.',
          xParseFailed: 'Tautan X ini tidak didukung. Gunakan status video publik.',
          instagramParseFailed: 'Tautan Instagram ini tidak didukung. Gunakan posting publik.',
          instagramImageParseFailed: 'Tautan Instagram ini tidak didukung. Gunakan posting foto publik.',
          threadsParseFailed: 'Tautan Threads ini tidak didukung. Gunakan posting publik.',
          redditParseFailed: 'Gagal mengambil media Reddit. Gunakan posting publik berupa video, gambar, atau galeri.',
          douyinParseFailed: 'Gagal mengambil video Douyin ini. Gunakan tautan video publik.',
          quotaExceeded: 'Kredit tidak cukup untuk mengunduh file ini.',
          rateLimitExceeded: 'Too many requests. Please try again later.'
        },
        downloadAll: {
          allSuccess: 'All files downloaded.',
          partialFailed: 'Some files downloaded. Some files failed.',
          allFailed: 'All downloads failed.'
        },
        requiresClient: {
          privateChannel:
            'Unable to parse Telegram private channel content here. The free browser extension can download videos from any private channel you can access in Telegram Web.\nYou can try:\nPath 1 (recommended): click the "Download free extension" button to install the desktop browser extension.\nPath 2:\n1. Go back to Telegram.\n2. Right-click the message you want to download and choose Forward to send it to a public channel or group.\n3. Open that public channel or group.\n4. Right-click the forwarded message, copy its public message link, then paste it here.',
          privateChannelCta: 'Download free extension',
          restrictedFile: 'This restricted file needs TG Downloader inside Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'Pengunduh Video Lainnya',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Unduh video TikTok tanpa watermark dalam kualitas HD.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Unduh video dan GIF X/Twitter dalam kualitas HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Unduh video Vimeo dalam HD dengan berbagai pilihan resolusi.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Unduh video dan foto Threads dalam kualitas asli.'
          }
        ]
      }
    },
    changelog: {
      title: 'Catatan unduh video Telegram',
      description:
        'Ikuti setiap pembaruan tentang unduh video Telegram, alur web, dan sesi simpan yang lebih panjang.',
      seoTitle: 'Catatan unduh video Telegram | TG Downloader',
      seoDescription:
        'Baca catatan unduh video Telegram ini untuk melihat perubahan pada alur web, file besar, dan versi terbaru.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Peningkatan Kinerja',
          description: 'Peningkatan kinerja signifikan untuk pengalaman pengguna yang lebih baik.',
          features: [
            'Kecepatan deteksi sumber daya ditingkatkan 50%',
            'Stabilitas unduhan file besar dioptimalkan',
            'Daya respons UI ditingkatkan'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Dukungan Multi-bahasa',
          description: 'Dukungan ditambahkan untuk 14 bahasa di seluruh dunia.',
          features: [
            'Ditambahkan dukungan untuk Jepang, Korea, dan bahasa lainnya',
            'Meningkatkan akurasi terjemahan',
            'Ditambahkan deteksi bahasa otomatis'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Unduhan Bilah Sisi',
          description: 'Fitur unduhan bilah sisi baru dengan dukungan batch.',
          features: [
            'Ditambahkan unduhan file tunggal bilah sisi',
            'Ditambahkan fungsionalitas unduhan batch',
            'Ditingkatkan manajemen antrian unduhan'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Keamanan & Privasi',
          description: 'Peningkatan keamanan dan peningkatan privasi.',
          features: [
            'Dihapus semua pelacakan analitik',
            'Ditambahkan mode pemrosesan hanya-lokal',
            'Ditingkatkan enkripsi data'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Rilis Awal',
          description: 'Rilis pertama dengan dukungan unduhan jendela obrolan.',
          features: [
            'Fungsionalitas unduhan jendela obrolan',
            'Dukungan untuk Telegram Web K dan versi A',
            'Dukungan format media dasar'
          ]
        }
      ],
      labels: {
        features: 'New Features',
        fixes: 'Bug Fixes'
      }
    } as SiteContent['pages']['changelog'] & {
      seoTitle: string
      seoDescription: string
    },
    pricing: idIDPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['id-ID'],
    extensionLoginV2: {
      title: 'Login Ekstensi | TG Downloader',
      description:
        'Masuk ke TG Downloader dan sinkronkan sesi situs web Anda dengan ekstensi browser.',
      eyebrow: 'Ekstensi browser',
      heading: 'Masuk ke TG Downloader',
      checkingState: 'Memeriksa sesi',
      signInRequiredState: 'Perlu masuk',
      syncedState: 'Sudah masuk',
      verificationFailedState: 'Verifikasi gagal',
      preparingTitle: 'Menyiapkan login…',
      preparingText: 'TG Downloader sedang menyiapkan pemeriksaan sesi situs web.',
      checkingSessionTitle: 'Memeriksa sesi situs web…',
      checkingSessionText:
        'TG Downloader sedang memverifikasi token situs web yang tersimpan di browser ini.',
      finishingGoogleTitle: 'Menyelesaikan login Google…',
      finishingGoogleText:
        'TG Downloader sedang menukar hasil login Google dengan sesi situs web.',
      signInRequiredTitle: 'Masuk untuk melanjutkan',
      signInRequiredText: 'Gunakan jendela login TG Downloader yang sama seperti di situs web.',
      signInButtonLabel: 'Masuk',
      syncingTitle: 'Menyinkronkan token ekstensi…',
      syncingText: 'TG Downloader sedang menukar sesi situs web Anda dengan token ekstensi.',
      syncedTitle: 'Login berhasil',
      syncedText:
        'Ekstensi terhubung ke akun TG Downloader Anda. Klik Kembali ke Telegram untuk kembali.',
      returnButtonLabel: 'Kembali ke Telegram',
      returningButtonLabel: 'Kembali…',
      verificationFailedTitle: 'Tidak dapat menyelesaikan login ekstensi',
      retryButtonLabel: 'Coba lagi',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Unduh Video TikTok Tanpa Watermark - Kualitas HD | TG Downloader',
          description:
            'Unduh video TikTok tanpa watermark dalam kualitas HD secara gratis. Tidak perlu instal aplikasi. Simpan video, slideshow, dan story TikTok secara instan.',
          keywords:
            'unduh tiktok, download video tiktok, tiktok tanpa watermark, unduh video tiktok hd, simpan video tiktok, tiktok downloader gratis'
        },
        workspace: {
          title: 'Unduh Video TikTok Tanpa Watermark',
          helperText:
            'Tempel tautan video TikTok untuk mengunduh tanpa watermark dalam kualitas HD. Juga mendukung tautan Telegram, X, dan Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Mengapa Menggunakan TikTok Downloader Kami',
          subtitle: 'Simpan video TikTok dalam kualitas tertinggi tanpa watermark, sepenuhnya gratis.',
          items: [
            {
              title: 'Tanpa Watermark',
              description:
                'Unduh video TikTok tanpa overlay watermark TikTok. Dapatkan video bersih berkualitas asli siap disimpan atau dibagikan.'
            },
            {
              title: 'Kualitas HD',
              description:
                'Simpan video TikTok dalam resolusi HD asli. Tanpa penurunan kualitas, tanpa kompresi — persis seperti yang diunggah kreator.'
            },
            {
              title: 'Cepat & Gratis',
              description:
                'Tanpa instal aplikasi, tanpa registrasi, tanpa biaya tersembunyi. Tempel tautan, dapatkan video Anda. Bekerja instan di browser apa pun.'
            }
          ]
        },
        howTo: {
          title: 'Cara Mengunduh Video TikTok Tanpa Watermark',
          subtitle:
            'Tiga langkah sederhana untuk menyimpan video TikTok apa pun dalam kualitas HD tanpa watermark.',
          steps: [
            {
              title: 'Salin tautan video TikTok',
              description:
                'Buka TikTok, ketuk tombol Bagikan pada video, dan pilih "Salin tautan".'
            },
            {
              title: 'Tempel tautan di atas',
              description:
                'Tempel URL TikTok yang disalin ke kolom input dan klik Parse.'
            },
            {
              title: 'Unduh tanpa watermark',
              description:
                'Klik tombol Unduh untuk menyimpan video TikTok dalam HD tanpa watermark apa pun.'
            }
          ]
        },
        faq: {
          title: 'FAQ TikTok Downloader',
          items: [
            {
              question: 'Apakah TikTok downloader ini benar-benar gratis?',
              answer:
                'Ya, sepenuhnya gratis tanpa biaya tersembunyi. Anda bisa mengunduh video TikTok tanpa watermark tanpa biaya.'
            },
            {
              question: 'Apakah video yang diunduh akan ada watermark?',
              answer:
                'Tidak. Downloader kami menghilangkan watermark TikTok dan menghasilkan video asli bersih dalam kualitas HD.'
            },
            {
              question: 'Kualitas apa yang didapat dari video TikTok yang diunduh?',
              answer:
                'Video disimpan dalam resolusi HD asli sesuai yang diunggah kreator, tanpa penurunan kualitas.'
            },
            {
              question: 'Apakah saya perlu menginstal aplikasi atau ekstensi?',
              answer:
                'Tidak perlu instalasi. Ini adalah alat berbasis web yang bekerja langsung di browser Anda di perangkat apa pun.'
            },
            {
              question: 'Bisakah saya mengunduh TikTok Story dan Slideshow?',
              answer:
                'Ya, downloader kami mendukung video TikTok, slideshow foto, dan story. Tempel tautan dan unduh.'
            }
          ]
        },
        crossLinks: {
          title: 'Pengunduh Video Lainnya',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Unduh video dan GIF X/Twitter dalam kualitas HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Unduh video Vimeo dalam HD dengan berbagai pilihan resolusi.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Unduh video dan foto Threads dalam kualitas asli.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Unduh video Telegram dari channel dan grup dalam kualitas HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Unduh Video X (Twitter) - Simpan Video & GIF HD | TG Downloader',
          description:
            'Unduh video dan GIF X (Twitter) dalam kualitas HD secara gratis. Tidak perlu aplikasi. Simpan video atau GIF tweet publik apa pun secara instan.',
          keywords:
            'unduh x, download video twitter, unduh video twitter, x video downloader, unduh gif twitter, simpan video twitter'
        },
        workspace: {
          title: 'Unduh Video X (Twitter)',
          helperText:
            'Tempel tautan video X atau Twitter untuk mengunduh dalam kualitas tertinggi. Juga mendukung tautan Telegram, TikTok, dan Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Mengapa Menggunakan X Video Downloader Kami',
          subtitle: 'Simpan video dan GIF X/Twitter dalam kualitas asli, sepenuhnya gratis.',
          items: [
            {
              title: 'Video & GIF',
              description:
                'Unduh postingan video dan GIF animasi dari X (Twitter). Dapatkan media persis seperti yang tampil di tweet.'
            },
            {
              title: 'Kualitas HD Asli',
              description:
                'Simpan video X dalam resolusi tertinggi yang tersedia. Tanpa penurunan kualitas — dapatkan bitrate yang sama dengan sumbernya.'
            },
            {
              title: 'Cepat & Gratis',
              description:
                'Tanpa instal aplikasi, tanpa login diperlukan. Tempel URL tweet, video atau GIF Anda terunduh dalam hitungan detik.'
            }
          ]
        },
        howTo: {
          title: 'Cara Mengunduh Video X (Twitter)',
          subtitle:
            'Tiga langkah sederhana untuk menyimpan video atau GIF apa pun dari X/Twitter.',
          steps: [
            {
              title: 'Salin URL tweet',
              description:
                'Di X (Twitter), klik ikon Bagikan pada tweet dan pilih "Salin tautan".'
            },
            {
              title: 'Tempel tautan di atas',
              description:
                'Tempel URL X/Twitter yang disalin ke kolom input dan klik Parse.'
            },
            {
              title: 'Unduh video atau GIF',
              description:
                'Klik Unduh untuk menyimpan video atau GIF dalam kualitas HD ke perangkat Anda.'
            }
          ]
        },
        faq: {
          title: 'FAQ X Video Downloader',
          items: [
            {
              question: 'Bagaimana cara mengunduh video dari X (Twitter)?',
              answer:
                'Salin URL tweet yang berisi video, tempel ke kolom input di atas, dan klik Parse. Lalu klik Unduh untuk menyimpan video.'
            },
            {
              question: 'Bisakah saya mengunduh GIF dari X?',
              answer:
                'Ya. Downloader kami mendukung video dan GIF animasi dari postingan X/Twitter. GIF disimpan sebagai file MP4 untuk kompatibilitas terbaik.'
            },
            {
              question: 'Kualitas video apa yang tersedia?',
              answer:
                'Kami menyediakan kualitas tertinggi yang tersedia untuk setiap tweet, biasanya resolusi HD asli yang diunggah oleh pengirim.'
            },
            {
              question: 'Apakah X downloader ini gratis?',
              answer:
                'Ya, sepenuhnya gratis tanpa perlu registrasi. Unduh video dan GIF X tanpa biaya apa pun.'
            },
            {
              question: 'Apakah saya perlu akun X/Twitter untuk mengunduh?',
              answer:
                'Tidak perlu akun. Selama tweet bersifat publik, Anda bisa mengunduh video atau GIF-nya tanpa login.'
            }
          ]
        },
        crossLinks: {
          title: 'Pengunduh Video Lainnya',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Unduh video TikTok tanpa watermark dalam kualitas HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Unduh video Vimeo dalam HD dengan berbagai pilihan resolusi.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Unduh video dan foto Threads dalam kualitas asli.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Unduh video Telegram dari channel dan grup dalam kualitas HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Unduh Video Vimeo HD - Berbagai Resolusi | TG Downloader',
          description:
            'Unduh video Vimeo dalam kualitas HD dengan berbagai pilihan resolusi secara gratis. Tidak perlu aplikasi. Simpan video Vimeo publik apa pun secara instan.',
          keywords:
            'unduh vimeo, download video vimeo, unduh video vimeo hd, vimeo downloader gratis, simpan video vimeo, vimeo hd download'
        },
        workspace: {
          title: 'Unduh Video Vimeo HD',
          helperText:
            'Tempel tautan video Vimeo untuk mengunduh dalam kualitas HD dengan pilihan resolusi. Juga mendukung tautan Telegram, TikTok, dan X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Mengapa Menggunakan Vimeo Downloader Kami',
          subtitle: 'Simpan video Vimeo dalam kualitas HD dengan pilihan resolusi Anda, sepenuhnya gratis.',
          items: [
            {
              title: 'Kualitas Asli HD',
              description:
                'Unduh video Vimeo dalam resolusi HD penuh. Dapatkan kualitas tajam yang sama seperti yang diunggah kreator.'
            },
            {
              title: 'Berbagai Resolusi',
              description:
                'Pilih dari resolusi yang tersedia (360p, 720p, 1080p, dan lainnya). Pilih kualitas yang sesuai kebutuhan Anda.'
            },
            {
              title: 'Cepat & Gratis',
              description:
                'Tanpa instal aplikasi, tanpa perlu akun. Tempel tautan Vimeo, pilih resolusi, dan unduh secara instan.'
            }
          ]
        },
        howTo: {
          title: 'Cara Mengunduh Video Vimeo dalam HD',
          subtitle:
            'Tiga langkah sederhana untuk menyimpan video Vimeo apa pun dengan resolusi pilihan Anda.',
          steps: [
            {
              title: 'Salin tautan video Vimeo',
              description:
                'Buka halaman video Vimeo dan salin URL dari bilah alamat browser Anda.'
            },
            {
              title: 'Tempel tautan di atas',
              description:
                'Tempel URL Vimeo yang disalin ke kolom input dan klik Parse.'
            },
            {
              title: 'Pilih resolusi dan unduh',
              description:
                'Pilih resolusi video yang Anda inginkan dan klik Unduh untuk menyimpan video HD.'
            }
          ]
        },
        faq: {
          title: 'FAQ Vimeo Downloader',
          items: [
            {
              question: 'Bagaimana cara mengunduh video dari Vimeo?',
              answer:
                'Salin URL halaman video Vimeo, tempel ke kolom input di atas, klik Parse, lalu pilih resolusi yang Anda inginkan dan unduh.'
            },
            {
              question: 'Bisakah saya memilih resolusi video?',
              answer:
                'Ya. Setelah parsing, Anda bisa memilih dari semua resolusi yang tersedia termasuk 360p, 720p, 1080p, dan lebih tinggi jika tersedia.'
            },
            {
              question: 'Apakah Vimeo downloader ini gratis?',
              answer:
                'Ya, sepenuhnya gratis untuk digunakan. Unduh video Vimeo dalam kualitas HD tanpa biaya atau registrasi.'
            },
            {
              question: 'Apakah saya perlu akun Vimeo untuk mengunduh?',
              answer:
                'Tidak perlu akun. Anda bisa mengunduh video Vimeo publik apa pun tanpa login.'
            },
            {
              question: 'Format video apa yang diunduh?',
              answer:
                'Video Vimeo diunduh dalam format MP4, yang kompatibel dengan hampir semua perangkat dan pemutar.'
            }
          ]
        },
        crossLinks: {
          title: 'Pengunduh Video Lainnya',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Unduh video TikTok tanpa watermark dalam kualitas HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Unduh video dan GIF X/Twitter dalam kualitas HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Unduh video dan foto Threads dalam kualitas asli.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Unduh video Telegram dari channel dan grup dalam kualitas HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Unduh Foto dan Video Instagram - Kualitas HD | TG Downloader',
          description:
            'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD gratis. Tanpa instal aplikasi, simpan secara instan.',
          keywords:
            'unduh Instagram, unduh foto Instagram, unduh Reels Instagram, unduh carousel Instagram, simpan video Instagram, pengunduh Instagram gratis'
        },
        workspace: {
          title: 'Unduh Foto dan Video Instagram',
          helperText:
            'Tempel tautan postingan Instagram untuk mengunduh foto, Reels, dan carousel dalam kualitas HD. Juga mendukung tautan Telegram, TikTok, dan X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Mengapa menggunakan pengunduh Instagram kami',
          subtitle: 'Simpan foto, Reels, dan carousel Instagram dalam kualitas HD asli. Sepenuhnya gratis.',
          items: [
            {
              title: 'Foto dan Reels',
              description:
                'Unduh foto dan video Reels Instagram dalam kualitas asli. Dapatkan media persis seperti yang diunggah oleh kreator.'
            },
            {
              title: 'Unduh carousel sekaligus',
              description:
                'Unduh semua gambar dan video dari postingan carousel Instagram sekaligus. Tidak perlu menyimpan satu per satu.'
            },
            {
              title: 'Kualitas HD asli',
              description:
                'Simpan media Instagram dalam resolusi tertinggi yang tersedia. Tanpa kompresi, tanpa penurunan kualitas.'
            }
          ]
        },
        howTo: {
          title: 'Cara mengunduh foto dan video dari Instagram',
          subtitle:
            'Tiga langkah sederhana untuk menyimpan postingan Instagram dalam kualitas HD.',
          steps: [
            {
              title: 'Salin tautan postingan Instagram',
              description:
                'Buka Instagram, ketuk tiga titik pada postingan, dan pilih "Salin tautan".'
            },
            {
              title: 'Tempel tautan di atas',
              description:
                'Tempel URL Instagram yang disalin ke kolom input dan klik "Analisis".'
            },
            {
              title: 'Unduh dalam HD',
              description:
                'Klik tombol "Unduh" untuk menyimpan foto, Reels, atau carousel dalam kualitas asli.'
            }
          ]
        },
        faq: {
          title: 'FAQ Pengunduh Instagram',
          items: [
            {
              question: 'Apakah pengunduh Instagram ini benar-benar gratis?',
              answer:
                'Ya, sepenuhnya gratis tanpa biaya tersembunyi. Unduh foto, Reels, dan carousel Instagram tanpa biaya.'
            },
            {
              question: 'Format apa saja yang didukung?',
              answer:
                'Kami mendukung pengunduhan foto Instagram (JPG), video Reels (MP4), dan album carousel lengkap dengan semua media.'
            },
            {
              question: 'Bagaimana kualitas file yang diunduh?',
              answer:
                'Semua media disimpan dalam resolusi HD asli dari kreator, tanpa penurunan kualitas atau kompresi.'
            },
            {
              question: 'Apakah perlu akun Instagram untuk mengunduh?',
              answer:
                'Tidak perlu. Selama postingan bersifat publik, Anda dapat mengunduh medianya tanpa login.'
            },
            {
              question: 'Bisakah mengunduh Instagram Stories?',
              answer:
                'Saat ini kami mendukung postingan, Reels, dan carousel. Pengunduhan Stories memerlukan konten yang dapat diakses publik melalui tautan langsung.'
            }
          ]
        },
        crossLinks: {
          title: 'Pengunduh video lainnya',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Unduh video TikTok tanpa watermark kualitas HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Unduh video dan GIF X/Twitter dalam kualitas HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Unduh video Vimeo HD dengan berbagai pilihan resolusi.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Unduh video dan foto Threads dalam kualitas asli.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Unduh video dari channel dan grup Telegram kualitas HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Unduh Video dan Foto Threads - Kualitas Asli | TG Downloader',
          description:
            'Unduh video dan foto dari Threads dalam kualitas asli gratis. Tanpa instal aplikasi, simpan media termasuk carousel secara instan.',
          keywords:
            'unduh Threads, unduh video Threads, download video Threads, unduh media Threads, simpan video Threads, pengunduh Threads gratis'
        },
        workspace: {
          title: 'Unduh Video dan Foto Threads',
          helperText:
            'Tempel tautan postingan Threads untuk mengunduh video dan foto dalam kualitas asli. Juga mendukung tautan Telegram, TikTok, dan Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Mengapa menggunakan pengunduh Threads kami',
          subtitle: 'Simpan video dan foto Threads dalam kualitas asli. Sepenuhnya gratis.',
          items: [
            {
              title: 'Media campuran',
              description:
                'Unduh video dan foto dari postingan Threads. Mendukung postingan dengan berbagai jenis konten.'
            },
            {
              title: 'Kualitas asli',
              description:
                'Simpan media Threads dalam resolusi tertinggi yang tersedia. Tanpa kompresi, tanpa penurunan kualitas.'
            },
            {
              title: 'Dukungan carousel',
              description:
                'Unduh semua media dari postingan carousel Threads sekaligus. Dapatkan setiap foto dan video dalam satu operasi.'
            }
          ]
        },
        howTo: {
          title: 'Cara mengunduh video dan foto dari Threads',
          subtitle:
            'Tiga langkah sederhana untuk menyimpan postingan Threads dalam kualitas asli.',
          steps: [
            {
              title: 'Salin tautan postingan Threads',
              description:
                'Buka Threads, ketuk ikon bagikan pada postingan, dan pilih "Salin tautan".'
            },
            {
              title: 'Tempel tautan di atas',
              description:
                'Tempel URL Threads yang disalin ke kolom input dan klik "Analisis".'
            },
            {
              title: 'Unduh media',
              description:
                'Klik tombol "Unduh" untuk menyimpan video dan foto dalam kualitas asli.'
            }
          ]
        },
        faq: {
          title: 'FAQ Pengunduh Threads',
          items: [
            {
              question: 'Apakah pengunduh Threads ini benar-benar gratis?',
              answer:
                'Ya, sepenuhnya gratis tanpa biaya tersembunyi. Unduh video dan foto Threads tanpa biaya.'
            },
            {
              question: 'Jenis media apa saja yang didukung?',
              answer:
                'Kami mendukung pengunduhan video, foto, dan postingan media campuran dari Threads, termasuk postingan carousel dengan beberapa item.'
            },
            {
              question: 'Bagaimana kualitas file yang diunduh?',
              answer:
                'Semua media disimpan dalam resolusi asli dari kreator, tanpa penurunan kualitas.'
            },
            {
              question: 'Apakah perlu akun Threads untuk mengunduh?',
              answer:
                'Tidak perlu. Selama postingan bersifat publik, Anda dapat mengunduh medianya tanpa login.'
            },
            {
              question: 'Bisakah mengunduh postingan carousel dengan banyak foto?',
              answer:
                'Ya, pengunduh kami sepenuhnya mendukung postingan carousel Threads. Semua foto dan video dalam carousel tersedia untuk diunduh.'
            }
          ]
        },
        crossLinks: {
          title: 'Pengunduh video lainnya',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Unduh video TikTok tanpa watermark kualitas HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Unduh video dan GIF X/Twitter dalam kualitas HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Unduh video Vimeo HD dengan berbagai pilihan resolusi.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Unduh foto, Reels, dan carousel Instagram dalam kualitas HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Unduh video dari channel dan grup Telegram kualitas HD.'
            }
          ]
        }
      }

    }
  }
}
