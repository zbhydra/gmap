# 下载系统

## 概述

下载系统是扩展的核心功能模块，负责从 Telegram Web 下载媒体资源（图片、视频）到本地。系统采用分层架构设计，包含调度层、执行层和进度管理层，支持多种下载策略以适应不同的资源类型。

---

## 1. 系统架构

### 1.1 分层设计

下载系统分为四层：

| 层级 | 职责 | 核心组件 |
|------|------|----------|
| **调度层** | 接收下载请求、管理队列、分发任务 | DownloadScheduler |
| **执行层** | 执行实际下载操作 | BlobDownloader / SegmentDownloader |
| **进度层** | 管理下载进度事件 | ProgressManager |
| **状态层** | UI 状态管理与进度轮询 | ResourceStore (Pinia) |

### 1.2 数据流向

```
用户操作 (Popup / Content Script)
    ↓
ResourceStore.downloadBatch()
    ↓
Chrome 消息传递
    ↓
Content Script MessageHandler
    ↓
DownloadScheduler.downloadBatch()
    ↓
下载队列 (DownloadQueue)
    ↓
Injected RPC 调用
    ↓
DownloadServices.handleBatchDownload()
    ↓
下载器选择 (Blob / Segment)
    ↓
ProgressManager 派发进度事件
    ↓
CustomEvent 返回 Content Script
    ↓
ResourceStore 轮询进度 (每 2 秒)
    ↓
UI 更新显示
```

---

## 2. 下载调度器

### 2.1 核心功能

下载调度器 (@code/DownloadScheduler.ts) 负责管理所有下载任务的生命周期：

- **任务创建**：为每个下载请求创建任务记录
- **队列管理**：使用下载队列控制并发数量
- **进度监听**：注册进度事件监听器
- **状态管理**：跟踪任务状态（等待中、下载中、已完成、失败）

### 2.2 下载队列

队列配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `maxConcurrent` | 1 | 最大并发下载数 |
| `interval` | 500ms | 下载间隔（毫秒） |

队列特性：

- **排队状态通知**：每个任务进入队列时触发排队事件，显示排队位置
- **任务开始通知**：任务从等待转为执行时触发事件（排队位置变为 0）
- **顺序执行**：按照先进先出原则执行任务

### 2.3 任务状态

| 状态 | 说明 |
|------|------|
| `Pending` | 等待执行 |
| `Downloading` | 正在下载 |
| `Completed` | 已完成 |
| `Failed` | 下载失败 |
| `Cancelled` | 已取消 |

### 2.4 事件机制

调度器通过 CustomEvent 与 UI 层通信：

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `download_progress_{taskId}` | 进度更新 | MediaProgressDetail |
| `download_queuing_{taskId}` | 排队状态变化 | `{ position: number }` |

---

## 3. 下载器实现

### 3.1 下载器选择策略

系统根据 URL 类型自动选择下载器：

| URL 类型 | 下载器 | 原因 |
|----------|--------|------|
| `blob:` 开头 | BlobDownloader | Blob URL 需要使用 Range 请求分块下载 |
| HTTP/HTTPS URL | SegmentDownloader | 支持分段并发下载和重试机制 |

### 3.2 Blob 下载器

**特点**：递归 Range 请求，连续性验证

**工作原理**：

1. 发起带 `Range: bytes={offset}-` 的请求
2. 验证 `Content-Range` 响应头的连续性（gap 检测）
3. 递归下载直到获取完整文件
4. 合并所有数据块为最终 Blob
5. 触发浏览器下载

**安全特性**：

- 验证数据块连续性，防止文件损坏
- 验证文件大小一致性
- 下载完成后自动释放内存

**适用场景**：Blob URL（Telegram Web 生成的临时 URL）

### 3.3 Segment 下载器

**特点**：批量并发下载，支持重试机制

**工作原理**：将文件分成多个段，并发下载后合并，支持失败重试

**适用场景**：HTTP/HTTPS URL

---

## 4. 进度管理

### 4.1 ProgressManager

进度管理器 (@code/ProgressManager.ts) 负责分发进度事件：

- **进度计算**：根据已下载字节数计算百分比
- **事件分发**：通过 CustomEvent 向 UI 层推送进度
- **完成通知**：下载完成时发送 100% 进度

### 4.2 进度轮询模式

ResourceStore 采用**请求 + 推送混合**模式：

| 模式 | 触发方式 | 用途 |
|------|----------|------|
| **主动请求** | 每 2 秒轮询一次 | 定期同步进度 |
| **被动推送** | Content Script 主动推送 | 资源更新通知 |

轮询配置：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `PROGRESS_POLL_INTERVAL` | 2000ms | 进度轮询间隔 |
| `DOWNLOAD_STATE_DELAY` | 1000ms | 下载完成状态保持时间 |

