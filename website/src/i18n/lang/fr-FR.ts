import type { SiteContent } from '../schema'
import { frFRPricingContent } from '../pricing'

export const frFR: SiteContent = {
  site: {
    name: 'Téléchargement de vidéos Telegram | TG Downloader',
    description:
      'Utilisez TG Downloader pour le téléchargement de vidéos Telegram dans Telegram Web, enregistrez fichiers et médias chargés et poursuivez dans chaque canal privé Telegram.',
    keywords:
      'téléchargement de vidéos Telegram, téléchargement de médias Telegram, enregistrer des vidéos Telegram, téléchargement de fichiers Telegram, canal privé Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Téléchargeur',
      home: 'Accueil',
      pricing: 'Tarifs',
      solutions: 'Solution',
      changelog: 'Modifications'
    },
    footer: {
      resources: 'Ressources',
      rights: '© 2026 TG Downloader. Tous droits réservés.'
    }
  },
  common: {
    installCta: 'Installer Maintenant'
  },
  pages: {
    account: {
      auth: {
        eyebrow: 'Accès web',
        title: 'Connectez-vous pour synchroniser vos crédits',
        signedInAs: 'Connecté en tant que',
        continueWithGoogle: 'Continuer avec Google',
        googleLoading: 'Ouverture de Google...',
        or: 'ou',
        emailLabel: 'E-mail',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'Continuer avec l’e-mail',
        sendCode: 'Envoyer le code',
        sendingCode: 'Envoi...',
        sendCodeSuccess: 'Code de vérification envoyé.',
        sendAgain: 'Renvoyer',
        codeLabel: 'Code de vérification',
        codePlaceholder: '123456',
        signIn: 'Se connecter',
        termsNotice: 'En vous connectant, vous acceptez les',
        termsLink: 'Conditions',
        privacyLink: 'Politique de confidentialité',
        logout: 'Se déconnecter',
        creditsLabel: 'crédits',
        enterEmailFirst: 'Veuillez d’abord saisir votre adresse e-mail.',
        enterEmailAndCode: 'Veuillez saisir l’e-mail et le code de vérification.',
        sendCodeFailed: 'Impossible d’envoyer le code de vérification.',
        googleSignInFailed: 'Connexion Google impossible.',
        googleClientMissing: 'La connexion Google n’est pas configurée.',
        signInFailed: 'Impossible de se connecter.',
      },
      checkin: {
        accountButtonLabel: 'Ouvrir le menu du compte',
        accountMenuLabel: 'Menu du compte',
      },
      creditPurchase: {
        title: 'Acheter des crédits',
        description: 'Ajoutez des crédits et continuez le téléchargement depuis cet espace de travail.',
        successTitle: 'Crédits ajoutés',
        successDescription: 'Votre solde a été actualisé. Fermez cette fenêtre et relancez le téléchargement.',
        packageEyebrow: 'Payez selon vos besoins',
        cardNote: 'Utilisez les crédits pour les téléchargements web. Les crédits n’expirent pas.',
        creditsAmount: '{credits} crédits',
        buyNow: 'Acheter maintenant',
        selectPackage: 'Sélectionner',
        paymentMethodLabel: 'Choisir le moyen de paiement',
        paymentTitle: 'Choisir le moyen de paiement',
        selectedPackageLabel: 'Produit sélectionné',
        confirmPurchase: 'Continuer vers le paiement',
        backToProducts: 'Retour',
        close: 'Fermer',
        agreementText: 'J’accepte les conditions d’achat, les Conditions et la Politique de confidentialité.',
        loadingConfigs: 'Chargement des packs de crédits...',
        loadFailed: 'Impossible de charger les packs de crédits. Veuillez réessayer.',
        noConfigs: 'Aucun pack de crédits n’est disponible pour le moment. Veuillez réessayer plus tard.',
        ready: 'Choisissez un pack de crédits. Les prix sont affichés en USD.',
        creatingOrder: 'Création de la commande...',
        pendingPayment: 'Terminez le paiement dans l’onglet qui vient de s’ouvrir. Nous vérifierons le résultat automatiquement.',
        pendingPaymentTitle: 'En attente du paiement',
        cancelPayment: 'Annuler le paiement',
        supportMailPrefix: 'Signaler un problème : ',
        success: 'Paiement terminé. Les crédits sont disponibles.',
        failed: 'Le paiement n’est pas terminé. Vous pouvez réessayer ou fermer cette fenêtre.',
        successCredits: '+{credits} crédits ajoutés',
        successBalance: 'Solde actuel : {balance} crédits',
        createFailed: 'Impossible de créer la commande. Veuillez réessayer.',
        invalidPaymentData: 'Le lien de paiement est invalide. Veuillez réessayer plus tard.',
        priceUpdated: 'Le prix a changé. Vérifiez le nouveau prix puis rachetez.',
        gatewayFailed: 'L’accès au paiement est temporairement indisponible. Veuillez réessayer plus tard.',
        paymentCanceled: 'Le paiement a été annulé. Choisissez un moyen de paiement et réessayez.',
        pollFailed: 'Impossible d’actualiser l’état du paiement. Veuillez réessayer.',
        pollTimeout: 'L’actualisation automatique a expiré. Actualisez le résultat après le paiement.',
        orderNotFound: 'La commande n’est plus disponible. Créez une nouvelle commande.',
        orderExpired: 'La commande a expiré. Achetez à nouveau.',
        fulfillmentFailed: 'Le paiement a été reçu, mais les crédits n’ont pas encore été ajoutés. Réessayez plus tard.',
        authExpired: 'La connexion a expiré. Reconnectez-vous pour continuer.'
      },
    },

    changelog: {
      title: 'Journal téléchargement de vidéos Telegram',
      description:
        'Suivez chaque mise à jour autour du téléchargement de vidéos Telegram, du flux web et des sauvegardes plus longues.',
      seoTitle: 'Journal téléchargement de vidéos Telegram | TG Downloader',
      seoDescription:
        'Consultez ce journal téléchargement de vidéos Telegram pour suivre le flux web, les gros fichiers et chaque version récente.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Amélioration des Performances',
          description:
            'Améliorations significatives des performances pour une meilleure expérience utilisateur.',
          features: [
            'Vitesse de détection des ressources améliorée de 50 %',
            'Stabilité du téléchargement de gros fichiers optimisée',
            "Réactivité de l'interface améliorée"
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Support Multilingue',
          description: 'Support ajouté pour 14 langues dans le monde entier.',
          features: [
            "Support ajouté pour le japonais, le coréen et d'autres langues",
            'Précision de traduction améliorée',
            'Détection automatique de la langue ajoutée'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Téléchargement Latéral',
          description: 'Nouvelle fonction de téléchargement latéral avec support par lot.',
          features: [
            'Téléchargement de fichier unique dans la barre latérale ajouté',
            'Fonctionnalité de téléchargement par lot ajoutée',
            'Gestion de la file de téléchargement améliorée'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Sécurité et Confidentialité',
          description: 'Améliorations de sécurité et renforcements de la confidentialité.',
          features: [
            'Tout le suivi analytique supprimé',
            'Mode de traitement local uniquement ajouté',
            'Chiffrement des données amélioré'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Première Version',
          description: 'Première version avec support de téléchargement de la fenêtre de chat.',
          features: [
            'Fonctionnalité de téléchargement de la fenêtre de chat',
            'Support pour Telegram Web K et versions A',
            'Support de base des formats multimédias'
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
    pricing: frFRPricingContent,
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
      title: 'Connexion de l’extension | TG Downloader',
      description:
        'Connectez-vous à TG Downloader et synchronisez votre session du site web avec l’extension du navigateur.',
      eyebrow: 'Extension du navigateur',
      heading: 'Se connecter à TG Downloader',
      checkingState: 'Vérification de la session',
      signInRequiredState: 'Connexion requise',
      syncedState: 'Connecté',
      verificationFailedState: 'Échec de la vérification',
      preparingTitle: 'Préparation de la connexion…',
      preparingText: 'TG Downloader prépare la vérification de la session du site web.',
      checkingSessionTitle: 'Vérification de la session du site web…',
      checkingSessionText:
        'TG Downloader vérifie le jeton du site web stocké dans ce navigateur.',
      finishingGoogleTitle: 'Finalisation de la connexion Google…',
      finishingGoogleText:
        'TG Downloader échange le résultat de la connexion Google contre une session du site web.',
      signInRequiredTitle: 'Connectez-vous pour continuer',
      signInRequiredText:
        'Utilisez la même fenêtre de connexion TG Downloader que sur le site web.',
      signInButtonLabel: 'Se connecter',
      syncingTitle: 'Synchronisation du jeton de l’extension…',
      syncingText:
        'TG Downloader échange votre session du site web contre un jeton d’extension.',
      syncedTitle: 'Connexion réussie',
      syncedText:
        'L’extension est connectée à votre compte TG Downloader. Cliquez sur Retour à Telegram pour revenir.',
      returnButtonLabel: 'Retour à Telegram',
      returningButtonLabel: 'Retour…',
      verificationFailedTitle: 'Impossible de terminer la connexion de l’extension',
      retryButtonLabel: 'Réessayer',
    },
  }
}
