import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
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
  sections: {
    features: {
      title: 'Функции загрузки медиа Telegram',
      subtitle:
        'Эти функции загрузки медиа Telegram охватывают файлы, изображения, видео, крупные пакеты и контент, уже загруженный в Telegram Web.',
      metaDescription:
        'Возможности TG Downloader: пакетное сохранение нескольких файлов, поддержка приватных каналов, загрузка больших файлов 1ГБ+, обнаружение медиа в реальном времени и конфиденциальность прежде всего — без входа в систему.',
      items: [
        {
          title: 'Пакетная Загрузка',
          description:
            'Поддержка пакетной загрузки с множественным выбором, загрузка всех медиафайлов из канала или группы одним кликом',
          details: [
            'Поддержка пакетной загрузки с множественным выбором',
            'Загрузите весь канал/группу одним кликом',
            'Умная фильтрация по типу файла',
            'Управление очередью загрузки'
          ]
        },
        {
          title: 'Ограниченный Контент',
          description:
            'Загружайте медиа из ограниченных каналов и приватных групп даже без разрешения',
          details: [
            'Доступ к содержимому ограниченных каналов',
            'Загрузка из приватных групп',
            'Проверка разрешений не требуется',
            'Работает с версиями A/K'
          ]
        },
        {
          title: 'Поддержка Множества Форматов',
          description: 'Поддержка изображений, видео, GIF, аудио и других медиаформатов',
          details: [
            'Изображения: JPG, PNG, WEBP, GIF',
            'Видео: MP4, WEBM, MOV',
            'Аудиофайлы: MP3, M4A, OGG',
            'Автоматическое определение формата'
          ]
        },
        {
          title: 'Безопасно и Надёжно',
          description: 'Не требуется пароль или вход через API, данные пользователей не собираются',
          details: [
            'Не требуется пароль или вход через API',
            'Данные пользователей не собираются',
            'Без вирусов и рекламы',
            'Строгие тесты безопасности'
          ]
        },
        {
          title: 'Поддержка Больших Файлов',
          description: 'Стабильная загрузка файлов размером более 1ГБ с поддержкой возобновления',
          details: [
            'Стабильная загрузка файлов более 1ГБ',
            'Поддержка возобновления для прерванных загрузок',
            'Быстрая и стабильная передача',
            'Отслеживание прогресса'
          ]
        },
        {
          title: 'Обнаружение в Реальном Времени',
          description:
            'Автоматически сканирует и обнаруживает медиаресурсы, обновляет список загрузок в реальном времени',
          details: [
            'Автоматическое сканирование медиаресурсов страницы',
            'Обнаружение ресурсов в реальном времени',
            'Автоматические обновления списка',
            'Умное кэширование ресурсов'
          ]
        }
      ]
    },
    steps: {
      title: 'Гид по сохранению видео Telegram',
      subtitle:
        'Следуйте этому гиду по сохранению видео Telegram, откройте сообщение в Telegram Web и сохраните видео или другие медиа за несколько шагов.',
      metaDescription:
        'Пошаговое руководство по сохранению видео, файлов и альбомов Telegram с TG Downloader. Научитесь устанавливать расширение, обнаруживать медиа в Telegram Web и загружать контент пакетами.',
      items: [
        {
          title: 'Установить Расширение',
          description:
            'Найдите и установите TG Downloader из магазина расширений вашего браузера'
        },
        {
          title: 'Закрепить Расширение',
          description:
            'Нажмите на панель инструментов браузера, чтобы закрепить значок расширения для быстрого доступа'
        },
        {
          title: 'Открыть Telegram Web',
          description:
            'Посетите web.telegram.org, расширение автоматически начнёт сканировать медиаресурсы'
        },
        {
          title: 'Пакетная Загрузка',
          description:
            'Выберите файлы для загрузки и нажмите кнопку загрузки, чтобы сохранить их локально'
        }
      ]
    },
    cta: {
      title: 'Готов Начать?',
      description: 'Установите расширение и начните загружать медиа из Telegram прямо сейчас.'
    },
    techSpecs: {
      title: 'Технические Характеристики',
      browsersLabel: 'Браузеры',
      browsers: 'Chrome, Edge, Brave и все браузеры на основе Chromium',
      telegramVersionsLabel: 'Версии Telegram',
      telegramVersions: 'Веб K версия и A версия',
      permissionsLabel: 'Разрешения',
      permissions: 'Требуются минимальные разрешения',
      updatesLabel: 'Обновления',
      updates: 'Автоматические обновления из магазина расширений'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Загружать Медиа из Приватных и Ограниченных Каналов Telegram',
        description:
          'Один клик, без логина, поддержка файлов 1ГБ+. Пакетная загрузка из приватных каналов и ограниченного контента.'
      },
      stats: {
        users: 'Пользователей по Миру',
        downloads: 'Всего Загрузок'
      },
      seo: {
        title: 'Загрузчик приватных видео Telegram: скачайте любое приватное медиа',
        description:
          'Сохраняйте видео из приватных каналов Telegram с помощью простого руководства по загрузке. Скачивайте доступные видео и медиа, устраняйте сбои загрузки и подбирайте подходящий способ для вашего устройства.',
        keywords:
          'загрузчик приватных видео telegram, загрузчик видео из приватных каналов telegram, скачать приватное видео telegram, загрузчик приватных медиа telegram'
      },
      heroTrustPoints: [
        'Загрузка видео в HD',
        'Без регистрации',
        'Удобно на мобильных',
        'Работает на Windows, Mac, Android и iPhone'
      ],
      situation: {
        title: 'Начните здесь: какая ситуация вам подходит?',
        intro:
          'Большинство пользователей, ищущих загрузчик приватных видео Telegram, пытаются решить одну из этих задач:',
        headers: ['Ваша ситуация', 'Попробуйте сначала это'],
        rows: [
          {
            cells: [
              'У вас есть ссылка на видео Telegram из канала или чата',
              'Вставьте ссылку в онлайн-загрузчик видео Telegram'
            ]
          },
          {
            cells: [
              'Вы можете смотреть видео в приватном канале, но не можете его сохранить',
              'Попробуйте опцию «Save Video As» в Telegram Desktop'
            ]
          },
          {
            cells: [
              'Видео воспроизводится, но загрузка и пересылка заблокированы',
              'Используйте запись экрана только если у вас есть разрешение хранить копию'
            ]
          },
          {
            cells: [
              'Загрузчик сообщает, что видео не найдено',
              'Проверьте доступ, тип ссылки, ограничения канала и открывается ли видео вне Telegram'
            ]
          }
        ]
      },
      solutions: {
        title: 'Что работает для приватных видео Telegram?',
        intro:
          'Приватное видео Telegram обычно означает видео, опубликованное в приватном канале, приватной группе или личном чате. Такие видео видны только одобренным участникам, поэтому их загрузка отличается от сохранения медиа из публичного канала.',
        quickAnswer:
          'Короткий ответ: если ссылка доступна, используйте онлайн-загрузчик приватных видео Telegram. Если видео видно только внутри Telegram, попробуйте Telegram Desktop. Если сохранение заблокировано, но вам разрешено хранить контент, запись экрана может стать практичным запасным вариантом.',
        items: [
          {
            title: 'Решение 1: онлайн-загрузчик видео Telegram',
            description:
              'Лучше всего для доступных ссылок Telegram. Это самый простой способ для тех, кто хочет загружать видео Telegram онлайн без установки приложения, расширения или бота.',
            useWhenLabel: 'Используйте этот способ, когда:',
            useWhen: [
              'Ссылка на видео Telegram публичная или доступная.',
              'Вы хотите загружать видео Telegram онлайн.',
              'Вам нужен быстрый видеофайл в HD.',
              'Вы не хотите устанавливать расширение браузера или десктопное приложение.'
            ]
          },
          {
            title: 'Решение 2: «Save Video As» в Telegram Desktop',
            description:
              'Когда видео доступно в Telegram Desktop и загрузки разрешены, щёлкните по видео правой кнопкой и сохраните его в папку на компьютере. Это часто работает лучше для участников приватных каналов, потому что вы уже авторизованы внутри Telegram.',
            useWhenLabel: 'Используйте этот способ, когда:',
            useWhen: [
              'Вы можете просматривать видео в Telegram Desktop.',
              'Владелец канала не отключил сохранение.',
              'Вы предпочитаете загрузку напрямую на Windows или Mac.'
            ]
          },
          {
            title: 'Решение 3: запись экрана на мобильном или компьютере',
            description:
              'Если опция загрузки отключена, но вам разрешено просматривать и хранить контент, программа записи экрана может захватить видео и звук во время воспроизведения. Это запасной вариант, а не основной способ, поскольку он занимает больше времени и зависит от качества воспроизведения.',
            useWhenLabel: 'Используйте этот способ, когда:',
            useWhen: [
              'У вас есть разрешение просматривать и хранить видео.',
              'Ссылку Telegram не удаётся разобрать загрузчиком.',
              'Вам нужна личная офлайн-копия для справки.'
            ]
          },
          {
            title: 'Решение 4: проверка через файловый менеджер Android',
            description:
              'В некоторых случаях на Android Telegram может временно хранить загруженные медиа в локальных папках приложения. Файловый менеджер иногда помогает найти видео, уже загруженные на устройство, но это зависит от версии приложения, разрешений на хранилище и поведения кэша.',
            useWhenLabel: 'Используйте этот способ, когда:',
            useWhen: [
              'Вы уже воспроизводили видео в Telegram на Android.',
              'Вы понимаете разрешения приложения на хранилище.',
              'Вам нужно только восстановить файл, уже сохранённый в кэше на устройстве.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Зачем использовать онлайн-загрузчик видео Telegram?',
        intro:
          'Хороший загрузчик должен помочь быстро ответить на один вопрос: можно ли сохранить это видео Telegram по имеющейся ссылке? Лучший вариант — прямой, понятный и честный, когда приватную ссылку обработать нельзя.',
        items: [
          {
            title: 'Сохранение видео в высоком качестве',
            description:
              'Храните видео Telegram в наилучшем доступном качестве для офлайн-просмотра, учёбы, обучения, архивирования или личных целей.'
          },
          {
            title: 'Работает на разных устройствах',
            description:
              'Используйте загрузчик из браузера на Android, iPhone, Windows, Mac или планшете. Это важно, когда видео на телефоне, но вы хотите сохранить его на другое устройство.'
          },
          {
            title: 'Вход в Telegram не требуется',
            description:
              'Выбирайте инструменты, которые обрабатывают ссылку на видео, не запрашивая пароль Telegram, код подтверждения, файл сессии или учётные данные приватного аккаунта.'
          },
          {
            title: 'Удобный офлайн-просмотр',
            description:
              'Загружайте файлы в распространённых видеоформатах, когда они доступны, чтобы смотреть позже без открытия Telegram и расхода мобильного трафика.'
          },
          {
            title: 'Быстрый процесс по ссылке',
            description:
              'Скопируйте, вставьте, проанализируйте и скачайте. Если ссылка не сработала, страница должна объяснить причину и подсказать, что попробовать дальше.'
          },
          {
            title: 'Чёткие границы разрешений',
            description:
              'Загружайте только те видео, к которым у вас есть право доступа и сохранения. Уважайте правила каналов, права авторов и политику Telegram.'
          }
        ]
      },
      troubleshooting: {
        title: 'Если ссылка на видео Telegram не работает',
        intro:
          'Не каждая неработающая ссылка означает, что загрузчик сломан. Приватные видео Telegram часто не загружаются, потому что файл недоступен вне Telegram. Пройдите по этому чек-листу:',
        items: [
          'Откройте ссылку в браузере и убедитесь, что она загружается.',
          'Убедитесь, что вы всё ещё состоите в приватном канале или группе.',
          'Проверьте, не отключил ли владелец канала сохранение, копирование или пересылку.',
          'Попробуйте Telegram Desktop, если видео воспроизводится только внутри приложения.',
          'Используйте другой браузер или сеть, если страница не может подключиться к Telegram.',
          'Избегайте любых инструментов, запрашивающих код входа в Telegram.'
        ]
      },
      permission: {
        title: 'Важное замечание о разрешениях',
        note:
          'Загрузчик приватных видео Telegram не должен использоваться для обхода конфиденциальности, авторских прав или ограничений доступа. Сохраняйте видео только когда у вас есть разрешение владельца или когда ваше использование разрешено законом и условиями Telegram.'
      },
      comparison: {
        title: 'Выберите подходящий способ загрузки из Telegram',
        headers: ['Ситуация', 'Рекомендуемое решение', 'Лучше всего для', 'Что проверить'],
        rows: [
          {
            cells: [
              'Публичная или доступная ссылка на видео Telegram',
              'Онлайн-загрузчик видео Telegram',
              'Быстрая загрузка в HD без приложения',
              'Ссылка открывается, и инструмент может получить доступ к видео'
            ]
          },
          {
            cells: [
              'Видео из приватного канала с разрешённой загрузкой',
              '«Save Video As» в Telegram Desktop',
              'Сохранение напрямую на компьютер',
              'Вы участник, и владелец не отключил сохранение'
            ]
          },
          {
            cells: [
              'Сохранение ограничено, но воспроизведение доступно',
              'Встроенная или сторонняя запись экрана',
              'Личная офлайн-копия при наличии разрешения',
              'Захват звука, область экрана и местные законы или правила платформы'
            ]
          },
          {
            cells: [
              'Кэшированные медиа на Android',
              'Проверка через файловый менеджер',
              'Поиск медиа, уже загруженных на устройство',
              'Доступ к хранилищу приложения и хранит ли Telegram локальный кэш'
            ]
          }
        ]
      },
      howTo: {
        title: 'Как загрузить видео Telegram за 3 шага',
        subtitle:
          'Самый быстрый путь — загрузчик видео Telegram по ссылке. Он работает лучше всего, когда ссылка на видео Telegram публичная, доступная или читается вне приложения Telegram.',
        steps: [
          {
            title: 'Скопируйте ссылку на видео',
            description:
              'Откройте Telegram, найдите видео, которое хотите сохранить, и скопируйте ссылку на сообщение или видео из меню «Поделиться». Если канал не разрешает копировать ссылки, перейдите к решениям для приватных каналов ниже.'
          },
          {
            title: 'Вставьте и проанализируйте',
            description:
              'Вставьте ссылку Telegram в поле загрузчика. Инструмент проверит, можно ли получить загружаемый видеофайл по этой ссылке.'
          },
          {
            title: 'Скачайте в HD',
            description:
              'Выберите доступное качество или формат, затем сохраните видео Telegram прямо на телефон, планшет или компьютер. Если файл не появляется, ссылка, скорее всего, ограничена, а не повреждена.'
          }
        ]
      },
      faq: {
        title: 'Часто Задаваемые Вопросы',
        description: 'Вопросы, которые задают перед загрузкой видео или файла Telegram в Telegram Web.',
        items: [
          {
            question: 'Могу ли я загружать приватные видео Telegram?',
            answer:
              'Загружать или сохранять приватные видео Telegram можно только тогда, когда у вас есть разрешение на доступ к ним и источник видео доступен. Некоторые приватные каналы блокируют сохранение, пересылку, копирование ссылок или внешний доступ.'
          },
          {
            question: 'Как загрузить видео из приватного канала Telegram?',
            answer:
              'Сначала попробуйте загрузчик по ссылке, если у вас есть рабочая ссылка на видео Telegram. Если это не сработает, проверьте опцию «Save Video As» в Telegram Desktop. Если загрузка заблокирована, но вам разрешено хранить контент, запасным вариантом может стать запись экрана.'
          },
          {
            question: 'Почему загрузчик видео Telegram сообщает, что видео не найдено?',
            answer:
              'Ссылка может быть ограничена, удалена, просрочена, видна только внутри Telegram или заблокирована владельцем канала. Сначала откройте ссылку сами и убедитесь, что видео всё ещё воспроизводится. Если оно работает только после входа в Telegram, онлайн-загрузчик может не получить к нему доступ.'
          },
          {
            question: 'Нужно ли устанавливать программу?',
            answer:
              'Для доступных ссылок — нет. Онлайн-загрузчик видео Telegram работает в браузере. Для отдельных приватных или ограниченных случаев могут понадобиться Telegram Desktop, файловый менеджер или программа записи экрана.'
          },
          {
            question: 'Можно ли загрузить видео Telegram без ссылки?',
            answer:
              'Обычно нет. Онлайн-загрузчикам нужна ссылка на видео Telegram, чтобы найти файл. Если вы не можете скопировать ссылку, но можете смотреть видео в Telegram, используйте Telegram Desktop или другой разрешённый локальный способ.'
          },
          {
            question: 'Безопасно ли вводить код входа в Telegram в загрузчик?',
            answer:
              'Нет. Загрузчику не нужен ваш пароль Telegram, код подтверждения или данные сессии. Если сайт их запрашивает, покиньте страницу.'
          },
          {
            question: 'Бесплатен ли загрузчик медиа Telegram?',
            answer:
              'Многие загрузчики медиа Telegram по ссылке бесплатны для базовых загрузок. Избегайте инструментов, навязывающих подозрительные установки, запросы входа или вводящие в заблуждение кнопки.'
          },
          {
            question: 'Законно ли загружать видео Telegram?',
            answer:
              'Это зависит от контента, ваших разрешений и предполагаемого использования. Не загружайте и не распространяйте защищённый авторским правом, приватный или ограниченный контент без разрешения.'
          }
        ]
      },
      workspace: {
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
          creditsLabel: 'кредиты'
        },
        quota: {
          eyebrow: 'Веб-квота',
          title: 'Текущий баланс кредиты',
          planLabel: 'Тариф',
          remainingLabel: 'Осталось',
          dailyLimitLabel: 'Дневной лимит',
          unlimited: 'Без ограничений'
        },
        checkin: {
          creditsLoading: 'Кредиты',
          creditsButtonLabel: 'Открыть ежедневный чек-ин',
          accountButtonLabel: 'Открыть меню аккаунта',
          accountMenuLabel: 'Меню аккаунта',
          title: 'Ваши бесплатные кредиты за сегодня готовы',
          todayRewardText: 'Награда за сегодня: {credits} кредитов',
          claimedRewardText: 'Сегодня вы получили {credits} кредитов.',
          nextCountdown: 'Следующее получение через {time}',
          nextAt: '(Следующее обновление: {time} EST)',
          claimButton: 'Получить {credits} кредитов',
          claimingButton: 'Получение...',
          notNow: 'Не сейчас',
          close: 'Закрыть',
          loadFailed: 'Не удалось загрузить статус чек-ина.',
          claimFailed: 'Не удалось получить кредиты.'
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
        parse: {
          eyebrow: 'Прямой разбор',
          title: 'Загрузчик приватных видео Telegram: скачайте любое приватное медиа',
          helperText:
            'Сохраняйте видео из приватных каналов Telegram с помощью простого руководства по загрузке. Скачивайте доступные видео и медиа, устраняйте сбои загрузки и подбирайте подходящий способ для вашего устройства.',
          telegramMessageListLinkError:
            'Эта ссылка Telegram открывает чат или канал, а не конкретное сообщение. Скопируйте точную ссылку на сообщение и вставьте ее здесь.',
          linkLabel: 'Ссылка Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Очистить ввод',
          submit: 'Вставьте ссылку на видео Telegram',
          submitting: 'Разбор...',
          noResults: 'Для этого сообщения не найдено файлов для скачивания.',
          download: 'Скачать',
          downloading: 'Скачивание...',
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
          largeFileExtensionInlineChromeTitle: 'Расширение Chrome',
          largeFileExtensionInlineChromeDescription:
            'Расширение для Chrome, которое в один клик обнаруживает медиа Telegram.',
          largeFileExtensionInlineChromeCta: 'Установить расширение',
          largeFileExtensionInlineEdgeTitle: 'Расширение Edge',
          largeFileExtensionInlineEdgeDescription:
            'Расширение для Microsoft Edge, совместимое с загрузкой контента Telegram.',
          largeFileExtensionInlineEdgeCta: 'Установить расширение'
        },
        errors: {
          enterEmailFirst: 'Сначала введите адрес электронной почты.',
          enterEmailAndCode: 'Введите email и код подтверждения.',
          sendCodeFailed: 'Не удалось отправить код подтверждения.',
          googleSignInFailed: 'Не удалось войти через Google.',
          googleClientMissing: 'Вход через Google не настроен.',
          restoreSessionFailed: 'Не удалось восстановить сессию.',
          signInFailed: 'Не удалось войти.',
          logoutFailed: 'Не удалось выйти.',
          loadQuotaFailed: 'Не удалось загрузить кредиты.',
          enterLink: 'Введите ссылку на медиа.',
          invalidLink: 'Это недопустимый URL.',
          parseFailed: 'Не удалось разобрать эту ссылку.',
          downloadFailed: 'Не удалось скачать этот файл.',
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
          xParseFailed: 'Эта ссылка X не поддерживается. Используйте публичный видеопост.',
          instagramParseFailed: 'Эта ссылка Instagram не поддерживается. Используйте публичный пост.',
          instagramImageParseFailed: 'Эта ссылка Instagram не поддерживается. Используйте публичный пост с фото.',
          threadsParseFailed: 'Эта ссылка Threads не поддерживается. Используйте публичный пост.',
          redditParseFailed: 'Не удалось получить медиа Reddit. Используйте публичный пост с видео, изображением или галереей.',
          douyinParseFailed: 'Не удалось получить видео Douyin. Используйте ссылку на публичное видео.',
          quotaExceeded: 'Недостаточно кредитов для загрузки этого файла.',
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
        title: 'Другие видеозагрузчики',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Скачивайте видео TikTok без водяного знака в HD качестве.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Скачивайте видео и GIF из X/Twitter в HD качестве.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Скачивайте видео Vimeo в HD с выбором разрешения.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Скачивайте фото, Reels и карусели из Instagram в HD качестве.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Скачивайте видео и фото из Threads в оригинальном качестве.'
          }
        ]
      }
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
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['ru-RU'],
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
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Скачать видео TikTok без водяного знака - HD качество | TG Downloader',
          description:
            'Скачивайте видео TikTok без водяного знака в HD качестве бесплатно. Без установки приложений. Сохраняйте видео, слайдшоу и истории TikTok мгновенно.',
          keywords:
            'скачать тикток, скачать видео тикток, тикток без водяного знака, скачать тикток видео hd, сохранить видео тикток, тикток загрузчик бесплатно'
        },
        workspace: {
          title: 'Скачать видео TikTok без водяного знака',
          helperText:
            'Вставьте ссылку на видео TikTok, чтобы скачать без водяного знака в HD качестве. Также поддерживаются ссылки Telegram, X и Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Почему стоит использовать наш загрузчик TikTok',
          subtitle: 'Сохраняйте видео TikTok в максимальном качестве без водяных знаков, полностью бесплатно.',
          items: [
            {
              title: 'Без водяного знака',
              description:
                'Скачивайте видео TikTok без наложения водяного знака. Получайте чистые видео в оригинальном качестве, готовые к сохранению или публикации.'
            },
            {
              title: 'HD качество',
              description:
                'Сохраняйте видео TikTok в оригинальном HD разрешении. Без потери качества, без сжатия — именно так, как загрузил автор.'
            },
            {
              title: 'Быстро и бесплатно',
              description:
                'Без установки приложений, без регистрации, без скрытых платежей. Вставьте ссылку — получите видео. Работает мгновенно в любом браузере.'
            }
          ]
        },
        howTo: {
          title: 'Как скачать видео TikTok без водяного знака',
          subtitle:
            'Три простых шага для сохранения любого видео TikTok в HD качестве без водяного знака.',
          steps: [
            {
              title: 'Скопируйте ссылку на видео TikTok',
              description:
                'Откройте TikTok, нажмите кнопку «Поделиться» на видео и выберите «Скопировать ссылку».'
            },
            {
              title: 'Вставьте ссылку выше',
              description:
                'Вставьте скопированный URL TikTok в поле ввода и нажмите «Разобрать».'
            },
            {
              title: 'Скачайте без водяного знака',
              description:
                'Нажмите кнопку «Скачать», чтобы сохранить видео TikTok в HD без водяного знака.'
            }
          ]
        },
        faq: {
          title: 'FAQ загрузчика TikTok',
          items: [
            {
              question: 'Этот загрузчик TikTok действительно бесплатный?',
              answer:
                'Да, полностью бесплатный без скрытых платежей. Вы можете скачивать видео TikTok без водяного знака без каких-либо затрат.'
            },
            {
              question: 'На скачанном видео будет водяной знак?',
              answer:
                'Нет. Наш загрузчик удаляет водяной знак TikTok и предоставляет оригинальное чистое видео в HD качестве.'
            },
            {
              question: 'В каком качестве скачиваются видео TikTok?',
              answer:
                'Видео сохраняются в оригинальном HD разрешении, как их загрузил автор, без потери качества.'
            },
            {
              question: 'Нужно ли устанавливать приложение или расширение?',
              answer:
                'Установка не требуется. Это веб-инструмент, который работает прямо в браузере на любом устройстве.'
            },
            {
              question: 'Можно ли скачать истории и слайдшоу TikTok?',
              answer:
                'Да, наш загрузчик поддерживает видео TikTok, фото-слайдшоу и истории. Вставьте ссылку и скачайте.'
            }
          ]
        },
        crossLinks: {
          title: 'Другие видеозагрузчики',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Скачивайте видео и GIF из X/Twitter в HD качестве.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Скачивайте видео Vimeo в HD с выбором разрешения.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Скачивайте фото, Reels и карусели из Instagram в HD качестве.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Скачивайте видео и фото из Threads в оригинальном качестве.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Скачивайте видео Telegram из каналов и групп в HD качестве.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Загрузчик видео X (Twitter) - Сохранение видео и GIF в HD | TG Downloader',
          description:
            'Скачивайте видео и GIF из X (Twitter) в HD качестве бесплатно. Без установки приложений. Сохраняйте любое публичное видео или GIF из твита мгновенно.',
          keywords:
            'скачать видео твиттер, загрузчик x, скачать видео x, загрузчик видео twitter, скачать гиф твиттер, сохранить видео твиттер'
        },
        workspace: {
          title: 'Загрузчик видео X (Twitter)',
          helperText:
            'Вставьте ссылку на видео X или Twitter для загрузки в максимальном качестве. Также поддерживаются ссылки Telegram, TikTok и Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Почему стоит использовать наш загрузчик видео X',
          subtitle: 'Сохраняйте видео и GIF из X/Twitter в оригинальном качестве, полностью бесплатно.',
          items: [
            {
              title: 'Видео и GIF',
              description:
                'Скачивайте видеопосты и анимированные GIF из X (Twitter). Получайте медиа в точности как оно отображается в твите.'
            },
            {
              title: 'Оригинальное HD качество',
              description:
                'Сохраняйте видео X в максимально доступном разрешении. Без потери качества — тот же битрейт, что и у источника.'
            },
            {
              title: 'Быстро и бесплатно',
              description:
                'Без установки приложений, без логина. Вставьте URL твита — скачайте видео или GIF за секунды.'
            }
          ]
        },
        howTo: {
          title: 'Как скачать видео из X (Twitter)',
          subtitle:
            'Три простых шага для сохранения любого видео или GIF из X/Twitter.',
          steps: [
            {
              title: 'Скопируйте URL твита',
              description:
                'В X (Twitter) нажмите значок «Поделиться» на твите и выберите «Скопировать ссылку».'
            },
            {
              title: 'Вставьте ссылку выше',
              description:
                'Вставьте скопированный URL X/Twitter в поле ввода и нажмите «Разобрать».'
            },
            {
              title: 'Скачайте видео или GIF',
              description:
                'Нажмите «Скачать», чтобы сохранить видео или GIF в HD качестве на ваше устройство.'
            }
          ]
        },
        faq: {
          title: 'FAQ загрузчика видео X',
          items: [
            {
              question: 'Как скачать видео из X (Twitter)?',
              answer:
                'Скопируйте URL твита с видео, вставьте его в поле ввода выше и нажмите «Разобрать». Затем нажмите «Скачать» для сохранения видео.'
            },
            {
              question: 'Можно ли скачивать GIF из X?',
              answer:
                'Да. Наш загрузчик поддерживает видео и анимированные GIF из постов X/Twitter. GIF сохраняются в формате MP4 для лучшей совместимости.'
            },
            {
              question: 'В каком качестве доступно видео?',
              answer:
                'Мы предоставляем максимально доступное качество для каждого твита, как правило, оригинальное HD разрешение, загруженное автором.'
            },
            {
              question: 'Этот загрузчик X бесплатный?',
              answer:
                'Да, полностью бесплатный без регистрации. Скачивайте видео и GIF из X без каких-либо затрат.'
            },
            {
              question: 'Нужен ли аккаунт X/Twitter для загрузки?',
              answer:
                'Аккаунт не нужен. Если твит публичный, вы можете скачать его видео или GIF без входа в систему.'
            }
          ]
        },
        crossLinks: {
          title: 'Другие видеозагрузчики',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Скачивайте видео TikTok без водяного знака в HD качестве.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Скачивайте видео Vimeo в HD с выбором разрешения.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Скачивайте фото, Reels и карусели из Instagram в HD качестве.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Скачивайте видео и фото из Threads в оригинальном качестве.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Скачивайте видео Telegram из каналов и групп в HD качестве.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Загрузчик видео Vimeo HD - Выбор разрешения | TG Downloader',
          description:
            'Скачивайте видео Vimeo в HD качестве с выбором разрешения бесплатно. Без установки приложений. Сохраняйте любое публичное видео Vimeo мгновенно.',
          keywords:
            'скачать vimeo, загрузчик vimeo, скачать видео vimeo hd, загрузчик vimeo бесплатно, сохранить видео vimeo, vimeo hd скачать'
        },
        workspace: {
          title: 'Загрузчик видео Vimeo HD',
          helperText:
            'Вставьте ссылку на видео Vimeo для загрузки в HD качестве с выбором разрешения. Также поддерживаются ссылки Telegram, TikTok и X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Почему стоит использовать наш загрузчик Vimeo',
          subtitle: 'Сохраняйте видео Vimeo в HD качестве с выбором разрешения, полностью бесплатно.',
          items: [
            {
              title: 'Оригинальное HD качество',
              description:
                'Скачивайте видео Vimeo в полном HD разрешении. Получайте такое же чёткое качество, как загрузил автор.'
            },
            {
              title: 'Выбор разрешения',
              description:
                'Выбирайте из доступных разрешений (360p, 720p, 1080p и выше). Подберите качество под ваши нужды.'
            },
            {
              title: 'Быстро и бесплатно',
              description:
                'Без установки приложений, без аккаунта. Вставьте ссылку Vimeo, выберите разрешение и скачайте мгновенно.'
            }
          ]
        },
        howTo: {
          title: 'Как скачать видео Vimeo в HD',
          subtitle:
            'Три простых шага для сохранения любого видео Vimeo в нужном разрешении.',
          steps: [
            {
              title: 'Скопируйте ссылку на видео Vimeo',
              description:
                'Откройте страницу видео Vimeo и скопируйте URL из адресной строки браузера.'
            },
            {
              title: 'Вставьте ссылку выше',
              description:
                'Вставьте скопированный URL Vimeo в поле ввода и нажмите «Разобрать».'
            },
            {
              title: 'Выберите разрешение и скачайте',
              description:
                'Выберите нужное разрешение видео и нажмите «Скачать» для сохранения HD видео.'
            }
          ]
        },
        faq: {
          title: 'FAQ загрузчика Vimeo',
          items: [
            {
              question: 'Как скачать видео с Vimeo?',
              answer:
                'Скопируйте URL страницы видео Vimeo, вставьте его в поле ввода выше, нажмите «Разобрать», затем выберите разрешение и скачайте.'
            },
            {
              question: 'Можно ли выбрать разрешение видео?',
              answer:
                'Да. После разбора вы можете выбрать любое доступное разрешение: 360p, 720p, 1080p и выше, если доступно.'
            },
            {
              question: 'Этот загрузчик Vimeo бесплатный?',
              answer:
                'Да, полностью бесплатный. Скачивайте видео Vimeo в HD качестве без затрат и регистрации.'
            },
            {
              question: 'Нужен ли аккаунт Vimeo для загрузки?',
              answer:
                'Аккаунт не нужен. Вы можете скачать любое публичное видео Vimeo без входа в систему.'
            },
            {
              question: 'В каком формате скачиваются видео?',
              answer:
                'Видео Vimeo скачиваются в формате MP4, который совместим практически со всеми устройствами и плеерами.'
            }
          ]
        },
        crossLinks: {
          title: 'Другие видеозагрузчики',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Скачивайте видео TikTok без водяного знака в HD качестве.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Скачивайте видео и GIF из X/Twitter в HD качестве.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Скачивайте фото, Reels и карусели из Instagram в HD качестве.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Скачивайте видео и фото из Threads в оригинальном качестве.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Скачивайте видео Telegram из каналов и групп в HD качестве.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Скачать фото и видео из Instagram - HD качество | TG Downloader',
          description:
            'Скачивайте фото, Reels и карусели из Instagram в HD качестве бесплатно. Без установки приложений, мгновенное сохранение.',
          keywords:
            'скачать Instagram, скачать фото Instagram, скачать Reels Instagram, скачать карусель Instagram, сохранить видео Instagram, загрузчик Instagram бесплатно'
        },
        workspace: {
          title: 'Скачать фото и видео из Instagram',
          helperText:
            'Вставьте ссылку на публикацию Instagram, чтобы скачать фото, Reels и карусели в HD качестве. Также поддерживает ссылки Telegram, TikTok и X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Почему стоит использовать наш загрузчик Instagram',
          subtitle: 'Сохраняйте фото, Reels и карусели Instagram в оригинальном HD качестве. Полностью бесплатно.',
          items: [
            {
              title: 'Фото и Reels',
              description:
                'Скачивайте фото и видео Reels из Instagram в оригинальном качестве. Получайте именно тот контент, который опубликовал автор.'
            },
            {
              title: 'Скачивание каруселей',
              description:
                'Скачивайте все изображения и видео из карусельных публикаций Instagram за один раз. Не нужно сохранять по одному.'
            },
            {
              title: 'HD оригинальное качество',
              description:
                'Сохраняйте медиа Instagram в максимально доступном разрешении. Без сжатия, без потери качества.'
            }
          ]
        },
        howTo: {
          title: 'Как скачать фото и видео из Instagram',
          subtitle:
            'Три простых шага для сохранения любой публикации Instagram в HD качестве.',
          steps: [
            {
              title: 'Скопируйте ссылку на публикацию Instagram',
              description:
                'Откройте Instagram, нажмите на три точки публикации и выберите «Копировать ссылку».'
            },
            {
              title: 'Вставьте ссылку выше',
              description:
                'Вставьте скопированный URL Instagram в поле ввода и нажмите «Анализировать».'
            },
            {
              title: 'Скачайте в HD',
              description:
                'Нажмите кнопку «Скачать», чтобы сохранить фото, Reels или карусели в оригинальном качестве.'
            }
          ]
        },
        faq: {
          title: 'FAQ загрузчика Instagram',
          items: [
            {
              question: 'Этот загрузчик Instagram действительно бесплатный?',
              answer:
                'Да, полностью бесплатный без скрытых платежей. Скачивайте фото, Reels и карусели Instagram без затрат.'
            },
            {
              question: 'Какие форматы поддерживаются?',
              answer:
                'Мы поддерживаем скачивание фото Instagram (JPG), видео Reels (MP4) и полных карусельных альбомов со всеми медиа.'
            },
            {
              question: 'Какое качество скачанных файлов?',
              answer:
                'Все медиа сохраняются в оригинальном HD разрешении автора, без потери качества или сжатия.'
            },
            {
              question: 'Нужен ли аккаунт Instagram для скачивания?',
              answer:
                'Нет. Пока публикация является публичной, вы можете скачать её медиа без входа в аккаунт.'
            },
            {
              question: 'Можно ли скачать Stories из Instagram?',
              answer:
                'В настоящее время мы поддерживаем публикации, Reels и карусели. Скачивание Stories требует, чтобы контент был публично доступен по прямой ссылке.'
            }
          ]
        },
        crossLinks: {
          title: 'Другие видео-загрузчики',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Скачивайте видео TikTok без водяного знака в HD качестве.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Скачивайте видео и GIF из X/Twitter в HD качестве.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Скачивайте видео Vimeo в HD с выбором разрешения.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Скачивайте видео и фото из Threads в оригинальном качестве.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Скачивайте видео из каналов и групп Telegram в HD качестве.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Скачать видео и фото из Threads - Оригинальное качество | TG Downloader',
          description:
            'Скачивайте видео и фото из Threads в оригинальном качестве бесплатно. Без установки приложений, сохраняйте медиа включая карусели.',
          keywords:
            'скачать Threads, скачать видео Threads, загрузить видео Threads, скачать медиа Threads, сохранить видео Threads, загрузчик Threads бесплатно'
        },
        workspace: {
          title: 'Скачать видео и фото из Threads',
          helperText:
            'Вставьте ссылку на публикацию Threads, чтобы скачать видео и фото в оригинальном качестве. Также поддерживает ссылки Telegram, TikTok и Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Почему стоит использовать наш загрузчик Threads',
          subtitle: 'Сохраняйте видео и фото Threads в оригинальном качестве. Полностью бесплатно.',
          items: [
            {
              title: 'Смешанные медиа',
              description:
                'Скачивайте видео и фото из публикаций Threads. Поддержка публикаций с несколькими типами контента.'
            },
            {
              title: 'Оригинальное качество',
              description:
                'Сохраняйте медиа Threads в максимально доступном разрешении. Без сжатия, без потери качества.'
            },
            {
              title: 'Поддержка каруселей',
              description:
                'Скачивайте все медиа из карусельных публикаций Threads за один раз. Получите каждое фото и видео за одну операцию.'
            }
          ]
        },
        howTo: {
          title: 'Как скачать видео и фото из Threads',
          subtitle:
            'Три простых шага для сохранения любой публикации Threads в оригинальном качестве.',
          steps: [
            {
              title: 'Скопируйте ссылку на публикацию Threads',
              description:
                'Откройте Threads, нажмите на иконку «Поделиться» публикации и выберите «Копировать ссылку».'
            },
            {
              title: 'Вставьте ссылку выше',
              description:
                'Вставьте скопированный URL Threads в поле ввода и нажмите «Анализировать».'
            },
            {
              title: 'Скачайте медиа',
              description:
                'Нажмите кнопку «Скачать», чтобы сохранить видео и фото в оригинальном качестве.'
            }
          ]
        },
        faq: {
          title: 'FAQ загрузчика Threads',
          items: [
            {
              question: 'Этот загрузчик Threads действительно бесплатный?',
              answer:
                'Да, полностью бесплатный без скрытых платежей. Скачивайте видео и фото из Threads без затрат.'
            },
            {
              question: 'Какие типы медиа поддерживаются?',
              answer:
                'Мы поддерживаем скачивание видео, фото и публикаций со смешанными медиа из Threads, включая карусели с несколькими элементами.'
            },
            {
              question: 'Какое качество скачанных файлов?',
              answer:
                'Все медиа сохраняются в оригинальном разрешении автора, без потери качества.'
            },
            {
              question: 'Нужен ли аккаунт Threads для скачивания?',
              answer:
                'Нет. Пока публикация является публичной, вы можете скачать её медиа без входа в аккаунт.'
            },
            {
              question: 'Можно ли скачать карусельные публикации с несколькими фото?',
              answer:
                'Да, наш загрузчик полностью поддерживает карусельные публикации Threads. Все фото и видео в карусели доступны для скачивания.'
            }
          ]
        },
        crossLinks: {
          title: 'Другие видео-загрузчики',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Скачивайте видео TikTok без водяного знака в HD качестве.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Скачивайте видео и GIF из X/Twitter в HD качестве.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Скачивайте видео Vimeo в HD с выбором разрешения.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Скачивайте фото, Reels и карусели из Instagram в HD качестве.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Скачивайте видео из каналов и групп Telegram в HD качестве.'
            }
          ]
        }
      }
    }
  }
}
