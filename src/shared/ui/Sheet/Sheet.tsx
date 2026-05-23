// Sheet.tsx — Bottom sheet modal do VidaFlor
// Com handle bar, blur backdrop, trap de foco e handler ESC
// Bloqueia scroll do body quando aberto

import styles from "./Sheet.module.css";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface SheetProps {
  title:     string;
  onClose:   () => void;
  children:  ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Bloquear scroll do body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Handler de ESC para fechar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Focus trap — focar no primeiro elemento focável quando abre
    const focusableElements = panelRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      // Pequeno delay para garantir que o elemento foi renderizado
      setTimeout(() => firstElement.focus(), 0);
    }

    // Handler para ciclar foco quando Tab é pressionado
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && focusableElements && focusableElements.length > 0) {
        if (e.shiftKey) {
          // Shift+Tab no primeiro elemento → volta para o último
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab no último elemento → vai para o primeiro
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleTabKey);

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <span className={styles.title} id="sheet-title">{title}</span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
