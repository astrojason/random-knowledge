export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-fg-muted">
      <div>Couldn&apos;t load today&apos;s lesson.</div>
      <div className="text-[13px] text-rust">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85"
      >
        Try again
      </button>
    </div>
  );
}
