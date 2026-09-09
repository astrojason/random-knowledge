import Link from "next/link";

export function AdminLink() {
  return (
    <Link
      href="/admin"
      className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
    >
      Manage access
    </Link>
  );
}
