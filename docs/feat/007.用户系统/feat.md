# 007 · 用户系统

> 产品需求文档。只描述"功能是什么 + 边界条件 + 验收 + 用户操作/UI"。技术实现(账号数据模型字段与索引、JWT 签发/验签/轮换、会话存储、Google/Telegram OAuth 接入、邮箱验证码规则、限流、认证弹窗规格)见同目录 `tech-*.md`。
>
> 关联:
> - 本域技术:`@tech-账号与认证.md` `@tech-第三方登录.md` `@tech-邮箱登录设备校验.md`
> - 变更记录:`@changelog.md`
> - 下载按登录用户扣 Credits、注册赠送 Credits 归属用户:`@../003.积分系统/feat.md`
> - 订单归属用户(下单/履约/查询以 user_id 为准):`@../004.订单系统/feat.md`
> - extension 匿名下载 device_id 与登录用户的关系、每日计数口径:`@../005.计数器系统/feat.md`
> - 下载链路本身(下载授权 token、扣费触发点):`@../002.下载功能/feat.md`
> - 节点角色/执行环境:`@../001.节点系统/feat.md`

## 系统定性:基础设施域

用户系统是**基础设施域**,管客户端用户账号、注册、登录、会话、客户端认证(JWT)、第三方登录(Google 已实现,Telegram 在规划中)、认证弹窗、账号信息查询。被节点系统、下载、积分、订单、计数器依赖:积分归属用户、订单归属用户、计数器按 device_id 或 user_id 统计、下载授权按登录用户签发。

> **边界声明(重要)**:本域只管**客户端用户认证**。节点系统里的 JWT-only 是**节点 admin / 管理后台的本地认证**(独立的 admin 账号表、`ADMIN_ACCESS`/`ADMIN_REFRESH` token 类型、独立的 admin token 服务),与客户端用户认证是**两套独立体系**,共用同一份 JWT 密钥配置但不共享账号、不共享 token 存储、不共享鉴权依赖。节点 admin 认证属 `@../001.节点系统/tech-节点Admin与本地管理.md`,**本域不涉及**。

## 功能目标

为客户端(website、extension)用户提供:

1. **账号身份**:一个邮箱归一个用户;无论从 Google 还是邮箱验证码进入,只要邮箱相同就是同一个账号。
2. **登录入口**:website 以 Google 为主路径、邮箱验证码为次级;extension 不内嵌登录表单,统一打开 website 独立登录页,由 website 完成 Google / 邮箱登录后同步插件登录态。
3. **会话与认证**:登录成功签发客户端 access/refresh token,后续请求带 Bearer,服务端验签 + Redis 校验有效性。
4. **账号信息查询**:已登录用户可查自己的基本资料、Credits 余额与当前订阅摘要。
5. **重要入口设备保护**:website 通过 Credits 图标资源请求建立设备 UUID 的短期可信关系;邮箱验证码入口和媒体 pre-v2 控制面只接受已验证设备,IP 只用于日志排障。

## 功能范围

### 包含

- **邮箱验证码登录/注册**:输入邮箱 → 发送 6 位验证码 → 验证通过后服务端自动判断:未注册则创建账号,已注册则登录。同一邮箱只对应一个用户。
- **Website 设备可信校验**:website 页面加载后写入 `client_uuid` Cookie,再加载 `/assets/icons/credits.svg`;后端通过这个真实 Credits SVG 请求记录 `device_id` 可信关系,有效期 7 天。Logo 请求 IP 仅用于日志排障,不参与拒绝。邮箱验证码入口和媒体 pre-v2 控制面入口可按配置校验该可信关系,未通过时提示用户刷新页面后重试;发布期可关闭拦截但保留真实审计日志。
- **Google 登录(website 已实现)**:
  - 手动主路径:点击自定义 Google 按钮 → 整页跳转后端 OAuth authorize → Google 授权 → 后端 callback 用 code 换 id_token、校验、查/建用户 → 渲染一次性登录票据回前端 → 前端 exchange 换正式 token。
  - One Tap 辅助路径:登录弹窗打开时自动提示,Google 通过 GIS callback 返回 credential → 前端提交后端校验。
  - 非权威 Google 邮箱(@gmail.com 与带 `hd` 的 Workspace 邮箱为权威)不直接发项目 token,改发邮箱验证码让用户二次确认。
