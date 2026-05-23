// Badge.tsx — Etiqueta de status/categoria do VidaFlor
// Uso: <Badge label="Ativo" variant="success" />

import styles from "./Badge.module.css";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {label}
    </span>
  );
}
