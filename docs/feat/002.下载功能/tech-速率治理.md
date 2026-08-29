# 002 · 速率治理

> 覆盖下载带宽限速、website 客户端下载速率上报、TG 客户端上游速率统计。
> 关联:`@tech-链路与授权.md`(输出限速挂在 download-v2) `@tech-下载方法与续传.md`(proxy 方法才受后端限速) `@tech-后端媒体Provider架构.md`(ProviderPolicy 与下载生命周期)

速率治理是下载功能的组成部分,三个维度:执行限速 / 客户端上报 / 上游统计——是不同侧面,非重复。

| 维度 | 来源 | 现状 | 观察对象 | 作用 |
| --- | --- | --- | --- | --- |
| 限速执行 | feat.032 | 已实施 | 后端 proxy 输出流 | 控制服务端输出节奏 |
| 客户端上报 | feat.045 | 已实施 | 浏览器本次下载平均速率 | 埋点观测,落到 admin |
| 上游统计 | feat.049 | 已实施 | 每个 TG client 从 Telegram 读取字节 | 运行态观察,落到 admin |

当前用户 proxy 下载限速值来自全局配置 key `dl_user_rate_mb_s`(对所有用户统一),由 `media_pre_authorization_service._proxy_user_rate_limit_bytes_per_second()` 读取,配置缺失或非法时回退 `512KB/s`。

## 1. 限速执行(原 feat.032)

### 1.1 范围

包含:

- 所有后端代理型文件下载流。
- V2 路径:`POST /api/client/media/download-v2` 中 `download_mode = "proxy"` 的文件流。
- 单个后端进程内代理输出总限速。
- 单个后端进程内按用户限速。
- 单个后端进程内按用户限制活跃下载数量。

不包含:

- `direct` 下载;浏览器直连平台 CDN,后端无法限制真实带宽。
- `client_mux` tracks 下载;浏览器直连 tracks,后端无法限制真实带宽。
- 旧 TG / TikTok proxy 下载路径;这些入口即将删除。
- Website TG 播放入口;该链路已废弃并统一返回 `TG_PLAY_SESSION_UNAVAILABLE`。
- Redis 跨节点精确限速。
- Redis 跨进程/跨节点精确并发计数。

### 1.2 两层限速

**总代理限速**:限制当前后端进程内所有代理输出流的合计输出速率。替代原 TG 专用总限速口径;总限速不再只看 TG 下载。

```yaml
download:
  proxy_total_rate_limit_mb_per_second: 0   # 0 表示不限速
```

**用户代理限速**:限制单个用户所有 proxy 文件下载流的合计输出速率。

- V2 下载在 `download-pre-v2` 阶段读取全局配置 `dl_user_rate_mb_s` 作为用户限速值(对所有用户统一,见 §1.4/§1.5),写入 `media_download` token。
- `download-v2` 开始时用 token 里的限速值更新一次用户桶;同一用户后开始的下载覆盖之前的用户限速。
- 下载节点只读 token,不查 DB、不查订阅、不查档位。

**用户活跃下载并发**:限制单个用户在当前后端进程内同时存在的 active-limited 下载数量。

- 当前上限为 3。
- 只在 `provider.policy.active_limited=True` 时生效。
- `download_mode` 不决定是否进入计数；Provider policy 才决定。
- 当前 direct / client_mux Provider 默认 `active_limited=False`。
- 只用进程内 dict,不使用 Redis;进程重启后计数自然清空。
- 超过上限直接返回 `RATE_LIMIT_EXCEEDED_MEDIA`, `data.reason = "active_download_limit_exceeded"`,不排队等待,前端不切节点。
- 释放由 `media_provider_service` 包装 stream 后统一执行;stream 正常结束、报错、客户端断开和 BackgroundTask 兜底都必须幂等 release;释放阶段先还 active 计数,再做 Provider cleanup,避免清理慢阻塞续传。
- 上限 3 允许旧连接、新 Range 恢复连接与释放异步窗口短暂重叠,同时继续阻止单用户长期占满后端代理流资源。

