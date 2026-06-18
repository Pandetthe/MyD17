# Linux Standard Deployment

This article walks through installing and deploying MyD17 on a Linux server. Only Docker Engine and Bash are required — no Node.js or package manager needed on the server.

## System specifications

|  | Minimum | Recommended |
|---|---|---|
| Processor | x64, 1.4 GHz | x64, 2 GHz dual core |
| Memory | 2 GB RAM | 4 GB RAM |
| Storage | 12 GB | 25 GB |
| Docker | Engine 26+ with Compose plugin | Engine 26+ with Compose plugin |

The Compose plugin is automatically included when you install Docker Engine.

## Overview

1. [**Install Docker**](#install-docker) on your server.
2. [**Copy deployment files**](#copy-deployment-files) to your server.
3. [**Run the installer**](#run-the-installer) — `./myd17.sh install` — to generate secrets and configure modules.
4. [**Access the Strapi image**](#accessing-the-strapi-image) from GHCR or build it locally.
5. [**Configure optional features**](#optional-configuration) (Firebase push notifications, content preview).
6. [**Start the stack**](#start-the-stack) — `./myd17.sh start`.
7. Test the installation by opening `http://YOUR_SERVER:1337/admin` in a browser.
8. Set up regular [**backups**](#backups-and-restore).

## Installation procedure

### Install Docker

Install Docker Engine and the Compose plugin following the [official guide](https://docs.docker.com/engine/install/#supported-platforms).

Verify the installation:

```bash
docker --version
docker compose version
```

### Copy deployment files

Only two files are needed on the server:

- `myd17.sh`
- `compose.yaml`

Copy them manually:

```bash
scp myd17.sh compose.yaml user@SERVER:/opt/myd17/
ssh user@SERVER "chmod +x /opt/myd17/myd17.sh"
```

All subsequent commands are run on the server from `/opt/myd17`.

### Run the installer

```bash
./myd17.sh install
```

The installer prompts for:

- **Domain name** — the hostname operators and the mobile app use to reach this server (e.g. `api.example.com`). Leave empty for IP-only access.
- **Managed PostgreSQL database** — whether to run the bundled PostgreSQL container. Choose **no** to connect to an existing external database; you will be prompted for the connection details.
- **nginx reverse proxy** — whether to run a managed nginx container in front of Strapi.
  - **Self-signed certificate** — generates a certificate valid for testing. Replace it with a trusted certificate before exposing the server to the internet.

The installer creates:

- `.env` with generated secrets and initial admin passwords (mode `600`).
- `nginx/conf.d/myd17.conf` — the nginx configuration (if nginx was enabled).
- `nginx/ssl/` — directory for SSL certificates.

> **Important:** Store a secure copy of `.env` before starting. It contains all secrets needed to restore the installation.

### Accessing the Strapi image

The Strapi image is published to GitHub Container Registry (GHCR) as `ghcr.io/stawex-team/myd17/strapi` (private).

**Option 1 — Pull from GHCR (recommended)**

1. Generate a personal access token at [github.com/settings/tokens/new](https://github.com/settings/tokens/new) with the `read:packages` scope.
2. Log in to GHCR:

```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

3. Set the image tag in `.env` (pin to a specific version for production):

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

**Option 2 — Build locally**

```bash
docker build -t strapi:local -f apps/strapi/Dockerfile .
```

Then update `.env`:

```dotenv
STRAPI_IMAGE=strapi:local
```

### Optional configuration

Edit `.env` to enable additional features before starting:

#### Firebase push notifications

```dotenv
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
```

Paste the contents of your Firebase service account JSON as a single minified line. If empty, Strapi starts normally but push notifications are disabled.

See [technical.md](technical.md#push-notifications) for the full Firebase setup walkthrough.

#### Content preview

```dotenv
PREVIEW_SECRET=your-random-secret
```

Required on production — Strapi uses it to sign preview URLs. Without it the default `change-me-in-production` value is used, which is only acceptable for local development.

To use the compiled web app for preview instead of the built-in HTML renderer:

```dotenv
EXPO_WEB_URL=https://your-web-app-url
CORS_ALLOWED_ORIGINS=http://localhost:1337,https://your-web-app-url
```

### Start the stack

```bash
./myd17.sh start
```

Check that all services are running:

```bash
./myd17.sh status
```

The Strapi admin panel is available at `http://YOUR_SERVER:1337/admin` (or `https://YOUR_DOMAIN/admin` if nginx with SSL is enabled).

Initial admin accounts are created on first start:

- `admin@myd17.pl` — password from `STRAPI_ADMIN_PASSWORD` in `.env`
- `employee@myd17.pl` — password from `STRAPI_EMPLOYEE_PASSWORD` in `.env`

## Updates

Strapi applies schema changes automatically on startup.

1. Set the new image tag in `.env`:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.3.0
```

2. Run the update:

```bash
./myd17.sh update
```

`update` creates a verified database backup before pulling the new image and restarting the stack.

3. Verify the environment:

```bash
./myd17.sh verify
```

## Rollback

If an update causes issues, restore the previous state:

1. Set the previous image tag in `.env`:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

2. Restore the database backup created automatically before the update:

```bash
./myd17.sh restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

`restore` stops Strapi, backs up the current database state, restores the specified dump, then restarts the stack.

3. Verify:

```bash
./myd17.sh verify
```

## Backups and restore

Create a database backup:

```bash
./myd17.sh backup
```

The backup is saved to `backups/` as a `.dump` file and verified with `pg_restore` before being kept.

Restore from backup:

```bash
./myd17.sh restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

> **Note:** File uploads stored in the `strapi_uploads` Docker volume are not included in the database dump. Back up the volume separately if needed.

## Diagnostics

### Service status

```bash
./myd17.sh status
```

Expected output: `database` with status `healthy`, `strapi` with status `running` or `healthy`.

### Logs

```bash
./myd17.sh logs           # all services
./myd17.sh logs strapi
./myd17.sh logs database
./myd17.sh logs nginx
```

### Application healthcheck

```bash
curl http://localhost:1337/_health
```

If the endpoint does not respond:

- Check `./myd17.sh status` — confirm containers are running.
- Check `./myd17.sh logs strapi` — look for startup errors.
- Verify port `1337/tcp` is not blocked by a firewall or reverse proxy.
- Run `./myd17.sh verify` to validate secrets and database connectivity.

## Script commands reference

| Command | Description |
|---|---|
| `install` | Interactive setup: generate `.env`, configure nginx |
| `start` | Start all enabled services |
| `stop` | Stop all services |
| `restart` | Restart Strapi (and nginx if enabled) |
| `update` | Backup DB, pull new Strapi image, restart |
| `backup` | Dump PostgreSQL to `backups/` |
| `restore FILE` | Restore from a dump file |
| `verify` | Check secrets, backup readiness, Strapi health |
| `logs [svc]` | Follow logs for all services or a specific service |
| `status` | Show service status |
| `help` | List all commands |

## Next steps

- See [technical.md](technical.md) for push notifications setup and Strapi framework upgrades.
- See [release.md](release.md) for the release and image publishing workflow.
