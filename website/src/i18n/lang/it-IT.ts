import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { itITPricingContent } from '../pricing'

export const itIT: SiteContent = {
  site: {
    name: 'Download video Telegram | TG Downloader',
    description:
      'Usa TG Downloader per il download video Telegram in Telegram Web, salva file e media caricati e continua con l’estensione per ogni canale privato Telegram.',
    keywords:
      'download video Telegram, download media Telegram, salvataggio video Telegram, download file Telegram, canale privato Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Scaricatore',
      home: 'Home',
      pricing: 'Prezzi',
      solutions: 'Soluzione',
      changelog: 'Modifiche'
    },
    footer: {
      resources: 'Risorse',
      rights: '© 2026 TG Downloader. Tutti i diritti riservati.'
    }
  },
  common: {
    installCta: 'Installa Ora'
  },
  sections: {
    features: {
      title: 'Funzionalità download media Telegram',
      subtitle:
        'Queste funzionalità download media Telegram coprono file, immagini, video, batch grandi e contenuti già caricati in Telegram Web.',
      metaDescription:
        'Funzionalità di TG Downloader: salvataggi batch multi-file, supporto per i canali privati, download di file grandi oltre 1GB, rilevamento dei media in tempo reale e design orientato alla privacy senza login richiesto.',
      items: [
        {
          title: 'Download in Batch',
          description:
            'Supporta il download in batch con selezione multipla, scarica tutti i file media da un canale o gruppo con un clic',
          details: [
            'Supporto download in batch con selezione multipla',
            "Scarica l'intero canale/gruppo con un clic",
            'Filtraggio intelligente per tipo di file',
            'Gestione coda di download'
          ]
        },
        {
          title: 'Contenuto Limitato',
          description: 'Scarica media da canali limitati e gruppi privati anche senza permesso',
          details: [
            'Accesso ai contenuti di canali limitati',
            'Download da gruppi privati',
            'Nessuna verifica di permesso richiesta',
            'Funziona con versioni A/K'
          ]
        },
        {
          title: 'Supporto Multi-Formato',
          description: 'Supporta immagini, video, GIF, audio e altri formati media',
          details: [
            'Immagini: JPG, PNG, WEBP, GIF',
            'Video: MP4, WEBM, MOV',
            'File audio: MP3, M4A, OGG',
            'Rilevamento automatico del formato'
          ]
        },
        {
          title: 'Sicuro e Protetto',
          description: 'Nessuna password o login API richiesto, nessun dato utente raccolto',
          details: [
            'Nessuna password o login API richiesta',
            'Nessun dato utente raccolto',
            'Senza virus o annunci',
            'Test di sicurezza rigorosi'
          ]
        },
        {
          title: 'Supporto File Grandi',
          description: 'Download stabile di file oltre 1GB con supporto resume',
          details: [
            'Download stabile di file superiori a 1GB',
            'Supporto resume per download interrotti',
            'Trasferimento rapido e stabile',
            'Tracciamento dei progressi'
          ]
        },
        {
          title: 'Rilevamento in Tempo Reale',
          description:
            'Scansiona e rileva automaticamente le risorse media, aggiorna la lista download in tempo reale',
          details: [
            'Scansione automatica delle risorse media della pagina',
            'Rilevamento risorse in tempo reale',
            'Aggiornamenti automatici della lista',
            'Caching intelligente delle risorse'
          ]
        }
      ]
    },
    steps: {
      title: 'Guida al salvataggio video Telegram',
      subtitle:
        'Segui questa guida al salvataggio video Telegram, apri il messaggio in Telegram Web e conserva video o altri media con pochi passaggi.',
      metaDescription:
        'Guida passo passo per salvare video, file e album di Telegram con TG Downloader. Scopri come installare l\'estensione, rilevare i media in Telegram Web e scaricare i contenuti in batch.',
      items: [
        {
          title: 'Installa Estensione',
          description:
            'Cerca e installa TG Downloader dal tuo negozio estensioni browser'
        },
        {
          title: 'Fissa Estensione',
          description:
            "Clicca sulla barra degli strumenti del browser per fissare l'icona dell'estensione per accesso rapido"
        },
        {
          title: 'Apri Telegram Web',
          description:
            "Visita web.telegram.org, l'estensione inizierà automaticamente a scansionare le risorse media"
        },
        {
          title: 'Download in Batch',
          description:
            'Seleziona i file da scaricare e clicca il pulsante download per salvarli localmente'
        }
      ]
    },
    cta: {
      title: 'Pronto per Iniziare?',
      description: "Installa l'estensione e inizia a scaricare media da Telegram ora."
    },
    techSpecs: {
      title: 'Specifiche Tecniche',
      browsersLabel: 'Browser',
      browsers: 'Chrome, Edge, Brave e tutti i browser basati su Chromium',
      telegramVersionsLabel: 'Versioni Telegram',
      telegramVersions: 'Versione Web K e versione A',
      permissionsLabel: 'Permessi',
      permissions: 'Permessi minimi richiesti',
      updatesLabel: 'Aggiornamenti',
      updates: 'Aggiornamenti automatici dal negozio delle estensioni'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Scarica Media da Canali Privati e Ristretti di Telegram',
        description:
          'Un clic, senza login, supporta file 1GB+. Download batch da canali privati e contenuti ristretti.'
      },
      stats: {
        users: 'Utenti nel Mondo',
        downloads: 'Download Totali'
      },
      seo: {
        title: 'Downloader Video Privati Telegram: Scarica Qualsiasi Media Privato',
        description:
          'Salva i video dei canali privati Telegram con una guida al downloader semplice. Scarica video e media accessibili, risolvi i download non riusciti e trova il metodo giusto per il tuo dispositivo.',
        keywords:
          'downloader video privati telegram, scaricare video canale privato telegram, download video privati telegram, downloader media privati telegram'
      },
      heroTrustPoints: [
        'Download video in HD',
        'Nessuna registrazione',
        'Ottimizzato per mobile',
        'Funziona su Windows, Mac, Android e iPhone'
      ],
      situation: {
        title: 'Inizia da qui: quale situazione corrisponde alla tua?',
        intro:
          'La maggior parte degli utenti che cerca un downloader di video privati Telegram sta cercando di risolvere uno di questi problemi:',
        headers: ['La tua situazione', 'Prova prima questo'],
        rows: [
          {
            cells: [
              'Hai un link a un video Telegram da un canale o una chat',
              'Incolla il link in un downloader di video Telegram online'
            ]
          },
          {
            cells: [
              'Puoi guardare il video in un canale privato ma non puoi salvarlo',
              'Prova la funzione Save Video As di Telegram Desktop'
            ]
          },
          {
            cells: [
              "Il video si riproduce, ma il download e l'inoltro sono bloccati",
              'Usa la registrazione dello schermo solo se hai il permesso di conservare una copia'
            ]
          },
          {
            cells: [
              'Il downloader dice che nessun video è stato trovato',
              "Controlla l'accesso, il tipo di link, le restrizioni del canale e se il video si apre al di fuori di Telegram"
            ]
          }
        ]
      },
      solutions: {
        title: 'Cosa funziona per i video privati di Telegram?',
        intro:
          'Un video privato Telegram di solito è un video condiviso in un canale privato, in un gruppo privato o in una chat diretta. Questi video sono visibili solo ai membri approvati, quindi scaricarli è diverso dal salvare media da un canale pubblico.',
        quickAnswer:
          "Risposta rapida: se il link è accessibile, usa un downloader di video privati Telegram online. Se il video è visibile solo all'interno di Telegram, prova Telegram Desktop. Se il salvataggio è bloccato ma ti è consentito conservare il contenuto, la registrazione dello schermo può essere il ripiego pratico.",
        items: [
          {
            title: 'Soluzione 1: downloader di video Telegram online',
            description:
              "Ideale per link Telegram accessibili. È il metodo più semplice per gli utenti che vogliono scaricare video Telegram online senza installare un'app, un'estensione o un bot.",
            useWhenLabel: 'Usa questo metodo quando:',
            useWhen: [
              'Il link del video Telegram è pubblico o accessibile.',
              'Vuoi scaricare video Telegram online.',
              'Ti serve un file video HD in modo rapido.',
              "Non vuoi installare un'estensione del browser o un'app desktop."
            ]
          },
          {
            title: 'Soluzione 2: Telegram Desktop Save Video As',
            description:
              "Quando il video è disponibile in Telegram Desktop e i download sono consentiti, fai clic con il tasto destro sul video e salvalo in una cartella del tuo computer. Spesso funziona meglio per i membri dei canali privati perché sei già autenticato all'interno di Telegram.",
            useWhenLabel: 'Usa questo metodo quando:',
            useWhen: [
              'Puoi visualizzare il video in Telegram Desktop.',
              'Il proprietario del canale non ha disattivato il salvataggio.',
              'Preferisci scaricare direttamente su Windows o Mac.'
            ]
          },
          {
            title: 'Soluzione 3: registrazione dello schermo su mobile o desktop',
            description:
              "Se l'opzione di download è disattivata ma ti è consentito visualizzare e conservare il contenuto, un registratore dello schermo può catturare video e audio durante la riproduzione. È un ripiego, non il primo metodo, perché richiede più tempo e dipende dalla qualità della riproduzione.",
            useWhenLabel: 'Usa questo metodo quando:',
            useWhen: [
              'Hai il permesso di visualizzare e conservare il video.',
              'Il link Telegram non può essere analizzato da un downloader.',
              'Ti serve una copia personale offline come riferimento.'
            ]
          },
          {
            title: 'Soluzione 4: verifica con il file manager di Android',
            description:
              "In alcuni casi su Android, Telegram può memorizzare temporaneamente i media caricati nelle cartelle locali dell'app. Un file manager può talvolta aiutarti a trovare video già caricati sul dispositivo, ma questo dipende dalla versione dell'app, dai permessi di archiviazione e dal comportamento della cache.",
            useWhenLabel: 'Usa questo metodo quando:',
            useWhen: [
              'Hai già riprodotto il video in Telegram su Android.',
              'Conosci i permessi di archiviazione delle app.',
              'Devi solo recuperare un file già memorizzato nella cache del tuo dispositivo.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Perché usare un downloader di video Telegram online?',
        intro:
          'Un buon downloader dovrebbe aiutarti a rispondere rapidamente a una domanda: questo video Telegram può essere salvato dal link che ho? La migliore esperienza è diretta, chiara e onesta quando un link privato non può essere elaborato.',
        items: [
          {
            title: 'Salva i video in alta qualità',
            description:
              "Conserva i video Telegram nella migliore qualità disponibile per la riproduzione offline, lo studio, la formazione, l'archiviazione o il riferimento personale."
          },
          {
            title: 'Funziona su tutti i dispositivi',
            description:
              'Usa il downloader da un browser su Android, iPhone, Windows, Mac o tablet. Questo è importante quando il video è sul telefono ma vuoi salvarlo su un altro dispositivo.'
          },
          {
            title: 'Nessun accesso a Telegram richiesto',
            description:
              "Scegli strumenti che elaborano un link video senza chiederti la password di Telegram, il codice di verifica, il file di sessione o le credenziali dell'account privato."
          },
          {
            title: 'Riproduzione offline semplice',
            description:
              'Scarica i file nei formati video più comuni quando disponibili, così puoi guardarli in seguito senza aprire Telegram o usare i dati mobili.'
          },
          {
            title: 'Processo rapido basato sui link',
            description:
              'Copia, incolla, analizza e scarica. Se il link non funziona, la pagina dovrebbe spiegarne il motivo e indicarti cosa provare in seguito.'
          },
          {
            title: 'Limiti di autorizzazione chiari',
            description:
              'Scarica solo i video a cui hai il diritto di accedere e che hai il diritto di salvare. Rispetta le regole dei canali, i diritti dei creatori e le policy di Telegram.'
          }
        ]
      },
      troubleshooting: {
        title: 'Se il link del video Telegram non funziona',
        intro:
          'Non tutti i link non riusciti significano che il downloader è guasto. I video privati Telegram spesso non funzionano perché il file non è disponibile al di fuori di Telegram. Prova questa lista di controllo:',
        items: [
          'Apri il link in un browser e verifica che si carichi.',
          'Assicurati di essere ancora membro del canale o del gruppo privato.',
          "Verifica se il proprietario del canale ha disattivato il salvataggio, la copia o l'inoltro.",
          "Prova Telegram Desktop se il video si riproduce solo all'interno dell'app.",
          'Usa un browser o una rete diversi se la pagina non riesce a raggiungere Telegram.',
          'Evita qualsiasi strumento che ti chieda il codice di accesso a Telegram.'
        ]
      },
      permission: {
        title: 'Nota importante sui permessi',
        note:
          'Un downloader di video privati Telegram non dovrebbe essere usato per aggirare la privacy, il copyright o le restrizioni di accesso. Salva i video solo quando hai il permesso del proprietario o quando il tuo utilizzo è consentito dalla legge e dai termini di Telegram.'
      },
      comparison: {
        title: 'Scegli il metodo di download Telegram giusto',
        headers: ['Situazione', 'Soluzione consigliata', 'Ideale per', 'Cosa verificare'],
        rows: [
          {
            cells: [
              'Link di un video Telegram pubblico o accessibile',
              'Downloader di video Telegram online',
              "Download HD rapido senza un'app",
              'Il link si apre e il video è raggiungibile dallo strumento'
            ]
          },
          {
            cells: [
              'Video di un canale privato con download consentito',
              'Telegram Desktop Save Video As',
              'Salvataggio direttamente su un computer',
              'Sei membro e il proprietario non ha disattivato il salvataggio'
            ]
          },
          {
            cells: [
              'Salvataggio limitato ma riproduzione visibile',
              'Registratore dello schermo integrato o di terze parti',
              'Riferimento personale offline con permesso',
              'Cattura audio, area dello schermo e leggi locali o regole della piattaforma'
            ]
          },
          {
            cells: [
              'Media nella cache di Android',
              'Verifica con il file manager',
              'Trovare media già caricati sul dispositivo',
              "Accesso all'archiviazione dell'app e se Telegram mantiene una cache locale"
            ]
          }
        ]
      },
      howTo: {
        title: 'Come scaricare video Telegram in 3 passaggi',
        subtitle:
          "Il percorso più veloce è un downloader di video Telegram basato sui link. Funziona meglio quando il link del video Telegram è pubblico, accessibile o leggibile al di fuori dell'app Telegram.",
        steps: [
          {
            title: 'Copia il link del video',
            description:
              'Apri Telegram, trova il video che vuoi salvare e copia il link del messaggio o del video dal menu di condivisione. Se il canale non consente di copiare i link, passa alle soluzioni per canali privati qui sotto.'
          },
          {
            title: 'Incolla e analizza',
            description:
              'Incolla il link Telegram nel campo del downloader. Lo strumento verifica se da quel link è raggiungibile un file video scaricabile.'
          },
          {
            title: 'Scarica in HD',
            description:
              'Scegli la qualità o il formato disponibile, quindi salva il video Telegram direttamente sul tuo telefono, tablet o computer. Se non compare alcun file, probabilmente il link è limitato piuttosto che guasto.'
          }
        ]
      },
      faq: {
        title: 'Domande frequenti',
        description: 'Le domande che le persone si pongono prima di un download video Telegram o di un download file Telegram in Telegram Web.',
        items: [
          {
            question: 'Posso scaricare video privati di Telegram?',
            answer:
              "Puoi scaricare o salvare video privati Telegram solo quando hai il permesso di accedervi e la fonte del video è disponibile. Alcuni canali privati bloccano il salvataggio, l'inoltro, la copia dei link o l'accesso esterno."
          },
          {
            question: 'Come scarico i video dei canali privati di Telegram?',
            answer:
              "Prova prima il downloader basato sui link se hai un link a un video Telegram utilizzabile. Se non funziona, verifica in Telegram Desktop la presenza della funzione Save Video As. Se i download sono bloccati ma ti è consentito conservare il contenuto, la registrazione dello schermo può essere il ripiego."
          },
          {
            question: 'Perché il downloader di video Telegram dice che nessun video è stato trovato?',
            answer:
              "Il link potrebbe essere limitato, eliminato, scaduto, visibile solo all'interno di Telegram o bloccato dal proprietario del canale. Apri prima tu stesso il link e verifica che il video si riproduca ancora. Se funziona solo dopo aver effettuato l'accesso a Telegram, un downloader online potrebbe non essere in grado di accedervi."
          },
          {
            question: 'Devo installare software?',
            answer:
              'No per i link accessibili. Un downloader di video Telegram online funziona in un browser. Potresti aver bisogno di Telegram Desktop, di un file manager o di un registratore dello schermo per casi specifici, privati o con restrizioni.'
          },
          {
            question: 'Posso scaricare video Telegram senza un link?',
            answer:
              'Di solito no. I downloader online hanno bisogno di un link a un video Telegram per individuare il file. Se non puoi copiare un link ma puoi guardare il video in Telegram, usa Telegram Desktop o un altro metodo locale consentito.'
          },
          {
            question: 'È sicuro inserire il mio codice di accesso a Telegram in un downloader?',
            answer:
              'No. Un downloader non dovrebbe aver bisogno della tua password di Telegram, del codice di verifica o delle credenziali di sessione. Se un sito te le chiede, abbandona la pagina.'
          },
          {
            question: 'Un downloader di media Telegram è gratuito?',
            answer:
              'Molti downloader di media Telegram basati sui link sono gratuiti per i download di base. Evita gli strumenti che impongono installazioni sospette, richieste di accesso o pulsanti ingannevoli.'
          },
          {
            question: 'È legale scaricare video Telegram?',
            answer:
              "Dipende dal contenuto, dal tuo permesso e dall'uso che intendi farne. Non scaricare né ridistribuire contenuti protetti da copyright, privati o con restrizioni senza autorizzazione."
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Accesso web',
          title: 'Accedi per sincronizzare i tuoi crediti',
          signedInAs: 'Accesso effettuato come',
          continueWithGoogle: 'Continua con Google',
          googleLoading: 'Apertura di Google...',
          or: 'oppure',
          emailLabel: 'Email',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Continua con email',
          sendCode: 'Invia codice',
          sendingCode: 'Invio in corso...',
          sendCodeSuccess: 'Codice di verifica inviato.',
          sendAgain: 'Invia di nuovo',
          codeLabel: 'Codice di verifica',
          codePlaceholder: '123456',
          signIn: 'Accedi',
          termsNotice: 'Accedendo accetti i',
          termsLink: 'Termini',
          privacyLink: 'Informativa sulla privacy',
          logout: 'Esci',
          creditsLabel: 'crediti'
        },
        quota: {
          eyebrow: 'Quota web',
          title: 'Saldo crediti attuale',
          planLabel: 'Piano',
          remainingLabel: 'Rimanente',
          dailyLimitLabel: 'Limite giornaliero',
          unlimited: 'Illimitato'
        },
        checkin: {
          creditsLoading: 'Crediti',
          creditsButtonLabel: 'Apri check-in giornaliero',
          accountButtonLabel: 'Apri menu account',
          accountMenuLabel: 'Menu account',
          title: 'I tuoi crediti gratuiti di oggi sono pronti',
          todayRewardText: 'Ricompensa di oggi: {credits} crediti',
          claimedRewardText: 'Hai riscosso {credits} crediti oggi.',
          nextCountdown: 'Prossimo riscatto tra {time}',
          nextAt: '(Prossimo aggiornamento: {time} EST)',
          claimButton: 'Riscuoti {credits} crediti',
          claimingButton: 'Riscossione...',
          notNow: 'Non ora',
          close: 'Chiudi',
          loadFailed: 'Impossibile caricare lo stato del check-in.',
          claimFailed: 'Impossibile riscuotere i crediti.'
        },
        creditPurchase: {
          title: 'Acquista crediti',
          description: 'Aggiungi crediti e continua a scaricare da questo spazio di lavoro.',
          successTitle: 'Crediti aggiunti',
          successDescription: 'Il saldo è stato aggiornato. Chiudi questa finestra e avvia di nuovo il download.',
          packageEyebrow: 'Paga in base all’uso',
          cardNote: 'Usa i crediti per i download dal sito. I crediti non scadono.',
          creditsAmount: '{credits} crediti',
          buyNow: 'Acquista ora',
          selectPackage: 'Seleziona',
          paymentMethodLabel: 'Scegli metodo di pagamento',
          paymentTitle: 'Scegli metodo di pagamento',
          selectedPackageLabel: 'Prodotto selezionato',
          confirmPurchase: 'Continua al pagamento',
          backToProducts: 'Indietro',
          close: 'Chiudi',
          agreementText: 'Accetto le condizioni di acquisto, i Termini e l’Informativa sulla privacy.',
          loadingConfigs: 'Caricamento pacchetti crediti...',
          loadFailed: 'Impossibile caricare i pacchetti crediti. Riprova.',
          noConfigs: 'Nessun pacchetto crediti è disponibile ora. Riprova più tardi.',
          ready: 'Scegli un pacchetto crediti. I prezzi sono mostrati in USD.',
          creatingOrder: 'Creazione ordine...',
          pendingPayment: 'Completa il pagamento nella nuova scheda aperta. Verificheremo automaticamente il risultato.',
          pendingPaymentTitle: 'In attesa del pagamento',
          cancelPayment: 'Annulla pagamento',
          supportMailPrefix: 'Segnala un problema: ',
          success: 'Pagamento completato. I crediti sono disponibili.',
          failed: 'Il pagamento non è completo. Puoi riprovare o chiudere questa finestra.',
          successCredits: '+{credits} crediti aggiunti',
          successBalance: 'Saldo attuale: {balance} crediti',
          createFailed: 'Impossibile creare l’ordine. Riprova.',
          invalidPaymentData: 'Il link di pagamento non è valido. Riprova più tardi.',
          priceUpdated: 'Il prezzo è cambiato. Controlla il prezzo aggiornato e acquista di nuovo.',
          gatewayFailed: 'L’accesso al pagamento è temporaneamente non disponibile. Riprova più tardi.',
          paymentCanceled: 'Il pagamento è stato annullato. Scegli un metodo di pagamento e riprova.',
          pollFailed: 'Impossibile aggiornare lo stato del pagamento. Riprova.',
          pollTimeout: 'L’aggiornamento automatico è scaduto. Aggiorna il risultato dopo il pagamento.',
          orderNotFound: 'L’ordine non è più disponibile. Crea un nuovo ordine.',
          orderExpired: 'L’ordine è scaduto. Acquista di nuovo.',
          fulfillmentFailed: 'Il pagamento è stato ricevuto, ma i crediti non sono ancora stati aggiunti. Riprova più tardi.',
          authExpired: 'Accesso scaduto. Accedi di nuovo per continuare.'
        },
        parse: {
          eyebrow: 'Analisi diretta',
          title: 'Downloader Video Privati Telegram: Scarica Qualsiasi Media Privato',
          helperText:
            'Salva i video dei canali privati Telegram con una guida al downloader semplice. Scarica video e media accessibili, risolvi i download non riusciti e trova il metodo giusto per il tuo dispositivo.',
          telegramMessageListLinkError:
            'Questo link Telegram apre una chat o un canale, non un messaggio specifico. Copia il link esatto del messaggio e incollalo qui.',
          linkLabel: 'Link Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Cancella input',
          submit: 'Incolla il link del video Telegram',
          submitting: 'Analisi in corso...',
          noResults: 'Nessun file scaricabile trovato per questo messaggio.',
          download: 'Scarica',
          downloading: 'Download in corso...',
          downloadAll: 'Scarica tutto',
          downloadingAll: 'Download di tutti i file in corso...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Dimensione sconosciuta',
          play: 'Riproduci',
          preparingPlayback: 'Preparazione della riproduzione...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Chiudi',
          continuePlayback: 'Continua la riproduzione',
          upgradeToPlay: 'Aggiorna per riprodurre',
          playQuotaExhausted: 'La quota di riproduzione per oggi è esaurita.',
          playerRestoring: 'Ripristino della riproduzione...',
          playerRestoredPaused: 'Pronto. Riprendi da dove avevi interrotto.',
          playerResumeFailed: 'Impossibile ripristinare la sessione di riproduzione. Riprova da capo.',
          playerRefreshing: 'Aggiornamento della riproduzione...',
          playerRecreating: 'Ricreazione della sessione di riproduzione...',
          playerUnsupported: 'Questo browser non può riprodurre questo video.',
          playerSessionExpired: 'Sessione di riproduzione scaduta. Riavvia la riproduzione.',
          playerFailed: 'Riproduzione non riuscita.',
          playQuotaUnavailable: 'La quota di riproduzione non è disponibile. Accedi e riprova.',
          playQuotaReached: 'Quota di riproduzione raggiunta per oggi.',
          playerResourceBusy: 'Questo video è ancora in preparazione. Riprova tra un momento.',
          resumeNotice:
            'Rilevato un download incompleto "{filename}" ({progress}). Vuoi continuare?',
          resumeAction: 'Continua',
          pendingRestartText: 'Il record di download precedente per "{filename}" può essere riavviato.',
          pendingRestartButton: 'Riavvia il download',
          resumeUnavailableText: 'Il record di ripristino locale è scaduto.',
          resumeDismiss: 'Ignora',
          resuming: 'Ripresa in corso...',
          largeFileExtensionInlineChromeTitle: 'Estensione Chrome',
          largeFileExtensionInlineChromeDescription:
            'Estensione dedicata per Chrome per rilevare i media Telegram con un clic.',
          largeFileExtensionInlineChromeCta: 'Installa estensione',
          largeFileExtensionInlineEdgeTitle: 'Estensione Edge',
          largeFileExtensionInlineEdgeDescription:
            'Estensione dedicata per Microsoft Edge, compatibile con il download dei contenuti Telegram.',
          largeFileExtensionInlineEdgeCta: 'Installa estensione'
        },
        errors: {
          enterEmailFirst: 'Inserisci prima il tuo indirizzo email.',
          enterEmailAndCode: 'Inserisci email e codice di verifica.',
          sendCodeFailed: 'Impossibile inviare il codice di verifica.',
          googleSignInFailed: 'Accesso con Google non riuscito.',
          googleClientMissing: 'Accesso con Google non configurato.',
          restoreSessionFailed: 'Impossibile ripristinare la sessione.',
          signInFailed: 'Accesso non riuscito.',
          logoutFailed: 'Disconnessione non riuscita.',
          loadQuotaFailed: 'Impossibile caricare i crediti.',
          enterLink: 'Inserisci un link multimediale.',
          invalidLink: 'Questo non è un URL valido.',
          parseFailed: 'Impossibile analizzare questo link.',
          downloadFailed: 'Impossibile scaricare questo file.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'La piattaforma di questo link non è supportata.',
          tiktokUnsupported: 'Questo link TikTok non può ancora essere analizzato. Usa il link di un singolo video o post fotografico pubblico.',
          vimeoParseFailed: 'Questo video Vimeo è privato o non può essere analizzato.',
          xParseFailed: 'Questo link X non è supportato. Usa un post video pubblico.',
          instagramParseFailed: 'Questo link Instagram non è supportato. Usa un post pubblico.',
          instagramImageParseFailed: 'Questo link Instagram non è supportato. Usa un post pubblico con foto.',
          threadsParseFailed: 'Questo link Threads non è supportato. Usa un post pubblico.',
          redditParseFailed: 'Impossibile recuperare il contenuto Reddit. Usa un post pubblico con video, immagine o galleria.',
          douyinParseFailed: 'Impossibile recuperare questo video Douyin. Usa un link video pubblico.',
          quotaExceeded: 'Crediti insufficienti per scaricare questo file.',
          rateLimitExceeded: 'Troppe richieste. Riprova più tardi.'
        },
        downloadAll: {
          allSuccess: 'Tutti i file scaricati.',
          partialFailed: 'Alcuni file scaricati. Alcuni file non riusciti.',
          allFailed: 'Tutti i download non riusciti.'
        },
        requiresClient: {
          privateChannel:
            'Impossibile analizzare qui il contenuto di questo canale privato Telegram. L’estensione gratuita del browser può scaricare video da qualsiasi canale privato a cui hai accesso in Telegram Web.\nPuoi provare queste opzioni:\nOpzione 1 (consigliata): fai clic sul pulsante “Scarica l’estensione gratuita” per installare l’estensione del browser desktop.\nOpzione 2:\n1. Torna su Telegram.\n2. Fai clic destro sul messaggio da scaricare e scegli Forward per inoltrarlo a un canale o gruppo pubblico.\n3. Apri quel canale o gruppo pubblico.\n4. Fai clic destro sul messaggio inoltrato, copia il link pubblico e incollalo qui.',
          privateChannelCta: 'Scarica l’estensione gratuita',
          restrictedFile: 'Questo file con restrizioni richiede TG Downloader in Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'Altri downloader video',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Scarica video TikTok senza watermark in qualità HD.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Scarica video e GIF da X/Twitter in qualità HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Scarica video Vimeo in HD con opzioni di risoluzione multiple.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Scarica foto, Reels e caroselli di Instagram in qualità HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Scarica video e foto di Threads in qualità originale.'
          }
        ]
      }
    },
    changelog: {
      title: 'Registro download video Telegram',
      description:
        'Segui ogni aggiornamento su download video Telegram, flusso web e sessioni di salvataggio più lunghe.',
      seoTitle: 'Registro download video Telegram | TG Downloader',
      seoDescription:
        'Leggi questo registro download video Telegram per aggiornamenti sul flusso web, sui file grandi e sulle versioni recenti.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Miglioramento delle Prestazioni',
          description:
            'Miglioramenti significativi delle prestazioni per una migliore esperienza utente.',
          features: [
            'Velocità di rilevamento delle risorse migliorata del 50%',
            'Stabilità del download di file di grandi dimensioni ottimizzata',
            "Reattività dell'interfaccia migliorata"
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Supporto Multilingue',
          description: 'Supporto aggiunto per 14 lingue in tutto il mondo.',
          features: [
            'Aggiunto supporto per giapponese, coreano e altre lingue',
            'Migliorata accuratezza della traduzione',
            'Aggiunto rilevamento automatico della lingua'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Download nella Barra Laterale',
          description: 'Nuova funzionalità di download nella barra laterale con supporto batch.',
          features: [
            'Aggiunto download di singoli file nella barra laterale',
            'Aggiunta funzionalità di download batch',
            'Migliorata gestione della coda di download'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Sicurezza e Privacy',
          description: 'Miglioramenti alla sicurezza e miglioramenti alla privacy.',
          features: [
            'Rimossa tutta la tracciatura analitica',
            'Aggiunta modalità di elaborazione solo locale',
            'Migliorata crittografia dei dati'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Rilascio Iniziale',
          description: 'Primo rilascio con supporto per il download nella finestra di chat.',
          features: [
            'Funzionalità di download nella finestra di chat',
            'Supporto per Telegram Web K e A versioni',
            'Supporto di base per i formati multimediali'
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
    pricing: itITPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['it-IT'],
    extensionLoginV2: {
      title: 'Accesso estensione | TG Downloader',
      description:
        'Accedi a TG Downloader e sincronizza la sessione del sito con l’estensione del browser.',
      eyebrow: 'Estensione del browser',
      heading: 'Accedi a TG Downloader',
      checkingState: 'Verifica sessione',
      signInRequiredState: 'Accesso richiesto',
      syncedState: 'Accesso effettuato',
      verificationFailedState: 'Verifica non riuscita',
      preparingTitle: 'Preparazione accesso…',
      preparingText: 'TG Downloader sta preparando il controllo della sessione del sito.',
      checkingSessionTitle: 'Controllo sessione del sito…',
      checkingSessionText:
        'TG Downloader sta verificando il token del sito salvato in questo browser.',
      finishingGoogleTitle: 'Completamento accesso Google…',
      finishingGoogleText:
        'TG Downloader sta scambiando il risultato dell’accesso Google con una sessione del sito.',
      signInRequiredTitle: 'Accedi per continuare',
      signInRequiredText: 'Usa la stessa finestra di accesso TG Downloader del sito.',
      signInButtonLabel: 'Accedi',
      syncingTitle: 'Sincronizzazione token estensione…',
      syncingText:
        'TG Downloader sta scambiando la tua sessione del sito con un token dell’estensione.',
      syncedTitle: 'Accesso riuscito',
      syncedText:
        'L’estensione è collegata al tuo account TG Downloader. Fai clic su Torna a Telegram per tornare.',
      returnButtonLabel: 'Torna a Telegram',
      returningButtonLabel: 'Tornando…',
      verificationFailedTitle: 'Impossibile completare l’accesso dell’estensione',
      retryButtonLabel: 'Riprova',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Downloader Video TikTok Senza Watermark - Qualità HD | TG Downloader',
          description:
            'Scarica video TikTok senza watermark in qualità HD gratis. Nessuna app da installare. Salva video, slideshow e storie TikTok istantaneamente.',
          keywords:
            'scaricare tiktok, download video tiktok, tiktok senza watermark, scaricare video tiktok hd, salvare video tiktok, tiktok downloader gratis'
        },
        workspace: {
          title: 'Downloader Video TikTok Senza Watermark',
          helperText:
            'Incolla qualsiasi link video TikTok per scaricare senza watermark in qualità HD. Supporta anche link Telegram, X e Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Perché usare il nostro downloader TikTok',
          subtitle: 'Salva video TikTok nella massima qualità senza watermark, completamente gratis.',
          items: [
            {
              title: 'Senza Watermark',
              description:
                'Scarica video TikTok senza il watermark sovrapposto. Ottieni video puliti e in qualità originale pronti da salvare o condividere.'
            },
            {
              title: 'Qualità HD',
              description:
                'Salva video TikTok nella risoluzione HD originale. Nessuna perdita di qualità, nessuna compressione — esattamente come li ha caricati il creatore.'
            },
            {
              title: 'Veloce e Gratuito',
              description:
                'Nessuna app da installare, nessuna registrazione, nessun costo nascosto. Incolla il link, ottieni il video. Funziona subito in qualsiasi browser.'
            }
          ]
        },
        howTo: {
          title: 'Come scaricare video TikTok senza watermark',
          subtitle:
            'Tre semplici passaggi per salvare qualsiasi video TikTok in qualità HD senza watermark.',
          steps: [
            {
              title: 'Copia il link del video TikTok',
              description:
                'Apri TikTok, tocca il pulsante Condividi sul video e seleziona "Copia link".'
            },
            {
              title: 'Incolla il link qui sopra',
              description:
                'Incolla l\'URL TikTok copiato nel campo di input e clicca Analizza.'
            },
            {
              title: 'Scarica senza watermark',
              description:
                'Clicca il pulsante Scarica per salvare il video TikTok in HD senza watermark.'
            }
          ]
        },
        faq: {
          title: 'FAQ Downloader TikTok',
          items: [
            {
              question: 'Questo downloader TikTok è davvero gratuito?',
              answer:
                'Sì, completamente gratuito senza costi nascosti. Puoi scaricare video TikTok senza watermark a costo zero.'
            },
            {
              question: 'Il video scaricato avrà un watermark?',
              answer:
                'No. Il nostro downloader rimuove il watermark TikTok e fornisce il video originale pulito in qualità HD.'
            },
            {
              question: 'Qual è la qualità dei video TikTok scaricati?',
              answer:
                'I video vengono salvati nella risoluzione HD originale caricata dal creatore, senza perdita di qualità.'
            },
            {
              question: 'Devo installare qualche app o estensione?',
              answer:
                'Nessuna installazione necessaria. È uno strumento web che funziona direttamente nel browser su qualsiasi dispositivo.'
            },
            {
              question: 'Posso scaricare Storie e Slideshow TikTok?',
              answer:
                'Sì, il nostro downloader supporta video TikTok, slideshow fotografici e storie. Incolla il link e scarica.'
            }
          ]
        },
        crossLinks: {
          title: 'Altri downloader video',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Scarica video e GIF da X/Twitter in qualità HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Scarica video Vimeo in HD con opzioni di risoluzione multiple.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Scarica foto, Reels e caroselli di Instagram in qualità HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Scarica video e foto di Threads in qualità originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Scarica video Telegram da canali e gruppi in qualità HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Downloader Video X (Twitter) - Salva Video e GIF HD | TG Downloader',
          description:
            'Scarica video e GIF da X (Twitter) in qualità HD gratis. Nessuna app necessaria. Salva qualsiasi video o GIF da tweet pubblici istantaneamente.',
          keywords:
            'x downloader, scaricare video twitter, download video twitter, x video downloader, scaricare gif twitter, salvare video twitter'
        },
        workspace: {
          title: 'Downloader Video X (Twitter)',
          helperText:
            'Incolla qualsiasi link video X o Twitter per scaricare nella massima qualità. Supporta anche link Telegram, TikTok e Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Perché usare il nostro downloader video X',
          subtitle: 'Salva video e GIF da X/Twitter nella qualità originale, completamente gratis.',
          items: [
            {
              title: 'Video e GIF',
              description:
                'Scarica sia video che GIF animate da X (Twitter). Ottieni esattamente il media come appare nel tweet.'
            },
            {
              title: 'Qualità HD Originale',
              description:
                'Salva i video X nella risoluzione più alta disponibile. Nessun degrado di qualità — lo stesso bitrate della fonte.'
            },
            {
              title: 'Veloce e Gratuito',
              description:
                'Nessuna app da installare, nessun login richiesto. Incolla l\'URL del tweet, scarica il video o la GIF in pochi secondi.'
            }
          ]
        },
        howTo: {
          title: 'Come scaricare video da X (Twitter)',
          subtitle:
            'Tre semplici passaggi per salvare qualsiasi video o GIF da X/Twitter.',
          steps: [
            {
              title: 'Copia l\'URL del tweet',
              description:
                'Su X (Twitter), clicca l\'icona Condividi sul tweet e seleziona "Copia link".'
            },
            {
              title: 'Incolla il link qui sopra',
              description:
                'Incolla l\'URL X/Twitter copiato nel campo di input e clicca Analizza.'
            },
            {
              title: 'Scarica il video o la GIF',
              description:
                'Clicca Scarica per salvare il video o la GIF in qualità HD sul tuo dispositivo.'
            }
          ]
        },
        faq: {
          title: 'FAQ Downloader Video X',
          items: [
            {
              question: 'Come posso scaricare un video da X (Twitter)?',
              answer:
                'Copia l\'URL del tweet che contiene il video, incollalo nel campo di input qui sopra e clicca Analizza. Poi clicca Scarica per salvare il video.'
            },
            {
              question: 'Posso scaricare GIF da X?',
              answer:
                'Sì. Il nostro downloader supporta sia video che GIF animate dai post X/Twitter. Le GIF vengono salvate come file MP4 per la massima compatibilità.'
            },
            {
              question: 'Quale qualità video è disponibile?',
              answer:
                'Forniamo la massima qualità disponibile per ogni tweet, generalmente la risoluzione HD originale caricata dall\'autore.'
            },
            {
              question: 'Questo downloader X è gratuito?',
              answer:
                'Sì, completamente gratuito senza registrazione richiesta. Scarica video e GIF da X senza alcun costo.'
            },
            {
              question: 'Serve un account X/Twitter per scaricare?',
              answer:
                'Nessun account necessario. Finché il tweet è pubblico, puoi scaricare il suo video o GIF senza effettuare l\'accesso.'
            }
          ]
        },
        crossLinks: {
          title: 'Altri downloader video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Scarica video TikTok senza watermark in qualità HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Scarica video Vimeo in HD con opzioni di risoluzione multiple.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Scarica foto, Reels e caroselli di Instagram in qualità HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Scarica video e foto di Threads in qualità originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Scarica video Telegram da canali e gruppi in qualità HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Downloader Video Vimeo HD - Risoluzioni Multiple | TG Downloader',
          description:
            'Scarica video Vimeo in qualità HD con opzioni di risoluzione multiple gratis. Nessuna app necessaria. Salva qualsiasi video Vimeo pubblico istantaneamente.',
          keywords:
            'vimeo downloader, scaricare video vimeo, download video vimeo hd, vimeo downloader gratis, salvare video vimeo, vimeo download hd'
        },
        workspace: {
          title: 'Downloader Video Vimeo HD',
          helperText:
            'Incolla qualsiasi link video Vimeo per scaricare in qualità HD con selezione della risoluzione. Supporta anche link Telegram, TikTok e X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Perché usare il nostro downloader Vimeo',
          subtitle: 'Salva video Vimeo in qualità HD con la risoluzione che preferisci, completamente gratis.',
          items: [
            {
              title: 'Qualità HD Originale',
              description:
                'Scarica video Vimeo nella loro piena risoluzione HD. Ottieni la stessa qualità nitida caricata dal creatore.'
            },
            {
              title: 'Risoluzioni Multiple',
              description:
                'Scegli tra le risoluzioni disponibili (360p, 720p, 1080p e altre). Seleziona la qualità più adatta alle tue esigenze.'
            },
            {
              title: 'Veloce e Gratuito',
              description:
                'Nessuna app da installare, nessun account necessario. Incolla il link Vimeo, seleziona la risoluzione e scarica subito.'
            }
          ]
        },
        howTo: {
          title: 'Come scaricare video Vimeo in HD',
          subtitle:
            'Tre semplici passaggi per salvare qualsiasi video Vimeo con la risoluzione preferita.',
          steps: [
            {
              title: 'Copia il link del video Vimeo',
              description:
                'Apri la pagina del video Vimeo e copia l\'URL dalla barra degli indirizzi del browser.'
            },
            {
              title: 'Incolla il link qui sopra',
              description:
                'Incolla l\'URL Vimeo copiato nel campo di input e clicca Analizza.'
            },
            {
              title: 'Scegli la risoluzione e scarica',
              description:
                'Seleziona la risoluzione video preferita e clicca Scarica per salvare il video in HD.'
            }
          ]
        },
        faq: {
          title: 'FAQ Downloader Vimeo',
          items: [
            {
              question: 'Come posso scaricare un video da Vimeo?',
              answer:
                'Copia l\'URL della pagina video Vimeo, incollalo nel campo di input qui sopra, clicca Analizza, poi seleziona la risoluzione preferita e scarica.'
            },
            {
              question: 'Posso scegliere la risoluzione del video?',
              answer:
                'Sì. Dopo l\'analisi, puoi scegliere tra tutte le risoluzioni disponibili incluse 360p, 720p, 1080p e superiori quando disponibili.'
            },
            {
              question: 'Questo downloader Vimeo è gratuito?',
              answer:
                'Sì, completamente gratuito. Scarica video Vimeo in qualità HD senza alcun costo o registrazione.'
            },
            {
              question: 'Serve un account Vimeo per scaricare?',
              answer:
                'Nessun account necessario. Puoi scaricare qualsiasi video Vimeo pubblico senza effettuare l\'accesso.'
            },
            {
              question: 'In quale formato vengono scaricati i video?',
              answer:
                'I video Vimeo vengono scaricati in formato MP4, compatibile con praticamente tutti i dispositivi e lettori.'
            }
          ]
        },
        crossLinks: {
          title: 'Altri downloader video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Scarica video TikTok senza watermark in qualità HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Scarica video e GIF da X/Twitter in qualità HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Scarica foto, Reels e caroselli di Instagram in qualità HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Scarica video e foto di Threads in qualità originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Scarica video Telegram da canali e gruppi in qualità HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Scarica Foto e Video da Instagram - Qualità HD | TG Downloader',
          description:
            'Scarica foto, Reels e caroselli di Instagram in qualità HD gratis. Nessuna app necessaria, salva istantaneamente.',
          keywords:
            'scaricare Instagram, scaricare foto Instagram, scaricare Reels Instagram, scaricare carosello Instagram, salvare video Instagram, scaricatore Instagram gratis'
        },
        workspace: {
          title: 'Scarica Foto e Video da Instagram',
          helperText:
            'Incolla un link di un post Instagram per scaricare foto, Reels e caroselli in qualità HD. Supporta anche link di Telegram, TikTok e X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Perché usare il nostro scaricatore Instagram',
          subtitle: 'Salva foto, Reels e caroselli di Instagram in qualità HD originale. Completamente gratis.',
          items: [
            {
              title: 'Foto e Reels',
              description:
                'Scarica foto e video Reels di Instagram in qualità originale. Ottieni esattamente i contenuti pubblicati dal creatore.'
            },
            {
              title: 'Download caroselli',
              description:
                'Scarica tutte le immagini e i video dei post carosello di Instagram in una volta. Non serve salvarli uno per uno.'
            },
            {
              title: 'Qualità HD originale',
              description:
                'Salva i media Instagram nella risoluzione più alta disponibile. Nessuna compressione, nessuna perdita di qualità.'
            }
          ]
        },
        howTo: {
          title: 'Come scaricare foto e video da Instagram',
          subtitle:
            'Tre semplici passaggi per salvare qualsiasi post Instagram in qualità HD.',
          steps: [
            {
              title: 'Copia il link del post Instagram',
              description:
                'Apri Instagram, tocca i tre puntini del post e seleziona "Copia link".'
            },
            {
              title: 'Incolla il link qui sopra',
              description:
                "Incolla l'URL Instagram copiato nel campo di input e clicca su Analizza."

            },
            {
              title: 'Scarica in HD',
              description:
                'Clicca sul pulsante Scarica per salvare foto, Reels o caroselli in qualità originale.'
            }
          ]
        },
        faq: {
          title: 'FAQ scaricatore Instagram',
          items: [
            {
              question: 'Questo scaricatore Instagram è davvero gratis?',
              answer:
                'Sì, completamente gratis senza costi nascosti. Scarica foto, Reels e caroselli di Instagram senza alcun costo.'
            },
            {
              question: 'Quali formati sono supportati?',
              answer:
                'Supportiamo il download di foto Instagram (JPG), video Reels (MP4) e album carosello completi con tutti i media.'
            },
            {
              question: 'Qual è la qualità dei file scaricati?',
              answer:
                'Tutti i media vengono salvati nella risoluzione HD originale del creatore, senza perdita di qualità o compressione.'
            },
            {
              question: 'Serve un account Instagram per scaricare?',
              answer:
                "No. Finché il post è pubblico, puoi scaricare i suoi media senza effettuare l'accesso."

            },
            {
              question: 'Posso scaricare le Storie di Instagram?',
              answer:
                'Attualmente supportiamo post, Reels e caroselli. Il download delle Storie richiede che il contenuto sia pubblicamente accessibile tramite link diretto.'
            }
          ]
        },
        crossLinks: {
          title: 'Altri scaricatori video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Scarica video TikTok senza filigrana in qualità HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Scarica video e GIF di X/Twitter in qualità HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Scarica video Vimeo in HD con più opzioni di risoluzione.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Scarica video e foto di Threads in qualità originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Scarica video Telegram da canali e gruppi in qualità HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Scarica Video e Foto da Threads - Qualità Originale | TG Downloader',
          description:
            'Scarica video e foto di Threads in qualità originale gratis. Nessuna app necessaria, salva i media inclusi i caroselli.',
          keywords:
            'scaricare Threads, scaricare video Threads, download video Threads, scaricare media Threads, salvare video Threads, scaricatore Threads gratis'
        },
        workspace: {
          title: 'Scarica Video e Foto da Threads',
          helperText:
            'Incolla un link di un post Threads per scaricare video e foto in qualità originale. Supporta anche link di Telegram, TikTok e Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Perché usare il nostro scaricatore Threads',
          subtitle: 'Salva video e foto di Threads in qualità originale. Completamente gratis.',
          items: [
            {
              title: 'Media misti',
              description:
                'Scarica video e foto dai post di Threads. Supporta post con più tipi di contenuto.'
            },
            {
              title: 'Qualità originale',
              description:
                'Salva i media Threads nella risoluzione più alta disponibile. Nessuna compressione, nessuna perdita di qualità.'
            },
            {
              title: 'Supporto carosello',
              description:
                'Scarica tutti i media dei post carosello di Threads in una volta. Ottieni ogni foto e video in una singola operazione.'
            }
          ]
        },
        howTo: {
          title: 'Come scaricare video e foto da Threads',
          subtitle:
            'Tre semplici passaggi per salvare qualsiasi post Threads in qualità originale.',
          steps: [
            {
              title: 'Copia il link del post Threads',
              description:
                "Apri Threads, tocca l'icona di condivisione del post e seleziona «Copia link»."

            },
            {
              title: 'Incolla il link qui sopra',
              description:
                "Incolla l'URL Threads copiato nel campo di input e clicca su Analizza."

            },
            {
              title: 'Scarica i media',
              description:
                'Clicca sul pulsante Scarica per salvare video e foto in qualità originale.'
            }
          ]
        },
        faq: {
          title: 'FAQ scaricatore Threads',
          items: [
            {
              question: 'Questo scaricatore Threads è davvero gratis?',
              answer:
                'Sì, completamente gratis senza costi nascosti. Scarica video e foto di Threads senza alcun costo.'
            },
            {
              question: 'Quali tipi di media sono supportati?',
              answer:
                'Supportiamo il download di video, foto e post media misti da Threads, inclusi post carosello con più elementi.'
            },
            {
              question: 'Qual è la qualità dei file scaricati?',
              answer:
                'Tutti i media vengono salvati nella risoluzione originale del creatore, senza perdita di qualità.'
            },
            {
              question: 'Serve un account Threads per scaricare?',
              answer:
                "No. Finché il post è pubblico, puoi scaricare i suoi media senza effettuare l'accesso."

            },
            {
              question: 'Posso scaricare post carosello con più foto?',
              answer:
                'Sì, il nostro scaricatore supporta completamente i post carosello di Threads. Tutte le foto e i video nel carosello sono disponibili per il download.'
            }
          ]
        },
        crossLinks: {
          title: 'Altri scaricatori video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Scarica video TikTok senza filigrana in qualità HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Scarica video e GIF di X/Twitter in qualità HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Scarica video Vimeo in HD con più opzioni di risoluzione.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Scarica foto, Reels e caroselli di Instagram in qualità HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Scarica video Telegram da canali e gruppi in qualità HD.'
            }
          ]
        }
      }
    }
  }
}
