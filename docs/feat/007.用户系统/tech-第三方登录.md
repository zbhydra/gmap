# 007 · 第三方登录

> Google OAuth 接入(website 已实现的手动 OAuth code flow + One Tap 辅助路径 + 权威邮箱判定 + 一次性登录票据 + return_to 白名单),以及 extension 端已实现的 website 独立登录页与登录态同步。Telegram 登录在规划中未实现。
> 关联:`@feat.md` `@tech-账号与认证.md`(JWT 会话/签发/账号创建部分)
> 边界:本文只描述**客户端用户第三方登录**。节点 admin 的本地认证属 `@../001.节点系统/tech-节点Admin与本地管理.md`,与本域无关。

## 1. Google 配置

| 配置(env `AUTH_` 前缀) | 默认 | 用途 |
| --- | --- | --- |
| `google_client_id` | 空 | Google OAuth client id;ID token 的期望 `aud`;前端 PUBLIC 配置同名 |
| `google_client_secret` | 空 | Google OAuth client secret;**仅后端**,code flow 换 id_token 必填;留空时 One Tap 与旧 callback 不阻断,但新 OAuth authorize 直接回跳错误(不创建 state、不跳 Google) |

前端公开配置(PUBLIC):`PUBLIC_GOOGLE_CLIENT_ID`,值 `423442422649-t90svp0aphcikpd3b2l44k9jpp40ojec.apps.googleusercontent.com`。后端部署配置:`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`。

**`GOOGLE_CLIENT_SECRET` 不得进入任何 `PUBLIC_*` 前端配置**;后端日志不记录完整 id_token。

## 2. ID token 校验(`GoogleAuthService.verify_id_token`)

1. 读 `google_client_id`,空则内部配置错误(500)。
2. 解析未校验 header → **要求 `alg == RS256`** → 取 `kid` → 从 Google JWKS(`https://www.googleapis.com/oauth2/v3/certs`,缓存 TTL 取响应 `Cache-Control: max-age`,最小 60 秒,默认 `GOOGLE_JWKS_DEFAULT_TTL_SECONDS = 3600`)取公钥。
3. `jwt.decode(algorithms=["RS256"], audience=client_id, options={"require": ["aud","email","exp","iss","sub"]})`:`aud` 必须等于 `google_client_id`,`exp` 由 PyJWT 校验,`iss`/`email`/`sub` 必须存在。
4. `iss` 必须在 `{"accounts.google.com", "https://accounts.google.com"}`,否则认证失败。
5. `email` 必须非空字符串。
6. **`email_verified` 必须严格等于 `True`**,否则认证失败。
7. `sub` 必须非空字符串。

## 3. 权威邮箱判定(`_is_authoritative_email`)

决定是否直接发项目 token,还是改走邮箱验证码二次确认:

| 邮箱 | 权威? | 处理 |
| --- | --- | --- |
| `@gmail.com` | 是 | 直接查/建用户,签发项目 token |
| 非 gmail,但 id_token 带 `hd`(hosted domain,Google Workspace)且非空 | 是 | 直接查/建用户,签发项目 token |
| 其他(第三方邮箱,即使 `email_verified=true`) | 否 | 不签发项目 token,改发邮箱验证码,返回需要二次确认的中间态 |

> 安全边界:Google 邮箱权威性按 Google 官方安全边界处理。非权威邮箱必须追加邮箱验证码确认,首次创建用户的 `register_method` 仍为 `email_code`。

## 4. 账号归属与首次注册方式

- **账号身份以规范化邮箱为准**(trim + 小写,不做 Gmail 点号/`+tag` 折叠):Google ID token email == user.email == 邮箱验证码 email,即同一个账号。
- `register_method` 只在首次创建用户时写:
  - Google 权威邮箱首次创建:`google`。
  - 邮箱验证码首次创建(含非权威 Google 邮箱完成验证码后):`email_code`。
  - 老用户或同邮箱后续换登录方式**不覆盖**。
