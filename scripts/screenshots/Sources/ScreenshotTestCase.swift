import XCTest

/// Shared plumbing for App Store screenshot flows. Subclass it in one file per app,
/// launch the app under test by bundle id, and call `shot("01-name")` at each screen.
///
/// Configured through environment variables (xcodebuild forwards `TEST_RUNNER_*` vars
/// with the prefix stripped — `run.sh` does that for you):
///   APP_BUNDLE_ID   bundle id of the already-installed app to drive
///   SCREENSHOT_DIR  directory the PNGs are written to
class ScreenshotTestCase: XCTestCase {
    var app: XCUIApplication!
    private var outputDir: URL!

    var env: [String: String] { ProcessInfo.processInfo.environment }

    func requiredEnv(_ key: String) throws -> String {
        guard let value = env[key], !value.isEmpty else {
            throw XCTSkip("Missing required environment variable \(key)")
        }
        return value
    }

    override func setUpWithError() throws {
        continueAfterFailure = false
        outputDir = URL(fileURLWithPath: try requiredEnv("SCREENSHOT_DIR"), isDirectory: true)
        try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
        app = XCUIApplication(bundleIdentifier: try requiredEnv("APP_BUNDLE_ID"))
        app.launch()
    }

    /// Any element (button, link, static text, ...) whose accessibility label matches exactly.
    func element(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
    }

    /// Any element whose label contains the text.
    func element(containing text: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", text)).firstMatch
    }

    @discardableResult
    func waitFor(_ element: XCUIElement, timeout: TimeInterval = 30, _ what: String) -> XCUIElement {
        if !element.waitForExistence(timeout: timeout) { fail("Timed out waiting for \(what)") }
        return element
    }

    func tap(_ label: String, timeout: TimeInterval = 30) {
        waitFor(element(label), timeout: timeout, "\"\(label)\"").tap()
    }

    /// Saves a full-screen PNG as `<name>.png` in SCREENSHOT_DIR, after letting animations settle.
    func shot(_ name: String) {
        Thread.sleep(forTimeInterval: 1.0)
        let png = XCUIScreen.main.screenshot().pngRepresentation
        do {
            try png.write(to: outputDir.appendingPathComponent("\(name).png"))
        } catch {
            fail("Could not write screenshot \(name): \(error)")
        }
    }

    /// Fails the test and prints the accessibility tree, so a missing label is easy to diagnose.
    func fail(_ message: String) -> Never {
        print("=== \(message) ===\n\(app.debugDescription)")
        XCTFail(message)
        fatalError(message)
    }
}
