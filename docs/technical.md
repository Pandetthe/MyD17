# Technical documentation

This document describes the simplest way to deploy and maintain a production environment on a single on-premise server.

## System components

The production environment runs two containers:

- `database` — PostgreSQL 17, data stored in Docker volume `pgdata`.
- `strapi` — Strapi backend, uploads stored in Docker volume `strapi_uploads`.

Key files:

- `compose.yaml` — container definitions.
- `scripts/onprem.sh` — script for installation, updates, backups, restores and diagnostics (invoked via `pnpm onprem`).
- `.env` — production secrets and configuration.

## First installation

All commands are run from the repository root.

### Server preparation

- Install Docker Engine and the Docker Compose plugin.
- Verify the installation:

```bash
docker --version
docker compose version
```

- Clone the repository to the server.

### Generating configuration

```bash
pnpm onprem init
```

The script creates `.env` with random secrets, a database password and initial admin account passwords.

After generating:

```bash
chmod 600 .env
```

### Accessing the Strapi image

Recommended option: pull the image from GitHub Container Registry.

```bash
echo GITHUB_TOKEN | docker login ghcr.io -u GITHUB_USER --password-stdin
```

Set the image in `.env`, preferably pinned to a specific version tag:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

`latest` can also be used, but a specific tag is recommended for production.

Alternatively, build the image locally:

```bash
docker build -t strapi:local -f apps/strapi/Dockerfile .
```

Then in `.env`:

```dotenv
STRAPI_IMAGE=strapi:local
```

### Configuring push notifications

Push notifications require a Firebase project with FCM enabled.

#### Firebase private key (Strapi)

1. Open [Firebase Console](https://console.firebase.google.com) and create a new project (any name, leave other options as default).
2. From the project overview go to **Settings → Service accounts**.
3. Click **Generate new private key** — a JSON file will be downloaded.
4. Paste the file contents into `.env` as the value of `FIREBASE_SERVICE_ACCOUNT` **as a single line with no whitespace** (use any JSON minifier):

```dotenv
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
```

If the variable is empty or invalid, Strapi starts normally but push notifications are disabled (a message appears in the logs).

#### google-services.json (mobile app build)

The `google-services.json` file is required and must be placed in `apps/mobile`.

1. From the Firebase Console project overview go to **Settings → General**.
2. Add an Android app (Android package name: `io.github.stawex.myd17`, or the value under `android.package` in `apps/mobile/app.json` if customised; leave other fields as default).
3. Download `google-services.json` and place it in `apps/mobile`.

### Starting the stack

```bash
pnpm onprem up
```

Check status:

```bash
pnpm onprem status
```

The Strapi admin panel is available at:

```text
http://SERVER_ADDRESS:1337/admin
```

Initial admin accounts are created on first start if they do not already exist:

- `admin@myd17.pl`
- `employee@myd17.pl`

Passwords are stored in `.env` under `STRAPI_ADMIN_PASSWORD` and `STRAPI_EMPLOYEE_PASSWORD`.

## Optional configuration

The following variables can be added manually to `.env` after `init` generates the file.

### Content preview in the admin panel

Strapi shows an **"Open Preview"** button on the edit pages for posts, info cards and the contact page. Clicking it opens a rendered preview of the content blocks in a new tab.

To enable preview, set a random secret:

```dotenv
PREVIEW_SECRET=your-random-secret
```

Without this variable preview works with the default value `change-me-in-production`, which is acceptable for local development only. On a production environment setting a custom value is **required**.

### Preview with the web app

By default preview renders a simplified HTML version. To use the compiled mobile app (React Native Web) instead, set the address where it is hosted:

```dotenv
EXPO_WEB_URL=http://localhost:8081
```

The value should point to the Expo dev server (`pnpm start --web` inside `apps/mobile`) or a built and hosted static export (`npx expo export --platform web`). The address is passed to the preview page as a parameter, so it must be reachable both from the browser opening the preview and from the Strapi server.

If additional origins beyond `EXPO_WEB_URL` need to reach the API, add them to `CORS_ALLOWED_ORIGINS`:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:1337,http://localhost:8081
```

## Updating the system

An update consists of changing the Strapi image tag and restarting the stack. Strapi applies schema changes on startup.

- Check the current version in `.env`:

```bash
grep STRAPI_IMAGE .env
```

- Set the new image tag in `.env`, for example:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.3.0
```

- Run the update:

```bash
pnpm onprem migrate
```

The script creates a verified database backup in `backups/` before updating.

- Verify the environment:

```bash
pnpm onprem status
pnpm onprem verify
```

## Rolling back (rollback)

- Restore the previous image tag in `.env`:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

- Restore the database from the backup created before the update:

```bash
pnpm onprem restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

- Verify the system:

```bash
pnpm onprem verify
```

Note: `restore` stops Strapi, starts the database, creates an additional backup of the current database state, restores the specified dump and restarts Strapi.

## Backup and restore

Manual database backup:

```bash
pnpm onprem backup
```

The backup is saved to `backups/` as a `.dump` file.

Restore from backup:

```bash
pnpm onprem restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

A database backup does not replace an uploads backup. Files uploaded to Strapi are stored in the Docker volume `strapi_uploads` and should be backed up separately.

## Basic diagnostics

### Service status

```bash
pnpm onprem status
```

Expected services:

- `database` — status `healthy`.
- `strapi` — status `running` or `healthy`.

### Logs

All services:

```bash
pnpm onprem logs
```

Strapi only:

```bash
pnpm onprem logs strapi
```

Database only:

```bash
pnpm onprem logs database
```

### Application healthcheck

```bash
curl http://localhost:1337/_health
```

If the endpoint does not respond:

- Check `pnpm onprem status`.
- Check `pnpm onprem logs strapi`.
- Verify port `1337/tcp` is not blocked by a firewall or reverse proxy.
- Verify `.env` has all required variables:

```bash
pnpm onprem verify
```
