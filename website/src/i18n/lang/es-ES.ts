import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { esESPricingContent } from '../pricing'

export const esES: SiteContent = {
  site: {
    name: 'Descarga de videos de Telegram | TG Downloader',
    description:
      'Usa TG Downloader para la descarga de videos de Telegram en Telegram Web, guarda archivos y medios cargados y sigue con la extensión en cada canal privado de Telegram.',
    keywords:
      'descarga de videos de Telegram, descarga de medios de Telegram, guardar videos de Telegram, descarga de archivos de Telegram, canal privado de Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Descargador',
      home: 'Inicio',
      pricing: 'Precios',
      solutions: 'Solución',
      changelog: 'Cambios'
    },
    footer: {
      resources: 'Recursos',
      rights: '© 2026 TG Downloader. Todos los derechos reservados.'
    }
  },
  common: {
    installCta: 'Instalar Ahora'
  },
  sections: {
    features: {
      title: 'Funciones de descarga de medios de Telegram',
      subtitle:
        'Estas funciones de descarga de medios de Telegram cubren archivos, imágenes, videos, lotes grandes y contenido ya cargado en Telegram Web.',
      metaDescription:
        'Funciones de TG Downloader: guardado por lotes de varios archivos, soporte de canales privados, descarga de archivos grandes de más de 1GB, detección de medios en tiempo real y diseño centrado en la privacidad sin necesidad de iniciar sesión.',
      items: [
        {
          title: 'Descarga Por Lotes',
          description:
            'Admite descarga por lotes con selección múltiple, descarga todos los archivos de medios de un canal o grupo con un clic',
          details: [
            'Soporte de descarga por lotes con selección múltiple',
            'Descarga canal/grupo completo con un clic',
            'Filtrado inteligente por tipo de archivo',
            'Gestión de cola de descargas'
          ]
        },
        {
          title: 'Contenido Restringido',
          description:
            'Descarga medios de canales restringidos y grupos privados incluso sin permiso',
          details: [
            'Acceso a contenido de canales restringidos',
            'Descarga desde grupos privados',
            'Sin verificación de permisos requerida',
            'Funciona con versiones A/K'
          ]
        },
        {
          title: 'Soporte Multi-Formato',
          description: 'Admite imágenes, videos, GIFs, audio y otros formatos de medios',
          details: [
            'Imágenes: JPG, PNG, WEBP, GIF',
            'Videos: MP4, WEBM, MOV',
            'Archivos de audio: MP3, M4A, OGG',
            'Detección automática de formato'
          ]
        },
        {
          title: 'Seguro y Protegido',
          description:
            'No se requiere contraseña o inicio de sesión API, no se recopilan datos de usuario',
          details: [
            'No se requiere contraseña o inicio de sesión API',
            'No se recopilan datos de usuario',
            'Sin virus ni anuncios',
            'Pruebas de seguridad rigurosas'
          ]
        },
        {
          title: 'Soporte de Archivos Grandes',
          description: 'Descarga estable de archivos de más de 1GB con soporte de reanudación',
          details: [
            'Descarga estable de archivos de más de 1GB',
            'Soporte de reanudación para descargas interrumpidas',
            'Transferencia rápida y estable',
            'Seguimiento de progreso'
          ]
        },
        {
          title: 'Detección en Tiempo Real',
          description:
            'Escanea y detecta automáticamente recursos de medios, actualiza la lista de descargas en tiempo real',
          details: [
            'Escaneo automático de recursos multimedia de la página',
            'Detección de recursos en tiempo real',
            'Actualizaciones automáticas de la lista',
            'Caché inteligente de recursos'
          ]
        }
      ]
    },
    steps: {
      title: 'Guía para guardar videos de Telegram',
      subtitle:
        'Sigue esta guía para guardar videos de Telegram, abre el mensaje en Telegram Web y conserva videos u otros medios con pocos pasos.',
      metaDescription:
        'Guía paso a paso para guardar videos, archivos y álbumes de Telegram con TG Downloader. Aprende a instalar la extensión, detectar medios en Telegram Web y descargar contenido por lotes.',
      items: [
        {
          title: 'Instalar Extensión',
          description:
            'Busque e instale TG Downloader desde su tienda de extensiones de navegador'
        },
        {
          title: 'Fijar Extensión',
          description:
            'Haga clic en la barra de herramientas del navegador para fijar el icono de la extensión para acceso rápido'
        },
        {
          title: 'Abrir Telegram Web',
          description:
            'Visite web.telegram.org, la extensión comenzará automáticamente a escanear recursos de medios'
        },
        {
          title: 'Descarga Por Lotes',
          description:
            'Seleccione los archivos para descargar y haga clic en el botón de descarga para guardarlos localmente'
        }
      ]
    },
    cta: {
      title: '¿Listo Para Comenzar?',
      description: 'Instale la extensión y comience a descargar medios de Telegram ahora.'
    },
    techSpecs: {
      title: 'Especificaciones Técnicas',
      browsersLabel: 'Navegadores',
      browsers: 'Chrome, Edge, Brave y todos los navegadores basados en Chromium',
      telegramVersionsLabel: 'Versiones de Telegram',
      telegramVersions: 'Versión Web K y versión A',
      permissionsLabel: 'Permisos',
      permissions: 'Permisos mínimos requeridos',
      updatesLabel: 'Actualizaciones',
      updates: 'Actualizaciones automáticas desde la tienda de extensiones'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Descargar Medios de Telegram de Canales Privados y Restringidos',
        description:
          'Un clic, sin inicio de sesión, compatible con archivos de 1GB+. Descarga por lotes de canales privados y contenido restringido.'
      },
      stats: {
        users: 'Usuarios en todo el mundo',
        downloads: 'Descargas Totales'
      },
      seo: {
        title: 'Descargador de videos privados de Telegram: descarga cualquier contenido privado',
        description:
          'Guarda videos de canales privados de Telegram con una guía de descarga sencilla. Descarga videos y medios accesibles, soluciona descargas fallidas y encuentra el método adecuado para tu dispositivo.',
        keywords:
          'descargador de videos privados de Telegram, descargador de videos de canal privado de Telegram, descargar video privado de Telegram, descargador de medios privados de Telegram'
      },
      heroTrustPoints: [
        'Descarga de video en HD',
        'Sin registro',
        'Apto para móviles',
        'Funciona en Windows, Mac, Android e iPhone'
      ],
      situation: {
        title: 'Empieza aquí: ¿qué situación coincide con la tuya?',
        intro:
          'La mayoría de quienes buscan un descargador de videos privados de Telegram intentan resolver uno de estos problemas:',
        headers: ['Tu situación', 'Prueba esto primero'],
        rows: [
          {
            cells: [
              'Tienes un enlace de video de Telegram de un canal o chat',
              'Pega el enlace en un descargador de videos de Telegram en línea'
            ]
          },
          {
            cells: [
              'Puedes ver el video en un canal privado pero no puedes guardarlo',
              'Prueba la opción Save Video As de Telegram Desktop'
            ]
          },
          {
            cells: [
              'El video se reproduce, pero la descarga y el reenvío están bloqueados',
              'Usa la grabación de pantalla solo si tienes permiso para conservar una copia'
            ]
          },
          {
            cells: [
              'El descargador dice que no se encontró ningún video',
              'Revisa el acceso, el tipo de enlace, las restricciones del canal y si el video se abre fuera de Telegram'
            ]
          }
        ]
      },
      solutions: {
        title: '¿Qué funciona para los videos privados de Telegram?',
        intro:
          'Un video privado de Telegram suele ser un video compartido en un canal privado, un grupo privado o un chat directo. Estos videos solo son visibles para los miembros aprobados, por lo que descargarlos es distinto a guardar medios de un canal público.',
        quickAnswer:
          'Respuesta rápida: si el enlace es accesible, usa un descargador de videos privados de Telegram en línea. Si el video solo es visible dentro de Telegram, prueba Telegram Desktop. Si guardar está bloqueado pero tienes permiso para conservar el contenido, la grabación de pantalla puede ser la alternativa práctica.',
        items: [
          {
            title: 'Solución 1: descargador de videos de Telegram en línea',
            description:
              'Ideal para enlaces de Telegram accesibles. Es el método más sencillo para quienes quieren descargar videos de Telegram en línea sin instalar una app, extensión o bot.',
            useWhenLabel: 'Usa este método cuando:',
            useWhen: [
              'El enlace del video de Telegram es público o accesible.',
              'Quieres descargar videos de Telegram en línea.',
              'Necesitas un archivo de video en HD rápido.',
              'No quieres instalar una extensión de navegador ni una app de escritorio.'
            ]
          },
          {
            title: 'Solución 2: Save Video As de Telegram Desktop',
            description:
              'Cuando el video está disponible en Telegram Desktop y las descargas están permitidas, haz clic derecho en el video y guárdalo en una carpeta de tu computadora. Esto suele funcionar mejor para los miembros de canales privados porque ya estás autenticado dentro de Telegram.',
            useWhenLabel: 'Usa este método cuando:',
            useWhen: [
              'Puedes ver el video en Telegram Desktop.',
              'El propietario del canal no ha desactivado el guardado.',
              'Prefieres descargar directamente a Windows o Mac.'
            ]
          },
          {
            title: 'Solución 3: grabación de pantalla en móvil o escritorio',
            description:
              'Si la opción de descarga está desactivada pero tienes permiso para ver y conservar el contenido, un grabador de pantalla puede capturar el video y el audio mientras se reproduce. Es una alternativa, no el primer método, porque lleva más tiempo y depende de la calidad de reproducción.',
            useWhenLabel: 'Usa este método cuando:',
            useWhen: [
              'Tienes permiso para ver y conservar el video.',
              'El enlace de Telegram no puede ser analizado por un descargador.',
              'Necesitas una copia personal sin conexión como referencia.'
            ]
          },
          {
            title: 'Solución 4: revisión del gestor de archivos de Android',
            description:
              'En algunos casos de Android, Telegram puede almacenar temporalmente los medios cargados en carpetas locales de la app. Un gestor de archivos a veces puede ayudarte a encontrar videos que ya se cargaron en el dispositivo, pero esto depende de la versión de la app, los permisos de almacenamiento y el comportamiento de la caché.',
            useWhenLabel: 'Usa este método cuando:',
            useWhen: [
              'Ya reprodujiste el video en Telegram en Android.',
              'Entiendes los permisos de almacenamiento de las apps.',
              'Solo necesitas recuperar un archivo que ya está en la caché de tu dispositivo.'
            ]
          }
        ]
      },
      benefits: {
        title: '¿Por qué usar un descargador de videos de Telegram en línea?',
        intro:
          'Un buen descargador debería ayudarte a responder una pregunta rápidamente: ¿se puede guardar este video de Telegram a partir del enlace que tengo? La mejor experiencia es directa, clara y honesta cuando un enlace privado no se puede procesar.',
        items: [
          {
            title: 'Guarda videos en alta calidad',
            description:
              'Conserva los videos de Telegram en la mejor calidad disponible para reproducción sin conexión, estudio, formación, archivo o referencia personal.'
          },
          {
            title: 'Funciona en todos los dispositivos',
            description:
              'Usa el descargador desde un navegador en Android, iPhone, Windows, Mac o tablet. Esto importa cuando el video está en tu teléfono pero quieres guardarlo en otro dispositivo.'
          },
          {
            title: 'No requiere iniciar sesión en Telegram',
            description:
              'Elige herramientas que procesen el enlace de un video sin pedir tu contraseña de Telegram, código de verificación, archivo de sesión ni credenciales de cuenta privada.'
          },
          {
            title: 'Reproducción sin conexión sencilla',
            description:
              'Descarga archivos en formatos de video comunes cuando estén disponibles, para que puedas verlos más tarde sin abrir Telegram ni usar datos móviles.'
          },
          {
            title: 'Proceso rápido basado en enlaces',
            description:
              'Copia, pega, analiza y descarga. Si el enlace falla, la página debería explicar por qué y decirte qué intentar a continuación.'
          },
          {
            title: 'Límite de permisos claro',
            description:
              'Descarga solo los videos a los que tengas derecho de acceder y guardar. Respeta las reglas del canal, los derechos de los creadores y las políticas de Telegram.'
          },
          {
            title: 'Descargar videos privados de Telegram en el celular',
            description:
              'En el celular, pega un enlace accesible. Si el video privado solo puede verse en tu cuenta, ábrelo en Telegram Web desde un navegador de escritorio y usa la extensión.'
          },
          {
            title: 'Descargar historias y estados de Telegram por enlace',
            description:
              'Pega el enlace de una historia o estado accesible para guardar su foto o video. Si el contenido solo aparece en tu sesión de Telegram Web, ábrelo allí y usa la extensión.'
          },
          {
            title: 'Descargar archivos, fotos e imágenes de Telegram con un enlace',
            description:
              'Pega un enlace accesible para descargar archivos, fotos e imágenes de Telegram, incluidos los adjuntos separados de una misma publicación.'
          }
        ]
      },
      troubleshooting: {
        title: 'Si el enlace del video de Telegram no funciona',
        intro:
          'No todo enlace fallido significa que el descargador esté roto. Los videos privados de Telegram suelen fallar porque el archivo no está disponible fuera de Telegram. Prueba esta lista de comprobación:',
        items: [
          'Abre el enlace en un navegador y confirma que carga.',
          'Asegúrate de seguir siendo miembro del canal o grupo privado.',
          'Comprueba si el propietario del canal ha desactivado el guardado, la copia o el reenvío.',
          'Prueba Telegram Desktop si el video solo se reproduce dentro de la app.',
          'Usa un navegador o una red distintos si la página no puede conectarse con Telegram.',
          'Evita cualquier herramienta que te pida tu código de inicio de sesión de Telegram.'
        ]
      },
      permission: {
        title: 'Nota importante sobre permisos',
        note:
          'Un descargador de videos privados de Telegram no debe usarse para eludir restricciones de privacidad, derechos de autor o acceso. Guarda videos solo cuando tengas permiso del propietario o cuando tu uso esté permitido por la ley y los términos de Telegram.'
      },
      comparison: {
        title: 'Elige el método de descarga de Telegram adecuado',
        headers: ['Situación', 'Solución recomendada', 'Ideal para', 'Qué comprobar'],
        rows: [
          {
            cells: [
              'Enlace de video de Telegram público o accesible',
              'Descargador de videos de Telegram en línea',
              'Descarga rápida en HD sin una app',
              'El enlace se abre y la herramienta puede alcanzar el video'
            ]
          },
          {
            cells: [
              'Video de canal privado con descarga permitida',
              'Save Video As de Telegram Desktop',
              'Guardar directamente en una computadora',
              'Eres miembro y el propietario no ha desactivado el guardado'
            ]
          },
          {
            cells: [
              'Guardado restringido pero reproducción visible',
              'Grabador de pantalla integrado o de terceros',
              'Referencia personal sin conexión con permiso',
              'Captura de audio, área de pantalla y leyes locales o reglas de la plataforma'
            ]
          },
          {
            cells: [
              'Medios en caché de Android',
              'Revisión del gestor de archivos',
              'Encontrar medios ya cargados en el dispositivo',
              'Acceso al almacenamiento de la app y si Telegram mantiene una caché local'
            ]
          }
        ]
      },
      howTo: {
        title: 'Cómo descargar videos de Telegram en 3 pasos',
        subtitle:
          'La vía más rápida es un descargador de videos de Telegram basado en enlaces. Funciona mejor cuando el enlace del video de Telegram es público, accesible o legible fuera de la app de Telegram.',
        steps: [
          {
            title: 'Copia el enlace del video',
            description:
              'Abre Telegram, busca el video que quieres guardar y copia el enlace del mensaje o del video desde el menú de compartir. Si el canal no permite copiar enlaces, pasa a las soluciones de canal privado de abajo.'
          },
          {
            title: 'Pega y analiza',
            description:
              'Pega el enlace de Telegram en el campo del descargador. La herramienta comprueba si se puede alcanzar un archivo de video descargable desde ese enlace.'
          },
          {
            title: 'Descarga en HD',
            description:
              'Elige la calidad o el formato disponible y luego guarda el video de Telegram directamente en tu teléfono, tablet o computadora. Si no aparece ningún archivo, el enlace probablemente esté restringido y no roto.'
          }
        ]
      },
      faq: {
        title: 'Preguntas Frecuentes',
        description: 'Las preguntas que la gente hace antes de descargar un video o un archivo de Telegram en Telegram Web.',
        items: [
          {
            question: '¿Puedo descargar videos privados de Telegram?',
            answer:
              'Solo puedes descargar o guardar videos privados de Telegram cuando tienes permiso para acceder a ellos y la fuente del video está disponible. Algunos canales privados bloquean el guardado, el reenvío, la copia de enlaces o el acceso externo.'
          },
          {
            question: '¿Cómo descargo videos de canales privados de Telegram?',
            answer:
              'Prueba primero el descargador basado en enlaces si tienes un enlace de video de Telegram utilizable. Si eso no funciona, busca la opción Save Video As en Telegram Desktop. Si las descargas están bloqueadas pero tienes permiso para conservar el contenido, la grabación de pantalla puede ser la alternativa.'
          },
          {
            question: '¿Por qué el descargador de videos de Telegram dice que no se encontró ningún video?',
            answer:
              'El enlace puede estar restringido, eliminado, caducado, visible solo dentro de Telegram o bloqueado por el propietario del canal. Abre el enlace tú mismo primero y confirma que el video aún se reproduce. Si solo funciona después de iniciar sesión en Telegram, es posible que un descargador en línea no pueda acceder a él.'
          },
          {
            question: '¿Necesito instalar software?',
            answer:
              'No para los enlaces accesibles. Un descargador de videos de Telegram en línea funciona en un navegador. Es posible que necesites Telegram Desktop, un gestor de archivos o un grabador de pantalla para casos privados o restringidos específicos.'
          },
          {
            question: '¿Puedo descargar videos de Telegram sin un enlace?',
            answer:
              'Normalmente no. Los descargadores en línea necesitan un enlace de video de Telegram para localizar el archivo. Si no puedes copiar un enlace pero puedes ver el video en Telegram, usa Telegram Desktop u otro método local permitido.'
          },
          {
            question: '¿Es seguro introducir mi código de inicio de sesión de Telegram en un descargador?',
            answer:
              'No. Un descargador no debería necesitar tu contraseña de Telegram, código de verificación ni credenciales de sesión. Si un sitio te los pide, abandona la página.'
          },
          {
            question: '¿Es gratis un descargador de medios de Telegram?',
            answer:
              'Muchos descargadores de medios de Telegram basados en enlaces son gratuitos para las descargas básicas. Evita las herramientas que fuercen instalaciones sospechosas, solicitudes de inicio de sesión o botones engañosos.'
          },
          {
            question: '¿Es legal descargar videos de Telegram?',
            answer:
              'Depende del contenido, de tu permiso y del uso que pretendas darle. No descargues ni redistribuyas contenido con derechos de autor, privado o restringido sin autorización.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Acceso web',
          title: 'Inicia sesión para sincronizar tus créditos',
          signedInAs: 'Sesión iniciada como',
          continueWithGoogle: 'Continuar con Google',
          googleLoading: 'Abriendo Google...',
          or: 'o',
          emailLabel: 'Correo electrónico',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Continuar con email',
          sendCode: 'Enviar código',
          sendingCode: 'Enviando...',
          sendCodeSuccess: 'Código de verificación enviado.',
          sendAgain: 'Enviar de nuevo',
          codeLabel: 'Código de verificación',
          codePlaceholder: '123456',
          signIn: 'Iniciar sesión',
          termsNotice: 'Al iniciar sesión aceptas los',
          termsLink: 'Términos',
          privacyLink: 'Política de privacidad',
          logout: 'Cerrar sesión',
          creditsLabel: 'créditos'
        },
        quota: {
          eyebrow: 'Cuota web',
          title: 'Saldo actual de créditos',
          planLabel: 'Plan',
          remainingLabel: 'Restante',
          dailyLimitLabel: 'Límite diario',
          unlimited: 'Ilimitado'
        },
        checkin: {
          creditsLoading: 'Créditos',
          creditsButtonLabel: 'Abrir check-in diario',
          accountButtonLabel: 'Abrir menú de cuenta',
          accountMenuLabel: 'Menú de cuenta',
          title: 'Tus créditos gratis de hoy están listos',
          todayRewardText: 'Recompensa de hoy: {credits} créditos',
          claimedRewardText: 'Hoy reclamaste {credits} créditos.',
          nextCountdown: 'Próxima reclamación en {time}',
          nextAt: '(Próxima actualización: {time} EST)',
          claimButton: 'Reclamar {credits} créditos',
          claimingButton: 'Reclamando...',
          notNow: 'Ahora no',
          close: 'Cerrar',
          loadFailed: 'No se pudo cargar el estado del check-in.',
          claimFailed: 'No se pudieron reclamar los créditos.'
        },
        creditPurchase: {
          title: 'Comprar créditos',
          description: 'Agrega créditos y continúa descargando desde este espacio de trabajo.',
          successTitle: 'Créditos agregados',
          successDescription: 'Tu saldo se actualizó. Cierra esta ventana e inicia la descarga de nuevo.',
          packageEyebrow: 'Paga según uses',
          cardNote: 'Usa créditos para descargas web. Los créditos no caducan.',
          creditsAmount: '{credits} créditos',
          buyNow: 'Comprar ahora',
          selectPackage: 'Seleccionar',
          paymentMethodLabel: 'Elige método de pago',
          paymentTitle: 'Elige método de pago',
          selectedPackageLabel: 'Producto seleccionado',
          confirmPurchase: 'Continuar al pago',
          backToProducts: 'Volver',
          close: 'Cerrar',
          agreementText: 'Acepto los términos de compra, los Términos y la Política de privacidad.',
          loadingConfigs: 'Cargando paquetes de créditos...',
          loadFailed: 'No se pudieron cargar los paquetes de créditos. Inténtalo de nuevo.',
          noConfigs: 'No hay paquetes de créditos disponibles ahora. Inténtalo más tarde.',
          ready: 'Elige un paquete de créditos. Los precios se muestran en USD.',
          creatingOrder: 'Creando pedido...',
          pendingPayment: 'Completa el pago en la pestaña recién abierta. Revisaremos el resultado automáticamente.',
          pendingPaymentTitle: 'Esperando pago',
          cancelPayment: 'Cancelar pago',
          supportMailPrefix: 'Reportar un problema: ',
          success: 'Pago completo. Los créditos ya están disponibles.',
          failed: 'El pago no está completo. Puedes reintentar o cerrar esta ventana.',
          successCredits: '+{credits} créditos agregados',
          successBalance: 'Saldo actual: {balance} créditos',
          createFailed: 'No se pudo crear el pedido. Inténtalo de nuevo.',
          invalidPaymentData: 'El enlace de pago no es válido. Inténtalo más tarde.',
          priceUpdated: 'El precio cambió. Revisa el precio actualizado y vuelve a comprar.',
          gatewayFailed: 'La entrada de pago no está disponible temporalmente. Inténtalo más tarde.',
          paymentCanceled: 'El pago fue cancelado. Elige un método de pago e inténtalo otra vez.',
          pollFailed: 'No se pudo actualizar el estado del pago. Inténtalo de nuevo.',
          pollTimeout: 'La actualización automática agotó el tiempo. Actualiza el resultado después del pago.',
          orderNotFound: 'El pedido ya no está disponible. Crea uno nuevo.',
          orderExpired: 'El pedido caducó. Compra de nuevo.',
          fulfillmentFailed: 'Recibimos el pago, pero los créditos aún no se agregaron. Reintenta más tarde.',
          authExpired: 'La sesión caducó. Inicia sesión de nuevo para continuar.'
        },
        parse: {
          eyebrow: 'Análisis directo',
          title: 'Descargador de videos privados de Telegram: descarga cualquier contenido privado',
          helperText:
            'Guarda videos de canales privados de Telegram con una guía de descarga sencilla. Descarga videos y medios accesibles, soluciona descargas fallidas y encuentra el método adecuado para tu dispositivo.',
          telegramMessageListLinkError:
            'Este enlace de Telegram abre un chat o canal, no un mensaje específico. Copia el enlace exacto del mensaje y pégalo aquí.',
          linkLabel: 'Enlace de Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Borrar entrada',
          submit: 'Pega el enlace del video de Telegram',
          submitting: 'Analizando...',
          noResults: 'No se encontraron archivos descargables en este mensaje.',
          download: 'Descargar',
          downloading: 'Descargando...',
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
          largeFileExtensionInlineChromeTitle: 'Extensión de Chrome',
          largeFileExtensionInlineChromeDescription:
            'Extensión dedicada para Chrome que detecta contenido multimedia de Telegram con un clic.',
          largeFileExtensionInlineChromeCta: 'Instalar extensión',
          largeFileExtensionInlineEdgeTitle: 'Extensión de Edge',
          largeFileExtensionInlineEdgeDescription:
            'Extensión dedicada para Microsoft Edge, compatible con descargas de contenido de Telegram.',
          largeFileExtensionInlineEdgeCta: 'Instalar extensión'
        },
        errors: {
          enterEmailFirst: 'Primero introduce tu correo electrónico.',
          enterEmailAndCode: 'Introduce el correo electrónico y el código de verificación.',
          sendCodeFailed: 'No se pudo enviar el código de verificación.',
          googleSignInFailed: 'No se pudo iniciar sesión con Google.',
          googleClientMissing: 'El inicio de sesión con Google no está configurado.',
          restoreSessionFailed: 'No se pudo restaurar la sesión.',
          signInFailed: 'No se pudo iniciar sesión.',
          logoutFailed: 'No se pudo cerrar la sesión.',
          loadQuotaFailed: 'No se pudieron cargar los créditos.',
          enterLink: 'Introduce un enlace multimedia.',
          invalidLink: 'Esta no es una URL válida.',
          parseFailed: 'No se pudo analizar este enlace.',
          downloadFailed: 'No se pudo descargar este archivo.',
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
          xParseFailed: 'Este enlace de X no es compatible. Usa un estado público con video.',
          instagramParseFailed: 'Este enlace de Instagram no es compatible. Usa una publicación pública.',
          instagramImageParseFailed: 'Este enlace de Instagram no es compatible. Usa una publicación pública con fotos.',
          threadsParseFailed: 'Este enlace de Threads no es compatible. Usa una publicación pública.',
          redditParseFailed: 'No se pudo obtener el contenido de Reddit. Usa una publicación pública con video, imagen o galería.',
          douyinParseFailed: 'No se pudo obtener este video de Douyin. Usa un enlace de video público.',
          quotaExceeded: 'No tienes créditos suficientes para descargar este archivo.',
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
        title: 'Más descargadores de video',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Descarga videos de TikTok sin marca de agua en calidad HD.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Descarga videos y GIFs de X/Twitter en calidad HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Descarga videos de Vimeo en HD con múltiples opciones de resolución.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Descarga fotos, Reels y carruseles de Instagram en calidad HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Descarga videos y fotos de Threads en calidad original.'
          }
        ]
      }
    },
    changelog: {
      title: 'Registro de descarga de videos de Telegram',
      description:
        'Sigue cada actualización sobre descarga de videos de Telegram, flujo web y guardados más largos.',
      seoTitle: 'Registro de descarga de videos de Telegram | TG Downloader',
      seoDescription:
        'Consulta este registro de descarga de videos de Telegram para ver cambios en el flujo web, archivos grandes y cada versión reciente.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Mejora de Rendimiento',
          description:
            'Mejoras significativas de rendimiento para una mejor experiencia del usuario.',
          features: [
            'Velocidad de detección de recursos mejorada en 50%',
            'Estabilidad de descarga de archivos grande optimizada',
            'Capacidad de respuesta de la UI mejorada'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Soporte Multilingüe',
          description: 'Soporte añadido para 14 idiomas en todo el mundo.',
          features: [
            'Añadido soporte para japonés, coreano y más idiomas',
            'Precisión de traducción mejorada',
            'Añadida detección automática de idioma'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Descarga en Barra Lateral',
          description: 'Nueva función de descarga en barra lateral con soporte por lotes.',
          features: [
            'Añadida descarga de archivo único en barra lateral',
            'Añadida funcionalidad de descarga por lotes',
            'Gestión de cola de descargas mejorada'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Seguridad y Privacidad',
          description: 'Mejoras de seguridad y privacidad mejoradas.',
          features: [
            'Eliminado todo el seguimiento de análisis',
            'Añadido modo de procesamiento solo local',
            'Cifrado de datos mejorado'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Lanzamiento Inicial',
          description: 'Primer lanzamiento con soporte de descarga en ventana de chat.',
          features: [
            'Funcionalidad de descarga en ventana de chat',
            'Soporte para versiones Web K y A de Telegram',
            'Soporte de formato de medios básico'
          ]
        }
      ],
      labels: {
        features: 'Nuevas funciones',
        fixes: 'Correcciones de errores'
      }
    } as SiteContent['pages']['changelog'] & {
      seoTitle: string
      seoDescription: string
    },
    pricing: esESPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['es-ES'],
    extensionLoginV2: {
      title: 'Inicio de sesión de la extensión | TG Downloader',
      description:
        'Inicie sesión en TG Downloader y sincronice su sesión del sitio web con la extensión del navegador.',
      eyebrow: 'Extensión del navegador',
      heading: 'Inicie sesión en TG Downloader',
      checkingState: 'Comprobando sesión',
      signInRequiredState: 'Se requiere iniciar sesión',
      syncedState: 'Sesión iniciada',
      verificationFailedState: 'Error de verificación',
      preparingTitle: 'Preparando el inicio de sesión…',
      preparingText: 'TG Downloader está preparando la comprobación de la sesión del sitio web.',
      checkingSessionTitle: 'Comprobando la sesión del sitio web…',
      checkingSessionText:
        'TG Downloader está verificando el token del sitio web guardado en este navegador.',
      finishingGoogleTitle: 'Finalizando el inicio de sesión con Google…',
      finishingGoogleText:
        'TG Downloader está canjeando el resultado del inicio de sesión con Google por una sesión del sitio web.',
      signInRequiredTitle: 'Inicie sesión para continuar',
      signInRequiredText: 'Use la misma ventana de inicio de sesión de TG Downloader que en el sitio web.',
      signInButtonLabel: 'Iniciar sesión',
      syncingTitle: 'Sincronizando el token de la extensión…',
      syncingText:
        'TG Downloader está canjeando su sesión del sitio web por un token de extensión.',
      syncedTitle: 'Inicio de sesión correcto',
      syncedText:
        'La extensión está conectada a su cuenta de TG Downloader. Haga clic en Volver a Telegram para regresar.',
      returnButtonLabel: 'Volver a Telegram',
      returningButtonLabel: 'Volviendo…',
      verificationFailedTitle: 'No se pudo completar el inicio de sesión de la extensión',
      retryButtonLabel: 'Reintentar',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Descargar Videos de TikTok Sin Marca de Agua - Calidad HD | TG Downloader',
          description:
            'Descarga videos de TikTok sin marca de agua en calidad HD gratis. Sin instalar apps. Guarda videos, presentaciones e historias de TikTok al instante.',
          keywords:
            'descargar tiktok, descargar video tiktok, tiktok sin marca de agua, descargar tiktok hd, guardar video tiktok, descargar tiktok gratis'
        },
        workspace: {
          title: 'Descargar Videos de TikTok Sin Marca de Agua',
          helperText:
            'Pega cualquier enlace de video de TikTok para descargar sin marca de agua en calidad HD. También soporta enlaces de Telegram, X y Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Por qué usar nuestro descargador de TikTok',
          subtitle: 'Guarda videos de TikTok en la más alta calidad sin marcas de agua, completamente gratis.',
          items: [
            {
              title: 'Sin marca de agua',
              description:
                'Descarga videos de TikTok sin la marca de agua superpuesta. Obtén videos limpios en calidad original listos para guardar o compartir.'
            },
            {
              title: 'Calidad HD',
              description:
                'Guarda videos de TikTok en su resolución HD original. Sin pérdida de calidad, sin compresión: exactamente como lo subió el creador.'
            },
            {
              title: 'Rápido y gratis',
              description:
                'Sin instalar apps, sin registro, sin cargos ocultos. Pega el enlace y obtén tu video. Funciona al instante en cualquier navegador.'
            }
          ]
        },
        howTo: {
          title: 'Cómo descargar videos de TikTok sin marca de agua',
          subtitle:
            'Tres pasos sencillos para guardar cualquier video de TikTok en calidad HD sin marca de agua.',
          steps: [
            {
              title: 'Copia el enlace del video de TikTok',
              description:
                'Abre TikTok, toca el botón Compartir en el video y selecciona "Copiar enlace".'
            },
            {
              title: 'Pega el enlace arriba',
              description:
                'Pega la URL de TikTok copiada en el campo de entrada y haz clic en Analizar.'
            },
            {
              title: 'Descarga sin marca de agua',
              description:
                'Haz clic en el botón Descargar para guardar el video de TikTok en HD sin marca de agua.'
            }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes del descargador de TikTok',
          items: [
            {
              question: '¿Este descargador de TikTok es realmente gratis?',
              answer:
                'Sí, completamente gratis sin cargos ocultos. Puedes descargar videos de TikTok sin marca de agua sin ningún costo.'
            },
            {
              question: '¿El video descargado tendrá marca de agua?',
              answer:
                'No. Nuestro descargador elimina la marca de agua de TikTok y entrega el video original limpio en calidad HD.'
            },
            {
              question: '¿En qué calidad se descargan los videos de TikTok?',
              answer:
                'Los videos se guardan en su resolución HD original tal como los subió el creador, sin pérdida de calidad.'
            },
            {
              question: '¿Necesito instalar alguna app o extensión?',
              answer:
                'No se necesita instalación. Es una herramienta web que funciona directamente en tu navegador en cualquier dispositivo.'
            },
            {
              question: '¿Puedo descargar historias y presentaciones de TikTok?',
              answer:
                'Sí, nuestro descargador soporta videos de TikTok, presentaciones de fotos e historias. Pega el enlace y descarga.'
            }
          ]
        },
        crossLinks: {
          title: 'Más descargadores de video',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Descarga videos y GIFs de X/Twitter en calidad HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Descarga videos de Vimeo en HD con múltiples opciones de resolución.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Descarga fotos, Reels y carruseles de Instagram en calidad HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Descarga videos y fotos de Threads en calidad original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Descarga videos de Telegram de canales y grupos en calidad HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Descargador de Videos de X (Twitter) - Guardar Videos y GIFs HD | TG Downloader',
          description:
            'Descarga videos y GIFs de X (Twitter) en calidad HD gratis. Sin instalar apps. Guarda cualquier video o GIF de un tweet público al instante.',
          keywords:
            'descargar x, descargar video twitter, descargar video de twitter, descargador x video, descargar gif twitter, guardar video twitter'
        },
        workspace: {
          title: 'Descargador de Videos de X (Twitter)',
          helperText:
            'Pega cualquier enlace de video de X o Twitter para descargar en la mejor calidad. También soporta enlaces de Telegram, TikTok y Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Por qué usar nuestro descargador de videos de X',
          subtitle: 'Guarda videos y GIFs de X/Twitter en su calidad original, completamente gratis.',
          items: [
            {
              title: 'Videos y GIFs',
              description:
                'Descarga videos y GIFs animados de X (Twitter). Obtén exactamente el contenido tal como aparece en el tweet.'
            },
            {
              title: 'Calidad HD original',
              description:
                'Guarda videos de X en la resolución más alta disponible. Sin degradación de calidad: obtén el mismo bitrate que la fuente.'
            },
            {
              title: 'Rápido y gratis',
              description:
                'Sin instalar apps, sin inicio de sesión. Pega la URL del tweet y descarga tu video o GIF en segundos.'
            }
          ]
        },
        howTo: {
          title: 'Cómo descargar videos de X (Twitter)',
          subtitle:
            'Tres pasos sencillos para guardar cualquier video o GIF de X/Twitter.',
          steps: [
            {
              title: 'Copia la URL del tweet',
              description:
                'En X (Twitter), haz clic en el icono Compartir del tweet y selecciona "Copiar enlace".'
            },
            {
              title: 'Pega el enlace arriba',
              description:
                'Pega la URL de X/Twitter copiada en el campo de entrada y haz clic en Analizar.'
            },
            {
              title: 'Descarga el video o GIF',
              description:
                'Haz clic en Descargar para guardar el video o GIF en calidad HD en tu dispositivo.'
            }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes del descargador de videos de X',
          items: [
            {
              question: '¿Cómo descargo un video de X (Twitter)?',
              answer:
                'Copia la URL del tweet que contiene el video, pégala en el campo de entrada arriba y haz clic en Analizar. Luego haz clic en Descargar para guardar el video.'
            },
            {
              question: '¿Puedo descargar GIFs de X?',
              answer:
                'Sí. Nuestro descargador soporta videos y GIFs animados de publicaciones de X/Twitter. Los GIFs se guardan como archivos MP4 para mejor compatibilidad.'
            },
            {
              question: '¿Qué calidad de video está disponible?',
              answer:
                'Entregamos la mejor calidad disponible para cada tweet, generalmente la resolución HD original subida por el autor.'
            },
            {
              question: '¿Este descargador de X es gratis?',
              answer:
                'Sí, completamente gratis sin necesidad de registro. Descarga videos y GIFs de X sin ningún costo.'
            },
            {
              question: '¿Necesito una cuenta de X/Twitter para descargar?',
              answer:
                'No se necesita cuenta. Mientras el tweet sea público, puedes descargar su video o GIF sin iniciar sesión.'
            }
          ]
        },
        crossLinks: {
          title: 'Más descargadores de video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Descarga videos de TikTok sin marca de agua en calidad HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Descarga videos de Vimeo en HD con múltiples opciones de resolución.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Descarga fotos, Reels y carruseles de Instagram en calidad HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Descarga videos y fotos de Threads en calidad original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Descarga videos de Telegram de canales y grupos en calidad HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Descargador de Videos de Vimeo HD - Múltiples Resoluciones | TG Downloader',
          description:
            'Descarga videos de Vimeo en calidad HD con múltiples opciones de resolución gratis. Sin instalar apps. Guarda cualquier video público de Vimeo al instante.',
          keywords:
            'descargar vimeo, descargar video vimeo, descargar vimeo hd, descargador vimeo gratis, guardar video vimeo, vimeo descarga hd'
        },
        workspace: {
          title: 'Descargador de Videos de Vimeo HD',
          helperText:
            'Pega cualquier enlace de video de Vimeo para descargar en calidad HD con selección de resolución. También soporta enlaces de Telegram, TikTok y X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Por qué usar nuestro descargador de Vimeo',
          subtitle: 'Guarda videos de Vimeo en calidad HD con la resolución que prefieras, completamente gratis.',
          items: [
            {
              title: 'Calidad HD original',
              description:
                'Descarga videos de Vimeo en su resolución HD completa. Obtén la misma calidad nítida que subió el creador.'
            },
            {
              title: 'Múltiples resoluciones',
              description:
                'Elige entre las resoluciones disponibles (360p, 720p, 1080p y más). Selecciona la calidad que se ajuste a tus necesidades.'
            },
            {
              title: 'Rápido y gratis',
              description:
                'Sin instalar apps, sin cuenta necesaria. Pega el enlace de Vimeo, selecciona tu resolución y descarga al instante.'
            }
          ]
        },
        howTo: {
          title: 'Cómo descargar videos de Vimeo en HD',
          subtitle:
            'Tres pasos sencillos para guardar cualquier video de Vimeo con tu resolución preferida.',
          steps: [
            {
              title: 'Copia el enlace del video de Vimeo',
              description:
                'Abre la página del video en Vimeo y copia la URL de la barra de direcciones de tu navegador.'
            },
            {
              title: 'Pega el enlace arriba',
              description:
                'Pega la URL de Vimeo copiada en el campo de entrada y haz clic en Analizar.'
            },
            {
              title: 'Elige resolución y descarga',
              description:
                'Selecciona tu resolución de video preferida y haz clic en Descargar para guardar el video en HD.'
            }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes del descargador de Vimeo',
          items: [
            {
              question: '¿Cómo descargo un video de Vimeo?',
              answer:
                'Copia la URL de la página del video de Vimeo, pégala en el campo de entrada arriba, haz clic en Analizar, luego selecciona tu resolución preferida y descarga.'
            },
            {
              question: '¿Puedo elegir la resolución del video?',
              answer:
                'Sí. Después de analizar, puedes elegir entre todas las resoluciones disponibles incluyendo 360p, 720p, 1080p y superiores cuando estén disponibles.'
            },
            {
              question: '¿Este descargador de Vimeo es gratis?',
              answer:
                'Sí, completamente gratis. Descarga videos de Vimeo en calidad HD sin ningún costo ni registro.'
            },
            {
              question: '¿Necesito una cuenta de Vimeo para descargar?',
              answer:
                'No se necesita cuenta. Puedes descargar cualquier video público de Vimeo sin iniciar sesión.'
            },
            {
              question: '¿En qué formato se descargan los videos?',
              answer:
                'Los videos de Vimeo se descargan en formato MP4, que es compatible con prácticamente todos los dispositivos y reproductores.'
            }
          ]
        },
        crossLinks: {
          title: 'Más descargadores de video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Descarga videos de TikTok sin marca de agua en calidad HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Descarga videos y GIFs de X/Twitter en calidad HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Descarga fotos, Reels y carruseles de Instagram en calidad HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Descarga videos y fotos de Threads en calidad original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Descarga videos de Telegram de canales y grupos en calidad HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Descargador de Fotos y Videos de Instagram - Calidad HD | TG Downloader',
          description:
            'Descarga fotos, Reels y carruseles de Instagram en calidad HD gratis. Sin instalar apps, guarda al instante.',
          keywords:
            'descargar Instagram, descargar fotos Instagram, descargar Reels Instagram, descargar carrusel Instagram, guardar video Instagram, descargador Instagram gratis'
        },
        workspace: {
          title: 'Descargador de Fotos y Videos de Instagram',
          helperText:
            'Pega cualquier enlace de publicación de Instagram para descargar fotos, Reels y carruseles en calidad HD. También soporta enlaces de Telegram, TikTok y X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Por qué usar nuestro descargador de Instagram',
          subtitle: 'Guarda fotos, Reels y carruseles de Instagram en calidad HD original. Completamente gratis.',
          items: [
            {
              title: 'Fotos y Reels',
              description:
                'Descarga fotos y videos de Reels de Instagram en calidad original. Obtén exactamente el contenido que publicó el creador.'
            },
            {
              title: 'Descarga de carruseles',
              description:
                'Descarga todas las imágenes y videos de publicaciones de carrusel de Instagram de una vez. Sin necesidad de guardarlos uno por uno.'
            },
            {
              title: 'Calidad HD original',
              description:
                'Guarda medios de Instagram en la resolución más alta disponible. Sin compresión, sin pérdida de calidad.'
            }
          ]
        },
        howTo: {
          title: 'Cómo descargar fotos y videos de Instagram',
          subtitle:
            'Tres simples pasos para guardar cualquier publicación de Instagram en calidad HD.',
          steps: [
            {
              title: 'Copia el enlace de la publicación de Instagram',
              description:
                'Abre Instagram, toca los tres puntos de la publicación y selecciona "Copiar enlace".'
            },
            {
              title: 'Pega el enlace arriba',
              description:
                'Pega la URL de Instagram copiada en el campo de entrada y haz clic en Analizar.'
            },
            {
              title: 'Descarga en HD',
              description:
                'Haz clic en el botón de Descarga para guardar fotos, Reels o carruseles en calidad original.'
            }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes del descargador de Instagram',
          items: [
            {
              question: '¿Este descargador de Instagram es realmente gratis?',
              answer:
                'Sí, completamente gratis sin cargos ocultos. Descarga fotos, Reels y carruseles de Instagram sin costo.'
            },
            {
              question: '¿Qué formatos se soportan?',
              answer:
                'Soportamos la descarga de fotos de Instagram (JPG), videos de Reels (MP4) y álbumes de carrusel completos con todos sus medios.'
            },
            {
              question: '¿Qué calidad tienen los archivos descargados?',
              answer:
                'Todos los medios se guardan en la resolución HD original del creador, sin pérdida de calidad ni compresión.'
            },
            {
              question: '¿Necesito una cuenta de Instagram para descargar?',
              answer:
                'No. Mientras la publicación sea pública, puedes descargar sus medios sin iniciar sesión.'
            },
            {
              question: '¿Puedo descargar Stories de Instagram?',
              answer:
                'Actualmente soportamos publicaciones, Reels y carruseles. La descarga de Stories requiere que el contenido sea públicamente accesible mediante enlace directo.'
            }
          ]
        },
        crossLinks: {
          title: 'Más descargadores de video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Descarga videos de TikTok sin marca de agua en calidad HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Descarga videos y GIFs de X/Twitter en calidad HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Descarga videos de Vimeo en HD con múltiples opciones de resolución.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Descarga videos y fotos de Threads en calidad original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Descarga videos de Telegram de canales y grupos en calidad HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Descargador de Videos y Fotos de Threads - Calidad Original | TG Downloader',
          description:
            'Descarga videos y fotos de Threads en calidad original gratis. Sin instalar apps, guarda medios incluidos carruseles al instante.',
          keywords:
            'descargar Threads, descargar video Threads, descargar video de Threads, descargar medios Threads, guardar video Threads, descargador Threads gratis'
        },
        workspace: {
          title: 'Descargador de Videos y Fotos de Threads',
          helperText:
            'Pega cualquier enlace de publicación de Threads para descargar videos y fotos en calidad original. También soporta enlaces de Telegram, TikTok e Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Por qué usar nuestro descargador de Threads',
          subtitle: 'Guarda videos y fotos de Threads en calidad original. Completamente gratis.',
          items: [
            {
              title: 'Medios mixtos',
              description:
                'Descarga videos y fotos de publicaciones de Threads. Soporta publicaciones con múltiples tipos de contenido.'
            },
            {
              title: 'Calidad original',
              description:
                'Guarda medios de Threads en la resolución más alta disponible. Sin compresión, sin pérdida de calidad.'
            },
            {
              title: 'Soporte de carrusel',
              description:
                'Descarga todos los medios de publicaciones de carrusel de Threads de una vez. Obtén cada foto y video en una sola operación.'
            }
          ]
        },
        howTo: {
          title: 'Cómo descargar videos y fotos de Threads',
          subtitle:
            'Tres simples pasos para guardar cualquier publicación de Threads en calidad original.',
          steps: [
            {
              title: 'Copia el enlace de la publicación de Threads',
              description:
                'Abre Threads, toca el icono de compartir de la publicación y selecciona "Copiar enlace".'
            },
            {
              title: 'Pega el enlace arriba',
              description:
                'Pega la URL de Threads copiada en el campo de entrada y haz clic en Analizar.'
            },
            {
              title: 'Descarga los medios',
              description:
                'Haz clic en el botón de Descarga para guardar videos y fotos en calidad original.'
            }
          ]
        },
        faq: {
          title: 'Preguntas frecuentes del descargador de Threads',
          items: [
            {
              question: '¿Este descargador de Threads es realmente gratis?',
              answer:
                'Sí, completamente gratis sin cargos ocultos. Descarga videos y fotos de Threads sin costo.'
            },
            {
              question: '¿Qué tipos de medios se soportan?',
              answer:
                'Soportamos la descarga de videos, fotos y publicaciones de medios mixtos de Threads, incluidas publicaciones de carrusel con múltiples elementos.'
            },
            {
              question: '¿Qué calidad tienen los archivos descargados?',
              answer:
                'Todos los medios se guardan en la resolución original del creador, sin pérdida de calidad.'
            },
            {
              question: '¿Necesito una cuenta de Threads para descargar?',
              answer:
                'No. Mientras la publicación sea pública, puedes descargar sus medios sin iniciar sesión.'
            },
            {
              question: '¿Puedo descargar publicaciones de carrusel con múltiples fotos?',
              answer:
                'Sí, nuestro descargador soporta completamente las publicaciones de carrusel de Threads. Todas las fotos y videos del carrusel están disponibles para descargar.'
            }
          ]
        },
        crossLinks: {
          title: 'Más descargadores de video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Descarga videos de TikTok sin marca de agua en calidad HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Descarga videos y GIFs de X/Twitter en calidad HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Descarga videos de Vimeo en HD con múltiples opciones de resolución.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Descarga fotos, Reels y carruseles de Instagram en calidad HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Descarga videos de Telegram de canales y grupos en calidad HD.'
            }
          ]
        }
      }
    }
  }
}
