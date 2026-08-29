# 002 · 后端媒体 Provider 架构

> 技术实现文档。覆盖:后端 parse/download 平台适配层、Provider 契约、请求/响应结果、错误模型、Provider 下载治理策略、Range 与带宽限速边界。
>
> 关联:
> - 本域产品:`@feat.md`
> - V2 链路与授权:`@tech-链路与授权.md`
> - 下载方法与续传:`@tech-下载方法与续传.md`
> - 速率治理:`@tech-速率治理.md`
> - 站点适配矩阵:`@tech-站点适配.md`
> - 执行计划:`@plans/004.backend-media-provider-boundary-cleanup.md`

## 1. 目标

把后端下载执行从单个大 service 拆成“统一编排 + 平台 Provider”：

- 每个平台一个 Provider 文件。
- `parse` 固定返回统一 parse result。
- `download` 固定返回 stream result 或 JSON result。
- 用户并发、输出限速、Range 头透传与错误映射、资源释放由统一编排层处理；是否启用并发/限速由 Provider policy 决定，Range 是否支持和上游响应处理由 Provider 决定。
- 具体平台只实现本平台如何解析、如何打开资源、如何释放本次下载上下文。

旧 `MediaNodeExecutionService` 曾同时承担 parse-v2、download-v2、Telegram proxy、TikTok proxy、direct、client_mux、Range/header、错误映射、4GiB 保护、限速与平台动态导入。接入几十个平台时，这种结构会继续膨胀。本架构把“平台差异”与“下载通用治理”分开，并删除旧执行 service，避免保留双轨入口。

## 2. 非目标

- 不改 V2 外部接口路径和请求方式。
- 不改 `download_mode` 语义；仍然只有当前已注册的 `proxy` / `direct` / `client_mux` 生效。
- 不引入依赖注入；新增服务使用模块级单例。
- 不引入 Redis 计数做活跃下载并发限制。
- 不把 FastAPI `StreamingResponse` 下沉到 Provider。
- 不做 `provider.release()` 这种单例级释放入口。

## 3. 文件结构

```text
backend/src/app/provider/media/
  __init__.py
  base_media.py
  telegram_media.py
  tiktok_media.py
  vimeo_media.py
  x_media.py
  instagram_media.py
  threads_media.py
  reddit_media.py
  douyin_media.py
  meta_media_url.py
  meta_ssr_extractor.py

backend/src/app/provider/
  telegram_manager.py
  browser_runtime.py
  media_cookie_pool.py

backend/src/app/contracts/
  media_platform.py
  media_download.py

backend/src/app/constants/
  media_download.py

backend/src/app/services/
  media_provider_service.py
  media_active_download_service.py
  media_download_token_service.py
  media_resource_token_service.py
  media_pre_authorization_service.py
  media_pre_authorization_store.py
  media_service.py
  tg_login_service.py
  proxy_bandwidth_limit_service.py
```

职责：

| 文件 | 职责 |
| --- | --- |
| `contracts/media_platform.py` | 平台常量与 URL 平台识别 |
| `contracts/media_download.py` | download token claims 与 download mode 类型 |
| `constants/media_download.py` | 4GiB 等全局下载阈值 |
| `provider/media/base_media.py` | Provider 契约、请求对象、结果对象、错误类型、下载治理策略、Range 错误类型 |
| `provider/media/{platform}_media.py` | 单个平台的 `_parse()` / `_download()` 实现和模块级单例 |
| `provider/media/meta_media_url.py` / `meta_ssr_extractor.py` | Instagram / Threads 共用的 Meta 媒体 URL 与 SSR 提取能力 |
| `provider/telegram_manager.py` | TG 账号池、session、lease、client 删除、心跳，以及进程级 manager startup/shutdown/session count |
| `provider/media/telegram_media.py` | TG parse/download、下载上下文、文件流读取、Range、client 不可用分类、换号重试和 alarm 调度 |
| `provider/media/tiktok_media.py` | TikTok parse/download、上游 HTTP 响应打开与本次请求释放 |
| `provider/browser_runtime.py` | X / Reddit / Douyin 等平台共用的 browser runtime |
| `provider/media_cookie_pool.py` | X / Instagram 独立 Cookie 池文件读写、格式解析、失败脱敏与临时 cookiefile,供对应 Provider 与 admin/internal 使用 |
| `services/media_provider_service.py` | V2 parse/download 编排、Provider 查找、extra 透传、用户并发、限速包装、统一 release、错误映射 |
| `services/media_active_download_service.py` | 进程内用户活跃下载计数，当前上限 3 |
| `services/media_download_token_service.py` / `media_resource_token_service.py` | token 签发与验签 |
| `services/media_pre_authorization_service.py` / `media_pre_authorization_store.py` | download-pre-v2 授权前置与存储 |
| `services/media_service.py` | pre-v2 扣费、去重与计费规则 |
| `services/tg_login_service.py` | admin TG 登录流程模块级单例；只允许单向依赖 `telegram_manager` 获取 manager |
| `services/proxy_bandwidth_limit_service.py` | 现有后端 proxy 输出带宽限速，继续复用 |

