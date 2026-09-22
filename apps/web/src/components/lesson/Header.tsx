import { HeaderMenu } from "@/components/lesson/HeaderMenu";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatDateLabel } from "@/lib/date";

export function Header({
  date,
  category,
  showAdminLink,
  showCategoriesSetting,
  categoryCount,
  onEditCategories,
  onSignOut,
}: {
  date: string;
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
        <span className="text-[13px] text-fg-muted">{formatDateLabel(date)}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
          >
            Sign out
          </button>
          <HeaderMenu
            showAdminLink={showAdminLink}
            showCategoriesSetting={showCategoriesSetting}
            categoryCount={categoryCount}
            onEditCategories={onEditCategories}
          />
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
