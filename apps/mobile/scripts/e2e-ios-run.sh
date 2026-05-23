#!/usr/bin/env bash
set -euo pipefail
# Run E2E tests on a selected iOS simulator.
# Usage:
#   pnpm test:e2e:ios:run        # Interactive with gum (tests only, app must be installed)
#   pnpm test:e2e:ios:run -b     # Build first, then interactive test selection
#   pnpm test:e2e:ios:run -a     # Auto mode: first available device, all tests
#   pnpm test:e2e:ios:run -a -b  # Auto mode with build

AUTO=0
BUILD=0
for arg in "${@:-}"; do
  [[ "$arg" == "-a" ]] && AUTO=1
  [[ "$arg" == "-b" ]] && BUILD=1
done

[[ ! -d ".maestro" ]] && { echo "ERROR: .maestro directory not found. Run from apps/mobile/"; exit 1; }

ALL_DEVICES_RAW=$(xcrun simctl list devices available | awk '
  /^-- / { v=$0; sub(/^-- /, "", v); sub(/ --$/, "", v); version=v }
  /^[[:space:]]+.+(Booted|Shutdown)/ {
    line=$0; gsub(/^[[:space:]]+/, "", line)
    gsub(/[[:space:]]*\([A-F0-9-]+\)[[:space:]]*\(.*\)[[:space:]]*$/, "", line)
    status=""; if (index($0, "(Booted)")) status=" [Booted]"
    print line " (" version ")" status
  }')
BOOTED=$(echo "$ALL_DEVICES_RAW" | grep "\[Booted\]" || true)
SHUTDOWN=$(echo "$ALL_DEVICES_RAW" | grep -v "\[Booted\]" || true)
DEVICES=$(printf '%s\n%s' "$BOOTED" "$SHUTDOWN" | grep -v '^$' || true)

[[ -z "$DEVICES" ]] && { echo "ERROR: No iOS simulators found."; exit 1; }

if [[ "$AUTO" == "1" ]]; then
  SELECTED=$(echo "$DEVICES" | head -1)
  echo "Using: $SELECTED"
else
  command -v gum &>/dev/null || { echo "ERROR: gum not installed. Run: brew install gum"; exit 1; }
  SELECTED=$(echo "$DEVICES" | gum choose --header "Select a simulator:")
fi

DEVICE_NAME=$(echo "$SELECTED" | sed -E 's/ \(iOS [^)]+\)( \[Booted\])?$//')
UDID=$(xcrun simctl list devices available | grep "$DEVICE_NAME" | sed -E 's/.*\(([A-F0-9\-]+)\).*/\1/' | head -1)

xcrun simctl list devices available | grep "$DEVICE_NAME" | grep -q "(Booted)" || {
  echo "Booting simulator: $SELECTED"
  xcrun simctl boot "$UDID" 2>/dev/null || true
  sleep 3
}

TEST_FILES=$(find .maestro -name "*.yaml" -type f ! -name "config.yaml" | sort)
[[ -z "$TEST_FILES" ]] && { echo "ERROR: No test files found in .maestro/"; exit 1; }

export MAESTRO_DEVICE_UDID="$UDID"

if [[ "$BUILD" == "1" ]]; then
  echo "Running expo prebuild..."
  pnpm expo prebuild --platform ios --clean
  echo "Building and installing on simulator: $DEVICE_NAME"
  pnpm expo run:ios --device "$DEVICE_NAME" --configuration Release --no-build-cache
  sleep 5
fi

if [[ "$AUTO" == "1" ]]; then
  maestro test .maestro/ --format junit --output e2e-results.xml
else
  SELECTED_TEST=$(printf 'All tests\n%s' "$TEST_FILES" | gum choose --header "Select test to run:")
  if [[ "$SELECTED_TEST" == "All tests" ]]; then
    maestro test .maestro/ --format junit --output e2e-results.xml
  else
    maestro test "$SELECTED_TEST" --format junit --output e2e-results.xml
  fi
fi

echo "Done. Results written to e2e-results.xml"