不新增 `direct_media.py`、`proxy_media.py`、`client_mux_media.py`。平台是 Provider 维度，mode 是下载结果维度。

`provider/media` 内部不得 import `app.services`。本域 provider 基础设施模块：`provider/telegram_manager.py`、`provider/browser_runtime.py`、`provider/media_cookie_pool.py` 也不得 import `app.services`。公共 service 可以依赖 Provider registry、provider 基础设施或中性契约层做编排。

TG 登录边界固定为单向依赖：`tg_login_service -> telegram_manager`。禁止 `TelegramMedia -> tg_login_service`，也禁止 `telegram_manager -> tg_login_service`。

## 4. Provider 契约

### 4.1 BaseMedia

```python
from typing import ClassVar


class BaseMedia:
    platform: ClassVar[str]
    policy: ClassVar[ProviderPolicy]

    async def parse(self, request: MediaParseRequest) -> MediaParseResult:
        ...

    async def download(self, request: MediaDownloadRequest) -> MediaDownloadResult:
        ...

    async def _parse(self, request: MediaParseRequest) -> MediaParseResult:
        ...

    async def _download(self, request: MediaDownloadRequest) -> MediaDownloadResult:
        ...
```

规则：

- `platform` / `policy` 是子类必须声明的类属性。
- `parse()` / `download()` 是统一入口，可做公共校验、日志上下文和错误归一。
- 具体平台只实现 `_parse()` / `_download()`。
- Provider 不返回 FastAPI response。
- Provider 不处理用户并发计数。
- Provider 不知道 active guard、bucket 或 BackgroundTask 的实现。
- Provider 不记录完整 token；需要日志关联时用 claims 里的 `jti`，API 层可记录 token hash。
- Provider 单例必须无状态；本次下载状态只能放在本次 `StreamDownloadResult`、stream iterator 或 `aclose` 闭包里。
- 有状态基础设施不下沉进 Provider 单例：TG 账号池生命周期、browser runtime、X cookie pool 都放在 `app/provider/` 下的独立基础设施模块；TG 登录流程保留在 `tg_login_service.py`，按单向依赖规则获取 manager。TG 媒体请求级上下文属于 `TelegramMedia` 本次下载状态，不单独保留 runtime 门面。TikTok 上游 HTTP client 是本次下载资源，随 `StreamDownloadResult.aclose` 释放，不单独保留 runtime 门面。

### 4.2 ProviderPolicy

```python
@dataclass(frozen=True)
class ProviderPolicy:
    active_limited: bool = True
    bandwidth_limited: bool = True
```

含义：

| 字段 | 说明 |
| --- | --- |
| `active_limited` | 本 Provider 的下载是否进入用户活跃下载计数 |
| `bandwidth_limited` | 本 Provider 返回 `StreamDownloadResult` 时是否进入后端输出带宽限速 bucket |

用户活跃下载上限不是 Provider 自己实现，是公共治理策略，当前固定为 2；Provider 只声明本平台是否启用这条公共治理。

`active_limited=False` 表示不进入用户活跃下载计数。`bandwidth_limited=False` 表示本平台文件流输出不走带宽限速 bucket。两者互不隐含，也都不影响统一 release。默认必须是 `True`；某平台要设为 `False` 时，必须在站点适配文档写明原因。

