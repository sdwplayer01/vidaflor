// Chip.tsx — Pill clicável para seleção de categorias/filtros
// Uso: <Chip active={sel === k} onClick={() => setSel(k)}>Label</Chip>

import styles from "./Chip.module.css";
import type { ReactNode } from "react";

interface ChipProps {
  active:     boolean;
  onClick:    () => void;
  className?: string;
  children:   ReactNode;
}

export function Chip({ active, onClick, className = "", children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        styles.chip,
        active ? styles.active : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
