# Testing

## Unit & integration tests (Jest)

### Apps

The monorepo has two apps with Jest suites:

| App | Test command | Notes |
|---|---|---|
| `apps/strapi` | `pnpm --filter strapi test` | Node environment, `ts-jest`, integration tests hit a real DB |
| `apps/mobile` | `pnpm --filter mobile test` | `jest-expo` preset, React Native component and hook tests |

### Run all tests

```bash
pnpm test
```

Runs both suites in parallel via Turborepo.

### Run a single app

```bash
pnpm --filter strapi test
pnpm --filter mobile test
```

### Run a single file or pattern

```bash
pnpm --filter strapi test postController
pnpm --filter mobile test TagFilterBar
```

### Coverage

```bash
pnpm --filter strapi test --coverage
pnpm --filter mobile test --coverage
```

Coverage is collected from `src/**/*.{ts,tsx}`, excluding type declarations and route files (`src/app/**` for mobile).

### Test file locations

- **Strapi** - `apps/strapi/src/**/__tests__/*.test.ts`
- **Mobile** - `apps/mobile/src/**/__tests__/*.test.ts(x)` and `*.test.ts(x)` next to the source file

---

## Load testing (k6)

### Prerequisites

- [mise](https://mise.jdx.dev/) installed - k6 is declared in `mise.toml`
- Strapi running (locally or on a remote server)

```bash
mise install   # installs k6 if not already present
```

### Scripts

| Script | Target | Scenario |
|---|---|---|
| `pnpm run load:stress` | `http://localhost:1337` | stress |
| `pnpm run load:staging:smoke` | `https://myd17.quiddity.icu` | smoke |
| `pnpm run load:staging:test` | `https://myd17.quiddity.icu` | load |
| `pnpm run load:staging:stress` | `https://myd17.quiddity.icu` | stress |

### Running locally

1. Start Strapi:

```bash
pnpm --filter strapi dev
```

2. Once Strapi is up on port 1337, run the test:

```bash
pnpm run load:stress
```

### Running against a remote server

Use the `BASE_URL` env var to point k6 at any server and pass the scenario with `-e SCENARIO=`:

```bash
BASE_URL=https://your-server.example.com k6 run k6/main.js -e SCENARIO=stress
```

Or use one of the predefined staging scripts above.

### Scenarios

| Scenario | Stages | Thresholds |
|---|---|---|
| `smoke` | 30 s → 1 VU | p95 < 500 ms, error rate < 1 % |
| `load` | 1 m ramp to 30, hold 3 m, 1 m ramp down | p95 < 1500 ms, error rate < 1 % |
| `stress` | 30 s → 50 VU, 1 m → 100 VU, 30 s → 0 | p95 < 6000 ms, error rate < 5 % |

Each VU iteration simulates: browse feed → read a post → view information page.

---

## Security testing (ZAP + API checks)

### Prerequisites

- Docker installed and running
- Strapi running and reachable
- Python 3 available (used to patch the OpenAPI spec before ZAP runs)

### ZAP scan

The script `security/scripts/run-zap.sh` pulls the official ZAP Docker image and runs an automated scan against the API.

#### Baseline scan (passive - safe for any environment)

```bash
./security/scripts/run-zap.sh baseline
```

Passive scan: observes traffic, no attack payloads sent.

#### Full scan (active - destructive, use only against a disposable environment)

```bash
./security/scripts/run-zap.sh full
```

The script will prompt for confirmation before running. Active scan sends real attack payloads.

#### Custom target

```bash
TARGET_URL=https://your-server.example.com ./security/scripts/run-zap.sh baseline
```

#### Custom credentials

```bash
ZAP_AUTH_USER=user@example.com ZAP_AUTH_PASS=secret ./security/scripts/run-zap.sh baseline
```

Default credentials are the seeded dev user (`jan.nowak@example.com` / `SecurePassword123!`).

#### Reports

Reports are written to `security/reports/` as both HTML and JSON after each run.

### API security checks

`security/scripts/api-security-checks.sh` runs a suite of lightweight OWASP API Top 10 checks using plain `curl` - no Docker required.

```bash
./security/scripts/api-security-checks.sh
```

Custom target:

```bash
TARGET_URL=https://your-server.example.com ./security/scripts/api-security-checks.sh
```

Checks covered:

- **API1** - BOLA: unauthenticated user enumeration
- **API2** - Broken authentication: JWT `alg:none`, brute-force rate limiting, admin panel exposure
- **API3** - Mass assignment on the like endpoint
- **API6** - Like endpoint spam (no auth, no rate limit)
- **API8** - Security headers, CORS misconfiguration, OpenAPI/Swagger public exposure, default credentials
