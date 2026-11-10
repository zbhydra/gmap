#!/bin/bash
# Admin 静态部署；生产参数读取 deploy/production.conf。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ADMIN_DIR/dist"
LOCAL_NGINX_CONF="$SCRIPT_DIR/mapexporter-admin.conf"
ARCHIVE_NAME="dist.tar.gz"
ARCHIVE_PATH="$SCRIPT_DIR/$ARCHIVE_NAME"
RELEASE_NAME="v$(date +%Y%m%d_%H%M%S)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_step() { echo -e "${BLUE}===>${NC} $*"; }

RENDER_ONLY=0
if [ "${1:-}" = "--render-nginx" ]; then
    RENDER_ONLY=1
    shift
fi
ENV_FILE="${1:-$SCRIPT_DIR/production.conf}"
if [ ! -f "$ENV_FILE" ]; then
    echo "错误: 找不到配置文件: $ENV_FILE，请复制同目录的 .example 后填写"
    exit 1
fi
ENV_FILE="$(cd "$(dirname "$ENV_FILE")" && pwd)/$(basename "$ENV_FILE")"
PRODUCTION=0
if [ "$ENV_FILE" = "$SCRIPT_DIR/production.conf" ]; then
    PRODUCTION=1
    for key in SERVER_HOST SERVER_USER SERVER_PORT SSH_IDENTITY_FILE SERVER_DEPLOY_ROOT DEPLOY_DOMAIN \
        ADMIN_API_BASE_URL REMOTE_NGINX_CONF NGINX_BIN NGINX_MAIN_CONF NGINX_HTTP_PORT NGINX_HTTPS_PORT \
        TLS_CERTIFICATE TLS_CERTIFICATE_KEY INSTALL_NGINX_CONF SKIP_PUBLIC_VERIFY SKIP_API_VERIFY \
        PUBLIC_VERIFY_URL ADMIN_CAPTCHA_URL; do
        unset "$key"
    done
elif [ "$(basename "$ENV_FILE")" != ".env.test" ]; then
    echo "错误: Admin 生产使用 $SCRIPT_DIR/production.conf；测试请传入 .env.test 文件"
    exit 1
fi

# shellcheck source=/dev/null
. "$ENV_FILE"

required_vars=(
    SERVER_HOST
    SERVER_USER
    SERVER_PORT
    SERVER_DEPLOY_ROOT
    DEPLOY_DOMAIN
    ADMIN_API_BASE_URL
    REMOTE_NGINX_CONF
    NGINX_BIN
)

for var_name in "${required_vars[@]}"; do
    if [ -z "${!var_name:-}" ]; then
        echo "错误: 环境配置缺少 $var_name"
        exit 1
    fi
done

if [ "$PRODUCTION" = "1" ]; then
    for key in NGINX_MAIN_CONF NGINX_HTTP_PORT NGINX_HTTPS_PORT INSTALL_NGINX_CONF SKIP_PUBLIC_VERIFY SKIP_API_VERIFY; do
        if [ -z "${!key:-}" ]; then
            echo "错误: $ENV_FILE 缺少 $key，请填写后重新部署"
            exit 1
        fi
    done
    PUBLIC_VERIFY_URL="https://${DEPLOY_DOMAIN}/"
    ADMIN_CAPTCHA_URL="${ADMIN_API_BASE_URL}/api/admin/auth/captcha"
else
    INSTALL_NGINX_CONF="${INSTALL_NGINX_CONF:-1}"
    SKIP_PUBLIC_VERIFY="${SKIP_PUBLIC_VERIFY:-0}"
    SKIP_API_VERIFY="${SKIP_API_VERIFY:-0}"
    PUBLIC_VERIFY_URL="${PUBLIC_VERIFY_URL:-https://${DEPLOY_DOMAIN}/}"
    ADMIN_CAPTCHA_URL="${ADMIN_CAPTCHA_URL:-${ADMIN_API_BASE_URL}/api/admin/auth/captcha}"
    NGINX_MAIN_CONF=""
fi

render_nginx() {
    node --input-type=commonjs - "$ENV_FILE" "$LOCAL_NGINX_CONF" "$PRODUCTION" <<'NODE'
const { readFileSync } = require('node:fs')
const { parseEnv } = require('node:util')
const config = parseEnv(readFileSync(process.argv[2], 'utf8'))
const hasCertificate = Boolean(config.TLS_CERTIFICATE && config.TLS_CERTIFICATE_KEY)
const values = {
    ...config,
    NGINX_HTTP_PORT: config.NGINX_HTTP_PORT || (process.argv[4] === '0' ? '80' : ''),
    TLS_CONFIG: hasCertificate
        ? `    listen ${config.NGINX_HTTPS_PORT} ssl;\n    http2 on;\n    ssl_certificate ${config.TLS_CERTIFICATE};\n    ssl_certificate_key ${config.TLS_CERTIFICATE_KEY};`
        : '    # TLS 待配置：生产发布前填写 TLS_CERTIFICATE 与 TLS_CERTIFICATE_KEY。'
}
process.stdout.write(readFileSync(process.argv[3], 'utf8').replace(/\{([A-Z_]+)\}/g, (_, key) => {
    if (!values[key]) throw new Error(`Admin Nginx 渲染：${process.argv[2]} 缺少 ${key}`)
    return values[key]
}))
NODE
}

