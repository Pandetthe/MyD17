# Local Development

## Quick Start

### 1. Setup Environment

Copy the development environment templates:

```bash
cp .env.example.dev .env
cp apps/strapi/.env.example apps/strapi/.env
```

Edit `.env` and `apps/strapi/.env` if needed (default values should work for local development).

**Mobile app — Strapi URL:**

```bash
pnpm mobile:setup            # physical phone over WiFi (auto-detects your LAN IP)
pnpm mobile:setup emulator   # Android emulator
```

This generates `apps/mobile/.env.local` with `EXPO_PUBLIC_STRAPI_URL` pointing at your running Strapi instance. The file is gitignored — each developer runs this once.

Alternatively, copy a template manually:

```bash
cp apps/mobile/.env.example.phone apps/mobile/.env.local
# then edit .env.local and replace YOUR_LAN_IP with your actual IP
```

### 2. Start Database

Start PostgreSQL database in Docker:

```bash
docker compose up -d
```

> **Note:** This starts **only the database**. Backend and mobile app are started via `pnpm run dev`.

### 3. Start Development Servers

From the root directory, run:

```bash
pnpm run dev
```

In a separate terminal, start the Expo web server (used by the Strapi content preview):

```bash
cd apps/mobile && pnpm web
```

## Mobile App

Navigate to the mobile directory:

```bash
cd apps/mobile
```

**First time setup** (or after native code changes):

```bash
pnpm mobile:setup            # generate .env.local (see Quick Start above)
pnpm android -d              # Android Emulator
pnpm ios -d                  # iOS Simulator
```

The `-d` flag allows you to select your device/emulator.

**Regular development**:

```bash
pnpm start       # Start the bundler
```

Or from root: `pnpm run dev`
