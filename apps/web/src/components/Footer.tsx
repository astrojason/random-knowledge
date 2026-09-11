import packageJson from "../../package.json";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-6 text-center text-xs text-fg-muted">
      Random Knowledge v{packageJson.version}
    </footer>
  );
}
