import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { pricingContent } from '../pricing'

export const enUS: SiteContent = {
  site: {
    name: 'Telegram Video Download | TG Downloader',
    description:
      'Use TG Downloader for Telegram video download from public links, restricted posts, and private channels. Start on the web, then continue in Telegram Web for larger saves.',
    keywords:
      'telegram video download, telegram media download, telegram video save, telegram file download, telegram private channel'
  },
  layout: {
    nav: {
      brand: 'TG Downloader',
      home: 'Home',
      pricing: 'Pricing',
      solutions: 'Solution',
      changelog: 'Changelog'
    },
    footer: {
      resources: 'Resources',
      rights: '© 2026 TG Downloader. All rights reserved.'
    }
  },
  common: {
    installCta: 'Install Now'
  },
  sections: {
    features: {
      title: 'Telegram Media Download Features',
      subtitle:
        'Use TG Downloader for telegram media download across private channels, restricted posts, 1GB+ files, batch albums, and faster Telegram Web workflows.',
      metaDescription:
        'TG Downloader features: multi-file batch saves, private channel support, 1GB+ large file downloads, real-time media detection, and privacy-first design with no login required.',
      items: [
        {
          title: 'Batch Download',
          description:
            'Queue and download multiple Telegram videos, files, and albums from a channel or group in one run',
          details: [
            'Multi-select videos, files, and images in one panel',
            'Queue entire channel or group batches without manual repetition',
            'Filter downloads by media type before saving',
            'Keep filenames and progress visible while the queue runs'
          ]
        },
        {
          title: 'Restricted Content',
          description:
            'Save media from private channels or download-disabled posts after they load in Telegram Web',
          details: [
            'Works in private channels you can already access',
            'Handles posts where the native Telegram save button is disabled',
            'Supports Telegram Web A and Web K',
            'Built for videos, files, albums, and forwarded posts'
          ]
        },
        {
          title: 'Multi-Format Support',
          description: 'Use one Telegram file downloader for videos, images, audio, documents, and mixed media posts',
          details: [
            'Images: JPG, PNG, WEBP, GIF',
            'Videos: MP4, WEBM, MOV, and original Telegram files',
            'Audio files: MP3, M4A, OGG',
            'Documents and other Telegram file attachments'
          ]
        },
        {
          title: 'Safe & Secure',
          description: 'Runs locally in your browser without asking for your Telegram password or API credentials',
          details: [
            'No Telegram password required',
            'No API key or bot login required',
            'No user media uploaded to our servers',
            'Minimal permissions on Telegram Web only'
          ]
        },
        {
          title: 'Large File Support',
          description: 'Download 1GB+ Telegram files with progress visibility and a resume-friendly flow',
          details: [
            'Built for large Telegram videos and documents',
            'Resume support for interrupted downloads',
            'Stable transfers for long-running downloads',
            'Progress tracking from start to finish'
          ]
        },
        {
          title: 'Real-time Detection',
          description:
            'Continuously scans Telegram Web so new media becomes downloadable as soon as it loads',
          details: [
            'Auto-scan the current Telegram Web view',
            'Detect opened media viewer resources in real time',
            'Refresh the download list as you move through messages',
            'Reduce repeated manual copy-and-save work'
          ]
        }
      ]
    },
    steps: {
      title: 'Telegram Video Save Guide',
      subtitle:
        'Follow this telegram video save workflow in Telegram Web to load the target message, detect the media, and save videos, files, or albums with TG Downloader.',
      metaDescription:
        'Step-by-step guide to saving Telegram videos, files, and albums with TG Downloader. Learn to install the extension, detect media in Telegram Web, and batch-download content.',
      items: [
        {
          title: 'Install TG Downloader',
          description: 'Add the Telegram media downloader extension to your Chromium-based browser'
        },
        {
          title: 'Open Telegram Web and the private channel',
          description:
            'Log in to Telegram Web, then navigate to the private channel, group, or post you want to save from'
        },
        {
          title: 'Load the target media',
          description:
            'Scroll until the target videos, files, or albums are visible so the extension can detect them'
        },
        {
          title: 'Download one file or queue a batch',
          description:
            'Open TG Downloader, select the media you need, and save a single item or an entire batch locally'
        }
      ]
    },
    cta: {
      title: 'Ready to Get Started?',
      description: 'Install the extension and start downloading media from Telegram now.'
    },
    techSpecs: {
      title: 'Technical Specifications',
      browsersLabel: 'Browsers',
      browsers: 'Chrome, Edge, Brave, and all Chromium-based browsers',
      telegramVersionsLabel: 'Telegram Versions',
      telegramVersions: 'Web K version and A version',
      permissionsLabel: 'Permissions',
      permissions: 'Minimal permissions required',
      updatesLabel: 'Updates',
      updates: 'Automatic updates from extension store'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Telegram video download for links, files, and private channels',
        description:
          'Start a telegram video download from a direct link on the web, then continue in TG Downloader when you need files, albums, or private-channel saves.'
      },
      stats: {
        users: 'Users Worldwide',
        downloads: 'Total Downloads'
      },
      seo: {
        title: 'Telegram Private Video Downloader: Download Any Private Media',
        description:
          'Save Telegram private channel videos with an easy downloader guide. Download accessible videos and media, troubleshoot failed downloads, and find the right method for your device.',
        keywords:
          'telegram private video downloader, telegram private channel video downloader, download private telegram video, telegram private media downloader'
      },
      heroTrustPoints: [
        'HD video download',
        'No registration',
        'Mobile friendly',
        'Works on Windows, Mac, Android, and iPhone'
      ],
      situation: {
        title: 'Start Here: Which Situation Matches Yours?',
        intro:
          'Most users searching for a Telegram private video downloader are trying to solve one of these problems:',
        headers: ['Your situation', 'Try this first'],
        rows: [
          {
            cells: [
              'You have a Telegram video link from a channel or chat',
              'Paste the link into an online Telegram video downloader'
            ]
          },
          {
            cells: [
              'You can watch the video in a private channel but cannot save it',
              "Try Telegram Desktop's Save Video As option"
            ]
          },
          {
            cells: [
              'The video plays, but downloading and forwarding are blocked',
              'Use screen recording only if you have permission to keep a copy'
            ]
          },
          {
            cells: [
              'The downloader says no video found',
              'Check access, link type, channel restrictions, and whether the video opens outside Telegram'
            ]
          }
        ]
      },
      solutions: {
        title: 'What Works for Private Telegram Videos?',
        intro:
          'A private Telegram video usually means a video shared in a private channel, private group, or direct chat. These videos are visible only to approved members, so downloading them is different from saving media from a public channel.',
        quickAnswer:
          'Quick answer: If the link is accessible, use an online Telegram private video downloader. If the video is visible only inside Telegram, try Telegram Desktop. If saving is blocked but you are allowed to keep the content, screen recording may be the practical fallback.',
        items: [
          {
            title: 'Solution 1: Online Telegram Video Downloader',
            description:
              'Best for accessible Telegram links. This is the simplest method for users who want to download Telegram videos online without installing an app, extension, or bot.',
            useWhenLabel: 'Use this method when:',
            useWhen: [
              'The Telegram video link is public or accessible.',
              'You want to download Telegram videos online.',
              'You need a quick HD video file.',
              'You do not want to install a browser extension or desktop app.'
            ]
          },
          {
            title: 'Solution 2: Telegram Desktop Save Video As',
            description:
              'When the video is available in Telegram Desktop and downloads are allowed, right-click the video and save it to a folder on your computer. This often works better for private-channel members because you are already authenticated inside Telegram.',
            useWhenLabel: 'Use this method when:',
            useWhen: [
              'You can view the video in Telegram Desktop.',
              'The channel owner has not disabled saving.',
              'You prefer downloading directly to Windows or Mac.'
            ]
          },
          {
            title: 'Solution 3: Mobile or Desktop Screen Recording',
            description:
              'If the download option is disabled but you are permitted to view and keep the content, a screen recorder can capture the video and audio while it plays. This is a fallback, not the first method, because it takes longer and depends on playback quality.',
            useWhenLabel: 'Use this method when:',
            useWhen: [
              'You have permission to view and keep the video.',
              'The Telegram link cannot be parsed by a downloader.',
              'You need a personal offline copy for reference.'
            ]
          },
          {
            title: 'Solution 4: Android File Manager Check',
            description:
              'In some Android cases, Telegram may temporarily store loaded media in local app folders. A file manager can sometimes help you find videos that have already been loaded on the device, but this depends on app version, storage permissions, and cache behavior.',
            useWhenLabel: 'Use this method when:',
            useWhen: [
              'You already played the video in Telegram on Android.',
              'You understand app storage permissions.',
              'You only need to recover a file already cached on your device.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Why Use an Online Telegram Video Downloader?',
        intro:
          'A good downloader should help you answer one question quickly: can this Telegram video be saved from the link I have? The best experience is direct, clear, and honest when a private link cannot be processed.',
        items: [
          {
            title: 'Save Videos in High Quality',
            description:
              'Keep Telegram videos in the best available quality for offline playback, study, training, archiving, or personal reference.'
          },
          {
            title: 'Works Across Devices',
            description:
              'Use the downloader from a browser on Android, iPhone, Windows, Mac, or tablet. This matters when the video is on your phone but you want to save it to another device.'
          },
          {
            title: 'No Telegram Login Required',
            description:
              'Choose tools that process a video link without asking for your Telegram password, verification code, session file, or private account credentials.'
          },
          {
            title: 'Easy Offline Playback',
            description:
              'Download files in common video formats when available, so you can watch later without opening Telegram or using mobile data.'
          },
          {
            title: 'Fast Link-Based Process',
            description:
              'Copy, paste, analyze, and download. If the link fails, the page should explain why and tell you what to try next.'
          },
          {
            title: 'Clear Permission Boundary',
            description:
              "Download only videos you have the right to access and save. Respect channel rules, creator rights, and Telegram's policies."
          },
          {
            title: 'Telegram File Downloader for Videos, Photos, Audio, and Documents',
            description:
              'Paste an accessible Telegram link to download supported videos, photos, audio, and documents, with separate downloads when a post contains multiple attachments.'
          },
          {
            title: 'Telegram Story Downloader for Photos and Videos',
            description:
              'Paste an accessible Telegram Story link to save its photo or video. If a private Story is only visible in Telegram Web, open it there and use the extension.'
          },
          {
            title: 'Telegram Video Player Online',
            description:
              'Paste an accessible Telegram video link to preview and play the video online before downloading it.'
          }
        ]
      },
      troubleshooting: {
        title: 'If the Telegram Video Link Does Not Work',
        intro:
          'Not every failed link means the downloader is broken. Private Telegram videos often fail because the file is not available outside Telegram. Try this checklist:',
        items: [
          'Open the link in a browser and confirm it loads.',
          'Make sure you are still a member of the private channel or group.',
          'Check whether the channel owner has disabled saving, copying, or forwarding.',
          'Try Telegram Desktop if the video plays only inside the app.',
          'Use a different browser or network if the page cannot reach Telegram.',
          'Avoid any tool that asks for your Telegram login code.'
        ]
      },
      permission: {
        title: 'Important Permission Note',
        note:
          "A Telegram private video downloader should not be used to bypass privacy, copyright, or access restrictions. Save videos only when you have permission from the owner or when your use is allowed by law and Telegram's terms."
      },
      comparison: {
        title: 'Choose the Right Telegram Download Method',
        headers: ['Situation', 'Recommended Solution', 'Best For', 'What to Check'],
        rows: [
          {
            cells: [
              'Public or accessible Telegram video link',
              'Online Telegram video downloader',
              'Fast HD download without an app',
              'The link opens and the video can be reached by the tool'
            ]
          },
          {
            cells: [
              'Private channel video with download allowed',
              'Telegram Desktop Save Video As',
              'Saving directly to a computer',
              'You are a member and the owner has not disabled saving'
            ]
          },
          {
            cells: [
              'Restricted saving but visible playback',
              'Built-in or third-party screen recorder',
              'Personal offline reference with permission',
              'Audio capture, screen area, and local laws or platform rules'
            ]
          },
          {
            cells: [
              'Android cached media',
              'File manager check',
              'Finding media already loaded on the device',
              'App storage access and whether Telegram keeps a local cache'
            ]
          }
        ]
      },
      howTo: {
        title: 'How to Download Telegram Videos in 3 Steps',
        subtitle:
          'The fastest route is a link-based Telegram video downloader. It works best when the Telegram video link is public, accessible, or readable outside the Telegram app.',
        steps: [
          {
            title: 'Copy the Video Link',
            description:
              'Open Telegram, find the video you want to save, and copy the message link or video link from the share menu. If the channel does not allow copying links, move to the private-channel solutions below.'
          },
          {
            title: 'Paste and Analyze',
            description:
              'Paste the Telegram link into the downloader field. The tool checks whether a downloadable video file can be reached from that link.'
          },
          {
            title: 'Download in HD',
            description:
              'Choose the available quality or format, then save the Telegram video directly to your phone, tablet, or computer. If no file appears, the link is probably restricted rather than broken.'
          }
        ]
      },
      faq: {
        title: 'Frequently Asked Questions',
        description: 'The questions people ask before a telegram video download or telegram file download in Telegram Web.',
        items: [
          {
            question: 'Can I download private Telegram videos?',
            answer:
              'You can only download or save private Telegram videos when you have permission to access them and the video source is available. Some private channels block saving, forwarding, copying links, or external access.'
          },
          {
            question: 'How do I download Telegram private channel videos?',
            answer:
              'Try the link-based downloader first if you have a usable Telegram video link. If that does not work, check Telegram Desktop for a Save Video As option. If downloads are blocked but you are allowed to keep the content, screen recording may be the fallback.'
          },
          {
            question: 'Why does the Telegram video downloader say no video found?',
            answer:
              'The link may be restricted, deleted, expired, visible only inside Telegram, or blocked by the channel owner. Open the link yourself first and confirm the video still plays. If it works only after you log in to Telegram, an online downloader may not be able to access it.'
          },
          {
            question: 'Do I need to install software?',
            answer:
              'No for accessible links. An online Telegram video downloader works in a browser. You may need Telegram Desktop, a file manager, or a screen recorder for specific private or restricted cases.'
          },
          {
            question: 'Can I download Telegram videos without a link?',
            answer:
              'Usually no. Online downloaders need a Telegram video link to locate the file. If you cannot copy a link but can watch the video in Telegram, use Telegram Desktop or another permitted local method.'
          },
          {
            question: 'Is it safe to enter my Telegram login code into a downloader?',
            answer:
              'No. A downloader should not need your Telegram password, verification code, or session credentials. If a site asks for them, leave the page.'
          },
          {
            question: 'Is a Telegram Media downloader free?',
            answer:
              'Many link-based Telegram media downloaders are free for basic downloads. Avoid tools that force suspicious installs, login requests, or misleading buttons.'
          },
          {
            question: 'Is it legal to download Telegram videos?',
            answer:
              'It depends on the content, your permission, and your intended use. Do not download or redistribute copyrighted, private, or restricted content without authorization.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Website Access',
          title: 'Sign in to sync your Credits',
          trigger: 'Sign in',
          modalTitle: 'Sign in to continue',
          closeLabel: 'Close',
          signedInAs: 'Signed in as',
          continueWithGoogle: 'Continue with Google',
          googleLoading: 'Opening Google...',
          or: 'or',
          emailLabel: 'Email',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Continue with email',
          sendCode: 'Send code',
          sendingCode: 'Sending...',
          sendCodeSuccess: 'Verification code sent.',
          sendAgain: 'Send again',
          codeLabel: 'Verification code',
          codePlaceholder: '123456',
          signIn: 'Sign in',
          termsNotice: 'By signing in, you agree to the',
          termsLink: 'Terms',
          privacyLink: 'Privacy Policy',
          logout: 'Log out',
          creditsLabel: 'Credits'
        },
        quota: {
          eyebrow: 'Credits',
          title: 'Current Credits balance',
          planLabel: 'Plan',
          remainingLabel: 'Remaining',
          dailyLimitLabel: 'Daily limit',
          unlimited: 'Unlimited'
        },
        checkin: {
          creditsLoading: 'Credits',
          creditsButtonLabel: 'Open daily check-in',
          accountButtonLabel: 'Open account menu',
          accountMenuLabel: 'Account menu',
          title: 'Your Daily Free Credits Are Ready!',
          todayRewardText: "Today's reward: {credits} Credits",
          claimedRewardText: 'You claimed {credits} Credits today.',
          nextCountdown: 'Next claim in {time}',
          nextAt: '(Next refresh: {time} EST)',
          claimButton: 'Claim {credits} Credits',
          claimingButton: 'Claiming...',
          notNow: 'Not now',
          close: 'Close',
          loadFailed: 'Failed to load check-in status.',
          claimFailed: 'Failed to claim Credits.'
        },
        creditPurchase: {
          title: 'Get more Credits',
          description: 'Add Credits and continue downloading from this workspace.',
          successTitle: 'Credits added',
          successDescription: 'Your balance has been refreshed. Close this window and start the download again.',
          packageEyebrow: 'Pay as you go',
          cardNote: 'Use Credits for website downloads. Credits never expire.',
          creditsAmount: '{credits} Credits',
          buyNow: 'Buy Now',
          selectPackage: 'Select',
          paymentMethodLabel: 'Choose payment method',
          paymentTitle: 'Choose payment method',
          selectedPackageLabel: 'Selected package',
          confirmPurchase: 'Continue to payment',
          backToProducts: 'Back',
          close: 'Close',
          agreementText: 'I agree to the purchase terms, Terms, and Privacy Policy.',
          loadingConfigs: 'Loading Credits packages...',
          loadFailed: 'Failed to load Credits packages. Please try again.',
          noConfigs: 'No Credits packages are available right now. Please try again later.',
          ready: 'Choose a Credits package. Prices are shown in USD.',
          creatingOrder: 'Creating order...',
          pendingPayment: 'Complete payment in the newly opened tab. We will check the result automatically.',
          pendingPaymentTitle: 'Waiting for payment',
          cancelPayment: 'Cancel payment',
          supportMailPrefix: 'Report an issue: ',
          success: 'Payment complete. Credits are available now.',
          failed: 'Payment is not complete. You can retry or close this window.',
          successCredits: '+{credits} Credits added',
          successBalance: 'Current balance: {balance} Credits',
          createFailed: 'Failed to create order. Please try again.',
          invalidPaymentData: 'Payment link is invalid. Please try again later.',
          priceUpdated: 'Price changed. Review the latest price and buy again.',
          gatewayFailed: 'Payment entry is temporarily unavailable. Please try again later.',
          paymentCanceled: 'Payment was canceled. Choose a payment method and try again.',
          pollFailed: 'Failed to refresh payment status. Please try again.',
          pollTimeout: 'Automatic refresh timed out. Use the refresh button after payment.',
          orderNotFound: 'Order is no longer available. Create a new order.',
          orderExpired: 'Order expired. Please buy again.',
          fulfillmentFailed: 'Payment was received but Credits were not added yet. Please retry later.',
          authExpired: 'Sign-in expired. Sign in again to continue.'
        },
        parse: {
          eyebrow: 'Quick link check',
          title: 'Telegram Private Video Downloader: Download Any Private Media',
          helperText:
            'Save Telegram private channel videos with an easy downloader guide. Download accessible videos and media, troubleshoot failed downloads, and find the right method for your device.',
          failureTitle: 'Continue this telegram video download in TG Downloader',
          failureDescription:
            'Open the message in Telegram Web and keep the telegram video download moving with TG Downloader for files, albums, or private-channel saves.',
          privateChannelDescription:
            'This is a telegram private channel link. Open the message in Telegram Web and continue the save flow in TG Downloader once the content is visible.',
          failureCta: 'Install TG Downloader',
          unsupportedLinkError: 'Only Telegram message links are supported.',
          telegramInviteLinkError:
            'This is a Telegram invite link, not a message link. Join or open the chat first, then copy the exact message link.',
          telegramMessageListLinkError:
            'This Telegram link opens a chat or channel, not a specific message. Copy the exact message link, then paste it here.',
          telegramWebLinkError:
            'This is a Telegram Web page link. Install TG Downloader, open this link in Telegram Web, then use the extension to download the visible media.',
          messageLinkGuideTitle: 'Copy the exact message link',
          messageLinkGuideDesktopInstruction:
            'Right-click the message, then click Copy Message Link.',
          messageLinkGuideMobileInstruction: 'Tap the three dots, then tap Copy Link.',
          messageLinkGuideRetryHint: 'Paste the copied link here and parse again.',
          messageLinkGuideTrigger: 'How to copy the right Telegram link?',
          linkLabel: 'Telegram link',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Clear input',
          submit: 'Paste Telegram Video Link',
          submitting: 'Parsing...',
          noResults: 'No downloadable files were found for this message.',
          download: 'Download',
          downloading: 'Downloading...',
          checkingStorage: 'Checking browser storage...',
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
          downloadAll: 'Download all',
          downloadingAll: 'Downloading all...',
          resumeNotice:
            'Detected an unfinished download "{filename}" ({progress}). Do you want to continue?',
          resumeAction: 'Continue',
          pendingRestartText: 'Previous download record for "{filename}" can be restarted.',
          pendingRestartButton: 'Restart download',
          resumeUnavailableText: 'The local recovery record has expired.',
          resumeDismiss: 'Ignore',
          resuming: 'Resuming...',
          largeFileExtensionInlineChromeTitle: 'Chrome Extension',
          largeFileExtensionInlineChromeDescription:
            'Dedicated extension for Chrome browser to capture Telegram media content with one click.',
          largeFileExtensionInlineChromeCta: 'Install Extension',
          largeFileExtensionInlineEdgeTitle: 'Edge Extension',
          largeFileExtensionInlineEdgeDescription:
            'Dedicated extension for Microsoft Edge, perfectly compatible with Telegram content downloading.',
          largeFileExtensionInlineEdgeCta: 'Install Extension'
        },
        errors: {
          enterEmailFirst: 'Please enter your email address first.',
          enterEmailAndCode: 'Please enter both email and verification code.',
          sendCodeFailed: 'Failed to send verification code.',
          googleSignInFailed: 'Google sign-in failed.',
          googleClientMissing: 'Google sign-in is not configured.',
          restoreSessionFailed: 'Failed to restore session.',
          signInFailed: 'Failed to sign in.',
          logoutFailed: 'Failed to log out.',
          loadQuotaFailed: 'Failed to load Credits.',
          enterLink: 'Please enter a media link.',
          invalidLink: 'This is not a valid URL.',
          parseFailed: 'Failed to parse this link.',
          downloadFailed: 'Failed to download this file.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          browserStorageInsufficientUseExtension:
            'This browser does not have enough reliable local storage for this file ({file_size}). Available storage is about {available_space}. Install TG Downloader and download with the browser extension instead.',
          browserStorageInsufficientConfirmTitle: 'Not enough browser storage',
          browserStorageInsufficientConfirmViewExtension: 'View extension download',
          browserStorageInsufficientConfirmCancel: 'Cancel',
          downloadNetworkInterrupted: 'Network connection interrupted. Click Continue to resume.',
          unsupportedDownloadMode: 'This download method is not supported yet. Please try again later.',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'This link platform is not supported.',
          tiktokUnsupported: 'This TikTok link cannot be parsed yet. Use a public single video or photo post link.',
          vimeoParseFailed: 'This Vimeo video is private or cannot be parsed.',
          xParseFailed: 'This X link is not supported. Please try a public video status.',
          instagramParseFailed: 'This Instagram link is unsupported. Try a public post.',
          instagramImageParseFailed: 'This Instagram link is unsupported. Try a public photo post.',
          threadsParseFailed: 'This Threads link is unsupported. Try a public post.',
          redditParseFailed: 'Failed to fetch Reddit media. Try a public video, image, or gallery post.',
          douyinParseFailed: 'Failed to fetch this Douyin video. Try a public video link.',
          quotaExceeded: 'Not enough Credits to download this file.',
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
        title: 'More Video Downloaders',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Download TikTok videos without watermark in HD quality.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Download X/Twitter videos and GIFs in HD quality.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Download Vimeo videos in HD with multiple resolution options.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Download Instagram photos, Reels, and carousels in HD quality.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Download Threads videos and photos in original quality.'
          }
        ]
      }
    },
    changelog: {
      title: 'Telegram Video Download Changelog',
      description:
        'Track telegram video download updates, media workflow changes, larger file support, and release notes for TG Downloader.',
      seoTitle: 'Telegram Video Download Changelog | TG Downloader',
      seoDescription:
        'Read the telegram video download changelog for TG Downloader updates, Telegram Web improvements, larger file support, and release notes for each version.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Performance Boost',
          description: 'Major performance improvements for better user experience.',
          features: [
            'Resource detection speed improved by 50%',
            'Optimized large file download stability',
            'Enhanced UI responsiveness'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Multi-language Support',
          description: 'Added support for 14 languages worldwide.',
          features: [
            'Added Japanese, Korean, and more languages',
            'Improved translation accuracy',
            'Added automatic language detection'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Sidebar Download',
          description: 'New sidebar download feature with batch support.',
          features: [
            'Added sidebar single file download',
            'Added batch download functionality',
            'Improved download queue management'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Security & Privacy',
          description: 'Security improvements and privacy enhancements.',
          features: [
            'Removed all analytics tracking',
            'Added local-only processing mode',
            'Improved data encryption'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Initial Release',
          description: 'First release with chat window download support.',
          features: [
            'Chat window download functionality',
            'Support for Telegram Web K and A versions',
            'Basic media format support'
          ]
        }
      ],
      labels: {
        features: 'New Features',
        fixes: 'Bug Fixes'
      }
    },
    pricing: pricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['en-US'],
    extensionLoginV2: {
      title: 'Extension Sign In | TG Downloader',
      description:
        'Sign in to TG Downloader and sync your website session with the browser extension.',
      eyebrow: 'Browser Extension',
      heading: 'Sign in to TG Downloader',
      checkingState: 'Checking Session',
      signInRequiredState: 'Sign In Required',
      syncedState: 'Signed In',
      verificationFailedState: 'Verification Failed',
      preparingTitle: 'Preparing sign-in...',
      preparingText: 'TG Downloader is preparing the website session check.',
      checkingSessionTitle: 'Checking website session...',
      checkingSessionText: 'TG Downloader is verifying the website token stored in this browser.',
      finishingGoogleTitle: 'Finishing Google sign-in...',
      finishingGoogleText:
        'TG Downloader is exchanging the Google sign-in result for a website session.',
      signInRequiredTitle: 'Sign in to continue',
      signInRequiredText: 'Use the same TG Downloader login window as the website.',
      signInButtonLabel: 'Sign in',
      syncingTitle: 'Syncing extension token...',
      syncingText: 'TG Downloader is exchanging your website session for an extension token.',
      syncedTitle: 'Login successful',
      syncedText:
        'The extension is connected to your TG Downloader account. Click Return to Telegram to go back.',
      returnButtonLabel: 'Return to Telegram',
      returningButtonLabel: 'Returning...',
      verificationFailedTitle: 'Could not finish extension login',
      retryButtonLabel: 'Try again',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok Video Downloader No Watermark - HD Quality | TG Downloader',
          description:
            'Download TikTok videos without watermark in HD quality for free. No app install needed. Save TikTok videos, slideshows, and stories instantly.',
          keywords:
            'tiktok downloader, tiktok video download, tiktok no watermark, download tiktok video hd, save tiktok video, tiktok downloader free'
        },
        workspace: {
          title: 'TikTok Video Downloader No Watermark',
          helperText:
            'Paste any TikTok video link to download without watermark in HD quality. Also supports Telegram, X, and Vimeo links.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Why Use Our TikTok Downloader',
          subtitle: 'Save TikTok videos in the highest quality without watermarks, completely free.',
          items: [
            {
              title: 'No Watermark',
              description:
                'Download TikTok videos without the TikTok watermark overlay. Get clean, original-quality videos ready to save or share.'
            },
            {
              title: 'HD Quality',
              description:
                'Save TikTok videos in their original HD resolution. No quality loss, no compression — exactly as the creator uploaded.'
            },
            {
              title: 'Fast & Free',
              description:
                'No app install, no registration, no hidden fees. Paste the link, get your video. Works instantly in any browser.'
            }
          ]
        },
        howTo: {
          title: 'How to Download TikTok Videos Without Watermark',
          subtitle:
            'Three simple steps to save any TikTok video in HD quality without watermark.',
          steps: [
            {
              title: 'Copy the TikTok video link',
              description:
                'Open TikTok, tap the Share button on the video, and select "Copy link".'
            },
            {
              title: 'Paste the link above',
              description:
                'Paste the copied TikTok URL into the input field and click Parse.'
            },
            {
              title: 'Download without watermark',
              description:
                'Click the Download button to save the TikTok video in HD without any watermark.'
            }
          ]
        },
        faq: {
          title: 'TikTok Downloader FAQ',
          items: [
            {
              question: 'Is this TikTok downloader really free?',
              answer:
                'Yes, completely free with no hidden charges. You can download TikTok videos without watermark at no cost.'
            },
            {
              question: 'Will the downloaded video have a watermark?',
              answer:
                'No. Our downloader removes the TikTok watermark and delivers the original clean video in HD quality.'
            },
            {
              question: 'What quality are the downloaded TikTok videos?',
              answer:
                'Videos are saved in their original HD resolution as uploaded by the creator, with no quality loss.'
            },
            {
              question: 'Do I need to install any app or extension?',
              answer:
                'No installation needed. This is a web-based tool that works directly in your browser on any device.'
            },
            {
              question: 'Can I download TikTok Stories and Slideshows?',
              answer:
                'Yes, our downloader supports TikTok videos, photo slideshows, and stories. Paste the link and download.'
            }
          ]
        },
        crossLinks: {
          title: 'More Video Downloaders',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Download X/Twitter videos and GIFs in HD quality.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Download Vimeo videos in HD with multiple resolution options.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Download Instagram photos, Reels, and carousels in HD quality.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Download Threads videos and photos in original quality.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Download Telegram videos from channels and groups in HD quality.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) Video Downloader - Save Videos & GIFs HD | TG Downloader',
          description:
            'Download X (Twitter) videos and GIFs in HD quality for free. No app needed. Save any public tweet video or GIF instantly.',
          keywords:
            'x downloader, twitter video download, download twitter video, x video downloader, twitter gif download, save twitter video'
        },
        workspace: {
          title: 'X (Twitter) Video Downloader',
          helperText:
            'Paste any X or Twitter video link to download in highest quality. Also supports Telegram, TikTok, and Vimeo links.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Why Use Our X Video Downloader',
          subtitle: 'Save X/Twitter videos and GIFs in their original quality, completely free.',
          items: [
            {
              title: 'Videos & GIFs',
              description:
                'Download both video posts and animated GIFs from X (Twitter). Get the exact media as it appears in the tweet.'
            },
            {
              title: 'Original HD Quality',
              description:
                'Save X videos in the highest available resolution. No quality degradation — get the same bitrate as the source.'
            },
            {
              title: 'Fast & Free',
              description:
                'No app install, no login required. Paste the tweet URL, get your video or GIF downloaded in seconds.'
            }
          ]
        },
        howTo: {
          title: 'How to Download X (Twitter) Videos',
          subtitle:
            'Three simple steps to save any video or GIF from X/Twitter.',
          steps: [
            {
              title: 'Copy the tweet URL',
              description:
                'On X (Twitter), click the Share icon on the tweet and select "Copy link".'
            },
            {
              title: 'Paste the link above',
              description:
                'Paste the copied X/Twitter URL into the input field and click Parse.'
            },
            {
              title: 'Download the video or GIF',
              description:
                'Click Download to save the video or GIF in HD quality to your device.'
            }
          ]
        },
        faq: {
          title: 'X Video Downloader FAQ',
          items: [
            {
              question: 'How do I download a video from X (Twitter)?',
              answer:
                'Copy the tweet URL containing the video, paste it into the input field above, and click Parse. Then click Download to save the video.'
            },
            {
              question: 'Can I download GIFs from X?',
              answer:
                'Yes. Our downloader supports both videos and animated GIFs from X/Twitter posts. GIFs are saved as MP4 files for best compatibility.'
            },
            {
              question: 'What video quality is available?',
              answer:
                'We deliver the highest quality available for each tweet, typically the original HD resolution uploaded by the poster.'
            },
            {
              question: 'Is this X downloader free to use?',
              answer:
                'Yes, completely free with no registration required. Download X videos and GIFs without any cost.'
            },
            {
              question: 'Do I need an X/Twitter account to download?',
              answer:
                'No account is needed. As long as the tweet is public, you can download its video or GIF without logging in.'
            }
          ]
        },
        crossLinks: {
          title: 'More Video Downloaders',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Download TikTok videos without watermark in HD quality.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Download Vimeo videos in HD with multiple resolution options.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Download Instagram photos, Reels, and carousels in HD quality.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Download Threads videos and photos in original quality.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Download Telegram videos from channels and groups in HD quality.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo Video Downloader HD - Multiple Resolutions | TG Downloader',
          description:
            'Download Vimeo videos in HD quality with multiple resolution options for free. No app needed. Save any public Vimeo video instantly.',
          keywords:
            'vimeo downloader, vimeo video download, download vimeo video hd, vimeo downloader free, save vimeo video, vimeo hd download'
        },
        workspace: {
          title: 'Vimeo Video Downloader HD',
          helperText:
            'Paste any Vimeo video link to download in HD quality with resolution selection. Also supports Telegram, TikTok, and X links.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Why Use Our Vimeo Downloader',
          subtitle: 'Save Vimeo videos in HD quality with your choice of resolution, completely free.',
          items: [
            {
              title: 'HD Original Quality',
              description:
                'Download Vimeo videos in their full HD resolution. Get the same crisp quality that the creator uploaded.'
            },
            {
              title: 'Multiple Resolutions',
              description:
                'Choose from available resolutions (360p, 720p, 1080p, and more). Pick the quality that fits your needs.'
            },
            {
              title: 'Fast & Free',
              description:
                'No app install, no account needed. Paste the Vimeo link, select your resolution, and download instantly.'
            }
          ]
        },
        howTo: {
          title: 'How to Download Vimeo Videos in HD',
          subtitle:
            'Three simple steps to save any Vimeo video with your preferred resolution.',
          steps: [
            {
              title: 'Copy the Vimeo video link',
              description:
                'Open the Vimeo video page and copy the URL from your browser address bar.'
            },
            {
              title: 'Paste the link above',
              description:
                'Paste the copied Vimeo URL into the input field and click Parse.'
            },
            {
              title: 'Choose resolution and download',
              description:
                'Select your preferred video resolution and click Download to save the HD video.'
            }
          ]
        },
        faq: {
          title: 'Vimeo Downloader FAQ',
          items: [
            {
              question: 'How do I download a video from Vimeo?',
              answer:
                'Copy the Vimeo video page URL, paste it into the input field above, click Parse, then select your preferred resolution and download.'
            },
            {
              question: 'Can I choose the video resolution?',
              answer:
                'Yes. After parsing, you can choose from all available resolutions including 360p, 720p, 1080p, and higher when available.'
            },
            {
              question: 'Is this Vimeo downloader free?',
              answer:
                'Yes, completely free to use. Download Vimeo videos in HD quality without any cost or registration.'
            },
            {
              question: 'Do I need a Vimeo account to download?',
              answer:
                'No account needed. You can download any public Vimeo video without logging in.'
            },
            {
              question: 'What video format are the downloads?',
              answer:
                'Vimeo videos are downloaded in MP4 format, which is compatible with virtually all devices and players.'
            }
          ]
        },
        crossLinks: {
          title: 'More Video Downloaders',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Download TikTok videos without watermark in HD quality.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Download X/Twitter videos and GIFs in HD quality.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Download Instagram photos, Reels, and carousels in HD quality.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Download Threads videos and photos in original quality.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Download Telegram videos from channels and groups in HD quality.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram Photo & Video Downloader - HD Quality | TG Downloader',
          description:
            'Download Instagram photos, Reels, and carousel albums in HD quality for free. No app install needed. Save Instagram media instantly.',
          keywords:
            'instagram downloader, instagram photo download, instagram reels download, instagram carousel download, save instagram video, instagram downloader free'
        },
        workspace: {
          title: 'Instagram Photo & Video Downloader',
          helperText:
            'Paste any Instagram post link to download photos, Reels, and carousels in HD quality. Also supports Telegram, TikTok, and X links.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Why Use Our Instagram Downloader',
          subtitle: 'Save Instagram photos, Reels, and carousel albums in original HD quality, completely free.',
          items: [
            {
              title: 'Photos & Reels',
              description:
                'Download Instagram photos and Reels videos in their original quality. Get the exact media as posted by the creator.'
            },
            {
              title: 'Carousel Albums',
              description:
                'Download all images and videos from Instagram carousel posts at once. No need to save them one by one.'
            },
            {
              title: 'HD Original Quality',
              description:
                'Save Instagram media in the highest available resolution. No compression, no quality loss — exactly as uploaded.'
            }
          ]
        },
        howTo: {
          title: 'How to Download Instagram Photos & Videos',
          subtitle:
            'Three simple steps to save any Instagram post in HD quality.',
          steps: [
            {
              title: 'Copy the Instagram post link',
              description:
                'Open Instagram, tap the three dots on the post, and select "Copy link".'
            },
            {
              title: 'Paste the link above',
              description:
                'Paste the copied Instagram URL into the input field and click Parse.'
            },
            {
              title: 'Download in HD',
              description:
                'Click the Download button to save photos, Reels, or carousel albums in original quality.'
            }
          ]
        },
        faq: {
          title: 'Instagram Downloader FAQ',
          items: [
            {
              question: 'Is this Instagram downloader really free?',
              answer:
                'Yes, completely free with no hidden charges. Download Instagram photos, Reels, and carousels at no cost.'
            },
            {
              question: 'What formats are supported?',
              answer:
                'We support downloading Instagram photos (JPG), Reels videos (MP4), and full carousel albums with all their media.'
            },
            {
              question: 'What quality are the downloaded files?',
              answer:
                'All media is saved in original HD resolution as uploaded by the creator, with no quality loss or compression.'
            },
            {
              question: 'Do I need an Instagram account to download?',
              answer:
                'No account is needed. As long as the post is public, you can download its media without logging in.'
            },
            {
              question: 'Can I download Instagram Stories?',
              answer:
                'Currently we support posts, Reels, and carousels. Story downloads require the content to be publicly accessible via a direct link.'
            }
          ]
        },
        crossLinks: {
          title: 'More Video Downloaders',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Download TikTok videos without watermark in HD quality.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Download X/Twitter videos and GIFs in HD quality.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Download Vimeo videos in HD with multiple resolution options.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Download Threads videos and photos in original quality.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Download Telegram videos from channels and groups in HD quality.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads Video & Photo Downloader - Original Quality | TG Downloader',
          description:
            'Download Threads videos and photos in original quality for free. No app install needed. Save Threads media including carousels instantly.',
          keywords:
            'threads downloader, threads video download, download threads video, threads media download, save threads video, threads downloader free'
        },
        workspace: {
          title: 'Threads Video & Photo Downloader',
          helperText:
            'Paste any Threads post link to download videos and photos in original quality. Also supports Telegram, TikTok, and Instagram links.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Why Use Our Threads Downloader',
          subtitle: 'Save Threads videos and photos in original quality, completely free.',
          items: [
            {
              title: 'Mixed Media',
              description:
                'Download both videos and photos from Threads posts. Supports mixed media posts with multiple content types.'
            },
            {
              title: 'Original Quality',
              description:
                'Save Threads media in the highest available resolution. No compression or quality loss — exactly as posted.'
            },
            {
              title: 'Carousel Support',
              description:
                'Download all media from Threads carousel posts at once. Get every photo and video in a single operation.'
            }
          ]
        },
        howTo: {
          title: 'How to Download Threads Videos & Photos',
          subtitle:
            'Three simple steps to save any Threads post in original quality.',
          steps: [
            {
              title: 'Copy the Threads post link',
              description:
                'Open Threads, tap the share icon on the post, and select "Copy link".'
            },
            {
              title: 'Paste the link above',
              description:
                'Paste the copied Threads URL into the input field and click Parse.'
            },
            {
              title: 'Download the media',
              description:
                'Click the Download button to save videos and photos in original quality.'
            }
          ]
        },
        faq: {
          title: 'Threads Downloader FAQ',
          items: [
            {
              question: 'Is this Threads downloader really free?',
              answer:
                'Yes, completely free with no hidden charges. Download Threads videos and photos at no cost.'
            },
            {
              question: 'What media types are supported?',
              answer:
                'We support downloading videos, photos, and mixed media posts from Threads, including carousel posts with multiple items.'
            },
            {
              question: 'What quality are the downloaded files?',
              answer:
                'All media is saved in original resolution as posted by the creator, with no quality loss.'
            },
            {
              question: 'Do I need a Threads account to download?',
              answer:
                'No account is needed. As long as the post is public, you can download its media without logging in.'
            },
            {
              question: 'Can I download carousel posts with multiple photos?',
              answer:
                'Yes, our downloader fully supports Threads carousel posts. All photos and videos in the carousel are available for download.'
            }
          ]
        },
        crossLinks: {
          title: 'More Video Downloaders',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Download TikTok videos without watermark in HD quality.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Download X/Twitter videos and GIFs in HD quality.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Download Vimeo videos in HD with multiple resolution options.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Download Instagram photos, Reels, and carousels in HD quality.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Download Telegram videos from channels and groups in HD quality.'
            }
          ]
        }
      }
    }
  }
}
