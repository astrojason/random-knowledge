import type { Lesson } from "@/lib/types";

export function LessonBody({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <h1 className="mb-4 max-w-[34ch] font-heading text-[26px] font-bold leading-snug text-fg-strong">
        {lesson.title}
      </h1>
      <div className="mb-1 max-w-[62ch] font-heading text-[16.5px] leading-relaxed text-fg">
        {lesson.body.map((paragraph, i) => (
          <p key={i} className="mb-3.5">
            {paragraph}
            {lesson.paragraphSources?.[i]?.map((id) => {
              const source = lesson.sources?.[id - 1];
              return source ? (
                <a key={id} href={source.url} target="_blank" rel="noopener noreferrer" title={source.title} aria-label={`Source ${id}: ${source.title}`} className="ml-1 text-xs font-semibold text-accent underline">
                  [{id}]
                </a>
              ) : null;
            })}
          </p>
        ))}
      </div>
      {lesson.sources?.length ? (
        <div className="my-4 border-t border-border pt-3">
          <h2 className="mb-2 text-xs font-semibold text-fg-muted">Sources</h2>
          <ol className="list-inside list-decimal space-y-1 text-xs text-accent">
            {lesson.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words underline">{source.title}</a>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="my-3 text-xs text-fg-muted">This saved lesson predates source checks and has no source references.</p>
      )}
    </div>
  );
}
