import ThemeToggle from "@/components/ThemeToggle";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatDateLabel } from "@/lib/date";
import type { StreakData } from "@/lib/types";

export function Header({
  date,
  streak,
  category,
  onSignOut,
}: {
  date: string;
  streak: StreakData;
  category?: CategoryKey;
  onSignOut: () => void;
}) {
  return (
    <div className="mb-5 border-b border-border pb-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-fg-muted">{formatDateLabel(date)}</span>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-rust">
            {streak.streak > 0 ? `${streak.streak} day streak` : "Start your streak"}
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
          >
            Sign out
          </button>
        </div>
      </div>
      {category && (
        <span className="mt-3.5 inline-block rounded-sm bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {CATEGORIES[category]}
        </span>
      )}
    </div>
  );
}
