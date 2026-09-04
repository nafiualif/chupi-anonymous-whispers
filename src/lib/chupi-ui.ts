import { useCallback, useEffect, useState } from "react";

/** "Just now" · "10m ago" · "Today, 3:30 PM" · "Mar 4, 2:15 PM" */
export function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - then.getTime());
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const time = then.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const sameDay = then.toDateString() === now.toDateString();
  if (sameDay) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (then.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;

  const sameYear = then.getFullYear() === now.getFullYear();
  const date = then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${date}, ${time}`;
}

/** Initials for the profile monogram. */
export function monogram(name: string | undefined, fallback = "?"): string {
  const clean = (name ?? "").trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]!.toUpperCase()).join("");
}

/**
 * A set of ids persisted in localStorage — used for purely local UI state
 * (read / saved markers) so no database schema changes are needed.
 */
export function useLocalIdSet(key: string) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, [key]);

  const persist = useCallback(
    (next: Set<string>) => {
      setIds(next);
      try {
        window.localStorage.setItem(key, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
    },
    [ids, persist],
  );

  const add = useCallback(
    (id: string) => {
      if (ids.has(id)) return;
      const next = new Set(ids);
      next.add(id);
      persist(next);
    },
    [ids, persist],
  );

  return { ids, toggle, add };
}
