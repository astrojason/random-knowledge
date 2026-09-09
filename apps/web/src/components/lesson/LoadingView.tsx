export function LoadingView({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-fg-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-rust" />
      <div>{text}</div>
    </div>
  );
}
