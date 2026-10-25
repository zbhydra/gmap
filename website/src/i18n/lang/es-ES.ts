import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab es un conjunto de herramientas de datos de mapas: obtenga información comercial disponible públicamente de mapas, revise enlaces, identificaciones de lugares y más con una extensión de navegador y herramientas web.",
    "keywords": "datos de mapas, extractor de mapas de Google, buscador de identificación de lugar, generador de enlaces de reseñas, herramientas de mapas"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Navegación primaria",
      "mobileLabel": "Navegación móvil",
      "extension": "Extensión",
      "online": "Online",
      "api": "API",
      "apiScraper": "API de extracción",
      "apiReviews": "API de reseñas",
      "apiPhotos": "API de fotos",
      "apiMcp": "MCP de extracción",
      "apiScraperDesc": "Datos comerciales para cualquier palabra clave y ubicación, como JSON.",
      "apiReviewsDesc": "Hilos de revisión completos con calificaciones y respuestas de los propietarios.",
      "apiPhotosDesc": "Galerías de fotos públicas como listas URL listas para usar.",
      "apiMcpDesc": "Datos de Live Maps para Claude Code, Cursor y VS Code.",
      "apiFootNote": "API y MCP comparten una cuota de solicitud mensual.",
      "apiPricing": "API precios",
      "pricing": "Precios",
      "freeTools": "Herramientas gratuitas",
      "signIn": "Iniciar sesión",
      "dashboard": "Panel"
    },
    "footer": {
      "legalLabel": "Legal",
      "resources": "Herramientas gratuitas",
      "product": "Producto",
      "rights": "© 2026 MapsGrab. Reservados todos los derechos.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Buscador",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Revisar el generador de enlaces",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Comprobador de correo electrónico",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Convertidor de Lat Long a DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS a Convertidor Decimal",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Generador de palabras clave masivas",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Fusionar CSV archivos en línea",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Instalar ahora",
    "comingSoon": "Muy pronto",
    "themeLabel": "Tema de color",
    "themeLight": "Luz",
    "themeDark": "Oscuro",
    "themeSystem": "Sistema",
    "faqLabel": "Preguntas frecuentes",
    "breadcrumbLabel": "Migaja de pan",
    "languageSwitcherLabel": "Cambiador de idiomas",
    "mobileMenuLabel": "Alternar menú",
    "copied": "Copiado al portapapeles",
    "cancel": "Cancelar",
    "continue": "Continuar"
  },
  "dashboard": {
    "create": {
      "title": "Extractor online",
      "newTask": "Nueva tarea",
      "modeLabel": "Modo de búsqueda",
      "modes": {
        "keywords": "Palabras clave",
        "map": "Mapa",
        "regions": "Regiones"
      },
      "keywords": "Palabras clave",
      "placeholder": "cafetería en portland\nrestaurante en austin",
      "count": "{count} / {limit} palabras clave",
      "duplicates": "Líneas duplicadas ignoradas: {count}",
      "contacts": "Encuentra correos electrónicos y perfiles sociales.",
      "contactsPaid": "Disponible con un plan en línea pago.",
      "usage": "{used} / {total} registros este mes",
      "reset": "La cuota mensual se renueva el día 1 (hora de Nueva York).",
      "loading": "Cargando tus límites...",
      "optionsFailed": "No se pudieron cargar los límites de tus tareas. Vuelva a intentarlo.",
      "submit": "Iniciar extracción",
      "submitting": "Sumisión...",
      "submitted": "Tarea enviada",
      "failed": "Error al enviar la tarea. Actualiza el historial antes de volver a intentarlo.",
      "exhausted": "Tu cuota mensual está agotada.",
      "invalid": "Ingrese hasta {limit} palabras clave, cada una de no más de 500 caracteres.",
      "map": {
        "invalidKeyword": "Introduce una palabra clave de hasta 500 caracteres.",
        "keyword": "Palabra clave",
        "keywordPlaceholder": "p. ej., cafetería",
        "locationSearch": "Buscar ubicaciones",
        "locate": "Ubicar por región",
        "locationPlaceholder": "Seleccionar país / estado / ciudad",
        "coordinates": "Introducir coordenadas",
        "latitude": "Latitud",
        "longitude": "Longitud",
        "radius": "Radio (km)",
        "spacing": "Espaciado de cuadrícula (km)",
        "sampleCount": "{count} / {limit} buscar ubicaciones",
        "points": "Puntos de la cuadrícula: {points}",
        "overLimit": "Reduzca el radio o aumente el espacio de la cuadrícula para permanecer dentro de {limit} ubicaciones de búsqueda.",
        "chooseCenter": "Selecciona una región o haz clic en el mapa para fijar el centro.",
        "mapLabel": "Elija un centro de búsqueda en el mapa",
        "tilesUnavailable": "No se pudieron cargar los mosaicos del mapa. Aún puedes ingresar coordenadas.",
        "attribution": "colaboradores de OpenStreetMap"
      },
      "region": {
        "baseKeywords": "Palabras clave base",
        "basePlaceholder": "cafeteria\nrestaurante",
        "country": "País",
        "state": "Estado o región",
        "citySearch": "encontrar una ciudad",
        "cityPlaceholder": "Escribe al menos dos letras",
        "city": "Ciudad",
        "selectCountry": "Seleccione un país",
        "allStates": "Todos los estados o regiones",
        "loading": "Cargando ubicaciones...",
        "loadFailed": "No se pudieron cargar las ubicaciones. Vuelva a intentarlo.",
        "retry": "Rever",
        "addCountry": "Agregar país",
        "addState": "Agregar estado",
        "selectedRegions": "Ubicaciones seleccionadas",
        "remove": "Eliminar {name}",
        "noMatch": "Sin coincidencias",
        "matchMode": "Frase de búsqueda",
        "inMode": "En",
        "nearMode": "Cerca",
        "generate": "Generar consultas",
        "finalQueries": "Consultas finales",
        "finalPlaceholder": "Las consultas generadas aparecen aquí. Puedes editarlos.",
        "attribution": "Datos de ubicación: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Panel de control | MapsGrab",
      "description": "Administre sus MapsGrab exportaciones, API acceso y suscripciones en un solo espacio de trabajo."
    },
    "shell": {
      "skipToContent": "Saltar al contenido",
      "sideLabel": "Espacio de trabajo",
      "homeLabel": "Inicio de MapsGrab",
      "navLabel": "Menú del espacio de trabajo",
      "loading": "Cargando tu espacio de trabajo...",
      "retry": "Rever",
      "navOnline": "Extractor online",
      "navJobHistory": "Historial",
      "navApi": "API gestión",
      "navSubscriptions": "Suscripciones",
      "openMenu": "Abrir menú del espacio de trabajo",
      "closeMenu": "Cerrar el menú del espacio de trabajo",
      "collapseSidebar": "Contraer barra lateral",
      "expandSidebar": "Expandir barra lateral",
      "back": "Volver"
    },
    "account": {
      "menuButtonLabel": "Abrir menú de cuenta",
      "menuLabel": "Menú de cuenta",
      "logout": "Finalizar la sesión",
      "upgrade": "Mejorar plan",
      "usageShort": "{used} / {total} registros",
      "planUnavailable": "No disponible",
      "theme": "Tema",
      "themeLight": "Claro",
      "themeDark": "Oscuro",
      "themeSystem": "Sistema",
      "language": "Idioma"
    },
    "history": {
      "title": "Historial de exportaciones en línea",
      "description": "Tareas que ejecutó en Extractor online, las más nuevas primero. Los horarios se muestran en hora del este (New York).",
      "refresh": "Refrescar",
      "autoRefresh": "Actualización automática activada",
      "loading": "Cargando tus exportaciones...",
      "loadFailed": "No se pudo cargar su historial de exportación.",
      "refreshFailed": "No se pudo actualizar. Se muestran los últimos resultados cargados.",
      "retry": "Rever",
      "emptyTitle": "Aún no hay exportaciones",
      "emptyHint": "Ejecute una tarea en Extractor online y aparecerá aquí.",
      "emptyCta": "Ir a Extractor online",
      "recentTitle": "Tareas recientes",
      "viewAll": "Ver todas",
      "recentEmptyHint": "Las tareas que inicies arriba aparecerán aquí.",
      "noMatchTitle": "No hay tareas que coincidan",
      "noMatchHint": "Prueba con otro número de tarea o palabra clave, o borra los filtros.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "y {count} más",
      "columns": {
        "taskNo": "Tarea",
        "createdAt": "Creado (ET)",
        "samples": "Búsquedas",
        "records": "Registros",
        "status": "Estado"
      },
      "status": {
        "queued": "En cola",
        "collecting": "Coleccionando",
        "publishing": "Preparando CSV",
        "completed": "Terminado",
        "partial": "Éxito parcial",
        "failed": "Fallido"
      },
      "timezone": "ET",
      "search": {
        "label": "Buscar tareas",
        "placeholder": "Buscar por número de tarea o palabra clave",
        "clear": "Borrar búsqueda"
      },
      "filters": {
        "label": "Filtrar tareas",
        "button": "Filtros",
        "status": "Estado",
        "all": "Todas",
        "running": "En curso",
        "clear": "Borrar filtros"
      },
      "range": {
        "label": "Periodo",
        "last7": "Últimos 7 días",
        "last30": "Últimos 30 días",
        "all": "Todo el tiempo",
        "custom": "Periodo personalizado",
        "from": "Desde",
        "to": "Hasta",
        "apply": "Aplicar",
        "invalid": "Elige una fecha de inicio igual o anterior a la fecha de fin.",
        "hint": "Las fechas usan la hora del Este (Nueva York)."
      },
      "pagination": {
        "label": "Paginación",
        "previous": "Anterior",
        "next": "Próximo",
        "page": "Página {page}",
        "pageSize": "Filas por página",
        "summary": "{from}–{to} de {total}"
      },
      "detail": {
        "show": "Detalles",
        "loading": "Cargando búsquedas...",
        "loadFailed": "No se pudieron cargar las búsquedas para esta tarea.",
        "keyword": "Palabra clave",
        "records": "Archivos",
        "runNo": "Correr",
        "startedAt": "Iniciado (ET)",
        "finishedAt": "Terminado (ET)",
        "contacts": "Correos electrónicos y perfiles sociales",
        "contactsEnabled": "Habilitado para esta tarea",
        "contactsDisabled": "Fuera de esta tarea",
        "completed": "Terminado",
        "pending": "Pendiente",
        "viewport": "{lat}, {lng} · zoom {zoom}"
      },
      "copyJob": "Copiar número de tarea",
      "dedupeHint": "Los registros se cuentan después de eliminar los duplicados de toda la tarea.",
      "finished": "Tarea {job}: {status}",
      "finishedRecords": "{count} registros",
      "downloadCsv": "Descargar CSV",
      "noFile": "NoCSV",
      "errors": {
        "31301": "No se pudo recopilar esta búsqueda.",
        "31302": "Algunos resultados no están disponibles. Se conservan las filas entregadas.",
        "31303": "El coleccionista está ocupado. Intentar otra vez.",
        "31304": "No se pudo publicar esta exportación."
      },
      "errorFailed": "No se pudo completar esta búsqueda.",
      "downloading": "Preparante...",
      "downloadUnavailable": "No descargable CSV. Es posible que el archivo haya caducado.",
      "downloadFailed": "No se pudo iniciar la descarga. Por favor inténtalo de nuevo.",
      "signInPrompt": "Inicie sesión para ver su historial de exportaciones en línea.",
      "signInCta": "Iniciar sesión",
      "unreachable": "No se pudo llegar a MapsGrab en este momento."
    },
    "api": {
      "description": "Administre su clave API, asignación de solicitudes mensuales y aplicaciones de IA conectadas.",
      "docsLink": "Ver API productos",
      "signInPrompt": "Inicia sesión para administrar tu acceso API.",
      "loading": "Cargando tu acceso API...",
      "loadFailed": "No se pudo cargar tu acceso API. Por favor inténtalo de nuevo.",
      "retry": "Rever",
      "refresh": "Refrescar",
      "keyTitle": "Clave de API",
      "keyEmpty": "Aún no has generado una clave API.",
      "generateKey": "Generar clave API",
      "rotateKey": "Reemplazar la clave API",
      "generatingKey": "Generando...",
      "keyOnce": "Copie esta clave ahora. No podrá volver a verlo después de salir o actualizar esta página.",
      "keyCreated": "Creado",
      "rotateTitle": "¿Reemplazar tu clave API?",
      "rotateMessage": "Su clave actual dejará de funcionar inmediatamente. Actualice cualquier aplicación que la use con la nueva clave.",
      "cancel": "Cancelar",
      "copyKey": "Copiar clave API",
      "copied": "Copiado",
      "copyFailed": "No se pudo copiar. Seleccione el texto y cópielo manualmente.",
      "keyFailed": "No se pudo generar una clave API. Por favor inténtalo de nuevo.",
      "usageTitle": "Uso mensual API",
      "usageFailed": "No se pudo cargar tu uso de la API. Inténtalo de nuevo.",
      "usageValue": "{used} / {total} solicitudes",
      "usagePeriod": "Periodo: {period}",
      "quotaExhausted": "Su asignación mensual de solicitud está agotada.",
      "quotaReset": "Se renueva el día 1 (ET) · común a API y MCP",
      "planTitle": "API plan",
      "managePlan": "Administrar suscripciones",
      "connectionsTitle": "Direcciones de conexión",
      "apiUrl": "API base URL",
      "mcpUrl": "MCP servidor URL",
      "mcpHint": "Agregue este URL en su cliente MCP. Inicia sesión y aprueba la conexión cuando abra este sitio web.",
      "mcpUnavailable": "La dirección de conexión MCP aún no está disponible.",
      "copyUrl": "Copiar URL",
      "curlTitle": "Inicio rápido",
      "curlHint": "Sustituya el marcador de posición por su clave de API completa.",
      "grants": {
        "title": "Aplicaciones conectadas",
        "description": "Aplicaciones a las que ha permitido buscar empresas y leer reseñas y fotografías públicas utilizando su asignación API.",
        "loading": "Cargando aplicaciones conectadas...",
        "empty": "No hay aplicaciones conectadas.",
        "loadFailed": "No se pudieron cargar las aplicaciones conectadas. Por favor inténtalo de nuevo.",
        "selfDeclared": "Nombre que la aplicación se da a sí misma: {name}",
        "createdLabel": "Conectado (ET)",
        "refreshedLabel": "Última actualización (ET)",
        "notRefreshed": "Aún no",
        "revoke": "Desconectar",
        "revokeTitle": "¿Desconectar esta aplicación?",
        "revokeMessage": "{host} perderá el acceso inmediatamente y necesitará su aprobación para conectarse nuevamente.",
        "revokeFailed": "No se pudo desconectar esta aplicación. Por favor inténtalo de nuevo.",
        "paginationLabel": "Páginas de aplicaciones conectadas",
        "pageOf": "Página {page} de {pages}"
      }
    },
    "subscriptions": {
      "title": "Suscripciones",
      "description": "Planes y estado de renovación de Extractor online, la extensión del navegador y el API. Compre o actualice en la página de precios.",
      "lines": {
        "online": "Extractor online",
        "extension": "Extensión del navegador",
        "api": "API"
      },
      "planLabel": "Plan",
      "expiresLabel": "Se renueva/caduca",
      "free": "Gratis",
      "unavailable": "No disponible temporalmente",
      "autoRenewOn": "Renovación automática activada",
      "autoRenewOff": "Renovación automática desactivada",
      "paidVia": "Pagado con {method}",
      "subscribeCta": "Elige un plan",
      "pricingLink": "Ver precios",
      "manageSubscription": "Administrar suscripción",
      "managingSubscription": "Apertura...",
      "manageFailed": "No se pudo abrir la gestión de la suscripción. Inténtalo de nuevo.",
      "signInPrompt": "Inicia sesión para ver tus suscripciones."
    },
    "cancelGuide": {
      "title": "Gestiona tu suscripción en el proveedor de pagos",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Inicie sesión en PayPal y abra Configuración.",
            "Vaya a Pagos y luego a Pagos automáticos.",
            "Seleccione MapsGrab y elija Cancelar."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Abra el enlace del Portal del cliente desde su correo electrónico de compra.",
            "Inicia sesión y selecciona tu suscripción MapsGrab.",
            "Elija Cancelar."
          ]
        }
      ],
      "closeLabel": "Cerca"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab: tome Google Maps datos comerciales en CSV y JSON",
        "description": "MapsGrab es una extensión de navegador y un conjunto de herramientas web que recopila información comercial disponible públicamente de Google Maps (nombres, teléfonos, reseñas, fotos, correos electrónicos) y la exporta a CSV o JSON."
      },
      "hero": {
        "announce": {
          "badge": "Nuevo",
          "text": "MCP servidor para agentes de IA"
        },
        "title": {
          "firstLine": "Obtén datos de Google Maps",
          "secondLine": "con",
          "accent": "un clic",
          "end": "."
        },
        "lead": "Recopile datos comerciales públicos de Google Maps (nombres, teléfonos, sitios web, reseñas, fotos y correos electrónicos) y expórtelos limpios CSV o JSON en segundos.",
        "search": {
          "label": "Buscar palabra clave",
          "typing": [
            "cafetería en portland",
            "dentista en Austin, TX",
            "fontanero cerca de Chicago",
            "estudio de yoga en brooklyn",
            "hoteles en Miami Beach"
          ],
          "submit": "Vista previa de resultados",
          "loading": "Búsqueda…",
          "suggestLabel": "Intentar",
          "suggestions": [
            "cafetería en portland",
            "dentista en Austin, TX",
            "fontanero cerca de Chicago"
          ]
        },
        "trust": [
          "No se requiere tarjeta de crédito",
          "{records} registros gratis/mes",
          "CSV y JSON exportar"
        ],
        "dashboard": "Abrir extractor en línea",
        "theater": {
          "panelLabel": "MapsGrab vista previa del panel",
          "extensionActive": "MapsGrab extensión activa",
          "mapFilters": [
            "Abierto ahora",
            "Mejor valorados",
            "Precio"
          ],
          "live": "Vivir",
          "done": "Hecho",
          "start": "Iniciar extracción",
          "pause": "Pausa",
          "extracting": "Extrayendo {count}…",
          "finished": "Listo · {count} lugares",
          "kpis": {
            "phones": "telefonos",
            "emails": "correos electrónicos",
            "websites": "sitios web"
          },
          "export": "Exportar lista detallada - {count} (.CSV)",
          "exportSaved": "Exportación guardada",
          "emailFound": "Correo electrónico encontrado",
          "averageRating": "Calificación promedio",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} reseñas"
        },
        "preview": {
          "title": "Resultados",
          "count": "{count} empresas en la primera página de resultados",
          "columns": {
            "name": "Nombre",
            "address": "DIRECCIÓN",
            "category": "Categoría",
            "rating": "Clasificación",
            "reviews": "Reseñas",
            "phone": "Teléfono"
          },
          "locked": "Inicie sesión y envíe sus palabras clave en Extractor online para recopilar y exportar resultados.",
          "signIn": "Inicia sesión para iniciar una tarea completa",
          "failed": "No se pudo cargar la vista previa. Por favor inténtalo de nuevo.",
          "empty": "No se encontraron empresas en la primera página de resultados."
        }
      },
      "facts": {
        "caption": "MapsGrab en números",
        "items": [
          {
            "value": 36,
            "label": "columnas de datos por negocio"
          },
          {
            "value": 11,
            "label": "campos de revisión, respuestas del propietario incluidas"
          },
          {
            "value": 6,
            "label": "redes sociales coincidentes por sitio web"
          },
          {
            "value": "freeRecords",
            "label": "discos gratis, todos los meses"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "formas de ejecutarlo: Extensión, En línea, API - más MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "como funciona",
          "title": {
            "lead": "De una búsqueda en un mapa a una ",
            "accent": "hoja de cálculo",
            "tail": " en tres pasos"
          },
          "lead": "Sin código ni copiar y pegar. MapsGrab lee lo que Google Maps ya te muestra y lo convierte en filas estructuradas."
        },
        "steps": [
          {
            "title": "Buscar Google Maps",
            "body": "Abra Google Maps y busque cualquier tipo de empresa y ubicación, exactamente como lo haría normalmente."
          },
          {
            "title": "Iniciar extracción",
            "body": "Haga clic en {action}. MapsGrab desplaza los resultados, recopila los listados y, cuando está habilitado, enriquece los contactos.",
            "action": "Iniciar extracción"
          },
          {
            "title": "Exportar a cualquier lugar",
            "body": "Descargue CSV o JSON con las columnas que elija: las reseñas y las fotos se guardan en sus propios archivos, listas para Excel o su CRM."
          }
        ],
        "searchSample": "panadería en seattle",
        "columnsUnit": "columnas",
        "reviewsFile": "opiniones"
      },
      "products": {
        "head": {
          "kicker": "Productos",
          "title": {
            "lead": "Tres formas de ",
            "accent": "obtener",
            "tail": " datos de Maps."
          },
          "lead": "Elija la extensión del navegador, Extractor online basado en la nube o API. La extensión funciona dentro de tu propio navegador; Extractor online y API comparten un motor de nube."
        },
        "cards": {
          "extension": {
            "badge": "Extensión del navegador",
            "title": "Toma datos mientras navegas Google Maps",
            "body": "Extraiga datos comerciales, reseñas y fotografías de las páginas de Maps que abra y luego exporte todo localmente. Borde, Firefox y Chromium.",
            "link": "Explora la extensión"
          },
          "online": {
            "badge": "Extractor online",
            "title": "La nube corre. Nada que instalar.",
            "body": "Pegue palabras clave, recopile detalles comerciales en la nube y descargue una columna 37 CSV deduplicada por tarea.",
            "link": "Explorar extractor en línea"
          },
          "api": {
            "badge": "API",
            "title": "Limpiar JSON sobre HTTP",
            "body": "Datos comerciales y reseñas de sus propias aplicaciones: una clave API.",
            "link": "Explora el API"
          },
          "mcp": {
            "badge": "MCP servidor",
            "title": "Datos de Live Maps para sus agentes de IA",
            "body": "Busque y revise como MCP herramientas para Claude Code, Cursor, VS Code y Codex.",
            "link": "Explora el servidor MCP"
          }
        },
        "extracting": "Extrayendo {count}…",
        "queue": {
          "rows": "{count} filas",
          "processing": "Tratamiento"
        },
        "chat": {
          "prompt": "Encuentra dentistas en Austin calificados 4.5+ con un sitio web",
          "answer": "Se encontraron {count} coincidencias. Los tres primeros:"
        }
      },
      "fields": {
        "head": {
          "kicker": "los datos",
          "title": {
            "lead": "36 columnas. ",
            "accent": "Todos",
            "tail": " útiles."
          },
          "lead": "La extensión exporta un esquema de los resultados de búsqueda y las páginas comerciales: detalles de contacto, ubicación, perfil, calificaciones y todos los identificadores que necesite para hacer coincidir los registros más adelante."
        },
        "filtersLabel": "Grupos de campo",
        "all": "Todo",
        "groups": {
          "contact": {
            "filter": "Contacto",
            "label": "Contacto"
          },
          "location": {
            "filter": "Ubicación",
            "label": "Ubicación"
          },
          "profile": {
            "filter": "Perfil",
            "label": "Perfil empresarial"
          },
          "reviews": {
            "filter": "Calificaciones",
            "label": "Calificaciones y reseñas"
          },
          "ids": {
            "filter": "ID y enlaces",
            "label": "ID y enlaces"
          }
        },
        "sampleLabel": "Valor de muestra",
        "emptySample": "(vacío)",
        "descriptions": {
          "Name": "Nombre comercial exactamente como se muestra en el listado.",
          "Description": "Breve descripción del perfil empresarial.",
          "Fulladdress": "Dirección postal completa y formateada.",
          "Street": "Línea de calle de la dirección.",
          "Municipality": "Ciudad o localidad.",
          "Categories": "Cada categoría asignada al negocio.",
          "About": "Atributos de la pestaña Acerca de.",
          "Plus Code": "Columna reservada para el código de ubicación abierta: exportada vacía por ahora.",
          "Time Zone": "Zona horaria IANA de la ubicación.",
          "Price": "Nivel de precio mostrado en el listado.",
          "Note": "Nota mercantil o resaltado.",
          "Amenities": "Amenidades y opciones de servicio.",
          "Hotel Class": "Clase estrella para listados de alojamiento.",
          "Phone": "Número de teléfono principal que se muestra en el listado.",
          "Phones": "Todos los números de teléfono encontrados para la empresa.",
          "Claimed": "Si el propietario ha reclamado el perfil.",
          "Owner": "Nombre del propietario en el perfil.",
          "Owner Id": "ID de colaborador de la cuenta del propietario.",
          "Owner Link": "Enlace a la página de colaborador del propietario.",
          "Email": "Direcciones de correo electrónico encontradas en el sitio web de la empresa.",
          "Social Medias": "Perfiles sociales enlazados desde el sitio web.",
          "Review Count": "Número total de reseñas.",
          "Average Rating": "Calificación promedio de estrellas.",
          "Review URL": "Enlace directo al panel de reseñas.",
          "Google Maps URL": "Enlace corto estable construido a partir del CID.",
          "Google Knowledge URL": "Enlace de búsqueda del panel de conocimiento.",
          "Latitude": "Latitud en grados decimales.",
          "Longitude": "Longitud en grados decimales.",
          "Website": "Sitio web oficial del listado.",
          "Domain": "Dominio registrable del sitio web.",
          "Opening Hours": "Horario semanal, días cerrados marcados.",
          "Featured Image": "Foto de portada URL del listado.",
          "Cid": "ID de cliente: la forma decimal de FID.",
          "Fid": "ID de característica formado por dos mitades hexadecimales.",
          "Place Id": "Estable Google Place ID.",
          "Kgmid": "ID de máquina del gráfico de conocimiento."
        },
        "reviews": {
          "title": "+ 11 columnas de revisión",
          "body": "Exportado por separado, paginado hasta el límite de su plan."
        },
        "photos": {
          "title": "+ foto URL listas",
          "body": "Foto del álbum público URLs por empresa, Street View filtrada."
        },
        "sampleCsv": "Descargar muestra CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Enriquecimiento",
          "title": {
            "lead": "Desde un pin hasta una persona puedes ",
            "accent": "correo electrónico",
            "tail": ""
          },
          "lead": "Cuando el enriquecimiento está activado, MapsGrab consulta el sitio web oficial de cada negocio y completa los canales de contacto directo mientras extrae."
        },
        "points": [
          "Direcciones de correo electrónico encontradas en el sitio web de la empresa.",
          "Perfiles sociales: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Activado de forma predeterminada en planes en línea pagos, una configuración en la extensión",
          "Incluido en API respuestas de búsqueda con una marca: sin paso de enriquecimiento por separado"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Para desarrolladores",
          "title": {
            "lead": "Conecte los datos de Maps a ",
            "accent": "cualquier cosa",
            "tail": " que cree"
          },
          "lead": "El motor de nube detrás de Extractor online, expuesto como un servidor HTTP API y un MCP. Estructurado JSON, una clave, sin HTML para analizar."
        },
        "listLabel": "Productos de desarrollador",
        "items": {
          "search": {
            "title": "API de extracción",
            "description": "Negocios para cualquier palabra clave y ubicación."
          },
          "reviews": {
            "title": "API de reseñas",
            "description": "Calificaciones, textos y respuestas de los propietarios"
          },
          "photos": {
            "title": "API de fotos",
            "description": "Foto pública URLs por negocio"
          },
          "mcp": {
            "title": "MCP servidor",
            "description": "Herramientas de búsqueda y reseñas para cualquier cliente MCP"
          }
        },
        "langLabel": "Idioma",
        "copyLabel": "Solicitud de copia",
        "sending": "Enviando solicitud…",
        "response": "Respuesta · 200 Aceptar · {ms} ms",
        "toolCall": "Llamada a herramienta · {tool} · 200 Aceptar",
        "exploreApi": "Explora el API",
        "apiPricing": "API precios",
        "worksWith": "Funciona con las herramientas que ya utilizas",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Excel",
          "CSV",
          "JSON",
          "ZIP paquetes"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Casos de uso",
          "title": {
            "lead": "Hecho para el trabajo ",
            "accent": "después",
            "tail": " de la búsqueda"
          }
        },
        "cards": [
          {
            "label": "Generación de leads",
            "title": "Listas de clientes potenciales locales",
            "body": "Busque una categoría y una ciudad, luego exporte toda la página de resultados (incluidos teléfonos, sitios web y correos electrónicos) en una hoja de cálculo."
          },
          {
            "label": "SEO local",
            "title": "Puntos de referencia de la competencia",
            "body": "Obtenga calificaciones y revise los recuentos de cada competidor en un área en una sola pasada y cree el informe directamente desde la exportación."
          },
          {
            "label": "investigación de mercado",
            "title": "Conjuntos de datos de ubicación",
            "body": "Recopile ID de lugar y coordenadas para cada sucursal o ubicación de la competencia, listos para sus herramientas de mapeo y enrutamiento."
          }
        ],
        "leadTags": [
          "correo electrónico",
          "teléfono",
          "correo electrónico",
          "sitio"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Precios",
          "title": {
            "lead": "Empieza gratis. ",
            "accent": "Escala",
            "tail": " cuando vale la pena."
          },
          "lead": "Cada producto tiene un nivel gratuito sin límite de tiempo. Actualice sólo la superficie que realmente utiliza."
        },
        "lines": {
          "extension": {
            "title": "Extensión del navegador",
            "billing": "Mensual",
            "link": "Ver planes de ampliación"
          },
          "online": {
            "title": "Extractor online",
            "billing": "una sola vez",
            "link": "Ver planes en línea"
          },
          "api": {
            "title": "API & MCP",
            "billing": "una sola vez",
            "link": "Ver planes API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Herramientas gratuitas",
          "title": {
            "lead": "Pequeñas herramientas para Maps ",
            "accent": "usuarios avanzados",
            "tail": ""
          },
          "lead": "Siete utilidades que se ejecutan completamente en tu navegador: lo que pegas nunca sale de tu dispositivo."
        },
        "descriptions": {
          "place-id-finder": "Pegue un lugar de Maps URL y lea en voz alta sus Place ID, CID y FID.",
          "review-link-generator": "Obtenga el enlace directo \"escribir una reseña\" para cualquier negocio.",
          "email-checker": "Vea al instante si un formato de correo electrónico es válido, con sugerencias de errores tipográficos.",
          "lat-long-to-dms": "Coordenadas decimales a grados, minutos y segundos.",
          "dms-to-dd": "DMS coordina nuevamente a grados decimales limpios.",
          "bulk-keywords-generator": "Cada combinación de “palabra clave + ubicación”, lista para pegar.",
          "merge-csv": "Fusionar CSV exportaciones en un archivo, alineado por encabezado."
        },
        "more": "Más herramientas en camino"
      },
      "faq": {
        "kicker": "Preguntas frecuentes",
        "title": {
          "lead": "",
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "lead": "Las respuestas cortas. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
        "contact": "Contactar con soporte",
        "items": [
          {
            "question": "¿Es MapsGrab de uso gratuito?",
            "answer": "Sí. La extensión funciona sin cuenta e incluye una cuota mensual gratuita de registros. Los planes pagos en la página de Precios aumentan los límites cuando necesitas más."
          },
          {
            "question": "¿Qué navegadores son compatibles?",
            "answer": "Descargue MapsGrab desde la página de Extensión. Chrome, Edge y Brave cargan el ZIP descomprimido; Firefox utiliza un complemento temporal independiente que debe recargarse después de reiniciar. La página incluye instrucciones de instalación y actualización."
          },
          {
            "question": "¿De dónde provienen los datos? ¿Es legal recopilarlos?",
            "answer": "MapsGrab solo recopila información que se muestra públicamente en las páginas Google Maps que visitas: los mismos detalles que cualquier visitante puede leer. No accedemos a cuentas privadas, contenido privado ni datos no públicos."
          },
          {
            "question": "¿Necesito instalar algo para las herramientas web?",
            "answer": "No. Las herramientas web gratuitas se ejecutan completamente en su navegador: sus datos nunca salen de su dispositivo."
          },
          {
            "question": "¿A qué formatos puedo exportar?",
            "answer": "Las exportaciones vienen como CSV o JSON con la selección de campo que elija, deduplicadas por Place ID."
          },
          {
            "question": "¿MapsGrab ve los datos que recopilo?",
            "answer": "Su configuración y resultados se almacenan localmente en su navegador. Nuestros servidores solo manejan la configuración remota, el estado de la cuenta y la cuota, el enriquecimiento social/de correo electrónico opcional y los registros de uso mínimo."
          }
        ]
      },
      "cta": {
        "kicker": "empezar",
        "title": {
          "lead": "Empieza a agarrar en ",
          "accent": "minutos",
          "tail": ""
        },
        "lead": "Instale la extensión, abra Google Maps, busque y exporte su primera lista; no se requiere cuenta.",
        "install": "Instalar MapsGrab gratis",
        "online": "Pruebe el extractor en línea",
        "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab para Chrome, Edge y Firefox — Google Maps Extensión extractora",
        "description": "Extraiga 36 columnas de datos comerciales, reseñas y fotografías de Google Maps, enriquezca registros con correos electrónicos y enlaces sociales, ejecute tareas por lotes y exporte a CSV o JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Descargar para Chrome, Edge y Firefox"
        },
        "title": {
          "lead": "El extractor Google Maps para ",
          "accent": "tu navegador",
          "tail": ""
        },
        "lead": "Abra cualquier página comercial o de búsqueda Google Maps y obtenga lo que se muestra públicamente allí: datos comerciales, reseñas, fotografías y detalles de contacto. Todo se exporta a CSV o JSON, directamente desde tu navegador.",
        "downloadCta": "Descargar para Chrome y Edge",
        "installCta": "guía de instalación",
        "meta": [
          "No se requiere cuenta",
          "1,000 registros gratis/mes",
          "Las exportaciones permanecen en su máquina"
        ],
        "theater": {
          "panelLabel": "MapsGrab vista previa del panel",
          "extensionActive": "MapsGrab está activo en esta página",
          "dock": "Muelle izquierda/derecha",
          "filters": [
            "Abierto ahora",
            "Mejor valorados",
            "Precio"
          ],
          "open": "Abierto",
          "closes": "Cierra {time}",
          "endOfList": "Has llegado al final de la lista.",
          "start": "Iniciar extracción",
          "extracting": "Extrayendo {count}…",
          "pause": "Pausa",
          "complete": "Extracto completo.",
          "reset": "Reiniciar",
          "kpis": {
            "phones": "telefonos",
            "websites": "sitios web",
            "emails": "correos electrónicos"
          },
          "exportCta": "Exportar lista detallada - {count} (.CSV)",
          "saved": "Guardado en Descargas",
          "scrollChip": {
            "label": "Desplazamiento automático",
            "value": "A ritmo humano, 5–10 s"
          },
          "dedupeChip": {
            "label": "Deduplicado",
            "value": "por Place ID"
          }
        }
      },
      "facts": {
        "caption": "La extensión de un vistazo",
        "items": [
          {
            "value": 36,
            "label": "columnas por empresa, desde el nombre hasta Place ID"
          },
          {
            "value": 11,
            "label": "columnas de revisión, respuestas del propietario incluidas"
          },
          {
            "value": 6,
            "label": "redes sociales coincidentes por sitio web"
          },
          {
            "value": 1000,
            "label": "registros gratis todos los meses, no se necesita cuenta"
          },
          {
            "value": 500,
            "label": "palabras clave o revisión URLs por tarea por lotes"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "donde funciona",
          "title": {
            "lead": "Un panel para cada ",
            "accent": "Vista de mapas",
            "tail": ""
          },
          "lead": "El panel MapsGrab aparece justo en Google Maps. Los resultados de búsqueda, las páginas comerciales y las listas guardadas obtienen el modo de extracción correcto: sin copiar y pegar, sin hacer malabarismos con pestañas."
        },
        "search": {
          "title": "Resultados de la búsqueda",
          "description": "Presione Iniciar extracción en cualquier búsqueda. MapsGrab desplaza la lista de resultados a un ritmo humano y recopila cada lista a medida que se carga."
        },
        "place": {
          "title": "paginas comerciales",
          "description": "En una página comercial, la pestaña Reseñas y Fotos muestra reseñas y álbumes de fotos: las reseñas se exportan con 11 columnas, las fotos como URL listas.",
          "tabs": [
            "Descripción general",
            "Reseñas y fotos"
          ],
          "reviewsCta": "Comience a extraer reseñas",
          "photosCta": "Comience a extraer fotos",
          "reviewsCount": "{count} reseñas",
          "photosCount": "{count} fotos"
        },
        "saved": {
          "title": "Listas guardadas",
          "description": "Abra una lista guardada y presione Iniciar una vez. MapsGrab abre cada lugar por turno y lo recopila, sin clics por elemento.",
          "listName": "Favoritos · {count} lugares"
        }
      },
      "features": {
        "head": {
          "kicker": "Características",
          "title": {
            "lead": "Todo lo que muestra una página de Mapas, ",
            "accent": "estructurado",
            "tail": ""
          },
          "lead": "Un esquema de extracción en los resultados de búsqueda y las páginas comerciales, ajustado a la interfaz Google Maps actual y actualizado de forma remota cuando cambia Google."
        },
        "tabsLabel": "Funciones de extensión",
        "tabs": [
          {
            "id": "business",
            "title": "Datos comerciales",
            "description": "36 columnas por empresa, capturadas a medida que se desplaza la lista."
          },
          {
            "id": "reviews",
            "title": "Reseñas",
            "description": "Reseñas con respuestas de los propietarios, paginadas automáticamente."
          },
          {
            "id": "photos",
            "title": "Fotos",
            "description": "Fotos del álbum como listas URL listas para usar."
          },
          {
            "id": "enrichment",
            "title": "Correo electrónico y enriquecimiento social",
            "description": "Canales de contacto directo desde la web oficial."
          },
          {
            "id": "batch",
            "title": "Tareas por lotes",
            "description": "Una cola de palabras clave o reseña URLs, recorridas artículo por artículo."
          },
          {
            "id": "export",
            "title": "Exportar",
            "description": "CSV o JSON, guardados directamente en su máquina."
          }
        ],
        "business": {
          "claimed": "Reclamado",
          "fields": {
            "phone": "Teléfono",
            "website": "Sitio web",
            "rating": "Calificación promedio",
            "hours": "Horario de apertura",
            "timeZone": "Huso horario",
            "coordinates": "Coordenadas",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} reseñas",
          "columns": "{count} columnas por negocio",
          "reserved": "Código Plus reservado",
          "more": "+{count} más"
        },
        "reviews": {
          "title": "Reseñas",
          "columns": "{count} columnas",
          "ownerReply": "Respuesta del propietario",
          "loading": "Cargando la siguiente página de reseñas"
        },
        "photos": {
          "streetView": "Street View · filtrado"
        },
        "enrichment": {
          "website": "Sitio web oficial",
          "moreNetworks": "X, YouTube y TikTok también comprobados"
        },
        "batch": {
          "complete": "{count} completo",
          "stuck": "{count} atascado",
          "total": "{count} en total",
          "done": "Completo · {count}",
          "skipped": "Sin progreso durante 90 s · omitido",
          "running": "Extrayendo…",
          "queued": "En cola",
          "autoExport": "Exporta automáticamente cuando finaliza la tarea."
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} filas · {selected} de {total} columnas seleccionadas · deduplicadas por Place ID",
          "destinations": [
            {
              "title": "Descargas",
              "description": "Guardado por tu navegador"
            },
            {
              "title": "Selector de columnas",
              "description": "Exporta solo las columnas que necesitas"
            },
            {
              "title": "Descarga automática",
              "description": "Guarda tan pronto como finaliza la extracción"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Tareas por lotes",
          "title": {
            "lead": "Poner en cola la lista. ",
            "accent": " Aléjate.",
            "tail": ""
          },
          "lead": "Pegue hasta 500 palabras clave o revise URLs en una tarea. MapsGrab los revisa elemento por elemento con progreso en vivo, omite cualquier cosa que se detenga y exporta automáticamente cuando finaliza la tarea."
        },
        "checks": [
          "Las tareas de palabras clave ejecutan una búsqueda de Maps por palabra clave",
          "Revisión: URL tareas para recopilar reseñas empresa por empresa",
          "El estado de la tarea se guarda en el disco; se recupera después de reiniciar el navegador.",
          "Hasta 150 tareas guardadas, un lote ejecutándose a la vez"
        ],
        "mock": {
          "tabs": [
            "Herramienta de datos masivos de palabras clave",
            "Bulk Google Extractor de reseñas"
          ],
          "taskName": "Nombre de la tarea",
          "taskPlaceholder": "p.ej. 100 palabras clave, agencia de diseño",
          "keywords": "Palabras clave · una por línea",
          "lineCount": "{count} / {limit}",
          "start": "Iniciar extracción",
          "columns": {
            "task": "Nombre de la tarea",
            "status": "Estado",
            "actions": "Comportamiento"
          },
          "running": "Correr",
          "complete": "Completo",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} atascado",
          "progressExported": "{done} / {total} · exportado",
          "lines": {
            "run": "extrayendo…",
            "done": "completo",
            "stuck": "atascado · saltado"
          },
          "toast": "Tarea completa: exportada",
          "chip": {
            "label": "Estado de la tarea",
            "value": "Guardado en el disco"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Primero local",
          "title": {
            "lead": "Tus resultados permanecen ",
            "accent": "en tu navegador",
            "tail": ""
          },
          "lead": "La configuración y los resultados se almacenan localmente. Nuestros servidores solo manejan la configuración remota, el estado de la cuenta y la cuota, el correo electrónico opcional y el enriquecimiento social, y registros de uso mínimo."
        },
        "checks": [
          "Las exportaciones se generan en su máquina.",
          "La selección de columnas y la deduplicación Place ID se ejecutan localmente antes de guardar el archivo",
          "La configuración remota mantiene el panel actualizado cuando cambia Google Maps, sin necesidad de reinstalar",
          "Si algo no se puede leer, el panel muestra un error en lugar de fallar silenciosamente"
        ],
        "diagram": {
          "browser": "Tu navegador",
          "servers": "MapsGrab servidores",
          "nodes": {
            "mapsTab": "pestaña Google Maps",
            "panel": "MapsGrabpanel",
            "storage": "Almacenamiento local",
            "exports": "Tus exportaciones",
            "config": "Configuración remota",
            "quota": "Cuenta y cuota",
            "enrichment": "Enriquecimiento"
          },
          "flows": {
            "rows": "filas de negocios",
            "rules": "normas",
            "usage": "uso",
            "websites": "sitios web comerciales → correos electrónicos y redes sociales"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Instalar",
          "title": {
            "lead": "Instalar ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "Descarga el ZIP aquí y sigue los pasos para tu navegador. Chrome, Edge y Brave cargan la carpeta descomprimida. Firefox utiliza un complemento temporal independiente que debe recargarse después de reiniciar. Haga clic en cualquier imagen para verla en tamaño completo."
        },
        "zip": {
          "title": "Instalación directa (liberar zip)",
          "description": "Elija el ZIP para su navegador. Extráigalo a una carpeta que guarde y luego cárguelo usando la guía a continuación. Para actualizar, descargue un nuevo ZIP, reemplace los archivos en esa carpeta y vuelva a cargar la extensión.",
          "button": "Chrome, Borde y Brave ZIP",
          "firefoxButton": "Firefox ZIP (complemento temporal)",
          "meta": "Versión {version} · prelanzamiento"
        },
        "browserLabel": "Navegador",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome y borde",
            "note": "Edge, Chrome, Brave y otros navegadores Chromium",
            "steps": [
              {
                "title": "Descargar y descomprimir",
                "description": [
                  "Descargar ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". En Windows, haga clic derecho y elija \"Extraer todo\". En macOS, haz doble clic en él. Conserve la carpeta extraída."
                ],
                "shot": "MapsGrab ZIP descargado en Chrome"
              },
              {
                "title": "Abra la página de extensiones",
                "description": [
                  "Abierto ",
                  {
                    "code": "chrome://extensions"
                  },
                  " en Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " en borde, o ",
                  {
                    "code": "brave://extensions"
                  },
                  " en Brave."
                ],
                "shot": "La página de gestión de extensiones."
              },
              {
                "title": "Habilitar el modo desarrollador",
                "description": [
                  "Active el modo de desarrollador en la página de extensiones. En Chrome, el interruptor está en la parte superior derecha."
                ],
                "shot": "Modo de desarrollador habilitado con el botón Cargar desempaquetado visible"
              },
              {
                "title": "Cargue la carpeta descomprimida",
                "description": [
                  "Haga clic en \"Cargar descomprimido\" y seleccione la carpeta extraída. MapsGrab aparece en la lista de extensiones. Abra una búsqueda Google Maps para usarla."
                ],
                "shot": "Carga desempaquetada con la tarjeta MapsGrab agregada"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Complemento temporal; recargarlo después de reiniciar Firefox",
            "steps": [
              {
                "title": "Descargar y descomprimir",
                "description": [
                  "Descargar ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". En Windows, haga clic derecho y elija \"Extraer todo\". En macOS, haz doble clic en él. Conserve la carpeta extraída."
                ],
                "shot": "MapsGrab Firefox ZIP descargado en Firefox"
              },
              {
                "title": "Abra la página de depuración",
                "description": [
                  "Navegar a ",
                  {
                    "code": "about:debugging"
                  },
                  ", luego seleccione su navegador en la barra lateral izquierda."
                ],
                "shot": "Firefox página de depuración con los controles complementarios temporales"
              },
              {
                "title": "Cargar el complemento",
                "description": [
                  "Haga clic en \"Cargar complemento temporal...\" y seleccione ",
                  {
                    "code": "manifest.json"
                  },
                  " dentro de la carpeta descomprimida. Un complemento temporal se descarga cuando se reinicia Firefox; repita este paso para cargarlo nuevamente."
                ],
                "shot": "MapsGrab cargado como una extensión temporal Firefox con su script en segundo plano ejecutándose"
              }
            ]
          }
        ],
        "help": {
          "title": "¿Problemas de instalación?",
          "description": "Envíenos el nombre del navegador y lo que vio; lo desbloquearemos.",
          "cta": "Contactar con soporte"
        },
        "notes": {
          "kicker": "Notas de la versión",
          "version": "0.1.0",
          "status": "Prelanzamiento",
          "date": "Agosto 2026",
          "items": [
            "Primer prelanzamiento de la extensión MapsGrab",
            "Google Maps extracción de búsqueda con desplazamiento automático y el esquema de columna 36",
            "Revisión y extracción de fotografías de páginas comerciales.",
            "Enriquecimiento de correo electrónico y redes sociales por negocio",
            "Lote de palabras clave y revisión: URL tareas con estado de tarea en el disco",
            "CSV / JSON exportar con selección de campos y Place ID deduplicación",
            "Construcciones para Microsoft Edge y Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Planes de extensión",
          "title": {
            "lead": "Una extensión, tres ",
            "accent": "planes",
            "tail": ""
          },
          "lead": "Cada fila que recopila la extensión (una empresa, una reseña o una foto) cuenta como un registro. Todos los planes incluyen reseñas, fotografías y tareas por lotes; Los planes pagos exportan todas las 36 columnas, incluido el correo electrónico y el enriquecimiento social, con un volumen mensual mayor."
        },
        "note": "El uso mensual se reinicia el 1primero en el New York tiempo; los registros no utilizados no se acumulan.",
        "compare": "Compara todos los planes"
      },
      "faq": {
        "kicker": "Preguntas frecuentes",
        "title": {
          "lead": "",
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "lead": "Las respuestas cortas. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
        "contact": "Contactar con soporte",
        "items": [
          {
            "question": "¿La extensión es de uso gratuito?",
            "answer": "Sí. La extensión funciona sin cuenta e incluye 1,000 registros cada mes. Los planes pagos en la página de Precios agregan todas las columnas 36 con enriquecimiento de correo electrónico y redes sociales, y aumentan el volumen mensual."
          },
          {
            "question": "¿Qué navegadores son compatibles?",
            "answer": "Chrome, Edge, Brave y otros navegadores Chromium cargan el ZIP descomprimido descargado aquí. Firefox tiene un ZIP separado para carga temporal; recárguelo después de cada reinicio del navegador. Siga la guía de instalación anterior."
          },
          {
            "question": "¿Necesito iniciar sesión?",
            "answer": "No. La extracción de núcleos funciona sin una cuenta. La cuota se cuenta por cuenta iniciada o por dispositivo de navegador cuando no haya iniciado sesión; inicie sesión con la cuenta que posee un plan para que se aplique su mayor volumen."
          },
          {
            "question": "¿Qué cuenta como récord?",
            "answer": "Cada fila que recopila la extensión cuenta como un registro: una empresa de una búsqueda o lista guardada, una reseña o una foto. El correo electrónico y el enriquecimiento social no agregan registros."
          },
          {
            "question": "¿Qué sucede cuando cambia Google Maps?",
            "answer": "Las reglas de extracción se envían como configuración remota, por lo que las correcciones llegan al panel sin reinstalar la extensión. Si no se puede leer una página, el panel muestra un error en lugar de fallar silenciosamente."
          },
          {
            "question": "¿MapsGrab ve los datos que recopilo?",
            "answer": "Su configuración y resultados se almacenan localmente en su navegador. Nuestros servidores solo manejan la configuración remota, el estado de la cuenta y la cuota, el correo electrónico opcional y el enriquecimiento social, y registros de uso mínimo."
          },
          {
            "question": "¿De dónde provienen los datos? ¿Es legal recopilarlos?",
            "answer": "MapsGrab solo recopila información que se muestra públicamente en las páginas Google Maps que visitas: los mismos detalles que cualquier visitante puede leer. No accedemos a cuentas privadas, contenido privado ni datos no públicos."
          }
        ]
      },
      "cta": {
        "kicker": "empezar",
        "title": {
          "lead": "Toma tu primera lista ",
          "accent": "hoy",
          "tail": ""
        },
        "lead": "Instale la extensión, busque Google Maps y exporte una hoja de cálculo limpia; no se requiere una cuenta.",
        "primary": "Instalar MapsGrab",
        "secondary": "Comparar planes",
        "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Acceso al sitio web",
        "title": "Inicia sesión para sincronizar tus créditos",
        "trigger": "Iniciar sesión",
        "modalTitle": "Inicia sesión para continuar",
        "closeLabel": "Cerca",
        "signedInAs": "Iniciado sesión como",
        "continueWithGoogle": "Continuar con Google",
        "googleLoading": "Abriendo Google...",
        "or": "o",
        "emailLabel": "Correo electrónico",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Continuar con el correo electrónico",
        "sendCode": "Enviar código",
        "sendingCode": "Envío...",
        "sendCodeSuccess": "Código de verificación enviado.",
        "sendAgain": "Enviar de nuevo",
        "codeLabel": "Código de verificación",
        "codePlaceholder": "123456",
        "signIn": "Iniciar sesión",
        "termsNotice": "Al iniciar sesión, aceptas las",
        "termsLink": "Términos",
        "privacyLink": "política de privacidad",
        "logout": "Finalizar la sesión",
        "creditsLabel": "Créditos",
        "enterEmailFirst": "Por favor, introduzca primero su dirección de correo electrónico.",
        "enterEmailAndCode": "Ingrese el correo electrónico y el código de verificación.",
        "sendCodeFailed": "No se pudo enviar el código de verificación.",
        "googleSignInFailed": "Error al iniciar sesión en Google.",
        "googleClientMissing": "El inicio de sesión Google no está configurado.",
        "signInFailed": "No se pudo iniciar sesión."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Pago cancelado",
        "canceledMessage": "Este pedido no fue pagado. Puede cerrar esta pestaña y elegir un método de pago nuevamente en la ventana original.",
        "canceledMetaDescription": "Su pago de PayPal fue cancelado.",
        "waitingTitle": "Pago enviado",
        "waitingMessage": "Puede volver a la pestaña original. Estamos verificando PayPal confirmación cada 3 segundos y el resultado aparecerá aquí automáticamente.",
        "confirmedCreditsTitle": "Créditos añadidos",
        "confirmedCreditsMessage": "Su pago de PayPal está confirmado y se han agregado los Créditos. Puede cerrar esta pestaña y continuar en la ventana original.",
        "confirmedSubscriptionTitle": "Suscripción activada",
        "confirmedSubscriptionMessage": "Tu pago de PayPal está confirmado y tu plan MapsGrab está activo. Puede cerrar esta pestaña y continuar en la ventana original.",
        "failedTitle": "El pago necesita atención",
        "failedMessage": "No pudimos confirmar este pedido automáticamente. Regrese a la ventana original o intente actualizar su estado de pago allí."
      },
      "checkin": {
        "accountButtonLabel": "Abrir menú de cuenta",
        "accountMenuLabel": "Menú de cuenta"
      },
      "creditPurchase": {
        "title": "Obtenga más créditos",
        "description": "Agregue créditos y continúe usando funciones pagas en este espacio de trabajo.",
        "successTitle": "Créditos añadidos",
        "successDescription": "Su saldo ha sido actualizado. Cierra esta ventana y continúa.",
        "packageEyebrow": "Paga sobre la marcha",
        "cardNote": "Utilice créditos para funciones pagas del sitio web. Los créditos nunca caducan.",
        "creditsAmount": "Créditos {credits}",
        "buyNow": "Comprar ahora",
        "selectPackage": "Seleccionar",
        "paymentMethodLabel": "Elige el método de pago",
        "paymentTitle": "Elige el método de pago",
        "selectedPackageLabel": "Paquete seleccionado",
        "confirmPurchase": "Continuar con el pago",
        "backToProducts": "Atrás",
        "close": "Cerca",
        "agreementText": "Acepto los términos de compra, Términos y Política de Privacidad.",
        "loadingConfigs": "Cargando paquetes de créditos...",
        "loadFailed": "No se pudieron cargar los paquetes de créditos. Por favor inténtalo de nuevo.",
        "noConfigs": "No hay paquetes de créditos disponibles en este momento. Inténtelo de nuevo más tarde.",
        "ready": "Elija un paquete de créditos. Los precios se muestran en USD.",
        "creatingOrder": "Creando orden...",
        "pendingPayment": "Complete el pago en la pestaña recién abierta. Comprobaremos el resultado automáticamente.",
        "pendingPaymentTitle": "Esperando pago",
        "cancelPayment": "Cancelar pago",
        "supportMailPrefix": "Informar un problema: ",
        "success": "Pago completo. Los créditos ya están disponibles.",
        "failed": "El pago no está completo. Puede volver a intentarlo o cerrar esta ventana.",
        "successCredits": "+{credits} Créditos agregados",
        "successBalance": "Saldo actual: {balance} Créditos",
        "createFailed": "No se pudo crear el pedido. Por favor inténtalo de nuevo.",
        "invalidPaymentData": "El enlace de pago no es válido. Inténtelo de nuevo más tarde.",
        "priceUpdated": "Precio cambiado. Revise el último precio y compre nuevamente.",
        "gatewayFailed": "La entrada de pagos no está disponible temporalmente. Inténtelo de nuevo más tarde.",
        "paymentCanceled": "El pago fue cancelado. Elija un método de pago e inténtelo nuevamente.",
        "pollFailed": "No se pudo actualizar el estado del pago. Por favor inténtalo de nuevo.",
        "pollTimeout": "Se agotó el tiempo de actualización automática. Utilice el botón de actualización después del pago.",
        "orderNotFound": "El pedido ya no está disponible. Crea un nuevo pedido.",
        "orderExpired": "El pedido expiró. Por favor compre de nuevo.",
        "fulfillmentFailed": "Se recibió el pago pero aún no se agregaron los créditos. Vuelva a intentarlo más tarde.",
        "authExpired": "El inicio de sesión expiró. Inicia sesión nuevamente para continuar.",
        "popupBlocked": "Su navegador bloqueó la nueva ventana. Permita que MapsGrab abra ventanas emergentes y vuelva a intentarlo."
      }
    },
    "pricing": {
      "seo": {
        "title": "Precios: planes en línea, de extensión y API | MapsGrab",
        "description": "MapsGrab planos para cada superficie: Scraper en línea desde $19, Extensión del navegador desde $39, y API desde $15. Niveles gratuitos incluidos con cada producto: planes únicos de mes natural en línea y API suscripciones mensuales en Extension."
      },
      "hero": {
        "kicker": "Precios",
        "title": {
          "lead": "Planes para ",
          "accent": "tres formas",
          "tail": " de obtener datos de Maps"
        },
        "lead": "Elija la superficie que se ajuste a su flujo de trabajo (Cloud Extractor online, extensión del navegador o HTTP API) y luego elija el volumen mensual. Actualice o compre desde esta página en minutos.",
        "meta": [
          "Nivel gratuito en cada producto",
          "Paga con PayPal",
          "Actualiza pagando la diferencia"
        ],
        "switchLabel": "Línea de productos"
      },
      "popularLabel": "Más Popular",
      "tabs": {
        "online": {
          "name": "Extractor online",
          "shortName": "Online",
          "switchMeta": "Desde {price} · una vez",
          "unit": "archivos",
          "eyebrow": "Planes Scraper en línea",
          "title": "Extracción en la nube, tasada por registros",
          "description": "Ejecute el motor MapsGrab en nuestra infraestructura. Un registro es una fila comercial recopilada. Los planes pagos incluyen enriquecimiento opcional de correo electrónico y redes sociales sin costo adicional de registro.",
          "billingChips": [
            "Pago único",
            "Cubre un mes natural",
            "Sin renovación automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratis",
              "tagline": "Pruebe el extractor de nubes a pequeña escala",
              "price": "$0",
              "periodLabel": "para siempre",
              "quota": "1,000 registros/mes",
              "features": [
                "Extracción de negocios con 37-columna CSV exportación",
                "Hasta 2 palabras clave por tarea",
                "Modos de mapa y región para búsquedas de áreas",
                "Correo electrónico y enriquecimiento social en planes pagos",
                "Un CSV deduplicado por tarea"
              ],
              "ctaLabel": "Empieza gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Para exportaciones puntuales y ocasionales",
              "price": "$19",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "20,000 registros/mes",
              "features": [
                "Todo gratis",
                "20,000 registros para 1 mes",
                "Pago único: sin renovación automática",
                "Hasta 5 palabras clave por tarea",
                "Enriquecimiento social y de correo electrónico, activado de forma predeterminada y opcional"
              ],
              "ctaLabel": "Obtener Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Básico",
              "tagline": "Para una recopilación semanal constante de clientes potenciales",
              "price": "$49",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "80,000 registros/mes",
              "features": [
                "Todo en Lite",
                "80,000 registros para 1 mes",
                "Pago único: sin renovación automática",
                "Hasta 10 palabras clave por tarea"
              ],
              "ctaLabel": "Obtener básico",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Crecimiento",
              "tagline": "Para tuberías de plomo en crecimiento",
              "price": "$99",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "250,000 registros/mes",
              "features": [
                "Todo en Básico",
                "250,000 registros para 1 mes",
                "Pago único: sin renovación automática",
                "Hasta 20 palabras clave por tarea"
              ],
              "ctaLabel": "Obtener crecimiento",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Profesional",
              "tagline": "Para agencias y equipos con muchos datos",
              "price": "$149",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "500,000 registros/mes",
              "features": [
                "Todo en crecimiento",
                "500,000 registros para 1 mes",
                "Pago único: sin renovación automática",
                "Hasta 50 palabras clave por tarea"
              ],
              "ctaLabel": "Conviértete profesional",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pago único que cubre un mes natural: los planes en esta pestaña no se renuevan automáticamente. Un registro es una fila comercial recopilada de Google Maps; el uso se restablece en el 1 y los registros no utilizados no se transfieren.",
          "compare": {
            "lead": "Planes Scraper en línea: extracción en la nube, precio por registros.",
            "volume": "Registros por mes",
            "groups": [
              {
                "label": "Datos",
                "rows": [
                  {
                    "label": "Extracción de negocios con 37-columna CSV exportación",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Correo electrónico y enriquecimiento social",
                    "cells": [
                      false,
                      "Activado de forma predeterminada, opcional",
                      "Activado de forma predeterminada, opcional",
                      "Activado de forma predeterminada, opcional",
                      "Activado de forma predeterminada, opcional"
                    ]
                  }
                ]
              },
              {
                "label": "Flujo de trabajo",
                "rows": [
                  {
                    "label": "Palabras clave por tarea",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Modos de mapa y región",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Un CSV deduplicado por tarea",
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
            "usageNotice": "Aplica a la cuota de registro mensual de MapsGrab Extractor online.",
            "successTitle": "Plan activado",
            "successDescription": "Su plan único de 1 meses ya está activo. Extractor online lo retoma en la siguiente actualización de cuota."
          }
        },
        "extension": {
          "name": "Extensión",
          "shortName": "Extensión",
          "switchMeta": "Desde {price} · una vez",
          "unit": "archivos",
          "eyebrow": "Planes de extensión",
          "title": "Extracción del navegador, precio por registros",
          "description": "Cada fila que recopila la extensión (una empresa, una reseña o una foto) cuenta como un registro. Todos los planes incluyen reseñas, fotografías y tareas por lotes; Los planes pagos exportan todas las 36 columnas, incluido el correo electrónico y el enriquecimiento social.",
          "billingChips": [
            "Pago único",
            "1 mes de acceso",
            "Sin renovación automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratis",
              "tagline": "Extracción de núcleos, a pequeña escala",
              "price": "$0",
              "periodLabel": "para siempre",
              "quota": "1,000 registros/mes",
              "features": [
                "Extracción de datos comerciales",
                "Reseñas (11 columnas) y foto URLs",
                "Lote de palabras clave y revisión: URL tareas",
                "CSV / JSON exportar con selección de campo"
              ],
              "ctaLabel": "Instalar la extensión",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Para autónomos y canales de leads en crecimiento",
              "price": "$39",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "100,000 registros/mes",
              "features": [
                "Todo gratis",
                "100,000 registros cada mes",
                "Extracción comercial completa de 36 columnas",
                "Enriquecimiento de correo electrónico y redes sociales"
              ],
              "ctaLabel": "Conviértete en profesional",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Negocio",
              "tagline": "Para agencias y equipos con muchos datos",
              "price": "$99",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "500,000 registros/mes",
              "features": [
                "Todo en Pro",
                "500,000 registros cada mes",
                "Espacio para tareas por lotes multimercado",
                "Mismo canal de exportación local primero"
              ],
              "ctaLabel": "conseguir negocio",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Cada fila que recopila la extensión cuenta como un registro: una empresa de una búsqueda o lista guardada, una reseña o una foto. El correo electrónico y el enriquecimiento social no agregan registros. El uso mensual se restablece el día 1; los registros no utilizados no se acumulan.",
          "compare": {
            "lead": "Planes de extensión: extracción del navegador, precio por registros.",
            "volume": "Registros por mes",
            "groups": [
              {
                "label": "Datos",
                "rows": [
                  {
                    "label": "Extracción de datos comerciales",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Extracción comercial completa de 36 columnas",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Reseñas (11 columnas) y foto URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Enriquecimiento de correo electrónico y redes sociales",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Lote de palabras clave y revisión: URL tareas",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Exportar",
                "rows": [
                  {
                    "label": "CSV / JSON exportar con selección de campo",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Canal de exportación local primero",
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
            "usageNotice": "Aplica a la cuota mensual de extensión del navegador MapsGrab.",
            "successTitle": "Plan activado",
            "successDescription": "Su plan único de 1 meses ya está activo. La extensión lo retoma en la próxima actualización de cuota."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "Desde {price} · una vez",
          "unit": "solicitudes",
          "eyebrow": "API planes",
          "title": "Acceso programático, precio según solicitudes",
          "description": "Busque Google Maps empresas y obtenga sus reseñas desde sus propias aplicaciones con un simple HTTP API. Cada llamada exitosa cuenta como una solicitud, incluso cuando no devuelve resultados o datos parciales.",
          "billingChips": [
            "Pago único",
            "Cubre un mes natural",
            "Sin renovación automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Gratis",
              "tagline": "Evaluar el API a pequeña escala",
              "price": "$0",
              "periodLabel": "para siempre",
              "quota": "20 solicitudes/mes",
              "features": [
                "Búsqueda de empresas por palabra clave y ubicación",
                "Revisa el punto final con clasificación y paginación",
                "JSON respuestas",
                "API clave vinculada a su cuenta",
                "Apoyo comunitario"
              ],
              "ctaLabel": "Empieza gratis",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Básico",
              "tagline": "Para prototipos e integraciones ligeras.",
              "price": "$15",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "1,000 solicitudes/mes",
              "features": [
                "Todo gratis",
                "1,000 solicitudes para 1 mes",
                "Pago único: sin renovación automática",
                "JSON respuestas"
              ],
              "ctaLabel": "Obtener básico",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Profesional",
              "tagline": "Para integraciones de producción",
              "price": "$65",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "5,000 solicitudes/mes",
              "features": [
                "Todo en Básico",
                "5,000 solicitudes para 1 mes",
                "Pago único: sin renovación automática",
                "JSON respuestas"
              ],
              "ctaLabel": "Conviértete profesional",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Negocio",
              "tagline": "Para productos creados con datos MapsGrab",
              "price": "$115",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "10,000 solicitudes/mes",
              "features": [
                "Todo en Profesional",
                "10,000 solicitudes para 1 mes",
                "Pago único: sin renovación automática",
                "JSON respuestas"
              ],
              "ctaLabel": "conseguir negocio",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Escala",
              "tagline": "Para operaciones de datos de gran volumen",
              "price": "$365",
              "periodLabel": "una sola vez · 1 mes",
              "quota": "50,000 solicitudes/mes",
              "features": [
                "Todo en Negocios",
                "50,000 solicitudes para 1 mes",
                "Pago único: sin renovación automática",
                "JSON respuestas"
              ],
              "ctaLabel": "Obtener escala",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pago único que cubre un mes natural: los planes en esta pestaña no se renuevan automáticamente. Cada llamada exitosa API o MCP cuenta como una solicitud, incluidos los resultados vacíos y parciales; Las llamadas fallidas no se cuentan. El uso se restablece el 1 y las solicitudes no utilizadas no se acumulan.",
          "compare": {
            "lead": "API planes: acceso programático, con precios según solicitudes.",
            "volume": "Solicitudes por mes",
            "groups": [
              {
                "label": "Puntos finales",
                "rows": [
                  {
                    "label": "Búsqueda de empresas por palabra clave y ubicación",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Revisa el punto final con clasificación y paginación",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON respuestas",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "MCP servidor con la misma clave API",
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
                "label": "Acceso",
                "rows": [
                  {
                    "label": "API clave vinculada a su cuenta",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Apoyo comunitario",
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
            "usageNotice": "Aplica sobre la cuota de solicitud mensual MapsGrab API.",
            "successTitle": "Plan activado",
            "successDescription": "Su plan único de 1 meses ya está activo. Su clave API recoge la nueva cuota en la siguiente solicitud."
          }
        }
      },
      "plansSection": {
        "label": "Planes",
        "finder": {
          "label": "¿Cuántos {unit} necesitas al mes?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} un mes - {plan} plan",
          "fits": "Se adapta"
        }
      },
      "compare": {
        "kicker": "Comparar",
        "title": {
          "lead": "Cada plan, ",
          "accent": "lado a lado",
          "tail": ""
        },
        "plan": "Plan",
        "volumeGroup": "Volumen y facturación",
        "billing": "Facturación",
        "included": "Incluido",
        "notIncluded": "No incluido",
        "allPlans": "Incluido en todos los planes"
      },
      "usage": {
        "head": {
          "kicker": "Uso",
          "title": {
            "lead": "Qué cuenta para tu ",
            "accent": "cuota",
            "tail": ""
          },
          "lead": "Dos unidades: registros para la extensión y el Scraper en línea, solicitudes para el API, y ambos se reinician el 1 de cada mes."
        },
        "records": {
          "meter": "Registros utilizados este mes",
          "badge": "Extensión · En línea",
          "title": "1 registro = 1 fila recopilada",
          "body": "Cada fila que recopila cuenta como un registro: una empresa en Extractor online; un negocio, una reseña o una foto en la extensión. El correo electrónico y el enriquecimiento social no agregan registros.",
          "count": "+1 registro",
          "attachments": [
            "Teléfono y sitio web",
            "Horario de apertura",
            "Correo electrónico y redes sociales"
          ]
        },
        "requests": {
          "meter": "Solicitudes utilizadas este mes",
          "badge": "API · MCP",
          "title": "1 solicitud = 1 llamada exitosa",
          "body": "Una solicitud es una llamada API exitosa, incluso cuando no devuelve resultados o datos parciales; Las llamadas fallidas no se cuentan. MCP las llamadas a herramientas se basan en la misma cuota de solicitudes.",
          "counted": "Llamada exitosa: contada",
          "notCounted": "Llamada fallida: no contada"
        },
        "reset": {
          "title": "Se reinicia en el 1st",
          "body": "El uso se restablece el día 1 de cada mes. Los registros y solicitudes no utilizados no se acumulan.",
          "limit": "Límite del plan",
          "unused": "Sin uso · no se da vuelta",
          "flag": "Reiniciar"
        }
      },
      "billing": {
        "head": {
          "kicker": "Facturación",
          "title": {
            "lead": "Facturación sencilla, ",
            "accent": "sin sorpresas",
            "tail": ""
          },
          "lead": "Cómo funcionan el pago, la renovación y las actualizaciones en las tres líneas de productos."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Paga cualquier plan a través de PayPal. Completa tu pago el PayPal y regresa aquí para activar tu plan."
          },
          "cadence": {
            "title": "Pago único",
            "body": "Cada plan pago cubre un mes natural. Paga una vez sin cargos automáticos; compra de nuevo cuando necesites otro mes."
          },
          "upgrade": {
            "title": "Actualiza pagando la diferencia",
            "body": "Mueva un plan activo a un nivel superior elegible a través de su proveedor de pagos actual. Su fecha de vencimiento y uso hasta ahora permanecen sin cambios."
          },
          "independent": {
            "title": "Planes independientes",
            "body": "Los planes en diferentes pestañas son independientes. Cuando un plan caduca, la cuenta vuelve automáticamente al nivel gratuito."
          }
        }
      },
      "plans": {
        "loading": "Cargando opciones de pago...",
        "loadFailed": "No se pudieron cargar las opciones de pago. Actualiza la página para volver a intentarlo.",
        "noChannels": "No hay ningún método de pago disponible para este plan en este momento.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Pago incompleto",
        "billingPeriodMonthly": "1 mes",
        "billingAutoRenew": "Se renueva automáticamente hasta que se cancele",
        "billingOneTime": "Pago único"
      },
      "upgrade": {
        "currentPlan": "Plan actual",
        "button": "Actualizar · {amount}",
        "title": "Actualiza tu plan",
        "confirm": "Confirmar actualización",
        "oneTime": "Diferencia única vía {channel}. Su fecha de caducidad se mantiene {date}.",
        "autoRenew": "La diferencia se cargará inmediatamente a través de {channel}. Su fecha de vencimiento permanece {date}; renovaciones futuras utilizan el precio del nuevo plan.",
        "pendingTitle": "Esperando tu actualización",
        "pendingDescription": "Su proveedor de pagos está aplicando la actualización. Su plan actual permanece activo hasta que se confirme.",
        "successTitle": "Plan actualizado",
        "successDescription": "Tu nueva cuota está activa. Su fecha de caducidad se mantiene en {date}.",
        "quoteFailed": "No se pudo cargar el precio de actualización. Actualiza la página para volver a intentarlo.",
        "failed": "No se pudo confirmar su actualización. Actualiza la página para verificar tu plan antes de volver a intentarlo.",
        "reasons": {
          "no_active_subscription": "Tu plan ya no está activo. Actualiza la página para elegir un plan.",
          "not_higher_tier": "Elija un nivel superior para actualizar o espere hasta que caduque su plan para cambiar de nivel.",
          "non_positive_diff": "El valor restante de su plan no es inferior a este nivel. Puede cambiar de nivel después de que caduque su plan.",
          "channel_unavailable": "Las actualizaciones no están disponibles con su método de pago actual. Puede cambiar de plan después del vencimiento."
        }
      },
      "faq": {
        "kicker": "Preguntas frecuentes",
        "title": {
          "lead": "",
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "lead": "Los conceptos básicos de facturación. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
        "contact": "Contactar con soporte",
        "items": [
          {
            "question": "¿Qué cuenta como récord?",
            "answer": "Un registro es una fila recopilada: la misma unidad que cuentan los planes gratuitos. En Extractor online ese es un negocio; en la extensión, cada negocio, reseña o fotografía que recopila es un registro. El correo electrónico y el enriquecimiento social no agregan registros. En la pestaña API, el uso se cuenta como solicitudes exitosas."
          },
          {
            "question": "¿Necesito un plan pago para probar MapsGrab?",
            "answer": "No. Cada producto tiene un nivel gratuito sin límite de tiempo: Extractor online y la extensión incluyen 1,000 registros por mes, y API incluye 20 solicitudes por mes. Los planes gratuitos de Extractor online y extensión no incluyen correo electrónico ni enriquecimiento de redes sociales. Los planes pagos en línea lo incluyen de forma predeterminada y puedes desactivarlo para cada tarea."
          },
          {
            "question": "¿Cómo se aplica la cuota a mi cuenta?",
            "answer": "La cuota se cuenta por cuenta iniciada (y por dispositivo de navegador para la extensión cuando no haya iniciado sesión). Inicie sesión con la cuenta propietaria del plan para que se aplique el límite más alto. Cuando un plan caduca, la cuenta vuelve automáticamente al nivel gratuito."
          },
          {
            "question": "¿Mi plan se renovará automáticamente?",
            "answer": "No. Todos los planes son pagos únicos de PayPal que cubren un mes natural. Cuando su plan caduca, regresa al nivel gratuito. Compra nuevamente para continuar con un plan pago."
          },
          {
            "question": "¿Puedo cambiar entre niveles?",
            "answer": "Puede actualizar un plan activo a un nivel superior elegible pagando la diferencia hasta PayPal. Su fecha de vencimiento y uso hasta ahora permanecen sin cambios. Los planes en diferentes pestañas son independientes."
          }
        ]
      },
      "cta": {
        "kicker": "empezar",
        "title": {
          "lead": "Comience en el ",
          "accent": "nivel gratuito",
          "tail": ""
        },
        "lead": "Cada producto tiene un nivel gratuito sin límite de tiempo: 1,000 registra un mes en la extensión y Extractor online, 20 solicita un mes en API.",
        "primary": "Instalar la extensión",
        "secondary": "Pruebe el extractor en línea",
        "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
      }
    },
    "extensionLogin": {
      "title": "Iniciar sesión en la extensión | MapsGrab",
      "description": "Inicie sesión para conectar su sesión del sitio web MapsGrab a la extensión del navegador.",
      "eyebrow": "Extensión del navegador",
      "heading": "Iniciar sesión en la extensión",
      "checkingState": "De cheques",
      "signInRequiredState": "Es necesario iniciar sesión",
      "confirmState": "Confirmar cuenta",
      "errorState": "Error",
      "preparingTitle": "Preparando su inicio de sesión",
      "preparingText": "Configurar el puente de inicio de sesión de la extensión.",
      "invalidParamsTitle": "Enlace de inicio de sesión no válido",
      "invalidParamsText": "A este enlace de inicio de sesión le faltan los parámetros de seguridad requeridos. Inicie sesión nuevamente desde la extensión.",
      "checkingSessionTitle": "Comprobando tu sesión",
      "checkingSessionText": "Verificando su sesión existente en el sitio web.",
      "finishingGoogleTitle": "Finalizando Google iniciar sesión",
      "finishingGoogleText": "Intercambiar su autorización Google por una sesión en el sitio web.",
      "signInRequiredTitle": "Inicia sesión para continuar",
      "signInRequiredText": "Inicie sesión para conectar la sesión de su sitio web a la extensión.",
      "signInButtonLabel": "Iniciar sesión",
      "confirmTitle": "Confirma tu cuenta",
      "confirmText": "La extensión solicita iniciar sesión con la cuenta a continuación. Continúe solo si acaba de iniciar sesión desde la extensión.",
      "continueButtonLabel": "Continuar",
      "useAnotherAccountLabel": "Usa otra cuenta",
      "issuingTitle": "Completando el inicio de sesión",
      "issuingText": "Emitir un código de inicio de sesión único para la extensión.",
      "issueFailedTitle": "algo salió mal",
      "retryButtonLabel": "Rever",
      "verificationFailedPrefix": "Error en la verificación del token del sitio web",
      "issueFailedPrefix": "Error al solicitar el código de inicio de sesión de la extensión",
      "googleSignInFailedPrefix": "Google error al iniciar sesión",
      "googleCompletionFailedPrefix": "Google no se pudo completar el inicio de sesión"
    },
    "online": {
      "seo": {
        "title": "Online Google Maps Scraper: ejecute extracción en la nube | MapsGrab",
        "description": "Ejecute Google Maps búsquedas de palabras clave en la nube, recopile datos comerciales y descargue una CSV por tarea."
      },
      "hero": {
        "announce": {
          "badge": "3 modos",
          "text": "Palabras clave, un área de mapa o regiones enteras"
        },
        "title": {
          "lead": "Google Maps extracción ",
          "accent": "en la nube,",
          "tail": " sin instalación"
        },
        "lead": "Envíe palabras clave, recopile detalles comerciales en la nube y descargue una CSV por tarea desde su panel.",
        "primaryCta": "Iniciar extracción",
        "pricingCta": "Ver precios",
        "meta": [
          "1,000 registros gratis/mes",
          "Funciona en cualquier navegador",
          "Un CSV deduplicado por tarea"
        ],
        "theater": {
          "files": "1 CSV · Guardado en Descargas",
          "csv": "CSV",
          "processed": "Procesado",
          "parallelChip": {
            "label": "Ejecución de palabras clave",
            "value": "En paralelo"
          },
          "billingChip": {
            "label": "Facturado por",
            "value": "Filas entregadas"
          }
        }
      },
      "facts": {
        "caption": "El extractor en línea de un vistazo",
        "items": [
          {
            "value": 37,
            "label": "columnas públicas, incluido un número de fila continuo"
          },
          {
            "value": 6,
            "label": "columnas de perfil social en planes pagos"
          },
          {
            "value": 50,
            "label": "buscar ubicaciones por tarea en modo mapa"
          },
          {
            "value": 60,
            "suffix": " mín.",
            "label": "ventana de recopilación para cada tarea"
          },
          {
            "value": 1000,
            "label": "discos gratis cada mes"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "como funciona",
          "title": {
            "lead": "Desde una vista previa rápida hasta una ",
            "accent": "exportación completa",
            "tail": ""
          },
          "lead": "Pruebe una palabra clave en la página de inicio sin una cuenta. Cuando desee la lista completa, inicie sesión y ejecútela como una tarea en su Panel de control."
        },
        "steps": [
          {
            "title": "Vista previa en la página de inicio",
            "description": "Una palabra clave, sin cuenta. Vea cuántas empresas contiene la primera página de resultados, con las primeras 3 filas."
          },
          {
            "title": "Iniciar sesión",
            "description": "Las vistas previas no se guardan y nunca utilizan su cuota. Después de iniciar sesión, envía la palabra clave nuevamente."
          },
          {
            "title": "Crea la tarea",
            "description": "En Panel de control > Extractor online, ingrese una palabra clave por línea, o deje que un área o regiones del mapa creen la lista."
          },
          {
            "title": "Las palabras clave se ejecutan en paralelo",
            "description": "Siga los estados de cola, recopilación y preparación CSV, luego completado, éxito parcial o error. Las tareas activas se actualizan cada 5 segundos."
          },
          {
            "title": "Descargar",
            "description": "Descargue uno CSV para toda la tarea cuando haya un archivo disponible. El éxito parcial mantiene las filas entregadas; cero resultados no tienen archivo."
          }
        ],
        "lock": "Regístrate para ver la lista completa",
        "email": "you@company.com",
        "links": {
          "preview": "Pruebe la vista previa de la página de inicio",
          "dashboard": "Abrir Panel › Scraper en línea"
        }
      },
      "modes": {
        "head": {
          "kicker": "Modos de búsqueda",
          "title": {
            "lead": "Tres formas de decir ",
            "accent": "dónde buscar",
            "tail": ""
          },
          "lead": "Escriba palabras clave línea por línea, pruebe un área de mapa alrededor de un punto central o convierta países, estados y ciudades en consultas listas para usar."
        },
        "tabsLabel": "Modo de búsqueda",
        "notes": {
          "keywords": "Una palabra clave por línea, hasta el límite de su plan",
          "map": "Muestra un círculo alrededor de un punto central",
          "regions": "Países, estados y ciudades desde GeoNames"
        },
        "keywords": {
          "hint": "Una palabra clave por línea. Las líneas en blanco y los duplicados se eliminan antes de contar, y toda la tarea produce un CSV deduplicado.",
          "blank": "Línea en blanco · omitida",
          "duplicate": "Duplicado · omitido",
          "limitsTitle": "Palabras clave por tarea",
          "limitsCaption": "por plan en línea",
          "limitsHint": "Iniciar scraping permanece deshabilitado mientras la lista está vacía, supera el límite de su plan o su cuota mensual está agotada."
        },
        "map": {
          "formula": "{keywords} palabras clave × {points} puntos de cuadrícula",
          "scale": "{value} kilómetros",
          "facts": [
            "Los puntos se buscan desde el centro hacia afuera.",
            "El círculo sólo coloca los centros de búsqueda; los resultados no se recortan en él.",
            "Una empresa encontrada a través de palabras clave o puntos se mantiene una vez en la tarea."
          ]
        },
        "regions": {
          "hint": "Puede editar las consultas generadas antes de enviarlas. Cada uno cuenta como una palabra clave.",
          "addCity": "Agregar ciudad"
        }
      },
      "results": {
        "head": {
          "kicker": "Resultados",
          "title": {
            "lead": "Una tarea, ",
            "accent": "una CSV",
            "tail": ""
          },
          "lead": "Descargue 37 columnas públicas en una CSV para toda la tarea, con números de fila continuos y negocios deduplicados en las búsquedas."
        },
        "csvMeta": "1 CSV · {count} filas entregadas",
        "rows": "{count} filas",
        "searches": "Filas entregadas por búsqueda",
        "notes": [
          "La fila 1 contiene los nombres de las columnas fijas en inglés, incluida la columna # continua.",
          "La fila 2 describe cada columna en el idioma de la interfaz utilizado al crear la tarea.",
          "Las tareas completadas con cero resultados no tienen archivo. El éxito parcial mantiene las filas entregadas.",
          "La fila de etiquetas nunca cuenta para sus registros."
        ],
        "language": "Idioma de la tarea: español",
        "rowLabel": "Fila",
        "legend": {
          "fields": "Fila 1 · nombres de campos",
          "labels": "Fila 2 · idioma de la tarea",
          "data": "Fila 3+ · negocios"
        },
        "more": "+{count} más columnas",
        "csvLabels": {
          "#": "Número de fila",
          "Name": "Nombre comercial",
          "Fulladdress": "dirección completa",
          "Categories": "Categorías de negocios",
          "Phone": "teléfono principal",
          "Review Count": "Número de reseñas",
          "Average Rating": "Calificación promedio de revisión",
          "Website": "Sitio web empresarial",
          "Emails": "Correos electrónicos de sitios web públicos",
          "Search Keyword": "Buscar palabra clave"
        }
      },
      "features": {
        "head": {
          "kicker": "Capacidades",
          "title": {
            "lead": "Qué hace el Scraper en línea ",
            "accent": "",
            "tail": ""
          },
          "lead": "Detalles comerciales recopilados en la nube, con correos electrónicos y perfiles sociales opcionales en planes pagos."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Tareas de palabras clave",
            "description": "Envíe tipos de empresas y ubicaciones como palabras clave independientes. Su plan determina el límite de palabras clave y la cuota de registros mensuales.",
            "meta": "2 · 5 · 10 · 20 · 50 palabras clave por tarea"
          },
          {
            "id": "history",
            "title": "Historial de tareas",
            "description": "Siga el progreso de la tarea y vea el recuento de registros de cada palabra clave en su panel.",
            "meta": "Completado · Éxito parcial · Fallido"
          },
          {
            "id": "details",
            "title": "Detalles del negocio",
            "description": "Recopile nombres, direcciones, números de teléfono, sitios web, calificaciones, horarios, coordenadas e identificadores de lugares cuando estén disponibles.",
            "meta": "37 columnas públicas por empresa"
          },
          {
            "id": "enrichment",
            "title": "Correo electrónico y enriquecimiento social",
            "description": "Con un plan en línea pago, los sitios web comerciales se verifican en busca de direcciones de correo electrónico y perfiles sociales de forma predeterminada. Puede desactivar esto para cada tarea.",
            "meta": "Planes pagos · activados de forma predeterminada"
          },
          {
            "id": "downloads",
            "title": "Una tarea CSV",
            "description": "Descargue la tarea completa como una CSV cuando haya un archivo disponible. No se necesitan archivos por búsqueda.",
            "meta": "{job}.csv · 37 columnas"
          },
          {
            "id": "browser",
            "title": "Nada que instalar",
            "description": "Se ejecuta en la nube desde cualquier navegador: Edge, Firefox o cualquier otro. Descargue los resultados de su historial de tareas.",
            "meta": "Borde · Firefox · cualquier navegador"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Uso",
          "title": {
            "lead": "Facturado por filas ",
            "accent": ", en realidad obtienes",
            "tail": ""
          },
          "lead": "Las tareas en línea se miden según las filas comerciales entregadas una vez que se completa la tarea. No se reserva nada cuando lo envía y la fila de etiquetas en cada CSV nunca se cuenta."
        },
        "checks": [
          "Enviar una tarea no reserva nada de tu cuota",
          "Una tarea que ya se está ejecutando finaliza, incluso si supera la cuota restante.",
          "Una vez que se agota la cuota, no se pueden enviar nuevas tareas.",
          "El uso se restablece el 1 primero en New York tiempo; los registros no utilizados no se transfieren"
        ],
        "mock": {
          "recordsLabel": "Récords este mes",
          "left": "{count} queda",
          "exhausted": "Cupo agotado",
          "task": "Tarea {id}…",
          "pending": "Entregado hasta el momento · contado cuando se completa la tarea",
          "counted": "Contado para este mes",
          "rows": "{count} filas",
          "running": "Correr",
          "delta": "+{count} registros"
        }
      },
      "plans": {
        "head": {
          "kicker": "Planes Scraper en línea",
          "title": {
            "lead": "Extracción en la nube, ",
            "accent": "precio por registros",
            "tail": ""
          },
          "lead": "Ejecute el motor MapsGrab en nuestra infraestructura. Un récord es una fila comercial entregada; Los planes pagos incluyen correo electrónico y enriquecimiento social sin costo adicional."
        },
        "specs": {
          "keywords": "Palabras clave por tarea",
          "contacts": "Correos electrónicos y redes sociales",
          "included": "Activado de forma predeterminada",
          "excluded": "No incluido"
        },
        "note": "Pago único que cubre un mes natural: los planes en línea no se renuevan automáticamente. El uso se restablece el 1 primero en New York tiempo y los registros no utilizados no se renuevan.",
        "compare": "Compara todos los planes"
      },
      "faq": {
        "kicker": "Preguntas frecuentes",
        "title": {
          "lead": "",
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "lead": "Las respuestas cortas. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
        "contact": "Contactar con soporte",
        "items": [
          {
            "question": "¿En qué se diferencia Extractor online de la extensión?",
            "answer": "La extensión recopila datos en su navegador. Extractor online ejecuta tareas de palabras clave en la nube y entrega los resultados a su panel."
          },
          {
            "question": "¿De dónde provienen los datos? ¿Es legal recopilarlos?",
            "answer": "MapsGrab solo recopila información que se muestra públicamente en Google Maps: los mismos detalles que cualquier visitante puede leer. No accedemos a cuentas privadas, contenido privado ni datos no públicos."
          },
          {
            "question": "¿A qué formatos puedo exportar?",
            "answer": "Las tareas con resultados entregan una UTF-8 CSV con 37 columnas públicas, números de fila continuos y dos filas de encabezado. Las empresas se deduplican en todas las búsquedas. Las tareas sin resultados no tienen archivo."
          },
          {
            "question": "¿Cuánto cuesta?",
            "answer": "Extractor online sigue los planes MapsGrab en la página de Precios, incluida la cuota mensual gratuita de registros. Los planes pagos aumentan los límites cuando necesitas más."
          },
          {
            "question": "¿Necesito un plan pago para correos electrónicos y perfiles sociales?",
            "answer": "Online Free no incluye correo electrónico ni enriquecimiento de redes sociales. Los planes pagos en línea lo incluyen de forma predeterminada y puedes desactivarlo para cada tarea. La elección se fija una vez enviada la tarea."
          },
          {
            "question": "¿Cuánto tiempo puede durar una tarea?",
            "answer": "Cada tarea tiene una ventana de recopilación de 60 minutos. El éxito parcial puede generar filas recopiladas y cualquier correo electrónico o perfil encontrado. Su historial muestra si un CSV está disponible."
          },
          {
            "question": "¿Se guarda la vista previa de mi página de inicio cuando inicio sesión?",
            "answer": "No. La vista previa de la página de inicio es un vistazo rápido que no se almacena. Después de iniciar sesión, abra Extractor online en su Panel de control y envíe la palabra clave nuevamente como una tarea completa."
          }
        ]
      },
      "cta": {
        "kicker": "empezar",
        "title": {
          "lead": "Ponga en cola su primera ",
          "accent": "tarea en la nube",
          "tail": ""
        },
        "lead": "Envíe palabras clave, siga el progreso de su tarea y descargue datos comerciales desde su panel.",
        "primary": "Iniciar extracción",
        "secondary": "Ver precios",
        "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
      }
    },
    "apiPage": {
      "switchLabel": "API puntos finales",
      "switchItems": {
        "search": "Extractor",
        "reviews": "Reseñas",
        "photos": "Fotos"
      },
      "primaryCta": "Obtener la clave API",
      "pricingCta": "Ver precios",
      "console": {
        "label": "Ejemplo API solicitud y respuesta",
        "langLabel": "Solicitar idioma",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Solicitud de copia",
        "replay": "Solicitud de repetición",
        "ready": "Listo",
        "composing": "Redactando solicitud...",
        "sending": "Enviando solicitud…",
        "done": "Respuesta · 200 Aceptar · aplicación/json",
        "waiting": "// esperando respuesta…",
        "response": "Ejemplo de respuesta"
      },
      "endpoints": {
        "kicker": "Puntos finales",
        "title": {
          "lead": "Una clave. ",
          "accent": "Tres",
          "tail": " puntos finales."
        },
        "lead": "Busca lugares y pasa su `fid` a la API de reseñas o fotos. Las tres API comparten una clave y la cuota mensual de solicitudes.",
        "here": "estas aqui",
        "paramsLabel": "Parámetros",
        "mcp": {
          "title": "¿Construir con agentes de IA?",
          "description": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP.",
          "link": "Explorar MCP"
        }
      },
      "chain": {
        "kicker": "Puntos finales de cadena",
        "title": {
          "lead": "",
          "accent": "Extractor → Reseñas / Fotos",
          "tail": ""
        },
        "lead": "Busca lugares y pasa su `fid` a la API de reseñas o fotos. Las tres API comparten una clave y la cuota mensual de solicitudes.",
        "label": "Busca lugares y pasa su fid a la API de reseñas o fotos. Las tres API comparten una clave y la cuota mensual de solicitudes.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 reseñas"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 reseñas"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 reseñas"
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
          "note": "El status correcto es partial; reason explica por qué se detuvo la recopilación. reported_total es la cifra indicada por el origen o null, no el tamaño verificado del álbum."
        }
      },
      "reference": {
        "kicker": "Referencia",
        "title": {
          "lead": "Solicitud de entrada, ",
          "accent": "JSON",
          "tail": " de salida"
        },
        "lead": "Envíe su clave como `Authorization: Bearer YOUR_API_KEY` con cuerpo JSON. Cada respuesta está envuelta en `{code, data, msg}`, y `code` 10000 significa éxito.",
        "baseUrl": "Base URL",
        "copyBaseUrl": "Copiar base URL",
        "request": "Pedido",
        "response": "Respuesta",
        "columns": {
          "parameter": "Parámetro",
          "field": "Campo",
          "type": "Tipo",
          "description": "Descripción",
          "example": "Ejemplo"
        },
        "required": "requerido",
        "groupsLabel": "Grupos de campo",
        "notes": [
          {
            "icon": "gauge",
            "title": "Una solicitud por llamada exitosa",
            "description": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
          },
          {
            "icon": "key",
            "title": "A 401 significa verificar su clave",
            "description": "Una clave faltante o no válida devuelve HTTP 401. Otros errores devuelven HTTP 200 con un no 10000 `code` y un `msg`."
          },
          {
            "icon": "locate",
            "title": "La ubicación es un sesgo, no una valla.",
            "description": "`ll` le indica a Maps dónde buscar. Aún pueden aparecer lugares fuera de esa vista."
          },
          {
            "icon": "target",
            "title": "Nombra el lugar",
            "description": "Coloque una ciudad, estado o ZIP en `q`: “cerca de mí” no tiene nada a qué anclarse en un servidor."
          }
        ]
      },
      "plans": {
        "kicker": "API planes",
        "title": {
          "lead": "Acceso programático, ",
          "accent": "precio por solicitudes",
          "tail": ""
        },
        "lead": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
      },
      "faq": {
        "lead": "Las respuestas cortas. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
        "contact": "Contactar con soporte"
      },
      "cta": {
        "kicker": "empezar",
        "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps API de extracción — Datos comerciales en JSON | MapsGrab",
        "description": "El MapsGrab API de extracción devuelve Google Maps resultados de búsqueda como JSON: nombre, dirección, teléfono, sitio web, calificación, horario, coordenadas, Place ID y fid, además de correos electrónicos y perfiles sociales a pedido."
      },
      "hero": {
        "title": {
          "lead": "API de ",
          "accent": "extracción",
          "tail": " de Google Maps"
        },
        "lead": "Envíe una palabra clave superior a HTTPS y obtenga Google Maps negocios como JSON: nombre, dirección, teléfono, sitio web, calificación, horario de apertura, coordenadas, Place ID y fid, además de correos electrónicos y perfiles sociales a pedido.",
        "meta": [
          "Plan gratuito: {quota}",
          "Una clave para búsqueda y reseñas",
          "JSON más de HTTPS"
        ],
        "chips": [
          {
            "label": "Por plaza",
            "value": "29 campos de datos"
          },
          {
            "label": "Por página",
            "value": "Hasta 20 plazas"
          }
        ]
      },
      "endpoint": {
        "name": "API de extracción",
        "description": "Empresas para cualquier palabra clave y ubicación opcional: 29 campos por lugar, además de correos electrónicos y perfiles sociales con `extra`.",
        "link": "Explora el extractor API"
      },
      "caps": {
        "title": {
          "lead": "Lo que devuelve el ",
          "accent": "API de extracción",
          "tail": ""
        },
        "lead": "Una palabra clave y un sesgo de ubicación opcional; los lugares que muestra una búsqueda Google Maps, según la estructura JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Buscar por palabra clave y ubicación",
            "description": "Envíe `q` con un sesgo de ubicación `ll` opcional. `page` establece cuántas páginas de resultados se recopilarán, 1–10, hasta 20 coloca cada una, todo en una sola respuesta."
          },
          {
            "icon": "table",
            "title": "29 campos por lugar",
            "description": "Nombre, categorías, dirección completa, teléfono, sitio web, recuento de calificaciones y reseñas, horario de apertura, coordenadas, Place ID, CID, fid, propietario y más."
          },
          {
            "icon": "mail",
            "title": "Correo electrónico y enriquecimiento social",
            "description": "Establezca `extra` en `true` para agregar `emails` y `medias`: perfiles de Instagram, Facebook, YouTube, TikTok, LinkedIn y X que se encuentran en cada sitio web comercial."
          },
          {
            "icon": "braces",
            "title": "Limpio, predecible JSON",
            "description": "snake_case campos en un sobre `{code, data, msg}`. Los valores Google Maps no se muestran como `null` o como una lista vacía, nunca como cadenas vacías."
          },
          {
            "icon": "layers",
            "title": "Los datos parciales están marcados",
            "description": "Si no se pueden completar algunos detalles, aún obtendrás los lugares, con `partial` configurado en `true` y `warnings` indicando lo que falta."
          },
          {
            "icon": "shield",
            "title": "Solo datos públicos",
            "description": "Los resultados contienen solo lo que Google Maps muestra públicamente: los mismos detalles que cualquier visitante puede leer."
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
            "description": "Qué buscar, hasta 300 caracteres: un tipo de negocio más un lugar, p. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Cuántas páginas de resultados recopilar, 1–10, hasta 20 lugares cada una, todas devueltas en una sola respuesta. La recopilación se detiene antes de tiempo cuando una página tiene menos de 20 lugares o nada nuevo. Predeterminado `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Idioma del resultado, p. `en` o `fr`. Predeterminado `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Sesgo de ubicación opcional como `@lat,lng,zoom`, zoom 0–21. Le indica a Maps dónde buscar; los resultados no se recortan a un radio."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` agrega `emails` y `medias` a cada lugar. Predeterminado `false`."
          }
        ],
        "groups": [
          {
            "label": "Identidad",
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
            "label": "Contacto",
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
            "label": "Ubicación",
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
            "label": "Calificaciones",
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
            "label": "Perfil",
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
            "label": "Página",
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
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "items": [
          {
            "question": "¿Qué devuelve el API de extracción?",
            "answer": "JSON con hasta 20 lugares por página recopilada. Cada lugar tiene campos 29: nombre, categorías, dirección, teléfono, sitio web, calificación, recuento de reseñas, horario de apertura, coordenadas, Place ID, CID, fid y más, además de correos electrónicos y perfiles sociales cuando el extra es cierto."
          },
          {
            "question": "¿Cómo me autentico?",
            "answer": "Envíe su clave MapsGrab API como token al portador en el encabezado Authorization. Cada cuenta tiene una clave. Se muestra en su totalidad solo cuando la genera, y generar una nueva clave desactiva la anterior inmediatamente."
          },
          {
            "question": "¿Cómo se cuentan las solicitudes?",
            "answer": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
          },
          {
            "question": "¿Qué hace la página?",
            "answer": "página es cuántas páginas de resultados se deben recopilar en una llamada, desde 1 hasta 10. Cada página suma 20 lugares y la recopilación se detiene antes de tiempo cuando Google Maps no tiene nada nuevo. No es un número de página."
          },
          {
            "question": "¿Los datos son públicos?",
            "answer": "Sí. El API solo devuelve información que se muestra públicamente en Google Maps, los mismos detalles que cualquier visitante puede leer. No accede a cuentas privadas ni a datos no públicos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Pon los datos de Maps en tu ",
          "accent": "aplicación",
          "tail": ""
        },
        "lead": "Una solicitud HTTP por búsqueda, estructurada JSON en la respuesta, para CRM, canales de datos y sus propios productos."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Reseñas Extractor API — Reseñas en JSON | MapsGrab",
        "description": "Las MapsGrab Reseñas API devuelven las reseñas públicas de una Google Maps empresa como JSON: calificación, texto y traducción, autor, fecha, fotos de reseñas y respuestas del propietario, hasta 60 por página con un cursor."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Reseñas",
          "tail": " Extractor API"
        },
        "lead": "Solicite las reseñas públicas de cualquier Google Maps empresa por su fid y obtenga una respuesta estructurada JSON: calificación, texto y traducción, autor, fecha, fotos de reseñas y respuestas del propietario, página por página con un cursor.",
        "meta": [
          "Plan gratuito: {quota}",
          "Hasta 60 reseñas por página",
          "JSON más de HTTPS"
        ],
        "chips": [
          {
            "label": "Por página",
            "value": "Hasta 60 reseñas"
          },
          {
            "label": "Ordenar por",
            "value": "Relevancia · más reciente · calificación"
          }
        ]
      },
      "endpoint": {
        "name": "API de reseñas",
        "description": "Reseñas públicas de una empresa por `fid`: hasta 60 por página, ordenadas a su manera y paginadas con un cursor.",
        "link": "Explora las reseñas API"
      },
      "caps": {
        "title": {
          "lead": "Lo que devuelve el ",
          "accent": "Reseñas API",
          "tail": ""
        },
        "lead": "Cada reseña pública de una empresa (calificaciones, texto, autores, fotografías y respuestas de los propietarios) es una página por solicitud.",
        "items": [
          {
            "icon": "review",
            "title": "Reseñas de fid",
            "description": "Diríjase a una empresa por el `fid` de cualquier resultado de API de extracción, luego pase `next_cursor` hacia atrás para leer la página siguiente, hasta 60 reseñas cada una."
          },
          {
            "icon": "filter",
            "title": "Ordenado a tu manera",
            "description": "`sort_by` devuelve primero las reseñas más relevantes (1), más nuevas (2), mejor calificadas (3) o peor calificadas (4)."
          },
          {
            "icon": "list",
            "title": "Texto, traducción y fechas.",
            "description": "Calificación, texto de revisión, `translated_text` y `language`, con `published_at_ms` y una fecha relativa para cada revisión."
          },
          {
            "icon": "user",
            "title": "Detalles del autor",
            "description": "Nombre del autor y enlace del perfil, recuento de reseñas del autor y estado de Local Guide."
          },
          {
            "icon": "image",
            "title": "Fotos y respuestas del propietario.",
            "description": "`images` enumera la foto URLs adjunta a una reseña; `owner_response` lleva la respuesta del propietario y `owner_response_at_ms` su hora."
          },
          {
            "icon": "shield",
            "title": "Solo datos públicos",
            "description": "Solo las reseñas se muestran públicamente en Google Maps: el mismo contenido que cualquier visitante puede leer."
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
            "description": "ID de función empresarial, p. `0x5495…:0xbeb4…`. Cada lugar de API de extracción lo incluye."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "El `next_cursor` de la página anterior. Omítelo en la primera página."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` más relevante · `2` más nuevo · `3` calificación más alta · `4` calificación más baja. Predeterminado `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Código de idioma, p.e. `en`. Predeterminado `en`."
          }
        ],
        "groups": [
          {
            "label": "Revisar",
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
            "label": "Respuesta del propietario",
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
            "label": "Página",
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
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "items": [
          {
            "question": "¿Cómo me dirijo a un negocio específico?",
            "answer": "Con su fid, la función ID incluye cada lugar de API de extracción. El Place ID Finder gratuito también lee el FID de cualquier Google Maps lugar URL."
          },
          {
            "question": "¿Qué campos incluye una reseña?",
            "answer": "ID de revisión, calificación, texto con su traducción e idioma, hora de publicación y fecha relativa, nombre del autor, enlace del perfil, recuento de reseñas y estado de Local Guide, fotos adjuntas y el propietario responde con su tiempo."
          },
          {
            "question": "¿Cuántas reseñas puedo recopilar?",
            "answer": "Cada solicitud devuelve una página de hasta 60 reseñas más un next_cursor. Páselo de nuevo para leer la página siguiente; cuando next_cursor es nulo, no hay más páginas."
          },
          {
            "question": "¿Cómo se cuentan las solicitudes?",
            "answer": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
          },
          {
            "question": "¿Los datos son públicos?",
            "answer": "Sí. El API solo devuelve reseñas mostradas públicamente en Google Maps, el mismo contenido que cualquier visitante puede leer. No accede a cuentas privadas ni a datos no públicos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Supervisar reseñas ",
          "accent": "a escala",
          "tail": ""
        },
        "lead": "Hilos de revisión de Cursor páginas en limpio JSON: para seguimiento, investigación y presentación de informes."
      }
    },
    "photosApi": {
      "seo": {
        "title": "API de fotos — URL de fotos públicas de negocios | MapsGrab",
        "description": "Obtén las URL de fotos públicas de un negocio en JSON mediante su fid. max_results limita la entrega; los resultados son parciales y no garantizan el álbum completo."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Fotos",
          "tail": " API"
        },
        "lead": "Obtén las URL de fotos públicas de un negocio en JSON mediante su fid. max_results limita la entrega; los resultados son parciales y no garantizan el álbum completo.",
        "meta": [
          "Plan gratuito: {quota}",
          "URL de fotos públicas de negocios",
          "precio por solicitudes"
        ],
        "chips": [
          {
            "label": "Entrega",
            "value": "partial"
          },
          {
            "label": "Cantidad",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "API de fotos",
        "description": "Obtén las URL de fotos públicas de un negocio en JSON mediante su fid. max_results limita la entrega; los resultados son parciales y no garantizan el álbum completo.",
        "link": "Explorar la API de fotos"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "API de fotos",
          "tail": ""
        },
        "lead": "URL de fotos públicas de negocios",
        "items": [
          {
            "icon": "image",
            "title": "Fotos por fid",
            "description": "Usa el `fid` de una búsqueda o de Place ID Finder. Cada elemento de `photos` contiene una `url` de foto pública."
          },
          {
            "icon": "filter",
            "title": "Limita cada solicitud",
            "description": "`max_results` es un entero positivo, con valor predeterminado 200. Puede haber menos fotos que el límite. No hay páginas ni cursor."
          },
          {
            "icon": "list",
            "title": "Consulta el estado de entrega",
            "description": "El `status` correcto es `partial`; `reason` explica por qué se detuvo la recopilación. `reported_total` es la cifra indicada por el origen o `null`, no el tamaño verificado del álbum."
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
            "description": "FID del negocio obtenido en una búsqueda o en Place ID Finder, con formato `0x…:0x…` y de 12 a 20 dígitos hexadecimales por segmento."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Límite de entrega positivo; 200 de forma predeterminada. No garantiza esa cantidad de fotos."
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
            "label": "Entrega",
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
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "items": [
          {
            "question": "¿Cómo solicito fotos de un negocio?",
            "answer": "Envía POST a /photos con fid y, opcionalmente, max_results. Usa la misma clave Bearer que en las API de búsqueda y reseñas."
          },
          {
            "question": "¿Recibiré el álbum completo?",
            "answer": "El status correcto es partial; reason explica por qué se detuvo la recopilación. reported_total es la cifra indicada por el origen o null, no el tamaño verificado del álbum. max_results es un entero positivo, con valor predeterminado 200. Puede haber menos fotos que el límite. No hay páginas ni cursor."
          },
          {
            "question": "¿Cómo obtengo la fid de una empresa?",
            "answer": "Cada lugar de API de extracción incluye su fid, y el Place ID Finder gratuito lee el FID de cualquier Google Maps lugar URL."
          },
          {
            "question": "¿Cómo se cuentan las solicitudes?",
            "answer": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
          },
          {
            "question": "¿Los datos son públicos?",
            "answer": "Sí. La imagen URLs apunta a fotografías que se muestran públicamente en Google Maps: las mismas imágenes que cualquier visitante puede ver."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Lleva las fotos de negocios a tu aplicación",
          "tail": ""
        },
        "lead": "Usa tu clave API para obtener URL de fotos públicas y su estado de entrega."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps MCP de extracción Servidor | MapsGrab",
        "description": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Conecte su agente",
      "hero": {
        "kicker": "MCP servidor",
        "title": {
          "lead": "Servidor ",
          "accent": "MCP",
          "tail": " de extracción de Google Maps"
        },
        "lead": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP.",
        "meta": [
          "Streamable HTTP",
          "Iniciar sesión con OAuth",
          "Plan gratuito: {quota}"
        ],
        "chips": [
          {
            "label": "Transporte",
            "value": "Streamable HTTP"
          },
          {
            "label": "Resultados de la herramienta",
            "value": "Estructurado JSON"
          }
        ]
      },
      "agent": {
        "label": "Ejemplo de sesión de agente: una pregunta sobre negocios locales, una llamada de herramienta MapsGrab con resultados estructurados y la respuesta del agente",
        "session": "Sesión de agente",
        "connected": "MCP servidor {server} conectado",
        "placeholder": "Pregunta por cualquier lugar en Google Maps…",
        "thinking": "Pensamiento…",
        "running": "correr",
        "scenes": [
          {
            "prompt": "Encuentre dentistas en Austin, TX con calificación 4.8 o superior e indique sus números de teléfono.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 lugares",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 más lugares"
              }
            ],
            "answer": [
              "Se califican tres de los primeros 20 resultados ",
              {
                "strong": "4.8 o superior"
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
            "prompt": "¿Qué dice la gente en las reseñas más recientes de Ember & Oak Coffee en Portland?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 lugar",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 reseñas",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Principalmente ",
              {
                "strong": "5-estrella"
              },
              " — la gente elogia el espresso y el amable personal. La única nota recurrente: ",
              {
                "strong": "los asientos son reducidos los fines de semana"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "¿Qué plomeros en Chicago no incluyen un sitio web? Ponlos en una mesa.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 lugares",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 más lugares"
              }
            ],
            "answer": [
              {
                "strong": "4 de 20"
              },
              " no tiene ningún sitio web en la lista. Los tres primeros:"
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
            "prompt": "Obtenga las reseñas con las calificaciones más bajas de Rose City Roasters y redacte respuestas educadas.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 lugar",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 reseñas",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Las calificaciones más bajas mencionan principalmente ",
              {
                "strong": "servicio lento en horas pico"
              },
              ". ",
              {
                "strong": "2 del 3"
              },
              " Aún no tengo respuesta del propietario; redacté uno para cada uno."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Herramientas",
        "title": {
          "lead": "Lo que el servidor MCP ",
          "accent": " expone",
          "tail": ""
        },
        "lead": "Tres herramientas: Search / Reviews / Photos.",
        "kind": "Herramienta",
        "returns": "Devoluciones",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Buscar lugares",
            "description": "Búsquedas de palabras clave y ubicación que devuelven lo que muestra una búsqueda Google Maps: nombres, teléfonos, clasificaciones, horas, coordenadas, ID de lugares y fids.",
            "args": [
              {
                "name": "q",
                "description": "Palabra clave más ciudad, estado o ZIP"
              },
              {
                "name": "page",
                "description": "Páginas de resultados para recopilar, 1–10 · hasta 20 lugares cada una"
              },
              {
                "name": "hl",
                "description": "Idioma del resultado, p. `en`"
              },
              {
                "name": "ll",
                "description": "Sesgo de ubicación, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` agrega correos electrónicos y perfiles sociales"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Mismos datos que el API de extracción"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Lista de reseñas",
            "description": "Calificaciones, texto de reseñas, autores, fechas, fotografías y respuestas de propietarios para cualquier negocio que su agente esté investigando.",
            "args": [
              {
                "name": "fid",
                "description": "Desde cualquier resultado de búsqueda"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` de la última página; omitir por primera vez"
              },
              {
                "name": "sort_by",
                "description": "1 relevante · 2 más nuevo · 3 más alto · 4 más bajo"
              },
              {
                "name": "hl",
                "description": "Idioma, p.e. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Mismos datos que las Reseñas API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Fotos por fid",
            "description": "Obtén las URL de fotos públicas de un negocio en JSON mediante su fid. max_results limita la entrega; los resultados son parciales y no garantizan el álbum completo.",
            "args": [
              {
                "name": "fid",
                "description": "FID del negocio obtenido en una búsqueda o en Place ID Finder, con formato `0x…:0x…` y de 12 a 20 dígitos hexadecimales por segmento."
              },
              {
                "name": "max_results",
                "description": "Límite de entrega positivo; 200 de forma predeterminada. No garantiza esa cantidad de fotos."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Explorar la API de fotos"
          }
        ]
      },
      "flow": {
        "kicker": "como se conecta",
        "title": {
          "lead": "Un punto final entre su agente y ",
          "accent": "datos de Live Maps",
          "tail": ""
        },
        "lead": "Su cliente se conecta a través de Streamable HTTP e inicia sesión a través de su navegador. El agente descubre las herramientas, las llama cuando un mensaje necesita datos de Maps y lee el JSON estructurado.",
        "label": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP clientes",
        "anyClient": "Cualquier cliente MCP",
        "toolsLabel": "Herramientas",
        "hub": "MapsGrab MCP",
        "publicData": "Datos públicos Google Maps",
        "resultLabel": "resultado",
        "results": [
          "20 lugares",
          "60 reseñas",
          "2 Fotos"
        ],
        "steps": [
          {
            "title": "Conectar",
            "description": "Agregue el punto final a su cliente y luego inicie sesión en MapsGrab a través de su navegador."
          },
          {
            "title": "Descubrir",
            "description": "Su agente enumera las MapsGrab herramientas y sus esquemas de entrada."
          },
          {
            "title": "Llamar",
            "description": "Cuando un mensaje necesita datos de Maps, el agente llama a una herramienta y lee el resultado JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Configuración",
        "title": {
          "lead": "Un bloque de configuración ",
          "accent": "por cliente",
          "tail": ""
        },
        "lead": "Dirija a su cliente al punto final MapsGrab e inicie sesión a través de su navegador: no hay clave API para copiar, ni SDK, ni proceso local para ejecutar.",
        "tabsLabel": "MCP cliente",
        "copy": "Copiar configuración",
        "clients": {
          "claude": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Agregar el servidor",
                "description": "Ejecute el comando para registrar `mapsgrab` sobre HTTP."
              },
              {
                "title": "Iniciar sesión",
                "description": "En Claude Code, ejecute `/mcp`, elija `mapsgrab` y autentíquese: MapsGrab se abre en su navegador para que lo apruebe."
              },
              {
                "title": "Solicitar datos de Maps",
                "description": "Claude Code enumera las herramientas MapsGrab y las llama cuando un mensaje las necesita."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Editar mcp.json",
                "description": "Agregue el bloque a `~/.cursor/mcp.json` para cada proyecto, o `.cursor/mcp.json` para uno."
              },
              {
                "title": "Iniciar sesión",
                "description": "En Configuración de Cursor → MCP, haga clic en Conectar junto a `mapsgrab` y apruebe en su navegador."
              },
              {
                "title": "Usa las herramientas",
                "description": "`mapsgrab` muestra sus herramientas en la lista de servidores MCP, listas para el agente."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Agregue .vscode/mcp.json",
                "description": "Pegue el bloque: solo contiene el punto final URL, nada secreto."
              },
              {
                "title": "Iniciar sesión",
                "description": "Inicie el servidor. VS Code solicita autenticarse con MapsGrab y abre su navegador para aprobar."
              },
              {
                "title": "Usar el modo agente",
                "description": "Abra Chat en modo agente y habilite las herramientas MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "Terminal",
            "steps": [
              {
                "title": "Agregar el servidor",
                "description": "Ejecute `codex mcp add` para registrar `mapsgrab` mediante URL."
              },
              {
                "title": "Iniciar sesión",
                "description": "Ejecute `codex mcp login mapsgrab` y apruebe MapsGrab en su navegador."
              },
              {
                "title": "Empezar Codex",
                "description": "Carga nuevas sesiones `mapsgrab` y sus herramientas."
              }
            ]
          }
        },
        "apiKey": {
          "title": "¿No puedes iniciar sesión desde un navegador? Utilice una clave API",
          "description": "Si su cliente no admite la autorización MCP o se ejecuta en un servidor o en CI, agregue su clave API como encabezado `Authorization`. Mantenga la clave en una variable de entorno o en la entrada secreta de su cliente, no en un archivo de configuración compartido.",
          "link": "Obtener la clave API",
          "snippet": "Cualquier cliente HTTP"
        },
        "spec": {
          "title": "Cualquier otro cliente MCP",
          "subtitle": "MCP Inspector incluido",
          "transport": "Transporte",
          "transportValue": "Streamable HTTP",
          "endpoint": "Punto final",
          "copyEndpoint": "Copiar punto final",
          "auth": "autenticación",
          "authValue": "Inicio de sesión OAuth (alternativa: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Indicaciones de ejemplo",
        "title": {
          "lead": "Pregunta en lenguaje sencillo. ",
          "accent": "Recuperar filas.",
          "tail": ""
        },
        "lead": "Prospección, investigación de mercado local, seguimiento de reseñas: describa el trabajo y su agente decidirá a qué herramienta MapsGrab llamar.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Prospección",
              "quote": "\"Encuentre dentistas en Austin, TX con calificación 4.8 o superior e indique sus números de teléfono\".",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Reputación",
              "quote": "\"Resuma lo que dice la gente en las reseñas más recientes de Ember & Oak Coffee en Portland\".",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Listas de clientes potenciales",
              "quote": "\"Cree una lista de estudios de yoga en Denver con sus correos electrónicos y perfiles de Instagram\".",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "investigación de mercado",
              "quote": "\"Compare calificaciones y recuentos de reseñas de las cafeterías de Division St en Portland\".",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Enriquecimiento",
              "quote": "\"Agregue el Place ID, el teléfono y el sitio web de cada empresa en esta hoja de cálculo\".",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "El propietario responde",
              "quote": "\"Obtenga las reseñas con las calificaciones más bajas de Rose City Roasters y redacte respuestas educadas\".",
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
              "tag": "Brechas en el sitio web",
              "quote": "\"¿Qué fontaneros de Chicago no incluyen un sitio web? Ponlos en una tabla\".",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Horario de apertura",
              "quote": "“¿Qué talleres de reparación de automóviles cerca de 60614 abren los domingos?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Cartografía",
              "quote": "\"Exporta los restaurantes veganos en Brooklyn con coordenadas como GeoJSON\".",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Localización",
              "quote": "\"Busque panaderías en Lyon y devuelva los detalles del listado en francés\".",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Listados reclamados",
              "quote": "\"Compruebe qué gimnasios en Austin han reclamado su lista de empresas Google\".",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Guías locales",
              "quote": "\"¿Qué reseñas recientes de Hawthorne Bean Co. provienen de Local Guides?\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Tiempo de respuesta",
              "quote": "\"¿Estos salones responden a sus reseñas y cuánto tiempo tardan los propietarios en responder?\"",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Autenticación y datos",
        "title": {
          "lead": "Inicia sesión una vez. ",
          "accent": "Solo datos públicos.",
          "tail": ""
        },
        "lead": "Cada llamada al punto final MCP lleva una credencial de portador (un token OAuth para iniciar sesión o su clave API si su cliente no puede iniciar sesión) y cada resultado proviene de lo que Google Maps muestra públicamente.",
        "inspector": {
          "label": "Ejemplo de solicitud MCP con un encabezado portador Authorization y su respuesta JSON-RPC con contenido estructurado",
          "request": "Pedido",
          "response": "Respuesta",
          "verified": "Token verificado"
        },
        "items": [
          {
            "icon": "key",
            "title": "Iniciar sesión o recurrir a una clave",
            "description": "Inicie sesión a través de su navegador y apruebe el cliente. Los clientes sin autorización MCP pueden pasar su clave API como un token al portador; ambos acceden a las mismas herramientas."
          },
          {
            "icon": "eye",
            "title": "Lee Google Maps, nunca escribe",
            "description": "Las herramientas solo buscan y leen listados públicos. Lo único que cambia una llamada es el uso de su solicitud."
          },
          {
            "icon": "lock",
            "title": "No hay secretos en los archivos de configuración.",
            "description": "Al iniciar sesión, su configuración solo contiene el punto final URL. Si utiliza una clave API, manténgala en una variable de entorno, no en un archivo compartido."
          },
          {
            "icon": "shield",
            "title": "Revocar el acceso en cualquier momento",
            "description": "Los clientes que han iniciado sesión aparecen en el Panel → API, donde puede revocarlos. Generar una nueva clave API desactiva la anterior inmediatamente."
          }
        ]
      },
      "billing": {
        "kicker": "Precios",
        "title": {
          "lead": "Cubierto por su plan ",
          "accent": "API",
          "tail": ""
        },
        "lead": "El servidor MCP utiliza la misma cuota de solicitudes mensuales que API de extracción y API de reseñas. Cada llamada exitosa a la herramienta cuenta como una solicitud.",
        "compare": "Comparar planes API",
        "head": {
          "plan": "Plan",
          "requests": "Solicitudes mensuales",
          "scale": "(escala logarítmica)",
          "price": "Precio"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Preguntas frecuentes",
          "tail": ""
        },
        "items": [
          {
            "question": "¿Qué es el servidor MapsGrab MCP?",
            "answer": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP. search_places / list_reviews / list_photos."
          },
          {
            "question": "¿Qué clientes pueden conectarse?",
            "answer": "Cualquier cliente MCP que admita Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector y otros. Utilice el punto final URL exactamente como se muestra, incluida la barra diagonal."
          },
          {
            "question": "¿Cómo se autentica?",
            "answer": "Con el inicio de sesión de OAuth: Claude Code, Cursor, VS Code, Codex y otros clientes que admiten la autorización MCP, abra MapsGrab en su navegador; usted aprueba el cliente y puede revocarlo más tarde en Panel → API. Solo si su cliente no puede iniciar sesión, pase su clave API como token de portador en el encabezado Authorization."
          },
          {
            "question": "¿Cómo se cuentan las llamadas a herramientas?",
            "answer": "Cada llamada correcta cuenta como una solicitud, incluso si entrega fotos parciales, sin importar cuántas. Si no se pueden entregar fotos válidas, la llamada falla y no consume cuota. Búsquedas, reseñas, fotos y MCP comparten la cuota mensual."
          },
          {
            "question": "¿Puede mi agente obtener fotografías comerciales?",
            "answer": "list_photos(fid, max_results): Obtén las URL de fotos públicas de un negocio en JSON mediante su fid. max_results limita la entrega; los resultados son parciales y no garantizan el álbum completo. Límite de entrega positivo; 200 de forma predeterminada. No garantiza esa cantidad de fotos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Dale a tu agente ",
          "accent": "datos de mapas en vivo",
          "tail": ""
        },
        "lead": "Busca lugares en Google Maps, lee reseñas y obtén URL de fotos públicas de negocios mediante una conexión MCP."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Herramientas gratuitas",
        "guide": {
          "kicker": "Acerca de esta herramienta",
          "title": {
            "lead": "Qué hace y ",
            "accent": "cómo usarlo",
            "tail": ""
          },
          "lead": "Todo se ejecuta en su navegador: nada de lo que pegue o cargue sale de su dispositivo."
        },
        "related": {
          "kicker": "Herramientas relacionadas",
          "title": {
            "lead": "Más herramientas gratuitas para ",
            "accent": "Datos de mapas",
            "tail": ""
          },
          "lead": "Pequeñas utilidades que se ejecutan completamente en tu navegador: lo que pegas nunca sale de tu dispositivo."
        },
        "faq": {
          "kicker": "Preguntas frecuentes",
          "lead": "Las respuestas cortas. Cualquier otra cosa, el soporte está a un correo electrónico de distancia.",
          "contact": "Contactar con soporte"
        },
        "cta": {
          "kicker": "Extracción a granel",
          "primary": "Instalar MapsGrab",
          "secondary": "Ver precios",
          "note": "Cuota mensual gratuita incluida. Sin tarjeta de crédito."
        },
        "resultHeading": "Resultado",
        "copy": "Copiar",
        "copied": "Copiado al portapapeles.",
        "downloadCsv": "Descargar CSV",
        "genericError": "Algo salió mal. Verifique su entrada e inténtelo nuevamente."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder: obtenga un Google Maps Place ID de un URL | MapsGrab",
          "description": "Pegue un Google Maps en el lugar URL y obtenga su Place ID, CID y FID al instante. Buscador Place ID gratuito basado en navegador: sin iniciar sesión, su URL nunca sale de su dispositivo."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "Buscador",
            "tail": ""
          },
          "description": "Pegue un lugar Google Maps completo URL y lea sus Place ID, CID y FID con un solo clic. Todo se decodifica en su navegador: el URL nunca se carga."
        },
        "form": {
          "urlLabel": "Google Maps lugar URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Encuentra Place ID",
          "errorShortLink": "No se admiten enlaces cortos (maps.app.goo.gl). Abra el enlace en su navegador y pegue el URL completo de la barra de direcciones.",
          "errorInvalidUrl": "Esto no parece un lugar Google Maps URL. Abra un lugar en Google Maps y copie el URL completo (debe contener \"/maps/place/\" y \"@\" o \"data=\").",
          "errorNoIds": "No se encontraron identificadores de lugar en este URL. Asegúrate de haber copiado el URL de la página de un lugar, no de una página de resultados de búsqueda.",
          "examplesLabel": "Intentar",
          "examples": {
            "city": "san francisco",
            "business": "Cafetería · Portland",
            "shortLink": "enlace corto"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url de las dos FID mitades",
          "cidNote": "FID 2segunda mitad, hexadecimal → decimal",
          "fidNote": "últimos dos segmentos 0x… en el URL",
          "anatomy": {
            "fidHigh": "FID · 1primera mitad",
            "fidLow": "FID · 2segunda mitad",
            "empty": "Pegue un lugar URL: los identificadores que lleva se iluminan aquí."
          },
          "missing": "No en este enlace",
          "copyLabel": "Copiar {label}",
          "privacy": "Decodificado en su navegador: el URL nunca se carga."
        },
        "chips": [
          {
            "label": "Google API clave",
            "value": "No es necesario"
          },
          {
            "label": "Tu URL",
            "value": "Nunca subido"
          }
        ],
        "steps": {
          "head": {
            "kicker": "como funciona",
            "title": {
              "lead": "De un enlace de Maps a un ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "Sin clave API ni inicio de sesión: los identificadores ya están dentro del lugar URL que copias."
          },
          "items": [
            {
              "heading": "Abre el lugar en Google Maps",
              "body": "Busque la empresa y haga clic en su ficha para que se abra la página del lugar."
            },
            {
              "heading": "Copia el completo URL",
              "body": "Copie el URL largo de la barra de direcciones; contiene el nombre de la empresa, un segmento de coordenadas \"@\" y un parámetro \"data=\"."
            },
            {
              "heading": "Pegar y decodificar",
              "body": "Pégalo arriba y presiona \"Buscar Place ID\". Aparecen Place ID, CID y FID, cada uno con un botón de copia."
            }
          ],
          "copiedBadge": "Copiado",
          "note": "Los enlaces cortos como maps.app.goo.gl no se pueden decodificar sin seguirlos en todos los dominios, así que primero abra el enlace y pegue la dirección completa."
        },
        "identifiers": {
          "head": {
            "kicker": "Los identificadores",
            "title": {
              "lead": "Tres identificaciones, ",
              "accent": "un lugar",
              "tail": ""
            },
            "lead": "Un Place ID es el identificador estable de Google para una ubicación: una cadena que comienza con \"ChIJ\" que sigue siendo válida incluso si la empresa cambia de nombre o se muda."
          },
          "keys": {
            "placeId": "La cadena \"ChIJ...\" consumida por los Lugares API, los widgets de reseñas y los sistemas de reservas.",
            "fid": "Un par de valores hexadecimales que identifican internamente la misma característica.",
            "cid": "La forma decimal de la segunda mitad de FID, utilizada por Maps URLs y herramientas publicitarias más antiguas."
          },
          "derive": {
            "label": "Cómo se derivan Place ID y CID de FID",
            "source": "FID del URL",
            "protobuf": "protobuf · little-endian",
            "base64": "base64url",
            "secondHalf": "2segunda mitad",
            "hexToDecimal": "hexadecimal → decimal"
          },
          "features": [
            {
              "heading": "Sin clave API",
              "body": "El Place ID ya está codificado dentro del lugar URL que pegas, por lo que la herramienta puede decodificarlo sin conexión."
            },
            {
              "heading": "Sin límites de tarifas",
              "body": "No interviene ningún servicio de búsqueda: la conversión de Maps URL a Place ID es determinista."
            },
            {
              "heading": "Nunca subido",
              "body": "Todo el cálculo se ejecuta en la pestaña de su navegador: el URL que pega nunca se envía a ningún servidor."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Cambia alguna vez un Place ID?",
              "answer": "Casi nunca. Google documentos Coloque los ID como identificadores estables a largo plazo, pero una pequeña cantidad de ID se puede retirar cuando las ubicaciones se fusionan o reestructuran. Si un consumidor de Place ID lo informa como no válido, busque el lugar nuevamente y actualice el valor almacenado."
            },
            {
              "question": "¿Es el Place ID lo mismo que el CID?",
              "answer": "No. El CID es un identificador decimal utilizado por enlaces de mapas y herramientas publicitarias más antiguos, mientras que el Place ID es la cadena \"ChIJ...\" consumida por los Lugares API. Identifican la misma característica pero no son intercambiables, por lo que esta herramienta informa ambas."
            },
            {
              "question": "¿Por qué se rechaza mi enlace maps.app.goo.gl?",
              "answer": "Los enlaces cortos solo se resuelven en el lugar completo URL después de una redirección entre dominios, que una herramienta exclusiva del navegador no puede seguir sin enviar su enlace a un tercero. Abra el enlace corto en su navegador y pegue el URL completo que aparece en la barra de direcciones."
            },
            {
              "question": "¿Necesito una clave Google API para esto?",
              "answer": "No. El Place ID ya está codificado dentro del lugar URL que pegas, por lo que la herramienta puede decodificarlo sin conexión. Una clave Google API solo es necesaria cuando luego deseas llamar a los Lugares API con el ID."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "¿Necesita ID de lugar ",
            "accent": " a escala?",
            "tail": ""
          },
          "lead": "MapsGrab extrae Place ID, CID y FID para cada negocio que recopila, junto con 33 otras columnas, y exporta directamente a CSV o JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Generador de enlaces de reseñas: revisión directa gratuita URL | MapsGrab",
          "description": "Convierta un Google Maps lugar URL en un enlace directo de reseña Google que pueda compartir con los clientes. Gratis, basado en navegador y no se carga nada."
        },
        "hero": {
          "title": {
            "lead": "Google Enlace de revisión ",
            "accent": "Generador",
            "tail": ""
          },
          "description": "Pegue un Google Maps lugar URL y obtenga el enlace directo \"escribir una reseña\" para esa empresa: el camino más corto desde un cliente satisfecho hasta una reseña Google."
        },
        "form": {
          "urlLabel": "Google Maps lugar URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Generar enlace de revisión",
          "errorShortLink": "No se admiten enlaces cortos (maps.app.goo.gl). Abra el enlace en su navegador y pegue el URL completo de la barra de direcciones.",
          "errorInvalidUrl": "Esto no parece un lugar Google Maps URL. Abra un lugar en Google Maps y copie el URL completo (debe contener \"/maps/place/\" y \"@\" o \"data=\").",
          "errorNoIds": "No se encontraron identificadores de lugar en este URL. Asegúrate de haber copiado el URL de la página de un lugar, no de una página de resultados de búsqueda."
        },
        "result": {
          "linkLabel": "Enlace de revisión",
          "open": "Abierto"
        },
        "howTo": [
          {
            "heading": "¿Qué es un enlace de revisión Google?",
            "body": "Un enlace de revisión es un acceso directo que abre el cuadro de diálogo de revisión de una empresa específica en Google. En lugar de pedirles a los clientes que busquen su empresa, desplácese a la sección de reseñas y presionen \"Escribir una reseña\", les envía una URL (search.google.com/local/reviews?placeid=…) que llega directamente al formulario de reseña. Las empresas colocan estos enlaces en correos electrónicos de seguimiento, códigos QR en el mostrador y mensajes SMS posteriores a la transacción."
          },
          {
            "heading": "Cómo generar un enlace de revisión",
            "body": "Abra Google Maps, busque su empresa y abra la página de su lugar. Copie el URL largo de la barra de direcciones y péguelo arriba. Presione \"Generar enlace de revisión\" y la herramienta creará el enlace directo con el ID del lugar codificado, listo para copiar o abrir. El enlace es universal: funciona en navegadores de escritorio y en la aplicación móvil Google Maps."
          },
          {
            "heading": "De dónde viene el ID del lugar",
            "body": "La herramienta reutiliza la misma decodificación local que el Place ID Finder: el identificador ya está presente en los Mapas URL, y la conversión al formulario \"ChIJ...\" se realiza completamente en su navegador. Si administra varias ubicaciones, repita el proceso por lugar o deje que MapsGrab lleve la columna Place ID en cada exportación para que los enlaces de revisión se puedan generar de forma masiva desde una hoja de cálculo."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Caducan los enlaces de reseñas?",
              "answer": "No. El enlace está vinculado al ID de la ubicación, que Google se mantiene estable. Mientras el lugar exista en Google Maps, el enlace seguirá abriendo su cuadro de diálogo de revisión."
            },
            {
              "question": "¿Puedo usar un enlace para múltiples ubicaciones?",
              "answer": "Cada enlace de reseña pertenece exactamente a un lugar. Genere un enlace separado por ubicación: las empresas con múltiples ubicaciones generalmente mantienen una tabla de ID de lugares y derivan los enlaces de ella."
            },
            {
              "question": "¿Se permite solicitar reseñas con un enlace?",
              "answer": "Pedir a los clientes opiniones honestas está bien; incentivar o filtrar reseñas no lo es. La política de Google prohíbe la compensación por reseñas y la activación de reseñas: envíe el mismo enlace a cada cliente y deje que los comentarios hablen por sí solos."
            },
            {
              "question": "¿Por qué mi enlace abre una página de búsqueda en lugar del formulario de revisión?",
              "answer": "Esto sucede cuando el ID del lugar en el enlace es incorrecto, generalmente como resultado de un URL editado manualmente. Regenera el enlace desde el lugar original de Maps URL y verifica que Place ID comience con \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Realice un seguimiento de cada reseña que obtenga ",
            "accent": "",
            "tail": ""
          },
          "lead": "MapsGrab extrae las reseñas de cualquier página comercial (calificación, texto, fecha y respuestas del propietario) para que puedas ver los comentarios y responderlos más rápido."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Comprobador de correo electrónico: validador de formato de correo electrónico gratuito | MapsGrab",
          "description": "Verifique una dirección de correo electrónico en busca de errores de sintaxis y errores tipográficos comunes al instante. Validación de formato gratuita que se ejecuta en su navegador: sin sondeo SMTP, no se envía nada a ninguna parte."
        },
        "hero": {
          "title": {
            "lead": "Correo electrónico ",
            "accent": "Checker",
            "tail": ""
          },
          "description": "Escriba una dirección de correo electrónico y vea instantáneamente si su formato es válido, además de sugerencias para los errores tipográficos más comunes. Todo se ejecuta en su navegador."
        },
        "form": {
          "emailLabel": "Dirección de correo electrónico",
          "emailPlaceholder": "name@example.com",
          "submit": "Verificar correo electrónico",
          "validHeading": "Esta dirección de correo electrónico parece válida.",
          "invalidHeading": "Esta dirección de correo electrónico tiene problemas:",
          "issues": {
            "empty": "Primero ingrese una dirección de correo electrónico.",
            "multipleAt": "La dirección contiene más de un símbolo \"@\".",
            "missingAt": "A la dirección le falta el \"@\" que separa la parte local del dominio.",
            "localEmpty": "La parte antes de la \"@\" está vacía.",
            "localTooLong": "La parte antes de \"@\" es más larga que los 64 caracteres permitidos por los estándares de correo electrónico.",
            "localInvalidChars": "La parte antes de \"@\" contiene caracteres que no están permitidos en las direcciones de correo electrónico (espacios, comillas o caracteres de control).",
            "localDotPosition": "Los puntos en la parte local no pueden ser el primero, el último ni aparecer dos veces seguidas.",
            "domainEmpty": "La parte después de \"@\" está vacía.",
            "domainNoTld": "El dominio no tiene terminación (TLD): agregue algo como \".com\" o \".org\".",
            "domainInvalidChars": "El dominio contiene caracteres que no están permitidos (espacios, guiones bajos o símbolos).",
            "domainLabelHyphen": "Las etiquetas de dominio no pueden comenzar ni terminar con un guión.",
            "domainEmptyLabel": "El dominio contiene dos puntos seguidos o un segmento vacío.",
            "domainTooLong": "El dominio tiene una longitud superior a los 253 caracteres permitidos por los estándares de correo electrónico.",
            "typoDomain": "Este dominio parece un error tipográfico de un proveedor de correo popular."
          }
        },
        "howTo": [
          {
            "heading": "Qué hace este verificador y qué no hace deliberadamente",
            "body": "Esta herramienta valida el formato de una dirección de correo electrónico: la forma de la parte local, la \"@\" y el dominio, siguiendo las reglas prácticas de las especificaciones RFC que realmente aplican los servidores de correo. También señala posibles errores tipográficos de proveedores de buzones de correo populares, la causa más común de direcciones muertas en las listas de clientes potenciales. No envía ninguna sonda al servidor de correo: la verificación SMTP revelaría la dirección a un tercero, lo que entra en conflicto con la ejecución de toda la verificación localmente en su navegador."
          },
          {
            "heading": "Cómo comprobar una dirección de correo electrónico",
            "body": "Escribe o pega la dirección y presiona \"Verificar correo electrónico\". Un resultado verde significa que el formato tiene forma de entregable; un resultado en rojo enumera todas las reglas que la dirección infringe y, cuando el dominio parece un proveedor mal escrito, sugiere el deseado. Solucione los problemas informados y verifique nuevamente hasta que pase la dirección."
          },
          {
            "heading": "Dónde encaja la verificación de formato en un flujo de trabajo de datos",
            "body": "La validación de formato es el primer filtro y el más económico para cualquier lista de correo electrónico: elimina direcciones que nunca pueden llegar a un buzón antes de gastar en ellas el presupuesto de entregabilidad o enriquecimiento. MapsGrab aplica este pensamiento a todo el flujo de trabajo de clientes potenciales: la extensión enriquece cada negocio recopilado con las direcciones de correo electrónico que se encuentran en su sitio web oficial, por lo que el paso de verificación posterior comienza a partir de una lista mucho más limpia."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Esta herramienta comprueba si el buzón realmente existe?",
              "answer": "No, deliberadamente. Verificar la existencia requiere consultar el servidor de correo del destinatario (sondeo SMTP), lo cual no se puede hacer de forma privada en un navegador y puede marcar su IP. Esta herramienta verifica todo lo que se puede verificar sin tocar la red: estructura, caracteres permitidos y errores tipográficos comunes del proveedor."
            },
            {
              "question": "¿Puede una dirección pasar por aquí y aun así rebotar?",
              "answer": "Sí. Una dirección sintácticamente perfecta aún puede cerrarse, completarse o abandonarse. La validación de formato elimina las direcciones incorrectas incluso antes de intentar la entrega; no puede garantizar que un ser humano lea un buzón que parezca válido."
            },
            {
              "question": "¿Por qué se rechaza \"nombre@localhost\"?",
              "answer": "El verificador requiere un dominio con una terminación pública (TLD) porque las direcciones sin ella no pueden recibir correo desde el exterior de Internet. Los estándares que permiten dominios exclusivamente internos son irrelevantes para las listas de clientes potenciales y los datos de los clientes."
            },
            {
              "question": "¿Mi entrada está almacenada en algún lugar?",
              "answer": "No. La validación se ejecuta simplemente JavaScript en la pestaña de su navegador; no se transmite, registra ni almacena nada: vuelva a cargar la página y la entrada desaparecerá."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Recopile correos electrónicos que valen ",
            "accent": "verificar",
            "tail": ""
          },
          "lead": "MapsGrab encuentra las direcciones de correo electrónico y los perfiles sociales detrás de cada empresa que extrae, directamente desde el sitio web de cada empresa."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Convertir Lat Long a DMS — Grados decimales a Grados Minutos Segundos | MapsGrab",
          "description": "Convierta la latitud y longitud decimal al formato de grados, minutos, segundos (DMS) al instante. Convertidor de coordenadas gratuito basado en navegador, no se carga nada."
        },
        "hero": {
          "title": {
            "lead": "Convertir Lat Long a ",
            "accent": "DMS",
            "tail": ""
          },
          "description": "Ingrese latitud y longitud decimales y lea las mismas coordenadas en grados, minutos y segundos, con letras hemisféricas, listas para copiar."
        },
        "form": {
          "latitudeLabel": "Latitud (decimal, -90 a 90)",
          "longitudeLabel": "Longitud (decimal, -180 a 180)",
          "placeholder": "37.774929",
          "submit": "Convertir a DMS",
          "errorLatitude": "La latitud debe ser un número entre -90 y 90.",
          "errorLongitude": "La longitud debe ser un número entre -180 y 180."
        },
        "result": {
          "dms": "Coordenadas en DMS"
        },
        "howTo": [
          {
            "heading": "¿Qué son los grados decimales y DMS?",
            "body": "Los mapas y las hojas de cálculo almacenan coordenadas como grados decimales: un número con signo por eje, como 37.774929, -122.419416. Los estudios topográficos, las cartas marinas y muchos documentos de propiedad utilizan la notación sexagesimal más antigua: grados, minutos y segundos con letras hemisféricas, como 37° 46' 29.74\" N, 122° 25' 9.90\" W. Ambos describen el mismo punto; la forma DMS simplemente divide la fracción en unidades sucesivamente más pequeñas, donde un minuto es 1/60 grado y un segundo es 1/60 minuto."
          },
          {
            "heading": "Cómo convertir",
            "body": "Pegue la latitud y longitud decimal y presione \"Convertir a DMS\". Los valores negativos se asignan a los hemisferios sur y oeste y se informan como S y W. Los segundos se muestran con dos decimales: aproximadamente un metro de resolución terrestre, más preciso que cualquier captura de GPS de consumo. Copie el resultado como una sola línea para documentos o como campos separados para hojas de cálculo."
          },
          {
            "heading": "Por qué esto es importante para el trabajo de datos de mapas",
            "body": "Los viajes de ida y vuelta coordinados son un punto de fricción diario cuando se mueven datos comerciales entre herramientas: Google Maps exporta decimales, mientras que los flujos de trabajo catastrales y de impresión esperan DMS. MapsGrab mantiene esta fricción baja a escala: cada negocio extraído ya incluye su latitud y longitud en la exportación, y las conversiones de coordenadas por lotes se pueden ejecutar sin conexión con la misma fórmula que utiliza esta página."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Qué tan preciso es el resultado DMS?",
              "answer": "Los segundos se muestran con dos decimales. Un segundo de latitud equivale aproximadamente a 30 metros, por lo que dos decimales se resuelven en aproximadamente 30 centímetros, mucho más ajustado que los datos GPS subyacentes. La precisión está limitada por su entrada, no por la conversión."
            },
            {
              "question": "¿Qué significan aquí N, S, E y W?",
              "answer": "Reemplazan el signo del valor decimal: las latitudes positivas son el norte (N) y las negativas son el sur (S); las longitudes positivas son el este (E) y las negativas son el oeste (W). La herramienta selecciona las letras del letrero automáticamente."
            },
            {
              "question": "¿Puedo convertir DMS a decimal aquí?",
              "answer": "Sí, utilice la herramienta complementaria \"Convertir DMS a DD\" en este sitio. La conversión en ambos sentidos con la misma implementación evita el desvío de redondeo entre diferentes fórmulas."
            },
            {
              "question": "¿Se cargan mis datos de coordenadas?",
              "answer": "No. La conversión es pura aritmética en la pestaña de su navegador; nada de lo que escribes sale de la página."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Coordenadas para cada negocio, ya ",
            "accent": "extraídas",
            "tail": ""
          },
          "lead": "MapsGrab escribe latitud y longitud en cada fila que exporta, sin búsqueda manual de coordenadas para su próximo proyecto de ruta o territorio."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Convertir DMS a DD — Grados Minutos Segundos a Grados decimales | MapsGrab",
          "description": "Convierta coordenadas de grados, minutos y segundos a grados decimales al instante. Convertidor gratuito de DMS a DD basado en navegador, no se ha cargado nada."
        },
        "hero": {
          "title": {
            "lead": "Convertir DMS a DD ",
            "accent": "(Lat, Largo)",
            "tail": ""
          },
          "description": "Ingrese grados, minutos y segundos para ambos ejes y obtenga grados decimales claros: el formato Google Maps, hojas de cálculo y MapsGrab lo entienden."
        },
        "form": {
          "latitudeHeading": "Latitud (N/S)",
          "longitudeHeading": "Longitud (E/O)",
          "degreesLabel": "Grados",
          "minutesLabel": "Minutos de arco",
          "secondsLabel": "Segundos de arco",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Convertir a decimal",
          "errorValues": "Los grados deben ser cero o un número entero positivo, los minutos y segundos deben estar entre 0 y 60."
        },
        "result": {
          "dd": "Coordenadas en grados decimales."
        },
        "howTo": [
          {
            "heading": "¿Por qué convertir DMS nuevamente a grados decimales?",
            "body": "Grados-minutos-segundos es una notación orientada a humanos, pero prácticamente todos los sistemas orientados a máquinas quieren grados decimales: búsqueda Google Maps, importaciones de SIG, fórmulas de distancia en hojas de cálculo y canalizaciones de codificación geográfica. La conversión es una suma ponderada simple (grados más minutos divididos por 60 más segundos divididos por 3600) en la que la letra del hemisferio decide el signo."
          },
          {
            "heading": "Cómo convertir",
            "body": "Complete grados, minutos y segundos para la latitud y longitud y elija las letras del hemisferio (N/S y E/W). Presione \"Convertir a decimal\" y la herramienta generará ambos ejes como números decimales con signo y seis decimales, lo que equivale aproximadamente a 11 centímetros en el suelo, más que suficiente para cualquier uso en una ubicación comercial. Pegue el resultado directamente en Google Maps o en su hoja de cálculo."
          },
          {
            "heading": "Mantener consistentes los datos de coordenadas",
            "body": "Las notaciones mixtas son la razón habitual por la que las ubicaciones terminan en el océano equivocado después de una importación. Decidir los grados decimales una vez y convertir todo en el límite mantiene las tuberías sanas. MapsGrab ya exporta coordenadas en grados decimales, por lo que los datos recopilados con la extensión caen en herramientas GIS y BI sin ningún paso de conversión."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Cuantos decimales necesito?",
              "answer": "Seis decimales se resuelven en aproximadamente 11 centímetros, más allá de la precisión del GPS de consumo. Cinco plazas (aproximadamente 1 metros) son suficientes para las ubicaciones comerciales; menos decimales desdibujan intencionalmente el punto."
            },
            {
              "question": "¿Qué rangos deben satisfacer los campos?",
              "answer": "Los minutos y segundos van desde 0 hasta menos de 60. Los grados de latitud llegan hasta 90 y los de longitud hasta 180; el convertidor informa cuando un valor aterrizaría fuera del mundo."
            },
            {
              "question": "¿Debo ingresar números negativos cuando elijo S o W?",
              "answer": "No, la letra del hemisferio ya codifica el signo. Si ingresa un valor con signo y una letra en conflicto al mismo tiempo, la herramienta marca la contradicción en lugar de adivinar."
            },
            {
              "question": "¿La conversión se realiza en un servidor?",
              "answer": "No. La fórmula se ejecuta en su navegador; nada de lo que escribes se transmite a ninguna parte."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Saltar trabajo de coordenadas manual ",
            "accent": "a escala",
            "tail": ""
          },
          "lead": "MapsGrab exporta latitud y longitud decimal para cada negocio que recopila, junto a la dirección, el teléfono y las columnas Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Generador de palabras clave masivas: combinaciones de palabras clave y ubicación | MapsGrab",
          "description": "Genere combinaciones de palabras clave y ubicaciones de forma masiva para tareas de búsqueda de mapas y SEO local. Pegue dos listas, obtenga cada combinación, descárguela como CSV. Gratis."
        },
        "hero": {
          "title": {
            "lead": "Palabras clave masivas ",
            "accent": "Generador",
            "tail": ""
          },
          "description": "Pegue sus palabras clave y sus ubicaciones, y obtenga cada combinación de \"palabra clave + ubicación\" como una lista lista para pegar o CSV: la forma más rápida de iniciar una campaña de búsqueda local."
        },
        "form": {
          "keywordsLabel": "Palabras clave (una por línea)",
          "keywordsPlaceholder": "agencia de diseño\ncafeteria\nfontanero",
          "locationsLabel": "Ubicaciones (una por línea)",
          "locationsPlaceholder": "New York\nchicago\naustin",
          "orderLabel": "Orden de combinación",
          "keywordFirst": "palabra clave + ubicación (agencia de diseño New York)",
          "locationFirst": "ubicación + palabra clave (New York agencia de diseño)",
          "submit": "Generar combinaciones",
          "resultCount": "{count} combinaciones generadas.",
          "errorKeywords": "Agregue al menos una palabra clave.",
          "errorLocations": "Añade al menos una ubicación."
        },
        "howTo": [
          {
            "heading": "¿Para qué sirve la generación masiva de palabras clave?",
            "body": "Las campañas de búsqueda local se basan en combinaciones: el mismo servicio se repite en cada ciudad, distrito o vecindario al que presta servicios. Diez palabras clave en diez ubicaciones equivalen a cien frases de búsqueda: \"agencia de diseño New York\", \"agencia de diseño Chicago\", etc. Escribirlos a mano es propenso a errores; generarlos a partir de dos listas lleva unos segundos y garantiza que no se pierda nada."
          },
          {
            "heading": "Cómo generar combinaciones",
            "body": "Pegue sus palabras clave en el primer cuadro (una por línea) y sus ubicaciones en el segundo. Elija si la palabra clave o la ubicación aparecen primero y luego presione \"Generar\". Cada palabra clave se combina con cada ubicación, se eliminan las líneas en blanco y los duplicados, y la lista completa aparece a continuación con un recuento. Cópielo directamente en Google listas de palabras clave de anuncios, Google verificaciones de tendencias o una cola de tareas de extracción de mapas."
          },
          {
            "heading": "De la lista de palabras clave a los datos recopilados",
            "body": "El siguiente paso clásico es ejecutar cada combinación como una búsqueda Google Maps y recopilar los resultados. Ese bucle es exactamente lo que MapsGrab automatiza: la extensión acepta una lista de palabras clave como una tarea por lotes, recorre las búsquedas una por una y exporta todos los negocios que encuentra, de modo que las combinaciones que genera aquí se convierten en filas estructuradas sin copia manual."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Cuántas combinaciones puedo generar?",
              "answer": "Tantas como su navegador pueda contener: la herramienta multiplica las dos listas y las deduplica localmente. Diez mil combinaciones están bien; para lotes muy grandes, la descarga CSV es más práctica que copiar el área de texto."
            },
            {
              "question": "¿Se eliminan los duplicados?",
              "answer": "Sí. Las líneas duplicadas dentro de cada lista se eliminan antes del emparejamiento y el resultado contiene cada par de palabra clave y ubicación exactamente una vez, en el orden que usted elija."
            },
            {
              "question": "¿Qué orden debo usar?",
              "answer": "Ambos son comportamientos de búsqueda reales. \"Plumber Austin\" se parece a cómo la gente escribe en Maps; \"Plomero de Austin\" se lee como una frase tradicional de SEO. Generar ambas órdenes es una forma común de cubrir variantes de búsqueda."
            },
            {
              "question": "¿Puedo utilizar distritos de la ciudad o códigos postales como ubicaciones?",
              "answer": "Sí, cualquier cosa que tenga sentido como sufijo de búsqueda en Maps funciona: distritos, códigos postales, áreas metropolitanas o pares completos de \"ciudad y estado\". Una línea por ubicación."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Convierta la lista de palabras clave en ",
            "accent": "resultados",
            "tail": ""
          },
          "lead": "MapsGrab tareas por lotes ejecutan cada palabra clave como una búsqueda de Maps y exportan las empresas detrás de ellas: CSV o JSON, con reseñas, fotos y enriquecimiento de contactos."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Fusionar archivos CSV en línea: combinar varios archivos CSV gratis | MapsGrab",
          "description": "Fusione varios archivos CSV en línea en un solo archivo. Los encabezados de las columnas se alinean automáticamente por unión: gratis, privado y completamente basado en el navegador."
        },
        "hero": {
          "title": {
            "lead": "Fusionar CSV Archivos ",
            "accent": "En línea",
            "tail": ""
          },
          "description": "Cargue dos o más archivos CSV y descargue un único archivo combinado. Las columnas están alineadas por encabezado; los campos faltantes se dejan vacíos. Los archivos nunca salen de su navegador."
        },
        "form": {
          "filesLabel": "CSV archivos",
          "filesHint": "Seleccione dos o más archivos .csv. Verifique cada archivo con etiquetas traducidas en la fila 2 para omitir esa fila. El CSV fusionado mantiene una fila de encabezado de nombre de campo. Los archivos permanecen en su navegador.",
          "translationRow": "Saltar fila 2 (etiquetas traducidas) en {name}",
          "submit": "Fusionar archivos",
          "errorNoFiles": "Seleccione al menos dos archivos CSV para fusionarlos.",
          "errorEmptyFile": "Uno de los archivos está vacío o no tiene fila de encabezado: {name}",
          "fileSummary": "{name} — {rows} filas de datos",
          "resultSummary": "Fusionó {files} archivos en {rows} filas × {columns} columnas.",
          "previewLabel": "Vista previa fusionada CSV"
        },
        "howTo": [
          {
            "heading": "¿Qué hace la fusión aquí?",
            "body": "Al fusionar se acumulan varias exportaciones CSV en una tabla: las columnas se alinean por nombre de encabezado en todos los archivos y cada fila de datos mantiene sus valores bajo el encabezado coincidente. Los archivos se combinan de arriba a abajo en el orden en que los seleccionó, por lo que el resultado se lee como un conjunto de datos continuo. Las columnas que sólo existen en algunos archivos permanecen en la salida; Las filas de archivos sin ellos obtienen celdas vacías: una unión de todos los encabezados."
          },
          {
            "heading": "Cómo fusionar archivos CSV",
            "body": "Seleccione dos o más archivos .csv, por ejemplo, las exportaciones semanales de un flujo de trabajo de extracción de mapas. Presione \"Combinar archivos\" y la herramienta analizará cada archivo en su navegador, informará el recuento de filas de cada uno y creará la tabla combinada. Descárguelo como un único CSV que se abre limpiamente en Excel, Google Sheets o cualquier importación de base de datos."
          },
          {
            "heading": "Creado para la recopilación de datos de varias ejecuciones",
            "body": "El caso de uso típico es agregar ejecuciones: cada sesión de extracción MapsGrab exporta su propia CSV, y la fusión reúne las sesiones de la semana en un conjunto de datos antes de la deduplicación y limpieza. El analizador maneja campos entre comillas, comas incrustadas y nuevas líneas dentro de las celdas (RFC 4180), por lo que las exportaciones con direcciones de varias líneas o fragmentos de revisión se combinan correctamente."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Preguntas frecuentes",
            "tail": ""
          },
          "items": [
            {
              "question": "¿Qué sucede cuando los archivos tienen diferentes columnas?",
              "answer": "El archivo combinado contiene la unión de todos los encabezados en el orden en que aparecen por primera vez. Las filas de archivos que carecen de una columna obtienen una celda vacía en esa columna. No se elimina ni se cambia nada de nombre."
            },
            {
              "question": "¿Mis archivos se cargan en un servidor?",
              "answer": "No. Los archivos se leen con el FileReader API del navegador y se fusionan en la memoria de su pestaña. No se transmite nada y al cerrar la página se borra todo."
            },
            {
              "question": "¿La fusión elimina filas duplicadas?",
              "answer": "No: la fusión es una concatenación directa con columnas alineadas. La deduplicación (por ejemplo mediante Place ID) es un paso de limpieza independiente que se ejecuta en el archivo combinado."
            },
            {
              "question": "¿Qué tamaño pueden tener los archivos?",
              "answer": "El límite es la memoria de la pestaña de su navegador, no un número fijo. Para las exportaciones típicas de datos empresariales (de miles a unos cientos de miles de filas), la fusión es instantánea. Para archivos muy grandes, combínelos en lotes."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Una exportación por ejecución, o ",
            "accent": "un conjunto de datos",
            "tail": ""
          },
          "lead": "MapsGrab exporta limpiamente CSV/JSON por sesión con selección de campos y Place ID deduplicación, por lo que los conjuntos de datos de ejecución múltiple ya comienzan casi fusionados."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Compañía",
  "about": {
    "navLabel": "Acerca de",
    "seoTitle": "Acerca de MapsGrab | Producto y límites",
    "seoDescription": "MapsGrab es un conjunto de herramientas de datos de mapas para datos comerciales públicos: una extensión de navegador, un extractor en línea en la nube, servidores API y MCP, y herramientas web gratuitas. Descubra dónde está el límite de los datos.",
    "hero": {
      "eyebrow": "Acerca de MapsGrab",
      "title": {
        "lead": "Datos de mapas, tomados de la manera ",
        "accent": "sencilla",
        "tail": ""
      },
      "intro": "MapsGrab crea herramientas que recopilan información comercial disponible públicamente de Google Maps y la convierten en datos limpios y estructurados: una extensión de navegador para Edge y Firefox, un extractor en línea basado en la nube, un servidor API y MCP, además de herramientas web gratuitas que se ejecutan completamente en su navegador.",
      "contactLabel": "Contactar con soporte",
      "extensionLabel": "Explora la extensión",
      "stageLabel": "Acceso temprano",
      "updatedLabel": "Publicado y revisado",
      "updatedAt": "Agosto 31, 2026",
      "chips": [
        {
          "label": "Colecciona",
          "value": "Solo datos públicos"
        },
        {
          "label": "Resultados de la extensión",
          "value": "En tu navegador"
        },
        {
          "label": "Exportaciones",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Arrastra para girar"
    },
    "build": {
      "kicker": "lo que construimos",
      "title": {
        "lead": "Un conjunto de herramientas, ",
        "accent": "cuatro",
        "tail": " maneras de"
      },
      "lead": "Elija la extensión del navegador, Extractor online basado en la nube o API. La extensión funciona dentro de tu propio navegador; Extractor online y API comparten un motor de nube, y el servidor MCP lleva ese API a los agentes de IA.",
      "hub": {
        "title": "MapsGrab kit de herramientas de datos",
        "detail": "Datos comerciales · reseñas · fotos · correo electrónico y enriquecimiento social"
      },
      "tags": {
        "extension": [
          "36-extracción de columnas",
          "Reseñas y fotos",
          "Tareas por lotes"
        ],
        "online": [
          "Palabras clave por lotes",
          "Enriquecimiento de contactos",
          "Una 37 columna CSV por tarea"
        ],
        "api": [
          "Datos comerciales",
          "Reseñas",
          "Estructurado JSON"
        ],
        "mcp": [
          "Tres herramientas",
          "Streamable HTTP",
          "Tecla OAuth o API"
        ]
      },
      "toolsLead": "Además de herramientas web gratuitas.",
      "toolsText": "Las herramientas web gratuitas de este sitio manejan trabajos pequeños (colocar identificaciones, revisar enlaces, coordinar conversiones, CSV fusionar) sin instalar nada.",
      "toolsLabel": "Herramientas web gratuitas"
    },
    "principles": {
      "kicker": "Principios",
      "title": {
        "lead": "Dónde está el ",
        "accent": "límite",
        "tail": ""
      },
      "lead": "MapsGrab es deliberadamente conservador con respecto a los datos. Estas son las reglas de producto que cumplimos.",
      "publicData": {
        "title": "Solo datos públicos",
        "text": "Solo información comercial disponible públicamente: lo que cualquier visitante de la página ya puede ver.",
        "visibleTag": "Visible para cualquier visitante",
        "privateTag": "cuentas privadas"
      },
      "localFirst": {
        "title": "Primero local",
        "text": "Con la extensión y las herramientas web gratuitas, su configuración y resultados se encuentran en su navegador, no en nuestros servidores. El Extractor online, el servidor API y el MCP se ejecutan en nuestra nube, y los resultados de Extractor online se guardan en su cuenta.",
        "storage": "almacenamiento local",
        "rows": [
          "Ajustes",
          "Resultados",
          "Tareas por lotes"
        ]
      },
      "backend": {
        "title": "Extensión y herramientas gratuitas: cuatro trabajos backend",
        "text": "Para la extensión y las herramientas web gratuitas, nuestro backend maneja exactamente cuatro cosas: configuración remota, estado de cuenta y cuota, enriquecimiento social/correo electrónico opcional y registros de uso mínimo.",
        "chips": [
          "configuración",
          "Cuota",
          "Enriquecimiento",
          "Registros de uso"
        ]
      },
      "never": {
        "title": "Sin anuncios. Sin rastreadores. Sin ventas de datos.",
        "text": "Sin anuncios, sin rastreadores de terceros en la extensión y sin venta ni alquiler de datos.",
        "chips": [
          "Anuncios",
          "Rastreadores de terceros",
          "Vender datos"
        ]
      },
      "inWriting": {
        "kicker": "Escrito",
        "title": "Política de privacidad y términos",
        "text": "Cada una de estas reglas se detalla en la Política de privacidad y los Términos de servicio.",
        "link": "Lea la Política de Privacidad"
      }
    },
    "dataFlow": {
      "kicker": "Cómo se mueven los datos",
      "title": {
        "lead": "Lo que se queda contigo y lo que ",
        "accent": "nos llega",
        "tail": ""
      },
      "lead": "La extensión funciona con datos mostrados públicamente y mantiene los resultados en su navegador. Para la extensión y las herramientas web gratuitas, nuestro backend solo impulsa la configuración, las cuotas, el enriquecimiento opcional y los registros de uso mínimo. El servidor Extractor online, el API y el MCP se ejecutan en nuestra nube, y los resultados de Extractor online se guardan en su cuenta.",
      "source": {
        "label": "Fuente",
        "title": "Google Maps páginas que visitas",
        "text": "Datos comerciales públicos: nombre, dirección, teléfono, sitio web, calificación, reseñas, fotografías."
      },
      "browser": {
        "label": "Su navegador · primero local",
        "storage": "almacenamiento local · IndexedDB",
        "rows": [
          "Ajustes",
          "Resultados de extracción",
          "Estado de la tarea por lotes"
        ],
        "badge": "Almacenado en su navegador"
      },
      "backend": {
        "label": "MapsGrab backend · cuatro propósitos",
        "lanes": [
          {
            "title": "Configuración remota",
            "text": "Ajustes preestablecidos de estructura de página que mantienen la extracción funcionando"
          },
          {
            "title": "Cuenta y cuota",
            "text": "Inicio de sesión, estado del plan, contabilidad de uso mensual"
          },
          {
            "title": "Correo electrónico y enriquecimiento social",
            "text": "Contactos listados públicamente, cuando se utiliza la función"
          },
          {
            "title": "Registro de uso",
            "text": "Registros mínimos de uso de funciones y errores."
          }
        ]
      },
      "never": {
        "label": "Nunca",
        "items": [
          "Sin anuncios",
          "No hay rastreadores de terceros en la extensión.",
          "Prohibida la venta o alquiler de datos personales",
          "No se recopila su historial de navegación más allá de las Google Maps páginas de las que extrae"
        ]
      },
      "note": "Este sitio web utiliza Google Analytics 4 para medir el uso agregado de la página; la extensión en sí no contiene análisis.",
      "noteLink": "Lea la Política de Privacidad"
    },
    "status": {
      "kicker": "Estado",
      "title": {
        "lead": "Acceso temprano, ",
        "accent": "gratis",
        "tail": " para comenzar"
      },
      "access": {
        "title": "Acceso temprano",
        "text": "El producto se encuentra en acceso anticipado. Se están ultimando los listados de tiendas para complementos Edge y complementos Firefox.",
        "link": "guía de instalación"
      },
      "quota": {
        "title": "Cuota mensual gratuita",
        "text": "La extensión funciona sin cuenta dentro de una cuota mensual gratuita.",
        "link": "¿Qué está incluido?"
      },
      "paid": {
        "title": "Planes pagos para un uso más intensivo",
        "text": "Los planes pagos aumentan los límites para un uso más intensivo. Consulte la página de precios para conocer los niveles actuales.",
        "link": "Ver precios"
      }
    }
  },
  "contact": {
    "navLabel": "Contacto",
    "seoTitle": "Contacto MapsGrab Soporte",
    "seoDescription": "Comuníquese con MapsGrab sobre cuentas, la extensión del navegador, facturación, herramientas o solicitudes de privacidad.",
    "eyebrow": "Contacto MapsGrab",
    "title": {
      "lead": "Habla con un ",
      "accent": "humano",
      "tail": ""
    },
    "intro": "Escríbenos y una persona lo leerá. Actualmente, el soporte lo maneja directamente el equipo que construye MapsGrab.",
    "emailCardLabel": "Correo electrónico de soporte",
    "copyEmail": "Copiar {email}",
    "emailLabel": "Soporte por correo electrónico",
    "emailSubject": "MapsGrab solicitud de soporte",
    "responseTimes": "Respondemos el correo electrónico de soporte dentro de un día hábil, generalmente más rápido. Las solicitudes de privacidad pueden demorar algunos días y primero debemos verificar la propiedad de la cuenta.",
    "include": {
      "title": "Que incluir",
      "text": "Un informe preciso nos ayuda a identificar el flujo de trabajo afectado sin solicitar información confidencial de la cuenta.",
      "items": [
        "La página URL y la acción que intentaste",
        "Nombre y versión de su navegador",
        "El mensaje de error exacto y una captura de pantalla cuando sea útil.",
        "Un número de pedido para preguntas sobre facturación, sin datos de tarjeta de pago"
      ]
    },
    "topics": {
      "title": "En qué podemos ayudar",
      "items": [
        "Instalación y configuración de la extensión del navegador.",
        "Problemas de acceso e inicio de sesión a la cuenta",
        "Cuotas, suscripciones, renovaciones y cuestiones de pago",
        "Problemas con herramientas web y solicitudes de funciones",
        "Solicitudes de privacidad y datos de cuenta"
      ]
    },
    "aboutLabel": "Acerca de",
    "privacyLabel": "política de privacidad",
    "termsLabel": "Términos de servicio"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Hogar",
    "crumbLegal": "Legal",
    "switchLabel": "Documentos legales",
    "readTime": "{minutes} minutos de lectura",
    "sectionCount": "{count} secciones",
    "tocTitle": "En esta página",
    "tocLabel": "{title} secciones",
    "glanceKicker": "De un vistazo",
    "glanceNote": "Un resumen del texto completo a continuación.",
    "anchorLabel": "Copiar enlace a “{title}”",
    "copyEmail": "Copiar {email}",
    "contactSupport": "Contactar con soporte",
    "nextLabel": "Siguiente documento"
  },
  "terms": {
    "navLabel": "Términos",
    "seoTitle": "Términos de servicio | MapsGrab",
    "seoDescription": "Los MapsGrab Términos de servicio: uso aceptable, responsabilidad del usuario por los datos recopilados, compras, exenciones de responsabilidad y cómo contactarnos.",
    "title": "Términos de servicio",
    "intro": "Estos Términos rigen el uso de MapsGrab: la extensión del navegador, este sitio web y las herramientas web gratuitas. Léalos antes de utilizar el servicio.",
    "updatedLabel": "Última actualización",
    "updatedAt": "Agosto 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Uso aceptable, responsabilidad del usuario por los datos recopilados, compras, exenciones de responsabilidad y cómo contactarnos.",
    "helpTitle": "¿Preguntas sobre estos Términos?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Solo datos públicos",
        "text": "El servicio funciona únicamente con información que se muestra públicamente en las páginas que navega."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Tu uso, tu responsabilidad",
        "text": "Usted decide qué recopilar y cómo utilizarlo, dentro de las leyes que se le aplican."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "No se necesita cuenta para comenzar",
        "text": "La extensión funciona sin cuenta dentro de una cuota mensual gratuita."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Cancelar en cualquier momento",
        "text": "Las suscripciones se renuevan hasta que se cancelan; la cancelación detiene futuras renovaciones."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Aceptación de términos",
        "paragraphs": [
          "Al acceder o utilizar MapsGrab, acepta estos Términos. Si no está de acuerdo con ellos, no instale la extensión ni utilice el sitio web ni las herramientas."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Que hace el servicio",
        "paragraphs": [
          "MapsGrab le ayuda a recopilar información que se muestra públicamente en las páginas Google Maps que visita (detalles comerciales, reseñas, fotografías e información de contacto relacionada) y a exportarla. El servicio consta de una extensión de navegador para Microsoft Edge y Firefox, este sitio web y herramientas web gratuitas que se ejecutan en su navegador."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Datos disponibles públicamente",
        "paragraphs": [
          "El servicio está diseñado para funcionar únicamente con información que se muestra públicamente en las páginas que navega. No accede a cuentas privadas, contenido privado ni datos que requieran acceso especial más allá de lo que cualquier visitante puede ver."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Tu responsabilidad",
        "paragraphs": [
          "Usted decide qué recopilar y cómo utilizarlo, y es responsable de ese uso. Cuando utilice la información recopilada, cumpla con las leyes que se aplican a usted y a su propósito.",
          "En particular, usted acepta no:"
        ],
        "items": [
          "Utilizar el servicio para cualquier actividad ilícita o en violación de derechos de terceros.",
          "Volver a identificar personas o crear perfiles de personas privadas a partir de los datos comerciales recopilados.",
          "Utilice los datos de contacto recopilados para spam o mensajes masivos no solicitados.",
          "Revender los datos recopilados sin procesar como un producto de datos de la competencia sin un acuerdo separado con nosotros.",
          "Interferir, sobrecargar o intentar interrumpir el servicio o las plataformas con las que trabaja."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Cuentas y cuotas",
        "paragraphs": [
          "La extensión funciona sin cuenta dentro de una cuota mensual gratuita. Algunas funciones (límites más altos, compras, integraciones en la nube) requieren una cuenta. Usted es responsable de mantener seguras las credenciales de su cuenta y de la actividad que ocurre en su cuenta."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Compras y suscripciones",
        "paragraphs": [
          "Los planes pagos se describen en la página de Precios. Los precios, las cuotas y los períodos de facturación se muestran antes de comprar, y las compras se gestionan a través de los proveedores de pago que se ofrecen al finalizar la compra. Los planes de suscripción se renuevan automáticamente hasta que se cancelan y usted puede cancelarlos en cualquier momento; la cancelación detiene futuras renovaciones."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "El servicio se proporciona tal cual.",
        "paragraphs": [
          "El servicio se proporciona \"tal cual\" y \"según disponibilidad\". Las plataformas cambian con frecuencia y las funciones de recopilación pueden dejar de funcionar parcial o totalmente en cualquier momento. MapsGrab no ofrece garantías, expresas o implícitas, sobre la disponibilidad ininterrumpida, la integridad de los datos recopilados o la idoneidad para un propósito particular.",
          "Podemos cambiar, suspender o descontinuar cualquier parte del servicio y podemos actualizar estos Términos. Cuando los cambios sean sustanciales, los anunciaremos en este sitio web. El uso continuo después de que los cambios entren en vigor significa que acepta los Términos actualizados."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitación de responsabilidad",
        "paragraphs": [
          "En la máxima medida permitida por la ley, MapsGrab y sus operadores no son responsables de daños indirectos, incidentales, especiales o consecuentes, incluida la pérdida de ganancias o datos, que surjan de su uso o imposibilidad de utilizar el servicio."
        ]
      },
      {
        "id": "contact",
        "title": "Contacto",
        "paragraphs": [
          "Las preguntas sobre estos Términos se pueden enviar a support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Nota de cobertura",
      "badge": "Por determinar",
      "lead": "Aún no cubierto:",
      "text": "el Extractor online (ejecuciones en la nube), el Scraper/Reseñas/Fotos API y el servidor MCP. El texto anterior describe la extensión, este sitio web y las herramientas web gratuitas."
    }
  },
  "privacy": {
    "navLabel": "Privacidad",
    "seoTitle": "Política de privacidad | MapsGrab",
    "seoDescription": "La MapsGrab Política de Privacidad: qué datos procesa la extensión y el sitio web, dónde se almacenan, para qué se utiliza nuestro backend y los límites que seguimos.",
    "title": "política de privacidad",
    "intro": "Esta política explica qué datos maneja MapsGrab, dónde se almacenan y qué llega a nuestros servidores. La versión corta: la extensión funciona con datos mostrados públicamente y mantiene los resultados en su navegador; además de nuestros servicios en la nube, nuestro backend solo impulsa la configuración, las cuotas, el enriquecimiento opcional y los registros de uso mínimo; y no publicamos anuncios ni rastreadores de terceros en la extensión. Las solicitudes a nuestros servicios en la nube (Extractor online, el servidor API y MCP) se procesan en nuestros servidores y los resultados de Extractor online están vinculados a su cuenta para que pueda descargarlos.",
    "updatedLabel": "Última actualización",
    "updatedAt": "Octubre 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Qué datos procesa la extensión y el sitio web, dónde se almacenan, para qué se utiliza nuestro backend y los límites que seguimos.",
    "helpTitle": "¿Preguntas sobre esta política?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Donde se almacenan los resultados",
        "text": "La extensión y las herramientas web gratuitas mantienen sus datos en su navegador; Los resultados de Extractor online están vinculados a su cuenta."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Qué llega a nuestros servidores",
        "text": "Solicitudes al Extractor online, al servidor API y MCP, además de configuración, cuenta y cuotas, enriquecimiento opcional y registros de uso mínimo."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Sin anuncios, sin rastreadores",
        "text": "No se permiten rastreadores de terceros en la extensión ni se venden ni alquilan datos personales."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Eliminación de datos",
        "text": "Al eliminar la extensión se eliminan los datos locales; envíenos un correo electrónico para eliminar los datos de la cuenta backend."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Datos de los procesos de extensión.",
        "paragraphs": [
          "La extensión maneja las siguientes categorías de datos:"
        ],
        "items": [
          "Datos comerciales públicos: información que se muestra en las Google Maps páginas que visita (nombre, dirección, teléfono, sitio web, calificación, reseñas, fotos, etc.) mientras utiliza las funciones de extracción.",
          "Su configuración: preferencias que usted configura (formato de exportación, selección de campos, interruptores de automatización, idioma de la interfaz).",
          "Datos técnicos y de interacción: eventos de uso mínimo (contadores de uso de funciones, mensajes de error) utilizados para mantener la extensión funcionando contra Google cambios de página.",
          "Identificadores de cuenta que emitimos: un identificador de dispositivo anónimo y, si inicia sesión, el correo electrónico de su cuenta y el estado del plan o de la cuota."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Donde se almacenan los datos",
        "paragraphs": [
          "Con la extensión, la configuración, los resultados de la extracción y el estado de la tarea por lotes se almacenan localmente en su navegador (extensión de almacenamiento local y IndexedDB). Nunca abandonan su dispositivo a menos que active una exportación o una de las integraciones opcionales que se describen a continuación. Las herramientas web gratuitas también procesan lo que ingresa en su navegador.",
          "Los tokens Google Drive y HubSpot OAuth, si los conecta, también se almacenan solo en su navegador.",
          "Las tareas de Scraper en línea se ejecutan en nuestros servidores. Sus resultados se almacenan en su cuenta para que pueda descargarlos desde su Panel de control."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Qué procesa nuestro backend",
        "paragraphs": [
          "Las solicitudes que realiza a nuestros servicios en la nube (Extractor online, el servidor API y el MCP) se procesan en nuestros servidores. Nuestros servidores también administran el acceso a estos servicios, incluida su clave API y las autorizaciones de cliente MCP que usted aprueba, y mantienen registros de su uso.",
          "Un cliente MCP que usted autorice recibe los resultados de las solicitudes que realiza. Puede revocar una autorización desde su Panel de control.",
          "Además de estos servicios en la nube, la extensión y este sitio web contactan con nuestros propios servidores para cuatro propósitos:"
        ],
        "items": [
          "Configuración remota: ajustes preestablecidos de estructura de página que mantienen la extracción funcionando cuando Google cambia sus páginas.",
          "Servicios de cuentas y cuotas: inicio de sesión, estado del plan y contabilidad de uso mensual.",
          "Enriquecimiento del correo electrónico y las redes sociales: búsqueda de detalles de contacto que figuran públicamente en sitios web comerciales recopilados cuando se utiliza la función.",
          "Registro de uso: registros mínimos del uso de funciones y errores utilizados para mantener y mejorar el servicio."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Integraciones Google Drive y HubSpot opcionales",
        "paragraphs": [
          "Solo si los conecta explícitamente en la configuración, los datos exportados se cargan en su propia cuenta Google Drive o se sincronizan con su propia cuenta HubSpot. Estas integraciones utilizan su autorización, actúan en su nombre y pueden revocarse en cualquier momento desde la configuración de la extensión o desde su cuenta Google / HubSpot."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Análisis de sitios web",
        "paragraphs": [
          "Este sitio web utiliza Google Analytics 4 (GA4) para medir el uso agregado de la página. GA4 es el único análisis de terceros que utilizamos y se ejecuta únicamente en este sitio web; la extensión en sí no contiene análisis."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "lo que nunca hacemos",
        "paragraphs": [
          "Estos límites se mantienen en toda la extensión y el sitio web:"
        ],
        "items": [
          "Sin anuncios.",
          "No hay rastreadores de terceros en la extensión.",
          "No venta ni alquiler de datos personales.",
          "No se recopila su historial de navegación más allá de las Google Maps páginas de las que extrae."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Eliminación de datos",
        "paragraphs": [
          "Al eliminar la extensión se eliminan todos los datos almacenados localmente. Si desea eliminar los datos de su cuenta backend, contáctenos al support@mapsgrab.com y los eliminaremos."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Cambios a esta política",
        "paragraphs": [
          "Actualizamos esta política cuando el servicio cambia. La fecha anterior refleja la última revisión y los cambios materiales se anunciarán en este sitio web."
        ]
      },
      {
        "id": "contact",
        "title": "Contacto",
        "paragraphs": [
          "Se pueden enviar preguntas o solicitudes sobre privacidad a support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Autorizar una aplicación de IA | MapsGrab",
  "title": "Conecte una aplicación de IA a su cuenta",
  "intro": "Una aplicación solicita acceder a su cuenta MapsGrab. Permítelo solo si iniciaste esta conexión tú mismo.",
  "loading": "Cargando la solicitud de conexión...",
  "hostLabel": "dirección de la aplicación",
  "selfDeclared": "Nombre que la aplicación se da a sí misma: {name}",
  "loopbackTitle": "aplicación local",
  "loopbackText": "Esta aplicación se ejecuta en una computadora, por lo que su dirección no puede mostrar quién la creó. Permítelo solo si acabas de iniciar esta conexión desde una aplicación en la que confías.",
  "loopbackHost": "esta computadora",
  "accountLabel": "Iniciado sesión como",
  "switchAccount": "Cambiar de cuenta",
  "permissionsTitle": "Si lo permites, esta aplicación puede",
  "permissions": [
    "Busque empresas y lea sus reseñas y fotos públicas en Google Maps.",
    "Utilice la asignación de solicitud mensual de su plan API."
  ],
  "revokeNote": "Puedes desconectarlo en cualquier momento en Aplicaciones conectadas en la administración API.",
  "approve": "Permitir",
  "deny": "Negar y volver a {host}",
  "denyLoopback": "Negar y volver a la aplicación",
  "redirecting": "Volviendo a la aplicación...",
  "invalidTitle": "Esta solicitud de conexión no es válida o ha caducado",
  "invalidText": "Vuelve a tu aplicación de IA y comienza a conectarte nuevamente.",
  "errorTitle": "Esta solicitud de conexión no se puede completar",
  "errorReasons": {
    "rate_limited": "Demasiados intentos de conexión provienen de su red. Espere unos minutos antes de volver a intentarlo.",
    "invalid_client": "La aplicación no está registrada o su registro está incompleto.",
    "invalid_redirect_uri": "La dirección de devolución enviada por la aplicación no coincide con la que registró.",
    "unsupported_response_type": "La aplicación solicitó un tipo de autorización que no es compatible.",
    "invalid_pkce": "La aplicación no envió el control de seguridad requerido (PKCE con S256).",
    "invalid_resource": "La aplicación no solicitó acceso al servidor MapsGrab MCP ni solicitó un servidor diferente.",
    "server_error": "MapsGrab no pudo guardar esta solicitud en este momento. Inténtelo de nuevo en breve."
  },
  "errorHint": "Inicie la conexión nuevamente desde su aplicación AI. Si el problema continúa, comuníquese con el desarrollador de la aplicación.",
  "signInTitle": "Inicia sesión para continuar",
  "signInText": "Inicie sesión en la cuenta MapsGrab que desea conectar. Esta solicitud te esperará.",
  "signIn": "Iniciar sesión",
  "loadFailed": "No se pudo cargar la solicitud de conexión. Verifique su red e inténtelo nuevamente.",
  "decideFailed": "No se pudo completar esta acción. Verifique su red e inténtelo nuevamente.",
  "retry": "Intentar otra vez"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Pago enviado",
      "description": "Estamos confirmando tu pago. La pestaña original se actualizará automáticamente."
    },
    "confirmedCredits": {
      "title": "Créditos añadidos",
      "description": "Su pago de ClinkBill está confirmado y se han agregado los Créditos. Puede volver a la pestaña original."
    },
    "confirmedSubscription": {
      "title": "Plan activado",
      "description": "Tu pago de ClinkBill está confirmado y tu plan MapsGrab está activo. Puede volver a la pestaña original."
    },
    "failed": {
      "title": "El pago necesita atención",
      "description": "No pudimos confirmar este pedido. Regrese a la pestaña original e inténtelo nuevamente."
    }
  },
  "cancel": {
    "title": "Pago cancelado",
    "description": "No se completó ningún pago. Puedes regresar y elegir otro método de pago."
  }
}
