#!/usr/bin/env bash
set -euo pipefail
# Run E2E tests on a selected Android device/emulator (app must already be installed).
# Usage:
#   pnpm test:e2e:android:run        # Interactive with gum
#   pnpm test:e2e:android:run -a     # Auto mode: first available device, all tests

AUTO=0
[[ "${1:-}" == "-a" ]] && AUTO=1

[[ ! -d ".maestro" ]] && { echo "ERROR: .maestro directory not found. Run from apps/mobile/"; exit 1; }

DEVICES_RAW=$(adb devices | tail -n +2 | grep -v '^$' | grep 'device$')
[[ -z "$DEVICES_RAW" ]] && { echo "ERROR: No Android devices/emulators connected."; exit 1; }

DEVICES=$(echo "$DEVICES_RAW" | awk '{print $1}')

if [[ "$AUTO" == "1" ]]; then
  SELECTED=$(echo "$DEVICES" | head -1)
  echo "Using device: $SELECTED"
else
  command -v gum &>/dev/null || { echo "ERROR: gum not installed. Run: brew install gum"; exit 1; }
  SELECTED=$(echo "$DEVICES" | gum choose --header "Select a device/emulator:")
fi

TEST_FILES=$(find .maestro -name "*.yaml" -type f ! -name "config.yaml" | sort)
[[ -z "$TEST_FILES" ]] && { echo "ERROR: No test files found in .maestro/"; exit 1; }

export ANDROID_SERIAL="$SELECTED"

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
