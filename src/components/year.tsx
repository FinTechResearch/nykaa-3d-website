"use client";

import { useSyncExternalStore } from "react";

/* `new Date()` read in a server component trips Next's "unstable value"
 * prerender check; read in an effect it would need a setState (lint error).
 * `useSyncExternalStore` sidesteps both: the server snapshot is a constant,
 * and React re-reads the real value on the client after hydration. */
const subscribe = () => () => {};
const clientYear = () => String(new Date().getFullYear());
const serverYear = () => "2026";

export function Year() {
  const year = useSyncExternalStore(subscribe, clientYear, serverYear);
  return <>{year}</>;
}
