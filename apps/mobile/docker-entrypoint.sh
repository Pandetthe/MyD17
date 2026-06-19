#!/bin/sh
set -eu

if [ -z "${EXPO_PUBLIC_STRAPI_URL:-}" ]; then
  echo "WARNING: EXPO_PUBLIC_STRAPI_URL is not set. The preview page will not be able to reach Strapi." >&2
fi

find /usr/share/nginx/html -name '*.js' \
  -exec sed -i "s|__STRAPI_URL__|${EXPO_PUBLIC_STRAPI_URL:-}|g" {} +
exec nginx -g 'daemon off;'
