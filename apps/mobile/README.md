# Mobile App

Expo + React Native app with Expo Router for iOS, Android, and Web.

## Setup

See the root [README.md](../../README.md) for the full quick-start guide. The short version:

```bash
# From the repository root — generate apps/mobile/.env.local
pnpm mobile:setup            # physical phone (auto-detects LAN IP)
pnpm mobile:setup emulator   # Android emulator
```

`apps/mobile/.env.local` is gitignored. The only required variable is:

```dotenv
EXPO_PUBLIC_STRAPI_URL=http://<strapi-host>:1337
```

For the Android emulator the value is `http://10.0.2.2:1337`. For a physical device use your machine's LAN IP. For production use the public API URL.

## Development

Start the Expo bundler:

```bash
pnpm start
```

Or run on a specific platform:

```bash
pnpm android -d   # Android emulator / device
pnpm ios -d       # iOS simulator / device
pnpm web          # browser (used by Strapi content preview)
```

## Web output

The app is configured with `"output": "static"` for web. The web build is used by the Strapi admin panel's content preview feature — it renders the preview at `/preview?uid=...&documentId=...&status=...&secret=...`.

To serve the web app locally for preview:

```bash
pnpm start --web   # dev server at http://localhost:8081
```

Then set `EXPO_WEB_URL=http://localhost:8081` in `apps/strapi/.env`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_STRAPI_URL` | Yes | Base URL of the Strapi API |

## Tech stack

- [Expo](https://expo.dev) + [Expo Router](https://expo.github.io/router)
- [React Native Unistyles](https://reactnativeunistyles.vercel.app) for theming
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) for push notifications
- `expo-calendar` for adding events to the device calendar
