# 002 · 站点适配(各平台差异矩阵)

> 技术实现文档。覆盖:每个站点(平台)的解析方式、采用的 `download_mode`、`client_mux` 轨道处理、特殊边界(私密/相册/HLS/大文件引导等)、website 与 extension 的差异。
>
> 本文档是 002 下载功能的**平台扩展层**:下载主链路(V2/授权/token/续传/速率/前端切换)已在同目录另外四个 `tech-*.md` 描述,本文只补「各站点的差异」。
>
> 关联:
> - 本域产品:`@feat.md`
> - 下载方法与续传(当前 mode 契约、dispatcher):`@tech-下载方法与续传.md`
> - V2 链路与接口规格:`@tech-链路与授权.md`
> - 前端切换:`@tech-前端切换.md`
> - 速率治理:`@tech-速率治理.md`
> - 各站点原始 feat 与 plan 索引:`@references/index.md`
>
> 原则:**以代码为准**。本文只保留当前已接入、当前已注册的站点与 mode。

## 1. 域边界

站点适配层只描述「同一套 V2 下载链路在不同平台上有什么不同」:

- 平台识别(host 白名单、URL 规范化、路径白名单)。
- 解析方式(yt-dlp / Playwright 过墙 / SSR HTML / cookie 缓存)。
- parse 阶段产出的 `download_mode`(proxy / direct / client_mux)。
- 资源形态(单视频 / 单图片 / 图集 / 双轨 / HLS / 直链输入)。
- 特殊边界(私密频道引导、相册 Download all、HLS 限制、大文件插件引导)。
- website 端 vs extension 端的能力差异。

**不属于本层**:节点调度、token 签发与验签、4GiB 上限、扣积分去重、Range 续传协议、限速值来源、前端 mode 注册表与 dispatcher——这些都在另四个 `tech-*.md`。

## 2. 平台注册表(以代码为准)

前端平台识别在 `website/src/download/scripts/platform.ts` 的 `detectPlatform()`;后端平台识别在 `backend/src/app/contracts/media_platform.py::detect_platform()`。平台解析/下载入口固定收敛到 `backend/src/app/provider/media/{platform}_media.py`;有状态基础设施放在 `backend/src/app/provider/telegram_manager.py`、`backend/src/app/provider/browser_runtime.py`、`backend/src/app/provider/media_cookie_pool.py` 等 provider 基础设施模块。`provider/media` 不依赖 `app.services`，不保留旧 service 双轨。

### 2.1 现行已落地的平台与 Provider/runtime

| 平台 (`platform`) | 前端 host 白名单 | 后端入口 | 解析方式 | 资源形态 |
| --- | --- | --- | --- | --- |
| `telegram` | `t.me`、`telegram.me` 及子域;`web.telegram.org`(扩展识别) | `provider/media/telegram_media.py` + `provider/telegram_manager.py` | TG client / RPC `GET_STREAM_URL` | 视频/图片/音频/文档,含相册 |
| `tiktok` | `tiktok.com`、`vm/vt/m.tiktok.com` | `provider/media/tiktok_media.py` | SSR 页面 JSON 优先，`yt-dlp` fallback；下载上游 HTTP 由 Provider 本次请求内打开和释放 | 单视频、图集 |
| `vimeo` | `vimeo.com`、`www.vimeo.com`、`player.vimeo.com` | `provider/media/vimeo_media.py` | `yt-dlp` | 单视频 |
| `x` | `x.com`、`twitter.com`、`mobile.twitter.com` 及子域 | `provider/media/x_media.py` | `yt-dlp`(extractor `twitter`) | 单视频 |
| `instagram` | `instagram.com`、`www.instagram.com` | `provider/media/instagram_media.py` + `provider/media/meta_media_url.py` / `meta_ssr_extractor.py` | 视频 `yt-dlp`;图片 SSR;Story SSR/Relay | 视频、单图、纯图片相册、Story |
| `threads` | `threads.com`、`threads.net` 及子域 | `provider/media/threads_media.py` + `provider/media/meta_media_url.py` / `meta_ssr_extractor.py` | 受控浏览器执行页面,读取 `carousel_media` | 视频、图片、混合相册 |
| `reddit` | `reddit.com`、`www/old/new.reddit.com`、`redd.it` | `provider/media/reddit_media.py` + `provider/browser_runtime.py` | Playwright 过 PerimeterX 墙 + cookie 缓存 + httpx `.json` | 视频帖、图片帖、相册帖 |
| `douyin` | `douyin.com`、`www.douyin.com`、`v.douyin.com`、`www.iesdouyin.com` | `provider/media/douyin_media.py` + `provider/browser_runtime.py` | SSR `_ROUTER_DATA` 优先,`jingxuan`/SSR 失败时 Playwright fallback | 单视频 |

## 3. download_mode 矩阵

### 3.1 现行注册的 mode(代码为准)

`website/src/download/scripts/download-methods.ts::DOWNLOAD_METHODS` 只注册三种:

| `download_mode` | runner | 现行使用平台 |
| --- | --- | --- |
| `proxy` | `proxy-download.ts::runProxyDownload` | `telegram`、`tiktok` |
| `direct` | `direct-download.ts::runDirectDownload` | `vimeo`、`x`、`instagram`、`threads`、`reddit`(图片/相册)、`douyin` |
| `client_mux` | `client-mux-download.ts::runClientMuxDownload` | `reddit`(视频帖双轨) |

当前已注册 mode 的完整契约(sessionPolicy / queueDefault / quotaTiming / requiresIntent / canResume)见 `@tech-下载方法与续传.md` §2。

### 3.2 按平台汇总 `download_mode`

| 平台 | 资源类型 | `download_mode` | `download-v2` 响应 |
| --- | --- | --- | --- |
| `telegram` | video/photo/audio/document | `proxy` | `download-pre-v2` → `download-v2`(文件流) |
| `telegram` | video(私密/受限) | — | `parse-v2` 返回 `requires_client`,前端走扩展引导,不进下载链路 |
| `tiktok` | video / image(图集) | `proxy` | `download-pre-v2` → `download-v2`(文件流) |
| `vimeo` | video | `direct` | `download-v2` 返回 `download_url` |
| `x` | video(单) | `direct` | `download-v2` 返回 `download_url` |
| `instagram` | video(reel/post) | `direct` | `download-v2` 返回 `download_url` |
| `instagram` | image(单图/相册) | `direct` | `download-v2` 返回 `download_url`,每张独立 `source_id` |
| `threads` | video / image / 混合相册 | `direct` | `download-v2` 返回 `download_url` |
| `reddit` | 视频帖 | `client_mux` | `download-v2` 返回 tracks JSON |
| `reddit` | 图片帖 / 相册 | `direct` | `download-v2` 返回 `download_url` |
| `douyin` | video(单,音视频合一) | `direct` | `download-v2` 返回 `download_url` |

