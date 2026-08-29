# 008 · 接码平台适配层

> 覆盖 TG 自动登录的「接码链接拉取 + 验证码解析」子系统。菜单级上下文(列表 / 交互式登录 / 删除 / 飞书告警)见 `@tech-TG客户端.md`。
> 本文档只解决一个问题:**让自动模式批量登录能稳定地从多个接码平台拿到验证码**,并顺带救活现有 jiema 平台。
> 已经过五轮审查(两轮 code-reviewer 常规+对抗,三轮 opus 异构视角),关键边界与前端衔接语义已逐条核验。

## 背景与现状问题

自动模式批量登录上线后,在生产环境**基本不可用**,运营主要靠手动加号。根因经实测定位,不是单一问题,而是四条叠加:

1. **单平台硬编码**:后端 `admin_tg_client.py` 把 jiema 的 host / path / HTML 解析规则全部写死。新平台(next.tgapi.de)协议完全不同,无法接入。
2. **jiema 秒级限速 + 轮询自伤**:jiema 对同一订单 id 是秒级限速(连发即触发冷却),而前端 `no_code` 轮询间隔仅 5 秒(`AUTO_LOGIN_NO_CODE_WAIT_SECONDS = 5`,`TgClientView.vue:593`),极易在验证码到达前把 jiema 打到冷却;冷却期间码到了也只拿到 `cooldown`,拿不到 `code`。**这是"拿不到码"的首要真凶,不是 CF。**
3. **CF 偶发拦截**:两站都走 Cloudflare。生产服务器(hydra-singapore)实测当前裸 `httpx` 都能拿到 200 + 真实内容,但出口 cf-ray 边缘节点在 SIN/LAX 间漂移,IP 信誉波动时偶发触发 Bot Fight Mode。
4. **解析端点零日志**:`parse_tg_code_link` 的所有错误路径(超时 / 非 2xx / URL 拒绝 / HTML 解析失败)只把错误塞进响应体静默返回,不记日志,导致历史上"被挡"到底因 CF、速率还是超时,无据可查。

## 目标

- **多平台解析**:拉取器与解析器分层,按接码链接 URL 自动识别平台并分派对应解析器。加第三个平台只需新增一个解析器,不动拉取层与前端。
- **速率治理**:前端 `no_code` 轮询间隔上调到 8s(> 平台对同 id 的秒级限速),从根因上杜绝轮询自伤;后端不做请求节流(`code-link/parse` 是管理后台内部接口,流量可控,前端节奏已是根因治理)。
- **CF 防御性兜底**:统一用 `curl_cffi`(Chrome 指纹)拉取,过 Bot Fight Mode / TLS 指纹检查;并检测真正的 challenge 页(含 Turnstile / Managed Challenge 等 200 形态),触发告警与降级。
- **可观测**:拉取 / 解析 / CF 检测的关键事件全部落日志。
- **批量健壮**:单号失败(含 CF 超限)只标记该号失败并 `continue`,不中断整批队列;只有基础设施级故障才中断整批。

## 范围

### 包含

- 后端接码拉取 + 解析子系统的重构(平台注册表、拉取器、解析器、CF 检测、日志)。
- 引入第二个接码平台 next.tgapi.de 的解析规则。
- jiema 现有协议行为不变(迁移,需样本回归保障)。
- 引入依赖 `curl_cffi`,仅用于本拉取层(不全局替换 httpx)。
- 前端必要改动(均**不改变用户输入交互与平台识别方式**):
  - `CodeLinkParseResult` 新增 `cf_blocked` 状态;`waitAutoLoginCode` 重构错误模型(区分「该号失败 continue」与「基础设施 fatal 中断整批」)。
  - `no_code` 轮询间隔从 5 秒上调到 8 秒(`AUTO_LOGIN_NO_CODE_WAIT_SECONDS` 改值)。
  - `parseTgCodeLink` 透传 `phone`(自动模式已有该字段,仅透传给后端做一致性校验)。
  - 自动模式输入框 placeholder 更新为含两种平台样例。
- 后端单测 + real 集成测试 + 前端 e2e 补全。

### 不包含

- 不改自动模式的串行编排模型(仍是单号串行)、不改交互式新增登录链路、不改登录会话状态机。
- 不做接码平台的运营可配置 UI(平台定义放代码注册表,短期固定;预计第三个平台接入时再评估提取为配置)。
- 不引入 headless 浏览器(Playwright / camoufox)。`curl_cffi` 的指纹伪装过不了 JS Challenge / Turnstile;真出现时只告警降级,不自动硬刚(与"尽量别上浏览器"约束一致)。
- 不做接码平台官方 API 接入(next.tgapi.de 已实测无 JSON 端点;jiema 同为网页)。
- 不做多节点分布式限流(本期假设单节点执行,见「速率治理·边界」)。
- 不做管理员间的登录互斥(单节点多管理员同时登录同一号的平台层串号,见「速率治理·边界」)。
- `code-link/parse` 请求新增**可选** `phone` 字段(next 手机号一致性校验用),其余契约不变。

