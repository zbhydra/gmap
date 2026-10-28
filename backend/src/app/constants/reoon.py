"""Reoon Email Verifier 配置键与 HTTP 协议边界。"""

REOON_DATA_KEY = "reoon"
REOON_VERIFY_URL = "https://emailverifier.reoon.com/api/v1/verify"
REOON_BALANCE_URL = "https://emailverifier.reoon.com/api/v1/check-account-balance/"
# power 模式含 SMTP 投递检查，可能接近一分钟；须低于 nginx proxy_read_timeout 60 秒。
REOON_VERIFY_TIMEOUT_SECONDS = 50.0
# 余额查询实测约 4 秒且不扣额度，给足网络抖动余量即可。
REOON_BALANCE_TIMEOUT_SECONDS = 15.0
# 公开验证接口每 IP 每个业务时区自然日的次数上限。
EMAIL_VERIFY_DAILY_LIMIT_PER_IP = 5
