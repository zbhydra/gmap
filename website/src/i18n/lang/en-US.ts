import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'Credits',
        enterEmailFirst: 'Please enter your email address first.',
        enterEmailAndCode: 'Please enter both email and verification code.',
        sendCodeFailed: 'Failed to send verification code.',
        googleSignInFailed: 'Google sign-in failed.',
        googleClientMissing: 'Google sign-in is not configured.',
        signInFailed: 'Failed to sign in.',
      },
      checkin: {
        accountButtonLabel: 'Open account menu',
        accountMenuLabel: 'Account menu',
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
  }
}