- **JWT 会话**:access token(默认 24 小时)+ refresh token(默认 7 天),refresh 轮换(旧的失效)+ 30 秒宽限期(防并发刷新),token 有效性存 Redis,支持多设备同时登录。
- **账号信息查询**:已登录用户查自己的 user_id / email / full_name / avatar_url / created_at / Credits 余额 / 当前订阅摘要。
- **IP 注册权益风控**:同一 IP 在配置窗口内注册账号超过允许数量后,新账号仍正常创建和登录,但不发注册 Credits,也不给可领取的签到活动。
- **登出**:撤销当前 access token。
- **认证弹窗(website)**:首屏 Google 主按钮 + `Continue with email` 次级入口 + 条款;点邮箱入口展开邮箱子界面;发码后展开验证码子界面。14 语言 i18n。
- **extension 匿名身份**:未登录用户带 `X-Device-Id`(UUID v4,首次安装生成并持久化)参与请求;登录后请求带 Bearer。device_id 与登录用户的关系在计数器系统定义(`@../005.计数器系统/feat.md`)。
- **extension website 统一登录**:插件点击登录后打开或聚焦 website 独立登录页;website 已登录时直接同步插件登录态,未登录时复用 Google / 邮箱登录;用户直接在官网任意登录入口登录成功时,也同步插件登录态。

### 不包含

- **节点 admin / 管理后台认证**:属节点系统(`@../001.节点系统/tech-节点Admin与本地管理.md`),本域只管客户端用户认证。
- **下载授权 token 签发/验签**:下载链路用自己的非对称密钥签发下载 token,与用户 JWT 是两套,属下载功能(`@../002.下载功能/feat.md`)。
- **下载按用户扣费、Credits 余额、积分包购买、注册赠送 Credits 的余额与流水写入**:属积分系统(`@../003.积分系统/feat.md`);本域只决定注册权益是否可发、并在"账号信息查询"里读余额展示。
- **订单归属用户、下单/履约编排**:属订单系统(`@../004.订单系统/feat.md`)。
- **extension 每日下载次数计数、device_id 匿名下载规则**:属计数器系统(`@../005.计数器系统/feat.md`)。
- **账号自助注销入口**:当前无公开的账号注销/删除接口(软删标记字段存在但无客户端入口触发;详见 `@tech-账号与认证.md`)。
- **密码登录入口**:历史上有密码注册接口,website/extension 当前都不暴露密码登录 UI,主路径是邮箱验证码与 Google。
- **GitHub 登录、绑定多个第三方账号、独立 OAuth account 表**:不接入。
- **保存 Google access token / refresh token**:不保存。
- **URL 传递 token、跨任意域名接收 token、共享 Cookie 登录**:不做;插件只接受官网经 `externally_connectable` 发给两个固定扩展 ID 的网页登录态。
- **Telegram 登录**:规划中,未实现。

## 现状说明

- **website 登录以 Google 为主**:首屏只展示 Google 主按钮和 `Continue with email` 次级入口,邮箱验证码表单默认隐藏。
- **extension 使用官网统一登录**:Popup 只提供登录入口,点击后由 background 打开 website 独立登录页;插件内不再维护邮箱验证码表单。官网继续提供 Google 主路径与邮箱验证码次级路径,登录成功、打开插件专用登录页或从插件进入 Pricing 时通过两个固定扩展 ID 通知 extension background 同步插件 token,详见 `@tech-第三方登录.md`。
- **website 不存 refresh token、不自动刷新**:website 只存 access token,401 直接清登录态重新弹窗;extension 存 refresh token 并有 401 自动刷新拦截器(两套客户端策略不同,见 `@tech-账号与认证.md`)。
- **注册赠送**:邮箱验证码、Google 无密码注册、密码注册路径默认赠送 10 Credits(走积分系统);命中 IP 注册权益风控的新账号不赠送。注册赠送不写 `user_subscriptions`。
- **账号注销**:无公开入口;被标记为已注销的账号登录被拒(按"用户不存在")。
- **登录失败保护**:当前生效的是 **IP 级别限流**(5 分钟 10 次失败 → 封该 IP 10 分钟)。用户级别锁定(按账号累计失败次数锁定)字段与依赖已就位,但失败计数尚未接线(为 stub,带 TODO),实际不触发按用户锁定。
- **登出范围**:登出只撤销当前 access token,**不撤销 refresh token、不影响其他设备**(多设备登录态保留);完整撤销所有 token 的能力存在但没有公开入口触发。