> Website/backend 下载执行走 `download-pre-v2` → `download-v2` 统一链路(见 `@tech-链路与授权.md`)。`download-v2` 按 Provider 返回的 result 生成文件流、direct JSON 或 client_mux JSON。扩展端 X / Instagram 本地下载不适用本 V2 链路；是否进入发布产物以 `extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 为准。

## 4. client_mux 轨道处理(Reddit 视频帖)

`client_mux` 是当前唯一使用浏览器端合成的方式,仅 Reddit 视频帖使用。Reddit 图片帖/相册走 `direct`,不进 `client_mux`。

| 维度 | 口径 |
| --- | --- |
| 适用平台 | `reddit`(`post_hint=image` 走 direct;`is_gallery` 走 direct 多图) |
| 轨道来源 | parse 阶段由 `provider/media/reddit_media.py::RedditMedia` 筛选最佳视频轨 + 音频轨,轨道 URL 隐藏,只在 `download-v2` 返回 |
| 视频轨 host | `v.redd.it`(必须 `https`) |
| 音频轨 host | `v.redd.it`(必须 `https`) |
| 合成方式 | 浏览器端 Mediabunny `EncodedVideoPacketSource`/`EncodedAudioPacketSource` 无转码 remux |
| `sessionPolicy` | `none`(本阶段不跨刷新恢复) |
| `canResume` | `false`(`DOWNLOAD_METHODS.client_mux.canResume = () => false`) |
| `queueDefault` | `deny`(client_mux 资源不进 Download all 队列) |
| `quotaTiming` | `authorization` |
| 大小上限 | 首版 50MB(parse 后资源详情显示总大小,超限 Download disabled) |
| 失败 reason | `track_fetch_failed` / `client_mux_failed` / `client_mux_too_large` |
| 错误对象 | 只携带 `track_kind`、`status`、`reason`、`source_id`,不把 `download_url` 写入 `Error.message` |

## 5. 各站点解析差异详解

### 5.1 Telegram

| 维度 | 口径 |
| --- | --- |
| 平台识别 | host 白名单:`t.me`、`telegram.me` 及子域 |
| 解析执行 | 后端 TG client + RPC `GET_STREAM_URL`;扩展端在 `web.telegram.org` 的 K/A 版本扫描 DOM |
| 资源形态 | 视频、图片、音频、文档;同一消息可有多附件(相册) |
| `download_mode` | `proxy`(`capabilities.play=true` 仅 Telegram video 有) |
| 私密频道 | parse 返回 `requires_client`,website 走扩展引导;扩展端原生支持私有频道(扩展是私有频道主路径) |
| 相册 | 多附件按 source_id 区分,website 端逐个 Download,支持 Download all |
| 插件引导 | website 首页默认展示 Chrome/Edge 插件卡片,不依赖设备类型或解析结果;首页导航会更早请求同一张 Chrome Logo,因此导航与首屏 Chrome 卡片 Logo 均使用高请求优先级,Chrome/Edge 卡片 Logo 均不懒加载;其他复用页仍在 `telegram` + `size >= 500 MiB` + 桌面指针环境(`(hover: hover) and (pointer: fine)`)时展示,默认隐藏期间 Logo 保持懒加载;**下载点击不做大文件门控**,继续走网页下载 |
| 4GiB 上限 | 见 `@tech-链路与授权.md`,适用于所有平台,非 TG 专属 |
| 扩展端差异 | 扩展在 `web.telegram.org` 注入下载按钮,扫描 K 版(`.bubble-content-wrapper`)/A 版(`.message-content-wrapper`),3 秒轮询,500ms 检测聊天切换 |
| 首页链接前置校验 | website 首页对 `t.me/{username}` 单片段频道/用户主页链接本地拦截,展示 Smart Link Recovery Card 引导复制具体消息链接(feat.004 §11) |

### 5.2 TikTok

| 维度 | 口径 |
| --- | --- |
| 平台识别 | host 白名单:`tiktok.com`、`vm/vt/m.tiktok.com`(短链跳转) |
| 解析执行 | 后端 SSR 页面 JSON 优先，失败后 `yt-dlp` fallback(限定 TikTok);**禁止通用 yt-dlp 联网到任意站点**(SSRF) |
| 资源形态 | 单视频、图集(多图) |
| `download_mode` | `proxy`(后端代理 TikTok/CDN,前端只收本站流) |
| 范围外 | 主页/合集/tag/music/effect/搜索/直播;`direct_url` 直跳 |
| 断点续传口径 | 上游返回 `206` 透传续传;返回其它情况(含 `416`/`403`/`5xx`)一律按下载失败处理,前端清断点后由用户重新发起;CDN 签名过期(上游 `403`)允许一次性重解析刷新 direct_url,属 token 刷新非错误恢复 |

### 5.3 Vimeo

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `vimeo.com`、`www.vimeo.com`、`player.vimeo.com`(嵌入) |
| 解析执行 | website/backend 走 `yt-dlp` extractor,获取 CDN 直链(Akamai);扩展端走页面 Vimeo player config,纯前端解析 |
| 资源形态 | website/backend 为单视频 MP4;扩展端展示视频多画质、audio-only、thumbnail |
| `download_mode` | `direct`(浏览器直连 Vimeo CDN,服务端带宽 0) |
| CORS | Vimeo CDN 返回 `Access-Control-Allow-Origin: *`,扩展请求必须 `credentials: omit`;携带 Cookie 会被浏览器按 CORS 拒绝 |
| 直链刷新 | `direct` 方法内部最多刷新一次 intent(见 `@tech-下载方法与续传.md` §8.5) |
| 范围外 | 私有/密码保护/OTT/DRM;在线播放;后端代理下载(后续阶段) |
| 扩展端差异 | 插件在 Vimeo 页面标题区直接展示 Video / Audio / Image 下载按钮,消费 Vimeo 原生完整 signed config XHR 或 player 页内嵌 config,读取 progressive、DASH/HLS、thumbnail,不调用后端、不重建 config URL;详见 `@tech-扩展端Vimeo本地下载.md` |

#### 5.3.0 扩展端纯前端下载

扩展端 Vimeo 下载不复用 website 后端 `yt-dlp` 口径。插件在用户当前 Vimeo 页面内提取 `videoId`,捕获 Vimeo 原生 player config,直接展示全部可下载选项,不等用户点击后再展开。

- DOM 注入:优先挂到 `main [data-testid="vd-wrapper"] [data-testid="action-bar"]` 之前;也就是标题 `h1` 与 Vimeo 原生 action bar 之间。找不到 action bar 时插到 `h1` 后面。
- 自有面板:`data-testid="tgdl-vimeo-panel"`,内部固定三行:`tgdl-vimeo-row-video`、`tgdl-vimeo-row-audio`、`tgdl-vimeo-row-image`。
- config 来源:MAIN world 在 `document_start` 捕获详情页原生完整 signed config XHR/fetch;顶层 player 页读取初始 HTML 内嵌 playerConfig 与其原生 `config_refresh_url`。`videoId` 只用于身份匹配,禁止从 `videoId`/`h` 重建 config URL。
- 视频:优先列出 `request.files.progressive[]` 完整 MP4;若 DASH adaptive 在分辨率、fps 或 bitrate 上更优,下载 video track + audio track 后在浏览器内 mux 成 MP4。
- HLS:只作为 DASH 不可用时的安全 fallback;仅展示非加密 fMP4 HLS(master variant + media playlist,无 `#EXT-X-KEY`,有 `#EXT-X-MAP`,segment 命中 Vimeo CDN/Akamai),TS/encrypted/未知结构不展示。
- 音频:从 DASH playlist `audio[]` 列出所有独立音频轨,`Best Audio` 取最高码率,保存 `.m4a`。
- 图片:从 `video.thumbs` 取最大尺寸 thumbnail。
- Best 规则:progressive 与 adaptive 合并比较分辨率、fps、bitrate;三者都相同才优先 progressive。
- 失败刷新:config 过期或 CDN `403/404/410` 时,使用 `request.config_refresh_url` 或原 config URL 刷新一次,仍失败提示用户刷新页面。

