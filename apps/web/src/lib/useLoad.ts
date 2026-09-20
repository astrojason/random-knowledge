"use client";

import { useEffect, useRef, useState } from "react";

type Loaded<T> = { key: string; data: T } | { key: string; error: string };

/** Loads one async value keyed by `key`, reloading when the key changes and surfacing (and logging) failures. */
export function useLoad<T>(key: string, load: () => Promise<T>) {
  const [result, setResult] = useState<Loaded<T> | null>(null);
  const latestLoad = useRef(load);

  useEffect(() => {
    latestLoad.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    latestLoad.current()
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      .catch((err) => {
        console.error(`useLoad(${key}) failed:`, err);
        if (!cancelled) setResult({ key, error: err instanceof Error ? err.message : "Something went wrong." });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = result?.key === key ? result : null;
  return {
    loading: !current,
    data: current && "data" in current ? current.data : null,
    error: current && "error" in current ? current.error : null,
  };
}
