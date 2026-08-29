# 002 · 站点适配 — 源文档索引

> 本目录是站点适配层(`@../tech-站点适配.md`)的源文档索引(源 feat 文件已在域化重构中删除),这里只做归类引用,不复制内容,避免双源失配。
>
> 注:「产品 feat」列只写文字编号+中文名(源 feat 文件已删,路径为死链);产品 feat 中仍存活的 002 域内 `feat.md` 用相对 `@` 指针引用。引用顺序 = 矩阵阅读建议顺序。

## 平台资料与目标规格

本表用于定位现行实现和已确认目标规格；是否已经进入生产包以平台发布注册表、最终 manifest 和对应 plan 验收状态为准。

| 平台 | 产品 feat | 矩阵小节 |
| --- | --- | --- |
| `telegram` | `feat.004 telegram 资源扫描`(扩展扫描)<br>`feat.024 website 首页 private 视频下载改造`(首页默认插件卡片 + 扩展引导边界)<br>`@../feat.md`(其他复用页 >=500MiB 桌面端插件卡片)<br>`@../feat.md`(TG video Play,独立 JWT,非下载链路) | `tech-站点适配.md` §5.1<br>`@../tech-扩展端TG扫描.md`(承接 feat.004 扩展端扫描,源过时点见该文 §12) |
| `tiktok` | `feat.015 website-tiktok 下载`(website)<br>`feat.016 插件端 tiktok 下载`(扩展) | §5.2 |
| `vimeo` | `feat.017 website 端 vimeo 下载`<br>`扩展端 Vimeo 纯前端下载` | §5.3<br>`@../tech-扩展端Vimeo本地下载.md` |
| `x` | `feat.019 website 端 X 下载`<br>`扩展端 X 本地下载` | §5.4<br>`@../tech-扩展端X本地下载.md` |
| `instagram` | `feat.021 website 端 Instagram 与 Threads 下载`(视频)<br>`feat.023 website 端 Instagram 图片与相册下载`(图片/相册)<br>`扩展端 Instagram 本地下载重构` | §5.5<br>`@../tech-扩展端Instagram本地下载.md` |
| `threads` | `feat.021 website 端 Instagram 与 Threads 下载`<br>`扩展端 Threads 本地下载` | §5.6<br>`@../tech-扩展端Threads本地下载.md` |
| `reddit` | `feat.022 website 端 Reddit 视频与 client_mux 下载`(视频 client_mux + 图片/相册 direct) | §5.7 + §4(client_mux 轨道) |
| `douyin` | `feat.038 website 端 Douyin 视频直连下载` | §5.8 |

## 扩展端架构与验收

| 主题 | 文档入口 |
| --- | --- |
| Instagram 页面、Profile Grid 与当前 tab Popup | `@../tech-扩展端Instagram本地下载.md` |
| 共享逐项下载与 EventRpc | `@../../000.架构/tech-插件RPC.md` §3、§6、§10 |
| 插件端确定性 E2E 与真实站点验收 | `@../test-插件端e2e.md` |

## 下载方法架构基线

| 主题 | 文档 | 用途 |
| --- | --- | --- |
| 下载方法架构重构 | `feat.039 website 下载方法架构重构` | `DOWNLOAD_METHODS` 注册表、dispatcher、DownloadActionPlan、续传契约(已并入 `@../tech-下载方法与续传.md`) |
| 后端媒体 Provider 架构 | `@../tech-后端媒体Provider架构.md` | 后端每平台 Provider、parse/download 契约、stream/json result、活跃下载并发生命周期 |
| 下载存储能力治理 | `@../feat.md`(002 下载功能) | OPFS / IndexedDB / Memory 三层存储 + 真实写入探测 + 运行时 Memory 降级(已并入 `@../tech-下载存储治理.md`) |

## 使用约定

- 矩阵阅读入口:`@../tech-站点适配.md`(以代码为准)。
- 站点产品/交互/UI 细节:回到原 feat(源文件已删,以并入的 tech 为准)。
- 接口规格、数据结构、执行步骤:以并入的 tech 为准。
- 原 feat 与代码冲突时,以代码为准并同步更新 `@../tech-站点适配.md`。
