import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during the server render and the hydration render, true from the next
 * render on (and on every render of a component mounted after hydration).
 * Gate UI that reads browser-only state on it, or the first client render will
 * not match the server HTML. next-themes' `theme` is one case: it comes from
 * localStorage, which the server cannot see.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
