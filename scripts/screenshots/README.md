# App Store screenshots

Drives an app installed on an iOS simulator with XCUITest and saves full-screen PNGs at the
simulator's native resolution (iPhone 17 Pro Max = 1320x2868, the 6.9" App Store size).

## Run it

1. Build a **Release** simulator build (no Metro / dev-client launcher) and install it:
   `xcodebuild -workspace ios/App.xcworkspace -scheme App -configuration Release -destination "id=<UDID>" -derivedDataPath <dir> build`,
   then `xcrun simctl install <UDID> <dir>/Build/Products/Release-iphonesimulator/App.app`.
2. `APP_BUNDLE_ID=com.example.app DEMO_EMAIL=... DEMO_PASSWORD=... SIM_UDID=<UDID> scripts/screenshots/run.sh <out-dir>`

`run.sh` sets a clean 9:41 status bar, generates the Xcode project with `xcodegen`, runs the test
and clears the status bar. Credentials are only passed through the environment; never commit them.

## App preview video

`APP_BUNDLE_ID=... DEMO_EMAIL=... DEMO_PASSWORD=... scripts/screenshots/record.sh <out.mp4> RandomKnowledgePreviewTests`
builds the test, records the simulator with `simctl io recordVideo` while the paced flow runs, then
trims and encodes to H.264 1320x2868 @ 30fps with a silent audio track. Apple wants 15-30s.
Set `TRIM_START` (seconds) if the test runner's launch shows at the start.

## Adding an app

Add `Sources/<App>Tests.swift` with a `ScreenshotTestCase` subclass: use `tap("Label")`,
`element("Label")`, `waitFor`, `scrollTo` and `shot("01-name")`. Point at one flow with
`-only-testing:ScreenshotUITests/<App>Tests`. When a label can't be found the failure prints the
accessibility tree, which shows the exact labels to target.

Notes: the simulator runs headless on Xcode 27 (there is no Simulator.app), which is fine because
the test needs no window. Once a lesson-style app's daily state is consumed (quiz taken), a flow
must handle the "already done" state; see `RandomKnowledgeTests` for the pattern.
