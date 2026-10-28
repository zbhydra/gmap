import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab est une boîte à outils de données cartographiques : récupérez des informations commerciales accessibles au public à partir de cartes, examinez des liens, des identifiants de lieu et bien plus encore avec une extension de navigateur et des outils Web.",
    "keywords": "données cartographiques, extracteur Google Maps, recherche d'identifiant de lieu, générateur de liens d'examen, outils cartographiques"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Navigation principale",
      "mobileLabel": "Navigation mobile",
      "extension": "Extension",
      "online": "En ligne",
      "api": "API",
      "apiScraper": "API d’extraction",
      "apiReviews": "API d’avis",
      "apiPhotos": "API de photos",
      "apiMcp": "MCP d’extraction",
      "apiScraperDesc": "Données commerciales pour n'importe quel mot-clé et emplacement, sous la forme JSON.",
      "apiReviewsDesc": "Fils de révision complets avec notes et réponses des propriétaires.",
      "apiPhotosDesc": "Galeries de photos publiques sous forme de listes URL prêtes à l'emploi.",
      "apiMcpDesc": "Données Maps en direct pour Claude Code, Cursor et VS Code.",
      "apiFootNote": "API et MCP partagent un quota de demandes mensuel.",
      "apiPricing": "Tarif API",
      "pricing": "Tarifs",
      "freeTools": "Outils gratuits",
      "signIn": "Se connecter",
      "dashboard": "Tableau de bord"
    },
    "footer": {
      "legalLabel": "Légal",
      "resources": "Outils gratuits",
      "product": "Produit",
      "rights": "© 2026 MapsGrab. Tous droits réservés.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Recherche",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Générateur de liens d'avis",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Vérificateur de courrier électronique",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Convertisseur Lat Long to DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "Convertisseur DMS en décimal",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Générateur de mots clés en masse",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Fusionner CSV fichiers en ligne",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Installer maintenant",
    "comingSoon": "À venir",
    "themeLabel": "Thème de couleur",
    "themeLight": "Lumière",
    "themeDark": "Sombre",
    "themeSystem": "Système",
    "faqLabel": "Questions fréquentes",
    "breadcrumbLabel": "Fil d'Ariane",
    "languageSwitcherLabel": "Sélecteur de langue",
    "mobileMenuLabel": "Changer de menu",
    "copied": "Copié dans le presse-papiers",
    "cancel": "Annuler",
    "continue": "Continuer"
  },
  "dashboard": {
    "create": {
      "title": "Extracteur en ligne",
      "newTask": "Nouvelle tâche",
      "modeLabel": "Mode recherche",
      "modes": {
        "keywords": "Mots-clés",
        "map": "Carte",
        "regions": "Régions"
      },
      "keywords": "Mots-clés",
      "regionsCta": "Créer des requêtes par région",
      "placeholder": "café à Portland\nrestaurant à Austin",
      "count": "Mots-clés {count} / {limit}",
      "duplicates": "Lignes en double ignorées : {count}",
      "contacts": "Rechercher des e-mails et des profils sociaux",
      "contactsPaid": "Disponible avec un forfait en ligne payant.",
      "usage": "{used} / {total} enregistrements ce mois-ci",
      "reset": "Le quota mensuel est réinitialisé le 1er (heure de New York).",
      "loading": "Chargement de vos limites...",
      "optionsFailed": "Impossible de charger vos limites de tâches. Veuillez réessayer.",
      "submit": "Lancer l’extraction",
      "submitting": "Soumission...",
      "submitted": "Tâche envoyée",
      "failed": "La soumission de la tâche a échoué. Actualisez l'historique avant de réessayer.",
      "exhausted": "Votre quota mensuel est épuisé.",
      "invalid": "Saisissez jusqu'à {limit} mots-clés, chacun ne dépassant pas 500 caractères.",
      "map": {
        "invalidKeyword": "Saisissez un mot-clé de 500 caractères maximum.",
        "keyword": "Mot-clé",
        "keywordPlaceholder": "p. ex. café",
        "locationSearch": "Rechercher des lieux",
        "locate": "Localiser par région",
        "locationPlaceholder": "Sélectionner un pays / une région / une ville",
        "coordinates": "Saisir des coordonnées",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "radius": "Rayon (km)",
        "spacing": "Espacement des grilles (km)",
        "sampleCount": "{count} / {limit} emplacements de recherche",
        "points": "Points de grille : {points}",
        "overLimit": "Réduisez le rayon ou augmentez l'espacement de la grille pour rester dans les emplacements de recherche {limit}.",
        "chooseCenter": "Choisissez une région ou cliquez sur la carte pour définir le centre.",
        "mapLabel": "Choisissez un centre de recherche sur la carte",
        "tilesUnavailable": "Les vignettes de la carte n'ont pas pu se charger. Vous pouvez toujours saisir des coordonnées.",
        "attribution": "contributeurs d’OpenStreetMap"
      },
      "region": {
        "baseKeywords": "Mots-clés de base",
        "basePlaceholder": "café\nrestaurant",
        "country": "Pays",
        "state": "État ou région",
        "citySearch": "Trouver une ville",
        "cityPlaceholder": "Facultatif : choisir des villes",
        "city": "Ville",
        "selectCountry": "Sélectionnez un pays",
        "allStates": "Tous les états ou régions",
        "loading": "Chargement des emplacements...",
        "loadFailed": "Les emplacements n'ont pas pu être chargés. Veuillez réessayer.",
        "retry": "Réessayer",
        "filter": "Filtrer",
        "selectAll": "Tout sélectionner ({count})",
        "clear": "Tout désélectionner",
        "selectedCount": "{count} sélectionné(s)",
        "more": "{shown} sur {total} affichés. Continuez à saisir pour affiner.",
        "selectedRegions": "Emplacements sélectionnés",
        "remove": "Supprimer {name}",
        "noMatch": "Aucun résultat",
        "matchMode": "Phrase de recherche",
        "inMode": "Dans",
        "nearMode": "Près",
        "generate": "Générer des requêtes",
        "needBase": "Saisissez d'abord des mots-clés de base.",
        "needCountry": "Sélectionnez d'abord un pays.",
        "willGenerate": "{count} requêtes seront créées.",
        "finalQueries": "Requêtes finales",
        "finalPlaceholder": "Les requêtes générées apparaissent ici. Vous pouvez les modifier.",
        "attribution": "Données de localisation : GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Tableau de bord | MapsGrab",
      "description": "Gérez vos exportations MapsGrab, vos accès API et vos abonnements dans un seul espace de travail."
    },
    "shell": {
      "skipToContent": "Aller au contenu",
      "sideLabel": "Espace de travail",
      "homeLabel": "Accueil MapsGrab",
      "navLabel": "Menu de l'espace de travail",
      "loading": "Chargement de votre espace de travail...",
      "retry": "Réessayer",
      "navOnline": "Extracteur en ligne",
      "navJobHistory": "Historique",
      "navApi": "API gestion",
      "navSubscriptions": "Abonnements",
      "openMenu": "Ouvrir le menu de l'espace de travail",
      "closeMenu": "Fermer le menu de l'espace de travail",
      "collapseSidebar": "Réduire la barre latérale",
      "expandSidebar": "Développer la barre latérale",
      "back": "Retour"
    },
    "account": {
      "menuButtonLabel": "Menu Ouvrir un compte",
      "menuLabel": "Menu du compte",
      "logout": "Se déconnecter",
      "upgrade": "Mettre à niveau",
      "usageShort": "{used} / {total} enregistrements",
      "planUnavailable": "Indisponible",
      "theme": "Thème",
      "themeLight": "Clair",
      "themeDark": "Sombre",
      "themeSystem": "Système",
      "language": "Langue"
    },
    "history": {
      "title": "Historique des exportations en ligne",
      "description": "Tâches que vous avez exécutées sur Extracteur en ligne, les plus récentes en premier.",
      "refresh": "Rafraîchir",
      "autoRefresh": "Actualisation automatique activée",
      "loading": "Chargement de vos exportations...",
      "loadFailed": "Échec du chargement de votre historique d'exportation.",
      "refreshFailed": "Impossible d'actualiser. Affichage des derniers résultats chargés.",
      "retry": "Réessayer",
      "emptyTitle": "Aucune exportation pour l'instant",
      "emptyHint": "Exécutez une tâche sur Extracteur en ligne et elle apparaîtra ici.",
      "emptyCta": "Aller à l'Extracteur en ligne",
      "recentTitle": "Tâches récentes",
      "viewAll": "Tout afficher",
      "recentEmptyHint": "Les tâches que vous lancez ci-dessus apparaîtront ici.",
      "noMatchTitle": "Aucune tâche correspondante",
      "noMatchHint": "Essayez un autre numéro de tâche ou mot-clé, ou effacez les filtres.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "et {count} de plus",
      "columns": {
        "taskNo": "Tâche",
        "time": "Créé / Terminé",
        "contacts": "E-mail et réseaux",
        "samples": "Recherches",
        "records": "Enregistrements",
        "status": "Statut"
      },
      "status": {
        "queued": "En file d'attente",
        "collecting": "Collecte",
        "publishing": "Préparation CSV",
        "completed": "Complété",
        "partial": "Succès partiel",
        "failed": "Échoué"
      },
      "search": {
        "label": "Rechercher des tâches",
        "placeholder": "Rechercher par numéro de tâche ou mot-clé",
        "clear": "Effacer la recherche"
      },
      "filters": {
        "label": "Filtrer les tâches",
        "button": "Filtres",
        "status": "Statut",
        "all": "Toutes",
        "running": "En cours",
        "clear": "Effacer les filtres"
      },
      "range": {
        "label": "Période",
        "last7": "7 derniers jours",
        "last30": "30 derniers jours",
        "all": "Toute la période",
        "custom": "Période personnalisée",
        "from": "Du",
        "to": "Au",
        "apply": "Appliquer",
        "invalid": "Choisissez une date de début antérieure ou égale à la date de fin."
      },
      "pagination": {
        "label": "Pagination",
        "previous": "Précédent",
        "next": "Suivant",
        "page": "Page {page}",
        "pageSize": "Lignes par page",
        "summary": "{from}–{to} de {total}"
      },
      "detail": {
        "show": "Détails",
        "loading": "Chargement des recherches...",
        "loadFailed": "Échec du chargement des recherches pour cette tâche.",
        "keyword": "Mot-clé",
        "records": "Enregistrements",
        "completed": "Complété",
        "pending": "En attente",
        "viewport": "{lat}, {lng} · zoomer {zoom}"
      },
      "contactsOn": "Activé",
      "contactsOff": "Désactivé",
      "dedupeHint": "Les enregistrements sont comptés après suppression des doublons sur l'ensemble de la tâche.",
      "finished": "Tâche {job} : {status}",
      "finishedRecords": "{count} enregistrements",
      "downloadCsv": "Télécharger CSV",
      "downloadXlsx": "Télécharger Excel",
      "noFile": "Non CSV",
      "errors": {
        "31301": "Impossible de collecter cette recherche.",
        "31302": "Certains résultats ne sont pas disponibles. Les lignes livrées sont conservées.",
        "31303": "Le collectionneur est occupé. Essayer à nouveau.",
        "31304": "Impossible de publier cette exportation."
      },
      "errorFailed": "Impossible de terminer cette recherche.",
      "downloading": "Préparation...",
      "downloadUnavailable": "Aucun CSV téléchargeable. Le fichier a peut-être expiré.",
      "downloadFailed": "Le téléchargement n'a pas pu démarrer. Veuillez réessayer.",
      "signInPrompt": "Connectez-vous pour voir votre historique d'exportation en ligne.",
      "signInCta": "Se connecter",
      "unreachable": "Impossible d'atteindre MapsGrab pour le moment."
    },
    "api": {
      "description": "Gérez votre clé API, votre allocation de demande mensuelle et vos applications d'IA connectées.",
      "docsLink": "Voir API produits",
      "signInPrompt": "Connectez-vous pour gérer votre accès API.",
      "loading": "Chargement de votre accès API...",
      "loadFailed": "Impossible de charger votre accès API. Veuillez réessayer.",
      "retry": "Réessayer",
      "refresh": "Rafraîchir",
      "keyTitle": "Clé API",
      "keyEmpty": "Vous n'avez pas encore généré de clé API.",
      "generateKey": "Générer la clé API",
      "rotateKey": "Remplacer la clé API",
      "generatingKey": "Générateur...",
      "keyOnce": "Copiez cette clé maintenant. Vous ne pourrez plus le consulter après avoir quitté ou actualisé cette page.",
      "keyCreated": "Créé",
      "rotateTitle": "Remplacer votre clé API ?",
      "rotateMessage": "Votre clé actuelle cessera de fonctionner immédiatement. Mettez à jour toutes les applications qui l'utilisent avec la nouvelle clé.",
      "cancel": "Annuler",
      "copyKey": "Copier la clé API",
      "copied": "Copié",
      "copyFailed": "Impossible de copier. Sélectionnez le texte et copiez-le manuellement.",
      "keyFailed": "Impossible de générer une clé API. Veuillez réessayer.",
      "usageTitle": "Utilisation mensuelle de API",
      "usageFailed": "Impossible de charger votre utilisation de l'API. Veuillez réessayer.",
      "usageValue": "{used} / {total} requêtes",
      "usagePeriod": "Période : {period}",
      "quotaExhausted": "Votre allocation mensuelle de demande est épuisée.",
      "quotaReset": "Réinitialisé le 1er (ET) · partagé API/MCP",
      "planTitle": "API forfait",
      "managePlan": "Gérer les abonnements",
      "connectionsTitle": "Connexion",
      "connectTabsLabel": "Mode de connexion",
      "connectDocs": {
        "api": "Référence de l'API",
        "mcp": "Guide de configuration MCP",
        "mcpKey": "Guide avec clé API"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + clé API"
      },
      "apiUrl": "API base URL",
      "mcpUrl": "MCP serveur URL",
      "mcpHint": "Ajoutez ce URL dans votre client MCP. Connectez-vous et approuvez la connexion lors de l'ouverture de ce site Web.",
      "mcpKeyHint": "Pour les clients qui ne peuvent pas ouvrir un navigateur pour se connecter. Les requêtes utilisent votre clé API, sans étape d'approbation.",
      "mcpConfigTitle": "Configuration du client",
      "mcpConfigHint": "Ajoutez cette entrée à la configuration de votre client MCP. Les noms des champs varient légèrement selon les clients.",
      "mcpUnavailable": "L'adresse de connexion MCP n'est pas encore disponible.",
      "copyUrl": "Copier URL",
      "curlTitle": "Démarrage rapide",
      "curlHint": "Remplacez l’espace réservé par votre clé API complète.",
      "grants": {
        "title": "Applications connectées",
        "description": "Applications que vous avez autorisées à rechercher des entreprises et à lire des avis et des photos publiques en utilisant votre allocation API.",
        "loading": "Chargement des applications connectées...",
        "empty": "Aucune application n'est connectée.",
        "loadFailed": "Impossible de charger les applications connectées. Veuillez réessayer.",
        "selfDeclared": "Nom que l'application se donne : {name}",
        "createdLabel": "Connecté",
        "refreshedLabel": "Dernière actualisation",
        "notRefreshed": "Pas encore",
        "revoke": "Déconnecter",
        "revokeTitle": "Déconnecter cette application ?",
        "revokeMessage": "{host} perdra immédiatement l'accès et aura besoin de votre approbation pour vous reconnecter.",
        "revokeFailed": "Impossible de déconnecter cette application. Veuillez réessayer.",
        "paginationLabel": "Pages d'applications connectées",
        "pageOf": "Page {page} de {pages}"
      }
    },
    "subscriptions": {
      "title": "Abonnements",
      "description": "Plans et statut de renouvellement pour Extracteur en ligne, l'extension de navigateur et le API. Achetez ou mettez à niveau sur la page Tarifs.",
      "lines": {
        "online": "Extracteur en ligne",
        "extension": "Extension du navigateur",
        "api": "API"
      },
      "planLabel": "Plan",
      "expiresLabel": "Renouvelle / expire",
      "free": "Gratuit",
      "unavailable": "Temporairement indisponible",
      "autoRenewOn": "Renouvellement automatique activé",
      "autoRenewOff": "Renouvellement automatique désactivé",
      "paidVia": "Payé via {method}",
      "subscribeCta": "Choisissez un forfait",
      "pricingLink": "Voir les tarifs",
      "manageSubscription": "Gérer l'abonnement",
      "managingSubscription": "Ouverture...",
      "manageFailed": "Impossible d'ouvrir la gestion de l'abonnement. Veuillez réessayer.",
      "signInPrompt": "Connectez-vous pour voir vos abonnements."
    },
    "cancelGuide": {
      "title": "Gérez votre abonnement auprès du prestataire de paiement",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Connectez-vous à PayPal et ouvrez les paramètres.",
            "Allez dans Paiements, puis Paiements automatiques.",
            "Sélectionnez MapsGrab et choisissez Annuler."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Ouvrez le lien du portail client à partir de votre e-mail d'achat.",
            "Connectez-vous et sélectionnez votre abonnement MapsGrab.",
            "Choisissez Annuler."
          ]
        }
      ],
      "closeLabel": "Fermer"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Saisissez les données commerciales Google Maps dans CSV et JSON",
        "description": "MapsGrab est une extension de navigateur et une boîte à outils Web qui collecte des informations commerciales accessibles au public à partir de Google Maps (noms, téléphones, avis, photos, e-mails) et les exporte vers CSV ou JSON."
      },
      "hero": {
        "announce": {
          "badge": "Nouveau",
          "text": "MCP serveur pour les agents IA"
        },
        "title": {
          "firstLine": "Collectez les données Google Maps",
          "secondLine": "en",
          "accent": "un clic",
          "end": "."
        },
        "lead": "Collectez des données commerciales publiques à partir de Google Maps (noms, téléphones, sites Web, avis, photos et e-mails) et exportez des CSV ou JSON propres en quelques secondes.",
        "search": {
          "label": "Rechercher un mot-clé",
          "typing": [
            "café à Portland",
            "dentiste à Austin, Texas",
            "plombier près de Chicago",
            "studio de yoga à Brooklyn",
            "hôtels à Miami Beach"
          ],
          "submit": "Aperçu des résultats",
          "loading": "Recherche…",
          "suggestLabel": "Essayer",
          "suggestions": [
            "café à Portland",
            "dentiste à Austin, Texas",
            "plombier près de Chicago"
          ]
        },
        "trust": [
          "Aucune carte de crédit requise",
          "{records} enregistrements gratuits / mois",
          "CSV & JSON exporter"
        ],
        "dashboard": "Ouvrir le Scraper en ligne",
        "theater": {
          "panelLabel": "Aperçu du panneau MapsGrab",
          "extensionActive": "MapsGrab extension active",
          "mapFilters": [
            "Ouvert maintenant",
            "Les mieux notés",
            "Prix"
          ],
          "live": "En direct",
          "done": "Fait",
          "start": "Lancer l’extraction",
          "pause": "Pause",
          "extracting": "Extraction de {count}…",
          "finished": "Terminé · {count} lieux",
          "kpis": {
            "phones": "téléphones",
            "emails": "e-mails",
            "websites": "sites Web"
          },
          "export": "Exporter la liste détaillée - {count} (.CSV)",
          "exportSaved": "Exportation enregistrée",
          "emailFound": "E-mail trouvé",
          "averageRating": "Note moyenne",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} avis"
        },
        "preview": {
          "title": "Résultats",
          "count": "{count} entreprises sur la première page de résultats",
          "columns": {
            "name": "Nom",
            "address": "Adresse",
            "category": "Catégorie",
            "rating": "Notation",
            "reviews": "Avis",
            "phone": "Téléphone"
          },
          "locked": "Connectez-vous et soumettez vos mots-clés dans Extracteur en ligne pour collecter et exporter les résultats.",
          "signIn": "Connectez-vous pour démarrer une tâche complète",
          "failed": "Impossible de charger l'aperçu. Veuillez réessayer.",
          "empty": "Aucune entreprise trouvée sur la première page de résultats."
        }
      },
      "facts": {
        "caption": "MapsGrab en chiffres",
        "items": [
          {
            "value": 36,
            "label": "colonnes de données par entreprise"
          },
          {
            "value": 11,
            "label": "champs de révision, réponses du propriétaire incluses"
          },
          {
            "value": 6,
            "label": "réseaux sociaux adaptés par site web"
          },
          {
            "value": "freeRecords",
            "label": "enregistrements gratuits, tous les mois"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "façons de l'exécuter : Extension, En ligne, API — plus MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Comment ça marche",
          "title": {
            "lead": "D'une recherche cartographique à un ",
            "accent": "tableur",
            "tail": " en trois étapes"
          },
          "lead": "Pas de code et pas de copier-coller. MapsGrab lit ce que Google Maps vous montre déjà et le transforme en lignes structurées."
        },
        "steps": [
          {
            "title": "Rechercher Google Maps",
            "body": "Ouvrez Google Maps et recherchez n'importe quel type d'entreprise et emplacement, exactement comme vous le feriez normalement."
          },
          {
            "title": "Lancer l’extraction",
            "body": "Cliquez sur {action}. MapsGrab fait défiler les résultats, collecte les listes et, lorsqu'il est activé, enrichit les contacts.",
            "action": "Lancer l’extraction"
          },
          {
            "title": "Exporter n'importe où",
            "body": "Téléchargez CSV ou JSON avec les colonnes de votre choix : les avis et les photos atterrissent dans leurs propres fichiers, prêts pour Excel ou votre CRM."
          }
        ],
        "searchSample": "boulangerie à Seattle",
        "columnsUnit": "colonnes",
        "reviewsFile": "avis"
      },
      "products": {
        "head": {
          "kicker": "Produits",
          "title": {
            "lead": "Trois façons de ",
            "accent": "récupérer",
            "tail": " des données Maps."
          },
          "lead": "Choisissez l'extension de navigateur, le Extracteur en ligne basé sur le cloud ou le API. L'extension fonctionne dans votre propre navigateur ; le Extracteur en ligne et le API partagent un seul moteur cloud."
        },
        "cards": {
          "extension": {
            "badge": "Extension de navigateur",
            "title": "Récupérez des données pendant que vous parcourez Google Maps",
            "body": "Extrayez des données professionnelles, des avis et des photos des pages Maps que vous ouvrez, puis exportez le tout localement. Bord, Firefox et Chromium.",
            "link": "Découvrez l'extension"
          },
          "online": {
            "badge": "Extracteur en ligne",
            "title": "Le cloud fonctionne. Rien à installer.",
            "body": "Collez des mots-clés, collectez les détails de l'entreprise dans le cloud et téléchargez une colonne 37 dédupliquée CSV par tâche.",
            "link": "Explorez Scraper en ligne"
          },
          "api": {
            "badge": "API",
            "title": "Nettoyer JSON sur HTTP",
            "body": "Données commerciales et avis pour vos propres applications — une clé API.",
            "link": "Explorez les API"
          },
          "mcp": {
            "badge": "MCP serveur",
            "title": "Données Live Maps pour vos agents IA",
            "body": "Recherche et critiques en tant qu'outils MCP pour Claude Code, Cursor, VS Code et Codex.",
            "link": "Explorez le serveur MCP"
          }
        },
        "extracting": "Extraction de {count}…",
        "queue": {
          "rows": "{count} lignes",
          "processing": "Traitement"
        },
        "chat": {
          "prompt": "Trouvez des dentistes à Austin notés 4.5+ avec un site Web",
          "answer": "{count} correspondances trouvées. Les trois premiers :"
        }
      },
      "fields": {
        "head": {
          "kicker": "Les données",
          "title": {
            "lead": "36 colonnes. ",
            "accent": "Chacun",
            "tail": " utile."
          },
          "lead": "L'extension exporte un schéma à partir des résultats de recherche et des pages professionnelles : coordonnées, emplacement, profil, évaluations et tous les identifiants dont vous avez besoin pour faire correspondre les enregistrements ultérieurement."
        },
        "filtersLabel": "Groupes de terrain",
        "all": "Tous",
        "groups": {
          "contact": {
            "filter": "Contact",
            "label": "Contact"
          },
          "location": {
            "filter": "Emplacement",
            "label": "Emplacement"
          },
          "profile": {
            "filter": "Profil",
            "label": "Profil d'entreprise"
          },
          "reviews": {
            "filter": "Notes",
            "label": "Notes et avis"
          },
          "ids": {
            "filter": "Identifiants et liens",
            "label": "Identifiants et liens"
          }
        },
        "sampleLabel": "Exemple de valeur",
        "emptySample": "(vide)",
        "descriptions": {
          "Name": "Nom de l'entreprise exactement tel qu'indiqué sur la liste.",
          "Description": "Brève description du profil de l'entreprise.",
          "Fulladdress": "Adresse postale complète et formatée.",
          "Street": "Ligne de rue de l'adresse.",
          "Municipality": "Ville ou localité.",
          "Categories": "Chaque catégorie attribuée à l'entreprise.",
          "About": "Attributs de l'onglet À propos.",
          "Plus Code": "Colonne réservée au code de localisation ouvert — exportée vide pour l'instant.",
          "Time Zone": "Fuseau horaire IANA de l’emplacement.",
          "Price": "Niveau de prix indiqué sur l'annonce.",
          "Note": "Note ou point culminant du marchand.",
          "Amenities": "Commodités et options de services.",
          "Hotel Class": "Classe d'étoiles pour les annonces d'hébergement.",
          "Phone": "Numéro de téléphone principal indiqué sur l'annonce.",
          "Phones": "Chaque numéro de téléphone trouvé pour l'entreprise.",
          "Claimed": "Si le propriétaire a revendiqué le profil.",
          "Owner": "Nom du propriétaire sur le profil.",
          "Owner Id": "ID de contributeur du compte propriétaire.",
          "Owner Link": "Lien vers la page des contributeurs du propriétaire.",
          "Email": "Adresses e-mail trouvées sur le site Web de l'entreprise.",
          "Social Medias": "Profils sociaux liés depuis le site Web.",
          "Review Count": "Nombre total d'avis.",
          "Average Rating": "Note moyenne en étoiles.",
          "Review URL": "Lien direct vers le panel d'avis.",
          "Google Maps URL": "Lien court stable construit à partir du CID.",
          "Google Knowledge URL": "Lien de recherche du panneau de connaissances.",
          "Latitude": "Latitude en degrés décimaux.",
          "Longitude": "Longitude en degrés décimaux.",
          "Website": "Site officiel de l'annonce.",
          "Domain": "Domaine enregistrable du site Web.",
          "Opening Hours": "Horaires hebdomadaires, jours de fermeture marqués.",
          "Featured Image": "Photo de couverture URL de l'annonce.",
          "Cid": "ID client — la forme décimale du FID.",
          "Fid": "ID de fonctionnalité composé de deux moitiés hexadécimales.",
          "Place Id": "Stable Google Place ID.",
          "Kgmid": "ID de la machine Knowledge Graph."
        },
        "reviews": {
          "title": "+ 11 colonnes d'avis",
          "body": "Exporté séparément, paginé jusqu'à la limite de votre forfait."
        },
        "photos": {
          "title": "+ photos URL listes",
          "body": "Photo d'album public URLs par entreprise, Street View filtrée."
        },
        "sampleCsv": "Télécharger l'échantillon CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Enrichissement",
          "title": {
            "lead": "D'une épingle à une personne, vous pouvez ",
            "accent": "e-mail",
            "tail": ""
          },
          "lead": "Lorsque l'enrichissement est activé, MapsGrab vérifie le site officiel de chaque entreprise et remplit les canaux de contact direct pendant l'extraction."
        },
        "points": [
          "Adresses e-mail trouvées sur le site Web de l'entreprise",
          "Profils sociaux : Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Activé par défaut sur les forfaits Online payants, un paramètre dans l'extension",
          "Inclus dans les réponses de recherche API avec un seul indicateur — aucune étape d'enrichissement distincte"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Pour les développeurs",
          "title": {
            "lead": "Branchez les données Maps dans ",
            "accent": "tout ce",
            "tail": " que vous créez"
          },
          "lead": "Le moteur cloud derrière Extracteur en ligne, exposé comme un serveur HTTP API et MCP. Structuré JSON, une clé, pas de HTML à analyser."
        },
        "listLabel": "Produits de développement",
        "items": {
          "search": {
            "title": "API d’extraction",
            "description": "Entreprises pour n’importe quel mot-clé et emplacement"
          },
          "reviews": {
            "title": "API d’avis",
            "description": "Notes, SMS et réponses du propriétaire"
          },
          "photos": {
            "title": "API de photos",
            "description": "Photo publique URLs par entreprise"
          },
          "mcp": {
            "title": "MCP serveur",
            "description": "Outils de recherche et d'évaluation pour tout client MCP"
          }
        },
        "langLabel": "Langue",
        "copyLabel": "Demande de copie",
        "sending": "Envoi de la demande…",
        "response": "Réponse · 200 OK · {ms} ms",
        "toolCall": "Appel d'outil · {tool} · 200 OK",
        "exploreApi": "Explorez les API",
        "apiPricing": "Tarif API",
        "worksWith": "Fonctionne avec les outils que vous utilisez déjà",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP lots"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Cas d'utilisation",
          "title": {
            "lead": "Conçu pour le travail ",
            "accent": "après",
            "tail": " la recherche"
          }
        },
        "cards": [
          {
            "label": "Génération de leads",
            "title": "Listes de prospects locaux",
            "body": "Recherchez une catégorie et une ville, puis exportez l'intégralité de la page de résultats (téléphones, sites Web et e-mails inclus) dans une seule feuille de calcul."
          },
          {
            "label": "Référencement local",
            "title": "Benchmarks des concurrents",
            "body": "Extrayez les notes et le nombre d'avis pour chaque concurrent dans une zone en un seul passage, et créez le rapport directement à partir de l'exportation."
          },
          {
            "label": "Étude de marché",
            "title": "Ensembles de données de localisation",
            "body": "Collectez les identifiants et les coordonnées de chaque succursale ou emplacement concurrent, prêts pour vos outils de cartographie et de routage."
          }
        ],
        "leadTags": [
          "e-mail",
          "téléphone",
          "e-mail",
          "site"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Tarifs",
          "title": {
            "lead": "Commencez gratuitement. ",
            "accent": "Échelle",
            "tail": " quand cela rapporte."
          },
          "lead": "Chaque produit dispose d'un niveau gratuit sans limite de durée. Améliorez uniquement la surface que vous utilisez réellement."
        },
        "lines": {
          "extension": {
            "title": "Extension du navigateur",
            "billing": "Mensuel",
            "link": "Voir les plans d'extension"
          },
          "online": {
            "title": "Extracteur en ligne",
            "billing": "Une fois",
            "link": "Voir les forfaits en ligne"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Une fois",
            "link": "Voir les forfaits API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Outils gratuits",
          "title": {
            "lead": "Petits outils pour Maps ",
            "accent": "utilisateurs expérimentés",
            "tail": ""
          },
          "lead": "Sept utilitaires qui s'exécutent entièrement dans votre navigateur : ce que vous collez ne quitte jamais votre appareil. Seule exception : le Vérificateur de courrier électronique envoie l'adresse à notre serveur pour la vérifier."
        },
        "descriptions": {
          "place-id-finder": "Collez un emplacement Maps URL et lisez ses Place ID, CID et FID.",
          "review-link-generator": "Obtenez le lien direct « écrire un avis » pour toute entreprise.",
          "email-checker": "Vérifiez si une adresse e-mail peut réellement recevoir des messages.",
          "lat-long-to-dms": "Coordonnées décimales en degrés, minutes et secondes.",
          "dms-to-dd": "DMS revient aux degrés décimaux propres.",
          "bulk-keywords-generator": "Chaque combinaison « mot clé + emplacement », prête à coller.",
          "merge-csv": "Fusionnez les exportations CSV en un seul fichier, aligné par en-tête."
        },
        "more": "Plus d'outils en route"
      },
      "faq": {
        "kicker": "Questions fréquentes",
        "title": {
          "lead": "",
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "lead": "Les réponses courtes. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
        "contact": "Contacter l'assistance",
        "items": [
          {
            "question": "L'utilisation de MapsGrab est-elle gratuite ?",
            "answer": "Oui. L'extension fonctionne sans compte et comprend un quota mensuel gratuit d'enregistrements. Les forfaits payants sur la page Tarifs augmentent les limites lorsque vous en avez besoin de plus."
          },
          {
            "question": "Quels navigateurs sont pris en charge ?",
            "answer": "Téléchargez MapsGrab depuis la page Extension. Chrome, Edge et Brave chargent le ZIP décompressé ; Firefox utilise un module complémentaire temporaire distinct qui doit être rechargé après un redémarrage. La page comprend des instructions d'installation et de mise à jour."
          },
          {
            "question": "D’où proviennent les données et est-il légal de les collecter ?",
            "answer": "MapsGrab collecte uniquement les informations affichées publiquement sur les pages Google Maps que vous visitez — les mêmes détails que tout visiteur peut lire. Nous n'accédons pas aux comptes privés, au contenu sécurisé ou aux données non publiques."
          },
          {
            "question": "Dois-je installer quelque chose pour les outils Web ?",
            "answer": "Non. Les outils Web gratuits fonctionnent entièrement dans votre navigateur : votre saisie ne quitte jamais votre appareil. Seule exception : le Vérificateur de courrier électronique envoie l'adresse saisie à notre serveur, où un service de vérification d'e-mails la contrôle sans envoyer d'e-mail."
          },
          {
            "question": "Vers quels formats puis-je exporter ?",
            "answer": "Les exportations se présentent sous la forme CSV ou JSON avec la sélection de champ que vous choisissez, dédoublonnées par Place ID."
          },
          {
            "question": "Est-ce que MapsGrab voit les données que je collecte ?",
            "answer": "Vos paramètres et résultats sont stockés localement dans votre navigateur. Nos serveurs gèrent uniquement la configuration à distance, l'état des comptes et des quotas, l'enrichissement facultatif par courrier électronique/social et les journaux d'utilisation minimaux."
          }
        ]
      },
      "cta": {
        "kicker": "Commencer",
        "title": {
          "lead": "Commencez à saisir dans ",
          "accent": "minutes",
          "tail": ""
        },
        "lead": "Installez l'extension, ouvrez Google Maps, recherchez et exportez votre première liste – aucun compte requis.",
        "install": "Installez MapsGrab gratuitement",
        "online": "Essayez le Scraper en ligne",
        "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab pour Chrome, Edge et Firefox — Google Maps Extension d'extracteur",
        "description": "Extrayez 36 colonnes de données commerciales, d'avis et de photos de Google Maps, enrichissez les enregistrements avec des e-mails et des liens sociaux, exécutez des tâches par lots et exportez vers CSV ou JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Télécharger pour Chrome, Edge et Firefox"
        },
        "title": {
          "lead": "L'extracteur Google Maps pour ",
          "accent": "votre navigateur",
          "tail": ""
        },
        "lead": "Ouvrez n'importe quelle page de recherche ou d'entreprise Google Maps et récupérez ce qui y est affiché publiquement : données commerciales, avis, photos et coordonnées. Tout s'exporte vers CSV ou JSON, directement depuis votre navigateur.",
        "downloadCta": "Télécharger pour Chrome et Edge",
        "installCta": "Guide d'installation",
        "meta": [
          "Aucun compte requis",
          "1,000 enregistrements gratuits / mois",
          "Les exportations restent sur votre machine"
        ],
        "theater": {
          "panelLabel": "Aperçu du panneau MapsGrab",
          "extensionActive": "MapsGrab est actif sur cette page",
          "dock": "Dock gauche/droite",
          "filters": [
            "Ouvert maintenant",
            "Les mieux notés",
            "Prix"
          ],
          "open": "Ouvrir",
          "closes": "Ferme {time}",
          "endOfList": "Vous avez atteint la fin de la liste.",
          "start": "Lancer l’extraction",
          "extracting": "Extraction de {count}…",
          "pause": "Pause",
          "complete": "Extrait terminé.",
          "reset": "Réinitialiser",
          "kpis": {
            "phones": "téléphones",
            "websites": "sites Web",
            "emails": "e-mails"
          },
          "exportCta": "Exporter la liste détaillée - {count} (.CSV)",
          "saved": "Enregistré dans les téléchargements",
          "scrollChip": {
            "label": "Défilement automatique",
            "value": "Au rythme humain, 5–10 s"
          },
          "dedupeChip": {
            "label": "Dédupliqué",
            "value": "par Place ID"
          }
        }
      },
      "facts": {
        "caption": "L'extension en un coup d'oeil",
        "items": [
          {
            "value": 36,
            "label": "colonnes par entreprise, du nom à Place ID"
          },
          {
            "value": 11,
            "label": "colonnes de révision, réponses du propriétaire incluses"
          },
          {
            "value": 6,
            "label": "réseaux sociaux adaptés par site web"
          },
          {
            "value": 1000,
            "label": "enregistrements gratuits chaque mois, aucun compte requis"
          },
          {
            "value": 500,
            "label": "mots-clés ou révision URLs par tâche par lots"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Où ça marche",
          "title": {
            "lead": "Un panneau pour chaque ",
            "accent": "Vue Cartes",
            "tail": ""
          },
          "lead": "Le panneau MapsGrab apparaît juste sur Google Maps. Les résultats de recherche, les pages professionnelles et les listes enregistrées bénéficient chacun du bon mode d'extraction : pas de copier-coller, pas de jonglerie entre les onglets."
        },
        "search": {
          "title": "Résultats de la recherche",
          "description": "Appuyez sur Démarrer l’extraction lors de n’importe quelle recherche. MapsGrab fait défiler la liste des résultats à un rythme humain et collecte chaque liste au fur et à mesure de son chargement."
        },
        "place": {
          "title": "Pages professionnelles",
          "description": "Sur une page professionnelle, l'onglet Avis et photos passe par les avis et les albums photo : les avis sont exportés avec des colonnes 11, les photos sous forme de listes URL.",
          "tabs": [
            "Aperçu",
            "Avis et photos"
          ],
          "reviewsCta": "Commencez à extraire les avis",
          "photosCta": "Commencez à extraire des photos",
          "reviewsCount": "{count} avis",
          "photosCount": "{count} photos"
        },
        "saved": {
          "title": "Listes enregistrées",
          "description": "Ouvrez une liste enregistrée et appuyez une fois sur Démarrer. MapsGrab ouvre chaque emplacement tour à tour et le récupère – pas de clics par élément.",
          "listName": "Favoris · {count} lieux"
        }
      },
      "features": {
        "head": {
          "kicker": "Caractéristiques",
          "title": {
            "lead": "Tout ce qu'une page Maps affiche, ",
            "accent": "structuré",
            "tail": ""
          },
          "lead": "Un schéma d'extraction dans les résultats de recherche et les pages professionnelles, adapté à l'interface Google Maps actuelle et mis à jour à distance lorsque Google change."
        },
        "tabsLabel": "Fonctionnalités d'extension",
        "tabs": [
          {
            "id": "business",
            "title": "Données commerciales",
            "description": "36 colonnes par entreprise, capturées au fur et à mesure que la liste défile."
          },
          {
            "id": "reviews",
            "title": "Avis",
            "description": "Avis avec réponses du propriétaire, paginés automatiquement."
          },
          {
            "id": "photos",
            "title": "Photos",
            "description": "Photos d'album sous forme de listes URL prêtes à l'emploi."
          },
          {
            "id": "enrichment",
            "title": "E-mail et enrichissement social",
            "description": "Canaux de contact direct depuis le site officiel."
          },
          {
            "id": "batch",
            "title": "Tâches par lots",
            "description": "Une file d'attente de mots-clés ou d'avis URLs, parcourue élément par élément."
          },
          {
            "id": "export",
            "title": "Exporter",
            "description": "CSV ou JSON, enregistré directement sur votre machine."
          }
        ],
        "business": {
          "claimed": "Réclamé",
          "fields": {
            "phone": "Téléphone",
            "website": "Site web",
            "rating": "Note moyenne",
            "hours": "Horaires d'ouverture",
            "timeZone": "Fuseau horaire",
            "coordinates": "Coordonnées",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} avis",
          "columns": "{count} colonnes par entreprise",
          "reserved": "Plus Code réservé",
          "more": "+{count} plus"
        },
        "reviews": {
          "title": "Avis",
          "columns": "{count} colonnes",
          "ownerReply": "Réponse du propriétaire",
          "loading": "Chargement de la page suivante de commentaires"
        },
        "photos": {
          "streetView": "Street View · filtré"
        },
        "enrichment": {
          "website": "Site officiel",
          "moreNetworks": "X, YouTube et TikTok ont ​​​​également été vérifiés"
        },
        "batch": {
          "complete": "{count} terminé",
          "stuck": "{count} bloqué",
          "total": "{count} total",
          "done": "Terminé · {count}",
          "skipped": "Aucun progrès pendant 90 s · ignoré",
          "running": "Extraction…",
          "queued": "En file d'attente",
          "autoExport": "Exporte automatiquement lorsque la tâche est terminée"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} lignes · {selected} de {total} colonnes sélectionnées · dédupliquées par Place ID",
          "destinations": [
            {
              "title": "Téléchargements",
              "description": "Enregistré par votre navigateur"
            },
            {
              "title": "Sélecteur de colonnes",
              "description": "Exportez uniquement les colonnes dont vous avez besoin"
            },
            {
              "title": "Téléchargement automatique",
              "description": "Enregistre dès la fin de l'extraction"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Tâches par lots",
          "title": {
            "lead": "Mettez la liste en file d'attente. ",
            "accent": "Éloignez-vous.",
            "tail": ""
          },
          "lead": "Collez jusqu'à 500 mots-clés ou révisez URLs dans une seule tâche. MapsGrab les parcourt élément par élément avec une progression en direct, ignore tout ce qui bloque et exporte automatiquement lorsque la tâche est terminée."
        },
        "checks": [
          "Les tâches de mots clés exécutent une recherche Maps par mot clé",
          "Les tâches Review-URL collectent des avis entreprise par entreprise",
          "L'état de la tâche est enregistré sur le disque - il reprend après le redémarrage du navigateur",
          "Jusqu'à 150 tâches enregistrées, un lot exécuté à la fois"
        ],
        "mock": {
          "tabs": [
            "Outil de données de mots clés en masse",
            "Extracteur d'avis en vrac Google"
          ],
          "taskName": "Nom de la tâche",
          "taskPlaceholder": "par ex. 100 mots-clés, agence de design",
          "keywords": "Mots-clés · un par ligne",
          "lineCount": "{count} / {limit}",
          "start": "Lancer l’extraction",
          "columns": {
            "task": "Nom de la tâche",
            "status": "Statut",
            "actions": "Actes"
          },
          "running": "En cours d'exécution",
          "complete": "Complet",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} bloqué",
          "progressExported": "{done} / {total} · exporté",
          "lines": {
            "run": "extraire…",
            "done": "complet",
            "stuck": "bloqué · ignoré"
          },
          "toast": "Tâche terminée – exportée",
          "chip": {
            "label": "État de la tâche",
            "value": "Enregistré sur le disque"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Le local d’abord",
          "title": {
            "lead": "Vos résultats restent ",
            "accent": "dans votre navigateur",
            "tail": ""
          },
          "lead": "Les paramètres et les résultats sont stockés localement. Nos serveurs gèrent uniquement la configuration à distance, l'état des comptes et des quotas, l'enrichissement facultatif de la messagerie électronique et des réseaux sociaux et les journaux d'utilisation minimaux."
        },
        "checks": [
          "Les exports sont générés sur votre machine",
          "La sélection de colonnes et la déduplication Place ID s'exécutent localement avant l'enregistrement du fichier",
          "La configuration à distance maintient le panneau à jour lorsque Google Maps change — pas de réinstallation",
          "Si quelque chose ne peut pas être lu, le panneau affiche une erreur au lieu d'échouer silencieusement"
        ],
        "diagram": {
          "browser": "Votre navigateur",
          "servers": "MapsGrab serveurs",
          "nodes": {
            "mapsTab": "Onglet Google Maps",
            "panel": "Panneau MapsGrab",
            "storage": "Stockage local",
            "exports": "Vos exportations",
            "config": "Configuration à distance",
            "quota": "Compte et quota",
            "enrichment": "Enrichissement"
          },
          "flows": {
            "rows": "lignes commerciales",
            "rules": "règles",
            "usage": "usage",
            "websites": "sites Web d'entreprise → e-mails et réseaux sociaux"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Installer",
          "title": {
            "lead": "Installez ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "Téléchargez le ZIP ici et suivez les étapes correspondant à votre navigateur. Chrome, Edge et Brave chargent le dossier décompressé. Firefox utilise un module complémentaire temporaire distinct qui doit être rechargé après un redémarrage. Cliquez sur n’importe quelle image pour l’afficher en taille réelle."
        },
        "zip": {
          "title": "Installation directe (version zip)",
          "description": "Choisissez le ZIP pour votre navigateur. Extrayez-le dans un dossier que vous conservez, puis chargez-le à l'aide du guide ci-dessous. Pour mettre à jour, téléchargez un nouveau ZIP, remplacez les fichiers de ce dossier et rechargez l'extension.",
          "button": "Chrome, Bord et Brave ZIP",
          "firefoxButton": "Firefox ZIP (module complémentaire temporaire)",
          "meta": "Version {version} · pré-version"
        },
        "browserLabel": "Navigateur",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome et bord",
            "note": "Edge, Chrome, Brave et autres navigateurs Chromium",
            "steps": [
              {
                "title": "Téléchargez et décompressez",
                "description": [
                  "Télécharger ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Sur Windows, faites un clic droit dessus et choisissez « Extraire tout ». Sur macOS, double-cliquez dessus. Conservez le dossier extrait."
                ],
                "shot": "MapsGrab ZIP téléchargé en Chrome"
              },
              {
                "title": "Ouvrir la page des extensions",
                "description": [
                  "Ouvrir ",
                  {
                    "code": "chrome://extensions"
                  },
                  " en Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " dans Edge, ou ",
                  {
                    "code": "brave://extensions"
                  },
                  " en Brave."
                ],
                "shot": "La page de gestion des extensions"
              },
              {
                "title": "Activer le mode développeur",
                "description": [
                  "Activez le mode développeur sur la page des extensions. En Chrome, le switch est en haut à droite."
                ],
                "shot": "Mode développeur activé avec le bouton Charger décompressé visible"
              },
              {
                "title": "Chargez le dossier décompressé",
                "description": [
                  "Cliquez sur « Charger décompressé » et sélectionnez le dossier extrait. MapsGrab apparaît dans la liste des extensions. Ouvrez une recherche Google Maps pour l'utiliser."
                ],
                "shot": "Chargement déballé avec la carte MapsGrab ajoutée"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Module complémentaire temporaire ; rechargez-le après le redémarrage Firefox",
            "steps": [
              {
                "title": "Téléchargez et décompressez",
                "description": [
                  "Télécharger ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Sur Windows, faites un clic droit dessus et choisissez « Extraire tout ». Sur macOS, double-cliquez dessus. Conservez le dossier extrait."
                ],
                "shot": "MapsGrab Firefox ZIP téléchargé en Firefox"
              },
              {
                "title": "Ouvrez la page de débogage",
                "description": [
                  "Accédez à ",
                  {
                    "code": "about:debugging"
                  },
                  ", puis sélectionnez votre navigateur dans la barre latérale gauche."
                ],
                "shot": "Firefox page de débogage avec les contrôles complémentaires temporaires"
              },
              {
                "title": "Charger le module complémentaire",
                "description": [
                  "Cliquez sur « Charger le module complémentaire temporaire… » et choisissez ",
                  {
                    "code": "manifest.json"
                  },
                  " dans le dossier décompressé. Un module complémentaire temporaire se décharge au redémarrage de Firefox ; répétez cette étape pour le charger à nouveau."
                ],
                "shot": "MapsGrab chargé en tant qu'extension temporaire Firefox avec son script d'arrière-plan en cours d'exécution"
              }
            ]
          }
        ],
        "help": {
          "title": "Un problème d'installation ?",
          "description": "Envoyez-nous le nom du navigateur et ce que vous avez vu – nous vous débloquerons.",
          "cta": "Contacter l'assistance"
        },
        "notes": {
          "kicker": "Notes de version",
          "version": "0.1.0",
          "status": "Pré-version",
          "date": "Août 2026",
          "items": [
            "Première pré-version de l'extension MapsGrab",
            "Extraction de recherche Google Maps avec défilement automatique et schéma de colonnes 36",
            "Revue et extraction de photos des pages professionnelles",
            "Enrichissement des e-mails et des réseaux sociaux par entreprise",
            "Mot-clé par lots et tâches de révision URL avec état de tâche sur le disque",
            "Export CSV / JSON avec sélection de champs et déduplication Place ID",
            "Construit pour Microsoft Edge et Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Plans d'extension",
          "title": {
            "lead": "Une extension, trois ",
            "accent": "plans",
            "tail": ""
          },
          "lead": "Chaque ligne collectée par l'extension (une entreprise, un avis ou une photo) compte pour un enregistrement. Tous les plans incluent des critiques, des photos et des tâches par lots ; les forfaits payants exportent toutes les colonnes 36, y compris les e-mails et l'enrichissement social, avec un volume mensuel plus important."
        },
        "note": "L'utilisation mensuelle est réinitialisée le 1er en New York ; les enregistrements inutilisés ne sont pas reportés.",
        "compare": "Comparez tous les forfaits"
      },
      "faq": {
        "kicker": "Questions fréquentes",
        "title": {
          "lead": "",
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "lead": "Les réponses courtes. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
        "contact": "Contacter l'assistance",
        "items": [
          {
            "question": "L’extension est-elle gratuite ?",
            "answer": "Oui. L'extension fonctionne sans compte et inclut 1,000 enregistrements chaque mois. Les forfaits payants sur la page Tarifs ajoutent toutes les colonnes 36 avec enrichissement des e-mails et des réseaux sociaux, et augmentent le volume mensuel."
          },
          {
            "question": "Quels navigateurs sont pris en charge ?",
            "answer": "Chrome, Edge, Brave et autres navigateurs Chromium chargent le ZIP décompressé téléchargé ici. Firefox a un ZIP séparé pour le chargement temporaire ; rechargez-le après chaque redémarrage du navigateur. Suivez le guide d'installation ci-dessus."
          },
          {
            "question": "Dois-je me connecter ?",
            "answer": "Non. L’extraction de base fonctionne sans compte. Le quota est compté par compte connecté ou par appareil de navigation lorsque vous n'êtes pas connecté : connectez-vous avec le compte qui possède un forfait afin que son volume le plus élevé s'applique."
          },
          {
            "question": "Qu’est-ce qui compte comme record ?",
            "answer": "Chaque ligne collectée par l'extension compte pour un enregistrement : une entreprise issue d'une recherche ou d'une liste enregistrée, un avis ou une photo. L’enrichissement par courrier électronique et social n’ajoute pas d’enregistrements."
          },
          {
            "question": "Que se passe-t-il lorsque Google Maps change ?",
            "answer": "Les règles d'extraction sont livrées sous forme de configuration à distance, de sorte que les correctifs atteignent le panneau sans réinstaller l'extension. Si une page ne peut pas être lue, le panneau affiche une erreur au lieu d'échouer silencieusement."
          },
          {
            "question": "Est-ce que MapsGrab voit les données que je collecte ?",
            "answer": "Vos paramètres et résultats sont stockés localement dans votre navigateur. Nos serveurs gèrent uniquement la configuration à distance, l'état des comptes et des quotas, l'enrichissement facultatif de la messagerie électronique et des réseaux sociaux et les journaux d'utilisation minimaux."
          },
          {
            "question": "D’où proviennent les données et est-il légal de les collecter ?",
            "answer": "MapsGrab collecte uniquement les informations affichées publiquement sur les pages Google Maps que vous visitez — les mêmes détails que tout visiteur peut lire. Nous n'accédons pas aux comptes privés, au contenu sécurisé ou aux données non publiques."
          }
        ]
      },
      "cta": {
        "kicker": "Commencer",
        "title": {
          "lead": "Prenez votre première liste ",
          "accent": "aujourd'hui",
          "tail": ""
        },
        "lead": "Installez l'extension, recherchez Google Maps et exportez une feuille de calcul propre – aucun compte n'est requis.",
        "primary": "Installer MapsGrab",
        "secondary": "Comparez les forfaits",
        "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Accès au site Web",
        "title": "Connectez-vous pour synchroniser vos crédits",
        "trigger": "Se connecter",
        "modalTitle": "Connectez-vous pour continuer",
        "closeLabel": "Fermer",
        "signedInAs": "Connecté en tant que",
        "continueWithGoogle": "Continuer avec Google",
        "googleLoading": "Ouverture du Google...",
        "or": "ou",
        "emailLabel": "E-mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Continuer avec l'e-mail",
        "sendCode": "Envoyer le code",
        "sendingCode": "Envoi...",
        "sendCodeSuccess": "Code de vérification envoyé.",
        "sendAgain": "Envoyer à nouveau",
        "codeLabel": "Le code de vérification",
        "codePlaceholder": "123456",
        "signIn": "Se connecter",
        "termsNotice": "En vous connectant, vous acceptez les",
        "termsLink": "Termes",
        "privacyLink": "politique de confidentialité",
        "logout": "Se déconnecter",
        "creditsLabel": "Crédits",
        "enterEmailFirst": "Veuillez d'abord saisir votre adresse e-mail.",
        "enterEmailAndCode": "Veuillez saisir l'e-mail et le code de vérification.",
        "sendCodeFailed": "Échec de l'envoi du code de vérification.",
        "googleSignInFailed": "La connexion à Google a échoué.",
        "googleClientMissing": "La connexion Google n’est pas configurée.",
        "signInFailed": "Échec de la connexion."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Paiement annulé",
        "canceledMessage": "Cette commande n'a pas été payée. Vous pouvez fermer cet onglet et choisir à nouveau un mode de paiement dans la fenêtre d'origine.",
        "canceledMetaDescription": "Votre paiement de PayPal a été annulé.",
        "waitingTitle": "Paiement soumis",
        "waitingMessage": "Vous pouvez revenir à l'onglet d'origine. Nous vérifions la confirmation PayPal toutes les 3 secondes, et le résultat apparaîtra ici automatiquement.",
        "confirmedCreditsTitle": "Crédits ajoutés",
        "confirmedCreditsMessage": "Votre paiement PayPal est confirmé et les crédits ont été ajoutés. Vous pouvez fermer cet onglet et continuer dans la fenêtre d'origine.",
        "confirmedSubscriptionTitle": "Abonnement activé",
        "confirmedSubscriptionMessage": "Votre paiement PayPal est confirmé et votre forfait MapsGrab est actif. Vous pouvez fermer cet onglet et continuer dans la fenêtre d'origine.",
        "failedTitle": "Le paiement nécessite une attention particulière",
        "failedMessage": "Nous n'avons pas pu confirmer cette commande automatiquement. Revenez à la fenêtre d'origine ou essayez d'y actualiser votre statut de paiement."
      },
      "checkin": {
        "accountButtonLabel": "Menu Ouvrir un compte",
        "accountMenuLabel": "Menu du compte"
      },
      "creditPurchase": {
        "title": "Obtenez plus de crédits",
        "description": "Ajoutez des crédits et continuez à utiliser les fonctionnalités payantes dans cet espace de travail.",
        "successTitle": "Crédits ajoutés",
        "successDescription": "Votre solde a été actualisé. Fermez cette fenêtre et continuez.",
        "packageEyebrow": "Payez au fur et à mesure",
        "cardNote": "Utilisez les crédits pour les fonctionnalités payantes du site Web. Les crédits n'expirent jamais.",
        "creditsAmount": "Crédits {credits}",
        "buyNow": "Acheter maintenant",
        "selectPackage": "Sélectionner",
        "paymentMethodLabel": "Choisissez le mode de paiement",
        "paymentTitle": "Choisissez le mode de paiement",
        "selectedPackageLabel": "Forfait sélectionné",
        "confirmPurchase": "Continuer le paiement",
        "backToProducts": "Dos",
        "close": "Fermer",
        "agreementText": "J'accepte les conditions d'achat, les conditions et la politique de confidentialité.",
        "loadingConfigs": "Chargement des packages de crédits...",
        "loadFailed": "Échec du chargement des packages de crédits. Veuillez réessayer.",
        "noConfigs": "Aucun forfait de crédits n'est disponible pour le moment. Veuillez réessayer plus tard.",
        "ready": "Choisissez un forfait de crédits. Les prix sont indiqués en USD.",
        "creatingOrder": "Créer de l'ordre...",
        "pendingPayment": "Terminez le paiement dans l’onglet nouvellement ouvert. Nous vérifierons le résultat automatiquement.",
        "pendingPaymentTitle": "En attente de paiement",
        "cancelPayment": "Annuler le paiement",
        "supportMailPrefix": "Signaler un problème : ",
        "success": "Paiement terminé. Les crédits sont disponibles dès maintenant.",
        "failed": "Le paiement n'est pas terminé. Vous pouvez réessayer ou fermer cette fenêtre.",
        "successCredits": "+{credits} Crédits ajoutés",
        "successBalance": "Solde actuel : {balance} Crédits",
        "createFailed": "Échec de la création de la commande. Veuillez réessayer.",
        "invalidPaymentData": "Le lien de paiement n'est pas valide. Veuillez réessayer plus tard.",
        "priceUpdated": "Le prix a changé. Consultez le dernier prix et achetez à nouveau.",
        "gatewayFailed": "La saisie des paiements est temporairement indisponible. Veuillez réessayer plus tard.",
        "paymentCanceled": "Le paiement a été annulé. Choisissez un mode de paiement et réessayez.",
        "pollFailed": "Échec de l'actualisation du statut de paiement. Veuillez réessayer.",
        "pollTimeout": "L'actualisation automatique a expiré. Utilisez le bouton d'actualisation après le paiement.",
        "orderNotFound": "La commande n'est plus disponible. Créez une nouvelle commande.",
        "orderExpired": "Commande expirée. Veuillez acheter à nouveau.",
        "fulfillmentFailed": "Le paiement a été reçu mais les crédits n'ont pas encore été ajoutés. Veuillez réessayer plus tard.",
        "authExpired": "La connexion a expiré. Connectez-vous à nouveau pour continuer.",
        "popupBlocked": "Votre navigateur a bloqué la nouvelle fenêtre. Autorisez MapsGrab à ouvrir les fenêtres contextuelles et réessayez."
      }
    },
    "pricing": {
      "seo": {
        "title": "Tarification — Forfaits en ligne, d'extension et API | MapsGrab",
        "description": "Plans MapsGrab pour chaque surface : Scraper en ligne de $19, Extension de navigateur de $39, et API de $15. Niveaux gratuits inclus avec chaque produit : forfaits mensuels naturels uniques sur Online et API, abonnements mensuels sur Extension."
      },
      "hero": {
        "kicker": "Tarifs",
        "title": {
          "lead": "Plans pour ",
          "accent": "trois façons",
          "tail": " de récupérer les données Maps"
        },
        "lead": "Choisissez la surface qui correspond à votre flux de travail – cloud Extracteur en ligne, extension de navigateur ou HTTP API – puis choisissez le volume mensuel. Mettez à niveau ou achetez sur cette page en quelques minutes.",
        "meta": [
          "Niveau gratuit sur chaque produit",
          "Payez avec PayPal",
          "Surclassement en payant la différence"
        ],
        "switchLabel": "Gamme de produits"
      },
      "popularLabel": "Les plus populaires",
      "tabs": {
        "online": {
          "name": "Extracteur en ligne",
          "shortName": "En ligne",
          "switchMeta": "À partir de {price} · unique",
          "unit": "enregistrements",
          "eyebrow": "Plans Scraper en ligne",
          "title": "Extraction cloud, tarifée par enregistrements",
          "description": "Exécutez le moteur MapsGrab sur notre infrastructure. Un enregistrement est une ligne commerciale collectée. Les forfaits payants incluent un enrichissement facultatif par courrier électronique et sur les réseaux sociaux, sans frais supplémentaires.",
          "billingChips": [
            "Paiement unique",
            "Couvre un mois naturel",
            "Pas de renouvellement automatique"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuit",
              "tagline": "Essayez le cloud scraper à petite échelle",
              "price": "$0",
              "periodLabel": "pour toujours",
              "quota": "1,000 enregistrements / mois",
              "features": [
                "Extraction d'entreprise avec exportation 37 de la colonne CSV",
                "Jusqu'à 2 mots-clés par tâche",
                "Modes carte et région pour les recherches de zone",
                "Enrichissement par e-mail et réseaux sociaux sur les forfaits payants",
                "Un CSV dédupliqué par tâche"
              ],
              "ctaLabel": "Commencez gratuitement",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Pour des exportations ponctuelles occasionnelles",
              "price": "$19",
              "periodLabel": "unique · 1 mois",
              "quota": "20,000 enregistrements / mois",
              "features": [
                "Tout est gratuit",
                "20,000 enregistrements pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "Jusqu'à 5 mots-clés par tâche",
                "Enrichissement par e-mail et réseaux sociaux, activé par défaut et facultatif"
              ],
              "ctaLabel": "Obtenez Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Basique",
              "tagline": "Pour une collecte hebdomadaire régulière de leads",
              "price": "$49",
              "periodLabel": "unique · 1 mois",
              "quota": "80,000 enregistrements / mois",
              "features": [
                "Tout en Lite",
                "80,000 enregistrements pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "Jusqu'à 10 mots-clés par tâche"
              ],
              "ctaLabel": "Devenez basique",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Croissance",
              "tagline": "Pour des pipelines de prospects en croissance",
              "price": "$99",
              "periodLabel": "unique · 1 mois",
              "quota": "250,000 enregistrements / mois",
              "features": [
                "Tout en Basic",
                "250,000 enregistrements pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "Jusqu'à 20 mots-clés par tâche"
              ],
              "ctaLabel": "Obtenez de la croissance",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Professionnel",
              "tagline": "Pour les agences et les équipes gourmandes en données",
              "price": "$149",
              "periodLabel": "unique · 1 mois",
              "quota": "500,000 enregistrements / mois",
              "features": [
                "Tout en croissance",
                "500,000 enregistrements pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "Jusqu'à 50 mots-clés par tâche"
              ],
              "ctaLabel": "Devenez professionnel",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Paiement unique couvrant un mois naturel : les forfaits de cet onglet ne se renouvellent pas automatiquement. Un enregistrement est une ligne commerciale collectée à partir de Google Maps ; l'utilisation est réinitialisée au 1er et les enregistrements inutilisés ne sont pas reconduits.",
          "compare": {
            "lead": "Plans Scraper en ligne – extraction dans le cloud, tarifés par enregistrements.",
            "volume": "Enregistrements par mois",
            "groups": [
              {
                "label": "Données",
                "rows": [
                  {
                    "label": "Extraction d'entreprise avec exportation 37 de la colonne CSV",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "E-mail et enrichissement social",
                    "cells": [
                      false,
                      "Activé par défaut, facultatif",
                      "Activé par défaut, facultatif",
                      "Activé par défaut, facultatif",
                      "Activé par défaut, facultatif"
                    ]
                  }
                ]
              },
              {
                "label": "Flux de travail",
                "rows": [
                  {
                    "label": "Mots-clés par tâche",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Modes carte et région",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Un CSV dédupliqué par tâche",
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
            "usageNotice": "S'applique au quota d'enregistrement mensuel MapsGrab Extracteur en ligne.",
            "successTitle": "Forfait activé",
            "successDescription": "Votre forfait mensuel unique de 1 est en ligne. Le Extracteur en ligne le récupère lors de la prochaine actualisation du quota."
          }
        },
        "extension": {
          "name": "Extension",
          "shortName": "Extension",
          "switchMeta": "À partir de {price} · unique",
          "unit": "enregistrements",
          "eyebrow": "Plans d'extension",
          "title": "Extraction par navigateur, tarifée par enregistrements",
          "description": "Chaque ligne collectée par l'extension (une entreprise, un avis ou une photo) compte pour un enregistrement. Tous les plans incluent des critiques, des photos et des tâches par lots ; les forfaits payants exportent toutes les colonnes 36, y compris les e-mails et l'enrichissement social.",
          "billingChips": [
            "Paiement unique",
            "1 mois d'accès",
            "Pas de renouvellement automatique"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuit",
              "tagline": "Extraction de carottes, à petite échelle",
              "price": "$0",
              "periodLabel": "pour toujours",
              "quota": "1,000 enregistrements / mois",
              "features": [
                "Extraction de données commerciales",
                "Avis (11 colonnes) et photo URLs",
                "Mot-clé par lots et tâches de révision - URL",
                "CSV / JSON export avec sélection de champ"
              ],
              "ctaLabel": "Installer l'extension",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Pour les indépendants et les pipelines de leads en pleine croissance",
              "price": "$39",
              "periodLabel": "unique · 1 mois",
              "quota": "100,000 enregistrements / mois",
              "features": [
                "Tout est gratuit",
                "100,000 enregistrements chaque mois",
                "Extraction commerciale complète de la colonne 36",
                "Enrichissement des e-mails et des réseaux sociaux"
              ],
              "ctaLabel": "Devenez Pro",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Entreprise",
              "tagline": "Pour les agences et les équipes gourmandes en données",
              "price": "$99",
              "periodLabel": "unique · 1 mois",
              "quota": "500,000 enregistrements / mois",
              "features": [
                "Tout en Pro",
                "500,000 enregistrements chaque mois",
                "Espace pour les tâches par lots multi-marchés",
                "Même pipeline d’exportation local"
              ],
              "ctaLabel": "Obtenez des affaires",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Chaque ligne collectée par l'extension compte pour un enregistrement : une entreprise issue d'une recherche ou d'une liste enregistrée, un avis ou une photo. L’enrichissement par courrier électronique et social n’ajoute pas d’enregistrements. L'utilisation mensuelle est réinitialisée le 1st ; les enregistrements inutilisés ne sont pas reportés.",
          "compare": {
            "lead": "Plans d'extension - extraction par navigateur, tarifés par enregistrements.",
            "volume": "Enregistrements par mois",
            "groups": [
              {
                "label": "Données",
                "rows": [
                  {
                    "label": "Extraction de données commerciales",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Extraction commerciale complète de la colonne 36",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Avis (11 colonnes) et photo URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Enrichissement des e-mails et des réseaux sociaux",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Mot-clé par lots et tâches de révision - URL",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Exporter",
                "rows": [
                  {
                    "label": "CSV / JSON export avec sélection de champ",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Pipeline d’exportation local d’abord",
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
            "usageNotice": "S'applique au quota mensuel d'extension de navigateur MapsGrab.",
            "successTitle": "Forfait activé",
            "successDescription": "Votre forfait mensuel unique de 1 est en ligne. L’extension le récupère lors de la prochaine actualisation du quota."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "À partir de {price} · unique",
          "unit": "demandes",
          "eyebrow": "API plans",
          "title": "Accès programmatique, tarifé par demandes",
          "description": "Recherchez Google Maps entreprises et récupérez leurs avis à partir de vos propres applications via un simple HTTP API. Chaque appel réussi compte comme une requête, même s'il ne renvoie aucun résultat ou données partielles.",
          "billingChips": [
            "Paiement unique",
            "Couvre un mois naturel",
            "Pas de renouvellement automatique"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratuit",
              "tagline": "Évaluer les API à petite échelle",
              "price": "$0",
              "periodLabel": "pour toujours",
              "quota": "20 requêtes / mois",
              "features": [
                "Recherche d'entreprise par mot-clé et emplacement",
                "Examine le point de terminaison avec tri et pagination",
                "JSON réponses",
                "Clé API liée à votre compte",
                "Soutien communautaire"
              ],
              "ctaLabel": "Commencez gratuitement",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Basique",
              "tagline": "Pour les prototypes et les intégrations légères",
              "price": "$15",
              "periodLabel": "unique · 1 mois",
              "quota": "1,000 requêtes / mois",
              "features": [
                "Tout est gratuit",
                "1,000 demandes pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "JSON réponses"
              ],
              "ctaLabel": "Devenez basique",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Professionnel",
              "tagline": "Pour les intégrations de production",
              "price": "$65",
              "periodLabel": "unique · 1 mois",
              "quota": "5,000 requêtes / mois",
              "features": [
                "Tout en Basic",
                "5,000 demandes pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "JSON réponses"
              ],
              "ctaLabel": "Devenez professionnel",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Entreprise",
              "tagline": "Pour les produits construits sur des données MapsGrab",
              "price": "$115",
              "periodLabel": "unique · 1 mois",
              "quota": "10,000 requêtes / mois",
              "features": [
                "Tout en Professionnel",
                "10,000 demandes pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "JSON réponses"
              ],
              "ctaLabel": "Obtenez des affaires",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Échelle",
              "tagline": "Pour les opérations de données volumineuses",
              "price": "$365",
              "periodLabel": "unique · 1 mois",
              "quota": "50,000 requêtes / mois",
              "features": [
                "Tout en affaires",
                "50,000 demandes pour 1 mois",
                "Paiement unique – pas de renouvellement automatique",
                "JSON réponses"
              ],
              "ctaLabel": "Obtenez de l'échelle",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Paiement unique couvrant un mois naturel : les forfaits de cet onglet ne se renouvellent pas automatiquement. Chaque appel API ou MCP réussi compte comme une requête, y compris les résultats vides et partiels ; les appels échoués ne sont pas comptés. Les réinitialisations d'utilisation le 1st et les requêtes inutilisées ne sont pas reconduites.",
          "compare": {
            "lead": "Forfaits API — accès programmatique, tarifé en fonction des demandes.",
            "volume": "Demandes par mois",
            "groups": [
              {
                "label": "Points de terminaison",
                "rows": [
                  {
                    "label": "Recherche d'entreprise par mot-clé et emplacement",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Examine le point de terminaison avec tri et pagination",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON réponses",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Serveur MCP avec la même clé API",
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
                "label": "Accéder",
                "rows": [
                  {
                    "label": "Clé API liée à votre compte",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Soutien communautaire",
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
            "usageNotice": "S'applique au quota de demandes mensuel MapsGrab API.",
            "successTitle": "Forfait activé",
            "successDescription": "Votre forfait mensuel unique de 1 est en ligne. Votre clé API récupère le nouveau quota à la prochaine requête."
          }
        }
      },
      "plansSection": {
        "label": "Forfaits",
        "finder": {
          "label": "De combien de {unit} avez-vous besoin par mois ?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} par mois — {plan} forfait",
          "fits": "Convient"
        }
      },
      "compare": {
        "kicker": "Comparer",
        "title": {
          "lead": "Chaque plan, ",
          "accent": "côte à côte",
          "tail": ""
        },
        "plan": "Plan",
        "volumeGroup": "Volume & facturation",
        "billing": "Facturation",
        "included": "Compris",
        "notIncluded": "Non inclus",
        "allPlans": "Inclus dans tous les forfaits"
      },
      "usage": {
        "head": {
          "kicker": "Usage",
          "title": {
            "lead": "Ce qui compte pour votre ",
            "accent": "quota",
            "tail": ""
          },
          "lead": "Deux unités : les enregistrements pour l'extension et le Extracteur en ligne, les demandes pour le API — et les deux sont réinitialisés le 1 de chaque mois."
        },
        "records": {
          "meter": "Records utilisés ce mois-ci",
          "badge": "Prolongation · En ligne",
          "title": "1 enregistrement = 1 ligne collectée",
          "body": "Chaque ligne que vous collectez compte pour un enregistrement : une entreprise sur Extracteur en ligne ; une entreprise, un avis ou une photo dans l'extension. L’enrichissement par courrier électronique et social n’ajoute pas d’enregistrements.",
          "count": "+1 enregistrement",
          "attachments": [
            "Téléphone et site Web",
            "Horaires d'ouverture",
            "E-mail et réseaux sociaux"
          ]
        },
        "requests": {
          "meter": "Requêtes utilisées ce mois-ci",
          "badge": "API · MCP",
          "title": "1 demande = 1 appel réussi",
          "body": "Une requête est un appel API réussi, même lorsqu'elle ne renvoie aucun résultat ou donnée partielle ; les appels échoués ne sont pas comptés. Les appels d'outil MCP s'appuient sur le même quota de requêtes.",
          "counted": "Appel réussi – compté",
          "notCounted": "Appel échoué – non comptabilisé"
        },
        "reset": {
          "title": "Se réinitialise le 1st",
          "body": "L'utilisation est réinitialisée le 1 de chaque mois. Les enregistrements et demandes inutilisés ne sont pas reportés.",
          "limit": "Limite du forfait",
          "unused": "Inutilisé · ne se retourne pas",
          "flag": "Réinitialiser"
        }
      },
      "billing": {
        "head": {
          "kicker": "Facturation",
          "title": {
            "lead": "Facturation simple, ",
            "accent": "pas de surprise",
            "tail": ""
          },
          "lead": "Comment fonctionnent le paiement, le renouvellement et les mises à niveau dans les trois gammes de produits."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Payez n'importe quel forfait via PayPal. Complétez votre paiement sur PayPal et revenez ici pour activer votre forfait."
          },
          "cadence": {
            "title": "Paiement unique",
            "body": "Chaque forfait payant couvre un mois naturel. Payez une fois sans frais automatiques ; achetez à nouveau lorsque vous avez besoin d’un mois supplémentaire."
          },
          "upgrade": {
            "title": "Surclassement en payant la différence",
            "body": "Déplacez un forfait actif vers un niveau supérieur éligible via votre fournisseur de paiement actuel. Votre date d’expiration et votre utilisation restent inchangées jusqu’à présent."
          },
          "independent": {
            "title": "Régimes indépendants",
            "body": "Les plans sur les différents onglets sont indépendants. Lorsqu'un forfait expire, le compte revient automatiquement au niveau gratuit."
          }
        }
      },
      "plans": {
        "loading": "Chargement des options de paiement...",
        "loadFailed": "Échec du chargement des options de paiement. Actualisez la page pour réessayer.",
        "noChannels": "Aucun mode de paiement n'est disponible pour ce plan pour le moment.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Paiement incomplet",
        "billingPeriodMonthly": "1 mois",
        "billingAutoRenew": "Se renouvelle automatiquement jusqu'à annulation",
        "billingOneTime": "Paiement unique"
      },
      "upgrade": {
        "currentPlan": "Forfait actuel",
        "button": "Mise à niveau · {amount}",
        "title": "Améliorez votre forfait",
        "confirm": "Confirmer la mise à niveau",
        "oneTime": "Différence unique via {channel}. Votre date d'expiration reste {date}.",
        "autoRenew": "La différence sera facturée immédiatement via {channel}. Votre date d'expiration reste {date} ; les renouvellements futurs utilisent le nouveau prix du forfait.",
        "pendingTitle": "En attente de votre mise à niveau",
        "pendingDescription": "Votre fournisseur de paiement applique la mise à niveau. Votre forfait actuel reste actif jusqu'à ce qu'il soit confirmé.",
        "successTitle": "Forfait amélioré",
        "successDescription": "Votre nouveau quota est actif. Votre date d'expiration reste {date}.",
        "quoteFailed": "Impossible de charger le prix de votre mise à niveau. Actualisez la page pour réessayer.",
        "failed": "Votre mise à niveau n'a pas pu être confirmée. Actualisez la page pour vérifier votre forfait avant de réessayer.",
        "reasons": {
          "no_active_subscription": "Votre forfait n'est plus actif. Actualisez la page pour choisir un forfait.",
          "not_higher_tier": "Choisissez un niveau supérieur pour mettre à niveau ou attendez l'expiration de votre forfait pour changer de niveau.",
          "non_positive_diff": "La valeur restante de votre plan n'est pas inférieure à ce niveau. Vous pouvez changer de niveau après l'expiration de votre forfait.",
          "channel_unavailable": "Les surclassements ne sont pas disponibles avec votre mode de paiement actuel. Vous pouvez changer de forfait après l'expiration."
        }
      },
      "faq": {
        "kicker": "Questions fréquentes",
        "title": {
          "lead": "",
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "lead": "Les bases de la facturation. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
        "contact": "Contacter l'assistance",
        "items": [
          {
            "question": "Qu’est-ce qui compte comme record ?",
            "answer": "Un enregistrement est une ligne collectée – la même unité que celle des forfaits gratuits. Sur le Scraper en ligne, c'est une seule entreprise ; dans l’extension, chaque entreprise, avis ou photo collectée constitue un enregistrement. L’enrichissement par courrier électronique et social n’ajoute pas d’enregistrements. Dans l'onglet API, l'utilisation est comptabilisée dans les demandes réussies."
          },
          {
            "question": "Ai-je besoin d'un forfait payant pour essayer MapsGrab ?",
            "answer": "Non. Chaque produit dispose d'un niveau gratuit sans limite de durée : le Extracteur en ligne et l'extension incluent 1,000 enregistrements par mois, et le API inclut 20 requêtes par mois. Les forfaits gratuits d'Extracteur en ligne et d'extension n'incluent pas l'enrichissement par e-mail ou sur les réseaux sociaux. Les forfaits en ligne payants l'incluent par défaut et vous pouvez le désactiver pour chaque tâche."
          },
          {
            "question": "Comment le quota s'applique-t-il à mon compte ?",
            "answer": "Le quota est compté par compte connecté (et par appareil de navigateur pour l'extension lorsque vous n'êtes pas connecté). Connectez-vous avec le compte propriétaire du plan pour que le plafond le plus élevé s'applique. Lorsqu'un forfait expire, le compte revient automatiquement au niveau gratuit."
          },
          {
            "question": "Mon forfait se renouvellera-t-il automatiquement ?",
            "answer": "Non. Tous les forfaits sont des paiements uniques de PayPal couvrant un mois naturel. Lorsque votre forfait expire, vous revenez au niveau gratuit. Achetez à nouveau pour continuer avec un forfait payant."
          },
          {
            "question": "Puis-je basculer entre les niveaux ?",
            "answer": "Vous pouvez mettre à niveau un plan actif vers un niveau supérieur éligible en payant la différence via PayPal. Votre date d’expiration et votre utilisation restent inchangées jusqu’à présent. Les plans sur les différents onglets sont indépendants."
          }
        ]
      },
      "cta": {
        "kicker": "Commencer",
        "title": {
          "lead": "Commencez avec le ",
          "accent": "niveau gratuit",
          "tail": ""
        },
        "lead": "Chaque produit dispose d'un niveau gratuit sans limite de durée : 1,000 enregistre un mois sur l'extension et le Extracteur en ligne, 20 demande un mois sur le API.",
        "primary": "Installer l'extension",
        "secondary": "Essayez le Scraper en ligne",
        "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
      }
    },
    "extensionLogin": {
      "title": "Connexion à l'extension | MapsGrab",
      "description": "Connectez-vous pour connecter votre session de site Web MapsGrab à l'extension du navigateur.",
      "eyebrow": "Extension du navigateur",
      "heading": "Connexion par extension",
      "checkingState": "Vérification",
      "signInRequiredState": "Connexion requise",
      "confirmState": "Confirmer le compte",
      "errorState": "Erreur",
      "preparingTitle": "Préparer votre connexion",
      "preparingText": "Configuration du pont de connexion à l'extension.",
      "invalidParamsTitle": "Lien de connexion invalide",
      "invalidParamsText": "Ce lien de connexion ne contient pas les paramètres de sécurité requis. Veuillez recommencer la connexion à partir de l'extension.",
      "checkingSessionTitle": "Vérifier votre session",
      "checkingSessionText": "Vérification de votre session de site Web existante.",
      "finishingGoogleTitle": "Fin de la connexion Google",
      "finishingGoogleText": "Échange de votre autorisation Google contre une session sur le site Web.",
      "signInRequiredTitle": "Connectez-vous pour continuer",
      "signInRequiredText": "Connectez-vous pour connecter votre session de site Web à l'extension.",
      "signInButtonLabel": "Se connecter",
      "confirmTitle": "Confirmez votre compte",
      "confirmText": "L'extension demande à se connecter avec le compte ci-dessous. Continuez uniquement si vous venez de commencer à vous connecter à partir de l'extension.",
      "continueButtonLabel": "Continuer",
      "useAnotherAccountLabel": "Utiliser un autre compte",
      "issuingTitle": "Terminer la connexion",
      "issuingText": "Émission d'un code de connexion unique pour l'extension.",
      "issueFailedTitle": "Quelque chose s'est mal passé",
      "retryButtonLabel": "Réessayer",
      "verificationFailedPrefix": "La vérification du jeton du site Web a échoué",
      "issueFailedPrefix": "La demande de code de connexion d'extension a échoué",
      "googleSignInFailedPrefix": "Google Échec de la connexion",
      "googleCompletionFailedPrefix": "Google La connexion n'a pas pu se terminer"
    },
    "online": {
      "seo": {
        "title": "En ligne Google Maps Scraper — Exécutez l'extraction dans le cloud | MapsGrab",
        "description": "Exécutez des recherches de mots clés Google Maps dans le cloud, collectez des données commerciales et téléchargez un CSV par tâche."
      },
      "hero": {
        "announce": {
          "badge": "Modes 3",
          "text": "Mots-clés, une zone cartographique ou des régions entières"
        },
        "title": {
          "lead": "Google Maps extraction ",
          "accent": "dans le cloud,",
          "tail": " pas d'installation"
        },
        "lead": "Soumettez des mots-clés, collectez les détails de votre entreprise dans le cloud et téléchargez un CSV par tâche depuis votre tableau de bord.",
        "primaryCta": "Lancer l’extraction",
        "pricingCta": "Voir les prix",
        "meta": [
          "1,000 enregistrements gratuits / mois",
          "Fonctionne dans n'importe quel navigateur",
          "Un CSV dédupliqué par tâche"
        ],
        "theater": {
          "files": "1 CSV · Enregistré dans les téléchargements",
          "csv": "CSV",
          "processed": "Traité",
          "parallelChip": {
            "label": "Exécution de mots clés",
            "value": "En parallèle"
          },
          "billingChip": {
            "label": "Facturé par",
            "value": "Lignes livrées"
          }
        }
      },
      "facts": {
        "caption": "Le Scraper en ligne en un coup d'œil",
        "items": [
          {
            "value": 37,
            "label": "colonnes publiques, y compris un numéro de ligne continu"
          },
          {
            "value": 6,
            "label": "colonnes de profil social sur les forfaits payants"
          },
          {
            "value": 50,
            "label": "rechercher des emplacements par tâche en mode carte"
          },
          {
            "value": 60,
            "suffix": " min",
            "label": "fenêtre de collecte pour chaque tâche"
          },
          {
            "value": 1000,
            "label": "enregistrements gratuits tous les mois"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Comment ça marche",
          "title": {
            "lead": "D'un aperçu rapide à un ",
            "accent": "export complet",
            "tail": ""
          },
          "lead": "Essayez un mot-clé sur la page d'accueil sans compte. Lorsque vous souhaitez consulter la liste complète, connectez-vous et exécutez-la en tant que tâche dans votre tableau de bord."
        },
        "steps": [
          {
            "title": "Aperçu sur la page d'accueil",
            "description": "Un mot-clé, pas de compte. Découvrez combien d'entreprises contient la première page de résultats, avec les premières lignes 3."
          },
          {
            "title": "Se connecter",
            "description": "Les aperçus ne sont pas enregistrés et n'utilisent jamais votre quota. Après vous être connecté, vous soumettez à nouveau le mot-clé."
          },
          {
            "title": "Créer la tâche",
            "description": "Dans Tableau de bord › Extracteur en ligne, saisissez un mot-clé par ligne – ou laissez une zone de carte ou des régions créer la liste."
          },
          {
            "title": "Mots-clés exécutés en parallèle",
            "description": "Suivez les états de mise en file d'attente, de collecte et de préparation CSV, puis terminé, succès partiel ou échec. Les tâches actives sont actualisées toutes les 5 secondes."
          },
          {
            "title": "Télécharger",
            "description": "Téléchargez un CSV pour l'ensemble de la tâche lorsqu'un fichier est disponible. Un succès partiel conserve les lignes livrées ; aucun résultat n'a pas de fichier."
          }
        ],
        "lock": "Connectez-vous pour la liste complète",
        "email": "you@company.com",
        "links": {
          "preview": "Essayez l'aperçu de la page d'accueil",
          "dashboard": "Ouvrir le tableau de bord › Scraper en ligne"
        }
      },
      "modes": {
        "head": {
          "kicker": "Modes de recherche",
          "title": {
            "lead": "Trois façons de dire ",
            "accent": "où chercher",
            "tail": ""
          },
          "lead": "Tapez des mots-clés ligne par ligne, échantillonnez une zone de carte autour d'un point central ou transformez des pays, des états et des villes en requêtes prêtes à l'emploi."
        },
        "tabsLabel": "Mode recherche",
        "notes": {
          "keywords": "Un mot-clé par ligne, dans la limite de votre forfait",
          "map": "Exemple d'un cercle autour d'un point central",
          "regions": "Pays, états et villes à partir de GeoNames"
        },
        "keywords": {
          "hint": "Un mot-clé par ligne. Les lignes vides et les doublons sont supprimés avant le comptage, et l'ensemble de la tâche produit un CSV dédupliqué.",
          "blank": "Ligne vide · ignorée",
          "duplicate": "Dupliquer · ignoré",
          "limitsTitle": "Mots-clés par tâche",
          "limitsCaption": "par Forfait en ligne",
          "limitsHint": "Démarrer le scraping reste désactivé lorsque la liste est vide, au-delà de la limite de votre forfait ou lorsque votre quota mensuel est épuisé."
        },
        "map": {
          "formula": "{keywords} mots-clés × {points} points de grille",
          "scale": "{value}km",
          "facts": [
            "Les points sont recherchés du centre vers l'extérieur.",
            "Le cercle place uniquement les centres de recherche – les résultats n’y sont pas découpés.",
            "Une entreprise trouvée à travers des mots-clés ou des points est conservée une fois dans la tâche."
          ]
        },
        "regions": {
          "hint": "Vous pouvez modifier les requêtes générées avant de les soumettre. Chacun compte comme un mot-clé.",
          "addCity": "Ajouter une ville"
        }
      },
      "results": {
        "head": {
          "kicker": "Résultats",
          "title": {
            "lead": "Une tâche, ",
            "accent": "une CSV",
            "tail": ""
          },
          "lead": "Téléchargez 37 colonnes publiques en un CSV pour l'ensemble de la tâche, avec des numéros de lignes continus et des entreprises dédupliquées lors des recherches."
        },
        "csvMeta": "1 CSV · {count} lignes livrées",
        "rows": "{count} lignes",
        "searches": "Lignes livrées par recherche",
        "notes": [
          "La ligne 1 contient les noms de colonnes anglais fixes, y compris la colonne # continue.",
          "La ligne 2 décrit chaque colonne dans la langue de l'interface utilisée lors de la création de la tâche.",
          "Les tâches terminées avec zéro résultat n'ont pas de fichier. Un succès partiel conserve les lignes livrées.",
          "La ligne d'étiquettes ne compte jamais dans vos enregistrements."
        ],
        "language": "Langue de la tâche : français",
        "rowLabel": "Rangée",
        "legend": {
          "fields": "Ligne 1 · noms de champs",
          "labels": "Ligne 2 · langage de la tâche",
          "data": "Ligne 3+ · entreprises"
        },
        "more": "+{count} colonnes supplémentaires",
        "csvLabels": {
          "#": "Numéro de ligne",
          "Name": "Nom de l'entreprise",
          "Fulladdress": "Adresse complète",
          "Categories": "Catégories d'entreprises",
          "Phone": "Téléphone principal",
          "Review Count": "Nombre d'avis",
          "Average Rating": "Note moyenne des avis",
          "Website": "Site Web d'entreprise",
          "Emails": "E-mails de sites Web publics",
          "Search Keyword": "Rechercher un mot-clé"
        }
      },
      "features": {
        "head": {
          "kicker": "Capacités",
          "title": {
            "lead": "Que fait le Scraper en ligne ",
            "accent": "",
            "tail": ""
          },
          "lead": "Informations professionnelles collectées dans le cloud, avec e-mails et profils sociaux facultatifs sur les forfaits payants."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Tâches de mots clés",
            "description": "Soumettez les types d’entreprises et les emplacements sous forme de mots clés distincts. Votre plan détermine la limite de mots clés et le quota d'enregistrements mensuel.",
            "meta": "2 · 5 · 10 · 20 · 50 mots-clés par tâche"
          },
          {
            "id": "history",
            "title": "Historique des tâches",
            "description": "Suivez la progression des tâches et affichez le nombre d'enregistrements pour chaque mot-clé dans votre tableau de bord.",
            "meta": "Terminé · Succès partiel · Échec"
          },
          {
            "id": "details",
            "title": "Détails de l'entreprise",
            "description": "Collectez les noms, adresses, numéros de téléphone, sites Web, évaluations, horaires, coordonnées et identifiants de lieu lorsqu'ils sont disponibles.",
            "meta": "37 colonnes publiques par entreprise"
          },
          {
            "id": "enrichment",
            "title": "E-mail et enrichissement social",
            "description": "Avec un forfait en ligne payant, les sites Web professionnels sont vérifiés par défaut pour les adresses e-mail et les profils sociaux. Vous pouvez désactiver cette option pour chaque tâche.",
            "meta": "Forfaits payants · activé par défaut"
          },
          {
            "id": "downloads",
            "title": "Une tâche CSV",
            "description": "Téléchargez l'intégralité de la tâche en un seul CSV lorsqu'un fichier est disponible. Aucun fichier par recherche n'est nécessaire.",
            "meta": "{job}.csv · 37 colonnes"
          },
          {
            "id": "browser",
            "title": "Rien à installer",
            "description": "Fonctionne dans le cloud depuis n'importe quel navigateur : Edge, Firefox ou autre. Téléchargez les résultats de votre historique de tâches.",
            "meta": "Edge · Firefox · n'importe quel navigateur"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Usage",
          "title": {
            "lead": "Facturé par lignes ",
            "accent": "vous obtenez réellement",
            "tail": ""
          },
          "lead": "Les tâches en ligne sont mesurées par lignes commerciales livrées une fois la tâche terminée. Rien n'est mis de côté lorsque vous soumettez, et la ligne d'étiquette dans chaque CSV n'est jamais comptée."
        },
        "checks": [
          "Soumettre une tâche ne réserve rien sur votre quota",
          "Une tâche déjà en cours se termine, même au-delà de votre quota restant",
          "Une fois le quota épuisé, de nouvelles tâches ne peuvent plus être soumises",
          "L'utilisation est réinitialisée le 1er dans l'heure New York ; les enregistrements inutilisés ne sont pas reportés"
        ],
        "mock": {
          "recordsLabel": "Records ce mois-ci",
          "left": "{count} restant",
          "exhausted": "Quota épuisé",
          "task": "Tâche {id}…",
          "pending": "Livré jusqu'à présent · compté lorsque la tâche est terminée",
          "counted": "Compté pour ce mois",
          "rows": "{count} lignes",
          "running": "En cours d'exécution",
          "delta": "+{count} enregistrements"
        }
      },
      "plans": {
        "head": {
          "kicker": "Plans Scraper en ligne",
          "title": {
            "lead": "Extraction du cloud, ",
            "accent": "tarif par enregistrements",
            "tail": ""
          },
          "lead": "Exécutez le moteur MapsGrab sur notre infrastructure. Un enregistrement correspond à une ligne commerciale livrée ; les forfaits payants incluent le courrier électronique et l'enrichissement social sans frais supplémentaires record."
        },
        "specs": {
          "keywords": "Mots-clés par tâche",
          "contacts": "E-mails et réseaux sociaux",
          "included": "Activé par défaut",
          "excluded": "Non inclus"
        },
        "note": "Paiement unique couvrant un mois naturel – Les forfaits en ligne ne se renouvellent pas automatiquement. L'utilisation est réinitialisée au 1st dans le temps New York et les enregistrements inutilisés ne sont pas reportés.",
        "compare": "Comparez tous les forfaits"
      },
      "faq": {
        "kicker": "Questions fréquentes",
        "title": {
          "lead": "",
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "lead": "Les réponses courtes. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
        "contact": "Contacter l'assistance",
        "items": [
          {
            "question": "En quoi le Extracteur en ligne est-il différent de l’extension ?",
            "answer": "L'extension collecte des données dans votre navigateur. Extracteur en ligne exécute des tâches de mots clés dans le cloud et fournit les résultats sur votre tableau de bord."
          },
          {
            "question": "D’où proviennent les données et est-il légal de les collecter ?",
            "answer": "MapsGrab collecte uniquement les informations affichées publiquement sur Google Maps — les mêmes détails que tout visiteur peut lire. Nous n'accédons pas aux comptes privés, au contenu sécurisé ou aux données non publiques."
          },
          {
            "question": "Vers quels formats puis-je exporter ?",
            "answer": "Les tâches avec des résultats fournissent un UTF-8 CSV avec 37 colonnes publiques, des numéros de lignes continus et deux lignes d'en-tête. Les entreprises sont dédupliquées dans toutes les recherches. Les tâches sans résultat n'ont pas de fichier."
          },
          {
            "question": "Combien ça coûte?",
            "answer": "Le Scraper en ligne suit les forfaits MapsGrab sur la page Tarifs, y compris le quota mensuel gratuit d'enregistrements. Les forfaits payants augmentent les limites lorsque vous en avez besoin de plus."
          },
          {
            "question": "Ai-je besoin d’un forfait payant pour les e-mails et les profils sociaux ?",
            "answer": "Online Free n'inclut pas l'enrichissement par courrier électronique ou sur les réseaux sociaux. Les forfaits en ligne payants l'incluent par défaut et vous pouvez le désactiver pour chaque tâche. Le choix est fixé une fois la tâche soumise."
          },
          {
            "question": "Combien de temps une tâche peut-elle s'exécuter ?",
            "answer": "Chaque tâche a une fenêtre de collecte de 60 minutes. Un succès partiel peut fournir les lignes collectées et tous les e-mails ou profils trouvés. Votre historique indique si un CSV est disponible."
          },
          {
            "question": "L'aperçu de ma page d'accueil est-il enregistré lorsque je me connecte ?",
            "answer": "Non. L’aperçu de la page d’accueil est un aperçu rapide qui n’est pas stocké. Après vous être connecté, ouvrez Extracteur en ligne dans votre tableau de bord et soumettez à nouveau le mot-clé en tant que tâche complète."
          }
        ]
      },
      "cta": {
        "kicker": "Commencer",
        "title": {
          "lead": "Mettez en file d'attente votre première ",
          "accent": "tâche cloud",
          "tail": ""
        },
        "lead": "Soumettez des mots-clés, suivez la progression de vos tâches et téléchargez des données commerciales depuis votre tableau de bord.",
        "primary": "Lancer l’extraction",
        "secondary": "Voir les prix",
        "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
      }
    },
    "apiPage": {
      "switchLabel": "API points de terminaison",
      "switchItems": {
        "search": "Extracteur",
        "reviews": "Avis",
        "photos": "Photos"
      },
      "primaryCta": "Obtenez la clé API",
      "pricingCta": "Voir les prix",
      "console": {
        "label": "Exemple API demande et réponse",
        "langLabel": "Langue de la demande",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Demande de copie",
        "replay": "Demande de relecture",
        "ready": "Prêt",
        "composing": "Demande de rédaction…",
        "sending": "Envoi de la demande…",
        "done": "Réponse · 200 OK · application/json",
        "waiting": "// en attente de réponse…",
        "response": "Exemple de réponse"
      },
      "endpoints": {
        "kicker": "Points de terminaison",
        "title": {
          "lead": "Une clé. ",
          "accent": "Trois",
          "tail": " points de terminaison."
        },
        "lead": "Recherchez des lieux, puis transmettez leur `fid` à l’API d’avis ou de photos. Les trois API partagent une clé et un quota mensuel de requêtes.",
        "here": "Tu es là",
        "paramsLabel": "Paramètres",
        "mcp": {
          "title": "Construire avec des agents IA ?",
          "description": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP.",
          "link": "Explorez MCP"
        }
      },
      "chain": {
        "kicker": "Points de terminaison de la chaîne",
        "title": {
          "lead": "",
          "accent": "Extracteur → Avis / Photos",
          "tail": ""
        },
        "lead": "Recherchez des lieux, puis transmettez leur `fid` à l’API d’avis ou de photos. Les trois API partagent une clé et un quota mensuel de requêtes.",
        "label": "Recherchez des lieux, puis transmettez leur fid à l’API d’avis ou de photos. Les trois API partagent une clé et un quota mensuel de requêtes.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 avis"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 avis"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 avis"
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
          "note": "En cas de succès, status vaut partial ; reason explique l’arrêt de la collecte. reported_total est le nombre signalé par la source ou null, pas la taille vérifiée de l’album."
        }
      },
      "reference": {
        "kicker": "Référence",
        "title": {
          "lead": "Demande entrante, ",
          "accent": "JSON",
          "tail": " sortante"
        },
        "lead": "Envoyez votre clé sous le nom `Authorization: Bearer YOUR_API_KEY` avec un corps JSON. Chaque réponse est enveloppée dans `{code, data, msg}`, et `code` 10000 est synonyme de succès.",
        "baseUrl": "Base URL",
        "copyBaseUrl": "Copier la base URL",
        "request": "Demande",
        "response": "Réponse",
        "columns": {
          "parameter": "Paramètre",
          "field": "Champ",
          "type": "Taper",
          "description": "Description",
          "example": "Exemple"
        },
        "required": "requis",
        "groupsLabel": "Groupes de terrain",
        "notes": [
          {
            "icon": "gauge",
            "title": "Une demande par appel réussi",
            "description": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
          },
          {
            "icon": "key",
            "title": "Un 401 signifie vérifier votre clé",
            "description": "Une clé manquante ou invalide renvoie HTTP 401. D'autres erreurs renvoient HTTP 200 avec un `code` non-10000 et un `msg`."
          },
          {
            "icon": "locate",
            "title": "L'emplacement est un parti pris, pas une clôture",
            "description": "`ll` indique à Maps où rechercher. Les lieux situés en dehors de cette vue peuvent toujours apparaître."
          },
          {
            "icon": "target",
            "title": "Nommez le lieu",
            "description": "Mettez une ville, un état ou ZIP dans `q` — « près de chez moi » n'a rien à quoi s'ancrer sur un serveur."
          }
        ]
      },
      "plans": {
        "kicker": "API plans",
        "title": {
          "lead": "Accès programmatique, ",
          "accent": "tarifé sur demande",
          "tail": ""
        },
        "lead": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
      },
      "faq": {
        "lead": "Les réponses courtes. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
        "contact": "Contacter l'assistance"
      },
      "cta": {
        "kicker": "Commencer",
        "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps API d’extraction — Données commerciales en JSON | MapsGrab",
        "description": "Le MapsGrab API d’extraction renvoie les résultats de recherche Google Maps sous la forme JSON : nom, adresse, téléphone, site Web, note, horaires, coordonnées, Place ID et fid — ainsi que des e-mails et des profils sociaux sur demande."
      },
      "hero": {
        "title": {
          "lead": "API d’",
          "accent": "extraction",
          "tail": " Google Maps"
        },
        "lead": "Envoyez un mot-clé via HTTPS et récupérez les entreprises Google Maps sous la forme JSON : nom, adresse, téléphone, site Web, note, heures d'ouverture, coordonnées, Place ID et fid — ainsi que des e-mails et des profils sociaux sur demande.",
        "meta": [
          "Forfait gratuit : {quota}",
          "Une clé pour la recherche et les avis",
          "JSON sur HTTPS"
        ],
        "chips": [
          {
            "label": "Par place",
            "value": "Champs de données 29"
          },
          {
            "label": "Par page",
            "value": "Jusqu'à 20 places"
          }
        ]
      },
      "endpoint": {
        "name": "API d’extraction",
        "description": "Entreprises pour n'importe quel mot-clé et emplacement facultatif : champs 29 par lieu, plus e-mails et profils sociaux avec `extra`.",
        "link": "Explorez le extracteur API"
      },
      "caps": {
        "title": {
          "lead": "Ce que renvoie le ",
          "accent": "API d’extraction",
          "tail": ""
        },
        "lead": "Un mot-clé et un biais d'emplacement facultatif ; les endroits qu'une recherche Google Maps montre, comme structuré JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Recherche par mot-clé et emplacement",
            "description": "Envoyez `q` avec un biais de localisation facultatif `ll`. `page` définit le nombre de pages de résultats à collecter, 1–10, jusqu'à 20 places chacune, le tout dans une seule réponse."
          },
          {
            "icon": "table",
            "title": "29 champs par lieu",
            "description": "Nom, catégories, adresse complète, téléphone, site Web, nombre de notes et d'avis, heures d'ouverture, coordonnées, Place ID, CID, fid, propriétaire et plus encore."
          },
          {
            "icon": "mail",
            "title": "E-mail et enrichissement social",
            "description": "Réglez `extra` sur `true` pour ajouter `emails` et `medias` : profils Instagram, Facebook, YouTube, TikTok, LinkedIn et X trouvés sur chaque site Web d'entreprise."
          },
          {
            "icon": "braces",
            "title": "Propre et prévisible JSON",
            "description": "Champs snake_case dans une enveloppe `{code, data, msg}`. Les valeurs Google Maps ne s'affichent pas comme `null` ou une liste vide, jamais sous forme de chaînes vides."
          },
          {
            "icon": "layers",
            "title": "Les données partielles sont signalées",
            "description": "Si certains détails ne peuvent pas être renseignés, vous obtenez toujours les places — avec `partial` réglé sur `true` et `warnings` indiquant ce qui manque."
          },
          {
            "icon": "shield",
            "title": "Données publiques uniquement",
            "description": "Les résultats contiennent uniquement ce que Google Maps affiche publiquement : les mêmes détails que tout visiteur peut lire."
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
            "description": "Ce qu'il faut rechercher, jusqu'à 300 caractères : un type d'entreprise plus un lieu, par ex. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Combien de pages de résultats à collecter, 1–10, jusqu'à 20 places chacune, toutes renvoyées dans une seule réponse. La collecte s'arrête plus tôt lorsqu'une page contient moins de 20 emplacements ou rien de nouveau. Par défaut `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Langue du résultat, par ex. `en` ou `fr`. Par défaut `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Biais de localisation facultatif comme `@lat,lng,zoom`, zoom 0–21. Il indique à Maps où rechercher ; les résultats ne sont pas coupés à un rayon."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` ajoute `emails` et `medias` à chaque endroit. Par défaut `false`."
          }
        ],
        "groups": [
          {
            "label": "Identité",
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
            "label": "Contact",
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
                "badge": "supplémentaire"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "supplémentaire"
              }
            ]
          },
          {
            "label": "Emplacement",
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
            "label": "Notes",
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
            "label": "Page",
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
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Que renvoie le API d’extraction ?",
            "answer": "JSON avec jusqu'à 20 places par page collectée. Chaque lieu comporte des champs 29 – nom, catégories, adresse, téléphone, site Web, note, nombre d'avis, heures d'ouverture, coordonnées, Place ID, CID, fid et plus – ainsi que des e-mails et des profils sociaux lorsque l'excédent est vrai."
          },
          {
            "question": "Comment puis-je m'authentifier ?",
            "answer": "Envoyez votre clé MapsGrab API en tant que jeton au porteur dans l'en-tête Authorization. Chaque compte possède une clé. Elle s'affiche dans son intégralité uniquement lorsque vous la générez, et la génération d'une nouvelle clé désactive immédiatement l'ancienne."
          },
          {
            "question": "Comment les demandes sont-elles comptabilisées ?",
            "answer": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
          },
          {
            "question": "A quoi sert la page ?",
            "answer": "page indique le nombre de pages de résultats à collecter en un seul appel, de 1 à 10. Chaque page totalise 20 lieux, et la collecte s'arrête tôt lorsque Google Maps n'a rien de nouveau. Ce n'est pas un numéro de page."
          },
          {
            "question": "Les données sont-elles publiques ?",
            "answer": "Oui. Le API renvoie uniquement les informations affichées publiquement sur Google Maps – les mêmes détails que tout visiteur peut lire. Il n'accède pas aux comptes privés ni aux données non publiques."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Mettez les données Maps dans votre ",
          "accent": "application",
          "tail": ""
        },
        "lead": "Une requête HTTP par recherche, structurée JSON dans la réponse — pour les CRM, les pipelines de données et vos propres produits."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Avis Extracteur API — Avis dans JSON | MapsGrab",
        "description": "Les MapsGrab Avis API renvoie les avis publics d'une entreprise Google Maps sous la forme JSON : note, texte et traduction, auteur, date, photos de l'avis et réponses du propriétaire — jusqu'à 60 par page avec un curseur."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Avis",
          "tail": " Extracteur API"
        },
        "lead": "Demandez les avis publics de n'importe quelle entreprise Google Maps par son fid et obtenez un retour structuré JSON : note, texte et traduction, auteur, date, photos d'avis et réponses du propriétaire - page par page avec un curseur.",
        "meta": [
          "Forfait gratuit : {quota}",
          "Jusqu'à 60 avis par page",
          "JSON sur HTTPS"
        ],
        "chips": [
          {
            "label": "Par page",
            "value": "Jusqu'à 60 avis"
          },
          {
            "label": "Trier par",
            "value": "Pertinence · plus récent · note"
          }
        ]
      },
      "endpoint": {
        "name": "API d’avis",
        "description": "Avis publics d'une entreprise par `fid` — jusqu'à 60 par page, triés à votre manière, paginés avec un curseur.",
        "link": "Explorez les avis API"
      },
      "caps": {
        "title": {
          "lead": "Ce que renvoient les ",
          "accent": "Avis API",
          "tail": ""
        },
        "lead": "Chaque avis public sur une entreprise (évaluations, textes, auteurs, photos et réponses du propriétaire) – une page par demande.",
        "items": [
          {
            "icon": "review",
            "title": "Évaluations par fid",
            "description": "Adressez-vous à une entreprise par le `fid` à partir de n'importe quel résultat API d’extraction, puis repassez `next_cursor` pour lire la page suivante, jusqu'à 60 avis chacun."
          },
          {
            "icon": "filter",
            "title": "Trié à votre façon",
            "description": "`sort_by` renvoie en premier les avis les plus pertinents (1), les plus récents (2), les mieux notés (3) ou les moins bien notés (4)."
          },
          {
            "icon": "list",
            "title": "Texte, traduction et dates",
            "description": "Note, texte de l'avis, `translated_text` et `language`, avec `published_at_ms` et une date relative pour chaque avis."
          },
          {
            "icon": "user",
            "title": "Détails de l'auteur",
            "description": "Nom de l'auteur et lien de profil, nombre d'avis de l'auteur et statut de Local Guide."
          },
          {
            "icon": "image",
            "title": "Photos et réponses du propriétaire",
            "description": "`images` répertorie la photo URLs jointe à un avis ; `owner_response` porte la réponse du propriétaire et `owner_response_at_ms` son heure."
          },
          {
            "icon": "shield",
            "title": "Données publiques uniquement",
            "description": "Seuls les avis affichés publiquement sur Google Maps — le même contenu que tout visiteur peut lire."
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
            "description": "ID de fonctionnalité commerciale, par ex. `0x5495…:0xbeb4…`. Chaque emplacement API d’extraction l'inclut."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "Le `next_cursor` de la page précédente. Omettez-le pour la première page."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` le plus pertinent · `2` le plus récent · `3` note la plus élevée · `4` note la plus basse. Par défaut `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Code de langue, par ex. `en`. Par défaut `en`."
          }
        ],
        "groups": [
          {
            "label": "Revoir",
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
            "label": "Auteur",
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
            "label": "Réponse du propriétaire",
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
            "label": "Page",
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
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Comment puis-je m'adresser à une entreprise spécifique ?",
            "answer": "Avec son fid, l'ID de fonctionnalité que chaque emplacement API d’extraction inclut. Le Finder gratuit Place ID lit également le FID depuis n'importe quel endroit Google Maps URL."
          },
          {
            "question": "Quels champs un avis comprend-il ?",
            "answer": "ID de l'avis, note, texte avec sa traduction et sa langue, heure de publication et date relative, nom de l'auteur, lien de profil, nombre d'avis et statut du Guide local, photos jointes et réponse du propriétaire avec son heure."
          },
          {
            "question": "Combien d’avis puis-je recueillir ?",
            "answer": "Chaque demande renvoie une page contenant jusqu'à 60 avis plus un next_cursor. Renvoyez-le pour lire la page suivante ; lorsque next_cursor est nul, il n'y a plus de pages."
          },
          {
            "question": "Comment les demandes sont-elles comptabilisées ?",
            "answer": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
          },
          {
            "question": "Les données sont-elles publiques ?",
            "answer": "Oui. Le API renvoie uniquement les avis affichés publiquement sur Google Maps — le même contenu que tout visiteur peut lire. Il n'accède pas aux comptes privés ni aux données non publiques."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Surveiller les avis ",
          "accent": "à l'échelle",
          "tail": ""
        },
        "lead": "Fils de révision paginés en Cursor en JSON propre — pour la surveillance, la recherche et le reporting."
      }
    },
    "photosApi": {
      "seo": {
        "title": "API de photos — URL de photos publiques d’établissements | MapsGrab",
        "description": "Obtenez les URL de photos publiques d’un établissement en JSON avec son fid. max_results limite la livraison ; les résultats sont partiels et ne garantissent pas un album complet."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Photos",
          "tail": " API"
        },
        "lead": "Obtenez les URL de photos publiques d’un établissement en JSON avec son fid. max_results limite la livraison ; les résultats sont partiels et ne garantissent pas un album complet.",
        "meta": [
          "Forfait gratuit : {quota}",
          "URL de photos publiques d’établissements",
          "tarifé sur demande"
        ],
        "chips": [
          {
            "label": "Livraison",
            "value": "partial"
          },
          {
            "label": "Nombre",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "API de photos",
        "description": "Obtenez les URL de photos publiques d’un établissement en JSON avec son fid. max_results limite la livraison ; les résultats sont partiels et ne garantissent pas un album complet.",
        "link": "Découvrir l’API de photos"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "API de photos",
          "tail": ""
        },
        "lead": "URL de photos publiques d’établissements",
        "items": [
          {
            "icon": "image",
            "title": "Photos par fid",
            "description": "Utilisez le `fid` de la recherche ou de Place ID Finder. Chaque élément de `photos` contient l’`url` d’une photo publique."
          },
          {
            "icon": "filter",
            "title": "Limitez chaque requête",
            "description": "`max_results` est un entier positif, égal à 200 par défaut. Le nombre de photos peut être inférieur. Il n’y a ni page ni curseur."
          },
          {
            "icon": "list",
            "title": "Consultez l’état de livraison",
            "description": "En cas de succès, `status` vaut `partial` ; `reason` explique l’arrêt de la collecte. `reported_total` est le nombre signalé par la source ou `null`, pas la taille vérifiée de l’album."
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
            "description": "FID de l’établissement obtenu par la recherche ou Place ID Finder, au format `0x…:0x…`, avec 12 à 20 chiffres hexadécimaux par segment."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Limite positive de livraison, égale à 200 par défaut. Ce nombre de photos n’est pas garanti."
          }
        ],
        "groups": [
          {
            "label": "Photos",
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
            "label": "Livraison",
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
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Comment demander des photos d’un établissement ?",
            "answer": "Envoyez POST à /photos avec fid et, éventuellement, max_results. Utilisez la même clé Bearer que pour les API de recherche et d’avis."
          },
          {
            "question": "Vais-je recevoir l’album complet ?",
            "answer": "En cas de succès, status vaut partial ; reason explique l’arrêt de la collecte. reported_total est le nombre signalé par la source ou null, pas la taille vérifiée de l’album. max_results est un entier positif, égal à 200 par défaut. Le nombre de photos peut être inférieur. Il n’y a ni page ni curseur."
          },
          {
            "question": "Comment puis-je obtenir le code d'identification d'une entreprise ?",
            "answer": "Chaque emplacement API d’extraction inclut son fid, et le Finder gratuit Place ID lit le FID à partir de n'importe quel endroit Google Maps URL."
          },
          {
            "question": "Comment les demandes sont-elles comptabilisées ?",
            "answer": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
          },
          {
            "question": "Les données sont-elles publiques ?",
            "answer": "Oui. L'image URLs pointe vers des photos affichées publiquement sur Google Maps — les mêmes images que tout visiteur peut voir."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Intégrez les photos d’établissements à votre application",
          "tail": ""
        },
        "lead": "Utilisez votre clé API pour obtenir des URL de photos publiques et leur état de livraison."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps Extracteur MCP Serveur | MapsGrab",
        "description": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Connectez votre agent",
      "hero": {
        "kicker": "MCP serveur",
        "title": {
          "lead": "Serveur ",
          "accent": "MCP",
          "tail": " d’extraction Google Maps"
        },
        "lead": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP.",
        "meta": [
          "Streamable HTTP",
          "Connectez-vous avec OAuth",
          "Forfait gratuit : {quota}"
        ],
        "chips": [
          {
            "label": "Transport",
            "value": "Streamable HTTP"
          },
          {
            "label": "Résultats de l'outil",
            "value": "Structuré JSON"
          }
        ]
      },
      "agent": {
        "label": "Exemple de session d'agent : une question sur les entreprises locales, un appel d'outil MapsGrab avec des résultats structurés et la réponse de l'agent",
        "session": "Séance d'agent",
        "connected": "MCP serveur {server} connecté",
        "placeholder": "Renseignez-vous sur n'importe quel endroit sur Google Maps…",
        "thinking": "Pensée…",
        "running": "en cours d'exécution",
        "scenes": [
          {
            "prompt": "Trouvez des dentistes à Austin, Texas, notés 4.8 ou supérieur et indiquez leurs numéros de téléphone.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 lieux",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 places supplémentaires"
              }
            ],
            "answer": [
              "Trois des premiers résultats 20 sont notés ",
              {
                "strong": "4.8 ou supérieur"
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
            "prompt": "Que disent les gens dans les dernières critiques de Ember & Oak Coffee à Portland ?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 lieu",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 avis",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Surtout ",
              {
                "strong": "5-étoile"
              },
              " — les gens louent l'espresso et le personnel amical. La seule remarque récurrente : ",
              {
                "strong": "les places sont restreintes le week-end"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Quels plombiers à Chicago ne répertorient pas de site Web ? Mettez-les dans un tableau.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 lieux",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 places supplémentaires"
              }
            ],
            "answer": [
              {
                "strong": "4 de 20"
              },
              " n'ont pas de site Web répertorié. Les trois premiers :"
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
            "prompt": "Extrayez les avis les moins bien notés sur Rose City Roasters et rédigez des réponses polies.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 lieu",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 avis",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Les notes les plus basses mentionnent majoritairement ",
              {
                "strong": "service lent aux heures de pointe"
              },
              ". ",
              {
                "strong": "2 du 3"
              },
              " Je n'ai pas encore de réponse du propriétaire - j'en ai rédigé une pour chacun."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Outils",
        "title": {
          "lead": "Ce que le serveur MCP ",
          "accent": "expose",
          "tail": ""
        },
        "lead": "Trois outils: Search / Reviews / Photos.",
        "kind": "Outil",
        "returns": "Retours",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Rechercher des lieux",
            "description": "Recherches de mots clés et de lieux qui renvoient ce qu'une recherche Google Maps montre : noms, téléphones, notes, heures, coordonnées, identifiants de lieu et identifiants.",
            "args": [
              {
                "name": "q",
                "description": "Mot clé plus ville, état ou ZIP"
              },
              {
                "name": "page",
                "description": "Pages de résultats à collecter, 1–10 · jusqu'à 20 places chacune"
              },
              {
                "name": "hl",
                "description": "Langue du résultat, par ex. `en`"
              },
              {
                "name": "ll",
                "description": "Biais de localisation, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` ajoute des e-mails et des profils sociaux"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Mêmes données que le API d’extraction"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Liste des avis",
            "description": "Notes, textes d'avis, auteurs, dates, photos et réponses du propriétaire pour toute entreprise que votre agent étudie.",
            "args": [
              {
                "name": "fid",
                "description": "À partir de n'importe quel résultat de recherche"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` de la dernière page ; omettre pour la première fois"
              },
              {
                "name": "sort_by",
                "description": "1 pertinent · 2 le plus récent · 3 le plus élevé · 4 le plus bas"
              },
              {
                "name": "hl",
                "description": "Langue, par ex. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Mêmes données que les avis API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Photos par fid",
            "description": "Obtenez les URL de photos publiques d’un établissement en JSON avec son fid. max_results limite la livraison ; les résultats sont partiels et ne garantissent pas un album complet.",
            "args": [
              {
                "name": "fid",
                "description": "FID de l’établissement obtenu par la recherche ou Place ID Finder, au format `0x…:0x…`, avec 12 à 20 chiffres hexadécimaux par segment."
              },
              {
                "name": "max_results",
                "description": "Limite positive de livraison, égale à 200 par défaut. Ce nombre de photos n’est pas garanti."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Découvrir l’API de photos"
          }
        ]
      },
      "flow": {
        "kicker": "Comment il se connecte",
        "title": {
          "lead": "Un point de terminaison entre votre agent et ",
          "accent": "données Maps en direct",
          "tail": ""
        },
        "lead": "Votre client se connecte via Streamable HTTP et se connecte via votre navigateur. L'agent découvre les outils, les appelle lorsqu'une invite a besoin de données Maps et relit le JSON structuré.",
        "label": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP clients",
        "anyClient": "Tout client MCP",
        "toolsLabel": "Outils",
        "hub": "MapsGrab MCP",
        "publicData": "Données publiques Google Maps",
        "resultLabel": "résultat",
        "results": [
          "20 lieux",
          "60 avis",
          "2 Photos"
        ],
        "steps": [
          {
            "title": "Connecter",
            "description": "Ajoutez le point de terminaison à votre client, puis connectez-vous à MapsGrab via votre navigateur."
          },
          {
            "title": "Découvrir",
            "description": "Votre agent répertorie les outils MapsGrab et leurs schémas d'entrée."
          },
          {
            "title": "Appel",
            "description": "Lorsqu'une invite a besoin de données Maps, l'agent appelle un outil et lit le résultat JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Installation",
        "title": {
          "lead": "Un bloc de configuration ",
          "accent": "par client",
          "tail": ""
        },
        "lead": "Dirigez votre client vers le point de terminaison MapsGrab et connectez-vous via votre navigateur : pas de clé API à copier, pas de SDK, pas de processus local à exécuter.",
        "tabsLabel": "MCP client",
        "copy": "Copier la configuration",
        "clients": {
          "claude": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Ajouter le serveur",
                "description": "Exécutez la commande pour enregistrer `mapsgrab` sur HTTP."
              },
              {
                "title": "Se connecter",
                "description": "Dans Claude Code, exécutez `/mcp`, choisissez `mapsgrab` et authentifiez-vous — MapsGrab s'ouvre dans votre navigateur pour que vous l'approuviez."
              },
              {
                "title": "Demander des données Maps",
                "description": "Claude Code répertorie les outils MapsGrab et les appelle lorsqu'une invite en a besoin."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Modifier mcp.json",
                "description": "Ajoutez le bloc à `~/.cursor/mcp.json` pour chaque projet, ou à `.cursor/mcp.json` pour un."
              },
              {
                "title": "Se connecter",
                "description": "Dans Paramètres Cursor → MCP, cliquez sur Connecter à côté de `mapsgrab` et approuvez-le dans votre navigateur."
              },
              {
                "title": "Utiliser les outils",
                "description": "`mapsgrab` affiche ses outils dans la liste des serveurs MCP, prêts pour l'agent."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Ajouter .vscode/mcp.json",
                "description": "Collez le bloc – il ne contient que le point final URL, rien de secret."
              },
              {
                "title": "Se connecter",
                "description": "Démarrez le serveur. VS Code demande à s'authentifier auprès de MapsGrab et ouvre votre navigateur pour approuver."
              },
              {
                "title": "Utiliser le mode agent",
                "description": "Ouvrez Chat en mode agent et activez les outils MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Ajouter le serveur",
                "description": "Exécutez `codex mcp add` pour enregistrer `mapsgrab` par URL."
              },
              {
                "title": "Se connecter",
                "description": "Exécutez `codex mcp login mapsgrab` et approuvez MapsGrab dans votre navigateur."
              },
              {
                "title": "Démarrer Codex",
                "description": "Les nouvelles sessions chargent `mapsgrab` et ses outils."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Vous ne parvenez pas à vous connecter depuis un navigateur ? Utilisez une clé API",
          "description": "Si votre client ne prend pas en charge l'autorisation MCP ou s'exécute sur un serveur ou dans CI, ajoutez plutôt votre clé API en tant qu'en-tête `Authorization`. Conservez la clé dans une variable d'environnement ou dans l'entrée secrète de votre client, pas dans un fichier de configuration partagé.",
          "link": "Obtenez la clé API",
          "snippet": "Tout client HTTP"
        },
        "spec": {
          "title": "Tout autre client MCP",
          "subtitle": "MCP Inspector inclus",
          "transport": "Transport",
          "transportValue": "Streamable HTTP",
          "endpoint": "Point de terminaison",
          "copyEndpoint": "Copier le point de terminaison",
          "auth": "Authentification",
          "authValue": "Connexion à OAuth (version de secours : Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Exemples d'invites",
        "title": {
          "lead": "Demandez dans un langage simple. ",
          "accent": "Récupérer les lignes.",
          "tail": ""
        },
        "lead": "Prospection, étude de marché locale, suivi des avis : décrivez le travail et votre agent décide quel outil MapsGrab appeler.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Prospection",
              "quote": "\"Trouvez des dentistes à Austin, au Texas, notés 4.8 ou plus et indiquez leurs numéros de téléphone.\"",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Réputation",
              "quote": "\"Résumez ce que les gens disent dans les dernières critiques de Ember & Oak Coffee à Portland.\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Listes de prospects",
              "quote": "\"Créez une liste des studios de yoga à Denver avec leurs e-mails et leurs profils Instagram.\"",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Étude de marché",
              "quote": "\"Comparez les notes et le nombre d'avis sur les cafés de Division St à Portland.\"",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Enrichissement",
              "quote": "\"Ajoutez le Place ID, le téléphone et le site Web de chaque entreprise dans cette feuille de calcul.\"",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Le propriétaire répond",
              "quote": "« Extrayez les avis les moins bien notés de Rose City Roasters et rédigez des réponses polies. »",
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
              "tag": "Lacunes du site Web",
              "quote": "\"Quels plombiers à Chicago ne répertorient pas de site Web ? Mettez-les dans un tableau.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Horaires d'ouverture",
              "quote": "« Quels ateliers de réparation automobile proches de 60614 sont ouverts le dimanche ? »",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Cartographie",
              "quote": "\"Exportez les restaurants végétaliens de Brooklyn avec des coordonnées en GeoJSON.\"",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Localisation",
              "quote": "« Recherchez des boulangeries à Lyon et renvoyez les détails de l'annonce en français. »",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Annonces revendiquées",
              "quote": "\"Vérifiez quels gymnases d'Austin ont revendiqué leur fiche d'entreprise Google.\"",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Guides locaux",
              "quote": "\"Quels avis récents sur Hawthorne Bean Co. proviennent de Local Guides ?\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Temps de réponse",
              "quote": "« Ces salons répondent-ils à leurs avis et combien de temps prennent les réponses des propriétaires ?",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Authentification et données",
        "title": {
          "lead": "Connectez-vous une fois. ",
          "accent": "Données publiques uniquement.",
          "tail": ""
        },
        "lead": "Chaque appel vers le point de terminaison MCP comporte un identifiant au porteur – un jeton OAuth lors de la connexion, ou votre clé API si votre client ne peut pas se connecter – et chaque résultat provient de ce que Google Maps affiche publiquement.",
        "inspector": {
          "label": "Exemple de requête MCP avec un en-tête support Authorization et sa réponse JSON-RPC avec un contenu structuré",
          "request": "Demande",
          "response": "Réponse",
          "verified": "Jeton vérifié"
        },
        "items": [
          {
            "icon": "key",
            "title": "Connectez-vous ou revenez à une clé",
            "description": "Connectez-vous via votre navigateur et approuvez le client. Les clients sans autorisation MCP peuvent plutôt transmettre votre clé API comme jeton de porteur – les deux accèdent aux mêmes outils."
          },
          {
            "icon": "eye",
            "title": "Lit Google Maps, n'écrit jamais",
            "description": "Les outils recherchent et lisent uniquement les listes publiques. La seule chose qu'un appel change est l'utilisation de votre demande."
          },
          {
            "icon": "lock",
            "title": "Aucun secret dans les fichiers de configuration",
            "description": "Avec la connexion, votre configuration contient uniquement le point de terminaison URL. Si vous utilisez une clé API, conservez-la dans une variable d'environnement et non dans un fichier partagé."
          },
          {
            "icon": "shield",
            "title": "Révoquer l'accès à tout moment",
            "description": "Les clients connectés sont répertoriés dans Tableau de bord → API, où vous pouvez les révoquer. La génération d'une nouvelle clé API désactive immédiatement l'ancienne."
          }
        ]
      },
      "billing": {
        "kicker": "Tarifs",
        "title": {
          "lead": "Couvert par votre plan ",
          "accent": "API",
          "tail": ""
        },
        "lead": "Le serveur MCP utilise le même quota de requêtes mensuel que le API d’extraction et les API d’avis. Chaque appel d'outil réussi compte pour une demande.",
        "compare": "Comparez les forfaits API",
        "head": {
          "plan": "Plan",
          "requests": "Demandes mensuelles",
          "scale": "(échelle logarithmique)",
          "price": "Prix"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Questions fréquentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Qu'est-ce que le serveur MapsGrab MCP ?",
            "answer": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP. search_places / list_reviews / list_photos."
          },
          {
            "question": "Quels clients peuvent se connecter ?",
            "answer": "Tout client MCP prenant en charge Streamable HTTP : Claude Code, Cursor, VS Code, Codex, MCP Inspector et autres. Utilisez le point de terminaison URL exactement comme indiqué, y compris la barre oblique finale."
          },
          {
            "question": "Comment est-il authentifié ?",
            "answer": "Avec la connexion OAuth : Claude Code, Cursor, VS Code, Codex et d'autres clients prenant en charge l'autorisation MCP, ouvrez MapsGrab dans votre navigateur ; vous approuvez le client et pouvez le révoquer plus tard dans Tableau de bord → API. Uniquement si votre client ne peut pas se connecter, transmettez votre clé API comme jeton de porteur dans l'en-tête Authorization."
          },
          {
            "question": "Comment les appels d’outils sont-ils comptabilisés ?",
            "answer": "Chaque appel réussi compte pour une requête, y compris une livraison partielle de photos, quel que soit leur nombre. Si aucune photo valide ne peut être livrée, l’appel échoue sans consommer de quota. Recherche, avis, photos et MCP partagent le quota mensuel."
          },
          {
            "question": "Mon agent peut-il obtenir des photos professionnelles ?",
            "answer": "list_photos(fid, max_results): Obtenez les URL de photos publiques d’un établissement en JSON avec son fid. max_results limite la livraison ; les résultats sont partiels et ne garantissent pas un album complet. Limite positive de livraison, égale à 200 par défaut. Ce nombre de photos n’est pas garanti."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Donnez à votre agent ",
          "accent": "données Maps en direct",
          "tail": ""
        },
        "lead": "Recherchez des lieux Google Maps, lisez des avis et obtenez des URL de photos publiques d’établissements avec une connexion MCP."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Outils gratuits",
        "guide": {
          "kicker": "À propos de cet outil",
          "title": {
            "lead": "Que fait-il et ",
            "accent": "comment l'utiliser",
            "tail": ""
          },
          "lead": "Tout s'exécute dans votre navigateur : rien de ce que vous collez ou téléchargez ne quitte votre appareil."
        },
        "related": {
          "kicker": "Outils associés",
          "title": {
            "lead": "Plus d'outils gratuits pour ",
            "accent": "Données cartographiques",
            "tail": ""
          },
          "lead": "Petits utilitaires qui s'exécutent entièrement dans votre navigateur : ce que vous collez ne quitte jamais votre appareil. Seule exception : le Vérificateur de courrier électronique envoie l'adresse à notre serveur pour la vérifier."
        },
        "faq": {
          "kicker": "Questions fréquentes",
          "lead": "Les réponses courtes. Pour tout le reste, l'assistance est à portée de main d'un e-mail.",
          "contact": "Contacter l'assistance"
        },
        "cta": {
          "kicker": "Extraction en vrac",
          "primary": "Installer MapsGrab",
          "secondary": "Voir les prix",
          "note": "Quota mensuel gratuit inclus. Pas de carte de crédit."
        },
        "resultHeading": "Résultat",
        "copy": "Copie",
        "copied": "Copié dans le presse-papiers.",
        "downloadCsv": "Télécharger CSV",
        "genericError": "Quelque chose s'est mal passé. Vérifiez votre saisie et réessayez."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder — Obtenez un Google Maps Place ID à partir d'un URL | MapsGrab",
          "description": "Collez un Google Maps à la place URL et obtenez instantanément ses Place ID, CID et FID. Recherche Place ID gratuite basée sur un navigateur — pas de connexion, votre URL ne quitte jamais votre appareil."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "Finder",
            "tail": ""
          },
          "description": "Collez un Google Maps complet à la place URL et lisez ses Place ID, CID et FID en un clic. Tout est décodé dans votre navigateur — le URL n'est jamais téléchargé."
        },
        "form": {
          "urlLabel": "Google Maps lieu URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Trouvez Place ID",
          "errorShortLink": "Les liens courts (maps.app.goo.gl) ne sont pas pris en charge. Ouvrez le lien dans votre navigateur et collez le URL complet depuis la barre d'adresse.",
          "errorInvalidUrl": "Cela ne ressemble pas à un endroit Google Maps URL. Ouvrez un lieu dans Google Maps et copiez le URL complet (il doit contenir \"/maps/place/\" et \"@\" ou \"data=\").",
          "errorNoIds": "Aucun identifiant de lieu n'a été trouvé dans ce URL. Assurez-vous d'avoir copié le URL d'une page de lieu, et non d'une page de résultats de recherche.",
          "examplesLabel": "Essayer",
          "examples": {
            "city": "San Francisco",
            "business": "Café · Portland",
            "shortLink": "Lien court"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url des deux FID moitiés",
          "cidNote": "FID 2ème moitié, hexadécimal → décimal",
          "fidNote": "deux derniers segments 0x… dans le URL",
          "anatomy": {
            "fidHigh": "FID · 1première moitié",
            "fidLow": "FID · 2ème moitié",
            "empty": "Collez un endroit URL — les identifiants qu'il porte s'allument ici."
          },
          "missing": "Pas dans ce lien",
          "copyLabel": "Copier {label}",
          "privacy": "Décodé dans votre navigateur — le URL n'est jamais téléchargé."
        },
        "chips": [
          {
            "label": "Touche Google API",
            "value": "Pas nécessaire"
          },
          {
            "label": "Votre URL",
            "value": "Jamais téléchargé"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Comment ça marche",
            "title": {
              "lead": "D'un lien Maps vers un ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "Pas de clé API et pas de connexion — les identifiants sont déjà à l'intérieur de l'endroit URL que vous copiez."
          },
          "items": [
            {
              "heading": "Ouvrez le lieu en Google Maps",
              "body": "Recherchez l'entreprise et cliquez sur sa liste pour que la page du lieu s'ouvre."
            },
            {
              "heading": "Copiez le URL complet",
              "body": "Copiez le long URL de la barre d'adresse : il contient le nom de l'entreprise, un segment de coordonnées \"@\" et un paramètre \"data=\"."
            },
            {
              "heading": "Coller et décoder",
              "body": "Collez-le ci-dessus et appuyez sur \"Rechercher Place ID\". Les Place ID, CID et FID apparaissent, chacun avec un bouton de copie."
            }
          ],
          "copiedBadge": "Copié",
          "note": "Les liens courts tels que maps.app.goo.gl ne peuvent pas être décodés sans les suivre dans tous les domaines, alors ouvrez d'abord le lien et collez l'adresse complète."
        },
        "identifiers": {
          "head": {
            "kicker": "Les identifiants",
            "title": {
              "lead": "Trois identifiants, ",
              "accent": "un seul endroit",
              "tail": ""
            },
            "lead": "Un Place ID est l'identifiant stable de Google pour un emplacement — une chaîne commençant par « ChIJ » qui reste valide même si l'entreprise renomme ou déménage."
          },
          "keys": {
            "placeId": "La chaîne « ChIJ… » consommée par les lieux API, les widgets d'avis et les systèmes de réservation.",
            "fid": "Une paire de valeurs hexadécimales qui identifient la même fonctionnalité en interne.",
            "cid": "Forme décimale de la seconde moitié du FID, utilisée par les anciennes cartes URLs et les outils publicitaires."
          },
          "derive": {
            "label": "Comment les Place ID et CID sont dérivés du FID",
            "source": "FID du URL",
            "protobuf": "protobuf · petit-boutiste",
            "base64": "base64url",
            "secondHalf": "2ème moitié",
            "hexToDecimal": "hexadécimal → décimal"
          },
          "features": [
            {
              "heading": "Pas de clé API",
              "body": "Le Place ID est déjà encodé à l'endroit URL que vous collez, afin que l'outil puisse le décoder hors ligne."
            },
            {
              "heading": "Aucune limite de taux",
              "body": "Aucun service de recherche n'est impliqué : la conversion d'un Maps URL en un Place ID est déterministe."
            },
            {
              "heading": "Jamais téléchargé",
              "body": "L'intégralité du calcul s'exécute dans l'onglet de votre navigateur — le URL que vous collez n'est jamais envoyé à aucun serveur."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Un Place ID change-t-il jamais ?",
              "answer": "Rarement. Google documente les identifiants de lieu en tant qu'identifiants stables à long terme, mais un petit nombre d'identifiants peuvent être retirés lorsque les emplacements sont fusionnés ou restructurés. Si un consommateur d'un Place ID le signale comme invalide, recherchez à nouveau l'endroit et actualisez la valeur stockée."
            },
            {
              "question": "Le Place ID est-il le même que le CID ?",
              "answer": "Non. Le CID est un identifiant décimal utilisé par les anciens liens Maps et les outils publicitaires, tandis que le Place ID est la chaîne « ChIJ… » utilisée par les lieux API. Ils identifient la même fonctionnalité mais ne sont pas interchangeables, c'est pourquoi cet outil signale les deux."
            },
            {
              "question": "Pourquoi mon lien maps.app.goo.gl est-il rejeté ?",
              "answer": "Les liens courts ne sont résolus à la place complète URL qu'après une redirection inter-domaines, qu'un outil uniquement navigateur ne peut pas suivre sans envoyer votre lien à un tiers. Ouvrez le lien court dans votre navigateur et collez le URL complet qui apparaît dans la barre d'adresse."
            },
            {
              "question": "Ai-je besoin d'une clé Google API pour cela ?",
              "answer": "Non. Le Place ID est déjà encodé à l'endroit URL que vous collez, afin que l'outil puisse le décoder hors ligne. Une touche Google API n'est nécessaire que lorsque vous souhaitez ensuite appeler les Lieux API avec l'ID."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Besoin d'identifiants de lieu ",
            "accent": "à grande échelle ?",
            "tail": ""
          },
          "lead": "MapsGrab extrait les Place ID, CID et FID pour chaque entreprise collectée – aux côtés de 33 d'autres colonnes – et les exporte directement vers CSV ou JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Générateur de liens d'avis — Revue directe gratuite URL | MapsGrab",
          "description": "Transformez un lieu Google Maps URL en un lien d'avis direct Google que vous pouvez partager avec les clients. Gratuit, basé sur un navigateur et rien n'est téléchargé."
        },
        "hero": {
          "title": {
            "lead": "Google Lien de révision ",
            "accent": "Générateur",
            "tail": ""
          },
          "description": "Collez un Google Maps à l'endroit URL et obtenez le lien direct « écrire un avis » pour cette entreprise – le chemin le plus court entre un client satisfait et un avis Google."
        },
        "form": {
          "urlLabel": "Google Maps lieu URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Générer un lien d'avis",
          "errorShortLink": "Les liens courts (maps.app.goo.gl) ne sont pas pris en charge. Ouvrez le lien dans votre navigateur et collez le URL complet depuis la barre d'adresse.",
          "errorInvalidUrl": "Cela ne ressemble pas à un endroit Google Maps URL. Ouvrez un lieu dans Google Maps et copiez le URL complet (il doit contenir \"/maps/place/\" et \"@\" ou \"data=\").",
          "errorNoIds": "Aucun identifiant de lieu n'a été trouvé dans ce URL. Assurez-vous d'avoir copié le URL d'une page de lieu, et non d'une page de résultats de recherche."
        },
        "result": {
          "linkLabel": "Lien de révision",
          "open": "Ouvrir"
        },
        "howTo": [
          {
            "heading": "Qu'est-ce qu'un lien d'avis Google ?",
            "body": "Un lien d'avis est un raccourci qui ouvre la boîte de dialogue d'avis d'une entreprise spécifique sur Google. Au lieu de demander aux clients de rechercher votre entreprise, de faire défiler jusqu'à la section des avis et d'appuyer sur « Écrire un avis », vous leur envoyez un URL — search.google.com/local/reviews?placeid=… — qui atterrit directement sur le formulaire d'avis. Les entreprises placent ces liens dans les e-mails de suivi, les codes QR au comptoir et les messages SMS post-transaction."
          },
          {
            "heading": "Comment générer un lien d'avis",
            "body": "Ouvrez Google Maps, recherchez votre entreprise et ouvrez sa page d'adresse. Copiez le long URL de la barre d'adresse et collez-le ci-dessus. Appuyez sur « Générer un lien de révision » et l'outil crée le lien direct avec l'identifiant du lieu encodé, prêt à être copié ou ouvert. Le lien est universel : il fonctionne sur les navigateurs de bureau et sur l'application mobile Google Maps."
          },
          {
            "heading": "D'où vient l'identifiant du lieu",
            "body": "L'outil réutilise le même décodage local que le Finder Place ID : l'identifiant est déjà présent dans les Maps URL, et la conversion vers la forme \"ChIJ…\" se fait entièrement dans votre navigateur. Si vous gérez plusieurs emplacements, répétez le processus par endroit — ou laissez MapsGrab porter la colonne Place ID dans chaque exportation afin que les liens de révision puissent être générés en masse à partir d'une feuille de calcul."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Les liens d’avis expirent-ils ?",
              "answer": "Non. Le lien est lié à l'ID de lieu de l'emplacement, qui Google reste stable. Tant que le lieu existe sur Google Maps, le lien continue d'ouvrir sa boîte de dialogue de révision."
            },
            {
              "question": "Puis-je utiliser un seul lien pour plusieurs emplacements ?",
              "answer": "Chaque lien d’avis appartient exactement à un seul endroit. Générez un lien distinct par emplacement : les entreprises multi-sites conservent généralement un tableau des identifiants de lieu et en dérivent les liens."
            },
            {
              "question": "Est-il autorisé de demander des avis avec un lien ?",
              "answer": "Demander aux clients des avis honnêtes est une bonne chose ; inciter ou filtrer les avis ne l’est pas. La politique de Google interdit la compensation pour les avis et le contrôle des avis : envoyez le même lien à chaque client et laissez les commentaires parler d'eux-mêmes."
            },
            {
              "question": "Pourquoi mon lien ouvre-t-il une page de recherche au lieu du formulaire d'avis ?",
              "answer": "Cela se produit lorsque l'identifiant du lieu dans le lien est erroné – généralement le résultat d'un URL modifié manuellement. Régénérez le lien à partir de l'emplacement Maps d'origine URL et vérifiez que Place ID commence par \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Suivez chaque avis que vous ",
            "accent": " gagnez",
            "tail": ""
          },
          "lead": "MapsGrab extrait les avis de n'importe quelle page d'entreprise (évaluation, texte, date et réponses du propriétaire) afin que vous puissiez regarder les commentaires arriver et y répondre plus rapidement."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Email Checker — Vérifiez une adresse e-mail gratuitement | MapsGrab",
          "description": "Découvrez si une adresse e-mail peut recevoir des messages. Ce vérificateur gratuit interroge le serveur de messagerie et indique le statut, la délivrabilité, les enregistrements MX et le type de compte."
        },
        "hero": {
          "title": {
            "lead": "E-mail ",
            "accent": "Checker",
            "tail": ""
          },
          "description": "Saisissez une adresse e-mail : nous demandons à son serveur de messagerie si elle peut réellement recevoir des messages, avec le statut, les enregistrements MX, le type de compte et un score."
        },
        "guideLead": "La vérification du format se fait dans votre navigateur ; l'adresse elle-même est envoyée à notre serveur pour être vérifiée auprès de son serveur de messagerie.",
        "form": {
          "emailLabel": "Adresse email",
          "emailPlaceholder": "name@example.com",
          "submit": "Vérifier l'e-mail",
          "submitting": "Vérification…",
          "verifyingHint": "Interrogation du serveur de messagerie — cela peut prendre jusqu'à une minute.",
          "invalidHeading": "Cette adresse e-mail présente des problèmes :",
          "issues": {
            "empty": "Entrez d'abord une adresse e-mail.",
            "multipleAt": "L'adresse contient plusieurs symboles \"@\".",
            "missingAt": "Il manque à l'adresse le \"@\" qui sépare la partie locale du domaine.",
            "localEmpty": "La partie avant le \"@\" est vide.",
            "localTooLong": "La partie avant le \"@\" est plus longue que les caractères 64 autorisés par les standards de messagerie.",
            "localInvalidChars": "La partie précédant le « @ » contient des caractères non autorisés dans les adresses e-mail (espaces, guillemets ou caractères de contrôle).",
            "localDotPosition": "Les points de la partie locale ne peuvent pas être les premiers, les derniers ou apparaître deux fois de suite.",
            "domainEmpty": "La partie après le \"@\" est vide.",
            "domainNoTld": "Le domaine n'a pas de terminaison (TLD) — ajoutez quelque chose comme « .com » ou « .org ».",
            "domainInvalidChars": "Le domaine contient des caractères non autorisés (espaces, traits de soulignement ou symboles).",
            "domainLabelHyphen": "Les étiquettes de domaine ne peuvent pas commencer ou se terminer par un trait d'union.",
            "domainEmptyLabel": "Le domaine contient deux points consécutifs ou un segment vide.",
            "domainTooLong": "Le domaine est plus long que les caractères 253 autorisés par les normes de messagerie.",
            "typoDomain": "Ce domaine ressemble à une faute de frappe d'un fournisseur de messagerie populaire."
          }
        },
        "result": {
          "labels": {
            "status": "Statut",
            "deliverable": "Délivrable",
            "mxRecords": "Enregistrements MX",
            "email": "Adresse e-mail",
            "domain": "Domaine",
            "accountType": "Type de compte",
            "catchAll": "Domaine catch-all",
            "score": "Score"
          },
          "statuses": {
            "safe": "Sûre",
            "invalid": "Invalide",
            "disabled": "Désactivée",
            "disposable": "Jetable",
            "inbox_full": "Boîte pleine",
            "catch_all": "Catch-all",
            "role_account": "Adresse générique",
            "spamtrap": "Piège à spam",
            "unknown": "Inconnue"
          },
          "accountTypes": {
            "standard": "Standard",
            "role": "Générique",
            "disposable": "Jetable",
            "free": "Messagerie gratuite"
          },
          "yes": "Oui",
          "no": "Non",
          "noMx": "Aucun trouvé",
          "unavailable": "Impossible de joindre le service de vérification. Réessayez dans un instant.",
          "rateLimited": "Vous avez utilisé toutes vos vérifications gratuites du jour. Réessayez demain."
        },
        "howTo": [
          {
            "heading": "Ce que vérifie cet outil",
            "body": "L'outil demande au serveur de messagerie du destinataire si la boîte existe et accepte les messages — la même question qu'un serveur d'envoi pose avant la livraison, sans envoyer de message. Le résultat indique le statut global, si l'adresse est délivrable, les enregistrements MX du domaine, le type de compte (standard, générique comme info@ ou contact@, jetable ou fournisseur de messagerie gratuite), si le domaine est catch-all et un score de 0 à 100."
          },
          {
            "heading": "Comment vérifier une adresse e-mail",
            "body": "Saisissez ou collez une adresse et cliquez sur « Vérifier l'e-mail ». Les problèmes de format sont listés dans votre navigateur et l'adresse n'est alors pas envoyée ; une faute de frappe probable sur un fournisseur courant, comme « gmial.com », est signalée sans bloquer la vérification. Une adresse bien formée est envoyée à notre serveur, qui la vérifie auprès du serveur de messagerie — cela prend généralement quelques secondes, et jusqu'à une minute."
          },
          {
            "heading": "Comment lire le résultat",
            "body": "« Sûre » signifie que la boîte existe et accepte les messages. Les adresses invalides et désactivées provoqueront des rebonds, et il ne faut jamais écrire à un piège à spam. Un domaine catch-all accepte toutes les adresses : la boîte elle-même ne peut donc pas être confirmée ; les adresses génériques, jetables et les boîtes pleines sont risquées pour la prospection. « Inconnue » signifie que le serveur de messagerie n'a pas donné de réponse claire — réessayez plus tard. MapsGrab collecte les adresses e-mail sur le site officiel de chaque entreprise, et cet outil permet d'en contrôler une rapidement avant de prendre contact."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Cet outil vérifie-t-il si la boîte aux lettres existe vraiment ?",
              "answer": "Oui. Au-delà du format, il demande au serveur de messagerie du destinataire s'il accepte les messages pour cette adresse, sans envoyer d'e-mail. Quand le serveur ne donne pas de réponse claire — par exemple sur un domaine catch-all —, le résultat l'indique au lieu de deviner."
            },
            {
              "question": "Combien d'adresses puis-je vérifier ?",
              "answer": "Jusqu'à 5 par jour gratuitement, une adresse à la fois. Les adresses qui échouent à la vérification du format ne sont jamais envoyées et ne comptent donc pas dans la limite."
            },
            {
              "question": "Une adresse validée ici peut-elle quand même rebondir ?",
              "answer": "Oui. Une boîte peut être fermée ou se remplir après la vérification, et certains serveurs acceptent d'abord le message puis le renvoient plus tard. Un résultat « Sûre » signifie que l'adresse acceptait les messages au moment de la vérification — pas que quelqu'un les lit."
            },
            {
              "question": "Pourquoi « name@localhost » est-il refusé ?",
              "answer": "L'outil exige un domaine avec une extension publique (TLD), car une adresse sans extension ne peut pas recevoir de courrier depuis Internet. Ces adresses sont signalées dans votre navigateur et ne sont jamais envoyées pour vérification."
            },
            {
              "question": "Que devient l'adresse e-mail que je saisis ?",
              "answer": "Elle est envoyée à notre serveur, qui la fait vérifier par un prestataire de vérification d'e-mails auprès du serveur de messagerie du destinataire. Aucun e-mail n'est envoyé à cette adresse."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Collectez des e-mails qui valent ",
            "accent": "vérification",
            "tail": ""
          },
          "lead": "MapsGrab trouve les adresses e-mail et les profils sociaux derrière chaque entreprise extraite, directement à partir du site Web de chaque entreprise."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Convertir Lat Long en DMS — Degrés décimaux en degrés Minutes Secondes | MapsGrab",
          "description": "Convertissez instantanément la latitude et la longitude décimales au format degrés, minutes, secondes (DMS). Convertisseur de coordonnées gratuit basé sur un navigateur, rien de téléchargé."
        },
        "hero": {
          "title": {
            "lead": "Convertir Lat Long en ",
            "accent": "DMS",
            "tail": ""
          },
          "description": "Entrez la latitude et la longitude décimales et lisez les mêmes coordonnées en degrés, minutes, secondes — avec des lettres hémisphériques, prêtes à être copiées."
        },
        "form": {
          "latitudeLabel": "Latitude (décimale, -90 à 90)",
          "longitudeLabel": "Longitude (décimale, -180 à 180)",
          "placeholder": "37.774929",
          "submit": "Convertir en DMS",
          "errorLatitude": "La latitude doit être un nombre compris entre -90 et 90.",
          "errorLongitude": "La longitude doit être un nombre compris entre -180 et 180."
        },
        "result": {
          "dms": "Coordonnées en DMS"
        },
        "howTo": [
          {
            "heading": "Que sont les degrés décimaux et DMS ?",
            "body": "Les cartes et les feuilles de calcul stockent les coordonnées sous forme de degrés décimaux – un nombre signé par axe, comme 37.774929, -122.419416. L'arpentage, les cartes marines et de nombreux documents de propriété utilisent l'ancienne notation sexagésimale : degrés, minutes et secondes avec des lettres hémisphériques, comme 37° 46' 29.74\" N, 122° 25' 9.90\" W. Les deux décrivent le même point ; la forme DMS divise simplement la fraction en unités successivement plus petites, où une minute équivaut à 1/60 degré et une seconde à 1/60 minute."
          },
          {
            "heading": "Comment convertir",
            "body": "Collez la latitude et la longitude décimales et appuyez sur \"Convertir en DMS\". Les valeurs négatives correspondent aux hémisphères sud et ouest et sont signalées par S et W. Les secondes sont affichées avec deux décimales, soit environ un mètre de résolution au sol, plus précise que n'importe quelle capture GPS grand public. Copiez le résultat sur une seule ligne pour les documents ou sous forme de champs séparés pour les feuilles de calcul."
          },
          {
            "heading": "Pourquoi c'est important pour le travail des données cartographiques",
            "body": "Les allers-retours de coordonnées sont un point de friction quotidien lors du déplacement de données commerciales entre outils : Google Maps exporte des décimales, tandis que les flux de travail cadastraux et d'impression attendent DMS. MapsGrab maintient cette friction à faible échelle : chaque entreprise extraite porte déjà sa latitude et sa longitude lors de l'exportation, et les conversions de coordonnées par lots peuvent être exécutées hors ligne avec la même formule que celle utilisée par cette page."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Quelle est la précision du résultat DMS ?",
              "answer": "Les secondes sont affichées avec deux décimales. Une seconde de latitude équivaut à environ 30 mètres, donc deux décimales se résolvent à environ 30 centimètres – bien plus précis que les données GPS sous-jacentes. La précision est limitée par votre saisie, pas par la conversion."
            },
            {
              "question": "Que signifient ici N, S, E et W ?",
              "answer": "Ils remplacent le signe de la valeur décimale : les latitudes positives sont le nord (N) et les négatives sont le sud (S) ; les longitudes positives sont à l’est (E) et les négatives à l’ouest (W). L'outil sélectionne automatiquement les lettres du signe."
            },
            {
              "question": "Puis-je reconvertir DMS en décimal ici ?",
              "answer": "Oui, utilisez l'outil complémentaire \"Convertir DMS en DD\" sur ce site. La conversion dans les deux sens avec la même implémentation évite la dérive d'arrondi entre les différentes formules."
            },
            {
              "question": "Mes données de coordonnées sont-elles téléchargées ?",
              "answer": "Non. La conversion est purement arithmétique dans l'onglet de votre navigateur ; rien de ce que vous tapez ne quitte la page."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Coordonnées de chaque entreprise, déjà ",
            "accent": "extraites",
            "tail": ""
          },
          "lead": "MapsGrab écrit la latitude et la longitude dans chaque ligne exportée — pas de recherche manuelle de coordonnées pour votre prochain projet d'itinéraire ou de territoire."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Convertir DMS en DD — Degrés Minutes Secondes en Degrés décimaux | MapsGrab",
          "description": "Convertissez instantanément les coordonnées en degrés, minutes et secondes en degrés décimaux. Convertisseur gratuit de DMS en DD basé sur un navigateur, rien de téléchargé."
        },
        "hero": {
          "title": {
            "lead": "Convertir DMS en DD ",
            "accent": "(Lat, Long)",
            "tail": ""
          },
          "description": "Entrez les degrés, les minutes et les secondes pour les deux axes et obtenez des degrés décimaux propres - le format Google Maps, les feuilles de calcul et MapsGrab comprennent."
        },
        "form": {
          "latitudeHeading": "Latitude (N/S)",
          "longitudeHeading": "Longitude (E/O)",
          "degreesLabel": "Degrés",
          "minutesLabel": "Minutes d’arc",
          "secondsLabel": "Secondes d’arc",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Convertir en décimal",
          "errorValues": "Les degrés doivent être nuls ou un nombre entier positif, les minutes et les secondes doivent être comprises entre 0 et 60."
        },
        "result": {
          "dd": "Coordonnées en degrés décimaux"
        },
        "howTo": [
          {
            "heading": "Pourquoi reconvertir DMS en degrés décimaux ?",
            "body": "Les degrés-minutes-secondes sont une notation destinée aux humains, mais pratiquement tous les systèmes destinés aux machines nécessitent des degrés décimaux : recherche Google Maps, importations SIG, formules de distance dans une feuille de calcul et pipelines de géocodage. La conversion est une simple somme pondérée — degrés plus minutes divisés par 60 plus secondes divisées par 3600 — la lettre de l'hémisphère décidant du signe."
          },
          {
            "heading": "Comment convertir",
            "body": "Remplissez les degrés, les minutes et les secondes pour la latitude et la longitude et choisissez les lettres de l'hémisphère (N/S et E/W). Appuyez sur « Convertir en décimal » et l'outil génère les deux axes sous forme de nombres décimaux signés avec six décimales, ce qui correspond à environ 11 centimètres au sol - plus que suffisant pour toute utilisation dans un établissement professionnel. Collez le résultat directement dans Google Maps ou dans votre feuille de calcul."
          },
          {
            "heading": "Garder la cohérence des données de coordonnées",
            "body": "Les notations mixtes sont la raison habituelle pour laquelle les emplacements se retrouvent dans le mauvais océan après une importation. Décider une fois des degrés décimaux et convertir tout ce qui se trouve à la limite permet de maintenir les pipelines sains. MapsGrab exporte déjà les coordonnées en degrés décimaux, de sorte que les données collectées avec l'extension sont transférées dans les outils SIG et BI sans aucune étape de conversion."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "De combien de décimales ai-je besoin ?",
              "answer": "Six décimales donnent environ 11 centimètres – au-delà de la précision du GPS grand public. Cinq places (environ 1 mètre) suffisent pour les implantations commerciales ; moins de décimales brouillent intentionnellement le point."
            },
            {
              "question": "Quelles plages les champs doivent-ils satisfaire ?",
              "answer": "Les minutes et les secondes vont de 0 à moins de 60. Les degrés de latitude atteignent jusqu'à 90 et la longitude jusqu'à 180 ; le convertisseur le signale lorsqu'une valeur atterrirait en dehors du globe."
            },
            {
              "question": "Dois-je saisir des nombres négatifs lorsque je sélectionne S ou W ?",
              "answer": "Non, la lettre hémisphère code déjà le signe. Si vous saisissez simultanément une valeur signée et une lettre contradictoire, l'outil signale la contradiction au lieu de deviner."
            },
            {
              "question": "La conversion est-elle effectuée sur un serveur ?",
              "answer": "Non. La formule s'exécute dans votre navigateur ; rien de ce que vous tapez n’est transmis nulle part."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Ignorer le travail de coordonnées manuel ",
            "accent": "à l'échelle",
            "tail": ""
          },
          "lead": "MapsGrab exporte la latitude et la longitude décimales pour chaque entreprise collectée, à côté des colonnes adresse, téléphone et Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Générateur de mots-clés en masse — Combinaisons de mots-clés et d'emplacements | MapsGrab",
          "description": "Générez des combinaisons de mots clés et d'emplacements en masse pour les tâches de référencement local et de récupération de cartes. Collez deux listes, obtenez chaque combinaison, téléchargez-la sous CSV. Gratuit."
        },
        "hero": {
          "title": {
            "lead": "Mots-clés en masse ",
            "accent": "Générateur",
            "tail": ""
          },
          "description": "Collez vos mots-clés et vos emplacements, et obtenez chaque combinaison « mot-clé + emplacement » sous forme de liste prête à coller ou CSV — le moyen le plus rapide de lancer une campagne de recherche locale."
        },
        "form": {
          "keywordsLabel": "Mots-clés (un par ligne)",
          "keywordsPlaceholder": "agence de design\ncafé\nplombier",
          "locationsLabel": "Emplacements (un par ligne)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Ordre de combinaison",
          "keywordFirst": "mot-clé + emplacement (agence de design New York)",
          "locationFirst": "emplacement + mot-clé (New York agence de design)",
          "submit": "Générer des combinaisons",
          "resultCount": "{count} combinaisons générées.",
          "errorKeywords": "Ajoutez au moins un mot-clé.",
          "errorLocations": "Ajoutez au moins un emplacement."
        },
        "howTo": [
          {
            "heading": "À quoi sert la génération groupée de mots clés ?",
            "body": "Les campagnes de recherche locale reposent sur des combinaisons : le même service est répété dans chaque ville, district ou quartier que vous desservez. Dix mots-clés répartis sur dix sites correspondent à une centaine d'expressions de recherche : \"agence de design New York\", \"agence de design Chicago\", etc. Les écrire à la main est sujet aux erreurs ; les générer à partir de deux listes prend quelques secondes et garantit que rien n’est oublié."
          },
          {
            "heading": "Comment générer des combinaisons",
            "body": "Collez vos mots-clés dans la première case – un par ligne – et vos emplacements dans la seconde. Choisissez si le mot-clé ou la localisation vient en premier, puis appuyez sur « Générer ». Chaque mot-clé est associé à chaque emplacement, les lignes vides et les doublons sont supprimés, et la liste complète apparaît ci-dessous avec un décompte. Copiez-le directement dans les listes de mots clés Google Ads, les vérifications de tendances Google ou une file d'attente de tâches de extraction de cartes."
          },
          {
            "heading": "De la liste de mots clés aux données collectées",
            "body": "L'étape suivante classique consiste à exécuter chaque combinaison sous la forme d'une recherche Google Maps et à collecter les résultats. Cette boucle est exactement ce que MapsGrab automatise : l'extension accepte une liste de mots clés en tant que tâche par lots, parcourt les recherches une par une et exporte chaque entreprise qu'elle trouve - de sorte que les combinaisons que vous générez ici deviennent des lignes structurées sans copie manuelle."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Combien de combinaisons puis-je générer ?",
              "answer": "Autant que votre navigateur peut en contenir, l'outil multiplie les deux listes et les duplique localement. Dix mille combinaisons suffisent ; pour les très gros lots, le téléchargement CSV est plus pratique que la copie de la zone de texte."
            },
            {
              "question": "Les doublons sont-ils supprimés ?",
              "answer": "Oui. Les lignes en double dans chaque liste sont supprimées avant l'appariement, et la sortie contient chaque paire mot-clé-emplacement exactement une fois, dans l'ordre que vous avez choisi."
            },
            {
              "question": "Quelle commande dois-je utiliser ?",
              "answer": "Les deux sont de véritables comportements de recherche. \"Plumber Austin\" se lit comme la façon dont les gens tapent dans Maps ; « Plombier d'Austin » se lit comme une formulation SEO traditionnelle. La génération des deux commandes est un moyen courant de couvrir les variantes de recherche."
            },
            {
              "question": "Puis-je utiliser des quartiers de la ville ou des codes postaux comme emplacements ?",
              "answer": "Oui, tout ce qui a du sens en tant que suffixe de recherche Maps fonctionne : districts, codes postaux, zones métropolitaines ou paires complètes \"ville, état\". Une ligne par emplacement."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Transformez la liste de mots clés en ",
            "accent": "results",
            "tail": ""
          },
          "lead": "Les tâches par lots MapsGrab exécutent chaque mot-clé sous forme de recherche Maps et exportent les entreprises derrière elles — CSV ou JSON, avec des avis, des photos et un enrichissement des contacts."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Fusionner des fichiers CSV en ligne — Combinez plusieurs fichiers CSV gratuitement | MapsGrab",
          "description": "Fusionnez plusieurs fichiers CSV en ligne en un seul fichier. Les en-têtes de colonnes sont automatiquement alignés par union : gratuits, privés et entièrement basés sur un navigateur."
        },
        "hero": {
          "title": {
            "lead": "Fusionner CSV Fichiers ",
            "accent": "En ligne",
            "tail": ""
          },
          "description": "Téléchargez deux fichiers CSV ou plus et téléchargez un seul fichier fusionné. Les colonnes sont alignées par en-tête — les champs manquants restent vides. Les fichiers ne quittent jamais votre navigateur."
        },
        "form": {
          "filesLabel": "CSV fichiers",
          "filesHint": "Sélectionnez au moins deux fichiers .csv. Vérifiez chaque fichier avec les étiquettes traduites sur la ligne 2 pour ignorer cette ligne. Le CSV fusionné conserve une ligne d'en-tête de nom de champ. Les fichiers restent dans votre navigateur.",
          "translationRow": "Sauter la ligne 2 (étiquettes traduites) dans {name}",
          "submit": "Fusionner des fichiers",
          "errorNoFiles": "Sélectionnez au moins deux fichiers CSV à fusionner.",
          "errorEmptyFile": "L'un des fichiers est vide ou n'a pas de ligne d'en-tête : {name}",
          "fileSummary": "{name} — {rows} lignes de données",
          "resultSummary": "Fusion de {files} fichiers en {rows} lignes × {columns} colonnes.",
          "previewLabel": "Aperçu fusionné CSV"
        },
        "howTo": [
          {
            "heading": "À quoi sert la fusion ici ?",
            "body": "La fusion empile plusieurs exportations CSV dans une seule table : les colonnes sont alignées par nom d'en-tête dans tous les fichiers, et chaque ligne de données conserve ses valeurs sous l'en-tête correspondant. Les fichiers sont combinés de haut en bas dans l'ordre dans lequel vous les avez sélectionnés, de sorte que le résultat se lit comme un ensemble de données continu. Les colonnes qui n'existent que dans certains fichiers restent dans la sortie ; les lignes des fichiers sans eux obtiennent des cellules vides - une union de tous les en-têtes."
          },
          {
            "heading": "Comment fusionner des fichiers CSV",
            "body": "Sélectionnez au moins deux fichiers .csv, par exemple les exportations hebdomadaires d'un flux de travail de scraping de cartes. Appuyez sur « Fusionner les fichiers » et l'outil analyse chaque fichier de votre navigateur, indique le nombre de lignes de chacun et crée le tableau fusionné. Téléchargez-le sous la forme d'un seul CSV qui s'ouvre proprement dans Excel, Google Sheets ou dans toute importation de base de données."
          },
          {
            "heading": "Conçu pour la collecte de données multi-exécutions",
            "body": "Le cas d'utilisation typique est l'ajout d'exécutions : chaque session d'extraction MapsGrab exporte son propre CSV, et la fusion rassemble les sessions de la semaine dans un seul ensemble de données avant la déduplication et le nettoyage. L'analyseur gère les champs entre guillemets, les virgules intégrées et les nouvelles lignes à l'intérieur des cellules (RFC 4180), de sorte que les exportations avec des adresses multilignes ou des extraits de révision fusionnent correctement."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Questions fréquentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Que se passe-t-il lorsque les fichiers ont des colonnes différentes ?",
              "answer": "Le fichier fusionné contient l'union de tous les en-têtes dans l'ordre dans lequel ils apparaissent en premier. Les lignes des fichiers dépourvus de colonne obtiennent une cellule vide dans cette colonne. Rien n'est supprimé ou renommé."
            },
            {
              "question": "Mes fichiers sont-ils téléchargés sur un serveur ?",
              "answer": "Non. Les fichiers sont lus avec le FileReader API du navigateur et fusionnés en mémoire dans votre onglet. Rien n'est transmis, et fermer la page efface tout."
            },
            {
              "question": "La fusion supprime-t-elle les lignes en double ?",
              "answer": "Non : la fusion est une concaténation directe avec des colonnes alignées. La déduplication (par exemple par Place ID) est une étape de nettoyage distincte que vous exécutez sur le fichier fusionné."
            },
            {
              "question": "Quelle peut être la taille des fichiers ?",
              "answer": "La limite est la mémoire de l'onglet de votre navigateur, et non un nombre fixe. Pour les exportations de données d'entreprise classiques (de quelques milliers à quelques centaines de milliers de lignes), la fusion est instantanée. Pour les fichiers très volumineux, fusionnez par lots."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Une exportation par exécution — ou ",
            "accent": "un ensemble de données",
            "tail": ""
          },
          "lead": "MapsGrab exporte des CSV/JSON propres par session avec sélection de champ et déduplication Place ID, de sorte que les ensembles de données multi-exécutions commencent déjà presque par fusionner."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Entreprise",
  "about": {
    "navLabel": "À propos",
    "seoTitle": "À propos de MapsGrab | Produit et limites",
    "seoDescription": "MapsGrab est une boîte à outils de données cartographiques pour les données commerciales publiques : une extension de navigateur, un Cloud Extracteur en ligne, des serveurs API et MCP et des outils Web gratuits. Découvrez où se situe la limite des données.",
    "hero": {
      "eyebrow": "Environ MapsGrab",
      "title": {
        "lead": "Les données cartographiques, tout ",
        "accent": "simplement",
        "tail": ""
      },
      "intro": "MapsGrab crée des outils qui collectent des informations commerciales accessibles au public à partir de Google Maps et les transforment en données propres et structurées : une extension de navigateur pour Edge et Firefox, un extracteur en ligne basé sur le cloud, des serveurs API et MCP, ainsi que des outils Web gratuits, dont la plupart s'exécutent entièrement dans votre navigateur.",
      "contactLabel": "Contacter l'assistance",
      "extensionLabel": "Explorez l'extension",
      "stageLabel": "Accès anticipé",
      "updatedLabel": "Publié et révisé",
      "updatedAt": "Août 31, 2026",
      "chips": [
        {
          "label": "Collecte",
          "value": "Données publiques uniquement"
        },
        {
          "label": "Résultats des extensions",
          "value": "Dans votre navigateur"
        },
        {
          "label": "Exportations",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Faites glisser pour faire tourner"
    },
    "build": {
      "kicker": "Ce que nous construisons",
      "title": {
        "lead": "Une boîte à outils, ",
        "accent": "quatre",
        "tail": " façons de"
      },
      "lead": "Choisissez l'extension de navigateur, le Extracteur en ligne basé sur le cloud ou le API. L'extension fonctionne dans votre propre navigateur ; le Extracteur en ligne et le API partagent un moteur cloud, et le serveur MCP apporte ce API aux agents IA.",
      "hub": {
        "title": "MapsGrab boîte à outils de données",
        "detail": "Données professionnelles · avis · photos · email et enrichissement social"
      },
      "tags": {
        "extension": [
          "Extraction de la colonne 36",
          "Avis et photos",
          "Tâches par lots"
        ],
        "online": [
          "Mots-clés par lots",
          "Enrichissement des contacts",
          "Une colonne 37 CSV par tâche"
        ],
        "api": [
          "Données commerciales",
          "Avis",
          "Structuré JSON"
        ],
        "mcp": [
          "Trois outils",
          "Streamable HTTP",
          "Touche OAuth ou API"
        ]
      },
      "toolsLead": "Plus des outils Web gratuits.",
      "toolsText": "Les outils Web gratuits de ce site gèrent de petits travaux – placer des identifiants, vérifier les liens, coordonner les conversions, fusionner CSV – sans rien installer.",
      "toolsLabel": "Outils Web gratuits"
    },
    "principles": {
      "kicker": "Principes",
      "title": {
        "lead": "Où se trouve la ",
        "accent": "limite",
        "tail": ""
      },
      "lead": "MapsGrab est délibérément conservateur quant aux données. Ce sont les règles de produits auxquelles nous nous conformons.",
      "publicData": {
        "title": "Données publiques uniquement",
        "text": "Uniquement les informations commerciales accessibles au public – ce que tout visiteur de la page peut déjà voir.",
        "visibleTag": "Visible par tout visiteur",
        "privateTag": "Comptes privés"
      },
      "localFirst": {
        "title": "Le local d’abord",
        "text": "Avec l'extension et les outils Web gratuits, vos paramètres et résultats vivent dans votre navigateur, pas sur nos serveurs. Seule exception : le Vérificateur de courrier électronique envoie l'adresse saisie à notre serveur, où un service de vérification d'e-mails la contrôle sans envoyer d'e-mail. Le serveur Extracteur en ligne, le API et le MCP fonctionnent dans notre cloud, et les résultats du Extracteur en ligne sont enregistrés sur votre compte.",
        "storage": "stockage local",
        "rows": [
          "Paramètres",
          "Résultats",
          "Tâches par lots"
        ]
      },
      "backend": {
        "title": "Extension et outils gratuits : quatre tâches backend",
        "text": "Pour l'extension et les outils Web gratuits, notre backend gère exactement quatre choses : la configuration à distance, l'état du compte et des quotas, l'enrichissement facultatif par courrier électronique/social et les journaux d'utilisation minimaux. Seule exception : pour le Vérificateur de courrier électronique, notre backend transmet aussi l'adresse saisie à un service de vérification d'e-mails, qui la contrôle sans envoyer d'e-mail.",
        "chips": [
          "Configuration",
          "Quota",
          "Enrichissement",
          "Journaux d'utilisation"
        ]
      },
      "never": {
        "title": "Aucune publicité. Pas de trackers. Pas de vente de données.",
        "text": "Pas de publicité, pas de trackers tiers dans l'extension et pas de vente ou de location de données.",
        "chips": [
          "Annonces",
          "Trackers tiers",
          "Vendre des données"
        ]
      },
      "inWriting": {
        "kicker": "Par écrit",
        "title": "Politique de confidentialité et conditions",
        "text": "Chacune de ces règles est détaillée dans la politique de confidentialité et les conditions d'utilisation.",
        "link": "Lire la politique de confidentialité"
      }
    },
    "dataFlow": {
      "kicker": "Comment les données sont déplacées",
      "title": {
        "lead": "Ce qui reste avec vous et ce qui ",
        "accent": " nous parvient",
        "tail": ""
      },
      "lead": "L'extension fonctionne sur les données affichées publiquement et conserve les résultats dans votre navigateur. Pour l'extension et les outils Web gratuits, notre backend alimente uniquement la configuration, les quotas, l'enrichissement facultatif et les journaux d'utilisation minimale. Seule exception : le Vérificateur de courrier électronique envoie l'adresse saisie à notre serveur, où un service de vérification d'e-mails la contrôle sans envoyer d'e-mail. Le serveur Extracteur en ligne, le API et le MCP fonctionnent à la place dans notre cloud, et les résultats du Extracteur en ligne sont enregistrés sur votre compte.",
      "source": {
        "label": "Source",
        "title": "Google Maps pages que vous visitez",
        "text": "Données commerciales publiques : nom, adresse, téléphone, site Web, note, avis, photos."
      },
      "browser": {
        "label": "Votre navigateur · local d'abord",
        "storage": "stockage local · IndexedDB",
        "rows": [
          "Paramètres",
          "Résultats d'extraction",
          "État de la tâche par lots"
        ],
        "badge": "Stocké dans votre navigateur"
      },
      "backend": {
        "label": "MapsGrab backend · quatre objectifs",
        "lanes": [
          {
            "title": "Configuration à distance",
            "text": "Préréglages de structure de page qui permettent à l'extraction de fonctionner"
          },
          {
            "title": "Compte et quota",
            "text": "Connexion, statut du forfait, comptabilité d'utilisation mensuelle"
          },
          {
            "title": "E-mail et enrichissement social",
            "text": "Contacts répertoriés publiquement, lorsque la fonctionnalité est utilisée"
          },
          {
            "title": "Journalisation de l'utilisation",
            "text": "Enregistrements minimaux de l'utilisation des fonctionnalités et des erreurs"
          }
        ]
      },
      "never": {
        "label": "Jamais",
        "items": [
          "Aucune publicité",
          "Aucun tracker tiers dans l'extension",
          "Pas de vente ni de location de données personnelles",
          "Aucune collecte de votre historique de navigation au-delà des Google Maps pages que vous extrayez"
        ]
      },
      "note": "Ce site Web utilise Google Analytics 4 pour mesurer l'utilisation globale des pages — l'extension elle-même ne contient aucune analyse.",
      "noteLink": "Lire la politique de confidentialité"
    },
    "status": {
      "kicker": "Statut",
      "title": {
        "lead": "Accès anticipé, ",
        "accent": "gratuit",
        "tail": " pour commencer"
      },
      "access": {
        "title": "Accès anticipé",
        "text": "Le produit est en accès anticipé. Les listes de magasins pour les modules complémentaires Edge et les modules complémentaires Firefox sont en cours de finalisation.",
        "link": "Guide d'installation"
      },
      "quota": {
        "title": "Quota mensuel gratuit",
        "text": "L'extension fonctionne sans compte dans la limite d'un quota mensuel gratuit.",
        "link": "Ce qui est inclus"
      },
      "paid": {
        "title": "Forfaits payants pour une utilisation plus intensive",
        "text": "Les forfaits payants augmentent les limites pour une utilisation plus intensive. Consultez la page Tarifs pour connaître les niveaux actuels.",
        "link": "Voir les tarifs"
      }
    }
  },
  "contact": {
    "navLabel": "Contact",
    "seoTitle": "Contacter l'assistance MapsGrab",
    "seoDescription": "Contactez MapsGrab à propos des comptes, de l'extension du navigateur, de la facturation, des outils ou des demandes de confidentialité.",
    "eyebrow": "Contacter MapsGrab",
    "title": {
      "lead": "Parlez à un ",
      "accent": "humain",
      "tail": ""
    },
    "intro": "Écrivez-nous et une personne le lira. Le support est actuellement géré directement par l'équipe qui construit MapsGrab.",
    "emailCardLabel": "E-mail d'assistance",
    "copyEmail": "Copier {email}",
    "emailLabel": "Assistance par e-mail",
    "emailSubject": "MapsGrab demande d'assistance",
    "responseTimes": "Nous répondons aux e-mails d'assistance dans un délai d'un jour ouvrable, généralement plus rapidement. Les demandes de confidentialité peuvent prendre quelques jours lorsque nous devons d'abord vérifier la propriété du compte.",
    "include": {
      "title": "Que faut-il inclure",
      "text": "Un rapport précis nous aide à identifier le flux de travail concerné sans demander d'informations sensibles sur le compte.",
      "items": [
        "La page URL et l'action que vous avez tentée",
        "Nom et version de votre navigateur",
        "Le message d'erreur exact et une capture d'écran si utile",
        "Un numéro de commande pour les questions de facturation, sans les détails de la carte de paiement"
      ]
    },
    "topics": {
      "title": "Ce que nous pouvons faire",
      "items": [
        "Installation et configuration de l'extension de navigateur",
        "Problèmes d'accès au compte et de connexion",
        "Quotas, abonnements, renouvellements et questions de paiement",
        "Problèmes liés à l'outil Web et demandes de fonctionnalités",
        "Demandes de confidentialité et de données de compte"
      ]
    },
    "aboutLabel": "À propos",
    "privacyLabel": "politique de confidentialité",
    "termsLabel": "Conditions d'utilisation"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Maison",
    "crumbLegal": "Légal",
    "switchLabel": "Documents juridiques",
    "readTime": "{minutes} minute de lecture",
    "sectionCount": "{count} rubriques",
    "tocTitle": "Sur cette page",
    "tocLabel": "{title} rubriques",
    "glanceKicker": "En un coup d'œil",
    "glanceNote": "Un résumé du texte intégral ci-dessous.",
    "anchorLabel": "Copier le lien vers « {title} »",
    "copyEmail": "Copier {email}",
    "contactSupport": "Contacter l'assistance",
    "nextLabel": "Document suivant"
  },
  "terms": {
    "navLabel": "Termes",
    "seoTitle": "Conditions d'utilisation | MapsGrab",
    "seoDescription": "Les conditions d'utilisation MapsGrab : utilisation acceptable, responsabilité de l'utilisateur pour les données collectées, les achats, les clauses de non-responsabilité et comment nous contacter.",
    "title": "Conditions d'utilisation",
    "intro": "Ces conditions régissent votre utilisation de MapsGrab : l'extension de navigateur, ce site Web et les outils Web gratuits. Veuillez les lire avant d'utiliser le service.",
    "updatedLabel": "Dernière mise à jour",
    "updatedAt": "Août 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Utilisation acceptable, responsabilité de l'utilisateur pour les données collectées, les achats, les clauses de non-responsabilité et comment nous contacter.",
    "helpTitle": "Des questions sur ces Conditions ?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Données publiques uniquement",
        "text": "Le service fonctionne uniquement avec les informations affichées publiquement sur les pages que vous parcourez."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Votre utilisation, votre responsabilité",
        "text": "Vous décidez quoi collecter et comment l’utiliser – dans le cadre des lois qui s’appliquent à vous."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Aucun compte n'est nécessaire pour démarrer",
        "text": "L'extension fonctionne sans compte dans la limite d'un quota mensuel gratuit."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Annuler à tout moment",
        "text": "Les abonnements se renouvellent jusqu'à annulation ; l’annulation met fin aux futurs renouvellements."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Acceptation des conditions",
        "paragraphs": [
          "En accédant ou en utilisant MapsGrab, vous acceptez ces Conditions. Si vous n’êtes pas d’accord avec eux, n’installez pas l’extension et n’utilisez pas le site Web et les outils."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Ce que fait le service",
        "paragraphs": [
          "MapsGrab vous aide à collecter des informations affichées publiquement sur les pages Google Maps que vous visitez (détails commerciaux, avis, photos et informations de contact associées) et à les exporter. Le service consiste en une extension de navigateur pour Microsoft Edge et Firefox, ce site Web et des outils Web gratuits qui s'exécutent dans votre navigateur."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Données accessibles au public",
        "paragraphs": [
          "Le service est conçu pour fonctionner uniquement avec les informations affichées publiquement sur les pages que vous parcourez. Il n'accède pas aux comptes privés, au contenu sécurisé ou aux données nécessitant un accès spécial au-delà de ce que tout visiteur peut voir."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Votre responsabilité",
        "paragraphs": [
          "Vous décidez quoi collecter et comment l’utiliser, et vous êtes responsable de cette utilisation. Lorsque vous utilisez les informations collectées, respectez les lois qui s'appliquent à vous et à votre finalité.",
          "Vous vous engagez notamment à ne pas :"
        ],
        "items": [
          "Utiliser le service pour toute activité illégale ou en violation des droits de tiers.",
          "Ré-identifiez des individus ou créez des profils de personnes privées à partir des données commerciales collectées.",
          "Utilisez les coordonnées collectées pour le spam ou les messages massifs non sollicités.",
          "Revendre les données brutes collectées en tant que produit de données concurrent sans accord séparé avec nous.",
          "Interférer, surcharger ou tenter de perturber le service ou les plateformes avec lesquelles il fonctionne."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Comptes et quotas",
        "paragraphs": [
          "L'extension fonctionne sans compte dans la limite d'un quota mensuel gratuit. Certaines fonctionnalités (limites plus élevées, achats, intégrations cloud) nécessitent un compte. Vous êtes responsable de la sécurité des informations d’identification de votre compte et des activités qui se produisent sous votre compte."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Achats et abonnements",
        "paragraphs": [
          "Les forfaits payants sont décrits sur la page Tarifs. Les prix, les quotas et les périodes de facturation sont affichés avant votre achat, et les achats sont traités via les prestataires de paiement proposés à la caisse. Les plans d'abonnement se renouvellent automatiquement jusqu'à leur annulation, et vous pouvez annuler à tout moment ; l’annulation met fin aux futurs renouvellements."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "Le service est fourni tel quel",
        "paragraphs": [
          "Le service est fourni « tel quel » et « selon disponibilité ». Les plates-formes changent fréquemment et les fonctionnalités de collecte peuvent cesser de fonctionner partiellement ou entièrement à tout moment. MapsGrab ne donne aucune garantie, expresse ou implicite, quant à la disponibilité ininterrompue, à l'exhaustivité des données collectées ou à l'adéquation à un usage particulier.",
          "Nous pouvons modifier, suspendre ou interrompre n'importe quelle partie du service, et nous pouvons mettre à jour ces conditions. Lorsque les changements seront importants, nous les annoncerons sur ce site Web. L'utilisation continue après l'entrée en vigueur des modifications signifie que vous acceptez les conditions mises à jour."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitation de responsabilité",
        "paragraphs": [
          "Dans toute la mesure permise par la loi, MapsGrab et ses opérateurs ne sont pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs — y compris la perte de profits ou de données — découlant de votre utilisation ou de votre incapacité à utiliser le service."
        ]
      },
      {
        "id": "contact",
        "title": "Contact",
        "paragraphs": [
          "Les questions concernant ces Conditions peuvent être envoyées à support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Note de couverture",
      "badge": "À déterminer",
      "lead": "Pas encore couvert :",
      "text": "le Extracteur en ligne (cloud run), le Scraper / Reviews / API de photos et le serveur MCP. Le texte ci-dessus décrit l'extension, ce site Web et les outils Web gratuits."
    }
  },
  "privacy": {
    "navLabel": "Confidentialité",
    "seoTitle": "Politique de confidentialité | MapsGrab",
    "seoDescription": "La politique de confidentialité MapsGrab : quelles données l'extension et le site Web traitent, où elles sont stockées, à quoi sert notre backend et les limites que nous suivons.",
    "title": "politique de confidentialité",
    "intro": "Cette politique explique quelles données MapsGrab traitent, où elles sont stockées et ce qui atteint nos serveurs. La version courte : l'extension fonctionne sur les données affichées publiquement et conserve les résultats dans votre navigateur ; Outre nos services cloud, notre backend alimente uniquement la configuration, les quotas, l'enrichissement facultatif et les journaux d'utilisation minimale ; et nous ne diffusons aucune publicité ni aucun tracker tiers dans l'extension. Les demandes adressées à nos services cloud — le serveur Extracteur en ligne, le serveur API et MCP — sont traitées sur nos serveurs et les résultats de Extracteur en ligne sont liés à votre compte afin que vous puissiez les télécharger.",
    "updatedLabel": "Dernière mise à jour",
    "updatedAt": "Octobre 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Quelles données l'extension et le site Web traitent, où elles sont stockées, à quoi sert notre backend et les limites que nous suivons.",
    "helpTitle": "Des questions sur cette politique ?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Où les résultats sont stockés",
        "text": "L'extension et les outils Web gratuits conservent vos données dans votre navigateur ; Les résultats du Scraper en ligne sont liés à votre compte."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Ce qui atteint nos serveurs",
        "text": "Requêtes au serveur Extracteur en ligne, API et MCP, ainsi que configuration, compte et quotas, enrichissement facultatif et journaux d'utilisation minimaux."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Pas de publicité, pas de trackers",
        "text": "Pas de trackers tiers dans l'extension, et pas de vente ou de location de données personnelles."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Suppression des données",
        "text": "La suppression de l'extension supprime les données locales ; envoyez-nous un e-mail pour supprimer les données du compte backend."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Données sur les processus d'extension",
        "paragraphs": [
          "L'extension gère les catégories de données suivantes :"
        ],
        "items": [
          "Données commerciales publiques — informations affichées sur les Google Maps pages que vous visitez (nom, adresse, téléphone, site Web, note, avis, photos, etc.) pendant que vous utilisez les fonctionnalités d'extraction.",
          "Vos paramètres — préférences que vous configurez (format d'exportation, sélection des champs, automatismes, langue de l'interface).",
          "Données techniques et d'interaction - événements d'utilisation minimaux (compteurs d'utilisation des fonctionnalités, messages d'erreur) utilisés pour que l'extension continue de fonctionner contre Google modifications de page.",
          "Identifiants de compte que nous émettons : un identifiant d'appareil anonyme et, si vous vous connectez, l'adresse e-mail de votre compte et le statut de votre forfait ou de votre quota."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Où les données sont stockées",
        "paragraphs": [
          "Avec l'extension, les paramètres, les résultats de l'extraction et l'état des tâches par lots sont stockés localement dans votre navigateur (extension stockage local et IndexedDB). Ils ne quittent jamais votre appareil sauf si vous déclenchez une exportation ou l'une des intégrations facultatives décrites ci-dessous. Les outils Web gratuits traitent également ce que vous saisissez dans votre navigateur.",
          "Les jetons Google Drive et HubSpot OAuth, si vous les connectez, sont également stockés uniquement dans votre navigateur.",
          "Les tâches Scraper en ligne s'exécutent sur nos serveurs. Leurs résultats sont stockés avec votre compte afin que vous puissiez les télécharger depuis votre tableau de bord."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Ce que nos processus backend",
        "paragraphs": [
          "Les demandes que vous adressez à nos services cloud — le Extracteur en ligne, le serveur API et le MCP — sont traitées sur nos serveurs. Nos serveurs gèrent également l'accès à ces services, y compris votre clé API et les autorisations client MCP que vous approuvez, et conservent des enregistrements de votre utilisation.",
          "Un client MCP que vous autorisez reçoit les résultats des requêtes qu'il effectue. Vous pouvez révoquer une autorisation depuis votre tableau de bord.",
          "Outre ces services cloud, l'extension et ce site Web contactent nos propres serveurs à quatre fins :"
        ],
        "items": [
          "Configuration à distance : préréglages de structure de page qui maintiennent l'extraction lorsque Google modifie ses pages.",
          "Services de compte et de quotas : connexion, statut du forfait et comptabilité d'utilisation mensuelle.",
          "Enrichissement des e-mails et des réseaux sociaux : recherche des coordonnées répertoriées publiquement sur les sites Web d'entreprises collectés lorsque la fonctionnalité est utilisée.",
          "Journalisation de l'utilisation : enregistrements minimaux de l'utilisation des fonctionnalités et des erreurs utilisés pour maintenir et améliorer le service."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Intégrations facultatives Google Drive et HubSpot",
        "paragraphs": [
          "Ce n'est que si vous les connectez explicitement dans les paramètres que les données exportées sont téléchargées sur votre propre compte Google Drive ou synchronisées avec votre propre compte HubSpot. Ces intégrations utilisent votre autorisation, agissent en votre nom et peuvent être révoquées à tout moment depuis les paramètres de l'extension ou depuis votre compte Google / HubSpot."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Analyse de site Web",
        "paragraphs": [
          "Ce site Web utilise Google Analytics 4 (GA4) pour mesurer l'utilisation globale des pages. GA4 est la seule analyse tierce que nous utilisons, et elle fonctionne uniquement sur ce site Web — l'extension elle-même ne contient aucune analyse."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "Ce que nous ne faisons jamais",
        "paragraphs": [
          "Ces limites s'appliquent à l'extension et au site Web :"
        ],
        "items": [
          "Aucune publicité.",
          "Aucun tracker tiers dans l'extension.",
          "Pas de vente ni de location de données personnelles.",
          "Aucune collecte de votre historique de navigation au-delà des Google Maps pages que vous extrayez."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Suppression des données",
        "paragraphs": [
          "La suppression de l'extension supprime toutes les données stockées localement. Si vous souhaitez supprimer les données de votre compte backend, contactez-nous au support@mapsgrab.com et nous les supprimerons."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Modifications de cette politique",
        "paragraphs": [
          "Nous mettons à jour cette politique lorsque le service change. La date ci-dessus reflète la dernière révision et les modifications importantes seront annoncées sur ce site Web."
        ]
      },
      {
        "id": "contact",
        "title": "Contact",
        "paragraphs": [
          "Les questions ou demandes concernant la confidentialité peuvent être envoyées au support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Autoriser une application IA | MapsGrab",
  "title": "Connectez une application IA à votre compte",
  "intro": "Une application demande à accéder à votre compte MapsGrab. Autorisez-le uniquement si vous avez démarré cette connexion vous-même.",
  "loading": "Chargement de la demande de connexion...",
  "hostLabel": "Adresse de l'application",
  "selfDeclared": "Nom que l'application se donne : {name}",
  "loopbackTitle": "Application locale",
  "loopbackText": "Cette application fonctionne sur un ordinateur, son adresse ne peut donc pas indiquer qui l'a créée. Autorisez-le uniquement si vous venez de démarrer cette connexion à partir d'une application en laquelle vous avez confiance.",
  "loopbackHost": "Cet ordinateur",
  "accountLabel": "Connecté en tant que",
  "switchAccount": "Changer de compte",
  "permissionsTitle": "Si vous l'autorisez, cette application peut",
  "permissions": [
    "Recherchez des entreprises et lisez leurs avis et photos publiques sur Google Maps.",
    "Utilisez l'allocation de demande mensuelle de votre forfait API."
  ],
  "revokeNote": "Vous pouvez le déconnecter à tout moment sous Applications connectées dans la gestion API.",
  "approve": "Permettre",
  "deny": "Refuser et revenir à {host}",
  "denyLoopback": "Refuser et revenir à l'application",
  "redirecting": "Retour à l'application...",
  "invalidTitle": "Cette demande de connexion n'est pas valide ou a expiré",
  "invalidText": "Revenez à votre application AI et recommencez à vous connecter.",
  "errorTitle": "Cette demande de connexion ne peut pas être complétée",
  "errorReasons": {
    "rate_limited": "Trop de tentatives de connexion provenaient de votre réseau. Attendez quelques minutes avant de réessayer.",
    "invalid_client": "L'application n'est pas enregistrée ou son enregistrement est incomplet.",
    "invalid_redirect_uri": "L'adresse de retour envoyée par l'application ne correspond pas à celle enregistrée.",
    "unsupported_response_type": "L'application a demandé un type d'autorisation qui n'est pas pris en charge.",
    "invalid_pkce": "L'application n'a pas envoyé le contrôle de sécurité requis (PKCE avec S256).",
    "invalid_resource": "L'application n'a pas demandé l'accès au serveur MapsGrab MCP, ou a demandé un autre serveur.",
    "server_error": "MapsGrab n'a pas pu enregistrer cette demande pour le moment. Veuillez réessayer sous peu."
  },
  "errorHint": "Relancez la connexion depuis votre application AI. Si le problème persiste, contactez le développeur de l'application.",
  "signInTitle": "Connectez-vous pour continuer",
  "signInText": "Connectez-vous au compte MapsGrab auquel vous souhaitez vous connecter. Cette demande vous attendra.",
  "signIn": "Se connecter",
  "loadFailed": "Impossible de charger la demande de connexion. Vérifiez votre réseau et réessayez.",
  "decideFailed": "Impossible de terminer cette action. Vérifiez votre réseau et réessayez.",
  "retry": "Essayer à nouveau"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Paiement soumis",
      "description": "Nous confirmons votre paiement. L'onglet d'origine sera mis à jour automatiquement."
    },
    "confirmedCredits": {
      "title": "Crédits ajoutés",
      "description": "Votre paiement ClinkBill est confirmé et les crédits ont été ajoutés. Vous pouvez revenir à l'onglet d'origine."
    },
    "confirmedSubscription": {
      "title": "Forfait activé",
      "description": "Votre paiement ClinkBill est confirmé et votre forfait MapsGrab est actif. Vous pouvez revenir à l'onglet d'origine."
    },
    "failed": {
      "title": "Le paiement nécessite une attention particulière",
      "description": "Nous n'avons pas pu confirmer cette commande. Revenez à l'onglet d'origine et réessayez."
    }
  },
  "cancel": {
    "title": "Paiement annulé",
    "description": "Aucun paiement n'a été effectué. Vous pouvez revenir et choisir un autre mode de paiement."
  }
}
