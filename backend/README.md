# Backend

## Python 临时文件

项目内所有 Python 相关临时产物统一收口到 `backend/.cache/`。

日常运行 Python 命令时，统一通过：

```bash
cd backend
./scripts/with-python-cache.sh <command> [args...]
```

常见示例：

```bash
cd backend
./scripts/with-python-cache.sh ./.venv/bin/pytest
./scripts/with-python-cache.sh ./.venv/bin/mypy src tests
./scripts/with-python-cache.sh ./.venv/bin/ruff check .
```

## Telegram 初次登录（生成 session）

在 `backend/config.yaml` 配置：

```yaml
telegram:
  api_id: 123456
  api_hash: "your_api_hash"
  session_path: "data/"
download:
  proxy_total_rate_limit_mb_per_second: 0
```

`session_path` 只表示 session 根目录。登录脚本会固定按手机号落盘到 `<session_path>/<phone>/auth.session`，例如 `data/8613800138000/auth.session`。

`download.proxy_total_rate_limit_mb_per_second` 表示当前后端进程内所有代理输出流共享的总速率上限，单位 MB/s；`0` 表示不限速。

执行脚本：

```bash
cd backend
./scripts/bootstrap-login.sh --phone +8613800138000
```

也可传验证码：

```bash
cd backend
./scripts/bootstrap-login.sh --phone +8613800138000 --code 12345
```

如账号开启 2FA，脚本会提示输入密码。

## Telegram session 有效性验证

扫描 `telegram.session_path` 下全部 `<phone>/auth.session`：

```bash
cd backend
./.venv/bin/python scripts/tg_verify_sessions.py
```

只验证指定手机号：

```bash
cd backend
./.venv/bin/python scripts/tg_verify_sessions.py --phone +8613800138000
```

脚本会真实连接 Telegram 并检查 session 是否仍处于已授权状态。状态含义：

- `OK`：session 文件存在、可连接、已授权。
- `FAIL`：session 缺失、失效、超时或连接失败。
- `LOCKED`：session 正被另一个服务进程持有，先停止对应 backend 进程再验证。

## 配置校验

修改 `backend/config.yaml` 后，先校验配置：

```bash
cd backend
./.venv/bin/python scripts/check_config.py
```