- 该字段只用于账号来源分析,**不参与登录查询,不新增索引**。
- `register_source`:Google 登录在 OAuth callback 路径无法携带 `X-Client-Product`,强制写 `web`(常量 `_GOOGLE_REGISTER_SOURCE = ClientProductEnum.WEB`)。

## 5. 手动 OAuth code flow(website 主路径)

### 5.1 一次性票据常量(`google_redirect_login_service.py`)

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `GOOGLE_OAUTH_STATE_TTL_SECONDS` | `600` | OAuth state TTL(10 分钟) |
| `GOOGLE_OAUTH_STATE_BYTES` | `32` | state 随机字节(`secrets.token_urlsafe(32)`) |
| `GOOGLE_LOGIN_CODE_TTL_SECONDS` | `180` | 登录票据 TTL(3 分钟) |
| `GOOGLE_LOGIN_CODE_BYTES` | `32` | 票据随机字节 |

### 5.2 Redis Key(前缀 `tg-download`,只存 sha256 哈希不存明文)

| Key | Value | TTL |
| --- | --- | --- |
| `google_oauth_state:{sha256(state)}` | JSON `{"return_to":..., "created_at":...}` | 600 秒 |
| `google_login_code:{sha256(code)}` | JSON `{"user_id":..., "created_at":...}` | 180 秒 |

### 5.3 原子消费(Lua `GET + DEL`)

state 与 login code 都用同一段 Lua 脚本原子消费(防止并发重复消费):

```text
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
```

第二次消费同一 state/code 必失败 → 认证失败。

### 5.4 `return_to` 白名单

| 配置 | 值 |
| --- | --- |
| `GOOGLE_REDIRECT_ALLOWED_HOST_SUFFIXES` | `("telegramdownloadmedia.com", "telegramvideodownload.pro")`(精确匹配或 `.<suffix>` 子域) |
| `_GOOGLE_REDIRECT_ALLOWED_LOCAL_HOSTS` | `{"localhost", "127.0.0.1"}` |

`_normalize_google_oauth_return_to`:非空校验;绝对 URL 必须过白名单,否则按 `invalid_return_to` 处理;纯相对路径拼到 `app.public_website_base_url`。失败 fallback 用 `_get_google_redirect_fallback_url`(只保留 `public_website_base_url` 的 scheme+netloc+"/")。

### 5.5 流程

```text
用户点击 Continue with Google(自定义按钮)
  -> 前端按钮立即 loading(文案 Connecting...),整页跳转
  -> GET /api/client/auth/google/oauth/authorize?return_to=<当前页 URL>
  -> 后端校验 return_to 白名单,频率限制(10 次/60 秒/IP)
  -> Redis 写 600 秒一次性 OAuth state(value 绑定规范化 return_to)
  -> 302 到 https://accounts.google.com/o/oauth2/v2/auth
     (client_id, redirect_uri=.../oauth/callback, response_type=code,
      scope=openid email profile, state, prompt=select_account)
  -> 用户选 Google 账号
  -> Google GET 回 /api/client/auth/google/oauth/callback?code=...&state=...
  -> 后端原子消费 state,取 return_to
  -> 用 code + GOOGLE_CLIENT_SECRET + redirect_uri 换 id_token
  -> 校验 id_token(见 §2)+ 权威邮箱判定(见 §3)
  -> 权威邮箱:查/建用户(register_method=google),签发 180 秒一次性登录票据
     -> 303 回 return_to?google_login_code=<票据>
  -> 非权威邮箱:发邮箱验证码
     -> 303 回 return_to?google_email_verification=<邮箱>
  -> 失败:303 回 return_to?google_login_error=<错误>
  -> state 无效:回退到 PUBLIC_WEBSITE_BASE_URL
```

**Google authorize 接口频率限制**:`_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_MAX = 10`,`_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW = 60`(10 次/60 秒/IP,`RedisFixedLimiter`,前缀 `google_oauth_authorize`)。

### 5.6 前端收尾(website 下载工作区)

`handleGoogleRedirectResult()` 在下载工作区初始化时执行(唯一读取这些参数的地方):

