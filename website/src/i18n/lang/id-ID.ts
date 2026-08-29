import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'kredit',
        enterEmailFirst: 'Masukkan alamat email Anda terlebih dahulu.',
        enterEmailAndCode: 'Masukkan email dan kode verifikasi.',
        sendCodeFailed: 'Gagal mengirim kode verifikasi.',
        googleSignInFailed: 'Gagal masuk dengan Google.',
        googleClientMissing: 'Login Google belum dikonfigurasi.',
        signInFailed: 'Gagal masuk.',
      },
      checkin: {
        accountButtonLabel: 'Buka menu akun',
        accountMenuLabel: 'Menu akun',
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
  }
}
