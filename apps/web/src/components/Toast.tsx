"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const TOAST_MS = 4000;

type ShowToast = (message: string) => void;

// Outside a provider (e.g. a component rendered alone) showing a toast is a no-op rather than an error.
const ToastContext = createContext<ShowToast>(() => {});

/** Returns a function that floats a short confirmation in the bottom right corner. */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-sm border border-border border-l-4 border-l-accent bg-surface px-4 py-2.5 text-sm text-fg shadow-lg">
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