### 5.4 X / Twitter

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `x.com`、`twitter.com`、`mobile.twitter.com` 及子域;路径 `/{user}/status/{id}`、`/i/web/status/{id}` |
| 解析执行 | `yt-dlp` extractor `twitter`,筛选 HTTP MP4,默认最高分辨率 |
| 资源形态 | 单视频 MP4(音视频合一);首期只返回 1 个最佳资源 |
| `download_mode` | `direct`(浏览器直连 `video.twimg.com`,服务端带宽 0) |
| 断点续传口径 | `video.twimg.com` 不对浏览器 `fetch` 暴露 `Content-Range`,网页端只用 OPFS 保存本次下载流;中断/刷新后只能 Restart/from 0,不能 Continue 拼接 |
| `source_id` | `x:{status_id}:video` |
| 直链 host 限制 | 只允许 `video.twimg.com` 或其明确子域 |
| 范围外 | 私密/受保护/登录墙;图片/GIF/投票;多视频/混合媒体;扩展端注入;在线播放 |

#### 5.4.0 扩展端本地下载

扩展端 X 下载不复用本节 website 后端解析口径。插件在用户当前 X 页面内本地扫描与捕获媒体，不调用后端，不新增 `downloads` 权限。

- 图片：content 从推文 article 的 photo 链接扫描 `pbs.twimg.com/media/*`，构造 `name=orig` 原图 URL。
- 视频/GIF-like：DOM `video` 只提供 tweet/poster 关联线索；MAIN 从 fetch/XHR JSON 和 HLS 请求 URL 有限捕获 `video.twimg.com` MP4/HLS，MP4 优先。
- HLS：支持非加密、含 `EXT-X-MAP`、独立音视频轨且全部 URL 命中白名单的 fMP4 HLS；顺序拉取后在 MAIN remux，768MiB 上限。
- 入口：Popup 资源列表、推文媒体面 36×36 单项按钮、固定 68px action slot 内的下载按钮；MutationObserver + route watcher + 3 秒 reconcile 覆盖 SPA/无限滚动。
- 页面进度：同 tweet 全部入口互斥禁用,不同 tweet 可独立入队,真实下载由页面 FIFO 串行执行。已知 `Content-Length` 显示向下取整的字节百分比，保存触发前最高 99；未知长度和 HLS 显示 `…`。action 批量显示 `1/2 50%`,Popup 顶部与任务浮层显示当前 FIFO 首项进度。
- 失败：单项恢复按钮供用户重试；批量当前项失败后继续下一项；SPA 路由切换不取消已开始下载。
- 完整资源模型、下载白名单、DOM 位置、进度事件和受控 E2E 见 `@tech-扩展端X本地下载.md`。

#### 5.4.1 X Cookie 池与解析链路(匿名优先 → Cookie 池 → Playwright fallback)

> Cookie 池的 **admin 管理接口**(增删改查、不回显明文、安全要求)属 `@../008.管理后台/tech-渠道设置.md`;本段只描述**运行时解析链路如何消费本地 Cookie 池文件**,属下载域。

**Cookie 池文件**(本地 JSON,不入业务数据库):

- 运行时相对路径固定为 `data/media-cookie/x.com.cookies.json`(仓库路径 `backend/data/media-cookie/x.com.cookies.json`)。
- 文件 schema:

```json
{
  "schema_version": 1,
  "cookies": [
    {
      "cookie_id": "url-safe-random-id",
      "name": "x-account-a",
      "enabled": true,
      "cookie_format": "header",
      "cookie_text": "auth_token=...; ct0=...",
      "last_used_at": 1780977600000,
      "last_success_at": null,
      "last_failure_at": null,
      "last_failure_reason": null,
      "created_at": 1780977000000,
      "updated_at": 1780977600000
    }
  ]
}
```

- `cookie_format ∈ {"header"(浏览器 Cookie header), "netscape"(Netscape cookiefile 文本)}`,运行时按格式解析。
- 管理端响应的 `key_fields.auth_token / ct0 / twid` 在读取时从 `cookie_text` 动态计算,不冗余写入文件;旧文件中的 `has_*` 字段读取时忽略。
- `last_failure_reason` 写入前必须脱敏。

**运行时解析链路**(`XMedia`,匿名优先的三级 fallback):

1. **匿名 yt-dlp 优先**:先执行现有匿名 `yt-dlp`(extractor `twitter`)解析。
2. **启用 Cookie 池逐条尝试**:匿名失败**且错误适合重试**时,读取 `enabled=true` 的 Cookie 记录,**按随机顺序**逐条尝试——每条 Cookie 转成**临时 Netscape cookiefile**(写入系统临时目录)给 `yt-dlp` 使用,调用结束删除临时文件。单条失败记录脱敏 `last_failure_reason` 并继续下一条;任一条成功记录 `last_success_at` 并返回解析结果。
3. **游客 Playwright Cookie fallback**:池文件不存在 / 格式不可用 / 全部 Cookie 失败时,继续走现有游客 Playwright Cookie fallback(必须保留,不因池存在而移除)。

**安全要求**(运行时消费侧):

- Cookie 明文不进 API 响应、不进后端日志、不进业务数据库。
- 临时 cookiefile 权限为 `0600`,调用结束删除。
- `media_channel_cookies` 不参与 X parse 读写。

