"use client";

import { useParams } from "next/navigation";
import { AccessGate } from "@/components/AccessGate";
import { QuizReview } from "@/components/lesson/QuizReview";
import { LoadState, PageFrame } from "@/components/share/PageFrame";
import { SavedLesson } from "@/components/share/SavedLesson";
import { ShareLessonButton } from "@/components/share/ShareButton";
import { useAuth } from "@/lib/auth-context";
import { formatDateLabel } from "@/lib/date";
import { getLesson, getProgress } from "@/lib/firestore";
import { useLoad } from "@/lib/useLoad";

function PastLesson({ uid, date }: { uid: string; date: string }) {
  const state = useLoad(`lesson-${uid}-${date}`, async () => {
    const [lesson, progress] = await Promise.all([getLesson(uid, date), getProgress(uid, date)]);
    return lesson && { lesson, progress };
  });

  return (
    <LoadState state={state} notFound="That lesson isn't in your history.">
      {({ lesson, progress }) => (
        <SavedLesson lesson={lesson} byline={formatDateLabel(date)} actions={<ShareLessonButton lesson={lesson} date={date} />}>
          {progress?.answers && <QuizReview lesson={lesson} answers={progress.answers} />}
        </SavedLesson>
      )}
    </LoadState>
  );
}

export default function LessonPage() {
  const { user } = useAuth();
  const { date } = useParams<{ date: string }>();
  return (
    <AccessGate>
      <PageFrame>{user && <PastLesson uid={user.uid} date={date} />}</PageFrame>
    </AccessGate>
  );
}
