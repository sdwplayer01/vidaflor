// Sheet.tsx — Bottom sheet modal do VidaFlor
// Sempre com handle bar + blur backdrop. Fecha ao clicar fora.

import styles from "./Sheet.module.css";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SheetProps {
  title:     string;
  onClose:   () => void;
  children:  ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