### 5.5 Instagram

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `instagram.com`、`www.instagram.com`;路径 `/reel/{shortcode}`、`/p/{shortcode}`、`/stories/{username}`、`/stories/{username}/{story_id}` |
| 解析执行(视频) | `yt-dlp` |
| 解析执行(图片/相册) | SSR JSON 主帖图片提取;`yt-dlp` 对图片相册返回 `_type=playlist, entries_count=0` 不可用 |
| 解析执行(Story) | SSR JSON 提取当前请求身份可见的 Story 媒体,SSR 只有路由数据时尝试 Web Relay fallback;`/stories/{username}` 返回当前可见 active story 列表,`/stories/{username}/{story_id}` 按 story id 精确过滤 |
| Cookie 重试 | 匿名解析优先;可重试解析错误发生后,随机逐条使用当前节点启用的 Instagram Cookie;全部失败返回原匿名错误 |
| 资源形态 | 视频(reel/post)、单图、纯图片相册(每张独立 `source_id`,共用 `content_id`)、匿名或已配置 Cookie 账号可见的 Story 图片/视频 |
| `download_mode` | `direct` |
| `source_id` | 图片优先用媒体 `pk`;Story 用 `instagram:story:{username}:{type}:{media_id}`;缺 `pk/id` 时用稳定 URL 身份 hash |
| 直链 host 限制 | `.cdninstagram.com` 或 `.fbcdn.net` 后缀 |
| MIME 限制 | 图片只允许 `image/jpeg`、`image/webp`、`image/png` |
| 图片数上限 | 单帖最多 20 张,超过返回解析失败 |
| Story 数上限 | 单次最多 30 个媒体,超过返回解析失败;Story 解析/format 缓存 5 分钟,避免长时间保留过期 Story;匿名 SSR/Relay 只返回登录墙或空 `reels` 时进入 Cookie 重试,全部 Cookie 失败后按资源不可访问处理 |
| 缩略图 | 必须与原图 URL 不同且能证明是独立低清预览,否则不返回 |
| 解析限流差异 | 视频分支沿用共性 3 次/10 秒;**图片 `/p` 分支独立 limiter:1 次/15 秒 per user/device**(比共性严) |
| 直链刷新 | 图片下载遇 `403`/`404`/`410`/CORS 网络错误或 CDN 非 2xx 时,重新走 `download-pre-v2 -> download-v2` 刷新一次 direct JSON,重新解析并清断点从头重试一次 |
| website/backend 范围外 | 匿名与已配置 Cookie 账号都无权访问的私密内容、已过期 Story、Live、Highlights;混合视频相册;多视频相册;profile grid / 搜索 / tag 批量;在线播放 |
| 扩展端差异 | 插件在当前 Instagram 登录态内本地解析和下载,覆盖 Feed、详情/弹窗、Reels、Profile/Explore/Search/Hashtag Grid、Story/Highlight;不走 website/backend 链路。最终结构与实际验证见 `@tech-扩展端Instagram本地下载.md`、`@plans/008.*` 至 `@plans/018.*` |

#### 5.5.0 Instagram Cookie 池与解析链路(匿名优先 → Cookie 池)

Instagram 与 X 共用 `provider/media_cookie_pool.py` 的文件模型、Header / Netscape 解析、原子写入、状态记录和脱敏逻辑,但使用独立文件 `data/media-cookie/instagram.com.cookies.json`。管理端关键字段为 `sessionid`、`csrftoken`、`ds_user_id`,按读取时动态计算。

运行时顺序:

1. 先按现有路径执行匿名解析:Reel 与视频 Post 走 `yt-dlp`,纯图片 Post 在 `yt-dlp` 失败后走 SSR,Story 走 SSR 并按需调用 Relay。
2. 匿名返回 Instagram 视频或图片解析错误时,读取 `enabled=true` 的 Cookie,随机逐条重跑同一完整解析路径。
3. `yt-dlp` 分支把单条 Cookie 转成权限 `0600` 的临时 Netscape cookiefile;图片 / Story SSR 与 Relay 复用只绑定 `.instagram.com` 的 HTTP Cookie jar,不得把 Cookie 发给 `.cdninstagram.com`、`.fbcdn.net` 或其他域。
4. 每条尝试前记录 `last_used_at`;失败记录脱敏 `last_failure_reason` 并继续下一条;成功记录 `last_success_at`、清除旧失败并停止重试。
5. 池文件缺失、不可读或全部 Cookie 失败时抛出首次匿名错误,不进入 X 专用的游客 Playwright fallback。

#### 5.5.1 扩展端本地下载实现

扩展端 Instagram 与 website/backend 链接解析是两条独立链路。插件只处理用户当前标签页已经加载或按 shortcode 在当前登录态同源解析到的媒体,不把 Cookie、页面 JSON 或媒体 URL 发送到本项目后端。