## 架构

### 分层

```
parse_tg_code_link(req)                     # API 端点,仅编排;鉴权沿用双 router dependencies,不注入 admin
  └─ code_link_service.parse(url, phone)    # service 入口(模块级实例)
       ├─ self.resolve_platform(url) -> CodeLinkPlatform   # host 严格相等分派,未命中→INVALID_REQUEST(host 合法性兜底)
       ├─ self._fetch(url, platform) -> FetchResult        # curl_cffi 拉取 + CF 检测(不做节流)
       │     ├─ curl_cffi.AsyncSession(impersonate="chrome").get(url, timeout=30)
       │     └─ self._detect_cf_challenge(status, headers, body) -> bool   # @staticmethod 纯逻辑
       └─ platform.parse(body) -> CodeLinkParseResult   # 平台策略对象,抽 code/2fa/状态
```

三层正交:**拉取**与**解析**解耦。CF 怎么过是拉取层的事;code/2fa 怎么抽,是解析器的事。加第三个平台 = 新增一个 `CodeLinkPlatform` 实现 + 注册,拉取层零改动。

拉取层不做请求节流:前端 `no_code` 8s 间隔已是根因治理(> 平台对同 id 的秒级限速),`code-link/parse` 作为内部接口流量可控,后端无需再节流(见「速率治理」)。

### 平台注册表

每个平台是一个 `CodeLinkPlatform` 实现,声明:

| 职责 | 说明 |
| --- | --- |
| `host` / `path_pattern` | URL 识别:**host 严格相等** + path 前缀/等值。禁止 `endswith` / `startswith` 等模糊匹配,杜绝未来 host 重叠时的静默误派。 |
| `parse(body)` | 从接码页 HTML 抽取 `code` / `pass2fa` / `login_time` 与业务状态(成功 / 冷却 / 无码 / 异常)。 |

`CodeLinkService._platforms` 是实例属性(`__init__` 内构建的有序列表),`resolve_platform(url)` 顺序匹配 host 严格相等者;全不命中抛 `INVALID_REQUEST` —— 这是 host 合法性的业务校验(API 层只做 https 格式校验,平台注册表决定哪些 host 合法)。最终 SSRF 保证:拉取层只会对已注册平台的 host 发起请求,未登记 URL 一律拒绝,后台接口不会变成任意 URL 代理。

**启动唯一性自检**:`_validate_hosts_unique()` 在 `__init__` 内执行,模块底部实例 `code_link_service = CodeLinkService()` 保证 import 时自检一次。校验所有平台 `host` 两两不同,冲突时抛 `RuntimeError`(启动期配置错误不走 `AppCommonException`)。service 组织方式遵循 `@docs/references/specs/spec-python.md` §9。

> **不引入依赖注入**:平台注册表是 `CodeLinkService` 的实例属性,端点直接 `from app.services.code_link_service import code_link_service` 调用,无 DI 容器、无工厂注入。端点签名不变、不注入 admin,鉴权沿用现状双 router `dependencies=[Depends(...)]`,不涉及新的 Depends 用法。

### 模块组织

**单文件 service**:`backend/src/app/services/code_link_service.py`,模块底部暴露 `code_link_service = CodeLinkService()`;其余组织约定见 `@docs/references/specs/spec-python.md` §9。

模块级只允许:常量、dataclass、Protocol、类定义、实例暴露。**不写模块级 `def`**。

- **常量 / dataclass**:`CODE_LINK_REQUEST_TIMEOUT_SECONDS` 等;`CodeLinkParseResult` / `FetchResult`。
- **`CodeLinkPlatform` Protocol**:声明 `host` / `path_pattern` / `parse(body)` 接口。
- **平台类(策略对象,`parse` 是方法)**:`JiemaPlatform`、`NextTgPlatform`,各自实现 `parse` + 声明 host / path / min_interval。
- **`CodeLinkService`(模块底部实例,所有逻辑都是方法)**:
  - `__init__`:构建 `_platforms = [JiemaPlatform(), NextTgPlatform()]` → 跑 `_validate_hosts_unique()` 启动自检(重复 host `raise RuntimeError`)。
  - `resolve_platform(url)`:host 严格相等分派,未命中抛 `INVALID_REQUEST`。
  - `_detect_cf_challenge(status, headers, body)`:CF 检测,**`@staticmethod`**(无 self 依赖的纯逻辑,便于纯函数测试直接 `CodeLinkService._detect_cf_challenge(...)` 调用)。
  - `async _fetch(url, platform)`:curl_cffi 拉取 + 调 `_detect_cf_challenge`(不做节流)。
  - `async parse(url, phone=None)`:入口,组合 resolve → fetch → `platform.parse` + next 手机号一致性校验 + 打日志。