| URL 参数 | 处理 |
| --- | --- |
| `google_email_verification` | 打开弹窗,预填邮箱,跳到验证码子界面,启动发送冷却 |
| `google_login_error` 或无 code | 重置弹窗到 Google-first,展示 `googleSignInFailed` 错误 |
| `google_login_code` | `POST /api/client/auth/google/exchange` 换正式 token,存 token,刷新用户与签到状态 |

处理完用 `history.replaceState` 清掉三个参数。

> 注:`/pricing/` redirect 收尾当前**只在下载工作区**被消费(website 无独立 `/pricing/` redirect 处理逻辑)。

## 6. One Tap 辅助路径(website)

```text
认证弹窗打开
  -> 前端懒加载 https://accounts.google.com/gsi/client
  -> googleIdentity.initialize({client_id, callback, auto_select:false, cancel_on_tap_outside:true})
  -> googleIdentity.prompt(...)
  -> Google 通过 callback 返回 credential
  -> 前端 POST /api/client/auth/google-login {credential}
  -> 后端校验 id_token:
     - 权威邮箱:查/建用户(register_method=google),走完整登录,返回 LoginResponse
     - 非权威邮箱:发邮箱验证码,返回 {requires_email_verification:true, email}(不签发项目 token)
  -> 前端权威邮箱成功后刷新用户与签到状态
  -> 前端非权威邮箱:预填 email 并展开验证码区,用户走 email-verify-login
```

One Tap 失败、被浏览器拦截或超时**不阻断**用户继续点击手动 Google 按钮。下载工作区在认证失败时也会静默触发 One Tap(`silentFailure: true`)。

## 7. 接口规格

Google 相关接口(均挂 `/api/client/auth/google/...`)。

### 7.1 `POST /api/client/auth/google-login`

One Tap 与旧 direct credential 路径用;新手动 OAuth 按钮不用。Body:`{ credential(min1/max4096) }`。响应:权威邮箱 → `LoginResponse`;非权威邮箱 → `{ requires_email_verification: true, email }`(不签发项目 token)。

### 7.2 `GET /api/client/auth/google/oauth/authorize`(`include_in_schema=False`)

Query:`?return_to=...`。校验白名单 + 频率限制 → 写 state → 302 到 Google。`google_client_id` 或 `google_client_secret` 空则 500(不创建 state、不跳 Google)。

### 7.3 `GET /api/client/auth/google/oauth/callback`(`include_in_schema=False`)

Query:`?code=&state=&error=`。原子消费 state → 换 id_token → 校验 → 权威邮箱 303 回 `?google_login_code=`,非权威 303 回 `?google_email_verification=`,失败 303 回 `?google_login_error=`。

### 7.4 `POST /api/client/auth/google/exchange`

Body:`{ code(min1/max256) }`。原子消费一次性登录票据 → `user_id` → 加载用户 → `_complete_login_flow` → 返回 `LoginResponse`。第二次兑换同一 code 必失败。

## 8. Google Console 配置

OAuth 2.0 Web Client 的 Authorized redirect URIs 需包含:

```text
https://tg-download-api.telegramdownloadmedia.com/api/client/auth/google/oauth/callback
https://api.telegramvideodownload.pro/api/client/auth/google/oauth/callback
http://localhost:7600/api/client/auth/google/oauth/callback
```

新手动按钮只跳后端 OAuth authorize,不接触 `GOOGLE_CLIENT_SECRET`。

## 9. extension website 统一登录(已实现)

extension 不直接实现 Google OAuth。插件点击登录后打开 website 独立登录页,由 website 复用现有 Google / 邮箱登录能力。用户在任意官网入口登录成功写入 web access token 时,经 **externally_connectable** 消息通道向两个固定扩展 ID 发送,由 extension background 签发插件 token。插件专用页检测到已有有效 token、或从插件进入 Pricing 时补发一次;普通来源页面加载不发送。

