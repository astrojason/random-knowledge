import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { AdminLink } from "@/components/AdminLink";
import { StreakStatus } from "@/components/lesson/StreakStatus";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatDateLabel } from "@/lib/date";
import type { StreakData } from "@/lib/types";

export function Header({
  date,
  streak,
  category,
  showAdminLink,
  onSignOut,
  showStreak = true,
}: {
  date: string;
  streak: StreakData;
  category?: CategoryKey;
  showAdminLink?: boolean;
  onSignOut: () => void;
  showStreak?: boolean;
}) {
  return (
    <div className="mb-5 border-b border-border pb-3.5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[13px] text-fg-muted">{formatDateLabel(date)}</span>
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
          >
            Library
          </Link>
          {showAdminLink && <AdminLink />}
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
      {showStreak && <StreakStatus streak={streak} date={date} />}
      {category && (
        <span className="mt-3.5 inline-block rounded-sm bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {CATEGORIES[category]}
        </span>
      )}
    </div>
  );
}
