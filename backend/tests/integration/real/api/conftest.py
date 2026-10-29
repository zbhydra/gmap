"""公开 API / MCP 验证使用独立真实后端，不占用现有服务端口。"""

import asyncio
import socket
import sys
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import delete, text

from app.constants.auth import TokenType
from app.core.config import settings
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.models.export_api_job_model import EXPORT_API_JOB_MODELS, ExportApiJobModel
from app.models.mcp_oauth_client_model import McpOAuthClientModel
from app.models.mcp_oauth_grant_model import McpOAuthGrantModel
from app.models.user_model import UserModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.user_service import user_service
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit
from app.utils.redis_key import build_redis_key


@dataclass
class _CleanupState:
    users: list[tuple[int, str]] = field(default_factory=list)
    clients: list[str] = field(default_factory=list)
    redis_keys: list[str] = field(default_factory=list)


@pytest.fixture
async def real_launch_state(
    real_mysql_ready, real_redis_ready, test_run_id: str
) -> AsyncIterator[_CleanupState]:
    async with get_async_session() as db:
        tables = {row[0] for row in (await db.execute(text("SHOW TABLES"))).all()}
    required = {
        "users",
        "mcp_oauth_clients",
        "mcp_oauth_grants",
        "user_usage_logs",
        *(model.__tablename__ for model in EXPORT_API_JOB_MODELS),
    }
    if not required <= tables:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 缺少 {sorted(required - tables)}")
    state = _CleanupState()
    try:
        for role in ("owner", "other"):
            user = await user_service.create_user_without_password(
                email=f"api-{role}-{test_run_id}-{uuid4().hex[:6]}@example.com",
            )
            state.users.append((user.user_id, ""))
            token, expires_at = JwtUnit.create_access_token(
                JwtData(user_id=user.user_id, email=user.email)
            )
            await user_token_service.store_token(
                token, user.user_id, TokenType.USER_ACCESS, expires_at
            )
            state.users[-1] = (user.user_id, token)
        yield state
    finally:
        user_ids = [user_id for user_id, _ in state.users]
        for user_id in user_ids:
            await user_token_service.revoke_all_user_tokens(user_id)
        if state.redis_keys:
            await (await redis_client.get_client()).delete(*state.redis_keys)
        async with get_async_session() as db:
            await db.execute(
                delete(McpOAuthGrantModel).where(
                    McpOAuthGrantModel.user_id.in_(user_ids)
                )
            )
            await db.execute(
                delete(McpOAuthClientModel).where(
                    McpOAuthClientModel.client_id.in_(state.clients)
                )
            )
            await db.execute(
                delete(UserUsageLogModel).where(UserUsageLogModel.user_id.in_(user_ids))
            )
            for user_id in user_ids:
                model = ExportApiJobModel.model_for_user(user_id)
                await db.execute(delete(model).where(model.user_id == user_id))
            await db.execute(delete(UserModel).where(UserModel.user_id.in_(user_ids)))
            await db.commit()


@pytest.fixture
async def real_launch_client(
    tmp_path: Path, real_launch_state: _CleanupState, test_run_id: str
) -> AsyncIterator[httpx.AsyncClient]:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    base_url = f"http://127.0.0.1:{port}"
    launcher = tmp_path / "launch_backend.py"
    launcher.write_text(
        "import app.core.config as config_module\n"
        "from app.core.config_schema import Settings\n"
        f"config_module.settings = Settings({settings.config_path!r})\n"
        "from app.core.config import settings\n"
        f"settings.app.name = 'launch-api-worker-{test_run_id}'\n"
        f"settings.app.public_api_base_url = '{base_url}'\n"
        "settings.app.public_website_base_url = 'http://localhost:4321'\n"
        "import uvicorn\n"
        f"uvicorn.run('app.main:app', host='127.0.0.1', port={port}, access_log=False)\n"
    )
    suffix = uuid4().bytes
    test_ip = f"198.18.{suffix[0]}.{suffix[1]}"
    real_launch_state.redis_keys.extend(
        build_redis_key(f"rate_limit:mcp_oauth:{action}:{test_ip}")
        for action in ("register", "authorize")
    )
    log_path = tmp_path / "backend.log"
    with log_path.open("w") as log:
        process = await asyncio.create_subprocess_exec(
            sys.executable, str(launcher), stdout=log, stderr=log
        )
        try:
            async with httpx.AsyncClient(
                base_url=base_url,
                headers={"X-Forwarded-For": test_ip},
                timeout=195,
                trust_env=False,
            ) as client:
                for _ in range(100):
                    assert process.returncode is None, f"后端启动失败：{log_path}"
                    try:
                        response = await client.get("/api/system/health")
                        if (
                            response.status_code == 200
                            and response.json()["msg"] == "healthy"
                        ):
                            break
                    except httpx.TransportError:
                        pass
                    await asyncio.sleep(0.2)
                else:
                    pytest.fail(f"后端健康检查超时：{log_path}")
                print(
                    f"launch-api-worker service={base_url} pid={process.pid} log={log_path}"
                )
                yield client
        finally:
            if process.returncode is None:
                process.terminate()
                await asyncio.wait_for(process.wait(), 30)
