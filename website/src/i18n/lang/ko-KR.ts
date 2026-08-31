import type { SiteContent } from '../schema'
import { koKRPricingContent } from '../pricing'

export const koKR: SiteContent = {
  site: {
    name: 'Telegram 동영상 다운로드 | TG Downloader',
    description:
      'Telegram Web에서 Telegram 동영상 다운로드 를 진행하고 이미 로드한 파일과 미디어를 저장한 뒤 Telegram 비공개 채널 흐름으로 이어가세요.',
    keywords:
      'Telegram 동영상 다운로드, Telegram 미디어 다운로드, Telegram 동영상 저장, Telegram 파일 다운로드, Telegram 비공개 채널'
  },
  layout: {
    nav: {
      brand: 'TG 다운로더',
      home: '홈',
      pricing: '요금',
      solutions: '솔루션',
      changelog: '변경 로그'
    },
    footer: {
      resources: '자료',
      rights: '© 2026 TG Downloader. All rights reserved.'
    }
  },
  common: {
    installCta: '지금 설치'
  },
  pages: {
    account: {
      auth: {
        eyebrow: '웹 로그인',
        title: '로그인해서 크레딧 동기화',
        signedInAs: '현재 로그인 계정',
        continueWithGoogle: 'Google로 계속',
        googleLoading: 'Google 여는 중...',
        or: '또는',
        emailLabel: '이메일',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: '이메일로 계속',
        sendCode: '인증 코드 보내기',
        sendingCode: '전송 중...',
        sendCodeSuccess: '인증 코드를 보냈습니다.',
        sendAgain: '다시 보내기',
        codeLabel: '인증 코드',
        codePlaceholder: '123456',
        signIn: '로그인',
        termsNotice: '로그인하면 다음에 동의하게 됩니다',
        termsLink: '이용약관',
        privacyLink: '개인정보 처리방침',
        logout: '로그아웃',
        creditsLabel: '크레딧',
        enterEmailFirst: '먼저 이메일 주소를 입력하세요.',
        enterEmailAndCode: '이메일과 인증 코드를 모두 입력하세요.',
        sendCodeFailed: '인증 코드 전송에 실패했습니다.',
        googleSignInFailed: 'Google 로그인에 실패했습니다.',
        googleClientMissing: 'Google 로그인이 설정되어 있지 않습니다.',
        signInFailed: '로그인에 실패했습니다.',
      },
      checkin: {
        accountButtonLabel: '계정 메뉴 열기',
        accountMenuLabel: '계정 메뉴',
      },
      creditPurchase: {
        title: '크레딧 구매',
        description: '크레딧을 추가하고 이 작업 공간에서 계속 다운로드하세요.',
        successTitle: '크레딧이 추가되었습니다',
        successDescription: '잔액이 새로고침되었습니다. 이 창을 닫고 다운로드를 다시 시작하세요.',
        packageEyebrow: '필요할 때 구매',
        cardNote: '크레딧은 웹 다운로드에 사용할 수 있으며 만료되지 않습니다.',
        creditsAmount: '{credits} 크레딧',
        buyNow: '지금 구매',
        selectPackage: '선택',
        paymentMethodLabel: '결제 수단 선택',
        paymentTitle: '결제 수단 선택',
        selectedPackageLabel: '선택한 상품',
        confirmPurchase: '결제 계속',
        backToProducts: '뒤로',
        close: '닫기',
        agreementText: '구매 조건, 이용 약관 및 개인정보 처리방침에 동의합니다.',
        loadingConfigs: '크레딧 패키지를 불러오는 중...',
        loadFailed: '크레딧 패키지를 불러오지 못했습니다. 다시 시도하세요.',
        noConfigs: '현재 구매 가능한 크레딧 패키지가 없습니다. 나중에 다시 시도하세요.',
        ready: '크레딧 패키지를 선택하세요. 가격은 USD로 표시됩니다.',
        creatingOrder: '주문을 생성하는 중...',
        pendingPayment: '새로 열린 탭에서 결제를 완료하세요. 결과는 자동으로 확인됩니다.',
        pendingPaymentTitle: '결제 대기 중',
        cancelPayment: '결제 취소',
        supportMailPrefix: '문제 신고: ',
        success: '결제가 완료되었습니다. 이제 크레딧을 사용할 수 있습니다.',
        failed: '결제가 아직 완료되지 않았습니다. 다시 시도하거나 이 창을 닫을 수 있습니다.',
        successCredits: '+{credits} 크레딧 추가됨',
        successBalance: '현재 잔액: {balance} 크레딧',
        createFailed: '주문 생성에 실패했습니다. 다시 시도하세요.',
        invalidPaymentData: '결제 링크가 올바르지 않습니다. 나중에 다시 시도하세요.',
        priceUpdated: '가격이 변경되었습니다. 최신 가격을 확인하고 다시 구매하세요.',
        gatewayFailed: '결제 진입점을 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요.',
        paymentCanceled: '결제가 취소되었습니다. 결제 수단을 선택하고 다시 시도하세요.',
        pollFailed: '결제 상태를 새로고침하지 못했습니다. 다시 시도하세요.',
        pollTimeout: '자동 새로고침 시간이 초과되었습니다. 결제 후 수동으로 결과를 새로고침하세요.',
        orderNotFound: '주문을 더 이상 사용할 수 없습니다. 새 주문을 생성하세요.',
        orderExpired: '주문이 만료되었습니다. 다시 구매하세요.',
        fulfillmentFailed: '결제는 수신되었지만 크레딧이 아직 추가되지 않았습니다. 나중에 다시 시도하세요.',
        authExpired: '로그인이 만료되었습니다. 다시 로그인하여 계속하세요.'
      },
    },

    changelog: {
      title: 'Telegram 동영상 다운로드 변경 로그',
      description:
        'Telegram 동영상 다운로드, 웹 흐름, 더 긴 저장 세션에 관한 업데이트를 확인하세요.',
      seoTitle: 'Telegram 동영상 다운로드 변경 로그 | TG Downloader',
      seoDescription:
        '이 Telegram 동영상 다운로드 변경 로그에서 웹 흐름, 대용량 파일, 최신 버전 변화를 함께 확인하세요.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: '성능 향상',
          description: '더 나은 사용자 경험을 위한 주요 성능 개선 사항。',
          features: [
            '리소스 감지 속도 50% 향상',
            '대용량 파일 다운로드 안정성 최적화',
            'UI 응답 속도 개선'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '다국어 지원',
          description: '전 세계 14개 언어 지원이 추가되었습니다。',
          features: [
            '일본어, 한국어 등 다양한 언어 지원 추가',
            '번역 정확도 향상',
            '자동 언어 감지 추가'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: '사이드바 다운로드',
          description: '일괄 다운로드를 지원하는 새로운 사이드바 다운로드 기능。',
          features: [
            '사이드바 단일 파일 다운로드 추가',
            '일괄 다운로드 기능 추가',
            '다운로드 큐 관리 개선'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: '보안 및 프라이버시',
          description: '보안 개선 사항 및 프라이버시 강화。',
          features: ['모든 분석 추적 제거', '로컬 전용 처리 모드 추가', '데이터 암호화 개선']
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '최초 릴리스',
          description: '채팅 창 다운로드를 지원하는 첫 번째 릴리스。',
          features: [
            '채팅 창 다운로드 기능',
            'Telegram Web K 및 A 버전 지원',
            '기본 미디어 형식 지원'
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
    pricing: koKRPricingContent,
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
      title: '확장 프로그램 로그인 | TG Downloader',
      description: 'TG Downloader에 로그인하고 웹사이트 세션을 브라우저 확장 프로그램에 동기화합니다.',
      eyebrow: '브라우저 확장 프로그램',
      heading: 'TG Downloader에 로그인',
      checkingState: '세션 확인 중',
      signInRequiredState: '로그인 필요',
      syncedState: '로그인됨',
      verificationFailedState: '인증 실패',
      preparingTitle: '로그인 준비 중…',
      preparingText: 'TG Downloader가 웹사이트 세션 확인을 준비하고 있습니다.',
      checkingSessionTitle: '웹사이트 세션 확인 중…',
      checkingSessionText: 'TG Downloader가 이 브라우저에 저장된 웹사이트 토큰을 확인하고 있습니다.',
      finishingGoogleTitle: 'Google 로그인 완료 중…',
      finishingGoogleText: 'TG Downloader가 Google 로그인 결과를 웹사이트 세션으로 교환하고 있습니다.',
      signInRequiredTitle: '계속하려면 로그인하세요',
      signInRequiredText: '웹사이트와 동일한 TG Downloader 로그인 창을 사용하세요.',
      signInButtonLabel: '로그인',
      syncingTitle: '확장 프로그램 토큰 동기화 중…',
      syncingText: 'TG Downloader가 웹사이트 세션을 확장 프로그램 토큰으로 교환하고 있습니다.',
      syncedTitle: '로그인 성공',
      syncedText: '확장 프로그램이 TG Downloader 계정에 연결되었습니다. "Telegram으로 돌아가기"를 클릭해 돌아갑니다.',
      returnButtonLabel: 'Telegram으로 돌아가기',
      returningButtonLabel: '돌아가는 중…',
      verificationFailedTitle: '확장 프로그램 로그인을 완료할 수 없습니다',
      retryButtonLabel: '다시 시도',
    },
  }
}
