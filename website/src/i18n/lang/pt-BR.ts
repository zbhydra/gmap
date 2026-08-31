import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'créditos',
        enterEmailFirst: 'Digite seu e-mail primeiro.',
        enterEmailAndCode: 'Digite o e-mail e o código de verificação.',
        sendCodeFailed: 'Não foi possível enviar o código de verificação.',
        googleSignInFailed: 'Não foi possível entrar com o Google.',
        googleClientMissing: 'O login com Google não está configurado.',
        signInFailed: 'Não foi possível entrar.',
      },
      checkin: {
        accountButtonLabel: 'Abrir menu da conta',
        accountMenuLabel: 'Menu da conta',
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
  }
}