**平台下载频率限制**:当前只定义 ProviderPolicy 驱动的活跃并发和输出带宽限速,不定义 direct/client_mux 调用频率限制,也不定义按平台的下载次数限制。后续某个平台需要“下载 N 次/分钟”时,必须先在本文件新增公共执行口径,至少写清身份键、挂载层级、错误码和是否影响节点切换;不得把该限制私塞进 Provider。

### 1.3 单位换算

配置值是 `MB/s`。

```text
rate_bytes_per_second = value * 1024 * 1024
```

| 配置值 | 含义 |
| --- | --- |
| `0` | 不限速 |
| `0.5` | 0.5 MB/s |
| `5` | 5 MB/s |
| `20` | 20 MB/s |

### 1.4 ProxyBandwidthLimitService

进程内 token bucket,不引入 Redis 分布式限速、不新增表、不新增依赖注入。

```python
class ProxyBandwidthLimitService:
    """代理输出带宽限速服务。"""

    def set_proxy_user_rate_limit(
        self,
        *,
        user_key: str,
        user_rate_limit_bytes_per_second: int,
    ) -> None:
        ...

    async def limit_proxy_stream_bytes(
        self,
        *,
        user_key: str | None,
        byte_count: int,
    ) -> None:
        ...


proxy_bandwidth_limit_service = ProxyBandwidthLimitService()
```

职责:

- 维护一个进程级总代理 `AsyncTokenBucket`。
- 维护用户 `AsyncTokenBucket` dict。
- proxy 文件下载开始时更新一次用户桶速率,同一用户以后开始的下载覆盖之前的用户速率。
- 下载 chunk 先过总代理桶,再过用户桶;播放 chunk 只过总代理桶(`user_key=None`)。
- 不查 DB、不查 Redis、不读订阅;调用方在下载开始时传入用户限速 bytes/s。
- 用户桶使用进程内 dict,重启清空。

### 1.5 V2 token 固化用户限速

`MediaDownloadTokenClaims` 字段:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uid` | int | 是 | 登录用户 ID |
| `proxy_user_rate_limit_bytes_per_second` | int | 是 | 用户代理下载限速 bytes/s |

签发时(`download-pre-v2`):

- 读取全局配置 `dl_user_rate_mb_s`(对所有用户统一,缺失/非法回退 `512KB/s`),计算 bytes/s。
- `issue_token(..., user_id=current_user.user_id, proxy_user_rate_limit_bytes_per_second=rate)` 写入 token。

验签时(`download-v2`):

- `uid` 必填。
- `proxy_user_rate_limit_bytes_per_second` 必填。
- 文件流开始前调用 `proxy_bandwidth_limit_service.set_proxy_user_rate_limit(...)` 一次。

### 1.6 下载路径接入

V2 Provider 文件流由 `media_provider_service.py` 统一接入：

- 从 claims 读取 `uid` 和 `proxy_user_rate_limit_bytes_per_second`。
- 下载开始时调用 `set_proxy_user_rate_limit(...)` 一次。
- 每个 chunk yield 前调用 `limit_proxy_stream_bytes(user_key=uid, byte_count=...)`。
- 若 Provider 声明 `bandwidth_limited=False`,只跳过本节输出限速 bucket;是否进入活跃下载并发限制由 `active_limited` 决定。统一 release 不受 policy 影响。

### 1.7 异常和边界

| 场景 | 行为 |
| --- | --- |
| 总限速配置为 `0` | 不执行总限速等待 |
| 用户开多个 active-limited 下载 | 同一进程同一用户最多 3 个活跃下载;3 个以内共享同一用户限速桶 |
| 同一用户前后两次下载拿到不同限速 | 后开始的下载覆盖该用户桶限速;已开始的下载继续共享这个用户桶 |
| 两个用户共用同一个 TG client | 用户桶分开,总代理桶共享 |
| Website TG 播放流 | 入口已废弃,不进入限速链路 |
| 全局 `dl_user_rate_mb_s` 配置缺失或非法 | 回退默认 `512KB/s`(见 §1.4) |
| 用户跨多个后端进程或节点下载 | 每个进程各自限速;首版接受 |
| 进程重启 | 活跃下载计数清空;已断开的用户重新发起下载 |
| Range 续传 | 按实际输出字节限速,不重复扣额度 |
| 直接下载 / client_mux | 默认不限速,也不进入活跃下载计数 |
| 配置过低 | 当前下载协程等待更久,不阻塞事件循环 |

### 1.8 配置模型

```python
class DownloadSettings(BaseSettings):
    """下载运行配置。"""

    proxy_total_rate_limit_mb_per_second: float = Field(
        default=0,
        ge=0,
        description="当前进程所有代理输出总带宽上限,单位 MB/s;0 表示不限速",
    )
