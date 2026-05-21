// src/shared/hooks/useMounted.ts
import { useState, useEffect } from "react";

/**
 * Hook para detectar se o componente já está montado no lado do cliente.
 * Evita erros de hidratação no SSR/Vite em partes específicas da UI.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
