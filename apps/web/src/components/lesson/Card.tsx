import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface px-9 pb-7 pt-8 shadow-sm">
      {children}
    </div>
  );
}
