#!/usr/bin/env bash
# Records an App Store app preview video of an XCUITest flow running on a booted simulator.
#
# Usage: APP_BUNDLE_ID=com.example.app DEMO_EMAIL=... DEMO_PASSWORD=... \
#          scripts/screenshots/record.sh <out.mp4> <XCTest class, e.g. RandomKnowledgePreviewTests>
#
# Same prerequisites as run.sh (installed Release build). The test is built first so the recording
# doesn't include compile time; TRIM_START (default 2s) cuts the test runner's launch from the front.
# Output is H.264 1320x2868 @ 30fps with a silent stereo AAC track (App Store Connect wants audio).
set -euo pipefail

OUT="${1:?usage: record.sh <out.mp4> <test-class>}"
TEST_CLASS="${2:?usage: record.sh <out.mp4> <test-class>}"
: "${APP_BUNDLE_ID:?set APP_BUNDLE_ID}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SIM_UDID="${SIM_UDID:-booted}"
DEST_ID="$SIM_UDID"
if [[ "$DEST_ID" == "booted" ]]; then
  DEST_ID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-F-]{36}' | head -1)"
fi
mkdir -p "$(dirname "$OUT")"
RAW="$(mktemp -d)/raw.mov"

xcrun simctl status_bar "$DEST_ID" override --time 9:41 --batteryState charged \
  --batteryLevel 100 --cellularMode active --cellularBars 4 --wifiBars 3

cd "$HERE"
xcodegen generate --quiet
export TEST_RUNNER_APP_BUNDLE_ID="$APP_BUNDLE_ID"
export TEST_RUNNER_SCREENSHOT_DIR="$(dirname "$RAW")"
for var in DEMO_EMAIL DEMO_PASSWORD; do
  if [[ -n "${!var:-}" ]]; then export "TEST_RUNNER_$var=${!var}"; fi
done
XCB=(-project Screenshots.xcodeproj -scheme Screenshots -destination "id=$DEST_ID" -derivedDataPath "${DERIVED_DATA:-$HERE/.build}")

xcodebuild build-for-testing "${XCB[@]}" -quiet

xcrun simctl io "$DEST_ID" recordVideo --codec=h264 --force "$RAW" &
REC_PID=$!
cleanup() { kill -INT "$REC_PID" 2>/dev/null || true; wait "$REC_PID" 2>/dev/null || true; xcrun simctl status_bar "$DEST_ID" clear; }
trap cleanup EXIT
sleep 1

xcodebuild test-without-building "${XCB[@]}" -only-testing:"ScreenshotUITests/$TEST_CLASS"

cleanup; trap - EXIT
ffmpeg -y -loglevel error -ss "${TRIM_START:-2}" -i "$RAW" -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -vf "scale=1320:2868,fps=30" -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 \
  -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT"
echo "Preview saved to $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s)"