## 业务流程

### 邮箱验证码登录/注册

1. 用户进入 website 页面后,页面运行时确保 `device_id` 存在,写入 `client_uuid` Cookie,并加载 footer 内的 `/assets/icons/credits.svg` 真实 Credits 图片。
2. 后端收到 SVG 请求后读取 Cookie 与客户端 IP,写入 7 天有效的设备可信关系;无论写入成功与否都返回 SVG,异常返回 404。
3. 用户在 website 认证弹窗点击 `Continue with email`,展开邮箱子界面,输入邮箱。
4. 点击发送验证码,后端先校验当前 `X-Device-Id` 与 IP 是否已有可信关系;未通过时返回"请刷新页面后重试"错误,不发送邮件。
5. 设备校验通过后,后端校验发送频率(同邮箱 60 秒内 1 次)并生成 6 位验证码,存 Redis(10 分钟有效),发邮件。
6. 前端展开验证码子界面(含验证码输入 + `Send again`),用户输入验证码提交。
7. 验证码登录接口同样先校验当前设备可信关系;未通过时返回"请刷新页面后重试"错误,不验证验证码、不创建账号、不签发 token。
8. 设备校验通过后,后端校验验证码(最多 5 次尝试,超限清码重发):未注册则创建无密码账号,按 IP 注册权益风控决定是否赠送 10 Credits;已注册则登录。
9. 签发 access/refresh token 存 Redis,返回登录响应(access/refresh/user)。
10. 验证码错误计数 +1;过期需重新获取;尝试超限需等待或重发。

### 媒体 pre-v2 控制面保护

1. 用户在 website 下载工作区发起解析或下载授权前,页面已通过 Credits SVG 请求建立设备可信关系。
2. 解析控制面先校验当前 `device_id` 可信关系,未通过时提示刷新页面,不进入 IP 限流和节点选择。
3. 下载授权控制面在登录态有效后校验当前 `device_id` 可信关系,未通过时提示刷新页面,不进入用户短锁、资源 token 校验和扣 Credits。
4. 设备可信关系不替代登录态、不改变下载额度归属;下载授权仍按登录用户扣 Credits。

### Google 登录(website,手动主路径)

1. 用户在认证弹窗点击自定义 Google 按钮,按钮立即进入 loading 态,整页跳转后端 OAuth authorize(带 `return_to` = 当前页 URL)。
2. 后端校验 `return_to` 白名单(只允许项目自有域名及 localhost),Redis 写 600 秒一次性 OAuth state,302 到 Google 授权页。
3. 用户选择 Google 账号,Google 回调后端 OAuth callback(带 code + state)。
4. 后端原子消费 state,用 code + 后端私有的 Google client secret 向 Google 换 id_token,校验 id_token(aud / iss / exp / email_verified / 权威邮箱判定)。
5. 权威邮箱(@gmail.com 或带 `hd` 的 Workspace):查/建用户(首次注册方式记为 google,新用户按 IP 注册权益风控决定是否赠送 10 Credits),签发一次性登录票据,303 回 `return_to?google_login_code=...`。
6. 非权威邮箱:发邮箱验证码,303 回 `return_to?google_email_verification=邮箱`,前端展开邮箱验证码子界面,用户完成验证码登录后首次注册方式记为 email_code。
7. 失败:303 回 `return_to?google_login_error=...`。
8. 前端在下载工作区读取 `google_login_code` / `google_login_error` / `google_email_verification`,处理后清 URL;有 code 时调 exchange 接口换正式 token(一次性,第二次失败),无 code 时重置弹窗到 Google-first 并提示。

### Google 登录(website,One Tap 辅助路径)

1. 认证弹窗打开时,前端加载 Google Identity Services 并调用 prompt()。
2. Google 通过 callback 返回 credential,前端提交后端 google-login 接口。
3. 后端校验 id_token:权威邮箱走完整登录(查/建用户、签发 token);非权威邮箱改发邮箱验证码,返回需要二次确认的中间态(不签发项目 token)。
4. One Tap 失败、被拦截或超时不阻断用户继续点击手动 Google 按钮。

### extension website 统一登录

