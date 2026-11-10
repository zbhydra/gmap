#!/bin/bash
# shellcheck disable=SC1090,SC2034

# *.conf 使用完整文件合同；旧 .env 入口保留原来的读取方式。
load_deploy_config() {
    FILE_CONFIG_MODE=""
    case "$1" in
        *.conf|*.conf.example) load_file_config "$1" "${2:-deploy}" ;;
        *) source "$1" ;;
    esac
}

load_file_config() {
    local config_file="$1"
    local mode="$2"
    local field
    local missing=()
    local fields=(
        SERVER_HOST SERVER_PORT SERVER_USER SSH_PRIVATE_KEY_PATH GIT_PRIVATE_KEY_PATH
        REPO_URL BRANCH DEPLOY_DIR BACKUP_DIR KEEP_VERSIONS APP_NAME APP_ENV
        LOGGER_LEVEL BACKEND_PORT_PY PUBLIC_API_BASE_URL PUBLIC_WEBSITE_BASE_URL
        DB_HOST DB_PORT DB_USER DB_PASSWD DB_NAME REDIS_HOST REDIS_PORT REDIS_PASSWORD
        JWT_SECRET_KEY GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET SMTP_CONFIG
        FEISHU_ALARM_ENABLED FEISHU_ALARM_WEBHOOK_URL EXPORT_RUN_CONCURRENCY
        DB_POOL_SIZE DB_MAX_OVERFLOW REDIS_POOL_SIZE UV_BIN NGINX_BIN NGINX_PREFIX
        NGINX_CONFIG NGINX_SERVER_NAME NGINX_VHOST_FILE SUPERVISORCTL_BIN SUPERVISOR_CONFIG
        SUPERVISOR_CONF_DIR NGINX_HTTPS_PORT TLS_CERTIFICATE TLS_CERTIFICATE_KEY
    )
    unset SSH_PASSWORD
    for field in "${fields[@]}"; do
        unset "$field"
    done
    source "$config_file" || return
    FILE_CONFIG_MODE="1"
    for field in "${fields[@]}"; do
        if ! declare -p "$field" >/dev/null 2>&1; then
            missing+=("$field")
        fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        echo "ERROR: 配置文件缺少字段，请补充 $config_file: ${missing[*]}" >&2
        return 1
    fi

    local required=(SERVER_HOST SERVER_PORT SERVER_USER
        DEPLOY_DIR APP_NAME BACKEND_PORT_PY SUPERVISORCTL_BIN SUPERVISOR_CONFIG)
    if [ "$mode" != "health" ]; then
        required+=(GIT_PRIVATE_KEY_PATH REPO_URL BRANCH BACKUP_DIR KEEP_VERSIONS
            APP_ENV LOGGER_LEVEL PUBLIC_API_BASE_URL PUBLIC_WEBSITE_BASE_URL
            DB_HOST DB_PORT DB_USER DB_PASSWD DB_NAME REDIS_HOST REDIS_PORT
            JWT_SECRET_KEY GOOGLE_CLIENT_ID SMTP_CONFIG EXPORT_RUN_CONCURRENCY
            DB_POOL_SIZE DB_MAX_OVERFLOW REDIS_POOL_SIZE UV_BIN NGINX_BIN NGINX_PREFIX
            NGINX_CONFIG NGINX_SERVER_NAME NGINX_VHOST_FILE SUPERVISOR_CONF_DIR
            NGINX_HTTPS_PORT TLS_CERTIFICATE TLS_CERTIFICATE_KEY)
    fi
    missing=()
    for field in "${required[@]}"; do
        if [ -z "${!field}" ]; then
            missing+=("$field")
        fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        echo "ERROR: 配置文件存在空必填项，请填写 $config_file: ${missing[*]}" >&2
        return 1
    fi
    local ports=(SERVER_PORT BACKEND_PORT_PY)
    if [ "$mode" != "health" ]; then
        ports+=(NGINX_HTTPS_PORT)
    fi
    for field in "${ports[@]}"; do
        if [[ ! "${!field}" =~ ^[0-9]+$ ]] || [ "${!field}" -lt 1 ] || [ "${!field}" -gt 65535 ]; then
            echo "ERROR: $config_file 的 $field 必须为 1–65535 的整数" >&2
            return 1
        fi
    done
    if [ "$mode" != "health" ]; then
        for field in DB_PORT REDIS_PORT KEEP_VERSIONS EXPORT_RUN_CONCURRENCY DB_POOL_SIZE DB_MAX_OVERFLOW REDIS_POOL_SIZE; do
            if [[ ! "${!field}" =~ ^[0-9]+$ ]]; then
                echo "ERROR: $config_file 的 $field 必须为非负整数" >&2
                return 1
            fi
        done
        case "$FEISHU_ALARM_ENABLED" in
            true|false) ;;
            *) echo "ERROR: $config_file 的 FEISHU_ALARM_ENABLED 只能是 true 或 false" >&2; return 1 ;;
        esac
    fi
    if [ "${DEPLOY_DIR: -1}" != "/" ]; then
        echo "ERROR: $config_file 的 DEPLOY_DIR 必须以 / 结尾" >&2
        return 1
    fi
    if [[ ! "$APP_NAME" =~ ^[A-Za-z0-9_.-]+$ ]]; then
        echo "ERROR: $config_file 的 APP_NAME 只能包含字母、数字、点、下划线和中划线" >&2
        return 1
    fi
    if [ "$mode" != "remote" ]; then
        if [ -n "$SSH_PRIVATE_KEY_PATH" ] && [ ! -f "$SSH_PRIVATE_KEY_PATH" ]; then
            echo "ERROR: $config_file 指定的 SSH_PRIVATE_KEY_PATH 文件不存在" >&2
            return 1
        fi
        if [ "$mode" != "health" ] && [ ! -f "$GIT_PRIVATE_KEY_PATH" ]; then
            echo "ERROR: $config_file 指定的 GIT_PRIVATE_KEY_PATH 文件不存在" >&2
            return 1
        fi
    fi
    PROJECT_GIT_KEY_PATH="$GIT_PRIVATE_KEY_PATH"
}

