import styles from "./Sheet.module.css";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Mount-only: overflow lock, initial focus, tab trap
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableElements = panelRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      setTimeout(() => firstElement.focus(), 0);
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && focusableElements && focusableElements.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  // Escape key always uses latest onClose via ref
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
