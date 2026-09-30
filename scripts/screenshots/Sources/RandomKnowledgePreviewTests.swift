import XCTest

/// Paced walkthrough for the App Store app preview video (recorded by `record.sh`, 15-30s).
/// Signs in, then lesson -> quiz -> results. Stops after results so the clip ends on the streak.
final class RandomKnowledgePreviewTests: RandomKnowledgeTestCase {
    func testPreviewWalkthrough() throws {
        try signInIfNeeded()
        pickCategoriesIfAsked()

        if waitForLesson(attempts: 4) == .quizPending {
            pause(2.5)
            app.swipeUp(velocity: .slow)
            pause(2)
            tap("Take the quick check")
            for question in 1...3 {
                waitFor(element("Question \(question) of 3"), timeout: 10, "question \(question)")
                pause(1.5)
                firstQuizOption().tap()
                pause(1.5)
                tap("Continue", timeout: 10)
            }
        }

        scrollTo(element("Your answers"), "the answer review")
        pause(2)
        scrollTo(element(containing: "in your streak"), "the streak card")
        pause(3)
    }

    /// Holds the current screen so the recording shows it.
    private func pause(_ seconds: TimeInterval) { Thread.sleep(forTimeInterval: seconds) }
}
