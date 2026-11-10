#!/bin/bash
set -e

# 仅使用临时文件和 SSH/SCP 出口替身，不连接服务器或业务资源。
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROBE_DIR=$(mktemp -d)
trap 'rm -rf "$PROBE_DIR"' EXIT
mkdir -p "$PROBE_DIR/bin" "$PROBE_DIR/repo/backend/deploy/nginx" "$PROBE_DIR/repo/backend/deploy/supervisor"
export FILE_CONFIG_PROBE_DIR="$PROBE_DIR"
export PATH="$PROBE_DIR/bin:$PATH"
cat > "$PROBE_DIR/bin/ssh" <<'SH'
#!/bin/bash
printf '%s\n' "$@" >> "$FILE_CONFIG_PROBE_DIR/argv"
case "${!#}" in
    'mktemp '*) printf '/tmp/file-config-probe-key\n' ;;
    *--config-file*) cat > "$FILE_CONFIG_PROBE_DIR/stdin" ;;
    'cat > '*) cat >/dev/null ;;
    *curl*) printf 200 ;;
esac
SH
cp "$PROBE_DIR/bin/ssh" "$PROBE_DIR/bin/scp"
chmod 755 "$PROBE_DIR/bin/ssh" "$PROBE_DIR/bin/scp"
cp "$SCRIPT_DIR/production.conf.example" "$PROBE_DIR/empty.conf"

for entry in init.sh deploy.sh; do
    if DB_HOST=ambient DB_PASSWD=ambient JWT_SECRET_KEY=ambient \
        bash "$SCRIPT_DIR/$entry" "$PROBE_DIR/empty.conf" > "$PROBE_DIR/empty-output" 2>&1; then
        echo "ERROR: 空正式配置意外通过: $entry" >&2
        exit 1
    fi
    test ! -e "$PROBE_DIR/argv"
    grep -q 'DB_HOST.*DB_PASSWD.*JWT_SECRET_KEY' "$PROBE_DIR/empty-output"
done

touch "$PROBE_DIR/git-key" "$PROBE_DIR/nginx.conf" "$PROBE_DIR/supervisord.conf"
cp "$PROBE_DIR/empty.conf" "$PROBE_DIR/filled.conf"
cat >> "$PROBE_DIR/filled.conf" <<CONF
GIT_PRIVATE_KEY_PATH="$PROBE_DIR/git-key"
DEPLOY_DIR="$PROBE_DIR/repo/"
SUPERVISOR_CONF_DIR="$PROBE_DIR/supervisor"
NGINX_VHOST_FILE="$PROBE_DIR/nginx/mapexporter-api.conf"
NGINX_CONFIG="$PROBE_DIR/nginx.conf"
SUPERVISOR_CONFIG="$PROBE_DIR/supervisord.conf"
UV_BIN="/usr/bin/true"
NGINX_BIN="/usr/bin/true"
SUPERVISORCTL_BIN="/usr/bin/true"
CONF
cat >> "$PROBE_DIR/filled.conf" <<'CONF'
DB_HOST="file-db"
DB_PORT="3307"
DB_USER="file_user"
DB_PASSWD='file-secret-"\@/#&|$(never-execute)'
DB_NAME="file_database"
REDIS_HOST="file-redis"
REDIS_PORT="6380"
REDIS_PASSWORD='file-redis-secret-"\@/#&|'
JWT_SECRET_KEY="file-jwt-secret"
GOOGLE_CLIENT_ID="file-google-client"
SMTP_CONFIG='smtp:
  - host: "file-smtp"
    port: 587
    username: "file-user"
    password: "file-smtp-secret"
    from_email: "validation@example.invalid"'
CONF
chmod 600 "$PROBE_DIR/filled.conf" "$PROBE_DIR/git-key"

for entry in init.sh deploy.sh; do
    if TLS_CERTIFICATE=ambient TLS_CERTIFICATE_KEY=ambient \
        bash "$SCRIPT_DIR/$entry" "$PROBE_DIR/filled.conf" > "$PROBE_DIR/tls-output" 2>&1; then
        echo "ERROR: TLS 路径为空的正式配置意外通过: $entry" >&2
        exit 1
    fi
    grep -q '空必填项.*TLS_CERTIFICATE TLS_CERTIFICATE_KEY' "$PROBE_DIR/tls-output"
    test ! -e "$PROBE_DIR/argv"
done
touch "$PROBE_DIR/tls.pem" "$PROBE_DIR/tls.key"
cat >> "$PROBE_DIR/filled.conf" <<CONF
TLS_CERTIFICATE="$PROBE_DIR/tls.pem"
TLS_CERTIFICATE_KEY="$PROBE_DIR/tls.key"
CONF

for entry in init.sh deploy.sh; do
    bash "$SCRIPT_DIR/$entry" "$PROBE_DIR/filled.conf" --check > "$PROBE_DIR/check-output"
    test ! -e "$PROBE_DIR/argv"