**当前实现状态**:新扩展使用 `/extension-login-v2/` 页。`setStoredAccessToken()` 在 Google 或邮箱登录成功时向正式 ID `lflkobgaibapekhjnfhkaeagdnojjnla` 和预发布 ID `cknimihpjagocmakbkplpjdcgjlbnkec` 分别发送;v2 页读取已有 token 后先调用账号信息接口校验,成功才补发一次;带插件来源标记的 Pricing 加载时也补发一次。`Layout.astro` 不处理登录同步,也不监听 storage event。background 校验 `sender.origin` 后通过 `/api/client/auth/extension-token` 重新签发并保存插件 access/refresh token。发送方不等待 ACK,单个目标失败不影响另一目标或 Website 流程。旧 `/extension-login` 页与旧 postMessage 协议保留,继续服务已发布旧扩展。

### 9.1 登录流程

```text
用户在插件点击登录
  -> extension background 恒 tabs.create 打开 website 独立登录页(/extension-login-v2)
  -> website v2 页判断本地是否已有 access_token
     -> 已登录:调用账号信息接口校验网页登录态
        -> 认证失败:按 website 统一 auth failure 处理清理本地 access_token,回到 Google / Email 登录 UI
        -> 认证成功:展示成功状态
     -> 未登录:展示现有 Google / Email 登录 UI
        -> Google 303 回到 /extension-login-v2?google_login_code=...
        -> v2 页处理 google_login_code / google_login_error / google_email_verification
        -> Google / Email 登录成功后保存 web token
  -> 登录成功写入 token 时,或 v2 页确认已有 token 有效后
     分别 sendMessage(两个固定扩展ID, AUTH_CHANGED_V2, web_access_token)
  -> background onMessageExternal 校验 sender.origin ∈ 官网白名单、消息 schema 合法
  -> background 读取当前插件旧 token,用 web access token 调 /api/client/auth/extension-token 签发插件 token
  -> background 接收 extension_access_token / extension_refresh_token / user
     并写入 auth_access_token / auth_refresh_token / auth_user_info
  -> 用户点击返回:分别 sendMessage(两个固定扩展ID, RETURN_V2)
  -> background 聚焦第一个 web.telegram.org tab,并用 sender.tab.id 关闭登录页 tab
     (Google redirect 回跳后的 tab 可能不满足 script-closable 条件,页面侧 window.close() 仅作兜底)
```

用户直接在官网首页、Pricing、下载页或 Google redirect 回跳页完成登录时都走同一条链路:`setStoredAccessToken()` 写入后发送。从插件打开 `utm_source=extension` 的 Pricing 时,页面已有 Website token 也会补发一次。普通来源页面不会发送;其他标签页的 storage event 也不发送。同步不读取 URL 扩展 ID、referrer 或登录方式。

website token 有效时不要求用户再次点 Google / Email。website 只存 access token,因此 24 小时过期后会回到登录 UI,这是当前简单方案接受的限制。未安装、未启用插件或消息发送失败时,website 正常完成网页登录;普通页面和 v2 页都不等待 ACK、不展示插件同步错误、不自动重试。

`/extension-login-v2/` 的 Google redirect 收尾必须与下载工作区一致:

| URL 参数 | 处理 |
| --- | --- |
| `google_login_code` | 调 `POST /api/client/auth/google/exchange` 换网页登录 token;成功后保存 web token并清 URL;保存动作触发两个固定 ID 同步 |
| `google_email_verification` | 打开邮箱验证码子界面,预填邮箱,启动发送冷却 |
| `google_login_error` 或无 code | 回到 Google-first 登录 UI,展示 Google 登录失败 |

处理完必须用 `history.replaceState` 清掉 `google_login_code` / `google_login_error` / `google_email_verification` 等临时参数。`google_login_code` 本身会进入回跳 URL,但它是短效一次性 code,原子消费后不可重放;正式 token 不允许进入 URL。

### 9.2 后端响应与接口

通用 `LoginResponse` 不新增字段。website 登录只返回网页登录 token。插件 token 只通过 `/api/client/auth/extension-token` 创建,由 extension background 持 web access token 调用。这个接口用于"已有 website 登录态 → 签发插件 token",不是签到补签;用户网页登录时可能没安装插件,后续安装或点击插件登录仍可用当前网页登录态换插件 token。

