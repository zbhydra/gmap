import type { SiteContent } from '../schema'
import { jaJPPricingContent } from '../pricing'

export const jaJP: SiteContent = {
  site: {
    name: 'Telegram動画ダウンロード | TG Downloader',
    description:
      'Telegram Web で Telegram動画ダウンロード を進め、読み込み済みのファイルやメディアを保存し、Telegram非公開チャンネルでも拡張機能へ引き継げます。',
    keywords:
      'Telegram動画ダウンロード, Telegramメディアダウンロード, Telegram動画保存, Telegramファイルダウンロード, Telegram非公開チャンネル'
  },
  layout: {
    nav: {
      brand: 'TGダウンローダー',
      home: 'ホーム',
      pricing: '料金',
      solutions: 'ソリューション',
      changelog: '変更履歴'
    },
    footer: {
      resources: 'リソース',
      rights: '© 2026 TG Downloader. All rights reserved.'
    }
  },
  common: {
    installCta: '今すぐインストール'
  },
  pages: {
    account: {
      auth: {
        eyebrow: 'Web ログイン',
        title: 'ログインしてクレジットを同期',
        signedInAs: 'ログイン中のアカウント',
        continueWithGoogle: 'Google で続行',
        googleLoading: 'Google を開いています...',
        or: 'または',
        emailLabel: 'メールアドレス',
        emailPlaceholder: 'name@example.com',
        continueWithEmail: 'メールで続行',
        sendCode: '認証コードを送信',
        sendingCode: '送信中...',
        sendCodeSuccess: '認証コードを送信しました。',
        sendAgain: '再送信',
        codeLabel: '認証コード',
        codePlaceholder: '123456',
        signIn: 'ログイン',
        termsNotice: 'ログインすると、以下に同意したものとみなされます',
        termsLink: '利用規約',
        privacyLink: 'プライバシーポリシー',
        logout: 'ログアウト',
        creditsLabel: 'クレジット',
        enterEmailFirst: '先にメールアドレスを入力してください。',
        enterEmailAndCode: 'メールアドレスと認証コードを入力してください。',
        sendCodeFailed: '認証コードの送信に失敗しました。',
        googleSignInFailed: 'Google ログインに失敗しました。',
        googleClientMissing: 'Google ログインが設定されていません。',
        signInFailed: 'ログインに失敗しました。',
      },
      checkin: {
        accountButtonLabel: 'アカウントメニューを開く',
        accountMenuLabel: 'アカウントメニュー',
      },
      creditPurchase: {
        title: 'クレジットを購入',
        description: 'クレジットを追加して、このワークスペースでダウンロードを続けられます。',
        successTitle: 'クレジットを追加しました',
        successDescription: '残高を更新しました。このウィンドウを閉じて、もう一度ダウンロードを開始してください。',
        packageEyebrow: '使った分だけ購入',
        cardNote: 'クレジットは Web ダウンロードに使えます。有効期限はありません。',
        creditsAmount: '{credits} クレジット',
        buyNow: '今すぐ購入',
        selectPackage: '選択',
        paymentMethodLabel: '支払い方法を選択',
        paymentTitle: '支払い方法を選択',
        selectedPackageLabel: '選択した商品',
        confirmPurchase: '支払いへ進む',
        backToProducts: '戻る',
        close: '閉じる',
        agreementText: '購入条件、利用規約、プライバシーポリシーに同意します。',
        loadingConfigs: 'クレジットパッケージを読み込み中...',
        loadFailed: 'クレジットパッケージの読み込みに失敗しました。もう一度お試しください。',
        noConfigs: '現在購入できるクレジットパッケージはありません。後でもう一度お試しください。',
        ready: 'クレジットパッケージを選択してください。価格は USD で表示されます。',
        creatingOrder: '注文を作成中...',
        pendingPayment: '新しく開いたタブで支払いを完了してください。結果は自動で確認します。',
        pendingPaymentTitle: '支払い待ち',
        cancelPayment: '支払いをキャンセル',
        supportMailPrefix: '問題を報告: ',
        success: '支払いが完了しました。クレジットを利用できます。',
        failed: '支払いはまだ完了していません。再試行するか、このウィンドウを閉じられます。',
        successCredits: '+{credits} クレジットを追加しました',
        successBalance: '現在の残高: {balance} クレジット',
        createFailed: '注文作成に失敗しました。もう一度お試しください。',
        invalidPaymentData: '支払いリンクが無効です。後でもう一度お試しください。',
        priceUpdated: '価格が変更されました。最新価格を確認して再購入してください。',
        gatewayFailed: '支払い入口を一時的に利用できません。後でもう一度お試しください。',
        paymentCanceled: '支払いがキャンセルされました。支払い方法を選んでもう一度お試しください。',
        pollFailed: '支払い状態の更新に失敗しました。もう一度お試しください。',
        pollTimeout: '自動更新がタイムアウトしました。支払い後に手動で結果を更新してください。',
        orderNotFound: '注文は利用できなくなりました。新しい注文を作成してください。',
        orderExpired: '注文の期限が切れました。再購入してください。',
        fulfillmentFailed: '支払いは受領済みですが、クレジットはまだ追加されていません。後でもう一度お試しください。',
        authExpired: 'ログイン期限が切れました。再ログインして続けてください。'
      },
    },

    changelog: {
      title: 'Telegram動画ダウンロード更新履歴',
      description:
        'Telegram動画ダウンロード、Web フロー、より長い保存セッションに関する更新を追跡できます。',
      seoTitle: 'Telegram動画ダウンロード更新履歴 | TG Downloader',
      seoDescription:
        'この Telegram動画ダウンロード 更新履歴では、Web フロー、大容量ファイル、最新バージョンの変更を確認できます。',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'パフォーマンス向上',
          description: 'より良いユーザー体験のための大幅なパフォーマンス改善。',
          features: [
            'リソース検出速度を 50% 向上',
            '大ファイルダウンロードの安定性を最適化',
            'UI の応答速度を向上'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '多言語対応',
          description: '世界 14 カ国語に対応。',
          features: [
            '日本語、韓国語など多数の言語に対応',
            '翻訳精度を向上',
            '自動言語検出機能を追加'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'サイドバーダウンロード',
          description: 'バッチダウンロード対応の新しいサイドバーダウンロード機能。',
          features: [
            'サイドバーでの単一ファイルダウンロード機能を追加',
            '一括ダウンロード機能を追加',
            'ダウンロードキュー管理を改善'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'セキュリティとプライバシー',
          description: 'セキュリティ改善とプライバシー強化。',
          features: [
            'すべての分析トラッキングを削除',
            'ローカル処理モードを追加',
            'データ暗号化を強化'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '初期リリース',
          description: 'チャットウィンドウダウンロード対応の最初のリリース。',
          features: [
            'チャットウィンドウでのダウンロード機能',
            'Telegram Web KおよびAバージョンに対応',
            '基本的なメディアフォーマットに対応'
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
    pricing: jaJPPricingContent,
    extensionLoginV2: {
      title: '拡張機能ログイン | TG Downloader',
      description: 'TG Downloader にログインして、ウェブサイトのセッションをブラウザー拡張機能に同期します。',
      eyebrow: 'ブラウザー拡張機能',
      heading: 'TG Downloader にログイン',
      checkingState: 'セッションを確認中',
      signInRequiredState: 'ログインが必要です',
      syncedState: 'ログイン済み',
      verificationFailedState: '認証に失敗',
      preparingTitle: 'ログインを準備中…',
      preparingText: 'TG Downloader がウェブサイトのセッション確認を準備しています。',
      checkingSessionTitle: 'ウェブサイトのセッションを確認中…',
      checkingSessionText: 'TG Downloader がこのブラウザーに保存されたウェブサイトのトークンを検証しています。',
      finishingGoogleTitle: 'Google ログインを完了中…',
      finishingGoogleText: 'TG Downloader が Google ログインの結果をウェブサイトのセッションに交換しています。',
      signInRequiredTitle: '続行するにはログインしてください',
      signInRequiredText: 'ウェブサイトと同じ TG Downloader ログインウィンドウを使用してください。',
      signInButtonLabel: 'ログイン',
      syncingTitle: '拡張機能トークンを同期中…',
      syncingText: 'TG Downloader がウェブサイトのセッションを拡張機能トークンに交換しています。',
      syncedTitle: 'ログインに成功しました',
      syncedText: '拡張機能が TG Downloader アカウントに接続されました。「Telegram に戻る」をクリックして戻ります。',
      returnButtonLabel: 'Telegram に戻る',
      returningButtonLabel: '戻っています…',
      verificationFailedTitle: '拡張機能のログインを完了できませんでした',
      retryButtonLabel: '再試行',
    },
  }
}