公共层只读取 `provider.policy` 做治理，不按 `download_mode` 推导：

```text
provider.policy.active_limited
  -> active_download_service.acquire(uid)

provider.policy.bandwidth_limited and result is StreamDownloadResult
  -> 每个输出 chunk 调 proxy_bandwidth_limit_service
```

Range 不做公共能力声明。`media_provider_service` 只把原始 `Range` 头传给 Provider；Provider 按本次资源、上游响应、文件指纹和平台规则决定是否支持：

- 支持时返回 `StreamDownloadResult(status_code=206, content_range=...)`。
- 不支持或上游不能满足时抛 `MediaProviderErrorCode.RANGE_NOT_SATISFIABLE`；如需响应 `Content-Range: bytes */total`,放在 `MediaProviderError.data.content_range`。
- 客户端带非 0 起点 Range 时，Provider 不能静默从头返回 `200`。

示例：

```python
class TelegramMedia(BaseMedia):
    platform = "telegram"
    policy = ProviderPolicy(active_limited=True, bandwidth_limited=True)
```

```python
class SomeDirectMedia(BaseMedia):
    platform = "some_platform"
    policy = ProviderPolicy(active_limited=False, bandwidth_limited=False)
```

```python
class SomeProxyNoThrottleMedia(BaseMedia):
    platform = "some_proxy_platform"
    policy = ProviderPolicy(active_limited=True, bandwidth_limited=False)
```

## 5. 请求对象

文档中的 `JsonValue` 固定为可 JSON 序列化值：

```python
JsonScalar = str | int | float | bool | None
JsonValue = JsonScalar | list["JsonValue"] | dict[str, "JsonValue"]
Extra = dict[str, JsonValue]
```

```python
@dataclass(frozen=True)
class MediaParseRequest:
    url: str
    user_id: int | None
    device_id: str | None
    client_ip: str
```

```python
@dataclass(frozen=True)
class MediaDownloadRequest:
    claims: MediaDownloadTokenClaims
    range_header: str | None
    client_ip: str
    extra: Extra
```

规则：

- 请求对象固定，后续新增上下文也加字段，不继续扩展长参数列表。
- 不在请求对象里放 bucket、active guard、end callback。
- `MediaParseRequest` 携带 best-effort 身份：登录时有 `user_id`，匿名时 `user_id=None`；`device_id` 来自请求头，可能为空；`client_ip` 必填。平台若有解析限流，按 user -> device -> IP 回退。
- `range_header` 保留原始值；Provider 自己决定如何解析、转发或拒绝 Range。
- `extra` 来自该 Provider 的 parse 结果，只透传给同一个 Provider 的 download。
- `claims.download_mode` 是资源对前端的执行形态声明；公共治理不按它分支。最终响应以 `provider.download()` 返回的 result 类型为准，并做 contract 校验。

## 5.1 Provider registry

Provider 注册表使用显式 dict，不做自动扫描、不做装饰器注册：

```python
MEDIA_PROVIDERS: dict[str, BaseMedia] = {
    telegram_media.platform: telegram_media,
    tiktok_media.platform: tiktok_media,
    vimeo_media.platform: vimeo_media,
}


def get_media_provider(platform: str) -> BaseMedia | None:
    ...
```

规则：

- 新平台接入时只在 registry 增加一行。
- registry 不按 `download_mode` 分组。
- URL 平台识别失败抛 `MediaProviderErrorCode.UNSUPPORTED_PLATFORM`，映射为 `MEDIA_PARSE_UNSUPPORTED_PLATFORM`。
- 平台已识别但本节点 registry 缺对应 Provider 时，`get_media_provider()` 返回 `None`，由 `media_provider_service` 在进入 Provider 前抛节点不可用错误，`data.reason = "provider_missing"`；parse 映射为 `MEDIA_PARSE_NODE_UNAVAILABLE`，download 映射为 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE`，前端可切下一个节点。

## 6. 返回对象

### 6.1 Parse

`parse()` 返回带内部 `extra` 的 parse result：

```python
@dataclass(frozen=True)
class MediaParseResult:
    response: MediaParseResponse