```

`Settings._apply_config_data()`:

```python
self.download = DownloadSettings(**self._config_data.get("download", {}))
```

原 `telegram.download_rate_limit_mbps` 不再作为代理输出总限速来源。实现时删除 TG 下载对 `_tg_download_rate_limiter` 的调用,统一接入新的总代理桶。

## 2. 客户端速率上报(原 feat.045)

### 2.1 范围

website 的单个客户端下载任务结束时,上报本次下载的平均速率。下载成功和下载失败都要有同一口径的速率字段。

包含:

- 复用现有 `web_download_success` / `web_download_failed` mark-log 和 SLS 双写通道。
- 复用现有失败上报结构:`download_stats.average_bps`。
- 只覆盖单个资源下载任务,包括单个下载按钮、Continue、Restart。
- 补齐成功路径的速率字段,并补齐 Continue / Restart 入口的成功和失败上报。
- Continue / Restart 时,平均速率只计算本次继续下载新增的字节,不把之前已经下载的字节算进去。

不包含:

- 不新增后端 API、数据库表、索引或统计服务。
- 不新增 Pause / Resume 控件。
- 不做刷新、关闭页面后的补报系统。
- 不覆盖 Download all / 批量下载成功汇总。
- 不新增 telemetry id、本地 active telemetry、reported ids。
- 不新增 UI 文案或展示模块。

### 2.2 上报结构

```json
{
  "download_stats": {
    "bytes_done": 23488102,
    "bytes_total": 694471885,
    "average_bps": 445747
  }
}
```

速率口径:

```text
average_bps = floor(本次新增下载字节 / 本次有效下载耗时秒)
```

字段来源:

| 字段 | 来源 |
| --- | --- |
| `bytes_done` | 最后一次进度快照的 `downloadedBytes`;没有快照时用 completion 的 `bytesWritten` |
| `bytes_total` | 最后一次进度快照的 `totalBytes`;没有快照时用资源 size |
| `average_bps` | 最后一次进度快照的 `speedBytesPerSecond`,取整 |

### 2.3 时间口径

- 从开始读取下载响应 body 时算,到下载流结束或失败时停止。
- 不计算 parse、download-pre-v2 授权、排队、重试等待、object URL 保存、浏览器原生保存弹窗时间。
- 下载流中途没有新字节但未失败时,这段等待算进耗时。
- 进度源里 `speedBytesPerSecond` 已按下载 helper 自己的 `startedAt` 计算:
  - `response-download.ts`:从进入 `createObjectUrlCompletionFromResponse()` 后开始算。
  - `download-range-stream.ts`:从进入 `pipeRangeResponseToWriter()` 后开始算。
  - `client-mux.ts`:从开始下载轨道后开始算。
- Continue 的 Range helper 已使用 `sessionBytes = downloadedBytes - startByte`,保留这个口径。
- client_mux 的 mux 阶段 `speedBytesPerSecond=null`,不能覆盖最后一个下载阶段速率。

### 2.4 场景口径

| 场景 | 行为 |
| --- | --- |
| 下载成功 | `web_download_success` 带 `download_stats.average_bps` |
| 下载失败 | 复用现有 `web_download_failed` 的 `download_stats.average_bps` |
| Continue | 只计算本次 Continue 新增字节 |
| Restart | 从 0 重新计算 |
| Download all | 不在本需求范围内 |
| 页面刷新/关闭 | 本阶段不补报;恢复后下一次成功/失败再按本次动作上报 |
| Pause | 当前不新增 Pause;不做暂停态上报 |

### 2.5 成功 mark helper

```ts
export function buildHomepageDownloadSuccessMarkMessage(
  url: string,
  resources: MediaPost | MediaPost[],
  task: DownloadTaskForMark | null
): string
```

规则:

- 字段名使用现有 `average_bps`,不新增 `avg_speed_bps`。
- `mark_msg` 超长时,`download_stats` 保留;复杂错误信息按现有逻辑压缩。
- `mark_msg` 必须保持低于 1000 字符(后端 API 与数据库上限 1024)。
- mark 实现维护在 `website/src/scripts/homepage/mark.ts`。
- mark-log / SLS 上报失败不影响下载。

### 2.6 非功能要求

- 不新增 npm 依赖。
- 不新增依赖注入。
- 不使用 `any` / `unknown`。
- 不保存直链、token、Cookie、Authorization。
- 不新增埋点事件;只补字段到现有 mark 事件。

## 3. 上游速率统计(原 feat.049)

### 3.1 范围

在每个底层 `TelegramLinkClient` 内统计当前 TG session 从 Telegram 上游读取媒体字节的近 5 秒窗口速率,并在管理后台 TG 客户端列表展示。

该能力用于观察每个 TG 账号当前真实拉取吞吐,帮助判断某个 TG client 是否正在被多个下载流占用、是否明显偏慢。统计只服务运行态观察,不参与调度,不限速,不落库。

包含:

- 在 `backend/src/tg_link_client/client.py` 底层封装内维护每个 `TelegramLinkClient` 的运行态速率统计。
- 统计窗口固定为近 5 秒滑动窗口;窗口内只有短时下载时,按窗口内实际覆盖时间计算,避免短下载被固定除以 5 秒后明显低报。
- 同一个 `TelegramLinkClient` 被多个用户、多个下载请求复用时,所有媒体读取字节累加到同一个速率桶。
- 主媒体 `iter_download()` 分块读取计入速率。
- `photo` / `thumbnail` 的一次性 `download_media()` 读取计入速率。
- 管理后台 `GET /api/admin/tg/clients` 每个 client 返回该 TG client 当前上游读取速率。
- 管理后台提供 TG client 速率轻量刷新接口。
- Admin TG 客户端列表新增一列展示该速率。
- Admin 页面停留期间每 5 秒自动刷新 TG client 速率。

不包含:

- 不做限速、调度、历史曲线、峰值统计、告警或报表。
- 不写数据库、Redis、埋点。
- 不统计非媒体读取(解析消息、获取 entity、获取 grouped messages)。
- 不统计 `TelegramLinkClient.download_link()` 本地落盘 helper。
- 不修改 Telethon 源码或 Telethon `TelegramClient` 对象。
- 不新增第三方依赖。

### 3.2 TelegramLinkClient 内联统计

`TelegramLinkClient` 直接持有近 5 秒样本,不新增独立统计器文件或类。

```python
self._download_rate_samples: deque[tuple[float, int]] = deque()
```

新增方法:

| 方法 | 说明 |
| --- | --- |
| `get_download_rate_bytes_per_second() -> int` | 返回近 5 秒窗口上游媒体读取速率 |
| `iter_download_media(...) -> AsyncIterator[bytes]` | 包装 Telethon `iter_download()`,每个 chunk 记录字节后 yield |
| `download_media_bytes(...) -> bytes` | 包装 `download_media(file=bytes)`,返回 bytes 并记录长度 |

内部可加两个私有 helper:`_record_download_bytes(byte_count)`、`_prune_download_rate_samples(now)`。

实现规则:

- 使用 `time.monotonic()`。
- 样本格式为 `(timestamp, byte_count)`。
- `byte_count <= 0` 不记录。
- 每次记录和读取速率时清理 5 秒窗口外样本。
- 速率分母为 `min(5.0, max(1.0, now - oldest_sample_at))`;没有样本返回 `0`。
- 只在 asyncio 事件循环内使用,不加锁。

`iter_download_media()`:

```text
download_iter = mtproto_client.iter_download(...)
async for chunk in download_iter:
    if chunk:
        self._record_download_bytes(len(chunk))
    yield chunk
