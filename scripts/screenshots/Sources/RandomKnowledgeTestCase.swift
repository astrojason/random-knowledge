import XCTest

/// Random Knowledge navigation helpers shared by the screenshot and app-preview flows.
/// Extra env: DEMO_EMAIL, DEMO_PASSWORD (a pre-approved account).
class RandomKnowledgeTestCase: ScreenshotTestCase {
    func signInIfNeeded() throws {
        guard element("Sign in with email").waitForExistence(timeout: 20) else { return }
        let email = try requiredEnv("DEMO_EMAIL")
        let password = try requiredEnv("DEMO_PASSWORD")
        tap("Sign in with email")
        let emailField = waitFor(app.textFields.firstMatch, "email field")
        emailField.tap()
        emailField.typeText(email)
        let passwordField = app.secureTextFields.firstMatch
        passwordField.tap()
        passwordField.typeText(password)
        tap("Sign in")
    }

    /// A new account picks its categories first; an existing one goes straight to the lesson.
    func pickCategoriesIfAsked() {
        let picker = element("What would you like to learn?")
        let lessonReady = element("Take the quick check")
        let done = element("Your answers")
        let deadline = Date().addingTimeInterval(60)
        while !picker.exists && !lessonReady.exists && !done.exists && Date() < deadline { Thread.sleep(forTimeInterval: 1) }
        if picker.exists {
            shot("00-categories-first-run")
            tap("Start learning")
        }
    }

    enum LessonState { case quizPending, quizDone }

    /// First load of the day generates the lesson, which can take a while, and the generator's
    /// output validation occasionally rejects a draft — retry like a user would.
    func waitForLesson(attempts: Int) -> LessonState {
        let quizButton = element("Take the quick check")
        let results = element("Your answers")
        let retryButton = element("Try again")
        for attempt in 1...attempts {
            let deadline = Date().addingTimeInterval(120)
            while !quizButton.exists && !results.exists && !retryButton.exists && Date() < deadline {
                Thread.sleep(forTimeInterval: 1)
            }
            if quizButton.exists { return .quizPending }
            if results.exists { return .quizDone }
            if !retryButton.exists { fail("Timed out waiting for the lesson") }
            print("Lesson generation failed (attempt \(attempt) of \(attempts)); retrying")
            retryButton.tap()
        }
        fail("No lesson after \(attempts) attempts")
    }

    /// Answers every question with the first option, capturing the feedback state once.
    func answerQuiz() {
        for question in 1...3 {
            waitFor(element("Question \(question) of 3"), timeout: 10, "question \(question)")
            firstQuizOption().tap()
            if question == 1 { shot("04-quiz-answer") }
            tap("Continue", timeout: 10)
        }
    }

    /// The answer options are unlabelled containers stacked between the question text and the
    /// "I don't remember" link, so pick the first tall-enough element above that link.
    func firstQuizOption() -> XCUIElement {
        let counter = waitFor(element(containing: "Question "), timeout: 10, "the question counter")
        let skip = waitFor(element("I don't remember"), timeout: 10, "the \"I don't remember\" link")
        let options = app.otherElements.allElementsBoundByIndex.filter {
            $0.frame.minY > counter.frame.maxY && $0.frame.maxY < skip.frame.minY
                && (30...90).contains($0.frame.height) && !$0.label.isEmpty
        }
        guard let first = options.min(by: { $0.frame.minY < $1.frame.minY }) else { fail("No quiz options found") }
        return first
    }

    func scrollTo(_ target: XCUIElement, _ what: String) {
        for _ in 0..<15 {
            if target.exists && target.isHittable { return }
            app.swipeUp()
        }
        fail("Could not scroll to \(what)")
    }

    func scrollToTop() {
        for _ in 0..<15 { app.swipeDown(velocity: .fast) }
    }
}