```

Provider 不签发 resource token。

内部对象示意：

```python
MediaParseResult(
    response=MediaParseResponse(
        platform="telegram",
        resources=[
            MediaResource(
                source_id="telegram:123456789",
                download_mode="proxy",
                filename="video.mp4",
                extra={"tg_client_ref": "a5c8..."},
            )
        ],
    )
)
```

`response.resources[*].extra` 是后端内部字段，和对应 resource 放在一起，避免再维护旁路映射。公开 JSON 序列化时必须排除 `extra`：

- API 不公开 `extra`，公开响应不得出现 `resources[].extra`。
- 创建 resource token 时，把每个 `resource.extra` 签入该 resource 的 token。
- `download-pre-v2` 只验签并把 `extra` 原样写入 download token。
- `download-v2` 只把 `extra` 原样传给同平台 Provider。
- 除对应 Provider 外，任何公共层都不能读取 extra 做业务分支。
- 日志不能输出完整 extra。
- 字段名固定叫 `extra`；是否加密是 token 编码策略，不通过更换字段名表达。
- extra 只能放短小 JSON 定位材料，例如 `tg_client_ref`、format id、文件指纹、缓存 key；签名 JWT 只保证未被篡改，不提供保密。需要放敏感内容时，改用加密 token 或服务端缓存 key，不能把直链、cookie、secret 写进明文 JWT。
- extra 类型固定为 `Extra = dict[str, JsonValue]`；`JsonValue = str | int | float | bool | None | list[JsonValue] | dict[str, JsonValue]`。
- 签发 resource token 前必须校验 extra 可 JSON 序列化、compact JSON 后不超过 2048 bytes、最大嵌套深度不超过 4；不满足时不签发 token，返回 `MEDIA_PARSE_NODE_UNAVAILABLE` + `data.reason = "invalid_extra"`。
- extra 内的缓存 key 必须是随机不可猜测值，缓存记录必须绑定 `platform`、`canonical_link`、`source_id`、过期时间；含用户敏感材料时还必须绑定 `uid`。不能绑定“当前 token jti”:resource token 与 media download token 的 `jti` 不同,download-v2 看不到 resource token jti。
- 当前 Provider 重构不允许把“下载必需”的节点本地缓存 key 写入 extra。extra 必须能被所有候选下载节点解释：缓存 key 默认指向共享缓存且 TTL 覆盖 token TTL。节点本地材料只能作为可失效 hint,缺失时 Provider 必须降级到普通解析/账号池路径；如果某平台必须依赖节点本地缓存,需单独设计 node-bound 候选过滤,且过滤必须发生在 `download-pre-v2` 扣费前。

公开 parse 字段摘要：

| 字段 | 说明 |
| --- | --- |
| `status` | `ok` 或 `requires_client` |
| `platform` | 平台标识 |
| `original_link` / `canonical_link` | 原始链接与规范化链接 |
| `post` | 帖子级元数据 |
| `resources` | 资源列表；每个资源包含 `source_id`、`platform`、`filename`、`type`、`size`、`capabilities`、`download_mode`、`resource_token` |

### 6.2 Download

```python
MediaDownloadResult = StreamDownloadResult | JsonDownloadResult
```

```python
@dataclass
class StreamDownloadResult:
    stream: AsyncIterator[bytes]
    filename: str
    media_type: str | None
    status_code: int
    total_size: int | None
    content_length: int | None
    content_range: str | None
    accept_ranges: bool
    extra_headers: dict[str, str]
    aclose: Callable[[], Awaitable[None]]
```

```python
@dataclass(frozen=True)
class JsonDownloadResult:
    payload: DownloadJsonPayload
