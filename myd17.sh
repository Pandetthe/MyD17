#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
STRAPI_ENV_FILE="${STRAPI_ENV_FILE:-$ROOT_DIR/apps/strapi/.env}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-myd17}"
NGINX_CONF_DIR="$ROOT_DIR/nginx/conf.d"
NGINX_SSL_DIR="$ROOT_DIR/nginx/ssl"

REQUIRED_ENV=(
  APP_KEYS API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET
  ENCRYPTION_KEY DATABASE_NAME DATABASE_USERNAME DATABASE_PASSWORD
  STRAPI_ADMIN_PASSWORD STRAPI_EMPLOYEE_PASSWORD
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

secret() {
  openssl rand -base64 32 | tr -d '\n'
}

password() {
  printf 'A1%s' "$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | cut -c1-22)"
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

env_value() {
  local key="$1"
  [[ ! -f "$ENV_FILE" ]] && echo "" && return
  awk -F '=' -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); value = $0 } END { print value }' "$ENV_FILE"
}

file_mode() {
  stat -c "%a" "$1" 2>/dev/null || stat -f "%Lp" "$1" 2>/dev/null
}

looks_like_placeholder() {
  local lower
  lower="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  case "$lower" in
    ""|password|username|secret|*_secret|change-me*|*change_me*|*changeme*|your_*|example*)
      return 0
      ;;
  esac
  return 1
}

ask() {
  local prompt="$1" default="${2:-}"
  local answer
  if [[ -n "$default" ]]; then
    read -r -p "$prompt [$default]: " answer
    echo "${answer:-$default}"
  else
    read -r -p "$prompt: " answer
    echo "$answer"
  fi
}

ask_yn() {
  local prompt="$1" default="${2:-n}"
  local answer
  if [[ "$default" == "y" ]]; then
    read -r -p "$prompt [Y/n]: " answer
    answer="${answer:-y}"
  else
    read -r -p "$prompt [y/N]: " answer
    answer="${answer:-n}"
  fi
  [[ "${answer,,}" == "y" || "${answer,,}" == "yes" ]]
}

# ---------------------------------------------------------------------------
# Compose command builder
# ---------------------------------------------------------------------------

# Sets COMPOSE (base command) and COMPOSE_UP_SERVICES (explicit services for
# "up -d"; empty means all services matching active profiles).
build_compose() {
  local use_nginx use_managed_db use_preview
  use_nginx="$(env_value USE_NGINX)"
  use_managed_db="$(env_value USE_MANAGED_DB)"
  use_preview="$(env_value USE_PREVIEW)"

  PROFILES=(prod)
  [[ "${use_managed_db:-true}" != "false" ]] && PROFILES+=(managed-db)
  [[ "${use_nginx:-false}" == "true" ]] && PROFILES+=(nginx)
  [[ "${use_preview:-false}" == "true" ]] && PROFILES+=(preview)

  PROFILE_FLAGS=()
  for p in "${PROFILES[@]}"; do PROFILE_FLAGS+=(--profile "$p"); done

  COMPOSE=(
    docker compose
    --project-name "$PROJECT_NAME"
    --env-file "$ENV_FILE"
    -f "$ROOT_DIR/compose.yaml"
    "${PROFILE_FLAGS[@]}"
  )

  # When using an external database, limit "up -d" to the app services only
  # so the bundled database container is never started.
  COMPOSE_UP_SERVICES=()
  if [[ "${use_managed_db:-true}" == "false" ]]; then
    COMPOSE_UP_SERVICES+=(strapi)
    [[ "${use_nginx:-false}" == "true" ]] && COMPOSE_UP_SERVICES+=(nginx)
    [[ "${use_preview:-false}" == "true" ]] && COMPOSE_UP_SERVICES+=(expo-web)
  fi
}

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------

usage() {
  cat <<'EOF'
Usage: ./myd17.sh <command>

Commands:
  install       Interactive setup: generates .env and nginx config
  start         Start all enabled services
  stop          Stop all services
  restart       Restart Strapi (and nginx if enabled)
  update        Backup DB, pull latest image, restart
  backup        Dump PostgreSQL to backups/ (managed DB only)
  restore FILE  Restore PostgreSQL dump created by backup (managed DB only)
  verify        Check secrets, backup readiness and Strapi health
  logs [svc]    Follow logs (all services or one service)
  status        Show service status
  help          Show this message

Environment overrides:
  ENV_FILE=/path/to/.env
  BACKUP_DIR=/path/to/backups
  STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:tag
EOF
}