插件 token 仍是 `USER_ACCESS` / `USER_REFRESH`,同一 user_id,必须写入 Redis token ZSet 和用户 session;否则插件 refresh 或鉴权会失败。JWT payload 暂不新增 client 字段,服务端鉴权仍按现有用户 token 体系处理。

插件 token 签发接口:

```text
POST /api/client/auth/extension-token
Authorization: Bearer <web_access_token>
```

请求体可选:

```json
{
  "old_extension_access_token": "...",
  "old_extension_refresh_token": "..."
}
```

响应:`{ extension_access_token, extension_refresh_token, token_type:"bearer", expires_in, user }`。该接口只凭已登录 website 的 access token 签发插件 token,不做 Google / 邮箱认证。连续调用每次签发新插件 token;如果请求体带旧插件 token,后端先解析旧 token 并校验 token type 与字段匹配,再比较旧 token `user_id` 与当前认证用户 `ctx.user_id`:相等才按当前 `ctx.user_id` 的 token ZSet 撤销旧 access/refresh,不相等则跳过撤销。撤销目标必须始终是 `ctx.user_id`,禁止使用旧 token 解码出的 user_id 作为撤销目标。旧 token 解析失败、类型不匹配、过期、已撤销、非当前用户或撤销失败都不阻断新 token 签发,只记录日志;日志只允许记录 user_id / token_type / 失败原因 / 结果,禁止记录 access/refresh token 明文。跨账号切换只覆盖 extension storage,旧账号服务端 token 按现有 token TTL 自然过期。接口做用户级轻量限流(10 次/5 分钟),避免反复签发填充 Redis token ZSet,并避免同出口 IP 下不同账号互相误伤。

错误口径:

| 场景 | 处理 |
| --- | --- |
| web access token 过期/无效 | 走现有 `get_current_user` 认证失败口径(HTTP 401 / auth 业务错误);`/extension-login-v2/` 自己校验网页登录态时用 website 统一 auth failure 判断清理本地网页登录态并显示登录 UI;extension background 签发遇到 401 时只放弃写入插件 storage |
| 用户不存在/注销/不可登录 | 按现有 auth 错误返回;`/extension-login-v2/` 自己校验网页登录态时页面显示登录失败;background 签发插件 token 时只放弃写入插件 storage |
| 限流 | 返回频率限制错误;background 记录错误并放弃写入插件 storage;用户可重新点击登录或刷新官网页面 |
| 旧插件 token 撤销失败 | 不影响新插件 token 签发;日志不记录 token 明文,旧 token 按 TTL 自然过期 |
| 旧插件 token 解析失败或 type 不匹配 | 跳过旧 token 撤销,不影响新插件 token 签发 |
| 旧插件 token 属于其他用户 | 解析旧 token 后发现 `user_id != ctx.user_id` 时跳过撤销,不得按旧 token 的 user_id 撤销;跨账号旧 token 按 TTL 自然过期 |
| 旧 refresh 处于 30 秒宽限期 | 撤销当前 refresh ZSet 后,宽限期旧 refresh 最长仍可能残留 30 秒;本阶段接受 TTL 兜底 |

### 9.3 website 页面与 externally_connectable 消息桥

新扩展使用独立英文页面 `/extension-login-v2/`。当前不做 `/[lang]/extension-login-v2`;extension 无论当前 UI 语言为何,都打开该英文页。Google OAuth `return_to` 保留 `/extension-login-v2/` 当前完整 URL。

- 未登录:复用 website 认证弹窗的 Google 主按钮与邮箱验证码次级入口。
- 已登录:调用账号信息接口校验 web access token;有效时展示成功状态并向两个固定 ID 补发一次,页面不等待插件处理结果。
- 登录成功:`setStoredAccessToken()` 保存网页登录态后向两个固定扩展 ID 发送 `TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2`;单个目标发送失败只记录日志。
- 从插件打开的 Pricing 加载时补发一次;官网普通来源页面加载与其他标签页 storage event 不同步。
- token 不写 URL、不写 query、不写 hash、不进入跳转地址。
- Google 登录发起时 `return_to` 固定为当前 `/extension-login-v2/` 完整 URL。
- 已登录态提供"切换账号"入口:清理本地 web access token,回到 Google / Email 登录 UI。默认插件账号跟随当前网页登录账号。
- 经 `/extension-login-v2/` 首次注册的用户,`register_source` 仍按 website 请求记为 `web`;如需区分插件来源,后续应通过埋点而不是改账号来源字段。

