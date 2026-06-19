# Strapi CMS

Headless CMS backend for the MyD17 app.

## Setup

See the root [README.md](../../README.md) for the full quick-start guide. Copy the env template and start the database:

```bash
cp apps/strapi/.env.example apps/strapi/.env
docker compose up -d   # starts PostgreSQL only
pnpm run dev           # starts Strapi (from repo root)
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_*` | Yes | PostgreSQL connection (host, port, name, user, password, SSL) |
| `APP_KEYS` | Yes | Strapi session key rotation (4 comma-separated values) |
| `API_TOKEN_SALT` | Yes | Salt for API tokens |
| `ADMIN_JWT_SECRET` | Yes | JWT secret for admin sessions |
| `TRANSFER_TOKEN_SALT` | Yes | Salt for data transfer tokens |
| `JWT_SECRET` | Yes | JWT secret for users-permissions |
| `ENCRYPTION_KEY` | Yes | Encryption key for encrypted fields |
| `FIREBASE_SERVICE_ACCOUNT` | No | Firebase service account JSON (single line) — required for push notifications |
| `STRAPI_URL` | No | Public base URL of this Strapi instance (used in share links and image URLs) |
| `PREVIEW_SECRET` | No | Random secret for the content preview feature. Defaults to `change-me-in-production` — set a real value in production |
| `EXPO_WEB_URL` | No | URL of the Expo web app. When set, the admin preview button opens the React Native Web preview instead of the built-in HTML preview |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated list of additional allowed CORS origins |

## Content types

### Collection types

| API UID | Display name | Notes |
|---|---|---|
| `api::post.post` | Post | Main content entries with dynamic zone blocks |
| `api::tag.tag` | Tag | Labels attached to posts |
| `api::static-information.static-information` | Info Card | Reusable information cards |
| `api::push-subscriber.push-subscriber` | Push Subscriber | FCM device tokens |

### Single types

| API UID | Display name | Notes |
|---|---|---|
| `api::contact.contact` | Contact Page | Contact information page |
| `api::information-page.information-page` | Information Page | Static information page |

## Content components

Components live under `src/components/` and are used in the `content` dynamic zone:

| Component UID | Display name |
|---|---|
| `content.text` | Text |
| `content.section-title` | Section Title |
| `content.chip` | Chip |
| `content.location` | Location |
| `content.event-date-time` | Event Date & Time |
| `content.calendar` | Calendar |
| `calendar-entry.calendar-entry` | Calendar Entry |

## Content preview

The admin panel shows an **"Open Preview"** button for Post, Info Card and Contact Page. It requires `PREVIEW_SECRET` to be set (and matching `PREVIEW_SECRET` on both Strapi and the Expo web app side).

Preview flow:
1. Admin clicks "Open Preview" → Strapi builds a URL: `${EXPO_WEB_URL}/preview?uid=...&documentId=...&status=...&secret=...`
2. The Expo web app's `/preview` page receives the params and calls `/api/preview-content` on Strapi with the secret in the `X-Preview-Secret` header.
3. Strapi validates the secret and returns the content.

If `EXPO_WEB_URL` is not set, the preview URL falls back to `${STRAPI_URL}/api/preview` which renders a simple HTML page.

## Locale

The admin panel is configured for the Polish locale (`pl`). Custom Polish translations are registered in `src/admin/app.tsx`.

## Push notifications

Push notifications use Firebase Cloud Messaging. Set `FIREBASE_SERVICE_ACCOUNT` to the contents of the service account JSON file as a single minified line. See [docs/technical.md](../../docs/technical.md#configuring-push-notifications) for the full setup guide.
