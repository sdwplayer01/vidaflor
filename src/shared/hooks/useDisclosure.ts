// src/shared/hooks/useDisclosure.ts
import { useState, useCallback } from "react";

/**
 * Hook utilitário para gerenciar estados do tipo boolean (abrir, fechar, alternar).
 * Muito útil para modais, sheets, gavetas e menus.
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