# ---------------------------------------------------------------------------
# Environment validation
# ---------------------------------------------------------------------------

require_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    fail "Missing $ENV_FILE. Run: ./myd17.sh install"
  fi

  for key in "${REQUIRED_ENV[@]}"; do
    if [[ -z "$(env_value "$key")" ]]; then
      fail "Missing required env value: $key"
    fi
  done
}

require_managed_db() {
  if [[ "$(env_value USE_MANAGED_DB)" == "false" ]]; then
    fail "This command requires a managed database. Use your external DB tooling for backup/restore."
  fi
}

validate_env_file() {
  local issues=0
  local mode
  mode="$(file_mode "$ENV_FILE")"

  if [[ -z "$mode" ]]; then
    echo "Warning: could not read file permissions for $ENV_FILE" >&2
    issues=$((issues + 1))
  elif (( (8#$mode & 8#077) != 0 )); then
    echo "Warning: $ENV_FILE is readable by group or others. Run: chmod 600 $ENV_FILE" >&2
    issues=$((issues + 1))
  fi

  if [[ "$(env_value NODE_ENV)" != "production" ]]; then
    echo "Warning: NODE_ENV should be set to production in $ENV_FILE" >&2
    issues=$((issues + 1))
  fi

  local key value
  for key in "${REQUIRED_ENV[@]}"; do
    value="$(env_value "$key")"
    if looks_like_placeholder "$value"; then
      echo "Warning: replace placeholder value for $key in $ENV_FILE" >&2
      issues=$((issues + 1))
    fi
  done

  local app_keys
  IFS=',' read -r -a app_keys <<<"$(env_value APP_KEYS)"
  if [[ "${#app_keys[@]}" -lt 2 ]]; then
    echo "Warning: APP_KEYS should contain at least two comma-separated keys" >&2
    issues=$((issues + 1))
  fi

  for key in "${app_keys[@]}"; do
    if [[ "${#key}" -lt 32 ]]; then
      echo "Warning: each APP_KEYS entry should be at least 32 characters" >&2
      issues=$((issues + 1))
      break
    fi
  done

  for key in API_TOKEN_SALT ADMIN_JWT_SECRET TRANSFER_TOKEN_SALT JWT_SECRET ENCRYPTION_KEY; do
    value="$(env_value "$key")"
    if [[ "${#value}" -lt 32 ]]; then
      echo "Warning: $key should be at least 32 characters" >&2
      issues=$((issues + 1))
    fi
  done

  for key in STRAPI_ADMIN_PASSWORD STRAPI_EMPLOYEE_PASSWORD DATABASE_PASSWORD; do
    value="$(env_value "$key")"
    if [[ "${#value}" -lt 12 ]]; then
      echo "Warning: $key should be at least 12 characters" >&2
      issues=$((issues + 1))
    fi
  done

  if [[ "$issues" -ne 0 ]]; then
    echo "Warning: environment verification found $issues issue(s)." >&2
  fi
}

# ---------------------------------------------------------------------------
# Nginx config generation
# ---------------------------------------------------------------------------

write_nginx_http() {
  local domain="$1"
  local server_name="${domain:-_}"
  mkdir -p "$NGINX_CONF_DIR" "$NGINX_SSL_DIR"
  cat >"$NGINX_CONF_DIR/myd17.conf" <<EOF
server {
    listen 80;
    server_name ${server_name};

    # Increase body size limit for Strapi uploads
    client_max_body_size 50m;

    location /preview {
        proxy_pass         http://expo-web:80;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    location /_expo/ {
        proxy_pass         http://expo-web:80/_expo/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location /assets/ {
        proxy_pass         http://expo-web:80/assets/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location / {
        proxy_pass         http://strapi:1337;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
}

write_nginx_https() {
  local domain="$1"
  local server_name="${domain:-_}"
  mkdir -p "$NGINX_CONF_DIR" "$NGINX_SSL_DIR"
  cat >"$NGINX_CONF_DIR/myd17.conf" <<EOF
server {
    listen 80;
    server_name ${server_name};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${server_name};

    ssl_certificate     /etc/nginx/ssl/domain.crt;
    ssl_certificate_key /etc/nginx/ssl/domain.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Increase body size limit for Strapi uploads
    client_max_body_size 50m;

    location /preview {
        proxy_pass         http://expo-web:80;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
    }

    location /_expo/ {
        proxy_pass         http://expo-web:80/_expo/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location /assets/ {
        proxy_pass         http://expo-web:80/assets/;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
    }

    location / {
        proxy_pass         http://strapi:1337;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
}

generate_self_signed_cert() {
  local domain="${1:-localhost}"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$NGINX_SSL_DIR/domain.key" \
    -out    "$NGINX_SSL_DIR/domain.crt" \
    -subj   "/CN=${domain}" \
    -addext "subjectAltName=DNS:${domain}" \
    2>/dev/null
  chmod 600 "$NGINX_SSL_DIR/domain.key"
  echo "Self-signed certificate generated in $NGINX_SSL_DIR/"
}

# ---------------------------------------------------------------------------
# Install (interactive setup)
# ---------------------------------------------------------------------------

run_install() {
  if [[ -f "$ENV_FILE" && "${FORCE:-0}" != "1" ]]; then
    echo "$ENV_FILE already exists. Set FORCE=1 to overwrite."
    exit 1
  fi

  echo ""
  echo "MyD17 Setup"
  echo "==========="
  echo ""

  local domain use_nginx use_ssl self_signed use_managed_db use_preview
  local db_host db_port db_name db_user db_pass db_ssl
  local preview_secret expo_web_url expo_public_strapi_url strapi_url
  local db_section

  domain="$(ask "Enter domain name (leave empty for IP-only access)")"

  # Database
  if ask_yn "Use managed PostgreSQL database?" "y"; then
    use_managed_db=true
    db_host=database
    db_port=5432
    db_name=myd17
    db_user=myd17
    db_pass="$(password)"
    db_ssl=false
    db_section="# Database — managed (bundled PostgreSQL container)
DATABASE_CLIENT=postgres
DATABASE_HOST=${db_host}
DATABASE_PORT=${db_port}
DATABASE_NAME=${db_name}
DATABASE_USERNAME=${db_user}
DATABASE_PASSWORD=${db_pass}
DATABASE_SSL=${db_ssl}"
  else
    use_managed_db=false
    db_host="$(ask "Database host")"
    db_port="$(ask "Database port" "5432")"
    db_name="$(ask "Database name")"
    db_user="$(ask "Database username")"
    db_pass="$(ask "Database password")"
    if ask_yn "Use SSL for database connection?"; then
      db_ssl=true
    else
      db_ssl=false
    fi
    db_section="# Database — external
DATABASE_CLIENT=postgres
DATABASE_HOST=${db_host}
DATABASE_PORT=${db_port}
DATABASE_NAME=${db_name}
DATABASE_USERNAME=${db_user}
DATABASE_PASSWORD=${db_pass}
DATABASE_SSL=${db_ssl}"
  fi

  # Nginx
  if ask_yn "Set up nginx as a reverse proxy?"; then
    use_nginx=true
    if [[ -n "$domain" ]]; then
      if ask_yn "Generate a self-signed SSL certificate for testing?"; then
        use_ssl=true
        self_signed=true
      else
        use_ssl=true
        self_signed=false
      fi
    else
      use_ssl=false
      self_signed=false
    fi
  else
    use_nginx=false
    use_ssl=false
    self_signed=false
  fi

  # Public Strapi URL (used by preview and other integrations)
  local scheme="http"
  [[ "${use_ssl:-false}" == "true" ]] && scheme="https"
  if [[ "$use_nginx" == "true" && -n "$domain" ]]; then
    strapi_url="${scheme}://${domain}"
  elif [[ -n "$domain" ]]; then
    strapi_url="${scheme}://${domain}:${PORT:-1337}"
  else
    strapi_url="http://localhost:1337"
  fi

  # Preview (Expo web)
  if ask_yn "Enable content preview? (served at /preview on the main domain)"; then
    use_preview=true
    preview_secret="$(secret)"
    if [[ -n "$domain" ]]; then
      expo_web_url="${scheme}://${domain}"
    else
      expo_web_url="http://localhost:1337"
    fi
    expo_public_strapi_url="$(ask "Strapi URL for Expo web preview" "$strapi_url")"
  else
    use_preview=false
    preview_secret=""
    expo_web_url=""
    expo_public_strapi_url=""
  fi

  echo ""

  # Generate .env
  mkdir -p "$(dirname "$ENV_FILE")"
  cat >"$ENV_FILE" <<EOF
# Generated by ./myd17.sh install. Keep this file outside git and restrict access (chmod 600).
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
STRAPI_IMAGE=${STRAPI_IMAGE:-ghcr.io/stawex-team/myd17/strapi:latest}

# Module configuration
USE_MANAGED_DB=${use_managed_db}
USE_NGINX=${use_nginx}
USE_PREVIEW=${use_preview}
DOMAIN=${domain}
STRAPI_URL=${strapi_url}

# Strapi secrets (auto-generated — do not change after first start)
APP_KEYS=$(secret),$(secret),$(secret),$(secret)
API_TOKEN_SALT=$(secret)
ADMIN_JWT_SECRET=$(secret)
TRANSFER_TOKEN_SALT=$(secret)
JWT_SECRET=$(secret)
ENCRYPTION_KEY=$(secret)

# Initial admin account passwords (stored in plain text — change after first login)
STRAPI_ADMIN_PASSWORD=$(password)
STRAPI_EMPLOYEE_PASSWORD=$(password)

${db_section}

# Optional — Firebase push notifications
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Content preview (Expo web container)
EXPO_WEB_IMAGE=${EXPO_WEB_IMAGE:-ghcr.io/stawex-team/myd17/expo-web:latest}
$(if [[ "$use_preview" == "true" ]]; then
  printf 'PREVIEW_SECRET=%s\nEXPO_WEB_URL=%s\nEXPO_PUBLIC_STRAPI_URL=%s' "$preview_secret" "$expo_web_url" "$expo_public_strapi_url"
else
  printf '# PREVIEW_SECRET=\n# EXPO_WEB_URL=\n# EXPO_PUBLIC_STRAPI_URL='
fi)
EOF

  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE (mode 600)."

  # Link Strapi .env only when running inside the monorepo (local dev)
  if [[ "$STRAPI_ENV_FILE" != "$ENV_FILE" && -d "$ROOT_DIR/apps/strapi" ]]; then
    mkdir -p "$(dirname "$STRAPI_ENV_FILE")"
    rm -f "$STRAPI_ENV_FILE"
    ln -s "$(realpath --relative-to="$(dirname "$STRAPI_ENV_FILE")" "$ENV_FILE" 2>/dev/null || printf '%s' "$ENV_FILE")" "$STRAPI_ENV_FILE"
    echo "Linked $STRAPI_ENV_FILE → $ENV_FILE"
  fi

  # Nginx config
  if [[ "$use_nginx" == "true" ]]; then
    mkdir -p "$NGINX_CONF_DIR" "$NGINX_SSL_DIR"

    if [[ "$use_ssl" == "true" ]]; then
      write_nginx_https "$domain"
      if [[ "$self_signed" == "true" ]]; then
        generate_self_signed_cert "${domain:-localhost}"
        echo "Created $NGINX_CONF_DIR/myd17.conf (HTTPS with self-signed cert)."
      else
        echo "Created $NGINX_CONF_DIR/myd17.conf (HTTPS template)."
        echo "  → Place your SSL certificate at $NGINX_SSL_DIR/domain.crt"
        echo "  → Place your SSL private key at  $NGINX_SSL_DIR/domain.key"
      fi
    else
      write_nginx_http "$domain"
      echo "Created $NGINX_CONF_DIR/myd17.conf (HTTP)."
      echo "  → To enable HTTPS: add certs to $NGINX_SSL_DIR/ and edit $NGINX_CONF_DIR/myd17.conf"
    fi
  fi

  echo ""
  echo "Setup complete. Store a secure copy of $ENV_FILE before starting."
  echo ""
  echo "Optional: review $ENV_FILE to configure Firebase push notifications."
  echo ""
  echo "Next step:"
  echo "  ./myd17.sh start"
}

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

wait_for_db() {
  local db_user db_name
  db_user="$(env_value DATABASE_USERNAME)"
  db_name="$(env_value DATABASE_NAME)"

  for _ in {1..30}; do
    if "${COMPOSE[@]}" exec -T database pg_isready -U "$db_user" -d "$db_name" >/dev/null 2>&1; then
      return
    fi
    sleep 2
  done

  fail "PostgreSQL did not become ready in time."
}

verify_backup_readiness() {
  local db_user db_name
  db_user="$(env_value DATABASE_USERNAME)"
  db_name="$(env_value DATABASE_NAME)"

  "${COMPOSE[@]}" up -d database
  wait_for_db
  "${COMPOSE[@]}" exec -T database pg_dump -U "$db_user" -d "$db_name" --schema-only --no-owner --no-acl >/dev/null
  echo "Database backup pre-check passed."
}


backup_db() {
  require_env
  require_managed_db
  validate_env_file
  mkdir -p "$BACKUP_DIR"

  local db_user db_name output
  db_user="$(env_value DATABASE_USERNAME)"
  db_name="$(env_value DATABASE_NAME)"
  output="$BACKUP_DIR/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).dump"

  "${COMPOSE[@]}" up -d database
  wait_for_db
  "${COMPOSE[@]}" exec -T database pg_dump -U "$db_user" -d "$db_name" --format=custom --no-owner --no-acl >"$output"

  if [[ ! -s "$output" ]]; then
    rm -f "$output"
    fail "Backup failed: dump file is empty."
  fi

  if ! "${COMPOSE[@]}" exec -T database pg_restore --list <"$output" >/dev/null; then
    rm -f "$output"
    fail "Backup failed: dump file could not be read by pg_restore."
  fi

  chmod 600 "$output"
  echo "Backup saved to $output"
}

restore_db() {
  require_env
  require_managed_db
  local input="${1:-}"
  if [[ -z "$input" || ! -f "$input" ]]; then
    echo "Usage: ./myd17.sh restore FILE"
    exit 1
  fi

  local db_user db_name
  db_user="$(env_value DATABASE_USERNAME)"
  db_name="$(env_value DATABASE_NAME)"

  "${COMPOSE[@]}" stop strapi >/dev/null 2>&1 || true
  "${COMPOSE[@]}" up -d database
  wait_for_db
  backup_db
  "${COMPOSE[@]}" exec -T database pg_restore -U "$db_user" -d "$db_name" --clean --if-exists --no-owner --no-acl <"$input"
  "${COMPOSE[@]}" up -d "${COMPOSE_UP_SERVICES[@]}"
  echo "Restored $input"
}

# ---------------------------------------------------------------------------
# Stack operations
# ---------------------------------------------------------------------------

start_stack() {
  require_env
  validate_env_file
  "${COMPOSE[@]}" up -d "${COMPOSE_UP_SERVICES[@]}"
}

update_stack() {
  require_env

  local strapi_image
  strapi_image="$(env_value STRAPI_IMAGE)"

  # Only back up when using managed DB
  if [[ "$(env_value USE_MANAGED_DB)" != "false" ]]; then
    backup_db
  fi

  if [[ "$strapi_image" == */* ]]; then
    "${COMPOSE[@]}" pull strapi
  fi

  local expo_web_image
  expo_web_image="$(env_value EXPO_WEB_IMAGE)"
  if [[ "$(env_value USE_PREVIEW)" == "true" && "$expo_web_image" == */* ]]; then
    "${COMPOSE[@]}" pull expo-web
  fi

  "${COMPOSE[@]}" up -d "${COMPOSE_UP_SERVICES[@]}"
  echo "Strapi restarted. Application schema changes run during Strapi startup."
}

verify_stack() {
  require_env
  validate_env_file
  "${COMPOSE[@]}" config --quiet

  if [[ "$(env_value USE_MANAGED_DB)" != "false" ]]; then
    verify_backup_readiness
  fi

  echo "Verification passed."
}

# ---------------------------------------------------------------------------
# Command dispatch
# ---------------------------------------------------------------------------

case "${1:-}" in
  install)
    run_install
    ;;
  start)
    build_compose
    start_stack
    ;;
  stop)
    require_env
    build_compose
    "${COMPOSE[@]}" down
    ;;
  restart)
    require_env
    build_compose
    "${COMPOSE[@]}" restart strapi
    ;;
  update)
    build_compose
    update_stack
    ;;
  verify)
    build_compose
    verify_stack
    ;;
  backup)
    build_compose
    backup_db
    ;;
  restore)
    build_compose
    restore_db "${2:-}"
    ;;
  logs)
    require_env
    build_compose
    if [[ -n "${2:-}" ]]; then
      "${COMPOSE[@]}" logs -f "$2"
    else
      "${COMPOSE[@]}" logs -f
    fi
    ;;
  status)
    require_env
    build_compose
    "${COMPOSE[@]}" ps
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
