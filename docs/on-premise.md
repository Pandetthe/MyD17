# On-Premise Operations

For the initial server setup and installation procedure see the [Self-Hosted Deployment](../README.md#self-hosted-deployment) section in the main README.

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
