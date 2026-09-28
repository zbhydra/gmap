"""应用与独立采集库共享的可观测传输上下文；不持有网络或业务依赖。"""

from contextvars import ContextVar
from dataclasses import dataclass, field


@dataclass
class TrafficCounter:
    attempts: int = 0
    partial_attempts: int = 0
    unmeasured_attempts: int = 0
    request_bytes: int | None = None
    header_bytes: int | None = None
    body_bytes: int | None = None

    def add(
        self,
        request_bytes: int | None = None,
        header_bytes: int | None = None,
        body_bytes: int | None = None,
        *,
        partial: bool = False,
        unmeasured: bool = False,
    ) -> None:
        self.attempts += 1
        self.partial_attempts += int(partial)
        self.unmeasured_attempts += int(unmeasured)
        if request_bytes is not None:
            self.request_bytes = (self.request_bytes or 0) + request_bytes
        if header_bytes is not None:
            self.header_bytes = (self.header_bytes or 0) + header_bytes
        if body_bytes is not None:
            self.body_bytes = (self.body_bytes or 0) + body_bytes


@dataclass
class TrafficScope:
    scope_id: str
    google: TrafficCounter = field(default_factory=TrafficCounter)
    site: TrafficCounter = field(default_factory=TrafficCounter)


current_scope: ContextVar[TrafficScope | None] = ContextVar(
    "traffic_scope", default=None
)