- DOM 只定位页面上下文、帖子实体、当前媒体和按钮挂载面,不能把 Grid thumbnail、Reel poster 或 CSS background 当主下载资源。
- 原媒体来自 embedded JSON、fetch/XHR 响应或用户点击后同源 permalink 详情,识别 `image_versions2`、`video_versions` 与 `carousel_media`。
- Post/Reel 操作区下载全部主媒体,媒体层下载当前项;单资源仍保留两个入口。Story/Highlight 只下载当前项。
- Profile/Explore/Search/Hashtag Grid 可不跳详情直接下载;缺少原媒体时先静默解析,失败后提示重试,不降级下载 thumbnail。
- Reel cover 是页面菜单中的显式辅助下载,不进入 Popup 或“下载全部”;显式下载照常扣除一个额度。
- Popup 打开或刷新时直接查询当前 tab,只展示当前路由 Map 已经解析成功的主媒体；下载状态另从页面单例 FIFO 实时读取,关闭再打开可恢复同一 content 页面的未完成任务。任何数量的批量下载都不弹二次确认。
- 每个资源独立扣额并下载;明确额度不足只跳过当前项,额度服务异常时继续下载。单项和批量都加入页面 FIFO,不预检、不回滚、不跨页面恢复。
- 生产结构固定为 `PageContext -> routeMediaStore Map -> parser/resolver -> buttons/Popup -> downloadOne/downloadMany -> 页面单例 FIFO -> fixed EventRpc`。代码、Unit/Integration、fresh build 与 Popup/sidebar 受控回归已通过；Instagram 受控项目和真实 Canary 的最终发布结论仍以 Plan 017/018 的实际记录为准。

### 5.6 Threads

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `threads.com`、`threads.net` 及子域;路径 `/@{user}/post/{shortcode}` |
| 解析执行 | 受控浏览器执行页面,读取 `<video>.currentSrc` 与 `carousel_media` |
| 资源形态 | 视频、图片、混合相册(视频+图片) |
| `download_mode` | `direct` |
| 直链 host 限制 | `.cdninstagram.com` 或 `.fbcdn.net` 后缀 |
| 解析限流 | 1 次/15 秒 per user/device(比 Instagram 严);浏览器全局并发上限 2 |
| Download all | 纯图片多资源时展示;结果含视频时隐藏 |
| website/backend 范围外 | feed/用户主页/搜索/tag 批量;私密/登录墙;在线播放 |
| 扩展端差异 | 插件在 Threads 页面本地扫描与注入按钮,不走 website/backend 链路;详见 `@tech-扩展端Threads本地下载.md` |

#### 5.6.0 扩展端本地下载

扩展端 Threads 下载不复用本节 website 后端解析口径。插件在用户当前 Threads 页面内本地扫描、解析和下载,不调用后端,不新增 `downloads` 权限。

- 下载方式:`fetch -> blob -> URL.createObjectURL -> a.download.click()`,运行在页面 / injected 上下文。
- 不使用 `chrome.downloads.download`,不申请 `downloads` permission,不使用 Telegram `SegmentDownloader`。
- 资源来源:优先解析页面 `<script type="application/json">` SSR JSON,识别 `video_versions[].url`、`video_url`、`image_versions2.candidates[].url`、`display_resources[].src`、`display_url`、`carousel_media[]`、`edge_sidecar_to_children.edges[].node`;按 `width * height` 选最高画质。
- DOM 兜底:`currentSrc` / `video.src` / `img.src` 只在 SSR JSON 未命中时使用。
- URL 白名单:只允许 HTTPS 且 host 后缀为 `.cdninstagram.com` 或 `.fbcdn.net`。
- DOM 口径:不依赖 Threads 原生 `data-testid` / `article`;帖子边界用 `div[data-pressable-container="true"]`、`a[href*="/post/"]`、`a[href$="/media"]`、大尺寸 `div[role="button"] img/video` 组合定位。
- 注入点:底部 Download all append 到媒体下方 4 个 `role="button"` 的共同父级末尾;单项按钮插到媒体 wrapper 直接父容器作为 sibling,右下角 hover 显示。
- 自有测试标记:`data-testid="tgdl-threads-download-all"`、`data-testid="tgdl-threads-media-download"`、`data-testid="tgdl-threads-media-wrapper"`,并写入 `data-tgdl-source-id`、`data-tgdl-media-index`。
- 入口:Popup 资源列表与页面按钮两条入口共用同一 tab 资源缓存;SPA / MutationObserver 重扫;资源缓存按 `resource.id` 去重,SSR/DOM 合并按 `messageId + index` 处理同位覆盖;DOM 标记使用 `data-tgdl-source-id="threads:{shortcode}"`。

### 5.7 Reddit

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `reddit.com`、`www/old/new.reddit.com`、`redd.it`;路径 `/r/{sub}/comments/{post_id}/...`、`/{post_id}` |
| 解析执行 | Playwright headless 过 PerimeterX 墙 → 导出 cookie 全局缓存 → 热路径用 httpx 请求 `{permalink}.json`;三类内容(视频/图片/相册)共用同一条解析层 |
| cookie TTL | 跟随 `token_v2` 过期,封顶 20 分钟,失效后 Playwright 重新过墙 |
| 视频帖 | `download_mode=client_mux`,轨道 `v.redd.it`,见 §4 |
| 图片帖(`post_hint=image`, `domain=i.redd.it`) | `download_mode=direct`,单图 |
| 相册帖(`is_gallery=true`) | `download_mode=direct`,每张图一资源,共用 `content_id`,`source_id` 按序编号 |
| 外链帖(`post_hint=link` 或非自托域) | 返回 `REDDIT_PARSE_FAILED`,不支持 |
| 图片 CDN host | `i.redd.it`(原图)、`preview.redd.it`、`external-preview.redd.it`(缩略图白名单) |
| 范围外 | 多视频/混合视频图片帖;相册内视频项;无音频轨视频;私密/NSFW 登录墙;HLS;多轨断点恢复;服务器端 mux;扩展端注入 |