### 4.3 进度数据格式

进度详情包含：

- `progress`：进度百分比（0-100）
- `currentIndex`：当前下载索引（批量下载）
- `totalCount`：总数量（批量下载）
- `mediaId`：媒体资源 ID

---

## 5. 下载协议

### 5.1 消息类型

| 消息类型 | 协议类 | 说明 |
|----------|--------|------|
| `DOWNLOAD_BATCH` | ReqDownloadBatch | 批量下载请求 |
| `DOWNLOAD_MESSAGE` | ReqDownloadMessageMedia | 消息媒体下载请求 |

### 5.2 请求数据结构

下载请求数据 (@code/download.ts)：

- `url`：媒体 URL
- `id`：消息 ID / 资源 ID
- `filename`：文件名（可选）

### 5.3 RPC 方法

通过 InjectedRpcClient 调用的方法：

| 方法名 | 参数 | 返回值 |
|--------|------|--------|
| `DOWNLOAD_MEDIA` | `{ source: IMediaSource }` | Promise<void> |
| `DOWNLOAD_MEDIA_BATCH` | `{ sources: IMediaSource[] }` | Promise<void> |

---

## 6. UI 状态管理

### 6.1 ResourceStore

ResourceStore (@code/resourceStore.ts) 使用 Pinia 管理下载状态：

**状态字段**：

- `resources`：资源列表
- `downloadingIds`：下载中的资源 ID 映射
- `progress`：进度映射 (resourceId -> progress)
- `selectedIds`：选中的资源 ID 映射

**核心方法**：

- `downloadResource()`：下载单个资源
- `downloadBatch()`：批量下载
- `downloadAll()`：下载所有资源
- `downloadSelected()`：下载选中的资源
- `startProgressPolling()`：启动进度轮询
- `stopProgressPolling()`：停止进度轮询

### 6.2 下载状态显示

资源状态显示规则：

| 状态 | UI 表现 | 持续时间 |
|------|---------|----------|
| 等待中 | 显示排队位置 "排队中: 第 N 位" | 直到开始执行 |
| 下载中 | 显示进度条 "下载中: 45%" | 实时更新 |
| 已完成 | 显示 "已完成" | 1 秒后恢复原状 |

---

## 7. 错误处理

### 7.1 下载错误场景

| 场景 | 处理方式 |
|------|----------|
| Blob URL 不可访问 | 使用 BlobDownloader 重试 3 次 |
| HTTP 请求失败 | 记录错误，跳过当前资源 |
| 用户取消下载 | 清理下载状态，释放资源 |

### 7.2 队列错误处理

- 单个任务失败不影响后续任务
- 失败任务记录错误信息
- 支持手动重试失败任务

---

## 8. 配额集成

下载开始前会检查用户配额：

1. 调用 `quotaApi.check()` 检查剩余配额
2. 配额不足时显示升级弹窗
3. 配额充足时继续下载
4. 下载成功后扣减配额计数

配额相关错误处理采用 fail-open 策略：配额服务异常时允许继续下载，避免因网络问题阻断正常使用。

---

## 9. 性能优化

### 9.1 内存管理

| 优化项 | 实现方式 |
|--------|----------|
| 及时释放 | Blob 下载完成后 1 秒释放 Blob URL |
| 数据块清理 | 下载完成后清空 chunks 数组 |
| 队列限制 | 限制并发数为 1，避免大量并发占用内存 |

### 9.2 并发控制

- 下载队列限制最大并发数为 1
- 任务间隔 500ms，避免过快请求
- 批量下载顺序执行，防止资源竞争

### 9.3 进度轮询优化

- 无下载任务时自动停止轮询
- 有新任务时自动启动轮询
- 2 秒轮询间隔平衡实时性和性能

---

## 10. 相关文档

### 10.1 功能文档

- @feat.004.telegram资源扫描.md - 资源扫描系统
- @feat.003.订阅系统.md - 配额与订阅系统
- @plan.007.侧边栏媒体下载.md - 侧边栏下载功能

### 10.2 设计文档

- @ui-design/UI.000.设计风格.md - 整体设计风格
- @ui-design/UI.002.injectedUI.md - 注入 UI 规范

### 10.3 代码参考

- @code/DownloadScheduler.ts - 下载调度器
- @code/BlobDownloader.ts - Blob 下载器
- @code/SegmentDownloader.ts - 分段下载器
- @code/ProgressManager.ts - 进度管理器
- @code/DownloadServices.ts - 下载服务
- @code/resourceStore.ts - Resource Store (Pinia)
- @code/download.ts - 下载协议定义

**注意**：`ServiceWorkerDownloader.ts` 文件虽存在，但已废弃不再使用。
