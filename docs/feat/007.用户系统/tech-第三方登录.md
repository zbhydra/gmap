# 007 · 第三方登录

> Google OAuth 接入(website 已实现的手动 OAuth code flow + One Tap 辅助路径 + 权威邮箱判定 + 一次性登录票据 + return_to 白名单),以及 extension 端已实现的 v3 浏览器身份登录(官网确认页 + PKCE + 一次性 code)。Telegram 登录在规划中未实现。
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

## 9. extension 登录 v3(browser identity,已实现)

extension 不直接实现 Google OAuth,也不内嵌登录表单。插件内登录入口(popup `Sign in`;Bing 面板未登录态另有入口)由插件 background 发起浏览器身份流程:打开官网确认页 `/extension-login`,用户复用 website 的 Google / 邮箱登录能力并**显式确认账号**后,官网签发一次性 code 经回调 URL fragment 回到插件,插件凭 code + PKCE verifier 换取**插件独立 token**。两个插件(Maps / Bing)共用同一确认页与同一合同。

v2「官网推送」桥已整体删除:无 `externally_connectable`、无固定扩展 ID、无 `/extension-login-v2` 页,后端无 `POST /auth/extension-token`(请求 404)。website 任意页面登录成功只写网页登录态,不向插件推送。

### 9.1 时序(`E`=插件 background,`W`=官网确认页,`B`=后端)

```text
E: 生成 verifier/challenge(S256) → launchWebAuthFlow 交互式打开确认页
W: {WEBSITE}/extension-login/?redirect_uri=<chromiumapp回调>&code_challenge=<43字符>
W: 入口校验 redirect_uri + code_challenge(非法 → 参数错误文案终止,不进入登录)
W: 未登录 → 认证弹窗(Google 主路径 / 邮箱验证码;Google redirect 回跳本页收尾)
   已登录 → 校验网页登录态(/auth/me)后进入账号确认卡
W: 用户点 Continue → POST /api/client/auth/extension-login/code(Bearer)→ {code, expires_in:60}
W: location.replace(<redirect_uri>#code=<code>) → 浏览器自动关窗
E: launchWebAuthFlow resolve → 解析 fragment 的 code(无 code → 按失败返回,不写任何状态)
E: POST /api/client/auth/extension-login/exchange(无 Bearer;code + verifier + 旧插件 token 可选)
B: Lua 原子 GET+DEL 消费 code → S256 比对 challenge → 按 code 内权威 user_id 走签发链
E: 校验响应合同 → 快照比对 → 原子写插件 storage 三键 → UI 经 storage.onChanged 即时刷新
```

确认页**不自动签发**:已有网页会话也必须显式点 Continue;`Use another account` 清网页登录态回认证弹窗,可换账号重新登录确认。

### 9.2 PKCE 与回调

- **PKCE**:verifier = 32 字节随机 → Base64URL(43 字符);challenge = BASE64URL(SHA256(verifier));固定 S256,不传算法参数。无 `state`(RFC 9700 §2.1:PKCE 即 public client 的 CSRF 防护)。
- **回调地址**:`chrome.identity.getRedirectURL('extension-login')` = `https://<32位小写a-p>.chromiumapp.org/extension-login`,运行时临时域,无需在 Google Console、manifest 或官网登记。
- **入口校验**(确认页对外部输入只归一化这一次):`redirect_uri` 恰好出现 1 次、必须 `https:`、host 匹配 32 位 `a-p`、pathname 为 `/extension-login`、无 search/hash;`code_challenge` 43 字符。非法只渲染参数错误文案。

### 9.3 一次性 code 设计

- code = 32 字节随机(Base64URL);Redis key 只存 `sha256(code)` 摘要(`extension_login_code:{sha256}`),value 为 `{user_id, code_challenge, created_at}`,TTL 60 秒;明文 code 不落服务端存储。
- 消费 = Lua 原子 `GET + DEL`,**先消费后验 challenge**:code 不存在 / 过期 / 已消费 / verifier 不匹配统一按认证失败处理,无尝试计数与恢复;challenge 校验失败时 code 已删除,不可重放。
- Redis 读写失败 fail-closed(不签发、不消费,接口 500)。
- Google redirect 回跳收尾沿用 website 统一口径:`google_login_code` 换网页 token 后进入账号确认卡,处理完 `history.replaceState` 清临时参数;网页 token 不进 URL。

### 9.4 接口合同

两接口均挂 `/api/client/auth` 前缀,只允许 POST。

**`POST /auth/extension-login/code`**(Website 登录态签发一次性 code,Bearer 必带):

- 请求:`{ "code_challenge": "<43字符 [A-Za-z0-9_-]>" }`;响应:`{ "code": "...", "expires_in": 60 }`。
- 链路:用户存在且可登录校验 → 用户级限流(10 次/300 秒)→ 签发。
- challenge / verifier 格式由请求 schema 校验(长度 + 字符集 pattern),非法 422。

**`POST /auth/extension-login/exchange`**(插件消费 code,无 Bearer):

- 请求:`{ "code", "code_verifier", "old_extension_access_token?", "old_extension_refresh_token?" }`(verifier 43–128 字符,RFC 7636 字符集)。
- 响应:`{ extension_access_token, extension_refresh_token, token_type:"bearer", expires_in, user }`。
- `user_id` 以 code 载荷为权威,不信任请求携带的任何身份字段;同账号旧插件 token best-effort 撤销——撤销目标恒为 code 内 user_id,解析失败 / 类型不匹配 / 跨账号 / 撤销失败都跳过且不阻断签发,日志不记录 token 明文。
- token 语义:extension_* 是项目用户 token(`USER_ACCESS`/`USER_REFRESH`),写入同一套 Redis token ZSet 与用户 session;与 Website token 完全独立(同 user_id 不同 session、各自 jti)。