`/extension-login-v2/` 不接触插件 access/refresh token,只使用 website 现有 web access token。该页仍不把 token 写 URL、日志或埋点;页面 CSP 沿用 website 登录页安全口径即可,不需要为插件 refresh token 做额外隔离。

官方网页向扩展发送 externally_connectable 消息时必须指定扩展 ID,且扩展必须在 `externally_connectable.matches` 声明网页来源。本项目固定向正式扩展 ID `lflkobgaibapekhjnfhkaeagdnojjnla` 与预发布扩展 ID `cknimihpjagocmakbkplpjdcgjlbnkec` 发送。生产与开发 manifest 分别写入各自的 public key,两个固定 ID 可以同时安装,且都不依赖安装路径。Website 不接受 URL 或运行时参数覆盖目标 ID。

消息契约(网页 → 扩展):

```json
{ "type": "TG_DOWNLOAD_EXTENSION_AUTH_CHANGED_V2", "web_access_token": "..." }
{ "type": "TG_DOWNLOAD_EXTENSION_RETURN_V2" }
```

扩展 background 可以完成内部回执,但 Website 同步入口不读取回执。扩展 manifest 的 `externally_connectable.matches` 与官网 origin 白名单同源生成,生产只声明以下来源:

```text
https://telegramdownloadmedia.com/*
https://www.telegramdownloadmedia.com/*
```

开发环境按精确 website 本地 origin 增加 `http://localhost:7620/*`;运行时扩展侧仍要求 `sender.origin` ∈ 白名单。

**旧页面 `/extension-login` 与旧 postMessage + content script 桥零改动保留**。已发布旧扩展(≤1.3.0)的二进制写死 `EXTENSION_LOGIN_PATH=/extension-login`,且其 bridge 注入官网全域,无法召回升级;新扩展 `buildExtensionLoginUrl()` 指向 v2 路径,天然分流。旧页继续经 postMessage 信号让旧扩展读取 `homepage_access_token` 完成同步。

### 9.4 extension 侧行为

- 登录入口打开 `/extension-login-v2/`,不在插件内展示 Google 登录;`buildExtensionLoginUrl()` 只返回固定 v2 路径,不附扩展 ID 或来源参数。
- `openExtensionLogin()` 恒 `tabs.create` 新开登录页(不聚焦已有登录页;background 经 RETURN 消息信封的 `sender.tab.id` 关闭登录页,不记账 tabId);不记录原 Telegram tab/window,不做 nonce。
- background 注册 `chrome.runtime.onMessageExternal` handler(与 RPC 监听器同生命周期,setupListener/destroy 对齐注册注销)。收到官网 v2 页消息后先校验 `sender.origin` ∈ `WEBSITE_AUTH_ORIGINS` 白名单,再校验消息 schema;非白名单来源直接忽略。
- `AUTH_CHANGED_V2`:校验 `web_access_token` 为非空字符串,读取当前 `auth_access_token` / `auth_refresh_token`,调 `/api/client/auth/extension-token` 签发插件 token,成功后写入 `auth_access_token` / `auth_refresh_token` / `auth_user_info` storage key。发送页面不依赖处理结果。
- 如签发失败或 storage 写入失败,记录详细错误;Website 不展示错误,用户后续刷新或再次登录可重试。
- 如 extension storage 已有另一个 user_id,本阶段直接覆盖并在插件 UI 刷新为新账号;不增加二次确认。
- `RETURN_V2`:`tabs.query({url:"https://web.telegram.org/*"})` 取第一个 tab 聚焦(多开取第一个),并 `tabs.remove(sender.tab.id)` 关闭登录页 tab(已手关时忽略错误),回执 `{ok:true}`;页面侧 `window.close()` 仅作兜底。
- 插件 Popup 重新读取 auth store 后展示已登录状态。

