import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
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
  sections: {
    features: {
      title: 'Telegram 媒體下載功能',
      subtitle:
        '這些 Telegram 媒體下載功能涵蓋檔案、圖片、影片、更大的批次任務，以及 Telegram Web 中已載入的內容。',
      metaDescription:
        'TG Downloader 功能：多檔批次儲存、私人頻道支援、1GB+ 大檔案下載、即時媒體偵測，以及免登入的隱私優先設計。',
      items: [
        {
          title: '批次下載',
          description: '支援多選批次下載，一鍵下載整個頻道或群組的所有媒體檔案',
          details: [
            '支援多選批次下載',
            '一鍵下載整個頻道/群組',
            '按檔案類型智慧過濾',
            '下載佇列管理'
          ]
        },
        {
          title: '支援受限內容',
          description: '即使沒有權限，也能下載受限頻道和私人群組的媒體內容',
          details: ['存取受限頻道內容', '從私人群組下載', '無需權限驗證', '支援 A/K 版本']
        },
        {
          title: '多格式支援',
          description: '支援圖片、影片、GIF、音訊等多種媒體格式',
          details: [
            '圖片：JPG、PNG、WEBP、GIF',
            '影片：MP4、WEBM、MOV',
            '音訊：MP3、M4A、OGG',
            '自動格式偵測'
          ]
        },
        {
          title: '安全可靠',
          description: '無需提供密碼或 API 登入，不收集任何用戶資料',
          details: ['無需密碼或 API 登入', '不收集用戶資料', '無病毒無廣告', '嚴格安全測試']
        },
        {
          title: '大檔案支援',
          description: '穩定下載 1GB+ 大檔案，斷點續傳，快速穩定',
          details: ['穩定下載 1GB+ 大檔案', '斷點續傳支援', '快速穩定傳輸', '進度追蹤']
        },
        {
          title: '即時偵測',
          description: '自動掃描並偵測頁面中的媒體資源，即時更新下載清單',
          details: ['自動掃描頁面媒體資源', '即時資源偵測', '自動清單更新', '智慧資源快取']
        }
      ]
    },
    steps: {
      title: 'Telegram 影片儲存指南',
      subtitle:
        '按照這份 Telegram 影片儲存指南，在 Telegram Web 開啟訊息後即可用更少步驟儲存影片與其他媒體。',
      metaDescription:
        '逐步教學：使用 TG Downloader 儲存 Telegram 影片、檔案與相簿。學習安裝擴充功能、在 Telegram Web 中偵測媒體，並批次下載內容。',
      items: [
        {
          title: '安裝擴充功能',
          description: '在瀏覽器擴充功能商店搜尋並安裝 TG Downloader'
        },
        {
          title: '固定擴充功能',
          description: '點擊瀏覽器工具列，將擴充功能圖示固定以便快速存取'
        },
        {
          title: '開啟 Telegram Web',
          description: '造訪 web.telegram.org，擴充功能會自動開始掃描媒體資源'
        },
        {
          title: '批次下載',
          description: '選擇要下載的檔案，點擊下載按鈕即可批次儲存到本機'
        }
      ]
    },
    cta: {
      title: '準備好開始了嗎？',
      description: '立即安裝擴充功能，開始從 Telegram 下載媒體檔案。'
    },
    techSpecs: {
      title: '技術規格',
      browsersLabel: '瀏覽器',
      browsers: 'Chrome、Edge、Brave 及所有基於 Chromium 的瀏覽器',
      telegramVersionsLabel: 'Telegram 版本',
      telegramVersions: 'Web K 版本和 A 版本',
      permissionsLabel: '權限',
      permissions: '僅需最低權限',
      updatesLabel: '更新',
      updates: '從擴充功能商店自動更新'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: '從 Telegram 私人頻道和受限頻道下載媒體',
        description: '一鍵下載，無需登入，支援 1GB+ 大檔案。批次下載私人頻道和受限內容。'
      },
      stats: {
        users: '全球用戶',
        downloads: '累計下載'
      },
      seo: {
        title: 'Telegram 私人影片下載器：下載任何私人媒體',
        description:
          '透過簡單易懂的下載器指南儲存 Telegram 私人頻道影片。下載可存取的影片與媒體、排解下載失敗問題，並為你的裝置找到最合適的方法。',
        keywords:
          'telegram 私人影片下載器, telegram 私人頻道影片下載, 下載 telegram 私人影片, telegram 私人媒體下載器'
      },
      heroTrustPoints: [
        '高畫質影片下載',
        '免註冊',
        '行動裝置友善',
        '支援 Windows、Mac、Android 與 iPhone'
      ],
      situation: {
        title: '從這裡開始：哪一種情況最符合你？',
        intro:
          '大多數搜尋 Telegram 私人影片下載器的使用者，通常想解決以下其中一個問題：',
        headers: ['你的情況', '先試試這個'],
        rows: [
          {
            cells: [
              '你有一條來自頻道或聊天的 Telegram 影片連結',
              '將連結貼到線上 Telegram 影片下載器'
            ]
          },
          {
            cells: [
              '你能在私人頻道觀看影片，卻無法儲存',
              '試試 Telegram Desktop 的 Save Video As 選項'
            ]
          },
          {
            cells: [
              '影片可以播放，但下載與轉發都被封鎖',
              '只有在你有權保留副本時，才使用螢幕錄影'
            ]
          },
          {
            cells: [
              '下載器顯示找不到影片',
              '檢查存取權限、連結類型、頻道限制，以及影片是否能在 Telegram 以外開啟'
            ]
          }
        ]
      },
      solutions: {
        title: '哪些方法適用於 Telegram 私人影片？',
        intro:
          'Telegram 私人影片通常是指分享在私人頻道、私人群組或私訊中的影片。這些影片只有獲准的成員才看得到，因此下載方式與儲存公開頻道的媒體不同。',
        quickAnswer:
          '簡短結論：如果連結可以存取，就使用線上 Telegram 私人影片下載器；如果影片只在 Telegram 內可見，請試試 Telegram Desktop；如果儲存被封鎖、但你獲准保留內容，螢幕錄影可能是實際可行的備援方案。',
        items: [
          {
            title: '方案 1：線上 Telegram 影片下載器',
            description:
              '最適合可存取的 Telegram 連結。對於想線上下載 Telegram 影片、又不想安裝應用程式、擴充功能或機器人的使用者來說，這是最簡單的方法。',
            useWhenLabel: '適用情況：',
            useWhen: [
              'Telegram 影片連結為公開或可存取。',
              '你想線上下載 Telegram 影片。',
              '你需要快速取得高畫質影片檔。',
              '你不想安裝瀏覽器擴充功能或桌面應用程式。'
            ]
          },
          {
            title: '方案 2：Telegram Desktop 的 Save Video As',
            description:
              '當影片可在 Telegram Desktop 中取得且允許下載時，在影片上按右鍵並儲存到電腦的資料夾。對私人頻道成員來說這通常更有效，因為你已在 Telegram 內完成身分驗證。',
            useWhenLabel: '適用情況：',
            useWhen: [
              '你可以在 Telegram Desktop 中觀看影片。',
              '頻道擁有者尚未停用儲存功能。',
              '你偏好直接下載到 Windows 或 Mac。'
            ]
          },
          {
            title: '方案 3：行動裝置或桌面螢幕錄影',
            description:
              '如果下載選項被停用、但你獲准觀看並保留內容，螢幕錄影工具可以在影片播放時擷取畫面與聲音。這是備援方案而非首選，因為較花時間且取決於播放品質。',
            useWhenLabel: '適用情況：',
            useWhen: [
              '你有權觀看並保留該影片。',
              'Telegram 連結無法被下載器解析。',
              '你需要一份個人離線副本以供參考。'
            ]
          },
          {
            title: '方案 4：Android 檔案管理員檢查',
            description:
              '在某些 Android 情況下，Telegram 可能會暫時把已載入的媒體儲存在本機應用程式資料夾中。檔案管理員有時能幫你找到已載入到裝置上的影片，但這取決於應用程式版本、儲存權限與快取行為。',
            useWhenLabel: '適用情況：',
            useWhen: [
              '你已在 Android 的 Telegram 中播放過該影片。',
              '你了解應用程式的儲存權限。',
              '你只需要復原已快取在裝置上的檔案。'
            ]
          }
        ]
      },
      benefits: {
        title: '為什麼要使用線上 Telegram 影片下載器？',
        intro:
          '好的下載器應該能幫你快速回答一個問題：手上這條連結能不能儲存這支 Telegram 影片？最好的體驗是直接、清楚，並在無法處理私人連結時誠實告知。',
        items: [
          {
            title: '以高畫質儲存影片',
            description:
              '以可取得的最佳畫質保存 Telegram 影片，方便離線播放、學習、訓練、封存或個人參考。'
          },
          {
            title: '跨裝置皆可使用',
            description:
              '可在 Android、iPhone、Windows、Mac 或平板的瀏覽器中使用下載器。當影片在手機上、但你想存到另一台裝置時，這點特別重要。'
          },
          {
            title: '無需登入 Telegram',
            description:
              '選擇能直接處理影片連結、而不索取你的 Telegram 密碼、驗證碼、工作階段檔案或私人帳號憑證的工具。'
          },
          {
            title: '輕鬆離線播放',
            description:
              '在可行時以常見影片格式下載檔案，讓你日後不必開啟 Telegram 或耗用行動數據就能觀看。'
          },
          {
            title: '快速的連結式流程',
            description:
              '複製、貼上、解析、下載。如果連結失敗，頁面應說明原因，並告訴你接下來該試什麼。'
          },
          {
            title: '清楚的權限界線',
            description:
              '只下載你有權存取與儲存的影片。尊重頻道規則、創作者權利與 Telegram 的政策。'
          }
        ]
      },
      troubleshooting: {
        title: '如果 Telegram 影片連結無法使用',
        intro:
          '並非每個失敗的連結都代表下載器壞了。Telegram 私人影片經常因為檔案無法在 Telegram 以外取得而失敗。請依照這份檢查清單操作：',
        items: [
          '在瀏覽器中開啟連結，確認它能正常載入。',
          '確認你仍是該私人頻道或群組的成員。',
          '檢查頻道擁有者是否已停用儲存、複製或轉發。',
          '如果影片只在應用程式內播放，請試試 Telegram Desktop。',
          '如果頁面無法連到 Telegram，請改用其他瀏覽器或網路。',
          '避免使用任何要求你輸入 Telegram 登入碼的工具。'
        ]
      },
      permission: {
        title: '重要權限提醒',
        note:
          'Telegram 私人影片下載器不應被用來規避隱私、著作權或存取限制。只有在獲得擁有者許可，或你的用途符合法律與 Telegram 條款時，才可以儲存影片。'
      },
      comparison: {
        title: '選擇合適的 Telegram 下載方法',
        headers: ['情況', '建議方案', '最適合', '需要檢查'],
        rows: [
          {
            cells: [
              '公開或可存取的 Telegram 影片連結',
              '線上 Telegram 影片下載器',
              '免安裝應用程式即可快速高畫質下載',
              '連結能開啟，且工具可以存取到影片'
            ]
          },
          {
            cells: [
              '允許下載的私人頻道影片',
              'Telegram Desktop 的 Save Video As',
              '直接儲存到電腦',
              '你是成員，且擁有者尚未停用儲存功能'
            ]
          },
          {
            cells: [
              '禁止儲存但可正常播放',
              '內建或第三方螢幕錄影工具',
              '在獲得許可下保留個人離線參考',
              '聲音擷取、螢幕範圍，以及當地法律或平台規則'
            ]
          },
          {
            cells: [
              'Android 已快取的媒體',
              '檔案管理員檢查',
              '尋找已載入到裝置上的媒體',
              '應用程式的儲存存取權限，以及 Telegram 是否保留本機快取'
            ]
          }
        ]
      },
      howTo: {
        title: '如何用 3 個步驟下載 Telegram 影片',
        subtitle:
          '最快的方式是使用連結式 Telegram 影片下載器。當 Telegram 影片連結為公開、可存取，或能在 Telegram 應用程式以外讀取時，效果最好。',
        steps: [
          {
            title: '複製影片連結',
            description:
              '開啟 Telegram，找到你想儲存的影片，從分享選單複製訊息連結或影片連結。如果頻道不允許複製連結，請改用下方的私人頻道解決方案。'
          },
          {
            title: '貼上並解析',
            description:
              '將 Telegram 連結貼到下載器欄位。工具會檢查能否從該連結取得可下載的影片檔。'
          },
          {
            title: '高畫質下載',
            description:
              '選擇可用的畫質或格式，接著將 Telegram 影片直接儲存到手機、平板或電腦。如果沒有出現檔案，這條連結多半是受到限制，而不是壞掉了。'
          }
        ]
      },
      faq: {
        title: '常見問題',
        description: '在 Telegram Web 進行 Telegram 影片下載或 Telegram 檔案下載前，大家最常問的問題。',
        items: [
          {
            question: '我可以下載 Telegram 私人影片嗎？',
            answer:
              '只有在你有權存取、且影片來源可取得時，才能下載或儲存 Telegram 私人影片。部分私人頻道會封鎖儲存、轉發、複製連結或外部存取。'
          },
          {
            question: '我要如何下載 Telegram 私人頻道影片？',
            answer:
              '如果你有可用的 Telegram 影片連結，請先試試連結式下載器。如果行不通，到 Telegram Desktop 查看是否有 Save Video As 選項。如果下載被封鎖、但你獲准保留內容，螢幕錄影可能是備援方案。'
          },
          {
            question: '為什麼 Telegram 影片下載器顯示找不到影片？',
            answer:
              '這條連結可能受到限制、已刪除、已過期、只在 Telegram 內可見，或被頻道擁有者封鎖。請先自己開啟連結，確認影片仍可播放。如果它只在你登入 Telegram 後才能播放，線上下載器可能就無法存取。'
          },
          {
            question: '我需要安裝軟體嗎？',
            answer:
              '可存取的連結不需要。線上 Telegram 影片下載器可在瀏覽器中運作。針對特定的私人或受限情況，你可能會需要 Telegram Desktop、檔案管理員或螢幕錄影工具。'
          },
          {
            question: '我可以在沒有連結的情況下下載 Telegram 影片嗎？',
            answer:
              '通常不行。線上下載器需要 Telegram 影片連結才能定位檔案。如果你無法複製連結、但能在 Telegram 中觀看影片，請使用 Telegram Desktop 或其他獲准的本機方法。'
          },
          {
            question: '把我的 Telegram 登入碼輸入到下載器安全嗎？',
            answer:
              '不安全。下載器不應該需要你的 Telegram 密碼、驗證碼或工作階段憑證。如果某個網站要求提供這些資訊，請立即離開該頁面。'
          },
          {
            question: 'Telegram 媒體下載器是免費的嗎？',
            answer:
              '許多連結式 Telegram 媒體下載器的基本下載都是免費的。請避免那些強迫你進行可疑安裝、要求登入或設置誤導性按鈕的工具。'
          },
          {
            question: '下載 Telegram 影片合法嗎？',
            answer:
              '這取決於內容、你的授權與使用目的。請勿在未經授權的情況下下載或散布受著作權保護、私人或受限的內容。'
          }
        ]
      },
      workspace: {
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
          creditsLabel: '積分'
        },
        quota: {
          eyebrow: '積分',
          title: '目前積分餘額',
          planLabel: '方案',
          remainingLabel: '剩餘',
          dailyLimitLabel: '每日上限',
          unlimited: '不限'
        },
        checkin: {
          creditsLoading: '積分',
          creditsButtonLabel: '開啟每日簽到',
          accountButtonLabel: '開啟帳戶選單',
          accountMenuLabel: '帳戶選單',
          title: '今日免費積分已準備好',
          todayRewardText: '今日獎勵：{credits} 積分',
          claimedRewardText: '你今天已領取 {credits} 積分。',
          nextCountdown: '距離下次可領取還有 {time}',
          nextAt: '（下次刷新：{time} EST）',
          claimButton: '領取 {credits} 積分',
          claimingButton: '領取中...',
          notNow: '稍後再說',
          close: '關閉',
          loadFailed: '載入簽到狀態失敗。',
          claimFailed: '領取積分失敗。'
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
        parse: {
          eyebrow: '直接解析',
          title: 'Telegram 私人影片下載器：下載任何私人媒體',
          helperText:
            '透過簡單易懂的下載器指南儲存 Telegram 私人頻道影片。下載可存取的影片與媒體、排解下載失敗問題，並為你的裝置找到最合適的方法。',
          telegramMessageListLinkError:
            '這是 Telegram 聊天或頻道入口連結，不是具體訊息連結。請開啟目標訊息，複製某一則訊息的連結後再貼上。',
          linkLabel: 'Telegram 連結',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: '清除輸入',
          submit: '貼上 Telegram 影片連結',
          submitting: '解析中...',
          noResults: '這則訊息裡沒有可下載的檔案。',
          download: '下載',
          downloading: '下載中...',
          downloadAll: '一鍵下載全部',
          downloadingAll: '正在下載全部...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: '大小未知',
          play: '播放',
          preparingPlayback: '正在準備播放...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: '關閉播放器',
          continuePlayback: '繼續播放',
          upgradeToPlay: '升級後播放',
          playQuotaExhausted: '今日播放次數已用完。',
          playerRestoring: '正在恢復播放...',
          playerRestoredPaused: '已恢復，可從上次位置繼續播放。',
          playerResumeFailed: '無法恢復播放工作階段，請重新播放。',
          playerRefreshing: '正在重新整理播放...',
          playerRecreating: '正在重建播放工作階段...',
          playerUnsupported: '目前瀏覽器無法播放這段影片。',
          playerSessionExpired: '播放工作階段已過期，請重新播放。',
          playerFailed: '播放失敗。',
          playQuotaUnavailable: '暫時無法取得播放額度，請登入後再試。',
          playQuotaReached: '今日播放額度已達上限。',
          playerResourceBusy: '影片仍在準備中，請稍後再試。',
          resumeNotice: '偵測到未完成下載：{filename}（{progress}），是否繼續？',
          resumeAction: '繼續',
          pendingRestartText: '上次下載記錄可重新開始：{filename}',
          pendingRestartButton: '重新下載',
          resumeUnavailableText: '本機恢復記錄已失效。',
          resumeDismiss: '忽略',
          resuming: '繼續下載中...',
          largeFileExtensionInlineChromeTitle: 'Chrome 擴充功能',
          largeFileExtensionInlineChromeDescription:
            '專為 Chrome 瀏覽器設計，一鍵偵測並儲存 Telegram 媒體內容。',
          largeFileExtensionInlineChromeCta: '安裝擴充功能',
          largeFileExtensionInlineEdgeTitle: 'Edge 擴充功能',
          largeFileExtensionInlineEdgeDescription:
            '專為 Microsoft Edge 設計，完整支援 Telegram 內容下載。',
          largeFileExtensionInlineEdgeCta: '安裝擴充功能'
        },
        errors: {
          enterEmailFirst: '請先輸入電子郵件地址。',
          enterEmailAndCode: '請輸入電子郵件與驗證碼。',
          sendCodeFailed: '發送驗證碼失敗。',
          googleSignInFailed: 'Google 登入失敗。',
          googleClientMissing: 'Google 登入尚未設定。',
          restoreSessionFailed: '恢復登入狀態失敗。',
          signInFailed: '登入失敗。',
          logoutFailed: '登出失敗。',
          loadQuotaFailed: '載入積分失敗。',
          enterLink: '請輸入媒體連結。',
          invalidLink: '這不是一個合法的 URL。',
          parseFailed: '解析連結失敗。',
          downloadFailed: '下載失敗。',
          unsafeFileTypeUseExtension:
            '安裝包、腳本等檔案存在未知風險。出於安全原因，網頁端暫時無法提供此類檔案的下載服務。你仍可以使用瀏覽器擴充功能下載。',
          unsafeFileTypeConfirmTitle: '使用瀏覽器擴充功能下載',
          unsafeFileTypeConfirmViewExtension: '查看擴充功能下載',
          unsafeFileTypeConfirmCancel: '取消',
          downloadNetworkInterrupted: '網路異常，下載已暫停。請點擊繼續。',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: '暫不支援這個連結平台。',
          tiktokUnsupported: '暫時無法解析這個 TikTok 連結，請使用公開單影片或圖集貼文連結。',
          vimeoParseFailed: '這個 Vimeo 影片為私有內容或暫時無法解析。',
          xParseFailed: '此 X 連結暫不支援，請改用公開影片狀態。',
          instagramParseFailed: '此 Instagram 連結暫不支援，請改用公開貼文。',
          instagramImageParseFailed: '此 Instagram 連結暫不支援，請改用公開圖片貼文。',
          threadsParseFailed: '此 Threads 連結暫不支援，請改用公開貼文。',
          redditParseFailed: 'Reddit 媒體擷取失敗，請改用公開影片、圖片或相簿貼文。',
          douyinParseFailed: '無法取得 Douyin 影片，請確認連結為公開影片。',
          quotaExceeded: '積分不足，無法下載這個檔案。',
          rateLimitExceeded: '請求過於頻繁，請稍後再試。'
        },
        downloadAll: {
          allSuccess: '全部檔案已下載。',
          partialFailed: '部分檔案已下載，部分檔案失敗。',
          allFailed: '全部下載失敗。'
        },
        requiresClient: {
          privateChannel:
            '網頁端無法解析 Telegram 私人頻道內容。免費的瀏覽器擴充功能可以下載你在 Telegram Web 中有權存取的任何私人頻道影片。\n你可以嘗試：\n方法一（推薦）：點擊「免費下載擴充功能」按鈕，安裝桌面瀏覽器擴充功能。\n方法二：\n1. 回到 Telegram。\n2. 右鍵點擊你要下載的訊息，選擇 Forward 轉發到公開頻道或群組。\n3. 進入這個公開頻道或群組。\n4. 右鍵複製公開頻道或群組裡的這則訊息連結，再貼到這裡解析。',
          privateChannelCta: '免費下載擴充功能',
          restrictedFile: '這個受限檔案需要在 Telegram Web 中使用 TG Downloader 處理。',
          floodWait:
            '網站端 Telegram 帳號正在冷卻。請安裝 TG Downloader 擴充功能，在 Telegram Web 中用你的瀏覽器工作階段繼續下載。'
        }
      },
      crossLinks: {
        title: '更多影片下載工具',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: '無浮水印高畫質下載 TikTok 影片。'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: '高畫質下載 X/Twitter 影片與 GIF。'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: '多解析度選項高畫質下載 Vimeo 影片。'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: '高清下載 Instagram 照片、Reels 和相簿。'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: '原畫質下載 Threads 影片和照片。'
          }
        ]
      }
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
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['zh-TW'],
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
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok 影片下載無浮水印 - 高畫質 | TG Downloader',
          description:
            '免費無浮水印高畫質下載 TikTok 影片。無需安裝應用程式。即時儲存 TikTok 影片、圖集與限時動態。',
          keywords:
            'TikTok 下載, TikTok 影片下載, TikTok 無浮水印, TikTok 去浮水印, 下載 TikTok 影片, TikTok 高畫質下載, TikTok 下載器'
        },
        workspace: {
          title: 'TikTok 影片下載 無浮水印',
          helperText:
            '貼上任何 TikTok 影片連結，即可無浮水印高畫質下載。同時支援 Telegram、X 和 Vimeo 連結。',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: '為什麼選擇我們的 TikTok 下載器',
          subtitle: '以最高畫質無浮水印儲存 TikTok 影片，完全免費。',
          items: [
            {
              title: '無浮水印',
              description:
                '下載 TikTok 影片時移除浮水印覆蓋。取得乾淨、原始畫質的影片，可直接儲存或分享。'
            },
            {
              title: '高畫質',
              description:
                '以原始 HD 解析度儲存 TikTok 影片。無畫質損失、無壓縮——與創作者上傳的完全一致。'
            },
            {
              title: '快速且免費',
              description:
                '無需安裝應用程式、無需註冊、無隱藏費用。貼上連結即可取得影片，任何瀏覽器皆可使用。'
            }
          ]
        },
        howTo: {
          title: '如何無浮水印下載 TikTok 影片',
          subtitle:
            '三個簡單步驟，以高畫質無浮水印儲存任何 TikTok 影片。',
          steps: [
            {
              title: '複製 TikTok 影片連結',
              description:
                '開啟 TikTok，點擊影片上的分享按鈕，選擇「複製連結」。'
            },
            {
              title: '將連結貼到上方',
              description:
                '將複製的 TikTok 網址貼到輸入欄位中，點擊解析。'
            },
            {
              title: '無浮水印下載',
              description:
                '點擊下載按鈕，即可無浮水印高畫質儲存 TikTok 影片。'
            }
          ]
        },
        faq: {
          title: 'TikTok 下載器常見問題',
          items: [
            {
              question: '這個 TikTok 下載器真的免費嗎？',
              answer:
                '是的，完全免費且無隱藏費用。您可以免費無浮水印下載 TikTok 影片。'
            },
            {
              question: '下載的影片會有浮水印嗎？',
              answer:
                '不會。我們的下載器會移除 TikTok 浮水印，提供原始乾淨的高畫質影片。'
            },
            {
              question: '下載的 TikTok 影片畫質如何？',
              answer:
                '影片以創作者上傳的原始 HD 解析度儲存，無任何畫質損失。'
            },
            {
              question: '需要安裝任何應用程式或擴充功能嗎？',
              answer:
                '不需要安裝。這是一個網頁工具，可在任何裝置的瀏覽器中直接使用。'
            },
            {
              question: '可以下載 TikTok 限時動態和圖集嗎？',
              answer:
                '可以，我們的下載器支援 TikTok 影片、圖片圖集和限時動態。貼上連結即可下載。'
            }
          ]
        },
        crossLinks: {
          title: '更多影片下載工具',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高畫質下載 X/Twitter 影片與 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '多解析度選項高畫質下載 Vimeo 影片。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下載 Instagram 照片、Reels 和相簿。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原畫質下載 Threads 影片和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高畫質下載 Telegram 頻道和群組的影片。'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) 影片下載器 - 儲存影片與 GIF 高畫質 | TG Downloader',
          description:
            '免費高畫質下載 X (Twitter) 影片與 GIF。無需安裝應用程式。即時儲存任何公開推文的影片或 GIF。',
          keywords:
            'X 下載器, Twitter 影片下載, 下載 Twitter 影片, X 影片下載器, Twitter GIF 下載, 儲存 Twitter 影片, 推特影片下載'
        },
        workspace: {
          title: 'X (Twitter) 影片下載器',
          helperText:
            '貼上任何 X 或 Twitter 影片連結，以最高畫質下載。同時支援 Telegram、TikTok 和 Vimeo 連結。',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: '為什麼選擇我們的 X 影片下載器',
          subtitle: '以原始畫質儲存 X/Twitter 影片與 GIF，完全免費。',
          items: [
            {
              title: '影片與 GIF',
              description:
                '下載 X (Twitter) 的影片貼文與動態 GIF。取得與推文中完全相同的媒體內容。'
            },
            {
              title: '原始高畫質',
              description:
                '以最高可用解析度儲存 X 影片。無畫質降低——取得與原始檔相同的位元率。'
            },
            {
              title: '快速且免費',
              description:
                '無需安裝應用程式、無需登入。貼上推文網址，幾秒內即可下載影片或 GIF。'
            }
          ]
        },
        howTo: {
          title: '如何下載 X (Twitter) 影片',
          subtitle:
            '三個簡單步驟，儲存 X/Twitter 上的任何影片或 GIF。',
          steps: [
            {
              title: '複製推文網址',
              description:
                '在 X (Twitter) 上，點擊推文的分享圖示，選擇「複製連結」。'
            },
            {
              title: '將連結貼到上方',
              description:
                '將複製的 X/Twitter 網址貼到輸入欄位中，點擊解析。'
            },
            {
              title: '下載影片或 GIF',
              description:
                '點擊下載，以高畫質將影片或 GIF 儲存到您的裝置。'
            }
          ]
        },
        faq: {
          title: 'X 影片下載器常見問題',
          items: [
            {
              question: '如何從 X (Twitter) 下載影片？',
              answer:
                '複製包含影片的推文網址，貼到上方輸入欄位中，點擊解析。然後點擊下載即可儲存影片。'
            },
            {
              question: '可以從 X 下載 GIF 嗎？',
              answer:
                '可以。我們的下載器支援 X/Twitter 貼文中的影片和動態 GIF。GIF 會以 MP4 格式儲存以確保最佳相容性。'
            },
            {
              question: '可以下載什麼畫質的影片？',
              answer:
                '我們提供每則推文的最高可用畫質，通常是發文者上傳的原始 HD 解析度。'
            },
            {
              question: '這個 X 下載器免費嗎？',
              answer:
                '是的，完全免費且無需註冊。免費下載 X 影片與 GIF，無任何費用。'
            },
            {
              question: '需要 X/Twitter 帳號才能下載嗎？',
              answer:
                '不需要帳號。只要推文是公開的，您就可以不用登入即可下載其影片或 GIF。'
            }
          ]
        },
        crossLinks: {
          title: '更多影片下載工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '無浮水印高畫質下載 TikTok 影片。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '多解析度選項高畫質下載 Vimeo 影片。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下載 Instagram 照片、Reels 和相簿。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原畫質下載 Threads 影片和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高畫質下載 Telegram 頻道和群組的影片。'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo 影片下載器 HD - 多解析度選項 | TG Downloader',
          description:
            '免費高畫質多解析度下載 Vimeo 影片。無需安裝應用程式。即時儲存任何公開 Vimeo 影片。',
          keywords:
            'Vimeo 下載, Vimeo 影片下載, 下載 Vimeo 影片 HD, Vimeo 下載器, 儲存 Vimeo 影片, Vimeo 高畫質下載'
        },
        workspace: {
          title: 'Vimeo 影片下載器 HD',
          helperText:
            '貼上任何 Vimeo 影片連結，即可選擇解析度高畫質下載。同時支援 Telegram、TikTok 和 X 連結。',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: '為什麼選擇我們的 Vimeo 下載器',
          subtitle: '自由選擇解析度，以高畫質儲存 Vimeo 影片，完全免費。',
          items: [
            {
              title: 'HD 原始畫質',
              description:
                '以完整 HD 解析度下載 Vimeo 影片。取得與創作者上傳時相同的清晰畫質。'
            },
            {
              title: '多種解析度',
              description:
                '從可用的解析度中選擇（360p、720p、1080p 及更高）。挑選符合您需求的畫質。'
            },
            {
              title: '快速且免費',
              description:
                '無需安裝應用程式、無需帳號。貼上 Vimeo 連結，選擇解析度，即刻下載。'
            }
          ]
        },
        howTo: {
          title: '如何高畫質下載 Vimeo 影片',
          subtitle:
            '三個簡單步驟，以您偏好的解析度儲存任何 Vimeo 影片。',
          steps: [
            {
              title: '複製 Vimeo 影片連結',
              description:
                '開啟 Vimeo 影片頁面，從瀏覽器網址列複製網址。'
            },
            {
              title: '將連結貼到上方',
              description:
                '將複製的 Vimeo 網址貼到輸入欄位中，點擊解析。'
            },
            {
              title: '選擇解析度並下載',
              description:
                '選擇您偏好的影片解析度，點擊下載即可儲存高畫質影片。'
            }
          ]
        },
        faq: {
          title: 'Vimeo 下載器常見問題',
          items: [
            {
              question: '如何從 Vimeo 下載影片？',
              answer:
                '複製 Vimeo 影片頁面網址，貼到上方輸入欄位中，點擊解析，然後選擇偏好的解析度並下載。'
            },
            {
              question: '可以選擇影片解析度嗎？',
              answer:
                '可以。解析完成後，您可以從所有可用解析度中選擇，包括 360p、720p、1080p 及更高（若有提供）。'
            },
            {
              question: '這個 Vimeo 下載器免費嗎？',
              answer:
                '是的，完全免費使用。無需任何費用或註冊即可高畫質下載 Vimeo 影片。'
            },
            {
              question: '需要 Vimeo 帳號才能下載嗎？',
              answer:
                '不需要帳號。您可以不用登入即可下載任何公開的 Vimeo 影片。'
            },
            {
              question: '下載的影片是什麼格式？',
              answer:
                'Vimeo 影片以 MP4 格式下載，幾乎所有裝置和播放器都可相容。'
            }
          ]
        },
        crossLinks: {
          title: '更多影片下載工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '無浮水印高畫質下載 TikTok 影片。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高畫質下載 X/Twitter 影片與 GIF。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下載 Instagram 照片、Reels 和相簿。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原畫質下載 Threads 影片和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高畫質下載 Telegram 頻道和群組的影片。'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram 照片和影片下載器 - 高清畫質 | TG Downloader',
          description:
            '免費高清下載 Instagram 照片、Reels 和相簿。無需安裝應用，即時儲存 Instagram 媒體內容。',
          keywords:
            'Instagram下載, Instagram照片下載, Instagram Reels下載, Instagram相簿下載, 儲存Instagram影片, 免費Instagram下載器'
        },
        workspace: {
          title: 'Instagram 照片和影片下載',
          helperText:
            '貼上任意 Instagram 貼文連結，即可高清下載照片、Reels 和相簿。同時支援 Telegram、TikTok 和 X 連結。',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: '為什麼選擇我們的 Instagram 下載器',
          subtitle: '原始高清畫質儲存 Instagram 照片、Reels 和相簿，完全免費。',
          items: [
            {
              title: '照片和 Reels',
              description:
                '下載 Instagram 照片和 Reels 影片，保持原始畫質。取得與創作者發佈時完全一致的媒體內容。'
            },
            {
              title: '相簿批次下載',
              description:
                '一次下載 Instagram 相簿貼文中的所有圖片和影片，無需逐個儲存。'
            },
            {
              title: 'HD 原始畫質',
              description:
                '以最高可用解析度儲存 Instagram 媒體。無壓縮、無畫質損失，與上傳時完全一致。'
            }
          ]
        },
        howTo: {
          title: '如何下載 Instagram 照片和影片',
          subtitle:
            '只需三步，即可高清儲存任意 Instagram 貼文內容。',
          steps: [
            {
              title: '複製 Instagram 貼文連結',
              description:
                '開啟 Instagram，點擊貼文右上角的三個點，選擇「複製連結」。'
            },
            {
              title: '貼上連結',
              description:
                '將複製的 Instagram URL 貼到上方輸入框，點擊「解析」。'
            },
            {
              title: '高清下載',
              description:
                '點擊「下載」按鈕，儲存照片、Reels 或相簿內容，畫質與原始一致。'
            }
          ]
        },
        faq: {
          title: 'Instagram 下載器常見問題',
          items: [
            {
              question: '這個 Instagram 下載器真的免費嗎？',
              answer:
                '是的，完全免費，沒有隱藏收費。你可以零成本下載 Instagram 照片、Reels 和相簿。'
            },
            {
              question: '支援哪些格式？',
              answer:
                '我們支援下載 Instagram 照片（JPG）、Reels 影片（MP4）以及包含所有媒體的完整相簿。'
            },
            {
              question: '下載的檔案是什麼畫質？',
              answer:
                '所有媒體以創作者上傳時的原始 HD 解析度儲存，無畫質損失或壓縮。'
            },
            {
              question: '下載需要 Instagram 帳號嗎？',
              answer:
                '不需要。只要貼文是公開的，無需登入即可下載其中的媒體內容。'
            },
            {
              question: '可以下載 Instagram 限時動態嗎？',
              answer:
                '目前支援貼文、Reels 和相簿。限時動態下載需要內容可透過直接連結公開存取。'
            }
          ]
        },
        crossLinks: {
          title: '更多影片下載工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '無浮水印高畫質下載 TikTok 影片。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高畫質下載 X/Twitter 影片與 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下載 Vimeo 影片，支援多種解析度選擇。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原畫質下載 Threads 影片和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高畫質下載 Telegram 頻道和群組的影片。'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads 影片和照片下載器 - 原始畫質 | TG Downloader',
          description:
            '免費原畫質下載 Threads 影片和照片。無需安裝應用，即時儲存 Threads 媒體內容，包括輪播貼文。',
          keywords:
            'Threads下載, Threads影片下載, 下載Threads影片, Threads媒體下載, 儲存Threads影片, 免費Threads下載器'
        },
        workspace: {
          title: 'Threads 影片和照片下載',
          helperText:
            '貼上任意 Threads 貼文連結，即可原畫質下載影片和照片。同時支援 Telegram、TikTok 和 Instagram 連結。',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: '為什麼選擇我們的 Threads 下載器',
          subtitle: '原畫質儲存 Threads 影片和照片，完全免費。',
          items: [
            {
              title: '混合媒體',
              description:
                '下載 Threads 貼文中的影片和照片。支援包含多種內容類型的混合媒體貼文。'
            },
            {
              title: '原始畫質',
              description:
                '以最高可用解析度儲存 Threads 媒體。無壓縮、無畫質損失，與發佈時完全一致。'
            },
            {
              title: '輪播支援',
              description:
                '一次下載 Threads 輪播貼文中的所有媒體。單次操作取得每張照片和影片。'
            }
          ]
        },
        howTo: {
          title: '如何下載 Threads 影片和照片',
          subtitle:
            '只需三步，即可原畫質儲存任意 Threads 貼文內容。',
          steps: [
            {
              title: '複製 Threads 貼文連結',
              description:
                '開啟 Threads，點擊貼文的分享圖示，選擇「複製連結」。'
            },
            {
              title: '貼上連結',
              description:
                '將複製的 Threads URL 貼到上方輸入框，點擊「解析」。'
            },
            {
              title: '下載媒體',
              description:
                '點擊「下載」按鈕，原畫質儲存影片和照片。'
            }
          ]
        },
        faq: {
          title: 'Threads 下載器常見問題',
          items: [
            {
              question: '這個 Threads 下載器真的免費嗎？',
              answer:
                '是的，完全免費，沒有隱藏收費。你可以零成本下載 Threads 影片和照片。'
            },
            {
              question: '支援哪些媒體類型？',
              answer:
                '我們支援下載 Threads 上的影片、照片和混合媒體貼文，包括包含多個項目的輪播貼文。'
            },
            {
              question: '下載的檔案是什麼畫質？',
              answer:
                '所有媒體以創作者發佈時的原始解析度儲存，無畫質損失。'
            },
            {
              question: '下載需要 Threads 帳號嗎？',
              answer:
                '不需要。只要貼文是公開的，無需登入即可下載其中的媒體內容。'
            },
            {
              question: '可以下載包含多張照片的輪播貼文嗎？',
              answer:
                '可以，我們的下載器完全支援 Threads 輪播貼文。輪播中的所有照片和影片都可下載。'
            }
          ]
        },
        crossLinks: {
          title: '更多影片下載工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '無浮水印高畫質下載 TikTok 影片。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高畫質下載 X/Twitter 影片與 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下載 Vimeo 影片，支援多種解析度選擇。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下載 Instagram 照片、Reels 和相簿。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高畫質下載 Telegram 頻道和群組的影片。'
            }
          ]
        }
      }
    }
  }
}
