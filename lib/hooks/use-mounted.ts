import { useEffect, useState } from "react";

/** SSR hydration guard — returns `true` only after the first client render. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
