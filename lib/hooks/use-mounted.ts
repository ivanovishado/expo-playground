import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** SSR hydration guard — returns `true` only after the first client render. */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
