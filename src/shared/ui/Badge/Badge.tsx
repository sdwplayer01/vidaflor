// Badge.tsx — Pill colorida para status/tags
// Uso: <Badge variant="success">Pago</Badge>

import styles from "./Badge.module.css";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({
  variant = "neutral",
  className = "",
  children
}: BadgeProps) {
  return (
    <span
      className={[
        styles.badge,
        styles[variant],
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
