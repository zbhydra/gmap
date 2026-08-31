import type { SiteContent } from '../schema'
import { viVNPricingContent } from '../pricing'

export const viVN: SiteContent = {
  site: {
    name: 'Tải video Telegram | TG Downloader',
    description:
      'Dùng TG Downloader cho tải video Telegram trong Telegram Web, lưu tệp và media đã tải và tiếp tục với từng kênh riêng tư Telegram.',
    keywords:
      'tải video Telegram, tải media Telegram, lưu video Telegram, tải file Telegram, kênh riêng tư Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Trình Tải',
      home: 'Trang Chủ',
      pricing: 'Giá',
      solutions: 'Giải pháp',
      changelog: 'Thay Đổi'
    },
    footer: {
      resources: 'Tài nguyên',
      rights: '© 2026 TG Downloader. Đã đăng ký bản quyền.'
    }
  },
  common: {
    installCta: 'Cài Đặt Ngay'
  },
  pages: {
    account: {
      auth: {
        eyebrow: 'Truy cập web',
        title: 'Đăng nhập để đồng bộ điểm',
        signedInAs: 'Đã đăng nhập bằng',
        continueWithGoogle: 'Tiếp tục với Google',
        googleLoading: 'Đang mở Google...',
        or: 'hoặc',
        emailLabel: 'Email',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'Tiếp tục với email',
        sendCode: 'Gửi mã',
        sendingCode: 'Đang gửi...',
        sendCodeSuccess: 'Đã gửi mã xác minh.',
        sendAgain: 'Gửi lại',
        codeLabel: 'Mã xác minh',
        codePlaceholder: '123456',
        signIn: 'Đăng nhập',
        termsNotice: 'Khi đăng nhập, bạn đồng ý với',
        termsLink: 'Điều khoản',
        privacyLink: 'Chính sách quyền riêng tư',
        logout: 'Đăng xuất',
        creditsLabel: 'điểm',
        enterEmailFirst: 'Vui lòng nhập địa chỉ email trước.',
        enterEmailAndCode: 'Vui lòng nhập email và mã xác minh.',
        sendCodeFailed: 'Không thể gửi mã xác minh.',
        googleSignInFailed: 'Không thể đăng nhập bằng Google.',
        googleClientMissing: 'Chưa cấu hình đăng nhập Google.',
        signInFailed: 'Không thể đăng nhập.',
      },
      checkin: {
        accountButtonLabel: 'Mở menu tài khoản',
        accountMenuLabel: 'Menu tài khoản',
      },
      creditPurchase: {
        title: 'Mua điểm',
        description: 'Thêm điểm và tiếp tục tải xuống trong không gian làm việc này.',
        successTitle: 'Đã cộng điểm',
        successDescription: 'Số dư đã được cập nhật. Đóng cửa sổ này rồi bắt đầu tải lại.',
        packageEyebrow: 'Dùng đến đâu trả đến đó',
        cardNote: 'Dùng điểm cho tải xuống trên web. Điểm không hết hạn.',
        creditsAmount: '{credits} điểm',
        buyNow: 'Mua ngay',
        selectPackage: 'Chọn',
        paymentMethodLabel: 'Chọn phương thức thanh toán',
        paymentTitle: 'Chọn phương thức thanh toán',
        selectedPackageLabel: 'Sản phẩm đã chọn',
        confirmPurchase: 'Tiếp tục thanh toán',
        backToProducts: 'Quay lại',
        close: 'Đóng',
        agreementText: 'Tôi đồng ý với điều khoản mua hàng, Điều khoản và Chính sách quyền riêng tư.',
        loadingConfigs: 'Đang tải các gói điểm...',
        loadFailed: 'Không thể tải các gói điểm. Vui lòng thử lại.',
        noConfigs: 'Hiện không có gói điểm nào khả dụng. Vui lòng thử lại sau.',
        ready: 'Chọn một gói điểm. Giá được hiển thị bằng USD.',
        creatingOrder: 'Đang tạo đơn hàng...',
        pendingPayment: 'Hoàn tất thanh toán trong tab vừa mở. Chúng tôi sẽ tự động kiểm tra kết quả.',
        pendingPaymentTitle: 'Đang chờ thanh toán',
        cancelPayment: 'Hủy thanh toán',
        supportMailPrefix: 'Báo cáo sự cố: ',
        success: 'Thanh toán hoàn tất. Điểm đã có thể sử dụng.',
        failed: 'Thanh toán chưa hoàn tất. Bạn có thể thử lại hoặc đóng cửa sổ này.',
        successCredits: '+{credits} điểm đã cộng',
        successBalance: 'Số dư hiện tại: {balance} điểm',
        createFailed: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        invalidPaymentData: 'Liên kết thanh toán không hợp lệ. Vui lòng thử lại sau.',
        priceUpdated: 'Giá đã thay đổi. Kiểm tra giá mới nhất rồi mua lại.',
        gatewayFailed: 'Cổng thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.',
        paymentCanceled: 'Thanh toán đã bị hủy. Chọn phương thức thanh toán và thử lại.',
        pollFailed: 'Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.',
        pollTimeout: 'Tự động cập nhật đã hết thời gian. Hãy làm mới kết quả sau khi thanh toán.',
        orderNotFound: 'Đơn hàng không còn khả dụng. Hãy tạo đơn mới.',
        orderExpired: 'Đơn hàng đã hết hạn. Hãy mua lại.',
        fulfillmentFailed: 'Đã nhận thanh toán nhưng điểm chưa được cộng. Vui lòng thử lại sau.',
        authExpired: 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.'
      },
    },

    changelog: {
      title: 'Nhật ký tải video Telegram',
      description:
        'Theo dõi từng cập nhật về tải video Telegram, luồng web và các phiên lưu dài hơn.',
      seoTitle: 'Nhật ký tải video Telegram | TG Downloader',
      seoDescription:
        'Đọc nhật ký tải video Telegram này để xem thay đổi về luồng web, tệp lớn và các phiên bản mới nhất.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Cải Hiện Hiệu Suất',
          description: 'Cải tiến hiệu suất đáng kể để mang lại trải nghiệm người dùng tốt hơn.',
          features: [
            'Tốc độ phát hiện tài nguyên được cải thiện 50%',
            'Tối ưu hóa độ ổn định khi tải tệp lớn',
            'Cải thiện khả năng phản hồi của giao diện'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Hỗ Đa Ngôn Ngữ',
          description: 'Đã thêm hỗ trợ cho 14 ngôn ngữ trên toàn cầu.',
          features: [
            'Đã thêm hỗ trợ tiếng Nhật, Hàn Quốc và nhiều ngôn ngữ khác',
            'Cải thiện độ chính xác của bản dịch',
            'Đã thêm tính năng phát hiện ngôn ngữ tự động'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Tải Xuống Thanh Bên',
          description: 'Tính năng tải xuống thanh bên mới với hỗ trợ hàng loạt.',
          features: [
            'Đã thêm tải xuống tệp đơn thanh bên',
            'Đã thêm tính năng tải xuống hàng loạt',
            'Cải thiện quản lý hàng đợi tải xuống'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Bảo Mật và Quyền Riêng Tư',
          description: 'Cải tiến bảo mật và tăng cường quyền riêng tư.',
          features: [
            'Đã xóa tất cả theo dõi phân tích',
            'Đã thêm chế độ xử lý chỉ cục bộ',
            'Cải thiện mã hóa dữ liệu'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Phiên Bản Ban Đầu',
          description: 'Phiên bản đầu tiên với hỗ trợ tải xuống cửa sổ chat.',
          features: [
            'Tính năng tải xuống cửa sổ chat',
            'Hỗ trợ Telegram Web phiên bản K và A',
            'Hỗ trợ định dạng media cơ bản'
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
    pricing: viVNPricingContent,
    extensionLoginBing: {
      title: 'Extension Login | Bing Maps Scraper',
      description: 'Sign in to sync your website session to the Bing Maps Scraper extension.',
      eyebrow: 'Browser Extension',
      heading: 'Bing Maps Scraper Extension Login',
      checkingState: 'Checking',
      signInRequiredState: 'Sign-in required',
      syncedState: 'Synced',
      verificationFailedState: 'Error',
      preparingTitle: 'Preparing your sign-in',
      preparingText: 'Setting up the Bing Maps Scraper login bridge.',
      checkingSessionTitle: 'Checking your session',
      checkingSessionText: 'Verifying your existing website session.',
      finishingGoogleTitle: 'Finishing Google sign-in',
      finishingGoogleText: 'Exchanging your Google authorization for a website session.',
      signInRequiredTitle: 'Sign in to continue',
      signInRequiredText: 'Sign in to sync your website session to the Bing Maps Scraper extension.',
      signInButtonLabel: 'Sign In',
      syncingTitle: 'Syncing to extension',
      syncingText: 'Sending your session to the Bing Maps Scraper extension.',
      syncedTitle: 'Session synced',
      syncedText: 'Your website session is now connected to the Bing Maps Scraper extension.',
      returnButtonLabel: 'Return to Bing Maps Scraper',
      returningButtonLabel: 'Returning...',
      verificationFailedTitle: 'Something went wrong',
      retryButtonLabel: 'Retry',
    },
    extensionLoginV2: {
      title: 'Đăng nhập tiện ích | TG Downloader',
      description:
        'Đăng nhập TG Downloader và đồng bộ phiên trang web của bạn với tiện ích trình duyệt.',
      eyebrow: 'Tiện ích trình duyệt',
      heading: 'Đăng nhập TG Downloader',
      checkingState: 'Đang kiểm tra phiên',
      signInRequiredState: 'Cần đăng nhập',
      syncedState: 'Đã đăng nhập',
      verificationFailedState: 'Xác minh thất bại',
      preparingTitle: 'Đang chuẩn bị đăng nhập…',
      preparingText: 'TG Downloader đang chuẩn bị kiểm tra phiên trang web.',
      checkingSessionTitle: 'Đang kiểm tra phiên trang web…',
      checkingSessionText:
        'TG Downloader đang xác minh mã thông báo trang web được lưu trong trình duyệt này.',
      finishingGoogleTitle: 'Đang hoàn tất đăng nhập Google…',
      finishingGoogleText:
        'TG Downloader đang trao đổi kết quả đăng nhập Google để lấy phiên trang web.',
      signInRequiredTitle: 'Đăng nhập để tiếp tục',
      signInRequiredText: 'Hãy dùng cùng cửa sổ đăng nhập TG Downloader như trên trang web.',
      signInButtonLabel: 'Đăng nhập',
      syncingTitle: 'Đang đồng bộ mã thông báo tiện ích…',
      syncingText:
        'TG Downloader đang trao đổi phiên trang web của bạn để lấy mã thông báo tiện ích.',
      syncedTitle: 'Đăng nhập thành công',
      syncedText:
        'Tiện ích đã kết nối với tài khoản TG Downloader của bạn. Nhấp vào Quay lại Telegram để trở về.',
      returnButtonLabel: 'Quay lại Telegram',
      returningButtonLabel: 'Đang quay lại…',
      verificationFailedTitle: 'Không thể hoàn tất đăng nhập tiện ích',
      retryButtonLabel: 'Thử lại',
    },
  }
}
