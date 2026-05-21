// src/shared/hooks/usePrevious.ts
import { useRef, useEffect } from "react";

/**
 * Hook para obter o valor de uma variável no ciclo de render anterior.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
