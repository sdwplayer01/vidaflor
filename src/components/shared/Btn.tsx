// Btn.tsx — Botão padrão do VidaFlor
// Variantes: "primary" (padrão), "ghost", "danger"

import styles from "./Btn.module.css";
import type { ReactNode, CSSProperties } from "react";

type BtnVariant = "primary" | "ghost" | "danger";

interface BtnProps {
  onClick?:   () => void;
  variant?:   BtnVariant;
  className?: string;
  style?:     CSSProperties;
  disabled?:  boolean;
  children:   ReactNode;
}

export function Btn({
  onClick,
  variant = "primary",
  className = "",
  style,
  disabled,
  children,
}: BtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={[
        styles.btn,
        styles[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
