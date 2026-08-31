import type { SiteContent } from '../schema'
import { ruRUPricingContent } from '../pricing'

export const ruRU: SiteContent = {
  site: {
    name: 'Загрузка видео Telegram | TG Downloader',
    description:
      'TG Downloader для Telegram Web: загрузка видео Telegram, сохранение файлов и медиа из уже открытого контента, продолжение работы через приватный канал Telegram.',
    keywords:
      'загрузка видео Telegram, загрузка медиа Telegram, сохранение видео Telegram, загрузка файлов Telegram, приватный канал Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Загрузчик',
      home: 'Главная',
      pricing: 'Цены',
      solutions: 'Решение',
      changelog: 'Изменения'
    },
    footer: {
      resources: 'Ресурсы',
      rights: '© 2026 TG Downloader. Все права защищены.'
    }
  },
  common: {
    installCta: 'Установить Сейчас'
  },
  pages: {
    account: {
      auth: {
        eyebrow: 'Веб-доступ',
        title: 'Войдите, чтобы синхронизировать кредиты',
        signedInAs: 'Вы вошли как',
        continueWithGoogle: 'Продолжить с Google',
        googleLoading: 'Открываем Google...',
        or: 'или',
        emailLabel: 'Email',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'Продолжить с email',
        sendCode: 'Отправить код',
        sendingCode: 'Отправка...',
        sendCodeSuccess: 'Код подтверждения отправлен.',
        sendAgain: 'Отправить снова',
        codeLabel: 'Код подтверждения',
        codePlaceholder: '123456',
        signIn: 'Войти',
        termsNotice: 'Входя, вы соглашаетесь с',
        termsLink: 'Условиями',
        privacyLink: 'Политикой конфиденциальности',
        logout: 'Выйти',
        creditsLabel: 'кредиты',
        enterEmailFirst: 'Сначала введите адрес электронной почты.',
        enterEmailAndCode: 'Введите email и код подтверждения.',
        sendCodeFailed: 'Не удалось отправить код подтверждения.',
        googleSignInFailed: 'Не удалось войти через Google.',
        googleClientMissing: 'Вход через Google не настроен.',
        signInFailed: 'Не удалось войти.',
      },
      checkin: {
        accountButtonLabel: 'Открыть меню аккаунта',
        accountMenuLabel: 'Меню аккаунта',
      },
      creditPurchase: {
        title: 'Купить кредиты',
        description: 'Добавьте кредиты и продолжайте загрузку в этом рабочем пространстве.',
        successTitle: 'Кредиты добавлены',
        successDescription: 'Баланс обновлен. Закройте это окно и начните загрузку снова.',
        packageEyebrow: 'Платите по мере использования',
        cardNote: 'Используйте кредиты для загрузок на сайте. Кредиты не истекают.',
        creditsAmount: '{credits} кредитов',
        buyNow: 'Купить сейчас',
        selectPackage: 'Выбрать',
        paymentMethodLabel: 'Выберите способ оплаты',
        paymentTitle: 'Выберите способ оплаты',
        selectedPackageLabel: 'Выбранный товар',
        confirmPurchase: 'Перейти к оплате',
        backToProducts: 'Назад',
        close: 'Закрыть',
        agreementText: 'Я принимаю условия покупки, Условия использования и Политику конфиденциальности.',
        loadingConfigs: 'Загрузка пакетов кредитов...',
        loadFailed: 'Не удалось загрузить пакеты кредитов. Повторите попытку.',
        noConfigs: 'Сейчас нет доступных пакетов кредитов. Повторите попытку позже.',
        ready: 'Выберите пакет кредитов. Цены указаны в USD.',
        creatingOrder: 'Создание заказа...',
        pendingPayment: 'Завершите оплату в новой вкладке. Мы автоматически проверим результат.',
        pendingPaymentTitle: 'Ожидание оплаты',
        cancelPayment: 'Отменить оплату',
        supportMailPrefix: 'Сообщить о проблеме: ',
        success: 'Оплата завершена. Кредиты доступны.',
        failed: 'Оплата не завершена. Можно повторить попытку или закрыть это окно.',
        successCredits: '+{credits} кредитов добавлено',
        successBalance: 'Текущий баланс: {balance} кредитов',
        createFailed: 'Не удалось создать заказ. Повторите попытку.',
        invalidPaymentData: 'Ссылка оплаты недействительна. Повторите попытку позже.',
        priceUpdated: 'Цена изменилась. Проверьте актуальную цену и купите снова.',
        gatewayFailed: 'Оплата временно недоступна. Повторите попытку позже.',
        paymentCanceled: 'Оплата отменена. Выберите способ оплаты и повторите попытку.',
        pollFailed: 'Не удалось обновить статус оплаты. Повторите попытку.',
        pollTimeout: 'Автообновление истекло. Обновите результат после оплаты.',
        orderNotFound: 'Заказ больше недоступен. Создайте новый заказ.',
        orderExpired: 'Заказ истек. Купите снова.',
        fulfillmentFailed: 'Оплата получена, но кредиты еще не добавлены. Повторите попытку позже.',
        authExpired: 'Срок входа истек. Войдите снова, чтобы продолжить.'
      },
    },

    changelog: {
      title: 'Журнал загрузки видео Telegram',
      description:
        'Следите за каждым обновлением вокруг загрузки видео Telegram, web-потока и более длинных сессий сохранения.',
      seoTitle: 'Журнал загрузки видео Telegram | TG Downloader',
      seoDescription:
        'Читайте этот журнал загрузки видео Telegram для обновлений по web-потоку, большим файлам и свежим версиям.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Улучшение Производительности',
          description:
            'Значительные улучшения производительности для лучшего взаимодействия с пользователем.',
          features: [
            'Скорость обнаружения ресурсов улучшена на 50%',
            'Оптимизирована стабильность загрузки больших файлов',
            'Улучшена отзывчивость интерфейса'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Многоязычная Поддержка',
          description: 'Добавлена поддержка 14 языков по всему миру.',
          features: [
            'Добавлена поддержка японского, корейского и других языков',
            'Улучшена точность перевода',
            'Добавлено автоматическое определение языка'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Загрузка в Боковой Панели',
          description: 'Новая функция загрузки в боковой панели с пакетной поддержкой.',
          features: [
            'Добавлена загрузка одиночных файлов в боковой панели',
            'Добавлена пакетная загрузка',
            'Улучшено управление очередью загрузки'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Безопасность и Конфиденциальность',
          description: 'Улучшения безопасности и улучшения конфиденциальности.',
          features: [
            'Удалена вся аналитическая отслеживание',
            'Добавлен режим обработки только локально',
            'Улучшено шифрование данных'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Первый Релиз',
          description: 'Первый релиз с поддержкой загрузки в окне чата.',
          features: [
            'Функция загрузки в окне чата',
            'Поддержка Telegram Web K и A версий',
            'Базовая поддержка форматов мультимедиа'
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
    pricing: ruRUPricingContent,
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
      title: 'Вход через расширение | TG Downloader',
      description:
        'Войдите в TG Downloader и синхронизируйте сессию сайта с браузерным расширением.',
      eyebrow: 'Браузерное расширение',
      heading: 'Войти в TG Downloader',
      checkingState: 'Проверка сессии',
      signInRequiredState: 'Требуется вход',
      syncedState: 'Вход выполнен',
      verificationFailedState: 'Ошибка проверки',
      preparingTitle: 'Подготовка входа…',
      preparingText: 'TG Downloader готовит проверку сессии сайта.',
      checkingSessionTitle: 'Проверка сессии сайта…',
      checkingSessionText:
        'TG Downloader проверяет токен сайта, сохранённый в этом браузере.',
      finishingGoogleTitle: 'Завершение входа через Google…',
      finishingGoogleText:
        'TG Downloader обменивает результат входа через Google на сессию сайта.',
      signInRequiredTitle: 'Войдите, чтобы продолжить',
      signInRequiredText: 'Используйте то же окно входа TG Downloader, что и на сайте.',
      signInButtonLabel: 'Войти',
      syncingTitle: 'Синхронизация токена расширения…',
      syncingText: 'TG Downloader обменивает вашу сессию сайта на токен расширения.',
      syncedTitle: 'Вход выполнен успешно',
      syncedText:
        'Расширение подключено к вашему аккаунту TG Downloader. Нажмите «Вернуться в Telegram», чтобы вернуться.',
      returnButtonLabel: 'Вернуться в Telegram',
      returningButtonLabel: 'Возврат…',
      verificationFailedTitle: 'Не удалось завершить вход через расширение',
      retryButtonLabel: 'Повторить',
    },
  }
}
