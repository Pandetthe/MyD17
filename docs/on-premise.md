# On-premise deployment

This project can be deployed on a single on-premise host with Docker Compose.

## First setup

Install Docker with the Compose plugin, then from the repository root run:

```bash
pnpm onprem init
pnpm onprem up
```

`init` creates `.env` with generated database credentials, Strapi keys and initial admin passwords.

## Updates and migrations

Strapi applies application schema changes during startup. For a normal on-premise update run:

```bash
pnpm onprem migrate
```

The command creates a PostgreSQL backup, pulls the configured Strapi image and restarts the stack.

## Backups and restore

Create a database dump:

```bash
pnpm onprem backup
```

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
