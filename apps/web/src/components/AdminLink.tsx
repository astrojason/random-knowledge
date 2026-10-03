import Link from "next/link";

export function AdminLink() {
  return (
    <Link
      href="/admin"
      className="text-sm font-medium text-fg hover:text-accent"
    >
      Admin
    </Link>
  );
}
