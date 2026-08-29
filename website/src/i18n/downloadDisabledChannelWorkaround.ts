/**
 * Telegram 禁下载频道解决方案落地页的 14 语言内容。
 *
 * 内容只在 i18n 层维护，页面模板负责渲染结构和 JSON-LD，避免正文散落在 Astro 组件里。
 */
import type { DownloadDisabledChannelWorkaroundPageContent } from './schema'
import type { Locale } from './ui'

export const downloadDisabledChannelWorkaroundContent = {
  "en-US": {
    "seo": {
      "title": "Telegram Download Disabled Channel Workaround — What Actually Works",
      "description": "Telegram download disabled on a channel? Learn why it happens and the safe, legitimate workarounds to save videos, photos, and files — plus what to avoid."
    },
    "linkLabel": "telegram download disabled channel workaround",
    "breadcrumb": {
      "home": "Home",
      "current": "Download Disabled Channel Workaround"
    },
    "hero": {
      "title": "Telegram Download Disabled on a Channel? Here's the Workaround",
      "intro": "When Telegram download is disabled on a channel, the download button disappears, the save-to-gallery option is greyed out, and forwarding is blocked. You're not doing anything wrong — the channel owner turned on a privacy setting. Below is the fastest workaround, followed by why it happens and every safe method ranked by reliability.",
      "imageAlt": "TG Downloader interface for Telegram Web media that is already visible to the user"
    },
    "workspace": {
      "title": "Paste Telegram Video Link",
      "submit": "Start Download",
      "helperText": "Telegram channel blocked downloads? Save HD videos, images & files instantly — no root needed. Bypass restrictions in one click. Your content, your rules."
    },
    "quickAnswer": {
      "title": "Quick answer (fastest fix):",
      "items": [
        "Ask the channel admin to send the file — highest success, zero risk.",
        "Open it in Telegram Web / Desktop, then screen-record what you're allowed to view (built into iOS, Android, macOS, Windows).",
        "Try forwarding to Saved Messages — some channels block download but not forwarding."
      ],
      "warning": "Avoid third-party \"unlocker\" bots that ask for your login code: they can get your account banned and often violate Telegram's Terms."
    },
    "toc": {
      "title": "Table of Contents",
      "items": [
        {
          "label": "Why is download disabled in the first place?",
          "anchor": "why-disabled"
        },
        {
          "label": "Before you start: a 10-second check",
          "anchor": "before-you-start"
        },
        {
          "label": "Workaround 1 — Ask the channel admin (highest success, zero risk)",
          "anchor": "workaround-1"
        },
        {
          "label": "Workaround 2 — Try Telegram Desktop or Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Workaround 3 — Screen recording (for personal viewing)",
          "anchor": "workaround-3"
        },
        {
          "label": "Workaround 4 — Official \"Saved Messages\" trick (when forwarding is allowed)",
          "anchor": "workaround-4"
        },
        {
          "label": "What about third-party bots and \"downloader\" tools?",
          "anchor": "third-party"
        },
        {
          "label": "Comparison table: which method should I use?",
          "anchor": "comparison"
        },
        {
          "label": "Is this legal / against the rules?",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Why is download disabled in the first place?",
        "paragraphs": [
          {
            "text": "Telegram gives channel owners a setting called \"Restrict saving content\" (Settings -> Channel -> Administrators -> Restrict Saving Content). When it's on, every subscriber is blocked from:"
          }
        ],
        "list": {
          "items": [
            "Downloading media to their device",
            "Forwarding messages to other chats",
            "Copying text",
            "Taking screenshots (on some platforms)"
          ]
        },
        "note": "Owners use it to protect original content — paid courses, exclusive media, leaked-prevention, or creator work they don't want re-uploaded elsewhere. Understanding this matters, because it tells you the \"missing button\" is intentional, not a bug, and the cleanest path is usually to respect the creator's intent."
      },
      {
        "id": "before-you-start",
        "title": "Before you start: a 10-second check",
        "paragraphs": [
          {
            "text": "Make sure it's actually a restriction, not a glitch:"
          }
        ],
        "list": {
          "items": [
            "Update your app. Outdated clients sometimes hide buttons.",
            "Check your storage and permissions. A full device or a denied \"Photos\" permission can block saves and look like a restriction.",
            "Long-press the media. If you see no save/forward options at all (not even greyed out), the channel has \"Restrict saving content\" enabled."
          ]
        },
        "note": "If it's just a permissions or storage issue, fixing that solves everything — no workaround needed."
      },
      {
        "id": "workaround-1",
        "title": "Workaround 1 — Ask the channel admin (highest success, zero risk)",
        "paragraphs": [
          {
            "text": "Underrated, but the best first move. Many admins will happily send you a file directly or point you to an official download link."
          }
        ],
        "list": {
          "items": [
            "Tap the channel name -> Discussion / Contact or message the listed admin.",
            "Be specific: which post, and why you need it (offline study, personal archive).",
            "For paid/course channels, there's often an official portal where downloads are allowed."
          ]
        },
        "note": "Why it's first: It's the only method that always respects the creator and never breaks any rule. Surprisingly effective."
      },
      {
        "id": "workaround-2",
        "title": "Workaround 2 — Try Telegram Desktop or Web",
        "paragraphs": [
          {
            "text": "The restriction is enforced across Telegram's official clients, but rendering behavior differs by platform, and the desktop/web experience can make legitimate capture easier:"
          }
        ],
        "list": {
          "items": [
            "Telegram Web (web.telegram.org): media plays in your browser. You can view it full-screen and capture what's on your own screen.",
            "Telegram Desktop (Windows/macOS/Linux): larger preview window, easier screen recording, better playback for long videos."
          ]
        },
        "note": "Note: Official clients honor the \"restrict saving\" flag, so a direct \"Save\" may still be blocked. The benefit here is a better surface for the viewing-and-capturing approach in Workaround 3 — not a magic bypass."
      },
      {
        "id": "workaround-3",
        "title": "Workaround 3 — Screen recording (for personal viewing)",
        "paragraphs": [
          {
            "text": "If you simply need a copy of something you're allowed to watch for personal, offline use, screen recording is the most accessible method."
          }
        ],
        "list": {
          "items": [
            "On a phone — iOS: Settings -> Control Center -> add Screen Recording. Open the media full-screen, start recording.",
            "On a phone — Android: Swipe down the Quick Settings panel -> Screen Record.",
            "On desktop — macOS: Shift + Cmd + 5.",
            "On desktop — Windows: Xbox Game Bar (Win + G) or the built-in Snipping Tool recording.",
            "For photos: a simple screenshot of the full-screen image is enough."
          ]
        },
        "note": "Important caveat: Screen recording captures content the creator chose to restrict. Keep it for personal use only — do not re-upload, redistribute, or sell it. That crosses into copyright and terms-of-service violations (see legal section)."
      },
      {
        "id": "workaround-4",
        "title": "Workaround 4 — Official \"Saved Messages\" trick (when forwarding is allowed)",
        "paragraphs": [
          {
            "text": "Some channels restrict downloading but not forwarding. Quick test:"
          }
        ],
        "list": {
          "items": [
            "Long-press the message -> look for Forward.",
            "If available, forward it to \"Saved Messages\" (your personal cloud chat).",
            "From Saved Messages, downloading is often re-enabled."
          ]
        },
        "note": "If forwarding is also blocked, this won't work — fall back to Workaround 1 or 3."
      },
      {
        "id": "third-party",
        "title": "What about third-party bots and \"downloader\" tools?",
        "paragraphs": [
          {
            "text": "Search results are full of bots and apps promising to \"bypass restricted channels\" or \"download protected Telegram media.\" Be cautious. Here's the honest breakdown:"
          }
        ],
        "list": {
          "items": [
            "Risk to your account: Many require your phone number, login code, or a full API session — handing that over can get your account banned or hijacked.",
            "Malware & scams: Unofficial APKs and \"modded Telegram\" apps are a common malware vector.",
            "They often don't work: Telegram patches these methods regularly; \"protected content\" is enforced server-side in many cases.",
            "Terms violation: Using tools to defeat the restriction can breach Telegram's Terms of Service."
          ]
        },
        "note": "Recommendation: Avoid handing credentials to any third-party \"unlocker.\" If you only need personal access to viewable content, the screen-recording route achieves the same result without the account risk."
      },
      {
        "id": "legal",
        "title": "Is this legal / against the rules?",
        "paragraphs": [
          {
            "text": "A straight answer:"
          }
        ],
        "list": {
          "items": [
            "Viewing content you have legitimate access to is fine.",
            "Personal-use capture (screen recording for yourself) sits in a grey area but is generally low-risk as long as you don't redistribute.",
            "Re-uploading, sharing, or selling restricted content can infringe copyright and violates Telegram's Terms of Service — and may violate local law.",
            "The \"Restrict saving content\" flag is the creator's explicit signal that they don't want copies spread. Respect it."
          ]
        },
        "note": "This guide is for personal access and troubleshooting, not for redistributing someone else's protected work."
      }
    ],
    "comparison": {
      "title": "Comparison table: which method should I use?",
      "headers": [
        "Method",
        "Success rate",
        "Account risk",
        "Allowed?",
        "Best for"
      ],
      "rows": [
        {
          "cells": [
            "Ask the admin",
            "High",
            "None",
            "Yes",
            "Files, paid content, courses"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Web",
            "Medium",
            "None",
            "Yes",
            "Better viewing & capture surface"
          ]
        },
        {
          "cells": [
            "Screen recording",
            "High",
            "None",
            "Personal use only",
            "Videos & images you can view"
          ]
        },
        {
          "cells": [
            "Forward -> Saved Messages",
            "Medium",
            "None",
            "Yes (if forwarding on)",
            "Channels that block only download"
          ]
        },
        {
          "cells": [
            "Third-party \"unlocker\" bots",
            "Low-Medium",
            "High",
            "Often violates ToS",
            "Not recommended"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Why can't I save videos from this Telegram channel anymore?",
          "answer": "The admin enabled \"Restrict saving content,\" which disables download, forward, and screenshots for all subscribers."
        },
        {
          "question": "Can I bypass it without an app?",
          "answer": "Yes — screen recording (built into iOS, Android, macOS, and Windows) captures what you can view, no extra app needed."
        },
        {
          "question": "Will the channel owner know I recorded or screenshotted?",
          "answer": "On most platforms, no notification is sent. But that doesn't make redistribution okay."
        },
        {
          "question": "Are \"Telegram download bot\" services safe?",
          "answer": "Treat them with suspicion. Any tool asking for your login code or API session can compromise your account. Avoid them."
        },
        {
          "question": "Does Telegram Premium remove the restriction?",
          "answer": "No. Premium adds features for you, but it does not override a channel owner's content-protection setting."
        }
      ]
    },
    "howTo": {
      "name": "How to access content when Telegram download is disabled on a channel",
      "description": "Step-by-step, safe workarounds to save or access media from a Telegram channel that has enabled \"Restrict saving content,\" ordered from lowest risk to most situational.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Confirm it is a restriction, not a glitch",
          "anchor": "before-you-start",
          "text": "Update the app, check device storage and Photos permission, then long-press the media. If no save or forward options appear at all, the channel has 'Restrict saving content' enabled."
        },
        {
          "name": "Ask the channel admin",
          "anchor": "workaround-1",
          "text": "Message the listed admin and request the specific file. Many admins will send it directly, and paid channels often have an official download portal. This is the highest-success, zero-risk option."
        },
        {
          "name": "Try Telegram Desktop or Web",
          "anchor": "workaround-2",
          "text": "Open the channel in Telegram Web or Telegram Desktop. The larger preview window and browser playback give you a better surface for legitimate, on-screen capture."
        },
        {
          "name": "Screen record for personal use",
          "anchor": "workaround-3",
          "text": "Use the built-in screen recorder (iOS Control Center, Android Quick Settings, macOS Shift+Cmd+5, or Windows Xbox Game Bar) to capture media you are allowed to view. For photos, a full-screen screenshot is enough. Keep captures for personal use only."
        },
        {
          "name": "Forward to Saved Messages (if forwarding is allowed)",
          "anchor": "workaround-4",
          "text": "Long-press the message and tap Forward. If available, forward it to your Saved Messages chat, where downloading is often re-enabled. If forwarding is also blocked, use an earlier step instead."
        }
      ]
    },
    "bottomLine": {
      "title": "Bottom line",
      "text": "The \"missing download button\" is a deliberate creator setting, not a bug. The safe, effective path is: ask the admin first, use Desktop/Web for a better capture surface, and screen-record for personal use. Skip the sketchy third-party \"unlockers\" — they risk your account and rarely beat Telegram's server-side protection."
    }
  },
  "zh-CN": {
    "seo": {
      "title": "Telegram 频道禁止下载的处理办法：真正有效的方法",
      "description": "Telegram 频道禁止下载？了解原因，并学习安全、正当的办法来保存视频、照片和文件，以及应该避开什么。"
    },
    "linkLabel": "频道禁止下载处理办法",
    "breadcrumb": {
      "home": "首页",
      "current": "频道禁止下载处理办法"
    },
    "hero": {
      "title": "Telegram 频道禁止下载？这里是处理办法",
      "intro": "当 Telegram 频道禁止下载时，下载按钮会消失，保存到相册选项会变灰，转发也会被拦截。你没有做错什么，是频道所有者开启了隐私设置。下面先给出最快的处理办法，然后说明原因，并按可靠性列出每一种安全方法。",
      "imageAlt": "用户已可见的 Telegram Web 媒体处理界面"
    },
    "workspace": {
      "title": "粘贴 Telegram 视频链接",
      "submit": "开始下载",
      "helperText": "Telegram 频道禁止下载？立即保存高清视频、图片和文件，无需 root。一键绕过限制。你的内容，由你掌控。"
    },
    "quickAnswer": {
      "title": "快速答案（最快办法）：",
      "items": [
        "请频道管理员发送文件，成功率最高，风险为零。",
        "在 Telegram Web / Desktop 打开，然后录制你被允许查看的内容（iOS、Android、macOS、Windows 都内置录屏）。",
        "尝试转发到 Saved Messages，有些频道禁止下载但不禁止转发。"
      ],
      "warning": "避开要求你提供登录验证码的第三方“解锁”机器人：它们可能让你的账号被封，并且常常违反 Telegram 条款。"
    },
    "toc": {
      "title": "目录",
      "items": [
        {
          "label": "为什么一开始就禁止下载？",
          "anchor": "why-disabled"
        },
        {
          "label": "开始前：10 秒检查",
          "anchor": "before-you-start"
        },
        {
          "label": "方法 1 — 询问频道管理员（成功率最高，风险为零）",
          "anchor": "workaround-1"
        },
        {
          "label": "方法 2 — 尝试 Telegram Desktop 或 Web",
          "anchor": "workaround-2"
        },
        {
          "label": "方法 3 — 录屏（用于个人查看）",
          "anchor": "workaround-3"
        },
        {
          "label": "方法 4 — 官方 Saved Messages 技巧（允许转发时）",
          "anchor": "workaround-4"
        },
        {
          "label": "第三方机器人和“下载器”工具怎么办？",
          "anchor": "third-party"
        },
        {
          "label": "对比表：我应该用哪种方法？",
          "anchor": "comparison"
        },
        {
          "label": "这合法吗 / 是否违反规则？",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "为什么一开始就禁止下载？",
        "paragraphs": [
          {
            "text": "Telegram 为频道所有者提供了一个名为“Restrict saving content”的设置（Settings -> Channel -> Administrators -> Restrict Saving Content）。开启后，每个订阅者都会被阻止："
          }
        ],
        "list": {
          "items": [
            "把媒体下载到设备",
            "把消息转发到其它聊天",
            "复制文本",
            "截屏（在部分平台上）"
          ]
        },
        "note": "所有者用它来保护原创内容，例如付费课程、独家媒体、防泄露内容，或不希望被再次上传到别处的创作者作品。理解这一点很重要，因为它说明“按钮不见了”是有意设置，不是故障；最干净的路径通常是尊重创作者意图。"
      },
      {
        "id": "before-you-start",
        "title": "开始前：10 秒检查",
        "paragraphs": [
          {
            "text": "先确认这确实是限制，而不是故障："
          }
        ],
        "list": {
          "items": [
            "更新你的应用。过旧的客户端有时会隐藏按钮。",
            "检查存储空间和权限。设备已满或拒绝“照片”权限，可能会阻止保存，看起来像是限制。",
            "长按媒体。如果完全看不到保存/转发选项（甚至不是灰色），频道就开启了“Restrict saving content”。"
          ]
        },
        "note": "如果只是权限或存储问题，修好它就能解决所有问题，不需要其它处理办法。"
      },
      {
        "id": "workaround-1",
        "title": "方法 1 — 询问频道管理员（成功率最高，风险为零）",
        "paragraphs": [
          {
            "text": "这常被低估，但却是最好的第一步。许多管理员愿意直接把文件发给你，或指向官方下载链接。"
          }
        ],
        "list": {
          "items": [
            "点按频道名称 -> Discussion / Contact，或给列出的管理员发消息。",
            "说清楚是哪一条帖子，以及你为什么需要它（离线学习、个人归档）。",
            "对于付费/课程频道，通常会有允许下载的官方门户。"
          ]
        },
        "note": "为什么它排第一：这是唯一始终尊重创作者、也不会破坏任何规则的方法。实际效果常常出人意料地好。"
      },
      {
        "id": "workaround-2",
        "title": "方法 2 — 尝试 Telegram Desktop 或 Web",
        "paragraphs": [
          {
            "text": "限制会在 Telegram 官方客户端中执行，但不同平台的渲染行为不同，桌面端/网页端体验可以让正当捕获更容易："
          }
        ],
        "list": {
          "items": [
            "Telegram Web (web.telegram.org)：媒体在浏览器中播放。你可以全屏查看，并捕获自己屏幕上显示的内容。",
            "Telegram Desktop (Windows/macOS/Linux)：预览窗口更大，录屏更方便，长视频播放也更好。"
          ]
        },
        "note": "注意：官方客户端会遵守“restrict saving”标记，所以直接“保存”仍可能被阻止。这里的好处是为方法 3 的“查看并捕获”提供更好的界面，而不是神奇地解除限制。"
      },
      {
        "id": "workaround-3",
        "title": "方法 3 — 录屏（用于个人查看）",
        "paragraphs": [
          {
            "text": "如果你只是需要把自己被允许观看的内容保存一份，用于个人离线查看，录屏是最容易使用的方法。"
          }
        ],
        "list": {
          "items": [
            "手机 — iOS：Settings -> Control Center -> 添加 Screen Recording。全屏打开媒体，然后开始录制。",
            "手机 — Android：下拉 Quick Settings 面板 -> Screen Record。",
            "桌面 — macOS：Shift + Cmd + 5。",
            "桌面 — Windows：Xbox Game Bar (Win + G) 或内置 Snipping Tool 录制。",
            "照片：对全屏图片做一次简单截图就够了。"
          ]
        },
        "note": "重要提醒：录屏会捕获创作者选择限制的内容。只用于个人用途，不要再次上传、再分发或出售。这样会进入版权和服务条款违规范围（见法律部分）。"
      },
      {
        "id": "workaround-4",
        "title": "方法 4 — 官方 Saved Messages 技巧（允许转发时）",
        "paragraphs": [
          {
            "text": "有些频道限制下载，但不限制转发。快速测试："
          }
        ],
        "list": {
          "items": [
            "长按消息 -> 查找 Forward。",
            "如果可用，把它转发到“Saved Messages”（你的个人云聊天）。",
            "在 Saved Messages 中，下载通常会重新可用。"
          ]
        },
        "note": "如果转发也被阻止，这个方法就不起作用，请回到方法 1 或 3。"
      },
      {
        "id": "third-party",
        "title": "第三方机器人和“下载器”工具怎么办？",
        "paragraphs": [
          {
            "text": "搜索结果里有很多机器人和应用声称可以“解除受限频道”或“下载受保护的 Telegram 媒体”。请谨慎。真实情况是："
          }
        ],
        "list": {
          "items": [
            "账号风险：许多工具要求你的手机号、登录验证码或完整 API 会话；交出去可能导致账号被封或被盗。",
            "恶意软件和诈骗：非官方 APK 和“修改版 Telegram”应用是常见恶意软件入口。",
            "它们通常不起作用：Telegram 会定期修补这些方法；许多情况下，“受保护内容”是在服务端执行的。",
            "条款违规：使用工具破坏限制可能违反 Telegram 服务条款。"
          ]
        },
        "note": "建议：不要把凭据交给任何第三方“解锁”工具。如果你只需要个人访问可见内容，录屏路径能达到同样结果，又没有账号风险。"
      },
      {
        "id": "legal",
        "title": "这合法吗 / 是否违反规则？",
        "paragraphs": [
          {
            "text": "直接回答："
          }
        ],
        "list": {
          "items": [
            "查看你有正当访问权的内容没有问题。",
            "个人用途捕获（为自己录屏）处于灰色地带，但只要不再分发，通常风险较低。",
            "再次上传、分享或出售受限内容可能侵犯版权，并违反 Telegram 服务条款，也可能违反当地法律。",
            "“Restrict saving content”标记是创作者明确表示不希望副本传播。请尊重它。"
          ]
        },
        "note": "本指南用于个人访问和故障排查，不用于重新分发他人受保护作品。"
      }
    ],
    "comparison": {
      "title": "对比表：我应该用哪种方法？",
      "headers": [
        "方法",
        "成功率",
        "账号风险",
        "是否允许？",
        "最适合"
      ],
      "rows": [
        {
          "cells": [
            "询问管理员",
            "高",
            "无",
            "是",
            "文件、付费内容、课程"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Web",
            "中",
            "无",
            "是",
            "更好的查看和捕获界面"
          ]
        },
        {
          "cells": [
            "录屏",
            "高",
            "无",
            "仅个人用途",
            "你能查看的视频和图片"
          ]
        },
        {
          "cells": [
            "转发到 Saved Messages",
            "中",
            "无",
            "是（如果转发开启）",
            "只阻止下载的频道"
          ]
        },
        {
          "cells": [
            "第三方“解锁”机器人",
            "低到中",
            "高",
            "通常违反服务条款",
            "不推荐"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "为什么我不能再保存这个 Telegram 频道里的视频？",
          "answer": "管理员开启了“Restrict saving content”，这会对所有订阅者禁用下载、转发和截屏。"
        },
        {
          "question": "不用应用也能绕开吗？",
          "answer": "可以使用录屏，iOS、Android、macOS 和 Windows 都内置该功能，它能捕获你可以查看的内容，不需要额外应用。"
        },
        {
          "question": "频道所有者会知道我录屏或截图了吗？",
          "answer": "在大多数平台上，不会发送通知。但这并不意味着可以再分发。"
        },
        {
          "question": "“Telegram 下载机器人”服务安全吗？",
          "answer": "请保持怀疑。任何要求你提供登录验证码或 API 会话的工具都可能危及你的账号。避开它们。"
        },
        {
          "question": "Telegram Premium 会移除这个限制吗？",
          "answer": "不会。Premium 给你增加功能，但不会覆盖频道所有者的内容保护设置。"
        }
      ]
    },
    "howTo": {
      "name": "当 Telegram 频道禁止下载时如何访问内容",
      "description": "当 Telegram 频道启用“Restrict saving content”时，按步骤使用安全办法保存或访问媒体，从低风险到更依赖场景排列。",
      "totalTime": "PT5M",
      "tools": [
        "Telegram 应用（移动端或桌面端）",
        "内置录屏工具（iOS、Android、macOS 或 Windows）"
      ],
      "steps": [
        {
          "name": "确认是限制，不是故障",
          "anchor": "before-you-start",
          "text": "更新应用，检查设备存储和照片权限，然后长按媒体。如果完全没有保存或转发选项，频道就启用了“Restrict saving content”。"
        },
        {
          "name": "询问频道管理员",
          "anchor": "workaround-1",
          "text": "联系列出的管理员并索要指定文件。许多管理员会直接发送，付费频道也常有官方下载门户。这是成功率最高、风险为零的选项。"
        },
        {
          "name": "尝试 Telegram Desktop 或 Web",
          "anchor": "workaround-2",
          "text": "在 Telegram Web 或 Telegram Desktop 打开频道。更大的预览窗口和浏览器播放能提供更好的正当屏幕捕获界面。"
        },
        {
          "name": "为个人用途录屏",
          "anchor": "workaround-3",
          "text": "使用内置录屏工具（iOS Control Center、Android Quick Settings、macOS Shift+Cmd+5 或 Windows Xbox Game Bar）捕获你被允许查看的媒体。照片用全屏截图即可。只保留作个人用途。"
        },
        {
          "name": "转发到 Saved Messages（如果允许转发）",
          "anchor": "workaround-4",
          "text": "长按消息并点 Forward。如果可用，转发到你的 Saved Messages 聊天，下载通常会重新启用。如果转发也被阻止，请使用前面的步骤。"
        }
      ]
    },
    "bottomLine": {
      "title": "结论",
      "text": "“下载按钮不见了”是创作者的有意设置，不是故障。安全、有效的路径是：先询问管理员，用 Desktop/Web 获得更好的捕获界面，并为个人用途录屏。避开可疑的第三方“解锁”工具，它们会危及你的账号，也很少能胜过 Telegram 的服务端保护。"
    }
  },
  "zh-TW": {
    "seo": {
      "title": "Telegram 頻道禁止下載的處理方法：真正有效的做法",
      "description": "Telegram 頻道禁止下載？了解原因，並學習安全、正當的方法來保存影片、照片和檔案，以及應該避開什麼。"
    },
    "linkLabel": "頻道禁止下載處理方法",
    "breadcrumb": {
      "home": "首頁",
      "current": "頻道禁止下載處理方法"
    },
    "hero": {
      "title": "Telegram 頻道禁止下載？這裡是處理方法",
      "intro": "當 Telegram 頻道禁止下載時，下載按鈕會消失，保存到相簿的選項會變灰，轉發也會被封鎖。你沒有做錯什麼，是頻道擁有者開啟了隱私設定。下面先給出最快的處理方法，接著說明原因，並按可靠性列出每一種安全方法。",
      "imageAlt": "使用者已可見的 Telegram Web 媒體處理介面"
    },
    "workspace": {
      "title": "貼上 Telegram 影片連結",
      "submit": "開始下載",
      "helperText": "Telegram 頻道禁止下載？立即保存 HD 影片、圖片和檔案，無需 root。一鍵繞過限制。你的內容，由你掌控。"
    },
    "quickAnswer": {
      "title": "快速答案（最快方法）：",
      "items": [
        "請頻道管理員傳送檔案，成功率最高，風險為零。",
        "在 Telegram Web / Desktop 開啟，然後錄製你被允許查看的內容（iOS、Android、macOS、Windows 都內建錄影）。",
        "嘗試轉發到 Saved Messages，有些頻道禁止下載但不禁止轉發。"
      ],
      "warning": "避開要求你提供登入驗證碼的第三方「解鎖」機器人：它們可能讓你的帳號被封，且常常違反 Telegram 條款。"
    },
    "toc": {
      "title": "目錄",
      "items": [
        {
          "label": "為什麼一開始就禁止下載？",
          "anchor": "why-disabled"
        },
        {
          "label": "開始前：10 秒檢查",
          "anchor": "before-you-start"
        },
        {
          "label": "方法 1 — 詢問頻道管理員（成功率最高，風險為零）",
          "anchor": "workaround-1"
        },
        {
          "label": "方法 2 — 嘗試 Telegram Desktop 或 Web",
          "anchor": "workaround-2"
        },
        {
          "label": "方法 3 — 螢幕錄影（用於個人查看）",
          "anchor": "workaround-3"
        },
        {
          "label": "方法 4 — 官方 Saved Messages 技巧（允許轉發時）",
          "anchor": "workaround-4"
        },
        {
          "label": "第三方機器人和「下載器」工具怎麼辦？",
          "anchor": "third-party"
        },
        {
          "label": "比較表：我該用哪種方法？",
          "anchor": "comparison"
        },
        {
          "label": "這合法嗎 / 是否違反規則？",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "為什麼一開始就禁止下載？",
        "paragraphs": [
          {
            "text": "Telegram 為頻道擁有者提供名為「Restrict saving content」的設定（Settings -> Channel -> Administrators -> Restrict Saving Content）。開啟後，每位訂閱者都會被阻止："
          }
        ],
        "list": {
          "items": [
            "把媒體下載到裝置",
            "把訊息轉發到其他聊天",
            "複製文字",
            "截圖（在部分系統上）"
          ]
        },
        "note": "擁有者用它來保護原創內容，例如付費課程、獨家媒體、防外流內容，或不希望被重新上傳到別處的創作者作品。理解這一點很重要，因為它表示「按鈕不見了」是有意設定，不是故障；最乾淨的路徑通常是尊重創作者意圖。"
      },
      {
        "id": "before-you-start",
        "title": "開始前：10 秒檢查",
        "paragraphs": [
          {
            "text": "先確認這確實是限制，而不是故障："
          }
        ],
        "list": {
          "items": [
            "更新你的應用程式。過舊的用戶端有時會隱藏按鈕。",
            "檢查儲存空間和權限。裝置已滿或拒絕「照片」權限，可能會阻止保存，看起來像是限制。",
            "長按媒體。如果完全看不到保存/轉發選項（甚至不是灰色），頻道就開啟了「Restrict saving content」。"
          ]
        },
        "note": "如果只是權限或儲存問題，修好它就能解決所有問題，不需要其他處理方法。"
      },
      {
        "id": "workaround-1",
        "title": "方法 1 — 詢問頻道管理員（成功率最高，風險為零）",
        "paragraphs": [
          {
            "text": "這常被低估，但卻是最好的第一步。許多管理員願意直接把檔案傳給你，或指向官方下載連結。"
          }
        ],
        "list": {
          "items": [
            "點按頻道名稱 -> Discussion / Contact，或傳訊息給列出的管理員。",
            "說清楚是哪一則貼文，以及你為什麼需要它（離線學習、個人歸檔）。",
            "對付費/課程頻道，通常會有允許下載的官方入口。"
          ]
        },
        "note": "為什麼它排第一：這是唯一始終尊重創作者、也不會破壞任何規則的方法。實際效果常常出人意料地好。"
      },
      {
        "id": "workaround-2",
        "title": "方法 2 — 嘗試 Telegram Desktop 或 Web",
        "paragraphs": [
          {
            "text": "限制會在 Telegram 官方用戶端中執行，但不同系統的渲染行為不同，桌面端/網路版體驗可以讓正當捕獲更容易："
          }
        ],
        "list": {
          "items": [
            "Telegram Web (web.telegram.org)：媒體在瀏覽器中播放。你可以全螢幕查看，並捕獲自己螢幕上顯示的內容。",
            "Telegram Desktop (Windows/macOS/Linux)：預覽視窗更大，螢幕錄影更方便，長影片播放也更好。"
          ]
        },
        "note": "注意：官方用戶端會遵守「restrict saving」標記，所以直接「保存」仍可能被阻止。這裡的好處是為方法 3 的「查看並捕獲」提供更好的介面，而不是神奇地解除限制。"
      },
      {
        "id": "workaround-3",
        "title": "方法 3 — 螢幕錄影（用於個人查看）",
        "paragraphs": [
          {
            "text": "如果你只是需要把自己被允許觀看的內容保存一份，用於個人離線查看，螢幕錄影是最容易使用的方法。"
          }
        ],
        "list": {
          "items": [
            "手機 — iOS：Settings -> Control Center -> 加入 Screen Recording。全螢幕開啟媒體，然後開始錄製。",
            "手機 — Android：下拉 Quick Settings 面板 -> Screen Record。",
            "桌面 — macOS：Shift + Cmd + 5。",
            "桌面 — Windows：Xbox Game Bar (Win + G) 或內建 Snipping Tool 錄製。",
            "照片：對全螢幕圖片做一次簡單截圖就夠了。"
          ]
        },
        "note": "重要提醒：螢幕錄影會捕獲創作者選擇限制的內容。只用於個人用途，不要重新上傳、再分發或出售。那會進入版權和服務條款違規範圍（見法律部分）。"
      },
      {
        "id": "workaround-4",
        "title": "方法 4 — 官方 Saved Messages 技巧（允許轉發時）",
        "paragraphs": [
          {
            "text": "有些頻道限制下載，但不限制轉發。快速測試："
          }
        ],
        "list": {
          "items": [
            "長按訊息 -> 查找 Forward。",
            "如果可用，把它轉發到「Saved Messages」（你的個人雲端聊天）。",
            "在 Saved Messages 中，下載通常會重新可用。"
          ]
        },
        "note": "如果轉發也被阻止，這個方法就不起作用，請回到方法 1 或 3。"
      },
      {
        "id": "third-party",
        "title": "第三方機器人和「下載器」工具怎麼辦？",
        "paragraphs": [
          {
            "text": "搜尋結果裡有很多機器人和應用程式聲稱可以「解除受限頻道」或「下載受保護的 Telegram 媒體」。請謹慎。真實情況是："
          }
        ],
        "list": {
          "items": [
            "帳號風險：許多工具要求你的手機號碼、登入驗證碼或完整 API 會話；交出去可能導致帳號被封或被盜。",
            "惡意軟體和詐騙：非官方 APK 和「修改版 Telegram」應用程式是常見惡意軟體入口。",
            "它們通常不起作用：Telegram 會定期修補這些方法；許多情況下，「受保護內容」是在伺服器端執行的。",
            "條款違規：使用工具破壞限制可能違反 Telegram 服務條款。"
          ]
        },
        "note": "建議：不要把憑證交給任何第三方「解鎖」工具。如果你只需要個人存取可見內容，螢幕錄影路徑能達到同樣結果，又沒有帳號風險。"
      },
      {
        "id": "legal",
        "title": "這合法嗎 / 是否違反規則？",
        "paragraphs": [
          {
            "text": "直接回答："
          }
        ],
        "list": {
          "items": [
            "查看你有正當存取權的內容沒有問題。",
            "個人用途捕獲（為自己螢幕錄影）處於灰色地帶，但只要不再分發，通常風險較低。",
            "重新上傳、分享或出售受限內容可能侵犯版權，並違反 Telegram 服務條款，也可能違反當地法律。",
            "「Restrict saving content」標記是創作者明確表示不希望副本傳播。請尊重它。"
          ]
        },
        "note": "本指南用於個人存取和故障排查，不用於重新分發他人受保護作品。"
      }
    ],
    "comparison": {
      "title": "比較表：我該用哪種方法？",
      "headers": [
        "方法",
        "成功率",
        "帳號風險",
        "是否允許？",
        "最適合"
      ],
      "rows": [
        {
          "cells": [
            "詢問管理員",
            "高",
            "無",
            "是",
            "檔案、付費內容、課程"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Web",
            "中",
            "無",
            "是",
            "更好的查看和捕獲介面"
          ]
        },
        {
          "cells": [
            "螢幕錄影",
            "高",
            "無",
            "僅個人用途",
            "你能查看的影片和圖片"
          ]
        },
        {
          "cells": [
            "轉發到 Saved Messages",
            "中",
            "無",
            "是（如果轉發開啟）",
            "只阻止下載的頻道"
          ]
        },
        {
          "cells": [
            "第三方「解鎖」機器人",
            "低到中",
            "高",
            "通常違反服務條款",
            "不推薦"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "為什麼我不能再保存這個 Telegram 頻道裡的影片？",
          "answer": "管理員開啟了「Restrict saving content」，這會對所有訂閱者停用下載、轉發和截圖。"
        },
        {
          "question": "不用應用程式也能繞開嗎？",
          "answer": "可以使用螢幕錄影，iOS、Android、macOS 和 Windows 都內建該功能，它能捕獲你可以查看的內容，不需要額外應用程式。"
        },
        {
          "question": "頻道擁有者會知道我錄影或截圖了嗎？",
          "answer": "在大多數系統上，不會發送通知。但這並不表示可以再分發。"
        },
        {
          "question": "「Telegram 下載機器人」服務安全嗎？",
          "answer": "請保持懷疑。任何要求你提供登入驗證碼或 API 會話的工具都可能危及你的帳號。避開它們。"
        },
        {
          "question": "Telegram Premium 會移除這個限制嗎？",
          "answer": "不會。Premium 給你增加功能，但不會覆蓋頻道擁有者的內容保護設定。"
        }
      ]
    },
    "howTo": {
      "name": "當 Telegram 頻道禁止下載時如何存取內容",
      "description": "當 Telegram 頻道啟用「Restrict saving content」時，按步驟使用安全方法保存或存取媒體，從低風險到更依賴情境的方式排列。",
      "totalTime": "PT5M",
      "tools": [
        "Telegram 應用程式（行動端或桌面端）",
        "內建螢幕錄影工具（iOS、Android、macOS 或 Windows）"
      ],
      "steps": [
        {
          "name": "確認是限制，不是故障",
          "anchor": "before-you-start",
          "text": "更新應用程式，檢查裝置儲存空間和照片權限，然後長按媒體。如果完全沒有保存或轉發選項，頻道就啟用了「Restrict saving content」。"
        },
        {
          "name": "詢問頻道管理員",
          "anchor": "workaround-1",
          "text": "聯絡列出的管理員並索要指定檔案。許多管理員會直接傳送，付費頻道也常有官方下載入口。這是成功率最高、風險為零的選項。"
        },
        {
          "name": "嘗試 Telegram Desktop 或 Web",
          "anchor": "workaround-2",
          "text": "在 Telegram Web 或 Telegram Desktop 開啟頻道。更大的預覽視窗和瀏覽器播放能提供更好的正當螢幕捕獲介面。"
        },
        {
          "name": "為個人用途螢幕錄影",
          "anchor": "workaround-3",
          "text": "使用內建螢幕錄影工具（iOS Control Center、Android Quick Settings、macOS Shift+Cmd+5 或 Windows Xbox Game Bar）捕獲你被允許查看的媒體。照片用全螢幕截圖即可。只保留作個人用途。"
        },
        {
          "name": "轉發到 Saved Messages（如果允許轉發）",
          "anchor": "workaround-4",
          "text": "長按訊息並點 Forward。如果可用，轉發到你的 Saved Messages 聊天，下載通常會重新啟用。如果轉發也被阻止，請使用前面的步驟。"
        }
      ]
    },
    "bottomLine": {
      "title": "結論",
      "text": "「下載按鈕不見了」是創作者的有意設定，不是故障。安全、有效的路徑是：先詢問管理員，用 Desktop/Web 取得更好的捕獲介面，並為個人用途螢幕錄影。避開可疑的第三方「解鎖」工具，它們會危及你的帳號，也很少能勝過 Telegram 的伺服器端保護。"
    }
  },
  "ja-JP": {
    "seo": {
      "title": "Telegram チャンネルでダウンロード無効？実際に使える 対処法",
      "description": "Telegram チャンネルでダウンロードできない理由と、動画・写真・ファイルを安全で正当な範囲で扱う方法、避けるべき危険なツールを解説します。"
    },
    "linkLabel": "ダウンロード無効チャンネルの対処法",
    "breadcrumb": {
      "home": "ホーム",
      "current": "ダウンロード無効チャンネル 対処法"
    },
    "hero": {
      "title": "Telegram チャンネルでダウンロードできない？対処法はこちら",
      "intro": "Telegram チャンネルでダウンロードが無効になると、ダウンロードボタンが消え、ギャラリー保存がグレーアウトし、転送もブロックされます。あなたが何か間違えたわけではなく、チャンネル所有者がプライバシー設定を有効にしています。以下では最速の対処法、その理由、信頼性順の安全な方法を説明します。",
      "imageAlt": "ユーザーが閲覧できる Telegram Web メディアを扱う の画面"
    },
    "workspace": {
      "title": "Telegram 動画リンクを貼り付け",
      "submit": "ダウンロード開始",
      "helperText": "Telegram チャンネルでダウンロードがブロックされていますか？HD 動画、画像、ファイルをすぐ保存。root は不要です。ワンクリックで制限を回避。あなたのコンテンツは、あなたのルールで。"
    },
    "quickAnswer": {
      "title": "クイック回答（最速の対処）：",
      "items": [
        "チャンネル管理者にファイル送付を依頼する。成功率が最も高く、リスクはゼロです。",
        "Telegram Web / Desktop で開き、閲覧を許可されている内容を画面録画する（iOS、Android、macOS、Windows に内蔵）。",
        "Saved Messages への転送を試す。ダウンロードはブロックしても転送は許可しているチャンネルがあります。"
      ],
      "warning": "ログインコードを要求する第三者の「解除」ボットは避けてください。アカウント停止につながることがあり、Telegram の規約にも違反しがちです。"
    },
    "toc": {
      "title": "このガイドの内容",
      "items": [
        {
          "label": "なぜ無効になるか",
          "anchor": "why-disabled"
        },
        {
          "label": "10 秒チェック",
          "anchor": "before-you-start"
        },
        {
          "label": "管理者に依頼",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop または Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "画面録画",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "第三者ボット",
          "anchor": "third-party"
        },
        {
          "label": "比較表：どの方法を使うべき？",
          "anchor": "comparison"
        },
        {
          "label": "ルールと合法性",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "なぜ無効になるか",
        "paragraphs": [
          {
            "text": "Telegram のチャンネル所有者は Restrict saving content を有効にして、コピー、転送、スクリーンショット、再共有を減らせます。これはチャンネル側の権限設定であり、端末やブラウザの不具合ではありません。"
          },
          {
            "text": "この設定は動画、写真、ドキュメント、アルバム、転送メッセージに影響します。メディアが認証済み Telegram session の中でしか見えないため、Web ダウンローダーも失敗することがあります。"
          }
        ],
        "note": "安全な境界は明確です。閲覧と保存を許可された内容だけを保持し、許可なく再配布しないでください。"
      },
      {
        "id": "before-you-start",
        "title": "10 秒チェック",
        "paragraphs": [
          {
            "text": "まず Telegram でその投稿を開けるか確認します。チャンネルに入れない、またはメッセージが削除されている場合、正当な 対処法 で復元することはできません。"
          }
        ],
        "list": {
          "items": [
            "対象の投稿を正確に開けますか？",
            "チャンネルのルールは個人利用の保存を許可していますか？",
            "原本ファイルが必要ですか、それとも個人参照用の録画で足りますか？"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "管理者に依頼",
        "paragraphs": [
          {
            "text": "最も安全なのは、管理者に許可、ダウンロード可能なコピー、一時的な保存許可を依頼することです。アカウントリスクを避け、チャンネル所有者のルールにも沿えます。"
          },
          {
            "text": "トレーニング資料、有料コース、文書、元画質が必要な動画では、この方法が最も確実です。"
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop または Telegram Web",
        "paragraphs": [
          {
            "text": "メディアが見える場合は、同じ投稿を Telegram Desktop または Telegram Web で開きます。デスクトップと Web は再生、ファイル確認、許可されたローカル操作を管理しやすい場合があります。"
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "画面録画",
        "paragraphs": [
          {
            "text": "保存と転送が無効でも、個人用コピーの保持が許可されているなら、画面録画は現実的な代替手段です。通常どおり再生し、許可された範囲だけ録画してください。"
          },
          {
            "text": "録画は原本ダウンロードより遅く品質も落ちるため、配布ルールを回避する手段ではなく、個人参照用の 代替策 として扱ってください。"
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "直接保存はブロックされていても、転送が許可されているチャンネルがあります。その場合は投稿を Saved Messages に転送し、そこから保存できるか確認します。"
          },
          {
            "text": "転送も無効な場合は、ログインコードを要求するボットで制限を破ろうとせず、管理者承認のコピーか許可された録画を使ってください。"
          }
        ]
      },
      {
        "id": "third-party",
        "title": "第三者ボット",
        "paragraphs": [
          {
            "text": "「制限チャンネル解除」をうたうボット、クローンサイト、Telegram の制限を回避すると主張するツールには注意してください。多くは機密性の高いアカウントアクセスを求めるか、private メディアを安全に扱えません。"
          }
        ]
      },
      {
        "id": "legal",
        "title": "ルールと合法性",
        "paragraphs": [
          {
            "text": "答えはチャンネルのルール、著作権、地域の法律、コピーの使い方によります。個人参照と、再投稿・販売・共有はまったく別です。"
          },
          {
            "text": "迷う場合は所有者に確認し、コピーは私的に保持し、Telegram 権限を破るツールや認証情報を集めるツールは避けてください。"
          }
        ]
      }
    ],
    "comparison": {
      "title": "比較表：どの方法を使うべき？",
      "headers": [
        "方法",
        "成功率",
        "アカウントリスク",
        "許可される？",
        "向いている用途"
      ],
      "rows": [
        {
          "cells": [
            "管理者に依頼",
            "高",
            "なし",
            "はい",
            "原本ファイル、有料または private コンテンツ"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "中",
            "低",
            "投稿を閲覧できる場合",
            "再生、確認、許可されたローカル操作"
          ]
        },
        {
          "cells": [
            "画面録画",
            "中",
            "低",
            "許可がある場合のみ",
            "個人参照用コピー"
          ]
        },
        {
          "cells": [
            "Saved Messages へ転送",
            "低から中",
            "低",
            "転送が有効な場合のみ",
            "転送が残っている投稿"
          ]
        },
        {
          "cells": [
            "第三者解除ボット",
            "不安定",
            "高",
            "いいえ",
            "避けるべき"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "なぜこの Telegram チャンネルの動画を保存できなくなったのですか？",
          "answer": "チャンネル所有者が Restrict saving content を有効にした可能性があります。Telegram はそのチャンネルの保存、転送、コピー操作を非表示または無効にします。"
        },
        {
          "question": "アプリなしで制限を回避できますか？",
          "answer": "権限を回避しようとするべきではありません。管理者に依頼し、許可された閲覧には Telegram Desktop または Telegram Web を使い、転送が有効なら Saved Messages を試し、許可がある場合のみ録画してください。"
        },
        {
          "question": "録画やスクリーンショットはチャンネル所有者に知られますか？",
          "answer": "Telegram の挙動はプラットフォームやコンテンツ種別で変わる可能性があります。秘密にできる前提にせず、許可がある場合だけ行ってください。"
        },
        {
          "question": "Telegram ダウンロードボットサービスは安全ですか？",
          "answer": "多くは安全ではありません。ログインコード、パスワード、API 資格情報、エクスポート session、広範なアカウントアクセスを求めるボットやサイトは避けてください。"
        },
        {
          "question": "Telegram Premium で制限は解除されますか？",
          "answer": "いいえ。Telegram Premium はチャンネル所有者の Restrict saving content 設定を上書きしません。"
        }
      ]
    },
    "howTo": {
      "name": "ダウンロード無効の Telegram チャンネルへの対応方法",
      "description": "Telegram チャンネルで保存や転送が無効な場合に、安全で正当な手順を使います。",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "アクセスと許可を確認する",
          "anchor": "before-you-start",
          "text": "対象投稿を開き、個人用コピーを保持する許可があることを確認してから正当な対処法を試します。"
        },
        {
          "name": "まず管理者に依頼する",
          "anchor": "workaround-1",
          "text": "チャンネル所有者に許可、ダウンロード可能なコピー、一時的な保存許可を依頼します。"
        },
        {
          "name": "Telegram Desktop または Telegram Web で閲覧する",
          "anchor": "workaround-2",
          "text": "Telegram Desktop または Telegram Web で投稿を開き、アカウント秘密情報を必要としない手順だけを使います。"
        },
        {
          "name": "許可された代替手段を使う",
          "anchor": "workaround-3",
          "text": "原本保存ができなくても個人記録が許可される場合は録画し、転送が有効なら Saved Messages を試します。"
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "直接保存はブロックされていても、転送が許可されているチャンネルがあります。その場合は投稿を Saved Messages に転送し、そこから保存できるか確認します。"
        }
      ]
    },
    "bottomLine": {
      "title": "結論",
      "text": "まず許可を確認してください。管理者に依頼し、Telegram Desktop または Telegram Web で見やすく確認し、許可された個人利用に限って録画し、Telegram ログインコードや session を求める第三者解除ツールは避けましょう。"
    }
  },
  "ko-KR": {
    "seo": {
      "title": "Telegram 채널 다운로드 비활성화 해결 방법: 실제로 가능한 방법",
      "description": "Telegram 채널에서 다운로드가 비활성화된 이유와 영상, 사진, 파일을 안전하고 합법적으로 처리하는 방법, 피해야 할 도구를 알아보세요."
    },
    "linkLabel": "다운로드 비활성화 채널 해결 방법",
    "breadcrumb": {
      "home": "홈",
      "current": "다운로드 비활성화 채널 해결 방법"
    },
    "hero": {
      "title": "Telegram 채널에서 다운로드가 안 되나요? 해결 방법입니다",
      "intro": "Telegram 채널에서 다운로드가 비활성화되면 다운로드 버튼이 사라지고 갤러리 저장 옵션이 회색으로 바뀌며 전달도 차단됩니다. 사용자가 잘못한 것이 아니라 채널 소유자가 개인정보 보호 설정을 켠 것입니다. 아래에는 가장 빠른 해결 방법과 그 이유, 신뢰도 순서의 안전한 방법을 정리했습니다.",
      "imageAlt": "사용자가 이미 볼 수 있는 Telegram Web 미디어를 처리하는 화면"
    },
    "workspace": {
      "title": "Telegram 동영상 링크 붙여넣기",
      "submit": "다운로드 시작",
      "helperText": "Telegram 채널에서 다운로드가 차단되었나요? HD 동영상, 이미지, 파일을 즉시 저장하세요. root는 필요 없습니다. 한 번의 클릭으로 제한을 우회하세요. 내 콘텐츠는 내 방식대로."
    },
    "quickAnswer": {
      "title": "빠른 답변(가장 빠른 해결):",
      "items": [
        "채널 관리자에게 파일을 보내 달라고 요청하세요. 성공률이 가장 높고 위험이 없습니다.",
        "Telegram Web / Desktop에서 열고, 볼 수 있도록 허용된 내용을 화면 녹화하세요(iOS, Android, macOS, Windows 내장).",
        "Saved Messages로 전달을 시도하세요. 일부 채널은 다운로드만 막고 전달은 허용합니다."
      ],
      "warning": "로그인 코드를 요구하는 제3자 “잠금 해제” 봇은 피하세요. 계정이 정지될 수 있고 Telegram 약관을 위반하는 경우가 많습니다."
    },
    "toc": {
      "title": "가이드 내용",
      "items": [
        {
          "label": "왜 다운로드가 막히는가",
          "anchor": "why-disabled"
        },
        {
          "label": "10초 확인",
          "anchor": "before-you-start"
        },
        {
          "label": "관리자에게 요청",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop 또는 Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "화면 녹화",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "제3자 봇",
          "anchor": "third-party"
        },
        {
          "label": "비교표: 어떤 방법을 써야 할까요?",
          "anchor": "comparison"
        },
        {
          "label": "규칙과 합법성",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "왜 다운로드가 막히는가",
        "paragraphs": [
          {
            "text": "Telegram 채널 소유자는 Restrict saving content 를 켜서 복사, 전달, 스크린샷, 무단 재공유를 줄일 수 있습니다. 이는 채널 권한 설정이지 휴대폰이나 브라우저 오류가 아닙니다."
          },
          {
            "text": "이 설정은 영상, 사진, 문서, 앨범, 전달 메시지에 영향을 줄 수 있습니다. 미디어가 인증된 Telegram session 안에서만 보이면 웹 다운로더도 실패할 수 있습니다."
          }
        ],
        "note": "안전한 기준은 단순합니다. 볼 수 있고 보관할 권한이 있는 콘텐츠만 저장하고, 허가 없이 재배포하지 마세요."
      },
      {
        "id": "before-you-start",
        "title": "10초 확인",
        "paragraphs": [
          {
            "text": "먼저 Telegram 에서 해당 게시물을 열 수 있는지 확인하세요. 채널을 열 수 없거나 메시지가 삭제되었다면 합법적인 해결 방법 로 복구할 수 없습니다."
          }
        ],
        "list": {
          "items": [
            "정확한 게시물을 열 수 있나요?",
            "채널 규칙이 개인 용도 저장을 허용하나요?",
            "원본 파일이 필요한가요, 아니면 개인 참고용 녹화로 충분한가요?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "관리자에게 요청",
        "paragraphs": [
          {
            "text": "가장 깔끔한 방법은 관리자에게 허가, 다운로드 가능한 사본, 또는 일시적인 저장 허용 게시물을 요청하는 것입니다. 계정 위험을 피하고 채널 소유자의 규칙을 따를 수 있습니다."
          },
          {
            "text": "교육 파일, 유료 강의 자료, 문서, 원본 화질이 필요한 영상에는 이 방법이 가장 좋습니다."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop 또는 Telegram Web",
        "paragraphs": [
          {
            "text": "미디어가 보인다면 같은 게시물을 Telegram Desktop 또는 Telegram Web 에서 열어 보세요. 데스크톱과 웹 화면은 재생, 파일 정보 확인, 허용된 로컬 작업을 관리하기 쉽습니다."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "화면 녹화",
        "paragraphs": [
          {
            "text": "저장과 전달이 막혔지만 개인 사본 보관이 허용된다면 화면 녹화가 실용적인 대안이 될 수 있습니다. 미디어를 정상 재생하고 허용된 범위만 녹화하세요."
          },
          {
            "text": "녹화는 원본 다운로드보다 느리고 품질이 낮을 수 있으므로 배포 규칙을 우회하는 수단이 아니라 개인 참고용 대안 으로만 사용하세요."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "일부 채널은 직접 저장을 막지만 전달은 허용합니다. 이런 경우 게시물을 Saved Messages 로 전달한 뒤 그곳에서 저장할 수 있는지 확인하세요."
          },
          {
            "text": "전달도 비활성화되어 있다면 로그인 코드 봇으로 제한을 뚫으려 하지 말고, 관리자 승인 사본이나 허용된 개인 녹화를 사용하세요."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "제3자 봇",
        "paragraphs": [
          {
            "text": "“제한 채널 해제” 봇, 복제 사이트, Telegram 제한 우회를 약속하는 도구는 조심하세요. 많은 도구가 민감한 계정 접근을 요구하거나 private 미디어에 안전하게 접근하지 못합니다."
          }
        ]
      },
      {
        "id": "legal",
        "title": "규칙과 합법성",
        "paragraphs": [
          {
            "text": "답은 채널 규칙, 저작권, 현지 법률, 사본 사용 방식에 따라 달라집니다. 개인 참고와 재게시, 판매, 공유는 다릅니다."
          },
          {
            "text": "확실하지 않다면 소유자에게 물어보고 사본은 개인적으로만 보관하며 Telegram 권한을 무력화하거나 계정 정보를 수집하는 도구를 피하세요."
          }
        ]
      }
    ],
    "comparison": {
      "title": "비교표: 어떤 방법을 써야 할까요?",
      "headers": [
        "방법",
        "성공률",
        "계정 위험",
        "허용 여부",
        "적합한 경우"
      ],
      "rows": [
        {
          "cells": [
            "관리자에게 요청",
            "높음",
            "없음",
            "예",
            "원본 파일, 유료 또는 private 콘텐츠"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "중간",
            "낮음",
            "게시물을 볼 수 있을 때",
            "재생, 확인, 허용된 로컬 작업"
          ]
        },
        {
          "cells": [
            "화면 녹화",
            "중간",
            "낮음",
            "허가가 있을 때만",
            "개인 참고용 사본"
          ]
        },
        {
          "cells": [
            "Saved Messages 로 전달",
            "낮음~중간",
            "낮음",
            "전달이 켜져 있을 때만",
            "전달이 가능한 게시물"
          ]
        },
        {
          "cells": [
            "제3자 해제 봇",
            "불안정",
            "높음",
            "아니요",
            "피해야 함"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "왜 이 Telegram 채널의 영상을 더 이상 저장할 수 없나요?",
          "answer": "채널 소유자가 Restrict saving content 를 켰을 가능성이 큽니다. Telegram 은 해당 채널의 저장, 전달, 복사 컨트롤을 숨기거나 비활성화합니다."
        },
        {
          "question": "앱 없이 제한을 우회할 수 있나요?",
          "answer": "권한을 우회하려고 해서는 안 됩니다. 관리자에게 요청하고, 허용된 보기에는 Telegram Desktop 또는 Telegram Web 을 사용하며, 전달이 가능하면 Saved Messages 를 시도하고, 허가된 경우에만 녹화하세요."
        },
        {
          "question": "채널 소유자가 녹화나 스크린샷을 알 수 있나요?",
          "answer": "Telegram 동작은 플랫폼과 콘텐츠 유형에 따라 달라질 수 있으므로 비밀이라고 가정하지 마세요. 허가가 있을 때만 녹화나 스크린샷을 하세요."
        },
        {
          "question": "Telegram 다운로드 봇 서비스는 안전한가요?",
          "answer": "많은 서비스가 안전하지 않습니다. 로그인 코드, 비밀번호, API 자격 증명, 내보낸 session, 광범위한 계정 접근을 요구하는 봇이나 사이트는 피하세요."
        },
        {
          "question": "Telegram Premium 이 제한을 없애 주나요?",
          "answer": "아니요. Telegram Premium 은 채널 소유자의 Restrict saving content 설정을 덮어쓰지 않습니다."
        }
      ]
    },
    "howTo": {
      "name": "다운로드가 비활성화된 Telegram 채널 처리 방법",
      "description": "Telegram 채널에서 저장 또는 전달이 비활성화된 경우 안전하고 합법적인 단계를 사용하세요.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "접근 권한과 허가 확인",
          "anchor": "before-you-start",
          "text": "정확한 게시물을 열고 개인 사본을 보관해도 되는지 확인한 뒤 합법적인 해결 방법을 시도하세요."
        },
        {
          "name": "먼저 관리자에게 요청",
          "anchor": "workaround-1",
          "text": "채널 소유자에게 허가, 다운로드 가능한 사본, 또는 임시 저장 권한을 요청하세요."
        },
        {
          "name": "Telegram Desktop 또는 Telegram Web 으로 보기",
          "anchor": "workaround-2",
          "text": "Telegram Desktop 또는 Telegram Web 에서 게시물을 열고 계정 비밀 정보를 요구하지 않는 흐름만 사용하세요."
        },
        {
          "name": "허용된 대안 사용",
          "anchor": "workaround-3",
          "text": "원본 저장은 안 되지만 개인 캡처가 허용되면 녹화하고, 전달이 가능하면 Saved Messages 를 시도하세요."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "일부 채널은 직접 저장을 막지만 전달은 허용합니다. 이런 경우 게시물을 Saved Messages 로 전달한 뒤 그곳에서 저장할 수 있는지 확인하세요."
        }
      ]
    },
    "bottomLine": {
      "title": "결론",
      "text": "허가부터 시작하세요. 관리자에게 물어보고, Telegram Desktop 또는 Telegram Web 으로 더 명확히 확인하며, 허용된 개인 용도에서만 녹화하고, Telegram 로그인 코드나 session 을 요구하는 제3자 해제 도구는 건너뛰세요."
    }
  },
  "es-ES": {
    "seo": {
      "title": "Canal de Telegram con descarga desactivada: lo que sí funciona",
      "description": "¿La descarga está desactivada en un canal de Telegram? Aprende por qué ocurre, qué métodos seguros y legítimos puedes probar y qué servicios conviene evitar."
    },
    "linkLabel": "Canal con descarga desactivada",
    "breadcrumb": {
      "home": "Inicio",
      "current": "Solución para canal con descarga desactivada"
    },
    "hero": {
      "title": "¿Descarga desactivada en un canal de Telegram? Aquí está el método",
      "intro": "Cuando la descarga está desactivada en un canal de Telegram, el botón de descarga desaparece, la opción de guardar en la galería queda en gris y el reenvío se bloquea. No estás haciendo nada mal: el propietario del canal activó una configuración de privacidad. Abajo está el método más rápido, seguido de por qué ocurre y de cada método seguro ordenado por fiabilidad.",
      "imageAlt": "Interfaz de para medios de Telegram Web ya visibles para el usuario"
    },
    "workspace": {
      "title": "Pega el enlace del video de Telegram",
      "submit": "Iniciar descarga",
      "helperText": "¿Un canal de Telegram bloqueó las descargas? Guarda videos HD, imágenes y archivos al instante, sin root. Elude restricciones en un clic. Tu contenido, tus reglas."
    },
    "quickAnswer": {
      "title": "Respuesta rápida (solución más rápida):",
      "items": [
        "Pide al administrador del canal que envíe el archivo: mayor éxito, riesgo cero.",
        "Ábrelo en Telegram Web / Desktop y graba la pantalla de lo que tienes permiso para ver (integrado en iOS, Android, macOS y Windows).",
        "Prueba a reenviarlo a Saved Messages: algunos canales bloquean la descarga, pero no el reenvío."
      ],
      "warning": "Evita bots de “desbloqueo” de terceros que pidan tu código de inicio de sesión: pueden hacer que baneen tu cuenta y a menudo violan los términos de Telegram."
    },
    "toc": {
      "title": "En esta guía",
      "items": [
        {
          "label": "Por qué se desactiva",
          "anchor": "why-disabled"
        },
        {
          "label": "Revisión de 10 segundos",
          "anchor": "before-you-start"
        },
        {
          "label": "Pedir al administrador",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop o Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Grabación de pantalla",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bots de terceros",
          "anchor": "third-party"
        },
        {
          "label": "Tabla comparativa: ¿qué método debería usar?",
          "anchor": "comparison"
        },
        {
          "label": "Reglas y legalidad",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Por qué se desactiva",
        "paragraphs": [
          {
            "text": "Los propietarios de canales pueden activar Restrict saving content para reducir copias, reenvíos, capturas y redistribución casual. Es una decisión de permisos del canal, no un fallo de tu teléfono o navegador."
          },
          {
            "text": "La restricción puede afectar videos, fotos, documentos, álbumes y mensajes reenviados. Un descargador web también puede fallar si el medio solo existe dentro de tu sesión autenticada de Telegram."
          }
        ],
        "note": "El límite seguro es claro: conserva solo contenido que puedes ver y guardar con permiso, y no lo redistribuyas sin autorización."
      },
      {
        "id": "before-you-start",
        "title": "Revisión de 10 segundos",
        "paragraphs": [
          {
            "text": "Confirma primero que puedes abrir la publicación exacta en Telegram. Si no puedes entrar al canal o el mensaje fue eliminado, no hay solución permitida legítimo que lo recupere."
          }
        ],
        "list": {
          "items": [
            "¿Puedes abrir la publicación exacta?",
            "¿Las reglas del canal permiten guardar para uso personal?",
            "¿Necesitas el archivo original o basta una grabación de referencia personal?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Pedir al administrador",
        "paragraphs": [
          {
            "text": "La vía más limpia es pedir permiso, una copia descargable o una publicación temporal con guardado habilitado. Evita riesgos para la cuenta y respeta las reglas del propietario."
          },
          {
            "text": "Es la mejor opción para materiales de cursos, documentos de pago y videos donde necesitas calidad original."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop o Telegram Web",
        "paragraphs": [
          {
            "text": "Si el medio es visible para ti, abre la misma publicación en Telegram Desktop o Telegram Web. Estas vistas suelen facilitar la reproducción, la revisión de detalles y los flujos locales permitidos."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Grabación de pantalla",
        "paragraphs": [
          {
            "text": "Si guardar y reenviar están bloqueados pero tienes permiso para conservar una copia personal, la grabación de pantalla puede ser una alternativa práctica. Reproduce el medio normalmente y graba solo lo permitido."
          },
          {
            "text": "Es más lenta y de menor calidad que descargar el archivo original, así que úsala como respaldo personal, no como forma de saltarte reglas de distribución."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Algunos canales bloquean el guardado directo pero todavía permiten reenviar. Reenvía la publicación a Saved Messages y comprueba si Telegram permite guardarla desde allí."
          },
          {
            "text": "Si el reenvío también está bloqueado, no uses bots que pidan códigos. Pide una copia autorizada o usa una grabación personal permitida."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bots de terceros",
        "paragraphs": [
          {
            "text": "Ten cuidado con bots de “desbloqueo”, sitios clonados y herramientas que prometen saltarse restricciones de Telegram. Muchas piden acceso sensible o no pueden acceder a medios privados de forma segura."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Reglas y legalidad",
        "paragraphs": [
          {
            "text": "Depende de las reglas del canal, derechos de autor, leyes locales y uso de la copia. Una referencia personal no es lo mismo que republicar, vender o compartir contenido ajeno."
          },
          {
            "text": "Si tienes dudas, pregunta al propietario, mantén la copia privada y evita herramientas que intenten derrotar permisos de Telegram o recolectar credenciales."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Tabla comparativa: ¿qué método debería usar?",
      "headers": [
        "Método",
        "Éxito",
        "Riesgo de cuenta",
        "¿Permitido?",
        "Mejor para"
      ],
      "rows": [
        {
          "cells": [
            "Pedir al administrador",
            "Alto",
            "Ninguno",
            "Sí",
            "Archivos originales y contenido privado o de pago"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Medio",
            "Bajo",
            "Si puedes ver la publicación",
            "Reproducción, revisión y flujos locales permitidos"
          ]
        },
        {
          "cells": [
            "Grabación de pantalla",
            "Medio",
            "Bajo",
            "Solo con permiso",
            "Copias de referencia personal"
          ]
        },
        {
          "cells": [
            "Reenviar a Saved Messages",
            "Bajo a medio",
            "Bajo",
            "Solo si el reenvío está activo",
            "Publicaciones que aún permiten reenviar"
          ]
        },
        {
          "cells": [
            "Bots desbloqueo de terceros",
            "Poco fiable",
            "Alto",
            "No",
            "Evítalos"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "¿Por qué ya no puedo guardar videos de este canal de Telegram?",
          "answer": "Probablemente el propietario activó Restrict saving content. Telegram oculta o deshabilita controles de guardar, reenviar y copiar para ese canal."
        },
        {
          "question": "¿Puedo eludir restricciones sin una app?",
          "answer": "No deberías intentar saltarte permisos. Puedes pedir al administrador, usar Telegram Desktop o Telegram Web para ver lo permitido, probar Saved Messages si el reenvío está activo o grabar para uso personal cuando tengas permiso."
        },
        {
          "question": "¿El propietario sabrá si grabo o hago captura?",
          "answer": "El comportamiento de Telegram puede cambiar según plataforma y tipo de contenido. No dependas del secreto; graba o captura solo cuando tengas permiso."
        },
        {
          "question": "¿Son seguros los bots de descarga de Telegram?",
          "answer": "Muchos no lo son. Evita cualquier bot o sitio que pida código de inicio de sesión, contraseña, credenciales API, sesión exportada o acceso amplio a tu cuenta."
        },
        {
          "question": "¿Telegram Premium elimina la restricción?",
          "answer": "No. Telegram Premium no anula Restrict saving content configurado por el propietario del canal."
        }
      ]
    },
    "howTo": {
      "name": "Cómo manejar un canal de Telegram con descarga desactivada",
      "description": "Usa pasos seguros y legítimos cuando un canal desactiva guardar o reenviar.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Comprueba acceso y permiso",
          "anchor": "before-you-start",
          "text": "Abre la publicación exacta y confirma que puedes conservar una copia personal."
        },
        {
          "name": "Pregunta primero al administrador",
          "anchor": "workaround-1",
          "text": "Solicita permiso, una copia descargable o acceso temporal de guardado."
        },
        {
          "name": "Usa Telegram Desktop o Telegram Web para ver lo permitido",
          "anchor": "workaround-2",
          "text": "Abre la publicación en Telegram Desktop o Telegram Web sin entregar secretos de cuenta."
        },
        {
          "name": "Usa un respaldo permitido",
          "anchor": "workaround-3",
          "text": "Si no se permite guardar el original pero sí la captura personal, graba la pantalla o usa Saved Messages si el reenvío sigue activo."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Algunos canales bloquean el guardado directo pero todavía permiten reenviar. Reenvía la publicación a Saved Messages y comprueba si Telegram permite guardarla desde allí."
        }
      ]
    },
    "bottomLine": {
      "title": "Conclusión",
      "text": "Empieza por el permiso: pregunta al administrador, usa Telegram Desktop o Telegram Web para una vista más clara, graba solo para uso personal permitido y evita cualquier desbloqueador que pida tu código o sesión de Telegram."
    }
  },
  "pt-BR": {
    "seo": {
      "title": "Canal do Telegram com salvamento bloqueado: o que funciona",
      "description": "Download desativado em um canal do Telegram? Entenda por que acontece, quais alternativas seguras e legítimas usar e quais ferramentas evitar."
    },
    "linkLabel": "Canal com download desativado",
    "breadcrumb": {
      "home": "Início",
      "current": "Alternativa para canal com salvamento bloqueado"
    },
    "hero": {
      "title": "Download desativado em um canal do Telegram? Aqui está o método",
      "intro": "Quando o download é desativado em um canal do Telegram, o botão de download desaparece, a opção de salvar na galeria fica cinza e o encaminhamento é bloqueado. Você não fez nada errado: o dono do canal ativou uma configuração de privacidade. Abaixo está o método mais rápido, seguido do motivo e de cada método seguro ordenado por confiabilidade.",
      "imageAlt": "Interface do para mídias do Telegram Web já visíveis ao usuário"
    },
    "workspace": {
      "title": "Cole o link do vídeo do Telegram",
      "submit": "Iniciar download",
      "helperText": "Canal do Telegram bloqueou downloads? Salve vídeos HD, imagens e arquivos instantaneamente, sem root. Contorne restrições em um clique. Seu conteúdo, suas regras."
    },
    "quickAnswer": {
      "title": "Resposta rápida (correção mais rápida):",
      "items": [
        "Peça ao administrador do canal para enviar o arquivo: maior sucesso, risco zero.",
        "Abra no Telegram Web / Desktop e grave a tela do que você tem permissão para ver (integrado ao iOS, Android, macOS e Windows).",
        "Tente encaminhar para Saved Messages: alguns canais bloqueiam download, mas não encaminhamento."
      ],
      "warning": "Evite bots de “desbloqueio” de terceiros que pedem seu código de login: eles podem banir sua conta e muitas vezes violam os termos do Telegram."
    },
    "toc": {
      "title": "Neste guia",
      "items": [
        {
          "label": "Por que o download é bloqueado",
          "anchor": "why-disabled"
        },
        {
          "label": "Checagem de 10 segundos",
          "anchor": "before-you-start"
        },
        {
          "label": "Pedir ao administrador",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop ou Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Gravação de tela",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bots de terceiros",
          "anchor": "third-party"
        },
        {
          "label": "Tabela comparativa: qual método usar?",
          "anchor": "comparison"
        },
        {
          "label": "Regras e legalidade",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Por que o download é bloqueado",
        "paragraphs": [
          {
            "text": "Donos de canais podem ativar Restrict saving content para reduzir cópias, encaminhamentos, capturas e redistribuição. É uma permissão do canal, não um erro do aparelho ou navegador."
          },
          {
            "text": "A regra pode afetar vídeos, fotos, documentos e álbuns. Um downloader web pode falhar quando a mídia só existe dentro da sua sessão autenticada do Telegram."
          }
        ],
        "note": "O limite seguro é simples: guarde apenas conteúdo que você tem permissão para ver e manter, sem redistribuir sem autorização."
      },
      {
        "id": "before-you-start",
        "title": "Checagem de 10 segundos",
        "paragraphs": [
          {
            "text": "Confirme que você ainda consegue abrir o post exato no Telegram. Se o canal não abre ou a mensagem foi apagada, não há alternativa legítima para recuperar."
          }
        ],
        "list": {
          "items": [
            "Você consegue abrir o post exato?",
            "As regras do canal permitem salvar para uso pessoal?",
            "Você precisa do arquivo original ou uma gravação pessoal resolve?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Pedir ao administrador",
        "paragraphs": [
          {
            "text": "O caminho mais limpo é pedir permissão, uma cópia baixável ou acesso temporário com salvamento liberado. Isso evita risco para a conta e respeita o dono do canal."
          },
          {
            "text": "É a melhor opção para materiais pagos, documentos, aulas e vídeos que precisam da qualidade original."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop ou Telegram Web",
        "paragraphs": [
          {
            "text": "Se a mídia está visível para você, abra o mesmo post no Telegram Desktop ou Telegram Web. Essas telas facilitam reprodução, conferência de arquivos e fluxos locais permitidos."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Gravação de tela",
        "paragraphs": [
          {
            "text": "Se salvar e encaminhar estão bloqueados, mas você pode manter uma cópia pessoal, gravar a tela pode ser uma alternativa prática. Grave apenas o que você tem permissão para guardar."
          },
          {
            "text": "É mais lento e tem qualidade menor que o arquivo original, então use como alternativa pessoal, não como forma de burlar regras de distribuição."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Alguns canais bloqueiam salvar diretamente, mas ainda permitem encaminhar. Encaminhe o post para Saved Messages e veja se o Telegram permite salvar de lá."
          },
          {
            "text": "Se encaminhar também está bloqueado, não use bots que pedem código. Peça uma cópia autorizada ou use uma gravação pessoal permitida."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bots de terceiros",
        "paragraphs": [
          {
            "text": "Tenha cuidado com bots de “desbloqueio”, sites clonados e ferramentas que prometem contornar restrições do Telegram. Muitas pedem acesso sensível ou não acessam mídia privada com segurança."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Regras e legalidade",
        "paragraphs": [
          {
            "text": "Depende das regras do canal, direitos autorais, leis locais e uso da cópia. Referência pessoal é diferente de repostar, vender ou compartilhar conteúdo de outra pessoa."
          },
          {
            "text": "Na dúvida, pergunte ao dono, mantenha a cópia privada e evite ferramentas que tentam quebrar permissões do Telegram ou coletar credenciais."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Tabela comparativa: qual método usar?",
      "headers": [
        "Método",
        "Sucesso",
        "Risco da conta",
        "Permitido?",
        "Melhor para"
      ],
      "rows": [
        {
          "cells": [
            "Pedir ao administrador",
            "Alto",
            "Nenhum",
            "Sim",
            "Arquivos originais e conteúdo privado ou pago"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Médio",
            "Baixo",
            "Quando você vê o post",
            "Reprodução, inspeção e fluxos locais permitidos"
          ]
        },
        {
          "cells": [
            "Gravação de tela",
            "Médio",
            "Baixo",
            "Somente com permissão",
            "Cópias pessoais de referência"
          ]
        },
        {
          "cells": [
            "Encaminhar para Saved Messages",
            "Baixo a médio",
            "Baixo",
            "Somente se encaminhar está ativo",
            "Posts que ainda permitem encaminhar"
          ]
        },
        {
          "cells": [
            "Bots desbloqueio de terceiros",
            "Pouco confiável",
            "Alto",
            "Não",
            "Evite"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Por que não consigo mais salvar vídeos deste canal do Telegram?",
          "answer": "Provavelmente o dono ativou Restrict saving content. O Telegram oculta ou desativa controles de salvar, encaminhar e copiar."
        },
        {
          "question": "Posso contornar restrições sem app?",
          "answer": "Você não deve burlar permissões. Peça ao administrador, use Telegram Desktop ou Telegram Web para visualização permitida, tente Saved Messages se encaminhar estiver ativo ou grave para uso pessoal quando permitido."
        },
        {
          "question": "O dono do canal saberá se eu gravei ou tirei print?",
          "answer": "O comportamento do Telegram pode mudar por plataforma e tipo de conteúdo. Não dependa de segredo; grave ou capture apenas com permissão."
        },
        {
          "question": "Serviços de bot downloader do Telegram são seguros?",
          "answer": "Muitos não são. Evite qualquer bot ou site que peça código de login, senha, credenciais API, sessão exportada ou acesso amplo à conta."
        },
        {
          "question": "Telegram Premium remove a restrição?",
          "answer": "Não. Telegram Premium não substitui a configuração Restrict saving content do dono do canal."
        }
      ]
    },
    "howTo": {
      "name": "Como lidar com um canal do Telegram com download desativado",
      "description": "Use passos seguros e legítimos quando um canal desativa salvar ou encaminhar.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Confira acesso e permissão",
          "anchor": "before-you-start",
          "text": "Abra o post exato e confirme que você pode manter uma cópia pessoal."
        },
        {
          "name": "Pergunte primeiro ao administrador",
          "anchor": "workaround-1",
          "text": "Peça permissão, uma cópia baixável ou acesso temporário para salvar."
        },
        {
          "name": "Use Telegram Desktop ou Telegram Web para ver o permitido",
          "anchor": "workaround-2",
          "text": "Abra no Telegram Desktop ou Telegram Web sem entregar segredos da conta."
        },
        {
          "name": "Use uma alternativa permitida",
          "anchor": "workaround-3",
          "text": "Se salvar o original não é permitido, mas captura pessoal é, grave a tela ou use Saved Messages quando encaminhar ainda estiver ativo."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Alguns canais bloqueiam salvar diretamente, mas ainda permitem encaminhar. Encaminhe o post para Saved Messages e veja se o Telegram permite salvar de lá."
        }
      ]
    },
    "bottomLine": {
      "title": "Resumo",
      "text": "Comece pela permissão: pergunte ao administrador, use Telegram Desktop ou Telegram Web para visualizar melhor, grave apenas para uso pessoal permitido e ignore qualquer desbloqueador que peça código ou sessão do Telegram."
    }
  },
  "de-DE": {
    "seo": {
      "title": "Telegram-Kanal mit deaktiviertem Herunterladen: was wirklich funktioniert",
      "description": "Download in einem Telegram-Kanal deaktiviert? Erfahre, warum das passiert, welche sicheren und legitimen Zulässiger Wegs es gibt und welche Tools du vermeiden solltest."
    },
    "linkLabel": "Kanal mit deaktiviertem Download",
    "breadcrumb": {
      "home": "Startseite",
      "current": "Zulässiger Weg bei deaktiviertem Herunterladen"
    },
    "hero": {
      "title": "Telegram-Download in einem Kanal deaktiviert? Hier ist die Lösung",
      "intro": "Wenn der Download in einem Telegram-Kanal deaktiviert ist, verschwindet die Download-Schaltfläche, Speichern in der Galerie ist ausgegraut und Weiterleiten ist blockiert. Du machst nichts falsch: Der Kanalinhaber hat eine Datenschutzeinstellung aktiviert. Unten steht die schnellste Lösung, danach folgen der Grund und alle sicheren Methoden nach Zuverlässigkeit.",
      "imageAlt": "Oberfläche für Telegram Web Medien, die der Nutzer bereits sehen kann"
    },
    "workspace": {
      "title": "Telegram-Videolink einfügen",
      "submit": "Download starten",
      "helperText": "Telegram-Kanal blockiert Downloads? Speichere HD-Videos, Bilder und Dateien sofort, ohne Root. Umgehe Einschränkungen mit einem Klick. Dein Inhalt, deine Regeln."
    },
    "quickAnswer": {
      "title": "Kurzantwort (schnellste Lösung):",
      "items": [
        "Bitte den Kanaladmin, die Datei zu senden: höchste Erfolgsquote, kein Risiko.",
        "Öffne sie in Telegram Web / Desktop und zeichne das auf, was du ansehen darfst (in iOS, Android, macOS und Windows integriert).",
        "Versuche die Weiterleitung an Saved Messages: Manche Kanäle blockieren Download, aber nicht Weiterleitung."
      ],
      "warning": "Vermeide Drittanbieter-Bots zum „Entsperren“, die deinen Login-Code verlangen: Sie können zu einer Kontosperre führen und verstoßen oft gegen Telegram-Bedingungen."
    },
    "toc": {
      "title": "In dieser Anleitung",
      "items": [
        {
          "label": "Warum Download deaktiviert ist",
          "anchor": "why-disabled"
        },
        {
          "label": "10-Sekunden-Prüfung",
          "anchor": "before-you-start"
        },
        {
          "label": "Admin fragen",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop oder Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Bildschirmaufnahme",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Drittanbieter-Bots",
          "anchor": "third-party"
        },
        {
          "label": "Vergleichstabelle: Welche Methode sollte ich nutzen?",
          "anchor": "comparison"
        },
        {
          "label": "Regeln und Recht",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Warum Download deaktiviert ist",
        "paragraphs": [
          {
            "text": "Kanalbetreiber können Restrict saving content aktivieren, um Kopieren, Weiterleiten, Screenshots und erneutes Teilen zu reduzieren. Das ist eine Kanalberechtigung, kein Fehler deines Geräts."
          },
          {
            "text": "Die Einstellung kann Videos, Fotos, Dokumente, Alben und weitergeleitete Nachrichten betreffen. Ein Web-Downloader kann scheitern, wenn die Medien nur in deiner authentifizierten Telegram session verfügbar sind."
          }
        ],
        "note": "Die sichere Grenze: Speichere nur Inhalte, die du sehen und behalten darfst, und verteile sie nicht ohne Erlaubnis weiter."
      },
      {
        "id": "before-you-start",
        "title": "10-Sekunden-Prüfung",
        "paragraphs": [
          {
            "text": "Prüfe zuerst, ob du den exakten Beitrag in Telegram öffnen kannst. Wenn der Kanal nicht zugänglich oder die Nachricht gelöscht ist, gibt es keinen legitimen Wiederherstellungs-Zulässiger Weg."
          }
        ],
        "list": {
          "items": [
            "Kannst du den exakten Beitrag öffnen?",
            "Erlauben die Kanalregeln privates Speichern?",
            "Brauchst du die Originaldatei oder reicht eine private Referenzaufnahme?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Admin fragen",
        "paragraphs": [
          {
            "text": "Der sauberste Weg ist eine Erlaubnis, eine herunterladbare Kopie oder temporär aktiviertes Speichern vom Admin. Das vermeidet Kontorisiken und respektiert die Regeln."
          },
          {
            "text": "Für Kursmaterial, kostenpflichtige Inhalte, Dokumente und Videos in Originalqualität ist dies meist die beste Lösung."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop oder Telegram Web",
        "paragraphs": [
          {
            "text": "Wenn du das Medium sehen kannst, öffne denselben Beitrag in Telegram Desktop oder Telegram Web. Diese Ansichten erleichtern Wiedergabe, Dateiprüfung und erlaubte lokale Workflows."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Bildschirmaufnahme",
        "paragraphs": [
          {
            "text": "Wenn Speichern und Weiterleiten blockiert sind, du aber eine private Kopie behalten darfst, kann Bildschirmaufnahme ein praktischer Ersatzweg sein. Nimm nur auf, was du behalten darfst."
          },
          {
            "text": "Sie ist langsamer und weniger hochwertig als die Originaldatei. Nutze sie für private Referenz, nicht zum Umgehen von Verbreitungsregeln."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Manche Kanäle blockieren direktes Speichern, erlauben aber Weiterleiten. Leite den Beitrag an Saved Messages weiter und prüfe, ob Telegram dort Speichern erlaubt."
          },
          {
            "text": "Wenn auch Weiterleiten blockiert ist, nutze keine Code-Bots. Frage nach einer autorisierten Kopie oder nutze eine erlaubte private Aufnahme."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Drittanbieter-Bots",
        "paragraphs": [
          {
            "text": "Sei vorsichtig mit Entsperr-Bots, Klon-Websites und Tools, die Telegram-Beschränkungen umgehen wollen. Viele verlangen sensiblen Kontozugriff oder können private Medien nicht sicher erreichen."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Regeln und Recht",
        "paragraphs": [
          {
            "text": "Das hängt von Kanalregeln, Urheberrecht, lokalem Recht und deiner Nutzung ab. Private Referenz ist etwas anderes als erneutes Posten, Verkaufen oder Teilen fremder Inhalte."
          },
          {
            "text": "Frage im Zweifel den Eigentümer, halte Kopien privat und meide Tools, die Telegram-Rechte aushebeln oder Zugangsdaten sammeln."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Vergleichstabelle: Welche Methode sollte ich nutzen?",
      "headers": [
        "Methode",
        "Erfolg",
        "Kontorisiko",
        "Erlaubt?",
        "Am besten für"
      ],
      "rows": [
        {
          "cells": [
            "Admin fragen",
            "Hoch",
            "Keins",
            "Ja",
            "Originaldateien und private oder bezahlte Inhalte"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Mittel",
            "Niedrig",
            "Wenn du den Beitrag sehen kannst",
            "Wiedergabe, Prüfung und erlaubte lokale Workflows"
          ]
        },
        {
          "cells": [
            "Bildschirmaufnahme",
            "Mittel",
            "Niedrig",
            "Nur mit Erlaubnis",
            "Private Referenzkopien"
          ]
        },
        {
          "cells": [
            "An Saved Messages weiterleiten",
            "Niedrig bis mittel",
            "Niedrig",
            "Nur wenn Weiterleiten aktiv ist",
            "Beiträge mit erlaubter Weiterleitung"
          ]
        },
        {
          "cells": [
            "Drittanbieter-Entsperr-Bots",
            "Unzuverlässig",
            "Hoch",
            "Nein",
            "Vermeiden"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Warum kann ich Videos aus diesem Telegram-Kanal nicht mehr speichern?",
          "answer": "Der Kanalbetreiber hat wahrscheinlich Restrict saving content aktiviert. Telegram blendet Speichern, Weiterleiten und Kopieren aus oder deaktiviert sie."
        },
        {
          "question": "Kann ich die Einschränkung ohne App umgehen?",
          "answer": "Du solltest Berechtigungen nicht umgehen. Frage den Admin, nutze Telegram Desktop oder Telegram Web für erlaubte Anzeige, probiere Saved Messages bei erlaubter Weiterleitung oder nimm nur mit Erlaubnis auf."
        },
        {
          "question": "Erfährt der Kanalbetreiber von Aufnahme oder Screenshot?",
          "answer": "Telegram-Verhalten kann je nach Plattform und Inhalt variieren. Verlasse dich nicht auf Geheimhaltung und mache Aufnahmen nur mit Erlaubnis."
        },
        {
          "question": "Sind Telegram Download-Bot-Dienste sicher?",
          "answer": "Viele sind es nicht. Meide Bots oder Sites, die Login-Code, Passwort, API-Daten, exportierte Sitzung oder breiten Kontozugriff verlangen."
        },
        {
          "question": "Hebt Telegram Premium die Beschränkung auf?",
          "answer": "Nein. Telegram Premium überschreibt Restrict saving content des Kanalbetreibers nicht."
        }
      ]
    },
    "howTo": {
      "name": "Umgang mit einem Telegram-Kanal ohne Download",
      "description": "Nutze sichere und legitime Schritte, wenn ein Kanal Speichern oder Weiterleiten deaktiviert.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Zugriff und Erlaubnis prüfen",
          "anchor": "before-you-start",
          "text": "Öffne den exakten Beitrag und bestätige, dass du eine private Kopie behalten darfst."
        },
        {
          "name": "Zuerst den Admin fragen",
          "anchor": "workaround-1",
          "text": "Bitte um Erlaubnis, eine herunterladbare Kopie oder temporären Speicherzugriff."
        },
        {
          "name": "Telegram Desktop oder Telegram Web nutzen",
          "anchor": "workaround-2",
          "text": "Öffne den Beitrag in Telegram Desktop oder Telegram Web und nutze nur Abläufe ohne Kontogeheimnisse."
        },
        {
          "name": "Erlaubten Ersatzweg verwenden",
          "anchor": "workaround-3",
          "text": "Wenn die Originaldatei nicht gespeichert werden darf, aber private Erfassung erlaubt ist, nimm den Bildschirm auf oder nutze Saved Messages bei erlaubter Weiterleitung."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Manche Kanäle blockieren direktes Speichern, erlauben aber Weiterleiten. Leite den Beitrag an Saved Messages weiter und prüfe, ob Telegram dort Speichern erlaubt."
        }
      ]
    },
    "bottomLine": {
      "title": "Fazit",
      "text": "Beginne mit Erlaubnis: Frage den Admin, nutze Telegram Desktop oder Telegram Web für bessere Ansicht, nimm nur für erlaubte private Zwecke auf und meide jedes Entsperrtool, der Telegram Code oder session verlangt."
    }
  },
  "fr-FR": {
    "seo": {
      "title": "Téléchargement désactivé sur un canal Telegram : ce qui fonctionne",
      "description": "Téléchargement désactivé sur un canal Telegram ? Comprenez pourquoi, les solutions sûres et légitimes à essayer, et les outils risqués à éviter."
    },
    "linkLabel": "Canal avec téléchargement désactivé",
    "breadcrumb": {
      "home": "Accueil",
      "current": "Solution pour canal avec téléchargement désactivé"
    },
    "hero": {
      "title": "Téléchargement désactivé dans un canal Telegram ? Voici la méthode",
      "intro": "Quand le téléchargement est désactivé dans un canal Telegram, le bouton de téléchargement disparaît, l’option d’enregistrement dans la galerie est grisée et le transfert est bloqué. Vous ne faites rien de mal : le propriétaire du canal a activé un réglage de confidentialité. Voici d’abord la méthode la plus rapide, puis l’explication et toutes les méthodes sûres classées par fiabilité.",
      "imageAlt": "Interface pour des médias Telegram Web déjà visibles par l’utilisateur"
    },
    "workspace": {
      "title": "Collez le lien vidéo Telegram",
      "submit": "Démarrer le téléchargement",
      "helperText": "Un canal Telegram bloque les téléchargements ? Enregistrez instantanément vidéos HD, images et fichiers, sans root. Contournez les restrictions en un clic. Votre contenu, vos règles."
    },
    "quickAnswer": {
      "title": "Réponse rapide (solution la plus rapide) :",
      "items": [
        "Demandez à l’administrateur du canal d’envoyer le fichier : meilleure réussite, risque nul.",
        "Ouvrez-le dans Telegram Web / Desktop, puis enregistrez l’écran de ce que vous êtes autorisé à voir (intégré à iOS, Android, macOS, Windows).",
        "Essayez de transférer vers Saved Messages : certains canaux bloquent le téléchargement, mais pas le transfert."
      ],
      "warning": "Évitez les bots tiers de « déverrouillage » qui demandent votre code de connexion : ils peuvent faire bannir votre compte et violent souvent les conditions de Telegram."
    },
    "toc": {
      "title": "Dans ce guide",
      "items": [
        {
          "label": "Pourquoi c’est désactivé",
          "anchor": "why-disabled"
        },
        {
          "label": "Vérification en 10 secondes",
          "anchor": "before-you-start"
        },
        {
          "label": "Demander à l’admin",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop ou Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Enregistrement d’écran",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bots tiers",
          "anchor": "third-party"
        },
        {
          "label": "Tableau comparatif : quelle méthode choisir ?",
          "anchor": "comparison"
        },
        {
          "label": "Règles et légalité",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Pourquoi c’est désactivé",
        "paragraphs": [
          {
            "text": "Les propriétaires de canaux peuvent activer Restrict saving content pour limiter copies, transferts, captures et repartages. C’est un choix de permission du canal, pas un bug de votre appareil."
          },
          {
            "text": "La restriction peut toucher vidéos, photos, documents, albums et messages transférés. Un téléchargeur web peut échouer si le média n’est disponible que dans votre session Telegram authentifiée."
          }
        ],
        "note": "La limite sûre est simple : conservez seulement le contenu que vous avez le droit de voir et garder, sans le redistribuer sans autorisation."
      },
      {
        "id": "before-you-start",
        "title": "Vérification en 10 secondes",
        "paragraphs": [
          {
            "text": "Vérifiez d’abord que vous pouvez ouvrir le post exact dans Telegram. Si le canal est inaccessible ou le message supprimé, aucune solution autorisée légitime ne peut le récupérer."
          }
        ],
        "list": {
          "items": [
            "Pouvez-vous ouvrir le post exact ?",
            "Les règles du canal autorisent-elles la sauvegarde personnelle ?",
            "Avez-vous besoin du fichier original ou une capture personnelle suffit-elle ?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Demander à l’admin",
        "paragraphs": [
          {
            "text": "La voie la plus propre consiste à demander une autorisation, une copie téléchargeable ou un accès temporaire avec sauvegarde activée. Cela évite le risque de compte et respecte le canal."
          },
          {
            "text": "C’est idéal pour les cours payants, documents et vidéos où la qualité originale est nécessaire."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop ou Telegram Web",
        "paragraphs": [
          {
            "text": "Si le média est visible pour vous, ouvrez le même post dans Telegram Desktop ou Telegram Web. Ces vues facilitent la lecture, l’inspection et les flux locaux autorisés."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Enregistrement d’écran",
        "paragraphs": [
          {
            "text": "Si sauvegarde et transfert sont bloqués mais qu’une copie personnelle est autorisée, l’enregistrement d’écran peut dépanner. Enregistrez seulement ce que vous avez le droit de conserver."
          },
          {
            "text": "C’est plus lent et moins qualitatif que le fichier original : utilisez-le comme solution de secours personnel, pas pour contourner les règles de diffusion."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Certains canaux bloquent la sauvegarde directe mais autorisent encore le transfert. Transférez le post vers Saved Messages et vérifiez si Telegram permet de le sauvegarder depuis là."
          },
          {
            "text": "Si le transfert est aussi bloqué, n’utilisez pas de bots qui demandent un code. Demandez une copie autorisée ou utilisez une capture personnelle permise."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bots tiers",
        "paragraphs": [
          {
            "text": "Méfiez-vous des bots “déblocage”, sites clonés et outils promettant de contourner Telegram. Beaucoup demandent un accès sensible ou ne peuvent pas traiter les médias privés en sécurité."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Règles et légalité",
        "paragraphs": [
          {
            "text": "Cela dépend des règles du canal, du droit d’auteur, de la loi locale et de votre usage. Une référence personnelle diffère d’une republication, vente ou diffusion."
          },
          {
            "text": "En cas de doute, demandez au propriétaire, gardez la copie privée et évitez les outils qui cassent les permissions Telegram ou collectent des identifiants."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Tableau comparatif : quelle méthode choisir ?",
      "headers": [
        "Méthode",
        "Succès",
        "Risque compte",
        "Autorisé ?",
        "Idéal pour"
      ],
      "rows": [
        {
          "cells": [
            "Demander à l’admin",
            "Élevé",
            "Aucun",
            "Oui",
            "Fichiers originaux et contenus privés ou payants"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Moyen",
            "Faible",
            "Si vous pouvez voir le post",
            "Lecture, inspection et flux locaux autorisés"
          ]
        },
        {
          "cells": [
            "Enregistrement d’écran",
            "Moyen",
            "Faible",
            "Seulement avec permission",
            "Copies de référence personnelle"
          ]
        },
        {
          "cells": [
            "Transfert vers Saved Messages",
            "Faible à moyen",
            "Faible",
            "Si le transfert est activé",
            "Posts encore transférables"
          ]
        },
        {
          "cells": [
            "Bots déblocage tiers",
            "Peu fiable",
            "Élevé",
            "Non",
            "À éviter"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Pourquoi ne puis-je plus sauvegarder les vidéos de ce canal Telegram ?",
          "answer": "Le propriétaire a probablement activé Restrict saving content. Telegram masque ou désactive les contrôles de sauvegarde, transfert et copie."
        },
        {
          "question": "Puis-je contourner les restrictions sans application ?",
          "answer": "Vous ne devez pas contourner les permissions. Demandez à l’admin, utilisez Telegram Desktop ou Telegram Web pour l’affichage autorisé, essayez Saved Messages si le transfert existe ou enregistrez seulement avec permission."
        },
        {
          "question": "Le propriétaire saura-t-il si j’enregistre ou capture ?",
          "answer": "Le comportement de Telegram peut varier selon plateforme et contenu. Ne comptez pas sur le secret ; faites-le seulement avec permission."
        },
        {
          "question": "Les bots de téléchargement Telegram sont-ils sûrs ?",
          "answer": "Beaucoup ne le sont pas. Évitez tout bot ou site demandant code de connexion, mot de passe, identifiants API, session exportée ou accès large au compte."
        },
        {
          "question": "Telegram Premium retire-t-il la restriction ?",
          "answer": "Non. Telegram Premium ne remplace pas Restrict saving content défini par le propriétaire du canal."
        }
      ]
    },
    "howTo": {
      "name": "Gérer un canal Telegram avec téléchargement désactivé",
      "description": "Utilisez des étapes sûres et légitimes quand un canal désactive sauvegarde ou transfert.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Vérifier accès et permission",
          "anchor": "before-you-start",
          "text": "Ouvrez le post exact et confirmez que vous pouvez garder une copie personnelle."
        },
        {
          "name": "Demander d’abord à l’admin",
          "anchor": "workaround-1",
          "text": "Demandez autorisation, copie téléchargeable ou accès temporaire à la sauvegarde."
        },
        {
          "name": "Utiliser Telegram Desktop ou Telegram Web",
          "anchor": "workaround-2",
          "text": "Ouvrez le post dans Telegram Desktop ou Telegram Web sans fournir de secret de compte."
        },
        {
          "name": "Utiliser une solution de secours autorisée",
          "anchor": "workaround-3",
          "text": "Si l’original ne peut pas être sauvegardé mais qu’une capture personnelle est permise, enregistrez l’écran ou utilisez Saved Messages si le transfert reste actif."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Certains canaux bloquent la sauvegarde directe mais autorisent encore le transfert. Transférez le post vers Saved Messages et vérifiez si Telegram permet de le sauvegarder depuis là."
        }
      ]
    },
    "bottomLine": {
      "title": "En résumé",
      "text": "Commencez par la permission : demandez à l’admin, utilisez Telegram Desktop ou Telegram Web pour mieux voir, enregistrez seulement pour un usage personnel autorisé et évitez tout outil de déblocage demandant code ou session Telegram."
    }
  },
  "ru-RU": {
    "seo": {
      "title": "В канале Telegram отключено скачивание: что реально работает",
      "description": "В канале Telegram отключено скачивание? Узнайте причину, безопасные и легитимные обходные варианты и инструменты, которых стоит избегать."
    },
    "linkLabel": "Канал с отключенной загрузкой",
    "breadcrumb": {
      "home": "Главная",
      "current": "Решение для канала без скачивания"
    },
    "hero": {
      "title": "В Telegram-канале отключена загрузка? Вот рабочий способ",
      "intro": "Когда в Telegram-канале отключена загрузка, кнопка скачивания исчезает, сохранение в галерею становится недоступным, а пересылка блокируется. Вы ничего не сделали неправильно: владелец канала включил настройку приватности. Ниже сначала дан самый быстрый способ, затем объяснение причины и все безопасные методы по надежности.",
      "imageAlt": "Интерфейс для медиа Telegram Web, уже видимых пользователю"
    },
    "workspace": {
      "title": "Вставьте ссылку на видео Telegram",
      "submit": "Начать скачивание",
      "helperText": "Канал Telegram блокирует загрузки? Сохраняйте HD-видео, изображения и файлы мгновенно, без root. Обходите ограничения в один клик. Ваш контент, ваши правила."
    },
    "quickAnswer": {
      "title": "Краткий ответ (самое быстрое решение):",
      "items": [
        "Попросите администратора канала отправить файл: максимальный успех, нулевой риск.",
        "Откройте в Telegram Web / Desktop и запишите экран с тем, что вам разрешено смотреть (встроено в iOS, Android, macOS, Windows).",
        "Попробуйте переслать в Saved Messages: некоторые каналы блокируют загрузку, но не пересылку."
      ],
      "warning": "Избегайте сторонних ботов для «разблокировки», которые просят код входа: они могут привести к блокировке аккаунта и часто нарушают условия Telegram."
    },
    "toc": {
      "title": "В этом гайде",
      "items": [
        {
          "label": "Почему скачивание отключено",
          "anchor": "why-disabled"
        },
        {
          "label": "Проверка за 10 секунд",
          "anchor": "before-you-start"
        },
        {
          "label": "Спросить администратора",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop или Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Запись экрана",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Сторонние боты",
          "anchor": "third-party"
        },
        {
          "label": "Таблица сравнения: какой способ выбрать?",
          "anchor": "comparison"
        },
        {
          "label": "Правила и законность",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Почему скачивание отключено",
        "paragraphs": [
          {
            "text": "Владелец канала может включить Restrict saving content, чтобы уменьшить копирование, пересылку, скриншоты и повторное распространение. Это настройка прав канала, а не ошибка устройства."
          },
          {
            "text": "Ограничение может затронуть видео, фото, документы, альбомы и пересланные сообщения. Веб-загрузчик может не сработать, если медиа доступно только внутри вашей авторизованной Telegram session."
          }
        ],
        "note": "Безопасная граница проста: сохраняйте только то, что вам разрешено смотреть и хранить, и не распространяйте без разрешения."
      },
      {
        "id": "before-you-start",
        "title": "Проверка за 10 секунд",
        "paragraphs": [
          {
            "text": "Сначала убедитесь, что точный пост открывается в Telegram. Если канал недоступен или сообщение удалено, легитимный разрешенное решение не восстановит его."
          }
        ],
        "list": {
          "items": [
            "Можете открыть точный пост?",
            "Правила канала разрешают личное сохранение?",
            "Нужен оригинальный файл или достаточно личной записи?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Спросить администратора",
        "paragraphs": [
          {
            "text": "Самый чистый путь — попросить разрешение, скачиваемую копию или временный пост с включенным сохранением. Это снижает риск для аккаунта и уважает правила канала."
          },
          {
            "text": "Для платных материалов, документов, курсов и видео в исходном качестве это обычно лучший вариант."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop или Telegram Web",
        "paragraphs": [
          {
            "text": "Если медиа вам видно, откройте тот же пост в Telegram Desktop или Telegram Web. Эти интерфейсы удобнее для просмотра, проверки файлов и разрешенных локальных действий."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Запись экрана",
        "paragraphs": [
          {
            "text": "Если сохранение и пересылка заблокированы, но вам разрешено иметь личную копию, запись экрана может быть практичным запасным вариантом. Записывайте только разрешенный контент."
          },
          {
            "text": "Это медленнее и хуже по качеству, чем оригинал, поэтому используйте запись как личный запасной вариант, а не как способ нарушить правила распространения."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Некоторые каналы запрещают прямое сохранение, но разрешают пересылку. Перешлите пост в Saved Messages и проверьте, позволяет ли Telegram сохранить оттуда."
          },
          {
            "text": "Если пересылка тоже отключена, не используйте ботов с кодом входа. Попросите разрешенную копию или используйте разрешенную личную запись."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Сторонние боты",
        "paragraphs": [
          {
            "text": "Будьте осторожны с разблокировка-ботами, клонами сайтов и инструментами, обещающими обойти ограничения Telegram. Многие требуют чувствительный доступ или не могут безопасно получить private медиа."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Правила и законность",
        "paragraphs": [
          {
            "text": "Ответ зависит от правил канала, авторских прав, местного закона и вашего использования копии. Личная справка отличается от репоста, продажи или распространения чужого контента."
          },
          {
            "text": "Если сомневаетесь, спросите владельца, храните копию приватно и избегайте инструментов, которые ломают права Telegram или собирают учетные данные."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Таблица сравнения: какой способ выбрать?",
      "headers": [
        "Метод",
        "Успех",
        "Риск аккаунта",
        "Разрешено?",
        "Лучше всего для"
      ],
      "rows": [
        {
          "cells": [
            "Спросить администратора",
            "Высокий",
            "Нет",
            "Да",
            "Оригинальные файлы, платный или private контент"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Средний",
            "Низкий",
            "Если пост виден",
            "Просмотр, проверка и разрешенные локальные действия"
          ]
        },
        {
          "cells": [
            "Запись экрана",
            "Средний",
            "Низкий",
            "Только с разрешением",
            "Личные справочные копии"
          ]
        },
        {
          "cells": [
            "Переслать в Saved Messages",
            "Низкий-средний",
            "Низкий",
            "Если пересылка включена",
            "Посты, которые еще можно переслать"
          ]
        },
        {
          "cells": [
            "Сторонние разблокировка-боты",
            "Ненадежно",
            "Высокий",
            "Нет",
            "Избегать"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Почему я больше не могу сохранять видео из этого Telegram-канала?",
          "answer": "Владелец, вероятно, включил Restrict saving content. Telegram скрывает или отключает сохранение, пересылку и копирование."
        },
        {
          "question": "Можно обойти ограничение без приложения?",
          "answer": "Не стоит обходить права. Спросите администратора, используйте Telegram Desktop или Telegram Web для разрешенного просмотра, пробуйте Saved Messages при включенной пересылке или записывайте только с разрешением."
        },
        {
          "question": "Узнает ли владелец канала о записи или скриншоте?",
          "answer": "Поведение Telegram может меняться по платформам и типам контента. Не рассчитывайте на скрытность; делайте это только с разрешением."
        },
        {
          "question": "Безопасны ли Telegram download bot сервисы?",
          "answer": "Многие небезопасны. Избегайте ботов и сайтов, которые просят код входа, пароль, API данные, экспортированную session или широкий доступ к аккаунту."
        },
        {
          "question": "Telegram Premium снимает ограничение?",
          "answer": "Нет. Telegram Premium не отменяет Restrict saving content, установленный владельцем канала."
        }
      ]
    },
    "howTo": {
      "name": "Как действовать с Telegram-каналом без скачивания",
      "description": "Используйте безопасные и легитимные шаги, когда канал отключает сохранение или пересылку.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Проверьте доступ и разрешение",
          "anchor": "before-you-start",
          "text": "Откройте точный пост и подтвердите, что можете хранить личную копию."
        },
        {
          "name": "Сначала спросите администратора",
          "anchor": "workaround-1",
          "text": "Попросите разрешение, скачиваемую копию или временный доступ к сохранению."
        },
        {
          "name": "Используйте Telegram Desktop или Telegram Web",
          "anchor": "workaround-2",
          "text": "Откройте пост в Telegram Desktop или Telegram Web, не передавая секреты аккаунта."
        },
        {
          "name": "Используйте разрешенный запасной вариант",
          "anchor": "workaround-3",
          "text": "Если нельзя сохранить оригинал, но можно личную запись, запишите экран или используйте Saved Messages при включенной пересылке."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Некоторые каналы запрещают прямое сохранение, но разрешают пересылку. Перешлите пост в Saved Messages и проверьте, позволяет ли Telegram сохранить оттуда."
        }
      ]
    },
    "bottomLine": {
      "title": "Итог",
      "text": "Начните с разрешения: спросите администратора, используйте Telegram Desktop или Telegram Web для удобного просмотра, записывайте только для разрешенного личного использования и избегайте сервисов разблокировки, которые просят код или сессию Telegram."
    }
  },
  "it-IT": {
    "seo": {
      "title": "Scaricamento disattivato in un canale Telegram: cosa funziona davvero",
      "description": "Download disattivato in un canale Telegram? Scopri perché succede, quali soluzioni sicure e legittime provare e quali strumenti evitare."
    },
    "linkLabel": "Canale con download disattivato",
    "breadcrumb": {
      "home": "Home",
      "current": "Soluzione per canale con scaricamento disattivato"
    },
    "hero": {
      "title": "Download disattivato in un canale Telegram? Ecco il metodo",
      "intro": "Quando il download è disattivato in un canale Telegram, il pulsante di download scompare, l’opzione di salvataggio in galleria è grigia e l’inoltro è bloccato. Non stai sbagliando nulla: il proprietario del canale ha attivato un’impostazione di privacy. Sotto trovi il metodo più rapido, poi il motivo e tutti i metodi sicuri ordinati per affidabilità.",
      "imageAlt": "Interfaccia per media Telegram Web già visibili all’utente"
    },
    "workspace": {
      "title": "Incolla il link video Telegram",
      "submit": "Avvia download",
      "helperText": "Un canale Telegram blocca i download? Salva subito video HD, immagini e file, senza root. Aggira le restrizioni in un clic. Il tuo contenuto, le tue regole."
    },
    "quickAnswer": {
      "title": "Risposta rapida (soluzione più veloce):",
      "items": [
        "Chiedi all’amministratore del canale di inviare il file: massimo successo, rischio zero.",
        "Aprilo in Telegram Web / Desktop e registra lo schermo di ciò che sei autorizzato a vedere (integrato in iOS, Android, macOS, Windows).",
        "Prova a inoltrare a Saved Messages: alcuni canali bloccano il download ma non l’inoltro."
      ],
      "warning": "Evita bot di “sblocco” di terze parti che chiedono il codice di accesso: possono far bannare l’account e spesso violano i termini Telegram."
    },
    "toc": {
      "title": "In questa guida",
      "items": [
        {
          "label": "Perché è disattivato",
          "anchor": "why-disabled"
        },
        {
          "label": "Controllo in 10 secondi",
          "anchor": "before-you-start"
        },
        {
          "label": "Chiedi all’admin",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop o Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Registrazione schermo",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bot di terze parti",
          "anchor": "third-party"
        },
        {
          "label": "Tabella comparativa: quale metodo usare?",
          "anchor": "comparison"
        },
        {
          "label": "Regole e legalità",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Perché è disattivato",
        "paragraphs": [
          {
            "text": "I proprietari dei canali possono attivare Restrict saving content per ridurre copie, inoltri, screenshot e ricondivisioni. È una scelta di permessi del canale, non un problema del dispositivo."
          },
          {
            "text": "La restrizione può riguardare video, foto, documenti, album e messaggi inoltrati. Un downloader web può fallire se il media è disponibile solo nella tua sessione Telegram autenticata."
          }
        ],
        "note": "Il limite sicuro è semplice: conserva solo contenuti che puoi vedere e tenere, senza ridistribuirli senza autorizzazione."
      },
      {
        "id": "before-you-start",
        "title": "Controllo in 10 secondi",
        "paragraphs": [
          {
            "text": "Verifica prima di poter aprire il post esatto in Telegram. Se il canale è inaccessibile o il messaggio è stato eliminato, nessuna soluzione consentita legittima può recuperarlo."
          }
        ],
        "list": {
          "items": [
            "Puoi aprire il post esatto?",
            "Le regole del canale permettono il salvataggio personale?",
            "Ti serve il file originale o basta una registrazione personale?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Chiedi all’admin",
        "paragraphs": [
          {
            "text": "Il percorso più pulito è chiedere permesso, una copia scaricabile o un post temporaneo con salvataggio abilitato. Evita rischi per l’account e rispetta le regole del canale."
          },
          {
            "text": "È la scelta migliore per corsi, contenuti a pagamento, documenti e video in qualità originale."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop o Telegram Web",
        "paragraphs": [
          {
            "text": "Se il media è visibile, apri lo stesso post in Telegram Desktop o Telegram Web. Queste viste facilitano riproduzione, controllo file e flussi locali consentiti."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Registrazione schermo",
        "paragraphs": [
          {
            "text": "Se salvataggio e inoltro sono bloccati ma puoi conservare una copia personale, registrare lo schermo può essere una soluzione di riserva pratica. Registra solo ciò che hai il permesso di tenere."
          },
          {
            "text": "È più lento e meno qualitativo dell’originale, quindi usalo come riferimento personale, non per aggirare regole di distribuzione."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Alcuni canali bloccano il salvataggio diretto ma permettono l’inoltro. Inoltra il post a Saved Messages e verifica se Telegram permette di salvarlo da lì."
          },
          {
            "text": "Se anche l’inoltro è bloccato, non usare bot che chiedono codici. Richiedi una copia autorizzata o usa una registrazione personale consentita."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bot di terze parti",
        "paragraphs": [
          {
            "text": "Fai attenzione a bot “sblocco”, siti clone e strumenti che promettono di superare restrizioni Telegram. Molti richiedono accesso sensibile o non accedono ai media privati in modo sicuro."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Regole e legalità",
        "paragraphs": [
          {
            "text": "Dipende dalle regole del canale, copyright, legge locale e uso della copia. Riferimento personale è diverso da ripubblicare, vendere o condividere contenuti altrui."
          },
          {
            "text": "Nel dubbio chiedi al proprietario, tieni la copia privata ed evita strumenti che forzano i permessi Telegram o raccolgono credenziali."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Tabella comparativa: quale metodo usare?",
      "headers": [
        "Metodo",
        "Successo",
        "Rischio account",
        "Consentito?",
        "Ideale per"
      ],
      "rows": [
        {
          "cells": [
            "Chiedi all’admin",
            "Alto",
            "Nessuno",
            "Sì",
            "File originali e contenuti privati o a pagamento"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Medio",
            "Basso",
            "Se puoi vedere il post",
            "Riproduzione, ispezione e flussi locali consentiti"
          ]
        },
        {
          "cells": [
            "Registrazione schermo",
            "Medio",
            "Basso",
            "Solo con permesso",
            "Copie di riferimento personale"
          ]
        },
        {
          "cells": [
            "Inoltra a Saved Messages",
            "Basso-medio",
            "Basso",
            "Solo se inoltro è attivo",
            "Post ancora inoltrabili"
          ]
        },
        {
          "cells": [
            "Bot sblocco di terze parti",
            "Inaffidabile",
            "Alto",
            "No",
            "Da evitare"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Perché non posso più salvare video da questo canale Telegram?",
          "answer": "Probabilmente il proprietario ha attivato Restrict saving content. Telegram nasconde o disabilita salvataggio, inoltro e copia."
        },
        {
          "question": "Posso aggirare le restrizioni senza app?",
          "answer": "Non dovresti aggirare permessi. Chiedi all’admin, usa Telegram Desktop o Telegram Web per vedere ciò che è consentito, prova Saved Messages se l’inoltro è attivo o registra solo con permesso."
        },
        {
          "question": "Il proprietario saprà se registro o faccio screenshot?",
          "answer": "Il comportamento di Telegram può cambiare per piattaforma e tipo di contenuto. Non contare sulla segretezza; fallo solo con permesso."
        },
        {
          "question": "I servizi bot downloader Telegram sono sicuri?",
          "answer": "Molti no. Evita bot o siti che chiedono codice di login, password, credenziali API, session esportata o accesso ampio all’account."
        },
        {
          "question": "Telegram Premium rimuove la restrizione?",
          "answer": "No. Telegram Premium non supera Restrict saving content impostato dal proprietario del canale."
        }
      ]
    },
    "howTo": {
      "name": "Come gestire un canale Telegram con download disattivato",
      "description": "Usa passaggi sicuri e legittimi quando un canale disattiva salvataggio o inoltro.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Controlla accesso e permesso",
          "anchor": "before-you-start",
          "text": "Apri il post esatto e conferma di poter conservare una copia personale."
        },
        {
          "name": "Chiedi prima all’admin",
          "anchor": "workaround-1",
          "text": "Richiedi permesso, una copia scaricabile o accesso temporaneo al salvataggio."
        },
        {
          "name": "Usa Telegram Desktop o Telegram Web",
          "anchor": "workaround-2",
          "text": "Apri il post in Telegram Desktop o Telegram Web senza consegnare segreti dell’account."
        },
        {
          "name": "Usa una soluzione di riserva consentita",
          "anchor": "workaround-3",
          "text": "Se non puoi salvare l’originale ma puoi fare una cattura personale, registra lo schermo o usa Saved Messages quando l’inoltro resta attivo."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Alcuni canali bloccano il salvataggio diretto ma permettono l’inoltro. Inoltra il post a Saved Messages e verifica se Telegram permette di salvarlo da lì."
        }
      ]
    },
    "bottomLine": {
      "title": "In sintesi",
      "text": "Parti dal permesso: chiedi all’admin, usa Telegram Desktop o Telegram Web per vedere meglio, registra solo per uso personale consentito ed evita ogni strumento di sblocco che chiede codice o sessione Telegram."
    }
  },
  "vi-VN": {
    "seo": {
      "title": "Kênh Telegram bị tắt tải xuống: cách thật sự hiệu quả",
      "description": "Kênh Telegram bị tắt tải xuống? Tìm hiểu nguyên nhân, các cách xử lý an toàn, hợp lệ cho video, ảnh, tệp và những công cụ nên tránh."
    },
    "linkLabel": "Kênh tắt tải xuống",
    "breadcrumb": {
      "home": "Trang chủ",
      "current": "Cách xử lý cho kênh tắt tải xuống"
    },
    "hero": {
      "title": "Kênh Telegram bị tắt tải xuống? Đây là cách xử lý",
      "intro": "Khi tải xuống bị tắt trong một kênh Telegram, nút tải xuống biến mất, tùy chọn lưu vào thư viện bị làm mờ và chuyển tiếp bị chặn. Bạn không làm sai điều gì; chủ kênh đã bật một cài đặt quyền riêng tư. Bên dưới là cách nhanh nhất, tiếp theo là lý do và mọi phương pháp an toàn được xếp theo độ tin cậy.",
      "imageAlt": "Giao diện cho media Telegram Web mà người dùng đã nhìn thấy"
    },
    "workspace": {
      "title": "Dán liên kết video Telegram",
      "submit": "Bắt đầu tải xuống",
      "helperText": "Kênh Telegram chặn tải xuống? Lưu ngay video HD, hình ảnh và tệp, không cần root. Vượt qua hạn chế chỉ bằng một lần nhấp. Nội dung của bạn, quy tắc của bạn."
    },
    "quickAnswer": {
      "title": "Trả lời nhanh (cách nhanh nhất):",
      "items": [
        "Hỏi quản trị viên kênh gửi tệp: thành công cao nhất, không rủi ro.",
        "Mở trong Telegram Web / Desktop rồi quay màn hình phần bạn được phép xem (có sẵn trong iOS, Android, macOS, Windows).",
        "Thử chuyển tiếp tới Saved Messages: một số kênh chặn tải xuống nhưng không chặn chuyển tiếp."
      ],
      "warning": "Tránh bot “mở khóa” bên thứ ba yêu cầu mã đăng nhập: chúng có thể khiến tài khoản bị cấm và thường vi phạm điều khoản Telegram."
    },
    "toc": {
      "title": "Trong hướng dẫn này",
      "items": [
        {
          "label": "Vì sao bị tắt tải",
          "anchor": "why-disabled"
        },
        {
          "label": "Kiểm tra 10 giây",
          "anchor": "before-you-start"
        },
        {
          "label": "Hỏi quản trị viên",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop hoặc Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Quay màn hình",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bot bên thứ ba",
          "anchor": "third-party"
        },
        {
          "label": "Bảng so sánh: nên dùng cách nào?",
          "anchor": "comparison"
        },
        {
          "label": "Quy định và pháp lý",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Vì sao bị tắt tải",
        "paragraphs": [
          {
            "text": "Chủ kênh Telegram có thể bật Restrict saving content để giảm sao chép, chuyển tiếp, chụp màn hình và chia sẻ lại. Đây là quyền của kênh, không phải lỗi điện thoại hay trình duyệt."
          },
          {
            "text": "Thiết lập này có thể ảnh hưởng video, ảnh, tài liệu, album và tin nhắn chuyển tiếp. Downloader web có thể thất bại nếu media chỉ tồn tại trong Telegram session đã đăng nhập của bạn."
          }
        ],
        "note": "Ranh giới an toàn: chỉ giữ nội dung bạn được phép xem và lưu, không phân phối lại nếu chưa được cho phép."
      },
      {
        "id": "before-you-start",
        "title": "Kiểm tra 10 giây",
        "paragraphs": [
          {
            "text": "Hãy xác nhận bạn vẫn mở được đúng bài đăng trong Telegram. Nếu không vào được kênh hoặc tin nhắn đã bị xóa, không có cách xử lý hợp lệ hợp lệ để khôi phục."
          }
        ],
        "list": {
          "items": [
            "Bạn có mở được đúng bài đăng không?",
            "Quy định kênh có cho lưu dùng cá nhân không?",
            "Bạn cần tệp gốc hay bản quay tham khảo cá nhân là đủ?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Hỏi quản trị viên",
        "paragraphs": [
          {
            "text": "Cách sạch nhất là xin quyền, bản sao có thể tải, hoặc bài đăng tạm thời cho phép lưu. Cách này tránh rủi ro tài khoản và tôn trọng chủ kênh."
          },
          {
            "text": "Nó phù hợp nhất cho tài liệu khóa học, nội dung trả phí, tài liệu và video cần chất lượng gốc."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop hoặc Telegram Web",
        "paragraphs": [
          {
            "text": "Nếu media hiển thị với bạn, mở cùng bài trong Telegram Desktop hoặc Telegram Web. Giao diện desktop/web giúp phát, xem chi tiết tệp và xử lý quy trình cục bộ được phép dễ hơn."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Quay màn hình",
        "paragraphs": [
          {
            "text": "Nếu lưu và chuyển tiếp bị chặn nhưng bạn được phép giữ bản cá nhân, quay màn hình có thể là phương án dự phòng thực tế. Chỉ quay nội dung bạn được phép giữ."
          },
          {
            "text": "Cách này chậm hơn và chất lượng thấp hơn tải tệp gốc, nên chỉ dùng cho tham khảo cá nhân, không dùng để né quy định phân phối."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Một số kênh chặn lưu trực tiếp nhưng vẫn cho chuyển tiếp. Hãy chuyển bài đến Saved Messages rồi kiểm tra Telegram có cho lưu từ đó không."
          },
          {
            "text": "Nếu chuyển tiếp cũng bị chặn, đừng dùng bot yêu cầu mã. Hãy xin bản sao được phép hoặc dùng bản quay cá nhân được cho phép."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bot bên thứ ba",
        "paragraphs": [
          {
            "text": "Hãy cẩn thận với bot “mở khóa”, website nhái và công cụ hứa vượt hạn chế Telegram. Nhiều công cụ đòi quyền tài khoản nhạy cảm hoặc không thể truy cập media riêng tư an toàn."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Quy định và pháp lý",
        "paragraphs": [
          {
            "text": "Câu trả lời phụ thuộc quy định kênh, bản quyền, luật địa phương và cách bạn dùng bản sao. Tham khảo cá nhân khác với đăng lại, bán hoặc chia sẻ nội dung của người khác."
          },
          {
            "text": "Nếu không chắc, hãy hỏi chủ sở hữu, giữ bản sao riêng tư và tránh công cụ phá quyền Telegram hoặc thu thập thông tin tài khoản."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Bảng so sánh: nên dùng cách nào?",
      "headers": [
        "Phương pháp",
        "Tỉ lệ thành công",
        "Rủi ro tài khoản",
        "Được phép?",
        "Phù hợp nhất"
      ],
      "rows": [
        {
          "cells": [
            "Hỏi quản trị viên",
            "Cao",
            "Không",
            "Có",
            "Tệp gốc và nội dung riêng tư hoặc trả phí"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Trung bình",
            "Thấp",
            "Khi bạn xem được bài",
            "Phát, kiểm tra và quy trình cục bộ được phép"
          ]
        },
        {
          "cells": [
            "Quay màn hình",
            "Trung bình",
            "Thấp",
            "Chỉ khi có phép",
            "Bản tham khảo cá nhân"
          ]
        },
        {
          "cells": [
            "Chuyển đến Saved Messages",
            "Thấp đến trung bình",
            "Thấp",
            "Chỉ khi chuyển tiếp bật",
            "Bài vẫn chuyển tiếp được"
          ]
        },
        {
          "cells": [
            "Bot mở khóa bên thứ ba",
            "Không ổn định",
            "Cao",
            "Không",
            "Nên tránh"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Vì sao tôi không lưu được video từ kênh Telegram này nữa?",
          "answer": "Chủ kênh có thể đã bật Restrict saving content. Telegram ẩn hoặc vô hiệu hóa nút lưu, chuyển tiếp và sao chép."
        },
        {
          "question": "Tôi có thể vượt quyền mà không cần ứng dụng không?",
          "answer": "Bạn không nên vượt quyền. Hãy hỏi quản trị viên, dùng Telegram Desktop hoặc Telegram Web để xem trong phạm vi cho phép, thử Saved Messages nếu chuyển tiếp còn bật, hoặc quay khi được phép."
        },
        {
          "question": "Chủ kênh có biết tôi quay hoặc chụp màn hình không?",
          "answer": "Hành vi Telegram có thể thay đổi theo nền tảng và loại nội dung. Đừng dựa vào bí mật; chỉ làm khi bạn có quyền."
        },
        {
          "question": "Dịch vụ bot tải Telegram có an toàn không?",
          "answer": "Nhiều dịch vụ không an toàn. Tránh bot hoặc site yêu cầu mã đăng nhập, mật khẩu, thông tin API, phiên đã xuất hoặc quyền tài khoản rộng."
        },
        {
          "question": "Telegram Premium có gỡ hạn chế không?",
          "answer": "Không. Telegram Premium không ghi đè Restrict saving content của chủ kênh."
        }
      ]
    },
    "howTo": {
      "name": "Cách xử lý kênh Telegram bị tắt tải xuống",
      "description": "Dùng các bước an toàn và hợp lệ khi kênh tắt lưu hoặc chuyển tiếp.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Kiểm tra quyền truy cập và cho phép",
          "anchor": "before-you-start",
          "text": "Mở đúng bài đăng và xác nhận bạn được giữ bản sao cá nhân."
        },
        {
          "name": "Hỏi quản trị viên trước",
          "anchor": "workaround-1",
          "text": "Xin quyền, bản sao có thể tải hoặc quyền lưu tạm thời."
        },
        {
          "name": "Dùng Telegram Desktop hoặc Telegram Web để xem",
          "anchor": "workaround-2",
          "text": "Mở bài trong Telegram Desktop hoặc Telegram Web mà không cung cấp bí mật tài khoản."
        },
        {
          "name": "Dùng phương án dự phòng được phép",
          "anchor": "workaround-3",
          "text": "Nếu không được lưu bản gốc nhưng được ghi lại cá nhân, quay màn hình hoặc dùng Saved Messages khi chuyển tiếp còn bật."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Một số kênh chặn lưu trực tiếp nhưng vẫn cho chuyển tiếp. Hãy chuyển bài đến Saved Messages rồi kiểm tra Telegram có cho lưu từ đó không."
        }
      ]
    },
    "bottomLine": {
      "title": "Kết luận",
      "text": "Bắt đầu từ quyền cho phép: hỏi quản trị viên, dùng Telegram Desktop hoặc Telegram Web để xem rõ hơn, chỉ quay cho mục đích cá nhân được phép và bỏ qua mọi công cụ mở khóa yêu cầu mã hoặc phiên Telegram."
    }
  },
  "th-TH": {
    "seo": {
      "title": "ช่อง Telegram ปิดการดาวน์โหลด: วิธีที่ใช้ได้จริง",
      "description": "ช่อง Telegram ปิดการดาวน์โหลด? เข้าใจสาเหตุ วิธีจัดการวิดีโอ รูปภาพ และไฟล์อย่างปลอดภัยถูกต้อง และเครื่องมือที่ควรหลีกเลี่ยง"
    },
    "linkLabel": "ช่องที่ปิดการดาวน์โหลด",
    "breadcrumb": {
      "home": "หน้าแรก",
      "current": "วิธีสำหรับช่องที่ปิดดาวน์โหลด"
    },
    "hero": {
      "title": "ช่อง Telegram ปิดดาวน์โหลด? นี่คือวิธีจัดการ",
      "intro": "เมื่อช่อง Telegram ปิดดาวน์โหลด ปุ่มดาวน์โหลดจะหายไป ตัวเลือกบันทึกลงแกลเลอรีจะเป็นสีเทา และการส่งต่อจะถูกบล็อก คุณไม่ได้ทำอะไรผิด เจ้าของช่องเปิดการตั้งค่าความเป็นส่วนตัวไว้ ด้านล่างคือวิธีที่เร็วที่สุด ตามด้วยเหตุผลและวิธีที่ปลอดภัยเรียงตามความน่าเชื่อถือ",
      "imageAlt": "หน้าจอ สำหรับสื่อ Telegram Web ที่ผู้ใช้มองเห็นอยู่แล้ว"
    },
    "workspace": {
      "title": "วางลิงก์วิดีโอ Telegram",
      "submit": "เริ่มดาวน์โหลด",
      "helperText": "ช่อง Telegram บล็อกการดาวน์โหลดหรือไม่? บันทึกวิดีโอ HD รูปภาพ และไฟล์ได้ทันที ไม่ต้อง root ข้ามข้อจำกัดในคลิกเดียว เนื้อหาของคุณ กฎของคุณ"
    },
    "quickAnswer": {
      "title": "คำตอบด่วน (วิธีเร็วที่สุด):",
      "items": [
        "ขอให้ผู้ดูแลช่องส่งไฟล์ให้ สำเร็จสูงสุด ไม่มีความเสี่ยง",
        "เปิดใน Telegram Web / Desktop แล้วอัดหน้าจอสิ่งที่คุณได้รับอนุญาตให้ดู (มีใน iOS, Android, macOS, Windows)",
        "ลองส่งต่อไปยัง Saved Messages บางช่องบล็อกดาวน์โหลดแต่ไม่บล็อกส่งต่อ"
      ],
      "warning": "หลีกเลี่ยงบอต “ปลดล็อก” บุคคลที่สามที่ขอรหัสเข้าสู่ระบบ เพราะอาจทำให้บัญชีถูกแบนและมักผิดเงื่อนไข Telegram"
    },
    "toc": {
      "title": "ในคู่มือนี้",
      "items": [
        {
          "label": "ทำไมดาวน์โหลดไม่ได้",
          "anchor": "why-disabled"
        },
        {
          "label": "ตรวจสอบ 10 วินาที",
          "anchor": "before-you-start"
        },
        {
          "label": "ถามผู้ดูแล",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop หรือ Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "อัดหน้าจอ",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "บอทภายนอก",
          "anchor": "third-party"
        },
        {
          "label": "ตารางเปรียบเทียบ: ควรใช้วิธีใด?",
          "anchor": "comparison"
        },
        {
          "label": "กฎและกฎหมาย",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "ทำไมดาวน์โหลดไม่ได้",
        "paragraphs": [
          {
            "text": "เจ้าของช่อง Telegram สามารถเปิด Restrict saving content เพื่อลดการคัดลอก ส่งต่อ แคปหน้าจอ และแชร์ซ้ำ นี่เป็นสิทธิ์ระดับช่อง ไม่ใช่ข้อผิดพลาดของมือถือหรือเบราว์เซอร์"
          },
          {
            "text": "การตั้งค่านี้อาจมีผลกับวิดีโอ รูปภาพ เอกสาร อัลบั้ม และข้อความที่ส่งต่อ Downloader บนเว็บอาจล้มเหลวเมื่อสื่ออยู่ได้เฉพาะใน Telegram session ที่คุณเข้าสู่ระบบไว้"
          }
        ],
        "note": "ขอบเขตปลอดภัยคือ เก็บเฉพาะเนื้อหาที่คุณมีสิทธิ์ดูและเก็บ และอย่าเผยแพร่ต่อโดยไม่ได้รับอนุญาต"
      },
      {
        "id": "before-you-start",
        "title": "ตรวจสอบ 10 วินาที",
        "paragraphs": [
          {
            "text": "ยืนยันก่อนว่าคุณยังเปิดโพสต์นั้นใน Telegram ได้ หากเข้าช่องไม่ได้หรือข้อความถูกลบ ไม่มี วิธีที่ถูกต้อง ที่ถูกต้องที่จะกู้คืนได้"
          }
        ],
        "list": {
          "items": [
            "คุณเปิดโพสต์ที่ถูกต้องได้หรือไม่?",
            "กฎของช่องอนุญาตให้บันทึกเพื่อใช้ส่วนตัวหรือไม่?",
            "คุณต้องการไฟล์ต้นฉบับหรือแค่อัดไว้ดูส่วนตัวก็พอ?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "ถามผู้ดูแล",
        "paragraphs": [
          {
            "text": "วิธีที่สะอาดที่สุดคือขออนุญาต ขอไฟล์ที่ดาวน์โหลดได้ หรือขอโพสต์ชั่วคราวที่เปิดให้บันทึกได้ วิธีนี้ลดความเสี่ยงบัญชีและเคารพกฎของช่อง"
          },
          {
            "text": "เหมาะที่สุดสำหรับไฟล์เรียน เนื้อหาชำระเงิน เอกสาร และวิดีโอที่ต้องใช้คุณภาพต้นฉบับ"
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop หรือ Telegram Web",
        "paragraphs": [
          {
            "text": "ถ้าคุณเห็นสื่อนั้นได้ ให้เปิดโพสต์เดียวกันใน Telegram Desktop หรือ Telegram Web หน้าจอเหล่านี้ช่วยให้เล่น ตรวจไฟล์ และใช้ขั้นตอนในเครื่องที่ได้รับอนุญาตได้ง่ายขึ้น"
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "อัดหน้าจอ",
        "paragraphs": [
          {
            "text": "ถ้าบันทึกและส่งต่อถูกปิด แต่คุณได้รับอนุญาตให้เก็บสำเนาส่วนตัว การอัดหน้าจอเป็น ทางเลือกสำรอง ที่ใช้ได้จริง เล่นสื่อตามปกติและอัดเฉพาะสิ่งที่คุณมีสิทธิ์เก็บ"
          },
          {
            "text": "วิธีนี้ช้ากว่าและคุณภาพต่ำกว่าไฟล์ต้นฉบับ จึงควรใช้เพื่ออ้างอิงส่วนตัว ไม่ใช่เพื่อเลี่ยงกฎการเผยแพร่"
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "บางช่องบล็อกการบันทึกโดยตรงแต่ยังให้ส่งต่อได้ ให้ส่งโพสต์ไปที่ Saved Messages แล้วตรวจว่า Telegram อนุญาตให้บันทึกจากตรงนั้นหรือไม่"
          },
          {
            "text": "ถ้าส่งต่อก็ถูกปิด อย่าใช้บอทที่ขอรหัส ให้ขอสำเนาที่อนุญาตหรือใช้อัดหน้าจอส่วนตัวที่ได้รับอนุญาตแทน"
          }
        ]
      },
      {
        "id": "third-party",
        "title": "บอทภายนอก",
        "paragraphs": [
          {
            "text": "ระวังบอท “ปลดล็อก” เว็บไซต์เลียนแบบ และเครื่องมือที่อ้างว่าสามารถข้ามข้อจำกัด Telegram หลายตัวต้องการสิทธิ์บัญชีที่อ่อนไหวหรือเข้าถึงสื่อส่วนตัวอย่างปลอดภัยไม่ได้"
          }
        ]
      },
      {
        "id": "legal",
        "title": "กฎและกฎหมาย",
        "paragraphs": [
          {
            "text": "ขึ้นอยู่กับกฎของช่อง ลิขสิทธิ์ กฎหมายท้องถิ่น และวิธีใช้สำเนา การเก็บไว้อ้างอิงส่วนตัวต่างจากการโพสต์ขายหรือแชร์เนื้อหาของผู้อื่น"
          },
          {
            "text": "หากไม่แน่ใจ ให้ถามเจ้าของ เก็บสำเนาเป็นส่วนตัว และหลีกเลี่ยงเครื่องมือที่ทำลายสิทธิ์ Telegram หรือเก็บข้อมูลบัญชี"
          }
        ]
      }
    ],
    "comparison": {
      "title": "ตารางเปรียบเทียบ: ควรใช้วิธีใด?",
      "headers": [
        "วิธี",
        "โอกาสสำเร็จ",
        "ความเสี่ยงบัญชี",
        "อนุญาตไหม",
        "เหมาะกับ"
      ],
      "rows": [
        {
          "cells": [
            "ถามผู้ดูแล",
            "สูง",
            "ไม่มี",
            "ใช่",
            "ไฟล์ต้นฉบับและเนื้อหาส่วนตัวหรือชำระเงิน"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "กลาง",
            "ต่ำ",
            "เมื่อคุณเห็นโพสต์ได้",
            "เล่น ตรวจสอบ และขั้นตอนในเครื่องที่อนุญาต"
          ]
        },
        {
          "cells": [
            "อัดหน้าจอ",
            "กลาง",
            "ต่ำ",
            "เฉพาะเมื่อได้รับอนุญาต",
            "สำเนาอ้างอิงส่วนตัว"
          ]
        },
        {
          "cells": [
            "ส่งต่อไป Saved Messages",
            "ต่ำถึงกลาง",
            "ต่ำ",
            "เมื่อยังส่งต่อได้",
            "โพสต์ที่ยังส่งต่อได้"
          ]
        },
        {
          "cells": [
            "บอท ปลดล็อก ภายนอก",
            "ไม่น่าเชื่อถือ",
            "สูง",
            "ไม่",
            "ควรหลีกเลี่ยง"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "ทำไมฉันบันทึกวิดีโอจากช่อง Telegram นี้ไม่ได้แล้ว?",
          "answer": "เจ้าของช่องน่าจะเปิด Restrict saving content ทำให้ Telegram ซ่อนหรือปิดปุ่มบันทึก ส่งต่อ และคัดลอก"
        },
        {
          "question": "ฉันข้ามสิทธิ์โดยไม่ใช้แอปได้ไหม?",
          "answer": "ไม่ควรพยายามข้ามสิทธิ์ ให้ถามผู้ดูแล ใช้ Telegram Desktop หรือ Telegram Web เพื่อดูในขอบเขตที่อนุญาต ลอง Saved Messages หากยังส่งต่อได้ หรืออัดเมื่อได้รับอนุญาต"
        },
        {
          "question": "เจ้าของช่องจะรู้ไหมว่าฉันอัดหรือแคปหน้าจอ?",
          "answer": "พฤติกรรม Telegram อาจเปลี่ยนตามแพลตฟอร์มและชนิดเนื้อหา อย่าพึ่งความลับ ให้ทำเมื่อมีสิทธิ์เท่านั้น"
        },
        {
          "question": "บริการบอทดาวน์โหลด Telegram ปลอดภัยไหม?",
          "answer": "หลายบริการไม่ปลอดภัย หลีกเลี่ยงบอทหรือเว็บที่ขอรหัสเข้าสู่ระบบ รหัสผ่าน ข้อมูล เซสชัน API ที่ส่งออก หรือสิทธิ์บัญชีกว้างเกินไป"
        },
        {
          "question": "Telegram Premium ปลดข้อจำกัดได้ไหม?",
          "answer": "ไม่ได้ Telegram Premium ไม่สามารถทับ Restrict saving content ที่เจ้าของช่องตั้งไว้"
        }
      ]
    },
    "howTo": {
      "name": "วิธีจัดการช่อง Telegram ที่ปิดดาวน์โหลด",
      "description": "ใช้ขั้นตอนที่ปลอดภัยและถูกต้องเมื่อช่องปิดการบันทึกหรือส่งต่อ",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "ตรวจสิทธิ์และการอนุญาต",
          "anchor": "before-you-start",
          "text": "เปิดโพสต์ที่ถูกต้องและยืนยันว่าคุณเก็บสำเนาส่วนตัวได้"
        },
        {
          "name": "ถามผู้ดูแลก่อน",
          "anchor": "workaround-1",
          "text": "ขออนุญาต ขอสำเนาที่ดาวน์โหลดได้ หรือสิทธิ์บันทึกชั่วคราว"
        },
        {
          "name": "ใช้ Telegram Desktop หรือ Telegram Web",
          "anchor": "workaround-2",
          "text": "เปิดโพสต์ใน Telegram Desktop หรือ Telegram Web โดยไม่ส่งข้อมูลลับของบัญชี"
        },
        {
          "name": "ใช้ทางเลือกสำรองที่อนุญาต",
          "anchor": "workaround-3",
          "text": "ถ้าบันทึกต้นฉบับไม่ได้แต่อนุญาตให้บันทึกส่วนตัว ให้อัดหน้าจอ หรือใช้ Saved Messages เมื่อยังส่งต่อได้"
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "บางช่องบล็อกการบันทึกโดยตรงแต่ยังให้ส่งต่อได้ ให้ส่งโพสต์ไปที่ Saved Messages แล้วตรวจว่า Telegram อนุญาตให้บันทึกจากตรงนั้นหรือไม่"
        }
      ]
    },
    "bottomLine": {
      "title": "สรุป",
      "text": "เริ่มจากการขออนุญาต ถามผู้ดูแล ใช้ Telegram Desktop หรือ Telegram Web เพื่อดูให้ชัด อัดเฉพาะการใช้งานส่วนตัวที่ได้รับอนุญาต และหลีกเลี่ยงเครื่องมือปลดล็อกที่ขอรหัสหรือเซสชัน Telegram"
    }
  },
  "id-ID": {
    "seo": {
      "title": "Unduhan dinonaktifkan di kanal Telegram: cara yang benar-benar berfungsi",
      "description": "Unduhan dinonaktifkan di kanal Telegram? Pelajari penyebabnya, cara aman dan sah untuk menyimpan video, foto, file, serta alat yang harus dihindari."
    },
    "linkLabel": "Kanal dengan unduhan dinonaktifkan",
    "breadcrumb": {
      "home": "Beranda",
      "current": "Cara untuk kanal dengan unduhan dinonaktifkan"
    },
    "hero": {
      "title": "Unduhan dinonaktifkan di kanal Telegram? Ini caranya",
      "intro": "Ketika unduhan dinonaktifkan di kanal Telegram, tombol unduh hilang, opsi simpan ke galeri menjadi abu-abu, dan penerusan diblokir. Anda tidak melakukan kesalahan; pemilik kanal mengaktifkan pengaturan privasi. Di bawah ini adalah cara tercepat, lalu alasan terjadinya dan setiap metode aman yang diurutkan berdasarkan keandalan.",
      "imageAlt": "Antarmuka untuk media Telegram Web yang sudah terlihat oleh pengguna"
    },
    "workspace": {
      "title": "Tempel tautan video Telegram",
      "submit": "Mulai unduhan",
      "helperText": "Kanal Telegram memblokir unduhan? Simpan video HD, gambar, dan file seketika, tanpa root. Lewati batasan dengan satu klik. Konten Anda, aturan Anda."
    },
    "quickAnswer": {
      "title": "Jawaban cepat (perbaikan tercepat):",
      "items": [
        "Minta admin kanal mengirim file: peluang berhasil tertinggi, tanpa risiko.",
        "Buka di Telegram Web / Desktop, lalu rekam layar bagian yang boleh Anda lihat (bawaan iOS, Android, macOS, Windows).",
        "Coba teruskan ke Saved Messages: beberapa kanal memblokir unduhan tetapi tidak memblokir penerusan."
      ],
      "warning": "Hindari bot “pembuka kunci” pihak ketiga yang meminta kode login: bot seperti itu bisa membuat akun diblokir dan sering melanggar ketentuan Telegram."
    },
    "toc": {
      "title": "Dalam panduan ini",
      "items": [
        {
          "label": "Mengapa unduh dinonaktifkan",
          "anchor": "why-disabled"
        },
        {
          "label": "Pemeriksaan 10 detik",
          "anchor": "before-you-start"
        },
        {
          "label": "Tanya admin",
          "anchor": "workaround-1"
        },
        {
          "label": "Telegram Desktop atau Telegram Web",
          "anchor": "workaround-2"
        },
        {
          "label": "Rekam layar",
          "anchor": "workaround-3"
        },
        {
          "label": "Saved Messages",
          "anchor": "workaround-4"
        },
        {
          "label": "Bot pihak ketiga",
          "anchor": "third-party"
        },
        {
          "label": "Tabel perbandingan: metode mana yang dipakai?",
          "anchor": "comparison"
        },
        {
          "label": "Aturan dan legalitas",
          "anchor": "legal"
        },
        {
          "label": "FAQ",
          "anchor": "faq"
        }
      ]
    },
    "sections": [
      {
        "id": "why-disabled",
        "title": "Mengapa unduh dinonaktifkan",
        "paragraphs": [
          {
            "text": "Pemilik kanal Telegram dapat mengaktifkan Restrict saving content untuk mengurangi penyalinan, teruskan, screenshot, dan berbagi ulang. Ini adalah pilihan izin kanal, bukan bug ponsel atau browser."
          },
          {
            "text": "Pengaturan ini dapat memengaruhi video, foto, dokumen, album, dan pesan teruskan. Downloader web juga bisa gagal jika media hanya tersedia di dalam Telegram session Anda yang sudah login."
          }
        ],
        "note": "Batas aman sederhana: simpan hanya konten yang boleh Anda lihat dan simpan, dan jangan distribusikan ulang tanpa izin."
      },
      {
        "id": "before-you-start",
        "title": "Pemeriksaan 10 detik",
        "paragraphs": [
          {
            "text": "Pastikan dulu Anda masih bisa membuka postingan persisnya di Telegram. Jika kanal tidak bisa diakses atau pesan dihapus, tidak ada cara yang sah sah untuk memulihkannya."
          }
        ],
        "list": {
          "items": [
            "Bisakah Anda membuka postingan yang tepat?",
            "Apakah aturan kanal mengizinkan penyimpanan pribadi?",
            "Apakah Anda butuh file asli atau rekaman referensi pribadi sudah cukup?"
          ]
        }
      },
      {
        "id": "workaround-1",
        "title": "Tanya admin",
        "paragraphs": [
          {
            "text": "Cara paling bersih adalah meminta izin, salinan yang bisa diunduh, atau postingan sementara dengan penyimpanan aktif. Ini menghindari risiko akun dan menghormati aturan kanal."
          },
          {
            "text": "Ini paling cocok untuk materi kursus, konten berbayar, dokumen, dan video yang memerlukan kualitas asli."
          }
        ]
      },
      {
        "id": "workaround-2",
        "title": "Telegram Desktop atau Telegram Web",
        "paragraphs": [
          {
            "text": "Jika media terlihat oleh Anda, buka postingan yang sama di Telegram Desktop atau Telegram Web. Tampilan ini memudahkan pemutaran, pemeriksaan file, dan alur lokal yang diizinkan."
          }
        ]
      },
      {
        "id": "workaround-3",
        "title": "Rekam layar",
        "paragraphs": [
          {
            "text": "Jika simpan dan teruskan diblokir tetapi Anda boleh menyimpan salinan pribadi, rekam layar bisa menjadi opsi cadangan praktis. Rekam hanya konten yang boleh Anda simpan."
          },
          {
            "text": "Cara ini lebih lambat dan kualitasnya lebih rendah daripada file asli, jadi gunakan untuk referensi pribadi, bukan untuk melewati aturan distribusi."
          }
        ]
      },
      {
        "id": "workaround-4",
        "title": "Saved Messages",
        "paragraphs": [
          {
            "text": "Sebagian kanal memblokir simpan langsung tetapi masih mengizinkan teruskan. Forward postingan ke Saved Messages, lalu periksa apakah Telegram mengizinkan penyimpanan dari sana."
          },
          {
            "text": "Jika teruskan juga diblokir, jangan gunakan bot yang meminta kode. Mintalah salinan resmi atau gunakan rekaman pribadi yang diizinkan."
          }
        ]
      },
      {
        "id": "third-party",
        "title": "Bot pihak ketiga",
        "paragraphs": [
          {
            "text": "Hati-hati dengan bot “pembuka kunci”, situs tiruan, dan alat yang menjanjikan melewati izin batasan Telegram. Banyak yang meminta akses akun sensitif atau tidak bisa mengakses media privat dengan aman."
          }
        ]
      },
      {
        "id": "legal",
        "title": "Aturan dan legalitas",
        "paragraphs": [
          {
            "text": "Jawabannya tergantung aturan kanal, hak cipta, hukum lokal, dan cara Anda memakai salinan. Referensi pribadi berbeda dari repost, menjual, atau membagikan konten orang lain."
          },
          {
            "text": "Jika ragu, tanyakan kepada pemilik, simpan salinan secara pribadi, dan hindari alat yang mencoba merusak izin Telegram atau mengumpulkan kredensial akun."
          }
        ]
      }
    ],
    "comparison": {
      "title": "Tabel perbandingan: metode mana yang dipakai?",
      "headers": [
        "Metode",
        "Tingkat sukses",
        "Risiko akun",
        "Diizinkan?",
        "Terbaik untuk"
      ],
      "rows": [
        {
          "cells": [
            "Tanya admin",
            "Tinggi",
            "Tidak ada",
            "Ya",
            "File asli dan konten privat atau berbayar"
          ]
        },
        {
          "cells": [
            "Telegram Desktop/Telegram Web",
            "Sedang",
            "Rendah",
            "Saat Anda bisa melihat postingan",
            "Pemutaran, pemeriksaan, dan alur lokal yang diizinkan"
          ]
        },
        {
          "cells": [
            "Rekam layar",
            "Sedang",
            "Rendah",
            "Hanya dengan izin",
            "Salinan referensi pribadi"
          ]
        },
        {
          "cells": [
            "Forward ke Saved Messages",
            "Rendah sampai sedang",
            "Rendah",
            "Hanya jika teruskan aktif",
            "Postingan yang masih bisa di-teruskan"
          ]
        },
        {
          "cells": [
            "Bot pembuka kunci pihak ketiga",
            "Tidak andal",
            "Tinggi",
            "Tidak",
            "Hindari"
          ]
        }
      ]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Mengapa saya tidak bisa lagi menyimpan video dari kanal Telegram ini?",
          "answer": "Pemilik kanal kemungkinan mengaktifkan Restrict saving content. Telegram menyembunyikan atau menonaktifkan kontrol simpan, teruskan, dan salin."
        },
        {
          "question": "Bisakah saya melewati izin tanpa aplikasi?",
          "answer": "Anda tidak seharusnya melewati izin. Tanya admin, gunakan Telegram Desktop atau Telegram Web untuk melihat yang diizinkan, coba Saved Messages jika teruskan aktif, atau rekam untuk penggunaan pribadi saat diizinkan."
        },
        {
          "question": "Apakah pemilik kanal tahu jika saya merekam atau screenshot?",
          "answer": "Perilaku Telegram dapat berubah menurut platform dan jenis konten. Jangan mengandalkan kerahasiaan; lakukan hanya saat Anda punya izin."
        },
        {
          "question": "Apakah layanan bot unduh Telegram aman?",
          "answer": "Banyak yang tidak aman. Hindari bot atau situs yang meminta kode login, kata sandi, kredensial API, sesi yang diekspor, atau akses akun luas."
        },
        {
          "question": "Apakah Telegram Premium menghapus batasan ini?",
          "answer": "Tidak. Telegram Premium tidak menimpa Restrict saving content yang diatur pemilik kanal."
        }
      ]
    },
    "howTo": {
      "name": "Cara menangani kanal Telegram dengan unduh dinonaktifkan",
      "description": "Gunakan langkah aman dan sah ketika kanal menonaktifkan simpan atau teruskan.",
      "totalTime": "PT5M",
      "tools": [
        "Telegram app (mobile or desktop)",
        "Built-in screen recorder (iOS, Android, macOS, or Windows)"
      ],
      "steps": [
        {
          "name": "Periksa akses dan izin",
          "anchor": "before-you-start",
          "text": "Buka postingan yang tepat dan pastikan Anda boleh menyimpan salinan pribadi."
        },
        {
          "name": "Tanya admin lebih dulu",
          "anchor": "workaround-1",
          "text": "Minta izin, salinan yang bisa diunduh, atau akses simpan sementara."
        },
        {
          "name": "Gunakan Telegram Desktop atau Telegram Web",
          "anchor": "workaround-2",
          "text": "Buka postingan di Telegram Desktop atau Telegram Web tanpa memberikan rahasia akun."
        },
        {
          "name": "Gunakan opsi cadangan yang diizinkan",
          "anchor": "workaround-3",
          "text": "Jika file asli tidak boleh disimpan tetapi rekaman pribadi diizinkan, rekam layar atau gunakan Saved Messages saat teruskan masih aktif."
        },
        {
          "name": "Saved Messages",
          "anchor": "workaround-4",
          "text": "Sebagian kanal memblokir simpan langsung tetapi masih mengizinkan teruskan. Forward postingan ke Saved Messages, lalu periksa apakah Telegram mengizinkan penyimpanan dari sana."
        }
      ]
    },
    "bottomLine": {
      "title": "Intinya",
      "text": "Mulai dari izin: tanya admin, gunakan Telegram Desktop atau Telegram Web untuk tampilan lebih jelas, rekam hanya untuk penggunaan pribadi yang diizinkan, dan hindari alat pembuka kunci yang meminta kode atau sesi Telegram."
    }
  }
} satisfies Record<Locale, DownloadDisabledChannelWorkaroundPageContent>