- 模块底部:`code_link_service = CodeLinkService()`。

`admin_tg_client.py` 的 `parse_tg_code_link` 端点瘦身为编排:`code_link_service.parse(req.url, req.phone)`。端点签名不变(不注入 admin),鉴权沿用现状双 router `dependencies`。

> **为何不拆包**:就两个平台、每个解析器几十行、总量约 300 行,一个文件足够清晰。拆 `base`/`fetcher`/`registry`/`platforms/` 五文件是为不存在的复杂度建抽象。预计平台数 >4 或某解析器代码量膨胀时再拆。
> **平台类为何独立于 service**:平台解析是策略对象(策略模式),独立类 + `parse` 方法让「加第三个平台 = 加一个类 + 注册到 `_platforms`」,service 的 resolve / fetch 逻辑零改动。平台类不操作 model,不继承 `BaseService`。

**迁移清单(显式枚举 + 按职责落位,避免漏项与歧义)**:从 `admin_tg_client.py` 迁出的 6 个函数 + 4 个常量,按 spec-python §8(参数校验在 API 层)/ §9(函数不写在类外)分三处落位:

| 现状符号 | 新落位 | 理由 |
| --- | --- | --- |
| `_normalize_code_link_url` | **留 API 层**(`admin_tg_client.py`),仅保留 https 格式校验 + 有 host/path;**删除 host/path 白名单等值校验**(改由 `resolve_platform` 兜底) | spec §8:入参格式校验属 API 层 |
| `_parse_code_link_html` | 化为 `JiemaPlatform.parse` 方法体 | jiema 总解析,策略对象入口 |
| `_extract_login_time` | `JiemaPlatform._extract_login_time`(私有方法,含两段 fallback 正则) | jiema 业务逻辑 |
| `_html_plain_text`、`_extract_input_value_by_id`、`_extract_value_attribute` | `JiemaPlatform` 的私有方法(`_html_plain_text` / `_extract_input_value_by_id` / `_extract_value_attribute`) | jiema 专用 HTML 工具;next 走 `html.parser` 取 span 文本不复用,按 YAGNI 不抽 `app/utils` |
| `CODE_LINK_ALLOWED_SCHEME`(`"https"`) | 留 API 层(`_normalize_code_link_url` 格式校验用) | 格式校验常量 |
| `CODE_LINK_ALLOWED_HOST`、`CODE_LINK_ALLOWED_PATH` | **删除**,改由平台对象的 `host` / `path_pattern` 自声明 | 多平台后白名单不再单一,host 合法性归注册表 |
| `CODE_LINK_REQUEST_TIMEOUT_SECONDS` | 迁入 `code_link_service.py` 顶层常量 | 拉取层超时配置 |

**httpx 引用归零**:`admin_tg_client.py` 现有 4 处 httpx 引用 —— `import httpx`(line 31)、`httpx.AsyncClient`(line 93)、`httpx.Timeout`(line 94)、`except httpx.TimeoutException`/`except httpx.HTTPError`(line 98-101)—— 迁移后**全部删除/替换**,不留死 import(否则 ruff F401)。端点异常 catch 改为 `curl_cffi.requests.exceptions.RequestException`(见「依赖」)。

## 接码平台协议规格

> jiema 用正则(属性值边界清晰);**next 用标准库 `html.parser`**(span 文本提取,正则在嵌套标签/属性顺序/实体编码下脆弱)。解析顺序固定:**先判业务状态,再抽字段**;jiema 判冷却/无码,**next 无冷却只判无码** + 额外做最小页面完整性校验,避免把异常页误判为「无码」。

### jiema.didiapi.uk

| 项 | 规格 |
| --- | --- |
| URL 形态 | `https://jiema.didiapi.uk/getcode?id=<uuid>`(query 参数) |
| 匹配规则 | host == `jiema.didiapi.uk` 且 path == `/getcode` 且有 query |
| 验证码 | `<input id="code" value="<CODE>">` —— 取 `value` |
| 两步验证 | `<input id="pass2fa" value="<PWD>">` —— 取 `value` |
| 登录时间 | `form-group` 含「登录时间」标签 + 内嵌 input 的 `value`。**保留现有两段 fallback 正则**(主:`form-group` 包裹;fallback:`登录时间.{0,600}<input>`),迁移须 bit-for-bit 一致 |
| 冷却态 | 纯文本含 `请求过于频繁，请等待\s*(\d+)\s*秒再试` → `cooldown` + `cooldown_seconds` |
| 无码态 | 纯文本含 `无三十分钟内的登录消息` → `no_code` |