configure_file_commands() {
    local field
    for field in UV_BIN NGINX_BIN SUPERVISORCTL_BIN; do
        if [ ! -x "${!field}" ]; then
            echo "ERROR: 正式配置指定的工具不可执行: $field" >&2
            return 1
        fi
    done
    for field in NGINX_CONFIG SUPERVISOR_CONFIG TLS_CERTIFICATE TLS_CERTIFICATE_KEY; do
        if [ ! -f "${!field}" ] || [ ! -r "${!field}" ]; then
            echo "ERROR: 正式配置指定的文件不存在或不可读: $field" >&2
            return 1
        fi
    done
    uv() { "$UV_BIN" "$@"; }
    nginx() { "$NGINX_BIN" -p "$NGINX_PREFIX" -c "$NGINX_CONFIG" "$@"; }
    supervisorctl() { "$SUPERVISORCTL_BIN" -c "$SUPERVISOR_CONFIG" "$@"; }
}

render_file_nginx_config() (
    set -o pipefail
    local line
    sed \
        -e "s|{BACKEND_PORT_PY}|$(escape_sed_replacement "$BACKEND_PORT_PY")|g" \
        -e "s|{NGINX_SERVER_NAME}|$(escape_sed_replacement "$NGINX_SERVER_NAME")|g" \
        "$1" | while IFS= read -r line || [ -n "$line" ]; do
        if [ "$line" = "{TLS_CONFIG}" ]; then
            printf '    listen %s ssl;\n    ssl_certificate "%s";\n    ssl_certificate_key "%s";\n' \
                "$NGINX_HTTPS_PORT" "$TLS_CERTIFICATE" "$TLS_CERTIFICATE_KEY"
        else
            printf '%s\n' "$line"
        fi
    done
)

# sed 替换规则也含凭据，使用 600 临时文件，避免进入进程参数。
render_file_config() {
    local field value rules rendered output
    rules=$(mktemp .config-rules.XXXXXX)
    rendered=$(mktemp .config-rendered.XXXXXX)
    output=$(mktemp .config-output.XXXXXX)
    for field in APP_NAME APP_ENV DB_HOST DB_USER DB_PASSWD DB_NAME LOGGER_LEVEL \
        PUBLIC_API_BASE_URL PUBLIC_WEBSITE_BASE_URL JWT_SECRET_KEY GOOGLE_CLIENT_ID \
        GOOGLE_CLIENT_SECRET REDIS_HOST FEISHU_ALARM_WEBHOOK_URL; do
        value=$(printf '%s' "${!field}" | yaml_double_quoted_scalar)
        value=$(escape_sed_replacement "$value")
        printf 's|"{%s}"|%s|g\n' "$field" "$value" >> "$rules"
    done
    for field in BACKEND_PORT_PY DB_PORT EXPORT_RUN_CONCURRENCY DB_POOL_SIZE \
        DB_MAX_OVERFLOW REDIS_PORT REDIS_POOL_SIZE FEISHU_ALARM_ENABLED; do
        printf 's|{%s}|%s|g\n' "$field" "${!field}" >> "$rules"
    done
    value=$(printf '%s' "$REDIS_PASSWORD" | yaml_double_quoted_scalar)
    value=$(escape_sed_replacement "$value")
    printf 's|{REDIS_PASSWORD}|%s|g\n' "$value" >> "$rules"
    if ! sed -f "$rules" config.yaml.example > "$rendered"; then
        rm -f "$rules" "$rendered" "$output"
        return 1
    fi
    while IFS= read -r value || [ -n "$value" ]; do
        if [ "$value" = "{SMTP_CONFIG}" ]; then
            printf '%s\n' "$SMTP_CONFIG"
        else
            printf '%s\n' "$value"
        fi
    done < "$rendered" > "$output"
    mv "$output" config.yaml
    rm -f "$rules" "$rendered"
}
