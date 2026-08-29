import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { ptBRPricingContent } from '../pricing'

export const ptBR: SiteContent = {
  site: {
    name: 'Download de vídeos do Telegram | TG Downloader',
    description:
      'Use o TG Downloader para download de vídeos do Telegram no Telegram Web, salve arquivos e mídias carregadas e siga com a extensão em cada canal privado do Telegram.',
    keywords:
      'download de vídeos do Telegram, download de mídia do Telegram, salvar vídeos do Telegram, download de arquivos do Telegram, canal privado do Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Baixador',
      home: 'Início',
      pricing: 'Preços',
      solutions: 'Solução',
      changelog: 'Alterações'
    },
    footer: {
      resources: 'Recursos',
      rights: '© 2026 TG Downloader. Todos os direitos reservados.'
    }
  },
  common: {
    installCta: 'Instalar Agora'
  },
  sections: {
    features: {
      title: 'Recursos de download de mídia do Telegram',
      subtitle:
        'Esses recursos de download de mídia do Telegram cobrem arquivos, imagens, vídeos, lotes grandes e conteúdo já carregado no Telegram Web.',
      metaDescription:
        'Recursos do TG Downloader: download em lote de vários arquivos, suporte a canais privados, download de arquivos grandes de 1GB+, detecção de mídia em tempo real e design focado na privacidade sem necessidade de login.',
      items: [
        {
          title: 'Download em Lote',
          description:
            'Suporta download em lote com seleção múltipla, baixe todos os arquivos de mídia de um canal ou grupo com um clique',
          details: [
            'Suporte a download em lote com seleção múltipla',
            'Baixe canal/grupo inteiro com um clique',
            'Filtragem inteligente por tipo de arquivo',
            'Gerenciamento de fila de download'
          ]
        },
        {
          title: 'Conteúdo Restrito',
          description: 'Baixe mídia de canais restritos e grupos privados mesmo sem permissão',
          details: [
            'Acesso a conteúdo de canais restritos',
            'Download de grupos privados',
            'Sem verificação de permissão necessária',
            'Funciona com versões A/K'
          ]
        },
        {
          title: 'Suporte Multi-Formato',
          description: 'Suporta imagens, vídeos, GIFs, áudio e outros formatos de mídia',
          details: [
            'Imagens: JPG, PNG, WEBP, GIF',
            'Vídeos: MP4, WEBM, MOV',
            'Arquivos de áudio: MP3, M4A, OGG',
            'Detecção automática de formato'
          ]
        },
        {
          title: 'Seguro e Protegido',
          description: 'Não requer senha ou login de API, nenhum dado de usuário coletado',
          details: [
            'Não requer senha ou login de API',
            'Nenhum dado de usuário coletado',
            'Sem vírus ou anúncios',
            'Testes de segurança rigorosos'
          ]
        },
        {
          title: 'Suporte a Arquivos Grandes',
          description: 'Download estável de arquivos de mais de 1GB com suporte de retomada',
          details: [
            'Download estável de arquivos acima de 1GB',
            'Suporte de retomada para downloads interrompidos',
            'Transferência rápida e estável',
            'Acompanhamento de progresso'
          ]
        },
        {
          title: 'Detecção em Tempo Real',
          description:
            'Escaneia e detecta automaticamente recursos de mídia, atualiza lista de downloads em tempo real',
          details: [
            'Varredura automática de recursos de mídia da página',
            'Detecção de recursos em tempo real',
            'Atualizações automáticas da lista',
            'Cache inteligente de recursos'
          ]
        }
      ]
    },
    steps: {
      title: 'Guia para salvar vídeos do Telegram',
      subtitle:
        'Siga este guia para salvar vídeos do Telegram, abra a mensagem no Telegram Web e preserve vídeos ou outras mídias com poucos passos.',
      metaDescription:
        'Guia passo a passo para salvar vídeos, arquivos e álbuns do Telegram com o TG Downloader. Aprenda a instalar a extensão, detectar mídia no Telegram Web e baixar conteúdo em lote.',
      items: [
        {
          title: 'Instalar Extensão',
          description:
            'Pesquise e instale TG Downloader na sua loja de extensões de navegador'
        },
        {
          title: 'Fixar Extensão',
          description:
            'Clique na barra de ferramentas do navegador para fixar o ícone da extensão para acesso rápido'
        },
        {
          title: 'Abrir Telegram Web',
          description:
            'Visite web.telegram.org, a extensão começará automaticamente a escanear recursos de mídia'
        },
        {
          title: 'Download em Lote',
          description:
            'Selecione os arquivos para baixar e clique no botão de download para salvá-los localmente'
        }
      ]
    },
    cta: {
      title: 'Pronto Para Começar?',
      description: 'Instale a extensão e comece a baixar mídia do Telegram agora.'
    },
    techSpecs: {
      title: 'Especificações Técnicas',
      browsersLabel: 'Navegadores',
      browsers: 'Chrome, Edge, Brave e todos os navegadores baseados em Chromium',
      telegramVersionsLabel: 'Versões do Telegram',
      telegramVersions: 'Versão Web K e versão A',
      permissionsLabel: 'Permissões',
      permissions: 'Permissões mínimas necessárias',
      updatesLabel: 'Atualizações',
      updates: 'Atualizações automáticas da loja de extensões'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Baixar Mídia do Telegram de Canais Privados e Restritos',
        description:
          'Um clique, sem login, suporte a arquivos de 1GB+. Download em lote de canais privados e conteúdo restrito.'
      },
      stats: {
        users: 'Usuários em Todo o Mundo',
        downloads: 'Downloads Totais'
      },
      seo: {
        title: 'Telegram Private Video Downloader: Baixe Qualquer Mídia Privada',
        description:
          'Salve vídeos de canais privados do Telegram com um guia de download fácil. Baixe vídeos e mídias acessíveis, resolva downloads que falharam e encontre o método certo para o seu dispositivo.',
        keywords:
          'telegram private video downloader, baixar vídeo privado do telegram, download de vídeo de canal privado do telegram, baixador de mídia privada do telegram'
      },
      heroTrustPoints: [
        'Download de vídeo em HD',
        'Sem cadastro',
        'Compatível com celular',
        'Funciona em Windows, Mac, Android e iPhone'
      ],
      situation: {
        title: 'Comece Aqui: Qual Situação Combina com a Sua?',
        intro:
          'A maioria das pessoas que procuram um baixador de vídeos privados do Telegram está tentando resolver um destes problemas:',
        headers: ['Sua situação', 'Tente isto primeiro'],
        rows: [
          {
            cells: [
              'Você tem um link de vídeo do Telegram de um canal ou conversa',
              'Cole o link em um baixador de vídeos do Telegram online'
            ]
          },
          {
            cells: [
              'Você consegue assistir ao vídeo em um canal privado, mas não consegue salvá-lo',
              'Tente a opção Save Video As do Telegram Desktop'
            ]
          },
          {
            cells: [
              'O vídeo reproduz, mas o download e o encaminhamento estão bloqueados',
              'Use gravação de tela apenas se você tiver permissão para guardar uma cópia'
            ]
          },
          {
            cells: [
              'O baixador diz que nenhum vídeo foi encontrado',
              'Verifique o acesso, o tipo de link, as restrições do canal e se o vídeo abre fora do Telegram'
            ]
          }
        ]
      },
      solutions: {
        title: 'O Que Funciona para Vídeos Privados do Telegram?',
        intro:
          'Um vídeo privado do Telegram normalmente é um vídeo compartilhado em um canal privado, grupo privado ou conversa direta. Esses vídeos ficam visíveis apenas para membros aprovados, então baixá-los é diferente de salvar mídia de um canal público.',
        quickAnswer:
          'Resposta rápida: se o link estiver acessível, use um baixador de vídeos privados do Telegram online. Se o vídeo só estiver visível dentro do Telegram, tente o Telegram Desktop. Se o salvamento estiver bloqueado, mas você tiver permissão para guardar o conteúdo, a gravação de tela pode ser a alternativa prática.',
        items: [
          {
            title: 'Solução 1: Baixador de Vídeos do Telegram Online',
            description:
              'Melhor para links acessíveis do Telegram. É o método mais simples para quem quer baixar vídeos do Telegram online sem instalar um app, uma extensão ou um bot.',
            useWhenLabel: 'Use este método quando:',
            useWhen: [
              'O link do vídeo do Telegram é público ou acessível.',
              'Você quer baixar vídeos do Telegram online.',
              'Você precisa de um arquivo de vídeo em HD rapidamente.',
              'Você não quer instalar uma extensão de navegador ou um app de desktop.'
            ]
          },
          {
            title: 'Solução 2: Save Video As do Telegram Desktop',
            description:
              'Quando o vídeo está disponível no Telegram Desktop e os downloads são permitidos, clique com o botão direito no vídeo e salve-o em uma pasta do seu computador. Isso costuma funcionar melhor para membros de canais privados, porque você já está autenticado dentro do Telegram.',
            useWhenLabel: 'Use este método quando:',
            useWhen: [
              'Você consegue ver o vídeo no Telegram Desktop.',
              'O dono do canal não desativou o salvamento.',
              'Você prefere baixar diretamente para o Windows ou o Mac.'
            ]
          },
          {
            title: 'Solução 3: Gravação de Tela no Celular ou Computador',
            description:
              'Se a opção de download estiver desativada, mas você tiver permissão para ver e guardar o conteúdo, um gravador de tela pode capturar o vídeo e o áudio enquanto ele reproduz. É uma alternativa, não o primeiro método, porque leva mais tempo e depende da qualidade da reprodução.',
            useWhenLabel: 'Use este método quando:',
            useWhen: [
              'Você tem permissão para ver e guardar o vídeo.',
              'O link do Telegram não pode ser analisado por um baixador.',
              'Você precisa de uma cópia offline pessoal para referência.'
            ]
          },
          {
            title: 'Solução 4: Verificar no Gerenciador de Arquivos do Android',
            description:
              'Em alguns casos no Android, o Telegram pode armazenar temporariamente a mídia carregada em pastas locais do app. Um gerenciador de arquivos às vezes ajuda a encontrar vídeos que já foram carregados no dispositivo, mas isso depende da versão do app, das permissões de armazenamento e do comportamento do cache.',
            useWhenLabel: 'Use este método quando:',
            useWhen: [
              'Você já reproduziu o vídeo no Telegram no Android.',
              'Você entende as permissões de armazenamento do app.',
              'Você só precisa recuperar um arquivo que já está no cache do seu dispositivo.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Por Que Usar um Baixador de Vídeos do Telegram Online?',
        intro:
          'Um bom baixador deve ajudar você a responder uma pergunta rapidamente: este vídeo do Telegram pode ser salvo a partir do link que eu tenho? A melhor experiência é direta, clara e honesta quando um link privado não pode ser processado.',
        items: [
          {
            title: 'Salve Vídeos em Alta Qualidade',
            description:
              'Mantenha os vídeos do Telegram na melhor qualidade disponível para reprodução offline, estudo, treinamento, arquivamento ou referência pessoal.'
          },
          {
            title: 'Funciona em Vários Dispositivos',
            description:
              'Use o baixador a partir de um navegador no Android, iPhone, Windows, Mac ou tablet. Isso importa quando o vídeo está no seu celular, mas você quer salvá-lo em outro dispositivo.'
          },
          {
            title: 'Não Exige Login no Telegram',
            description:
              'Escolha ferramentas que processam um link de vídeo sem pedir sua senha do Telegram, código de verificação, arquivo de sessão ou credenciais da conta privada.'
          },
          {
            title: 'Reprodução Offline Fácil',
            description:
              'Baixe arquivos em formatos de vídeo comuns quando disponíveis, para assistir depois sem abrir o Telegram nem usar dados móveis.'
          },
          {
            title: 'Processo Rápido Baseado em Link',
            description:
              'Copie, cole, analise e baixe. Se o link falhar, a página deve explicar o motivo e dizer o que tentar em seguida.'
          },
          {
            title: 'Limite Claro de Permissão',
            description:
              'Baixe apenas vídeos que você tem o direito de acessar e salvar. Respeite as regras do canal, os direitos dos criadores e as políticas do Telegram.'
          },
          {
            title: 'Baixar Stories do Telegram pelo Link',
            description:
              'Cole o link de um Story acessível para salvar a foto ou o vídeo. Se ele só aparecer na sua sessão do Telegram Web, abra-o lá e use a extensão.'
          }
        ]
      },
      troubleshooting: {
        title: 'Se o Link do Vídeo do Telegram Não Funcionar',
        intro:
          'Nem todo link com falha significa que o baixador está com problema. Vídeos privados do Telegram costumam falhar porque o arquivo não está disponível fora do Telegram. Tente esta lista de verificação:',
        items: [
          'Abra o link em um navegador e confirme se ele carrega.',
          'Verifique se você ainda é membro do canal ou grupo privado.',
          'Confira se o dono do canal desativou o salvamento, a cópia ou o encaminhamento.',
          'Tente o Telegram Desktop se o vídeo só reproduzir dentro do app.',
          'Use outro navegador ou rede se a página não conseguir acessar o Telegram.',
          'Evite qualquer ferramenta que peça o seu código de login do Telegram.'
        ]
      },
      permission: {
        title: 'Aviso Importante sobre Permissão',
        note:
          'Um baixador de vídeos privados do Telegram não deve ser usado para burlar privacidade, direitos autorais ou restrições de acesso. Salve vídeos apenas quando você tiver permissão do dono ou quando o seu uso for permitido pela lei e pelos termos do Telegram.'
      },
      comparison: {
        title: 'Escolha o Método Certo de Download do Telegram',
        headers: ['Situação', 'Solução recomendada', 'Melhor para', 'O que verificar'],
        rows: [
          {
            cells: [
              'Link de vídeo do Telegram público ou acessível',
              'Baixador de vídeos do Telegram online',
              'Download rápido em HD sem app',
              'O link abre e a ferramenta consegue acessar o vídeo'
            ]
          },
          {
            cells: [
              'Vídeo de canal privado com download permitido',
              'Save Video As do Telegram Desktop',
              'Salvar diretamente no computador',
              'Você é membro e o dono não desativou o salvamento'
            ]
          },
          {
            cells: [
              'Salvamento restrito, mas reprodução visível',
              'Gravador de tela nativo ou de terceiros',
              'Referência offline pessoal com permissão',
              'Captura de áudio, área da tela e leis locais ou regras da plataforma'
            ]
          },
          {
            cells: [
              'Mídia em cache no Android',
              'Verificar no gerenciador de arquivos',
              'Encontrar mídia já carregada no dispositivo',
              'Acesso ao armazenamento do app e se o Telegram mantém um cache local'
            ]
          }
        ]
      },
      howTo: {
        title: 'Como Baixar Vídeos do Telegram em 3 Passos',
        subtitle:
          'O caminho mais rápido é um baixador de vídeos do Telegram baseado em link. Ele funciona melhor quando o link do vídeo do Telegram é público, acessível ou legível fora do app do Telegram.',
        steps: [
          {
            title: 'Copie o Link do Vídeo',
            description:
              'Abra o Telegram, encontre o vídeo que você quer salvar e copie o link da mensagem ou do vídeo no menu de compartilhamento. Se o canal não permitir copiar links, vá para as soluções de canal privado abaixo.'
          },
          {
            title: 'Cole e Analise',
            description:
              'Cole o link do Telegram no campo do baixador. A ferramenta verifica se é possível acessar um arquivo de vídeo para download a partir desse link.'
          },
          {
            title: 'Baixe em HD',
            description:
              'Escolha a qualidade ou o formato disponível e salve o vídeo do Telegram diretamente no seu celular, tablet ou computador. Se nenhum arquivo aparecer, o link provavelmente está restrito, e não com defeito.'
          }
        ]
      },
      faq: {
        title: 'Perguntas Frequentes',
        description:
          'As perguntas que as pessoas fazem antes de um download de vídeo do Telegram ou download de arquivo do Telegram no Telegram Web.',
        items: [
          {
            question: 'Posso baixar vídeos privados do Telegram?',
            answer:
              'Você só pode baixar ou salvar vídeos privados do Telegram quando tem permissão para acessá-los e a origem do vídeo está disponível. Alguns canais privados bloqueiam o salvamento, o encaminhamento, a cópia de links ou o acesso externo.'
          },
          {
            question: 'Como baixar vídeos de canais privados do Telegram?',
            answer:
              'Primeiro tente o baixador baseado em link se você tiver um link de vídeo do Telegram utilizável. Se não funcionar, verifique a opção Save Video As no Telegram Desktop. Se os downloads estiverem bloqueados, mas você tiver permissão para guardar o conteúdo, a gravação de tela pode ser a alternativa.'
          },
          {
            question: 'Por que o baixador de vídeos do Telegram diz que nenhum vídeo foi encontrado?',
            answer:
              'O link pode estar restrito, excluído, expirado, visível apenas dentro do Telegram ou bloqueado pelo dono do canal. Abra o link você mesmo primeiro e confirme se o vídeo ainda reproduz. Se ele só funcionar depois de você fazer login no Telegram, um baixador online pode não conseguir acessá-lo.'
          },
          {
            question: 'Preciso instalar algum software?',
            answer:
              'Não para links acessíveis. Um baixador de vídeos do Telegram online funciona em um navegador. Você pode precisar do Telegram Desktop, de um gerenciador de arquivos ou de um gravador de tela em casos privados ou restritos específicos.'
          },
          {
            question: 'Posso baixar vídeos do Telegram sem um link?',
            answer:
              'Geralmente não. Os baixadores online precisam de um link de vídeo do Telegram para localizar o arquivo. Se você não conseguir copiar um link, mas conseguir assistir ao vídeo no Telegram, use o Telegram Desktop ou outro método local permitido.'
          },
          {
            question: 'É seguro digitar meu código de login do Telegram em um baixador?',
            answer:
              'Não. Um baixador não deve precisar da sua senha do Telegram, código de verificação ou credenciais de sessão. Se um site pedir esses dados, saia da página.'
          },
          {
            question: 'Um baixador de mídia do Telegram é gratuito?',
            answer:
              'Muitos baixadores de mídia do Telegram baseados em link são gratuitos para downloads básicos. Evite ferramentas que forçam instalações suspeitas, pedidos de login ou botões enganosos.'
          },
          {
            question: 'É legal baixar vídeos do Telegram?',
            answer:
              'Depende do conteúdo, da sua permissão e do uso pretendido. Não baixe nem redistribua conteúdo protegido por direitos autorais, privado ou restrito sem autorização.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Acesso web',
          title: 'Entre para sincronizar seus créditos',
          signedInAs: 'Sessão iniciada como',
          continueWithGoogle: 'Continuar com Google',
          googleLoading: 'Abrindo o Google...',
          or: 'ou',
          emailLabel: 'E-mail',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Continuar com e-mail',
          sendCode: 'Enviar código',
          sendingCode: 'Enviando...',
          sendCodeSuccess: 'Código de verificação enviado.',
          sendAgain: 'Enviar novamente',
          codeLabel: 'Código de verificação',
          codePlaceholder: '123456',
          signIn: 'Entrar',
          termsNotice: 'Ao entrar, você aceita os',
          termsLink: 'Termos',
          privacyLink: 'Política de Privacidade',
          logout: 'Sair',
          creditsLabel: 'créditos'
        },
        quota: {
          eyebrow: 'Cota da web',
          title: 'Saldo atual de créditos',
          planLabel: 'Plano',
          remainingLabel: 'Restante',
          dailyLimitLabel: 'Limite diário',
          unlimited: 'Ilimitado'
        },
        checkin: {
          creditsLoading: 'Créditos',
          creditsButtonLabel: 'Abrir check-in diário',
          accountButtonLabel: 'Abrir menu da conta',
          accountMenuLabel: 'Menu da conta',
          title: 'Seus créditos grátis de hoje estão prontos',
          todayRewardText: 'Recompensa de hoje: {credits} créditos',
          claimedRewardText: 'Você recebeu {credits} créditos hoje.',
          nextCountdown: 'Próximo resgate em {time}',
          nextAt: '(Próxima atualização: {time} EST)',
          claimButton: 'Receber {credits} créditos',
          claimingButton: 'Recebendo...',
          notNow: 'Agora não',
          close: 'Fechar',
          loadFailed: 'Não foi possível carregar o status do check-in.',
          claimFailed: 'Não foi possível receber os créditos.'
        },
        creditPurchase: {
          title: 'Comprar créditos',
          description: 'Adicione créditos e continue baixando neste workspace.',
          successTitle: 'Créditos adicionados',
          successDescription: 'Seu saldo foi atualizado. Feche esta janela e inicie o download novamente.',
          packageEyebrow: 'Pague conforme usar',
          cardNote: 'Use créditos para downloads no site. Créditos não expiram.',
          creditsAmount: '{credits} créditos',
          buyNow: 'Comprar agora',
          selectPackage: 'Selecionar',
          paymentMethodLabel: 'Escolha o método de pagamento',
          paymentTitle: 'Escolha o método de pagamento',
          selectedPackageLabel: 'Produto selecionado',
          confirmPurchase: 'Continuar para pagamento',
          backToProducts: 'Voltar',
          close: 'Fechar',
          agreementText: 'Aceito os termos de compra, os Termos e a Política de Privacidade.',
          loadingConfigs: 'Carregando pacotes de créditos...',
          loadFailed: 'Não foi possível carregar os pacotes de créditos. Tente novamente.',
          noConfigs: 'Nenhum pacote de créditos está disponível agora. Tente mais tarde.',
          ready: 'Escolha um pacote de créditos. Os preços são exibidos em USD.',
          creatingOrder: 'Criando pedido...',
          pendingPayment: 'Conclua o pagamento na aba recém-aberta. Verificaremos o resultado automaticamente.',
          pendingPaymentTitle: 'Aguardando pagamento',
          cancelPayment: 'Cancelar pagamento',
          supportMailPrefix: 'Relatar um problema: ',
          success: 'Pagamento concluído. Os créditos já estão disponíveis.',
          failed: 'O pagamento não foi concluído. Você pode tentar novamente ou fechar esta janela.',
          successCredits: '+{credits} créditos adicionados',
          successBalance: 'Saldo atual: {balance} créditos',
          createFailed: 'Não foi possível criar o pedido. Tente novamente.',
          invalidPaymentData: 'O link de pagamento é inválido. Tente mais tarde.',
          priceUpdated: 'O preço mudou. Confira o preço atualizado e compre novamente.',
          gatewayFailed: 'A entrada de pagamento está temporariamente indisponível. Tente mais tarde.',
          paymentCanceled: 'O pagamento foi cancelado. Escolha um método de pagamento e tente novamente.',
          pollFailed: 'Não foi possível atualizar o status do pagamento. Tente novamente.',
          pollTimeout: 'A atualização automática expirou. Atualize o resultado após o pagamento.',
          orderNotFound: 'O pedido não está mais disponível. Crie um novo pedido.',
          orderExpired: 'O pedido expirou. Compre novamente.',
          fulfillmentFailed: 'O pagamento foi recebido, mas os créditos ainda não foram adicionados. Tente mais tarde.',
          authExpired: 'A sessão expirou. Entre novamente para continuar.'
        },
        parse: {
          eyebrow: 'Análise direta',
          title: 'Telegram Private Video Downloader: Baixe Qualquer Mídia Privada',
          helperText:
            'Salve vídeos de canais privados do Telegram com um guia de download fácil. Baixe vídeos e mídias acessíveis, resolva downloads que falharam e encontre o método certo para o seu dispositivo.',
          telegramMessageListLinkError:
            'Este link do Telegram abre um chat ou canal, não uma mensagem específica. Copie o link exato da mensagem e cole aqui.',
          linkLabel: 'Link do Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Limpar entrada',
          submit: 'Cole o Link do Vídeo do Telegram',
          submitting: 'Analisando...',
          noResults: 'Nenhum arquivo disponível para download foi encontrado nesta mensagem.',
          download: 'Baixar',
          downloading: 'Baixando...',
          downloadAll: 'Baixar tudo',
          downloadingAll: 'Baixando tudo...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Tamanho desconhecido',
          play: 'Reproduzir',
          preparingPlayback: 'Preparando a reprodução...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Fechar',
          continuePlayback: 'Continuar a reprodução',
          upgradeToPlay: 'Faça upgrade para reproduzir',
          playQuotaExhausted: 'A cota de reprodução de hoje acabou.',
          playerRestoring: 'Restaurando a reprodução...',
          playerRestoredPaused: 'Pronto. Continue de onde você parou.',
          playerResumeFailed: 'Não foi possível restaurar a sessão de reprodução. Comece novamente.',
          playerRefreshing: 'Atualizando a reprodução...',
          playerRecreating: 'Recriando a sessão de reprodução...',
          playerUnsupported: 'Este navegador não consegue reproduzir este vídeo.',
          playerSessionExpired: 'A sessão de reprodução expirou. Inicie a reprodução novamente.',
          playerFailed: 'A reprodução falhou.',
          playQuotaUnavailable: 'A cota de reprodução está indisponível. Entre e tente novamente.',
          playQuotaReached: 'Cota de reprodução de hoje atingida.',
          playerResourceBusy: 'Este vídeo ainda está sendo preparado. Tente novamente em instantes.',
          resumeNotice:
            'Detectamos um download não finalizado "{filename}" ({progress}). Deseja continuar?',
          resumeAction: 'Continuar',
          pendingRestartText: 'O registro de download anterior de "{filename}" pode ser reiniciado.',
          pendingRestartButton: 'Reiniciar download',
          resumeUnavailableText: 'O registro de recuperação local expirou.',
          resumeDismiss: 'Ignorar',
          resuming: 'Retomando...',
          largeFileExtensionInlineChromeTitle: 'Extensão do Chrome',
          largeFileExtensionInlineChromeDescription:
            'Extensão dedicada para Chrome que captura mídia do Telegram com um clique.',
          largeFileExtensionInlineChromeCta: 'Instalar extensão',
          largeFileExtensionInlineEdgeTitle: 'Extensão do Edge',
          largeFileExtensionInlineEdgeDescription:
            'Extensão dedicada para Microsoft Edge, compatível com downloads de conteúdo do Telegram.',
          largeFileExtensionInlineEdgeCta: 'Instalar extensão'
        },
        errors: {
          enterEmailFirst: 'Digite seu e-mail primeiro.',
          enterEmailAndCode: 'Digite o e-mail e o código de verificação.',
          sendCodeFailed: 'Não foi possível enviar o código de verificação.',
          googleSignInFailed: 'Não foi possível entrar com o Google.',
          googleClientMissing: 'O login com Google não está configurado.',
          restoreSessionFailed: 'Não foi possível restaurar a sessão.',
          signInFailed: 'Não foi possível entrar.',
          logoutFailed: 'Não foi possível sair.',
          loadQuotaFailed: 'Não foi possível carregar os créditos.',
          enterLink: 'Digite um link de mídia.',
          invalidLink: 'Esta não é uma URL válida.',
          parseFailed: 'Não foi possível analisar este link.',
          downloadFailed: 'Não foi possível baixar este arquivo.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'A plataforma deste link não é compatível.',
          tiktokUnsupported: 'Este link do TikTok ainda não pode ser analisado. Use um link público de vídeo único ou de publicação com foto.',
          vimeoParseFailed: 'Este vídeo do Vimeo é privado ou não pode ser analisado.',
          xParseFailed: 'Este link do X não é compatível. Use um status público com vídeo.',
          instagramParseFailed: 'Este link do Instagram não é compatível. Use uma publicação pública.',
          instagramImageParseFailed: 'Este link do Instagram não é compatível. Use uma publicação pública com foto.',
          threadsParseFailed: 'Este link do Threads não é compatível. Use uma publicação pública.',
          redditParseFailed: 'Não foi possível buscar a mídia do Reddit. Use uma publicação pública com vídeo, imagem ou galeria.',
          douyinParseFailed: 'Não foi possível buscar este vídeo do Douyin. Use um link de vídeo público.',
          quotaExceeded: 'Créditos insuficientes para baixar este arquivo.',
          rateLimitExceeded: 'Muitas solicitações. Tente novamente mais tarde.'
        },
        downloadAll: {
          allSuccess: 'Todos os arquivos foram baixados.',
          partialFailed: 'Alguns arquivos foram baixados. Alguns falharam.',
          allFailed: 'Todos os downloads falharam.'
        },
        requiresClient: {
          privateChannel:
            'Não foi possível analisar aqui o conteúdo deste canal privado do Telegram. A extensão gratuita do navegador pode baixar vídeos de qualquer canal privado ao qual você tenha acesso no Telegram Web.\nVocê pode tentar estas opções:\nOpção 1 (recomendada): clique no botão “Baixar extensão grátis” para instalar a extensão do navegador desktop.\nOpção 2:\n1. Volte ao Telegram.\n2. Clique com o botão direito na mensagem que deseja baixar e escolha Forward para encaminhar para um canal ou grupo público.\n3. Abra esse canal ou grupo público.\n4. Clique com o botão direito na mensagem encaminhada, copie o link público dela e cole aqui.',
          privateChannelCta: 'Baixar extensão grátis',
          restrictedFile: 'Este arquivo restrito precisa do TG Downloader dentro do Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'Mais Downloaders de Vídeo',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: "Baixe vídeos do TikTok sem marca d'água em qualidade HD."
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Baixe vídeos e GIFs do X/Twitter em qualidade HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Baixe vídeos do Vimeo em HD com várias opções de resolução.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Baixe vídeos e fotos do Threads em qualidade original.'
          }
        ]
      }
    },
    changelog: {
      title: 'Registro de download de vídeos do Telegram',
      description:
        'Acompanhe cada atualização sobre download de vídeos do Telegram, fluxo web e sessões de salvamento mais longas.',
      seoTitle: 'Registro de download de vídeos do Telegram | TG Downloader',
      seoDescription:
        'Leia este registro de download de vídeos do Telegram para ver mudanças no fluxo web, em arquivos grandes e nas versões recentes.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Melhoria de Desempenho',
          description:
            'Melhorias significativas de desempenho para uma melhor experiência do usuário.',
          features: [
            'Velocidade de detecção de recursos melhorada em 50%',
            'Estabilidade de download de arquivos grandes otimizada',
            'Responsividade da interface aprimorada'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Suporte a Vários Idiomas',
          description: 'Suporte adicionado para 14 idiomas em todo o mundo.',
          features: [
            'Suporte adicionado para japonês, coreano e outros idiomas',
            'Precisão de tradução aprimorada',
            'Detecção automática de idioma adicionada'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Download na Barra Lateral',
          description: 'Novo recurso de download na barra lateral com suporte em lote.',
          features: [
            'Download de arquivo único na barra lateral adicionado',
            'Funcionalidade de download em lote adicionada',
            'Gerenciamento de fila de download aprimorado'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Segurança e Privacidade',
          description: 'Melhorias de segurança e aprimoramentos de privacidade.',
          features: [
            'Todo o rastreamento de análise removido',
            'Modo de processamento local apenas adicionado',
            'Criptografia de dados aprimorada'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Lançamento Inicial',
          description: 'Primeiro lançamento com suporte de download da janela de chat.',
          features: [
            'Funcionalidade de download da janela de chat',
            'Suporte para Telegram Web K e versões A',
            'Suporte básico de formato de mídia'
          ]
        }
      ],
      labels: {
        features: 'Novos Recursos',
        fixes: 'Correções de Bugs'
      }
    } as SiteContent['pages']['changelog'] & {
      seoTitle: string
      seoDescription: string
    },
    pricing: ptBRPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['pt-BR'],
    extensionLoginV2: {
      title: 'Login da extensão | TG Downloader',
      description:
        'Entre no TG Downloader e sincronize sua sessão do site com a extensão do navegador.',
      eyebrow: 'Extensão do navegador',
      heading: 'Entrar no TG Downloader',
      checkingState: 'Verificando sessão',
      signInRequiredState: 'É necessário entrar',
      syncedState: 'Sessão iniciada',
      verificationFailedState: 'Falha na verificação',
      preparingTitle: 'Preparando o login…',
      preparingText: 'O TG Downloader está preparando a verificação da sessão do site.',
      checkingSessionTitle: 'Verificando a sessão do site…',
      checkingSessionText:
        'O TG Downloader está verificando o token do site armazenado neste navegador.',
      finishingGoogleTitle: 'Concluindo o login com o Google…',
      finishingGoogleText:
        'O TG Downloader está trocando o resultado do login com o Google por uma sessão do site.',
      signInRequiredTitle: 'Entre para continuar',
      signInRequiredText: 'Use a mesma janela de login do TG Downloader que usa no site.',
      signInButtonLabel: 'Entrar',
      syncingTitle: 'Sincronizando o token da extensão…',
      syncingText:
        'O TG Downloader está trocando sua sessão do site por um token de extensão.',
      syncedTitle: 'Login realizado com sucesso',
      syncedText:
        'A extensão está conectada à sua conta do TG Downloader. Clique em Voltar para o Telegram para retornar.',
      returnButtonLabel: 'Voltar para o Telegram',
      returningButtonLabel: 'Voltando…',
      verificationFailedTitle: 'Não foi possível concluir o login da extensão',
      retryButtonLabel: 'Tentar novamente',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Baixar Vídeos do TikTok Sem Marca D\'Água - Qualidade HD | TG Downloader',
          description:
            'Baixe vídeos do TikTok sem marca d\'água em qualidade HD gratuitamente. Sem necessidade de instalar app. Salve vídeos, slideshows e stories do TikTok instantaneamente.',
          keywords:
            'baixar tiktok, download tiktok sem marca d\'água, baixar vídeo tiktok hd, salvar vídeo tiktok, tiktok downloader grátis, tiktok sem logo'
        },
        workspace: {
          title: 'Baixar Vídeos do TikTok Sem Marca D\'Água',
          helperText:
            'Cole qualquer link de vídeo do TikTok para baixar sem marca d\'água em qualidade HD. Também suporta links do Telegram, X e Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Por Que Usar Nosso Downloader do TikTok',
          subtitle: 'Salve vídeos do TikTok na mais alta qualidade sem marca d\'água, totalmente grátis.',
          items: [
            {
              title: 'Sem Marca D\'Água',
              description:
                'Baixe vídeos do TikTok sem a sobreposição de marca d\'água. Obtenha vídeos limpos em qualidade original, prontos para salvar ou compartilhar.'
            },
            {
              title: 'Qualidade HD',
              description:
                'Salve vídeos do TikTok na resolução HD original. Sem perda de qualidade, sem compressão — exatamente como o criador enviou.'
            },
            {
              title: 'Rápido e Grátis',
              description:
                'Sem instalar app, sem cadastro, sem taxas ocultas. Cole o link, baixe seu vídeo. Funciona instantaneamente em qualquer navegador.'
            }
          ]
        },
        howTo: {
          title: 'Como Baixar Vídeos do TikTok Sem Marca D\'Água',
          subtitle:
            'Três passos simples para salvar qualquer vídeo do TikTok em qualidade HD sem marca d\'água.',
          steps: [
            {
              title: 'Copie o link do vídeo do TikTok',
              description:
                'Abra o TikTok, toque no botão Compartilhar no vídeo e selecione "Copiar link".'
            },
            {
              title: 'Cole o link acima',
              description:
                'Cole a URL do TikTok copiada no campo de entrada e clique em Analisar.'
            },
            {
              title: 'Baixe sem marca d\'água',
              description:
                'Clique no botão Baixar para salvar o vídeo do TikTok em HD sem nenhuma marca d\'água.'
            }
          ]
        },
        faq: {
          title: 'FAQ do Downloader TikTok',
          items: [
            {
              question: 'Este downloader do TikTok é realmente grátis?',
              answer:
                'Sim, totalmente grátis sem cobranças ocultas. Você pode baixar vídeos do TikTok sem marca d\'água sem nenhum custo.'
            },
            {
              question: 'O vídeo baixado terá marca d\'água?',
              answer:
                'Não. Nosso downloader remove a marca d\'água do TikTok e entrega o vídeo original limpo em qualidade HD.'
            },
            {
              question: 'Qual é a qualidade dos vídeos baixados do TikTok?',
              answer:
                'Os vídeos são salvos na resolução HD original conforme enviados pelo criador, sem perda de qualidade.'
            },
            {
              question: 'Preciso instalar algum app ou extensão?',
              answer:
                'Nenhuma instalação necessária. Esta é uma ferramenta web que funciona diretamente no seu navegador em qualquer dispositivo.'
            },
            {
              question: 'Posso baixar Stories e Slideshows do TikTok?',
              answer:
                'Sim, nosso downloader suporta vídeos, slideshows de fotos e stories do TikTok. Cole o link e baixe.'
            }
          ]
        },
        crossLinks: {
          title: 'Mais Downloaders de Vídeo',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Baixe vídeos e GIFs do X/Twitter em qualidade HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Baixe vídeos do Vimeo em HD com várias opções de resolução.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Baixe vídeos e fotos do Threads em qualidade original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Baixe vídeos do Telegram de canais e grupos em qualidade HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) Video Downloader - Salvar Vídeos e GIFs HD | TG Downloader',
          description:
            'Baixe vídeos e GIFs do X (Twitter) em qualidade HD gratuitamente. Sem necessidade de app. Salve qualquer vídeo ou GIF de tweet público instantaneamente.',
          keywords:
            'baixar vídeo twitter, x downloader, download vídeo x, salvar vídeo twitter, baixar gif twitter, twitter video download'
        },
        workspace: {
          title: 'X (Twitter) Video Downloader',
          helperText:
            'Cole qualquer link de vídeo do X ou Twitter para baixar na mais alta qualidade. Também suporta links do Telegram, TikTok e Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Por Que Usar Nosso Downloader de Vídeo do X',
          subtitle: 'Salve vídeos e GIFs do X/Twitter na qualidade original, totalmente grátis.',
          items: [
            {
              title: 'Vídeos e GIFs',
              description:
                'Baixe tanto posts de vídeo quanto GIFs animados do X (Twitter). Obtenha a mídia exata como aparece no tweet.'
            },
            {
              title: 'Qualidade HD Original',
              description:
                'Salve vídeos do X na maior resolução disponível. Sem degradação de qualidade — o mesmo bitrate da fonte.'
            },
            {
              title: 'Rápido e Grátis',
              description:
                'Sem instalar app, sem login necessário. Cole a URL do tweet, baixe seu vídeo ou GIF em segundos.'
            }
          ]
        },
        howTo: {
          title: 'Como Baixar Vídeos do X (Twitter)',
          subtitle:
            'Três passos simples para salvar qualquer vídeo ou GIF do X/Twitter.',
          steps: [
            {
              title: 'Copie a URL do tweet',
              description:
                'No X (Twitter), clique no ícone Compartilhar no tweet e selecione "Copiar link".'
            },
            {
              title: 'Cole o link acima',
              description:
                'Cole a URL do X/Twitter copiada no campo de entrada e clique em Analisar.'
            },
            {
              title: 'Baixe o vídeo ou GIF',
              description:
                'Clique em Baixar para salvar o vídeo ou GIF em qualidade HD no seu dispositivo.'
            }
          ]
        },
        faq: {
          title: 'FAQ do Downloader de Vídeo do X',
          items: [
            {
              question: 'Como baixar um vídeo do X (Twitter)?',
              answer:
                'Copie a URL do tweet que contém o vídeo, cole no campo de entrada acima e clique em Analisar. Depois clique em Baixar para salvar o vídeo.'
            },
            {
              question: 'Posso baixar GIFs do X?',
              answer:
                'Sim. Nosso downloader suporta tanto vídeos quanto GIFs animados de posts do X/Twitter. GIFs são salvos como arquivos MP4 para melhor compatibilidade.'
            },
            {
              question: 'Qual qualidade de vídeo está disponível?',
              answer:
                'Entregamos a mais alta qualidade disponível para cada tweet, geralmente a resolução HD original enviada pelo autor.'
            },
            {
              question: 'Este downloader do X é grátis?',
              answer:
                'Sim, totalmente grátis sem necessidade de cadastro. Baixe vídeos e GIFs do X sem nenhum custo.'
            },
            {
              question: 'Preciso de uma conta do X/Twitter para baixar?',
              answer:
                'Nenhuma conta é necessária. Desde que o tweet seja público, você pode baixar seu vídeo ou GIF sem fazer login.'
            }
          ]
        },
        crossLinks: {
          title: 'Mais Downloaders de Vídeo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Baixe vídeos do TikTok sem marca d\'água em qualidade HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Baixe vídeos do Vimeo em HD com várias opções de resolução.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Baixe vídeos e fotos do Threads em qualidade original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Baixe vídeos do Telegram de canais e grupos em qualidade HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo Video Downloader HD - Múltiplas Resoluções | TG Downloader',
          description:
            'Baixe vídeos do Vimeo em qualidade HD com múltiplas opções de resolução gratuitamente. Sem necessidade de app. Salve qualquer vídeo público do Vimeo instantaneamente.',
          keywords:
            'baixar vimeo, vimeo download hd, baixar vídeo vimeo, vimeo downloader grátis, salvar vídeo vimeo, download vimeo hd'
        },
        workspace: {
          title: 'Vimeo Video Downloader HD',
          helperText:
            'Cole qualquer link de vídeo do Vimeo para baixar em qualidade HD com seleção de resolução. Também suporta links do Telegram, TikTok e X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Por Que Usar Nosso Downloader do Vimeo',
          subtitle: 'Salve vídeos do Vimeo em qualidade HD com a resolução de sua escolha, totalmente grátis.',
          items: [
            {
              title: 'Qualidade HD Original',
              description:
                'Baixe vídeos do Vimeo em resolução HD completa. Obtenha a mesma qualidade nítida que o criador enviou.'
            },
            {
              title: 'Múltiplas Resoluções',
              description:
                'Escolha entre as resoluções disponíveis (360p, 720p, 1080p e mais). Selecione a qualidade que atende suas necessidades.'
            },
            {
              title: 'Rápido e Grátis',
              description:
                'Sem instalar app, sem conta necessária. Cole o link do Vimeo, selecione sua resolução e baixe instantaneamente.'
            }
          ]
        },
        howTo: {
          title: 'Como Baixar Vídeos do Vimeo em HD',
          subtitle:
            'Três passos simples para salvar qualquer vídeo do Vimeo na resolução de sua preferência.',
          steps: [
            {
              title: 'Copie o link do vídeo do Vimeo',
              description:
                'Abra a página do vídeo no Vimeo e copie a URL da barra de endereços do navegador.'
            },
            {
              title: 'Cole o link acima',
              description:
                'Cole a URL do Vimeo copiada no campo de entrada e clique em Analisar.'
            },
            {
              title: 'Escolha a resolução e baixe',
              description:
                'Selecione a resolução de vídeo preferida e clique em Baixar para salvar o vídeo em HD.'
            }
          ]
        },
        faq: {
          title: 'FAQ do Downloader Vimeo',
          items: [
            {
              question: 'Como baixar um vídeo do Vimeo?',
              answer:
                'Copie a URL da página do vídeo no Vimeo, cole no campo de entrada acima, clique em Analisar, depois selecione a resolução preferida e baixe.'
            },
            {
              question: 'Posso escolher a resolução do vídeo?',
              answer:
                'Sim. Após a análise, você pode escolher entre todas as resoluções disponíveis incluindo 360p, 720p, 1080p e superior quando disponível.'
            },
            {
              question: 'Este downloader do Vimeo é grátis?',
              answer:
                'Sim, totalmente grátis para usar. Baixe vídeos do Vimeo em qualidade HD sem nenhum custo ou cadastro.'
            },
            {
              question: 'Preciso de uma conta Vimeo para baixar?',
              answer:
                'Nenhuma conta necessária. Você pode baixar qualquer vídeo público do Vimeo sem fazer login.'
            },
            {
              question: 'Qual é o formato dos vídeos baixados?',
              answer:
                'Os vídeos do Vimeo são baixados em formato MP4, compatível com praticamente todos os dispositivos e players.'
            }
          ]
        },
        crossLinks: {
          title: 'Mais Downloaders de Vídeo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Baixe vídeos do TikTok sem marca d\'água em qualidade HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Baixe vídeos e GIFs do X/Twitter em qualidade HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Baixe vídeos e fotos do Threads em qualidade original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Baixe vídeos do Telegram de canais e grupos em qualidade HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Baixar Fotos e Vídeos do Instagram - Qualidade HD | TG Downloader',
          description:
            'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD grátis. Sem instalar apps, salve instantaneamente.',
          keywords:
            'baixar Instagram, baixar foto Instagram, baixar Reels Instagram, baixar carrossel Instagram, salvar vídeo Instagram, baixador Instagram grátis'
        },
        workspace: {
          title: 'Baixar Fotos e Vídeos do Instagram',
          helperText:
            'Cole um link de publicação do Instagram para baixar fotos, Reels e carrosséis em qualidade HD. Também suporta links do Telegram, TikTok e X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Por que usar nosso baixador de Instagram',
          subtitle: 'Salve fotos, Reels e carrosséis do Instagram em qualidade HD original. Totalmente grátis.',
          items: [
            {
              title: 'Fotos e Reels',
              description:
                'Baixe fotos e vídeos Reels do Instagram em qualidade original. Obtenha exatamente o conteúdo publicado pelo criador.'
            },
            {
              title: 'Download de carrosséis',
              description:
                'Baixe todas as imagens e vídeos de publicações carrossel do Instagram de uma vez. Sem necessidade de salvar um por um.'
            },
            {
              title: 'Qualidade HD original',
              description:
                'Salve mídias do Instagram na resolução mais alta disponível. Sem compressão, sem perda de qualidade.'
            }
          ]
        },
        howTo: {
          title: 'Como baixar fotos e vídeos do Instagram',
          subtitle:
            'Três passos simples para salvar qualquer publicação do Instagram em qualidade HD.',
          steps: [
            {
              title: 'Copie o link da publicação do Instagram',
              description:
                'Abra o Instagram, toque nos três pontos da publicação e selecione "Copiar link".'
            },
            {
              title: 'Cole o link acima',
              description:
                'Cole a URL do Instagram copiada no campo de entrada e clique em Analisar.'
            },
            {
              title: 'Baixe em HD',
              description:
                'Clique no botão Download para salvar fotos, Reels ou carrosséis em qualidade original.'
            }
          ]
        },
        faq: {
          title: 'FAQ do baixador de Instagram',
          items: [
            {
              question: 'Este baixador de Instagram é realmente grátis?',
              answer:
                'Sim, totalmente grátis sem cobranças ocultas. Baixe fotos, Reels e carrosséis do Instagram sem custo.'
            },
            {
              question: 'Quais formatos são suportados?',
              answer:
                'Suportamos o download de fotos do Instagram (JPG), vídeos Reels (MP4) e álbuns carrossel completos com todas as mídias.'
            },
            {
              question: 'Qual a qualidade dos arquivos baixados?',
              answer:
                'Todas as mídias são salvas na resolução HD original do criador, sem perda de qualidade ou compressão.'
            },
            {
              question: 'Preciso de uma conta Instagram para baixar?',
              answer:
                'Não. Desde que a publicação seja pública, você pode baixar suas mídias sem fazer login.'
            },
            {
              question: 'Posso baixar Stories do Instagram?',
              answer:
                'Atualmente suportamos publicações, Reels e carrosséis. O download de Stories requer que o conteúdo seja publicamente acessível via link direto.'
            }
          ]
        },
        crossLinks: {
          title: 'Mais baixadores de vídeo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: "Baixe vídeos do TikTok sem marca d'água em qualidade HD."
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Baixe vídeos e GIFs do X/Twitter em qualidade HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Baixe vídeos do Vimeo em HD com várias opções de resolução.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Baixe vídeos e fotos do Threads em qualidade original.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Baixe vídeos do Telegram de canais e grupos em qualidade HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Baixar Vídeos e Fotos do Threads - Qualidade Original | TG Downloader',
          description:
            'Baixe vídeos e fotos do Threads em qualidade original grátis. Sem instalar apps, salve mídias incluindo carrosséis instantaneamente.',
          keywords:
            'baixar Threads, baixar vídeo Threads, download vídeo Threads, baixar mídia Threads, salvar vídeo Threads, baixador Threads grátis'
        },
        workspace: {
          title: 'Baixar Vídeos e Fotos do Threads',
          helperText:
            'Cole um link de publicação do Threads para baixar vídeos e fotos em qualidade original. Também suporta links do Telegram, TikTok e Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Por que usar nosso baixador de Threads',
          subtitle: 'Salve vídeos e fotos do Threads em qualidade original. Totalmente grátis.',
          items: [
            {
              title: 'Mídia mista',
              description:
                'Baixe vídeos e fotos de publicações do Threads. Suporta publicações com múltiplos tipos de conteúdo.'
            },
            {
              title: 'Qualidade original',
              description:
                'Salve mídias do Threads na resolução mais alta disponível. Sem compressão, sem perda de qualidade.'
            },
            {
              title: 'Suporte a carrossel',
              description:
                'Baixe todas as mídias de publicações carrossel do Threads de uma vez. Obtenha cada foto e vídeo em uma única operação.'
            }
          ]
        },
        howTo: {
          title: 'Como baixar vídeos e fotos do Threads',
          subtitle:
            'Três passos simples para salvar qualquer publicação do Threads em qualidade original.',
          steps: [
            {
              title: 'Copie o link da publicação do Threads',
              description:
                'Abra o Threads, toque no ícone de compartilhar da publicação e selecione "Copiar link".'
            },
            {
              title: 'Cole o link acima',
              description:
                'Cole a URL do Threads copiada no campo de entrada e clique em Analisar.'
            },
            {
              title: 'Baixe as mídias',
              description:
                'Clique no botão Download para salvar vídeos e fotos em qualidade original.'
            }
          ]
        },
        faq: {
          title: 'FAQ do baixador de Threads',
          items: [
            {
              question: 'Este baixador de Threads é realmente grátis?',
              answer:
                'Sim, totalmente grátis sem cobranças ocultas. Baixe vídeos e fotos do Threads sem custo.'
            },
            {
              question: 'Quais tipos de mídia são suportados?',
              answer:
                'Suportamos o download de vídeos, fotos e publicações de mídia mista do Threads, incluindo publicações carrossel com múltiplos itens.'
            },
            {
              question: 'Qual a qualidade dos arquivos baixados?',
              answer:
                'Todas as mídias são salvas na resolução original do criador, sem perda de qualidade.'
            },
            {
              question: 'Preciso de uma conta Threads para baixar?',
              answer:
                'Não. Desde que a publicação seja pública, você pode baixar suas mídias sem fazer login.'
            },
            {
              question: 'Posso baixar publicações carrossel com múltiplas fotos?',
              answer:
                'Sim, nosso baixador suporta totalmente publicações carrossel do Threads. Todas as fotos e vídeos do carrossel estão disponíveis para download.'
            }
          ]
        },
        crossLinks: {
          title: 'Mais baixadores de vídeo',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: "Baixe vídeos do TikTok sem marca d'água em qualidade HD."
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Baixe vídeos e GIFs do X/Twitter em qualidade HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Baixe vídeos do Vimeo em HD com várias opções de resolução.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Baixe fotos, Reels e carrosséis do Instagram em qualidade HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Baixe vídeos do Telegram de canais e grupos em qualidade HD.'
            }
          ]
        }
      }
    }
  }
}
