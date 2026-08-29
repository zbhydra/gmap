import type { SiteContent } from '../schema'
import { zhTWPricingContent } from '../pricing'

export const zhTW: SiteContent = {
  site: {
    name: 'Telegram 影片下載 | TG Downloader',
    description:
      '使用 TG Downloader 在 Telegram Web 中完成 Telegram 影片下載，儲存已載入的影片、檔案與媒體，並繼續處理 Telegram 私人頻道內容。',
    keywords:
      'Telegram 影片下載, Telegram 媒體下載, Telegram 影片儲存, Telegram 檔案下載, Telegram 私人頻道'
  },
  layout: {
    nav: {
      brand: 'TG 下載器',
      home: '首頁',
      pricing: '價格',
      solutions: '解決方案',
      changelog: '更新日誌'
    },
    footer: {
      resources: '資源',
      rights: '© 2026 TG Downloader. 保留所有權利.'
    }
  },
  common: {
    installCta: '立即安裝'
  },
  pages: {
    account: {
      auth: {
        eyebrow: '網頁登入',
        title: '登入後同步積分',
        signedInAs: '目前登入帳號',
        continueWithGoogle: '使用 Google 繼續',
        googleLoading: '正在開啟 Google...',
        or: '或',
        emailLabel: '電子郵件',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: '使用電子郵件繼續',
        sendCode: '發送驗證碼',
        sendingCode: '發送中...',
        sendCodeSuccess: '驗證碼已發送。',
        sendAgain: '重新發送',
        codeLabel: '驗證碼',
        codePlaceholder: '123456',
        signIn: '登入',
        termsNotice: '登入即表示你同意',
        termsLink: '服務條款',
        privacyLink: '隱私權政策',
        logout: '登出',
        creditsLabel: '積分',
        enterEmailFirst: '請先輸入電子郵件地址。',
        enterEmailAndCode: '請輸入電子郵件與驗證碼。',
        sendCodeFailed: '發送驗證碼失敗。',
        googleSignInFailed: 'Google 登入失敗。',
        googleClientMissing: 'Google 登入尚未設定。',
        signInFailed: '登入失敗。',
      },
      checkin: {
        accountButtonLabel: '開啟帳戶選單',
        accountMenuLabel: '帳戶選單',
      },
      creditPurchase: {
        title: '購買積分',
        description: '補充積分後即可繼續在目前下載工作區下載。',
        successTitle: '積分已到帳',
        successDescription: '餘額已重新整理。關閉彈窗後，請重新點擊下載。',
        packageEyebrow: '按需購買',
        cardNote: '積分可用於網站下載，永久有效。',
        creditsAmount: '{credits} 積分',
        buyNow: '立即購買',
        selectPackage: '選擇',
        paymentMethodLabel: '選擇付款方式',
        paymentTitle: '選擇付款方式',
        selectedPackageLabel: '已選商品',
        confirmPurchase: '繼續付款',
        backToProducts: '返回',
        close: '關閉',
        agreementText: '我已閱讀並同意購買條款、服務條款和隱私政策。',
        loadingConfigs: '正在載入積分套餐...',
        loadFailed: '載入積分套餐失敗，請重試。',
        noConfigs: '目前沒有可購買的積分套餐，請稍後重試。',
        ready: '請選擇積分套餐。頁面只顯示美元價格。',
        creatingOrder: '正在建立訂單...',
        pendingPayment: '請在新開啟的分頁完成付款。我們會自動檢查結果。',
        pendingPaymentTitle: '等待付款',
        cancelPayment: '取消付款',
        supportMailPrefix: '回報問題：',
        success: '付款完成，積分已可使用。',
        failed: '付款尚未完成，你可以重試或關閉彈窗。',
        successCredits: '+{credits} 積分已到帳',
        successBalance: '目前餘額：{balance} 積分',
        createFailed: '建立訂單失敗，請重試。',
        invalidPaymentData: '付款連結異常，請稍後重試。',
        priceUpdated: '價格已更新，請確認最新價格後重新購買。',
        gatewayFailed: '付款入口暫不可用，請稍後重試。',
        paymentCanceled: '付款已取消，請重新選擇付款方式。',
        pollFailed: '重新整理付款狀態失敗，請重試。',
        pollTimeout: '自動重新整理已逾時。付款後請手動重新整理結果。',
        orderNotFound: '訂單已不可用，請重新下單。',
        orderExpired: '訂單已過期，請重新購買。',
        fulfillmentFailed: '付款已收到，但積分暫未到帳，請稍後重試。',
        authExpired: '登入已失效，請重新登入後繼續。'
      },
    },

    changelog: {
      title: 'Telegram 影片下載更新日誌',
      description: '持續追蹤 Telegram 影片下載、網頁流程與更長儲存任務的最新變化。',
      seoTitle: 'Telegram 影片下載更新日誌 | TG Downloader',
      seoDescription:
        '查看這份 Telegram 影片下載更新日誌，了解網頁流程、大檔案支援與最新版本變化。',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: '效能提升',
          description: '重大效能改進，提供更好的使用者體驗。',
          features: ['資源檢測速度提升 50%', '優化大檔案下載穩定性', '增強介面回應速度']
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '多語言支援',
          description: '新增全球 14 種語言支援。',
          features: ['新增日語、韓語等多種語言支援', '改進翻譯準確性', '新增語言自動偵測']
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: '側邊欄下載',
          description: '新增側邊欄下載功能，支援批次下載。',
          features: ['新增側邊欄單檔下載', '新增批次下載功能', '改進下載佇列管理']
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: '安全與隱私',
          description: '安全改進和隱私增強。',
          features: ['移除所有分析追蹤', '新增純本地處理模式', '改進資料加密']
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '初始版本',
          description: '首個版本，支援聊天視窗下載。',
          features: ['聊天視窗下載功能', '支援 Telegram Web K 和 A 版本', '基礎媒體格式支援']
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
    pricing: zhTWPricingContent,
    extensionLoginV2: {
      title: '擴充功能登入 | TG Downloader',
      description: '登入 TG Downloader，將您的網站工作階段同步到瀏覽器擴充功能。',
      eyebrow: '瀏覽器擴充功能',
      heading: '登入 TG Downloader',
      checkingState: '正在檢查工作階段',
      signInRequiredState: '需要登入',
      syncedState: '已登入',
      verificationFailedState: '驗證失敗',
      preparingTitle: '正在準備登入…',
      preparingText: 'TG Downloader 正在準備網站工作階段檢查。',
      checkingSessionTitle: '正在檢查網站工作階段…',
      checkingSessionText: 'TG Downloader 正在驗證此瀏覽器中儲存的網站權杖。',
      finishingGoogleTitle: '正在完成 Google 登入…',
      finishingGoogleText: 'TG Downloader 正在將 Google 登入結果兌換為網站工作階段。',
      signInRequiredTitle: '登入以繼續',
      signInRequiredText: '請使用與網站相同的 TG Downloader 登入視窗。',
      signInButtonLabel: '登入',
      syncingTitle: '正在同步擴充功能權杖…',
      syncingText: 'TG Downloader 正在將您的網站工作階段兌換為擴充功能權杖。',
      syncedTitle: '登入成功',
      syncedText: '擴充功能已連線至您的 TG Downloader 帳號。點擊「返回 Telegram」即可返回。',
      returnButtonLabel: '返回 Telegram',
      returningButtonLabel: '返回中…',
      verificationFailedTitle: '無法完成擴充功能登入',
      retryButtonLabel: '重試',
    },
  }
}
