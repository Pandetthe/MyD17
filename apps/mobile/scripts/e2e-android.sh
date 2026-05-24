#!/usr/bin/env bash
set -euo pipefail
# Run E2E tests on Android from scratch (prebuild → release APK → all tests).
# Usage:
#   pnpm test:e2e:android
#   AVD_NAME=Pixel_8_API_34 pnpm test:e2e:android

AVD="${AVD_NAME:-$(emulator -list-avds 2>/dev/null | head -1)}"
if [[ -z "$AVD" ]]; then
  echo "ERROR: No Android Virtual Device found. Create one in Android Studio."
  exit 1
fi

if adb devices 2>/dev/null | grep -q "emulator.*device"; then
  echo "Emulator already running."
else
  echo "Starting emulator: $AVD"
  emulator -avd "$AVD" -no-window -no-audio &
  adb wait-for-device shell 'while [[ "$(getprop sys.boot_completed)" != "1" ]]; do sleep 1; done'
  sleep 3
fi

echo "Running expo prebuild..."
pnpm expo prebuild --platform android --clean

echo "Building release APK..."
pushd android > /dev/null
./gradlew assembleRelease
popd > /dev/null

APK="android/app/build/outputs/apk/release/app-release.apk"
echo "Installing APK: $APK"
adb install -r "$APK"

echo "Running Maestro tests..."
maestro test .maestro/ --format junit --output e2e-results.xml

echo "Done. Results written to e2e-results.xml"