### 5.8 Douyin

| 维度 | 口径 |
| --- | --- |
| 平台识别 | `douyin.com`、`www.douyin.com`、`v.douyin.com`、`www.iesdouyin.com`;URL 含短链/分享页/视频页/`jingxuan?modal_id=` |
| 解析执行 | 优先移动 UA SSR HTML 解析 `window._ROUTER_DATA`;`jingxuan` 或 SSR 反爬时用 Playwright browser runtime fallback,读取 `<video>.currentSrc` |
| 资源形态 | 单视频 MP4(音视频合一) |
| `download_mode` | `direct`(浏览器直连 `*.douyinvod.com`) |
| `source_id` | `douyin:{aweme_id}:video` |
| 直链 host 限制 | `*.douyinvod.com` 或 Douyin 当前视频 CDN 子域,必须通过 CORS preflight 允许 `Range` |
| parse 缓存 TTL | 600 秒(比其他平台 30 分钟短);direct format 缓存同 600 秒,signed URL TTL ≤ 10 分钟 |
| 视频 URL fallback 链 | 直链选取优先级:`play`(无水印)→ `playwm`(有水印 fallback)→ 页面 `url_list` → browser runtime `<video>.currentSrc`;实现期人工确认首个样本水印表现;按 `aweme_id/modal_id` 过滤目标,不取推荐视频 |
| CORS 预检 | 返回 direct URL 前必须验证浏览器 CORS preflight 允许 `Range`(样本已验证 `*.douyinvod.com` 通过) |
| 范围外 | 图片/图集/直播;搜索/用户主页/合集/音乐/话题;私密/登录态;分轨音视频 mux;后端代理;持久化登录 Cookie;扩展端注入 |

## 6. website 与 extension 差异

| 平台 | website | extension |
| --- | --- | --- |
| `telegram` | 输入框粘贴消息链接;私密频道返回 `requires_client` 走扩展引导;首页默认展示插件卡片,其他复用页 `size>=500MiB` 桌面端展示插件卡片(不阻断下载) | 在 `web.telegram.org` K/A 版本注入下载按钮,扫描 DOM,原生支持私有频道;ResourceBuffer 3 秒轮询,500ms 检测聊天切换 |
| `tiktok` | 输入框粘贴链接,`proxy` 下载 | 无扩展端实现 |
| `x` | 输入框粘贴链接,website 走后端 `yt-dlp` direct 链路 | 插件在 X 页面本地扫描图片与捕获视频 MP4/HLS，MP4 优先，支持 Popup 与页面按钮，不调用后端 |
| `vimeo` | 输入框粘贴链接,website 走后端 Vimeo direct 链路 | 已有扩展端设计与代码 |
| `threads` | 输入框粘贴链接,website 走后端 Threads direct 链路 | 已有扩展端设计与代码 |
| `instagram` | 输入框粘贴公开 post / Reel / Story 链接 | 已按当前路由 Map 实现 Feed、详情/弹窗、Reels、Profile/Explore/Search/Hashtag Grid、Story/Highlight 本地原媒体解析、页面按钮与当前 tab Popup；发布验证状态见 `@plans/017.*` 与 `@plans/018.*` |
| `reddit`/`douyin` | 输入框粘贴链接 | 当前不注入 |

> 产品策略:网站为重心(移动端占 7 成),扩展是桌面场景补充。各扩展端 tech 记录实现范围；是否进入发布产物以 `PLATFORM_REGISTRY[*].releaseStatus` 为准。

## 7. Website/backend 共性与扩展例外

以下约定以 Website/backend 下载链路为主；扩展端只适用明确写到扩展的条目，各扩展站点 tech 的本地下载契约优先。

