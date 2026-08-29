import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
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
  sections: {
    features: {
      title: 'Telegram Medien-Download Funktionen',
      subtitle:
        'Diese Telegram Medien-Download Funktionen decken Dateien, Bilder, Videos, große Batches und geladene Inhalte in Telegram Web ab.',
      metaDescription:
        'TG Downloader Funktionen: Batch-Speichern mehrerer Dateien, Unterstützung für private Kanäle, Download großer Dateien über 1GB, Echtzeit-Medienerkennung und ein datenschutzorientiertes Design ohne erforderlichen Login.',
      items: [
        {
          title: 'Batch-Download',
          description:
            'Unterstützt Multi-Select-Batch-Download, laden Sie alle Mediendateien aus einem Kanal oder Gruppe mit einem Klick herunter',
          details: [
            'Multi-Select-Batch-Download-Unterstützung',
            'Gesamten Kanal/Gruppe mit einem Klick herunterladen',
            'Intelligente Filterung nach Dateityp',
            'Download-Warteschlangenverwaltung'
          ]
        },
        {
          title: 'Eingeschränkter Inhalt',
          description:
            'Laden Sie Medien aus eingeschränkten Kanälen und privaten Gruppen herunter, sogar ohne Berechtigung',
          details: [
            'Zugriff auf Inhalte eingeschränkter Kanäle',
            'Download aus privaten Gruppen',
            'Keine Berechtigungsverifizierung erforderlich',
            'Funktioniert mit A/K-Versionen'
          ]
        },
        {
          title: 'Multi-Format-Unterstützung',
          description: 'Unterstützt Bilder, Videos, GIFs, Audio und andere Medienformate',
          details: [
            'Bilder: JPG, PNG, WEBP, GIF',
            'Videos: MP4, WEBM, MOV',
            'Audiodateien: MP3, M4A, OGG',
            'Automatische Formaterkennung'
          ]
        },
        {
          title: 'Sicher & Geschützt',
          description: 'Kein Passwort oder API-Login erforderlich, keine Benutzerdaten gesammelt',
          details: [
            'Kein Passwort oder API-Login erforderlich',
            'Keine Benutzerdaten gesammelt',
            'Viren- und werbefrei',
            'Rigorous Sicherheits testing'
          ]
        },
        {
          title: 'Großdatei-Unterstützung',
          description: 'Stabiler Download von Dateien über 1GB mit Resume-Unterstützung',
          details: [
            'Stabiler Download von Dateien über 1GB',
            'Fortsetzungsunterstützung für unterbrochene Downloads',
            'Schnelle und stabile Übertragung',
            'Fortschrittsverfolgung'
          ]
        },
        {
          title: 'Echtzeit-Erkennung',
          description:
            'Scannt und erkennt automatisch Medienressourcen, aktualisiert Download-Liste in Echtzeit',
          details: [
            'Automatischer Scan von Medienressourcen der Seite',
            'Echtzeit-Ressourcenerkennung',
            'Automatische Listenaktualisierungen',
            'Intelligentes Ressourcen-Caching'
          ]
        }
      ]
    },
    steps: {
      title: 'Telegram Video speichern Anleitung',
      subtitle:
        'Folgen Sie diesem Telegram Video speichern Ablauf, öffnen Sie die Nachricht in Telegram Web und sichern Sie Videos oder weitere Medien in wenigen Schritten.',
      metaDescription:
        'Schritt-für-Schritt-Anleitung zum Speichern von Telegram-Videos, -Dateien und -Alben mit TG Downloader. Lernen Sie, die Erweiterung zu installieren, Medien in Telegram Web zu erkennen und Inhalte im Batch herunterzuladen.',
      items: [
        {
          title: 'Erweiterung Installieren',
          description:
            'Suchen Sie und installieren Sie TG Downloader aus Ihrem Browser-Erweiterungs-Store'
        },
        {
          title: 'Erweiterung Anheften',
          description:
            'Klicken Sie auf die Browser-Symbolleiste, um das Erweiterungssymbol für schnellen Zugriff anzuheften'
        },
        {
          title: 'Telegram Web Öffnen',
          description:
            'Besuchen Sie web.telegram.org, die Erweiterung beginnt automatisch mit dem Scannen von Medienressourcen'
        },
        {
          title: 'Batch-Download',
          description:
            'Wählen Sie Dateien zum Herunterladen aus und klicken Sie auf die Download-Schaltfläche, um sie lokal zu speichern'
        }
      ]
    },
    cta: {
      title: 'Bereit Anzufangen?',
      description:
        'Installieren Sie die Erweiterung und beginnen Sie jetzt, Medien aus Telegram herunterzuladen.'
    },
    techSpecs: {
      title: 'Technische Spezifikationen',
      browsersLabel: 'Browser',
      browsers: 'Chrome, Edge, Brave und alle Chromium-basierten Browser',
      telegramVersionsLabel: 'Telegram-Versionen',
      telegramVersions: 'Web K-Version und A-Version',
      permissionsLabel: 'Berechtigungen',
      permissions: 'Minimale Berechtigungen erforderlich',
      updatesLabel: 'Updates',
      updates: 'Automatische Updates vom Extension Store'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Medien aus Telegram Private- und Eingeschränkten Kanälen Herunterladen',
        description:
          'Ein Klick, kein Login, 1GB+ Dateien unterstützt. Batch-Download aus privaten Kanälen und eingeschränktem Inhalt.'
      },
      stats: {
        users: 'Benutzer Weltweit',
        downloads: 'Gesamte Downloads'
      },
      seo: {
        title: 'Telegram Private Video Downloader: Private Medien herunterladen',
        description:
          'Speichern Sie Videos aus privaten Telegram-Kanälen mit einer einfachen Downloader-Anleitung. Laden Sie zugängliche Videos und Medien herunter, beheben Sie fehlgeschlagene Downloads und finden Sie die richtige Methode für Ihr Gerät.',
        keywords:
          'telegram private video downloader, telegram privater kanal video downloader, privates telegram video herunterladen, telegram private medien downloader'
      },
      heroTrustPoints: [
        'HD-Video-Download',
        'Keine Registrierung',
        'Mobilfreundlich',
        'Funktioniert auf Windows, Mac, Android und iPhone'
      ],
      situation: {
        title: 'Hier starten: Welche Situation trifft auf Sie zu?',
        intro:
          'Die meisten Nutzer, die nach einem Telegram Private Video Downloader suchen, möchten eines dieser Probleme lösen:',
        headers: ['Ihre Situation', 'Probieren Sie zuerst das'],
        rows: [
          {
            cells: [
              'Sie haben einen Telegram-Videolink aus einem Kanal oder Chat',
              'Fügen Sie den Link in einen Online-Telegram-Video-Downloader ein'
            ]
          },
          {
            cells: [
              'Sie können das Video in einem privaten Kanal ansehen, aber nicht speichern',
              'Probieren Sie die Option „Save Video As" in Telegram Desktop'
            ]
          },
          {
            cells: [
              'Das Video wird abgespielt, aber Download und Weiterleitung sind blockiert',
              'Nutzen Sie Bildschirmaufnahme nur, wenn Sie die Erlaubnis haben, eine Kopie zu behalten'
            ]
          },
          {
            cells: [
              'Der Downloader meldet „kein Video gefunden"',
              'Prüfen Sie Zugriff, Linktyp, Kanalbeschränkungen und ob sich das Video außerhalb von Telegram öffnet'
            ]
          }
        ]
      },
      solutions: {
        title: 'Was funktioniert bei privaten Telegram-Videos?',
        intro:
          'Ein privates Telegram-Video ist meist ein Video, das in einem privaten Kanal, einer privaten Gruppe oder einem Direkt-Chat geteilt wird. Diese Videos sind nur für freigegebene Mitglieder sichtbar, daher unterscheidet sich ihr Download vom Speichern von Medien aus einem öffentlichen Kanal.',
        quickAnswer:
          'Kurze Antwort: Wenn der Link zugänglich ist, nutzen Sie einen Online-Telegram-Private-Video-Downloader. Wenn das Video nur innerhalb von Telegram sichtbar ist, probieren Sie Telegram Desktop. Wenn das Speichern blockiert ist, Sie den Inhalt aber behalten dürfen, ist die Bildschirmaufnahme die praktische Ausweichlösung.',
        items: [
          {
            title: 'Lösung 1: Online-Telegram-Video-Downloader',
            description:
              'Am besten für zugängliche Telegram-Links. Dies ist die einfachste Methode für Nutzer, die Telegram-Videos online herunterladen möchten, ohne App, Erweiterung oder Bot zu installieren.',
            useWhenLabel: 'Nutzen Sie diese Methode, wenn:',
            useWhen: [
              'Der Telegram-Videolink öffentlich oder zugänglich ist.',
              'Sie Telegram-Videos online herunterladen möchten.',
              'Sie schnell eine HD-Videodatei benötigen.',
              'Sie keine Browser-Erweiterung oder Desktop-App installieren möchten.'
            ]
          },
          {
            title: 'Lösung 2: Telegram Desktop „Save Video As"',
            description:
              'Wenn das Video in Telegram Desktop verfügbar ist und Downloads erlaubt sind, klicken Sie mit der rechten Maustaste auf das Video und speichern Sie es in einem Ordner auf Ihrem Computer. Das funktioniert für Mitglieder privater Kanäle oft besser, weil Sie bereits in Telegram authentifiziert sind.',
            useWhenLabel: 'Nutzen Sie diese Methode, wenn:',
            useWhen: [
              'Sie das Video in Telegram Desktop ansehen können.',
              'Der Kanalbesitzer das Speichern nicht deaktiviert hat.',
              'Sie den Download direkt auf Windows oder Mac bevorzugen.'
            ]
          },
          {
            title: 'Lösung 3: Bildschirmaufnahme auf Mobilgerät oder Desktop',
            description:
              'Wenn die Download-Option deaktiviert ist, Sie den Inhalt aber ansehen und behalten dürfen, kann ein Bildschirmrekorder Video und Audio während der Wiedergabe aufzeichnen. Dies ist eine Ausweichlösung, nicht die erste Methode, da sie länger dauert und von der Wiedergabequalität abhängt.',
            useWhenLabel: 'Nutzen Sie diese Methode, wenn:',
            useWhen: [
              'Sie die Erlaubnis haben, das Video anzusehen und zu behalten.',
              'Der Telegram-Link nicht von einem Downloader verarbeitet werden kann.',
              'Sie eine persönliche Offline-Kopie zum Nachschlagen benötigen.'
            ]
          },
          {
            title: 'Lösung 4: Android-Dateimanager-Prüfung',
            description:
              'In manchen Android-Fällen speichert Telegram geladene Medien vorübergehend in lokalen App-Ordnern. Ein Dateimanager kann Ihnen manchmal helfen, bereits auf dem Gerät geladene Videos zu finden, aber das hängt von App-Version, Speicherberechtigungen und Cache-Verhalten ab.',
            useWhenLabel: 'Nutzen Sie diese Methode, wenn:',
            useWhen: [
              'Sie das Video bereits in Telegram auf Android abgespielt haben.',
              'Sie App-Speicherberechtigungen verstehen.',
              'Sie nur eine bereits auf Ihrem Gerät zwischengespeicherte Datei wiederherstellen möchten.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Warum einen Online-Telegram-Video-Downloader nutzen?',
        intro:
          'Ein guter Downloader sollte Ihnen helfen, eine Frage schnell zu beantworten: Lässt sich dieses Telegram-Video über den Link speichern, den ich habe? Das beste Erlebnis ist direkt, klar und ehrlich, wenn ein privater Link nicht verarbeitet werden kann.',
        items: [
          {
            title: 'Videos in hoher Qualität speichern',
            description:
              'Behalten Sie Telegram-Videos in der besten verfügbaren Qualität für Offline-Wiedergabe, Lernen, Schulungen, Archivierung oder den persönlichen Gebrauch.'
          },
          {
            title: 'Funktioniert auf allen Geräten',
            description:
              'Nutzen Sie den Downloader über einen Browser auf Android, iPhone, Windows, Mac oder Tablet. Das ist wichtig, wenn das Video auf Ihrem Handy liegt, Sie es aber auf einem anderen Gerät speichern möchten.'
          },
          {
            title: 'Kein Telegram-Login erforderlich',
            description:
              'Wählen Sie Tools, die einen Videolink verarbeiten, ohne nach Ihrem Telegram-Passwort, Bestätigungscode, Session-Datei oder den Zugangsdaten Ihres privaten Kontos zu fragen.'
          },
          {
            title: 'Einfache Offline-Wiedergabe',
            description:
              'Laden Sie Dateien in gängigen Videoformaten herunter, sofern verfügbar, damit Sie später ansehen können, ohne Telegram zu öffnen oder mobile Daten zu nutzen.'
          },
          {
            title: 'Schneller linkbasierter Ablauf',
            description:
              'Kopieren, einfügen, analysieren und herunterladen. Wenn der Link fehlschlägt, sollte die Seite erklären, warum, und Ihnen sagen, was als Nächstes zu versuchen ist.'
          },
          {
            title: 'Klare Berechtigungsgrenze',
            description:
              'Laden Sie nur Videos herunter, auf die Sie zugreifen und die Sie speichern dürfen. Respektieren Sie Kanalregeln, die Rechte der Ersteller und die Richtlinien von Telegram.'
          }
        ]
      },
      troubleshooting: {
        title: 'Wenn der Telegram-Videolink nicht funktioniert',
        intro:
          'Nicht jeder fehlgeschlagene Link bedeutet, dass der Downloader defekt ist. Private Telegram-Videos schlagen oft fehl, weil die Datei außerhalb von Telegram nicht verfügbar ist. Versuchen Sie diese Checkliste:',
        items: [
          'Öffnen Sie den Link in einem Browser und prüfen Sie, ob er lädt.',
          'Stellen Sie sicher, dass Sie noch Mitglied des privaten Kanals oder der Gruppe sind.',
          'Prüfen Sie, ob der Kanalbesitzer Speichern, Kopieren oder Weiterleiten deaktiviert hat.',
          'Probieren Sie Telegram Desktop, wenn das Video nur innerhalb der App abgespielt wird.',
          'Verwenden Sie einen anderen Browser oder ein anderes Netzwerk, wenn die Seite Telegram nicht erreichen kann.',
          'Vermeiden Sie jedes Tool, das nach Ihrem Telegram-Login-Code fragt.'
        ]
      },
      permission: {
        title: 'Wichtiger Hinweis zur Berechtigung',
        note:
          'Ein Telegram Private Video Downloader darf nicht verwendet werden, um Datenschutz-, Urheberrechts- oder Zugriffsbeschränkungen zu umgehen. Speichern Sie Videos nur, wenn Sie die Erlaubnis des Besitzers haben oder Ihre Nutzung gesetzlich und durch die Bedingungen von Telegram erlaubt ist.'
      },
      comparison: {
        title: 'Die richtige Telegram-Download-Methode wählen',
        headers: ['Situation', 'Empfohlene Lösung', 'Am besten für', 'Was zu prüfen ist'],
        rows: [
          {
            cells: [
              'Öffentlicher oder zugänglicher Telegram-Videolink',
              'Online-Telegram-Video-Downloader',
              'Schneller HD-Download ohne App',
              'Der Link öffnet sich und das Tool kann das Video erreichen'
            ]
          },
          {
            cells: [
              'Privates Kanalvideo mit erlaubtem Download',
              'Telegram Desktop „Save Video As"',
              'Direktes Speichern auf einem Computer',
              'Sie sind Mitglied und der Besitzer hat das Speichern nicht deaktiviert'
            ]
          },
          {
            cells: [
              'Eingeschränktes Speichern, aber sichtbare Wiedergabe',
              'Integrierter oder externer Bildschirmrekorder',
              'Persönliche Offline-Nutzung mit Erlaubnis',
              'Audioaufnahme, Bildschirmbereich sowie lokale Gesetze oder Plattformregeln'
            ]
          },
          {
            cells: [
              'Auf Android zwischengespeicherte Medien',
              'Dateimanager-Prüfung',
              'Bereits auf dem Gerät geladene Medien finden',
              'Zugriff auf App-Speicher und ob Telegram einen lokalen Cache behält'
            ]
          }
        ]
      },
      howTo: {
        title: 'Telegram-Videos in 3 Schritten herunterladen',
        subtitle:
          'Der schnellste Weg ist ein linkbasierter Telegram-Video-Downloader. Er funktioniert am besten, wenn der Telegram-Videolink öffentlich, zugänglich oder außerhalb der Telegram-App lesbar ist.',
        steps: [
          {
            title: 'Den Videolink kopieren',
            description:
              'Öffnen Sie Telegram, suchen Sie das Video, das Sie speichern möchten, und kopieren Sie den Nachrichten- oder Videolink aus dem Teilen-Menü. Wenn der Kanal das Kopieren von Links nicht erlaubt, gehen Sie zu den Lösungen für private Kanäle weiter unten.'
          },
          {
            title: 'Einfügen und analysieren',
            description:
              'Fügen Sie den Telegram-Link in das Downloader-Feld ein. Das Tool prüft, ob über diesen Link eine herunterladbare Videodatei erreichbar ist.'
          },
          {
            title: 'In HD herunterladen',
            description:
              'Wählen Sie die verfügbare Qualität oder das Format und speichern Sie das Telegram-Video direkt auf Ihrem Handy, Tablet oder Computer. Wenn keine Datei erscheint, ist der Link wahrscheinlich eingeschränkt und nicht defekt.'
          }
        ]
      },
      faq: {
        title: 'Häufig gestellte Fragen',
        description:
          'Die Fragen, die sich Nutzer vor einem Telegram Video-Download oder Telegram Datei-Download in Telegram Web stellen.',
        items: [
          {
            question: 'Kann ich private Telegram-Videos herunterladen?',
            answer:
              'Sie können private Telegram-Videos nur herunterladen oder speichern, wenn Sie die Berechtigung haben, darauf zuzugreifen, und die Videoquelle verfügbar ist. Manche privaten Kanäle blockieren Speichern, Weiterleiten, Kopieren von Links oder externen Zugriff.'
          },
          {
            question: 'Wie lade ich Videos aus privaten Telegram-Kanälen herunter?',
            answer:
              'Probieren Sie zuerst den linkbasierten Downloader, wenn Sie einen brauchbaren Telegram-Videolink haben. Wenn das nicht funktioniert, prüfen Sie in Telegram Desktop die Option „Save Video As". Wenn Downloads blockiert sind, Sie den Inhalt aber behalten dürfen, kann die Bildschirmaufnahme die Ausweichlösung sein.'
          },
          {
            question: 'Warum meldet der Telegram-Video-Downloader „kein Video gefunden"?',
            answer:
              'Der Link kann eingeschränkt, gelöscht, abgelaufen, nur innerhalb von Telegram sichtbar oder vom Kanalbesitzer blockiert sein. Öffnen Sie den Link zuerst selbst und prüfen Sie, ob das Video noch abgespielt wird. Wenn es nur nach der Anmeldung bei Telegram funktioniert, kann ein Online-Downloader möglicherweise nicht darauf zugreifen.'
          },
          {
            question: 'Muss ich Software installieren?',
            answer:
              'Nein, bei zugänglichen Links. Ein Online-Telegram-Video-Downloader funktioniert im Browser. Für bestimmte private oder eingeschränkte Fälle benötigen Sie möglicherweise Telegram Desktop, einen Dateimanager oder einen Bildschirmrekorder.'
          },
          {
            question: 'Kann ich Telegram-Videos ohne Link herunterladen?',
            answer:
              'Normalerweise nicht. Online-Downloader benötigen einen Telegram-Videolink, um die Datei zu finden. Wenn Sie keinen Link kopieren können, das Video aber in Telegram ansehen können, nutzen Sie Telegram Desktop oder eine andere erlaubte lokale Methode.'
          },
          {
            question: 'Ist es sicher, meinen Telegram-Login-Code in einen Downloader einzugeben?',
            answer:
              'Nein. Ein Downloader sollte Ihr Telegram-Passwort, Ihren Bestätigungscode oder Ihre Session-Zugangsdaten nicht benötigen. Wenn eine Seite danach fragt, verlassen Sie sie.'
          },
          {
            question: 'Ist ein Telegram-Medien-Downloader kostenlos?',
            answer:
              'Viele linkbasierte Telegram-Medien-Downloader sind für grundlegende Downloads kostenlos. Meiden Sie Tools, die verdächtige Installationen, Login-Aufforderungen oder irreführende Schaltflächen erzwingen.'
          },
          {
            question: 'Ist das Herunterladen von Telegram-Videos legal?',
            answer:
              'Das hängt vom Inhalt, Ihrer Berechtigung und Ihrer beabsichtigten Nutzung ab. Laden Sie urheberrechtlich geschützte, private oder eingeschränkte Inhalte nicht ohne Genehmigung herunter oder verbreiten Sie sie weiter.'
          }
        ]
      },
      workspace: {
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
          creditsLabel: 'Guthaben'
        },
        quota: {
          eyebrow: 'Web-Kontingent',
          title: 'Aktueller Guthaben-Saldo',
          planLabel: 'Tarif',
          remainingLabel: 'Verbleibend',
          dailyLimitLabel: 'Tageslimit',
          unlimited: 'Unbegrenzt'
        },
        checkin: {
          creditsLoading: 'Guthaben',
          creditsButtonLabel: 'Täglichen Check-in öffnen',
          accountButtonLabel: 'Kontomenü öffnen',
          accountMenuLabel: 'Kontomenü',
          title: 'Dein kostenloses Guthaben für heute ist bereit',
          todayRewardText: 'Heutige Belohnung: {credits} Guthaben',
          claimedRewardText: 'Du hast heute {credits} Guthaben erhalten.',
          nextCountdown: 'Nächster Anspruch in {time}',
          nextAt: '(Nächste Aktualisierung: {time} EST)',
          claimButton: '{credits} Guthaben erhalten',
          claimingButton: 'Wird abgeholt...',
          notNow: 'Nicht jetzt',
          close: 'Schließen',
          loadFailed: 'Check-in-Status konnte nicht geladen werden.',
          claimFailed: 'Guthaben konnte nicht abgeholt werden.'
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
        parse: {
          eyebrow: 'Direkte Analyse',
          title: 'Telegram Private Video Downloader: Private Medien herunterladen',
          helperText:
            'Speichern Sie Videos aus privaten Telegram-Kanälen mit einer einfachen Downloader-Anleitung. Laden Sie zugängliche Videos und Medien herunter, beheben Sie fehlgeschlagene Downloads und finden Sie die richtige Methode für Ihr Gerät.',
          telegramMessageListLinkError:
            'Dieser Telegram-Link öffnet einen Chat oder Kanal, keine bestimmte Nachricht. Kopiere den exakten Nachrichtenlink und füge ihn hier ein.',
          linkLabel: 'Telegram-Link',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Eingabe löschen',
          submit: 'Telegram-Videolink einfügen',
          submitting: 'Analyse läuft...',
          noResults: 'Für diese Nachricht wurden keine herunterladbaren Dateien gefunden.',
          download: 'Herunterladen',
          downloading: 'Wird heruntergeladen...',
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
          largeFileExtensionInlineChromeTitle: 'Chrome-Erweiterung',
          largeFileExtensionInlineChromeDescription:
            'Dedizierte Erweiterung für Chrome, um Telegram-Medien mit einem Klick zu erfassen.',
          largeFileExtensionInlineChromeCta: 'Erweiterung installieren',
          largeFileExtensionInlineEdgeTitle: 'Edge-Erweiterung',
          largeFileExtensionInlineEdgeDescription:
            'Dedizierte Erweiterung für Microsoft Edge, kompatibel mit Telegram-Downloads.',
          largeFileExtensionInlineEdgeCta: 'Erweiterung installieren'
        },
        errors: {
          enterEmailFirst: 'Bitte gib zuerst deine E-Mail-Adresse ein.',
          enterEmailAndCode: 'Bitte gib E-Mail-Adresse und Bestätigungscode ein.',
          sendCodeFailed: 'Der Bestätigungscode konnte nicht gesendet werden.',
          googleSignInFailed: 'Google-Anmeldung fehlgeschlagen.',
          googleClientMissing: 'Google-Anmeldung ist nicht konfiguriert.',
          restoreSessionFailed: 'Die Sitzung konnte nicht wiederhergestellt werden.',
          signInFailed: 'Anmeldung fehlgeschlagen.',
          logoutFailed: 'Abmeldung fehlgeschlagen.',
          loadQuotaFailed: 'Guthaben konnte nicht geladen werden.',
          enterLink: 'Bitte gib einen Medienlink ein.',
          invalidLink: 'Das ist keine gültige URL.',
          parseFailed: 'Dieser Link konnte nicht analysiert werden.',
          downloadFailed: 'Diese Datei konnte nicht heruntergeladen werden.',
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
          xParseFailed: 'Dieser X-Link wird nicht unterstützt. Verwende einen öffentlichen Videostatus.',
          instagramParseFailed: 'Dieser Instagram-Link wird nicht unterstützt. Verwende einen öffentlichen Beitrag.',
          instagramImageParseFailed: 'Dieser Instagram-Link wird nicht unterstützt. Verwende einen öffentlichen Foto-Beitrag.',
          threadsParseFailed: 'Dieser Threads-Link wird nicht unterstützt. Verwende einen öffentlichen Beitrag.',
          redditParseFailed: 'Reddit-Medien konnten nicht abgerufen werden. Verwende einen öffentlichen Video-, Bild- oder Galerie-Beitrag.',
          douyinParseFailed: 'Dieses Douyin-Video konnte nicht abgerufen werden. Verwende einen öffentlichen Videolink.',
          quotaExceeded: 'Nicht genug Guthaben, um diese Datei herunterzuladen.',
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
        title: 'Weitere Video-Downloader',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'TikTok-Videos ohne Wasserzeichen in HD-Qualität herunterladen.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'X/Twitter-Videos und GIFs in HD-Qualität herunterladen.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Vimeo-Videos in HD mit mehreren Auflösungsoptionen herunterladen.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Instagram-Fotos, Reels und Karussells in HD-Qualität herunterladen.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Threads-Videos und -Fotos in Originalqualität herunterladen.'
          }
        ]
      }
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
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['de-DE'],
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
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok Video Downloader ohne Wasserzeichen - HD-Qualität | TG Downloader',
          description:
            'TikTok-Videos ohne Wasserzeichen in HD-Qualität kostenlos herunterladen. Keine App-Installation nötig. TikTok-Videos, Diashows und Stories sofort speichern.',
          keywords:
            'tiktok downloader, tiktok video herunterladen, tiktok ohne wasserzeichen, tiktok video hd speichern, tiktok video download kostenlos'
        },
        workspace: {
          title: 'TikTok Video Downloader ohne Wasserzeichen',
          helperText:
            'Fügen Sie einen beliebigen TikTok-Videolink ein, um ohne Wasserzeichen in HD-Qualität herunterzuladen. Unterstützt auch Telegram-, X- und Vimeo-Links.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Warum unseren TikTok Downloader nutzen',
          subtitle: 'Speichern Sie TikTok-Videos in höchster Qualität ohne Wasserzeichen, komplett kostenlos.',
          items: [
            {
              title: 'Ohne Wasserzeichen',
              description:
                'Laden Sie TikTok-Videos ohne das TikTok-Wasserzeichen herunter. Erhalten Sie saubere Videos in Originalqualität, bereit zum Speichern oder Teilen.'
            },
            {
              title: 'HD-Qualität',
              description:
                'Speichern Sie TikTok-Videos in der originalen HD-Auflösung. Kein Qualitätsverlust, keine Komprimierung — genau wie vom Ersteller hochgeladen.'
            },
            {
              title: 'Schnell & Kostenlos',
              description:
                'Keine App-Installation, keine Registrierung, keine versteckten Gebühren. Link einfügen, Video erhalten. Funktioniert sofort in jedem Browser.'
            }
          ]
        },
        howTo: {
          title: 'So laden Sie TikTok-Videos ohne Wasserzeichen herunter',
          subtitle:
            'Drei einfache Schritte, um jedes TikTok-Video in HD-Qualität ohne Wasserzeichen zu speichern.',
          steps: [
            {
              title: 'TikTok-Videolink kopieren',
              description:
                'Öffnen Sie TikTok, tippen Sie auf den Teilen-Button beim Video und wählen Sie „Link kopieren".'
            },
            {
              title: 'Link oben einfügen',
              description:
                'Fügen Sie die kopierte TikTok-URL in das Eingabefeld ein und klicken Sie auf Analysieren.'
            },
            {
              title: 'Ohne Wasserzeichen herunterladen',
              description:
                'Klicken Sie auf den Download-Button, um das TikTok-Video in HD ohne Wasserzeichen zu speichern.'
            }
          ]
        },
        faq: {
          title: 'TikTok Downloader FAQ',
          items: [
            {
              question: 'Ist dieser TikTok Downloader wirklich kostenlos?',
              answer:
                'Ja, komplett kostenlos ohne versteckte Kosten. Sie können TikTok-Videos ohne Wasserzeichen kostenlos herunterladen.'
            },
            {
              question: 'Hat das heruntergeladene Video ein Wasserzeichen?',
              answer:
                'Nein. Unser Downloader entfernt das TikTok-Wasserzeichen und liefert das originale saubere Video in HD-Qualität.'
            },
            {
              question: 'In welcher Qualität sind die heruntergeladenen TikTok-Videos?',
              answer:
                'Videos werden in der originalen HD-Auflösung gespeichert, wie vom Ersteller hochgeladen, ohne Qualitätsverlust.'
            },
            {
              question: 'Muss ich eine App oder Erweiterung installieren?',
              answer:
                'Keine Installation nötig. Dies ist ein webbasiertes Tool, das direkt in Ihrem Browser auf jedem Gerät funktioniert.'
            },
            {
              question: 'Kann ich TikTok Stories und Diashows herunterladen?',
              answer:
                'Ja, unser Downloader unterstützt TikTok-Videos, Foto-Diashows und Stories. Einfach Link einfügen und herunterladen.'
            }
          ]
        },
        crossLinks: {
          title: 'Weitere Video-Downloader',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter-Videos und GIFs in HD-Qualität herunterladen.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo-Videos in HD mit mehreren Auflösungsoptionen herunterladen.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram-Fotos, Reels und Karussells in HD-Qualität herunterladen.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads-Videos und -Fotos in Originalqualität herunterladen.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram-Videos aus Kanälen und Gruppen in HD-Qualität herunterladen.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) Video Downloader - Videos & GIFs in HD speichern | TG Downloader',
          description:
            'X (Twitter) Videos und GIFs kostenlos in HD-Qualität herunterladen. Keine App nötig. Jedes öffentliche Tweet-Video oder GIF sofort speichern.',
          keywords:
            'x downloader, twitter video herunterladen, twitter video download, x video downloader, twitter gif speichern, twitter video speichern'
        },
        workspace: {
          title: 'X (Twitter) Video Downloader',
          helperText:
            'Fügen Sie einen beliebigen X- oder Twitter-Videolink ein, um in höchster Qualität herunterzuladen. Unterstützt auch Telegram-, TikTok- und Vimeo-Links.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Warum unseren X Video Downloader nutzen',
          subtitle: 'Speichern Sie X/Twitter-Videos und GIFs in Originalqualität, komplett kostenlos.',
          items: [
            {
              title: 'Videos & GIFs',
              description:
                'Laden Sie sowohl Videobeiträge als auch animierte GIFs von X (Twitter) herunter. Erhalten Sie genau die Medien, wie sie im Tweet erscheinen.'
            },
            {
              title: 'Originale HD-Qualität',
              description:
                'Speichern Sie X-Videos in der höchsten verfügbaren Auflösung. Kein Qualitätsverlust — dieselbe Bitrate wie die Quelle.'
            },
            {
              title: 'Schnell & Kostenlos',
              description:
                'Keine App-Installation, kein Login erforderlich. Tweet-URL einfügen, Video oder GIF in Sekunden herunterladen.'
            }
          ]
        },
        howTo: {
          title: 'So laden Sie X (Twitter) Videos herunter',
          subtitle:
            'Drei einfache Schritte, um jedes Video oder GIF von X/Twitter zu speichern.',
          steps: [
            {
              title: 'Tweet-URL kopieren',
              description:
                'Klicken Sie auf X (Twitter) das Teilen-Symbol beim Tweet und wählen Sie „Link kopieren".'
            },
            {
              title: 'Link oben einfügen',
              description:
                'Fügen Sie die kopierte X/Twitter-URL in das Eingabefeld ein und klicken Sie auf Analysieren.'
            },
            {
              title: 'Video oder GIF herunterladen',
              description:
                'Klicken Sie auf Herunterladen, um das Video oder GIF in HD-Qualität auf Ihrem Gerät zu speichern.'
            }
          ]
        },
        faq: {
          title: 'X Video Downloader FAQ',
          items: [
            {
              question: 'Wie lade ich ein Video von X (Twitter) herunter?',
              answer:
                'Kopieren Sie die Tweet-URL mit dem Video, fügen Sie sie oben in das Eingabefeld ein und klicken Sie auf Analysieren. Dann klicken Sie auf Herunterladen, um das Video zu speichern.'
            },
            {
              question: 'Kann ich GIFs von X herunterladen?',
              answer:
                'Ja. Unser Downloader unterstützt sowohl Videos als auch animierte GIFs aus X/Twitter-Beiträgen. GIFs werden als MP4-Dateien für beste Kompatibilität gespeichert.'
            },
            {
              question: 'Welche Videoqualität ist verfügbar?',
              answer:
                'Wir liefern die höchste verfügbare Qualität für jeden Tweet, typischerweise die originale HD-Auflösung des Posters.'
            },
            {
              question: 'Ist dieser X Downloader kostenlos?',
              answer:
                'Ja, komplett kostenlos ohne Registrierung. Laden Sie X-Videos und GIFs ohne jegliche Kosten herunter.'
            },
            {
              question: 'Brauche ich ein X/Twitter-Konto zum Herunterladen?',
              answer:
                'Kein Konto erforderlich. Solange der Tweet öffentlich ist, können Sie sein Video oder GIF ohne Anmeldung herunterladen.'
            }
          ]
        },
        crossLinks: {
          title: 'Weitere Video-Downloader',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok-Videos ohne Wasserzeichen in HD-Qualität herunterladen.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo-Videos in HD mit mehreren Auflösungsoptionen herunterladen.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram-Fotos, Reels und Karussells in HD-Qualität herunterladen.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads-Videos und -Fotos in Originalqualität herunterladen.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram-Videos aus Kanälen und Gruppen in HD-Qualität herunterladen.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo Video Downloader HD - Mehrere Auflösungen | TG Downloader',
          description:
            'Vimeo-Videos kostenlos in HD-Qualität mit mehreren Auflösungsoptionen herunterladen. Keine App nötig. Jedes öffentliche Vimeo-Video sofort speichern.',
          keywords:
            'vimeo downloader, vimeo video herunterladen, vimeo video hd download, vimeo downloader kostenlos, vimeo video speichern, vimeo hd herunterladen'
        },
        workspace: {
          title: 'Vimeo Video Downloader HD',
          helperText:
            'Fügen Sie einen beliebigen Vimeo-Videolink ein, um in HD-Qualität mit Auflösungsauswahl herunterzuladen. Unterstützt auch Telegram-, TikTok- und X-Links.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Warum unseren Vimeo Downloader nutzen',
          subtitle: 'Speichern Sie Vimeo-Videos in HD-Qualität mit Ihrer Wunschauflösung, komplett kostenlos.',
          items: [
            {
              title: 'HD-Originalqualität',
              description:
                'Laden Sie Vimeo-Videos in voller HD-Auflösung herunter. Erhalten Sie dieselbe gestochen scharfe Qualität, die der Ersteller hochgeladen hat.'
            },
            {
              title: 'Mehrere Auflösungen',
              description:
                'Wählen Sie aus verfügbaren Auflösungen (360p, 720p, 1080p und mehr). Wählen Sie die Qualität, die Ihren Anforderungen entspricht.'
            },
            {
              title: 'Schnell & Kostenlos',
              description:
                'Keine App-Installation, kein Konto nötig. Vimeo-Link einfügen, Auflösung auswählen und sofort herunterladen.'
            }
          ]
        },
        howTo: {
          title: 'So laden Sie Vimeo-Videos in HD herunter',
          subtitle:
            'Drei einfache Schritte, um jedes Vimeo-Video in Ihrer bevorzugten Auflösung zu speichern.',
          steps: [
            {
              title: 'Vimeo-Videolink kopieren',
              description:
                'Öffnen Sie die Vimeo-Videoseite und kopieren Sie die URL aus der Adressleiste Ihres Browsers.'
            },
            {
              title: 'Link oben einfügen',
              description:
                'Fügen Sie die kopierte Vimeo-URL in das Eingabefeld ein und klicken Sie auf Analysieren.'
            },
            {
              title: 'Auflösung wählen und herunterladen',
              description:
                'Wählen Sie Ihre bevorzugte Videoauflösung und klicken Sie auf Herunterladen, um das HD-Video zu speichern.'
            }
          ]
        },
        faq: {
          title: 'Vimeo Downloader FAQ',
          items: [
            {
              question: 'Wie lade ich ein Video von Vimeo herunter?',
              answer:
                'Kopieren Sie die Vimeo-Videoseiten-URL, fügen Sie sie oben in das Eingabefeld ein, klicken Sie auf Analysieren und wählen Sie dann Ihre bevorzugte Auflösung zum Herunterladen.'
            },
            {
              question: 'Kann ich die Videoauflösung auswählen?',
              answer:
                'Ja. Nach der Analyse können Sie aus allen verfügbaren Auflösungen wählen, darunter 360p, 720p, 1080p und höher, falls verfügbar.'
            },
            {
              question: 'Ist dieser Vimeo Downloader kostenlos?',
              answer:
                'Ja, komplett kostenlos nutzbar. Laden Sie Vimeo-Videos in HD-Qualität ohne Kosten oder Registrierung herunter.'
            },
            {
              question: 'Brauche ich ein Vimeo-Konto zum Herunterladen?',
              answer:
                'Kein Konto erforderlich. Sie können jedes öffentliche Vimeo-Video ohne Anmeldung herunterladen.'
            },
            {
              question: 'In welchem Videoformat werden die Downloads gespeichert?',
              answer:
                'Vimeo-Videos werden im MP4-Format heruntergeladen, das mit praktisch allen Geräten und Playern kompatibel ist.'
            }
          ]
        },
        crossLinks: {
          title: 'Weitere Video-Downloader',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok-Videos ohne Wasserzeichen in HD-Qualität herunterladen.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter-Videos und GIFs in HD-Qualität herunterladen.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram-Fotos, Reels und Karussells in HD-Qualität herunterladen.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads-Videos und -Fotos in Originalqualität herunterladen.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram-Videos aus Kanälen und Gruppen in HD-Qualität herunterladen.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram Foto- & Video-Downloader - HD-Qualität | TG Downloader',
          description:
            'Instagram-Fotos, Reels und Karussell-Alben kostenlos in HD-Qualität herunterladen. Keine App nötig, sofort speichern.',
          keywords:
            'Instagram Download, Instagram Foto Download, Instagram Reels Download, Instagram Karussell Download, Instagram Video speichern, kostenloser Instagram Downloader'
        },
        workspace: {
          title: 'Instagram Foto- & Video-Download',
          helperText:
            'Fügen Sie einen Instagram-Beitragslink ein, um Fotos, Reels und Karussells in HD herunterzuladen. Unterstützt auch Telegram-, TikTok- und X-Links.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Warum unseren Instagram-Downloader nutzen',
          subtitle: 'Instagram-Fotos, Reels und Karussell-Alben in originaler HD-Qualität speichern. Komplett kostenlos.',
          items: [
            {
              title: 'Fotos & Reels',
              description:
                'Instagram-Fotos und Reels-Videos in Originalqualität herunterladen. Exakt die Medien erhalten, wie sie der Creator gepostet hat.'
            },
            {
              title: 'Karussell-Batch-Download',
              description:
                'Alle Bilder und Videos eines Instagram-Karussell-Beitrags auf einmal herunterladen. Kein einzelnes Speichern nötig.'
            },
            {
              title: 'HD Originalqualität',
              description:
                'Instagram-Medien in höchster verfügbarer Auflösung speichern. Keine Komprimierung, kein Qualitätsverlust.'
            }
          ]
        },
        howTo: {
          title: 'So laden Sie Instagram-Fotos und -Videos herunter',
          subtitle:
            'In drei einfachen Schritten jeden Instagram-Beitrag in HD-Qualität speichern.',
          steps: [
            {
              title: 'Instagram-Beitragslink kopieren',
              description:
                'Öffnen Sie Instagram, tippen Sie auf die drei Punkte oben rechts am Beitrag und wählen Sie „Link kopieren".'
            },
            {
              title: 'Link einfügen',
              description:
                'Fügen Sie die kopierte Instagram-URL in das Eingabefeld oben ein und klicken Sie auf „Analysieren".'
            },
            {
              title: 'In HD herunterladen',
              description:
                'Klicken Sie auf „Download", um Fotos, Reels oder Karussell-Inhalte in Originalqualität zu speichern.'
            }
          ]
        },
        faq: {
          title: 'Instagram-Downloader FAQ',
          items: [
            {
              question: 'Ist dieser Instagram-Downloader wirklich kostenlos?',
              answer:
                'Ja, komplett kostenlos ohne versteckte Gebühren. Instagram-Fotos, Reels und Karussells kostenlos herunterladen.'
            },
            {
              question: 'Welche Formate werden unterstützt?',
              answer:
                'Wir unterstützen den Download von Instagram-Fotos (JPG), Reels-Videos (MP4) und vollständigen Karussell-Alben mit allen Medien.'
            },
            {
              question: 'In welcher Qualität sind die heruntergeladenen Dateien?',
              answer:
                'Alle Medien werden in der originalen HD-Auflösung gespeichert, wie vom Creator hochgeladen. Kein Qualitätsverlust.'
            },
            {
              question: 'Brauche ich ein Instagram-Konto zum Herunterladen?',
              answer:
                'Nein. Solange der Beitrag öffentlich ist, können Sie die Medien ohne Anmeldung herunterladen.'
            },
            {
              question: 'Kann ich Instagram Stories herunterladen?',
              answer:
                'Derzeit unterstützen wir Beiträge, Reels und Karussells. Stories können heruntergeladen werden, wenn sie über einen direkten Link öffentlich zugänglich sind.'
            }
          ]
        },
        crossLinks: {
          title: 'Weitere Video-Downloader',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok-Videos ohne Wasserzeichen in HD herunterladen.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter-Videos und GIFs in HD-Qualität herunterladen.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo-Videos in HD mit mehreren Auflösungsoptionen herunterladen.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads-Videos und -Fotos in Originalqualität herunterladen.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram-Videos aus Kanälen und Gruppen in HD herunterladen.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads Video- & Foto-Downloader - Originalqualität | TG Downloader',
          description:
            'Threads-Videos und -Fotos kostenlos in Originalqualität herunterladen. Keine App nötig, Karussell-Beiträge sofort speichern.',
          keywords:
            'Threads Download, Threads Video Download, Threads Video herunterladen, Threads Medien Download, Threads Video speichern, kostenloser Threads Downloader'
        },
        workspace: {
          title: 'Threads Video- & Foto-Download',
          helperText:
            'Fügen Sie einen Threads-Beitragslink ein, um Videos und Fotos in Originalqualität herunterzuladen. Unterstützt auch Telegram-, TikTok- und Instagram-Links.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Warum unseren Threads-Downloader nutzen',
          subtitle: 'Threads-Videos und -Fotos in Originalqualität speichern. Komplett kostenlos.',
          items: [
            {
              title: 'Gemischte Medien',
              description:
                'Videos und Fotos aus Threads-Beiträgen herunterladen. Unterstützt Beiträge mit gemischten Medientypen.'
            },
            {
              title: 'Originalqualität',
              description:
                'Threads-Medien in höchster verfügbarer Auflösung speichern. Keine Komprimierung, kein Qualitätsverlust.'
            },
            {
              title: 'Karussell-Unterstützung',
              description:
                'Alle Medien aus Threads-Karussell-Beiträgen auf einmal herunterladen. Alle Fotos und Videos in einem Vorgang.'
            }
          ]
        },
        howTo: {
          title: 'So laden Sie Threads-Videos und -Fotos herunter',
          subtitle:
            'In drei einfachen Schritten jeden Threads-Beitrag in Originalqualität speichern.',
          steps: [
            {
              title: 'Threads-Beitragslink kopieren',
              description:
                'Öffnen Sie Threads, tippen Sie auf das Teilen-Symbol des Beitrags und wählen Sie „Link kopieren".'
            },
            {
              title: 'Link einfügen',
              description:
                'Fügen Sie die kopierte Threads-URL in das Eingabefeld oben ein und klicken Sie auf „Analysieren".'
            },
            {
              title: 'Medien herunterladen',
              description:
                'Klicken Sie auf „Download", um Videos und Fotos in Originalqualität zu speichern.'
            }
          ]
        },
        faq: {
          title: 'Threads-Downloader FAQ',
          items: [
            {
              question: 'Ist dieser Threads-Downloader wirklich kostenlos?',
              answer:
                'Ja, komplett kostenlos ohne versteckte Gebühren. Threads-Videos und -Fotos kostenlos herunterladen.'
            },
            {
              question: 'Welche Medientypen werden unterstützt?',
              answer:
                'Wir unterstützen den Download von Videos, Fotos und gemischten Medien-Beiträgen auf Threads, einschließlich Karussell-Beiträgen mit mehreren Elementen.'
            },
            {
              question: 'In welcher Qualität sind die heruntergeladenen Dateien?',
              answer:
                'Alle Medien werden in der originalen Auflösung gespeichert, wie vom Creator gepostet. Kein Qualitätsverlust.'
            },
            {
              question: 'Brauche ich ein Threads-Konto zum Herunterladen?',
              answer:
                'Nein. Solange der Beitrag öffentlich ist, können Sie die Medien ohne Anmeldung herunterladen.'
            },
            {
              question: 'Kann ich Karussell-Beiträge mit mehreren Fotos herunterladen?',
              answer:
                'Ja, unser Downloader unterstützt Threads-Karussell-Beiträge vollständig. Alle Fotos und Videos im Karussell können heruntergeladen werden.'
            }
          ]
        },
        crossLinks: {
          title: 'Weitere Video-Downloader',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok-Videos ohne Wasserzeichen in HD herunterladen.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter-Videos und GIFs in HD-Qualität herunterladen.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo-Videos in HD mit mehreren Auflösungsoptionen herunterladen.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram-Fotos, Reels und Karussells in HD-Qualität herunterladen.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram-Videos aus Kanälen und Gruppen in HD herunterladen.'
            }
          ]
        }
      }
    }
  }
}
