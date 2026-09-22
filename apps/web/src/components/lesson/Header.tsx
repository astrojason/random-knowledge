import { HeaderMenu } from "@/components/lesson/HeaderMenu";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatDateLabel } from "@/lib/date";

export function Header({
  date,
  streakCount,
  category,
  showAdminLink,
  showCategoriesSetting,
  categoryCount,
  onEditCategories,
  onSignOut,
}: {
  date: string;
  streakCount: number;
  category?: CategoryKey;
  showAdminLink?: boolean;
  showCategoriesSetting: boolean;
  categoryCount: number;
  onEditCategories: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="mb-5 border-b border-border pb-3.5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <HeaderMenu
            showAdminLink={showAdminLink}
            showCategoriesSetting={showCategoriesSetting}
            categoryCount={categoryCount}
            onEditCategories={onEditCategories}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-fg-muted">{formatDateLabel(date)}</span>
            {streakCount > 0 && (
              <span
                aria-label={`${streakCount} ${streakCount === 1 ? "day" : "days"} streak`}
                className="flex items-center gap-0.5 text-xs font-semibold text-accent"
              >
                <FlameIcon className="size-3.5" />
                {streakCount}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
        >
          Sign out
        </button>
      </div>
      {category && (
        <span className="mt-3.5 inline-block rounded-sm bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {CATEGORIES[category]}
        </span>
      )}
    </div>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.5c.4 2.3-.6 3.7-1.9 5.1-1.4 1.5-3 3.2-3 5.9a4.9 4.9 0 0 0 9.8 0c0-1.7-.7-2.9-1.5-3.9-.1.9-.5 1.7-1.2 2.3.2-2.4-.7-3.7-2.2-6.1Zm0 5.6c1 1.5 1.5 2.6 1.4 3.9a1.9 1.9 0 1 1-3.7-.4c.1-1.5 1.1-2.4 2.3-3.5Z" />
    </svg>
  );
}
