import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab 是一套地图数据工具：通过浏览器扩展程序和网页工具采集公开商家信息、生成评论链接、查询 Place ID 等。",
    "keywords": "地图数据、谷歌地图提取器、地点 ID 查找器、评论链接生成器、地图工具"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "主导航",
      "mobileLabel": "移动端导航",
      "extension": "扩展程序",
      "online": "在线采集",
      "api": "API",
      "apiScraper": "采集 API",
      "apiReviews": "评论 API",
      "apiPhotos": "照片 API",
      "apiMcp": "采集 MCP",
      "apiScraperDesc": "按关键词和地点获取商家数据，返回 JSON。",
      "apiReviewsDesc": "完整评论内容，包含评分与商家回复。",
      "apiPhotosDesc": "将公开相册整理为可直接使用的 URL 列表。",
      "apiMcpDesc": "为 Claude Code、Cursor 和 VS Code 提供实时地图数据。",
      "apiFootNote": "API 和 MCP 共用每月请求额度。",
      "apiPricing": "API 定价",
      "pricing": "定价",
      "freeTools": "免费工具",
      "signIn": "登录",
      "dashboard": "控制台"
    },
    "footer": {
      "legalLabel": "法律信息",
      "resources": "免费工具",
      "product": "产品",
      "rights": "© 2026 MapsGrab。保留所有权利。",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID 查找器",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "评论链接生成器",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "邮箱检查器",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "经纬度转度分秒",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "度分秒转十进制度",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "批量关键词生成器",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "在线合并 CSV 文件",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "立即安装",
    "comingSoon": "即将推出",
    "themeLabel": "配色主题",
    "themeLight": "浅色",
    "themeDark": "深色",
    "themeSystem": "跟随系统",
    "faqLabel": "常见问题",
    "breadcrumbLabel": "面包屑导航",
    "languageSwitcherLabel": "语言切换",
    "mobileMenuLabel": "展开或收起菜单",
    "copied": "已复制到剪贴板",
    "cancel": "取消",
    "continue": "继续"
  },
  "dashboard": {
    "create": {
      "title": "在线采集器",
      "newTask": "新建任务",
      "modeLabel": "搜索模式",
      "modes": {
        "keywords": "关键词",
        "map": "地图",
        "regions": "地区"
      },
      "keywords": "关键词",
      "regionsCta": "按地区生成查询",
      "placeholder": "波特兰的咖啡店\n奥斯汀的餐厅",
      "count": "{count} / {limit} 个关键词",
      "duplicates": "已忽略重复行：{count}",
      "contacts": "查找邮箱和社交账号",
      "contactsPaid": "付费在线采集套餐可用。",
      "usage": "本月已使用 {used} / {total} 条记录",
      "reset": "月度额度于每月 1 日（纽约时间）重置。",
      "loading": "正在加载任务限制…",
      "optionsFailed": "无法加载您的任务限制。请重试。",
      "submit": "开始采集",
      "submitting": "正在提交...",
      "submitted": "任务已提交",
      "failed": "任务提交失败。请先刷新历史记录，再重试。",
      "exhausted": "本月额度已用完。",
      "invalid": "最多输入 {limit} 个关键词，每个不超过 500 个字符。",
      "map": {
        "invalidKeyword": "请输入一个关键词，长度不超过 500 个字符。",
        "keyword": "关键词",
        "keywordPlaceholder": "例如：咖啡厅",
        "locationSearch": "搜索地点",
        "locate": "按区域定位",
        "locationPlaceholder": "选择国家 / 州 / 城市",
        "coordinates": "输入经纬度",
        "latitude": "纬度",
        "longitude": "经度",
        "radius": "半径（公里）",
        "spacing": "网格间距（公里）",
        "sampleCount": "{count} / {limit} 个搜索点",
        "points": "网格点：{points}",
        "overLimit": "请缩小半径或增大网格间距，将搜索点数量控制在 {limit} 个以内。",
        "chooseCenter": "选择区域或点击地图，设置搜索中心点。",
        "mapLabel": "在地图上选择搜索中心点",
        "tilesUnavailable": "地图加载失败。你仍可手动输入坐标。",
        "attribution": "OpenStreetMap 贡献者"
      },
      "region": {
        "baseKeywords": "基础关键词",
        "basePlaceholder": "咖啡厅\n餐厅",
        "country": "国家",
        "state": "州或地区",
        "citySearch": "查找城市",
        "cityPlaceholder": "可选：选择城市",
        "city": "城市",
        "selectCountry": "选择一个国家",
        "allStates": "所有州或地区",
        "loading": "正在加载地点…",
        "loadFailed": "无法加载地点。请重试。",
        "retry": "重试",
        "filter": "筛选",
        "selectAll": "全选（{count}）",
        "clear": "全不选",
        "selectedCount": "已选 {count} 项",
        "more": "显示前 {shown} 项，共 {total} 项。继续输入以缩小范围。",
        "selectedRegions": "已选地点",
        "remove": "删除{name}",
        "noMatch": "没有匹配项",
        "matchMode": "搜索措辞",
        "inMode": "位于",
        "nearMode": "附近",
        "generate": "生成查询",
        "needBase": "请先填写基础关键词。",
        "needCountry": "请先选择国家。",
        "willGenerate": "将生成 {count} 条查询。",
        "finalQueries": "最终查询",
        "finalPlaceholder": "生成的查询会显示在此处，你可以继续编辑。",
        "attribution": "位置数据：GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "控制台 | MapsGrab",
      "description": "在同一工作区管理 MapsGrab 的数据导出、API 访问和订阅。"
    },
    "shell": {
      "skipToContent": "跳到主要内容",
      "sideLabel": "工作区",
      "homeLabel": "MapsGrab 首页",
      "navLabel": "工作区菜单",
      "loading": "正在加载您的工作区...",
      "retry": "重试",
      "navOnline": "在线采集器",
      "navJobHistory": "历史记录",
      "navApi": "API 管理",
      "navSubscriptions": "订阅",
      "openMenu": "打开工作区菜单",
      "closeMenu": "关闭工作区菜单",
      "collapseSidebar": "收起侧栏",
      "expandSidebar": "展开侧栏",
      "back": "返回"
    },
    "account": {
      "menuButtonLabel": "打开账号菜单",
      "menuLabel": "账号菜单",
      "logout": "退出登录",
      "upgrade": "升级",
      "usageShort": "{used} / {total} 条记录",
      "planUnavailable": "不可用",
      "theme": "主题",
      "themeLight": "浅色",
      "themeDark": "深色",
      "themeSystem": "跟随系统",
      "language": "语言"
    },
    "history": {
      "title": "在线采集导出记录",
      "description": "你在在线采集器中运行的任务，按最新时间排序。",
      "refresh": "刷新",
      "autoRefresh": "自动刷新中",
      "loading": "正在加载导出记录…",
      "loadFailed": "无法加载导出历史记录。",
      "refreshFailed": "刷新失败，当前显示上次加载的结果。",
      "retry": "重试",
      "emptyTitle": "暂无导出记录",
      "emptyHint": "在在线采集器中运行任务后，任务会显示在这里。",
      "emptyCta": "前往在线采集器",
      "recentTitle": "最近任务",
      "viewAll": "查看全部",
      "recentEmptyHint": "在上方新建的任务会显示在这里。",
      "noMatchTitle": "没有匹配的任务",
      "noMatchHint": "换个任务号或关键词试试，或清除筛选条件。",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "另有 {count} 个",
      "columns": {
        "taskNo": "任务",
        "createdAt": "创建时间",
        "samples": "搜索次数",
        "records": "记录",
        "status": "状态"
      },
      "status": {
        "queued": "排队中",
        "collecting": "采集中",
        "publishing": "正在准备 CSV",
        "completed": "已完成",
        "partial": "部分成功",
        "failed": "失败"
      },
      "search": {
        "label": "搜索任务",
        "placeholder": "按任务号或关键词搜索",
        "clear": "清除搜索"
      },
      "filters": {
        "label": "筛选任务",
        "button": "筛选",
        "status": "状态",
        "all": "全部",
        "running": "进行中",
        "clear": "清除筛选"
      },
      "range": {
        "label": "时间范围",
        "last7": "最近 7 天",
        "last30": "最近 30 天",
        "all": "全部时间",
        "custom": "自定义范围",
        "from": "开始",
        "to": "结束",
        "apply": "应用",
        "invalid": "开始日期不能晚于结束日期。"
      },
      "pagination": {
        "label": "分页",
        "previous": "上一页",
        "next": "下一页",
        "page": "第 {page} 页",
        "pageSize": "每页行数",
        "summary": "第 {from}–{to} 条，共 {total} 条"
      },
      "detail": {
        "show": "详情",
        "loading": "正在加载搜索明细…",
        "loadFailed": "无法加载此任务的搜索明细。",
        "keyword": "关键词",
        "records": "记录",
        "runNo": "批次",
        "startedAt": "开始时间",
        "finishedAt": "结束时间",
        "contacts": "邮箱和社交账号",
        "contactsEnabled": "此任务已启用",
        "contactsDisabled": "此任务未启用",
        "completed": "已完成",
        "pending": "待处理",
        "viewport": "{lat}, {lng} · 缩放 {zoom}"
      },
      "copyJob": "复制任务号",
      "dedupeHint": "记录数按整个任务去重后计算。",
      "finished": "任务 {job}：{status}",
      "finishedRecords": "{count} 条记录",
      "downloadCsv": "下载 CSV",
      "downloadXlsx": "下载 Excel",
      "noFile": "无 CSV 文件",
      "errors": {
        "31301": "无法完成此次搜索的数据采集。",
        "31302": "部分结果不可用，已采集的记录会保留。",
        "31303": "采集服务繁忙，请重试。",
        "31304": "无法生成导出文件。"
      },
      "errorFailed": "无法完成此搜索。",
      "downloading": "正在准备...",
      "downloadUnavailable": "没有可下载的 CSV，文件可能已过期。",
      "downloadFailed": "无法开始下载。请再试一次。",
      "signInPrompt": "登录后查看在线采集的导出记录。",
      "signInCta": "登录",
      "unreachable": "暂时无法连接 MapsGrab。"
    },
    "api": {
      "description": "管理 API 密钥、每月请求额度及已连接的 AI 应用。",
      "docsLink": "查看 API 产品",
      "signInPrompt": "登录后管理 API 访问权限。",
      "loading": "正在加载 API 访问配置…",
      "loadFailed": "无法加载 API 访问配置，请重试。",
      "retry": "重试",
      "refresh": "刷新",
      "keyTitle": "API 密钥",
      "keyEmpty": "您尚未生成 API 密钥。",
      "generateKey": "生成 API 密钥",
      "rotateKey": "更换 API 密钥",
      "generatingKey": "正在生成…",
      "keyOnce": "请立即复制此密钥。离开或刷新页面后，将无法再次查看。",
      "keyCreated": "已创建",
      "rotateTitle": "要更换 API 密钥吗？",
      "rotateMessage": "当前密钥将立即失效。请为所有使用该密钥的应用更新为新密钥。",
      "cancel": "取消",
      "copyKey": "复制 API 密钥",
      "copied": "已复制",
      "copyFailed": "无法复制。选择文本并手动复制。",
      "keyFailed": "无法生成 API 密钥。请再试一次。",
      "usageTitle": "每月 API 使用量",
      "usageFailed": "无法加载 API 用量。请重试。",
      "usageValue": "{used} / {total} 次请求",
      "usagePeriod": "账期：{period}",
      "quotaExhausted": "本月请求额度已用完。",
      "quotaReset": "每月 1 日重置（美东时间）· API 与 MCP 共用",
      "planTitle": "API 套餐",
      "managePlan": "管理订阅",
      "connectionsTitle": "接入",
      "connectTabsLabel": "接入方式",
      "connectDocs": {
        "api": "API 文档",
        "mcp": "MCP 接入指南",
        "mcpKey": "API 密钥接入指南"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + API 密钥"
      },
      "apiUrl": "API 基础 URL",
      "mcpUrl": "MCP 服务器 URL",
      "mcpHint": "将此 URL 添加到 MCP 客户端。客户端打开本站后，请登录并批准连接。",
      "mcpKeyHint": "适用于无法打开浏览器登录的客户端。请求使用你的 API 密钥认证，无需批准连接。",
      "mcpConfigTitle": "客户端配置",
      "mcpConfigHint": "将此条目添加到 MCP 客户端配置中。不同客户端的字段名称略有差异。",
      "mcpUnavailable": "MCP 连接地址尚不可用。",
      "copyUrl": "复制 URL",
      "curlTitle": "快速上手",
      "curlHint": "请将占位符替换为完整的 API 密钥。",
      "grants": {
        "title": "已连接的应用",
        "description": "你已授权这些应用使用 API 额度搜索商家，并读取评论和公开照片。",
        "loading": "正在加载已连接的应用…",
        "empty": "尚未连接任何应用。",
        "loadFailed": "无法加载已连接的应用，请重试。",
        "selfDeclared": "应用自报名称：{name}",
        "createdLabel": "连接时间",
        "refreshedLabel": "上次刷新时间",
        "notRefreshed": "暂无",
        "revoke": "断开连接",
        "revokeTitle": "要断开此应用的连接吗？",
        "revokeMessage": "{host} 将立即失去访问权限，再次连接时需要你重新批准。",
        "revokeFailed": "无法断开此应用的连接，请重试。",
        "paginationLabel": "已连接应用分页",
        "pageOf": "第 {page} 页，共 {pages} 页"
      }
    },
    "subscriptions": {
      "title": "订阅",
      "description": "查看在线采集器、浏览器扩展程序和 API 的套餐及续费状态。购买或升级请前往定价页。",
      "lines": {
        "online": "在线采集器",
        "extension": "浏览器扩展程序",
        "api": "API"
      },
      "planLabel": "套餐",
      "expiresLabel": "续费／到期时间",
      "free": "免费版",
      "unavailable": "暂时不可用",
      "autoRenewOn": "自动续费已开启",
      "autoRenewOff": "自动续费已关闭",
      "paidVia": "支付方式：{method}",
      "subscribeCta": "选择套餐",
      "pricingLink": "查看价格",
      "manageSubscription": "管理订阅",
      "managingSubscription": "正在打开…",
      "manageFailed": "无法打开订阅管理。请重试。",
      "signInPrompt": "登录以查看您的订阅。"
    },
    "cancelGuide": {
      "title": "在支付服务商处管理订阅",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "登录 PayPal 并打开“设置”。",
            "转到“付款”，然后转到“自动付款”。",
            "选择 MapsGrab，然后选择取消。"
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "打开购买确认邮件中的客户门户链接。",
            "登录并选择您的 MapsGrab 订阅。",
            "选择取消。"
          ]
        }
      ],
      "closeLabel": "关闭"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — 采集 Google Maps 商家数据，导出 CSV 与 JSON",
        "description": "MapsGrab 提供浏览器扩展程序和网页工具，可从 Google Maps 采集公开的商家名称、电话、评论、照片和邮箱，并导出为 CSV 或 JSON。"
      },
      "hero": {
        "announce": {
          "badge": "新品",
          "text": "面向 AI 智能体的 MCP 服务器"
        },
        "title": {
          "firstLine": "获取 Google Maps 数据",
          "secondLine": "只需",
          "accent": "一键",
          "end": ""
        },
        "lead": "从 Google Maps 采集公开的商家名称、电话、网站、评论、照片和邮箱，几秒内即可导出整洁的 CSV 或 JSON。",
        "search": {
          "label": "搜索关键词",
          "typing": [
            "波特兰的咖啡店",
            "得克萨斯州奥斯汀的牙医",
            "芝加哥附近的水管工",
            "布鲁克林的瑜伽馆",
            "迈阿密海滩的酒店"
          ],
          "submit": "预览结果",
          "loading": "正在搜索…",
          "suggestLabel": "试试",
          "suggestions": [
            "波特兰的咖啡店",
            "得克萨斯州奥斯汀的牙医",
            "芝加哥附近的水管工"
          ]
        },
        "trust": [
          "无需信用卡",
          "每月 {records} 条免费记录",
          "导出 CSV 与 JSON"
        ],
        "dashboard": "打开在线采集器",
        "theater": {
          "panelLabel": "MapsGrab 面板预览",
          "extensionActive": "MapsGrab 浏览器扩展程序已启用",
          "mapFilters": [
            "营业中",
            "评价最高",
            "价格"
          ],
          "live": "实时",
          "done": "已完成",
          "start": "开始采集",
          "pause": "暂停",
          "extracting": "正在采集 {count} 条…",
          "finished": "已完成 · {count} 个地点",
          "kpis": {
            "phones": "电话",
            "emails": "电子邮件",
            "websites": "网站"
          },
          "export": "导出详细列表 - {count} (.CSV)",
          "exportSaved": "导出文件已保存",
          "emailFound": "已找到邮箱",
          "averageRating": "平均评分",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} 条评论"
        },
        "preview": {
          "title": "结果",
          "count": "首个结果页中有 {count} 家商家",
          "columns": {
            "name": "名称",
            "address": "地址",
            "category": "类别",
            "rating": "评分",
            "reviews": "评论",
            "phone": "电话"
          },
          "locked": "登录后，在在线采集器中提交关键词，即可采集并导出完整结果。",
          "signIn": "登录并启动完整任务",
          "failed": "无法加载预览。请再试一次。",
          "empty": "首个结果页中未找到商家。"
        }
      },
      "facts": {
        "caption": "用数字了解 MapsGrab",
        "items": [
          {
            "value": 36,
            "label": "每家商家的数据列数"
          },
          {
            "value": 11,
            "label": "评论字段，包含商家回复"
          },
          {
            "value": 6,
            "label": "每个网站可匹配的社交平台"
          },
          {
            "value": "freeRecords",
            "label": "每月免费记录"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "使用方式：扩展程序、在线采集、API，以及 MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "工作原理",
          "title": {
            "lead": "从地图搜索到",
            "accent": "电子表格",
            "tail": "，只需三步"
          },
          "lead": "无需编程或手动复制粘贴。MapsGrab 读取 Google Maps 上已公开展示的信息，并整理为结构化数据行。"
        },
        "steps": [
          {
            "title": "搜索 Google Maps",
            "body": "打开 Google Maps，像平常一样搜索商家类型和地点。"
          },
          {
            "title": "开始采集",
            "body": "点击{action}。MapsGrab 会滚动搜索结果、采集商家列表，并在启用后补全联系方式。",
            "action": "开始采集"
          },
          {
            "title": "导出后随处使用",
            "body": "按所选列下载 CSV 或 JSON；评论和照片分别保存为独立文件，可直接用于 Excel 或 CRM。"
          }
        ],
        "searchSample": "西雅图的面包店",
        "columnsUnit": "列",
        "reviewsFile": "评论"
      },
      "products": {
        "head": {
          "kicker": "产品",
          "title": {
            "lead": "三种方式，",
            "accent": "采集",
            "tail": "地图数据"
          },
          "lead": "选择浏览器扩展程序、云端在线采集器或 API。扩展程序在你的浏览器中运行，在线采集器与 API 则共用云端引擎。"
        },
        "cards": {
          "extension": {
            "badge": "浏览器扩展程序",
            "title": "浏览 Google Maps，随手采集数据",
            "body": "从你打开的地图页面采集商家数据、评论和照片，再全部导出到本地。支持 Edge、Firefox 和 Chromium。",
            "link": "了解扩展程序"
          },
          "online": {
            "badge": "在线采集器",
            "title": "云端运行，无需安装",
            "body": "粘贴关键词，在云端采集商家详情，每项任务导出一份去重后的 37 列 CSV。",
            "link": "了解在线采集器"
          },
          "api": {
            "badge": "API",
            "title": "通过 HTTP 获取整洁的 JSON",
            "body": "用一个 API 密钥，为自己的应用接入商家数据和评论。",
            "link": "了解 API"
          },
          "mcp": {
            "badge": "MCP 服务器",
            "title": "为 AI 智能体提供实时地图数据",
            "body": "通过 MCP 工具，让 Claude Code、Cursor、VS Code 和 Codex 搜索商家并读取评论。",
            "link": "了解 MCP 服务器"
          }
        },
        "extracting": "正在采集 {count} 条…",
        "queue": {
          "rows": "{count} 行",
          "processing": "处理中"
        },
        "chat": {
          "prompt": "查找奥斯汀评分不低于 4.5 且有网站的牙医",
          "answer": "找到 {count} 个匹配结果，前三个是："
        }
      },
      "fields": {
        "head": {
          "kicker": "数据",
          "title": {
            "lead": "36 列数据，",
            "accent": "每一列",
            "tail": "都有用"
          },
          "lead": "扩展程序从搜索结果和商家页面导出统一的数据结构，包含联系方式、地理位置、商家资料、评分，以及后续匹配记录所需的各类标识符。"
        },
        "filtersLabel": "字段分组",
        "all": "全部",
        "groups": {
          "contact": {
            "filter": "联系方式",
            "label": "联系方式"
          },
          "location": {
            "filter": "地点",
            "label": "地点"
          },
          "profile": {
            "filter": "商家资料",
            "label": "商家简介"
          },
          "reviews": {
            "filter": "评分",
            "label": "评分与评论"
          },
          "ids": {
            "filter": "ID 和链接",
            "label": "ID 和链接"
          }
        },
        "sampleLabel": "示例值",
        "emptySample": "（空）",
        "descriptions": {
          "Name": "与商家列表显示一致的商家名称。",
          "Description": "商家资料中的简短描述。",
          "Fulladdress": "完整、格式化的街道地址。",
          "Street": "地址中的街道信息。",
          "Municipality": "城市或地区。",
          "Categories": "商家所属的全部类别。",
          "About": "“关于”选项卡中的属性。",
          "Plus Code": "为 Open Location Code 保留的列，目前导出为空。",
          "Time Zone": "位置的 IANA 时区。",
          "Price": "商家列表显示的价格档次。",
          "Note": "商家备注或特色信息。",
          "Amenities": "便利设施和服务选项。",
          "Hotel Class": "住宿商家的星级。",
          "Phone": "商家列表显示的主要电话号码。",
          "Phones": "找到的该商家的全部电话号码。",
          "Claimed": "商家是否已认领此资料。",
          "Owner": "商家资料中的所有者名称。",
          "Owner Id": "商家账号的贡献者 ID。",
          "Owner Link": "商家所有者的贡献者页面链接。",
          "Email": "在商家网站找到的邮箱地址。",
          "Social Medias": "商家网站链接的社交账号。",
          "Review Count": "评论总数。",
          "Average Rating": "平均星级。",
          "Review URL": "直接打开评论面板的链接。",
          "Google Maps URL": "根据 CID 生成的稳定短链接。",
          "Google Knowledge URL": "知识面板搜索链接。",
          "Latitude": "纬度（以十进制度为单位）。",
          "Longitude": "以十进制度表示的经度。",
          "Website": "商家列表中的官方网站。",
          "Domain": "网站的可注册域名。",
          "Opening Hours": "每周营业时间，标明休息日。",
          "Featured Image": "商家列表封面照片的 URL。",
          "Cid": "客户 ID — FID 的十进制形式。",
          "Fid": "由两段十六进制数组成的 Feature ID。",
          "Place Id": "稳定的 Google Place ID。",
          "Kgmid": "知识图谱机器 ID。"
        },
        "reviews": {
          "title": "+ 11 列评论数据",
          "body": "评论单独导出，自动翻页采集，直至达到套餐上限。"
        },
        "photos": {
          "title": "+ 照片 URL 列表",
          "body": "每家商家的公开相册照片 URL，已过滤街景。"
        },
        "sampleCsv": "下载示例 CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "联系方式补全",
          "title": {
            "lead": "从地图标记，找到可以",
            "accent": "发邮件",
            "tail": "联系的人"
          },
          "lead": "启用联系方式补全后，MapsGrab 会在采集时检查每家商家的官方网站，补全可直接联系的渠道。"
        },
        "points": [
          "在商家网站找到的邮箱地址",
          "社交账号：Facebook、Instagram、LinkedIn、X、YouTube、TikTok",
          "付费在线采集套餐默认开启，扩展程序中可一键设置",
          "API 搜索时只需设置一个参数，即可在响应中获取联系方式，无需单独执行补全"
        ]
      },
      "developers": {
        "head": {
          "kicker": "面向开发者",
          "title": {
            "lead": "将地图数据接入你开发的",
            "accent": "任何应用",
            "tail": ""
          },
          "lead": "通过 HTTP API 和 MCP 服务器使用在线采集器的云端引擎。返回结构化 JSON，共用一个密钥，无需解析 HTML。"
        },
        "listLabel": "开发者产品",
        "items": {
          "search": {
            "title": "采集 API",
            "description": "按关键词和地点获取商家数据"
          },
          "reviews": {
            "title": "评论 API",
            "description": "评分、评论正文和商家回复"
          },
          "photos": {
            "title": "照片 API",
            "description": "每家商家的公开照片 URL"
          },
          "mcp": {
            "title": "MCP 服务器",
            "description": "适用于各类 MCP 客户端的搜索和评论工具"
          }
        },
        "langLabel": "语言",
        "copyLabel": "复制请求",
        "sending": "正在发送请求...",
        "response": "响应 · 200 OK · {ms} 毫秒",
        "toolCall": "工具调用 · {tool} · 200 OK",
        "exploreApi": "了解 API",
        "apiPricing": "API 定价",
        "worksWith": "可与您已使用的工具配合使用",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP 文件包"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "应用场景",
          "title": {
            "lead": "为搜索",
            "accent": "之后",
            "tail": "的工作而设计"
          }
        },
        "cards": [
          {
            "label": "潜在客户开发",
            "title": "本地潜在客户名单",
            "body": "搜索一个类别和一个城市，然后将整个结果页面（包括电话、网站和电子邮件）导出到一个电子表格中。"
          },
          {
            "label": "本地搜索引擎优化",
            "title": "竞品数据对比",
            "body": "一次采集某个地区所有竞品的评分与评论数，直接用导出数据生成报告。"
          },
          {
            "label": "市场调查",
            "title": "地理位置数据集",
            "body": "采集各分店或竞品门店的 Place ID 和坐标，直接用于地图和路线工具。"
          }
        ],
        "leadTags": [
          "电子邮件",
          "电话",
          "电子邮件",
          "网站"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "定价",
          "title": {
            "lead": "免费起步，有回报后再",
            "accent": "扩大规模",
            "tail": ""
          },
          "lead": "每款产品都有不限时的免费档位，只需升级你实际使用的产品。"
        },
        "lines": {
          "extension": {
            "title": "浏览器扩展程序",
            "billing": "每月",
            "link": "查看扩展程序套餐"
          },
          "online": {
            "title": "在线采集器",
            "billing": "一次性付款",
            "link": "查看在线采集套餐"
          },
          "api": {
            "title": "API & MCP",
            "billing": "一次性付款",
            "link": "查看 API 套餐"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "免费工具",
          "title": {
            "lead": "为地图",
            "accent": "进阶用户",
            "tail": "准备的实用小工具"
          },
          "lead": "七款完全在浏览器中运行的小工具，粘贴的内容不会离开你的设备。邮箱检查器例外：它会把邮箱地址发送到我们的服务器进行验证。"
        },
        "descriptions": {
          "place-id-finder": "粘贴 Google Maps 地点 URL，即可提取其中的 Place ID、CID 和 FID。",
          "review-link-generator": "获取任意商家的“撰写评论”直达链接。",
          "email-checker": "检查邮箱地址能否真正收信。",
          "lat-long-to-dms": "将十进制度坐标转换为度、角分和角秒。",
          "dms-to-dd": "将度分秒坐标转换为十进制度。",
          "bulk-keywords-generator": "生成“关键词 + 地点”的全部组合，直接复制使用。",
          "merge-csv": "按表头对齐，将多个 CSV 导出文件合并成一个文件。"
        },
        "more": "更多工具即将推出"
      },
      "faq": {
        "kicker": "常见问题",
        "title": {
          "lead": "常见",
          "accent": "问题",
          "tail": ""
        },
        "lead": "常见问题的简要解答。还有其他问题，欢迎邮件联系支持团队。",
        "contact": "联系支持团队",
        "items": [
          {
            "question": "MapsGrab 可以免费使用吗？",
            "answer": "可以。浏览器扩展程序无需账号即可使用，每月都有免费记录额度。需要更多额度时，可在定价页选购付费套餐。"
          },
          {
            "question": "支持哪些浏览器？",
            "answer": "请从扩展程序页面下载 MapsGrab。Chrome、Edge 和 Brave 可加载解压后的 ZIP；Firefox 使用单独的临时附加组件，重启后需要重新加载。页面提供安装和更新步骤。"
          },
          {
            "question": "数据来自哪里？采集是否合法？",
            "answer": "MapsGrab 只采集你访问的 Google Maps 页面上公开展示的信息，也就是任何访客都能看到的内容。我们不访问私人账号、受限内容或非公开数据。"
          },
          {
            "question": "使用网页工具需要安装软件吗？",
            "answer": "不需要。免费网页工具完全在浏览器中运行，输入的内容不会离开你的设备。邮箱检查器例外：它会把你输入的地址发送到我们的服务器，由邮箱验证服务商核实，过程中不会发送邮件。"
          },
          {
            "question": "我可以导出为哪些格式？",
            "answer": "可按所选字段导出 CSV 或 JSON，并按 Place ID 去重。"
          },
          {
            "question": "MapsGrab 能看到我采集的数据吗？",
            "answer": "设置和采集结果保存在浏览器本地。服务器只处理远程配置、账号与额度状态、可选的邮箱和社交账号补全，以及最少量的使用日志。"
          }
        ]
      },
      "cta": {
        "kicker": "开始使用",
        "title": {
          "lead": "几",
          "accent": "分钟",
          "tail": "即可开始采集"
        },
        "lead": "安装浏览器扩展程序，打开 Google Maps，搜索并导出第一份列表，无需账号。",
        "install": "免费安装 MapsGrab",
        "online": "试用在线采集器",
        "note": "含每月免费额度，无需信用卡。"
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab 浏览器扩展程序 — 在 Chrome、Edge 和 Firefox 中采集 Google Maps 数据",
        "description": "从 Google Maps 采集 36 列商家数据、评论和照片，补全邮箱与社交链接，运行批量任务，并导出为 CSV 或 JSON。"
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "下载适用于 Chrome、Edge 和 Firefox 的版本"
        },
        "title": {
          "lead": "在",
          "accent": "你的浏览器",
          "tail": "中采集 Google Maps 数据"
        },
        "lead": "打开 Google Maps 搜索结果或商家页面，即可采集其中公开展示的商家数据、评论、照片和联系方式，并直接在浏览器中导出为 CSV 或 JSON。",
        "downloadCta": "下载 Chrome 和 Edge 版本",
        "installCta": "安装指南",
        "meta": [
          "无需账号",
          "每月 1,000 条免费记录",
          "导出文件保留在本机"
        ],
        "theater": {
          "panelLabel": "MapsGrab 面板预览",
          "extensionActive": "MapsGrab 已在此页面启用",
          "dock": "停靠到左侧／右侧",
          "filters": [
            "营业中",
            "评价最高",
            "价格"
          ],
          "open": "打开",
          "closes": "{time} 打烊",
          "endOfList": "您已到达列表的末尾。",
          "start": "开始采集",
          "extracting": "正在采集 {count} 条…",
          "pause": "暂停",
          "complete": "采集完成。",
          "reset": "重置",
          "kpis": {
            "phones": "电话",
            "websites": "网站",
            "emails": "电子邮件"
          },
          "exportCta": "导出详细列表 - {count} (.CSV)",
          "saved": "已保存至“下载”文件夹",
          "scrollChip": {
            "label": "自动滚动",
            "value": "模拟人工节奏，5–10 秒"
          },
          "dedupeChip": {
            "label": "已去重",
            "value": "按 Place ID"
          }
        }
      },
      "facts": {
        "caption": "扩展程序概览",
        "items": [
          {
            "value": 36,
            "label": "每家商家的数据列，从名称到 Place ID"
          },
          {
            "value": 11,
            "label": "评论数据列，包含商家回复"
          },
          {
            "value": 6,
            "label": "每个网站可匹配的社交平台"
          },
          {
            "value": 1000,
            "label": "每月免费记录，无需账号"
          },
          {
            "value": 500,
            "label": "每项批量任务的关键词或评论 URL 上限"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "适用页面",
          "title": {
            "lead": "一个面板，适配每种",
            "accent": "地图视图",
            "tail": ""
          },
          "lead": "MapsGrab 面板直接显示在 Google Maps 页面上，为搜索结果、商家页面和已保存列表提供对应的采集模式，无需复制粘贴或来回切换标签页。"
        },
        "search": {
          "title": "搜索结果",
          "description": "在任意搜索结果中点击“开始采集”。MapsGrab 会按模拟人工操作的节奏滚动列表，采集逐条加载的商家信息。"
        },
        "place": {
          "title": "商家页面",
          "description": "在商家页面打开“评论和照片”标签页，即可自动翻页采集。评论导出为 11 列数据，照片导出为 URL 列表。",
          "tabs": [
            "概述",
            "评论和照片"
          ],
          "reviewsCta": "开始采集评论",
          "photosCta": "开始采集照片",
          "reviewsCount": "{count} 条评论",
          "photosCount": "{count} 张照片"
        },
        "saved": {
          "title": "已保存的列表",
          "description": "打开已保存的列表，点击一次“开始”，MapsGrab 就会依次打开各个地点并采集，无需逐项点击。",
          "listName": "收藏夹 · {count} 个地点"
        }
      },
      "features": {
        "head": {
          "kicker": "功能",
          "title": {
            "lead": "将地图页面展示的内容，整理成",
            "accent": "结构化数据",
            "tail": ""
          },
          "lead": "搜索结果和商家页面使用统一的数据结构；采集规则适配当前 Google Maps 界面，并在页面变化时远程更新。"
        },
        "tabsLabel": "扩展程序功能",
        "tabs": [
          {
            "id": "business",
            "title": "商家数据",
            "description": "随列表滚动采集每家商家的 36 列数据。"
          },
          {
            "id": "reviews",
            "title": "评论",
            "description": "自动翻页采集评论，包含商家回复。"
          },
          {
            "id": "photos",
            "title": "照片",
            "description": "将相册照片整理为可直接使用的 URL 列表。"
          },
          {
            "id": "enrichment",
            "title": "邮箱与社交账号补全",
            "description": "从官方网站获取直接联系渠道。"
          },
          {
            "id": "batch",
            "title": "批量任务",
            "description": "将关键词或评论 URL 加入队列，逐项采集。"
          },
          {
            "id": "export",
            "title": "数据导出",
            "description": "CSV 或 JSON 文件直接保存到本机。"
          }
        ],
        "business": {
          "claimed": "已认领",
          "fields": {
            "phone": "电话",
            "website": "网站",
            "rating": "平均评分",
            "hours": "营业时间",
            "timeZone": "时区",
            "coordinates": "坐标",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} 条评论",
          "columns": "每家商家 {count} 列数据",
          "reserved": "Plus Code 保留字段",
          "more": "另有 {count} 项"
        },
        "reviews": {
          "title": "评论",
          "columns": "{count} 列",
          "ownerReply": "商家回复",
          "loading": "正在加载下一页评论"
        },
        "photos": {
          "streetView": "街景 · 已过滤"
        },
        "enrichment": {
          "website": "官方网站",
          "moreNetworks": "同时检查 X、YouTube 和 TikTok"
        },
        "batch": {
          "complete": "已完成 {count} 项",
          "stuck": "{count} 项停滞",
          "total": "共 {count} 项",
          "done": "已完成 · {count}",
          "skipped": "90 秒无进展 · 已跳过",
          "running": "正在采集…",
          "queued": "排队中",
          "autoExport": "任务完成后自动导出"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} 行 · 已选 {selected} / {total} 列 · 按 Place ID 去重",
          "destinations": [
            {
              "title": "下载文件夹",
              "description": "由浏览器保存"
            },
            {
              "title": "选择导出列",
              "description": "仅导出您需要的列"
            },
            {
              "title": "自动下载",
              "description": "采集完成后立即保存"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "批量任务",
          "title": {
            "lead": "将列表加入队列，",
            "accent": "放心离开",
            "tail": ""
          },
          "lead": "每项任务最多粘贴 500 个关键词或评论 URL。MapsGrab 会逐项采集并实时显示进度，跳过停滞项，任务完成后自动导出。"
        },
        "checks": [
          "关键词任务会为每个关键词执行一次地图搜索",
          "评论 URL 任务会逐家商家采集评论",
          "任务状态保存在本地磁盘，浏览器重启后可继续",
          "最多保存 150 项任务，同一时间运行一项批量任务"
        ],
        "mock": {
          "tabs": [
            "批量关键词数据工具",
            "Google 评论批量采集器"
          ],
          "taskName": "任务名称",
          "taskPlaceholder": "例如：100 个关键词，设计机构",
          "keywords": "关键词 · 每行一个",
          "lineCount": "{count} / {limit}",
          "start": "开始采集",
          "columns": {
            "task": "任务名称",
            "status": "状态",
            "actions": "操作"
          },
          "running": "运行中",
          "complete": "已完成",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} 项停滞",
          "progressExported": "{done} / {total} · 已导出",
          "lines": {
            "run": "采集中…",
            "done": "已完成",
            "stuck": "停滞 · 已跳过"
          },
          "toast": "任务完成，已导出",
          "chip": {
            "label": "任务状态",
            "value": "已保存到磁盘"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "本地优先",
          "title": {
            "lead": "采集结果保留在",
            "accent": "你的浏览器",
            "tail": "中"
          },
          "lead": "设置与采集结果保存在本地。服务器只处理远程配置、账号与额度状态、可选的邮箱和社交账号补全，以及最少量的使用日志。"
        },
        "checks": [
          "导出文件在本机生成",
          "保存文件前，在本地完成列选择和 Place ID 去重",
          "Google Maps 页面变化后，通过远程配置更新面板，无需重新安装",
          "无法读取内容时，面板会显示错误提示"
        ],
        "diagram": {
          "browser": "您的浏览器",
          "servers": "MapsGrab 服务器",
          "nodes": {
            "mapsTab": "Google Maps 标签页",
            "panel": "MapsGrab 面板",
            "storage": "本地存储",
            "exports": "导出文件",
            "config": "远程配置",
            "quota": "账号与额度",
            "enrichment": "联系方式补全"
          },
          "flows": {
            "rows": "商家数据行",
            "rules": "规则",
            "usage": "使用量",
            "websites": "商家网站 → 邮箱和社交账号"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "安装",
          "title": {
            "lead": "安装 ",
            "accent": "MapsGrab",
            "tail": ""
          },
          "lead": "在此下载 ZIP，并按浏览器对应的步骤安装。Chrome、Edge 和 Brave 可加载解压后的文件夹；Firefox 使用单独的临时附加组件，重启后需要重新加载。点击图片可查看大图。"
        },
        "zip": {
          "title": "直接安装（发行版 ZIP）",
          "description": "选择适合浏览器的 ZIP，解压到需要保留的文件夹，再按下面的指南加载。更新时，下载新版 ZIP，替换该文件夹中的文件，然后重新加载扩展程序。",
          "button": "Chrome、Edge 和 Brave ZIP",
          "firefoxButton": "Firefox ZIP（临时附加组件）",
          "meta": "版本 {version} · 预发布"
        },
        "browserLabel": "浏览器",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome 和 Edge",
            "note": "Edge、Chrome、Brave 和其他 Chromium 浏览器",
            "steps": [
              {
                "title": "下载并解压",
                "description": [
                  "下载 ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  "。在 Windows 中右键点击 ZIP，选择“全部解压缩”；在 macOS 中双击 ZIP 即可。请保留解压后的文件夹。"
                ],
                "shot": "已在 Chrome 中下载 MapsGrab ZIP"
              },
              {
                "title": "打开扩展程序管理页",
                "description": [
                  "在 Chrome 中打开 ",
                  {
                    "code": "chrome://extensions"
                  },
                  "，在 Edge 中打开 ",
                  {
                    "code": "edge://extensions"
                  },
                  "，或在 Brave 中打开 ",
                  {
                    "code": "brave://extensions"
                  },
                  "。"
                ],
                "shot": "扩展程序管理页面"
              },
              {
                "title": "启用开发者模式",
                "description": [
                  "在扩展程序管理页开启“开发者模式”。Chrome 的开关位于右上角。"
                ],
                "shot": "已启用开发者模式，可见“加载已解压的扩展程序”按钮"
              },
              {
                "title": "加载解压后的文件夹",
                "description": [
                  "点击“加载已解压的扩展程序”，选择解压后的文件夹。MapsGrab 会出现在扩展程序列表中；打开 Google Maps 搜索页面即可使用。"
                ],
                "shot": "加载解压后的文件夹，MapsGrab 已出现在扩展程序列表中"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "临时附加组件，重启 Firefox 后需重新加载",
            "steps": [
              {
                "title": "下载并解压",
                "description": [
                  "下载 ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  "。在 Windows 中右键点击 ZIP，选择“全部解压缩”；在 macOS 中双击 ZIP 即可。请保留解压后的文件夹。"
                ],
                "shot": "已在 Firefox 中下载 MapsGrab Firefox ZIP"
              },
              {
                "title": "打开调试页面",
                "description": [
                  "打开 ",
                  {
                    "code": "about:debugging"
                  },
                  "，然后在左侧边栏中选择您的浏览器。"
                ],
                "shot": "Firefox 调试页面中的临时附加组件控件"
              },
              {
                "title": "加载附加组件",
                "description": [
                  "点击“临时载入附加组件…”，选择解压后文件夹中的 ",
                  {
                    "code": "manifest.json"
                  },
                  "。Firefox 重启时会卸载临时附加组件，请重复此步骤重新加载。"
                ],
                "shot": "MapsGrab 已作为 Firefox 临时扩展程序加载，后台脚本正在运行"
              }
            ]
          }
        ],
        "help": {
          "title": "安装遇到问题？",
          "description": "请发邮件告知浏览器名称和遇到的情况，我们会协助解决。",
          "cta": "联系支持团队"
        },
        "notes": {
          "kicker": "版本说明",
          "version": "0.1.0",
          "status": "预发布",
          "date": "2026 年 8 月",
          "items": [
            "MapsGrab 浏览器扩展程序首个预发布版本",
            "自动滚动 Google Maps 搜索结果，采集 36 列数据",
            "从商家页面采集评论和照片",
            "为每家商家补全邮箱和社交账号",
            "批量关键词和评论 URL 任务，任务状态保存在本地磁盘",
            "导出 CSV / JSON，支持选择字段及按 Place ID 去重",
            "专为 Microsoft Edge 和 Firefox 构建"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "扩展程序套餐",
          "title": {
            "lead": "一款扩展程序，三种",
            "accent": "套餐",
            "tail": ""
          },
          "lead": "扩展程序采集的每行商家、评论或照片数据均计为一条记录。所有套餐都包含评论、照片和批量任务；付费套餐可导出全部 36 列，包括邮箱与社交账号补全，并享有更多每月记录额度。"
        },
        "note": "每月用量于纽约时间每月 1 日重置，未用完的记录额度不结转。",
        "compare": "比较所有套餐"
      },
      "faq": {
        "kicker": "常见问题",
        "title": {
          "lead": "扩展程序常见",
          "accent": "问题",
          "tail": ""
        },
        "lead": "常见问题的简要解答。还有其他问题，欢迎邮件联系支持团队。",
        "contact": "联系支持团队",
        "items": [
          {
            "question": "扩展程序可以免费使用吗？",
            "answer": "可以。扩展程序无需账号即可使用，每月含 1,000 条免费记录。定价页的付费套餐支持全部 36 列数据、邮箱和社交账号补全，并提供更多每月记录额度。"
          },
          {
            "question": "支持哪些浏览器？",
            "answer": "Chrome、Edge、Brave 及其他 Chromium 浏览器可加载这里下载的 ZIP，先解压后安装。Firefox 提供单独的 ZIP 用于临时加载，每次重启浏览器后需重新加载。具体步骤请参阅上方安装指南。"
          },
          {
            "question": "我需要登录吗？",
            "answer": "不需要。基础采集功能无需账号即可使用。登录后按账号计算额度，未登录时按浏览器设备计算。使用购买套餐的账号登录，即可使用更高额度。"
          },
          {
            "question": "什么算作记录？",
            "answer": "扩展程序采集的每行数据均计为一条记录：搜索或已保存列表中的商家、一条评论，或一张照片。邮箱和社交账号补全不额外消耗记录额度。"
          },
          {
            "question": "当 Google Maps 发生变化时会发生什么？",
            "answer": "采集规则通过远程配置下发，无需重新安装扩展程序即可获得修复。无法读取页面时，面板会显示错误提示。"
          },
          {
            "question": "MapsGrab 能看到我采集的数据吗？",
            "answer": "设置和结果保存在浏览器本地。服务器只处理远程配置、账号与额度状态、可选的邮箱和社交账号补全，以及最少量的使用日志。"
          },
          {
            "question": "数据来自哪里？采集是否合法？",
            "answer": "MapsGrab 只采集你访问的 Google Maps 页面上公开展示的信息，也就是任何访客都能看到的内容。我们不访问私人账号、受限内容或非公开数据。"
          }
        ]
      },
      "cta": {
        "kicker": "开始使用",
        "title": {
          "lead": "",
          "accent": "今天",
          "tail": "就采集你的第一份列表"
        },
        "lead": "安装浏览器扩展程序，搜索 Google Maps，即可导出整洁的电子表格，无需账号。",
        "primary": "安装 MapsGrab",
        "secondary": "比较套餐",
        "note": "含每月免费额度，无需信用卡。"
      }
    },
    "account": {
      "auth": {
        "eyebrow": "网站访问",
        "title": "登录以同步您的积分",
        "trigger": "登录",
        "modalTitle": "登录以继续",
        "closeLabel": "关闭",
        "signedInAs": "登录身份",
        "continueWithGoogle": "使用 Google 继续",
        "googleLoading": "正在打开 Google...",
        "or": "或者",
        "emailLabel": "邮箱",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "使用邮箱继续",
        "sendCode": "发送验证码",
        "sendingCode": "正在发送...",
        "sendCodeSuccess": "验证码已发送。",
        "sendAgain": "再次发送",
        "codeLabel": "验证码",
        "codePlaceholder": "123456",
        "signIn": "登录",
        "termsNotice": "登录即表示您同意",
        "termsLink": "条款",
        "privacyLink": "隐私政策",
        "logout": "退出登录",
        "creditsLabel": "积分",
        "enterEmailFirst": "请先输入您的电子邮件地址。",
        "enterEmailAndCode": "请输入电子邮件和验证码。",
        "sendCodeFailed": "发送验证码失败。",
        "googleSignInFailed": "Google 登录失败。",
        "googleClientMissing": "Google 登录未配置。",
        "signInFailed": "登录失败。"
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "付款已取消",
        "canceledMessage": "此订单尚未付款。你可以关闭此标签页，回到原窗口重新选择付款方式。",
        "canceledMetaDescription": "您的 PayPal 付款已取消。",
        "waitingTitle": "付款已提交",
        "waitingMessage": "你可以返回原标签页。我们每 3 秒检查一次 PayPal 确认状态，结果会自动显示在这里。",
        "confirmedCreditsTitle": "积分已到账",
        "confirmedCreditsMessage": "PayPal 付款已确认，积分已到账。你可以关闭此标签页，返回原窗口继续操作。",
        "confirmedSubscriptionTitle": "订阅已激活",
        "confirmedSubscriptionMessage": "PayPal 付款已确认，MapsGrab 套餐已生效。你可以关闭此标签页，返回原窗口继续操作。",
        "failedTitle": "付款需要进一步处理",
        "failedMessage": "无法自动确认此订单。请返回原窗口，尝试刷新付款状态。"
      },
      "checkin": {
        "accountButtonLabel": "打开账号菜单",
        "accountMenuLabel": "账号菜单"
      },
      "creditPurchase": {
        "title": "获得更多积分",
        "description": "添加积分并继续使用此工作区中的付费功能。",
        "successTitle": "积分已到账",
        "successDescription": "您的余额已刷新。关闭该窗口并继续。",
        "packageEyebrow": "随用随付",
        "cardNote": "积分可用于网站付费功能，永久有效。",
        "creditsAmount": "{credits} 积分",
        "buyNow": "立即购买",
        "selectPackage": "选择",
        "paymentMethodLabel": "选择付款方式",
        "paymentTitle": "选择付款方式",
        "selectedPackageLabel": "已选套餐",
        "confirmPurchase": "继续付款",
        "backToProducts": "返回",
        "close": "关闭",
        "agreementText": "我同意购买条款、服务条款及隐私政策。",
        "loadingConfigs": "正在加载积分包...",
        "loadFailed": "无法加载积分包。请再试一次。",
        "noConfigs": "目前没有可用的积分包。请稍后重试。",
        "ready": "选择积分包。价格以美元显示。",
        "creatingOrder": "正在创建订单...",
        "pendingPayment": "请在新打开的标签页完成付款，我们会自动检查付款结果。",
        "pendingPaymentTitle": "等待付款",
        "cancelPayment": "取消付款",
        "supportMailPrefix": "报告问题： ",
        "success": "付款完成。积分现已可用。",
        "failed": "付款未完成。您可以重试或关闭此窗口。",
        "successCredits": "已到账 +{credits} 积分",
        "successBalance": "当前余额：{balance} 积分",
        "createFailed": "创建订单失败。请再试一次。",
        "invalidPaymentData": "付款链接无效。请稍后重试。",
        "priceUpdated": "价格已变更，请确认最新价格后重新购买。",
        "gatewayFailed": "付款入口暂时无法使用。请稍后重试。",
        "paymentCanceled": "付款被取消。选择付款方式并重试。",
        "pollFailed": "刷新付款状态失败。请再试一次。",
        "pollTimeout": "自动刷新超时。付款后使用刷新按钮。",
        "orderNotFound": "订单不再可用。创建新订单。",
        "orderExpired": "订单已过期。请再次购买。",
        "fulfillmentFailed": "已收到付款，但积分尚未到账。请稍后重试。",
        "authExpired": "登录已过期。重新登录以继续。",
        "popupBlocked": "您的浏览器阻止了新窗口。允许 MapsGrab 打开弹出窗口并重试。"
      }
    },
    "pricing": {
      "seo": {
        "title": "定价 — 在线采集、浏览器扩展程序和 API 套餐 | MapsGrab",
        "description": "MapsGrab 各产品套餐：在线采集器 $19 起，浏览器扩展程序 $39 起，API $15 起。每款产品均有免费档位；在线采集和 API 按自然月一次性付款，扩展程序按月订阅。"
      },
      "hero": {
        "kicker": "定价",
        "title": {
          "lead": "",
          "accent": "三种",
          "tail": "地图数据采集方式，对应多档套餐"
        },
        "lead": "选择适合工作流程的产品：云端在线采集器、浏览器扩展程序或 HTTP API，再选择每月额度，即可在此页面购买或升级。",
        "meta": [
          "每款产品均有免费档位",
          "使用 PayPal 支付",
          "补差价升级"
        ],
        "switchLabel": "产品线"
      },
      "popularLabel": "最受欢迎",
      "tabs": {
        "online": {
          "name": "在线采集器",
          "shortName": "在线采集",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "条记录",
          "eyebrow": "在线采集器套餐",
          "title": "云端采集，按记录计费",
          "description": "在云端运行 MapsGrab 引擎，每采集一行商家数据计为一条记录。付费套餐可选邮箱和社交账号补全，不额外消耗记录额度。",
          "billingChips": [
            "一次性付款",
            "涵盖一个自然月",
            "不自动续费"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免费版",
              "tagline": "小规模试用云端采集",
              "price": "$0",
              "periodLabel": "长期免费",
              "quota": "1,000 条记录/月",
              "features": [
                "采集商家数据，导出 37 列 CSV",
                "每项任务最多 2 个关键词",
                "地图和区域模式，支持按范围搜索",
                "付费套餐可用邮箱与社交账号补全",
                "每项任务导出一份去重后的 CSV"
              ],
              "ctaLabel": "免费开始",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "适合偶尔导出数据",
              "price": "$19",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "20,000 条记录/月",
              "features": [
                "包含免费版全部功能",
                "1 个月内可用 20,000 条记录",
                "一次性付款——无自动续订",
                "每项任务最多 5 个关键词",
                "邮箱和社交账号补全默认开启，也可关闭"
              ],
              "ctaLabel": "选择轻量版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "基础版",
              "tagline": "适合每周稳定采集潜在客户",
              "price": "$49",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "80,000 条记录/月",
              "features": [
                "包含轻量版全部功能",
                "1 个月内可用 80,000 条记录",
                "一次性付款——无自动续订",
                "每项任务最多 10 个关键词"
              ],
              "ctaLabel": "选择基础版",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "成长版",
              "tagline": "适合持续增长的潜在客户采集需求",
              "price": "$99",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "250,000 条记录/月",
              "features": [
                "包含基础版全部功能",
                "1 个月内可用 250,000 条记录",
                "一次性付款——无自动续订",
                "每项任务最多 20 个关键词"
              ],
              "ctaLabel": "选择成长版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "专业版",
              "tagline": "适合代理机构及数据需求量大的团队",
              "price": "$149",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "500,000 条记录/月",
              "features": [
                "包含成长版全部功能",
                "1 个月内可用 500,000 条记录",
                "一次性付款——无自动续订",
                "每项任务最多 50 个关键词"
              ],
              "ctaLabel": "选择专业版",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "一次性付款，权益覆盖一个自然月，本页套餐不自动续费。每采集一行 Google Maps 商家数据计为一条记录；用量于每月 1 日重置，未用完的额度不结转。",
          "compare": {
            "lead": "在线采集器套餐，云端采集，按记录计费。",
            "volume": "每月记录数",
            "groups": [
              {
                "label": "数据",
                "rows": [
                  {
                    "label": "采集商家数据，导出 37 列 CSV",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "邮箱与社交账号补全",
                    "cells": [
                      false,
                      "默认开启，可选择关闭",
                      "默认开启，可选择关闭",
                      "默认开启，可选择关闭",
                      "默认开启，可选择关闭"
                    ]
                  }
                ]
              },
              {
                "label": "工作流程",
                "rows": [
                  {
                    "label": "每项任务的关键词数",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "地图和区域模式",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "每项任务导出一份去重后的 CSV",
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
            "usageNotice": "适用于 MapsGrab 在线采集器的每月记录额度。",
            "successTitle": "套餐已生效",
            "successDescription": "一次性购买的 1 个月套餐已生效。在线采集器会在下次刷新额度时应用新套餐。"
          }
        },
        "extension": {
          "name": "扩展程序",
          "shortName": "扩展程序",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "条记录",
          "eyebrow": "扩展程序套餐",
          "title": "浏览器采集，按记录计费",
          "description": "扩展程序采集的每行商家、评论或照片数据均计为一条记录。所有套餐都支持评论、照片和批量任务；付费套餐可导出全部 36 列，包括邮箱和社交账号补全。",
          "billingChips": [
            "一次性付款",
            "可用 1 个月",
            "不自动续费"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免费版",
              "tagline": "小规模使用基础采集功能",
              "price": "$0",
              "periodLabel": "长期免费",
              "quota": "1,000 条记录/月",
              "features": [
                "商家数据采集",
                "评论（11 列）与照片 URL",
                "批量关键词和评论 URL 任务",
                "CSV / JSON 导出，支持选择字段"
              ],
              "ctaLabel": "安装扩展程序",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "适合自由职业者和不断增长的潜在客户采集需求",
              "price": "$39",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "100,000 条记录/月",
              "features": [
                "包含免费版全部功能",
                "每月 100,000 条记录",
                "完整采集 36 列商家数据",
                "邮箱与社交账号补全"
              ],
              "ctaLabel": "选择专业版",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "企业版",
              "tagline": "适合代理机构及数据需求量大的团队",
              "price": "$99",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "500,000 条记录/月",
              "features": [
                "包含专业版全部功能",
                "每月 500,000 条记录",
                "满足多市场批量任务需求",
                "沿用本地优先的数据导出流程"
              ],
              "ctaLabel": "选择企业版",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "扩展程序采集的每行数据均计为一条记录：搜索或已保存列表中的商家、一条评论，或一张照片。邮箱和社交账号补全不额外消耗记录额度。用量于每月 1 日重置，未用完的额度不结转。",
          "compare": {
            "lead": "扩展程序套餐，浏览器采集，按记录计费。",
            "volume": "每月记录数",
            "groups": [
              {
                "label": "数据",
                "rows": [
                  {
                    "label": "商家数据采集",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "完整采集 36 列商家数据",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "评论（11 列）与照片 URL",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "邮箱与社交账号补全",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "批量关键词和评论 URL 任务",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "数据导出",
                "rows": [
                  {
                    "label": "CSV / JSON 导出，支持选择字段",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "本地优先的数据导出流程",
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
            "usageNotice": "适用于 MapsGrab 浏览器扩展程序每月配额。",
            "successTitle": "套餐已生效",
            "successDescription": "一次性购买的 1 个月套餐已生效。扩展程序会在下次刷新额度时应用新套餐。"
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "{price} 起 · 一次性付款",
          "unit": "次请求",
          "eyebrow": "API 套餐",
          "title": "程序调用，按请求计费",
          "description": "通过简单的 HTTP API，在自己的应用中搜索 Google Maps 商家并读取评论。每次成功调用计为一次请求，包括返回空结果或部分数据的情况。",
          "billingChips": [
            "一次性付款",
            "涵盖一个自然月",
            "不自动续费"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "免费版",
              "tagline": "小规模评估 API",
              "price": "$0",
              "periodLabel": "长期免费",
              "quota": "每月 20 次请求",
              "features": [
                "按关键词和位置进行商家搜索",
                "评论接口，支持排序与分页",
                "JSON 响应",
                "API 密钥绑定你的账号",
                "社区支持"
              ],
              "ctaLabel": "免费开始",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "基础版",
              "tagline": "适合原型开发和轻量集成",
              "price": "$15",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "每月 1,000 次请求",
              "features": [
                "包含免费版全部功能",
                "1 个月内可用 1,000 次请求",
                "一次性付款——无自动续订",
                "JSON 响应"
              ],
              "ctaLabel": "选择基础版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "专业版",
              "tagline": "适合生产环境集成",
              "price": "$65",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "每月 5,000 次请求",
              "features": [
                "包含基础版全部功能",
                "1 个月内可用 5,000 次请求",
                "一次性付款——无自动续订",
                "JSON 响应"
              ],
              "ctaLabel": "选择专业版",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "企业版",
              "tagline": "适合基于 MapsGrab 数据开发的产品",
              "price": "$115",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "每月 10,000 次请求",
              "features": [
                "包含专业版全部功能",
                "1 个月内可用 10,000 次请求",
                "一次性付款——无自动续订",
                "JSON 响应"
              ],
              "ctaLabel": "选择企业版",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "规模版",
              "tagline": "适合高请求量的数据业务",
              "price": "$365",
              "periodLabel": "一次性付款 · 1 个月",
              "quota": "每月 50,000 次请求",
              "features": [
                "包含企业版全部功能",
                "1 个月内可用 50,000 次请求",
                "一次性付款——无自动续订",
                "JSON 响应"
              ],
              "ctaLabel": "选择规模版",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "一次性付款，权益覆盖一个自然月，本页套餐不自动续费。每次成功的 API 或 MCP 调用计为一次请求，包括空结果和部分结果；失败调用不计费。用量于每月 1 日重置，未用完的请求额度不结转。",
          "compare": {
            "lead": "API 套餐，程序调用，按请求计费。",
            "volume": "每月请求数",
            "groups": [
              {
                "label": "端点",
                "rows": [
                  {
                    "label": "按关键词和位置进行商家搜索",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "评论接口，支持排序与分页",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON 响应",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "MCP 服务器共用 API 密钥",
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
                "label": "访问方式",
                "rows": [
                  {
                    "label": "API 密钥绑定你的账号",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "社区支持",
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
            "usageNotice": "适用于 MapsGrab API 每月请求配额。",
            "successTitle": "套餐已生效",
            "successDescription": "一次性购买的 1 个月套餐已生效。API 会在下次请求时应用新额度。"
          }
        }
      },
      "plansSection": {
        "label": "套餐",
        "finder": {
          "label": "你每月需要多少{unit}？",
          "result": "{value} {unit}",
          "valueText": "每月 {value} {unit} — {plan}套餐",
          "fits": "适用套餐"
        }
      },
      "compare": {
        "kicker": "比较",
        "title": {
          "lead": "所有套餐，",
          "accent": "并排对比",
          "tail": ""
        },
        "plan": "套餐",
        "volumeGroup": "额度与计费",
        "billing": "计费",
        "included": "已包含",
        "notIncluded": "不包含",
        "allPlans": "所有套餐均包含"
      },
      "usage": {
        "head": {
          "kicker": "用量",
          "title": {
            "lead": "哪些操作计入你的",
            "accent": "额度",
            "tail": ""
          },
          "lead": "两种计量单位：扩展程序和在线采集器按记录数计量，API 按请求次数计量。额度均于每月 1 日重置。"
        },
        "records": {
          "meter": "本月已用记录数",
          "badge": "扩展程序 · 在线采集",
          "title": "1 条记录 = 1 行采集数据",
          "body": "每采集一行数据计为一条记录：在线采集器中的一行商家数据，或扩展程序中的一行商家、评论、照片数据。邮箱和社交账号补全不额外消耗记录额度。",
          "count": "+1 条记录",
          "attachments": [
            "电话及网站",
            "营业时间",
            "邮箱与社交账号"
          ]
        },
        "requests": {
          "meter": "本月已用请求数",
          "badge": "API · MCP",
          "title": "1 次请求 = 1 次成功调用",
          "body": "每次成功的 API 调用计为一次请求，包括返回空结果或部分数据的情况；失败调用不计入用量。MCP 工具调用共用此请求额度。",
          "counted": "调用成功 — 计入用量",
          "notCounted": "调用失败 — 不计入用量"
        },
        "reset": {
          "title": "每月 1 日重置",
          "body": "用量于每月 1 日重置，未用完的记录和请求额度不结转。",
          "limit": "套餐限额",
          "unused": "未用完额度 · 不结转",
          "flag": "重置"
        }
      },
      "billing": {
        "head": {
          "kicker": "计费",
          "title": {
            "lead": "计费清晰，",
            "accent": "没有意外收费",
            "tail": ""
          },
          "lead": "三个产品线的支付、续订和升级如何运作。"
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "通过 PayPal 支付任何套餐的费用。在 PayPal 上完成付款，然后返回此处激活您的套餐。"
          },
          "cadence": {
            "title": "一次性付款",
            "body": "每个付费套餐涵盖一个自然月。一次性支付，无自动收费；当您还需要一个月时再次购买。"
          },
          "upgrade": {
            "title": "补差价升级",
            "body": "通过当前支付服务商，将有效套餐补差价升级至符合条件的更高档位。到期日期和已用额度不变。"
          },
          "independent": {
            "title": "独立套餐",
            "body": "不同产品标签页的套餐相互独立。套餐到期后，账号自动恢复免费档位。"
          }
        }
      },
      "plans": {
        "loading": "正在加载付款选项...",
        "loadFailed": "无法加载付款选项。刷新页面重试。",
        "noChannels": "目前该套餐没有可用的付款方式。",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "付款未完成",
        "billingPeriodMonthly": "1 个月",
        "billingAutoRenew": "自动续订直至取消",
        "billingOneTime": "一次性付款"
      },
      "upgrade": {
        "currentPlan": "当前套餐",
        "button": "升级·{amount}",
        "title": "升级您的套餐",
        "confirm": "确认升级",
        "oneTime": "通过 {channel} 一次性支付差价，到期日期仍为 {date}。",
        "autoRenew": "差价将立即通过 {channel} 收取。您的到期日期仍为 {date}；未来的续订将使用新的套餐价格。",
        "pendingTitle": "正在等待升级结果",
        "pendingDescription": "支付服务商正在处理升级，确认前当前套餐仍有效。",
        "successTitle": "套餐已升级",
        "successDescription": "新额度已生效，到期日期仍为 {date}。",
        "quoteFailed": "无法加载您的升级价格。刷新页面重试。",
        "failed": "无法确认您的升级。刷新页面以检查您的套餐，然后重试。",
        "reasons": {
          "no_active_subscription": "您的套餐不再有效。刷新页面以选择套餐。",
          "not_higher_tier": "选择更高的级别进行升级，或者等到您的套餐到期后再更改级别。",
          "non_positive_diff": "当前套餐的剩余价值不低于目标档位，套餐到期后可更换档位。",
          "channel_unavailable": "您当前的付款方式无法进行升级。到期后您可以更改套餐。"
        }
      },
      "faq": {
        "kicker": "常见问题",
        "title": {
          "lead": "购买前的",
          "accent": "常见问题",
          "tail": ""
        },
        "lead": "付款与计费的常见问题。还有其他问题，欢迎邮件联系支持团队。",
        "contact": "联系支持团队",
        "items": [
          {
            "question": "什么算作记录？",
            "answer": "每采集一行数据计为一条记录，与免费套餐的计量单位一致。在线采集器按商家计数；扩展程序采集的每家商家、每条评论或每张照片各计一条记录。邮箱和社交账号补全不额外消耗记录额度。API 则按成功请求次数计量。"
          },
          {
            "question": "我需要付费套餐才能尝试 MapsGrab 吗？",
            "answer": "不需要。每款产品都有不限时的免费档位：在线采集器和扩展程序每月各有 1,000 条记录，API 每月有 20 次请求。在线采集和扩展程序免费档位不含邮箱与社交账号补全；付费在线采集套餐默认包含，也可按任务关闭。"
          },
          {
            "question": "配额如何应用到我的账户？",
            "answer": "登录后按账号计算额度；扩展程序未登录时按浏览器设备计算。请使用购买套餐的账号登录以使用更高额度，套餐到期后账号自动恢复免费档位。"
          },
          {
            "question": "我的套餐会自动续订吗？",
            "answer": "不会。所有套餐均通过 PayPal 一次性付款，权益覆盖一个自然月。套餐到期后恢复免费档位，需要继续使用付费套餐时可再次购买。"
          },
          {
            "question": "我可以在不同级别之间切换吗？",
            "answer": "可以通过 PayPal 补差价，将有效套餐升级到符合条件的更高档位，到期日期和已用额度不变。不同产品标签页的套餐相互独立。"
          }
        ]
      },
      "cta": {
        "kicker": "开始使用",
        "title": {
          "lead": "从",
          "accent": "免费档",
          "tail": "开始"
        },
        "lead": "每款产品都有不限时的免费档位：扩展程序和在线采集器每月各有 1,000 条记录，API 每月有 20 次请求。",
        "primary": "安装扩展程序",
        "secondary": "试用在线采集器",
        "note": "含每月免费额度，无需信用卡。"
      }
    },
    "extensionLogin": {
      "title": "浏览器扩展程序登录 | MapsGrab",
      "description": "登录 MapsGrab 网站账号，并连接到浏览器扩展程序。",
      "eyebrow": "浏览器扩展程序",
      "heading": "浏览器扩展程序登录",
      "checkingState": "检查中",
      "signInRequiredState": "需要登录",
      "confirmState": "确认账号",
      "errorState": "错误",
      "preparingTitle": "正在准备登录",
      "preparingText": "正在准备浏览器扩展程序登录。",
      "invalidParamsTitle": "登录链接无效",
      "invalidParamsText": "此登录链接缺少必要的安全参数，请从浏览器扩展程序重新发起登录。",
      "checkingSessionTitle": "正在检查登录状态",
      "checkingSessionText": "正在验证网站的当前登录状态。",
      "finishingGoogleTitle": "正在完成 Google 登录",
      "finishingGoogleText": "正在使用 Google 授权完成网站登录。",
      "signInRequiredTitle": "登录以继续",
      "signInRequiredText": "登录后，将网站账号连接到浏览器扩展程序。",
      "signInButtonLabel": "登录",
      "confirmTitle": "确认账号",
      "confirmText": "浏览器扩展程序请求使用以下账号登录。请仅在你刚刚从扩展程序中主动发起登录时继续。",
      "continueButtonLabel": "继续",
      "useAnotherAccountLabel": "使用其他账号",
      "issuingTitle": "正在完成登录",
      "issuingText": "正在为浏览器扩展程序签发一次性登录码。",
      "issueFailedTitle": "出了点问题",
      "retryButtonLabel": "重试",
      "verificationFailedPrefix": "网站令牌验证失败",
      "issueFailedPrefix": "浏览器扩展程序登录码请求失败",
      "googleSignInFailedPrefix": "Google 登录失败",
      "googleCompletionFailedPrefix": "Google 登录无法完成"
    },
    "online": {
      "seo": {
        "title": "Google Maps 在线采集器 — 在云端采集数据 | MapsGrab",
        "description": "在云端运行 Google Maps 关键词搜索，收集商家数据，每个任务下载一个 CSV。"
      },
      "hero": {
        "announce": {
          "badge": "3 种模式",
          "text": "关键词、地图范围或行政区域"
        },
        "title": {
          "lead": "",
          "accent": "云端",
          "tail": "采集 Google Maps 数据，无需安装"
        },
        "lead": "提交关键词，在云端采集商家详情，再从控制台为每项任务下载一份 CSV。",
        "primaryCta": "开始采集",
        "pricingCta": "查看定价",
        "meta": [
          "每月 1,000 条免费记录",
          "适用于任何浏览器",
          "每项任务导出一份去重后的 CSV"
        ],
        "theater": {
          "files": "1 份 CSV · 已保存至“下载”文件夹",
          "csv": "CSV",
          "processed": "已处理",
          "parallelChip": {
            "label": "关键词执行方式",
            "value": "并行"
          },
          "billingChip": {
            "label": "计费依据",
            "value": "已交付的行数"
          }
        }
      },
      "facts": {
        "caption": "在线采集器概览",
        "items": [
          {
            "value": 37,
            "label": "公开数据列，包含连续行号"
          },
          {
            "value": 6,
            "label": "付费套餐中的社交账号列"
          },
          {
            "value": 50,
            "label": "每项地图模式任务的搜索点数"
          },
          {
            "value": 60,
            "suffix": " 分钟",
            "label": "每项任务的采集时限"
          },
          {
            "value": 1000,
            "label": "每月免费记录"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "工作原理",
          "title": {
            "lead": "从快速预览，到",
            "accent": "完整导出",
            "tail": ""
          },
          "lead": "无需账号即可在首页预览一个关键词的结果。需要完整列表时，登录后在控制台中创建任务。"
        },
        "steps": [
          {
            "title": "在首页预览",
            "description": "无需账号，输入一个关键词即可查看首个结果页的商家数量和前 3 行数据。"
          },
          {
            "title": "登录",
            "description": "预览不会保存，也不消耗额度。登录后需重新提交关键词。"
          },
          {
            "title": "创建任务",
            "description": "在“控制台 › 在线采集器”中，每行输入一个关键词，也可通过地图范围或行政区域生成关键词列表。"
          },
          {
            "title": "关键词并行运行",
            "description": "查看排队中、采集中、准备 CSV 等状态，以及最终的完成、部分成功或失败结果。运行中的任务每 5 秒刷新一次。"
          },
          {
            "title": "下载",
            "description": "文件生成后，整项任务可下载为一份 CSV。部分成功时保留已采集的数据行，零结果任务不生成文件。"
          }
        ],
        "lock": "登录查看完整列表",
        "email": "you@company.com",
        "links": {
          "preview": "尝试主页预览",
          "dashboard": "打开控制台 › 在线采集器"
        }
      },
      "modes": {
        "head": {
          "kicker": "搜索模式",
          "title": {
            "lead": "三种方式，指定",
            "accent": "搜索地点",
            "tail": ""
          },
          "lead": "逐行输入关键词，对中心点周围的地图区域进行采样，或将国家/地区、州和城市转换为现成的查询。"
        },
        "tabsLabel": "搜索模式",
        "notes": {
          "keywords": "每行一个关键词，不超过您套餐的限制",
          "map": "围绕中心点对圆进行采样",
          "regions": "来自 GeoNames 的国家、州和城市"
        },
        "keywords": {
          "hint": "每行输入一个关键词，计数前会移除空行和重复项。整项任务生成一份去重后的 CSV。",
          "blank": "空行·跳过",
          "duplicate": "重复·跳过",
          "limitsTitle": "每项任务的关键词数",
          "limitsCaption": "按在线采集套餐",
          "limitsHint": "列表为空、超出套餐限制或本月额度耗尽时，“开始采集”按钮不可用。"
        },
        "map": {
          "formula": "{keywords} 个关键词 × {points} 个网格点",
          "scale": "{value}公里",
          "facts": [
            "从中心向外依次搜索各个点。",
            "圆形范围仅用于布置搜索中心点，返回结果不会按此范围裁剪。",
            "同一商家即使被不同关键词或搜索点找到，在任务中也只保留一条。"
          ]
        },
        "regions": {
          "hint": "您可以在提交之前编辑生成的查询。每一个都算作一个关键词。",
          "addCity": "添加城市"
        }
      },
      "results": {
        "head": {
          "kicker": "结果",
          "title": {
            "lead": "一个任务，",
            "accent": "一份 CSV",
            "tail": ""
          },
          "lead": "整项任务导出为一份包含 37 列公开数据的 CSV，行号连续，并对各次搜索的商家结果统一去重。"
        },
        "csvMeta": "1 份 CSV · {count} 行采集结果",
        "rows": "{count} 行",
        "searches": "各次搜索的采集行数",
        "notes": [
          "第 1 行是固定的英文列名，包含用于连续编号的 # 列。",
          "第 2 行按创建任务时的界面语言说明各列含义。",
          "零结果的已完成任务不生成文件；部分成功的任务会保留已采集的数据行。",
          "说明行不计入记录用量。"
        ],
        "language": "任务语言：简体中文",
        "rowLabel": "行",
        "legend": {
          "fields": "行 1 · 字段名称",
          "labels": "第 2 行 · 任务语言",
          "data": "第 3 行起 · 商家数据"
        },
        "more": "另有 {count} 列",
        "csvLabels": {
          "#": "行号",
          "Name": "商家名称",
          "Fulladdress": "完整地址",
          "Categories": "商家类别",
          "Phone": "主要电话",
          "Review Count": "评论数量",
          "Average Rating": "平均评论评分",
          "Website": "商家网站",
          "Emails": "商家网站公开的邮箱",
          "Search Keyword": "搜索关键词"
        }
      },
      "features": {
        "head": {
          "kicker": "能力",
          "title": {
            "lead": "在线采集器能",
            "accent": "做什么",
            "tail": ""
          },
          "lead": "在云端采集商家详情，付费套餐还可选择补全邮箱和社交账号。"
        },
        "items": [
          {
            "id": "keywords",
            "title": "关键词任务",
            "description": "将商家类型和地点作为单独的关键词提交。您的套餐决定了关键词限制和每月记录配额。",
            "meta": "每项任务 2 · 5 · 10 · 20 · 50 个关键词"
          },
          {
            "id": "history",
            "title": "任务历史记录",
            "description": "在控制台跟踪任务进度，查看每个关键词采集到的记录数。",
            "meta": "已完成 · 部分成功 · 失败"
          },
          {
            "id": "details",
            "title": "商家详情",
            "description": "采集商家名称、地址、电话号码、网站、评分、营业时间、坐标及可获取的地点标识符。",
            "meta": "每家商家 37 列公开数据"
          },
          {
            "id": "enrichment",
            "title": "邮箱和社交账号补全",
            "description": "付费在线采集套餐默认检查商家网站，补全邮箱和社交账号；可按任务关闭。",
            "meta": "付费套餐 · 默认开启"
          },
          {
            "id": "downloads",
            "title": "每项任务一份 CSV",
            "description": "文件生成后，整项任务可下载为一份 CSV，无需分别下载每次搜索的结果。",
            "meta": "{job}.csv · 37 列"
          },
          {
            "id": "browser",
            "title": "无需安装",
            "description": "可通过任何浏览器在云端运行 - Edge、Firefox 或其他任何浏览器。从任务历史记录中下载结果。",
            "meta": "Edge·Firefox·任何浏览器"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "用量",
          "title": {
            "lead": "只按",
            "accent": "实际获得的记录",
            "tail": "计费"
          },
          "lead": "在线任务完成后，按实际交付的商家数据行计入用量。提交时不预扣额度，CSV 中的说明行也不计入用量。"
        },
        "checks": [
          "提交任务时不预扣额度",
          "已运行的任务会继续完成，即使最终用量超出剩余额度",
          "配额用完后，无法提交新任务",
          "用量于纽约时间每月 1 日重置，未用完的记录额度不结转"
        ],
        "mock": {
          "recordsLabel": "本月记录",
          "left": "剩余 {count} 条",
          "exhausted": "配额已用完",
          "task": "任务{id}…",
          "pending": "当前已采集 · 任务完成后计入用量",
          "counted": "计入本月",
          "rows": "{count} 行",
          "running": "运行中",
          "delta": "+{count} 条记录"
        }
      },
      "plans": {
        "head": {
          "kicker": "在线采集器套餐",
          "title": {
            "lead": "云端采集，",
            "accent": "按记录定价",
            "tail": ""
          },
          "lead": "在云端运行 MapsGrab 引擎，每交付一行商家数据计为一条记录。付费套餐包含邮箱和社交账号补全，不额外消耗记录额度。"
        },
        "specs": {
          "keywords": "每项任务的关键词数",
          "contacts": "邮箱与社交账号",
          "included": "默认开启",
          "excluded": "不包含"
        },
        "note": "一次性付款，权益覆盖一个自然月，在线采集套餐不自动续费。用量于纽约时间每月 1 日重置，未用完的记录额度不结转。",
        "compare": "比较所有套餐"
      },
      "faq": {
        "kicker": "常见问题",
        "title": {
          "lead": "在线采集器常见",
          "accent": "问题",
          "tail": ""
        },
        "lead": "常见问题的简要解答。还有其他问题，欢迎邮件联系支持团队。",
        "contact": "联系支持团队",
        "items": [
          {
            "question": "在线采集器与扩展程序有何不同？",
            "answer": "扩展程序在浏览器中采集数据，在线采集器在云端运行关键词任务，并将结果保存到控制台。"
          },
          {
            "question": "数据来自哪里？采集是否合法？",
            "answer": "MapsGrab 仅采集 Google Maps 上公开展示的信息，也就是任何访客都能看到的内容。我们不访问私人账号、受限内容或非公开数据。"
          },
          {
            "question": "我可以导出为哪些格式？",
            "answer": "有结果的任务生成一份 UTF-8 CSV，包含 37 列公开数据、连续行号及两行表头，并对整项任务的商家统一去重。没有结果的任务不生成文件。"
          },
          {
            "question": "它要多少钱？",
            "answer": "在线采集器使用定价页列出的 MapsGrab 套餐，包含每月免费记录额度。需要更多额度时可选择付费套餐。"
          },
          {
            "question": "补全邮箱和社交账号需要付费套餐吗？",
            "answer": "在线采集免费档位不包含邮箱和社交账号补全。付费套餐默认包含，也可按任务关闭；任务提交后不可更改此选项。"
          },
          {
            "question": "一个任务可以运行多长时间？",
            "answer": "每项任务最多采集 60 分钟。部分成功时，仍可获取已采集的数据行以及找到的邮箱和社交账号。可在历史记录中查看 CSV 是否可下载。"
          },
          {
            "question": "我登录时会保存主页预览吗？",
            "answer": "不会。首页预览仅供快速查看，不会保存。登录后，需在控制台打开在线采集器，重新提交关键词创建完整任务。"
          }
        ]
      },
      "cta": {
        "kicker": "开始使用",
        "title": {
          "lead": "将第一个",
          "accent": "云端任务",
          "tail": "加入队列"
        },
        "lead": "提交关键词、跟踪任务进度，并从控制台下载商家数据。",
        "primary": "开始采集",
        "secondary": "查看定价",
        "note": "含每月免费额度，无需信用卡。"
      }
    },
    "apiPage": {
      "switchLabel": "API 端点",
      "switchItems": {
        "search": "采集器",
        "reviews": "评论",
        "photos": "照片"
      },
      "primaryCta": "获取 API 密钥",
      "pricingCta": "查看定价",
      "console": {
        "label": "示例 API 请求和响应",
        "langLabel": "请求示例语言",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "复制请求",
        "replay": "重新演示请求",
        "ready": "就绪",
        "composing": "正在构建请求…",
        "sending": "正在发送请求...",
        "done": "响应·200 OK·application/json",
        "waiting": "// 等待响应...",
        "response": "响应示例"
      },
      "endpoints": {
        "kicker": "端点",
        "title": {
          "lead": "一个密钥，",
          "accent": "三个",
          "tail": "接口"
        },
        "lead": "搜索地点后，将结果中的 `fid` 传给评论或照片 API。三个接口共用同一个 API 密钥和月请求额度。",
        "here": "你在这里",
        "paramsLabel": "参数",
        "mcp": {
          "title": "为 AI 智能体接入数据？",
          "description": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。",
          "link": "了解 MCP"
        }
      },
      "chain": {
        "kicker": "串联接口",
        "title": {
          "lead": "",
          "accent": "采集器 → 评论 / 照片",
          "tail": ""
        },
        "lead": "搜索地点后，将结果中的 `fid` 传给评论或照片 API。三个接口共用同一个 API 密钥和月请求额度。",
        "label": "搜索地点后，将结果中的 fid 传给评论或照片 API。三个接口共用同一个 API 密钥和月请求额度。",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 条评论"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 条评论"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 条评论"
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
          "note": "成功响应的 status 为 partial，reason 说明采集停止原因。reported_total 是上游报告数或 null，不代表已核实的完整相册数量。"
        }
      },
      "reference": {
        "kicker": "参考",
        "title": {
          "lead": "发送请求，获取 ",
          "accent": "JSON",
          "tail": ""
        },
        "lead": "使用 `Authorization: Bearer YOUR_API_KEY` 请求头传入密钥，并发送 JSON 请求体。所有响应使用 `{code, data, msg}` 信封结构，`code` 为 10000 表示成功。",
        "baseUrl": "基础 URL",
        "copyBaseUrl": "复制基础 URL",
        "request": "请求",
        "response": "响应",
        "columns": {
          "parameter": "参数",
          "field": "字段",
          "type": "类型",
          "description": "描述",
          "example": "示例"
        },
        "required": "必填",
        "groupsLabel": "字段分组",
        "notes": [
          {
            "icon": "gauge",
            "title": "每次成功调用计为一次请求",
            "description": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
          },
          {
            "icon": "key",
            "title": "401 表示检查您的密钥",
            "description": "缺失或无效的密钥返回 HTTP 401。其他错误返回 HTTP 200，`code` 为非 10000 值，`msg` 提供错误说明。"
          },
          {
            "icon": "locate",
            "title": "位置用于引导搜索，不限定结果范围",
            "description": "`ll` 告诉 Google Maps 在哪里搜索，结果仍可能出现在该视图之外。"
          },
          {
            "icon": "target",
            "title": "明确指定地点",
            "description": "请在 `q` 中写明城市、州或邮编，服务器无法判断“我附近”是哪里。"
          }
        ]
      },
      "plans": {
        "kicker": "API 套餐",
        "title": {
          "lead": "程序化访问，",
          "accent": "按请求定价",
          "tail": ""
        },
        "lead": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
      },
      "faq": {
        "lead": "常见问题的简要解答。还有其他问题，欢迎邮件联系支持团队。",
        "contact": "联系支持团队"
      },
      "cta": {
        "kicker": "开始使用",
        "note": "含每月免费额度，无需信用卡。"
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps 采集 API — 返回 JSON 商家数据 | MapsGrab",
        "description": "MapsGrab 采集 API 将 Google Maps 搜索结果整理为 JSON：名称、地址、电话、网站、评分、营业时间、坐标、Place ID 和 fid，并可按需补全邮箱和社交账号。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "数据采集",
          "tail": " API"
        },
        "lead": "通过 HTTPS 发送关键词，即可获取 Google Maps 商家的 JSON 数据：名称、地址、电话、网站、评分、营业时间、坐标、Place ID 和 fid，并可按需补全邮箱和社交账号。",
        "meta": [
          "免费套餐：{quota}",
          "搜索和评论共用一个密钥",
          "通过 HTTPS 传输 JSON"
        ],
        "chips": [
          {
            "label": "每个地点",
            "value": "29 个数据字段"
          },
          {
            "label": "每页",
            "value": "最多 20 个地点"
          }
        ]
      },
      "endpoint": {
        "name": "采集 API",
        "description": "按关键词和可选地点获取商家数据，每个地点包含 29 个字段；启用 `extra` 还可补全邮箱和社交账号。",
        "link": "了解采集 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "采集 API",
          "tail": " 返回哪些数据"
        },
        "lead": "输入关键词和可选的搜索中心位置，即可获得 Google Maps 搜索结果的结构化 JSON。",
        "items": [
          {
            "icon": "search",
            "title": "按关键词和位置搜索",
            "description": "发送 `q`，并可选用 `ll` 指定搜索中心。`page` 指定采集 1–10 页结果，每页最多 20 个地点，所有结果在一次响应中返回。"
          },
          {
            "icon": "table",
            "title": "每个地点 29 个字段",
            "description": "名称、类别、完整地址、电话、网站、评分和评论计数、开放时间、坐标、Place ID、CID、fid、所有者等。"
          },
          {
            "icon": "mail",
            "title": "邮箱和社交账号补全",
            "description": "将 `extra` 设为 `true`，即可添加 `emails` 和 `medias`，包含在商家网站找到的 Instagram、Facebook、YouTube、TikTok、LinkedIn 和 X 账号。"
          },
          {
            "icon": "braces",
            "title": "整洁、格式稳定的 JSON",
            "description": "字段采用 snake_case 命名，统一放在 `{code, data, msg}` 信封结构中。Google Maps 未展示的值返回 `null` 或空列表，不返回空字符串。"
          },
          {
            "icon": "layers",
            "title": "明确标记部分数据",
            "description": "部分详情无法补全时，仍返回地点结果；`partial` 设为 `true`，`warnings` 说明缺失内容。"
          },
          {
            "icon": "shield",
            "title": "仅公开数据",
            "description": "结果仅包含 Google Maps 公开显示的内容 - 任何访问者都可以阅读相同的详细信息。"
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
            "description": "要搜索的内容，最多 300 个字符 — 商家类型加地点，例如`coffee shop in Portland, OR`。"
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "一次采集的结果页数，范围为 1–10，每页最多 20 个地点，全部在一次响应中返回。某页不足 20 个地点或没有新结果时，会提前停止采集。默认 `1`。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "结果语言，例如`en` 或 `fr`。默认`en`。"
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "可选搜索中心，格式为 `@lat,lng,zoom`，缩放级别为 0–21。该参数引导搜索位置，结果不会按半径裁剪。"
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "设为 `true` 时，为每个地点补充 `emails` 和 `medias`。默认 `false`。"
          }
        ],
        "groups": [
          {
            "label": "标识信息",
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
            "label": "联系方式",
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
            "label": "地点",
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
            "label": "评分",
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
            "label": "商家资料",
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
            "label": "页",
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
          "lead": "采集 API 常见",
          "accent": "问题",
          "tail": ""
        },
        "items": [
          {
            "question": "采集 API 返回哪些数据？",
            "answer": "返回 JSON，每个采集页最多 20 个地点。每个地点包含 29 个字段，包括名称、类别、地址、电话、网站、评分、评论数、营业时间、坐标、Place ID、CID、fid 等；extra 为 true 时，还包含邮箱和社交账号。"
          },
          {
            "question": "我如何进行身份验证？",
            "answer": "在 Authorization 请求头中以 Bearer 令牌传入 MapsGrab API 密钥。每个账号有一个密钥，仅生成时完整展示；生成新密钥会立即使旧密钥失效。"
          },
          {
            "question": "请求是如何计算的？",
            "answer": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
          },
          {
            "question": "page 参数有什么作用？",
            "answer": "page 表示一次调用要采集的结果页数，范围为 1 到 10。每页最多增加 20 个地点，Google Maps 不再返回新结果时会提前停止采集。它不是页码。"
          },
          {
            "question": "数据公开吗？",
            "answer": "是的。 API 仅返回 Google Maps 上公开显示的信息 - 任何访问者都可以阅读相同的详细信息。它不会访问私人帐户或非公开数据。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "将地图数据接入你的",
          "accent": "应用",
          "tail": ""
        },
        "lead": "每次搜索一个 HTTP 请求，响应中结构化 JSON — 适用于 CRM、数据管道和您自己的产品。"
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps 评论采集 API — 返回 JSON 评论数据 | MapsGrab",
        "description": "MapsGrab 评论 API 将 Google Maps 商家的公开评论整理为 JSON：评分、正文与译文、作者、日期、评论照片及商家回复，支持游标分页，每页最多 60 条。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "评论",
          "tail": "采集 API"
        },
        "lead": "通过商家的 fid 请求其 Google Maps 公开评论，返回结构化 JSON：评分、正文与译文、作者、日期、评论照片和商家回复，支持游标逐页读取。",
        "meta": [
          "免费套餐：{quota}",
          "每页最多 60 条评论",
          "通过 HTTPS 传输 JSON"
        ],
        "chips": [
          {
            "label": "每页",
            "value": "最多 60 条评论"
          },
          {
            "label": "排序方式",
            "value": "相关性 · 最新 · 评分"
          }
        ]
      },
      "endpoint": {
        "name": "评论 API",
        "description": "按 `fid` 获取一家商家的公开评论，每页最多 60 条，支持自选排序和游标分页。",
        "link": "探索评论 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "评论 API",
          "tail": " 返回哪些数据"
        },
        "lead": "获取商家的公开评论，包括评分、正文、作者、照片和商家回复，每次请求返回一页。",
        "items": [
          {
            "icon": "review",
            "title": "按 fid 获取评论",
            "description": "使用采集 API 任一结果中的 `fid` 指定商家，再传入返回的 `next_cursor` 读取下一页，每页最多 60 条评论。"
          },
          {
            "icon": "filter",
            "title": "按你的方式排序",
            "description": "`sort_by` 首先返回最相关 (1)、最新 (2)、评分最高 (3) 或评分最低 (4) 的评论。"
          },
          {
            "icon": "list",
            "title": "文本、翻译和日期",
            "description": "评级、评论文本、`translated_text` 和 `language`，以及 `published_at_ms` 和每条评论的相对日期。"
          },
          {
            "icon": "user",
            "title": "作者详细信息",
            "description": "作者名称、个人资料链接、评论总数，以及本地向导身份。"
          },
          {
            "icon": "image",
            "title": "照片与商家回复",
            "description": "`images` 列出评论附带的照片 URL；`owner_response` 是商家回复，`owner_response_at_ms` 是回复时间。"
          },
          {
            "icon": "shield",
            "title": "仅公开数据",
            "description": "仅在 Google Maps 上公开显示的评论 - 任何访问者都可以阅读相同的内容。"
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
            "description": "商家的 Feature ID，例如 `0x5495…:0xbeb4…`，采集 API 返回的每个地点均包含此字段。"
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "上一页返回的 `next_cursor`，获取第一页时省略。"
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` 最相关 · `2` 最新 · `3` 评分最高 · `4` 评分最低。默认 `1`。"
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "语言代码，例如`en`。默认`en`。"
          }
        ],
        "groups": [
          {
            "label": "评论",
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
            "label": "商家回复",
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
            "label": "页",
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
          "lead": "评论 API 常见",
          "accent": "问题",
          "tail": ""
        },
        "items": [
          {
            "question": "如何指定某一家商家？",
            "answer": "使用 fid，即采集 API 返回的每个地点都包含的 Feature ID。免费 Place ID 查找器也能从 Google Maps 地点 URL 中读取 FID。"
          },
          {
            "question": "每条评论包含哪些字段？",
            "answer": "评论 ID、评级、文本及其翻译和语言、发布时间和相对日期、作者姓名、个人资料链接、评论计数和本地向导状态、附加照片以及所有者回复及其时间。"
          },
          {
            "question": "我可以收集多少评论？",
            "answer": "每次请求返回一页评论，最多 60 条，并返回 next_cursor。将其传回即可读取下一页；next_cursor 为 null 时表示没有更多页面。"
          },
          {
            "question": "请求是如何计算的？",
            "answer": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
          },
          {
            "question": "数据公开吗？",
            "answer": "是的。 API 仅返回 Google Maps 上公开显示的评论 - 任何访问者都可以阅读相同的内容。它不会访问私人帐户或非公开数据。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "批量",
          "tail": "监测评论"
        },
        "lead": "支持游标分页的评论数据，以整洁的 JSON 返回，适用于监测、研究和报告。"
      }
    },
    "photosApi": {
      "seo": {
        "title": "照片 API — 公开商家照片 URL | MapsGrab",
        "description": "通过商家的 fid 获取公开照片 URL，结果以 JSON 返回。max_results 限制本次交付数量；结果为部分交付，不保证完整相册。"
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "照片",
          "tail": " API"
        },
        "lead": "通过商家的 fid 获取公开照片 URL，结果以 JSON 返回。max_results 限制本次交付数量；结果为部分交付，不保证完整相册。",
        "meta": [
          "免费套餐：{quota}",
          "公开商家照片 URL",
          "按请求定价"
        ],
        "chips": [
          {
            "label": "交付状态",
            "value": "partial"
          },
          {
            "label": "实际数量",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "照片 API",
        "description": "通过商家的 fid 获取公开照片 URL，结果以 JSON 返回。max_results 限制本次交付数量；结果为部分交付，不保证完整相册。",
        "link": "了解照片 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "照片 API",
          "tail": ""
        },
        "lead": "公开商家照片 URL",
        "items": [
          {
            "icon": "image",
            "title": "按 fid 获取照片",
            "description": "使用搜索结果或 Place ID 查找器提供的 `fid`。`photos` 中每项包含一个公开照片 `url`。"
          },
          {
            "icon": "filter",
            "title": "限制每次交付数量",
            "description": "`max_results` 为正整数，默认 200，只限制交付上限，实际照片可能更少；不提供页码或游标。"
          },
          {
            "icon": "list",
            "title": "查看交付状态",
            "description": "成功响应的 `status` 为 `partial`，`reason` 说明采集停止原因。`reported_total` 是上游报告数或 `null`，不代表已核实的完整相册数量。"
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
            "description": "搜索结果或 Place ID 查找器提供的商家 FID，格式为 `0x…:0x…`，每段含 12–20 位十六进制数字。"
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "本次照片交付上限，正整数，默认 200；不保证取得该数量。"
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
            "label": "交付状态",
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
          "lead": "照片 API 常见",
          "accent": "问题",
          "tail": ""
        },
        "items": [
          {
            "question": "如何请求商家照片？",
            "answer": "向 /photos 发送 POST，请求中包含 fid 和可选的 max_results；使用与搜索、评论 API 相同的 Bearer API 密钥。"
          },
          {
            "question": "能获取完整相册吗？",
            "answer": "成功响应的 status 为 partial，reason 说明采集停止原因。reported_total 是上游报告数或 null，不代表已核实的完整相册数量。 max_results 为正整数，默认 200，只限制交付上限，实际照片可能更少；不提供页码或游标。"
          },
          {
            "question": "如何获取商家的 fid？",
            "answer": "采集 API 返回的每个地点都包含 fid。免费 Place ID 查找器也可从 Google Maps 地点 URL 中读取 FID。"
          },
          {
            "question": "请求是如何计算的？",
            "answer": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
          },
          {
            "question": "数据公开吗？",
            "answer": "是的。图片 URLs 指向 Google Maps 上公开显示的照片 - 任何访问者都可以看到相同的图像。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "将商家照片接入应用",
          "tail": ""
        },
        "lead": "使用现有 API 密钥获取公开照片 URL 和交付状态。"
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps 采集器 MCP 服务器 | MapsGrab",
        "description": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。"
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "连接你的智能体",
      "hero": {
        "kicker": "MCP 服务器",
        "title": {
          "lead": "Google Maps 数据采集 ",
          "accent": "MCP",
          "tail": " 服务器"
        },
        "lead": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。",
        "meta": [
          "Streamable HTTP",
          "使用 OAuth 登录",
          "免费套餐：{quota}"
        ],
        "chips": [
          {
            "label": "传输协议",
            "value": "Streamable HTTP"
          },
          {
            "label": "工具结果",
            "value": "结构化 JSON"
          }
        ]
      },
      "agent": {
        "label": "智能体会话示例：询问本地商家信息，调用 MapsGrab 工具获取结构化结果，再生成回答",
        "session": "智能体会话",
        "connected": "MCP 服务器 {server} 已连接",
        "placeholder": "询问 Google Maps 上的任何地方......",
        "thinking": "思考中…",
        "running": "运行中",
        "scenes": [
          {
            "prompt": "查找德克萨斯州奥斯汀评级为 4.8 或更高级别的牙医，并列出他们的电话号码。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20 个地点",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "另有 17 个地点"
              }
            ],
            "answer": [
              "前 20 个结果中，有三家的评分为 ",
              {
                "strong": "4.8 或以上"
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
            "prompt": "人们在波特兰 Ember & Oak Coffee 的最新评论中怎么说？",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 个地点",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 条评论",
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
                "strong": "5 星"
              },
              "，顾客称赞浓缩咖啡和友善的员工。反复提到的问题是：",
              {
                "strong": "周末座位紧张"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "芝加哥哪些水管工没有列出网站？请整理成表格。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20 个地点",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "另有 17 个地点"
              }
            ],
            "answer": [
              {
                "strong": "20 家中的 4 家"
              },
              " 没有列出网站。前三个："
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
            "prompt": "提取 Rose City Roasters 评分最低的评论并起草礼貌的回复。",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 个地点",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 条评论",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "最低评分大多提到 ",
              {
                "strong": "高峰时段服务缓慢"
              },
              ". ",
              {
                "strong": "3 条中的 2 条"
              },
              "还没有商家回复，我已为每条评论起草回复。"
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "工具",
        "title": {
          "lead": "MCP 服务器提供哪些",
          "accent": "工具",
          "tail": ""
        },
        "lead": "三个工具: Search / Reviews / Photos.",
        "kind": "工具",
        "returns": "返回内容",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "搜索地点",
            "description": "按关键词和地点搜索，返回 Google Maps 公开展示的商家名称、电话、评分、营业时间、坐标、Place ID 和 fid 等数据。",
            "args": [
              {
                "name": "q",
                "description": "关键词加城市、州或 ZIP"
              },
              {
                "name": "page",
                "description": "采集 1–10 页结果，每页最多 20 个地点"
              },
              {
                "name": "hl",
                "description": "结果语言，例如`en`"
              },
              {
                "name": "ll",
                "description": "搜索中心位置，`@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "设为 `true` 时添加邮箱和社交账号"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "与 采集 API 相同的数据"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "列出评论",
            "description": "获取智能体关注商家的评分、评论正文、作者、日期、照片和商家回复。",
            "args": [
              {
                "name": "fid",
                "description": "从任何搜索结果"
              },
              {
                "name": "cursor",
                "description": "上一页返回的 `next_cursor`，获取第一页时省略"
              },
              {
                "name": "sort_by",
                "description": "1 相关 · 2 最新 · 3 最高 · 4 最低"
              },
              {
                "name": "hl",
                "description": "语言，例如`en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "与评论 API 相同的数据"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "按 fid 获取照片",
            "description": "通过商家的 fid 获取公开照片 URL，结果以 JSON 返回。max_results 限制本次交付数量；结果为部分交付，不保证完整相册。",
            "args": [
              {
                "name": "fid",
                "description": "搜索结果或 Place ID 查找器提供的商家 FID，格式为 `0x…:0x…`，每段含 12–20 位十六进制数字。"
              },
              {
                "name": "max_results",
                "description": "本次照片交付上限，正整数，默认 200；不保证取得该数量。"
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "了解照片 API"
          }
        ]
      },
      "flow": {
        "kicker": "如何连接",
        "title": {
          "lead": "通过一个接口，让智能体获取",
          "accent": "实时地图数据",
          "tail": ""
        },
        "lead": "客户端通过 Streamable HTTP 连接，并在浏览器中登录。智能体发现可用工具，在任务需要地图数据时调用，随后读取结构化 JSON 结果。",
        "label": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。 search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP 客户端",
        "anyClient": "任何 MCP 客户端",
        "toolsLabel": "工具",
        "hub": "MapsGrab MCP",
        "publicData": "公开 Google Maps 数据",
        "resultLabel": "结果",
        "results": [
          "20 个地点",
          "60 条评论",
          "2 照片"
        ],
        "steps": [
          {
            "title": "连接",
            "description": "将端点地址添加到客户端，再通过浏览器登录 MapsGrab。"
          },
          {
            "title": "发现工具",
            "description": "智能体列出 MapsGrab 工具及各自的输入结构。"
          },
          {
            "title": "调用",
            "description": "需要地图数据时，智能体会调用工具并读取 JSON 结果。"
          }
        ]
      },
      "setup": {
        "kicker": "设置",
        "title": {
          "lead": "",
          "accent": "每个客户端",
          "tail": "只需一段配置"
        },
        "lead": "将您的客户端指向 MapsGrab 端点并通过浏览器登录 - 无需复制 API 密钥，无需 SDK，无需运行本地进程。",
        "tabsLabel": "MCP 客户端",
        "copy": "复制配置",
        "clients": {
          "claude": {
            "file": "终端",
            "steps": [
              {
                "title": "添加服务器",
                "description": "运行命令，以 HTTP 方式注册 `mapsgrab`。"
              },
              {
                "title": "登录",
                "description": "在 Claude Code 中，运行 `/mcp`，选择 `mapsgrab` 并进行身份验证 - MapsGrab 在浏览器中打开供您批准。"
              },
              {
                "title": "询问地图数据",
                "description": "Claude Code 列出了 MapsGrab 工具，并在提示需要时调用它们。"
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "编辑 mcp.json",
                "description": "将配置添加到 `~/.cursor/mcp.json` 可供所有项目使用；添加到 `.cursor/mcp.json` 则仅供当前项目使用。"
              },
              {
                "title": "登录",
                "description": "在 Cursor 设置 → MCP 中，单击 `mapsgrab` 旁边的连接并在浏览器中批准它。"
              },
              {
                "title": "使用工具",
                "description": "`mapsgrab` 会在 MCP 服务器列表中展示工具，供智能体调用。"
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "添加 .vscode/mcp.json",
                "description": "粘贴配置片段，其中只有端点 URL，不包含任何凭据。"
              },
              {
                "title": "登录",
                "description": "启动服务器。 VS Code 要求通过 MapsGrab 进行身份验证并打开浏览器进行批准。"
              },
              {
                "title": "使用智能体模式",
                "description": "以智能体模式打开 Chat，并启用 MapsGrab 工具。"
              }
            ]
          },
          "codex": {
            "file": "终端",
            "steps": [
              {
                "title": "添加服务器",
                "description": "运行`codex mcp add`，通过URL注册`mapsgrab`。"
              },
              {
                "title": "登录",
                "description": "运行 `codex mcp login mapsgrab` 并在浏览器中批准 MapsGrab。"
              },
              {
                "title": "启动 Codex",
                "description": "新会话加载 `mapsgrab` 及其工具。"
              }
            ]
          }
        },
        "apiKey": {
          "title": "无法从浏览器登录？使用 API 密钥",
          "description": "如果客户端不支持 MCP 授权，或运行在服务器、CI 环境中，可改为通过 `Authorization` 请求头传入 API 密钥。请将密钥保存在环境变量或客户端的保密输入中，避免写入共享配置文件。",
          "link": "获取 API 密钥",
          "snippet": "任何 HTTP 客户端"
        },
        "spec": {
          "title": "任何其他 MCP 客户端",
          "subtitle": "包括 MCP Inspector",
          "transport": "传输协议",
          "transportValue": "Streamable HTTP",
          "endpoint": "端点",
          "copyEndpoint": "复制端点",
          "auth": "授权",
          "authValue": "OAuth 登录（备用方式：Authorization: Bearer YOUR_API_KEY）"
        }
      },
      "prompts": {
        "kicker": "提示示例",
        "title": {
          "lead": "用自然语言提问，",
          "accent": "获得数据表格",
          "tail": ""
        },
        "lead": "开发潜在客户、调研本地市场、监测评论：用自然语言描述任务，智能体会选择合适的 MapsGrab 工具。",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "潜在客户开发",
              "quote": "“查找德克萨斯州奥斯汀评级为 4.8 或更高级别的牙医，并列出他们的电话号码。”",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "口碑监测",
              "quote": "“总结一下人们在波特兰 Ember & Oak Coffee 的最新评论中所说的内容。”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "潜在客户名单",
              "quote": "“整理丹佛瑜伽工作室的名单，包含邮箱和 Instagram 账号。”",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "市场调查",
              "quote": "“比较波特兰 Division St 咖啡店的评分和评论数量。”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "联系方式补全",
              "quote": "“在此电子表格中添加每个企业的 Place ID、电话和网站。”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "商家回复",
              "quote": "“提取 Rose City Roasters 评分最低的评论并起草礼貌的回复。”",
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
              "tag": "缺少网站的商家",
              "quote": "“芝加哥的哪些水管工没有列出网站？将它们放在表格中。”",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "营业时间",
              "quote": "“60614附近哪些汽修店周日营业？”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "测绘",
              "quote": "“将布鲁克林素食餐厅及其坐标导出为 GeoJSON。”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "本地化",
              "quote": "“搜索里昂的面包店并返回法语的列表详细信息。”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "已认领的商家资料",
              "quote": "“查看奥斯汀哪些健身房已认领 Google 商家资料。”",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "本地向导",
              "quote": "“最近对 Hawthorne Bean Co. 的哪些评论来自本地向导？”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "响应时间",
              "quote": "“这些美容院会回复评论吗？商家通常需要多久回复？”",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "身份验证和数据",
        "title": {
          "lead": "登录一次，",
          "accent": "只访问公开数据",
          "tail": ""
        },
        "lead": "每次调用 MCP 端点都需携带 Bearer 凭据：登录获得的 OAuth 令牌，或客户端无法登录时使用的 API 密钥。所有结果均来自 Google Maps 公开展示的信息。",
        "inspector": {
          "label": "携带 Bearer Authorization 请求头的 MCP 请求示例，以及返回结构化内容的 JSON-RPC 响应",
          "request": "请求",
          "response": "响应",
          "verified": "令牌已验证"
        },
        "items": [
          {
            "icon": "key",
            "title": "登录，或使用 API 密钥",
            "description": "通过浏览器登录并批准客户端。不支持 MCP 授权的客户端可改为通过 Bearer 令牌传入 API 密钥，两种方式均可访问相同工具。"
          },
          {
            "icon": "eye",
            "title": "读取 Google Maps，从不写入",
            "description": "工具只搜索和读取公开的商家信息，不会修改 Google Maps 数据；调用只会增加请求用量。"
          },
          {
            "icon": "lock",
            "title": "配置文件无需保存凭据",
            "description": "登录后，您的配置仅保存端点 URL。如果您使用 API 密钥，请将其保存在环境变量中，而不是共享文件中。"
          },
          {
            "icon": "shield",
            "title": "随时撤销访问权限",
            "description": "已授权客户端显示在“控制台 → API”中，可随时撤销访问。生成新 API 密钥会立即使旧密钥失效。"
          }
        ]
      },
      "billing": {
        "kicker": "定价",
        "title": {
          "lead": "包含在你的 ",
          "accent": "API 套餐",
          "tail": "中"
        },
        "lead": "MCP 服务器与采集 API、评论 API 共用每月请求额度，每次成功的工具调用计为一次请求。",
        "compare": "比较 API 套餐",
        "head": {
          "plan": "套餐",
          "requests": "每月请求",
          "scale": "（对数刻度）",
          "price": "价格"
        }
      },
      "faq": {
        "title": {
          "lead": "MCP 服务器常见",
          "accent": "问题",
          "tail": ""
        },
        "items": [
          {
            "question": "MapsGrab MCP 服务器是什么？",
            "answer": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。 search_places / list_reviews / list_photos."
          },
          {
            "question": "哪些客户端可以连接？",
            "answer": "任何支持 Streamable HTTP 的 MCP 客户端：Claude Code、Cursor、VS Code、Codex、MCP Inspector 等。完全按照所示使用端点 URL，包括尾部斜杠。"
          },
          {
            "question": "它是如何认证的？",
            "answer": "支持 MCP 授权的 Claude Code、Cursor、VS Code、Codex 等客户端会在浏览器中打开 MapsGrab，供你登录并批准连接；之后可在“控制台 → API”撤销访问。仅当客户端无法登录时，才需在 Authorization 请求头中以 Bearer 令牌传入 API 密钥。"
          },
          {
            "question": "工具调用是如何计数的？",
            "answer": "每次成功调用计为一次请求，包括照片的部分交付，与照片张数无关。无法交付有效照片时返回错误，不扣额度。搜索、评论、照片与 MCP 共用月请求额度。"
          },
          {
            "question": "智能体能获取商家照片吗？",
            "answer": "list_photos(fid, max_results): 通过商家的 fid 获取公开照片 URL，结果以 JSON 返回。max_results 限制本次交付数量；结果为部分交付，不保证完整相册。 本次照片交付上限，正整数，默认 200；不保证取得该数量。"
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "为智能体提供",
          "accent": "实时地图数据",
          "tail": ""
        },
        "lead": "通过一个 MCP 连接搜索 Google Maps 地点、读取评论并获取公开商家照片 URL。"
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "免费工具",
        "guide": {
          "kicker": "关于这个工具",
          "title": {
            "lead": "工具用途与",
            "accent": "使用方法",
            "tail": ""
          },
          "lead": "一切都在您的浏览器中运行 - 您粘贴或上传的任何内容都不会离开您的设备。"
        },
        "related": {
          "kicker": "相关工具",
          "title": {
            "lead": "更多",
            "accent": "地图数据",
            "tail": "免费工具"
          },
          "lead": "完全在浏览器中运行的小型实用程序 - 您粘贴的内容永远不会离开您的设备。邮箱检查器例外：它会把邮箱地址发送到我们的服务器进行验证。"
        },
        "faq": {
          "kicker": "常见问题",
          "lead": "常见问题的简要解答。还有其他问题，欢迎邮件联系支持团队。",
          "contact": "联系支持团队"
        },
        "cta": {
          "kicker": "批量采集",
          "primary": "安装 MapsGrab",
          "secondary": "查看定价",
          "note": "含每月免费额度，无需信用卡。"
        },
        "resultHeading": "结果",
        "copy": "复制",
        "copied": "已复制到剪贴板。",
        "downloadCsv": "下载 CSV",
        "genericError": "出了点问题。检查您的输入并重试。"
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID 查找器 — 从 URL 获取 Google Maps Place ID | MapsGrab",
          "description": "粘贴 Google Maps 位置 URL 并立即获得其 Place ID、CID 和 FID。基于浏览器的免费 Place ID 查找器 — 无需登录，您的 URL 永远不会离开您的设备。"
        },
        "hero": {
          "title": {
            "lead": "地点 ID ",
            "accent": "查询器",
            "tail": ""
          },
          "description": "粘贴完整的 Google Maps 位置 URL 并一键读出其 Place ID、CID 和 FID。一切都在您的浏览器中解码 - URL 永远不会上传。"
        },
        "form": {
          "urlLabel": "Google Maps 地点 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "查找 Place ID",
          "errorShortLink": "不支持短链接 (maps.app.goo.gl)。在浏览器中打开链接，然后从地址栏中粘贴完整的 URL。",
          "errorInvalidUrl": "这似乎不是 Google Maps 地点 URL。请打开具体地点并复制完整 URL，其中应包含“/maps/place/”，以及“@”或“data=”。",
          "errorNoIds": "在此 URL 中未找到地点标识符。确保您复制的是地点页面的 URL，而不是搜索结果页面。",
          "examplesLabel": "试试",
          "examples": {
            "city": "旧金山",
            "business": "咖啡店·波特兰",
            "shortLink": "短链接"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "将 FID 的两部分编码为 base64url",
          "cidNote": "FID 后半部分：十六进制 → 十进制",
          "fidNote": "URL 中的最后两个 0x… 段",
          "anatomy": {
            "fidHigh": "FID · 前半部分",
            "fidLow": "FID · 后半部分",
            "empty": "粘贴地点 URL，其中包含的标识符会在这里高亮显示。"
          },
          "missing": "不在这个链接里",
          "copyLabel": "复制 {label}",
          "privacy": "在您的浏览器中解码 - URL 永远不会上传。"
        },
        "chips": [
          {
            "label": "Google API 密钥",
            "value": "不需要"
          },
          {
            "label": "您的 URL",
            "value": "不会上传"
          }
        ],
        "steps": {
          "head": {
            "kicker": "工作原理",
            "title": {
              "lead": "将地图链接转换为 ",
              "accent": "Place ID",
              "tail": ""
            },
            "lead": "无需 API 密钥或登录，地点标识符已包含在你复制的 URL 中。"
          },
          "items": [
            {
              "heading": "在 Google Maps 中打开地点",
              "body": "搜索该商家并单击其列表，以便打开地点页面。"
            },
            {
              "heading": "复制完整的 URL",
              "body": "复制地址栏中的完整长 URL，其中包含商家名称、“@”坐标段和“data=”参数。"
            },
            {
              "heading": "粘贴并解码",
              "body": "将其粘贴到上面并按“查找 Place ID”。出现 Place ID、CID 和 FID，每个都有一个复制按钮。"
            }
          ],
          "copiedBadge": "已复制",
          "note": "像maps.app.goo.gl这样的短链接如果不跨域跟踪就无法解码，因此请先打开链接并粘贴完整地址。"
        },
        "identifiers": {
          "head": {
            "kicker": "标识符",
            "title": {
              "lead": "三种 ID，",
              "accent": "同一个地点",
              "tail": ""
            },
            "lead": "Place ID 是 Google 为地点提供的稳定标识符，通常是以“ChIJ”开头的字符串；商家更名或搬迁后通常仍有效。"
          },
          "keys": {
            "placeId": "Places API、评论组件及预订系统使用的“ChIJ…”字符串。",
            "fid": "内部用于标识同一地点的一对十六进制数。",
            "cid": "FID 后半部分的十进制形式，用于旧版地图 URL 和广告工具。"
          },
          "derive": {
            "label": "Place ID 和 CID 如何从 FID 衍生而来",
            "source": "FID 来自 URL",
            "protobuf": "protobuf · 小端",
            "base64": "base64url",
            "secondHalf": "后半部分",
            "hexToDecimal": "十六进制 → 十进制"
          },
          "features": [
            {
              "heading": "无需 API 密钥",
              "body": "Place ID 已编码在你粘贴的地点 URL 中，因此工具可离线解码。"
            },
            {
              "heading": "无速率限制",
              "body": "不涉及查找服务 - 从地图 URL 到 Place ID 的转换是确定性的。"
            },
            {
              "heading": "不会上传",
              "body": "整个计算在您的浏览器选项卡中运行 - 您粘贴的 URL 永远不会发送到任何服务器。"
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "地点 ID 常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "Place ID 会改变吗？",
              "answer": "很少。 Google 将地点 ID 记录为稳定的长期标识符，但当地点合并或重组时，少量 ID 可能会被废弃。如果 Place ID 的使用者报告其无效，请再次查找该位置并刷新存储的值。"
            },
            {
              "question": "Place ID 和 CID 一样吗？",
              "answer": "不同。CID 是旧版地图链接和广告工具使用的十进制标识符；Place ID 则是 Places API 使用的“ChIJ…”字符串。它们标识同一地点，但不能互换，因此本工具同时展示两者。"
            },
            {
              "question": "为什么我的maps.app.goo.gl 链接被拒绝？",
              "answer": "短链接需要跨域跳转后才能解析为完整地点 URL。纯浏览器工具若自动跟随跳转，会把链接发送给第三方。请先在浏览器中打开短链接，再粘贴地址栏中的完整 URL。"
            },
            {
              "question": "为此我需要 Google API 密钥吗？",
              "answer": "不需要。Place ID 已编码在你粘贴的地点 URL 中，可直接离线解码。只有后续使用此 ID 调用 Places API 时，才需要 Google API 密钥。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "需要",
            "accent": "批量",
            "tail": "获取地点 ID？"
          },
          "lead": "MapsGrab 为每家采集到的商家提取 Place ID、CID 和 FID，以及另外 33 列数据，并直接导出为 CSV 或 JSON。"
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google 评论链接生成器 — 免费直接评论 URL | MapsGrab",
          "description": "将 Google Maps 地点 URL 转换为可与客户共享的直接 Google 评论链接。免费，基于浏览器，无需上传任何内容。"
        },
        "hero": {
          "title": {
            "lead": "Google 评论链接",
            "accent": "生成器",
            "tail": ""
          },
          "description": "粘贴 Google Maps 地点 URL 并获取该企业的直接“撰写评论”链接 - 从满意的客户到 Google 评论的最短路径。"
        },
        "form": {
          "urlLabel": "Google Maps 地点 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "生成评论链接",
          "errorShortLink": "不支持短链接 (maps.app.goo.gl)。在浏览器中打开链接，然后从地址栏中粘贴完整的 URL。",
          "errorInvalidUrl": "这似乎不是 Google Maps 地点 URL。请打开具体地点并复制完整 URL，其中应包含“/maps/place/”，以及“@”或“data=”。",
          "errorNoIds": "在此 URL 中未找到地点标识符。确保您复制的是地点页面的 URL，而不是搜索结果页面。"
        },
        "result": {
          "linkLabel": "评论链接",
          "open": "打开"
        },
        "howTo": [
          {
            "heading": "什么是 Google 评论链接？",
            "body": "评论链接是一种快捷方式，可打开 Google 上某一特定商家的评论对话框。您无需要求客户搜索您的商家，滚动到评论部分，然后按“撰写评论”，而是向他们发送一个 URL - search.google.com/local/reviews?placeid=… - 直接出现在评论表单上。企业将这些链接放在后续电子邮件、柜台二维码以及交易后短信中。"
          },
          {
            "heading": "如何生成评论链接",
            "body": "打开 Google Maps，找到您的商家，然后打开其地点页面。从地址栏中复制长URL并将其粘贴到上面。按“生成评论链接”，该工具会构建带有编码的地点 ID 的直接链接，可供复制或打开。该链接是通用的：它适用于桌面浏览器和 Google Maps 移动应用程序。"
          },
          {
            "heading": "地点 ID 的来源",
            "body": "该工具重复使用与 Place ID Finder 相同的本地解码：标识符已存在于地图 URL 中，并且到“ChIJ…”形式的转换完全发生在您的浏览器中。如果您管理多个地点，请在每个地点重复该过程，或者让 MapsGrab 在每次导出中携带 Place ID 列，以便可以从电子表格批量生成评论链接。"
          }
        ],
        "faq": {
          "title": {
            "lead": "评论链接常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "评论链接会过期吗？",
              "answer": "不会。评论链接绑定到稳定的地点 ID，只要该地点仍在 Google Maps 上，链接就能打开对应的评论对话框。"
            },
            {
              "question": "多个门店可以共用一个评论链接吗？",
              "answer": "每个评论链接只对应一个地点，需为每家门店单独生成。多门店商家通常会维护一份 Place ID 表，再据此生成各自的评论链接。"
            },
            {
              "question": "是否允许通过链接请求评论？",
              "answer": "可以邀请顾客留下真实评论，但不能提供奖励或筛选评论。Google 政策禁止付费换评论，以及只引导满意顾客评价。请向所有顾客发送相同链接，让他们如实反馈。"
            },
            {
              "question": "为什么我的链接会打开搜索页面而不是评论表单？",
              "answer": "当链接中的地点 ID 错误时就会发生这种情况 - 通常是手动编辑 URL 的结果。从原始地图地点 URL 重新生成链接，并验证 Place ID 以“ChIJ”开头。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "追踪你",
            "accent": "获得",
            "tail": "的每一条评论"
          },
          "lead": "MapsGrab 提取任何商家页面的评论（评级、文本、日期和所有者回复），以便您可以查看反馈并更快地答复。"
        }
      },
      "emailChecker": {
        "seo": {
          "title": "邮箱检查器 — 免费验证邮箱地址能否收信 | MapsGrab",
          "description": "检查邮箱地址能否正常收信。这款免费邮箱检查器会向邮件服务器核实，并给出状态、可投递性、MX 记录与账号类型。"
        },
        "hero": {
          "title": {
            "lead": "邮箱",
            "accent": "检查器",
            "tail": ""
          },
          "description": "输入邮箱地址，我们会向它的邮件服务器核实能否真正收信，并给出状态、MX 记录、账号类型与评分。"
        },
        "guideLead": "格式检查在浏览器中完成；邮箱地址本身会发送到我们的服务器，再向其邮件服务器核实。",
        "form": {
          "emailLabel": "邮箱地址",
          "emailPlaceholder": "name@example.com",
          "submit": "验证邮箱",
          "submitting": "验证中…",
          "verifyingHint": "正在向邮件服务器核实，最长可能需要一分钟。",
          "invalidHeading": "此邮箱地址存在以下问题：",
          "issues": {
            "empty": "请先输入邮箱地址。",
            "multipleAt": "该地址包含多个“@”符号。",
            "missingAt": "邮箱地址缺少用于分隔用户名与域名的“@”。",
            "localEmpty": "“@”之前的部分是空的。",
            "localTooLong": "“@”前的部分超过邮箱标准允许的 64 个字符。",
            "localInvalidChars": "“@”之前的部分包含电子邮件地址中不允许的字符（空格、引号或控制字符）。",
            "localDotPosition": "“@”前的部分不能以点开头或结尾，也不能出现连续两个点。",
            "domainEmpty": "“@”后面的部分是空的。",
            "domainNoTld": "域名缺少顶级域（TLD），请补充“.com”或“.org”等后缀。",
            "domainInvalidChars": "域名包含不允许的字符，如空格、下划线或其他符号。",
            "domainLabelHyphen": "域名各段不能以连字符开头或结尾。",
            "domainEmptyLabel": "域名中存在连续两个点或空白段。",
            "domainTooLong": "该域的长度超过了电子邮件标准允许的 253 字符。",
            "typoDomain": "此域名可能是常见邮箱服务商域名的拼写错误。"
          }
        },
        "result": {
          "labels": {
            "status": "状态",
            "deliverable": "可投递",
            "mxRecords": "MX 记录",
            "email": "邮箱地址",
            "domain": "域名",
            "accountType": "账号类型",
            "catchAll": "全收域名（catch-all）",
            "score": "评分"
          },
          "statuses": {
            "safe": "可安全发送",
            "invalid": "无效",
            "disabled": "已停用",
            "disposable": "一次性邮箱",
            "inbox_full": "收件箱已满",
            "catch_all": "全收域名",
            "role_account": "角色邮箱",
            "spamtrap": "垃圾邮件陷阱",
            "unknown": "未知"
          },
          "accountTypes": {
            "standard": "普通邮箱",
            "role": "角色邮箱",
            "disposable": "一次性邮箱",
            "free": "免费邮箱"
          },
          "yes": "是",
          "no": "否",
          "noMx": "未找到",
          "unavailable": "无法连接验证服务，请稍后重试。",
          "rateLimited": "今日免费验证次数已用完，请明天再试。"
        },
        "howTo": [
          {
            "heading": "本工具验证什么",
            "body": "本工具向收件方邮件服务器询问该邮箱是否存在、是否接收邮件——这与发信服务器投递前的确认相同，但不会真的发送邮件。结果包括总体状态、能否投递、域名的 MX 记录、账号类型（普通邮箱、info@ 或 sales@ 这类角色邮箱、一次性邮箱或免费邮箱）、域名是否全收（catch-all），以及 0–100 的评分。"
          },
          {
            "heading": "如何检查邮箱地址",
            "body": "输入或粘贴一个邮箱地址，点击“验证邮箱”。格式问题会在浏览器中逐条列出，这类地址不会被发送；疑似常见服务商域名的拼写错误（如“gmial.com”）会给出提示，但不影响验证。格式正确的地址会提交到我们的服务器，由服务器向邮件服务器核实，通常只需几秒，最长可能需要一分钟。"
          },
          {
            "heading": "如何解读结果",
            "body": "“可安全发送”表示邮箱存在并能接收邮件。“无效”和“已停用”的地址会退信，“垃圾邮件陷阱”绝不应发送。全收域名接受任何地址，因此无法确认邮箱本身是否存在；角色邮箱、一次性邮箱和收件箱已满的地址用于外联都有风险。“未知”表示邮件服务器没有给出明确答复，可稍后重试。MapsGrab 从每家商家的官方网站采集邮箱，联系前可以用本工具快速抽查。"
          }
        ],
        "faq": {
          "title": {
            "lead": "邮箱检查常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "这个工具会检查邮箱是否真的存在吗？",
              "answer": "会。除了格式，本工具还会向收件方邮件服务器询问是否接收发往该地址的邮件，过程中不会发送邮件。服务器没有给出明确答复时（例如全收域名），结果会如实标出，而不是猜测。"
            },
            {
              "question": "可以检查多少个邮箱？",
              "answer": "每天最多免费检查 5 个，一次一个。未通过格式检查的地址不会被发送，因此不占用次数。"
            },
            {
              "question": "检查通过后，邮件仍可能退信吗？",
              "answer": "可能。邮箱可能在检查后被关闭或塞满，有些服务器也会先接收邮件、之后再退回。“可安全发送”只表示检查时该地址能够收信，并不代表一定有人阅读。"
            },
            {
              "question": "为什么“name@localhost”被拒绝？",
              "answer": "检查器要求域名包含公共顶级域（TLD），因为缺少这类后缀的邮箱无法接收外部互联网邮件。这类地址会在浏览器中直接标出，不会发送去验证。"
            },
            {
              "question": "我输入的邮箱地址会被如何处理？",
              "answer": "地址会发送到我们的服务器，再由我们使用的邮箱验证服务商向收件方邮件服务器核实。整个过程不会向该地址发送任何邮件。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "采集值得",
            "accent": "验证",
            "tail": "的邮箱"
          },
          "lead": "MapsGrab 从每家商家的官方网站查找邮箱和社交账号，并补充到采集结果中。"
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "经纬度转度分秒 — 十进制度转换为 DMS | MapsGrab",
          "description": "立即将十进制纬度和经度转换为度、分、秒 (DMS) 格式。基于浏览器的免费坐标转换器，无需上传任何内容。"
        },
        "hero": {
          "title": {
            "lead": "将经纬度转换为",
            "accent": "度分秒（DMS）",
            "tail": ""
          },
          "description": "输入十进制度格式的纬度和经度，即可获取带半球字母的度分秒坐标，直接复制使用。"
        },
        "form": {
          "latitudeLabel": "纬度（十进制，-90 到 90）",
          "longitudeLabel": "经度（十进制，-180 到 180）",
          "placeholder": "37.774929",
          "submit": "转换为 DMS",
          "errorLatitude": "纬度必须是 -90 和 90 之间的数字。",
          "errorLongitude": "经度必须是 -180 和 180 之间的数字。"
        },
        "result": {
          "dms": "度分秒坐标"
        },
        "howTo": [
          {
            "heading": "什么是十进制度和度分秒（DMS）？",
            "body": "地图和电子表格常用十进制度存储坐标，每个轴用一个带正负号的数值，例如 37.774929, -122.419416。测量、海图和不动产文档常用六十进制的度分秒表示法，并以字母标示半球，例如 37° 46' 29.74\" N, 122° 25' 9.90\" W。两种格式表示同一个点；1 角分等于 1/60 度，1 角秒等于 1/60 角分。"
          },
          {
            "heading": "如何转换",
            "body": "粘贴十进制度格式的纬度和经度，点击“转换为 DMS”。负值分别表示南纬和西经，以 S 和 W 显示。角秒保留两位小数，足以满足常见 GPS 数据的精度需求。可将完整坐标复制到文档，或将各部分填入电子表格。"
          },
          {
            "heading": "为什么这对地图数据工作很重要",
            "body": "在工具间传递商家数据时，经常需要转换坐标格式：Google Maps 使用十进制度，地籍和印刷文档可能要求 DMS。MapsGrab 的每条导出记录已包含经纬度，也可使用本页相同公式离线批量转换。"
          }
        ],
        "faq": {
          "title": {
            "lead": "坐标转换常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "DMS 结果的精确度如何？",
              "answer": "角秒保留两位小数。纬度方向的 1 角秒约为 30 米，因此两位小数约对应 30 厘米，比常见 GPS 数据更精细。最终精度取决于输入数据，转换不会提高原始精度。"
            },
            {
              "question": "这里的 N、S、E、W 是什么意思？",
              "answer": "这些字母替代十进制度的正负号：正纬度为北纬 N，负纬度为南纬 S；正经度为东经 E，负经度为西经 W。工具根据数值正负自动选择字母。"
            },
            {
              "question": "我可以在这里将 DMS 转换回十进制吗？",
              "answer": "是的 — 使用本网站上的配套工具“将 DMS 转换为 DD”。使用相同的实现来转换两种方式可以避免不同公式之间的舍入漂移。"
            },
            {
              "question": "我的坐标数据上传了吗？",
              "answer": "不会。转换在浏览器选项卡中是简单的算术；您输入的任何内容都不会离开页面。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "每家商家的坐标，均已",
            "accent": "采集",
            "tail": ""
          },
          "lead": "MapsGrab 将纬度和经度写入其导出的每一行 - 无需为您的下一个路线或区域项目手动查找坐标。"
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "度分秒转十进制度 — DMS 转 DD | MapsGrab",
          "description": "即时将度、角分和角秒坐标转换为十进制度。免费在浏览器中完成，不上传任何数据。"
        },
        "hero": {
          "title": {
            "lead": "将度分秒转换为十进制度数",
            "accent": "（纬度、经度）",
            "tail": ""
          },
          "description": "输入经纬度的度、角分和角秒，即可转换为 Google Maps、电子表格和 MapsGrab 使用的十进制度格式。"
        },
        "form": {
          "latitudeHeading": "纬度（N/S）",
          "longitudeHeading": "经度（E/W）",
          "degreesLabel": "度数",
          "minutesLabel": "角分",
          "secondsLabel": "角秒",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "转换为十进制度",
          "errorValues": "度数须为零或正整数，角分和角秒须大于等于 0 且小于 60。"
        },
        "result": {
          "dd": "十进制度坐标"
        },
        "howTo": [
          {
            "heading": "为什么将 DMS 转换回十进制度？",
            "body": "度分秒适合人工阅读，而 Google Maps 搜索、GIS 导入、电子表格距离计算和地理编码通常使用十进制度。转换公式为：度数 + 角分 ÷ 60 + 角秒 ÷ 3600，再根据半球字母确定正负号。"
          },
          {
            "heading": "如何转换",
            "body": "填写纬度和经度的度、角分、角秒，选择半球字母 N/S 和 E/W，再点击“转换为十进制度”。结果保留六位小数，地面分辨率约 11 厘米，可满足商家位置应用。可直接粘贴到 Google Maps 或电子表格。"
          },
          {
            "heading": "保持坐标数据一致",
            "body": "混用坐标格式可能导致导入后的地点偏移，甚至落入错误海域。统一使用十进制度，并在数据输入时完成转换，可保持数据流程一致。MapsGrab 已以十进制度导出坐标，采集结果可直接用于 GIS 和 BI 工具。"
          }
        ],
        "faq": {
          "title": {
            "lead": "度分秒转十进制度数常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "我需要多少位小数？",
              "answer": "六位小数的分辨率约为 11 厘米，已超出消费级 GPS 的精度。商家位置通常保留五位小数（约 1 米）即可；减少小数位数会降低位置精细度。"
            },
            {
              "question": "字段必须满足什么范围？",
              "answer": "角分和角秒须大于等于 0 且小于 60。纬度最大为 90 度，经度最大为 180 度；超出有效范围时，转换器会提示错误。"
            },
            {
              "question": "当我选择S或W时我应该输入负数吗？",
              "answer": "不——半球字母已经编码了符号。如果您同时输入带符号的值和冲突的字母，该工具会标记矛盾而不是猜测。"
            },
            {
              "question": "转换是在服务器上完成的吗？",
              "answer": "不需要。该公式在您的浏览器中运行；您输入的任何内容都不会传输到任何地方。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "批量",
            "tail": "处理坐标，省去手工操作"
          },
          "lead": "MapsGrab 导出其收集的每个企业的十进制纬度和经度，位于地址、电话和 Place ID 列旁边。"
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "批量关键词生成器 - 关键词 + 位置组合 | MapsGrab",
          "description": "免费批量生成关键词与地点组合，用于本地 SEO 和地图采集任务。粘贴两个列表，即可获得全部组合并下载 CSV。"
        },
        "hero": {
          "title": {
            "lead": "批量关键词",
            "accent": "生成器",
            "tail": ""
          },
          "description": "粘贴关键词列表和地点列表，即可生成所有“关键词 + 地点”组合，直接复制或下载 CSV，快速准备本地搜索任务。"
        },
        "form": {
          "keywordsLabel": "关键词（每行一个）",
          "keywordsPlaceholder": "设计机构\n咖啡厅\n水管工",
          "locationsLabel": "地点（每行一个）",
          "locationsPlaceholder": "纽约\n芝加哥\n奥斯汀",
          "orderLabel": "组合顺序",
          "keywordFirst": "关键词 + 地点（设计机构 纽约）",
          "locationFirst": "地点 + 关键词（纽约 设计机构）",
          "submit": "生成组合",
          "resultCount": "已生成 {count} 个组合。",
          "errorKeywords": "添加至少一个关键词。",
          "errorLocations": "添加至少一个位置。"
        },
        "howTo": [
          {
            "heading": "批量关键词生成的用途是什么？",
            "body": "本地搜索活动依赖于组合：在您服务的每个城市、地区或社区中重复提供相同的服务。十个地点的十个关键词就是一百个搜索短语——“设计机构 纽约”、“设计机构芝加哥”等等。手写这些内容很容易出错；从两个列表生成它们只需几秒钟，并且保证不会遗漏任何内容。"
          },
          {
            "heading": "如何生成组合",
            "body": "将您的关键词粘贴到第一个框中（每行一个），并将您的位置粘贴到第二个框中。选择是先出现关键词还是先出现位置，然后按“生成”。每个关键词都与每个位置配对，删除了空行和重复项，完整列表显示在下面并带有计数。将其直接复制到 Google 广告关键词列表、Google 趋势检查或地图抓取任务队列中。"
          },
          {
            "heading": "从关键词列表到收集的数据",
            "body": "经典的下一步是将每个组合作为 Google Maps 搜索运行并收集结果。该循环正是 MapsGrab 自动化的：扩展程序接受关键词列表作为批处理任务，逐一遍历搜索，并导出它找到的每个商家 - 因此您在此处生成的组合成为结构化行，无需手动复制。"
          }
        ],
        "faq": {
          "title": {
            "lead": "批量关键词常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "我可以生成多少种组合？",
              "answer": "数量取决于浏览器可用内存，工具在本地组合两个列表并去重。生成一万个组合没有问题；批量较大时，下载 CSV 比复制文本框内容更方便。"
            },
            {
              "question": "重复项是否被删除？",
              "answer": "是的。在配对之前，每个列表中的重复行都会被删除，并且输出按照您选择的顺序仅包含每个关键词位置对一次。"
            },
            {
              "question": "应该选择哪种组合顺序？",
              "answer": "两种顺序都有人使用，例如“水管工 奥斯汀”与“奥斯汀 水管工”。同时生成两种顺序，有助于覆盖不同搜索表达。"
            },
            {
              "question": "我可以使用市区或邮政编码作为位置吗？",
              "answer": "可以。地区、邮编、都会区，或完整的“城市、州”都可作为地图搜索的地点部分，每行输入一个。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "将关键词列表转化为",
            "accent": "采集结果",
            "tail": ""
          },
          "lead": "MapsGrab 批量任务会逐个关键词执行地图搜索，将找到的商家导出为 CSV 或 JSON，并支持评论、照片及联系方式补全。"
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "在线合并 CSV 文件 — 免费合并多个 CSV 文件 | MapsGrab",
          "description": "在线将多个 CSV 合并成一个文件，自动按表头并集对齐列。免费在浏览器中完成，文件不外传。"
        },
        "hero": {
          "title": {
            "lead": "",
            "accent": "在线",
            "tail": "合并 CSV 文件"
          },
          "description": "上传两个或多个 CSV 文件并下载单个合并文件。列按标题对齐 - 缺失的字段留空。文件永远不会离开您的浏览器。"
        },
        "form": {
          "filesLabel": "CSV 文件",
          "filesHint": "请选择至少两个 .csv 文件。若某个文件第 2 行是翻译后的列说明，请勾选该文件以跳过此行。合并结果只保留一行字段名表头，所有文件均留在浏览器中。",
          "translationRow": "跳过 {name} 的第 2 行（翻译后的列说明）",
          "submit": "合并文件",
          "errorNoFiles": "选择至少两个 CSV 文件进行合并。",
          "errorEmptyFile": "文件为空或缺少表头行：{name}",
          "fileSummary": "{name} — {rows} 行数据",
          "resultSummary": "已将 {files} 个文件合并为 {rows} 行 × {columns} 列。",
          "previewLabel": "合并后的 CSV 预览"
        },
        "howTo": [
          {
            "heading": "本工具如何合并文件？",
            "body": "合并会将多个 CSV 纵向拼接为一张表，并按列名对齐数据。文件按所选顺序依次追加；结果保留所有文件表头的并集，某个文件缺少的列会留空，不会丢失已有字段。"
          },
          {
            "heading": "如何合并 CSV 文件",
            "body": "选择至少两个 .csv 文件，例如每周地图采集导出的文件。点击“合并文件”，工具会在浏览器中解析各文件，显示数据行数并生成合并结果。下载后可直接用 Excel、Google Sheets 打开，或导入数据库。"
          },
          {
            "heading": "合并多批次采集结果",
            "body": "常见用途是追加多次采集结果：每次 MapsGrab 采集都会导出独立 CSV，可先合并一周的数据，再统一去重和清洗。解析器遵循 RFC 4180，支持引号字段、字段内逗号和换行，因此多行地址或评论片段也能正确合并。"
          }
        ],
        "faq": {
          "title": {
            "lead": "CSV 合并常见",
            "accent": "问题",
            "tail": ""
          },
          "items": [
            {
              "question": "当文件具有不同的列时会发生什么？",
              "answer": "合并的文件包含所有标头的并集（按照它们首次出现的顺序排列）。文件中缺少列的行会在该列中获得一个空单元格。没有任何内容被删除或重命名。"
            },
            {
              "question": "我的文件是否上传到服务器？",
              "answer": "不会。这些文件是使用浏览器的 FileReader API 读取的，并合并到选项卡的内存中。没有传输任何内容，关闭页面会清除所有内容。"
            },
            {
              "question": "合并会删除重复的行吗？",
              "answer": "不会。合并只会按列名对齐并纵向追加数据。按 Place ID 等字段去重，需要在合并文件上另行处理。"
            },
            {
              "question": "文件可以有多大？",
              "answer": "限制是浏览器选项卡的内存，而不是固定数量。对于典型的商家数据导出（数千到几十万行），合并是即时的。对于非常大的文件，分批合并。"
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "每次运行一份导出，或合并为",
            "accent": "一个数据集",
            "tail": ""
          },
          "lead": "MapsGrab 每次采集可按所选字段导出 CSV/JSON，并按 Place ID 去重，方便后续合并多批次数据。"
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "公司",
  "about": {
    "navLabel": "关于",
    "seoTitle": "关于 MapsGrab |产品与边界",
    "seoDescription": "MapsGrab 为公开商家数据提供地图工具：浏览器扩展程序、云端在线采集器、API、MCP 服务器及免费网页工具。了解我们的数据边界。",
    "hero": {
      "eyebrow": "关于 MapsGrab",
      "title": {
        "lead": "",
        "accent": "直接",
        "tail": "采集地图数据"
      },
      "intro": "MapsGrab 开发工具，从 Google Maps 采集公开商家信息，并整理为整洁的结构化数据。产品包括适用于 Edge 和 Firefox 的浏览器扩展程序、云端在线采集器、API 和 MCP 服务器，以及免费网页工具，其中大部分完全在浏览器中运行。",
      "contactLabel": "联系支持团队",
      "extensionLabel": "了解扩展程序",
      "stageLabel": "抢先体验",
      "updatedLabel": "发布与审校日期",
      "updatedAt": "2026 年 8 月 31 日",
      "chips": [
        {
          "label": "采集范围",
          "value": "仅公开数据"
        },
        {
          "label": "扩展程序采集结果",
          "value": "在您的浏览器中"
        },
        {
          "label": "数据导出",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "拖动旋转"
    },
    "build": {
      "kicker": "我们的产品",
      "title": {
        "lead": "一套工具，",
        "accent": "四种",
        "tail": "使用方式"
      },
      "lead": "选择浏览器扩展程序、云端在线采集器或 API。扩展程序在你的浏览器中运行；在线采集器与 API 共用云端引擎，MCP 服务器则将 API 能力提供给 AI 智能体。",
      "hub": {
        "title": "MapsGrab 数据工具包",
        "detail": "商家数据 · 评论 · 照片 · 邮箱与社交账号补全"
      },
      "tags": {
        "extension": [
          "采集 36 列数据",
          "评论和照片",
          "批量任务"
        ],
        "online": [
          "批量关键词",
          "联系方式补全",
          "每个任务一个 37 列 CSV"
        ],
        "api": [
          "商家数据",
          "评论",
          "结构化 JSON"
        ],
        "mcp": [
          "三个工具",
          "Streamable HTTP",
          "OAuth 或 API 密钥"
        ]
      },
      "toolsLead": "加上免费的网络工具。",
      "toolsText": "本站免费网页工具无需安装，可处理 Place ID 查询、评论链接生成、坐标转换和 CSV 合并等小任务。",
      "toolsLabel": "免费网页工具"
    },
    "principles": {
      "kicker": "原则",
      "title": {
        "lead": "",
        "accent": "边界",
        "tail": "在哪里"
      },
      "lead": "MapsGrab 对数据刻意保守。这些是我们坚持的产品规则。",
      "publicData": {
        "title": "仅公开数据",
        "text": "仅公开可用的商家信息——该页面的任何访问者都可以看到的信息。",
        "visibleTag": "对任何访客可见",
        "privateTag": "私人账户"
      },
      "localFirst": {
        "title": "本地优先",
        "text": "借助扩展程序和免费网络工具，您的设置和结果将保存在您的浏览器中，而不是保存在我们的服务器上。邮箱检查器例外：它会把您输入的地址发送到我们的服务器，由邮箱验证服务商核实，过程中不会发送邮件。 在线采集器、API 和 MCP 服务器在我们的云中运行，在线采集器 结果将保存到您的帐户中。",
        "storage": "本地存储",
        "rows": [
          "设置",
          "结果",
          "批量任务"
        ]
      },
      "backend": {
        "title": "扩展程序与免费工具：后端的四项用途",
        "text": "对于扩展程序和免费网页工具，后端只负责四件事：远程配置、账号与额度状态、可选的邮箱和社交账号补全，以及最少量的使用日志。唯一的例外是邮箱检查器：后端还会把您输入的地址交给邮箱验证服务商核实，过程中不会发送邮件。",
        "chips": [
          "配置",
          "额度",
          "联系方式补全",
          "使用日志"
        ]
      },
      "never": {
        "title": "没有广告。没有追踪器。没有数据销售。",
        "text": "扩展程序中没有广告、没有第三方跟踪器，也没有出售或出租数据。",
        "chips": [
          "广告",
          "第三方追踪器",
          "出售数据"
        ]
      },
      "inWriting": {
        "kicker": "书面承诺",
        "title": "隐私政策和条款",
        "text": "每条规则均在隐私政策和服务条款中详细说明。",
        "link": "阅读隐私政策"
      }
    },
    "dataFlow": {
      "kicker": "数据流向",
      "title": {
        "lead": "哪些数据留在你这里，哪些会",
        "accent": "传给我们",
        "tail": ""
      },
      "lead": "扩展程序处理公开展示的数据，将结果保存在浏览器中。对于扩展程序和免费网页工具，后端只负责配置、额度、可选的联系方式补全及最少量的使用日志。邮箱检查器例外：它会把您输入的地址发送到我们的服务器，由邮箱验证服务商核实，过程中不会发送邮件。在线采集器、API 和 MCP 服务器在云端运行，在线采集结果保存在账号下。",
      "source": {
        "label": "来源",
        "title": "你访问的 Google Maps 页面",
        "text": "公开商家数据：名称、地址、电话、网站、评分、评论、照片。"
      },
      "browser": {
        "label": "您的浏览器·本地优先",
        "storage": "本地存储·IndexedDB",
        "rows": [
          "设置",
          "采集结果",
          "批量任务状态"
        ],
        "badge": "存储在您的浏览器中"
      },
      "backend": {
        "label": "MapsGrab 后端·四大用途",
        "lanes": [
          {
            "title": "远程配置",
            "text": "通过页面结构预设保持采集功能可用"
          },
          {
            "title": "账号与额度",
            "text": "登录、套餐状态、每月使用情况统计"
          },
          {
            "title": "邮箱与社交账号补全",
            "text": "启用功能时查找公开的联系方式"
          },
          {
            "title": "使用记录",
            "text": "功能使用和错误的最少记录"
          }
        ]
      },
      "never": {
        "label": "绝不",
        "items": [
          "无广告",
          "扩展程序中没有第三方跟踪器",
          "不出售或出租个人数据",
          "除了您从中提取的 Google Maps 页面之外，不会收集您的浏览历史记录"
        ]
      },
      "note": "本站使用 Google Analytics 4 统计页面整体使用情况，扩展程序本身不含分析代码。",
      "noteLink": "阅读隐私政策"
    },
    "status": {
      "kicker": "状态",
      "title": {
        "lead": "抢先体验，",
        "accent": "免费",
        "tail": "开始"
      },
      "access": {
        "title": "抢先体验",
        "text": "产品目前处于抢先体验阶段，Edge Add-ons 和 Firefox Add-ons 的商店上架信息正在完善。",
        "link": "安装指南"
      },
      "quota": {
        "title": "每月免费额度",
        "text": "该扩展无需帐户即可在每月免费配额内运行。",
        "link": "包含什么"
      },
      "paid": {
        "title": "大量使用的付费套餐",
        "text": "付费套餐为较大使用量提供更高额度，当前档位请参阅定价页。",
        "link": "查看定价"
      }
    }
  },
  "contact": {
    "navLabel": "联系我们",
    "seoTitle": "联系 MapsGrab 支持",
    "seoDescription": "有关帐户、浏览器扩展、计费、工具或隐私请求的信息，请联系 MapsGrab。",
    "eyebrow": "联系 MapsGrab",
    "title": {
      "lead": "联系",
      "accent": "真人",
      "tail": "支持"
    },
    "intro": "写信给我们，就会有人阅读。目前，支持由构建 MapsGrab 的团队直接处理。",
    "emailCardLabel": "支持邮箱",
    "copyEmail": "复制 {email}",
    "emailLabel": "邮件联系支持团队",
    "emailSubject": "MapsGrab 支持请求",
    "responseTimes": "我们会在一个工作日内回复支持电子邮件，通常会更快。当我们需要首先验证帐户所有权时，隐私请求可能需要几天的时间。",
    "include": {
      "title": "建议提供的信息",
      "text": "准确的报告可以帮助我们识别受影响的工作流程，而无需询问敏感的帐户信息。",
      "items": [
        "页面 URL 和您尝试的操作",
        "您的浏览器名称和版本",
        "确切的错误消息和有用的屏幕截图",
        "用于解决帐单问题的订单号，不含支付卡详细信息"
      ]
    },
    "topics": {
      "title": "我们可以提供什么帮助",
      "items": [
        "浏览器扩展程序的安装与设置",
        "帐户访问和登录问题",
        "配额、订阅、续订和付款问题",
        "Web 工具问题和功能请求",
        "隐私和帐户数据请求"
      ]
    },
    "aboutLabel": "关于",
    "privacyLabel": "隐私政策",
    "termsLabel": "服务条款"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "首页",
    "crumbLegal": "法律信息",
    "switchLabel": "法律文件",
    "readTime": "阅读约需 {minutes} 分钟",
    "sectionCount": "{count} 个章节",
    "tocTitle": "本页目录",
    "tocLabel": "{title}章节目录",
    "glanceKicker": "一目了然",
    "glanceNote": "下方法律正文的简要概述。",
    "anchorLabel": "复制链接到“{title}”",
    "copyEmail": "复制 {email}",
    "contactSupport": "联系支持团队",
    "nextLabel": "下一个文档"
  },
  "terms": {
    "navLabel": "条款",
    "seoTitle": "服务条款 | MapsGrab",
    "seoDescription": "MapsGrab 服务条款：可接受的使用、用户对收集的数据的责任、购买、免责声明以及如何联系我们。",
    "title": "服务条款",
    "intro": "这些条款管辖您对 MapsGrab 的使用：浏览器扩展、本网站和免费网络工具。请在使用服务前阅读它们。",
    "updatedLabel": "最后更新",
    "updatedAt": "2026 年 8 月 31 日",
    "updatedAtISO": "2026-08-31",
    "summary": "可接受的使用、用户对收集的数据的责任、购买、免责声明以及如何联系我们。",
    "helpTitle": "对这些条款有疑问吗？",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "仅公开数据",
        "text": "该服务仅适用于您浏览的页面上公开显示的信息。"
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "您的使用，您的责任",
        "text": "您可以在适用于您的法律范围内决定收集什么以及如何使用它们。"
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "无需帐户即可启动",
        "text": "该扩展无需帐户即可在每月免费配额内运行。"
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "随时取消",
        "text": "订阅续订直至取消；取消将阻止未来的续订。"
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "接受条款",
        "paragraphs": [
          "通过访问或使用 MapsGrab，您同意这些条款。如果您不同意它们，请不要安装扩展或使用网站和工具。"
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "服务的作用",
        "paragraphs": [
          "MapsGrab 帮助您收集您访问的 Google Maps 页面上公开显示的信息（商家详细信息、评论、照片和相关联系信息）并将其导出。该服务由 Microsoft Edge 和 Firefox 的浏览器扩展、本网站以及在浏览器中运行的免费网络工具组成。"
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "公开数据",
        "paragraphs": [
          "本服务仅处理浏览页面中公开展示的信息，不访问私人账号、受限内容或需要特殊权限才能读取的数据。"
        ]
      },
      {
        "id": "your-responsibility",
        "title": "你的责任",
        "paragraphs": [
          "您决定收集什么以及如何使用它，并且您对该使用负责。当您使用收集到的信息时，请遵守适用于您和您的目的的法律。",
          "特别是，您同意不会："
        ],
        "items": [
          "使用本服务进行任何非法活动或侵犯第三方权利。",
          "利用采集的商家数据重新识别个人身份，或建立私人个体档案。",
          "使用收集的联系方式来发送垃圾邮件或未经请求的批量消息。",
          "未经与我们另行达成协议，将采集的原始数据转售为与本服务竞争的数据产品。",
          "干扰、超载或试图破坏服务或其使用的平台。"
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "账户和配额",
        "paragraphs": [
          "该扩展无需帐户即可在每月免费配额内运行。一些功能——更高的限制、购买、云集成——需要一个帐户。您有责任保证您的帐户凭据的安全以及您帐户下发生的活动。"
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "购买和订阅",
        "paragraphs": [
          "付费套餐在定价页面上进行了描述。价格、配额和计费周期会在您购买前显示，并且购买是通过结帐时提供的支付提供商处理的。订阅套餐自动续订直至取消，您可以随时取消；取消将阻止未来的续订。"
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "该服务按原样提供",
        "paragraphs": [
          "本服务按“原样”和“可用时”提供。平台会频繁变化，采集功能可能随时部分或全部不可用。MapsGrab 不对服务持续可用、采集数据完整或适合特定用途作任何明示或暗示保证。",
          "我们可能会更改、暂停或终止服务的任何部分，并且我们可能会更新这些条款。当变更重大时，我们将在本网站上公布。更改生效后继续使用即表示您接受更新后的条款。"
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "责任限制",
        "paragraphs": [
          "在法律允许的最大范围内，MapsGrab 及其运营商不对因您使用或无法使用服务而产生的间接、偶然、特殊或后果性损害（包括利润或数据损失）承担责任。"
        ]
      },
      {
        "id": "contact",
        "title": "联系我们",
        "paragraphs": [
          "有关这些条款的问题可以发送至 support@mapsgrab.com。"
        ]
      }
    ],
    "coverage": {
      "label": "覆盖范围说明",
      "badge": "待定",
      "lead": "尚未涵盖：",
      "text": "在线采集器（云端运行）、采集／评论／照片 API，以及 MCP 服务器。上文仅描述浏览器扩展程序、本网站和免费网页工具。"
    }
  },
  "privacy": {
    "navLabel": "隐私",
    "seoTitle": "隐私政策 | MapsGrab",
    "seoDescription": "MapsGrab 隐私政策：扩展程序和网站处理哪些数据、存储在何处、我们的后端用途以及我们遵循的边界。",
    "title": "隐私政策",
    "intro": "本政策说明 MapsGrab 处理哪些数据、数据存储位置，以及哪些数据会传到服务器。浏览器扩展程序只处理公开展示的信息，结果保存在浏览器中。除云服务外，后端只负责配置、额度、可选的联系方式补全及最少量的使用日志；扩展程序不含广告或第三方追踪器。在线采集器、API 和 MCP 服务器的请求由服务器处理，在线采集结果保存在你的账号下，供后续下载。",
    "updatedLabel": "最后更新",
    "updatedAt": "2026 年 10 月 16 日",
    "updatedAtISO": "2026-10-16",
    "summary": "扩展程序和网站处理哪些数据、存储在哪里、我们的后端用于什么以及我们遵循的边界。",
    "helpTitle": "对这项政策有疑问吗？",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "结果存储位置",
        "text": "浏览器扩展程序和免费网页工具将数据保存在浏览器中；在线采集结果保存在账号下。"
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "什么到达我们的服务器",
        "text": "在线采集器、API 和 MCP 服务器请求，以及配置、账号与额度、可选的联系方式补全及最少量的使用日志。"
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "没有广告，没有跟踪器",
        "text": "扩展程序中没有第三方跟踪器，也不会出售或出租个人数据。"
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "数据删除",
        "text": "卸载扩展程序会删除本地数据；如需删除服务器上的账号数据，请发邮件联系我们。"
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "扩展程序处理的数据",
        "paragraphs": [
          "该扩展处理以下类别的数据："
        ],
        "items": [
          "公共商家数据 - 当您使用提取功能时，您访问的 Google Maps 页面上显示的信息（名称、地址、电话、网站、评级、评论、照片等）。",
          "您的设置 - 您配置的首选项（导出格式、字段选择、自动化开关、界面语言）。",
          "技术和交互数据：最少量的功能使用事件（功能使用次数、错误信息），用于适配 Google 页面变化，保持扩展程序可用。",
          "我们分配的账号标识：匿名设备标识符；登录后还包括账号邮箱、套餐或额度状态。"
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "数据存储位置",
        "paragraphs": [
          "使用扩展程序，设置、提取结果和批处理任务状态将存储在本地浏览器中（扩展程序本地存储和 IndexedDB）。除非您触发导出或下面描述的可选集成之一，否则它们永远不会离开您的设备。免费网络工具还会处理您在浏览器中输入的内容。",
          "Google Drive 和 HubSpot OAuth 令牌（如果您连接它们）也仅存储在您的浏览器中。",
          "在线采集器任务在服务器上运行，结果保存在你的账号下，可从控制台下载。"
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "我们的后端处理什么",
        "paragraphs": [
          "在线采集器、API 和 MCP 服务器请求均由服务器处理。服务器还管理这些服务的访问权限，包括 API 密钥和你批准的 MCP 客户端授权，并记录使用量。",
          "已授权的 MCP 客户端会收到其请求的结果。你可以在控制台中撤销授权。",
          "除了这些云服务之外，扩展程序和本网站还出于以下四个目的联系我们自己的服务器："
        ],
        "items": [
          "远程配置 — 页面结构预设，可在 Google 更改页面时保持提取正常进行。",
          "帐户和配额服务 - 登录、套餐状态和每月使用情况统计。",
          "邮箱和社交账号补全：启用此功能时，从已采集商家的网站上查找公开联系方式。",
          "使用日志记录——用于维护和改进服务的功能使用情况和错误的最少记录。"
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "可选的 Google Drive 和 HubSpot 集成",
        "paragraphs": [
          "仅当您在设置中明确连接它们时，导出的数据才会上传到您自己的 Google Drive 或同步到您自己的 HubSpot 帐户。这些集成使用您的授权，代表您行事，并且可以随时从扩展程序设置或您的 Google / HubSpot 帐户撤销。"
        ]
      },
      {
        "id": "website-analytics",
        "title": "网站分析",
        "paragraphs": [
          "本网站使用 Google Analytics 4 (GA4) 来衡量聚合页面使用情况。 GA4 是我们使用的唯一第三方分析，它仅在该网站上运行 - 扩展本身不包含任何分析。"
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "我们从来不做的事",
        "paragraphs": [
          "这些边界适用于扩展程序和网站："
        ],
        "items": [
          "没有广告。",
          "扩展程序中没有第三方跟踪器。",
          "不出售或出租个人数据。",
          "除了您从中提取的 Google Maps 页面之外，不会收集您的浏览历史记录。"
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "数据删除",
        "paragraphs": [
          "删除扩展会删除所有本地存储的数据。如果您希望删除您的后端帐户数据，请通过 support@mapsgrab.com 联系我们，我们会将其删除。"
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "本政策的变更",
        "paragraphs": [
          "当服务发生变化时，我们会更新此政策。上述日期反映的是最新版本，重大变更将在本网站上公布。"
        ]
      },
      {
        "id": "contact",
        "title": "联系我们",
        "paragraphs": [
          "有关隐私的问题或请求可以发送至 support@mapsgrab.com。"
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "授权 AI 应用 | MapsGrab",
  "title": "将 AI 应用连接到你的账号",
  "intro": "有应用正在请求访问你的 MapsGrab 账号。请仅在你主动发起此次连接时允许访问。",
  "loading": "正在加载连接请求……",
  "hostLabel": "应用地址",
  "selfDeclared": "应用自报名称：{name}",
  "loopbackTitle": "本地应用",
  "loopbackText": "此应用在电脑上运行，其地址无法表明开发者身份。请仅在你刚刚从可信应用中发起此次连接时允许访问。",
  "loopbackHost": "本机",
  "accountLabel": "当前登录账号",
  "switchAccount": "切换账号",
  "permissionsTitle": "允许后，此应用可以",
  "permissions": [
    "在 Google Maps 上搜索商家，并读取商家的评论和公开照片。",
    "使用你的 API 套餐每月请求额度。"
  ],
  "revokeNote": "你可以随时在 API 管理的“已连接应用”中断开连接。",
  "approve": "允许",
  "deny": "拒绝并返回 {host}",
  "denyLoopback": "拒绝并返回应用",
  "redirecting": "正在返回应用……",
  "invalidTitle": "连接请求无效或已过期",
  "invalidText": "请返回 AI 应用，重新发起连接。",
  "errorTitle": "无法完成此连接请求",
  "errorReasons": {
    "rate_limited": "来自当前网络的连接尝试过多。请等待几分钟后再试。",
    "invalid_client": "应用尚未注册，或注册信息不完整。",
    "invalid_redirect_uri": "应用提供的返回地址与其注册地址不一致。",
    "unsupported_response_type": "应用请求的授权类型不受支持。",
    "invalid_pkce": "应用未提供必要的安全校验（使用 S256 的 PKCE）。",
    "invalid_resource": "应用未请求访问 MapsGrab MCP 服务器，或请求了其他服务器。",
    "server_error": "MapsGrab 暂时无法保存此请求。请稍后重试。"
  },
  "errorHint": "请从 AI 应用中重新发起连接。如果问题持续，请联系应用开发者。",
  "signInTitle": "登录后继续",
  "signInText": "请登录你要连接的 MapsGrab 账号。此请求会保留，等待你完成登录。",
  "signIn": "登录",
  "loadFailed": "无法加载连接请求。请检查网络后重试。",
  "decideFailed": "无法完成此操作。请检查网络后重试。",
  "retry": "重试"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "付款已提交",
      "description": "正在确认付款，原标签页会自动更新。"
    },
    "confirmedCredits": {
      "title": "积分已到账",
      "description": "ClinkBill 付款已确认，积分已到账。你可以返回原标签页。"
    },
    "confirmedSubscription": {
      "title": "套餐已生效",
      "description": "ClinkBill 付款已确认，MapsGrab 套餐已生效。你可以返回原标签页。"
    },
    "failed": {
      "title": "付款需要进一步处理",
      "description": "我们无法确认该订单。返回到原始选项卡并重试。"
    }
  },
  "cancel": {
    "title": "付款已取消",
    "description": "没有完成付款。您可以返回并选择其他付款方式。"
  }
}
