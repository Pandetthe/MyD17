# On-premise deployment

This project can be deployed on a single on-premise host with Docker Compose.

## First setup

Install Docker with the Compose plugin, then from the repository root run:

```bash
pnpm onprem init
pnpm onprem up
```

`init` creates `.env` with generated database credentials, Strapi keys and initial admin passwords. It also links `apps/strapi/.env` to that root `.env`, so Strapi sees the same values when it starts from its own package directory.

### Accessing the Strapi image

The Strapi image is published to GitHub Container Registry (GHCR) as `ghcr.io/stawex-team/myd17/strapi:latest` (private).

**Option 1: Login to GHCR (requires GitHub token)**

1. Generate a personal access token at https://github.com/settings/tokens/new with `read:packages` scope
2. Login to GHCR:
   ```bash
   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```
3. Run deployment:
   ```bash
   pnpm onprem up
   ```

**Option 2: Build the image locally (no credentials needed)**

Build the Strapi image locally:

```bash
docker build -t strapi:local -f apps/strapi/Dockerfile .
```

Then use it in deployment:

```bash
STRAPI_IMAGE=strapi:local pnpm onprem up
```

Or update `STRAPI_IMAGE` in `.env` to `strapi:local` permanently.

## Updates and migrations

Strapi applies application schema changes during startup. For a normal on-premise update run:

```bash
pnpm onprem migrate
```

The command warns about risky production secrets, creates a verified PostgreSQL backup, pulls the configured Strapi image and restarts the stack.

To verify a running on-premise environment without applying changes, run:

```bash
pnpm onprem verify
```

The verification warns when `.env` is group/world-readable or required secrets look like placeholders. It still fails if PostgreSQL cannot produce a schema dump or Strapi does not respond on its health endpoint.

## Backups and restore

Create a database dump:

```bash
pnpm onprem backup
```

The backup command also confirms that the generated custom dump can be read by `pg_restore`.

Restore a dump:

```bash
pnpm onprem restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

Uploads are stored in the `strapi_uploads` Docker volume.

## Operations

```bash
pnpm onprem status
pnpm onprem logs
pnpm onprem logs strapi
pnpm onprem restart
pnpm onprem down
```