### 9.5 安全边界

- 只允许官网 origin → externally_connectable → background 这条封闭通道同步网页登录态;官网域不再注入 content script,不进 `host_permissions`(externally_connectable 不产生权限警告、不授予 host access)。
- background 不接收来自任意来源的裸 token;`onMessageExternal` 先校验 `sender.origin` ∈ 官网白名单,再校验消息 schema。官方文档:网页可向指定扩展 id 发消息,因此扩展侧的来源校验是隔离恶意扩展攻击面的第一道闸。
- Website 目标是源码内两个固定 ID,登录 URL 不携带 `?ext=`。生产 ID 由商店 public key 固定;开发 ID 由独立 public key 固定,不依赖加载路径,也不接受页面参数动态选择目标。
- website 不接触插件 access/refresh token;插件 token 只在 background 签发成功后进入 extension storage。
- 旧插件 token 由 background 在签发接口请求体中携带,后端只按当前网页登录用户撤销;撤销失败不阻断新登录。并发签发可能留下同账号孤立 token,按 access token TTL 自然过期,不做跨调用去重。
- 目标扩展未安装/未声明本域时 `sendMessage` 不影响 Website 登录;callback 只记录 `chrome.runtime.lastError`,不切换页面状态、不自动重试。
- 不做 Cookie 共享、不做 URL token、不做跨任意域名 token 接收。
- 用户登出仍按现有口径:只撤销当前端 access token,不做双端全局登出。website 登出只清 website `homepage_access_token`,不清 extension storage;extension 登出只清 `auth_access_token` / `auth_refresh_token` / `auth_user_info`,不清 website localStorage。下次 website 登录并同步时可覆盖 extension 当前账号。

## 10. Telegram 登录(规划态,未实现)

规划中,代码未实现。本域预留位,落地时在此补充。

## 11. 实现代码索引

- Google 认证 service(id_token 校验 / JWKS / 权威邮箱 / code 换 token):`@backend/src/app/services/google_auth_service.py`
- Google 一次性票据 / state service:`@backend/src/app/services/google_redirect_login_service.py`
- Google 登录 API(含 OAuth authorize/callback/exchange/google-login/旧 callback):`@backend/src/app/api/client/auth_client.py`
- website 前端 Google(Identity 加载 / One Tap / 自定义按钮 / redirect 结果处理):`@website/src/scripts/homepage/auth.ts`
- website 工作区 redirect 收尾:`@website/src/download/scripts/workspace.ts`
- website 认证弹窗:`@website/src/download/components/DownloadAuthModal.astro`
- website extension 登录页:`@website/src/pages/extension-login-v2.astro`(新);旧页 `@website/src/pages/extension-login.astro` 保留服务旧扩展
- website 登录成功同步钩子与两个固定 ID 消息常量:`@website/src/scripts/homepage/auth.ts`(`setStoredAccessToken` / `notifyWebAuthChanged`)
- extension Popup 登录入口:`@extension/src/popup/components/AppHeader.vue`
- extension 官网来源校验与 v2 消息契约:`@extension/src/core/api/auth/websiteOrigin.ts`
- extension background 外部消息 handler 与 token 交换:`@extension/src/background/services/BackgroundMessageRouter.ts`(onMessageExternal)`@extension/src/core/api/auth/api.ts`
- 旧官网消息桥 `@extension/src/content/websiteAuthBridge.ts` 已删除

## 12. 非功能要求

- 不新增第三方依赖;不新增依赖注入(`google_auth_service` / `google_redirect_login_service` 为进程级单例)。
- 接口只用 GET(authorize/callback 跳转)+ POST(google-login/exchange/旧 callback)。
- 一次性票据(state / login code)只存 sha256 哈希,不存明文;原子 `GET + DEL` 消费;第二次消费必失败。
- `return_to` 必须过白名单,失败回退到 `public_website_base_url`。
- 错误信息带可定位字段(`email` / `client_id` / `return_to` / `state`)。
- `GOOGLE_CLIENT_SECRET` 不得出现在任何前端 PUBLIC 配置;后端日志不记录完整 id_token。