```

```python
DownloadJsonPayload = MediaDirectDownloadIntentResponse | MediaClientMuxDownloadIntentResponse
```

规则：

- `proxy` 必须返回 `StreamDownloadResult`。
- `StreamDownloadResult.aclose` 必填；无需释放平台资源时传 no-op async close。
- `filename` 必填,但只是不可信候选值；API/service 必须先清理 CR/LF、路径分隔符、控制字符和危险引号,再生成 `Content-Disposition: attachment; filename="<safe-ascii-fallback>"; filename*=UTF-8''...`。ASCII fallback 尽量保留安全文件 stem/扩展名,为空时用 `download`。
- `total_size` 是完整资源大小；未知时为 `None`。Range 响应中它不是本段长度。
- `content_length` 是本次响应体长度；未知时为 `None`。
- `content_range` 只在成功的 `206` Range 响应填写；`416` 错误要透传的 `Content-Range` 放在 `MediaProviderError.data.content_range`。
- `accept_ranges` 表示 API 层是否生成 `Accept-Ranges: bytes`。只有当 Provider 确认本次资源确实支持字节 Range 请求时才设为 `True`;API 不按请求头猜测。设为 `True` 后,后续非 0 Range 不能满足时 Provider 必须抛 `MediaProviderErrorCode.RANGE_NOT_SATISFIABLE`,由 service 映射为 `MEDIA_RANGE_NOT_SATISFIABLE`。
- Provider 不负责生成 `Content-Disposition`、`Content-Length`、`Content-Range`、`Accept-Ranges`、`Cache-Control` 这些关键响应头；service/API 必须从结构化字段生成。
- `extra_headers` 只允许放安全的可选上游头,当前白名单为 `ETag`、`Last-Modified`。禁止 `Set-Cookie`、`Location`、`Content-*`、`Transfer-Encoding`、`Connection`、`Authorization`、`Proxy-*`、`X-Accel-*`。
- `direct` 必须返回 `JsonDownloadResult(MediaDirectDownloadIntentResponse)`。
- `client_mux` 必须返回 `JsonDownloadResult(MediaClientMuxDownloadIntentResponse)`。
- 新增 mode 时先新增明确 schema，再允许 Provider 返回对应 payload。
- 不允许 Provider 随意返回裸 `dict`。
- `media_provider_service` 必须校验 `claims.download_mode` 与 result 类型、JSON payload schema 匹配：`direct` 对应 `MediaDirectDownloadIntentResponse`,`client_mux` 对应 `MediaClientMuxDownloadIntentResponse`;不匹配时按节点不可用处理。
- 字段名沿用 FastAPI `StreamingResponse(media_type=...)` 口径，因此 stream result 使用 `media_type`；JSON result schema 继续使用公开 API 字段 `mime_type`。

## 7. 错误模型

Provider 只抛统一错误，service 统一映射到 `CommonCode`。

```python
class MediaProviderErrorCode(StrEnum):
    INVALID_LINK = "invalid_link"
    UNSUPPORTED_PLATFORM = "unsupported_platform"
    UNSUPPORTED_DOWNLOAD_MODE = "unsupported_download_mode"
    REQUIRES_CLIENT = "requires_client"
    RESOURCE_NOT_FOUND = "resource_not_found"
    RESOURCE_UNREACHABLE = "resource_unreachable"
    NODE_UNAVAILABLE = "node_unavailable"
    RANGE_NOT_SATISFIABLE = "range_not_satisfiable"
    FILE_TOO_LARGE = "file_too_large"
    UPSTREAM_FAILED = "upstream_failed"
```

```python
class MediaProviderError(Exception):
    code: MediaProviderErrorCode
    message: str
    data: dict[str, object]
```

错误边界：

- 平台库、httpx、yt-dlp、TG client 的原始异常不直接穿透到 API。
- 未知异常由 `media_provider_service` 记录结构化日志后映射为节点不可用。
- Range 错误需要携带 `Content-Range` 时，Provider 把值放入 `MediaProviderError.data.content_range`，由 service/API 错误路径透传。
- `UNSUPPORTED_DOWNLOAD_MODE` 不应由正常 Provider download 流程产生；resource token 和 media download token decoder 必须在进入 Provider 前拒绝非法 mode。
- `UPSTREAM_FAILED` 只用于可换节点的上游临时失败,映射 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE`。上游明确无权限、资源失效或文件不存在必须抛 `RESOURCE_UNREACHABLE` 或 `RESOURCE_NOT_FOUND`,不得用 `UPSTREAM_FAILED`。

映射口径：

