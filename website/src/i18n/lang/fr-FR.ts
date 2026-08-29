import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
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
  sections: {
    features: {
      title: 'Fonctionnalités téléchargement de médias Telegram',
      subtitle:
        'Ces fonctionnalités téléchargement de médias Telegram couvrent fichiers, images, vidéos, gros lots et contenu déjà chargé dans Telegram Web.',
      metaDescription:
        "Fonctionnalités de TG Downloader : téléchargements par lot multi-fichiers, prise en charge des canaux privés, téléchargements de gros fichiers de plus de 1 Go, détection des médias en temps réel et conception axée sur la confidentialité sans connexion requise.",
      items: [
        {
          title: 'Téléchargement par Lot',
          description:
            "Prend en charge le téléchargement par lot à sélection multiple, téléchargez tous les fichiers médias d'un canal ou groupe en un clic",
          details: [
            'Prise en charge du téléchargement par lot à sélection multiple',
            'Téléchargez le canal/groupe entier en un clic',
            'Filtrage intelligent par type de fichier',
            'Gestion de la file de téléchargement'
          ]
        },
        {
          title: 'Contenu Restreint',
          description:
            'Téléchargez des médias de canaux restreints et de groupes privés même sans permission',
          details: [
            'Accès au contenu des canaux restreints',
            'Téléchargement depuis des groupes privés',
            "Aucune vérification d'autorisation requise",
            'Fonctionne avec les versions A/K'
          ]
        },
        {
          title: 'Support Multi-Format',
          description:
            'Prend en charge les images, vidéos, GIF, audio et autres formats multimédia',
          details: [
            'Images : JPG, PNG, WEBP, GIF',
            'Vidéos : MP4, WEBM, MOV',
            'Fichiers audio : MP3, M4A, OGG',
            'Détection automatique du format'
          ]
        },
        {
          title: 'Sûr et Sécurisé',
          description:
            'Aucun mot de passe ou connexion API requis, aucune donnée utilisateur collectée',
          details: [
            'Aucun mot de passe ou connexion API requis',
            'Aucune donnée utilisateur collectée',
            'Sans virus ni publicité',
            'Tests de sécurité rigoureux'
          ]
        },
        {
          title: 'Support des Gros Fichiers',
          description: 'Téléchargement stable de fichiers de plus de 1GB avec support de reprise',
          details: [
            'Téléchargement stable de fichiers de plus de 1GB',
            'Prise en charge de la reprise pour les téléchargements interrompus',
            'Transfert rapide et stable',
            'Suivi des progrès'
          ]
        },
        {
          title: 'Détection en Temps Réel',
          description:
            'Analyse et détecte automatiquement les ressources multimédias, met à jour la liste de téléchargement en temps réel',
          details: [
            'Analyse automatique des ressources multimédias de la page',
            'Détection de ressources en temps réel',
            'Mises à jour automatiques de la liste',
            'Mise en cache intelligente des ressources'
          ]
        }
      ]
    },
    steps: {
      title: 'Guide pour enregistrer des vidéos Telegram',
      subtitle:
        'Suivez ce guide pour enregistrer des vidéos Telegram, ouvrez le message dans Telegram Web et conservez vidéos ou autres médias en peu d’étapes.',
      metaDescription:
        "Guide étape par étape pour enregistrer des vidéos, fichiers et albums Telegram avec TG Downloader. Apprenez à installer l'extension, détecter les médias dans Telegram Web et télécharger le contenu par lot.",
      items: [
        {
          title: "Installer l'Extension",
          description:
            "Recherchez et installez TG Downloader depuis le magasin d'extensions de votre navigateur"
        },
        {
          title: "Épingler l'Extension",
          description:
            "Cliquez sur la barre d'outils du navigateur pour épingler l'icône de l'extension pour un accès rapide"
        },
        {
          title: 'Ouvrir Telegram Web',
          description:
            "Visitez web.telegram.org, l'extension commencera automatiquement à analyser les ressources multimédias"
        },
        {
          title: 'Téléchargement par Lot',
          description:
            'Sélectionnez les fichiers à télécharger et cliquez sur le bouton de téléchargement pour les enregistrer localement'
        }
      ]
    },
    cta: {
      title: 'Prêt à Commencer ?',
      description:
        "Installez l'extension et commencez à télécharger des médias de Telegram maintenant."
    },
    techSpecs: {
      title: 'Spécifications Techniques',
      browsersLabel: 'Navigateurs',
      browsers: 'Chrome, Edge, Brave et tous les navigateurs basés sur Chromium',
      telegramVersionsLabel: 'Versions Telegram',
      telegramVersions: 'Version Web K et version A',
      permissionsLabel: 'Autorisations',
      permissions: 'Autorisations minimales requises',
      updatesLabel: 'Mises à jour',
      updates: "Mises à jour automatiques depuis le magasin d'extensions"
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Télécharger des Médias de Telegram depuis les Canaux Privés et Restreints',
        description:
          'Un clic, sans connexion, supporte les fichiers de 1GB+. Téléchargement par lot depuis les canaux privés et le contenu restreint.'
      },
      stats: {
        users: 'Utilisateurs dans le Monde',
        downloads: 'Téléchargements Totaux'
      },
      seo: {
        title: 'Téléchargeur de vidéos privées Telegram : téléchargez tout média privé',
        description:
          'Enregistrez les vidéos des canaux privés Telegram grâce à un guide de téléchargement simple. Téléchargez les vidéos et médias accessibles, dépannez les téléchargements échoués et trouvez la bonne méthode pour votre appareil.',
        keywords:
          'téléchargeur de vidéos privées Telegram, téléchargeur de vidéos de canal privé Telegram, télécharger une vidéo privée Telegram, téléchargeur de médias privés Telegram'
      },
      heroTrustPoints: [
        'Téléchargement vidéo HD',
        'Sans inscription',
        'Adapté au mobile',
        'Fonctionne sur Windows, Mac, Android et iPhone'
      ],
      situation: {
        title: 'Commencez ici : quelle situation correspond à la vôtre ?',
        intro:
          "La plupart des utilisateurs qui recherchent un téléchargeur de vidéos privées Telegram essaient de résoudre l'un de ces problèmes :",
        headers: ['Votre situation', 'Essayez ceci en premier'],
        rows: [
          {
            cells: [
              "Vous avez un lien de vidéo Telegram provenant d'un canal ou d'une discussion",
              'Collez le lien dans un téléchargeur de vidéos Telegram en ligne'
            ]
          },
          {
            cells: [
              "Vous pouvez regarder la vidéo dans un canal privé mais ne pouvez pas l'enregistrer",
              "Essayez l'option Save Video As de Telegram Desktop"
            ]
          },
          {
            cells: [
              'La vidéo se lit, mais le téléchargement et le transfert sont bloqués',
              "Utilisez l'enregistrement d'écran uniquement si vous avez la permission de conserver une copie"
            ]
          },
          {
            cells: [
              "Le téléchargeur indique qu'aucune vidéo n'a été trouvée",
              "Vérifiez l'accès, le type de lien, les restrictions du canal et si la vidéo s'ouvre en dehors de Telegram"
            ]
          }
        ]
      },
      solutions: {
        title: "Qu'est-ce qui fonctionne pour les vidéos privées Telegram ?",
        intro:
          "Une vidéo privée Telegram désigne généralement une vidéo partagée dans un canal privé, un groupe privé ou une discussion directe. Ces vidéos ne sont visibles que par les membres approuvés, donc leur téléchargement diffère de l'enregistrement de médias d'un canal public.",
        quickAnswer:
          "Réponse rapide : si le lien est accessible, utilisez un téléchargeur de vidéos privées Telegram en ligne. Si la vidéo n'est visible qu'à l'intérieur de Telegram, essayez Telegram Desktop. Si l'enregistrement est bloqué mais que vous êtes autorisé à conserver le contenu, l'enregistrement d'écran peut être la solution de repli pratique.",
        items: [
          {
            title: 'Solution 1 : téléchargeur de vidéos Telegram en ligne',
            description:
              "Idéal pour les liens Telegram accessibles. C'est la méthode la plus simple pour les utilisateurs qui veulent télécharger des vidéos Telegram en ligne sans installer d'application, d'extension ou de bot.",
            useWhenLabel: 'Utilisez cette méthode lorsque :',
            useWhen: [
              'Le lien de la vidéo Telegram est public ou accessible.',
              'Vous voulez télécharger des vidéos Telegram en ligne.',
              "Vous avez besoin d'un fichier vidéo HD rapidement.",
              "Vous ne voulez pas installer d'extension de navigateur ni d'application de bureau."
            ]
          },
          {
            title: 'Solution 2 : Telegram Desktop Save Video As',
            description:
              "Lorsque la vidéo est disponible dans Telegram Desktop et que les téléchargements sont autorisés, faites un clic droit sur la vidéo et enregistrez-la dans un dossier de votre ordinateur. Cela fonctionne souvent mieux pour les membres d'un canal privé, car vous êtes déjà authentifié dans Telegram.",
            useWhenLabel: 'Utilisez cette méthode lorsque :',
            useWhen: [
              'Vous pouvez voir la vidéo dans Telegram Desktop.',
              "Le propriétaire du canal n'a pas désactivé l'enregistrement.",
              'Vous préférez télécharger directement sur Windows ou Mac.'
            ]
          },
          {
            title: "Solution 3 : enregistrement d'écran sur mobile ou ordinateur",
            description:
              "Si l'option de téléchargement est désactivée mais que vous êtes autorisé à voir et conserver le contenu, un enregistreur d'écran peut capturer la vidéo et l'audio pendant la lecture. C'est une solution de repli, pas la première méthode, car elle prend plus de temps et dépend de la qualité de lecture.",
            useWhenLabel: 'Utilisez cette méthode lorsque :',
            useWhen: [
              'Vous avez la permission de voir et de conserver la vidéo.',
              'Le lien Telegram ne peut pas être analysé par un téléchargeur.',
              "Vous avez besoin d'une copie hors ligne personnelle pour référence."
            ]
          },
          {
            title: 'Solution 4 : vérification du gestionnaire de fichiers Android',
            description:
              "Dans certains cas sous Android, Telegram peut stocker temporairement les médias chargés dans des dossiers d'application locaux. Un gestionnaire de fichiers peut parfois vous aider à trouver des vidéos déjà chargées sur l'appareil, mais cela dépend de la version de l'application, des autorisations de stockage et du comportement du cache.",
            useWhenLabel: 'Utilisez cette méthode lorsque :',
            useWhen: [
              'Vous avez déjà lu la vidéo dans Telegram sur Android.',
              'Vous comprenez les autorisations de stockage des applications.',
              'Vous devez seulement récupérer un fichier déjà mis en cache sur votre appareil.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Pourquoi utiliser un téléchargeur de vidéos Telegram en ligne ?',
        intro:
          "Un bon téléchargeur doit vous aider à répondre rapidement à une question : cette vidéo Telegram peut-elle être enregistrée à partir du lien dont je dispose ? La meilleure expérience est directe, claire et honnête lorsqu'un lien privé ne peut pas être traité.",
        items: [
          {
            title: 'Enregistrez des vidéos en haute qualité',
            description:
              "Conservez les vidéos Telegram dans la meilleure qualité disponible pour une lecture hors ligne, l'étude, la formation, l'archivage ou la référence personnelle."
          },
          {
            title: 'Fonctionne sur tous les appareils',
            description:
              "Utilisez le téléchargeur depuis un navigateur sur Android, iPhone, Windows, Mac ou tablette. C'est important lorsque la vidéo est sur votre téléphone mais que vous voulez l'enregistrer sur un autre appareil."
          },
          {
            title: 'Aucune connexion Telegram requise',
            description:
              'Choisissez des outils qui traitent un lien vidéo sans demander votre mot de passe Telegram, votre code de vérification, votre fichier de session ou vos identifiants de compte privé.'
          },
          {
            title: 'Lecture hors ligne facile',
            description:
              "Téléchargez des fichiers dans des formats vidéo courants lorsqu'ils sont disponibles, afin de pouvoir les regarder plus tard sans ouvrir Telegram ni utiliser vos données mobiles."
          },
          {
            title: 'Processus rapide basé sur un lien',
            description:
              'Copiez, collez, analysez et téléchargez. Si le lien échoue, la page doit expliquer pourquoi et vous indiquer quoi essayer ensuite.'
          },
          {
            title: 'Limite de permission claire',
            description:
              "Ne téléchargez que les vidéos auxquelles vous avez le droit d'accéder et que vous pouvez enregistrer. Respectez les règles des canaux, les droits des créateurs et les politiques de Telegram."
          }
        ]
      },
      troubleshooting: {
        title: 'Si le lien de la vidéo Telegram ne fonctionne pas',
        intro:
          "Un lien échoué ne signifie pas toujours que le téléchargeur est défaillant. Les vidéos privées Telegram échouent souvent parce que le fichier n'est pas disponible en dehors de Telegram. Essayez cette liste de vérification :",
        items: [
          "Ouvrez le lien dans un navigateur et confirmez qu'il se charge.",
          "Assurez-vous d'être toujours membre du canal ou du groupe privé.",
          "Vérifiez si le propriétaire du canal a désactivé l'enregistrement, la copie ou le transfert.",
          "Essayez Telegram Desktop si la vidéo ne se lit qu'à l'intérieur de l'application.",
          'Utilisez un autre navigateur ou réseau si la page ne parvient pas à joindre Telegram.',
          'Évitez tout outil qui demande votre code de connexion Telegram.'
        ]
      },
      permission: {
        title: 'Note importante sur les permissions',
        note:
          "Un téléchargeur de vidéos privées Telegram ne doit pas être utilisé pour contourner la confidentialité, le droit d'auteur ou les restrictions d'accès. N'enregistrez des vidéos que lorsque vous avez la permission du propriétaire ou lorsque votre usage est autorisé par la loi et les conditions d'utilisation de Telegram."
      },
      comparison: {
        title: 'Choisissez la bonne méthode de téléchargement Telegram',
        headers: ['Situation', 'Solution recommandée', 'Idéal pour', 'À vérifier'],
        rows: [
          {
            cells: [
              'Lien de vidéo Telegram public ou accessible',
              'Téléchargeur de vidéos Telegram en ligne',
              'Téléchargement HD rapide sans application',
              "Le lien s'ouvre et la vidéo est accessible par l'outil"
            ]
          },
          {
            cells: [
              'Vidéo de canal privé avec téléchargement autorisé',
              'Telegram Desktop Save Video As',
              'Enregistrement directement sur un ordinateur',
              "Vous êtes membre et le propriétaire n'a pas désactivé l'enregistrement"
            ]
          },
          {
            cells: [
              'Enregistrement restreint mais lecture visible',
              "Enregistreur d'écran intégré ou tiers",
              'Référence hors ligne personnelle avec permission',
              "Capture audio, zone d'écran et lois locales ou règles de la plateforme"
            ]
          },
          {
            cells: [
              'Médias en cache Android',
              'Vérification du gestionnaire de fichiers',
              "Trouver des médias déjà chargés sur l'appareil",
              "Accès au stockage de l'application et si Telegram conserve un cache local"
            ]
          }
        ]
      },
      howTo: {
        title: 'Comment télécharger des vidéos Telegram en 3 étapes',
        subtitle:
          "La voie la plus rapide est un téléchargeur de vidéos Telegram basé sur un lien. Il fonctionne mieux lorsque le lien de la vidéo Telegram est public, accessible ou lisible en dehors de l'application Telegram.",
        steps: [
          {
            title: 'Copiez le lien de la vidéo',
            description:
              "Ouvrez Telegram, trouvez la vidéo que vous voulez enregistrer et copiez le lien du message ou le lien de la vidéo depuis le menu de partage. Si le canal n'autorise pas la copie des liens, passez aux solutions pour canaux privés ci-dessous."
          },
          {
            title: 'Collez et analysez',
            description:
              "Collez le lien Telegram dans le champ du téléchargeur. L'outil vérifie si un fichier vidéo téléchargeable est accessible à partir de ce lien."
          },
          {
            title: 'Téléchargez en HD',
            description:
              "Choisissez la qualité ou le format disponible, puis enregistrez la vidéo Telegram directement sur votre téléphone, tablette ou ordinateur. Si aucun fichier n'apparaît, le lien est probablement restreint plutôt que défaillant."
          }
        ]
      },
      faq: {
        title: 'Questions Fréquentes',
        description: "Les questions que les gens posent avant un téléchargement de vidéos ou de fichiers Telegram dans Telegram Web.",
        items: [
          {
            question: 'Puis-je télécharger des vidéos privées Telegram ?',
            answer:
              "Vous ne pouvez télécharger ou enregistrer des vidéos privées Telegram que lorsque vous avez la permission d'y accéder et que la source de la vidéo est disponible. Certains canaux privés bloquent l'enregistrement, le transfert, la copie des liens ou l'accès externe."
          },
          {
            question: 'Comment télécharger les vidéos des canaux privés Telegram ?',
            answer:
              "Essayez d'abord le téléchargeur basé sur un lien si vous avez un lien de vidéo Telegram utilisable. Si cela ne fonctionne pas, vérifiez Telegram Desktop pour une option Save Video As. Si les téléchargements sont bloqués mais que vous êtes autorisé à conserver le contenu, l'enregistrement d'écran peut être la solution de repli."
          },
          {
            question: "Pourquoi le téléchargeur de vidéos Telegram indique-t-il qu'aucune vidéo n'a été trouvée ?",
            answer:
              "Le lien peut être restreint, supprimé, expiré, visible uniquement à l'intérieur de Telegram ou bloqué par le propriétaire du canal. Ouvrez d'abord le lien vous-même et confirmez que la vidéo se lit toujours. Si elle ne fonctionne qu'après votre connexion à Telegram, un téléchargeur en ligne ne pourra peut-être pas y accéder."
          },
          {
            question: 'Dois-je installer un logiciel ?',
            answer:
              "Non pour les liens accessibles. Un téléchargeur de vidéos Telegram en ligne fonctionne dans un navigateur. Vous pourriez avoir besoin de Telegram Desktop, d'un gestionnaire de fichiers ou d'un enregistreur d'écran pour des cas privés ou restreints spécifiques."
          },
          {
            question: 'Puis-je télécharger des vidéos Telegram sans lien ?',
            answer:
              "Généralement non. Les téléchargeurs en ligne ont besoin d'un lien de vidéo Telegram pour localiser le fichier. Si vous ne pouvez pas copier de lien mais que vous pouvez regarder la vidéo dans Telegram, utilisez Telegram Desktop ou une autre méthode locale autorisée."
          },
          {
            question: 'Est-il sûr de saisir mon code de connexion Telegram dans un téléchargeur ?',
            answer:
              "Non. Un téléchargeur ne devrait pas avoir besoin de votre mot de passe Telegram, de votre code de vérification ou de vos identifiants de session. Si un site les demande, quittez la page."
          },
          {
            question: 'Un téléchargeur de médias Telegram est-il gratuit ?',
            answer:
              "De nombreux téléchargeurs de médias Telegram basés sur un lien sont gratuits pour les téléchargements de base. Évitez les outils qui imposent des installations suspectes, des demandes de connexion ou des boutons trompeurs."
          },
          {
            question: 'Est-il légal de télécharger des vidéos Telegram ?',
            answer:
              "Cela dépend du contenu, de votre permission et de votre usage prévu. Ne téléchargez ni ne redistribuez pas de contenu protégé par le droit d'auteur, privé ou restreint sans autorisation."
          }
        ]
      },
      workspace: {
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
          creditsLabel: 'crédits'
        },
        quota: {
          eyebrow: 'Quota web',
          title: 'Solde crédits actuel',
          planLabel: 'Offre',
          remainingLabel: 'Restant',
          dailyLimitLabel: 'Limite quotidienne',
          unlimited: 'Illimité'
        },
        checkin: {
          creditsLoading: 'Crédits',
          creditsButtonLabel: 'Ouvrir le check-in quotidien',
          accountButtonLabel: 'Ouvrir le menu du compte',
          accountMenuLabel: 'Menu du compte',
          title: 'Vos crédits gratuits du jour sont prêts',
          todayRewardText: 'Récompense du jour : {credits} crédits',
          claimedRewardText: 'Vous avez reçu {credits} crédits aujourd’hui.',
          nextCountdown: 'Prochaine récupération dans {time}',
          nextAt: '(Prochaine actualisation : {time} EST)',
          claimButton: 'Récupérer {credits} crédits',
          claimingButton: 'Récupération...',
          notNow: 'Pas maintenant',
          close: 'Fermer',
          loadFailed: 'Impossible de charger l’état du check-in.',
          claimFailed: 'Impossible de récupérer les crédits.'
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
        parse: {
          eyebrow: 'Analyse directe',
          title: 'Téléchargeur de vidéos privées Telegram : téléchargez tout média privé',
          helperText:
            'Enregistrez les vidéos des canaux privés Telegram grâce à un guide de téléchargement simple. Téléchargez les vidéos et médias accessibles, dépannez les téléchargements échoués et trouvez la bonne méthode pour votre appareil.',
          telegramMessageListLinkError:
            'Ce lien Telegram ouvre un chat ou un canal, pas un message précis. Copiez le lien exact du message, puis collez-le ici.',
          linkLabel: 'Lien Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Effacer la saisie',
          submit: 'Coller le lien de la vidéo Telegram',
          submitting: 'Analyse...',
          noResults: 'Aucun fichier téléchargeable n’a été trouvé pour ce message.',
          download: 'Télécharger',
          downloading: 'Téléchargement...',
          downloadAll: 'Tout télécharger',
          downloadingAll: 'Téléchargement de tout...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Taille inconnue',
          play: 'Lire',
          preparingPlayback: 'Préparation de la lecture...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Fermer',
          continuePlayback: 'Reprendre la lecture',
          upgradeToPlay: 'Mettre à niveau pour lire',
          playQuotaExhausted: "Le quota de lecture est épuisé pour aujourd'hui.",
          playerRestoring: 'Restauration de la lecture...',
          playerRestoredPaused: 'Prêt. Reprenez là où vous vous êtes arrêté.',
          playerResumeFailed: 'Impossible de restaurer la session de lecture. Veuillez recommencer.',
          playerRefreshing: 'Actualisation de la lecture...',
          playerRecreating: 'Recréation de la session de lecture...',
          playerUnsupported: 'Ce navigateur ne peut pas lire cette vidéo.',
          playerSessionExpired: 'La session de lecture a expiré. Relancez la lecture.',
          playerFailed: 'La lecture a échoué.',
          playQuotaUnavailable: 'Le quota de lecture est indisponible. Connectez-vous et réessayez.',
          playQuotaReached: "Quota de lecture atteint pour aujourd'hui.",
          playerResourceBusy: "Cette vidéo est encore en préparation. Réessayez dans un instant.",
          resumeNotice:
            'Téléchargement inachevé détecté "{filename}" ({progress}). Voulez-vous continuer ?',
          resumeAction: 'Continuer',
          pendingRestartText: 'L’enregistrement de téléchargement précédent pour "{filename}" peut être redémarré.',
          pendingRestartButton: 'Redémarrer le téléchargement',
          resumeUnavailableText: 'L’enregistrement de récupération local a expiré.',
          resumeDismiss: 'Ignorer',
          resuming: 'Reprise...',
          largeFileExtensionInlineChromeTitle: 'Extension Chrome',
          largeFileExtensionInlineChromeDescription:
            'Extension dédiée pour Chrome afin de détecter les médias Telegram en un clic.',
          largeFileExtensionInlineChromeCta: 'Installer l’extension',
          largeFileExtensionInlineEdgeTitle: 'Extension Edge',
          largeFileExtensionInlineEdgeDescription:
            'Extension dédiée pour Microsoft Edge, compatible avec le téléchargement de contenu Telegram.',
          largeFileExtensionInlineEdgeCta: 'Installer l’extension'
        },
        errors: {
          enterEmailFirst: 'Veuillez d’abord saisir votre adresse e-mail.',
          enterEmailAndCode: 'Veuillez saisir l’e-mail et le code de vérification.',
          sendCodeFailed: 'Impossible d’envoyer le code de vérification.',
          googleSignInFailed: 'Connexion Google impossible.',
          googleClientMissing: 'La connexion Google n’est pas configurée.',
          restoreSessionFailed: 'Impossible de restaurer la session.',
          signInFailed: 'Impossible de se connecter.',
          logoutFailed: 'Impossible de se déconnecter.',
          loadQuotaFailed: 'Impossible de charger les crédits.',
          enterLink: 'Veuillez saisir un lien média.',
          invalidLink: 'Ce n’est pas une URL valide.',
          parseFailed: 'Impossible d’analyser ce lien.',
          downloadFailed: 'Impossible de télécharger ce fichier.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: "La plateforme de ce lien n'est pas prise en charge.",
          tiktokUnsupported: "Ce lien TikTok ne peut pas encore être analysé. Utilisez un lien de publication vidéo ou photo unique public.",
          vimeoParseFailed: "Cette vidéo Vimeo est privée ou ne peut pas être analysée.",
          xParseFailed: 'Ce lien X n’est pas pris en charge. Essayez une publication vidéo publique.',
          instagramParseFailed: 'Ce lien Instagram n’est pas pris en charge. Utilisez une publication publique.',
          instagramImageParseFailed: 'Ce lien Instagram n’est pas pris en charge. Utilisez une publication photo publique.',
          threadsParseFailed: 'Ce lien Threads n’est pas pris en charge. Utilisez une publication publique.',
          redditParseFailed: 'Impossible de récupérer le média Reddit. Utilisez une publication publique avec vidéo, image ou galerie.',
          douyinParseFailed: 'Impossible de récupérer cette vidéo Douyin. Utilisez un lien de vidéo publique.',
          quotaExceeded: 'Crédits insuffisants pour télécharger ce fichier.',
          rateLimitExceeded: 'Trop de requêtes. Veuillez réessayer plus tard.'
        },
        downloadAll: {
          allSuccess: 'Tous les fichiers ont été téléchargés.',
          partialFailed: 'Certains fichiers ont été téléchargés. Certains ont échoué.',
          allFailed: 'Tous les téléchargements ont échoué.'
        },
        requiresClient: {
          privateChannel:
            'Impossible d’analyser ici le contenu de ce canal privé Telegram. L’extension de navigateur gratuite permet de télécharger des vidéos depuis n’importe quel canal privé auquel vous avez accès dans Telegram Web.\nVous pouvez essayer :\nOption 1 (recommandée) : cliquez sur le bouton « Télécharger gratuitement l’extension » pour installer l’extension de navigateur pour ordinateur.\nOption 2 :\n1. Retournez dans Telegram.\n2. Faites un clic droit sur le message à télécharger et choisissez Forward pour l’envoyer vers un canal ou groupe public.\n3. Ouvrez ce canal ou groupe public.\n4. Faites un clic droit sur le message transféré, copiez son lien public, puis collez-le ici.',
          privateChannelCta: 'Télécharger gratuitement l’extension',
          restrictedFile: 'Ce fichier restreint nécessite TG Downloader dans Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'Autres téléchargeurs de vidéos',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Téléchargez des vidéos TikTok sans filigrane en qualité HD.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Téléchargez des vidéos et GIF X/Twitter en qualité HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Téléchargez des vidéos Vimeo en HD avec plusieurs options de résolution.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Téléchargez des photos, Reels et carrousels Instagram en qualité HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Téléchargez des vidéos et photos Threads en qualité originale.'
          }
        ]
      }
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
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['fr-FR'],
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
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Téléchargeur TikTok sans filigrane - Qualité HD | TG Downloader',
          description:
            'Téléchargez des vidéos TikTok sans filigrane en qualité HD gratuitement. Aucune application requise. Enregistrez vidéos, diaporamas et stories TikTok instantanément.',
          keywords:
            'téléchargeur tiktok, télécharger vidéo tiktok, tiktok sans filigrane, télécharger tiktok hd, enregistrer vidéo tiktok, téléchargeur tiktok gratuit'
        },
        workspace: {
          title: 'Téléchargeur TikTok sans filigrane',
          helperText:
            'Collez un lien vidéo TikTok pour télécharger sans filigrane en qualité HD. Supporte aussi les liens Telegram, X et Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Pourquoi utiliser notre téléchargeur TikTok',
          subtitle: 'Enregistrez des vidéos TikTok en qualité maximale sans filigrane, entièrement gratuit.',
          items: [
            {
              title: 'Sans filigrane',
              description:
                'Téléchargez des vidéos TikTok sans le filigrane TikTok. Obtenez des vidéos propres en qualité originale, prêtes à enregistrer ou partager.'
            },
            {
              title: 'Qualité HD',
              description:
                'Enregistrez des vidéos TikTok dans leur résolution HD originale. Aucune perte de qualité, aucune compression — exactement comme le créateur les a mises en ligne.'
            },
            {
              title: 'Rapide et gratuit',
              description:
                'Aucune application, aucune inscription, aucun frais caché. Collez le lien, obtenez votre vidéo. Fonctionne instantanément dans tout navigateur.'
            }
          ]
        },
        howTo: {
          title: 'Comment télécharger des vidéos TikTok sans filigrane',
          subtitle:
            "Trois étapes simples pour enregistrer n'importe quelle vidéo TikTok en qualité HD sans filigrane.",
          steps: [
            {
              title: 'Copiez le lien de la vidéo TikTok',
              description:
                'Ouvrez TikTok, appuyez sur le bouton Partager de la vidéo et sélectionnez « Copier le lien ».'
            },
            {
              title: 'Collez le lien ci-dessus',
              description:
                "Collez l'URL TikTok copiée dans le champ de saisie et cliquez sur Analyser."
            },
            {
              title: 'Téléchargez sans filigrane',
              description:
                'Cliquez sur le bouton Télécharger pour enregistrer la vidéo TikTok en HD sans aucun filigrane.'
            }
          ]
        },
        faq: {
          title: 'FAQ téléchargeur TikTok',
          items: [
            {
              question: 'Ce téléchargeur TikTok est-il vraiment gratuit ?',
              answer:
                'Oui, entièrement gratuit sans frais cachés. Vous pouvez télécharger des vidéos TikTok sans filigrane gratuitement.'
            },
            {
              question: 'La vidéo téléchargée aura-t-elle un filigrane ?',
              answer:
                'Non. Notre téléchargeur supprime le filigrane TikTok et fournit la vidéo originale propre en qualité HD.'
            },
            {
              question: 'Quelle est la qualité des vidéos TikTok téléchargées ?',
              answer:
                'Les vidéos sont enregistrées dans leur résolution HD originale telle que mise en ligne par le créateur, sans perte de qualité.'
            },
            {
              question: 'Dois-je installer une application ou une extension ?',
              answer:
                "Aucune installation nécessaire. C'est un outil en ligne qui fonctionne directement dans votre navigateur sur tout appareil."
            },
            {
              question: 'Puis-je télécharger des stories et diaporamas TikTok ?',
              answer:
                'Oui, notre téléchargeur prend en charge les vidéos, diaporamas photo et stories TikTok. Collez le lien et téléchargez.'
            }
          ]
        },
        crossLinks: {
          title: 'Autres téléchargeurs de vidéos',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Téléchargez des vidéos et GIF X/Twitter en qualité HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Téléchargez des vidéos Vimeo en HD avec plusieurs options de résolution.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Téléchargez des photos, Reels et carrousels Instagram en qualité HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Téléchargez des vidéos et photos Threads en qualité originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Téléchargez des vidéos Telegram depuis les canaux et groupes en qualité HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Téléchargeur X (Twitter) - Vidéos et GIF HD | TG Downloader',
          description:
            'Téléchargez des vidéos et GIF X (Twitter) en qualité HD gratuitement. Aucune application requise. Enregistrez instantanément toute vidéo ou GIF de tweet public.',
          keywords:
            'téléchargeur x, télécharger vidéo twitter, x video downloader, télécharger gif twitter, enregistrer vidéo twitter, téléchargeur twitter gratuit'
        },
        workspace: {
          title: 'Téléchargeur de vidéos X (Twitter)',
          helperText:
            'Collez un lien vidéo X ou Twitter pour télécharger en qualité maximale. Supporte aussi les liens Telegram, TikTok et Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Pourquoi utiliser notre téléchargeur X',
          subtitle: 'Enregistrez des vidéos et GIF X/Twitter dans leur qualité originale, entièrement gratuit.',
          items: [
            {
              title: 'Vidéos et GIF',
              description:
                "Téléchargez les publications vidéo et les GIF animés depuis X (Twitter). Obtenez exactement le média tel qu'il apparaît dans le tweet."
            },
            {
              title: 'Qualité HD originale',
              description:
                'Enregistrez les vidéos X dans la résolution la plus élevée disponible. Aucune dégradation — le même débit que la source.'
            },
            {
              title: 'Rapide et gratuit',
              description:
                "Aucune application, aucune connexion requise. Collez l'URL du tweet, obtenez votre vidéo ou GIF téléchargé en quelques secondes."
            }
          ]
        },
        howTo: {
          title: 'Comment télécharger des vidéos X (Twitter)',
          subtitle:
            "Trois étapes simples pour enregistrer n'importe quelle vidéo ou GIF depuis X/Twitter.",
          steps: [
            {
              title: "Copiez l'URL du tweet",
              description:
                "Sur X (Twitter), cliquez sur l'icône Partager du tweet et sélectionnez « Copier le lien »."
            },
            {
              title: 'Collez le lien ci-dessus',
              description:
                "Collez l'URL X/Twitter copiée dans le champ de saisie et cliquez sur Analyser."
            },
            {
              title: 'Téléchargez la vidéo ou le GIF',
              description:
                'Cliquez sur Télécharger pour enregistrer la vidéo ou le GIF en qualité HD sur votre appareil.'
            }
          ]
        },
        faq: {
          title: 'FAQ téléchargeur X',
          items: [
            {
              question: 'Comment télécharger une vidéo depuis X (Twitter) ?',
              answer:
                "Copiez l'URL du tweet contenant la vidéo, collez-la dans le champ de saisie ci-dessus et cliquez sur Analyser. Puis cliquez sur Télécharger pour enregistrer la vidéo."
            },
            {
              question: 'Puis-je télécharger des GIF depuis X ?',
              answer:
                'Oui. Notre téléchargeur prend en charge les vidéos et les GIF animés des publications X/Twitter. Les GIF sont enregistrés au format MP4 pour une meilleure compatibilité.'
            },
            {
              question: 'Quelle qualité vidéo est disponible ?',
              answer:
                "Nous fournissons la qualité la plus élevée disponible pour chaque tweet, généralement la résolution HD originale mise en ligne par l'auteur."
            },
            {
              question: 'Ce téléchargeur X est-il gratuit ?',
              answer:
                'Oui, entièrement gratuit sans inscription requise. Téléchargez des vidéos et GIF X gratuitement.'
            },
            {
              question: "Ai-je besoin d'un compte X/Twitter pour télécharger ?",
              answer:
                'Aucun compte nécessaire. Tant que le tweet est public, vous pouvez télécharger sa vidéo ou son GIF sans vous connecter.'
            }
          ]
        },
        crossLinks: {
          title: 'Autres téléchargeurs de vidéos',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Téléchargez des vidéos TikTok sans filigrane en qualité HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Téléchargez des vidéos Vimeo en HD avec plusieurs options de résolution.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Téléchargez des photos, Reels et carrousels Instagram en qualité HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Téléchargez des vidéos et photos Threads en qualité originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Téléchargez des vidéos Telegram depuis les canaux et groupes en qualité HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Téléchargeur Vimeo HD - Plusieurs résolutions | TG Downloader',
          description:
            'Téléchargez des vidéos Vimeo en qualité HD avec plusieurs options de résolution gratuitement. Aucune application requise. Enregistrez instantanément toute vidéo Vimeo publique.',
          keywords:
            'téléchargeur vimeo, télécharger vidéo vimeo, télécharger vimeo hd, téléchargeur vimeo gratuit, enregistrer vidéo vimeo, vimeo hd téléchargement'
        },
        workspace: {
          title: 'Téléchargeur Vimeo HD',
          helperText:
            'Collez un lien vidéo Vimeo pour télécharger en qualité HD avec choix de résolution. Supporte aussi les liens Telegram, TikTok et X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Pourquoi utiliser notre téléchargeur Vimeo',
          subtitle: 'Enregistrez des vidéos Vimeo en qualité HD avec le choix de la résolution, entièrement gratuit.',
          items: [
            {
              title: 'Qualité HD originale',
              description:
                'Téléchargez des vidéos Vimeo dans leur résolution HD complète. Obtenez la même qualité nette que le créateur a mise en ligne.'
            },
            {
              title: 'Plusieurs résolutions',
              description:
                'Choisissez parmi les résolutions disponibles (360p, 720p, 1080p et plus). Sélectionnez la qualité adaptée à vos besoins.'
            },
            {
              title: 'Rapide et gratuit',
              description:
                'Aucune application, aucun compte nécessaire. Collez le lien Vimeo, sélectionnez votre résolution et téléchargez instantanément.'
            }
          ]
        },
        howTo: {
          title: 'Comment télécharger des vidéos Vimeo en HD',
          subtitle:
            "Trois étapes simples pour enregistrer n'importe quelle vidéo Vimeo dans la résolution de votre choix.",
          steps: [
            {
              title: 'Copiez le lien de la vidéo Vimeo',
              description:
                "Ouvrez la page de la vidéo Vimeo et copiez l'URL depuis la barre d'adresse de votre navigateur."
            },
            {
              title: 'Collez le lien ci-dessus',
              description:
                "Collez l'URL Vimeo copiée dans le champ de saisie et cliquez sur Analyser."
            },
            {
              title: 'Choisissez la résolution et téléchargez',
              description:
                'Sélectionnez la résolution vidéo souhaitée et cliquez sur Télécharger pour enregistrer la vidéo HD.'
            }
          ]
        },
        faq: {
          title: 'FAQ téléchargeur Vimeo',
          items: [
            {
              question: 'Comment télécharger une vidéo depuis Vimeo ?',
              answer:
                "Copiez l'URL de la page vidéo Vimeo, collez-la dans le champ de saisie ci-dessus, cliquez sur Analyser, puis sélectionnez la résolution souhaitée et téléchargez."
            },
            {
              question: 'Puis-je choisir la résolution vidéo ?',
              answer:
                "Oui. Après l'analyse, vous pouvez choisir parmi toutes les résolutions disponibles, y compris 360p, 720p, 1080p et supérieures si disponibles."
            },
            {
              question: 'Ce téléchargeur Vimeo est-il gratuit ?',
              answer:
                'Oui, entièrement gratuit. Téléchargez des vidéos Vimeo en qualité HD sans aucun coût ni inscription.'
            },
            {
              question: "Ai-je besoin d'un compte Vimeo pour télécharger ?",
              answer:
                'Aucun compte nécessaire. Vous pouvez télécharger toute vidéo Vimeo publique sans vous connecter.'
            },
            {
              question: 'Quel est le format des vidéos téléchargées ?',
              answer:
                'Les vidéos Vimeo sont téléchargées au format MP4, compatible avec pratiquement tous les appareils et lecteurs.'
            }
          ]
        },
        crossLinks: {
          title: 'Autres téléchargeurs de vidéos',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Téléchargez des vidéos TikTok sans filigrane en qualité HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Téléchargez des vidéos et GIF X/Twitter en qualité HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Téléchargez des photos, Reels et carrousels Instagram en qualité HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Téléchargez des vidéos et photos Threads en qualité originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Téléchargez des vidéos Telegram depuis les canaux et groupes en qualité HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Téléchargeur de Photos et Vidéos Instagram - Qualité HD | TG Downloader',
          description:
            'Téléchargez des photos, Reels et carrousels Instagram en qualité HD gratuitement. Sans application, sauvegarde instantanée.',
          keywords:
            'télécharger Instagram, télécharger photo Instagram, télécharger Reels Instagram, télécharger carrousel Instagram, sauvegarder vidéo Instagram, téléchargeur Instagram gratuit'
        },
        workspace: {
          title: 'Téléchargeur de Photos et Vidéos Instagram',
          helperText:
            'Collez un lien de publication Instagram pour télécharger photos, Reels et carrousels en qualité HD. Supporte aussi les liens Telegram, TikTok et X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Pourquoi utiliser notre téléchargeur Instagram',
          subtitle: 'Sauvegardez photos, Reels et carrousels Instagram en qualité HD originale. Entièrement gratuit.',
          items: [
            {
              title: 'Photos et Reels',
              description:
                'Téléchargez photos et vidéos Reels Instagram en qualité originale. Obtenez exactement le contenu publié par le créateur.'
            },
            {
              title: 'Téléchargement de carrousels',
              description:
                'Téléchargez toutes les images et vidéos des publications carrousel Instagram en une fois. Pas besoin de les sauvegarder une par une.'
            },
            {
              title: 'Qualité HD originale',
              description:
                'Sauvegardez les médias Instagram dans la résolution la plus élevée disponible. Sans compression, sans perte de qualité.'
            }
          ]
        },
        howTo: {
          title: 'Comment télécharger des photos et vidéos Instagram',
          subtitle:
            'Trois étapes simples pour sauvegarder toute publication Instagram en qualité HD.',
          steps: [
            {
              title: 'Copiez le lien de la publication Instagram',
              description:
                'Ouvrez Instagram, appuyez sur les trois points de la publication et sélectionnez « Copier le lien ».'
            },
            {
              title: 'Collez le lien ci-dessus',
              description:
                "Collez l'URL Instagram copiée dans le champ de saisie et cliquez sur Analyser."

            },
            {
              title: 'Téléchargez en HD',
              description:
                'Cliquez sur le bouton Télécharger pour sauvegarder photos, Reels ou carrousels en qualité originale.'
            }
          ]
        },
        faq: {
          title: 'FAQ du téléchargeur Instagram',
          items: [
            {
              question: 'Ce téléchargeur Instagram est-il vraiment gratuit ?',
              answer:
                'Oui, entièrement gratuit sans frais cachés. Téléchargez photos, Reels et carrousels Instagram sans aucun coût.'
            },
            {
              question: 'Quels formats sont supportés ?',
              answer:
                'Nous supportons le téléchargement de photos Instagram (JPG), vidéos Reels (MP4) et albums carrousel complets avec tous leurs médias.'
            },
            {
              question: 'Quelle est la qualité des fichiers téléchargés ?',
              answer:
                'Tous les médias sont sauvegardés dans la résolution HD originale du créateur, sans perte de qualité ni compression.'
            },
            {
              question: "Ai-je besoin d'un compte Instagram pour télécharger ?",
              answer:
                'Non. Tant que la publication est publique, vous pouvez télécharger ses médias sans vous connecter.'
            },
            {
              question: 'Puis-je télécharger des Stories Instagram ?',
              answer:
                'Actuellement, nous supportons les publications, Reels et carrousels. Le téléchargement de Stories nécessite que le contenu soit publiquement accessible via un lien direct.'
            }
          ]
        },
        crossLinks: {
          title: 'Plus de téléchargeurs vidéo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Téléchargez des vidéos TikTok sans filigrane en qualité HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Téléchargez des vidéos et GIFs X/Twitter en qualité HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Téléchargez des vidéos Vimeo en HD avec plusieurs options de résolution.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Téléchargez des vidéos et photos Threads en qualité originale.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Téléchargez des vidéos Telegram depuis les canaux et groupes en HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Téléchargeur de Vidéos et Photos Threads - Qualité Originale | TG Downloader',
          description:
            'Téléchargez des vidéos et photos Threads en qualité originale gratuitement. Sans application, sauvegardez les médias y compris les carrousels.',
          keywords:
            'télécharger Threads, télécharger vidéo Threads, télécharger vidéo de Threads, télécharger médias Threads, sauvegarder vidéo Threads, téléchargeur Threads gratuit'
        },
        workspace: {
          title: 'Téléchargeur de Vidéos et Photos Threads',
          helperText:
            'Collez un lien de publication Threads pour télécharger vidéos et photos en qualité originale. Supporte aussi les liens Telegram, TikTok et Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Pourquoi utiliser notre téléchargeur Threads',
          subtitle: 'Sauvegardez vidéos et photos Threads en qualité originale. Entièrement gratuit.',
          items: [
            {
              title: 'Médias mixtes',
              description:
                'Téléchargez vidéos et photos des publications Threads. Supporte les publications avec plusieurs types de contenu.'
            },
            {
              title: 'Qualité originale',
              description:
                'Sauvegardez les médias Threads dans la résolution la plus élevée disponible. Sans compression, sans perte de qualité.'
            },
            {
              title: 'Support carrousel',
              description:
                'Téléchargez tous les médias des publications carrousel Threads en une fois. Obtenez chaque photo et vidéo en une seule opération.'
            }
          ]
        },
        howTo: {
          title: 'Comment télécharger des vidéos et photos Threads',
          subtitle:
            'Trois étapes simples pour sauvegarder toute publication Threads en qualité originale.',
          steps: [
            {
              title: 'Copiez le lien de la publication Threads',
              description:
                "Ouvrez Threads, appuyez sur l'icône de partage de la publication et sélectionnez « Copier le lien »."

            },
            {
              title: 'Collez le lien ci-dessus',
              description:
                "Collez l'URL Threads copiée dans le champ de saisie et cliquez sur Analyser."

            },
            {
              title: 'Téléchargez les médias',
              description:
                'Cliquez sur le bouton Télécharger pour sauvegarder vidéos et photos en qualité originale.'
            }
          ]
        },
        faq: {
          title: 'FAQ du téléchargeur Threads',
          items: [
            {
              question: 'Ce téléchargeur Threads est-il vraiment gratuit ?',
              answer:
                'Oui, entièrement gratuit sans frais cachés. Téléchargez vidéos et photos Threads sans aucun coût.'
            },
            {
              question: 'Quels types de médias sont supportés ?',
              answer:
                'Nous supportons le téléchargement de vidéos, photos et publications médias mixtes sur Threads, y compris les publications carrousel avec plusieurs éléments.'
            },
            {
              question: 'Quelle est la qualité des fichiers téléchargés ?',
              answer:
                'Tous les médias sont sauvegardés dans la résolution originale du créateur, sans perte de qualité.'
            },
            {
              question: "Ai-je besoin d'un compte Threads pour télécharger ?",
              answer:
                'Non. Tant que la publication est publique, vous pouvez télécharger ses médias sans vous connecter.'
            },
            {
              question: 'Puis-je télécharger des publications carrousel avec plusieurs photos ?',
              answer:
                'Oui, notre téléchargeur supporte entièrement les publications carrousel Threads. Toutes les photos et vidéos du carrousel sont disponibles au téléchargement.'
            }
          ]
        },
        crossLinks: {
          title: 'Plus de téléchargeurs vidéo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Téléchargez des vidéos TikTok sans filigrane en qualité HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Téléchargez des vidéos et GIFs X/Twitter en qualité HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Téléchargez des vidéos Vimeo en HD avec plusieurs options de résolution.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Téléchargez des photos, Reels et carrousels Instagram en qualité HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Téléchargez des vidéos Telegram depuis les canaux et groupes en HD.'
            }
          ]
        }
      }
    }
  }
}
