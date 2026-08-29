# Server Real 测试覆盖

## Media V2 解析

| Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/client/media/parse-v2` Instagram | `test_instagram_media_api_real.py::test_real_instagram_parse_returns_direct_source_without_download_url` 覆盖视频；`test_real_instagram_image_parse_returns_direct_sources_without_download_url` 覆盖单图；`test_real_instagram_album_parse_returns_multiple_direct_sources_without_download_url` 覆盖相册；`test_real_instagram_story_parse_returns_direct_sources_without_download_url` 覆盖公开 Story（外部匿名接口可用时） | 匿名解析，无登录要求；Story 取决于 Instagram 是否给匿名 SSR/Relay 返回媒体 | FastAPI/Pydantic 422 集中覆盖 | FastAPI/Pydantic 422 集中覆盖 | `MediaParseV2Request.link` schema 覆盖 | 超长链接由 schema 覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 解析缓存由服务单测覆盖，real 验证响应不暴露直链 |
| `POST /api/client/media/parse-v2` Threads | `test_threads_media_api_real.py::test_real_threads_parse_and_threads_net_canonical` 通过 `RUN_REAL_THREADS_TESTS=1` 覆盖真实 post 与 threads.net canonical；本地代码验证覆盖 6 图相册与 video/video/image/video 混合相册 | 匿名解析，无登录要求 | FastAPI/Pydantic 422 集中覆盖 | FastAPI/Pydantic 422 集中覆盖 | `MediaParseV2Request.link` schema 覆盖 | 超长链接由 schema 覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 作为普通 link 进入平台识别，平台拒绝路径由单测覆盖 | 解析响应不暴露直链，浏览器运行时失败映射由 service 单测覆盖 |

## 收集门禁

新增 real 测试文件：

- `backend/tests/integration/real/api/system/test_health_api_real.py`
- `backend/tests/integration/real/api/client/test_instagram_media_api_real.py`
- `backend/tests/integration/real/api/client/test_threads_media_api_real.py`

验收命令：

```bash
cd backend && uv run pytest --collect-only tests/integration/real -q
cd backend && uv run pytest --collect-only tests/integration/real -q -m real
cd backend && uv run pytest tests/integration/real/api/system/test_health_api_real.py -rs
```