- **统一链路**:website/backend 下载执行都走 `parse-pre-v2 → parse-v2 → download-pre-v2 → download-v2`(`@tech-链路与授权.md`);扩展端 X / Instagram 本地下载不走该链路。扩展代码是否进入生产包由 `PLATFORM_REGISTRY[*].releaseStatus` 决定。
- **host 白名单**:每个站点在后端 `contracts/media_platform.py::detect_platform()` 与平台 Provider/runtime 内部维护 host 白名单;前端 `platform.ts::detectPlatform()` 只做本地平台识别(用于埋点和默认 UI),不是鉴权。
- **parse 不暴露直链**:website/backend parse 响应隐藏 CDN 直链、轨道 URL、Cookie、完整 signed query;直链/轨道只在 `download-v2` 按 `download_mode` 返回。扩展端本地下载只读取当前页面内已有 URL,不调用 parse。
- **直链 host 校验**:direct/client_mux 返回的媒体 URL 必须命中平台特定 host 白名单且通过 `assert_public_host`。
- **CDN 请求 no-referrer**:平台 CDN 请求和 tracks 请求用 `no-referrer` 策略(`@tech-链路与授权.md` §2.5)。
- **直链刷新**:direct / client_mux 在新下载过程中最多通过 `download-pre-v2 -> download-v2` 刷新一次 direct/tracks JSON(`@tech-下载方法与续传.md` §8.5)。OPFS Continue 不重新授权;restartable Restart 是新的传输动作,清理当前记录后重新走 `download-pre-v2 -> download-v2`。
- **缓存 TTL**:内部格式缓存普遍 30 分钟;Reddit cookie 跟随 `token_v2` 封顶 20 分钟;Douyin signed URL 10 分钟。
- **解析限流**:多数平台 3 次/10 秒 per user/device;Threads 1 次/15 秒。下载频率限制当前未作为公共契约落地,站点需要时先补 `@tech-速率治理.md`。完整口径见 `@tech-速率治理.md`。
- **Website/backend 配额扣减**:按用户口径,同一用户同一资源 6 小时内只扣一次(`@tech-链路与授权.md` §3.3);相册/图集每张独立 `source_id` 各扣一次(与单图一致)。该规则不适用于扩展本地下载；扩展按当前 document 的 canonical 资源任务逐项扣除，同一未完成任务重复提交不再次扣除。完整状态合同见 `@tech-扩展端TG扫描.md` 的下载行为章节。
- **Download all**:`queueDefault=allow` 的 mode(proxy/direct)且资源数 > 1 时展示;`client_mux`(deny)资源不进队列;含 client_mux 资源的结果不展示 Download all。详见 `@tech-下载方法与续传.md` §5。
- **Capabilities 与 mode 解耦**:`capabilities.{download,play}` 只给 UI 展示;`download_mode` 以后端 parse 结果为准。前端 fallback resource 才允许根据 platform 推断默认 mode,函数名 `resolveFallbackDownloadMode()`。详见 `@tech-下载方法与续传.md` §1。
- **Play 能力**:`telegram` 视频在 `provider/media/telegram_media.py` 的解析展平中仍返回 `capabilities.play=true`(`source.kind == "video" and source.downloadable`),其他平台固定 `play=False`;但 Website 播放入口已废弃,后端 `/tg/play-token`、`/tg/play-token/refresh`、`/tg/play-token/resume`、`/tg/play` 四端点统一返回 `TG_PLAY_SESSION_UNAVAILABLE`(Credits download migration),且后端播放流/session/token 旧 service 已移除;`play=true` 仅作为类型契约/UI 标志位保留。
- **扩展平台开关**:`extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 是发布状态、Popup 识别和平台测试的唯一来源；`extension/vite.config.ts` 的 `webExtension({ manifest })` 配置只消费该纯数据注册表。平台关闭后,编译时移除对应平台的 `content_scripts.matches`、`host_permissions` 和 `web_accessible_resources`;API 与官网登录桥接权限不受平台开关影响。

## 8. 站点接入清单(新增平台时)

新增平台接入必须同步以下位置(以代码为准,非文档):

| 层 | 文件 | 动作 |
| --- | --- | --- |
| 后端平台识别 | `backend/src/app/contracts/media_platform.py::detect_platform()` | 注册 host 白名单与 platform 标识 |
| 后端 Provider | `backend/src/app/provider/media/{platform}_media.py` + Provider registry | 新增平台 Provider,实现 `_parse()` / `_download()` 并注册 |
| 后端平台私有逻辑 | `backend/src/app/provider/media/{platform}_media.py` | 放在对应 Provider class 内；如需有状态基础设施,放 `backend/src/app/provider/{platform}_runtime.py` 或明确命名的 provider runtime/pool 模块 |
| 后端 token/schema | `backend/src/app/schemas/...` / token service | 如有新的 platform Literal、resource token 字段或响应 schema,同步更新 |
| 前端平台识别 | `website/src/download/scripts/platform.ts` | 加入 host 集合、`MediaPlatform` 类型、`detectPlatform()` 分支 |
| 前端下载 mode | `website/src/download/scripts/download-methods.ts::DOWNLOAD_METHODS` | 若使用新 mode,先注册 Definition 与 runner,再在 service 返回该 mode |
| 错误码 | `backend/src/app/...`(错误契约) | 新增平台解析失败错误码(如 `REDDIT_PARSE_FAILED`) |
| i18n | website i18n 资源 | 平台标签、解析失败文案、详情字段 |
| 文档 | 本文件 §2.1/§3.2 + `references/index.md` | 矩阵更新 |

> 新增 mode 必须先在 `tech-下载方法与续传.md` §2 注册 Definition(包括 `sessionPolicy`/`queueDefault`/`quotaTiming`/`canResume`)并完成计费顺序设计,再在本文件 §3.1 标注使用平台。禁止靠 `platform === "xxx"` 特判绕过 `DOWNLOAD_METHODS` 注册表。
