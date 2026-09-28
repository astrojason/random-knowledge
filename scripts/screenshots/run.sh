#!/usr/bin/env bash
# Drives an installed app on a booted simulator and saves App Store screenshots.
#
# Usage: APP_BUNDLE_ID=com.example.app DEMO_EMAIL=... DEMO_PASSWORD=... \
#          scripts/screenshots/run.sh <out-dir> [-only-testing:ScreenshotUITests/SomeTests]
#
# The app must already be installed on the simulator (Release build recommended so no
# Metro/dev-client launcher gets in the way). Pick the device by size: iPhone 17 Pro Max
# produces the 6.9" (1320x2868) set. Set SIM_UDID to override the booted device.
# Any extra env vars your flow needs (e.g. DEMO_PASSWORD) are forwarded to the test runner.
set -euo pipefail

OUT_DIR="${1:?usage: run.sh <out-dir> [xcodebuild args]}"
shift
: "${APP_BUNDLE_ID:?set APP_BUNDLE_ID}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIM_UDID="${SIM_UDID:-booted}"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

# Clean status bar (9:41, full battery/signal), as in Apple's own screenshots.
xcrun simctl status_bar "$SIM_UDID" override --time 9:41 --batteryState charged \
  --batteryLevel 100 --cellularMode active --cellularBars 4 --wifiBars 3

cd "$HERE"
xcodegen generate --quiet

# xcodebuild forwards TEST_RUNNER_<NAME> into the test process as <NAME>.
export TEST_RUNNER_APP_BUNDLE_ID="$APP_BUNDLE_ID"
export TEST_RUNNER_SCREENSHOT_DIR="$OUT_DIR"
for var in DEMO_EMAIL DEMO_PASSWORD; do
  if [[ -n "${!var:-}" ]]; then export "TEST_RUNNER_$var=${!var}"; fi
done

DEST_ID="$SIM_UDID"
if [[ "$DEST_ID" == "booted" ]]; then
  DEST_ID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-F-]{36}' | head -1)"
fi

xcodebuild test -project Screenshots.xcodeproj -scheme Screenshots \
  -destination "id=$DEST_ID" -derivedDataPath "${DERIVED_DATA:-$HERE/.build}" "$@"

xcrun simctl status_bar "$SIM_UDID" clear
echo "Screenshots in $OUT_DIR"
