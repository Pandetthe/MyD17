# MyD17

A monorepo project for a React Native mobile application with Strapi CMS backend, using Turborepo for build orchestration and Docker Compose for local development environment.

## Project Structure

- **apps/mobile** - React Native app (Expo-based)
- **apps/strapi** - Strapi CMS backend
- **packages/eslint-config** - Shared ESLint configuration
- **packages/typescript-config** - Shared TypeScript configuration
- **packages/ui** - Shared UI components library

## Quick Start

### 1. Setup Environment

Copy the development environment templates:

```bash
cp .env.example.dev .env
cp apps/strapi/.env.example apps/strapi/.env
```

Edit `.env` and `apps/strapi/.env` if needed (default values should work for local development).

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

## Development

### Mobile App

Navigate to the mobile directory:

```bash
cd apps/mobile
```

**First time setup** (or after native code changes):

```bash
pnpm android -d  # For Android Emulator
pnpm ios -d      # For iOS Simulator
```

The `-d` flag allows you to select your device/emulator.

**Regular development**:

```bash
pnpm start       # Start the bundler
```

Or from root: `pnpm run dev`

---

## Releases

Releases are tag-based. Prepare a release commit with:

```bash
pnpm release:prepare 1.2.0 --changelog
```

Then create and push a tag named `v1.2.0`. The release workflow publishes the Strapi image to GHCR and attaches Android `.apk` and `.aab` files to the GitHub Release.

See [docs/release.md](docs/release.md) for the full release and deployment process.

---

### Strapi backend and PostgreSQL database in production environment

Create a `.env` file in the root directory and configure it based on `.env.example.prod`.
Replace all placeholder secrets before running a production environment.

From the root folder run

```bash
docker compose up --profile prod -d
```
