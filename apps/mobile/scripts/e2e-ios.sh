#!/usr/bin/env bash
set -euo pipefail
# Run E2E tests on iOS from scratch (prebuild → simulator build → all tests).
# Usage:
#   pnpm test:e2e:ios
#   SIMULATOR_NAME="iPhone 16" pnpm test:e2e:ios

SIMULATOR="${SIMULATOR_NAME:-iPhone 15}"

if ! xcrun simctl list devices | grep -q "$SIMULATOR"; then
  echo "ERROR: Simulator '$SIMULATOR' not found."
  xcrun simctl list devices available | grep -E '^\s+[A-Z]' | head -10
  exit 1
fi

SIMULATOR_UDID=$(xcrun simctl list devices | grep "$SIMULATOR" | grep -oE '\([A-F0-9-]+\)' | tr -d '()' | head -1)

SIM_STATE=$(xcrun simctl list | grep "$SIMULATOR_UDID" | grep -oE '(Booted|Shutdown)' | head -1 || echo "Shutdown")
if [[ "$SIM_STATE" == "Booted" ]]; then
  echo "Simulator already running."
else
  echo "Starting simulator: $SIMULATOR"
  open -a Simulator --args -CurrentDeviceUDID "$SIMULATOR_UDID" &
  echo "Waiting for boot..."
  while ! xcrun simctl list | grep "$SIMULATOR_UDID" | grep -q "Booted"; do sleep 1; done
  sleep 3
fi

echo "Running expo prebuild..."
pnpm expo prebuild --platform ios --clean

echo "Building and running on simulator..."
pnpm expo run:ios --device "$SIMULATOR" --configuration Release --no-build-cache

sleep 5

echo "Running Maestro tests..."
maestro test .maestro/ --format junit --output e2e-results.xml

echo "Done. Results written to e2e-results.xml"