1. 用户在 extension Popup 点击登录。
2. extension background 打开 website 独立登录页,URL 不携带扩展 ID 或来源参数。
3. website 登录页读取当前网页登录态:
   - 本地有 access token:校验成功后显示已登录状态,并向两个固定扩展 ID 补发一次插件登录态。
   - 本地 token 过期或无效:清理本地网页登录态,展示 Google / 邮箱登录入口。
   - 未登录:展示现有 Google / 邮箱登录入口;登录成功保存网页登录态时立即向两个固定扩展 ID 发送。
4. 用户在任意官网入口通过 Google 或邮箱登录成功时,`setStoredAccessToken()` 写入 token 并立即发送;从插件打开带来源标记的 Pricing 时也补发一次。普通来源页面加载和其他标签页的 storage event 不触发同步。
5. extension background 收到官网 external message 后签发插件 access/refresh token;如果插件已有旧 token,background 一并带给后端尝试撤销当前 web 用户名下的旧 token。
6. 插件专用页的返回按钮通知 extension 关闭当前登录页并聚焦 Telegram;普通页面同步不会切走用户当前页面。
7. 如果用户没有安装、禁用插件或消息桥失败,website 登录仍正常完成;页面不等待 ACK、不做自动重试,用户刷新官网页面、再次登录或从插件重新打开登录页即可重试。

### Token 刷新(extension)

1. 请求带 Bearer access token,服务端验签 + Redis 校验。
2. access token 过期(401),extension 拦截器用 refresh token 调 refresh 接口。
3. 后端校验 refresh token(含 30 秒宽限期),签发新 access + 新 refresh,旧的 refresh 进入宽限期(30 秒后失效),新 access 存 Redis。
4. refresh 接口返回 HTTP 200 时,只有同时取得完整的新 access/refresh token 对才算成功;业务错误信封、响应不可解析或任一 token 缺失都视为永久失败并清登录态。网络错误和非认证类非 200 响应视为临时故障,保留登录态供用户重试。

### 登出

1. 已登录用户调登出接口,带当前 Bearer。
2. 后端撤销当前 access token(从 Redis 删除),返回成功。
3. refresh token 与其他设备的 token 不受影响(多设备登录保留)。
4. website 登出只清 website 本地 access token,不清 extension storage;extension 登出只清插件 storage,不清 website localStorage。
5. website 后续登录另一个账号并触发同步时,extension 账号会被覆盖成当前网页登录账号。

### 账号信息查询

1. 已登录用户调用账号信息接口,后端按 user_id 取账号资料,附带读 Credits 余额(走积分系统)。
2. 已注销的账号登录被拒。

## 非功能性需求

- 不新增第三方依赖;不新增依赖注入(service 为进程级单例,api 层可用 `Depends`)。
- 所有时间口径以服务器系统时区为准;按天统计以本地 0 点为界。
- 只能用 GET 和 POST。
- 错误信息必须能定位到具体接口、用户、邮箱(抛错带详细 msg)。
- 允许局部出错让用户重试(验证码发送失败、Google 授权失败、token 刷新失败都让用户重新操作),禁止过度设计。
- `user_ip_registers` 是可随时清理的风控辅助表,只影响后续权益判断;写入失败、被清理或窗口统计短暂不准都不阻断注册和登录。
- 文案需 i18n。
- Website 设备可信校验只保护明确列出的重要入口;Google 登录、下单、支付创建、mark-log、媒体执行节点接口不纳入本阶段。
- 公开可见命名使用真实业务资源语义:DOM 挂载点为 footer Credits 图标、Cookie 为通用客户端 UUID、资源路径为 Credits SVG;验证语义只出现在后端内部 service、Redis key 和技术文档中。
- Google client secret 只在后端配置,不进入任何前端 PUBLIC 配置;后端日志不记录完整 id_token;一次性票据(code/state)只存 sha256 哈希,不存明文。
- website 与 extension 同步登录态时,website 通过 `externally_connectable` 向正式版与预发布版两个固定扩展 ID 发消息;扩展只接受 manifest 声明且通过运行时 origin 校验的官网来源,无需注入官网 content script 或申请官网 host 权限。
- 插件 access/refresh token 只由 extension background 调插件 token 签发接口获得并写入插件 storage,不进入 website JS、URL、浏览器历史或埋点日志;旧插件 token 撤销只作用于当前网页登录用户,失败不阻断新登录。

## 验收标准

