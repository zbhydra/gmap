import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'créditos',
        enterEmailFirst: 'Primero introduce tu correo electrónico.',
        enterEmailAndCode: 'Introduce el correo electrónico y el código de verificación.',
        sendCodeFailed: 'No se pudo enviar el código de verificación.',
        googleSignInFailed: 'No se pudo iniciar sesión con Google.',
        googleClientMissing: 'El inicio de sesión con Google no está configurado.',
        signInFailed: 'No se pudo iniciar sesión.',
      },
      checkin: {
        accountButtonLabel: 'Abrir menú de cuenta',
        accountMenuLabel: 'Menú de cuenta',
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
  }
}
