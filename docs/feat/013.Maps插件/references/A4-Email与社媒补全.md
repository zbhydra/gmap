# A4 · Email 与社媒补全(竞品调研)

> Roadmap:A4 · 调研:🔍 完成(协议实测确认)· 深读:scratch 逆向 06(含实测)

## 功能定义

对采集到的商家补全官网 Email 地址与社交媒体链接(Facebook/Instagram/YouTube/TikTok/LinkedIn/Twitter),写入导出行。这是竞品的**核心付费增值**:数据源在作者服务端,客户端只展示——服务端可实现计量、限流、黑名单。

## 用户操作(竞品)

1. 面板/设置中勾选 "Extract email address" / "Extract social medias"(均为 **Pro 专属字段**,免费勾了会被剔除)。
2. 采集过程中自动逐条补全,导出行 Email 列为逗号分隔邮箱、Social Medias 列为 `平台: url` 多行文本。
3. 勾选时每条商家会调服务端云函数(自然计量);未勾选时发纯计数上报(免费也有月度计量)。

## 竞品实现逻辑

- 采集流程:服务端先下发挖掘参数(算法版本/批量大小/分流开关)→ 逐条调 `findV3`,入参 = 商家域名 + 名称+地址 + kgmid + 官网 + 关键词,出参 = `{emails[], medias{instagram, facebook,…}}` → 写回 pin;旧版回退 `fetchEmail`(仅邮箱)。
- **服务端实现不可见**(Cloud Functions),但已实测确认协议:`getFindParams` 无认证即返回,业务层全靠入参 license key 区分;`isPro`/`license` 的校验行为也已实测(见 scratch 11 号 #6)。
- 成本与缺口参照:`research/google-maps-scraping-方案调研.md` §7——社媒数据不在 Maps 页面,唯一现实来源是商家官网(footer 外链域名匹配);本地小商家覆盖天然低。

## 我方落地要点(已拍板,scratch 11 号 #6)

- **自研,不调用竞品生产后端**:Email = 官网访问 + 正则;社媒 = 官网 HTML 外链抽取为主、搜索兜底;无未知风险,常规工程活。
- 属于 014 云端能力(服务端执行),插件只是消费方——插件侧实现仅剩勾选项与结果展示。
- 计费口径:该能力按条计量扣费(对应 C3),与竞品「免费也有计量」的策略对齐。