### next.tgapi.de

| 项 | 规格 |
| --- | --- |
| URL 形态 | `https://next.tgapi.de/tg/<uuid1>/<phone>_<token>-<hash>`(RESTful 路径,**含手机号**) |
| 匹配规则 | host == `next.tgapi.de` 且 path 以 `/tg/` 开头 |
| 验证码 | `<span id="code" ...><CODE></span>` —— 用 `html.parser` 取 `#code` 文本 |
| 两步验证 | `<span id="two-fa" ...><PWD></span>` —— 取 `#two-fa` 文本(id 是 `two-fa`) |
| 登录时间 | `<p id="code-received-at" ...>收到于: <TIME></p>` —— 取 `#code-received-at` 文本 |
| 多语言 | 页面有 zh/en 切换。**所有字段一律按 DOM id 取,不依赖文案语言** |
| 手机号一致性 | URL 路径段 `<phone>` 与请求传入的 `phone` 比对,不一致 → `INVALID_REQUEST` + 详细错误(防批量粘贴错位) |
| 冷却态 | **无**:next 是 RESTful 路径,每次请求返回最新状态,实测无冷却/限速(与 jiema 秒级限速不同),无冷却正则;若生产发现限速态,按 jiema 冷却正则(`请求过于频繁…请等待 N 秒`)模式补 |
| 无码态 | 主判据为 `#code` 缺失或为空 → `no_code`(已实现,见 `NextTgPlatform.parse`) |
| **最小完整性校验** | 解析前要求页面含稳定锚点(`#code-received-at` 容器存在)。锚点缺失 + `#code` 缺失 → `unknown`(告警),**不得**判 `no_code` —— 否则异常页(部分加载 / 被注入骨架)会被误判为无码导致前端死循环 |

## 速率治理

### 根因:前端轮询节奏

自动模式是单号串行(`handleAutoLogin`),「同 URL 重复请求」只发生在前端 `no_code` 轮询。**根因是前端原 5s 轮询节奏快于平台对同 id 的秒级限速**(jiema 实测连发即触发冷却),轮询本身把平台打到冷却,码到了也只拿到 `cooldown`、拿不到 `code`。

### 方案:前端控制取码节奏,后端不节流

- **前端首次取码等待 5s**(常量 `AUTO_LOGIN_INITIAL_CODE_WAIT_SECONDS`)。`startTgLogin` 发码成功后不立刻请求接码页,先等新验证码到达,避免接码平台短时间返回上一轮缓存码导致提交过期验证码。
- **前端 `no_code` 间隔 5s → 8s**(常量 `AUTO_LOGIN_NO_CODE_WAIT_SECONDS`,改值不改名)。8s > 平台对同 id 的秒级限速,从根因上杜绝轮询自伤;码到达后最多 8s 检出。
- **后端不做请求节流**:`code-link/parse` 是管理后台内部接口,调用方是受控前端首次等待(5s)+轮询(8s 节奏)+ 管理员串行操作,不是公网高并发场景。前端节奏已是根因治理,后端再节流是冗余防御层;砍掉它同时消除「缓存遮蔽真实码」「短 cooldown 死循环」「跨会话串号」等缓存引入的隐患,`CodeLinkService` 也更简单(无缓存 dict、无时间源、无双侧自检)。
- **阶段 2 实测校准**:next 无冷却/限速(RESTful 路径每次返回最新状态),不占用安全间隔配额,速率治理主要约束 jiema(实测连发即冷却)。若后续某平台实测安全间隔 > 6s(逼近前端 8s),回到设计层调大前端 `no_code` 间隔(如 12s),不让前端轮询贴近平台限速。

### 边界

- **多节点**:无后端节流,多节点部署不受影响;但多管理员跨节点同时登录同一号仍可能触发平台限速 —— 平台层串号后端无法单方面避免,运营需协调不同时登录同一号。
- **管理员同号(已知不修)**:接码平台本身缓存验证码,甲消费 code 后乙在码有效期内真打可能拿到同一已消费码 → `code_invalid`(30014),重试即恢复。本期不做管理员登录互斥。

> 说明:首次等待与 `no_code` 间隔都只调整前端取码节奏,不违反「平台识别前端不变」原则 —— 用户输入交互与平台识别方式(后端按 URL 自动分派)均不变。

## CF challenge 检测与降级

### 客户端:统一 curl_cffi

拉取层用 `curl_cffi.requests.AsyncSession(impersonate="chrome")` 替代 `httpx.AsyncClient`。默认伪装 Chrome 的 TLS/JA3/HTTP2 指纹,过 Bot Fight Mode / 基础 WAF / TLS 指纹检查。

