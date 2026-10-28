import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab はマップ データ ツールキットです。ブラウザ拡張機能と Web ツールを使用して、マップから公開されているビジネス情報を取得し、リンクを確認し、場所 ID などを取得します。",
    "keywords": "地図データ、Google マップ抽出ツール、場所 ID ファインダー、レビュー リンク ジェネレーター、地図ツール"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "プライマリナビゲーション",
      "mobileLabel": "モバイルナビゲーション",
      "extension": "拡張機能",
      "online": "オンライン",
      "api": "API",
      "apiScraper": "スクレイピング API",
      "apiReviews": "レビュー API",
      "apiPhotos": "写真 API",
      "apiMcp": "スクレイピング MCP",
      "apiScraperDesc": "任意のキーワードと場所のビジネス データ (JSON)。",
      "apiReviewsDesc": "評価と所有者の返信を含む完全なレビュー スレッド。",
      "apiPhotosDesc": "すぐに使用できる URL リストとしての公開写真ギャラリー。",
      "apiMcpDesc": "Claude Code、Cursor、VS Code のライブ マップ データ。",
      "apiFootNote": "API と MCP は 1 つの月間リクエスト割り当てを共有します。",
      "apiPricing": "API 価格",
      "pricing": "価格設定",
      "freeTools": "無料ツール",
      "signIn": "サインイン",
      "dashboard": "ダッシュボード"
    },
    "footer": {
      "legalLabel": "法律上の",
      "resources": "無料ツール",
      "product": "製品",
      "rights": "© 2026 MapsGrab.無断転載を禁じます。",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID ファインダー",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "レビューリンクジェネレーター",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "メールチェッカー",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "緯度経度からDMSへのコンバーター",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS から 10 進数へのコンバーター",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "一括キーワードジェネレーター",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "CSV ファイルをオンラインで結合",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "今すぐインストール",
    "comingSoon": "近日公開",
    "themeLabel": "カラーテーマ",
    "themeLight": "ライト",
    "themeDark": "暗い",
    "themeSystem": "システム",
    "faqLabel": "よくある質問",
    "breadcrumbLabel": "ブレッドクラム",
    "languageSwitcherLabel": "言語スイッチャー",
    "mobileMenuLabel": "メニューの切り替え",
    "copied": "クリップボードにコピーされました",
    "cancel": "キャンセル",
    "continue": "続く"
  },
  "dashboard": {
    "create": {
      "title": "オンラインスクレイパー",
      "newTask": "新しいタスク",
      "modeLabel": "検索モード",
      "modes": {
        "keywords": "キーワード",
        "map": "地図",
        "regions": "地域"
      },
      "keywords": "キーワード",
      "regionsCta": "地域からクエリを作成",
      "placeholder": "ポートランドのコーヒーショップ\nオースティンのレストラン",
      "count": "{count} / {limit} キーワード",
      "duplicates": "重複行を除外しました：{count}",
      "contacts": "メールやソーシャルプロフィールを検索する",
      "contactsPaid": "有料オンラインプランでご利用いただけます。",
      "usage": "今月の{used} / {total} の記録",
      "reset": "月間クォータは毎月1日（ニューヨーク時間）にリセットされます。",
      "loading": "制限を読み込んでいます...",
      "optionsFailed": "タスク制限を読み込めませんでした。再試行してください。",
      "submit": "データ収集を開始",
      "submitting": "送信中...",
      "submitted": "タスクを送信しました",
      "failed": "タスクの送信に失敗しました。再試行する前に履歴を更新してください。",
      "exhausted": "毎月の割り当てがなくなりました。",
      "invalid": "キーワードを {limit} 文字以内で入力します。各キーワードは 500 文字以内です。",
      "map": {
        "invalidKeyword": "500 文字以内のキーワードを 1 つ入力してください。",
        "keyword": "キーワード",
        "keywordPlaceholder": "例：コーヒーショップ",
        "locationSearch": "地域を検索",
        "locate": "地域で指定",
        "locationPlaceholder": "国 / 州 / 都市を選択",
        "coordinates": "座標を入力",
        "latitude": "緯度",
        "longitude": "経度",
        "radius": "半径 (km)",
        "spacing": "グリッド間隔 (km)",
        "sampleCount": "{count} / {limit} 場所を検索",
        "points": "グリッドポイント：{points}",
        "overLimit": "検索位置が {limit} 以内に収まるように、半径を減らすかグリッドの間隔を広げます。",
        "chooseCenter": "地域を選択するか、地図をクリックして中心を設定します。",
        "mapLabel": "地図上で検索センターを選択してください",
        "tilesUnavailable": "マップ タイルを読み込めませんでした。座標を入力することもできます。",
        "attribution": "OpenStreetMap 投稿者"
      },
      "region": {
        "baseKeywords": "ベースキーワード",
        "basePlaceholder": "コーヒーショップ\nレストラン",
        "country": "国",
        "state": "州または地域",
        "citySearch": "都市を探す",
        "cityPlaceholder": "任意：都市を選択",
        "city": "市",
        "selectCountry": "国を選択してください",
        "allStates": "すべての州または地域",
        "loading": "場所を読み込んでいます...",
        "loadFailed": "場所を読み込めませんでした。再試行してください。",
        "retry": "リトライ",
        "filter": "絞り込み",
        "selectAll": "すべて選択（{count}）",
        "clear": "選択解除",
        "selectedCount": "{count} 件選択",
        "more": "{total} 件中 {shown} 件を表示しています。入力して絞り込んでください。",
        "selectedRegions": "選択された場所",
        "remove": "{name} を削除",
        "noMatch": "一致する項目がありません",
        "matchMode": "検索語句",
        "inMode": "で",
        "nearMode": "近く",
        "generate": "クエリの生成",
        "needBase": "先に基本キーワードを入力してください。",
        "needCountry": "先に国を選択してください。",
        "willGenerate": "{count} 件のクエリを作成します。",
        "finalQueries": "最終的なクエリ",
        "finalPlaceholder": "生成されたクエリがここに表示されます。編集することができます。",
        "attribution": "位置データ：GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "ダッシュボード | MapsGrab",
      "description": "MapsGrab エクスポート、API アクセス、サブスクリプションを 1 つのワークスペースで管理します。"
    },
    "shell": {
      "skipToContent": "メインコンテンツへスキップ",
      "sideLabel": "ワークスペース",
      "homeLabel": "MapsGrab ホーム",
      "navLabel": "ワークスペースメニュー",
      "loading": "ワークスペースを読み込んでいます...",
      "retry": "リトライ",
      "navOnline": "オンラインスクレイパー",
      "navJobHistory": "履歴",
      "navApi": "API 管理",
      "navSubscriptions": "定期購入",
      "openMenu": "ワークスペースメニューを開く",
      "closeMenu": "ワークスペースメニューを閉じる",
      "collapseSidebar": "サイドバーを折りたたむ",
      "expandSidebar": "サイドバーを展開",
      "back": "戻る"
    },
    "account": {
      "menuButtonLabel": "アカウントメニューを開く",
      "menuLabel": "アカウントメニュー",
      "logout": "ログアウト",
      "upgrade": "アップグレード",
      "usageShort": "{used} / {total} 件のレコード",
      "planUnavailable": "利用不可",
      "theme": "テーマ",
      "themeLight": "ライト",
      "themeDark": "ダーク",
      "themeSystem": "システム",
      "language": "言語"
    },
    "history": {
      "title": "オンラインエクスポート履歴",
      "description": "オンライン スクレイパーで実行したタスク (最新のものから順)。",
      "refresh": "リフレッシュ",
      "autoRefresh": "自動更新中",
      "loading": "エクスポートをロードしています...",
      "loadFailed": "エクスポート履歴をロードできませんでした。",
      "refreshFailed": "更新できませんでした。前回読み込んだ結果を表示しています。",
      "retry": "リトライ",
      "emptyTitle": "まだエクスポートはありません",
      "emptyHint": "オンラインスクレイパー でタスクを実行すると、ここに表示されます。",
      "emptyCta": "オンラインスクレイパーへ移動",
      "recentTitle": "最近のタスク",
      "viewAll": "すべて表示",
      "recentEmptyHint": "上で開始したタスクがここに表示されます。",
      "noMatchTitle": "一致するタスクはありません",
      "noMatchHint": "別のタスク番号やキーワードを試すか、フィルターをクリアしてください。",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "ほか {count} 件",
      "columns": {
        "taskNo": "タスク",
        "createdAt": "作成日時",
        "samples": "検索",
        "records": "記録",
        "status": "状態"
      },
      "status": {
        "queued": "キューに入れられました",
        "collecting": "収集",
        "publishing": "CSV を準備しています",
        "completed": "完了",
        "partial": "部分的に成功",
        "failed": "失敗した"
      },
      "search": {
        "label": "タスクを検索",
        "placeholder": "タスク番号またはキーワードで検索",
        "clear": "検索をクリア"
      },
      "filters": {
        "label": "タスクを絞り込む",
        "button": "フィルター",
        "status": "ステータス",
        "all": "すべて",
        "running": "実行中",
        "clear": "フィルターをクリア"
      },
      "range": {
        "label": "期間",
        "last7": "過去 7 日間",
        "last30": "過去 30 日間",
        "all": "全期間",
        "custom": "カスタム期間",
        "from": "開始日",
        "to": "終了日",
        "apply": "適用",
        "invalid": "開始日は終了日以前の日付を選んでください。"
      },
      "pagination": {
        "label": "ページ送り",
        "previous": "前の",
        "next": "次",
        "page": "{page} ページ",
        "pageSize": "1 ページの行数",
        "summary": "{from}–{to}/{total}"
      },
      "detail": {
        "show": "詳細",
        "loading": "検索を読み込んでいます...",
        "loadFailed": "このタスクの検索をロードできませんでした。",
        "keyword": "キーワード",
        "records": "記録",
        "runNo": "走る",
        "startedAt": "開始日時",
        "finishedAt": "終了日時",
        "contacts": "メールとソーシャルプロフィール",
        "contactsEnabled": "このタスクに対して有効になっています",
        "contactsDisabled": "このタスクではオフです",
        "completed": "完了",
        "pending": "保留中",
        "viewport": "{lat}、{lng} · ズーム {zoom}"
      },
      "copyJob": "タスク番号をコピー",
      "dedupeHint": "レコード数はタスク全体で重複を除いた件数です。",
      "finished": "タスク {job}：{status}",
      "finishedRecords": "{count} 件のレコード",
      "downloadCsv": "CSVをダウンロード",
      "downloadXlsx": "Excel をダウンロード",
      "noFile": "いいえ CSV",
      "errors": {
        "31301": "この検索を収集できませんでした。",
        "31302": "一部の結果は利用できません。配信された行は保持されます。",
        "31303": "コレクターは忙しいです。もう一度やり直してください。",
        "31304": "このエクスポートを公開できませんでした。"
      },
      "errorFailed": "この検索を完了できませんでした。",
      "downloading": "準備中...",
      "downloadUnavailable": "ダウンロード可能な CSV はありません。ファイルの有効期限が切れている可能性があります。",
      "downloadFailed": "ダウンロードを開始できませんでした。もう一度試してください。",
      "signInPrompt": "サインインすると、オンライン エクスポート履歴が表示されます。",
      "signInCta": "サインイン",
      "unreachable": "現在 MapsGrab に到達できませんでした。"
    },
    "api": {
      "description": "API キー、毎月のリクエスト許容量、接続されている AI アプリを管理します。",
      "docsLink": "API 製品を見る",
      "signInPrompt": "サインインして、API のアクセスを管理します。",
      "loading": "API アクセスを読み込んでいます...",
      "loadFailed": "API アクセスを読み込めませんでした。もう一度試してください。",
      "retry": "リトライ",
      "refresh": "リフレッシュ",
      "keyTitle": "API キー",
      "keyEmpty": "API キーはまだ生成されていません。",
      "generateKey": "API キーを生成します",
      "rotateKey": "API キーを置き換えます",
      "generatingKey": "生成中...",
      "keyOnce": "このキーを今すぐコピーしてください。このページを離れるか更新すると、再度表示することはできなくなります。",
      "keyCreated": "作成されました",
      "rotateTitle": "API キーを交換しますか?",
      "rotateMessage": "現在のキーはすぐに機能しなくなります。それを使用するアプリを新しいキーで更新します。",
      "cancel": "キャンセル",
      "copyKey": "API キーをコピーします",
      "copied": "コピーされました",
      "copyFailed": "コピーできませんでした。テキストを選択して手動でコピーします。",
      "keyFailed": "API キーを生成できませんでした。もう一度試してください。",
      "usageTitle": "月間 API の使用量",
      "usageFailed": "API の使用状況を読み込めませんでした。もう一度お試しください。",
      "usageValue": "{used} / {total} リクエスト",
      "usagePeriod": "期間: {period}",
      "quotaExhausted": "毎月のリクエスト枠がなくなりました。",
      "quotaReset": "毎月1日にリセット（ET）· API と MCP で共通",
      "planTitle": "API プラン",
      "managePlan": "サブスクリプションを管理する",
      "connectionsTitle": "接続",
      "connectTabsLabel": "接続方法",
      "connectDocs": {
        "api": "API リファレンス",
        "mcp": "MCP 設定ガイド",
        "mcpKey": "API キー設定ガイド"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + API キー"
      },
      "apiUrl": "API ベース URL",
      "mcpUrl": "MCP サーバー URL",
      "mcpHint": "この URL を MCP クライアントに追加します。この Web サイトを開いたときにサインインして接続を承認します。",
      "mcpKeyHint": "ブラウザでサインインできないクライアント向けです。リクエストは API キーで認証され、接続の承認は不要です。",
      "mcpConfigTitle": "クライアント設定",
      "mcpConfigHint": "このエントリを MCP クライアントの設定に追加してください。フィールド名はクライアントによって多少異なります。",
      "mcpUnavailable": "MCP 接続アドレスはまだ利用できません。",
      "copyUrl": "URLをコピー",
      "curlTitle": "クイックスタート",
      "curlHint": "プレースホルダーを完全な API キーに置き換えてください。",
      "grants": {
        "title": "接続されたアプリ",
        "description": "API の許可を使用して、ビジネスを検索したり、レビューや公開写真を読んだりすることを許可したアプリ。",
        "loading": "接続されているアプリを読み込んでいます...",
        "empty": "接続されているアプリはありません。",
        "loadFailed": "接続されているアプリを読み込めませんでした。もう一度試してください。",
        "selfDeclared": "アプリ自体に付ける名前: {name}",
        "createdLabel": "接続済み",
        "refreshedLabel": "最終更新日",
        "notRefreshed": "まだ",
        "revoke": "切断する",
        "revokeTitle": "このアプリを切断しますか?",
        "revokeMessage": "{host} はすぐにアクセスできなくなり、再度接続するには承認が必要になります。",
        "revokeFailed": "このアプリを切断できませんでした。もう一度試してください。",
        "paginationLabel": "接続されたアプリのページ",
        "pageOf": "{pages} の {page} ページ"
      }
    },
    "subscriptions": {
      "title": "定期購入",
      "description": "オンラインスクレイパー、ブラウザ拡張機能、および API の計画と更新ステータス。価格ページで購入またはアップグレードしてください。",
      "lines": {
        "online": "オンラインスクレイパー",
        "extension": "ブラウザ拡張機能",
        "api": "API"
      },
      "planLabel": "プラン",
      "expiresLabel": "更新/有効期限切れ",
      "free": "無料",
      "unavailable": "一時的に利用できません",
      "autoRenewOn": "自動更新オン",
      "autoRenewOff": "自動更新オフ",
      "paidVia": "支払い方法：{method}",
      "subscribeCta": "プランを選択してください",
      "pricingLink": "料金を見る",
      "manageSubscription": "サブスクリプションの管理",
      "managingSubscription": "オープニング...",
      "manageFailed": "サブスクリプション管理を開けませんでした。もう一度お試しください。",
      "signInPrompt": "サインインしてサブスクリプションを確認します。"
    },
    "cancelGuide": {
      "title": "支払いプロバイダーでサブスクリプションを管理する",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "PayPal にサインインし、[設定] を開きます。",
            "「支払い」、「自動支払い」の順に移動します。",
            "MapsGrab を選択し、キャンセルを選択します。"
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "購入メールにあるカスタマー ポータルのリンクを開きます。",
            "サインインして、MapsGrab サブスクリプションを選択します。",
            "「キャンセル」を選択します。"
          ]
        }
      ],
      "closeLabel": "近い"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Google Maps ビジネス データを CSV および JSON に取得します",
        "description": "MapsGrab は、名前、電話番号、レビュー、写真、電子メールなど、公開されているビジネス情報を Google Maps から収集し、それを CSV または JSON にエクスポートするブラウザ拡張機能および Web ツールキットです。"
      },
      "hero": {
        "announce": {
          "badge": "新しい",
          "text": "AI エージェント用の MCP サーバー"
        },
        "title": {
          "firstLine": "Google Maps のデータを",
          "secondLine": "",
          "accent": "ワンクリックで取得",
          "end": ""
        },
        "lead": "名前、電話番号、ウェブサイト、レビュー、写真、メールなど、公開されているビジネス データを Google Maps から収集し、数秒でクリーンな CSV または JSON をエクスポートします。",
        "search": {
          "label": "検索キーワード",
          "typing": [
            "ポートランドのコーヒーショップ",
            "テキサス州オースティンの歯科医",
            "シカゴ近くの配管工",
            "ブルックリンのヨガスタジオ",
            "マイアミビーチのホテル"
          ],
          "submit": "結果のプレビュー",
          "loading": "検索中…",
          "suggestLabel": "試す",
          "suggestions": [
            "ポートランドのコーヒーショップ",
            "テキサス州オースティンの歯科医",
            "シカゴ近くの配管工"
          ]
        },
        "trust": [
          "クレジットカードは必要ありません",
          "{records} 無料レコード/月",
          "CSV & JSON エクスポート"
        ],
        "dashboard": "オンラインスクレイパーを開く",
        "theater": {
          "panelLabel": "MapsGrab パネルのプレビュー",
          "extensionActive": "MapsGrab 拡張機能がアクティブです",
          "mapFilters": [
            "今すぐオープン",
            "最高評価",
            "価格"
          ],
          "live": "ライブ",
          "done": "終わり",
          "start": "データ収集を開始",
          "pause": "一時停止",
          "extracting": "{count} を抽出中…",
          "finished": "完了 · {count} か所",
          "kpis": {
            "phones": "電話",
            "emails": "電子メール",
            "websites": "ウェブサイト"
          },
          "export": "詳細リストのエクスポート - {count} (.CSV)",
          "exportSaved": "エクスポートが保存されました",
          "emailFound": "メールが見つかりました",
          "averageRating": "平均評価",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} レビュー"
        },
        "preview": {
          "title": "結果",
          "count": "最初の結果ページに {count} の企業が表示されます",
          "columns": {
            "name": "名前",
            "address": "住所",
            "category": "カテゴリ",
            "rating": "評価",
            "reviews": "レビュー",
            "phone": "電話"
          },
          "locked": "オンラインスクレイパー にサインインしてキーワードを送信し、結果を収集してエクスポートします。",
          "signIn": "サインインして完全なタスクを開始する",
          "failed": "プレビューを読み込めませんでした。もう一度試してください。",
          "empty": "最初の結果ページにはビジネスが見つかりませんでした。"
        }
      },
      "facts": {
        "caption": "MapsGrab 数字で見る",
        "items": [
          {
            "value": 36,
            "label": "ビジネスごとのデータ列"
          },
          {
            "value": 11,
            "label": "レビューフィールド、所有者の返信が含まれます"
          },
          {
            "value": 6,
            "label": "Web サイトごとに一致するソーシャル ネットワーク"
          },
          {
            "value": "freeRecords",
            "label": "無料レコード、毎月"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "実行方法: 拡張機能、オンライン、API — プラス MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "仕組み",
          "title": {
            "lead": "地図検索から",
            "accent": "スプレッドシート",
            "tail": "までの3ステップ"
          },
          "lead": "コードもコピー＆ペーストも不要です。 MapsGrab は、Google Maps がすでに表示しているものを読み取り、それを構造化された行に変換します。"
        },
        "steps": [
          {
            "title": "Google Mapsを検索",
            "body": "Google Maps を開いて、通常とまったく同じように、あらゆる業種と場所を検索します。"
          },
          {
            "title": "データ収集を開始",
            "body": "{action} をクリックします。 MapsGrab は結果をスクロールし、リストを収集し、有効にすると連絡先を強化します。",
            "action": "データ収集を開始"
          },
          {
            "title": "どこでもエクスポート",
            "body": "選択した列を含む CSV または JSON をダウンロードします。レビューと写真は独自のファイルに保存され、Excel または CRM で使用できるようになります。"
          }
        ],
        "searchSample": "シアトルのパン屋さん",
        "columnsUnit": "列",
        "reviewsFile": "レビュー"
      },
      "products": {
        "head": {
          "kicker": "製品",
          "title": {
            "lead": "地図データを",
            "accent": "取得する",
            "tail": "3つの方法"
          },
          "lead": "ブラウザ拡張機能、クラウドベースのオンライン スクレイパー、または API を選択します。この拡張機能は独自のブラウザ内で動作します。 オンラインスクレイパー と API は 1 つのクラウド エンジンを共有します。"
        },
        "cards": {
          "extension": {
            "badge": "ブラウザ拡張機能",
            "title": "Google Maps を閲覧中にデータを取得します",
            "body": "開いたマップ ページからビジネス データ、レビュー、写真を抽出し、すべてをローカルにエクスポートします。エッジ、Firefox と Chromium。",
            "link": "拡張機能を探索する"
          },
          "online": {
            "badge": "オンラインスクレイパー",
            "title": "クラウドが走ります。インストールするものは何もありません。",
            "body": "キーワードを貼り付け、クラウドでビジネスの詳細を収集し、タスクごとに重複排除された 1 つの 37 列 CSV をダウンロードします。",
            "link": "オンラインスクレイパーを探索する"
          },
          "api": {
            "badge": "API",
            "title": "HTTP 上で JSON をクリーンアップします",
            "body": "独自のアプリケーションのビジネス データとレビュー — 1 つの API キー。",
            "link": "API を探索する"
          },
          "mcp": {
            "badge": "MCP サーバー",
            "title": "AI エージェントのライブ マップ データ",
            "body": "Claude Code、Cursor、VS Code、Codex の MCP ツールとして検索およびレビューします。",
            "link": "MCP サーバーを探索する"
          }
        },
        "extracting": "{count} を抽出中…",
        "queue": {
          "rows": "{count} 行",
          "processing": "処理"
        },
        "chat": {
          "prompt": "ウェブサイトで 4.5+ と評価されたオースティンの歯科医を探す",
          "answer": "{count} 件の一致が見つかりました。上位 3 つ:"
        }
      },
      "fields": {
        "head": {
          "kicker": "データ",
          "title": {
            "lead": "36 列。 ",
            "accent": "どれも",
            "tail": "役に立ちます。"
          },
          "lead": "この拡張機能は、検索結果とビジネス ページから 1 つのスキーマ (連絡先の詳細、場所、プロフィール、評価、および後でレコードを照合するために必要なすべての識別子) をエクスポートします。"
        },
        "filtersLabel": "フィールドグループ",
        "all": "全て",
        "groups": {
          "contact": {
            "filter": "接触",
            "label": "接触"
          },
          "location": {
            "filter": "位置",
            "label": "位置"
          },
          "profile": {
            "filter": "プロフィール",
            "label": "事業概要"
          },
          "reviews": {
            "filter": "評価",
            "label": "評価とレビュー"
          },
          "ids": {
            "filter": "IDとリンク",
            "label": "IDとリンク"
          }
        },
        "sampleLabel": "サンプル値",
        "emptySample": "（空の）",
        "descriptions": {
          "Name": "事業名はリストに表示されているとおりです。",
          "Description": "ビジネスプロフィールからの簡単な説明。",
          "Fulladdress": "完全な形式の住所。",
          "Street": "住所の番地。",
          "Municipality": "都市または地域。",
          "Categories": "ビジネスに割り当てられたすべてのカテゴリ。",
          "About": "[バージョン情報] タブの属性。",
          "Plus Code": "オープン ロケーション コード用に予約されている列 — 現時点では空でエクスポートされています。",
          "Time Zone": "場所の IANA タイムゾーン。",
          "Price": "リストに表示されている価格レベル。",
          "Note": "販売者のメモまたはハイライト。",
          "Amenities": "アメニティとサービスのオプション。",
          "Hotel Class": "宿泊施設リストのスタークラス。",
          "Phone": "リストに表示されている主な電話番号。",
          "Phones": "ビジネスで見つかったすべての電話番号。",
          "Claimed": "所有者がプロファイルを要求したかどうか。",
          "Owner": "プロフィールにオーナー名。",
          "Owner Id": "所有者アカウントの投稿者 ID。",
          "Owner Link": "所有者の寄稿者ページへのリンク。",
          "Email": "ビジネス Web サイトにある電子メール アドレス。",
          "Social Medias": "Web サイトからリンクされたソーシャル プロフィール。",
          "Review Count": "レビューの合計数。",
          "Average Rating": "平均的な星評価。",
          "Review URL": "レビューパネルへの直接リンク。",
          "Google Maps URL": "CID から構築された安定した短いリンク。",
          "Google Knowledge URL": "ナレッジパネルの検索リンク。",
          "Latitude": "緯度を 10 進数で表します。",
          "Longitude": "経度を 10 進数で表します。",
          "Website": "公式サイトはリストから。",
          "Domain": "Webサイトの登録可能なドメイン。",
          "Opening Hours": "毎週の営業時間、休業日がマークされています。",
          "Featured Image": "リストのカバー写真 URL。",
          "Cid": "顧客 ID — FID の 10 進数形式。",
          "Fid": "2 つの 16 進数の半分で構成される機能 ID。",
          "Place Id": "安定のGoogle Place ID。",
          "Kgmid": "ナレッジグラフのマシンID。"
        },
        "reviews": {
          "title": "+ 11 レビュー列",
          "body": "個別にエクスポートされ、プランの制限までページ分割されます。"
        },
        "photos": {
          "title": "+ 写真 URL リスト",
          "body": "ビジネスごとに公開アルバム写真 URLs、ストリート ビューは除外されました。"
        },
        "sampleCsv": "サンプルをダウンロード CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "エンリッチメント",
          "title": {
            "lead": "ピンから人に",
            "accent": "メール",
            "tail": " を送信できます"
          },
          "lead": "エンリッチメントがオンになっている場合、MapsGrab は各ビジネスの公式 Web サイトをチェックし、抽出中に直接連絡先チャネルを入力します。"
        },
        "points": [
          "ビジネス Web サイトで見つかった電子メール アドレス",
          "ソーシャルプロフィール: Facebook、Instagram、LinkedIn、X、YouTube、TikTok",
          "有料オンライン プランではデフォルトでオンになっており、拡張機能の 1 つの設定",
          "1 つのフラグを持つ API 検索応答に含まれる - 個別のエンリッチメント手順なし"
        ]
      },
      "developers": {
        "head": {
          "kicker": "開発者向け",
          "title": {
            "lead": "あなたが構築する ",
            "accent": "あらゆるもの",
            "tail": " にマップ データを接続します"
          },
          "lead": "オンラインスクレイパー の背後にあるクラウド エンジン。HTTP API および MCP サーバーとして公開されます。構造化された JSON、キーは 1 つ、解析する HTML はありません。"
        },
        "listLabel": "開発者向け製品",
        "items": {
          "search": {
            "title": "スクレイピング API",
            "description": "あらゆるキーワードと場所に対応するビジネス"
          },
          "reviews": {
            "title": "レビュー API",
            "description": "評価、テキスト、所有者の返信"
          },
          "photos": {
            "title": "写真 API",
            "description": "公開写真 1 ビジネスあたり URLs"
          },
          "mcp": {
            "title": "MCP サーバー",
            "description": "あらゆる MCP クライアント向けの検索およびレビュー ツール"
          }
        },
        "langLabel": "言語",
        "copyLabel": "コピーリクエスト",
        "sending": "リクエストを送信中…",
        "response": "応答 · 200 OK · {ms} ミリ秒",
        "toolCall": "ツール呼び出し · {tool} · 200 OK",
        "exploreApi": "API を探索する",
        "apiPricing": "API 価格",
        "worksWith": "すでに使用しているツールと連携",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "マイクロソフトエクセル",
          "CSV",
          "JSON",
          "ZIP バンドル"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "ユースケース",
          "title": {
            "lead": "",
            "accent": "後",
            "tail": "の検索のために作られました"
          }
        },
        "cards": [
          {
            "label": "リードジェネレーション",
            "title": "ローカルリードリスト",
            "body": "カテゴリと都市を検索し、電話、Web サイト、電子メールを含む結果ページ全体を 1 つのスプレッドシートにエクスポートします。"
          },
          {
            "label": "ローカルSEO",
            "title": "競合他社のベンチマーク",
            "body": "1 つのパスでエリア内のすべての競合他社の評価とレビュー数を取得し、エクスポートから直接レポートを作成します。"
          },
          {
            "label": "市場調査",
            "title": "位置データセット",
            "body": "すべての支店または競合他社の場所の場所 ID と座標を収集し、マッピングおよびルーティング ツールで使用できるようにします。"
          }
        ],
        "leadTags": [
          "電子メール",
          "電話",
          "電子メール",
          "サイト"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "価格設定",
          "title": {
            "lead": "無料で始めましょう。それが報われるとき、",
            "accent": "スケール",
            "tail": "。"
          },
          "lead": "すべての製品には、時間制限のない無料利用枠があります。実際に使用する Surface のみをアップグレードしてください。"
        },
        "lines": {
          "extension": {
            "title": "ブラウザ拡張機能",
            "billing": "毎月",
            "link": "拡張計画を見る"
          },
          "online": {
            "title": "オンラインスクレイパー",
            "billing": "一度",
            "link": "オンラインプランを見る"
          },
          "api": {
            "title": "API & MCP",
            "billing": "一度",
            "link": "API プランを参照"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "無料ツール",
          "title": {
            "lead": "マップ ",
            "accent": "パワー ユーザー",
            "tail": " のための小さなツール"
          },
          "lead": "完全にブラウザ内で実行される 7 つのユーティリティ。貼り付けた内容がデバイスから離れることはありません。ただしメールチェッカーは例外で、検証のためにアドレスを当社のサーバーへ送信します。"
        },
        "descriptions": {
          "place-id-finder": "マップの場所 URL を貼り付け、その Place ID、CID、FID を読み上げます。",
          "review-link-generator": "あらゆるビジネスの「レビューを書く」リンクを直接取得します。",
          "email-checker": "メールアドレスが実際にメールを受信できるかを確認します。",
          "lat-long-to-dms": "度、分、秒を表す 10 進数の座標。",
          "dms-to-dd": "DMS の座標はきれいな 10 進度に戻ります。",
          "bulk-keywords-generator": "すべての「キーワード + 場所」の組み合わせを貼り付ける準備ができています。",
          "merge-csv": "CSV エクスポートをヘッダーで揃えて 1 つのファイルに結合します。"
        },
        "more": "さらに多くのツールが準備中です"
      },
      "faq": {
        "kicker": "よくある質問",
        "title": {
          "lead": "",
          "accent": "よくある質問",
          "tail": ""
        },
        "lead": "短い答え。それ以外の場合は、メール 1 通でサポートが受けられます。",
        "contact": "サポートに連絡する",
        "items": [
          {
            "question": "MapsGrabは無料で使用できますか?",
            "answer": "はい。この拡張機能はアカウントなしで機能し、レコードの毎月の無料割り当てが含まれています。 「価格」ページの有料プランでは、さらに必要な場合に制限が引き上げられます。"
          },
          {
            "question": "どのブラウザがサポートされていますか?",
            "answer": "拡張機能ページからMapsGrabをダウンロードします。 Chrome、Edge および Brave は、解凍された ZIP をロードします。 Firefox は、再起動後に再ロードする必要がある別の一時アドオンを使用します。このページには、インストールとアップデートの手順が含まれています。"
          },
          {
            "question": "データはどこから来たのか、収集することは合法ですか?",
            "answer": "MapsGrab は、アクセスした Google Maps ページに公開されている情報のみを収集します。これは、すべての訪問者が読むことができるのと同じ詳細です。当社は、プライベートアカウント、ゲートされたコンテンツ、または非公開データにはアクセスしません。"
          },
          {
            "question": "Web ツール用に何かをインストールする必要がありますか?",
            "answer": "いいえ、無料の Web ツールは完全にブラウザ内で実行されます。入力がデバイスから離れることはありません。ただしメールチェッカーは例外で、入力したアドレスを当社のサーバーへ送信し、メール検証サービスが確認します。メールが送信されることはありません。"
          },
          {
            "question": "どのような形式にエクスポートできますか?",
            "answer": "エクスポートは、選択したフィールド選択を使用して、CSV または JSON として行われ、Place ID によって重複が排除されます。"
          },
          {
            "question": "MapsGrab は私が収集したデータを参照しますか?",
            "answer": "設定と結果はブラウザーにローカルに保存されます。当社のサーバーは、リモート構成、アカウントとクォータのステータス、オプションの電子メール/ソーシャル エンリッチメント、および最小限の使用ログのみを処理します。"
          }
        ]
      },
      "cta": {
        "kicker": "始めましょう",
        "title": {
          "lead": "",
          "accent": "分",
          "tail": " 後に取得を開始します"
        },
        "lead": "拡張機能をインストールし、Google Maps を開き、最初のリストを検索してエクスポートします。アカウントは必要ありません。",
        "install": "MapsGrab を無料でインストール",
        "online": "オンラインスクレイパーを試してみる",
        "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab、Chrome、エッジおよびFirefox — Google Maps エクストラクター拡張",
        "description": "Google Maps からビジネス データ、レビュー、写真の 36 列を抽出し、電子メールやソーシャル リンクでレコードを強化し、バッチ タスクを実行して、CSV または JSON にエクスポートします。"
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Chrome、Edge、Firefox 用のダウンロード"
        },
        "title": {
          "lead": "",
          "accent": "ブラウザ",
          "tail": " の Google Maps エクストラクター"
        },
        "lead": "Google Maps の検索またはビジネス ページを開いて、そこに公開されているもの (ビジネス データ、レビュー、写真、連絡先の詳細など) を取得します。すべてはブラウザから直接 CSV または JSON にエクスポートされます。",
        "downloadCta": "Chrome および Edge 用のダウンロード",
        "installCta": "インストールガイド",
        "meta": [
          "アカウントは必要ありません",
          "1,000 無料レコード/月",
          "エクスポートはマシン上に残ります"
        ],
        "theater": {
          "panelLabel": "MapsGrab パネルのプレビュー",
          "extensionActive": "MapsGrab はこのページでアクティブです",
          "dock": "ドック左/右",
          "filters": [
            "今すぐオープン",
            "最高評価",
            "価格"
          ],
          "open": "開ける",
          "closes": "閉店 {time}",
          "endOfList": "リストの最後に到達しました。",
          "start": "データ収集を開始",
          "extracting": "{count} を抽出中…",
          "pause": "一時停止",
          "complete": "抽出が完了しました。",
          "reset": "リセット",
          "kpis": {
            "phones": "電話",
            "websites": "ウェブサイト",
            "emails": "電子メール"
          },
          "exportCta": "詳細リストのエクスポート - {count} (.CSV)",
          "saved": "ダウンロードに保存されました",
          "scrollChip": {
            "label": "自動スクロール",
            "value": "人間のペース、5–10 秒"
          },
          "dedupeChip": {
            "label": "重複排除済み",
            "value": "Place ID によって"
          }
        }
      },
      "facts": {
        "caption": "拡張機能の概要",
        "items": [
          {
            "value": 36,
            "label": "ビジネスごとの列 (名前から Place ID まで)"
          },
          {
            "value": 11,
            "label": "レビュー欄、所有者の返信が含まれます"
          },
          {
            "value": 6,
            "label": "Web サイトごとに一致するソーシャル ネットワーク"
          },
          {
            "value": 1000,
            "label": "毎月無料のレコード、アカウントは必要ありません"
          },
          {
            "value": 500,
            "label": "バッチタスクごとにキーワードまたはレビュー URLs"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "どこで機能するか",
          "title": {
            "lead": "",
            "accent": "マップビュー",
            "tail": "ごとに 1 つのパネル"
          },
          "lead": "MapsGrab パネルが Google Maps のすぐ上に表示されます。検索結果、ビジネス ページ、保存されたリストには、それぞれ適切な抽出モードが適用されます。コピーアンドペーストやタブのジャグリングは必要ありません。"
        },
        "search": {
          "title": "検索結果",
          "description": "検索時に [抽出開始] を押します。 MapsGrab は、人間のペースで結果リストをスクロールし、ロード時に各リストを収集します。"
        },
        "place": {
          "title": "ビジネスページ",
          "description": "ビジネス ページでは、[レビューと写真] タブでレビューとフォト アルバムをページできます。レビューは 11 列、写真は URL リストとしてエクスポートされます。",
          "tabs": [
            "概要",
            "レビューと写真"
          ],
          "reviewsCta": "レビューの抽出を開始する",
          "photosCta": "写真の抽出を開始します",
          "reviewsCount": "{count} レビュー",
          "photosCount": "{count} 写真"
        },
        "saved": {
          "title": "保存されたリスト",
          "description": "保存されたリストを開き、「開始」を 1 回押します。 MapsGrab は各場所を順番に開いて収集します。アイテムごとにクリックする必要はありません。",
          "listName": "お気に入り · {count} 場所"
        }
      },
      "features": {
        "head": {
          "kicker": "特徴",
          "title": {
            "lead": "マップ ページに表示されるすべて、",
            "accent": "構造化",
            "tail": ""
          },
          "lead": "検索結果とビジネス ページにわたる 1 つの抽出スキーマ。現在の Google Maps インターフェースに合わせて調整され、Google が変更されるとリモートで更新されます。"
        },
        "tabsLabel": "拡張機能",
        "tabs": [
          {
            "id": "business",
            "title": "ビジネスデータ",
            "description": "ビジネスごとに 36 列。リストがスクロールするとキャプチャされます。"
          },
          {
            "id": "reviews",
            "title": "レビュー",
            "description": "所有者の返信を含むレビュー。自動的にページングされます。"
          },
          {
            "id": "photos",
            "title": "写真",
            "description": "すぐに使えるURL リストとしてのアルバム写真。"
          },
          {
            "id": "enrichment",
            "title": "電子メールとソーシャルエンリッチメント",
            "description": "公式ウェブサイトからの直接連絡チャネル。"
          },
          {
            "id": "batch",
            "title": "バッチタスク",
            "description": "キーワードやレビュー URLs の列を項目ごとに調べます。"
          },
          {
            "id": "export",
            "title": "エクスポート",
            "description": "CSV または JSON、マシンに直接保存されます。"
          }
        ],
        "business": {
          "claimed": "主張した",
          "fields": {
            "phone": "電話",
            "website": "Webサイト",
            "rating": "平均評価",
            "hours": "営業時間",
            "timeZone": "タイムゾーン",
            "coordinates": "座標",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} レビュー",
          "columns": "ビジネスごとに {count} 列",
          "reserved": "プラスコードは予約済み",
          "more": "+{count} もっと見る"
        },
        "reviews": {
          "title": "レビュー",
          "columns": "{count} 列",
          "ownerReply": "オーナーからの返答",
          "loading": "レビューの次のページを読み込んでいます"
        },
        "photos": {
          "streetView": "ストリートビュー · フィルタ済み"
        },
        "enrichment": {
          "website": "公式サイト",
          "moreNetworks": "X、YouTube、TikTokもチェック"
        },
        "batch": {
          "complete": "{count} 完了",
          "stuck": "{count} スタックしました",
          "total": "合計 {count}",
          "done": "完了 · {count}",
          "skipped": "90 秒間進捗がありません · スキップされました",
          "running": "抽出中…",
          "queued": "キューに入れられました",
          "autoExport": "タスクが完了すると自動的にエクスポートされます"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} 行 · {total} 列中 {selected} が選択されました · Place ID によって重複排除されました",
          "destinations": [
            {
              "title": "ダウンロード",
              "description": "ブラウザによって保存されました"
            },
            {
              "title": "列ピッカー",
              "description": "必要な列のみをエクスポートする"
            },
            {
              "title": "自動ダウンロード",
              "description": "抽出が完了するとすぐに保存されます"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "バッチタスク",
          "title": {
            "lead": "リストをキューに入れます。 ",
            "accent": "立ち去ってください。",
            "tail": ""
          },
          "lead": "最大 500 個のキーワードを貼り付けるか、URLs を 1 つのタスクに貼り付けます。 MapsGrab はライブ進行状況を表示しながらアイテムごとに確認し、停止しているものはスキップし、タスクが終了すると自動的にエクスポートします。"
        },
        "checks": [
          "キーワード タスクでは、キーワードごとに 1 つのマップ検索が実行されます",
          "レビュー - URL タスクがビジネスごとにレビューを収集します",
          "タスクの状態はディスクに保存されます - ブラウザの再起動後に再び取得されます",
          "最大 150 のタスクを保存、一度に 1 つのバッチを実行"
        ],
        "mock": {
          "tabs": [
            "キーワード一括データツール",
            "一括 Google レビュー抽出ツール"
          ],
          "taskName": "タスク名",
          "taskPlaceholder": "例えば100 キーワード、デザイン会社",
          "keywords": "キーワード · 1 行に 1 つ",
          "lineCount": "{count} / {limit}",
          "start": "データ収集を開始",
          "columns": {
            "task": "タスク名",
            "status": "状態",
            "actions": "アクション"
          },
          "running": "ランニング",
          "complete": "完了",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} スタック",
          "progressExported": "{done} / {total} · エクスポートされました",
          "lines": {
            "run": "抽出中…",
            "done": "完了",
            "stuck": "スタック・スキップ"
          },
          "toast": "タスク完了 — エクスポートされました",
          "chip": {
            "label": "タスクの状態",
            "value": "ディスクに保存されました"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "地元第一主義",
          "title": {
            "lead": "結果はブラウザ内に ",
            "accent": "",
            "tail": " 残ります"
          },
          "lead": "設定と結果はローカルに保存されます。当社のサーバーは、リモート構成、アカウントとクォータのステータス、オプションの電子メールとソーシャル エンリッチメント、および最小限の使用ログのみを処理します。"
        },
        "checks": [
          "エクスポートはマシン上で生成されます",
          "ファイルが保存される前に、列の選択と Place ID 重複排除がローカルで実行されます",
          "リモート構成により、Google Maps が変更されてもパネルが最新の状態に保たれます - 再インストールは不要です",
          "何かを読み取れない場合は、何も表示せずに失敗するのではなく、パネルにエラーが表示されます。"
        ],
        "diagram": {
          "browser": "お使いのブラウザ",
          "servers": "MapsGrab サーバー",
          "nodes": {
            "mapsTab": "Google Mapsタブ",
            "panel": "MapsGrab パネル",
            "storage": "ローカルストレージ",
            "exports": "あなたのエクスポート品",
            "config": "リモート構成",
            "quota": "アカウントと割り当て",
            "enrichment": "エンリッチメント"
          },
          "flows": {
            "rows": "ビジネス行",
            "rules": "ルール",
            "usage": "使用法",
            "websites": "ビジネス Web サイト → 電子メールとソーシャル"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "インストール",
          "title": {
            "lead": "",
            "accent": "MapsGrab",
            "tail": " をインストールします"
          },
          "lead": "ここから ZIP をダウンロードし、ブラウザーの手順に従ってください。 Chrome、Edge および Brave は、解凍されたフォルダーを読み込みます。 Firefox は、再起動後に再ロードする必要がある別の一時アドオンを使用します。画像をクリックするとフルサイズで表示されます。"
        },
        "zip": {
          "title": "直接インストール (リリース zip)",
          "description": "ブラウザには ZIP を選択してください。保存したフォルダーに解凍し、以下のガイドを使用してロードします。更新するには、新しい ZIP をダウンロードし、そのフォルダー内のファイルを置き換えて、拡張機能を再読み込みします。",
          "button": "Chrome、エッジ & Brave ZIP",
          "firefoxButton": "Firefox ZIP (一時的なアドオン)",
          "meta": "バージョン {version} · プレリリース"
        },
        "browserLabel": "ブラウザ",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & エッジ",
            "note": "Edge、Chrome、Brave、その他の Chromium ブラウザ",
            "steps": [
              {
                "title": "ダウンロードして解凍します",
                "description": [
                  "ダウンロード ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  "。 Windows で右クリックし、「すべて展開」を選択します。 macOS をダブルクリックします。解凍したフォルダーは保存しておいてください。"
                ],
                "shot": "MapsGrab ZIP が Chrome にダウンロードされました"
              },
              {
                "title": "拡張機能のページを開く",
                "description": [
                  "開ける ",
                  {
                    "code": "chrome://extensions"
                  },
                  " Chromeに、 ",
                  {
                    "code": "edge://extensions"
                  },
                  " エッジで、または ",
                  {
                    "code": "brave://extensions"
                  },
                  " Braveに。"
                ],
                "shot": "拡張機能管理ページ"
              },
              {
                "title": "開発者モードを有効にする",
                "description": [
                  "拡張機能ページで開発者モードをオンにします。 Chromeでは、スイッチは右上にあります。"
                ],
                "shot": "開発者モードが有効になり、「解凍された状態でロード」ボタンが表示されます"
              },
              {
                "title": "解凍したフォルダーをロードする",
                "description": [
                  "「解凍してロード」をクリックし、解凍したフォルダーを選択します。拡張子リストに「MapsGrab」が表示されます。使用するには、Google Maps 検索を開いてください。"
                ],
                "shot": "MapsGrab カードを追加して開梱した状態でロードする"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "一時的なアドオン。 Firefoxを再起動してからリロードしてください",
            "steps": [
              {
                "title": "ダウンロードして解凍します",
                "description": [
                  "ダウンロード ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  "。 Windows で右クリックし、「すべて展開」を選択します。 macOS をダブルクリックします。解凍したフォルダーは保存しておいてください。"
                ],
                "shot": "MapsGrab Firefox ZIP Firefox にダウンロードされました"
              },
              {
                "title": "デバッグページを開く",
                "description": [
                  "に移動します ",
                  {
                    "code": "about:debugging"
                  },
                  "をクリックし、左側のサイドバーでブラウザを選択します。"
                ],
                "shot": "Firefox 一時的なアドオン コントロールを含むデバッグ ページ"
              },
              {
                "title": "アドオンをロードする",
                "description": [
                  "「一時アドオンをロード…」をクリックして選択します。 ",
                  {
                    "code": "manifest.json"
                  },
                  " 解凍したフォルダの中にあります。一時的なアドオンは、Firefox の再起動時にアンロードされます。再度ロードするにはこの手順を繰り返します。"
                ],
                "shot": "MapsGrab は一時的な Firefox 拡張機能としてロードされ、バックグラウンド スクリプトが実行されます"
              }
            ]
          }
        ],
        "help": {
          "title": "取り付けトラブル？",
          "description": "ブラウザ名と何を見たのかを私たちに送ってください。ブロックを解除いたします。",
          "cta": "サポートに連絡する"
        },
        "notes": {
          "kicker": "リリースノート",
          "version": "0.1.0",
          "status": "プレリリース",
          "date": "8月2026",
          "items": [
            "MapsGrab 拡張機能の最初のプレリリース",
            "自動スクロールと 36 列スキーマを使用した Google Maps 検索抽出",
            "ビジネスページからのレビューと写真の抽出",
            "ビジネスごとの電子メールとソーシャルメディアの強化",
            "キーワードとレビュー - URL タスクをディスク上のタスク状態でバッチ処理する",
            "CSV / JSON フィールド選択と Place ID 重複排除を使用したエクスポート",
            "Microsoft Edge および Firefox 用のビルド"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "延長計画",
          "title": {
            "lead": "拡張機能 1 つ、",
            "accent": "プラン",
            "tail": " 3 つ"
          },
          "lead": "拡張機能が収集する各行 (ビジネス、レビュー、写真) は 1 つのレコードとしてカウントされます。すべてのプランにはレビュー、写真、バッチ タスクが含まれます。有料プランでは、電子メールやソーシャル エンリッチメントを含むすべての 36 列が、より多くの月次ボリュームでエクスポートされます。"
        },
        "note": "月間使用量は New York 時間後の 1 日にリセットされます。未使用のレコードはロールオーバーされません。",
        "compare": "すべてのプランを比較する"
      },
      "faq": {
        "kicker": "よくある質問",
        "title": {
          "lead": "",
          "accent": "よくある質問",
          "tail": ""
        },
        "lead": "短い答え。それ以外の場合は、メール 1 通でサポートが受けられます。",
        "contact": "サポートに連絡する",
        "items": [
          {
            "question": "拡張機能は無料で使用できますか?",
            "answer": "はい。この拡張機能はアカウントなしで動作し、毎月 1,000 件のレコードが含まれます。 [価格設定] ページの有料プランでは、電子メールとソーシャル メディアの強化を含むすべての 36 列が追加され、月間ボリュームが増加します。"
          },
          {
            "question": "どのブラウザがサポートされていますか?",
            "answer": "Chrome、Edge、Brave、およびその他の Chromium ブラウザは、ここでダウンロードされた解凍された ZIP を読み込みます。 Firefox には、一時的なロード用に別の ZIP があります。ブラウザを再起動するたびにリロードしてください。上記のインストールガイドに従ってください。"
          },
          {
            "question": "サインインする必要がありますか?",
            "answer": "いいえ。コアの抽出はアカウントなしで機能します。クォータは、サインインしているアカウントごとに、またはサインインしていない場合はブラウザー デバイスごとにカウントされます。プランを所有するアカウントでサインインすると、より大きなボリュームが適用されます。"
          },
          {
            "question": "何が記録としてカウントされますか?",
            "answer": "拡張機能が収集する各行は、検索または保存されたリストからのビジネス、レビュー、または写真など、1 つのレコードとしてカウントされます。電子メールとソーシャル エンリッチメントではレコードは追加されません。"
          },
          {
            "question": "Google Maps が変わるとどうなりますか?",
            "answer": "抽出ルールはリモート構成として出荷されるため、拡張機能を再インストールしなくても修正がパネルに届きます。ページを読み取れない場合は、何も表示せずに失敗するのではなく、パネルにエラーが表示されます。"
          },
          {
            "question": "MapsGrab は私が収集したデータを参照しますか?",
            "answer": "設定と結果はブラウザーにローカルに保存されます。当社のサーバーは、リモート構成、アカウントとクォータのステータス、オプションの電子メールとソーシャル エンリッチメント、および最小限の使用ログのみを処理します。"
          },
          {
            "question": "データはどこから来たのか、収集することは合法ですか?",
            "answer": "MapsGrab は、アクセスした Google Maps ページに公開されている情報のみを収集します。これは、すべての訪問者が読むことができるのと同じ詳細です。当社は、プライベートアカウント、ゲートされたコンテンツ、または非公開データにはアクセスしません。"
          }
        ]
      },
      "cta": {
        "kicker": "始めましょう",
        "title": {
          "lead": "最初のリストを取得します ",
          "accent": "today",
          "tail": ""
        },
        "lead": "拡張機能をインストールし、Google Maps を検索して、クリーンなスプレッドシートをエクスポートします。アカウントは必要ありません。",
        "primary": "MapsGrab をインストール",
        "secondary": "プランを比較する",
        "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
      }
    },
    "account": {
      "auth": {
        "eyebrow": "ウェブサイトへのアクセス",
        "title": "サインインしてクレジットを同期してください",
        "trigger": "サインイン",
        "modalTitle": "続行するにはサインインしてください",
        "closeLabel": "近い",
        "signedInAs": "としてサインインしました",
        "continueWithGoogle": "Google で続行します",
        "googleLoading": "Google を開いています...",
        "or": "または",
        "emailLabel": "電子メール",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "メールで続行",
        "sendCode": "コードを送信する",
        "sendingCode": "送信中...",
        "sendCodeSuccess": "確認コードが送信されました。",
        "sendAgain": "再送信",
        "codeLabel": "検証コード",
        "codePlaceholder": "123456",
        "signIn": "サインイン",
        "termsNotice": "サインインすると、次の内容に同意したことになります。",
        "termsLink": "条項",
        "privacyLink": "プライバシーポリシー",
        "logout": "ログアウト",
        "creditsLabel": "クレジット",
        "enterEmailFirst": "最初にメールアドレスを入力してください。",
        "enterEmailAndCode": "メールアドレスと確認コードの両方を入力してください。",
        "sendCodeFailed": "確認コードの送信に失敗しました。",
        "googleSignInFailed": "Google サインインに失敗しました。",
        "googleClientMissing": "Google サインインが構成されていません。",
        "signInFailed": "サインインに失敗しました。"
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "支払いがキャンセルされました",
        "canceledMessage": "この注文は支払われませんでした。このタブを閉じて、元のウィンドウで支払い方法を再度選択できます。",
        "canceledMetaDescription": "あなたの PayPal の支払いはキャンセルされました。",
        "waitingTitle": "支払いが完了しました",
        "waitingMessage": "元のタブに戻ることができます。 3 秒ごとに PayPal 確認をチェックしており、結果はここに自動的に表示されます。",
        "confirmedCreditsTitle": "クレジットを追加しました",
        "confirmedCreditsMessage": "PayPal の支払いが確認され、クレジットが追加されました。このタブを閉じて、元のウィンドウで続行できます。",
        "confirmedSubscriptionTitle": "サブスクリプションが有効になりました",
        "confirmedSubscriptionMessage": "PayPal のお支払いが確認され、MapsGrab プランが有効になっています。このタブを閉じて、元のウィンドウで続行できます。",
        "failedTitle": "支払いには注意が必要です",
        "failedMessage": "この注文を自動的に確認できませんでした。元のウィンドウに戻るか、そこで支払いステータスを更新してみてください。"
      },
      "checkin": {
        "accountButtonLabel": "アカウントメニューを開く",
        "accountMenuLabel": "アカウントメニュー"
      },
      "creditPurchase": {
        "title": "さらにクレジットを取得",
        "description": "クレジットを追加して、このワークスペースの有料機能を引き続き使用してください。",
        "successTitle": "クレジットを追加しました",
        "successDescription": "残高が更新されました。このウィンドウを閉じて続行してください。",
        "packageEyebrow": "従量課金制",
        "cardNote": "有料の Web サイト機能にはクレジットを使用します。クレジットに有効期限はありません。",
        "creditsAmount": "{credits} クレジット",
        "buyNow": "今すぐ購入",
        "selectPackage": "選択",
        "paymentMethodLabel": "支払い方法を選択してください",
        "paymentTitle": "支払い方法を選択してください",
        "selectedPackageLabel": "選択したパッケージ",
        "confirmPurchase": "支払いを続ける",
        "backToProducts": "戻る",
        "close": "近い",
        "agreementText": "購入条件、利用規約、およびプライバシー ポリシーに同意します。",
        "loadingConfigs": "クレジット パッケージを読み込んでいます...",
        "loadFailed": "クレジット パッケージのロードに失敗しました。もう一度試してください。",
        "noConfigs": "現在利用できるクレジット パッケージはありません。後でもう一度試してください。",
        "ready": "クレジット パッケージを選択します。価格は米ドルで表示されます。",
        "creatingOrder": "注文を作成中...",
        "pendingPayment": "新しく開いたタブで支払いを完了します。結果は自動的に確認されます。",
        "pendingPaymentTitle": "支払いを待っています",
        "cancelPayment": "支払いをキャンセルする",
        "supportMailPrefix": "問題を報告する: ",
        "success": "支払いが完了しました。クレジットは現在ご利用いただけます。",
        "failed": "支払いが完了していません。再試行するか、このウィンドウを閉じることができます。",
        "successCredits": "+{credits} クレジットが追加されました",
        "successBalance": "現在の残高: {balance} クレジット",
        "createFailed": "注文の作成に失敗しました。もう一度試してください。",
        "invalidPaymentData": "支払いリンクが無効です。後でもう一度試してください。",
        "priceUpdated": "価格が変更されました。最新の価格を確認して再度購入してください。",
        "gatewayFailed": "支払い入力は一時的に利用できなくなります。後でもう一度試してください。",
        "paymentCanceled": "支払いがキャンセルされました。支払い方法を選択して、もう一度お試しください。",
        "pollFailed": "支払いステータスを更新できませんでした。もう一度試してください。",
        "pollTimeout": "自動更新がタイムアウトしました。支払い後に更新ボタンを使用してください。",
        "orderNotFound": "注文はできなくなりました。新しい注文を作成します。",
        "orderExpired": "注文の有効期限が切れました。もう一度購入してください。",
        "fulfillmentFailed": "支払いは受領されましたが、クレジットはまだ追加されていません。後で再試行してください。",
        "authExpired": "サインインの有効期限が切れました。続行するには、再度サインインしてください。",
        "popupBlocked": "ブラウザが新しいウィンドウをブロックしました。 MapsGrab がポップアップを開くことを許可して、もう一度お試しください。"
      }
    },
    "pricing": {
      "seo": {
        "title": "価格 — オンライン、延長、および API プラン | MapsGrab",
        "description": "すべてのサーフェスの MapsGrab プラン: $19, ブラウザ拡張機能の $39, および $15 の API からのオンライン スクレイパー。すべての製品に無料枠が含まれています。オンラインでは 1 回限りの自然月プラン、Extension では月次サブスクリプションの API が含まれています。"
      },
      "hero": {
        "kicker": "価格設定",
        "title": {
          "lead": "マップ データを取得するための ",
          "accent": "3 つの方法",
          "tail": " の計画"
        },
        "lead": "ワークフローに合ったサーフェス (クラウド オンライン スクレイパー、ブラウザ拡張機能、または HTTP API) を選択してから、月間ボリュームを選択します。このページから数分でアップグレードまたは購入できます。",
        "meta": [
          "すべての製品の無料枠",
          "PayPal でお支払いください",
          "差額を支払ってアップグレード"
        ],
        "switchLabel": "製品ライン"
      },
      "popularLabel": "最も人気のある",
      "tabs": {
        "online": {
          "name": "オンラインスクレイパー",
          "shortName": "オンライン",
          "switchMeta": "{price} · 1 回限り",
          "unit": "記録",
          "eyebrow": "オンラインスクレイパープラン",
          "title": "クラウド抽出、記録に基づいて価格設定",
          "description": "インフラストラクチャで MapsGrab エンジンを実行します。レコードは、収集された 1 つのビジネス行です。有料プランには、追加のレコード費用なしで、オプションの電子メールとソーシャル メディアの強化が含まれます。",
          "billingChips": [
            "1回払い",
            "自然な 1 か月をカバーします",
            "自動更新なし"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "無料",
              "tagline": "クラウド スクレイパーを小規模で試してみる",
              "price": "$0",
              "periodLabel": "永遠に",
              "quota": "1,000 レコード/月",
              "features": [
                "37列CSVエクスポートによるビジネス抽出",
                "タスクごとに最大 2 のキーワード",
                "エリア検索のマップモードと地域モード",
                "有料プランでの電子メールとソーシャル エンリッチメント",
                "タスクごとに 1 つの重複排除済み CSV"
              ],
              "ctaLabel": "無料で始める",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "不定期の 1 回限りのエクスポートの場合",
              "price": "$19",
              "periodLabel": "1 回限り · 1 月",
              "quota": "20,000 レコード/月",
              "features": [
                "すべてが無料",
                "1 月の 20,000 レコード",
                "1 回限りの支払い — 自動更新なし",
                "タスクごとに最大 5 のキーワード",
                "電子メールとソーシャル エンリッチメント、デフォルトおよびオプションでオン"
              ],
              "ctaLabel": "Liteを入手",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "基本",
              "tagline": "毎週の安定したリード収集のために",
              "price": "$49",
              "periodLabel": "1 回限り · 1 月",
              "quota": "80,000 レコード/月",
              "features": [
                "Lite のすべて",
                "1 月の 80,000 レコード",
                "1 回限りの支払い — 自動更新なし",
                "タスクごとに最大 10 のキーワード"
              ],
              "ctaLabel": "基本を入手",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "成長",
              "tagline": "リードパイプラインの成長に向けて",
              "price": "$99",
              "periodLabel": "1 回限り · 1 月",
              "quota": "250,000 レコード/月",
              "features": [
                "基本のすべて",
                "1 月の 250,000 レコード",
                "1 回限りの支払い — 自動更新なし",
                "タスクごとに最大 20 のキーワード"
              ],
              "ctaLabel": "成長を遂げる",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "プロ",
              "tagline": "代理店やデータを大量に扱うチーム向け",
              "price": "$149",
              "periodLabel": "1 回限り · 1 月",
              "quota": "500,000 レコード/月",
              "features": [
                "成長のすべて",
                "1 月の 500,000 レコード",
                "1 回限りの支払い — 自動更新なし",
                "タスクごとに最大 50 のキーワード"
              ],
              "ctaLabel": "プロフェッショナルになる",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "自然 1 か月をカバーする 1 回限りの支払い — このタブのプランは自動更新されません。レコードは、Google Maps から収集された 1 つのビジネス行です。 1st の使用状況はリセットされ、未使用のレコードはロールオーバーされません。",
          "compare": {
            "lead": "オンライン スクレイパー プラン — クラウド抽出、レコードごとに価格設定されます。",
            "volume": "月ごとの記録",
            "groups": [
              {
                "label": "データ",
                "rows": [
                  {
                    "label": "37列CSVエクスポートによるビジネス抽出",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "電子メールとソーシャルエンリッチメント",
                    "cells": [
                      false,
                      "デフォルトでオン、オプション",
                      "デフォルトでオン、オプション",
                      "デフォルトでオン、オプション",
                      "デフォルトでオン、オプション"
                    ]
                  }
                ]
              },
              {
                "label": "ワークフロー",
                "rows": [
                  {
                    "label": "タスクごとのキーワード",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "マップモードと地域モード",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "タスクごとに 1 つの重複排除済み CSV",
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
            "usageNotice": "MapsGrab オンライン スクレイパーの月間レコード クォータに適用されます。",
            "successTitle": "プランが有効化されました",
            "successDescription": "1 回限りの 1 月プランが有効になりました。オンライン スクレイパーは、次回のクォータ更新時にそれを取得します。"
          }
        },
        "extension": {
          "name": "拡張機能",
          "shortName": "拡張機能",
          "switchMeta": "{price} · 1 回限り",
          "unit": "記録",
          "eyebrow": "延長計画",
          "title": "ブラウザ抽出、レコードごとに価格設定",
          "description": "拡張機能が収集する各行 (ビジネス、レビュー、写真) は 1 つのレコードとしてカウントされます。すべてのプランにはレビュー、写真、バッチ タスクが含まれます。有料プランでは、電子メールやソーシャル エンリッチメントを含むすべての 36 列がエクスポートされます。",
          "billingChips": [
            "1回払い",
            "1 のアクセス月",
            "自動更新なし"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "無料",
              "tagline": "小規模なコア抽出",
              "price": "$0",
              "periodLabel": "永遠に",
              "quota": "1,000 レコード/月",
              "features": [
                "ビジネスデータの抽出",
                "レビュー (11 コラム) と写真 URLs",
                "キーワードとレビューのバッチ処理 - URL タスク",
                "CSV / JSON フィールド選択付きエクスポート"
              ],
              "ctaLabel": "拡張機能をインストールする",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "フリーランサーと成長するリードパイプライン向け",
              "price": "$39",
              "periodLabel": "1 回限り · 1 月",
              "quota": "100,000 レコード / 月",
              "features": [
                "すべてが無料",
                "100,000 は毎月レコードを記録します",
                "完全な 36 列のビジネス抽出",
                "電子メールとソーシャルメディアの強化"
              ],
              "ctaLabel": "プロになる",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "仕事",
              "tagline": "代理店やデータを大量に扱うチーム向け",
              "price": "$99",
              "periodLabel": "1 回限り · 1 月",
              "quota": "500,000 レコード/月",
              "features": [
                "プロのすべて",
                "500,000 は毎月レコードを記録します",
                "複数市場のバッチタスクのための余地",
                "同じローカルファーストエクスポートパイプライン"
              ],
              "ctaLabel": "ビジネスを獲得する",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "拡張機能が収集する各行は、検索または保存されたリストからのビジネス、レビュー、または写真など、1 つのレコードとしてカウントされます。電子メールとソーシャル エンリッチメントではレコードは追加されません。毎月の使用量は 1st にリセットされます。未使用のレコードはロールオーバーされません。",
          "compare": {
            "lead": "拡張プラン — ブラウザ抽出、レコードによって価格設定されます。",
            "volume": "月ごとの記録",
            "groups": [
              {
                "label": "データ",
                "rows": [
                  {
                    "label": "ビジネスデータの抽出",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "完全な 36 列のビジネス抽出",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "レビュー (11 コラム) と写真 URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "電子メールとソーシャルメディアの強化",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "キーワードとレビューのバッチ処理 - URL タスク",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "エクスポート",
                "rows": [
                  {
                    "label": "CSV / JSON フィールド選択付きエクスポート",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "ローカルファーストのエクスポートパイプライン",
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
            "usageNotice": "MapsGrab ブラウザー拡張機能の月間割り当てに適用されます。",
            "successTitle": "プランが有効化されました",
            "successDescription": "1 回限りの 1 月プランが有効になりました。拡張機能は、次回のクォータ更新時にそれを取得します。"
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "{price} · 1 回限り",
          "unit": "リクエスト",
          "eyebrow": "API プラン",
          "title": "プログラムによるアクセス、リクエストに応じた価格設定",
          "description": "Google Maps ビジネスを検索し、単純な HTTP API を介して独自のアプリケーションからレビューを取得します。成功した各呼び出しは、結果が返されない場合や部分的なデータが返された場合でも、1 つのリクエストとしてカウントされます。",
          "billingChips": [
            "1回払い",
            "自然な 1 か月をカバーします",
            "自動更新なし"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "無料",
              "tagline": "API を小規模で評価する",
              "price": "$0",
              "periodLabel": "永遠に",
              "quota": "20 リクエスト / 月",
              "features": [
                "キーワードと場所によるビジネス検索",
                "ソートとページングを備えたレビューエンドポイント",
                "JSON の応答",
                "API キーがアカウントに関連付けられています",
                "コミュニティサポート"
              ],
              "ctaLabel": "無料で始める",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "基本",
              "tagline": "プロトタイプとライト統合用",
              "price": "$15",
              "periodLabel": "1 回限り · 1 月",
              "quota": "1,000 リクエスト / 月",
              "features": [
                "すべてが無料",
                "1 月の 1,000 リクエスト",
                "1 回限りの支払い — 自動更新なし",
                "JSON の応答"
              ],
              "ctaLabel": "基本を入手",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "プロ",
              "tagline": "実稼働統合の場合",
              "price": "$65",
              "periodLabel": "1 回限り · 1 月",
              "quota": "5,000 リクエスト / 月",
              "features": [
                "基本のすべて",
                "1 月の 5,000 リクエスト",
                "1 回限りの支払い — 自動更新なし",
                "JSON の応答"
              ],
              "ctaLabel": "プロフェッショナルになる",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "仕事",
              "tagline": "MapsGrab データに基づいて構築された製品の場合",
              "price": "$115",
              "periodLabel": "1 回限り · 1 月",
              "quota": "10,000 リクエスト / 月",
              "features": [
                "プロフェッショナルのすべて",
                "1 月の 10,000 リクエスト",
                "1 回限りの支払い — 自動更新なし",
                "JSON の応答"
              ],
              "ctaLabel": "ビジネスを獲得する",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "規模",
              "tagline": "大容量データ操作向け",
              "price": "$365",
              "periodLabel": "1 回限り · 1 月",
              "quota": "50,000 リクエスト / 月",
              "features": [
                "ビジネスのすべて",
                "1 月の 50,000 リクエスト",
                "1 回限りの支払い — 自動更新なし",
                "JSON の応答"
              ],
              "ctaLabel": "スケールの取得",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "自然 1 か月をカバーする 1 回限りの支払い — このタブのプランは自動更新されません。成功した API または MCP 呼び出しは、空の結果や部分的な結果も含めて 1 つのリクエストとしてカウントされます。失敗した呼び出しはカウントされません。 1st での使用量のリセットと未使用のリクエストはロールオーバーされません。",
          "compare": {
            "lead": "API プラン — プログラムによるアクセス、リクエストに応じた価格設定。",
            "volume": "月ごとのリクエスト",
            "groups": [
              {
                "label": "エンドポイント",
                "rows": [
                  {
                    "label": "キーワードと場所によるビジネス検索",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "ソートとページングを備えたレビューエンドポイント",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON の応答",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "同じ API キーを持つ MCP サーバー",
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
                "label": "アクセス",
                "rows": [
                  {
                    "label": "API キーがアカウントに関連付けられています",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "コミュニティサポート",
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
            "usageNotice": "MapsGrab API の月間リクエスト クォータに適用されます。",
            "successTitle": "プランが有効化されました",
            "successDescription": "1 回限りの 1 月プランが有効になりました。 API キーは、次のリクエストで新しいクォータを取得します。"
          }
        }
      },
      "plansSection": {
        "label": "予定",
        "finder": {
          "label": "1ヶ月に{unit}は何枚必要ですか?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} 月額 — {plan} プラン",
          "fits": "適合"
        }
      },
      "compare": {
        "kicker": "比較する",
        "title": {
          "lead": "すべての計画、",
          "accent": "隣り合って",
          "tail": ""
        },
        "plan": "プラン",
        "volumeGroup": "ボリュームと請求",
        "billing": "請求する",
        "included": "付属",
        "notIncluded": "含まれていない",
        "allPlans": "すべてのプランに含まれる"
      },
      "usage": {
        "head": {
          "kicker": "使用法",
          "title": {
            "lead": "",
            "accent": "割り当て",
            "tail": " にカウントされるもの"
          },
          "lead": "2 つのユニット: 拡張機能とオンライン スクレイパーのレコード、API のリクエスト — 両方とも毎月 1st にリセットされます。"
        },
        "records": {
          "meter": "今月使用したレコード",
          "badge": "延長・オンライン",
          "title": "1 レコード = 1 収集行",
          "body": "収集した各行は 1 つのレコードとしてカウントされます。つまり、オンラインスクレイパー 上のビジネスです。拡張機能にはビジネス、レビュー、または写真が含まれます。電子メールとソーシャル エンリッチメントではレコードは追加されません。",
          "count": "+1 レコード",
          "attachments": [
            "電話とウェブサイト",
            "営業時間",
            "電子メールとソーシャル"
          ]
        },
        "requests": {
          "meter": "今月使用したリクエスト",
          "badge": "API · MCP",
          "title": "1 リクエスト = 1 呼び出し成功",
          "body": "結果や部分的なデータが返されない場合でも、リクエストは 1 つの成功した API 呼び出しです。失敗した呼び出しはカウントされません。 MCP ツール呼び出しは、同じリクエスト クォータで描画します。",
          "counted": "成功した呼び出し - カウントされます",
          "notCounted": "失敗した通話 - カウントされない"
        },
        "reset": {
          "title": "1st でリセット",
          "body": "使用量は毎月 1st にリセットされます。未使用のレコードとリクエストはロールオーバーされません。",
          "limit": "プランの制限",
          "unused": "未使用・転がらない",
          "flag": "リセット"
        }
      },
      "billing": {
        "head": {
          "kicker": "請求する",
          "title": {
            "lead": "シンプルな請求、",
            "accent": "驚きなし",
            "tail": ""
          },
          "lead": "3 つの製品ラインにわたる支払い、更新、アップグレードの仕組み。"
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "PayPal を通じてプランの支払いを行います。 PayPal でお支払いを完了し、ここに戻ってプランを有効にしてください。"
          },
          "cadence": {
            "title": "1回払い",
            "body": "すべての有料プランは 1 か月をカバーします。自動料金なしで一度お支払いいただけます。さらに 1 か月必要になったときに再度購入してください。"
          },
          "upgrade": {
            "title": "差額を支払ってアップグレード",
            "body": "現在の支払いプロバイダーを通じて、有効なプランを対象となる上位階層に移動します。有効期限と使用量はこれまでのところ変更されません。"
          },
          "independent": {
            "title": "独立したプラン",
            "body": "異なるタブのプランは独立しています。プランの有効期限が切れると、アカウントは自動的に無料枠に戻ります。"
          }
        }
      },
      "plans": {
        "loading": "支払いオプションを読み込んでいます...",
        "loadFailed": "支払いオプションを読み込めませんでした。ページを更新して再試行してください。",
        "noChannels": "現在、このプランで利用できる支払い方法はありません。",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "支払いが完了していません",
        "billingPeriodMonthly": "1か月",
        "billingAutoRenew": "キャンセルされるまで自動更新",
        "billingOneTime": "1回払い"
      },
      "upgrade": {
        "currentPlan": "現在の計画",
        "button": "アップグレード · {amount}",
        "title": "プランをアップグレードする",
        "confirm": "アップグレードの確認",
        "oneTime": "{channel}経由の1回の差。有効期限は {date} のままです。",
        "autoRenew": "差額は{channel}経由ですぐに請求されます。有効期限は {date} のままです。今後の更新には新しいプランの価格が使用されます。",
        "pendingTitle": "アップグレードを待っています",
        "pendingDescription": "決済プロバイダーがアップグレードを適用しています。現在のプランは、確認されるまでアクティブのままです。",
        "successTitle": "プランがアップグレードされました",
        "successDescription": "新しいクォータは有効です。有効期限は {date} のままです。",
        "quoteFailed": "アップグレード価格を読み込めませんでした。ページを更新して再試行してください。",
        "failed": "アップグレードを確認できませんでした。再試行する前に、ページを更新してプランを確認してください。",
        "reasons": {
          "no_active_subscription": "あなたのプランはもうアクティブではありません。ページを更新してプランを選択します。",
          "not_higher_tier": "より高い階層を選択してアップグレードするか、プランの有効期限が切れるまで待って階層を変更してください。",
          "non_positive_diff": "残りのプラン金額はこのレベルを下回っていません。プランの有効期限が切れた後もレベルを変更できます。",
          "channel_unavailable": "現在のお支払い方法ではアップグレードをご利用いただけません。有効期限が切れた後でもプランを変更できます。"
        }
      },
      "faq": {
        "kicker": "よくある質問",
        "title": {
          "lead": "",
          "accent": "よくある質問",
          "tail": ""
        },
        "lead": "課金の基本。それ以外の場合は、メール 1 通でサポートが受けられます。",
        "contact": "サポートに連絡する",
        "items": [
          {
            "question": "何が記録としてカウントされますか?",
            "answer": "レコードは 1 つの収集された行であり、無料プランがカウントするのと同じ単位です。 オンラインスクレイパー では、それが 1 つのビジネスです。拡張機能では、収集した各ビジネス、レビュー、または写真が 1 つのレコードになります。電子メールとソーシャル エンリッチメントではレコードは追加されません。 [API] タブでは、代わりに成功したリクエストで使用量がカウントされます。"
          },
          {
            "question": "MapsGrab を試すには有料プランが必要ですか?",
            "answer": "いいえ。すべての製品には時間制限のない無料枠があります。オンライン スクレイパーと拡張機能には 1 か月あたり 1,000 レコードが含まれ、API には 1 か月あたり 20 リクエストが含まれます。 オンラインスクレイパー および拡張機能の無料プランには、電子メールやソーシャル メディアの強化は含まれていません。有料オンライン プランにはデフォルトで含まれており、タスクごとにオフにすることができます。"
          },
          {
            "question": "私のアカウントにクォータはどのように適用されますか?",
            "answer": "クォータは、サインインしているアカウントごとに (サインインしていない場合は拡張機能のブラウザ デバイスごとに) カウントされます。より高い上限が適用されるように、プランを所有するアカウントでサインインします。プランの有効期限が切れると、アカウントは自動的に無料枠に戻ります。"
          },
          {
            "question": "私のプランは自動的に更新されますか?",
            "answer": "いいえ。すべてのプランは、自然 1 か月にわたる 1 回限りの PayPal 支払いです。プランの有効期限が切れると、無料利用枠に戻ります。有料プランを継続するには、再度購入してください。"
          },
          {
            "question": "ティア間を切り替えることはできますか?",
            "answer": "PayPal を通じて差額を支払うことで、有効なプランを対象となる上位レベルにアップグレードできます。有効期限と使用量はこれまでのところ変更されません。異なるタブのプランは独立しています。"
          }
        ]
      },
      "cta": {
        "kicker": "始めましょう",
        "title": {
          "lead": "",
          "accent": "無料枠",
          "tail": " から始めます"
        },
        "lead": "すべての製品には時間制限のない無料枠があります。1,000 は拡張機能とオンライン スクレイパーで 1 か月を記録し、20 は API で 1 か月を要求します。",
        "primary": "拡張機能をインストールする",
        "secondary": "オンラインスクレイパーを試してみる",
        "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
      }
    },
    "extensionLogin": {
      "title": "内線番号のサインイン | MapsGrab",
      "description": "サインインして、MapsGrab Web サイト セッションをブラウザー拡張機能に接続します。",
      "eyebrow": "ブラウザ拡張機能",
      "heading": "拡張機能のサインイン",
      "checkingState": "チェック中",
      "signInRequiredState": "サインインが必要です",
      "confirmState": "アカウントを確認する",
      "errorState": "エラー",
      "preparingTitle": "サインインの準備",
      "preparingText": "拡張機能サインイン ブリッジをセットアップします。",
      "invalidParamsTitle": "無効なサインイン リンク",
      "invalidParamsText": "このサインイン リンクには必要なセキュリティ パラメーターがありません。拡張機能から再度サインインを開始してください。",
      "checkingSessionTitle": "セッションを確認する",
      "checkingSessionText": "既存の Web サイトのセッションを確認します。",
      "finishingGoogleTitle": "Google サインインを終了します",
      "finishingGoogleText": "Google 認証を Web サイトセッションに交換します。",
      "signInRequiredTitle": "続行するにはサインインしてください",
      "signInRequiredText": "サインインして、Web サイトのセッションを拡張機能に接続します。",
      "signInButtonLabel": "サインイン",
      "confirmTitle": "アカウントを確認してください",
      "confirmText": "拡張機能は、以下のアカウントでのサインインを要求しています。拡張機能からサインインを開始したばかりの場合にのみ続行してください。",
      "continueButtonLabel": "続く",
      "useAnotherAccountLabel": "別のアカウントを使用する",
      "issuingTitle": "サインインを完了する",
      "issuingText": "拡張機能用のワンタイム サインイン コードを発行します。",
      "issueFailedTitle": "何か問題が発生しました",
      "retryButtonLabel": "リトライ",
      "verificationFailedPrefix": "ウェブサイトトークンの検証に失敗しました",
      "issueFailedPrefix": "拡張機能のログインコード要求が失敗しました",
      "googleSignInFailedPrefix": "Google サインインに失敗しました",
      "googleCompletionFailedPrefix": "Google サインインを完了できませんでした"
    },
    "online": {
      "seo": {
        "title": "オンライン Google Maps スクレイパー — クラウドで抽出を実行 | MapsGrab",
        "description": "クラウドで Google Maps キーワード検索を実行し、ビジネス データを収集し、タスクごとに 1 つの CSV をダウンロードします。"
      },
      "hero": {
        "announce": {
          "badge": "3 モード",
          "text": "キーワード、マップエリアまたは地域全体"
        },
        "title": {
          "lead": "Google Maps のデータを",
          "accent": "クラウドで抽出",
          "tail": "、インストール不要"
        },
        "lead": "キーワードを送信し、クラウドでビジネスの詳細を収集し、ダッシュボードからタスクごとに 1 つの CSV をダウンロードします。",
        "primaryCta": "データ収集を開始",
        "pricingCta": "価格を見る",
        "meta": [
          "1,000 無料レコード/月",
          "どのブラウザでも動作します",
          "タスクごとに 1 つの重複排除済み CSV"
        ],
        "theater": {
          "files": "1 CSV · ダウンロードに保存されました",
          "csv": "CSV",
          "processed": "処理済み",
          "parallelChip": {
            "label": "キーワード実行",
            "value": "並行して"
          },
          "billingChip": {
            "label": "請求者",
            "value": "配信された行"
          }
        }
      },
      "facts": {
        "caption": "オンラインスクレイパーの概要",
        "items": [
          {
            "value": 37,
            "label": "連続行番号を含むパブリック列"
          },
          {
            "value": 6,
            "label": "有料プランのソーシャル プロフィール列"
          },
          {
            "value": 50,
            "label": "マップモードタスクごとに場所を検索する"
          },
          {
            "value": 60,
            "suffix": " 分",
            "label": "各タスクの収集ウィンドウ"
          },
          {
            "value": 1000,
            "label": "毎月無料レコード"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "仕組み",
          "title": {
            "lead": "クイックプレビューから",
            "accent": "完全エクスポート",
            "tail": "まで"
          },
          "lead": "アカウントなしでホームページで 1 つのキーワードを試してください。リスト全体が必要な場合は、サインインし、ダッシュボードでタスクとして実行します。"
        },
        "steps": [
          {
            "title": "ホームページでプレビュー",
            "description": "キーワードは 1 つ、アカウントはありません。最初の 3 行を使用して、最初の結果ページに含まれる企業の数を確認します。"
          },
          {
            "title": "サインイン",
            "description": "プレビューは保存されず、クォータを使用することはありません。サインインした後、キーワードを再度送信します。"
          },
          {
            "title": "タスクを作成する",
            "description": "[ダッシュボード] › [オンライン スクレイパー] で、1 行に 1 つのキーワードを入力するか、マップ エリアまたはリージョンにリストを作成させます。"
          },
          {
            "title": "キーワードは並行して実行されます",
            "description": "キューに入れられた状態、収集中状態、および CSV 準備状態を追跡し、その後、完了、部分的に成功、または失敗しました。アクティブなタスクは 5 秒ごとに更新されます。"
          },
          {
            "title": "ダウンロード",
            "description": "ファイルが利用可能な場合は、タスク全体に対して 1 つの CSV をダウンロードします。部分的に成功した場合は、配信された行が保持されます。ゼロの結果にはファイルがありません。"
          }
        ],
        "lock": "サインインすると完全なリストが表示されます",
        "email": "you@company.com",
        "links": {
          "preview": "ホームページのプレビューを試してみる",
          "dashboard": "ダッシュボードを開く › オンラインスクレイパー"
        }
      },
      "modes": {
        "head": {
          "kicker": "検索モード",
          "title": {
            "lead": "",
            "accent": "どこを見れば",
            "tail": " と言う 3 つの方法"
          },
          "lead": "キーワードを 1 行ずつ入力したり、中心点の周りの地図エリアをサンプリングしたり、国、州、都市を既製のクエリに変換したりできます。"
        },
        "tabsLabel": "検索モード",
        "notes": {
          "keywords": "プランの制限まで、1 行に 1 つのキーワード",
          "map": "中心点の周りの円をサンプリングする",
          "regions": "国、州、都市 (GeoNames 以降)"
        },
        "keywords": {
          "hint": "1 行に 1 つのキーワード。空白行と重複は数える前に削除され、タスク全体で 1 つの重複排除された CSV が生成されます。",
          "blank": "空行・スキップ",
          "duplicate": "重複・スキップ",
          "limitsTitle": "タスクごとのキーワード",
          "limitsCaption": "オンラインプランで",
          "limitsHint": "リストが空である場合、プランの制限を超えている場合、または月ごとの割り当てが使い果たされている場合、スクレイピングの開始は無効のままになります。"
        },
        "map": {
          "formula": "{keywords} キーワード × {points} グリッド点",
          "scale": "{value} km",
          "facts": [
            "点は中心から外側に向かって検索されます。",
            "円は検索中心を配置するだけであり、結果はそこにクリップされません。",
            "キーワードまたはポイント全体で見つかったビジネスは、タスク内に一度保持されます。"
          ]
        },
        "regions": {
          "hint": "生成されたクエリは、送信する前に編集できます。それぞれがキーワードとしてカウントされます。",
          "addCity": "都市を追加"
        }
      },
      "results": {
        "head": {
          "kicker": "結果",
          "title": {
            "lead": "1 つのタスク、",
            "accent": "1 つCSV",
            "tail": ""
          },
          "lead": "タスク全体に対して 37 パブリック列を 1 つの CSV でダウンロードし、連続した行番号とビジネスが検索全体で重複排除されます。"
        },
        "csvMeta": "1 CSV · {count} 配信された行",
        "rows": "{count} 行",
        "searches": "検索によって配信される行",
        "notes": [
          "行 1 には、連続した # 列を含む固定英語列名が含まれています。",
          "行 2 は、タスクの作成時に使用されるインターフェイス言語の各列を説明します。",
          "結果がゼロで完了したタスクにはファイルがありません。部分的に成功した場合は、配信された行が保持されます。",
          "ラベル行はレコードにカウントされません。"
        ],
        "language": "タスクの言語：日本語",
        "rowLabel": "行",
        "legend": {
          "fields": "行 1 · フィールド名",
          "labels": "行 2 · タスク言語",
          "data": "行 3+ · ビジネス"
        },
        "more": "+{count} 列を追加",
        "csvLabels": {
          "#": "行番号",
          "Name": "商号",
          "Fulladdress": "完全な住所",
          "Categories": "事業カテゴリー",
          "Phone": "代表電話",
          "Review Count": "レビュー数",
          "Average Rating": "平均レビュー評価",
          "Website": "ビジネスサイト",
          "Emails": "公開 Web サイトの電子メール",
          "Search Keyword": "検索キーワード"
        }
      },
      "features": {
        "head": {
          "kicker": "能力",
          "title": {
            "lead": "オンラインスクレイパー",
            "accent": "が行うこと",
            "tail": ""
          },
          "lead": "ビジネスの詳細はクラウドに収集され、有料プランではオプションの電子メールとソーシャル プロファイルが使用されます。"
        },
        "items": [
          {
            "id": "keywords",
            "title": "キーワードタスク",
            "description": "業種と場所を別のキーワードとして送信します。プランによってキーワードの制限と月間レコード割り当てが決まります。",
            "meta": "タスクごとの 2 · 5 · 10 · 20 · 50 キーワード"
          },
          {
            "id": "history",
            "title": "タスク履歴",
            "description": "タスクの進行状況を追跡し、ダッシュボードで各キーワードのレコード数を表示します。",
            "meta": "完了しました · 部分的に成功しました · 失敗しました"
          },
          {
            "id": "details",
            "title": "事業内容",
            "description": "名前、住所、電話番号、Web サイト、評価、営業時間、座標、および場所の識別子 (利用可能な場合) を収集します。",
            "meta": "ビジネスごとの 37 パブリック列"
          },
          {
            "id": "enrichment",
            "title": "電子メールとソーシャルエンリッチメント",
            "description": "有料のオンライン プランでは、デフォルトでビジネス Web サイトの電子メール アドレスとソーシャル プロフィールがチェックされます。タスクごとにこれをオフにすることができます。",
            "meta": "有料プラン · デフォルトでオン"
          },
          {
            "id": "downloads",
            "title": "1 つのタスク CSV",
            "description": "ファイルが利用可能な場合は、タスク全体を 1 つの CSV としてダウンロードします。検索ごとのファイルは必要ありません。",
            "meta": "{job}.csv · 37 列"
          },
          {
            "id": "browser",
            "title": "インストールするものはありません",
            "description": "Edge、Firefox、その他のブラウザーからクラウドで実行できます。タスク履歴から結果をダウンロードします。",
            "meta": "Edge · Firefox · 任意のブラウザ"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "使用法",
          "title": {
            "lead": "行ごとに請求されます ",
            "accent": "実際に得られるのは",
            "tail": ""
          },
          "lead": "オンライン タスクは、タスクが完了すると、配信されたビジネス行によって測定されます。送信時に何も確保されず、各 CSV のラベル行はカウントされません。"
        },
        "checks": [
          "タスクを送信してもクォータは何も予約されません",
          "すでに実行中のタスクは、残りのクォータを超えても終了します",
          "クォータを使い切ると、新しいタスクを送信できなくなります",
          "使用量は New York 時間の 1st にリセットされます。未使用のレコードはロールオーバーされません"
        ],
        "mock": {
          "recordsLabel": "今月の記録",
          "left": "{count}左",
          "exhausted": "クォータが枯渇しました",
          "task": "タスク {id}…",
          "pending": "これまでに配信されました · タスクが完了したときにカウントされます",
          "counted": "今月にカウントされます",
          "rows": "{count} 行",
          "running": "ランニング",
          "delta": "+{count} レコード"
        }
      },
      "plans": {
        "head": {
          "kicker": "オンラインスクレイパープラン",
          "title": {
            "lead": "クラウド抽出、",
            "accent": "記録による価格",
            "tail": ""
          },
          "lead": "インフラストラクチャ上で MapsGrab エンジンを実行します。レコードは配信される 1 つのビジネス行です。有料プランには、追加の記録コストなしで電子メールとソーシャル エンリッチメントが含まれます。"
        },
        "specs": {
          "keywords": "タスクごとのキーワード",
          "contacts": "メールとソーシャル",
          "included": "デフォルトでオン",
          "excluded": "含まれていない"
        },
        "note": "自然 1 か月にわたる 1 回限りの支払い — オンライン プランは自動更新されません。使用状況は New York 時間の 1st にリセットされ、未使用のレコードはロールオーバーされません。",
        "compare": "すべてのプランを比較する"
      },
      "faq": {
        "kicker": "よくある質問",
        "title": {
          "lead": "",
          "accent": "よくある質問",
          "tail": ""
        },
        "lead": "短い答え。それ以外の場合は、メール 1 通でサポートが受けられます。",
        "contact": "サポートに連絡する",
        "items": [
          {
            "question": "オンラインスクレイパー は拡張機能とどう違うのですか?",
            "answer": "この拡張機能はブラウザ内のデータを収集します。 オンラインスクレイパー はクラウドでキーワード タスクを実行し、結果をダッシュ​​ボードに配信します。"
          },
          {
            "question": "データはどこから来たのか、収集することは合法ですか?",
            "answer": "MapsGrab は、Google Maps に公開されている情報のみを収集します。これは、すべての訪問者が読むことができるのと同じ詳細です。当社は、プライベートアカウント、ゲートされたコンテンツ、または非公開データにはアクセスしません。"
          },
          {
            "question": "どのような形式にエクスポートできますか?",
            "answer": "結果のあるタスクは、37 パブリック列、連続行番号、および 2 つのヘッダー行を含む 1 つの UTF-8 CSV を提供します。ビジネスはすべての検索にわたって重複排除されます。結果のないタスクにはファイルがありません。"
          },
          {
            "question": "いくらかかりますか？",
            "answer": "オンライン スクレイパーは、無料の月間レコード割り当てを含め、価格ページの MapsGrab プランに従います。有料プランでは、さらに必要な場合に制限が引き上げられます。"
          },
          {
            "question": "メールやソーシャルプロフィールには有料プランが必要ですか?",
            "answer": "Online Free には、電子メールやソーシャル メディアの強化は含まれません。有料オンライン プランにはデフォルトで含まれており、タスクごとにオフにすることができます。タスクが送信されると、選択は固定されます。"
          },
          {
            "question": "タスクはどれくらいの時間実行できますか?",
            "answer": "各タスクには、60 分の収集ウィンドウがあります。部分的に成功すると、収集された行と、見つかった電子メールまたはプロファイルが配信されます。履歴には、CSV が利用可能かどうかが表示されます。"
          },
          {
            "question": "サインイン時にホームページのプレビューは保存されますか?",
            "answer": "いいえ。ホームページのプレビューは保存されないクイックルックです。サインインした後、ダッシュボードでオンライン スクレイパーを開き、キーワードを完全なタスクとして再度送信します。"
          }
        ]
      },
      "cta": {
        "kicker": "始めましょう",
        "title": {
          "lead": "最初の ",
          "accent": "クラウド タスク",
          "tail": " をキューに入れます"
        },
        "lead": "キーワードを送信し、タスクの進行状況を追跡し、ダッシュボードからビジネス データをダウンロードします。",
        "primary": "データ収集を開始",
        "secondary": "価格を見る",
        "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
      }
    },
    "apiPage": {
      "switchLabel": "API エンドポイント",
      "switchItems": {
        "search": "スクレイパー",
        "reviews": "レビュー",
        "photos": "写真"
      },
      "primaryCta": "APIキーを取得",
      "pricingCta": "価格を見る",
      "console": {
        "label": "API リクエストとレスポンスの例",
        "langLabel": "リクエスト言語",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "コピーリクエスト",
        "replay": "リプレイリクエスト",
        "ready": "準備ができて",
        "composing": "作曲依頼…",
        "sending": "リクエストを送信中…",
        "done": "応答 · 200 OK · application/json",
        "waiting": "// 応答を待っています…",
        "response": "応答例"
      },
      "endpoints": {
        "kicker": "エンドポイント",
        "title": {
          "lead": "鍵は1つ。 ",
          "accent": "3つの",
          "tail": " エンドポイント。"
        },
        "lead": "場所を検索し、結果の `fid` をレビューまたは写真 API に渡します。3つの API は同じ API キーと月間リクエスト枠を共有します。",
        "here": "あなたはここにいます",
        "paramsLabel": "パラメータ",
        "mcp": {
          "title": "AI エージェントを使用して構築しますか?",
          "description": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。",
          "link": "MCP を探索する"
        }
      },
      "chain": {
        "kicker": "チェーンエンドポイント",
        "title": {
          "lead": "",
          "accent": "スクレイパー → レビュー / 写真",
          "tail": ""
        },
        "lead": "場所を検索し、結果の `fid` をレビューまたは写真 API に渡します。3つの API は同じ API キーと月間リクエスト枠を共有します。",
        "label": "場所を検索し、結果の fid をレビューまたは写真 API に渡します。3つの API は同じ API キーと月間リクエスト枠を共有します。",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 レビュー"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 レビュー"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 レビュー"
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
          "note": "成功時の status は partial で、reason が収集の停止理由を示します。reported_total は上流の報告数または null で、確認済みのアルバム総数ではありません。"
        }
      },
      "reference": {
        "kicker": "参照",
        "title": {
          "lead": "リクエストイン、",
          "accent": "JSON",
          "tail": "アウト"
        },
        "lead": "キーを `Authorization: Bearer YOUR_API_KEY` として、本文を JSON として送信します。すべての応答は `{code, data, msg}` でラップされ、`code` 10000 は成功を意味します。",
        "baseUrl": "ベース URL",
        "copyBaseUrl": "コピーベース URL",
        "request": "リクエスト",
        "response": "応答",
        "columns": {
          "parameter": "パラメータ",
          "field": "分野",
          "type": "タイプ",
          "description": "説明",
          "example": "例"
        },
        "required": "必須",
        "groupsLabel": "フィールドグループ",
        "notes": [
          {
            "icon": "gauge",
            "title": "成功した呼び出しごとに 1 つのリクエスト",
            "description": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
          },
          {
            "icon": "key",
            "title": "401 はキーを確認することを意味します",
            "description": "キーが見つからないか無効な場合は、HTTP 401 が返されます。その他のエラーは、10000 以外の `code` および `msg` を含む HTTP 200 を返します。"
          },
          {
            "icon": "locate",
            "title": "場所はフェンスではなくバイアスです",
            "description": "`ll` はマップに検索場所を指示します。そのビューの外側の場所も表示される可能性があります。"
          },
          {
            "icon": "target",
            "title": "場所の名前を付けてください",
            "description": "`q` に都市、州、または ZIP を入力します。「近く」にはサーバー上にアンカーするものはありません。"
          }
        ]
      },
      "plans": {
        "kicker": "API プラン",
        "title": {
          "lead": "プログラムによるアクセス、",
          "accent": "リクエストによる価格設定",
          "tail": ""
        },
        "lead": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
      },
      "faq": {
        "lead": "短い答え。それ以外の場合は、メール 1 通でサポートが受けられます。",
        "contact": "サポートに連絡する"
      },
      "cta": {
        "kicker": "始めましょう",
        "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps スクレイパー API — JSON のビジネス データ | MapsGrab",
        "description": "MapsGrab スクレイパー API は、Google Maps の検索結果を JSON として返します。名前、住所、電話番号、ウェブサイト、評価、営業時間、座標、Place ID および fid、さらにリクエストに応じて電子メールとソーシャル プロフィールも返します。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "スクレイパー",
          "tail": " API"
        },
        "lead": "HTTPS でキーワードを送信すると、Google Maps の企業が JSON として返されます: 名前、住所、電話番号、ウェブサイト、評価、営業時間、座標、Place ID、fid、さらにリクエストに応じてメールやソーシャル プロフィールも取得できます。",
        "meta": [
          "無料プラン：{quota}",
          "検索とレビューのための 1 つのキー",
          "JSON より HTTPS"
        ],
        "chips": [
          {
            "label": "場所ごと",
            "value": "29 データフィールド"
          },
          {
            "label": "ページごと",
            "value": "最大 20 位"
          }
        ]
      },
      "endpoint": {
        "name": "スクレイピング API",
        "description": "あらゆるキーワードとオプションの場所に対応するビジネス — 場所ごとに 29 フィールド、さらに `extra` の電子メールとソーシャル プロフィール。",
        "link": "スクレイパー API を探索する"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "スクレイパー API",
          "tail": " が返すもの"
        },
        "lead": "キーワードとオプションの位置バイアス。 Google Maps 検索で構造化された JSON として表示される場所。",
        "items": [
          {
            "icon": "search",
            "title": "キーワードと場所で検索",
            "description": "`q` をオプションの `ll` 位置バイアスとともに送信します。 `page` は収集する結果ページの数を設定し、1 ～ 10, から 20 まではそれぞれを 1 つの応答に配置します。"
          },
          {
            "icon": "table",
            "title": "場所ごとの 29 フィールド",
            "description": "名前、カテゴリ、完全な住所、電話番号、ウェブサイト、評価とレビュー数、営業時間、座標、Place ID、CID、fid、所有者など。"
          },
          {
            "icon": "mail",
            "title": "電子メールとソーシャルエンリッチメント",
            "description": "`extra` を `true` に設定して、`emails` および `medias`: Instagram、Facebook、YouTube、TikTok、LinkedIn、および各ビジネス Web サイトにある X プロフィールを追加します。"
          },
          {
            "icon": "braces",
            "title": "クリーンで予測可能な JSON",
            "description": "1 つの `{code, data, msg}` エンベロープ内の snake_case フィールド。値 Google Maps は、`null` または空のリストとして返されず、空の文字列として返されることはありません。"
          },
          {
            "icon": "layers",
            "title": "部分的なデータにフラグが設定されています",
            "description": "一部の詳細を入力できない場合でも、`partial` が `true` および `warnings` に設定され、何が不足しているかを示すことで、場所を取得できます。"
          },
          {
            "icon": "shield",
            "title": "公開データのみ",
            "description": "結果には、Google Maps が公開している内容のみが含まれます。これは、訪問者が読むことができるのと同じ詳細です。"
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
            "description": "検索対象 (最大 300 文字) - 業種と場所 (例: `coffee shop in Portland, OR`。"
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "収集する結果ページの数 (1 ～ 10, から 20 まで) がそれぞれ 1 つの応答で返されます。ページに 20 個の場所がないか、新しいものが何もない場合、収集は早期に停止します。デフォルトは `1`。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "結果の言語、例: `en` または `fr`。デフォルトは`en`。"
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "オプションの位置バイアス (`@lat,lng,zoom`、ズーム 0 ～ 21)。マップにどこを検索するかを指示します。結果は半径にクリップされません。"
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` は、`emails` と `medias` をすべての場所に追加します。デフォルトは `false`。"
          }
        ],
        "groups": [
          {
            "label": "身元",
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
            "label": "接触",
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
                "badge": "余分な"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "余分な"
              }
            ]
          },
          {
            "label": "位置",
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
            "label": "評価",
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
            "label": "プロフィール",
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
            "label": "ページ",
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
          "accent": "よくある質問",
          "tail": ""
        },
        "items": [
          {
            "question": "スクレイパー API は何を返しますか?",
            "answer": "JSON は、収集されたページごとに最大 20 の場所になります。各場所には、名前、カテゴリ、住所、電話番号、ウェブサイト、評価、レビュー数、営業時間、座標、Place ID、CID、fid などの 29 フィールドがあり、追加の条件が当てはまる場合はメールやソーシャル プロフィールも含まれます。"
          },
          {
            "question": "認証するにはどうすればよいですか?",
            "answer": "MapsGrab API キーを Authorization ヘッダーのベアラー トークンとして送信します。各アカウントには 1 つのキーがあります。キーを生成する場合にのみ完全に表示され、新しいキーを生成すると、古いキーはすぐに無効になります。"
          },
          {
            "question": "リクエストはどのようにカウントされますか?",
            "answer": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
          },
          {
            "question": "ページって何をするの？",
            "answer": "page は、1 回の呼び出しで収集する結果ページの数 (1 から 10) です。各ページは 20 の場所まで加算され、Google Maps に新しいものが何もない場合、収集は早期に停止します。ページ番号ではありません。"
          },
          {
            "question": "データは公開されていますか?",
            "answer": "はい。 API は、Google Maps に公開されている情報のみを返します。これは、すべての訪問者が読むことができるのと同じ詳細です。プライベートアカウントや非公開データにはアクセスしません。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "マップ データを ",
          "accent": "アプリケーション",
          "tail": " に配置します"
        },
        "lead": "CRM、データ パイプライン、独自の製品の場合、検索ごとに 1 つの HTTP リクエスト、レスポンス内の構造化された JSON。"
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps レビュー スクレイパー API — JSON のレビュー | MapsGrab",
        "description": "MapsGrab レビュー API は、Google Maps ビジネスのパブリック レビューを JSON として返します。評価、テキストと翻訳、作成者、日付、レビューの写真、所有者の返信 (カーソルを使用したページごとに最大 60)。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "レビュー",
          "tail": " スクレイパー API"
        },
        "lead": "Google Maps ビジネスの公開レビューをその fid でリクエストし、構造化された JSON を返します。評価、テキストと翻訳、作成者、日付、レビューの写真、所有者の返信をカーソルでページごとに取得します。",
        "meta": [
          "無料プラン：{quota}",
          "1 ページあたり最大 60 レビュー",
          "JSON より HTTPS"
        ],
        "chips": [
          {
            "label": "ページごと",
            "value": "60 までのレビュー"
          },
          {
            "label": "並べ替え",
            "value": "関連性・最新・評価"
          }
        ]
      },
      "endpoint": {
        "name": "レビュー API",
        "description": "`fid` による 1 つのビジネスのパブリック レビュー — 1 ページあたり最大 60 まで、カーソルを使用して並べ替えてページを移動できます。",
        "link": "レビューを詳しく見る API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "レビュー API",
          "tail": " が返すもの"
        },
        "lead": "ビジネスに関するすべての公開レビュー (評価、テキスト、作成者、写真、所有者の返信) は、リクエストごとに 1 ページです。",
        "items": [
          {
            "icon": "review",
            "title": "fidさんによるレビュー",
            "description": "Scraper の API 結果から `fid` でビジネスを指定し、`next_cursor` を返して次のページを読み取ります (それぞれ最大 60 件のレビュー)。"
          },
          {
            "icon": "filter",
            "title": "あなたの方法で並べ替えました",
            "description": "`sort_by` は、最も関連性の高いレビュー (1)、最新のレビュー (2)、最高評価のレビュー (3)、または最低評価のレビュー (4) を最初に返します。"
          },
          {
            "icon": "list",
            "title": "テキスト、翻訳、日付",
            "description": "評価、レビュー テキスト、`translated_text` および `language`、`published_at_ms` および各レビューの相対日付。"
          },
          {
            "icon": "user",
            "title": "著者詳細",
            "description": "著者名とプロフィールのリンク、著者のレビュー数、ローカルガイドのステータス。"
          },
          {
            "icon": "image",
            "title": "写真とオーナーの返信",
            "description": "`images` には、レビューに添付された写真 URLs がリストされます。 `owner_response` には所有者の返信が伝えられ、`owner_response_at_ms` にはその時間が伝えられます。"
          },
          {
            "icon": "shield",
            "title": "公開データのみ",
            "description": "Google Maps で公開されているレビューのみ - すべての訪問者が読むことができる同じコンテンツ。"
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
            "description": "ビジネス機能 ID (例:) `0x5495…:0xbeb4…`。すべてのスクレイパー API の場所にそれが含まれています。"
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "前のページの `next_cursor`。最初のページでは省略します。"
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` 最も関連性が高い · `2` が最新 · `3` が最も高い評価 · `4` が最も低い評価。デフォルトは`1`です。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "言語コード、例: `en`。デフォルトは`en`です。"
          }
        ],
        "groups": [
          {
            "label": "レビュー",
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
            "label": "著者",
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
            "label": "オーナーの返信",
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
            "label": "ページ",
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
          "accent": "よくある質問",
          "tail": ""
        },
        "items": [
          {
            "question": "特定のビジネスに対処するにはどうすればよいですか?",
            "answer": "その fid には、すべての スクレイピング API の場所に含まれる機能 ID が含まれます。無料の Place ID Finder は、Google Maps の場所 URL から FID も読み取ります。"
          },
          {
            "question": "レビューにはどのようなフィールドが含まれますか?",
            "answer": "レビュー ID、評価、翻訳と言語を含むテキスト、公開時刻と相対日付、著者名、プロフィール リンク、レビュー数とローカルガイドのステータス、添付された写真、および所有者の返信時刻。"
          },
          {
            "question": "レビューは何件集めることができますか?",
            "answer": "各リクエストは、最大 60 件のレビューと next_cursor 件の 1 ページを返します。次のページを読むためにそれを戻します。 next_cursor が null の場合、これ以上ページはありません。"
          },
          {
            "question": "リクエストはどのようにカウントされますか?",
            "answer": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
          },
          {
            "question": "データは公開されていますか?",
            "answer": "はい。 API は、Google Maps に公開されているレビューのみを返します。これは、訪問者が読むことができるのと同じ内容です。プライベートアカウントや非公開データにはアクセスしません。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "レビュー数 ",
          "accent": "大規模",
          "tail": ""
        },
        "lead": "Cursor ページのクリーンな JSON のレビュー スレッド - 監視、調査、レポート用。"
      }
    },
    "photosApi": {
      "seo": {
        "title": "写真 API — 公開ビジネス写真の URL | MapsGrab",
        "description": "ビジネスの fid を指定すると、公開写真の URL を JSON で取得できます。max_results は取得数の上限です。結果は部分取得で、アルバム全体は保証されません。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "写真",
          "tail": " API"
        },
        "lead": "ビジネスの fid を指定すると、公開写真の URL を JSON で取得できます。max_results は取得数の上限です。結果は部分取得で、アルバム全体は保証されません。",
        "meta": [
          "無料プラン：{quota}",
          "公開ビジネス写真の URL",
          "リクエストによる価格設定"
        ],
        "chips": [
          {
            "label": "取得状態",
            "value": "partial"
          },
          {
            "label": "取得数",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "写真 API",
        "description": "ビジネスの fid を指定すると、公開写真の URL を JSON で取得できます。max_results は取得数の上限です。結果は部分取得で、アルバム全体は保証されません。",
        "link": "写真 API を見る"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "写真 API",
          "tail": ""
        },
        "lead": "公開ビジネス写真の URL",
        "items": [
          {
            "icon": "image",
            "title": "fid で写真を取得",
            "description": "検索結果または Place ID Finder の `fid` を使用します。`photos` の各項目には公開写真の `url` が含まれます。"
          },
          {
            "icon": "filter",
            "title": "リクエストごとに上限を設定",
            "description": "`max_results` は正の整数で、既定値は200です。上限より少ない写真が返る場合があります。ページ番号やカーソルはありません。"
          },
          {
            "icon": "list",
            "title": "取得状態を確認",
            "description": "成功時の `status` は `partial` で、`reason` が収集の停止理由を示します。`reported_total` は上流の報告数または `null` で、確認済みのアルバム総数ではありません。"
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
            "description": "検索結果または Place ID Finder のビジネス FID。形式は `0x…:0x…` で、各部分は12～20桁の16進数です。"
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "今回の取得上限。正の整数で既定値は200です。その枚数の取得は保証されません。"
          }
        ],
        "groups": [
          {
            "label": "写真",
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
            "label": "取得状態",
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
          "accent": "よくある質問",
          "tail": ""
        },
        "items": [
          {
            "question": "ビジネス写真を取得するには？",
            "answer": "/photos に fid と任意の max_results を含めて POST します。検索・レビュー API と同じ Bearer API キーを使用します。"
          },
          {
            "question": "アルバム全体を取得できますか？",
            "answer": "成功時の status は partial で、reason が収集の停止理由を示します。reported_total は上流の報告数または null で、確認済みのアルバム総数ではありません。 max_results は正の整数で、既定値は200です。上限より少ない写真が返る場合があります。ページ番号やカーソルはありません。"
          },
          {
            "question": "ビジネスの FID を取得するにはどうすればよいですか?",
            "answer": "すべての スクレイピング API プレースにはその fid が含まれており、無料の Place ID Finder は、任意の Google Maps プレース URL から FID を読み取ります。"
          },
          {
            "question": "リクエストはどのようにカウントされますか?",
            "answer": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
          },
          {
            "question": "データは公開されていますか?",
            "answer": "はい。画像 URLs は、Google Maps で公開されている写真を指します。これは、すべての訪問者が見ることができる同じ画像です。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "ビジネス写真をアプリに",
          "tail": ""
        },
        "lead": "既存の API キーで公開写真の URL と取得状態を取得できます。"
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps スクレイパー MCP サーバー | MapsGrab",
        "description": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。"
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "エージェントに接続する",
      "hero": {
        "kicker": "MCP サーバー",
        "title": {
          "lead": "Google Maps スクレイパー ",
          "accent": "MCP",
          "tail": " サーバー"
        },
        "lead": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。",
        "meta": [
          "Streamable HTTP",
          "OAuth でサインインします",
          "無料プラン：{quota}"
        ],
        "chips": [
          {
            "label": "輸送",
            "value": "Streamable HTTP"
          },
          {
            "label": "ツールの結果",
            "value": "構造化 JSON"
          }
        ]
      },
      "agent": {
        "label": "エージェント セッションの例: 地元のビジネスに関する質問、構造化された結果を含む MapsGrab ツールの呼び出し、およびエージェントの回答",
        "session": "エージェントセッション",
        "connected": "MCP サーバー {server} が接続されました",
        "placeholder": "Google Maps の場所について質問してください…",
        "thinking": "考え…",
        "running": "走っている",
        "scenes": [
          {
            "prompt": "4.8 以上と評価されたテキサス州オースティンの歯科医を検索し、電話番号をリストします。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 か所",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 か所以上"
              }
            ],
            "answer": [
              "最初の 20 結果のうち 3 つが評価されています ",
              {
                "strong": "4.8 以上"
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
            "prompt": "ポートランドの Ember & Oak Coffee の最新レビューで何と言っていますか?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 場所",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 件のレビュー",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "たいてい ",
              {
                "strong": "5 星"
              },
              " — 人々はエスプレッソとフレンドリーなスタッフを称賛しています。繰り返されるメモの 1 つ: ",
              {
                "strong": "週末は席が狭い"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "シカゴの配管工でウェブサイトを掲載していないのはどこですか?それらをテーブルに並べます。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 か所",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 か所以上"
              }
            ],
            "answer": [
              {
                "strong": "4/20"
              },
              " ウェブサイトがリストされていません。最初の 3 つ:"
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
            "prompt": "Rose City Roasters の最も評価の低いレビューを取得し、丁寧な返信を作成します。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 場所",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 件のレビュー",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "最も低い評価は主に次のように述べています ",
              {
                "strong": "ピーク時のサービスが遅い"
              },
              ". ",
              {
                "strong": "2/3"
              },
              " オーナーからの返答はまだありません。私はそれぞれについて草稿を作成しました。"
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "ツール",
        "title": {
          "lead": "MCP サーバー ",
          "accent": "が公開するもの",
          "tail": ""
        },
        "lead": "3つのツール: Search / Reviews / Photos.",
        "kind": "道具",
        "returns": "返品",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "場所を検索する",
            "description": "Google Maps 検索で表示される内容 (名前、電話番号、評価、営業時間、座標、場所 ID、Fid) を返すキーワードと場所の検索。",
            "args": [
              {
                "name": "q",
                "description": "キーワードと都市、州、または ZIP"
              },
              {
                "name": "page",
                "description": "収集する結果ページ、1–10 · それぞれ最大 20 か所"
              },
              {
                "name": "hl",
                "description": "結果の言語、例: `en`"
              },
              {
                "name": "ll",
                "description": "場所の偏り、`@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` はメールとソーシャル プロフィールを追加します"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "スクレイパー API と同じデータ"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "レビューの一覧表示",
            "description": "エージェントが検討しているビジネスの評価、レビューのテキスト、著者、日付、写真、オーナーの返信。",
            "args": [
              {
                "name": "fid",
                "description": "あらゆる検索結果から"
              },
              {
                "name": "cursor",
                "description": "最後のページから `next_cursor`。最初は省略します"
              },
              {
                "name": "sort_by",
                "description": "1 関連 · 2 最新 · 3 最高 · 4 最低"
              },
              {
                "name": "hl",
                "description": "言語、例: `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "レビュー API と同じデータ"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "fid で写真を取得",
            "description": "ビジネスの fid を指定すると、公開写真の URL を JSON で取得できます。max_results は取得数の上限です。結果は部分取得で、アルバム全体は保証されません。",
            "args": [
              {
                "name": "fid",
                "description": "検索結果または Place ID Finder のビジネス FID。形式は `0x…:0x…` で、各部分は12～20桁の16進数です。"
              },
              {
                "name": "max_results",
                "description": "今回の取得上限。正の整数で既定値は200です。その枚数の取得は保証されません。"
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "写真 API を見る"
          }
        ]
      },
      "flow": {
        "kicker": "接続方法",
        "title": {
          "lead": "エージェントと ",
          "accent": "ライブ マップ データ",
          "tail": " の間に 1 つのエンドポイント"
        },
        "lead": "クライアントは Streamable HTTP 経由で接続し、ブラウザ経由でサインインします。エージェントはツールを検出し、プロンプトでマップ データが必要なときにツールを呼び出し、構造化された JSON を読み取ります。",
        "label": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。 search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP クライアント",
        "anyClient": "任意の MCP クライアント",
        "toolsLabel": "ツール",
        "hub": "MapsGrab MCP",
        "publicData": "公開 Google Maps データ",
        "resultLabel": "結果",
        "results": [
          "20 か所",
          "60 件のレビュー",
          "2 写真"
        ],
        "steps": [
          {
            "title": "接続する",
            "description": "エンドポイントをクライアントに追加し、ブラウザーから MapsGrab にサインインします。"
          },
          {
            "title": "発見する",
            "description": "エージェントは、MapsGrab ツールとその入力スキーマをリストします。"
          },
          {
            "title": "電話",
            "description": "プロンプトでマップ データが必要な場合、エージェントはツールを呼び出し、JSON 結果を読み取ります。"
          }
        ]
      },
      "setup": {
        "kicker": "設定",
        "title": {
          "lead": "クライアントごとに 1 つの構成ブロック ",
          "accent": "",
          "tail": ""
        },
        "lead": "クライアントに MapsGrab エンドポイントを指定し、ブラウザ経由でサインインします。コピーする API キー、SDK、実行するローカル プロセスは必要ありません。",
        "tabsLabel": "MCP クライアント",
        "copy": "設定のコピー",
        "clients": {
          "claude": {
            "file": "ターミナル",
            "steps": [
              {
                "title": "サーバーを追加する",
                "description": "コマンドを実行して、`mapsgrab` を HTTP 上に登録します。"
              },
              {
                "title": "サインイン",
                "description": "Claude Code で、`/mcp` を実行し、`mapsgrab` を選択して認証します。承認のためにブラウザで MapsGrab が開きます。"
              },
              {
                "title": "マップデータを要求する",
                "description": "Claude Code は MapsGrab ツールをリストし、プロンプトで必要なときにそれらを呼び出します。"
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "mcp.jsonを編集する",
                "description": "ブロックをプロジェクトごとに `~/.cursor/mcp.json` に追加するか、プロジェクトごとに `.cursor/mcp.json` に追加します。"
              },
              {
                "title": "サインイン",
                "description": "Cursor [設定] → MCP で、`mapsgrab` の横にある [接続] をクリックし、ブラウザで承認します。"
              },
              {
                "title": "ツールを使用する",
                "description": "`mapsgrab` は、エージェントの準備ができたツールを MCP サーバー リストに表示します。"
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": ".vscode/mcp.json を追加",
                "description": "ブロックを貼り付けます。このブロックにはエンドポイント URL のみが保持されており、秘密は何もありません。"
              },
              {
                "title": "サインイン",
                "description": "サーバーを起動します。 VS Code は MapsGrab による認証を要求し、ブラウザを開いて承認します。"
              },
              {
                "title": "エージェントモードを使用する",
                "description": "エージェント モードでチャットを開き、MapsGrab ツールを有効にします。"
              }
            ]
          },
          "codex": {
            "file": "ターミナル",
            "steps": [
              {
                "title": "サーバーを追加する",
                "description": "`codex mcp add` を実行して、`mapsgrab` を URL で登録します。"
              },
              {
                "title": "サインイン",
                "description": "ブラウザで `codex mcp login mapsgrab` を実行し、MapsGrab を承認します。"
              },
              {
                "title": "Codex を開始",
                "description": "新しいセッションでは、`mapsgrab` とそのツールがロードされます。"
              }
            ]
          }
        },
        "apiKey": {
          "title": "ブラウザからサインインできないのですか? API キーを使用する",
          "description": "クライアントが MCP 認証をサポートしていない場合、またはサーバー上または CI で実行されている場合は、代わりに API キーを `Authorization` ヘッダーとして追加します。キーは、共有設定ファイルではなく、環境変数またはクライアントのシークレット入力に保持します。",
          "link": "APIキーを取得",
          "snippet": "任意の HTTP クライアント"
        },
        "spec": {
          "title": "他の MCP クライアント",
          "subtitle": "MCP Inspector が含まれています",
          "transport": "輸送",
          "transportValue": "Streamable HTTP",
          "endpoint": "終点",
          "copyEndpoint": "エンドポイントのコピー",
          "auth": "認証",
          "authValue": "OAuth サインイン (フォールバック: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "プロンプトの例",
        "title": {
          "lead": "わかりやすい言葉で質問してください。 ",
          "accent": "行を戻します。",
          "tail": ""
        },
        "lead": "プロスペクティング、ローカル市場調査、レビュー監視 — 仕事について説明すると、エージェントはどの MapsGrab ツールを呼び出すかを決定します。",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "探鉱中",
              "quote": "「テキサス州オースティンで4.8以上の評価を得ている歯科医を見つけて、電話番号をリストしてください。」",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "評判",
              "quote": "「ポートランドのEmber & Oak Coffee の最新レビューで人々が言っ​​たことを要約します。」",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "リードリスト",
              "quote": "「電子メールと Instagram プロフィールを使用して、デンバーのヨガ スタジオのリストを作成します。」",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "市場調査",
              "quote": "「ポートランドのディビジョン ストリートにあるコーヒー ショップの評価とレビュー数を比較してください。」",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "エンリッチメント",
              "quote": "「このスプレッドシートにすべてのビジネスの Place ID、電話番号、Web サイトを追加します。」",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "オーナーの返答",
              "quote": "「Rose City Roasters の最も評価の低いレビューを取得し、丁寧な返信を作成します。」",
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
              "tag": "ウェブサイトのギャップ",
              "quote": "「シカゴでウェブサイトを掲載していない配管工はどこですか? 表に載せてください。」",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "営業時間",
              "quote": "「60614 付近で日曜日に営業している自動車修理店はどこですか?」",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "マッピング",
              "quote": "「ブルックリンのビーガン レストランを座標とともに GeoJSON としてエクスポートします。」",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "ローカリゼーション",
              "quote": "「リヨンでパン屋を検索し、リストの詳細をフランス語で返します。」",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "申請されたリスト",
              "quote": "「オースティンのどのジムがGoogle ビジネス リスティングを申請しているかを確認してください。」",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "ローカルガイド",
              "quote": "「ローカルガイドからの Hawthorne Bean Co. に関する最近のレビューはどれですか?」",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "応答時間",
              "quote": "「これらのサロンはレビューに返信していますか? オーナーの返信にはどのくらい時間がかかりますか?」",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "認証とデータ",
        "title": {
          "lead": "一度サインインしてください。 ",
          "accent": "公開データのみ。",
          "tail": ""
        },
        "lead": "MCP エンドポイントへのすべての呼び出しには、ベアラー資格情報 (サインインからの OAuth トークン、またはクライアントがサインインできない場合の API キー) が含まれ、すべての結果は Google Maps が公開されているものから取得されます。",
        "inspector": {
          "label": "ベアラー Authorization ヘッダーを含む MCP リクエストと、構造化コンテンツを含むその JSON-RPC レスポンスの例",
          "request": "リクエスト",
          "response": "応答",
          "verified": "トークンが検証されました"
        },
        "items": [
          {
            "icon": "key",
            "title": "サインインするか、キーにフォールバックします",
            "description": "ブラウザを通じてサインインし、クライアントを承認します。 MCP 認証を持たないクライアントは、代わりに API キーをベアラー トークンとして渡すことができます。どちらも同じツールにアクセスできます。"
          },
          {
            "icon": "eye",
            "title": "Google Maps を読み取りますが、書き込みはしません",
            "description": "このツールは公開リストの検索と読み取りのみを行います。呼び出しによって変わることの 1 つは、リクエストの使用状況です。"
          },
          {
            "icon": "lock",
            "title": "設定ファイルにシークレットはありません",
            "description": "サインインすると、構成にはエンドポイント URL のみが保持されます。 API キーを使用する場合は、共有ファイルではなく環境変数に保存してください。"
          },
          {
            "icon": "shield",
            "title": "いつでもアクセスを取り消します",
            "description": "サインインしたクライアントは [ダッシュボード] → API にリストされ、そこで取り消すことができます。新しい API キーを生成すると、古いキーはすぐに無効になります。"
          }
        ]
      },
      "billing": {
        "kicker": "価格設定",
        "title": {
          "lead": "",
          "accent": "API プラン",
          "tail": " の対象"
        },
        "lead": "MCP サーバーは、スクレイパー API およびレビュー API と同じ月次リクエスト クォータから取得します。成功した各ツール呼び出しは 1 つのリクエストとしてカウントされます。",
        "compare": "API プランを比較する",
        "head": {
          "plan": "プラン",
          "requests": "毎月のリクエスト",
          "scale": "(対数スケール)",
          "price": "価格"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "よくある質問",
          "tail": ""
        },
        "items": [
          {
            "question": "MapsGrab MCP サーバーとは何ですか?",
            "answer": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。 search_places / list_reviews / list_photos."
          },
          {
            "question": "どのクライアントが接続できますか?",
            "answer": "Streamable HTTP をサポートする任意の MCP クライアント: Claude Code、Cursor、VS Code、Codex、MCP Inspector など。エンドポイント URL は、末尾のスラッシュも含めて、示されているとおりに使用してください。"
          },
          {
            "question": "どのように認証されるのでしょうか?",
            "answer": "OAuth サインインの場合: Claude Code、Cursor、VS Code、Codex、および MCP 認証をサポートするその他のクライアントは、ブラウザーで MapsGrab を開きます。クライアントを承認し、後で [ダッシュボード] → API で取り消すことができます。クライアントがサインインできない場合にのみ、API キーをベアラー トークンとして Authorization ヘッダーに渡します。"
          },
          {
            "question": "ツール呼び出しはどのようにカウントされますか?",
            "answer": "写真の部分取得を含め、成功した呼び出しは写真数にかかわらず1リクエストとして数えます。有効な写真を返せない場合はエラーとなり、消費しません。検索、レビュー、写真、MCP は月間枠を共有します。"
          },
          {
            "question": "エージェントがビジネス写真を入手できますか?",
            "answer": "list_photos(fid, max_results): ビジネスの fid を指定すると、公開写真の URL を JSON で取得できます。max_results は取得数の上限です。結果は部分取得で、アルバム全体は保証されません。 今回の取得上限。正の整数で既定値は200です。その枚数の取得は保証されません。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "エージェントに ",
          "accent": "ライブマップデータ",
          "tail": " を提供します"
        },
        "lead": "1つの MCP 接続で Google Maps の場所を検索し、レビューと公開ビジネス写真の URL を取得できます。"
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "無料ツール",
        "guide": {
          "kicker": "このツールについて",
          "title": {
            "lead": "機能と",
            "accent": "使い方",
            "tail": ""
          },
          "lead": "すべてがブラウザ内で実行され、貼り付けたりアップロードしたりしたものは何もデバイスから送信されません。"
        },
        "related": {
          "kicker": "関連ツール",
          "title": {
            "lead": "",
            "accent": "マップ データ",
            "tail": " 用のその他の無料ツール"
          },
          "lead": "完全にブラウザ内で実行される小さなユーティリティです。貼り付けた内容がデバイスから離れることはありません。ただしメールチェッカーは例外で、検証のためにアドレスを当社のサーバーへ送信します。"
        },
        "faq": {
          "kicker": "よくある質問",
          "lead": "短い答え。それ以外の場合は、メール 1 通でサポートが受けられます。",
          "contact": "サポートに連絡する"
        },
        "cta": {
          "kicker": "一括抽出",
          "primary": "MapsGrab をインストール",
          "secondary": "価格を見る",
          "note": "無料の月額割り当てが含まれています。クレジットカードはありません。"
        },
        "resultHeading": "結果",
        "copy": "コピー",
        "copied": "クリップボードにコピーされました。",
        "downloadCsv": "CSVをダウンロード",
        "genericError": "何か問題が発生しました。入力を確認して、再試行してください。"
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID ファインダー — URL から Google Maps Place ID を取得します。 MapsGrab",
          "description": "Google Maps を URL に貼り付けると、その Place ID、CID、および FID が即座に取得されます。無料のブラウザベースの Place ID ファインダー — サインイン不要、URL がデバイスから離れることはありません。"
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "ファインダー",
            "tail": ""
          },
          "description": "Google Maps の場所全体を URL に貼り付け、ワンクリックでその Place ID、CID、FID を読み出します。すべてはブラウザでデコードされます。URL はアップロードされません。"
        },
        "form": {
          "urlLabel": "Google Maps 場所 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Place ID を見つける",
          "errorShortLink": "短いリンク (maps.app.goo.gl) はサポートされていません。ブラウザでリンクを開き、アドレス バーから完全な URL を貼り付けます。",
          "errorInvalidUrl": "これは Google Maps の場所 URL とは思えません。 Google Maps で場所を開き、URL 全体をコピーします (「/maps/place/」と「@」または「data=」が含まれている必要があります)。",
          "errorNoIds": "この URL には場所識別子が見つかりませんでした。検索結果ページではなく、プレイス ページの URL をコピーしたことを確認してください。",
          "examplesLabel": "試す",
          "examples": {
            "city": "サンフランシスコ",
            "business": "コーヒーショップ・ポートランド",
            "shortLink": "ショートリンク"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "FID の 2 つの半分のうちの base64url",
          "cidNote": "FID 2後半、16進数→10進数",
          "fidNote": "URL の最後の 2 つの 0x… セグメント",
          "anatomy": {
            "fidHigh": "FID · 1前半",
            "fidLow": "FID · 2後半",
            "empty": "URL という場所を貼り付けます。ここでは、その場所に含まれる識別子が点灯します。"
          },
          "missing": "このリンクにはありません",
          "copyLabel": "{label} をコピー",
          "privacy": "ブラウザでデコードされます。URL はアップロードされません。"
        },
        "chips": [
          {
            "label": "Google API キー",
            "value": "必要ありません"
          },
          {
            "label": "あなたのURL",
            "value": "決してアップロードされていません"
          }
        ],
        "steps": {
          "head": {
            "kicker": "仕組み",
            "title": {
              "lead": "マップのリンクから ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "API キーもサインインもありません。識別子はコピーした場所 URL 内にすでに存在します。"
          },
          "items": [
            {
              "heading": "Google Maps に場所をオープンします",
              "body": "ビジネスを検索し、そのリストをクリックすると、場所のページが開きます。"
            },
            {
              "heading": "URL を完全にコピーします",
              "body": "アドレス バーから長い URL をコピーします。これには、ビジネス名、「@」座標セグメント、および「data=」パラメーターが含まれています。"
            },
            {
              "heading": "貼り付けてデコードする",
              "body": "上に貼り付けて、「Place ID を検索」を押します。 Place ID、CID、および FID が表示され、それぞれにコピー ボタンが付いています。"
            }
          ],
          "copiedBadge": "コピーされました",
          "note": "Maps.app.goo.gl のような短いリンクは、ドメインをまたがって辿らないとデコードできないため、最初にリンクを開いて完全なアドレスを貼り付けてください。"
        },
        "identifiers": {
          "head": {
            "kicker": "識別子",
            "title": {
              "lead": "3 つの ID、",
              "accent": "1 か所",
              "tail": ""
            },
            "lead": "Place ID は、Google の場所の安定した識別子です。「ChIJ」で始まる文字列で、企業が名前を変更したり移転したりしても有効です。"
          },
          "keys": {
            "placeId": "「ChIJ…」文字列は、Places API、レビュー ウィジェット、および予約システムによって使用されます。",
            "fid": "同じ機能を内部的に識別する 16 進値のペア。",
            "cid": "FID の後半の 10 進数形式。古いマップ URLs と広告ツールで使用されます。"
          },
          "derive": {
            "label": "Place ID と CID が FID から派生する方法",
            "source": "FID から URL",
            "protobuf": "protobuf · リトルエンディアン",
            "base64": "base64url",
            "secondHalf": "2後半",
            "hexToDecimal": "16進数→10進数"
          },
          "features": [
            {
              "heading": "API キーがありません",
              "body": "Place ID は、貼り付けた URL 内ですでにエンコードされているため、ツールはオフラインでデコードできます。"
            },
            {
              "heading": "レート制限なし",
              "body": "ルックアップ サービスは関係しません。マップ URL から Place ID への変換は決定的です。"
            },
            {
              "heading": "決してアップロードされていません",
              "body": "計算全体はブラウザーのタブで実行されます。貼り付けた URL がサーバーに送信されることはありません。"
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "Place ID は変更されることがありますか?",
              "answer": "めったに。 Google では、場所 ID を長期安定識別子として文書化していますが、場所が統合または再構築されると、少数の ID が廃止される可能性があります。 Place ID の消費者がそれを無効であると報告した場合は、その場所を再度検索し、保存されている値を更新します。"
            },
            {
              "question": "Place ID は CID と同じですか?",
              "answer": "いいえ。CID は古いマップのリンクや広告ツールで使用される 10 進数の識別子で、Place ID はプレイス API で使用される「ChIJ…」文字列です。これらは同じ機能を識別しますが、交換可能ではないため、このツールは両方をレポートします。"
            },
            {
              "question": "私のmaps.app.goo.glリンクが拒否されるのはなぜですか?",
              "answer": "短いリンクは、クロスドメイン リダイレクト後に完全な場所 ​​URL にのみ解決されます。これは、リンクをサードパーティに送信せずにブラウザー専用ツールで追跡することはできません。ブラウザで短いリンクを開き、アドレス バーに表示される完全な URL を貼り付けます。"
            },
            {
              "question": "これには Google API キーが必要ですか?",
              "answer": "いいえ。Place ID は、貼り付けた URL の内部ですでにエンコードされているため、ツールはオフラインでデコードできます。 Google API キーは、後で ID を使用して Places API を呼び出す場合にのみ必要です。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "プレイス ID ",
            "accent": "大規模な場所が必要ですか?",
            "tail": ""
          },
          "lead": "MapsGrab は、収集したすべてのビジネスの Place ID、CID、および FID を、他の 33 列とともに抽出し、CSV または JSON に直接エクスポートします。"
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google レビュー リンク ジェネレーター — 無料の直接レビュー URL | MapsGrab",
          "description": "Google Maps 場所 URL を顧客と共有できる直接 Google レビュー リンクに変換します。無料、ブラウザベースで、何もアップロードされません。"
        },
        "hero": {
          "title": {
            "lead": "Google レビューリンク ",
            "accent": "ジェネレーター",
            "tail": ""
          },
          "description": "Google Maps の場所を URL に貼り付けて、そのビジネスの直接の「レビューを書く」リンクを取得します。これが顧客の満足から Google のレビューへの最短経路です。"
        },
        "form": {
          "urlLabel": "Google Maps 場所 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "レビューリンクを生成",
          "errorShortLink": "短いリンク (maps.app.goo.gl) はサポートされていません。ブラウザでリンクを開き、アドレス バーから完全な URL を貼り付けます。",
          "errorInvalidUrl": "これは Google Maps の場所 URL とは思えません。 Google Maps で場所を開き、URL 全体をコピーします (「/maps/place/」と「@」または「data=」が含まれている必要があります)。",
          "errorNoIds": "この URL には場所識別子が見つかりませんでした。検索結果ページではなく、プレイス ページの URL をコピーしたことを確認してください。"
        },
        "result": {
          "linkLabel": "レビューリンク",
          "open": "開ける"
        },
        "howTo": [
          {
            "heading": "Google レビュー リンクとは何ですか?",
            "body": "レビュー リンクは、Google 上の 1 つの特定のビジネスのレビュー ダイアログを開くショートカットです。顧客にあなたのビジネスを検索してレビュー セクションまでスクロールして [レビューを書く] を押すよう依頼するのではなく、レビュー フォームに直接表示される URL (search.google.com/local/reviews?placeid=…) を送信します。企業はこれらのリンクをフォローアップ電子メール、カウンターの QR コード、取引後の SMS メッセージに挿入します。"
          },
          {
            "heading": "レビューリンクを生成する方法",
            "body": "Google Maps を開いてビジネスを見つけ、その場所ページを開きます。アドレス バーから長い URL をコピーし、上に貼り付けます。 [レビュー リンクを生成] を押すと、ツールがエンコードされた場所 ID を含む直接リンクを構築し、コピーしたり開いたりできるようになります。このリンクはユニバーサルです。デスクトップ ブラウザーと Google Maps モバイル アプリで動作します。"
          },
          {
            "heading": "プレイスIDの由来",
            "body": "このツールは、Place ID Finder と同じローカル デコードを再利用します。識別子はマップ URL にすでに存在しており、「ChIJ…」フォームへの変換は完全にブラウザ内で行われます。複数の場所を管理している場合は、場所ごとにこのプロセスを繰り返します。または、エクスポートのたびに MapsGrab に Place ID 列を含めて、スプレッドシートからレビュー リンクを一括生成できるようにします。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "レビューリンクの有効期限はありますか?",
              "answer": "いいえ。リンクは場所の場所 ID にバインドされており、Google によって安定した状態に保たれます。場所が Google Maps に存在する限り、リンクはレビュー ダイアログを開き続けます。"
            },
            {
              "question": "1 つのリンクを複数の場所に使用できますか?",
              "answer": "各レビュー リンクは 1 つの場所にのみ属します。場所ごとに個別のリンクを生成します。複数の場所を持つ企業は通常、場所 ID のテーブルを保持し、そこからリンクを派生します。"
            },
            {
              "question": "リンクを使用してレビューを求めることは許可されていますか?",
              "answer": "顧客に正直なレビューを求めるのは問題ありません。レビューを奨励したりフィルタリングしたりすることはそうではありません。 Google のポリシーでは、レビューとレビュー ゲーティングに対する報酬を禁止しています。すべての顧客に同じリンクを送信し、フィードバック自体を語らせます。"
            },
            {
              "question": "私のリンクではレビュー フォームではなく検索ページが開くのはなぜですか?",
              "answer": "これは、リンク内の場所 ID が間違っている場合に発生します。通常は、URL を手動で編集した結果です。元のマップの場所 URL からリンクを再生成し、Place ID が「ChIJ」で始まることを確認します。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "獲得",
            "tail": " のすべてのレビューを追跡します"
          },
          "lead": "MapsGrab は、あらゆるビジネス ページのレビュー (評価、テキスト、日付、所有者の返信) を取得するため、フィードバックが到着するのを確認して、より迅速に回答できます。"
        }
      },
      "emailChecker": {
        "seo": {
          "title": "メールチェッカー — メールアドレスを無料で検証 | MapsGrab",
          "description": "メールアドレスがメールを受信できるかを確認できます。無料のメールチェッカーがメールサーバーに問い合わせ、ステータス、配信可否、MX レコード、アカウント種別を表示します。"
        },
        "hero": {
          "title": {
            "lead": "メール ",
            "accent": "Checker",
            "tail": ""
          },
          "description": "メールアドレスを入力すると、そのメールサーバーに実際に受信できるかを問い合わせ、ステータス、MX レコード、アカウント種別、スコアを表示します。"
        },
        "guideLead": "形式チェックはブラウザ内で行われます。アドレス自体は当社サーバーに送信され、メールサーバーで検証されます。",
        "form": {
          "emailLabel": "電子メールアドレス",
          "emailPlaceholder": "name@example.com",
          "submit": "メールを検証",
          "submitting": "検証中…",
          "verifyingHint": "メールサーバーに確認しています。最大 1 分ほどかかる場合があります。",
          "invalidHeading": "このメール アドレスには問題があります:",
          "issues": {
            "empty": "最初にメールアドレスを入力してください。",
            "multipleAt": "アドレスに複数の「@」記号が含まれています。",
            "missingAt": "このアドレスには、ローカル部分とドメインを区切る「@」がありません。",
            "localEmpty": "「@」より前の部分は空です。",
            "localTooLong": "「@」より前の部分は、電子メール標準で許可されている 64 文字よりも長くなっています。",
            "localInvalidChars": "「@」より前の部分に、メールアドレスに使用できない文字（スペース、引用符、制御文字）が含まれています。",
            "localDotPosition": "ローカル部分のドットは、最初、最後、または連続して 2 回出現することはできません。",
            "domainEmpty": "「@」以降は空です。",
            "domainNoTld": "ドメインには終わりがありません (TLD)。「.com」や「.org」などを追加します。",
            "domainInvalidChars": "ドメインに使用できない文字 (スペース、アンダースコア、または記号) が含まれています。",
            "domainLabelHyphen": "ドメイン ラベルはハイフンで開始または終了することはできません。",
            "domainEmptyLabel": "ドメインには、連続した 2 つのドット、または空のセグメントが含まれています。",
            "domainTooLong": "ドメインは、電子メール標準で許可されている 253 文字よりも長くなっています。",
            "typoDomain": "このドメインは、一般的なメール プロバイダーのタイプミスのように見えます。"
          }
        },
        "result": {
          "labels": {
            "status": "ステータス",
            "deliverable": "配信可否",
            "mxRecords": "MX レコード",
            "email": "メールアドレス",
            "domain": "ドメイン",
            "accountType": "アカウント種別",
            "catchAll": "キャッチオールドメイン",
            "score": "スコア"
          },
          "statuses": {
            "safe": "安全",
            "invalid": "無効",
            "disabled": "停止済み",
            "disposable": "使い捨て",
            "inbox_full": "受信箱が満杯",
            "catch_all": "キャッチオール",
            "role_account": "ロールアカウント",
            "spamtrap": "スパムトラップ",
            "unknown": "不明"
          },
          "accountTypes": {
            "standard": "通常",
            "role": "ロールアカウント",
            "disposable": "使い捨て",
            "free": "フリーメール"
          },
          "yes": "はい",
          "no": "いいえ",
          "noMx": "見つかりません",
          "unavailable": "検証サービスに接続できませんでした。しばらくしてからもう一度お試しください。",
          "rateLimited": "本日の無料検証回数を使い切りました。明日もう一度お試しください。"
        },
        "howTo": [
          {
            "heading": "このチェッカーで確認できること",
            "body": "受信側のメールサーバーに、メールボックスが存在してメールを受け付けるかを問い合わせます。送信サーバーが配信前に行う確認と同じ方法で、実際にメールは送信しません。結果には、総合ステータス、配信可否、ドメインの MX レコード、アカウント種別（通常、info@ や sales@ などのロールアカウント、使い捨て、フリーメール）、ドメインがキャッチオールかどうか、0〜100 のスコアが表示されます。"
          },
          {
            "heading": "メールアドレスの確認方法",
            "body": "アドレスを 1 件入力または貼り付けて、「メールを検証」を押します。形式の問題はブラウザ内で一覧表示され、そのアドレスは送信されません。「gmial.com」のように主要プロバイダーのタイプミスと思われるドメインは指摘されますが、検証は止まりません。形式が正しいアドレスは当社サーバーに送信され、メールサーバーで確認されます。通常は数秒、長いと 1 分ほどかかります。"
          },
          {
            "heading": "結果の読み方",
            "body": "「安全」は、メールボックスが存在しメールを受け付けることを意味します。「無効」と「停止済み」のアドレスはバウンスし、「スパムトラップ」には決して送信すべきではありません。キャッチオールのドメインはあらゆるアドレスを受け付けるため、メールボックス自体は確認できません。ロールアカウント、使い捨てアドレス、受信箱が満杯のアドレスは、営業メールの送信先としてリスクがあります。「不明」はメールサーバーから明確な回答がなかったことを示すため、時間をおいて再試行してください。MapsGrab は各ビジネスの公式サイトからメールアドレスを収集します。連絡する前に、このチェッカーで手早く確認できます。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "このツールはメールボックスが実際に存在するかを確認しますか？",
              "answer": "はい。形式に加えて、受信側のメールサーバーにそのアドレス宛てのメールを受け付けるかを問い合わせます。実際にメールは送信しません。キャッチオールのドメインなどでサーバーが明確に回答しない場合は、推測せずにその旨を表示します。"
            },
            {
              "question": "何件まで確認できますか？",
              "answer": "1 日 5 件まで無料で、1 件ずつ確認できます。形式チェックで問題が見つかったアドレスは送信されないため、回数には含まれません。"
            },
            {
              "question": "ここで問題がなくても、バウンスすることはありますか？",
              "answer": "あります。確認後にメールボックスが閉鎖されたり満杯になったりすることがあり、いったん受け付けてから後でバウンスするサーバーもあります。「安全」は確認時点でメールを受け付けたことを示すもので、誰かが読むことまでは保証しません。"
            },
            {
              "question": "「name@localhost」が拒否されるのはなぜですか？",
              "answer": "このチェッカーは、公開されたトップレベルドメイン（TLD）を持つドメインを必須としています。TLD のないアドレスは外部のインターネットからメールを受信できないためです。このようなアドレスはブラウザ内で指摘され、検証には送信されません。"
            },
            {
              "question": "入力したメールアドレスはどう扱われますか？",
              "answer": "当社サーバーに送信され、当社が利用するメール検証サービスが受信側のメールサーバーに確認します。そのアドレスにメールが送信されることはありません。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "検証",
            "tail": " の価値のあるメールを収集する"
          },
          "lead": "MapsGrab は、抽出したすべてのビジネスの背後にある電子メール アドレスとソーシャル プロファイルを、各ビジネスの Web サイトから直接見つけます。"
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "緯度経度を DMS に変換 — 10 進度度から度分秒へ | MapsGrab",
          "description": "10 進数の緯度と経度を度、分、秒 (DMS) 形式に即座に変換します。無料のブラウザベースの座標コンバータ。アップロードはありません。"
        },
        "hero": {
          "title": {
            "lead": "緯度経度を ",
            "accent": "DMS",
            "tail": " に変換"
          },
          "description": "緯度と経度を 10 進数で入力し、同じ座標を度、分、秒で読み取ります。半球文字で表示され、すぐにコピーできます。"
        },
        "form": {
          "latitudeLabel": "緯度 (10 進数、-90 ～ 90)",
          "longitudeLabel": "経度 (10 進数、-180 ～ 180)",
          "placeholder": "37.774929",
          "submit": "DMS に変換",
          "errorLatitude": "緯度は、-90 から 90 までの数値である必要があります。",
          "errorLongitude": "経度は、-180 から 180 までの数値である必要があります。"
        },
        "result": {
          "dms": "DMS の座標"
        },
        "howTo": [
          {
            "heading": "10 進度および DMS とは何ですか?",
            "body": "マップとスプレッドシートは、座標を 10 進度 (37.774929、-122.419416 のように、軸ごとに 1 つの符号付き数値) として保存します。測量、海図、および多くの不動産文書では、古い 60 進表記が使用されています。つまり、37° 46' 29.74\" N、122° 25' 9.90\" W のように、半球文字を使用した度、分、秒です。どちらも同じことを表します。ポイント; DMS 形式は、分数を連続した小さな単位に単純に分割します。1 分は 1/60 度、1 秒は 1/60 分です。"
          },
          {
            "heading": "変換方法",
            "body": "10 進数の緯度と経度を貼り付け、「DMS に変換」を押します。負の値は南半球と西半球にマッピングされ、S と W として報告されます。秒は小数点 2 桁で表示されます。地上解像度は約 1 メートルで、一般的な GPS キャプチャよりも正確です。結果をドキュメントの場合は 1 行として、スプレッドシートの場合は個別のフィールドとしてコピーします。"
          },
          {
            "heading": "地図データの作業にとってこれが重要な理由",
            "body": "ツール間でビジネス データを移動する場合、調整の往復が日常的な摩擦点になります。Google Maps は小数をエクスポートしますが、地籍ワークフローと印刷ワークフローは DMS を想定しています。 MapsGrab は、この摩擦を大規模に低く抑えます。抽出されたすべてのビジネスにはすでにその緯度と経度がエクスポートされており、このページで使用しているのと同じ式を使用してバッチ座標変換をオフラインで実行できます。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "DMS の結果はどの程度正確ですか?",
              "answer": "秒は小数点第 2 位まで表示されます。緯度の 1 秒はおよそ 30 メートルであるため、小数点以下 2 桁は約 30 センチメートルに分解されます。これは、基礎となる GPS データよりもはるかに厳密です。精度は変換ではなく入力によって制限されます。"
            },
            {
              "question": "ここでの N、S、E、W は何を意味しますか?",
              "answer": "これらは 10 進数値の符号を置き換えます。正の緯度は北 (N)、負の緯度は南 (S) です。正の経度は東 (E)、負の経度は西 (W) です。このツールは標識から文字を自動的に選択します。"
            },
            {
              "question": "ここで DMS を 10 進数に変換できますか?",
              "answer": "はい — このサイトのコンパニオン ツール「DMS を DD に変換」を使用してください。同じ実装で両方の方法を変換すると、異なる式間の丸めドリフトが回避されます。"
            },
            {
              "question": "私の座標データはアップロードされていますか?",
              "answer": "いいえ、変換はブラウザのタブで単純な算術演算で行われます。何も入力してもページから消えません。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "あらゆるビジネスのコーディネート、すでに ",
            "accent": "抽出",
            "tail": ""
          },
          "lead": "MapsGrab は、エクスポートする各行に緯度と経度を書き込みます。次のルーティングまたは地域プロジェクトで手動で座標を検索する必要はありません。"
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "DMS を DD に変換します — 度分秒を 10 進数の度に変換します | MapsGrab",
          "description": "度、分、秒の座標を 10 進度に瞬時に変換します。無料のブラウザベースの DMS から DD コンバーター。何もアップロードされていません。"
        },
        "hero": {
          "title": {
            "lead": "DMS を DD ",
            "accent": "(緯度、経度)",
            "tail": " に変換します"
          },
          "description": "両方の軸に度、分、秒を入力すると、きれいな 10 進数の度が得られます。Google Maps、スプレッドシート、および MapsGrab 形式が理解されます。"
        },
        "form": {
          "latitudeHeading": "緯度 (北/南)",
          "longitudeHeading": "経度(東/西)",
          "degreesLabel": "学位",
          "minutesLabel": "分（角度）",
          "secondsLabel": "秒（角度）",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "10進数に変換",
          "errorValues": "度はゼロまたは正の整数である必要があり、分と秒は 0 から 60 の間である必要があります。"
        },
        "result": {
          "dd": "10 進数の座標"
        },
        "howTo": [
          {
            "heading": "DMS を 10 進度に変換し直すのはなぜですか?",
            "body": "度分秒は人間向けの表記法ですが、Google Maps 検索、GIS インポート、スプレッドシートの距離式、ジオコーディング パイプラインなど、事実上すべてのマシン向けシステムは 10 進度を必要とします。変換は、単純な加重合計 (度プラス分を 60 で割ったものと秒を 3600 で割ったもの) で、半球の文字が符号を決定します。"
          },
          {
            "heading": "変換方法",
            "body": "緯度と経度に度、分、秒を入力し、半球の文字 (N/S および E/W) を選択します。 [10 進数に変換] を押すと、ツールは両方の軸を小数点以下 6 桁の符号付き 10 進数として出力します。これは、地上でおよそ 11 センチメートルに解決されます。これは、ビジネス拠点での使用には十分以上です。結果を Google Maps またはスプレッドシートに直接貼り付けます。"
          },
          {
            "heading": "座標データの一貫性を保つ",
            "body": "混合表記は、インポート後に場所が間違った海に入ってしまう通常の理由です。 10 進度を一度決定し、境界ですべてを変換することで、パイプラインを正常に保ちます。 MapsGrab はすでに 10 進度で座標をエクスポートしているため、拡張機能で収集されたデータは、変換手順なしで GIS および BI ツールに取り込まれます。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "小数点以下何桁必要ですか?",
              "answer": "小数点以下 6 桁はおよそ 11 センチメートルに分解されます。これは消費者用 GPS の精度を超えています。ビジネス拠点としては 5 か所 (約 1 メートル) あれば十分です。小数点以下を減らすと、意図的に要点がぼやけます。"
            },
            {
              "question": "フィールドはどの範囲を満たす必要がありますか?",
              "answer": "分と秒の範囲は 0 から 60 未満です。緯度は 90 まで、経度は 180 までです。値がグローブの外に到達すると、コンバーターはそれを報告します。"
            },
            {
              "question": "S または W を選択する場合、負の数値を入力する必要がありますか?",
              "answer": "いいえ、半球の文字はすでに記号をエンコードしています。符号付きの値と矛盾する文字を同時に入力すると、ツールは推測ではなく矛盾にフラグを立てます。"
            },
            {
              "question": "変換はサーバー上で行われますか?",
              "answer": "いいえ。数式はブラウザで実行されます。入力した内容はどこにも送信されません。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "手動座標作業をスキップ ",
            "accent": "スケール",
            "tail": ""
          },
          "lead": "MapsGrab は、収集したすべてのビジネスの 10 進数の緯度と経度を、住所、電話番号、Place ID 列の横にエクスポートします。"
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "一括キーワード ジェネレーター — キーワード + 場所の組み合わせ | MapsGrab",
          "description": "ローカル SEO およびマップ スクレイピング タスク用に、キーワードと場所の組み合わせを一括で生成します。 2 つのリストを貼り付け、すべての組み合わせを取得し、CSV としてダウンロードします。無料。"
        },
        "hero": {
          "title": {
            "lead": "一括キーワード ",
            "accent": "ジェネレーター",
            "tail": ""
          },
          "description": "キーワードと場所を貼り付け、すぐに貼り付けられるリストまたは CSV としてすべての「キーワード + 場所」の組み合わせを取得します。これは、ローカル検索キャンペーンをシードする最速の方法です。"
        },
        "form": {
          "keywordsLabel": "キーワード (1 行に 1 つ)",
          "keywordsPlaceholder": "デザイン事務所\nコーヒーショップ\n配管工",
          "locationsLabel": "場所 (1 行に 1 つ)",
          "locationsPlaceholder": "New York\nシカゴ\nオースティン",
          "orderLabel": "組み合わせ順",
          "keywordFirst": "キーワード + 場所 (デザイン会社 New York)",
          "locationFirst": "場所 + キーワード (New York デザイン会社)",
          "submit": "組み合わせを生成する",
          "resultCount": "{count} 個の組み合わせが生成されました。",
          "errorKeywords": "少なくとも 1 つのキーワードを追加します。",
          "errorLocations": "少なくとも 1 つの場所を追加します。"
        },
        "howTo": [
          {
            "heading": "キーワードの一括生成は何のために行われますか?",
            "body": "ローカル検索キャンペーンは、サービスを提供するすべての都市、地区、近隣地域で同じサービスを繰り返すという組み合わせで成り立っています。 10 か所にわたる 10 のキーワードは、「デザイン代理店 New York」、「デザイン代理店シカゴ」など、100 の検索フレーズに相当します。これらを手書きすると間違いが発生しやすくなります。 2 つのリストからそれらを生成するには数秒かかりますが、何も見逃されないことが保証されます。"
          },
          {
            "heading": "組み合わせを生成する方法",
            "body": "最初のボックスにキーワードを 1 行に 1 つずつ貼り付け、2 番目のボックスに場所を貼り付けます。キーワードと場所のどちらを先に置くかを選択し、「生成」を押します。すべてのキーワードがすべての場所とペアになっており、空白行と重複が削除され、完全なリストがカウントとともに下に表示されます。これを Google 広告キーワード リスト、Google トレンド チェック、またはマップ スクレイピング タスク キューに直接コピーします。"
          },
          {
            "heading": "キーワードリストから収集データまで",
            "body": "古典的な次のステップは、各組み合わせを Google Maps 検索として実行し、結果を収集することです。このループはまさに MapsGrab が自動化するものです。拡張機能はキーワード リストをバッチ タスクとして受け入れ、検索を 1 つずつ実行し、見つかったすべてのビジネスをエクスポートします。そのため、ここで生成される組み合わせは、手動でコピーすることなく構造化された行になります。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "組み合わせは何通り生成できますか?",
              "answer": "ブラウザーが保持できる限り、ツールは 2 つのリストを乗算し、ローカルで重複を排除します。 1 万通りの組み合わせでも大丈夫です。非常に大きなバッチの場合は、テキストエリアをコピーするよりも CSV ダウンロードの方が実用的です。"
            },
            {
              "question": "重複は削除されますか?",
              "answer": "はい。各リスト内の重複行はペアリングの前に削除され、出力には各キーワードと場所のペアが選択した順序で 1 回だけ含まれます。"
            },
            {
              "question": "どの順序を使用すればよいですか?",
              "answer": "どちらも実際の検索動作です。 「Plumber Austin」は、人々がマップに入力する方法と似ています。 「オースティンの配管工」は、従来の SEO の表現のように読めます。両方の注文を生成することは、検索バリアントをカバーする一般的な方法です。"
            },
            {
              "question": "市区町村や郵便番号を場所として使用できますか?",
              "answer": "はい。マップの検索サフィックスとして意味のあるものはすべて機能します (地区、郵便番号、大都市圏、または完全な「都市、州」のペア)。場所ごとに 1 行。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "キーワードリストを",
            "accent": "結果",
            "tail": "にします"
          },
          "lead": "MapsGrab バッチ タスクは、マップ検索としてすべてのキーワードを実行し、その背後にあるビジネス (CSV または JSON) をレビュー、写真、連絡先の強化とともにエクスポートします。"
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "オンラインで CSV ファイルを結合 — 複数の CSV ファイルを無料で結合 | MapsGrab",
          "description": "複数の CSV ファイルをオンラインで 1 つのファイルに結合します。列ヘッダーは結合によって自動的に配置されます。無料、プライベート、完全にブラウザベースです。"
        },
        "hero": {
          "title": {
            "lead": "CSV ファイル ",
            "accent": "オンライン",
            "tail": " を結合"
          },
          "description": "2 つ以上の CSV ファイルをアップロードし、結合された 1 つのファイルをダウンロードします。列はヘッダーごとに整列され、欠落しているフィールドは空のままになります。ファイルがブラウザから離れることはありません。"
        },
        "form": {
          "filesLabel": "CSV ファイル",
          "filesHint": "2 つ以上の .csv ファイルを選択します。行 2 に翻訳されたラベルが含まれる各ファイルをチェックして、その行をスキップします。マージされた CSV には、フィールド名のヘッダー行が 1 つ保持されます。ファイルはブラウザ内に残ります。",
          "translationRow": "{name} の行 2 (翻訳されたラベル) をスキップします",
          "submit": "ファイルを結合する",
          "errorNoFiles": "マージする CSV ファイルを少なくとも 2 つ選択します。",
          "errorEmptyFile": "ファイルの 1 つが空であるか、ヘッダー行がありません: {name}",
          "fileSummary": "{name} — {rows} データ行",
          "resultSummary": "{files} ファイルを {rows} 行 × {columns} 列にマージしました。",
          "previewLabel": "CSV プレビューを統合しました"
        },
        "howTo": [
          {
            "heading": "ここでのマージは何をするのでしょうか?",
            "body": "マージすると、複数の CSV エクスポートが 1 つのテーブルにスタックされます。列はすべてのファイルにわたってヘッダー名によって整列され、各データ行の値は一致するヘッダーの下に保持されます。ファイルは選択した順序で上から下に結合されるため、結果は 1 つの連続したデータセットとして読み取られます。一部のファイルにのみ存在する列は出力に残ります。それらのないファイルの行は空のセル、つまりすべてのヘッダーの結合を取得します。"
          },
          {
            "heading": "CSV ファイルをマージする方法",
            "body": "2 つ以上の .csv ファイルを選択します。たとえば、マップ スクレイピング ワークフローの毎週のエクスポートなどです。 「ファイルを結合」を押すと、ツールはブラウザ内のすべてのファイルを解析し、それぞれの行数を報告し、結合されたテーブルを構築します。これを単一の CSV としてダウンロードすると、Excel、Google シート、またはデータベースのインポートで適切に開くことができます。"
          },
          {
            "heading": "複数実行のデータ収集用に構築",
            "body": "一般的な使用例は実行の追加です。各 MapsGrab 抽出セッションは独自の CSV をエクスポートし、重複排除とクリーニングの前にマージによってその週のセッションが 1 つのデータセットにまとめられます。パーサーは引用符で囲まれたフィールド、埋め込まれたカンマ、セル内の改行 (RFC 4180) を処理するため、複数行のアドレスを含むエクスポートやレビュー スニペットが正しくマージされます。"
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "よくある質問",
            "tail": ""
          },
          "items": [
            {
              "question": "ファイルに異なる列がある場合はどうなりますか?",
              "answer": "マージされたファイルには、最初に出現した順序ですべてのヘッダーの結合が含まれます。列のないファイルの行には、その列に空のセルが入ります。何も削除されたり、名前が変更されたりすることはありません。"
            },
            {
              "question": "私のファイルはサーバーにアップロードされていますか?",
              "answer": "いいえ。ファイルはブラウザの FileReader API で読み取られ、タブのメモリにマージされます。何も送信されず、ページを閉じるとすべてが消去されます。"
            },
            {
              "question": "マージすると重複した行は削除されますか?",
              "answer": "いいえ — 結合は、列が整列した直線の連結です。重複排除 (Place ID などによる) は、マージされたファイルに対して実行する別のクリーニング手順です。"
            },
            {
              "question": "ファイルはどのくらいの大きさまで可能ですか?",
              "answer": "制限はブラウザ タブのメモリであり、固定数値ではありません。一般的なビジネス データのエクスポート (数千行から数十万行) の場合、マージは瞬時に行われます。非常に大きなファイルの場合は、バッチでマージします。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "実行ごとに 1 つのエクスポート — または ",
            "accent": "1 つのデータセット",
            "tail": ""
          },
          "lead": "MapsGrab は、フィールド選択と Place ID 重複排除を使用してセッションごとにクリーンな CSV/JSON をエクスポートするため、複数実行のデータセットはすでにほぼマージされ始めます。"
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "会社",
  "about": {
    "navLabel": "について",
    "seoTitle": "MapsGrab について |製品と境界",
    "seoDescription": "MapsGrab は、パブリック ビジネス データ用のマップ データ ツールキットです。ブラウザ拡張機能、クラウド オンライン スクレイパー、API および MCP サーバー、および無料の Web ツールです。データ境界がどこにあるのかを学びましょう。",
    "hero": {
      "eyebrow": "MapsGrab について",
      "title": {
        "lead": "地図データを",
        "accent": "手軽に",
        "tail": "取得"
      },
      "intro": "MapsGrab は、Google Maps で公開されている店舗・事業者情報を収集し、整理された構造化データに変換するツールを提供しています。Edge と Firefox 向けのブラウザ拡張機能、クラウドで動作するオンラインスクレイパー、API と MCP サーバー、無料の Web ツール（大半はブラウザ内だけで動作）を利用できます。",
      "contactLabel": "サポートに連絡する",
      "extensionLabel": "拡張機能を探索する",
      "stageLabel": "早期アクセス",
      "updatedLabel": "公開されレビューされました",
      "updatedAt": "8 月 31, 2026",
      "chips": [
        {
          "label": "収集します",
          "value": "公開データのみ"
        },
        {
          "label": "拡張結果",
          "value": "ブラウザで"
        },
        {
          "label": "エクスポート",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "ドラッグして回転します"
    },
    "build": {
      "kicker": "私たちが構築するもの",
      "title": {
        "lead": "1 つのツールキットで ",
        "accent": "4",
        "tail": " の方法が可能"
      },
      "lead": "ブラウザ拡張機能、クラウドベースのオンライン スクレイパー、または API を選択します。この拡張機能は独自のブラウザ内で動作します。オンライン スクレイパーと API は 1 つのクラウド エンジンを共有し、MCP サーバーはその API を AI エージェントに提供します。",
      "hub": {
        "title": "MapsGrab データ ツールキット",
        "detail": "ビジネスデータ、レビュー、写真、メール、ソーシャルエンリッチメント"
      },
      "tags": {
        "extension": [
          "36-列抽出",
          "レビューと写真",
          "バッチタスク"
        ],
        "online": [
          "キーワードをバッチ処理する",
          "連絡先の強化",
          "タスクごとに 1 つの 37 列 CSV"
        ],
        "api": [
          "ビジネスデータ",
          "レビュー",
          "構造化 JSON"
        ],
        "mcp": [
          "3つのツール",
          "Streamable HTTP",
          "OAuth または API キー"
        ]
      },
      "toolsLead": "さらに無料の Web ツール。",
      "toolsText": "このサイトの無料 Web ツールは、何もインストールせずに、ID の配置、リンクのレビュー、座標変換、CSV のマージなどの小さなジョブを処理します。",
      "toolsLabel": "無料のウェブツール"
    },
    "principles": {
      "kicker": "原則",
      "title": {
        "lead": "",
        "accent": "境界",
        "tail": " はどこですか"
      },
      "lead": "MapsGrab はデータに関して意図的に保守的です。これらは私たちが守る製品ルールです。",
      "publicData": {
        "title": "公開データのみ",
        "text": "公開されているビジネス情報のみ。ページの訪問者がすでに見ることができる情報のみです。",
        "visibleTag": "すべての訪問者に表示されます",
        "privateTag": "プライベートアカウント"
      },
      "localFirst": {
        "title": "地元第一主義",
        "text": "この拡張機能と無料の Web ツールを使用すると、設定と結果はサーバーではなくブラウザーに保存されます。ただしメールチェッカーは例外で、入力したアドレスを当社のサーバーへ送信し、メール検証サービスが確認します。メールが送信されることはありません。オンライン スクレイパー、API、MCP サーバーはクラウドで実行され、オンライン スクレイパーの結果はアカウントに保存されます。",
        "storage": "ローカルストレージ",
        "rows": [
          "設定",
          "結果",
          "バッチタスク"
        ]
      },
      "backend": {
        "title": "拡張機能と無料ツール: 4 つのバックエンド ジョブ",
        "text": "拡張機能と無料の Web ツールの場合、バックエンドはリモート構成、アカウントとクォータのステータス、オプションの電子メール/ソーシャル エンリッチメント、および最小限の使用ログという 4 つのことを正確に処理します。唯一の例外はメールチェッカーで、バックエンドは入力されたアドレスをメール検証サービスにも渡して確認します。メールが送信されることはありません。",
        "chips": [
          "構成",
          "クォータ",
          "エンリッチメント",
          "使用ログ"
        ]
      },
      "never": {
        "title": "広告はありません。トラッカーはありません。データ販売はありません。",
        "text": "広告はなく、拡張機能にはサードパーティのトラッカーはなく、データの販売やレンタルもありません。",
        "chips": [
          "広告",
          "サードパーティのトラッカー",
          "データの販売"
        ]
      },
      "inWriting": {
        "kicker": "書面にて",
        "title": "プライバシーポリシーと規約",
        "text": "これらの各ルールは、プライバシー ポリシーとサービス利用規約に詳しく記載されています。",
        "link": "プライバシーポリシーを読む"
      }
    },
    "dataFlow": {
      "kicker": "データの移動方法",
      "title": {
        "lead": "あなたに残るもの、そして",
        "accent": "私たちに届くもの",
        "tail": ""
      },
      "lead": "この拡張機能は公開されているデータに対して機能し、結果をブラウザーに保持します。拡張機能と無料の Web ツールの場合、バックエンドは構成、クォータ、オプションのエンリッチメント、および最小限の使用ログのみを強化します。ただしメールチェッカーは例外で、入力したアドレスを当社のサーバーへ送信し、メール検証サービスが確認します。メールが送信されることはありません。代わりに、オンライン スクレイパー、API、MCP サーバーがクラウドで実行され、オンライン スクレイパーの結果がアカウントに保存されます。",
      "source": {
        "label": "ソース",
        "title": "Google Maps ページにアクセスしました",
        "text": "公開ビジネスデータ — 名前、住所、電話番号、ウェブサイト、評価、レビュー、写真。"
      },
      "browser": {
        "label": "あなたのブラウザ · ローカルファースト",
        "storage": "ローカル ストレージ · IndexedDB",
        "rows": [
          "設定",
          "抽出結果",
          "バッチタスクの状態"
        ],
        "badge": "ブラウザに保存されます"
      },
      "backend": {
        "label": "MapsGrab バックエンド · 4 つの目的",
        "lanes": [
          {
            "title": "リモート設定",
            "text": "抽出を継続的に機能させるページ構造のプリセット"
          },
          {
            "title": "アカウントと割り当て",
            "text": "サインイン、プランステータス、月次使用量会計"
          },
          {
            "title": "電子メールとソーシャルエンリッチメント",
            "text": "機能が使用されている場合、連絡先が公開リストに表示されます"
          },
          {
            "title": "使用状況のログ記録",
            "text": "機能の使用状況とエラーの最小限の記録"
          }
        ]
      },
      "never": {
        "label": "一度もない",
        "items": [
          "広告なし",
          "拡張機能にはサードパーティのトラッカーはありません",
          "個人データの販売またはレンタルの禁止",
          "抽出した Google Maps ページを超える閲覧履歴は収集されません"
        ]
      },
      "note": "この Web サイトは、Google Analytics 4 を使用してページの総使用量を測定します。拡張機能自体には分析は含まれていません。",
      "noteLink": "プライバシーポリシーを読む"
    },
    "status": {
      "kicker": "状態",
      "title": {
        "lead": "早期アクセス、",
        "accent": "無料",
        "tail": " で開始可能"
      },
      "access": {
        "title": "早期アクセス",
        "text": "この製品は早期アクセス中です。 Edge アドオンと Firefox アドオンのストア掲載情報は現在最終決定中です。",
        "link": "インストールガイド"
      },
      "quota": {
        "title": "無料の月間割り当て",
        "text": "この拡張機能は、毎月の無料割り当ての範囲内であれば、アカウントがなくても機能します。",
        "link": "含まれるもの"
      },
      "paid": {
        "title": "頻繁に使用する場合の有料プラン",
        "text": "有料プランでは、頻繁に使用する場合は制限が引き上げられます。現在のレベルについては、「価格」ページを参照してください。",
        "link": "価格を見る"
      }
    }
  },
  "contact": {
    "navLabel": "接触",
    "seoTitle": "MapsGrab サポートにお問い合わせください",
    "seoDescription": "アカウント、ブラウザ拡張機能、請求、ツール、プライバシーのリクエストについては、MapsGrab にお問い合わせください。",
    "eyebrow": "MapsGrab に連絡してください",
    "title": {
      "lead": "",
      "accent": "人間",
      "tail": "と話す"
    },
    "intro": "私たちに書いていただければ、誰かがそれを読んでくれます。現在、サポートは MapsGrab を構築するチームによって直接処理されています。",
    "emailCardLabel": "サポートメール",
    "copyEmail": "{email} をコピー",
    "emailLabel": "電子メールサポート",
    "emailSubject": "MapsGrab サポート リクエスト",
    "responseTimes": "サポートメールには通常 1 営業日以内に返信させていただきます。最初にアカウントの所有権を確認する必要がある場合、プライバシーのリクエストには数日かかる場合があります。",
    "include": {
      "title": "何を含めるか",
      "text": "正確なレポートは、機密のアカウント情報を尋ねることなく、影響を受けるワークフローを特定するのに役立ちます。",
      "items": [
        "ページ URL と実行しようとしたアクション",
        "ブラウザ名とバージョン",
        "正確なエラー メッセージと役立つ場合のスクリーンショット",
        "支払いカードの詳細を含まない、請求に関する質問のための注文番号"
      ]
    },
    "topics": {
      "title": "私たちがお手伝いできること",
      "items": [
        "ブラウザ拡張機能のインストールと設定",
        "アカウントアクセスとサインインの問題",
        "割り当て、サブスクリプション、更新、支払いに関する質問",
        "Web ツールの問題と機能リクエスト",
        "プライバシーとアカウントデータのリクエスト"
      ]
    },
    "aboutLabel": "について",
    "privacyLabel": "プライバシーポリシー",
    "termsLabel": "利用規約"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "家",
    "crumbLegal": "法律上の",
    "switchLabel": "法的文書",
    "readTime": "{minutes} 分で読みました",
    "sectionCount": "{count} セクション",
    "tocTitle": "このページでは",
    "tocLabel": "{title} セクション",
    "glanceKicker": "一目でわかる",
    "glanceNote": "以下に全文を要約します。",
    "anchorLabel": "リンクを「{title}」にコピーします",
    "copyEmail": "{email} をコピー",
    "contactSupport": "サポートに連絡する",
    "nextLabel": "次の文書"
  },
  "terms": {
    "navLabel": "条項",
    "seoTitle": "利用規約 | MapsGrab",
    "seoDescription": "MapsGrab 利用規約: 許容される使用法、収集されたデータに対するユーザーの責任、購入、免責事項、および当社への連絡方法。",
    "title": "利用規約",
    "intro": "これらの規約は、MapsGrab (ブラウザ拡張機能、この Web サイト、および無料の Web ツール) の使用に適用されます。サービスをご利用になる前に必ずお読みください。",
    "updatedLabel": "最終更新日",
    "updatedAt": "8 月 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "許容される使用、収集されたデータに対するユーザーの責任、購入、免責事項、および当社への連絡方法。",
    "helpTitle": "これらの規約について質問がありますか?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "公開データのみ",
        "text": "このサービスは、閲覧するページに公開されている情報に対してのみ機能します。"
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "あなたの使用、あなたの責任",
        "text": "あなたに適用される法律の範囲内で、何を収集し、どのように使用するかを決定します。"
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "始めるのにアカウントは必要ありません",
        "text": "この拡張機能は、毎月の無料割り当ての範囲内であれば、アカウントがなくても機能します。"
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "いつでもキャンセル可能",
        "text": "サブスクリプションはキャンセルされるまで更新されます。キャンセルすると、今後の更新が停止されます。"
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "規約への同意",
        "paragraphs": [
          "MapsGrab にアクセスまたは使用すると、これらの規約に同意したことになります。これらに同意できない場合は、拡張機能をインストールしたり、Web サイトやツールを使用したりしないでください。"
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "サービスの内容",
        "paragraphs": [
          "MapsGrab は、アクセスした Google Maps ページに公開されている情報 (ビジネスの詳細、レビュー、写真、関連する連絡先情報など) を収集し、エクスポートするのに役立ちます。このサービスは、Microsoft Edge および Firefox のブラウザ拡張機能、この Web サイト、およびブラウザで実行される無料の Web ツールで構成されます。"
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "公開されているデータ",
        "paragraphs": [
          "このサービスは、閲覧するページに公開されている情報のみを処理するように設計されています。プライベートアカウント、ゲートされたコンテンツ、または訪問者が閲覧できる範囲を超えた特別なアクセスを必要とするデータにはアクセスしません。"
        ]
      },
      {
        "id": "your-responsibility",
        "title": "あなたの責任",
        "paragraphs": [
          "何を収集し、どのように使用するかはお客様が決定し、その使用についてはお客様が責任を負います。収集した情報を使用する場合は、お客様およびお客様の目的に適用される法律を遵守してください。",
          "特に、次のことを行わないことに同意します。"
        ],
        "items": [
          "違法行為または第三者の権利を侵害する目的でサービスを使用すること。",
          "個人を再識別するか、収集されたビジネス データから個人のプロファイルを構築します。",
          "収集した連絡先詳細をスパムまたは迷惑な大量メッセージに使用します。",
          "当社との個別の契約を結ばずに、収集された生のデータを競合するデータ製品として再販する。",
          "サービスやサービスが連携するプラットフォームを妨害したり、過負荷をかけたり、中断させようとしたりする。"
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "アカウントと割り当て",
        "paragraphs": [
          "この拡張機能は、毎月の無料割り当ての範囲内であれば、アカウントがなくても機能します。一部の機能 (上限の引き上げ、購入、クラウド統合) にはアカウントが必要です。あなたは、自分のアカウント資格情報を安全に保ち、自分のアカウントで行われるアクティビティに対して責任を負います。"
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "購入と購読",
        "paragraphs": [
          "有料プランについては、「価格」ページに記載されています。価格、割り当て、請求期間は購入前に表示され、購入はチェックアウト時に提供される支払いプロバイダーを通じて処理されます。サブスクリプション プランはキャンセルされるまで自動的に更新され、いつでもキャンセルできます。キャンセルすると、今後の更新が停止されます。"
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "サービスは現状のまま提供されます",
        "paragraphs": [
          "サービスは「現状のまま」および「利用可能な状態」で提供されます。プラットフォームは頻繁に変更されるため、収集機能はいつでも部分的または全体的に動作しなくなる可能性があります。 MapsGrab は、明示的か黙示的かを問わず、中断のない可用性、収集されたデータの完全性、または特定の目的への適合性については保証しません。",
          "当社はサービスの一部を変更、一時停止、または中止する場合があり、また本規約を更新する場合があります。変更が重大な場合には、このウェブサイト上で発表します。変更が有効になった後も使用を継続すると、更新された規約に同意したことになります。"
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "責任の制限",
        "paragraphs": [
          "法律で認められる最大限の範囲で、MapsGrab およびその運営者は、サービスの使用または使用不能から生じる、利益またはデータの損失を含む、間接的、偶発的、特別、または結果的な損害に対して責任を負いません。"
        ]
      },
      {
        "id": "contact",
        "title": "接触",
        "paragraphs": [
          "これらの規約に関する質問は、support@mapsgrab.com に送信できます。"
        ]
      }
    ],
    "coverage": {
      "label": "取材メモ",
      "badge": "未定",
      "lead": "まだカバーされていません:",
      "text": "オンライン スクレイパー (クラウド実行)、スクレイパー / レビュー / 写真 API および MCP サーバー。上記のテキストは、拡張機能、この Web サイト、および無料の Web ツールについて説明しています。"
    }
  },
  "privacy": {
    "navLabel": "プライバシー",
    "seoTitle": "プライバシーポリシー | MapsGrab",
    "seoDescription": "MapsGrab プライバシー ポリシー: 拡張機能と Web サイトが処理するデータ、保存場所、バックエンドの用途、および当社が従う境界。",
    "title": "プライバシーポリシー",
    "intro": "このポリシーでは、MapsGrab がどのようなデータを処理し、どこに保存され、何が当社のサーバーに到達するのかについて説明します。短いバージョン: この拡張機能は公開されているデータに対して動作し、結果をブラウザーに保持します。クラウド サービスとは別に、バックエンドは構成、クォータ、オプションのエンリッチメント、および最小限の使用ログのみを強化します。また、拡張機能では広告やサードパーティのトラッカーは実行されません。当社のクラウド サービス (オンライン スクレイパー、API、MCP サーバー) へのリクエストは当社のサーバーで処理され、オンライン スクレイパーの結果はアカウントにリンクされるため、ダウンロードできます。",
    "updatedLabel": "最終更新日",
    "updatedAt": "10 月 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "拡張機能と Web サイトがどのようなデータを処理するか、データがどこに保存されるか、バックエンドが何に使用されるか、および私たちが従う境界。",
    "helpTitle": "このポリシーについて質問がありますか?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "結果が保存される場所",
        "text": "拡張機能と無料の Web ツールは、データをブラウザーに保存します。オンライン スクレイパーの結果はアカウントにリンクされています。"
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "私たちのサーバーに届くもの",
        "text": "オンライン スクレイパー、API および MCP サーバーへのリクエストに加え、構成、アカウントとクォータ、オプションのエンリッチメント、および最小限の使用ログ。"
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "広告もトラッカーもありません",
        "text": "拡張機能にはサードパーティのトラッカーはなく、個人データの販売やレンタルもありません。"
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "データの削除",
        "text": "拡張機能を削除すると、ローカル データが削除されます。バックエンドアカウントデータを削除するには、メールでご連絡ください。"
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "拡張機能が処理するデータ",
        "paragraphs": [
          "この拡張機能は、次のカテゴリのデータを処理します。"
        ],
        "items": [
          "公開ビジネス データ — 抽出機能の使用中にアクセスした Google Maps ページに表示される情報 (名前、住所、電話番号、ウェブサイト、評価、レビュー、写真など)。",
          "ユーザーの設定 - ユーザーが構成する設定 (エクスポート形式、フィールドの選択、自動化スイッチ、インターフェース言語)。",
          "技術データとインタラクション データ - Google ページの変更に対して拡張機能を動作し続けるために使用される最小限の使用状況イベント (機能使用状況カウンター、エラー メッセージ)。",
          "当社が発行するアカウント識別子 - 匿名のデバイス識別子、およびサインインしている場合は、アカウントのメールアドレスとプランまたはクォータのステータス。"
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "データの保存場所",
        "paragraphs": [
          "拡張機能を使用すると、設定、抽出結果、およびバッチ タスクの状態がブラウザーにローカルに保存されます (拡張機能のローカル ストレージと IndexedDB)。エクスポートまたは以下で説明するオプションの統合のいずれかをトリガーしない限り、それらはデバイスから離れることはありません。無料の Web ツールは、ブラウザに入力した内容も処理します。",
          "Google Drive および HubSpot OAuth トークンを接続すると、それらもブラウザーにのみ保存されます。",
          "オンライン スクレイパー タスクは当社のサーバー上で実行されます。結果はアカウントに保存されるため、ダッシュボードからダウンロードできます。"
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "バックエンドの処理内容",
        "paragraphs": [
          "当社のクラウド サービス (オンライン スクレイパー、API、MCP サーバー) に対するリクエストは、当社のサーバーで処理されます。また、当社のサーバーは、お客様の API キーやお客様が承認した MCP クライアント認証など、これらのサービスへのアクセスを管理し、使用状況の記録を保管します。",
          "あなたが承認した MCP クライアントは、リクエストの結果を受け取ります。ダッシュボードから承認を取り消すことができます。",
          "これらのクラウド サービスとは別に、拡張機能とこの Web サイトは次の 4 つの目的で独自のサーバーにアクセスします。"
        ],
        "items": [
          "リモート構成 — Google がページを変更したときに抽出を継続するページ構造のプリセット。",
          "アカウントおよびクォータ サービス — サインイン、プラン ステータス、月次使用量の会計。",
          "電子メールとソーシャル メディアの強化 - 機能の使用時に、収集されたビジネス Web サイト上で公開されている連絡先詳細を検索します。",
          "使用状況のログ — サービスの維持と改善に使用される機能の使用状況とエラーの最小限の記録。"
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "オプションの Google Drive および HubSpot の統合",
        "paragraphs": [
          "設定で明示的に接続した場合のみ、エクスポートされたデータは自分の Google Drive にアップロードされるか、自分の HubSpot アカウントに同期されます。これらの統合はユーザーの承認を使用してユーザーに代わって機能し、拡張機能の設定または Google / HubSpot アカウントからいつでも取り消すことができます。"
        ]
      },
      {
        "id": "website-analytics",
        "title": "ウェブサイト分析",
        "paragraphs": [
          "この Web サイトでは、Google Analytics 4 (GA4) を使用して、ページの総使用量を測定します。 GA4 は、当社が使用する唯一のサードパーティ分析であり、この Web サイトでのみ実行されます。拡張機能自体には分析は含まれません。"
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "私たちが決してしないこと",
        "paragraphs": [
          "これらの境界は、拡張機能と Web サイト全体にわたって保持されます。"
        ],
        "items": [
          "広告はありません。",
          "拡張機能にはサードパーティのトラッカーはありません。",
          "個人データの販売またはレンタルは禁止されています。",
          "抽出した Google Maps ページを超える閲覧履歴は収集されません。"
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "データの削除",
        "paragraphs": [
          "拡張機能を削除すると、ローカルに保存されているデータがすべて削除されます。バックエンド アカウント データの削除をご希望の場合は、support@mapsgrab.com までご連絡ください。削除させていただきます。"
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "このポリシーの変更",
        "paragraphs": [
          "サービスが変更されると、このポリシーも更新されます。上記の日付は最新の改訂を反映しており、重要な変更はこの Web サイトで発表されます。"
        ]
      },
      {
        "id": "contact",
        "title": "接触",
        "paragraphs": [
          "プライバシーに関する質問やリクエストは、support@mapsgrab.com に送信できます。"
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "AI アプリを承認する | MapsGrab",
  "title": "AI アプリをアカウントに接続する",
  "intro": "アプリがあなたの MapsGrab アカウントへのアクセスを要求しています。この接続を自分で開始した場合にのみ許可してください。",
  "loading": "接続リクエストをロードしています...",
  "hostLabel": "アプリのアドレス",
  "selfDeclared": "アプリ自体に付ける名前: {name}",
  "loopbackTitle": "ローカルアプリ",
  "loopbackText": "このアプリはコンピュータ上で動作するため、アドレスからは誰が作成したかがわかりません。信頼できるアプリからこの接続を開始したばかりの場合にのみ許可してください。",
  "loopbackHost": "このコンピュータ",
  "accountLabel": "としてサインインしました",
  "switchAccount": "アカウントを切り替える",
  "permissionsTitle": "許可すると、このアプリは次のことを行うことができます",
  "permissions": [
    "Google Maps でビジネスを検索し、レビューや公開写真を読んでください。",
    "API プランの月間リクエスト枠を使用してください。"
  ],
  "revokeNote": "API 管理の [接続済みアプリ] でいつでも接続を解除できます。",
  "approve": "許可する",
  "deny": "拒否して {host} に戻ります",
  "denyLoopback": "拒否してアプリに戻る",
  "redirecting": "アプリに戻ると…",
  "invalidTitle": "この接続リクエストは無効であるか、有効期限が切れています",
  "invalidText": "AI アプリに戻り、再度接続を開始します。",
  "errorTitle": "この接続リクエストは完了できません",
  "errorReasons": {
    "rate_limited": "ネットワークからの接続試行が多すぎます。数分待ってから再試行してください。",
    "invalid_client": "アプリが登録されていないか、登録が不完全です。",
    "invalid_redirect_uri": "アプリから送信された返送先住所が登録した住所と一致しません。",
    "unsupported_response_type": "アプリはサポートされていない認証タイプを要求しました。",
    "invalid_pkce": "アプリは必要なセキュリティ チェック (PKCE と S256) を送信しませんでした。",
    "invalid_resource": "アプリは MapsGrab MCP サーバーへのアクセスを要求しなかったか、別のサーバーを要求しました。",
    "server_error": "MapsGrab は現在このリクエストを保存できませんでした。しばらくしてからもう一度お試しください。"
  },
  "errorHint": "AI アプリから接続を再度開始します。問題が解決しない場合は、アプリの開発者にお問い合わせください。",
  "signInTitle": "続行するにはサインインしてください",
  "signInText": "接続する MapsGrab アカウントにサインインします。このリクエストはあなたを待っています。",
  "signIn": "サインイン",
  "loadFailed": "接続リクエストをロードできませんでした。ネットワークを確認して、もう一度試してください。",
  "decideFailed": "このアクションを完了できませんでした。ネットワークを確認して、もう一度試してください。",
  "retry": "もう一度やり直してください"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "支払いが完了しました",
      "description": "お支払いを確認中です。元のタブは自動的に更新されます。"
    },
    "confirmedCredits": {
      "title": "クレジットを追加しました",
      "description": "ClinkBill の支払いが確認され、クレジットが追加されました。元のタブに戻ることができます。"
    },
    "confirmedSubscription": {
      "title": "プランが有効化されました",
      "description": "ClinkBill の支払いが確認され、MapsGrab プランが有効になっています。元のタブに戻ることができます。"
    },
    "failed": {
      "title": "支払いには注意が必要です",
      "description": "この注文を確認できませんでした。元のタブに戻って再試行してください。"
    }
  },
  "cancel": {
    "title": "支払いがキャンセルされました",
    "description": "支払いが完了していませんでした。戻って別の支払い方法を選択することもできます。"
  }
}
