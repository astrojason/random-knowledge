import type { Metadata } from "next";
import { LegalLayout, LegalList, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Daily Lesson",
  description: "How Daily Lesson collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "September 9, 2026";
const CONTACT_EMAIL = "jason@astrojason.com";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        Daily Lesson (&ldquo;the app,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a small,
        invite-only web app at{" "}
        <span className="font-medium text-fg-strong">daily-lesson.astrojason.com</span> that
        delivers a short AI-generated lesson and comprehension quiz each day. It is operated by
        Jason Sylvester. This policy explains what information the app collects, how it is used,
        and the choices you have.
      </p>

      <LegalSection heading="Information we collect">
        <p>When you sign in with Google, Firebase Authentication shares with us:</p>
        <LegalList
          items={[
            "Your Google account email address",
            "Your display name",
            "A unique account identifier (UID) assigned by Firebase",
          ]}
        />
        <p>
          We do not request or receive your Google password, contacts, files, or any data from
          other Google services (Gmail, Drive, Calendar, etc.). We only ask for the basic profile
          and email scopes needed to identify your account.
        </p>
        <p>As you use the app, we also store data you generate directly within it:</p>
        <LegalList
          items={[
            "Your access status (pending, approved, or revoked), since the app is invite-only",
            "Your daily lesson content, quiz answers, and completion state",
            "Your learning streak and category preferences",
            "A rolling history of recent lesson topics, used to avoid repeats",
          ]}
        />
        <p>
          We do not collect payment information, precise location, or any sensitive category of
          personal data.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <LegalList
          items={[
            "To authenticate you and keep you signed in across visits",
            "To determine whether you have been granted access to the app",
            "To generate, store, and display your daily lesson, quiz results, and streak",
            "To personalize which lesson categories you're shown",
            "To operate, maintain, and troubleshoot the app",
          ]}
        />
        <p>We do not use your data for advertising, and we do not sell or rent your data.</p>
      </LegalSection>

      <LegalSection heading="How your information is shared">
        <p>We share data only as needed to operate the app:</p>
        <LegalList
          items={[
            <>
              <span className="font-medium text-fg-strong">Firebase / Google Cloud</span> —
              authentication and all app data (accounts, lessons, streaks) are stored in Google
              Cloud Firestore, hosted by Google.
            </>,
            <>
              <span className="font-medium text-fg-strong">OpenAI</span> — the category name for
              your next lesson and a short list of recent lesson titles (topic titles only, never
              your name, email, or account ID) are sent to OpenAI&apos;s API to generate lesson
              text and quiz questions.
            </>,
            <>
              <span className="font-medium text-fg-strong">Aggregate usage tracker</span> — a
              small internal service records the total number of AI tokens used per day, across
              all users, to enforce a shared daily budget. It never receives your personal
              information.
            </>,
          ]}
        />
        <p>
          We do not share your personal information with any other third party, and we do not
          share Google user data with any advertising or data-broker service.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention and deletion">
        <p>
          We retain your account and lesson data for as long as your account is active. If you
          would like your account and all associated data deleted, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:opacity-85">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will delete it within 30 days. Revoking your access to the app does not itself
          delete your stored data — a deletion request is required.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Data is transmitted over encrypted connections (HTTPS) and stored in Google Cloud
          Firestore, protected by access rules that restrict reads and writes to your own signed-in
          account. Administrative access to the underlying Firebase project is limited to the
          app&apos;s operator.
        </p>
      </LegalSection>

      <LegalSection heading="Children's privacy">
        <p>
          Daily Lesson is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has provided us with
          personal information, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <LegalList
          items={[
            "You can sign out at any time from within the app.",
            <>
              You can request a copy of, or the deletion of, your data at any time by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:opacity-85">
                {CONTACT_EMAIL}
              </a>
              .
            </>,
            "You can revoke Daily Lesson's access to your Google account at any time from your Google Account settings, under Third-party apps & services.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we make material changes to this policy, we will update the effective date above.
          Continued use of the app after a change constitutes acceptance of the revised policy.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy or your data can be sent to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:opacity-85">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