```python
from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException  # 规范路径(非 errors.RequestsError)

async with AsyncSession(impersonate="chrome", timeout=30) as s:
    resp = await s.get(url, timeout=30)  # timeout 同时在 request 调用点显式传,规避 session 级 timeout 传递问题
```

仅本拉取层使用 curl_cffi,项目其它 httpx 用法不动。**不回退 httpx**:curl_cffi 不可用时直接降级(见「依赖·health check」与「降级策略」)。

### challenge 检测(扩充,覆盖 200 形态)

`CodeLinkService._detect_cf_challenge(status, headers, body) -> bool`(`@staticmethod`,无 self 依赖的纯逻辑;real 测试**不 mock 它** —— 只 mock curl_cffi 出口返回构造的 CF body,由真实 `_detect_cf_challenge` 判定,符合 spec-test-server §5「real 测试只 mock 外部出口」)。判定为真正 CF 拦截的条件(**满足任一**):

1. body 含 CF 挑战标志**之一**(不限状态码):`just a moment` / `cf-chl` / `cf-browser-verification` / `cf-challenge-form` / `cf-turnstile` / `challenges.cloudflare.com` / `cdn-cgi/challenge-platform/h/g/`(注意:含表单 action / JS 入口的 challenge-platform 路径,区别于被动脚本引用);
2. 响应头 `cf-mitigated` ∈ {`challenge`, `block`};
3. 状态码非 2xx 且 `Server: cloudflare`。

**白名单豁免(条件 1 body marker)**:body marker(含 `cdn-cgi/challenge-platform/h/g/` 等)命中时,若 **2xx 且含 `#code`**(`_body_has_code_id`,jiema input / next span 均用 `id="code"`)→ 视为真实接码页(marker 命中是被动 challenge-platform 脚本噪声),豁免该 marker 不判 `cf_blocked`,仅 break 出 marker 循环,继续检查条件 2(cf-mitigated 头)/ 条件 3 / 内容回判——真实 challenge 头是强信号,不受 marker 豁免影响。非 2xx 或无 `#code` 的 marker 命中仍判 `cf_blocked`。

**判定优先级(解析前 CF 标志 > 平台完整性校验 > 内容回判兜底)**:
1. **CF 标志命中**(上述任一)→ `cf_blocked`,不进入解析(body marker 的 2xx+`#code` 白名单豁免见上)。
2. 否则进入解析;平台做**完整性校验**:next 要求 `#code-received-at` 锚点存在,锚点缺失 + `#code` 缺失 → `unknown`。
3. **内容回判(最后兜底)**:解析后若 `#code` 缺失**且** body 长度异常短(< 2KB)→ 判 `cf_blocked` 而非 `unknown`。
   - 优先级说明:CF 标志在前,所以"骨架页(< 2KB)+ 无 CF 标志 + 无锚点"会走到完整性校验判 `unknown`(前端按单号失败处理),不会被 CF 回判误判为 `cf_blocked` 进 30s 退避死等。只有"无 CF 标志 + 解析后 `#code` 缺失 + body 异常短"才兜底判 `cf_blocked`。

### 降级策略

- 检测到 challenge → 返回 `cf_blocked` + `logger.warning` 记 url / 状态码 / cf-ray / host + 触发飞书告警(复用现有告警出口,去重 key `warning_code_link_cf:<host>:<hour>`,1 小时 1 条/平台)。
- **前端错误模型重构(关键)**:`AutoLoginFatalError` 的现有语义是**中断整个批量队列**(`runAutoLoginEntry` 重抛 `TgClientView.vue:1412-1414` → `handleAutoLogin` 中断 for 循环)。必须区分两级故障:
  - **该号失败(标记 failed + `continue` 到下一个号)**:`cf_blocked` 退避 2 次(30s → 60s)后第 3 次仍命中、`network_error` / `timeout` / `unknown` / `code_invalid` 等单号问题 —— 标记该号失败并 `continue`(与 `tech-TG客户端.md` 一致,取消"network_error 连续超限"措辞)。其中 `timeout` / `network_error` / `unknown` / `code_invalid` **立即**失败;`cf_blocked` 按退避数组 `[30s, 60s]` 重试,退避 2 次后第 3 次仍命中则该号标记失败原因"接码平台被 CF 拦截"并 `continue`,**不中断整批**。
  - **基础设施 fatal(中断整批)**:仅 `startTgLogin` 阶段的**非业务错误**(目标节点不可达 / 网络错误 / HTTP 非 2xx —— `nodePost` 此类失败抛普通 `Error`,非 `BusinessError`,属全局 infra,中断整批避免 N 个号无谓级联失败)。**`start` 业务错误(phone_banned 30009 / flood_wait 30010)、`submit` 业务错误(code_invalid 30014 / password_invalid 30015)、会话过期(30007)都是 `BusinessError`,归该号失败 continue**(会话过期是 per-entry,非全局 infra)。**curl_cffi 全局 disabled 不算 fatal** —— 它走 200 + `network_error`,前端按该号失败 + continue。
  - **改造锚点**:`TgClientView.vue` `waitAutoLoginCode` 内对 `cf_blocked` / `timeout` / `network_error` / `unknown` 现在统一 `throw AutoLoginFatalError`(fatal),改为抛**可恢复 `Error`**(cf_blocked 退避 30s→60s 重试 2 次后抛、其余 status 直接抛)。`runAutoLoginEntry` 用**双 try 区分阶段**:① `startTgLogin` 单独 try —— `BusinessError` → 该号 `return failed + continue`,非 `BusinessError`(节点不可达/网络)→ `throw new AutoLoginFatalError` 中断整批;② `start` 成功后 `waitAutoLoginCode` / `submitTgLoginCode` / `submitTgLogin2fa` 包在内层 try,任何错误 → 该号 `return failed + continue`(节点已验证可达)。`handleAutoLogin` catch 识别 `AutoLoginFatalError` 中断整批并推一条 failed 结果,其余 for 循环 continue。
