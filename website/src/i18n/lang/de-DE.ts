import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab ist ein Kartendaten-Toolkit: Rufen Sie öffentlich verfügbare Geschäftsinformationen aus Karten ab, überprüfen Sie Links, Orts-IDs und mehr mit einer Browsererweiterung und Web-Tools.",
    "keywords": "Kartendaten, Google Maps-Extraktor, Orts-ID-Finder, Bewertungslink-Generator, Karten-Tools"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Primäre Navigation",
      "mobileLabel": "Mobile Navigation",
      "extension": "Erweiterung",
      "online": "Online",
      "api": "API",
      "apiScraper": "Scraper API",
      "apiReviews": "Bewertungen API",
      "apiPhotos": "Fotos API",
      "apiMcp": "Scraper MCP",
      "apiScraperDesc": "Geschäftsdaten für jedes Schlüsselwort und jeden Standort, z. B. JSON.",
      "apiReviewsDesc": "Vollständige Rezensionsthreads mit Bewertungen und Besitzerantworten.",
      "apiPhotosDesc": "Öffentliche Fotogalerien als gebrauchsfertige URL-Listen.",
      "apiMcpDesc": "Live-Kartendaten für Claude Code, Cursor und VS Code.",
      "apiFootNote": "API und MCP teilen sich ein monatliches Anforderungskontingent.",
      "apiPricing": "API-Preise",
      "pricing": "Preise",
      "freeTools": "Kostenlose Tools",
      "signIn": "anmelden",
      "dashboard": "Dashboard"
    },
    "footer": {
      "legalLabel": "Legal",
      "resources": "Kostenlose Tools",
      "product": "Produkt",
      "rights": "© 2026 MapsGrab. Alle Rechte vorbehalten.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Finder",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Überprüfen Sie den Linkgenerator",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "E-Mail-Checker",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Lat-Long-zu-DMS-Konverter",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS-zu-Dezimal-Konverter",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Massen-Keyword-Generator",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "CSV-Dateien online zusammenführen",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Jetzt installieren",
    "comingSoon": "Kommt bald",
    "themeLabel": "Farbthema",
    "themeLight": "Licht",
    "themeDark": "Dunkel",
    "themeSystem": "System",
    "faqLabel": "Häufige Fragen",
    "breadcrumbLabel": "Semmelbrösel",
    "languageSwitcherLabel": "Sprachumschalter",
    "mobileMenuLabel": "Menü umschalten",
    "copied": "In die Zwischenablage kopiert",
    "cancel": "Stornieren",
    "continue": "Weitermachen"
  },
  "dashboard": {
    "create": {
      "title": "Online Scraper",
      "newTask": "Neue Aufgabe",
      "modeLabel": "Suchmodus",
      "modes": {
        "keywords": "Schlüsselwörter",
        "map": "Karte",
        "regions": "Regionen"
      },
      "keywords": "Schlüsselwörter",
      "regionsCta": "Suchanfragen nach Region erstellen",
      "placeholder": "Café in Portland\nRestaurant in Austin",
      "count": "Schlüsselwörter {count} / {limit}",
      "duplicates": "Doppelte Zeilen ignoriert: {count}",
      "contacts": "Finden Sie E-Mails und soziale Profile",
      "contactsPaid": "Verfügbar mit einem kostenpflichtigen Online-Plan.",
      "usage": "{used} / {total} zeichnet diesen Monat auf",
      "reset": "Das Monatskontingent wird am 1. (New Yorker Zeit) zurückgesetzt.",
      "loading": "Laden Sie Ihre Grenzen...",
      "optionsFailed": "Ihre Aufgabenlimits konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      "submit": "Datenerfassung starten",
      "submitting": "Einreichen...",
      "submitted": "Aufgabe gesendet",
      "failed": "Die Übermittlung der Aufgabe ist fehlgeschlagen. Aktualisieren Sie den Verlauf, bevor Sie es erneut versuchen.",
      "exhausted": "Ihr monatliches Kontingent ist erschöpft.",
      "invalid": "Geben Sie bis zu {limit}-Schlüsselwörter ein, jedes nicht länger als 500 Zeichen.",
      "map": {
        "invalidKeyword": "Geben Sie einen Suchbegriff mit höchstens 500 Zeichen ein.",
        "keyword": "Suchbegriff",
        "keywordPlaceholder": "z. B. Café",
        "locationSearch": "Orte suchen",
        "locate": "Nach Region suchen",
        "locationPlaceholder": "Land / Bundesland / Stadt auswählen",
        "coordinates": "Koordinaten eingeben",
        "latitude": "Breite",
        "longitude": "Länge",
        "radius": "Radius (km)",
        "spacing": "Rasterabstand (km)",
        "sampleCount": "{count} / {limit} Suchorte",
        "points": "Rasterpunkte: {points}",
        "overLimit": "Reduzieren Sie den Radius oder vergrößern Sie den Rasterabstand, um innerhalb der {limit}-Suchpositionen zu bleiben.",
        "chooseCenter": "Wählen Sie eine Region oder klicken Sie auf die Karte, um den Mittelpunkt festzulegen.",
        "mapLabel": "Wählen Sie ein Suchzentrum auf der Karte",
        "tilesUnavailable": "Kartenkacheln konnten nicht geladen werden. Sie können weiterhin Koordinaten eingeben.",
        "attribution": "OpenStreetMap-Mitwirkende"
      },
      "region": {
        "baseKeywords": "Basisschlüsselwörter",
        "basePlaceholder": "Café\nRestaurant",
        "country": "Land",
        "state": "Staat oder Region",
        "citySearch": "Finden Sie eine Stadt",
        "cityPlaceholder": "Optional: Städte auswählen",
        "city": "Stadt",
        "selectCountry": "Wählen Sie ein Land aus",
        "allStates": "Alle Staaten oder Regionen",
        "loading": "Standorte werden geladen...",
        "loadFailed": "Standorte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
        "retry": "Wiederholen",
        "filter": "Filtern",
        "selectAll": "Alle auswählen ({count})",
        "clear": "Auswahl aufheben",
        "selectedCount": "{count} ausgewählt",
        "more": "{shown} von {total} werden angezeigt. Tippen Sie weiter, um einzugrenzen.",
        "selectedRegions": "Ausgewählte Standorte",
        "remove": "Entfernen Sie {name}",
        "noMatch": "Keine Treffer",
        "matchMode": "Suchphrasierung",
        "inMode": "In",
        "nearMode": "Nahe",
        "generate": "Abfragen generieren",
        "needBase": "Geben Sie zuerst Basis-Keywords ein.",
        "needCountry": "Wählen Sie zuerst ein Land aus.",
        "willGenerate": "Es werden {count} Suchanfragen erstellt.",
        "finalQueries": "Letzte Fragen",
        "finalPlaceholder": "Hier werden generierte Abfragen angezeigt. Sie können sie bearbeiten.",
        "attribution": "Standortdaten: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Dashboard | MapsGrab",
      "description": "Verwalten Sie Ihre MapsGrab-Exporte, API-Zugriffe und Abonnements in einem Arbeitsbereich."
    },
    "shell": {
      "skipToContent": "Zum Inhalt springen",
      "sideLabel": "Arbeitsbereich",
      "homeLabel": "MapsGrab-Startseite",
      "navLabel": "Menü des Arbeitsbereichs",
      "loading": "Ihr Arbeitsbereich wird geladen...",
      "retry": "Wiederholen",
      "navOnline": "Online Scraper",
      "navJobHistory": "Verlauf",
      "navApi": "API-Verwaltung",
      "navSubscriptions": "Abonnements",
      "openMenu": "Arbeitsbereichsmenü öffnen",
      "closeMenu": "Arbeitsbereichsmenü schließen",
      "collapseSidebar": "Seitenleiste einklappen",
      "expandSidebar": "Seitenleiste ausklappen",
      "back": "Zurück"
    },
    "account": {
      "menuButtonLabel": "Kontomenü öffnen",
      "menuLabel": "Kontomenü",
      "logout": "Abmelden",
      "upgrade": "Upgraden",
      "usageShort": "{used} / {total} Datensätze",
      "planUnavailable": "Nicht verfügbar",
      "theme": "Design",
      "themeLight": "Hell",
      "themeDark": "Dunkel",
      "themeSystem": "System",
      "language": "Sprache"
    },
    "history": {
      "title": "Online-Exporthistorie",
      "description": "Aufgaben, die Sie auf dem Online Scraper ausgeführt haben, das Neueste zuerst.",
      "refresh": "Aktualisieren",
      "autoRefresh": "Automatische Aktualisierung an",
      "loading": "Ihre Exporte werden geladen...",
      "loadFailed": "Ihr Exportverlauf konnte nicht geladen werden.",
      "refreshFailed": "Aktualisierung fehlgeschlagen. Es werden die zuletzt geladenen Ergebnisse angezeigt.",
      "retry": "Wiederholen",
      "emptyTitle": "Noch keine Exporte",
      "emptyHint": "Führen Sie eine Aufgabe im Online Scraper aus und sie wird hier angezeigt.",
      "emptyCta": "Zum Online Scraper",
      "recentTitle": "Letzte Aufgaben",
      "viewAll": "Alle anzeigen",
      "recentEmptyHint": "Aufgaben, die Sie oben starten, erscheinen hier.",
      "noMatchTitle": "Keine passenden Aufgaben",
      "noMatchHint": "Versuchen Sie eine andere Aufgabennummer oder ein anderes Schlüsselwort, oder setzen Sie die Filter zurück.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "und {count} weitere",
      "columns": {
        "taskNo": "Aufgabe",
        "time": "Erstellt / Fertig",
        "contacts": "E-Mail & Social",
        "samples": "Suchen",
        "records": "Aufzeichnungen",
        "status": "Status"
      },
      "status": {
        "queued": "In der Warteschlange",
        "collecting": "Sammeln",
        "publishing": "Vorbereitung CSV",
        "completed": "Vollendet",
        "partial": "Teilerfolg",
        "failed": "Fehlgeschlagen"
      },
      "search": {
        "label": "Aufgaben durchsuchen",
        "placeholder": "Nach Aufgabennummer oder Schlüsselwort suchen",
        "clear": "Suche löschen"
      },
      "filters": {
        "label": "Aufgaben filtern",
        "button": "Filter",
        "status": "Status",
        "all": "Alle",
        "running": "Laufend",
        "clear": "Filter zurücksetzen"
      },
      "range": {
        "label": "Zeitraum",
        "last7": "Letzte 7 Tage",
        "last30": "Letzte 30 Tage",
        "all": "Gesamter Zeitraum",
        "custom": "Benutzerdefinierter Zeitraum",
        "from": "Von",
        "to": "Bis",
        "apply": "Anwenden",
        "invalid": "Wählen Sie ein Startdatum, das nicht nach dem Enddatum liegt."
      },
      "pagination": {
        "label": "Seitennavigation",
        "previous": "Vorherige",
        "next": "Nächste",
        "page": "Seite {page}",
        "pageSize": "Zeilen pro Seite",
        "summary": "{from}–{to} oder {total}"
      },
      "detail": {
        "show": "Details",
        "loading": "Suchanfragen werden geladen...",
        "loadFailed": "Suchen für diese Aufgabe konnten nicht geladen werden.",
        "keyword": "Stichwort",
        "records": "Aufzeichnungen",
        "completed": "Vollendet",
        "pending": "Ausstehend",
        "viewport": "{lat}, {lng} · Zoom {zoom}"
      },
      "contactsOn": "Aktiviert",
      "contactsOff": "Aus",
      "dedupeHint": "Datensätze werden gezählt, nachdem Duplikate in der gesamten Aufgabe entfernt wurden.",
      "finished": "Aufgabe {job}: {status}",
      "finishedRecords": "{count} Datensätze",
      "downloadCsv": "Laden Sie CSV herunter",
      "downloadXlsx": "Excel herunterladen",
      "noFile": "Nein CSV",
      "errors": {
        "31301": "Diese Suche konnte nicht erfasst werden.",
        "31302": "Einige Ergebnisse sind nicht verfügbar. Gelieferte Zeilen bleiben erhalten.",
        "31303": "Der Sammler ist beschäftigt. Versuchen Sie es erneut.",
        "31304": "Dieser Export konnte nicht veröffentlicht werden."
      },
      "errorFailed": "Diese Suche konnte nicht abgeschlossen werden.",
      "downloading": "Vorbereiten...",
      "downloadUnavailable": "Kein herunterladbares CSV. Die Datei ist möglicherweise abgelaufen.",
      "downloadFailed": "Der Download konnte nicht gestartet werden. Bitte versuchen Sie es erneut.",
      "signInPrompt": "Melden Sie sich an, um Ihren Online-Exportverlauf anzuzeigen.",
      "signInCta": "Anmelden",
      "unreachable": "MapsGrab konnte derzeit nicht erreicht werden."
    },
    "api": {
      "description": "Verwalten Sie Ihren API-Schlüssel, Ihr monatliches Anforderungskontingent und verbundene KI-Apps.",
      "docsLink": "API-Produkte anzeigen",
      "signInPrompt": "Melden Sie sich an, um Ihren API-Zugriff zu verwalten.",
      "loading": "Laden Sie Ihren API-Zugang...",
      "loadFailed": "Ihr API-Zugriff konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      "retry": "Wiederholen",
      "refresh": "Aktualisieren",
      "keyTitle": "API-Schlüssel",
      "keyEmpty": "Sie haben noch keinen API-Schlüssel generiert.",
      "generateKey": "API-Schlüssel generieren",
      "rotateKey": "API-Schlüssel ersetzen",
      "generatingKey": "Generieren...",
      "keyOnce": "Kopieren Sie diesen Schlüssel jetzt. Sie können es nach dem Verlassen oder Aktualisieren dieser Seite nicht mehr anzeigen.",
      "keyCreated": "Erstellt",
      "rotateTitle": "Ersetzen Sie Ihren API-Schlüssel?",
      "rotateMessage": "Ihr aktueller Schlüssel funktioniert sofort nicht mehr. Aktualisieren Sie alle Apps, die ihn verwenden, mit dem neuen Schlüssel.",
      "cancel": "Stornieren",
      "copyKey": "API-Schlüssel kopieren",
      "copied": "Kopiert",
      "copyFailed": "Konnte nicht kopiert werden. Wählen Sie den Text aus und kopieren Sie ihn manuell.",
      "keyFailed": "Es konnte kein API-Schlüssel generiert werden. Bitte versuchen Sie es erneut.",
      "usageTitle": "Monatliche API-Nutzung",
      "usageFailed": "Ihre API-Nutzung konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      "usageValue": "{used} / {total}-Anfragen",
      "usagePeriod": "Zeitraum: {period}",
      "quotaExhausted": "Ihr monatliches Antragskontingent ist ausgeschöpft.",
      "quotaReset": "Reset am 1. (ET) · gemeinsam für API und MCP",
      "planTitle": "API-Plan",
      "managePlan": "Abonnements verwalten",
      "connectionsTitle": "Verbinden",
      "connectTabsLabel": "Verbindungsart",
      "connectDocs": {
        "api": "API-Referenz",
        "mcp": "MCP-Einrichtung",
        "mcpKey": "Einrichtung mit API-Schlüssel"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + API-Schlüssel"
      },
      "apiUrl": "API Basis URL",
      "mcpUrl": "MCP-Server URL",
      "mcpHint": "Fügen Sie diesen URL in Ihrem MCP-Client hinzu. Melden Sie sich an und genehmigen Sie die Verbindung, wenn diese Website geöffnet wird.",
      "mcpKeyHint": "Für Clients, die zur Anmeldung keinen Browser öffnen können. Anfragen nutzen Ihren API-Schlüssel, ohne Freigabeschritt.",
      "mcpConfigTitle": "Client-Konfiguration",
      "mcpConfigHint": "Fügen Sie diesen Eintrag zur Konfiguration Ihres MCP-Clients hinzu. Die Feldnamen unterscheiden sich je nach Client leicht.",
      "mcpUnavailable": "Die Verbindungsadresse MCP ist noch nicht verfügbar.",
      "copyUrl": "Kopieren Sie URL",
      "curlTitle": "Schnellstart",
      "curlHint": "Ersetzen Sie den Platzhalter durch Ihren vollständigen API-Schlüssel.",
      "grants": {
        "title": "Verbundene Apps",
        "description": "Apps, denen Sie erlaubt haben, mit Ihrem API-Guthaben Unternehmen zu durchsuchen und Bewertungen und öffentliche Fotos zu lesen.",
        "loading": "Verbundene Apps werden geladen...",
        "empty": "Es sind keine Apps verbunden.",
        "loadFailed": "Verbundene Apps konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
        "selfDeclared": "Name, den sich die App gibt: {name}",
        "createdLabel": "Verbunden",
        "refreshedLabel": "Zuletzt aktualisiert",
        "notRefreshed": "Noch nicht",
        "revoke": "Trennen",
        "revokeTitle": "Diese App trennen?",
        "revokeMessage": "{host} verliert sofort den Zugriff und benötigt Ihre Genehmigung, um eine erneute Verbindung herzustellen.",
        "revokeFailed": "Diese App konnte nicht getrennt werden. Bitte versuchen Sie es erneut.",
        "paginationLabel": "Seiten mit verbundenen Apps",
        "pageOf": "Seite {page} von {pages}"
      }
    },
    "subscriptions": {
      "title": "Abonnements",
      "description": "Pläne und Erneuerungsstatus für den Online Scraper, die Browser-Erweiterung und den API. Kaufen oder upgraden Sie auf der Preisseite.",
      "lines": {
        "online": "Online Scraper",
        "extension": "Browser-Erweiterung",
        "api": "API"
      },
      "planLabel": "Planen",
      "expiresLabel": "Verlängert / läuft ab",
      "free": "Frei",
      "unavailable": "Vorübergehend nicht verfügbar",
      "autoRenewOn": "Automatische Verlängerung aktiviert",
      "autoRenewOff": "Automatische Verlängerung deaktiviert",
      "paidVia": "Bezahlt mit {method}",
      "subscribeCta": "Wählen Sie einen Plan",
      "pricingLink": "Preise ansehen",
      "manageSubscription": "Abonnement verwalten",
      "managingSubscription": "Öffnung...",
      "manageFailed": "Die Abonnementverwaltung konnte nicht geöffnet werden. Bitte versuchen Sie es erneut.",
      "signInPrompt": "Melden Sie sich an, um Ihre Abonnements anzuzeigen."
    },
    "cancelGuide": {
      "title": "Verwalten Sie Ihr Abonnement beim Zahlungsanbieter",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Melden Sie sich bei PayPal an und öffnen Sie Einstellungen.",
            "Gehen Sie zu Zahlungen und dann zu Automatische Zahlungen.",
            "Wählen Sie MapsGrab und wählen Sie Abbrechen."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Öffnen Sie den Link zum Kundenportal in Ihrer Kauf-E-Mail.",
            "Melden Sie sich an und wählen Sie Ihr MapsGrab-Abonnement aus.",
            "Wählen Sie Abbrechen."
          ]
        }
      ],
      "closeLabel": "Schließen"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab – Erfassen Sie Google Maps-Geschäftsdaten in CSV und JSON",
        "description": "MapsGrab ist eine Browser-Erweiterung und ein Web-Toolkit, das öffentlich verfügbare Geschäftsinformationen von Google Maps sammelt – Namen, Telefone, Bewertungen, Fotos, E-Mails – und sie nach CSV oder JSON exportiert."
      },
      "hero": {
        "announce": {
          "badge": "Neu",
          "text": "MCP-Server für KI-Agenten"
        },
        "title": {
          "firstLine": "Google Maps Daten erfassen",
          "secondLine": "mit",
          "accent": "einem Klick",
          "end": "."
        },
        "lead": "Sammeln Sie öffentliche Geschäftsdaten von Google Maps – Namen, Telefone, Websites, Bewertungen, Fotos und E-Mails – und exportieren Sie saubere CSV oder JSON in Sekundenschnelle.",
        "search": {
          "label": "Stichwort suchen",
          "typing": [
            "Café in Portland",
            "Zahnarzt in Austin, TX",
            "Klempner in der Nähe von Chicago",
            "Yogastudio in Brooklyn",
            "Hotels in Miami Beach"
          ],
          "submit": "Vorschau der Ergebnisse",
          "loading": "Suche...",
          "suggestLabel": "Versuchen",
          "suggestions": [
            "Café in Portland",
            "Zahnarzt in Austin, TX",
            "Klempner in der Nähe von Chicago"
          ]
        },
        "trust": [
          "Keine Kreditkarte erforderlich",
          "{records} kostenlose Datensätze/Monat",
          "CSV- und JSON-Export"
        ],
        "dashboard": "Öffnen Sie den Online-Scraper",
        "theater": {
          "panelLabel": "Vorschau des MapsGrab-Panels",
          "extensionActive": "MapsGrab-Erweiterung aktiv",
          "mapFilters": [
            "Jetzt geöffnet",
            "Bestbewertet",
            "Preis"
          ],
          "live": "Live",
          "done": "Erledigt",
          "start": "Datenerfassung starten",
          "pause": "Pause",
          "extracting": "Extrahieren von {count}…",
          "finished": "Fertig · {count} Plätze",
          "kpis": {
            "phones": "Telefone",
            "emails": "E-Mails",
            "websites": "Websites"
          },
          "export": "Detaillierte Liste exportieren – {count} (.CSV)",
          "exportSaved": "Export gespeichert",
          "emailFound": "E-Mail gefunden",
          "averageRating": "Durchschnittliche Bewertung",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} Bewertungen"
        },
        "preview": {
          "title": "Ergebnisse",
          "count": "{count} Unternehmen auf der ersten Ergebnisseite",
          "columns": {
            "name": "Name",
            "address": "Adresse",
            "category": "Kategorie",
            "rating": "Bewertung",
            "reviews": "Rezensionen",
            "phone": "Telefon"
          },
          "locked": "Melden Sie sich an und geben Sie Ihre Schlüsselwörter in Online Scraper ein, um Ergebnisse zu sammeln und zu exportieren.",
          "signIn": "Melden Sie sich an, um eine vollständige Aufgabe zu starten",
          "failed": "Die Vorschau konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
          "empty": "Auf der ersten Ergebnisseite wurden keine Unternehmen gefunden."
        }
      },
      "facts": {
        "caption": "MapsGrab in Zahlen",
        "items": [
          {
            "value": 36,
            "label": "Datenspalten pro Unternehmen"
          },
          {
            "value": 11,
            "label": "Bewertungsfelder, einschließlich Antworten des Eigentümers"
          },
          {
            "value": 6,
            "label": "pro Website zugeordnete soziale Netzwerke"
          },
          {
            "value": "freeRecords",
            "label": "jeden Monat kostenlose Schallplatten"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "Möglichkeiten, es auszuführen: Erweiterung, Online, API – plus MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Wie es funktioniert",
          "title": {
            "lead": "Von der Kartensuche zur ",
            "accent": "Tabelle",
            "tail": " in drei Schritten"
          },
          "lead": "Kein Code und kein Kopieren und Einfügen. MapsGrab liest, was Google Maps Ihnen bereits anzeigt, und wandelt es in strukturierte Zeilen um."
        },
        "steps": [
          {
            "title": "Suchen Sie nach Google Maps",
            "body": "Öffnen Sie Google Maps und durchsuchen Sie jeden Unternehmenstyp und Standort – genau wie Sie es normalerweise tun würden."
          },
          {
            "title": "Datenerfassung starten",
            "body": "Klicken Sie auf {action}. MapsGrab scrollt durch die Ergebnisse, sammelt die Einträge und bereichert bei Aktivierung die Kontakte.",
            "action": "Datenerfassung starten"
          },
          {
            "title": "Überall exportieren",
            "body": "Laden Sie CSV oder JSON mit den von Ihnen gewählten Spalten herunter – Rezensionen und Fotos landen in eigenen Dateien und sind bereit für Excel oder Ihr CRM."
          }
        ],
        "searchSample": "Bäckerei in Seattle",
        "columnsUnit": "Spalten",
        "reviewsFile": "Bewertungen"
      },
      "products": {
        "head": {
          "kicker": "Produkte",
          "title": {
            "lead": "Drei Möglichkeiten, ",
            "accent": " ",
            "tail": " Maps-Daten abzurufen."
          },
          "lead": "Wählen Sie die Browsererweiterung, den cloudbasierten Online Scraper oder API. Die Erweiterung funktioniert in Ihrem eigenen Browser; Der Online Scraper und der API teilen sich eine Cloud-Engine."
        },
        "cards": {
          "extension": {
            "badge": "Browser-Erweiterung",
            "title": "Erfassen Sie Daten, während Sie Google Maps durchsuchen",
            "body": "Extrahieren Sie Geschäftsdaten, Bewertungen und Fotos aus den von Ihnen geöffneten Kartenseiten und exportieren Sie dann alles lokal. Edge, Firefox und Chromium.",
            "link": "Entdecken Sie die Erweiterung"
          },
          "online": {
            "badge": "Online Scraper",
            "title": "Cloud läuft. Nichts zu installieren.",
            "body": "Fügen Sie Schlüsselwörter ein, sammeln Sie Geschäftsdetails in der Cloud und laden Sie pro Aufgabe eine deduplizierte 37-Spalte CSV herunter.",
            "link": "Entdecken Sie Online Scraper"
          },
          "api": {
            "badge": "API",
            "title": "Bereinigen Sie JSON über HTTP",
            "body": "Geschäftsdaten und Bewertungen für Ihre eigenen Anwendungen – ein API-Schlüssel.",
            "link": "Entdecken Sie den API"
          },
          "mcp": {
            "badge": "MCP-Server",
            "title": "Live-Kartendaten für Ihre KI-Agenten",
            "body": "Suchen und bewerten Sie als MCP-Tools für Claude Code, Cursor, VS Code und Codex.",
            "link": "Entdecken Sie den MCP-Server"
          }
        },
        "extracting": "Extrahieren von {count}…",
        "queue": {
          "rows": "{count} Zeilen",
          "processing": "Verarbeitung"
        },
        "chat": {
          "prompt": "Finden Sie Zahnärzte in Austin mit der Bewertung 4.5+ über eine Website",
          "answer": "{count}-Übereinstimmungen gefunden. Top drei:"
        }
      },
      "fields": {
        "head": {
          "kicker": "Die Daten",
          "title": {
            "lead": "36-Spalten.  ",
            "accent": " Jeder einzelne ",
            "tail": " nützlich."
          },
          "lead": "Die Erweiterung exportiert ein Schema aus Suchergebnissen und Unternehmensseiten – Kontaktdaten, Standort, Profil, Bewertungen und alle Identifikatoren, die Sie später zum Abgleichen von Datensätzen benötigen."
        },
        "filtersLabel": "Feldgruppen",
        "all": "Alle",
        "groups": {
          "contact": {
            "filter": "Kontakt",
            "label": "Kontakt"
          },
          "location": {
            "filter": "Standort",
            "label": "Standort"
          },
          "profile": {
            "filter": "Profil",
            "label": "Unternehmensprofil"
          },
          "reviews": {
            "filter": "Bewertungen",
            "label": "Bewertungen und Rezensionen"
          },
          "ids": {
            "filter": "IDs und Links",
            "label": "IDs und Links"
          }
        },
        "sampleLabel": "Beispielwert",
        "emptySample": "(leer)",
        "descriptions": {
          "Name": "Firmenname genau wie im Eintrag angegeben.",
          "Description": "Kurze Beschreibung aus dem Unternehmensprofil.",
          "Fulladdress": "Vollständige, formatierte Straßenadresse.",
          "Street": "Straßenzeile der Adresse.",
          "Municipality": "Stadt oder Ort.",
          "Categories": "Jede dem Unternehmen zugeordnete Kategorie.",
          "About": "Attribute aus der Registerkarte „Info“.",
          "Plus Code": "Spalte für den Open Location Code reserviert – vorerst leer exportiert.",
          "Time Zone": "IANA-Zeitzone des Standorts.",
          "Price": "Preisniveau im Angebot angegeben.",
          "Note": "Händlernotiz oder Hervorhebung.",
          "Amenities": "Annehmlichkeiten und Serviceoptionen.",
          "Hotel Class": "Sterneklasse für Unterkunftsanzeigen.",
          "Phone": "Primäre Telefonnummer, die im Eintrag angezeigt wird.",
          "Phones": "Alle für das Unternehmen gefundenen Telefonnummern.",
          "Claimed": "Ob der Eigentümer das Profil beansprucht hat.",
          "Owner": "Besitzername im Profil.",
          "Owner Id": "Mitwirkender-ID des Besitzerkontos.",
          "Owner Link": "Link zur Mitwirkendenseite des Eigentümers.",
          "Email": "Auf der Unternehmenswebsite gefundene E-Mail-Adressen.",
          "Social Medias": "Von der Website verlinkte soziale Profile.",
          "Review Count": "Gesamtzahl der Bewertungen.",
          "Average Rating": "Durchschnittliche Sternebewertung.",
          "Review URL": "Direkter Link zum Bewertungspanel.",
          "Google Maps URL": "Stabiler Kurzlenker aus dem CID.",
          "Google Knowledge URL": "Suchlink für das Wissenspanel.",
          "Latitude": "Breitengrad in Dezimalgrad.",
          "Longitude": "Längengrad in Dezimalgrad.",
          "Website": "Offizielle Website aus der Auflistung.",
          "Domain": "Registrierbare Domain der Website.",
          "Opening Hours": "Wöchentliche Öffnungszeiten, geschlossene Tage markiert.",
          "Featured Image": "Titelbild URL der Auflistung.",
          "Cid": "Kunden-ID – die Dezimalform von FID.",
          "Fid": "Feature-ID bestehend aus zwei hexadezimalen Hälften.",
          "Place Id": "Stabil Google Place ID.",
          "Kgmid": "Knowledge Graph-Maschinen-ID."
        },
        "reviews": {
          "title": "+ 11 Rezensionsspalten",
          "body": "Separat exportiert, bis zum Limit Ihres Plans paginiert."
        },
        "photos": {
          "title": "+ Foto URL-Listen",
          "body": "Öffentliches Albumfoto URLs pro Unternehmen, Street View herausgefiltert."
        },
        "sampleCsv": "Laden Sie das Beispiel CSV herunter"
      },
      "enrichment": {
        "head": {
          "kicker": "Anreicherung",
          "title": {
            "lead": "Von einer PIN zu einer Person können Sie ",
            "accent": " per E-Mail an ",
            "tail": " senden"
          },
          "lead": "Wenn die Anreicherung aktiviert ist, überprüft MapsGrab die offizielle Website jedes Unternehmens und füllt während der Extraktion direkte Kontaktkanäle aus."
        },
        "points": [
          "Auf der Unternehmenswebsite gefundene E-Mail-Adressen",
          "Soziale Profile: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Bei kostenpflichtigen Online-Plänen standardmäßig aktiviert, eine Einstellung in der Erweiterung",
          "In API-Suchantworten mit einem Flag enthalten – kein separater Anreicherungsschritt"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Für Entwickler",
          "title": {
            "lead": "Stecken Sie Kartendaten in ",
            "accent": " und alles, was Sie mit ",
            "tail": " erstellen"
          },
          "lead": "Die Cloud-Engine hinter dem Online Scraper, verfügbar als HTTP API und MCP-Server. Strukturiertes JSON, ein Schlüssel, kein HTML zum Parsen."
        },
        "listLabel": "Entwicklerprodukte",
        "items": {
          "search": {
            "title": "Scraper API",
            "description": "Unternehmen für jedes Schlüsselwort und jeden Standort"
          },
          "reviews": {
            "title": "Bewertungen API",
            "description": "Bewertungen, Texte und Besitzerantworten"
          },
          "photos": {
            "title": "Fotos API",
            "description": "Öffentliches Foto URLs pro Unternehmen"
          },
          "mcp": {
            "title": "MCP-Server",
            "description": "Such- und Bewertungstools für jeden MCP-Kunden"
          }
        },
        "langLabel": "Sprache",
        "copyLabel": "Kopieranfrage",
        "sending": "Anfrage wird gesendet…",
        "response": "Antwort · 200 OK · {ms} ms",
        "toolCall": "Werkzeugaufruf · {tool} · 200 OK",
        "exploreApi": "Entdecken Sie den API",
        "apiPricing": "API-Preise",
        "worksWith": "Funktioniert mit den Tools, die Sie bereits verwenden",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP-Pakete"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Anwendungsfälle",
          "title": {
            "lead": "Für die Arbeit ",
            "accent": " wurde nach ",
            "tail": " die Suche durchgeführt"
          }
        },
        "cards": [
          {
            "label": "Lead-Generierung",
            "title": "Lokale Leadlisten",
            "body": "Durchsuchen Sie eine Kategorie und eine Stadt und exportieren Sie dann die gesamte Ergebnisseite – einschließlich Telefonnummern, Websites und E-Mails – in eine Tabelle."
          },
          {
            "label": "Lokales SEO",
            "title": "Wettbewerbs-Benchmarks",
            "body": "Rufen Sie in einem Durchgang Bewertungen und Rezensionszahlen für jeden Teilnehmer in einem Bereich ab und erstellen Sie den Bericht direkt aus dem Export."
          },
          {
            "label": "Marktforschung",
            "title": "Standortdatensätze",
            "body": "Sammeln Sie Orts-IDs und Koordinaten für jede Filiale oder jeden Mitbewerberstandort, bereit für Ihre Kartierungs- und Routing-Tools."
          }
        ],
        "leadTags": [
          "E-Mail",
          "Telefon",
          "E-Mail",
          "Website"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Preise",
          "title": {
            "lead": "Kostenlos starten.  ",
            "accent": " Skalieren Sie ",
            "tail": ", wenn es sich lohnt."
          },
          "lead": "Für jedes Produkt gibt es ein kostenloses Kontingent ohne zeitliche Begrenzung. Werten Sie nur die Oberfläche auf, die Sie tatsächlich nutzen."
        },
        "lines": {
          "extension": {
            "title": "Browser-Erweiterung",
            "billing": "Monatlich",
            "link": "Siehe Erweiterungspläne"
          },
          "online": {
            "title": "Online Scraper",
            "billing": "Einmalig",
            "link": "Siehe Online-Pläne"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Einmalig",
            "link": "Siehe API-Pläne"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Kostenlose Tools",
          "title": {
            "lead": "Kleine Tools für ",
            "accent": "Maps-Profis",
            "tail": ""
          },
          "lead": "Sieben Dienstprogramme, die vollständig in Ihrem Browser ausgeführt werden – was Sie einfügen, verlässt nie Ihr Gerät. Ausnahme ist der E-Mail-Checker: Er sendet die Adresse zur Prüfung an unseren Server."
        },
        "descriptions": {
          "place-id-finder": "Fügen Sie einen Kartenort URL ein und lesen Sie dessen Place ID, CID und FID aus.",
          "review-link-generator": "Holen Sie sich den direkten Link „Bewertung schreiben“ für jedes Unternehmen.",
          "email-checker": "Prüfen Sie, ob eine E-Mail-Adresse wirklich E-Mails empfangen kann.",
          "lat-long-to-dms": "Dezimalkoordinaten in Grad, Minuten und Sekunden.",
          "dms-to-dd": "DMS führt die Koordinaten zurück auf saubere Dezimalgrade.",
          "bulk-keywords-generator": "Jede „Keyword + Standort“-Kombination, bereit zum Einfügen.",
          "merge-csv": "CSV-Exporte in einer Datei zusammenführen, nach Header ausgerichtet."
        },
        "more": "Weitere Werkzeuge sind unterwegs"
      },
      "faq": {
        "kicker": "Häufige Fragen",
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "lead": "Die kurzen Antworten. Ansonsten ist der Support nur eine E-Mail entfernt.",
        "contact": "Kontaktieren Sie den Support",
        "items": [
          {
            "question": "Ist die Nutzung von MapsGrab kostenlos?",
            "answer": "Ja. Die Erweiterung funktioniert ohne Konto und beinhaltet ein kostenloses monatliches Kontingent an Datensätzen. Bezahlte Pläne auf der Seite „Preise“ erhöhen die Limits, wenn Sie mehr benötigen."
          },
          {
            "question": "Welche Browser werden unterstützt?",
            "answer": "Laden Sie MapsGrab von der Erweiterungsseite herunter. Chrome, Edge und Brave laden das entpackte ZIP; Firefox verwendet ein separates temporäres Add-on, das nach einem Neustart neu geladen werden muss. Die Seite enthält Installations- und Aktualisierungsanweisungen."
          },
          {
            "question": "Woher kommen die Daten und ist ihre Erhebung legal?",
            "answer": "MapsGrab sammelt nur Informationen, die auf den von Ihnen besuchten Google Maps-Seiten öffentlich angezeigt werden – dieselben Details, die jeder Besucher lesen kann. Wir greifen nicht auf private Konten, geschützte Inhalte oder nicht öffentliche Daten zu."
          },
          {
            "question": "Muss ich etwas für die Webtools installieren?",
            "answer": "Nein. Die kostenlosen Web-Tools laufen vollständig in Ihrem Browser – Ihre Eingaben verlassen nie Ihr Gerät. Ausnahme ist der E-Mail-Checker: Er sendet die eingegebene Adresse an unseren Server, wo ein E-Mail-Verifizierungsdienst sie prüft, ohne eine E-Mail zu versenden."
          },
          {
            "question": "In welche Formate kann ich exportieren?",
            "answer": "Exporte erfolgen als CSV oder JSON mit der von Ihnen gewählten Feldauswahl, dedupliziert durch Place ID."
          },
          {
            "question": "Sieht MapsGrab die von mir erfassten Daten?",
            "answer": "Ihre Einstellungen und Ergebnisse werden lokal in Ihrem Browser gespeichert. Unsere Server verarbeiten nur Remote-Konfiguration, Konto- und Kontingentstatus, optionale E-Mail-/soziale Anreicherung und minimale Nutzungsprotokolle."
          }
        ]
      },
      "cta": {
        "kicker": "Fangen Sie an",
        "title": {
          "lead": "Beginnen Sie mit dem Greifen in ",
          "accent": " Minuten ",
          "tail": ""
        },
        "lead": "Installieren Sie die Erweiterung, öffnen Sie Google Maps, suchen Sie und exportieren Sie Ihre erste Liste – kein Konto erforderlich.",
        "install": "Installieren Sie MapsGrab kostenlos",
        "online": "Probieren Sie den Online Scraper aus",
        "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab für Chrome, Edge und Firefox – Google Maps Extractor Extension",
        "description": "Extrahieren Sie 36-Spalten mit Geschäftsdaten, Bewertungen und Fotos aus Google Maps, reichern Sie Datensätze mit E-Mails und sozialen Links an, führen Sie Batch-Aufgaben aus und exportieren Sie nach CSV oder JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Herunterladen für Chrome, Edge und Firefox"
        },
        "title": {
          "lead": "Der Google Maps-Extraktor für ",
          "accent": " Ihren Browser ",
          "tail": ""
        },
        "lead": "Öffnen Sie eine beliebige Google Maps-Suche oder Unternehmensseite und greifen Sie zu, was dort öffentlich angezeigt wird – Geschäftsdaten, Bewertungen, Fotos und Kontaktdaten. Alles wird direkt über Ihren Browser nach CSV oder JSON exportiert.",
        "downloadCta": "Herunterladen für Chrome & Edge",
        "installCta": "Installationsanleitung",
        "meta": [
          "Kein Konto erforderlich",
          "1,000 kostenlose Datensätze/Monat",
          "Exporte bleiben auf Ihrem Computer"
        ],
        "theater": {
          "panelLabel": "Vorschau des MapsGrab-Panels",
          "extensionActive": "MapsGrab ist auf dieser Seite aktiv",
          "dock": "Links/rechts andocken",
          "filters": [
            "Jetzt geöffnet",
            "Bestbewertet",
            "Preis"
          ],
          "open": "Offen",
          "closes": "Schließt {time}",
          "endOfList": "Sie sind am Ende der Liste angelangt.",
          "start": "Datenerfassung starten",
          "extracting": "Extrahieren von {count}…",
          "pause": "Pause",
          "complete": "Extrahieren abgeschlossen.",
          "reset": "Zurücksetzen",
          "kpis": {
            "phones": "Telefone",
            "websites": "Websites",
            "emails": "E-Mails"
          },
          "exportCta": "Detaillierte Liste exportieren – {count} (.CSV)",
          "saved": "Unter „Downloads“ gespeichert",
          "scrollChip": {
            "label": "Automatisches Scrollen",
            "value": "Im menschlichen Tempo, 5–10 s"
          },
          "dedupeChip": {
            "label": "Dedupliziert",
            "value": "von Place ID"
          }
        }
      },
      "facts": {
        "caption": "Die Erweiterung auf einen Blick",
        "items": [
          {
            "value": 36,
            "label": "Spalten pro Unternehmen, vom Namen bis Place ID"
          },
          {
            "value": 11,
            "label": "Rezensionsspalten, einschließlich Antworten des Eigentümers"
          },
          {
            "value": 6,
            "label": "pro Website zugeordnete soziale Netzwerke"
          },
          {
            "value": 1000,
            "label": "Kostenlose Aufzeichnungen jeden Monat, kein Konto erforderlich"
          },
          {
            "value": 500,
            "label": "Schlüsselwörter oder überprüfen Sie URLs pro Batch-Aufgabe"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Wo es funktioniert",
          "title": {
            "lead": "Ein Panel für jede ",
            "accent": " Kartenansicht ",
            "tail": ""
          },
          "lead": "Das Bedienfeld MapsGrab erscheint direkt auf Google Maps. Suchergebnisse, Geschäftsseiten und gespeicherte Listen erhalten jeweils den richtigen Extraktionsmodus – kein Kopieren und Einfügen, kein Tab-Jonglieren."
        },
        "search": {
          "title": "Suchergebnisse",
          "description": "Drücken Sie bei jeder Suche auf „Extrahieren starten“. MapsGrab scrollt im menschlichen Tempo durch die Ergebnisliste und sammelt jede Auflistung, während sie geladen wird."
        },
        "place": {
          "title": "Geschäftsseiten",
          "description": "Auf einer Unternehmensseite führt die Registerkarte „Bewertungen und Fotos“ durch Bewertungen und Fotoalben – Bewertungen werden mit 11-Spalten exportiert, Fotos als URL-Listen.",
          "tabs": [
            "Überblick",
            "Rezensionen und Fotos"
          ],
          "reviewsCta": "Beginnen Sie mit dem Extrahieren von Bewertungen",
          "photosCta": "Beginnen Sie mit dem Extrahieren von Fotos",
          "reviewsCount": "{count} Bewertungen",
          "photosCount": "{count} Fotos"
        },
        "saved": {
          "title": "Gespeicherte Listen",
          "description": "Öffnen Sie eine gespeicherte Liste und drücken Sie einmal Start. MapsGrab öffnet nacheinander jeden Ort und sammelt ihn ein – keine Klicks pro Artikel.",
          "listName": "Favoriten · {count} Orte"
        }
      },
      "features": {
        "head": {
          "kicker": "Merkmale",
          "title": {
            "lead": "Alles, was auf einer Kartenseite angezeigt wird, hat die Struktur ",
            "accent": " und ",
            "tail": ""
          },
          "lead": "Ein Extraktionsschema für Suchergebnisse und Geschäftsseiten, abgestimmt auf die aktuelle Google Maps-Schnittstelle und remote aktualisiert, wenn sich Google ändert."
        },
        "tabsLabel": "Erweiterungsfunktionen",
        "tabs": [
          {
            "id": "business",
            "title": "Geschäftsdaten",
            "description": "36 Spalten pro Unternehmen, erfasst beim Scrollen der Liste."
          },
          {
            "id": "reviews",
            "title": "Rezensionen",
            "description": "Bewertungen mit Eigentümerantworten, automatisch ausgelagert."
          },
          {
            "id": "photos",
            "title": "Fotos",
            "description": "Albumfotos als gebrauchsfertige URL-Listen."
          },
          {
            "id": "enrichment",
            "title": "E-Mail- und soziale Bereicherung",
            "description": "Direkte Kontaktkanäle über die offizielle Website."
          },
          {
            "id": "batch",
            "title": "Batch-Aufgaben",
            "description": "Eine Warteschlange von Schlüsselwörtern oder Rezensionen URLs, die Artikel für Artikel durchsucht wurden."
          },
          {
            "id": "export",
            "title": "Export",
            "description": "CSV oder JSON, direkt auf Ihrem Computer gespeichert."
          }
        ],
        "business": {
          "claimed": "Behauptet",
          "fields": {
            "phone": "Telefon",
            "website": "Webseite",
            "rating": "Durchschnittliche Bewertung",
            "hours": "Öffnungszeiten",
            "timeZone": "Zeitzone",
            "coordinates": "Koordinaten",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} Bewertungen",
          "columns": "{count} Spalten pro Unternehmen",
          "reserved": "Plus-Code reserviert",
          "more": "+{count} mehr"
        },
        "reviews": {
          "title": "Rezensionen",
          "columns": "{count}-Spalten",
          "ownerReply": "Antwort vom Eigentümer",
          "loading": "Die nächste Seite mit Bewertungen wird geladen"
        },
        "photos": {
          "streetView": "Street View · gefiltert"
        },
        "enrichment": {
          "website": "Offizielle Website",
          "moreNetworks": "X, YouTube und TikTok haben es auch überprüft"
        },
        "batch": {
          "complete": "{count} komplett",
          "stuck": "{count} steckt fest",
          "total": "{count} insgesamt",
          "done": "Komplett · {count}",
          "skipped": "Kein Fortschritt für 90 s · übersprungen",
          "running": "Extrahieren…",
          "queued": "In der Warteschlange",
          "autoExport": "Der Export erfolgt automatisch, wenn die Aufgabe abgeschlossen ist"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} Zeilen · {selected} der {total} Spalten ausgewählt · dedupliziert durch Place ID",
          "destinations": [
            {
              "title": "Downloads",
              "description": "Wird von Ihrem Browser gespeichert"
            },
            {
              "title": "Spaltenauswahl",
              "description": "Exportieren Sie nur die Spalten, die Sie benötigen"
            },
            {
              "title": "Automatischer Download",
              "description": "Speichert, sobald die Extraktion abgeschlossen ist"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Batch-Aufgaben",
          "title": {
            "lead": "Stellen Sie die Liste in die Warteschlange.  ",
            "accent": " Geh weg. ",
            "tail": ""
          },
          "lead": "Fügen Sie bis zu 500-Schlüsselwörter ein oder überprüfen Sie URLs in einer Aufgabe. MapsGrab geht sie Element für Element mit Live-Fortschritt durch, überspringt alles, was ins Stocken gerät, und exportiert automatisch, wenn die Aufgabe abgeschlossen ist."
        },
        "checks": [
          "Schlüsselwortaufgaben führen eine Maps-Suche pro Schlüsselwort durch",
          "Review-URL-Aufgaben sammeln Bewertungen nach Unternehmen",
          "Der Aufgabenstatus wird auf der Festplatte gespeichert – er wird nach einem Browser-Neustart wieder aktiviert",
          "Bis zu 150 gespeicherte Aufgaben, jeweils ein Stapel ausgeführt"
        ],
        "mock": {
          "tabs": [
            "Tool für Massen-Keyword-Daten",
            "Bulk Google Bewertungen Extractor"
          ],
          "taskName": "Aufgabenname",
          "taskPlaceholder": "z.B. 100 Schlüsselwörter, Designagentur",
          "keywords": "Schlüsselwörter · eines pro Zeile",
          "lineCount": "{count} / {limit}",
          "start": "Datenerfassung starten",
          "columns": {
            "task": "Aufgabenname",
            "status": "Status",
            "actions": "Aktionen"
          },
          "running": "Läuft",
          "complete": "Vollständig",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} steckt fest",
          "progressExported": "{done} / {total} · exportiert",
          "lines": {
            "run": "extrahieren…",
            "done": "vollständig",
            "stuck": "stecken fest · übersprungen"
          },
          "toast": "Aufgabe abgeschlossen – exportiert",
          "chip": {
            "label": "Aufgabenstatus",
            "value": "Auf Datenträger gespeichert"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Lokal zuerst",
          "title": {
            "lead": "Ihre Ergebnisse bleiben ",
            "accent": " in Ihrem Browser ",
            "tail": ""
          },
          "lead": "Einstellungen und Ergebnisse werden lokal gespeichert. Unsere Server verarbeiten nur die Remote-Konfiguration, den Konto- und Kontingentstatus, optionale E-Mail- und soziale Bereicherung sowie minimale Nutzungsprotokolle."
        },
        "checks": [
          "Exporte werden auf Ihrem Computer generiert",
          "Die Spaltenauswahl und die Place ID-Deduplizierung werden lokal ausgeführt, bevor die Datei gespeichert wird",
          "Durch die Fernkonfiguration bleibt das Panel aktuell, wenn sich Google Maps ändert – keine Neuinstallation",
          "Wenn etwas nicht gelesen werden kann, zeigt das Panel einen Fehler an, anstatt stillschweigend auszufallen"
        ],
        "diagram": {
          "browser": "Ihr Browser",
          "servers": "MapsGrab-Server",
          "nodes": {
            "mapsTab": "Registerkarte Google Maps",
            "panel": "MapsGrab-Panel",
            "storage": "Lokaler Speicher",
            "exports": "Ihre Exporte",
            "config": "Remote-Konfiguration",
            "quota": "Konto und Kontingent",
            "enrichment": "Anreicherung"
          },
          "flows": {
            "rows": "Geschäftsreihen",
            "rules": "Regeln",
            "usage": "Verwendung",
            "websites": "Unternehmenswebsites → E-Mails und soziale Netzwerke"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Installieren",
          "title": {
            "lead": "Installieren Sie ",
            "accent": " MapsGrab ",
            "tail": ""
          },
          "lead": "Laden Sie hier ZIP herunter und befolgen Sie die Schritte für Ihren Browser. Chrome, Edge und Brave laden den entpackten Ordner. Firefox verwendet ein separates temporäres Add-on, das nach einem Neustart neu geladen werden muss. Klicken Sie auf ein Bild, um es in voller Größe anzuzeigen."
        },
        "zip": {
          "title": "Direktinstallation (Release-Zip)",
          "description": "Wählen Sie ZIP für Ihren Browser. Extrahieren Sie es in einen Ordner, den Sie behalten, und laden Sie es dann mithilfe der folgenden Anleitung. Laden Sie zum Aktualisieren ein neues ZIP herunter, ersetzen Sie die Dateien in diesem Ordner und laden Sie die Erweiterung neu.",
          "button": "Chrome, Edge & Brave ZIP",
          "firefoxButton": "Firefox ZIP (temporäre Ergänzung)",
          "meta": "Version {version} · Vorabversion"
        },
        "browserLabel": "Browser",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Edge",
            "note": "Edge, Chrome, Brave und andere Chromium-Browser",
            "steps": [
              {
                "title": "Herunterladen und entpacken",
                "description": [
                  "Herunterladen ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Klicken Sie auf Windows mit der rechten Maustaste und wählen Sie „Alle extrahieren“. Doppelklicken Sie auf macOS. Behalten Sie den extrahierten Ordner."
                ],
                "shot": "MapsGrab ZIP heruntergeladen in Chrome"
              },
              {
                "title": "Öffnen Sie die Erweiterungsseite",
                "description": [
                  "Offen ",
                  {
                    "code": "chrome://extensions"
                  },
                  " in Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " in Edge, oder ",
                  {
                    "code": "brave://extensions"
                  },
                  " in Brave."
                ],
                "shot": "Die Seite zur Erweiterungsverwaltung"
              },
              {
                "title": "Aktivieren Sie den Entwicklermodus",
                "description": [
                  "Aktivieren Sie den Entwicklermodus auf der Erweiterungsseite. Bei Chrome befindet sich der Schalter oben rechts."
                ],
                "shot": "Entwicklermodus aktiviert mit sichtbarer Schaltfläche „Entpackt laden“."
              },
              {
                "title": "Laden Sie den entpackten Ordner",
                "description": [
                  "Klicken Sie auf „Entpackt laden“ und wählen Sie den extrahierten Ordner aus. MapsGrab erscheint in der Erweiterungsliste. Öffnen Sie eine Google Maps-Suche, um sie zu verwenden."
                ],
                "shot": "Laden Sie es ausgepackt mit hinzugefügter MapsGrab-Karte"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Temporäres Add-on; Laden Sie es nach dem Neustart von Firefox neu",
            "steps": [
              {
                "title": "Herunterladen und entpacken",
                "description": [
                  "Herunterladen ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Klicken Sie auf Windows mit der rechten Maustaste und wählen Sie „Alle extrahieren“. Doppelklicken Sie auf macOS. Behalten Sie den extrahierten Ordner."
                ],
                "shot": "MapsGrab Firefox ZIP heruntergeladen in Firefox"
              },
              {
                "title": "Öffnen Sie die Debugging-Seite",
                "description": [
                  "Navigieren Sie zu ",
                  {
                    "code": "about:debugging"
                  },
                  ", und wählen Sie dann Ihren Browser in der linken Seitenleiste aus."
                ],
                "shot": "Firefox Debugging-Seite mit den temporären Add-on-Steuerelementen"
              },
              {
                "title": "Laden Sie das Add-on",
                "description": [
                  "Klicken Sie auf „Temporäres Add-on laden…“ und wählen Sie aus ",
                  {
                    "code": "manifest.json"
                  },
                  " im entpackten Ordner. Beim Neustart von Firefox wird ein temporäres Add-on entladen. Wiederholen Sie diesen Schritt, um es erneut zu laden."
                ],
                "shot": "MapsGrab wird als temporäre Firefox-Erweiterung geladen, wobei das Hintergrundskript ausgeführt wird"
              }
            ]
          }
        ],
        "help": {
          "title": "Installationsprobleme?",
          "description": "Senden Sie uns den Browsernamen und was Sie gesehen haben – wir entsperren Sie.",
          "cta": "Kontaktieren Sie den Support"
        },
        "notes": {
          "kicker": "Versionshinweise",
          "version": "0.1.0",
          "status": "Vorabversion",
          "date": "August 2026",
          "items": [
            "Erste Vorabversion der MapsGrab-Erweiterung",
            "Google Maps-Suchextraktion mit automatischem Scrollen und dem 36-Spaltenschema",
            "Überprüfung und Fotoextraktion von Unternehmensseiten",
            "E-Mail- und Social-Media-Anreicherung pro Unternehmen",
            "Batch-Schlüsselwort und Review-URL-Aufgaben mit Aufgabenstatus auf der Festplatte",
            "CSV / JSON-Export mit Feldauswahl und Place ID-Deduplizierung",
            "Builds für Microsoft Edge und Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Erweiterungspläne",
          "title": {
            "lead": "Eine Erweiterung, drei ",
            "accent": "Tarife",
            "tail": ""
          },
          "lead": "Jede Zeile, die die Erweiterung sammelt – ein Unternehmen, eine Rezension oder ein Foto – zählt als ein Datensatz. Alle Pläne beinhalten Rezensionen, Fotos und Batch-Aufgaben; Bezahlte Pläne exportieren alle 36-Spalten, einschließlich E-Mail- und Social Enrichment, mit einem größeren monatlichen Volumen."
        },
        "note": "Monatliche Nutzungsrücksetzungen auf dem 1st in der New York-Zeit; Nicht verwendete Datensätze werden nicht übertragen.",
        "compare": "Vergleichen Sie alle Pläne"
      },
      "faq": {
        "kicker": "Häufige Fragen",
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "lead": "Die kurzen Antworten. Ansonsten ist der Support nur eine E-Mail entfernt.",
        "contact": "Kontaktieren Sie den Support",
        "items": [
          {
            "question": "Ist die Nutzung der Erweiterung kostenlos?",
            "answer": "Ja. Die Erweiterung funktioniert ohne Konto und beinhaltet jeden Monat 1,000-Datensätze. Bezahlte Pläne auf der Preisseite fügen alle 36-Spalten mit E-Mail- und Social-Media-Anreicherung hinzu und erhöhen das monatliche Volumen."
          },
          {
            "question": "Welche Browser werden unterstützt?",
            "answer": "Chrome, Edge, Brave und andere Chromium-Browser laden den hier heruntergeladenen entpackten ZIP. Firefox verfügt über einen separaten ZIP zum temporären Laden; Laden Sie es nach jedem Browser-Neustart neu. Befolgen Sie die Installationsanleitung oben."
          },
          {
            "question": "Muss ich mich anmelden?",
            "answer": "Nein. Die Kernextraktion funktioniert ohne Konto. Das Kontingent wird pro angemeldetem Konto oder pro Browsergerät gezählt, wenn Sie nicht angemeldet sind. Melden Sie sich mit dem Konto an, das einen Plan besitzt, damit dessen höheres Volumen gilt."
          },
          {
            "question": "Was gilt als Rekord?",
            "answer": "Jede Zeile, die die Erweiterung sammelt, zählt als ein Datensatz: ein Unternehmen aus einer Suche oder einer gespeicherten Liste, eine Rezension oder ein Foto. Durch E-Mail- und soziale Bereicherung werden keine Datensätze hinzugefügt."
          },
          {
            "question": "Was passiert, wenn sich Google Maps ändert?",
            "answer": "Extraktionsregeln werden als Remote-Konfiguration ausgeliefert, sodass Korrekturen das Panel erreichen, ohne dass die Erweiterung neu installiert werden muss. Wenn eine Seite nicht gelesen werden kann, zeigt das Panel einen Fehler an, anstatt stillschweigend auszufallen."
          },
          {
            "question": "Sieht MapsGrab die von mir erfassten Daten?",
            "answer": "Ihre Einstellungen und Ergebnisse werden lokal in Ihrem Browser gespeichert. Unsere Server verarbeiten nur die Remote-Konfiguration, den Konto- und Kontingentstatus, optionale E-Mail- und soziale Bereicherung sowie minimale Nutzungsprotokolle."
          },
          {
            "question": "Woher kommen die Daten und ist ihre Erhebung legal?",
            "answer": "MapsGrab sammelt nur Informationen, die auf den von Ihnen besuchten Google Maps-Seiten öffentlich angezeigt werden – dieselben Details, die jeder Besucher lesen kann. Wir greifen nicht auf private Konten, geschützte Inhalte oder nicht öffentliche Daten zu."
          }
        ]
      },
      "cta": {
        "kicker": "Fangen Sie an",
        "title": {
          "lead": "Schnappen Sie sich noch heute Ihre erste Liste ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Installieren Sie die Erweiterung, suchen Sie nach Google Maps und exportieren Sie eine saubere Tabelle – kein Konto erforderlich.",
        "primary": "Installieren Sie MapsGrab",
        "secondary": "Tarife vergleichen",
        "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Website-Zugriff",
        "title": "Melden Sie sich an, um Ihre Credits zu synchronisieren",
        "trigger": "anmelden",
        "modalTitle": "Melden Sie sich an, um fortzufahren",
        "closeLabel": "Schließen",
        "signedInAs": "Angemeldet als",
        "continueWithGoogle": "Fahren Sie mit Google fort",
        "googleLoading": "Eröffnung Google...",
        "or": "oder",
        "emailLabel": "E-Mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Weiter mit E-Mail",
        "sendCode": "Code senden",
        "sendingCode": "Senden...",
        "sendCodeSuccess": "Bestätigungscode gesendet.",
        "sendAgain": "Nochmals senden",
        "codeLabel": "Bestätigungscode",
        "codePlaceholder": "123456",
        "signIn": "anmelden",
        "termsNotice": "Mit der Anmeldung stimmen Sie dem zu",
        "termsLink": "Bedingungen",
        "privacyLink": "Datenschutzrichtlinie",
        "logout": "Abmelden",
        "creditsLabel": "Guthaben",
        "enterEmailFirst": "Bitte geben Sie zunächst Ihre E-Mail-Adresse ein.",
        "enterEmailAndCode": "Bitte geben Sie sowohl die E-Mail-Adresse als auch den Bestätigungscode ein.",
        "sendCodeFailed": "Der Bestätigungscode konnte nicht gesendet werden.",
        "googleSignInFailed": "Google-Anmeldung fehlgeschlagen.",
        "googleClientMissing": "Die Google-Anmeldung ist nicht konfiguriert.",
        "signInFailed": "Anmeldung fehlgeschlagen."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Zahlung storniert",
        "canceledMessage": "Diese Bestellung wurde nicht bezahlt. Sie können diese Registerkarte schließen und im ursprünglichen Fenster erneut eine Zahlungsmethode auswählen.",
        "canceledMetaDescription": "Ihre PayPal-Zahlung wurde storniert.",
        "waitingTitle": "Zahlung eingereicht",
        "waitingMessage": "Sie können zur ursprünglichen Registerkarte zurückkehren. Wir überprüfen die PayPal-Bestätigung alle 3 Sekunden und das Ergebnis wird hier automatisch angezeigt.",
        "confirmedCreditsTitle": "Guthaben hinzugefügt",
        "confirmedCreditsMessage": "Ihre PayPal-Zahlung ist bestätigt und die Credits wurden hinzugefügt. Sie können diese Registerkarte schließen und im ursprünglichen Fenster fortfahren.",
        "confirmedSubscriptionTitle": "Abonnement aktiviert",
        "confirmedSubscriptionMessage": "Ihre PayPal-Zahlung ist bestätigt und Ihr MapsGrab-Plan ist aktiv. Sie können diese Registerkarte schließen und im ursprünglichen Fenster fortfahren.",
        "failedTitle": "Die Bezahlung braucht Aufmerksamkeit",
        "failedMessage": "Wir konnten diese Bestellung nicht automatisch bestätigen. Kehren Sie zum ursprünglichen Fenster zurück oder versuchen Sie dort, Ihren Zahlungsstatus zu aktualisieren."
      },
      "checkin": {
        "accountButtonLabel": "Kontomenü öffnen",
        "accountMenuLabel": "Kontomenü"
      },
      "creditPurchase": {
        "title": "Holen Sie sich mehr Credits",
        "description": "Fügen Sie Credits hinzu und nutzen Sie weiterhin kostenpflichtige Funktionen in diesem Arbeitsbereich.",
        "successTitle": "Guthaben hinzugefügt",
        "successDescription": "Ihr Guthaben wurde aktualisiert. Schließen Sie dieses Fenster und fahren Sie fort.",
        "packageEyebrow": "Bezahlen Sie je nach Bedarf",
        "cardNote": "Verwenden Sie Credits für kostenpflichtige Website-Funktionen. Credits verfallen nie.",
        "creditsAmount": "{credits} Credits",
        "buyNow": "Jetzt kaufen",
        "selectPackage": "Wählen",
        "paymentMethodLabel": "Wählen Sie die Zahlungsmethode",
        "paymentTitle": "Wählen Sie die Zahlungsmethode",
        "selectedPackageLabel": "Ausgewähltes Paket",
        "confirmPurchase": "Weiter zur Zahlung",
        "backToProducts": "Zurück",
        "close": "Schließen",
        "agreementText": "Ich stimme den Kaufbedingungen, AGB und Datenschutzbestimmungen zu.",
        "loadingConfigs": "Credits-Pakete werden geladen...",
        "loadFailed": "Credits-Pakete konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
        "noConfigs": "Derzeit sind keine Credits-Pakete verfügbar. Bitte versuchen Sie es später noch einmal.",
        "ready": "Wählen Sie ein Credits-Paket. Die Preise werden in USD angezeigt.",
        "creatingOrder": "Ordnung schaffen...",
        "pendingPayment": "Schließen Sie die Zahlung im neu geöffneten Tab ab. Wir prüfen das Ergebnis automatisch.",
        "pendingPaymentTitle": "Warten auf Zahlung",
        "cancelPayment": "Zahlung stornieren",
        "supportMailPrefix": "Melden Sie ein Problem: ",
        "success": "Zahlung abgeschlossen. Credits sind ab sofort verfügbar.",
        "failed": "Die Zahlung ist nicht abgeschlossen. Sie können es erneut versuchen oder dieses Fenster schließen.",
        "successCredits": "+{credits} Credits hinzugefügt",
        "successBalance": "Aktueller Kontostand: {balance} Credits",
        "createFailed": "Bestellung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        "invalidPaymentData": "Der Zahlungslink ist ungültig. Bitte versuchen Sie es später noch einmal.",
        "priceUpdated": "Preis geändert. Überprüfen Sie den aktuellen Preis und kaufen Sie erneut.",
        "gatewayFailed": "Die Zahlungseingabe ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später noch einmal.",
        "paymentCanceled": "Die Zahlung wurde storniert. Wählen Sie eine Zahlungsmethode und versuchen Sie es erneut.",
        "pollFailed": "Der Zahlungsstatus konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        "pollTimeout": "Zeitüberschreitung bei der automatischen Aktualisierung. Verwenden Sie nach der Zahlung die Schaltfläche „Aktualisieren“.",
        "orderNotFound": "Die Bestellung ist nicht mehr verfügbar. Erstellen Sie eine neue Bestellung.",
        "orderExpired": "Bestellung abgelaufen. Bitte kaufen Sie erneut.",
        "fulfillmentFailed": "Die Zahlung ist eingegangen, aber es wurden noch keine Credits hinzugefügt. Bitte versuchen Sie es später noch einmal.",
        "authExpired": "Anmeldung abgelaufen. Melden Sie sich erneut an, um fortzufahren.",
        "popupBlocked": "Ihr Browser hat das neue Fenster blockiert. Erlauben Sie MapsGrab, Pop-ups zu öffnen, und versuchen Sie es erneut."
      }
    },
    "pricing": {
      "seo": {
        "title": "Preise – Online-, Erweiterungs- und API-Pläne | MapsGrab",
        "description": "MapsGrab-Pläne für jede Oberfläche: Online Scraper ab $19, Browser-Erweiterung ab $39, und API ab $15. Kostenlose Stufen sind in jedem Produkt enthalten – einmalige natürliche Monatspläne für Online und API, monatliche Abonnements für Extension."
      },
      "hero": {
        "kicker": "Preise",
        "title": {
          "lead": "Pläne für ",
          "accent": " drei Möglichkeiten ",
          "tail": ", um Kartendaten abzurufen"
        },
        "lead": "Wählen Sie die Oberfläche aus, die zu Ihrem Workflow passt – Cloud Online Scraper, Browser-Erweiterung oder HTTP API – und wählen Sie dann das monatliche Volumen aus. Upgraden oder kaufen Sie auf dieser Seite in wenigen Minuten.",
        "meta": [
          "Kostenloses Kontingent für jedes Produkt",
          "Bezahlen Sie mit PayPal",
          "Upgraden Sie, indem Sie die Differenz bezahlen"
        ],
        "switchLabel": "Produktlinie"
      },
      "popularLabel": "Am beliebtesten",
      "tabs": {
        "online": {
          "name": "Online Scraper",
          "shortName": "Online",
          "switchMeta": "Ab {price} · einmalig",
          "unit": "Aufzeichnungen",
          "eyebrow": "Online-Scraper-Pläne",
          "title": "Cloud-Extraktion, Preis nach Datensätzen",
          "description": "Führen Sie die MapsGrab-Engine in unserer Infrastruktur aus. Ein Datensatz ist eine erfasste Geschäftszeile. Bezahlte Pläne beinhalten optionale E-Mail- und Social-Media-Anreicherung ohne zusätzliche Aufzeichnungskosten.",
          "billingChips": [
            "Einmalige Zahlung",
            "Deckt einen natürlichen Monat ab",
            "Keine automatische Verlängerung"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Frei",
              "tagline": "Probieren Sie den Wolkenkratzer im kleinen Maßstab aus",
              "price": "$0",
              "periodLabel": "für immer",
              "quota": "1,000 Datensätze/Monat",
              "features": [
                "Geschäftsextraktion mit 37-Spalte CSV-Export",
                "Bis zu 2 Schlüsselwörter pro Aufgabe",
                "Karten- und Regionsmodi für Gebietssuchen",
                "E-Mail- und soziale Bereicherung bei kostenpflichtigen Plänen",
                "Ein deduplizierter CSV pro Aufgabe"
              ],
              "ctaLabel": "Kostenlos starten",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Für gelegentliche einmalige Exporte",
              "price": "$19",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "20,000 Datensätze/Monat",
              "features": [
                "Alles kostenlos",
                "20,000-Datensätze für den Monat 1",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "Bis zu 5 Schlüsselwörter pro Aufgabe",
                "E-Mail- und soziale Bereicherung, standardmäßig aktiviert und optional"
              ],
              "ctaLabel": "Holen Sie sich Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Basic",
              "tagline": "Für eine kontinuierliche wöchentliche Lead-Sammlung",
              "price": "$49",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "80,000 Datensätze/Monat",
              "features": [
                "Alles in Lite",
                "80,000-Datensätze für den Monat 1",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "Bis zu 10 Schlüsselwörter pro Aufgabe"
              ],
              "ctaLabel": "Holen Sie sich Basic",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Wachstum",
              "tagline": "Für wachsende Bleileitungen",
              "price": "$99",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "250,000 Datensätze/Monat",
              "features": [
                "Alles in Basic",
                "250,000-Datensätze für den Monat 1",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "Bis zu 20 Schlüsselwörter pro Aufgabe"
              ],
              "ctaLabel": "Holen Sie sich Wachstum",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Professional",
              "tagline": "Für Agenturen und datenlastige Teams",
              "price": "$149",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "500,000 Datensätze/Monat",
              "features": [
                "Alles im Wachstum",
                "500,000-Datensätze für den Monat 1",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "Bis zu 50 Schlüsselwörter pro Aufgabe"
              ],
              "ctaLabel": "Werden Sie professionell",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Einmalige Zahlung für einen natürlichen Monat – Pläne auf dieser Registerkarte verlängern sich nicht automatisch. Ein Datensatz ist eine Geschäftszeile, die von Google Maps erfasst wird; Nutzungsrücksetzungen auf dem 1st und ungenutzte Datensätze werden nicht übertragen.",
          "compare": {
            "lead": "Online-Scraper-Pläne – Cloud-Extraktion, Preis nach Datensätzen.",
            "volume": "Aufzeichnungen pro Monat",
            "groups": [
              {
                "label": "Daten",
                "rows": [
                  {
                    "label": "Geschäftsextraktion mit 37-Spalte CSV-Export",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "E-Mail- und soziale Bereicherung",
                    "cells": [
                      false,
                      "Standardmäßig aktiviert, optional",
                      "Standardmäßig aktiviert, optional",
                      "Standardmäßig aktiviert, optional",
                      "Standardmäßig aktiviert, optional"
                    ]
                  }
                ]
              },
              {
                "label": "Arbeitsablauf",
                "rows": [
                  {
                    "label": "Schlüsselwörter pro Aufgabe",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Karten- und Regionsmodi",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Ein deduplizierter CSV pro Aufgabe",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Gilt für das monatliche Rekordkontingent MapsGrab Online Scraper.",
            "successTitle": "Plan aktiviert",
            "successDescription": "Ihr einmaliger 1-Monatsplan ist live. Der Online Scraper holt es bei der nächsten Kontingentaktualisierung ab."
          }
        },
        "extension": {
          "name": "Erweiterung",
          "shortName": "Erweiterung",
          "switchMeta": "Ab {price} · einmalig",
          "unit": "Aufzeichnungen",
          "eyebrow": "Erweiterungspläne",
          "title": "Browser-Extraktion, Preis nach Datensätzen",
          "description": "Jede Zeile, die die Erweiterung sammelt – ein Unternehmen, eine Rezension oder ein Foto – zählt als ein Datensatz. Alle Pläne beinhalten Rezensionen, Fotos und Batch-Aufgaben; Bezahlte Pläne exportieren alle 36-Spalten, einschließlich E-Mail- und Social Enrichment.",
          "billingChips": [
            "Einmalige Zahlung",
            "1 Zugriffsmonat",
            "Keine automatische Verlängerung"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Frei",
              "tagline": "Kerngewinnung im kleinen Maßstab",
              "price": "$0",
              "periodLabel": "für immer",
              "quota": "1,000 Datensätze/Monat",
              "features": [
                "Extraktion von Geschäftsdaten",
                "Rezensionen (Spalten 11) und Foto URLs",
                "Batch-Schlüsselwort- und Review-URL-Aufgaben",
                "CSV / JSON Export mit Feldauswahl"
              ],
              "ctaLabel": "Installieren Sie die Erweiterung",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Für Freiberufler und wachsende Lead-Pipelines",
              "price": "$39",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "100,000 Datensätze/Monat",
              "features": [
                "Alles kostenlos",
                "100,000 zeichnet jeden Monat auf",
                "Vollständige 36-Spalten-Geschäftsextraktion",
                "E-Mail- und Social-Media-Anreicherung"
              ],
              "ctaLabel": "Holen Sie sich Pro",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Geschäft",
              "tagline": "Für Agenturen und datenlastige Teams",
              "price": "$99",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "500,000 Datensätze/Monat",
              "features": [
                "Alles in Pro",
                "500,000 zeichnet jeden Monat auf",
                "Platz für Multi-Market-Batch-Aufgaben",
                "Dieselbe Local-First-Exportpipeline"
              ],
              "ctaLabel": "Holen Sie sich Geschäfte",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Jede Zeile, die die Erweiterung sammelt, zählt als ein Datensatz: ein Unternehmen aus einer Suche oder einer gespeicherten Liste, eine Rezension oder ein Foto. Durch E-Mail- und soziale Bereicherung werden keine Datensätze hinzugefügt. Monatliche Nutzungsrücksetzungen auf dem 1st; Nicht verwendete Datensätze werden nicht übertragen.",
          "compare": {
            "lead": "Erweiterungspläne – Browser-Extraktion, Preis nach Datensätzen.",
            "volume": "Aufzeichnungen pro Monat",
            "groups": [
              {
                "label": "Daten",
                "rows": [
                  {
                    "label": "Extraktion von Geschäftsdaten",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Vollständige 36-Spalten-Geschäftsextraktion",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Rezensionen (Spalten 11) und Foto URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "E-Mail- und Social-Media-Anreicherung",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Batch-Schlüsselwort- und Review-URL-Aufgaben",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Export",
                "rows": [
                  {
                    "label": "CSV / JSON Export mit Feldauswahl",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Local-First-Exportpipeline",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Gilt für das monatliche Kontingent der Browsererweiterung MapsGrab.",
            "successTitle": "Plan aktiviert",
            "successDescription": "Ihr einmaliger 1-Monatsplan ist live. Die Erweiterung übernimmt es bei der nächsten Kontingentaktualisierung."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "Ab {price} · einmalig",
          "unit": "Anfragen",
          "eyebrow": "API-Pläne",
          "title": "Programmgesteuerter Zugriff, Preis je nach Anfrage",
          "description": "Durchsuchen Sie Google Maps-Unternehmen und rufen Sie deren Bewertungen aus Ihren eigenen Anwendungen über ein einfaches HTTP API ab. Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch wenn er keine Ergebnisse oder Teildaten zurückgibt.",
          "billingChips": [
            "Einmalige Zahlung",
            "Deckt einen natürlichen Monat ab",
            "Keine automatische Verlängerung"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Frei",
              "tagline": "Bewerten Sie den API im kleinen Maßstab",
              "price": "$0",
              "periodLabel": "für immer",
              "quota": "20 Anfragen/Monat",
              "features": [
                "Unternehmenssuche nach Stichwort und Standort",
                "Endpunkt für Bewertungen mit Sortierung und Paging",
                "JSON-Antworten",
                "API-Schlüssel, der mit Ihrem Konto verknüpft ist",
                "Community-Unterstützung"
              ],
              "ctaLabel": "Kostenlos starten",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Basic",
              "tagline": "Für Prototypen und Lichtintegrationen",
              "price": "$15",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "1,000 Anfragen/Monat",
              "features": [
                "Alles kostenlos",
                "1,000 fordert für den Monat 1 an",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "JSON-Antworten"
              ],
              "ctaLabel": "Holen Sie sich Basic",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Professional",
              "tagline": "Für Produktionsintegrationen",
              "price": "$65",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "5,000 Anfragen/Monat",
              "features": [
                "Alles in Basic",
                "5,000 fordert für den Monat 1 an",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "JSON-Antworten"
              ],
              "ctaLabel": "Werden Sie professionell",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Geschäft",
              "tagline": "Für Produkte, die auf MapsGrab-Daten basieren",
              "price": "$115",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "10,000 Anfragen/Monat",
              "features": [
                "Alles in Professional",
                "10,000 fordert für den Monat 1 an",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "JSON-Antworten"
              ],
              "ctaLabel": "Holen Sie sich Geschäfte",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Skala",
              "tagline": "Für Datenoperationen mit hohem Datenvolumen",
              "price": "$365",
              "periodLabel": "einmalig · 1 Monat",
              "quota": "50,000 Anfragen/Monat",
              "features": [
                "Alles im Geschäft",
                "50,000 fordert für den Monat 1 an",
                "Einmalige Zahlung – keine automatische Verlängerung",
                "JSON-Antworten"
              ],
              "ctaLabel": "Holen Sie sich Skalierung",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Einmalige Zahlung für einen natürlichen Monat – Pläne auf dieser Registerkarte verlängern sich nicht automatisch. Jeder erfolgreiche API- oder MCP-Aufruf zählt als eine Anfrage, einschließlich leerer und teilweiser Ergebnisse; Fehlgeschlagene Anrufe werden nicht gezählt. Nutzungsrücksetzungen auf dem 1st und ungenutzte Anforderungen werden nicht übertragen.",
          "compare": {
            "lead": "API-Pläne – programmatischer Zugriff, Preis je nach Anfrage.",
            "volume": "Anfragen pro Monat",
            "groups": [
              {
                "label": "Endpunkte",
                "rows": [
                  {
                    "label": "Unternehmenssuche nach Stichwort und Standort",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Endpunkt für Bewertungen mit Sortierung und Paging",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON-Antworten",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "MCP-Server mit demselben API-Schlüssel",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Zugang",
                "rows": [
                  {
                    "label": "API-Schlüssel, der mit Ihrem Konto verknüpft ist",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Community-Unterstützung",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Gilt für das monatliche Anforderungskontingent MapsGrab API.",
            "successTitle": "Plan aktiviert",
            "successDescription": "Ihr einmaliger 1-Monatsplan ist live. Ihr API-Schlüssel übernimmt das neue Kontingent bei der nächsten Anfrage."
          }
        }
      },
      "plansSection": {
        "label": "Pläne",
        "finder": {
          "label": "Wie viele {unit} benötigen Sie im Monat?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} pro Monat – {plan}-Plan",
          "fits": "Passt"
        }
      },
      "compare": {
        "kicker": "Vergleichen",
        "title": {
          "lead": "Jeder Plan, ",
          "accent": " nebeneinander ",
          "tail": ""
        },
        "plan": "Planen",
        "volumeGroup": "Volumen & Abrechnung",
        "billing": "Abrechnung",
        "included": "Im Lieferumfang enthalten",
        "notIncluded": "Nicht im Lieferumfang enthalten",
        "allPlans": "In jedem Tarif enthalten"
      },
      "usage": {
        "head": {
          "kicker": "Verwendung",
          "title": {
            "lead": "Was auf Ihr ",
            "accent": "Kontingent",
            "tail": " angerechnet wird"
          },
          "lead": "Zwei Einheiten: Datensätze für die Erweiterung und den Online Scraper, Anfragen für API – und beide werden am 1st jedes Monats zurückgesetzt."
        },
        "records": {
          "meter": "In diesem Monat verwendete Datensätze",
          "badge": "Erweiterung · Online",
          "title": "1-Datensatz = 1 erfasste Zeile",
          "body": "Jede Zeile, die Sie sammeln, zählt als ein Datensatz: ein Unternehmen im Online Scraper; ein Unternehmen, eine Bewertung oder ein Foto in der Erweiterung. Durch E-Mail- und soziale Bereicherung werden keine Datensätze hinzugefügt.",
          "count": "+1-Datensatz",
          "attachments": [
            "Telefon & Website",
            "Öffnungszeiten",
            "E-Mail und soziale Netzwerke"
          ]
        },
        "requests": {
          "meter": "In diesem Monat verwendete Anfragen",
          "badge": "API · MCP",
          "title": "1-Anfrage = 1 erfolgreicher Aufruf",
          "body": "Eine Anfrage ist ein erfolgreicher API-Aufruf, auch wenn keine Ergebnisse oder Teildaten zurückgegeben werden. Fehlgeschlagene Anrufe werden nicht gezählt. MCP-Toolaufrufe beanspruchen das gleiche Anforderungskontingent.",
          "counted": "Erfolgreicher Anruf – gezählt",
          "notCounted": "Fehlgeschlagener Anruf – nicht gezählt"
        },
        "reset": {
          "title": "Wird auf dem 1st zurückgesetzt",
          "body": "Die Nutzung wird am 1st jedes Monats zurückgesetzt. Nicht verwendete Datensätze und Anforderungen werden nicht übertragen.",
          "limit": "Planlimit",
          "unused": "Unbenutzt · rollt nicht um",
          "flag": "Zurücksetzen"
        }
      },
      "billing": {
        "head": {
          "kicker": "Abrechnung",
          "title": {
            "lead": "Einfache Abrechnung, ",
            "accent": " keine Überraschungen ",
            "tail": ""
          },
          "lead": "Wie Zahlung, Verlängerung und Upgrades in den drei Produktlinien funktionieren."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Bezahlen Sie jeden Plan über PayPal. Schließen Sie Ihre Zahlung auf PayPal ab und kehren Sie hierher zurück, um Ihren Plan zu aktivieren."
          },
          "cadence": {
            "title": "Einmalige Zahlung",
            "body": "Jeder kostenpflichtige Plan deckt einen natürlichen Monat ab. Zahlen Sie einmalig ohne automatische Gebühren; Kaufen Sie es erneut, wenn Sie einen weiteren Monat benötigen."
          },
          "upgrade": {
            "title": "Upgraden Sie, indem Sie die Differenz bezahlen",
            "body": "Verschieben Sie einen aktiven Plan über Ihren aktuellen Zahlungsanbieter auf eine berechtigte höhere Stufe. Ihr Ablaufdatum und Ihre bisherige Nutzung bleiben unverändert."
          },
          "independent": {
            "title": "Unabhängige Pläne",
            "body": "Pläne auf verschiedenen Registerkarten sind unabhängig. Wenn ein Plan abläuft, kehrt das Konto automatisch zum kostenlosen Kontingent zurück."
          }
        }
      },
      "plans": {
        "loading": "Zahlungsoptionen werden geladen...",
        "loadFailed": "Die Zahlungsoptionen konnten nicht geladen werden. Aktualisieren Sie die Seite, um es erneut zu versuchen.",
        "noChannels": "Für diesen Plan ist derzeit keine Zahlungsmethode verfügbar.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Zahlung unvollständig",
        "billingPeriodMonthly": "1 Monat",
        "billingAutoRenew": "Automatische Verlängerung bis zur Kündigung",
        "billingOneTime": "Einmalige Zahlung"
      },
      "upgrade": {
        "currentPlan": "Aktueller Plan",
        "button": "Upgrade · {amount}",
        "title": "Aktualisieren Sie Ihren Plan",
        "confirm": "Bestätigen Sie das Upgrade",
        "oneTime": "Einmalige Differenz über {channel}. Ihr Ablaufdatum bleibt {date}.",
        "autoRenew": "Die Differenz wird sofort über {channel} verrechnet. Ihr Ablaufdatum bleibt {date}; Für zukünftige Verlängerungen wird der neue Planpreis verwendet.",
        "pendingTitle": "Warten auf Ihr Upgrade",
        "pendingDescription": "Ihr Zahlungsanbieter wendet das Upgrade an. Ihr aktueller Plan bleibt aktiv, bis er bestätigt wird.",
        "successTitle": "Plan aktualisiert",
        "successDescription": "Ihr neues Kontingent ist aktiv. Ihr Ablaufdatum bleibt {date}.",
        "quoteFailed": "Ihr Upgrade-Preis konnte nicht geladen werden. Aktualisieren Sie die Seite, um es erneut zu versuchen.",
        "failed": "Ihr Upgrade konnte nicht bestätigt werden. Aktualisieren Sie die Seite, um Ihren Plan zu überprüfen, bevor Sie es erneut versuchen.",
        "reasons": {
          "no_active_subscription": "Ihr Plan ist nicht mehr aktiv. Aktualisieren Sie die Seite, um einen Plan auszuwählen.",
          "not_higher_tier": "Wählen Sie eine höhere Stufe für das Upgrade oder warten Sie, bis Ihr Plan abläuft, um die Stufe zu wechseln.",
          "non_positive_diff": "Ihr verbleibender Planwert ist nicht niedriger als diese Stufe. Sie können die Stufen ändern, nachdem Ihr Plan abgelaufen ist.",
          "channel_unavailable": "Upgrades sind mit Ihrer aktuellen Zahlungsmethode nicht verfügbar. Sie können den Plan nach Ablauf ändern."
        }
      },
      "faq": {
        "kicker": "Häufige Fragen",
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "lead": "Die Grundlagen der Abrechnung. Ansonsten ist der Support nur eine E-Mail entfernt.",
        "contact": "Kontaktieren Sie den Support",
        "items": [
          {
            "question": "Was gilt als Rekord?",
            "answer": "Ein Datensatz ist eine gesammelte Zeile – dieselbe Einheit, die auch die kostenlosen Pläne zählen. Auf dem Online Scraper ist das ein Geschäft; In der Erweiterung ist jedes erfasste Unternehmen, jede Bewertung oder jedes erfasste Foto ein Datensatz. Durch E-Mail- und soziale Bereicherung werden keine Datensätze hinzugefügt. Auf der Registerkarte API wird die Nutzung stattdessen in erfolgreichen Anfragen gezählt."
          },
          {
            "question": "Benötige ich einen kostenpflichtigen Plan, um MapsGrab auszuprobieren?",
            "answer": "Nein. Für jedes Produkt gibt es ein kostenloses Kontingent ohne zeitliche Begrenzung: Der Online Scraper und die Erweiterung umfassen 1,000-Datensätze pro Monat, und API umfasst 20-Anfragen pro Monat. Die kostenlosen Online-Scraper- und Erweiterungspläne beinhalten keine E-Mail- oder Social-Media-Anreicherung. Bezahlte Online-Pläne beinhalten es standardmäßig und Sie können es für jede Aufgabe deaktivieren."
          },
          {
            "question": "Wie gilt das Kontingent für mein Konto?",
            "answer": "Das Kontingent wird pro angemeldetem Konto gezählt (und pro Browsergerät für die Erweiterung, wenn Sie nicht angemeldet sind). Melden Sie sich mit dem Konto an, dem der Plan gehört, sodass die höhere Obergrenze gilt. Wenn ein Plan abläuft, kehrt das Konto automatisch zum kostenlosen Kontingent zurück."
          },
          {
            "question": "Wird mein Plan automatisch verlängert?",
            "answer": "Nein. Bei allen Plänen handelt es sich um einmalige PayPal-Zahlungen, die einen natürlichen Monat abdecken. Wenn Ihr Plan abläuft, kehren Sie zum kostenlosen Kontingent zurück. Kaufen Sie erneut, um mit einem kostenpflichtigen Plan fortzufahren."
          },
          {
            "question": "Kann ich zwischen den Stufen wechseln?",
            "answer": "Sie können einen aktiven Plan auf eine berechtigte höhere Stufe upgraden, indem Sie die Differenz über PayPal bezahlen. Ihr Ablaufdatum und Ihre bisherige Nutzung bleiben unverändert. Pläne auf verschiedenen Registerkarten sind unabhängig."
          }
        ]
      },
      "cta": {
        "kicker": "Fangen Sie an",
        "title": {
          "lead": "Beginnen Sie mit dem kostenlosen Kontingent ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Für jedes Produkt gibt es ein kostenloses Kontingent ohne zeitliche Begrenzung – 1,000 erfasst einen Monat für die Erweiterung und der Online Scraper, 20 fordert einen Monat für API an.",
        "primary": "Installieren Sie die Erweiterung",
        "secondary": "Probieren Sie den Online Scraper aus",
        "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
      }
    },
    "extensionLogin": {
      "title": "Erweiterungsanmeldung | MapsGrab",
      "description": "Melden Sie sich an, um Ihre MapsGrab-Websitesitzung mit der Browsererweiterung zu verbinden.",
      "eyebrow": "Browser-Erweiterung",
      "heading": "Erweiterungsanmeldung",
      "checkingState": "Überprüfung",
      "signInRequiredState": "Anmeldung erforderlich",
      "confirmState": "Konto bestätigen",
      "errorState": "Fehler",
      "preparingTitle": "Bereiten Sie Ihre Anmeldung vor",
      "preparingText": "Einrichten der Erweiterungs-Anmeldebrücke.",
      "invalidParamsTitle": "Ungültiger Anmeldelink",
      "invalidParamsText": "Diesem Anmeldelink fehlen erforderliche Sicherheitsparameter. Bitte starten Sie die Anmeldung erneut in der Erweiterung.",
      "checkingSessionTitle": "Überprüfung Ihrer Sitzung",
      "checkingSessionText": "Überprüfung Ihrer bestehenden Website-Sitzung.",
      "finishingGoogleTitle": "Die Google-Anmeldung wird abgeschlossen",
      "finishingGoogleText": "Tauschen Sie Ihre Google-Autorisierung gegen eine Website-Sitzung ein.",
      "signInRequiredTitle": "Melden Sie sich an, um fortzufahren",
      "signInRequiredText": "Melden Sie sich an, um Ihre Website-Sitzung mit der Erweiterung zu verbinden.",
      "signInButtonLabel": "Anmelden",
      "confirmTitle": "Bestätigen Sie Ihr Konto",
      "confirmText": "Die Erweiterung fordert zur Anmeldung mit dem unten aufgeführten Konto auf. Fahren Sie nur fort, wenn Sie gerade mit der Anmeldung über die Erweiterung begonnen haben.",
      "continueButtonLabel": "Weitermachen",
      "useAnotherAccountLabel": "Verwenden Sie ein anderes Konto",
      "issuingTitle": "Anmeldung abschließen",
      "issuingText": "Ausgabe eines einmaligen Anmeldecodes für die Erweiterung.",
      "issueFailedTitle": "Etwas ist schief gelaufen",
      "retryButtonLabel": "Wiederholen",
      "verificationFailedPrefix": "Die Überprüfung des Website-Tokens ist fehlgeschlagen",
      "issueFailedPrefix": "Die Anforderung des Anmeldecodes für die Erweiterung ist fehlgeschlagen",
      "googleSignInFailedPrefix": "Google-Anmeldung fehlgeschlagen",
      "googleCompletionFailedPrefix": "Google-Anmeldung konnte nicht abgeschlossen werden"
    },
    "online": {
      "seo": {
        "title": "Online Google Maps Scraper – Extraktion in der Cloud ausführen | MapsGrab",
        "description": "Führen Sie Google Maps-Stichwortsuchen in der Cloud durch, sammeln Sie Geschäftsdaten und laden Sie einen CSV pro Aufgabe herunter."
      },
      "hero": {
        "announce": {
          "badge": "3-Modi",
          "text": "Schlüsselwörter, ein Kartenbereich oder ganze Regionen"
        },
        "title": {
          "lead": "Google Maps-Extraktion ",
          "accent": " in der Cloud, ",
          "tail": " keine Installation"
        },
        "lead": "Geben Sie Schlüsselwörter ein, sammeln Sie Geschäftsdaten in der Cloud und laden Sie einen CSV pro Aufgabe von Ihrem Dashboard herunter.",
        "primaryCta": "Datenerfassung starten",
        "pricingCta": "Preise anzeigen",
        "meta": [
          "1,000 kostenlose Datensätze/Monat",
          "Funktioniert in jedem Browser",
          "Ein deduplizierter CSV pro Aufgabe"
        ],
        "theater": {
          "files": "1 CSV · Unter „Downloads“ gespeichert",
          "csv": "CSV",
          "processed": "Verarbeitet",
          "parallelChip": {
            "label": "Schlüsselwörter laufen",
            "value": "Parallel dazu"
          },
          "billingChip": {
            "label": "Abgerechnet von",
            "value": "Gelieferte Zeilen"
          }
        }
      },
      "facts": {
        "caption": "Der Online Scraper im Überblick",
        "items": [
          {
            "value": 37,
            "label": "öffentliche Spalten, einschließlich einer fortlaufenden Zeilennummer"
          },
          {
            "value": 6,
            "label": "Soziale Profilspalten zu kostenpflichtigen Plänen"
          },
          {
            "value": 50,
            "label": "Suchorte pro Kartenmodus-Aufgabe"
          },
          {
            "value": 60,
            "suffix": " min",
            "label": "Sammelfenster für jede Aufgabe"
          },
          {
            "value": 1000,
            "label": "jeden Monat kostenlose Schallplatten"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Wie es funktioniert",
          "title": {
            "lead": "Von der schnellen Vorschau zum ",
            "accent": "vollständigen Export",
            "tail": ""
          },
          "lead": "Probieren Sie ein Keyword auf der Homepage ohne Konto aus. Wenn Sie die gesamte Liste benötigen, melden Sie sich an und führen Sie sie als Aufgabe in Ihrem Dashboard aus."
        },
        "steps": [
          {
            "title": "Vorschau auf der Homepage",
            "description": "Ein Schlüsselwort, kein Konto. Sehen Sie, wie viele Unternehmen die erste Ergebnisseite enthält, mit den ersten 3-Zeilen."
          },
          {
            "title": "anmelden",
            "description": "Vorschauen werden nicht gespeichert und verbrauchen niemals Ihr Kontingent. Nach der Anmeldung geben Sie das Schlüsselwort erneut ein."
          },
          {
            "title": "Erstellen Sie die Aufgabe",
            "description": "Geben Sie im Dashboard › Online Scraper ein Schlüsselwort pro Zeile ein – oder lassen Sie einen Kartenbereich oder Regionen die Liste erstellen."
          },
          {
            "title": "Schlüsselwörter laufen parallel",
            "description": "Befolgen Sie die Status „Warteschlange“, „Sammeln“ und „CSV-Vorbereitung“, dann „Abgeschlossen“, „Teilweise erfolgreich“ oder „Fehlgeschlagen“. Aktive Aufgaben werden alle 5 Sekunden aktualisiert."
          },
          {
            "title": "Herunterladen",
            "description": "Laden Sie ein CSV für die gesamte Aufgabe herunter, wenn eine Datei verfügbar ist. Bei teilweisem Erfolg bleiben die gelieferten Zeilen erhalten; Null-Ergebnisse haben keine Datei."
          }
        ],
        "lock": "Melden Sie sich an, um die vollständige Liste zu erhalten",
        "email": "you@company.com",
        "links": {
          "preview": "Probieren Sie die Homepage-Vorschau aus",
          "dashboard": "Öffnen Sie das Dashboard › Online Scraper"
        }
      },
      "modes": {
        "head": {
          "kicker": "Suchmodi",
          "title": {
            "lead": "Drei Möglichkeiten, ",
            "accent": " zu sagen, wo man ",
            "tail": " suchen soll"
          },
          "lead": "Geben Sie Schlüsselwörter Zeile für Zeile ein, probieren Sie einen Kartenbereich um einen Mittelpunkt aus oder wandeln Sie Länder, Bundesstaaten und Städte in vorgefertigte Abfragen um."
        },
        "tabsLabel": "Suchmodus",
        "notes": {
          "keywords": "Ein Schlüsselwort pro Zeile, bis zum Limit Ihres Plans",
          "map": "Probieren Sie einen Kreis um einen Mittelpunkt aus",
          "regions": "Länder, Bundesstaaten und Städte ab GeoNames"
        },
        "keywords": {
          "hint": "Ein Schlüsselwort pro Zeile. Leerzeilen und Duplikate werden vor der Zählung gelöscht, und die gesamte Aufgabe erzeugt ein dedupliziertes CSV.",
          "blank": "Leerzeile · übersprungen",
          "duplicate": "Duplizieren · übersprungen",
          "limitsTitle": "Schlüsselwörter pro Aufgabe",
          "limitsCaption": "per Online-Plan",
          "limitsHint": "„Start Scraping“ bleibt deaktiviert, solange die Liste leer ist, das Limit Ihres Plans überschreitet oder Ihr monatliches Kontingent aufgebraucht ist."
        },
        "map": {
          "formula": "{keywords} Schlüsselwörter × {points} Gitterpunkte",
          "scale": "{value} km",
          "facts": [
            "Punkte werden von der Mitte nach außen gesucht.",
            "Der Kreis platziert nur Suchzentren – die Ergebnisse werden nicht darauf beschränkt.",
            "Ein über Stichworte oder Punkte hinweg gefundenes Unternehmen wird einmalig in der Aufgabe festgehalten."
          ]
        },
        "regions": {
          "hint": "Sie können die generierten Abfragen vor dem Absenden bearbeiten. Jeder einzelne zählt als Schlüsselwort.",
          "addCity": "Stadt hinzufügen"
        }
      },
      "results": {
        "head": {
          "kicker": "Ergebnisse",
          "title": {
            "lead": "Eine Aufgabe, ",
            "accent": ", eine CSV ",
            "tail": ""
          },
          "lead": "Laden Sie die öffentlichen Spalten 37 in einem CSV für die gesamte Aufgabe herunter, mit fortlaufenden Zeilennummern und deduplizierten Unternehmen über die Suchvorgänge hinweg."
        },
        "csvMeta": "1 CSV · {count} gelieferte Zeilen",
        "rows": "{count} Zeilen",
        "searches": "Gelieferte Zeilen durch Suche",
        "notes": [
          "Zeile 1 enthält die festen englischen Spaltennamen, einschließlich der fortlaufenden #-Spalte.",
          "Die Zeile 2 beschreibt jede Spalte in der beim Erstellen der Aufgabe verwendeten Schnittstellensprache.",
          "Abgeschlossene Aufgaben ohne Ergebnisse haben keine Datei. Bei teilweisem Erfolg bleiben die gelieferten Zeilen erhalten.",
          "Die Beschriftungszeile zählt niemals zu Ihren Datensätzen."
        ],
        "language": "Aufgabensprache: Deutsch",
        "rowLabel": "Reihe",
        "legend": {
          "fields": "Zeile 1 · Feldnamen",
          "labels": "Zeile 2 · Aufgabensprache",
          "data": "Zeile 3+ · Unternehmen"
        },
        "more": "+{count} weitere Spalten",
        "csvLabels": {
          "#": "Zeilennummer",
          "Name": "Firmenname",
          "Fulladdress": "Vollständige Adresse",
          "Categories": "Unternehmenskategorien",
          "Phone": "Haupttelefon",
          "Review Count": "Anzahl der Bewertungen",
          "Average Rating": "Durchschnittliche Bewertung",
          "Website": "Unternehmenswebsite",
          "Emails": "E-Mails für öffentliche Websites",
          "Search Keyword": "Stichwort suchen"
        }
      },
      "features": {
        "head": {
          "kicker": "Fähigkeiten",
          "title": {
            "lead": "Was der Online Scraper ",
            "accent": " macht ",
            "tail": ""
          },
          "lead": "In der Cloud gesammelte Geschäftsdaten, mit optionalen E-Mails und sozialen Profilen bei kostenpflichtigen Plänen."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Keyword-Aufgaben",
            "description": "Geben Sie Unternehmenstypen und Standorte als separate Schlüsselwörter ein. Ihr Plan bestimmt das Keyword-Limit und die monatliche Aufnahmequote.",
            "meta": "2 · 5 · 10 · 20 · 50 Schlüsselwörter pro Aufgabe"
          },
          {
            "id": "history",
            "title": "Aufgabenverlauf",
            "description": "Verfolgen Sie den Aufgabenfortschritt und sehen Sie sich die Datensatzanzahl für jedes Schlüsselwort in Ihrem Dashboard an.",
            "meta": "Abgeschlossen · Teilweise erfolgreich · Fehlgeschlagen"
          },
          {
            "id": "details",
            "title": "Geschäftsdetails",
            "description": "Sammeln Sie Namen, Adressen, Telefonnummern, Websites, Bewertungen, Öffnungszeiten, Koordinaten und Ortskennungen, sofern verfügbar.",
            "meta": "37 öffentliche Spalten pro Unternehmen"
          },
          {
            "id": "enrichment",
            "title": "E-Mail und soziale Bereicherung",
            "description": "Bei einem kostenpflichtigen Online-Plan werden Unternehmenswebsites standardmäßig auf E-Mail-Adressen und soziale Profile überprüft. Sie können dies für jede Aufgabe deaktivieren.",
            "meta": "Kostenpflichtige Pläne · standardmäßig aktiviert"
          },
          {
            "id": "downloads",
            "title": "Eine Aufgabe CSV",
            "description": "Laden Sie die gesamte Aufgabe als eine CSV herunter, wenn eine Datei verfügbar ist. Es sind keine Suchdateien erforderlich.",
            "meta": "{job}.csv · 37-Spalten"
          },
          {
            "id": "browser",
            "title": "Nichts zu installieren",
            "description": "Läuft in der Cloud von jedem Browser aus – Edge, Firefox oder einem anderen. Laden Sie Ergebnisse aus Ihrem Aufgabenverlauf herunter.",
            "meta": "Edge · Firefox · jeder Browser"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Verwendung",
          "title": {
            "lead": "Abgerechnet nach den Zeilen ",
            "accent": " erhält man tatsächlich ",
            "tail": ""
          },
          "lead": "Online-Aufgaben werden anhand der gelieferten Geschäftszeilen gemessen, sobald eine Aufgabe abgeschlossen ist. Beim Absenden wird nichts beiseite gelegt und die Beschriftungszeile in jedem CSV wird nie gezählt."
        },
        "checks": [
          "Durch das Senden einer Aufgabe wird nichts von Ihrem Kontingent reserviert",
          "Eine bereits laufende Aufgabe wird beendet, auch wenn Ihr verbleibendes Kontingent überschritten ist",
          "Sobald das Kontingent aufgebraucht ist, können keine neuen Aufgaben mehr eingereicht werden",
          "Die Nutzung wird auf dem 1st in der Zeit New York zurückgesetzt; Nicht verwendete Datensätze werden nicht übertragen"
        ],
        "mock": {
          "recordsLabel": "Rekorde diesen Monat",
          "left": "{count} links",
          "exhausted": "Kontingent ausgeschöpft",
          "task": "Aufgabe {id}…",
          "pending": "Bisher geliefert · gezählt, wenn die Aufgabe abgeschlossen ist",
          "counted": "Auf diesen Monat angerechnet",
          "rows": "{count} Zeilen",
          "running": "Läuft",
          "delta": "+{count} Datensätze"
        }
      },
      "plans": {
        "head": {
          "kicker": "Online-Scraper-Pläne",
          "title": {
            "lead": "Cloud-Extraktion, ",
            "accent": ", Preis nach Datensätzen ",
            "tail": ""
          },
          "lead": "Führen Sie die MapsGrab-Engine in unserer Infrastruktur aus. Ein Datensatz besteht aus einer gelieferten Geschäftszeile; Bezahlte Pläne beinhalten E-Mail und Social Enrichment ohne zusätzliche Aufzeichnungskosten."
        },
        "specs": {
          "keywords": "Schlüsselwörter pro Aufgabe",
          "contacts": "E-Mails und soziale Netzwerke",
          "included": "Standardmäßig aktiviert",
          "excluded": "Nicht im Lieferumfang enthalten"
        },
        "note": "Einmalige Zahlung für einen natürlichen Monat – Online-Pläne verlängern sich nicht automatisch. Die Nutzung wird auf dem 1st in der New York-Zeit zurückgesetzt und ungenutzte Datensätze werden nicht übertragen.",
        "compare": "Vergleichen Sie alle Pläne"
      },
      "faq": {
        "kicker": "Häufige Fragen",
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "lead": "Die kurzen Antworten. Ansonsten ist der Support nur eine E-Mail entfernt.",
        "contact": "Kontaktieren Sie den Support",
        "items": [
          {
            "question": "Wie unterscheidet sich der Online Scraper von der Erweiterung?",
            "answer": "Die Erweiterung sammelt Daten in Ihrem Browser. Online Scraper führt Schlüsselwortaufgaben in der Cloud aus und liefert die Ergebnisse an Ihr Dashboard."
          },
          {
            "question": "Woher kommen die Daten und ist ihre Erhebung legal?",
            "answer": "MapsGrab sammelt nur Informationen, die öffentlich auf Google Maps angezeigt werden – dieselben Details, die jeder Besucher lesen kann. Wir greifen nicht auf private Konten, geschützte Inhalte oder nicht öffentliche Daten zu."
          },
          {
            "question": "In welche Formate kann ich exportieren?",
            "answer": "Aufgaben mit Ergebnissen liefern einen UTF-8 CSV mit öffentlichen Spalten 37, fortlaufenden Zeilennummern und zwei Kopfzeilen. Unternehmen werden bei allen Suchanfragen dedupliziert. Aufgaben ohne Ergebnisse haben keine Datei."
          },
          {
            "question": "Wie viel kostet es?",
            "answer": "Der Online Scraper folgt den MapsGrab-Plänen auf der Preisseite, einschließlich des kostenlosen monatlichen Kontingents an Datensätzen. Bezahlte Pläne erhöhen die Limits, wenn Sie mehr benötigen."
          },
          {
            "question": "Benötige ich einen kostenpflichtigen Plan für E-Mails und soziale Profile?",
            "answer": "Online Free beinhaltet keine E-Mail- oder Social-Media-Anreicherung. Bezahlte Online-Pläne beinhalten es standardmäßig und Sie können es für jede Aufgabe deaktivieren. Die Auswahl wird festgelegt, sobald die Aufgabe übermittelt wird."
          },
          {
            "question": "Wie lange kann eine Aufgabe ausgeführt werden?",
            "answer": "Jede Aufgabe verfügt über ein 60-Minuten-Erfassungsfenster. Bei teilweisem Erfolg können gesammelte Zeilen und alle gefundenen E-Mails oder Profile bereitgestellt werden. In Ihrer Historie sehen Sie, ob ein CSV verfügbar ist."
          },
          {
            "question": "Wird meine Homepage-Vorschau gespeichert, wenn ich mich anmelde?",
            "answer": "Nein. Die Homepage-Vorschau ist ein kurzer Blick, der nicht gespeichert wird. Nachdem Sie sich angemeldet haben, öffnen Sie Online Scraper in Ihrem Dashboard und übermitteln Sie das Schlüsselwort erneut als vollständige Aufgabe."
          }
        ]
      },
      "cta": {
        "kicker": "Fangen Sie an",
        "title": {
          "lead": "Stellen Sie Ihren ersten ",
          "accent": "Cloud-Auftrag",
          "tail": " in die Warteschlange"
        },
        "lead": "Geben Sie Schlüsselwörter ein, verfolgen Sie den Fortschritt Ihrer Aufgabe und laden Sie Geschäftsdaten von Ihrem Dashboard herunter.",
        "primary": "Datenerfassung starten",
        "secondary": "Preise anzeigen",
        "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
      }
    },
    "apiPage": {
      "switchLabel": "API-Endpunkte",
      "switchItems": {
        "search": "Scraper",
        "reviews": "Rezensionen",
        "photos": "Fotos"
      },
      "primaryCta": "Holen Sie sich den API-Schlüssel",
      "pricingCta": "Preise anzeigen",
      "console": {
        "label": "Beispiel für eine API-Anfrage und -Antwort",
        "langLabel": "Sprache anfordern",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Kopieranfrage",
        "replay": "Wiederholungsanfrage",
        "ready": "Bereit",
        "composing": "Verfassen einer Anfrage…",
        "sending": "Anfrage wird gesendet…",
        "done": "Antwort · 200 OK · application/json",
        "waiting": "// warte auf Antwort…",
        "response": "Beispielantwort"
      },
      "endpoints": {
        "kicker": "Endpunkte",
        "title": {
          "lead": "Ein Schlüssel. ",
          "accent": "Drei",
          "tail": " Endpunkte."
        },
        "lead": "Suche nach Orten und übergib ihre `fid` an die Bewertungs- oder Foto-API. Alle drei APIs nutzen denselben Schlüssel und dasselbe monatliche Anfragekontingent.",
        "here": "Du bist hier",
        "paramsLabel": "Parameter",
        "mcp": {
          "title": "Bauen mit KI-Agenten?",
          "description": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab.",
          "link": "Entdecken Sie MCP"
        }
      },
      "chain": {
        "kicker": "Kettenendpunkte",
        "title": {
          "lead": "",
          "accent": "Scraper → Rezensionen / Fotos",
          "tail": ""
        },
        "lead": "Suche nach Orten und übergib ihre `fid` an die Bewertungs- oder Foto-API. Alle drei APIs nutzen denselben Schlüssel und dasselbe monatliche Anfragekontingent.",
        "label": "Suche nach Orten und übergib ihre fid an die Bewertungs- oder Foto-API. Alle drei APIs nutzen denselben Schlüssel und dasselbe monatliche Anfragekontingent.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 Bewertungen"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 Bewertungen"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 Bewertungen"
          }
        ],
        "reviews": [
          {
            "rating": 5,
            "text": "“Best cortado on Division. Friendly crew.”",
            "meta": "Maya R. · 2 weeks ago",
            "reply": "Owner: Thanks Maya — see you soon!"
          },
          {
            "rating": 4,
            "text": "“Great beans. Cozy but small — come early on weekends.”",
            "meta": "Daniel K. · 3 weeks ago",
            "reply": ""
          }
        ],
        "photos": {
          "note": "Bei Erfolg ist status immer partial; reason nennt den Grund für das Ende der Erfassung. reported_total ist die vom Ursprung gemeldete Zahl oder null, keine bestätigte Albumgröße."
        }
      },
      "reference": {
        "kicker": "Referenz",
        "title": {
          "lead": "Anfrage rein, ",
          "accent": " JSON ",
          "tail": " raus"
        },
        "lead": "Senden Sie Ihren Schlüssel als `Authorization: Bearer YOUR_API_KEY` mit einem JSON-Körper. Jede Antwort ist in `{code, data, msg}` verpackt, und `code` 10000 bedeutet Erfolg.",
        "baseUrl": "Basis URL",
        "copyBaseUrl": "Kopieren Sie die Basis URL",
        "request": "Anfrage",
        "response": "Antwort",
        "columns": {
          "parameter": "Parameter",
          "field": "Feld",
          "type": "Typ",
          "description": "Beschreibung",
          "example": "Beispiel"
        },
        "required": "erforderlich",
        "groupsLabel": "Feldgruppen",
        "notes": [
          {
            "icon": "gauge",
            "title": "Eine Anfrage pro erfolgreichem Anruf",
            "description": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
          },
          {
            "icon": "key",
            "title": "Ein 401 bedeutet, dass Sie Ihren Schlüssel überprüfen müssen",
            "description": "Ein fehlender oder ungültiger Schlüssel gibt HTTP 401 zurück. Andere Fehler geben HTTP 200 mit einem Nicht-10000 `code` und einem `msg` zurück."
          },
          {
            "icon": "locate",
            "title": "Der Standort ist eine Voreingenommenheit, kein Zaun",
            "description": "`ll` teilt Maps mit, wo gesucht werden soll. Orte außerhalb dieser Ansicht können weiterhin angezeigt werden."
          },
          {
            "icon": "target",
            "title": "Benennen Sie den Ort",
            "description": "Fügen Sie eine Stadt, ein Bundesland oder ZIP in `q` ein – „in meiner Nähe“ hat auf einem Server nichts zu verankern."
          }
        ]
      },
      "plans": {
        "kicker": "API-Pläne",
        "title": {
          "lead": "Programmgesteuerter Zugriff, ",
          "accent": ", Preis nach Anfrage ",
          "tail": ""
        },
        "lead": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
      },
      "faq": {
        "lead": "Die kurzen Antworten. Ansonsten ist der Support nur eine E-Mail entfernt.",
        "contact": "Kontaktieren Sie den Support"
      },
      "cta": {
        "kicker": "Fangen Sie an",
        "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps Scraper API – Geschäftsdaten in JSON | MapsGrab",
        "description": "Der MapsGrab-Scraper API gibt Google Maps-Suchergebnisse als JSON zurück: Name, Adresse, Telefon, Website, Bewertung, Öffnungszeiten, Koordinaten, Place ID und FID – plus E-Mails und soziale Profile auf Anfrage."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Scraper ",
          "tail": " API"
        },
        "lead": "Senden Sie ein Stichwort über HTTPS und erhalten Sie Google Maps-Unternehmen als JSON zurück: Name, Adresse, Telefon, Website, Bewertung, Öffnungszeiten, Koordinaten, Place ID und FID – plus E-Mails und soziale Profile auf Anfrage.",
        "meta": [
          "Kostenloser Plan: {quota}",
          "Ein Schlüssel für Suche und Bewertungen",
          "JSON über HTTPS"
        ],
        "chips": [
          {
            "label": "Pro Ort",
            "value": "29-Datenfelder"
          },
          {
            "label": "Pro Seite",
            "value": "Bis zu 20 Plätze"
          }
        ]
      },
      "endpoint": {
        "name": "Scraper API",
        "description": "Unternehmen für jedes Schlüsselwort und optionalen Standort – 29-Felder pro Ort sowie E-Mails und soziale Profile mit `extra`.",
        "link": "Entdecken Sie den Scraper API"
      },
      "caps": {
        "title": {
          "lead": "Was der ",
          "accent": " Scraper API ",
          "tail": " zurückgibt"
        },
        "lead": "Ein Schlüsselwort und eine optionale Standortausrichtung in; Die Orte, die bei einer Google Maps-Suche angezeigt werden, sind wie folgt strukturiert: JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Suche nach Stichwort und Standort",
            "description": "Senden Sie `q` mit einer optionalen Standortausrichtung `ll`. `page` legt fest, wie viele Ergebnisseiten gesammelt werden sollen. 1–10, bis 20 platzieren jeweils alle in einer Antwort."
          },
          {
            "icon": "table",
            "title": "29 Felder pro Ort",
            "description": "Name, Kategorien, vollständige Adresse, Telefon, Website, Anzahl der Bewertungen und Rezensionen, Öffnungszeiten, Koordinaten, Place ID, CID, FID, Eigentümer und mehr."
          },
          {
            "icon": "mail",
            "title": "E-Mail und soziale Bereicherung",
            "description": "Setzen Sie `extra` auf `true`, um `emails` und `medias` hinzuzufügen: Instagram-, Facebook-, YouTube-, TikTok-, LinkedIn- und X-Profile, die auf jeder Unternehmenswebsite zu finden sind."
          },
          {
            "icon": "braces",
            "title": "Sauber, vorhersehbar JSON",
            "description": "snake_case-Felder in einem `{code, data, msg}`-Umschlag. Werte Google Maps werden nicht als `null` oder als leere Liste angezeigt, niemals als leere Zeichenfolgen."
          },
          {
            "icon": "layers",
            "title": "Teildaten werden markiert",
            "description": "Wenn einige Details nicht ausgefüllt werden können, erhalten Sie trotzdem die Stellen – wobei `partial` auf `true` gesetzt ist und `warnings` angibt, was fehlt."
          },
          {
            "icon": "shield",
            "title": "Nur öffentliche Daten",
            "description": "Die Ergebnisse enthalten nur das, was Google Maps öffentlich anzeigt – dieselben Details, die jeder Besucher lesen kann."
          }
        ]
      },
      "reference": {
        "shape": "data: { places, partial, warnings }",
        "params": [
          {
            "name": "q",
            "type": "string",
            "required": true,
            "description": "Wonach gesucht werden soll, bis zu 300 Zeichen – ein Unternehmenstyp plus ein Ort, z. B. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Wie viele Ergebnisseiten werden gesammelt, 1–10, bis zu 20 jeweils, alle werden in einer Antwort zurückgegeben? Die Sammlung stoppt vorzeitig, wenn eine Seite weniger als 20 Plätze oder nichts Neues hat. Standard `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Ergebnissprache, z.B. `en` oder `fr`. Standardwert `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Optionaler Standort-Bias wie `@lat,lng,zoom`, Zoom 0–21. Es teilt Maps mit, wo gesucht werden soll. Ergebnisse werden nicht auf einen Radius zugeschnitten."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` fügt jedem Ort `emails` und `medias` hinzu. Standard `false`."
          }
        ],
        "groups": [
          {
            "label": "Identität",
            "fields": [
              {
                "name": "name",
                "type": "string",
                "example": "\"Ember & Oak Coffee\""
              },
              {
                "name": "categories",
                "type": "string[]",
                "example": "[\"Coffee shop\", \"Espresso bar\"]"
              },
              {
                "name": "place_id",
                "type": "string",
                "example": "\"ChIJ8Qv2kSIKlVQRq-DRw_KltL4\""
              },
              {
                "name": "cid",
                "type": "string",
                "example": "\"13741790825100206251\""
              },
              {
                "name": "fid",
                "type": "string",
                "example": "\"0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab\""
              },
              {
                "name": "kgmid",
                "type": "string",
                "example": "\"/g/11c5x9_qk_\""
              },
              {
                "name": "google_maps_url",
                "type": "string",
                "example": "\"https://www.google.com/maps?cid=13741790825100206251\""
              },
              {
                "name": "google_knowledge_url",
                "type": "string",
                "example": "\"https://www.google.com/search?kgmid=/g/11c5x9_qk_\""
              },
              {
                "name": "search_keyword",
                "type": "string",
                "example": "\"coffee shop in Portland, OR\""
              }
            ]
          },
          {
            "label": "Kontakt",
            "fields": [
              {
                "name": "phone",
                "type": "string",
                "example": "\"(503) 555-0142\""
              },
              {
                "name": "phones",
                "type": "string[]",
                "example": "[\"(503) 555-0142\", \"+1 503-555-0142\"]"
              },
              {
                "name": "website",
                "type": "string",
                "example": "\"emberandoak.coffee/\""
              },
              {
                "name": "domain",
                "type": "string",
                "example": "\"emberandoak.coffee\""
              },
              {
                "name": "emails",
                "type": "string[]",
                "example": "[\"hello@emberandoak.coffee\"]",
                "badge": "Extra"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "Extra"
              }
            ]
          },
          {
            "label": "Standort",
            "fields": [
              {
                "name": "full_address",
                "type": "string",
                "example": "\"3021 SE Division St, Portland, OR 97202\""
              },
              {
                "name": "street",
                "type": "string",
                "example": "\"3021 SE Division St\""
              },
              {
                "name": "municipality",
                "type": "string",
                "example": "\"Portland, OR 97202\""
              },
              {
                "name": "latitude",
                "type": "number",
                "example": "45.504912"
              },
              {
                "name": "longitude",
                "type": "number",
                "example": "-122.635377"
              },
              {
                "name": "time_zone",
                "type": "string",
                "example": "\"America/Los_Angeles\""
              }
            ]
          },
          {
            "label": "Bewertungen",
            "fields": [
              {
                "name": "average_rating",
                "type": "number",
                "example": "4.7"
              },
              {
                "name": "review_count",
                "type": "integer",
                "example": "1284"
              },
              {
                "name": "review_url",
                "type": "string",
                "example": "\"https://search.google.com/local/reviews?placeid=ChIJ…\""
              }
            ]
          },
          {
            "label": "Profil",
            "fields": [
              {
                "name": "about",
                "type": "string",
                "example": "\"Service options: [Dine-in, Takeout], Highlights: [Great coffee]\""
              },
              {
                "name": "opening_hours",
                "type": "object[]",
                "example": "[{\"name\": \"Thursday(2026-10-15)\", \"values\": [\"7 AM–6 PM\"]}, …]"
              },
              {
                "name": "claimed",
                "type": "boolean",
                "example": "true"
              },
              {
                "name": "owner",
                "type": "string",
                "example": "\"Ember & Oak Coffee (Owner)\""
              },
              {
                "name": "owner_id",
                "type": "string",
                "example": "\"104287731665220398123\""
              },
              {
                "name": "owner_link",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1042877316…\""
              },
              {
                "name": "featured_image",
                "type": "string",
                "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\""
              }
            ]
          },
          {
            "label": "Seite",
            "fields": [
              {
                "name": "places",
                "type": "place[]",
                "example": "[{…}, …]"
              },
              {
                "name": "partial",
                "type": "boolean",
                "example": "false"
              },
              {
                "name": "warnings",
                "type": "string[]",
                "example": "[]"
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "items": [
          {
            "question": "Was gibt der Scraper API zurück?",
            "answer": "JSON mit bis zu 20 Plätzen pro gesammelter Seite. Jeder Ort verfügt über 29-Felder – Name, Kategorien, Adresse, Telefon, Website, Bewertung, Anzahl der Bewertungen, Öffnungszeiten, Koordinaten, Place ID, CID, FID und mehr – sowie E-Mails und soziale Profile, wenn mehr zutrifft."
          },
          {
            "question": "Wie authentifiziere ich mich?",
            "answer": "Senden Sie Ihren MapsGrab API-Schlüssel als Bearer-Token im Authorization-Header. Jedes Konto hat einen Schlüssel. Erst wenn Sie ihn generieren, wird er vollständig angezeigt. Durch die Generierung eines neuen Schlüssels wird der alte sofort deaktiviert."
          },
          {
            "question": "Wie werden Anfragen gezählt?",
            "answer": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
          },
          {
            "question": "Was macht die Seite?",
            "answer": "Seite gibt an, wie viele Ergebnisseiten in einem Aufruf gesammelt werden sollen, von 1 bis 10. Jede Seite summiert sich auf 20-Plätze, und die Sammlung stoppt vorzeitig, wenn Google Maps nichts Neues enthält. Es handelt sich nicht um eine Seitenzahl."
          },
          {
            "question": "Sind die Daten öffentlich?",
            "answer": "Ja. Der API gibt nur Informationen zurück, die öffentlich auf dem Google Maps angezeigt werden – dieselben Details, die jeder Besucher lesen kann. Es greift nicht auf private Konten oder nicht öffentliche Daten zu."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Integrieren Sie Kartendaten in Ihre ",
          "accent": "Anwendung",
          "tail": ""
        },
        "lead": "Eine HTTP-Anfrage pro Suche, strukturiertes JSON in der Antwort – für CRMs, Datenpipelines und Ihre eigenen Produkte."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Bewertungen Scraper API — Bewertungen in JSON | MapsGrab",
        "description": "Die MapsGrab-Bewertungen API gibt die öffentlichen Bewertungen eines Google Maps-Unternehmens als JSON zurück: Bewertung, Text und Übersetzung, Autor, Datum, Bewertungsfotos und Eigentümerantworten – bis zu 60 pro Seite mit einem Cursor."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Bewertungen ",
          "tail": " Scraper API"
        },
        "lead": "Fordern Sie die öffentlichen Bewertungen eines beliebigen Google Maps-Unternehmens über dessen FID an und erhalten Sie eine strukturierte JSON-Rückmeldung: Bewertung, Text und Übersetzung, Autor, Datum, Bewertungsfotos und Eigentümerantworten – Seite für Seite mit einem Cursor.",
        "meta": [
          "Kostenloser Plan: {quota}",
          "Bis zu 60 Bewertungen pro Seite",
          "JSON über HTTPS"
        ],
        "chips": [
          {
            "label": "Pro Seite",
            "value": "Bis zu 60 Bewertungen"
          },
          {
            "label": "Sortieren nach",
            "value": "Relevanz · neueste · Bewertung"
          }
        ]
      },
      "endpoint": {
        "name": "Bewertungen API",
        "description": "Öffentliche Bewertungen eines Unternehmens nach `fid` – bis zu 60 pro Seite, nach Ihren Wünschen sortiert, mit einem Cursor seitenweise.",
        "link": "Entdecken Sie die Bewertungen API"
      },
      "caps": {
        "title": {
          "lead": "Was die ",
          "accent": " Bewertungen API ",
          "tail": " zurückgibt"
        },
        "lead": "Jede öffentliche Bewertung eines Unternehmens – Bewertungen, Text, Autoren, Fotos und Eigentümerantworten – eine Seite pro Anfrage.",
        "items": [
          {
            "icon": "review",
            "title": "Rezensionen von fid",
            "description": "Sprechen Sie ein Unternehmen mit dem `fid` aus einem beliebigen Scraper-API-Ergebnis an und geben Sie dann `next_cursor` zurück, um die nächste Seite zu lesen, jeweils bis zu 60-Bewertungen."
          },
          {
            "icon": "filter",
            "title": "Sortiert nach Ihren Wünschen",
            "description": "`sort_by` gibt zuerst die relevantesten (1), neuesten (2), am höchsten bewerteten (3) oder am niedrigsten bewerteten (4) Rezensionen zurück."
          },
          {
            "icon": "list",
            "title": "Text, Übersetzung und Daten",
            "description": "Bewertung, Rezensionstext, `translated_text` und `language`, mit `published_at_ms` und einem relativen Datum für jede Rezension."
          },
          {
            "icon": "user",
            "title": "Angaben zum Autor",
            "description": "Name des Autors und Profillink, Anzahl der Rezensionen des Autors und Local Guide-Status."
          },
          {
            "icon": "image",
            "title": "Fotos und Besitzerantworten",
            "description": "`images` listet das Foto URLs auf, das einer Rezension beigefügt ist; `owner_response` trägt die Antwort des Besitzers und `owner_response_at_ms` seine Zeit."
          },
          {
            "icon": "shield",
            "title": "Nur öffentliche Daten",
            "description": "Auf Google Maps werden nur Bewertungen öffentlich angezeigt – derselbe Inhalt, den jeder Besucher lesen kann."
          }
        ]
      },
      "reference": {
        "shape": "data: { reviews, next_cursor }",
        "params": [
          {
            "name": "fid",
            "type": "string",
            "required": true,
            "description": "Geschäftsfunktions-ID, z. B. `0x5495…:0xbeb4…`. Jeder Scraper API-Platz enthält es."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "Der `next_cursor` von der vorherigen Seite. Lassen Sie es für die erste Seite weg."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` am relevantesten · `2` neueste · `3` höchste Bewertung · `4` niedrigste Bewertung. Standard `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Sprachcode, z.B. `en`. Standardwert `en`."
          }
        ],
        "groups": [
          {
            "label": "Rezension",
            "fields": [
              {
                "name": "review_id",
                "type": "string",
                "example": "\"ChdDSUhNMG9nS0VJQ0FnSUR3…\""
              },
              {
                "name": "rating",
                "type": "integer",
                "example": "5"
              },
              {
                "name": "text",
                "type": "string",
                "example": "\"Best cortado on Division. Friendly crew.\""
              },
              {
                "name": "translated_text",
                "type": "string",
                "example": "null"
              },
              {
                "name": "language",
                "type": "string",
                "example": "\"en\""
              },
              {
                "name": "published_at_ms",
                "type": "integer",
                "example": "1790553600000"
              },
              {
                "name": "relative_date",
                "type": "string",
                "example": "\"2 weeks ago\""
              },
              {
                "name": "images",
                "type": "string[]",
                "example": "[\"https://lh5.googleusercontent.com/p/AF1QipN…\"]"
              },
              {
                "name": "origin",
                "type": "string",
                "example": "\"Google\""
              }
            ]
          },
          {
            "label": "Autor",
            "fields": [
              {
                "name": "author_name",
                "type": "string",
                "example": "\"Maya R.\""
              },
              {
                "name": "author_url",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1123…\""
              },
              {
                "name": "author_review_count",
                "type": "integer",
                "example": "38"
              },
              {
                "name": "author_is_local_guide",
                "type": "boolean",
                "example": "true"
              }
            ]
          },
          {
            "label": "Antwort des Eigentümers",
            "fields": [
              {
                "name": "owner_response",
                "type": "string",
                "example": "\"Thanks Maya — see you soon!\""
              },
              {
                "name": "owner_response_at_ms",
                "type": "integer",
                "example": "1790640000000"
              }
            ]
          },
          {
            "label": "Seite",
            "fields": [
              {
                "name": "reviews",
                "type": "review[]",
                "example": "[{…}, …]"
              },
              {
                "name": "next_cursor",
                "type": "string",
                "example": "\"CAESBkVnSUlDZw…\""
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "items": [
          {
            "question": "Wie spreche ich ein bestimmtes Unternehmen an?",
            "answer": "Mit seiner FID ist die Feature-ID, die jeder Scraper API-Platz enthält. Der kostenlose Place ID Finder liest auch den FID von jedem Google Maps-Ort URL."
          },
          {
            "question": "Welche Felder umfasst eine Bewertung?",
            "answer": "Rezensions-ID, Bewertung, Text mit Übersetzung und Sprache, Veröffentlichungszeit und relatives Datum, Name des Autors, Profillink, Rezensionsanzahl und Local Guide-Status, angehängte Fotos und die Antwort des Eigentümers mit Angabe der Zeit."
          },
          {
            "question": "Wie viele Bewertungen kann ich sammeln?",
            "answer": "Jede Anfrage gibt eine Seite mit bis zu 60-Rezensionen sowie eine next_cursor zurück. Geben Sie es zurück, um die nächste Seite zu lesen. Wenn next_cursor null ist, gibt es keine weiteren Seiten."
          },
          {
            "question": "Wie werden Anfragen gezählt?",
            "answer": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
          },
          {
            "question": "Sind die Daten öffentlich?",
            "answer": "Ja. Der API gibt nur Bewertungen zurück, die öffentlich auf dem Google Maps angezeigt werden – derselbe Inhalt, den jeder Besucher lesen kann. Es greift nicht auf private Konten oder nicht öffentliche Daten zu."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Monitorbewertungen ",
          "accent": " im Maßstab ",
          "tail": ""
        },
        "lead": "Cursor-seitige Rezensionsthreads in sauberem JSON – für Überwachung, Recherche und Berichterstattung."
      }
    },
    "photosApi": {
      "seo": {
        "title": "Fotos API — URLs öffentlicher Unternehmensfotos | MapsGrab",
        "description": "Rufe öffentliche Foto-URLs eines Unternehmens per fid als JSON ab. max_results begrenzt die Lieferung; die Ergebnisse sind unvollständig und garantieren kein vollständiges Album."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Fotos ",
          "tail": " API"
        },
        "lead": "Rufe öffentliche Foto-URLs eines Unternehmens per fid als JSON ab. max_results begrenzt die Lieferung; die Ergebnisse sind unvollständig und garantieren kein vollständiges Album.",
        "meta": [
          "Kostenloser Plan: {quota}",
          "URLs öffentlicher Unternehmensfotos",
          ", Preis nach Anfrage "
        ],
        "chips": [
          {
            "label": "Lieferung",
            "value": "partial"
          },
          {
            "label": "Anzahl",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "Fotos API",
        "description": "Rufe öffentliche Foto-URLs eines Unternehmens per fid als JSON ab. max_results begrenzt die Lieferung; die Ergebnisse sind unvollständig und garantieren kein vollständiges Album.",
        "link": "Foto-API ansehen"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "Fotos API",
          "tail": ""
        },
        "lead": "URLs öffentlicher Unternehmensfotos",
        "items": [
          {
            "icon": "image",
            "title": "Fotos per fid",
            "description": "Verwende die `fid` aus der Suche oder dem Place ID Finder. Jeder Eintrag in `photos` enthält die `url` eines öffentlichen Fotos."
          },
          {
            "icon": "filter",
            "title": "Jede Anfrage begrenzen",
            "description": "`max_results` ist eine positive Ganzzahl, Standard 200. Es können weniger Fotos zurückkommen. Es gibt keine Seitennummer und keinen Cursor."
          },
          {
            "icon": "list",
            "title": "Lieferstatus prüfen",
            "description": "Bei Erfolg ist `status` immer `partial`; `reason` nennt den Grund für das Ende der Erfassung. `reported_total` ist die vom Ursprung gemeldete Zahl oder `null`, keine bestätigte Albumgröße."
          }
        ]
      },
      "reference": {
        "shape": "{ photos: [{url}], returned_count, reported_total, status, reason }",
        "params": [
          {
            "name": "fid",
            "type": "string",
            "required": true,
            "description": "Unternehmens-FID aus der Suche oder dem Place ID Finder im Format `0x…:0x…` mit 12–20 Hexadezimalziffern pro Abschnitt."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Positive Obergrenze für die Lieferung, Standard 200. Diese Fotoanzahl wird nicht garantiert."
          }
        ],
        "groups": [
          {
            "label": "Fotos",
            "fields": [
              {
                "name": "photos",
                "type": "photo[]",
                "example": "[{\"url\": \"https://lh5.googleusercontent.com/p/AF1Qip…\"}]"
              },
              {
                "name": "url",
                "type": "string",
                "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\""
              }
            ]
          },
          {
            "label": "Lieferung",
            "fields": [
              {
                "name": "returned_count",
                "type": "integer",
                "example": "2"
              },
              {
                "name": "reported_total",
                "type": "integer | null",
                "example": "178"
              },
              {
                "name": "status",
                "type": "string",
                "example": "\"partial\""
              },
              {
                "name": "reason",
                "type": "string",
                "example": "\"limit_reached\""
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "items": [
          {
            "question": "Wie fordere ich Unternehmensfotos an?",
            "answer": "Sende POST an /photos mit fid und optional max_results. Verwende denselben Bearer-API-Schlüssel wie für Suche und Bewertungen."
          },
          {
            "question": "Erhalte ich das vollständige Album?",
            "answer": "Bei Erfolg ist status immer partial; reason nennt den Grund für das Ende der Erfassung. reported_total ist die vom Ursprung gemeldete Zahl oder null, keine bestätigte Albumgröße. max_results ist eine positive Ganzzahl, Standard 200. Es können weniger Fotos zurückkommen. Es gibt keine Seitennummer und keinen Cursor."
          },
          {
            "question": "Wie erhalte ich den FID eines Unternehmens?",
            "answer": "Jeder Scraper-Ort API enthält seine FID, und der kostenlose Finder Place ID liest den FID von jedem Google Maps-Ort URL."
          },
          {
            "question": "Wie werden Anfragen gezählt?",
            "answer": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
          },
          {
            "question": "Sind die Daten öffentlich?",
            "answer": "Ja. Bild URLs verweist auf Fotos, die öffentlich auf Google Maps angezeigt werden – dieselben Bilder, die jeder Besucher sehen kann."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Unternehmensfotos für deine Anwendung",
          "tail": ""
        },
        "lead": "Rufe öffentliche Foto-URLs und ihren Lieferstatus mit deinem API-Schlüssel ab."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps Scraper MCP Server | MapsGrab",
        "description": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Verbinden Sie Ihren Agenten",
      "hero": {
        "kicker": "MCP-Server",
        "title": {
          "lead": "Google Maps Scraper ",
          "accent": " MCP ",
          "tail": " Server"
        },
        "lead": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab.",
        "meta": [
          "Streamable HTTP",
          "Melden Sie sich mit OAuth an",
          "Kostenloser Plan: {quota}"
        ],
        "chips": [
          {
            "label": "Transport",
            "value": "Streamable HTTP"
          },
          {
            "label": "Werkzeugergebnisse",
            "value": "Strukturiert JSON"
          }
        ]
      },
      "agent": {
        "label": "Beispiel einer Agentensitzung: eine Frage zu lokalen Unternehmen, ein MapsGrab-Tool-Aufruf mit strukturierten Ergebnissen und die Antwort des Agenten",
        "session": "Agentensitzung",
        "connected": "MCP Server {server} verbunden",
        "placeholder": "Fragen Sie nach einem Ort auf Google Maps…",
        "thinking": "Denken…",
        "running": "läuft",
        "scenes": [
          {
            "prompt": "Finden Sie Zahnärzte in Austin, TX mit der Bewertung 4.8 oder höher und geben Sie deren Telefonnummern an.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 Orte",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 weitere Orte"
              }
            ],
            "answer": [
              "Drei der ersten 20-Ergebnisse werden bewertet ",
              {
                "strong": "4.8 oder höher"
              },
              ":"
            ],
            "rows": [
              [
                "Bluebonnet Family Dental",
                "4.9",
                "(512) 555-0134"
              ],
              [
                "Barton Hills Smile Studio",
                "4.8",
                "(512) 555-0161"
              ],
              [
                "Live Oak Dentistry",
                "4.8",
                "(512) 555-0187"
              ]
            ]
          },
          {
            "prompt": "Was sagen die Leute in den neuesten Bewertungen von Ember & Oak Coffee in Portland?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 Ort",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 Bewertungen",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Meistens ",
              {
                "strong": "5-Stern"
              },
              " — Die Leute loben den Espresso und das freundliche Personal. Die eine wiederkehrende Anmerkung: ",
              {
                "strong": "Am Wochenende sind die Sitzplätze knapp"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Welche Klempner in Chicago listen keine Website auf? Legen Sie sie in eine Tabelle.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 Orte",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 weitere Orte"
              }
            ],
            "answer": [
              {
                "strong": "4 von 20"
              },
              " Es ist keine Website aufgeführt. Die ersten drei:"
            ],
            "rows": [
              [
                "Windy City Pipe Works",
                "4.6",
                "(312) 555-0112"
              ],
              [
                "Lakeview Drain & Sewer",
                "4.4",
                "(312) 555-0148"
              ],
              [
                "North Branch Plumbing",
                "4.8",
                "(312) 555-0175"
              ]
            ]
          },
          {
            "prompt": "Rufen Sie die am schlechtesten bewerteten Bewertungen von Rose City Roasters ab und verfassen Sie höfliche Antworten.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 Ort",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 Bewertungen",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Die niedrigsten Bewertungen beziehen sich meist auf Erwähnung ",
              {
                "strong": "Langsamer Service zu Stoßzeiten"
              },
              ". ",
              {
                "strong": "2 des 3"
              },
              " Ich habe noch keine Antwort des Eigentümers – ich habe jeweils eine verfasst."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Werkzeuge",
        "title": {
          "lead": "Was der MCP-Server ",
          "accent": " ",
          "tail": " offenlegt"
        },
        "lead": "Drei Tools: Search / Reviews / Photos.",
        "kind": "Werkzeug",
        "returns": "Rückgaben",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Orte suchen",
            "description": "Stichwort- und Standortsuchen, die zurückgeben, was eine Google Maps-Suche anzeigt – Namen, Telefonnummern, Bewertungen, Öffnungszeiten, Koordinaten, Orts-IDs und Fids.",
            "args": [
              {
                "name": "q",
                "description": "Keyword plus Stadt, Bundesland oder ZIP"
              },
              {
                "name": "page",
                "description": "Zu sammelnde Ergebnisseiten, 1–10 · jeweils bis zu 20 Stellen"
              },
              {
                "name": "hl",
                "description": "Ergebnissprache, z.B. `en`"
              },
              {
                "name": "ll",
                "description": "Standortbias, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` fügt E-Mails und soziale Profile hinzu"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Gleiche Daten wie beim Scraper API"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Rezensionen auflisten",
            "description": "Bewertungen, Bewertungstexte, Autoren, Daten, Fotos und Eigentümerantworten für jedes Unternehmen, das Ihr Agent untersucht.",
            "args": [
              {
                "name": "fid",
                "description": "Aus jedem Suchergebnis"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` von der letzten Seite; für den ersten weglassen"
              },
              {
                "name": "sort_by",
                "description": "1 relevant · 2 neueste · 3 am höchsten · 4 am niedrigsten"
              },
              {
                "name": "hl",
                "description": "Sprache, z.B. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Gleiche Daten wie die Bewertungen API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Fotos per fid",
            "description": "Rufe öffentliche Foto-URLs eines Unternehmens per fid als JSON ab. max_results begrenzt die Lieferung; die Ergebnisse sind unvollständig und garantieren kein vollständiges Album.",
            "args": [
              {
                "name": "fid",
                "description": "Unternehmens-FID aus der Suche oder dem Place ID Finder im Format `0x…:0x…` mit 12–20 Hexadezimalziffern pro Abschnitt."
              },
              {
                "name": "max_results",
                "description": "Positive Obergrenze für die Lieferung, Standard 200. Diese Fotoanzahl wird nicht garantiert."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Foto-API ansehen"
          }
        ]
      },
      "flow": {
        "kicker": "Wie es verbindet",
        "title": {
          "lead": "Ein Endpunkt zwischen Ihrem Agenten und den Live-Kartendaten ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Ihr Kunde verbindet sich über Streamable HTTP und meldet sich über Ihren Browser an. Der Agent erkennt die Tools, ruft sie auf, wenn eine Eingabeaufforderung Kartendaten benötigt, und liest strukturierte JSON zurück.",
        "label": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP Kunden",
        "anyClient": "Jeder MCP-Client",
        "toolsLabel": "Werkzeuge",
        "hub": "MapsGrab MCP",
        "publicData": "Öffentliche Google Maps-Daten",
        "resultLabel": "Ergebnis",
        "results": [
          "20 Orte",
          "60 Bewertungen",
          "2 Fotos"
        ],
        "steps": [
          {
            "title": "Verbinden",
            "description": "Fügen Sie den Endpunkt zu Ihrem Client hinzu und melden Sie sich dann über Ihren Browser bei MapsGrab an."
          },
          {
            "title": "Entdecken",
            "description": "Ihr Agent listet die MapsGrab-Tools und ihre Eingabeschemata auf."
          },
          {
            "title": "Anruf",
            "description": "Wenn eine Eingabeaufforderung Kartendaten benötigt, ruft der Agent ein Tool auf und liest das Ergebnis JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Aufstellen",
        "title": {
          "lead": "Ein Konfigurationsblock ",
          "accent": " pro Client ",
          "tail": ""
        },
        "lead": "Richten Sie Ihren Client auf den Endpunkt MapsGrab und melden Sie sich über Ihren Browser an – kein API-Schlüssel zum Kopieren, kein SDK, kein lokaler Prozess zum Ausführen.",
        "tabsLabel": "MCP Kunde",
        "copy": "Konfiguration kopieren",
        "clients": {
          "claude": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Fügen Sie den Server hinzu",
                "description": "Führen Sie den Befehl aus, um `mapsgrab` über HTTP zu registrieren."
              },
              {
                "title": "anmelden",
                "description": "Führen Sie in Claude Code `/mcp` aus, wählen Sie `mapsgrab` und authentifizieren Sie sich – MapsGrab wird in Ihrem Browser geöffnet, damit Sie es genehmigen können."
              },
              {
                "title": "Fragen Sie nach Kartendaten",
                "description": "Claude Code listet die MapsGrab-Tools auf und ruft sie auf, wenn eine Eingabeaufforderung sie benötigt."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Bearbeiten Sie mcp.json",
                "description": "Fügen Sie den Block für jedes Projekt zu `~/.cursor/mcp.json` oder für eines zu `.cursor/mcp.json` hinzu."
              },
              {
                "title": "anmelden",
                "description": "Klicken Sie in den Cursor-Einstellungen → MCP auf „Verbinden“ neben `mapsgrab` und genehmigen Sie es in Ihrem Browser."
              },
              {
                "title": "Benutzen Sie die Werkzeuge",
                "description": "`mapsgrab` zeigt seine Tools in der Serverliste MCP an, bereit für den Agenten."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Fügen Sie .vscode/mcp.json hinzu",
                "description": "Fügen Sie den Block ein – er enthält nur den Endpunkt URL, nichts Geheimnisvolles."
              },
              {
                "title": "anmelden",
                "description": "Starten Sie den Server. VS Code fordert zur Authentifizierung mit MapsGrab auf und öffnet Ihren Browser zur Genehmigung."
              },
              {
                "title": "Verwenden Sie den Agentenmodus",
                "description": "Öffnen Sie Chat im Agentenmodus und aktivieren Sie die Tools MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Fügen Sie den Server hinzu",
                "description": "Führen Sie `codex mcp add` aus, um `mapsgrab` von URL zu registrieren."
              },
              {
                "title": "anmelden",
                "description": "Führen Sie `codex mcp login mapsgrab` aus und genehmigen Sie MapsGrab in Ihrem Browser."
              },
              {
                "title": "Starten Sie Codex",
                "description": "Neue Sitzungen laden `mapsgrab` und seine Tools."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Sie können sich nicht über einen Browser anmelden? Verwenden Sie einen API-Schlüssel",
          "description": "Wenn Ihr Client die Autorisierung MCP nicht unterstützt oder auf einem Server oder in CI ausgeführt wird, fügen Sie stattdessen Ihren Schlüssel API als Header `Authorization` hinzu. Bewahren Sie den Schlüssel in einer Umgebungsvariablen oder der geheimen Eingabe Ihres Clients auf, nicht in einer gemeinsam genutzten Konfigurationsdatei.",
          "link": "Holen Sie sich den API-Schlüssel",
          "snippet": "Jeder HTTP-Client"
        },
        "spec": {
          "title": "Jeder andere MCP-Client",
          "subtitle": "MCP Inspector enthalten",
          "transport": "Transport",
          "transportValue": "Streamable HTTP",
          "endpoint": "Endpunkt",
          "copyEndpoint": "Endpunkt kopieren",
          "auth": "Auth",
          "authValue": "OAuth Anmeldung (Fallback: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Beispielaufforderungen",
        "title": {
          "lead": "Fragen Sie im Klartext.  ",
          "accent": " Zeilen zurückholen. ",
          "tail": ""
        },
        "lead": "Kundengewinnung, lokale Marktforschung, Bewertungsüberwachung – beschreiben Sie den Auftrag, und Ihr Agent entscheidet, welches MapsGrab-Tool er anruft.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Prospektion",
              "quote": "„Finden Sie Zahnärzte in Austin, TX mit der Bewertung 4.8 oder höher und geben Sie deren Telefonnummern an.“",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Ruf",
              "quote": "„Fassen Sie zusammen, was die Leute in den neuesten Bewertungen von Ember & Oak Coffee in Portland sagen.“",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Leadlisten",
              "quote": "„Erstellen Sie eine Liste von Yoga-Studios in Denver mit ihren E-Mails und Instagram-Profilen.“",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Marktforschung",
              "quote": "„Vergleichen Sie die Bewertungen und Rezensionszahlen für die Coffeeshops in der Division St in Portland.“",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Anreicherung",
              "quote": "„Fügen Sie Place ID, Telefonnummer und Website für jedes Unternehmen in dieser Tabelle hinzu.“",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Der Besitzer antwortet",
              "quote": "„Rufen Sie die am schlechtesten bewerteten Rezensionen von Rose City Roasters ab und verfassen Sie höfliche Antworten.“",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "sort_by: 4"
            }
          ],
          [
            {
              "icon": "web",
              "tag": "Lücken auf der Website",
              "quote": "„Welche Klempner in Chicago führen keine Website auf? Tragen Sie sie in eine Tabelle ein.“",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Öffnungszeiten",
              "quote": "„Welche Autowerkstätten in der Nähe von 60614 sind sonntags geöffnet?“",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Abbildung",
              "quote": "„Exportieren Sie die veganen Restaurants in Brooklyn mit Koordinaten als GeoJSON.“",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Lokalisierung",
              "quote": "„Suchen Sie nach Bäckereien in Lyon und geben Sie die Eintragsdetails auf Französisch zurück.“",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Beanspruchte Einträge",
              "quote": "„Überprüfen Sie, welche Fitnessstudios in Austin ihren Brancheneintrag Google beansprucht haben.“",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Lokale Führer",
              "quote": "„Welche aktuellen Bewertungen von Hawthorne Bean Co. stammen von Local Guides?“",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Ansprechzeit",
              "quote": "„Beantworten diese Salons ihre Bewertungen und wie lange dauern die Antworten der Eigentümer?“",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Authentifizierung und Daten",
        "title": {
          "lead": "Melden Sie sich einmal an. ",
          "accent": "Nur öffentliche Daten.",
          "tail": ""
        },
        "lead": "Jeder Aufruf an den Endpunkt MCP trägt einen Trägeranmeldedaten – ein OAuth-Token für die Anmeldung oder Ihren API-Schlüssel, wenn sich Ihr Client nicht anmelden kann – und jedes Ergebnis stammt von dem, was Google Maps öffentlich anzeigt.",
        "inspector": {
          "label": "Beispiel einer MCP-Anfrage mit einem Träger-Header Authorization und ihrer JSON-RPC-Antwort mit strukturiertem Inhalt",
          "request": "Anfrage",
          "response": "Antwort",
          "verified": "Token verifiziert"
        },
        "items": [
          {
            "icon": "key",
            "title": "Melden Sie sich an oder greifen Sie auf einen Schlüssel zurück",
            "description": "Melden Sie sich über Ihren Browser an und genehmigen Sie den Client. Clients ohne MCP-Autorisierung können stattdessen Ihren API-Schlüssel als Inhabertoken weitergeben – beide erreichen die gleichen Tools."
          },
          {
            "icon": "eye",
            "title": "Liest Google Maps, schreibt nie",
            "description": "Die Tools durchsuchen und lesen nur öffentliche Einträge. Das Einzige, was sich durch einen Anruf ändert, ist die Nutzung Ihrer Anfrage."
          },
          {
            "icon": "lock",
            "title": "Keine Geheimnisse in Konfigurationsdateien",
            "description": "Bei der Anmeldung enthält Ihre Konfiguration nur den Endpunkt URL. Wenn Sie einen API-Schlüssel verwenden, bewahren Sie ihn in einer Umgebungsvariablen und nicht in einer gemeinsam genutzten Datei auf."
          },
          {
            "icon": "shield",
            "title": "Den Zugriff jederzeit widerrufen",
            "description": "Angemeldete Kunden werden im Dashboard → API aufgelistet, wo Sie sie widerrufen können. Durch das Generieren eines neuen API-Schlüssels wird der alte sofort deaktiviert."
          }
        ]
      },
      "billing": {
        "kicker": "Preise",
        "title": {
          "lead": "Abgedeckt durch Ihren ",
          "accent": " API-Plan ",
          "tail": ""
        },
        "lead": "Der Server MCP bezieht sich auf das gleiche monatliche Anfragekontingent wie der Scraper API und die Bewertungen API. Jeder erfolgreiche Tool-Aufruf zählt als eine Anfrage.",
        "compare": "Vergleichen Sie API Pläne",
        "head": {
          "plan": "Planen",
          "requests": "Monatliche Anfragen",
          "scale": "(Log-Skala)",
          "price": "Preis"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Häufige Fragen",
          "tail": ""
        },
        "items": [
          {
            "question": "Was ist der Server MapsGrab MCP?",
            "answer": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab. search_places / list_reviews / list_photos."
          },
          {
            "question": "Welche Clients können sich verbinden?",
            "answer": "Jeder MCP-Client, der Streamable HTTP unterstützt: Claude Code, Cursor, VS Code, Codex, MCP Inspector und andere. Verwenden Sie den Endpunkt URL genau wie gezeigt, einschließlich des abschließenden Schrägstrichs."
          },
          {
            "question": "Wie erfolgt die Authentifizierung?",
            "answer": "Mit OAuth-Anmeldung: Claude Code, Cursor, VS Code, Codex und anderen Clients, die die MCP-Autorisierung unterstützen, öffnen Sie MapsGrab in Ihrem Browser. Sie genehmigen den Kunden und können ihn später im Dashboard → API widerrufen. Nur wenn sich Ihr Kunde nicht anmelden kann, übergeben Sie Ihren Schlüssel API als Inhabertoken im Header Authorization."
          },
          {
            "question": "Wie werden Werkzeugaufrufe gezählt?",
            "answer": "Jeder erfolgreiche Aufruf zählt als eine Anfrage, auch bei teilweise gelieferten Fotos und unabhängig von der Fotoanzahl. Können keine gültigen Fotos geliefert werden, schlägt der Aufruf fehl und verbraucht kein Kontingent. Suche, Bewertungen, Fotos und MCP teilen sich das Monatskontingent."
          },
          {
            "question": "Kann mein Agent Geschäftsfotos erhalten?",
            "answer": "list_photos(fid, max_results): Rufe öffentliche Foto-URLs eines Unternehmens per fid als JSON ab. max_results begrenzt die Lieferung; die Ergebnisse sind unvollständig und garantieren kein vollständiges Album. Positive Obergrenze für die Lieferung, Standard 200. Diese Fotoanzahl wird nicht garantiert."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Geben Sie Ihrem Agenten ",
          "accent": " Live-Kartendaten ",
          "tail": ""
        },
        "lead": "Suche Google-Maps-Orte, lies Bewertungen und rufe öffentliche Unternehmensfotos über eine MCP-Verbindung ab."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Kostenlose Tools",
        "guide": {
          "kicker": "Über dieses Tool",
          "title": {
            "lead": "Was es macht und ",
            "accent": " wie man es benutzt ",
            "tail": ""
          },
          "lead": "Alles läuft in Ihrem Browser – nichts, was Sie einfügen oder hochladen, verlässt Ihr Gerät."
        },
        "related": {
          "kicker": "Verwandte Tools",
          "title": {
            "lead": "Weitere kostenlose Tools für ",
            "accent": " Kartendaten ",
            "tail": ""
          },
          "lead": "Kleine Dienstprogramme, die vollständig in Ihrem Browser ausgeführt werden – was Sie einfügen, verlässt nie Ihr Gerät. Ausnahme ist der E-Mail-Checker: Er sendet die Adresse zur Prüfung an unseren Server."
        },
        "faq": {
          "kicker": "Häufige Fragen",
          "lead": "Die kurzen Antworten. Ansonsten ist der Support nur eine E-Mail entfernt.",
          "contact": "Kontaktieren Sie den Support"
        },
        "cta": {
          "kicker": "Massenextraktion",
          "primary": "Installieren Sie MapsGrab",
          "secondary": "Preise anzeigen",
          "note": "Kostenloses monatliches Kontingent inklusive. Keine Kreditkarte."
        },
        "resultHeading": "Ergebnis",
        "copy": "Kopie",
        "copied": "In die Zwischenablage kopiert.",
        "downloadCsv": "Laden Sie CSV herunter",
        "genericError": "Etwas ist schief gelaufen. Überprüfen Sie Ihre Eingabe und versuchen Sie es erneut."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder – Holen Sie sich einen Google Maps Place ID von einem URL | MapsGrab",
          "description": "Fügen Sie einen Google Maps Ort URL ein und erhalten Sie sofort dessen Place ID, CID und FID. Kostenloser browserbasierter Place ID-Finder – keine Anmeldung, Ihr URL verlässt nie Ihr Gerät."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": " Sucher ",
            "tail": ""
          },
          "description": "Fügen Sie eine vollständige Google Maps-Stelle URL ein und lesen Sie deren Place ID, CID und FID mit einem Klick aus. Alles wird in Ihrem Browser entschlüsselt – der URL wird nie hochgeladen."
        },
        "form": {
          "urlLabel": "Google Maps Ort URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Finden Sie Place ID",
          "errorShortLink": "Kurzlinks (maps.app.goo.gl) werden nicht unterstützt. Öffnen Sie den Link in Ihrem Browser und fügen Sie den vollständigen URL aus der Adressleiste ein.",
          "errorInvalidUrl": "Das sieht nicht nach einem Google Maps Ort URL aus. Öffnen Sie einen Ort in Google Maps und kopieren Sie den vollständigen URL (er sollte „/maps/place/“ und „@“ oder „data=\" enthalten).",
          "errorNoIds": "In diesem URL wurden keine Ortskennungen gefunden. Stellen Sie sicher, dass Sie den URL einer Ortsseite und nicht einer Suchergebnisseite kopiert haben.",
          "examplesLabel": "Versuchen",
          "examples": {
            "city": "San Francisco",
            "business": "Café · Portland",
            "shortLink": "Kurzer Link"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url der beiden FID Hälften",
          "cidNote": "FID 2nd. Hälfte, Hex → Dezimal",
          "fidNote": "Die letzten beiden 0x…-Segmente im URL",
          "anatomy": {
            "fidHigh": "FID · 1. erste Hälfte",
            "fidLow": "FID · 2nd Hälfte",
            "empty": "Fügen Sie einen Ort URL ein – die darin enthaltenen Kennungen leuchten hier auf."
          },
          "missing": "Nicht in diesem Link",
          "copyLabel": "Kopieren Sie {label}",
          "privacy": "In Ihrem Browser dekodiert – der URL wird nie hochgeladen."
        },
        "chips": [
          {
            "label": "Google API Schlüssel",
            "value": "Nicht erforderlich"
          },
          {
            "label": "Ihr URL",
            "value": "Nie hochgeladen"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Wie es funktioniert",
            "title": {
              "lead": "Von einem Kartenlink zu einem ",
              "accent": " Place ID ",
              "tail": ""
            },
            "lead": "Kein Schlüssel API und keine Anmeldung – die Kennungen befinden sich bereits an der Stelle URL, die Sie kopieren."
          },
          "items": [
            {
              "heading": "Öffnen Sie den Ort in Google Maps",
              "body": "Suchen Sie nach dem Unternehmen und klicken Sie auf seinen Eintrag, sodass die Ortsseite geöffnet wird."
            },
            {
              "heading": "Kopieren Sie den vollständigen URL",
              "body": "Kopieren Sie das lange URL aus der Adressleiste – es enthält den Firmennamen, ein „@“-Koordinatensegment und einen „data=\"-Parameter."
            },
            {
              "heading": "Einfügen und dekodieren",
              "body": "Fügen Sie es oben ein und klicken Sie auf „Find Place ID“. Es werden Place ID, CID und FID angezeigt, jeweils mit einer Schaltfläche zum Kopieren."
            }
          ],
          "copiedBadge": "Kopiert",
          "note": "Kurze Links wie „maps.app.goo.gl“ können nicht entschlüsselt werden, ohne ihnen domänenübergreifend zu folgen. Öffnen Sie daher zuerst den Link und fügen Sie die vollständige Adresse ein."
        },
        "identifiers": {
          "head": {
            "kicker": "Die Bezeichner",
            "title": {
              "lead": "Drei IDs, ",
              "accent": ", eine Stelle ",
              "tail": ""
            },
            "lead": "Ein Place ID ist die stabile Kennung von Google für einen Standort – eine Zeichenfolge, die mit „ChIJ“ beginnt und auch dann gültig bleibt, wenn das Unternehmen umbenannt oder umgezogen wird."
          },
          "keys": {
            "placeId": "Die Zeichenfolge „ChIJ…“, die von den Orten API, Bewertungs-Widgets und Buchungssystemen verwendet wird.",
            "fid": "Ein Paar hexadezimaler Werte, die intern dasselbe Merkmal identifizieren.",
            "cid": "Die Dezimalform der zweiten Hälfte von FID, die von älteren Karten URLs und Anzeigentools verwendet wird."
          },
          "derive": {
            "label": "Wie Place ID und CID von FID abgeleitet werden",
            "source": "FID aus dem URL",
            "protobuf": "Protobuf · Little-Endian",
            "base64": "base64url",
            "secondHalf": "2nd Hälfte",
            "hexToDecimal": "hex → dezimal"
          },
          "features": [
            {
              "heading": "Kein API-Schlüssel",
              "body": "Der Place ID ist bereits an der von Ihnen eingefügten Stelle URL kodiert, sodass das Tool ihn offline dekodieren kann."
            },
            {
              "heading": "Keine Tarifbegrenzung",
              "body": "Es ist kein Suchdienst beteiligt – die Konvertierung von Maps URL in Place ID ist deterministisch."
            },
            {
              "heading": "Nie hochgeladen",
              "body": "Die gesamte Berechnung wird in Ihrem Browser-Tab ausgeführt – der von Ihnen eingefügte URL wird niemals an einen Server gesendet."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Ändert sich ein Place ID jemals?",
              "answer": "Selten. Google dokumentiert Orts-IDs als stabile langfristige Identifikatoren, aber eine kleine Anzahl von IDs kann zurückgezogen werden, wenn Standorte zusammengelegt oder umstrukturiert werden. Wenn ein Verbraucher eines Place ID ihn als ungültig meldet, suchen Sie erneut nach dem Ort und aktualisieren Sie den gespeicherten Wert."
            },
            {
              "question": "Ist Place ID dasselbe wie CID?",
              "answer": "Nein. CID ist eine dezimale Kennung, die von älteren Maps-Links und Werbetools verwendet wird, während Place ID die Zeichenfolge „ChIJ…“ ist, die von den Orten API verwendet wird. Sie identifizieren das gleiche Merkmal, sind jedoch nicht austauschbar, weshalb dieses Tool beide meldet."
            },
            {
              "question": "Warum wird mein Maps.app.goo.gl-Link abgelehnt?",
              "answer": "Kurze Links werden erst nach einer domänenübergreifenden Weiterleitung zur vollständigen Stelle URL aufgelöst, der ein reines Browser-Tool nicht folgen kann, ohne Ihren Link an einen Dritten zu senden. Öffnen Sie den Kurzlink in Ihrem Browser und fügen Sie den vollständigen URL ein, der in der Adressleiste angezeigt wird."
            },
            {
              "question": "Benötige ich dafür einen Google API Schlüssel?",
              "answer": "Nein. Der Place ID ist bereits an der von Ihnen eingefügten Stelle URL kodiert, sodass das Tool ihn offline dekodieren kann. Ein Google API Schlüssel wird nur benötigt, wenn Sie anschließend die Orte API mit der ID aufrufen möchten."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Benötigen Sie Orts-IDs ",
            "accent": " im Maßstab? ",
            "tail": ""
          },
          "lead": "MapsGrab extrahiert Place ID, CID und FID für jedes erfasste Unternehmen – zusammen mit 33 anderen Spalten – und exportiert direkt nach CSV oder JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Review Link Generator – Kostenlose direkte Bewertung URL | MapsGrab",
          "description": "Verwandeln Sie einen Google Maps Ort URL in einen direkten Google Bewertungslink, den Sie mit Kunden teilen können. Kostenlos, browserbasiert und es wird nichts hochgeladen."
        },
        "hero": {
          "title": {
            "lead": "Google Bewertungslink ",
            "accent": " Generator ",
            "tail": ""
          },
          "description": "Fügen Sie einen Google Maps Ort URL ein und erhalten Sie den direkten Link „Bewertung schreiben“ für dieses Unternehmen – der kürzeste Weg von einem zufriedenen Kunden zu einer Google Bewertung."
        },
        "form": {
          "urlLabel": "Google Maps Ort URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Bewertungslink generieren",
          "errorShortLink": "Kurzlinks (maps.app.goo.gl) werden nicht unterstützt. Öffnen Sie den Link in Ihrem Browser und fügen Sie den vollständigen URL aus der Adressleiste ein.",
          "errorInvalidUrl": "Das sieht nicht nach einem Google Maps Ort URL aus. Öffnen Sie einen Ort in Google Maps und kopieren Sie den vollständigen URL (er sollte „/maps/place/“ und „@“ oder „data=\" enthalten).",
          "errorNoIds": "In diesem URL wurden keine Ortskennungen gefunden. Stellen Sie sicher, dass Sie den URL einer Ortsseite und nicht einer Suchergebnisseite kopiert haben."
        },
        "result": {
          "linkLabel": "Bewertungslink",
          "open": "Offen"
        },
        "howTo": [
          {
            "heading": "Was ist ein Google Bewertungslink?",
            "body": "Ein Bewertungslink ist eine Verknüpfung, die den Bewertungsdialog eines bestimmten Unternehmens unter Google öffnet. Anstatt Kunden zu bitten, nach Ihrem Unternehmen zu suchen, zum Abschnitt „Bewertungen“ zu scrollen und auf „Bewertung schreiben“ zu klicken, senden Sie ihnen eine URL – search.google.com/local/reviews?placeid=… – die direkt im Bewertungsformular landet. Unternehmen fügen diese Links in Folge-E-Mails, QR-Codes am Schalter und SMS-Nachrichten nach der Transaktion ein."
          },
          {
            "heading": "So generieren Sie einen Bewertungslink",
            "body": "Öffnen Sie Google Maps, suchen Sie nach Ihrem Unternehmen und öffnen Sie dessen Standortseite. Kopieren Sie das lange URL aus der Adressleiste und fügen Sie es oben ein. Klicken Sie auf „Bewertungslink generieren“ und das Tool erstellt den direkten Link mit der codierten Orts-ID, der zum Kopieren oder Öffnen bereit ist. Der Link ist universell: Er funktioniert auf Desktop-Browsern und in der mobilen App Google Maps."
          },
          {
            "heading": "Woher die Orts-ID kommt",
            "body": "Das Tool verwendet dieselbe lokale Dekodierung wie der Finder Place ID: Die Kennung ist bereits in den Karten URL vorhanden und die Konvertierung in die Form „ChIJ…“ erfolgt vollständig in Ihrem Browser. Wenn Sie mehrere Standorte verwalten, wiederholen Sie den Vorgang für jeden Ort – oder lassen Sie MapsGrab die Spalte Place ID bei jedem Export übernehmen, damit Bewertungslinks in großen Mengen aus einer Tabelle generiert werden können."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Verfallen Bewertungslinks?",
              "answer": "Nein. Der Link ist an die Orts-ID des Standorts gebunden, die Google stabil hält. Solange der Ort unter Google Maps existiert, öffnet der Link weiterhin seinen Bewertungsdialog."
            },
            {
              "question": "Kann ich einen Link für mehrere Standorte verwenden?",
              "answer": "Jeder Bewertungslink gehört zu genau einem Ort. Generieren Sie einen separaten Link pro Standort – Unternehmen mit mehreren Standorten führen normalerweise eine Tabelle mit Orts-IDs und leiten die Links daraus ab."
            },
            {
              "question": "Ist es erlaubt, mit einem Link nach Bewertungen zu fragen?",
              "answer": "Es ist in Ordnung, Kunden um ehrliche Bewertungen zu bitten. Das Anregen oder Filtern von Bewertungen ist nicht der Fall. Die Richtlinie von Google verbietet eine Vergütung für Bewertungen und Review-Gating – senden Sie jedem Kunden den gleichen Link und lassen Sie das Feedback für sich sprechen."
            },
            {
              "question": "Warum öffnet mein Link eine Suchseite anstelle des Bewertungsformulars?",
              "answer": "Das passiert, wenn die Orts-ID im Link falsch ist – normalerweise das Ergebnis einer manuell bearbeiteten URL. Generieren Sie den Link vom ursprünglichen Maps-Ort URL neu und stellen Sie sicher, dass Place ID mit „ChIJ“ beginnt."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Verfolgen Sie jede Bewertung, die Sie ",
            "accent": " ",
            "tail": " verdienen"
          },
          "lead": "MapsGrab ruft die Bewertungen jeder Unternehmensseite ab – Bewertung, Text, Datum und Eigentümerantworten –, sodass Sie sehen können, wie Feedback eintrifft, und schneller darauf antworten können."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "E-Mail-Checker – E-Mail-Adresse kostenlos prüfen | MapsGrab",
          "description": "Finden Sie heraus, ob eine E-Mail-Adresse E-Mails empfangen kann. Der kostenlose E-Mail-Checker fragt beim Mailserver nach und zeigt Status, Zustellbarkeit, MX-Einträge und Kontotyp."
        },
        "hero": {
          "title": {
            "lead": "E-Mail ",
            "accent": " Checker ",
            "tail": ""
          },
          "description": "Geben Sie eine E-Mail-Adresse ein – wir fragen bei ihrem Mailserver nach, ob sie tatsächlich E-Mails empfangen kann, und zeigen Status, MX-Einträge, Kontotyp und eine Bewertung."
        },
        "guideLead": "Die Formatprüfung läuft in Ihrem Browser; die Adresse selbst wird zur Prüfung beim Mailserver an unseren Server gesendet.",
        "form": {
          "emailLabel": "E-Mail-Adresse",
          "emailPlaceholder": "name@example.com",
          "submit": "E-Mail prüfen",
          "submitting": "Wird geprüft …",
          "verifyingHint": "Der Mailserver wird abgefragt – das kann bis zu einer Minute dauern.",
          "invalidHeading": "Bei dieser E-Mail-Adresse gibt es Probleme:",
          "issues": {
            "empty": "Geben Sie zunächst eine E-Mail-Adresse ein.",
            "multipleAt": "Die Adresse enthält mehr als ein „@“-Symbol.",
            "missingAt": "Der Adresse fehlt das „@“, das den lokalen Teil von der Domäne trennt.",
            "localEmpty": "Der Teil vor dem „@“ ist leer.",
            "localTooLong": "Der Teil vor dem „@“ ist länger als die von den E-Mail-Standards zulässigen 64 Zeichen.",
            "localInvalidChars": "Der Teil vor dem „@“ enthält Zeichen, die in E-Mail-Adressen nicht erlaubt sind (Leerzeichen, Anführungszeichen oder Steuerzeichen).",
            "localDotPosition": "Punkte im lokalen Teil dürfen nicht an erster oder letzter Stelle stehen oder zweimal hintereinander erscheinen.",
            "domainEmpty": "Der Teil nach dem „@“ ist leer.",
            "domainNoTld": "Die Domain hat keine Endung (TLD) – fügen Sie etwas wie „.com“ oder „.org“ hinzu.",
            "domainInvalidChars": "Die Domäne enthält unzulässige Zeichen (Leerzeichen, Unterstriche oder Symbole).",
            "domainLabelHyphen": "Domänenbezeichnungen dürfen nicht mit einem Bindestrich beginnen oder enden.",
            "domainEmptyLabel": "Die Domäne enthält zwei Punkte in einer Reihe oder ein leeres Segment.",
            "domainTooLong": "Die Domain ist länger als die von den E-Mail-Standards zulässigen 253 Zeichen.",
            "typoDomain": "Diese Domain sieht aus wie ein Tippfehler eines beliebten E-Mail-Anbieters."
          }
        },
        "result": {
          "labels": {
            "status": "Status",
            "deliverable": "Zustellbar",
            "mxRecords": "MX-Einträge",
            "email": "E-Mail-Adresse",
            "domain": "Domain",
            "accountType": "Kontotyp",
            "catchAll": "Catch-all-Domain",
            "score": "Bewertung"
          },
          "statuses": {
            "safe": "Sicher",
            "invalid": "Ungültig",
            "disabled": "Deaktiviert",
            "disposable": "Wegwerfadresse",
            "inbox_full": "Postfach voll",
            "catch_all": "Catch-all",
            "role_account": "Rollenadresse",
            "spamtrap": "Spamfalle",
            "unknown": "Unbekannt"
          },
          "accountTypes": {
            "standard": "Standard",
            "role": "Rollenadresse",
            "disposable": "Wegwerfadresse",
            "free": "Freemail"
          },
          "yes": "Ja",
          "no": "Nein",
          "noMx": "Keine gefunden",
          "unavailable": "Der Prüfdienst ist nicht erreichbar. Bitte versuchen Sie es gleich noch einmal.",
          "rateLimited": "Ihre kostenlosen Prüfungen für heute sind aufgebraucht. Bitte versuchen Sie es morgen erneut."
        },
        "howTo": [
          {
            "heading": "Was dieser Checker prüft",
            "body": "Der Checker fragt beim Mailserver des Empfängers nach, ob das Postfach existiert und E-Mails annimmt – dieselbe Frage, die ein sendender Server vor der Zustellung stellt, ohne dass eine Nachricht verschickt wird. Das Ergebnis zeigt den Gesamtstatus, ob die Adresse zustellbar ist, die MX-Einträge der Domain, den Kontotyp (Standard, Rollenadresse wie info@ oder vertrieb@, Wegwerfadresse oder Freemail-Anbieter), ob es sich um eine Catch-all-Domain handelt, und eine Bewertung von 0 bis 100."
          },
          {
            "heading": "So prüfen Sie eine E-Mail-Adresse",
            "body": "Geben Sie eine Adresse ein oder fügen Sie sie ein und klicken Sie auf „E-Mail prüfen“. Formatfehler werden in Ihrem Browser aufgelistet, und eine solche Adresse wird nicht gesendet; ein wahrscheinlicher Tippfehler bei einem bekannten Anbieter wie „gmial.com“ wird angezeigt, hält die Prüfung aber nicht auf. Eine korrekt aufgebaute Adresse wird an unseren Server übermittelt, der sie beim Mailserver prüft – das dauert meist wenige Sekunden, kann aber bis zu einer Minute dauern."
          },
          {
            "heading": "So lesen Sie das Ergebnis",
            "body": "„Sicher“ bedeutet, dass das Postfach existiert und E-Mails annimmt. Ungültige und deaktivierte Adressen führen zu Bounces, und an Spamfallen sollte nie gesendet werden. Eine Catch-all-Domain nimmt jede Adresse an, daher lässt sich das Postfach selbst nicht bestätigen; Rollenadressen, Wegwerfadressen und volle Postfächer sind für die Kontaktaufnahme riskant. „Unbekannt“ bedeutet, dass der Mailserver keine eindeutige Antwort gegeben hat – versuchen Sie es später erneut. MapsGrab sammelt E-Mail-Adressen von der Website jedes Unternehmens, und mit diesem Checker prüfen Sie eine davon schnell, bevor Sie Kontakt aufnehmen."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Prüft dieses Tool, ob das Postfach wirklich existiert?",
              "answer": "Ja. Über das Format hinaus fragt es beim Mailserver des Empfängers nach, ob er E-Mails für die Adresse annimmt – ohne eine E-Mail zu senden. Gibt der Server keine eindeutige Antwort, etwa bei einer Catch-all-Domain, sagt das Ergebnis das, statt zu raten."
            },
            {
              "question": "Wie viele Adressen kann ich prüfen?",
              "answer": "Bis zu 5 pro Tag kostenlos, jeweils eine Adresse. Adressen, die an der Formatprüfung scheitern, werden nie gesendet und zählen daher nicht zum Limit."
            },
            {
              "question": "Kann eine hier bestandene Adresse trotzdem bouncen?",
              "answer": "Ja. Ein Postfach kann nach der Prüfung geschlossen werden oder volllaufen, und manche Server nehmen E-Mails zunächst an und schicken sie später zurück. „Sicher“ bedeutet, dass die Adresse zum Zeitpunkt der Prüfung E-Mails angenommen hat – nicht, dass jemand sie liest."
            },
            {
              "question": "Warum wird „name@localhost“ abgelehnt?",
              "answer": "Der Checker verlangt eine Domain mit öffentlicher Endung (TLD), weil Adressen ohne eine solche keine E-Mails aus dem Internet empfangen können. Solche Adressen werden in Ihrem Browser markiert und nie zur Prüfung gesendet."
            },
            {
              "question": "Was passiert mit der E-Mail-Adresse, die ich eingebe?",
              "answer": "Sie wird an unseren Server gesendet, der sie von einem E-Mail-Prüfdienst beim Mailserver des Empfängers prüfen lässt. An die Adresse wird keine E-Mail gesendet."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Sammeln Sie E-Mails, die ",
            "accent": " wert sind, indem Sie ",
            "tail": " verifizieren"
          },
          "lead": "MapsGrab findet die E-Mail-Adressen und sozialen Profile hinter jedem extrahierten Unternehmen – direkt von der eigenen Website des jeweiligen Unternehmens."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Konvertieren Sie Lat Long in DMS – Dezimalgrad in Grad, Minuten, Sekunden | MapsGrab",
          "description": "Konvertieren Sie dezimale Breiten- und Längengrade sofort in das Format Grad, Minuten, Sekunden (DMS). Kostenloser browserbasierter Koordinatenkonverter, nichts hochgeladen."
        },
        "hero": {
          "title": {
            "lead": "Konvertieren Sie Lat Long in ",
            "accent": " DMS ",
            "tail": ""
          },
          "description": "Geben Sie den dezimalen Breiten- und Längengrad ein und lesen Sie dieselben Koordinaten in Grad, Minuten und Sekunden ab – mit Halbkugelbuchstaben, bereit zum Kopieren."
        },
        "form": {
          "latitudeLabel": "Breitengrad (dezimal, -90 bis 90)",
          "longitudeLabel": "Längengrad (dezimal, -180 bis 180)",
          "placeholder": "37.774929",
          "submit": "Konvertieren in DMS",
          "errorLatitude": "Der Breitengrad muss eine Zahl zwischen -90 und 90 sein.",
          "errorLongitude": "Der Längengrad muss eine Zahl zwischen -180 und 180 sein."
        },
        "result": {
          "dms": "Koordinaten in DMS"
        },
        "howTo": [
          {
            "heading": "Was sind Dezimalgrade und DMS?",
            "body": "Karten und Tabellenkalkulationen speichern Koordinaten als Dezimalgrade – eine vorzeichenbehaftete Zahl pro Achse, wie 37.774929, -122.419416. Vermessungen, Seekarten und viele Eigentumsdokumente verwenden die ältere Sexagesimalschreibweise: Grad, Minuten und Sekunden mit Halbkugelbuchstaben, wie 37° 46' 29.74\" N, 122° 25' 9.90\" W. Beide beschreiben denselben Punkt; Die Form DMS teilt den Bruch einfach in immer kleinere Einheiten auf, wobei eine Minute 1/60 Grad und eine Sekunde 1/60 Minute ist."
          },
          {
            "heading": "So konvertieren Sie",
            "body": "Fügen Sie den dezimalen Breiten- und Längengrad ein und klicken Sie auf „In DMS konvertieren“. Negative Werte beziehen sich auf die südliche und westliche Hemisphäre und werden als S und W angegeben. Die Sekunden werden mit zwei Dezimalstellen angezeigt – etwa ein Meter Bodenauflösung, genauer als jede GPS-Erfassung für Verbraucher. Kopieren Sie das Ergebnis als einzelne Zeile für Dokumente oder als getrennte Felder für Tabellenkalkulationen."
          },
          {
            "heading": "Warum dies für die Arbeit mit Kartendaten wichtig ist",
            "body": "Koordinaten-Roundtrips sind ein täglicher Reibungspunkt beim Verschieben von Geschäftsdaten zwischen Tools: Google Maps exportiert Dezimalzahlen, während Kataster- und Druck-Workflows DMS erwarten. MapsGrab hält diese Reibung im Maßstab gering – jedes extrahierte Unternehmen trägt bereits seinen Breiten- und Längengrad im Export, und Batch-Koordinatenkonvertierungen können offline mit derselben Formel ausgeführt werden, die diese Seite verwendet."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Wie genau ist das Ergebnis DMS?",
              "answer": "Die Sekunden werden mit zwei Dezimalstellen angezeigt. Eine Breitensekunde beträgt ungefähr 30 Meter, zwei Dezimalstellen ergeben also etwa 30 Zentimeter – viel genauer als die zugrunde liegenden GPS-Daten. Die Präzision wird durch Ihre Eingabe begrenzt, nicht durch die Konvertierung."
            },
            {
              "question": "Was bedeuten hier N, S, E und W?",
              "answer": "Sie ersetzen das Vorzeichen des Dezimalwerts: positive Breitengrade sind Norden (N) und negative sind Süden (S); Positive Längengrade sind Osten (E) und negative sind Westen (W). Das Tool wählt die Buchstaben automatisch aus dem Schild aus."
            },
            {
              "question": "Kann ich hier DMS wieder in eine Dezimalzahl umwandeln?",
              "answer": "Ja – verwenden Sie das Begleittool „Convert DMS to DD“ auf dieser Website. Durch die Konvertierung in beide Richtungen mit derselben Implementierung wird eine Rundungsabweichung zwischen verschiedenen Formeln vermieden."
            },
            {
              "question": "Werden meine Koordinatendaten hochgeladen?",
              "answer": "Nein. Die Konvertierung erfolgt nur rechnerisch in Ihrem Browser-Tab. Nichts, was Sie eingeben, verlässt die Seite."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Koordinaten für jedes Unternehmen, bereits ",
            "accent": " extrahiert, ",
            "tail": ""
          },
          "lead": "MapsGrab schreibt Breiten- und Längengrade in jede exportierte Zeile – keine manuelle Koordinatensuche für Ihr nächstes Routen- oder Gebietsprojekt."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Konvertieren Sie DMS in DD – Grad Minuten Sekunden in Dezimalgrad | MapsGrab",
          "description": "Konvertieren Sie Grad-, Minuten- und Sekundenkoordinaten sofort in Dezimalgrade. Kostenloser browserbasierter DMS-zu-DD-Konverter, nichts hochgeladen."
        },
        "hero": {
          "title": {
            "lead": "Konvertieren Sie DMS in DD ",
            "accent": " (Lat, Long) ",
            "tail": ""
          },
          "description": "Geben Sie Grad, Minuten und Sekunden für beide Achsen ein und erhalten Sie reine Dezimalgrade – das Format Google Maps, Tabellenkalkulationen und MapsGrab verstehen."
        },
        "form": {
          "latitudeHeading": "Breitengrad (N/S)",
          "longitudeHeading": "Längengrad (E/W)",
          "degreesLabel": "Abschlüsse",
          "minutesLabel": "Bogenminuten",
          "secondsLabel": "Bogensekunden",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "In Dezimalzahl umrechnen",
          "errorValues": "Grad müssen Null oder eine positive ganze Zahl sein, Minuten und Sekunden müssen zwischen 0 und 60 liegen."
        },
        "result": {
          "dd": "Koordinaten in Dezimalgrad"
        },
        "howTo": [
          {
            "heading": "Warum DMS zurück in Dezimalgrad umwandeln?",
            "body": "Grad-Minuten-Sekunden ist eine Schreibweise für den Menschen, aber praktisch jedes maschinenorientierte System benötigt Dezimalgrade: Google Maps-Suche, GIS-Importe, Entfernungsformeln in Tabellenkalkulationen und Geokodierungspipelines. Die Umrechnung ist eine einfache gewichtete Summe – Grad plus Minuten geteilt durch 60 plus Sekunden geteilt durch 3600 – wobei der Buchstabe der Hemisphäre das Vorzeichen bestimmt."
          },
          {
            "heading": "So konvertieren Sie",
            "body": "Geben Sie Grad, Minuten und Sekunden für Breiten- und Längengrad ein und wählen Sie die Buchstaben der Hemisphäre (N/S und E/W). Klicken Sie auf „In Dezimalzahl konvertieren“ und das Tool gibt beide Achsen als vorzeichenbehaftete Dezimalzahlen mit sechs Dezimalstellen aus, die auf dem Boden in etwa 11 Zentimeter aufgelöst werden – mehr als genug für die Verwendung an jedem Unternehmensstandort. Fügen Sie das Ergebnis direkt in Google Maps oder Ihre Tabelle ein."
          },
          {
            "heading": "Koordinatendaten konsistent halten",
            "body": "Gemischte Notationen sind der übliche Grund dafür, dass Standorte nach einem Import im falschen Ozean landen. Wenn man sich einmal für Dezimalgrade entscheidet und alles an der Grenze umrechnet, bleiben die Pipelines in Ordnung. MapsGrab exportiert Koordinaten bereits in Dezimalgraden, sodass die mit der Erweiterung erfassten Daten ohne Konvertierungsschritt in GIS- und BI-Tools übernommen werden."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Wie viele Dezimalstellen benötige ich?",
              "answer": "Sechs Dezimalstellen ergeben ungefähr 11 Zentimeter – jenseits der Genauigkeit von Verbraucher-GPS. Fünf Plätze (ca. 1 Meter) reichen für Gewerbestandorte; Weniger Dezimalstellen verwischen absichtlich den Punkt."
            },
            {
              "question": "Welche Bereiche müssen die Felder erfüllen?",
              "answer": "Minuten und Sekunden reichen von 0 bis unter 60. Breitengrade reichen bis 90 und Längengrade bis 180; Der Konverter meldet es, wenn ein Wert außerhalb des Globus landen würde."
            },
            {
              "question": "Soll ich negative Zahlen eingeben, wenn ich S oder W auswähle?",
              "answer": "Nein – der Halbkugelbuchstabe kodiert das Zeichen bereits. Wenn Sie gleichzeitig einen vorzeichenbehafteten Wert und einen widersprüchlichen Buchstaben eingeben, markiert das Tool den Widerspruch, anstatt zu raten."
            },
            {
              "question": "Erfolgt die Konvertierung auf einem Server?",
              "answer": "Nein. Die Formel läuft in Ihrem Browser; Nichts, was Sie eingeben, wird irgendwohin übertragen."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Überspringen Sie die manuelle Koordinatenarbeit ",
            "accent": " im Maßstab ",
            "tail": ""
          },
          "lead": "MapsGrab exportiert den dezimalen Breiten- und Längengrad für jedes erfasste Unternehmen neben den Spalten Adresse, Telefon und Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Massen-Keyword-Generator – Keyword-+Standort-Kombinationen | MapsGrab",
          "description": "Generieren Sie in großen Mengen Schlüsselwort- und Standortkombinationen für lokale SEO- und Karten-Scraping-Aufgaben. Fügen Sie zwei Listen ein, erhalten Sie jede Kombination und laden Sie sie als CSV herunter. Frei."
        },
        "hero": {
          "title": {
            "lead": "Massenschlüsselwörter ",
            "accent": " Generator ",
            "tail": ""
          },
          "description": "Fügen Sie Ihre Schlüsselwörter und Standorte ein und erhalten Sie jede Kombination aus „Schlüsselwort + Standort“ als fertig einfügbare Liste oder CSV – der schnellste Weg, eine lokale Suchkampagne zu starten."
        },
        "form": {
          "keywordsLabel": "Schlüsselwörter (eins pro Zeile)",
          "keywordsPlaceholder": "Designagentur\nCafé\nKlempner",
          "locationsLabel": "Standorte (einer pro Zeile)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Reihenfolge der Kombination",
          "keywordFirst": "Schlüsselwort + Standort (Designagentur New York)",
          "locationFirst": "Standort + Schlüsselwort (New York Designagentur)",
          "submit": "Generieren Sie Kombinationen",
          "resultCount": "{count} Kombinationen generiert.",
          "errorKeywords": "Fügen Sie mindestens ein Schlüsselwort hinzu.",
          "errorLocations": "Fügen Sie mindestens einen Standort hinzu."
        },
        "howTo": [
          {
            "heading": "Wozu dient die Massen-Keyword-Generierung?",
            "body": "Lokale Suchkampagnen basieren auf Kombinationen: Derselbe Dienst wird in jeder Stadt, jedem Bezirk oder jeder Nachbarschaft, die Sie bedienen, wiederholt. Zehn Schlüsselwörter an zehn Standorten ergeben hundert Suchphrasen – „Designagentur New York“, „Designagentur Chicago“ und so weiter. Diese von Hand zu schreiben ist fehleranfällig; Die Generierung aus zwei Listen dauert Sekunden und garantiert, dass nichts übersehen wird."
          },
          {
            "heading": "So generieren Sie Kombinationen",
            "body": "Fügen Sie Ihre Schlüsselwörter in das erste Feld ein – eines pro Zeile – und Ihre Standorte in das zweite. Wählen Sie aus, ob das Schlüsselwort oder der Standort an erster Stelle steht, und klicken Sie dann auf „Generieren“. Jedes Schlüsselwort wird mit jedem Standort gepaart, Leerzeilen und Duplikate entfernt, und die vollständige Liste wird unten mit einer Zählung angezeigt. Kopieren Sie es direkt in Google Anzeigen-Keyword-Listen, Google Trendprüfungen oder eine Karten-Scraping-Aufgabenwarteschlange."
          },
          {
            "heading": "Von der Keyword-Liste bis zu den gesammelten Daten",
            "body": "Der klassische nächste Schritt besteht darin, jede Kombination als Google Maps-Suche auszuführen und die Ergebnisse zu sammeln. Diese Schleife ist genau das, was MapsGrab automatisiert: Die Erweiterung akzeptiert eine Keyword-Liste als Batch-Aufgabe, geht die Suchanfragen einzeln durch und exportiert jedes gefundene Unternehmen – so werden die hier generierten Kombinationen zu strukturierten Zeilen, ohne dass sie manuell kopiert werden müssen."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Wie viele Kombinationen kann ich generieren?",
              "answer": "So viele, wie Ihr Browser aufnehmen kann – das Tool multipliziert die beiden Listen und dedupliziert sie lokal. Zehntausend Kombinationen sind in Ordnung; Bei sehr großen Mengen ist der Download von CSV praktischer als das Kopieren des Textbereichs."
            },
            {
              "question": "Werden Duplikate entfernt?",
              "answer": "Ja. Doppelte Zeilen in jeder Liste werden vor der Paarung gelöscht und die Ausgabe enthält jedes Schlüsselwort-Ort-Paar genau einmal in der von Ihnen gewählten Reihenfolge."
            },
            {
              "question": "Welche Reihenfolge soll ich verwenden?",
              "answer": "Bei beiden handelt es sich um echtes Suchverhalten. „Plumber Austin“ liest sich wie die Art, wie Menschen in Karten tippen; „Austin Plumber“ liest sich wie eine traditionelle SEO-Phrasierung. Die Generierung beider Aufträge ist eine gängige Methode zur Abdeckung von Suchvarianten."
            },
            {
              "question": "Kann ich Stadtteile oder Postleitzahlen als Standorte verwenden?",
              "answer": "Ja – alles, was als Karten-Suchsuffix sinnvoll ist, funktioniert: Bezirke, Postleitzahlen, Ballungsräume oder vollständige Paare aus „Stadt, Bundesland“. Eine Zeile pro Standort."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Verwandeln Sie die Keyword-Liste in ",
            "accent": "Ergebnisse",
            "tail": ""
          },
          "lead": "MapsGrab Batch-Aufgaben führen jedes Schlüsselwort als Maps-Suche aus und exportieren die Unternehmen dahinter – CSV oder JSON, mit Bewertungen, Fotos und Kontaktanreicherung."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "CSV-Dateien online zusammenführen – Mehrere CSV-Dateien kostenlos kombinieren | MapsGrab",
          "description": "Mehrere CSV-Dateien online zu einer Datei zusammenführen. Spaltenüberschriften werden automatisch nach Vereinigung ausgerichtet – kostenlos, privat und vollständig browserbasiert."
        },
        "hero": {
          "title": {
            "lead": "Zusammenführen von CSV-Dateien ",
            "accent": " Online ",
            "tail": ""
          },
          "description": "Laden Sie zwei oder mehr CSV-Dateien hoch und laden Sie eine einzelne zusammengeführte Datei herunter. Die Spalten werden nach Kopfzeile ausgerichtet – fehlende Felder bleiben leer. Dateien verlassen niemals Ihren Browser."
        },
        "form": {
          "filesLabel": "CSV Dateien",
          "filesHint": "Wählen Sie zwei oder mehr CSV-Dateien aus. Überprüfen Sie jede Datei mit übersetzten Beschriftungen in Zeile 2, um diese Zeile zu überspringen. Das zusammengeführte CSV behält eine Feldnamen-Kopfzeile bei. Dateien bleiben in Ihrem Browser.",
          "translationRow": "Zeile 2 (übersetzte Beschriftungen) in {name} überspringen",
          "submit": "Dateien zusammenführen",
          "errorNoFiles": "Wählen Sie mindestens zwei CSV-Dateien zum Zusammenführen aus.",
          "errorEmptyFile": "Eine der Dateien ist leer oder hat keine Kopfzeile: {name}",
          "fileSummary": "{name} – {rows} Datenzeilen",
          "resultSummary": "{files} Dateien wurden in {rows} Zeilen × {columns} Spalten zusammengeführt.",
          "previewLabel": "Zusammengeführte CSV-Vorschau"
        },
        "howTo": [
          {
            "heading": "Was bewirkt hier die Zusammenführung?",
            "body": "Durch das Zusammenführen werden mehrere CSV-Exporte in einer Tabelle gestapelt: Die Spalten werden in allen Dateien nach Kopfzeilennamen ausgerichtet, und jede Datenzeile behält ihre Werte unter der entsprechenden Kopfzeile. Die Dateien werden in der Reihenfolge, in der Sie sie ausgewählt haben, von oben nach unten kombiniert, sodass das Ergebnis wie ein zusammenhängender Datensatz aussieht. Spalten, die nur in einigen Dateien vorhanden sind, bleiben in der Ausgabe; Zeilen aus Dateien ohne sie erhalten leere Zellen – eine Vereinigung aller Überschriften."
          },
          {
            "heading": "So führen Sie CSV-Dateien zusammen",
            "body": "Wählen Sie zwei oder mehr CSV-Dateien aus – zum Beispiel die wöchentlichen Exporte eines Karten-Scraping-Workflows. Klicken Sie auf „Dateien zusammenführen“ und das Tool analysiert jede Datei in Ihrem Browser, meldet die Zeilenanzahl jeder Datei und erstellt die zusammengeführte Tabelle. Laden Sie es als einzelnes CSV herunter, das sauber in Excel, Google Tabellen oder einem beliebigen Datenbankimport geöffnet werden kann."
          },
          {
            "heading": "Entwickelt für die Datenerfassung in mehreren Durchläufen",
            "body": "Der typische Anwendungsfall ist das Anhängen von Läufen: Jede MapsGrab-Extraktionssitzung exportiert ihre eigene CSV, und durch das Zusammenführen werden die Sitzungen der Woche vor der Deduplizierung und Bereinigung in einem Datensatz zusammengeführt. Der Parser verarbeitet Felder in Anführungszeichen, eingebettete Kommas und Zeilenumbrüche in Zellen (RFC 4180), sodass Exporte mit mehrzeiligen Adressen oder Rezensionsausschnitten korrekt zusammengeführt werden."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Häufige Fragen",
            "tail": ""
          },
          "items": [
            {
              "question": "Was passiert, wenn Dateien unterschiedliche Spalten haben?",
              "answer": "Die zusammengeführte Datei enthält die Vereinigung aller Header in der Reihenfolge, in der sie zuerst erscheinen. Zeilen aus Dateien, denen eine Spalte fehlt, erhalten in dieser Spalte eine leere Zelle. Es wird nichts gelöscht oder umbenannt."
            },
            {
              "question": "Werden meine Dateien auf einen Server hochgeladen?",
              "answer": "Nein. Die Dateien werden mit dem FileReader API des Browsers gelesen und im Speicher Ihres Tabs zusammengeführt. Es wird nichts übertragen und durch das Schließen der Seite wird alles gelöscht."
            },
            {
              "question": "Entfernt das Zusammenführen doppelte Zeilen?",
              "answer": "Nein – beim Zusammenführen handelt es sich um eine direkte Verkettung mit ausgerichteten Spalten. Die Deduplizierung (zum Beispiel durch Place ID) ist ein separater Reinigungsschritt, den Sie für die zusammengeführte Datei ausführen."
            },
            {
              "question": "Wie groß dürfen die Dateien sein?",
              "answer": "Die Grenze ist der Speicher Ihres Browser-Tabs, keine feste Zahl. Bei typischen Geschäftsdatenexporten – Tausende bis einige Hunderttausend Zeilen – erfolgt die Zusammenführung sofort. Bei sehr großen Dateien stapelweise zusammenführen."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Ein Export pro Lauf – oder ",
            "accent": " ein Datensatz ",
            "tail": ""
          },
          "lead": "MapsGrab exportiert saubere CSV/JSON pro Sitzung mit Feldauswahl und Place ID Deduplizierung, sodass Datensätze mit mehreren Durchläufen bereits fast zusammengeführt beginnen."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Unternehmen",
  "about": {
    "navLabel": "Um",
    "seoTitle": "Über MapsGrab | Produkt und Grenzen",
    "seoDescription": "MapsGrab ist ein Kartendaten-Toolkit für öffentliche Geschäftsdaten: eine Browsererweiterung, ein Cloud-Online-Scraper, API- und MCP-Server sowie kostenlose Web-Tools. Erfahren Sie, wo die Datengrenze liegt.",
    "hero": {
      "eyebrow": "Über MapsGrab",
      "title": {
        "lead": "Kartendaten – ",
        "accent": "einfach",
        "tail": " erfasst"
      },
      "intro": "MapsGrab erstellt Tools, die öffentlich verfügbare Geschäftsinformationen von Google Maps sammeln und in saubere, strukturierte Daten umwandeln – eine Browser-Erweiterung für Edge und Firefox, einen cloudbasierten Online-Scraper, API und MCP Server sowie kostenlose Web-Tools, von denen die meisten vollständig in Ihrem Browser ausgeführt werden.",
      "contactLabel": "Kontaktieren Sie den Support",
      "extensionLabel": "Entdecken Sie die Erweiterung",
      "stageLabel": "Frühzeitiger Zugang",
      "updatedLabel": "Veröffentlicht und rezensiert",
      "updatedAt": "August 31, 2026",
      "chips": [
        {
          "label": "Sammelt",
          "value": "Nur öffentliche Daten"
        },
        {
          "label": "Erweiterungsergebnisse",
          "value": "In Ihrem Browser"
        },
        {
          "label": "Exporte",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Zum Drehen ziehen"
    },
    "build": {
      "kicker": "Was wir bauen",
      "title": {
        "lead": "Ein Toolkit, ",
        "accent": "vier",
        "tail": " Zugänge"
      },
      "lead": "Wählen Sie die Browsererweiterung, den cloudbasierten Online Scraper oder API. Die Erweiterung funktioniert in Ihrem eigenen Browser; Der Online Scraper und der API teilen sich eine Cloud-Engine, und der Server MCP bringt diesen API zu KI-Agenten.",
      "hub": {
        "title": "MapsGrab Daten-Toolkit",
        "detail": "Geschäftsdaten · Bewertungen · Fotos · E-Mail und soziale Bereicherung"
      },
      "tags": {
        "extension": [
          "36-Spaltenextraktion",
          "Rezensionen und Fotos",
          "Batch-Aufgaben"
        ],
        "online": [
          "Batch-Schlüsselwörter",
          "Kontaktanreicherung",
          "Eine 37-Spalte CSV pro Aufgabe"
        ],
        "api": [
          "Geschäftsdaten",
          "Rezensionen",
          "Strukturiert JSON"
        ],
        "mcp": [
          "Drei Tools",
          "Streamable HTTP",
          "OAuth oder API Schlüssel"
        ]
      },
      "toolsLead": "Plus kostenlose Web-Tools.",
      "toolsText": "Die kostenlosen Web-Tools auf dieser Website erledigen kleine Aufgaben – IDs platzieren, Links überprüfen, Konvertierungen koordinieren, CSV zusammenführen – ohne etwas zu installieren.",
      "toolsLabel": "Kostenlose Web-Tools"
    },
    "principles": {
      "kicker": "Prinzipien",
      "title": {
        "lead": "Wo die ",
        "accent": "Grenze",
        "tail": " liegt"
      },
      "lead": "MapsGrab geht bewusst konservativ mit Daten um. Dies sind die Produktregeln, an die wir uns halten.",
      "publicData": {
        "title": "Nur öffentliche Daten",
        "text": "Nur öffentlich verfügbare Geschäftsinformationen – was jeder Besucher der Seite bereits sehen kann.",
        "visibleTag": "Für jeden Besucher sichtbar",
        "privateTag": "Private Konten"
      },
      "localFirst": {
        "title": "Lokal zuerst",
        "text": "Mit der Erweiterung und den kostenlosen Web-Tools werden Ihre Einstellungen und Ergebnisse in Ihrem Browser gespeichert, nicht auf unseren Servern. Ausnahme ist der E-Mail-Checker: Er sendet die eingegebene Adresse an unseren Server, wo ein E-Mail-Verifizierungsdienst sie prüft, ohne eine E-Mail zu versenden. Der Online Scraper, der API und der MCP Server laufen in unserer Cloud und die Online Scraper-Ergebnisse werden in Ihrem Konto gespeichert.",
        "storage": "lokaler Speicher",
        "rows": [
          "Einstellungen",
          "Ergebnisse",
          "Batch-Aufgaben"
        ]
      },
      "backend": {
        "title": "Erweiterung & kostenlose Tools: vier Backend-Jobs",
        "text": "Für die Erweiterung und die kostenlosen Web-Tools verwaltet unser Backend genau vier Dinge: Remote-Konfiguration, Konto- und Kontingentstatus, optionale E-Mail-/soziale Anreicherung und minimale Nutzungsprotokolle. Die einzige Ausnahme ist der E-Mail-Checker: Unser Backend gibt die eingegebene Adresse zusätzlich an einen E-Mail-Verifizierungsdienst weiter, der sie prüft, ohne eine E-Mail zu versenden.",
        "chips": [
          "Konfig",
          "Quote",
          "Anreicherung",
          "Nutzungsprotokolle"
        ]
      },
      "never": {
        "title": "Keine Werbung. Keine Tracker. Kein Datenverkauf.",
        "text": "Keine Werbung, keine Tracker von Drittanbietern in der Erweiterung und kein Verkauf oder Vermietung von Daten.",
        "chips": [
          "Anzeigen",
          "Tracker von Drittanbietern",
          "Daten verkaufen"
        ]
      },
      "inWriting": {
        "kicker": "Schriftlich",
        "title": "Datenschutzbestimmungen und Nutzungsbedingungen",
        "text": "Jede dieser Regeln ist in der Datenschutzrichtlinie und den Nutzungsbedingungen aufgeführt.",
        "link": "Lesen Sie die Datenschutzrichtlinie"
      }
    },
    "dataFlow": {
      "kicker": "Wie sich Daten bewegen",
      "title": {
        "lead": "Was bei Ihnen bleibt und was uns erreicht ",
        "accent": " ",
        "tail": ""
      },
      "lead": "Die Erweiterung arbeitet mit öffentlich angezeigten Daten und speichert die Ergebnisse in Ihrem Browser. Für die Erweiterung und die kostenlosen Web-Tools unterstützt unser Backend nur die Konfiguration, Kontingente, optionale Anreicherung und minimale Nutzungsprotokolle. Ausnahme ist der E-Mail-Checker: Er sendet die eingegebene Adresse an unseren Server, wo ein E-Mail-Verifizierungsdienst sie prüft, ohne eine E-Mail zu versenden. Der Online Scraper, der API und der MCP Server laufen stattdessen in unserer Cloud und die Online Scraper-Ergebnisse werden in Ihrem Konto gespeichert.",
      "source": {
        "label": "Quelle",
        "title": "Google Maps Seiten, die Sie besuchen",
        "text": "Öffentliche Geschäftsdaten – Name, Adresse, Telefonnummer, Website, Bewertung, Rezensionen, Fotos."
      },
      "browser": {
        "label": "Ihr Browser · Local-First",
        "storage": "lokaler Speicher · IndexedDB",
        "rows": [
          "Einstellungen",
          "Extraktionsergebnisse",
          "Batch-Aufgabenstatus"
        ],
        "badge": "Wird in Ihrem Browser gespeichert"
      },
      "backend": {
        "label": "MapsGrab Backend · vier Zwecke",
        "lanes": [
          {
            "title": "Remote-Konfiguration",
            "text": "Voreinstellungen für die Seitenstruktur, die dafür sorgen, dass die Extraktion funktioniert"
          },
          {
            "title": "Konto und Kontingent",
            "text": "Anmeldung, Planstatus, monatliche Nutzungsabrechnung"
          },
          {
            "title": "E-Mail- und soziale Bereicherung",
            "text": "Öffentlich gelistete Kontakte, wenn die Funktion verwendet wird"
          },
          {
            "title": "Nutzungsprotokollierung",
            "text": "Minimale Aufzeichnungen über Funktionsnutzung und Fehler"
          }
        ]
      },
      "never": {
        "label": "Niemals",
        "items": [
          "Keine Werbung",
          "Keine Tracker von Drittanbietern in der Erweiterung",
          "Kein Verkauf oder Vermietung personenbezogener Daten",
          "Keine Sammlung Ihres Browserverlaufs über die Google Maps Seiten hinaus, aus denen Sie extrahieren"
        ]
      },
      "note": "Diese Website verwendet Google Analytics 4, um die Gesamtseitennutzung zu messen – die Erweiterung selbst enthält keine Analysen.",
      "noteLink": "Lesen Sie die Datenschutzrichtlinie"
    },
    "status": {
      "kicker": "Status",
      "title": {
        "lead": "Early Access, ",
        "accent": " kostenlos, ",
        "tail": " zum Start"
      },
      "access": {
        "title": "Frühzeitiger Zugang",
        "text": "Das Produkt befindet sich im Early Access. Store-Einträge für Edge-Add-ons und Firefox-Add-ons werden derzeit fertiggestellt.",
        "link": "Installationsanleitung"
      },
      "quota": {
        "title": "Kostenloses monatliches Kontingent",
        "text": "Die Erweiterung funktioniert ohne Konto im Rahmen eines kostenlosen monatlichen Kontingents.",
        "link": "Was ist enthalten"
      },
      "paid": {
        "title": "Kostenpflichtige Pläne für eine stärkere Nutzung",
        "text": "Bezahlte Pläne erhöhen die Grenzwerte für eine stärkere Nutzung. Die aktuellen Stufen finden Sie auf der Seite „Preise“.",
        "link": "Siehe Preise"
      }
    }
  },
  "contact": {
    "navLabel": "Kontakt",
    "seoTitle": "Kontaktieren Sie den MapsGrab-Support",
    "seoDescription": "Kontaktieren Sie MapsGrab bezüglich Konten, der Browsererweiterung, Abrechnung, Tools oder Datenschutzanfragen.",
    "eyebrow": "Kontakt MapsGrab",
    "title": {
      "lead": "Sprechen Sie mit einem ",
      "accent": "Menschen",
      "tail": ""
    },
    "intro": "Schreiben Sie uns und jemand wird es lesen. Der Support wird derzeit direkt vom Team übernommen, das MapsGrab erstellt.",
    "emailCardLabel": "Support-E-Mail",
    "copyEmail": "Kopieren Sie {email}",
    "emailLabel": "E-Mail-Support",
    "emailSubject": "MapsGrab Supportanfrage",
    "responseTimes": "Wir beantworten Support-E-Mails innerhalb eines Werktages, normalerweise schneller. Datenschutzanfragen können einige Tage dauern, wenn wir zunächst die Kontoinhaberschaft bestätigen müssen.",
    "include": {
      "title": "Was einzuschließen ist",
      "text": "Ein präziser Bericht hilft uns, den betroffenen Arbeitsablauf zu identifizieren, ohne nach sensiblen Kontoinformationen zu fragen.",
      "items": [
        "Die Seite URL und die Aktion, die Sie versucht haben",
        "Name und Version Ihres Browsers",
        "Die genaue Fehlermeldung und ggf. ein Screenshot",
        "Eine Bestellnummer für Rechnungsfragen, ohne Zahlungskartendaten"
      ]
    },
    "topics": {
      "title": "Wobei wir helfen können",
      "items": [
        "Installation und Einrichtung der Browser-Erweiterung",
        "Probleme beim Kontozugriff und bei der Anmeldung",
        "Kontingente, Abonnements, Verlängerungen und Zahlungsfragen",
        "Probleme mit Web-Tools und Funktionswünsche",
        "Datenschutz- und Kontodatenanfragen"
      ]
    },
    "aboutLabel": "Um",
    "privacyLabel": "Datenschutzrichtlinie",
    "termsLabel": "Nutzungsbedingungen"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Heim",
    "crumbLegal": "Legal",
    "switchLabel": "Juristische Dokumente",
    "readTime": "{minutes} Min. gelesen",
    "sectionCount": "{count} Abschnitte",
    "tocTitle": "Auf dieser Seite",
    "tocLabel": "{title} Abschnitte",
    "glanceKicker": "Auf einen Blick",
    "glanceNote": "Nachfolgend finden Sie eine Zusammenfassung des vollständigen Textes.",
    "anchorLabel": "Link zu „{title}“ kopieren",
    "copyEmail": "Kopieren Sie {email}",
    "contactSupport": "Kontaktieren Sie den Support",
    "nextLabel": "Nächstes Dokument"
  },
  "terms": {
    "navLabel": "Bedingungen",
    "seoTitle": "Nutzungsbedingungen | MapsGrab",
    "seoDescription": "Die Nutzungsbedingungen von MapsGrab: akzeptable Nutzung, Verantwortung des Benutzers für gesammelte Daten, Einkäufe, Haftungsausschluss und wie Sie uns kontaktieren können.",
    "title": "Nutzungsbedingungen",
    "intro": "Diese Bedingungen regeln Ihre Nutzung von MapsGrab: der Browsererweiterung, dieser Website und den kostenlosen Webtools. Bitte lesen Sie diese, bevor Sie den Dienst nutzen.",
    "updatedLabel": "Zuletzt aktualisiert",
    "updatedAt": "August 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Akzeptable Nutzung, Verantwortung des Benutzers für gesammelte Daten, Käufe, Haftungsausschluss und wie Sie uns kontaktieren können.",
    "helpTitle": "Fragen zu diesen Bedingungen?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Nur öffentliche Daten",
        "text": "Der Dienst funktioniert nur mit Informationen, die auf den von Ihnen besuchten Seiten öffentlich angezeigt werden."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Ihr Einsatz, Ihre Verantwortung",
        "text": "Sie entscheiden, was Sie sammeln und wie Sie es verwenden – im Rahmen der für Sie geltenden Gesetze."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Zum Starten ist kein Konto erforderlich",
        "text": "Die Erweiterung funktioniert ohne Konto im Rahmen eines kostenlosen monatlichen Kontingents."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Jederzeit kündbar",
        "text": "Abonnements verlängern sich bis zur Kündigung; Eine Stornierung stoppt zukünftige Verlängerungen."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Akzeptanz der Bedingungen",
        "paragraphs": [
          "Durch den Zugriff auf oder die Nutzung von MapsGrab stimmen Sie diesen Bedingungen zu. Wenn Sie damit nicht einverstanden sind, installieren Sie die Erweiterung nicht und nutzen Sie die Website und Tools nicht."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Was der Dienst leistet",
        "paragraphs": [
          "MapsGrab hilft Ihnen, Informationen zu sammeln, die auf Google Maps von Ihnen besuchten Seiten öffentlich angezeigt werden – Geschäftsdetails, Bewertungen, Fotos und zugehörige Kontaktinformationen – und diese zu exportieren. Der Dienst besteht aus einer Browsererweiterung für Microsoft Edge und Firefox, dieser Website und kostenlosen Webtools, die in Ihrem Browser ausgeführt werden."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Öffentlich verfügbare Daten",
        "paragraphs": [
          "Der Dienst ist so konzipiert, dass er nur mit Informationen funktioniert, die auf den von Ihnen durchsuchten Seiten öffentlich angezeigt werden. Es greift nicht auf private Konten, geschützte Inhalte oder Daten zu, die einen besonderen Zugriff erfordern, der über den für jeden Besucher sichtbaren Bereich hinausgeht."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Ihre Verantwortung",
        "paragraphs": [
          "Sie entscheiden, was Sie sammeln und wie Sie es verwenden, und Sie sind für diese Verwendung verantwortlich. Halten Sie sich bei der Nutzung erfasster Daten an die für Sie und Ihren Zweck geltenden Gesetze.",
          "Insbesondere erklären Sie sich damit einverstanden, Folgendes nicht zu tun:"
        ],
        "items": [
          "Nutzen Sie den Dienst für rechtswidrige Aktivitäten oder unter Verletzung von Rechten Dritter.",
          "Identifizieren Sie Einzelpersonen erneut oder erstellen Sie Profile von Privatpersonen aus gesammelten Geschäftsdaten.",
          "Verwenden Sie die gesammelten Kontaktdaten für Spam oder unerwünschte Massennachrichten.",
          "Verkaufen Sie gesammelte Rohdaten als konkurrierendes Datenprodukt ohne gesonderte Vereinbarung mit uns.",
          "Den Dienst oder die Plattformen, mit denen er funktioniert, stören, überlasten oder versuchen, sie zu unterbrechen."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Konten und Quoten",
        "paragraphs": [
          "Die Erweiterung funktioniert ohne Konto im Rahmen eines kostenlosen monatlichen Kontingents. Für einige Funktionen – höhere Limits, Käufe, Cloud-Integrationen – ist ein Konto erforderlich. Sie sind dafür verantwortlich, die Anmeldedaten Ihres Kontos zu schützen und für alle Aktivitäten, die unter Ihrem Konto stattfinden."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Käufe und Abonnements",
        "paragraphs": [
          "Bezahlte Pläne werden auf der Seite „Preise“ beschrieben. Preise, Kontingente und Abrechnungszeiträume werden Ihnen vor dem Kauf angezeigt und die Kaufabwicklung erfolgt über die an der Kasse angebotenen Zahlungsanbieter. Abonnementpläne verlängern sich automatisch, bis sie gekündigt werden, und Sie können jederzeit kündigen; Eine Stornierung stoppt zukünftige Verlängerungen."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "Der Service wird so bereitgestellt, wie er ist",
        "paragraphs": [
          "Der Dienst wird „wie besehen“ und „wie verfügbar“ bereitgestellt. Plattformen ändern sich häufig und Sammlungsfunktionen funktionieren jederzeit teilweise oder vollständig nicht mehr. MapsGrab übernimmt keine Garantien, weder ausdrücklich noch stillschweigend, für die ununterbrochene Verfügbarkeit, Vollständigkeit der gesammelten Daten oder Eignung für einen bestimmten Zweck.",
          "Wir können jeden Teil des Dienstes ändern, aussetzen oder einstellen und diese Bedingungen aktualisieren. Wenn die Änderungen wesentlich sind, werden wir sie auf dieser Website bekannt geben. Die fortgesetzte Nutzung nach Inkrafttreten der Änderungen bedeutet, dass Sie die aktualisierten Bedingungen akzeptieren."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Haftungsbeschränkung",
        "paragraphs": [
          "Soweit gesetzlich zulässig, haften MapsGrab und seine Betreiber nicht für indirekte, zufällige, besondere oder Folgeschäden – einschließlich entgangener Gewinne oder Daten –, die sich aus Ihrer Nutzung oder Unmöglichkeit der Nutzung des Dienstes ergeben."
        ]
      },
      {
        "id": "contact",
        "title": "Kontakt",
        "paragraphs": [
          "Fragen zu diesen Bedingungen können an support@mapsgrab.com gesendet werden."
        ]
      }
    ],
    "coverage": {
      "label": "Deckungsvermerk",
      "badge": "Noch offen",
      "lead": "Noch nicht abgedeckt:",
      "text": "der Online Scraper (Cloud Runs), der Scraper / Reviews / Fotos API und der MCP Server. Der obige Text beschreibt die Erweiterung, diese Website und die kostenlosen Webtools."
    }
  },
  "privacy": {
    "navLabel": "Privatsphäre",
    "seoTitle": "Datenschutzrichtlinie | MapsGrab",
    "seoDescription": "Die MapsGrab-Datenschutzrichtlinie: Welche Daten die Erweiterung und die Website verarbeiten, wo sie gespeichert werden, wofür unser Backend verwendet wird und welche Grenzen wir einhalten.",
    "title": "Datenschutzrichtlinie",
    "intro": "Diese Richtlinie erläutert, welche Daten MapsGrab verarbeitet, wo sie gespeichert werden und was unsere Server erreicht. Die Kurzversion: Die Erweiterung arbeitet mit öffentlich angezeigten Daten und speichert die Ergebnisse in Ihrem Browser; Abgesehen von unseren Cloud-Diensten ermöglicht unser Backend nur die Konfiguration, Kontingente, optionale Anreicherung und minimale Nutzungsprotokolle. und wir schalten in der Erweiterung keine Werbung und keine Tracker von Drittanbietern. Anfragen an unsere Cloud-Dienste – den Online Scraper-, den API- und den MCP-Server – werden auf unseren Servern verarbeitet und die Online Scraper-Ergebnisse werden mit Ihrem Konto verknüpft, sodass Sie sie herunterladen können.",
    "updatedLabel": "Zuletzt aktualisiert",
    "updatedAt": "Oktober 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Welche Daten die Erweiterung und die Website verarbeiten, wo sie gespeichert werden, wofür unser Backend verwendet wird und welche Grenzen wir einhalten.",
    "helpTitle": "Fragen zu dieser Richtlinie?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Wo Ergebnisse gespeichert werden",
        "text": "Die Erweiterung und die kostenlosen Webtools behalten Ihre Daten in Ihrem Browser; Online-Scraper-Ergebnisse sind mit Ihrem Konto verknüpft."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Was unsere Server erreicht",
        "text": "Anfragen an den Online Scraper, die Server API und MCP sowie Konfiguration, Konto und Kontingente, optionale Anreicherung und minimale Nutzungsprotokolle."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Keine Werbung, keine Tracker",
        "text": "Keine Tracker von Drittanbietern in der Erweiterung und kein Verkauf oder Vermietung personenbezogener Daten."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Datenentfernung",
        "text": "Durch das Entfernen der Erweiterung werden lokale Daten gelöscht. Senden Sie uns eine E-Mail, um Backend-Kontodaten zu löschen."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Daten der Erweiterungsprozesse",
        "paragraphs": [
          "Die Erweiterung verarbeitet die folgenden Datenkategorien:"
        ],
        "items": [
          "Öffentliche Geschäftsdaten – Informationen, die auf den von Ihnen besuchten Google Maps Seiten angezeigt werden (Name, Adresse, Telefonnummer, Website, Bewertung, Rezensionen, Fotos usw.), während Sie die Extraktionsfunktionen verwenden.",
          "Ihre Einstellungen – von Ihnen konfigurierte Präferenzen (Exportformat, Feldauswahl, Automatisierungsschalter, Schnittstellensprache).",
          "Technische und Interaktionsdaten – minimale Nutzungsereignisse (Funktionsnutzungszähler, Fehlermeldungen), die verwendet werden, um die Funktion der Erweiterung bei Google Seitenänderungen aufrechtzuerhalten.",
          "Von uns vergebene Kontokennungen – eine anonyme Gerätekennung und, wenn Sie sich anmelden, die E-Mail-Adresse Ihres Kontos sowie den Plan- oder Kontingentstatus."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Wo Daten gespeichert werden",
        "paragraphs": [
          "Mit der Erweiterung werden Einstellungen, Extraktionsergebnisse und Batch-Task-Status lokal in Ihrem Browser gespeichert (Erweiterung Local Storage und IndexedDB). Sie verlassen niemals Ihr Gerät, es sei denn, Sie lösen einen Export oder eine der unten beschriebenen optionalen Integrationen aus. Die kostenlosen Webtools verarbeiten auch Ihre Eingaben in Ihrem Browser.",
          "Die Token Google Drive und HubSpot OAuth werden, wenn Sie sie verbinden, ebenfalls nur in Ihrem Browser gespeichert.",
          "Online-Scraper-Aufgaben laufen auf unseren Servern. Ihre Ergebnisse werden in Ihrem Konto gespeichert, sodass Sie sie von Ihrem Dashboard herunterladen können."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Was unser Backend verarbeitet",
        "paragraphs": [
          "Anfragen, die Sie an unsere Cloud-Dienste – den Online Scraper, den API- und den MCP-Server – stellen, werden auf unseren Servern verarbeitet. Unsere Server verwalten auch den Zugriff auf diese Dienste, einschließlich Ihres API-Schlüssels und der von Ihnen genehmigten MCP-Client-Autorisierungen, und führen Aufzeichnungen über Ihre Nutzung.",
          "Ein MCP-Client, den Sie autorisieren, erhält die Ergebnisse der von ihm gestellten Anfragen. Sie können eine Autorisierung über Ihr Dashboard widerrufen.",
          "Abgesehen von diesen Cloud-Diensten kontaktieren die Erweiterung und diese Website unsere eigenen Server für vier Zwecke:"
        ],
        "items": [
          "Remote-Konfiguration – Voreinstellungen für die Seitenstruktur, die dafür sorgen, dass die Extraktion funktioniert, wenn Google seine Seiten ändert.",
          "Konto- und Kontingentdienste – Anmeldung, Planstatus und monatliche Nutzungsabrechnung.",
          "E-Mail- und Social-Media-Anreicherung – Suche nach öffentlich aufgeführten Kontaktdaten auf gesammelten Unternehmenswebsites, wenn die Funktion verwendet wird.",
          "Nutzungsprotokollierung – minimale Aufzeichnungen der Funktionsnutzung und Fehler, die zur Wartung und Verbesserung des Dienstes verwendet werden."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Optionale Integrationen Google Drive und HubSpot",
        "paragraphs": [
          "Nur wenn Sie sie in den Einstellungen explizit verknüpfen, werden exportierte Daten in Ihr eigenes Google Drive hochgeladen oder mit Ihrem eigenen HubSpot-Konto synchronisiert. Diese Integrationen nutzen Ihre Autorisierung, handeln in Ihrem Namen und können jederzeit über die Erweiterungseinstellungen oder über Ihr Google / HubSpot-Konto widerrufen werden."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Website-Analyse",
        "paragraphs": [
          "Diese Website verwendet Google Analytics 4 (GA4), um die aggregierte Seitennutzung zu messen. GA4 ist die einzige Analyse von Drittanbietern, die wir verwenden, und sie läuft nur auf dieser Website – die Erweiterung selbst enthält keine Analysen."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "Was wir nie tun",
        "paragraphs": [
          "Diese Grenzen gelten für die Erweiterung und die Website:"
        ],
        "items": [
          "Keine Werbung.",
          "Keine Tracker von Drittanbietern in der Erweiterung.",
          "Kein Verkauf oder Vermietung personenbezogener Daten.",
          "Keine Sammlung Ihres Browserverlaufs über die Google Maps Seiten hinaus, aus denen Sie extrahieren."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Datenentfernung",
        "paragraphs": [
          "Durch das Entfernen der Erweiterung werden alle lokal gespeicherten Daten gelöscht. Wenn Sie möchten, dass Ihre Back-End-Kontodaten gelöscht werden, kontaktieren Sie uns unter support@mapsgrab.com und wir werden sie entfernen."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Änderungen an dieser Richtlinie",
        "paragraphs": [
          "Wir aktualisieren diese Richtlinie, wenn sich der Service ändert. Das oben angegebene Datum spiegelt die letzte Überarbeitung wider. Wesentliche Änderungen werden auf dieser Website bekannt gegeben."
        ]
      },
      {
        "id": "contact",
        "title": "Kontakt",
        "paragraphs": [
          "Fragen oder Wünsche zum Datenschutz können an support@mapsgrab.com gesendet werden."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Autorisieren Sie eine KI-App | MapsGrab",
  "title": "Verbinden Sie eine KI-App mit Ihrem Konto",
  "intro": "Eine App bittet um Zugriff auf Ihr MapsGrab-Konto. Erlauben Sie es nur, wenn Sie diese Verbindung selbst hergestellt haben.",
  "loading": "Verbindungsanfrage wird geladen...",
  "hostLabel": "App-Adresse",
  "selfDeclared": "Name, den sich die App gibt: {name}",
  "loopbackTitle": "Lokale App",
  "loopbackText": "Diese App läuft auf einem Computer, daher kann ihre Adresse nicht zeigen, wer sie erstellt hat. Erlauben Sie es nur, wenn Sie diese Verbindung gerade über eine vertrauenswürdige App gestartet haben.",
  "loopbackHost": "Dieser Computer",
  "accountLabel": "Angemeldet als",
  "switchAccount": "Konto wechseln",
  "permissionsTitle": "Wenn Sie es zulassen, kann diese App",
  "permissions": [
    "Suchen Sie nach Unternehmen und lesen Sie deren Bewertungen und öffentliche Fotos auf Google Maps.",
    "Nutzen Sie das monatliche Anforderungskontingent Ihres API-Plans."
  ],
  "revokeNote": "Sie können die Verbindung jederzeit unter „Verbundene Apps“ in der API-Verwaltung trennen.",
  "approve": "Erlauben",
  "deny": "Ablehnen und zurück zu {host}",
  "denyLoopback": "Ablehnen und zur App zurückkehren",
  "redirecting": "Zurück zur App...",
  "invalidTitle": "Diese Verbindungsanfrage ist ungültig oder abgelaufen",
  "invalidText": "Gehen Sie zurück zu Ihrer AI-App und beginnen Sie erneut mit der Verbindung.",
  "errorTitle": "Diese Verbindungsanfrage kann nicht abgeschlossen werden",
  "errorReasons": {
    "rate_limited": "Von Ihrem Netzwerk kamen zu viele Verbindungsversuche. Warten Sie einige Minuten, bevor Sie es erneut versuchen.",
    "invalid_client": "Die App ist nicht registriert oder ihre Registrierung ist unvollständig.",
    "invalid_redirect_uri": "Die von der App gesendete Absenderadresse stimmt nicht mit der registrierten überein.",
    "unsupported_response_type": "Die App hat nach einem Autorisierungstyp gefragt, der nicht unterstützt wird.",
    "invalid_pkce": "Die App hat die erforderliche Sicherheitsüberprüfung (PKCE mit S256) nicht gesendet.",
    "invalid_resource": "Die App hat nicht nach Zugriff auf den Server MapsGrab MCP oder nach einem anderen Server gefragt.",
    "server_error": "MapsGrab konnte diese Anfrage derzeit nicht speichern. Bitte versuchen Sie es in Kürze noch einmal."
  },
  "errorHint": "Starten Sie die Verbindung erneut über Ihre AI-App. Wenn das Problem weiterhin besteht, wenden Sie sich an den Entwickler der App.",
  "signInTitle": "Melden Sie sich an, um fortzufahren",
  "signInText": "Melden Sie sich bei dem MapsGrab-Konto an, das Sie verbinden möchten. Diese Anfrage wartet auf Sie.",
  "signIn": "anmelden",
  "loadFailed": "Die Verbindungsanfrage konnte nicht geladen werden. Überprüfen Sie Ihr Netzwerk und versuchen Sie es erneut.",
  "decideFailed": "Diese Aktion konnte nicht abgeschlossen werden. Überprüfen Sie Ihr Netzwerk und versuchen Sie es erneut.",
  "retry": "Versuchen Sie es erneut"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Zahlung eingereicht",
      "description": "Wir bestätigen Ihre Zahlung. Die ursprüngliche Registerkarte wird automatisch aktualisiert."
    },
    "confirmedCredits": {
      "title": "Guthaben hinzugefügt",
      "description": "Ihre ClinkBill-Zahlung wurde bestätigt und die Credits wurden hinzugefügt. Sie können zur ursprünglichen Registerkarte zurückkehren."
    },
    "confirmedSubscription": {
      "title": "Plan aktiviert",
      "description": "Ihre ClinkBill-Zahlung wurde bestätigt und Ihr MapsGrab-Plan ist aktiv. Sie können zur ursprünglichen Registerkarte zurückkehren."
    },
    "failed": {
      "title": "Die Bezahlung braucht Aufmerksamkeit",
      "description": "Wir konnten diese Bestellung nicht bestätigen. Kehren Sie zur ursprünglichen Registerkarte zurück und versuchen Sie es erneut."
    }
  },
  "cancel": {
    "title": "Zahlung storniert",
    "description": "Es wurde keine Zahlung abgeschlossen. Sie können zurücksenden und eine andere Zahlungsmethode wählen."
  }
}
