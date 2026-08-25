import { useEffect, useState } from "react";

export const useDebouncedValue = <TValue,>(
  value: TValue,
  delay = 250,
): TValue => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
};
