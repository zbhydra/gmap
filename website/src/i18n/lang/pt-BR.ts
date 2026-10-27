import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab é um kit de ferramentas de dados de mapas: obtenha informações comerciais disponíveis publicamente em mapas, revise links, IDs de locais e muito mais com uma extensão de navegador e ferramentas da web.",
    "keywords": "dados de mapas, extrator de mapas do Google, localizador de identificação de local, gerador de links de revisão, ferramentas de mapas"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Navegação primária",
      "mobileLabel": "Navegação móvel",
      "extension": "Extensão",
      "online": "Online",
      "api": "API",
      "apiScraper": "API de extração",
      "apiReviews": "API de avaliações",
      "apiPhotos": "API de fotos",
      "apiMcp": "MCP de extração",
      "apiScraperDesc": "Dados comerciais para qualquer palavra-chave e local, como JSON.",
      "apiReviewsDesc": "Tópicos de revisão completos com classificações e respostas dos proprietários.",
      "apiPhotosDesc": "Galerias de fotos públicas como listas URL prontas para uso.",
      "apiMcpDesc": "Dados de mapas ao vivo para Claude Code, Cursor e VS Code.",
      "apiFootNote": "API e MCP compartilham uma cota de solicitação mensal.",
      "apiPricing": "API preços",
      "pricing": "Preços",
      "freeTools": "Ferramentas gratuitas",
      "signIn": "Entrar",
      "dashboard": "Painel"
    },
    "footer": {
      "legalLabel": "Jurídico",
      "resources": "Ferramentas gratuitas",
      "product": "Produto",
      "rights": "© 2026 MapsGrab. Todos os direitos reservados.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Localizador",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Revise o gerador de links",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Verificador de e-mail",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Conversor de Lat Longo para DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS para conversor decimal",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Gerador de palavras-chave em massa",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Mesclar CSV arquivos on-line",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Instale agora",
    "comingSoon": "Em breve",
    "themeLabel": "Tema de cores",
    "themeLight": "Luz",
    "themeDark": "Escuro",
    "themeSystem": "Sistema",
    "faqLabel": "Perguntas frequentes",
    "breadcrumbLabel": "Pão ralado",
    "languageSwitcherLabel": "Alternador de idioma",
    "mobileMenuLabel": "Alternar menu",
    "copied": "Copiado para a área de transferência",
    "cancel": "Cancelar",
    "continue": "Continuar"
  },
  "dashboard": {
    "create": {
      "title": "Extrator online",
      "newTask": "Nova tarefa",
      "modeLabel": "Modo de pesquisa",
      "modes": {
        "keywords": "Palavras-chave",
        "map": "Mapa",
        "regions": "Regiões"
      },
      "keywords": "Palavras-chave",
      "regionsCta": "Criar consultas por região",
      "placeholder": "cafeteria em Portland\nrestaurante em Austin",
      "count": "{count} / {limit} palavras-chave",
      "duplicates": "Linhas duplicadas ignoradas: {count}",
      "contacts": "Encontre e-mails e perfis sociais",
      "contactsPaid": "Disponível com um plano online pago.",
      "usage": "{used} / {total} registros deste mês",
      "reset": "A cota mensal é renovada no dia 1 (horário de Nova York).",
      "loading": "Carregando seus limites...",
      "optionsFailed": "Não foi possível carregar seus limites de tarefas. Por favor, tente novamente.",
      "submit": "Iniciar extração",
      "submitting": "Enviando...",
      "submitted": "Tarefa enviada",
      "failed": "Falha no envio da tarefa. Atualize o histórico antes de tentar novamente.",
      "exhausted": "Sua cota mensal acabou.",
      "invalid": "Insira até {limit} palavras-chave, cada uma com no máximo 500 caracteres.",
      "map": {
        "invalidKeyword": "Insira uma palavra-chave com até 500 caracteres.",
        "keyword": "Palavra-chave",
        "keywordPlaceholder": "ex.: cafeteria",
        "locationSearch": "Buscar locais",
        "locate": "Localizar por região",
        "locationPlaceholder": "Selecionar país / estado / cidade",
        "coordinates": "Inserir coordenadas",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "radius": "Raio (km)",
        "spacing": "Espaçamento da grade (km)",
        "sampleCount": "{count} / {limit} locais de pesquisa",
        "points": "Pontos da grade: {points}",
        "overLimit": "Reduza o raio ou aumente o espaçamento da grade para permanecer dentro dos locais de pesquisa {limit}.",
        "chooseCenter": "Escolha uma região ou clique no mapa para definir o centro.",
        "mapLabel": "Escolha um centro de pesquisa no mapa",
        "tilesUnavailable": "Os blocos do mapa não puderam ser carregados. Você ainda pode inserir coordenadas.",
        "attribution": "colaboradores do OpenStreetMap"
      },
      "region": {
        "baseKeywords": "Palavras-chave básicas",
        "basePlaceholder": "cafeteria\nrestaurante",
        "country": "País",
        "state": "Estado ou região",
        "citySearch": "Encontre uma cidade",
        "cityPlaceholder": "Opcional: escolha cidades",
        "city": "Cidade",
        "selectCountry": "Selecione um país",
        "allStates": "Todos os estados ou regiões",
        "loading": "Carregando locais...",
        "loadFailed": "Não foi possível carregar os locais. Por favor, tente novamente.",
        "retry": "Tentar novamente",
        "filter": "Filtrar",
        "selectAll": "Selecionar tudo ({count})",
        "clear": "Limpar seleção",
        "selectedCount": "{count} selecionados",
        "more": "Mostrando {shown} de {total}. Continue digitando para refinar.",
        "selectedRegions": "Locais selecionados",
        "remove": "Remover {name}",
        "noMatch": "Nenhum resultado",
        "matchMode": "Frase de pesquisa",
        "inMode": "Em",
        "nearMode": "Aproximar",
        "generate": "Gerar consultas",
        "needBase": "Primeiro informe as palavras-chave base.",
        "needCountry": "Primeiro selecione um país.",
        "willGenerate": "Serão geradas {count} consultas.",
        "finalQueries": "Consultas finais",
        "finalPlaceholder": "As consultas geradas aparecem aqui. Você pode editá-los.",
        "attribution": "Dados de localização: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Painel | MapsGrab",
      "description": "Gerencie suas exportações MapsGrab, acesso API e assinaturas em um espaço de trabalho."
    },
    "shell": {
      "skipToContent": "Pular para o conteúdo",
      "sideLabel": "Espaço de trabalho",
      "homeLabel": "Página inicial da MapsGrab",
      "navLabel": "Menu do espaço de trabalho",
      "loading": "Carregando seu espaço de trabalho...",
      "retry": "Tentar novamente",
      "navOnline": "Extrator online",
      "navJobHistory": "Histórico",
      "navApi": "API gestão",
      "navSubscriptions": "Assinaturas",
      "openMenu": "Abrir menu do espaço de trabalho",
      "closeMenu": "Fechar menu do espaço de trabalho",
      "collapseSidebar": "Recolher barra lateral",
      "expandSidebar": "Expandir barra lateral",
      "back": "Voltar"
    },
    "account": {
      "menuButtonLabel": "Abra o menu da conta",
      "menuLabel": "Menu da conta",
      "logout": "Sair",
      "upgrade": "Fazer upgrade",
      "usageShort": "{used} / {total} registros",
      "planUnavailable": "Indisponível",
      "theme": "Tema",
      "themeLight": "Claro",
      "themeDark": "Escuro",
      "themeSystem": "Sistema",
      "language": "Idioma"
    },
    "history": {
      "title": "Histórico de exportação on-line",
      "description": "Tarefas que você executou no Extrator online, as mais recentes primeiro. Os horários são mostrados no Horário do Leste (New York).",
      "refresh": "Atualizar",
      "autoRefresh": "Atualização automática ativada",
      "loading": "Carregando suas exportações...",
      "loadFailed": "Falha ao carregar seu histórico de exportação.",
      "refreshFailed": "Não foi possível atualizar. Mostrando os últimos resultados carregados.",
      "retry": "Tentar novamente",
      "emptyTitle": "Ainda não há exportações",
      "emptyHint": "Execute uma tarefa no Extrator online e ela aparecerá aqui.",
      "emptyCta": "Ir para o Extrator online",
      "recentTitle": "Tarefas recentes",
      "viewAll": "Ver todas",
      "recentEmptyHint": "As tarefas que você iniciar acima aparecerão aqui.",
      "noMatchTitle": "Nenhuma tarefa encontrada",
      "noMatchHint": "Tente outro número de tarefa ou palavra-chave, ou limpe os filtros.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "e mais {count}",
      "columns": {
        "taskNo": "Tarefa",
        "createdAt": "Criado (ET)",
        "samples": "Pesquisas",
        "records": "Registros",
        "status": "Status"
      },
      "status": {
        "queued": "Na fila",
        "collecting": "Coletando",
        "publishing": "Preparando CSV",
        "completed": "Concluído",
        "partial": "Sucesso parcial",
        "failed": "Fracassado"
      },
      "timezone": "ET",
      "search": {
        "label": "Pesquisar tarefas",
        "placeholder": "Pesquisar por número da tarefa ou palavra-chave",
        "clear": "Limpar pesquisa"
      },
      "filters": {
        "label": "Filtrar tarefas",
        "button": "Filtros",
        "status": "Status",
        "all": "Todas",
        "running": "Em andamento",
        "clear": "Limpar filtros"
      },
      "range": {
        "label": "Período",
        "last7": "Últimos 7 dias",
        "last30": "Últimos 30 dias",
        "all": "Todo o período",
        "custom": "Período personalizado",
        "from": "De",
        "to": "Até",
        "apply": "Aplicar",
        "invalid": "Escolha uma data inicial igual ou anterior à data final.",
        "hint": "As datas usam o horário do Leste (Nova York)."
      },
      "pagination": {
        "label": "Paginação",
        "previous": "Anterior",
        "next": "Próximo",
        "page": "Página {page}",
        "pageSize": "Linhas por página",
        "summary": "{from}–{to} de {total}"
      },
      "detail": {
        "show": "Detalhes",
        "loading": "Carregando pesquisas...",
        "loadFailed": "Falha ao carregar pesquisas para esta tarefa.",
        "keyword": "Palavra-chave",
        "records": "Registros",
        "runNo": "Correr",
        "startedAt": "Iniciado (ET)",
        "finishedAt": "Concluído (ET)",
        "contacts": "E-mails e perfis sociais",
        "contactsEnabled": "Ativado para esta tarefa",
        "contactsDisabled": "Desativado para esta tarefa",
        "completed": "Concluído",
        "pending": "Pendente",
        "viewport": "{lat}, {lng} · ampliar {zoom}"
      },
      "copyJob": "Copiar número da tarefa",
      "dedupeHint": "Os registros são contados depois de remover duplicatas de toda a tarefa.",
      "finished": "Tarefa {job}: {status}",
      "finishedRecords": "{count} registros",
      "downloadCsv": "Baixar CSV",
      "noFile": "Não CSV",
      "errors": {
        "31301": "Não foi possível coletar esta pesquisa.",
        "31302": "Alguns resultados não estão disponíveis. As linhas entregues são retidas.",
        "31303": "O coletor está ocupado. Tente novamente.",
        "31304": "Não foi possível publicar esta exportação."
      },
      "errorFailed": "Não foi possível concluir esta pesquisa.",
      "downloading": "Preparando...",
      "downloadUnavailable": "Não há download CSV. O arquivo pode ter expirado.",
      "downloadFailed": "O download não pôde ser iniciado. Por favor, tente novamente.",
      "signInPrompt": "Faça login para ver seu histórico de exportação on-line.",
      "signInCta": "Entrar",
      "unreachable": "Não foi possível alcançar MapsGrab no momento."
    },
    "api": {
      "description": "Gerencie sua chave API, solicitação mensal e aplicativos de IA conectados.",
      "docsLink": "Ver produtos API",
      "signInPrompt": "Faça login para gerenciar seu acesso API.",
      "loading": "Carregando seu acesso API...",
      "loadFailed": "Não foi possível carregar seu acesso API. Por favor, tente novamente.",
      "retry": "Tentar novamente",
      "refresh": "Atualizar",
      "keyTitle": "Chave de API",
      "keyEmpty": "Você ainda não gerou uma chave API.",
      "generateKey": "Gerar chave API",
      "rotateKey": "Substitua a chave API",
      "generatingKey": "Gerando...",
      "keyOnce": "Copie esta chave agora. Você não poderá visualizá-lo novamente depois de sair ou atualizar esta página.",
      "keyCreated": "Criado",
      "rotateTitle": "Substituir sua chave API?",
      "rotateMessage": "Sua chave atual irá parar de funcionar imediatamente. Atualize todos os aplicativos que o utilizam com a nova chave.",
      "cancel": "Cancelar",
      "copyKey": "Copie a chave API",
      "copied": "Copiado",
      "copyFailed": "Não foi possível copiar. Selecione o texto e copie-o manualmente.",
      "keyFailed": "Não foi possível gerar uma chave API. Por favor, tente novamente.",
      "usageTitle": "Uso mensal de API",
      "usageFailed": "Não foi possível carregar o uso da API. Tente novamente.",
      "usageValue": "{used} / {total} solicitações",
      "usagePeriod": "Período: {period}",
      "quotaExhausted": "Seu limite de solicitação mensal está esgotado.",
      "quotaReset": "Renova no dia 1 (ET) · comum à API e ao MCP",
      "planTitle": "API plano",
      "managePlan": "Gerenciar assinaturas",
      "connectionsTitle": "Conectar",
      "connectTabsLabel": "Método de conexão",
      "connectDocs": {
        "api": "Referência da API",
        "mcp": "Guia de configuração do MCP",
        "mcpKey": "Guia com chave de API"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + chave de API"
      },
      "apiUrl": "API base URL",
      "mcpUrl": "MCP servidor URL",
      "mcpHint": "Adicione este URL em seu cliente MCP. Faça login e aprove a conexão quando abrir este site.",
      "mcpKeyHint": "Para clientes que não conseguem abrir um navegador para fazer login. As solicitações usam sua chave de API, sem etapa de aprovação.",
      "mcpConfigTitle": "Configuração do cliente",
      "mcpConfigHint": "Adicione esta entrada à configuração do seu cliente MCP. Os nomes dos campos variam um pouco entre clientes.",
      "mcpUnavailable": "O endereço de conexão MCP ainda não está disponível.",
      "copyUrl": "Copiar URL",
      "curlTitle": "Início rápido",
      "curlHint": "Substitua o marcador pela sua chave de API completa.",
      "grants": {
        "title": "Aplicativos conectados",
        "description": "Aplicativos que você permitiu pesquisar empresas e ler comentários e fotos públicas usando seu subsídio API.",
        "loading": "Carregando aplicativos conectados...",
        "empty": "Nenhum aplicativo está conectado.",
        "loadFailed": "Não foi possível carregar os aplicativos conectados. Por favor, tente novamente.",
        "selfDeclared": "Nome dado ao aplicativo: {name}",
        "createdLabel": "Conectado (ET)",
        "refreshedLabel": "Última atualização (ET)",
        "notRefreshed": "Ainda não",
        "revoke": "Desconectar",
        "revokeTitle": "Desconectar este aplicativo?",
        "revokeMessage": "{host} perderá o acesso imediatamente e precisará da sua aprovação para se conectar novamente.",
        "revokeFailed": "Não foi possível desconectar este aplicativo. Por favor, tente novamente.",
        "paginationLabel": "Páginas de aplicativos conectados",
        "pageOf": "Página {page} de {pages}"
      }
    },
    "subscriptions": {
      "title": "Assinaturas",
      "description": "Planos e status de renovação do Extrator online, da extensão do navegador e do API. Compre ou atualize na página de preços.",
      "lines": {
        "online": "Extrator online",
        "extension": "Extensão do navegador",
        "api": "API"
      },
      "planLabel": "Plano",
      "expiresLabel": "Renova / expira",
      "free": "Livre",
      "unavailable": "Temporariamente indisponível",
      "autoRenewOn": "Renovação automática ativada",
      "autoRenewOff": "Renovação automática desativada",
      "paidVia": "Pago com {method}",
      "subscribeCta": "Escolha um plano",
      "pricingLink": "Ver preços",
      "manageSubscription": "Gerenciar assinatura",
      "managingSubscription": "Abertura...",
      "manageFailed": "Não foi possível abrir o gerenciamento da assinatura. Tente novamente.",
      "signInPrompt": "Faça login para ver suas assinaturas."
    },
    "cancelGuide": {
      "title": "Gerencie sua assinatura no provedor de pagamento",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Faça login em PayPal e abra Configurações.",
            "Vá para Pagamentos e depois Pagamentos Automáticos.",
            "Selecione MapsGrab e escolha Cancelar."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Abra o link do Portal do Cliente no seu e-mail de compra.",
            "Faça login e selecione sua assinatura MapsGrab.",
            "Escolha Cancelar."
          ]
        }
      ],
      "closeLabel": "Fechar"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Colete Google Maps Dados de negócios em CSV e JSON",
        "description": "MapsGrab é uma extensão de navegador e um kit de ferramentas da web que coleta informações comerciais disponíveis publicamente de Google Maps – nomes, telefones, comentários, fotos, e-mails – e as exporta para CSV ou JSON."
      },
      "hero": {
        "announce": {
          "badge": "Novo",
          "text": "MCP servidor para agentes de IA"
        },
        "title": {
          "firstLine": "Extraia dados do Google Maps",
          "secondLine": "com",
          "accent": "um clique",
          "end": "."
        },
        "lead": "Colete dados comerciais públicos de Google Maps — nomes, telefones, sites, avaliações, fotos e e-mails — e exporte CSV ou JSON limpos em segundos.",
        "search": {
          "label": "Palavra-chave de pesquisa",
          "typing": [
            "cafeteria em Portland",
            "dentista em Austin, Texas",
            "encanador perto de Chicago",
            "estúdio de ioga no Brooklyn",
            "hotéis em Miami Beach"
          ],
          "submit": "Visualizar resultados",
          "loading": "Procurando…",
          "suggestLabel": "Tentar",
          "suggestions": [
            "cafeteria em Portland",
            "dentista em Austin, Texas",
            "encanador perto de Chicago"
          ]
        },
        "trust": [
          "Não é necessário cartão de crédito",
          "{records} registros grátis/mês",
          "CSV e JSON exportar"
        ],
        "dashboard": "Abra o extrator online",
        "theater": {
          "panelLabel": "MapsGrab visualização do painel",
          "extensionActive": "MapsGrab extensão ativa",
          "mapFilters": [
            "Abra agora",
            "Melhor avaliado",
            "Preço"
          ],
          "live": "Ao vivo",
          "done": "Feito",
          "start": "Iniciar extração",
          "pause": "Pausa",
          "extracting": "Extraindo {count}…",
          "finished": "Concluído · {count} lugares",
          "kpis": {
            "phones": "telefones",
            "emails": "e-mails",
            "websites": "sites"
          },
          "export": "Exportar lista detalhada - {count} (.CSV)",
          "exportSaved": "Exportação salva",
          "emailFound": "E-mail encontrado",
          "averageRating": "Avaliação média",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} comentários"
        },
        "preview": {
          "title": "Resultados",
          "count": "{count} empresas na primeira página de resultados",
          "columns": {
            "name": "Nome",
            "address": "Endereço",
            "category": "Categoria",
            "rating": "Avaliação",
            "reviews": "Avaliações",
            "phone": "Telefone"
          },
          "locked": "Faça login e envie suas palavras-chave no Extrator online para coletar e exportar resultados.",
          "signIn": "Faça login para iniciar uma tarefa completa",
          "failed": "Não foi possível carregar a visualização. Por favor, tente novamente.",
          "empty": "Nenhuma empresa encontrada na primeira página de resultados."
        }
      },
      "facts": {
        "caption": "MapsGrab pelos números",
        "items": [
          {
            "value": 36,
            "label": "colunas de dados por empresa"
          },
          {
            "value": 11,
            "label": "campos de revisão, incluindo respostas do proprietário"
          },
          {
            "value": 6,
            "label": "redes sociais correspondentes por site"
          },
          {
            "value": "freeRecords",
            "label": "registros gratuitos, todos os meses"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "maneiras de executá-lo: Extensão, Online, API — mais MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Como funciona",
          "title": {
            "lead": "De uma pesquisa no mapa a uma ",
            "accent": "planilha",
            "tail": " em três etapas"
          },
          "lead": "Sem código e sem copiar e colar. MapsGrab lê o que Google Maps já mostra e transforma em linhas estruturadas."
        },
        "steps": [
          {
            "title": "Pesquisar Google Maps",
            "body": "Abra Google Maps e pesquise qualquer tipo de negócio e localização – exatamente como faria normalmente."
          },
          {
            "title": "Iniciar extração",
            "body": "Clique em {action}. MapsGrab rola os resultados, coleta as listagens e, quando ativado, enriquece os contatos.",
            "action": "Iniciar extração"
          },
          {
            "title": "Exporte para qualquer lugar",
            "body": "Baixe CSV ou JSON com as colunas que você escolher – comentários e fotos vão para seus próprios arquivos, prontos para Excel ou CRM."
          }
        ],
        "searchSample": "padaria em Seattle",
        "columnsUnit": "colunas",
        "reviewsFile": "comentários"
      },
      "products": {
        "head": {
          "kicker": "Produtos",
          "title": {
            "lead": "Três maneiras de ",
            "accent": "captar",
            "tail": " Dados de mapas."
          },
          "lead": "Escolha a extensão do navegador, o Extrator online baseado em nuvem ou o API. A extensão funciona dentro do seu próprio navegador; o Extrator online e o API compartilham um mecanismo de nuvem."
        },
        "cards": {
          "extension": {
            "badge": "Extensão do navegador",
            "title": "Obtenha dados enquanto você navega Google Maps",
            "body": "Extraia dados comerciais, comentários e fotos das páginas do Maps que você abrir e exporte tudo localmente. Borda, Firefox e Chromium.",
            "link": "Explorar a extensão"
          },
          "online": {
            "badge": "Extrator online",
            "title": "A nuvem é executada. Nada para instalar.",
            "body": "Cole palavras-chave, colete detalhes de negócios na nuvem e baixe uma coluna 37 CSV desduplicada por tarefa.",
            "link": "Explore o extrator online"
          },
          "api": {
            "badge": "API",
            "title": "Limpe JSON mais de HTTP",
            "body": "Dados comerciais e análises para seus próprios aplicativos — uma chave API.",
            "link": "Explore o API"
          },
          "mcp": {
            "badge": "MCP servidor",
            "title": "Dados do Live Maps para seus agentes de IA",
            "body": "Pesquise e revise como ferramentas MCP para Claude Code, Cursor, VS Code e Codex.",
            "link": "Explore o servidor MCP"
          }
        },
        "extracting": "Extraindo {count}…",
        "queue": {
          "rows": "{count} linhas",
          "processing": "Processamento"
        },
        "chat": {
          "prompt": "Encontre dentistas em Austin com classificação 4.5+ em um site",
          "answer": "Encontradas {count} correspondências. Três principais:"
        }
      },
      "fields": {
        "head": {
          "kicker": "Os dados",
          "title": {
            "lead": "36 colunas. ",
            "accent": "Todos",
            "tail": " úteis."
          },
          "lead": "A extensão exporta um esquema dos resultados de pesquisa e páginas comerciais – detalhes de contato, localização, perfil, classificações e todos os identificadores necessários para corresponder aos registros posteriormente."
        },
        "filtersLabel": "Grupos de campos",
        "all": "Todos",
        "groups": {
          "contact": {
            "filter": "Contato",
            "label": "Contato"
          },
          "location": {
            "filter": "Localização",
            "label": "Localização"
          },
          "profile": {
            "filter": "Perfil",
            "label": "Perfil comercial"
          },
          "reviews": {
            "filter": "Avaliações",
            "label": "Avaliações e comentários"
          },
          "ids": {
            "filter": "IDs e links",
            "label": "IDs e links"
          }
        },
        "sampleLabel": "Valor da amostra",
        "emptySample": "(vazio)",
        "descriptions": {
          "Name": "Nome da empresa exatamente como mostrado na listagem.",
          "Description": "Breve descrição do perfil da empresa.",
          "Fulladdress": "Endereço completo e formatado.",
          "Street": "Linha da rua do endereço.",
          "Municipality": "Cidade ou localidade.",
          "Categories": "Cada categoria atribuída ao negócio.",
          "About": "Atributos da guia Sobre.",
          "Plus Code": "Coluna reservada para o Código de Localização Aberta — exportada vazia por enquanto.",
          "Time Zone": "Fuso horário IANA do local.",
          "Price": "Nível de preço mostrado na listagem.",
          "Note": "Nota ou destaque do comerciante.",
          "Amenities": "Comodidades e opções de serviços.",
          "Hotel Class": "Classe estrela para listagens de hospedagem.",
          "Phone": "Número de telefone principal mostrado na listagem.",
          "Phones": "Cada número de telefone encontrado para a empresa.",
          "Claimed": "Se o proprietário reivindicou o perfil.",
          "Owner": "Nome do proprietário no perfil.",
          "Owner Id": "ID do colaborador da conta do proprietário.",
          "Owner Link": "Link para a página de contribuidor do proprietário.",
          "Email": "Endereços de e-mail encontrados no site da empresa.",
          "Social Medias": "Perfis sociais vinculados ao site.",
          "Review Count": "Número total de avaliações.",
          "Average Rating": "Avaliação média por estrelas.",
          "Review URL": "Link direto para o painel de avaliações.",
          "Google Maps URL": "Link curto estável construído a partir de CID.",
          "Google Knowledge URL": "Link de pesquisa do painel de conhecimento.",
          "Latitude": "Latitude em graus decimais.",
          "Longitude": "Longitude em graus decimais.",
          "Website": "Site oficial da listagem.",
          "Domain": "Domínio registrável do site.",
          "Opening Hours": "Horário semanal, dias fechados marcados.",
          "Featured Image": "Foto da capa URL do anúncio.",
          "Cid": "ID do cliente — a forma decimal de FID.",
          "Fid": "ID do recurso composto por duas metades hexadecimais.",
          "Place Id": "Estável Google Place ID.",
          "Kgmid": "ID da máquina do Gráfico de conhecimento."
        },
        "reviews": {
          "title": "+ 11 colunas de revisão",
          "body": "Exportado separadamente, paginado até o limite do seu plano."
        },
        "photos": {
          "title": "+ foto URL listas",
          "body": "Foto pública do álbum URLs por empresa, filtrada pelo Street View."
        },
        "sampleCsv": "Baixar amostra CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Enriquecimento",
          "title": {
            "lead": "De um pin para uma pessoa você pode ",
            "accent": "e-mail",
            "tail": ""
          },
          "lead": "Quando o enriquecimento está ativado, MapsGrab consulta o site oficial de cada negócio e preenche os canais de contato direto enquanto extrai."
        },
        "points": [
          "Endereços de e-mail encontrados no site da empresa",
          "Perfis sociais: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Ativado por padrão em planos online pagos, uma configuração na extensão",
          "Incluído nas respostas de pesquisa API com um sinalizador - nenhuma etapa de enriquecimento separada"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Para desenvolvedores",
          "title": {
            "lead": "Conecte os dados do Maps em ",
            "accent": "qualquer coisa",
            "tail": " que você construir"
          },
          "lead": "O mecanismo de nuvem por trás do Extrator online, exposto como um servidor HTTP API e um servidor MCP. JSON estruturado, uma chave, sem HTML para analisar."
        },
        "listLabel": "Produtos para desenvolvedores",
        "items": {
          "search": {
            "title": "API de extração",
            "description": "Empresas para qualquer palavra-chave e localização"
          },
          "reviews": {
            "title": "API de avaliações",
            "description": "Avaliações, mensagens de texto e respostas do proprietário"
          },
          "photos": {
            "title": "API de fotos",
            "description": "Foto pública URLs por empresa"
          },
          "mcp": {
            "title": "MCP servidor",
            "description": "Ferramentas de pesquisa e avaliação para qualquer cliente MCP"
          }
        },
        "langLabel": "Linguagem",
        "copyLabel": "Solicitação de cópia",
        "sending": "Enviando solicitação…",
        "response": "Resposta · 200 OK · {ms} ms",
        "toolCall": "Chamada de ferramenta · {tool} · 200 OK",
        "exploreApi": "Explore o API",
        "apiPricing": "API preços",
        "worksWith": "Funciona com as ferramentas que você já usa",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Excel",
          "CSV",
          "JSON",
          "ZIP pacotes"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Casos de uso",
          "title": {
            "lead": "Feito para o trabalho ",
            "accent": "depois",
            "tail": " da pesquisa"
          }
        },
        "cards": [
          {
            "label": "Geração de leads",
            "title": "Listas de leads locais",
            "body": "Pesquise uma categoria e uma cidade e exporte toda a página de resultados (incluindo telefones, sites e e-mails) para uma planilha."
          },
          {
            "label": "SEO local",
            "title": "Benchmarks do concorrente",
            "body": "Obtenha classificações e revise contagens de cada concorrente em uma área em uma única passagem e crie o relatório diretamente da exportação."
          },
          {
            "label": "Pesquisa de mercado",
            "title": "Conjuntos de dados de localização",
            "body": "Colete IDs de locais e coordenadas de cada filial ou local concorrente, prontos para suas ferramentas de mapeamento e roteamento."
          }
        ],
        "leadTags": [
          "e-mail",
          "telefone",
          "e-mail",
          "site"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Preços",
          "title": {
            "lead": "Comece gratuitamente. ",
            "accent": "Escale",
            "tail": " quando vale a pena."
          },
          "lead": "Cada produto tem um nível gratuito sem limite de tempo. Atualize apenas a superfície que você realmente usa."
        },
        "lines": {
          "extension": {
            "title": "Extensão do navegador",
            "billing": "Mensal",
            "link": "Veja planos de extensão"
          },
          "online": {
            "title": "Extrator online",
            "billing": "Único",
            "link": "Veja planos on-line"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Único",
            "link": "Veja planos API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Ferramentas gratuitas",
          "title": {
            "lead": "Pequenas ferramentas para mapas ",
            "accent": "usuários avançados",
            "tail": ""
          },
          "lead": "Sete utilitários que são executados inteiramente no seu navegador — o que você cola nunca sai do seu dispositivo."
        },
        "descriptions": {
          "place-id-finder": "Cole um lugar URL do Maps e leia seus Place ID, CID e FID.",
          "review-link-generator": "Obtenha o link direto “escrever um comentário” para qualquer empresa.",
          "email-checker": "Veja instantaneamente se um formato de e-mail é válido — com dicas de digitação.",
          "lat-long-to-dms": "Coordenadas decimais em graus, minutos e segundos.",
          "dms-to-dd": "DMS coordenadas de volta para graus decimais limpos.",
          "bulk-keywords-generator": "Cada combinação “palavra-chave + localização”, pronta para colar.",
          "merge-csv": "Mesclar exportações CSV em um arquivo, alinhado por cabeçalho."
        },
        "more": "Mais ferramentas a caminho"
      },
      "faq": {
        "kicker": "Perguntas frequentes",
        "title": {
          "lead": "",
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "lead": "As respostas curtas. Qualquer outra coisa, o suporte está a um e-mail de distância.",
        "contact": "Contate o suporte",
        "items": [
          {
            "question": "O uso de MapsGrab é gratuito?",
            "answer": "Sim. A extensão funciona sem conta e inclui uma cota mensal gratuita de registros. Os planos pagos na página Preços aumentam os limites quando você precisa de mais."
          },
          {
            "question": "Quais navegadores são suportados?",
            "answer": "Baixe MapsGrab na página Extensão. Chrome, Edge e Brave carregam o ZIP descompactado; Firefox usa um complemento temporário separado que deve ser recarregado após a reinicialização. A página inclui instruções de instalação e atualização."
          },
          {
            "question": "De onde vêm os dados e é legal coletá-los?",
            "answer": "MapsGrab coleta apenas informações que são exibidas publicamente nas páginas Google Maps que você visita — os mesmos detalhes que qualquer visitante pode ler. Não acessamos contas privadas, conteúdo fechado ou dados não públicos."
          },
          {
            "question": "Preciso instalar alguma coisa para as ferramentas da web?",
            "answer": "Não. As ferramentas gratuitas da web são executadas inteiramente no seu navegador — suas informações nunca saem do seu dispositivo."
          },
          {
            "question": "Para quais formatos posso exportar?",
            "answer": "As exportações vêm como CSV ou JSON com a seleção de campo que você escolher, desduplicada por Place ID."
          },
          {
            "question": "MapsGrab vê os dados que coleto?",
            "answer": "Suas configurações e resultados são armazenados localmente em seu navegador. Nossos servidores lidam apenas com configuração remota, status de conta e cota, enriquecimento opcional de e-mail/social e registros de uso mínimo."
          }
        ]
      },
      "cta": {
        "kicker": "Comece",
        "title": {
          "lead": "Comece a pegar em ",
          "accent": "minutos",
          "tail": ""
        },
        "lead": "Instale a extensão, abra Google Maps, pesquise e exporte sua primeira lista – sem necessidade de conta.",
        "install": "Instale MapsGrab grátis",
        "online": "Experimente o extrator online",
        "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab para Chrome, Edge e Firefox — Google Maps Extensão do extrator",
        "description": "Extraia colunas 36 de dados comerciais, avaliações e fotos de Google Maps, enriqueça registros com e-mails e links sociais, execute tarefas em lote e exporte para CSV ou JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Baixe para Chrome, Edge e Firefox"
        },
        "title": {
          "lead": "O extrator Google Maps para ",
          "accent": "seu navegador",
          "tail": ""
        },
        "lead": "Abra qualquer página de pesquisa ou comercial Google Maps e pegue o que é mostrado publicamente lá: dados comerciais, avaliações, fotos e detalhes de contato. Tudo é exportado para CSV ou JSON, direto do seu navegador.",
        "downloadCta": "Baixe para Chrome e Edge",
        "installCta": "Guia de instalação",
        "meta": [
          "Nenhuma conta necessária",
          "1,000 registros grátis/mês",
          "As exportações permanecem na sua máquina"
        ],
        "theater": {
          "panelLabel": "MapsGrab visualização do painel",
          "extensionActive": "MapsGrab está ativo nesta página",
          "dock": "Encaixar à esquerda/direita",
          "filters": [
            "Abra agora",
            "Melhor avaliado",
            "Preço"
          ],
          "open": "Abrir",
          "closes": "Fecha {time}",
          "endOfList": "Você chegou ao fim da lista.",
          "start": "Iniciar extração",
          "extracting": "Extraindo {count}…",
          "pause": "Pausa",
          "complete": "Extração concluída.",
          "reset": "Reiniciar",
          "kpis": {
            "phones": "telefones",
            "websites": "sites",
            "emails": "e-mails"
          },
          "exportCta": "Exportar lista detalhada - {count} (.CSV)",
          "saved": "Salvo em downloads",
          "scrollChip": {
            "label": "Rolagem automática",
            "value": "Ritmo humano, 5–10 s"
          },
          "dedupeChip": {
            "label": "Desduplicado",
            "value": "por Place ID"
          }
        }
      },
      "facts": {
        "caption": "A extensão em resumo",
        "items": [
          {
            "value": 36,
            "label": "colunas por empresa, do nome até Place ID"
          },
          {
            "value": 11,
            "label": "colunas de revisão, incluindo respostas do proprietário"
          },
          {
            "value": 6,
            "label": "redes sociais correspondentes por site"
          },
          {
            "value": 1000,
            "label": "registros gratuitos todos os meses, sem necessidade de conta"
          },
          {
            "value": 500,
            "label": "palavras-chave ou revisão URLs por tarefa em lote"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Onde funciona",
          "title": {
            "lead": "Um painel para cada ",
            "accent": "Visualização de mapas",
            "tail": ""
          },
          "lead": "O painel MapsGrab aparece logo em Google Maps. Os resultados da pesquisa, as páginas comerciais e as listas salvas obtêm o modo de extração correto - sem copiar e colar, sem malabarismo com guias."
        },
        "search": {
          "title": "Resultados da pesquisa",
          "description": "Pressione Iniciar extração em qualquer pesquisa. MapsGrab rola a lista de resultados em um ritmo humano e coleta cada listagem à medida que carrega."
        },
        "place": {
          "title": "Páginas de negócios",
          "description": "Em uma página comercial, a guia Avaliações e fotos exibe avaliações e álbuns de fotos - as avaliações são exportadas com colunas 11, fotos como listas URL.",
          "tabs": [
            "Visão geral",
            "Críticas e fotos"
          ],
          "reviewsCta": "Comece a extrair comentários",
          "photosCta": "Comece a extrair fotos",
          "reviewsCount": "{count} comentários",
          "photosCount": "{count} fotos"
        },
        "saved": {
          "title": "Listas salvas",
          "description": "Abra uma lista salva e pressione Iniciar uma vez. MapsGrab abre cada lugar por vez e os coleta – sem cliques por item.",
          "listName": "Favoritos · {count} lugares"
        }
      },
      "features": {
        "head": {
          "kicker": "Características",
          "title": {
            "lead": "Tudo o que uma página do Maps mostra, ",
            "accent": "estruturado",
            "tail": ""
          },
          "lead": "Um esquema de extração entre resultados de pesquisa e páginas de negócios, ajustado na interface Google Maps atual e atualizado remotamente quando Google muda."
        },
        "tabsLabel": "Recursos de extensão",
        "tabs": [
          {
            "id": "business",
            "title": "Dados comerciais",
            "description": "36 colunas por empresa, capturadas à medida que a lista rola."
          },
          {
            "id": "reviews",
            "title": "Avaliações",
            "description": "Avaliações com respostas do proprietário, paginadas automaticamente."
          },
          {
            "id": "photos",
            "title": "Fotos",
            "description": "Fotos do álbum como listas URL prontas para usar."
          },
          {
            "id": "enrichment",
            "title": "E-mail e enriquecimento social",
            "description": "Canais de contato direto do site oficial."
          },
          {
            "id": "batch",
            "title": "Tarefas em lote",
            "description": "Uma fila de palavras-chave ou revisão URLs, percorrida item por item."
          },
          {
            "id": "export",
            "title": "Exportar",
            "description": "CSV ou JSON, salvo direto na sua máquina."
          }
        ],
        "business": {
          "claimed": "Reivindicado",
          "fields": {
            "phone": "Telefone",
            "website": "Site",
            "rating": "Avaliação média",
            "hours": "Horário de funcionamento",
            "timeZone": "Fuso horário",
            "coordinates": "Coordenadas",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} comentários",
          "columns": "{count} colunas por empresa",
          "reserved": "Plus Code reservado",
          "more": "+{count} mais"
        },
        "reviews": {
          "title": "Avaliações",
          "columns": "{count} colunas",
          "ownerReply": "Resposta do proprietário",
          "loading": "Carregando a próxima página de comentários"
        },
        "photos": {
          "streetView": "Street View · filtrado"
        },
        "enrichment": {
          "website": "Site oficial",
          "moreNetworks": "X, YouTube e TikTok também foram verificados"
        },
        "batch": {
          "complete": "{count} completo",
          "stuck": "{count} preso",
          "total": "{count} total",
          "done": "Completo · {count}",
          "skipped": "Nenhum progresso por 90 s · ignorado",
          "running": "Extraindo…",
          "queued": "Na fila",
          "autoExport": "Exporta automaticamente quando a tarefa termina"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} linhas · {selected} de {total} colunas selecionadas · desduplicadas por Place ID",
          "destinations": [
            {
              "title": "Transferências",
              "description": "Salvo pelo seu navegador"
            },
            {
              "title": "Seletor de coluna",
              "description": "Exporte apenas as colunas que você precisa"
            },
            {
              "title": "Download automático",
              "description": "Salva assim que a extração termina"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Tarefas em lote",
          "title": {
            "lead": "Coloque a lista na fila. ",
            "accent": "Vá embora.",
            "tail": ""
          },
          "lead": "Cole até 500 palavras-chave ou revise URLs em uma tarefa. MapsGrab percorre-os item por item com progresso ao vivo, pula qualquer coisa que pare e exporta automaticamente quando a tarefa termina."
        },
        "checks": [
          "As tarefas de palavras-chave executam uma pesquisa no Maps por palavra-chave",
          "Revisão-URL tarefas coletam avaliações negócio por negócio",
          "O estado da tarefa é salvo no disco – ele é retomado após a reinicialização do navegador",
          "Até 150 tarefas salvas, um lote sendo executado por vez"
        ],
        "mock": {
          "tabs": [
            "Ferramenta de dados de palavras-chave em massa",
            "Extrator de avaliações em massa Google"
          ],
          "taskName": "Nome da tarefa",
          "taskPlaceholder": "por exemplo 100 palavras-chave, agência de design",
          "keywords": "Palavras-chave · uma por linha",
          "lineCount": "{count} / {limit}",
          "start": "Iniciar extração",
          "columns": {
            "task": "Nome da tarefa",
            "status": "Status",
            "actions": "Ações"
          },
          "running": "Correndo",
          "complete": "Completo",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} preso",
          "progressExported": "{done} / {total} · exportado",
          "lines": {
            "run": "extraindo…",
            "done": "completo",
            "stuck": "preso · ignorado"
          },
          "toast": "Tarefa concluída – exportada",
          "chip": {
            "label": "Estado da tarefa",
            "value": "Salvo no disco"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Local primeiro",
          "title": {
            "lead": "Seus resultados ficam ",
            "accent": "no seu navegador",
            "tail": ""
          },
          "lead": "Configurações e resultados são armazenados localmente. Nossos servidores lidam apenas com configuração remota, status de conta e cota, e-mail opcional e enriquecimento social e registros de uso mínimo."
        },
        "checks": [
          "As exportações são geradas em sua máquina",
          "Seleção de coluna e desduplicação Place ID executadas localmente antes do arquivo ser salvo",
          "A configuração remota mantém o painel atualizado quando Google Maps é alterado — sem reinstalação",
          "Se algo não puder ser lido, o painel mostrará um erro em vez de falhar silenciosamente"
        ],
        "diagram": {
          "browser": "Seu navegador",
          "servers": "MapsGrab servidores",
          "nodes": {
            "mapsTab": "guia Google Maps",
            "panel": "MapsGrab painel",
            "storage": "Armazenamento local",
            "exports": "Suas exportações",
            "config": "Configuração remota",
            "quota": "Conta e cota",
            "enrichment": "Enriquecimento"
          },
          "flows": {
            "rows": "linhas de negócios",
            "rules": "regras",
            "usage": "uso",
            "websites": "sites de negócios → e-mails e redes sociais"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Instalar",
          "title": {
            "lead": "Instale ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "Baixe o ZIP aqui e siga os passos para o seu navegador. Chrome, Edge e Brave carregam a pasta descompactada. Firefox usa um complemento temporário separado que deve ser recarregado após a reinicialização. Clique em qualquer imagem para visualizá-la em tamanho real."
        },
        "zip": {
          "title": "Instalação direta (liberação zip)",
          "description": "Escolha o ZIP para o seu navegador. Extraia-o para uma pasta que você guarda e carregue-o usando o guia abaixo. Para atualizar, baixe um novo ZIP, substitua os arquivos dessa pasta e recarregue a extensão.",
          "button": "Chrome, Borda e Brave ZIP",
          "firefoxButton": "Firefox ZIP (complemento temporário)",
          "meta": "Versão {version} · pré-lançamento"
        },
        "browserLabel": "Navegador",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Borda",
            "note": "Edge, Chrome, Brave e outros navegadores Chromium",
            "steps": [
              {
                "title": "Baixe e descompacte",
                "description": [
                  "Download ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Em Windows, clique com o botão direito e escolha “Extrair tudo”. Em macOS, clique duas vezes nele. Mantenha a pasta extraída."
                ],
                "shot": "MapsGrab ZIP baixado em Chrome"
              },
              {
                "title": "Abra a página de extensões",
                "description": [
                  "Abrir ",
                  {
                    "code": "chrome://extensions"
                  },
                  " em Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " no Edge, ou ",
                  {
                    "code": "brave://extensions"
                  },
                  " em Brave."
                ],
                "shot": "A página de gerenciamento de extensões"
              },
              {
                "title": "Ativar modo de desenvolvedor",
                "description": [
                  "Ative o modo Desenvolvedor na página de extensões. Em Chrome, a chave está no canto superior direito."
                ],
                "shot": "Modo de desenvolvedor ativado com o botão Carregar descompactado visível"
              },
              {
                "title": "Carregue a pasta descompactada",
                "description": [
                  "Clique em “Carregar descompactado” e selecione a pasta extraída. MapsGrab aparece na lista de extensões. Abra uma pesquisa Google Maps para usá-lo."
                ],
                "shot": "Carregue descompactado com o cartão MapsGrab adicionado"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Complemento temporário; recarregue-o após reiniciar Firefox",
            "steps": [
              {
                "title": "Baixe e descompacte",
                "description": [
                  "Download ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Em Windows, clique com o botão direito e escolha “Extrair tudo”. Em macOS, clique duas vezes nele. Mantenha a pasta extraída."
                ],
                "shot": "MapsGrab Firefox ZIP baixado em Firefox"
              },
              {
                "title": "Abra a página de depuração",
                "description": [
                  "Navegue até ",
                  {
                    "code": "about:debugging"
                  },
                  "e selecione seu navegador na barra lateral esquerda."
                ],
                "shot": "Firefox página de depuração com controles complementares temporários"
              },
              {
                "title": "Carregue o complemento",
                "description": [
                  "Clique em “Carregar complemento temporário…” e escolha ",
                  {
                    "code": "manifest.json"
                  },
                  " dentro da pasta descompactada. Um complemento temporário é descarregado quando Firefox é reiniciado; repita esta etapa para carregá-lo novamente."
                ],
                "shot": "MapsGrab carregado como uma extensão Firefox temporária com seu script em segundo plano em execução"
              }
            ]
          }
        ],
        "help": {
          "title": "Problemas de instalação?",
          "description": "Envie-nos o nome do navegador e o que você viu – nós o desbloquearemos.",
          "cta": "Contate o suporte"
        },
        "notes": {
          "kicker": "Notas de lançamento",
          "version": "0.1.0",
          "status": "Pré-lançamento",
          "date": "Agosto 2026",
          "items": [
            "Primeiro pré-lançamento da extensão MapsGrab",
            "Extração de pesquisa Google Maps com rolagem automática e esquema de coluna 36",
            "Revisão e extração de fotos de páginas comerciais",
            "Enriquecimento de e-mail e mídia social por empresa",
            "Palavra-chave em lote e tarefas de revisão-URL com estado de tarefa no disco",
            "CSV / JSON exportação com seleção de campo e Place ID desduplicação",
            "Compila para Microsoft Edge e Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Planos de extensão",
          "title": {
            "lead": "Uma extensão, três ",
            "accent": "planos",
            "tail": ""
          },
          "lead": "Cada linha coletada pela extensão – uma empresa, um comentário ou uma foto – conta como um registro. Todos os planos incluem avaliações, fotos e tarefas em lote; planos pagos exportam todas as colunas 36, incluindo e-mail e enriquecimento social, com maior volume mensal."
        },
        "note": "O uso mensal é redefinido no 1st no horário New York; registros não utilizados não são transferidos.",
        "compare": "Compare todos os planos"
      },
      "faq": {
        "kicker": "Perguntas frequentes",
        "title": {
          "lead": "",
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "lead": "As respostas curtas. Qualquer outra coisa, o suporte está a um e-mail de distância.",
        "contact": "Contate o suporte",
        "items": [
          {
            "question": "O uso da extensão é gratuito?",
            "answer": "Sim. A extensão funciona sem conta e inclui 1,000 registros todos os meses. Os planos pagos na página Preços adicionam todas as colunas 36 com enriquecimento de e-mail e mídia social e aumentam o volume mensal."
          },
          {
            "question": "Quais navegadores são suportados?",
            "answer": "Chrome, Edge, Brave e outros navegadores Chromium carregam o ZIP descompactado baixado aqui. Firefox possui um ZIP separado para carregamento temporário; recarregue-o após cada reinicialização do navegador. Siga o guia de instalação acima."
          },
          {
            "question": "Preciso fazer login?",
            "answer": "Não. A extração de núcleo funciona sem uma conta. A cota é contada por conta conectada ou por dispositivo de navegador quando você não está conectado. Faça login com a conta que possui um plano para que o volume maior seja aplicado."
          },
          {
            "question": "O que conta como um recorde?",
            "answer": "Cada linha coletada pela extensão conta como um registro: uma empresa de uma pesquisa ou lista salva, um comentário ou uma foto. O enriquecimento por e-mail e social não adiciona registros."
          },
          {
            "question": "O que acontece quando Google Maps muda?",
            "answer": "As regras de extração são fornecidas como configuração remota, portanto, as correções chegam ao painel sem reinstalar a extensão. Se uma página não puder ser lida, o painel mostrará um erro em vez de falhar silenciosamente."
          },
          {
            "question": "MapsGrab vê os dados que coleto?",
            "answer": "Suas configurações e resultados são armazenados localmente em seu navegador. Nossos servidores lidam apenas com configuração remota, status de conta e cota, e-mail opcional e enriquecimento social e registros de uso mínimo."
          },
          {
            "question": "De onde vêm os dados e é legal coletá-los?",
            "answer": "MapsGrab coleta apenas informações que são exibidas publicamente nas páginas Google Maps que você visita — os mesmos detalhes que qualquer visitante pode ler. Não acessamos contas privadas, conteúdo fechado ou dados não públicos."
          }
        ]
      },
      "cta": {
        "kicker": "Comece",
        "title": {
          "lead": "Pegue sua primeira lista ",
          "accent": "hoje",
          "tail": ""
        },
        "lead": "Instale a extensão, pesquise Google Maps e exporte uma planilha limpa – sem necessidade de conta.",
        "primary": "Instalar MapsGrab",
        "secondary": "Comparar planos",
        "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Acesso ao site",
        "title": "Faça login para sincronizar seus créditos",
        "trigger": "Entrar",
        "modalTitle": "Faça login para continuar",
        "closeLabel": "Fechar",
        "signedInAs": "Conectado como",
        "continueWithGoogle": "Continue com Google",
        "googleLoading": "Abrindo Google...",
        "or": "ou",
        "emailLabel": "E-mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Continuar com e-mail",
        "sendCode": "Enviar código",
        "sendingCode": "Enviando...",
        "sendCodeSuccess": "Código de verificação enviado.",
        "sendAgain": "Enviar novamente",
        "codeLabel": "Código de verificação",
        "codePlaceholder": "123456",
        "signIn": "Entrar",
        "termsNotice": "Ao fazer login, você concorda com o",
        "termsLink": "Termos",
        "privacyLink": "política de Privacidade",
        "logout": "Sair",
        "creditsLabel": "Créditos",
        "enterEmailFirst": "Por favor, insira seu endereço de e-mail primeiro.",
        "enterEmailAndCode": "Insira o e-mail e o código de verificação.",
        "sendCodeFailed": "Falha ao enviar o código de verificação.",
        "googleSignInFailed": "Falha na entrada do Google.",
        "googleClientMissing": "A entrada Google não está configurada.",
        "signInFailed": "Falha ao fazer login."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Pagamento cancelado",
        "canceledMessage": "Este pedido não foi pago. Você pode fechar esta guia e escolher uma forma de pagamento novamente na janela original.",
        "canceledMetaDescription": "Seu pagamento PayPal foi cancelado.",
        "waitingTitle": "Pagamento enviado",
        "waitingMessage": "Você pode retornar à guia original. Estamos verificando a confirmação de PayPal a cada 3 segundos e o resultado aparecerá aqui automaticamente.",
        "confirmedCreditsTitle": "Créditos adicionados",
        "confirmedCreditsMessage": "Seu pagamento PayPal foi confirmado e os créditos foram adicionados. Você pode fechar esta guia e continuar na janela original.",
        "confirmedSubscriptionTitle": "Assinatura ativada",
        "confirmedSubscriptionMessage": "Seu pagamento PayPal está confirmado e seu plano MapsGrab está ativo. Você pode fechar esta guia e continuar na janela original.",
        "failedTitle": "Pagamento precisa de atenção",
        "failedMessage": "Não foi possível confirmar este pedido automaticamente. Volte à janela original ou tente atualizar o status do seu pagamento lá."
      },
      "checkin": {
        "accountButtonLabel": "Abra o menu da conta",
        "accountMenuLabel": "Menu da conta"
      },
      "creditPurchase": {
        "title": "Obtenha mais créditos",
        "description": "Adicione créditos e continue usando recursos pagos neste espaço de trabalho.",
        "successTitle": "Créditos adicionados",
        "successDescription": "Seu saldo foi atualizado. Feche esta janela e continue.",
        "packageEyebrow": "Pague conforme usar",
        "cardNote": "Use créditos para recursos pagos do site. Os créditos nunca expiram.",
        "creditsAmount": "Créditos {credits}",
        "buyNow": "Comprar agora",
        "selectPackage": "Selecione",
        "paymentMethodLabel": "Escolha a forma de pagamento",
        "paymentTitle": "Escolha a forma de pagamento",
        "selectedPackageLabel": "Pacote selecionado",
        "confirmPurchase": "Continuar para o pagamento",
        "backToProducts": "Voltar",
        "close": "Fechar",
        "agreementText": "Concordo com os termos de compra, Termos e Política de Privacidade.",
        "loadingConfigs": "Carregando pacotes de créditos...",
        "loadFailed": "Falha ao carregar pacotes de créditos. Por favor, tente novamente.",
        "noConfigs": "Nenhum pacote de créditos está disponível no momento. Por favor, tente novamente mais tarde.",
        "ready": "Escolha um pacote de créditos. Os preços são mostrados em dólares americanos.",
        "creatingOrder": "Criando ordem...",
        "pendingPayment": "Conclua o pagamento na guia recém-aberta. Verificaremos o resultado automaticamente.",
        "pendingPaymentTitle": "Aguardando pagamento",
        "cancelPayment": "Cancelar pagamento",
        "supportMailPrefix": "Relate um problema: ",
        "success": "Pagamento concluído. Os créditos já estão disponíveis.",
        "failed": "O pagamento não está completo. Você pode tentar novamente ou fechar esta janela.",
        "successCredits": "+{credits} Créditos adicionados",
        "successBalance": "Saldo atual: Créditos {balance}",
        "createFailed": "Falha ao criar pedido. Por favor, tente novamente.",
        "invalidPaymentData": "O link de pagamento é inválido. Por favor, tente novamente mais tarde.",
        "priceUpdated": "Preço alterado. Revise o preço mais recente e compre novamente.",
        "gatewayFailed": "A entrada de pagamento está temporariamente indisponível. Por favor, tente novamente mais tarde.",
        "paymentCanceled": "O pagamento foi cancelado. Escolha uma forma de pagamento e tente novamente.",
        "pollFailed": "Falha ao atualizar o status do pagamento. Por favor, tente novamente.",
        "pollTimeout": "A atualização automática expirou. Use o botão atualizar após o pagamento.",
        "orderNotFound": "O pedido não está mais disponível. Crie um novo pedido.",
        "orderExpired": "O pedido expirou. Por favor compre novamente.",
        "fulfillmentFailed": "O pagamento foi recebido, mas os créditos ainda não foram adicionados. Tente novamente mais tarde.",
        "authExpired": "O login expirou. Faça login novamente para continuar.",
        "popupBlocked": "Seu navegador bloqueou a nova janela. Permita que MapsGrab abra pop-ups e tente novamente."
      }
    },
    "pricing": {
      "seo": {
        "title": "Preços – Planos Online, Extensão e API | MapsGrab",
        "description": "MapsGrab planos para todas as superfícies: Extrator Online de $19, Extensão do navegador de $39, e API de $15. Camadas gratuitas incluídas em todos os produtos – planos mensais naturais únicos no Online e API, assinaturas mensais no Extension."
      },
      "hero": {
        "kicker": "Preços",
        "title": {
          "lead": "Planos para ",
          "accent": "três maneiras",
          "tail": " de obter dados do Maps"
        },
        "lead": "Escolha a superfície que se adapta ao seu fluxo de trabalho - extrator on-line na nuvem, extensão do navegador ou HTTP API - e escolha o volume mensal. Atualize ou compre nesta página em minutos.",
        "meta": [
          "Nível gratuito em todos os produtos",
          "Pague com PayPal",
          "Faça upgrade pagando a diferença"
        ],
        "switchLabel": "Linha de produtos"
      },
      "popularLabel": "Mais populares",
      "tabs": {
        "online": {
          "name": "Extrator online",
          "shortName": "Online",
          "switchMeta": "De {price} · único",
          "unit": "registros",
          "eyebrow": "Planos de extrator on-line",
          "title": "Extração de nuvem, precificada por registros",
          "description": "Execute o mecanismo MapsGrab em nossa infraestrutura. Um registro é uma linha comercial coletada. Os planos pagos incluem enriquecimento opcional de e-mail e mídia social sem custo extra de registro.",
          "billingChips": [
            "Pagamento único",
            "Cobre um mês natural",
            "Sem renovação automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Livre",
              "tagline": "Experimente o extrator de nuvem em pequena escala",
              "price": "$0",
              "periodLabel": "para sempre",
              "quota": "1,000 registros/mês",
              "features": [
                "Extração de negócios com exportação de coluna 37 CSV",
                "Até 2 palavras-chave por tarefa",
                "Modos de mapa e região para pesquisas de área",
                "E-mail e enriquecimento social em planos pagos",
                "Um CSV desduplicado por tarefa"
              ],
              "ctaLabel": "Comece gratuitamente",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Para exportações pontuais ocasionais",
              "price": "$19",
              "periodLabel": "único · 1 mês",
              "quota": "20,000 registros/mês",
              "features": [
                "Tudo de graça",
                "20,000 registros para 1 mês",
                "Pagamento único – sem renovação automática",
                "Até 5 palavras-chave por tarefa",
                "E-mail e enriquecimento social, ativado por padrão e opcional"
              ],
              "ctaLabel": "Obtenha leve",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Básico",
              "tagline": "Para coleta semanal constante de leads",
              "price": "$49",
              "periodLabel": "único · 1 mês",
              "quota": "80,000 registros/mês",
              "features": [
                "Tudo em Lite",
                "80,000 registros para 1 mês",
                "Pagamento único – sem renovação automática",
                "Até 10 palavras-chave por tarefa"
              ],
              "ctaLabel": "Obtenha o básico",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Crescimento",
              "tagline": "Para o crescimento de pipelines de leads",
              "price": "$99",
              "periodLabel": "único · 1 mês",
              "quota": "250,000 registros/mês",
              "features": [
                "Tudo em Básico",
                "250,000 registros para 1 mês",
                "Pagamento único – sem renovação automática",
                "Até 20 palavras-chave por tarefa"
              ],
              "ctaLabel": "Obtenha crescimento",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Profissional",
              "tagline": "Para agências e equipes com muitos dados",
              "price": "$149",
              "periodLabel": "único · 1 mês",
              "quota": "500,000 registros/mês",
              "features": [
                "Tudo em crescimento",
                "500,000 registros para 1 mês",
                "Pagamento único – sem renovação automática",
                "Até 50 palavras-chave por tarefa"
              ],
              "ctaLabel": "Torne-se profissional",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pagamento único cobrindo um mês natural – os planos nesta guia não são renovados automaticamente. Um registro é uma linha comercial coletada de Google Maps; as redefinições de uso no 1st e os registros não utilizados não são transferidos.",
          "compare": {
            "lead": "Planos Extrator online – extração em nuvem, precificados por registros.",
            "volume": "Registros por mês",
            "groups": [
              {
                "label": "Dados",
                "rows": [
                  {
                    "label": "Extração de negócios com exportação de coluna 37 CSV",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "E-mail e enriquecimento social",
                    "cells": [
                      false,
                      "Ativado por padrão, opcional",
                      "Ativado por padrão, opcional",
                      "Ativado por padrão, opcional",
                      "Ativado por padrão, opcional"
                    ]
                  }
                ]
              },
              {
                "label": "Fluxo de trabalho",
                "rows": [
                  {
                    "label": "Palavras-chave por tarefa",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Modos de mapa e região",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Um CSV desduplicado por tarefa",
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
            "usageNotice": "Aplica-se à cota de registro mensal do Extrator online MapsGrab.",
            "successTitle": "Plano ativado",
            "successDescription": "Seu plano único de 1 meses está ativo. O Extrator online o pega na próxima atualização de cota."
          }
        },
        "extension": {
          "name": "Extensão",
          "shortName": "Extensão",
          "switchMeta": "De {price} · único",
          "unit": "registros",
          "eyebrow": "Planos de extensão",
          "title": "Extração do navegador, precificada por registros",
          "description": "Cada linha coletada pela extensão – uma empresa, um comentário ou uma foto – conta como um registro. Todos os planos incluem avaliações, fotos e tarefas em lote; planos pagos exportam todas as colunas 36, incluindo e-mail e enriquecimento social.",
          "billingChips": [
            "Pagamento único",
            "1 mês de acesso",
            "Sem renovação automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Livre",
              "tagline": "Extração de núcleo, em pequena escala",
              "price": "$0",
              "periodLabel": "para sempre",
              "quota": "1,000 registros/mês",
              "features": [
                "Extração de dados de negócios",
                "Resenhas (11 colunas) e foto URLs",
                "Palavra-chave em lote e tarefas de revisão-URL",
                "CSV / JSON exportação com seleção de campo"
              ],
              "ctaLabel": "Instale a extensão",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Para freelancers e pipelines de leads em crescimento",
              "price": "$39",
              "periodLabel": "único · 1 mês",
              "quota": "100,000 registros/mês",
              "features": [
                "Tudo de graça",
                "100,000 registros todos os meses",
                "Extração de negócios de coluna 36 completa",
                "Enriquecimento de e-mail e mídia social"
              ],
              "ctaLabel": "Torne-se profissional",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Negócios",
              "tagline": "Para agências e equipes com muitos dados",
              "price": "$99",
              "periodLabel": "único · 1 mês",
              "quota": "500,000 registros/mês",
              "features": [
                "Tudo em Pró",
                "500,000 registros todos os meses",
                "Espaço para tarefas em lote multimercado",
                "O mesmo pipeline de exportação local"
              ],
              "ctaLabel": "Faça negócios",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Cada linha coletada pela extensão conta como um registro: uma empresa de uma pesquisa ou lista salva, um comentário ou uma foto. O enriquecimento por e-mail e social não adiciona registros. O uso mensal é redefinido no 1st; registros não utilizados não são transferidos.",
          "compare": {
            "lead": "Planos de extensão — extração do navegador, precificados por registros.",
            "volume": "Registros por mês",
            "groups": [
              {
                "label": "Dados",
                "rows": [
                  {
                    "label": "Extração de dados de negócios",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Extração de negócios de coluna 36 completa",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Resenhas (11 colunas) e foto URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Enriquecimento de e-mail e mídia social",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Palavra-chave em lote e tarefas de revisão-URL",
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
                    "label": "CSV / JSON exportação com seleção de campo",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Pipeline de exportação local",
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
            "usageNotice": "Aplica-se à cota mensal de extensão do navegador MapsGrab.",
            "successTitle": "Plano ativado",
            "successDescription": "Seu plano único de 1 meses está ativo. A extensão o seleciona na próxima atualização de cota."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "De {price} · único",
          "unit": "solicitações",
          "eyebrow": "API planos",
          "title": "Acesso programático, cobrado por solicitações",
          "description": "Pesquise Google Maps empresas e obtenha suas avaliações em seus próprios aplicativos por meio de um simples HTTP API. Cada chamada bem-sucedida conta como uma solicitação, mesmo quando não retorna resultados ou dados parciais.",
          "billingChips": [
            "Pagamento único",
            "Cobre um mês natural",
            "Sem renovação automática"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Livre",
              "tagline": "Avalie o API em pequena escala",
              "price": "$0",
              "periodLabel": "para sempre",
              "quota": "20 solicitações/mês",
              "features": [
                "Pesquisa de negócios por palavra-chave e localização",
                "Revisa o endpoint com classificação e paginação",
                "JSON respostas",
                "Chave API vinculada à sua conta",
                "Apoio comunitário"
              ],
              "ctaLabel": "Comece gratuitamente",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Básico",
              "tagline": "Para protótipos e integrações leves",
              "price": "$15",
              "periodLabel": "único · 1 mês",
              "quota": "1,000 solicitações/mês",
              "features": [
                "Tudo de graça",
                "1,000 solicitações para 1 mês",
                "Pagamento único – sem renovação automática",
                "JSON respostas"
              ],
              "ctaLabel": "Obtenha o básico",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Profissional",
              "tagline": "Para integrações de produção",
              "price": "$65",
              "periodLabel": "único · 1 mês",
              "quota": "5,000 solicitações/mês",
              "features": [
                "Tudo em Básico",
                "5,000 solicitações para 1 mês",
                "Pagamento único – sem renovação automática",
                "JSON respostas"
              ],
              "ctaLabel": "Torne-se profissional",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Negócios",
              "tagline": "Para produtos baseados em dados MapsGrab",
              "price": "$115",
              "periodLabel": "único · 1 mês",
              "quota": "10,000 solicitações/mês",
              "features": [
                "Tudo em Profissional",
                "10,000 solicitações para 1 mês",
                "Pagamento único – sem renovação automática",
                "JSON respostas"
              ],
              "ctaLabel": "Faça negócios",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Escala",
              "tagline": "Para operações de dados de alto volume",
              "price": "$365",
              "periodLabel": "único · 1 mês",
              "quota": "50,000 solicitações/mês",
              "features": [
                "Tudo nos negócios",
                "50,000 solicitações para 1 mês",
                "Pagamento único – sem renovação automática",
                "JSON respostas"
              ],
              "ctaLabel": "Obtenha escala",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Pagamento único cobrindo um mês natural – os planos nesta guia não são renovados automaticamente. Cada chamada API ou MCP bem-sucedida conta como uma solicitação, incluindo resultados vazios e parciais; chamadas com falha não são contadas. As redefinições de uso no 1st e as solicitações não utilizadas não são transferidas.",
          "compare": {
            "lead": "Planos API — acesso programático, com preços por solicitação.",
            "volume": "Solicitações por mês",
            "groups": [
              {
                "label": "Pontos finais",
                "rows": [
                  {
                    "label": "Pesquisa de negócios por palavra-chave e localização",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Revisa o endpoint com classificação e paginação",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON respostas",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Servidor MCP com a mesma chave API",
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
                "label": "Acesso",
                "rows": [
                  {
                    "label": "Chave API vinculada à sua conta",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Apoio comunitário",
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
            "usageNotice": "Aplica-se à cota de solicitação mensal MapsGrab API.",
            "successTitle": "Plano ativado",
            "successDescription": "Seu plano único de 1 meses está ativo. Sua chave API pega a nova cota na próxima solicitação."
          }
        }
      },
      "plansSection": {
        "label": "Planos",
        "finder": {
          "label": "Quantos {unit} você precisa por mês?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} por mês — plano {plan}",
          "fits": "Serve"
        }
      },
      "compare": {
        "kicker": "Comparar",
        "title": {
          "lead": "Cada plano, ",
          "accent": "lado a lado",
          "tail": ""
        },
        "plan": "Plano",
        "volumeGroup": "Volume e faturamento",
        "billing": "Cobrança",
        "included": "Incluído",
        "notIncluded": "Não incluído",
        "allPlans": "Incluído em todos os planos"
      },
      "usage": {
        "head": {
          "kicker": "Uso",
          "title": {
            "lead": "O que conta para sua ",
            "accent": "cota",
            "tail": ""
          },
          "lead": "Duas unidades: registros para extensão e Scraper Online, solicitações de API — e ambos zerados no 1 primeiro dia de cada mês."
        },
        "records": {
          "meter": "Registros usados ​​este mês",
          "badge": "Extensão · On-line",
          "title": "1 registro = 1 linha coletada",
          "body": "Cada linha coletada conta como um registro: uma empresa no Extrator online; uma empresa, um comentário ou uma foto na extensão. O enriquecimento por e-mail e social não adiciona registros.",
          "count": "+1 registro",
          "attachments": [
            "Telefone e site",
            "Horário de funcionamento",
            "E-mail e redes sociais"
          ]
        },
        "requests": {
          "meter": "Solicitações usadas este mês",
          "badge": "API · MCP",
          "title": "1 solicitação = 1 chamada bem-sucedida",
          "body": "Uma solicitação é uma chamada API bem-sucedida, mesmo quando não retorna resultados ou dados parciais; chamadas com falha não são contadas. MCP chamadas de ferramentas sorteadas na mesma cota de solicitação.",
          "counted": "Chamada bem-sucedida – contada",
          "notCounted": "Chamada falhada – não contabilizada"
        },
        "reset": {
          "title": "Reinicia no 1st",
          "body": "O uso é redefinido no 1 primeiro dia de cada mês. Registros e solicitações não utilizados não são transferidos.",
          "limit": "Limite do plano",
          "unused": "Não utilizado · não rola",
          "flag": "Reiniciar"
        }
      },
      "billing": {
        "head": {
          "kicker": "Cobrança",
          "title": {
            "lead": "Faturamento simples, ",
            "accent": "sem surpresas",
            "tail": ""
          },
          "lead": "Como funcionam o pagamento, a renovação e os upgrades nas três linhas de produtos."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Pague qualquer plano através de PayPal. Conclua seu pagamento em PayPal e retorne aqui para ativar seu plano."
          },
          "cadence": {
            "title": "Pagamento único",
            "body": "Cada plano pago cobre um mês natural. Pague uma vez sem cobranças automáticas; compre novamente quando precisar de mais um mês."
          },
          "upgrade": {
            "title": "Faça upgrade pagando a diferença",
            "body": "Mova um plano ativo para um nível superior elegível por meio de seu provedor de pagamento atual. Sua data de validade e uso até agora permanecem inalterados."
          },
          "independent": {
            "title": "Planos independentes",
            "body": "Os planos em guias diferentes são independentes. Quando um plano expira, a conta retorna automaticamente para o nível gratuito."
          }
        }
      },
      "plans": {
        "loading": "Carregando opções de pagamento...",
        "loadFailed": "Falha ao carregar opções de pagamento. Atualize a página para tentar novamente.",
        "noChannels": "Nenhum método de pagamento está disponível para este plano no momento.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Pagamento incompleto",
        "billingPeriodMonthly": "1 mês",
        "billingAutoRenew": "Renova automaticamente até ser cancelado",
        "billingOneTime": "Pagamento único"
      },
      "upgrade": {
        "currentPlan": "Plano Atual",
        "button": "Atualizar · {amount}",
        "title": "Atualize seu plano",
        "confirm": "Confirmar atualização",
        "oneTime": "Diferença única via {channel}. Sua data de validade permanece {date}.",
        "autoRenew": "A diferença será cobrada imediatamente via {channel}. Sua data de validade permanece {date}; renovações futuras usam o novo preço do plano.",
        "pendingTitle": "Aguardando sua atualização",
        "pendingDescription": "Seu provedor de pagamento está aplicando a atualização. Seu plano atual permanece ativo até ser confirmado.",
        "successTitle": "Plano atualizado",
        "successDescription": "Sua nova cota está ativa. Sua data de validade permanece {date}.",
        "quoteFailed": "Não foi possível carregar o preço do upgrade. Atualize a página para tentar novamente.",
        "failed": "Não foi possível confirmar sua atualização. Atualize a página para verificar seu plano antes de tentar novamente.",
        "reasons": {
          "no_active_subscription": "Seu plano não está mais ativo. Atualize a página para escolher um plano.",
          "not_higher_tier": "Escolha um nível mais alto para atualizar ou espere até que seu plano expire para alterar os níveis.",
          "non_positive_diff": "O valor restante do seu plano não é inferior a este nível. Você pode alterar os níveis depois que seu plano expirar.",
          "channel_unavailable": "Os upgrades não estão disponíveis com sua forma de pagamento atual. Você pode alterar os planos após o vencimento."
        }
      },
      "faq": {
        "kicker": "Perguntas frequentes",
        "title": {
          "lead": "",
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "lead": "Noções básicas de faturamento. Qualquer outra coisa, o suporte está a um e-mail de distância.",
        "contact": "Contate o suporte",
        "items": [
          {
            "question": "O que conta como um recorde?",
            "answer": "Um registro é uma linha coletada – a mesma unidade que os planos gratuitos contam. No Extrator online, esse é um negócio; na extensão, cada empresa, avaliação ou foto coletada é um registro. O enriquecimento por e-mail e social não adiciona registros. Na guia API, o uso é contado em solicitações bem-sucedidas."
          },
          {
            "question": "Preciso de um plano pago para experimentar MapsGrab?",
            "answer": "Não. Cada produto tem um nível gratuito sem limite de tempo: o Extrator online e a extensão incluem 1,000 registros por mês, e o API inclui 20 solicitações por mês. O Extrator online e os planos gratuitos de extensão não incluem enriquecimento de e-mail ou mídia social. Os planos online pagos incluem-no por padrão e você pode desativá-lo para cada tarefa."
          },
          {
            "question": "Como a cota se aplica à minha conta?",
            "answer": "A cota é contada por conta conectada (e por dispositivo de navegador para a extensão quando você não está conectado). Faça login com a conta proprietária do plano para que o teto mais alto seja aplicado. Quando um plano expira, a conta retorna automaticamente para o nível gratuito."
          },
          {
            "question": "Meu plano será renovado automaticamente?",
            "answer": "Não. Todos os planos são pagamentos únicos de PayPal cobrindo um mês natural. Quando seu plano expirar, você retornará ao nível gratuito. Compre novamente para continuar com um plano pago."
          },
          {
            "question": "Posso alternar entre níveis?",
            "answer": "Você pode atualizar um plano ativo para um nível superior qualificado pagando a diferença através de PayPal. Sua data de validade e uso até agora permanecem inalterados. Os planos em guias diferentes são independentes."
          }
        ]
      },
      "cta": {
        "kicker": "Comece",
        "title": {
          "lead": "Comece no ",
          "accent": "nível gratuito",
          "tail": ""
        },
        "lead": "Cada produto tem um nível gratuito sem limite de tempo - 1,000 registra por mês na extensão e no Extrator online, 20 solicita por mês no API.",
        "primary": "Instale a extensão",
        "secondary": "Experimente o extrator online",
        "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
      }
    },
    "extensionLogin": {
      "title": "Login de extensão | MapsGrab",
      "description": "Faça login para conectar sua sessão do site MapsGrab à extensão do navegador.",
      "eyebrow": "Extensão do navegador",
      "heading": "Login de extensão",
      "checkingState": "Verificando",
      "signInRequiredState": "É necessário fazer login",
      "confirmState": "Confirmar conta",
      "errorState": "Erro",
      "preparingTitle": "Preparando seu login",
      "preparingText": "Configurando a ponte de login de extensão.",
      "invalidParamsTitle": "Link de login inválido",
      "invalidParamsText": "Este link de login não contém parâmetros de segurança obrigatórios. Inicie o login novamente a partir da extensão.",
      "checkingSessionTitle": "Verificando sua sessão",
      "checkingSessionText": "Verificando a sessão existente do seu site.",
      "finishingGoogleTitle": "Concluindo Google login",
      "finishingGoogleText": "Trocando sua autorização Google por uma sessão no site.",
      "signInRequiredTitle": "Faça login para continuar",
      "signInRequiredText": "Faça login para conectar a sessão do seu site à extensão.",
      "signInButtonLabel": "Entrar",
      "confirmTitle": "Confirme sua conta",
      "confirmText": "A extensão está solicitando login com a conta abaixo. Continue apenas se você acabou de iniciar o login na extensão.",
      "continueButtonLabel": "Continuar",
      "useAnotherAccountLabel": "Usar outra conta",
      "issuingTitle": "Concluindo o login",
      "issuingText": "Emitir um código de login único para a extensão.",
      "issueFailedTitle": "Algo deu errado",
      "retryButtonLabel": "Tentar novamente",
      "verificationFailedPrefix": "Falha na verificação do token do site",
      "issueFailedPrefix": "Falha na solicitação do código de login da extensão",
      "googleSignInFailedPrefix": "Google falha no login",
      "googleCompletionFailedPrefix": "Google não foi possível concluir o login"
    },
    "online": {
      "seo": {
        "title": "Online Google Maps Scraper — Executar extração na nuvem | MapsGrab",
        "description": "Execute pesquisas de palavras-chave Google Maps na nuvem, colete dados de negócios e baixe um CSV por tarefa."
      },
      "hero": {
        "announce": {
          "badge": "3 modos",
          "text": "Palavras-chave, uma área do mapa ou regiões inteiras"
        },
        "title": {
          "lead": "Google Maps extração ",
          "accent": "na nuvem,",
          "tail": " sem instalação"
        },
        "lead": "Envie palavras-chave, colete detalhes de negócios na nuvem e baixe um CSV por tarefa em seu painel.",
        "primaryCta": "Iniciar extração",
        "pricingCta": "Ver preços",
        "meta": [
          "1,000 registros grátis/mês",
          "Funciona em qualquer navegador",
          "Um CSV desduplicado por tarefa"
        ],
        "theater": {
          "files": "1 CSV · Salvo em downloads",
          "csv": "CSV",
          "processed": "Processado",
          "parallelChip": {
            "label": "Execução de palavras-chave",
            "value": "Em paralelo"
          },
          "billingChip": {
            "label": "Faturado por",
            "value": "Linhas entregues"
          }
        }
      },
      "facts": {
        "caption": "O extrator online em resumo",
        "items": [
          {
            "value": 37,
            "label": "colunas públicas, incluindo um número de linha contínuo"
          },
          {
            "value": 6,
            "label": "colunas de perfil social em planos pagos"
          },
          {
            "value": 50,
            "label": "pesquisar locais por tarefa no modo de mapa"
          },
          {
            "value": 60,
            "suffix": " min",
            "label": "janela de coleta para cada tarefa"
          },
          {
            "value": 1000,
            "label": "registros gratuitos todos os meses"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Como funciona",
          "title": {
            "lead": "De uma visualização rápida a uma ",
            "accent": "exportação completa",
            "tail": ""
          },
          "lead": "Experimente uma palavra-chave na página inicial sem uma conta. Quando quiser a lista completa, faça login e execute-a como uma tarefa em seu Painel."
        },
        "steps": [
          {
            "title": "Visualização na página inicial",
            "description": "Uma palavra-chave, nenhuma conta. Veja quantas empresas a primeira página de resultados contém, com as primeiras 3 linhas."
          },
          {
            "title": "Entrar",
            "description": "As visualizações não são salvas e nunca usam sua cota. Depois de fazer login, você envia a palavra-chave novamente."
          },
          {
            "title": "Crie a tarefa",
            "description": "Em Painel › Extrator online, insira uma palavra-chave por linha – ou deixe uma área ou região do mapa construir a lista."
          },
          {
            "title": "Palavras-chave são executadas em paralelo",
            "description": "Siga os estados de fila, coleta e preparação CSV e, em seguida, concluído, com sucesso parcial ou com falha. As tarefas ativas são atualizadas a cada 5 segundos."
          },
          {
            "title": "Download",
            "description": "Baixe um CSV para toda a tarefa quando um arquivo estiver disponível. O sucesso parcial mantém as linhas entregues; zero resultados não possuem arquivo."
          }
        ],
        "lock": "Faça login para ver a lista completa",
        "email": "you@company.com",
        "links": {
          "preview": "Experimente a visualização da página inicial",
          "dashboard": "Abra o Painel › Extrator Online"
        }
      },
      "modes": {
        "head": {
          "kicker": "Modos de pesquisa",
          "title": {
            "lead": "Três maneiras de dizer ",
            "accent": "onde procurar",
            "tail": ""
          },
          "lead": "Digite palavras-chave linha por linha, experimente uma área do mapa em torno de um ponto central ou transforme países, estados e cidades em consultas prontas."
        },
        "tabsLabel": "Modo de pesquisa",
        "notes": {
          "keywords": "Uma palavra-chave por linha, até o limite do seu plano",
          "map": "Experimente um círculo em torno de um ponto central",
          "regions": "Países, estados e cidades de GeoNames"
        },
        "keywords": {
          "hint": "Uma palavra-chave por linha. Linhas em branco e duplicatas são eliminadas antes da contagem, e toda a tarefa produz um CSV desduplicado.",
          "blank": "Linha em branco · ignorada",
          "duplicate": "Duplicado · ignorado",
          "limitsTitle": "Palavras-chave por tarefa",
          "limitsCaption": "pelo plano Online",
          "limitsHint": "O Start Scraping permanece desativado enquanto a lista estiver vazia, acima do limite do seu plano ou quando sua cota mensal estiver esgotada."
        },
        "map": {
          "formula": "{keywords} palavras-chave × {points} pontos de grade",
          "scale": "{value}km",
          "facts": [
            "Os pontos são pesquisados ​​do centro para fora.",
            "O círculo apenas coloca centros de pesquisa – os resultados não são recortados nele.",
            "Uma empresa encontrada em palavras-chave ou pontos é mantida uma vez na tarefa."
          ]
        },
        "regions": {
          "hint": "Você pode editar as consultas geradas antes de enviar. Cada um conta como uma palavra-chave.",
          "addCity": "Adicionar cidade"
        }
      },
      "results": {
        "head": {
          "kicker": "Resultados",
          "title": {
            "lead": "Uma tarefa, ",
            "accent": "uma CSV",
            "tail": ""
          },
          "lead": "Baixe 37 colunas públicas em uma CSV para toda a tarefa, com números de linhas contínuas e negócios desduplicados nas pesquisas."
        },
        "csvMeta": "1 CSV · {count} linhas entregues",
        "rows": "{count} linhas",
        "searches": "Linhas entregues por pesquisa",
        "notes": [
          "A linha 1 contém os nomes fixos das colunas em inglês, incluindo a coluna # contínua.",
          "A linha 2 descreve cada coluna no idioma da interface usado ao criar a tarefa.",
          "As tarefas concluídas com zero resultados não possuem arquivo. O sucesso parcial mantém as linhas entregues.",
          "A linha do rótulo nunca conta para seus registros."
        ],
        "language": "Idioma da tarefa: português",
        "rowLabel": "Linha",
        "legend": {
          "fields": "Linha 1 · nomes de campos",
          "labels": "Linha 2 · idioma da tarefa",
          "data": "Linha 3+ · empresas"
        },
        "more": "+{count} mais colunas",
        "csvLabels": {
          "#": "Número da linha",
          "Name": "Nome comercial",
          "Fulladdress": "Endereço completo",
          "Categories": "Categorias de negócios",
          "Phone": "Telefone principal",
          "Review Count": "Número de avaliações",
          "Average Rating": "Avaliação média da revisão",
          "Website": "Site comercial",
          "Emails": "E-mails de sites públicos",
          "Search Keyword": "Palavra-chave de pesquisa"
        }
      },
      "features": {
        "head": {
          "kicker": "Capacidades",
          "title": {
            "lead": "O que o Extrator Online ",
            "accent": "faz",
            "tail": ""
          },
          "lead": "Detalhes comerciais coletados na nuvem, com e-mails opcionais e perfis sociais em planos pagos."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Tarefas de palavras-chave",
            "description": "Envie tipos de negócios e locais como palavras-chave separadas. Seu plano determina o limite de palavras-chave e a cota de registros mensais.",
            "meta": "2 · 5 · 10 · 20 · 50 palavras-chave por tarefa"
          },
          {
            "id": "history",
            "title": "Histórico de tarefas",
            "description": "Acompanhe o progresso da tarefa e visualize a contagem de registros de cada palavra-chave em seu painel.",
            "meta": "Concluído · Sucesso parcial · Falhou"
          },
          {
            "id": "details",
            "title": "Detalhes do negócio",
            "description": "Colete nomes, endereços, números de telefone, sites, classificações, horários, coordenadas e identificadores de local, quando disponíveis.",
            "meta": "37 colunas públicas por empresa"
          },
          {
            "id": "enrichment",
            "title": "E-mail e enriquecimento social",
            "description": "Com um plano on-line pago, os sites comerciais são verificados quanto a endereços de e-mail e perfis sociais por padrão. Você pode desativar isso para cada tarefa.",
            "meta": "Planos pagos · ativados por padrão"
          },
          {
            "id": "downloads",
            "title": "Uma tarefa CSV",
            "description": "Baixe toda a tarefa como um CSV quando um arquivo estiver disponível. Nenhum arquivo por pesquisa é necessário.",
            "meta": "{job}.csv · 37 colunas"
          },
          {
            "id": "browser",
            "title": "Nada para instalar",
            "description": "Roda na nuvem a partir de qualquer navegador — Edge, Firefox ou qualquer outro. Baixe os resultados do seu histórico de tarefas.",
            "meta": "Edge · Firefox · qualquer navegador"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Uso",
          "title": {
            "lead": "Faturado pelas linhas ",
            "accent": "você realmente recebe",
            "tail": ""
          },
          "lead": "As tarefas online são medidas pelas linhas de negócios entregues assim que uma tarefa é concluída. Nada é deixado de lado quando você envia, e a linha do rótulo em cada CSV nunca é contada."
        },
        "checks": [
          "O envio de uma tarefa não reserva nada da sua cota",
          "Uma tarefa que já está em execução é concluída, mesmo após a cota restante",
          "Depois que a cota se esgotar, novas tarefas não poderão ser enviadas",
          "O uso é redefinido no 1st no tempo New York; registros não utilizados não são acumulados"
        ],
        "mock": {
          "recordsLabel": "Registros este mês",
          "left": "{count} restantes",
          "exhausted": "Cota esgotada",
          "task": "Tarefa {id}…",
          "pending": "Entregue até agora · contado quando a tarefa for concluída",
          "counted": "Contado para este mês",
          "rows": "{count} linhas",
          "running": "Correndo",
          "delta": "+{count} registros"
        }
      },
      "plans": {
        "head": {
          "kicker": "Planos de extrator on-line",
          "title": {
            "lead": "Extração de nuvem, ",
            "accent": "precificada por registros",
            "tail": ""
          },
          "lead": "Execute o mecanismo MapsGrab em nossa infraestrutura. Um registro é uma linha comercial entregue; os planos pagos incluem e-mail e enriquecimento social sem custo extra de registro."
        },
        "specs": {
          "keywords": "Palavras-chave por tarefa",
          "contacts": "E-mails e redes sociais",
          "included": "Ativado por padrão",
          "excluded": "Não incluído"
        },
        "note": "Pagamento único cobrindo um mês natural — Os planos online não são renovados automaticamente. O uso é redefinido no 1st em New York tempo e os registros não utilizados não são acumulados.",
        "compare": "Compare todos os planos"
      },
      "faq": {
        "kicker": "Perguntas frequentes",
        "title": {
          "lead": "",
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "lead": "As respostas curtas. Qualquer outra coisa, o suporte está a um e-mail de distância.",
        "contact": "Contate o suporte",
        "items": [
          {
            "question": "Qual a diferença entre o Extrator online e a extensão?",
            "answer": "A extensão coleta dados em seu navegador. O Extrator online executa tarefas de palavras-chave na nuvem e entrega os resultados em seu painel."
          },
          {
            "question": "De onde vêm os dados e é legal coletá-los?",
            "answer": "MapsGrab coleta apenas informações que são exibidas publicamente em Google Maps — os mesmos detalhes que qualquer visitante pode ler. Não acessamos contas privadas, conteúdo fechado ou dados não públicos."
          },
          {
            "question": "Para quais formatos posso exportar?",
            "answer": "Tarefas com resultados entregam uma UTF-8 CSV com 37 colunas públicas, números de linha contínuos e duas linhas de cabeçalho. As empresas são desduplicadas em todas as pesquisas. Tarefas sem resultados não possuem arquivo."
          },
          {
            "question": "Quanto custa isso?",
            "answer": "O Extrator online segue os planos MapsGrab na página de preços, incluindo a cota mensal gratuita de registros. Os planos pagos aumentam os limites quando você precisa de mais."
          },
          {
            "question": "Preciso de um plano pago para e-mails e perfis sociais?",
            "answer": "Online Grátis não inclui enriquecimento de e-mail ou mídia social. Os planos online pagos incluem-no por padrão e você pode desativá-lo para cada tarefa. A escolha é corrigida assim que a tarefa é enviada."
          },
          {
            "question": "Quanto tempo uma tarefa pode ser executada?",
            "answer": "Cada tarefa possui uma janela de coleta de 60 minutos. O sucesso parcial pode entregar linhas coletadas e quaisquer e-mails ou perfis encontrados. Seu histórico mostra se um CSV está disponível."
          },
          {
            "question": "A visualização da minha página inicial é salva quando eu faço login?",
            "answer": "Não. A visualização da página inicial é uma visualização rápida que não fica armazenada. Depois de fazer login, abra o Extrator online em seu painel e envie a palavra-chave novamente como uma tarefa completa."
          }
        ]
      },
      "cta": {
        "kicker": "Comece",
        "title": {
          "lead": "Coloque sua primeira ",
          "accent": "tarefa na nuvem",
          "tail": " na fila"
        },
        "lead": "Envie palavras-chave, acompanhe o andamento da sua tarefa e baixe dados de negócios do seu painel.",
        "primary": "Iniciar extração",
        "secondary": "Ver preços",
        "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
      }
    },
    "apiPage": {
      "switchLabel": "API pontos finais",
      "switchItems": {
        "search": "Extrator",
        "reviews": "Avaliações",
        "photos": "Fotos"
      },
      "primaryCta": "Obtenha a chave API",
      "pricingCta": "Ver preços",
      "console": {
        "label": "Exemplo API solicitação e resposta",
        "langLabel": "Solicitar idioma",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Solicitação de cópia",
        "replay": "Solicitação de repetição",
        "ready": "Preparar",
        "composing": "Compondo solicitação…",
        "sending": "Enviando solicitação…",
        "done": "Resposta · 200 OK · aplicação/json",
        "waiting": "// aguardando resposta…",
        "response": "Resposta de exemplo"
      },
      "endpoints": {
        "kicker": "Pontos finais",
        "title": {
          "lead": "Uma chave. ",
          "accent": "Três",
          "tail": " pontos de extremidade."
        },
        "lead": "Busque lugares e envie o `fid` do resultado para a API de avaliações ou fotos. As três APIs compartilham uma chave e a cota mensal de solicitações.",
        "here": "Você está aqui",
        "paramsLabel": "Parâmetros",
        "mcp": {
          "title": "Construindo com agentes de IA?",
          "description": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP.",
          "link": "Explorar MCP"
        }
      },
      "chain": {
        "kicker": "Pontos finais da cadeia",
        "title": {
          "lead": "",
          "accent": "Extrator → Avaliações / Fotos",
          "tail": ""
        },
        "lead": "Busque lugares e envie o `fid` do resultado para a API de avaliações ou fotos. As três APIs compartilham uma chave e a cota mensal de solicitações.",
        "label": "Busque lugares e envie o fid do resultado para a API de avaliações ou fotos. As três APIs compartilham uma chave e a cota mensal de solicitações.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 comentários"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 comentários"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 comentários"
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
          "note": "O status de sucesso é partial; reason explica por que a coleta parou. reported_total é a quantidade informada pela origem ou null, não o tamanho verificado do álbum."
        }
      },
      "reference": {
        "kicker": "Referência",
        "title": {
          "lead": "Solicite entrada, ",
          "accent": "JSON",
          "tail": " saída"
        },
        "lead": "Envie sua chave como `Authorization: Bearer YOUR_API_KEY` com corpo JSON. Cada resposta é agrupada em `{code, data, msg}` e `code` 10000 significa sucesso.",
        "baseUrl": "Base URL",
        "copyBaseUrl": "Base de cópia URL",
        "request": "Solicitar",
        "response": "Resposta",
        "columns": {
          "parameter": "Parâmetro",
          "field": "Campo",
          "type": "Tipo",
          "description": "Descrição",
          "example": "Exemplo"
        },
        "required": "obrigatório",
        "groupsLabel": "Grupos de campos",
        "notes": [
          {
            "icon": "gauge",
            "title": "Uma solicitação por chamada bem-sucedida",
            "description": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
          },
          {
            "icon": "key",
            "title": "Um 401 significa verifique sua chave",
            "description": "Uma chave ausente ou inválida retorna HTTP 401. Outros erros retornam HTTP 200 com um diferente de 10000 `code` e um `msg`."
          },
          {
            "icon": "locate",
            "title": "A localização é um preconceito, não uma cerca",
            "description": "`ll` informa ao Maps onde pesquisar. Locais fora dessa visualização ainda poderão aparecer."
          },
          {
            "icon": "target",
            "title": "Nomeie o lugar",
            "description": "Coloque uma cidade, estado ou ZIP em `q` — “perto de mim” não tem nada para ancorar em um servidor."
          }
        ]
      },
      "plans": {
        "kicker": "API planos",
        "title": {
          "lead": "Acesso programático, ",
          "accent": "preço por solicitações",
          "tail": ""
        },
        "lead": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
      },
      "faq": {
        "lead": "As respostas curtas. Qualquer outra coisa, o suporte está a um e-mail de distância.",
        "contact": "Contate o suporte"
      },
      "cta": {
        "kicker": "Comece",
        "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps Extrator API — Dados de negócios em JSON | MapsGrab",
        "description": "O MapsGrab API de extração retorna Google Maps resultados de pesquisa como JSON: nome, endereço, telefone, site, classificação, horário, coordenadas, Place ID e fid – além de e-mails e perfis sociais mediante solicitação."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Extrator",
          "tail": " API"
        },
        "lead": "Envie uma palavra-chave acima de HTTPS e receba Google Maps empresas de volta como JSON: nome, endereço, telefone, site, classificação, horário de funcionamento, coordenadas, Place ID e fid – além de e-mails e perfis sociais mediante solicitação.",
        "meta": [
          "Plano gratuito: {quota}",
          "Uma chave para pesquisa e comentários",
          "JSON acima de HTTPS"
        ],
        "chips": [
          {
            "label": "Por lugar",
            "value": "29 campos de dados"
          },
          {
            "label": "Por página",
            "value": "Até 20 lugares"
          }
        ]
      },
      "endpoint": {
        "name": "API de extração",
        "description": "Empresas para qualquer palavra-chave e localização opcional — campos 29 por local, além de e-mails e perfis sociais com `extra`.",
        "link": "Explore o Extrator API"
      },
      "caps": {
        "title": {
          "lead": "O que o ",
          "accent": "API de extração",
          "tail": " retorna"
        },
        "lead": "Uma palavra-chave e um viés de localização opcional; os locais que uma pesquisa Google Maps mostra, conforme estruturado JSON.",
        "items": [
          {
            "icon": "search",
            "title": "Pesquise por palavra-chave e localização",
            "description": "Envie `q` com uma tendência de localização `ll` opcional. `page` define quantas páginas de resultados serão coletadas, 1–10, até 20 coloca cada uma, tudo em uma resposta."
          },
          {
            "icon": "table",
            "title": "29 campos por local",
            "description": "Nome, categorias, endereço completo, telefone, site, classificação e contagem de comentários, horário de funcionamento, coordenadas, Place ID, CID, fid, proprietário e muito mais."
          },
          {
            "icon": "mail",
            "title": "E-mail e enriquecimento social",
            "description": "Defina `extra` como `true` para adicionar `emails` e `medias`: Instagram, Facebook, YouTube, TikTok, LinkedIn e perfis X encontrados em cada site de negócios."
          },
          {
            "icon": "braces",
            "title": "Limpo, previsível JSON",
            "description": "snake_case campos em um envelope `{code, data, msg}`. Os valores Google Maps não aparecem como `null` ou uma lista vazia, nunca como strings vazias."
          },
          {
            "icon": "layers",
            "title": "Dados parciais são sinalizados",
            "description": "Se alguns detalhes não puderem ser preenchidos, você ainda receberá os lugares - com `partial` definido como `true` e `warnings` dizendo o que está faltando."
          },
          {
            "icon": "shield",
            "title": "Apenas dados públicos",
            "description": "Os resultados contêm apenas o que Google Maps mostra publicamente — os mesmos detalhes que qualquer visitante pode ler."
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
            "description": "O que pesquisar, até 300 caracteres — um tipo de negócio mais um local, por exemplo. `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Quantas páginas de resultados coletar, 1–10, até 20 lugares cada, todas retornadas em uma resposta. A coleta para mais cedo quando uma página tem menos de 20 lugares ou nada de novo. Padrão `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Idioma do resultado, por ex. `en` ou `fr`. Padrão `en`."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Viés de localização opcional como `@lat,lng,zoom`, zoom 0–21. Diz ao Maps onde pesquisar; os resultados não são cortados em um raio."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` adiciona `emails` e `medias` a todos os lugares. Padrão `false`."
          }
        ],
        "groups": [
          {
            "label": "Identidade",
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
            "label": "Contato",
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
            "label": "Localização",
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
            "label": "Avaliações",
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
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "items": [
          {
            "question": "O que o Extrator API retorna?",
            "answer": "JSON com até 20 lugares por página coletada. Cada local possui campos 29 — nome, categorias, endereço, telefone, site, classificação, contagem de avaliações, horário de funcionamento, coordenadas, Place ID, CID, fid e muito mais — além de e-mails e perfis sociais quando o extra for verdadeiro."
          },
          {
            "question": "Como faço para autenticar?",
            "answer": "Envie sua chave MapsGrab API como um token de portador no cabeçalho Authorization. Cada conta possui uma chave. Ela é mostrada por completo somente quando você a gera, e a geração de uma nova chave desativa a antiga imediatamente."
          },
          {
            "question": "Como as solicitações são contadas?",
            "answer": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
          },
          {
            "question": "O que a página faz?",
            "answer": "page é quantas páginas de resultados serão coletadas em uma chamada, de 1 a 10. Cada página soma 20 lugares, e a coleta para mais cedo, quando Google Maps não tem nada de novo. Não é um número de página."
          },
          {
            "question": "Os dados são públicos?",
            "answer": "Sim. O API retorna apenas informações exibidas publicamente em Google Maps — os mesmos detalhes que qualquer visitante pode ler. Não acessa contas privadas ou dados não públicos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Coloque os dados do Maps em seu ",
          "accent": "aplicativo",
          "tail": ""
        },
        "lead": "Uma solicitação HTTP por pesquisa, estruturada JSON na resposta — para CRMs, pipelines de dados e seus próprios produtos."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Extrator de avaliações API — Avaliações em JSON | MapsGrab",
        "description": "As MapsGrab Avaliações API retornam as avaliações públicas de uma empresa Google Maps como JSON: classificação, texto e tradução, autor, data, fotos da avaliação e respostas do proprietário — até 60 por página com um cursor."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Avaliações",
          "tail": " Extrator API"
        },
        "lead": "Solicite as avaliações públicas de qualquer empresa Google Maps por seu fid e estruture JSON de volta: classificação, texto e tradução, autor, data, fotos da avaliação e respostas do proprietário - página por página com um cursor.",
        "meta": [
          "Plano gratuito: {quota}",
          "Até 60 comentários por página",
          "JSON acima de HTTPS"
        ],
        "chips": [
          {
            "label": "Por página",
            "value": "Até 60 comentários"
          },
          {
            "label": "Ordenar por",
            "value": "Relevância · mais recente · classificação"
          }
        ]
      },
      "endpoint": {
        "name": "API de avaliações",
        "description": "Avaliações públicas de uma empresa por `fid` — até 60 por página, classificadas à sua maneira e paginadas com um cursor.",
        "link": "Explore as avaliações API"
      },
      "caps": {
        "title": {
          "lead": "O que ",
          "accent": "Avaliações API",
          "tail": " retorna"
        },
        "lead": "Cada avaliação pública de uma empresa – classificações, texto, autores, fotos e respostas do proprietário – uma página por solicitação.",
        "items": [
          {
            "icon": "review",
            "title": "Avaliações de fid",
            "description": "Dirija-se a uma empresa pelo `fid` de qualquer resultado do API de extração e, em seguida, passe `next_cursor` de volta para ler a próxima página, até 60 comentários cada."
          },
          {
            "icon": "filter",
            "title": "Organize do seu jeito",
            "description": "`sort_by` retorna primeiro as avaliações mais relevantes (1), mais recentes (2), com classificação mais alta (3) ou com classificação mais baixa (4)."
          },
          {
            "icon": "list",
            "title": "Texto, tradução e datas",
            "description": "Classificação, texto da revisão, `translated_text` e `language`, com `published_at_ms` e uma data relativa para cada revisão."
          },
          {
            "icon": "user",
            "title": "Detalhes do autor",
            "description": "Nome do autor e link do perfil, contagem de comentários do autor e status do Local Guide."
          },
          {
            "icon": "image",
            "title": "Fotos e respostas do proprietário",
            "description": "`images` lista a foto URLs anexada a uma avaliação; `owner_response` traz a resposta do proprietário e `owner_response_at_ms` sua hora."
          },
          {
            "icon": "shield",
            "title": "Apenas dados públicos",
            "description": "Apenas comentários exibidos publicamente em Google Maps — o mesmo conteúdo que qualquer visitante pode ler."
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
            "description": "ID do recurso comercial, por exemplo `0x5495…:0xbeb4…`. Cada lugar do API de extração inclui."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "O `next_cursor` da página anterior. Omita-o na primeira página."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` mais relevante · `2` mais recente · `3` classificação mais alta · `4` classificação mais baixa. Padrão `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Código de idioma, por ex. `en`. Padrão `en`."
          }
        ],
        "groups": [
          {
            "label": "Análise",
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
            "label": "Resposta do proprietário",
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
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Como abordar um negócio específico?",
            "answer": "Com seu fid, o ID do recurso que cada lugar do API de extração inclui. O Place ID Finder gratuito também lê o FID de qualquer Google Maps lugar URL."
          },
          {
            "question": "Quais campos uma revisão inclui?",
            "answer": "ID da revisão, classificação, texto com tradução e idioma, horário de publicação e data relativa, nome do autor, link do perfil, contagem de avaliações e status do Local Guide, fotos anexadas e resposta do proprietário com seu horário."
          },
          {
            "question": "Quantas avaliações posso coletar?",
            "answer": "Cada solicitação retorna uma página com até 60 avaliações mais next_cursor. Passe de volta para ler a próxima página; quando next_cursor é nulo, não há mais páginas."
          },
          {
            "question": "Como as solicitações são contadas?",
            "answer": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
          },
          {
            "question": "Os dados são públicos?",
            "answer": "Sim. O API retorna apenas comentários exibidos publicamente em Google Maps — o mesmo conteúdo que qualquer visitante pode ler. Não acessa contas privadas ou dados não públicos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Monitore avaliações ",
          "accent": "em escala",
          "tail": ""
        },
        "lead": "Tópicos de revisão com Cursor páginas em JSON limpo — para monitoramento, pesquisa e relatórios."
      }
    },
    "photosApi": {
      "seo": {
        "title": "API de fotos — URLs de fotos públicas de empresas | MapsGrab",
        "description": "Obtenha URLs de fotos públicas de uma empresa em JSON usando seu fid. max_results limita a entrega; os resultados são parciais e não garantem o álbum completo."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "Fotos",
          "tail": " API"
        },
        "lead": "Obtenha URLs de fotos públicas de uma empresa em JSON usando seu fid. max_results limita a entrega; os resultados são parciais e não garantem o álbum completo.",
        "meta": [
          "Plano gratuito: {quota}",
          "URLs de fotos públicas de empresas",
          "preço por solicitações"
        ],
        "chips": [
          {
            "label": "Entrega",
            "value": "partial"
          },
          {
            "label": "Quantidade",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "API de fotos",
        "description": "Obtenha URLs de fotos públicas de uma empresa em JSON usando seu fid. max_results limita a entrega; os resultados são parciais e não garantem o álbum completo.",
        "link": "Explorar a API de fotos"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "API de fotos",
          "tail": ""
        },
        "lead": "URLs de fotos públicas de empresas",
        "items": [
          {
            "icon": "image",
            "title": "Fotos por fid",
            "description": "Use o `fid` da busca ou do Place ID Finder. Cada item de `photos` contém a `url` de uma foto pública."
          },
          {
            "icon": "filter",
            "title": "Limite cada solicitação",
            "description": "`max_results` é um inteiro positivo, com padrão 200. A entrega pode conter menos fotos. Não há página nem cursor."
          },
          {
            "icon": "list",
            "title": "Confira o status da entrega",
            "description": "O `status` de sucesso é `partial`; `reason` explica por que a coleta parou. `reported_total` é a quantidade informada pela origem ou `null`, não o tamanho verificado do álbum."
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
            "description": "FID da empresa obtido na busca ou no Place ID Finder, no formato `0x…:0x…`, com 12 a 20 dígitos hexadecimais por segmento."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Limite positivo de entrega; padrão 200. Não garante essa quantidade de fotos."
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
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Como solicito fotos de uma empresa?",
            "answer": "Envie POST para /photos com fid e, opcionalmente, max_results. Use a mesma chave Bearer das APIs de busca e avaliações."
          },
          {
            "question": "Vou receber o álbum completo?",
            "answer": "O status de sucesso é partial; reason explica por que a coleta parou. reported_total é a quantidade informada pela origem ou null, não o tamanho verificado do álbum. max_results é um inteiro positivo, com padrão 200. A entrega pode conter menos fotos. Não há página nem cursor."
          },
          {
            "question": "Como faço para obter o fid de uma empresa?",
            "answer": "Cada lugar do API de extração inclui seu fid, e o Place ID Finder gratuito lê o FID de qualquer lugar Google Maps URL."
          },
          {
            "question": "Como as solicitações são contadas?",
            "answer": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
          },
          {
            "question": "Os dados são públicos?",
            "answer": "Sim. A imagem URLs aponta para fotos mostradas publicamente em Google Maps — as mesmas imagens que qualquer visitante pode ver."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Leve fotos de empresas para seu aplicativo",
          "tail": ""
        },
        "lead": "Use sua chave API para obter URLs de fotos públicas e o status da entrega."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps Extrator MCP Servidor | MapsGrab",
        "description": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Conecte seu agente",
      "hero": {
        "kicker": "MCP servidor",
        "title": {
          "lead": "Google Maps Extrator ",
          "accent": "MCP",
          "tail": " Servidor"
        },
        "lead": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP.",
        "meta": [
          "Streamable HTTP",
          "Faça login com OAuth",
          "Plano gratuito: {quota}"
        ],
        "chips": [
          {
            "label": "Transporte",
            "value": "Streamable HTTP"
          },
          {
            "label": "Resultados da ferramenta",
            "value": "Estruturado JSON"
          }
        ]
      },
      "agent": {
        "label": "Exemplo de sessão do agente: uma pergunta sobre negócios locais, uma chamada de ferramenta MapsGrab com resultados estruturados e a resposta do agente",
        "session": "Sessão do agente",
        "connected": "MCP servidor {server} conectado",
        "placeholder": "Pergunte sobre qualquer lugar em Google Maps…",
        "thinking": "Pensamento…",
        "running": "correndo",
        "scenes": [
          {
            "prompt": "Encontre dentistas em Austin, TX com classificação 4.8 ou superior e liste seus números de telefone.",
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
                "more": "+ 17 mais lugares"
              }
            ],
            "answer": [
              "Três dos primeiros 20 resultados são classificados ",
              {
                "strong": "4.8 ou superior"
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
            "prompt": "O que dizem as pessoas nas avaliações mais recentes de Ember & Oak Coffee em Portland?",
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
                "state": "60 comentários",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Majoritariamente ",
              {
                "strong": "5 estrela"
              },
              " — as pessoas elogiam o café expresso e a simpatia dos funcionários. A única nota recorrente: ",
              {
                "strong": "os assentos são apertados nos finais de semana"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Quais encanadores em Chicago não listam um site? Coloque-os em uma mesa.",
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
                "more": "+ 17 mais lugares"
              }
            ],
            "answer": [
              {
                "strong": "4 de 20"
              },
              " não tem site listado. Os três primeiros:"
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
            "prompt": "Obtenha as avaliações com classificação mais baixa de Rose City Roasters e redija respostas educadas.",
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
                "state": "60 comentários",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "As classificações mais baixas mencionam principalmente ",
              {
                "strong": "serviço lento em horários de pico"
              },
              ". ",
              {
                "strong": "2 do 3"
              },
              " ainda não tenho resposta do proprietário - elaborei uma para cada."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Ferramentas",
        "title": {
          "lead": "O que o servidor MCP ",
          "accent": "expõe",
          "tail": ""
        },
        "lead": "Três ferramentas: Search / Reviews / Photos.",
        "kind": "Ferramenta",
        "returns": "Devoluções",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Pesquisar lugares",
            "description": "Pesquisas por palavra-chave e localização que retornam o que uma pesquisa Google Maps mostra – nomes, telefones, classificações, horários, coordenadas, IDs de locais e fids.",
            "args": [
              {
                "name": "q",
                "description": "Palavra-chave mais cidade, estado ou ZIP"
              },
              {
                "name": "page",
                "description": "Páginas de resultados a serem coletadas, 1–10 · até 20 lugares cada"
              },
              {
                "name": "hl",
                "description": "Idioma do resultado, por ex. `en`"
              },
              {
                "name": "ll",
                "description": "Viés de localização, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` adiciona e-mails e perfis sociais"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Mesmos dados do Extrator API"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Listar comentários",
            "description": "Avaliações, texto de avaliação, autores, datas, fotos e respostas do proprietário para qualquer empresa que seu agente esteja investigando.",
            "args": [
              {
                "name": "fid",
                "description": "De qualquer resultado de pesquisa"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` da última página; omitir para o primeiro"
              },
              {
                "name": "sort_by",
                "description": "1 relevante · 2 mais novo · 3 mais alto · 4 mais baixo"
              },
              {
                "name": "hl",
                "description": "Idioma, por ex. `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Mesmos dados das Avaliações API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Fotos por fid",
            "description": "Obtenha URLs de fotos públicas de uma empresa em JSON usando seu fid. max_results limita a entrega; os resultados são parciais e não garantem o álbum completo.",
            "args": [
              {
                "name": "fid",
                "description": "FID da empresa obtido na busca ou no Place ID Finder, no formato `0x…:0x…`, com 12 a 20 dígitos hexadecimais por segmento."
              },
              {
                "name": "max_results",
                "description": "Limite positivo de entrega; padrão 200. Não garante essa quantidade de fotos."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Explorar a API de fotos"
          }
        ]
      },
      "flow": {
        "kicker": "Como isso se conecta",
        "title": {
          "lead": "Um ponto de extremidade entre seu agente e ",
          "accent": "dados do Live Maps",
          "tail": ""
        },
        "lead": "Seu cliente se conecta por Streamable HTTP e faz login por meio de seu navegador. O agente descobre as ferramentas, chama-as quando um prompt precisa de dados do Maps e lê JSON estruturado de volta.",
        "label": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP clientes",
        "anyClient": "Qualquer cliente MCP",
        "toolsLabel": "Ferramentas",
        "hub": "MapsGrab MCP",
        "publicData": "Dados Google Maps públicos",
        "resultLabel": "resultado",
        "results": [
          "20 lugares",
          "60 comentários",
          "2 Fotos"
        ],
        "steps": [
          {
            "title": "Conectar",
            "description": "Adicione o endpoint ao seu cliente e faça login no MapsGrab por meio do seu navegador."
          },
          {
            "title": "Descobrir",
            "description": "Seu agente lista as ferramentas MapsGrab e seus esquemas de entrada."
          },
          {
            "title": "Chamar",
            "description": "Quando um prompt precisa de dados do Maps, o agente chama uma ferramenta e lê o resultado JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Configurar",
        "title": {
          "lead": "Um bloco de configuração ",
          "accent": "por cliente",
          "tail": ""
        },
        "lead": "Aponte seu cliente para o endpoint MapsGrab e faça login através do seu navegador – sem chave API para copiar, sem SDK, sem processo local para executar.",
        "tabsLabel": "MCP cliente",
        "copy": "Copiar configuração",
        "clients": {
          "claude": {
            "file": "terminal",
            "steps": [
              {
                "title": "Adicione o servidor",
                "description": "Execute o comando para registrar `mapsgrab` em HTTP."
              },
              {
                "title": "Entrar",
                "description": "Em Claude Code, execute `/mcp`, escolha `mapsgrab` e autentique – MapsGrab abre em seu navegador para você aprovar."
              },
              {
                "title": "Peça dados do Maps",
                "description": "Claude Code lista as ferramentas MapsGrab e as chama quando um prompt precisa delas."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Editar mcp.json",
                "description": "Adicione o bloco a `~/.cursor/mcp.json` para cada projeto ou `.cursor/mcp.json` para um."
              },
              {
                "title": "Entrar",
                "description": "Em Configurações Cursor → MCP, clique em Conectar ao lado de `mapsgrab` e aprove-o em seu navegador."
              },
              {
                "title": "Use as ferramentas",
                "description": "`mapsgrab` mostra suas ferramentas na lista de servidores MCP, prontas para o agente."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Adicionar .vscode/mcp.json",
                "description": "Cole o bloco – ele contém apenas o endpoint URL, nada secreto."
              },
              {
                "title": "Entrar",
                "description": "Inicie o servidor. VS Code pede para autenticar com MapsGrab e abre seu navegador para aprovar."
              },
              {
                "title": "Usar modo de agente",
                "description": "Abra o Chat no modo agente e ative as ferramentas MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "terminal",
            "steps": [
              {
                "title": "Adicione o servidor",
                "description": "Execute `codex mcp add` para registrar `mapsgrab` por URL."
              },
              {
                "title": "Entrar",
                "description": "Execute `codex mcp login mapsgrab` e aprove MapsGrab em seu navegador."
              },
              {
                "title": "Começar Codex",
                "description": "Novas sessões carregam `mapsgrab` e suas ferramentas."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Não é possível fazer login em um navegador? Use uma chave API",
          "description": "Se o seu cliente não suportar autorização MCP ou for executado em um servidor ou CI, adicione sua chave API como um cabeçalho `Authorization`. Mantenha a chave em uma variável de ambiente ou na entrada secreta do seu cliente, não em um arquivo de configuração compartilhado.",
          "link": "Obtenha a chave API",
          "snippet": "Qualquer cliente HTTP"
        },
        "spec": {
          "title": "Qualquer outro cliente MCP",
          "subtitle": "MCP Inspector incluído",
          "transport": "Transporte",
          "transportValue": "Streamable HTTP",
          "endpoint": "Ponto final",
          "copyEndpoint": "Copiar ponto de extremidade",
          "auth": "Autenticação",
          "authValue": "Login OAuth (substituto: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Solicitações de exemplo",
        "title": {
          "lead": "Pergunte em linguagem simples. ",
          "accent": "Recuperar linhas.",
          "tail": ""
        },
        "lead": "Prospecção, pesquisa de mercado local, monitoramento de avaliações — descreva o trabalho e seu agente decidirá qual ferramenta MapsGrab ligar.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "Prospecção",
              "quote": "“Encontre dentistas em Austin, TX com classificação 4.8 ou superior e liste seus números de telefone.”",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Reputação",
              "quote": "“Resuma o que as pessoas dizem nas avaliações mais recentes de Ember & Oak Coffee em Portland.”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Listas de leads",
              "quote": "“Crie uma lista de estúdios de ioga em Denver com seus e-mails e perfis do Instagram.”",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Pesquisa de mercado",
              "quote": "“Compare as classificações e contagens de avaliações das cafeterias na Division St em Portland.”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Enriquecimento",
              "quote": "“Adicione Place ID, telefone e site de cada empresa nesta planilha.”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Respostas do proprietário",
              "quote": "“Receba as avaliações com classificação mais baixa de Rose City Roasters e redija respostas educadas.”",
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
              "tag": "Lacunas no site",
              "quote": "\"Quais encanadores em Chicago não listam um site? Coloque-os em uma mesa.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Horário de funcionamento",
              "quote": "“Quais oficinas mecânicas perto de 60614 estão abertas aos domingos?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Mapeamento",
              "quote": "“Exporte os restaurantes veganos no Brooklyn com coordenadas como GeoJSON.”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Localização",
              "quote": "“Procure padarias em Lyon e retorne os detalhes da listagem em francês.”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Listagens reivindicadas",
              "quote": "“Verifique quais academias em Austin reivindicaram sua listagem comercial Google.”",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Guias locais",
              "quote": "“Quais comentários recentes sobre Hawthorne Bean Co. vêm do Local Guides?”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Tempo de resposta",
              "quote": "“Esses salões respondem às avaliações e quanto tempo levam as respostas dos proprietários?”",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Autenticação e dados",
        "title": {
          "lead": "Faça login uma vez. ",
          "accent": "Somente dados públicos.",
          "tail": ""
        },
        "lead": "Cada chamada para o endpoint MCP carrega uma credencial de portador – um token OAuth de login ou sua chave API se seu cliente não puder fazer login – e cada resultado vem do que Google Maps mostra publicamente.",
        "inspector": {
          "label": "Exemplo de solicitação MCP com um cabeçalho Authorization de portador e sua resposta JSON-RPC com conteúdo estruturado",
          "request": "Solicitar",
          "response": "Resposta",
          "verified": "Token verificado"
        },
        "items": [
          {
            "icon": "key",
            "title": "Faça login ou volte para uma chave",
            "description": "Faça login através do seu navegador e aprove o cliente. Clientes sem autorização MCP podem passar sua chave API como um token de portador — ambos acessam as mesmas ferramentas."
          },
          {
            "icon": "eye",
            "title": "Lê Google Maps, nunca escreve",
            "description": "As ferramentas apenas pesquisam e leem listagens públicas. A única coisa que uma chamada muda é o uso da solicitação."
          },
          {
            "icon": "lock",
            "title": "Sem segredos nos arquivos de configuração",
            "description": "Com o login, sua configuração contém apenas o endpoint URL. Se você usar uma chave API, mantenha-a em uma variável de ambiente, não em um arquivo compartilhado."
          },
          {
            "icon": "shield",
            "title": "Revogue o acesso a qualquer momento",
            "description": "Os clientes conectados são listados no Painel → API, onde você pode revogá-los. A geração de uma nova chave API desativa a antiga imediatamente."
          }
        ]
      },
      "billing": {
        "kicker": "Preços",
        "title": {
          "lead": "Coberto pelo seu plano ",
          "accent": "API",
          "tail": ""
        },
        "lead": "O servidor MCP utiliza a mesma cota de solicitação mensal que o API de extração e as Avaliações API. Cada chamada de ferramenta bem-sucedida conta como uma solicitação.",
        "compare": "Compare planos API",
        "head": {
          "plan": "Plano",
          "requests": "Solicitações mensais",
          "scale": "(escala logarítmica)",
          "price": "Preço"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Perguntas frequentes",
          "tail": ""
        },
        "items": [
          {
            "question": "Qual é o servidor MapsGrab MCP?",
            "answer": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP. search_places / list_reviews / list_photos."
          },
          {
            "question": "Quais clientes podem se conectar?",
            "answer": "Qualquer cliente MCP que suporte Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector e outros. Use o endpoint URL exatamente como mostrado, incluindo a barra final."
          },
          {
            "question": "Como é autenticado?",
            "answer": "Com login OAuth: Claude Code, Cursor, VS Code, Codex e outros clientes que suportam autorização MCP, abra MapsGrab em seu navegador; você aprova o cliente e pode revogá-lo posteriormente em Painel → API. Somente se o seu cliente não conseguir fazer login, passe sua chave API como token de portador no cabeçalho Authorization."
          },
          {
            "question": "Como são contadas as chamadas de ferramenta?",
            "answer": "Cada chamada bem-sucedida conta como uma solicitação, inclusive entregas parciais de fotos, independentemente da quantidade. Se nenhuma foto válida puder ser entregue, a chamada falha e não consome cota. Busca, avaliações, fotos e MCP compartilham a cota mensal."
          },
          {
            "question": "Meu agente pode obter fotos comerciais?",
            "answer": "list_photos(fid, max_results): Obtenha URLs de fotos públicas de uma empresa em JSON usando seu fid. max_results limita a entrega; os resultados são parciais e não garantem o álbum completo. Limite positivo de entrega; padrão 200. Não garante essa quantidade de fotos."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Forneça ao seu agente ",
          "accent": "dados de mapas ao vivo",
          "tail": ""
        },
        "lead": "Busque lugares no Google Maps, leia avaliações e obtenha URLs de fotos públicas de empresas com uma conexão MCP."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Ferramentas gratuitas",
        "guide": {
          "kicker": "Sobre esta ferramenta",
          "title": {
            "lead": "O que faz e ",
            "accent": "como usar",
            "tail": ""
          },
          "lead": "Tudo é executado no seu navegador – nada do que você cola ou carrega sai do seu dispositivo."
        },
        "related": {
          "kicker": "Ferramentas relacionadas",
          "title": {
            "lead": "Mais ferramentas gratuitas para ",
            "accent": "Maps data",
            "tail": ""
          },
          "lead": "Pequenos utilitários que são executados inteiramente no seu navegador — o que você cola nunca sai do seu dispositivo."
        },
        "faq": {
          "kicker": "Perguntas frequentes",
          "lead": "As respostas curtas. Qualquer outra coisa, o suporte está a um e-mail de distância.",
          "contact": "Contate o suporte"
        },
        "cta": {
          "kicker": "Extração em massa",
          "primary": "Instalar MapsGrab",
          "secondary": "Ver preços",
          "note": "Cota mensal gratuita incluída. Sem cartão de crédito."
        },
        "resultHeading": "Resultado",
        "copy": "Cópia",
        "copied": "Copiado para a área de transferência.",
        "downloadCsv": "Baixar CSV",
        "genericError": "Algo deu errado. Verifique sua entrada e tente novamente."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder — Obtenha um Google Maps Place ID de um URL | MapsGrab",
          "description": "Cole um lugar Google Maps URL e obtenha Place ID, CID e FID instantaneamente. Localizador Place ID gratuito baseado em navegador - sem login, seu URL nunca sai do seu dispositivo."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "Finder",
            "tail": ""
          },
          "description": "Cole um lugar Google Maps completo URL e leia seus Place ID, CID e FID com um clique. Tudo é decodificado no seu navegador — o URL nunca é carregado."
        },
        "form": {
          "urlLabel": "Google Maps lugar URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Encontre Place ID",
          "errorShortLink": "Links curtos (maps.app.goo.gl) não são suportados. Abra o link em seu navegador e cole o URL completo na barra de endereço.",
          "errorInvalidUrl": "Este não parece um lugar Google Maps URL. Abra um local em Google Maps e copie o URL completo (deve conter \"/maps/place/\" e \"@\" ou \"data=\").",
          "errorNoIds": "Nenhum identificador de lugar foi encontrado neste URL. Certifique-se de copiar o URL de uma página de local, não de uma página de resultados de pesquisa.",
          "examplesLabel": "Tentar",
          "examples": {
            "city": "São Francisco",
            "business": "Café · Portland",
            "shortLink": "Link curto"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url das duas FID metades",
          "cidNote": "FID 2segunda metade, hexadecimal → decimal",
          "fidNote": "últimos dois 0x… segmentos no URL",
          "anatomy": {
            "fidHigh": "FID · 1primeiro semestre",
            "fidLow": "FID · 2segundo semestre",
            "empty": "Cole um local URL — os identificadores que ele carrega acendem aqui."
          },
          "missing": "Não neste link",
          "copyLabel": "Copiar {label}",
          "privacy": "Decodificado em seu navegador — o URL nunca é carregado."
        },
        "chips": [
          {
            "label": "Google API chave",
            "value": "Não é necessário"
          },
          {
            "label": "Seu URL",
            "value": "Nunca enviado"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Como funciona",
            "title": {
              "lead": "De um link do Maps para um ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "Sem chave API e sem login — os identificadores já estão dentro do local URL que você copia."
          },
          "items": [
            {
              "heading": "Abra o local em Google Maps",
              "body": "Pesquise a empresa e clique em sua listagem para que a página do local seja aberta."
            },
            {
              "heading": "Copie o URL completo",
              "body": "Copie o URL longo da barra de endereço — ele contém o nome da empresa, um segmento de coordenadas \"@\" e um parâmetro \"data=\"."
            },
            {
              "heading": "Colar e decodificar",
              "body": "Cole acima e pressione \"Localizar Place ID\". Os Place ID, CID e FID aparecem, cada um com um botão de copiar."
            }
          ],
          "copiedBadge": "Copiado",
          "note": "Links curtos como maps.app.goo.gl não podem ser decodificados sem segui-los nos domínios, então abra o link primeiro e cole o endereço completo."
        },
        "identifiers": {
          "head": {
            "kicker": "Os identificadores",
            "title": {
              "lead": "Três IDs, ",
              "accent": "um lugar",
              "tail": ""
            },
            "lead": "Um Place ID é o identificador estável de Google para um local – uma string começando com “ChIJ” que permanece válida mesmo se a empresa mudar de nome ou se mudar."
          },
          "keys": {
            "placeId": "A string \"ChIJ…\" consumida pelos locais API, widgets de avaliação e sistemas de reserva.",
            "fid": "Um par de valores hexadecimais que identificam o mesmo recurso internamente.",
            "cid": "A forma decimal da segunda metade de FID, usada por mapas URLs mais antigos e ferramentas de anúncios."
          },
          "derive": {
            "label": "Como Place ID e CID são derivados de FID",
            "source": "FID de URL",
            "protobuf": "protobuf · little-endian",
            "base64": "base64url",
            "secondHalf": "2segunda metade",
            "hexToDecimal": "hexadecimal → decimal"
          },
          "features": [
            {
              "heading": "Sem chave API",
              "body": "O Place ID já está codificado dentro do local URL que você cola, para que a ferramenta possa decodificá-lo offline."
            },
            {
              "heading": "Sem limites de taxa",
              "body": "Nenhum serviço de pesquisa está envolvido - a conversão de um URL do Maps para um Place ID é determinística."
            },
            {
              "heading": "Nunca enviado",
              "body": "Todo o cálculo é executado na guia do seu navegador – o URL que você cola nunca é enviado para nenhum servidor."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Um Place ID muda alguma vez?",
              "answer": "Raramente. Google documentos Coloque os IDs como identificadores estáveis ​​de longo prazo, mas um pequeno número de IDs pode ser retirado quando os locais forem mesclados ou reestruturados. Se um consumidor de um Place ID reportá-lo como inválido, procure o local novamente e atualize o valor armazenado."
            },
            {
              "question": "O Place ID é igual ao CID?",
              "answer": "Não. O CID é um identificador decimal usado por links mais antigos do Maps e ferramentas de publicidade, enquanto o Place ID é a string \"ChIJ…\" consumida pelo Places API. Eles identificam o mesmo recurso, mas não são intercambiáveis, por isso esta ferramenta relata ambos."
            },
            {
              "question": "Por que meu link maps.app.goo.gl foi rejeitado?",
              "answer": "Links curtos só resolvem para o local completo URL após um redirecionamento entre domínios, que uma ferramenta somente de navegador não pode seguir sem enviar seu link a terceiros. Abra o link curto em seu navegador e cole o URL completo que aparece na barra de endereço."
            },
            {
              "question": "Preciso de uma chave Google API para isso?",
              "answer": "O Place ID já está codificado dentro do local URL que você cola, então a ferramenta pode decodificá-lo offline. Uma chave Google API só é necessária quando você deseja ligar para os Locais API com o ID posteriormente."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Precisa de IDs de locais ",
            "accent": "em escala?",
            "tail": ""
          },
          "lead": "MapsGrab extrai Place ID, CID e FID para cada negócio que coleta - junto com 33 outras colunas - e exporta diretamente para CSV ou JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google Gerador de link de revisão – Revisão direta gratuita URL | MapsGrab",
          "description": "Transforme um lugar Google Maps URL em um link de avaliação Google direto que você pode compartilhar com os clientes. Gratuito, baseado em navegador e nada é carregado."
        },
        "hero": {
          "title": {
            "lead": "Google Link de revisão ",
            "accent": "Gerador",
            "tail": ""
          },
          "description": "Cole um lugar Google Maps URL e obtenha o link direto \"escrever um comentário\" para essa empresa - o caminho mais curto de um cliente satisfeito até uma avaliação Google."
        },
        "form": {
          "urlLabel": "Google Maps lugar URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Gerar link de revisão",
          "errorShortLink": "Links curtos (maps.app.goo.gl) não são suportados. Abra o link em seu navegador e cole o URL completo na barra de endereço.",
          "errorInvalidUrl": "Este não parece um lugar Google Maps URL. Abra um local em Google Maps e copie o URL completo (deve conter \"/maps/place/\" e \"@\" ou \"data=\").",
          "errorNoIds": "Nenhum identificador de lugar foi encontrado neste URL. Certifique-se de copiar o URL de uma página de local, não de uma página de resultados de pesquisa."
        },
        "result": {
          "linkLabel": "Link de revisão",
          "open": "Abrir"
        },
        "howTo": [
          {
            "heading": "O que é um link de revisão Google?",
            "body": "Um link de revisão é um atalho que abre a caixa de diálogo de revisão de uma empresa específica em Google. Em vez de pedir aos clientes que pesquisem sua empresa, vá até a seção de comentários e pressione \"Escrever um comentário\", você envia a eles um URL - search.google.com/local/reviews?placeid=… - que vai diretamente para o formulário de avaliação. As empresas colocam esses links em e-mails de acompanhamento, códigos QR no balcão e mensagens SMS pós-transação."
          },
          {
            "heading": "Como gerar um link de avaliação",
            "body": "Abra Google Maps, encontre sua empresa e abra a página do local. Copie o URL longo da barra de endereço e cole-o acima. Pressione “Gerar link de avaliação” e a ferramenta cria o link direto com o ID do local codificado, pronto para copiar ou abrir. O link é universal: funciona em navegadores de desktop e no aplicativo móvel Google Maps."
          },
          {
            "heading": "De onde vem o ID do lugar",
            "body": "A ferramenta reutiliza a mesma decodificação local do Place ID Finder: o identificador já está presente no Maps URL, e a conversão para o formato \"ChIJ…\" acontece inteiramente no seu navegador. Se você gerencia vários locais, repita o processo por local — ou deixe MapsGrab carregar a coluna Place ID em cada exportação para que links de revisão possam ser gerados em massa a partir de uma planilha."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Os links de revisão expiram?",
              "answer": "Não. O link está vinculado ao ID do local, que Google permanece estável. Enquanto o local existir em Google Maps, o link continuará abrindo sua caixa de diálogo de revisão."
            },
            {
              "question": "Posso usar um link para vários locais?",
              "answer": "Cada link de avaliação pertence a exatamente um lugar. Gere um link separado por local – empresas com vários locais geralmente mantêm uma tabela de IDs de locais e derivam os links dela."
            },
            {
              "question": "É permitido pedir comentários com um link?",
              "answer": "Pedir avaliações honestas aos clientes é bom; incentivar ou filtrar avaliações não é. A política de Google proíbe compensação por avaliações e restrição de avaliações – envie o mesmo link para todos os clientes e deixe o feedback falar por si."
            },
            {
              "question": "Por que meu link abre uma página de pesquisa em vez do formulário de revisão?",
              "answer": "Isso acontece quando o ID do local no link está errado — geralmente o resultado de um URL editado manualmente. Gere novamente o link do local original do Maps URL e verifique se Place ID começa com \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Acompanhe cada avaliação que você ",
            "accent": "ganha",
            "tail": ""
          },
          "lead": "MapsGrab extrai os comentários de qualquer página de negócios – classificação, texto, data e respostas do proprietário – para que você possa ver o feedback chegar e respondê-lo com mais rapidez."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Verificador de e-mail — Validador de formato de e-mail gratuito | MapsGrab",
          "description": "Verifique instantaneamente se há erros de sintaxe e erros de digitação comuns em um endereço de e-mail. Validação de formato gratuita executada em seu navegador — sem sondagem SMTP, nada é enviado para lugar nenhum."
        },
        "hero": {
          "title": {
            "lead": "E-mail ",
            "accent": "Checker",
            "tail": ""
          },
          "description": "Digite um endereço de e-mail e veja instantaneamente se seu formato é válido — além de dicas para os erros de digitação mais comuns. Tudo roda no seu navegador."
        },
        "form": {
          "emailLabel": "Endereço de email",
          "emailPlaceholder": "name@example.com",
          "submit": "Verificar e-mail",
          "validHeading": "Este endereço de e-mail parece válido.",
          "invalidHeading": "Este endereço de e-mail tem problemas:",
          "issues": {
            "empty": "Insira um endereço de e-mail primeiro.",
            "multipleAt": "O endereço contém mais de um símbolo “@”.",
            "missingAt": "O endereço está faltando o “@” que separa a parte local do domínio.",
            "localEmpty": "A parte antes do \"@\" está vazia.",
            "localTooLong": "A parte antes do \"@\" é maior que os 64 caracteres permitidos pelos padrões de e-mail.",
            "localInvalidChars": "A parte antes de “@” contém caracteres que não são permitidos em endereços de e-mail (espaços, aspas ou caracteres de controle).",
            "localDotPosition": "Os pontos na parte local não podem ser o primeiro, o último ou aparecer duas vezes seguidas.",
            "domainEmpty": "A parte após o \"@\" está vazia.",
            "domainNoTld": "O domínio não tem final (TLD) — adicione algo como “.com” ou “.org”.",
            "domainInvalidChars": "O domínio contém caracteres não permitidos (espaços, sublinhados ou símbolos).",
            "domainLabelHyphen": "Os rótulos de domínio não podem começar ou terminar com um hífen.",
            "domainEmptyLabel": "O domínio contém dois pontos seguidos ou um segmento vazio.",
            "domainTooLong": "O domínio tem mais de 253 caracteres permitidos pelos padrões de e-mail.",
            "typoDomain": "Este domínio parece um erro de digitação de um provedor de e-mail popular."
          }
        },
        "howTo": [
          {
            "heading": "O que este verificador faz – e o que deliberadamente não faz",
            "body": "Esta ferramenta valida o formato de um endereço de email: o formato da parte local, o “@” e o domínio, seguindo as regras práticas das especificações RFC que os servidores de email realmente aplicam. Ele também sinaliza prováveis ​​​​erros de digitação de provedores de caixa de correio populares, a causa mais comum de endereços inativos em listas de leads. Ele não envia nenhuma investigação ao servidor de e-mail: a verificação SMTP divulgaria o endereço a terceiros, o que entra em conflito com a execução de toda a verificação localmente no seu navegador."
          },
          {
            "heading": "Como verificar um endereço de e-mail",
            "body": "Digite ou cole o endereço e pressione “Verificar e-mail”. Um resultado verde significa que o formato tem formato de entrega; um resultado vermelho lista todas as regras que o endereço quebra e – quando o domínio parece um provedor com erro ortográfico – sugere a regra pretendida. Corrija os problemas relatados e verifique novamente até que o endereço seja aprovado."
          },
          {
            "heading": "Onde a verificação de formato se encaixa em um fluxo de trabalho de dados",
            "body": "A validação de formato é o primeiro e mais barato filtro para qualquer lista de e-mail: ela remove endereços que nunca podem chegar a uma caixa de correio antes de você gastar capacidade de entrega ou orçamento de enriquecimento neles. MapsGrab aplica esse pensamento a todo o fluxo de trabalho do lead – a extensão enriquece cada empresa coletada com os endereços de e-mail encontrados em seu site oficial, de modo que a etapa de verificação posterior começa com uma lista muito mais limpa."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Esta ferramenta verifica se a caixa de correio realmente existe?",
              "answer": "Não - deliberadamente. A verificação da existência requer uma consulta ao servidor de e-mail do destinatário (SMTP sondagem), o que não pode ser feito de forma privada em um navegador e pode sinalizar seu IP. Esta ferramenta verifica tudo o que pode ser verificado sem tocar na rede: estrutura, caracteres permitidos e erros de digitação comuns do provedor."
            },
            {
              "question": "Um endereço pode passar aqui e ainda assim saltar?",
              "answer": "Sim. Um endereço sintaticamente perfeito ainda pode ser fechado, completo ou abandonado. A validação de formato remove os endereços errados antes mesmo de tentar a entrega – ela não pode garantir que uma caixa de correio de aparência válida seja lida por um ser humano."
            },
            {
              "question": "Por que \"name@localhost\" foi rejeitado?",
              "answer": "O verificador requer um domínio com final público (TLD) porque endereços sem um não podem receber mensagens de fora da Internet. Os padrões que permitem domínios apenas internos são irrelevantes para listas de leads e dados de clientes."
            },
            {
              "question": "Minha entrada está armazenada em algum lugar?",
              "answer": "Não. A validação é executada simplesmente JavaScript na aba do seu navegador; nada é transmitido, registrado ou armazenado – recarregue a página e a entrada desaparecerá."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Colete e-mails que valem ",
            "accent": "verificação",
            "tail": ""
          },
          "lead": "MapsGrab encontra os endereços de e-mail e perfis sociais por trás de cada empresa que extrai — diretamente do site de cada empresa."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Converter Lat Long em DMS — Graus decimais em Graus Minutos Segundos | MapsGrab",
          "description": "Converta latitude e longitude decimais em graus, minutos, segundos (DMS) no formato instantaneamente. Conversor de coordenadas gratuito baseado em navegador, nada carregado."
        },
        "hero": {
          "title": {
            "lead": "Converter Lat Longo em ",
            "accent": "DMS",
            "tail": ""
          },
          "description": "Insira latitude e longitude decimais e leia as mesmas coordenadas em graus, minutos, segundos — com letras hemisféricas, prontas para copiar."
        },
        "form": {
          "latitudeLabel": "Latitude (decimal, -90 a 90)",
          "longitudeLabel": "Longitude (decimal, -180 a 180)",
          "placeholder": "37.774929",
          "submit": "Converter para DMS",
          "errorLatitude": "A latitude deve ser um número entre -90 e 90.",
          "errorLongitude": "A longitude deve ser um número entre -180 e 180."
        },
        "result": {
          "dms": "Coordenadas em DMS"
        },
        "howTo": [
          {
            "heading": "O que são graus decimais e DMS?",
            "body": "Mapas e planilhas armazenam coordenadas como graus decimais – um número assinado por eixo, como 37.774929, -122.419416. Topografia, cartas marítimas e muitos documentos de propriedade usam a notação sexagesimal mais antiga: graus, minutos e segundos com letras hemisféricas, como 37° 46' 29.74\" N, 122° 25' 9.90\" W. Ambos descrevem o mesmo ponto; a forma DMS simplesmente divide a fração em unidades sucessivamente menores, onde um minuto é 1/60 grau e um segundo é 1/60 minuto."
          },
          {
            "heading": "Como converter",
            "body": "Cole a latitude e longitude decimal e pressione \"Converter para DMS\". Os valores negativos são mapeados para os hemisférios sul e oeste e são relatados como S e W. Os segundos são mostrados com duas casas decimais – cerca de um metro de resolução do solo, mais preciso do que qualquer captura GPS de consumidor. Copie o resultado como uma única linha para documentos ou como campos separados para planilhas."
          },
          {
            "heading": "Por que isso é importante para o funcionamento dos dados de mapas",
            "body": "As viagens de ida e volta coordenadas são um ponto de atrito diário ao mover dados de negócios entre ferramentas: Google Maps exporta decimais, enquanto os fluxos de trabalho cadastrais e de impressão esperam DMS. MapsGrab mantém esse atrito baixo em escala – cada negócio extraído já carrega sua latitude e longitude na exportação, e as conversões de coordenadas em lote podem ser executadas offline com a mesma fórmula usada nesta página."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Quão preciso é o resultado DMS?",
              "answer": "Os segundos são mostrados com duas casas decimais. Um segundo de latitude equivale a aproximadamente 30 metros, então duas casas decimais resultam em cerca de 30 centímetros – muito mais próximo do que os dados GPS subjacentes. A precisão é limitada pela sua entrada, não pela conversão."
            },
            {
              "question": "O que N, S, E e W significam aqui?",
              "answer": "Eles substituem o sinal do valor decimal: as latitudes positivas são o norte (N) e as negativas são o sul (S); longitudes positivas são leste (E) e negativas são oeste (W). A ferramenta seleciona as letras do sinal automaticamente."
            },
            {
              "question": "Posso converter DMS de volta para decimal aqui?",
              "answer": "Sim - use a ferramenta complementar \"Converter DMS em DD\" neste site. A conversão nos dois sentidos com a mesma implementação evita desvios de arredondamento entre fórmulas diferentes."
            },
            {
              "question": "Meus dados de coordenadas foram carregados?",
              "answer": "Não. A conversão é feita aritméticamente na aba do seu navegador; nada que você digita sai da página."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Coordenadas para todos os negócios, já ",
            "accent": "extraídas",
            "tail": ""
          },
          "lead": "MapsGrab escreve latitude e longitude em cada linha que exporta — sem pesquisa manual de coordenadas para seu próximo projeto de rota ou território."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Converter DMS em DD — Graus Minutos Segundos em Graus Decimais | MapsGrab",
          "description": "Converta coordenadas de graus, minutos e segundos em graus decimais instantaneamente. Conversor gratuito de DMS para DD baseado em navegador, nada carregado."
        },
        "hero": {
          "title": {
            "lead": "Converter DMS em DD ",
            "accent": "(Lat, Long)",
            "tail": ""
          },
          "description": "Insira graus, minutos e segundos para ambos os eixos e obtenha graus decimais limpos - o formato Google Maps, planilhas e MapsGrab entendem."
        },
        "form": {
          "latitudeHeading": "Latitude (N/S)",
          "longitudeHeading": "Longitude (L/O)",
          "degreesLabel": "Graus",
          "minutesLabel": "Minutos de arco",
          "secondsLabel": "Segundos de arco",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Converter para decimal",
          "errorValues": "Os graus devem ser zero ou um número inteiro positivo, os minutos e segundos devem estar entre 0 e 60."
        },
        "result": {
          "dd": "Coordenadas em graus decimais"
        },
        "howTo": [
          {
            "heading": "Por que converter DMS de volta em graus decimais?",
            "body": "Graus-minutos-segundos é uma notação humana, mas praticamente todos os sistemas voltados para máquinas desejam graus decimais: pesquisa Google Maps, importações de GIS, fórmulas de distância em planilhas e pipelines de geocodificação. A conversão é uma soma ponderada simples – graus mais minutos dividido por 60 mais segundos dividido por 3600 – com a letra do hemisfério decidindo o sinal."
          },
          {
            "heading": "Como converter",
            "body": "Preencha graus, minutos e segundos para latitude e longitude e escolha as letras do hemisfério (N/S e E/W). Pressione \"Converter para decimal\" e a ferramenta gera ambos os eixos como números decimais assinados com seis casas decimais, o que resulta em aproximadamente 11 centímetros no solo - mais do que suficiente para qualquer uso em local comercial. Cole o resultado diretamente em Google Maps ou em sua planilha."
          },
          {
            "heading": "Mantendo os dados de coordenadas consistentes",
            "body": "Notações mistas são o motivo comum pelo qual os locais acabam no oceano errado após uma importação. Decidir os graus decimais uma vez e converter tudo no limite mantém os pipelines sãos. MapsGrab já exporta coordenadas em graus decimais, então os dados coletados com a extensão são transferidos para ferramentas GIS e BI sem qualquer etapa de conversão."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Quantas casas decimais eu preciso?",
              "answer": "Seis casas decimais resultam em aproximadamente 11 centímetros – além da precisão do GPS do consumidor. Cinco lugares (cerca de 1 metros) são suficientes para locais comerciais; menos decimais confundem intencionalmente o ponto."
            },
            {
              "question": "Quais intervalos os campos devem satisfazer?",
              "answer": "Minutos e segundos variam de 0 até menos de 60. Os graus de latitude chegam a 90 e a longitude até 180; o conversor informa quando um valor chegaria fora do globo."
            },
            {
              "question": "Devo inserir números negativos ao escolher S ou W?",
              "answer": "Não – a letra do hemisfério já codifica o sinal. Se você inserir um valor assinado e uma letra conflitante ao mesmo tempo, a ferramenta sinalizará a contradição em vez de adivinhar."
            },
            {
              "question": "A conversão é feita em um servidor?",
              "answer": "Não. A fórmula é executada no seu navegador; nada do que você digita é transmitido para qualquer lugar."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Ignorar trabalho de coordenadas manuais ",
            "accent": "em escala",
            "tail": ""
          },
          "lead": "MapsGrab exporta latitude e longitude decimais para cada empresa que coleta, próximo ao endereço, telefone e colunas Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Gerador de palavras-chave em massa - combinações de palavras-chave + locais | MapsGrab",
          "description": "Gere combinações de palavras-chave e locais em massa para SEO local e tarefas de extração de mapas. Cole duas listas, obtenha todas as combinações e baixe como CSV. Livre."
        },
        "hero": {
          "title": {
            "lead": "Palavras-chave em massa ",
            "accent": "Gerador",
            "tail": ""
          },
          "description": "Cole suas palavras-chave e seus locais e obtenha cada combinação de “palavra-chave + local” como uma lista pronta para colar ou CSV – a maneira mais rápida de semear uma campanha de pesquisa local."
        },
        "form": {
          "keywordsLabel": "Palavras-chave (uma por linha)",
          "keywordsPlaceholder": "agência de design\ncafeteria\nencanador",
          "locationsLabel": "Locais (um por linha)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Ordem de combinação",
          "keywordFirst": "palavra-chave + localização (agência de design New York)",
          "locationFirst": "localização + palavra-chave (New York agência de design)",
          "submit": "Gerar combinações",
          "resultCount": "{count} combinações geradas.",
          "errorKeywords": "Adicione pelo menos uma palavra-chave.",
          "errorLocations": "Adicione pelo menos um local."
        },
        "howTo": [
          {
            "heading": "Para que serve a geração de palavras-chave em massa?",
            "body": "As campanhas de pesquisa local baseiam-se em combinações: o mesmo serviço repetido em cada cidade, distrito ou bairro que você atende. Dez palavras-chave em dez locais equivalem a cem frases de pesquisa - \"agência de design New York\", \"agência de design Chicago\" e assim por diante. Escrever à mão é propenso a erros; gerá-los a partir de duas listas leva segundos e garante que nada será perdido."
          },
          {
            "heading": "Como gerar combinações",
            "body": "Cole suas palavras-chave na primeira caixa – uma por linha – e suas localizações na segunda. Escolha se a palavra-chave ou o local vem primeiro e pressione “Gerar”. Cada palavra-chave é emparelhada com cada local, linhas em branco e duplicatas são removidas e a lista completa aparece abaixo com uma contagem. Copie-o diretamente para Google listas de palavras-chave de anúncios, Google verificações de tendências ou uma fila de tarefas de extração de mapas."
          },
          {
            "heading": "Da lista de palavras-chave aos dados coletados",
            "body": "A próxima etapa clássica é executar cada combinação como uma pesquisa Google Maps e coletar os resultados. Esse loop é exatamente o que MapsGrab automatiza: a extensão aceita uma lista de palavras-chave como uma tarefa em lote, percorre as pesquisas uma por uma e exporta todos os negócios que encontra – para que as combinações que você gera aqui se tornem linhas estruturadas sem cópia manual."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "Quantas combinações posso gerar?",
              "answer": "Tantas quantas o seu navegador puder conter – a ferramenta multiplica as duas listas e as desduplica localmente. Dez mil combinações estão bem; para lotes muito grandes, o download de CSV é mais prático do que copiar a área de texto."
            },
            {
              "question": "As duplicatas são removidas?",
              "answer": "Sim. As linhas duplicadas em cada lista são eliminadas antes do emparelhamento, e a saída contém cada par de localização de palavra-chave exatamente uma vez, na ordem que você escolheu."
            },
            {
              "question": "Qual ordem devo usar?",
              "answer": "Ambos são comportamentos de pesquisa reais. “Plumber Austin” parece como as pessoas digitam no Maps; “Encanador de Austin” parece uma frase tradicional de SEO. Gerar ambos os pedidos é uma forma comum de cobrir variantes de pesquisa."
            },
            {
              "question": "Posso usar distritos ou códigos postais da cidade como locais?",
              "answer": "Sim - qualquer coisa que faça sentido como sufixo de pesquisa do Maps funciona: distritos, códigos postais, áreas metropolitanas ou pares completos de \"cidade, estado\". Uma linha por local."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Transforme a lista de palavras-chave em ",
            "accent": "resultados",
            "tail": ""
          },
          "lead": "MapsGrab tarefas em lote executam cada palavra-chave como uma pesquisa no Maps e exportam as empresas por trás delas - CSV ou JSON, com comentários, fotos e enriquecimento de contato."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Mesclar arquivos CSV online — Combine vários arquivos CSV grátis | MapsGrab",
          "description": "Mesclar vários arquivos CSV online em um arquivo. Os cabeçalhos das colunas são alinhados automaticamente por união – gratuito, privado e totalmente baseado em navegador."
        },
        "hero": {
          "title": {
            "lead": "Mesclar CSV Arquivos ",
            "accent": "Online",
            "tail": ""
          },
          "description": "Carregue dois ou mais arquivos CSV e baixe um único arquivo mesclado. As colunas são alinhadas por cabeçalho – os campos ausentes ficam vazios. Os arquivos nunca saem do seu navegador."
        },
        "form": {
          "filesLabel": "CSV arquivos",
          "filesHint": "Selecione dois ou mais arquivos .csv. Verifique cada arquivo com rótulos traduzidos na linha 2 para pular essa linha. O CSV mesclado mantém uma linha de cabeçalho de nome de campo. Os arquivos permanecem no seu navegador.",
          "translationRow": "Pular linha 2 (rótulos traduzidos) em {name}",
          "submit": "Mesclar arquivos",
          "errorNoFiles": "Selecione pelo menos dois arquivos CSV para mesclar.",
          "errorEmptyFile": "Um dos arquivos está vazio ou não possui linha de cabeçalho: {name}",
          "fileSummary": "{name} — {rows} linhas de dados",
          "resultSummary": "Arquivos {files} mesclados em {rows} linhas × {columns} colunas.",
          "previewLabel": "Visualização CSV mesclada"
        },
        "howTo": [
          {
            "heading": "O que a fusão faz aqui?",
            "body": "A mesclagem de pilhas de várias exportações CSV em uma tabela: as colunas são alinhadas pelo nome do cabeçalho em todos os arquivos e cada linha de dados mantém seus valores sob o cabeçalho correspondente. Os arquivos são combinados de cima para baixo na ordem em que você os selecionou, de modo que o resultado seja lido como um conjunto de dados contínuo. Colunas que existem apenas em alguns arquivos permanecem na saída; linhas de arquivos sem elas obtêm células vazias – uma união de todos os cabeçalhos."
          },
          {
            "heading": "Como mesclar arquivos CSV",
            "body": "Selecione dois ou mais arquivos .csv — por exemplo, as exportações semanais de um fluxo de trabalho de extração de mapas. Pressione “Mesclar arquivos” e a ferramenta analisa cada arquivo em seu navegador, relata a contagem de linhas de cada um e cria a tabela mesclada. Baixe-o como um único CSV que abre de forma limpa no Excel, Google Planilhas ou qualquer importação de banco de dados."
          },
          {
            "heading": "Construído para coleta de dados em múltiplas execuções",
            "body": "O caso de uso típico é anexar execuções: cada sessão de extração MapsGrab exporta seu próprio CSV, e a fusão reúne as sessões da semana em um conjunto de dados antes da desduplicação e limpeza. O analisador lida com campos entre aspas, vírgulas incorporadas e novas linhas dentro das células (RFC 4180), portanto, as exportações com endereços de várias linhas ou trechos de revisão são mescladas corretamente."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Perguntas frequentes",
            "tail": ""
          },
          "items": [
            {
              "question": "O que acontece quando os arquivos têm colunas diferentes?",
              "answer": "O arquivo mesclado contém a união de todos os cabeçalhos na ordem em que aparecem pela primeira vez. As linhas de arquivos que não possuem uma coluna recebem uma célula vazia nessa coluna. Nada é descartado ou renomeado."
            },
            {
              "question": "Meus arquivos são enviados para um servidor?",
              "answer": "Não. Os arquivos são lidos com o FileReader API do navegador e mesclados na memória da sua aba. Nada é transmitido e fechar a página apaga tudo."
            },
            {
              "question": "A mesclagem remove linhas duplicadas?",
              "answer": "Não – a fusão é uma concatenação direta com colunas alinhadas. A desduplicação (por exemplo, por Place ID) é uma etapa de limpeza separada executada no arquivo mesclado."
            },
            {
              "question": "Qual o tamanho dos arquivos?",
              "answer": "O limite é a memória da guia do seu navegador, não um número fixo. Para exportações típicas de dados empresariais — de milhares a algumas centenas de milhares de linhas — a fusão é instantânea. Para arquivos muito grandes, mescle em lotes."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Uma exportação por execução — ou ",
            "accent": "um conjunto de dados",
            "tail": ""
          },
          "lead": "MapsGrab exporta CSV/JSON limpo por sessão com seleção de campo e desduplicação Place ID, de modo que os conjuntos de dados de múltiplas execuções já começam quase mesclados."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Empresa",
  "about": {
    "navLabel": "Sobre",
    "seoTitle": "Sobre MapsGrab | Produto e Limites",
    "seoDescription": "MapsGrab é um kit de ferramentas de dados de mapas para dados de negócios públicos: uma extensão de navegador, um extrator on-line em nuvem, servidores API e MCP e ferramentas da web gratuitas. Saiba onde está o limite dos dados.",
    "hero": {
      "eyebrow": "Sobre MapsGrab",
      "title": {
        "lead": "Dados de mapas, obtidos da maneira ",
        "accent": "simples",
        "tail": ""
      },
      "intro": "MapsGrab cria ferramentas que coletam informações comerciais disponíveis publicamente de Google Maps e as transformam em dados limpos e estruturados - uma extensão de navegador para Edge e Firefox, um extrator online baseado em nuvem, servidor API e MCP, além de ferramentas da web gratuitas que são executadas inteiramente em seu navegador.",
      "contactLabel": "Contate o suporte",
      "extensionLabel": "Explore a extensão",
      "stageLabel": "Acesso antecipado",
      "updatedLabel": "Publicado e revisado",
      "updatedAt": "Agosto 31, 2026",
      "chips": [
        {
          "label": "Coleta",
          "value": "Apenas dados públicos"
        },
        {
          "label": "Resultados de extensão",
          "value": "No seu navegador"
        },
        {
          "label": "Exportações",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Arraste para girar"
    },
    "build": {
      "kicker": "O que construímos",
      "title": {
        "lead": "Um kit de ferramentas, ",
        "accent": "quatro",
        "tail": " maneiras de entrar"
      },
      "lead": "Escolha a extensão do navegador, o Extrator online baseado em nuvem ou o API. A extensão funciona dentro do seu próprio navegador; o Extrator online e o API compartilham um mecanismo de nuvem, e o servidor MCP traz esse API para os agentes de IA.",
      "hub": {
        "title": "MapsGrab kit de ferramentas de dados",
        "detail": "Dados comerciais · avaliações · fotos · e-mail e enriquecimento social"
      },
      "tags": {
        "extension": [
          "Extração de coluna 36",
          "Críticas e fotos",
          "Tarefas em lote"
        ],
        "online": [
          "Palavras-chave em lote",
          "Enriquecimento de contato",
          "Uma coluna 37 CSV por tarefa"
        ],
        "api": [
          "Dados comerciais",
          "Avaliações",
          "Estruturado JSON"
        ],
        "mcp": [
          "Três ferramentas",
          "Streamable HTTP",
          "Tecla OAuth ou API"
        ]
      },
      "toolsLead": "Além de ferramentas web gratuitas.",
      "toolsText": "As ferramentas gratuitas da web neste site lidam com pequenos trabalhos – colocar IDs, revisar links, coordenar conversões, mesclagem CSV – sem instalar nada.",
      "toolsLabel": "Ferramentas web gratuitas"
    },
    "principles": {
      "kicker": "Princípios",
      "title": {
        "lead": "Onde está o ",
        "accent": "limite",
        "tail": ""
      },
      "lead": "MapsGrab é deliberadamente conservador em relação aos dados. Estas são as regras do produto que seguimos.",
      "publicData": {
        "title": "Apenas dados públicos",
        "text": "Apenas informações comerciais disponíveis publicamente – o que qualquer visitante da página já pode ver.",
        "visibleTag": "Visível para qualquer visitante",
        "privateTag": "Contas privadas"
      },
      "localFirst": {
        "title": "Local primeiro",
        "text": "Com a extensão e as ferramentas web gratuitas, suas configurações e resultados ficam no seu navegador, não em nossos servidores. O Extrator online, os servidores API e MCP são executados em nossa nuvem, e os resultados do Extrator online são salvos em sua conta.",
        "storage": "armazenamento local",
        "rows": [
          "Configurações",
          "Resultados",
          "Tarefas em lote"
        ]
      },
      "backend": {
        "title": "Extensão e ferramentas gratuitas: quatro trabalhos de back-end",
        "text": "Para a extensão e as ferramentas web gratuitas, nosso back-end lida com exatamente quatro coisas: configuração remota, status de conta e cota, enriquecimento opcional de e-mail/social e registros de uso mínimo.",
        "chips": [
          "Configuração",
          "Contingente",
          "Enriquecimento",
          "Registros de uso"
        ]
      },
      "never": {
        "title": "Sem anúncios. Sem rastreadores. Sem vendas de dados.",
        "text": "Sem anúncios, sem rastreadores de terceiros na extensão e sem venda ou aluguel de dados.",
        "chips": [
          "Anúncios",
          "Rastreadores de terceiros",
          "Venda de dados"
        ]
      },
      "inWriting": {
        "kicker": "Por escrito",
        "title": "Política de Privacidade e Termos",
        "text": "Cada uma dessas regras está descrita na Política de Privacidade e nos Termos de Serviço.",
        "link": "Leia a Política de Privacidade"
      }
    },
    "dataFlow": {
      "kicker": "Como os dados se movem",
      "title": {
        "lead": "O que fica com você e o que ",
        "accent": "chega até nós",
        "tail": ""
      },
      "lead": "A extensão funciona em dados exibidos publicamente e mantém os resultados no seu navegador. Para a extensão e as ferramentas web gratuitas, nosso back-end fornece apenas configuração, cotas, enriquecimento opcional e registros de uso mínimo. O Extrator online, os servidores API e MCP são executados em nossa nuvem, e os resultados do Extrator online são salvos em sua conta.",
      "source": {
        "label": "Fonte",
        "title": "Google Maps páginas que você visita",
        "text": "Dados públicos da empresa – nome, endereço, telefone, site, classificação, comentários, fotos."
      },
      "browser": {
        "label": "Seu navegador · local primeiro",
        "storage": "armazenamento local · IndexedDB",
        "rows": [
          "Configurações",
          "Resultados de extração",
          "Estado da tarefa em lote"
        ],
        "badge": "Armazenado em seu navegador"
      },
      "backend": {
        "label": "MapsGrab backend · quatro propósitos",
        "lanes": [
          {
            "title": "Configuração remota",
            "text": "Predefinições de estrutura de página que mantêm a extração funcionando"
          },
          {
            "title": "Conta e cota",
            "text": "Login, status do plano, contabilidade de uso mensal"
          },
          {
            "title": "E-mail e enriquecimento social",
            "text": "Contatos listados publicamente, quando o recurso é usado"
          },
          {
            "title": "Registro de uso",
            "text": "Registros mínimos de uso de recursos e erros"
          }
        ]
      },
      "never": {
        "label": "Nunca",
        "items": [
          "Sem anúncios",
          "Nenhum rastreador de terceiros na extensão",
          "Não é permitido vender ou alugar dados pessoais",
          "Nenhuma coleção do seu histórico de navegação além das Google Maps páginas extraídas"
        ]
      },
      "note": "Este site usa Google Analytics 4 para medir o uso agregado da página – a extensão em si não contém análises.",
      "noteLink": "Leia a Política de Privacidade"
    },
    "status": {
      "kicker": "Status",
      "title": {
        "lead": "Acesso antecipado, ",
        "accent": "grátis",
        "tail": " para começar"
      },
      "access": {
        "title": "Acesso antecipado",
        "text": "O produto está em acesso antecipado. As listagens da loja para Edge Add-ons e Firefox Add-ons estão sendo finalizadas.",
        "link": "Guia de instalação"
      },
      "quota": {
        "title": "Cota mensal gratuita",
        "text": "A extensão funciona sem conta dentro de uma cota mensal gratuita.",
        "link": "O que está incluído"
      },
      "paid": {
        "title": "Planos pagos para uso mais pesado",
        "text": "Planos pagos aumentam os limites para uso mais pesado. Consulte a página de preços para os níveis atuais.",
        "link": "Ver preços"
      }
    }
  },
  "contact": {
    "navLabel": "Contato",
    "seoTitle": "Contato MapsGrab Suporte",
    "seoDescription": "Entre em contato com MapsGrab sobre contas, extensão do navegador, faturamento, ferramentas ou solicitações de privacidade.",
    "eyebrow": "Contato MapsGrab",
    "title": {
      "lead": "Fale com um ",
      "accent": "humano",
      "tail": ""
    },
    "intro": "Escreva para nós e uma pessoa lerá. Atualmente, o suporte é feito diretamente pela equipe que constrói MapsGrab.",
    "emailCardLabel": "E-mail de suporte",
    "copyEmail": "Copiar {email}",
    "emailLabel": "Suporte por e-mail",
    "emailSubject": "MapsGrab solicitação de suporte",
    "responseTimes": "Respondemos ao e-mail de suporte em um dia útil, geralmente mais rápido. As solicitações de privacidade podem levar alguns dias quando precisamos primeiro verificar a propriedade da conta.",
    "include": {
      "title": "O que incluir",
      "text": "Um relatório preciso nos ajuda a identificar o fluxo de trabalho afetado sem solicitar informações confidenciais da conta.",
      "items": [
        "A página URL e a ação que você tentou",
        "Nome e versão do seu navegador",
        "A mensagem de erro exata e uma captura de tela quando útil",
        "Um número de pedido para questões de cobrança, sem detalhes do cartão de pagamento"
      ]
    },
    "topics": {
      "title": "Em que podemos ajudar",
      "items": [
        "Instalação e configuração da extensão do navegador",
        "Problemas de acesso e login à conta",
        "Cotas, assinaturas, renovações e questões de pagamento",
        "Problemas com ferramentas da Web e solicitações de recursos",
        "Solicitações de privacidade e dados da conta"
      ]
    },
    "aboutLabel": "Sobre",
    "privacyLabel": "política de Privacidade",
    "termsLabel": "Termos de Serviço"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Lar",
    "crumbLegal": "Jurídico",
    "switchLabel": "Documentos legais",
    "readTime": "{minutes} minutos de leitura",
    "sectionCount": "{count} seções",
    "tocTitle": "Nesta página",
    "tocLabel": "{title} seções",
    "glanceKicker": "De relance",
    "glanceNote": "Um resumo do texto completo abaixo.",
    "anchorLabel": "Copie o link para “{title}”",
    "copyEmail": "Copiar {email}",
    "contactSupport": "Contate o suporte",
    "nextLabel": "Próximo documento"
  },
  "terms": {
    "navLabel": "Termos",
    "seoTitle": "Termos de Serviço | MapsGrab",
    "seoDescription": "Os Termos de Serviço MapsGrab: uso aceitável, responsabilidade do usuário pelos dados coletados, compras, isenções de responsabilidade e como entrar em contato conosco.",
    "title": "Termos de Serviço",
    "intro": "Estes Termos regem o uso de MapsGrab: a extensão do navegador, este site e as ferramentas gratuitas da web. Por favor, leia-os antes de usar o serviço.",
    "updatedLabel": "Última atualização",
    "updatedAt": "Agosto 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Uso aceitável, responsabilidade do usuário pelos dados coletados, compras, isenções de responsabilidade e como entrar em contato conosco.",
    "helpTitle": "Dúvidas sobre estes Termos?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Apenas dados públicos",
        "text": "O serviço funciona apenas com informações mostradas publicamente nas páginas que você navega."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Seu uso, sua responsabilidade",
        "text": "Você decide o que coletar e como usar — ​​dentro das leis que se aplicam a você."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Nenhuma conta necessária para começar",
        "text": "A extensão funciona sem conta dentro de uma cota mensal gratuita."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Cancele a qualquer momento",
        "text": "As assinaturas são renovadas até serem canceladas; o cancelamento impede futuras renovações."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Aceitação dos termos",
        "paragraphs": [
          "Ao acessar ou usar MapsGrab, você concorda com estes Termos. Se você não concorda com eles, não instale a extensão nem use o site e as ferramentas."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "O que o serviço faz",
        "paragraphs": [
          "MapsGrab ajuda a coletar informações que são exibidas publicamente nas páginas Google Maps que você visita – detalhes comerciais, comentários, fotos e informações de contato relacionadas – e exportá-las. O serviço consiste em uma extensão de navegador para Microsoft Edge e Firefox, este site e ferramentas da web gratuitas que são executadas em seu navegador."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Dados disponíveis publicamente",
        "paragraphs": [
          "O serviço foi projetado para funcionar apenas com informações que são mostradas publicamente nas páginas que você navega. Ele não acessa contas privadas, conteúdo fechado ou dados que exijam acesso especial além do que qualquer visitante pode ver."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Sua responsabilidade",
        "paragraphs": [
          "Você decide o que coletar e como usar, e é responsável por esse uso. Ao usar as informações coletadas, cumpra as leis que se aplicam a você e ao seu propósito.",
          "Em particular, você concorda em não:"
        ],
        "items": [
          "Utilize o serviço para qualquer atividade ilegal ou que viole direitos de terceiros.",
          "Identifique novamente indivíduos ou crie perfis de pessoas privadas a partir de dados comerciais coletados.",
          "Use os detalhes de contato coletados para spam ou mensagens em massa não solicitadas.",
          "Revender dados brutos coletados como um produto de dados concorrente sem um contrato separado conosco.",
          "Interferir, sobrecarregar ou tentar interromper o serviço ou as plataformas com as quais ele trabalha."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Contas e cotas",
        "paragraphs": [
          "A extensão funciona sem conta dentro de uma cota mensal gratuita. Alguns recursos – limites mais altos, compras, integrações na nuvem – exigem uma conta. Você é responsável por manter as credenciais de sua conta seguras e pelas atividades que ocorrem em sua conta."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Compras e assinaturas",
        "paragraphs": [
          "Os planos pagos estão descritos na página Preços. Preços, cotas e períodos de cobrança são mostrados antes da compra, e as compras são feitas por meio dos provedores de pagamento oferecidos na finalização da compra. Os planos de assinatura são renovados automaticamente até serem cancelados e você pode cancelar a qualquer momento; o cancelamento impede futuras renovações."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "O serviço é prestado como está",
        "paragraphs": [
          "O serviço é fornecido “como está” e “conforme disponível”. As plataformas mudam frequentemente e os recursos de coleta podem parar de funcionar parcial ou totalmente a qualquer momento. MapsGrab não oferece garantias, expressas ou implícitas, sobre disponibilidade ininterrupta, integridade dos dados coletados ou adequação a uma finalidade específica.",
          "Poderemos alterar, suspender ou descontinuar qualquer parte do serviço e atualizar estes Termos. Quando as alterações forem materiais, iremos anunciá-las neste site. O uso continuado após as alterações entrarem em vigor significa que você aceita os Termos atualizados."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Limitação de responsabilidade",
        "paragraphs": [
          "Na extensão máxima permitida por lei, MapsGrab e seus operadores não são responsáveis ​​por danos indiretos, incidentais, especiais ou consequenciais - incluindo lucros cessantes ou dados - decorrentes do uso ou incapacidade de usar o serviço."
        ]
      },
      {
        "id": "contact",
        "title": "Contato",
        "paragraphs": [
          "Perguntas sobre estes Termos podem ser enviadas para support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Nota de cobertura",
      "badge": "A definir",
      "lead": "Ainda não coberto:",
      "text": "o Extrator online (execuções na nuvem), o Scraper / Reviews / API de fotos e o servidor MCP. O texto acima descreve a extensão, este site e as ferramentas web gratuitas."
    }
  },
  "privacy": {
    "navLabel": "Privacidade",
    "seoTitle": "Política de Privacidade | MapsGrab",
    "seoDescription": "A Política de Privacidade MapsGrab: quais dados a extensão e o site processam, onde são armazenados, para que serve nosso back-end e os limites que seguimos.",
    "title": "política de Privacidade",
    "intro": "Esta política explica quais dados MapsGrab tratam, onde são armazenados e o que chega aos nossos servidores. A versão resumida: a extensão funciona em dados exibidos publicamente e mantém os resultados em seu navegador; além de nossos serviços em nuvem, nosso back-end apenas permite configuração, cotas, enriquecimento opcional e registros de uso mínimo; e não exibimos anúncios nem rastreadores de terceiros na extensão. As solicitações para nossos serviços em nuvem - o Extrator online, o servidor API e o MCP - são processadas em nossos servidores, e os resultados do Extrator online são vinculados à sua conta para que você possa baixá-los.",
    "updatedLabel": "Última atualização",
    "updatedAt": "Outubro 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Quais dados a extensão e o site processam, onde são armazenados, para que nosso back-end é usado e os limites que seguimos.",
    "helpTitle": "Dúvidas sobre esta política?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Onde os resultados são armazenados",
        "text": "A extensão e as ferramentas web gratuitas mantêm seus dados em seu navegador; Os resultados do Extrator online estão vinculados à sua conta."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "O que chega aos nossos servidores",
        "text": "Solicitações ao Extrator online, servidor API e MCP, além de configuração, conta e cotas, enriquecimento opcional e logs de uso mínimo."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Sem anúncios, sem rastreadores",
        "text": "Nenhum rastreador de terceiros na extensão e nenhuma venda ou aluguel de dados pessoais."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Remoção de dados",
        "text": "A remoção da extensão exclui os dados locais; envie-nos um e-mail para excluir os dados da conta de back-end."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Dados os processos de extensão",
        "paragraphs": [
          "A extensão lida com as seguintes categorias de dados:"
        ],
        "items": [
          "Dados comerciais públicos — informações exibidas nas Google Maps páginas que você visita (nome, endereço, telefone, site, classificação, comentários, fotos, etc.) enquanto você usa os recursos de extração.",
          "Suas configurações — preferências que você configura (formato de exportação, seleção de campo, opções de automação, idioma da interface).",
          "Dados técnicos e de interação — eventos de uso mínimo (contadores de uso de recursos, mensagens de erro) usados ​​para manter a extensão funcionando contra Google alterações de página.",
          "Identificadores de conta que emitimos — um identificador de dispositivo anônimo e, se você fizer login, o e-mail da sua conta e o status do plano ou da cota."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Onde os dados são armazenados",
        "paragraphs": [
          "Com a extensão, as configurações, os resultados da extração e o estado da tarefa em lote são armazenados localmente em seu navegador (extensão de armazenamento local e IndexedDB). Eles nunca saem do seu dispositivo, a menos que você acione uma exportação ou uma das integrações opcionais descritas abaixo. As ferramentas gratuitas da web também processam o que você insere no seu navegador.",
          "Os tokens Google Drive e HubSpot OAuth, se você conectá-los, também são armazenados apenas no seu navegador.",
          "As tarefas do Extrator online são executadas em nossos servidores. Seus resultados são armazenados em sua conta para que você possa baixá-los em seu Painel."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "O que nossos processos de back-end",
        "paragraphs": [
          "As solicitações que você faz aos nossos serviços em nuvem – o Extrator online, os servidores API e MCP – são processadas em nossos servidores. Nossos servidores também gerenciam o acesso a esses serviços, incluindo sua chave API e as autorizações de cliente MCP que você aprova, e mantêm registros de seu uso.",
          "Um cliente MCP que você autoriza recebe os resultados das solicitações que faz. Você pode revogar uma autorização do seu Painel.",
          "Além desses serviços em nuvem, a extensão e este site entram em contato com nossos próprios servidores para quatro finalidades:"
        ],
        "items": [
          "Configuração remota — predefinições de estrutura de página que mantêm a extração funcionando quando Google altera suas páginas.",
          "Serviços de conta e cota — login, status do plano e contabilidade de uso mensal.",
          "Enriquecimento de e-mail e mídia social – pesquisa de detalhes de contato listados publicamente em sites comerciais coletados quando o recurso é usado.",
          "Registro de uso — registros mínimos de uso de recursos e erros usados ​​para manter e melhorar o serviço."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Integrações opcionais Google Drive e HubSpot",
        "paragraphs": [
          "Somente se você conectá-los explicitamente nas configurações, os dados exportados serão carregados para sua própria conta Google Drive ou sincronizados com sua própria conta HubSpot. Essas integrações usam sua autorização, atuam em seu nome e podem ser revogadas a qualquer momento nas configurações da extensão ou na sua conta Google / HubSpot."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Análise do site",
        "paragraphs": [
          "Este site usa Google Analytics 4 (GA4) para medir o uso agregado da página. GA4 é a única análise de terceiros que usamos e é executada apenas neste site – a extensão em si não contém análises."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "O que nunca fazemos",
        "paragraphs": [
          "Esses limites se aplicam à extensão e ao site:"
        ],
        "items": [
          "Sem anúncios.",
          "Nenhum rastreador de terceiros na extensão.",
          "Não é permitido vender ou alugar dados pessoais.",
          "Nenhuma coleção do seu histórico de navegação além das Google Maps páginas das quais você extrai."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Remoção de dados",
        "paragraphs": [
          "A remoção da extensão exclui todos os dados armazenados localmente. Se você deseja que os dados da sua conta de back-end sejam excluídos, entre em contato conosco pelo telefone support@mapsgrab.com e nós os removeremos."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Alterações nesta política",
        "paragraphs": [
          "Atualizamos esta política quando o serviço muda. A data acima reflete a última revisão e alterações materiais serão anunciadas neste site."
        ]
      },
      {
        "id": "contact",
        "title": "Contato",
        "paragraphs": [
          "Perguntas ou solicitações sobre privacidade podem ser enviadas para support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Autorizar um aplicativo de IA | MapsGrab",
  "title": "Conecte um aplicativo de IA à sua conta",
  "intro": "Um aplicativo está solicitando acesso à sua conta MapsGrab. Permita isso apenas se você mesmo iniciou esta conexão.",
  "loading": "Carregando a solicitação de conexão...",
  "hostLabel": "Endereço do aplicativo",
  "selfDeclared": "Nome dado ao aplicativo: {name}",
  "loopbackTitle": "Aplicativo local",
  "loopbackText": "Este aplicativo é executado em um computador, portanto seu endereço não pode mostrar quem o criou. Permita-o apenas se você acabou de iniciar esta conexão a partir de um aplicativo em que confia.",
  "loopbackHost": "Este computador",
  "accountLabel": "Conectado como",
  "switchAccount": "Trocar de conta",
  "permissionsTitle": "Se você permitir, este aplicativo pode",
  "permissions": [
    "Pesquise empresas e leia seus comentários e fotos públicas em Google Maps.",
    "Use o limite de solicitação mensal do seu plano API."
  ],
  "revokeNote": "Você pode desconectá-lo a qualquer momento em Aplicativos conectados no gerenciamento API.",
  "approve": "Permitir",
  "deny": "Negue e retorne para {host}",
  "denyLoopback": "Negar e retornar ao aplicativo",
  "redirecting": "Voltando ao aplicativo...",
  "invalidTitle": "Esta solicitação de conexão é inválida ou expirou",
  "invalidText": "Volte para o seu aplicativo AI e comece a se conectar novamente.",
  "errorTitle": "Esta solicitação de conexão não pode ser concluída",
  "errorReasons": {
    "rate_limited": "Muitas tentativas de conexão vieram da sua rede. Aguarde alguns minutos antes de tentar novamente.",
    "invalid_client": "O aplicativo não está registrado ou seu registro está incompleto.",
    "invalid_redirect_uri": "O endereço de retorno enviado pelo aplicativo não corresponde ao cadastrado.",
    "unsupported_response_type": "O aplicativo solicitou um tipo de autorização que não é compatível.",
    "invalid_pkce": "O aplicativo não enviou a verificação de segurança necessária (PKCE com S256).",
    "invalid_resource": "O aplicativo não solicitou acesso ao servidor MapsGrab MCP ou solicitou um servidor diferente.",
    "server_error": "MapsGrab não foi possível salvar esta solicitação no momento. Por favor, tente novamente em breve."
  },
  "errorHint": "Inicie a conexão novamente no seu aplicativo AI. Se o problema persistir, entre em contato com o desenvolvedor do aplicativo.",
  "signInTitle": "Faça login para continuar",
  "signInText": "Faça login na conta MapsGrab que deseja conectar. Este pedido irá esperar por você.",
  "signIn": "Entrar",
  "loadFailed": "Não foi possível carregar a solicitação de conexão. Verifique sua rede e tente novamente.",
  "decideFailed": "Não foi possível concluir esta ação. Verifique sua rede e tente novamente.",
  "retry": "Tente novamente"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Pagamento enviado",
      "description": "Estamos confirmando seu pagamento. A guia original será atualizada automaticamente."
    },
    "confirmedCredits": {
      "title": "Créditos adicionados",
      "description": "Seu pagamento ClinkBill foi confirmado e os créditos foram adicionados. Você pode retornar à guia original."
    },
    "confirmedSubscription": {
      "title": "Plano ativado",
      "description": "Seu pagamento ClinkBill está confirmado e seu plano MapsGrab está ativo. Você pode retornar à guia original."
    },
    "failed": {
      "title": "Pagamento precisa de atenção",
      "description": "Não foi possível confirmar este pedido. Volte para a guia original e tente novamente."
    }
  },
  "cancel": {
    "title": "Pagamento cancelado",
    "description": "Nenhum pagamento foi concluído. Você pode devolver e escolher outra forma de pagamento."
  }
}
