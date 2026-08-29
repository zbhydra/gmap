import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { zhCNPricingContent } from '../pricing'

export const zhCN: SiteContent = {
  site: {
    name: 'Telegram 视频下载 | TG Downloader',
    description:
      '使用 TG Downloader 在 Telegram Web 中完成 Telegram 视频下载，保存已加载的视频、文件和媒体，并继续处理 Telegram 私人频道内容。',
    keywords:
      'Telegram 视频下载, Telegram 媒体下载, Telegram 视频保存, Telegram 文件下载, Telegram 私人频道'
  },
  layout: {
    nav: {
      brand: 'TG 下载器',
      home: '首页',
      pricing: '价格',
      solutions: '解决方案',
      changelog: '更新日志'
    },
    footer: {
      resources: '资源',
      rights: '© 2026 TG 下载器. 保留所有权利.'
    }
  },
  common: {
    installCta: '立即安装'
  },
  sections: {
    features: {
      title: 'Telegram 媒体下载功能',
      subtitle:
        '这些 Telegram 媒体下载功能覆盖文件、图片、视频、更大的批量任务，以及 Telegram Web 中已经加载的内容。',
      metaDescription:
        'TG Downloader 功能：多文件批量保存、私人频道支持、1GB+ 大文件下载、实时媒体检测，以及无需登录的隐私优先设计。',
      items: [
        {
          title: '批量下载',
          description: '支持多选批量下载，一键下载整个频道或群组的所有媒体文件',
          details: [
            '支持多选批量下载',
            '一键下载整个频道或群组',
            '按文件类型智能过滤',
            '下载队列管理'
          ]
        },
        {
          title: '支持受限内容',
          description: '对你已经能打开的受限频道和私人群组，提供更稳定的保存路径',
          details: ['保存你能访问的受限频道内容', '覆盖禁止下载的消息', '支持你已加入的私人群组', '支持 Telegram Web A / K 版本']
        },
        {
          title: '多格式支持',
          description: '支持图片、视频、GIF、音频等多种媒体格式',
          details: [
            '图片：JPG、PNG、WEBP、GIF',
            '视频：MP4、WEBM、MOV',
            '音频：MP3、M4A、OGG',
            '自动格式检测'
          ]
        },
        {
          title: '安全可靠',
          description: '无需提供密码或 API 登录，不收集任何用户数据',
          details: ['无需密码或 API 登录', '不收集用户数据', '无病毒无广告', '严格安全测试']
        },
        {
          title: '大文件支持',
          description: '稳定下载 1GB+ 大文件，断点续传，快速稳定',
          details: ['稳定下载 1GB+ 大文件', '断点续传支持', '快速稳定的传输', '进度跟踪']
        },
        {
          title: '实时检测',
          description: '自动扫描并检测页面中的媒体资源，实时更新下载列表',
          details: ['自动扫描页面媒体资源', '实时资源检测', '自动列表更新', '智能资源缓存']
        }
      ]
    },
    steps: {
      title: 'Telegram 视频保存指南',
      subtitle:
        '按照这份 Telegram 视频保存指南，在 Telegram Web 打开消息后即可用更少步骤保存视频和其他媒体。',
      metaDescription:
        '使用 TG Downloader 保存 Telegram 视频、文件和相册的分步指南。学习如何安装扩展、在 Telegram Web 中检测媒体并批量下载内容。',
      items: [
        {
          title: '安装扩展',
          description: '在浏览器扩展商店搜索并安装 TG 下载器'
        },
        {
          title: '固定扩展',
          description: '点击浏览器工具栏，将扩展图标固定以便快速访问'
        },
        {
          title: '打开 Telegram Web',
          description: '访问 web.telegram.org，扩展会自动开始扫描媒体资源'
        },
        {
          title: '批量下载',
          description: '选择要下载的文件，点击下载按钮即可批量保存到本地'
        }
      ]
    },
    cta: {
      title: '准备好开始了吗？',
      description: '立即安装扩展，开始从 Telegram 下载媒体文件。'
    },
    techSpecs: {
      title: '技术规格',
      browsersLabel: '浏览器',
      browsers: 'Chrome、Edge、Brave 及所有基于 Chromium 的浏览器',
      telegramVersionsLabel: 'Telegram 版本',
      telegramVersions: 'Web K 版本和 A 版本',
      permissionsLabel: '权限',
      permissions: '仅需最低权限',
      updatesLabel: '更新',
      updates: '从扩展商店自动更新'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: '从一个 Telegram 链接开始下载',
        description: '先在网页解析，遇到限制或失败，再切换浏览器插件继续完成下载。'
      },
      stats: {
        users: '全球用户',
        downloads: '累计下载'
      },
      seo: {
        title: 'Telegram 私人视频下载器：下载任意私密媒体',
        description:
          '通过简单的下载器指南保存 Telegram 私人频道视频。下载可访问的视频和媒体，排查下载失败的问题，并为你的设备找到合适的方法。',
        keywords:
          'Telegram 私人视频下载器, Telegram 私人频道视频下载, 下载 Telegram 私人视频, Telegram 私密媒体下载, telegram private video downloader'
      },
      heroTrustPoints: [
        '高清视频下载',
        '无需注册',
        '移动端友好',
        '支持 Windows、Mac、Android 和 iPhone'
      ],
      situation: {
        title: '从这里开始：你属于哪种情况？',
        intro:
          '大多数搜索 Telegram 私人视频下载器的用户，通常想解决以下问题之一：',
        headers: ['你的情况', '优先尝试'],
        rows: [
          {
            cells: [
              '你有一个来自频道或聊天的 Telegram 视频链接',
              '把链接粘贴到在线 Telegram 视频下载器'
            ]
          },
          {
            cells: [
              '你能在私人频道里观看视频，但无法保存',
              '试试 Telegram Desktop 的 Save Video As 选项'
            ]
          },
          {
            cells: [
              '视频可以播放，但下载和转发被禁用',
              '仅在你有权保留副本时才使用屏幕录制'
            ]
          },
          {
            cells: [
              '下载器提示找不到视频',
              '检查访问权限、链接类型、频道限制，以及视频能否在 Telegram 之外打开'
            ]
          }
        ]
      },
      solutions: {
        title: 'Telegram 私人视频有哪些可行方法？',
        intro:
          'Telegram 私人视频通常是指在私人频道、私人群组或私聊中分享的视频。这类视频只对已通过审核的成员可见，因此下载它们与从公开频道保存媒体并不相同。',
        quickAnswer:
          '快速回答：如果链接可访问，使用在线 Telegram 私人视频下载器；如果视频只能在 Telegram 内查看，试试 Telegram Desktop；如果保存被禁用但你有权保留内容，屏幕录制可能是实用的兜底方案。',
        items: [
          {
            title: '方案一：在线 Telegram 视频下载器',
            description:
              '最适合可访问的 Telegram 链接。对于想在线下载 Telegram 视频、又不想安装应用、扩展或机器人的用户，这是最简单的方法。',
            useWhenLabel: '适用场景：',
            useWhen: [
              'Telegram 视频链接是公开的或可访问的。',
              '你想在线下载 Telegram 视频。',
              '你需要快速获得高清视频文件。',
              '你不想安装浏览器扩展或桌面应用。'
            ]
          },
          {
            title: '方案二：Telegram Desktop 的 Save Video As',
            description:
              '当视频在 Telegram Desktop 中可用且允许下载时，右键点击视频并保存到电脑上的文件夹。对私人频道成员来说，这种方式通常更有效，因为你已经在 Telegram 内完成了身份验证。',
            useWhenLabel: '适用场景：',
            useWhen: [
              '你能在 Telegram Desktop 中查看视频。',
              '频道所有者没有禁用保存。',
              '你更倾向直接下载到 Windows 或 Mac。'
            ]
          },
          {
            title: '方案三：移动端或桌面端屏幕录制',
            description:
              '如果下载选项被禁用，但你有权查看并保留内容，屏幕录制工具可以在视频播放时同时捕捉画面和声音。这是兜底方案而非首选，因为它耗时更长，且取决于播放质量。',
            useWhenLabel: '适用场景：',
            useWhen: [
              '你有权查看并保留该视频。',
              '下载器无法解析这个 Telegram 链接。',
              '你需要一份个人离线副本作参考。'
            ]
          },
          {
            title: '方案四：Android 文件管理器排查',
            description:
              '在某些 Android 场景下，Telegram 可能会把已加载的媒体临时存放在本地应用文件夹中。文件管理器有时能帮你找到设备上已经加载过的视频，但这取决于应用版本、存储权限和缓存行为。',
            useWhenLabel: '适用场景：',
            useWhen: [
              '你已经在 Android 的 Telegram 中播放过该视频。',
              '你了解应用的存储权限。',
              '你只需要找回设备上已缓存的文件。'
            ]
          }
        ]
      },
      benefits: {
        title: '为什么使用在线 Telegram 视频下载器？',
        intro:
          '一个好的下载器应当帮你快速回答一个问题：用我手上的这个链接，能不能保存这段 Telegram 视频？最好的体验是直接、清晰，并在私人链接无法处理时如实告知。',
        items: [
          {
            title: '高质量保存视频',
            description:
              '以可获得的最佳质量保存 Telegram 视频，便于离线播放、学习、培训、归档或个人参考。'
          },
          {
            title: '跨设备可用',
            description:
              '在 Android、iPhone、Windows、Mac 或平板的浏览器中都能使用下载器。当视频在手机上、而你想保存到另一台设备时，这一点尤为重要。'
          },
          {
            title: '无需登录 Telegram',
            description:
              '选择那些只处理视频链接、而不索要你 Telegram 密码、验证码、会话文件或私人账号凭据的工具。'
          },
          {
            title: '轻松离线播放',
            description:
              '在可用时以常见视频格式下载文件，让你之后无需打开 Telegram 或消耗移动流量即可观看。'
          },
          {
            title: '基于链接的快速流程',
            description:
              '复制、粘贴、解析、下载。如果链接失败，页面应说明原因，并告诉你接下来可以尝试什么。'
          },
          {
            title: '清晰的权限边界',
            description:
              '只下载你有权访问和保存的视频。尊重频道规则、创作者权益以及 Telegram 的政策。'
          }
        ]
      },
      troubleshooting: {
        title: '如果 Telegram 视频链接不可用',
        intro:
          '链接失败并不一定意味着下载器出了问题。Telegram 私人视频经常失败，是因为文件在 Telegram 之外不可用。可以按这份清单排查：',
        items: [
          '在浏览器中打开链接，确认它能正常加载。',
          '确认你仍是该私人频道或群组的成员。',
          '检查频道所有者是否禁用了保存、复制或转发。',
          '如果视频只能在应用内播放，试试 Telegram Desktop。',
          '如果页面无法连接 Telegram，换一个浏览器或网络。',
          '避免使用任何索要你 Telegram 登录验证码的工具。'
        ]
      },
      permission: {
        title: '重要权限提示',
        note:
          'Telegram 私人视频下载器不应被用来绕过隐私、版权或访问限制。只有在获得所有者许可，或你的使用符合法律和 Telegram 条款时，才保存视频。'
      },
      comparison: {
        title: '选择合适的 Telegram 下载方法',
        headers: ['情况', '推荐方案', '最适合', '需要检查'],
        rows: [
          {
            cells: [
              '公开或可访问的 Telegram 视频链接',
              '在线 Telegram 视频下载器',
              '无需应用的快速高清下载',
              '链接能打开，且工具能读取到该视频'
            ]
          },
          {
            cells: [
              '允许下载的私人频道视频',
              'Telegram Desktop 的 Save Video As',
              '直接保存到电脑',
              '你是成员，且所有者没有禁用保存'
            ]
          },
          {
            cells: [
              '保存受限但可正常播放',
              '系统自带或第三方屏幕录制工具',
              '在获许可时作个人离线参考',
              '音频捕捉、录制区域，以及当地法律或平台规则'
            ]
          },
          {
            cells: [
              'Android 缓存的媒体',
              '文件管理器排查',
              '查找设备上已加载的媒体',
              '应用存储访问权限，以及 Telegram 是否保留本地缓存'
            ]
          }
        ]
      },
      howTo: {
        title: '3 步下载 Telegram 视频',
        subtitle:
          '最快的方式是基于链接的 Telegram 视频下载器。当 Telegram 视频链接是公开的、可访问的，或能在 Telegram 应用之外读取时，它的效果最好。',
        steps: [
          {
            title: '复制视频链接',
            description:
              '打开 Telegram，找到你想保存的视频，从分享菜单复制消息链接或视频链接。如果频道不允许复制链接，请参考下方的私人频道方案。'
          },
          {
            title: '粘贴并解析',
            description:
              '把 Telegram 链接粘贴到下载器输入框。工具会检查能否从该链接读取到可下载的视频文件。'
          },
          {
            title: '高清下载',
            description:
              '选择可用的画质或格式，然后把 Telegram 视频直接保存到你的手机、平板或电脑。如果没有出现文件，多半是链接被限制了，而非链接损坏。'
          }
        ]
      },
      faq: {
        title: '常见问题解答',
        description: '在 Telegram Web 中进行 Telegram 视频下载或 Telegram 文件下载之前，人们常会问的问题。',
        items: [
          {
            question: '我可以下载 Telegram 私人视频吗？',
            answer:
              '只有当你有权访问且视频源可用时，才能下载或保存 Telegram 私人视频。有些私人频道会屏蔽保存、转发、复制链接或外部访问。'
          },
          {
            question: '如何下载 Telegram 私人频道视频？',
            answer:
              '如果你有可用的 Telegram 视频链接，先尝试基于链接的下载器。如果不行，检查 Telegram Desktop 是否有 Save Video As 选项。如果下载被禁用但你有权保留内容，屏幕录制可作为兜底方案。'
          },
          {
            question: '为什么 Telegram 视频下载器提示找不到视频？',
            answer:
              '该链接可能被限制、已删除、已过期、只能在 Telegram 内查看，或被频道所有者屏蔽。请先自己打开链接，确认视频仍能播放。如果它只有在你登录 Telegram 后才能播放，在线下载器可能无法访问它。'
          },
          {
            question: '我需要安装软件吗？',
            answer:
              '对于可访问的链接，不需要。在线 Telegram 视频下载器在浏览器中即可使用。对于特定的私人或受限场景，你可能需要 Telegram Desktop、文件管理器或屏幕录制工具。'
          },
          {
            question: '我可以不用链接下载 Telegram 视频吗？',
            answer:
              '通常不行。在线下载器需要 Telegram 视频链接来定位文件。如果你无法复制链接但能在 Telegram 中观看视频，请使用 Telegram Desktop 或其他获许可的本地方法。'
          },
          {
            question: '把 Telegram 登录验证码输入到下载器里安全吗？',
            answer:
              '不安全。下载器不应需要你的 Telegram 密码、验证码或会话凭据。如果某个网站索要这些信息，请立即离开该页面。'
          },
          {
            question: 'Telegram 媒体下载器是免费的吗？',
            answer:
              '许多基于链接的 Telegram 媒体下载器在基础下载上是免费的。请避开那些强制可疑安装、索要登录信息或使用误导性按钮的工具。'
          },
          {
            question: '下载 Telegram 视频合法吗？',
            answer:
              '这取决于内容本身、你的权限以及你的使用目的。未经授权，请勿下载或再分发受版权保护、私密或受限的内容。'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: '网页登录',
          title: '登录后同步积分',
          trigger: '登录',
          modalTitle: '登录后继续',
          closeLabel: '关闭',
          signedInAs: '当前登录账号',
          continueWithGoogle: '使用 Google 继续',
          googleLoading: '正在打开 Google...',
          or: '或',
          emailLabel: '邮箱',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: '使用邮箱继续',
          sendCode: '发送验证码',
          sendingCode: '发送中...',
          sendCodeSuccess: '验证码已发送。',
          sendAgain: '重新发送',
          codeLabel: '验证码',
          codePlaceholder: '123456',
          signIn: '登录',
          termsNotice: '登录即表示你同意',
          termsLink: '服务条款',
          privacyLink: '隐私政策',
          logout: '退出登录',
          creditsLabel: '积分'
        },
        quota: {
          eyebrow: '积分',
          title: '当前积分余额',
          planLabel: '套餐',
          remainingLabel: '剩余',
          dailyLimitLabel: '每日限额',
          unlimited: '不限'
        },
        checkin: {
          creditsLoading: '积分',
          creditsButtonLabel: '打开每日签到',
          accountButtonLabel: '打开账户菜单',
          accountMenuLabel: '账户菜单',
          title: '今日免费积分已准备好',
          todayRewardText: '今日奖励：{credits} 积分',
          claimedRewardText: '你今天已领取 {credits} 积分。',
          nextCountdown: '距离下次可领取还有 {time}',
          nextAt: '（下次刷新：{time} EST）',
          claimButton: '领取 {credits} 积分',
          claimingButton: '领取中...',
          notNow: '稍后再说',
          close: '关闭',
          loadFailed: '加载签到状态失败。',
          claimFailed: '领取积分失败。'
        },
        creditPurchase: {
          title: '购买积分',
          description: '补充积分后即可继续在当前下载工作区下载。',
          successTitle: '积分已到账',
          successDescription: '余额已刷新。关闭弹窗后，请重新点击下载。',
          packageEyebrow: '按需购买',
          cardNote: '积分可用于网站下载，永久有效。',
          creditsAmount: '{credits} 积分',
          buyNow: '立即购买',
          selectPackage: '选择',
          paymentMethodLabel: '选择支付方式',
          paymentTitle: '选择支付方式',
          selectedPackageLabel: '已选商品',
          confirmPurchase: '继续支付',
          backToProducts: '返回',
          close: '关闭',
          agreementText: '我已阅读并同意购买条款、服务条款和隐私政策。',
          loadingConfigs: '正在加载积分套餐...',
          loadFailed: '加载积分套餐失败，请重试。',
          noConfigs: '当前没有可购买的积分套餐，请稍后重试。',
          ready: '请选择积分套餐。页面只展示美元价格。',
          creatingOrder: '正在创建订单...',
          pendingPayment: '请在新打开的标签页中完成支付。我们会自动检查结果。',
          pendingPaymentTitle: '等待支付',
          cancelPayment: '取消支付',
          supportMailPrefix: '反馈问题：',
          success: '支付完成，积分已可使用。',
          failed: '支付尚未完成，你可以重试或关闭弹窗。',
          successCredits: '+{credits} 积分已到账',
          successBalance: '当前余额：{balance} 积分',
          createFailed: '创建订单失败，请重试。',
          invalidPaymentData: '支付链接异常，请稍后重试。',
          priceUpdated: '价格已更新，请确认最新价格后重新购买。',
          gatewayFailed: '支付入口暂不可用，请稍后重试。',
          paymentCanceled: '支付已取消，请重新选择支付方式。',
          pollFailed: '刷新支付状态失败，请重试。',
          pollTimeout: '自动刷新已超时。支付后请手动刷新结果。',
          orderNotFound: '订单已不可用，请重新下单。',
          orderExpired: '订单已过期，请重新购买。',
          fulfillmentFailed: '支付已收到，但积分暂未到账，请稍后重试。',
          authExpired: '登录已失效，请重新登录后继续。'
        },
        parse: {
          eyebrow: '直连解析',
          title: 'Telegram 私人视频下载器：下载任意私密媒体',
          helperText:
            '通过简单的下载器指南保存 Telegram 私人频道视频。下载可访问的视频和媒体，排查下载失败的问题，并为你的设备找到合适的方法。',
          failureTitle: '网页解析到这里为止',
          failureDescription: '网页解析走不通时，浏览器插件通常能继续处理这段消息。',
          privateChannelDescription:
            '这是私有频道链接，网页解析无法访问。请安装浏览器插件并在 Telegram Web 中打开目标消息，插件会对你已加载到页面的内容提供更稳定的下载路径。',
          failureCta: '安装浏览器插件',
          unsupportedLinkError: '只能解析 Telegram 消息链接。',
          telegramInviteLinkError:
            '这是 Telegram 邀请链接，不是具体消息链接。请先加入或打开这个聊天，再复制某一条消息的链接。',
          telegramMessageListLinkError:
            '这是 Telegram 聊天或频道入口链接，不是具体消息链接。请打开目标消息，复制某一条消息的链接后再粘贴。',
          telegramWebLinkError:
            '这是 Telegram Web 页面链接。请安装 TG Downloader 插件，在 Telegram Web 打开这个链接后，用插件下载页面里可见的媒体。',
          messageLinkGuideTitle: '复制具体消息链接',
          messageLinkGuideDesktopInstruction:
            '右键点击这条消息，然后点击 Copy Message Link。',
          messageLinkGuideMobileInstruction: '点击右上角的三个点，然后点击 Copy Link。',
          messageLinkGuideRetryHint: '把复制到的链接粘贴到这里，然后重新解析。',
          messageLinkGuideTrigger: '如何复制正确的 Telegram 链接？',
          linkLabel: 'Telegram 链接',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: '清除输入',
          submit: '粘贴 Telegram 视频链接',
          submitting: '解析中...',
          noResults: '这条消息里没有可下载的文件。',
          download: '下载',
          downloading: '下载中...',
          checkingStorage: '正在检查浏览器存储...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: '大小未知',
          play: '播放',
          preparingPlayback: '正在准备播放...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: '关闭播放器',
          continuePlayback: '继续播放',
          upgradeToPlay: '升级后播放',
          playQuotaExhausted: '今日播放次数已用完。',
          playerRestoring: '正在恢复播放...',
          playerRestoredPaused: '已恢复，可从上次位置继续播放。',
          playerResumeFailed: '无法恢复播放会话，请重新播放。',
          playerRefreshing: '正在刷新播放...',
          playerRecreating: '正在重建播放会话...',
          playerUnsupported: '当前浏览器无法播放这个视频。',
          playerSessionExpired: '播放会话已过期，请重新播放。',
          playerFailed: '播放失败。',
          playQuotaUnavailable: '暂时无法获取播放额度，请登录后重试。',
          playQuotaReached: '今日播放额度已达上限。',
          playerResourceBusy: '视频仍在准备中，请稍后再试。',
          downloadAll: '一键下载全部',
          downloadingAll: '正在下载全部...',
          resumeNotice: '检测到未完成下载：{filename}（{progress}），是否继续？',
          resumeAction: '继续',
          pendingRestartText: '上次下载记录可重新开始：{filename}',
          pendingRestartButton: '重新下载',
          resumeUnavailableText: '本地恢复记录已失效。',
          resumeDismiss: '忽略',
          resuming: '继续下载中...',
          largeFileExtensionInlineChromeTitle: 'Chrome 插件',
          largeFileExtensionInlineChromeDescription:
            '专为 Chrome 浏览器设计，一键捕获 Telegram 私密频道内容。',
          largeFileExtensionInlineChromeCta: '下载插件',
          largeFileExtensionInlineEdgeTitle: 'Edge 插件',
          largeFileExtensionInlineEdgeDescription:
            '专为 Microsoft Edge 设计，一键捕获 Telegram 私密频道内容。',
          largeFileExtensionInlineEdgeCta: '下载插件'
        },
        errors: {
          enterEmailFirst: '请先输入邮箱地址。',
          enterEmailAndCode: '请输入邮箱和验证码。',
          sendCodeFailed: '发送验证码失败。',
          googleSignInFailed: 'Google 登录失败。',
          googleClientMissing: 'Google 登录尚未配置。',
          restoreSessionFailed: '恢复登录状态失败。',
          signInFailed: '登录失败。',
          logoutFailed: '退出登录失败。',
          loadQuotaFailed: '加载积分失败。',
          enterLink: '请输入媒体链接。',
          invalidLink: '这不是一个合法的 URL。',
          parseFailed: '解析链接失败。',
          downloadFailed: '下载失败。',
          unsafeFileTypeUseExtension:
            '安装包、脚本等文件存在未知风险。出于安全原因，网页端暂时无法提供此类文件的下载服务。你仍可以使用浏览器扩展下载。',
          unsafeFileTypeConfirmTitle: '使用浏览器扩展下载',
          unsafeFileTypeConfirmViewExtension: '查看扩展下载',
          unsafeFileTypeConfirmCancel: '取消',
          browserStorageInsufficientUseExtension:
            '当前浏览器没有足够可靠的本地存储来下载这个文件（{file_size}）。可用空间约为 {available_space}。建议安装 TG Downloader 插件后继续下载。',
          browserStorageInsufficientConfirmTitle: '浏览器存储空间不足',
          browserStorageInsufficientConfirmViewExtension: '查看插件下载',
          browserStorageInsufficientConfirmCancel: '取消',
          downloadNetworkInterrupted: '网络异常，下载已暂停。请点击继续。',
          unsupportedDownloadMode: '暂不支持这种下载方式，请稍后重试。',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: '暂不支持这个链接平台。',
          tiktokUnsupported: '暂时无法解析这个 TikTok 链接，请使用公开单视频或图集帖子链接。',
          vimeoParseFailed: '这个 Vimeo 视频为私有内容或暂时无法解析。',
          xParseFailed: '此 X 链接暂不支持，请换一个公开视频状态。',
          instagramParseFailed: '此 Instagram 链接暂不支持，请换一个公开帖子。',
          instagramImageParseFailed: '此 Instagram 链接暂不支持，请换一个公开图片帖子。',
          threadsParseFailed: '此 Threads 链接暂不支持，请换一个公开帖子。',
          redditParseFailed: 'Reddit 媒体抓取失败，请换一个公开视频、图片或相册帖子。',
          douyinParseFailed: '无法获取 Douyin 视频，请确认链接为公开视频。',
          quotaExceeded: '积分不足，无法下载这个文件。',
          rateLimitExceeded: '请求过于频繁，请稍后再试。'
        },
        downloadAll: {
          allSuccess: '全部文件已下载。',
          partialFailed: '部分文件已下载，部分文件失败。',
          allFailed: '全部下载失败。'
        },
        requiresClient: {
          privateChannel:
            '网页端无法解析 Telegram 私人频道内容。免费的浏览器扩展可以下载你在 Telegram Web 中有权访问的任意私人频道视频。\n你可以尝试：\n方式一（推荐）：点击「免费下载扩展」按钮，安装桌面浏览器扩展。\n方式二：\n1. 回到 Telegram。\n2. 右击你要下载的消息，选择 Forward 转发到一个公开频道或群组。\n3. 进入这个公开频道或群组。\n4. 右键复制公开频道或群组里的这条消息链接，再粘贴到这里解析。',
          privateChannelCta: '免费下载扩展',
          restrictedFile: '这个受限文件需要在 Telegram Web 中使用 TG Downloader 处理。',
          floodWait:
            '网站端 Telegram 账号正在冷却。请安装 TG Downloader 插件，在 Telegram Web 中用你的浏览器会话继续下载。'
        }
      },
      crossLinks: {
        title: '更多视频下载工具',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: '无水印高清下载 TikTok 视频。'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: '高清下载 X/Twitter 视频和 GIF。'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: '高清下载 Vimeo 视频，支持多种分辨率选择。'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: '高清下载 Instagram 照片、Reels 和相册。'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: '原画质下载 Threads 视频和照片。'
          }
        ]
      }
    },
    changelog: {
      title: 'Telegram 视频下载更新日志',
      description: '持续跟踪 Telegram 视频下载、网页流程和更长保存任务的最新变化。',
      seoTitle: 'Telegram 视频下载更新日志 | TG Downloader',
      seoDescription:
        '查看这份 Telegram 视频下载更新日志，了解网页流程、大文件支持和最新版本变化。',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: '性能提升',
          description: '重大性能改进，提供更好的用户体验。',
          features: ['资源检测速度提升 50%', '优化大文件下载稳定性', '增强界面响应速度']
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '多语言支持',
          description: '新增全球 14 种语言支持。',
          features: ['新增日语、韩语等多种语言支持', '改进翻译准确性', '新增语言自动检测']
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: '侧边栏下载',
          description: '新增侧边栏下载功能，支持批量下载。',
          features: ['新增侧边栏单文件下载', '新增批量下载功能', '改进下载队列管理']
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: '安全与隐私',
          description: '安全改进和隐私增强。',
          features: ['移除所有分析追踪', '新增纯本地处理模式', '改进数据加密']
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '初始版本',
          description: '首个版本，支持聊天窗口下载。',
          features: ['聊天窗口下载功能', '支持 Telegram Web K 和 A 版本', '基础媒体格式支持']
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
    pricing: zhCNPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['zh-CN'],
    extensionLoginV2: {
      title: '扩展登录 | TG Downloader',
      description: '登录 TG Downloader，将您的网站会话同步到浏览器扩展。',
      eyebrow: '浏览器扩展',
      heading: '登录 TG Downloader',
      checkingState: '正在检查会话',
      signInRequiredState: '需要登录',
      syncedState: '已登录',
      verificationFailedState: '验证失败',
      preparingTitle: '正在准备登录…',
      preparingText: 'TG Downloader 正在准备网站会话检查。',
      checkingSessionTitle: '正在检查网站会话…',
      checkingSessionText: 'TG Downloader 正在验证此浏览器中存储的网站令牌。',
      finishingGoogleTitle: '正在完成 Google 登录…',
      finishingGoogleText: 'TG Downloader 正在将 Google 登录结果兑换为网站会话。',
      signInRequiredTitle: '登录以继续',
      signInRequiredText: '请使用与网站相同的 TG Downloader 登录窗口。',
      signInButtonLabel: '登录',
      syncingTitle: '正在同步扩展令牌…',
      syncingText: 'TG Downloader 正在将您的网站会话兑换为扩展令牌。',
      syncedTitle: '登录成功',
      syncedText: '扩展已连接到您的 TG Downloader 账号。点击「返回 Telegram」即可返回。',
      returnButtonLabel: '返回 Telegram',
      returningButtonLabel: '返回中…',
      verificationFailedTitle: '无法完成扩展登录',
      retryButtonLabel: '重试',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok 视频下载器 无水印高清下载 | TG Downloader',
          description:
            '免费无水印高清下载 TikTok 视频。无需安装应用，即时保存 TikTok 视频、图集和快拍。',
          keywords:
            'TikTok下载, TikTok视频下载, 抖音国际版下载, TikTok无水印下载, TikTok高清下载, TikTok视频保存, 免费TikTok下载器'
        },
        workspace: {
          title: 'TikTok 无水印视频下载',
          helperText:
            '粘贴任意 TikTok 视频链接，即可无水印高清下载。同时支持 Telegram、X 和 Vimeo 链接。',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: '为什么选择我们的 TikTok 下载器',
          subtitle: '无水印、最高画质保存 TikTok 视频，完全免费。',
          items: [
            {
              title: '无水印',
              description:
                '下载的 TikTok 视频不含水印。获取干净的原始画质视频，随时保存或分享。'
            },
            {
              title: 'HD 高清画质',
              description:
                '以原始 HD 分辨率保存 TikTok 视频。无画质损失、无压缩，与创作者上传时完全一致。'
            },
            {
              title: '快速且免费',
              description:
                '无需安装应用、无需注册、没有隐藏费用。粘贴链接即可获取视频，任何浏览器都能使用。'
            }
          ]
        },
        howTo: {
          title: '如何无水印下载 TikTok 视频',
          subtitle:
            '只需三步，即可无水印高清保存任意 TikTok 视频。',
          steps: [
            {
              title: '复制 TikTok 视频链接',
              description:
                '打开 TikTok，点击视频上的分享按钮，选择"复制链接"。'
            },
            {
              title: '粘贴链接',
              description:
                '将复制的 TikTok URL 粘贴到上方输入框，点击"解析"。'
            },
            {
              title: '无水印下载',
              description:
                '点击"下载"按钮，即可保存无水印的 HD 高清 TikTok 视频。'
            }
          ]
        },
        faq: {
          title: 'TikTok 下载器常见问题',
          items: [
            {
              question: '这个 TikTok 下载器真的免费吗？',
              answer:
                '是的，完全免费，没有隐藏收费。你可以零成本无水印下载 TikTok 视频。'
            },
            {
              question: '下载的视频会有水印吗？',
              answer:
                '不会。我们的下载器会去除 TikTok 水印，提供原始干净的 HD 高清视频。'
            },
            {
              question: '下载的 TikTok 视频是什么画质？',
              answer:
                '视频以创作者上传时的原始 HD 分辨率保存，没有画质损失。'
            },
            {
              question: '需要安装应用或扩展程序吗？',
              answer:
                '不需要。这是一个网页工具，直接在任何设备的浏览器中即可使用。'
            },
            {
              question: '可以下载 TikTok 快拍和图集吗？',
              answer:
                '可以，我们的下载器支持 TikTok 视频、图集和快拍。粘贴链接即可下载。'
            }
          ]
        },
        crossLinks: {
          title: '更多视频下载工具',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高清下载 X/Twitter 视频和 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下载 Vimeo 视频，支持多种分辨率选择。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下载 Instagram 照片、Reels 和相册。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原画质下载 Threads 视频和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高清下载 Telegram 频道和群组中的视频。'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) 视频下载器 - 高清保存视频和 GIF | TG Downloader',
          description:
            '免费高清下载 X (Twitter) 视频和 GIF。无需安装应用，即时保存任何公开推文的视频或 GIF。',
          keywords:
            'X下载器, Twitter视频下载, 推特视频下载, X视频下载, Twitter GIF下载, 保存推特视频, 免费Twitter下载器'
        },
        workspace: {
          title: 'X (Twitter) 视频下载器',
          helperText:
            '粘贴任意 X 或 Twitter 视频链接，以最高画质下载。同时支持 Telegram、TikTok 和 Vimeo 链接。',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: '为什么选择我们的 X 视频下载器',
          subtitle: '以原始画质保存 X/Twitter 视频和 GIF，完全免费。',
          items: [
            {
              title: '视频和 GIF',
              description:
                '下载 X (Twitter) 上的视频帖子和动态 GIF。获取与推文中完全一致的媒体内容。'
            },
            {
              title: '原始 HD 画质',
              description:
                '以最高可用分辨率保存 X 视频。无画质损失，与源文件相同的码率。'
            },
            {
              title: '快速且免费',
              description:
                '无需安装应用、无需登录。粘贴推文链接，几秒内即可下载视频或 GIF。'
            }
          ]
        },
        howTo: {
          title: '如何下载 X (Twitter) 视频',
          subtitle:
            '只需三步，即可保存 X/Twitter 上的任意视频或 GIF。',
          steps: [
            {
              title: '复制推文链接',
              description:
                '在 X (Twitter) 上，点击推文的分享图标，选择"复制链接"。'
            },
            {
              title: '粘贴链接',
              description:
                '将复制的 X/Twitter URL 粘贴到上方输入框，点击"解析"。'
            },
            {
              title: '下载视频或 GIF',
              description:
                '点击"下载"，将视频或 GIF 以 HD 画质保存到设备。'
            }
          ]
        },
        faq: {
          title: 'X 视频下载器常见问题',
          items: [
            {
              question: '如何从 X (Twitter) 下载视频？',
              answer:
                '复制包含视频的推文链接，粘贴到上方输入框，点击"解析"，然后点击"下载"即可保存视频。'
            },
            {
              question: '可以下载 X 上的 GIF 吗？',
              answer:
                '可以。我们的下载器支持 X/Twitter 帖子中的视频和动态 GIF。GIF 以 MP4 格式保存，兼容性最佳。'
            },
            {
              question: '可以下载什么画质的视频？',
              answer:
                '我们提供每条推文的最高可用画质，通常是发布者上传时的原始 HD 分辨率。'
            },
            {
              question: '这个 X 下载器免费吗？',
              answer:
                '是的，完全免费，无需注册。零成本下载 X 视频和 GIF。'
            },
            {
              question: '下载需要 X/Twitter 账号吗？',
              answer:
                '不需要。只要推文是公开的，无需登录即可下载其中的视频或 GIF。'
            }
          ]
        },
        crossLinks: {
          title: '更多视频下载工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '无水印高清下载 TikTok 视频。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下载 Vimeo 视频，支持多种分辨率选择。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下载 Instagram 照片、Reels 和相册。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原画质下载 Threads 视频和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高清下载 Telegram 频道和群组中的视频。'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo 视频下载器 HD - 多分辨率选择 | TG Downloader',
          description:
            '免费高清下载 Vimeo 视频，支持多种分辨率选择。无需安装应用，即时保存任何公开 Vimeo 视频。',
          keywords:
            'Vimeo下载, Vimeo视频下载, Vimeo高清下载, 免费Vimeo下载器, 保存Vimeo视频, Vimeo下载器'
        },
        workspace: {
          title: 'Vimeo 高清视频下载',
          helperText:
            '粘贴任意 Vimeo 视频链接，选择分辨率后高清下载。同时支持 Telegram、TikTok 和 X 链接。',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: '为什么选择我们的 Vimeo 下载器',
          subtitle: '自选分辨率，高清保存 Vimeo 视频，完全免费。',
          items: [
            {
              title: 'HD 原始画质',
              description:
                '以完整 HD 分辨率下载 Vimeo 视频。获取与创作者上传时一致的清晰画质。'
            },
            {
              title: '多种分辨率',
              description:
                '从可用分辨率中自由选择（360p、720p、1080p 等）。按需选择最合适的画质。'
            },
            {
              title: '快速且免费',
              description:
                '无需安装应用、无需账号。粘贴 Vimeo 链接，选择分辨率，即时下载。'
            }
          ]
        },
        howTo: {
          title: '如何高清下载 Vimeo 视频',
          subtitle:
            '只需三步，即可以你偏好的分辨率保存任意 Vimeo 视频。',
          steps: [
            {
              title: '复制 Vimeo 视频链接',
              description:
                '打开 Vimeo 视频页面，从浏览器地址栏复制 URL。'
            },
            {
              title: '粘贴链接',
              description:
                '将复制的 Vimeo URL 粘贴到上方输入框，点击"解析"。'
            },
            {
              title: '选择分辨率并下载',
              description:
                '选择你想要的视频分辨率，点击"下载"保存高清视频。'
            }
          ]
        },
        faq: {
          title: 'Vimeo 下载器常见问题',
          items: [
            {
              question: '如何从 Vimeo 下载视频？',
              answer:
                '复制 Vimeo 视频页面的 URL，粘贴到上方输入框，点击"解析"，然后选择分辨率并下载。'
            },
            {
              question: '可以选择视频分辨率吗？',
              answer:
                '可以。解析后你可以从所有可用分辨率中选择，包括 360p、720p、1080p 及更高（如有）。'
            },
            {
              question: '这个 Vimeo 下载器免费吗？',
              answer:
                '是的，完全免费。无需付费或注册即可高清下载 Vimeo 视频。'
            },
            {
              question: '下载需要 Vimeo 账号吗？',
              answer:
                '不需要。任何公开的 Vimeo 视频都可以无需登录直接下载。'
            },
            {
              question: '下载的视频是什么格式？',
              answer:
                'Vimeo 视频以 MP4 格式下载，兼容几乎所有设备和播放器。'
            }
          ]
        },
        crossLinks: {
          title: '更多视频下载工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '无水印高清下载 TikTok 视频。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高清下载 X/Twitter 视频和 GIF。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下载 Instagram 照片、Reels 和相册。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原画质下载 Threads 视频和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高清下载 Telegram 频道和群组中的视频。'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram 照片和视频下载器 - 高清画质 | TG Downloader',
          description:
            '免费高清下载 Instagram 照片、Reels 和相册。无需安装应用，即时保存 Instagram 媒体内容。',
          keywords:
            'Instagram下载, Instagram照片下载, Instagram Reels下载, Instagram相册下载, 保存Instagram视频, 免费Instagram下载器'
        },
        workspace: {
          title: 'Instagram 照片和视频下载',
          helperText:
            '粘贴任意 Instagram 帖子链接，即可高清下载照片、Reels 和相册。同时支持 Telegram、TikTok 和 X 链接。',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: '为什么选择我们的 Instagram 下载器',
          subtitle: '原始高清画质保存 Instagram 照片、Reels 和相册，完全免费。',
          items: [
            {
              title: '照片和 Reels',
              description:
                '下载 Instagram 照片和 Reels 视频，保持原始画质。获取与创作者发布时完全一致的媒体内容。'
            },
            {
              title: '相册批量下载',
              description:
                '一次下载 Instagram 相册帖子中的所有图片和视频，无需逐个保存。'
            },
            {
              title: 'HD 原始画质',
              description:
                '以最高可用分辨率保存 Instagram 媒体。无压缩、无画质损失，与上传时完全一致。'
            }
          ]
        },
        howTo: {
          title: '如何下载 Instagram 照片和视频',
          subtitle:
            '只需三步，即可高清保存任意 Instagram 帖子内容。',
          steps: [
            {
              title: '复制 Instagram 帖子链接',
              description:
                '打开 Instagram，点击帖子右上角的三个点，选择"复制链接"。'
            },
            {
              title: '粘贴链接',
              description:
                '将复制的 Instagram URL 粘贴到上方输入框，点击"解析"。'
            },
            {
              title: '高清下载',
              description:
                '点击"下载"按钮，保存照片、Reels 或相册内容，画质与原始一致。'
            }
          ]
        },
        faq: {
          title: 'Instagram 下载器常见问题',
          items: [
            {
              question: '这个 Instagram 下载器真的免费吗？',
              answer:
                '是的，完全免费，没有隐藏收费。你可以零成本下载 Instagram 照片、Reels 和相册。'
            },
            {
              question: '支持哪些格式？',
              answer:
                '我们支持下载 Instagram 照片（JPG）、Reels 视频（MP4）以及包含所有媒体的完整相册。'
            },
            {
              question: '下载的文件是什么画质？',
              answer:
                '所有媒体以创作者上传时的原始 HD 分辨率保存，无画质损失或压缩。'
            },
            {
              question: '下载需要 Instagram 账号吗？',
              answer:
                '不需要。只要帖子是公开的，无需登录即可下载其中的媒体内容。'
            },
            {
              question: '可以下载 Instagram 快拍吗？',
              answer:
                '目前支持帖子、Reels 和相册。快拍下载需要内容可通过直接链接公开访问。'
            }
          ]
        },
        crossLinks: {
          title: '更多视频下载工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '无水印高清下载 TikTok 视频。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高清下载 X/Twitter 视频和 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下载 Vimeo 视频，支持多种分辨率选择。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: '原画质下载 Threads 视频和照片。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高清下载 Telegram 频道和群组中的视频。'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads 视频和照片下载器 - 原始画质 | TG Downloader',
          description:
            '免费原画质下载 Threads 视频和照片。无需安装应用，即时保存 Threads 媒体内容，包括轮播帖子。',
          keywords:
            'Threads下载, Threads视频下载, 下载Threads视频, Threads媒体下载, 保存Threads视频, 免费Threads下载器'
        },
        workspace: {
          title: 'Threads 视频和照片下载',
          helperText:
            '粘贴任意 Threads 帖子链接，即可原画质下载视频和照片。同时支持 Telegram、TikTok 和 Instagram 链接。',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: '为什么选择我们的 Threads 下载器',
          subtitle: '原画质保存 Threads 视频和照片，完全免费。',
          items: [
            {
              title: '混合媒体',
              description:
                '下载 Threads 帖子中的视频和照片。支持包含多种内容类型的混合媒体帖子。'
            },
            {
              title: '原始画质',
              description:
                '以最高可用分辨率保存 Threads 媒体。无压缩、无画质损失，与发布时完全一致。'
            },
            {
              title: '轮播支持',
              description:
                '一次下载 Threads 轮播帖子中的所有媒体。单次操作获取每张照片和视频。'
            }
          ]
        },
        howTo: {
          title: '如何下载 Threads 视频和照片',
          subtitle:
            '只需三步，即可原画质保存任意 Threads 帖子内容。',
          steps: [
            {
              title: '复制 Threads 帖子链接',
              description:
                '打开 Threads，点击帖子的分享图标，选择"复制链接"。'
            },
            {
              title: '粘贴链接',
              description:
                '将复制的 Threads URL 粘贴到上方输入框，点击"解析"。'
            },
            {
              title: '下载媒体',
              description:
                '点击"下载"按钮，原画质保存视频和照片。'
            }
          ]
        },
        faq: {
          title: 'Threads 下载器常见问题',
          items: [
            {
              question: '这个 Threads 下载器真的免费吗？',
              answer:
                '是的，完全免费，没有隐藏收费。你可以零成本下载 Threads 视频和照片。'
            },
            {
              question: '支持哪些媒体类型？',
              answer:
                '我们支持下载 Threads 上的视频、照片和混合媒体帖子，包括包含多个项目的轮播帖子。'
            },
            {
              question: '下载的文件是什么画质？',
              answer:
                '所有媒体以创作者发布时的原始分辨率保存，无画质损失。'
            },
            {
              question: '下载需要 Threads 账号吗？',
              answer:
                '不需要。只要帖子是公开的，无需登录即可下载其中的媒体内容。'
            },
            {
              question: '可以下载包含多张照片的轮播帖子吗？',
              answer:
                '可以，我们的下载器完全支持 Threads 轮播帖子。轮播中的所有照片和视频都可下载。'
            }
          ]
        },
        crossLinks: {
          title: '更多视频下载工具',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '无水印高清下载 TikTok 视频。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: '高清下载 X/Twitter 视频和 GIF。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '高清下载 Vimeo 视频，支持多种分辨率选择。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: '高清下载 Instagram 照片、Reels 和相册。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: '高清下载 Telegram 频道和群组中的视频。'
            }
          ]
        }
      }
    }
  }
}
