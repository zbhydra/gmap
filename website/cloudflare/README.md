# Cloudflare Website Rules

本目录记录 MapsGrab 营销站在 Cloudflare 上的手工配置。当前包含：

- `retired-page-redirects.csv`：Bulk Redirects 导入文件。
- `cache-rules.md`：必须绕过缓存的后端资源规则。

## Cache Rules

见 `cache-rules.md`。生产站与测试站的 `/assets/icons/logo.svg` 和 `/assets/icons/credits.svg`
必须绕过 Cloudflare 缓存：请求要穿透到后端写入 `device_trust`（购买/登录链路基座）。

## Retired Page Redirects

`retired-page-redirects.csv` 用于 Cloudflare Bulk Redirects，只处理已删除或合并页面的 301。
当前为空：MapsGrab 是新站，正式域名上线后如有退役路径再补录（CSV 无 header，一行一条）。

## 部署

1. Cloudflare Dashboard 打开账号级 `Bulk redirects`。
2. 创建 Bulk Redirect List（如 `mapsgrab-retired-pages`）。
3. 导入本目录下的 `retired-page-redirects.csv`。
4. 创建 Bulk Redirect Rule 选择该 list，保存并部署。

CSV 列格式（不含 header）：

```text
source_url,target_url,status_code,preserve_query_string
```
