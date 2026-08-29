# Cloudflare Website Rules

本目录记录 website 站点在 Cloudflare 上的手工配置。当前包含：

- `retired-page-redirects.csv`：Bulk Redirects 导入文件。
- `cache-rules.md`：必须绕过缓存的后端资源规则。

## Cache Rules

见 `cache-rules.md`。其中生产站与测试站的 `/assets/icons/logo.svg` 和 `/assets/icons/credits.svg` 必须绕过 Cloudflare 缓存，因为请求需要打到后端写入 `device_trust`。

## Retired Page Redirects

`retired-page-redirects.csv` 用于 Cloudflare Bulk Redirects。它只处理已删除或合并信息页的 301，不再做根路径语言自动跳转。

## 行为

- `/features/`、`/guide/`、`/faq/`、`/pricing/` 永久跳转到英文首页 `/`。
- `/{lang}/features/`、`/{lang}/guide/`、`/{lang}/faq/`、`/{lang}/pricing/` 永久跳转到对应语言首页。
- `/solutions/` 永久跳转到英文 workaround 指南 `/telegram-download-disabled-channel-workaround/`。
- `/{lang}/solutions/` 永久跳转到对应语言 workaround 指南 `/{lang}/telegram-download-disabled-channel-workaround/`。
- 同时覆盖带尾斜杠和不带尾斜杠两种旧 URL。
- 状态码统一 `301`。
- Preserve query string 为 `true`，例如 `/zh-cn/solutions/?utm_source=gsc` 到 `/zh-cn/telegram-download-disabled-channel-workaround/?utm_source=gsc`。
- 不配置 `/` 的 Accept-Language 语言跳转。

## 部署

1. Cloudflare Dashboard 打开账号级 `Bulk redirects`。
2. 创建 Bulk Redirect List，例如 `tg-download-retired-pages`。
3. 导入 `website/cloudflare/retired-page-redirects.csv`。
4. 创建 Bulk Redirect Rule，选择该 list，保存并部署。

CSV 列格式：

```text
source_url,target_url,status_code,preserve_query_string
```

文件不包含 header，符合 Cloudflare Bulk Redirects 导入格式。

## 验证

```bash
curl -I https://telegramdownloadmedia.com/features/
curl -I https://telegramdownloadmedia.com/guide?utm_source=gsc
curl -I https://telegramdownloadmedia.com/zh-cn/guide/?utm_source=gsc
curl -I https://telegramdownloadmedia.com/solutions/
curl -I https://telegramdownloadmedia.com/zh-cn/solutions/?utm_source=gsc
curl -I https://telegramdownloadmedia.com/zh-cn/pricing/?utm_source=gsc
curl -I https://telegramdownloadmedia.com/ja/faq/
curl -I -H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' https://telegramdownloadmedia.com/
```

预期：

- `/features/` 返回 `301 Location: https://telegramdownloadmedia.com/`。
- `/guide?utm_source=gsc` 返回 `301 Location: https://telegramdownloadmedia.com/?utm_source=gsc`。
- `/zh-cn/guide/?utm_source=gsc` 返回 `301 Location: https://telegramdownloadmedia.com/zh-cn/?utm_source=gsc`。
- `/solutions/` 返回 `301 Location: https://telegramdownloadmedia.com/telegram-download-disabled-channel-workaround/`。
- `/zh-cn/solutions/?utm_source=gsc` 返回 `301 Location: https://telegramdownloadmedia.com/zh-cn/telegram-download-disabled-channel-workaround/?utm_source=gsc`。
- `/zh-cn/pricing/?utm_source=gsc` 返回 `301 Location: https://telegramdownloadmedia.com/zh-cn/?utm_source=gsc`。
- `/ja/faq/` 返回 `301 Location: https://telegramdownloadmedia.com/ja/`。
- `/` 不因 `Accept-Language` 自动跳转。
