import XCTest

/// Screenshot flow for Random Knowledge.
///
/// Works from any account state: a new account picks categories first, and once today's quiz has
/// been taken the app opens straight on the results, so the lesson and quiz shots are skipped then.
final class RandomKnowledgeTests: RandomKnowledgeTestCase {
    func testCaptureScreens() throws {
        try signInIfNeeded()
        pickCategoriesIfAsked()

        if waitForLesson(attempts: 4) == .quizPending {
            shot("01-lesson")
            app.swipeUp()
            shot("02-lesson-body")
            tap("Take the quick check")
            shot("03-quiz")
            answerQuiz()
        }

        // The results sit below the lesson text on the same page.
        scrollTo(element("Your answers"), "the answer review")
        shot("05-review")
        scrollTo(element(containing: "in your streak"), "the streak card")
        shot("06-streak")

        // The category picker is also reachable from the menu once categories are saved.
        scrollToTop()
        tap("Open menu")
        tap(element(containing: "My categories").label)
        waitFor(element("What would you like to learn?"), timeout: 10, "the category picker")
        shot("07-categories")

        // Sign out last, so the sign-in screen can be captured without any leftover overlays.
        tap("Cancel")
        tap("Sign out")
        waitFor(element("Sign in with email"), timeout: 15, "the sign-in screen")
        shot("00-sign-in")
    }
}
