import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab è un toolkit per i dati delle mappe: acquisisci informazioni aziendali disponibili al pubblico da mappe, link di revisione, ID di luoghi e altro ancora con un'estensione del browser e strumenti web.",
    "keywords": "dati delle mappe, estrattore di Google Maps, ricerca ID luogo, generatore di link di revisione, strumenti per le mappe"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Navigazione primaria",
      "mobileLabel": "Navigazione mobile",
      "extension": "Estensione",
      "online": "Online",
      "api": "API",
      "apiScraper": "API di estrazione",
      "apiReviews": "API delle recensioni",
      "apiPhotos": "API delle foto",
      "apiMcp": "MCP di estrazione",
      "apiScraperDesc": "Dati aziendali per qualsiasi parola chiave e località, ad esempio JSON.",
      "apiReviewsDesc": "Discussioni di revisione complete con valutazioni e risposte del proprietario.",
      "apiPhotosDesc": "Gallerie fotografiche pubbliche come elenchi URL pronti all'uso.",
      "apiMcpDesc": "Dati delle mappe in tempo reale per Claude Code, Cursor e VS Code.",
      "apiFootNote": "API e MCP condividono una quota di richieste mensili.",
      "apiPricing": "API prezzi",
      "pricing": "Prezzi",
      "freeTools": "Strumenti gratuiti",
      "signIn": "Registrazione",
      "dashboard": "Pannello"
    },
    "footer": {
      "legalLabel": "Legale",
      "resources": "Strumenti gratuiti",
      "product": "Prodotto",
      "rights": "© 2026 MapsGrab. Tutti i diritti riservati.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Trova",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Recensione Generatore di collegamenti",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Controllo e-mail",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Convertitore da Lat Long a DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS al convertitore decimale",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Generatore di parole chiave in blocco",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Unisci CSV file online",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Installa ora",
    "comingSoon": "Prossimamente",
    "themeLabel": "Tema del colore",
    "themeLight": "Leggero",
    "themeDark": "Buio",
    "themeSystem": "Sistema",
    "faqLabel": "Domande frequenti",
    "breadcrumbLabel": "Pangrattato",
    "languageSwitcherLabel": "Commutatore di lingua",
    "mobileMenuLabel": "Cambia menu",
    "copied": "Copiato negli appunti",
    "cancel": "Cancellare",
    "continue": "Continuare"
  },
  "dashboard": {
    "create": {
      "title": "Estrattore online",
      "newTask": "Nuova attività",
      "modeLabel": "Modalità di ricerca",
      "modes": {
        "keywords": "Parole chiave",
        "map": "Mappa",
        "regions": "Regioni"
      },
      "keywords": "Parole chiave",
      "regionsCta": "Crea query per regione",
      "placeholder": "caffetteria a Portland\nristorante ad Austin",
      "count": "{count} / {limit} parole chiave",
      "duplicates": "Righe duplicate ignorate: {count}",
      "contacts": "Trova e-mail e profili social",
      "contactsPaid": "Disponibile con un piano online a pagamento.",
      "usage": "{used} / {total} record questo mese",
      "reset": "La quota mensile si azzera il 1° del mese (ora di New York).",
      "loading": "Caricamento dei tuoi limiti...",
      "optionsFailed": "Impossibile caricare i limiti delle attività. Per favore riprova.",
      "submit": "Avvia estrazione",
      "submitting": "Invio...",
      "submitted": "Attività inviata",
      "failed": "Invio dell'attività non riuscito. Aggiorna la cronologia prima di riprovare.",
      "exhausted": "La tua quota mensile è esaurita.",
      "invalid": "Inserisci fino a {limit} parole chiave, ciascuna non più lunga di 500 caratteri.",
      "map": {
        "invalidKeyword": "Inserisci una parola chiave di massimo 500 caratteri.",
        "keyword": "Parola chiave",
        "keywordPlaceholder": "ad es. bar",
        "locationSearch": "Cerca località",
        "locate": "Localizza per regione",
        "locationPlaceholder": "Seleziona paese / regione / città",
        "coordinates": "Inserisci coordinate",
        "latitude": "Latitudine",
        "longitude": "Longitudine",
        "radius": "Raggio (km)",
        "spacing": "Spaziatura della griglia (km)",
        "sampleCount": "{count} / {limit} cerca posizioni",
        "points": "Punti della griglia: {points}",
        "overLimit": "Riduci il raggio o aumenta la spaziatura della griglia per rimanere entro {limit} posizioni di ricerca.",
        "chooseCenter": "Scegli una regione o fai clic sulla mappa per impostare il centro.",
        "mapLabel": "Scegli un centro di ricerca sulla mappa",
        "tilesUnavailable": "Impossibile caricare i riquadri della mappa. Puoi ancora inserire le coordinate.",
        "attribution": "contributori di OpenStreetMap"
      },
      "region": {
        "baseKeywords": "Parole chiave di base",
        "basePlaceholder": "caffetteria\nristorante",
        "country": "Paese",
        "state": "Stato o regione",
        "citySearch": "Trova una città",
        "cityPlaceholder": "Facoltativo: scegli le città",
        "city": "Città",
        "selectCountry": "Seleziona un paese",
        "allStates": "Tutti gli stati o regioni",
        "loading": "Caricamento posizioni...",
        "loadFailed": "Impossibile caricare le posizioni. Per favore riprova.",
        "retry": "Riprova",
        "filter": "Filtra",
        "selectAll": "Seleziona tutto ({count})",
        "clear": "Deseleziona tutto",
        "selectedCount": "{count} selezionati",
        "more": "Mostrati {shown} di {total}. Continua a digitare per restringere.",
        "selectedRegions": "Località selezionate",
        "remove": "Rimuovi {name}",
        "noMatch": "Nessun risultato",
        "matchMode": "Cerca frase",
        "inMode": "In",
        "nearMode": "Vicino",
        "generate": "Genera query",
        "needBase": "Inserisci prima le parole chiave di base.",
        "needCountry": "Seleziona prima un paese.",
        "willGenerate": "Verranno create {count} query.",
        "finalQueries": "Domande finali",
        "finalPlaceholder": "Le query generate vengono visualizzate qui. Puoi modificarli.",
        "attribution": "Dati sulla posizione: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Cruscotto | MapsGrab",
      "description": "Gestisci le tue esportazioni MapsGrab, gli accessi API e gli abbonamenti in un unico spazio di lavoro."
    },
    "shell": {
      "skipToContent": "Vai al contenuto",
      "sideLabel": "Area di lavoro",
      "homeLabel": "Home di MapsGrab",
      "navLabel": "Menu dell'area di lavoro",
      "loading": "Caricamento dell'area di lavoro...",
      "retry": "Riprova",
      "navOnline": "Estrattore online",
      "navJobHistory": "Cronologia",
      "navApi": "Gestione API",
      "navSubscriptions": "Abbonamenti",
      "openMenu": "Apri il menu dell'area di lavoro",
      "closeMenu": "Chiudi il menu dell'area di lavoro",
      "collapseSidebar": "Comprimi barra laterale",
      "expandSidebar": "Espandi barra laterale",
      "back": "Indietro"
    },
    "account": {
      "menuButtonLabel": "Apri il menu dell'account",
      "menuLabel": "Menù conto",
      "logout": "Esci",
      "upgrade": "Aggiorna piano",
      "usageShort": "{used} / {total} record",
      "planUnavailable": "Non disponibile",
      "theme": "Tema",
      "themeLight": "Chiaro",
      "themeDark": "Scuro",
      "themeSystem": "Sistema",
      "language": "Lingua"
    },
    "history": {
      "title": "Cronologia delle esportazioni online",
      "description": "Attività eseguite su Estrattore online, prima le più recenti. Gli orari sono mostrati nell'ora di New York (New York).",
      "refresh": "Aggiorna",
      "autoRefresh": "Aggiornamento automatico attivo",
      "loading": "Caricamento delle esportazioni...",
      "loadFailed": "Impossibile caricare la cronologia delle esportazioni.",
      "refreshFailed": "Impossibile aggiornare. Vengono mostrati gli ultimi risultati caricati.",
      "retry": "Riprova",
      "emptyTitle": "Nessuna esportazione ancora",
      "emptyHint": "Esegui un'attività su Estrattore online e verrà visualizzata qui.",
      "emptyCta": "Vai a Estrattore online",
      "recentTitle": "Attività recenti",
      "viewAll": "Vedi tutte",
      "recentEmptyHint": "Le attività avviate qui sopra compariranno qui.",
      "noMatchTitle": "Nessuna attività corrispondente",
      "noMatchHint": "Prova un altro numero attività o parola chiave, oppure cancella i filtri.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "e altre {count}",
      "columns": {
        "taskNo": "Attività",
        "createdAt": "Creato (ET)",
        "samples": "Ricerche",
        "records": "Record",
        "status": "Stato"
      },
      "status": {
        "queued": "In coda",
        "collecting": "Collezionare",
        "publishing": "Preparazione CSV",
        "completed": "Completato",
        "partial": "Successo parziale",
        "failed": "Fallito"
      },
      "timezone": "ET",
      "search": {
        "label": "Cerca attività",
        "placeholder": "Cerca per numero attività o parola chiave",
        "clear": "Cancella ricerca"
      },
      "filters": {
        "label": "Filtra attività",
        "button": "Filtri",
        "status": "Stato",
        "all": "Tutte",
        "running": "In corso",
        "clear": "Cancella filtri"
      },
      "range": {
        "label": "Periodo",
        "last7": "Ultimi 7 giorni",
        "last30": "Ultimi 30 giorni",
        "all": "Sempre",
        "custom": "Periodo personalizzato",
        "from": "Dal",
        "to": "Al",
        "apply": "Applica",
        "invalid": "Scegli una data di inizio uguale o precedente alla data di fine.",
        "hint": "Le date usano l'ora della costa orientale (New York)."
      },
      "pagination": {
        "label": "Paginazione",
        "previous": "Precedente",
        "next": "Prossimo",
        "page": "Pagina {page}",
        "pageSize": "Righe per pagina",
        "summary": "{from}–{to} di {total}"
      },
      "detail": {
        "show": "Dettagli",
        "loading": "Caricamento ricerche...",
        "loadFailed": "Impossibile caricare le ricerche per questa attività.",
        "keyword": "Parola chiave",
        "records": "Record",
        "runNo": "Correre",
        "startedAt": "Iniziato (ET)",
        "finishedAt": "Finito (ET)",
        "contacts": "Email e profili social",
        "contactsEnabled": "Abilitato per questa attività",
        "contactsDisabled": "Fuori per questo compito",
        "completed": "Completato",
        "pending": "In attesa di",
        "viewport": "{lat}, {lng} · zoom {zoom}"
      },
      "copyJob": "Copia numero attività",
      "dedupeHint": "I record vengono contati dopo aver rimosso i duplicati dell'intera attività.",
      "finished": "Attività {job}: {status}",
      "finishedRecords": "{count} record",
      "downloadCsv": "Scarica CSV",
      "noFile": "No CSV",
      "errors": {
        "31301": "Impossibile raccogliere questa ricerca.",
        "31302": "Alcuni risultati non sono disponibili. Le righe consegnate vengono conservate.",
        "31303": "Il collezionista è occupato. Riprova.",
        "31304": "Impossibile pubblicare questa esportazione."
      },
      "errorFailed": "Impossibile completare questa ricerca.",
      "downloading": "Preparazione...",
      "downloadUnavailable": "Non scaricabile CSV. Il file potrebbe essere scaduto.",
      "downloadFailed": "Impossibile avviare il download. Per favore riprova.",
      "signInPrompt": "Accedi per visualizzare la cronologia delle esportazioni online.",
      "signInCta": "Accedi",
      "unreachable": "Impossibile raggiungere MapsGrab in questo momento."
    },
    "api": {
      "description": "Gestisci la tua chiave API, il limite di richiesta mensile e le app AI connesse.",
      "docsLink": "Visualizza API prodotti",
      "signInPrompt": "Accedi per gestire il tuo accesso API.",
      "loading": "Caricamento del tuo accesso API...",
      "loadFailed": "Impossibile caricare il tuo accesso API. Per favore riprova.",
      "retry": "Riprova",
      "refresh": "Aggiorna",
      "keyTitle": "Chiave API",
      "keyEmpty": "Non hai ancora generato una chiave API.",
      "generateKey": "Genera la chiave API",
      "rotateKey": "Sostituisci la chiave API",
      "generatingKey": "Generazione...",
      "keyOnce": "Copia questa chiave adesso. Non sarai in grado di visualizzarlo di nuovo dopo aver lasciato o aggiornato questa pagina.",
      "keyCreated": "Creato",
      "rotateTitle": "Sostituisci la tua chiave API?",
      "rotateMessage": "La tua chiave attuale smetterà di funzionare immediatamente. Aggiorna tutte le app che lo utilizzano con la nuova chiave.",
      "cancel": "Cancellare",
      "copyKey": "Copia la chiave API",
      "copied": "Copiato",
      "copyFailed": "Impossibile copiare. Seleziona il testo e copialo manualmente.",
      "keyFailed": "Impossibile generare una chiave API. Per favore riprova.",
      "usageTitle": "Utilizzo mensile di API",
      "usageFailed": "Impossibile caricare l'utilizzo dell'API. Riprova.",
      "usageValue": "{used} / {total} richieste",
      "usagePeriod": "Periodo: {period}",
      "quotaExhausted": "La tua indennità di richiesta mensile è esaurita.",
      "quotaReset": "Si azzera il 1° (ET) · condiviso tra API e MCP",
      "planTitle": "Piano API",
      "managePlan": "Gestisci gli abbonamenti",
      "connectionsTitle": "Indirizzi di connessione",
      "apiUrl": "API base URL",
      "mcpUrl": "MCPserver URL",
      "mcpHint": "Aggiungi questo URL nel tuo client MCP. Accedi e approva la connessione quando si apre questo sito Web.",
      "mcpUnavailable": "L'indirizzo di connessione MCP non è ancora disponibile.",
      "copyUrl": "Copia URL",
      "curlTitle": "Avvio rapido",
      "curlHint": "Sostituisci il segnaposto con la tua chiave API completa.",
      "grants": {
        "title": "App connesse",
        "description": "App a cui hai consentito di cercare attività commerciali e leggere recensioni e foto pubbliche utilizzando la tua indennità di API.",
        "loading": "Caricamento delle app connesse...",
        "empty": "Nessuna app connessa.",
        "loadFailed": "Impossibile caricare le app connesse. Per favore riprova.",
        "selfDeclared": "Nome che l'app si dà: {name}",
        "createdLabel": "Connesso (ET)",
        "refreshedLabel": "Ultimo aggiornamento (ET)",
        "notRefreshed": "Non ancora",
        "revoke": "Disconnetti",
        "revokeTitle": "Disconnettere questa app?",
        "revokeMessage": "{host} perderà immediatamente l'accesso e avrà bisogno della tua approvazione per connettersi nuovamente.",
        "revokeFailed": "Impossibile disconnettere questa app. Per favore riprova.",
        "paginationLabel": "Pagine delle app connesse",
        "pageOf": "Pagina {page} di {pages}"
      }
    },
    "subscriptions": {
      "title": "Abbonamenti",
      "description": "Piani e stato di rinnovo per Estrattore online, estensione del browser e API. Acquista o aggiorna nella pagina dei prezzi.",
      "lines": {
        "online": "Estrattore online",
        "extension": "Estensione del browser",
        "api": "API"
      },
      "planLabel": "Piano",
      "expiresLabel": "Rinnova/scade",
      "free": "Gratuito",
      "unavailable": "Temporaneamente non disponibile",
      "autoRenewOn": "Rinnovo automatico attivo",
      "autoRenewOff": "Rinnovo automatico disattivato",
      "paidVia": "Pagato con {method}",
      "subscribeCta": "Scegli un piano",
      "pricingLink": "Vedi i prezzi",
      "manageSubscription": "Gestisci l'abbonamento",
      "managingSubscription": "Apertura...",
      "manageFailed": "Impossibile aprire la gestione dell'abbonamento. Riprova.",
      "signInPrompt": "Accedi per vedere le tue iscrizioni."
    },
    "cancelGuide": {
      "title": "Gestisci il tuo abbonamento presso il fornitore di servizi di pagamento",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Accedi a PayPal e apri Impostazioni.",
            "Vai su Pagamenti, quindi Pagamenti automatici.",
            "Seleziona MapsGrab e scegli Annulla."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Apri il collegamento Portale Clienti dall'e-mail di acquisto.",
            "Accedi e seleziona il tuo abbonamento MapsGrab.",
            "Scegli Annulla."
          ]
        }
      ],
      "closeLabel": "Vicino"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Cattura i dati aziendali Google Maps in CSV e JSON",
        "description": "MapsGrab è un'estensione del browser e un toolkit Web che raccoglie informazioni aziendali disponibili pubblicamente da Google Maps (nomi, telefoni, recensioni, foto, e-mail) e le esporta in CSV o JSON."
      },
      "hero": {
        "announce": {
          "badge": "Nuovo",
          "text": "MCP server per agenti AI"
        },
        "title": {
          "firstLine": "Estrai dati da Google Maps",
          "secondLine": "con",
          "accent": "un clic",
          "end": "."
        },
        "lead": "Raccogli dati aziendali pubblici da Google Maps (nomi, numeri di telefono, siti Web, recensioni, foto ed e-mail) ed esporta CSV o JSON puliti in pochi secondi.",
        "search": {
          "label": "Parola chiave di ricerca",
          "typing": [
            "caffetteria a Portland",
            "dentista ad Austin, Texas",
            "idraulico vicino a Chicago",
            "studio di yoga a Brooklyn",
            "alberghi a Miami Beach"
          ],
          "submit": "Anteprima dei risultati",
          "loading": "Ricerca…",
          "suggestLabel": "Tentativo",
          "suggestions": [
            "caffetteria a Portland",
            "dentista ad Austin, Texas",
            "idraulico vicino a Chicago"
          ]
        },
        "trust": [
          "Nessuna carta di credito richiesta",
          "{records} record gratuiti al mese",
          "CSV & JSON esporta"
        ],
        "dashboard": "Apri il estrattore online",
        "theater": {
          "panelLabel": "MapsGrab anteprima del pannello",
          "extensionActive": "Interno MapsGrab attivo",
          "mapFilters": [
            "Apri ora",
            "I più votati",
            "Prezzo"
          ],
          "live": "Vivere",
          "done": "Fatto",
          "start": "Avvia estrazione",
          "pause": "Pausa",
          "extracting": "Estrazione {count}…",
          "finished": "Fatto · {count} posti",
          "kpis": {
            "phones": "telefoni",
            "emails": "e-mail",
            "websites": "siti web"
          },
          "export": "Elenco dettagliato esportazione - {count} (.CSV)",
          "exportSaved": "Esportazione salvata",
          "emailFound": "E-mail trovata",
          "averageRating": "Voto medio",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} recensioni"
        },
        "preview": {
          "title": "Risultati",
          "count": "{count} aziende nella prima pagina dei risultati",
          "columns": {
            "name": "Nome",
            "address": "Indirizzo",
            "category": "Categoria",
            "rating": "Valutazione",
            "reviews": "Recensioni",
            "phone": "Telefono"
          },
          "locked": "Accedi e invia le tue parole chiave in Estrattore online per raccogliere ed esportare risultati.",
          "signIn": "Accedi per avviare un'attività completa",
          "failed": "Impossibile caricare l'anteprima. Per favore riprova.",
          "empty": "Nessuna attività commerciale trovata nella prima pagina dei risultati."
        }
      },
      "facts": {
        "caption": "MapsGrab dai numeri",
        "items": [
          {
            "value": 36,
            "label": "colonne di dati per azienda"
          },
          {
            "value": 11,
            "label": "campi di revisione, risposte del proprietario incluse"
          },
          {
            "value": 6,
            "label": "social network abbinati per sito web"
          },
          {
            "value": "freeRecords",
            "label": "record gratuiti, ogni mese"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "modi per eseguirlo: Interno, Online, API — più MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Come funziona",
          "title": {
            "lead": "Da una ricerca sulla mappa a un foglio di calcolo ",
            "accent": " ",
            "tail": " in tre passaggi"
          },
          "lead": "Nessun codice e nessun copia-incolla. MapsGrab legge ciò che Google Maps già ti mostra e lo trasforma in righe strutturate."
        },
        "steps": [
          {
            "title": "Cerca Google Maps",
            "body": "Apri Google Maps e cerca qualsiasi tipo di attività e località, esattamente come faresti normalmente."
          },
          {
            "title": "Avvia estrazione",
            "body": "Fare clic su {action}. MapsGrab scorre i risultati, raccoglie le inserzioni e, quando abilitato, arricchisce i contatti.",
            "action": "Avvia estrazione"
          },
          {
            "title": "Esporta ovunque",
            "body": "Scarica CSV o JSON con le colonne che preferisci: recensioni e foto arrivano nei propri file, pronte per Excel o il tuo CRM."
          }
        ],
        "searchSample": "panetteria a Seattle",
        "columnsUnit": "colonne",
        "reviewsFile": "recensioni"
      },
      "products": {
        "head": {
          "kicker": "Prodotti",
          "title": {
            "lead": "Tre modi per ",
            "accent": " acquisire i dati di Maps ",
            "tail": "."
          },
          "lead": "Scegli l'estensione del browser, lo scraper online basato su cloud o API. L'estensione funziona all'interno del tuo browser; Estrattore online e API condividono un motore cloud."
        },
        "cards": {
          "extension": {
            "badge": "Estensione del browser",
            "title": "Prendi dati mentre navighi Google Maps",
            "body": "Estrai dati aziendali, recensioni e foto dalle pagine di Maps che apri, quindi esporta tutto localmente. Bordo, Firefox e Chromium.",
            "link": "Esplora l'estensione"
          },
          "online": {
            "badge": "Estrattore online",
            "title": "Corre la nuvola. Niente da installare.",
            "body": "Incolla le parole chiave, raccogli i dettagli aziendali nel cloud e scarica una colonna 37 CSV deduplicata per attività.",
            "link": "Esplora il estrattore online"
          },
          "api": {
            "badge": "API",
            "title": "Pulisci JSON oltre HTTP",
            "body": "Dati aziendali e recensioni per le tue applicazioni: una chiave API.",
            "link": "Esplora il API"
          },
          "mcp": {
            "badge": "MCPserver",
            "title": "Dati di Live Maps per i tuoi agenti IA",
            "body": "Cerca e recensisci come strumenti MCP per Claude Code, Cursor, VS Code e Codex.",
            "link": "Esplora il server MCP"
          }
        },
        "extracting": "Estrazione {count}…",
        "queue": {
          "rows": "{count} righe",
          "processing": "Elaborazione"
        },
        "chat": {
          "prompt": "Trova dentisti ad Austin valutati 4.5+ con un sito web",
          "answer": "Trovate {count} corrispondenze. I primi tre:"
        }
      },
      "fields": {
        "head": {
          "kicker": "I dati",
          "title": {
            "lead": "Colonne 36.  ",
            "accent": " Tutti ",
            "tail": " utili."
          },
          "lead": "L'estensione esporta uno schema dai risultati di ricerca e dalle pagine aziendali: dettagli di contatto, posizione, profilo, valutazioni e ogni identificatore necessario per abbinare i record in un secondo momento."
        },
        "filtersLabel": "Gruppi di campo",
        "all": "Tutto",
        "groups": {
          "contact": {
            "filter": "Contatto",
            "label": "Contatto"
          },
          "location": {
            "filter": "Posizione",
            "label": "Posizione"
          },
          "profile": {
            "filter": "Profilo",
            "label": "Profilo aziendale"
          },
          "reviews": {
            "filter": "Valutazioni",
            "label": "Valutazioni e recensioni"
          },
          "ids": {
            "filter": "ID e collegamenti",
            "label": "ID e collegamenti"
          }
        },
        "sampleLabel": "Valore del campione",
        "emptySample": "(vuoto)",
        "descriptions": {
          "Name": "Nome dell'azienda esattamente come mostrato nell'elenco.",
          "Description": "Breve descrizione dal profilo aziendale.",
          "Fulladdress": "Indirizzo completo e formattato.",
          "Street": "Linea stradale dell'indirizzo.",
          "Municipality": "Città o località.",
          "Categories": "Ogni categoria assegnata all'attività.",
          "About": "Attributi dalla scheda Informazioni.",
          "Plus Code": "Colonna riservata al codice di posizione aperto: per ora esportata vuota.",
          "Time Zone": "Fuso orario IANA della località.",
          "Price": "Livello di prezzo mostrato nell'elenco.",
          "Note": "Nota o evidenziazione del commerciante.",
          "Amenities": "Servizi e opzioni di servizio.",
          "Hotel Class": "Classe Star per gli elenchi degli alloggi.",
          "Phone": "Numero di telefono principale mostrato nell'elenco.",
          "Phones": "Tutti i numeri di telefono trovati per l'attività.",
          "Claimed": "Se il proprietario ha rivendicato il profilo.",
          "Owner": "Nome del proprietario sul profilo.",
          "Owner Id": "ID collaboratore dell'account proprietario.",
          "Owner Link": "Collegamento alla pagina del collaboratore del proprietario.",
          "Email": "Indirizzi email presenti sul sito web aziendale.",
          "Social Medias": "Profili social collegati dal sito.",
          "Review Count": "Numero totale di recensioni.",
          "Average Rating": "Valutazione media in stelle.",
          "Review URL": "Collegamento diretto al pannello delle recensioni.",
          "Google Maps URL": "Collegamento corto stabile costruito a partire da CID.",
          "Google Knowledge URL": "Link di ricerca del pannello informativo.",
          "Latitude": "Latitudine in gradi decimali.",
          "Longitude": "Longitudine in gradi decimali.",
          "Website": "Sito ufficiale dall'elenco.",
          "Domain": "Dominio registrabile del sito web.",
          "Opening Hours": "Orari settimanali, giorni di chiusura segnati.",
          "Featured Image": "Foto di copertina URL dell'inserzione.",
          "Cid": "ID cliente: la forma decimale di FID.",
          "Fid": "ID caratteristica composto da due metà esadecimali.",
          "Place Id": "Stabile Google Place ID.",
          "Kgmid": "ID macchina del Knowledge Graph."
        },
        "reviews": {
          "title": "+ 11 colonne di recensioni",
          "body": "Esportato separatamente, impaginato fino al limite del tuo piano."
        },
        "photos": {
          "title": "+ elenchi di foto URL",
          "body": "Foto dell'album pubblico URLs per azienda, Street View filtrata."
        },
        "sampleCsv": "Scarica l'esempio CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Arricchimento",
          "title": {
            "lead": "Da un pin a una persona puoi ",
            "accent": " inviare un'e-mail a ",
            "tail": ""
          },
          "lead": "Quando l'arricchimento è attivo, MapsGrab controlla il sito web ufficiale di ciascuna azienda e compila i canali di contatto diretto durante l'estrazione."
        },
        "points": [
          "Indirizzi email presenti sul sito web aziendale",
          "Profili social: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Attivo per impostazione predefinita sui piani online a pagamento, un'impostazione nell'estensione",
          "Incluso nelle risposte di ricerca API con un flag: nessun passaggio di arricchimento separato"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Per gli sviluppatori",
          "title": {
            "lead": "Collega i dati di Maps a ",
            "accent": " qualsiasi cosa ",
            "tail": " costruisci"
          },
          "lead": "Il motore cloud dietro Estrattore online, esposto come server HTTP API e MCP. Strutturato JSON, una chiave, nessun HTML da analizzare."
        },
        "listLabel": "Prodotti per sviluppatori",
        "items": {
          "search": {
            "title": "API di estrazione",
            "description": "Aziende per qualsiasi parola chiave e località"
          },
          "reviews": {
            "title": "API delle recensioni",
            "description": "Valutazioni, testo e risposte del proprietario"
          },
          "photos": {
            "title": "API delle foto",
            "description": "Foto pubblica URLs per azienda"
          },
          "mcp": {
            "title": "MCPserver",
            "description": "Strumenti di ricerca e revisione per qualsiasi cliente MCP"
          }
        },
        "langLabel": "Lingua",
        "copyLabel": "Richiesta di copia",
        "sending": "Invio richiesta...",
        "response": "Risposta · 200 OK · {ms} ms",
        "toolCall": "Chiamata utensile · {tool} · 200 OK",
        "exploreApi": "Esplora il API",
        "apiPricing": "API prezzi",
        "worksWith": "Funziona con gli strumenti che già usi",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP pacchi"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Casi d'uso",
          "title": {
            "lead": "Realizzato per il lavoro ",
            "accent": " dopo ",
            "tail": " la ricerca"
          }
        },
        "cards": [
          {
            "label": "Generazione di lead",
            "title": "Elenchi di contatti locali",
            "body": "Cerca una categoria e una città, quindi esporta l'intera pagina dei risultati (telefoni, siti Web ed e-mail inclusi) in un unico foglio di calcolo."
          },
          {
            "label": "SEO locale",
            "title": "Benchmark della concorrenza",
            "body": "Ottieni valutazioni e conteggi delle recensioni per ogni concorrente in un'area in un unico passaggio e crea il report direttamente dall'esportazione."
          },
          {
            "label": "Ricerche di mercato",
            "title": "Set di dati sulla posizione",
            "body": "Raccogli ID luogo e coordinate per ogni filiale o sede della concorrenza, pronti per i tuoi strumenti di mappatura e routing."
          }
        ],
        "leadTags": [
          "e-mail",
          "telefono",
          "e-mail",
          "sito"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Prezzi",
          "title": {
            "lead": "Inizia gratis.  ",
            "accent": " Scala ",
            "tail": " quando conviene."
          },
          "lead": "Ogni prodotto ha un livello gratuito senza limiti di tempo. Aggiorna solo la superficie che usi effettivamente."
        },
        "lines": {
          "extension": {
            "title": "Estensione del browser",
            "billing": "Mensile",
            "link": "Vedi i piani di estensione"
          },
          "online": {
            "title": "Estrattore online",
            "billing": "Una volta",
            "link": "Vedi Piani online"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Una volta",
            "link": "Vedi i piani API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Strumenti gratuiti",
          "title": {
            "lead": "Piccoli strumenti per gli utenti esperti di Maps ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Sette utilità che vengono eseguite interamente nel tuo browser: ciò che incolli non lascia mai il tuo dispositivo."
        },
        "descriptions": {
          "place-id-finder": "Incolla un luogo sulla mappa URL e leggi i suoi Place ID, CID e FID.",
          "review-link-generator": "Ottieni il collegamento diretto \"scrivi una recensione\" per qualsiasi attività.",
          "email-checker": "Scopri immediatamente se un formato email è valido, con suggerimenti sugli errori di battitura.",
          "lat-long-to-dms": "Coordinate decimali in gradi, minuti e secondi.",
          "dms-to-dd": "Le coordinate DMS tornano ai gradi decimali puliti.",
          "bulk-keywords-generator": "Ogni combinazione \"parola chiave + posizione\", pronta per essere incollata.",
          "merge-csv": "Unisci le esportazioni CSV in un unico file, allineate per intestazione."
        },
        "more": "Altri strumenti in arrivo"
      },
      "faq": {
        "kicker": "Domande frequenti",
        "title": {
          "lead": "",
          "accent": "Domande frequenti",
          "tail": ""
        },
        "lead": "Le risposte brevi. Per il resto, il supporto è a una e-mail di distanza.",
        "contact": "Contatta l'assistenza",
        "items": [
          {
            "question": "MapsGrab è gratuito?",
            "answer": "SÌ. L'estensione funziona senza account e include una quota mensile gratuita di record. I piani a pagamento nella pagina Prezzi aumentano i limiti quando ne hai bisogno di più."
          },
          {
            "question": "Quali browser sono supportati?",
            "answer": "Scarica MapsGrab dalla pagina delle estensioni. Chrome, Edge e Brave caricano il ZIP non imballato; Firefox utilizza un componente aggiuntivo temporaneo separato che deve essere ricaricato dopo il riavvio. La pagina include le istruzioni di installazione e aggiornamento."
          },
          {
            "question": "Da dove provengono i dati ed è legale raccoglierli?",
            "answer": "MapsGrab raccoglie solo le informazioni visualizzate pubblicamente sulle Google Maps pagine che visiti: gli stessi dettagli che qualsiasi visitatore può leggere. Non accediamo ad account privati, contenuti riservati o dati non pubblici."
          },
          {
            "question": "Devo installare qualcosa per gli strumenti web?",
            "answer": "No. Gli strumenti web gratuiti vengono eseguiti interamente nel tuo browser: il tuo input non lascia mai il tuo dispositivo."
          },
          {
            "question": "In quali formati posso esportare?",
            "answer": "Le esportazioni arrivano come CSV o JSON con la selezione del campo scelta, deduplicate da Place ID."
          },
          {
            "question": "MapsGrab vede i dati che raccolgo?",
            "answer": "Le tue impostazioni e i risultati vengono archiviati localmente nel tuo browser. I nostri server gestiscono solo la configurazione remota, lo stato dell'account e della quota, l'arricchimento opzionale di posta elettronica/social e i registri di utilizzo minimo."
          }
        ]
      },
      "cta": {
        "kicker": "Inizia",
        "title": {
          "lead": "Inizia ad acquisire tra ",
          "accent": " minuti ",
          "tail": ""
        },
        "lead": "Installa l'estensione, apri Google Maps, cerca ed esporta il tuo primo elenco: non è richiesto alcun account.",
        "install": "Installa MapsGrab gratuitamente",
        "online": "Prova il estrattore online",
        "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab per Chrome, Bordo e Firefox — Google Maps Estensione estrattore",
        "description": "Estrai 36 colonne di dati aziendali, recensioni e foto da Google Maps, arricchisci i record con e-mail e collegamenti social, esegui attività batch ed esporta in CSV o JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Scarica per Chrome, Edge e Firefox"
        },
        "title": {
          "lead": "L'estrattore Google Maps per ",
          "accent": " il tuo browser ",
          "tail": ""
        },
        "lead": "Apri qualsiasi pagina di ricerca o aziendale Google Maps e prendi ciò che viene mostrato pubblicamente lì: dati aziendali, recensioni, foto e dettagli di contatto. Tutto viene esportato in CSV o JSON, direttamente dal tuo browser.",
        "downloadCta": "Scarica per Chrome e Edge",
        "installCta": "Guida all'installazione",
        "meta": [
          "Nessun account richiesto",
          "1,000 record gratuiti al mese",
          "Le esportazioni rimangono sul tuo computer"
        ],
        "theater": {
          "panelLabel": "MapsGrab anteprima del pannello",
          "extensionActive": "MapsGrab è attivo su questa pagina",
          "dock": "Dock a sinistra/destra",
          "filters": [
            "Apri ora",
            "I più votati",
            "Prezzo"
          ],
          "open": "Aprire",
          "closes": "Chiude {time}",
          "endOfList": "Hai raggiunto la fine dell'elenco.",
          "start": "Avvia estrazione",
          "extracting": "Estrazione {count}…",
          "pause": "Pausa",
          "complete": "Estratto completo.",
          "reset": "Reset",
          "kpis": {
            "phones": "telefoni",
            "websites": "siti web",
            "emails": "e-mail"
          },
          "exportCta": "Elenco dettagliato esportazione - {count} (.CSV)",
          "saved": "Salvato in Download",
          "scrollChip": {
            "label": "Scorrimento automatico",
            "value": "A ritmo umano, 5–10 s"
          },
          "dedupeChip": {
            "label": "Deduplicato",
            "value": "da Place ID"
          }
        }
      },
      "facts": {
        "caption": "L'estensione in breve",
        "items": [
          {
            "value": 36,
            "label": "colonne per azienda, dal nome a Place ID"
          },
          {
            "value": 11,
            "label": "colonne di revisione, risposte del proprietario incluse"
          },
          {
            "value": 6,
            "label": "social network abbinati per sito web"
          },
          {
            "value": 1000,
            "label": "record gratuiti ogni mese, senza bisogno di un account"
          },
          {
            "value": 500,
            "label": "parole chiave o revisione URLs per attività batch"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Dove funziona",
          "title": {
            "lead": "Un pannello per ogni ",
            "accent": " Visualizzazione mappe ",
            "tail": ""
          },
          "lead": "Il pannello MapsGrab appare proprio su Google Maps. I risultati di ricerca, le pagine aziendali e gli elenchi salvati ottengono ciascuno la giusta modalità di estrazione: nessun copia-incolla, nessuna manipolazione delle schede."
        },
        "search": {
          "title": "Risultati della ricerca",
          "description": "Premi Avvia estrazione su qualsiasi ricerca. MapsGrab scorre l'elenco dei risultati a un ritmo umano e raccoglie ogni elenco mentre viene caricato."
        },
        "place": {
          "title": "Pagine aziendali",
          "description": "In una pagina aziendale, la scheda Recensioni e foto scorre le recensioni e gli album fotografici: le recensioni vengono esportate con colonne 11, le foto come elenchi URL.",
          "tabs": [
            "Panoramica",
            "Recensioni e foto"
          ],
          "reviewsCta": "Inizia a estrarre recensioni",
          "photosCta": "Inizia a estrarre le foto",
          "reviewsCount": "{count} recensioni",
          "photosCount": "{count} foto"
        },
        "saved": {
          "title": "Elenchi salvati",
          "description": "Apri un elenco salvato e premi Avvia una volta. MapsGrab apre ogni luogo a turno e lo raccoglie, senza clic per articolo.",
          "listName": "Preferiti · {count} luoghi"
        }
      },
      "features": {
        "head": {
          "kicker": "Caratteristiche",
          "title": {
            "lead": "Tutto ciò che mostra una pagina di Maps, ",
            "accent": " strutturato ",
            "tail": ""
          },
          "lead": "Uno schema di estrazione tra i risultati di ricerca e le pagine aziendali, ottimizzato rispetto all'attuale interfaccia Google Maps e aggiornato da remoto quando cambia Google."
        },
        "tabsLabel": "Funzionalità di estensione",
        "tabs": [
          {
            "id": "business",
            "title": "Dati aziendali",
            "description": "36 colonne per azienda, acquisite mentre l'elenco scorre."
          },
          {
            "id": "reviews",
            "title": "Recensioni",
            "description": "Recensioni con risposte del proprietario, impaginate automaticamente."
          },
          {
            "id": "photos",
            "title": "Foto",
            "description": "Foto di album come elenchi URL pronti all'uso."
          },
          {
            "id": "enrichment",
            "title": "E-mail e arricchimento sociale",
            "description": "Canali di contatto diretto dal sito ufficiale."
          },
          {
            "id": "batch",
            "title": "Attività batch",
            "description": "Una coda di parole chiave o recensione URLs, percorsa articolo per articolo."
          },
          {
            "id": "export",
            "title": "Esportare",
            "description": "CSV o JSON, salvati direttamente sul tuo computer."
          }
        ],
        "business": {
          "claimed": "Reclamato",
          "fields": {
            "phone": "Telefono",
            "website": "Sito web",
            "rating": "Voto medio",
            "hours": "Orari di apertura",
            "timeZone": "Fuso orario",
            "coordinates": "Coordinate",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} recensioni",
          "columns": "{count} colonne per azienda",
          "reserved": "Codice Plus riservato",
          "more": "+{count} altro"
        },
        "reviews": {
          "title": "Recensioni",
          "columns": "{count} colonne",
          "ownerReply": "Risposta del proprietario",
          "loading": "Caricamento della pagina successiva di recensioni"
        },
        "photos": {
          "streetView": "Street View · filtrato"
        },
        "enrichment": {
          "website": "Sito ufficiale",
          "moreNetworks": "Anche X, YouTube e TikTok hanno controllato"
        },
        "batch": {
          "complete": "{count} completo",
          "stuck": "{count} bloccato",
          "total": "{count} totale",
          "done": "Completa · {count}",
          "skipped": "Nessun progresso per 90 s · saltato",
          "running": "Estrazione…",
          "queued": "In coda",
          "autoExport": "Esporta automaticamente al termine dell'attività"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} righe · {selected} di {total} colonne selezionate · deduplicate da Place ID",
          "destinations": [
            {
              "title": "Download",
              "description": "Salvato dal tuo browser"
            },
            {
              "title": "Selettore di colonne",
              "description": "Esporta solo le colonne che ti servono"
            },
            {
              "title": "Download automatico",
              "description": "Salva al termine dell'estrazione"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Attività batch",
          "title": {
            "lead": "Metti in coda l'elenco.  ",
            "accent": " Allontanati. ",
            "tail": ""
          },
          "lead": "Incolla fino a 500 parole chiave o rivedi URLs in un'unica attività. MapsGrab li esamina elemento per elemento con progressi in tempo reale, salta tutto ciò che si blocca ed esporta automaticamente al termine dell'attività."
        },
        "checks": [
          "Le attività relative alle parole chiave eseguono una ricerca su Maps per parola chiave",
          "Le attività Review-URL raccolgono recensioni azienda per azienda",
          "Lo stato dell'attività viene salvato su disco e riprende dopo il riavvio del browser",
          "Fino a 150 attività salvate, un batch alla volta"
        ],
        "mock": {
          "tabs": [
            "Strumento per i dati di parole chiave in blocco",
            "Bulk Google Estrattore di recensioni"
          ],
          "taskName": "Nome dell'attività",
          "taskPlaceholder": "per esempio. 100 parole chiave, agenzia di design",
          "keywords": "Parole chiave · una per riga",
          "lineCount": "{count} / {limit}",
          "start": "Avvia estrazione",
          "columns": {
            "task": "Nome dell'attività",
            "status": "Stato",
            "actions": "Azioni"
          },
          "running": "Corsa",
          "complete": "Completare",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} bloccato",
          "progressExported": "{done} / {total} · esportato",
          "lines": {
            "run": "estraendo…",
            "done": "completare",
            "stuck": "bloccato · saltato"
          },
          "toast": "Attività completata: esportata",
          "chip": {
            "label": "Stato dell'attività",
            "value": "Salvato su disco"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Prima il locale",
          "title": {
            "lead": "I risultati rimangono ",
            "accent": " nel tuo browser ",
            "tail": ""
          },
          "lead": "Le impostazioni e i risultati vengono archiviati localmente. I nostri server gestiscono solo la configurazione remota, lo stato dell'account e della quota, l'e-mail opzionale e l'arricchimento social e i registri di utilizzo minimo."
        },
        "checks": [
          "Le esportazioni vengono generate sul tuo computer",
          "La selezione delle colonne e la deduplicazione Place ID vengono eseguite localmente prima che il file venga salvato",
          "La configurazione remota mantiene il pannello aggiornato quando Google Maps cambia, senza reinstallarlo",
          "Se qualcosa non può essere letto, il pannello mostra un errore invece di fallire silenziosamente"
        ],
        "diagram": {
          "browser": "Il tuo navigatore",
          "servers": "MapsGrab server",
          "nodes": {
            "mapsTab": "Google Maps tab",
            "panel": "Pannello MapsGrab",
            "storage": "Archiviazione locale",
            "exports": "Le tue esportazioni",
            "config": "Configurazione remota",
            "quota": "Conto e quota",
            "enrichment": "Arricchimento"
          },
          "flows": {
            "rows": "righe aziendali",
            "rules": "regole",
            "usage": "utilizzo",
            "websites": "siti web aziendali → email e social"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Installare",
          "title": {
            "lead": "Installa ",
            "accent": " MapsGrab ",
            "tail": ""
          },
          "lead": "Scarica ZIP qui e segui i passaggi per il tuo browser. Chrome, Edge e Brave caricano la cartella decompressa. Firefox utilizza un componente aggiuntivo temporaneo separato che deve essere ricaricato dopo un riavvio. Fare clic su qualsiasi immagine per visualizzarla a schermo intero."
        },
        "zip": {
          "title": "Installazione diretta (rilascia zip)",
          "description": "Scegli ZIP per il tuo browser. Estrailo in una cartella che conservi, quindi caricalo utilizzando la guida di seguito. Per aggiornare, scarica un nuovo ZIP, sostituisci i file in quella cartella e ricarica l'estensione.",
          "button": "Chrome, Bordo e Brave ZIP",
          "firefoxButton": "Firefox ZIP (componente aggiuntivo temporaneo)",
          "meta": "Versione {version} · pre-release"
        },
        "browserLabel": "Navigatore",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Bordo",
            "note": "Edge, Chrome, Brave e altri browser Chromium",
            "steps": [
              {
                "title": "Scarica e decomprimi",
                "description": [
                  "Scaricamento ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Su Windows, fai clic con il pulsante destro del mouse e scegli \"Estrai tutto\". Su macOS, fai doppio clic su di esso. Conserva la cartella estratta."
                ],
                "shot": "MapsGrab ZIP scaricato in Chrome"
              },
              {
                "title": "Apri la pagina delle estensioni",
                "description": [
                  "Aprire ",
                  {
                    "code": "chrome://extensions"
                  },
                  " in Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " in Edge, o ",
                  {
                    "code": "brave://extensions"
                  },
                  " in Brave."
                ],
                "shot": "La pagina di gestione delle estensioni"
              },
              {
                "title": "Abilita la modalità sviluppatore",
                "description": [
                  "Attiva la modalità sviluppatore nella pagina delle estensioni. In Chrome, l'interruttore è in alto a destra."
                ],
                "shot": "Modalità sviluppatore abilitata con il pulsante Carica decompresso visibile"
              },
              {
                "title": "Carica la cartella decompressa",
                "description": [
                  "Fare clic su \"Carica decompresso\" e selezionare la cartella estratta. MapsGrab appare nell'elenco delle estensioni. Apri una ricerca Google Maps per usarlo."
                ],
                "shot": "Carica spacchettato con la carta MapsGrab aggiunta"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Componente aggiuntivo temporaneo; ricaricalo dopo il riavvio Firefox",
            "steps": [
              {
                "title": "Scarica e decomprimi",
                "description": [
                  "Scaricamento ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Su Windows, fai clic con il pulsante destro del mouse e scegli \"Estrai tutto\". Su macOS, fai doppio clic su di esso. Conserva la cartella estratta."
                ],
                "shot": "MapsGrab Firefox ZIP scaricato in Firefox"
              },
              {
                "title": "Apri la pagina di debug",
                "description": [
                  "Vai a ",
                  {
                    "code": "about:debugging"
                  },
                  ", quindi seleziona il tuo browser nella barra laterale di sinistra."
                ],
                "shot": "Firefox Pagina di debug con i controlli aggiuntivi temporanei"
              },
              {
                "title": "Carica il componente aggiuntivo",
                "description": [
                  "Fai clic su \"Carica componente aggiuntivo temporaneo...\" e seleziona ",
                  {
                    "code": "manifest.json"
                  },
                  " all'interno della cartella decompressa. Un componente aggiuntivo temporaneo viene scaricato al riavvio di Firefox; ripetere questo passaggio per caricarlo nuovamente."
                ],
                "shot": "MapsGrab caricato come estensione temporanea Firefox con lo script in background in esecuzione"
              }
            ]
          }
        ],
        "help": {
          "title": "Problemi di installazione?",
          "description": "Inviaci il nome del browser e ciò che hai visto: ti sbloccheremo.",
          "cta": "Contatta l'assistenza"
        },
        "notes": {
          "kicker": "Note sulla versione",
          "version": "0.1.0",
          "status": "Pre-release",
          "date": "Agosto 2026",
          "items": [
            "Prima pre-release dell'estensione MapsGrab",
            "Google Maps Estrazione della ricerca con scorrimento automatico e schema della colonna 36",
            "Revisione ed estrazione foto da pagine aziendali",
            "Arricchimento di e-mail e social media per azienda",
            "Parola chiave batch e attività di revisione-URL con stato dell'attività su disco",
            "Esportazione CSV / JSON con selezione del campo e deduplicazione Place ID",
            "Build per Microsoft Edge e Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Piani di estensione",
          "title": {
            "lead": "Una estensione, tre piani ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Ogni riga raccolta dall'estensione (un'attività, una recensione o una foto) conta come un record. Tutti i piani includono recensioni, foto e attività batch; i piani a pagamento esportano tutte le 36 colonne, incluse email e arricchimento social, con un volume mensile maggiore."
        },
        "note": "L'utilizzo mensile si reimposta il 1st tra New York; i record non utilizzati non vengono ripristinati.",
        "compare": "Confronta tutti i piani"
      },
      "faq": {
        "kicker": "Domande frequenti",
        "title": {
          "lead": "",
          "accent": "Domande frequenti",
          "tail": ""
        },
        "lead": "Le risposte brevi. Per il resto, il supporto è a una e-mail di distanza.",
        "contact": "Contatta l'assistenza",
        "items": [
          {
            "question": "L'estensione è gratuita?",
            "answer": "SÌ. L'estensione funziona senza account e include 1,000 record ogni mese. I piani a pagamento nella pagina Prezzi aggiungono tutte le colonne 36 con l'arricchimento di e-mail e social media e aumentano il volume mensile."
          },
          {
            "question": "Quali browser sono supportati?",
            "answer": "Chrome, Edge, Brave e altri browser Chromium caricano il ZIP decompresso scaricato qui. Firefox ha un ZIP separato per il caricamento temporaneo; ricaricarlo dopo ogni riavvio del browser. Seguire la guida di installazione sopra."
          },
          {
            "question": "Devo effettuare l'accesso?",
            "answer": "No. L'estrazione del nucleo funziona senza un account. La quota viene conteggiata per account a cui hai effettuato l'accesso o per dispositivo browser quando non hai effettuato l'accesso: accedi con l'account che possiede un piano in modo che si applichi il volume più elevato."
          },
          {
            "question": "Cosa conta come record?",
            "answer": "Ogni riga raccolta dall'estensione conta come un record: un'attività commerciale da un elenco di ricerca o salvato, una recensione o una foto. L'e-mail e l'arricchimento sociale non aggiungono record."
          },
          {
            "question": "Cosa succede quando Google Maps cambia?",
            "answer": "Le regole di estrazione vengono fornite come configurazione remota, quindi le correzioni raggiungono il pannello senza reinstallare l'estensione. Se una pagina non può essere letta, il pannello mostra un errore invece di fallire silenziosamente."
          },
          {
            "question": "MapsGrab vede i dati che raccolgo?",
            "answer": "Le tue impostazioni e i risultati vengono archiviati localmente nel tuo browser. I nostri server gestiscono solo la configurazione remota, lo stato dell'account e della quota, l'e-mail opzionale e l'arricchimento social e i registri di utilizzo minimo."
          },
          {
            "question": "Da dove provengono i dati ed è legale raccoglierli?",
            "answer": "MapsGrab raccoglie solo le informazioni visualizzate pubblicamente sulle Google Maps pagine che visiti: gli stessi dettagli che qualsiasi visitatore può leggere. Non accediamo ad account privati, contenuti riservati o dati non pubblici."
          }
        ]
      },
      "cta": {
        "kicker": "Inizia",
        "title": {
          "lead": "Prendi il tuo primo elenco ",
          "accent": " oggi ",
          "tail": ""
        },
        "lead": "Installa l'estensione, cerca Google Maps ed esporta un foglio di calcolo pulito: non è richiesto alcun account.",
        "primary": "Installa MapsGrab",
        "secondary": "Confronta i piani",
        "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Accesso al sito web",
        "title": "Accedi per sincronizzare i tuoi crediti",
        "trigger": "Registrazione",
        "modalTitle": "Accedi per continuare",
        "closeLabel": "Vicino",
        "signedInAs": "Registrato come",
        "continueWithGoogle": "Continuare con Google",
        "googleLoading": "Apertura Google...",
        "or": "O",
        "emailLabel": "E-mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Continua con l'e-mail",
        "sendCode": "Invia codice",
        "sendingCode": "Invio...",
        "sendCodeSuccess": "Codice di verifica inviato.",
        "sendAgain": "Invia di nuovo",
        "codeLabel": "Codice di verifica",
        "codePlaceholder": "123456",
        "signIn": "Registrazione",
        "termsNotice": "Effettuando l'accesso accetti i",
        "termsLink": "Termini",
        "privacyLink": "politica sulla riservatezza",
        "logout": "Esci",
        "creditsLabel": "Crediti",
        "enterEmailFirst": "Inserisci prima il tuo indirizzo email.",
        "enterEmailAndCode": "Inserisci sia l'e-mail che il codice di verifica.",
        "sendCodeFailed": "Impossibile inviare il codice di verifica.",
        "googleSignInFailed": "Google accesso non riuscito.",
        "googleClientMissing": "L'accesso Google non è configurato.",
        "signInFailed": "Impossibile accedere."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Pagamento annullato",
        "canceledMessage": "Questo ordine non è stato pagato. Puoi chiudere questa scheda e scegliere nuovamente un metodo di pagamento nella finestra originale.",
        "canceledMetaDescription": "Il tuo pagamento di PayPal è stato annullato.",
        "waitingTitle": "Pagamento inviato",
        "waitingMessage": "Puoi tornare alla scheda originale. Stiamo controllando la conferma PayPal ogni 3 secondi e il risultato verrà visualizzato qui automaticamente.",
        "confirmedCreditsTitle": "Crediti aggiunti",
        "confirmedCreditsMessage": "Il tuo pagamento PayPal è confermato e i crediti sono stati aggiunti. Puoi chiudere questa scheda e continuare nella finestra originale.",
        "confirmedSubscriptionTitle": "Abbonamento attivato",
        "confirmedSubscriptionMessage": "Il tuo pagamento PayPal è confermato e il tuo piano MapsGrab è attivo. Puoi chiudere questa scheda e continuare nella finestra originale.",
        "failedTitle": "Il pagamento richiede attenzione",
        "failedMessage": "Non è stato possibile confermare l'ordine automaticamente. Torna alla finestra originale o prova ad aggiornare lo stato del pagamento da lì."
      },
      "checkin": {
        "accountButtonLabel": "Apri il menu dell'account",
        "accountMenuLabel": "Menù conto"
      },
      "creditPurchase": {
        "title": "Ottieni più crediti",
        "description": "Aggiungi crediti e continua a utilizzare le funzionalità a pagamento in quest'area di lavoro.",
        "successTitle": "Crediti aggiunti",
        "successDescription": "Il tuo saldo è stato aggiornato. Chiudi questa finestra e continua.",
        "packageEyebrow": "Paga mentre procedi",
        "cardNote": "Utilizza i crediti per le funzionalità del sito Web a pagamento. I crediti non scadono mai.",
        "creditsAmount": "{credits} Crediti",
        "buyNow": "Acquista ora",
        "selectPackage": "Selezionare",
        "paymentMethodLabel": "Scegli il metodo di pagamento",
        "paymentTitle": "Scegli il metodo di pagamento",
        "selectedPackageLabel": "Pacchetto selezionato",
        "confirmPurchase": "Procedi al pagamento",
        "backToProducts": "Indietro",
        "close": "Vicino",
        "agreementText": "Accetto i termini di acquisto, i Termini e l'Informativa sulla privacy.",
        "loadingConfigs": "Caricamento pacchetti di crediti...",
        "loadFailed": "Impossibile caricare i pacchetti di crediti. Per favore riprova.",
        "noConfigs": "Nessun pacchetto di crediti è disponibile al momento. Per favore riprova più tardi.",
        "ready": "Scegli un pacchetto di crediti. I prezzi sono mostrati in USD.",
        "creatingOrder": "Creazione dell'ordine...",
        "pendingPayment": "Completa il pagamento nella scheda appena aperta. Controlleremo il risultato automaticamente.",
        "pendingPaymentTitle": "In attesa di pagamento",
        "cancelPayment": "Annulla il pagamento",
        "supportMailPrefix": "Segnala un problema: ",
        "success": "Pagamento completato. I crediti sono ora disponibili.",
        "failed": "Il pagamento non è completo. Puoi riprovare o chiudere questa finestra.",
        "successCredits": "+{credits} Crediti aggiunti",
        "successBalance": "Saldo attuale: crediti {balance}",
        "createFailed": "Impossibile creare l'ordine. Per favore riprova.",
        "invalidPaymentData": "Il collegamento di pagamento non è valido. Per favore riprova più tardi.",
        "priceUpdated": "Il prezzo è cambiato. Controlla l'ultimo prezzo e acquista di nuovo.",
        "gatewayFailed": "L'immissione del pagamento è temporaneamente non disponibile. Per favore riprova più tardi.",
        "paymentCanceled": "Il pagamento è stato annullato. Scegli un metodo di pagamento e riprova.",
        "pollFailed": "Impossibile aggiornare lo stato del pagamento. Per favore riprova.",
        "pollTimeout": "L'aggiornamento automatico è scaduto. Utilizza il pulsante Aggiorna dopo il pagamento.",
        "orderNotFound": "L'ordine non è più disponibile. Crea un nuovo ordine.",
        "orderExpired": "Ordine scaduto. Si prega di acquistare di nuovo.",
        "fulfillmentFailed": "Il pagamento è stato ricevuto ma i crediti non sono stati ancora aggiunti. Per favore riprova più tardi.",
        "authExpired": "Accesso scaduto. Accedi nuovamente per continuare.",
        "popupBlocked": "Il tuo browser ha bloccato la nuova finestra. Consenti a MapsGrab di aprire i popup e riprova."
      }
    },
    "pricing": {
      "seo": {
        "title": "Prezzi: piani online, estensione e API | MapsGrab",
        "description": "Piani MapsGrab per ogni superficie: Estrattore online da $19, Estensione del browser da $39, e API da $15. Livelli gratuiti inclusi in ogni prodotto: piani mensili naturali una tantum su Online e API, abbonamenti mensili su Extension."
      },
      "hero": {
        "kicker": "Prezzi",
        "title": {
          "lead": "Pianifica ",
          "accent": " in tre modi ",
          "tail": " per acquisire i dati di Maps"
        },
        "lead": "Scegli la superficie adatta al tuo flusso di lavoro: estrattore online cloud, estensione del browser o HTTP API, quindi scegli il volume mensile. Aggiorna o acquista da questa pagina in pochi minuti.",
        "meta": [
          "Livello gratuito su ogni prodotto",
          "Paga con PayPal",
          "Upgrade pagando la differenza"
        ],
        "switchLabel": "Linea di prodotti"
      },
      "popularLabel": "Il più popolare",
      "tabs": {
        "online": {
          "name": "Estrattore online",
          "shortName": "Online",
          "switchMeta": "Da {price} · una tantum",
          "unit": "record",
          "eyebrow": "Piani di estrattore online",
          "title": "Estrazione del cloud, valutata in base ai record",
          "description": "Esegui il motore MapsGrab sulla nostra infrastruttura. Un record è una riga aziendale raccolta. I piani a pagamento includono l'e-mail opzionale e l'arricchimento dei social media senza costi aggiuntivi.",
          "billingChips": [
            "Pagamento una tantum",
            "Copre un mese naturale",
            "Nessun rinnovo automatico"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuito",
              "tagline": "Prova il estrattore delle nuvole su piccola scala",
              "price": "$0",
              "periodLabel": "per sempre",
              "quota": "1,000 record/mese",
              "features": [
                "Estrazione affari con 37-colonna CSV esportazione",
                "Fino a 2 parole chiave per attività",
                "Modalità mappa e regione per ricerche di aree",
                "E-mail e arricchimento sociale sui piani a pagamento",
                "Un CSV deduplicato per attività"
              ],
              "ctaLabel": "Inizia gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Per esportazioni occasionali una tantum",
              "price": "$19",
              "periodLabel": "una tantum · 1 mese",
              "quota": "20,000 record/mese",
              "features": [
                "Tutto gratis",
                "20,000 record per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "Fino a 5 parole chiave per attività",
                "E-mail e arricchimento social, attivi per impostazione predefinita e facoltativi"
              ],
              "ctaLabel": "Ottieni Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Di base",
              "tagline": "Per una raccolta settimanale costante di lead",
              "price": "$49",
              "periodLabel": "una tantum · 1 mese",
              "quota": "80,000 record/mese",
              "features": [
                "Tutto in Lite",
                "80,000 record per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "Fino a 10 parole chiave per attività"
              ],
              "ctaLabel": "Ottieni Base",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Crescita",
              "tagline": "Per la crescita di condutture di piombo",
              "price": "$99",
              "periodLabel": "una tantum · 1 mese",
              "quota": "250,000 record/mese",
              "features": [
                "Tutto in Basic",
                "250,000 record per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "Fino a 20 parole chiave per attività"
              ],
              "ctaLabel": "Ottieni crescita",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Professionale",
              "tagline": "Per agenzie e team che utilizzano molti dati",
              "price": "$149",
              "periodLabel": "una tantum · 1 mese",
              "quota": "500,000 record/mese",
              "features": [
                "Tutto in crescita",
                "500,000 record per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "Fino a 50 parole chiave per attività"
              ],
              "ctaLabel": "Diventa professionale",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pagamento una tantum che copre un mese naturale: i piani in questa scheda non si rinnovano automaticamente. Un record è una riga aziendale raccolta da Google Maps; l'utilizzo si ripristina al 1st e i record inutilizzati non vengono ripristinati.",
          "compare": {
            "lead": "Piani di Scraper online: estrazione del cloud, prezzi in base ai record.",
            "volume": "Registrazioni al mese",
            "groups": [
              {
                "label": "Dati",
                "rows": [
                  {
                    "label": "Estrazione affari con 37-colonna CSV esportazione",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "E-mail e arricchimento sociale",
                    "cells": [
                      false,
                      "Attivo per impostazione predefinita, facoltativo",
                      "Attivo per impostazione predefinita, facoltativo",
                      "Attivo per impostazione predefinita, facoltativo",
                      "Attivo per impostazione predefinita, facoltativo"
                    ]
                  }
                ]
              },
              {
                "label": "Flusso di lavoro",
                "rows": [
                  {
                    "label": "Parole chiave per attività",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Modalità mappa e regione",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Un CSV deduplicato per attività",
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
            "usageNotice": "Si applica alla quota di record mensile di MapsGrab Estrattore online.",
            "successTitle": "Piano attivato",
            "successDescription": "Il tuo piano una tantum da 1 al mese è attivo. Lo scraper online lo riprende al successivo aggiornamento della quota."
          }
        },
        "extension": {
          "name": "Estensione",
          "shortName": "Estensione",
          "switchMeta": "Da {price} · una tantum",
          "unit": "record",
          "eyebrow": "Piani di estensione",
          "title": "Estrazione del browser, valutata in base ai record",
          "description": "Ogni riga raccolta dall'estensione (un'attività, una recensione o una foto) conta come un record. Tutti i piani includono recensioni, foto e attività batch; i piani a pagamento esportano tutte le colonne 36, incluse email e arricchimento sociale.",
          "billingChips": [
            "Pagamento una tantum",
            "1 mese di accesso",
            "Nessun rinnovo automatico"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuito",
              "tagline": "Estrazione del nucleo, su piccola scala",
              "price": "$0",
              "periodLabel": "per sempre",
              "quota": "1,000 record/mese",
              "features": [
                "Estrazione dati aziendali",
                "Recensioni (colonne 11) e foto URLs",
                "Parole chiave batch e attività di revisione-URL",
                "Esportazione CSV / JSON con selezione del campo"
              ],
              "ctaLabel": "Installa l'estensione",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Per liberi professionisti e pipeline di lead in crescita",
              "price": "$39",
              "periodLabel": "una tantum · 1 mese",
              "quota": "100,000 record/mese",
              "features": [
                "Tutto gratis",
                "100,000 registrazioni ogni mese",
                "Estrazione completa delle attività in 36 colonne",
                "Arricchimento di e-mail e social media"
              ],
              "ctaLabel": "Ottieni professionista",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Attività commerciale",
              "tagline": "Per agenzie e team che utilizzano molti dati",
              "price": "$99",
              "periodLabel": "una tantum · 1 mese",
              "quota": "500,000 record/mese",
              "features": [
                "Tutto nel professionista",
                "500,000 registrazioni ogni mese",
                "Spazio per attività batch multimercato",
                "Stessa pipeline di esportazione con priorità locale"
              ],
              "ctaLabel": "Ottieni affari",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Ogni riga raccolta dall'estensione conta come un record: un'attività commerciale da un elenco di ricerca o salvato, una recensione o una foto. L'e-mail e l'arricchimento sociale non aggiungono record. L'utilizzo mensile si ripristina il 1st; i record non utilizzati non vengono ripristinati.",
          "compare": {
            "lead": "Piani di estensione: estrazione dal browser, prezzi in base ai record.",
            "volume": "Registrazioni al mese",
            "groups": [
              {
                "label": "Dati",
                "rows": [
                  {
                    "label": "Estrazione dati aziendali",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Estrazione completa delle attività in 36 colonne",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Recensioni (colonne 11) e foto URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Arricchimento di e-mail e social media",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Parole chiave batch e attività di revisione-URL",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Esportare",
                "rows": [
                  {
                    "label": "Esportazione CSV / JSON con selezione del campo",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Pipeline di esportazione prioritaria a livello locale",
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
            "usageNotice": "Si applica alla quota mensile dell'estensione del browser MapsGrab.",
            "successTitle": "Piano attivato",
            "successDescription": "Il tuo piano una tantum da 1 al mese è attivo. L'estensione lo riprende al successivo aggiornamento della quota."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "Da {price} · una tantum",
          "unit": "richieste",
          "eyebrow": "API piani",
          "title": "Accesso programmatico, tariffato in base alle richieste",
          "description": "Cerca Google Maps aziende e recupera le loro recensioni dalle tue applicazioni tramite un semplice HTTP API. Ogni chiamata riuscita conta come una richiesta, anche quando non restituisce risultati o dati parziali.",
          "billingChips": [
            "Pagamento una tantum",
            "Copre un mese naturale",
            "Nessun rinnovo automatico"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuito",
              "tagline": "Valutare API su piccola scala",
              "price": "$0",
              "periodLabel": "per sempre",
              "quota": "20 richieste/mese",
              "features": [
                "Ricerca di aziende per parola chiave e posizione",
                "Endpoint delle revisioni con ordinamento e impaginazione",
                "JSON risposte",
                "Chiave API legata al tuo account",
                "Supporto comunitario"
              ],
              "ctaLabel": "Inizia gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Di base",
              "tagline": "Per prototipi e integrazioni leggere",
              "price": "$15",
              "periodLabel": "una tantum · 1 mese",
              "quota": "1,000 richieste/mese",
              "features": [
                "Tutto gratis",
                "1,000 richieste per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "JSON risposte"
              ],
              "ctaLabel": "Ottieni Base",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Professionale",
              "tagline": "Per integrazioni produttive",
              "price": "$65",
              "periodLabel": "una tantum · 1 mese",
              "quota": "5,000 richieste/mese",
              "features": [
                "Tutto in Basic",
                "5,000 richieste per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "JSON risposte"
              ],
              "ctaLabel": "Diventa professionale",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Attività commerciale",
              "tagline": "Per prodotti basati su dati MapsGrab",
              "price": "$115",
              "periodLabel": "una tantum · 1 mese",
              "quota": "10,000 richieste/mese",
              "features": [
                "Tutto in Professional",
                "10,000 richieste per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "JSON risposte"
              ],
              "ctaLabel": "Ottieni affari",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Scala",
              "tagline": "Per operazioni di dati con volumi elevati",
              "price": "$365",
              "periodLabel": "una tantum · 1 mese",
              "quota": "50,000 richieste/mese",
              "features": [
                "Tutto negli affari",
                "50,000 richieste per 1 mese",
                "Pagamento una tantum: nessun rinnovo automatico",
                "JSON risposte"
              ],
              "ctaLabel": "Ottieni Scala",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pagamento una tantum che copre un mese naturale: i piani in questa scheda non si rinnovano automaticamente. Ogni chiamata API o MCP riuscita conta come una richiesta, compresi i risultati vuoti e parziali; le chiamate fallite non vengono conteggiate. L'utilizzo si ripristina il 1st e le richieste non utilizzate non vengono trasferite.",
          "compare": {
            "lead": "Piani API: accesso programmatico, tariffato in base alle richieste.",
            "volume": "Richieste al mese",
            "groups": [
              {
                "label": "Endpoint",
                "rows": [
                  {
                    "label": "Ricerca di aziende per parola chiave e posizione",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Endpoint delle revisioni con ordinamento e impaginazione",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON risposte",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Server MCP con la stessa chiave API",
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
                "label": "Accesso",
                "rows": [
                  {
                    "label": "Chiave API legata al tuo account",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Supporto comunitario",
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
            "usageNotice": "Si applica alla quota di richiesta mensile MapsGrab API.",
            "successTitle": "Piano attivato",
            "successDescription": "Il tuo piano una tantum da 1 al mese è attivo. La tua chiave API preleva la nuova quota alla richiesta successiva."
          }
        }
      },
      "plansSection": {
        "label": "Piani",
        "finder": {
          "label": "Di quanti {unit} hai bisogno al mese?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} al mese — piano {plan}",
          "fits": "Adatto"
        }
      },
      "compare": {
        "kicker": "Confrontare",
        "title": {
          "lead": "Ogni piano, ",
          "accent": " affiancato ",
          "tail": ""
        },
        "plan": "Piano",
        "volumeGroup": "Volume e fatturazione",
        "billing": "Fatturazione",
        "included": "Incluso",
        "notIncluded": "Non incluso",
        "allPlans": "Incluso in tutti i piani"
      },
      "usage": {
        "head": {
          "kicker": "Utilizzo",
          "title": {
            "lead": "Ciò che conta ai fini della tua quota ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Due unità: record per l'estensione e lo Scraper online, richieste per API — ed entrambi vengono ripristinati il ​​primo 1 di ogni mese."
        },
        "records": {
          "meter": "Documenti utilizzati questo mese",
          "badge": "Estensione · Online",
          "title": "1 record = 1 riga raccolta",
          "body": "Ogni riga raccolta conta come un record: un'attività commerciale su Estrattore online; un'attività, una recensione o una foto nell'estensione. L'e-mail e l'arricchimento sociale non aggiungono record.",
          "count": "+1 record",
          "attachments": [
            "Telefono e sito web",
            "Orari di apertura",
            "E-mail e social"
          ]
        },
        "requests": {
          "meter": "Richieste utilizzate questo mese",
          "badge": "API · MCP",
          "title": "1 richiesta = 1 chiamata riuscita",
          "body": "Una richiesta è una chiamata API riuscita, anche quando non restituisce risultati o dati parziali; le chiamate fallite non vengono conteggiate. MCP le chiamate allo strumento attingono alla stessa quota di richieste.",
          "counted": "Chiamata riuscita: contata",
          "notCounted": "Chiamata non riuscita: non conteggiata"
        },
        "reset": {
          "title": "Si ripristina al 1st",
          "body": "L'utilizzo si reimposta il 1st di ogni mese. I record e le richieste non utilizzati non vengono trasferiti.",
          "limit": "Limite del piano",
          "unused": "Inutilizzato · non si ribalta",
          "flag": "Reset"
        }
      },
      "billing": {
        "head": {
          "kicker": "Fatturazione",
          "title": {
            "lead": "Fatturazione semplice, ",
            "accent": " nessuna sorpresa ",
            "tail": ""
          },
          "lead": "Come funzionano il pagamento, il rinnovo e gli aggiornamenti nelle tre linee di prodotti."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Paga qualsiasi piano tramite PayPal. Completa il pagamento su PayPal e torna qui per attivare il tuo piano."
          },
          "cadence": {
            "title": "Pagamento una tantum",
            "body": "Ogni piano a pagamento copre un mese naturale. Paga una volta senza addebiti automatici; acquista di nuovo quando hai bisogno di un altro mese."
          },
          "upgrade": {
            "title": "Upgrade pagando la differenza",
            "body": "Sposta un piano attivo a un livello superiore idoneo tramite il tuo attuale fornitore di servizi di pagamento. La data di scadenza e l'utilizzo finora rimangono invariati."
          },
          "independent": {
            "title": "Piani indipendenti",
            "body": "I piani su diverse schede sono indipendenti. Quando un piano scade, l'account torna automaticamente al livello gratuito."
          }
        }
      },
      "plans": {
        "loading": "Caricamento delle opzioni di pagamento...",
        "loadFailed": "Impossibile caricare le opzioni di pagamento. Aggiorna la pagina per riprovare.",
        "noChannels": "Nessun metodo di pagamento è disponibile per questo piano al momento.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Pagamento incompleto",
        "billingPeriodMonthly": "1 mese",
        "billingAutoRenew": "Rinnovo automatico fino all'annullamento",
        "billingOneTime": "Pagamento una tantum"
      },
      "upgrade": {
        "currentPlan": "Piano attuale",
        "button": "Migliora · {amount}",
        "title": "Aggiorna il tuo piano",
        "confirm": "Conferma l'aggiornamento",
        "oneTime": "Differenza una tantum tramite {channel}. La tua data di scadenza rimane {date}.",
        "autoRenew": "La differenza verrà addebitata immediatamente tramite {channel}. La tua data di scadenza rimane {date}; i rinnovi futuri utilizzano il nuovo prezzo del piano.",
        "pendingTitle": "In attesa del tuo aggiornamento",
        "pendingDescription": "Il tuo fornitore di servizi di pagamento sta applicando l'aggiornamento. Il tuo piano attuale rimane attivo finché non viene confermato.",
        "successTitle": "Piano aggiornato",
        "successDescription": "La tua nuova quota è attiva. La tua data di scadenza rimane {date}.",
        "quoteFailed": "Impossibile caricare il prezzo dell'aggiornamento. Aggiorna la pagina per riprovare.",
        "failed": "Impossibile confermare l'aggiornamento. Aggiorna la pagina per verificare il tuo piano prima di riprovare.",
        "reasons": {
          "no_active_subscription": "Il tuo piano non è più attivo. Aggiorna la pagina per scegliere un piano.",
          "not_higher_tier": "Scegli un livello superiore per eseguire l'upgrade o attendi la scadenza del piano per cambiare livello.",
          "non_positive_diff": "Il valore rimanente del tuo piano non è inferiore a questo livello. Puoi cambiare livello dopo la scadenza del tuo piano.",
          "channel_unavailable": "Gli upgrade non sono disponibili con il tuo metodo di pagamento attuale. Puoi modificare i piani dopo la scadenza."
        }
      },
      "faq": {
        "kicker": "Domande frequenti",
        "title": {
          "lead": "",
          "accent": "Domande frequenti",
          "tail": ""
        },
        "lead": "Le basi della fatturazione. Per il resto, il supporto è a una e-mail di distanza.",
        "contact": "Contatta l'assistenza",
        "items": [
          {
            "question": "Cosa conta come record?",
            "answer": "Un record è una riga raccolta, la stessa unità conteggiata dai piani gratuiti. Sullo Scraper online questo è un business; nell'estensione, ogni attività commerciale, recensione o foto raccolta costituisce un record. L'e-mail e l'arricchimento sociale non aggiungono record. Nella scheda API, l'utilizzo viene invece conteggiato nelle richieste riuscite."
          },
          {
            "question": "Ho bisogno di un piano a pagamento per provare MapsGrab?",
            "answer": "No. Ogni prodotto ha un livello gratuito senza limiti di tempo: Estrattore online e l'estensione includono 1,000 record al mese, mentre API include 20 richieste al mese. I piani gratuiti di Estrattore online e di estensione non includono l'arricchimento tramite e-mail o social media. I piani a pagamento online lo includono per impostazione predefinita e puoi disattivarlo per ogni attività."
          },
          {
            "question": "Come si applica la quota al mio account?",
            "answer": "La quota viene conteggiata per account a cui hai effettuato l'accesso (e per dispositivo browser per l'estensione quando non hai effettuato l'accesso). Accedi con l'account proprietario del piano in modo che si applichi il massimale più alto. Quando un piano scade, l'account torna automaticamente al livello gratuito."
          },
          {
            "question": "Il mio piano si rinnoverà automaticamente?",
            "answer": "No. Tutti i piani prevedono pagamenti una tantum di PayPal che coprono un mese naturale. Alla scadenza del tuo piano, ritorni al livello gratuito. Acquista nuovamente per continuare con un piano a pagamento."
          },
          {
            "question": "Posso passare da un livello all'altro?",
            "answer": "Puoi aggiornare un piano attivo a un livello superiore idoneo pagando la differenza tramite PayPal. La data di scadenza e l'utilizzo finora rimangono invariati. I piani su diverse schede sono indipendenti."
          }
        ]
      },
      "cta": {
        "kicker": "Inizia",
        "title": {
          "lead": "Inizia con il livello gratuito ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Ogni prodotto ha un livello gratuito senza limiti di tempo: 1,000 registra un mese sull'estensione e sullo Scraper online, 20 richiede un mese sul API.",
        "primary": "Installa l'estensione",
        "secondary": "Prova il estrattore online",
        "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
      }
    },
    "extensionLogin": {
      "title": "Accesso all'estensione | MapsGrab",
      "description": "Accedi per connettere la tua sessione del sito web MapsGrab all'estensione del browser.",
      "eyebrow": "Estensione del browser",
      "heading": "Accesso all'estensione",
      "checkingState": "Controllo",
      "signInRequiredState": "È richiesto l'accesso",
      "confirmState": "Conferma conto",
      "errorState": "Errore",
      "preparingTitle": "Preparazione dell'accesso",
      "preparingText": "Configurazione del bridge di accesso dell'estensione.",
      "invalidParamsTitle": "Link di accesso non valido",
      "invalidParamsText": "In questo collegamento di accesso mancano i parametri di sicurezza richiesti. Avvia nuovamente l'accesso dall'estensione.",
      "checkingSessionTitle": "Controllo della sessione",
      "checkingSessionText": "Verifica della sessione del sito Web esistente.",
      "finishingGoogleTitle": "Finendo Google accedi",
      "finishingGoogleText": "Scambiare la tua autorizzazione Google per una sessione del sito web.",
      "signInRequiredTitle": "Accedi per continuare",
      "signInRequiredText": "Accedi per connettere la sessione del tuo sito web all'estensione.",
      "signInButtonLabel": "Registrazione",
      "confirmTitle": "Conferma il tuo account",
      "confirmText": "L'estensione richiede di accedere con l'account riportato di seguito. Continua solo se hai appena iniziato ad accedere dall'estensione.",
      "continueButtonLabel": "Continuare",
      "useAnotherAccountLabel": "Utilizza un altro account",
      "issuingTitle": "Completamento dell'accesso",
      "issuingText": "Emissione di un codice di accesso monouso per l'estensione.",
      "issueFailedTitle": "Qualcosa è andato storto",
      "retryButtonLabel": "Riprova",
      "verificationFailedPrefix": "La verifica del token del sito web non è riuscita",
      "issueFailedPrefix": "La richiesta del codice di accesso all'interno non è riuscita",
      "googleSignInFailedPrefix": "Google accesso non riuscito",
      "googleCompletionFailedPrefix": "Google Impossibile completare l'accesso"
    },
    "online": {
      "seo": {
        "title": "Online Google Maps Scraper: esegui l'estrazione nel cloud | MapsGrab",
        "description": "Esegui ricerche per parole chiave Google Maps nel cloud, raccogli dati aziendali e scaricane una CSV per attività."
      },
      "hero": {
        "announce": {
          "badge": "Modalità 3",
          "text": "Parole chiave, un'area della mappa o intere regioni"
        },
        "title": {
          "lead": "Google Maps estrazione ",
          "accent": " nel cloud, ",
          "tail": " nessuna installazione"
        },
        "lead": "Invia parole chiave, raccogli i dettagli dell'attività nel cloud e scarica un CSV per attività dalla dashboard.",
        "primaryCta": "Avvia estrazione",
        "pricingCta": "Visualizza i prezzi",
        "meta": [
          "1,000 record gratuiti al mese",
          "Funziona con qualsiasi browser",
          "Un CSV deduplicato per attività"
        ],
        "theater": {
          "files": "1 CSV · Salvato nei download",
          "csv": "CSV",
          "processed": "Elaborato",
          "parallelChip": {
            "label": "Le parole chiave corrono",
            "value": "In parallelo"
          },
          "billingChip": {
            "label": "Fatturato da",
            "value": "Righe consegnate"
          }
        }
      },
      "facts": {
        "caption": "Il estrattore online in breve",
        "items": [
          {
            "value": 37,
            "label": "colonne pubbliche, incluso un numero di riga continuo"
          },
          {
            "value": 6,
            "label": "colonne del profilo social sui piani a pagamento"
          },
          {
            "value": 50,
            "label": "cercare posizioni per attività in modalità mappa"
          },
          {
            "value": 60,
            "suffix": " min",
            "label": "finestra di raccolta per ciascuna attività"
          },
          {
            "value": 1000,
            "label": "record gratuiti ogni mese"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Come funziona",
          "title": {
            "lead": "Da una rapida anteprima all'esportazione completa di ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Prova una parola chiave sulla home page senza un account. Quando desideri l'elenco completo, accedi ed eseguilo come attività nella dashboard."
        },
        "steps": [
          {
            "title": "Anteprima sulla homepage",
            "description": "Una parola chiave, nessun account. Scopri quante attività commerciali contiene la prima pagina dei risultati, con le prime righe 3."
          },
          {
            "title": "Registrazione",
            "description": "Le anteprime non vengono salvate e non utilizzano mai la tua quota. Dopo aver effettuato l'accesso, invii nuovamente la parola chiave."
          },
          {
            "title": "Crea l'attività",
            "description": "In Pannello › Estrattore online, inserisci una parola chiave per riga oppure lascia che l'elenco venga creato da un'area della mappa o da regioni."
          },
          {
            "title": "Le parole chiave vengono eseguite in parallelo",
            "description": "Seguire gli stati in coda, raccolta e preparazione CSV, quindi completato, successo parziale o fallito. Le attività attive si aggiornano ogni 5 secondi."
          },
          {
            "title": "Scaricamento",
            "description": "Scaricane uno CSV per l'intera attività quando è disponibile un file. Il successo parziale mantiene le righe consegnate; zero risultati non hanno file."
          }
        ],
        "lock": "Accedi per l'elenco completo",
        "email": "you@company.com",
        "links": {
          "preview": "Prova l'anteprima della home page",
          "dashboard": "Apri Pannello › Estrattore online"
        }
      },
      "modes": {
        "head": {
          "kicker": "Modalità di ricerca",
          "title": {
            "lead": "Tre modi per dire ",
            "accent": " dove cercare ",
            "tail": ""
          },
          "lead": "Digita le parole chiave riga per riga, campiona un'area della mappa attorno a un punto centrale o trasforma paesi, stati e città in query già pronte."
        },
        "tabsLabel": "Modalità di ricerca",
        "notes": {
          "keywords": "Una parola chiave per riga, fino al limite del tuo piano",
          "map": "Campiona un cerchio attorno a un punto centrale",
          "regions": "Paesi, stati e città da GeoNames"
        },
        "keywords": {
          "hint": "Una parola chiave per riga. Le righe vuote e i duplicati vengono eliminati prima del conteggio e l'intera attività produce un CSV deduplicato.",
          "blank": "Riga vuota · saltata",
          "duplicate": "Duplicato · saltato",
          "limitsTitle": "Parole chiave per attività",
          "limitsCaption": "dal piano online",
          "limitsHint": "L'avvio dello scraping rimane disabilitato mentre l'elenco è vuoto, oltre il limite del tuo piano o quando la tua quota mensile è esaurita."
        },
        "map": {
          "formula": "{keywords} parole chiave × {points} punti della griglia",
          "scale": "{value} km",
          "facts": [
            "I punti vengono cercati dal centro verso l'esterno.",
            "Il cerchio posiziona solo i centri di ricerca: i risultati non vengono ritagliati su di esso.",
            "Un'attività trovata tramite parole chiave o punti viene mantenuta una volta nell'attività."
          ]
        },
        "regions": {
          "hint": "È possibile modificare le query generate prima dell'invio. Ognuno conta come una parola chiave.",
          "addCity": "Aggiungi città"
        }
      },
      "results": {
        "head": {
          "kicker": "Risultati",
          "title": {
            "lead": "Un compito, ",
            "accent": " uno CSV ",
            "tail": ""
          },
          "lead": "Scarica 37 colonne pubbliche in una CSV per l'intera attività, con numeri di riga continui e attività deduplicate nelle ricerche."
        },
        "csvMeta": "1 CSV · {count} righe consegnate",
        "rows": "{count} righe",
        "searches": "Righe fornite dalla ricerca",
        "notes": [
          "La riga 1 contiene i nomi fissi delle colonne inglesi, inclusa la colonna # continua.",
          "La riga 2 descrive ciascuna colonna nella lingua dell'interfaccia utilizzata durante la creazione dell'attività.",
          "Le attività completate con zero risultati non hanno file. Il successo parziale mantiene le righe consegnate.",
          "La riga dell'etichetta non viene mai conteggiata nei tuoi record."
        ],
        "language": "Lingua dell’attività: italiano",
        "rowLabel": "Riga",
        "legend": {
          "fields": "Riga 1 · nomi dei campi",
          "labels": "Riga 2 · lingua del compito",
          "data": "Riga 3+ · imprese"
        },
        "more": "+{count} altre colonne",
        "csvLabels": {
          "#": "Numero di riga",
          "Name": "Nome dell'azienda",
          "Fulladdress": "Indirizzo completo",
          "Categories": "Categorie aziendali",
          "Phone": "Telefono principale",
          "Review Count": "Numero di recensioni",
          "Average Rating": "Voto medio delle recensioni",
          "Website": "Sito web aziendale",
          "Emails": "E-mail del sito Web pubblico",
          "Search Keyword": "Parola chiave di ricerca"
        }
      },
      "features": {
        "head": {
          "kicker": "Capacità",
          "title": {
            "lead": "Cosa fa il estrattore online ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Dettagli aziendali raccolti nel cloud, con email opzionali e profili social sui piani a pagamento."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Attività relative alle parole chiave",
            "description": "Invia tipi di attività e sedi come parole chiave separate. Il tuo piano determina il limite di parole chiave e la quota di record mensile.",
            "meta": "2 · 5 · 10 · 20 · 50 parole chiave per attività"
          },
          {
            "id": "history",
            "title": "Cronologia delle attività",
            "description": "Segui l'avanzamento delle attività e visualizza il conteggio dei record per ciascuna parola chiave nella dashboard.",
            "meta": "Completato · Parziale successo · Non riuscito"
          },
          {
            "id": "details",
            "title": "Dettagli aziendali",
            "description": "Raccogli nomi, indirizzi, numeri di telefono, siti web, valutazioni, orari, coordinate e identificatori di luogo quando disponibili.",
            "meta": "37 colonne pubbliche per azienda"
          },
          {
            "id": "enrichment",
            "title": "Email e arricchimento sociale",
            "description": "Con un piano online a pagamento, per impostazione predefinita nei siti Web aziendali vengono controllati gli indirizzi e-mail e i profili social. Puoi disattivarlo per ogni attività.",
            "meta": "Piani a pagamento · attivi per impostazione predefinita"
          },
          {
            "id": "downloads",
            "title": "Un compito CSV",
            "description": "Scarica l'intera attività come una CSV quando un file è disponibile. Non sono necessari file per ricerca.",
            "meta": "{job}.csv · 37 colonne"
          },
          {
            "id": "browser",
            "title": "Niente da installare",
            "description": "Funziona nel cloud da qualsiasi browser: Edge, Firefox o qualsiasi altro. Scarica i risultati dalla cronologia delle attività.",
            "meta": "Edge · Firefox · qualsiasi browser"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Utilizzo",
          "title": {
            "lead": "Fatturato dalle righe ",
            "accent": " ottieni effettivamente ",
            "tail": ""
          },
          "lead": "Le attività online vengono misurate in base alle righe aziendali consegnate una volta completata l'attività. Nulla viene messo da parte quando invii e la riga dell'etichetta in ogni CSV non viene mai conteggiata."
        },
        "checks": [
          "L'invio di un'attività non riserva nulla dalla tua quota",
          "Un'attività già in esecuzione termina, anche oltre la quota rimanente",
          "Una volta esaurita la quota, non è possibile inviare nuove attività",
          "L'utilizzo si ripristina il 1st tra New York; i record inutilizzati non vengono ripristinati"
        ],
        "mock": {
          "recordsLabel": "Record questo mese",
          "left": "{count} rimasto",
          "exhausted": "Quota esaurita",
          "task": "Compito {id}…",
          "pending": "Consegnato finora · conteggiato al completamento dell'attività",
          "counted": "Contato per questo mese",
          "rows": "{count} righe",
          "running": "Corsa",
          "delta": "+{count} record"
        }
      },
      "plans": {
        "head": {
          "kicker": "Piani di estrattore online",
          "title": {
            "lead": "Estrazione delle nuvole, ",
            "accent": " prezzato dai record ",
            "tail": ""
          },
          "lead": "Esegui il motore MapsGrab sulla nostra infrastruttura. Un record è una riga aziendale consegnata; i piani a pagamento includono e-mail e arricchimento sociale senza costi aggiuntivi."
        },
        "specs": {
          "keywords": "Parole chiave per attività",
          "contacts": "E-mail e social",
          "included": "Attivo per impostazione predefinita",
          "excluded": "Non incluso"
        },
        "note": "Pagamento una tantum che copre un mese naturale: i piani online non si rinnovano automaticamente. L'utilizzo si ripristina il 1st nel tempo New York e i record inutilizzati non vengono ripristinati.",
        "compare": "Confronta tutti i piani"
      },
      "faq": {
        "kicker": "Domande frequenti",
        "title": {
          "lead": "",
          "accent": "Domande frequenti",
          "tail": ""
        },
        "lead": "Le risposte brevi. Per il resto, il supporto è a una e-mail di distanza.",
        "contact": "Contatta l'assistenza",
        "items": [
          {
            "question": "In che modo il estrattore online è diverso dall'estensione?",
            "answer": "L'estensione raccoglie dati nel tuo browser. Estrattore online esegue attività basate su parole chiave nel cloud e fornisce i risultati alla tua dashboard."
          },
          {
            "question": "Da dove provengono i dati ed è legale raccoglierli?",
            "answer": "MapsGrab raccoglie solo le informazioni visualizzate pubblicamente su Google Maps: gli stessi dettagli che qualsiasi visitatore può leggere. Non accediamo ad account privati, contenuti riservati o dati non pubblici."
          },
          {
            "question": "In quali formati posso esportare?",
            "answer": "Le attività con risultati forniscono un UTF-8 CSV con colonne pubbliche 37, numeri di righe continue e due righe di intestazione. Le aziende vengono deduplicate in tutte le ricerche. Le attività senza risultati non hanno file."
          },
          {
            "question": "Quanto costa?",
            "answer": "Lo Scraper online segue i piani MapsGrab nella pagina dei prezzi, inclusa la quota mensile gratuita di record. I piani a pagamento aumentano i limiti quando ne hai bisogno di più."
          },
          {
            "question": "Ho bisogno di un piano a pagamento per email e profili social?",
            "answer": "Online Free non include l'arricchimento tramite e-mail o social media. I piani a pagamento online lo includono per impostazione predefinita e puoi disattivarlo per ogni attività. La scelta viene fissata una volta inviata l'attività."
          },
          {
            "question": "Per quanto tempo può essere eseguita un'attività?",
            "answer": "Ogni attività ha una finestra di raccolta di 60 minuti. Un successo parziale può consegnare le righe raccolte e tutti i messaggi di posta elettronica o i profili trovati. La cronologia mostra se è disponibile un CSV."
          },
          {
            "question": "L'anteprima della mia home page viene salvata quando accedo?",
            "answer": "No. L'anteprima della home page è una rapida occhiata che non viene memorizzata. Dopo aver effettuato l'accesso, apri Estrattore online nella tua Pannello e invia nuovamente la parola chiave come attività completa."
          }
        ]
      },
      "cta": {
        "kicker": "Inizia",
        "title": {
          "lead": "Metti in coda la tua prima attività cloud ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Invia parole chiave, segui l'avanzamento delle tue attività e scarica i dati aziendali dalla dashboard.",
        "primary": "Avvia estrazione",
        "secondary": "Visualizza i prezzi",
        "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
      }
    },
    "apiPage": {
      "switchLabel": "API punti finali",
      "switchItems": {
        "search": "Estrattore",
        "reviews": "Recensioni",
        "photos": "Foto"
      },
      "primaryCta": "Ottieni la chiave API",
      "pricingCta": "Visualizza i prezzi",
      "console": {
        "label": "Esempio API richiesta e risposta",
        "langLabel": "Richiedi lingua",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Richiesta di copia",
        "replay": "Richiesta di riproduzione",
        "ready": "Pronto",
        "composing": "Composizione della richiesta…",
        "sending": "Invio richiesta...",
        "done": "Risposta · 200 OK · application/json",
        "waiting": "// in attesa di risposta...",
        "response": "Risposta di esempio"
      },
      "endpoints": {
        "kicker": "Endpoint",
        "title": {
          "lead": "Una chiave.  ",
          "accent": "Tre",
          "tail": "."
        },
        "lead": "Cerca luoghi e passa il loro `fid` all’API di recensioni o foto. Le tre API condividono una chiave e la quota mensile di richieste.",
        "here": "Sei qui",
        "paramsLabel": "Parametri",
        "mcp": {
          "title": "Costruire con agenti IA?",
          "description": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP.",
          "link": "Esplora MCP"
        }
      },
      "chain": {
        "kicker": "Punti finali della catena",
        "title": {
          "lead": "",
          "accent": "Estrattore → Recensioni / Foto",
          "tail": ""
        },
        "lead": "Cerca luoghi e passa il loro `fid` all’API di recensioni o foto. Le tre API condividono una chiave e la quota mensile di richieste.",
        "label": "Cerca luoghi e passa il loro fid all’API di recensioni o foto. Le tre API condividono una chiave e la quota mensile di richieste.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 recensioni"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 recensioni"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 recensioni"
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
          "note": "In caso di successo, status è partial; reason spiega perché la raccolta si è fermata. reported_total è il numero indicato dalla fonte o null, non la dimensione verificata dell’album."
        }
      },
      "reference": {
        "kicker": "Riferimento",
        "title": {
          "lead": "Richiesta in ingresso, ",
          "accent": " JSON ",
          "tail": " uscita"
        },
        "lead": "Invia la tua chiave come `Authorization: Bearer YOUR_API_KEY` con un corpo JSON. Ogni risposta è racchiusa in `{code, data, msg}` e `code` 10000 significa successo.",
        "baseUrl": "Base URL",
        "copyBaseUrl": "Copia base URL",
        "request": "Richiesta",
        "response": "Risposta",
        "columns": {
          "parameter": "Parametro",
          "field": "Campo",
          "type": "Tipo",
          "description": "Descrizione",
          "example": "Esempio"
        },
        "required": "necessario",
        "groupsLabel": "Gruppi di campo",
        "notes": [
          {
            "icon": "gauge",
            "title": "Una richiesta per chiamata andata a buon fine",
            "description": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
          },
          {
            "icon": "key",
            "title": "A 401 significa controlla la chiave",
            "description": "Una chiave mancante o non valida restituisce HTTP 401. Altri errori restituiscono HTTP 200 con un diverso da 10000 `code` e un `msg`."
          },
          {
            "icon": "locate",
            "title": "La posizione è un pregiudizio, non un recinto",
            "description": "`ll` dice a Maps dove cercare. I luoghi al di fuori di tale visualizzazione possono comunque essere visualizzati."
          },
          {
            "icon": "target",
            "title": "Dai un nome al luogo",
            "description": "Inserisci una città, uno stato o ZIP in `q` — \"vicino a me\" non ha nulla a cui ancorarsi su un server."
          }
        ]
      },
      "plans": {
        "kicker": "API piani",
        "title": {
          "lead": "Accesso programmatico, ",
          "accent": " tariffato in base alle richieste ",
          "tail": ""
        },
        "lead": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
      },
      "faq": {
        "lead": "Le risposte brevi. Per il resto, il supporto è a una e-mail di distanza.",
        "contact": "Contatta l'assistenza"
      },
      "cta": {
        "kicker": "Inizia",
        "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps Estrattore API — Dati aziendali in JSON | MapsGrab",
        "description": "Lo MapsGrab API di estrazione restituisce i risultati di ricerca Google Maps come JSON: nome, indirizzo, telefono, sito web, valutazione, orari, coordinate, Place ID e fid, oltre a email e profili social su richiesta."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Estrattore ",
          "tail": " API"
        },
        "lead": "Invia una parola chiave su HTTPS e riceverai le aziende Google Maps come JSON: nome, indirizzo, telefono, sito web, valutazione, orari di apertura, coordinate, Place ID e fid, oltre a email e profili social su richiesta.",
        "meta": [
          "Piano gratuito: {quota}",
          "Una chiave per la ricerca e le recensioni",
          "JSON oltre HTTPS"
        ],
        "chips": [
          {
            "label": "Per posto",
            "value": "29 campi dati"
          },
          {
            "label": "Per pagina",
            "value": "Fino a 20 posti"
          }
        ]
      },
      "endpoint": {
        "name": "API di estrazione",
        "description": "Aziende per qualsiasi parola chiave e località opzionale: campi 29 per luogo, oltre a email e profili social con `extra`.",
        "link": "Esplora il estrattore API"
      },
      "caps": {
        "title": {
          "lead": "Cosa restituisce il estrattore ",
          "accent": " API ",
          "tail": ""
        },
        "lead": "Una parola chiave e una distorsione di posizione facoltativa in; i luoghi che una ricerca Google Maps mostra, come strutturati JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Cerca per parola chiave e posizione",
            "description": "Invia `q` con una distorsione di posizione `ll` opzionale. `page` imposta quante pagine di risultati raccogliere, 1–10, fino a 20 le inserisce ciascuna, tutto in un'unica risposta."
          },
          {
            "icon": "table",
            "title": "29 campi per posto",
            "description": "Nome, categorie, indirizzo completo, telefono, sito web, conteggio di valutazioni e recensioni, orari di apertura, coordinate, Place ID, CID, fid, proprietario e altro."
          },
          {
            "icon": "mail",
            "title": "Email e arricchimento sociale",
            "description": "Imposta `extra` su `true` per aggiungere `emails` e `medias`: profili Instagram, Facebook, YouTube, TikTok, LinkedIn e X presenti su ciascun sito Web aziendale."
          },
          {
            "icon": "braces",
            "title": "Pulito, prevedibile JSON",
            "description": "Campi snake_case in una busta `{code, data, msg}`. I valori Google Maps non vengono visualizzati come `null` o come elenco vuoto, mai come stringhe vuote."
          },
          {
            "icon": "layers",
            "title": "I dati parziali sono contrassegnati",
            "description": "Se alcuni dettagli non possono essere inseriti, ottieni comunque i posti, con `partial` impostato su `true` e `warnings` che dice cosa manca."
          },
          {
            "icon": "shield",
            "title": "Solo dati pubblici",
            "description": "I risultati contengono solo ciò che Google Maps mostra pubblicamente: gli stessi dettagli che qualsiasi visitatore può leggere."
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
            "description": "Cosa cercare, fino a 300 caratteri: un tipo di attività commerciale più un luogo, ad es. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Quante pagine di risultati raccogliere, da 1–10, fino a 20 posizioni ciascuna, tutte restituite in un'unica risposta. La raccolta si interrompe anticipatamente quando una pagina ha meno di 20 posti o niente di nuovo. Predefinito `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Lingua dei risultati, ad es. `en` o `fr`. Predefinito `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Distorsione di posizione opzionale come `@lat,lng,zoom`, zoom 0–21. Indica a Maps dove cercare; i risultati non vengono ritagliati in un raggio."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` aggiunge `emails` e `medias` ad ogni luogo. Predefinito `false`."
          }
        ],
        "groups": [
          {
            "label": "Identità",
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
            "label": "Contatto",
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
                "badge": "extra"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "extra"
              }
            ]
          },
          {
            "label": "Posizione",
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
            "label": "Valutazioni",
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
            "label": "Profilo",
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
            "label": "Pagina",
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
          "accent": "Domande frequenti",
          "tail": ""
        },
        "items": [
          {
            "question": "Cosa restituisce lo API di estrazione?",
            "answer": "JSON con un massimo di 20 posti per pagina raccolta. Ogni luogo ha campi 29: nome, categorie, indirizzo, telefono, sito web, valutazione, conteggio delle recensioni, orari di apertura, coordinate, Place ID, CID, fid e altro - oltre a email e profili social quando extra è vero."
          },
          {
            "question": "Come posso autenticarmi?",
            "answer": "Invia la tua chiave MapsGrab API come token al portatore nell'intestazione Authorization. Ogni account ha una chiave. Viene mostrato per intero solo quando lo generi e la generazione di una nuova chiave disabilita immediatamente quella vecchia."
          },
          {
            "question": "Come vengono conteggiate le richieste?",
            "answer": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
          },
          {
            "question": "Cosa fa la pagina?",
            "answer": "pagina è il numero di pagine di risultati da raccogliere in una chiamata, da 1 a 10. Ogni pagina aggiunge fino a 20 posti e la raccolta si interrompe presto quando Google Maps non contiene nulla di nuovo. Non è un numero di pagina."
          },
          {
            "question": "I dati sono pubblici?",
            "answer": "SÌ. API restituisce solo le informazioni visualizzate pubblicamente su Google Maps — gli stessi dettagli che qualsiasi visitatore può leggere. Non accede ad account privati ​​o dati non pubblici."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Inserisci i dati di Maps nella tua applicazione ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Una richiesta HTTP per ricerca, strutturata JSON nella risposta - per CRM, pipeline di dati e i tuoi prodotti."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Recensioni API di estrazione — Recensioni in JSON | MapsGrab",
        "description": "MapsGrab Recensioni API restituisce le recensioni pubbliche di un'attività Google Maps come JSON: valutazione, testo e traduzione, autore, data, foto delle recensioni e risposte del proprietario - fino a 60 per pagina con un cursore."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Recensioni ",
          "tail": " Estrattore API"
        },
        "lead": "Richiedi le recensioni pubbliche di qualsiasi attività Google Maps tramite il suo fid e ottieni la struttura JSON indietro: valutazione, testo e traduzione, autore, data, foto della recensione e risposte del proprietario - pagina per pagina con un cursore.",
        "meta": [
          "Piano gratuito: {quota}",
          "Fino a 60 recensioni per pagina",
          "JSON oltre HTTPS"
        ],
        "chips": [
          {
            "label": "Per pagina",
            "value": "Fino a 60 recensioni"
          },
          {
            "label": "Ordina per",
            "value": "Pertinenza · più recente · valutazione"
          }
        ]
      },
      "endpoint": {
        "name": "API delle recensioni",
        "description": "Recensioni pubbliche di un'attività per `fid` — fino a 60 per pagina, ordinate a modo tuo, sfogliate con un cursore.",
        "link": "Esplora le recensioni API"
      },
      "caps": {
        "title": {
          "lead": "Cosa restituisce ",
          "accent": " Recensioni API ",
          "tail": ""
        },
        "lead": "Ogni recensione pubblica di un'attività (valutazioni, testo, autori, foto e risposte del proprietario) è una pagina per richiesta.",
        "items": [
          {
            "icon": "review",
            "title": "Recensioni di fid",
            "description": "Rivolgiti a un'azienda tramite `fid` da qualsiasi risultato di API di estrazione, quindi passa indietro `next_cursor` per leggere la pagina successiva, fino a 60 recensioni ciascuna."
          },
          {
            "icon": "filter",
            "title": "Ordinato a modo tuo",
            "description": "`sort_by` restituisce per prime le recensioni più pertinenti (1), più recenti (2), con il punteggio più alto (3) o con il punteggio più basso (4)."
          },
          {
            "icon": "list",
            "title": "Testo, traduzione e date",
            "description": "Valutazione, testo della recensione, `translated_text` e `language`, con `published_at_ms` e relativa data per ogni recensione."
          },
          {
            "icon": "user",
            "title": "Dettagli dell'autore",
            "description": "Nome dell'autore e collegamento al profilo, numero di recensioni dell'autore e stato di Guida locale."
          },
          {
            "icon": "image",
            "title": "Foto e risposte del proprietario",
            "description": "`images` elenca la foto URLs allegata ad una recensione; `owner_response` riporta la risposta del proprietario e `owner_response_at_ms` è il momento."
          },
          {
            "icon": "shield",
            "title": "Solo dati pubblici",
            "description": "Solo le recensioni mostrate pubblicamente su Google Maps: lo stesso contenuto che qualsiasi visitatore può leggere."
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
            "description": "ID funzione aziendale, ad es. `0x5495…:0xbeb4…`. Ogni posto API di estrazione lo include."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "Il `next_cursor` della pagina precedente. Omettilo per la prima pagina."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` più rilevante · `2` più recente · `3` valutazione più alta · `4` valutazione più bassa. Predefinito `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Codice della lingua, ad es. `en`. Predefinito `en`."
          }
        ],
        "groups": [
          {
            "label": "Revisione",
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
            "label": "Autore",
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
            "label": "Risposta del proprietario",
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
            "label": "Pagina",
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
          "accent": "Domande frequenti",
          "tail": ""
        },
        "items": [
          {
            "question": "Come posso rivolgermi ad un business specifico?",
            "answer": "Con il suo fid, l'ID della funzione incluso in ogni luogo di API di estrazione. Il Finder gratuito Place ID legge anche FID da qualsiasi luogo Google Maps URL."
          },
          {
            "question": "Quali campi include una recensione?",
            "answer": "ID della recensione, valutazione, testo con relativa traduzione e lingua, ora di pubblicazione e relativa data, nome dell'autore, collegamento al profilo, conteggio delle recensioni e stato di Local Guide, foto allegate e risposta del proprietario con la sua ora."
          },
          {
            "question": "Quante recensioni posso raccogliere?",
            "answer": "Ogni richiesta restituisce una pagina contenente fino a 60 recensioni più un next_cursor. Ripassalo per leggere la pagina successiva; quando next_cursor è nullo, non ci sono più pagine."
          },
          {
            "question": "Come vengono conteggiate le richieste?",
            "answer": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
          },
          {
            "question": "I dati sono pubblici?",
            "answer": "SÌ. API restituisce solo le recensioni visualizzate pubblicamente su Google Maps: lo stesso contenuto che qualsiasi visitatore può leggere. Non accede ad account privati ​​o dati non pubblici."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Monitora le recensioni ",
          "accent": " in scala ",
          "tail": ""
        },
        "lead": "Cursor thread di revisione con pagine pulite JSON — per monitoraggio, ricerca e reporting."
      }
    },
    "photosApi": {
      "seo": {
        "title": "API delle foto — URL di foto pubbliche delle attività | MapsGrab",
        "description": "Ottieni in JSON gli URL delle foto pubbliche di un’attività tramite il suo fid. max_results limita la consegna; i risultati sono parziali e non garantiscono l’album completo."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Foto ",
          "tail": " API"
        },
        "lead": "Ottieni in JSON gli URL delle foto pubbliche di un’attività tramite il suo fid. max_results limita la consegna; i risultati sono parziali e non garantiscono l’album completo.",
        "meta": [
          "Piano gratuito: {quota}",
          "URL di foto pubbliche delle attività",
          " tariffato in base alle richieste "
        ],
        "chips": [
          {
            "label": "Consegna",
            "value": "partial"
          },
          {
            "label": "Quantità",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "API delle foto",
        "description": "Ottieni in JSON gli URL delle foto pubbliche di un’attività tramite il suo fid. max_results limita la consegna; i risultati sono parziali e non garantiscono l’album completo.",
        "link": "Esplora l’API di foto"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "API delle foto",
          "tail": ""
        },
        "lead": "URL di foto pubbliche delle attività",
        "items": [
          {
            "icon": "image",
            "title": "Foto tramite fid",
            "description": "Usa il `fid` della ricerca o di Place ID Finder. Ogni elemento di `photos` contiene l’`url` di una foto pubblica."
          },
          {
            "icon": "filter",
            "title": "Limita ogni richiesta",
            "description": "`max_results` è un intero positivo, con valore predefinito 200. Potrebbero essere restituite meno foto. Non sono disponibili pagine o cursori."
          },
          {
            "icon": "list",
            "title": "Controlla lo stato della consegna",
            "description": "In caso di successo, `status` è `partial`; `reason` spiega perché la raccolta si è fermata. `reported_total` è il numero indicato dalla fonte o `null`, non la dimensione verificata dell’album."
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
            "description": "FID dell’attività dalla ricerca o da Place ID Finder, nel formato `0x…:0x…`, con 12–20 cifre esadecimali per segmento."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Limite positivo della consegna, predefinito 200. Non garantisce quel numero di foto."
          }
        ],
        "groups": [
          {
            "label": "Foto",
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
            "label": "Consegna",
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
          "accent": "Domande frequenti",
          "tail": ""
        },
        "items": [
          {
            "question": "Come richiedo le foto di un’attività?",
            "answer": "Invia POST a /photos con fid e, facoltativamente, max_results. Usa la stessa chiave Bearer delle API di ricerca e recensioni."
          },
          {
            "question": "Riceverò l’album completo?",
            "answer": "In caso di successo, status è partial; reason spiega perché la raccolta si è fermata. reported_total è il numero indicato dalla fonte o null, non la dimensione verificata dell’album. max_results è un intero positivo, con valore predefinito 200. Potrebbero essere restituite meno foto. Non sono disponibili pagine o cursori."
          },
          {
            "question": "Come posso ottenere la fiducia di un'azienda?",
            "answer": "Ogni posto API di estrazione include il suo fid e il Finder Place ID gratuito legge FID da qualsiasi posto Google Maps URL."
          },
          {
            "question": "Come vengono conteggiate le richieste?",
            "answer": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
          },
          {
            "question": "I dati sono pubblici?",
            "answer": "SÌ. L'immagine URLs punta alle foto mostrate pubblicamente su Google Maps: le stesse immagini che qualsiasi visitatore può vedere."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Integra le foto delle attività nella tua app",
          "tail": ""
        },
        "lead": "Usa la tua chiave API per ottenere URL di foto pubbliche e lo stato della consegna."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps Estrattore MCP Server | MapsGrab",
        "description": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Connetti il ​​tuo agente",
      "hero": {
        "kicker": "MCPserver",
        "title": {
          "lead": "Google Maps Estrattore ",
          "accent": " MCP ",
          "tail": " Server"
        },
        "lead": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP.",
        "meta": [
          "Streamable HTTP",
          "Accedi con OAuth",
          "Piano gratuito: {quota}"
        ],
        "chips": [
          {
            "label": "Trasporto",
            "value": "Streamable HTTP"
          },
          {
            "label": "Risultati dello strumento",
            "value": "Strutturato JSON"
          }
        ]
      },
      "agent": {
        "label": "Esempio di sessione dell'agente: una domanda sulle attività commerciali locali, una chiamata allo strumento MapsGrab con risultati strutturati e la risposta dell'agente",
        "session": "Sessione dell'agente",
        "connected": "MCP server {server} connesso",
        "placeholder": "Chiedi informazioni su qualsiasi posto su Google Maps…",
        "thinking": "Pensiero…",
        "running": "corsa",
        "scenes": [
          {
            "prompt": "Trova dentisti ad Austin, TX con valutazione 4.8 o superiore ed elenca i loro numeri di telefono.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 posti",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 più posti"
              }
            ],
            "answer": [
              "Vengono valutati tre dei primi risultati 20 ",
              {
                "strong": "4.8 o superiore"
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
            "prompt": "Cosa dicono le persone nelle recensioni più recenti di Ember & Oak Coffee in Portland?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 luogo",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 recensioni",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Soprattutto ",
              {
                "strong": "5-stella"
              },
              " — le persone lodano l'espresso e il personale cordiale. L'unica nota ricorrente: ",
              {
                "strong": "i posti a sedere sono stretti nei fine settimana"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Quali idraulici a Chicago non elencano un sito web? Mettili in un tavolo.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 posti",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 più posti"
              }
            ],
            "answer": [
              {
                "strong": "4 di 20"
              },
              " non è elencato alcun sito web. I primi tre:"
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
            "prompt": "Estrai le recensioni con il punteggio più basso di Rose City Roasters e scrivi risposte educate.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 luogo",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 recensioni",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Le valutazioni più basse menzionano principalmente ",
              {
                "strong": "servizio lento nelle ore di punta"
              },
              ". ",
              {
                "strong": "2 del 3"
              },
              " non ho ancora la risposta del proprietario: ne ho redatto uno per ciascuno."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Utensili",
        "title": {
          "lead": "Cosa espone il server MCP ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Tre strumenti: Search / Reviews / Photos.",
        "kind": "Attrezzo",
        "returns": "Ritorni",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Cerca luoghi",
            "description": "Ricerche di parole chiave e località che restituiscono ciò che mostra una ricerca Google Maps: nomi, telefoni, valutazioni, orari, coordinate, ID luogo e FID.",
            "args": [
              {
                "name": "q",
                "description": "Parola chiave più città, stato o ZIP"
              },
              {
                "name": "page",
                "description": "Pagine dei risultati da raccogliere, 1–10 · fino a 20 posti ciascuna"
              },
              {
                "name": "hl",
                "description": "Lingua dei risultati, ad es. `en`"
              },
              {
                "name": "ll",
                "description": "Distorsione dalla posizione, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` aggiunge email e profili social"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Stessi dati del API di estrazione"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Elenca le recensioni",
            "description": "Valutazioni, testi di recensioni, autori, date, foto e risposte del proprietario per qualsiasi attività che il tuo agente sta esaminando.",
            "args": [
              {
                "name": "fid",
                "description": "Da qualsiasi risultato di ricerca"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` dall'ultima pagina; omettere per il primo"
              },
              {
                "name": "sort_by",
                "description": "1 rilevante · 2 più recente · 3 più alto · 4 più basso"
              },
              {
                "name": "hl",
                "description": "Lingua, ad es. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Stessi dati delle Recensioni API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Foto tramite fid",
            "description": "Ottieni in JSON gli URL delle foto pubbliche di un’attività tramite il suo fid. max_results limita la consegna; i risultati sono parziali e non garantiscono l’album completo.",
            "args": [
              {
                "name": "fid",
                "description": "FID dell’attività dalla ricerca o da Place ID Finder, nel formato `0x…:0x…`, con 12–20 cifre esadecimali per segmento."
              },
              {
                "name": "max_results",
                "description": "Limite positivo della consegna, predefinito 200. Non garantisce quel numero di foto."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Esplora l’API di foto"
          }
        ]
      },
      "flow": {
        "kicker": "Come si connette",
        "title": {
          "lead": "Un endpoint tra il tuo agente e i dati ",
          "accent": " di Maps in tempo reale ",
          "tail": ""
        },
        "lead": "Il tuo client si connette tramite Streamable HTTP e accede tramite il tuo browser. L'agente rileva gli strumenti, li richiama quando un prompt necessita di dati di Maps e rilegge JSON strutturato.",
        "label": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP clienti",
        "anyClient": "Qualsiasi cliente MCP",
        "toolsLabel": "Utensili",
        "hub": "MapsGrab MCP",
        "publicData": "Dati pubblici Google Maps",
        "resultLabel": "risultato",
        "results": [
          "20 posti",
          "60 recensioni",
          "2 Foto"
        ],
        "steps": [
          {
            "title": "Collegare",
            "description": "Aggiungi l'endpoint al tuo client, quindi accedi a MapsGrab tramite il browser."
          },
          {
            "title": "Scoprire",
            "description": "Il tuo agente elenca gli strumenti MapsGrab e i relativi schemi di input."
          },
          {
            "title": "Chiamata",
            "description": "Quando un prompt necessita di dati di Maps, l'agente chiama uno strumento e legge il risultato JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Impostare",
        "title": {
          "lead": "Un blocco di configurazione ",
          "accent": " per client ",
          "tail": ""
        },
        "lead": "Punta il tuo client all'endpoint MapsGrab e accedi tramite il browser: nessuna chiave API da copiare, nessun SDK, nessun processo locale da eseguire.",
        "tabsLabel": "MCP cliente",
        "copy": "Copia configurazione",
        "clients": {
          "claude": {
            "file": "terminale",
            "steps": [
              {
                "title": "Aggiungi il server",
                "description": "Esegui il comando per registrare `mapsgrab` su HTTP."
              },
              {
                "title": "Registrazione",
                "description": "In Claude Code, esegui `/mcp`, scegli `mapsgrab` ed esegui l'autenticazione: MapsGrab si apre nel tuo browser per l'approvazione."
              },
              {
                "title": "Richiedi i dati di Maps",
                "description": "Claude Code elenca gli strumenti MapsGrab e li chiama quando un prompt li richiede."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Modifica mcp.json",
                "description": "Aggiungi il blocco a `~/.cursor/mcp.json` per ogni progetto o `.cursor/mcp.json` per uno."
              },
              {
                "title": "Registrazione",
                "description": "In Impostazioni Cursor → MCP, fai clic su Connetti accanto a `mapsgrab` e approvalo nel tuo browser."
              },
              {
                "title": "Usa gli strumenti",
                "description": "`mapsgrab` mostra i suoi strumenti nell'elenco dei server MCP, pronti per l'agente."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Aggiungi .vscode/mcp.json",
                "description": "Incolla il blocco: contiene solo l'endpoint URL, niente di segreto."
              },
              {
                "title": "Registrazione",
                "description": "Avviare il server. VS Code chiede di autenticarsi con MapsGrab e apre il browser per approvare."
              },
              {
                "title": "Utilizza la modalità agente",
                "description": "Apri Chat in modalità agente e abilita gli strumenti MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "terminale",
            "steps": [
              {
                "title": "Aggiungi il server",
                "description": "Eseguire `codex mcp add` per registrare `mapsgrab` tramite URL."
              },
              {
                "title": "Registrazione",
                "description": "Esegui `codex mcp login mapsgrab` e approva MapsGrab nel tuo browser."
              },
              {
                "title": "Inizio Codex",
                "description": "Nuove sessioni caricano `mapsgrab` e i suoi strumenti."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Non riesci ad accedere da un browser? Utilizza una chiave API",
          "description": "Se il tuo client non supporta l'autorizzazione MCP o viene eseguito su un server o in CI, aggiungi invece la tua chiave API come intestazione `Authorization`. Conserva la chiave in una variabile di ambiente o nell'input segreto del tuo cliente, non in un file di configurazione condiviso.",
          "link": "Ottieni la chiave API",
          "snippet": "Qualsiasi cliente HTTP"
        },
        "spec": {
          "title": "Qualsiasi altro cliente MCP",
          "subtitle": "MCP Inspector incluso",
          "transport": "Trasporto",
          "transportValue": "Streamable HTTP",
          "endpoint": "Punto finale",
          "copyEndpoint": "Copia punto finale",
          "auth": "Aut",
          "authValue": "Accesso OAuth (fallback: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Suggerimenti di esempio",
        "title": {
          "lead": "Chiedi in un linguaggio semplice.  ",
          "accent": " Recupera le righe. ",
          "tail": ""
        },
        "lead": "Ricerca di potenziali clienti, ricerche di mercato locali, monitoraggio delle revisioni: descrivi il lavoro e il tuo agente deciderà quale strumento MapsGrab chiamare.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Prospezione",
              "quote": "\"Trova dentisti ad Austin, Texas con valutazione 4.8 o superiore ed elenca i loro numeri di telefono.\"",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Reputazione",
              "quote": "\"Riassumi ciò che dicono le persone nelle recensioni più recenti di Ember & Oak Coffee a Portland.\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Elenchi di lead",
              "quote": "\"Crea un elenco di studi di yoga a Denver con le loro e-mail e profili Instagram.\"",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Ricerche di mercato",
              "quote": "“Confronta le valutazioni e il numero delle recensioni per le caffetterie in Division St a Portland.”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Arricchimento",
              "quote": "\"Aggiungi Place ID, telefono e sito web per ogni azienda in questo foglio di calcolo.\"",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Il proprietario risponde",
              "quote": "\"Estrai le recensioni con il punteggio più basso di Rose City Roasters e redigi risposte educate.\"",
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
              "tag": "Lacune del sito web",
              "quote": "\"Quali idraulici a Chicago non elencano un sito web? Mettili in una tabella.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Orari di apertura",
              "quote": "“Quali autofficine vicino a 60614 sono aperte la domenica?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Mappatura",
              "quote": "\"Esporta i ristoranti vegani a Brooklyn con coordinate come GeoJSON.\"",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Localizzazione",
              "quote": "\"Cerca panetterie a Lione e restituisci i dettagli dell'elenco in francese.\"",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Elenchi rivendicati",
              "quote": "\"Controlla quali palestre di Austin hanno rivendicato la loro scheda di attività commerciale Google.\"",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Guide locali",
              "quote": "\"Quali recensioni recenti di Hawthorne Bean Co. provengono da Local Guides?\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Tempo di risposta",
              "quote": "\"Questi saloni rispondono alle loro recensioni e quanto tempo impiegano i proprietari per rispondere?\"",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Aut. e dati",
        "title": {
          "lead": "Accedi una volta. ",
          "accent": "Solo dati pubblici.",
          "tail": ""
        },
        "lead": "Ogni chiamata all'endpoint MCP trasporta una credenziale al portatore (un token OAuth dall'accesso o la chiave API se il cliente non riesce ad accedere) e ogni risultato deriva da ciò che Google Maps mostra pubblicamente.",
        "inspector": {
          "label": "Esempio di richiesta MCP con un'intestazione al portatore Authorization e la relativa risposta JSON-RPC con contenuto strutturato",
          "request": "Richiesta",
          "response": "Risposta",
          "verified": "Gettone verificato"
        },
        "items": [
          {
            "icon": "key",
            "title": "Accedi o torna a una chiave",
            "description": "Accedi tramite il browser e approva il cliente. I client senza autorizzazione MCP possono invece passare la tua chiave API come token al portatore: entrambi raggiungono gli stessi strumenti."
          },
          {
            "icon": "eye",
            "title": "Legge Google Maps, non scrive mai",
            "description": "Gli strumenti cercano e leggono solo elenchi pubblici. L'unica cosa che cambia una chiamata è l'utilizzo della richiesta."
          },
          {
            "icon": "lock",
            "title": "Nessun segreto nei file di configurazione",
            "description": "Con l'accesso, la configurazione contiene solo l'endpoint URL. Se usi una chiave API, mantienila in una variabile di ambiente, non in un file condiviso."
          },
          {
            "icon": "shield",
            "title": "Revoca l'accesso in qualsiasi momento",
            "description": "I clienti registrati sono elencati in Pannello → API, dove puoi revocarli. La generazione di una nuova chiave API disabilita immediatamente quella vecchia."
          }
        ]
      },
      "billing": {
        "kicker": "Prezzi",
        "title": {
          "lead": "Coperto dal tuo piano ",
          "accent": " API ",
          "tail": ""
        },
        "lead": "Il server MCP attinge dalla stessa quota di richieste mensili dello API di estrazione e delle Recensioni API. Ogni chiamata allo strumento riuscita conta come una richiesta.",
        "compare": "Confronta i piani API",
        "head": {
          "plan": "Piano",
          "requests": "Richieste mensili",
          "scale": "(scala logaritmica)",
          "price": "Prezzo"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Domande frequenti",
          "tail": ""
        },
        "items": [
          {
            "question": "Cos'è il server MapsGrab MCP?",
            "answer": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP. search_places / list_reviews / list_photos."
          },
          {
            "question": "Quali client possono connettersi?",
            "answer": "Qualsiasi client MCP che supporti Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector e altri. Utilizza l'endpoint URL esattamente come mostrato, inclusa la barra finale."
          },
          {
            "question": "Come viene autenticato?",
            "answer": "Con l'accesso a OAuth: Claude Code, Cursor, VS Code, Codex e altri client che supportano l'autorizzazione MCP aprono MapsGrab nel tuo browser; approvi il cliente e puoi revocarlo successivamente in Pannello → API. Solo se il tuo cliente non riesce ad accedere, passa la tua chiave API come token al portatore nell'intestazione Authorization."
          },
          {
            "question": "Come vengono conteggiate le chiamate agli strumenti?",
            "answer": "Ogni chiamata riuscita conta come una richiesta, anche per una consegna parziale di foto, indipendentemente dal numero. Se non è possibile consegnare foto valide, la chiamata fallisce e non consuma quota. Ricerca, recensioni, foto e MCP condividono la quota mensile."
          },
          {
            "question": "Il mio agente può ottenere foto aziendali?",
            "answer": "list_photos(fid, max_results): Ottieni in JSON gli URL delle foto pubbliche di un’attività tramite il suo fid. max_results limita la consegna; i risultati sono parziali e non garantiscono l’album completo. Limite positivo della consegna, predefinito 200. Non garantisce quel numero di foto."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Fornisci al tuo agente ",
          "accent": " i dati di Maps in tempo reale ",
          "tail": ""
        },
        "lead": "Cerca luoghi su Google Maps, leggi recensioni e ottieni URL di foto pubbliche delle attività con una connessione MCP."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Strumenti gratuiti",
        "guide": {
          "kicker": "Informazioni su questo strumento",
          "title": {
            "lead": "Cosa fa e ",
            "accent": " come usarlo ",
            "tail": ""
          },
          "lead": "Tutto viene eseguito nel tuo browser: nulla di ciò che incolli o carichi lascia il tuo dispositivo."
        },
        "related": {
          "kicker": "Strumenti correlati",
          "title": {
            "lead": "Altri strumenti gratuiti per ",
            "accent": " Dati mappe ",
            "tail": ""
          },
          "lead": "Piccole utilità che vengono eseguite interamente nel tuo browser: ciò che incolli non lascia mai il tuo dispositivo."
        },
        "faq": {
          "kicker": "Domande frequenti",
          "lead": "Le risposte brevi. Per il resto, il supporto è a una e-mail di distanza.",
          "contact": "Contatta l'assistenza"
        },
        "cta": {
          "kicker": "Estrazione in massa",
          "primary": "Installa MapsGrab",
          "secondary": "Visualizza i prezzi",
          "note": "Quota mensile gratuita inclusa. Nessuna carta di credito."
        },
        "resultHeading": "Risultato",
        "copy": "Copia",
        "copied": "Copiato negli appunti.",
        "downloadCsv": "Scarica CSV",
        "genericError": "Qualcosa è andato storto. Controlla i tuoi input e riprova."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder — Ottieni un Google Maps Place ID da un URL | MapsGrab",
          "description": "Incolla un Google Maps posto URL e ottieni immediatamente i suoi Place ID, CID e FID. Ricerca Place ID gratuita basata su browser: nessun accesso, il tuo URL non si allontana mai dal tuo dispositivo."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": " Cercatore ",
            "tail": ""
          },
          "description": "Incolla un Google Maps intero posto URL e leggi i suoi Place ID, CID e FID con un clic. Tutto viene decodificato nel tuo browser: URL non viene mai caricato."
        },
        "form": {
          "urlLabel": "Google Maps luogo URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Trova Place ID",
          "errorShortLink": "I collegamenti brevi (maps.app.goo.gl) non sono supportati. Apri il collegamento nel tuo browser e incolla l'intero URL dalla barra degli indirizzi.",
          "errorInvalidUrl": "Questo non sembra un posto Google Maps URL. Apri un luogo in Google Maps e copia l'intero URL (dovrebbe contenere \"/maps/place/\" e \"@\" o \"data=\").",
          "errorNoIds": "Nessun identificatore di luogo trovato in questo URL. Assicurati di aver copiato URL di una pagina di luogo, non di una pagina di risultati di ricerca.",
          "examplesLabel": "Tentativo",
          "examples": {
            "city": "San Francisco",
            "business": "Caffetteria · Portland",
            "shortLink": "Collegamento breve"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url delle due metà FID",
          "cidNote": "FID 2seconda metà, esadecimale → decimale",
          "fidNote": "ultimi due segmenti 0x… nel URL",
          "anatomy": {
            "fidHigh": "FID · 1primo tempo",
            "fidLow": "FID · 2seconda metà",
            "empty": "Incolla un luogo URL: gli identificatori che porta si illuminano qui."
          },
          "missing": "Non in questo collegamento",
          "copyLabel": "Copia {label}",
          "privacy": "Decodificato nel tuo browser: URL non viene mai caricato."
        },
        "chips": [
          {
            "label": "Tasto Google API",
            "value": "Non necessario"
          },
          {
            "label": "Il tuo URL",
            "value": "Mai caricato"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Come funziona",
            "title": {
              "lead": "Da un collegamento Mappe a un ",
              "accent": " Place ID ",
              "tail": ""
            },
            "lead": "Nessuna chiave API e nessun accesso: gli identificatori sono già all'interno del luogo URL che copi."
          },
          "items": [
            {
              "heading": "Apri il locale tra Google Maps",
              "body": "Cerca l'attività e fai clic sulla sua scheda per aprire la pagina del luogo."
            },
            {
              "heading": "Copia l'intero URL",
              "body": "Copia il lungo URL dalla barra degli indirizzi: contiene il nome dell'azienda, un segmento di coordinate \"@\" e un parametro \"data=\"."
            },
            {
              "heading": "Incolla e decodifica",
              "body": "Incollalo sopra e premi \"Trova Place ID\". Vengono visualizzati Place ID, CID e FID, ciascuno con un pulsante di copia."
            }
          ],
          "copiedBadge": "Copiato",
          "note": "I collegamenti brevi come maps.app.goo.gl non possono essere decodificati senza seguirli attraverso i domini, quindi apri prima il collegamento e incolla l'indirizzo completo."
        },
        "identifiers": {
          "head": {
            "kicker": "Gli identificatori",
            "title": {
              "lead": "Tre ID, ",
              "accent": " un posto ",
              "tail": ""
            },
            "lead": "Un Place ID è l'identificatore stabile di Google per una sede: una stringa che inizia con \"ChIJ\" che rimane valida anche se l'attività cambia nome o si sposta."
          },
          "keys": {
            "placeId": "La stringa \"ChIJ…\" utilizzata da Luoghi API, widget di recensione e sistemi di prenotazione.",
            "fid": "Una coppia di valori esadecimali che identificano internamente la stessa funzionalità.",
            "cid": "La forma decimale della seconda metà di FID, utilizzata dalle mappe precedenti URLs e dagli strumenti pubblicitari."
          },
          "derive": {
            "label": "Come Place ID e CID derivano da FID",
            "source": "FID dal URL",
            "protobuf": "protobuf · little-endian",
            "base64": "base64url",
            "secondHalf": "2seconda metà",
            "hexToDecimal": "esadecimale → decimale"
          },
          "features": [
            {
              "heading": "Nessun tasto API",
              "body": "Place ID è già codificato nel posto URL che incolli, quindi lo strumento può decodificarlo offline."
            },
            {
              "heading": "Nessun limite di tariffa",
              "body": "Non è coinvolto alcun servizio di ricerca: la conversione da Maps URL a Place ID è deterministica."
            },
            {
              "heading": "Mai caricato",
              "body": "L'intero calcolo viene eseguito nella scheda del tuo browser: il URL che incolli non viene mai inviato a nessun server."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Un Place ID cambia mai?",
              "answer": "Raramente. Google documenti Place ID come identificatori stabili a lungo termine, ma un piccolo numero di ID può essere ritirato quando le sedi vengono unificate o ristrutturate. Se un consumatore di un Place ID lo segnala come non valido, cerca di nuovo la posizione e aggiorna il valore memorizzato."
            },
            {
              "question": "Place ID è uguale a CID?",
              "answer": "No. CID è un identificatore decimale utilizzato dai collegamenti di Maps e dagli strumenti pubblicitari più vecchi, mentre Place ID è la stringa \"ChIJ…\" consumata dai Luoghi API. Identificano la stessa caratteristica ma non sono intercambiabili, motivo per cui questo strumento li segnala entrambi."
            },
            {
              "question": "Perché il mio collegamento maps.app.goo.gl viene rifiutato?",
              "answer": "I collegamenti brevi si risolvono nella posizione completa URL dopo un reindirizzamento interdominio, che uno strumento solo per browser non può seguire senza inviare il collegamento a terzi. Apri il collegamento breve nel tuo browser e incolla l'intero URL che appare nella barra degli indirizzi."
            },
            {
              "question": "Ho bisogno di una chiave Google API per questo?",
              "answer": "No. Place ID è già codificato nel posto URL che incolli, quindi lo strumento può decodificarlo offline. Un tasto Google API è necessario solo quando successivamente si desidera chiamare i Luoghi API con l'ID."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Hai bisogno di ID luogo ",
            "accent": " su larga scala? ",
            "tail": ""
          },
          "lead": "MapsGrab estrae Place ID, CID e FID per ogni azienda che raccoglie - insieme a 33 altre colonne - ed esporta direttamente in CSV o JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Generatore di link per recensioni — Recensione diretta gratuita URL | MapsGrab",
          "description": "Trasforma un luogo Google Maps URL in un link diretto alle recensioni Google che puoi condividere con i clienti. Gratuito, basato su browser e non viene caricato nulla."
        },
        "hero": {
          "title": {
            "lead": "Google Link di revisione ",
            "accent": " Generatore ",
            "tail": ""
          },
          "description": "Incolla un luogo Google Maps URL e ottieni il link diretto \"scrivi una recensione\" per quell'attività: il percorso più breve da un cliente soddisfatto a una recensione Google."
        },
        "form": {
          "urlLabel": "Google Maps luogo URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Genera collegamento di revisione",
          "errorShortLink": "I collegamenti brevi (maps.app.goo.gl) non sono supportati. Apri il collegamento nel tuo browser e incolla l'intero URL dalla barra degli indirizzi.",
          "errorInvalidUrl": "Questo non sembra un posto Google Maps URL. Apri un luogo in Google Maps e copia l'intero URL (dovrebbe contenere \"/maps/place/\" e \"@\" o \"data=\").",
          "errorNoIds": "Nessun identificatore di luogo trovato in questo URL. Assicurati di aver copiato URL di una pagina di luogo, non di una pagina di risultati di ricerca."
        },
        "result": {
          "linkLabel": "Collegamento per la revisione",
          "open": "Aprire"
        },
        "howTo": [
          {
            "heading": "Cos'è un link di recensione Google?",
            "body": "Un collegamento per la recensione è una scorciatoia che apre la finestra di dialogo per la revisione di un'attività specifica il Google. Invece di chiedere ai clienti di cercare la tua attività, scorri fino alla sezione delle recensioni e premi \"Scrivi una recensione\", ne invii una URL — search.google.com/local/reviews?placeid=… — che arriva direttamente nel modulo di recensione. Le aziende inseriscono questi collegamenti nelle e-mail di follow-up, nei codici QR allo sportello e nei messaggi SMS post-transazione."
          },
          {
            "heading": "Come generare un collegamento di recensione",
            "body": "Apri Google Maps, trova la tua attività e apri la relativa pagina del luogo. Copia il lungo URL dalla barra degli indirizzi e incollalo sopra. Premi \"Genera collegamento recensione\" e lo strumento creerà il collegamento diretto con l'ID del luogo codificato, pronto per essere copiato o aperto. Il collegamento è universale: funziona sui browser desktop e sull'app mobile Google Maps."
          },
          {
            "heading": "Da dove proviene l'ID del luogo",
            "body": "Lo strumento riutilizza la stessa decodifica locale del Finder Place ID: l'identificatore è già presente nelle Mappe URL, e la conversione nella forma \"ChIJ…\" avviene interamente nel tuo browser. Se gestisci più sedi, ripeti la procedura per ogni luogo oppure lascia che MapsGrab riporti la colonna Place ID in ogni esportazione in modo che i link alle recensioni possano essere generati in blocco da un foglio di calcolo."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "I link per le recensioni scadono?",
              "answer": "No. Il collegamento è legato all'ID della località, che Google rimane stabile. Finché il luogo esiste su Google Maps, il collegamento continua ad aprire la finestra di dialogo di revisione."
            },
            {
              "question": "Posso utilizzare un collegamento per più sedi?",
              "answer": "Ogni collegamento alla recensione appartiene esattamente a un luogo. Genera un collegamento separato per sede: le aziende con più sedi di solito mantengono una tabella di ID luogo e da essa ricavano i collegamenti."
            },
            {
              "question": "È consentito chiedere recensioni con un link?",
              "answer": "Chiedere ai clienti recensioni oneste va bene; incentivare o filtrare le recensioni non lo è. La politica di Google vieta il compenso per le recensioni e il controllo delle recensioni: invia lo stesso collegamento a ogni cliente e lascia che il feedback parli da solo."
            },
            {
              "question": "Perché il mio collegamento apre una pagina di ricerca invece del modulo di revisione?",
              "answer": "Ciò accade quando l'ID del luogo nel collegamento è sbagliato, solitamente il risultato di un URL modificato manualmente. Rigenera il collegamento dal luogo originale di Maps URL e verifica che Place ID inizi con \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Tieni traccia di ogni recensione che ",
            "accent": " guadagni ",
            "tail": ""
          },
          "lead": "MapsGrab raccoglie le recensioni di qualsiasi pagina aziendale (valutazione, testo, data e risposte del proprietario) in modo da poter visualizzare i feedback e rispondere più rapidamente."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Controllo e-mail: validatore gratuito del formato e-mail | MapsGrab",
          "description": "Controlla immediatamente un indirizzo e-mail per eventuali errori di sintassi e errori di battitura comuni. Convalida del formato libero eseguita nel tuo browser: nessun sondaggio SMTP, nulla viene inviato da nessuna parte."
        },
        "hero": {
          "title": {
            "lead": "Invia un'e-mail a ",
            "accent": " Controllore ",
            "tail": ""
          },
          "description": "Digita un indirizzo email e verifica immediatamente se il suo formato è valido, oltre a suggerimenti per gli errori di battitura più comuni. Tutto funziona nel tuo browser."
        },
        "form": {
          "emailLabel": "Indirizzo e-mail",
          "emailPlaceholder": "name@example.com",
          "submit": "Verifica l'e-mail",
          "validHeading": "Questo indirizzo email sembra valido.",
          "invalidHeading": "Questo indirizzo email presenta problemi:",
          "issues": {
            "empty": "Inserisci prima un indirizzo email.",
            "multipleAt": "L'indirizzo contiene più di un simbolo \"@\".",
            "missingAt": "All'indirizzo manca la \"@\" che separa la parte locale dal dominio.",
            "localEmpty": "La parte prima di \"@\" è vuota.",
            "localTooLong": "La parte prima della \"@\" è più lunga dei 64 caratteri consentiti dagli standard di posta elettronica.",
            "localInvalidChars": "La parte prima di \"@\" contiene caratteri non consentiti negli indirizzi email (spazi, virgolette o caratteri di controllo).",
            "localDotPosition": "I punti nella parte locale non possono essere i primi, gli ultimi o apparire due volte di seguito.",
            "domainEmpty": "La parte dopo \"@\" è vuota.",
            "domainNoTld": "Il dominio non ha finale (TLD): aggiungi qualcosa come \".com\" o \".org\".",
            "domainInvalidChars": "Il dominio contiene caratteri non consentiti (spazi, trattini bassi o simboli).",
            "domainLabelHyphen": "Le etichette di dominio non possono iniziare o terminare con un trattino.",
            "domainEmptyLabel": "Il dominio contiene due punti in fila o un segmento vuoto.",
            "domainTooLong": "Il dominio è più lungo dei 253 caratteri consentiti dagli standard di posta elettronica.",
            "typoDomain": "Questo dominio sembra un errore di battitura di un popolare provider di posta."
          }
        },
        "howTo": [
          {
            "heading": "Cosa fa questo controllore e cosa deliberatamente non fa",
            "body": "Questo strumento valida il formato di un indirizzo email: la forma della parte locale, la \"@\", e il dominio, seguendo le regole pratiche delle specifiche RFC che i server di posta effettivamente applicano. Segnala inoltre i probabili errori di battitura dei provider di caselle postali più diffusi, la causa più comune di indirizzi non più attivi negli elenchi dei lead. Non invia alcuna sonda al server di posta: la verifica SMTP rivelerebbe l'indirizzo a terzi, il che è in conflitto con l'esecuzione dell'intero controllo localmente nel tuo browser."
          },
          {
            "heading": "Come controllare un indirizzo email",
            "body": "Digita o incolla l'indirizzo e premi \"Verifica email\". Un risultato verde significa che il formato ha la forma di un deliverable; un risultato rosso elenca tutte le regole infrante dall'indirizzo e, quando il dominio sembra un provider con errori di ortografia, suggerisce quello previsto. Risolvi i problemi segnalati e verifica di nuovo finché l'indirizzo non viene superato."
          },
          {
            "heading": "Dove il controllo del formato si inserisce in un flusso di lavoro dei dati",
            "body": "La convalida del formato è il primo filtro più economico per qualsiasi lista di posta elettronica: rimuove gli indirizzi che non potranno mai raggiungere una casella di posta prima che tu abbia speso su di essi il budget per la consegna o l'arricchimento. MapsGrab applica questo pensiero all'intero flusso di lavoro dei lead: l'estensione arricchisce ogni azienda raccolta con gli indirizzi e-mail trovati sul suo sito Web ufficiale, quindi la fase di verifica a valle inizia da un elenco molto più pulito."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Questo strumento verifica se la casella di posta esiste davvero?",
              "answer": "No, deliberatamente. Per verificare l'esistenza è necessario interrogare il server di posta del destinatario (SMTP sondaggio), cosa che non può essere eseguita privatamente in un browser e può far contrassegnare il tuo IP. Questo strumento verifica tutto ciò che può essere verificato senza toccare la rete: struttura, caratteri consentiti ed errori di battitura comuni dei provider."
            },
            {
              "question": "Può un indirizzo passare qui e rimbalzare comunque?",
              "answer": "SÌ. Un indirizzo sintatticamente perfetto può comunque essere chiuso, completo o abbandonato. La convalida del formato rimuove gli indirizzi errati prima ancora che venga tentata la consegna: non può garantire che una casella di posta dall'aspetto valido venga letta da un essere umano."
            },
            {
              "question": "Perché \"nome@localhost\" viene rifiutato?",
              "answer": "Il controllo richiede un dominio con un suffisso pubblico (TLD) perché gli indirizzi senza uno non possono ricevere posta da Internet esterno. Gli standard che consentono domini solo interni sono irrilevanti per gli elenchi di lead e i dati dei clienti."
            },
            {
              "question": "Il mio input è archiviato da qualche parte?",
              "answer": "No. La convalida viene eseguita semplicemente JavaScript nella scheda del browser; nulla viene trasmesso, registrato o memorizzato: ricarica la pagina e l'input scompare."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Raccogli le email che valgono ",
            "accent": " verificando ",
            "tail": ""
          },
          "lead": "MapsGrab trova gli indirizzi email e i profili social dietro ogni attività che estrae, direttamente dal sito Web di ciascuna azienda."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Converti Lat Long in DMS — Gradi decimali in Gradi Minuti Secondi | MapsGrab",
          "description": "Converti istantaneamente latitudine e longitudine decimale nel formato gradi, minuti, secondi (DMS). Convertitore di coordinate gratuito basato su browser, nulla caricato."
        },
        "hero": {
          "title": {
            "lead": "Converti Lat Long in ",
            "accent": " DMS ",
            "tail": ""
          },
          "description": "Inserisci latitudine e longitudine decimali e leggi le stesse coordinate in gradi, minuti, secondi, con lettere dell'emisfero, pronte per essere copiate."
        },
        "form": {
          "latitudeLabel": "Latitudine (decimale, da -90 a 90)",
          "longitudeLabel": "Longitudine (decimale, da -180 a 180)",
          "placeholder": "37.774929",
          "submit": "Converti in DMS",
          "errorLatitude": "La latitudine deve essere un numero compreso tra -90 e 90.",
          "errorLongitude": "La longitudine deve essere un numero compreso tra -180 e 180."
        },
        "result": {
          "dms": "Coordinate in DMS"
        },
        "howTo": [
          {
            "heading": "Cosa sono i gradi decimali e DMS?",
            "body": "Mappe e fogli di calcolo memorizzano le coordinate come gradi decimali: un numero con segno per asse, come 37.774929, -122.419416. Topografia, carte nautiche e molti documenti di proprietà utilizzano la vecchia notazione sessagesimale: gradi, minuti e secondi con lettere dell'emisfero, come 37° 46' 29.74\" N, 122° 25' 9.90\" W. Entrambi descrivono lo stesso punto; la forma DMS divide semplicemente la frazione in unità successivamente più piccole, dove un minuto è 1/60 grado e un secondo è 1/60 minuto."
          },
          {
            "heading": "Come convertire",
            "body": "Incolla la latitudine e la longitudine decimali e premi \"Converti in DMS\". I valori negativi vengono mappati negli emisferi sud e ovest e sono segnalati come S e O. I secondi sono mostrati con due decimali: circa un metro di risoluzione al suolo, più precisa di qualsiasi acquisizione GPS consumer. Copia il risultato come una singola riga per i documenti o come campi separati per i fogli di calcolo."
          },
          {
            "heading": "Perché questo è importante per il funzionamento dei dati delle mappe",
            "body": "I viaggi di andata e ritorno delle coordinate rappresentano un punto di attrito quotidiano quando si spostano i dati aziendali tra strumenti: Google Maps esporta decimali, mentre i flussi di lavoro catastali e di stampa prevedono DMS. MapsGrab mantiene questo attrito basso su larga scala: ogni attività estratta porta già la sua latitudine e longitudine nell'esportazione e le conversioni di coordinate batch possono essere eseguite offline con la stessa formula utilizzata da questa pagina."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Quanto è preciso il risultato DMS?",
              "answer": "I secondi vengono visualizzati con due decimali. Un secondo di latitudine corrisponde a circa 30 metri, quindi due decimali si risolvono in circa 30 centimetri, molto più stretti rispetto ai dati GPS sottostanti. La precisione è limitata dal tuo input, non dalla conversione."
            },
            {
              "question": "Cosa significano qui N, S, E e W?",
              "answer": "Sostituiscono il segno del valore decimale: le latitudini positive sono il nord (N) e quelle negative il sud (S); le longitudini positive sono est (E) e negative sono ovest (W). Lo strumento seleziona automaticamente le lettere dal segno."
            },
            {
              "question": "Posso riconvertire DMS in decimale qui?",
              "answer": "Sì: utilizza lo strumento complementare \"Converti DMS in DD\" su questo sito. La conversione in entrambi i modi con la stessa implementazione evita la deriva dell'arrotondamento tra formule diverse."
            },
            {
              "question": "I miei dati di coordinate sono caricati?",
              "answer": "No. La conversione è semplicemente aritmetica nella scheda del browser; nulla di ciò che scrivi lascia la pagina."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Coordinate per ogni attività commerciale, già ",
            "accent": " estratto ",
            "tail": ""
          },
          "lead": "MapsGrab scrive latitudine e longitudine in ogni riga che esporta: nessuna ricerca manuale delle coordinate per il tuo prossimo progetto di percorso o territorio."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Converti DMS in DD — Gradi Minuti Secondi in Gradi decimali | MapsGrab",
          "description": "Converti istantaneamente le coordinate di gradi, minuti e secondi in gradi decimali. Convertitore gratuito da DMS a DD basato su browser, nulla caricato."
        },
        "hero": {
          "title": {
            "lead": "Converti DMS in DD ",
            "accent": " (latitudine, longitudine) ",
            "tail": ""
          },
          "description": "Inserisci gradi, minuti e secondi per entrambi gli assi e ottieni gradi decimali puliti: il formato Google Maps, i fogli di calcolo e MapsGrab comprendono."
        },
        "form": {
          "latitudeHeading": "Latitudine (N/S)",
          "longitudeHeading": "Longitudine (E/O)",
          "degreesLabel": "Gradi",
          "minutesLabel": "Minuti d’arco",
          "secondsLabel": "Secondi d’arco",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Converti in decimale",
          "errorValues": "I gradi devono essere zero o un numero intero positivo, i minuti e i secondi devono essere compresi tra 0 e 60."
        },
        "result": {
          "dd": "Coordinate in gradi decimali"
        },
        "howTo": [
          {
            "heading": "Perché convertire DMS in gradi decimali?",
            "body": "Gradi-minuti-secondi è una notazione rivolta all'uomo, ma praticamente ogni sistema rivolto alle macchine richiede gradi decimali: ricerca Google Maps, importazioni GIS, formule di distanza di fogli di calcolo e pipeline di geocodifica. La conversione è una semplice somma ponderata - gradi più minuti divisi per 60 più secondi divisi per 3600 - con la lettera dell'emisfero che decide il segno."
          },
          {
            "heading": "Come convertire",
            "body": "Inserisci gradi, minuti e secondi per latitudine e longitudine e scegli le lettere dell'emisfero (N/S ed E/O). Premi \"Converti in decimale\" e lo strumento emette entrambi gli assi come numeri decimali con segno con sei cifre decimali, che si risolvono in circa 11 centimetri sul terreno, più che sufficienti per qualsiasi utilizzo in una sede aziendale. Incolla il risultato direttamente in Google Maps o nel tuo foglio di calcolo."
          },
          {
            "heading": "Mantenere coerenti i dati delle coordinate",
            "body": "Le notazioni miste sono il motivo abituale per cui le posizioni finiscono nell'oceano sbagliato dopo un'importazione. Decidere una volta i gradi decimali e convertire tutto al confine mantiene le condutture sane. MapsGrab esporta già le coordinate in gradi decimali, quindi i dati raccolti con l'estensione vengono inseriti negli strumenti GIS e BI senza alcun passaggio di conversione."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Di quante cifre decimali ho bisogno?",
              "answer": "Sei cifre decimali si risolvono in circa 11 centimetri, oltre la precisione del GPS consumer. Per le sedi commerciali sono sufficienti cinque posti (circa 1 metro); meno decimali offuscano intenzionalmente il punto."
            },
            {
              "question": "Quali intervalli devono soddisfare i campi?",
              "answer": "I minuti e i secondi vanno da 0 a meno di 60. I gradi di latitudine arrivano fino a 90 e la longitudine fino a 180; il convertitore segnala quando un valore sbarcherà fuori dal globo."
            },
            {
              "question": "Devo inserire numeri negativi quando scelgo S o W?",
              "answer": "No: la lettera dell'emisfero codifica già il segno. Se inserisci contemporaneamente un valore con segno e una lettera in conflitto, lo strumento segnala la contraddizione invece di indovinare."
            },
            {
              "question": "La conversione viene eseguita su un server?",
              "answer": "No. La formula viene eseguita nel tuo browser; nulla di ciò che scrivi viene trasmesso da nessuna parte."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Salta il lavoro manuale coordinato ",
            "accent": " sulla scala ",
            "tail": ""
          },
          "lead": "MapsGrab esporta latitudine e longitudine decimali per ogni azienda che raccoglie, accanto alle colonne indirizzo, telefono e Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Generatore di parole chiave in blocco: combinazioni di parole chiave + posizione | MapsGrab",
          "description": "Genera combinazioni di parole chiave e posizione in blocco per attività di SEO locale e di scraping delle mappe. Incolla due elenchi, ottieni ogni combinazione, scarica come CSV. Gratuito."
        },
        "hero": {
          "title": {
            "lead": "Parole chiave collettive ",
            "accent": " Generatore ",
            "tail": ""
          },
          "description": "Incolla le tue parole chiave e le tue posizioni e ottieni ogni combinazione \"parola chiave + posizione\" come elenco pronto da incollare o CSV: il modo più veloce per avviare una campagna di ricerca locale."
        },
        "form": {
          "keywordsLabel": "Parole chiave (una per riga)",
          "keywordsPlaceholder": "agenzia di progettazione\ncaffetteria\nidraulico",
          "locationsLabel": "Posizioni (una per riga)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Ordine di combinazione",
          "keywordFirst": "parola chiave + posizione (agenzia di design New York)",
          "locationFirst": "posizione + parola chiave (New York agenzia di design)",
          "submit": "Genera combinazioni",
          "resultCount": "{count} combinazioni generate.",
          "errorKeywords": "Aggiungi almeno una parola chiave.",
          "errorLocations": "Aggiungi almeno una posizione."
        },
        "howTo": [
          {
            "heading": "A cosa serve la generazione di parole chiave in blocco?",
            "body": "Le campagne di ricerca locale vivono di combinazioni: lo stesso servizio ripetuto in ogni città, distretto o quartiere che servi. Dieci parole chiave in dieci località equivalgono a cento frasi di ricerca: \"agenzia di design New York\", \"agenzia di design Chicago\" e così via. Scriverli a mano è soggetto a errori; generarli da due elenchi richiede pochi secondi e garantisce che nulla venga perso."
          },
          {
            "heading": "Come generare combinazioni",
            "body": "Incolla le tue parole chiave nella prima casella, una per riga, e le tue posizioni nella seconda. Scegli se viene prima la parola chiave o la posizione, quindi premi \"Genera\". Ogni parola chiave è abbinata a ogni posizione, le righe vuote e i duplicati vengono rimossi e l'elenco completo viene visualizzato di seguito con un conteggio. Copialo direttamente negli elenchi di parole chiave degli annunci Google, nei controlli delle tendenze Google o in una coda di attività di scraping delle mappe."
          },
          {
            "heading": "Dall'elenco di parole chiave ai dati raccolti",
            "body": "Il classico passo successivo è eseguire ciascuna combinazione come una ricerca Google Maps e raccogliere i risultati. Questo ciclo è esattamente ciò che MapsGrab automatizza: l'estensione accetta un elenco di parole chiave come attività batch, esamina le ricerche una per una ed esporta tutte le attività commerciali che trova, quindi le combinazioni generate qui diventano righe strutturate senza copia manuale."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Quante combinazioni posso generare?",
              "answer": "Quanti ne può contenere il tuo browser: lo strumento moltiplica i due elenchi e li deduplica localmente. Diecimila combinazioni vanno bene; per lotti molto grandi il download di CSV è più pratico che copiare la textarea."
            },
            {
              "question": "I duplicati vengono rimossi?",
              "answer": "SÌ. Le righe duplicate all'interno di ciascun elenco vengono eliminate prima dell'abbinamento e l'output contiene ciascuna coppia parola chiave-posizione esattamente una volta, nell'ordine scelto."
            },
            {
              "question": "Quale ordine dovrei usare?",
              "answer": "Entrambi sono comportamenti di ricerca reali. \"Idraulico Austin\" si legge come il modo in cui le persone digitano in Maps; \"Idraulico Austin\" si legge come una frase SEO tradizionale. Generare entrambi gli ordini è un modo comune per coprire le varianti di ricerca."
            },
            {
              "question": "Posso utilizzare i distretti cittadini o i codici postali come località?",
              "answer": "Sì, tutto ciò che ha senso come suffisso di ricerca di Maps funziona: distretti, codici postali, aree metropolitane o coppie complete \"città, stato\". Una riga per posizione."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Trasforma l'elenco di parole chiave in risultati ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Le attività batch MapsGrab eseguono ogni parola chiave come ricerca su Maps ed esportano le attività commerciali dietro di esse: CSV o JSON, con recensioni, foto e arricchimento dei contatti."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Unisci file CSV online: combina più file CSV gratuitamente | MapsGrab",
          "description": "Unisci più file CSV online in un unico file. Le intestazioni delle colonne vengono allineate automaticamente tramite unione: gratuita, privata e interamente basata su browser."
        },
        "hero": {
          "title": {
            "lead": "Unisci file CSV ",
            "accent": " Online ",
            "tail": ""
          },
          "description": "Carica due o più file CSV e scarica un singolo file unito. Le colonne sono allineate in base all'intestazione: i campi mancanti vengono lasciati vuoti. I file non lasciano mai il tuo browser."
        },
        "form": {
          "filesLabel": "CSV file",
          "filesHint": "Seleziona due o più file .csv. Controlla ogni file con le etichette tradotte sulla riga 2 per saltare quella riga. Il CSV unito mantiene una riga di intestazione del nome del campo. I file rimangono nel tuo browser.",
          "translationRow": "Salta la riga 2 (etichette tradotte) in {name}",
          "submit": "Unisci file",
          "errorNoFiles": "Seleziona almeno due file CSV da unire.",
          "errorEmptyFile": "Uno dei file è vuoto o non ha una riga di intestazione: {name}",
          "fileSummary": "{name} — {rows} righe di dati",
          "resultSummary": "File {files} uniti in righe {rows} × colonne {columns}.",
          "previewLabel": "Anteprima CSV unita"
        },
        "howTo": [
          {
            "heading": "Cosa fa la fusione qui?",
            "body": "L'unione di più esportazioni CSV in un'unica tabella: le colonne sono allineate in base al nome dell'intestazione in tutti i file e ogni riga di dati mantiene i propri valori sotto l'intestazione corrispondente. I file vengono combinati dall'alto verso il basso nell'ordine in cui li hai selezionati, quindi il risultato viene letto come un set di dati continuo. Le colonne che esistono solo in alcuni file rimangono nell'output; le righe dei file senza di esse ottengono celle vuote: un'unione di tutte le intestazioni."
          },
          {
            "heading": "Come unire i file CSV",
            "body": "Seleziona due o più file .csv, ad esempio le esportazioni settimanali di un flusso di lavoro di scraping delle mappe. Premi \"Unisci file\" e lo strumento analizzerà tutti i file nel tuo browser, riporterà il conteggio delle righe di ciascuno e creerà la tabella unita. Scaricalo come singolo CSV che si apre in modo pulito in Excel, Google Fogli o qualsiasi importazione di database."
          },
          {
            "heading": "Costruito per la raccolta dati su più corse",
            "body": "Il caso d'uso tipico è l'aggiunta di esecuzioni: ogni sessione di estrazione MapsGrab esporta il proprio CSV e l'unione porta le sessioni della settimana in un unico set di dati prima della deduplicazione e della pulizia. Il parser gestisce i campi tra virgolette, le virgole incorporate e i ritorni a capo all'interno delle celle (RFC 4180), quindi le esportazioni con indirizzi su più righe o snippet di revisione si uniscono correttamente."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Domande frequenti",
            "tail": ""
          },
          "items": [
            {
              "question": "Cosa succede quando i file hanno colonne diverse?",
              "answer": "Il file unito contiene l'unione di tutte le intestazioni nell'ordine in cui appaiono per la prima volta. Le righe dei file privi di una colonna ottengono una cella vuota in quella colonna. Niente viene eliminato o rinominato."
            },
            {
              "question": "I miei file vengono caricati su un server?",
              "answer": "No. I file vengono letti con il FileReader API del browser e uniti in memoria nella tua scheda. Non viene trasmesso nulla e chiudendo la pagina si cancella tutto."
            },
            {
              "question": "L'unione rimuove le righe duplicate?",
              "answer": "No: l'unione è una concatenazione diretta con colonne allineate. La deduplicazione (ad esempio tramite Place ID) è un passaggio di pulizia separato eseguito sul file unito."
            },
            {
              "question": "Quanto possono essere grandi i file?",
              "answer": "Il limite è la memoria della scheda del tuo browser, non un numero fisso. Per le tipiche esportazioni di dati aziendali, da migliaia a poche centinaia di migliaia di righe, l'unione è immediata. Per file molto grandi, unisci in batch."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Un'esportazione per esecuzione oppure ",
            "accent": " un set di dati ",
            "tail": ""
          },
          "lead": "MapsGrab esporta CSV/JSON puliti per sessione con selezione del campo e deduplicazione Place ID, quindi i set di dati multiesecuzione iniziano già quasi uniti."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Azienda",
  "about": {
    "navLabel": "Di",
    "seoTitle": "Circa MapsGrab | Prodotto e confini",
    "seoDescription": "MapsGrab è un toolkit di dati cartografici per dati aziendali pubblici: un'estensione del browser, un estrattore online cloud, server API e MCP e strumenti web gratuiti. Scopri dove si trova il confine dei dati.",
    "hero": {
      "eyebrow": "Circa MapsGrab",
      "title": {
        "lead": "Dati delle mappe, acquisiti nel modo semplice ",
        "accent": " ",
        "tail": ""
      },
      "intro": "MapsGrab crea strumenti che raccolgono informazioni aziendali disponibili pubblicamente da Google Maps e le trasformano in dati puliti e strutturati: un'estensione del browser per Edge e Firefox, uno scraper online basato su cloud, server API e MCP, oltre a strumenti Web gratuiti che funzionano interamente nel tuo browser.",
      "contactLabel": "Contatta l'assistenza",
      "extensionLabel": "Esplora l'estensione",
      "stageLabel": "Accesso anticipato",
      "updatedLabel": "Pubblicato e recensito",
      "updatedAt": "Agosto 31, 2026",
      "chips": [
        {
          "label": "Raccoglie",
          "value": "Solo dati pubblici"
        },
        {
          "label": "Risultati dell'estensione",
          "value": "Nel tuo browser"
        },
        {
          "label": "Esportazioni",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Trascina per girare"
    },
    "build": {
      "kicker": "Cosa costruiamo",
      "title": {
        "lead": "Un kit di strumenti, ",
        "accent": " quattro ingressi ",
        "tail": ""
      },
      "lead": "Scegli l'estensione del browser, lo scraper online basato su cloud o API. L'estensione funziona all'interno del tuo browser; l'Estrattore online e API condividono un motore cloud e il server MCP porta quello API agli agenti AI.",
      "hub": {
        "title": "MapsGrab toolkit dati",
        "detail": "Dati aziendali · recensioni · foto · e-mail e arricchimento sociale"
      },
      "tags": {
        "extension": [
          "36-estrazione della colonna",
          "Recensioni e foto",
          "Attività batch"
        ],
        "online": [
          "Parole chiave batch",
          "Arricchimento dei contatti",
          "Una colonna 37 CSV per attività"
        ],
        "api": [
          "Dati aziendali",
          "Recensioni",
          "Strutturato JSON"
        ],
        "mcp": [
          "Tre strumenti",
          "Streamable HTTP",
          "Tasto OAuth o API"
        ]
      },
      "toolsLead": "Inoltre strumenti web gratuiti.",
      "toolsText": "Gli strumenti Web gratuiti su questo sito gestiscono piccoli lavori: inserire ID, rivedere collegamenti, coordinare conversioni, unire CSV, senza installare nulla.",
      "toolsLabel": "Strumenti web gratuiti"
    },
    "principles": {
      "kicker": "Principi",
      "title": {
        "lead": "Dove si trova il confine ",
        "accent": " ",
        "tail": ""
      },
      "lead": "MapsGrab è deliberatamente conservatore riguardo ai dati. Queste sono le regole del prodotto a cui ci atteniamo.",
      "publicData": {
        "title": "Solo dati pubblici",
        "text": "Solo informazioni aziendali disponibili pubblicamente: ciò che qualsiasi visitatore della pagina può già vedere.",
        "visibleTag": "Visibile a qualsiasi visitatore",
        "privateTag": "Conti privati"
      },
      "localFirst": {
        "title": "Prima il locale",
        "text": "Con l'estensione e gli strumenti web gratuiti, le tue impostazioni e i risultati risiedono nel tuo browser, non sui nostri server. Estrattore online, i server API e MCP vengono eseguiti nel nostro cloud e i risultati di Estrattore online vengono salvati sul tuo account.",
        "storage": "archiviazione locale",
        "rows": [
          "Impostazioni",
          "Risultati",
          "Attività batch"
        ]
      },
      "backend": {
        "title": "Estensione e strumenti gratuiti: quattro lavori di backend",
        "text": "Per l'estensione e gli strumenti web gratuiti, il nostro backend gestisce esattamente quattro cose: configurazione remota, stato dell'account e della quota, arricchimento email/social opzionale e registri di utilizzo minimo.",
        "chips": [
          "Configurazione",
          "Quota",
          "Arricchimento",
          "Registri di utilizzo"
        ]
      },
      "never": {
        "title": "Nessuna pubblicità. Nessun tracker. Nessuna vendita di dati.",
        "text": "Nessuna pubblicità, nessun tracker di terze parti nell'estensione e nessuna vendita o noleggio di dati.",
        "chips": [
          "Annunci",
          "Tracker di terze parti",
          "Vendere dati"
        ]
      },
      "inWriting": {
        "kicker": "Per iscritto",
        "title": "Informativa sulla privacy e termini",
        "text": "Ognuna di queste regole è descritta nell'Informativa sulla privacy e nei Termini di servizio.",
        "link": "Leggi l'Informativa sulla privacy"
      }
    },
    "dataFlow": {
      "kicker": "Come si muovono i dati",
      "title": {
        "lead": "Cosa ti resta e cosa ",
        "accent": " ci arriva ",
        "tail": ""
      },
      "lead": "L'estensione funziona sui dati visualizzati pubblicamente e mantiene i risultati nel tuo browser. Per l'estensione e gli strumenti Web gratuiti, il nostro backend supporta solo la configurazione, le quote, l'arricchimento opzionale e i log di utilizzo minimo. I server Estrattore online, API e MCP vengono invece eseguiti nel nostro cloud e i risultati di Estrattore online vengono salvati sul tuo account.",
      "source": {
        "label": "Fonte",
        "title": "Google Maps pagine visitate",
        "text": "Dati aziendali pubblici: nome, indirizzo, telefono, sito web, valutazione, recensioni, foto."
      },
      "browser": {
        "label": "Il tuo browser · Local-first",
        "storage": "archiviazione locale · IndexedDB",
        "rows": [
          "Impostazioni",
          "Risultati dell'estrazione",
          "Stato dell'attività batch"
        ],
        "badge": "Memorizzato nel tuo browser"
      },
      "backend": {
        "label": "MapsGrab backend · quattro scopi",
        "lanes": [
          {
            "title": "Configurazione remota",
            "text": "Preimpostazioni della struttura della pagina che mantengono funzionante l'estrazione"
          },
          {
            "title": "Conto e quota",
            "text": "Accesso, stato del piano, contabilità dell'utilizzo mensile"
          },
          {
            "title": "E-mail e arricchimento sociale",
            "text": "Contatti elencati pubblicamente, quando viene utilizzata la funzionalità"
          },
          {
            "title": "Registrazione dell'utilizzo",
            "text": "Record minimi di utilizzo ed errori delle funzionalità"
          }
        ]
      },
      "never": {
        "label": "Mai",
        "items": [
          "Nessuna pubblicità",
          "Nessun tracker di terze parti nell'estensione",
          "Nessuna vendita o noleggio dei dati personali",
          "Nessuna raccolta della cronologia di navigazione oltre le Google Maps pagine da cui estrai"
        ]
      },
      "note": "Questo sito web utilizza Google Analytics 4 per misurare l'utilizzo aggregato della pagina: l'estensione stessa non contiene analisi.",
      "noteLink": "Leggi l'Informativa sulla privacy"
    },
    "status": {
      "kicker": "Stato",
      "title": {
        "lead": "Accesso anticipato, ",
        "accent": " ",
        "tail": " gratuito per iniziare"
      },
      "access": {
        "title": "Accesso anticipato",
        "text": "Il prodotto è in accesso anticipato. Gli elenchi dello Store per i componenti aggiuntivi Edge e i componenti aggiuntivi Firefox sono in fase di finalizzazione.",
        "link": "Guida all'installazione"
      },
      "quota": {
        "title": "Quota mensile gratuita",
        "text": "L'estensione funziona senza account entro una quota mensile gratuita.",
        "link": "Cosa è incluso"
      },
      "paid": {
        "title": "Piani a pagamento per un utilizzo più intenso",
        "text": "I piani a pagamento aumentano i limiti per un utilizzo più intenso. Consulta la pagina dei prezzi per i livelli attuali.",
        "link": "Vedi i prezzi"
      }
    }
  },
  "contact": {
    "navLabel": "Contatto",
    "seoTitle": "Contatta l'assistenza MapsGrab",
    "seoDescription": "Contatta MapsGrab in merito ad account, estensione del browser, fatturazione, strumenti o richieste di privacy.",
    "eyebrow": "Contatto MapsGrab",
    "title": {
      "lead": "Parla con un umano ",
      "accent": " ",
      "tail": ""
    },
    "intro": "Scrivici e una persona lo leggerà. Il supporto è attualmente gestito direttamente dal team che crea MapsGrab.",
    "emailCardLabel": "E-mail di supporto",
    "copyEmail": "Copia {email}",
    "emailLabel": "Supporto via e-mail",
    "emailSubject": "MapsGrab richiesta di supporto",
    "responseTimes": "Rispondiamo alle email di supporto entro un giorno lavorativo, in genere più velocemente. Le richieste sulla privacy potrebbero richiedere alcuni giorni in cui dobbiamo prima verificare la proprietà dell'account.",
    "include": {
      "title": "Cosa includere",
      "text": "Un report preciso ci aiuta a identificare il flusso di lavoro interessato senza richiedere informazioni sensibili sull'account.",
      "items": [
        "La pagina URL e l'azione che hai tentato",
        "Nome e versione del browser",
        "Il messaggio di errore esatto e uno screenshot quando utile",
        "Un numero d'ordine per domande sulla fatturazione, senza i dettagli della carta di pagamento"
      ]
    },
    "topics": {
      "title": "In cosa possiamo aiutarti",
      "items": [
        "Installazione e configurazione dell'estensione del browser",
        "Problemi di accesso e di accesso all'account",
        "Quote, abbonamenti, rinnovi e domande sui pagamenti",
        "Problemi con gli strumenti Web e richieste di funzionalità",
        "Richieste di privacy e dati dell'account"
      ]
    },
    "aboutLabel": "Di",
    "privacyLabel": "politica sulla riservatezza",
    "termsLabel": "Termini di servizio"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Casa",
    "crumbLegal": "Legale",
    "switchLabel": "Documenti legali",
    "readTime": "{minutes} min letto",
    "sectionCount": "{count} sezioni",
    "tocTitle": "In questa pagina",
    "tocLabel": "{title} sezioni",
    "glanceKicker": "A colpo d'occhio",
    "glanceNote": "Di seguito una sintesi del testo completo.",
    "anchorLabel": "Copia il link in “{title}”",
    "copyEmail": "Copia {email}",
    "contactSupport": "Contatta l'assistenza",
    "nextLabel": "Documento successivo"
  },
  "terms": {
    "navLabel": "Termini",
    "seoTitle": "Termini di servizio | MapsGrab",
    "seoDescription": "I MapsGrab Termini di servizio: utilizzo accettabile, responsabilità dell'utente per i dati raccolti, acquisti, dichiarazioni di non responsabilità e come contattarci.",
    "title": "Termini di servizio",
    "intro": "I presenti Termini regolano l'utilizzo di MapsGrab: l'estensione del browser, questo sito Web e gli strumenti Web gratuiti. Si prega di leggerli prima di utilizzare il servizio.",
    "updatedLabel": "Ultimo aggiornamento",
    "updatedAt": "Agosto 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Uso accettabile, responsabilità dell'utente per i dati raccolti, acquisti, dichiarazioni di non responsabilità e come contattarci.",
    "helpTitle": "Domande su questi Termini?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Solo dati pubblici",
        "text": "Il servizio funziona solo con le informazioni mostrate pubblicamente nelle pagine che navighi."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Il tuo utilizzo, la tua responsabilità",
        "text": "Sei tu a decidere cosa raccogliere e come utilizzarlo, nel rispetto delle leggi che ti riguardano."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Nessun account necessario per iniziare",
        "text": "L'estensione funziona senza account entro una quota mensile gratuita."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Annulla in qualsiasi momento",
        "text": "Gli abbonamenti si rinnovano fino alla cancellazione; la cancellazione interrompe i futuri rinnovi."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Accettazione dei termini",
        "paragraphs": [
          "Accedendo o utilizzando MapsGrab, accetti i presenti Termini. Se non sei d'accordo con loro, non installare l'estensione o utilizzare il sito Web e gli strumenti."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Cosa fa il servizio",
        "paragraphs": [
          "MapsGrab ti aiuta a raccogliere informazioni visualizzate pubblicamente sulle pagine Google Maps che visiti (dettagli dell'attività, recensioni, foto e informazioni di contatto correlate) ed esportarle. Il servizio consiste in un'estensione del browser per Microsoft Edge e Firefox, questo sito Web e strumenti Web gratuiti eseguibili nel tuo browser."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Dati disponibili al pubblico",
        "paragraphs": [
          "Il servizio è progettato per funzionare solo con le informazioni mostrate pubblicamente nelle pagine che navighi. Non accede ad account privati, contenuti riservati o dati che richiedono un accesso speciale oltre a ciò che qualsiasi visitatore può vedere."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "La tua responsabilità",
        "paragraphs": [
          "Sei tu a decidere cosa raccogliere e come utilizzarlo, e sei responsabile di tale utilizzo. Quando utilizzi le informazioni raccolte, rispetta le leggi applicabili a te e al tuo scopo.",
          "In particolare, ti impegni a non:"
        ],
        "items": [
          "Utilizzare il servizio per qualsiasi attività illecita o in violazione dei diritti di terzi.",
          "Riconoscere le persone o creare profili di persone private a partire dai dati aziendali raccolti.",
          "Utilizza i dettagli di contatto raccolti per spam o messaggi collettivi non richiesti.",
          "Rivendere i dati grezzi raccolti come prodotto dati concorrente senza un accordo separato con noi.",
          "Interferire, sovraccaricare o tentare di interrompere il servizio o le piattaforme con cui funziona."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Conti e quote",
        "paragraphs": [
          "L'estensione funziona senza account entro una quota mensile gratuita. Alcune funzionalità (limiti più elevati, acquisti, integrazioni cloud) richiedono un account. Sei responsabile della sicurezza delle credenziali del tuo account e delle attività che si svolgono nel tuo account."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Acquisti e abbonamenti",
        "paragraphs": [
          "I piani a pagamento sono descritti nella pagina Prezzi. Prezzi, quote e periodi di fatturazione vengono visualizzati prima dell'acquisto e gli acquisti vengono gestiti tramite i fornitori di servizi di pagamento offerti al momento del pagamento. I piani di abbonamento si rinnovano automaticamente fino all'annullamento e puoi annullarli in qualsiasi momento; la cancellazione interrompe i futuri rinnovi."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "Il servizio viene fornito così com'è",
        "paragraphs": [
          "Il servizio viene fornito \"così com'è\" e \"come disponibile\". Le piattaforme cambiano frequentemente e le funzionalità di raccolta possono smettere di funzionare parzialmente o completamente in qualsiasi momento. MapsGrab non fornisce alcuna garanzia, espressa o implicita, circa la disponibilità ininterrotta, la completezza dei dati raccolti o l'idoneità per uno scopo particolare.",
          "Potremmo modificare, sospendere o interrompere qualsiasi parte del servizio e potremmo aggiornare i presenti Termini. Quando le modifiche saranno sostanziali, le annunceremo su questo sito. L'uso continuato dopo l'entrata in vigore delle modifiche implica l'accettazione dei Termini aggiornati."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitazione di responsabilità",
        "paragraphs": [
          "Nella misura massima consentita dalla legge, MapsGrab e i suoi operatori non sono responsabili per danni indiretti, incidentali, speciali o consequenziali, inclusi la perdita di profitti o dati, derivanti dall'uso o dall'impossibilità di utilizzare il servizio."
        ]
      },
      {
        "id": "contact",
        "title": "Contatto",
        "paragraphs": [
          "Domande su questi Termini possono essere inviate a support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Nota di copertura",
      "badge": "Da definire",
      "lead": "Non ancora coperto:",
      "text": "lo Scraper online (funzioni cloud), lo Scraper/Recensioni/Foto API e il server MCP. Il testo sopra descrive l'estensione, questo sito Web e gli strumenti Web gratuiti."
    }
  },
  "privacy": {
    "navLabel": "Privacy",
    "seoTitle": "Informativa sulla privacy | MapsGrab",
    "seoDescription": "L'MapsGrab Informativa sulla privacy: quali dati vengono elaborati dall'estensione e dal sito Web, dove vengono archiviati, per cosa viene utilizzato il nostro backend e i limiti che seguiamo.",
    "title": "politica sulla riservatezza",
    "intro": "Questa politica spiega quali dati MapsGrab gestisce, dove vengono archiviati e cosa raggiunge i nostri server. La versione breve: l'estensione funziona sui dati visualizzati pubblicamente e mantiene i risultati nel tuo browser; oltre ai nostri servizi cloud, il nostro backend alimenta solo la configurazione, le quote, l'arricchimento opzionale e i log di utilizzo minimo; e non pubblichiamo annunci né tracker di terze parti nell'estensione. Le richieste ai nostri servizi cloud - Estrattore online, server API e MCP - vengono elaborate sui nostri server e i risultati di Estrattore online sono collegati al tuo account in modo che tu possa scaricarli.",
    "updatedLabel": "Ultimo aggiornamento",
    "updatedAt": "Ottobre 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Quali dati vengono elaborati dall'estensione e dal sito Web, dove vengono archiviati, per cosa viene utilizzato il nostro backend e i limiti che seguiamo.",
    "helpTitle": "Domande su questa politica?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Dove vengono archiviati i risultati",
        "text": "L'estensione e gli strumenti web gratuiti mantengono i tuoi dati nel tuo browser; I risultati di Estrattore online sono collegati al tuo account."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Cosa raggiunge i nostri server",
        "text": "Richieste allo scraper online, server API e MCP, oltre a configurazione, account e quote, arricchimento opzionale e registri di utilizzo minimo."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Nessuna pubblicità, nessun tracker",
        "text": "Nessun tracker di terze parti nell'estensione e nessuna vendita o noleggio di dati personali."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Rimozione dei dati",
        "text": "La rimozione dell'estensione cancella i dati locali; inviaci un'e-mail per eliminare i dati dell'account back-end."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Dati i processi di estensione",
        "paragraphs": [
          "L'estensione gestisce le seguenti categorie di dati:"
        ],
        "items": [
          "Dati aziendali pubblici: informazioni visualizzate sulle Google Maps pagine che visiti (nome, indirizzo, telefono, sito web, valutazione, recensioni, foto, ecc.) mentre utilizzi le funzionalità di estrazione.",
          "Le tue impostazioni: preferenze che configuri (formato di esportazione, selezione dei campi, interruttori di automazione, lingua dell'interfaccia).",
          "Dati tecnici e di interazione: eventi di utilizzo minimo (contatori di utilizzo delle funzionalità, messaggi di errore) utilizzati per far funzionare l'estensione rispetto ai cambi di pagina Google.",
          "Identificatori dell'account che emettiamo: un identificatore anonimo del dispositivo e, se accedi, l'e-mail del tuo account e lo stato del piano o della quota."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Dove vengono archiviati i dati",
        "paragraphs": [
          "Con l'estensione, le impostazioni, i risultati dell'estrazione e lo stato delle attività batch vengono archiviati localmente nel browser (archiviazione locale dell'estensione e IndexedDB). Non lasciano mai il tuo dispositivo a meno che tu non attivi un'esportazione o una delle integrazioni opzionali descritte di seguito. Gli strumenti web gratuiti elaborano anche ciò che inserisci nel tuo browser.",
          "Anche i token Google Drive e HubSpot OAuth, se li colleghi, vengono memorizzati solo nel tuo browser.",
          "Le attività di Scraper online vengono eseguite sui nostri server. I loro risultati vengono archiviati nel tuo account in modo che tu possa scaricarli dalla tua Pannello."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Quali sono i processi del nostro backend",
        "paragraphs": [
          "Le richieste effettuate ai nostri servizi cloud (Estrattore online, API e MCP server) vengono elaborate sui nostri server. I nostri server gestiscono anche l'accesso a questi servizi, inclusa la tua chiave API e le autorizzazioni client MCP che approvi, e tengono traccia del tuo utilizzo.",
          "Un client MCP che autorizzi riceve i risultati delle richieste che effettua. Puoi revocare un'autorizzazione dalla tua Pannello.",
          "Oltre a questi servizi cloud, l'estensione e questo sito Web contattano i nostri server per quattro scopi:"
        ],
        "items": [
          "Configurazione remota: preimpostazioni della struttura della pagina che mantengono il funzionamento dell'estrazione quando Google cambia pagina.",
          "Servizi relativi ad account e quote: accesso, stato del piano e contabilità dell'utilizzo mensile.",
          "Arricchimento di e-mail e social media: ricerca dei dettagli di contatto elencati pubblicamente sui siti Web aziendali raccolti quando viene utilizzata la funzionalità.",
          "Registrazione dell'utilizzo: registrazioni minime dell'utilizzo delle funzionalità e degli errori utilizzati per mantenere e migliorare il servizio."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Integrazioni facoltative Google Drive e HubSpot",
        "paragraphs": [
          "Solo se li colleghi esplicitamente nelle impostazioni, i dati esportati vengono caricati sul tuo Google Drive o sincronizzati con il tuo account HubSpot. Queste integrazioni utilizzano la tua autorizzazione, agiscono per tuo conto e possono essere revocate in qualsiasi momento dalle impostazioni dell'estensione o dal tuo account Google / HubSpot."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Analisi del sito web",
        "paragraphs": [
          "Questo sito Web utilizza Google Analytics 4 (GA4) per misurare l'utilizzo aggregato della pagina. GA4 è l'unica analisi di terze parti che utilizziamo e viene eseguita solo su questo sito Web: l'estensione stessa non contiene analisi."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "Quello che non facciamo mai",
        "paragraphs": [
          "Questi confini valgono tra l'estensione e il sito web:"
        ],
        "items": [
          "Nessuna pubblicità.",
          "Nessun tracker di terze parti nell'estensione.",
          "Nessuna vendita o noleggio dei dati personali.",
          "Nessuna raccolta della cronologia di navigazione oltre le Google Maps pagine da cui estrai."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Rimozione dei dati",
        "paragraphs": [
          "La rimozione dell'estensione elimina tutti i dati archiviati localmente. Se desideri eliminare i dati del tuo account backend, contattaci al numero support@mapsgrab.com e li rimuoveremo."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Modifiche a questa politica",
        "paragraphs": [
          "Aggiorniamo questa politica quando il servizio cambia. La data sopra riportata riflette l'ultima revisione e le modifiche sostanziali verranno annunciate su questo sito Web."
        ]
      },
      {
        "id": "contact",
        "title": "Contatto",
        "paragraphs": [
          "Domande o richieste sulla privacy possono essere inviate a support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Autorizzare un'app AI | MapsGrab",
  "title": "Collega un'app AI al tuo account",
  "intro": "Un'app chiede di accedere al tuo account MapsGrab. Consentilo solo se hai avviato tu stesso questa connessione.",
  "loading": "Caricamento della richiesta di connessione...",
  "hostLabel": "Indirizzo dell'app",
  "selfDeclared": "Nome che l'app si dà: {name}",
  "loopbackTitle": "Applicazione locale",
  "loopbackText": "Questa app viene eseguita su un computer, quindi il suo indirizzo non può mostrare chi l'ha creata. Consentilo solo se hai appena avviato la connessione da un'app di cui ti fidi.",
  "loopbackHost": "Questo computer",
  "accountLabel": "Registrato come",
  "switchAccount": "Cambia account",
  "permissionsTitle": "Se lo consenti, questa app può",
  "permissions": [
    "Cerca attività commerciali e leggi le loro recensioni e foto pubbliche su Google Maps.",
    "Utilizza il limite di richiesta mensile del tuo piano API."
  ],
  "revokeNote": "Puoi disconnetterlo in qualsiasi momento in App connesse nella gestione API.",
  "approve": "Permettere",
  "deny": "Nega e torna a {host}",
  "denyLoopback": "Nega e torna all'app",
  "redirecting": "Tornando all'app...",
  "invalidTitle": "Questa richiesta di connessione non è valida o è scaduta",
  "invalidText": "Torna alla tua app AI e ricomincia a connetterti.",
  "errorTitle": "Impossibile completare questa richiesta di connessione",
  "errorReasons": {
    "rate_limited": "Sono arrivati ​​troppi tentativi di connessione dalla tua rete. Attendi qualche minuto prima di riprovare.",
    "invalid_client": "L'app non è registrata oppure la sua registrazione è incompleta.",
    "invalid_redirect_uri": "L'indirizzo del mittente inviato dall'app non corrisponde a quello registrato.",
    "unsupported_response_type": "L'app ha richiesto un tipo di autorizzazione non supportato.",
    "invalid_pkce": "L'app non ha inviato il controllo di sicurezza richiesto (PKCE con S256).",
    "invalid_resource": "L'app non ha richiesto l'accesso al server MapsGrab MCP o ha richiesto un server diverso.",
    "server_error": "MapsGrab non è riuscito a salvare questa richiesta in questo momento. Per favore riprova a breve."
  },
  "errorHint": "Riavvia la connessione dalla tua app AI. Se il problema persiste, contatta lo sviluppatore dell'app.",
  "signInTitle": "Accedi per continuare",
  "signInText": "Accedi all'account MapsGrab che desideri connettere. Questa richiesta ti aspetterà.",
  "signIn": "Registrazione",
  "loadFailed": "Impossibile caricare la richiesta di connessione. Controlla la tua rete e riprova.",
  "decideFailed": "Impossibile completare questa azione. Controlla la tua rete e riprova.",
  "retry": "Riprova"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Pagamento inviato",
      "description": "Stiamo confermando il tuo pagamento. La scheda originale si aggiornerà automaticamente."
    },
    "confirmedCredits": {
      "title": "Crediti aggiunti",
      "description": "Il tuo pagamento ClinkBill è confermato e i crediti sono stati aggiunti. Puoi tornare alla scheda originale."
    },
    "confirmedSubscription": {
      "title": "Piano attivato",
      "description": "Il tuo pagamento ClinkBill è confermato e il tuo piano MapsGrab è attivo. Puoi tornare alla scheda originale."
    },
    "failed": {
      "title": "Il pagamento richiede attenzione",
      "description": "Non è stato possibile confermare questo ordine. Torna alla scheda originale e riprova."
    }
  },
  "cancel": {
    "title": "Pagamento annullato",
    "description": "Nessun pagamento è stato completato. Puoi restituire e scegliere un altro metodo di pagamento."
  }
}