done

# 文件漏项时，即使进程环境有值，也必须拒绝。
sed '/^DB_HOST=/d' "$PROBE_DIR/filled.conf" > "$PROBE_DIR/missing.conf"
if DB_HOST=ambient bash "$SCRIPT_DIR/init.sh" "$PROBE_DIR/missing.conf" --check > "$PROBE_DIR/missing-output" 2>&1; then
    echo "ERROR: 缺少 DB_HOST 的配置从环境补值" >&2
    exit 1
fi
grep -q '缺少字段.*DB_HOST' "$PROBE_DIR/missing-output"
test ! -e "$PROBE_DIR/argv"

for entry in init.sh deploy.sh; do
    DB_PASSWD=ambient GOOGLE_CLIENT_SECRET=ambient bash "$SCRIPT_DIR/$entry" "$PROBE_DIR/filled.conf" > "$PROBE_DIR/deploy-output"
    cmp "$PROBE_DIR/filled.conf" "$PROBE_DIR/stdin"
done
if grep -Eq 'file-secret|file-jwt-secret|file-smtp-secret|ambient' "$PROBE_DIR/argv"; then
    echo "ERROR: 凭据进入 SSH/SCP 进程参数" >&2
    exit 1
fi

cp "$SCRIPT_DIR/../config.yaml.example" "$PROBE_DIR/repo/backend/config.yaml.example"
cp "$SCRIPT_DIR/nginx/nginx.conf" "$PROBE_DIR/repo/backend/deploy/nginx/nginx.conf"
cp "$SCRIPT_DIR/supervisor/gmap-server.conf" "$PROBE_DIR/repo/backend/deploy/supervisor/gmap-server.conf"
for remote in deploy_init.sh deploy_remote.sh; do
    # 保留远端真实参数入口与渲染函数，主流程仅执行本地配置渲染。
    sed '$d' "$SCRIPT_DIR/script/$remote" > "$PROBE_DIR/$remote"
    cat >> "$PROBE_DIR/$remote" <<'SH'
cd "${DEPLOY_DIR}backend"
generate_config
configure_supervisor
configure_nginx
test "$(ls -l config.yaml | cut -c 1-10)" = '-rw-------'
grep -Fq 'password: "file-secret-\"\\@/#&|$(never-execute)"' config.yaml
grep -q 'port: 3307' config.yaml
grep -q 'google_client_secret: ""' config.yaml
test -f "$SUPERVISOR_CONF_DIR/$APP_NAME.conf"
grep -q 'server_name api.mapexporter.app' "$NGINX_VHOST_FILE"
grep -q 'listen 443 ssl;' "$NGINX_VHOST_FILE"
grep -Fq "ssl_certificate \"$TLS_CERTIFICATE\";" "$NGINX_VHOST_FILE"
grep -Fq "ssl_certificate_key \"$TLS_CERTIFICATE_KEY\";" "$NGINX_VHOST_FILE"
SH
    cp "$SCRIPT_DIR/script/file_config.sh" "$PROBE_DIR/$remote.config.sh"
    GOOGLE_CLIENT_SECRET=ambient bash "$PROBE_DIR/$remote" --config-file "$PROBE_DIR/git-key" < "$PROBE_DIR/filled.conf" > "$PROBE_DIR/render-output"
done
if command -v nginx >/dev/null 2>&1 && command -v openssl >/dev/null 2>&1; then
    openssl req -x509 -newkey rsa:2048 -sha256 -days 1 -nodes \
        -subj '/CN=api.mapexporter.app' -keyout "$PROBE_DIR/tls.key" \
        -out "$PROBE_DIR/tls.pem" > "$PROBE_DIR/openssl-output" 2>&1
    mkdir -p "$PROBE_DIR/nginx-run/logs"
    cat > "$PROBE_DIR/nginx-test.conf" <<CONF
pid "$PROBE_DIR/nginx-run/nginx.pid";
error_log stderr;
events {}
http {
    access_log off;
    include "$PROBE_DIR/nginx/mapexporter-api.conf";
}
CONF
    nginx -t -p "$PROBE_DIR/nginx-run" -c "$PROBE_DIR/nginx-test.conf" > "$PROBE_DIR/nginx-output" 2>&1
    echo 'API TLS 本地 fixture 的 nginx -t 通过。'
else
    echo 'API TLS 的 nginx -t 未执行：本地缺少 nginx 或 openssl。'
fi
(cd "$PROBE_DIR" && bash "$SCRIPT_DIR/health_check.sh" "$PROBE_DIR/empty.conf" > "$PROBE_DIR/health-output")
grep -q '/usr/local/bin/supervisorctl -c /etc/supervisord.conf status mapexporter-server' "$PROBE_DIR/argv"
echo '正式配置检查通过：空值与漏项阻断、TLS 缺项零 SSH、stdin 传输、配置渲染、600 权限及健康检查入口。'
