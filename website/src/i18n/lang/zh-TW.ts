import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab 是一個地圖資料工具包：使用瀏覽器擴充功能和網路工具從地圖、評論連結、地點 ID 等中獲取公開的商家資訊。",
    "keywords": "地圖資料、Google地圖擷取器、地點 ID 查找器、評論連結產生器、地圖工具"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "主要導航",
      "mobileLabel": "手機導航",
      "extension": "擴充功能",
      "online": "線上採集",
      "api": "API",
      "apiScraper": "採集 API",
      "apiReviews": "評論 API",
      "apiPhotos": "相片 API",
      "apiMcp": "採集 MCP",
      "apiScraperDesc": "任何關鍵字和位置的商家數據，如 JSON。",
      "apiReviewsDesc": "帶有評級和所有者回复的完整評論線程。",
      "apiPhotosDesc": "公共照片庫作為即用型URL清單。",
      "apiMcpDesc": "Claude Code、Cursor和VS Code的即時地圖資料。",
      "apiFootNote": "API 和 MCP 共享一個每月請求配額。",
      "apiPricing": "API 定價",
      "pricing": "定價",
      "freeTools": "免費工具",
      "signIn": "登入",
      "dashboard": "控制台"
    },
    "footer": {
      "legalLabel": "法律資訊",
      "resources": "免費工具",
      "product": "產品",
      "rights": "©2026MapsGrab。版權所有。",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID 查找器",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "評論連結產生器",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "電子郵件檢查器",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "經緯度 到 DMS 轉換器",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS 到十進位轉換器",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "批量關鍵字產生器",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "線上合併 CSV 文件",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "立即安裝",
    "comingSoon": "即將推出",
    "themeLabel": "色彩主題",
    "themeLight": "淺色",
    "themeDark": "深色",
    "themeSystem": "系統",
    "faqLabel": "常見問題",
    "breadcrumbLabel": "麵包屑",
    "languageSwitcherLabel": "語言切換器",
    "mobileMenuLabel": "切換選單",
    "copied": "已複製到剪貼簿",
    "cancel": "取消",
    "continue": "繼續"
  },
  "dashboard": {
    "create": {
      "title": "線上採集器",
      "newTask": "新增任務",
      "modeLabel": "搜尋模式",
      "modes": {
        "keywords": "關鍵字",
        "map": "地圖",
        "regions": "地區"
      },
      "keywords": "關鍵字",
      "regionsCta": "依地區產生查詢",
      "placeholder": "波特蘭的咖啡店\n奧斯汀的餐廳",
      "count": "{count} / {limit} 關鍵字",
      "duplicates": "已忽略重複行：{count}",
      "contacts": "尋找電子郵件和社交資料",
      "contactsPaid": "付費線上方案可使用。",
      "usage": "本月{used} / {total} 紀錄",
      "reset": "月度配額於每月 1 日（紐約時間）重設。",
      "loading": "正在加載您的限制...",
      "optionsFailed": "無法載入您的任務限制。請重試。",
      "submit": "開始採集",
      "submitting": "正在提交...",
      "submitted": "任務已送出",
      "failed": "任務提交失敗。重試之前刷新歷史記錄。",
      "exhausted": "您的每月配額已用完。",
      "invalid": "最多輸入{limit}個關鍵字，每個關鍵字長度不超過500個字元。",
      "map": {
        "invalidKeyword": "請輸入一個關鍵字，長度不超過 500 個字元。",
        "keyword": "關鍵字",
        "keywordPlaceholder": "例如：咖啡廳",
        "locationSearch": "搜尋地點",
        "locate": "按區域定位",
        "locationPlaceholder": "選擇國家 / 州 / 城市",
        "coordinates": "輸入經緯度",
        "latitude": "緯度",
        "longitude": "經度",
        "radius": "半徑（公里）",
        "spacing": "網格間距（km）",
        "sampleCount": "{count} / {limit} 搜尋位置",
        "points": "網格點：{points}",
        "overLimit": "減少半徑或增加網格間距以保持在 {limit} 搜尋位置內。",
        "chooseCenter": "選擇區域或點擊地圖，設定搜尋中心點。",
        "mapLabel": "在地圖上選擇一個搜尋中心",
        "tilesUnavailable": "無法載入地圖圖塊。您仍然可以輸入座標。",
        "attribution": "OpenStreetMap 貢獻者"
      },
      "region": {
        "baseKeywords": "基礎關鍵字",
        "basePlaceholder": "咖啡廳\n餐廳",
        "country": "國家",
        "state": "州或地區",
        "citySearch": "尋找城市",
        "cityPlaceholder": "選填：選擇城市",
        "city": "城市",
        "selectCountry": "選擇一個國家",
        "allStates": "所有州或地區",
        "loading": "加載位置...",
        "loadFailed": "無法加載地點。請重試。",
        "retry": "重試",
        "filter": "篩選",
        "selectAll": "全選（{count}）",
        "clear": "全不選",
        "selectedCount": "已選 {count} 項",
        "more": "顯示前 {shown} 項，共 {total} 項。繼續輸入以縮小範圍。",
        "selectedRegions": "選定地點",
        "remove": "刪除{name}",
        "noMatch": "沒有符合的項目",
        "matchMode": "搜尋字詞",
        "inMode": "在",
        "nearMode": "靠近",
        "generate": "產生查詢",
        "needBase": "請先填寫基礎關鍵字。",
        "needCountry": "請先選擇國家。",
        "willGenerate": "將產生 {count} 筆查詢。",
        "finalQueries": "最終查詢",
        "finalPlaceholder": "產生的查詢出現在此。您可以編輯它們。",
        "attribution": "位置資料：GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "儀表板 | MapsGrab",
      "description": "在一個工作區中管理您的 MapsGrab 匯出、API 存取和訂閱。"
    },
    "shell": {
      "skipToContent": "跳至主要內容",
      "sideLabel": "工作區",
      "homeLabel": "MapsGrab 首頁",
      "navLabel": "工作區選單",
      "loading": "正在加載您的工作區...",
      "retry": "重試",
      "navOnline": "線上採集器",
      "navJobHistory": "歷史紀錄",
      "navApi": "API 管理",
      "navSubscriptions": "訂閱",
      "openMenu": "開啟工作區選單",
      "closeMenu": "關閉工作區選單",
      "collapseSidebar": "收合側欄",
      "expandSidebar": "展開側欄",
      "back": "返回"
    },
    "account": {
      "menuButtonLabel": "開啟帳戶選單",
      "menuLabel": "帳戶選單",
      "logout": "退出",
      "upgrade": "升級",
      "usageShort": "{used} / {total} 筆記錄",
      "planUnavailable": "無法使用",
      "theme": "主題",
      "themeLight": "淺色",
      "themeDark": "深色",
      "themeSystem": "跟隨系統",
      "language": "語言"
    },
    "history": {
      "title": "在線匯出歷史記錄",
      "description": "您在 線上採集器 上運行的任務，最新的在前。",
      "refresh": "重新整理",
      "autoRefresh": "自動重新整理中",
      "loading": "正在加載您的匯出...",
      "loadFailed": "無法載入您的匯出歷史記錄。",
      "refreshFailed": "無法重新整理，目前顯示上次載入的結果。",
      "retry": "重試",
      "emptyTitle": "還沒匯出",
      "emptyHint": "在 線上採集器 上運行任務，它將顯示在此。",
      "emptyCta": "前往線上採集器",
      "recentTitle": "最近任務",
      "viewAll": "查看全部",
      "recentEmptyHint": "你在上方建立的任務會顯示在這裡。",
      "noMatchTitle": "沒有符合的任務",
      "noMatchHint": "請換個任務編號或關鍵字，或清除篩選條件。",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "另有 {count} 個",
      "columns": {
        "taskNo": "任務",
        "time": "建立 / 完成",
        "contacts": "電子郵件和社交",
        "samples": "搜尋次數",
        "records": "記錄",
        "status": "狀態"
      },
      "status": {
        "queued": "等待中",
        "collecting": "採集中",
        "publishing": "準備 CSV",
        "completed": "已完成",
        "partial": "部分成功",
        "failed": "失敗的"
      },
      "search": {
        "label": "搜尋任務",
        "placeholder": "依任務編號或關鍵字搜尋",
        "clear": "清除搜尋"
      },
      "filters": {
        "label": "篩選任務",
        "button": "篩選",
        "status": "狀態",
        "all": "全部",
        "running": "執行中",
        "clear": "清除篩選"
      },
      "range": {
        "label": "時間範圍",
        "last7": "最近 7 天",
        "last30": "最近 30 天",
        "all": "所有時間",
        "custom": "自訂範圍",
        "from": "開始",
        "to": "結束",
        "apply": "套用",
        "invalid": "開始日期不能晚於結束日期。"
      },
      "pagination": {
        "label": "分頁",
        "previous": "以前的",
        "next": "下一個",
        "page": "第 {page} 頁",
        "pageSize": "每頁列數",
        "summary": "{from}–{to} 共 {total}"
      },
      "detail": {
        "show": "細節",
        "loading": "正在加載搜尋...",
        "loadFailed": "無法載入此任務的搜尋。",
        "keyword": "關鍵字",
        "records": "記錄",
        "completed": "已完成",
        "pending": "等待中",
        "viewport": "{lat}、{lng}·變焦{zoom}"
      },
      "contactsOn": "已啟用",
      "contactsOff": "未啟用",
      "dedupeHint": "記錄數以整個任務去除重複後計算。",
      "finished": "任務 {job}：{status}",
      "finishedRecords": "{count} 筆記錄",
      "downloadCsv": "下載 CSV",
      "downloadXlsx": "下載 Excel",
      "noFile": "沒有 CSV",
      "errors": {
        "31301": "無法收集此搜尋。",
        "31302": "部分結果無法取得，已保留交付的資料列。",
        "31303": "採集服務忙碌，請重試。",
        "31304": "無法發布此匯出。"
      },
      "errorFailed": "無法完成此搜尋。",
      "downloading": "正在準備...",
      "downloadUnavailable": "無法下載 CSV。該文件可能已過期。",
      "downloadFailed": "無法開始下載。請再試一次。",
      "signInPrompt": "登入以查看您的線上匯出歷史記錄。",
      "signInCta": "登入",
      "unreachable": "目前無法達到 MapsGrab。"
    },
    "api": {
      "description": "管理您的 API 金鑰、每月請求限額和連接的 AI 應用程式。",
      "docsLink": "查看 API 產品",
      "signInPrompt": "登入以管理您的 API 存取權限。",
      "loading": "正在載入您的 API 存取權限...",
      "loadFailed": "無法載入您的 API 存取權限。請再試一次。",
      "retry": "重試",
      "refresh": "重新整理",
      "keyTitle": "API 金鑰",
      "keyEmpty": "您尚未產生 API 金鑰。",
      "generateKey": "產生 API 金鑰",
      "rotateKey": "更換 API 金鑰",
      "generatingKey": "生成...",
      "keyOnce": "立即複製此金鑰。離開或刷新此頁面後，您將無法再次查看。",
      "keyCreated": "已創建",
      "rotateTitle": "更換您的 API 金鑰？",
      "rotateMessage": "您目前的金鑰將立即停止工作。使用新金鑰更新使用它的所有應用程式。",
      "cancel": "取消",
      "copyKey": "複製 API 金鑰",
      "copied": "已複製",
      "copyFailed": "無法複製。選擇文字並手動複製。",
      "keyFailed": "無法產生 API 金鑰。請再試一次。",
      "usageTitle": "每月 API 使用量",
      "usageFailed": "無法載入 API 用量。請再試一次。",
      "usageValue": "{used} / {total} 請求",
      "usagePeriod": "期間：{period}",
      "quotaExhausted": "您的每月請求額度已用完。",
      "quotaReset": "每月 1 日重設（美東時間）· API 與 MCP 共用",
      "planTitle": "API 方案",
      "managePlan": "管理訂閱",
      "connectionsTitle": "接入",
      "connectTabsLabel": "接入方式",
      "connectDocs": {
        "api": "API 文件",
        "mcp": "MCP 接入指南",
        "mcpKey": "API 金鑰接入指南"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + API 金鑰"
      },
      "apiUrl": "API 底座URL",
      "mcpUrl": "MCP 伺服器URL",
      "mcpHint": "將這個URL加入您的 MCP 客戶端。打開此網站時登入並批准連線。",
      "mcpKeyHint": "適用於無法開啟瀏覽器登入的用戶端。請求使用你的 API 金鑰驗證，無需核准連線。",
      "mcpConfigTitle": "用戶端設定",
      "mcpConfigHint": "將此項目加入 MCP 用戶端設定。不同用戶端的欄位名稱略有差異。",
      "mcpUnavailable": "MCP 連接位址尚不可用。",
      "copyUrl": "複製URL",
      "curlTitle": "快速上手",
      "curlHint": "請將預留位置替換為完整的 API 金鑰。",
      "grants": {
        "title": "連接的應用程式",
        "description": "您已允許使用 API 額度搜尋商家、閱讀評論與公開照片的應用程式。",
        "loading": "正在載入連接的應用程式...",
        "empty": "沒有連接任何應用程式。",
        "loadFailed": "無法載入連接的應用程式。請再試一次。",
        "selfDeclared": "應用程式給自己取的名字：{name}",
        "createdLabel": "已連接",
        "refreshedLabel": "上次刷新",
        "notRefreshed": "還沒有",
        "revoke": "斷開",
        "revokeTitle": "斷開此應用程式的連接嗎？",
        "revokeMessage": "{host} 將立即失去存取權限，需要您的批准才能再次連線。",
        "revokeFailed": "無法斷開此應用程式的連接。請再試一次。",
        "paginationLabel": "連接的應用程式頁面",
        "pageOf": "第 {page} 頁（共 {pages}）"
      }
    },
    "subscriptions": {
      "title": "訂閱",
      "description": "線上採集器、瀏覽器擴充功能和 API 的計畫和續約狀態。在定價頁面上購買或升級。",
      "lines": {
        "online": "線上採集器",
        "extension": "瀏覽器擴充功能",
        "api": "API"
      },
      "planLabel": "方案",
      "expiresLabel": "續訂/過期",
      "free": "免費",
      "unavailable": "暫時無法使用",
      "autoRenewOn": "自動續訂開啟",
      "autoRenewOff": "自動續訂關閉",
      "paidVia": "付款方式：{method}",
      "subscribeCta": "選擇一個方案",
      "pricingLink": "查看價格",
      "manageSubscription": "管理訂閱",
      "managingSubscription": "開啟中...",
      "manageFailed": "無法開啟訂閱管理。請再試一次。",
      "signInPrompt": "登入以查看您的訂閱。"
    },
    "cancelGuide": {
      "title": "管理您在支付提供者處的訂閱",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "登入 PayPal 並開啟「設定」。",
            "轉到“付款”，然後轉到“自動付款”。",
            "選擇 MapsGrab，然後選擇取消。"
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "從您的購買電子郵件中開啟客戶入口網站連結。",
            "登入並選擇您的 MapsGrab 訂閱。",
            "選擇取消。"
          ]
        }
      ],
      "closeLabel": "關閉"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — 將 Google Maps 商家資料抓取到 CSV 和 JSON",
        "description": "MapsGrab 是一個瀏覽器擴充功能和 Web 工具包，可從 Google Maps 收集公開可用的商家資訊（姓名、電話、評論、照片、電子郵件），並將其匯出至 CSV 或 JSON。"
      },
      "hero": {
        "announce": {
          "badge": "新的",
          "text": "MCP AI 代理伺服器"
        },
        "title": {
          "firstLine": "取得 Google Maps 資料",
          "secondLine": "只需",
          "accent": "一鍵",
          "end": ""
        },
        "lead": "從 Google Maps 收集公共商家資料——姓名、電話、網站、評論、照片和電子郵件——並在幾秒鐘內匯出乾淨的 CSV 或 JSON。",
        "search": {
          "label": "搜尋關鍵字",
          "typing": [
            "波特蘭的咖啡店",
            "奧斯汀, TX 的牙醫",
            "芝加哥附近的水管工",
            "布魯克林的瑜珈館",
            "邁阿密海灘的酒店"
          ],
          "submit": "預覽結果",
          "loading": "正在尋找...",
          "suggestLabel": "嘗試",
          "suggestions": [
            "波特蘭的咖啡店",
            "奧斯汀, TX 的牙醫",
            "芝加哥附近的水管工"
          ]
        },
        "trust": [
          "無需信用卡",
          "{records} 免費紀錄/月",
          "CSV & JSON 匯出"
        ],
        "dashboard": "打開線上採集器",
        "theater": {
          "panelLabel": "MapsGrab 面板預覽",
          "extensionActive": "MapsGrab 擴充功能已激活",
          "mapFilters": [
            "現已開放",
            "評價最高",
            "價格"
          ],
          "live": "居住",
          "done": "完畢",
          "start": "開始採集",
          "pause": "暫停",
          "extracting": "正在提取{count}…",
          "finished": "已完成 · {count} 個地方",
          "kpis": {
            "phones": "電話",
            "emails": "電子郵件",
            "websites": "網站"
          },
          "export": "匯出詳細清單 - {count} (.CSV)",
          "exportSaved": "匯出已儲存",
          "emailFound": "找到電子郵件",
          "averageRating": "平均評分",
          "placeId": "Place ID",
          "ratingValue": "{rating}·{reviews}評論"
        },
        "preview": {
          "title": "結果",
          "count": "第一個結果頁面上有{count} 企業",
          "columns": {
            "name": "姓名",
            "address": "地址",
            "category": "類別",
            "rating": "等級",
            "reviews": "評論",
            "phone": "電話"
          },
          "locked": "在 線上採集器 中登入並提交您的關鍵字以收集和匯出結果。",
          "signIn": "登入以開始完整任務",
          "failed": "無法載入預覽。請再試一次。",
          "empty": "第一個結果頁面上找不到任何企業。"
        }
      },
      "facts": {
        "caption": "MapsGrab 透過數字",
        "items": [
          {
            "value": 36,
            "label": "每家商家的資料欄位"
          },
          {
            "value": 11,
            "label": "評論字段，包括所有者回复"
          },
          {
            "value": 6,
            "label": "每個網站匹配的社交網絡"
          },
          {
            "value": "freeRecords",
            "label": "免費記錄，每月"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "運作方式：擴充、線上、API — 加上 MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "它是如何運作的",
          "title": {
            "lead": "從地圖搜索到",
            "accent": "電子錶格",
            "tail": "，只需三步"
          },
          "lead": "沒有程式碼，也沒有複製貼上。 MapsGrab 讀取 Google Maps 已顯示的內容並將其轉換為結構化行。"
        },
        "steps": [
          {
            "title": "搜尋 Google Maps",
            "body": "打開 Google Maps 並蒐索任何商家類型和位置 - 就像您平常所做的那樣。"
          },
          {
            "title": "開始採集",
            "body": "點選 {action}。MapsGrab 會捲動搜尋結果、收集商家資料，並在啟用此功能時補全聯絡資訊。",
            "action": "開始採集"
          },
          {
            "title": "匯出到任何地方",
            "body": "下載包含所選欄位的 CSV 或 JSON；評論和照片會分別儲存為獨立檔案，可直接用於 Excel 或 CRM。"
          }
        ],
        "searchSample": "西雅圖的麵包店",
        "columnsUnit": "欄位",
        "reviewsFile": "評論"
      },
      "products": {
        "head": {
          "kicker": "產品",
          "title": {
            "lead": "三種方式，",
            "accent": "採集",
            "tail": "地圖數據"
          },
          "lead": "選擇瀏覽器擴充功能、基於雲端的 線上採集器 或 API。此擴充功能可以在您自己的瀏覽器中運行； 線上採集器和 API 共享一個雲端引擎。"
        },
        "cards": {
          "extension": {
            "badge": "瀏覽器擴充功能",
            "title": "瀏覽時抓取資料 Google Maps",
            "body": "從您開啟的地圖頁面中擷取商家資料、評論和照片，再將所有內容匯出到本機。支援 Edge、Firefox 和 Chromium。",
            "link": "探索擴充功能"
          },
          "online": {
            "badge": "線上採集器",
            "title": "雲運行。沒有什麼可安裝的。",
            "body": "貼上關鍵字，在雲端收集商家詳細資訊，每個任務可下載一份去除重複商家的 37 欄位 CSV。",
            "link": "探索線上採集器"
          },
          "api": {
            "badge": "API",
            "title": "清潔 JSON 超過 HTTP",
            "body": "您自己的應用程式的商家資料和評論 - 一把 API 金鑰。",
            "link": "探索 API"
          },
          "mcp": {
            "badge": "MCP 伺服器",
            "title": "為您的人工智慧代理提供即時地圖數據",
            "body": "作為 MCP 工具搜尋和評論 Claude Code、Cursor、VS Code 和 Codex。",
            "link": "探索 MCP 伺服器"
          }
        },
        "extracting": "正在提取{count}…",
        "queue": {
          "rows": "{count} 行",
          "processing": "加工"
        },
        "chat": {
          "prompt": "透過網站尋找 奧斯汀 評級為 4.5+ 的牙醫",
          "answer": "找到 {count} 匹配項。前三名："
        }
      },
      "fields": {
        "head": {
          "kicker": "數據",
          "title": {
            "lead": "36 個欄位，",
            "accent": "每一列",
            "tail": "都有用"
          },
          "lead": "該擴充功能從搜尋結果和商家頁面匯出架構 - 聯絡人詳細資料、位置、個人資料、評級以及稍後匹配記錄所需的每個識別碼。"
        },
        "filtersLabel": "現場組",
        "all": "全部",
        "groups": {
          "contact": {
            "filter": "接觸",
            "label": "接觸"
          },
          "location": {
            "filter": "地點",
            "label": "地點"
          },
          "profile": {
            "filter": "輪廓",
            "label": "商家簡介"
          },
          "reviews": {
            "filter": "評級",
            "label": "評分和評論"
          },
          "ids": {
            "filter": "ID 和連結",
            "label": "ID 和連結"
          }
        },
        "sampleLabel": "樣本值",
        "emptySample": "（空的）",
        "descriptions": {
          "Name": "公司名稱與清單上顯示的完全一致。",
          "Description": "企業簡介中的簡短描述。",
          "Fulladdress": "完整、格式化的街道地址。",
          "Street": "地址的街道線。",
          "Municipality": "城市或地區。",
          "Categories": "分配給商家的每個類別。",
          "About": "“關於”選項卡中的屬性。",
          "Plus Code": "為開放位置程式碼保留的欄位 - 目前匯出為空。",
          "Time Zone": "位置的 IANA 時區。",
          "Price": "清單上顯示的價格水平。",
          "Note": "商家備註或反白顯示。",
          "Amenities": "便利設施和服務選項。",
          "Hotel Class": "住宿清單的星級。",
          "Phone": "清單中顯示的主要電話號碼。",
          "Phones": "找出該企業的每個電話號碼。",
          "Claimed": "所有者是否已認領該個人資料。",
          "Owner": "個人資料上的所有者姓名。",
          "Owner Id": "所有者帳戶的貢獻者 ID。",
          "Owner Link": "連結到所有者的貢獻者頁面。",
          "Email": "在企業網站上找到的電子郵件地址。",
          "Social Medias": "從網站連結的社交資料。",
          "Review Count": "評論總數。",
          "Average Rating": "平均星級。",
          "Review URL": "直接連結到評論面板。",
          "Google Maps URL": "由 CID 建構的穩定短連結。",
          "Google Knowledge URL": "知識面板搜尋連結。",
          "Latitude": "緯度（以十進制為單位）。",
          "Longitude": "以十進位表示的經度。",
          "Website": "官方網站上的列表。",
          "Domain": "網站的可註冊網域。",
          "Opening Hours": "每週營業時間、休息日標記。",
          "Featured Image": "清單封面照片 URL。",
          "Cid": "客戶 ID — FID 的十進位形式。",
          "Fid": "由兩個半十六進制組成的函數 ID。",
          "Place Id": "穩定的Google Place ID。",
          "Kgmid": "知識圖譜機器ID。"
        },
        "reviews": {
          "title": "+ 11 個評論欄位",
          "body": "單獨匯出，分頁至您的方案限制。"
        },
        "photos": {
          "title": "+ 照片 URL 列表",
          "body": "每家企業的公開相簿照片 URLs，街景已過濾掉。"
        },
        "sampleCsv": "下載範本 CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "聯絡資訊補全",
          "title": {
            "lead": "從地圖標記，找到可以",
            "accent": "發郵件",
            "tail": "聯繫的人"
          },
          "lead": "啟用聯絡資訊補全時，MapsGrab 會在採集過程中查看各家商家的官方網站，補上可直接聯絡的管道。"
        },
        "points": [
          "在企業網站上找到的電子郵件地址",
          "社群檔案：Facebook、Instagram、LinkedIn、X、YouTube、TikTok",
          "付費線上套餐預設開啟，擴充功能中的一項設置",
          "包含在帶有一個標誌的 API 搜尋回應中 — 無需單獨的資訊補全步驟"
        ]
      },
      "developers": {
        "head": {
          "kicker": "對於開發商",
          "title": {
            "lead": "將地圖數據接入你開發的",
            "accent": "任何應用",
            "tail": ""
          },
          "lead": "線上採集器 背後的雲端引擎，公開為 HTTP API 和 MCP 伺服器。結構化 JSON，一鍵，無需解析HTML。"
        },
        "listLabel": "開發商產品",
        "items": {
          "search": {
            "title": "採集 API",
            "description": "適用於任何關鍵字和位置的企業"
          },
          "reviews": {
            "title": "評論 API",
            "description": "評級、文字和所有者回复"
          },
          "photos": {
            "title": "相片 API",
            "description": "每家企業的公開照片 URLs"
          },
          "mcp": {
            "title": "MCP 伺服器",
            "description": "適用於任何 MCP 客戶的搜尋和評論工具"
          }
        },
        "langLabel": "語言",
        "copyLabel": "複製請求",
        "sending": "正在發送請求...",
        "response": "回應 · 200 正常 · {ms} 毫秒",
        "toolCall": "工具呼叫 · {tool} · 200 確定",
        "exploreApi": "探索 API",
        "apiPricing": "API 定價",
        "worksWith": "可與您已使用的工具搭配使用",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "微軟Excel",
          "CSV",
          "JSON",
          "ZIP 捆綁包"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "使用案例",
          "title": {
            "lead": "為搜索",
            "accent": "之後",
            "tail": "的工作而設計"
          }
        },
        "cards": [
          {
            "label": "潛在客戶開發",
            "title": "當地領先名單",
            "body": "搜尋一個類別和一個城市，然後將整個結果頁面（包括電話、網站和電子郵件）匯出到一個電子表格中。"
          },
          {
            "label": "本地搜尋引擎優化",
            "title": "競爭對手基準",
            "body": "一次提取某一領域每個競爭對手的評級和評論計數，並直接從匯出中建立報告。"
          },
          {
            "label": "市場調查",
            "title": "位置資料集",
            "body": "收集每個分行或競爭對手位置的地點 ID 和座標，為您的地圖和路線工具做好準備。"
          }
        ],
        "leadTags": [
          "電子郵件",
          "電話",
          "電子郵件",
          "地點"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "定價",
          "title": {
            "lead": "免費起步，有回報後再",
            "accent": "擴大規模",
            "tail": ""
          },
          "lead": "每個產品都有免費套餐，沒有時間限制。僅升級您實際使用的表面。"
        },
        "lines": {
          "extension": {
            "title": "瀏覽器擴充功能",
            "billing": "每月",
            "link": "查看擴充功能方案"
          },
          "online": {
            "title": "線上採集器",
            "billing": "一次性付款",
            "link": "查看線上方案"
          },
          "api": {
            "title": "API & MCP",
            "billing": "一次性付款",
            "link": "查看 API 方案"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "免費工具",
          "title": {
            "lead": "為地圖",
            "accent": "進階用戶",
            "tail": "準備的實用小工具"
          },
          "lead": "七個完全在瀏覽器中運行的實用程式 - 您貼上的內容永遠不會離開您的裝置。電子郵件檢查器例外：它會將電子郵件地址傳送到我們的伺服器進行驗證。"
        },
        "descriptions": {
          "place-id-finder": "貼上地圖地點 URL 並讀出其 Place ID、CID 和 FID。",
          "review-link-generator": "取得任何企業的直接「撰寫評論」連結。",
          "email-checker": "檢查電子郵件地址能否真正收信。",
          "lat-long-to-dms": "十進制座標為度、分、秒。",
          "dms-to-dd": "DMS 座標傳回乾淨的十進位。",
          "bulk-keywords-generator": "每個“關鍵字+位置”組合都可以貼上。",
          "merge-csv": "將 CSV 匯出合併到一個檔案中，按標題對齊。"
        },
        "more": "更多工具即將推出"
      },
      "faq": {
        "kicker": "常見問題",
        "title": {
          "lead": "常見",
          "accent": "問題",
          "tail": ""
        },
        "lead": "簡短的答案。除此之外，只需一封電子郵件即可獲得支援。",
        "contact": "聯繫支援人員",
        "items": [
          {
            "question": "MapsGrab 可以免費使用嗎？",
            "answer": "是的。該擴充功能無需帳戶即可使用，並包含每月免費的記錄配額。當您需要更多時，定價頁面上的付費方案會提高限制。"
          },
          {
            "question": "支援哪些瀏覽器？",
            "answer": "從擴充頁面下載 MapsGrab。 Chrome、Edge和Brave載入解壓縮後的ZIP；Firefox 使用單獨的臨時加載項，必須在重新啟動後重新載入。此頁麵包含安裝和更新說明。"
          },
          {
            "question": "資料從哪裡來，收集是否合法？",
            "answer": "MapsGrab 僅收集您造訪的 Google Maps 頁面上公開顯示的資訊 - 任何訪客都可以閱讀的相同詳細資訊。我們不會存取私人帳戶、封閉內容或非公開資料。"
          },
          {
            "question": "我需要為網路工具安裝任何東西嗎？",
            "answer": "不會。免費的網路工具完全在您的瀏覽器中運作 - 您的輸入永遠不會離開您的裝置。電子郵件檢查器例外：它會將您輸入的地址傳送到我們的伺服器，由電子郵件驗證服務商確認，過程中不會寄出任何郵件。"
          },
          {
            "question": "我可以匯出為哪些格式？",
            "answer": "匯出為 CSV 或 JSON 以及您選擇的欄位選擇，並透過 Place ID 進行重複資料刪除。"
          },
          {
            "question": "MapsGrab 能否看到我收集的資料？",
            "answer": "您的設定和結果儲存在本機瀏覽器中。我們的伺服器僅處理遠端配置、帳戶和配額狀態、可選的電子郵件／社群資訊補全以及最少的使用日誌。"
          }
        ]
      },
      "cta": {
        "kicker": "開始使用",
        "title": {
          "lead": "幾",
          "accent": "分鐘",
          "tail": "即可開始採集"
        },
        "lead": "安裝擴充程序，打開 Google Maps，搜尋並匯出您的第一個清單 - 無需帳戶。",
        "install": "免費安裝 MapsGrab",
        "online": "嘗試線上抓取",
        "note": "包括免費的每月配額。沒有信用卡。"
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab 適用於 Chrome、Edge 和 Firefox — Google Maps 提取器擴充功能",
        "description": "從 Google Maps 擷取 36 個商家資料欄位、評論與照片，補全電子郵件和社群連結，執行批次任務，並匯出為 CSV 或 JSON。"
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "下載 Chrome、Edge 和 Firefox"
        },
        "title": {
          "lead": "在",
          "accent": "你的瀏覽器",
          "tail": "中採集 Google Maps 數據"
        },
        "lead": "打開任何 Google Maps 搜尋或商家頁面，並取得那裡公開顯示的內容 - 商家數據、評論、照片和聯絡資訊。所有內容都可以直接從瀏覽器匯出到 CSV 或 JSON。",
        "downloadCta": "下載 Chrome 和 Edge",
        "installCta": "安裝指南",
        "meta": [
          "無需帳戶",
          "1,000 免費唱片/月",
          "匯出保留在您的機器上"
        ],
        "theater": {
          "panelLabel": "MapsGrab 面板預覽",
          "extensionActive": "MapsGrab 在此頁面上處於活動狀態",
          "dock": "停靠左/右",
          "filters": [
            "現已開放",
            "評價最高",
            "價格"
          ],
          "open": "打開",
          "closes": "關閉 {time}",
          "endOfList": "您已到達清單的末尾。",
          "start": "開始採集",
          "extracting": "正在提取{count}…",
          "pause": "暫停",
          "complete": "提取完成。",
          "reset": "重置",
          "kpis": {
            "phones": "電話",
            "websites": "網站",
            "emails": "電子郵件"
          },
          "exportCta": "匯出詳細清單 - {count} (.CSV)",
          "saved": "儲存到下載",
          "scrollChip": {
            "label": "自動捲動",
            "value": "人性化，5–10"
          },
          "dedupeChip": {
            "label": "重複資料刪除",
            "value": "透過 Place ID"
          }
        }
      },
      "facts": {
        "caption": "擴充功能一覽",
        "items": [
          {
            "value": 36,
            "label": "每家商家的欄位，從名稱到 Place ID"
          },
          {
            "value": 11,
            "label": "評論欄位，包含商家回覆"
          },
          {
            "value": 6,
            "label": "每個網站匹配的社交網絡"
          },
          {
            "value": 1000,
            "label": "每月免費記錄，無需帳戶"
          },
          {
            "value": 500,
            "label": "每個批次任務的關鍵字或評論 URL"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "在哪裡工作",
          "title": {
            "lead": "一個面板，適配每種",
            "accent": "地圖視圖",
            "tail": ""
          },
          "lead": "MapsGrab 面板出現在 Google Maps 的右側。搜尋結果、商家頁面和已儲存的清單都具有正確的提取模式 - 無需複製貼上，無需使用選項卡。"
        },
        "search": {
          "title": "搜尋結果",
          "description": "在任何搜尋中按“開始提取”。 MapsGrab 以人性化的速度滾動結果列表，並在加載時收集每個列表。"
        },
        "place": {
          "title": "商家頁面",
          "description": "在商家頁面上，「評論和照片」標籤可瀏覽評論和相簿 - 評論匯出為 11 欄位，照片匯出為 URL 清單。",
          "tabs": [
            "概述",
            "評論和照片"
          ],
          "reviewsCta": "開始提取評論",
          "photosCta": "開始擷取照片",
          "reviewsCount": "{count} 評論",
          "photosCount": "{count} 照片"
        },
        "saved": {
          "title": "已儲存的列表",
          "description": "開啟已儲存的清單並按一次「開始」。 MapsGrab 依序開啟每個位置並收集它 - 無需點擊每個項目。",
          "listName": "收藏夾·{count} 地點"
        }
      },
      "features": {
        "head": {
          "kicker": "特徵",
          "title": {
            "lead": "將地圖頁面展示的內容，整理成",
            "accent": "結構化數據",
            "tail": ""
          },
          "lead": "跨搜尋結果和商家頁面的一種擷取模式，針對目前 Google Maps 介面進行調整，並在 Google 變更時遠端更新。"
        },
        "tabsLabel": "擴充功能",
        "tabs": [
          {
            "id": "business",
            "title": "商家數據",
            "description": "每個企業的 36 欄位，在列表滾動時捕獲。"
          },
          {
            "id": "reviews",
            "title": "評論",
            "description": "評論與所有者回复，自動分頁。"
          },
          {
            "id": "photos",
            "title": "照片",
            "description": "相簿照片作為即用型 URL 清單。"
          },
          {
            "id": "enrichment",
            "title": "電子郵件與社群資訊補全",
            "description": "官方網站直接聯絡管道。"
          },
          {
            "id": "batch",
            "title": "大量任務",
            "description": "關鍵字佇列或評論URLs，逐項走。"
          },
          {
            "id": "export",
            "title": "匯出",
            "description": "CSV 或 JSON，直接儲存到您的機器。"
          }
        ],
        "business": {
          "claimed": "聲稱",
          "fields": {
            "phone": "電話",
            "website": "網站",
            "rating": "平均評分",
            "hours": "開放時間",
            "timeZone": "時區",
            "coordinates": "座標",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} 評論",
          "columns": "每家商家 {count} 個欄位",
          "reserved": "加碼已保留",
          "more": "+{count} 更多"
        },
        "reviews": {
          "title": "評論",
          "columns": "{count} 個欄位",
          "ownerReply": "業主的回應",
          "loading": "正在加載下一頁評論"
        },
        "photos": {
          "streetView": "街景過濾"
        },
        "enrichment": {
          "website": "官方網站",
          "moreNetworks": "X、YouTube 和 TikTok 也檢查過"
        },
        "batch": {
          "complete": "{count} 個已完成",
          "stuck": "{count} 卡住",
          "total": "{count} 總計",
          "done": "已完成 · {count}",
          "skipped": "90 沒有進展 · 已跳過",
          "running": "正在提取...",
          "queued": "等待中",
          "autoExport": "任務完成後自動匯出"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} 列資料 · 已選取 {total} 個欄位中的 {selected} 個 · 依 Place ID 去除重複資料",
          "destinations": [
            {
              "title": "下載",
              "description": "由您的瀏覽器儲存"
            },
            {
              "title": "欄位選擇器",
              "description": "僅匯出您需要的欄位"
            },
            {
              "title": "自動下載",
              "description": "提取完成後立即儲存"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "大量任務",
          "title": {
            "lead": "將列表加入隊列，",
            "accent": "放心離開",
            "tail": ""
          },
          "lead": "將最多 500 關鍵字或評論 URLs 貼到一項任務中。 MapsGrab 透過即時進度逐項瀏覽它們，跳過任何停滯的內容，並在任務完成時自動匯出。"
        },
        "checks": [
          "關鍵字任務對每個關鍵字運行一次地圖搜索",
          "評論-URL 任務按商家收集評論",
          "任務狀態儲存到磁碟 - 瀏覽器重新啟動後會再次拾取",
          "最多儲存 150 任務，一次執行一批"
        ],
        "mock": {
          "tabs": [
            "批量關鍵字資料工具",
            "批量 Google 評論提取器"
          ],
          "taskName": "任務名稱",
          "taskPlaceholder": "例如100 關鍵字、設計機構",
          "keywords": "關鍵字·每行一個",
          "lineCount": "{count} / {limit}",
          "start": "開始採集",
          "columns": {
            "task": "任務名稱",
            "status": "狀態",
            "actions": "行動"
          },
          "running": "執行中",
          "complete": "已完成",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} 卡住",
          "progressExported": "{done} / {total} · 匯出",
          "lines": {
            "run": "提取…",
            "done": "已完成",
            "stuck": "卡住·跳過"
          },
          "toast": "任務完成——匯出",
          "chip": {
            "label": "任務狀態",
            "value": "儲存到磁碟"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "本地優先",
          "title": {
            "lead": "採集結果保留在",
            "accent": "你的瀏覽器",
            "tail": "中"
          },
          "lead": "設定和結果儲存在本地。我們的伺服器僅處理遠端配置、帳戶和配額狀態、可選電子郵件與社群資訊補全以及最少的使用日誌。"
        },
        "checks": [
          "匯出是在您的機器上產生的",
          "在儲存檔案之前，欄位選擇和 Place ID 重複資料刪除在本地運行",
          "當 Google Maps 變更時，遠端設定可保持面板最新 — 無需重新安裝",
          "如果無法讀取某些內容，面板會顯示錯誤，而不是默默地失敗"
        ],
        "diagram": {
          "browser": "您的瀏覽器",
          "servers": "MapsGrab 伺服器",
          "nodes": {
            "mapsTab": "Google Maps 選項卡",
            "panel": "MapsGrab 面板",
            "storage": "本地儲存",
            "exports": "您的匯出",
            "config": "遠端配置",
            "quota": "帳戶及額度",
            "enrichment": "聯絡資訊補全"
          },
          "flows": {
            "rows": "商家行",
            "rules": "規則",
            "usage": "用法",
            "websites": "商家網站 → 電子郵件和社交網站"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "安裝",
          "title": {
            "lead": "安裝 ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "在此下載 ZIP 並按照適合您的瀏覽器的步驟進行操作。 Chrome、Edge 和 Brave 載入解壓縮的資料夾。 Firefox 使用單獨的臨時加載項，必須在重新啟動後重新載入。點擊任何圖像即可查看其完整尺寸。"
        },
        "zip": {
          "title": "直接安裝（發布zip）",
          "description": "選擇適合您的瀏覽器的 ZIP。將其解壓縮到您保留的資料夾中，然後使用下面的指南載入它。若要更新，請下載新的 ZIP，取代該資料夾中的檔案並重新載入擴充功能。",
          "button": "Chrome、Edge和 Brave ZIP",
          "firefoxButton": "Firefox ZIP（暫時附加）",
          "meta": "版本 {version} · 預發布"
        },
        "browserLabel": "瀏覽器",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Edge",
            "note": "Edge、Chrome、Brave 和其他 Chromium 瀏覽器",
            "steps": [
              {
                "title": "下載並解壓縮",
                "description": [
                  "下載 ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  "。在Windows上，右鍵單擊它並選擇“全部提取”。在 macOS 上，雙擊它。保留提取的資料夾。"
                ],
                "shot": "MapsGrab ZIP 下載到 Chrome"
              },
              {
                "title": "開啟擴充頁面",
                "description": [
                  "打開 ",
                  {
                    "code": "chrome://extensions"
                  },
                  " 在Chrome中， ",
                  {
                    "code": "edge://extensions"
                  },
                  " 在Edge，或 ",
                  {
                    "code": "brave://extensions"
                  },
                  " 在Brave。"
                ],
                "shot": "擴充管理頁面"
              },
              {
                "title": "啟用開發者模式",
                "description": [
                  "在擴充頁面上開啟開發者模式。在Chrome中，開關位於右上角。"
                ],
                "shot": "啟用開發者模式，並顯示「載入已解壓縮」按鈕"
              },
              {
                "title": "載入解壓縮後的資料夾",
                "description": [
                  "點擊“載入解壓縮”並選擇解壓縮的資料夾。 MapsGrab 出現在擴充清單中。打開 Google Maps 搜尋即可使用它。"
                ],
                "shot": "加載已添加 MapsGrab 卡的解壓縮包裝"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "臨時附加；重啟後重新載入 Firefox",
            "steps": [
              {
                "title": "下載並解壓縮",
                "description": [
                  "下載 ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  "。在Windows上，右鍵單擊它並選擇“全部提取”。在 macOS 上，雙擊它。保留提取的資料夾。"
                ],
                "shot": "MapsGrab Firefox ZIP 下載到 Firefox"
              },
              {
                "title": "開啟調試頁面",
                "description": [
                  "導航至 ",
                  {
                    "code": "about:debugging"
                  },
                  "，然後在左側邊欄中選擇您的瀏覽器。"
                ],
                "shot": "Firefox 具有臨時附加控制項的偵錯頁面"
              },
              {
                "title": "載入附加元件",
                "description": [
                  "點擊“加載臨時附加元件...”並選擇 ",
                  {
                    "code": "manifest.json"
                  },
                  " 在解壓縮後的文件夾裡面。 Firefox 重新啟動時會卸載臨時附加元件；重複此步驟再次載入。"
                ],
                "shot": "MapsGrab 作為臨時 Firefox 擴充功能加載，其後台腳本正在運行"
              }
            ]
          }
        ],
        "help": {
          "title": "安裝麻煩？",
          "description": "將瀏覽器名稱和您所看到的內容傳送給我們 - 我們將為您解除封鎖。",
          "cta": "聯繫支援人員"
        },
        "notes": {
          "kicker": "發行說明",
          "version": "0.1.0",
          "status": "預發布",
          "date": "八月 2026",
          "items": [
            "MapsGrab 擴充功能的首次預發布",
            "使用自動捲動和 36 欄位架構的 Google Maps 搜尋擷取",
            "從商家頁面提取評論和照片",
            "每個企業的電子郵件與社群資訊補全",
            "批次關鍵字與審閱-URL任務與磁碟任務狀態",
            "CSV / JSON 匯出，帶欄位選擇和 Place ID 重複資料刪除",
            "專為 Microsoft Edge 和 Firefox 構建"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "擴充功能方案",
          "title": {
            "lead": "一款擴充功能，三種",
            "accent": "方案",
            "tail": ""
          },
          "lead": "擴充功能收集的每一行（企業、評論或照片）都算是一筆記錄。所有方案均包括評論、照片和批次任務；付費方案匯出所有 36 欄位，包括電子郵件與社群資訊補全內容，每月量較大。"
        },
        "note": "每月使用量於紐約時間每月 1 日重設，未使用的記錄額度不會累計至下個月。",
        "compare": "比較所有方案"
      },
      "faq": {
        "kicker": "常見問題",
        "title": {
          "lead": "擴充功能常見",
          "accent": "問題",
          "tail": ""
        },
        "lead": "簡短的答案。除此之外，只需一封電子郵件即可獲得支援。",
        "contact": "聯繫支援人員",
        "items": [
          {
            "question": "該擴充功能可以免費使用嗎？",
            "answer": "是的。該擴充功能無需帳戶即可使用，並且每月包含 1,000 記錄。定價頁面上的付費方案增加了所有 36 欄位以及電子郵件與社群資訊補全內容，並提高了每月的數量。"
          },
          {
            "question": "支援哪些瀏覽器？",
            "answer": "Chrome、Edge、Brave等Chromium瀏覽器載入此處下載的解壓縮後的ZIP。 Firefox有一個單獨的ZIP用於臨時裝載；每次瀏覽器重新啟動後重新加載它。請按照上面的安裝指南進行操作。"
          },
          {
            "question": "我需要登入嗎？",
            "answer": "不需要。核心提取無需帳戶即可進行。配額是按已登入的帳戶計算，或在您未登入時按瀏覽器裝置計算 - 使用擁有方案的帳戶登錄，以便套用更高的數量。"
          },
          {
            "question": "什麼算是記錄？",
            "answer": "擴充功能收集的每一行都算是一筆記錄：搜尋或儲存清單中的商家、評論或照片。電子郵件與社群資訊補全不會新增記錄。"
          },
          {
            "question": "當 Google Maps 發生變化時會發生什麼？",
            "answer": "提取規則作為遠端配置提供，因此無需重新安裝擴充功能即可修復到達面板。如果無法讀取頁面，面板會顯示錯誤，而不是默默地失敗。"
          },
          {
            "question": "MapsGrab 能否看到我收集的資料？",
            "answer": "您的設定和結果儲存在本機瀏覽器中。我們的伺服器僅處理遠端配置、帳戶和配額狀態、可選電子郵件與社群資訊補全以及最少的使用日誌。"
          },
          {
            "question": "資料從哪裡來，收集是否合法？",
            "answer": "MapsGrab 僅收集您造訪的 Google Maps 頁面上公開顯示的資訊 - 任何訪客都可以閱讀的相同詳細資訊。我們不會存取私人帳戶、封閉內容或非公開資料。"
          }
        ]
      },
      "cta": {
        "kicker": "開始使用",
        "title": {
          "lead": "",
          "accent": "今天",
          "tail": "就採集你的第一份列表"
        },
        "lead": "安裝擴充程序，搜尋 Google Maps，然後匯出乾淨的電子表格 - 無需帳戶。",
        "primary": "安裝 MapsGrab",
        "secondary": "比較方案",
        "note": "包括免費的每月配額。沒有信用卡。"
      }
    },
    "account": {
      "auth": {
        "eyebrow": "網站訪問",
        "title": "登入以同步您的帳戶點數",
        "trigger": "登入",
        "modalTitle": "登入以繼續",
        "closeLabel": "關閉",
        "signedInAs": "登入身份",
        "continueWithGoogle": "續 Google",
        "googleLoading": "正在開啟 Google...",
        "or": "或者",
        "emailLabel": "電子郵件",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "繼續使用電子郵件",
        "sendCode": "傳送代碼",
        "sendingCode": "正在發送...",
        "sendCodeSuccess": "驗證碼已發送。",
        "sendAgain": "再次發送",
        "codeLabel": "驗證碼",
        "codePlaceholder": "123456",
        "signIn": "登入",
        "termsNotice": "登入即表示您同意",
        "termsLink": "條款",
        "privacyLink": "隱私權政策",
        "logout": "退出",
        "creditsLabel": "帳戶點數",
        "enterEmailFirst": "請先輸入您的電子郵件地址。",
        "enterEmailAndCode": "請輸入電子郵件和驗證碼。",
        "sendCodeFailed": "發送驗證碼失敗。",
        "googleSignInFailed": "Google 登入失敗。",
        "googleClientMissing": "Google 登入未設定。",
        "signInFailed": "登入失敗。"
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "付款已取消",
        "canceledMessage": "該訂單未付款。您可以關閉此選項卡，然後在原始視窗中再次選擇付款方式。",
        "canceledMetaDescription": "您的 PayPal 付款已取消。",
        "waitingTitle": "付款已提交",
        "waitingMessage": "您可以返回原始選項卡。我們每隔 3 秒檢查一次 PayPal 確認，結果將自動出現在此。",
        "confirmedCreditsTitle": "點數已入帳",
        "confirmedCreditsMessage": "您的 PayPal 付款已確認，帳戶點數已新增。您可以關閉此選項卡並在原始視窗中繼續。",
        "confirmedSubscriptionTitle": "訂閱已激活",
        "confirmedSubscriptionMessage": "您的 PayPal 付款已確認，您的 MapsGrab 方案已啟用。您可以關閉此選項卡並在原始視窗中繼續。",
        "failedTitle": "付款需要注意",
        "failedMessage": "我們無法自動確認此訂單。返回原始視窗或嘗試刷新您的付款狀態。"
      },
      "checkin": {
        "accountButtonLabel": "開設帳戶菜單",
        "accountMenuLabel": "帳戶選單"
      },
      "creditPurchase": {
        "title": "獲得更多帳戶點數",
        "description": "新增帳戶點數並繼續使用此工作區中的付費功能。",
        "successTitle": "點數已入帳",
        "successDescription": "您的餘額已刷新。關閉該視窗並繼續。",
        "packageEyebrow": "隨用隨付",
        "cardNote": "使用帳戶點數獲得付費網站功能。帳戶點數永不過期。",
        "creditsAmount": "{credits} 帳戶點數",
        "buyNow": "立即購買",
        "selectPackage": "選擇",
        "paymentMethodLabel": "選擇付款方式",
        "paymentTitle": "選擇付款方式",
        "selectedPackageLabel": "已選套餐",
        "confirmPurchase": "繼續付款",
        "backToProducts": "後退",
        "close": "關閉",
        "agreementText": "我同意購買條款、條款和隱私權政策。",
        "loadingConfigs": "正在加載帳戶點數包...",
        "loadFailed": "無法載入帳戶點數包。請再試一次。",
        "noConfigs": "目前沒有可用的帳戶點數包。請稍後重試。",
        "ready": "選擇帳戶點數包。價格以美元顯示。",
        "creatingOrder": "正在創建訂單...",
        "pendingPayment": "在新開啟的選項卡中完成付款。我們會自動檢查結果。",
        "pendingPaymentTitle": "等待付款",
        "cancelPayment": "取消付款",
        "supportMailPrefix": "報告問題： ",
        "success": "付款完成。帳戶點數現已可用。",
        "failed": "付款未完成。您可以重試或關閉此視窗。",
        "successCredits": "+已新增 {credits} 帳戶點數",
        "successBalance": "目前餘額：{balance} 帳戶點數",
        "createFailed": "建立訂單失敗。請再試一次。",
        "invalidPaymentData": "付款連結無效。請稍後重試。",
        "priceUpdated": "價格改變了。查看最新價格並再次購買。",
        "gatewayFailed": "付款入口暫時無法使用。請稍後重試。",
        "paymentCanceled": "付款被取消。選擇付款方式並重試。",
        "pollFailed": "刷新付款狀態失敗。請再試一次。",
        "pollTimeout": "自動刷新超時。付款後使用刷新按鈕。",
        "orderNotFound": "訂單不再可用。建立新訂單。",
        "orderExpired": "訂單已過期。請再次購買。",
        "fulfillmentFailed": "已收到付款，但尚未添加帳戶點數。請稍後重試。",
        "authExpired": "登入已過期。重新登入以繼續。",
        "popupBlocked": "您的瀏覽器阻止了新視窗。允許 MapsGrab 開啟彈出視窗並重試。"
      }
    },
    "pricing": {
      "seo": {
        "title": "定價 — 線上、擴充與 API 方案 | MapsGrab",
        "description": "MapsGrab 方案適用於每個表面：來自 $19, 的線上採集器來自 $39, 的瀏覽器擴充功能和來自 $15 的 API。每個產品都包含免費套餐 - Online 和 API 上的一次性自然月方案，Extension 上的每月訂閱。"
      },
      "hero": {
        "kicker": "定價",
        "title": {
          "lead": "",
          "accent": "三種",
          "tail": "地圖數據採集方式，對應多檔方案"
        },
        "lead": "選擇適合您工作流程的介面 - 雲端 線上採集器、瀏覽器擴充功能或 HTTP API - 然後選擇每月的數量。只需幾分鐘即可從此頁面升級或購買。",
        "meta": [
          "每款產品免費",
          "使用 PayPal 支付",
          "補差價升級"
        ],
        "switchLabel": "產品線"
      },
      "popularLabel": "最受歡迎",
      "tabs": {
        "online": {
          "name": "線上採集器",
          "shortName": "線上採集",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "記錄",
          "eyebrow": "線上採集器方案",
          "title": "雲端擷取，按記錄定價",
          "description": "在我們的基礎設施上運行 MapsGrab 引擎。一筆記錄是收集的一個商家行。付費方案包括可選的電子郵件與社群資訊補全功能，無需額外的記錄費用。",
          "billingChips": [
            "一次付款",
            "涵蓋一個自然月",
            "沒有自動續訂"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免費",
              "tagline": "小規模嘗試雲採集器",
              "price": "$0",
              "periodLabel": "永遠",
              "quota": "1,000 筆記錄/月",
              "features": [
                "商家提取用37-欄位 CSV 匯出",
                "每個任務最多 2 關鍵字",
                "用於區域搜尋的地圖和區域模式",
                "付費方案的電子郵件與社群資訊補全",
                "每個任務一個重複資料刪除 CSV"
              ],
              "ctaLabel": "免費開始",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "用於偶爾的一次性匯出",
              "price": "$19",
              "periodLabel": "一次性 · 1 個月",
              "quota": "20,000 筆記錄/月",
              "features": [
                "包含免費方案的所有功能",
                "1 個月內可使用 20,000 筆記錄",
                "一次性付款－無自動續訂",
                "每個任務最多 5 關鍵字",
                "電子郵件與社群資訊補全，預設為開啟且可選"
              ],
              "ctaLabel": "取得 Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "基礎版",
              "tagline": "每週穩定收集潛在客戶",
              "price": "$49",
              "periodLabel": "一次性 · 1 個月",
              "quota": "80,000 筆記錄/月",
              "features": [
                "包含Lite 方案的所有功能",
                "1 個月內可使用 80,000 筆記錄",
                "一次性付款－無自動續訂",
                "每個任務最多 10 關鍵字"
              ],
              "ctaLabel": "取得 基礎版",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "成長版",
              "tagline": "用於不斷增長的鉛管道",
              "price": "$99",
              "periodLabel": "一次性 · 1 個月",
              "quota": "250,000 筆記錄/月",
              "features": [
                "包含基礎版方案的所有功能",
                "1 個月內可使用 250,000 筆記錄",
                "一次性付款－無自動續訂",
                "每個任務最多 20 關鍵字"
              ],
              "ctaLabel": "取得 成長版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "專業版",
              "tagline": "對於機構和數據密集型團隊",
              "price": "$149",
              "periodLabel": "一次性 · 1 個月",
              "quota": "500,000 筆記錄/月",
              "features": [
                "包含成長版方案的所有功能",
                "1 個月內可使用 500,000 筆記錄",
                "一次性付款－無自動續訂",
                "每個任務最多 50 關鍵字"
              ],
              "ctaLabel": "取得 專業版",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "一次性付款涵蓋一個自然月，此分頁的方案不會自動續訂。一筆記錄代表從 Google Maps 採集到的一家商家；使用量於每月 1 日重設，未使用的記錄額度不會累計至下個月。",
          "compare": {
            "lead": "線上 Scraper 計畫 — 雲端提取，按記錄定價。",
            "volume": "每月記錄",
            "groups": [
              {
                "label": "數據",
                "rows": [
                  {
                    "label": "商家提取用37-欄位 CSV 匯出",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "電子郵件與社群資訊補全",
                    "cells": [
                      false,
                      "預設開啟，可選",
                      "預設開啟，可選",
                      "預設開啟，可選",
                      "預設開啟，可選"
                    ]
                  }
                ]
              },
              {
                "label": "工作流程",
                "rows": [
                  {
                    "label": "每個任務的關鍵字",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "地圖和區域模式",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "每個任務一個重複資料刪除 CSV",
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
            "usageNotice": "適用於 MapsGrab 線上採集器月記錄配額。",
            "successTitle": "方案已啟動",
            "successDescription": "您的一次性 1 個月方案已生效。線上抓取工具會在下一次配額刷新時拾取它。"
          }
        },
        "extension": {
          "name": "擴充功能",
          "shortName": "擴充功能",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "記錄",
          "eyebrow": "擴充功能方案",
          "title": "瀏覽器擷取，按記錄定價",
          "description": "擴充功能收集的每一行（企業、評論或照片）都算是一筆記錄。所有方案均包括評論、照片和批次任務；付費方案匯出所有 36 列，包括電子郵件與社群資訊補全內容。",
          "billingChips": [
            "一次付款",
            "1 個月使用權",
            "沒有自動續訂"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免費",
              "tagline": "小規模岩心提取",
              "price": "$0",
              "periodLabel": "永遠",
              "quota": "1,000 筆記錄/月",
              "features": [
                "商家資料擷取",
                "評論（11 欄）和照片 URLs",
                "批量關鍵字及評論-URL任務",
                "CSV / JSON 帶欄位選擇的匯出"
              ],
              "ctaLabel": "安裝擴充",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "對於自由工作者和不斷增長的潛在客戶管道",
              "price": "$39",
              "periodLabel": "一次性 · 1 個月",
              "quota": "100,000 筆記錄/月",
              "features": [
                "包含免費方案的所有功能",
                "100,000 每月記錄",
                "全36-欄位商家提取",
                "電子郵件與社群資訊補全"
              ],
              "ctaLabel": "取得 Pro",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "商務版",
              "tagline": "對於機構和數據密集型團隊",
              "price": "$99",
              "periodLabel": "一次性 · 1 個月",
              "quota": "500,000 筆記錄/月",
              "features": [
                "包含Pro 方案的所有功能",
                "500,000 每月記錄",
                "多市場批量任務的空間",
                "相同的本地優先匯出管道"
              ],
              "ctaLabel": "取得 商務版",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "擴充功能採集的每一列都算作一筆記錄，包括搜尋或已儲存清單中的商家、評論或照片。補全電子郵件與社群資訊不會增加記錄數。每月使用量於 1 日重設，未使用的記錄額度不會累計至下個月。",
          "compare": {
            "lead": "擴充功能方案－瀏覽器提取，按記錄定價。",
            "volume": "每月記錄",
            "groups": [
              {
                "label": "數據",
                "rows": [
                  {
                    "label": "商家資料擷取",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "全36-欄位商家提取",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "評論（11 欄）和照片 URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "電子郵件與社群資訊補全",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "批量關鍵字及評論-URL任務",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "匯出",
                "rows": [
                  {
                    "label": "CSV / JSON 帶欄位選擇的匯出",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "本地優先匯出管道",
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
            "usageNotice": "適用於 MapsGrab 瀏覽器擴充功能每月配額。",
            "successTitle": "方案已啟動",
            "successDescription": "您的一次性 1 個月方案已生效。擴充功能會在下一次配額刷新時選擇它。"
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "請求",
          "eyebrow": "API 方案",
          "title": "程序化訪問，按請求定價",
          "description": "搜尋 Google Maps 企業並透過簡單的 HTTP API 從您自己的應用程式取得他們的評論。每次成功的呼叫都算作一個請求，即使它沒有傳回結果或部分資料。",
          "billingChips": [
            "一次付款",
            "涵蓋一個自然月",
            "沒有自動續訂"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免費",
              "tagline": "小規模評估 API",
              "price": "$0",
              "periodLabel": "永遠",
              "quota": "20 請求數/月",
              "features": [
                "按關鍵字和位置進行商家搜索",
                "透過排序和分頁查看端點",
                "JSON 回复",
                "API 金鑰與您的帳戶綁定",
                "社區支持"
              ],
              "ctaLabel": "免費開始",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "基礎版",
              "tagline": "用於原型和光集成",
              "price": "$15",
              "periodLabel": "一次性 · 1 個月",
              "quota": "1,000 請求數/月",
              "features": [
                "包含免費方案的所有功能",
                "1 個月內可使用 1,000 次請求",
                "一次性付款－無自動續訂",
                "JSON 回复"
              ],
              "ctaLabel": "取得 基礎版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "專業版",
              "tagline": "用於生產集成",
              "price": "$65",
              "periodLabel": "一次性 · 1 個月",
              "quota": "5,000 請求數/月",
              "features": [
                "包含基礎版方案的所有功能",
                "1 個月內可使用 5,000 次請求",
                "一次性付款－無自動續訂",
                "JSON 回复"
              ],
              "ctaLabel": "取得 專業版",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "商務版",
              "tagline": "對於基於 MapsGrab 資料建構的產品",
              "price": "$115",
              "periodLabel": "一次性 · 1 個月",
              "quota": "10,000 請求數/月",
              "features": [
                "包含Professional 方案的所有功能",
                "1 個月內可使用 10,000 次請求",
                "一次性付款－無自動續訂",
                "JSON 回复"
              ],
              "ctaLabel": "取得 商務版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "規模",
              "tagline": "適用於大容量資料操作",
              "price": "$365",
              "periodLabel": "一次性 · 1 個月",
              "quota": "50,000 請求數/月",
              "features": [
                "包含Business 方案的所有功能",
                "1 個月內可使用 50,000 次請求",
                "一次性付款－無自動續訂",
                "JSON 回复"
              ],
              "ctaLabel": "取得 Scale",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "一次性付款涵蓋一個自然月，此分頁的方案不會自動續訂。每次成功的 API 或 MCP 呼叫都算作一次請求，包含空結果和部分結果；失敗的呼叫不計入。使用量於每月 1 日重設，未使用的請求額度不會累計至下個月。",
          "compare": {
            "lead": "API 方案 — 程序化訪問，按請求定價。",
            "volume": "每月請求數",
            "groups": [
              {
                "label": "端點",
                "rows": [
                  {
                    "label": "按關鍵字和位置進行商家搜索",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "透過排序和分頁查看端點",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON 回复",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "具有相同 API 金鑰的 MCP 伺服器",
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
                "label": "使用權",
                "rows": [
                  {
                    "label": "API 金鑰與您的帳戶綁定",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "社區支持",
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
            "usageNotice": "適用於 MapsGrab API 每月請求配額。",
            "successTitle": "方案已啟動",
            "successDescription": "您的一次性 1 個月方案已生效。您的 API 金鑰將在下一個請求時取得新配額。"
          }
        }
      },
      "plansSection": {
        "label": "方案",
        "finder": {
          "label": "您每月需要多少個 {unit}？",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} 每月 — {plan} 方案",
          "fits": "適合"
        }
      },
      "compare": {
        "kicker": "比較",
        "title": {
          "lead": "所有方案，",
          "accent": "並排對比",
          "tail": ""
        },
        "plan": "方案",
        "volumeGroup": "數量和計費",
        "billing": "計費",
        "included": "包括",
        "notIncluded": "不包括在內",
        "allPlans": "所有方案皆包含"
      },
      "usage": {
        "head": {
          "kicker": "用法",
          "title": {
            "lead": "哪些操作計入你的",
            "accent": "額度",
            "tail": ""
          },
          "lead": "採用兩種計量單位：擴充功能與線上採集器按記錄數計算，API 按請求數計算；兩者皆於每月 1 日重設。"
        },
        "records": {
          "meter": "本月使用記錄",
          "badge": "延伸·在線",
          "title": "1 記錄 = 1 收集的行",
          "body": "您收集的每一行都算作一筆記錄：線上採集器 上的一條商家；擴充功能中的商家、評論或照片。電子郵件與社群資訊補全不會新增記錄。",
          "count": "+1 記錄",
          "attachments": [
            "電話及網站",
            "開放時間",
            "電子郵件和社交"
          ]
        },
        "requests": {
          "meter": "本月使用的請求",
          "badge": "API · MCP",
          "title": "1 請求 = 1 呼叫成功",
          "body": "請求是一次成功的 API 調用，即使它沒有返回結果或部分資料；失敗的呼叫不計算在內。 MCP 工具呼叫使用相同的請求配額。",
          "counted": "成功呼叫 — 已計數",
          "notCounted": "呼叫失敗 — 不計入在內"
        },
        "reset": {
          "title": "每月 1 日重設",
          "body": "使用量於每月 1 日重設。未使用的記錄與請求額度不會累計至下個月。",
          "limit": "方案限額",
          "unused": "未使用 · 不累計至下個月",
          "flag": "重置"
        }
      },
      "billing": {
        "head": {
          "kicker": "計費",
          "title": {
            "lead": "計費清晰，",
            "accent": "沒有意外收費",
            "tail": ""
          },
          "lead": "三個產品線的支付、續約和升級如何運作。"
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "透過 PayPal 支付任何方案的費用。在 PayPal 上完成付款，然後返回此處啟動您的方案。"
          },
          "cadence": {
            "title": "一次付款",
            "body": "每個付費方案涵蓋一個自然月。一次性支付，無自動收費；當您還需要一個月時再次購買。"
          },
          "upgrade": {
            "title": "補差價升級",
            "body": "透過您目前的支付提供者將有效方案轉移到符合資格的更高層級。到目前為止，您的到期日期和使用情況保持不變。"
          },
          "independent": {
            "title": "獨立方案",
            "body": "不同選項卡上的方案是獨立的。當方案到期時，帳戶會自動返回免費套餐。"
          }
        }
      },
      "plans": {
        "loading": "正在載入付款選項...",
        "loadFailed": "無法載入付款選項。刷新頁面重試。",
        "noChannels": "目前該方案沒有可用的付款方式。",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "付款未完成",
        "billingPeriodMonthly": "1 個月",
        "billingAutoRenew": "自動續訂至取消",
        "billingOneTime": "一次付款"
      },
      "upgrade": {
        "currentPlan": "目前方案",
        "button": "升級·{amount}",
        "title": "升級您的方案",
        "confirm": "確認升級",
        "oneTime": "透過 {channel} 一次性補繳差價。您的到期日維持為 {date}。",
        "autoRenew": "差價將立即透過 {channel} 收取。您的到期日仍為 {date}；未來的續約將使用新的方案價格。",
        "pendingTitle": "等待您的升級",
        "pendingDescription": "您的支付提供者正在套用升級。您目前的方案在得到確認之前一直有效。",
        "successTitle": "方案升級",
        "successDescription": "您的新配額已啟動。您的到期日仍為 {date}。",
        "quoteFailed": "無法加載您的升級價格。刷新頁面重試。",
        "failed": "無法確認您的升級。重新整理頁面以檢查您的方案，然後再試一次。",
        "reasons": {
          "no_active_subscription": "您的方案不再有效。重新整理頁面以選擇方案。",
          "not_higher_tier": "選擇更高的等級進行升級，或等到您的方案到期後再更改等級。",
          "non_positive_diff": "您的剩餘方案價值不低於此等級。您可以在方案到期後變更等級。",
          "channel_unavailable": "您目前的付款方式無法進行升級。到期後您可以更改方案。"
        }
      },
      "faq": {
        "kicker": "常見問題",
        "title": {
          "lead": "購買前的",
          "accent": "常見問題",
          "tail": ""
        },
        "lead": "計費基礎知識。除此之外，只需一封電子郵件即可獲得支援。",
        "contact": "聯繫支援人員",
        "items": [
          {
            "question": "什麼算是記錄？",
            "answer": "一筆記錄代表採集到的一列資料，與免費方案的計量單位相同。線上採集器以一家商家為一筆記錄；擴充功能採集的每家商家、每則評論或每張照片都算作一筆記錄。補全電子郵件與社群資訊不會增加記錄數。API 分頁則按成功請求數計算用量。"
          },
          {
            "question": "我需要付費方案才能嘗試 MapsGrab 嗎？",
            "answer": "不會。每個產品都有一個沒有時間限制的免費套餐：線上採集器 和擴充功能包括每月 1,000 記錄，API 包括每月 20 請求。線上抓取和擴充功能免費方案不包括電子郵件或社交媒體資訊補全。付費線上計畫預設包含它，您可以為每個任務將其關閉。"
          },
          {
            "question": "配額如何應用到我的帳戶？",
            "answer": "配額會按已登入的帳戶進行計數（當您未登入時，按擴充功能的瀏覽器裝置進行計數）。使用擁有該方案的帳戶登錄，以便應用更高的上限。當方案到期時，帳戶會自動返回免費套餐。"
          },
          {
            "question": "我的方案會自動續訂嗎？",
            "answer": "不是。所有方案均為一個自然月一次性支付 PayPal。當您的方案到期時，您將返回免費套餐。再次購買以繼續付費方案。"
          },
          {
            "question": "我可以在不同等級之間切換嗎？",
            "answer": "您可以透過 PayPal 支付差價，將有效方案升級到符合資格的更高等級。到目前為止，您的到期日期和使用情況保持不變。不同選項卡上的方案是獨立的。"
          }
        ]
      },
      "cta": {
        "kicker": "開始使用",
        "title": {
          "lead": "從",
          "accent": "免費檔",
          "tail": "開始"
        },
        "lead": "每個產品都有無時間限制的免費方案：擴充功能與線上採集器每月各含 1,000 筆記錄，API 每月含 20 次請求。",
        "primary": "安裝擴充",
        "secondary": "嘗試線上抓取",
        "note": "包括免費的每月配額。沒有信用卡。"
      }
    },
    "extensionLogin": {
      "title": "擴充功能登入 | MapsGrab",
      "description": "登入以將您的 MapsGrab 網站會話連接到瀏覽器擴充功能。",
      "eyebrow": "瀏覽器擴充",
      "heading": "擴充功能登入",
      "checkingState": "檢查",
      "signInRequiredState": "需要登入",
      "confirmState": "確認帳戶",
      "errorState": "錯誤",
      "preparingTitle": "準備登入",
      "preparingText": "設定擴充功能登入橋。",
      "invalidParamsTitle": "登入連結無效",
      "invalidParamsText": "此登入連結缺少所需的安全參數。請從擴充功能重新開始登入。",
      "checkingSessionTitle": "檢查您的會話",
      "checkingSessionText": "驗證您現有的網站會話。",
      "finishingGoogleTitle": "正在完成Google登錄",
      "finishingGoogleText": "將您的 Google 授權交換為網站會話。",
      "signInRequiredTitle": "登入以繼續",
      "signInRequiredText": "登入以將您的網站會話連接到擴充功能。",
      "signInButtonLabel": "登入",
      "confirmTitle": "確認您的帳戶",
      "confirmText": "該擴充功能正在請求使用以下帳戶登入。僅當您剛開始從擴充功能登入時才繼續。",
      "continueButtonLabel": "繼續",
      "useAnotherAccountLabel": "使用另一個帳戶",
      "issuingTitle": "完成登入",
      "issuingText": "為擴充功能發出一次性登入代碼。",
      "issueFailedTitle": "出了點問題",
      "retryButtonLabel": "重試",
      "verificationFailedPrefix": "網站令牌驗證失敗",
      "issueFailedPrefix": "擴充功能登入碼請求失敗",
      "googleSignInFailedPrefix": "Google 登入失敗",
      "googleCompletionFailedPrefix": "Google 登入無法完成"
    },
    "online": {
      "seo": {
        "title": "線上 Google Maps Scraper — 在雲端運行提取 | MapsGrab",
        "description": "在雲端運行 Google Maps 關鍵字搜索，收集商家數據，每個任務下載一個 CSV。"
      },
      "hero": {
        "announce": {
          "badge": "3 模式",
          "text": "關鍵字、地圖區域或整個區域"
        },
        "title": {
          "lead": "",
          "accent": "雲端",
          "tail": "採集 Google Maps 數據，無需安裝"
        },
        "lead": "提交關鍵字，在雲端收集商家詳細信息，並從儀表板中為每個任務下載一個 CSV。",
        "primaryCta": "開始採集",
        "pricingCta": "查看定價",
        "meta": [
          "1,000 免費唱片/月",
          "適用於任何瀏覽器",
          "每個任務一個重複資料刪除 CSV"
        ],
        "theater": {
          "files": "1 CSV · 已儲存到下載",
          "csv": "CSV",
          "processed": "已處理",
          "parallelChip": {
            "label": "關鍵字運行",
            "value": "並聯"
          },
          "billingChip": {
            "label": "計費者",
            "value": "已交付的行數"
          }
        }
      },
      "facts": {
        "caption": "線上採集器一目了然",
        "items": [
          {
            "value": 37,
            "label": "公共列，包括連續的行號"
          },
          {
            "value": 6,
            "label": "付費方案上的社群資料欄"
          },
          {
            "value": 50,
            "label": "每個地圖模式任務的搜尋位置"
          },
          {
            "value": 60,
            "suffix": " 分分鐘",
            "label": "每個任務的收集窗口"
          },
          {
            "value": 1000,
            "label": "每月免費記錄"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "它是如何運作的",
          "title": {
            "lead": "從快速預覽，到",
            "accent": "完整匯出",
            "tail": ""
          },
          "lead": "在沒有帳戶的情況下嘗試在主頁上使用一個關鍵字。當您需要整個清單時，請登入並將其作為儀表板中的任務運行。"
        },
        "steps": [
          {
            "title": "在首頁預覽",
            "description": "一個關鍵字，沒有帳號。查看第一個結果頁麵包含多少個企業，其中第一行為 3。"
          },
          {
            "title": "登入",
            "description": "預覽不會儲存，也不會使用您的配額。登入後，您再次提交關鍵字。"
          },
          {
            "title": "創建任務",
            "description": "在儀表板 › 線上採集器 中，每行輸入一個關鍵字，或讓一個或多個地圖區域建立清單。"
          },
          {
            "title": "關鍵字並行運行",
            "description": "遵循排隊、收集和 CSV 準備狀態，然後完成、部分成功或失敗。活動任務每 5 秒刷新一次。"
          },
          {
            "title": "下載",
            "description": "當檔案可用時，下載一個 CSV 來完成整個任務。部分成功保留已交付的行；零結果沒有文件。"
          }
        ],
        "lock": "登入查看完整列表",
        "email": "you@company.com",
        "links": {
          "preview": "嘗試主頁預覽",
          "dashboard": "打開儀表板 › 線上採集器"
        }
      },
      "modes": {
        "head": {
          "kicker": "搜尋模式",
          "title": {
            "lead": "三種方式，指定",
            "accent": "搜索地點",
            "tail": ""
          },
          "lead": "逐行輸入關鍵字，對中心點周圍的地圖區域進行採樣，或將國家/地區、州和城市轉換為現成的查詢。"
        },
        "tabsLabel": "搜尋模式",
        "notes": {
          "keywords": "每行一個關鍵字，不超過您方案的限制",
          "map": "圍繞中心點對圓進行取樣",
          "regions": "來自 GeoNames 的國家、州和城市"
        },
        "keywords": {
          "hint": "每行一個關鍵字。在計數之前刪除空白行和重複行，整個任務會產生一個重複刪除的 CSV。",
          "blank": "空行·跳過",
          "duplicate": "重複·跳過",
          "limitsTitle": "每個任務的關鍵字",
          "limitsCaption": "透過線上規劃",
          "limitsHint": "當清單為空、超出方案限製或每月配額用完時，開始抓取將保持停用狀態。"
        },
        "map": {
          "formula": "{keywords} 關鍵字 × {points} 網格點",
          "scale": "{value}公里",
          "facts": [
            "從中心向外搜尋點。",
            "該圓圈僅放置搜尋中心 - 結果不會被剪切到它。",
            "跨關鍵字或點找到的商家將在任務中保留一次。"
          ]
        },
        "regions": {
          "hint": "您可以在提交之前編輯產生的查詢。每一個都算是一個關鍵字。",
          "addCity": "新增城市"
        }
      },
      "results": {
        "head": {
          "kicker": "結果",
          "title": {
            "lead": "一個任務，",
            "accent": "一份 CSV",
            "tail": ""
          },
          "lead": "將 37 公共列下載到一個 CSV 中以完成整個任務，並在搜尋中刪除連續的行號和企業重複資料。"
        },
        "csvMeta": "1 CSV · {count} 已交付行數",
        "rows": "{count} 行",
        "searches": "透過搜尋傳遞的行",
        "notes": [
          "第 1 列包含固定的英文欄位名稱，以及連續編號的 # 欄位。",
          "第 2 列以建立任務時使用的介面語言說明各個欄位。",
          "已完成且結果為零的任務沒有文件。部分成功會保留已交付的行。",
          "標籤行永遠不會計入您的記錄。"
        ],
        "language": "工作語言：繁體中文",
        "rowLabel": "排",
        "legend": {
          "fields": "行 1 · 欄位名稱",
          "labels": "行2·任務語言",
          "data": "行3+·企業"
        },
        "more": "+{count} 個其他欄位",
        "csvLabels": {
          "#": "行數",
          "Name": "企業名稱",
          "Fulladdress": "完整地址",
          "Categories": "商家類別",
          "Phone": "主要電話",
          "Review Count": "評論數量",
          "Average Rating": "平均評論評級",
          "Website": "企業網站",
          "Emails": "公共網站電子郵件",
          "Search Keyword": "搜尋關鍵字"
        }
      },
      "features": {
        "head": {
          "kicker": "能力",
          "title": {
            "lead": "線上採集器能",
            "accent": "做什麼",
            "tail": ""
          },
          "lead": "在雲端收集的商家詳細信息，以及付費方案中的可選電子郵件和社交資料。"
        },
        "items": [
          {
            "id": "keywords",
            "title": "關鍵字任務",
            "description": "將商家類型和地點作為單獨的關鍵字提交。您的方案決定了關鍵字限制和每月記錄配額。",
            "meta": "2 · 5 · 10 · 20 · 50 每個任務的關鍵字"
          },
          {
            "id": "history",
            "title": "任務歷史記錄",
            "description": "追蹤任務進度並查看儀表板中每個關鍵字的記錄計數。",
            "meta": "已完成 · 部分成功 · 失敗"
          },
          {
            "id": "details",
            "title": "商家詳情",
            "description": "收集姓名、地址、電話號碼、網站、評級、營業時間、座標和地點識別碼（如果有）。",
            "meta": "每家商家 37 個公開欄位"
          },
          {
            "id": "enrichment",
            "title": "電子郵件與社群資訊補全",
            "description": "對於付費線上方案，預設會檢查商家網站的電子郵件地址和社交資料。您可以為每個任務關閉此功能。",
            "meta": "付費方案 · 預設開啟"
          },
          {
            "id": "downloads",
            "title": "一項任務 CSV",
            "description": "當檔案可用時，將整個任務下載為一個 CSV。不需要每次搜尋文件。",
            "meta": "{job}.csv · 37 個欄位"
          },
          {
            "id": "browser",
            "title": "沒有什麼可安裝的",
            "description": "可透過任何瀏覽器在雲端運作 - Edge、Firefox 或其他任何瀏覽器。從任務歷史記錄下載結果。",
            "meta": "Edge·Firefox·任何瀏覽器"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "用法",
          "title": {
            "lead": "只按",
            "accent": "實際獲得的記錄",
            "tail": "計費"
          },
          "lead": "任務完成後，線上任務將以已交付的商家行進行計量。提交時不會保留任何內容，並且每個 CSV 中的標籤行​​永遠不會被計算在內。"
        },
        "checks": [
          "提交任務不會保留您的配額",
          "已在運行的任務完成，即使超出了剩餘配額",
          "配額用完後，無法提交新任務",
          "使用量於紐約時間每月 1 日重設；未使用的記錄額度不會累計至下個月"
        ],
        "mock": {
          "recordsLabel": "本月記錄",
          "left": "{count} 左",
          "exhausted": "配額已用完",
          "task": "任務{id}…",
          "pending": "目前已交付 · 任務完成時計算",
          "counted": "計入本月",
          "rows": "{count} 行",
          "running": "執行中",
          "delta": "+{count} 記錄"
        }
      },
      "plans": {
        "head": {
          "kicker": "線上採集器方案",
          "title": {
            "lead": "雲端採集，",
            "accent": "按記錄定價",
            "tail": ""
          },
          "lead": "在我們的基礎架構上執行 MapsGrab 引擎。一筆記錄就是下發的一個商家行；付費方案包括電子郵件與社群資訊補全功能，無需額外的記錄費用。"
        },
        "specs": {
          "keywords": "每個任務的關鍵字",
          "contacts": "電子郵件和社交",
          "included": "預設開啟",
          "excluded": "不包括在內"
        },
        "note": "一次性付款涵蓋一個自然月，線上方案不會自動續訂。使用量於紐約時間每月 1 日重設，未使用的記錄額度不會累計至下個月。",
        "compare": "比較所有方案"
      },
      "faq": {
        "kicker": "常見問題",
        "title": {
          "lead": "線上採集器常見",
          "accent": "問題",
          "tail": ""
        },
        "lead": "簡短的答案。除此之外，只需一封電子郵件即可獲得支援。",
        "contact": "聯繫支援人員",
        "items": [
          {
            "question": "線上採集器與擴充功能有何不同？",
            "answer": "該擴充功能會收集您的瀏覽器中的資料。 線上採集器 在雲端中執行關鍵字任務並將結果傳送到您的儀表板。"
          },
          {
            "question": "資料從哪裡來，收集是否合法？",
            "answer": "MapsGrab 僅收集 Google Maps 上公開顯示的資訊 - 任何訪客都可以閱讀的相同詳細資訊。我們不會存取私人帳戶、封閉內容或非公開資料。"
          },
          {
            "question": "我可以匯出為哪些格式？",
            "answer": "有結果的任務會提供一個 UTF-8 CSV 以及 37 公共列、連續行號和兩個標題行。企業在所有搜尋中都進行了重複資料刪除。沒有結果的任務沒有文件。"
          },
          {
            "question": "它要多少錢？",
            "answer": "線上採集器 遵循定價頁面上的 MapsGrab 方案，包括每月免費記錄配額。當您需要更多時，付費方案會提高限制。"
          },
          {
            "question": "我需要電子郵件和社群資料的付費方案嗎？",
            "answer": "線上免費不包括電子郵件或社交媒體資訊補全。付費線上計畫預設包含它，您可以為每個任務將其關閉。任務提交後，選擇就確定了。"
          },
          {
            "question": "一個任務可以運行多久？",
            "answer": "每個任務都有一個 60 分鐘的收集視窗。部分成功可以提供收集的行以及找到的任何電子郵件或設定檔。您的歷史記錄顯示 CSV 是否可用。"
          },
          {
            "question": "我登入時會儲存主頁預覽嗎？",
            "answer": "不會。主頁預覽是快速瀏覽，不會儲存。登入後，在儀表板中開啟 線上採集器 並再次將關鍵字提交為完整任務。"
          }
        ]
      },
      "cta": {
        "kicker": "開始使用",
        "title": {
          "lead": "將第一個",
          "accent": "雲端任務",
          "tail": "加入隊列"
        },
        "lead": "提交關鍵字、追蹤任務進度並從儀表板下載商家資料。",
        "primary": "開始採集",
        "secondary": "查看定價",
        "note": "包括免費的每月配額。沒有信用卡。"
      }
    },
    "apiPage": {
      "switchLabel": "API 端點",
      "switchItems": {
        "search": "採集器",
        "reviews": "評論",
        "photos": "照片"
      },
      "primaryCta": "取得 API 金鑰",
      "pricingCta": "查看定價",
      "console": {
        "label": "範例 API 請求和回應",
        "langLabel": "請求語言",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "複製請求",
        "replay": "重播請求",
        "ready": "準備好",
        "composing": "撰寫請求...",
        "sending": "正在發送請求...",
        "done": "回應 · 200 OK · application/json",
        "waiting": "// 等待回應...",
        "response": "回應範例"
      },
      "endpoints": {
        "kicker": "端點",
        "title": {
          "lead": "一個金鑰，",
          "accent": "三個",
          "tail": "接口"
        },
        "lead": "搜尋地點後，將結果中的 `fid` 傳給評論或照片 API。三個介面共用同一個 API 金鑰和每月請求額度。",
        "here": "你在這裡",
        "paramsLabel": "參數",
        "mcp": {
          "title": "使用人工智慧代理進行建置？",
          "description": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。",
          "link": "探索 MCP"
        }
      },
      "chain": {
        "kicker": "鏈端點",
        "title": {
          "lead": "",
          "accent": "採集器 → 評論 / 照片",
          "tail": ""
        },
        "lead": "搜尋地點後，將結果中的 `fid` 傳給評論或照片 API。三個介面共用同一個 API 金鑰和每月請求額度。",
        "label": "搜尋地點後，將結果中的 fid 傳給評論或照片 API。三個介面共用同一個 API 金鑰和每月請求額度。",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 評論"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 評論"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 評論"
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
          "note": "成功回應的 status 為 partial，reason 說明採集停止原因。reported_total 是上游回報數或 null，不代表已核實的完整相簿數量。"
        }
      },
      "reference": {
        "kicker": "參考",
        "title": {
          "lead": "發送請求，獲取 ",
          "accent": "JSON",
          "tail": ""
        },
        "lead": "將您的金鑰以 `Authorization: Bearer YOUR_API_KEY` 形式傳送，正文為 JSON。每個回應都包含在 `{code, data, msg}` 中，`code` 10000 表示成功。",
        "baseUrl": "基地 URL",
        "copyBaseUrl": "複製基地 URL",
        "request": "要求",
        "response": "回覆",
        "columns": {
          "parameter": "範圍",
          "field": "場地",
          "type": "類型",
          "description": "描述",
          "example": "例子"
        },
        "required": "必需的",
        "groupsLabel": "現場組",
        "notes": [
          {
            "icon": "gauge",
            "title": "每次成功呼叫一個請求",
            "description": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
          },
          {
            "icon": "key",
            "title": "401 表示檢查您的金鑰",
            "description": "遺失或無效的金鑰將傳回 HTTP 401。其他錯誤回傳 HTTP 200 以及非 10000 `code` 和 `msg`。"
          },
          {
            "icon": "locate",
            "title": "位置是偏見，不是柵欄",
            "description": "`ll` 告訴地圖在哪裡搜尋。該視圖之外的地方仍然可以出現。"
          },
          {
            "icon": "target",
            "title": "命名該地點",
            "description": "將城市、州或 ZIP 放入 `q` 中 - “靠近我”在伺服器上沒有任何可錨定的內容。"
          }
        ]
      },
      "plans": {
        "kicker": "API 方案",
        "title": {
          "lead": "程序化訪問，",
          "accent": "按請求定價",
          "tail": ""
        },
        "lead": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
      },
      "faq": {
        "lead": "簡短的答案。除此之外，只需一封電子郵件即可獲得支援。",
        "contact": "聯繫支援人員"
      },
      "cta": {
        "kicker": "開始使用",
        "note": "包括免費的每月配額。沒有信用卡。"
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps 採集器 API — JSON 中的商家資料 | MapsGrab",
        "description": "MapsGrab 採集 API 將 Google Maps 搜尋結果傳回為 JSON：姓名、地址、電話、網站、評分、時間、座標、Place ID 和 fid — 也可根據要求提供電子郵件和社交資料。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "數據採集",
          "tail": " API"
        },
        "lead": "透過 HTTPS 傳送關鍵字，並以 JSON 的形式傳回 Google Maps 企業：名稱、地址、電話、網站、評分、營業時間、座標、Place ID 和 fid - 也可依需求提供電子郵件和社群資料。",
        "meta": [
          "免費方案：{quota}",
          "搜尋與評論共用一把金鑰",
          "JSON 超過 HTTPS"
        ],
        "chips": [
          {
            "label": "每個地方",
            "value": "29 資料字段"
          },
          {
            "label": "每頁",
            "value": "最多 20 個位置"
          }
        ]
      },
      "endpoint": {
        "name": "採集 API",
        "description": "適用於任何關鍵字和可選位置的企業 — 每個位置 29 字段，以及帶有 `extra` 的電子郵件和社交資料。",
        "link": "探索採集器 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "採集 API",
          "tail": " 返回哪些數據"
        },
        "lead": "關鍵字和可選的位置偏差； Google Maps 搜尋顯示的位置，結構為 JSON。",
        "items": [
          {
            "icon": "search",
            "title": "按關鍵字和位置搜尋",
            "description": "傳送 `q` 以及可選的 `ll` 位置偏差。 `page` 設定要收集的結果頁數，1–10, 最多 20 個位置，全部在一個回應中。"
          },
          {
            "icon": "table",
            "title": "每個位置 29 字段",
            "description": "名稱、類別、完整地址、電話、網站、評分和評論計數、開放時間、座標、Place ID、CID、fid、所有者等。"
          },
          {
            "icon": "mail",
            "title": "電子郵件與社群資訊補全",
            "description": "將 `extra` 設定為 `true` 以新增 `emails` 和 `medias`：在每個企業網站上找到的 Instagram、Facebook、YouTube、TikTok、LinkedIn 和 X 個人資料。"
          },
          {
            "icon": "braces",
            "title": "乾淨、可預測 JSON",
            "description": "一個 `{code, data, msg}` 信封中包含 snake_case 欄位。值 Google Maps 不會顯示為 `null` 或空列表，也不會顯示為空字串。"
          },
          {
            "icon": "layers",
            "title": "部分數據被標記",
            "description": "如果某些詳細資料無法填寫，您仍可取得位置 - 將 `partial` 設定為 `true` ，並以 `warnings` 說明缺少的內容。"
          },
          {
            "icon": "shield",
            "title": "僅公開數據",
            "description": "結果僅包含 Google Maps 公開顯示的內容 - 任何訪客都可以閱讀的相同詳細資訊。"
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
            "description": "要搜尋的內容，最多 300 個字元 - 商家類型加地點，例如`coffee shop in Portland, OR`。"
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "要收集多少個結果頁，每個 1–10, 最多 20 個位置，全部在一個回應中傳回。當頁面少於 20 個位置或沒有新內容時，收集會提前停止。預設 `1`。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "結果語言，例如`en` 或 `fr`。預設 `en`。"
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "可選位置偏差為`@lat,lng,zoom`，縮放0–21。它告訴地圖去哪裡搜尋；結果不會被裁切為半徑。"
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` 將 `emails` 和 `medias` 加到每個位置。預設 `false`。"
          }
        ],
        "groups": [
          {
            "label": "身分",
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
            "label": "接觸",
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
                "badge": "額外的"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "額外的"
              }
            ]
          },
          {
            "label": "地點",
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
            "label": "評級",
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
            "label": "輪廓",
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
            "label": "頁",
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
          "lead": "採集 API 常見",
          "accent": "問題",
          "tail": ""
        },
        "items": [
          {
            "question": "採集 API 回傳什麼？",
            "answer": "JSON 每個收集的頁數最多 20 個位置。每個地點都有 29 欄位 - 名稱、類別、地址、電話、網站、評分、評論計數、開放時間、座標、Place ID、CID、fid 等 - 加上電子郵件和社交資料（當額外資訊為真時）。"
          },
          {
            "question": "我如何進行身份驗證？",
            "answer": "將您的 MapsGrab API 金鑰作為不記名令牌傳送至 Authorization 標頭中。每個帳戶都有一把金鑰。只有當您產生它時，它才會完整顯示，並且產生新金鑰會立即停用舊金鑰。"
          },
          {
            "question": "請求是如何計算的？",
            "answer": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
          },
          {
            "question": "頁面有什麼作用？",
            "answer": "page 是一次呼叫中收集的結果頁數，從 1 到 10。每頁總計 20 個位置，當 Google Maps 沒有新內容時，收集會提前停止。它不是頁碼。"
          },
          {
            "question": "數據公開嗎？",
            "answer": "是的。 API 僅傳回 Google Maps 上公開顯示的資訊 - 任何訪客都可以閱讀相同的詳細資訊。它不會存取私人帳戶或非公開資料。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "將地圖數據接入你的",
          "accent": "應用",
          "tail": ""
        },
        "lead": "每次搜尋一個 HTTP 請求，回應中結構化 JSON — 適用於 CRM、資料管道和您自己的產品。"
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps 評論採集器 API — JSON 中的評論 | MapsGrab",
        "description": "MapsGrab 評論 API 將 Google Maps 商家的公共評論返回為 JSON：評級、文本和翻譯、作者、日期、評論照片和所有者回复 — 每頁最多 60（帶遊標）。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "評論",
          "tail": "採集 API"
        },
        "lead": "透過其 fid 請求對任何 Google Maps 商家進行公開評論，並獲得結構化的 JSON 返回：評級、文本和翻譯、作者、日期、評論照片和所有者回复 - 使用遊標逐頁查看。",
        "meta": [
          "免費方案：{quota}",
          "每頁最多 60 則評論",
          "JSON 超過 HTTPS"
        ],
        "chips": [
          {
            "label": "每頁",
            "value": "最多 60 則評論"
          },
          {
            "label": "排序方式",
            "value": "相關性·最新·評級"
          }
        ]
      },
      "endpoint": {
        "name": "評論 API",
        "description": "`fid` 對一家企業的公開評論 — 每頁最多 60，按照您的方式排序，使用遊標翻頁。",
        "link": "探索評論 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "評論 API",
          "tail": " 返回哪些數據"
        },
        "lead": "企業的每一次公開評論——評級、文字、作者、照片和所有者回應——每個請求一頁。",
        "items": [
          {
            "icon": "review",
            "title": "評論者：fid",
            "description": "從任何 採集 API 結果中透過 `fid` 尋址企業，然後將 `next_cursor` 返回以閱讀下一頁，每頁最多 60 條評論。"
          },
          {
            "icon": "filter",
            "title": "以你的方式排序",
            "description": "`sort_by` 首先傳回最相關 (1)、最新 (2)、評分最高 (3) 或評分最低 (4) 的評論。"
          },
          {
            "icon": "list",
            "title": "文字、翻譯和日期",
            "description": "評分、評論文字、`translated_text` 和 `language`，以及 `published_at_ms` 和每則評論的相對日期。"
          },
          {
            "icon": "user",
            "title": "作者詳細信息",
            "description": "作者姓名和個人資料連結、作者的評論計數和本地嚮導狀態。"
          },
          {
            "icon": "image",
            "title": "照片和業主回复",
            "description": "`images` 列出了評論中附加的照片 URLs； `owner_response` 攜帶所有者的回复，`owner_response_at_ms` 攜帶時間。"
          },
          {
            "icon": "shield",
            "title": "僅公開數據",
            "description": "僅在 Google Maps 上公開顯示的評論 - 任何訪客都可以閱讀相同的內容。"
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
            "description": "商家功能 ID，例如`0x5495…:0xbeb4…`。每個 採集 API 位置都包含它。"
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "上一頁的 `next_cursor`。在第一頁中省略它。"
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` 最相關 · `2` 最新 · `3` 最高評級 · `4` 最低評級。預設 `1`。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "語言代碼，例如`en`。預設 `en`。"
          }
        ],
        "groups": [
          {
            "label": "評論",
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
            "label": "作者",
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
            "label": "店主回覆",
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
            "label": "頁",
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
          "lead": "評論 API 常見",
          "accent": "問題",
          "tail": ""
        },
        "items": [
          {
            "question": "我該如何處理特定商家？",
            "answer": "每個 採集 API 位置都包含的 fid 功能 ID。免費的 Place ID 查找器也可以從任何 Google Maps 位置 URL 讀取 FID。"
          },
          {
            "question": "每則評論包含哪些欄位？",
            "answer": "評論 ID、評分、文字及其翻譯和語言、發佈時間和相對日期、作者姓名、個人資料連結、評論計數和本地嚮導狀態、附加照片以及所有者回复及其時間。"
          },
          {
            "question": "我可以收集多少評論？",
            "answer": "每個請求都會傳回一頁最多 60 則評論以及 next_cursor 則評論。將其傳回以閱讀下一頁；當 next_cursor 為空時，沒有更多頁面。"
          },
          {
            "question": "請求是如何計算的？",
            "answer": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
          },
          {
            "question": "數據公開嗎？",
            "answer": "是的。 API 僅傳回在 Google Maps 上公開顯示的評論 - 任何訪客都可以閱讀相同的內容。它不會存取私人帳戶或非公開資料。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "批量",
          "tail": "監測評論"
        },
        "lead": "乾淨 JSON 中的 Cursor 分頁評論執行緒 — 用於監控、研究和報告。"
      }
    },
    "photosApi": {
      "seo": {
        "title": "相片 API — 公開商家照片 URL | MapsGrab",
        "description": "透過商家的 fid 取得公開照片 URL，以 JSON 傳回。max_results 限制本次交付數量；結果為部分交付，不保證完整相簿。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "照片",
          "tail": " API"
        },
        "lead": "透過商家的 fid 取得公開照片 URL，以 JSON 傳回。max_results 限制本次交付數量；結果為部分交付，不保證完整相簿。",
        "meta": [
          "免費方案：{quota}",
          "公開商家照片 URL",
          "按請求定價"
        ],
        "chips": [
          {
            "label": "交付狀態",
            "value": "partial"
          },
          {
            "label": "實際數量",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "相片 API",
        "description": "透過商家的 fid 取得公開照片 URL，以 JSON 傳回。max_results 限制本次交付數量；結果為部分交付，不保證完整相簿。",
        "link": "瞭解照片 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "相片 API",
          "tail": ""
        },
        "lead": "公開商家照片 URL",
        "items": [
          {
            "icon": "image",
            "title": "依 fid 取得照片",
            "description": "使用搜尋結果或 Place ID 查找器提供的 `fid`。`photos` 中每項包含一個公開照片 `url`。"
          },
          {
            "icon": "filter",
            "title": "限制每次交付數量",
            "description": "`max_results` 為正整數，預設 200，只限制交付上限，實際照片可能更少；不提供頁碼或游標。"
          },
          {
            "icon": "list",
            "title": "查看交付狀態",
            "description": "成功回應的 `status` 為 `partial`，`reason` 說明採集停止原因。`reported_total` 是上游回報數或 `null`，不代表已核實的完整相簿數量。"
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
            "description": "搜尋結果或 Place ID 查找器提供的商家 FID，格式為 `0x…:0x…`，每段含 12–20 位十六進位數字。"
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "本次照片交付上限，正整數，預設 200；不保證取得該數量。"
          }
        ],
        "groups": [
          {
            "label": "照片",
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
            "label": "交付狀態",
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
          "lead": "照片 API 常見",
          "accent": "問題",
          "tail": ""
        },
        "items": [
          {
            "question": "如何請求商家照片？",
            "answer": "向 /photos 傳送 POST，請求包含 fid 和選填的 max_results；使用與搜尋、評論 API 相同的 Bearer API 金鑰。"
          },
          {
            "question": "能取得完整相簿嗎？",
            "answer": "成功回應的 status 為 partial，reason 說明採集停止原因。reported_total 是上游回報數或 null，不代表已核實的完整相簿數量。 max_results 為正整數，預設 200，只限制交付上限，實際照片可能更少；不提供頁碼或游標。"
          },
          {
            "question": "我如何獲得企業的認可？",
            "answer": "每個 採集 API 位置都包含其 fid，且免費的 Place ID 查找器從任何 Google Maps 位置 URL 讀取 FID。"
          },
          {
            "question": "請求是如何計算的？",
            "answer": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
          },
          {
            "question": "數據公開嗎？",
            "answer": "是的。圖片 URLs 指向 Google Maps 上公開顯示的照片 — 任何訪客都可以看到相同的影像。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "將商家照片接入應用程式",
          "tail": ""
        },
        "lead": "使用現有 API 金鑰取得公開照片 URL 和交付狀態。"
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps 採集器 MCP 伺服器 | MapsGrab",
        "description": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。"
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "連接您的代理",
      "hero": {
        "kicker": "MCP 伺服器",
        "title": {
          "lead": "Google Maps 數據採集 ",
          "accent": "MCP",
          "tail": " 服務器"
        },
        "lead": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。",
        "meta": [
          "Streamable HTTP",
          "使用 OAuth 登入",
          "免費方案：{quota}"
        ],
        "chips": [
          {
            "label": "傳輸協定",
            "value": "Streamable HTTP"
          },
          {
            "label": "工具結果",
            "value": "結構化 JSON"
          }
        ]
      },
      "agent": {
        "label": "代理會話範例：有關本地企業的問題、具有結構化結果的 MapsGrab 工具呼叫以及代理的答案",
        "session": "代理會話",
        "connected": "MCP 伺服器 {server} 已連接",
        "placeholder": "詢問 Google Maps 上的任何地方...",
        "thinking": "思維…",
        "running": "執行中",
        "scenes": [
          {
            "prompt": "尋找德克薩斯州奧斯汀評級為 4.8 或更高的牙醫，並列出他們的電話號碼。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 個地點",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 更多地點"
              }
            ],
            "answer": [
              "前三個 20 結果已被評級 ",
              {
                "strong": "4.8 或更高"
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
            "prompt": "人們在波特蘭 Ember & Oak Coffee 的最新評論中怎麼說？",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 地點",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 評論",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "大多 ",
              {
                "strong": "5-星"
              },
              " — 人們稱讚濃縮咖啡和友善的員工。一個反覆出現的註解： ",
              {
                "strong": "週末座位緊張"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "芝加哥的哪些水管工沒有列出網站？將它們放在桌子上。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 個地點",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 更多地點"
              }
            ],
            "answer": [
              {
                "strong": "4 的 20"
              },
              " 沒有列出網站。前三個："
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
            "prompt": "提取 Rose City Roasters 評分最低的評論並起草禮貌的回應。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 地點",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 評論",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "最低評分大多提到 ",
              {
                "strong": "尖峰時段服務緩慢"
              },
              ". ",
              {
                "strong": "3 的 2"
              },
              " 還沒有業主回覆——我為每個人起草了一份。"
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "工具",
        "title": {
          "lead": "MCP 服務器提供哪些",
          "accent": "工具",
          "tail": ""
        },
        "lead": "三個工具: Search / Reviews / Photos.",
        "kind": "工具",
        "returns": "回傳內容",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "搜尋地點",
            "description": "關鍵字和位置搜尋會傳回 Google Maps 搜尋顯示的內容 - 姓名、電話、評分、時間、座標、地點 ID 和 fids。",
            "args": [
              {
                "name": "q",
                "description": "關鍵字加城市、州或 ZIP"
              },
              {
                "name": "page",
                "description": "要收集的結果頁，1–10 · 每個最多 20 個位置"
              },
              {
                "name": "hl",
                "description": "結果語言，例如`en`"
              },
              {
                "name": "ll",
                "description": "位置偏差，`@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` 新增電子郵件和社群資料"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "與 採集 API 相同的數據"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "列出評論",
            "description": "您的代理商正在調查的任何商家的評級、評論文字、作者、日期、照片和所有者回應。",
            "args": [
              {
                "name": "fid",
                "description": "從任何搜尋結果"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` 從最後一頁開始；省略第一個"
              },
              {
                "name": "sort_by",
                "description": "1 相關 · 2 最新 · 3 最高 · 4 最低"
              },
              {
                "name": "hl",
                "description": "語言，例如`en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "與評論 API 相同的數據"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "依 fid 取得照片",
            "description": "透過商家的 fid 取得公開照片 URL，以 JSON 傳回。max_results 限制本次交付數量；結果為部分交付，不保證完整相簿。",
            "args": [
              {
                "name": "fid",
                "description": "搜尋結果或 Place ID 查找器提供的商家 FID，格式為 `0x…:0x…`，每段含 12–20 位十六進位數字。"
              },
              {
                "name": "max_results",
                "description": "本次照片交付上限，正整數，預設 200；不保證取得該數量。"
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "瞭解照片 API"
          }
        ]
      },
      "flow": {
        "kicker": "如何連接",
        "title": {
          "lead": "通過一個接口，讓智能體獲取",
          "accent": "實時地圖數據",
          "tail": ""
        },
        "lead": "您的用戶端透過 Streamable HTTP 連線並透過瀏覽器登入。代理發現這些工具，在提示需要地圖資料時呼叫它們，並讀回結構化的 JSON 。",
        "label": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。 search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP 用戶端",
        "anyClient": "任何 MCP 客戶端",
        "toolsLabel": "工具",
        "hub": "MapsGrab MCP",
        "publicData": "公共 Google Maps 數據",
        "resultLabel": "結果",
        "results": [
          "20 個地點",
          "60 評論",
          "2 照片"
        ],
        "steps": [
          {
            "title": "連接",
            "description": "將端點新增至您的用戶端，然後透過瀏覽器登入 MapsGrab。"
          },
          {
            "title": "發現",
            "description": "您的代理程式列出了 MapsGrab 工具及其輸入模式。"
          },
          {
            "title": "呼叫",
            "description": "當提示需要地圖資料時，代理程式會呼叫工具並讀取 JSON 結果。"
          }
        ]
      },
      "setup": {
        "kicker": "設定",
        "title": {
          "lead": "",
          "accent": "每個客戶端",
          "tail": "只需一段配置"
        },
        "lead": "將您的用戶端指向 MapsGrab 端點並透過瀏覽器登入 - 無需複製 API 金鑰，無需 SDK，無需執行本機進程。",
        "tabsLabel": "MCP 用戶端",
        "copy": "複製配置",
        "clients": {
          "claude": {
            "file": "終端",
            "steps": [
              {
                "title": "新增伺服器",
                "description": "執行指令將 `mapsgrab` 註冊到 HTTP 上。"
              },
              {
                "title": "登入",
                "description": "在 Claude Code 中，執行 `/mcp`，選擇 `mapsgrab` 並進行驗證 — MapsGrab 在瀏覽器中開啟供您批准。"
              },
              {
                "title": "詢問地圖數據",
                "description": "Claude Code 列出 MapsGrab 工具並在提示需要時呼叫它們。"
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "編輯 mcp.json",
                "description": "將設定區塊加入 `~/.cursor/mcp.json` 可套用至所有專案，或加入 `.cursor/mcp.json` 僅套用至單一專案。"
              },
              {
                "title": "登入",
                "description": "在 Cursor 設定 → MCP 中，按一下 `mapsgrab` 旁的連線並在瀏覽器中核准它。"
              },
              {
                "title": "使用工具",
                "description": "`mapsgrab` 在 MCP 伺服器清單中顯示其工具，為代理做好準備。"
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "新增 .vscode/mcp.json",
                "description": "貼上該區塊 - 它只包含端點 URL，沒有什麼秘密。"
              },
              {
                "title": "登入",
                "description": "啟動伺服器。 VS Code 要求透過 MapsGrab 進行驗證並開啟瀏覽器進行批准。"
              },
              {
                "title": "使用代理模式",
                "description": "在代理模式下開啟聊天並啟用 MapsGrab 工具。"
              }
            ]
          },
          "codex": {
            "file": "終端",
            "steps": [
              {
                "title": "新增伺服器",
                "description": "執行`codex mcp add`，透過URL註冊`mapsgrab`。"
              },
              {
                "title": "登入",
                "description": "執行 `codex mcp login mapsgrab` 並在瀏覽器中核准 MapsGrab。"
              },
              {
                "title": "開始 Codex",
                "description": "新會話載入 `mapsgrab` 及其工具。"
              }
            ]
          }
        },
        "apiKey": {
          "title": "無法從瀏覽器登入？使用 API 金鑰",
          "description": "如果您的用戶端不支援 MCP 授權，或在伺服器或 CI 中執行，請將您的 API 金鑰新增為 `Authorization` 標頭。將金鑰保存在環境變數或客戶端的秘密輸入中，而不是共用的設定檔中。",
          "link": "取得 API 金鑰",
          "snippet": "任何 HTTP 客戶端"
        },
        "spec": {
          "title": "任何其他 MCP 客戶端",
          "subtitle": "包括 MCP Inspector",
          "transport": "傳輸協定",
          "transportValue": "Streamable HTTP",
          "endpoint": "端點",
          "copyEndpoint": "複製端點",
          "auth": "授權",
          "authValue": "OAuth 登入（後備：Authorization: Bearer YOUR_API_KEY）"
        }
      },
      "prompts": {
        "kicker": "提示範例",
        "title": {
          "lead": "用自然語言提問，",
          "accent": "獲得數據表格",
          "tail": ""
        },
        "lead": "勘探、本地市場研究、評論監控—描述工作，然後您的代理人決定呼叫哪個 MapsGrab 工具。",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "勘探",
              "quote": "“查找德克薩斯州奧斯汀評級為 4.8 或更高的牙醫，並列出他們的電話號碼。”",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "名聲",
              "quote": "“總結一下人們在波特蘭 Ember & Oak Coffee 的最新評論中所說的內容。”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "潛在客戶名單",
              "quote": "“通過電子郵件和 Instagram 個人資料建立丹佛瑜伽工作室的列表。”",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "市場調查",
              "quote": "“比較波特蘭 Division St 咖啡店的評分和評論數量。”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "聯絡資訊補全",
              "quote": "“在此電子表格中添加每個企業的 Place ID、電話和網站。”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "店主回覆",
              "quote": "“提取 Rose City Roasters 評分最低的評論並起草禮貌的回复。”",
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
              "tag": "網站空白",
              "quote": "“芝加哥的哪些水管工沒有列出網站？將它們放在表格中。”",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "開放時間",
              "quote": "“60614 附近哪些汽車修理廠週日營業？”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "測繪",
              "quote": "“匯出布魯克林的素食餐廳，坐標為 GeoJSON。”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "本土化",
              "quote": "“搜索里昂的麵包店並返回法語的列表詳細信息。”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "已認領的列表",
              "quote": "“檢查奧斯汀的哪些健身房已聲明其 Google 商家列表。”",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "本地嚮導",
              "quote": "“最近對 Hawthorne Bean Co. 的哪些評論來自本地嚮導？”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "回應時間",
              "quote": "“這些沙龍會回覆他們的評論嗎？業主回覆需要多長時間？”",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "身份驗證和數據",
        "title": {
          "lead": "登錄一次，",
          "accent": "只訪問公開數據",
          "tail": ""
        },
        "lead": "對 MCP 端點的每次呼叫都會攜帶持有者憑證 - 登入時的 OAuth 令牌，或者如果您的用戶端無法登錄，則為 API 金鑰 - 並且每個結果都來自 Google Maps 公開顯示的內容。",
        "inspector": {
          "label": "範例 MCP 請求帶有承載 Authorization 標頭，其 JSON-RPC 回應帶有結構化內容",
          "request": "請求",
          "response": "回覆",
          "verified": "令牌已驗證"
        },
        "items": [
          {
            "icon": "key",
            "title": "登入，或改用 API 金鑰",
            "description": "透過瀏覽器登入並批准客戶端。沒有 MCP 授權的用戶端可以將您的 API 金鑰作為不記名令牌傳遞 - 兩者都可以使用相同的工具。"
          },
          {
            "icon": "eye",
            "title": "讀取 Google Maps，從不寫入",
            "description": "這些工具僅搜尋和讀取公開列表。呼叫改變的一件事是您的請求使用情況。"
          },
          {
            "icon": "lock",
            "title": "不將憑證寫入設定檔",
            "description": "登入後，您的設定僅儲存端點 URL。如果您使用 API 金鑰，請將其儲存在環境變數中，而不是共用檔案中。"
          },
          {
            "icon": "shield",
            "title": "隨時撤銷存取權限",
            "description": "已登入的用戶端列在儀表板 → API 中，您可以在其中撤銷它們。產生新的 API 金鑰會立即停用舊金鑰。"
          }
        ]
      },
      "billing": {
        "kicker": "定價",
        "title": {
          "lead": "包含在你的 ",
          "accent": "API 方案",
          "tail": "中"
        },
        "lead": "MCP 伺服器與採集器 API 和評論 API 的每月請求配額相同。每個成功的工具呼叫都算是一個請求。",
        "compare": "比較 API 方案",
        "head": {
          "plan": "方案",
          "requests": "每月請求",
          "scale": "（對數刻度）",
          "price": "價格"
        }
      },
      "faq": {
        "title": {
          "lead": "MCP 服務器常見",
          "accent": "問題",
          "tail": ""
        },
        "items": [
          {
            "question": "MapsGrab MCP 伺服器是什麼？",
            "answer": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。 search_places / list_reviews / list_photos."
          },
          {
            "question": "哪些客戶端可以連線？",
            "answer": "任何支援 Streamable HTTP 的 MCP 客戶端：Claude Code、Cursor、VS Code、Codex、MCP Inspector 等。完全按照所示使用端點 URL，包括尾斜線。"
          },
          {
            "question": "它是如何認證的？",
            "answer": "使用 OAuth 登入時，Claude Code、Cursor、VS Code、Codex 及其他支援 MCP 授權的用戶端會在瀏覽器中開啟 MapsGrab；你核准用戶端後，隨時可在控制台 → API 撤銷授權。只有在用戶端無法登入時，才需要將 API 金鑰作為 bearer token 放入 Authorization 標頭。"
          },
          {
            "question": "工具呼叫是如何計數的？",
            "answer": "每次成功呼叫計為一次請求，包括照片的部分交付，與照片張數無關。無法交付有效照片時傳回錯誤，不扣額度。搜尋、評論、照片與 MCP 共用每月請求額度。"
          },
          {
            "question": "我的 AI 代理程式可以取得商家照片嗎？",
            "answer": "list_photos(fid, max_results): 透過商家的 fid 取得公開照片 URL，以 JSON 傳回。max_results 限制本次交付數量；結果為部分交付，不保證完整相簿。 本次照片交付上限，正整數，預設 200；不保證取得該數量。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "為智能體提供",
          "accent": "實時地圖數據",
          "tail": ""
        },
        "lead": "透過一個 MCP 連線搜尋 Google Maps 地點、讀取評論並取得公開商家照片 URL。"
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "免費工具",
        "guide": {
          "kicker": "關於這個工具",
          "title": {
            "lead": "工具用途與",
            "accent": "使用方法",
            "tail": ""
          },
          "lead": "一切都在您的瀏覽器中運行 - 您貼上或上傳的任何內容都不會離開您的裝置。"
        },
        "related": {
          "kicker": "相關工具",
          "title": {
            "lead": "更多",
            "accent": "地圖數據",
            "tail": "免費工具"
          },
          "lead": "完全在瀏覽器中運行的小型實用程式 - 您貼上的內容永遠不會離開您的裝置。電子郵件檢查器例外：它會將電子郵件地址傳送到我們的伺服器進行驗證。"
        },
        "faq": {
          "kicker": "常見問題",
          "lead": "簡短的答案。除此之外，只需一封電子郵件即可獲得支援。",
          "contact": "聯繫支援人員"
        },
        "cta": {
          "kicker": "大量擷取",
          "primary": "安裝 MapsGrab",
          "secondary": "查看定價",
          "note": "包括免費的每月配額。沒有信用卡。"
        },
        "resultHeading": "結果",
        "copy": "複製",
        "copied": "複製到剪貼簿。",
        "downloadCsv": "下載 CSV",
        "genericError": "出了點問題。檢查您的輸入並重試。"
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID 查找器 — 從 URL 取得 Google Maps Place ID | MapsGrab",
          "description": "貼上 Google Maps 位置 URL 並立即取得其 Place ID、CID 和 FID。基於瀏覽器的免費 Place ID 查找器 — 無需登錄，您的 URL 永遠不會離開您的裝置。"
        },
        "hero": {
          "title": {
            "lead": "地點 ID ",
            "accent": "查詢器",
            "tail": ""
          },
          "description": "貼上完整的 Google Maps 位置 URL 並一鍵讀出其 Place ID、CID 和 FID。所有內容都在您的瀏覽器中解碼 - URL 永遠不會上傳。"
        },
        "form": {
          "urlLabel": "Google Maps 地點 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "尋找 Place ID",
          "errorShortLink": "不支援短連結 (maps.app.goo.gl)。在瀏覽器中開啟連結並貼上網址列中的完整 URL。",
          "errorInvalidUrl": "這看起來不像 Google Maps 地方 URL。在 Google Maps 中開啟一個地點並複製完整的 URL （它應包含「/maps/place/」和「@」或「data=」）。",
          "errorNoIds": "在此 URL 中找不到地點識別碼。確保您複製的是地點頁面的 URL，而不是搜尋結果頁面。",
          "examplesLabel": "嘗試",
          "examples": {
            "city": "舊金山",
            "business": "咖啡店·波特蘭",
            "shortLink": "短連結"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "FID 兩半中的 base64url",
          "cidNote": "FID 2nd 一半，十六進位 → 十進位",
          "fidNote": "URL 中的最後兩個 0x... 段",
          "anatomy": {
            "fidHigh": "FID · 前半段",
            "fidLow": "FID · 後半段",
            "empty": "貼上一個地方 URL — 它攜帶的識別碼在這裡亮起。"
          },
          "missing": "不在這個連結裡",
          "copyLabel": "複製 {label}",
          "privacy": "在您的瀏覽器中解碼 - URL 永遠不會上傳。"
        },
        "chips": [
          {
            "label": "Google API 金鑰",
            "value": "不需要"
          },
          {
            "label": "您的 URL",
            "value": "從未上傳過"
          }
        ],
        "steps": {
          "head": {
            "kicker": "它是如何運作的",
            "title": {
              "lead": "將地圖鏈接轉換為 ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "沒有 API 金鑰，也沒有登入 - 識別碼已經位於您複製的 URL 位置內。"
          },
          "items": [
            {
              "heading": "在 Google Maps 開設地點",
              "body": "搜尋該商家並點擊其列表，以便開啟地點頁面。"
            },
            {
              "heading": "複製完整的 URL",
              "body": "從網址列複製長 URL — 它包含公司名稱、「@」座標段和「data=」參數。"
            },
            {
              "heading": "貼上並解碼",
              "body": "將其貼到上面並按下「尋找 Place ID」。出現 Place ID、CID 和 FID，每個都有複製按鈕。"
            }
          ],
          "copiedBadge": "已複製",
          "note": "像maps.app.goo.gl這樣的短連結如果不跨網域追蹤就無法解碼，因此請先開啟連結並貼上完整位址。"
        },
        "identifiers": {
          "head": {
            "kicker": "識別符",
            "title": {
              "lead": "三種 ID，",
              "accent": "同一個地點",
              "tail": ""
            },
            "lead": "Place ID 是 Google 的位置穩定識別碼 - 以「ChIJ」開頭的字串，即使企業重新命名或搬遷，該字串仍然有效。"
          },
          "keys": {
            "placeId": "地點 API、評論小部件和預訂系統使用的「ChIJ…」字串。",
            "fid": "內部標識相同功能的一對十六進位值。",
            "cid": "FID 後半部的十進位形式，由舊版地圖 URLs 和廣告工具使用。"
          },
          "derive": {
            "label": "Place ID 和 CID 如何從 FID 匯出",
            "source": "FID 來自 URL",
            "protobuf": "protobuf · 小端",
            "base64": "base64url",
            "secondHalf": "後半段",
            "hexToDecimal": "十六進位 → 十進位"
          },
          "features": [
            {
              "heading": "不需要 API 金鑰",
              "body": "Place ID 已編碼在您貼上的 URL 位置內，因此該工具可以離線解碼它。"
            },
            {
              "heading": "無速率限制",
              "body": "不涉及查找服務 - 從地圖 URL 到 Place ID 的轉換是確定性的。"
            },
            {
              "heading": "從未上傳過",
              "body": "整個計算在您的瀏覽器標籤中運行 - 您貼上的 URL 永遠不會發送到任何伺服器。"
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "地點 ID 常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "Place ID 會改變嗎？",
              "answer": "很少。 Google 將地點 ID 記錄為穩定的長期標識符，但當地點合併或重組時，少量 ID 可能會被廢棄。如果 Place ID 的使用者報告其無效，請再次尋找該位置並刷新儲存的值。"
            },
            {
              "question": "Place ID 與 CID 相同嗎？",
              "answer": "不會。 CID 是舊版地圖連結和廣告工具使用的十進位標識符，而 Place ID 是地點 API 使用的「ChIJ…」字串。它們標識相同的功能，但不可互換，這就是該工具報告兩者的原因。"
            },
            {
              "question": "為什麼我的maps.app.goo.gl 連結被拒絕？",
              "answer": "短連結僅在跨網域重定向後解析為完整位置 URL，僅瀏覽器工具無法在不將連結傳送給第三方的情況下追蹤該連結。在瀏覽器中開啟短鏈接，然後貼上網址列中顯示的完整 URL。"
            },
            {
              "question": "我需要 Google API 金鑰嗎？",
              "answer": "不會。 Place ID 已編碼在您貼上的 URL 位置內，因此該工具可以離線解碼它。只有當您隨後想要使用 ID 呼叫地點 API 時，才需要 Google API 金鑰。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "需要",
            "accent": "批量",
            "tail": "獲取地點 ID？"
          },
          "lead": "MapsGrab 會採集每家商家的 Place ID、CID 與 FID，以及另外 33 個資料欄位，並直接匯出為 CSV 或 JSON。"
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google 評論連結產生器 — 免費直接評論 URL | MapsGrab",
          "description": "將 Google Maps 地點 URL 轉換為可與客戶共享的直接 Google 評論連結。免費，基於瀏覽器，無需上傳任何內容。"
        },
        "hero": {
          "title": {
            "lead": "Google 評論鏈接",
            "accent": "生成器",
            "tail": ""
          },
          "description": "貼上 Google Maps 地點 URL 並取得該企業的直接「撰寫評論」連結 - 從滿意的客戶到 Google 評論的最短路徑。"
        },
        "form": {
          "urlLabel": "Google Maps 地點 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "產生評論鏈接",
          "errorShortLink": "不支援短連結 (maps.app.goo.gl)。在瀏覽器中開啟連結並貼上網址列中的完整 URL。",
          "errorInvalidUrl": "這看起來不像 Google Maps 地方 URL。在 Google Maps 中開啟一個地點並複製完整的 URL （它應包含「/maps/place/」和「@」或「data=」）。",
          "errorNoIds": "在此 URL 中找不到地點識別碼。確保您複製的是地點頁面的 URL，而不是搜尋結果頁面。"
        },
        "result": {
          "linkLabel": "評論連結",
          "open": "打開"
        },
        "howTo": [
          {
            "heading": "什麼是 Google 評論連結？",
            "body": "評論連結是一種快捷方式，可開啟 Google 上某一特定商家的評論對話方塊。您無需要求客戶搜尋您的商家，捲動到評論部分，然後按“撰寫評論”，而是向他們發送一條 URL — search.google.com/local/reviews?placeid=… — 直接出現在評論表單上。企業將這些連結放在後續電子郵件、櫃檯二維碼以及交易後簡訊中。"
          },
          {
            "heading": "如何產生評論鏈接",
            "body": "開啟 Google Maps，找到您的商家，然後開啟其地點頁面。從網址列複製長URL並將其貼到上面。按“生成評論鏈接”，該工具會建立帶有編碼的地點 ID 的直接鏈接，可供複製或打開。該連結是通用的：它適用於桌面瀏覽器和 Google Maps 行動應用程式。"
          },
          {
            "heading": "地點 ID 的來源",
            "body": "此工具重複使用與 Place ID Finder 相同的本機解碼：識別碼已存在於地圖 URL 中，並且到「ChIJ…」形式的轉換完全發生在您的瀏覽器中。如果您管理多個地點，請對每個地點重複此過程，或讓 MapsGrab 在每次匯出中攜帶 Place ID 列，以便可以從電子表格大量產生評論連結。"
          }
        ],
        "faq": {
          "title": {
            "lead": "評論鏈接常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "評論連結會過期嗎？",
              "answer": "不會。此連結與該位置的地點 ID 綁定，該位置 ID Google 保持穩定。只要 Google Maps 上存在該地點，連結就會不斷開啟其評論對話方塊。"
            },
            {
              "question": "我可以使用一個連結訪問多個位置嗎？",
              "answer": "每個評論連結都屬於一個地方。每個位置產生一個單獨的連結 - 多位置企業通常會保留一個位置 ID 表並從中匯出連結。"
            },
            {
              "question": "是否允許透過連結請求評論？",
              "answer": "詢問顧客誠實的評價是可以的；激勵或過濾評論則不然。 Google 的政策禁止對評論和評論門進行補償——向每個客戶發送相同的鏈接，讓反饋說明一切。"
            },
            {
              "question": "為什麼我的連結會打開搜尋頁面而不是評論表單？",
              "answer": "當連結中的地點 ID 錯誤時就會發生這種情況 - 通常是手動編輯 URL 的結果。從原始地圖地點 URL 重新產生鏈接，並驗證 Place ID 以“ChIJ”開頭。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "追蹤你",
            "accent": "獲得",
            "tail": "的每一條評論"
          },
          "lead": "MapsGrab 提取任何商家頁面的評論（評級、文字、日期和所有者回應），以便您可以查看回饋並更快地回答。"
        }
      },
      "emailChecker": {
        "seo": {
          "title": "電子郵件檢查器 — 免費驗證電子郵件地址能否收信 | MapsGrab",
          "description": "檢查電子郵件地址能否正常收信。這款免費電子郵件檢查器會向郵件伺服器確認，並列出狀態、可投遞性、MX 記錄與帳號類型。"
        },
        "hero": {
          "title": {
            "lead": "電子郵件",
            "accent": "檢查器",
            "tail": ""
          },
          "description": "輸入電子郵件地址，我們會向它的郵件伺服器確認能否真正收信，並列出狀態、MX 記錄、帳號類型與評分。"
        },
        "guideLead": "格式檢查在瀏覽器中完成；電子郵件地址本身會傳送到我們的伺服器，再向其郵件伺服器確認。",
        "form": {
          "emailLabel": "電子郵件",
          "emailPlaceholder": "name@example.com",
          "submit": "驗證電子郵件",
          "submitting": "驗證中…",
          "verifyingHint": "正在向郵件伺服器確認，最長可能需要一分鐘。",
          "invalidHeading": "該電子郵件地址有問題：",
          "issues": {
            "empty": "首先輸入電子郵件地址。",
            "multipleAt": "此位址包含多個“@”符號。",
            "missingAt": "此位址缺少分隔本地部分與網域的「@」。",
            "localEmpty": "「@」之前的部分是空的。",
            "localTooLong": "「@」之前的部分比電子郵件標準允許的 64 字元長。",
            "localInvalidChars": "「@」之前的部分包含電子郵件地址中不允許的字元（空格、引號或控製字元）。",
            "localDotPosition": "局部部分中的點不能是第一個、最後一個或連續出現兩次。",
            "domainEmpty": "「@」後面的部分是空的。",
            "domainNoTld": "網域沒有結尾 (TLD) — 新增「.com」或「.org」等內容。",
            "domainInvalidChars": "此域包含不允許的字元（空格、底線或符號）。",
            "domainLabelHyphen": "域標籤不能以連字符開頭或結尾。",
            "domainEmptyLabel": "此域包含一行中的兩個點或一個空段。",
            "domainTooLong": "此網域的長度超過了電子郵件標準允許的 253 字元。",
            "typoDomain": "該網域看起來像是流行郵件提供者的拼字錯誤。"
          }
        },
        "result": {
          "labels": {
            "status": "狀態",
            "deliverable": "可投遞",
            "mxRecords": "MX 記錄",
            "email": "電子郵件地址",
            "domain": "網域",
            "accountType": "帳號類型",
            "catchAll": "全收網域（catch-all）",
            "score": "評分"
          },
          "statuses": {
            "safe": "可安全寄送",
            "invalid": "無效",
            "disabled": "已停用",
            "disposable": "拋棄式信箱",
            "inbox_full": "收件匣已滿",
            "catch_all": "全收網域",
            "role_account": "角色信箱",
            "spamtrap": "垃圾郵件陷阱",
            "unknown": "未知"
          },
          "accountTypes": {
            "standard": "一般信箱",
            "role": "角色信箱",
            "disposable": "拋棄式信箱",
            "free": "免費信箱"
          },
          "yes": "是",
          "no": "否",
          "noMx": "未找到",
          "unavailable": "無法連線至驗證服務，請稍後再試。",
          "rateLimited": "今日免費驗證次數已用完，請明天再試。"
        },
        "howTo": [
          {
            "heading": "本工具驗證什麼",
            "body": "本工具向收件方郵件伺服器詢問該信箱是否存在、是否接收郵件——與寄件伺服器投遞前的確認相同，但不會真的寄出郵件。結果包括整體狀態、能否投遞、網域的 MX 記錄、帳號類型（一般信箱、info@ 或 sales@ 這類角色信箱、拋棄式信箱或免費信箱）、網域是否全收（catch-all），以及 0–100 的評分。"
          },
          {
            "heading": "如何檢查電子郵件地址",
            "body": "輸入或貼上一個電子郵件地址，然後按「驗證電子郵件」。格式問題會在瀏覽器中逐條列出，這類地址不會被傳送；疑似常見服務商網域的拼字錯誤（例如「gmial.com」）會提示，但不影響驗證。格式正確的地址會提交到我們的伺服器，由伺服器向郵件伺服器確認，通常只需幾秒，最長可能需要一分鐘。"
          },
          {
            "heading": "如何解讀結果",
            "body": "「可安全寄送」表示信箱存在且能接收郵件。「無效」與「已停用」的地址會退信，「垃圾郵件陷阱」絕不應寄送。全收網域會接受任何地址，因此無法確認信箱本身是否存在；角色信箱、拋棄式信箱與收件匣已滿的地址用於開發客戶都有風險。「未知」表示郵件伺服器沒有給出明確答覆，可稍後再試。MapsGrab 從每家商家的官方網站採集電子郵件，聯繫前可以用本工具快速抽查。"
          }
        ],
        "faq": {
          "title": {
            "lead": "電子郵件檢查常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "這個工具會檢查信箱是否真的存在嗎？",
              "answer": "會。除了格式，本工具還會向收件方郵件伺服器詢問是否接收寄往該地址的郵件，過程中不會寄出郵件。伺服器沒有給出明確答覆時（例如全收網域），結果會如實標示，而不是猜測。"
            },
            {
              "question": "可以檢查多少個電子郵件地址？",
              "answer": "每天最多免費檢查 5 個，一次一個。未通過格式檢查的地址不會被傳送，因此不佔用次數。"
            },
            {
              "question": "檢查通過後，郵件仍可能退信嗎？",
              "answer": "可能。信箱可能在檢查後被關閉或塞滿，有些伺服器也會先接收郵件、之後再退回。「可安全寄送」只表示檢查當下該地址能夠收信，並不代表一定有人閱讀。"
            },
            {
              "question": "為什麼「name@localhost」會被拒絕？",
              "answer": "檢查器要求網域包含公用頂級網域（TLD），因為缺少這類後綴的地址無法接收外部網際網路的郵件。這類地址會在瀏覽器中直接標示，不會傳送去驗證。"
            },
            {
              "question": "我輸入的電子郵件地址會如何處理？",
              "answer": "地址會傳送到我們的伺服器，再由我們使用的電子郵件驗證服務商向收件方郵件伺服器確認。整個過程不會寄任何郵件到該地址。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "採集值得",
            "accent": "驗證",
            "tail": "的電子郵件"
          },
          "lead": "MapsGrab 直接從每個企業自己的網站中尋找其提取的每個企業背後的電子郵件地址和社交資料。"
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "將經緯度轉換為 DMS — 十進制度數轉度分秒 | MapsGrab",
          "description": "立即將十進制緯度和經度轉換為度、分、秒 (DMS) 格式。基於瀏覽器的免費座標轉換器，無需上傳任何內容。"
        },
        "hero": {
          "title": {
            "lead": "將經緯度轉換為",
            "accent": "度分秒（DMS）",
            "tail": ""
          },
          "description": "輸入十進制緯度和經度，並以度、分、秒為單位讀取相同的座標——帶有半球字母，準備複製。"
        },
        "form": {
          "latitudeLabel": "緯度（十進制，-90 到 90）",
          "longitudeLabel": "經度（十進制，-180 到 180）",
          "placeholder": "37.774929",
          "submit": "轉換為 DMS",
          "errorLatitude": "緯度必須是 -90 和 90 之間的數字。",
          "errorLongitude": "經度必須是 -180 和 180 之間的數字。"
        },
        "result": {
          "dms": "座標為 DMS"
        },
        "howTo": [
          {
            "heading": "什麼是十進制度和 DMS？",
            "body": "地圖與試算表通常以十進制度數儲存座標，每個座標軸使用一個帶正負號的數字，例如 37.774929、-122.419416。測量、海圖與許多不動產文件則使用較早的六十進位表示法：度、分、秒加上半球字母，例如 37° 46' 29.74\" N、122° 25' 9.90\" W。兩者表示同一地點；DMS 只是將小數部分逐級拆分成更小的單位，其中一分等於 1/60 度，一秒等於 1/60 分。"
          },
          {
            "heading": "如何轉換",
            "body": "貼上十進制緯度和經度，然後按“轉換為 DMS”。負值映射到南半球和西半球，並報告為 S 和 W。秒以兩位小數顯示 - 大約一米的地面分辨率，比任何消費者 GPS 捕獲的精度都要高。將結果複製為文件的單行，或電子表格的單獨欄位。"
          },
          {
            "heading": "為什麼這對地圖資料工作很重要",
            "body": "在工具之間移動商家資料時，協調往返是一個日常摩擦點：Google Maps 匯出小數，而地籍和列印工作流程需要 DMS。 MapsGrab 使這種摩擦在規模上保持較低水平 - 每個提取的商家都已在匯出中攜帶其緯度和經度，並且可以使用此頁面使用的相同公式離線運行批量坐標轉換。"
          }
        ],
        "faq": {
          "title": {
            "lead": "坐標轉換常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "DMS 結果有多精確？",
              "answer": "角秒顯示至小數點後兩位。一角秒的緯度約為 30 公尺，因此兩位小數約可分辨 30 公分，遠高於原始 GPS 資料的精度。精度受輸入值限制，而非轉換本身。"
            },
            {
              "question": "這裡的 N、S、E、W 是什麼意思？",
              "answer": "它們取代了小數值的符號：正緯度為北緯 (N)，負緯度為南緯 (S)；正經度為東經 (E)，負經度為西經 (W)。此工具會自動從標誌中選取字母。"
            },
            {
              "question": "我可以在這裡將 DMS 轉換回十進位嗎？",
              "answer": "是的 — 使用本網站上的配套工具「將 DMS 轉換為 DD」。使用相同的實作來轉換兩種方式可以避免不同公式之間的捨入漂移。"
            },
            {
              "question": "我的座標數據上傳了嗎？",
              "answer": "不會。轉換在瀏覽器標籤中是簡單的算術；您輸入的任何內容都不會離開頁面。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "每家商家的坐標，均已",
            "accent": "採集",
            "tail": ""
          },
          "lead": "MapsGrab 將緯度和經度寫入其匯出的每一行 - 無需為您的下一個路線或區域項目手動找到座標。"
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "將 DMS 轉換為 DD — 度分秒轉十進制度數 | MapsGrab",
          "description": "立即將度、分、秒座標轉換為十進位。免費的基於瀏覽器的 DMS 到 DD 轉換器，無需上傳任何內容。"
        },
        "hero": {
          "title": {
            "lead": "將度分秒轉換為十進制度數",
            "accent": "（緯度、經度）",
            "tail": ""
          },
          "description": "輸入兩個軸的度、分和秒，並獲得乾淨的十進制度數 — Google Maps、電子表格和 MapsGrab 可以理解的格式。"
        },
        "form": {
          "latitudeHeading": "緯度（南北）",
          "longitudeHeading": "經度（東/西）",
          "degreesLabel": "度數",
          "minutesLabel": "角分",
          "secondsLabel": "角秒",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "轉換為十進制",
          "errorValues": "度數必須為零或正整數，分和秒必須介於 0 和 60 之間。"
        },
        "result": {
          "dd": "十進制座標"
        },
        "howTo": [
          {
            "heading": "為什麼將 DMS 轉換回十進制度？",
            "body": "度-分-秒是一種面向人類的表示法，但實際上每個面向機器的系統都需要十進制：Google Maps 搜尋、GIS 導入、電子表格距離公式和地理編碼管道。轉換是一個簡單的加權和 - 度加分除以 60 加上秒除以 3600 - 半球字母決定符號。"
          },
          {
            "heading": "如何轉換",
            "body": "填寫緯度和經度的度、分和秒，並選擇半球字母（N/S 和 E/W）。按“轉換為十進制”，該工具會將兩個軸輸出為帶符號的十進制數，小數點後六位，可解析為地面上的大約 11 厘米 — 對於任何商家場所使用來說都足夠了。將結果直接貼到 Google Maps 或電子表格中。"
          },
          {
            "heading": "保持座標數據一致",
            "body": "混合符號是導入後位置最終進入錯誤海洋的常見原因。確定一次十進制並在邊界處轉換所有內容可以保持管道的正常運作。 MapsGrab 已以十進制度匯出座標，因此使用擴充功能收集的資料會直接放入 GIS 和 BI 工具中，而無需任何轉換步驟。"
          }
        ],
        "faq": {
          "title": {
            "lead": "度分秒轉十進制度數常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "我需要多少位小數？",
              "answer": "小數點後六位大約解析為 11 公分－超出了消費者 GPS 的精確度。五個地方（約 1 公尺）足以作為商家地點；更少的小數故意模糊了這一點。"
            },
            {
              "question": "字段必須滿足什麼範圍？",
              "answer": "角分和角秒的範圍皆為 0 至小於 60。緯度度數上限為 90，經度為 180；若數值超出地球的座標範圍，轉換器會提示錯誤。"
            },
            {
              "question": "當我選擇S或W時我應該輸入負數嗎？",
              "answer": "不——半球字母已經編碼了符號。如果您同時輸入帶符號的值和衝突的字母，該工具會標記矛盾而不是猜測。"
            },
            {
              "question": "轉換是在伺服器上完成的嗎？",
              "answer": "不需要。該公式在您的瀏覽器中運行；您輸入的任何內容都不會傳輸到任何地方。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "批量",
            "tail": "處理坐標，省去手工操作"
          },
          "lead": "MapsGrab 匯出其收集的每個企業的十進位緯度和經度，位於地址、電話和 Place ID 欄位旁邊。"
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "批次關鍵字產生器 - 關鍵字 + 位置組合 | MapsGrab",
          "description": "批量生成關鍵字和位置組合，用於本地 SEO 和地圖抓取任務。貼上兩個列表，取得每個組合，下載為 CSV。自由的。"
        },
        "hero": {
          "title": {
            "lead": "批量關鍵字",
            "accent": "生成器",
            "tail": ""
          },
          "description": "貼上您的關鍵字和位置，並將每個「關鍵字 + 位置」組合作為可貼上清單或 CSV — 這是植入本地搜尋廣告系列的最快方式。"
        },
        "form": {
          "keywordsLabel": "關鍵字（每行一個）",
          "keywordsPlaceholder": "設計機構\n咖啡廳\n水管工",
          "locationsLabel": "地點（每行一個）",
          "locationsPlaceholder": "紐約\n芝加哥\n奧斯汀",
          "orderLabel": "組合順序",
          "keywordFirst": "關鍵字+位置（設計機構紐約）",
          "locationFirst": "地點+關鍵字（紐約設計機構）",
          "submit": "產生組合",
          "resultCount": "產生 {count} 組合。",
          "errorKeywords": "新增至少一個關鍵字。",
          "errorLocations": "增加至少一個位置。"
        },
        "howTo": [
          {
            "heading": "大量關鍵字產生的用途是什麼？",
            "body": "本地搜尋活動依賴組合：在您服務的每個城市、地區或社區中重複提供相同的服務。十個地點的十個關鍵字就是一百個搜尋字詞──「設計機構紐約」、「設計機構芝加哥」等等。手寫這些內容很容易出錯；從兩個清單生成它們只需幾秒鐘，並且保證不會遺漏任何內容。"
          },
          {
            "heading": "如何產生組合",
            "body": "將您的關鍵字貼到第一個方塊中（每行一個），並將您的位置貼到第二個方塊中。選擇是先出現關鍵字還是先出現位置，再按下「產生」。每個關鍵字都與每個位置配對，刪除了空白行和重複項，完整列表顯示在下面並帶有計數。將其直接複製到 Google 廣告關鍵字清單、Google 趨勢檢查或地圖抓取任務佇列。"
          },
          {
            "heading": "從關鍵字清單到收集的數據",
            "body": "經典的下一步是將每個組合作為 Google Maps 搜尋運行並收集結果。這個循環正是 MapsGrab 自動化的：擴充功能程序接受關鍵字列表作為批處理任務，逐一遍歷搜索，並匯出它找到的每個商家 - 因此您在此處生成的組合成為結構化行，無需手動複製。"
          }
        ],
        "faq": {
          "title": {
            "lead": "批量關鍵字常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "我可以產生多少種組合？",
              "answer": "您的瀏覽器可以容納多少個清單 - 該工具會將兩個清單相乘並在本地刪除重複項。一萬種組合即可；對於非常大的批次，CSV 下載比複製文字區域更實用。"
            },
            {
              "question": "重複項是否被刪除？",
              "answer": "是的。在配對之前，每個清單中的重複行都會被刪除，並且輸出會按照您選擇的順序僅包含每個關鍵字位置對一次。"
            },
            {
              "question": "我該使用哪種組合順序？",
              "answer": "兩種順序都符合真實搜尋行為。「水管工 奧斯汀」類似使用者在地圖中輸入的方式；「奧斯汀 水管工」則類似傳統 SEO 用語。同時產生兩種順序，可涵蓋不同的搜尋變體。"
            },
            {
              "question": "我可以使用市區或郵遞區號作為地點嗎？",
              "answer": "是的 - 任何有意義的地圖搜尋後綴都可以：地區、郵遞區號、都會區或完整的「城市、州」對。每個位置一條線。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "將關鍵字列表轉化為",
            "accent": "採集結果",
            "tail": ""
          },
          "lead": "MapsGrab 批次任務將每個關鍵字作為地圖搜尋運行，並匯出其背後的商家 — CSV 或 JSON，以及評論、照片和聯絡資訊補全。"
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "線上合併 CSV 檔案 — 免費合併多個 CSV 檔案 | MapsGrab",
          "description": "將多個 CSV 檔案線上合併為一個檔案。列標題透過 union 自動對齊 — 免費、私有且完全基於瀏覽器。"
        },
        "hero": {
          "title": {
            "lead": "",
            "accent": "線上",
            "tail": "合併 CSV 文件"
          },
          "description": "上傳兩個或多個 CSV 檔案並下載單一合併檔案。列按標題對齊 - 缺少的欄位留空。文件永遠不會離開您的瀏覽器。"
        },
        "form": {
          "filesLabel": "CSV 文件",
          "filesHint": "選擇至少兩個 .csv 檔案。若檔案第 2 列為譯名，請勾選該檔案以略過此列。合併後的 CSV 僅保留一列欄位名稱表頭。檔案會留在您的瀏覽器中。",
          "translationRow": "跳過 {name} 中的行 2（翻譯標籤）",
          "submit": "合併文件",
          "errorNoFiles": "選擇至少兩個 CSV 檔案進行合併。",
          "errorEmptyFile": "其中一個檔案為空或沒有標題行：{name}",
          "fileSummary": "{name} — {rows} 資料行",
          "resultSummary": "將 {files} 檔案合併為 {rows} 行 × {columns} 欄位。",
          "previewLabel": "合併 CSV 預覽"
        },
        "howTo": [
          {
            "heading": "合併在這裡做什麼？",
            "body": "合併將多個 CSV 匯出堆疊到一個表中：所有文件中的列按標題名稱對齊，每個資料行將其值保留在匹配的標題下。文件按照您選擇的順序從上到下組合，因此結果讀取為一個連續的資料集。僅存在於某些文件中的列保留在輸出中；沒有它們的文件中的行將得到空單元格－所有標題的聯合。"
          },
          {
            "heading": "如何合併 CSV 文件",
            "body": "選擇兩個或更多 .csv 檔案 - 例如地圖抓取工作流程的每週匯出。按下“合併文件”，該工具會解析瀏覽器中的每個文件，報告每個文件的行數，並建立合併表。將其作為單一 CSV 下載，可以在 Excel、Google 工作表或任何資料庫匯入中乾淨地開啟。"
          },
          {
            "heading": "專為多次運行資料收集而設計",
            "body": "典型的用例是附加運行：每個 MapsGrab 提取會話匯出其自己的 CSV，並且在重複資料刪除和清理之前合併將一周的會話合併到一個資料集中。解析器處理引用欄位、嵌入逗號和儲存格內的換行符 (RFC 4180)，因此具有多行位址的匯出或評論片段可以正確合併。"
          }
        ],
        "faq": {
          "title": {
            "lead": "CSV 合併常見",
            "accent": "問題",
            "tail": ""
          },
          "items": [
            {
              "question": "當文件具有不同的欄位時會發生什麼？",
              "answer": "合併的檔案包含所有標頭的並集（按照它們首次出現的順序排列）。文件中缺少列的行會在該列中獲得一個空白單元格。沒有任何內容被刪除或重新命名。"
            },
            {
              "question": "我的文件是否上傳到伺服器？",
              "answer": "不會。這些檔案是使用瀏覽器的 FileReader API 讀取的，並合併到選項卡的記憶體中。沒有傳輸任何內容，關閉頁面會清除所有內容。"
            },
            {
              "question": "合併會刪除重複的行嗎？",
              "answer": "否 - 合併是與對齊欄位的直接串聯。重複資料刪除（例如透過 Place ID）是合併檔案執行的單獨清理步驟。"
            },
            {
              "question": "文件可以有多大？",
              "answer": "限制是瀏覽器選項卡的內存，而不是固定數量。對於典型的商家資料匯出（數千到數十萬行），合併是即時的。對於非常大的文件，分批合併。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "每次運行一份匯出，或合併為",
            "accent": "一個數據集",
            "tail": ""
          },
          "lead": "MapsGrab 在每個會話中匯出乾淨的 CSV/JSON 並進行欄位選擇和 Place ID 重複資料刪除，因此多運行資料集幾乎已經開始合併。"
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "公司",
  "about": {
    "navLabel": "關於",
    "seoTitle": "關於 MapsGrab |產品與邊界",
    "seoDescription": "MapsGrab 是一個用於公共商家資料的地圖資料工具包：瀏覽器擴充功能、雲端線上抓取工具、API 和 MCP 伺服器以及免費的網路工具。了解資料邊界在哪裡。",
    "hero": {
      "eyebrow": "關於 MapsGrab",
      "title": {
        "lead": "",
        "accent": "直接",
        "tail": "採集地圖數據"
      },
      "intro": "MapsGrab 提供從 Google Maps 採集公開商家資訊並整理為清晰結構化資料的工具：適用於 Edge 與 Firefox 的瀏覽器擴充功能、雲端線上採集器、API 與 MCP 伺服器，以及免費網頁工具，其中大多數完全在瀏覽器中執行。",
      "contactLabel": "聯繫支援人員",
      "extensionLabel": "探索擴充功能",
      "stageLabel": "搶先體驗",
      "updatedLabel": "發布並審核",
      "updatedAt": "八月 31, 2026",
      "chips": [
        {
          "label": "採集範圍",
          "value": "僅公開數據"
        },
        {
          "label": "擴充功能採集結果",
          "value": "在您的瀏覽器中"
        },
        {
          "label": "匯出",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "拖曳旋轉"
    },
    "build": {
      "kicker": "我們建造什麼",
      "title": {
        "lead": "一套工具，",
        "accent": "四種",
        "tail": "使用方式"
      },
      "lead": "選擇瀏覽器擴充功能、基於雲端的 線上採集器 或 API。此擴充功能可以在您自己的瀏覽器中運作； 線上採集器 和 API 共用一個雲端引擎，而 MCP 伺服器將 API 提供給 AI 代理程式。",
      "hub": {
        "title": "MapsGrab 資料工具包",
        "detail": "商家數據·評論·照片·電子郵件與社群資訊補全"
      },
      "tags": {
        "extension": [
          "36-欄位擷取",
          "評論和照片",
          "大量任務"
        ],
        "online": [
          "批量關鍵字",
          "聯絡資料補全",
          "每個任務一個 37 欄位 CSV"
        ],
        "api": [
          "商家數據",
          "評論",
          "結構化 JSON"
        ],
        "mcp": [
          "三個工具",
          "Streamable HTTP",
          "OAuth 或 API 金鑰"
        ]
      },
      "toolsLead": "加上免費的網路工具。",
      "toolsText": "網站上的免費網路工具可以處理小型工作——地點 ID、評論連結、座標轉換、CSV 合併——無需安裝任何東西。",
      "toolsLabel": "免費網路工具"
    },
    "principles": {
      "kicker": "原則",
      "title": {
        "lead": "",
        "accent": "邊界",
        "tail": "在哪裡"
      },
      "lead": "MapsGrab 對資料故意保守。這些是我們堅持的產品規則。",
      "publicData": {
        "title": "僅公開數據",
        "text": "僅公開可用的商家資訊——該頁面的任何訪客都可以看到的資訊。",
        "visibleTag": "對任何訪客可見",
        "privateTag": "私人帳戶"
      },
      "localFirst": {
        "title": "本地優先",
        "text": "借助擴充功能和免費網路工具，您的設定和結果將保存在您的瀏覽器中，而不是保存在我們的伺服器上。電子郵件檢查器例外：它會將您輸入的地址傳送到我們的伺服器，由電子郵件驗證服務商確認，過程中不會寄出任何郵件。 線上採集器、API 和 MCP 伺服器在我們的雲端中運行，線上採集器 結果將保存到您的帳戶中。",
        "storage": "本地儲存",
        "rows": [
          "設定",
          "結果",
          "大量任務"
        ]
      },
      "backend": {
        "title": "擴充與免費工具：四個後端作業",
        "text": "對於擴充功能和免費網路工具，我們的後端處理四件事：遠端配置、帳戶和配額狀態、可選的電子郵件／社群資訊補全以及最少的使用日誌。唯一的例外是電子郵件檢查器：後端還會將您輸入的地址交給電子郵件驗證服務商確認，過程中不會寄出任何郵件。",
        "chips": [
          "配置",
          "配額",
          "聯絡資訊補全",
          "使用日誌"
        ]
      },
      "never": {
        "title": "沒有廣告。沒有追蹤器。沒有數據銷售。",
        "text": "擴充功能中沒有廣告、沒有第三方追蹤器，也沒有出售或出租資料。",
        "chips": [
          "廣告",
          "第三方追蹤器",
          "銷售數據"
        ]
      },
      "inWriting": {
        "kicker": "書面形式",
        "title": "隱私權政策和條款",
        "text": "每條規則均在隱私權政策和服務條款中詳細說明。",
        "link": "閱讀隱私權政策"
      }
    },
    "dataFlow": {
      "kicker": "數據如何移動",
      "title": {
        "lead": "哪些數據留在你這裡，哪些會",
        "accent": "傳給我們",
        "tail": ""
      },
      "lead": "該擴充功能適用於公開顯示的資料並將結果保留在您的瀏覽器中。對於擴充和免費網路工具，我們的後端僅提供配置、配額、可選資訊補全和最小使用日誌的功能。電子郵件檢查器例外：它會將您輸入的地址傳送到我們的伺服器，由電子郵件驗證服務商確認，過程中不會寄出任何郵件。 線上採集器、API 和 MCP 伺服器在我們的雲端中運行，並且 線上採集器 結果將保存到您的帳戶中。",
      "source": {
        "label": "來源",
        "title": "您造訪的 Google Maps 個頁面",
        "text": "公共商家資料 — 名稱、地址、電話、網站、評級、評論、照片。"
      },
      "browser": {
        "label": "您的瀏覽器·本地優先",
        "storage": "本機儲存 · IndexedDB",
        "rows": [
          "設定",
          "擷取結果",
          "批次任務狀態"
        ],
        "badge": "儲存在您的瀏覽器中"
      },
      "backend": {
        "label": "MapsGrab 後端·四個用途",
        "lanes": [
          {
            "title": "遠端配置",
            "text": "保持提取工作的頁面結構預設"
          },
          {
            "title": "帳戶及額度",
            "text": "登入、方案狀態、每月使用統計"
          },
          {
            "title": "電子郵件與社群資訊補全",
            "text": "使用該功能時公開列出的聯絡人"
          },
          {
            "title": "使用記錄",
            "text": "功能使用和錯誤的最少記錄"
          }
        ]
      },
      "never": {
        "label": "絕不",
        "items": [
          "無廣告",
          "擴充功能中沒有第三方追蹤器",
          "不得出售或出租個人數據",
          "除了您從中提取的 Google Maps 頁面之外，不會收集您的瀏覽記錄"
        ]
      },
      "note": "網站使用 Google Analytics 4 來測量聚合頁面使用情況 - 擴充本身不包含任何分析。",
      "noteLink": "閱讀隱私權政策"
    },
    "status": {
      "kicker": "產品狀態",
      "title": {
        "lead": "搶先體驗，",
        "accent": "免費",
        "tail": "開始"
      },
      "access": {
        "title": "搶先體驗",
        "text": "該產品處於搶先體驗階段。 Edge 附加元件和 Firefox 附加元件的商店清單正在最終確定。",
        "link": "安裝指南"
      },
      "quota": {
        "title": "每月免費額度",
        "text": "此擴充功能無需帳戶即可在每月免費配額內運行。",
        "link": "包含什麼"
      },
      "paid": {
        "title": "大量使用的付費方案",
        "text": "付費方案提高了頻繁使用的限制。請參閱目前層級的定價頁面。",
        "link": "查看定價"
      }
    }
  },
  "contact": {
    "navLabel": "聯絡我們",
    "seoTitle": "聯絡 MapsGrab 支持",
    "seoDescription": "有關帳戶、瀏覽器擴充功能、計費、工具或隱私請求的信息，請聯絡 MapsGrab。",
    "eyebrow": "聯絡方式 MapsGrab",
    "title": {
      "lead": "聯繫",
      "accent": "真人",
      "tail": "支持"
    },
    "intro": "寫信給我們，就會有人閱讀。目前，支援由建構 MapsGrab 的團隊直接處理。",
    "emailCardLabel": "支援電子郵件",
    "copyEmail": "複製 {email}",
    "emailLabel": "電子郵件支援",
    "emailSubject": "MapsGrab 支援請求",
    "responseTimes": "我們會在一個工作天內回覆支援電子郵件，通常會更快。當我們需要先驗證帳戶所有權時，隱私權請求可能需要幾天的時間。",
    "include": {
      "title": "包括什麼",
      "text": "準確的報告可以幫助我們識別受影響的工作流程，而無需詢問敏感的帳戶資訊。",
      "items": [
        "頁面 URL 和您嘗試的操作",
        "您的瀏覽器名稱和版本",
        "確切的錯誤訊息和有用的螢幕截圖",
        "用於解決帳單問題的訂單編號，不含支付卡詳細信息"
      ]
    },
    "topics": {
      "title": "我們可以提供什麼幫助",
      "items": [
        "瀏覽器擴充功能的安裝和設定",
        "帳戶存取和登入問題",
        "配額、訂閱、續訂和付款問題",
        "Web 工具問題和功能請求",
        "隱私和帳戶資料請求"
      ]
    },
    "aboutLabel": "關於",
    "privacyLabel": "隱私權政策",
    "termsLabel": "服務條款"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "首頁",
    "crumbLegal": "法律資訊",
    "switchLabel": "法律文件",
    "readTime": "閱讀約需 {minutes} 分鐘",
    "sectionCount": "{count} 部分",
    "tocTitle": "在此頁面上",
    "tocLabel": "{title} 部分",
    "glanceKicker": "一目了然",
    "glanceNote": "全文摘要如下。",
    "anchorLabel": "將連結複製到“{title}”",
    "copyEmail": "複製 {email}",
    "contactSupport": "聯繫支援人員",
    "nextLabel": "下一個文檔"
  },
  "terms": {
    "navLabel": "條款",
    "seoTitle": "服務條款 | MapsGrab",
    "seoDescription": "MapsGrab 服務條款：可接受的使用、使用者對收集的資料的責任、購買、免責聲明、如何聯絡我們。",
    "title": "服務條款",
    "intro": "本條款管轄您對 MapsGrab 的使用：瀏覽器擴充功能、本網站和免費網路工具。請在使用服務前閱讀它們。",
    "updatedLabel": "最後更新",
    "updatedAt": "八月 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "可接受的使用、使用者對收集的資料的責任、購買、免責聲明以及如何聯絡我們。",
    "helpTitle": "對這些條款有疑問嗎？",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "僅公開數據",
        "text": "本服務僅適用於您瀏覽的頁面上公開顯示的資訊。"
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "您的使用，您的責任",
        "text": "您可以在適用於您的法律範圍內決定要收集什麼以及如何使用它們。"
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "無需帳戶即可啟動",
        "text": "此擴充功能無需帳戶即可在每月免費配額內運行。"
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "隨時取消",
        "text": "訂閱續訂直至取消；取消將阻止未來的續訂。"
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "接受條款",
        "paragraphs": [
          "造訪或使用 MapsGrab 即表示您同意這些條款。如果您不同意它們，請不要安裝擴充功能或使用網站和工具。"
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "服務的作用",
        "paragraphs": [
          "MapsGrab 可協助您收集您造訪的 Google Maps 頁面上公開顯示的資訊（商家詳細資訊、評論、照片和相關聯絡資訊）並將其匯出。本服務由 Microsoft Edge 和 Firefox 的瀏覽器擴充功能、本網站以及在您的瀏覽器中執行的免費網路工具組成。"
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "公開數據",
        "paragraphs": [
          "本服務僅適用於您瀏覽的頁面上公開顯示的資訊。它不會存取私人帳戶、門控內容或需要超出任何訪客可見範圍的特殊存取權限的資料。"
        ]
      },
      {
        "id": "your-responsibility",
        "title": "你的責任",
        "paragraphs": [
          "您決定收集什麼以及如何使用它，並且您對該使用負責。當您使用收集到的資訊時，請遵守適用於您和您的目的的法律。",
          "特別是，您同意不會："
        ],
        "items": [
          "使用本服務進行任何非法活動或侵犯第三方權利。",
          "根據收集的商家資料重新識別個人或建立私人檔案。",
          "使用收集的聯絡方式來發送垃圾郵件或未經請求的大量訊息。",
          "未經與我們另行簽訂協議，將採集到的原始資料轉售為競爭性資料產品。",
          "幹擾、超載或試圖破壞服務或其使用的平台。"
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "帳戶和配額",
        "paragraphs": [
          "此擴充功能無需帳戶即可在每月免費配額內運行。一些功能——更高的限制、購買、雲端整合——需要一個帳戶。您有責任保證您的帳戶憑證的安全性以及您帳戶下發生的活動。"
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "購買和訂閱",
        "paragraphs": [
          "付費方案在定價頁面上進行了描述。價格、配額和計費週期會在您購買前顯示，並且購買是透過結帳時提供的付款提供者處理的。訂閱方案自動續訂直到取消，您可以隨時取消；取消將阻止未來的續訂。"
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "該服務按原樣提供",
        "paragraphs": [
          "該服務按“原樣”和“可用”提供。平台經常變化，收集功能可能隨時部分或全部停止運作。 MapsGrab 對所收集資料的不間斷可用性、完整性或特定用途的適用性不作任何明示或暗示的保證。",
          "我們可能會變更、暫停或終止服務的任何部分，我們可能會更新這些條款。當變更重大時，我們將在本網站上公佈。更改生效後繼續使用即表示您接受更新後的條款。"
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "責任限制",
        "paragraphs": [
          "在法律允許的最大範圍內，MapsGrab 及其運營商不對因您使用或無法使用服務而造成的間接、偶然、特殊或後果性損害（包括利潤或資料損失）承擔責任。"
        ]
      },
      {
        "id": "contact",
        "title": "聯絡我們",
        "paragraphs": [
          "有關這些條款的問題可以發送至 support@mapsgrab.com。"
        ]
      }
    ],
    "coverage": {
      "label": "覆蓋範圍說明",
      "badge": "待定",
      "lead": "尚未涵蓋：",
      "text": "線上 Scraper（雲端運行）、Scraper/評論/照片 API 和 MCP 伺服器。上面的文字描述了擴充功能、本網站和免費網路工具。"
    }
  },
  "privacy": {
    "navLabel": "隱私",
    "seoTitle": "隱私權政策 | MapsGrab",
    "seoDescription": "MapsGrab 隱私權政策：擴充功能和網站處理哪些資料、儲存在何處、我們的後端用途以及我們遵循的邊界。",
    "title": "隱私權政策",
    "intro": "本政策解釋了 MapsGrab 處理哪些資料、儲存在何處以及哪些資料到達我們的伺服器。簡短版本：該擴充功能適用於公開顯示的資料並將結果保留在您的瀏覽器中；除了我們的雲端服務之外，我們的後端僅支援配置、配額、可選資訊補全和最小使用日誌；我們在擴充功能中不運行廣告，也沒有第三方追蹤器。對我們的雲端服務（線上採集器、API 和 MCP 伺服器）的請求均在我們的伺服器上處理，並且 線上採集器 結果連結到您的帳戶，以便您下載它們。",
    "updatedLabel": "最後更新",
    "updatedAt": "十月 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "擴充功能和網站處理哪些資料、儲存在哪裡、我們的後端用於什麼以及我們遵循的邊界。",
    "helpTitle": "對這項政策有疑問嗎？",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "結果儲存位置",
        "text": "該擴充功能和免費網路工具將您的資料保存在瀏覽器中；線上抓取結果連結到您的帳戶。"
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "什麼到達我們的伺服器",
        "text": "對 線上採集器、API 和 MCP 伺服器的請求，以及設定、帳戶和配額、可選的資訊補全和最小使用日誌。"
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "沒有廣告，沒有追蹤器",
        "text": "擴充功能中沒有第三方追蹤器，也不會出售或出租個人資料。"
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "資料刪除",
        "text": "刪除擴充功能會刪除本機資料；傳送電子郵件給我們以刪除後端帳戶資料。"
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "擴充功能處理的資料",
        "paragraphs": [
          "此擴充處理以下類別的資料："
        ],
        "items": [
          "公共商家資料 — 當您使用擷取功能時，您造訪的 Google Maps 頁面上顯示的資訊（姓名、地址、電話、網站、評分、評論、照片等）。",
          "您的設定 - 您配置的首選項（匯出格式、欄位選擇、自動化開關、介面語言）。",
          "技術和互動資料 - 用於保持擴充功能針對 Google 頁面更改正常工作的最小使用事件（功能使用計數器、錯誤訊息）。",
          "我們發布的帳戶識別碼 - 匿名裝置標識符，以及您的帳戶電子郵件和方案或配額狀態（如果您登入）。"
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "資料儲存位置",
        "paragraphs": [
          "使用擴充程序，設定、擷取結果和批次任務狀態都儲存在瀏覽器本機（擴充程式本機儲存和 IndexedDB）。除非您觸發匯出或下面描述的可選整合之一，否則它們永遠不會離開您的裝置。免費網頁工具也會處理您在瀏覽器中輸入的內容。",
          "Google Drive 和 HubSpot OAuth 令牌（如果您連接它們）也僅儲存在您的瀏覽器中。",
          "線上抓取任務在我們的伺服器上運行。他們的結果儲存在您的帳戶中，因此您可以從儀表板下載它們。"
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "我們的後端處理什麼",
        "paragraphs": [
          "您向我們的雲端服務（線上採集器、API 和 MCP 伺服器）發出的請求將在我們的伺服器上處理。我們的伺服器還管理對這些服務的訪問，包括您批准的 API 金鑰和 MCP 用戶端授權，並保存您的使用記錄。",
          "您授權的 MCP 用戶端會收到其發出的請求的結果。您可以從儀表板撤銷授權。",
          "除了這些雲端服務之外，擴充功能和本網站還出於以下四個目的聯絡我們自己的伺服器："
        ],
        "items": [
          "遠端配置 - 頁面結構預設，可在 Google 變更其頁面時保持擷取工作。",
          "帳戶和配額服務 - 登入、方案狀態和每月使用統計。",
          "電子郵件與社群資訊補全－使用該功能時，在收集的商家網站上尋找公開列出的聯絡資訊。",
          "使用日誌記錄－用於維護和改進服務的功能使用情況和錯誤的最少記錄。"
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "可選 Google Drive 和 HubSpot 集成",
        "paragraphs": [
          "只有當您在設定中明確連接它們時，匯出的資料才會上傳到您自己的 Google Drive 或同步到您自己的 HubSpot 帳戶。這些整合使用您的授權，代表您行事，並且可以隨時從擴充功能設定或您的 Google / HubSpot 帳戶撤銷。"
        ]
      },
      {
        "id": "website-analytics",
        "title": "網站分析",
        "paragraphs": [
          "本網站使用 Google Analytics 4 (GA4) 來衡量總頁面使用量。 GA4 是我們使用的唯一第三方分析，它僅在該網站上運行 - 擴充功能本身不包含分析。"
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "我們從來不做的事",
        "paragraphs": [
          "這些邊界適用於擴充功能和網站："
        ],
        "items": [
          "沒有廣告。",
          "擴充功能中沒有第三方追蹤器。",
          "不得出售或出租個人資料。",
          "除了您從中提取的 Google Maps 頁面之外，不會收集您的瀏覽記錄。"
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "資料刪除",
        "paragraphs": [
          "刪除擴充功能會刪除所有本機儲存的資料。如果您希望刪除後端帳戶數據，請透過 support@mapsgrab.com 與我們聯繫，我們會將其刪除。"
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "本政策的變更",
        "paragraphs": [
          "當服務發生變化時，我們會更新此政策。上述日期反映的是最新版本，重大變更將在本網站上公佈。"
        ]
      },
      {
        "id": "contact",
        "title": "聯絡我們",
        "paragraphs": [
          "有關隱私的問題或請求可以發送至 support@mapsgrab.com。"
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "授權人工智慧應用 | MapsGrab",
  "title": "將 AI 應用程式連接到您的帳戶",
  "intro": "應用程式要求存取您的 MapsGrab 帳戶。僅當您自己啟動此連接時才允許它。",
  "loading": "正在載入連線請求...",
  "hostLabel": "應用程式位址",
  "selfDeclared": "應用程式給自己取的名字：{name}",
  "loopbackTitle": "本地應用程式",
  "loopbackText": "該應用程式在電腦上運行，因此其地址無法顯示是誰製作的。僅當您剛剛從您信任的應用程式啟動此連接時才允許它。",
  "loopbackHost": "這台電腦",
  "accountLabel": "登入身份",
  "switchAccount": "切換帳戶",
  "permissionsTitle": "如果您允許，此應用程式可以",
  "permissions": [
    "在 Google Maps 上搜尋企業並閱讀其評論和公開照片。",
    "使用您的 API 方案的每月請求額度。"
  ],
  "revokeNote": "您可以隨時在 API 管理中的已連線應用程式下中斷連線。",
  "approve": "允許",
  "deny": "拒絕並返回 {host}",
  "denyLoopback": "拒絕並返回應用程式",
  "redirecting": "返回應用程式...",
  "invalidTitle": "此連線請求無效或已過期",
  "invalidText": "返回您的 AI 應用程式並重新開始連線。",
  "errorTitle": "此連線請求無法完成",
  "errorReasons": {
    "rate_limited": "來自您的網路的連線嘗試次數過多。等待幾分鐘，然後再試一次。",
    "invalid_client": "該應用程式未註冊，或註冊不完整。",
    "invalid_redirect_uri": "應用程式發送的返回地址與其註冊的地址不符。",
    "unsupported_response_type": "該應用程式請求的授權類型不受支援。",
    "invalid_pkce": "應用程式未傳送所需的安全性檢查（PKCE 和 S256）。",
    "invalid_resource": "該應用程式未要求存取 MapsGrab MCP 伺服器，或請求其他伺服器。",
    "server_error": "MapsGrab 目前無法儲存此要求。請稍後重試。"
  },
  "errorHint": "從您的 AI 應用程式重新啟動連線。如果問題仍然存在，請聯絡應用程式的開發人員。",
  "signInTitle": "登入以繼續",
  "signInText": "登入您要連線的 MapsGrab 帳戶。此請求將等待您。",
  "signIn": "登入",
  "loadFailed": "無法載入連線請求。檢查您的網路並重試。",
  "decideFailed": "無法完成此操作。檢查您的網路並重試。",
  "retry": "再試一次"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "付款已提交",
      "description": "我們正在確認您的付款。原始選項卡將自動更新。"
    },
    "confirmedCredits": {
      "title": "點數已入帳",
      "description": "您的 ClinkBill 付款已確認，帳戶點數已新增。您可以返回原始選項卡。"
    },
    "confirmedSubscription": {
      "title": "方案已啟動",
      "description": "您的 ClinkBill 付款已確認，且您的 MapsGrab 計畫已生效。您可以返回原始選項卡。"
    },
    "failed": {
      "title": "付款需要注意",
      "description": "我們無法確認該訂單。返回原始選項卡並重試。"
    }
  },
  "cancel": {
    "title": "付款已取消",
    "description": "沒有完成付款。您可以返回並選擇其他付款方式。"
  }
}