产品视角的关键验收(技术层验收见各 `tech-*.md`):

- 邮箱验证码登录:未注册邮箱首次验证通过后创建账号,未命中 IP 注册权益风控时赠送 10 Credits;已注册邮箱验证通过后登录原账号;同一邮箱只对应一个 user_id。
- IP 注册权益风控:同一 IP 在配置窗口内第 N+1 个及之后注册的新账号不获得注册 Credits;进入签到系统时直接得到已结束活动,不会出现可领取签到奖励。N 由 `config_public.registration_ip_benefit_guard.max_registrations` 配置。
- Website 设备可信校验:website 页面加载后会请求 `/assets/icons/credits.svg`;请求成功后 7 天内同一 device_id 可发送邮箱验证码、提交验证码登录、发起媒体 pre-v2 解析和下载授权;开启校验后,未验证或过期时受保护入口直接提示用户刷新页面后重试。Logo 请求 IP 和受保护 API 当前 IP 只进日志。
- 邮箱验证码规则:6 位数字、10 分钟有效、同邮箱 60 秒内最多发 1 次、最多 5 次验证尝试;发送失败可立即重发(频率限制回退)。
- IP 限流:同一 IP 5 分钟内 10 次登录失败后封禁 10 分钟,封禁期间登录返回 IP 封禁错误。
- Google 登录(website):手动按钮点击后立即 loading 并整页跳转后端 OAuth authorize;权威邮箱完成授权后能拿到项目 token;非权威邮箱不直接发项目 token 而是回邮箱验证码;`aud`/`iss`/`exp`/`email_verified` 任一不达标拒绝;`google_login_code` 一次性,第二次兑换失败。
- One Tap:弹窗打开时自动提示;失败不阻断手动 Google 按钮与邮箱验证码 fallback。
- 同一邮箱先邮箱验证码、再 Google 登录(或反过来),最终是同一个用户;首次注册方式只在新用户创建时写,后续换登录方式不覆盖。
- 邮箱规范化:trim + 转小写;不做 Gmail 点号折叠或 `+tag` 折叠。
- JWT:access 24 小时、refresh 7 天;refresh 轮换 + 30 秒宽限期;token 有效性走 Redis;多设备登录互不影响。
- 登出:撤销当前 access token;其他设备与 refresh token 不受影响;website 登出不影响插件登录态,插件登出不影响网页登录态。
- 账号信息查询:返回 user_id/email/full_name/avatar_url/created_at/credits_balance/当前订阅摘要;注销账号登录被拒。
- 认证弹窗(website):首屏以 Google 为主,邮箱验证码只显示次级文字入口;14 语言类型检查通过。
- Google client secret 不出现在任何前端 PUBLIC 配置;前端配置不含 secret。
- extension website 统一登录:插件点击登录能打开无扩展 ID 参数的 website 独立登录页;website token 有效时无需再次 Google/邮箱登录,校验成功后向两个固定扩展 ID 补发一次;website 本地 token 过期时清理后回到登录 UI;任意官网页面、任意登录方式成功写入 token 时都向两个固定 ID 同步;从插件打开带来源标记的 Pricing 时补发一次,普通来源页面不触发插件 token 重签;未安装插件或消息桥失败时 website 登录成功且无报错。
- token 同步边界:插件 token 不出现在 website JS、URL、浏览器历史、日志字段;website token 只通过官网 `externally_connectable` 信道发给源码内两个固定扩展 ID;background 忽略非官网来源;签发新插件 token 时可带旧插件 token 让后端尽量撤销当前网页登录用户名下的旧 token,跨账号旧 token 按 TTL 自然过期。

## 用户操作逻辑与 UI 元素

> website 常规认证 UI 集中在下载工作区的认证弹窗,并额外提供 extension 专用 `/extension-login` 页面。extension Popup 不渲染登录表单,只负责打开官网统一登录页和展示打开失败 Toast。文案需 i18n。

### website 认证弹窗(下载工作区内)

