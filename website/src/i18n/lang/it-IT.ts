import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'crediti',
        enterEmailFirst: 'Inserisci prima il tuo indirizzo email.',
        enterEmailAndCode: 'Inserisci email e codice di verifica.',
        sendCodeFailed: 'Impossibile inviare il codice di verifica.',
        googleSignInFailed: 'Accesso con Google non riuscito.',
        googleClientMissing: 'Accesso con Google non configurato.',
        signInFailed: 'Accesso non riuscito.',
      },
      checkin: {
        accountButtonLabel: 'Apri menu account',
        accountMenuLabel: 'Menu account',
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
  }
}