if [ "$RENDER_ONLY" = "1" ]; then
    render_nginx
    exit 0
fi
if [ "$PRODUCTION" = "1" ] && { [ -z "${TLS_CERTIFICATE:-}" ] || [ -z "${TLS_CERTIFICATE_KEY:-}" ]; }; then
    echo "错误: $ENV_FILE 缺少生产 TLS 证书路径，请填写 TLS_CERTIFICATE 与 TLS_CERTIFICATE_KEY"
    exit 1
fi

SSH_OPTIONS=(-p "$SERVER_PORT")
SCP_OPTIONS=(-P "$SERVER_PORT")
if [ -n "${SSH_IDENTITY_FILE:-}" ]; then
    SSH_OPTIONS+=(-i "$SSH_IDENTITY_FILE")
    SCP_OPTIONS+=(-i "$SSH_IDENTITY_FILE")
fi

SERVER_CURRENT_LINK="$SERVER_DEPLOY_ROOT/current"
SERVER_RELEASE_DIR="$SERVER_DEPLOY_ROOT/$RELEASE_NAME"
TEMP_ARCHIVE_PATH="/tmp/admin-${RELEASE_NAME}-${ARCHIVE_NAME}"
TEMP_NGINX_CONF_PATH="/tmp/admin-${RELEASE_NAME}-nginx.conf"

cleanup() {
    if [ -f "$ARCHIVE_PATH" ]; then
        log_step "清理本地临时压缩包..."
        rm -f "$ARCHIVE_PATH"
    fi
}
trap cleanup EXIT

log_step "步骤 1/7: 构建 Admin 管理后台..."
if [ "$PRODUCTION" = "1" ]; then
    (cd "$ADMIN_DIR" && pnpm build)
else
    (cd "$ADMIN_DIR" && VITE_API_BASE_URL="$ADMIN_API_BASE_URL" pnpm build --mode test)
fi

if [ ! -d "$DIST_DIR" ]; then
    echo "错误: 找不到 dist 目录: $DIST_DIR"
    exit 1
fi

if [ "$INSTALL_NGINX_CONF" = "1" ] && [ ! -f "$LOCAL_NGINX_CONF" ]; then
    echo "错误: 找不到本地 Nginx 配置: $LOCAL_NGINX_CONF"
    exit 1
fi

echo ""
log_step "开始部署 Admin 管理后台"
log_info "配置文件: $ENV_FILE"
log_info "源目录: $DIST_DIR"
log_info "目标服务器: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}:${SERVER_DEPLOY_ROOT}/"
log_info "本次版本: $SERVER_RELEASE_DIR"
log_info "域名: $DEPLOY_DOMAIN"
echo ""

log_step "步骤 2/7: 确保远程部署根目录存在..."
ssh "${SSH_OPTIONS[@]}" "${SERVER_USER}@${SERVER_HOST}" "mkdir -p '$SERVER_DEPLOY_ROOT'"
log_info "远程部署根目录已就绪"

log_step "步骤 3/7: 创建压缩包..."
COPYFILE_DISABLE=1 tar -czf "$ARCHIVE_PATH" -C "$DIST_DIR" .
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
log_info "压缩包: $ARCHIVE_PATH ($ARCHIVE_SIZE)"

log_step "步骤 4/7: 上传部署产物..."
scp "${SCP_OPTIONS[@]}" "$ARCHIVE_PATH" "${SERVER_USER}@${SERVER_HOST}:${TEMP_ARCHIVE_PATH}"
if [ "$INSTALL_NGINX_CONF" = "1" ]; then
    log_info "渲染 Nginx 配置占位符..."
    RENDERED_NGINX_CONF=$(mktemp)
    render_nginx > "$RENDERED_NGINX_CONF"
    scp "${SCP_OPTIONS[@]}" "$RENDERED_NGINX_CONF" "${SERVER_USER}@${SERVER_HOST}:${TEMP_NGINX_CONF_PATH}"
    rm -f "$RENDERED_NGINX_CONF"
fi
log_info "上传完成"

