import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Support — Random Knowledge",
  description: "Get help with Random Knowledge, including access, sign-in, streaks, and your data.",
};

function EmailLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:opacity-85">
      {CONTACT_EMAIL}
    </a>
  );
}

export default function SupportPage() {
  return (
    <LegalLayout title="Support">
      <p>
        Random Knowledge is a small, independently run app. For any question, bug report, or
        request, email <EmailLink /> and you&apos;ll get a reply from a real person.
      </p>

      <LegalSection heading="I signed in and see &ldquo;Access requested&rdquo;">
        <p>
          Random Knowledge is invite-only. Signing in creates an access request that has to be
          approved before you can see your lesson. Once it&apos;s approved, reopen the app and
          today&apos;s lesson will appear. If you&apos;ve been waiting a while, email us from the
          address you signed in with.
        </p>
      </LegalSection>

      <LegalSection heading="I can't sign in">
        <p>
          You can sign in with Apple, Google, or email. Use the same method each time, because
          each one is a separate account. If it still fails, email us with the sign-in method you
          used and any error message you saw.
        </p>
      </LegalSection>

      <LegalSection heading="How does my streak work?">
        <p>
          Finishing the quiz for the day adds one to your streak. Missing a single day doesn&apos;t
          break it, but missing two days in a row resets it to 1.
        </p>
      </LegalSection>

      <LegalSection heading="My lesson didn't load">
        <p>
          Check your connection and reopen the app. A new lesson is generated the first time you
          open the app each day. If it keeps failing, email us and include the error shown on
          screen.
        </p>
      </LegalSection>

      <LegalSection heading="Delete my account or data">
        <p>
          Email <EmailLink /> from the address you signed in with and we will delete your account
          and all associated data within 30 days. See the{" "}
          <Link href="/privacy" className="text-accent hover:opacity-85">
            Privacy Policy
          </Link>{" "}
          for what we store.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
