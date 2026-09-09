import type { Lesson } from "@/lib/types";

export function DeepLinks({ lesson }: { lesson: Lesson }) {
  if (!lesson.wikiQuery && !lesson.youtubeQuery) return null;

  return (
    <div className="mb-4 mt-1 flex flex-wrap gap-4">
      {lesson.wikiQuery && (
        <a
          className="border-b border-accent/35 text-[13px] font-medium text-accent hover:border-accent"
          href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(lesson.wikiQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go deeper on Wikipedia
        </a>
      )}
      {lesson.youtubeQuery && (
        <a
          className="border-b border-rust/35 text-[13px] font-medium text-rust hover:border-rust"
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.youtubeQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Find a YouTube explainer
        </a>
      )}
    </div>
  );
}
