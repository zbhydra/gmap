import type { SiteContent } from '../schema'
import { deDEPricingContent } from '../pricing'

export const deDE: SiteContent = {
  site: {
    name: 'Telegram Video-Download | TG Downloader',
    description:
      'Nutzen Sie TG Downloader für den Telegram Video-Download in Telegram Web, speichern Sie Dateien und Medien und wechseln Sie bei einem Telegram Privatkanal in den Erweiterungsfluss.',
    keywords:
      'Telegram Video-Download, Telegram Medien-Download, Telegram Video speichern, Telegram Datei-Download, Telegram Privatkanal'
  },
  layout: {
    nav: {
      brand: 'TG Downloader',
      home: 'Startseite',
      pricing: 'Preise',
      solutions: 'Lösung',
      changelog: 'Änderungen'
    },
    footer: {
      resources: 'Ressourcen',
      rights: '© 2026 TG Downloader. Alle Rechte vorbehalten.'
    }
  },
  common: {
    installCta: 'Jetzt Installieren'
  },
  pages: {
    account: {
      auth: {
        eyebrow: 'Web-Zugang',
        title: 'Anmelden, um deine Guthaben zu synchronisieren',
        signedInAs: 'Angemeldet als',
        continueWithGoogle: 'Mit Google fortfahren',
        googleLoading: 'Google wird geöffnet...',
        or: 'oder',
        emailLabel: 'E-Mail',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'Mit E-Mail fortfahren',
        sendCode: 'Code senden',
        sendingCode: 'Wird gesendet...',
        sendCodeSuccess: 'Bestätigungscode wurde gesendet.',
        sendAgain: 'Erneut senden',
        codeLabel: 'Bestätigungscode',
        codePlaceholder: '123456',
        signIn: 'Anmelden',
        termsNotice: 'Mit der Anmeldung akzeptierst du die',
        termsLink: 'Bedingungen',
        privacyLink: 'Datenschutzerklärung',
        logout: 'Abmelden',
        creditsLabel: 'Guthaben',
        enterEmailFirst: 'Bitte gib zuerst deine E-Mail-Adresse ein.',
        enterEmailAndCode: 'Bitte gib E-Mail-Adresse und Bestätigungscode ein.',
        sendCodeFailed: 'Der Bestätigungscode konnte nicht gesendet werden.',
        googleSignInFailed: 'Google-Anmeldung fehlgeschlagen.',
        googleClientMissing: 'Google-Anmeldung ist nicht konfiguriert.',
        signInFailed: 'Anmeldung fehlgeschlagen.',
      },
      checkin: {
        accountButtonLabel: 'Kontomenü öffnen',
        accountMenuLabel: 'Kontomenü',
      },
      creditPurchase: {
        title: 'Guthaben kaufen',
        description: 'Füge Guthaben hinzu und lade in diesem Arbeitsbereich weiter herunter.',
        successTitle: 'Guthaben hinzugefügt',
        successDescription: 'Dein Saldo wurde aktualisiert. Schließe dieses Fenster und starte den Download erneut.',
        packageEyebrow: 'Nach Bedarf zahlen',
        cardNote: 'Nutze Guthaben für Website-Downloads. Guthaben verfällt nicht.',
        creditsAmount: '{credits} Guthaben',
        buyNow: 'Jetzt kaufen',
        selectPackage: 'Auswählen',
        paymentMethodLabel: 'Zahlungsmethode wählen',
        paymentTitle: 'Zahlungsmethode wählen',
        selectedPackageLabel: 'Ausgewähltes Produkt',
        confirmPurchase: 'Weiter zur Zahlung',
        backToProducts: 'Zurück',
        close: 'Schließen',
        agreementText: 'Ich stimme den Kaufbedingungen, den Nutzungsbedingungen und der Datenschutzrichtlinie zu.',
        loadingConfigs: 'Guthabenpakete werden geladen...',
        loadFailed: 'Guthabenpakete konnten nicht geladen werden. Bitte versuche es erneut.',
        noConfigs: 'Derzeit sind keine Guthabenpakete verfügbar. Bitte versuche es später erneut.',
        ready: 'Wähle ein Guthabenpaket. Preise werden in USD angezeigt.',
        creatingOrder: 'Bestellung wird erstellt...',
        pendingPayment: 'Schließe die Zahlung im neu geöffneten Tab ab. Wir prüfen das Ergebnis automatisch.',
        pendingPaymentTitle: 'Warten auf Zahlung',
        cancelPayment: 'Zahlung abbrechen',
        supportMailPrefix: 'Problem melden: ',
        success: 'Zahlung abgeschlossen. Guthaben ist jetzt verfügbar.',
        failed: 'Die Zahlung ist nicht abgeschlossen. Du kannst es erneut versuchen oder dieses Fenster schließen.',
        successCredits: '+{credits} Guthaben hinzugefügt',
        successBalance: 'Aktueller Saldo: {balance} Guthaben',
        createFailed: 'Bestellung konnte nicht erstellt werden. Bitte versuche es erneut.',
        invalidPaymentData: 'Der Zahlungslink ist ungültig. Bitte versuche es später erneut.',
        priceUpdated: 'Der Preis hat sich geändert. Prüfe den aktuellen Preis und kaufe erneut.',
        gatewayFailed: 'Der Zahlungseinstieg ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.',
        paymentCanceled: 'Die Zahlung wurde abgebrochen. Wähle eine Zahlungsmethode und versuche es erneut.',
        pollFailed: 'Zahlungsstatus konnte nicht aktualisiert werden. Bitte versuche es erneut.',
        pollTimeout: 'Die automatische Aktualisierung ist abgelaufen. Aktualisiere das Ergebnis nach der Zahlung manuell.',
        orderNotFound: 'Die Bestellung ist nicht mehr verfügbar. Erstelle eine neue Bestellung.',
        orderExpired: 'Die Bestellung ist abgelaufen. Kaufe erneut.',
        fulfillmentFailed: 'Die Zahlung wurde empfangen, aber das Guthaben wurde noch nicht hinzugefügt. Versuche es später erneut.',
        authExpired: 'Die Anmeldung ist abgelaufen. Melde dich erneut an, um fortzufahren.'
      },
    },

    changelog: {
      title: 'Telegram Video-Download Änderungsprotokoll',
      description:
        'Verfolgen Sie jedes Update rund um Telegram Video-Download, Web-Workflow und längere Speicherläufe.',
      seoTitle: 'Telegram Video-Download Änderungsprotokoll | TG Downloader',
      seoDescription:
        'Lesen Sie dieses Telegram Video-Download Änderungsprotokoll für Updates zu Web-Abläufen, größeren Dateien und aktuellen Versionen.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Leistungssteigerung',
          description: 'Erhebliche Leistungsverbesserungen für eine bessere Benutzererfahrung.',
          features: [
            'Geschwindigkeit der Ressourcenerkennung um 50 % verbessert',
            'Stabilität des Downloads großer Dateien optimiert',
            'UI-Reaktionsfähigkeit verbessert'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Mehrsprachige Unterstützung',
          description: 'Unterstützung für 14 Sprachen weltweit hinzugefügt.',
          features: [
            'Unterstützung für Japanisch, Koreanisch und weitere Sprachen hinzugefügt',
            'Übersetzungsgenauigkeit verbessert',
            'Automatische Spracherkennung hinzugefügt'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Sidebar-Download',
          description: 'Neue Sidebar-Download-Funktion mit Batch-Unterstützung.',
          features: [
            'Einzelner Datei-Download in der Sidebar hinzugefügt',
            'Batch-Download-Funktionalität hinzugefügt',
            'Download-Warteschlangenverwaltung verbessert'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Sicherheit & Privatsphäre',
          description: 'Sicherheitsverbesserungen und Datenschutz-Verbesserungen.',
          features: [
            'Alle Analytics-Tracking entfernt',
            'Lokaler Verarbeitungsmodus hinzugefügt',
            'Datenverschlüsselung verbessert'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Erste Veröffentlichung',
          description: 'Erste Veröffentlichung mit Chat-Fenster-Download-Unterstützung.',
          features: [
            'Chat-Fenster-Download-Funktionalität',
            'Unterstützung für Telegram Web K und A Versionen',
            'Grundlegende Medienformat-Unterstützung'
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
    pricing: deDEPricingContent,
    extensionLoginV2: {
      title: 'Extension-Anmeldung | TG Downloader',
      description:
        'Melden Sie sich bei TG Downloader an und synchronisieren Sie Ihre Website-Sitzung mit der Browsererweiterung.',
      eyebrow: 'Browsererweiterung',
      heading: 'Bei TG Downloader anmelden',
      checkingState: 'Sitzung wird geprüft',
      signInRequiredState: 'Anmeldung erforderlich',
      syncedState: 'Angemeldet',
      verificationFailedState: 'Überprüfung fehlgeschlagen',
      preparingTitle: 'Anmeldung wird vorbereitet…',
      preparingText: 'TG Downloader bereitet die Prüfung der Website-Sitzung vor.',
      checkingSessionTitle: 'Website-Sitzung wird geprüft…',
      checkingSessionText:
        'TG Downloader überprüft das in diesem Browser gespeicherte Website-Token.',
      finishingGoogleTitle: 'Google-Anmeldung wird abgeschlossen…',
      finishingGoogleText:
        'TG Downloader tauscht das Ergebnis der Google-Anmeldung gegen eine Website-Sitzung ein.',
      signInRequiredTitle: 'Zum Fortfahren anmelden',
      signInRequiredText: 'Verwenden Sie dasselbe TG Downloader-Anmeldefenster wie auf der Website.',
      signInButtonLabel: 'Anmelden',
      syncingTitle: 'Extension-Token wird synchronisiert…',
      syncingText: 'TG Downloader tauscht Ihre Website-Sitzung gegen ein Extension-Token ein.',
      syncedTitle: 'Anmeldung erfolgreich',
      syncedText:
        'Die Erweiterung ist mit Ihrem TG Downloader-Konto verbunden. Klicken Sie auf Zurück zu Telegram, um zurückzukehren.',
      returnButtonLabel: 'Zurück zu Telegram',
      returningButtonLabel: 'Zurückkehren…',
      verificationFailedTitle: 'Die Extension-Anmeldung konnte nicht abgeschlossen werden',
      retryButtonLabel: 'Erneut versuchen',
    },
  }
}