错误口径:

| 场景 | 处理 |
| --- | --- |
| code 过期 / 已消费 / 不存在 / verifier 不匹配 | 统一认证失败;插件放弃写入、UI 保持原状,可重新发起登录 |
| issue 端 Bearer 无效 / 过期 | 现有 `get_current_user` 401 口径 |
| 用户不存在 / 注销 / 不可登录 | 按现有 auth 错误返回 |
| 用户级限流超限 | 频率限制错误;用户稍后重试 |
| schema 格式非法(challenge / verifier / code) | 422 |

### 9.5 插件侧行为(Maps / Bing 同构)

- 登录 owner 是 background RPC(`openExtensionLogin`):PKCE 生成、`launchWebAuthFlow`、exchange、存储提交全在 background;不放 popup(popup 生命周期不覆盖登录窗口)。
- **快照比对提交**:exchange 前读 storage 三键快照,提交前重读比对(access+refresh+user 全等才写);不一致(如期间用户已在 popup 登出)放弃写入并按失败返回,不写半截态、不重试、不清原登录态。
- UI 不依赖 RPC 返回值判断登录结果:任何失败统一按未完成处理并静默复位按钮(30 秒 RPC 超时同);最终结果一律以 `storage.onChanged`(auth 三键)为准——登录在 background 完成,popup / 面板保持打开时靠监听即时刷新账号态与用量 / 订阅。
- Bing 特有:登录写入成功后强制失效并重拉订阅态(FREE/PRO 门控);background 另有 auth 三键 storage watcher,登出时失效内存订阅态,防门控陈旧。
- 登出仍按现有口径:清插件三键 + 撤销服务端当前 access token,不影响 website 登录态。

### 9.6 安全边界

- **public client 模型,不登记扩展 ID**:无 `externally_connectable`、无 manifest 固定 key、不注入官网 content script、不申请官网 host 权限。任何扩展都可为自己的回调发起登录,但只能拿到绑定其自身 verifier 的一次性 code;账号交接必须由用户在官网确认页显式点 Continue。
- code 短效(60 秒)+ 一次性 + 服务端只存 sha256 摘要 + 仅走 URL fragment(不进 server 日志 / referer);网页 token 与插件 token 均不进 URL、不进任何消息通道。
- 网页登录态与插件登录态完全独立:website 登录、登出、换号不影响插件;两插件各自独立会话,互不覆盖。
- 旧插件 token 撤销失败不阻断新登录;并发签发可能留下同账号孤立 token,按 access token TTL 自然过期。
- 不做 Cookie 共享、不做 URL token、不做跨任意域名 token 接收。

## 10. Telegram 登录(规划态,未实现)

规划中,代码未实现。本域预留位,落地时在此补充。

## 11. 实现代码索引

- Google 认证 service(id_token 校验 / JWKS / 权威邮箱 / code 换 token):`@backend/src/app/services/google_auth_service.py`
- Google 一次性票据 / state service:`@backend/src/app/services/google_redirect_login_service.py`
- 插件登录 v3 一次性 code service(PKCE S256 绑定 / 原子消费):`@backend/src/app/services/extension_login_code_service.py`
- 登录 API(v3 code/exchange 两端点 + Google authorize/callback/exchange/google-login):`@backend/src/app/api/client/auth_client.py`
- website 前端 Google(Identity 加载 / One Tap / 自定义按钮 / redirect 结果处理):`@website/src/scripts/homepage/auth.ts`
- website v3 确认页 `/extension-login`(入口校验 / 五态状态机 / 账号确认卡):`@website/src/pages/extension-login.astro`
- website 认证弹窗(确认页复用):`@website/src/components/auth/AuthModal.astro`
- Maps 插件 background 登录 owner(PKCE + launchWebAuthFlow + exchange + 快照提交):`@extension/src/background/services/extensionLogin.ts`;auth API:`@extension/src/core/api/auth/api.ts`;popup 账号区:`@extension/src/popup/App.vue`
- Bing 插件 background 登录 owner:`@extension-bing/src/background/services/openExtensionLogin.ts`;authStore(`applyExtensionLogin` + 订阅联动):`@extension-bing/src/core/stores/authStore.ts`;popup 账号区:`@extension-bing/src/popup/App.vue`

> v2 桥相关实现(`extension-login-v2.astro`、`notifyWebAuthChanged`、`onMessageExternal` handler、`websiteOrigin.ts`、Bing `WebsiteAuthBridge.ts`、后端 `POST /extension-token`)已随 v3 上线全部删除。

## 12. 非功能要求

- 不新增第三方依赖;不新增依赖注入(`google_auth_service` / `google_redirect_login_service` 为进程级单例)。
- 接口只用 GET(authorize/callback 跳转)+ POST(google-login/exchange/旧 callback)。
- 一次性票据(state / login code)只存 sha256 哈希,不存明文;原子 `GET + DEL` 消费;第二次消费必失败。
- `return_to` 必须过白名单,失败回退到 `public_website_base_url`。
- 错误信息带可定位字段(`email` / `client_id` / `return_to` / `state`)。
- `GOOGLE_CLIENT_SECRET` 不得出现在任何前端 PUBLIC 配置;后端日志不记录完整 id_token。