| Provider code | parse-v2 | download-v2 |
| --- | --- | --- |
| `INVALID_LINK` | `MEDIA_PARSE_INVALID_LINK` | 不适用 |
| `UNSUPPORTED_PLATFORM` | `MEDIA_PARSE_UNSUPPORTED_PLATFORM` | 进入 Provider 前拒绝非法 token |
| `UNSUPPORTED_DOWNLOAD_MODE` | Provider 不应返回 | 进入 Provider 前拒绝非法 token / contract mismatch 映射 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE` |
| `REQUIRES_CLIENT` | `MEDIA_PARSE_REQUIRES_CLIENT` | `MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE` |
| `RESOURCE_NOT_FOUND` | `MEDIA_PARSE_RESOURCE_NOT_FOUND` | `MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE` |
| `RESOURCE_UNREACHABLE` | `MEDIA_PARSE_RESOURCE_NOT_FOUND` | `MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE` |
| `NODE_UNAVAILABLE` | `MEDIA_PARSE_NODE_UNAVAILABLE` | `MEDIA_DOWNLOAD_NODE_UNAVAILABLE` |
| `RANGE_NOT_SATISFIABLE` | 不适用 | `MEDIA_RANGE_NOT_SATISFIABLE` |
| `FILE_TOO_LARGE` | 不适用 | `MEDIA_DOWNLOAD_FILE_TOO_LARGE` |
| `UPSTREAM_FAILED` | `MEDIA_PARSE_NODE_UNAVAILABLE` | `MEDIA_DOWNLOAD_NODE_UNAVAILABLE` |

## 8. 活跃下载并发与释放

### 8.1 活跃下载计数

`media_active_download_service` 使用进程内 dict 计数：

```text
key = user:{uid}
limit = 3
```

规则：

- 只在 `provider.policy.active_limited=True` 时进入计数。
- `download_mode` 不决定是否 acquire；Provider policy 才决定是否启用并发治理。
- 当前 direct / client_mux Provider 默认 `active_limited=False`，因为它们只返回 JSON result，不占用后端持续输出流。
- 计数只在当前进程内生效；进程重启自动清空。
- 超过上限直接返回 `RATE_LIMIT_EXCEEDED_MEDIA`，`data.reason = "active_download_limit_exceeded"`，不排队等待。
- 超限不是节点不可用，不返回 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE`，避免前端切换节点。

`acquire()` 返回本次下载 guard：

```python
guard = media_active_download_service.acquire(user_key="user:123")
guard.release()
```

`release()` 必须幂等。

当前上限 3 是普通应用的保守默认：允许旧连接、新 Range 恢复连接与释放异步窗口短暂重叠，但阻止单用户长期占用过多后端流资源。

### 8.2 release_once

Provider 单例不做 `provider.release()`。每次 `_download()` 打开的资源都绑定到本次 `StreamDownloadResult.aclose`。`media_provider_service` 在调用 Provider 前先准备 `provider_aclose = noop_async_close` 和 `active_guard: ActiveDownloadGuard | None`；拿到 `StreamDownloadResult` 后必须先保存原始 `provider_aclose = result.aclose`，之后对外暴露的 `aclose` 才能替换成 `release_once`。

`media_provider_service` 包装 stream 和 close：

```text
release_once()
  -> try:
       provider_aclose()
     finally:
       if active_guard is not None:
         active_guard.release()
```

触发点：

- stream 正常结束。
- stream 迭代报错。
- 客户端断开导致迭代结束。
- `StreamingResponse` 创建失败。
- `BackgroundTask(release_once)` 兜底执行。

`release_once()` 必须幂等，避免 stream `finally` 和 BackgroundTask 双重释放。
`active_guard` 存在时，`active_guard.release()` 必须放在 `finally` 中执行，不能因为平台 `aclose()` 抛错而泄漏用户计数。

### 8.3 打开失败

```text
active acquire 成功
-> provider.download() 打开资源失败
-> media_provider_service except 中 release_once()
-> 抛出统一错误
```

这样可以覆盖“计数 +1 后未返回 stream”的异常路径。

如果 Provider 在返回 `StreamDownloadResult` 前已经打开了部分平台资源又抛错，Provider 必须在自身异常路径关闭这些部分资源；此时公共层还拿不到真实 `result.aclose`，只能通过预置 no-op `provider_aclose` 释放 active guard。

