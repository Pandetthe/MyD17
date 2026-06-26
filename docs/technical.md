# Technical documentation

Developer reference for maintaining and extending the MyD17 backend.

## Push notifications

Push notifications are sent via Firebase Cloud Messaging (FCM). Two separate pieces of configuration are required: a service account key for the Strapi backend and a `google-services.json` file for the mobile app build.

### Firebase project setup

1. Open [Firebase Console](https://console.firebase.google.com) and create a new project (any name, disable Google Analytics if not needed).
2. From the project overview go to **Settings → General**.
3. Add an Android app:
   - Android package name: `io.github.pandetthe.myd17` (or the value of `android.package` in `apps/mobile/app.json` if customised).
   - Leave all other fields as default.
4. Download `google-services.json` and place it in `apps/mobile/`.

### Strapi service account key

1. Go to **Settings → Service accounts**.
2. Click **Generate new private key** - a JSON file will be downloaded.
3. Minify the JSON (remove all whitespace - use [jsonformatter.org](https://jsonformatter.org/json-minifier) or `jq -c . key.json`).
4. Add it to `.env` as a single line:

```dotenv
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
```

If the variable is empty or the JSON is invalid, Strapi starts normally but push notifications are disabled and a warning is printed in the logs.

### FCM in the mobile app

The `google-services.json` file placed in `apps/mobile/` is picked up automatically during the Expo prebuild step. No additional code changes are needed - the push notification plugin reads it at build time.

To verify notifications are working after setup:

1. Start the stack with `FIREBASE_SERVICE_ACCOUNT` set.
2. Check `./myd17.sh logs myd17-cms` - you should see `Firebase initialized` on startup, not a warning.
3. Send a test notification from the Strapi admin panel or via the API.

---

## Updating Strapi framework version

This covers upgrading the Strapi framework itself, not deploying a new app image to production (see [on-premise.md](on-premise.md#updates) for that).

### Check current version

```bash
grep '@strapi/strapi' apps/strapi/package.json
```

### Run the upgrade

```bash
pnpm --filter strapi run upgrade
```

This runs `@strapi/upgrade latest` inside the Strapi app, which bumps all `@strapi/*` packages in `apps/strapi/package.json` and applies any required code migrations automatically.

To preview changes without applying them:

```bash
pnpm --filter strapi run upgrade:dry
```

### After upgrading

1. Review the diff - the upgrade tool may have modified config files or plugin registrations.
2. Run the dev server and verify nothing is broken:

```bash
pnpm run dev
```

3. Run tests:

```bash
pnpm --filter strapi test
```

4. Commit the changes, create and push a release tag - CI builds and publishes the new image automatically (see [release.md](release.md#prepare-a-release)).
5. Deploy to on-premise servers via `./myd17.sh update` (see [on-premise.md](on-premise.md#updates)).