log_step "步骤 5/7: 服务器端发布新版本..."
ssh "${SSH_OPTIONS[@]}" "${SERVER_USER}@${SERVER_HOST}" << EOF
set -e
RELEASE_DIR="$SERVER_RELEASE_DIR"
CURRENT_LINK="$SERVER_CURRENT_LINK"
TEMP_ARCHIVE="$TEMP_ARCHIVE_PATH"

cleanup_failed_release() {
    rm -f "\$TEMP_ARCHIVE"
    if [ -d "\$RELEASE_DIR" ]; then
        CURRENT_TARGET=""
        if [ -L "\$CURRENT_LINK" ]; then
            CURRENT_TARGET=\$(readlink "\$CURRENT_LINK" || true)
        fi
        if [ "\$CURRENT_TARGET" != "\$RELEASE_DIR" ]; then
            rm -rf "\$RELEASE_DIR"
        fi
    fi
}
trap cleanup_failed_release ERR

if [ -e "\$RELEASE_DIR" ]; then
    echo "错误: 发布目录已存在: \$RELEASE_DIR"
    exit 1
fi
if [ -e "\$CURRENT_LINK" ] && [ ! -L "\$CURRENT_LINK" ]; then
    echo "错误: current 不是软链接: \$CURRENT_LINK"
    exit 1
fi

mkdir -p "\$RELEASE_DIR"
tar --warning=no-unknown-keyword -xzf "\$TEMP_ARCHIVE" -C "\$RELEASE_DIR"
ln -sfn "\$RELEASE_DIR" "\$CURRENT_LINK"
rm -f "\$TEMP_ARCHIVE"
trap - ERR
echo "服务器端发布完成"
EOF

if [ "$INSTALL_NGINX_CONF" = "1" ]; then
    log_step "步骤 6/7: 安装并重载 Nginx 配置..."
    ssh "${SSH_OPTIONS[@]}" "${SERVER_USER}@${SERVER_HOST}" << EOF
set -e
REMOTE_CONF="$REMOTE_NGINX_CONF"
TEMP_CONF="$TEMP_NGINX_CONF_PATH"
NGINX_BIN="$NGINX_BIN"
NGINX_MAIN_CONF="$NGINX_MAIN_CONF"
NGINX_OPTIONS=()
if [ -n "\$NGINX_MAIN_CONF" ]; then
    NGINX_OPTIONS=(-c "\$NGINX_MAIN_CONF")
fi

mkdir -p "\$(dirname "\$REMOTE_CONF")"
mv "\$TEMP_CONF" "\$REMOTE_CONF"

"\$NGINX_BIN" "\${NGINX_OPTIONS[@]}" -t
"\$NGINX_BIN" "\${NGINX_OPTIONS[@]}" -s reload
echo "Nginx 配置已重载"
EOF
else
    log_warn "已跳过 Nginx 配置安装"
fi

log_step "步骤 7/7: 验证部署结果..."
CURRENT_TARGET=$(ssh "${SSH_OPTIONS[@]}" "${SERVER_USER}@${SERVER_HOST}" "readlink '$SERVER_CURRENT_LINK'")
if [ "$CURRENT_TARGET" != "$SERVER_RELEASE_DIR" ]; then
    echo "错误: current 指向异常: $SERVER_CURRENT_LINK -> $CURRENT_TARGET"
    exit 1
fi

FILE_COUNT=$(ssh "${SSH_OPTIONS[@]}" "${SERVER_USER}@${SERVER_HOST}" "find -L '$SERVER_CURRENT_LINK' -type f | wc -l")
log_info "current 已切换: ${SERVER_CURRENT_LINK} -> ${CURRENT_TARGET}"
log_info "部署文件数: $FILE_COUNT"

if [ "$SKIP_PUBLIC_VERIFY" != "1" ]; then
    HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 20 "$PUBLIC_VERIFY_URL")
    if [ "$HTTP_CODE" != "200" ]; then
        echo "错误: 首页验证失败，HTTP $HTTP_CODE: $PUBLIC_VERIFY_URL"
        exit 1
    fi
    log_info "首页验证通过: $PUBLIC_VERIFY_URL"
fi

if [ "$SKIP_API_VERIFY" != "1" ]; then
    CAPTCHA_RESPONSE=$(curl -sS -X POST --connect-timeout 10 --max-time 20 "$ADMIN_CAPTCHA_URL")
    if ! echo "$CAPTCHA_RESPONSE" | grep -q '"code":10000'; then
        echo "错误: captcha API 验证失败: $ADMIN_CAPTCHA_URL"
        echo "$CAPTCHA_RESPONSE"
        exit 1
    fi
    log_info "captcha API 验证通过: $ADMIN_CAPTCHA_URL"
fi

echo ""
log_info "部署成功完成!"