如果 Provider 打开成功后，service 因真实 size 超过 4GiB 或其他公共校验失败而中止，也必须先执行 `release_once()` 再返回错误。

## 9. 带宽限速

后端输出带宽限速继续复用 `proxy_bandwidth_limit_service`：

```text
if provider.policy.bandwidth_limited and result is StreamDownloadResult:
    每个输出 chunk 调 limit_proxy_stream_bytes(user_key, len(chunk))
```

规则：

- 带宽限速和并发限制是两件事。
- `bandwidth_limited=False` 只表示不控制输出速率，不表示跳过 active guard。
- `active_limited` 只控制是否 acquire；`bandwidth_limited` 只控制是否调用 `proxy_bandwidth_limit_service`。
- `JsonDownloadResult` 不走后端输出带宽限速。

## 10. media_provider_service 流程

### 10.1 parse-v2

```text
media_provider_service.parse_v2(url, user_id, device_id, client_ip)
  -> detect platform / get_provider(platform)
     平台识别失败: MEDIA_PARSE_UNSUPPORTED_PLATFORM
     registry 缺 Provider: MEDIA_PARSE_NODE_UNAVAILABLE(reason=provider_missing)
  -> build MediaParseRequest(url, user_id, device_id, client_ip)
  -> provider.parse(MediaParseRequest)
  -> 返回 MediaParseResult(response)
  -> API/service 把每个 resource.extra 签入对应 resource token
```

### 10.2 download-v2

```text
media_provider_service.download_v2(claims, range_header, client_ip)
  -> get_provider(claims.platform)
     registry 缺 Provider: MEDIA_DOWNLOAD_NODE_UNAVAILABLE(reason=provider_missing)
  -> 如果 token 已知 size > 4GiB:
       直接返回 MEDIA_DOWNLOAD_FILE_TOO_LARGE
  -> active_guard = None
     provider_aclose = noop_async_close
  -> policy = provider.policy
  -> 如果 policy.active_limited:
       active_guard = active_download_service.acquire(uid)
     否则:
       active_guard = None
  -> 如果 policy.bandwidth_limited:
       set_proxy_user_rate_limit(...)
  -> provider.download(MediaDownloadRequest(extra=claims.extra))
  -> 校验 claims.download_mode 和 result 类型:
       proxy 必须是 StreamDownloadResult
       direct/client_mux 必须是 JsonDownloadResult 且 payload schema 匹配
       不匹配时 release_once() 后返回 MEDIA_DOWNLOAD_NODE_UNAVAILABLE
  -> 如果是 StreamDownloadResult:
       用 total_size 做 4GiB / size=0 公共校验;未知大小继续累计输出保护
       包装 stream:
         每个 chunk 按 ProviderPolicy 决定是否限速
         finally release_once()
       包装 aclose=release_once
       返回给 API
  -> 如果是 JsonDownloadResult:
       如果 active_guard is not None:
         release_once()
       直接返回
```

API 层只做：

```text
StreamDownloadResult -> 清理/编码 filename,根据 size/range 字段生成关键响应头 -> StreamingResponse
JsonDownloadResult -> ResponseUtils.ok(payload)
```

## 11. 新平台接入规则

新增平台只允许主要改这些位置：

```text
backend/src/app/provider/media/{platform}_media.py
provider registry
平台对应测试
docs/feat/002.下载功能/tech-站点适配.md
```

不应新增：

- `media_provider_service` 里的大段 `if platform == ...`。
- 共享 `direct_media.py` / `proxy_media.py`。
- Provider 自己维护用户并发计数。
- Provider 自己创建 FastAPI response。

验收口径：

- 新增第 20 个平台时，不需要理解 Telegram/TikTok 的释放细节。
- 新增第 20 个平台且复用已有 `download_mode` 时，不需要改 `download-v2` API。
- 新增第 20 个平台且复用已有 `download_mode` 时，主要实现 `_parse()` / `_download()`、注册 Provider、补平台识别/token/schema/测试/站点文档。
- 新增 `download_mode` 时，必须先补 schema、前端 runner、方法注册和接口文档，不能塞进既有 Provider 主流程。
