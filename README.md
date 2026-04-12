# Local development setup

### Environment Prerequisite

Configure your local machine by following the [Expo Environment Setup Guide](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local).

- Target: Whatever you want to test the app on
- Mode: Development build
- Note: do not use EAS

### Database

Create a `.env` file in the root directory and configure it based on the `.env.example.dev` template. Using the default values should work for a basic setup ;)

From the root folder run

```bash
docker compose up -d
```

### Running the mobile app

Navigate to the mobile directory

```bash
cd apps/mobile
```

If you are running the app for the first time or you have changed native code, added new packages (with native file changes), or updated the schema, trigger a full build:

```bash
pnpm android -d  # For Android
pnpm ios -d      # For iOS
```

The -d flag allows you to select your preferred device/emulator target.

Otherwise, for the regular starts simply start the bundler:

```bash
pnpm start
```

---

# TODO: finish setting up production environment

### Strapi backend and PostgreSQL database in production environment

Create a `.env` file in the root directory and configure it based on the `.env.example.` template. Using the default values should work for a basic setup ;)

From the root folder run

```bash
docker compose up --profile prod -d
```