finally:
    await download_iter.close()
```

`download_media_bytes()`:

- 调用 Telethon `download_media(media, file=bytes, thumb=...)`。
- 返回不是 `bytes | bytearray` 时按现有逻辑让上层映射为下载失败。
- 返回 bytes 后记录 `len(payload)`,只记录一次,避免双计。

`TelegramMedia` / `telegram_manager` 接入:

| 当前位置 | 当前职责边界 |
| --- | --- |
| `TelegramMedia._download()` | 从 token `extra.tg_client_ref` 读取账号亲和 hint,通过 `telegram_manager.ensure_telegram_manager_started()` 获取账号池,解析下载上下文,并把 `_release_download_context()` 绑定到 `StreamDownloadResult.aclose` |
| `TelegramMedia._iter_media_bytes()` | 下载文件流入口；内部在 `_iter_media_bytes_once()` 中用 `client.iter_download_media(...)` 读取主媒体,用 `client.download_media_bytes(...)` 读取 photo/thumbnail |

保留:

- Range 截断逻辑不变。
- `download_iter.close()` 生命周期由底层包装方法负责,上层不再重复 close。
- Provider 输出限速由 `media_provider_service` 在 `StreamDownloadResult` 包装层按 `provider.policy.bandwidth_limited` 执行；TG Provider 只记录上游读取速率。
- 下载阶段换号重试逻辑不变。
- `context.phone` 仍只用于 manager 释放和 admin 展示,不参与统计桶选择;统计桶在 `TelegramLinkClient` 实例内。

### 3.3 接口规格

扩展现有接口:

```text
GET /api/admin/tg/clients
```

每个 client 必返字段:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `download_rate_bytes_per_second` | `int \| null` | 该 TG client 近 5 秒窗口上游媒体读取速率,单位 bytes/s;未加载到运行时的 session 返回 `null` |

返回口径:

- 运行时 client 近 5 秒内有媒体读取:返回窗口速率 bytes/s 整数。
- 运行时 client 近 5 秒内没有媒体读取:返回 `0`。
- 文件系统存在 session 但当前进程未加载 client:返回 `null`。
- 该字段是必返字段;后端漏字段属于实现错误。

新增轻量速率接口(用于自动刷新):

```text
GET /api/admin/tg/client-rates
```

```json
{
  "client_rates": [
    {
      "phone": "8613800138000",
      "active_request_count": 2,
      "download_rate_bytes_per_second": 5242880
    }
  ]
}
```

实现规则:

- `router` 和 `node_local_router` 都挂载。
- 鉴权沿用 `/tg/clients`:中心 admin 入口用 `get_admin_user`,节点本地入口用 `get_admin_jwt_only`。
- 路由调用 `manager.get_client_info_list()`,只映射其中已加载运行时 client 的 `phone`、`active_request_count` 和 `download_rate_bytes_per_second`。
- 无运行时 client 时返回空列表。
- 不扫描文件系统,不返回 `network_rate`,不影响节点网络速率刷新。

### 3.4 Admin UI

`admin/src/api/tg-client.ts` 的 `TgClient` 增加必返字段:

```ts
/** 该 TG client 近 5 秒上游媒体读取速率;未加载运行时返回 null。 */
download_rate_bytes_per_second: number | null;
```

新增类型:

```ts
export interface TgClientRate {
  /** 手机号,也是 session 目录名。 */
  phone: string;
  /** 当前运行时活跃请求数。 */
  active_request_count: number;
  /** 该 TG client 近 5 秒上游媒体读取速率。 */
  download_rate_bytes_per_second: number;
}