- `curl_cffi` 指纹伪装**过不了 JS Challenge / Turnstile**;若长期频繁 `cf_blocked`,说明平台升级了 challenge 等级,届时再评估是否上 headless 浏览器(单独决策,不在本期)。

## 日志

拉取层在以下事件落日志(`logger` 复用 `app.utils.logger`):

| 事件 | 级别 | 字段 |
| --- | --- | --- |
| URL 平台未命中(拒绝) | warning | url |
| 真打平台 | info | platform、url、status_code、耗时 |
| HTTP 非 2xx(非 CF) | warning | url、status_code、body 前 200 字 |
| CF challenge 检测命中 | warning | url、status_code、cf-ray、host、命中标志 |
| 解析未识别到 code(`unknown`) | warning | platform、url、body 前 200 字、是否触发内容回判 |
| 超时 / 网络异常 | warning | url、异常类型(`RequestException` 子类名)、消息 |
| next 手机号不一致 | warning | url_phone、input_phone |

所有日志带 url 与平台名,后续「拿不到码」可一键定位是 CF / 速率 / 超时 / 解析失败 / 数据错位。

## 接口规格

`POST /api/admin/tg/code-link/parse` 请求新增**可选** `phone`(next 手机号一致性校验用);端点签名不变,鉴权沿用现状双 router dependencies:

```python
# 现状双装饰器,鉴权依赖各自独立(业务查 DB / 节点本地只验签),函数体不接收 admin
@router.post("/code-link/parse", dependencies=[Depends(get_admin_user)])
@node_local_router.post("/code-link/parse", dependencies=[Depends(get_admin_jwt_only)])
async def parse_tg_code_link(req: AdminTgCodeLinkParseRequest) -> JSONResponse:
    url = _normalize_code_link_url(req.url)          # API 层格式校验(https + 有 host/path)
    return ResponseUtils.ok(await code_link_service.parse(url, req.phone))
```

```jsonc
// 请求(phone 可选)
{ "url": "https://next.tgapi.de/tg/.../...", "phone": "18635927222" }

// 响应(envelope 不变,data.status 枚举新增 cf_blocked)
{ "code": 10000, "data": { "status": "success", "code": "85583", "pass2fa": "666888", "login_time": "..." } }
```

`data.status` 枚举(前端 `CodeLinkParseResult` 同步,新增 `cf_blocked` 一个 case,不改 union 结构):

| status | 含义 | 附加字段 |
| --- | --- | --- |
| `success` | 取到验证码 | `code`、`pass2fa?`、`login_time?` |
| `cooldown` | 平台限速冷却 | `cooldown_seconds`、`message` |
| `no_code` | 暂无验证码 | `message` |
| `cf_blocked` | CF 拦截 | `message` |
| `timeout` | 请求超时 | `message` |
| `network_error` | 非 2xx / 网络异常 | `message` |
| `unknown` | HTML 无 code / 页面异常 | `message` |

**降级一致性**:curl_cffi 全局 disabled 时,端点**不 raise 业务错误码**(否则前端 `nodePost` throw → `AutoLoginFatalError` 中断整批),而是走 `data.status = "network_error"` + 明确 message("curl_cffi 不可用,请联系运维")的 200 返回,前端按「该号失败 + continue」处理。

## 依赖