首屏:

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 弹窗遮罩 | 半透明背景按钮 | 是 | 点击关闭弹窗 |
| 关闭按钮 | × 图标按钮 | 是 | 关闭弹窗 |
| 标题区 | 文本(eyebrow + 主标题 + 可选描述) | 否 | 展示登录引导文案 |
| Google 登录按钮 | 主按钮(运行时注入,白色底 + Google 多色 G 图标) | 是 | 点击立即 loading(文案变 `Connecting...`),整页跳转后端 OAuth authorize |
| 邮箱次级入口 | 文本 `or` + 文本按钮 `Continue with email` | 是 | 展开邮箱子界面 |
| 条款 | 文本 + Terms/Privacy 链接 | 链接可点 | 跳条款/隐私页 |
| 错误提示 | 行内文本(默认隐藏) | 否 | 展示登录/发码错误 |

**标题区文案与设计基调**(website 认证弹窗,产品规格):

- **首屏标题文案**:
  - 主标题(eyebrow / 主):`Sign in to continue`
  - 副标题 / 描述:`Sync quota and continue downloading.`
  - 文案意图:明确"登录是为同步配额、继续下载",而非强制拦截;降低首次用户对"必须收邮件"的误解。
- **设计基调**(整体):
  - 浅色 SaaS 工具风格,与网站整体保持一致。
  - **不抄 Resend 的暗色品牌风格**(源 feat.031 明确约束);当前网站是浅色工具型,认证弹窗不引入暗色品牌重构。
  - Google 主按钮在首屏可见、是主要行动;邮箱验证码是次级文字入口,不与 Google 并列抢主路径;邮箱输入表单不在首屏出现(点 `Continue with email` 后展开),不默认展示验证码输入框。
  - 移动端约束:按钮、输入框和错误文案不得溢出视窗;关闭按钮、键盘 Escape、背景点击关闭维持当前行为。
- **i18n**:上述英文文案为默认基线,需在 14 语言资源中提供对应翻译。

邮箱子界面(点 `Continue with email` 后展开):

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 邮箱标签 + 输入框 | email 输入(autocomplete=email) | 是 | 输入邮箱 |
| 继续按钮 | 主按钮(蓝色渐变) | 是 | 提交邮箱发送验证码 |

验证码子界面(发码成功后展开):

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 验证码标签 + 输入框 | 数字文本输入(inputmode=numeric, autocomplete=one-time-code,6 位) | 是 | 输入验证码 |
| Send again 按钮 | 文本按钮(带冷却倒计时) | 是(冷却中禁用) | 重新发送验证码 |
| 登录按钮 | 主按钮 | 是 | 提交验证码登录 |
| 状态文本 | 行内文本 | 否 | 展示发码状态 |

### extension website 统一登录页

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 插件登录入口 | Popup 标题栏登录按钮 | 是 | 通过 background 新开 website 独立登录页 |
| website 独立登录页 | website 英文页面 `/extension-login-v2`,复用现有认证弹窗视觉与文案 | 否 | 承接插件登录;已登录时展示成功态,未登录时展示 Google / 邮箱登录 |
| 成功状态 | 页面内状态文本 | 否 | 提示网页登录成功;用户可点击返回 Telegram |
| 失败状态 | 页面内错误文本 | 否 | 只展示网页登录或 token 校验失败;插件不可用或同步失败不反向通知页面 |
| Popup 错误 Toast | 顶部临时提示 | 否 | background 无法打开官网登录页时显示错误;用户可再次点击登录 |

> extension 的旧 Google 登录按钮(隐藏 HTML + content script 方案)不再作为目标方案;统一改为打开 website 独立登录页。

## 关联文档

- 账号数据模型 + JWT 签发/验签/轮换 + 会话存储 + 邮箱验证码 + IP 限流 + 接口规格:`@tech-账号与认证.md`
- Google OAuth(code flow / One Tap / 权威邮箱判定 / 一次性票据 / return_to 白名单)+ extension website 统一登录:`@tech-第三方登录.md`
- website `client_uuid` Cookie + Credits SVG 请求 + Redis 设备可信关系 + 邮箱登录保护:`@tech-邮箱登录设备校验.md`
- 变更记录:`@changelog.md`
- 下载按用户扣费、注册赠送 Credits:`@../003.积分系统/feat.md`
- 订单归属用户:`@../004.订单系统/feat.md`
- extension 匿名 device_id 与登录用户关系、每日计数:`@../005.计数器系统/feat.md`
- 下载链路、下载授权 token:`@../002.下载功能/feat.md`
- 节点角色、节点 admin 认证(与客户端认证的边界):`@../001.节点系统/feat.md` `@../001.节点系统/tech-节点Admin与本地管理.md`
