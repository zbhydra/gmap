import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
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
  sections: {
    features: {
      title: 'Telegramメディアダウンロード機能',
      subtitle:
        'この Telegramメディアダウンロード 機能では、ファイル、画像、動画、大きな一括保存、Telegram Web で読み込んだ内容をまとめて扱えます。',
      metaDescription:
        'TG Downloader の機能：複数ファイルの一括保存、非公開チャンネル対応、1GB 以上の大容量ファイルのダウンロード、リアルタイムのメディア検出、ログイン不要のプライバシー第一設計。',
      items: [
        {
          title: '一括ダウンロード',
          description:
            '複数選択による一括ダウンロード対応。チャンネルやグループの全メディアファイルをワンクリックでダウンロード',
          details: [
            '複数選択による一括ダウンロード対応',
            'ワンクリックでチャンネル/グループ全体をダウンロード',
            'ファイルタイプ別のスマートフィルタリング',
            'ダウンロードキューマネジメント'
          ]
        },
        {
          title: '制限付きコンテンツ対応',
          description:
            '権限がなくても、制限付きチャンネルやプライベートグループのメディアコンテンツをダウンロード可能',
          details: [
            '制限付きチャンネルのコンテンツにアクセス',
            'プライベートグループからダウンロード',
            '権限検証不要',
            'A/K バージョン対応'
          ]
        },
        {
          title: 'マルチフォーマット対応',
          description: '画像、動画、GIF、オーディオなど、さまざまなメディアフォーマットに対応',
          details: [
            '画像：JPG、PNG、WEBP、GIF',
            '動画：MP4、WEBM、MOV',
            '音声：MP3、M4A、OGG',
            '自動フォーマット検出'
          ]
        },
        {
          title: '安全で信頼性',
          description: 'パスワードやAPIログイン不要、ユーザーデータは一切収集しません',
          details: [
            'パスワードや API ログイン不要',
            'ユーザーデータは収集しません',
            'ウイルス・広告なし',
            '厳格なセキュリティテスト'
          ]
        },
        {
          title: '大ファイル対応',
          description: '1GB以上の大ファイルも安定してダウンロード。レジューム機能付き',
          details: [
            '1GB+ の大ファイルも安定ダウンロード',
            '中断時のレジューム対応',
            '高速安定転送',
            '進捗トラッキング'
          ]
        },
        {
          title: 'リアルタイム検出',
          description:
            'ページ内のメディアリソースを自動スキャンし、ダウンロードリストをリアルタイム更新',
          details: [
            'ページのメディアリソースを自動スキャン',
            'リアルタイムリソース検出',
            '自動リスト更新',
            'スマートリソースキャッシュ'
          ]
        }
      ]
    },
    steps: {
      title: 'Telegram動画保存ガイド',
      subtitle:
        'この Telegram動画保存 ガイドでは、Telegram Web でメッセージを開き、動画やほかのメディアを少ない手順で保存できます。',
      metaDescription:
        'TG Downloader で Telegram の動画、ファイル、アルバムを保存するステップバイステップガイド。拡張機能のインストール、Telegram Web でのメディア検出、コンテンツの一括ダウンロードを学べます。',
      items: [
        {
          title: '拡張機能をインストール',
          description:
            'ブラウザの拡張機能ストアで検索し、TG Downloaderをインストール'
        },
        {
          title: '拡張機能をピン留め',
          description:
            'ブラウザツールバーをクリックして、拡張機能のアイコンをピン留めしてクイックアクセス'
        },
        {
          title: 'Telegram Webを開く',
          description:
            'web.telegram.orgにアクセスすると、拡張機能が自動的にメディアリソースのスキャンを開始'
        },
        {
          title: '一括ダウンロード',
          description:
            'ダウンロードするファイルを選択し、ダウンロードボタンをクリックしてローカルに保存'
        }
      ]
    },
    cta: {
      title: '今すぐ始めましょう',
      description:
        '拡張機能をインストールして、今すぐTelegramからメディアをダウンロードしましょう。'
    },
    techSpecs: {
      title: '技術仕様',
      browsersLabel: 'ブラウザ',
      browsers: 'Chrome、Edge、Brave、およびすべてのChromiumベースのブラウザ',
      telegramVersionsLabel: 'Telegramバージョン',
      telegramVersions: 'Web KバージョンとAバージョン',
      permissionsLabel: '権限',
      permissions: '最小限の権限のみ',
      updatesLabel: '更新',
      updates: '拡張機能ストアから自動更新'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Telegram プライベートチャンネル・制限付きチャンネルからメディアをダウンロード',
        description:
          'ワンクリック、ログイン不要、1GB+ ファイル対応。プライベートチャンネル・制限付きコンテンツを一括ダウンロード。'
      },
      stats: {
        users: '世界中のユーザー',
        downloads: '総ダウンロード数'
      },
      seo: {
        title: 'Telegram非公開動画ダウンローダー：あらゆる非公開メディアを保存',
        description:
          'わかりやすいダウンローダーガイドで Telegram 非公開チャンネルの動画を保存しましょう。アクセス可能な動画やメディアをダウンロードし、失敗したダウンロードをトラブルシューティングして、お使いのデバイスに合った方法を見つけられます。',
        keywords:
          'Telegram 非公開動画ダウンローダー, Telegram 非公開チャンネル 動画 ダウンロード, 非公開 Telegram 動画 ダウンロード, Telegram 非公開メディア ダウンローダー, telegram private video downloader'
      },
      heroTrustPoints: [
        'HD動画ダウンロード',
        '登録不要',
        'モバイル対応',
        'Windows、Mac、Android、iPhone に対応'
      ],
      situation: {
        title: 'まずはここから：あなたの状況はどれですか？',
        intro:
          'Telegram 非公開動画ダウンローダーを探している人の多くは、次のいずれかの問題を解決しようとしています：',
        headers: ['あなたの状況', 'まず試すこと'],
        rows: [
          {
            cells: [
              'チャンネルやチャットから取得した Telegram の動画リンクがある',
              'そのリンクをオンラインの Telegram 動画ダウンローダーに貼り付ける'
            ]
          },
          {
            cells: [
              '非公開チャンネルで動画を見られるが保存できない',
              'Telegram Desktop の Save Video As オプションを試す'
            ]
          },
          {
            cells: [
              '動画は再生できるが、ダウンロードと転送がブロックされている',
              'コピーを保持する許可がある場合に限り、画面録画を使う'
            ]
          },
          {
            cells: [
              'ダウンローダーに「動画が見つかりません」と表示される',
              'アクセス権、リンクの種類、チャンネルの制限、動画が Telegram の外で開けるかを確認する'
            ]
          }
        ]
      },
      solutions: {
        title: '非公開 Telegram 動画には何が有効ですか？',
        intro:
          '非公開 Telegram 動画とは通常、非公開チャンネル、非公開グループ、またはダイレクトチャットで共有された動画を指します。これらの動画は承認されたメンバーにのみ表示されるため、公開チャンネルのメディアを保存する場合とは方法が異なります。',
        quickAnswer:
          '手早い答え：リンクにアクセスできるなら、オンラインの Telegram 非公開動画ダウンローダーを使います。動画が Telegram の中でしか表示されない場合は Telegram Desktop を試します。保存がブロックされていてもコンテンツを保持することが許可されている場合は、画面録画が現実的な代替手段になります。',
        items: [
          {
            title: '解決策 1：オンライン Telegram 動画ダウンローダー',
            description:
              'アクセス可能な Telegram リンクに最適です。アプリ、拡張機能、ボットをインストールせずに Telegram 動画をオンラインでダウンロードしたいユーザーにとって、最もシンプルな方法です。',
            useWhenLabel: 'この方法が向いているのは：',
            useWhen: [
              'Telegram の動画リンクが公開、またはアクセス可能である。',
              'Telegram 動画をオンラインでダウンロードしたい。',
              '手早く HD の動画ファイルが欲しい。',
              'ブラウザ拡張機能やデスクトップアプリをインストールしたくない。'
            ]
          },
          {
            title: '解決策 2：Telegram Desktop の Save Video As',
            description:
              'Telegram Desktop で動画が利用でき、ダウンロードが許可されている場合は、動画を右クリックしてパソコンのフォルダに保存します。非公開チャンネルのメンバーは、すでに Telegram 内で認証されているため、こちらのほうがうまくいくことが多いです。',
            useWhenLabel: 'この方法が向いているのは：',
            useWhen: [
              'Telegram Desktop で動画を表示できる。',
              'チャンネルの所有者が保存を無効にしていない。',
              'Windows や Mac に直接ダウンロードしたい。'
            ]
          },
          {
            title: '解決策 3：モバイルまたはデスクトップの画面録画',
            description:
              'ダウンロードオプションが無効になっていても、コンテンツを表示・保持する許可がある場合は、再生中の動画と音声を画面録画ツールで取り込めます。これは最初の方法ではなく代替手段です。時間がかかり、再生品質に左右されるためです。',
            useWhenLabel: 'この方法が向いているのは：',
            useWhen: [
              '動画を表示・保持する許可がある。',
              'Telegram のリンクをダウンローダーで解析できない。',
              '参照用に個人的なオフラインコピーが必要。'
            ]
          },
          {
            title: '解決策 4：Android のファイルマネージャーを確認',
            description:
              'Android では、Telegram が読み込んだメディアをローカルのアプリフォルダに一時的に保存することがあります。ファイルマネージャーを使えば、すでに端末に読み込まれた動画を見つけられる場合がありますが、アプリのバージョン、ストレージ権限、キャッシュの挙動に依存します。',
            useWhenLabel: 'この方法が向いているのは：',
            useWhen: [
              'Android の Telegram ですでに動画を再生した。',
              'アプリのストレージ権限を理解している。',
              '端末にすでにキャッシュされたファイルを復元したいだけ。'
            ]
          }
        ]
      },
      benefits: {
        title: 'なぜオンライン Telegram 動画ダウンローダーを使うのですか？',
        intro:
          '優れたダウンローダーは、ひとつの問いに素早く答えられるべきです。「この Telegram 動画は、手元のリンクから保存できるのか？」。最高の体験とは、直接的で、明快で、非公開リンクを処理できないときには正直であることです。',
        items: [
          {
            title: '高画質で動画を保存',
            description:
              'オフライン再生、学習、トレーニング、アーカイブ、個人的な参照のために、Telegram 動画を利用可能な最高の画質で残せます。'
          },
          {
            title: 'デバイスを問わず動作',
            description:
              'Android、iPhone、Windows、Mac、タブレットのブラウザからダウンローダーを使えます。動画はスマホにあるが別のデバイスに保存したい、というときに役立ちます。'
          },
          {
            title: 'Telegram ログイン不要',
            description:
              'Telegram のパスワード、認証コード、セッションファイル、非公開アカウントの認証情報を求めずに動画リンクを処理するツールを選びましょう。'
          },
          {
            title: '手軽なオフライン再生',
            description:
              '利用可能な場合は一般的な動画フォーマットでファイルをダウンロードできるので、Telegram を開いたりモバイルデータを使ったりせずに後で視聴できます。'
          },
          {
            title: 'リンクベースの素早い処理',
            description:
              'コピー、貼り付け、解析、ダウンロード。リンクが失敗した場合は、その理由と次に試すべきことをページが説明すべきです。'
          },
          {
            title: '明確な許可の境界',
            description:
              'アクセスして保存する権利がある動画だけをダウンロードしましょう。チャンネルのルール、クリエイターの権利、Telegram のポリシーを尊重してください。'
          }
        ]
      },
      troubleshooting: {
        title: 'Telegram の動画リンクが機能しない場合',
        intro:
          'リンクが失敗したからといって、ダウンローダーが壊れているとは限りません。非公開の Telegram 動画は、ファイルが Telegram の外では利用できないために失敗することがよくあります。次のチェックリストを試してください：',
        items: [
          'ブラウザでリンクを開き、正しく読み込まれることを確認する。',
          '非公開チャンネルやグループのメンバーであり続けているか確認する。',
          'チャンネルの所有者が保存、コピー、転送を無効にしていないか確認する。',
          '動画がアプリの中でしか再生されない場合は Telegram Desktop を試す。',
          'ページが Telegram に到達できない場合は、別のブラウザやネットワークを使う。',
          'Telegram のログインコードを求めるツールは避ける。'
        ]
      },
      permission: {
        title: '重要な許可に関する注意',
        note:
          'Telegram 非公開動画ダウンローダーは、プライバシー、著作権、アクセス制限を回避するために使うべきではありません。所有者の許可がある場合、または法律と Telegram の規約で利用が認められている場合にのみ動画を保存してください。'
      },
      comparison: {
        title: '適切な Telegram ダウンロード方法を選ぶ',
        headers: ['状況', '推奨される解決策', '最適な用途', '確認すべきこと'],
        rows: [
          {
            cells: [
              '公開、またはアクセス可能な Telegram 動画リンク',
              'オンライン Telegram 動画ダウンローダー',
              'アプリなしで素早く HD ダウンロード',
              'リンクが開き、ツールが動画に到達できる'
            ]
          },
          {
            cells: [
              'ダウンロードが許可された非公開チャンネルの動画',
              'Telegram Desktop の Save Video As',
              'パソコンへの直接保存',
              'メンバーであり、所有者が保存を無効にしていない'
            ]
          },
          {
            cells: [
              '保存は制限されているが再生は可能',
              '内蔵またはサードパーティの画面録画ツール',
              '許可を得た個人的なオフライン参照',
              '音声の取り込み、画面の範囲、現地の法律やプラットフォームのルール'
            ]
          },
          {
            cells: [
              'Android のキャッシュされたメディア',
              'ファイルマネージャーの確認',
              '端末にすでに読み込まれたメディアの発見',
              'アプリのストレージへのアクセス権、Telegram がローカルにキャッシュを保持するか'
            ]
          }
        ]
      },
      howTo: {
        title: 'Telegram 動画を3ステップでダウンロードする方法',
        subtitle:
          '最速の方法は、リンクベースの Telegram 動画ダウンローダーです。Telegram の動画リンクが公開、アクセス可能、または Telegram アプリの外で読み取れる場合に最も効果的です。',
        steps: [
          {
            title: '動画のリンクをコピー',
            description:
              'Telegram を開き、保存したい動画を見つけて、共有メニューからメッセージリンクまたは動画リンクをコピーします。チャンネルがリンクのコピーを許可していない場合は、下の非公開チャンネル向けの解決策に進んでください。'
          },
          {
            title: '貼り付けて解析',
            description:
              'Telegram のリンクをダウンローダーの入力欄に貼り付けます。ツールは、そのリンクからダウンロード可能な動画ファイルに到達できるかどうかを確認します。'
          },
          {
            title: 'HD でダウンロード',
            description:
              '利用可能な画質またはフォーマットを選び、Telegram 動画をスマホ、タブレット、パソコンに直接保存します。ファイルが表示されない場合、リンクは壊れているのではなく、制限されている可能性が高いです。'
          }
        ]
      },
      faq: {
        title: 'よくある質問',
        description:
          'Telegram Web で Telegram の動画ダウンロードやファイルダウンロードを始める前に、よく寄せられる質問をまとめました。',
        items: [
          {
            question: '非公開の Telegram 動画をダウンロードできますか？',
            answer:
              '非公開の Telegram 動画をダウンロードまたは保存できるのは、アクセスする許可があり、かつ動画のソースが利用可能な場合に限られます。一部の非公開チャンネルは、保存、転送、リンクのコピー、外部アクセスをブロックしています。'
          },
          {
            question: 'Telegram 非公開チャンネルの動画はどうやってダウンロードしますか？',
            answer:
              '使える Telegram の動画リンクがある場合は、まずリンクベースのダウンローダーを試してください。それで動かない場合は、Telegram Desktop に Save Video As オプションがあるか確認します。ダウンロードがブロックされていてもコンテンツの保持が許可されている場合は、画面録画が代替手段になります。'
          },
          {
            question: 'Telegram 動画ダウンローダーに「動画が見つかりません」と表示されるのはなぜですか？',
            answer:
              'リンクが制限されている、削除された、期限切れになった、Telegram の中でしか表示されない、またはチャンネルの所有者にブロックされている可能性があります。まず自分でリンクを開き、動画がまだ再生できるか確認してください。Telegram にログインした後でしか再生できない場合、オンラインのダウンローダーではアクセスできないことがあります。'
          },
          {
            question: 'ソフトウェアのインストールは必要ですか？',
            answer:
              'アクセス可能なリンクなら不要です。オンラインの Telegram 動画ダウンローダーはブラウザで動作します。特定の非公開または制限されたケースでは、Telegram Desktop、ファイルマネージャー、画面録画ツールが必要になる場合があります。'
          },
          {
            question: 'リンクなしで Telegram 動画をダウンロードできますか？',
            answer:
              '通常はできません。オンラインのダウンローダーはファイルを特定するために Telegram の動画リンクを必要とします。リンクをコピーできないが Telegram で動画を見られる場合は、Telegram Desktop か、ほかの許可されたローカルな方法を使ってください。'
          },
          {
            question: 'Telegram のログインコードをダウンローダーに入力しても安全ですか？',
            answer:
              'いいえ。ダウンローダーが Telegram のパスワード、認証コード、セッション認証情報を必要とすることはありません。サイトがそれらを求めてきたら、そのページから離れてください。'
          },
          {
            question: 'Telegram メディアダウンローダーは無料ですか？',
            answer:
              '多くのリンクベースの Telegram メディアダウンローダーは、基本的なダウンロードであれば無料です。怪しいインストール、ログイン要求、紛らわしいボタンを強要するツールは避けましょう。'
          },
          {
            question: 'Telegram 動画をダウンロードするのは合法ですか？',
            answer:
              'コンテンツの内容、あなたの許可、利用目的によります。著作権で保護された、非公開の、または制限されたコンテンツを許可なくダウンロードしたり再配布したりしてはいけません。'
          }
        ]
      },
      workspace: {
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
          creditsLabel: 'クレジット'
        },
        quota: {
          eyebrow: 'Web クォータ',
          title: '現在のクレジット残高',
          planLabel: 'プラン',
          remainingLabel: '残り',
          dailyLimitLabel: '1日の上限',
          unlimited: '無制限'
        },
        checkin: {
          creditsLoading: 'クレジット',
          creditsButtonLabel: 'デイリーチェックインを開く',
          accountButtonLabel: 'アカウントメニューを開く',
          accountMenuLabel: 'アカウントメニュー',
          title: '今日の無料クレジットを受け取れます',
          todayRewardText: '本日の報酬: {credits} クレジット',
          claimedRewardText: '本日は {credits} クレジットを受け取りました。',
          nextCountdown: '次回受け取りまで {time}',
          nextAt: '(次回更新: {time} EST)',
          claimButton: '{credits} クレジットを受け取る',
          claimingButton: '受け取り中...',
          notNow: '後で',
          close: '閉じる',
          loadFailed: 'チェックイン状態の読み込みに失敗しました。',
          claimFailed: 'クレジットの受け取りに失敗しました。'
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
        parse: {
          eyebrow: '直接解析',
          title: 'Telegram非公開動画ダウンローダー：あらゆる非公開メディアを保存',
          helperText:
            'わかりやすいダウンローダーガイドで Telegram 非公開チャンネルの動画を保存しましょう。アクセス可能な動画やメディアをダウンロードし、失敗したダウンロードをトラブルシューティングして、お使いのデバイスに合った方法を見つけられます。',
          telegramMessageListLinkError:
            'この Telegram リンクはチャットまたはチャンネルを開くだけで、特定のメッセージではありません。正確なメッセージリンクをコピーして、ここに貼り付けてください。',
          linkLabel: 'Telegram リンク',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: '入力をクリア',
          submit: 'Telegram の動画リンクを貼り付け',
          submitting: '解析中...',
          noResults: 'このメッセージにはダウンロード可能なファイルがありません。',
          download: 'ダウンロード',
          downloading: 'ダウンロード中...',
          downloadAll: 'Download all',
          downloadingAll: 'Downloading all...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Unknown size',
          play: 'Play',
          preparingPlayback: 'Preparing playback...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Close',
          continuePlayback: 'Continue playback',
          upgradeToPlay: 'Upgrade to play',
          playQuotaExhausted: 'Playback quota is used up for today.',
          playerRestoring: 'Restoring playback...',
          playerRestoredPaused: 'Ready. Continue from where you left off.',
          playerResumeFailed: 'Could not restore playback session. Please start again.',
          playerRefreshing: 'Refreshing playback...',
          playerRecreating: 'Recreating playback session...',
          playerUnsupported: 'This browser cannot play this video.',
          playerSessionExpired: 'Playback session expired. Start playback again.',
          playerFailed: 'Playback failed.',
          playQuotaUnavailable: 'Playback quota is unavailable. Sign in and try again.',
          playQuotaReached: 'Playback quota reached for today.',
          playerResourceBusy: 'This video is still being prepared. Try again in a moment.',
          resumeNotice:
            'Detected an unfinished download "{filename}" ({progress}). Do you want to continue?',
          resumeAction: 'Continue',
          pendingRestartText: 'Previous download record for "{filename}" can be restarted.',
          pendingRestartButton: 'Restart download',
          resumeUnavailableText: 'The local recovery record has expired.',
          resumeDismiss: 'Ignore',
          resuming: 'Resuming...',
          largeFileExtensionInlineChromeTitle: 'Chrome 拡張機能',
          largeFileExtensionInlineChromeDescription:
            'Chrome ブラウザ専用の拡張機能で、Telegram メディアをワンクリックで検出して保存できます。',
          largeFileExtensionInlineChromeCta: '拡張機能をインストール',
          largeFileExtensionInlineEdgeTitle: 'Edge 拡張機能',
          largeFileExtensionInlineEdgeDescription:
            'Microsoft Edge 専用の拡張機能で、Telegram コンテンツのダウンロードに対応しています。',
          largeFileExtensionInlineEdgeCta: '拡張機能をインストール'
        },
        errors: {
          enterEmailFirst: '先にメールアドレスを入力してください。',
          enterEmailAndCode: 'メールアドレスと認証コードを入力してください。',
          sendCodeFailed: '認証コードの送信に失敗しました。',
          googleSignInFailed: 'Google ログインに失敗しました。',
          googleClientMissing: 'Google ログインが設定されていません。',
          restoreSessionFailed: 'セッションの復元に失敗しました。',
          signInFailed: 'ログインに失敗しました。',
          logoutFailed: 'ログアウトに失敗しました。',
          loadQuotaFailed: 'クレジットの取得に失敗しました。',
          enterLink: 'メディアリンクを入力してください。',
          invalidLink: 'これは有効なURLではありません。',
          parseFailed: 'このリンクを解析できませんでした。',
          downloadFailed: 'ダウンロードに失敗しました。',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'This link platform is not supported.',
          tiktokUnsupported: 'This TikTok link cannot be parsed yet. Use a public single video or photo post link.',
          vimeoParseFailed: 'This Vimeo video is private or cannot be parsed.',
          xParseFailed: 'このXリンクはサポートされていません。公開動画投稿をお試しください。',
          instagramParseFailed: 'このInstagramリンクはサポートされていません。公開投稿をお試しください。',
          instagramImageParseFailed: 'このInstagramリンクはサポートされていません。公開写真投稿をお試しください。',
          threadsParseFailed: 'このThreadsリンクはサポートされていません。公開投稿をお試しください。',
          redditParseFailed: 'Redditメディアを取得できませんでした。公開動画、画像、またはギャラリー投稿をお試しください。',
          douyinParseFailed: 'Douyin動画を取得できませんでした。公開動画リンクをお試しください。',
          quotaExceeded: 'このファイルをダウンロードするためのクレジットが足りません。',
          rateLimitExceeded: 'Too many requests. Please try again later.'
        },
        downloadAll: {
          allSuccess: 'All files downloaded.',
          partialFailed: 'Some files downloaded. Some files failed.',
          allFailed: 'All downloads failed.'
        },
        requiresClient: {
          privateChannel:
            'Unable to parse Telegram private channel content here. The free browser extension can download videos from any private channel you can access in Telegram Web.\nYou can try:\nPath 1 (recommended): click the "Download free extension" button to install the desktop browser extension.\nPath 2:\n1. Go back to Telegram.\n2. Right-click the message you want to download and choose Forward to send it to a public channel or group.\n3. Open that public channel or group.\n4. Right-click the forwarded message, copy its public message link, then paste it here.',
          privateChannelCta: 'Download free extension',
          restrictedFile: 'This restricted file needs TG Downloader inside Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'その他の動画ダウンローダー',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'TikTok 動画をウォーターマークなし・HD画質でダウンロード。'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'X/Twitter の動画や GIF を HD画質でダウンロード。'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Vimeo 動画を複数の解像度オプションで HD ダウンロード。'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Instagram の写真、リール、カルーセルを HD 画質でダウンロード。'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Threads の動画と写真をオリジナル画質でダウンロード。'
          }
        ]
      }
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
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['ja-JP'],
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
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok動画ダウンロード ウォーターマークなし HD画質 | TG Downloader',
          description:
            'TikTok 動画をウォーターマークなし・HD画質で無料ダウンロード。アプリのインストール不要。TikTok 動画、スライドショー、ストーリーを即座に保存。',
          keywords:
            'TikTok ダウンロード, TikTok 動画保存, TikTok ウォーターマークなし, TikTok 動画ダウンロード HD, ティックトック 保存, TikTok ダウンローダー 無料'
        },
        workspace: {
          title: 'TikTok動画ダウンロード ウォーターマークなし',
          helperText:
            'TikTok 動画リンクを貼り付けて、ウォーターマークなし・HD画質でダウンロードできます。Telegram、X、Vimeo のリンクにも対応。',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'TikTok ダウンローダーの特長',
          subtitle: 'TikTok 動画を最高画質・ウォーターマークなしで完全無料で保存。',
          items: [
            {
              title: 'ウォーターマークなし',
              description:
                'TikTok のウォーターマークなしで動画をダウンロード。クリーンなオリジナル画質の動画をすぐに保存・共有できます。'
            },
            {
              title: 'HD画質',
              description:
                'TikTok 動画をオリジナルの HD解像度で保存。画質劣化なし、圧縮なし — クリエイターがアップロードしたそのままの品質。'
            },
            {
              title: '高速＆無料',
              description:
                'アプリのインストール不要、登録不要、隠れた料金なし。リンクを貼り付けるだけで即座にダウンロード。あらゆるブラウザで動作します。'
            }
          ]
        },
        howTo: {
          title: 'TikTok 動画をウォーターマークなしでダウンロードする方法',
          subtitle:
            'TikTok 動画を HD画質・ウォーターマークなしで保存する3つの簡単なステップ。',
          steps: [
            {
              title: 'TikTok 動画のリンクをコピー',
              description:
                'TikTok を開き、動画の「シェア」ボタンをタップして「リンクをコピー」を選択します。'
            },
            {
              title: 'リンクを上の入力欄に貼り付け',
              description:
                'コピーした TikTok URL を入力欄に貼り付けて「解析」をクリックします。'
            },
            {
              title: 'ウォーターマークなしでダウンロード',
              description:
                '「ダウンロード」ボタンをクリックして、TikTok 動画をウォーターマークなし・HD画質で保存します。'
            }
          ]
        },
        faq: {
          title: 'TikTok ダウンローダー FAQ',
          items: [
            {
              question: 'この TikTok ダウンローダーは本当に無料ですか？',
              answer:
                'はい、隠れた料金なしで完全無料です。TikTok 動画をウォーターマークなしで無料ダウンロードできます。'
            },
            {
              question: 'ダウンロードした動画にウォーターマークはありますか？',
              answer:
                'いいえ。当ダウンローダーは TikTok のウォーターマークを除去し、オリジナルのクリーンな HD画質の動画を提供します。'
            },
            {
              question: 'ダウンロードされた TikTok 動画の画質は？',
              answer:
                'クリエイターがアップロードしたオリジナルの HD解像度で保存されます。画質劣化はありません。'
            },
            {
              question: 'アプリや拡張機能のインストールは必要ですか？',
              answer:
                'インストール不要です。ブラウザで直接動作する Web ベースのツールで、あらゆるデバイスで利用できます。'
            },
            {
              question: 'TikTok のストーリーやスライドショーもダウンロードできますか？',
              answer:
                'はい、TikTok 動画、フォトスライドショー、ストーリーに対応しています。リンクを貼り付けてダウンロードしてください。'
            }
          ]
        },
        crossLinks: {
          title: 'その他の動画ダウンローダー',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter の動画や GIF を HD画質でダウンロード。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo 動画を複数の解像度オプションで HD ダウンロード。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram の写真、リール、カルーセルを HD 画質でダウンロード。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads の動画と写真をオリジナル画質でダウンロード。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram チャンネルやグループから動画を HD画質でダウンロード。'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) 動画ダウンロード - 動画＆GIF HD保存 | TG Downloader',
          description:
            'X (Twitter) の動画や GIF を HD画質で無料ダウンロード。アプリ不要。公開ツイートの動画や GIF を即座に保存。',
          keywords:
            'X ダウンロード, Twitter 動画保存, Twitter 動画ダウンロード, X 動画ダウンローダー, Twitter GIF 保存, ツイッター 動画保存'
        },
        workspace: {
          title: 'X (Twitter) 動画ダウンローダー',
          helperText:
            'X または Twitter の動画リンクを貼り付けて最高画質でダウンロード。Telegram、TikTok、Vimeo のリンクにも対応。',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'X 動画ダウンローダーの特長',
          subtitle: 'X/Twitter の動画や GIF をオリジナル画質で完全無料で保存。',
          items: [
            {
              title: '動画＆GIF対応',
              description:
                'X (Twitter) の動画投稿とアニメーション GIF の両方をダウンロード。ツイートに表示されるそのままのメディアを取得できます。'
            },
            {
              title: 'オリジナル HD画質',
              description:
                'X の動画を利用可能な最高解像度で保存。画質劣化なし — ソースと同じビットレートを取得できます。'
            },
            {
              title: '高速＆無料',
              description:
                'アプリのインストール不要、ログイン不要。ツイートの URL を貼り付けるだけで、数秒で動画や GIF をダウンロード。'
            }
          ]
        },
        howTo: {
          title: 'X (Twitter) 動画のダウンロード方法',
          subtitle:
            'X/Twitter の動画や GIF を保存する3つの簡単なステップ。',
          steps: [
            {
              title: 'ツイートの URL をコピー',
              description:
                'X (Twitter) で、ツイートの「シェア」アイコンをクリックし「リンクをコピー」を選択します。'
            },
            {
              title: 'リンクを上の入力欄に貼り付け',
              description:
                'コピーした X/Twitter URL を入力欄に貼り付けて「解析」をクリックします。'
            },
            {
              title: '動画または GIF をダウンロード',
              description:
                '「ダウンロード」をクリックして、動画や GIF を HD画質でデバイスに保存します。'
            }
          ]
        },
        faq: {
          title: 'X 動画ダウンローダー FAQ',
          items: [
            {
              question: 'X (Twitter) から動画をダウンロードするにはどうすればいいですか？',
              answer:
                '動画を含むツイートの URL をコピーし、上の入力欄に貼り付けて「解析」をクリックします。次に「ダウンロード」をクリックして動画を保存します。'
            },
            {
              question: 'X から GIF もダウンロードできますか？',
              answer:
                'はい。X/Twitter の投稿から動画とアニメーション GIF の両方に対応しています。GIF は互換性のために MP4 ファイルとして保存されます。'
            },
            {
              question: 'どの画質で動画をダウンロードできますか？',
              answer:
                '各ツイートで利用可能な最高画質を提供します。通常、投稿者がアップロードしたオリジナルの HD解像度です。'
            },
            {
              question: 'この X ダウンローダーは無料ですか？',
              answer:
                'はい、登録不要で完全無料です。X の動画や GIF を無料でダウンロードできます。'
            },
            {
              question: 'ダウンロードに X/Twitter アカウントは必要ですか？',
              answer:
                'アカウント不要です。ツイートが公開されていれば、ログインなしで動画や GIF をダウンロードできます。'
            }
          ]
        },
        crossLinks: {
          title: 'その他の動画ダウンローダー',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok 動画をウォーターマークなし・HD画質でダウンロード。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Vimeo 動画を複数の解像度オプションで HD ダウンロード。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram の写真、リール、カルーセルを HD 画質でダウンロード。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads の動画と写真をオリジナル画質でダウンロード。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram チャンネルやグループから動画を HD画質でダウンロード。'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo動画ダウンロード HD - 複数解像度対応 | TG Downloader',
          description:
            'Vimeo 動画を複数の解像度オプションで HD画質無料ダウンロード。アプリ不要。公開 Vimeo 動画を即座に保存。',
          keywords:
            'Vimeo ダウンロード, Vimeo 動画保存, Vimeo 動画ダウンロード HD, Vimeo ダウンローダー 無料, ビメオ 動画保存, Vimeo HD ダウンロード'
        },
        workspace: {
          title: 'Vimeo動画ダウンロード HD',
          helperText:
            'Vimeo 動画リンクを貼り付けて、解像度を選択して HD画質でダウンロード。Telegram、TikTok、X のリンクにも対応。',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Vimeo ダウンローダーの特長',
          subtitle: 'Vimeo 動画を HD画質で、お好みの解像度を選んで完全無料で保存。',
          items: [
            {
              title: 'HDオリジナル画質',
              description:
                'Vimeo 動画をフル HD解像度でダウンロード。クリエイターがアップロードしたそのままの鮮明な画質を取得できます。'
            },
            {
              title: '複数の解像度',
              description:
                '利用可能な解像度（360p、720p、1080p など）から選択できます。用途に合った画質を選んでください。'
            },
            {
              title: '高速＆無料',
              description:
                'アプリのインストール不要、アカウント不要。Vimeo リンクを貼り付け、解像度を選択して即座にダウンロード。'
            }
          ]
        },
        howTo: {
          title: 'Vimeo 動画を HD でダウンロードする方法',
          subtitle:
            'お好みの解像度で Vimeo 動画を保存する3つの簡単なステップ。',
          steps: [
            {
              title: 'Vimeo 動画のリンクをコピー',
              description:
                'Vimeo の動画ページを開き、ブラウザのアドレスバーから URL をコピーします。'
            },
            {
              title: 'リンクを上の入力欄に貼り付け',
              description:
                'コピーした Vimeo URL を入力欄に貼り付けて「解析」をクリックします。'
            },
            {
              title: '解像度を選択してダウンロード',
              description:
                'お好みの動画解像度を選択し、「ダウンロード」をクリックして HD 動画を保存します。'
            }
          ]
        },
        faq: {
          title: 'Vimeo ダウンローダー FAQ',
          items: [
            {
              question: 'Vimeo から動画をダウンロードするにはどうすればいいですか？',
              answer:
                'Vimeo 動画ページの URL をコピーし、上の入力欄に貼り付けて「解析」をクリックします。次にお好みの解像度を選択してダウンロードします。'
            },
            {
              question: '動画の解像度を選べますか？',
              answer:
                'はい。解析後、360p、720p、1080p、およびそれ以上（利用可能な場合）のすべての解像度から選択できます。'
            },
            {
              question: 'この Vimeo ダウンローダーは無料ですか？',
              answer:
                'はい、完全無料です。Vimeo 動画を HD画質で登録なし・費用なしでダウンロードできます。'
            },
            {
              question: 'ダウンロードに Vimeo アカウントは必要ですか？',
              answer:
                'アカウント不要です。公開されている Vimeo 動画であれば、ログインなしでダウンロードできます。'
            },
            {
              question: 'ダウンロードされる動画のフォーマットは？',
              answer:
                'Vimeo 動画は MP4 形式でダウンロードされます。ほぼすべてのデバイスやプレーヤーで再生可能です。'
            }
          ]
        },
        crossLinks: {
          title: 'その他の動画ダウンローダー',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'TikTok 動画をウォーターマークなし・HD画質でダウンロード。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter の動画や GIF を HD画質でダウンロード。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram の写真、リール、カルーセルを HD 画質でダウンロード。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads の動画と写真をオリジナル画質でダウンロード。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram チャンネルやグループから動画を HD画質でダウンロード。'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram 写真・動画ダウンローダー - HD画質 | TG Downloader',
          description:
            'Instagram の写真、リール、カルーセルアルバムを HD 画質で無料ダウンロード。アプリ不要、即座に保存。',
          keywords:
            'Instagram ダウンロード, Instagram 写真保存, Instagram リール保存, Instagram カルーセル, Instagram ダウンローダー 無料'
        },
        workspace: {
          title: 'Instagram 写真・動画ダウンロード',
          helperText:
            'Instagram の投稿リンクを貼り付けるだけで、写真・リール・カルーセルを HD 画質でダウンロード。Telegram、TikTok、X のリンクにも対応。',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Instagram ダウンローダーの特徴',
          subtitle: 'Instagram の写真、リール、カルーセルアルバムをオリジナル HD 画質で保存。完全無料。',
          items: [
            {
              title: '写真とリール',
              description:
                'Instagram の写真とリール動画をオリジナル画質でダウンロード。クリエイターが投稿したそのままのメディアを取得。'
            },
            {
              title: 'カルーセル一括ダウンロード',
              description:
                'Instagram カルーセル投稿のすべての画像と動画を一度にダウンロード。一つずつ保存する必要なし。'
            },
            {
              title: 'HD オリジナル画質',
              description:
                '最高解像度で Instagram メディアを保存。圧縮なし、画質劣化なし。アップロード時そのまま。'
            }
          ]
        },
        howTo: {
          title: 'Instagram の写真・動画をダウンロードする方法',
          subtitle:
            '3つの簡単なステップで Instagram 投稿を HD 画質で保存。',
          steps: [
            {
              title: 'Instagram 投稿リンクをコピー',
              description:
                'Instagram を開き、投稿の右上にある三点メニューをタップし、「リンクをコピー」を選択。'
            },
            {
              title: 'リンクを貼り付け',
              description:
                'コピーした Instagram URL を上の入力欄に貼り付け、「解析」をクリック。'
            },
            {
              title: 'HD でダウンロード',
              description:
                '「ダウンロード」ボタンをクリックし、写真・リール・カルーセルをオリジナル画質で保存。'
            }
          ]
        },
        faq: {
          title: 'Instagram ダウンローダー よくある質問',
          items: [
            {
              question: 'この Instagram ダウンローダーは本当に無料ですか？',
              answer:
                'はい、完全無料で隠れた料金はありません。Instagram の写真、リール、カルーセルを無料でダウンロードできます。'
            },
            {
              question: '対応フォーマットは？',
              answer:
                'Instagram 写真（JPG）、リール動画（MP4）、すべてのメディアを含む完全なカルーセルアルバムのダウンロードに対応。'
            },
            {
              question: 'ダウンロードファイルの画質は？',
              answer:
                'すべてのメディアはクリエイターがアップロードした元の HD 解像度で保存。画質劣化や圧縮なし。'
            },
            {
              question: 'ダウンロードに Instagram アカウントは必要ですか？',
              answer:
                '不要です。投稿が公開されている限り、ログインなしでメディアをダウンロードできます。'
            },
            {
              question: 'Instagram ストーリーはダウンロードできますか？',
              answer:
                '現在、投稿、リール、カルーセルに対応しています。ストーリーのダウンロードは直接リンクで公開アクセス可能な場合に限ります。'
            }
          ]
        },
        crossLinks: {
          title: 'その他の動画ダウンローダー',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ウォーターマークなしで TikTok 動画を HD ダウンロード。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter の動画と GIF を HD 画質でダウンロード。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '複数の解像度から選んで Vimeo 動画を HD ダウンロード。'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads の動画と写真をオリジナル画質でダウンロード。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram チャンネルやグループから動画を HD ダウンロード。'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads 動画・写真ダウンローダー - オリジナル画質 | TG Downloader',
          description:
            'Threads の動画と写真をオリジナル画質で無料ダウンロード。アプリ不要、カルーセル投稿も即座に保存。',
          keywords:
            'Threads ダウンロード, Threads 動画保存, Threads 動画ダウンロード, Threads メディア保存, Threads ダウンローダー 無料'
        },
        workspace: {
          title: 'Threads 動画・写真ダウンロード',
          helperText:
            'Threads の投稿リンクを貼り付けるだけで、動画と写真をオリジナル画質でダウンロード。Telegram、TikTok、Instagram のリンクにも対応。',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Threads ダウンローダーの特徴',
          subtitle: 'Threads の動画と写真をオリジナル画質で保存。完全無料。',
          items: [
            {
              title: 'ミックスメディア',
              description:
                'Threads 投稿の動画と写真をダウンロード。複数のコンテンツタイプを含むミックスメディア投稿に対応。'
            },
            {
              title: 'オリジナル画質',
              description:
                '最高解像度で Threads メディアを保存。圧縮なし、画質劣化なし。投稿時そのまま。'
            },
            {
              title: 'カルーセル対応',
              description:
                'Threads カルーセル投稿のすべてのメディアを一度にダウンロード。1回の操作ですべての写真と動画を取得。'
            }
          ]
        },
        howTo: {
          title: 'Threads の動画・写真をダウンロードする方法',
          subtitle:
            '3つの簡単なステップで Threads 投稿をオリジナル画質で保存。',
          steps: [
            {
              title: 'Threads 投稿リンクをコピー',
              description:
                'Threads を開き、投稿の共有アイコンをタップし、「リンクをコピー」を選択。'
            },
            {
              title: 'リンクを貼り付け',
              description:
                'コピーした Threads URL を上の入力欄に貼り付け、「解析」をクリック。'
            },
            {
              title: 'メディアをダウンロード',
              description:
                '「ダウンロード」ボタンをクリックし、動画と写真をオリジナル画質で保存。'
            }
          ]
        },
        faq: {
          title: 'Threads ダウンローダー よくある質問',
          items: [
            {
              question: 'この Threads ダウンローダーは本当に無料ですか？',
              answer:
                'はい、完全無料で隠れた料金はありません。Threads の動画と写真を無料でダウンロードできます。'
            },
            {
              question: '対応メディアタイプは？',
              answer:
                'Threads の動画、写真、ミックスメディア投稿のダウンロードに対応。複数アイテムを含むカルーセル投稿も対応。'
            },
            {
              question: 'ダウンロードファイルの画質は？',
              answer:
                'すべてのメディアはクリエイターが投稿した元の解像度で保存。画質劣化なし。'
            },
            {
              question: 'ダウンロードに Threads アカウントは必要ですか？',
              answer:
                '不要です。投稿が公開されている限り、ログインなしでメディアをダウンロードできます。'
            },
            {
              question: '複数写真のカルーセル投稿もダウンロードできますか？',
              answer:
                'はい、Threads カルーセル投稿に完全対応しています。カルーセル内のすべての写真と動画をダウンロード可能。'
            }
          ]
        },
        crossLinks: {
          title: 'その他の動画ダウンローダー',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ウォーターマークなしで TikTok 動画を HD ダウンロード。'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter の動画と GIF を HD 画質でダウンロード。'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '複数の解像度から選んで Vimeo 動画を HD ダウンロード。'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram の写真、リール、カルーセルを HD 画質でダウンロード。'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram チャンネルやグループから動画を HD ダウンロード。'
            }
          ]
        }
      }
    }
  }
}
