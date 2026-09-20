import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/lesson/Card";
import { LoadingView } from "@/components/lesson/LoadingView";

const linkClass = "text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10">
      <Card>
        <nav className="mb-5 flex gap-4 border-b border-border pb-3.5">
          <Link href="/" className={linkClass}>Today&apos;s lesson</Link>
          <Link href="/library" className={linkClass}>Library</Link>
        </nav>
        {children}
      </Card>
    </div>
  );
}

/** Loading / error / not-found handling shared by every page that loads a single lesson. */
export function LoadState<T>({
  state,
  notFound,
  children,
}: {
  state: { loading: boolean; data: T | null; error: string | null };
  notFound: string;
  children: (data: T) => ReactNode;
}) {
  if (state.loading) return <LoadingView text="Loading" />;
  if (state.error) return <p role="alert" className="py-8 text-center text-sm text-rust">{state.error}</p>;
  if (!state.data) return <p className="py-8 text-center text-sm text-fg-muted">{notFound}</p>;
  return <>{children(state.data)}</>;
}
