import Link from "next/link";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-accent hover:opacity-85">
          ← Daily Lesson
        </Link>

        <div className="mt-6 rounded-md border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="font-heading text-2xl font-bold text-fg-strong">{title}</h1>
          <p className="mt-1 text-sm text-fg-muted">Effective {effectiveDate}</p>

          <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-fg">
            {children}
          </div>

          <nav className="mt-10 flex gap-4 border-t border-border pt-6 text-sm">
            <Link href="/privacy" className="text-accent hover:opacity-85">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-accent hover:opacity-85">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-heading text-lg font-semibold text-fg-strong">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