export interface TgClientRateListData {
  /** 当前运行时已加载 TG client 的速率列表。 */
  client_rates: TgClientRate[];
}

export function getTgClientRates(target?: NodeRequestTarget) {
  return nodeGet<TgClientRateListData>("tg/client-rates", target);
}
```

`TgClientView.vue` columns 在 `active_request_count` 后增加:

```text
title: tgClient.downloadRate
key: download_rate_bytes_per_second
width: 130
align: right
```

| 值 | 展示 |
| --- | --- |
| `active_request_count <= 0` | `-` |
| `null` | `-` |
| `0` | `0 B/s` |
| `> 0` | 复用 `formatNetworkRate(value)` |

`undefined` 不是合法接口值;测试 mock 必须显式返回该字段,避免后端漏字段被前端静默吞掉。

文案:

| key | zh-CN | en-US |
| --- | --- | --- |
| `tgClient.downloadRate` | `TG读取速率` | `TG Read Rate` |

布局规则:

- 新列放在"活跃请求数"之后。
- 不新增卡片、弹窗、图表。
- 表格列宽固定,避免速率文本挤压操作列。
- 文案必须支持中英文 i18n。

### 3.5 Admin 自动刷新

- 保留节点 header 的网络速率刷新。
- 新增每 5 秒调用 `GET /api/admin/tg/client-rates` 刷新 TG client 速率。
- 自动刷新只处理已展开、可请求的节点 section。
- 自动刷新只按 `phone` 更新已有行的 `active_request_count` 和 `download_rate_bytes_per_second`,不替换 `section.clients`。
- 速率接口没有返回的已有行保持原值;完整同步只由手动刷新负责。
- 自动刷新不修改 `checkedKeys`、`verifyStatus`、`verifyMessage`、`verifying`、`verifyProgress`、`verifiedCount`、`verifyTotal`。
- 自动刷新不写 `section.networkRate`;节点网络速率继续由现有 `node-monitor/network-rate` 刷新回路负责。
- 新增或删除 client 不由自动刷新同步;手动刷新节点或刷新全部时才重拉完整列表。
- 请求失败时 `console.error`,不弹全局错误,不清空表格。
- 页面卸载时清理定时器。

### 3.6 异常条件

| 场景 | 行为 |
| --- | --- |
| client 尚未被运行时发现 | 速率字段返回 `null`,页面显示 `-` |
| client 已运行但近 5 秒无媒体读取 | 速率字段返回 `0`,页面显示 `0 B/s` |
| 下载流中途断开 | 已从 Telegram 读取到的 chunk 计入速率;未读取到的不计入 |
| 浏览器接收失败 | 不影响统计,统计仍按上游已读取字节计算 |
| 全局服务端限速生效 | TG client 上游速率仍按限速前从 Telegram 拿到的 chunk 记录;输出速率不是本指标 |
| Telegram 下载异常 | 异常前已读取字节计入速率,异常后由现有错误处理负责 |
| Admin 自动刷新失败 | 记录 `console.error`,不清空表格、不弹全局错误,不影响后续手动刷新 |
| 批量验证进行中 | 自动刷新只更新速率字段,不替换 `section.clients`,不影响验证进度、勾选项或 SSE 结果回填 |
| 其他页面新增或删除 client | 自动刷新不同步增删;管理员点击现有刷新按钮后同步完整列表 |
| 多个下载流同时使用同一 client | 字节累加到同一个 client 速率 |

### 3.7 风险

- 5 秒窗口速率会平滑短时突发,不代表瞬时峰值。
- 本指标是 Telegram 上游读取速率,不等于用户浏览器最终接收速率(后者见 §3)。
- 如果未来仍有新代码直接绕过 `TelegramLinkClient` 调 Telethon 下载 API,该路径不会被统计;本次要求当前下载链路统一改为底层包装方法。
- 进程重启后统计从 0 重新开始。