- **新增** `curl_cffi`(Python ≥3.10,项目已确认 ≥3.11),加入 `backend/pyproject.toml` dependencies,**版本约束 `curl_cffi>=0.7.4,<0.12`**。
  - 下限 0.7.4:`AsyncSession` 自 0.5.9 引入,0.6.1 修关键 bug,0.7.x 稳定;0.7.4 是有明确 wheel 的保守下限。
  - 上限放开到 <0.12:允许 0.8~0.11 主版本。**指纹漂移对 CF 对抗是好事**(新指纹不易被识别为旧版 bot),原"锁主版本防漂移"的理由对 CF 场景是反的;允许新版本带更新的 impersonate 指纹。0.8+ 若 API 变动,PR 阶段跑一次冒烟测试即可。
- **异常类型(规范路径)**:catch `curl_cffi.requests.exceptions.RequestException`(超时是其子类 `exceptions.Timeout`)。**不要用** `curl_cffi.requests.errors.RequestsError` —— 该路径在 0.7.4 源码里是标注 `# for compatibility with 0.5.x` 的 legacy 别名(`from .exceptions import RequestException as RequestsError`),官方文档不收录,后续主版本可能移除。日志字段「异常类型」同步记 `RequestException` 子类名。
- **timeout 显式传 request 调用点**:`AsyncSession(timeout=30)` + `s.get(url, timeout=30)` 双传。社区有反馈(GitHub #641)session 级 timeout 不一定正确传递到单个 request,显式传规避。
- **启动 health check**:进程启动时 import curl_cffi 失败 → `logger.critical` + 拉取层标记 disabled,**端点走 200 + `network_error` 降级**(见「接口规格·降级一致性」),不 raise、不中断自动队列。
- **不回退 httpx**:curl_cffi 是本期 CF 兜底的核心,不提供「curl_cffi 挂了用 httpx」的回退(httpx 无指纹,回退等于放弃 CF 兜底)。
- **生产镜像验证(部署 checklist)**:curl_cffi 依赖 libcurl-impersonate native binary。交付前必须在 hydra-singapore 生产镜像验证 `import curl_cffi` 可成功(若镜像 Alpine/musl 或特殊架构可能无 wheel,部署期失败 health check 兜不住"服务起不来")。
- 不引入 BeautifulSoup(next 用标准库 `html.parser`,无外部依赖)。
- 复用现有:`logger`、飞书告警 utils、`ResponseUtils`、`AppCommonException` / `CommonCode`、`AdminContext` / `get_admin_user`。

## 测试策略

> 落位遵循 `docs/references/specs/spec-test-server.md`:新增后端测试优先 `integration/real/`(按 `backend/src/app` 目录镜像,带 `@pytest.mark.real`),`test_server/` 仅用于无 IO 的纯函数测试。

### 纯函数测试(`backend/tests/test_server/services/test_code_link_service.py`,无 IO,不走 real)

- **jiema 迁移回归(最高优先)**:对现有 `_parse_code_link_html` 准备 ≥5 个真实 HTML 样本(含两段 login_time fallback 形态),新旧实现输出 **bit-for-bit 一致**。这是迁移不回归的硬保障。无外部资源依赖,符合留 `test_server/` 的条件。
- jiema:`no_code`、`network_error`(非 2xx)、`unknown`(HTML 无 code)、host 白名单 accept 路径。
- next:`success`(`#code` 文本提取)、`two-fa`、`code-received-at`、无码态(`#code` 为空)、**最小完整性**(`#code`+锚点都缺 → `unknown` 而非 `no_code`)、**手机号不一致**(`INVALID_REQUEST`)、URL 匹配(`/tg/` 前缀 + 错误 host 拒绝)。
- CF 检测 `_detect_cf_challenge`(`@staticmethod`,直接 `CodeLinkService._detect_cf_challenge(...)` 调用,无需实例状态):403+`just a moment` → 命中;**200+Turnstile widget** → 命中;**200+仅 `challenge-platform`** → 不命中(白名单);**`#code` 缺失 + body<2KB** → 命中(内容回判)。

### real 集成测试(`backend/tests/integration/real/services/test_code_link_service.py`,mock 拉取出口,带 `@pytest.mark.real`)

按 spec §5「real 测试可用替身覆盖外部 HTTP」语义,这些测试只 mock 外部出口 —— 即 `curl_cffi.requests.AsyncSession.get`(monkeypatch 让它返回构造的 body/状态,并统计调用次数),不真打接码站,也**不 mock `CodeLinkService` 自身方法**(§5 禁止 mock 本系统 service;`_detect_cf_challenge` 是纯逻辑,由构造的真实 body 触发判定):

- 注册表:host 唯一性自检(重复 host 启动 fail-fast)。
- 端点状态映射:curl_cffi disabled 标志下,端点返回 200 + `network_error`(不 raise、不 500)。

### 前端 e2e(`admin/e2e/tg-client.spec.ts` 扩展)

- next URL 输入 → 走通(start / code / 2fa payload 正确)。
- `cooldown` → 轮询等待后 success。
- `cf_blocked` → 等 30s 重试;**连续 2 次 → 该号标记 failed + continue 到下一个号(不中断整批)**。**关键:验证批量队列在第 1 号 cf_blocked 超限后仍继续处理第 2 号。**
- curl_cffi disabled(后端返 `network_error`)→ 该号 failed + continue(不中断整批)。
- `parseTgCodeLink` 透传 phone 断言。
- mock 数据里的 jiema URL(写死在 `:1032,1035-1036`)与 placeholder 同步更新为含两种平台样例。

## 分阶段实施

| 阶段 | 内容 | 依赖 | 验收 |
| --- | --- | --- | --- |
| 1 | 拉取层重构:新建 `code_link_service.py`(迁移 6 函数按职责落位、host/path 常量归平台对象、httpx 归零),curl_cffi 接入(`RequestException` + health check + 版本 `>=0.7.4,<0.12` + timeout 双传),CF 检测(`@staticmethod` + 扩充 + 优先级 + 内容回判),日志。 | 无 | jiema 样本 bit-for-bit 一致;后端单测 + real 集成全绿;黑盒请求 jiema URL 返回不变。 |
| 2 | next 平台解析器(html.parser + 完整性校验 + 手机号校验)+ 注册。next 实测无冷却/限速(RESTful 路径每次返回最新),无需冷却态 / 安全间隔实测。 | 阶段 1 | next URL 能解析出 code/2fa;单测覆盖。 |
| 3 | 前端(cf_blocked 重试 + **该号失败 continue 模型**、首次取码等待 5s、no_code 间隔 8s、phone 透传、placeholder)+ e2e(重点验 cf_blocked 超限不中断整批)。 | 阶段 1、2 | e2e 全绿(含"第1号CF超限后第2号仍处理");placeholder 含两种样例。 |

阶段 1、2 可部分并行(next 解析器可在架构就绪后即写,实测校准在阶段 2 起始做)。阶段 3 在后端稳定后。

## 待确认项

| 项 | 影响 | 处置 |
| --- | --- | --- |
| ~~项目 Python 版本是否 ≥ 3.10~~ | curl_cffi 前提 | **已确认 ≥3.11**(`pyproject.toml` `requires-python = ">=3.11"`),满足 |
| jiema 同 id 安全请求间隔 | 前端间隔校准 | 实测连发触发冷却的最小间隔,确认 < 前端 8s 间隔 |
| ~~next 冷却态~~ | — | **已实测确认无冷却/限速**(RESTful 路径每次返回最新状态),无冷却正则;无码态判据为 `#code` 缺失,已实现 |
| ~~next 同 id 安全请求间隔~~ | — | **不适用**:next 无冷却/限速,8s 间隔绰绰有余 |
| 飞书告警去重粒度 | 可观测 | 已定为 `<host>:<hour>`,如噪声大再调 |
| curl_cffi 在生产镜像 wheel 可用性 | 部署 | 交付前在 hydra-singapore 镜像验证 `import curl_cffi`(部署 checklist) |

## 实现锚点

| 模块 | 路径 |
| --- | --- |
| 接码拉取 + 解析(新) | `@backend/src/app/services/code_link_service.py` |
| 端点编排(瘦身,端点签名不变) | `@backend/src/app/api/admin/admin_tg_client.py`(`parse_tg_code_link`) |
| 请求 schema | `@backend/src/app/schemas/admin_tg_client_schema.py`(`AdminTgCodeLinkParseRequest`,可选 `phone`) |
| admin 上下文 | `@backend/src/app/api/admin_dependencies.py`(`AdminContext` / `get_admin_user`) |
| 前端轮询 | `@admin/src/views/TgClientView.vue`(`waitAutoLoginCode` 重构错误模型、`AUTO_LOGIN_INITIAL_CODE_WAIT_SECONDS=5`、`AUTO_LOGIN_NO_CODE_WAIT_SECONDS=8`、`parseAutoLoginEntries`) |
| 前端 API | `@admin/src/api/tg-client.ts`(`CodeLinkParseResult` 加 cf_blocked case、`parseTgCodeLink` 加 phone 透传) |
| i18n | `@admin/src/i18n/zh-CN.json`、`en-US.json`(`tgClient.autoMode*`) |
| 后端纯函数测试 | `@backend/tests/test_server/services/test_code_link_service.py` |
| 后端 real 集成测试 | `@backend/tests/integration/real/services/test_code_link_service.py` |
| 前端 e2e | `@admin/e2e/tg-client.spec.ts` |
